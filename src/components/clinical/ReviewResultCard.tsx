"use client";

import {
  Stethoscope,
  Pill,
  MapPin,
  Calendar,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClinicalReviewWithDetails, ProviderReferral } from "@/types/clinical";

interface ReviewResultCardProps {
  review: ClinicalReviewWithDetails;
}

export function ReviewResultCard({ review }: ReviewResultCardProps) {
  const referrals = review.provider_referrals ?? [];

  return (
    <div className="space-y-6">
      <Card className="border-emerald-200 bg-emerald-50/40">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900">Your clinical review is complete</h2>
              <p className="text-sm text-stone-600 mt-1">
                Reviewed by a board-certified dermatologist on{" "}
                {review.completed_at
                  ? new Date(review.completed_at).toLocaleDateString()
                  : new Date(review.updated_at).toLocaleDateString()}
                .
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {review.diagnosis && (
        <Card className="border-stone-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-emerald-600" />
              Diagnosis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-stone-700 whitespace-pre-line">{review.diagnosis}</p>
          </CardContent>
        </Card>
      )}

      {review.treatment_plan && (
        <Card className="border-stone-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Treatment plan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-stone-700 whitespace-pre-line">{review.treatment_plan}</p>
          </CardContent>
        </Card>
      )}

      {(review.prescription_name || review.prescription_dosage || review.prescription_instructions) && (
        <Card className="border-stone-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Pill className="w-4 h-4 text-emerald-600" />
              Prescription recommendation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {review.prescription_name && <p className="text-sm text-stone-900 font-medium">{review.prescription_name}</p>}
            {review.prescription_dosage && <p className="text-sm text-stone-600">{review.prescription_dosage}</p>}
            {review.prescription_instructions && (
              <p className="text-sm text-stone-600">{review.prescription_instructions}</p>
            )}
            <p className="text-xs text-stone-400 italic">
              Bring this to your pharmacist or prescribing provider.
            </p>
          </CardContent>
        </Card>
      )}

      {referrals.length > 0 && (
        <Card className="border-stone-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Provider referrals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {referrals.map((ref: ProviderReferral, i: number) => (
              <div key={i} className="p-3 rounded-lg bg-stone-50 border border-stone-100">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-stone-900">{ref.name}</span>
                  <span className="text-xs text-stone-500">{ref.specialty}</span>
                </div>
                {ref.address && <p className="text-sm text-stone-600 mt-1">{ref.address}</p>}
                {ref.phone && <p className="text-sm text-stone-600">{ref.phone}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Button
        onClick={() => window.open("mailto:appointments@skingenius.example?subject=Follow-up appointment", "_blank")}
        className="w-full py-6 text-base font-semibold rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white"
      >
        <Calendar className="w-4 h-4 mr-2" />
        Book follow-up
        <ExternalLink className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}
