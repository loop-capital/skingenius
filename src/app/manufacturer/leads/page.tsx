"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ManufacturerLayout } from "@/components/manufacturer/ManufacturerSidebar";
import { Download, Users, Search } from "lucide-react";

const statuses = ["All", "new", "contacted", "booked", "treated"];

const initialLeads = [
  { id: 1, userId: "user_9812", scanDate: "2026-09-15", condition: "Acne", product: "Sculptra", provider: "DermaGlow NYC", status: "booked" },
  { id: 2, userId: "user_7741", scanDate: "2026-09-15", condition: "Hyperpigmentation", product: "Botox", provider: "SkinScience LA", status: "contacted" },
  { id: 3, userId: "user_3305", scanDate: "2026-09-14", condition: "Fine lines", product: "Sculptra", provider: "Renewal Aesthetics", status: "new" },
  { id: 4, userId: "user_6629", scanDate: "2026-09-14", condition: "Rosacea", product: "Botox", provider: "PureDerm Boston", status: "treated" },
  { id: 5, userId: "user_1150", scanDate: "2026-09-13", condition: "Acne", product: "Sculptra", provider: "DermaGlow NYC", status: "booked" },
  { id: 6, userId: "user_2284", scanDate: "2026-09-13", condition: "Melasma", product: "Juvederm", provider: "SkinScience LA", status: "new" },
  { id: 7, userId: "user_4391", scanDate: "2026-09-12", condition: "Fine lines", product: "Botox", provider: "Aesthetix Miami", status: "contacted" },
  { id: 8, userId: "user_5537", scanDate: "2026-09-12", condition: "Acne", product: "Radiesse", provider: "GlowMed Seattle", status: "booked" },
  { id: 9, userId: "user_8842", scanDate: "2026-09-11", condition: "Hyperpigmentation", product: "Sculptra", provider: "Contour Dallas", status: "treated" },
  { id: 10, userId: "user_1029", scanDate: "2026-09-10", condition: "Rosacea", product: "Kybella", provider: "PureDerm Boston", status: "new" },
];

function statusClasses(status: string) {
  switch (status) {
    case "new":
      return "bg-blue-100 text-blue-700";
    case "contacted":
      return "bg-amber-100 text-amber-700";
    case "booked":
      return "bg-emerald-100 text-emerald-700";
    case "treated":
      return "bg-stone-100 text-stone-700";
    default:
      return "bg-stone-100 text-stone-700";
  }
}

function toCSV(leads: typeof initialLeads) {
  const header = ["user_id", "scan_date", "condition", "product_recommended", "provider_matched", "status"];
  const rows = leads.map((l) => [l.userId, l.scanDate, l.condition, l.product, l.provider, l.status]);
  return [header, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
}

export default function ManufacturerLeadsPage() {
  const [leads, setLeads] = useState(initialLeads);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      const matchesStatus = selectedStatus === "All" || lead.status === selectedStatus;
      const term = search.toLowerCase();
      const matchesSearch =
        lead.userId.toLowerCase().includes(term) ||
        lead.condition.toLowerCase().includes(term) ||
        lead.product.toLowerCase().includes(term) ||
        lead.provider.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [leads, selectedStatus, search]);

  const exportCSV = () => {
    const csv = toCSV(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `skingenius-leads-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const cycleStatus = (id: number) => {
    const order = ["new", "contacted", "booked", "treated"];
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== id) return lead;
        const nextIndex = (order.indexOf(lead.status) + 1) % order.length;
        return { ...lead, status: order[nextIndex] };
      })
    );
  };

  return (
    <ManufacturerLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900">Lead tracking</h1>
            <p className="text-stone-500">Track users from skin scan to treatment.</p>
          </div>
          <Button
            onClick={exportCSV}
            variant="outline"
            className="mt-3 sm:mt-0 rounded-xl border-[#E7E5E4] text-stone-700 hover:bg-stone-50"
          >
            <Download className="mr-1.5 h-4 w-4" />
            Export to CSV
          </Button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  selectedStatus === status
                    ? "bg-emerald-700 text-white"
                    : "bg-white text-stone-600 hover:bg-stone-100 border border-[#E7E5E4]"
                }`}
              >
                {status === "All" ? "All statuses" : status}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              placeholder="Search leads…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 rounded-xl border-[#E7E5E4] bg-white pl-9 focus-visible:ring-emerald-600"
            />
          </div>
        </div>

        <Card className="border-[#E7E5E4] bg-white">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-stone-500">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">User ID</th>
                    <th className="px-6 py-3 text-left font-medium">Scan date</th>
                    <th className="px-6 py-3 text-left font-medium">Condition</th>
                    <th className="px-6 py-3 text-left font-medium">Product recommended</th>
                    <th className="px-6 py-3 text-left font-medium">Provider matched</th>
                    <th className="px-6 py-3 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E4]">
                  {filtered.map((lead) => (
                    <tr key={lead.id} className="hover:bg-stone-50/60">
                      <td className="px-6 py-4 font-medium text-stone-900">{lead.userId}</td>
                      <td className="px-6 py-4 text-stone-700">{lead.scanDate}</td>
                      <td className="px-6 py-4 text-stone-700">{lead.condition}</td>
                      <td className="px-6 py-4 text-stone-700">{lead.product}</td>
                      <td className="px-6 py-4 text-stone-700">{lead.provider}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => cycleStatus(lead.id)}
                          className="cursor-pointer"
                          title="Click to cycle status"
                        >
                          <Badge className={statusClasses(lead.status)}>{lead.status}</Badge>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-stone-500">
                        No leads match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between text-sm text-stone-500">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{filtered.length} lead{filtered.length === 1 ? "" : "s"} shown</span>
          </div>
          <span>Click a status badge to cycle it for demo purposes.</span>
        </div>
      </div>
    </ManufacturerLayout>
  );
}
