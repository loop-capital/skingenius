"use client";

import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Stethoscope,
  ClipboardList,
  Pill,
  MapPin,
  Clock,
  ShieldCheck,
  Award,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FlaggedFinding } from "@/types/clinical";

interface ClinicalReviewPromptProps {
  scanId: string;
  findings: FlaggedFinding[];
}

function severityColor(severity: FlaggedFinding["severity"]) {
  switch (severity) {
    case "mild":
      return "bg-green-100 text-green-800 border-green-200";
    case "moderate":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "severe":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-stone-100 text-stone-800 border-stone-200";
  }
}

export function ClinicalReviewPrompt({ scanId, findings }: ClinicalReviewPromptProps) {
  const router = useRouter();

  return (
    <Card className="border-red-200 bg-red-50/60">
      <CardContent className="p-5 space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-stone-900">
              Clinical review recommended
            </h3>
            <p className="text-sm text-stone-600 mt-1">
              This scan shows something that needs clinical attention. A board-certified dermatologist can review your photos and give you a personalized plan.
            </p>
          </div>
        </div>

        {findings.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Flagged findings
            </p>
            <div className="flex flex-wrap gap-2">
              {findings.map((f, i) => (
                <span
                  key={`${f.name}-${i}`}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${severityColor(f.severity)}`}
                >
                  {f.name}
                  <span className="opacity-80">· {f.severity}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs text-stone-600">
          <div className="flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
            Detailed analysis
          </div>
          <div className="flex items-center gap-1.5">
            <ClipboardList className="w-3.5 h-3.5 text-emerald-600" />
            Treatment plan
          </div>
          <div className="flex items-center gap-1.5">
            <Pill className="w-3.5 h-3.5 text-emerald-600" />
            Prescription if needed
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            Provider referral
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-stone-600">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          48-hour turnaround guarantee
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
          <div className="flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            Board-certified dermatologists
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            HIPAA compliant
          </div>
        </div>

        <Button
          onClick={() => router.push(`/scan/clinical-review?scan_id=${scanId}`)}
          className="w-full py-5 text-sm font-semibold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white"
        >
          Get Clinical Review — $49
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
