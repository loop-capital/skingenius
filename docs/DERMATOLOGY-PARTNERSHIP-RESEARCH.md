# SKINgenius — Dermatology Partnership Research

> **Date:** 2026-09-15
> **Author:** SKINgenius Research
> **Status:** Complete
> **Purpose:** How to build or partner with a dermatology professional network — platforms with APIs, professional organizations, competitor partnership models, US legal requirements, and revenue-share structures.

---

## Executive Summary

The fastest path to a dermatologist network is **partnership, not employment**. Three partnership tiers exist, and each carries different legal weight:

1. **Referral-only** (0–90 days): Send users to existing teledermatology networks. No medical license needed. Low legal risk. Revenue via per-booking marketing fees.
2. **White-label integration** (3–6 months): Embed a clinician network's API so consults happen under the SKINgenius brand. Requires HIPAA compliance and BAAs. Revenue via consult margin.
3. **Owned network** (6–18 months): Build an MSO plus affiliated physician entities, the model Hims and Curology use. Highest cost, highest control, highest revenue.

**Top recommendations:** Start referral-only with Miiskin, First Derm, and SkyMD. Add an AI triage API from First Derm or Autoderm. Explore AAD Corporate Partnership for credibility and derm access. Do not pay any physician per referral; that is the one structure the law clearly prohibits.

---

## 1. Telemedicine Dermatology Platforms with API Access

### 1.1 Comparison Table

| Platform | Model | API | Prescriptions | Consumer Pricing | Contact |
|---|---|---|---|---|---|
| First Derm (iDoc24) | Async derm reviews + AI | Yes — AI API, 33 conditions, 0.5s | No | From ~$30 per consult | firstderm.com/contact-us |
| Miiskin | Marketplace of independent board-certified derms | Platform partnership for health systems/HMOs | Yes | Per-consult, no subscription | miiskin.com (partnership form) |
| SteadyMD | White-label clinician network, all 50 states | Yes — Complete and Limited API tiers | Yes | Enterprise custom quote | steadymd.com |
| OpenLoop | White-label infrastructure + clinicians + pharmacy + billing | Yes — API solutions for plans | Yes | Enterprise custom quote | openloophealth.com |
| Wheel | Clinician marketplace + virtual care platform | Yes | Yes | Enterprise custom quote | wheel.com |
| MD Integrations | API-first white-label telehealth | Yes | Yes | Custom | mdintegrations.com |
| DirectDerm (3Derm) | Async telederm, CA clinics + national | Platform | Yes | Per-consult | directderm.com |
| SkyMD | Virtual walk-in clinic, insurance accepted | Platform | Yes | Insurance copay or cash | skymd.com |
| DermatologistOnCall (Iagnosis) | 24/7 async, ~3,000 conditions | Platform | Yes | ~$95 per visit | dermatologistoncall.com |
| ScanSkinAI | AI triage + paid derm reviewer network | Yes | Limited | Per-case | scanskinai.com |
| Autoderm | White-label AI dermatology API only | Yes — REST + SDKs | No (AI only) | Subscription + enterprise plan | autoderm.ai/pricing |
| VisualDx | Clinical decision support content + images | Yes — content/image API | n/a | Institutional annual license | visualdx.com/pricing |
| DermTech | Genomic skin testing, no app API | No | n/a | Via insurance | dermtech.com |

### 1.2 Company Profiles

**First Derm (iDoc24 Inc) — strongest true API option for async derm review**

- Berkeley, CA company. 2150 Shattuck Ave, Berkeley, CA 94704.
- Asynchronous store-and-forward dermatologist reviews within 24–48 hours.
- Consumer pricing as low as ~$30 depending on response time selected.
- Does not provide prescriptions — a meaningful gap for users who need Rx.
- Released a dermatology AI API that screens 33 skin diseases in 0.5 seconds. Skin Image Search is the consumer implementation.
- Partnership model: white-label API integration for platforms; B2C consults.
- Contact: firstderm.com/contact-us. CEO and founder: Alexander Börve.
- Fit for SKINgenius: immediate. Their AI API can power triage in our scan flow, and their derm network can handle escalations.

**Miiskin — best marketplace model to emulate or join**

