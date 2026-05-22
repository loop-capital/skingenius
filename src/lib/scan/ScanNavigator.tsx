'use client';

import React from 'react';
import { ScanProvider, useScan } from './ScanContext';
import {
  ScanStep,
  PROCESSING_PHASE_LABELS,
  PROCESSING_PHASE_RANGES,
} from '@/types/scan';

// =============================================================================
// Scan Navigator — Orchestrates the entire scan workflow
// =============================================================================

/**
 * ScanNavigator renders the correct screen for each step in the scan flow.
 * 
 * Design team provides styled components. This component owns the workflow logic:
 * - Step transitions (valid via STEP_TRANSITIONS)
 * - Processing pipeline orchestration
 * - Error handling and retry logic
 * 
 * The design team wraps this with their UI components:
 * - ScanInstructionsSheet → step 'instructions'
 * - ProcessingScreen → step 'processing'
 * - ResultsFilterScreen → step 'results'
 * etc.
 */
export default function ScanNavigator({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ScanProvider>
      <ScanNavigatorInner>{children}</ScanNavigatorInner>
    </ScanProvider>
  );
}

function ScanNavigatorInner({ children }: { children: React.ReactNode }) {
  const { state } = useScan();

  // The ScanNavigator provides the state machine context.
  // Children can use useScan() to read state and dispatch actions.
  // The design team's screen components render based on state.step.
  
  return (
    <div className="scan-navigator" data-step={state.step}>
      {/* Error banner */}
      {state.error && (
        <div className="scan-error-banner" role="alert">
          <p>{state.error}</p>
          <button onClick={() => useScan().dispatch({ type: 'SET_ERROR', error: null })}>
            Dismiss
          </button>
        </div>
      )}
      {children}
    </div>
  );
}

// =============================================================================
// Step indicator component — shows progress through the scan flow
// =============================================================================

const VISIBLE_STEPS: ScanStep[] = [
  'welcome',
  'permission', 
  'instructions',
  'scan_live',
  'scan_review',
  'calibration',
  'privacy',
  'processing',
  'results',
  'root_causes',
];

export function ScanStepIndicator() {
  const { state } = useScan();
  const currentIndex = VISIBLE_STEPS.indexOf(state.step);
  
  return (
    <div className="scan-step-indicator" aria-label="Scan progress">
      {VISIBLE_STEPS.map((step, index) => (
        <div
          key={step}
          className={`scan-step-dot ${
            index < currentIndex ? 'completed' :
            index === currentIndex ? 'active' : 'upcoming'
          }`}
          aria-current={index === currentIndex ? 'step' : undefined}
        />
      ))}
    </div>
  );
}

// =============================================================================
// Processing progress component — shows 3-phase progress
// =============================================================================

