"use client";

import { useRef, useCallback, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Share2, X, Sparkles, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";
import { SkinAgeResult } from "@/types/skin-age";

interface SkinAgeShareProps {
  result: SkinAgeResult;
  actualAge?: number;
  onClose: () => void;
}

export default function SkinAgeShare({ result, actualAge, onClose }: SkinAgeShareProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const gapText =
    result.ageGap === 0
      ? "On par with my actual age"
      : result.ageGap < 0
      ? `${Math.abs(result.ageGap)} years younger`
      : `${result.ageGap} years older`;

  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://skingenius.app";

  const shareText = `I just discovered my skin age with SKINgenius! 🧬\n\nMy skin age: ${result.estimatedAgeRange ?? result.estimatedAge} years${actualAge ? ` (actual: ${actualAge})` : ""}\n\nThat's ${gapText}!\n\nAnalyze your skin age for free → ${appUrl}/skin-age`;

  const generateCard = useCallback(async () => {
    if (!cardRef.current) return null;
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      return dataUrl;
    } catch (err) {
      console.error("Failed to generate image:", err);
      return null;
    }
  }, []);

  const downloadPng = useCallback(async () => {
    const dataUrl = await generateCard();
    if (!dataUrl) {
      alert("Failed to generate image. Try again.");
      return;
    }
    const link = document.createElement("a");
    link.download = `skin-age-${result.estimatedAge}.png`;
    link.href = dataUrl;
    link.click();
  }, [generateCard, result.estimatedAge]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = shareText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareText]);

  const shareNative = useCallback(async () => {
    const dataUrl = await generateCard();
    if (!dataUrl) {
      alert("Failed to generate image. Try again.");
      return;
    }
    try {
      const blob = await fetch(dataUrl).then((r) => r.blob());
      const file = new File([blob], `skin-age-${result.estimatedAge}.png`, {
        type: "image/png",
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `My skin age is ${result.estimatedAgeRange ?? result.estimatedAge}!`,
          text: shareText,
          files: [file],
        });
      } else {
        downloadPng();
      }
    } catch (err) {
      console.error("Share failed:", err);
      downloadPng();
    }
  }, [generateCard, result.estimatedAge, result.estimatedAgeRange, shareText, downloadPng]);

  const shareToSocial = useCallback(
    async (platform: "instagram" | "twitter" | "tiktok") => {
      // All these platforms need manual upload on mobile/web
      await downloadPng();
      await copyToClipboard();
      alert(
        `Image downloaded and caption copied! Open ${platform} and create your post/story.`
      );
    },
    [downloadPng, copyToClipboard]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Share Card Preview */}
        <div
          ref={cardRef}
          className="bg-white rounded-3xl p-6 space-y-5 shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-stone-900 leading-tight">
                SKINgenius
              </p>
              <p className="text-xs text-stone-500">AI Skin Age Analysis</p>
            </div>
          </div>

          {/* Skin Age Display */}
          <div className="text-center space-y-1 py-2">
            <p className="text-sm font-medium text-stone-500 uppercase tracking-wider">
              My Skin Age
            </p>
            <div className="flex items-baseline justify-center gap-1">
              {result.estimatedAgeRange ? (
                <span className="text-5xl font-bold text-stone-900 tracking-tight">
                  {result.estimatedAgeRange}
                </span>
              ) : (
                <>
                  <span className="text-7xl font-bold text-stone-900 tracking-tight">
                    {result.estimatedAge}
                  </span>
                  <span className="text-lg text-stone-500">yrs</span>
                </>
              )}
            </div>
            {actualAge !== undefined && (
              <p className="text-sm text-stone-500">
                Actual age: {actualAge} · {gapText}
              </p>
            )}
          </div>

          {/* Improvement potential */}
          {result.ageGap > 0 && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-center">
              <p className="text-sm text-emerald-800 font-medium">
                Could look {Math.max(result.estimatedAge - 3, actualAge ? actualAge - 3 : 18)}{" "}
                with a routine!
              </p>
            </div>
          )}

          {/* Score bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-600">Skin Health Score</span>
              <span className="font-bold text-emerald-700">
                {result.skinAgeScore}/100
              </span>
            </div>
            <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                style={{ width: `${result.skinAgeScore}%` }}
              />
            </div>
          </div>

          {/* Top tip */}
          {result.tips[0] && (
            <div className="bg-gradient-to-r from-rose-50 to-amber-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
                Top Tip
              </p>
              <p className="text-sm font-medium text-stone-900">
                {result.tips[0].title}
              </p>
              <p className="text-xs text-stone-600 mt-0.5">
                {result.tips[0].description}
              </p>
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

        {/* Share Actions */}
        <div className="space-y-3">
          {/* Social Share Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => shareToSocial("instagram")}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white border border-stone-200 hover:border-pink-300 hover:bg-pink-50 transition-all"
            >
              <svg className="w-5 h-5 text-pink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
              <span className="text-xs font-medium text-stone-700">Instagram</span>
            </button>
            <button
              onClick={() => shareToSocial("twitter")}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white border border-stone-200 hover:border-sky-300 hover:bg-sky-50 transition-all"
            >
              <svg className="w-5 h-5 text-sky-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span className="text-xs font-medium text-stone-700">Twitter</span>
            </button>
            <button
              onClick={() => shareToSocial("tiktok")}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white border border-stone-200 hover:border-stone-800 hover:bg-stone-50 transition-all"
            >
              <svg className="w-5 h-5 text-stone-800" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
              <span className="text-xs font-medium text-stone-700">TikTok</span>
            </button>
          </div>

          {/* Main actions */}
          <div className="flex gap-2">
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
              className="flex-1 h-12 rounded-xl border-stone-200 text-stone-700 hover:bg-stone-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>

          {/* Copy text button */}
          <Button
            variant="outline"
            onClick={copyToClipboard}
            className="w-full h-11 rounded-xl border-stone-200 text-stone-600 hover:bg-stone-50"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2 text-emerald-600" />
                Copied to clipboard!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy caption
              </>
            )}
          </Button>
        </div>

        {/* Funnel CTA */}
        <a
          href="/scan"
          className="flex items-center justify-center gap-2 w-full py-3 bg-white text-emerald-700 text-sm font-semibold rounded-xl border border-emerald-200 hover:bg-emerald-50 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Want to fix it? Get your personalized routine →
        </a>

        <button
          onClick={onClose}
          className="w-full h-12 rounded-xl text-stone-500 text-sm font-medium hover:bg-white/10 transition-colors flex items-center justify-center"
        >
          <X className="w-4 h-4 mr-1" />
          Close
        </button>
      </div>
    </div>
  );
}
