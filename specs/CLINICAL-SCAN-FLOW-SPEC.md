# Clinical Scan Flow Specification — SKINgenius Hybrid Medical Escalation

**Version:** 1.0  
**Status:** Draft  
**Last Updated:** 2026-09-15  
**Author:** SKINgenius Architect  

---

## Executive Summary

SKINgenius implements a two-tier skin analysis system combining fast AI screening with optional medical-grade clinical review. The hybrid flow ensures 90% of users receive instant results while flagging high-risk cases for dermatologist evaluation, creating both clinical safety and revenue opportunities.

---

## 1. Escalation Criteria

Medical-grade escalation triggers when ANY of the following conditions are met:

### 1.1 Urgent Flags (Auto-Escalate, No User Opt-In Required)

| Flag | Description | Action |
|------|-------------|--------|
| `SUSPICIOUS_LESION` | Asymmetric border, irregular color, diameter >6mm | Immediate escalation + urgent care prompt |
| `MELANOMA_RISK` | ABCDE criteria detected (Asymmetry, Border, Color, Diameter, Evolving) | Immediate escalation + "See dermatologist within 2 weeks" |
| `BASAL_CELL_CARCINOMA` | Pearly papule, telangiectasia visible | Immediate escalation + provider referral |
| `SQUAMOUS_CELL_CARCINOMA` | Scaly red patch, open sore, elevated growth | Immediate escalation + provider referral |

### 1.2 Severe Conditions (Recommend Escalation, User Opt-In)

| Condition | Severity Threshold | Recommendation |
|-----------|-------------------|----------------|
| Cystic acne | ≥3 nodular lesions detected | "Clinical treatment recommended" |
| Severe rosacea | Grade 3+ (papules/pustules + erythema) | "Prescription-strength treatment available" |
| Severe eczema | Lichenification, extensive body surface area | "Medical management recommended" |
| Hidradenitis suppurativa | Deep nodules, sinus tracts | "Specialist care recommended" |

### 1.3 Uncertain Diagnosis (Auto-Escalate)

| Metric | Threshold | Action |
|--------|-----------|--------|
| Primary condition confidence | <70% | "We need a closer look — clinical review recommended" |
| Multiple conflicting signals | ≥3 conditions with similar confidence | Escalate for differential diagnosis |
| Image quality insufficient | Blur, lighting, angle issues | Request re-upload OR escalate if user insists |

### 1.4 User-Requested Escalation (Opt-In)

- Any user can request clinical review regardless of initial scan result
- Offered as "$2.99 clinical scan" or "Free with Pro+ membership"
- Requires explicit consent checkbox: "I understand this is not a substitute for in-person medical care"

---

## 2. API Contract

### 2.1 `/api/v1/scan` — Standard AI Scan

**Method:** POST  
**Auth:** Bearer token (user session)  
**Rate Limit:** 10 scans/day free tier, unlimited Pro+

#### Request Schema

```json
{
  "type": "object",
  "required": ["image", "consent"],
  "properties": {
    "image": {
      "type": "string",
      "format": "base64",
      "description": "JPEG/PNG image, max 10MB, min 640x480"
    },
    "imageMetadata": {
      "type": "object",
      "properties": {
        "captureDevice": {"type": "string"},
        "lightingCondition": {"type": "string", "enum": ["natural", "indoor", "flash"]},
        "bodyArea": {"type": "string"}
      }
    },
    "consent": {
      "type": "boolean",
      "description": "User consents to AI analysis per Terms of Service"
    },
    "userId": {"type": "string", "format": "uuid"},
    "sessionId": {"type": "string"}
  }
}
```

#### Response Schema (Normal Result)

