"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Calendar, Clock, Loader2, AlertCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Appointment } from "@/lib/booking/types";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function BookingConfirmationContent() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointment_id");
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appointmentId) {
      setLoading(false);
      return;
    }

    fetch(`/api/v1/appointments?id=${appointmentId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) throw new Error(json.detail || json.error);
        setAppointment(json.appointment || null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [appointmentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
      </div>
    );
  }

  if (!appointmentId || !appointment) {
    return (
      <div className="min-h-screen bg-[#FFFBF5] py-12 px-4">
        <div className="max-w-md mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              {error || "No appointment found."}
            </AlertDescription>
          </Alert>
          <Button asChild className="mt-6 w-full bg-emerald-700 hover:bg-emerald-800">
            <Link href="/book">
              <Home className="w-4 h-4 mr-2" />
              Back to booking
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBF5] py-12 px-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Deposit paid</h1>
          <p className="text-stone-600">
            Your appointment is pending confirmation from the provider.
          </p>
        </div>

        <Card className="border-[#E7E5E4]">
          <CardHeader>
            <CardTitle className="text-lg">Appointment details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-emerald-700 mt-0.5" />
              <div>
                <p className="text-sm text-stone-500">Service</p>
                <p className="font-medium text-stone-900">{appointment.service}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-emerald-700 mt-0.5" />
              <div>
                <p className="text-sm text-stone-500">Date & time</p>
                <p className="font-medium text-stone-900">
                  {formatDateTime(appointment.scheduled_start)}
                </p>
              </div>
            </div>
            {appointment.deposit_amount && (
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold mt-0.5">
                  $
                </div>
                <div>
                  <p className="text-sm text-stone-500">Deposit paid</p>
                  <p className="font-medium text-emerald-700">
                    {formatCurrency(appointment.deposit_amount)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          className="w-full bg-emerald-700 hover:bg-emerald-800"
          onClick={() => (window.location.href = "/book")}
        >
          <Home className="w-4 h-4 mr-2" />
          Done
        </Button>
      </div>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-emerald-700" /></div>}>
      <BookingConfirmationContent />
    </Suspense>
  );
}
