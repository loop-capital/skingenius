/**
 * Seed script: inserts ingredients + condition_connections into Supabase.
 *
 * Usage:
 *   npx tsx scripts/seed-connections-v2.ts [--dry-run]
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// ─── Config ──────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "❌ Missing env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY",
  );
  process.exit(1);
}

const DRY_RUN = process.argv.includes("--dry-run");
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Load data ───────────────────────────────────────────────

const root = resolve(__dirname, "..");

const original = JSON.parse(
  readFileSync(resolve(root, "knowledge-graph/seed-data.json"), "utf8"),
);
const v2 = JSON.parse(
  readFileSync(
    resolve(root, "knowledge-graph/seed-ingredients-v2.json"),
    "utf8",
  ),
);
const mappings = JSON.parse(
  readFileSync(
    resolve(root, "knowledge-graph/condition-ingredient-mappings.json"),
    "utf8",
  ),
);

interface Ingredient {
  id: string;
  name: string;
  slug?: string;
  category?: string;
  description?: string;
  evidence_level?: string;
  evidence?: string;
  min_concentration?: string;
  max_concentration?: string;
  pregnancy_safe?: boolean;
  concerns?: string;
}

interface ConditionMapping {
  ingredient_id: string;
  condition_id: string;
  effectiveness: string;
  evidence_level: string;
  mechanism: string;
}

const originalIngredients: Ingredient[] = original.ingredients || [];
const newIngredients: Ingredient[] = v2.ingredients || [];

function toInsertPayload(ing: Ingredient) {
  return {
    id: ing.id,
    name: ing.name,
    slug: ing.slug || ing.name.toLowerCase().replace(/\s+/g, "-"),
    category: ing.category || null,
    description: ing.description || null,
    evidence_level: ing.evidence_level || ing.evidence || null,
    min_concentration: ing.min_concentration || null,
    max_concentration: ing.max_concentration || null,
    pregnancy_safe: ing.pregnancy_safe ?? null,
    concerns: ing.concerns || null,
  };
}

async function getExistingIds(
  table: string,
  ids: string[],
): Promise<Set<string>> {
  // Batch query in chunks of 100 (Supabase limit)
  const existing = new Set<string>();
  for (let i = 0; i < ids.length; i += 100) {
    const batch = ids.slice(i, i + 100);
    const { data } = await supabase.from(table).select("id").in("id", batch);
    if (data) data.forEach((r: { id: string }) => existing.add(r.id));
  }
  return existing;
}

// ─── Main ────────────────────────────────────────────────────

async function main() {
  console.log("🧬 SKINgenius Data Seed v2\n");

  // 1. Insert ingredients (original + new)
  const allIngredients = [...originalIngredients, ...newIngredients];
  const allIds = allIngredients.map((i) => i.id);
  const existingIngredientIds = await getExistingIds("ingredients", allIds);

  const newToInsert = allIngredients
    .filter((i) => !existingIngredientIds.has(i.id))
    .map(toInsertPayload);

  console.log(
    `📦 Ingredients: ${allIngredients.length} total, ${existingIngredientIds.size} already exist, ${newToInsert.length} to insert`,
  );

  if (!DRY_RUN && newToInsert.length > 0) {
    // Batch insert in chunks of 50
    let inserted = 0;
    for (let i = 0; i < newToInsert.length; i += 50) {
      const batch = newToInsert.slice(i, i + 50);
      const { error } = await supabase
        .from("ingredients")
        .upsert(batch, { onConflict: "id" });
      if (error) {
        console.error(
          `  ❌ Batch ${Math.floor(i / 50) + 1} error:`,
          error.message,
        );
      } else {
        inserted += batch.length;
      }
    }
    console.log(`  ✅ ${inserted} ingredients inserted`);
  } else if (DRY_RUN) {
    console.log(
      `  🏃 DRY RUN — would insert ${newToInsert.length} ingredients`,
    );
  }

  // 2. Insert condition_connections
  const existingMappings = new Set<string>();
  const { data: existingConns } = await supabase
    .from("condition_connections")
    .select("ingredient_id, condition_id");

  if (existingConns) {
    existingConns.forEach(
      (r: { ingredient_id: string; condition_id: string }) =>
        existingMappings.add(`${r.ingredient_id}:${r.condition_id}`),
    );
  }

  const newMappings = mappings.filter(
    (m: ConditionMapping) =>
      !existingMappings.has(`${m.ingredient_id}:${m.condition_id}`),
  );

  console.log(
    `\n🔗 Condition-Ingredient Mappings: ${mappings.length} total, ${existingMappings.size} already exist, ${newMappings.length} to insert`,
  );

  if (!DRY_RUN && newMappings.length > 0) {
    let inserted = 0;
    for (let i = 0; i < newMappings.length; i += 100) {
      const batch = newMappings
        .slice(i, i + 100)
        .map((m: ConditionMapping) => ({
          ingredient_id: m.ingredient_id,
          condition_id: m.condition_id,
          effectiveness: m.effectiveness,
          evidence_level: m.evidence_level,
          mechanism: m.mechanism,
        }));
      const { error } = await supabase
        .from("condition_connections")
        .upsert(batch, {
          onConflict: "ingredient_id,condition_id",
        });
      if (error) {
        console.error(
          `  ❌ Batch ${Math.floor(i / 100) + 1} error:`,
          error.message,
        );
      } else {
        inserted += batch.length;
      }
    }
    console.log(`  ✅ ${inserted} mappings inserted`);
  } else if (DRY_RUN) {
    console.log(`  🏃 DRY RUN — would insert ${newMappings.length} mappings`);
  }

  // 3. Verify counts
  console.log("\n📊 Final counts:");
  const { count: ingCount } = await supabase
    .from("ingredients")
    .select("*", { count: "exact", head: true });
  const { count: connCount } = await supabase
    .from("condition_connections")
    .select("*", { count: "exact", head: true });
  console.log(`  Ingredients: ${ingCount ?? "?"}`);
  console.log(`  Condition connections: ${connCount ?? "?"}`);

  console.log("\n✅ Done!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