```json
{
  "type": "object",
  "properties": {
    "scanId": {"type": "string", "format": "uuid"},
    "status": {"type": "string", "enum": ["completed", "escalated"]},
    "processingTimeMs": {"type": "integer"},
    "results": {
      "type": "object",
      "properties": {
        "primaryCondition": {
          "type": "object",
          "properties": {
            "name": {"type": "string"},
            "confidence": {"type": "number", "minimum": 0, "maximum": 1},
            "severity": {"type": "string", "enum": ["mild", "moderate", "severe"]}
          }
        },
        "secondaryConditions": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "name": {"type": "string"},
              "confidence": {"type": "number"}
            }
          }
        },
        "skinType": {"type": "string", "enum": ["I", "II", "III", "IV", "V", "VI"]},
        "concerns": {
          "type": "array",
          "items": {"type": "string"}
        }
      }
    },
    "recommendations": {
      "type": "object",
      "properties": {
        "products": {
          "type": "array",
          "items": {"$ref": "#/definitions/ProductRecommendation"}
        },
        "routine": {
          "type": "object",
          "properties": {
            "morning": {"type": "array", "items": {"type": "string"}},
            "evening": {"type": "array", "items": {"type": "string"}}
          }
        },
        "lifestyle": {
          "type": "array",
          "items": {"type": "string"}
        }
      }
    },
    "escalation": {
      "type": "object",
      "properties": {
        "recommended": {"type": "boolean"},
        "reason": {"type": "string"},
        "urgency": {"type": "string", "enum": ["routine", "soon", "urgent"]},
        "clinicalScanOffer": {
          "type": "object",
          "properties": {
            "available": {"type": "boolean"},
            "price": {"type": "number"},
            "proMembershipCovered": {"type": "boolean"}
          }
        }
      }
    }
  },
  "definitions": {
    "ProductRecommendation": {
      "type": "object",
      "properties": {
        "productId": {"type": "string"},
        "name": {"type": "string"},
        "category": {"type": "string"},
        "activeIngredients": {"type": "array", "items": {"type": "string"}},
        "matchScore": {"type": "number"}
      }
    }
  }
}
```

### 2.2 `/api/v1/clinical-scan` — Medical-Grade Analysis

**Method:** POST  
**Auth:** Bearer token + payment verification  
**Rate Limit:** 1 clinical scan per 30 days (unless urgent flag)

#### Request Schema

```json
{
  "type": "object",
  "required": ["originalScanId", "paymentToken", "clinicalConsent"],
  "properties": {
    "originalScanId": {
      "type": "string",
      "format": "uuid",
      "description": "Reference to initial standard scan"
    },
    "paymentToken": {
      "type": "string",
      "description": "Stripe PaymentIntent ID or Pro+ membership verification"
    },
    "clinicalConsent": {
      "type": "object",
      "properties": {
        "hipaaAcknowledged": {"type": "boolean"},
        "telemedicineConsent": {"type": "boolean"},
        "dataRetentionConsent": {"type": "boolean"},
        "prescriptionConsent": {"type": "boolean"},
        "timestamp": {"type": "string", "format": "date-time"}
      }
    },
    "additionalNotes": {
      "type": "string",
      "maxLength": 500,
      "description": "User-provided context for dermatologist"
    },
    "preferredPharmacy": {
      "type": "object",
      "properties": {
        "name": {"type": "string"},
        "address": {"type": "string"},
        "phone": {"type": "string"}
      }
    }
  }
}
```

#### Response Schema (Clinical Scan Accepted)

```json
{
  "type": "object",
  "properties": {
    "clinicalScanId": {"type": "string", "format": "uuid"},
    "status": {"type": "string", "enum": ["pending_review", "under_review", "completed", "requires_followup"]},
    "assignedDermatologist": {
      "type": "object",
      "properties": {
        "id": {"type": "string"},
        "name": {"type": "string"},
        "credentials": {"type": "string"},
        "state": {"type": "string"},
        "boardCertified": {"type": "boolean"}
      }
    },
    "estimatedCompletionTime": {
      "type": "string",
      "description": "ISO 8601 duration, e.g., 'PT24H' for 24 hours"
    },
    "caseNumber": {"type": "string"},
    "nextSteps": {
      "type": "array",
      "items": {"type": "string"}
    }
  }
}
```

### 2.3 `/api/v1/clinical-results/{clinicalScanId}` — Retrieve Clinical Results

**Method:** GET  
**Auth:** Bearer token (must be scan owner)

#### Response Schema (Completed Clinical Review)

