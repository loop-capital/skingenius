# GetUpLook Integration for SKINgenius

## Overview
SKINgenius refers users to professional beauty/wellness providers through GetUpLook (getuplook.com). This document specifies the integration between the two platforms.

## GetUpLook Context (from Memory)
- **URL**: getuplook.com
- **Purpose**: Local Beauty Pro Finder
- **Backend**: `backend-rho-two-33.vercel.app`
- **Supabase**: `prowvkbxcdhtoiidxowb.supabase.co`
- **Tables**: provider_profiles, services
- **Status**: Operational (backend redeployed by Claude on 5/10)
- **Agent**: GetUpLook team manages this — SKINgenius integrates via API

## Integration Architecture

### 1. Referral Flow
```
User gets high-severity assessment in SKINgenius
         ↓
Recommendation engine flags "Professional referral needed"
         ↓
User taps "Find a Provider Near You"
         ↓
SKINgenius calls GetUpLook API
         ↓
GetUpLook returns matching providers
         ↓
User views provider profiles, ratings, services
         ↓
User books appointment through GetUpLook
         ↓
SKINgenius tracks referral outcome
```

### 2. API Endpoints Needed from GetUpLook

#### Search Providers
```
GET /api/providers/search
Query params:
  - lat (float): User latitude
  - lng (float): User longitude
  - radius (int): Search radius in miles (default: 25)
  - services (string[]): Filter by service type
  - conditions (string[]): Filter by conditions treated
  - availability (string): "today", "this_week", "any"
  - insurance (string[]): Accepted insurance plans
  - min_rating (float): Minimum rating (1-5)
  - sort_by (string): "distance", "rating", "availability"

Response:
{
  providers: [
    {
      id: string,
      name: string,
      business_name: string,
      photo_url: string,
      rating: float,
      review_count: int,
      distance_miles: float,
      address: {
        street: string,
        city: string,
        state: string,
        zip: string
      },
      phone: string,
      services: [
        {
          id: string,
          name: string,
          price_range: string,
          duration_minutes: int
        }
      ],
      specialties: string[],
      conditions_treated: string[],
      next_availability: string, // ISO date
      verified: boolean
    }
  ],
  total: int,
  page: int,
  per_page: int
}
```

#### Get Provider Details
```
GET /api/providers/:id
Response: Full provider profile with services, reviews, photos, credentials
```

#### Book Appointment
```
POST /api/appointments
Body:
{
  provider_id: string,
  service_id: string,
  user_id: string, // SKINgenius user ID (mapped to GetUpLook)
  requested_date: string,
  notes: string, // "Referred by SKINgenius for [condition]"
  skingenius_referral_id: string // For tracking
}

Response:
{
  appointment_id: string,
  status: "pending" | "confirmed" | "rejected",
  confirmation_code: string,
  provider_response_time: string // estimated
}
```

### 3. Service Mapping

Map SKINgenius conditions → GetUpLook services:

| SKINgenius Condition | GetUpLook Services |
|---------------------|-------------------|
| Acne (severe) | Dermatology, Acne Treatment, Chemical Peels |
| Photoaging (advanced) | Dermatology, Botox, Fillers, Laser Resurfacing |
| Hyperpigmentation (severe) | Dermatology, Chemical Peels, Laser Therapy |
| Rosacea (moderate-severe) | Dermatology, Rosacea Treatment, LED Therapy |
| Eczema (moderate-severe) | Dermatology, Eczema Treatment |
| Skin Cancer Screening | Dermatology, Skin Cancer Screening |
| Anti-aging (surgical) | Plastic Surgery, Facelift Consultation |
| Hair Loss | Dermatology, Trichology, PRP |
| Body Contouring | CoolSculpting, EMSCULPT, Liposuction Consultation |

### 4. Severity-Based Referral Logic

From `recommendation-engine.js`:

