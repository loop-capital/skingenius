/**
 * SKINgenius Knowledge Graph Seeder
 * 
 * Reads seed-data.json and populates:
 * - skin_conditions (with knowledge graph fields)
 * - facial_zones
 * - root_causes
 * - recommendations
 * - zone_conditions
 * 
 * Usage:
 *   npx tsx scripts/seed-knowledge-graph.ts
 * 
 * Or via Supabase CLI:
 *   supabase db push
 *   npx tsx scripts/seed-knowledge-graph.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// =============================================================================
// Config
// =============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// =============================================================================
// Types
// =============================================================================

interface SeedCondition {
  id: string;
  name: string;
  slug: string;
  icd10: string;
  description: string;
  severity: string[];
  affectedZones: string[];
  features: string[];
  fitzpatrickNotes: string;
  rootCauses: {
    cause: string;
    domain: 'skin' | 'gut' | 'hormones' | 'nutrition' | 'lifestyle';
    evidence: 'strong' | 'moderate' | 'emerging' | 'limited';
    description: string;
  }[];
  recommendations: {
    products: { name: string; description: string; evidence: string }[];
    supplements: { name: string; description: string; evidence: string }[];
    practitioner: { name: string; description: string; evidence: string }[];
    basys_health: { name: string; description: string; evidence: string }[];
  };
}

interface SeedZone {
  id: string;
  name: string;
  description: string;
  commonConcerns: string[];
}

interface SeedData {
  conditions: SeedCondition[];
  zones: SeedZone[];
}

// =============================================================================
// Seed Functions
// =============================================================================

async function seedZones(zones: SeedZone[]) {
  console.log(`Seeding ${zones.length} facial zones...`);
  
  const rows = zones.map((z, i) => ({
    id: z.id,
    name: z.name,
    description: z.description,
    common_concerns: z.commonConcerns,
    display_order: i,
  }));

  const { error } = await supabase
    .from('facial_zones')
    .upsert(rows, { onConflict: 'id' });

  if (error) {
    console.error('Failed to seed zones:', error);
    process.exit(1);
  }
  console.log(`✅ Seeded ${zones.length} facial zones`);
}

async function seedConditions(conditions: SeedCondition[]) {
  console.log(`Seeding ${conditions.length} skin conditions...`);
  
  for (const c of conditions) {
    const { error } = await supabase
      .from('skin_conditions')
      .upsert({
        name: c.name,
        slug: c.slug,
        category: mapCategory(c.slug),
        description: c.description,
        severity_scale: c.severity.join('_'),
        icd_code: c.icd10,
        icd10_code: c.icd10,
        fitzpatrick_notes: c.fitzpatrickNotes,
        features: c.features,
        affected_zones: c.affectedZones,
        requires_dermatologist: shouldReferToDerm(c),
      }, { onConflict: 'slug' });

    if (error) {
      console.error(`Failed to seed condition "${c.name}":`, error);
    } else {
      console.log(`  ✅ ${c.name} (${c.slug})`);
    }
  }
}

async function seedRootCauses(conditions: SeedCondition[]) {
  console.log(`Seeding root causes...`);
  
  let total = 0;
  for (const c of conditions) {
    const rows = c.rootCauses.map((rc, i) => ({
      condition_slug: c.slug,
      cause: rc.cause,
      domain: rc.domain,
      evidence: rc.evidence,
      description: rc.description,
      display_order: i,
    }));

    // Delete existing root causes for this condition first
    await supabase.from('root_causes').delete().eq('condition_slug', c.slug);
    
    const { error } = await supabase.from('root_causes').insert(rows);
    if (error) {
      console.error(`  ❌ Root causes for "${c.name}":`, error);
    } else {
      total += rows.length;
    }
  }
  console.log(`✅ Seeded ${total} root causes`);
}

async function seedRecommendations(conditions: SeedCondition[]) {
  console.log(`Seeding recommendations...`);
  
  let total = 0;
  for (const c of conditions) {
    const allRecs = [
      ...c.recommendations.products.map((r, i) => ({
        condition_slug: c.slug, tier: 'product' as const, name: r.name,
        description: r.description, evidence: r.evidence, display_order: i,
      })),
      ...c.recommendations.supplements.map((r, i) => ({
        condition_slug: c.slug, tier: 'supplement' as const, name: r.name,
        description: r.description, evidence: r.evidence, display_order: i,
      })),
      ...c.recommendations.practitioner.map((r, i) => ({
        condition_slug: c.slug, tier: 'practitioner' as const, name: r.name,
        description: r.description, evidence: r.evidence, display_order: i,
      })),
      ...c.recommendations.basys_health.map((r, i) => ({
        condition_slug: c.slug, tier: 'basys_health' as const, name: r.name,
        description: r.description, evidence: r.evidence, display_order: i,
      })),
    ];

    // Delete existing recommendations for this condition
    await supabase.from('recommendations').delete().eq('condition_slug', c.slug);
    
    const { error } = await supabase.from('recommendations').insert(allRecs);
    if (error) {
      console.error(`  ❌ Recommendations for "${c.name}":`, error);
    } else {
      total += allRecs.length;
    }
  }
  console.log(`✅ Seeded ${total} recommendations`);
}

async function seedZoneConditions(conditions: SeedCondition[]) {
  console.log(`Seeding zone-condition mappings...`);
  
  let total = 0;
  // Clear existing
  await supabase.from('zone_conditions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  for (const c of conditions) {
    for (const zoneId of c.affectedZones) {
      const { error } = await supabase.from('zone_conditions').insert({
        zone_id: zoneId,
        condition_slug: c.slug,
        primary_concern: c.features[0] || c.name,
        description: `${c.name} commonly affects the ${zoneId.replace('-', ' ')} area`,
        severity: 'mild' as const,
        display_order: 0,
      });
      if (error && !error.message.includes('duplicate')) {
        console.error(`  ❌ Zone-condition for "${c.name}" in ${zoneId}:`, error);
      } else {
        total++;
      }
    }
  }
  console.log(`✅ Seeded ${total} zone-condition mappings`);
}

// =============================================================================
// Helpers
// =============================================================================

function mapCategory(slug: string): string {
  const categoryMap: Record<string, string> = {
    'acne-vulgaris': 'acne', 'hormonal-acne': 'acne', 'acne-mechanica': 'acne',
    'fungal-acne': 'acne', 'steroid-acne': 'acne',
    'rosacea': 'rosacea', 'perioral-dermatitis': 'rosacea',
    'atopic-dermatitis': 'eczema', 'contact-dermatitis': 'eczema',
    'seborrheic-dermatitis': 'eczema',
    'psoriasis': 'psoriasis',
    'melasma': 'pigmentation', 'post-inflammatory-hyperpigmentation': 'pigmentation',
    'solar-lentigines': 'pigmentation', 'vitiligo': 'pigmentation',
    'actinic-keratosis': 'sun_damage',
    'melanoma': 'other',
    'keratosis-pilaris': 'texture', 'xerosis': 'hydration',
    'seborrheic-keratosis': 'aging', 'tinea-versicolor': 'other',
    'folliculitis': 'acne', 'cold-sore': 'other',
    'razor-bumps': 'scarring',
  };
  return categoryMap[slug] || 'other';
}

function shouldReferToDerm(c: SeedCondition): boolean {
  const dermRequired = ['melanoma', 'actinic-keratosis', 'vitiligo', 'steroid-acne'];
  return dermRequired.includes(c.id) || c.severity.includes('severe');
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  console.log('🧬 SKINgenius Knowledge Graph Seeder\n');

  const seedPath = join(__dirname, '..', 'knowledge-graph', 'seed-data.json');
  console.log(`Loading seed data from: ${seedPath}`);
  
  let seedData: SeedData;
  try {
    const raw = readFileSync(seedPath, 'utf-8');
    seedData = JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load seed-data.json. Run the knowledge graph extraction first.');
    console.error(err);
    process.exit(1);
  }

  console.log(`Loaded: ${seedData.conditions.length} conditions, ${seedData.zones.length} zones\n`);

  await seedZones(seedData.zones);
  await seedConditions(seedData.conditions);
  await seedRootCauses(seedData.conditions);
  await seedRecommendations(seedData.conditions);
  await seedZoneConditions(seedData.conditions);

  console.log('\n✨ Knowledge graph seeding complete!');
}

main().catch(console.error);