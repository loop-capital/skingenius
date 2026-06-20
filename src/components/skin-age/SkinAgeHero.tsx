"use client";

import { useState, useCallback, useRef } from "react";
import { Camera, Upload, Sparkles, ArrowRight, Shield, Clock, TrendingDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SkinAgeHeroProps {
  onStartAnalysis: (imageBase64: string) => void;
  onReset?: () => void;
  showReset?: boolean;
}

export default function SkinAgeHero({ onStartAnalysis, onReset, showReset = false }: SkinAgeHeroProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      setUploadError(null);
      if (!file.type.startsWith("image/")) {
        setUploadError("Please upload an image file (JPEG or PNG).");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError("Image must be under 10MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setPreview(base64);
        onStartAnalysis(base64);
      };
      reader.onerror = () => setUploadError("Failed to read image.");
      reader.readAsDataURL(file);
    },
    [onStartAnalysis]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleCameraCapture = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      if (cameraInputRef.current) cameraInputRef.current.value = "";
    },
    [processFile]
  );

  const handleGallerySelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    },
    [processFile]
  );

  const handleRetake = useCallback(() => {
    setPreview(null);
    setUploadError(null);
    onReset?.();
  }, [onReset]);

  return (
    <section className="relative overflow-hidden bg-[#FFFBF5]">
      {/* Soft gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50/40 via-transparent to-emerald-50/30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div className="space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              AI-Powered Analysis
            </div>

            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-stone-900 leading-[1.1] tracking-tight">
              Discover Your{" "}
              <span className="bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
                Skin Age
              </span>
            </h1>

            <p className="text-lg text-stone-600 leading-relaxed max-w-lg">
              Upload a selfie and our AI will analyze your skin&apos;s texture, wrinkles, 
              spots, and hydration to estimate your biological skin age — in seconds.
            </p>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-4">
              {[
                { icon: Shield, text: "Privacy-first" },
                { icon: Clock, text: "Results in 10s" },
                { icon: TrendingDown, text: "See improvement potential" },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-stone-600">
                  <div className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Upload Area */}
          <div className="relative">
            {/* Hidden inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={handleCameraCapture}
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleGallerySelect}
            />

            {preview ? (
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-stone-900/10 border border-stone-200">
                <img
                  src={preview}
                  alt="Your selfie"
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center animate-pulse">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Ready to analyze</p>
                      <p className="text-white/70 text-sm">Tap below to see your skin age</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleRetake}
                  className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/50 text-white text-sm hover:bg-black/70 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retake
                </button>
              </div>
            ) : (
              <div
                onClick={() => galleryInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
                  relative rounded-3xl border-2 border-dashed p-10 flex flex-col items-center justify-center gap-5
                  cursor-pointer transition-all duration-300 min-h-[400px]
                  ${
                    isDragging
                      ? "border-emerald-400 bg-emerald-50/50 shadow-lg shadow-emerald-900/5"
                      : "border-stone-300 bg-white/50 hover:border-stone-400 hover:bg-white/80"
                  }
                `}
              >
                {/* Upload icon circle */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-rose-500" />
                </div>

                <div className="text-center space-y-2">
                  <p className="text-xl font-semibold text-stone-900">
                    Drop your selfie here
                  </p>
                  <p className="text-sm text-stone-500">
                    or click to browse — JPEG or PNG, under 10MB
                  </p>
                </div>

                {/* Camera buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      cameraInputRef.current?.click();
                    }}
                    className="rounded-xl border-stone-200 text-stone-700 hover:bg-stone-50"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Camera
                  </Button>
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      galleryInputRef.current?.click();
                    }}
                    className="rounded-xl border-stone-200 text-stone-700 hover:bg-stone-50"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Gallery
                  </Button>
                </div>

                {/* Error message */}
                {uploadError && (
                  <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2 rounded-lg">
                    {uploadError}
                  </p>
                )}

                {/* Privacy note */}
                <div className="flex items-center gap-2 text-xs text-stone-400">
                  <Shield className="w-3 h-3" />
                  <span>Photos are analyzed locally and never stored</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom scroll indicator */}
        {!preview && (
          <div className="flex justify-center mt-12">
            <div className="flex items-center gap-2 text-sm text-stone-400 animate-bounce">
              <span>Scroll to learn more</span>
              <ArrowRight className="w-4 h-4 rotate-90" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
