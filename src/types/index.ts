/**
 * SKINgenius Shared Type Definitions
 * Medical-grade skincare AI platform type system
 */

// =============================================================================
// ENUM TYPES
// =============================================================================

/** Basic skin type classification */
export type SkinType = 'oily' | 'dry' | 'combination' | 'sensitive' | 'normal';

/** Condition severity level */
export type Severity = 'mild' | 'moderate' | 'severe';

/** Strength of clinical evidence supporting a claim */
export type EvidenceLevel = 'strong' | 'moderate' | 'weak';

/** Time-of-day routine classification */
export type RoutineType = 'am' | 'pm' | 'weekly';

/** High-level ingredient functional category */
export type IngredientCategory =
  | 'antioxidant'
  | 'exfoliant'
  | 'humectant'
  | 'emollient'
  | 'occlusive'
  | 'surfactant'
  | 'preservative'
  | 'fragrance'
  | 'buffer'
  | 'penetration-enhancer'
  | 'colorant'
  | 'uv-filter'
  | 'anti-inflammatory'
  | 'antimicrobial'
  | 'keratolytic'
  | 'sebostatic'
  | 'bleaching-agent'
  | 'reducing-agent'
  | 'oxidizing-agent'
  | 'binding-agent'
  | 'plasticizer'
  | 'solvent';

// =============================================================================
// CORE TYPES
// =============================================================================

/**
 * User skin profile — the foundational data set for all recommendations.
 */
export interface Profile {
  /** Unique user identifier */
  id: string;
  /** Display name or nickname */
  name?: string;
  /** ISO 8601 date of birth */
  dateOfBirth?: string;
  /** Primary skin type */
  skinType: SkinType;
  /** Self-reported or AI-detected skin concerns */
  concerns: string[];
  /** Fitzpatrick phototype (I–VI) for sun-care calibration */
  fitzpatrickType?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Known allergies (INCI names or free-text) */
  allergies: string[];
  /** Current medications potentially affecting skin */
  medications: string[];
  /** Currently pregnant or breastfeeding */
  pregnant: boolean;
  /** Optional: gut health score 0–100 */
  gutHealthScore?: number;
  /** Optional: hormonal context notes */
  hormonalContext?: string;
  /** Optional: diet notes relevant to skin */
  dietNotes?: string;
  /** ISO 8601 creation timestamp */
  createdAt: string;
  /** ISO 8601 last-updated timestamp */
  updatedAt: string;
}

/**
 * Result of AI photo-based skin analysis.
 */
export interface SkinAnalysis {
  /** Unique analysis identifier */
  id: string;
  /** Reference to the user profile */
  profileId: string;
  /**
   * URL or base64 thumbnail of the analyzed image.
   * Stored separately from analysis metadata.
   */
  imageRef: string;
  /** Detected skin type (may differ from profile self-report) */
  detectedSkinType: SkinType;
  /** AI confidence score 0–1 */
  confidence: number;
  /** Conditions identified in the image */
  conditions: SkinCondition[];
  /** Root-cause domain scores 0–100 */
  rootCauses: RootCause;
  /** Free-text clinical observations */
  observations: string[];
  /** Processing model version tag */
  modelVersion: string;
  /** ISO 8601 analysis timestamp */
  analyzedAt: string;
}

/**
 * A skin condition detected or inferred from analysis.
 */
export interface SkinCondition {
  /** Unique condition identifier */
  id: string;
  /** Human-readable condition name */
  name: string;
  /**
   * SLUG-style machine-readable key.
   * e.g. "acne-vulgaris", "melasma", "perioral-dermatitis"
   */
  slug: string;
  /** Severity of the detected condition */
  severity: Severity;
  /**
   * Anatomical region(s) affected.
   * e.g. ["t-zone", "cheeks", "chin"]
   */
  affectedAreas: string[];
  /** Evidence level backing this diagnosis */
  evidenceLevel: EvidenceLevel;
  /** INCI names of ingredients that may aggravate this condition */
  aggravatingIngredients?: string[];
  /** Free-text notes */
  notes?: string;
}

/**
 * Root-cause domain scores — the four pillars of skin health.
 * Each score is 0–100 where 100 = optimal.
 */
export interface RootCause {
  /**
   * Gut health influence on skin.
   * Correlates with gut-skin axis research (PC2 biomarker work).
   */
  gut: number;
  /** Hormonal influence (androgens, estrogen, cortisol, etc.) */
  hormones: number;
  /** Dietary drivers (glycemic load, dairy, omega-6, etc.) */
  nutrition: number;
  /** Sleep, stress, exercise, environmental exposure */
  lifestyle: number;
}

// =============================================================================
// INGREDIENT & PRODUCT TYPES
// =============================================================================

/**
 * A single skincare ingredient with full evidence profile.
 */
