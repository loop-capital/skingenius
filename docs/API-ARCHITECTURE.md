# API Architecture: Scan → Conditions → Recommendations Pipeline

## Overview

This document defines the core API architecture for the SKINgenius platform's core workflow: image scan → condition detection → personalized recommendations. The architecture follows a layered approach with clear separation of concerns, leveraging the knowledge graph for evidence-based recommendations and integrating with the database schema for persistent data.

## Core API Contracts

### 1. POST /api/v1/scan - Image Analysis Endpoint

**Purpose:** Process facial images to detect skin conditions with severity assessment.

#### Request Schema
```json
{
  "image": "string (base64 encoded JPEG/PNG)",
  "capture_method": "enum: ['camera', 'gallery']",
  "skin_tone": "integer (1-6 Fitzpatrick scale, from calibration)",
  "options": {
    "return_landmarks": "boolean (default: false)",
    "return_segmentation": "boolean (default: false)"
  }
}
```

#### Processing Pipeline
1. **Input Validation** - Validate base64 image, skin_tone range, capture_method
2. **Preprocessing** - Strip EXIF data, normalize image dimensions (512x512)
3. **Quality Gate** - Multi-tier quality assessment:
   - Tier 0: Face detection & basic quality checks (OpenCV)
   - Tier 1: Kimi K2.6 vision model for quality scoring (0-100)
   - Reject if quality_score < 50 with specific feedback
4. **Classification** - Condition detection using vision models:
   - Tier 2: MiMo Omni for primary classification
   - Tier 3: GPT-4V fallback for low-confidence cases (<70%)
5. **Result Aggregation** - Map model outputs to standardized condition schema
6. **Storage** - Save results to database, optionally store image temporarily (24h TTL)

#### Response Schema
```json
{
  "success": true,
  "data": {
    "analysis_id": "uuid",
    "scan_id": "uuid",
    "timestamp": "ISO 8601 timestamp",
    "quality_assessment": {
      "score": "integer (0-100)",
      "lighting_quality": "enum: ['excellent', 'good', 'poor', 'unusable']",
      "face_detected": "boolean",
      "face_centered": "boolean",
      "eyes_visible": "boolean",
      "warnings": ["string"]
    },
    "conditions": [
      {
        "condition_id": "string (slug from knowledge graph)",
        "name": "string",
        "confidence": "float (0-1)",
        "severity": "enum: ['mild', 'moderate', 'severe']",
        "features": ["string"],
        "zone": "string (e.g., 'T-Zone', 'Cheeks', 'Forehead')",
        "bbox": {
          "x": "number (0-1 normalized)",
          "y": "number (0-1 normalized)",
          "width": "number (0-1 normalized)",
          "height": "number (0-1 normalized)"
        }
      }
    ],
    "skin_zones": [
      {
        "zone": "string",
        "primary_concern": "string",
        "description": "string",
        "severity": "enum: ['mild', 'moderate', 'severe']",
        "confidence": "float (0-1)"
      }
    ],
    "metadata": {
      "model_used": "enum: ['tier2_mimo', 'tier3_gpt4v']",
      "processing_time_ms": "integer",
      "requires_premium_review": "boolean"
    }
  }
}
```

#### Database Tables Involved
- `skin_photos` - Stores uploaded image metadata
- `skin_conditions` - Reference table for detectable conditions
- `skin_analyses` - Links photos to detected conditions with confidence scores
- `users` / `profiles` - User association (via auth context)

#### Error Cases
- **400 Bad Request** - Invalid image format, missing parameters, invalid skin_tone
- **413 Payload Too Large** - Image exceeds 10MB limit
- **422 Unprocessable Entity** - Image quality below threshold (quality_score < 50)
- **429 Too Many Requests** - Rate limiting (max 5 scans/minute per user)
- **500 Internal Server Error** - Model inference failure, storage failure
- **503 Service Unavailable** - External model API unavailable

### 2. POST /api/v1/recommendations - Recommendation Generation

**Purpose:** Generate personalized recommendations based on detected conditions and user profile.

#### Request Schema
```json
{
  "user_id": "uuid",
  "analysis_id": "uuid (optional, for scan-based recommendations)",
  "conditions": [
    {
      "condition_id": "string (slug)",
      "severity": "enum: ['mild', 'moderate', 'severe']",
      "confidence": "float (0-1)"
    }
  ],
  "context": {
    "include_categories": ["string"] // e.g., ['product', 'supplement', 'lifestyle']
  },
  "preferences": {
    "max_price_tier": "string ($, $$, $$$, etc.)",
    "avoid_ingredients": ["string"],
    "preferred_brands": ["string"],
    "skin_sensitivities": ["string"]
  }
}
```

