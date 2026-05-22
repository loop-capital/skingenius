import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const conditionCategoryMap: Record<string, string> = {
  'Acne Vulgaris': 'acne',
  'Atopic Dermatitis (Eczema)': 'sensitivity',
  'Rosacea': 'redness',
  'Psoriasis': 'other',
  'Contact Dermatitis': 'sensitivity',
  'Melasma': 'pigmentation',
  'Seborrheic Dermatitis': 'other',
  'Actinic Keratosis': 'sun_damage',
  'Hyperhidrosis': 'other',
  'Alopecia Areata': 'other',
  'Vitiligo': 'pigmentation',
  'Hives (Urticaria)': 'sensitivity',
  'Keratosis Pilaris': 'texture',
  'Dry Skin (Xerosis)': 'hydration',
};

async function seedConditions() {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'skincare-research/data/skin-conditions.json'), 'utf-8'));
  
  const rows = data.map((item: any) => ({
    name: item.name,
    slug: slugify(item.name),
    category: conditionCategoryMap[item.name] || 'other',
    description: item.description,
    requires_dermatologist: item.when_to_see_dermatologist?.length > 0,
  }));

  const { error } = await supabase.from('skin_conditions').insert(rows);
  if (error) {
    // Try one by one for better error messages
    for (const row of rows) {
      const { error: e } = await supabase.from('skin_conditions').insert(row);
      if (e) console.error(`Error inserting ${row.name}:`, e.message);
      else console.log(`✅ Inserted condition: ${row.name}`);
    }
  } else {
    console.log(`✅ Inserted ${rows.length} skin conditions`);
  }
}

async function seedIngredients() {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'skincare-research/data/ingredient-database.json'), 'utf-8'));
  
  const categoryMap: Record<string, string> = {
    'humectant': 'humectant',
    'antioxidant': 'antioxidant',
    'exfoliant': 'aha',
    'retinoid': 'retinoid',
    'peptide': 'peptide',
    'botanical': 'botanical',
    'vitamin': 'vitamin',
    'sunscreen': 'sunscreen',
    'emollient': 'emollient',
    'occlusive': 'occlusive',
    'anti-inflammatory': 'botanical',
    'skin-barrier': 'emollient',
    'brightening': 'botanical',
  };

  const evidenceMap: Record<string, string> = {
    'Strong': 'strong',
    'Moderate': 'moderate',
    'Emerging': 'emerging',
    'Limited': 'limited',
  };

  const rows = data.map((item: any) => ({
    name: item.name,
    slug: slugify(item.name),
    inci_name: item.inci_name || null,
    category: categoryMap[item.category?.toLowerCase()] || 'other',
    description: item.function || item.description || null,
    evidence_level: evidenceMap[item.evidence_level] || 'emerging',
    concerns: item.best_for || item.concerns || [],
    skin_types: item.skin_types || [],
    pregnancy_safe: item.pregnancy_safe ?? null,
  }));

  const { error } = await supabase.from('ingredients').insert(rows);
  if (error) {
    for (const row of rows) {
      const { error: e } = await supabase.from('ingredients').insert(row);
      if (e) console.error(`Error inserting ${row.name}:`, e.message);
      else console.log(`✅ Inserted ingredient: ${row.name}`);
    }
  } else {
    console.log(`✅ Inserted ${rows.length} ingredients`);
  }
}

async function seedProducts() {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'skincare-research/data/product-seed.json'), 'utf-8'));
  
  const categoryMap: Record<string, string> = {
    'cleanser': 'cleanser',
    'moisturizer': 'moisturizer',
    'serum': 'serum',
    'sunscreen': 'sunscreen',
    'exfoliant': 'exfoliant',
    'toner': 'toner',
    'mask': 'mask',
    'treatment': 'treatment',
    'eye cream': 'eye_cream',
    'supplement': 'supplement',
  };

  const rows = data.map((item: any) => ({
    name: item.name,
    brand: item.brand,
    slug: slugify(`${item.brand} ${item.name}`),
    category: categoryMap[item.category?.toLowerCase()] || 'other',
    description: item.description || null,
    price: item.price || null,
    currency: 'USD',
    ingredients: item.key_ingredients || [],
    concerns: item.concerns || item.best_for || [],
    rating: item.rating || null,
  }));

  const { error } = await supabase.from('products').insert(rows);
  if (error) {
    for (const row of rows) {
      const { error: e } = await supabase.from('products').insert(row);
      if (e) console.error(`Error inserting ${row.name}:`, e.message);
      else console.log(`✅ Inserted product: ${row.brand} - ${row.name}`);
    }
  } else {
    console.log(`✅ Inserted ${rows.length} products`);
  }
}

async function main() {
  console.log('🌱 Seeding SKINgenius database...\n');
  
  console.log('📋 Seeding skin conditions...');
  await seedConditions();
  
  console.log('\n🧪 Seeding ingredients...');
  await seedIngredients();
  
  console.log('\n📦 Seeding products...');
  await seedProducts();
  
  console.log('\n✅ Seed complete!');
}

main().catch(console.error);