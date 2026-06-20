import json
import requests
import os

# Supabase config
SUPABASE_URL = "https://cnzoilxsttoqtvwotexd.supabase.co"
ANON_KEY = "eyJhbG…Tm_Q"

# Read seed data
with open('knowledge-graph/seed-data.json', 'r') as f:
    data = json.load(f)

print(f"Total ingredients in seed data: {len(data['ingredients'])}")

# Category mapping - ALL edge cases handled
category_map = {
    'nsaid': 'NSAID',
    'jak-inhibitor': 'JAK-inhibitor',
    'pha': 'PHA',
    'pde4-inhibitor': 'immune-modulator',
}

# Valid schema categories (from schema.sql)
valid_categories = {
    'retinoid', 'aha', 'bha', 'vitamin', 'antioxidant', 'peptide', 'humectant',
    'emollient', 'occlusive', 'sunscreen', 'botanical', 'preservative', 'fragrance',
    'surfactant', 'other', 'antimicrobial', 'depigmenting', 'mineral', 'fatty-acid',
    'barrier-repair', 'keratolytic', 'antifungal', 'antiparasitic', 'calcineurin-inhibitor',
    'corticosteroid', 'chemotherapy', 'immune-modulator', 'JAK-inhibitor', 'anti-androgen',
    'insulin-sensitizer', 'photoprotectant', 'protein', 'flavonoid', 'anti-inflammatory',
    'antiviral', 'amino-acid', 'soothing', 'wound-healing', 'brightening', 'retinoid-alternative',
    'antiproliferative', 'NSAID', 'microtubule-inhibitor', 'hormonal', 'antibiotic',
    'immunosuppressant', 'biologic', 'phototherapy', 'injectable', 'procedure', 'energy-device',
    'laser', 'vitamin-d-analog', 'neuro-peptide', 'anti-elastase-peptide', 'probiotic',
    'PHA', 'protective-extremolyte', 'regenerative-biocompatible'
}

# Evidence level mapping
evidence_map = {
    'A': 'A', 'A+': 'A+', 'A-': 'A-', 'B': 'B', 'B+': 'B+', 'B-': 'B-',
    'C': 'C', 'C+': 'C+', 'C-': 'C-', 'D': 'D',
    'strong': 'strong', 'moderate': 'moderate', 'emerging': 'emerging', 'limited': 'limited'
}

# Transform ingredients
fixed_ingredients = []
errors = []

for ing in data['ingredients']:
    try:
        # Map category
        raw_cat = ing.get('category', 'other')
        mapped_cat = category_map.get(raw_cat, raw_cat)
        
        if mapped_cat not in valid_categories:
            errors.append(f"Invalid category '{mapped_cat}' for {ing.get('name')}")
            mapped_cat = 'other'
        
        # Map evidence level
        raw_evidence = ing.get('evidence_level') or ing.get('evidence', 'C')
        if isinstance(raw_evidence, str) and raw_evidence.upper() in evidence_map:
            evidence = evidence_map[raw_evidence.upper()]
        else:
            evidence = 'C'
        
        fixed_ingredients.append({
            'id': ing.get('id'),
            'name': ing['name'],
            'slug': ing.get('slug') or ing.get('id'),
            'inci_name': ing.get('inci_name'),
            'category': mapped_cat,
            'description': ing.get('description') or f"{ing['name']} is used in skincare.",
            'evidence_level': evidence,
            'pubmed_ids': ing.get('pubmed_ids', []),
            'concerns': ing.get('concerns', []),
            'skin_types': ing.get('skin_types', []),
            'interactions': ing.get('interactions', []),
            'pregnancy_safe': ing.get('pregnancy_safe'),
            'min_concentration': ing.get('min_concentration'),
            'max_concentration': ing.get('max_concentration')
        })
    except Exception as e:
        errors.append(f"Error processing {ing.get('name', 'UNKNOWN')}: {e}")

print(f"Successfully transformed: {len(fixed_ingredients)} ingredients")
print(f"Errors: {len(errors)}")
if errors:
    for err in errors[:10]:
        print(f"  - {err}")

# Write to file for insertion
with open('/tmp/fixed-ingredients.json', 'w') as f:
    json.dump(fixed_ingredients, f, indent=2)

print(f"\nFixed ingredients written to /tmp/fixed-ingredients.json")
print(f"Ready for database insertion")
