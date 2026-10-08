# SKINgenius Manufacturer Tracking & Attribution API Specification

**Version:** 1.0  
**Status:** Draft  
**Last Updated:** 2026-09-16  
**Owner:** SKINgenius Architecture Team  

---

## Overview

This specification defines the API and data model for tracking manufacturer attribution and revenue events in the SKINgenius platform. When our AI recommends a specific product (e.g., Sculptra for volume loss), the manufacturer (e.g., Galderma) pays us for the referral. We track the full funnel from scan → consultation → treatment.

## Revenue Model

### Event Types & Pricing Tiers

| Event Type | Code | Price Range | Trigger |
|------------|------|-------------|---------|
| Cost Per Lead | `cpl` | $50-150 | User books consultation mentioning specific product |
| Cost Per Acquisition | `cpa` | $200-500 | Provider confirms treatment was performed with specific product |
| Certification View | `cert_view` | $25-50 | User views "certified provider" profile page |
| Clinical Trial Enrollment | `trial_enroll` | $500-2,000 | User enrolls in manufacturer-sponsored clinical trial |

### Attribution Chain

```
scan_id → condition_detected → product_recommended → manufacturer_id → consultation_booked → treatment_confirmed
```

Every revenue event must maintain a complete attribution chain linking back to the original scan that triggered the recommendation.

---

## Database Schema

### Table: `manufacturer_revenue_events`

Tracks all monetizable events attributed to manufacturers.

```sql
CREATE TABLE manufacturer_revenue_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('cpl', 'cpa', 'cert_view', 'trial_enroll')),
    manufacturer_id UUID NOT NULL REFERENCES manufacturers(id),
    product_id UUID REFERENCES products(id),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'paid', 'disputed', 'rejected')),
    
    -- Attribution Chain
    scan_id UUID REFERENCES scans(id),
    condition_detected VARCHAR(255),
    product_recommended VARCHAR(255),
    consultation_id UUID REFERENCES consultations(id),
    treatment_id UUID REFERENCES treatments(id),
    user_id UUID NOT NULL REFERENCES users(id),
    provider_id UUID REFERENCES providers(id),
    
    -- Metadata
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_revenue_events_manufacturer ON manufacturer_revenue_events(manufacturer_id);
CREATE INDEX idx_revenue_events_event_type ON manufacturer_revenue_events(event_type);
CREATE INDEX idx_revenue_events_status ON manufacturer_revenue_events(status);
CREATE INDEX idx_revenue_events_occurred_at ON manufacturer_revenue_events(occurred_at);
CREATE INDEX idx_revenue_events_scan ON manufacturer_revenue_events(scan_id);
```

### Table: `provider_certifications`

Links providers to manufacturer certifications for specific products.

```sql
CREATE TABLE provider_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES providers(id),
    manufacturer_id UUID NOT NULL REFERENCES manufacturers(id),
    product_id UUID NOT NULL REFERENCES products(id),
    
    certification_date DATE NOT NULL,
    expiry_date DATE,
    certification_number VARCHAR(255),
    certification_level VARCHAR(100), -- e.g., "Gold", "Platinum", "Preferred"
    
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'pending')),
    verification_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(provider_id, manufacturer_id, product_id)
);

CREATE INDEX idx_certifications_provider ON provider_certifications(provider_id);
CREATE INDEX idx_certifications_manufacturer ON provider_certifications(manufacturer_id);
CREATE INDEX idx_certifications_status ON provider_certifications(status);
```

### Table: `clinical_trials`

Manufacturer-sponsored clinical trials available through the platform.

```sql
CREATE TABLE clinical_trials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trial_id VARCHAR(100) NOT NULL UNIQUE, -- ClinicalTrials.gov ID or internal ID
    manufacturer_id UUID NOT NULL REFERENCES manufacturers(id),
    
    title VARCHAR(500) NOT NULL,
    description TEXT,
    conditions TEXT[], -- Array of treated conditions
    phase VARCHAR(50), -- e.g., "Phase 1", "Phase 2", "Phase 3"
    
    enrollment_target INTEGER,
    enrollment_count INTEGER DEFAULT 0,
    enrollment_status VARCHAR(50) NOT NULL DEFAULT 'recruiting' 
        CHECK (enrollment_status IN ('recruiting', 'active', 'completed', 'suspended', 'closed')),
    
    start_date DATE,
    end_date DATE,
    screening_questionnaire JSONB, -- Schema for screening questions
    informed_consent_url TEXT,
    
    compensation_amount DECIMAL(10,2),
    compensation_currency VARCHAR(3) DEFAULT 'USD',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trials_manufacturer ON clinical_trials(manufacturer_id);
CREATE INDEX idx_trials_status ON clinical_trials(enrollment_status);
CREATE INDEX idx_trials_conditions ON clinical_trials USING GIN(conditions);
```

