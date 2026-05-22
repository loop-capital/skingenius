'use client';

'use client';

import React, { useState, useCallback } from 'react';
import { Check, ChevronRight, RotateCcw, Sparkles, User, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { SkinToneMatch } from './CameraCapture';

// ------------------------------------------------------------------
// Fitzpatrick scale definitions
// ------------------------------------------------------------------

interface FitzpatrickType {
  type: 1 | 2 | 3 | 4 | 5 | 6;
  name: string;
  description: string;
  characteristics: string[];
  hex: string;
}

const FITZPATRICK_TYPES: FitzpatrickType[] = [
  {
    type: 1,
    name: 'Type I',
    description: 'Very fair, always burns, never tans',
    characteristics: ['Pale white skin', 'Light blue/green eyes', 'Red or blonde hair', 'Freckles common'],
    hex: '#F5D0C5',
  },
  {
    type: 2,
    name: 'Type II',
    description: 'Fair, burns easily, tans minimally',
    characteristics: ['Fair skin', 'Blue eyes', 'Blonde or light brown hair', 'May freckle'],
    hex: '#E8B4A0',
  },
  {
    type: 3,
    name: 'Type III',
    description: 'Medium, sometimes burns, tans gradually',
    characteristics: ['Medium skin', 'Hazel or brown eyes', 'Dark blonde to brown hair', 'Occasional freckles'],
    hex: '#D4A574',
  },
  {
    type: 4,
    name: 'Type IV',
    description: 'Olive, rarely burns, tans well',
    characteristics: ['Olive or light brown skin', 'Dark brown eyes', 'Dark brown hair', 'Minimal freckling'],
    hex: '#B8835A',
  },
  {
    type: 5,
    name: 'Type V',
    description: 'Brown, very rarely burns, tans darkly',
    characteristics: ['Brown skin', 'Dark brown to black eyes', 'Dark brown to black hair', 'No freckles'],
    hex: '#8D5524',
  },
  {
    type: 6,
    name: 'Type VI',
    description: 'Dark brown to black, never burns, deeply pigmented',
    characteristics: ['Dark brown to black skin', 'Dark brown to black eyes', 'Black hair', 'No freckles'],
    hex: '#4A2511',
  },
];

// ------------------------------------------------------------------
// Props
// ------------------------------------------------------------------

interface PhotoCalibrationProps {
  autoSuggestedTone: { type: 1 | 2 | 3 | 4 | 5 | 6; confidence: number } | null;
  onComplete: (skinTone: SkinToneMatch) => void;
  onRetake: () => void;
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export default function PhotoCalibration({
  autoSuggestedTone,
  onComplete,
  onRetake,
}: PhotoCalibrationProps) {
  const [selectedType, setSelectedType] = useState<number | null>(
    autoSuggestedTone?.type ?? null
  );
  const [isConfirming, setIsConfirming] = useState(false);

  const handleSelect = useCallback((type: number) => {
    setSelectedType(type);
  }, []);

  const handleConfirm = useCallback(() => {
    if (selectedType === null) return;
    setIsConfirming(true);

    const skinTone: SkinToneMatch = {
      fitzpatrickType: selectedType as 1 | 2 | 3 | 4 | 5 | 6,
      confidence: autoSuggestedTone?.type === selectedType ? autoSuggestedTone.confidence : 1.0,
      autoDetected: autoSuggestedTone?.type === selectedType,
      userConfirmed: true,
    };

    // Small delay for UX feedback
    setTimeout(() => {
      onComplete(skinTone);
    }, 400);
  }, [selectedType, autoSuggestedTone, onComplete]);

  const selectedFitzpatrick = FITZPATRICK_TYPES.find((f) => f.type === selectedType);

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <User className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Skin Tone Calibration</h2>
        </div>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          Select the skin tone that most closely matches your natural complexion.
          This helps us provide more accurate analysis.
        </p>
      </div>

      {/* Auto-suggestion banner */}
      {autoSuggestedTone && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-900">
              Auto-detected: Type {autoSuggestedTone.type}
            </p>
            <p className="text-xs text-blue-700">
              Confidence: {Math.round(autoSuggestedTone.confidence * 100)}% — please confirm or select a different tone.
            </p>
          </div>
        </div>
      )}

      {/* Skin tone swatches */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Select Your Tone</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Info className="w-4 h-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-xs">
                  The Fitzpatrick scale classifies skin types by response to UV exposure.
                  Choose the one that best describes your natural, un-tanned skin.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {FITZPATRICK_TYPES.map((fitz) => {
            const isSelected = selectedType === fitz.type;
            const isAutoSuggested = autoSuggestedTone?.type === fitz.type;

            return (
              <button
                key={fitz.type}
                onClick={() => handleSelect(fitz.type)}
                className={`
                  relative group flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all
                  ${isSelected
                    ? 'border-blue-600 bg-blue-50 shadow-sm'
                    : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                  }
                `}
              >
                {/* Swatch */}
                <div
                  className={`
                    w-12 h-12 rounded-full shadow-inner transition-transform
                    ${isSelected ? 'ring-2 ring-blue-600 ring-offset-2 scale-110' : 'group-hover:scale-105'}
                  `}
                  style={{ backgroundColor: fitz.hex }}
                />

                {/* Label */}
                <span className={`text-xs font-medium ${isSelected ? 'text-blue-700' : 'text-muted-foreground'}`}>
                  {fitz.name}
                </span>

                {/* Auto-suggested indicator */}
                {isAutoSuggested && !isSelected && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                )}

                {/* Selected check */}
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected details */}
      {selectedFitzpatrick && (
        <div className="bg-slate-50 rounded-lg p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: selectedFitzpatrick.hex }}
            />
            <span className="font-semibold">{selectedFitzpatrick.name}</span>
            <span className="text-muted-foreground text-sm">— {selectedFitzpatrick.description}</span>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Typical Characteristics
            </span>
            <ul className="grid grid-cols-2 gap-1">
              {selectedFitzpatrick.characteristics.map((char, i) => (
                <li key={i} className="text-xs text-slate-700 flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-slate-400" />
                  {char}
                </li>
              ))}
            </ul>
          </div>

          {/* Confirmation progress */}
          {isConfirming && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Applying calibration...</span>
                <span className="text-blue-600 font-medium">Processing</span>
              </div>
              <Progress value={60} className="h-1.5" />
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onRetake} className="flex-1">
          <RotateCcw className="w-4 h-4 mr-2" />
          Retake Photo
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={selectedType === null || isConfirming}
          className="flex-1"
        >
          {isConfirming ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ChevronRight className="w-4 h-4 mr-2" />
              Confirm & Continue
            </>
          )}
        </Button>
      </div>

      {/* Footer note */}
      <p className="text-xs text-center text-muted-foreground">
        You can always update your skin tone later in settings.
      </p>
    </Card>
  );
}
