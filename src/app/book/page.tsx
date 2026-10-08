"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Loader2, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ProviderWithServices, ProviderType } from "@/lib/booking/types";

const TYPE_LABELS: Record<ProviderType, string> = {
  esthetician: "Licensed Esthetician",
  injector_np_pa: "Nurse Injector / NP / PA",
  medical_esthetician: "Medical Esthetician",
  dermatologist: "Dermatologist",
  plastic_surgeon: "Plastic Surgeon",
};

export default function BookPage() {
  const [providers, setProviders] = useState<ProviderWithServices[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/providers")
      .then((res) => res.json())
      .then((json) => {
        if (json.error) throw new Error(json.detail || json.error);
        setProviders(json.providers || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFBF5] py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">
            Book a Provider
          </h1>
          <p className="text-stone-600 max-w-xl mx-auto">
            Choose a licensed skincare professional. Physician bookings are coming soon.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
          </div>
        ) : providers.length === 0 ? (
          <Card className="border-[#E7E5E4]">
            <CardContent className="py-16 text-center space-y-4">
              <Calendar className="w-12 h-12 text-stone-300 mx-auto" />
              <p className="text-stone-600">No bookable providers are available right now.</p>
              <p className="text-sm text-stone-500">
                Physician bookings are coming soon.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {providers.map((provider) => (
              <Card
                key={provider.id}
                className="border-[#E7E5E4] hover:border-emerald-300 transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-stone-100 border border-[#E7E5E4] flex items-center justify-center overflow-hidden shrink-0">
                      {provider.avatar_url ? (
                        <img
                          src={provider.avatar_url}
                          alt={provider.business_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl text-stone-400">
                          {provider.business_name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-lg font-semibold text-stone-900 truncate">
                        {provider.business_name}
                      </CardTitle>
                      <p className="text-sm text-emerald-700">
                        {TYPE_LABELS[provider.provider_type]}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {provider.bio && (
                    <p className="text-sm text-stone-600 line-clamp-3">{provider.bio}</p>
                  )}
                  {provider.address && (
                    <div className="flex items-start gap-2 text-sm text-stone-500">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{provider.address}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-stone-500">
                      {provider.services.length} service
                      {provider.services.length !== 1 ? "s" : ""}
                    </span>
                    <Button asChild size="sm" className="bg-emerald-700 hover:bg-emerald-800">
                      <Link href={`/book/${provider.id}`}>Book now</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-100 text-stone-600 text-sm">
            <Stethoscope className="w-4 h-4" />
            Physician bookings (dermatologists & plastic surgeons) coming soon
          </div>
        </div>
      </div>
    </div>
  );
}
