"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  User,
  Save,
  Loader2,
  ChevronLeft,
  AlertTriangle,
  Pill,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/utils/supabase/client";

const SKIN_TYPES = [
  { value: "oily", label: "Oily", desc: "Excess sebum, shiny T-zone" },
  { value: "dry", label: "Dry", desc: "Tight, flaky, rough texture" },
  { value: "combination", label: "Combination", desc: "Oily T-zone, dry cheeks" },
  { value: "normal", label: "Normal", desc: "Balanced, few concerns" },
  { value: "sensitive", label: "Sensitive", desc: "Reacts easily, redness" },
] as const;

const FITZPATRICK_TYPES = [
  { value: 1, label: "Type I", desc: "Very fair, always burns, never tans" },
  { value: 2, label: "Type II", desc: "Fair, usually burns, tans minimally" },
  { value: 3, label: "Type III", desc: "Medium, sometimes burns, tans gradually" },
  { value: 4, label: "Type IV", desc: "Olive, rarely burns, tans well" },
  { value: 5, label: "Type V", desc: "Brown, very rarely burns, tans darkly" },
  { value: 6, label: "Type VI", desc: "Dark brown/black, never burns" },
] as const;

const SKIN_CONCERNS = [
  "Acne",
  "Aging",
  "Hyperpigmentation",
  "Dryness",
  "Oiliness",
  "Sensitivity",
  "Rosacea",
  "Eczema",
] as const;

interface ProfileForm {
  display_name: string;
  skin_type: (typeof SKIN_TYPES)[number]["value"] | null;
  fitzpatrick_type: number | null;
  skin_concerns: string[];
  allergies: string[];
  current_medications: string[];
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const supabase = createClient();

