/**
 * Mock product data for SKINgenius
 * 8 sample products covering cleanser, toner, serums, moisturizer, sunscreen, treatment, eye cream
 */

export interface MockProduct {
  id: string;
  name: string;
  brand: string;
  price_tier: "$" | "$$" | "$$$";
  category: "cleanser" | "toner" | "serum" | "moisturizer" | "sunscreen" | "treatment" | "eye_cream" | "mask" | "oil" | "other";
  fit_score: number;
  evidence_level: "A" | "B" | "C" | "D";
  pregnancy_safe: boolean;
  key_actives: Array<{
    ingredient: string;
    concentration?: string;
    effectiveness: number;
  }>;
  conditions_addressed: string[];
  contraindications: string[];
  reasoning: string;
  price: number;
  currency: string;
  size: string;
}

export const mockProducts: MockProduct[] = [
  {
    id: "p-001",
    name: "Salicylic Acid Cleanser",
    brand: "CeraVe",
    price_tier: "$",
    category: "cleanser",
    fit_score: 94,
    evidence_level: "A",
    pregnancy_safe: false,
    key_actives: [
      { ingredient: "Salicylic Acid", concentration: "2%", effectiveness: 0.92 },
      { ingredient: "Ceramides", effectiveness: 0.78 },
      { ingredient: "Niacinamide", effectiveness: 0.85 },
    ],
    conditions_addressed: ["acne", "oily_skin", "congested_pores"],
    contraindications: ["pregnancy"],
    reasoning:
      "Salicylic acid is a beta-hydroxy acid (BHA) proven to penetrate pores and reduce acne lesions. The 2% concentration is the OTC maximum with strong clinical evidence. Ceramides offset potential dryness.",
    price: 16,
    currency: "USD",
    size: "237 ml",
  },
  {
    id: "p-002",
    name: "Glycolic Acid Toner",
    brand: "The Ordinary",
    price_tier: "$",
    category: "toner",
    fit_score: 88,
    evidence_level: "A",
    pregnancy_safe: false,
    key_actives: [
      { ingredient: "Glycolic Acid", concentration: "7%", effectiveness: 0.9 },
      { ingredient: "Amino Acids", effectiveness: 0.6 },
      { ingredient: "Aloe Vera", effectiveness: 0.55 },
    ],
    conditions_addressed: ["uneven_texture", "dullness", "post_acne_marks"],
    contraindications: ["pregnancy", "sensitive_skin"],
    reasoning:
      "Glycolic acid is the smallest AHA, penetrating quickly to accelerate cell turnover. 7% is an effective home-use concentration with extensive peer-reviewed support for texture improvement.",
    price: 11,
    currency: "USD",
    size: "240 ml",
  },
  {
    id: "p-003",
    name: "Vitamin C Suspension 23%",
    brand: "The Ordinary",
    price_tier: "$",
    category: "serum",
    fit_score: 91,
    evidence_level: "A",
    pregnancy_safe: true,
    key_actives: [
      { ingredient: "L-Ascorbic Acid", concentration: "23%", effectiveness: 0.94 },
      { ingredient: "Squalane", effectiveness: 0.72 },
    ],
    conditions_addressed: ["hyperpigmentation", "dullness", "fine_lines"],
    contraindications: ["sensitive_skin"],
    reasoning:
      "L-Ascorbic acid at 20%+ is the gold-standard for antioxidant photoprotection and collagen synthesis. Squalane vehicle reduces irritation potential. Use in AM under sunscreen.",
    price: 8,
    currency: "USD",
    size: "30 ml",
  },
  {
    id: "p-004",
    name: "Retinol 0.3% Serum",
    brand: "La Roche-Posay",
    price_tier: "$$",
    category: "serum",
    fit_score: 96,
    evidence_level: "A",
    pregnancy_safe: false,
    key_actives: [
      { ingredient: "Retinol", concentration: "0.3%", effectiveness: 0.95 },
      { ingredient: "Hyaluronic Acid", effectiveness: 0.8 },
      { ingredient: "Niacinamide", effectiveness: 0.85 },
    ],
    conditions_addressed: ["fine_lines", "uneven_texture", "acne", "hyperpigmentation"],
    contraindications: ["pregnancy", "breastfeeding"],
    reasoning:
      "Retinol is the most evidence-backed topical for photoaging and acne. 0.3% is an ideal introductory strength — effective yet tolerable. Always PM use; introduce 2–3x/week.",
    price: 48,
    currency: "USD",
    size: "30 ml",
  },
  {
    id: "p-005",
    name: "Barrier Repair Moisturizer",
    brand: "Paula's Choice",
    price_tier: "$$",
    category: "moisturizer",
    fit_score: 89,
    evidence_level: "A",
    pregnancy_safe: true,
    key_actives: [
      { ingredient: "Ceramides", effectiveness: 0.85 },
      { ingredient: "Niacinamide", effectiveness: 0.88 },
      { ingredient: "Hyaluronic Acid", effectiveness: 0.82 },
    ],
    conditions_addressed: ["dryness", "sensitivity", "compromised_barrier"],
    contraindications: [],
    reasoning:
      "Ceramide-dominant formulas restore the stratum corneum lipid matrix. Niacinamide upregulates barrier proteins. Supported by decades of dermatology literature.",
    price: 39,
    currency: "USD",
    size: "60 ml",
  },
  {
    id: "p-006",
    name: "UV Clear Broad-Spectrum SPF 46",
    brand: "EltaMD",
    price_tier: "$$",
    category: "sunscreen",
    fit_score: 92,
    evidence_level: "A",
    pregnancy_safe: true,
    key_actives: [
      { ingredient: "Zinc Oxide", concentration: "9%", effectiveness: 0.91 },
      { ingredient: "Niacinamide", concentration: "5%", effectiveness: 0.87 },
      { ingredient: "Hyaluronic Acid", effectiveness: 0.75 },
    ],
    conditions_addressed: ["sun_damage", "hyperpigmentation", "acne"],
    contraindications: [],
    reasoning:
      "Mineral UV filters (zinc oxide) provide broad-spectrum protection with low irritation risk. The 5% niacinamide offers added anti-inflammatory benefit for acne-prone skin.",
    price: 41,
    currency: "USD",
    size: "48 g",
  },
  {
    id: "p-007",
    name: "Azelaic Acid Suspension 10%",
    brand: "The Ordinary",
    price_tier: "$",
    category: "treatment",
    fit_score: 87,
    evidence_level: "A",
    pregnancy_safe: true,
    key_actives: [
      { ingredient: "Azelaic Acid", concentration: "10%", effectiveness: 0.89 },
      { ingredient: "Vitamin B5", effectiveness: 0.65 },
    ],
    conditions_addressed: ["rosacea", "acne", "hyperpigmentation"],
    contraindications: ["sensitivity_to_azelaic"],
    reasoning:
      "Azelaic acid is FDA-approved for rosacea and has robust data for post-inflammatory hyperpigmentation. 10% is the standard OTC concentration; well-tolerated across Fitzpatrick types.",
    price: 13,
    currency: "USD",
    size: "30 ml",
  },
  {
    id: "p-008",
    name: "Caffeine Solution 5% + EGCG",
    brand: "The Ordinary",
    price_tier: "$",
    category: "eye_cream",
    fit_score: 82,
    evidence_level: "B",
    pregnancy_safe: true,
    key_actives: [
      { ingredient: "Caffeine", concentration: "5%", effectiveness: 0.76 },
      { ingredient: "Epigallocatechin Gallate (EGCG)", effectiveness: 0.72 },
    ],
    conditions_addressed: ["dark_circles", "puffiness"],
    contraindications: [],
    reasoning:
      "Topical caffeine constricts periorbital blood vessels, reducing puffiness and dark-circle appearance. EGCG provides antioxidant protection. Evidence is moderate but promising.",
    price: 9,
    currency: "USD",
    size: "30 ml",
  },
];

export const categoryOptions = [
  { value: "all", label: "All Categories" },
  { value: "cleanser", label: "Cleanser" },
  { value: "toner", label: "Toner" },
  { value: "serum", label: "Serum" },
  { value: "moisturizer", label: "Moisturizer" },
  { value: "sunscreen", label: "Sunscreen" },
  { value: "treatment", label: "Treatment" },
  { value: "eye_cream", label: "Eye Cream" },
];

export const priceTierOptions = [
  { value: "all", label: "All Prices" },
  { value: "$", label: "$" },
  { value: "$$", label: "$$" },
  { value: "$$$", label: "$$$" },
];

export const sortOptions = [
  { value: "fit_desc", label: "Best Fit" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "evidence_desc", label: "Evidence Level" },
];
