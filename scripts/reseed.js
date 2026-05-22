const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function parsePrice(priceRange) {
  if (!priceRange) return null;
  const match = priceRange.match(/\$?([0-9]+)[\s-]*(?:\$?)?([0-9]+)?/);
  if (!match) return null;
  const min = parseFloat(match[1]);
  const max = match[2] ? parseFloat(match[2]) : min;
  return (min + max) / 2;
}

async function reseedProducts() {
  console.log('🧴 Reseeding products with correct prices...');
  
  const products = JSON.parse(fs.readFileSync('skincare-research/data/product-seed.json'));
  
  // Clear existing
  await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  const validCategories = ['cleanser', 'moisturizer', 'serum', 'toner', 'exfoliant', 'sunscreen', 'mask', 'eye_cream', 'treatment', 'supplement', 'other'];
  const mapping = {
    'moisturizer': 'moisturizer', 'serum': 'serum', 'treatment': 'treatment',
    'cleanser': 'cleanser', 'sunscreen': 'sunscreen', 'eye cream': 'eye_cream',
    'toner': 'toner', 'exfoliant': 'exfoliant', 'healing balm': 'treatment'
  };
  
  const records = products.map(prod => ({
    name: prod.name,
    brand: prod.brand,
    slug: prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    category: mapping[prod.category] || 'other',
    price: parsePrice(prod.price_range),
    currency: 'USD',
    ingredients: prod.key_ingredients || [],
    concerns: prod.best_for || [],
    rating: prod.evidence_grade === 'A' ? 5.0 : prod.evidence_grade === 'B' ? 4.0 : 3.0
  }));
  
  // Handle duplicate slugs
  const seen = new Set();
  records.forEach(r => {
    let slug = r.slug;
    let counter = 1;
    while (seen.has(slug)) {
      slug = `${r.slug}-${counter}`;
      counter++;
    }
    seen.add(slug);
    r.slug = slug;
  });
  
  const { data, error } = await supabase.from('products').insert(records);
  if (error) {
    console.error('❌ Error:', error.message);
  } else {
    console.log(`✅ Inserted ${records.length} products`);
  }
  
  // Verify
  const { data: verify } = await supabase.from('products').select('name, price').limit(5);
  console.log('\nSample prices:');
  verify.forEach(p => console.log(`  ${p.name}: $${p.price}`));
}

reseedProducts();
