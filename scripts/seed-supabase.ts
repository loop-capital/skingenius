import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { existsSync, readFileSync } from 'fs';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Load seed data
const seedDataPath = './knowledge-graph/seed-data.json';
let seedData: any;
try {
  if (!existsSync(seedDataPath)) {
    throw new Error(`Seed data file not found: ${seedDataPath}`);
  }
  const rawData = readFileSync(seedDataPath, 'utf8');
  seedData = JSON.parse(rawData);
} catch (error) {
  console.error('Error loading seed data:', error);
  process.exit(1);
}

// Fetch actual categories from the database
async function getDatabaseCategories(): Promise<string[]> {
  // Try to infer valid categories from existing data, or return all categories if table is empty
  const { data, error } = await supabase
    .from('ingredients')
    .select('category')
    .limit(100);
  
  if (error) {
    console.error('Error fetching schema:', error.message);
    return [];
  }
  
  const categories = [...new Set(data?.map((d: any) => d.category?.toLowerCase()).filter(Boolean) || [])];
  
  // If table is empty, return all seed categories (schema not yet constrained)
  if (categories.length === 0) {
    console.log('   No existing ingredients found - will use all seed categories');
    return [
      'retinoid', 'aha', 'bha', 'vitamin', 'antioxidant', 'peptide',
      'humectant', 'emollient', 'occlusive', 'sunscreen', 'botanical',
      'preservative', 'fragrance', 'surfactant', 'other',
      'antimicrobial', 'depigmenting', 'mineral', 'fatty-acid', 'barrier-repair',
      'keratolytic', 'antifungal', 'antiparasitic', 'calcineurin-inhibitor',
      'corticosteroid', 'chemotherapy', 'immune-modulator', 'jak-inhibitor',
      'anti-androgen', 'insulin-sensitizer', 'photoprotectant', 'protein',
      'flavonoid', 'anti-inflammatory', 'antiviral', 'amino-acid', 'soothing',
      'wound-healing', 'brightening', 'retinoid-alternative', 'antiproliferative',
      'nsaid', 'microtubule-inhibitor', 'hormonal', 'antibiotic',
      'immunosuppressant', 'biologic', 'phototherapy', 'injectable', 'procedure',
      'energy-device', 'laser', 'vitamin-d-analog', 'neuro-peptide',
      'anti-elastase-peptide', 'probiotic', 'pha', 'protective-extremolyte',
      'regenerative-biocompatible', 'pde4-inhibitor'
    ];
  }
  
  return categories;
}

// Get valid categories from schema by querying information_schema
async function getValidCategories(): Promise<Set<string>> {
  const { data, error } = await supabase.rpc('get_ingredient_categories');
  if (!error && data) {
    return new Set(data.map((d: any) => d.toLowerCase()));
  }
  // Fallback: use hardcoded list that matches schema
  return new Set([
    'retinoid', 'aha', 'bha', 'vitamin', 'antioxidant', 'peptide',
    'humectant', 'emollient', 'occlusive', 'sunscreen', 'botanical',
    'preservative', 'fragrance', 'surfactant', 'other',
    'antimicrobial', 'depigmenting', 'mineral', 'fatty-acid', 'barrier-repair',
    'keratolytic', 'antifungal', 'antiparasitic', 'calcineurin-inhibitor',
    'corticosteroid', 'chemotherapy', 'immune-modulator', 'jak-inhibitor',
    'anti-androgen', 'insulin-sensitizer', 'photoprotectant', 'protein',
    'flavonoid', 'anti-inflammatory', 'antiviral', 'amino-acid', 'soothing',
    'wound-healing', 'brightening', 'retinoid-alternative', 'antiproliferative',
    'nsaid', 'microtubule-inhibitor', 'hormonal', 'antibiotic',
    'immunosuppressant', 'biologic', 'phototherapy', 'injectable', 'procedure',
    'energy-device', 'laser', 'vitamin-d-analog', 'neuro-peptide',
    'anti-elastase-peptide', 'probiotic', 'pha', 'protective-extremolyte',
    'regenerative-biocompatible', 'pde4-inhibitor'
  ]);
}

// Map evidence levels from seed data to schema enum (A, B, C, D)
const mapEvidenceLevel = (level: string): string => {
  const mapping: Record<string, string> = {
    'strong': 'strong',
    'A': 'strong',
    'A-': 'strong',
    'B+': 'moderate',
    'B': 'moderate',
    'B-': 'moderate',
    'moderate': 'moderate',
    'C+': 'emerging',
    'C': 'emerging',
    'C-': 'emerging',
    'limited': 'emerging',
    'emerging': 'emerging',
    'D': 'emerging',
    'insufficient': 'emerging'
  };
  return mapping[level] || 'emerging';
};

