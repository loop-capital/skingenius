'use client';

import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import {
  ScanState,
  ScanStep,
  INITIAL_SCAN_STATE,
  STEP_TRANSITIONS,
  ProcessingPhase,
  ConditionResult,
  ZoneAnalysis,
  FitzpatrickType,
} from '@/types/scan';

// =============================================================================
// Actions
// =============================================================================

type ScanAction =
  | { type: 'SET_STEP'; step: ScanStep }
  | { type: 'SET_CAPTURED_IMAGE'; imageData: string }
  | { type: 'SET_UPLOADED_IMAGE'; uri: string }
  | { type: 'SET_UPLOAD_ID'; uploadId: string }
  | { type: 'SET_SKIN_TONE'; skinTone: FitzpatrickType; autoDetected: boolean }
  | { type: 'SET_QUALITY'; score: number; lighting: ScanState['lightingQuality']; warnings: string[] }
  | { type: 'SET_FACE_DETECTION'; detected: boolean; centered: boolean; eyesVisible: boolean }
  | { type: 'SET_PROCESSING_PHASE'; phase: ProcessingPhase | null; progress: number }
  | { type: 'SET_PROCESSING_TIER'; tier: 'tier2' | 'tier3' }
  | { type: 'SET_RESULTS'; analysisId: string; conditions: ConditionResult[]; zones: ZoneAnalysis[] }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_PRIVACY_CONSENT'; consented: boolean }
  | { type: 'RESET' };

// =============================================================================
// Reducer
// =============================================================================

function scanReducer(state: ScanState, action: ScanAction): ScanState {
  switch (action.type) {
    case 'SET_STEP':
      if (!STEP_TRANSITIONS[state.step].includes(action.step)) {
        console.warn(`Invalid transition: ${state.step} → ${action.step}`);
        return state;
      }
      return { ...state, step: action.step, error: null };

    case 'SET_CAPTURED_IMAGE':
      return { ...state, capturedImageData: action.imageData };

    case 'SET_UPLOADED_IMAGE':
      return { ...state, uploadedImageUri: action.uri };

    case 'SET_UPLOAD_ID':
      return { ...state, uploadId: action.uploadId };

    case 'SET_SKIN_TONE':
      return { ...state, skinTone: action.skinTone, skinToneAutoDetected: action.autoDetected };

    case 'SET_QUALITY':
      return { ...state, qualityScore: action.score, lightingQuality: action.lighting, qualityWarnings: action.warnings };

    case 'SET_FACE_DETECTION':
      return { ...state, faceDetected: action.detected, faceCentered: action.centered, eyesVisible: action.eyesVisible };

    case 'SET_PROCESSING_PHASE':
      return { ...state, processingPhase: action.phase, processingProgress: action.progress };

    case 'SET_PROCESSING_TIER':
      return { ...state, processingTier: action.tier };

    case 'SET_RESULTS':
      return { ...state, analysisId: action.analysisId, conditions: action.conditions, skinZones: action.zones };

    case 'SET_PRIVACY_CONSENT':
      return { ...state, privacyConsented: action.consented };

    case 'SET_ERROR':
      return { ...state, error: action.error };

    case 'RESET':
      return INITIAL_SCAN_STATE;

    default:
      return state;
  }
}

// =============================================================================
// Context
// =============================================================================

interface ScanContextValue {
  state: ScanState;
  dispatch: React.Dispatch<ScanAction>;
  goToStep: (step: ScanStep) => void;
  goBack: () => void;
  reset: () => void;
}

const ScanContext = createContext<ScanContextValue | null>(null);

const BACK_NAVIGATION: Partial<Record<ScanStep, ScanStep>> = {
  permission: 'welcome',
  instructions: 'permission',
  scan_live: 'instructions',
  scan_review: 'scan_live',
  calibration: 'scan_review',
  privacy: 'calibration',
  results: 'welcome',
  root_causes: 'results',
};

export function ScanProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(scanReducer, INITIAL_SCAN_STATE);

  const goToStep = useCallback((step: ScanStep) => dispatch({ type: 'SET_STEP', step }), []);
  const goBack = useCallback(() => {
    const prev = BACK_NAVIGATION[state.step];
    if (prev) dispatch({ type: 'SET_STEP', step: prev });
  }, [state.step]);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  const value = useMemo(() => ({ state, dispatch, goToStep, goBack, reset }), [state, goToStep, goBack, reset]);

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
}

export function useScan() {
  const context = useContext(ScanContext);
  if (!context) throw new Error('useScan must be used within a ScanProvider');
  return context;
}

// =============================================================================
// Processing hook
// =============================================================================

export function useProcessing() {
  const { state, dispatch } = useScan();

  const startProcessing = useCallback(() => {
    dispatch({ type: 'SET_STEP', step: 'processing' });
    dispatch({ type: 'SET_PROCESSING_PHASE', phase: 'quality_check', progress: 0 });
  }, [dispatch]);

  const updatePhase = useCallback((phase: ProcessingPhase, progress: number) => {
    dispatch({ type: 'SET_PROCESSING_PHASE', phase, progress });
  }, [dispatch]);

  const completeProcessing = useCallback((analysisId: string, conditions: ConditionResult[], zones: ZoneAnalysis[]) => {
    dispatch({ type: 'SET_RESULTS', analysisId, conditions, zones });
    dispatch({ type: 'SET_STEP', step: 'results' });
  }, [dispatch]);

  const failProcessing = useCallback((error: string) => {
    dispatch({ type: 'SET_ERROR', error });
  }, [dispatch]);

  return {
    phase: state.processingPhase,
    progress: state.processingProgress,
    tier: state.processingTier,
    startProcessing,
    updatePhase,
    completeProcessing,
    failProcessing,
  };
}