#### Processing Pipeline
1. **Input Validation** - Validate user_id exists, conditions reference valid slugs
2. **User Context Retrieval** - Fetch user profile, skin profile, preferences, health assessments
3. **Knowledge Graph Query** - Retrieve condition-treatment relationships:
   - Find ingredients that treat each condition
   - Find products containing those ingredients
   - Check supplement recommendations
   - Retrieve lifestyle recommendations
4. **Evidence Scoring** - Apply evidence level weights:
   - A (strong): 1.0x multiplier
   - B (moderate): 0.75x multiplier
   - C (emerging): 0.5x multiplier
   - D (anecdotal): 0.25x multiplier
5. **Safety Filtering** - Apply contraindications:
   - Pregnancy/breastfeeding status from user profile
   - Reported allergies/sensitivities
   - Known drug interactions (from user medications)
   - Ingredient incompatibilities
6. **Fit Score Calculation** - Compute 0-100% score based on:
   - Ingredient-condition match strength
   - Evidence level weighting
   - Price appropriateness
   - Brand preference alignment
   - Formulation suitability for skin type
7. **Diversity Enforcement** - Ensure variety in recommendations:
   - Limit to 2 products per category
   - Ensure at least one leave-on and one rinse-off product
   - Rotate active ingredients to prevent tolerance
8. **Ranking & Selection** - Sort by fit score, apply diversity rules, select top recommendations

#### Response Schema
```json
{
  "success": true,
  "data": {
    "recommendation_id": "uuid",
    "generated_at": "ISO 8601 timestamp",
    "based_on_analysis": "uuid (if provided)",
    "recommendations": {
      "products": [
        {
          "product_id": "uuid",
          "name": "string",
          "brand": "string",
          "category": "string",
          "price": "string",
          "size": "string",
          "fit_score": "integer (0-100)",
          "evidence_level": "enum: ['A', 'B', 'C', 'D']",
          "key_actives": [
            {
              "ingredient": "string",
              "concentration": "string",
              "purpose": "string"
            }
          ],
          "conditions_addressed": ["string"],
          "contraindications": ["string"],
          "reasoning": "string",
          "image_url": "string"
        }
      ],
      "supplements": [
        {
          "supplement_id": "string",
          "name": "string",
          "dosage": "string",
          "evidence_level": "enum: ['A', 'B', 'C', 'D']",
          "benefits": ["string"],
          "conditions_addressed": ["string"],
          "interactions": ["string"],
          "pregnancy_safe": "enum: ['safe', 'contraindicated', 'caution', 'not_recommended']",
          "fit_score": "integer (0-100)",
          "reasoning": "string"
        }
      ],
      "lifestyle": [
        {
          "type": "string (e.g., 'dietary', 'stress_management', 'sleep_hygiene')",
          "recommendation": "string",
          "evidence_level": "enum: ['A', 'B', 'C', 'D']",
          "implementation_difficulty": "enum: ['easy', 'moderate', 'hard']",
          "time_to_effect": "string (e.g., '2-4 weeks')",
          "fit_score": "integer (0-100)"
        }
      ],
      "devices": [
        {
          "device_id": "string",
          "name": "string",
          "type": "string (e.g., 'led_mask', 'microcurrent', 'dermaroller')",
          "evidence_level": "enum: ['A', 'B', 'C', 'D']",
          "conditions_addressed": ["string"],
          "contraindications": ["string"],
          "fit_score": "integer (0-100)",
          "reasoning": "string"
        }
      ],
      "professional": [
        {
          "type": "string (e.g., 'dermatologist', 'esthetician', 'functional_medicine')",
          "reason": "string",
          "urgency": "enum: ['routine', 'urgent', 'immediate']",
          "evidence_level": "enum: ['A', 'B', 'C', 'D']",
          "preparation_steps": ["string"]
        }
      ]
    },
    "warnings": [
      {
        "type": "string (e.g., 'ingredient_interaction', 'pregnancy_warning')",
        "message": "string",
        "severity": "enum: ['low', 'medium', 'high']"
      }
    ],
    "summary": {
      "total_recommendations": "integer",
      "average_confidence": "float (0-1)",
      "coverage_percentage": "integer (0-100)"
    }
  }
}
```

