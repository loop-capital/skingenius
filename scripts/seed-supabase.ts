import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { existsSync, readFileSync } from 'fs';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing Supabase URL or service role key in .env.local');
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

// Map evidence levels from seed data to schema enum (A, B, C, D)
const mapEvidenceLevel = (level: string): string => {
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
    'limited': 'C',
    'emerging': 'D',
    'D': 'D',
    'insufficient': 'D'
  };
  return mapping[level] || 'C';
};

// Map domain to body_system
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
          evidence_level: mapEvidenceLevel(rc.evidence)
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
          evidence_level: mapEvidenceLevel(rc.evidence)
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
          evidence_level: mapEvidenceLevel(supp.evidence || 'moderate'),
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
          evidence_level: mapEvidenceLevel(rc.evidence)
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
          evidence_level: mapEvidenceLevel(rc.evidence)
        });
      }
    });
  });

  return chains;
};

// Check if tables exist
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
  const requiredTables = ['root_causes', 'mechanisms', 'supplements', 'cause_condition_links', 'mechanism_chains'];
  const tableStatus = await checkTablesExist(requiredTables);

  const missingTables = requiredTables.filter(t => !tableStatus[t]);
  if (missingTables.length > 0) {
    console.error(`\n❌ Missing tables: ${missingTables.join(', ')}`);
    console.error('⚠️  Please run supabase/complete-setup.sql in the Supabase SQL Editor first.');
    console.error('\nInstructions:');
    console.error('1. Go to https://supabase.com/dashboard/project/cnzoilxsttoqtvwotexd/sql-editor');
    console.error('2. Copy the contents of supabase/complete-setup.sql');
    console.error('3. Paste and run the SQL');
    console.error('4. Re-run this script');
    process.exit(1);
  }

  console.log('✓ All required tables exist\n');

  const results = {
    root_causes: { count: 0, errors: 0 },
    mechanisms: { count: 0, errors: 0 },
    supplements: { count: 0, errors: 0 },
    cause_condition_links: { count: 0, errors: 0 },
    mechanism_chains: { count: 0, errors: 0 }
  };

  // 1. Seed root_causes
  console.log('🔬 Seeding root_causes...');
  const rootCauses = extractRootCauses(seedData.conditions || []);
  const rootCauseResult = await seedTable('root_causes', rootCauses);
  results.root_causes = rootCauseResult;
  console.log(`  ✓ ${rootCauseResult.success} root causes seeded${rootCauseResult.errors > 0 ? ` (${rootCauseResult.errors} errors)` : ''}`);

  // 2. Seed mechanisms
  console.log('\n⚙️  Seeding mechanisms...');
  const mechanisms = extractMechanisms(seedData.conditions || []);
  const mechanismResult = await seedTable('mechanisms', mechanisms);
  results.mechanisms = mechanismResult;
  console.log(`  ✓ ${mechanismResult.success} mechanisms seeded${mechanismResult.errors > 0 ? ` (${mechanismResult.errors} errors)` : ''}`);

  // 3. Seed supplements
  console.log('\n💊 Seeding supplements...');
  const supplements = extractSupplements(seedData.conditions || []);
  const supplementResult = await seedTable('supplements', supplements);
  results.supplements = supplementResult;
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
