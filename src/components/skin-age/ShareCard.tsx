"use client";

import { useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import { Download, Share2, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";
import { SkinAgeResult } from "@/types/skin-age";

interface ShareCardProps {
  result: SkinAgeResult;
  actualAge?: number;
  onClose: () => void;
}

export default function ShareCard({ result, actualAge, onClose }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const downloadPng = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = `skin-age-${result.estimatedAge}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image:", err);
      alert("Failed to generate image. Try again.");
    }
  }, [result.estimatedAge]);

  const shareNative = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      const blob = await fetch(dataUrl).then((r) => r.blob());
      const file = new File([blob], `skin-age-${result.estimatedAge}.png`, {
        type: "image/png",
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `My skin age is ${result.estimatedAgeRange ?? result.estimatedAge}!`,
          text: `I just got my skin age analyzed with SKINgenius. My skin appears to be in its ${result.estimatedAgeRange ?? result.estimatedAge + "s"}${actualAge ? ` (actual age: ${actualAge})` : ""}.`,
          files: [file],
        });
      } else {
        downloadPng();
      }
    } catch (err) {
      console.error("Share failed:", err);
      downloadPng();
    }
  }, [result.estimatedAge, result.estimatedAgeRange, actualAge, downloadPng]);

  const gapText =
    result.ageGap === 0
      ? "On par with my actual age"
      : result.ageGap < 0
      ? `${Math.abs(result.ageGap)} years younger`
      : `${result.ageGap} years older`;

  const appUrl = typeof window !== "undefined" ? window.location.origin : "https://skingenius.app";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm space-y-4">
        {/* Card preview */}
        <div
          ref={cardRef}
          className="bg-white rounded-3xl p-6 space-y-5 shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-stone-900 leading-tight">SKINgenius</p>
              <p className="text-xs text-stone-500">AI Skin Age Analysis</p>
            </div>
          </div>

          {/* Big number (or range) */}
          <div className="text-center space-y-1 py-2">
            <p className="text-sm font-medium text-stone-500 uppercase tracking-wider">My Skin Age</p>
            <div className="flex items-baseline justify-center gap-1">
              {result.estimatedAgeRange ? (
                <span className="text-5xl font-bold text-stone-900 tracking-tight">{result.estimatedAgeRange}</span>
              ) : (
                <>
                  <span className="text-7xl font-bold text-stone-900 tracking-tight">{result.estimatedAge}</span>
                  <span className="text-lg text-stone-500">yrs</span>
                </>
              )}
            </div>
            {actualAge !== undefined && (
              <p className="text-sm text-stone-500">Actual age: {actualAge} · {gapText}</p>
            )}
          </div>

          {/* Score bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-600">Skin Health Score</span>
              <span className="font-bold text-emerald-700">{result.skinAgeScore}/100</span>
            </div>
            <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-600"
                style={{ width: `${result.skinAgeScore}%` }}
              />
            </div>
          </div>

          {/* Top tip */}
          {result.tips[0] && (
            <div className="bg-stone-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Top Tip</p>
              <p className="text-sm font-medium text-stone-900">{result.tips[0].title}</p>
              <p className="text-xs text-stone-600 mt-0.5">{result.tips[0].description}</p>
            </div>
          )}

          {/* Footer with QR */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-[10px] text-stone-400 max-w-[140px] leading-tight">
              Scan to analyze your own skin age with AI.
            </p>
            <div className="w-16 h-16">
              <QRCode value={appUrl} size={64} level="M" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={shareNative}
            className="flex-1 h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            variant="outline"
            onClick={downloadPng}
            className="flex-1 h-12 rounded-xl border-stone-200 text-stone-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>

        {/* Funnel CTA below share card */}
        <a
          href="/scan"
          className="flex items-center justify-center gap-2 w-full py-3 bg-white text-emerald-700 text-sm font-semibold rounded-xl border border-emerald-200 hover:bg-emerald-50 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Want to fix it? Get your personalized routine →
        </a>

        <button
          onClick={onClose}
          className="w-full h-12 rounded-xl text-stone-500 text-sm font-medium hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 inline mr-1" />
          Close
        </button>
      </div>
    </div>
  );
}
