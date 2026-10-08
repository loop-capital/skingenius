/**
 * Seed script v3 — reconciled: inserts condition_connections from
 * knowledge-graph/condition-ingredient-mappings.json, resolving each
 * mapping's slug-style ingredient_id to the REAL existing UUID in the
 * `ingredients` table (via its `slug` column) before upserting.
 *
 * v2 (seed-connections-v2.ts) inserted the JSON's slug strings directly
 * as ingredient_id, which would have created duplicate/orphaned
 * ingredient rows alongside the real UUID-keyed ones already in
 * production. This version does not insert any ingredients — all 146
 * ingredient slugs referenced by the mappings already exist for real
 * (confirmed 146/146 match, 2026-09-14).
 *
 * Usage:
 *   npx tsx scripts/seed-connections-v3-reconciled.ts [--dry-run]
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in env
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const DRY_RUN = process.argv.includes("--dry-run");
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface ConditionMapping {
  ingredient_id: string; // slug-style, e.g. "benzoyl-peroxide"
  condition_id: string;
  effectiveness: number;
  evidence_level: string;
  mechanism: string;
}

async function main() {
  console.log("🧬 SKINgenius condition_connections reconciled seed (v3)\n");

  const root = resolve(__dirname, "..");
  const mappings: ConditionMapping[] = JSON.parse(
    readFileSync(resolve(root, "knowledge-graph/condition-ingredient-mappings.json"), "utf8"),
  );

  // Resolve slug -> real UUID
  const { data: allIngredients, error: ingErr } = await supabase.from("ingredients").select("id,slug");
  if (ingErr || !allIngredients) {
    console.error("❌ Failed to load ingredients:", ingErr);
    process.exit(1);
  }
  const slugToId = new Map(allIngredients.map((r: { id: string; slug: string }) => [r.slug, r.id]));

  const resolved: Array<{ ingredient_id: string; condition_id: string; effectiveness: number; evidence_level: string; mechanism: string }> = [];
  const unresolved: string[] = [];
  for (const m of mappings) {
    const uuid = slugToId.get(m.ingredient_id);
    if (!uuid) {
      unresolved.push(m.ingredient_id);
      continue;
    }
    resolved.push({
      ingredient_id: uuid,
      condition_id: m.condition_id,
      effectiveness: m.effectiveness,
      evidence_level: m.evidence_level,
      mechanism: m.mechanism,
    });
  }
  console.log(`📎 Resolved ${resolved.length}/${mappings.length} mappings to real ingredient UUIDs (${unresolved.length} unresolved: ${unresolved.join(", ") || "none"})`);

  // Diff against what's already in condition_connections (by real UUID pair)
  const { data: existingConns } = await supabase.from("condition_connections").select("ingredient_id,condition_id");
  const existingPairs = new Set((existingConns || []).map((r: { ingredient_id: string; condition_id: string }) => `${r.ingredient_id}:${r.condition_id}`));
  const netNew = resolved.filter((r) => !existingPairs.has(`${r.ingredient_id}:${r.condition_id}`));
  console.log(`🔗 condition_connections: ${existingPairs.size} existing, ${resolved.length - netNew.length} already match, ${netNew.length} net-new to insert`);

  if (DRY_RUN) {
    console.log("\n🏃 DRY RUN — no writes performed.");
    return;
  }

  let inserted = 0;
  for (let i = 0; i < netNew.length; i += 100) {
    const batch = netNew.slice(i, i + 100);
    const { error } = await supabase.from("condition_connections").upsert(batch, { onConflict: "ingredient_id,condition_id" });
    if (error) {
      console.error(`  ❌ Batch ${Math.floor(i / 100) + 1} error:`, error.message);
    } else {
      inserted += batch.length;
    }
  }
  console.log(`  ✅ ${inserted} condition_connections inserted`);

  const { count } = await supabase.from("condition_connections").select("*", { count: "exact", head: true });
  console.log(`\n📊 Final condition_connections count: ${count}`);
  console.log("\n✅ Done!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
