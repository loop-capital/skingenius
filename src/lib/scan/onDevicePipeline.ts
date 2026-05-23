/**
 * onDevicePipeline.ts — Main client-side scan pipeline for SKINgenius
 *
 * Runs entirely in the browser:
 *   1. Load image from File or base64
 *   2. Detect face with MediaPipe
 *   3. Assess image quality (blur, lighting)
 *   4. Estimate Fitzpatrick skin tone
 *   5. Detect skin conditions
 *   6. Return structured V1ScanResponseData
 *
 * Pure core logic (steps 3–6 have no DOM deps) — ready for React Native port.
 */

import {
  V1ScanResponseData,
  V1QualityAssessment,
  V1DetectedCondition,
  V1SkinZone,
} from "@/types/api";
import {
  detectFace,
  assessFaceQuality,
  extractFaceRegion,
  loadImage,
  FaceDetectionResult,
  FaceQualityScores,
} from "./faceDetection";
import {
  estimateSkinTone,
  assessLighting,
  estimateBlur,
  adjustForLighting,
  SkinToneEstimate,
  LightingAssessment,
} from "./skinToneEstimator";
import {
  detectConditions,
  ConditionDetectionResult,
} from "./conditionDetector";

// ─── Types ─────────────────────────────────────────────────────

export type PipelinePhase =
  | "face_detection"
  | "quality_assessment"
  | "skin_tone_estimation"
  | "condition_detection"
  | "complete";

export interface PipelineProgress {
  phase: PipelinePhase;
  progress: number; // 0–100
  message: string;
}

export interface PipelineConfig {
  /** User's selected skin tone (1–6) or null to auto-detect */
  userSkinTone: number | null;
  captureMethod: "camera" | "gallery";
  /** Whether to use Gemma 4 (future) */
  useGemma: boolean;
}

export interface PipelineResult {
  success: boolean;
  data: V1ScanResponseData | null;
  error: string | null;
  phases: PipelineProgress[];
}

// ─── Progress Callback ─────────────────────────────────────────

export type OnProgress = (progress: PipelineProgress) => void;

const defaultProgress: OnProgress = () => {};

// ─── Step Functions ────────────────────────────────────────────

async function stepLoadImage(input: File | string): Promise<{
  image: HTMLImageElement;
  imageData: ImageData;
  canvas: HTMLCanvasElement;
}> {
  const img = await loadImage(input);

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  return { image: img, imageData, canvas };
}

async function stepDetectFace(
  image: HTMLImageElement
): Promise<FaceDetectionResult> {
  return detectFace(image);
}

function stepAssessQuality(
  imageData: ImageData,
  faceResult: FaceDetectionResult,
  imageWidth: number,
  imageHeight: number
): {
  faceQuality: FaceQualityScores;
  lighting: LightingAssessment;
  blurScore: number;
  qualityScore: number;
} {
  const faceQuality = assessFaceQuality(faceResult, imageWidth, imageHeight);
  const lighting = assessLighting(imageData);
  const blurScore = estimateBlur(imageData);

  // Composite quality score
  let qualityScore = 100;
  if (!faceQuality.faceDetected) qualityScore -= 40;
  if (!faceQuality.faceCentered) qualityScore -= 15;
  if (!faceQuality.eyesVisible) qualityScore -= 10;
  if (lighting.quality === "poor") qualityScore -= 15;
  if (lighting.quality === "unusable") qualityScore -= 30;
  if (blurScore < 50) qualityScore -= 20;
  else if (blurScore < 150) qualityScore -= 10;

  qualityScore = Math.max(0, Math.min(100, qualityScore));

  return { faceQuality, lighting, blurScore, qualityScore };
}

function stepEstimateSkinTone(
  imageData: ImageData,
  faceResult: FaceDetectionResult,
  imageWidth: number,
  imageHeight: number,
  lighting: LightingAssessment
): SkinToneEstimate | null {
  const rawEstimate = estimateSkinTone(imageData, faceResult, imageWidth, imageHeight);
  if (!rawEstimate) return null;
  return adjustForLighting(rawEstimate, lighting);
}

async function stepDetectConditions(
  imageData: ImageData,
  faceResult: FaceDetectionResult,
  skinTone: number,
  useGemma: boolean
): Promise<ConditionDetectionResult> {
  return detectConditions(imageData, faceResult, {
    skinTone,
    useGemma,
  });
}

// ─── Main Pipeline ───────────────────────────────────────────────

/**
 * Run the complete on-device scan pipeline.
 *
 * @param input Image as File (from camera/gallery) or base64 string
 * @param config Pipeline configuration
 * @param onProgress Optional callback for real-time progress updates
 */
