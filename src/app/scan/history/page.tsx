"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronRight,
  TrendingUp,
  ScanFace,
  BarChart3,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { sampleScanHistory } from "@/lib/scan/sampleScanData";

// -----------------------------------------------------------------------------
// HARDCODED SAMPLE DATA
// -----------------------------------------------------------------------------
// The history list is loaded from sampleScanHistory. Replace this with a real
// fetch to /api/v1/scan/history when the API is ready:
//
// const [history, setHistory] = useState<ScanHistoryItem[]>([]);
// const [loading, setLoading] = useState(true);
// const [error, setError] = useState<string | null>(null);
//
// useEffect(() => {
//   fetch("/api/v1/scan/history")
//     .then((r) => r.json())
//     .then((json) => { if (json.error) throw new Error(json.error); setHistory(json.data); })
//     .catch((e) => setError(e.message))
//     .finally(() => setLoading(false));
// }, []);
// -----------------------------------------------------------------------------

function scoreTint(score: number): string {
  if (score >= 80) return "text-[#1FA856]";
  if (score >= 60) return "text-[#B87A1A]";
  return "text-[#C41D3A]";
}

function scoreBgTint(score: number): string {
  if (score >= 80) return "bg-[#E8FAF0]";
  if (score >= 60) return "bg-[#FFF5E6]";
  return "bg-[#FDE8EB]";
}

export default function ScanHistoryPage() {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const sortedHistory = [...sampleScanHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const compared = sortedHistory.filter((h) => selectedIds.includes(h.scan_id ?? ""));

  const trendData = sortedHistory
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((h) => ({ date: h.date, score: h.overall_score ?? 0 }));

  const minScore = Math.min(...trendData.map((d) => d.score), 100);
  const maxScore = Math.max(...trendData.map((d) => d.score), 0);
  const range = Math.max(maxScore - minScore, 1);

  return (
    <div className="flex flex-col min-h-[100dvh] px-6 pb-24">
      <header className="pt-8 pb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-stone-600 mb-6 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center">
            <CalendarIcon className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-stone-900">SKINgenius</span>
        </div>
        <h1 className="text-3xl font-bold text-stone-900 tracking-tight mb-2">
          Scan History
        </h1>
        <p className="text-stone-600 text-sm">
          Track your skin health progress over time.
        </p>
      </header>

      <main className="flex-1 space-y-8">
        {/* Trend graph */}
        <section>
          <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Score Trend
          </h2>
          <Card className="border-stone-200">
            <CardContent className="p-4">
              <div className="flex items-end gap-2 h-40 px-2">
                {trendData.map((d, i) => {
                  const height = ((d.score - minScore) / range) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full relative flex-1 flex items-end">
                        <div
                          className={`w-full rounded-t-md ${scoreBgTint(d.score)}`}
                          style={{ height: `${Math.max(height, 8)}%` }}
                        />
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-semibold text-stone-700">
                          {d.score}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-500 font-medium">
                        {new Date(d.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Calendar view */}
        <section>
          <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Scan Calendar
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sortedHistory.map((scan) => {
              const isSelected = selectedIds.includes(scan.scan_id ?? "");
              return (
                <Card
                  key={scan.scan_id}
                  onClick={() => toggleSelection(scan.scan_id ?? "")}
                  className={`border cursor-pointer transition-colors ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-stone-200 hover:border-emerald-300"
                  }`}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-stone-600">
                        {new Date(scan.date).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <Badge
                        className={`${scoreBgTint(scan.overall_score ?? 0)} ${scoreTint(
                          scan.overall_score ?? 0
                        )} border-0`}
                      >
                        {scan.overall_score}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-stone-700">
                      <ScanFace className="w-4 h-4 text-stone-500" />
                      <span className="capitalize">
                        {scan.primary_concern?.replace(/_/g, " ") ?? "No concern"}
                      </span>
                    </div>
                    {scan.urgent_flag && (
                      <Badge className="bg-[#C41D3A] text-white border-0 text-[10px]">
                        Urgent
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-emerald-700 hover:bg-emerald-50 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/scan/results/${scan.scan_id}`);
                      }}
                    >
                      View results
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Compare action bar */}
        {selectedIds.length === 2 && (
          <div className="sticky bottom-20 z-10">
            <Button
              onClick={() => setCompareOpen(true)}
              className="w-full py-5 text-base font-semibold rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              Compare {new Date(compared[0]?.date ?? "").toLocaleDateString()} vs{" "}
              {new Date(compared[1]?.date ?? "").toLocaleDateString()}
            </Button>
          </div>
        )}

        {/* Compare modal */}
        {compareOpen && compared.length === 2 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40">
            <Card className="w-full max-w-2xl border-stone-200 bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Side-by-Side Comparison</CardTitle>
                  <button
                    onClick={() => setCompareOpen(false)}
                    className="p-1 rounded-full hover:bg-stone-100"
                  >
                    <X className="w-5 h-5 text-stone-600" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {compared.map((scan) => (
                    <div key={scan.scan_id} className="space-y-4">
                      <div className="text-center">
                        <p className="text-sm font-semibold text-stone-700">{scan.date}</p>
                        <p className={`text-4xl font-bold ${scoreTint(scan.overall_score ?? 0)}`}>
                          {scan.overall_score}
                        </p>
                        <p className="text-xs text-stone-500">Overall score</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                          Detected conditions
                        </p>
                        {scan.conditions?.map((c) => (
                          <div
                            key={c.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-stone-700">{c.name}</span>
                            <Badge
                              className={`${
                                c.severity === "mild"
                                  ? "bg-[#E8FAF0] text-[#1FA856]"
                                  : c.severity === "moderate"
                                  ? "bg-[#FFF5E6] text-[#B87A1A]"
                                  : "bg-[#FDE8EB] text-[#C41D3A]"
                              } border-0 text-[10px]`}
                            >
                              {c.severity}
                            </Badge>
                          </div>
                        ))}
                      </div>
                      {scan.urgent_flag && (
                        <Badge className="bg-[#C41D3A] text-white border-0 w-full justify-center">
                          Urgent
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button
                    onClick={() => {
                      setCompareOpen(false);
                      router.push(`/scan/results/${compared[1]?.scan_id}`);
                    }}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl"
                  >
                    View latest results
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