// Transform ingredients from seed data to match schema
const transformIngredients = (seedIngredients: any[], dbCategories: Set<string>): any[] => {
  return seedIngredients.map((ing: any) => {
    const rawCategory = ing.category?.toLowerCase() || 'other';
    let category = rawCategory;
    
    // Map categories that might not be in the DB schema to valid ones
    const categoryMapping: Record<string, string> = {
      'nsaid': 'anti-inflammatory',
      'jak-inhibitor': 'immune-modulator',
      'pde4-inhibitor': 'immune-modulator',
      'calcineurin-inhibitor': 'immune-modulator',
      'microtubule-inhibitor': 'chemotherapy',
      'anti-elastase-peptide': 'peptide',
      'anti-androgen': 'hormonal',
      'insulin-sensitizer': 'hormonal',
      'vitamin-d-analog': 'vitamin',
      'energy-device': 'procedure',
      'regenerative-biocompatible': 'procedure',
      'protective-extremolyte': 'antioxidant'
    };
    
    // If category not in DB, try mapping
    if (!dbCategories.has(category)) {
      category = categoryMapping[category] || category;
    }
    
    // Log for debugging
    if (category !== rawCategory) {
      console.log(`    Mapping category: ${rawCategory} -> ${category}`);
    }
    
    return {
      name: ing.name,
      slug: ing.slug || ing.id,
      inci_name: ing.inci_name || null,
      category: category,
      description: ing.description || `${ing.name} is a ${ing.category} ingredient used in skincare.`,
      evidence_level: mapEvidenceLevel(ing.evidence_level || ing.evidence) || 'emerging',
      pubmed_ids: ing.pubmed_ids || [],
      concerns: ing.concerns || ing.keyConditions || [],
      skin_types: ing.skin_types || [],
      interactions: ing.interactions || [],
      pregnancy_safe: ing.pregnancy_safe ?? ing.pregnancySafe ?? null,
      // Skip concentration values > 999.99 for DECIMAL(5,2) compatibility
      // Oral supplements (Omega-3, Vitamin D, etc.) use mg/IU which exceed topical % ranges
      min_concentration: (ing.min_concentration > 999.99 || ing.max_concentration > 999.99) ? null : (ing.min_concentration ?? null),
      max_concentration: (ing.max_concentration > 999.99 || ing.min_concentration > 999.99) ? null : (ing.max_concentration ?? null)
    };
  });
};

// Map evidence levels for tables that require letter grades (root_causes, mechanisms, supplements)
const mapEvidenceLevelToLetter = (level: string): string => {
  const mapping: Record<string, string> = {
    'strong': 'A',
    'A': 'A',
    'A-': 'A',
    'B+': 'B',
    'B': 'B',
    'B-': 'B',
    'moderate': 'B',
    'C+': 'C',
    'C': 'C',
    'C-': 'C',
    'emerging': 'C',
    'limited': 'D',
    'D': 'D',
    'insufficient': 'D'
  };
  return mapping[level] || 'C';
};
const mapBodySystem = (domain: string): string => {
  const mapping: Record<string, string> = {
    'gut': 'gut',
    'hormones': 'hormonal',
    'hormonal': 'hormonal',
    'immune': 'immune',
    'metabolic': 'metabolic',
    'skin': 'immune',
    'lifestyle': 'nervous',
    'nutrition': 'metabolic'
  };
  return mapping[domain] || 'metabolic';
};