#### Database Tables Involved
- `profiles` - User demographic and skin type information
- `user_skin_profiles` - Detailed skin profile including Fitzpatrick type
- `user_health_assessments` - Root cause analysis results
- `user_medications` - Current medications for interaction checking
- `user_supplements` - Current supplements for duplication prevention
- `ingredients` - Ingredient reference data with evidence levels
- `products` - Product catalog with ingredient lists
- `supplements` - Supplement reference data
- `recommendations` - Storage of generated recommendations for tracking
- `knowledge_graph_views` - Materialized views for fast condition-treatment queries

#### Error Cases
- **400 Bad Request** - Invalid user_id, malformed conditions array
- **404 Not Found** - User not found, analysis_id not found
- **422 Unprocessable Entity** - Invalid condition slugs, conflicting preferences
- **429 Too Many Requests** - Rate limiting (max 20 requests/minute per user)
- **500 Internal Server Error** - Knowledge graph query failure, scoring algorithm error
- **503 Service Unavailable** - External knowledge graph service unavailable

### 3. GET /api/v1/routine - Routine Generation

**Purpose:** Generate personalized AM/PM skincare routines with interaction warnings.

#### Request Schema
```json
{
  "user_id": "uuid",
  "time_of_day": "enum: ['am', 'pm', 'both'] (default: both)",
  "include_warnings": "boolean (default: true)"
}
```

#### Processing Pipeline
1. **User Context Retrieval** - Fetch user profile, skin profile, current routine
2. **Active Recommendations** - Retrieve user's accepted but not yet implemented recommendations
3. **Routine Optimization** - Apply chronological ordering principles:
   - Morning: Cleanser → Treatment → Moisturizer → Sunscreen
   - Evening: Cleanser → Treatment → Moisturizer → Optional treatments
4. **Interaction Checking** - Cross-reference active ingredients:
   - Known incompatibilities (e.g., retinol + benzoyl peroxide)
   - pH conflicts (e.g., vitamin C at low pH + niacinamide)
   - Photosensitivity risks (AM vs PM appropriateness)
5. **Frequency Optimization** - Adjust based on ingredient stability:
   - Daily use ingredients (hyaluronic acid, niacinamide)
   - Every other day (retinoids, chemical exfoliants)
   - Weekly (masks, strong treatments)
6. **Gap Analysis** - Identify missing essential steps for skin type/concerns
7. **Conflict Resolution** - Handle competing recommendations:
   - Prioritize higher evidence level
   - Consider user preferences and sensitivities
   - Apply dermatologist-recommended hierarchies

#### Response Schema
```json
{
  "success": true,
  "data": {
    "routine_id": "uuid",
    "generated_at": "ISO 8601 timestamp",
    "user_id": "uuid",
    "time_of_day": "enum: ['am', 'pm', 'both']",
    "routines": {
      "am": {
        "steps": [
          {
            "step_order": "integer",
            "product_id": "uuid",
            "name": "string",
            "brand": "string",
            "category": "string",
            "application_amount": "string (e.g., 'pea-sized', 'nickel-sized')",
            "wait_time": "string (e.g., '30 seconds', '1 minute')",
            "purpose": "string (e.g., 'cleansing', 'antioxidant protection')",
            "key_actives": [
              {
                "ingredient": "string",
                "concentration": "string"
              }
            ],
            "price": "string"
          }
        ],
        "total_cost": "string",
        "estimated_duration": "string (e.g., '2 minutes')"
      },
      "pm": {
        "steps": [
          {
            "step_order": "integer",
            "product_id": "uuid",
            "name": "string",
            "brand": "string",
            "category": "string",
            "application_amount": "string",
            "wait_time": "string",
            "purpose": "string",
            "key_actives": [
              {
                "ingredient": "string",
                "concentration": "string"
              }
            ],
            "price": "string"
          }
        ],
        "total_cost": "string",
        "estimated_duration": "string"
      }
    },
    "warnings": [
      {
        "type": "string (e.g., 'ingredient_interaction', 'ph_conflict', 'photosensitivity')",
        "message": "string",
        "severity": "enum: ['low', 'medium', 'high']",
        "conflicting_products": [
          {
            "product_id": "uuid",
            "name": "string",
            "ingredient": "string"
          }
        ],
        "recommendation": "string (e.g., 'Use vitamin C in AM, retinol in PM')"
      }
    ],
    "coverage_analysis": {
      "essential_steps_present": "boolean",
      "missing_essentials": ["string"],
      "redundant_steps": ["string"],
      "routine_balance": "string (e.g., 'well-balanced', 'treatment-heavy')"
    }
  }
}
```