```json
{
  "type": "object",
  "properties": {
    "clinicalScanId": {"type": "string"},
    "status": {"type": "string", "enum": ["completed"]},
    "reviewCompletedAt": {"type": "string", "format": "date-time"},
    "dermatologistAssessment": {
      "type": "object",
      "properties": {
        "primaryDiagnosis": {
          "type": "object",
          "properties": {
            "condition": {"type": "string"},
            "icd10Code": {"type": "string"},
            "confidence": {"type": "number"},
            "notes": {"type": "string"}
          }
        },
        "differentialDiagnoses": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "condition": {"type": "string"},
              "likelihood": {"type": "string", "enum": ["likely", "possible", "unlikely"]}
            }
          }
        },
        "severity": {"type": "string", "enum": ["mild", "moderate", "severe"]},
        "clinicalNotes": {"type": "string"}
      }
    },
    "treatmentPlan": {
      "type": "object",
      "properties": {
        "prescriptions": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "medication": {"type": "string"},
              "strength": {"type": "string"},
              "dosage": {"type": "string"},
              "frequency": {"type": "string"},
              "duration": {"type": "string"},
              "ndcCode": {"type": "string"},
              "refills": {"type": "integer"}
            }
          }
        },
        "otcRecommendations": {
          "type": "array",
          "items": {"$ref": "#/definitions/ProductRecommendation"}
        },
        "lifestyleModifications": {
          "type": "array",
          "items": {"type": "string"}
        },
        "followUpRecommended": {
          "type": "boolean"
        },
        "followUpTimeframe": {
          "type": "string"
        }
      }
    },
    "referral": {
      "type": "object",
      "properties": {
        "recommended": {"type": "boolean"},
        "urgency": {"type": "string", "enum": ["routine", "soon", "urgent"]},
        "specialty": {"type": "string"},
        "providerSuggestions": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "providerId": {"type": "string"},
              "name": {"type": "string"},
              "practice": {"type": "string"},
              "distance": {"type": "number"},
              "acceptingNewPatients": {"type": "boolean"},
              "insuranceAccepted": {"type": "array", "items": {"type": "string"}}
            }
          }
        }
      }
    },
    "prescriptionFulfillment": {
      "type": "object",
      "properties": {
        "pharmacySelected": {"type": "boolean"},
        "pharmacyDetails": {"$ref": "#/properties/preferredPharmacy"},
        "estimatedReadyTime": {"type": "string", "format": "date-time"},
        "affiliateLink": {"type": "string", "format": "uri"}
      }
    }
  }
}
```

---

## 3. User Flow Wireframes

### 3.1 Standard Scan Results Page

```
┌─────────────────────────────────────────────────────┐
│  ✓ Your Skin Analysis is Ready                     │
│  Processed in 1.8 seconds                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  PRIMARY CONCERN                                    │
│  ┌─────────────────────────────────────────────┐   │
│  │  [Uploaded Photo]                            │   │
│  │  Moderate Acne Vulgaris                      │   │
│  │  Confidence: 87%                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  YOUR PERSONALIZED ROUTINE                          │
│  ☀️ Morning:                                        │
│     • Gentle Cleanser (CeraVe Hydrating)           │
│     • Niacinamide Serum (The Ordinary 10%)         │
│     • SPF 50 Sunscreen (EltaMD UV Clear)           │
│                                                     │
│  🌙 Evening:                                        │
│     • Salicylic Acid Cleanser                      │
│     • Adapalene Gel 0.1% (Differin)                │
│     • Moisturizer (La Roche-Posay Toleriane)       │
│                                                     │
│  RECOMMENDED PRODUCTS                               │
│  [Product Card] [Product Card] [Product Card]      │
│                                                     │
│  ⚠️ CLINICAL REVIEW RECOMMENDED                    │
│  Our analysis detected signs that may benefit      │
│  from professional evaluation.                      │
│                                                     │
│  [View Details]  [Get Clinical Scan - $2.99]       │
│              (Free with Pro+ Membership)            │
└─────────────────────────────────────────────────────┘
```

### 3.2 Escalation Prompt Modal

```
┌─────────────────────────────────────────────────────┐
│  ⚠️  Clinical Attention Recommended                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Your scan shows features that warrant a closer    │
│  look by a board-certified dermatologist.          │
│                                                     │
│  WHAT WE DETECTED:                                  │
│  • Irregular pigmentation pattern                   │
│  • Asymmetric lesion characteristics                │
│  • Confidence level below diagnostic threshold      │
│                                                     │
│  CLINICAL SCAN INCLUDES:                            │
│  ✓ Medical-grade AI analysis (deeper model)        │
│  ✓ Review by board-certified dermatologist         │
│  ✓ Prescription recommendations if needed          │
│  ✓ Provider referral suggestions                    │
│  ✓ Pharmacy fulfillment coordination               │
│                                                     │
│  TURNAROUND: 24-48 hours                            │
│                                                     │
│  PRICING:                                           │
│  • One-time: $49 (you've paid $2.99, remaining     │
│    $46.01 charged on completion)                    │
│  • Pro+ Members: Included                          │
│                                                     │
│  ☐ I understand this is not emergency care.        │
│    If you have urgent concerns, contact a          │
│    healthcare provider immediately.                 │
│                                                     │
│  ☐ I consent to telemedicine evaluation per        │
│    HIPAA regulations.                               │
│                                                     │
│  [Cancel]          [Proceed to Checkout - $2.99]   │
└─────────────────────────────────────────────────────┘
```