// Map condition category from id or existing category to schema enum
const mapConditionCategory = (cat: string): string => {
  const mapping: Record<string, string> = {
    'acne': 'acne',
    'aging': 'aging',
    'pigmentation': 'pigmentation',
    'sensitivity': 'sensitivity',
    'hydration': 'hydration',
    'redness': 'redness',
    'texture': 'texture',
    'scarring': 'scarring',
    'sun_damage': 'sun_damage',
    'eczema': 'eczema',
    'psoriasis': 'psoriasis',
    'rosacea': 'rosacea',
    'keratosis': 'keratosis',
    'other': 'other'
  };
  
  // Try to infer from the slug/id
  const lowerCat = cat.toLowerCase();
  if (lowerCat.includes('acne')) return 'acne';
  if (lowerCat.includes('age') || lowerCat.includes('photoaging')) return 'aging';
  if (lowerCat.includes('pigment') || lowerCat.includes('melasma') || lowerCat.includes('vitiligo') || lowerCat.includes('lentigines')) return 'pigmentation';
  if (lowerCat.includes('sensitiv') || lowerCat.includes('dermatitis') || lowerCat.includes('rosacea')) return 'sensitivity';
  if (lowerCat.includes('dry') || lowerCat.includes('xerosis') || lowerCat.includes('hydrat')) return 'hydration';
  if (lowerCat.includes('red') || lowerCat.includes('erythema')) return 'redness';
  if (lowerCat.includes('texture') || lowerCat.includes('pore') || lowerCat.includes('keratosis')) return 'texture';
  if (lowerCat.includes('scar')) return 'scarring';
  if (lowerCat.includes('sun') || lowerCat.includes('actinic') || lowerCat.includes('solar')) return 'sun_damage';
  if (lowerCat.includes('eczema') || lowerCat.includes('atopic')) return 'eczema';
  if (lowerCat.includes('psoriasis')) return 'psoriasis';
  if (lowerCat.includes('cancer') || lowerCat.includes('melanoma') || lowerCat.includes('carcinoma')) return 'other';
  
  return mapping[lowerCat] || 'other';
};

// Extract unique root causes from conditions
const extractRootCauses = (conditions: any[]): any[] => {
  const rootCauseMap = new Map<string, any>();

  conditions.forEach((condition: any) => {
    condition.rootCauses?.forEach((rc: any) => {
      const id = rc.cause.toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/_+$/, '')
        .substring(0, 63);

      if (!rootCauseMap.has(id)) {
        rootCauseMap.set(id, {
          id,
          name: rc.cause,
          description: rc.description || '',
          body_system: mapBodySystem(rc.domain),
          evidence_level: mapEvidenceLevelToLetter(rc.evidence)
        });
      }
    });
  });

  return Array.from(rootCauseMap.values());
};

// Extract mechanisms
const extractMechanisms = (conditions: any[]): any[] => {
  const mechanismMap = new Map<string, any>();

  conditions.forEach((condition: any) => {
    condition.rootCauses?.forEach((rc: any) => {
      const mechId = `${rc.cause.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 55)}_mech`;
      const pathwayTypes: Record<string, string> = {
        'gut': 'inflammatory',
        'hormones': 'hormonal',
        'hormonal': 'hormonal',
        'immune': 'immune',
        'metabolic': 'metabolic',
        'skin': 'inflammatory',
        'lifestyle': 'metabolic',
        'nutrition': 'metabolic'
      };

      if (!mechanismMap.has(mechId)) {
        mechanismMap.set(mechId, {
          id: mechId,
          name: `${rc.cause} pathway`,
          description: `Mechanism involving ${rc.cause} leading to skin symptoms: ${rc.description || ''}`.substring(0, 495),
          pathway_type: pathwayTypes[rc.domain] || 'inflammatory',
          evidence_level: mapEvidenceLevelToLetter(rc.evidence)
        });
      }
    });
  });

  return Array.from(mechanismMap.values());
};

// Extract supplements from conditions' recommendations
const extractSupplements = (conditions: any[]): any[] => {
  const supplementMap = new Map<string, any>();

  conditions.forEach((condition: any) => {
    const recommendations = condition.recommendations || {};
    const supplements = recommendations.supplements || [];

    supplements.forEach((supp: any) => {
      const id = supp.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/_+$/, '')
        .substring(0, 63);

      // Extract dosage
      let dosage = 'As directed on label';
      const dosageMatch = supp.name.match(/(\d+\s*(?:mg|mcg|IU|g|ml|capsules?|tablets?|tsp|tbsp))/i);
      if (dosageMatch) {
        dosage = dosageMatch[1];
      } else if (supp.description) {
        const descMatch = supp.description.match(/(\d+\s*(?:mg|mcg|IU|g|ml|capsules?|tablets?|tsp|tbsp).*?)(?:;|\.|,|$)/i);
        if (descMatch) dosage = descMatch[1].trim();
      }

      if (!supplementMap.has(id)) {
        supplementMap.set(id, {
          id,
          name: supp.name.replace(/\s*\d+.*$/, '').trim(),
          dosage,
          evidence_level: mapEvidenceLevelToLetter(supp.evidence || 'moderate'),
          benefits: supp.description ? [supp.description] : [],
          concerns_treated: [condition.slug]
        });
      } else {
        const existing = supplementMap.get(id);
        if (supp.description && !existing.benefits.includes(supp.description)) {
          existing.benefits.push(supp.description);
        }
        if (!existing.concerns_treated.includes(condition.slug)) {
          existing.concerns_treated.push(condition.slug);
        }
      }
    });
  });

  return Array.from(supplementMap.values());
};

