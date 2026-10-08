"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import type {
  ProviderWithServices,
  ProviderType,
  Service,
  AvailableSlot,
} from "@/lib/booking/types";

const TYPE_LABELS: Record<ProviderType, string> = {
  esthetician: "Licensed Esthetician",
  injector_np_pa: "Nurse Injector / NP / PA",
  medical_esthetician: "Medical Esthetician",
  dermatologist: "Dermatologist",
  plastic_surgeon: "Plastic Surgeon",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatSlot(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  return `${s.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })}, ${s.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })} – ${e.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

export default function ProviderBookingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const providerId = String(params.provider_id);
  const canceled = searchParams.get("canceled") === "true";
  const referralId = searchParams.get("referral_id") || undefined;

  const [provider, setProvider] = useState<ProviderWithServices | null>(null);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(canceled ? "Booking canceled." : null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!providerId) return;

    Promise.all([
      fetch(`/api/v1/providers/${providerId}/availability`).then((res) =>
        res.json()
      ),
      fetch(`/api/v1/providers/${providerId}`).then((res) => res.json()),
    ])
      .then(([availabilityJson, providerJson]) => {
        if (providerJson.error) throw new Error(providerJson.detail || providerJson.error);
        if (availabilityJson.error) throw new Error(availabilityJson.detail || availabilityJson.error);

        setProvider(providerJson.provider);
        setSlots(availabilityJson.slots || []);
        if (providerJson.provider?.services?.[0]) {
          setSelectedService(providerJson.provider.services[0]);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [providerId]);

  // Refetch slots when service changes to get duration-specific slots.
  useEffect(() => {
    if (!providerId || !selectedService) return;
    setLoading(true);
    fetch(
      `/api/v1/providers/${providerId}/availability?service_id=${selectedService.id}`
    )
      .then((res) => res.json())
      .then((json) => {
        if (json.error) throw new Error(json.detail || json.error);
        setSlots(json.slots || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [providerId, selectedService?.id]);

  const deposit = useMemo(() => {
    if (!selectedService) return 0;
    return Math.round(selectedService.price * 0.2 * 100) / 100;
  }, [selectedService]);

  const handlePayDeposit = async () => {
    if (!selectedService || !selectedSlot || !provider) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/checkout/square", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider_id: providerId,
          service_id: selectedService.id,
          slot_start: selectedSlot.start,
          slot_end: selectedSlot.end,
          referral_id: referralId,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.detail || json.error || "Checkout failed");
      }

      if (json.checkout_url) {
        window.location.href = json.checkout_url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setSubmitting(false);
    }
  };

  if (loading && !provider) {
    return (
      <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
      </div>
    );
  }

  if (!provider && !loading) {
    return (
      <div className="min-h-screen bg-[#FFFBF5] py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>
              {error || "Provider not found or not bookable."}
            </AlertDescription>
          </Alert>
          <Button variant="ghost" className="mt-4" onClick={() => router.push("/book")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to providers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBF5] py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <Button variant="ghost" onClick={() => router.push("/book")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to providers
        </Button>

        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-stone-100 border border-[#E7E5E4] flex items-center justify-center overflow-hidden shrink-0">
            {provider?.avatar_url ? (
              <img
                src={provider.avatar_url}
                alt={provider.business_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl text-stone-400">
                {provider?.business_name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">
              {provider?.business_name}
            </h1>
            <p className="text-emerald-700">
              {provider && TYPE_LABELS[provider.provider_type]}
            </p>
            {provider?.address && (
              <p className="text-sm text-stone-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                {provider.address}
              </p>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="border-[#E7E5E4]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-700" />
              Select a service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {provider?.services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => {
                    setSelectedService(service);
                    setSelectedSlot(null);
                  }}
                  className={`flex items-center justify-between p-4 rounded-xl border text-left transition-colors ${
                    selectedService?.id === service.id
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-[#E7E5E4] bg-white hover:bg-stone-50"
                  }`}
                >
                  <div>
                    <p className="font-semibold text-stone-900">{service.name}</p>
                    <p className="text-sm text-stone-500">
                      {service.duration_minutes} min
                      {service.description ? ` · ${service.description}` : ""}
                    </p>
                  </div>
                  <p className="font-semibold text-emerald-700">
                    {formatCurrency(service.price)}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E7E5E4]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-700" />
              Select a time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {slots.length === 0 ? (
              <p className="text-stone-500 text-center py-8">
                No available slots in the next 14 days.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                {slots.map((slot, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3 rounded-xl border text-sm text-left transition-colors ${
                      selectedSlot?.start === slot.start
                        ? "border-emerald-600 bg-emerald-50 text-stone-900"
                        : "border-[#E7E5E4] bg-white hover:bg-stone-50 text-stone-700"
                    }`}
                  >
                    {formatSlot(slot.start, slot.end)}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedService && (
          <Card className="border-[#E7E5E4]">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-700" />
                Deposit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-600">Service total</span>
                <span className="font-medium text-stone-900">
                  {formatCurrency(selectedService.price)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-600">Deposit (20%)</span>
                <span className="font-medium text-emerald-700">
                  {formatCurrency(deposit)}
                </span>
              </div>
              <Button
                onClick={handlePayDeposit}
                disabled={!selectedSlot || submitting}
                className="w-full py-6 text-base font-semibold rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Redirecting…
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay {formatCurrency(deposit)} deposit
                  </>
                )}
              </Button>
              <div className="flex items-center justify-center gap-1 text-xs text-stone-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                Secured by Square. Balance due at appointment.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