### 3.3 Clinical Scan Checkout

```
┌─────────────────────────────────────────────────────┐
│  Clinical Scan Checkout                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ORDER SUMMARY                                      │
│  ─────────────────────────────────────────────────  │
│  Clinical Skin Analysis              $49.00        │
│  Initial Payment (today)             -$46.01       │
│  ─────────────────────────────────────────────────  │
│  Due Today                          $ 2.99         │
│                                                     │
│  (Remaining $46.01 charged when review complete)   │
│                                                     │
│  PAYMENT METHOD                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  💳 Visa ending in 4242                     │   │
│  │  [Change]                                   │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  PHARMACY PREFERENCE (Optional)                     │
│  Where should we send prescriptions?                │
│  [Search pharmacies near me]                        │
│  Or enter manually:                                 │
│  • Pharmacy name                                    │
│  • Address                                          │
│  • Phone                                            │
│                                                     │
│  ADDITIONAL NOTES FOR DERMATOLOGIST                 │
│  ┌─────────────────────────────────────────────┐   │
│  │  Any specific concerns or history you'd    │   │
│  │  like the doctor to know? (optional)       │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  [Complete Order - $2.99]                          │
└─────────────────────────────────────────────────────┘
```

### 3.4 Dermatologist Review Status Page

```
┌─────────────────────────────────────────────────────┐
│  Your Clinical Scan Status                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  CASE #SKN-2026-091500847                          │
│  Submitted: Sep 15, 2026 at 12:04 AM EDT           │
│                                                     │
│  STATUS TIMELINE                                    │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  ✓ Submitted        Sep 15, 12:04 AM              │
│  ✓ Payment Confirmed Sep 15, 12:04 AM              │
│  ⏳ Under Review    (Current Step)                 │
│  ○ Results Ready                                  │
│  ○ Follow-Up (if needed)                          │
│                                                     │
│  YOUR DERMATOLOGIST                                 │
│  ┌─────────────────────────────────────────────┐   │
│  │  👩‍⚕️ Dr. Sarah Chen, MD                     │   │
│  │  Board-Certified Dermatologist              │   │
│  │  Licensed in: NY, NJ, CT                    │   │
│  │  Specialization: Medical Dermatology        │   │
│  │  Years Experience: 12                       │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ESTIMATED COMPLETION                               │
│  By: Sep 16, 2026 at 11:59 PM EDT                  │
│  (You'll receive an email when ready)              │
│                                                     │
│  NEED TO ADD SOMETHING?                             │
│  [Upload additional photos] [Add notes]            │
│                                                     │
│  Questions? Contact support@skingenius.com         │
└─────────────────────────────────────────────────────┘
```

### 3.5 Clinical Results Page

