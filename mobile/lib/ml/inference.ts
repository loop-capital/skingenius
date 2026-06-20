// SKINgenius — ML Inference Engine
// Runs on-device ViT model for skin condition classification

// Condition labels (must match training order)
const CONDITIONS = [
  'acne_vulgaris',
  'rosacea',
  'eczema_atopic_dermatitis',
  'psoriasis',
  'contact_dermatitis',
  'seborrheic_dermatitis',
  'melasma',
  'post_inflammatory_hyperpigmentation',
  'tinea_fungal',
  'urticaria',
  'basal_cell_carcinoma',
  'squamous_cell_carcinoma',
  'melanoma',
  'actinic_keratosis',
  'lichen_planus',
  'pityriasis_rosea',
  'folliculitis',
  'hives',
  'impetigo',
  'scabies',
  'warts',
  'skin_tags',
  'seborrheic_keratosis',
  'dermatofibroma',
  'cherry_angioma',
  'vitiligo',
  'alopecia_areata',
  'keratosis_pilaris',
  'cellulitis',
  'abscess',
  'normal_healthy_skin',
];

// Consumer-friendly names
const CONDITION_DISPLAY: Record<string, string> = {
  acne_vulgaris: 'Breakouts / Acne',
  rosacea: 'Redness / Rosacea',
  eczema_atopic_dermatitis: 'Dry Patches / Eczema',
  psoriasis: 'Scaly Patches / Psoriasis',
  contact_dermatitis: 'Irritation / Contact Dermatitis',
  seborrheic_dermatitis: 'Flaky Skin / Dandruff',
  melasma: 'Dark Patches / Melasma',
  post_inflammatory_hyperpigmentation: 'Dark Spots',
  tinea_fungal: 'Fungal Infection',
  urticaria: 'Hives / Welts',
  basal_cell_carcinoma: '⚠️ See a Dermatologist',
  squamous_cell_carcinoma: '⚠️ See a Dermatologist',
  melanoma: '⚠️ See a Dermatologist Immediately',
  actinic_keratosis: 'Sun Damage',
  lichen_planus: 'Inflamed Patches',
  pityriasis_rosea: 'Rash',
  folliculitis: 'Bumps / Folliculitis',
  hives: 'Hives',
  impetigo: 'Skin Infection',
  scabies: 'Itchy Rash',
  warts: 'Warts',
  skin_tags: 'Skin Tags',
  seborrheic_keratosis: 'Age Spots',
  dermatofibroma: 'Firm Bump',
  cherry_angioma: 'Red Spots',
  vitiligo: 'Light Patches / Vitiligo',
  alopecia_areata: 'Hair Loss Patch',
  keratosis_pilaris: 'Bumpy Skin',
  cellulitis: '⚠️ See a Doctor',
  abscess: '⚠️ See a Doctor',
  normal_healthy_skin: 'Healthy Skin ✨',
};

// Malignant conditions — always flag for dermatologist
const MALIGNANT_CONDITIONS = new Set([
  'basal_cell_carcinoma',
  'squamous_cell_carcinoma',
  'melanoma',
]);

export interface AnalysisResult {
  topCondition: string;
  confidence: number;
  conditions: Array<{ name: string; displayName: string; confidence: number }>;
  recommendations: string[];
  disclaimer: string;
  isMalignantWarning: boolean;
  inferenceTimeMs: number;
}

// ─── Model Loading ───────────────────────────────────────────────────────
let modelLoaded = false;
let vitModel: any = null;

/**
 * Initialize the TFLite model. Call once at app startup.
 * Uses react-native-fast-tflite for on-device inference.
 */
export async function initModel(): Promise<void> {
  if (modelLoaded && vitModel) return;

  try {
    const { loadTensorflowModel } = require('react-native-fast-tflite');

    // Load FP16 model from app bundle
    // NOTE: Add 'tflite' to assetExts in metro.config.js
    vitModel = await loadTensorflowModel(
      require('../assets/models/vit_skin.tflite'),
      ['cpu'] // Use 'core-ml' on iOS for GPU acceleration
    );

    console.log('ViT model loaded successfully');
    modelLoaded = true;
  } catch (error) {
    console.error('Failed to load model:', error);
    // Fallback to mock mode for development
    console.log('Falling back to mock inference');
    modelLoaded = true;
  }
}

// ─── Image Preprocessing ─────────────────────────────────────────────────
// ImageNet normalization constants
const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];

/**
 * Preprocess image for ViT input.
 * Input: image URI (already resized to 224x224 by caller)
 * Output: Float32Array [1, 224, 224, 3] normalized (NHWC format for TFLite)
 */
