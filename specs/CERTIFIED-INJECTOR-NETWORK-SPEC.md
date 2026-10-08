# SKINgenius Certified Injector Network Specification

**Version:** 1.0  
**Date:** 2026-09-15  
**Status:** Draft  

---

## Executive Summary

The SKINgenius Certified Injector Network creates a verified marketplace connecting aesthetic manufacturers (Galderma, Allergan, Merz) with trained medical providers and patients seeking qualified injectors. Manufacturers certify providers on their specific products, providers gain exclusive visibility and credibility, and patients receive assurance of proper training.

### Value Proposition

| Stakeholder | Benefit |
|-------------|---------|
| **Manufacturers** | Sell certification courses, track provider adoption, pay only for qualified referrals |
| **Providers** | Exclusive listing placement, credibility badges, direct patient matching |
| **Patients** | Verified injector qualifications, reduced risk, confidence in treatment |

---

## System Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Manufacturer   │────▶│  SKINgenius      │────▶│    Provider     │
│    Dashboard    │ API │   Platform       │ API │    Profile      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │                        │
         │                       ▼                        │
         │              ┌──────────────────┐              │
         │              │  Certification   │              │
         │              │     Engine       │              │
         │              └──────────────────┘              │
         │                       │                        │
         ▼                       ▼                        ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Certification  │     │   Patient        │     │  Verification  │
│    Programs     │     │   Search/Filter  │     │   Services     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

---

## 1. Certification Flow

### 1.1 Program Creation (Manufacturer)

**Actor:** Manufacturer Admin  
**Trigger:** Manufacturer wants to certify providers on a product  

**Steps:**
1. Manufacturer logs into dashboard
2. Creates new certification program:
   - Select product from catalog (e.g., "Sculptra", "Botox", "Juvederm Voluma")
   - Define program name (e.g., "Galderma Sculptra Certified Injector")
   - Write description and learning objectives
   - Upload training materials or link to external LMS
   - Set requirements (license type, specialty, years of experience)
   - Configure certification validity period (default: 1 year)
3. System generates unique `program_id`
4. Program status: `draft` → `active` upon approval

**API Endpoint:** `POST /api/v1/certification/programs`

### 1.2 Provider Application

**Actor:** Medical Provider  
**Trigger:** Provider wants to become certified  

**Steps:**
1. Provider views certification program details
2. Clicks "Apply for Certification"
3. System validates basic eligibility:
   - Active medical license in good standing
   - Meets specialty requirements (if any)
   - No prior disciplinary actions (via board lookup)
4. Provider submits application:
   - Uploads current medical license
   - Uploads malpractice insurance certificate
   - Answers attestation questions
   - Pays application fee (if applicable)
5. System creates `certification_application` record
6. Application status: `submitted`
7. Manufacturer notified via email + dashboard alert

**API Endpoint:** `POST /api/v1/certification/applications`

### 1.3 Training & Review

**Actor:** Manufacturer Reviewer  
**Trigger:** Application submitted  

**Steps:**
1. Manufacturer reviews application in dashboard
2. Options:
   - **Approve for training** → Provider receives training access link
   - **Request more info** → Application status: `pending_info`
   - **Reject** → Application status: `rejected`, reason recorded
3. If approved:
   - Provider completes training (online course, in-person workshop, or hybrid)
   - Training completion tracked via webhook or manual upload
   - Provider passes assessment (score ≥80%)
4. Training status updated: `training_complete`

### 1.4 Certification Issuance

**Actor:** Manufacturer Admin  
**Trigger:** Training completed successfully  

**Steps:**
1. Manufacturer verifies training completion
2. Issues certification via API or dashboard:
   - Uploads signed certificate PDF
   - Sets certification start date
   - Sets expiry date (based on program configuration)
3. System creates `provider_certification` record
4. Certification status: `active`
5. Provider profile updated with badge
6. Provider notified via email

**API Endpoint:** `POST /api/v1/certification/issue`

### 1.5 Recertification

**Trigger:** Certification expires in 60 days  