```
┌─────────────────────────────────────────────────────┐
│  Your Clinical Results Are Ready                   │
│  Reviewed by Dr. Sarah Chen, MD                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  DIAGNOSIS                                          │
│  ─────────────────────────────────────────────────  │
│  Primary: Moderate Papulopustular Rosacea          │
│  ICD-10: L71.9                                      │
│  Confidence: 94%                                    │
│                                                     │
│  CLINICAL NOTES                                     │
│  "Patient presents with erythematous papules and   │
│  pustules concentrated on the central face.        │
│  No comedones observed, ruling out acne vulgaris.  │
│  Telangiectasia noted on bilateral cheeks.         │
│  Recommend prescription-strength anti-inflammatory │
│  therapy plus trigger avoidance."                   │
│                                                     │
│  TREATMENT PLAN                                     │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  PRESCRIPTIONS (Ready to Send to Pharmacy)          │
│  ┌─────────────────────────────────────────────┐   │
│  │  📋 Metronidazole Topical Gel 0.75%        │   │
│  │     Apply thin layer to affected areas     │   │
│  │     twice daily for 8 weeks                │   │
│  │     Refills: 2                             │   │
│  │     [Send to Pharmacy →]                   │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │  📋 Brimonidine Tartrate Gel 0.33%         │   │
│  │     Apply once daily for erythema          │   │
│  │     Refills: 3                             │   │
│  │     [Send to Pharmacy →]                   │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  OVER-THE-COUNTER RECOMMENDATIONS                   │
│  • Azelaic Acid 10% (The Ordinary)                 │
│  • Centella Asiatica Serum (La Roche-Posay)        │
│  • Mineral Sunscreen SPF 50 (no chemical filters)  │
│                                                     │
│  TRIGGER AVOIDANCE                                  │
│  • Spicy foods, hot beverages, alcohol             │
│  • Extreme temperatures (hot/cold)                 │
│  • UV exposure (daily sunscreen critical)          │
│  • Stress management techniques                    │
│                                                     │
│  FOLLOW-UP RECOMMENDED                              │
│  Yes — Re-evaluate in 8 weeks                      │
│  [Schedule Follow-Up Scan]                         │
│                                                     │
│  PROVIDER REFERRAL (Optional)                       │
│  For in-person consultation, consider:             │
│  • Dr. Michael Torres, Dermatology Associates      │
│    0.8 miles • Accepting new patients              │
│    [Request Appointment via GetUpLook]             │
│                                                     │
│  PRESCRIPTION FULFILLMENT                           │
│  Selected Pharmacy: CVS Pharmacy #8472             │
│  123 Main St, New York, NY 10001                   │
│  (212) 555-0199                                    │
│                                                     │
│  Estimated Ready: Sep 16, 2026 by 6:00 PM          │
│  [Track Prescription Status]                        │
│                                                     │
│  DOWNLOAD: [PDF Report] [Share with PCP]           │
└─────────────────────────────────────────────────────┘
```

---

## 4. Revenue Model

### 4.1 Clinical Scan Pricing Structure

| Component | Amount | Recipient | Notes |
|-----------|--------|-----------|-------|
| User Payment (Total) | $49.00 | Platform | Charged in two parts |
| Initial Payment | $2.99 | Platform | At checkout |
| Completion Payment | $46.00 | Platform | When results delivered |
| Dermatologist Fee | -$30.00 | Provider | Per case reviewed |
| **Platform Gross Margin** | **$19.00** | SKINgenius | Before affiliate revenue |

### 4.2 Pro+ Membership Alternative

- Pro+ members ($29.99/month) receive 2 clinical scans per month included
- Incremental cost to platform: $30/scan dermatologist fee
- Breakeven: Member must use ≤1 scan/month for unit economics to work
- Strategic value: Retention driver, premium tier differentiator

### 4.3 Prescription Affiliate Revenue

| Channel | Commission Rate | Average Order Value | Expected Revenue/Script |
|---------|-----------------|---------------------|------------------------|
| Partner Pharmacy Network | 8-12% | $45-85 (30-day supply) | $4.50-10.00 |
| Mail-Order Pharmacy | 15% | $120-180 (90-day supply) | $18.00-27.00 |
| Telehealth Partnership | $5-10/referral | N/A | $5.00-10.00 |

### 4.4 Provider Referral Revenue (GetUpLook Integration)

- Referral fee: $25-50 per completed in-person appointment
- Conversion rate: ~15% of clinical scan users book follow-up
- Average referral value: $35
- Expected revenue per 100 clinical scans: 15 × $35 = $525

### 4.5 Unit Economics (Per Clinical Scan)

```
Revenue Stream                          Amount
─────────────────────────────────────────────────
Clinical Scan Fee (net of derm cost)    $19.00
Prescription Affiliate (avg)            $ 8.00
Provider Referral (15% conversion)      $ 5.25
─────────────────────────────────────────────────
Total Revenue per Clinical Scan         $32.25
```

### 4.6 Projected Monthly Revenue (At Scale)

