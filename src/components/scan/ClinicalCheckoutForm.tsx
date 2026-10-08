"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Upload,
  ShieldCheck,
  FileText,
  Loader2,
  X,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ClinicalCheckoutFormProps {
  scanId: string;
}

export function ClinicalCheckoutForm({ scanId }: ClinicalCheckoutFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<{ file: File; preview: string }[]>([]);

  const [form, setForm] = useState({
    patient_name: "",
    patient_email: "",
    patient_phone: "",
    insurance_provider: "",
    insurance_policy_number: "",
    insurance_group_number: "",
    consent_hipaa: false,
    consent_share: false,
  });

  const updateField = useCallback(
    (field: keyof typeof form, value: string | boolean) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files ?? []);
      const newFiles = selected.slice(0, 3 - files.length).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setFiles((prev) => [...prev, ...newFiles].slice(0, 3));
    },
    [files.length],
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].preview);
      next.splice(index, 1);
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!form.patient_name || !form.patient_email) {
        setError("Name and email are required.");
        return;
      }
      if (!form.consent_hipaa || !form.consent_share) {
        setError("You must accept both consent agreements.");
        return;
      }

      setLoading(true);

      try {
        // Mock "upload" — store base64 data URLs so the dashboard can display them
        const photos = await Promise.all(
          files.map(async (f) => ({
            photo_url: await fileToDataUrl(f.file),
            photo_type: "close_up" as const,
          })),
        );

        const res = await fetch("/api/clinical-reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scan_id: scanId,
            ...form,
            photos,
          }),
        });

        const json = await res.json();

        if (!res.ok || json.error) {
          throw new Error(json.error || "Checkout failed");
        }

        // Mock Stripe success — real integration can swap this block
        router.push(`/scan/clinical-results/${json.data.id}?from=checkout`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Checkout failed");
      } finally {
        setLoading(false);
      }
    },
    [form, files, scanId, router],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="border-stone-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            Clinical review — $49
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="patient_name">Full name</Label>
              <Input
                id="patient_name"
                value={form.patient_name}
                onChange={(e) => updateField("patient_name", e.target.value)}
                placeholder="Jane Doe"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="patient_email">Email</Label>
              <Input
                id="patient_email"
                type="email"
                value={form.patient_email}
                onChange={(e) => updateField("patient_email", e.target.value)}
                placeholder="jane@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="patient_phone">Phone</Label>
            <Input
              id="patient_phone"
              type="tel"
              value={form.patient_phone}
              onChange={(e) => updateField("patient_phone", e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-stone-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Insurance (optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="insurance_provider">Provider</Label>
            <Input
              id="insurance_provider"
              value={form.insurance_provider}
              onChange={(e) => updateField("insurance_provider", e.target.value)}
              placeholder="e.g. Blue Cross"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="insurance_policy_number">Policy number</Label>
              <Input
                id="insurance_policy_number"
                value={form.insurance_policy_number}
                onChange={(e) => updateField("insurance_policy_number", e.target.value)}
                placeholder="XXX-XXX-XXX"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="insurance_group_number">Group number</Label>
              <Input
                id="insurance_group_number"
                value={form.insurance_group_number}
                onChange={(e) => updateField("insurance_group_number", e.target.value)}
                placeholder="XXX-XXX"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-stone-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-600" />
            Upload close-ups
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-stone-600">
            Add up to 3 close-up photos of the area you are most concerned about.
          </p>

          <label className="flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 hover:bg-stone-100 cursor-pointer transition-colors">
            <Upload className="w-6 h-6 text-stone-400 mb-2" />
            <span className="text-sm text-stone-600 font-medium">
              {files.length > 0 ? "Add more photos" : "Click to upload"}
            </span>
            <span className="text-xs text-stone-400 mt-1">
              {files.length}/3 uploaded
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={files.length >= 3}
            />
          </label>

          {files.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {files.map((f, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-stone-200">
                  <img
                    src={f.preview}
                    alt={`Close-up ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-stone-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            Consent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-start gap-3">
            <Checkbox
              id="consent_hipaa"
              checked={form.consent_hipaa}
              onChange={(e) => updateField("consent_hipaa", e.target.checked)}
              className="mt-0.5"
            />
            <div>
              <span className="text-sm font-medium text-stone-900">HIPAA notice</span>
              <p className="text-xs text-stone-500">
                I understand how SKINgenius handles my health information under our HIPAA-compliant practices.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3">
            <Checkbox
              id="consent_share"
              checked={form.consent_share}
              onChange={(e) => updateField("consent_share", e.target.checked)}
              className="mt-0.5"
            />
            <div>
              <span className="text-sm font-medium text-stone-900">Data sharing with dermatologist</span>
              <p className="text-xs text-stone-500">
                I consent to sharing my photos, scan results, and contact details with a board-certified dermatologist for review.
              </p>
            </div>
          </label>
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={loading}
        className="w-full py-6 text-base font-semibold rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg shadow-emerald-900/10"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pay $49 & submit for review
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-1 text-xs text-stone-400">
        <ShieldCheck className="w-3.5 h-3.5" />
        Mock checkout in prototype — Stripe credentials not yet configured
      </div>
    </form>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
