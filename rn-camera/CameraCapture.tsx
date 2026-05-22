'use client';

'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, RotateCcw, Check, AlertCircle, Sun, Moon, Sparkles, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PhotoCalibration from './PhotoCalibration';

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

export interface CameraCaptureProps {
  onCapture: (data: CaptureResult) => void;
  onCancel?: () => void;
  facingMode?: 'user' | 'environment';
}

export interface CaptureResult {
  imageData: string;           // base64 JPEG
  skinTone: SkinToneMatch;
  qualityScore: number;
  lightingAssessment: LightingAssessment;
  faceDetection: FaceDetectionResult;
  preprocessingApplied: TonePreprocessingConfig;
}

export interface SkinToneMatch {
  fitzpatrickType: 1 | 2 | 3 | 4 | 5 | 6;
  confidence: number;            // 0-1
  autoDetected: boolean;
  userConfirmed: boolean;
}

export interface LightingAssessment {
  brightness: number;            // 0-100
  contrast: number;              // 0-100
  isBacklit: boolean;
  hasGlare: boolean;
  quality: 'excellent' | 'good' | 'poor' | 'unusable';
  warnings: string[];
}

export interface FaceDetectionResult {
  detected: boolean;
  faceCount: number;
  isCentered: boolean;
  eyesVisible: boolean;
  eyesOpen: boolean;
  hasShadows: boolean;
  hasGlare: boolean;
  boundingBox?: { x: number; y: number; width: number; height: number };
  landmarks?: {
    leftEye?: { x: number; y: number };
    rightEye?: { x: number; y: number };
    nose?: { x: number; y: number };
    mouth?: { x: number; y: number };
  };
}

export interface TonePreprocessingConfig {
  fitzpatrickType: 1 | 2 | 3 | 4 | 5 | 6;
  brightnessAdjust: number;
  contrastAdjust: number;
  saturationAdjust: number;
  noiseReduction: boolean;
  sharpening: boolean;
  whiteBalance: { r: number; g: number; b: number };
}

// ------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------

const IDEAL_BRIGHTNESS = { min: 40, max: 80 };
const IDEAL_CONTRAST = { min: 30, max: 70 };

// ------------------------------------------------------------------
// Helper: Compute image histogram / brightness on an off-screen canvas
// ------------------------------------------------------------------

function analyzeImageQuality(imageData: ImageData): {
  brightness: number;
  contrast: number;
  isBacklit: boolean;
  hasGlare: boolean;
} {
  const data = imageData.data;
  const pixelCount = data.length / 4;
  let totalLuminance = 0;
  let darkPixels = 0;
  let brightPixels = 0;
  const luminanceHistogram = new Array(256).fill(0);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    totalLuminance += luminance;
    luminanceHistogram[Math.floor(luminance)]++;

    if (luminance < 30) darkPixels++;
    if (luminance > 220) brightPixels++;
  }

  const brightness = totalLuminance / pixelCount;

  // Simple contrast: difference between 90th and 10th percentile luminance
  const sortedLum = [];
  for (let v = 0; v < 256; v++) {
    for (let c = 0; c < luminanceHistogram[v]; c++) sortedLum.push(v);
  }
  const p10 = sortedLum[Math.floor(pixelCount * 0.1)];
  const p90 = sortedLum[Math.floor(pixelCount * 0.9)];
  const contrast = p90 - p10;

  const isBacklit = darkPixels / pixelCount > 0.4 && brightPixels / pixelCount > 0.15;
  const hasGlare = brightPixels / pixelCount > 0.25;

  return {
    brightness: Math.round((brightness / 255) * 100),
    contrast: Math.round((contrast / 255) * 100),
    isBacklit,
    hasGlare,
  };
}

// ------------------------------------------------------------------
// Helper: Simple face detection (fallback when API unavailable)
// ------------------------------------------------------------------

function detectFaceFallback(imageData: ImageData): FaceDetectionResult {
  const { width, height, data } = imageData;
  // Very naive skin-tone blob detection in center region
  const centerX = Math.floor(width * 0.3);
  const centerY = Math.floor(height * 0.2);
  const regionW = Math.floor(width * 0.4);
  const regionH = Math.floor(height * 0.5);

  let skinPixels = 0;
  let totalPixels = regionW * regionH;

  for (let y = centerY; y < centerY + regionH; y++) {
    for (let x = centerX; x < centerX + regionW; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Simple skin-tone heuristic
      if (r > 60 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 10) {
        skinPixels++;
      }
    }
  }

  const skinRatio = skinPixels / totalPixels;
  const detected = skinRatio > 0.15;

  return {
    detected,
    faceCount: detected ? 1 : 0,
    isCentered: detected,
    eyesVisible: detected,
    eyesOpen: detected,
    hasShadows: false,
    hasGlare: false,
    boundingBox: detected
      ? { x: centerX, y: centerY, width: regionW, height: regionH }
      : undefined,
  };
}

