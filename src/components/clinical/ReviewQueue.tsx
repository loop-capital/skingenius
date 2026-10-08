"use client";

import Link from "next/link";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClinicalReviewWithDetails } from "@/types/clinical";

interface ReviewQueueProps {
  reviews: ClinicalReviewWithDetails[];
}

function statusBadge(status: ClinicalReviewWithDetails["status"]) {
  switch (status) {
    case "pending_payment":
      return <Badge variant="outline">Pending payment</Badge>;
    case "pending_review":
      return <Badge variant="secondary">Pending review</Badge>;
    case "in_review":
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200">In review</Badge>;
    case "complete":
      return <Badge className="bg-green-100 text-green-800 border-green-200">Complete</Badge>;
    case "cancelled":
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function ReviewQueue({ reviews }: ReviewQueueProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-stone-900">Clinical review queue</h2>
        <div className="text-sm text-stone-500">
          {reviews.length} case{reviews.length !== 1 && "s"}
        </div>
      </div>

      {reviews.length === 0 ? (
        <Card className="border-stone-200">
          <CardContent className="p-8 text-center text-stone-500">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-3 text-emerald-600" />
            <p className="font-medium">Queue is clear</p>
            <p className="text-sm mt-1">No clinical reviews need attention right now.</p>
          </CardContent>
        </Card>
      ) : (
        reviews.map((review) => (
          <Link key={review.id} href={`/dashboard/clinical-reviews/${review.id}`}>
            <Card className="border-stone-200 hover:border-emerald-300 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-stone-900 truncate">
                        {review.patient_name}
                      </span>
                      {statusBadge(review.status)}
                    </div>
                    <p className="text-sm text-stone-500 truncate">{review.patient_email}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {review.scan_conditions.map((c, i) => (
                        <span
                          key={i}
                          className={`text-xs px-2 py-0.5 rounded-full border ${
                            c.severity === "severe"
                              ? "bg-red-100 text-red-800 border-red-200"
                              : c.severity === "moderate"
                              ? "bg-amber-100 text-amber-800 border-amber-200"
                              : "bg-green-100 text-green-800 border-green-200"
                          }`}
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-xs text-stone-500">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                    {review.status !== "complete" && (
                      <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Needs action
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))
      )}
    </div>
  );
}