export function ProcessingProgress() {
  const { state } = useScan();
  const { processingPhase, processingProgress } = state;
  
  const phases: Array<{ key: typeof processingPhase; label: string }> = [
    { key: 'quality_check', label: PROCESSING_PHASE_LABELS.quality_check },
    { key: 'classification', label: PROCESSING_PHASE_LABELS.classification },
    { key: 'root_causes', label: PROCESSING_PHASE_LABELS.root_causes },
  ];
  
  const currentPhaseIndex = phases.findIndex(p => p.key === processingPhase);
  
  return (
    <div className="processing-progress" role="progressbar">
      {phases.map((phase, index) => {
        const range = PROCESSING_PHASE_RANGES[phase.key];
        const isComplete = index < currentPhaseIndex;
        const isActive = index === currentPhaseIndex;
        const phaseProgress = isActive ? processingProgress : isComplete ? 100 : 0;
        const overallProgress = range.start + (phaseProgress / 100) * (range.end - range.start);
        
        return (
          <div key={phase.key} className={`processing-phase ${isComplete ? 'complete' : isActive ? 'active' : 'pending'}`}>
            <div className="phase-icon">
              {isComplete ? '✓' : isActive ? '⟳' : '○'}
            </div>
            <div className="phase-info">
              <span className="phase-label">{phase.label}</span>
              {isActive && (
                <div className="phase-progress-bar">
                  <div
                    className="phase-progress-fill"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// =============================================================================
// Hook: Orchestrate the processing pipeline
// =============================================================================

/**
 * useScanPipeline orchestrates the 3-phase processing flow:
 * 1. Quality Check (Kimi K2.6) → POST /api/analysis/upload
 * 2. Classification (MiMo Omni) → POST /api/analysis/classify
 * 3. Root Causes → GET /api/analysis/:id (knowledge graph lookup)
 */
export function useScanPipeline() {
  const { state, dispatch } = useScan();
  
  const startPipeline = React.useCallback(async () => {
    if (!state.capturedImageData && !state.uploadedImageUri) {
      dispatch({ type: 'SET_ERROR', error: 'No image data available' });
      return;
    }
    
    if (!state.skinTone) {
      dispatch({ type: 'SET_ERROR', error: 'Skin tone calibration required' });
      return;
    }
    
    if (!state.privacyConsented) {
      dispatch({ type: 'SET_ERROR', error: 'Privacy consent required' });
      return;
    }
    
    // Move to processing step
    dispatch({ type: 'SET_STEP', step: 'processing' });
    
    try {
      // Phase 1: Upload + Quality Check
      dispatch({ type: 'SET_PROCESSING_PHASE', phase: 'quality_check', progress: 0 });
      
      const uploadResponse = await fetch('/api/analysis/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: state.capturedImageData,
          skinTone: state.skinTone,
          captureMethod: state.uploadedImageUri ? 'gallery' : 'camera',
        }),
      });
      
      dispatch({ type: 'SET_PROCESSING_PHASE', phase: 'quality_check', progress: 50 });
      
      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }
      
      const uploadData = await uploadResponse.json();
      
      dispatch({ type: 'SET_PROCESSING_PHASE', phase: 'quality_check', progress: 100 });
      dispatch({ type: 'SET_UPLOAD_ID', uploadId: uploadData.uploadId });
      dispatch({ type: 'SET_QUALITY', score: uploadData.qualityScore, lighting: uploadData.lightingQuality, warnings: uploadData.warnings || [] });
      dispatch({ type: 'SET_FACE_DETECTION', detected: uploadData.faceDetected, centered: uploadData.faceCentered, eyesVisible: uploadData.eyesVisible });
      
      // Check if image was rejected
      if (uploadData.rejected) {
        dispatch({ type: 'SET_ERROR', error: uploadData.rejected.reason });
        return;
      }
      
      // Phase 2: Classification
      dispatch({ type: 'SET_PROCESSING_PHASE', phase: 'classification', progress: 0 });
      
      const classifyResponse = await fetch('/api/analysis/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadId: uploadData.uploadId,
          skinTone: state.skinTone,
        }),
      });
      
      dispatch({ type: 'SET_PROCESSING_PHASE', phase: 'classification', progress: 50 });
      
      if (!classifyResponse.ok) {
        throw new Error(`Classification failed: ${classifyResponse.status}`);
      }
      
      const classifyData = await classifyResponse.json();
      
      dispatch({ type: 'SET_PROCESSING_PHASE', phase: 'classification', progress: 100 });
      dispatch({ type: 'SET_PROCESSING_TIER', tier: classifyData.tier });
      
      // Phase 3: Root Causes (from knowledge graph)
      dispatch({ type: 'SET_PROCESSING_PHASE', phase: 'root_causes', progress: 0 });
      
      if (classifyData.analysisId) {
        const detailResponse = await fetch(`/api/analysis/${classifyData.analysisId}`);
        
        if (detailResponse.ok) {
          const detailData = await detailResponse.json();
          dispatch({ type: 'SET_PROCESSING_PHASE', phase: 'root_causes', progress: 50 });
          // Root causes will come from knowledge graph lookup
        }
      }
      
      dispatch({ type: 'SET_PROCESSING_PHASE', phase: 'root_causes', progress: 100 });
      
      // Move to results
      dispatch({
        type: 'SET_RESULTS',
        analysisId: classifyData.analysisId,
        conditions: classifyData.conditions || [],
        zones: classifyData.skinZones || [],
      });
      
      dispatch({ type: 'SET_STEP', step: 'results' });
      
      // Privacy: delete stored image after processing
      if (uploadData.uploadId) {
        fetch(`/api/analysis/${uploadData.uploadId}/image`, { method: 'DELETE' }).catch(() => {
          // Silent fail — image will auto-delete after 24h anyway
        });
      }
      
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        error: error instanceof Error ? error.message : 'Processing failed. Please try again.',
      });
    }
  }, [state.capturedImageData, state.uploadedImageUri, state.skinTone, state.privacyConsented, dispatch]);
  
  return { startPipeline };
}