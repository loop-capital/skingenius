"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlanOverview } from "./PlanOverview";
import { DietProtocolCard } from "./DietProtocolCard";
import { SupplementStack } from "./SupplementStack";
import { GlycationScore } from "./GlycationScore";
import { DailyProtocolView } from "./DailyProtocolView";
import { SleepProtocol } from "./SleepProtocol";
import { MovementProtocol } from "./MovementProtocol";
import { PsychodermProtocol } from "./PsychodermProtocol";
import { HydrationTracker } from "./HydrationTracker";
import { PostProcedureCard } from "./PostProcedureCard";
import { FitzpatrickAdjustments } from "./FitzpatrickAdjustments";
import { MedicationInteractions } from "./MedicationInteractions";
import { OralMicrobiomeCard } from "./OralMicrobiomeCard";
import { SeasonalAdjustments } from "./SeasonalAdjustments";
import { GutBrainSkinTriad } from "./GutBrainSkinTriad";
import { SmokingAlcoholImpact } from "./SmokingAlcoholImpact";
import { SunExposureProtocol } from "./SunExposureProtocol";
import { EnvironmentDefense } from "./EnvironmentDefense";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Droplets,
  Moon,
  Sun,
  Heart,
  Brain,
  Shield,
  Sparkles,
  Pill,
  Leaf,
  Cigarette,
  Smile,
  CloudSun,
  Syringe,
  ChevronDown,
  Palette,
} from "lucide-react";

interface WellnessPlan {
  plan_id: string;
  primary_goals: Array<{ goal: string; from: string }>;
  diet_protocol: Record<string, unknown>;
  supplement_stack: Array<Record<string, unknown>>;
  peptide_protocol: Array<Record<string, unknown>>;
  hydration_target: Record<string, unknown>;
  sleep_protocol: Record<string, unknown>;
  mitochondrial_support: Record<string, unknown>;
  glycation_score: Record<string, unknown>;
  movement_protocol: Record<string, unknown>;
  stress_protocol: Record<string, unknown>;
  environmental_defense: Record<string, unknown>;
  light_therapy: Record<string, unknown>;
  gut_skin_protocol: Record<string, unknown>;
  psychoderm_protocol: Record<string, unknown>;
  post_procedure_protocol: Array<Record<string, unknown>>;
  fitzpatrick_adjustments: Array<Record<string, unknown>>;
  medication_adjustments: Array<Record<string, unknown>>;
  oral_microbiome_protocol: Record<string, unknown>;
  seasonal_adjustments: Array<Record<string, unknown>>;
  gut_brain_skin_protocol: Record<string, unknown>;
  smoking_alcohol_impact: Record<string, unknown>;
  sun_exposure_protocol: Record<string, unknown>;
  disclaimer: string;
  provider_recommendations: Array<Record<string, unknown>>;
}

interface TabDef {
  value: string;
  label: string;
  icon: React.ReactNode;
  mobileLabel?: string;
}

const primaryTabs: TabDef[] = [
  { value: "daily", label: "Daily", icon: <Sun className="h-4 w-4" /> },
  { value: "diet", label: "Diet", icon: <Heart className="h-4 w-4" /> },
  {
    value: "supplements",
    label: "Supplements",
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    value: "glycation",
    label: "Glycation",
    icon: <Activity className="h-4 w-4" />,
  },
  { value: "sleep", label: "Sleep", icon: <Moon className="h-4 w-4" /> },
  {
    value: "movement",
    label: "Movement",
    icon: <Activity className="h-4 w-4" />,
  },
  { value: "stress", label: "Stress", icon: <Brain className="h-4 w-4" /> },
  {
    value: "environment",
    label: "Defense",
    icon: <Shield className="h-4 w-4" />,
  },
];