export async function runOnDeviceScan(
  input: File | string,
  config: PipelineConfig,
  onProgress: OnProgress = defaultProgress
): Promise<PipelineResult> {
  const phases: PipelineProgress[] = [];
  const report = (phase: PipelinePhase, progress: number, message: string) => {
    const p: PipelineProgress = { phase, progress, message };
    phases.push(p);
    onProgress(p);
  };

  try {
    // ── Phase 0: Load Image ──────────────────────────────────
    report("face_detection", 10, "Loading image...");
    const { image, imageData, canvas } = await stepLoadImage(input);
    const imgW = canvas.width;
    const imgH = canvas.height;

    // ── Phase 1: Face Detection ────────────────────────────
    report("face_detection", 25, "Detecting face...");
    const faceResult = await stepDetectFace(image);

    if (!faceResult.detected) {
      return {
        success: false,
        data: null,
        error: "No face detected. Please ensure your face is clearly visible and centered.",
        phases,
      };
    }

    report("face_detection", 50, "Face detected ✓");

    // ── Phase 2: Quality Assessment ──────────────────────────
    report("quality_assessment", 55, "Analyzing image quality...");
    const { faceQuality, lighting, blurScore, qualityScore } = stepAssessQuality(
      imageData,
      faceResult,
      imgW,
      imgH
    );

    report("quality_assessment", 75, `Quality score: ${qualityScore}/100`);

    // ── Phase 3: Skin Tone Estimation ──────────────────────────
    report("skin_tone_estimation", 80, "Estimating skin tone...");
    const skinToneEstimate = stepEstimateSkinTone(
      imageData,
      faceResult,
      imgW,
      imgH,
      lighting
    );

    const finalSkinTone =
      config.userSkinTone ?? skinToneEstimate?.fitzpatrickType ?? 3;

    report(
      "skin_tone_estimation",
      90,
      `Fitzpatrick type ${finalSkinTone}${
        skinToneEstimate ? ` (auto-detected, confidence: ${Math.round(skinToneEstimate.confidence * 100)}%)` : ""
      }`
    );

    // ── Phase 4: Condition Detection ─────────────────────────
    report("condition_detection", 92, "Identifying skin conditions...");
    const conditionsResult = await stepDetectConditions(
      imageData,
      faceResult,
      finalSkinTone,
      config.useGemma
    );

    report("condition_detection", 100, "Analysis complete ✓");
    report("complete", 100, "Done");

    // ── Build Response ───────────────────────────────────────
    const qualityAssessment: V1QualityAssessment = {
      is_valid_format: true,
      width: imgW,
      height: imgH,
      aspect_ratio: imgH > 0 ? Math.round((imgW / imgH) * 100) / 100 : null,
      file_size_bytes: imageData.data.length,
      face_detected: faceQuality.faceDetected,
      blur_score: Math.round(blurScore * 10) / 10,
      lighting_score: Math.round(lighting.brightness),
    };

    const warnings: string[] = [];
    if (!faceQuality.faceCentered) warnings.push("Face not centered");
    if (!faceQuality.eyesVisible) warnings.push("Eyes not clearly visible");
    if (lighting.quality === "poor") warnings.push("Suboptimal lighting conditions");
    if (lighting.quality === "unusable") warnings.push("Lighting too poor for accurate analysis");
    if (blurScore < 50) warnings.push("Image appears blurry");

    const metadata = {
      capture_method: config.captureMethod,
      skin_tone: finalSkinTone,
      processed: true,
      model_version: config.useGemma ? "v1-gemma4" : "v1-mock-ondevice",
      warnings: warnings.length > 0 ? warnings : undefined,
      auto_detected_skin_tone: skinToneEstimate
        ? {
            type: skinToneEstimate.fitzpatrickType,
            confidence: skinToneEstimate.confidence,
          }
        : undefined,
    };

    const responseData: V1ScanResponseData = {
      scan_id: null, // Will be assigned server-side on persistence
      timestamp: new Date().toISOString(),
      quality_assessment: qualityAssessment,
      conditions: conditionsResult.conditions,
      skin_zones: conditionsResult.skinZones,
      metadata: metadata as V1ScanResponseData["metadata"],
    };

    return {
      success: true,
      data: responseData,
      error: null,
      phases,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Pipeline failed";
    return {
      success: false,
      data: null,
      error: errorMsg,
      phases,
    };
  }
}

/**
 * Quick check: can we run on-device analysis in this browser?
 */
export function isOnDeviceSupported(): boolean {
  if (typeof window === "undefined") return false;
  const hasWebGL = !!(
    window.WebGLRenderingContext ||
    (window as unknown as Record<string, unknown>).WebGL2RenderingContext
  );
  const hasMediaDevices = !!navigator.mediaDevices?.getUserMedia;
  return hasWebGL && hasMediaDevices;
}

/**
 * Request camera permission and return stream (for scan capture).
 */
export async function requestCameraAccess(
  facingMode: "user" | "environment" = "user"
): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Camera access not supported in this browser");
  }
  return navigator.mediaDevices.getUserMedia({
    video: {
      facingMode,
      width: { ideal: 1280 },
      height: { ideal: 1280 },
    },
    audio: false,
  });
}
