/**───────────────────────────────────────────────────────────────
 * lib/skin-age.ts — Age Estimation Logic (Free tier + Pro tier)
 *───────────────────────────────────────────────────────────────*/

import { SkinAgeResult, SkinAgeFactors, SkinAgeTip, AgeEstimateTier, SkinAgeImprovement, BeforeAfterPotential } from "@/types/skin-age";

// ─── Mock deterministic analysis for MVP (no on-device model needed) ─────

function hashImage(imageBase64: string): number {
  let hash = 0;
  const sample = imageBase64.slice(0, 2000);
  for (let i = 0; i < sample.length; i++) {
    hash = ((hash << 5) - hash + sample.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const TIPS_POOL: Record<SkinAgeTip["category"], SkinAgeTip[]> = {
  hydration: [
    { category: "hydration", title: "Drink more water", description: "Aim for 8 glasses daily to improve skin elasticity from within.", priority: "high" },
    { category: "hydration", title: "Use a hyaluronic acid serum", description: "Holds 1000x its weight in water — apply to damp skin.", priority: "high" },
    { category: "hydration", title: "Avoid hot showers", description: "Hot water strips natural oils. Use lukewarm water instead.", priority: "medium" },
  ],
  sun_protection: [
    { category: "sun_protection", title: "SPF 50 every morning", description: "UV damage is the #1 cause of premature aging. No exceptions.", priority: "high" },
    { category: "sun_protection", title: "Reapply every 2 hours", description: "Especially if outdoors. Use a powder SPF for easy touch-ups.", priority: "high" },
    { category: "sun_protection", title: "Wear sunglasses", description: "Prevents squinting and protects the delicate eye area from UV.", priority: "medium" },
  ],
  sleep: [
    { category: "sleep", title: "Aim for 7–9 hours", description: "Skin repairs itself during deep sleep. Consistency matters.", priority: "high" },
    { category: "sleep", title: "Sleep on your back", description: "Reduces pillow-induced wrinkles on cheeks and forehead.", priority: "medium" },
    { category: "sleep", title: "Use a silk pillowcase", description: "Reduces friction and helps skincare products stay on your face.", priority: "low" },
  ],
  diet: [
    { category: "diet", title: "Eat antioxidant-rich foods", description: "Berries, leafy greens, and nuts fight free radical damage.", priority: "high" },
    { category: "diet", title: "Limit sugar intake", description: "Glycation damages collagen. Swap sugary snacks for whole fruit.", priority: "medium" },
    { category: "diet", title: "Add omega-3s", description: "Fatty fish or flaxseeds reduce inflammation and support skin barrier.", priority: "medium" },
  ],
  skincare: [
    { category: "skincare", title: "Introduce retinol at night", description: "Start 0.25% 2x/week. Increases cell turnover and collagen.", priority: "high" },
    { category: "skincare", title: "Gentle cleanser only", description: "Avoid harsh sulfates that strip your moisture barrier.", priority: "medium" },
    { category: "skincare", title: "Exfoliate 1–2x/week", description: "Removes dead skin cells. Use AHA or BHA, not scrubs.", priority: "medium" },
  ],
  lifestyle: [
    { category: "lifestyle", title: "Reduce stress", description: "Cortisol accelerates aging. Try 10 min of daily meditation.", priority: "high" },
    { category: "lifestyle", title: "Quit smoking", description: "Smoking degrades collagen and reduces blood flow to skin.", priority: "high" },
    { category: "lifestyle", title: "Exercise regularly", description: "Boosts circulation and delivers oxygen/nutrients to skin.", priority: "medium" },
  ],
};

function pickTips(factors: SkinAgeFactors, count: number): SkinAgeTip[] {
  // Sort categories by worst score (lowest = worst)
  const entries = Object.entries(factors) as [keyof SkinAgeFactors, number][];
  entries.sort((a, b) => a[1] - b[1]);

  const tips: SkinAgeTip[] = [];
  const used = new Set<string>();

  for (const [category, _score] of entries) {
    if (tips.length >= count) break;
    const pool = TIPS_POOL[category] ?? TIPS_POOL.lifestyle;
    for (const tip of pool) {
      const key = `${tip.category}-${tip.title}`;
      if (!used.has(key)) {
        used.add(key);
        tips.push(tip);
        break;
      }
    }
  }

  // Fill remaining slots from general lifestyle if needed
  while (tips.length < count) {
    const fallback = TIPS_POOL.lifestyle[tips.length % TIPS_POOL.lifestyle.length];
    const key = `${fallback.category}-${fallback.title}`;
    if (!used.has(key)) {
      used.add(key);
      tips.push(fallback);
    } else {
      break;
    }
  }

  return tips.slice(0, count);
}

// ─── Core estimation function ──────────────────────────────────────────────

function ageToRange(age: number): string {
  if (age < 20) return "late teens";
  if (age < 25) return "early 20s";
  if (age < 30) return "late 20s";
  if (age < 35) return "early 30s";
  if (age < 40) return "mid 30s";
  if (age < 45) return "early 40s";
  if (age < 50) return "mid 40s";
  if (age < 55) return "early 50s";
  if (age < 60) return "mid 50s";
  return "60+";
}

export interface EstimateOptions {
  imageBase64: string;
  actualAge?: number;
  tier: AgeEstimateTier;
}

export async function estimateSkinAge(options: EstimateOptions): Promise<SkinAgeResult> {
  const { imageBase64, actualAge, tier } = options;

  // Deterministic seed from image content
  const seed = hashImage(imageBase64);
  const rng = seededRandom(seed);

  // Generate realistic-looking factor scores (slightly clustered)
  const base = 45 + Math.floor(rng() * 40); // 45–85 base
  const factors: SkinAgeFactors = {
    wrinkles: Math.min(100, Math.max(0, Math.round(base + (rng() - 0.5) * 30))),
    texture: Math.min(100, Math.max(0, Math.round(base + (rng() - 0.5) * 30))),
    pigmentation: Math.min(100, Math.max(0, Math.round(base + (rng() - 0.5) * 30))),
    pores: Math.min(100, Math.max(0, Math.round(base + (rng() - 0.5) * 30))),
    elasticity: Math.min(100, Math.max(0, Math.round(base + (rng() - 0.5) * 30))),
    hydration: Math.min(100, Math.max(0, Math.round(base + (rng() - 0.5) * 30))),
  };

  // Weighted average → skin age score
  const skinAgeScore = Math.round(
    (factors.wrinkles * 0.25 +
      factors.texture * 0.20 +
      factors.pigmentation * 0.15 +
      factors.pores * 0.15 +
      factors.elasticity * 0.15 +
      factors.hydration * 0.10)
  );

  // Map score to estimated age (18–70 range)
  const estimatedAge = Math.round(18 + (skinAgeScore / 100) * 52);

  const ageGap = actualAge !== undefined ? estimatedAge - actualAge : 0;

  const factorEntries = Object.entries(factors) as [keyof SkinAgeFactors, number][];

  // Calculate improvement potential
  const improvementPotential = Math.max(3, Math.round((100 - skinAgeScore) / 15));
  const potentialAge = Math.max(18, estimatedAge - improvementPotential);

  // Generate improvements from worst factors
  const improvements: SkinAgeImprovement[] = factorEntries
    .filter(([, score]) => score < 70)
    .slice(0, 3)
    .map(([key, score]) => {
      const productMap: Record<string, string> = {
        wrinkles: "Retinol 0.25%",
        texture: "AHA/BHA Exfoliant",
        pigmentation: "Vitamin C Serum 15%",
        pores: "Niacinamide 5%",
        elasticity: "Peptide Serum",
        hydration: "Hyaluronic Acid",
      };
      return {
        area: key,
        currentScore: score,
        potentialScore: Math.min(100, score + 20),
        timeframe: "4-8 weeks",
        keyProduct: productMap[key] ?? "Consult a dermatologist",
      };
    });

  const beforeAfter: BeforeAfterPotential = {
    currentAge: estimatedAge,
    potentialAge,
    potentialAgeRange: ageToRange(potentialAge),
    improvementText: `With a personalized routine, your skin could look ${potentialAge}`,
    confidence: Math.round(60 + rng() * 30),
  };

  // Pro tier: slightly more accurate (less random variance)
  if (tier === "pro") {
    // Bias toward actual age if provided
    if (actualAge !== undefined) {
      const bias = 0.3; // 30% pull toward actual age
      const adjustedAge = Math.round(estimatedAge * (1 - bias) + actualAge * bias);
      const adjustedPotential = Math.max(18, adjustedAge - improvementPotential);
      return {
        estimatedAge: adjustedAge,
        estimatedAgeRange: ageToRange(adjustedAge),
        actualAge,
        ageGap: adjustedAge - actualAge,
        factors,
        skinAgeScore,
        tips: pickTips(factors, 3),
        disclaimer: "This is a directional estimate, not a medical diagnosis.",
        improvements,
        beforeAfter: {
          ...beforeAfter,
          currentAge: adjustedAge,
          potentialAge: adjustedPotential,
          potentialAgeRange: ageToRange(adjustedPotential),
          improvementText: `With a personalized routine, your skin could look ${adjustedPotential}`,
        },
      };
    }
  }

  return {
    estimatedAge,
    estimatedAgeRange: ageToRange(estimatedAge),
    actualAge,
    ageGap,
    factors,
    skinAgeScore,
    tips: pickTips(factors, 3),
    disclaimer: "This is a directional estimate, not a medical diagnosis.",
    improvements,
    beforeAfter,
  };
}