| Metric | Conservative | Target | Optimistic |
|--------|--------------|--------|------------|
| Monthly Active Users | 10,000 | 50,000 | 100,000 |
| Escalation Rate | 8% | 10% | 12% |
| Clinical Scan Conversion | 25% | 35% | 45% |
| Clinical Scans/Month | 200 | 1,750 | 5,400 |
| Revenue/Clinical Scan | $32.25 | $32.25 | $32.25 |
| **Clinical Scan Revenue** | **$6,450** | **$56,438** | **$174,150** |
| Pro+ Uplift (attributable) | $2,000 | $15,000 | $40,000 |
| **Total Incremental Revenue** | **$8,450** | **$71,438** | **$214,150** |

---

## 5. Integration Points

### 5.1 Dermatologist Dashboard

**System:** Custom web portal + mobile app  
**Access:** Secure login with 2FA, role-based permissions

#### Incoming Case Queue

```json
{
  "endpoint": "wss://derm-portal.skingenius.com/api/v1/cases/stream",
  "messageSchema": {
    "caseId": "string",
    "priority": "routine|soon|urgent",
    "submittedAt": "datetime",
    "patientAge": "integer",
    "patientSex": "string",
    "chiefComplaint": "string",
    "preliminaryAiFindings": "array",
    "images": ["url"],
    "assignedTo": "string|null",
    "slaDeadline": "datetime"
  }
}
```

#### Case Assignment Logic

- **Urgent flags:** Auto-assign to on-call dermatologist
- **Routine cases:** Round-robin distribution among available providers
- **State matching:** Cases routed only to licensed-in-state dermatologists
- **SLA:** 24 hours for routine, 4 hours for urgent, 48 hours max

#### Dermatologist Actions

- View high-resolution images with annotation tools
- Dictate clinical notes (speech-to-text integration)
- E-prescribe via integrated Surescripts connection
- Order lab tests if needed (integration with Quest/LabCorp)
- Schedule follow-up appointments
- Refer to specialists (via GetUpLook network)

### 5.2 Pharmacy APIs

#### Primary Integration: Surescripts e-Prescribing

```
Protocol: NCPDP SCRIPT Standard
Format: HL7 FHIR R4
Certification: Surescripts Certified EHR Technology
```

**Prescription Transmission Flow:**

1. Dermatologist submits Rx via dashboard
2. SKINgenius validates formulary coverage
3. Surescripts routes to patient's selected pharmacy
4. Pharmacy confirms receipt (ACK message)
5. User receives SMS/email notification
6. Prescription status tracked via Surescripts Change of Prescription Status (CPS)

#### Secondary Integration: PillPack/Capsule (Mail Order)

```
API: RESTful JSON
Auth: OAuth 2.0
Webhook: Prescription fulfillment notifications
```

**Benefits:**
- Higher affiliate commission (15% vs 8-12%)
- 90-day supply default (better adherence, higher AOV)
- Automatic refills subscription option
- White-label packaging opportunity

#### Prescription Status Endpoint

```javascript
GET /api/v1/prescription/status/{prescriptionId}

Response:
{
  "prescriptionId": "RX-2026-091500847-001",
  "medication": "Metronidazole Topical Gel 0.75%",
  "pharmacy": {
    "name": "CVS Pharmacy #8472",
    "phone": "(212) 555-0199",
    "address": "123 Main St, New York, NY 10001"
  },
  "status": "ready_for_pickup", // pending, processing, ready, dispensed, expired
  "readyBy": "2026-09-16T18:00:00-04:00",
  "expiresAt": "2026-09-23T23:59:59-04:00",
  "copay": 15.00,
  "insuranceClaimed": true
}
```

### 5.3 Provider Referral System (GetUpLook Integration)

**Integration Type:** Bidirectional API sync

#### Referral Initiation (SKINgenius → GetUpLook)

```javascript
POST https://api.getuplook.com/v1/referrals

{
  "patientId": "GUL-UUID",
  "sourceSystem": "SKINgenius",
  "referralReason": "Rosacea - prescription follow-up",
  "urgency": "routine",
  "preferredSpecialty": "Dermatology",
  "location": {
    "zipCode": "10001",
    "radiusMiles": 10
  },
  "insurance": {
    "carrier": "Blue Cross Blue Shield",
    "planType": "PPO"
  },
  "clinicalSummary": "Moderate papulopustular rosacea, prescribed metronidazole gel and brimonidine gel. Patient requests in-person consultation for ongoing management.",
  "attachments": ["clinical-report-pdf-url"]
}

Response:
{
  "referralId": "GUL-REF-2026-091500847",
  "matchedProviders": [
    {
      "providerId": "PROV-12847",
      "name": "Dr. Michael Torres",
      "practice": "Dermatology Associates of NYC",
      "distance": 0.8,
      "nextAvailable": "2026-09-18T14:30:00-04:00",
      "acceptingNewPatients": true,
      "insuranceAccepted": ["BCBS", "Aetna", "United"],
      "bookingUrl": "https://getuplook.com/book/PROV-12847?ref=SKN-2026-091500847"
    }
  ]
}
```