### Table: `trial_enrollments`

Tracks user enrollments in clinical trials.

```sql
CREATE TABLE trial_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    trial_id UUID NOT NULL REFERENCES clinical_trials(id),
    
    enrollment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    screening_status VARCHAR(50) NOT NULL DEFAULT 'pending' 
        CHECK (screening_status IN ('pending', 'screening', 'qualified', 'disqualified', 'enrolled', 'withdrawn')),
    
    screening_responses JSONB, -- User's answers to screening questionnaire
    informed_consent_signed BOOLEAN DEFAULT FALSE,
    informed_consent_signed_at TIMESTAMPTZ,
    
    enrollment_confirmation_url TEXT,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, trial_id)
);

CREATE INDEX idx_enrollments_user ON trial_enrollments(user_id);
CREATE INDEX idx_enrollments_trial ON trial_enrollments(trial_id);
CREATE INDEX idx_enrollments_screening_status ON trial_enrollments(screening_status);
```

---

## API Endpoints

### Base URL
```
https://api.skingenius.com/api/v1
```

### Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <api_key>
```

API keys are scoped by role:
- `manufacturer_*` — Read-only access to own stats
- `provider_*` — Can update certifications, confirm treatments
- `platform_*` — Full access (internal use only)

---

### POST /manufacturer-events

Record a new revenue event.

**Request:**
```http
POST /api/v1/manufacturer-events
Content-Type: application/json
Authorization: Bearer <platform_api_key>

{
  "event_type": "cpl",
  "manufacturer_id": "uuid",
  "product_id": "uuid",
  "amount": 75.00,
  "currency": "USD",
  "user_id": "uuid",
  "scan_id": "uuid",
  "condition_detected": "midface_volume_loss",
  "product_recommended": "Sculptra Aesthetic",
  "consultation_id": "uuid",
  "metadata": {
    "booking_source": "mobile_app",
    "recommended_at": "2026-09-15T14:30:00Z"
  }
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "event_type": "cpl",
  "manufacturer_id": "uuid",
  "product_id": "uuid",
  "amount": 75.00,
  "currency": "USD",
  "status": "pending",
  "attribution_chain": {
    "scan_id": "uuid",
    "condition_detected": "midface_volume_loss",
    "product_recommended": "Sculptra Aesthetic",
    "consultation_id": "uuid"
  },
  "occurred_at": "2026-09-15T14:35:00Z",
  "created_at": "2026-09-15T14:35:00Z"
}
```

**Validation Rules:**
- `event_type` must be one of: `cpl`, `cpa`, `cert_view`, `trial_enroll`
- `amount` must match pricing tier for event type (±20% tolerance)
- `scan_id` required for `cpl` and `cpa` events
- `consultation_id` required for `cpl` events
- `treatment_id` required for `cpa` events
- `trial_id` required for `trial_enroll` events

---

### GET /manufacturer-events/stats

Retrieve aggregated statistics for manufacturer dashboard.

**Request:**
```http
GET /api/v1/manufacturer-events/stats?manufacturer_id=<uuid>&period=last_30_days&group_by=event_type
Authorization: Bearer <manufacturer_api_key>
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `manufacturer_id` | UUID | Yes | Filter to specific manufacturer |
| `period` | String | No | `today`, `last_7_days`, `last_30_days`, `last_90_days`, `ytd`, `all_time` |
| `group_by` | String | No | `event_type`, `product`, `provider`, `date` |
| `status` | String | No | Filter by status: `pending`, `verified`, `paid` |
| `start_date` | Date | No | Custom date range start (ISO 8601) |
| `end_date` | Date | No | Custom date range end (ISO 8601) |

**Response (200 OK):**
```json
{
  "manufacturer_id": "uuid",
  "period": {
    "start": "2026-08-17T00:00:00Z",
    "end": "2026-09-16T23:59:59Z"
  },
  "summary": {
    "total_events": 342,
    "total_revenue": 45750.00,
    "currency": "USD",
    "pending_revenue": 12500.00,
    "verified_revenue": 28250.00,
    "paid_revenue": 5000.00
  },
  "by_event_type": [
    {
      "event_type": "cpl",
      "count": 245,
      "total_revenue": 18375.00,
      "average_revenue": 75.00
    },
    {
      "event_type": "cpa",
      "count": 67,
      "total_revenue": 23450.00,
      "average_revenue": 350.00
    },
    {
      "event_type": "cert_view",
      "count": 28,
      "total_revenue": 840.00,
      "average_revenue": 30.00
    },
    {
      "event_type": "trial_enroll",
      "count": 2,
      "total_revenue": 3085.00,
      "average_revenue": 1542.50
    }
  ],
  "top_products": [
    {
      "product_id": "uuid",
      "product_name": "Sculptra Aesthetic",
      "events": 156,
      "revenue": 28500.00
    },
    {
      "product_id": "uuid",
      "product_name": "Restylane Lyft",
      "events": 89,
      "revenue": 12300.00
    }
  ],
  "funnel_metrics": {
    "scans_with_recommendation": 1250,
    "consultations_booked": 245,
    "treatments_confirmed": 67,
    "conversion_rate_scan_to_consultation": 0.196,
    "conversion_rate_consultation_to_treatment": 0.273
  }
}
```