```javascript
const REFERRAL_TRIGGERS = {
  acne: {
    severity: 7, // Moderate-severe
    reasons: [
      'Cystic or nodular acne',
      'Scarring occurring',
      'No improvement after 12 weeks'
    ]
  },
  photoaging: {
    severity: 7,
    reasons: [
      'Deep wrinkles with volume loss',
      'Actinic keratosis (precancerous)',
      'Severe sun damage'
    ]
  },
  hyperpigmentation: {
    severity: 7,
    reasons: [
      'Rapidly changing lesions',
      'Blue-gray dermal melasma',
      'No improvement after 3 months'
    ]
  },
  rosacea: {
    severity: 6, // Lower threshold
    reasons: [
      'Eye involvement (ocular)',
      'Rhinophyma',
      'Severe flushing affecting life'
    ]
  },
  eczema: {
    severity: 7,
    reasons: [
      'Widespread (>20% body)',
      'Sleep disruption',
      'Infection signs'
    ]
  }
};
```

### 5. User Experience Flow

#### In SKINgenius App:
1. User completes skin assessment
2. Sees condition severity score (1-10)
3. If severity >= threshold, sees "Professional Care Recommended" banner
4. Banner includes:
   - Why referral is recommended
   - What type of provider they need
   - "Find Providers Near Me" button

#### Provider Search Screen:
1. Shows map with nearby providers
2. List view with:
   - Provider photo
   - Name + credentials
   - Star rating + review count
   - Distance
   - Specialties matching user's condition
   - Next available appointment
   - "Book Now" button

#### Provider Profile Screen:
1. Photos of provider + clinic
2. Full credentials + certifications
3. Services offered with prices
4. Conditions they treat
5. Reviews from other patients
6. "Book Appointment" CTA

### 6. Tracking & Analytics

Track referral funnel:
```sql
-- Referral tracking table (in SKINgenius DB)
CREATE TABLE professional_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  condition TEXT NOT NULL,
  severity INTEGER NOT NULL,
  referral_reason TEXT,
  
  -- GetUpLook data
  getuplook_provider_id TEXT,
  getuplook_service_id TEXT,
  getuplook_appointment_id TEXT,
  
  -- Tracking
  status TEXT DEFAULT 'recommended', -- recommended, viewed, booked, completed, no-show
  clicked_at TIMESTAMP,
  booked_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Outcome
  user_satisfaction INTEGER, -- 1-10
  skin_improvement INTEGER, -- 1-10
  would_recommend BOOLEAN,
  
  created_at TIMESTAMP DEFAULT now()
);
```

### 7. Implementation Priority

**Phase 1 (MVP)**: Manual referral
- Show "Consider seeing a dermatologist" message
- Provide list of local dermatologists (static or from GetUpLook API)
- No booking integration yet

**Phase 2**: API integration
- Call GetUpLook search API
- Show provider cards in SKINgenius
- Deep link to GetUpLook booking

**Phase 3**: Embedded booking
- Book directly in SKINgenius via GetUpLook API
- Track referral outcomes
- Build referral analytics dashboard

### 8. GetUpLook API Spec (Draft)

```javascript
// SKINgenius → GetUpLook integration module
class GetUpLookAPI {
  constructor(apiKey, baseUrl = 'https://backend-rho-two-33.vercel.app') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }
  
  async searchProviders(params) {
    const response = await fetch(`${this.baseUrl}/api/providers/search?${new URLSearchParams(params)}`);
    return response.json();
  }
  
  async getProviderDetails(providerId) {
    const response = await fetch(`${this.baseUrl}/api/providers/${providerId}`);
    return response.json();
  }
  
  async bookAppointment(appointmentData) {
    const response = await fetch(`${this.baseUrl}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.apiKey}` },
      body: JSON.stringify(appointmentData)
    });
    return response.json();
  }
  
  async trackReferral(referralId, event, data) {
    // Track referral events for analytics
    await fetch(`${this.baseUrl}/api/referrals/${referralId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, data, timestamp: new Date().toISOString() })
    });
  }
}
```

### 9. Contact

**GetUpLook Team**: 
- Managed by separate agent/workspace
- Backend: `backend-rho-two-33.vercel.app`
- Supabase: `prowvkbxcdhtoiidxowb.supabase.co`

**SKINgenius Integration Contact**: 
- Use `message` tool to coordinate with GetUpLook team
- Or check `~/.openclaw/workspaces/getuplook/` for current status

---

*Created: 2026-05-14*
*Status: Spec complete, awaiting GetUpLook API access*
