"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Pill, AlertCircle, Clock, Info } from "lucide-react";

interface Supplement {
  id?: string;
  name?: string;
  dosage?: string;
  evidence_level?: string;
  relevance_score?: number;
  benefits?: string[];
  timing?: string;
}

interface Peptide {
  id?: string;
  name?: string;
  tier?: number;
  route?: string;
  dosage?: string;
  frequency?: string;
  evidence_level?: string;
  regulatory_status?: string;
  relevance_score?: number;
  skin_benefits?: string[];
}

interface SupplementStackProps {
  supplements: Array<Record<string, unknown>>;
  peptides: Array<Record<string, unknown>>;
}

export function SupplementStack({
  supplements,
  peptides,
}: SupplementStackProps) {
  const [selectedSupplement, setSelectedSupplement] =
    React.useState<Supplement | null>(null);

  const morningSupps = supplements.filter(
    (s) => (s.timing as string)?.includes("morning") || !(s.timing as string),
  );
  const eveningSupps = supplements.filter((s) =>
    (s.timing as string)?.includes("evening"),
  );
  const mealSupps = supplements.filter((s) =>
    (s.timing as string)?.includes("meal"),
  );

  const topicalPeptides = peptides.filter(
    (p) => (p.route as string) === "topical",
  );
  const advancedPeptides = peptides.filter((p) => (p.tier as number) >= 2);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Pill className="h-5 w-5 text-primary" />
              Supplement Stack
            </CardTitle>
            <Badge variant="outline">{supplements.length} items</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Morning */}
          {morningSupps.length > 0 && (
            <TimingGroup
              title="Morning"
              icon={<Clock className="h-4 w-4" />}
              items={morningSupps}
            />
          )}

          {/* With Meals */}
          {mealSupps.length > 0 && (
            <TimingGroup
              title="With Meals"
              icon={<Clock className="h-4 w-4" />}
              items={mealSupps}
            />
          )}

          {/* Evening */}
          {eveningSupps.length > 0 && (
            <TimingGroup
              title="Evening"
              icon={<Clock className="h-4 w-4" />}
              items={eveningSupps}
            />
          )}

          {selectedSupplement && (
            <SupplementDetailModal
              supplement={selectedSupplement}
              onClose={() => setSelectedSupplement(null)}
            />
          )}
        </CardContent>
      </Card>

      {/* Peptides Section */}
      {(topicalPeptides.length > 0 || advancedPeptides.length > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Peptide Protocol</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topicalPeptides.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Badge variant="secondary">Tier 1</Badge> Topical —
                  Well-Established
                </p>
                <div className="grid gap-2">
                  {topicalPeptides.map((pep) => (
                    <PeptideCard
                      key={String(pep.id)}
                      peptide={pep as Peptide}
                    />
                  ))}
                </div>
              </div>
            )}

            {advancedPeptides.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Badge variant="destructive">Tier 2+</Badge> Advanced —
                  Consult Provider
                </p>
                <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-900 dark:bg-amber-950/20">
                  <p className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    These peptides are not FDA-approved for these uses. Consult
                    a licensed healthcare provider before use.
                  </p>
                </div>
                <div className="grid gap-2">
                  {advancedPeptides.map((pep) => (
                    <PeptideCard
                      key={String(pep.id)}
                      peptide={pep as Peptide}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TimingGroup({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: Array<Record<string, unknown>>;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
        {icon} {title}
      </p>
      <div className="grid gap-2">
        {items.map((item) => (
          <SupplementRow
            key={String(item.id)}
            supplement={item as Supplement}
          />
        ))}
      </div>
    </div>
  );
}

function SupplementRow({ supplement }: { supplement: Supplement }) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{supplement.name}</p>
          <p className="text-xs text-muted-foreground">{supplement.dosage}</p>
        </div>
        <div className="flex items-center gap-2">
          {supplement.evidence_level && (
            <Badge variant="outline" className="text-xs">
              {supplement.evidence_level}
            </Badge>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-full p-1 hover:bg-muted"
          >
            <Info className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-2 border-t pt-2">
          {supplement.relevance_score && (
            <div className="mb-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Relevance</span>
                <span className="font-medium">
                  {supplement.relevance_score}/100
                </span>
              </div>
              <Progress
                value={supplement.relevance_score}
                className="mt-1 h-1.5"
              />
            </div>
          )}
          {supplement.benefits && supplement.benefits.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {supplement.benefits.map((b, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {b}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PeptideCard({ peptide }: { peptide: Peptide }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{peptide.name}</p>
          <p className="text-xs text-muted-foreground">
            {peptide.dosage} • {peptide.frequency}
          </p>
        </div>
        <Badge
          variant={peptide.tier === 1 ? "secondary" : "destructive"}
          className="text-xs"
        >
          {peptide.route}
        </Badge>
      </div>
      {peptide.skin_benefits && peptide.skin_benefits.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {peptide.skin_benefits.map((b, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {b}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function SupplementDetailModal({
  supplement,
  onClose,
}: {
  supplement: Supplement;
  onClose: () => void;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <p className="font-medium">{supplement.name}</p>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      </div>
      <p className="text-sm text-muted-foreground mt-1">{supplement.dosage}</p>
    </div>
  );
}
