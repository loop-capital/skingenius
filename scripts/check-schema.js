const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function checkTables() {
  // Try to insert minimal test records to see what columns exist
  const tables = ['ingredients', 'products', 'skin_conditions', 'profiles', 'skin_photos'];
  
  for (const table of tables) {
    console.log(`\n📊 Checking ${table}...`);
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`  ❌ ${error.message}`);
    } else {
      console.log(`  ✅ Table exists, ${data.length} rows`);
      if (data.length > 0) {
        console.log(`  Columns: ${Object.keys(data[0]).join(', ')}`);
      }
    }
  }
}

checkTables();