#### Database Tables Involved
- `routines` - User's existing routines
- `routine_steps` - Ordered products in routines
- `products` - Product information for step details
- `ingredients` - Ingredient data for interaction checking
- `product_ingredient_links` - Junction table for product-ingredient relationships
- `user_skin_profiles` - Skin type and sensitivity information
- `user_preferences` - Routine preferences and constraints

#### Error Cases
- **400 Bad Request** - Invalid user_id, invalid time_of_day parameter
- **404 Not Found** - User not found
- **422 Unprocessable Entity** - Unable to generate valid routine (conflicting constraints)
- **429 Too Many Requests** - Rate limiting (max 10 requests/minute per user)
- **500 Internal Server Error** - Routine generation algorithm failure
- **503 Service Unavailable** - Dependency service unavailable

### 4. POST /api/v1/chat - RAG-Powered Conversational Interface

**Purpose:** Conversational interface for skincare questions using Retrieval-Augmented Generation over the knowledge graph.

#### Request Schema
```json
{
  "user_id": "uuid",
  "message": "string",
  "context": {
    "conversation_history": [
      {
        "role": "enum: ['user', 'assistant']",
        "content": "string",
        "timestamp": "ISO 8601 timestamp"
      }
    ],
    "skin_concerns": ["string"] // from user profile or recent analysis
  },
  "parameters": {
    "temperature": "float (0-2, default: 0.7)",
    "max_tokens": "integer (default: 500)",
    "include_sources": "boolean (default: true)"
  }
}
```

#### Processing Pipeline
1. **Input Validation** - Validate user_id, message content
2. **Context Enhancement** - Augment query with user context:
   - Add user's skin type, concerns, current routine
   - Include recent analysis results if available
   - Add relevant health assessment findings
3. **Knowledge Graph Retrieval** - Semantic search and traversal:
   - Extract key entities from query (conditions, ingredients, procedures)
   - Retrieve relevant triples from knowledge graph
   - Fetch related information (treatments, mechanisms, evidence)
   - Rank results by relevance and evidence level
4. **Prompt Construction** - Build LLM prompt with:
   - System message defining SKINgenius persona and constraints
   - User query with contextual enhancements
   - Retrieved knowledge graph information as context
   - Conversation history (last 3 exchanges)
5. **LLM Generation** - Generate response using appropriate model:
   - Primary: Mistral-Nemo or similar open-source model
   - Fallback: GPT-4o-mini for complex queries
6. **Response Post-processing** - Format output:
   - Add citations to knowledge graph sources
   - Format lists and warnings appropriately
   - Apply SKINgenius voice and tone guidelines
   - Add disclaimer for medical advice boundaries

#### Response Schema
```json
{
  "success": true,
  "data": {
    "message_id": "uuid",
    "response": "string",
    "timestamp": "ISO 8601 timestamp",
    "sources": [
      {
        "type": "string (e.g., 'condition', 'ingredient', 'study', 'treatment')",
        "id": "string",
        "title": "string",
        "relevance_score": "float (0-1)",
        "excerpt": "string",
        "url": "string (optional)"
      }
    ],
    "context_used": {
      "user_skin_type": "string",
      "user_concerns": ["string"],
      "conversation_turns": "integer",
      "knowledge_graph_triples": "integer"
    },
    "metadata": {
      "model_used": "string",
      "tokens_used": "integer",
      "processing_time_ms": "integer"
    }
  }
}
```

#### Database Tables Involved
- `profiles` - User basic information
- `user_skin_profiles` - Detailed skin characteristics
- `knowledge_graph_entities` - Materialized views of knowledge graph nodes
- `knowledge_graph_relationships` - Materialized views of knowledge graph edges
- `chat_sessions` - Conversation history storage
- `chat_messages` - Individual message storage for context

#### Error Cases
- **400 Bad Request** - Invalid user_id, empty message, invalid parameters
- **422 Unprocessable Entity** - Message too long (>2000 characters)
- **429 Too Many Requests** - Rate limiting (max 30 requests/minute per user)
- **500 Internal Server Error** - LLM generation failure, knowledge graph query error
- **503 Service Unavailable** - LLM service unavailable, knowledge graph service down

