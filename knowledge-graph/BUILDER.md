# Knowledge Graph Builder for SKINgenius

This script parses all 16 research reports and builds a structured knowledge graph.

## Strategy
1. Read each file and identify entities (conditions, ingredients, mechanisms, etc.)
2. Extract relationships between entities
3. Assign evidence levels and source citations
4. Deduplicate entities across files
5. Output as structured JSON

## Entity Types
- **Condition**: Skin conditions with ICD-10 codes
- **RootCause**: Internal health factors
- **Mechanism**: Biological pathways
- **Treatment**: Products, supplements, procedures
- **Ingredient**: Active skincare ingredients
- **Medication**: Prescription drugs
- **Nutrient**: Vitamins, minerals, supplements
- **RiskFactor**: Age, pregnancy, skin type, etc.

## Edge Types
- causes (RootCause → Condition)
- mechanism (Mechanism connects RootCause ↔ Condition)
- treats (Treatment → Condition)
- contains (Treatment → Ingredient)
- interacts_with (Medication → Treatment/Ingredient)
- contraindicated_for (Treatment → RiskFactor)
- supports (Nutrient → Mechanism)
- aggravates (RiskFactor → Condition)
- fitzpatrick_safe / fitzpatrick_caution / fitzpatrick_avoid

## Evidence Levels
- A: Strong RCT evidence
- B: Moderate evidence
- C: Case studies/expert opinion
- D: Emerging/theoretical