**Automated Workflow:**
1. System sends recertification reminder to provider (email + in-app)
2. Provider completes continuing education or refresher course
3. Manufacturer reviews recertification request
4. New certification issued with updated expiry date
5. If not renewed by expiry:
   - Certification status: `expired`
   - Badge removed from profile
   - Provider no longer appears in filtered search results

---

## 2. Provider Verification

### 2.1 License Validation

**Method:** State Medical Board API Integration  

**Process:**
1. Provider enters NPI number and state license number during onboarding
2. System queries state medical board API (or third-party service like Verifiable):
   - License status (active/inactive/suspended)
   - License type (MD, DO, NP, PA, RN)
   - Specialty/board certification
   - Disciplinary history
   - Expiry date
3. Response cached for 30 days
4. Automated daily check for license status changes
5. If license becomes inactive:
   - All certifications flagged as `license_invalid`
   - Provider profile suspended from marketplace
   - Manufacturer notified

**Data Sources:**
- FSMB (Federation of State Medical Boards)
- NPPES (National Plan and Provider Enumeration System)
- State-specific board APIs
- Third-party verification services (Verifiable, CredentialStream)

### 2.2 Training Certificate Upload

**Requirements:**
- PDF format, max 10 MB
- Must include:
  - Provider name (matching profile)
  - Training program name
  - Completion date
  - Issuing organization (manufacturer or accredited institution)
  - Signature or seal
- OCR extraction for metadata validation

**Validation:**
1. File type and size check
2. OCR extracts key fields
3. Manual review queue for first-time providers
4. Automated approval for trusted issuers (manufacturer webhook preferred)

### 2.3 Manufacturer Attestation (Webhook)

**Preferred Method:** Direct API integration with manufacturer systems  

**Webhook Payload:**
```json
{
  "event": "certification.issued",
  "timestamp": "2026-09-15T14:30:00Z",
  "data": {
    "provider_npi": "1234567890",
    "program_id": "prog_galderma_sculptra_001",
    "certification_id": "cert_abc123",
    "status": "active",
    "issued_date": "2026-09-15",
    "expiry_date": "2027-09-15",
    "certificate_url": "https://galderma.com/certs/abc123.pdf"
  }
}
```

**Security:**
- HMAC signature verification
- IP allowlist for manufacturer webhooks
- Retry logic (3 attempts, exponential backoff)
- Dead letter queue for failed deliveries

### 2.4 Annual Recertification Requirements

**Automatic Triggers:**
- 60 days before expiry: First reminder
- 30 days before expiry: Second reminder + CEU recommendations
- 7 days before expiry: Final warning
- On expiry: Status changed to `expired`, badge removed

**Recertification Paths:**
1. **Full re-certification:** Complete full training program again
2. **Continuing Education:** Complete X hours of manufacturer-approved CEUs
3. **Case Log Submission:** Submit log of X procedures performed in past year
4. **Assessment Only:** Pass updated knowledge assessment (for recent certs)

---

## 3. User-Facing Certification Badges

### 3.1 Badge Design System

**Visual Hierarchy:**

| Level | Display | Description |
|-------|---------|-------------|
| **Tier 1** | Manufacturer logo + "Certified" | e.g., "Galderma Certified Injector" |
| **Tier 2** | Product icons + names | "Trained in: Sculptra, Botox, Juvederm" |
| **Tier 3** | Text list | Full certification details on profile page |

**Badge Specifications:**
- Size: 48x48px (card), 128x128px (profile)
- Format: SVG with fallback PNG
- Colors: Match manufacturer brand guidelines
- Accessibility: Alt text, ARIA labels

### 3.2 Provider Card Display

**Search Results Card:**
```
┌─────────────────────────────────────────┐
│ [Photo] Dr. Sarah Chen, MD             │
│          Dermatology                   │
│          ⭐ 4.9 (127 reviews)          │
│                                         │
│ 🏆 Galderma Certified                  │
│ 💉 Sculptra • Botox • Juvederm         │
│                                         │
│ [Book Consultation]  [View Profile]    │
└─────────────────────────────────────────┘
```