export interface Ingredient {
  /** INCI name (authoritative) or EU-compliant name */
  id: string;
  /** Preferred display name */
  name: string;
  /** INCI name */
  inciName: string;
  /** Functional category */
  category: IngredientCategory;
  /** Common product types that contain this ingredient */
  foundIn: string[];
  /** Clinical efficacy rating 1–5 */
  efficacyRating: number;
  /**
   * Evidence level for primary claimed benefit(s).
   * Derived from systematic review of RCTs and meta-analyses.
   */
  evidenceLevel: EvidenceLevel;
  /** Concentration at which efficacy is demonstrated (where known) */
  effectiveConcentration?: string;
  /** Known safety concerns or restrictions */
  safetyProfile: {
    /** pregnancy risk: "safe" | "caution" | "avoid" */
    pregnancy: 'safe' | 'caution' | 'avoid';
    /** Fitzpatrick types that may react poorly (e.g. [1, 2] for hydroquinone) */
    cautionFitzpatrick?: Array<1 | 2 | 3 | 4 | 5 | 6>;
    /** Other known contraindications */
    contraindications: string[];
    /** Free-text safety notes */
    notes?: string;
  };
  /** Skin types that particularly benefit */
  idealFor: SkinType[];
  /** Skin types that should exercise caution */
  cautionFor: SkinType[];
  /** Drug interactions (e.g. "retinoids", "accutane", "topical antibiotics") */
  drugInteractions: string[];
  /** PubMed PMIDs supporting efficacy claims */
  citations: string[];
}

/**
 * A finished skincare product with ingredient list and claims.
 */
export interface Product {
  /** Unique product identifier */
  id: string;
  /** Brand name */
  brand: string;
  /** Product display name */
  name: string;
  /**
   * Product type / category.
   * e.g. "cleanser", "moisturizer", "serum", "sunscreen", "treatment"
   */
  type: string;
  /** INCI ingredient list ordered by concentration descending */
  ingredients: string[];
  /** Parsed-out key active ingredients (INCI names) */
  activeIngredients: string[];
  /** Claims made on packaging or marketing */
  claims: string[];
  /** Price tier: "budget" | "mid" | "luxury" */
  priceTier: 'budget' | 'mid' | 'luxury';
  /** Format: "water-based", "silicone-based", "oil-based", "anhydrous" */
  formulation: string;
  /** Primary skin types this suits */
  suitableFor: SkinType[];
  /** Skin types to avoid */
  avoidFor: SkinType[];
  /** Verified safe for pregnancy */
  pregnancySafe: boolean;
  /** Average user rating 1–5 (from aggregated reviews) */
  avgRating?: number;
  /** Number of reviews aggregated */
  reviewCount?: number;
  /** Product URL */
  url?: string;
  /** ISO 8601 last-updated timestamp */
  updatedAt: string;
}

// =============================================================================
// ROUTINE TYPES
// =============================================================================

/**
 * A single step within a skincare routine.
 */
export interface RoutineStep {
  /** Step order (1 = first) */
  order: number;
  /** Step name e.g. "Vitamin C Serum", "SPF 50 Sunscreen" */
  name: string;
  /** Reference to the recommended Product.id (optional) */
  productId?: string;
  /** Reference to the recommended Ingredient.id (optional) */
  ingredientId?: string;
  /** Application instructions */
  instructions: string;
  /**
   * Wait time in seconds between this step and the next.
   * e.g. 60 for "wait 1 minute before next step"
   */
  waitSeconds?: number;
  /** Which skin conditions this step targets */
  targets: string[];
  /** Free-text notes (e.g. "only at night", "use 2–3x weekly") */
  notes?: string;
}

/**
 * A full AM or PM skincare routine.
 */
export interface Routine {
  /** Unique routine identifier */
  id: string;
  /** Reference to the profile this routine belongs to */
  profileId: string;
  /** AM, PM, or weekly */
  routineType: RoutineType;
  /** Human-readable routine name */
  name: string;
  /** Ordered list of routine steps */
  steps: RoutineStep[];
  /** Total estimated duration in seconds */
  estimatedDurationSeconds: number;
  /** AI-generated rationale for this routine */
  rationale: string;
  /** ISO 8601 creation timestamp */
  createdAt: string;
}

// =============================================================================
// SAFETY TYPES
// =============================================================================

/**
 * A safety warning or contraindication.
 */
export interface SafetyWarning {
  /** Unique warning identifier */
  id: string;
  /** Warning category */
  type: 'pregnancy' | 'allergy' | 'interaction' | 'overuse' | 'contraindication';
  /** Severity: "info" | "caution" | "danger" */
  severity: 'info' | 'caution' | 'danger';
  /** Short headline e.g. "Retinol + Vitamin C: avoid combination" */
  headline: string;
  /** Expanded explanation */
  body: string;
  /** INCI names of ingredients involved */
  ingredientIds: string[];
  /** Product IDs affected */
  productIds: string[];
  /** Action to take e.g. "Consult dermatologist" */
  action: string;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

/**
 * Standard wrapped API response.
 * All successful API responses use this envelope.
 */
export interface ApiResponse<T> {
  success: true;
  data: T;
  /** ISO 8601 server timestamp */
  timestamp: string;
  /** Optional request-scoped trace ID for debugging */
  traceId?: string;
}

/**
 * Paginated list response for collection endpoints.
 */
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  /** Total number of records matching filter (without pagination) */
  total: number;
  /** Current page number (1-indexed) */
  page: number;
  /** Page size */
  pageSize: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** ISO 8601 server timestamp */
  timestamp: string;
  traceId?: string;
}

/**
 * Standard error response envelope.
 */
export interface ErrorResponse {
  success: false;
  error: {
    /** Machine-readable error code */
    code: string;
    /** Human-readable message */
    message: string;
    /** Detailed field-level validation errors (if applicable) */
    details?: Record<string, string[]>;
  };
  /** ISO 8601 server timestamp */
  timestamp: string;
  traceId?: string;
}

// =============================================================================
// TYPE UTILITIES
// =============================================================================

/** Makes all properties optional recursively (useful for partial updates) */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/** Pick a subset of keys from a type */
export type PickRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/** Makes a specific enum union the sole discriminant */
export type Narrow<T, V extends T> = V;
