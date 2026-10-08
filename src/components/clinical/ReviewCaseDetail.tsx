"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Stethoscope,
  Pill,
  MapPin,
  Save,
  Send,
  ArrowLeft,
  User,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ClinicalReviewWithDetails,
  ProviderReferral,
  FlaggedFinding,
} from "@/types/clinical";

interface ReviewCaseDetailProps {
  review: ClinicalReviewWithDetails;
}

export function ReviewCaseDetail({ review }: ReviewCaseDetailProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    diagnosis: review.diagnosis ?? "",
    treatment_plan: review.treatment_plan ?? "",
    prescription_name: review.prescription_name ?? "",
    prescription_dosage: review.prescription_dosage ?? "",
    prescription_instructions: review.prescription_instructions ?? "",
    referral_name: "",
    referral_specialty: "",
    referral_address: "",
    referral_phone: "",
  });

  const updateField = useCallback(
    (field: keyof typeof form, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    setMessage(null);

    const referrals: ProviderReferral[] = [];
    if (form.referral_name && form.referral_specialty) {
      referrals.push({
        name: form.referral_name,
        specialty: form.referral_specialty,
        address: form.referral_address || undefined,
        phone: form.referral_phone || undefined,
        matched_condition:
          review.scan_conditions[0]?.name ?? "General dermatology",
      });
    }

    try {
      const res = await fetch(`/api/clinical-reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "in_review",
          diagnosis: form.diagnosis,
          treatment_plan: form.treatment_plan,
          prescription_name: form.prescription_name,
          prescription_dosage: form.prescription_dosage,
          prescription_instructions: form.prescription_instructions,
          provider_referrals: referrals,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Save failed");

      setMessage("Case saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [form, review.id, review.scan_conditions]);

  const handleNotify = useCallback(async () => {
    setNotifying(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/clinical-reviews/${review.id}/notify`, {
        method: "POST",
      });

      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Notify failed");

      setMessage("Patient notified and case marked complete.");
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Notify failed");
    } finally {
      setNotifying(false);
    }
  }, [review.id, router]);

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/dashboard/clinical-reviews")}
        className="flex items-center gap-1 text-sm text-stone-600 hover:text-emerald-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to queue
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Clinical review case</h1>
          <p className="text-sm text-stone-500">ID: {review.id.slice(0, 8)} · Submitted {new Date(review.created_at).toLocaleDateString()}</p>
        </div>
        <StatusBadge status={review.status} />
      </div>

      {message && (
        <Alert className="bg-emerald-50 border-emerald-200">
          <AlertDescription className="text-emerald-700">{message}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <PatientCard review={review} />
          <PhotosCard photos={review.photos} />
          <FindingsCard findings={review.scan_conditions} />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-stone-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-emerald-600" />
                Dermatologist assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Textarea
                  id="diagnosis"
                  value={form.diagnosis}
                  onChange={(e) => updateField("diagnosis", e.target.value)}
                  placeholder="Primary and differential diagnosis"
                  rows={3}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="treatment_plan">Treatment plan</Label>
                <Textarea
                  id="treatment_plan"
                  value={form.treatment_plan}
                  onChange={(e) => updateField("treatment_plan", e.target.value)}
                  placeholder="Step-by-step plan and follow-up instructions"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-stone-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-600" />
                Prescription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prescription_name">Medication</Label>
                  <Input
                    id="prescription_name"
                    value={form.prescription_name}
                    onChange={(e) => updateField("prescription_name", e.target.value)}
                    placeholder="e.g. Clindamycin 1%"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prescription_dosage">Dosage / strength</Label>
                  <Input
                    id="prescription_dosage"
                    value={form.prescription_dosage}
                    onChange={(e) => updateField("prescription_dosage", e.target.value)}
                    placeholder="e.g. Apply thin layer once daily"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prescription_instructions">Instructions</Label>
                <Textarea
                  id="prescription_instructions"
                  value={form.prescription_instructions}
                  onChange={(e) => updateField("prescription_instructions", e.target.value)}
                  placeholder="Application instructions, duration, side effects to watch for"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-stone-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Provider referral
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="referral_name">Provider name</Label>
                  <Input
                    id="referral_name"
                    value={form.referral_name}
                    onChange={(e) => updateField("referral_name", e.target.value)}
                    placeholder="Dr. Smith"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="referral_specialty">Specialty</Label>
                  <Input
                    id="referral_specialty"
                    value={form.referral_specialty}
                    onChange={(e) => updateField("referral_specialty", e.target.value)}
                    placeholder="Dermatology"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="referral_address">Address</Label>
                <Input
                  id="referral_address"
                  value={form.referral_address}
                  onChange={(e) => updateField("referral_address", e.target.value)}
                  placeholder="123 Main St, City, State"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="referral_phone">Phone</Label>
                <Input
                  id="referral_phone"
                  value={form.referral_phone}
                  onChange={(e) => updateField("referral_phone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              variant="outline"
              className="flex-1 py-5 rounded-xl border-stone-300"
            >
              {saving ? (
                <>Saving…</>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save progress
                </>
              )}
            </Button>
            <Button
              onClick={handleNotify}
              disabled={notifying || !form.diagnosis}
              className="flex-1 py-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              {notifying ? (
                <>Notifying…</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Mark complete & notify patient
                </>
              )}
            </Button>
          </div>

          {!form.diagnosis && (
            <p className="text-xs text-amber-600">
              Add a diagnosis before marking the case complete.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ClinicalReviewWithDetails["status"] }) {
  const label = status.replace(/_/g, " ");
  switch (status) {
    case "complete":
      return <Badge className="bg-green-100 text-green-800 border-green-200">{label}</Badge>;
    case "in_review":
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200">{label}</Badge>;
    case "pending_review":
      return <Badge variant="secondary">{label}</Badge>;
    case "cancelled":
      return <Badge variant="destructive">{label}</Badge>;
    default:
      return <Badge variant="outline">{label}</Badge>;
  }
}

function PatientCard({ review }: { review: ClinicalReviewWithDetails }) {
  return (
    <Card className="border-stone-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-600" />
          Patient
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2">
          <span className="font-semibold text-stone-900">{review.patient_name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-stone-600">
          <Mail className="w-4 h-4" />
          {review.patient_email}
        </div>
        {review.patient_phone && (
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <Phone className="w-4 h-4" />
            {review.patient_phone}
          </div>
        )}
        {(review.insurance_provider || review.insurance_policy_number) && (
          <div className="pt-2 border-t border-stone-100 text-sm text-stone-600">
            {review.insurance_provider && <p>Insurance: {review.insurance_provider}</p>}
            {review.insurance_policy_number && <p>Policy: {review.insurance_policy_number}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PhotosCard({ photos }: { photos: ClinicalReviewWithDetails["photos"] }) {
  return (
    <Card className="border-stone-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Photos</CardTitle>
      </CardHeader>
      <CardContent>
        {photos.length === 0 ? (
          <p className="text-sm text-stone-500">No additional photos uploaded.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {photos.map((p) => (
              <div key={p.id} className="aspect-square rounded-lg overflow-hidden border border-stone-200">
                <img
                  src={p.photo_url}
                  alt={p.photo_type}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FindingsCard({ findings }: { findings: FlaggedFinding[] }) {
  return (
    <Card className="border-stone-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Flagged findings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {findings.map((f, i) => (
          <div key={i} className="p-3 rounded-lg bg-stone-50 border border-stone-100">
            <div className="flex items-center justify-between">
              <span className="font-medium text-stone-900">{f.name}</span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  f.severity === "severe"
                    ? "bg-red-100 text-red-800"
                    : f.severity === "moderate"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {f.severity}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">Zone: {f.zone} · Confidence: {Math.round(f.confidence * 100)}%</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