**Profile Page Section:**
```markdown
## Certifications & Training

### 🏆 Galderma Certified Injector
- **Products:** Sculptra, Botox Cosmetic, Juvederm Collection
- **Certified:** September 2026
- **Expires:** September 2027
- **Certificate ID:** GALD-2026-SC-4892
- [View Certificate PDF]

### 🏆 Allergan Aesthetics Elite Provider
- **Products:** Botox, Juvederm, Kybella
- **Certified:** March 2026
- **Expires:** March 2027

### Advanced Training
- Facial Anatomy Dissection Course — UCLA, 2025
- Master Injector Series — AAFS, 2024
```

### 3.3 Search Filters

**Filter Options:**
```
☑️ Show only certified providers
   ├─ ☑️ Galderma Certified
   ├─ ☑️ Allergan Certified
   ├─ ☑️ Merz Certified
   └─ ☑️ Other Manufacturers

☑️ Product-specific certification
   ├─ ☑️ Sculptra
   ├─ ☑️ Botox
   ├─ ☑️ Juvederm
   ├─ ☑️ Kybella
   └─ ☑️ Radiesse
```

**Query Parameters:**
```
GET /api/v1/providers/search?certification=galderma&product=sculptra
GET /api/v1/providers/search?certified_only=true
GET /api/v1/providers/search?products=sculptra,botox
```

**Ranking Boost:**
- Certified providers: +30% ranking score
- Multiple certifications: +10% per additional cert (max +50%)
- Recently certified (<6 months): +15% "freshness" boost

---

## 4. Manufacturer Dashboard

### 4.1 Dashboard Overview

**Key Metrics (Top Row):**
- Total Certified Providers: 1,247
- Active Certification Programs: 8
- Pending Applications: 34
- Certifications Expiring (30 days): 89
- CPL This Month: $12,450
- CPA This Month: $48,200

### 4.2 Provider Management

**View:** All certified providers with filters

**Columns:**
- Provider name + photo
- Specialty
- Location (city, state)
- Certification date
- Expiry date
- Status (active/expired/pending)
- Patient referrals (MTD)
- Revenue generated (MTD)

**Actions:**
- View provider profile
- Download certificate
- Send message
- Revoke certification (with reason)
- Export list (CSV)

### 4.3 Certification Pipeline

**Funnel Visualization:**
```
Applied: 156
  ↓ (65% approval rate)
Approved for Training: 101
  ↓ (82% completion rate)
Training Complete: 83
  ↓ (95% pass rate)
Certified: 79
```

**Pipeline Stages:**
1. **Submitted** — Application received, under review
2. **Pending Info** — Awaiting additional documentation
3. **Approved** — Cleared for training access
4. **In Training** — Currently enrolled in course
5. **Training Complete** — Course finished, awaiting assessment
6. **Assessment Passed** — Ready for certification
7. **Certified** — Active certification issued
8. **Expired** — Certification lapsed

**Time-in-Stage Metrics:**
- Average review time: 3.2 days
- Average training completion: 14 days
- Average assessment to cert: 1.8 days

### 4.4 Revenue Analytics

**Revenue Streams:**

| Metric | MTD | QTD | YTD |
|--------|-----|-----|-----|
| **CPL (Cost Per Lead)** | $12,450 | $34,200 | $89,400 |
| Leads generated | 312 | 891 | 2,340 |
| Avg CPL | $39.90 | $38.38 | $38.21 |
| **CPA (Cost Per Acquisition)** | $48,200 | $142,000 | $378,000 |
| Conversions | 96 | 289 | 756 |
| Avg CPA | $502.08 | $491.35 | $500.00 |
| **Listing Fees** | $8,500 | $24,000 | $72,000 |
| Active listings | 17 | 48 | 144 |

**Charts:**
- Monthly revenue trend (line chart)
- Revenue by product (pie chart)
- Top 10 providers by referrals (bar chart)
- Geographic distribution (heat map)

### 4.5 Program Management

**CRUD Operations:**

**Create Program:**
- Product selection (from manufacturer catalog)
- Program name and description
- Requirements definition
- Training content upload/link
- Assessment configuration
- Pricing (application fee, course fee)
- Validity period

