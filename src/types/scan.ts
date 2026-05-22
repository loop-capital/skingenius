// ───────────────────────────────────────────────────────────────
// SKINgenius Scan Types — Frontend State Machine
// ───────────────────────────────────────────────────────────────

export type ScanStep =
  | "welcome"
  | "permission"
  | "instructions"
  | "scan_live"
  | "scan_review"
  | "calibration"
  | "privacy"
  | "processing"
  | "results"
  | "root_causes";

export type FitzpatrickType = 1 | 2 | 3 | 4 | 5 | 6;

export type ProcessingPhase = "quality_check" | "classification" | "root_causes";

export interface ConditionResult {
  name: string;
  confidence: number;
  severity: "mild" | "moderate" | "severe";
  features: string[];
  zone: string;
}

export interface ZoneAnalysis {
  zone: string;
  primaryConcern: string;
  description: string;
  severity: "mild" | "moderate" | "severe";
}

export interface ScanState {
  step: ScanStep;
  capturedImageData: string | null;
  uploadedImageUri: string | null;
  uploadId: string | null;
  skinTone: FitzpatrickType | null;
  skinToneAutoDetected: boolean;
  qualityScore: number | null;
  lightingQuality: "excellent" | "good" | "poor" | "unusable" | null;
  qualityWarnings: string[];
  faceDetected: boolean;
  faceCentered: boolean;
  eyesVisible: boolean;
  processingPhase: ProcessingPhase | null;
  processingProgress: number;
  processingTier: "tier2" | "tier3" | null;
  analysisId: string | null;
  conditions: ConditionResult[];
  skinZones: ZoneAnalysis[];
  error: string | null;
  privacyConsented: boolean;
}

export const INITIAL_SCAN_STATE: ScanState = {
  step: "welcome",
  capturedImageData: null,
  uploadedImageUri: null,
  uploadId: null,
  skinTone: null,
  skinToneAutoDetected: false,
  qualityScore: null,
  lightingQuality: null,
  qualityWarnings: [],
  faceDetected: false,
  faceCentered: false,
  eyesVisible: false,
  processingPhase: null,
  processingProgress: 0,
  processingTier: null,
  analysisId: null,
  conditions: [],
  skinZones: [],
  error: null,
  privacyConsented: false,
};

export const STEP_TRANSITIONS: Record<ScanStep, ScanStep[]> = {
  welcome: ["permission"],
  permission: ["welcome", "instructions"],
  instructions: ["permission", "scan_live"],
  scan_live: ["instructions", "scan_review"],
  scan_review: ["scan_live", "calibration"],
  calibration: ["scan_review", "privacy"],
  privacy: ["calibration", "processing"],
  processing: ["privacy", "results"],
  results: ["welcome", "root_causes"],
  root_causes: ["results"],
};

export const PROCESSING_PHASE_LABELS: Record<ProcessingPhase, string> = {
  quality_check: "Quality Check",
  classification: "Classification",
  root_causes: "Root Causes",
};

export const PROCESSING_PHASE_RANGES: Record<
  ProcessingPhase,
  { start: number; end: number }
> = {
  quality_check: { start: 0, end: 33 },
  classification: { start: 33, end: 66 },
  root_causes: { start: 66, end: 100 },
};
