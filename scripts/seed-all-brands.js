const { createClient } = require('@supabase/supabase-js');
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

async function seedBrand(fileName) {
  try {
    const products = require('../skincare-research/data/' + fileName);
    const validCategories = ['cleanser', 'moisturizer', 'serum', 'toner', 'exfoliant', 'sunscreen', 'mask', 'eye_cream', 'treatment', 'supplement', 'other'];
    
    // Get existing slugs
    const { data: existing } = await supabase.from('products').select('slug');
    const existingSlugs = new Set(existing.map(p => p.slug));
    
    const records = products.map(prod => {
      let slug = prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      let counter = 1;
      while (existingSlugs.has(slug)) {
        slug = prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + counter;
        counter++;
      }
      existingSlugs.add(slug);
      
      return {
        name: prod.name,
        brand: prod.brand,
        slug: slug,
        category: validCategories.includes(prod.category) ? prod.category : 'other',
        price: parsePrice(prod.price_range),
        currency: 'USD',
        ingredients: prod.key_ingredients || [],
        concerns: prod.best_for || [],
        rating: prod.evidence_grade === 'A' ? 5.0 : prod.evidence_grade === 'B' ? 4.0 : 3.0,
        review_count: 0
      };
    });
    
    const { data, error } = await supabase.from('products').insert(records);
    if (error) {
      console.error('❌ ' + fileName + ':', error.message);
      return 0;
    } else {
      console.log('✅ ' + fileName + ':', records.length, 'products');
      return records.length;
    }
  } catch (err) {
    console.log('⚠️ ' + fileName + ':', err.message);
    return 0;
  }
}

async function seedAll() {
  console.log('🌱 Seeding all brand products...\n');
  
  const brands = [
    'products-environ.json',
    'products-osmosis.json', 
    'products-is-clinical.json',
    'products-skinceuticals.json',
    'products-zo-skin-health.json',
    'products-biologique-recherche.json',
    'products-pca-skin.json',
    'products-aesop.json'
  ];
  
  let total = 0;
  for (const brand of brands) {
    total += await seedBrand(brand);
  }
  
  console.log('\n📊 Total seeded:', total);
}

seedAll();