## Recommendation Ranking Algorithm

### Core Components

#### 1. Ingredient-Condition Matching (Knowledge Graph)
- Query knowledge graph for ingredients that treat each detected condition
- Retrieve evidence level and mechanism for each ingredient-condition pair
- Calculate base match score: `confidence * evidence_weight`
- Evidence weights: A=1.0, B=0.75, C=0.5, D=0.25

#### 2. Evidence Level Weighting
- Each recommendation component gets evidence multiplier:
  - Strong evidence (A): 1.0x
  - Moderate evidence (B): 0.75x
  - Emerging evidence (C): 0.5x
  - Anecdotal evidence (D): 0.25x
- Applied multiplicatively with ingredient-condition match strength

#### 3. Safety Filtering
- **Pregnancy/Breastfeeding**: Filter out contraindicated ingredients
- **Allergies/Sensitivities**: Remove known problematic ingredients
- **Drug Interactions**: Check against user medications (both topical and systemic)
- **Condition Contraindications**: Avoid ingredients that worsen specific conditions
- **Age Appropriateness**: Consider pediatric/geriatric restrictions

#### 4. Fit Score Calculation (0-100%)
The final fit score combines multiple factors:

```
Base Score = Σ (ingredient_match_score * evidence_weight) for all key actives
Normalized Base = min(Base Score / max_possible, 1.0) * 60

Price Factor = 
  if price_tier <= user_preference_max_tier: 1.0
  elif price_tier == user_preference_max_tier + 1: 0.8
  else: 0.5

Brand Preference Factor = 
  if preferred_brand: 1.2
  elif neutral_brand: 1.0
  elif avoided_brand: 0.3

Skin Type Match Factor = 
  if ideal_for_skin_type: 1.0
  elif acceptable: 0.7
  elif not_recommended: 0.3

Formulation Factor = 
  if pH_appropriate: 1.0
  elif texture_suitable: 0.8
  else: 0.5

Final Fit Score = Normalized Base * Price Factor * Brand Factor * Skin Type Factor * Formulation Factor
Clamped to 0-100 range
```

#### 5. Diversity Enforcement
- **Category Diversity**: Maximum 2 recommendations per product category
- **Ingredient Rotation**: Prevent repeated use of same active ingredient class
- **Mechanism Diversity**: Ensure different mechanisms of action where possible
- **Price Point Distribution**: Spread recommendations across user's budget range
- **Brand Diversity**: Limit to 1 recommendation per brand unless exceptionally justified
- **Application Timing**: Balance AM/PM appropriate products

### Implementation Details

#### Knowledge Graph Queries
- Use SPARQL-like queries on materialized views for performance
- Cache frequent condition-treatment lookups
- Implement incremental updates as knowledge graph evolves

#### Scoring Optimization
- Pre-compute ingredient-condition matrices
- Use approximate nearest neighbor for similar product matching
- Implement early termination for low-scoring candidates

#### Caching Strategy
- LRU cache for user-specific scoring factors
- Redis-backed cache for knowledge graph queries
- Incremental updates when user profile changes

#### Performance Requirements
- <500ms for recommendation generation (95th percentile)
- <100ms for routine generation
- <2s for chat response generation
- Horizontal scaling for LLM inference workloads

## Security and Privacy Considerations

### Data Protection
- All endpoints require authenticated user context
- Image data processed in-memory, not persisted beyond 24 hours
- Personal health information encrypted at rest
- Audit logging for all recommendation generations

### Rate Limiting & Abuse Prevention
- Per-user rate limits with burst allowance
- API key validation for service-to-service communication
- Input sanitization to prevent injection attacks
- Image validation to prevent malicious file uploads

### Compliance
- HIPAA-adjacent handling of health information
- GDPR-compliant data processing and deletion
- COPPA compliance for under-13 users (separate flow)
- FDA disclaimer for cosmetic vs medical claims

## Implementation Roadmap

### Phase 1: Core API Implementation
- Implement `/api/v1/scan` with quality gate and tiered classification
- Implement `/api/v1/recommendations` with basic scoring
- Implement `/api/v1/routine` with basic ordering
- Implement `/api/v1/chat` with basic RAG

### Phase 2: Enhancement & Optimization
- Add advanced safety filtering and interaction checking
- Implement diversity enforcement in recommendations
- Optimize knowledge graph queries and caching
- Add comprehensive error handling and logging