---

### POST /provider-certifications

Link a provider to a manufacturer certification for a specific product.

**Request:**
```http
POST /api/v1/provider-certifications
Content-Type: application/json
Authorization: Bearer <provider_api_key>

{
  "provider_id": "uuid",
  "manufacturer_id": "uuid",
  "product_id": "uuid",
  "certification_date": "2026-01-15",
  "expiry_date": "2027-01-15",
  "certification_number": "GALD-2026-12345",
  "certification_level": "Platinum",
  "verification_url": "https://certifications.galderma.com/verify/GALD-2026-12345"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "provider_id": "uuid",
  "manufacturer_id": "uuid",
  "product_id": "uuid",
  "certification_date": "2026-01-15",
  "expiry_date": "2027-01-15",
  "certification_number": "GALD-2026-12345",
  "certification_level": "Platinum",
  "status": "active",
  "verification_url": "https://certifications.galderma.com/verify/GALD-2026-12345",
  "created_at": "2026-09-16T10:30:00Z"
}
```

**Validation Rules:**
- Provider must exist and be active
- Manufacturer and product must exist
- `certification_date` cannot be in the future
- `expiry_date` must be after `certification_date` if provided
- `certification_number` must be unique per manufacturer

---

### GET /provider-certifications/:provider_id

List all certifications for a specific provider.

**Request:**
```http
GET /api/v1/provider-certifications/:provider_id?status=active
Authorization: Bearer <api_key>
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | String | No | Filter by status: `active`, `expired`, `revoked`, `pending` |
| `manufacturer_id` | UUID | No | Filter by specific manufacturer |

**Response (200 OK):**
```json
{
  "provider_id": "uuid",
  "certifications": [
    {
      "id": "uuid",
      "manufacturer_id": "uuid",
      "manufacturer_name": "Galderma",
      "product_id": "uuid",
      "product_name": "Sculptra Aesthetic",
      "certification_date": "2026-01-15",
      "expiry_date": "2027-01-15",
      "certification_number": "GALD-2026-12345",
      "certification_level": "Platinum",
      "status": "active",
      "verification_url": "https://certifications.galderma.com/verify/GALD-2026-12345"
    },
    {
      "id": "uuid",
      "manufacturer_id": "uuid",
      "manufacturer_name": "Allergan",
      "product_id": "uuid",
      "product_name": "Juvederm Voluma",
      "certification_date": "2025-06-01",
      "expiry_date": "2026-06-01",
      "certification_number": "ALLG-2025-67890",
      "certification_level": "Gold",
      "status": "active",
      "verification_url": "https://certifications.allergan.com/verify/ALLG-2025-67890"
    }
  ],
  "total_count": 2,
  "active_count": 2
}
```

---

### POST /trial-enrollments

Enroll a user in a clinical trial.

**Request:**
```http
POST /api/v1/trial-enrollments
Content-Type: application/json
Authorization: Bearer <platform_api_key>

{
  "user_id": "uuid",
  "trial_id": "uuid",
  "screening_responses": {
    "age": 45,
    "condition": "midface_volume_loss",
    "previous_treatments": ["filler"],
    "medications": [],
    "allergies": [],
    "pregnant_or_nursing": false,
    "autoimmune_condition": false
  },
  "informed_consent_signed": true,
  "notes": "User expressed strong interest in long-term collagen stimulation"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "trial_id": "uuid",
  "trial_title": "Sculptra Long-Term Efficacy Study",
  "enrollment_date": "2026-09-16T15:45:00Z",
  "screening_status": "pending",
  "informed_consent_signed": true,
  "informed_consent_signed_at": "2026-09-16T15:44:30Z",
  "next_steps": {
    "action": "screening_review",
    "description": "Trial coordinator will review screening responses within 48 hours",
    "contact_email": "trials@skingenius.com"
  },
  "created_at": "2026-09-16T15:45:00Z"
}
```

**Validation Rules:**
- User must exist and be active
- Trial must exist and have `enrollment_status = 'recruiting'`
- `screening_responses` must match trial's `screening_questionnaire` schema
- `informed_consent_signed` must be true for enrollment
- User cannot be enrolled in the same trial twice

---

### GET /trial-enrollments/:enrollment_id

Get details of a specific trial enrollment.

**Request:**
```http
GET /api/v1/trial-enrollments/:enrollment_id
Authorization: Bearer <api_key>
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "trial_id": "uuid",
  "trial_title": "Sculptra Long-Term Efficacy Study",
  "manufacturer_id": "uuid",
  "manufacturer_name": "Galderma",
  "enrollment_date": "2026-09-16T15:45:00Z",
  "screening_status": "qualified",
  "screening_responses": { ... },
  "informed_consent_signed": true,
  "informed_consent_signed_at": "2026-09-16T15:44:30Z",
  "enrollment_confirmation_url": "https://trials.skingenius.com/confirm/uuid",
  "compensation_amount": 1500.00,
  "compensation_currency": "USD",
  "notes": "User expressed strong interest in long-term collagen stimulation",
  "created_at": "2026-09-16T15:45:00Z",
  "updated_at": "2026-09-16T16:30:00Z"
}
```

---

### PATCH /manufacturer-events/:event_id

Update the status of a revenue event (e.g., mark as verified or paid).

**Request:**
```http
PATCH /api/v1/manufacturer-events/:event_id
Content-Type: application/json
Authorization: Bearer <platform_api_key>