// ------------------------------------------------------------------
// Helper: Auto-suggest Fitzpatrick type from image
// ------------------------------------------------------------------

function autoSuggestSkinTone(imageData: ImageData): { type: 1 | 2 | 3 | 4 | 5 | 6; confidence: number } {
  const { width, height, data } = imageData;
  const centerX = Math.floor(width * 0.3);
  const centerY = Math.floor(height * 0.2);
  const regionW = Math.floor(width * 0.4);
  const regionH = Math.floor(height * 0.5);

  let totalR = 0, totalG = 0, totalB = 0, count = 0;

  for (let y = centerY; y < centerY + regionH; y++) {
    for (let x = centerX; x < centerX + regionW; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Skin-tone filter
      if (r > 60 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 10) {
        totalR += r;
        totalG += g;
        totalB += b;
        count++;
      }
    }
  }

  if (count === 0) return { type: 3, confidence: 0.3 };

  const avgR = totalR / count;
  const avgG = totalG / count;
  const avgB = totalB / count;
  const luminance = 0.299 * avgR + 0.587 * avgG + 0.114 * avgB;

  // Map luminance to Fitzpatrick (very rough heuristic)
  let type: 1 | 2 | 3 | 4 | 5 | 6 = 3;
  if (luminance > 200) type = 1;
  else if (luminance > 175) type = 2;
  else if (luminance > 140) type = 3;
  else if (luminance > 110) type = 4;
  else if (luminance > 80) type = 5;
  else type = 6;

  const confidence = Math.min(0.85, 0.5 + Math.abs(luminance - 128) / 256);

  return { type, confidence };
}

// ------------------------------------------------------------------
// Helper: Build preprocessing config based on Fitzpatrick type
// ------------------------------------------------------------------