  const [form, setForm] = useState<ProfileForm>({
    display_name: "",
    skin_type: null,
    fitzpatrick_type: null,
    skin_concerns: [],
    allergies: [],
    current_medications: [],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Tag inputs
  const [allergyInput, setAllergyInput] = useState("");
  const [medInput, setMedInput] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?redirectTo=/profile");
    }
  }, [authLoading, isAuthenticated, router]);

  // Load existing profile
  useEffect(() => {
    if (!user?.id) return;

    async function loadProfile() {
      try {
        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user!.id)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          // PGRST116 = no rows returned
          console.error("Error loading profile:", fetchError);
        }

        if (data) {
          setForm({
            display_name: data.display_name ?? "",
            skin_type: data.skin_type ?? null,
            fitzpatrick_type: data.fitzpatrick_type ?? null,
            skin_concerns: data.skin_concerns ?? [],
            allergies: data.allergies ?? [],
            current_medications: data.current_medications ?? [],
          });
        } else {
          // Pre-fill display_name from auth metadata
          const metaName =
            (user!.user_metadata?.display_name as string | undefined) ||
            (user!.user_metadata?.full_name as string | undefined) ||
            "";
          if (metaName) {
            setForm((prev) => ({ ...prev, display_name: metaName }));
          }
        }
      } catch {
        // ignore
      } finally {
        setProfileLoaded(true);
      }
    }

    loadProfile();
  }, [user, supabase]);

  const toggleConcern = useCallback((concern: string) => {
    setForm((prev) => {
      const has = prev.skin_concerns.includes(concern);
      return {
        ...prev,
        skin_concerns: has
          ? prev.skin_concerns.filter((c) => c !== concern)
          : [...prev.skin_concerns, concern],
      };
    });
    setSaveSuccess(false);
  }, []);

  const addTag = useCallback(
    (field: "allergies" | "current_medications", value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      setForm((prev) => {
        if (prev[field].includes(trimmed)) return prev;
        return { ...prev, [field]: [...prev[field], trimmed] };
      });
      setSaveSuccess(false);
    },
    []
  );

  const removeTag = useCallback(
    (field: "allergies" | "current_medications", value: string) => {
      setForm((prev) => ({
        ...prev,
        [field]: prev[field].filter((v) => v !== value),
      }));
      setSaveSuccess(false);
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (!user?.id) return;
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const payload = {
        user_id: user.id,
        display_name: form.display_name.trim() || null,
        skin_type: form.skin_type,
        fitzpatrick_type: form.fitzpatrick_type,
        skin_concerns: form.skin_concerns.length > 0 ? form.skin_concerns : null,
        allergies: form.allergies.length > 0 ? form.allergies : null,
        current_medications:
          form.current_medications.length > 0 ? form.current_medications : null,
        updated_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "user_id" });

      if (upsertError) {
        setError(upsertError.message);
        return;
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setError("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [user, form, supabase]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#FFFBF5]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FFFBF5]/85 backdrop-blur-md border-b border-[#E7E5E4]">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-stone-900">SKINgenius</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight mb-1">
          Your Profile
        </h1>
        <p className="text-sm text-stone-500 mb-8">
          This information helps us personalize your recommendations.
        </p>

        {!profileLoaded && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
          </div>
        )}

        {profileLoaded && (
          <div className="space-y-8">
            {/* Display Name */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-700" />
                <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">
                  Display Name
                </h2>
              </div>
              <Input
                type="text"
                value={form.display_name}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, display_name: e.target.value }));
                  setSaveSuccess(false);
                }}
                placeholder="Your name"
                className="h-11 rounded-xl border-stone-200 focus-visible:ring-emerald-500"
              />
            </section>

            {/* Email (read-only) */}
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">
                Email
              </h2>
              <Input
                type="email"
                value={user?.email ?? ""}
                readOnly
                disabled
                className="h-11 rounded-xl border-stone-200 bg-stone-50 text-stone-500 cursor-not-allowed"
              />
            </section>

            {/* Skin Type */}
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">
                Skin Type
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SKIN_TYPES.map((type) => {
                  const selected = form.skin_type === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          skin_type: selected ? null : type.value,
                        }));
                        setSaveSuccess(false);
                      }}
                      className={`
                        flex flex-col items-start gap-1 p-4 rounded-xl border-2 text-left transition-all
                        ${selected
                          ? "border-emerald-600 bg-emerald-50 shadow-sm"
                          : "border-stone-200 bg-white hover:border-emerald-300"
                        }
                      `}
                    >
                      <span className="font-semibold text-stone-900">{type.label}</span>
                      <span className="text-xs text-stone-500">{type.desc}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Fitzpatrick Type */}
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">
                Fitzpatrick Skin Type
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {FITZPATRICK_TYPES.map((type) => {
                  const selected = form.fitzpatrick_type === type.value;
                  const swatchColors: Record<number, string> = {
                    1: "#FFF3E0",
                    2: "#FFE0B2",
                    3: "#FFCC80",
                    4: "#C68E5E",
                    5: "#8D5524",
                    6: "#3C1E08",
                  };
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          fitzpatrick_type: selected ? null : type.value,
                        }));
                        setSaveSuccess(false);
                      }}
                      className={`
                        flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all
                        ${selected
                          ? "border-emerald-600 bg-emerald-50 shadow-sm"
                          : "border-stone-200 bg-white hover:border-emerald-300"
                        }
                      `}
                    >
                      <div
                        className="w-10 h-10 rounded-full border border-stone-200"
                        style={{ backgroundColor: swatchColors[type.value] }}
                      />
                      <span className="text-xs font-semibold text-stone-900">
                        {type.label}
                      </span>
                      <span className="text-[10px] text-stone-500 text-center leading-tight">
                        {type.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Skin Concerns */}
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">
                Skin Concerns
              </h2>
              <div className="flex flex-wrap gap-2">
                {SKIN_CONCERNS.map((concern) => {
                  const selected = form.skin_concerns.includes(concern);
                  return (
                    <button
                      key={concern}
                      type="button"
                      onClick={() => toggleConcern(concern)}
                      className={`
                        px-4 py-2 rounded-full text-sm font-medium border transition-all
                        ${selected
                          ? "bg-emerald-700 text-white border-emerald-700"
                          : "bg-white text-stone-700 border-stone-200 hover:border-emerald-300"
                        }
                      `}
                    >
                      {concern}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Allergies */}
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">
                Known Allergies
              </h2>
              <div className="flex flex-wrap gap-2">
                {form.allergies.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-50 text-red-700 text-sm border border-red-200"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag("allergies", tag)}
                      className="ml-1 hover:text-red-900"
                      aria-label={`Remove ${tag}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag("allergies", allergyInput);
                      setAllergyInput("");
                    }
                  }}
                  placeholder="Add an allergy (e.g., fragrance, niacinamide)"
                  className="h-10 rounded-xl border-stone-200 focus-visible:ring-emerald-500 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    addTag("allergies", allergyInput);
                    setAllergyInput("");
                  }}
                  className="h-10 rounded-xl border-stone-200"
                >
                  Add
                </Button>
              </div>
            </section>

            {/* Current Medications */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-700" />
                <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">
                  Current Medications
                </h2>
              </div>
              <p className="text-xs text-stone-500">
                This helps us flag potential ingredient interactions. Optional.
              </p>
              <div className="flex flex-wrap gap-2">
                {form.current_medications.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm border border-blue-200"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag("current_medications", tag)}
                      className="ml-1 hover:text-blue-900"
                      aria-label={`Remove ${tag}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={medInput}
                  onChange={(e) => setMedInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag("current_medications", medInput);
                      setMedInput("");
                    }
                  }}
                  placeholder="Add a medication (e.g., tretinoin, Accutane)"
                  className="h-10 rounded-xl border-stone-200 focus-visible:ring-emerald-500 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    addTag("current_medications", medInput);
                    setMedInput("");
                  }}
                  className="h-10 rounded-xl border-stone-200"
                >
                  Add
                </Button>
              </div>
            </section>

            {/* Drug interaction warning */}
            {form.current_medications.length > 0 && (
              <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  We&apos;ll cross-check active ingredients against your medications
                  for potential interactions. Always consult your dermatologist before
                  starting new products.
                </p>
              </div>
            )}

            {/* Error / Success */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {saveSuccess && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
                <Save className="w-4 h-4" />
                Profile saved successfully.
              </div>
            )}

            {/* Save */}
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="w-full h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-sm"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