**Update Program:**
- Edit description/requirements
- Update training materials
- Modify assessment
- Change pricing
- Pause/unpause enrollment

**Expire Program:**
- Set end date for new enrollments
- Honor existing certifications until expiry
- Archive program data

**Program Status:**
- `draft` — Not yet published
- `active` — Accepting applications
- `paused` — Temporarily not accepting
- `archived` — No longer active

---

## 5. Revenue Model

### 5.1 Certification Lead Fee

**Definition:** Charged when a user views a certified provider's profile  

**Pricing Tiers:**
| Volume | Price Per Lead |
|--------|----------------|
| 0-100 leads/month | $50 |
| 101-500 leads/month | $40 |
| 501-1,000 leads/month | $35 |
| 1,000+ leads/month | $25 |

**Lead Definition:**
- Unique user session
- Provider profile page view (≥10 seconds)
- Excludes bot traffic, provider self-views
- Deduplicated within 24-hour window

**Billing:**
- Monthly invoice
- Itemized by provider/product
- Credit card or ACH payment
- Net-30 terms

### 5.2 Annual Certification Listing Fee

**Definition:** Provider pays annual fee to maintain certified listing  

**Pricing:**
| Tier | Price Per Year | Features |
|------|----------------|----------|
| **Basic** | $500/year | Standard badge, search inclusion |
| **Premium** | $750/year | Enhanced profile, priority support |
| **Elite** | $1,000/year | Top search placement, featured listing |

**Billing Flow:**
1. Provider pays at time of certification issuance
2. Annual renewal due on certification anniversary
3. Grace period: 30 days post-expiry
4. Late fee: $50 after grace period
5. Non-payment: certification suspended

**Revenue Split:**
- SKINgenius platform: 30%
- Manufacturer: 70%

**Rationale:** Incentivizes manufacturers to drive provider enrollment while maintaining platform sustainability.

### 5.3 Exclusive Matching (Priority Placement)

**Algorithm:**
```
ranking_score = base_relevance 
              + certification_boost 
              + recency_boost 
              + engagement_boost

certification_boost = 
  if certified_for_searched_product: +30
  elif certified_any_product: +15
  else: 0

recency_boost = min(15, days_since_certification / 30 * 15)

engagement_boost = min(20, avg_rating * 4 + review_count / 10)
```

**Placement Tiers:**

| Position | Requirement | Cost |
|----------|-------------|------|
| **Top 3 Results** | Certified + Premium tier | Included in Elite |
| **Featured Carousel** | Certified + 4.5★+ rating | $200/month per product |
| **"Recommended" Badge** | Certified + 50+ reviews | Algorithm-selected |

**A/B Testing:**
- Test different boost weights quarterly
- Monitor conversion rates by position
- Ensure non-certified providers still get visibility (fairness constraint: min 20% of page 1)

### 5.4 Additional Revenue Opportunities

**Future Monetization:**

| Stream | Description | Est. Revenue |
|--------|-------------|--------------|
| **Course Hosting** | Host manufacturer training on platform | $5,000-20,000/course |
| **CEU Accreditation** | Offer CME/CEU credits for courses | $50/provider/course |
| **Verification API** | License verification as standalone API | $0.10-0.50/call |
| **White-label Portal** | License platform to manufacturers | $50,000-200,000/year |
| **Data Insights** | Aggregated market trends (de-identified) | $10,000-50,000/report |

---

## 6. Database Schema

### 6.1 certification_programs

