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

async function fixPrices() {
  console.log('🔧 Fixing product prices...');
  
  const { data: products, error } = await supabase.from('products').select('id, name, price, currency');
  if (error) {
    console.error('❌ Error fetching products:', error.message);
    return;
  }
  
  let fixed = 0;
  for (const product of products) {
    // Check if price looks wrong (too high)
    if (product.price > 1000) {
      const correctPrice = parsePrice(product.name); // This won't work, need original data
      console.log(`  ⚠️  ${product.name}: $${product.price} looks wrong, but need original data to fix`);
    }
  }
  
  console.log('\n💡 Need to reseed with proper price parsing');
}

fixPrices();