- Danish-founded, US-focused. Network of independent, board-certified dermatologists who have collectively completed 200,000+ consultations.
- Uber-style marketplace: derms keep their own private practices. Miiskin does not employ them. Board-certified dermatologists only — a differentiator they market heavily against competitors using NPs and PAs.
- No medication subscription lock-ins. Patients pay per consult and buy medications separately.
- B2B: works with health systems and HMOs on a HIPAA-compliant teledermatology platform.
- Miiskin PRO gives private practices telederm tooling plus "expert dermatology marketing support" — Twin Cities Dermatology Center is a published adoption example.
- Partnership with The Skin Cancer Foundation (only skin-tracking app with this).
- Named network dermatologists in their published content: Dr. Anne Allen, Dr. Ryan Trowbridge, Dr. Sarita Nori.
- Contact: miiskin.com site forms. Founder/CEO: Friis (featured in Dermatology Times, Sep 2026).
- Fit for SKINgenius: two options. Join as a referral destination, or copy the PRO model later: give derms free tooling and marketing in exchange for network participation.

**SteadyMD — white-label clinician network covering all 50 states**

- Enterprise telehealth infrastructure plus contracted clinician network. Reports powering 200,000+ monthly visits.
- Two API integration models: **Complete API Integration** (visits handled in SteadyMD's Digital Clinic, fully API-driven) and **Limited API Integration** (visits handled inside your own product with minimal engineering).
- Explicitly supports the AI-plus-clinician pattern: their marketing describes AI chatbots drafting recommendations with licensed clinicians reviewing and approving. This is exactly SKINgenius's AI scan flow.
- Services GLP-1, TRT, ED, behavioral health, and more across categories. Optum is a public client (COO testimonial on their technology page).
- Pricing: not public. Enterprise custom.
- Contact: steadymd.com inquiry form.
- Fit for SKINgenius: the fastest route to consults under our own brand without building a clinician network.

**OpenLoop — turnkey white-label telehealth**

- Provides clinicians, tech, pharmacy routing, and billing across all 50 states. Positions itself as a full clinical operations layer.
- NCQA-accredited network: 16,000+ clinicians across 30+ specialties (company materials say 20,000+ and ~3M patients per year in third-party reviews).
- Multi-state licensing and credentialing support included — this directly solves the derm-licensure problem.
- API solutions pitched at health plans; async and sync visits both supported.
- Pricing: not public. Industry commentary on comparable white-label infrastructure puts base fees in the $5,000–$50,000 per month range plus per-order fees. Treat as unverified estimate until quoted.
- Contact: openloophealth.com.
- Fit for SKINgenius: alternative bid against SteadyMD in any white-label RFP.

**Wheel and MD Integrations**

- Wheel: enterprise virtual care platform with a clinician marketplace. Publishes one of the cleavailable guides on corporate-practice-of-medicine compliance for virtual care companies. Useful vendor and useful education source.
- MD Integrations: positioned as API-first white-label telehealth. Include in the RFP set.

**DirectDerm / 3Derm — acquired**

- 3Derm is now part of Digital Diagnostics. DirectDerm offers board-certified derm reviews within 24–48 hours plus California dermatology clinics. 3Derm ImageAssist handles photo-quality capture — a capability SKINgenius already needs for scan photos.
- A Harvard Business School case study on 3Derm outlines their insurance-reimbursement strategy: build health economics evidence, then push payers. Relevant if SKINgenius ever pursues insurance.

**SkyMD and DermatologistOnCall — referral destinations**

- SkyMD: "virtual walk-in clinic," HIPAA-compliant, minutes-to-hours response, accepts insurance. Mix of dermatologists and NPs/PAs.
- DermatologistOnCall (Iagnosis): 24/7/365, ~3,000 conditions, board-certified derms. Consumer price ~$95 per visit per a 2024 first-person review.
- Both are viable referral destinations for Phase 1. DermatologistOnCall is pricier; SkyMD's insurance path suits users with coverage.

**ScanSkinAI — AI-first network with paid derm reviewers**

- Reviewers receive AI-generated case summaries — condition probabilities, ABCDE scoring, risk flags — plus patient photos and history, and return a structured templated report.
- Compensation is per case, paid monthly by bank transfer. This per-case model is the cleanest template for paying SKINgenius's own future reviewers.
- Also publishes a dermatology software cost guide noting B2B dermatology software is commonly priced per provider per month.

**Autoderm — pure AI dermatology API**

- White-label skin-image analysis API. 3M+ API calls served. REST API, SDKs, instant dashboard and API keys on signup.
- Claims: 40% dermatology referral reduction in a Boots UK GP reader study (2024); 93% top-5 suggestion accuracy (Coachella study, 2025); published in Scientific Reports.
- Regulatory posture: CE-marked medical device, GDPR-compliant, MHRA registered, no identifiable patient data stored. These are European clearances. Nothing in their materials indicates FDA clearance for a US deployment. **US use requires regulatory counsel before any diagnostic claims.**
- Enterprise deployment includes a dedicated success manager and custom contract terms.
- Contact: autoderm.ai/pricing.
- Fit for SKINgenius: candidate for the vision-model layer, alongside our own ON-DEVICE-AI-VISION work. Must be labeled decision support in the US, not diagnosis.

**VisualDx — content and image licensing**

- Clinical decision support with a curated dermatology image library. Powers Vaseline's "See My Skin" consumer site through the VisualDx images and API — proof that consumer-brand integrations are an established channel.
- Institutional annual licensing with SSO and EHR integrations. Pricing by quote.
- Contact: visualdx.com/pricing.

**DermTech — status correction, not a platform partner**

- DermTech filed for bankruptcy protection and its assets were sold to DERM-JES Holdings LLC in August 2024. Operations continue under the new owner. Anyone planning around DermTech as a public-company partner should update their notes.
- Product is non-invasive genomic skin testing — tape-strip tests for melanoma risk distributed through providers. No consumer app API. Not an integration candidate.
- Note: L'Oréal invests heavily in dermatology — a Galderma stake and a €20M "Act for Dermatology" WHO initiative announced March 2025 — but it did not acquire DermTech.

**Google Derm Foundation — free-tier option for research**

- Google's Health AI Developer Foundations includes a Derm Foundation serving API that returns embedding vectors for skin images. Useful as a feature-extraction backbone for our own models, not a turnkey triage product.

### 1.3 API Decision Guidance

- Need AI triage now with a US-facing partner: **First Derm AI API**.
- Need AI triage and are willing to manage EU vendor and US regulatory posture: **Autoderm**.
- Need human consults under our brand: **SteadyMD or OpenLoop RFP**.
- Need image quality tooling: study **3Derm ImageAssist** approach; build equivalent into our scan capture.
- Need reference imagery for education: **VisualDx API**.

---

## 2. Dermatology Professional Networks

### 2.1 American Academy of Dermatology (AAD)

The AAD is the primary professional body for US dermatologists and the highest-value partnership target.

**Programs:**

| Program | What it is | Contact path |
|---|---|---|
| Corporate Partners | Paid partnership tiers with recognition and access | aad.org/member/membership/support/corporate-partners/become-partner |
| Partnership Guide | Menu of partnership and giving opportunities | aad.org/member/membership/support/corporate-partners/partnership-guide |
| Annual Meeting sponsorship | Exhibit, advertising, session sponsorship | aad.org/member/meetings-education/am27/exhibit-advertise |
| Sponsorships and licensing | Brand licensing and sponsorship deals | aad.org/advertise/sponsorships-licensing |
| Find a Dermatologist | Public directory of board-certified derms | find-a-derm.aad.org |
| DataDerm | Clinical registry program | aad.org/member/practice/dataderm |
| DermCatalyst | AAD innovation event | aad.org/member/meetings-education/events/dermcatalyst |

**Key facts:**

- Corporate Partner benefits include invitations for three people to the Academy's exclusive Industry Summit with member leaders, plus meetings with AAD leadership at the Annual Meeting or Innovation Academy, and philanthropic partnership discussions.
- The 2026 Annual Meeting corporate sponsorship prospectus (PDF on AAD's asset CDN) details packages including resident travel grant sponsorship, which reaches roughly 1,500 dermatology residents eligible each year. Resident sponsorship is a recruiting and brand channel to the next generation of prescribers.
- **Precedent that matters:** Bonsai Health, an AI practice-automation company, announced a strategic partnership with the AAD in December 2025 (BusinessWire, Dec 22, 2025). An AI startup can land an AAD strategic partnership. SKINgenius should study that deal's shape.
- Pricing: tier pricing is not published. The sponsorship prospectus PDF and a direct inquiry through the Partnership Guide page are the entry points.

**Strategic uses for SKINgenius:**

1. Credibility: AAD-affiliated sponsorship content is the strongest trust signal available in US dermatology.
2. Distribution: Annual Meeting access puts you in a room with thousands of dermatologists.
3. Recruiting: Corporate Partner status plus resident programs is how you seed a future physician advisory board.

### 2.2 Other Professional Organizations

| Organization | Program | Notes | Contact |
|---|---|---|---|
| Skin Cancer Foundation | Corporate Council | 100+ US and international companies committed to the foundation | skincancer.org/about-us/who-we-are/corporate-council |
| ASDS — American Society for Dermatologic Surgery | Industry Partners / Industry Advisory Council | Reaches procedural and cosmetic derms | asds.net/Medical-Professionals/Partner-with-ASDS |
| National Psoriasis Foundation | Corporate Members | Disease-specific reach for psoriasis and eczema content | psoriasis.org/corporate-members |
| Association of Academic Dermatology | Corporate Partners | Relationships between industry, faculty, and residents | theaacd.org/corporate-partners |
| State dermatological societies | Sponsorship and speaking slots | Local referral networks; each state has one | Find per state |
| Women's Dermatologic Society | Sponsorship | Community and mentorship focus | WomensDerm.org |
| Dermatology Foundation | Giving | Research philanthropy | dermatologyfoundation.org |

**Notable precedent:** Miiskin's partnership with The Skin Cancer Foundation is promoted as exclusivity — "the only skin tracking app in partnership with The Skin Cancer Foundation." Foundation partnerships can be exclusive in a category, so SKINgenius should ask about category exclusivity when negotiating with the Skin Cancer Foundation or others.

### 2.3 Non-Organization Networks Worth Knowing

- **AAD's Find a Dermatologist directory** (find-a-derm.aad.org) is the canonical public index of board-certified dermatologists. Any SKINgenius "find a derm near you" feature should consider licensing or referencing arrangements rather than scraping.
- **Zocdoc and similar marketplaces** accept dermatologists and sell booking placements. Second Circuit litigation in 2025 (Sisselman v. Zocdoc, see legal section) confirmed booking-fee models are defensible when they do not pay for clinical referrals.
- **Miiskin's PRO model** is effectively a private derm network built through software and marketing value rather than employment. This is the cheapest network-building playbook in the industry and is covered in section 3.

---

## 3. How Other Apps Partner with Dermatologists

### 3.1 Case Studies

**Curology — subscription + affiliated provider entities**

- Founded 2014. Subscription model: telehealth visit plus custom prescription formulas bundled at roughly $19.95–$39.95 per month historically. Current offer advertises a free first month plus $30 off subsequent boxes, with $5.45 shipping.
- Uses a team of over 100 licensed providers — "Licensed Dermatology Providers," which includes NPs and PAs, not only physicians.
- Compliance architecture per retrospective coverage: providers must be licensed in the patient's state, and the company formed multiple medical entities (PCs and PLLCs) across states to stay compliant. This is the friendly-PC model at scale.
- Later pivoted toward retail distribution — a "telehealth rocketship to retail reinvention" — implying the pure-subscription economics strained without pharmacy and retail margins.

**Apostrophe — the cautionary lifecycle**

- Launched 2012 as YoDerm, a platform matching patients with dermatologists. Rebranded and pivoted to telemedicine in July 2019.
- Hims & Hers acquired Apostrophe in 2021 for a reported $190 million.
- Hims & Hers shut Apostrophe down in March 2025, consolidating into its own asynchronous dermatology line to "simplify" dermatology operations.
- Lesson one: the pure patient-derm matching model was abandoned for vertical integration. Matching alone was not the winning economics.
- Lesson two: acquirers consolidate brands. An exit to a Hims-class acquirer is plausible and lucrative, but only if SKINgenius owns the user relationship, not just referrals.

**Hims & Hers — the MSO at maximum scale**

- SEC filings describe the structure explicitly: Affiliated Medical Groups were "incorporated and established with our assistance for the specific purpose of providing clinical services to patients through the Hims & Hers platform and have no other operations."
- Those affiliated groups contract with or employ physicians, nurse practitioners, physician assistants, and behavioral health providers.
- Hims & Hers, Inc. is effectively the MSO: brand, product, pharmacy fulfillment, EMR, and marketing sit outside the medical entities.
- A medical advisory board of board-certified specialists, including dermatology, shapes clinical frameworks. This is the advisory-board pattern SKINgenius should copy in Phase 1.
- Asynchronous intake: questionnaire plus photos, no video required. Same UX pattern as our scan flow.

**Miiskin — marketplace without employment**

- Independent board-certified derms provide care through the platform. Miiskin connects; it does not hire.
- Derms get free telederm tooling (Miiskin PRO) and marketing support. Their private practices benefit; the network grows without payroll.
- Differentiates on: board-certified-only care, no subscription lock-ins, per-consult pricing.

**ScanSkinAI — AI-first with paid reviewers**

- Dermatologists act as structured reviewers of AI-generated case summaries rather than primary consult physicians. Per-case pay. This is a lighter-weight, quality-control role that many derms will do alongside practice.

**First Derm — anonymous review network**

- Anonymous photo submissions reviewed by dermatologists for a flat fee. No prescriptions. Simpler regulatory posture because no Rx and no continuing-care relationship.

### 3.2 Patterns SKINgenius Should Copy

1. **Advisory board first.** Hims uses one; Curology brands its provider team. Pay 2–3 dermatologists at fair market value hourly rates for content review and clinical protocols. Not per referral.
2. **Advisory board is not enough for prescribing.** Every company that prescribes ended up with affiliated medical entities or a white-label clinician network. Referral-only avoids this entirely.
3. **Board-certified-only is a marketable differentiator.** Miiskin built its brand on it while Hims and Curology use NPs and PAs. SKINgenius's clinical positioning supports the Miiskin side.
4. **Give derms value, not just money.** Miiskin PRO shows free tooling plus marketing support recruits practices without per-referral payments.
5. **Watch the acquisition path.** Apostrophe exited at $190M. The asset that made it valuable was an owned telehealth flow plus Rx fulfillment, not a referral list.

---

## 4. Licensing and Legal Requirements for Dermatology Referrals in the US

> **Not legal advice.** Engage healthcare counsel before signing any physician agreement. The below maps the terrain so the conversation is efficient.

### 4.1 What SKINgenius Can Do Without a Medical License

- Provide skin health education and information.
- Recommend over-the-counter products and non-Rx routines.
- Maintain a directory of licensed dermatologists and link users to them.
- Charge partners marketing or booking fees, with proper disclosure.
- Publish AI-generated analysis framed as informational decision support, with clear disclaimers, not diagnosis or treatment.

**Triggers that change everything:**

- Making specific diagnosis or treatment claims → risk of unauthorized practice of medicine.
- Employing or contracting physicians directly under a non-physician company → corporate practice of medicine violations in most states.
- Selling or handling prescriptions → full CPOM compliance plus pharmacy law.

### 4.2 Corporate Practice of Medicine (CPOM)

- Most states prohibit non-physicians from owning or controlling entities that practice medicine. Telehealth companies must comply in **every state they serve**, which typically means multiple physician-owned PCs linked to a central MSO.
- The standard structure is the **friendly PC + MSO model**: physicians solely own a professional entity and hold clinical control; the MSO provides management, tech, marketing, and billing for a fee.
- The friendly-PC owner must be licensed in every CPOM state where the practice operates. This is why telehealth companies hunt for 50-state-licensed physician owners.
- Strict CPOM states include California, New York, Texas, New Jersey, and Colorado. Florida has no CPOM doctrine but requires a health clinic license when a practice is not wholly physician-owned and bills insurance.
- Permit Health maintains a 50-state CPOM guide that is a good first reference for counsel.

**MSO fee rules.** The management fee must be (1) justified by actual services rendered, (2) consistent with fair market value, and (3) commercially reasonable. Percentage-of-revenue fees draw the most scrutiny; fixed fees tied to documented services are safer.

### 4.3 Federal Anti-Kickback Statute (AKS) and Stark Law

- The AKS, 42 U.S.C. § 1320a-7b, criminalizes remuneration in exchange for referrals of federal healthcare program business. Penalties run up to $50,000 per kickback plus three times the remuneration, plus criminal exposure.
- **Critical 2025 case law.** Two April 14, 2025 appellate decisions narrowed AKS reach:
  - *U.S. v. Sorensen* (7th Cir.): payments to marketers and advertisers for generating leads, without influence over healthcare decisions, are not illegal kickbacks.
  - *U.S. ex rel. Sisselman v. Zocdoc* (2d Cir.): booking/listing fees to a platform are not kickbacks where the platform does not steer clinical decisions.
- The courts distinguish two factors: whether the payee has a special relationship enabling influence over the decision-maker, and whether referrals actually flow nearly exclusively to the paying party.
- *U.S. v. George* (M.D. Fla. 2016) shows the line's edge: per-patient fees paid to marketers for Medicare referrals violated the AKS even though the marketer lacked final authority.
- Stark Law additionally bars physician self-referral of Medicare/Medicaid patients to entities they profit from. It matters mostly if SKINgenius ever bills insurance.
- **Practical effect for SKINgenius:** a cash-pay, no-insurance model keeps AKS and Stark mostly out of scope, but state analogues still apply. Pure marketing fees are defensible. Any fee that varies with referral volume to a clinical provider needs counsel review before signing.

### 4.4 State Fee-Splitting and Referral Laws

- California Business and Professions Code § 650 is the template many states follow: it is unlawful for healing-arts licensees to offer, deliver, receive, or accept any rebate, commission, discount, or other consideration as compensation or inducement for referring patients.
- In California and similar states, physicians cannot share professional fees with unlicensed persons or entities for referrals. Courts have noted some flexibility for payments to management companies for actual services, even ones that occasionally refer patients.
- Most states have fee-splitting prohibitions; several (including New York and New Jersey) have patient-brokering statutes that can carry criminal penalties.
- **Rule of thumb: pay for services and marketing, never for referrals.**

### 4.5 Physician Licensure and Telehealth

- A dermatologist must be licensed in the state where the **patient** is located. Curology's compliance story and the IMLC confirm this is the binding constraint for any consult network.
- The Interstate Medical Licensure Compact (IMLC) provides expedited licensure across 44 states as of 2026. Connecticut joined most recently, effective March 15, 2026. It accelerates but does not replace state licenses.
- Any SKINgenius network must either restrict consults to states where our partner derms hold licenses, or use partners like SteadyMD, OpenLoop, or Wheel who already manage 50-state coverage and credentialing.

### 4.6 FTC Endorsement and Disclosure Rules

- FTC revised its Endorsement Guides (16 CFR Part 255) in June 2023. Any material connection between SKINgenius and a recommended dermatologist — referral fees, sponsorships, equity — must be disclosed clearly and conspicuously.
- "Clearly and conspicuously" means unavoidable by a normal user, not buried in a terms of service.
- Applies to in-app recommendations, provider cards, and any "top dermatologist" styling.

### 4.7 HIPAA

- If any partner receives PHI from SKINgenius — photos, health history, intake answers — a Business Associate Agreement is required.
- Deep-link referrals without data handoff avoid HIPAA entirely. API-integrated consult flows require it. First Derm's anonymous-submission model is a middle path worth studying.

### 4.8 Insurance and Medicare Notes

- Medicare does not reimburse store-and-forward teledermatology except in Alaska and Hawaii demonstration programs; asynchronous work is classified as a communication technology-based service at lower rates.
- Commercial copays for derm visits typically run $50–$75. In-person cash visits run $200–$400. This gap is the entire value proposition of telederm partners: their $30–$95 consults undercut both.

### 4.9 Malpractice and Clinical Risk

- Network dermatologists must carry their own malpractice coverage; platform partners like SteadyMD and OpenLoop typically carry enterprise coverage as part of their fee.
- SKINgenius should carry tech E&O insurance and require contractual indemnification from any partner whose clinicians serve our users.
- Informed consent and standard of care for each consult sit with the treating physician and their entity, not with SKINgenius — keep contracts structured that way.

### 4.10 Legal Posture by Phase

| Phase | Activity | Key requirements |
|---|---|---|
| 1 — Referral | Links to Miiskin, First Derm, SkyMD | FTC disclosure of paid relationships; no PHI handoff; no per-referral physician payments |
| 2 — White label | SteadyMD/OpenLoop consults under our brand | BAA, HIPAA compliance program, indemnification, state coverage map |
| 3 — Owned network | MSO + friendly PCs, own contracts | CPOM structure per state, FMV compensation, AKS-safe payment terms, malpractice framework |

---

## 5. Revenue-Sharing Model Structures with Dermatologists

### 5.1 The Five Viable Structures

**A. Per-consult marketplace split — Miiskin model**

- Patient pays per consult; the platform keeps a share; the derm keeps the rest.
- Consumer price benchmarks: First Derm from ~$30, DermatologistOnCall ~$95, commercial copays $50–$75, in-person $200–$400.
- Derm pay benchmarks: ScanSkinAI pays reviewers per case monthly by bank transfer. Exact rates are negotiated privately industry-wide; treat published consult prices, not rumored splits, as the anchor.
- Legal posture: safest. Derms bill for their own services; the platform charges a marketplace fee. Avoid any fee denominated as "per patient you send us."

**B. Subscription bundle — Curology/Hims model**

- All-inclusive monthly price covering consults plus custom formulation or medication fulfillment.
- Curology history: $19.95–$39.95 per month; current offer: free first month plus $30 off later boxes.
- Requires affiliated medical entities to prescribe. High margin because Rx fulfillment is bundled, but heavy compliance load and consumer backlash risk — Miiskin markets explicitly against subscription lock-in.

**C. MSO management fee — Hims model**

- SKINgenius-parent MSO charges the physician-owned entity for management, tech, marketing, billing.
- Market benchmarks: 10–30% of net collections, or fixed monthly fees. FMV justification required. Percentage fees draw scrutiny; fixed fee tied to documented services is safer.
- Only worth it at Phase 3 volume.

**D. White-label infrastructure purchase — SteadyMD/OpenLoop model**

- We pay the network, they provide clinicians and tech, we keep the brand and margin.
- Costs: enterprise custom. Comparable white-label infrastructure is discussed in the $5,000–$50,000 per month range plus per-order fees; unverified until quoted.
- This is a cost structure, not a revenue share, but it is the Phase 2 economics baseline: our margin equals consult price minus infrastructure per-visit cost.

**E. Marketing/booking fees — Zocdoc model**

- Partners pay SKINgenius for qualified leads or bookings, or SKINgenius receives a per-acquisition fee for users it sends to partners.
- The 2025 Sorensen and Zocdoc decisions support this: payments for advertising services that do not influence clinical decisions are not kickbacks.
- Requirements: FTC disclosure, flat or per-lead pricing set in a marketing services agreement, no clinical steering, no fees that reward referring federal-program patients.

### 5.2 What Is Off the Table

- **Paying dermatologists a bounty per patient they refer to SKINgenius.** Fee-splitting prohibitions like CA B&P §650 plus AKS logic make this the single most dangerous structure in the space.
- **Percentage fees to physicians not tied to actual services.** Classic fee-splitting exposure.
- **Any quiet relationship between rankings and payment.** FTC endorsement and consumer protection exposure.

### 5.3 Recommended Structure for SKINgenius

**Phase 1 — Advisory + referral (immediate):**

- Pay 2–3 dermatologists fixed hourly FMV fees as advisors: protocol review, content sign-off, and quarterly clinical audits. This is legitimate service compensation, fully defensible.
- Sign referral/affiliate agreements with Miiskin, First Derm, and SkyMD on per-booking or per-acquisition marketing terms. Disclose prominently in-app per FTC.
- Target unit economics: $10–$25 per completed booking as marketing fee income, zero fulfillment cost.

**Phase 2 — White-label consults (3–6 months):**

- RFP SteadyMD vs OpenLoop vs Wheel. Price a $59–$79 async derm consult under the SKINgenius brand. Margin = consult price minus the vendor's per-visit cost.
- Sign a BAA; stand up a small HIPAA compliance program.

**Phase 3 — Owned MSO network (6–18 months):**

- Form the MSO. Recruit a 50-state-licensed friendly-PC owner through IMLC channels.
- Contract derms per consult, ScanSkinAI-style: structured review of AI-prepared case summaries, per-case pay, monthly settlement.
- Add subscription products only after consult volume proves retention economics. Remember the Apostrophe lesson: matching alone was weak; owned flow plus fulfillment was the $190M asset.

---

## 6. Recommended 90-Day Action Plan

1. **Week 1–2:** Contact Miiskin, First Derm, and SkyMD partnership forms. Ask each: referral fee terms, consult pricing, API availability, PHI requirements.
2. **Week 2–4:** Issue white-label RFP to SteadyMD, OpenLoop, and Wheel. Ask for per-visit pricing by state, dermatologist coverage map, credentialing timelines, and BAA templates.
3. **Week 4–6:** Recruit 2–3 dermatologist advisors. Fixed hourly FMV. Paper it as a professional services agreement with deliverables, not referrals.
4. **Week 6–10:** Integrate First Derm's AI API or Autoderm behind the scan flow as triage. Label as decision support. Validate against our condition-ingredient mapping.
5. **Week 8–12:** Download the AAD Partnership Guide and the 2026 Annual Meeting sponsorship prospectus. Scope the smallest Corporate Partner tier. Study the Bonsai Health deal as precedent.
6. **Ongoing:** Engage healthcare counsel on the Phase 2 BAA and the Phase 3 MSO structure. Do this before, not after, signing consult vendor agreements.

---

## 7. Source Index

**Platforms**

- First Derm AI API announcement: firstderm.com/press-release-first-artificial-intelligence-dermatology-api/
- First Derm teledermatology background: firstderm.com/teledermatology/
- First Derm contact: firstderm.com/contact-us
- Online Doctor review of First Derm pricing (~$30, no prescriptions): onlinedoctor.com/best-online-dermatologists/
- Miiskin platform explainer and partnership model: miiskin.com/telehealth/miiskin-evolution-online-dermatology-platform/
- Miiskin teledermatology landscape comparison: miiskin.com/telehealth/teledermatology/companies-providers/
- Miiskin Twin Cities PRO adoption: miiskin.com/about/news/twin-cities-dermatology-center-adopts-miiskin-pro/
- Miiskin Foothills pharmacy partnership: miiskin.com/telehealth/a-smoother-patient-experience-with-miiskin-foothills-pharmacy/
- Dermatology Times on Miiskin CEO Friis (Sep 2026): dermatologytimes.com/view/skin-monitoring-app-bridges-care-gap-battles-burnout
- SteadyMD technology and API tiers: steadymd.com/technology/
- SteadyMD white-label overview: steadymd.com/white-label-telehealth-platform/
- SteadyMD scale (200k+ monthly visits): telehealthtech.org/platforms/steadymd
- OpenLoop homepage and health-plans API pages: openloophealth.com, openloophealth.com/companies/health-plans
- White-label platform comparisons: neolife.health/insights/white-label-telehealth-alternatives-compared
- DirectDerm: directderm.com; 3Derm/Digital Diagnostics: 3derm.com; Harvard case: d3.harvard.edu/platform-rctom/submission/3derm-a-dermatology-triage-system/
- SkyMD: skymd.com; DermatologistOnCall review at ~$95: nickgray.net/derm/
- ScanSkinAI reviewer network: scanskinai.com/become-an-online-doctor; dermatology software cost guide: scanskinai.com/dermatology-software-cost
- Autoderm: autoderm.ai and autoderm.ai/pricing
- VisualDx API and Vaseline See My Skin: visualdx.com/solutions/api
- DermTech asset sale to DERM-JES Holdings (Aug 2024): businesswire.com/news/home/20240830135701/en/
- Google Derm Foundation API: developers.google.com/health-ai-developer-foundations/derm-foundation/serving-api

**Networks**

- AAD Corporate Partners: aad.org/member/membership/support/corporate-partners/become-partner
- AAD Partnership Guide: aad.org/member/membership/support/corporate-partners/partnership-guide
- AAD sponsorships and licensing: aad.org/advertise/sponsorships-licensing
- AAD 2026 Annual Meeting sponsorship prospectus PDF: assets.ctfassets.net (am26-corporate-sponsorship-prospectus.pdf)
- Bonsai Health AAD partnership (Dec 2025): businesswire.com/news/home/20251222345844/en/
- Skin Cancer Foundation Corporate Council: skincancer.org/about-us/who-we-are/corporate-council/
- ASDS Industry Partners: asds.net/Medical-Professionals/Partner-with-ASDS/Industry-Advisory-Council-IAC/Industry-Partners
- NPF Corporate Members: psoriasis.org/corporate-members/
- AACD Corporate Partners: theaacd.org/corporate-partners/

**Competitor models**

- Curology how-it-works and current offer: curology.com/how-it-works, curology.com/why-curology
- Curology multi-entity compliance and retail pivot: sourcify.com/blog/curology-from-telehealth-rocketship-to-retail-reinvention/
- Curology pricing review: freemarkethealthcareblog.com/curology-review
- Apostrophe acquisition ($190M, 2021) and YoDerm origin: mobihealthnews.com, glossy.co, beautyindependent.com
- Apostrophe shutdown (Mar 2025): fiercehealthcare.com/telehealth/hims-hers-shutters-apostrophe-favor-its-own-tele-dermatology-offerings
- Hims & Hers Affiliated Medical Groups structure: SEC 10-K, hims-20231231.htm, and 2024 Q4 investor materials

**Legal**

- CPOM and friendly PC-MSO: permithealth.com/post/the-friendly-pc-mso-model-for-corporate-practice-of-medicine-compliance; permithealth.com 50-state guide
- CPOM overview with state rules: guardianmedicaldirection.com/news/overview-and-guide-for-corporate-practice-of-medicine-cpom-laws-pc-mso-models-and-state-rules/
- MSO fee structures and CPOM: stevenslee.com/health-law-observer-blog/management-fee-structures-and-the-corporate-practice-of-medicine/
- MSO fee benchmarks (10–30% of collections): soferadvisors.com/insights/blog/how-to-value-a-healthcare-management-services-organization-mso/
- FMV for telemedicine MSO fees (20% example): buckheadfmv.com/single-post/fair-market-value-for-telemedicine-mso-management-fees
- AKS penalties overview: oig.hhs.gov/compliance/physician-education/fraud-abuse-laws/
- U.S. v. Sorensen (7th Cir., Apr 2025) marketing fees analysis: mcdonaldhopkins.com, sheppardmullin.com, foley.com, venable.com
- Sisselman v. Zocdoc (2d Cir., Apr 2025): via Venable AKS marketing decisions summary
- U.S. v. George per-patient fee AKS violation (2016): gfrlaw.com/what-we-do/insights/patient-payments-marketers
- CA B&P §650 text: codes.findlaw.com/ca/business-and-professions-code/bpc-sect-650/; analyses at egattorneys.com/ca-fee-splitting-laws, djholtlaw.com; Nelson Hardiman on management-company flexibility
- Telehealth licensure compacts: telehealth.hhs.gov/licensure/licensure-compacts; NCSL licensure brief
- IMLC expedited licensure in 44 states (2026): imlcc.com; weatherbyhealthcare.com blog
- FTC Endorsement Guides revision (June 2023): ftc.gov, 16 CFR Part 255
- Medicare store-and-forward derm reimbursement limits: ScienceDirect, S2666328723000500
- Copay benchmarks ($50–$75): miiskin.com/dermatology-virtual-vs-in-person/are-online-dermatology-visits-covered-by-insurance/

---

*Report complete. Next actions live in the 90-day plan in section 6.*