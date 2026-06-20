"use client";

import { useCallback, useRef, useState } from "react";
import { Camera, ImagePlus, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoUploadProps {
  onImageSelected: (base64: string) => void;
  onError?: (message: string) => void;
}

export default function PhotoUpload({ onImageSelected, onError }: PhotoUploadProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        onError?.("Please upload an image file (JPEG or PNG).");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        onError?.("Image must be under 10MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setPreview(base64);
        onImageSelected(base64);
      };
      reader.onerror = () => onError?.("Failed to read image.");
      reader.readAsDataURL(file);
    },
    [onImageSelected, onError]
  );

  const handleCameraFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      // Reset input so same file can be selected again
      if (cameraInputRef.current) cameraInputRef.current.value = "";
    },
    [processFile]
  );

  const handleGalleryFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      // Reset input so same file can be selected again
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const clear = useCallback(() => {
    setPreview(null);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  }, []);

  return (
    <div className="w-full space-y-4">
      {/* Camera input: opens device camera on mobile */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleCameraFileChange}
      />

      {/* Gallery input: opens photo picker */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleGalleryFileChange}
      />

      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border border-[var(--color-hairline)] bg-[var(--color-surface-muted)]">
          <img
            src={preview}
            alt="Selected photo"
            className="w-full aspect-square object-cover"
          />
          <button
            onClick={clear}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            aria-label="Remove photo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => galleryInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            w-full rounded-2xl border-2 border-dashed p-8 flex flex-col items-center justify-center gap-3
            transition-colors cursor-pointer
            ${
              dragActive
                ? "border-[var(--color-primary)] bg-[var(--color-primary-50)]"
                : "border-[var(--color-hairline)] bg-[var(--color-surface-muted)] hover:border-[var(--color-ink-muted)]"
            }
          `}
        >
          <div className="w-14 h-14 rounded-full bg-[var(--color-primary-50)] flex items-center justify-center">
            <ImagePlus className="w-6 h-6 text-[var(--color-primary)]" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-[var(--color-ink)]">
              Tap to upload a selfie
            </p>
            <p className="text-xs text-[var(--color-ink-muted)] mt-1">
              JPEG or PNG, under 10MB
            </p>
          </div>
        </button>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 h-11 rounded-xl border-[var(--color-hairline)] text-[var(--color-ink-secondary)]"
          onClick={() => cameraInputRef.current?.click()}
          disabled={!!preview}
        >
          <Camera className="w-4 h-4 mr-2" />
          Camera
        </Button>
        <Button
          variant="outline"
          className="flex-1 h-11 rounded-xl border-[var(--color-hairline)] text-[var(--color-ink-secondary)]"
          onClick={() => galleryInputRef.current?.click()}
          disabled={!!preview}
        >
          <Upload className="w-4 h-4 mr-2" />
          Gallery
        </Button>
      </div>
    </div>
  );
}
