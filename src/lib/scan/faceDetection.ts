/**
 * faceDetection.ts — MediaPipe Face Detector wrapper for SKINgenius
 *
 * Loads the MediaPipe FaceDetector from CDN and runs detection
 * on an image element or canvas. Returns bounding box + key landmarks.
 *
 * Pure functions, no DOM deps in core logic — ready for React Native port.
 */

import {
  FaceDetector,
  FilesetResolver,
  Detection,
} from "@mediapipe/tasks-vision";

// ─── Types ─────────────────────────────────────────────────────

export interface FaceDetectionResult {
  detected: boolean;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  keypoints: {
    leftEye: { x: number; y: number } | null;
    rightEye: { x: number; y: number } | null;
    noseTip: { x: number; y: number } | null;
    mouthCenter: { x: number; y: number } | null;
  };
  confidence: number;
}

export interface FaceQualityScores {
  faceDetected: boolean;
  faceCentered: boolean;
  eyesVisible: boolean;
  confidence: number;
}

// ─── Module State ──────────────────────────────────────────────

let faceDetectorInstance: FaceDetector | null = null;
let detectorPromise: Promise<FaceDetector> | null = null;

const CDN_BASE =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";

// ─── Helpers ───────────────────────────────────────────────────

function detectionToResult(detection: Detection): FaceDetectionResult {
  const bbox = detection.boundingBox;
  const kp = detection.keypoints ?? [];

  const findKeypoint = (label: string) => {
    const pt = kp.find((k) => k.label === label);
    return pt ? { x: pt.x, y: pt.y } : null;
  };

  return {
    detected: true,
    boundingBox: bbox
      ? {
          x: bbox.originX,
          y: bbox.originY,
          width: bbox.width,
          height: bbox.height,
        }
      : null,
    keypoints: {
      leftEye: findKeypoint("leftEye"),
      rightEye: findKeypoint("rightEye"),
      noseTip: findKeypoint("noseTip"),
      mouthCenter: findKeypoint("mouthCenter"),
    },
    confidence: detection.categories?.[0]?.score ?? 0.5,
  };
}

/**
 * Initialise (or reuse) the shared FaceDetector instance.
 * Safe to call multiple times — returns the same promise.
 */
export async function getFaceDetector(): Promise<FaceDetector> {
  if (faceDetectorInstance) return faceDetectorInstance;
  if (detectorPromise) return detectorPromise;

  detectorPromise = (async () => {
    const vision = await FilesetResolver.forVisionTasks(CDN_BASE);
    const detector = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        delegate: "GPU",
      },
      runningMode: "IMAGE",
      minDetectionConfidence: 0.5,
      minSuppressionThreshold: 0.3,
    });
    faceDetectorInstance = detector;
    return detector;
  })();

  return detectorPromise;
}

/**
 * Detect faces in an HTMLImageElement, HTMLCanvasElement, or OffscreenCanvas.
 * Returns the first (highest-confidence) face.
 */
export async function detectFace(
  image: HTMLImageElement | HTMLCanvasElement | OffscreenCanvas
): Promise<FaceDetectionResult> {
  const detector = await getFaceDetector();
  const detections = detector.detect(image).detections;

  if (!detections || detections.length === 0) {
    return {
      detected: false,
      boundingBox: null,
      keypoints: {
        leftEye: null,
        rightEye: null,
        noseTip: null,
        mouthCenter: null,
      },
      confidence: 0,
    };
  }

  // Sort by confidence descending and pick best
  const sorted = [...detections].sort(
    (a, b) => (b.categories?.[0]?.score ?? 0) - (a.categories?.[0]?.score ?? 0)
  );

  return detectionToResult(sorted[0]);
}

/**
 * Assess face quality (centered, eyes visible) from detection result.
 * Pure function — works with any coordinate system.
 */
export function assessFaceQuality(
  result: FaceDetectionResult,
  imageWidth: number,
  imageHeight: number
): FaceQualityScores {
  if (!result.detected || !result.boundingBox) {
    return {
      faceDetected: false,
      faceCentered: false,
      eyesVisible: false,
      confidence: 0,
    };
  }

  const { x, y, width, height } = result.boundingBox;

  // Face centered if bbox center is within 30% of image center
  const cx = x + width / 2;
  const cy = y + height / 2;
  const imgCx = imageWidth / 2;
  const imgCy = imageHeight / 2;
  const centered =
    Math.abs(cx - imgCx) / imageWidth < 0.3 &&
    Math.abs(cy - imgCy) / imageHeight < 0.3;

  // Eyes visible if both eye keypoints exist
  const eyesVisible =
    result.keypoints.leftEye !== null && result.keypoints.rightEye !== null;

  return {
    faceDetected: true,
    faceCentered: centered,
    eyesVisible,
    confidence: result.confidence,
  };
}

/**
 * Create an ImageData patch from the detected face region.
 * Useful for downstream analysis (skin tone, conditions).
 */
export function extractFaceRegion(
  source: HTMLImageElement | HTMLCanvasElement,
  result: FaceDetectionResult,
  padding = 0.1 // 10% padding around face bbox
): ImageData | null {
  if (!result.detected || !result.boundingBox) return null;

  const { x, y, width, height } = result.boundingBox;
  const padX = width * padding;
  const padY = height * padding;

  const srcW =
    source instanceof HTMLImageElement ? source.naturalWidth : source.width;
  const srcH =
    source instanceof HTMLImageElement ? source.naturalHeight : source.height;

  const sx = Math.max(0, Math.round(x - padX));
  const sy = Math.max(0, Math.round(y - padY));
  const sw = Math.min(srcW - sx, Math.round(width + padX * 2));
  const sh = Math.min(srcH - sy, Math.round(height + padY * 2));

  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(source, sx, sy, sw, sh, 0, 0, sw, sh);
  return ctx.getImageData(0, 0, sw, sh);
}

/**
 * Convenience: load an image from a File or base64 string.
 */
export async function loadImage(input: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));

    if (typeof input === "string") {
      img.src = input.startsWith("data:") ? input : `data:image/jpeg;base64,${input}`;
    } else {
      img.src = URL.createObjectURL(input);
    }
  });
}
