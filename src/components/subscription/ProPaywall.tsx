"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, X, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProPaywallProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: string;
}

const FEATURES = [
  { label: "Scans per month", free: "4", pro: "Unlimited" },
  { label: "Ads", free: "Yes", pro: "None" },
  { label: "Conditions tracked", free: "5", pro: "25" },
  { label: "Provider referrals", free: "—", pro: "Included" },
  { label: "Full analysis report", free: "Limited", pro: "Full access" },
];

export function ProPaywall({ open, onOpenChange, trigger }: ProPaywallProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Checkout failed. Please try again.");
        return;
      }
      if (data.url) {
        router.push(data.url);
      } else {
        setError("No checkout URL returned.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-stone-200">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">SKINgenius Pro</span>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-full p-1 hover:bg-white/20"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <DialogHeader className="mt-4 space-y-1 text-left">
            <DialogTitle className="text-xl font-bold text-white">
              Upgrade to Pro
            </DialogTitle>
            <DialogDescription className="text-emerald-50">
              {trigger
                ? `${trigger} is a Pro feature.`
                : "Unlock the full SKINgenius experience."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          <div className="rounded-xl border border-stone-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-stone-500">
                    Feature
                  </th>
                  <th className="px-4 py-2 text-center font-medium text-stone-500">
                    Free
                  </th>
                  <th className="px-4 py-2 text-center font-medium text-emerald-700">
                    Pro
                  </th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((feature, index) => (
                  <tr
                    key={feature.label}
                    className={cn(
                      "border-t border-stone-100",
                      index % 2 === 1 ? "bg-stone-50/50" : "bg-white"
                    )}
                  >
                    <td className="px-4 py-2.5 text-stone-700">
                      {feature.label}
                    </td>
                    <td className="px-4 py-2.5 text-center text-stone-500">
                      {feature.free}
                    </td>
                    <td className="px-4 py-2.5 text-center font-medium text-emerald-700">
                      <span className="inline-flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" />
                        {feature.pro}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center space-y-1">
            <p className="text-3xl font-bold text-stone-900">$4.99</p>
            <p className="text-sm text-stone-500">per month</p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleUpgrade}
              disabled={loading}
              className="h-12 w-full bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Start Free Trial"
              )}
              <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                7 days free
              </span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="text-stone-500 hover:text-stone-700"
            >
              Maybe Later
            </Button>
          </div>

          <p className="text-center text-xs text-stone-400">
            Cancel anytime. Subscription managed through Stripe.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
