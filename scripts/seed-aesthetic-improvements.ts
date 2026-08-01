/**
 * Seed script: inserts all improvement catalog items into Supabase.
 *
 * Usage:
 *   npx ts-node scripts/seed-aesthetic-improvements.ts [--dry-run]
 *   npx tsx scripts/seed-aesthetic-improvements.ts [--dry-run]
 */

import { createClient } from "@supabase/supabase-js";
import { IMPROVEMENT_CATALOG } from "../src/lib/facial-aesthetics/improvement-catalog";

// ─── Config ──────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(
    "❌ Missing env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY",
  );
  process.exit(1);
}

const DRY_RUN = process.argv.includes("--dry-run");

// ─── Build insert payload ────────────────────────────────────

interface InsertPayload {
  feature: string;
  sub_feature: string | null;
  name: string;
  category: string;
  invasiveness: string;
  score_impact: number | null;
  confidence: number | null;
  timeline_weeks: number | null;
  cost_min: number | null;
  cost_max: number | null;
  recurring: boolean;
  recurring_cost_monthly: number | null;
  evidence_level: string | null;
  evidence_notes: string | null;
  key_studies: string[] | null;
  ingredient_ids: string[] | null;
  supplement_ids: string[] | null;
  peptide_ids: string[] | null;
  product_ids: string[] | null;
  ethnicity_adjustments: Record<string, string> | null;
  fitzpatrick_adjustments: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}

const payloads: InsertPayload[] = IMPROVEMENT_CATALOG.map((item) => ({
  feature: item.feature,
  sub_feature: item.sub_feature ?? null,
  name: item.name,
  category: item.category,
  invasiveness: item.invasiveness,
  score_impact: item.score_impact ?? null,
  confidence: item.confidence ?? null,
  timeline_weeks: item.timeline_weeks ?? null,
  cost_min: item.cost_min ?? null,
  cost_max: item.cost_max ?? null,
  recurring: item.recurring ?? false,
  recurring_cost_monthly: item.recurring_cost_monthly ?? null,
  evidence_level: item.evidence_level ?? null,
  evidence_notes: item.evidence_notes ?? null,
  key_studies: item.key_studies ?? null,
  ingredient_ids: item.ingredient_ids ?? null,
  supplement_ids: item.supplement_ids ?? null,
  peptide_ids: item.peptide_ids ?? null,
  product_ids: item.product_ids ?? null,
  ethnicity_adjustments: item.ethnicity_adjustments ?? null,
  fitzpatrick_adjustments: item.fitzpatrick_adjustments ?? null,
  created_at: item.created_at ?? new Date().toISOString(),
  updated_at: item.updated_at ?? new Date().toISOString(),
}));

// ─── Main ────────────────────────────────────────────────────

async function seed(): Promise<void> {
  console.log(`📦 Seeding ${payloads.length} aesthetic improvements...`);
  console.log(`   Dry-run: ${DRY_RUN}`);

  if (DRY_RUN) {
    console.log("\n📋 SQL Preview (first 5 items):\n");
    for (const p of payloads.slice(0, 5)) {
      console.log(
        `INSERT INTO aesthetic_improvements (feature, name, category, invasiveness, score_impact, cost_min, cost_max)`,
      );
      console.log(
        `VALUES ('${p.feature}', '${p.name}', '${p.category}', '${p.invasiveness}', ${p.score_impact}, ${p.cost_min}, ${p.cost_max});`,
      );
      console.log();
    }
    console.log(`...and ${payloads.length - 5} more items.\n`);
    console.log("✅ Dry-run complete. No changes made.");
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Upsert: use (feature, sub_feature, name) as natural key
  const { data, error } = await supabase
    .from("aesthetic_improvements")
    .upsert(payloads, {
      onConflict: "feature,sub_feature,name",
      ignoreDuplicates: false,
    });

  if (error) {
    console.error("❌ Upsert failed:", error.message);
    process.exit(1);
  }

  console.log(
    `✅ Successfully upserted ${payloads.length} aesthetic improvements.`,
  );
  console.log("   Data:", JSON.stringify(data, null, 2));
}

seed();
