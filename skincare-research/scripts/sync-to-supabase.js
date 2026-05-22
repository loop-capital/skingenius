import { createClient } from '@supabase/supabase-js';
import { processProduct } from './ingredient-normalizer.js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = 'https://cnzoilxsttoqtvwotexd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Q4iko4izuuRBZpCrSVwUkA_-LEUAQny';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BRANDS = ['aesop', 'pca-skin', 'skinceuticals', 'zo-skin-health', 'biologique-recherche', 'is-clinical', 'osmosis', 'environ'];

async function syncProductsToDatabase() {
  console.log('🔄 Starting product sync to Supabase...\n');
  
  let totalProducts = 0;
  let totalIngredients = new Set();
  
  for (const brand of BRANDS) {
    const filePath = path.join(process.cwd(), 'skincare-research/data', `products-${brand}.json`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${brand}: No product file found`);
      continue;
    }
    
    const products = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`📦 ${brand}: ${products.length} products`);
    
    for (const product of products) {
      // Process with safety data
      const processed = processProduct(product);
      
      // Sync to Supabase
      const { data, error } = await supabase
        .from('products')
        .upsert({
          name: product.name,
          brand: product.brand,
          category: product.category,
          price_range: product.price_range,
          key_ingredients: product.key_ingredients || product.ingredients,
          best_for: product.best_for,
          evidence_grade: product.evidence_grade,
          ingredients_normalized: processed.ingredients_normalized,
          safety_summary: processed.safety_summary,
          updated_at: new Date().toISOString()
        }, {
          onConflict: ['name', 'brand']
        });
      
      if (error) {
        console.error(`  ❌ ${product.name}: ${error.message}`);
      } else {
        console.log(`  ✅ ${product.name}`);
        totalProducts++;
        (product.key_ingredients || product.ingredients || []).forEach(i => totalIngredients.add(i));
      }
    }
  }
  
  console.log(`\n🎉 Sync complete!`);
  console.log(`   Products: ${totalProducts}`);
  console.log(`   Unique ingredients: ${totalIngredients.size}`);
}

// Also create a function to upsert ingredients
async function syncIngredientsToDatabase() {
  console.log('\n🔄 Syncing ingredients to database...\n');
  
  const { INGREDIENT_DATABASE } = await import('./ingredient-normalizer.js');
  
  for (const [name, data] of Object.entries(INGREDIENT_DATABASE)) {
    const { error } = await supabase
      .from('ingredients')
      .upsert({
        name: name,
        inci_name: data.inci,
        category: data.category,
        safe_pregnancy: data.safe_pregnancy,
        safe_breastfeeding: data.safe_breastfeeding,
        interactions: data.interactions,
        allergy_warnings: data.allergies,
        notes: data.notes,
        updated_at: new Date().toISOString()
      }, {
        onConflict: ['name']
      });
    
    if (error) {
      console.error(`  ❌ ${name}: ${error.message}`);
    } else {
      console.log(`  ✅ ${name} (${data.inci})`);
    }
  }
  
  console.log('\n🎉 Ingredients sync complete!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  syncProductsToDatabase().catch(console.error);
  syncIngredientsToDatabase().catch(console.error);
}

export { syncProductsToDatabase, syncIngredientsToDatabase };
