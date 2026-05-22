# Evidence Scoring Algorithm

## Purpose
Score every ingredient-condition combination by evidence quality, so recommendations are ranked by scientific confidence.

## Evidence Levels

### Level 1: Meta-Analysis / Systematic Review
- Multiple RCTs synthesized
- **Score: 10**
- Examples: Cochrane review, AAD guidelines

### Level 2: Randomized Controlled Trial (RCT)
- Controlled, randomized, peer-reviewed
- **Score: 8**
- Examples: Retinol vs placebo for wrinkles (RCT)

### Level 3: Clinical Study (Non-Randomized)
- Cohort, case-control, or open-label
- **Score: 6**
- Examples: Before/after niacinamide study

### Level 4: Mechanistic / In Vitro
- Cell culture, ex vivo, theoretical mechanism
- **Score: 4**
- Examples: Antioxidant capacity in cell culture

### Level 5: Anecdotal / Traditional Use
- Case reports, traditional medicine, no controlled study
- **Score: 2**
- Examples: "Has been used for centuries..."

## Ingredient-Condition Matrix Scoring

For each ingredient + condition pair, score on 5 dimensions:

### 1. Evidence Quality (E)
- Level 1 = 10, Level 2 = 8, Level 3 = 6, Level 4 = 4, Level 5 = 2
- Weight: 40% of total

### 2. Concentration Efficacy (C)
- Proven effective at concentration used: 10
- Effective at higher concentration: 6
- No concentration data: 2
- Weight: 20% of total

### 3. Safety Margin (S)
- Safe at 2x+ effective concentration: 10
- Safe at effective concentration: 8
- Irritation risk at effective concentration: 4
- Known allergen/sensitizer: 2
- Weight: 20% of total

### 4. Mechanism Match (M)
- Directly addresses known root cause: 10
- Addresses symptom not root cause: 6
- Adjunctive benefit only: 4
- No known mechanism: 2
- Weight: 15% of total

### 5. Clinical Outcomes (O)
- Statistically significant improvement in RCT: 10
- Trend toward improvement: 6
- Mechanism only, no outcome data: 4
- No outcome data: 2
- Weight: 5% of total

## Final Score Calculation
```
Total = (E × 0.40) + (C × 0.20) + (S × 0.20) + (M × 0.15) + (O × 0.05)
```

### Grade Interpretation
- **9.0-10.0: A+** — Gold standard, recommend first-line
- **8.0-8.9: A** — Strong evidence, recommend confidently
- **7.0-7.9: B+** — Good evidence, recommend
- **6.0-6.9: B** — Moderate evidence, consider
- **5.0-5.9: C+** — Limited evidence, may help
- **4.0-4.9: C** — Weak evidence, adjunct only
- **2.0-3.9: D** — Minimal evidence, don't rely on
- **0-1.9: F** — No evidence or harmful

## Safety Override
Regardless of score, ingredients with safety flags are:
- **RED (Do not recommend)**: Known teratogen, interacts with user's medication
- **YELLOW (Caution)**: Mild interaction possible, user discretion
- **GREEN (Safe)**: No known contraindications for this user

## Example Scoring: Retinol for Photoaging

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Evidence Quality | 8 (multiple RCTs) | 0.40 | 3.2 |
| Concentration Efficacy | 10 (0.3-1% proven) | 0.20 | 2.0 |
| Safety Margin | 6 (irritation common) | 0.20 | 1.2 |
| Mechanism Match | 10 (direct collagen synthesis) | 0.15 | 1.5 |
| Clinical Outcomes | 10 (significant wrinkle reduction) | 0.05 | 0.5 |
| **Total** | | | **8.4 (A)** |

**Recommendation**: Strong recommendation for photoaging, with slow introduction protocol to manage irritation.

## Implementation

### Database Schema
```sql
create table ingredient_condition_scores (
  id uuid primary key default gen_random_uuid(),
  ingredient_id uuid references ingredients(id),
  condition_id uuid references skin_conditions(id),
  evidence_level integer not null, -- 1-5
  evidence_score decimal(3,1) not null, -- 0-10
  concentration_efficacy integer not null, -- 2-10
  safety_margin integer not null, -- 2-10
  mechanism_match integer not null, -- 2-10
  clinical_outcomes integer not null, -- 2-10
  total_score decimal(3,1) not null, -- calculated
  grade text not null, -- A+, A, B+, B, C+, C, D, F
  primary_studies jsonb, -- [{pmid, title, level, findings}]
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(ingredient_id, condition_id)
);
```

### API Endpoint
```
GET /api/ingredients/[id]/scores?condition=[condition_slug]
Response: { scores: {...}, studies: [...], recommendation: {...} }
```

## Next Steps
1. Score top 20 ingredients for each major condition (acne, photoaging, hyperpigmentation, rosacea, eczema)
2. Build scoring UI for researchers to input evidence
3. Create recommendation engine that queries scores + applies safety filters
4. Display evidence grade to users with expandable study details

---
*Created: 2026-05-14*
*Next review: After 50 ingredients scored*
