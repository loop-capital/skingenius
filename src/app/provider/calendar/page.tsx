"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, MapPin, Video, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/provider/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  mockAppointments,
  type Appointment,
  type AppointmentStatus,
  formatTime,
  formatDateTime,
  formatCurrency,
} from "@/lib/provider/mock-data";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ProviderCalendarPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState(mockAppointments);

  const today = useMemo(() => new Date(), []);

  const weekStart = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + weekOffset * 7 - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  }, [today, weekOffset]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const appointmentsByDay = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    for (const apt of appointments) {
      const d = new Date(apt.scheduledStart);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(apt);
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime());
    }
    return map;
  }, [appointments]);

  const updateStatus = (id: string, status: AppointmentStatus) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    setSelectedAppointment((current) => (current && current.id === id ? { ...current, status } : current));
  };

  const weekLabel = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    const fmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
    return `${fmt.format(weekStart)} – ${fmt.format(end)}`;
  }, [weekStart]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Calendar</h1>
          <p className="text-stone-500 mt-1">Week view of your SKINgenius appointments.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekOffset((o) => o - 1)}
            className="border-stone-200 text-stone-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-stone-900 min-w-[140px] text-center">{weekLabel}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekOffset((o) => o + 1)}
            className="border-stone-200 text-stone-700"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setWeekOffset(0)}
            className="text-emerald-700 hover:bg-emerald-50"
          >
            Today
          </Button>
        </div>
      </div>

      <Card className="border-[#E7E5E4]">
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b border-[#E7E5E4]">
            {weekDays.map((day, i) => {
              const isToday =
                day.getFullYear() === today.getFullYear() &&
                day.getMonth() === today.getMonth() &&
                day.getDate() === today.getDate();
              return (
                <div
                  key={i}
                  className={`p-3 text-center border-r border-[#E7E5E4] last:border-r-0 ${
                    isToday ? "bg-emerald-50/50" : ""
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{DAYS[i]}</p>
                  <p className={`text-lg font-bold mt-0.5 ${isToday ? "text-emerald-700" : "text-stone-900"}`}>
                    {day.getDate()}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-7 min-h-[320px]">
            {weekDays.map((day, i) => {
              const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
              const dayAppointments = appointmentsByDay[key] || [];
              const isToday =
                day.getFullYear() === today.getFullYear() &&
                day.getMonth() === today.getMonth() &&
                day.getDate() === today.getDate();
              return (
                <div
                  key={i}
                  className={`p-2 border-r border-[#E7E5E4] last:border-r-0 min-h-[320px] space-y-2 ${
                    isToday ? "bg-emerald-50/20" : ""
                  }`}
                >
                  {dayAppointments.map((apt) => (
                    <button
                      key={apt.id}
                      onClick={() => setSelectedAppointment(apt)}
                      className="w-full text-left p-3 rounded-xl bg-white border border-[#E7E5E4] hover:border-emerald-300 hover:shadow-sm transition-all"
                    >
                      <p className="text-xs font-semibold text-stone-900">{formatTime(apt.scheduledStart)}</p>
                      <p className="text-sm text-stone-700 mt-0.5 truncate">{apt.service}</p>
                      <p className="text-xs text-stone-500 truncate">{apt.userName}</p>
                      <div className="mt-2">
                        <StatusBadge status={apt.status} />
                      </div>
                    </button>
                  ))}
                  {dayAppointments.length === 0 && (
                    <p className="text-xs text-stone-300 text-center mt-8">No appointments</p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        {selectedAppointment && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-stone-900">{selectedAppointment.service}</DialogTitle>
              <p className="text-sm text-stone-500">{formatDateTime(selectedAppointment.scheduledStart)}</p>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 font-semibold">
                  {selectedAppointment.userName.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-900">{selectedAppointment.userName}</p>
                  <StatusBadge status={selectedAppointment.status} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-stone-50 border border-[#E7E5E4]/60">
                  <p className="text-xs text-stone-500 uppercase tracking-wide font-semibold">Total</p>
                  <p className="text-lg font-bold text-stone-900">{formatCurrency(selectedAppointment.price)}</p>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-[#E7E5E4]/60">
                  <p className="text-xs text-stone-500 uppercase tracking-wide font-semibold">Deposit</p>
                  <p className="text-lg font-bold text-stone-900">{formatCurrency(selectedAppointment.deposit)}</p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm text-stone-600">
                {selectedAppointment.locationType === "virtual" ? (
                  <>
                    <Video className="w-4 h-4 mt-0.5 text-stone-400" />
                    <span>Virtual appointment</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 mt-0.5 text-stone-400" />
                    <span>{selectedAppointment.address}</span>
                  </>
                )}
              </div>

              {selectedAppointment.internalNotes && (
                <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
                  <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Provider note</p>
                  <p className="text-sm text-amber-900 mt-1">{selectedAppointment.internalNotes}</p>
                </div>
              )}

              {selectedAppointment.status === "confirmed" && (
                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    className="bg-emerald-700 hover:bg-emerald-800 text-white"
                    onClick={() => updateStatus(selectedAppointment.id, "completed")}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Mark Completed
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50"
                    onClick={() => updateStatus(selectedAppointment.id, "no_show")}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Mark No-Show
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
