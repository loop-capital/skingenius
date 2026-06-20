#!/usr/bin/env python3
"""
Fix SKINgenius seed data to match database schema.
- Adds slug, description fields to ingredients
- Maps evidence grades to schema values
- Parses concentration into min/max_concentration
"""

import json
import re

with open('knowledge-graph/seed-data.json', 'r') as f:
    data = json.load(f)

def parse_concentration(conc_str):
    """Parse concentration string like '2.5-5%' or '15-30mg (oral)' into min/max."""
    if not conc_str:
        return None, None
    
    # Remove text in parentheses
    conc_str = re.sub(r'\s*\([^)]*\)', '', conc_str).strip()
    
    # Match number ranges: 2.5-5% or 0.025-0.1% or 1000-2000mg
    match = re.match(r'^(\d+\.?\d*)\s*-\s*(\d+\.?\d*)\s*(%|mg|IU|g|mcg)?$', conc_str)
    if match:
        try:
            return float(match.group(1)), float(match.group(2))
        except ValueError:
            return None, None
    
    # Match single number: 2% or 50mg
    match = re.match(r'^(\d+\.?\d*)\s*(%|mg|IU|g|mcg)?$', conc_str)
    if match:
        try:
            val = float(match.group(1))
            return val, val
        except ValueError:
            return None, None
    
    # Match "2 cups daily" etc - not parseable as numeric
    return None, None


def generate_description(ing):
    """Generate description from available data if missing."""
    name = ing['name']
    cat = ing['category']
    conc = ing.get('concentration', '')
    mech = ing.get('mechanismOfAction', '')
    conds = ing.get('keyConditions', [])
    
    parts = [f"{name} is a {cat} ingredient used in skincare."]
    
    if conc:
        parts.append(f"Typical concentration: {conc}.")
    
    if mech:
        parts.append(f"Mechanism: {mech}.")
    
    if conds:
        conditions_str = ', '.join(conds[:5])
        if len(conds) > 5:
            conditions_str += f" and {len(conds)-5} more"
        parts.append(f"Used for: {conditions_str}.")
    
    return ' '.join(parts)


# Process ingredients
updated_count = 0
for ing in data.get('ingredients', []):
    # Add slug if missing
    if 'slug' not in ing:
        ing['slug'] = ing['id']  # Use existing id as slug
    
    # Add description if missing
    if 'description' not in ing or not ing['description']:
        ing['description'] = generate_description(ing)
        updated_count += 1
    
    # Map evidence values
    evidence = ing.get('evidence', 'B')
    # Keep as-is since we expanded schema to accept A, A-, B, B+, etc.
    ing['evidence_level'] = evidence
    
    # Parse concentration
    conc = ing.get('concentration', '')
    if conc:
        min_c, max_c = parse_concentration(conc)
        if min_c is not None:
            ing['min_concentration'] = min_c
            ing['max_concentration'] = max_c
    
    # Ensure pregnancy_safe is boolean
    if 'pregnancySafe' in ing:
        ing['pregnancy_safe'] = ing.pop('pregnancySafe')
    
    # Map keyConditions to concerns
    if 'keyConditions' in ing:
        ing['concerns'] = ing.pop('keyConditions')

print(f"Updated {updated_count} ingredients with generated descriptions")
print(f"Total ingredients: {len(data.get('ingredients', []))}")

# Validate all ingredients now have required fields
ings = data.get('ingredients', [])
issues = []
for ing in ings:
    if 'slug' not in ing:
        issues.append(f"{ing.get('name', 'UNKNOWN')}: missing slug")
    if 'description' not in ing or not ing['description']:
        issues.append(f"{ing.get('name', 'UNKNOWN')}: missing description")
    if 'category' not in ing:
        issues.append(f"{ing.get('name', 'UNKNOWN')}: missing category")

if issues:
    print(f"\nRemaining issues ({len(issues)}):")
    for issue in issues[:10]:
        print(f"  {issue}")
    if len(issues) > 10:
        print(f"  ... and {len(issues)-10} more")
else:
    print("\nAll ingredients have required fields!")

# Write updated seed data
with open('knowledge-graph/seed-data.json', 'w') as f:
    json.dump(data, f, indent=2)

print("\nSeed data updated successfully.")