#### Referral Completion Webhook (GetUpLook → SKINgenius)

```javascript
POST https://api.skingenius.com/webhooks/getuplook/referral-completed

{
  "referralId": "GUL-REF-2026-091500847",
  "skingeniusCaseId": "SKN-2026-091500847",
  "appointmentBooked": true,
  "appointmentDate": "2026-09-18T14:30:00-04:00",
  "providerId": "PROV-12847",
  "referralFeeEligible": true,
  "referralFeeAmount": 35.00
}
```

### 5.4 Payment Processing (Stripe)

```javascript
// Two-phase payment for clinical scans
POST /v1/payment_intents
{
  "amount": 299, // $2.99 initial
  "currency": "usd",
  "customer": "cus_SKINGENIUS_USER_ID",
  "metadata": {
    "clinical_scan_id": "SKN-2026-091500847",
    "total_amount": 4900,
    "remaining_amount": 4601
  }
}

// Capture remaining balance on completion
POST /v1/payment_intents/{pi_id}/capture
{
  "amount_to_capture": 4601
}
```

---

## 6. Privacy & Compliance

### 6.1 HIPAA Considerations

**Covered Entity Status:** SKINgenius operates as a Business Associate when facilitating telemedicine services.

#### Required Safeguards

| Category | Implementation |
|----------|----------------|
| **Administrative** | BAAs with all dermatologists, workforce training, incident response plan |
| **Physical** | Encrypted data centers, access controls, audit logs |
| **Technical** | End-to-end encryption (TLS 1.3+), PHI tokenization, automatic logoff |

#### Protected Health Information (PHI) Handling

- All images, diagnoses, prescriptions = PHI
- Encryption at rest (AES-256) and in transit (TLS 1.3)
- Access logging: who viewed what, when, from where
- Minimum necessary principle: dermatologists see only relevant case data

### 6.2 Consent Flows

#### Multi-Layer Consent Collection

**Layer 1: Terms of Service (Onboarding)**
```
☐ I agree to SKINgenius Terms of Service
☐ I acknowledge that AI skin analysis is not medical advice
```

**Layer 2: Standard Scan Consent (Pre-Scan)**
```
☐ I consent to AI-powered analysis of my uploaded images
☐ I understand results are informational only, not diagnostic
☐ I am 18+ or have parental consent
```

**Layer 3: Clinical Scan Consent (Checkout)**
```
☐ HIPAA Acknowledgment: I understand my health information will be 
   shared with licensed healthcare providers per HIPAA regulations
☐ Telemedicine Consent: I consent to receive medical evaluation via 
   telemedicine technology
☐ Data Retention: I consent to storage of my medical images and 
   records for 7 years per federal requirements
☐ Prescription Consent: I authorize electronic transmission of 
   prescriptions to my selected pharmacy
☐ Not Emergency Care: I understand this is not for emergency 
   conditions. If I have urgent concerns, I will call 911 or 
   visit an emergency room
```

#### Consent Revocation

- Users can revoke consent via Settings → Privacy → Revoke Clinical Consent
- Revocation stops future processing but does not delete historical records (legal requirement)
- Revocation confirmation sent via email within 30 days

### 6.3 Data Retention Policy

| Data Type | Retention Period | Legal Basis | Deletion Method |
|-----------|------------------|-------------|-----------------|
| Standard scan images | 2 years | User consent | Secure erase (NIST 800-88) |
| Clinical scan images | 7 years | HIPAA §168.320 | Cryptographic shred |
| Clinical diagnoses | 7 years | HIPAA medical record req | Cryptographic shred |
| Prescriptions | 7 years | DEA/state pharmacy law | Cryptographic shred |
| Payment records | 7 years | IRS/tax law | Anonymize |
| Audit logs | 6 years | HIPAA §164.312(b) | Aggregate/anonymize |
| User account (inactive) | 3 years post-closure | Business necessity | Full deletion |

