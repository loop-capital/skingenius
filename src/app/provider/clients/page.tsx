"use client";

import { useMemo, useState } from "react";
import { Search, Calendar, FileText, Stethoscope, UserCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SeverityBadge } from "@/components/provider/SeverityBadge";
import {
  mockClients,
  type Client,
  formatDate,
  formatCurrency,
  formatTime,
} from "@/lib/provider/mock-data";

export default function ProviderClientsPage() {
  const [query, setQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return mockClients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.conditions.some((cond) => cond.toLowerCase().includes(q)) ||
        c.email?.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Clients
          </h1>
          <p className="text-stone-500 mt-1">
            Past clients, appointment history, and shared scan results.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            placeholder="Search clients or conditions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 bg-white border-[#E7E5E4] rounded-xl focus-visible:ring-emerald-500"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E7E5E4] bg-white p-12 text-center">
          <UserCircle className="w-8 h-8 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-900 font-medium">No clients found.</p>
          <p className="text-sm text-stone-500 mt-1">
            Try a different search term.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((client) => (
            <button
              key={client.id}
              onClick={() => setSelectedClient(client)}
              className="text-left rounded-2xl border border-[#E7E5E4] bg-white p-5 hover:border-emerald-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 font-semibold shrink-0">
                  {client.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-900 truncate">
                    {client.name}
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Last visit: {formatDate(client.lastVisit)}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {client.conditions.map((condition) => (
                      <Badge
                        key={condition}
                        variant="secondary"
                        className="bg-stone-100 text-stone-700 hover:bg-stone-100"
                      >
                        {condition}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-xs text-stone-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {client.totalVisits} visits
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {client.notes.length} notes
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <Dialog
        open={!!selectedClient}
        onOpenChange={() => setSelectedClient(null)}
      >
        {selectedClient && (
          <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-stone-900 flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 font-semibold text-sm">
                  {selectedClient.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                {selectedClient.name}
              </DialogTitle>
              {selectedClient.email && (
                <p className="text-sm text-stone-500">{selectedClient.email}</p>
              )}
            </DialogHeader>

            <div className="space-y-5 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-stone-50 border border-[#E7E5E4]/60">
                  <p className="text-xs text-stone-500 uppercase tracking-wide font-semibold">
                    First visit
                  </p>
                  <p className="text-sm font-semibold text-stone-900 mt-1">
                    {formatDate(selectedClient.firstVisit)}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-[#E7E5E4]/60">
                  <p className="text-xs text-stone-500 uppercase tracking-wide font-semibold">
                    Total visits
                  </p>
                  <p className="text-sm font-semibold text-stone-900 mt-1">
                    {selectedClient.totalVisits}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-stone-900 mb-2 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-stone-400" />
                  Conditions
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedClient.conditions.map((condition) => (
                    <Badge
                      key={condition}
                      variant="secondary"
                      className="bg-stone-100 text-stone-700 hover:bg-stone-100"
                    >
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>

              <Card className="border-[#E7E5E4]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-stone-900">
                    Visit History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedClient.appointments.length === 0 ? (
                    <p className="text-sm text-stone-500 py-4 text-center">
                      No recorded appointments.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {selectedClient.appointments
                        .sort(
                          (a, b) =>
                            new Date(b.scheduledStart).getTime() -
                            new Date(a.scheduledStart).getTime()
                        )
                        .map((apt) => (
                          <div
                            key={apt.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-[#E7E5E4]/60"
                          >
                            <div>
                              <p className="text-sm font-semibold text-stone-900">
                                {apt.service}
                              </p>
                              <p className="text-xs text-stone-500">
                                {formatDate(apt.scheduledStart)} ·{" "}
                                {formatTime(apt.scheduledStart)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-stone-900">
                                {formatCurrency(apt.price)}
                              </p>
                              <p className="text-xs text-stone-500 capitalize">
                                {apt.status.replace("_", " ")}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-[#E7E5E4]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-stone-900">
                    Shared Scan Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedClient.sharedScans.length === 0 ? (
                    <p className="text-sm text-stone-500 py-4 text-center">
                      No scans shared yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {selectedClient.sharedScans.map((scan, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-stone-50 border border-[#E7E5E4]/60"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-semibold text-stone-900">
                              {formatDate(scan.date)}
                            </p>
                            <SeverityBadge severity={scan.severity as any} />
                          </div>
                          <p className="text-xs text-stone-500">
                            {scan.conditions.join(", ")}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-[#E7E5E4]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-stone-900">
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedClient.notes.length === 0 ? (
                    <p className="text-sm text-stone-500 py-4 text-center">
                      No provider notes yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {selectedClient.notes
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime()
                        )
                        .map((note) => (
                          <div
                            key={note.id}
                            className="p-3 rounded-xl bg-amber-50 border border-amber-100"
                          >
                            <p className="text-sm text-stone-900">
                              {note.text}
                            </p>
                            <p className="text-xs text-stone-500 mt-1">
                              {formatDate(note.createdAt)}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full border-stone-200 text-stone-700 hover:bg-stone-50"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Add Note
                  </Button>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
