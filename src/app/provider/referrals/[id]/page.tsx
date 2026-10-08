"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SeverityBadge } from "@/components/provider/SeverityBadge";
import { StatusBadge } from "@/components/provider/StatusBadge";
import {
  mockReferrals,
  formatDate,
  formatCurrency,
} from "@/lib/provider/mock-data";

export default function ReferralDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : params?.id?.[0];
  const referral = mockReferrals.find((r) => r.id === id);

  if (!referral) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <AlertCircle className="w-10 h-10 text-stone-300 mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-stone-900">Referral not found</h1>
        <p className="text-stone-500 mt-2 mb-6">The referral you are looking for does not exist.</p>
        <Button asChild className="bg-emerald-700 hover:bg-emerald-800 text-white">
          <Link href="/provider/referrals">Back to referrals</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="text-stone-600 hover:text-stone-900 hover:bg-stone-100 -ml-2"
      >
        <Link href="/provider/referrals">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to referrals
        </Link>
      </Button>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
          Incoming Referral
        </h1>
        <StatusBadge status={referral.status} />
      </div>

      <Card className="border-[#E7E5E4]">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-stone-900">
            From: {referral.userName}
          </CardTitle>
          <p className="text-sm text-stone-500">Received {formatDate(referral.createdAt)}</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-stone-50 border border-[#E7E5E4]/60">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">
                Severity
              </p>
              <SeverityBadge severity={referral.scan.severity} />
            </div>
            <div className="p-4 rounded-xl bg-stone-50 border border-[#E7E5E4]/60">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">
                Match Score
              </p>
              <p className="text-2xl font-bold text-emerald-700">{referral.matchScore}%</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-stone-900 mb-2">Scan Summary</p>
            <div className="space-y-2">
              {referral.scan.conditions.map((condition) => (
                <div
                  key={condition.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E7E5E4]"
                >
                  <span className="text-sm font-medium text-stone-900">{condition.name}</span>
                  <span className="text-sm text-stone-500">{Math.round(condition.confidence * 100)}% confidence</span>
                </div>
              ))}
            </div>
          </div>

          {referral.scan.redFlags.length > 0 && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900">Red flags</p>
                  <p className="text-sm text-red-800">{referral.scan.redFlags.join(", ")}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-semibold text-stone-900 mb-2">Recommended Services</p>
            <div className="flex flex-wrap gap-2">
              {referral.recommendedServices.map((service) => (
                <Badge
                  key={service}
                  variant="secondary"
                  className="bg-stone-100 text-stone-700 hover:bg-stone-100"
                >
                  {service}
                </Badge>
              ))}
            </div>
          </div>

          {referral.status === "new" && (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button className="bg-emerald-700 hover:bg-emerald-800 text-white">
                <Check className="w-4 h-4 mr-1" />
                Accept Referral
              </Button>
              <Button variant="outline" className="border-stone-200 text-stone-700 hover:bg-stone-50">
                <X className="w-4 h-4 mr-1" />
                Decline
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
