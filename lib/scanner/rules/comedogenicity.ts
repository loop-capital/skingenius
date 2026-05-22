/**
 * Comedogenicity Ratings (0-5 Scale)
 * Standardized ratings for common skincare ingredients.
 * 0 = non-comedogenic | 5 = highly comedogenic
 *
 * Sources: INCIDecoder classifications, dermatological literature,
 * standard comedogenicity indices (Fulton et al., Morris & Kassa).
 */

export interface ComedogenicEntry {
  ingredientPattern: string; // lowercase partial match
  rating: number; // 0-5
  source: string;
  notes?: string;
}

export const COMEDOGENIC_RATINGS: ComedogenicEntry[] = [
  // --- 0 — Non-comedogenic ---
  { ingredientPattern: "water", rating: 0, source: "standard", notes: "Universal solvent, non-comedogenic." },
  { ingredientPattern: "hyaluronic acid", rating: 0, source: "standard", notes: "Humectant, non-comedogenic." },
  { ingredientPattern: "sodium hyaluronate", rating: 0, source: "standard", notes: "Salt form of hyaluronic acid." },
  { ingredientPattern: "glycerin", rating: 0, source: "standard", notes: "Humectant, safe for all skin types." },
  { ingredientPattern: "niacinamide", rating: 0, source: "standard", notes: "Regulates sebum, anti-inflammatory." },
  { ingredientPattern: "vitamin c", rating: 0, source: "standard", notes: "Antioxidant, non-comedogenic." },
  { ingredientPattern: "ascorbic acid", rating: 0, source: "standard", notes: "Pure form of Vitamin C." },
  { ingredientPattern: "azelaic acid", rating: 0, source: "standard", notes: "Anti-acne, anti-inflammatory." },
  { ingredientPattern: "salicylic acid", rating: 0, source: "standard", notes: "BHA, penetrates pores, anti-comedogenic." },
  { ingredientPattern: "green tea", rating: 0, source: "standard", notes: "Antioxidant, anti-inflammatory." },
  { ingredientPattern: "allantoin", rating: 0, source: "standard", notes: "Soothing, healing." },
  { ingredientPattern: "panthenol", rating: 0, source: "standard", notes: "Pro-vitamin B5, hydrating." },
  { ingredientPattern: "zinc oxide", rating: 0, source: "standard", notes: "Physical sunscreen, soothing." },
  { ingredientPattern: "titanium dioxide", rating: 0, source: "standard", notes: "Physical sunscreen." },
  { ingredientPattern: "aloe vera", rating: 0, source: "standard", notes: "Soothing gel." },
  { ingredientPattern: "ceramide", rating: 0, source: "standard", notes: "Barrier lipids, non-comedogenic." },
  { ingredientPattern: "peptide", rating: 0, source: "standard", notes: "Signal molecules, non-comedogenic." },
  { ingredientPattern: "squalane", rating: 0, source: "standard", notes: "Lightweight emollient, non-comedogenic (hydrogenated squalene)." },
  { ingredientPattern: "centella", rating: 0, source: "standard", notes: "Anti-inflammatory, wound healing." },
  { ingredientPattern: "tea tree oil", rating: 0, source: "standard", notes: "Antimicrobial, anti-acne." },

  // --- 1 — Very Low ---
  { ingredientPattern: "dimethicone", rating: 1, source: "standard", notes: "Silicone emollient, occlusive but generally well-tolerated." },
  { ingredientPattern: "cyclomethicone", rating: 1, source: "standard", notes: "Volatile silicone, evaporates." },
  { ingredientPattern: "butylene glycol", rating: 1, source: "standard", notes: "Humectant/solvent, very low comedogenicity." },
  { ingredientPattern: "propylene glycol", rating: 1, source: "standard", notes: "Solvent/humectant." },
  { ingredientPattern: "tetrahexyldecyl ascorbate", rating: 1, source: "standard", notes: "Oil-soluble Vitamin C derivative." },
  { ingredientPattern: "ethylhexylglycerin", rating: 1, source: "standard", notes: "Preservative boost, skin-conditioning." },
  { ingredientPattern: "xanthan gum", rating: 1, source: "standard", notes: "Thickener." },
  { ingredientPattern: "carbomer", rating: 1, source: "standard", notes: "Gelling agent." },

  // --- 2 — Low ---
  { ingredientPattern: "cetearyl alcohol", rating: 2, source: "standard", notes: "Fatty alcohol, emulsifier." },
  { ingredientPattern: "cetyl alcohol", rating: 2, source: "standard", notes: "Fatty alcohol, thickener." },
  { ingredientPattern: "stearyl alcohol", rating: 2, source: "standard", notes: "Fatty alcohol." },
  { ingredientPattern: "glyceryl stearate", rating: 2, source: "standard", notes: "Emulsifier." },
  { ingredientPattern: "shea butter", rating: 2, source: "standard", notes: "Rich emollient, generally well-tolerated." },
  { ingredientPattern: "jojoba oil", rating: 2, source: "standard", notes: "Wax ester similar to sebum." },
  { ingredientPattern: "sunflower seed oil", rating: 2, source: "standard", notes: "High linoleic acid content." },
  { ingredientPattern: "safflower seed oil", rating: 2, source: "standard", notes: "High linoleic acid." },
  { ingredientPattern: "tocopherol", rating: 2, source: "standard", notes: "Vitamin E, antioxidant." },
  { ingredientPattern: "lecithin", rating: 2, source: "standard", notes: "Emulsifier, phospholipid." },
  { ingredientPattern: "sorbitan oleate", rating: 2, source: "standard", notes: "Emulsifier." },
  { ingredientPattern: "retinol", rating: 2, source: "standard", notes: "Can cause purging but not truly comedogenic." },
  { ingredientPattern: "lactic acid", rating: 2, source: "standard", notes: "AHA, can irritate but not comedogenic." },
  { ingredientPattern: "glycolic acid", rating: 2, source: "standard", notes: "AHA." },
  { ingredientPattern: "urea", rating: 2, source: "standard", notes: "Humectant/keratolytic at higher %." },
  { ingredientPattern: "bentonite", rating: 2, source: "standard", notes: "Clay, absorbent." },
  { ingredientPattern: "kaolin", rating: 2, source: "standard", notes: "Clay, absorbent." },

  // --- 3 — Moderate ---
  { ingredientPattern: "isopropyl palmitate", rating: 3, source: "standard", notes: "Emollient ester, can clog pores in acne-prone skin." },
  { ingredientPattern: "isopropyl myristate", rating: 3, source: "standard", notes: "Common emollient, problematic for some." },
  { ingredientPattern: "oleth-3", rating: 3, source: "standard", notes: "Emulsifier." },
  { ingredientPattern: "oleyl alcohol", rating: 3, source: "standard", notes: "Fatty alcohol." },
  { ingredientPattern: "laureth-4", rating: 3, source: "standard", notes: "Surfactant/emulsifier." },
  { ingredientPattern: "stearic acid", rating: 3, source: "standard", notes: "Fatty acid, can be comedogenic at high concentrations." },
  { ingredientPattern: "myristic acid", rating: 3, source: "standard", notes: "Fatty acid." },
  { ingredientPattern: "lanolin", rating: 3, source: "standard", notes: "Wool wax, can be sensitizing." },
  { ingredientPattern: "cocoa butter", rating: 3, source: "standard", notes: "Rich occlusive, moderately comedogenic." },
  { ingredientPattern: "grapeseed oil", rating: 3, source: "standard", notes: "Generally safe but variable reports." },
  { ingredientPattern: "sesame oil", rating: 3, source: "standard", notes: "Moderately comedogenic." },

  // --- 4 — Fairly High ---
  { ingredientPattern: "linoleic acid", rating: 4, source: "standard", notes: "Essential fatty acid, paradoxically beneficial for acne but rated 4 in some indices." },
  { ingredientPattern: "oleic acid", rating: 4, source: "standard", notes: "Disrupts skin barrier lipid organization." },
  { ingredientPattern: "lanolin alcohol", rating: 4, source: "standard", notes: "Derivatives can be problematic." },
  { ingredientPattern: "coconut oil", rating: 4, source: "standard", notes: "Highly occlusive, rich in lauric acid — can be comedogenic for many." },
  { ingredientPattern: "mink oil", rating: 4, source: "standard", notes: "Animal-derived oil." },
  { ingredientPattern: "sulfated jojoba oil", rating: 4, source: "standard", notes: "Modified jojoba, different properties." },
  { ingredientPattern: "hexadecyl alcohol", rating: 4, source: "standard", notes: "Fatty alcohol." },

  // --- 5 — Highly Comedogenic ---
  { ingredientPattern: "wheat germ oil", rating: 5, source: "standard", notes: "Very rich, highly comedogenic." },
  { ingredientPattern: "oleth-3 phosphate", rating: 5, source: "standard", notes: "Surfactant." },
  { ingredientPattern: "decyl oleate", rating: 5, source: "standard", notes: "Emollient ester." },
  { ingredientPattern: "isocetyl stearate", rating: 5, source: "standard", notes: "Emollient ester." },
  { ingredientPattern: "isopropyl isostearate", rating: 5, source: "standard", notes: "Emollient ester." },
  { ingredientPattern: "myristyl myristate", rating: 5, source: "standard", notes: "Emollient ester." },
  { ingredientPattern: "oleth-10", rating: 5, source: "standard", notes: "Emulsifier." },
  { ingredientPattern: "oleyl alcohol", rating: 5, source: "standard", notes: "Fatty alcohol (duplicate with 3, but some sources rate 5)." },
  { ingredientPattern: "petrolatum", rating: 5, source: "standard", notes: "Highly occlusive; some indices rate 5, others 0. Use with caution on acne-prone skin." },
];

/**
 * Look up the comedogenic rating for an ingredient.
 */
export function getComedogenicRating(ingredientName: string): ComedogenicEntry | null {
  const normalized = ingredientName.toLowerCase();
  return (
    COMEDOGENIC_RATINGS.find((entry) => normalized.includes(entry.ingredientPattern)) || null
  );
}

/**
 * Batch rating for a list of ingredients.
 */
export function batchComedogenicRatings(ingredientNames: string[]): Map<string, number | null> {
  const map = new Map<string, number | null>();
  for (const name of ingredientNames) {
    const entry = getComedogenicRating(name);
    map.set(name, entry ? entry.rating : null);
  }
  return map;
}

/**
 * Calculate average comedogenic rating for a product (0-5).
 * Unknown ingredients default to 1 (slight caution).
 */
export function averageComedogenicRating(ingredientNames: string[]): number {
  if (ingredientNames.length === 0) return 0;
  let total = 0;
  for (const name of ingredientNames) {
    const entry = getComedogenicRating(name);
    total += entry ? entry.rating : 1; // default unknown = 1
  }
  return parseFloat((total / ingredientNames.length).toFixed(1));
}