```sql
CREATE TABLE certification_programs (
    program_id          VARCHAR(64) PRIMARY KEY,
    manufacturer_id     VARCHAR(64) NOT NULL REFERENCES manufacturer_accounts(manufacturer_id),
    product_id          VARCHAR(64) REFERENCES products(product_id),
    name                VARCHAR(255) NOT NULL,
    description         TEXT,
    requirements        JSONB,  -- {license_types: [...], specialties: [...], min_experience_years: int}
    training_url        VARCHAR(512),  -- Link to external LMS or internal course
    assessment_required BOOLEAN DEFAULT true,
    passing_score       INT DEFAULT 80,  -- Percentage
    validity_months     INT DEFAULT 12,
    application_fee_cents INT DEFAULT 0,
    course_fee_cents    INT DEFAULT 0,
    status              VARCHAR(32) DEFAULT 'draft',  -- draft, active, paused, archived
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by          VARCHAR(64),  -- User ID
    metadata            JSONB  -- Custom fields, tags, etc.
);

CREATE INDEX idx_cert_programs_manufacturer ON certification_programs(manufacturer_id);
CREATE INDEX idx_cert_programs_product ON certification_programs(product_id);
CREATE INDEX idx_cert_programs_status ON certification_programs(status);
```

### 6.2 provider_certifications

```sql
CREATE TABLE provider_certifications (
    certification_id    VARCHAR(64) PRIMARY KEY,
    provider_id         VARCHAR(64) NOT NULL REFERENCES providers(provider_id),
    program_id          VARCHAR(64) NOT NULL REFERENCES certification_programs(program_id),
    application_id      VARCHAR(64) REFERENCES certification_applications(application_id),
    certification_date  DATE NOT NULL,
    expiry_date         DATE NOT NULL,
    status              VARCHAR(32) DEFAULT 'active',  -- active, expired, revoked, suspended
    certificate_url     VARCHAR(512),  -- PDF or verification page
    certificate_id      VARCHAR(128),  -- Manufacturer's cert ID
    credential_hash     VARCHAR(64),  -- SHA256 for verification
    recertification_count INT DEFAULT 0,
    last_recertified_at TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at          TIMESTAMP WITH TIME ZONE,
    revoked_by          VARCHAR(64),
    revocation_reason   TEXT,
    metadata            JSONB,
    
    UNIQUE(provider_id, program_id)  -- One active cert per program
);

CREATE INDEX idx_provider_certs_provider ON provider_certifications(provider_id);
CREATE INDEX idx_provider_certs_program ON provider_certifications(program_id);
CREATE INDEX idx_provider_certs_status ON provider_certifications(status);
CREATE INDEX idx_provider_certs_expiry ON provider_certifications(expiry_date);
```

### 6.3 certification_applications

```sql
CREATE TABLE certification_applications (
    application_id      VARCHAR(64) PRIMARY KEY,
    provider_id         VARCHAR(64) NOT NULL REFERENCES providers(provider_id),
    program_id          VARCHAR(64) NOT NULL REFERENCES certification_programs(program_id),
    status              VARCHAR(32) DEFAULT 'submitted',  -- submitted, pending_info, approved, rejected, training, complete, certified
    submitted_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at         TIMESTAMP WITH TIME ZONE,
    reviewed_by         VARCHAR(64),  -- Manufacturer user ID
    rejection_reason    TEXT,
    info_requested      TEXT,  -- What additional info is needed
    info_provided_at    TIMESTAMP WITH TIME ZONE,
    training_started_at TIMESTAMP WITH TIME ZONE,
    training_completed_at TIMESTAMP WITH TIME ZONE,
    assessment_score    INT,
    assessment_taken_at TIMESTAMP WITH TIME ZONE,
    certified_at        TIMESTAMP WITH TIME ZONE,
    payment_status      VARCHAR(32) DEFAULT 'pending',  -- pending, paid, waived, refunded
    payment_amount_cents INT,
    payment_intent_id   VARCHAR(128),  -- Stripe PaymentIntent ID
    documents           JSONB,  -- [{type: 'license', url: '...', uploaded_at: ...}]
    metadata            JSONB,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cert_apps_provider ON certification_applications(provider_id);
CREATE INDEX idx_cert_apps_program ON certification_applications(program_id);
CREATE INDEX idx_cert_apps_status ON certification_applications(status);
CREATE INDEX idx_cert_apps_submitted ON certification_applications(submitted_at);
```

### 6.4 manufacturer_accounts

