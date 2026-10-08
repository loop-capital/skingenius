"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  Sparkles,
  AlertTriangle,
  Check,
  CreditCard,
  Receipt,
  Calendar,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { isPro } from "@/lib/subscription";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SubscriptionPage(): React.ReactElement {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    }>
      <SubscriptionPageInner />
    </Suspense>
  );
}

function SubscriptionPageInner(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const subscription = useSubscription();
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  const successParam = searchParams.get("success");
  const canceledParam = searchParams.get("canceled");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?redirectTo=/account/subscription");
    }
  }, [authLoading, isAuthenticated, router]);

  const openCustomerPortal = useCallback(async () => {
    setPortalLoading(true);
    setPortalError(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setPortalError(data.error ?? "Could not open billing portal.");
        return;
      }
      if (data.url) {
        router.push(data.url);
      } else {
        setPortalError("No portal URL returned.");
      }
    } catch (err) {
      setPortalError(err instanceof Error ? err.message : "Portal failed.");
    } finally {
      setPortalLoading(false);
    }
  }, [router]);

  if (authLoading || subscription.isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!isAuthenticated) return <div className="min-h-screen bg-stone-50" />;

  const pro = isPro(subscription.tier);

  return (
    <div className="min-h-screen bg-stone-50 pb-12">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-900">Subscription</h1>
              <p className="text-sm text-stone-500">
                Manage your SKINgenius plan and billing.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {successParam === "true" && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
            <Check className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Welcome to Pro</p>
              <p className="text-sm text-emerald-700">
                Your subscription is active. Enjoy unlimited scans and full analysis access.
              </p>
            </div>
          </div>
        )}

        {canceledParam === "true" && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Checkout canceled</p>
              <p className="text-sm text-amber-700">
                You can upgrade anytime from this page.
              </p>
            </div>
          </div>
        )}

        {subscription.error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {subscription.error}
          </div>
        )}

        {portalError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {portalError}
          </div>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-stone-900">
              <Crown className="h-4 w-4 text-emerald-600" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-stone-900">
                  {pro ? "Pro" : "Free"}
                </p>
                <p className="text-sm text-stone-500">
                  {pro ? "$4.99/month" : "$0/month"}
                </p>
              </div>
              {pro && (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                  Active
                </span>
              )}
            </div>

            {pro && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm text-stone-600">
                  <Calendar className="h-4 w-4 text-stone-400" />
                  Current period ends {formatDate(subscription.currentPeriodEnd)}
                </div>
                {subscription.trialEnd && (
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <Sparkles className="h-4 w-4 text-stone-400" />
                    Trial ends {formatDate(subscription.trialEnd)}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-stone-900">
                <CreditCard className="h-4 w-4 text-emerald-600" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-stone-600">
                Update your card or change payment details in the Stripe billing portal.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={openCustomerPortal}
                disabled={portalLoading || !pro}
              >
                {portalLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Update Payment Method"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-stone-900">
                <Receipt className="h-4 w-4 text-emerald-600" />
                Billing History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-stone-600">
                View invoices, receipts, and past payments.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={openCustomerPortal}
                disabled={portalLoading || !pro}
              >
                {portalLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "View Billing History"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {pro && (
          <Card className="border-red-100">
            <CardContent className="py-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-stone-900">Cancel subscription</p>
                  <p className="text-sm text-stone-500">
                    You will keep Pro access until the end of your current billing period.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-red-200 text-red-700 hover:bg-red-50"
                  onClick={openCustomerPortal}
                  disabled={portalLoading}
                >
                  Cancel Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