// Create cause_condition_links
const createCauseConditionLinks = (conditions: any[]): any[] => {
  const links: any[] = [];
  const seen = new Set<string>();

  conditions.forEach((condition: any) => {
    condition.rootCauses?.forEach((rc: any) => {
      const rcId = rc.cause.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 63);
      const key = `${rcId}-${condition.slug}`;

      if (!seen.has(key)) {
        seen.add(key);
        links.push({
          root_cause_id: rcId,
          condition_id: condition.slug,
          relationship: rc.evidence === 'strong' ? 'causes' : 'aggravates',
          mechanism_summary: rc.description || '',
          evidence_level: mapEvidenceLevelToLetter(rc.evidence)
        });
      }
    });
  });

  return links;
};

// Create mechanism_chains
const createMechanismChains = (conditions: any[]): any[] => {
  const chains: any[] = [];
  const seen = new Set<string>();

  conditions.forEach((condition: any) => {
    condition.rootCauses?.forEach((rc: any) => {
      const rcId = rc.cause.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 63);
      const mechId = `${rc.cause.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 55)}_mech`;
      const key = `${rcId}-${mechId}-${condition.slug}`;

      if (!seen.has(key)) {
        seen.add(key);
        chains.push({
          root_cause_id: rcId,
          mechanism_id: mechId,
          condition_id: condition.slug,
          description: `${rc.cause} affects skin through ${rc.domain || 'inflammatory'} pathways leading to ${condition.name}`.substring(0, 495),
          evidence_level: mapEvidenceLevelToLetter(rc.evidence)
        });
      }
    });
  });

  return chains;
};

// Clear existing data before seeding (optional - set to true to clear first)
const CLEAR_EXISTING = true;

// Clear a table
async function clearTable(tableName: string): Promise<void> {
  const { error } = await supabase
    .from(tableName)
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
  
  if (error) {
    console.log(`  Note: Could not clear ${tableName}: ${error.message}`);
  } else {
    console.log(`  Cleared ${tableName}`);
  }
}
async function checkTablesExist(tables: string[]): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};

  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    results[table] = !error;
  }

  return results;
}

// Validate ingredients before seeding
const validateIngredient = (ing: any, validCategories: Set<string>): { valid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  if (!ing.name) issues.push('missing name');
  if (!ing.slug) issues.push('missing slug');
  if (!ing.category) issues.push('missing category');
  else if (!validCategories.has(ing.category.toLowerCase())) issues.push(`invalid category: ${ing.category}`);
  if (!ing.evidence_level) issues.push('missing evidence_level');
  else if (!['strong', 'moderate', 'emerging', 'limited'].includes(ing.evidence_level)) {
    issues.push(`invalid evidence_level: ${ing.evidence_level}`);
  }
  
  return { valid: issues.length === 0, issues };
};

// Seed a single table with batching
async function seedTable(tableName: string, records: any[], batchSize = 50): Promise<{ success: number; errors: number }> {
  let success = 0;
  let errors = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);

    const { error } = await supabase
      .from(tableName)
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      console.error(`  ✗ Error seeding ${tableName} batch ${i / batchSize + 1}:`, error.message);
      errors += batch.length;

      // Try individual inserts for this batch
      for (const record of batch) {
        const { error: singleError } = await supabase
          .from(tableName)
          .upsert(record, { onConflict: 'id' });

        if (singleError) {
          console.error(`    ✗ Failed to insert ${record.id || 'unknown'}:`, singleError.message);
        } else {
          success++;
        }
      }
    } else {
      success += batch.length;
    }
  }

  return { success, errors };
}