```sql
CREATE TABLE manufacturer_accounts (
    manufacturer_id     VARCHAR(64) PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,  -- e.g., "Galderma", "Allergan Aesthetics"
    legal_name          VARCHAR(255),  -- For contracts
    contact_email       VARCHAR(255) NOT NULL,
    contact_phone       VARCHAR(32),
    billing_email       VARCHAR(255),
    website             VARCHAR(512),
    logo_url            VARCHAR(512),
    brand_colors        JSONB,  -- {primary: '#hex', secondary: '#hex'}
    address             JSONB,  -- {street, city, state, zip, country}
    tax_id              VARCHAR(64),  -- EIN or equivalent
    billing_info        JSONB,  -- {payment_method_id, billing_address, terms: 'net30'}
    stripe_customer_id  VARCHAR(128),
    api_credentials     JSONB,  -- {api_key_hash, webhook_secret, ip_allowlist: [...]}
    account_manager     VARCHAR(64),  -- Internal SKINgenius user ID
    status              VARCHAR(32) DEFAULT 'active',  -- active, suspended, terminated
    onboarded_at        TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_manufacturers_status ON manufacturer_accounts(status);
CREATE UNIQUE INDEX idx_manufacturers_name ON manufacturer_accounts(name);
```

### 6.5 Supporting Tables (References)

```sql
-- providers table (existing, extended)
ALTER TABLE providers ADD COLUMN npi_number VARCHAR(10);
ALTER TABLE providers ADD COLUMN license_number VARCHAR(64);
ALTER TABLE providers ADD COLUMN license_state CHAR(2);
ALTER TABLE providers ADD COLUMN license_expiry DATE;
ALTER TABLE providers ADD COLUMN board_certifications JSONB;
ALTER TABLE providers ADD COLUMN malpractice_insurance JSONB;

-- products table (existing or new)
CREATE TABLE products (
    product_id          VARCHAR(64) PRIMARY KEY,
    manufacturer_id     VARCHAR(64) REFERENCES manufacturer_accounts(manufacturer_id),
    name                VARCHAR(255) NOT NULL,
    category            VARCHAR(64),  -- neurotoxin, filler, biostimulator, etc.
    fda_approved        BOOLEAN,
    indications         TEXT[],
    contraindications   TEXT[],
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- certification_events (audit log)
CREATE TABLE certification_events (
    event_id            VARCHAR(64) PRIMARY KEY,
    certification_id    VARCHAR(64) REFERENCES provider_certifications(certification_id),
    event_type          VARCHAR(64) NOT NULL,  -- issued, renewed, expired, revoked, suspended
    event_data          JSONB,
    actor_id            VARCHAR(64),  -- User or system
    actor_type          VARCHAR(32),  -- provider, manufacturer, system
    occurred_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cert_events_cert ON certification_events(certification_id);
CREATE INDEX idx_cert_events_type ON certification_events(event_type);
```

---

## 7. API Reference

### 7.1 Certification Programs

```http
# List programs for a manufacturer
GET /api/v1/certification/programs?manufacturer_id={id}&status=active

# Get program details
GET /api/v1/certification/programs/{program_id}

# Create program
POST /api/v1/certification/programs
Content-Type: application/json
Authorization: Bearer {manufacturer_api_key}

{
  "product_id": "prod_sculptra_001",
  "name": "Galderma Sculptra Certified Injector",
  "description": "...",
  "requirements": {
    "license_types": ["MD", "DO", "NP"],
    "specialties": ["Dermatology", "Plastic Surgery"],
    "min_experience_years": 2
  },
  "training_url": "https://lms.galderma.com/sculptra-101",
  "validity_months": 12,
  "application_fee_cents": 0,
  "course_fee_cents": 50000
}

# Update program
PATCH /api/v1/certification/programs/{program_id}

# Archive program
POST /api/v1/certification/programs/{program_id}/archive
```

### 7.2 Applications

