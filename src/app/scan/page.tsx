"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Camera, Image, Sparkles, ChevronRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScan } from "@/lib/scan/ScanContext";
import { FitzpatrickType } from "@/types/scan";

const FITZPATRICK_SWATCHES: { type: FitzpatrickType; label: string; color: string }[] = [
  { type: 1, label: "Type I — Very fair, always burns", color: "#FFF3E0" },
  { type: 2, label: "Type II — Fair, burns easily", color: "#FFE0B2" },
  { type: 3, label: "Type III — Medium, sometimes burns", color: "#FFCC80" },
  { type: 4, label: "Type IV — Olive, rarely burns", color: "#C68E5E" },
  { type: 5, label: "Type V — Dark brown, rarely burns", color: "#8D5524" },
  { type: 6, label: "Type VI — Deeply pigmented, never burns", color: "#3C1E08" },
];

type CaptureMethod = "camera" | "gallery" | null;

export default function ScanEntryPage() {
  const router = useRouter();
  const { dispatch } = useScan();
  const [skinTone, setSkinTone] = useState<FitzpatrickType | null>(null);
  const [captureMethod, setCaptureMethod] = useState<CaptureMethod>(null);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = useCallback(() => {
    if (!skinTone) {
      setError("Please select your skin tone type.");
      return;
    }
    if (!captureMethod) {
      setError("Please choose a capture method.");
      return;
    }
    setError(null);
    dispatch({ type: "SET_SKIN_TONE", skinTone, autoDetected: false });
    router.push("/scan/capture");
  }, [skinTone, captureMethod, dispatch, router]);

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Header */}
      <header className="px-6 pt-8 pb-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-stone-900 tracking-tight">
            SKINgenius
          </span>
        </div>
        <h1 className="text-3xl font-bold text-stone-900 tracking-tight mb-2">
          Skin Scan
        </h1>
        <p className="text-stone-600 leading-relaxed">
          AI-powered analysis in under 60 seconds. Choose your skin tone and capture method to begin.
        </p>
      </header>

      {/* Content */}
      <main className="flex-1 px-6 pb-8 space-y-8">
        {/* Fitzpatrick Selector */}
        <section>
          <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-4">
            Select Your Skin Tone
          </h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {FITZPATRICK_SWATCHES.map((swatch) => {
              const isSelected = skinTone === swatch.type;
              return (
                <button
                  key={swatch.type}
                  type="button"
                  onClick={() => {
                    setSkinTone(swatch.type);
                    setError(null);
                  }}
                  className={`
                    relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all
                    ${isSelected
                      ? "border-emerald-600 bg-emerald-50 shadow-md"
                      : "border-stone-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50"
                    }
                  `}
                  aria-pressed={isSelected}
                  title={swatch.label}
                >
                  <div
                    className="w-12 h-12 rounded-full border border-stone-200 shadow-inner"
                    style={{ backgroundColor: swatch.color }}
                  />
                  <span className="text-xs font-semibold text-stone-700">
                    Type {swatch.type}
                  </span>
                  {isSelected && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {skinTone && (
            <p className="mt-3 text-sm text-emerald-700 font-medium">
              {FITZPATRICK_SWATCHES.find((s) => s.type === skinTone)?.label}
            </p>
          )}
        </section>

        {/* Capture Method */}
        <section>
          <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-4">
            Capture Method
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setCaptureMethod("camera");
                setError(null);
              }}
              className={`
                flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all
                ${captureMethod === "camera"
                  ? "border-emerald-600 bg-emerald-50 shadow-md"
                  : "border-stone-200 bg-white hover:border-emerald-300"
                }
              `}
              aria-pressed={captureMethod === "camera"}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${captureMethod === "camera" ? "bg-emerald-600" : "bg-stone-100"}`}>
                <Camera className={`w-6 h-6 ${captureMethod === "camera" ? "text-white" : "text-stone-500"}`} />
              </div>
              <div className="text-center">
                <span className="block text-sm font-semibold text-stone-900">Camera</span>
                <span className="block text-xs text-stone-500 mt-1">Take a photo now</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setCaptureMethod("gallery");
                setError(null);
              }}
              className={`
                flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all
                ${captureMethod === "gallery"
                  ? "border-emerald-600 bg-emerald-50 shadow-md"
                  : "border-stone-200 bg-white hover:border-emerald-300"
                }
              `}
              aria-pressed={captureMethod === "gallery"}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${captureMethod === "gallery" ? "bg-emerald-600" : "bg-stone-100"}`}>
                <Image className={`w-6 h-6 ${captureMethod === "gallery" ? "text-white" : "text-stone-500"}`} />
              </div>
              <div className="text-center">
                <span className="block text-sm font-semibold text-stone-900">Gallery</span>
                <span className="block text-xs text-stone-500 mt-1">Upload an existing photo</span>
              </div>
            </button>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          className="w-full py-6 text-base font-semibold rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg shadow-emerald-900/10"
        >
          Start Scan
          <ChevronRight className="w-5 h-5 ml-1" />
        </Button>

        {/* Privacy Note */}
        <div className="flex items-start gap-3 text-xs text-stone-500">
          <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            Photos are processed securely and deleted immediately after analysis. 
            We never store your images on our servers.
          </p>
        </div>
      </main>
    </div>
  );
}
