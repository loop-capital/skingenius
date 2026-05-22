"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, RotateCcw, Check, AlertCircle, ArrowLeft, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScan } from "@/lib/scan/ScanContext";

interface CompressedImage {
  dataUrl: string;
  width: number;
  height: number;
  sizeKB: number;
}

async function compressImage(file: File | Blob, maxDimension = 2048, quality = 0.85): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const img = new globalThis.Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      const base64 = dataUrl.split(",")[1];
      const sizeBytes = Math.ceil((base64.length * 3) / 4);
      const sizeKB = Math.round((sizeBytes / 1024) * 10) / 10;

      resolve({ dataUrl, width, height, sizeKB });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

function dataUrlToBase64(dataUrl: string): string {
  return dataUrl.split(",")[1];
}

export default function ScanCapturePage() {
  const router = useRouter();
  const { dispatch } = useScan();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<"camera" | "preview" | "error">("camera");
  const [capturedImage, setCapturedImage] = useState<CompressedImage | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  // Initialize camera
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setIsLoading(true);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: isFrontCamera ? "user" : "environment",
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setMode("camera");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not access camera";
      setCameraError(msg);
      setMode("error");
    } finally {
      setIsLoading(false);
    }
  }, [isFrontCamera]);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Start camera on mount
  useEffect(() => {
    startCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const takePhoto = useCallback(async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), "image/jpeg", 0.92);
    });

    const compressed = await compressImage(blob, 2048, 0.9);
    setCapturedImage(compressed);

    // Stop camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setMode("preview");
  }, []);

  const handleGalleryUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsLoading(true);
      try {
        const compressed = await compressImage(file, 2048, 0.9);
        setCapturedImage(compressed);
        setMode("preview");
      } catch (err) {
        setCameraError(err instanceof Error ? err.message : "Failed to process image");
        setMode("error");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleRetake = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const handleContinue = useCallback(() => {
    if (!capturedImage) return;
    dispatch({
      type: "SET_CAPTURED_IMAGE",
      imageData: dataUrlToBase64(capturedImage.dataUrl),
    });
    router.push("/scan/analyzing");
  }, [capturedImage, dispatch, router]);

  const toggleCamera = useCallback(() => {
    setIsFrontCamera((prev) => !prev);
  }, []);

  // Error state
  if (mode === "error") {
    return (
      <div className="flex flex-col min-h-[100dvh] px-6 pt-8 pb-8">
        <button
          onClick={() => router.push("/scan")}
          className="flex items-center gap-1 text-sm text-stone-600 mb-6 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">Camera Unavailable</h2>
          <p className="text-stone-600 mb-8 max-w-xs">
            {cameraError || "We couldn't access your camera. You can upload a photo instead."}
          </p>

          <div className="space-y-3 w-full max-w-sm">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-6 text-base font-semibold rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              <Image className="w-5 h-5 mr-2" />
              Upload from Gallery
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleGalleryUpload}
            />
            <Button
              variant="outline"
              onClick={startCamera}
              className="w-full py-6 text-base font-semibold rounded-2xl border-stone-300"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Camera Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Preview state
  if (mode === "preview" && capturedImage) {
    return (
      <div className="flex flex-col min-h-[100dvh] px-6 pt-6 pb-8">
        <header className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/scan")}
            className="flex items-center gap-1 text-sm text-stone-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="text-lg font-semibold text-stone-900">Preview</h2>
          <div className="w-10" />{/* spacer */}
        </header>

        <main className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-sm relative rounded-3xl overflow-hidden shadow-2xl border border-stone-200">
            <img
              src={capturedImage.dataUrl}
              alt="Captured skin photo"
              className="w-full object-contain bg-stone-100"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
              <p className="text-white text-xs">
                {capturedImage.width} × {capturedImage.height} · {capturedImage.sizeKB} KB
              </p>
            </div>
          </div>
        </main>

        <footer className="mt-8 space-y-3">
          <Button
            onClick={handleContinue}
            className="w-full py-6 text-base font-semibold rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg"
          >
            <Check className="w-5 h-5 mr-2" />
            Continue
          </Button>
          <Button
            variant="outline"
            onClick={handleRetake}
            className="w-full py-6 text-base font-semibold rounded-2xl border-stone-300"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake Photo
          </Button>
        </footer>
      </div>
    );
  }

  // Camera state
  return (
    <div className="flex flex-col min-h-[100dvh] bg-stone-950">
      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 px-6 pt-6 pb-4 flex items-center justify-between">
        <button
          onClick={() => router.push("/scan")}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={toggleCamera}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          title="Switch camera"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Video */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Face guide overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-72 sm:w-64 sm:h-80 rounded-full border-2 border-white/40">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 border-t-2 border-l-2 border-white/80 rounded-tl" />
            <div className="absolute -top-2 right-1/2 translate-x-1/2 w-4 h-4 border-t-2 border-r-2 border-white/80 rounded-tr" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 border-b-2 border-l-2 border-white/80 rounded-bl" />
            <div className="absolute -bottom-2 right-1/2 translate-x-1/2 w-4 h-4 border-b-2 border-r-2 border-white/80 rounded-br" />
          </div>
          <p className="absolute bottom-32 left-0 right-0 text-center text-white/70 text-sm font-medium">
            Position your face within the oval
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-10 pt-8 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <Image className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleGalleryUpload}
          />

          <button
            onClick={takePhoto}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors active:scale-95"
          >
            <div className="w-16 h-16 rounded-full bg-white" />
          </button>

          <div className="w-12" />{/* spacer */}
        </div>
      </div>
    </div>
  );
}