```http
# Submit application
POST /api/v1/certification/applications
Content-Type: application/json
Authorization: Bearer {provider_token}

{
  "program_id": "prog_galderma_sculptra_001",
  "documents": [
    {"type": "medical_license", "url": "s3://..."},
    {"type": "malpractice_insurance", "url": "s3://..."}
  ],
  "attestations": {
    "active_license": true,
    "no_disciplinary_actions": true,
    "completed_prerequisites": true
  }
}

# Get application status
GET /api/v1/certification/applications/{application_id}

# Submit additional info
POST /api/v1/certification/applications/{application_id}/info
{
  "documents": [...],
  "responses": {...}
}

# Manufacturer: approve for training
POST /api/v1/certification/applications/{application_id}/approve
{
  "training_access_granted_until": "2026-12-31"
}

# Manufacturer: reject application
POST /api/v1/certification/applications/{application_id}/reject
{
  "reason": "Does not meet minimum experience requirement"
}
```

### 7.3 Certification Issuance

```http
# Issue certification (webhook or manual)
POST /api/v1/certification/issue
Authorization: Bearer {manufacturer_api_key}

{
  "application_id": "app_xyz789",
  "certification_id": "GALD-2026-SC-4892",
  "issued_date": "2026-09-15",
  "expiry_date": "2027-09-15",
  "certificate_url": "https://galderma.com/certs/GALD-2026-SC-4892.pdf"
}

# Revoke certification
POST /api/v1/certification/{certification_id}/revoke
{
  "reason": "License suspended by state medical board",
  "effective_date": "2026-09-15"
}

# Verify certification (public endpoint)
GET /api/v1/certification/verify?certification_id=GALD-2026-SC-4892

Response:
{
  "valid": true,
  "provider_name": "Dr. Sarah Chen",
  "npi": "1234567890",
  "program_name": "Galderma Sculptra Certified Injector",
  "issued_date": "2026-09-15",
  "expiry_date": "2027-09-15",
  "status": "active"
}
```

### 7.4 Webhooks

```http
# Manufacturer → SKINgenius
POST https://api.skingenius.com/webhooks/certification/v1

Headers:
  X-Webhook-Signature: sha256=...
  X-Manufacturer-ID: galderma

Events:
  - certification.issued
  - certification.renewed
  - certification.revoked
  - training.completed
  - assessment.passed
  - assessment.failed
```

---

## 8. Security & Compliance

### 8.1 Data Protection

**PHI Considerations:**
- No patient data stored in certification system
- Provider data is not PHI but requires protection
- HIPAA compliance recommended (not required)

**Encryption:**
- TLS 1.3 for all API communications
- AES-256 encryption at rest
- Encrypted certificate URLs (signed, time-limited)

**Access Control:**
- RBAC: manufacturer_admin, manufacturer_reviewer, provider, patient
- API keys scoped to manufacturer account
- OAuth 2.0 for provider portal access

### 8.2 Audit & Logging

**Audit Events:**
- All certification state changes logged
- Immutable audit trail (append-only)
- Retention: 7 years minimum

**Log Fields:**
```json
{
  "event_id": "evt_abc123",
  "timestamp": "2026-09-15T14:30:00Z",
  "actor_id": "user_xyz789",
  "actor_type": "manufacturer_admin",
  "action": "certification.revoked",
  "resource_type": "provider_certification",
  "resource_id": "cert_def456",
  "changes": {"status": {"from": "active", "to": "revoked"}},
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0..."
}
```

### 8.3 Fraud Prevention

**Detection Mechanisms:**
- Duplicate license detection across providers
- Expired/invalid license auto-flagging
- Unusual certification velocity alerts
- Geographic anomaly detection (provider claims training in impossible locations)

**Manual Review Triggers:**
- First certification from new manufacturer
- High-volume provider (>5 certs/month)
- Disciplinary history found
- Mismatched document metadata

---

## 9. Implementation Roadmap

### Phase 1: MVP (Weeks 1-6)
- [ ] Core database schema
- [ ] Basic CRUD for certification programs
- [ ] Provider application flow (manual review)
- [ ] Simple badge display on profiles
- [ ] Manual certification issuance
- [ ] Basic manufacturer dashboard

### Phase 2: Automation (Weeks 7-12)
- [ ] License verification API integration
- [ ] Automated recertification reminders
- [ ] Webhook infrastructure
- [ ] Search filtering by certification
- [ ] Revenue tracking and invoicing
- [ ] Enhanced analytics dashboard