#### Right to Access (HIPAA §164.524)

- Users can request complete copy of their medical records
- Format: PDF download or secure electronic transfer
- Turnaround: ≤30 days (HIPAA requirement)
- Cost: Free for first request/year, $6.50 admin fee thereafter

#### Right to Amendment (HIPAA §164.526)

- Users can request corrections to clinical records
- Dermatologist must review amendment request within 60 days
- If denied, user can file statement of disagreement (appended to record)

### 6.4 State-by-State Compliance Matrix

| State | Telemedicine Prescribing | In-Person Visit Required | Notes |
|-------|-------------------------|--------------------------|-------|
| New York | ✅ Allowed | No | Established patient relationship required |
| California | ✅ Allowed | No | CURES PDMP check mandatory |
| Texas | ⚠️ Restricted | Yes, for controlled substances | Async OK for non-controlled |
| Florida | ✅ Allowed | No | 24-hr response time required |
| Illinois | ✅ Allowed | No | Informed consent documentation required |

**Action:** Dermatologist assignment logic must filter by state licensing + state-specific telemedicine rules.

### 6.5 Security Incident Response

#### Breach Notification Timeline

| Event | Action | Deadline |
|-------|--------|----------|
| Suspected breach | Internal investigation initiated | Immediate |
| Breach confirmed | Risk assessment completed | ≤7 days |
| ≥500 individuals affected | HHS Secretary notified | ≤60 days |
| ≥500 individuals affected | Media notice issued | ≤60 days |
| Any breach size | Affected individuals notified | ≤60 days |

#### Incident Types

- Unauthorized access (hacking, insider threat)
- Lost/stolen devices with unencrypted PHI
- Misdirected communications (wrong recipient)
- Ransomware/malware attack

### 6.6 International Considerations

**GDPR (if serving EU users):**

- Legal basis: Explicit consent (not legitimate interest)
- Data transfer: SCCs required for US hosting
- Right to erasure: Must accommodate (with HIPAA retention override disclosure)
- DPO appointment: Required if large-scale systematic monitoring

**Recommendation:** Launch US-only initially, expand internationally after compliance framework mature.

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **BA (Business Associate)** | Entity that handles PHI on behalf of covered entity |
| **CE (Covered Entity)** | Healthcare provider, health plan, or clearinghouse |
| **PHI (Protected Health Information)** | Individually identifiable health information |
| **NDC (National Drug Code)** | Unique identifier for prescription medications |
| **Surescripts** | National e-prescribing network connecting providers/pharmacies |
| **NCPDP SCRIPT** | Standard for electronic prescription transmission |
| **ICD-10** | International Classification of Diseases, 10th revision |

---

## Appendix B: Error Codes

| Code | HTTP Status | Description | User Message |
|------|-------------|-------------|--------------|
| `SCAN_001` | 400 | Invalid image format | "Please upload a JPEG or PNG image" |
| `SCAN_002` | 400 | Image too small (<640x480) | "Image resolution too low. Please retake with better lighting" |
| `SCAN_003` | 413 | Image too large (>10MB) | "File size exceeds 10MB limit. Please compress or retake" |
| `SCAN_004` | 429 | Rate limit exceeded | "You've reached your scan limit for today. Try again tomorrow" |
| `CLINICAL_001` | 402 | Payment required | "Payment required to proceed with clinical scan" |
| `CLINICAL_002` | 403 | Consent not provided | "Clinical consent required. Please review and accept" |
| `CLINICAL_003` | 404 | Clinical scan not found | "No clinical scan found with this ID" |
| `CLINICAL_004` | 409 | Duplicate clinical scan | "You already have a pending clinical scan" |
| `CLINICAL_005` | 503 | No dermatologists available | "Clinical review temporarily unavailable. Try again later" |
| `PRESCRIBE_001` | 400 | Invalid pharmacy | "Pharmacy not found. Please verify details" |
| `PRESCRIBE_002` | 403 | Controlled substance restriction | "This medication requires in-person visit per state law" |

---

**Document Control:**
- Version: 1.0
- Status: Draft (awaiting legal/compliance review)
- Next Review: 2026-10-15
- Owner: SKINgenius Product Team
<!-- project: github.com/loop-capital/skingenius -->
