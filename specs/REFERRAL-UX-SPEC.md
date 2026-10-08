# Two-Sided Referral Marketplace UX Flows

**Version:** 1.0  
**Created:** 2026-09-14  
**Status:** Draft  
**Author:** SKINgenius Design Team

---

## CONSUMER SIDE

### 1. Scan Results to "Book with a Pro" CTA

**Screen: Scan Results Dashboard**

```
+-----------------------------------------+
|  <- Back          Scan Complete          |
|                                          |
|  +-------------------------------+      |
|  |  Your Skin Analysis           |      |
|  |                               |      |
|  |  [Severity: MODERATE]         |      |
|  |                               |      |
|  |  3 conditions detected         |      |
|  |  2 red flags                   |      |
|  |                               |      |
|  |  +--------+  +--------+       |      |
|  |  | Acne   |  |Barrier |       |      |
|  |  |Moderate|  |Mild    |       |      |
|  |  +--------+  +--------+       |      |
|  +-------------------------------+      |
|                                          |
|  -------- REFERRAL CTA SECTION --------  |
|                                          |
|  +-------------------------------+      |
|  |  Professional Care            |      |
|  |  Recommended                   |      |
|  |                               |      |
|  |  Based on your moderate acne  |      |
|  |  and barrier dysfunction, a   |      |
|  |  licensed provider can create |      |
|  |  a personalized treatment.    |      |
|  |                               |      |
|  |  [     Book with a Pro     ]  |      |
|  +-------------------------------+      |
|                                          |
|  [View Product Recommendations]          |
|  [Learn About Root Causes]               |
+-----------------------------------------+
```

**CTA Trigger Rules:**

| Scenario | CTA Placement | Timing | Visual Priority |
|----------|--------------|--------|-----------------|
| Severity = Urgent | Sticky top banner | Immediate load | Pulsing red |
| Severity = Severe | Inline after severity | 2s delay | Accent green |
| Severity = Moderate | Below condition cards | Immediate | Accent green |
| Severity = Mild | Bottom of results | User scroll | Secondary button |
| Red flag present | Inline next to flag | Immediate | Error red border |
| 2+ scans same condition | Top of results | Immediate | "Condition has persisted" |

**Flow:**
```
Scan Complete -> Severity Check -> CTA Render -> Provider Search
```

---

### 2. Provider Search and Filter

**Screen: Provider Search**

```
+-----------------------------------------+
|  <- Back    Find a Provider              |
|                                          |
|  [Search by name or service...    ] [Q]  |
|                                          |
|  Filter: [Condition v] [Distance v]      |
|          [Rating v]    [Price v]         |
|                                          |
|  +-------------------------------+      |
|  |  PLEIJ Salon + Spa            |      |
|  |  4.8 stars (124 reviews)       |      |
|  |  2.3 miles away               |      |
|  |  Hair, Skin, Makeup           |      |
|  |  From $85                     |      |
|  |  [View Profile]                |      |
|  +-------------------------------+      |
|                                          |
|  +-------------------------------+      |
|  |  Skin Wellness Center         |      |
|  |  4.9 stars (89 reviews)        |      |
|  |  4.1 miles away               |      |
|  |  Skin, Facial                 |      |
|  |  From $120                    |      |
|  |  [View Profile]                |      |
|  +-------------------------------+      |
+-----------------------------------------+
```

**Filter Options:**
- Condition: Maps to provider specialties (acne -> facial, chemical peel)
- Distance: 1, 3, 5, 10, 25 miles
- Rating: 4.0+, 4.5+, 4.8+
- Price: Under $75, $75-150, $150-300, $300+
- Availability: This week, Next week, Specific date

**Sort Options:** Best match (default), Distance, Rating, Price low to high

---

### 3. Provider Profile View

**Screen: Provider Profile**

```
+-----------------------------------------+
|  <- Back    PLEIJ Salon + Spa          |
|                                          |
|  [Cover photo / interior]               |
|                                          |
|  [Profile photo]  4.8 stars (124)        |
|                   2.3 miles away         |
|                                          |
|  About                                   |
|  Full-service salon specializing in...   |
|                                          |
|  Credentials                             |
|  Licensed Esthetician                     |
|  15 years experience                      |
|                                          |
|  Services (3)                            |
|  +-------------------------------+      |
|  | HydraFacial          $150     |      |
|  | 60 min | Good for acne, texture|      |
|  | [Book This Service]            |      |
|  +-------------------------------+      |
|  | Chemical Peel         $120     |      |
|  | 45 min | Good for acne, tone  |      |
|  | [Book This Service]            |      |
|  +-------------------------------+      |
|                                          |
|  Reviews (124)                          |
|  +-------------------------------+      |
|  | 5 stars - Sarah M.            |      |
|  | "Amazing results after 2..."     |      |
|  +-------------------------------+      |
+-----------------------------------------+
```

---

### 4. Booking Flow

**Screen: Select Date and Time**

```
+-----------------------------------------+
|  <- Back    Book HydraFacial             |
|  PLEIJ Salon + Spa | $150 | 60 min       |
|                                          |
|  When would you like to come in?         |
|                                          |
|  [Today] [Tomorrow] [Wed 9/16] ...       |
|                                          |
|  Morning                                 |
|  [9:00 AM] [10:00 AM] [11:00 AM]       |
|                                          |
|  Afternoon                               |
|  [1:00 PM] [2:00 PM] [3:00 PM] [4:00]   |
|                                          |
|  Evening                                 |
|  [5:00 PM] [6:00 PM]                    |
+-----------------------------------------+
```

**Screen: Confirm Booking**