const moreTabs: TabDef[] = [
  {
    value: "psychoderm",
    label: "Psychoderm",
    icon: <Brain className="h-4 w-4" />,
  },
  {
    value: "medications",
    label: "Medications",
    icon: <Pill className="h-4 w-4" />,
  },
  {
    value: "gut-brain-skin",
    label: "Gut-Brain-Skin",
    icon: <Leaf className="h-4 w-4" />,
  },
  {
    value: "recovery",
    label: "Recovery",
    icon: <Syringe className="h-4 w-4" />,
  },
  {
    value: "fitzpatrick",
    label: "Fitzpatrick",
    icon: <Palette className="h-4 w-4" />,
  },
  { value: "oral", label: "Oral Health", icon: <Smile className="h-4 w-4" /> },
  {
    value: "seasonal",
    label: "Seasonal",
    icon: <CloudSun className="h-4 w-4" />,
  },
  {
    value: "lifestyle",
    label: "Lifestyle",
    icon: <Cigarette className="h-4 w-4" />,
  },
  { value: "sun", label: "Sun Protocol", icon: <Sun className="h-4 w-4" /> },
  {
    value: "hydration",
    label: "Hydration",
    icon: <Droplets className="h-4 w-4" />,
  },
];

export function WellnessPlanPage() {
  const [plan, setPlan] = React.useState<WellnessPlan | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showMore, setShowMore] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("daily");

  React.useEffect(() => {
    async function fetchPlan() {
      try {
        const res = await fetch(
          "/api/v1/wellness-plan/generate?user_id=dev-user",
          {
            method: "GET",
          },
        );
        if (!res.ok) {
          const genRes = await fetch("/api/v1/wellness-plan/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: "dev-user",
              preferences: {
                peptide_comfort_level: "topical_only",
                budget: "moderate",
              },
            }),
          });
          if (!genRes.ok) throw new Error("Failed to generate plan");
          const data = (await genRes.json()) as WellnessPlan;
          setPlan(data);
        } else {
          const data = (await res.json()) as {
            plan: WellnessPlan;
            items: unknown[];
          };
          setPlan(data.plan);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load plan");
      } finally {
        setLoading(false);
      }
    }
    fetchPlan();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading your wellness plan...</p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-2">
              {error ?? "No plan available"}
            </p>
            <p className="text-sm text-muted-foreground">
              Please complete a skin scan first to generate your personalized
              wellness plan.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if we're in a "more" tab
  const isMoreTab = moreTabs.some((t) => t.value === activeTab);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl p-4 md:p-8 space-y-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Your Skin Wellness Plan
          </h1>
          <p className="text-muted-foreground mt-1">
            Personalized protocol based on your skin analysis, lifestyle, and
            research
          </p>
        </header>

        <PlanOverview goals={plan.primary_goals} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="relative">
            <TabsList className="w-full h-auto flex flex-wrap gap-1 p-1 justify-start">
              {primaryTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="gap-1 flex-shrink-0"
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}

              {/* More dropdown */}
              <div className="relative">
                <Button
                  variant={isMoreTab ? "default" : "ghost"}
                  size="sm"
                  className="h-8 gap-1 text-xs"
                  onClick={() => setShowMore(!showMore)}
                >
                  <ChevronDown className="h-3 w-3" />
                  <span className="hidden sm:inline">More</span>
                </Button>

                {showMore && (
                  <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border bg-popover p-1 shadow-md">
                    {moreTabs.map((tab) => (
                      <button
                        key={tab.value}
                        className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent ${
                          activeTab === tab.value ? "bg-accent" : ""
                        }`}
                        onClick={() => {
                          setActiveTab(tab.value);
                          setShowMore(false);
                        }}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </TabsList>
          </div>

          {/* Primary tab content */}
          <TabsContent value="daily" className="mt-4">
            <DailyProtocolView
              plan={plan as unknown as Record<string, unknown>}
            />
          </TabsContent>

          <TabsContent value="diet" className="mt-4">
            <DietProtocolCard
              protocol={plan.diet_protocol as Record<string, unknown>}
            />
          </TabsContent>

          <TabsContent value="supplements" className="mt-4">
            <SupplementStack
              supplements={plan.supplement_stack}
              peptides={plan.peptide_protocol}
            />
          </TabsContent>

          <TabsContent value="glycation" className="mt-4">
            <GlycationScore
              score={plan.glycation_score as Record<string, unknown>}
            />
          </TabsContent>

          <TabsContent value="sleep" className="mt-4">
            <SleepProtocol
              protocol={plan.sleep_protocol as Record<string, unknown>}
            />
          </TabsContent>

          <TabsContent value="movement" className="mt-4">
            <MovementProtocol
              protocol={plan.movement_protocol as Record<string, unknown>}
            />
          </TabsContent>

          <TabsContent value="stress" className="mt-4">
            <PsychodermProtocol
              protocol={plan.psychoderm_protocol as Record<string, unknown>}
            />
          </TabsContent>

          <TabsContent value="environment" className="mt-4">
            <EnvironmentDefense
              environment={
                plan.environmental_defense as Record<string, unknown>
              }
              light={plan.light_therapy as Record<string, unknown>}
              sun={plan.sun_exposure_protocol as Record<string, unknown>}
            />
          </TabsContent>

          {/* More tab content */}
          <TabsContent value="psychoderm" className="mt-4">
            <PsychodermProtocol
              protocol={plan.psychoderm_protocol as Record<string, unknown>}
            />
          </TabsContent>

          <TabsContent value="medications" className="mt-4">
            <MedicationInteractions
              medications={
                { medications: plan.medication_adjustments } as Record<
                  string,
                  unknown
                >
              }
            />
          </TabsContent>

          <TabsContent value="gut-brain-skin" className="mt-4">
            <GutBrainSkinTriad
              protocol={plan.gut_brain_skin_protocol as Record<string, unknown>}
            />
          </TabsContent>

          <TabsContent value="recovery" className="mt-4">
            <PostProcedureCard
              protocol={
                { recent_procedures: plan.post_procedure_protocol } as Record<
                  string,
                  unknown
                >
              }
            />
          </TabsContent>

          <TabsContent value="fitzpatrick" className="mt-4">
            {plan.fitzpatrick_adjustments &&
            plan.fitzpatrick_adjustments.length > 0 ? (
              <FitzpatrickAdjustments
                adjustments={
                  plan.fitzpatrick_adjustments[0] as Record<string, unknown>
                }
              />
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Palette className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No Fitzpatrick adjustments available. Complete a skin
                    analysis first.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="oral" className="mt-4">
            <OralMicrobiomeCard
              protocol={
                plan.oral_microbiome_protocol as Record<string, unknown>
              }
            />
          </TabsContent>

          <TabsContent value="seasonal" className="mt-4">
            {plan.seasonal_adjustments &&
            plan.seasonal_adjustments.length > 0 ? (
              <SeasonalAdjustments
                adjustments={
                  plan.seasonal_adjustments[0] as Record<string, unknown>
                }
              />
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <CloudSun className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No seasonal adjustments configured yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="lifestyle" className="mt-4">
            <SmokingAlcoholImpact
              protocol={plan.smoking_alcohol_impact as Record<string, unknown>}
            />
          </TabsContent>

          <TabsContent value="sun" className="mt-4">
            <SunExposureProtocol
              protocol={plan.sun_exposure_protocol as Record<string, unknown>}
            />
          </TabsContent>

          <TabsContent value="hydration" className="mt-4">
            <HydrationTracker
              protocol={plan.hydration_target as Record<string, unknown>}
            />
          </TabsContent>
        </Tabs>

        <footer className="mt-8 rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
          <p>{plan.disclaimer}</p>
          {plan.provider_recommendations.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="font-medium text-foreground">
                Provider Recommendations:
              </p>
              {plan.provider_recommendations.map((rec, i) => (
                <p key={i}>
                  • {(rec.type as string) ?? "Review"}: {rec.reason as string}
                </p>
              ))}
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}
