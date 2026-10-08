"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar as CalendarIcon, Link2, Unlink, Clock, Save } from "lucide-react";

interface BusinessDay {
  enabled: boolean;
  start: string;
  end: string;
}

interface BusinessHours {
  mon: BusinessDay;
  tue: BusinessDay;
  wed: BusinessDay;
  thu: BusinessDay;
  fri: BusinessDay;
  sat: BusinessDay;
  sun: BusinessDay;
}

const DEFAULT_HOURS: BusinessHours = {
  mon: { enabled: true, start: "09:00", end: "17:00" },
  tue: { enabled: true, start: "09:00", end: "17:00" },
  wed: { enabled: true, start: "09:00", end: "17:00" },
  thu: { enabled: true, start: "09:00", end: "17:00" },
  fri: { enabled: true, start: "09:00", end: "17:00" },
  sat: { enabled: true, start: "10:00", end: "16:00" },
  sun: { enabled: false, start: "09:00", end: "17:00" },
};

const DAY_LABELS: Record<keyof BusinessHours, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export default function ProviderCalendarSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
        </div>
      }
    >
      <ProviderCalendarSettingsInner />
    </Suspense>
  );
}

function ProviderCalendarSettingsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connected, setConnected] = useState(false);
  const [businessHours, setBusinessHours] = useState<BusinessHours>(DEFAULT_HOURS);
  const [bufferMinutes, setBufferMinutes] = useState(15);
  const [defaultDuration, setDefaultDuration] = useState(60);
  const [serviceDurations, setServiceDurations] = useState<Record<string, number>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/v1/provider/calendar/settings");
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load settings");
      setConnected(json.connected);
      setBusinessHours(json.settings.business_hours || DEFAULT_HOURS);
      setBufferMinutes(json.settings.buffer_minutes ?? 15);
      setDefaultDuration(json.settings.default_appointment_minutes ?? 60);
      setServiceDurations(json.settings.service_durations || {});
    } catch (e: any) {
      setMessage({ type: "error", text: e.message });
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/v1/provider/calendar/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_hours: businessHours,
          buffer_minutes: bufferMinutes,
          default_appointment_minutes: defaultDuration,
          service_durations: serviceDurations,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Save failed");
      setMessage({ type: "success", text: "Calendar settings saved." });
    } catch (e: any) {
      setMessage({ type: "error", text: e.message });
    } finally {
      setSaving(false);
    }
  }

  async function disconnect() {
    if (!confirm("Disconnect Google Calendar? Existing appointments remain in your Google Calendar.")) return;
    try {
      const res = await fetch("/api/v1/provider/calendar/disconnect", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Disconnect failed");
      setConnected(false);
      setMessage({ type: "success", text: "Google Calendar disconnected." });
    } catch (e: any) {
      setMessage({ type: "error", text: e.message });
    }
  }

  function updateDay(day: keyof BusinessHours, field: keyof BusinessDay, value: string | boolean) {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  }

  const connectUrl = useMemo(() => {
    const returnUrl = searchParams.get("returnUrl") || "/provider/calendar/settings";
    return `/api/v1/provider/calendar/connect?returnUrl=${encodeURIComponent(returnUrl)}`;
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Calendar Settings</h1>
        <p className="text-stone-500 mt-1">Connect Google Calendar and set your availability.</p>
      </div>

      {message && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
              : "bg-red-50 text-red-800 border border-red-100"
          }`}
        >
          {message.text}
        </div>
      )}

      <Card className="border-[#E7E5E4]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarIcon className="w-5 h-5 text-emerald-700" />
            Google Calendar
          </CardTitle>
          <CardDescription>Sync availability and push bookings to your calendar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-stone-600" />
              </div>
              <div>
                <p className="font-medium text-stone-900">
                  {connected ? "Google Calendar connected" : "Connect Google Calendar"}
                </p>
                <p className="text-sm text-stone-500">
                  {connected
                    ? "Your availability is synced automatically."
                    : "Required so users can book available slots."}
                </p>
              </div>
            </div>
            {connected ? (
              <Button variant="outline" onClick={disconnect} className="border-red-200 text-red-700 hover:bg-red-50">
                <Unlink className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            ) : (
              <Button asChild className="bg-emerald-700 hover:bg-emerald-800 text-white">
                <a href={connectUrl}>Connect</a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#E7E5E4]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-emerald-700" />
            Business Hours
          </CardTitle>
          <CardDescription>Set the days and times you accept appointments.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(Object.keys(DAY_LABELS) as (keyof BusinessHours)[]).map((day) => (
            <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-4 py-3 border-b border-stone-100 last:border-0">
              <div className="flex items-center gap-3 sm:w-40">
                <Switch
                  id={`${day}-enabled`}
                  checked={businessHours[day].enabled}
                  onCheckedChange={(v) => updateDay(day, "enabled", v)}
                />
                <Label htmlFor={`${day}-enabled`} className="font-medium text-stone-900">
                  {DAY_LABELS[day]}
                </Label>
              </div>
              <div className="flex items-center gap-3 flex-1">
                <Input
                  type="time"
                  value={businessHours[day].start}
                  onChange={(e) => updateDay(day, "start", e.target.value)}
                  disabled={!businessHours[day].enabled}
                  className="w-32"
                />
                <span className="text-stone-400">–</span>
                <Input
                  type="time"
                  value={businessHours[day].end}
                  onChange={(e) => updateDay(day, "end", e.target.value)}
                  disabled={!businessHours[day].enabled}
                  className="w-32"
                />
              </div>
            </div>
          ))}

          <Separator className="my-4" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="buffer" className="text-stone-700">
                Buffer between appointments (minutes)
              </Label>
              <Input
                id="buffer"
                type="number"
                min={0}
                max={120}
                value={bufferMinutes}
                onChange={(e) => setBufferMinutes(parseInt(e.target.value || "0", 10))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-stone-700">
                Default appointment duration (minutes)
              </Label>
              <Input
                id="duration"
                type="number"
                min={5}
                value={defaultDuration}
                onChange={(e) => setDefaultDuration(parseInt(e.target.value || "5", 10))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-stone-700">Service durations (override default)</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(serviceDurations).map(([service, minutes]) => (
                <Badge key={service} variant="secondary" className="gap-2 px-3 py-1.5">
                  {service}: {minutes}m
                  <button
                    type="button"
                    onClick={() => {
                      const next = { ...serviceDurations };
                      delete next[service];
                      setServiceDurations(next);
                    }}
                    className="text-stone-500 hover:text-red-600"
                    aria-label={`Remove ${service}`}
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Input
                placeholder="Service name, e.g. HydraFacial"
                className="w-48"
                id="service-name"
              />
              <Input
                type="number"
                min={5}
                placeholder="Min"
                className="w-24"
                id="service-minutes"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const name = (document.getElementById("service-name") as HTMLInputElement)?.value.trim();
                  const minutes = parseInt(
                    (document.getElementById("service-minutes") as HTMLInputElement)?.value || "0",
                    10
                  );
                  if (!name || !minutes) return;
                  setServiceDurations((prev) => ({ ...prev, [name]: minutes }));
                  (document.getElementById("service-name") as HTMLInputElement).value = "";
                  (document.getElementById("service-minutes") as HTMLInputElement).value = "";
                }}
              >
                Add
              </Button>
            </div>
          </div>

          <div className="pt-2">
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