```
+-----------------------------------------+
|  <- Back    Confirm Appointment          |
|                                          |
|  Service: HydraFacial                    |
|  Provider: PLEIJ Salon + Spa             |
|  Date: Wednesday, Sept 16                |
|  Time: 2:00 PM                           |
|  Duration: 60 minutes                    |
|  Location: 123 Main St, Columbus OH        |
|                                          |
|  Payment                                 |
|  Deposit required: $30 (20%)             |
|  Total: $150                             |
|  Balance due at appointment: $120        |
|                                          |
|  [     Pay $30 Deposit to Book     ]    |
|                                          |
|  Cancelation policy: Full refund if...   |
+-----------------------------------------+
```

**Flow:**
```
Provider Profile -> Select Service -> Pick Date -> Pick Time -> Confirm -> Pay Deposit -> Confirmed
```

---

### 5. Post-Appointment

**Screen: Appointment Complete**

```
+-----------------------------------------+
|  Your Appointment is Complete!            |
|                                          |
|  How was your experience?                |
|                                          |
|  [Star rating 1-5]                      |
|                                          |
|  [Tell us about your visit...          ]|
|                                          |
|  [Submit Review]                        |
|                                          |
|  Would you like to:                      |
|  [Book Follow-up]  [Share Results]      |
+-----------------------------------------+
```

---

## PROVIDER SIDE

### 1. Dashboard

**Screen: Provider Dashboard**

```
+-----------------------------------------+
|  [Logo] Dashboard  [Calendar] [Profile]   |
|                                          |
|  Today's Overview                        |
|  +--------+  +--------+  +--------+     |
|  |   2    |  |   0    |  |  $340   |     |
|  | Upcoming|  |Pending |  |Revenue |     |
|  +--------+  +--------+  +--------+     |
|                                          |
|  Upcoming Appointments                   |
|  +-------------------------------+      |
|  | 2:00 PM | HydraFacial | Jane D |     |
|  | Confirmed | $150      |        |     |
|  +-------------------------------+      |
|                                          |
|  Incoming Referrals (1 new)              |
|  +-------------------------------+      |
|  | From SKINgenius: Acne/Barrier |      |
|  | Scan confidence: 87%            |      |
|  | [View Details]  [Accept] [Decline]|    |
|  +-------------------------------+      |
+-----------------------------------------+
```

---

### 2. Referral Detail View

**Screen: Referral Details**

```
+-----------------------------------------+
|  <- Back    Incoming Referral            |
|                                          |
|  From: SKINgenius User                   |
|  Date: Sept 14, 2026                     |
|                                          |
|  Scan Summary                            |
|  Conditions: Acne (87%), Barrier (72%)   |
|  Severity: Moderate                      |
|  Red flags: 1 (dehydration)              |
|                                          |
|  Recommended Services                     |
|  HydraFacial, Chemical Peel              |
|                                          |
|  [   Accept Referral   ]                |
|  [   Decline   ]                        |
|                                          |
|  Decline reason:                         |
|  [Not accepting new clients]             |
|  [Condition outside specialty]           |
|  [Schedule conflict]                      |
|  [Other]                                 |
+-----------------------------------------+
```

---

### 3. Calendar and Availability

**Screen: Manage Availability**

```
+-----------------------------------------+
|  Availability | Set Hours | Block Dates   |
|                                          |
|  Monday                                   |
|  [9:00 AM] to [6:00 PM]  [+ Add block]   |
|                                          |
|  Tuesday                                  |
|  [9:00 AM] to [6:00 PM]                  |
|                                          |
|  Wednesday                                |
|  [10:00 AM] to [4:00 PM]  (modified)     |
|                                          |
|  [Save Changes]                          |
+-----------------------------------------+
```

---

### 4. Client Management

**Screen: Client List**

```
+-----------------------------------------+
|  Clients                                  |
|                                          |
|  [Search...]  [Filter: All v]            |
|                                          |
|  Jane D.                                  |
|  Last visit: Sept 14, 2026               |
|  Total visits: 3                         |
|  Conditions: Acne, Barrier               |
|  [View History]                          |
|                                          |
|  +-------------------------------+      |
|  | Visit History                  |      |
|  | Sept 14 - HydraFacial - $150   |      |
|  | Aug 28 - Consultation - $0     |      |
|  | Aug 10 - Chemical Peel - $120  |      |
|  +-------------------------------+      |
|                                          |
|  [Add Notes]  [Upload Photos]            |
+-----------------------------------------+
```

---

## KEY USER FLOWS

### Consumer Happy Path
```
Complete Scan -> View Results -> "Book with a Pro" -> 
Search Providers -> Filter by Condition -> View Profile -> 
Select Service -> Pick Date/Time -> Pay Deposit -> 
Receive Confirmation -> Attend Appointment -> Leave Review
```

### Provider Happy Path
```
Receive Referral Notification -> View Scan Summary -> 
Accept Referral -> See in Calendar -> User Books -> 
Receive Booking Confirmation -> Day of Appointment -> 
Mark Complete -> Receive Payout
```

### Cancellation Flow
```
User: My Appointments -> Select Appointment -> 
Cancel -> Confirm reason -> Receive refund status

Provider: Calendar -> Blocked time freed -> 
Optional: Offer reschedule slot
```

---

## DESIGN TOKENS

Uses existing SKINgenius DESIGN.md tokens:
- Primary CTA: Accent green (#2CD674), 16px rounded
- Urgent: Error red (#E63946), pulsing animation
- Severity badges: Amber (#F4A261) for Moderate
- Cards: White surface, 12px rounded, subtle shadow
- Typography: Inter, clinical hierarchy

## ACCESSIBILITY

- All CTAs have min 44x44 tap target
- Color not sole indicator (icons + text)
- Screen reader labels for severity badges
- Reduced motion support for pulsing animations

---

*Document version: 1.0 | Created: 2026-09-14*