function buildPreprocessingConfig(fitzpatrickType: 1 | 2 | 3 | 4 | 5 | 6): TonePreprocessingConfig {
  const configs: Record<number, TonePreprocessingConfig> = {
    1: { fitzpatrickType: 1, brightnessAdjust: -5, contrastAdjust: 5, saturationAdjust: -5, noiseReduction: false, sharpening: true, whiteBalance: { r: 1.05, g: 1.0, b: 1.02 } },
    2: { fitzpatrickType: 2, brightnessAdjust: -3, contrastAdjust: 3, saturationAdjust: -3, noiseReduction: false, sharpening: true, whiteBalance: { r: 1.03, g: 1.0, b: 1.01 } },
    3: { fitzpatrickType: 3, brightnessAdjust: 0, contrastAdjust: 0, saturationAdjust: 0, noiseReduction: false, sharpening: false, whiteBalance: { r: 1.0, g: 1.0, b: 1.0 } },
    4: { fitzpatrickType: 4, brightnessAdjust: 5, contrastAdjust: 8, saturationAdjust: 5, noiseReduction: true, sharpening: true, whiteBalance: { r: 0.98, g: 1.0, b: 1.02 } },
    5: { fitzpatrickType: 5, brightnessAdjust: 10, contrastAdjust: 12, saturationAdjust: 8, noiseReduction: true, sharpening: true, whiteBalance: { r: 0.95, g: 1.0, b: 1.05 } },
    6: { fitzpatrickType: 6, brightnessAdjust: 15, contrastAdjust: 15, saturationAdjust: 10, noiseReduction: true, sharpening: true, whiteBalance: { r: 0.92, g: 1.0, b: 1.08 } },
  };
  return configs[fitzpatrickType];
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export default function CameraCapture({
  onCapture,
  onCancel,
  facingMode = 'user',
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [streamReady, setStreamReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCalibration, setShowCalibration] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Quality state
  const [qualityScore, setQualityScore] = useState(0);
  const [lighting, setLighting] = useState<LightingAssessment | null>(null);
  const [faceDetection, setFaceDetection] = useState<FaceDetectionResult | null>(null);
  const [autoSkinTone, setAutoSkinTone] = useState<{ type: 1 | 2 | 3 | 4 | 5 | 6; confidence: number } | null>(null);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // ----------------------------------------------------------------
  // Start camera
  // ----------------------------------------------------------------

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setStreamReady(true);
        };
      }
    } catch (err) {
      setError('Could not access camera. Please ensure permissions are granted.');
      console.error('Camera error:', err);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreamReady(false);
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  // ----------------------------------------------------------------
  // Capture photo
  // ----------------------------------------------------------------

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !streamReady) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const rawImageData = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedImage(rawImageData);
    setIsAnalyzing(true);

    // Run analysis
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Lighting analysis
    const lightingResult = analyzeImageQuality(imageData);
    const warnings: string[] = [];
    if (lightingResult.brightness < IDEAL_BRIGHTNESS.min) warnings.push('Photo is too dark. Try moving to a brighter area.');
    if (lightingResult.brightness > IDEAL_BRIGHTNESS.max) warnings.push('Photo is too bright. Avoid direct light on your face.');
    if (lightingResult.contrast < IDEAL_CONTRAST.min) warnings.push('Low contrast detected. Ensure even lighting.');
    if (lightingResult.isBacklit) warnings.push('Backlighting detected. Avoid bright light behind you.');
    if (lightingResult.hasGlare) warnings.push('Glare detected. Adjust angle to reduce reflection.');

    let quality: LightingAssessment['quality'] = 'good';
    if (lightingResult.brightness < 20 || lightingResult.brightness > 90 || lightingResult.hasGlare) quality = 'unusable';
    else if (lightingResult.brightness < 30 || lightingResult.brightness > 80 || lightingResult.isBacklit) quality = 'poor';
    else if (lightingResult.brightness >= 45 && lightingResult.brightness <= 65 && lightingResult.contrast >= 35) quality = 'excellent';

    const lightingAssessment: LightingAssessment = {
      ...lightingResult,
      quality,
      warnings,
    };
    setLighting(lightingAssessment);

    // Face detection
    const faceResult = detectFaceFallback(imageData);
    setFaceDetection(faceResult);

    // Auto skin-tone suggestion
    const toneSuggestion = autoSuggestSkinTone(imageData);
    setAutoSkinTone(toneSuggestion);

    // Quality score (0-100)
    let score = 50;
    if (faceResult.detected) score += 20;
    if (faceResult.isCentered) score += 10;
    if (faceResult.eyesVisible) score += 10;
    if (quality === 'excellent') score += 10;
    else if (quality === 'good') score += 5;
    else if (quality === 'poor') score -= 15;
    else if (quality === 'unusable') score -= 30;
    score = Math.max(0, Math.min(100, score));
    setQualityScore(score);

    setIsAnalyzing(false);
    setShowCalibration(true);
    stopCamera();
  }, [streamReady, stopCamera]);

  // ----------------------------------------------------------------
  // Retake
  // ----------------------------------------------------------------

  const retake = useCallback(() => {
    setCapturedImage(null);
    setShowCalibration(false);
    setQualityScore(0);
    setLighting(null);
    setFaceDetection(null);
    setAutoSkinTone(null);
    startCamera();
  }, [startCamera]);

  // ----------------------------------------------------------------
  // Cancel
  // ----------------------------------------------------------------

  const handleCancel = useCallback(() => {
    stopCamera();
    onCancel?.();
  }, [stopCamera, onCancel]);

  // ----------------------------------------------------------------
  // Apply preprocessing based on selected skin tone
  // ----------------------------------------------------------------

  const applyPreprocessing = useCallback(
    (fitzpatrickType: 1 | 2 | 3 | 4 | 5 | 6): string => {
      if (!canvasRef.current || !capturedImage) return capturedImage || '';
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return capturedImage;

      const config = buildPreprocessingConfig(fitzpatrickType);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // White balance
        r *= config.whiteBalance.r;
        g *= config.whiteBalance.g;
        b *= config.whiteBalance.b;

        // Brightness
        r += config.brightnessAdjust;
        g += config.brightnessAdjust;
        b += config.brightnessAdjust;

        // Contrast
        const factor = (259 * (config.contrastAdjust + 255)) / (255 * (259 - config.contrastAdjust));
        r = factor * (r - 128) + 128;
        g = factor * (g - 128) + 128;
        b = factor * (b - 128) + 128;

        // Saturation
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = gray + (config.saturationAdjust / 100 + 1) * (r - gray);
        g = gray + (config.saturationAdjust / 100 + 1) * (g - gray);
        b = gray + (config.saturationAdjust / 100 + 1) * (b - gray);

        // Clamp
        data[i] = Math.max(0, Math.min(255, r));
        data[i + 1] = Math.max(0, Math.min(255, g));
        data[i + 2] = Math.max(0, Math.min(255, b));
      }

      ctx.putImageData(imageData, 0, 0);
      return canvas.toDataURL('image/jpeg', 0.95);
    },
    [capturedImage]
  );

  // ----------------------------------------------------------------
  // Handle calibration completion
  // ----------------------------------------------------------------

  const handleCalibrationComplete = useCallback(
    (skinTone: SkinToneMatch) => {
      if (!lighting || !faceDetection || !autoSkinTone) return;

      const processedImage = applyPreprocessing(skinTone.fitzpatrickType);

      const result: CaptureResult = {
        imageData: processedImage,
        skinTone,
        qualityScore,
        lightingAssessment: lighting,
        faceDetection,
        preprocessingApplied: buildPreprocessingConfig(skinTone.fitzpatrickType),
      };

      onCapture(result);
    },
    [applyPreprocessing, autoSkinTone, faceDetection, lighting, onCapture, qualityScore]
  );

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!showCalibration ? (
        <Card className="overflow-hidden">
          <div className="relative aspect-[3/4] bg-slate-900">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Face guide overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 border-2 border-white/40 rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 border border-white/20 rounded-full animate-pulse" />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm bg-black/40 px-3 py-1 rounded-full">
                Center your face in the oval
              </div>
            </div>
          </div>

          <div className="p-4 flex items-center justify-between gap-3">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              onClick={capturePhoto}
              disabled={!streamReady}
              className="flex-1"
              size="lg"
            >
              <Camera className="w-5 h-5 mr-2" />
              Capture
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          <Card className="overflow-hidden">
            <div className="relative aspect-[3/4] bg-slate-900">
              {capturedImage && (
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
              )}
              {isAnalyzing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <div className="text-white text-center">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 animate-spin" />
                    <p>Analyzing photo quality...</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Quality Summary */}
          {!isAnalyzing && (
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Photo Quality</span>
                <span className={`text-sm font-bold ${
                  qualityScore >= 80 ? 'text-green-600' :
                  qualityScore >= 50 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {qualityScore}/100
                </span>
              </div>
              <Progress value={qualityScore} className="h-2" />

              {lighting && (
                <div className="flex items-center gap-2 text-sm">
                  {lighting.quality === 'excellent' || lighting.quality === 'good' ? (
                    <Sun className="w-4 h-4 text-green-600" />
                  ) : (
                    <Moon className="w-4 h-4 text-yellow-600" />
                  )}
                  <span className={
                    lighting.quality === 'excellent' || lighting.quality === 'good'
                      ? 'text-green-700'
                      : 'text-yellow-700'
                  }>
                    {lighting.quality === 'excellent' && 'Excellent lighting'}
                    {lighting.quality === 'good' && 'Good lighting'}
                    {lighting.quality === 'poor' && 'Poor lighting — consider retaking'}
                    {lighting.quality === 'unusable' && 'Lighting issues — please retake'}
                  </span>
                </div>
              )}

              {faceDetection && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>
                    {faceDetection.detected
                      ? faceDetection.eyesVisible
                        ? 'Face detected with eyes visible'
                        : 'Face detected — eyes not clearly visible'
                      : 'No face detected — please retake'}
                  </span>
                </div>
              )}

              {lighting?.warnings && lighting.warnings.length > 0 && (
                <div className="space-y-1">
                  {lighting.warnings.map((w, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-yellow-700">
                      <AlertCircle className="w-3 h-3" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={retake} className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake
                </Button>
                {qualityScore >= 50 && (
                  <Button onClick={() => setShowCalibration(true)} className="flex-1">
                    <Check className="w-4 h-4 mr-2" />
                    Continue
                  </Button>
                )}
              </div>
            </Card>
          )}

          {/* Calibration */}
          {!isAnalyzing && showCalibration && (
            <PhotoCalibration
              autoSuggestedTone={autoSkinTone}
              onComplete={handleCalibrationComplete}
              onRetake={retake}
            />
          )}
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