{
  "status": "verified",
  "verified_at": "2026-09-16T10:00:00Z",
  "metadata": {
    "verified_by": "admin@skingenius.com",
    "verification_notes": "Treatment confirmed by provider"
  }
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "event_type": "cpa",
  "status": "verified",
  "amount": 350.00,
  "verified_at": "2026-09-16T10:00:00Z",
  "updated_at": "2026-09-16T10:00:00Z"
}
```

**Allowed Status Transitions:**
```
pending → verified → paid
pending → rejected
verified → disputed → rejected
verified → paid
```

---

## Webhooks

Manufacturers can subscribe to webhooks for real-time event notifications.

### Event Payload
```json
{
  "event": "revenue_event.created",
  "timestamp": "2026-09-16T15:45:00Z",
  "data": {
    "id": "uuid",
    "event_type": "cpl",
    "manufacturer_id": "uuid",
    "product_id": "uuid",
    "amount": 75.00,
    "currency": "USD",
    "status": "pending",
    "occurred_at": "2026-09-16T15:45:00Z"
  }
}
```

### Supported Events
- `revenue_event.created`
- `revenue_event.verified`
- `revenue_event.paid`
- `certification.created`
- `certification.expiring_soon` (30 days before expiry)
- `trial_enrollment.created`
- `trial_enrollment.screening_complete`

---

## Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid event_type. Must be one of: cpl, cpa, cert_view, trial_enroll",
    "details": {
      "field": "event_type",
      "provided": "invalid_type",
      "allowed": ["cpl", "cpa", "cert_view", "trial_enroll"]
    }
  },
  "request_id": "req_abc123"
}
```

### HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing API key) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate enrollment, etc.) |
| 422 | Unprocessable Entity (business logic violation) |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |

---

## Rate Limits

| Endpoint Tier | Rate Limit |
|---------------|------------|
| `/manufacturer-events` (POST) | 100 requests/minute |
| `/manufacturer-events/stats` (GET) | 30 requests/minute |
| `/provider-certifications` (POST/GET) | 60 requests/minute |
| `/trial-enrollments` (POST) | 20 requests/minute |

Rate limit headers included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1694894400
```

---

## Security Considerations

### Data Privacy
- All PII encrypted at rest (AES-256)
- TLS 1.3 required for all API connections
- PHI handling compliant with HIPAA requirements
- User consent tracked for all data sharing with manufacturers

### Access Control
- API keys scoped by role and manufacturer
- Manufacturers can only access their own data
- Providers can only update their own certifications
- Platform admins have full access (audit logged)

### Audit Logging
All mutations logged to `audit_logs` table:
- Who made the change (user_id, api_key_id)
- What changed (before/after snapshot)
- When it happened (timestamp)
- From where (IP address, user agent)

---

## Implementation Notes

### Idempotency
POST endpoints support idempotency keys to prevent duplicate events:
```
Idempotency-Key: <unique_key>
```
Key valid for 24 hours. Same key + same payload = same result.

### Pagination
List endpoints support cursor-based pagination:
```
GET /api/v1/manufacturer-events/stats?limit=50&cursor=eyJpZCI6InV1aWQifQ==
```

### Date Handling
- All dates in ISO 8601 format
- All timestamps in UTC
- Client responsible for timezone conversion

---

## Future Enhancements (v2.0)

- [ ] Multi-touch attribution (multiple products recommended)
- [ ] A/B testing framework for recommendation algorithms
- [ ] Automated invoice generation for manufacturers
- [ ] Integration with manufacturer CRM systems
- [ ] Real-time bidding for premium placement
- [ ] Fraud detection ML model
- [ ] Geographic revenue heatmaps
- [ ] Provider performance rankings by conversion rate

---

<!-- project: github.com/loop-capital/skingenius -->