// Main seeding function
async function seedDatabase() {
  console.log('🌱 SKINgenius Supabase Seeding\n');

  // Check which tables exist
  console.log('📋 Checking tables...');
  const requiredTables = ['ingredients', 'products', 'root_causes', 'mechanisms', 'supplements', 'cause_condition_links', 'mechanism_chains'];
  const tableStatus = await checkTablesExist(requiredTables);

  const missingTables = requiredTables.filter(t => !tableStatus[t]);
  if (missingTables.length > 0) {
    console.error(`\n❌ Missing tables: ${missingTables.join(', ')}`);
    console.error('⚠️  Please run supabase/schema.sql and supabase/complete-setup.sql in the Supabase SQL Editor first.');
    process.exit(1);
  }

  console.log('✓ All required tables exist\n');

  // Clear existing data if requested
  if (CLEAR_EXISTING) {
    console.log('🗑️  Clearing existing data...');
    await clearTable('mechanism_chains');
    await clearTable('cause_condition_links');
    await clearTable('supplements');
    await clearTable('mechanisms');
    await clearTable('root_causes');
    await clearTable('ingredients');
    await clearTable('skin_conditions');
    console.log('✓ Cleared existing data\n');
  }

  const results = {
    conditions: { count: 0, errors: 0 },
    ingredients: { count: 0, errors: 0 },
    products: { count: 0, errors: 0 },
    root_causes: { count: 0, errors: 0 },
    mechanisms: { count: 0, errors: 0 },
    supplements: { count: 0, errors: 0 },
    cause_condition_links: { count: 0, errors: 0 },
    mechanism_chains: { count: 0, errors: 0 }
  };

  // Get valid categories from schema
  const { data: catData, error: catError } = await supabase
    .from('information_schema.check_constraints')
    .select('constraint_name, check_clause')
    .eq('constraint_name', 'ingredients_category_check');
  
  if (!catError && catData && catData.length > 0) {
    console.log('Schema check constraint:', catData[0].check_clause.substring(0, 200));
  } else {
    console.log('Could not fetch schema constraint');
  }

  // Fetch existing ingredients to see what's there
  const { data: existingIngredients, error: ingError } = await supabase
    .from('ingredients')
    .select('slug, category')
    .limit(10);
  
  if (ingError) {
    console.error('Error fetching ingredients:', ingError.message);
  } else {
    console.log('First 10 existing ingredients:', existingIngredients);
  }

  // 0. Seed skin_conditions FIRST (needed for foreign keys)
  console.log('🔬 Seeding skin_conditions...');
  const conditions = seedData.conditions || [];
  const conditionRecords = conditions.map((c: any) => ({
    name: c.name,
    slug: c.slug,
    category: mapConditionCategory(c.category || c.id),
    description: c.description,
    severity_scale: Array.isArray(c.severity) ? c.severity.join(',') : c.severity,
    icd_code: c.icd10 || c.icd_code || null,
    requires_dermatologist: c.requiresDermatologist || false
  }));
  
  const conditionResult = await seedTable('skin_conditions', conditionRecords);
  results.conditions = { count: conditionResult.success, errors: conditionResult.errors };
  console.log(`  ✓ ${conditionResult.success} conditions seeded${conditionResult.errors > 0 ? ` (${conditionResult.errors} errors)` : ''}`);

  // 1. Seed ingredients
  console.log('\n🧪 Seeding ingredients...');
  const seedIngredients = seedData.ingredients || [];
  
  // Get actual valid categories from the database
  console.log('   Fetching valid categories from database...');
  const dbCategories = await getDatabaseCategories();
  const dbCategorySet = new Set(dbCategories);
  console.log(`   Found ${dbCategories.length} valid categories in DB:`, dbCategories.slice(0, 10).join(', ') + '...');
  
  const transformedIngredients = transformIngredients(seedIngredients, dbCategorySet);
  
  // Log any categories that were mapped
  const mappedCategories = new Set<string>();
  transformedIngredients.forEach((ing: any) => {
    const rawCat = seedIngredients.find((s: any) => s.name === ing.name)?.category?.toLowerCase();
    if (rawCat && !dbCategorySet.has(rawCat)) {
      mappedCategories.add(`${rawCat} -> ${ing.category}`);
    }
  });
  if (mappedCategories.size > 0) {
    console.log('   Mapped categories:', [...mappedCategories].join(', '));
  }
  
  const ingredientResult = await seedTable('ingredients', transformedIngredients);
  results.ingredients = { count: ingredientResult.success, errors: ingredientResult.errors };
  console.log(`  ✓ ${ingredientResult.success} ingredients seeded${ingredientResult.errors > 0 ? ` (${ingredientResult.errors} errors)` : ''}`);

  // 2. Seed root_causes
  console.log('🔬 Seeding root_causes...');
  const rootCauses = extractRootCauses(seedData.conditions || []);
  const rootCauseResult = await seedTable('root_causes', rootCauses);
  results.root_causes = { count: rootCauseResult.success, errors: rootCauseResult.errors };
  console.log(`  ✓ ${rootCauseResult.success} root causes seeded${rootCauseResult.errors > 0 ? ` (${rootCauseResult.errors} errors)` : ''}`);

  // 2. Seed mechanisms
  console.log('\n⚙️  Seeding mechanisms...');
  const mechanisms = extractMechanisms(seedData.conditions || []);
  const mechanismResult = await seedTable('mechanisms', mechanisms);
  results.mechanisms = { count: mechanismResult.success, errors: mechanismResult.errors };
  console.log(`  ✓ ${mechanismResult.success} mechanisms seeded${mechanismResult.errors > 0 ? ` (${mechanismResult.errors} errors)` : ''}`);

  // 3. Seed supplements
  console.log('\n💊 Seeding supplements...');
  const supplements = extractSupplements(seedData.conditions || []);
  const supplementResult = await seedTable('supplements', supplements);
  results.supplements = { count: supplementResult.success, errors: supplementResult.errors };
  console.log(`  ✓ ${supplementResult.success} supplements seeded${supplementResult.errors > 0 ? ` (${supplementResult.errors} errors)` : ''}`);

  // 4. Seed cause_condition_links (use a smaller batch size)
  console.log('\n🔗 Seeding cause_condition_links...');
  const causeLinks = createCauseConditionLinks(seedData.conditions || []);
  let causeLinkSuccess = 0;
  let causeLinkErrors = 0;

  for (const link of causeLinks) {
    const { error } = await supabase
      .from('cause_condition_links')
      .upsert(link, { onConflict: 'root_cause_id,condition_id' });

    if (error) {
      causeLinkErrors++;
    } else {
      causeLinkSuccess++;
    }
  }
  results.cause_condition_links = { count: causeLinkSuccess, errors: causeLinkErrors };
  console.log(`  ✓ ${causeLinkSuccess} cause-condition links seeded${causeLinkErrors > 0 ? ` (${causeLinkErrors} errors)` : ''}`);

  // 5. Seed mechanism_chains
  console.log('\n⛓️  Seeding mechanism_chains...');
  const chains = createMechanismChains(seedData.conditions || []);
  let chainSuccess = 0;
  let chainErrors = 0;

  for (const chain of chains) {
    const { error } = await supabase
      .from('mechanism_chains')
      .upsert(chain, { onConflict: 'root_cause_id,mechanism_id,condition_id' });

    if (error) {
      chainErrors++;
    } else {
      chainSuccess++;
    }
  }
  results.mechanism_chains = { count: chainSuccess, errors: chainErrors };
  console.log(`  ✓ ${chainSuccess} mechanism chains seeded${chainErrors > 0 ? ` (${chainErrors} errors)` : ''}`);

  // Validation
  console.log('\n📊 Validating row counts...');

  const tablesToCheck = [
    { name: 'skin_conditions', expected: conditionRecords.length },
    { name: 'ingredients', expected: transformedIngredients.length },
    { name: 'root_causes', expected: rootCauses.length },
    { name: 'mechanisms', expected: mechanisms.length },
    { name: 'supplements', expected: supplements.length },
    { name: 'cause_condition_links', expected: causeLinks.length },
    { name: 'mechanism_chains', expected: chains.length }
  ];

  for (const table of tablesToCheck) {
    const { count, error } = await supabase
      .from(table.name)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`  ⚠️  ${table.name}: Error - ${error.message}`);
    } else {
      const status = count === table.expected ? '✓' : '⚠️';
      console.log(`  ${status} ${table.name}: ${count} rows (expected ${table.expected})`);
    }
  }

  console.log('\n✅ Seeding completed!');
  console.log('\nSummary:');
  console.log(`  • Conditions: ${results.conditions.count}`);
  console.log(`  • Ingredients: ${results.ingredients.count}`);
  console.log(`  • Root causes: ${results.root_causes.count}`);
  console.log(`  • Mechanisms: ${results.mechanisms.count}`);
  console.log(`  • Supplements: ${results.supplements.count}`);
  console.log(`  • Cause links: ${results.cause_condition_links.count}`);
  console.log(`  • Mechanism chains: ${results.mechanism_chains.count}`);
}

// Run the seeding function
seedDatabase().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