### Phase 3: Personalization & Advanced Features
- Add machine learning for preference learning
- Implement A/B testing framework for recommendation algorithms
- Add multi-modal inputs (symptom questionnaires, lifestyle factors)
- Implement real-time updates based on user feedback

### Monitoring and Observability
- Distributed tracing for end-to-end request tracking
- Metrics for latency, error rates, and throughput
- Alerting for service degradation and error spikes
- A/B test analytics for recommendation effectiveness
---

## Pro Tier API Endpoints

### POST /api/v1/pro/share — Client shares data with a pro

**Purpose:** Client opts in to share scan data, products, routines with their selected esthetician.

```json
Request: {
  "pro_id": "uuid",
  "share_scans": true,
  "share_products": true,
  "share_routines": true,
  "share_conditions": true,
  "share_supplements": false,
  "share_health_profile": false,
  "pro_can_message": true
}

Response: {
  "success": true,
  "data": {
    "relationship_id": "uuid",
    "status": "pending",
    "invite_code": "string",
    "created_at": "ISO 8601"
  }
}
```

### GET /api/v1/pro/clients — Pro views their client dashboard

**Purpose:** Pro sees all clients who shared data, with latest scan summaries.

```json
Response: {
  "success": true,
  "data": {
    "pro_id": "uuid",
    "subscription": { "plan": "pro", "status": "active", "max_clients": 50 },
    "clients": [
      {
        "client_id": "uuid",
        "name": "string",
        "status": "active",
        "sharing": { "scans": true, "products": true, "routines": true },
        "latest_scan": {
          "scan_id": "uuid",
          "date": "ISO 8601",
          "conditions": ["acne", "hyperpigmentation"],
          "severity_changes": { "acne": "improving", "hyperpigmentation": "stable" }
        },
        "current_routine": { "am_steps": 4, "pm_steps": 5 },
        "last_active": "ISO 8601"
      }
    ],
    "client_count": 12,
    "client_limit": 50
  }
}
```

### POST /api/v1/pro/message — Pro sends check-in to client

**Purpose:** Pro sends a message or scan request to a client.

```json
Request: {
  "client_id": "uuid",
  "message_type": "check_in",
  "body": "How's your skin feeling after we adjusted your routine last week?",
  "includes_scan_request": true
}

Response: {
  "success": true,
  "data": {
    "message_id": "uuid",
    "created_at": "ISO 8601"
  }
}
```

### POST /api/v1/referrals — Consumer requests professional referral

**Purpose:** Consumer (without a pro) gets matched to a subscribing esthetician.

```json
Request: {
  "condition_ids": ["acne", "hyperpigmentation"],
  "fitzpatrick_type": 5,
  "location_zip": "11201",
  "preferred_service_types": ["facial", "chemical-peel"]
}

Response: {
  "success": true,
  "data": {
    "referral_id": "uuid",
    "matched_pros": [
      {
        "pro_id": "uuid",
        "name": "string",
        "specialties": ["acne", "hyperpigmentation"],
        "fitzpatrick_experience": true,
        "distance_miles": 3.2,
        "match_score": 0.94,
        "booking_url": "string"
      }
    ],
    "status": "searching"
  }
}
```

### Pro Tier Pricing Model

| Plan | Monthly | Max Clients | Features |
|------|---------|-------------|----------|
| **Pro** | $29/mo | 50 | Client dashboard, check-ins, referral marketplace listing |
| **Enterprise** | $99/mo | Unlimited | API access, custom branding, priority referral matching |

### Referral Marketplace Logic

1. Consumer submits referral request with conditions + Fitzpatrick type + location
2. System finds subscribed pros within radius with matching specialties
3. Pros scored by: condition expertise, Fitzpatrick experience (proven via client outcomes), proximity, rating
4. Top 3 matches shown to consumer
5. Consumer selects a pro → relationship created automatically
6. Pro subscribes to see the client's shared data

### Key Architecture Decisions

- **User controls sharing granularity** — each data type (scans, products, routines, conditions, supplements, health profile) is independently toggled
- **Pro never sees raw photos** — only condition summaries and progression
- **Client can revoke anytime** — status change to 'revoked' immediately blocks pro access
- **Pro must be subscribed** — free tier pros can't access the referral marketplace or client dashboard
- **Fitzpatrick-aware matching** — pros with demonstrated Fitzpatrick IV-VI experience get matched first for those clients
