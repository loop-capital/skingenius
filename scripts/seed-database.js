#!/usr/bin/env node
/**
 * SKINgenius Database Seeder
 * Seeds the Supabase database with skincare research data
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials. Check .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function loadJson(filename) {
  const filepath = path.join(__dirname, '..', 'skincare-research', 'data', filename);
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}

function slugify(name, existingSlugs = new Set()) {
  let base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  let slug = base;
  let counter = 1;
  while (existingSlugs.has(slug)) {
    slug = `${base}-${counter}`;
    counter++;
  }
  existingSlugs.add(slug);
  return slug;
}

function mapIngredientCategory(cat) {
  const mapping = {
    'humectant': 'humectant', 'antioxidant': 'antioxidant', 'retinoid': 'retinoid',
    'vitamin': 'vitamin', 'lipid': 'emollient', 'peptide': 'peptide',
    'acid': 'aha', 'mineral sunscreen': 'sunscreen', 'soothing agent': 'botanical',
    'emollient': 'emollient', 'brightening agent': 'other', 'retinoid alternative': 'retinoid'
  };
  return mapping[cat] || 'other';
}

function mapProductCategory(cat) {
  const mapping = {
    'moisturizer': 'moisturizer', 'serum': 'serum', 'treatment': 'treatment',
    'cleanser': 'cleanser', 'sunscreen': 'sunscreen', 'eye cream': 'eye_cream',
    'toner': 'toner', 'exfoliant': 'exfoliant', 'healing balm': 'treatment'
  };
  return mapping[cat] || 'other';
}

function inferCategory(name) {
  const lower = name.toLowerCase();
  if (lower.includes('acne')) return 'acne';
  if (lower.includes('aging') || lower.includes('wrinkle')) return 'aging';
  if (lower.includes('pigment') || lower.includes('melasma')) return 'pigmentation';
  if (lower.includes('sensitive') || lower.includes('dermatitis') || lower.includes('eczema')) return 'sensitivity';
  if (lower.includes('dry') || lower.includes('hydrat')) return 'hydration';
  if (lower.includes('red') || lower.includes('rosacea')) return 'redness';
  if (lower.includes('texture') || lower.includes('scar') || lower.includes('pore')) return 'texture';
  if (lower.includes('sun') || lower.includes('photo')) return 'sun_damage';
  if (lower.includes('psoriasis')) return 'psoriasis';
  if (lower.includes('keratosis')) return 'keratosis';
  return 'other';
}

async function seedTable(tableName, filename, mapper) {
  console.log(`\n📋 Seeding ${tableName}...`);
  const data = await loadJson(filename);
  const existingSlugs = new Set();
  const records = data.map(item => mapper(item, existingSlugs));

  // Clear existing data first (optional - remove if you want to keep existing)
  const { error: deleteError } = await supabase.from(tableName).delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (deleteError) console.log(`  ⚠️  Could not clear table: ${deleteError.message}`);

  const batchSize = 50;
  let inserted = 0;
  
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { data: result, error } = await supabase.from(tableName).insert(batch);
    
    if (error) {
      console.error(`  ❌ Batch ${i/batchSize + 1} failed: ${error.message}`);
    } else {
      inserted += batch.length;
      console.log(`  ✅ Batch ${i/batchSize + 1}: ${batch.length} records`);
    }
  }
  
  console.log(`  📊 Total: ${inserted}`);
  return inserted;
}

async function main() {
  console.log('🌱 SKINgenius Database Seeder');
  console.log('================================');

  try {
    const ingredientCount = await seedTable('ingredients', 'ingredient-database.json', (ing, slugs) => ({
      name: ing.name,
      slug: slugify(ing.name, slugs),
      inci_name: ing.name,
      category: mapIngredientCategory(ing.category),
      description: ing.function,
      evidence_level: ing.evidence_level,
      concerns: ing.best_for || [],
      skin_types: ing.best_for || [],
      interactions: ing.cautions || [],
      min_concentration: ing.concentration_guide ? parseFloat(ing.concentration_guide.split('-')[0]) : null,
      max_concentration: ing.concentration_guide ? parseFloat(ing.concentration_guide.split('-')[1].replace('%', '')) : null
    }));

    const productCount = await seedTable('products', 'product-seed.json', (prod, slugs) => ({
      name: prod.name,
      brand: prod.brand,
      slug: slugify(prod.name, slugs),
      category: mapProductCategory(prod.category),
      price: prod.price_range ? parseFloat(prod.price_range.replace(/[^0-9.]/g, '').split('-')[0]) : null,
      currency: 'USD',
      ingredients: prod.key_ingredients || [],
      concerns: prod.best_for || [],
      rating: prod.evidence_grade === 'A' ? 5.0 : prod.evidence_grade === 'B' ? 4.0 : 3.0
    }));

    const conditionCount = await seedTable('skin_conditions', 'skin-conditions.json', (cond, slugs) => ({
      name: cond.name,
      slug: slugify(cond.name, slugs),
      category: inferCategory(cond.name),
      description: cond.description,
      severity_scale: 'mild_moderate_severe',
      requires_dermatologist: (cond.when_to_see_dermatologist || []).length > 2
    }));

    console.log('\n================================');
    console.log('✅ Seeding complete!');
    console.log(`📊 Ingredients: ${ingredientCount}`);
    console.log(`📊 Products: ${productCount}`);
    console.log(`📊 Skin Conditions: ${conditionCount}`);
    console.log('================================');

  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
  }
}

main();