### Phase 3: Scale (Weeks 13-18)
- [ ] Priority ranking algorithm
- [ ] Multi-manufacturer support
- [ ] White-label portal pilot
- [ ] CEU accreditation partnerships
- [ ] Mobile app integration
- [ ] Advanced fraud detection

### Phase 4: Expansion (Weeks 19-24)
- [ ] International markets (Canada, UK, EU)
- [ ] Additional specialties (dental, veterinary)
- [ ] Device manufacturer certifications (lasers, RF)
- [ ] Insurance verification integration
- [ ] Outcome tracking integration

---

## 10. Success Metrics

### Key Performance Indicators

| Metric | Target (Y1) | Target (Y2) |
|--------|-------------|-------------|
| Certified Providers | 500 | 2,000 |
| Participating Manufacturers | 3 | 8 |
| Active Certification Programs | 10 | 40 |
| Monthly Certification Leads | 1,000 | 5,000 |
| Platform Revenue (MRR) | $50K | $250K |
| Provider Retention Rate | 75% | 85% |
| Patient Conversion Rate | 12% | 18% |

### Quality Metrics

- Certification issuance accuracy: >99.5%
- License verification uptime: >99.9%
- Average application review time: <5 days
- Provider satisfaction (NPS): >50
- Manufacturer satisfaction (NPS): >60

---

## Appendix A: Sample Badge Assets

**SVG Badge Template:**
```svg
<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <circle cx="24" cy="24" r="22" fill="#00A651"/>
  <path d="M24 8 L28 18 L38 18 L30 25 L33 35 L24 29 L15 35 L18 25 L10 18 L20 18 Z" fill="#FFD700"/>
  <text x="24" y="42" font-size="6" text-anchor="middle" fill="#FFFFFF">CERTIFIED</text>
</svg>
```

**Alt Text Guidelines:**
- ✅ "Galderma Certified Injector"
- ✅ "Certified in Sculptra by Galderma"
- ❌ "Badge image"
- ❌ "Icon"

---

## Appendix B: Email Templates

### Certification Issued

```
Subject: You're Now a {Program Name} Certified Injector!

Hi {Provider Name},

Congratulations! You've successfully completed the {Program Name} certification.

Your certification details:
- Certificate ID: {certificate_id}
- Issued: {issued_date}
- Expires: {expiry_date}
- Products: {product_list}

Download your certificate: {certificate_url}

What's next?
✓ Your profile has been updated with the {Manufacturer} Certified badge
✓ You'll now appear in searches for {product}-certified providers
✓ Patients can verify your certification at: {verification_url}

Questions? Contact us at certifications@skingenius.com

— The SKINgenius Team
```

### Recertification Reminder (60 days)

```
Subject: Your {Program Name} Certification Expires in 60 Days

Hi {Provider Name},

Your {Program Name} certification will expire on {expiry_date}.

To maintain your certified status and keep your badge active:
1. Complete the recertification course: {course_url}
2. Pass the assessment (80% required)
3. Submit your updated credentials

Already completed? Ignore this email—your certification is being processed.

Need help? Reply to this email or call {support_phone}

— The SKINgenius Team
```

---

## Appendix C: Competitive Analysis

| Feature | SKINgenius | RealSelf | Vitals | Healthgrades |
|---------|------------|----------|--------|--------------|
| Manufacturer-certified badges | ✅ | ❌ | ❌ | ❌ |
| Product-specific filtering | ✅ | Partial | ❌ | ❌ |
| Automated license verification | ✅ | ❌ | ✅ | ✅ |
| Recertification tracking | ✅ | ❌ | ❌ | ❌ |
| Manufacturer revenue share | ✅ | ❌ | ❌ | ❌ |
| CEU integration | Planned | ❌ | ❌ | ❌ |

**Differentiation:** SKINgenius is the only platform directly integrating manufacturer certification programs with patient-facing discovery, creating a closed-loop ecosystem that benefits all stakeholders.

---

*End of Specification*
