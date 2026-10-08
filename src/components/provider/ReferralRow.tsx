"use client";

import { Calendar, ChevronRight, Clock, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { SeverityBadge } from "./SeverityBadge";
import type { Referral } from "@/lib/provider/mock-data";

interface ReferralRowProps {
  referral: Referral;
  showActions?: boolean;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
}

export function ReferralRow({ referral, showActions = true, onAccept, onDecline }: ReferralRowProps) {
  return (
    <div className="rounded-2xl border border-[#E7E5E4] bg-white p-4 sm:p-5">
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-stone-900">
              <User className="w-4 h-4 text-stone-400" />
              {referral.userName}
            </span>
            <StatusBadge status={referral.status} />
            <SeverityBadge severity={referral.scan.severity} />
          </div>

          <p className="text-sm text-stone-500 mb-2">
            Conditions:{" "}
            <span className="text-stone-700">
              {referral.scan.conditions.map((c) => `${c.name} (${Math.round(c.confidence * 100)}%)`).join(", ")}
            </span>
          </p>

          {referral.scan.redFlags.length > 0 && (
            <p className="text-sm text-red-700 mb-2">
              Red flags: {referral.scan.redFlags.join(", ")}
            </p>
          )}

          <p className="text-sm text-stone-500 mb-1">
            Recommended: <span className="text-stone-700">{referral.recommendedServices.join(", ")}</span>
          </p>

          <div className="flex items-center gap-4 text-xs text-stone-400 mt-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(referral.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Match score {referral.matchScore}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:flex-col lg:items-end">
          {showActions && referral.status === "new" && (
            <>
              <Button
                size="sm"
                onClick={() => onAccept?.(referral.id)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white"
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDecline?.(referral.id)}
                className="border-stone-200 text-stone-700 hover:bg-stone-50"
              >
                Decline
              </Button>
            </>
          )}
          <Button size="sm" variant="ghost" asChild className="text-emerald-700 hover:bg-emerald-50">
            <Link href={`/provider/referrals/${referral.id}`}>
              Details
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