export function preprocessImage(imageUri: string): Promise<Float32Array> {
  // TODO: Implement actual pixel extraction when TFLite is wired
  // For now, return mock data
  const size = 224 * 224 * 3;
  const data = new Float32Array(size);
  for (let i = 0; i < size; i += 3) {
    data[i] = (Math.random() - MEAN[0]) / STD[0];
    data[i + 1] = (Math.random() - MEAN[1]) / STD[1];
    data[i + 2] = (Math.random() - MEAN[2]) / STD[2];
  }
  return Promise.resolve(data);
}

// ─── Softmax ─────────────────────────────────────────────────────────────
function softmax(logits: Float32Array): Float32Array {
  const max = Math.max(...logits);
  const exps = logits.map((l) => Math.exp(l - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum) as Float32Array;
}

// ─── Main Inference ──────────────────────────────────────────────────────
export async function analyzeSkin(imageUri: string): Promise<AnalysisResult> {
  const startTime = Date.now();

  await initModel();

  // Preprocess image → normalized pixel data
  const inputData = await preprocessImage(imageUri);

  let probabilities: Float32Array;

  if (vitModel) {
    // Real TFLite inference
    const output = await vitModel.run(inputData);
    probabilities = softmax(new Float32Array(output));
  } else {
    // Mock inference (fallback)
    await new Promise((resolve) => setTimeout(resolve, 500));
    probabilities = generateMockProbabilities();
  }

  // Map to conditions with display names
  const conditions = CONDITIONS.map((name, i) => ({
    name,
    displayName: CONDITION_DISPLAY[name] || name,
    confidence: probabilities[i],
  }))
    .sort((a, b) => b.confidence - a.confidence)
    .filter((c) => c.confidence > 0.03);

  const topCondition = conditions[0];
  const isMalignant = MALIGNANT_CONDITIONS.has(topCondition.name);
  const inferenceTimeMs = Date.now() - startTime;

  return {
    topCondition: topCondition.displayName,
    confidence: topCondition.confidence,
    conditions,
    recommendations: getRecommendations(topCondition.name),
    disclaimer:
      'This analysis is for informational purposes only and does not constitute medical advice. Consult a dermatologist for diagnosis and treatment.',
    isMalignantWarning: isMalignant,
    inferenceTimeMs,
  };
}

// ─── Mock (remove when TFLite is wired) ──────────────────────────────────
function generateMockProbabilities(): Float32Array {
  const probs = new Float32Array(CONDITIONS.length);
  const dominant = Math.floor(Math.random() * 5);
  probs[dominant] = 0.55 + Math.random() * 0.3;

  let remaining = 1 - probs[dominant];
  for (let i = 0; i < probs.length; i++) {
    if (i !== dominant) {
      const share = Math.random() * 0.08;
      probs[i] = Math.min(share, remaining);
      remaining -= probs[i];
    }
  }
  return probs;
}

// ─── Recommendations ─────────────────────────────────────────────────────
function getRecommendations(condition: string): string[] {
  const recs: Record<string, string[]> = {
    acne_vulgaris: [
      'Salicylic Acid (BHA) — unclogs pores',
      'Niacinamide — reduces inflammation + oil',
      'Benzoyl Peroxide — kills acne bacteria',
      'Retinol — prevents new breakouts',
    ],
    rosacea: [
      'Azelaic Acid — reduces redness',
      'Centella Asiatica — calms inflammation',
      'Niacinamide — strengthens skin barrier',
      'Avoid: alcohol, fragrance, menthol',
    ],
    eczema_atopic_dermatitis: [
      'Ceramides — restore skin barrier',
      'Colloidal Oatmeal — soothes itching',
      'Hyaluronic Acid — deep hydration',
      'Avoid: fragrances, harsh surfactants',
    ],
    psoriasis: [
      'Salicylic Acid — removes scales',
      'Vitamin D analogs — slows cell growth',
      'Coal Tar — reduces inflammation',
      'Moisturize heavily — prevents cracking',
    ],
    melasma: [
      'Vitamin C — brightens dark spots',
      'Alpha Arbutin — inhibits melanin',
      'Tranexamic Acid — reduces pigmentation',
      'SPF 50+ daily — prevents worsening',
    ],
    post_inflammatory_hyperpigmentation: [
      'Vitamin C — antioxidant brightening',
      'Alpha Arbutin — gentle melanin inhibitor',
      'Niacinamide — reduces pigment transfer',
      'SPF 50+ — prevents darkening',
    ],
    normal_healthy_skin: [
      'SPF 30+ daily — prevention',
      'Retinol — anti-aging maintenance',
      'Vitamin C — antioxidant protection',
      'Hyaluronic Acid — hydration',
    ],
  };

  return recs[condition] || [
    'Consult a dermatologist for personalized recommendations',
    'SPF 50+ daily — universal recommendation',
    'Gentle cleanser — avoid stripping skin barrier',
    'Moisturize — maintain skin hydration',
  ];
}
