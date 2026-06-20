-- Seed: Procedure Cards (002_procedure_cards.sql)
-- 25+ educational procedure cards for the SKINgenius library
-- Idempotent: ON CONFLICT (slug) DO NOTHING

INSERT INTO procedure_cards (
  id,
  slug,
  name,
  category,
  summary,
  mechanism_of_action,
  prep_guidance,
  recovery_timeline,
  downtime_days,
  pain_level,
  cost_range,
  results_duration,
  complications,
  red_flag_symptoms,
  faqs,
  contraindications,
  ideal_candidates,
  alternatives,
  is_published
) VALUES

-- ========================
-- INJECTABLES (8)
-- ========================

(
  gen_random_uuid(),
  'botox-forehead',
  'Botox — Forehead Lines',
  'Injectables',
  'A quick injectable treatment that smooths horizontal forehead lines by relaxing the underlying muscle.',
  'Botulinum toxin type A blocks nerve signals to the frontalis muscle, preventing it from contracting and creating lines. The muscle gradually relaxes, allowing the skin to smooth over 3–7 days.',
  'Avoid blood thinners (aspirin, ibuprofen, fish oil) for 1 week before to reduce bruising. No alcohol 24 hours prior. Arrive with clean skin, no makeup.',
  'Day 1–2: Tiny bumps at injection sites, mild tenderness. Day 3–5: Gradual smoothing begins. Day 7–14: Full effect visible. Results peak around 2 weeks.',
  0,
  'Minimal',
  '$200–$500 per session',
  '3–4 months',
  '[
    {"name": "Bruising", "likelihood": "Common", "severity": "Mild", "when_to_seek_help": "If bruising spreads or persists beyond 2 weeks"},
    {"name": "Headache", "likelihood": "Common", "severity": "Mild", "when_to_seek_help": "If severe or lasting more than 48 hours"},
    {"name": "Drooping eyelid (ptosis)", "likelihood": "Rare", "severity": "Moderate", "when_to_seek_help": "Immediately — typically resolves in 2–6 weeks; prescription drops may help"},
    {"name": "Asymmetry", "likelihood": "Uncommon", "severity": "Mild", "when_to_seek_help": "At 2-week follow-up if still noticeable"}
  ]'::jsonb,
  ARRAY['Drooping eyelid or eyebrow', 'Double vision', 'Severe headache', 'Difficulty swallowing or breathing'],
  '[
    {"question": "Will I look frozen?", "answer": "Not if injected correctly. The goal is softening, not paralysis. You can still express emotions — just without the deep lines."},
    {"question": "Does it hurt?", "answer": "Most patients describe a quick pinch. Ice or numbing cream can be used. The procedure takes about 5 minutes."},
    {"question": "When should I schedule a touch-up?", "answer": "Every 3–4 months, or when movement returns and lines start to reappear."}
  ]'::jsonb,
  ARRAY['Pregnancy or breastfeeding', 'Neuromuscular disorders (e.g., myasthenia gravis)', 'Active skin infection at injection sites', 'Allergy to botulinum toxin or albumin'],
  'Adults with moderate to severe forehead lines who want a smoother appearance without surgery. Best for dynamic lines that appear with expression.',
  ARRAY['Dysport', 'Xeomin', 'Daxxify', 'Topical retinoids'],
  true
),

(
  gen_random_uuid(),
  'botox-crows-feet',
  'Botox — Crow''s Feet',
  'Injectables',
  'Smooths fine lines around the outer corners of the eyes caused by smiling and squinting.',
  'Botulinum toxin relaxes the orbicularis oculi — the circular muscle around the eye that contracts when you smile or squint. Less contraction = fewer wrinkles.',
  'Avoid rubbing eyes for 24 hours post-treatment. Remove contact lenses before the appointment. Avoid blood thinners 1 week prior.',
  'Day 1: Mild redness at injection sites. Day 3–5: Lines soften. Day 7–14: Maximum smoothing around the eyes.',
  0,
  'Minimal',
  '$200–$400 per session',
  '3–4 months',
  '[
    {"name": "Bruising", "likelihood": "Common", "severity": "Mild", "when_to_seek_help": "If bruising worsens after 3 days"},
    {"name": "Dry eyes", "likelihood": "Uncommon", "severity": "Mild", "when_to_seek_help": "If persistent beyond 1 week"},
    {"name": "Weakened blink", "likelihood": "Rare", "severity": "Moderate", "when_to_seek_help": "If eyes feel dry or gritty — use lubricating drops and contact provider"}
  ]'::jsonb,
  ARRAY['Drooping lower eyelid exposing the white of the eye', 'Severe dry eye or excessive tearing', 'Vision changes'],
  '[
    {"question": "Will it affect my smile?", "answer": "When placed correctly, it softens crow''s feet without changing your natural smile shape."},
    {"question": "Can I wear makeup after?", "answer": "Wait 4 hours before applying makeup to avoid pushing the product out of place."},
    {"question": "Can I still squint in the sun?", "answer": "Yes, but the intensity of the squint — and thus the wrinkling — is reduced. Wear sunglasses for protection."}
  ]'::jsonb,
  ARRAY['Pregnancy or breastfeeding', 'Neuromuscular disorders', 'Active eye infection or inflammation', 'Blepharoptosis (drooping eyelid)'],
  'Adults who notice lines radiating from the outer eye corners when smiling or squinting. Works well alongside cheek volume treatments.',
  ARRAY['Dysport', 'Laser resurfacing', 'Microneedling with PRP', 'Retinoid eye creams'],
  true
),

(
  gen_random_uuid(),
  'botox-masseter',
  'Botox — Masseter (Jaw Slimming)',
  'Injectables',
  'Relaxes the jaw-masseter muscle to slim the lower face, reduce teeth grinding, and soften a square jawline.',
  'Botulinum toxin weakens the masseter — the large chewing muscle at the back of the jaw. Over 4–6 weeks, the muscle shrinks (atrophies), narrowing the jawline and reducing grinding force.',
  'Avoid hard chewing (gum, tough meats) for 1 week after. Do not massage the jaw area for 48 hours. Follow standard pre-injection precautions (no blood thinners).',
  'Week 1–2: Grinding may decrease; chewing feels slightly weaker. Week 4–6: Visible slimming of the jawline. Week 8+: Full effect; muscle atrophy peaks.',
  0,
  'Mild',
  '$400–$800 per session',
  '4–6 months',
  '[
    {"name": "Bruising", "likelihood": "Common", "severity": "Mild", "when_to_seek_help": "If bruising lasts > 2 weeks"},
    {"name": "Difficulty chewing tough foods", "likelihood": "Uncommon", "severity": "Mild", "when_to_seek_help": "If persistent or bothersome — dose adjustment may be needed"},
    {"name": "Asymmetry", "likelihood": "Uncommon", "severity": "Mild", "when_to_seek_help": "At 6-week follow-up if still present"},
    {"name": "Smile asymmetry (rare spread)", "likelihood": "Rare", "severity": "Moderate", "when_to_seek_help": "Immediately — may require time or targeted correction"}
  ]'::jsonb,
  ARRAY['Inability to chew or open mouth fully', 'Severe jaw pain or clicking', 'Asymmetry affecting smile', 'Difficulty swallowing'],
  '[
    {"question": "How many units will I need?", "answer": "Typically 20–40 units per side, depending on muscle size. Larger or stronger masseters require more."},
    {"question": "Will it affect my smile?", "answer": "Rarely, if placed correctly. Smile changes usually resolve as the toxin settles over 2–4 weeks."},
    {"question": "Can it help with TMJ pain?", "answer": "Yes — by reducing muscle tension, many patients experience significant TMJ relief and fewer headaches."}
  ]'::jsonb,
  ARRAY['Pregnancy or breastfeeding', 'Neuromuscular disorders', 'Active dental infection', 'Severe TMJ dysfunction requiring surgical evaluation'],
  'Adults with a square or wide jawline due to enlarged masseter muscles, or those with teeth grinding (bruxism) and TMJ discomfort.',
  ARRAY['Dysport', 'Jawline contouring filler', 'Buccal fat removal (surgical)', 'Night guards for grinding'],
  true
),

(
  gen_random_uuid(),
  'dysport',
  'Dysport',
  'Injectables',
  'A botulinum toxin injectable similar to Botox, known for faster onset and natural diffusion — ideal for larger areas like the forehead.',
  'Dysport (abobotulinumtoxinA) works like Botox by blocking nerve signals to muscles, but it spreads slightly more and often takes effect 1–2 days sooner.',
  'Same as Botox: avoid blood thinners 1 week prior, no alcohol 24 hours before, arrive with clean skin.',
  'Day 1–2: Slight swelling at injection sites. Day 2–4: Onset of smoothing. Day 7–10: Full effect.',
  0,
  'Minimal',
  '$200–$500 per session',
  '3–4 months',
  '[
    {"name": "Bruising", "likelihood": "Common", "severity": "Mild", "when_to_seek_help": "If bruising spreads or persists > 2 weeks"},
    {"name": "Headache", "likelihood": "Common", "severity": "Mild", "when_to_seek_help": "If severe or > 48 hours"},
    {"name": "Eyelid drooping", "likelihood": "Rare", "severity": "Moderate", "when_to_seek_help": "Immediately — typically self-resolves in 2–6 weeks"},
    {"name": "Unwanted spread to nearby muscles", "likelihood": "Uncommon", "severity": "Mild", "when_to_seek_help": "If causing asymmetry at 2-week follow-up"}
  ]'::jsonb,
  ARRAY['Eyelid or eyebrow drooping', 'Asymmetry affecting vision', 'Severe headache', 'Difficulty swallowing or speaking'],
  '[
    {"question": "How is Dysport different from Botox?", "answer": "Dysport spreads a bit more, making it great for larger foreheads. It also tends to kick in 1–2 days faster. The dosing is different (more units needed)."},
    {"question": "Can I switch between Botox and Dysport?", "answer": "Yes — many patients alternate. Tell your provider your previous product and results so they adjust dosing."},
    {"question": "Does it last as long as Botox?", "answer": "Comparable — about 3–4 months for most patients."}
  ]'::jsonb,
  ARRAY['Pregnancy or breastfeeding', 'Neuromuscular disorders', 'Active infection at injection sites', 'Allergy to cow''s milk protein (Dysport contains lactose)'],
  'Adults seeking forehead smoothing who want faster results, or those with larger treatment areas where slight diffusion is beneficial.',
  ARRAY['Botox', 'Xeomin', 'Daxxify', 'Topical retinoids'],
  true
),

(
  gen_random_uuid(),
  'juvederm-voluma',
  'Juvederm Voluma (Cheeks)',
  'Injectables',
  'A hyaluronic acid filler designed to restore mid-face volume, lift the cheeks, and enhance facial contours.',
  'Voluma is a thick, cross-linked hyaluronic acid gel injected deep along the cheekbone. It adds volume and provides a subtle lift by restoring structural support to the mid-face.',
  'Avoid blood thinners 1 week prior. No alcohol 24 hours before. Discuss dental work — wait 2 weeks after dental procedures before cheek filler.',
  'Day 1–3: Swelling and possible bruising; cheeks may feel firm. Day 5–7: Swelling subsides; shape settles. Week 2–4: Final result visible.',
  0,
  'Mild',
  '$800–$1,500 per syringe (typically 1–2 syringes)',
  '18–24 months',
  '[
    {"name": "Bruising", "likelihood": "Common", "severity": "Mild", "when_to_seek_help": "If extensive or > 2 weeks"},
    {"name": "Swelling", "likelihood": "Very common", "severity": "Mild", "when_to_seek_help": "If severe, painful, or worsening after day 3"},
    {"name": "Lumps or bumps", "likelihood": "Uncommon", "severity": "Mild", "when_to_seek_help": "At 2-week follow-up — often massaged out by provider"},
    {"name": "Vascular occlusion (rare)", "likelihood": "Rare", "severity": "Severe", "when_to_seek_help": "IMMEDIATELY — skin blanching, severe pain, or skin color changes require urgent reversal with hyaluronidase"}
  ]'::jsonb,
  ARRAY['Skin turning white, blue, or dusky over the treated area', 'Severe or increasing pain', 'Vision changes', 'Blisters or skin breakdown'],
  '[
    {"question": "How many syringes will I need?", "answer": "Most patients need 1–2 syringes for a noticeable but natural result. Severe volume loss may require more, staged over sessions."},
    {"question": "Can it be reversed?", "answer": "Yes — hyaluronic acid fillers can be dissolved with hyaluronidase if needed. This is a safety advantage."},
    {"question": "Will I feel the filler under my skin?", "answer": "Initially, yes — it may feel firm for 1–2 weeks as it integrates. After that, it typically feels natural."}
  ]'::jsonb,
  ARRAY['Pregnancy or breastfeeding', 'Active skin infection', 'Allergy to lidocaine or hyaluronic acid fillers', 'History of severe allergic reactions (anaphylaxis)'],
  'Adults with flattened or sagging cheeks, hollow temples, or those seeking a more defined cheekbone contour. Ideal for age-related volume loss.',
  ARRAY['Restylane Lyft', 'Sculptra', 'Radiesse', 'Fat transfer (surgical)'],
  true
),

(
  gen_random_uuid(),
  'juvederm-volbella',
  'Juvederm Volbella (Lips)',
  'Injectables',
  'A soft, smooth hyaluronic acid filler for subtle lip enhancement, vertical lip lines, and hydration.',
  'Volbella uses Vycross technology — a blend of different molecular weights of hyaluronic acid — for a smooth, cohesive gel that integrates naturally into lip tissue without adding excessive bulk.',
  'Avoid blood thinners 1 week prior. No alcohol 24 hours before. Avoid lip products the day of treatment. Consider antiviral medication if you have a history of cold sores.',
  'Day 1–3: Significant swelling; lips may look larger than final result. Day 3–5: Swelling decreases. Day 7–10: Final shape and size visible.',
  1,
  'Mild',
  '$600–$1,000 per syringe',
  '12 months',
  '[
    {"name": "Swelling", "likelihood": "Very common", "severity": "Mild", "when_to_seek_help": "If severe, asymmetric, or worsening after day 3"},
    {"name": "Bruising", "likelihood": "Common", "severity": "Mild", "when_to_seek_help": "If > 2 weeks or extensive"},
    {"name": "Lumps or irregular texture", "likelihood": "Uncommon", "severity": "Mild", "when_to_seek_help": "At 2-week follow-up for massage or adjustment"},
    {"name": "Cold sore outbreak", "likelihood": "Uncommon", "severity": "Mild", "when_to_seek_help": "If not controlled with antiviral medication"}
  ]'::jsonb,
  ARRAY['Severe asymmetric swelling', 'Signs of infection (fever, spreading redness)', 'Skin discoloration', 'Difficulty breathing or swallowing'],
  '[
    {"question": "Will my lips look natural?", "answer": "Yes — Volbella is designed for subtlety. It enhances shape and hydration rather than dramatic volume."},
    {"question": "How long will swelling last?", "answer": "Peak swelling is day 1–2. Most swelling resolves by day 5–7. The final result is visible around day 10."},
    {"question": "Can I kiss after?", "answer": "Avoid pressing or massaging lips for 48 hours to let the filler settle. Gentle kissing is fine after that."}
  ]'::jsonb,
  ARRAY['Pregnancy or breastfeeding', 'Active cold sore outbreak', 'Active lip infection', 'Allergy to lidocaine or hyaluronic acid'],
  'Adults seeking subtle lip enhancement, improved lip shape, or smoothing of vertical lip lines (smoker''s lines) without dramatic volume.',
  ARRAY['Restylane Kysse', 'Belotero Balance', 'Lip flip (Botox)', 'Lip lift (surgical)'],
  true
),

(
  gen_random_uuid(),
  'restylane',
  'Restylane',
  'Injectables',
  'A versatile family of hyaluronic acid fillers for facial wrinkles, folds, and volume restoration.',
  'Restylane uses NASHA (Non-Animal Stabilized Hyaluronic Acid) technology — firm, discrete gel particles that provide structure and lift. Different formulations target lips, cheeks, nasolabial folds, and under-eyes.',
  'Avoid blood thinners 1 week prior. No alcohol 24 hours before. For under-eye treatment, ensure you are well-hydrated and well-rested to reduce puffiness baseline.',
  'Day 1–3: Swelling and possible bruising. Day 5–7: Swelling subsides. Week 2: Final result visible. Under-eye treatment may have longer swelling (7–10 days).',
  0,
  'Mild',
  '$500–$900 per syringe',
  '9–12 months',
  '[
    {"name": "Bruising", "likelihood": "Common", "severity": "Mild", "when_to_seek_help": "If > 2 weeks"},
    {"name": "Swelling", "likelihood": "Very common", "severity": "Mild", "when_to_seek_help": "If severe or worsening after day 5"},
    {"name": "Tyndall effect (blue tint under eyes)", "likelihood": "Uncommon", "severity": "Mild", "when_to_seek_help": "At 2-week follow-up — may indicate superficial placement or need for dissolving"},
    {"name": "Vascular occlusion", "likelihood": "Rare", "severity": "Severe", "when_to_seek_help": "IMMEDIATELY — blanching, pain, or color changes"}
  ]'::jsonb,
  ARRAY['Skin blanching or blue/gray discoloration', 'Severe or increasing pain', 'Vision changes', 'Signs of infection (fever, spreading redness)'],
  '[
    {"question": "Which Restylane product is right for me?", "answer": "Restylane Lyft for cheeks, Defyne for deep folds, Refyne for fine lines, Kysse for lips, and Eyelight or Silk for under-eyes."},
    {"question": "Can Restylane be used under the eyes?", "answer": "Yes, but it requires an experienced injector. Under-eye filler is advanced — choose a provider with specific expertise in this area."},
    {"question": "Does it feel natural?", "answer": "Yes — hyaluronic acid integrates with your tissue. It feels soft and natural once settled."}
  ]'::jsonb,
  ARRAY['Pregnancy or breastfeeding', 'Active skin infection', 'Allergy to lidocaine or hyaluronic acid', 'Bleeding disorders'],
  'Adults with nasolabial folds, marionette lines, thin lips, hollow cheeks, or under-eye hollows seeking non-surgical rejuvenation.',
  ARRAY['Juvederm family', 'Belotero', 'Radiesse', 'Sculptra'],
  true
),

(
  gen_random_uuid(),
  'sculptra',
  'Sculptra (Collagen Stimulator)',
  'Injectables',
  'A biostimulatory injectable that gradually rebuilds collagen for natural, long-lasting facial volume.',
  'Sculptra (poly-L-lactic acid, PLLA) is injected deep into the skin where it stimulates fibroblasts to produce new collagen. Results build gradually over 2–3 months as your own collagen replaces the lost volume.',
  'Avoid blood thinners 1 week prior. Plan for 3–4 sessions spaced 4–6 weeks apart. Massage the treated areas for 5 minutes, 5 times daily, for 5 days (the 5-5-5 rule) to ensure even distribution.',
  'Month 1: Subtle volume increase; collagen production begins. Month 2–3: Visible improvements in skin thickness and volume. Month 4–6: Peak results after final session.',
  0,
  'Mild',
  '$800–$1,500 per vial (typically 2–4 vials total)',
  '2+ years',
  '[
    {"name": "Lumps or nodules", "likelihood": "Uncommon", "severity": "Moderate", "when_to_seek_help": "If palpable lumps persist after 2 weeks — massage vigorously; provider may need to intervene"},
    {"name": "Bruising", "likelihood": "Common", "severity": "Mild", "when_to_seek_help": "If > 2 weeks"},
    {"name": "Swelling", "likelihood": "Very common", "severity": "Mild", "when_to_seek_help": "If severe or > 1 week"},
    {"name": "Granuloma formation", "likelihood": "Rare", "severity": "Significant", "when_to_seek_help": "If persistent lumps that do not respond to massage — may require steroid injection or excision"}
  ]'::jsonb,
  ARRAY['Visible or painful lumps that do not resolve with massage', 'Signs of infection (fever, redness, warmth)', 'Asymmetry that worsens over time', 'Skin breakdown or ulceration'],
  '[
    {"question": "How is this different from regular filler?", "answer": "Traditional fillers add volume immediately. Sculptra stimulates your body to make its own collagen, so results appear gradually and last longer."},
    {"question": "Do I really need to massage?", "answer": "Yes — the 5-5-5 rule (5 minutes, 5 times a day, for 5 days) is critical to prevent nodule formation."},
    {"question": "Will I look different right after?", "answer": "Initially, yes — due to swelling and water in the injection. This goes away in a few days. True results build over 2–3 months."}
  ]'::jsonb,
  ARRAY['Pregnancy or breastfeeding', 'Active skin infection', 'History of keloid or hypertrophic scarring', 'Autoimmune connective tissue disease'],
  'Adults with significant facial volume loss, hollowing temples or cheeks, or those seeking gradual, natural-looking rejuvenation without immediate "filled" appearance.',
  ARRAY['Radiesse', 'Juvederm Voluma', 'Fat transfer', 'Thread lift'],
  true
),

-- ========================
-- LASER (5)
-- ========================

(
  gen_random_uuid(),
  'fraxel',
  'Fraxel (Fractional Laser)',
  'Laser',
  'A non-ablative fractional laser that resurfaces the skin by creating microscopic treatment zones to stimulate collagen.',
  'Fraxel delivers laser energy in a grid pattern — thousands of tiny columns of thermal injury surrounded by untreated skin. This triggers wound healing, collagen remodeling, and fresh skin cell turnover.',
  'Avoid sun exposure and tanning for 2 weeks prior. Stop retinoids 1 week before. Arrive with clean skin, no makeup. A topical numbing cream is applied 30–60 minutes before.',
  'Day 1–2: Skin feels hot and tight; redness like a sunburn. Day 2–3: Swelling peaks; skin may bronze or darken. Day 3–5: Sandpaper-like texture as microscopic zones heal. Day 5–7: Peeling and flaking. Week 2: Fresh, pink skin emerges.',
  3,
  'Moderate',
  '$800–$1,500 per session',
  '1–2 years (with maintenance)',
  '[
    {"name": "Prolonged redness", "likelihood": "Common", "severity": "Mild", "when_to_seek_help": "If redness persists > 2 weeks or becomes painful"},
    {"name": "Hyperpigmentation", "likelihood": "Uncommon", "severity": "Moderate", "when_to_seek_help": "At 4-week follow-up — treatable with lightening agents"},
    {"name": "Infection", "likelihood": "Rare", "severity": "Moderate", "when_to_seek_help": "If increasing pain, warmth, pus, or fever"},
    {"name": "Scarring", "likelihood": "Rare", "severity": "Significant", "when_to_seek_help": "If skin texture changes or indentations appear during healing"}
  ]'::jsonb,
  ARRAY['Severe or increasing pain', 'Signs of infection (fever, pus, spreading redness)', 'Blisters or skin breakdown', 'Unusual color changes (white or dark patches)'],
  '[
    {"question": "How many sessions do I need?", "answer": "Typically 3–5 sessions spaced 4–6 weeks apart for best results on scars, texture, or pigmentation."},
    {"question": "Can I wear makeup after?", "answer": "Wait until day 3–5 when peeling subsides. Use mineral makeup only."},
    {"question": "Is it safe for darker skin tones?", "answer": "Yes, but settings must be conservative. Higher melanin increases pigment risk — choose a provider experienced with your skin type."}
  ]'::jsonb,
  ARRAY['Active cold sore or skin infection', 'Accutane use within 6 months', 'Pregnancy', 'Recent significant sun exposure or tan'],
  'Adults with acne scars, sun damage, fine lines, or uneven skin texture seeking gradual resurfacing without extended downtime.',
  ARRAY['CO2 laser', 'Microneedling with RF', 'Chemical peels', 'Microdermabrasion'],
  true
),

(
  gen_random_uuid(),
  'ipl',
  'IPL (Intense Pulsed Light)',
  'Laser',
  'A broad-spectrum light treatment that targets pigmentation, redness, and sun damage without ablating the skin surface.',
  'IPL emits multiple wavelengths of light that are absorbed by melanin (brown spots) and hemoglobin (red vessels). The targeted pigment heats up and is broken down, then cleared by the body''s immune system.',
  'Avoid sun and self-tanner for 2 weeks prior. Stop retinoids 3 days before. Shave the area before treatment. No makeup or skincare products the day of.',
  'Day 1: Treated spots may darken (like coffee grounds). Day 2–5: Darkened spots flake off. Mild redness resolves in 24–48 hours. Week 1: Clearer, more even tone.',
  0,
  'Mild',
  '$300–$600 per session',
  '6–12 months (with sun protection)',
  '[
    {"name": "Darkening of spots before flaking", "likelihood": "Very common", "severity": "Mild", "when_to_seek_help": "Normal — spots should flake within 5–7 days"},
    {"name": "Blistering or crusting", "likelihood": "Uncommon", "severity": "Moderate", "when_to_seek_help": "If blisters form — keep clean, avoid picking; contact provider"},
    {"name": "Hyperpigmentation", "likelihood": "Uncommon", "severity": "Moderate", "when_to_seek_help": "At 4-week follow-up if darkening persists"},
    {"name": "Hair reduction in treated areas", "likelihood": "Common", "severity": "Mild", "when_to_seek_help": "Not a medical issue, but note if unintended"}
  ]'::jsonb,
  ARRAY['Severe blistering or burns', 'Signs of infection', 'Unusual pigment changes that worsen', 'Scarring'],
  '[
    {"question": "What does IPL treat best?", "answer": "Sun spots, age spots, freckles, rosacea redness, and broken capillaries. It is not ideal for deep wrinkles or scars."},
    {"question": "How many sessions?", "answer": "Usually 3–6 sessions spaced 3–4 weeks apart for optimal results."},
    {"question": "Does it hurt?", "answer": "Feels like a rubber band snap. Most devices have built-in cooling to minimize discomfort."}
  ]'::jsonb,
  ARRAY['Active sunburn or tan', 'Pregnancy', 'Active skin infection or cold sores', 'Photosensitizing medications (e.g., doxycycline, isotretinoin)'],
  'Adults with sun damage, brown spots, facial redness, rosacea, or broken capillaries seeking a brighter, more even complexion.',
  ARRAY['Laser genesis', 'Q-switched laser', 'Chemical peels', 'Topical hydroquinone'],
  true
),

(
  gen_random_uuid(),
  'co2-laser-resurfacing',
  'CO2 Laser Resurfacing',
  'Laser',
  'An ablative laser that removes the outer layers of skin for dramatic wrinkle reduction and skin tightening.',
  'CO2 laser vaporizes the epidermis and heats the dermis, triggering intense collagen contraction and remodeling. The skin heals by creating new, smoother tissue from the bottom up.',
  'Stop smoking 2 weeks before and after. Stop retinoids 2 weeks prior. Arrange 1–2 weeks off work/social activities. Prepare a post-care kit: gentle cleanser, occlusive ointment, sunblock.',
  'Day 1–3: Significant redness, swelling, oozing. Day 3–7: Skin crusts and peels heavily. Week 2: Pink, fresh skin visible. Week 3–4: Redness fades to a healthy glow. Month 2–3: Collagen remodeling continues; texture and tone improve.',
  7,
  'Significant',
  '$2,500–$5,000 per session',
  '3–5 years',
  '[
    {"name": "Prolonged redness", "likelihood": "Very common", "severity": "Mild", "when_to_seek_help": "If redness persists > 3 months or becomes painful"},
    {"name": "Hyperpigmentation", "likelihood": "Uncommon", "severity": "Moderate", "when_to_seek_help": "At 4-week follow-up — treatable with topicals"},
    {"name": "Infection", "likelihood": "Uncommon", "severity": "Moderate", "when_to_seek_help": "If fever, increasing pain, or pus develops"},
    {"name": "Scarring", "likelihood": "Rare", "severity": "Significant", "when_to_seek_help": "If skin texture changes or indentations form during healing"}
  ]'::jsonb,
  ARRAY['Severe pain not controlled by medication', 'Signs of infection (fever, pus, spreading redness)', 'Blisters or skin breakdown', 'Unusual pigment changes (white or very dark patches)'],
  '[
    {"question": "How long until I look normal?", "answer": "Social downtime is 1–2 weeks. You will have pinkness for 1–3 months, which can be covered with makeup after week 2."},
    {"question": "Is one session enough?", "answer": "Often yes for significant results, but some patients benefit from a second session 6–12 months later."},
    {"question": "Can it treat acne scars?", "answer": "Yes — CO2 is one of the most effective treatments for deep acne scars. Fractional CO2 reduces downtime compared to fully ablative."}
  ]'::jsonb,
  ARRAY['Active cold sores or skin infection', 'Accutane within 12 months', 'Pregnancy', 'History of keloid scarring', 'Recent significant sun exposure'],
  'Adults with deep wrinkles, significant sun damage, acne scars, or lax skin who can accommodate 1–2 weeks of downtime and want dramatic, long-lasting results.',
  ARRAY['Fraxel', 'Microneedling with RF', 'Phenol peel', 'Facelift (surgical)'],
  true
),

(
  gen_random_uuid(),
  'laser-hair-removal',
  'Laser Hair Removal',
  'Laser',
  'A laser treatment that targets hair follicles to permanently reduce unwanted hair on face and body.',
  'The laser emits a specific wavelength absorbed by melanin in the hair shaft. The light energy converts to heat, damaging the follicle''s ability to regrow hair without harming surrounding skin.',
  'Shave the treatment area 24 hours before. Do not wax, pluck, or thread for 4–6 weeks prior (the laser needs the hair root). Avoid sun exposure and self-tanner for 2 weeks.',
  'Day 1: Mild redness and perifollicular swelling (looks like goosebumps). Day 2–3: Redness fades. Treated hairs shed over 1–3 weeks. No visible downtime for most patients.',
  0,
  'Mild',
  '$150–$500 per session (varies by area)',
  'Permanent reduction (maintenance 1–2x/year)',
  '[
    {"name": "Redness and swelling", "likelihood": "Very common", "severity": "Mild", "when_to_seek_help": "If > 48 hours or severe"},
    {"name": "Blisters or burns", "likelihood": "Uncommon", "severity": "Moderate", "when_to_seek_help": "If blistering occurs — do not pop; contact provider"},
    {"name": "Pigment changes", "likelihood": "Uncommon", "severity": "Moderate", "when_to_seek_help": "At 4-week follow-up if darkening or lightening persists"},
    {"name": "Paradoxical hair growth", "likelihood": "Rare", "severity": "Mild", "when_to_seek_help": "If hair increases in fine, light-colored hairs near treated area — contact provider"}
  ]'::jsonb,
  ARRAY['Severe blistering or burns', 'Signs of infection', 'Unusual skin color changes that worsen', 'Scarring'],
  '[
    {"question": "How many sessions will I need?", "answer": "Usually 6–10 sessions spaced 4–8 weeks apart, depending on the area and hair type."},
    {"question": "Does it work on blonde or gray hair?", "answer": "Traditional lasers target melanin, so blonde, gray, or red hair responds poorly. Specialized lasers (like Nd:YAG) may help some lighter hair."},
    {"question": "Is it truly permanent?", "answer": "Most patients see 70–90% permanent reduction. Occasional maintenance sessions (1–2 per year) help manage hormonal regrowth."}
  ]'::jsonb,
  ARRAY['Pregnancy', 'Active skin infection or rash in treatment area', 'Recent sunburn or tan', 'History of keloid scarring', 'Photosensitizing medications'],
  'Adults with unwanted dark hair on face or body seeking long-term hair reduction. Best for patients with light skin and dark hair contrast.',
  ARRAY['Electrolysis', 'IPL hair reduction', 'Waxing/threading', 'Prescription hair-reducing creams (Vaniqa)'],
  true
),

(
  gen_random_uuid(),
  'halo-hybrid-laser',
  'Halo Hybrid Laser',
  'Laser',
  'A hybrid fractional laser combining ablative and non-ablative wavelengths for comprehensive skin renewal with moderate downtime.',
  'Halo delivers two laser wavelengths simultaneously: one ablative (2940nm) that resurfaces the epidermis, and one non-ablative (1470nm) that heats the dermis to stimulate collagen. This dual action treats texture, tone, and fine lines in one session.',
  'Avoid sun and tanning for 2 weeks prior. Stop retinoids 1 week before. Arrive with clean skin. Numbing cream is applied 30–60 minutes before. Plan for 3–5 days of social downtime.',
  'Day 1–2: Redness and warmth; skin feels tight. Day 2–4: Bronze, sandpaper texture as microscopic treatment zones heal. Day 4–6: Gentle peeling and flaking. Day 7: Fresh, glowing skin with reduced pore size and improved tone.',
  4,
  'Moderate',
  '$1,200–$2,500 per session',
  '2–3 years',
  '[
    {"name": "Bronzing and sandpaper texture", "likelihood": "Very common", "severity": "Mild", "when_to_seek_help": "Normal — resolves in 4–6 days"},
    {"name": "Swelling", "likelihood": "Common", "severity": "Mild", "when_to_seek_help": "If severe or > 3 days"},
    {"name": "Hyperpigmentation", "likelihood": "Uncommon", "severity": "Moderate", "when_to_seek_help": "At 4-week follow-up if darkening persists"},
    {"name": "Infection", "likelihood": "Rare", "severity": "Moderate", "when_to_seek_help": "If fever, increasing pain, or pus develops"}
  ]'::jsonb,
  ARRAY['Severe or increasing pain', 'Signs of infection', 'Blisters or skin breakdown', 'Unusual pigment changes that worsen'],
  '[
    {"question": "How is Halo different from Fraxel?", "answer": "Halo is a hybrid — it combines ablative + non-ablative in one pass for faster results than non-ablative Fraxel, with less downtime than fully ablative CO2."},
    {"question": "How many sessions do I need?", "answer": "One to two sessions typically deliver significant results. More sessions can be done for deeper concerns."},
    {"question": "Can I wear makeup after?", "answer": "Wait 3–5 days until peeling subsides. Mineral makeup is best."}
  ]'::jsonb,
  ARRAY['Pregnancy', 'Active cold sores or skin infection', 'Accutane within 6 months', 'Recent significant sun exposure'],
  'Adults with sun damage, fine lines, enlarged pores, dull skin, or early signs of aging who want noticeable results with about a week of downtime.',
  ARRAY['Fraxel', 'CO2 laser', 'Microneedling with RF', 'Deep chemical peel'],
  true
),

-- ========================
-- PEELS (3)
-- ========================

(
  gen_random_uuid(),
  'glycolic-acid-peel',
  'Glycolic Acid Peel',
  'Peels',
  'A superficial chemical exfoliation that brightens skin, improves texture, and addresses mild discoloration with no downtime.',
  'Glycolic acid (an alpha-hydroxy acid from sugar cane) dissolves the bonds between dead skin cells, accelerating exfoliation. This reveals fresher skin and stimulates mild collagen production over time.',
  'Stop retinoids 3 days prior. Avoid sun exposure 1 week before. Do not wax or shave the area 48 hours before. Arrive with clean skin, no makeup.',
  'Day 1: Slight redness or pinkness (like a mild sunburn). Day 2–3: Mild flaking possible. Day 3–5: Skin looks brighter and smoother. No true downtime — you can return to normal activities immediately.',
  0,
  'Minimal',
  '$100–$300 per session',
  '4–6 weeks (cumulative with series)',
  '[
    {"name": "Redness", "likelihood": "Very common", "severity": "Mild", "when_to_seek_help": "If > 24 hours or severe"},
    {"name": "Mild flaking", "likelihood": "Common", "severity": "Mild", "when_to_seek_help": "Normal — do not pick; moisturize"},
    {"name": "Hyperpigmentation", "likelihood": "Rare", "severity": "Moderate", "when_to_seek_help": "If darkening appears after peeling — contact provider"},
    {"name": "Cold sore reactivation", "likelihood": "Rare", "severity": "Mild", "when_to_seek_help": "If history of cold sores and outbreak occurs — antivirals help"}
  ]'::jsonb,
  ARRAY['Severe burning or blistering', 'Signs of infection', 'Unusual color changes', 'Swelling that worsens after 48 hours'],
  '[
    {"question": "How often should I get one?", "answer": "Every 3–4 weeks for a series of 4–6 peels, then monthly for maintenance."},
    {"question": "Can I go back to work after?", "answer": "Yes — this is a lunchtime peel. You may have slight pinkness but no visible peeling for most people."},
    {"question": "Will it help with acne?", "answer": "Yes — glycolic acid helps unclog pores and reduce post-acne marks. Salicylic acid peels may be better for active acne."}
  ]'::jsonb,
  ARRAY['Active skin infection or cold sores', 'Open wounds or eczema in treatment area', 'Recent isotretinoin use (within 6 months)', 'Pregnancy (optional precaution)'],
  'Adults with dull skin, mild texture issues, fine lines, or early sun damage seeking a quick radiance boost with no downtime.',
  ARRAY['Salicylic acid peel', 'Lactic acid peel', 'Microdermabrasion', 'At-home AHA products'],
  true
),

(
  gen_random_uuid(),
  'tca-peel-medium',
  'TCA Peel (Medium Depth)',
  'Peels',
  'A medium-depth chemical peel using trichloroacetic acid to treat deeper wrinkles, pigmentation, and precancerous lesions with 5–7 days of downtime.',
  'TCA denatures epidermal proteins and causes controlled peeling down to the upper dermis. This removes damaged layers, stimulates collagen, and significantly improves texture and pigmentation.',
  'Stop retinoids 1 week prior. Avoid sun 2 weeks before. Pre-treat with hydroquinone for 2–4 weeks if you have darker skin or melasma history. Arrange 5–7 days of social downtime. Have post-care supplies ready.',
  'Day 1: Skin is red and tight; frosting (white coating) fades within hours. Day 2–3: Darkening and swelling peak. Day 3–5: Skin begins to crack and peel extensively. Day 5–7: Most peeling complete; pink, fresh skin visible. Week 2–4: Pinkness fades; collagen continues remodeling.',
  5,
  'Moderate',
  '$500–$1,500 per session',
  '1–3 years',
  '[
    {"name": "Prolonged redness", "likelihood": "Very common", "severity": "Mild", "when_to_seek_help": "If > 4 weeks or painful"},
    {"name": "Hyperpigmentation", "likelihood": "Uncommon", "severity": "Moderate", "when_to_seek_help": "At 4-week follow-up — treatable with topicals"},
    {"name": "Infection", "likelihood": "Rare", "severity": "Moderate", "when_to_seek_help": "If fever, increasing pain, or pus develops"},
    {"name": "Scarring", "likelihood": "Rare", "severity": "Significant", "when_to_seek_help": "If indentations or raised scars form during healing"}
  ]'::jsonb,
  ARRAY['Severe pain not controlled by medication', 'Signs of infection (fever, pus, spreading redness)', 'Blisters or skin breakdown', 'Unusual pigment changes (white or very dark patches)'],
  '[
    {"question": "How many peels will I need?", "answer": "One medium-depth TCA peel often delivers significant results. Some patients do a second after 6–12 months."},
    {"question": "Can I wear makeup during peeling?", "answer": "No — avoid makeup until peeling is complete (day 5–7). Mineral powder is acceptable after day 5 if skin is healed."},
    {"question": "Will it hurt?", "answer": "There is a burning sensation during application (2–3 minutes), then stinging subsides. Fans and cool compresses help."}
  ]'::jsonb,
  ARRAY['Active cold sores or skin infection', 'Accutane within 12 months', 'Pregnancy or breastfeeding', 'History of keloid or hypertrophic scarring', 'Recent significant sun exposure'],
  'Adults with moderate sun damage, actinic keratoses, deeper wrinkles, or significant pigmentation who can accommodate a week of downtime.',
  ARRAY['CO2 laser', 'Fraxel', 'Jessner''s peel', 'Deep microneedling'],
  true
),

(
  gen_random_uuid(),
  'jessners-peel',
  'Jessner''s Peel',
  'Peels',
  'A combination peel using salicylic acid, lactic acid, and resorcinol to treat acne, oily skin, and mild photoaging with 3–5 days of flaking.',
  'The combination of acids works synergistically: salicylic acid penetrates oil-filled pores, lactic acid hydrates and exfoliates, and resorcinol breaks down rough, damaged skin. Together they cause controlled peeling and renewal.',
  'Stop retinoids 3 days prior. Avoid waxing or shaving 48 hours before. Do not pick at skin. Arrange 3–5 days where heavy peeling is acceptable. Use sun protection diligently.',
  'Day 1: Redness and mild swelling; skin may frost slightly. Day 2–3: Tightness and darkening; peeling begins. Day 3–5: Moderate to heavy flaking. Day 5–7: Peeling subsides; smoother, clearer skin emerges.',
  3,
  'Mild',
  '$150–$400 per session',
  '3–6 months',
  '[
    {"name": "Redness and flaking", "likelihood": "Very common", "severity": "Mild", "when_to_seek_help": "Normal — moisturize and do not pick"},
    {"name": "Post-inflammatory hyperpigmentation", "likelihood": "Uncommon", "severity": "Moderate", "when_to_seek_help": "At 4-week follow-up if darkening persists"},
    {"name": "Cold sore reactivation", "likelihood": "Uncommon", "severity": "Mild", "when_to_seek_help": "If history of cold sores — pre-treat with antivirals"},
    {"name": "Allergic reaction to resorcinol", "likelihood": "Rare", "severity": "Moderate", "when_to_seek_help": "If rash, itching, or hives develop — contact provider"}
  ]'::jsonb,
  ARRAY['Severe burning or blistering', 'Signs of infection', 'Allergic reaction symptoms (hives, swelling, difficulty breathing)', 'Unusual pigment changes'],
  '[
    {"question": "Is this good for acne?", "answer": "Yes — Jessner''s is excellent for active acne, clogged pores, and oily skin. The salicylic acid component is especially effective."},
    {"question": "How often can I get one?", "answer": "Every 4–6 weeks for a series, then every 3 months for maintenance."},
    {"question": "Can it be combined with other treatments?", "answer": "Yes — it is often used before TCA for a deeper effect, or alongside extractions for acne."}
  ]'::jsonb,
  ARRAY['Active skin infection', 'Allergy to salicylates or resorcinol', 'Pregnancy or breastfeeding', 'Eczema or psoriasis in treatment area'],
  'Adults with acne-prone skin, oily complexion, mild acne scars, or early photoaging seeking clearer, smoother skin with a few days of peeling.',
  ARRAY['Salicylic acid peel', 'Glycolic acid peel', 'Microneedling', 'Accutane (for severe acne)'],
  true
),

-- ========================
-- BODY (3)
-- ========================

(
  gen_random_uuid(),
  'coolsculpting',
  'CoolSculpting',
  'Body',
  'A non-invasive fat-reduction treatment that freezes and eliminates stubborn fat cells without surgery.',
  'Cryolipolysis uses controlled cooling (approximately −11°C) to crystallize fat cells without damaging surrounding skin or tissue. The frozen fat cells undergo apoptosis (programmed cell death) and are gradually cleared by the immune system over 2–3 months.',
  'Maintain a stable weight. Avoid anti-inflammatory medications 1 week prior if possible. Wear comfortable clothing. The area will be marked and a gel pad applied before the applicator.',
  'Day 1: Intense cold sensation for 5–10 minutes, then numbness. Post-treatment massage may cause temporary redness and bruising. Day 2–7: Mild soreness, swelling, and numbness. Week 2–4: Numbness resolves; area feels tender. Month 2–3: Visible fat reduction as the body clears treated cells. Month 3–4: Final results visible.',
  0,
  'Mild',
  '$600–$1,200 per applicator',
  'Permanent (with stable weight)',
  '[
    {"name": "Numbness", "likelihood": "Very common", "severity": "Mild", "when_to_seek_help": "If > 4 weeks or bothersome"},
    {"name": "Bruising and swelling", "likelihood": "Common", "severity": "Mild", "when_to_seek_help": "If severe or > 2 weeks"},
    {"name": "Paradoxical adipose hyperplasia (PAH)", "likelihood": "Rare", "severity": "Moderate", "when_to_seek_help": "If the treated area becomes larger, firmer, or develops a distinct lump — surgical removal may be needed"},
    {"name": "Late-onset pain", "likelihood": "Uncommon", "severity": "Mild", "when_to_seek_help": "If sharp, stabbing, or burning pain occurs 3–5 days post-treatment — typically self-resolves in 1–2 weeks"}
  ]'::jsonb,
  ARRAY['Severe or worsening pain', 'Signs of infection (fever, warmth, redness spreading)', 'Paradoxical enlargement of the fat layer', 'Numbness lasting > 8 weeks'],
  '[
    {"question": "How many sessions will I need?", "answer": "Most patients need 1–2 sessions per area for noticeable reduction. Larger areas may require more."},
    {"question": "Is the fat gone forever?", "answer": "Yes — treated fat cells are permanently eliminated. However, remaining fat cells can expand with weight gain, so maintain a stable weight."},
    {"question": "Does it tighten skin?", "answer": "CoolSculpting reduces fat but does not significantly tighten skin. For skin laxity, consider Morpheus8 or radiofrequency treatments."}
  ]'::jsonb,
  ARRAY['Cryoglobulinemia', 'Paroxysmal cold hemoglobinuria', 'Cold urticaria (cold allergy)', 'Raynaud''s disease', 'Pregnancy', 'Hernia in treatment area'],
  'Adults within 20–30 pounds of their ideal weight with stubborn fat pockets (abdomen, flanks, thighs, upper arms, double chin) that resist diet and exercise.',
  ARRAY['Liposuction', 'WarmSculpting/SculpSure (laser)', 'Emsculpt', 'Kybella (for submental fat)'],
  true
),

(
  gen_random_uuid(),
  'emsculpt',
  'Emsculpt (Muscle Toning)',
  'Body',
  'A non-invasive body contouring treatment that builds muscle and burns fat using high-intensity focused electromagnetic (HIFEM) energy.',
  'HIFEM induces supramaximal muscle contractions — thousands in a 30-minute session — far beyond what is achievable through voluntary exercise. This triggers muscle fiber remodeling (hypertrophy) and releases free fatty acids for fat metabolism.',
  'Wear comfortable, thin clothing. Remove belts, jewelry, or anything with metal. Stay well-hydrated. Avoid heavy meals immediately before.',
  'Day 1: Soreness similar to an intense workout. Day 2–3: Peak soreness; walking and sitting may feel unusual. Day 4–7: Soreness decreases. Week 2–4: Visible muscle definition and improved tone. Month 2–3: Optimal results after completing the recommended series.',
  0,
  'Mild',
  '$750–$1,000 per session (typically 4 sessions)',
  '6+ months (with maintenance sessions)',
  '[
    {"name": "Muscle soreness", "likelihood": "Very common", "severity": "Mild", "when_to_seek_help": "If severe or interfering with daily activities — rest and hydrate"},
    {"name": "Temporary muscle fatigue", "likelihood": "Common", "severity": "Mild", "when_to_seek_help": "Normal — resolves in 2–3 days"},
    {"name": "Bruising at paddle sites", "likelihood": "Uncommon", "severity": "Mild", "when_to_seek_help": "If > 2 weeks"},
    {"name": "Burn sensation", "likelihood": "Rare", "severity": "Mild", "when_to_seek_help": "If persistent after session ends — contact provider"}
  ]'::jsonb,
  ARRAY['Severe or persistent pain', 'Signs of internal injury (swelling, bruising, deformity)', 'Numbness or tingling that persists', 'Muscle weakness that worsens'],
  '[
    {"question": "Does it replace working out?", "answer": "No — it complements exercise. It builds muscle in ways hard to achieve at the gym, but overall fitness still requires activity and nutrition."},
    {"question": "Will I lose weight?", "answer": "You may lose inches and gain muscle definition, but the scale may not change significantly. Body composition improves."},
    {"question": "How many sessions?", "answer": "Typically 4 sessions spaced 2–3 days apart, then maintenance every 3–6 months."}
  ]'::jsonb,
  ARRAY['Pregnancy', 'Metal implants (pacemaker, IUD with metal, joint replacements near treatment area)', 'Musculoskeletal disorders in treatment area', 'Recent surgery in treatment area'],
  'Adults seeking enhanced muscle definition, a flatter abdomen, firmer buttocks, or toned arms who are already near their target weight and want a non-surgical boost.',
  ARRAY['CoolTone', 'Traditional strength training', 'Liposuction', 'Brazilian butt lift (surgical)'],
  true
),

(
  gen_random_uuid(),
  'morpheus8-body',
  'Morpheus8 Body',
  'Body',
  'A minimally invasive radiofrequency microneedling treatment that tightens skin, reduces fat, and improves texture on the body.',
  'Morpheus8 delivers radiofrequency energy through an array of microneedles deep into the subdermal layer. The heat melts small fat pockets and contracts collagen fibers, while the microneedles trigger skin remodeling and elastin production.',
  'Avoid sun exposure 2 weeks prior. Stop retinoids 1 week before. Shave the treatment area. Avoid blood thinners 1 week prior. Numbing cream is applied 30–60 minutes before.',
  'Day 1–2: Redness, swelling, and pinpoint bleeding. Day 2–3: Grid-pattern marks visible; swelling peaks. Day 3–5: Marks fade; swelling decreases. Day 5–7: Skin texture begins to improve. Week 2–4: Tightening becomes noticeable. Month 2–3: Optimal results as collagen matures.',
  2,
  'Moderate',
  '$800–$1,500 per session',
  '1–3 years',
  '[
    {"name": "Grid-pattern marks", "likelihood": "Very common", "severity": "Mild", "when_to_seek_help": "Normal — fade in 3–5 days"},
    {"name": "Swelling", "likelihood": "Very common", "severity": "Mild", "when_to_seek_help": "If severe or > 1 week"},
    {"name": "Bruising", "likelihood": "Common", "severity": "Mild", "when_to_seek_help": "If > 2 weeks"},
    {"name": "Burns or skin texture changes", "likelihood": "Rare", "severity": "Moderate", "when_to_seek_help": "If blistering, prolonged grid marks, or indentations form"}
  ]'::jsonb,
  ARRAY['Severe or increasing pain', 'Signs of infection (fever, pus, spreading redness)', 'Blisters or skin breakdown', 'Grid marks persisting > 2 weeks'],
  '[
    {"question": "How many sessions will I need?", "answer": "Typically 1–3 sessions spaced 4–6 weeks apart for best results on skin laxity and texture."},
    {"question": "Can it treat cellulite?", "answer": "It improves skin texture and mild laxity associated with cellulite, but it is not a primary cellulite treatment. Subcision or other procedures may be needed."},
    {"question": "Is there scarring?", "answer": "No — the microneedles are very fine and the RF energy is precisely controlled. Any marks resolve within days."}
  ]'::jsonb,
  ARRAY['Pregnancy or breastfeeding', 'Active skin infection in treatment area', 'Metal implants directly in treatment area', 'Recent radiation therapy to the area', 'Uncontrolled diabetes or poor wound healing'],
  'Adults with mild to moderate skin laxity on the abdomen, arms, thighs, or knees, or those with small stubborn fat pockets who want skin tightening without surgery.',
  ARRAY['BodyTite', 'Renuvion/J-Plasma', 'Liposuction with skin tightening', 'Non-invasive RF (Thermage, Exilis)'],
  true
),

-- ========================
-- SKINCARE (4)
-- ========================

(
  gen_random_uuid(),
  'microneedling',
  'Microneedling',
  'Skincare',
  'A collagen-induction therapy using fine needles to create controlled micro-injuries, triggering the skin''s natural repair process.',
  'A device with sterile, fine needles (0.5–2.5mm) creates thousands of microscopic punctures in the epidermis and dermis. The body responds by releasing growth factors, producing new collagen and elastin, and remodeling scar tissue.',
  'Avoid retinoids, acids, and exfoliants 3–5 days prior. Avoid sun exposure 1 week before. Do not wax or shave 48 hours before. Arrive with clean skin. Numbing cream is applied 20–30 minutes before.',
  'Day 1: Redness and warmth like a sunburn; skin feels tight. Day 1–2: Mild swelling; avoid makeup and sun. Day 2–3: Pinkness persists; flaking may begin. Day 3–5: Skin returns to normal color; texture improves. Week 2–4: Collagen production visible as smoother, firmer skin.',
  1,
  'Mild',
  '$300–$700 per session',
  '4–6 months (cumulative with series)',
  '[
    {"name": "Redness and swelling", "likelihood": "Very common", "severity": "Mild", "when_to_seek_help": "If > 3 days or severe"},
    {"name": "Minor bleeding or bruising", "likelihood": "Common", "severity": "Mild", "when_to_seek_help": "If bruising > 1 week"},
    {"name": "Breakouts", "likelihood": "Uncommon", "severity": "Mild", "when_to_seek_help": "If acne worsens after 1 week — may need topical treatment"},
    {"name": "Infection", "likelihood": "Rare", "severity": "Moderate", "when_to_seek_help": "If increasing pain, warmth, pus, or fever"}
  ]'::jsonb,
  ARRAY['Severe or increasing pain', 'Signs of infection (fever, pus, spreading redness)', 'Prolonged redness > 1 week', 'Unusual skin texture changes'],
  '[
    {"question": "How many sessions do I need?", "answer": "Typically 3–6 sessions spaced 4–6 weeks apart for acne scars, texture, or anti-aging."},
    {"question": "Can I add PRP?", "answer": "Yes — PRP (platelet-rich plasma) applied after microneedling accelerates healing and may enhance results. This is often called the ''vampire facial.''"},
    {"question": "Can I do this at home with a dermaroller?", "answer": "At-home rollers have shorter needles (0.2–0.5mm) and are for product absorption only. Medical microneedling (0.5–2.5mm) must be done by a professional for collagen induction."}
  ]'::jsonb,
  ARRAY['Active skin infection or cold sores', 'Accutane within 6 months', 'Pregnancy', 'Eczema or psoriasis in treatment area', 'Keloid tendency'],
  'Adults with acne scars, fine lines, enlarged pores, stretch marks, or general skin texture concerns seeking gradual improvement with minimal downtime.',
  ARRAY['Fraxel laser', 'Chemical peels', 'RF microneedling (Morpheus8)', 'Subcision (for deep scars)'],
  true
),

(
  gen_random_uuid(),
  'hydrafacial',
  'HydraFacial',
  'Skincare',
  'A multi-step facial treatment that cleanses, exfoliates, extracts, and hydrates using a patented vortex-fusion device.',
  'The HydraFacial device uses a spiral-tip applicator combined with vacuum suction and customized serums. It simultaneously removes dead skin, unclogs pores with painless suction, and infuses hydrating, antioxidant, and peptide-rich serums.',
  'Avoid strong retinoids or exfoliants 2 days prior. Do not wax or shave the area 48 hours before. Arrive with clean skin, no makeup. Remove contact lenses if treating around the eyes.',
  'Day 1: Immediate glow; slight pinkness possible. Day 1–2: Skin looks hydrated and smooth. No downtime — you can apply makeup and resume normal activities right away.',
  0,
  'Minimal',
  '$150–$300 per session',
  '4–6 weeks',
  '[
    {"name": "Mild redness", "likelihood": "Common", "severity": "Mild", "when_to_seek_help": "If > 24 hours"},
    {"name": "Breakouts after extraction", "likelihood": "Uncommon", "severity": "Mild", "when_to_seek_help": "If acne worsens after 1 week"},
    {"name": "Sensitivity to serums", "likelihood": "Rare", "severity": "Mild", "when_to_seek_help": "If rash, itching, or hives develop — contact provider"},
    {"name": "Broken capillaries (from suction)", "likelihood": "Rare", "severity": "Mild", "when_to_seek_help": "If visible broken vessels appear — typically treatable with laser"}
  ]'::jsonb,
  ARRAY['Severe allergic reaction (hives, swelling, difficulty breathing)', 'Signs of infection', 'Worsening rash or irritation'],
  '[
    {"question": "How often should I get one?", "answer": "Monthly for best results. It is gentle enough for regular maintenance."},
    {"question": "Is it good for acne?", "answer": "Yes — the extraction step helps clear blackheads and congestion. For active acne, ask for a modified protocol."},
    {"question": "Can I get it before an event?", "answer": "Yes — it is a popular pre-event treatment. Your skin will look glowing and makeup applies beautifully afterward."}
  ]'::jsonb,
  ARRAY['Active rash or eczema in treatment area', 'Severe active acne with open lesions', 'Recent sunburn', 'Allergy to any planned serum ingredients'],
  'Adults seeking a quick skin refresh, improved hydration, clearer pores, or a pre-event glow. Suitable for most skin types, including sensitive skin.',
  ARRAY['DiamondGlow', 'Standard facial with extractions', 'At-home cleansing + masking', 'Microdermabrasion'],
  true
),

(
  gen_random_uuid(),
  'dermaplaning',
  'Dermaplaning',
  'Skincare',
  'A gentle, manual exfoliation using a sterile surgical blade to remove dead skin cells and fine vellus hair (peach fuzz).',
  'A trained provider holds the skin taut and glides a sterile blade at a 45-degree angle across the skin surface. This removes the stratum corneum (top layer of dead skin) and fine facial hair, revealing smoother, brighter skin and allowing better product penetration.',
  'Avoid retinoids and acids 3 days prior. Stop any facial waxing 2 weeks before. Arrive with clean, dry skin. Inform provider of any active breakouts.',
  'Day 1: Skin feels incredibly smooth; may look slightly pink. Day 1–2: Slight sensitivity to sun and products. Day 2–3: Skin returns to normal with enhanced brightness. No true downtime.',
  0,
  'Minimal',
  '$75–$200 per session',
  '3–4 weeks',
  '[
    {"name": "Minor nicks or cuts", "likelihood": "Uncommon", "severity": "Mild", "when_to_seek_help": "If bleeding persists or signs of infection appear"},
    {"name": "Breakouts", "likelihood": "Uncommon", "severity": "Mild", "when_to_seek_help": "If acne worsens after 1 week — may be due to product irritation on freshly exfoliated skin"},
    {"name": "Patchy hair regrowth myth", "likelihood": "N/A", "severity": "Mild", "when_to_seek_help": "Hair does NOT grow back thicker or darker — this is a myth. Vellus hair regrows the same."},
    {"name": "Sensitivity to sun", "likelihood": "Common", "severity": "Mild", "when_to_seek_help": "Protect with SPF 30+ diligently for 1 week post-treatment"}
  ]'::jsonb,
  ARRAY['Signs of infection in nicks', 'Severe irritation or rash', 'Unusual skin reaction'],
  '[
    {"question": "Will my hair grow back thicker?", "answer": "No — this is a myth. Dermaplaning removes vellus hair at the surface; the regrowth is the same soft, fine hair."},
    {"question": "How often can I do it?", "answer": "Every 3–4 weeks, as skin cell turnover is approximately 30 days."},
    {"question": "Can I combine it with a peel?", "answer": "Yes — dermaplaning before a light peel allows deeper penetration. Your provider will determine the right combination for your skin."}
  ]'::jsonb,
  ARRAY['Active acne or open lesions', 'Active cold sores', 'Eczema or psoriasis in treatment area', 'Recent facial surgery or deep peel (within 2 weeks)'],
  'Adults with dull skin, dry texture, fine facial hair, or those who want smoother makeup application and better product absorption.',
  ARRAY['Microdermabrasion', 'Chemical exfoliation', 'Shaving (at-home, less precise)', 'Laser hair removal (for permanent hair reduction)'],
  true
),

(
  gen_random_uuid(),
  'led-light-therapy',
  'LED Light Therapy',
  'Skincare',
  'A painless, non-invasive treatment using specific wavelengths of light to reduce inflammation, stimulate collagen, and improve skin clarity.',
  'Red light (630–700nm) penetrates the dermis to stimulate fibroblasts and increase ATP production, promoting collagen and reducing inflammation. Blue light (405–420nm) targets Cutibacterium acnes bacteria. Near-infrared (700–1000nm) penetrates deepest for tissue repair and pain relief.',
  'Cleanse skin thoroughly before treatment. Remove makeup and skincare products. Do not use photosensitizing medications or topicals (e.g., aminolevulinic acid) unless directed. Protective eyewear is provided.',
  'Day 1: No downtime. Skin may feel warm and look slightly pink for 15–30 minutes. You can immediately resume all activities, including applying makeup.',
  0,
  'Minimal',
  '$50–$150 per session',
  '4–6 weeks (maintenance recommended)',
  '[
    {"name": "Mild warmth or pinkness", "likelihood": "Very common", "severity": "Mild", "when_to_seek_help": "Normal — resolves within 30 minutes"},
    {"name": "Dryness", "likelihood": "Uncommon", "severity": "Mild", "when_to_seek_help": "Moisturize after treatment"},
    {"name": "Headache from brightness", "likelihood": "Rare", "severity": "Mild", "when_to_seek_help": "Ensure protective eyewear is used; report to provider"},
    {"name": "Eye strain", "likelihood": "Rare", "severity": "Mild", "when_to_seek_help": "Use provided eye protection; rest eyes if needed"}
  ]'::jsonb,
  ARRAY['Severe headache or migraine triggered by light', 'Skin reaction such as blistering or burning (rare with proper settings)', 'Eye pain or vision changes'],
  '[
    {"question": "How many sessions do I need?", "answer": "For acne or anti-aging, 2–3 sessions per week for 4–6 weeks, then monthly maintenance. Some patients see results after one session, but cumulative treatments work best."},
    {"question": "Can I do this at home?", "answer": "At-home LED masks are available and convenient, but clinical devices are significantly more powerful. Home devices work well for maintenance between professional treatments."},
    {"question": "Does it work for wrinkles?", "answer": "Red and near-infrared LED stimulate collagen over time, which can soften fine lines. It is best used as part of a comprehensive anti-aging plan."}
  ]'::jsonb,
  ARRAY['Photosensitivity disorders (e.g., lupus, porphyria)', 'Use of photosensitizing medications (e.g., doxycycline, isotretinoin)', 'Active skin cancer in treatment area', 'Epilepsy triggered by light (rare consideration)'],
  'Adults with acne, inflammation, post-treatment healing needs, or those seeking gentle anti-aging and skin maintenance. Safe for all skin types.',
  ARRAY['Topical acne treatments', 'Microneedling', 'Chemical peels', 'At-home LED masks'],
  true
),

-- ========================
-- SURGICAL (3)
-- ========================

(
  gen_random_uuid(),
  'blepharoplasty',
  'Blepharoplasty (Eyelid Surgery)',
  'Surgical',
  'A surgical procedure that removes excess skin, fat, and muscle from the upper and/or lower eyelids to rejuvenate the eye area.',
  'The surgeon makes precise incisions along the natural eyelid creases (upper) or just below the lash line/inside the lid (lower). Excess tissue is removed or repositioned, and the skin is sutured for a smoother, more alert appearance.',
  'Stop smoking 4 weeks before and after. Stop blood thinners 1 week prior (with physician approval). Arrange 1–2 weeks off work. Set up a recovery area with cold compresses, artificial tears, and head elevation pillows. Do not wear contact lenses for 2 weeks post-op.',
  'Day 1–3: Swelling and bruising peak; eyes feel tight and sore. Use cold compresses. Day 3–7: Bruising begins to fade; swelling decreases. Stitches removed day 5–7. Week 2: Most bruising resolved; can return to work with makeup. Week 3–4: Swelling almost gone; incision lines fade. Month 2–3: Final result; scars mature and become nearly invisible.',
  7,
  'Moderate',
  '$3,000–$7,000',
  '10–15 years',
  '[
    {"name": "Swelling and bruising", "likelihood": "Very common", "severity": "Mild", "when_to_seek_help": "Normal — use cold compresses; contact provider if severe or asymmetric"},
    {"name": "Dry eyes", "likelihood": "Common", "severity": "Mild", "when_to_seek_help": "Use lubricating drops; contact provider if persistent > 2 weeks"},
    {"name": "Difficulty closing eyes fully", "likelihood": "Uncommon", "severity": "Moderate", "when_to_seek_help": "If lagophthalmos (inability to close) persists > 2 weeks — may require revision"},
    {"name": "Ectropion (lower lid pulling down)", "likelihood": "Rare", "severity": "Significant", "when_to_seek_help": "Immediately — requires surgical correction"},
    {"name": "Retrobulbar hematoma", "likelihood": "Rare", "severity": "Severe", "when_to_seek_help": "EMERGENCY — severe pain, vision loss, bulging eye. Go to ER immediately"}
  ]'::jsonb,
  ARRAY['Severe pain or pressure behind the eye', 'Vision loss or double vision', 'Inability to close the eye', 'Signs of infection (fever, pus, spreading redness)', 'Excessive bleeding'],
  '[
    {"question": "Will scars be visible?", "answer": "Upper eyelid scars hide in the natural crease. Lower lid scars are hidden below lashes or inside the lid (transconjunctival). They fade to nearly invisible over months."},
    {"question": "Can it fix droopy eyebrows?", "answer": "No — blepharoplasty addresses eyelid skin and fat, not brow position. A brow lift may be needed for heavy brows."},
    {"question": "How long until I can wear eye makeup?", "answer": "Typically 1–2 weeks after stitches are removed, once incision is fully closed. Use clean, fresh products to avoid infection."}
  ]'::jsonb,
  ARRAY['Uncontrolled thyroid disease', 'Uncontrolled high blood pressure', 'Dry eye syndrome (severe)', 'Active eye infection', 'Bleeding disorders'],
  'Adults with excess upper eyelid skin (hooding), under-eye bags, or lower lid wrinkles who want a more awake, refreshed appearance.',
  ARRAY['Upper eyelid: Botox brow lift, plasma pen', 'Lower eyelid: Under-eye filler, laser resurfacing', 'Non-surgical: Thermage, microneedling RF'],
  true
),

(
  gen_random_uuid(),
  'rhinoplasty',
  'Rhinoplasty',
  'Surgical',
  'A surgical procedure to reshape the nose for improved aesthetics and/or breathing function.',
  'The surgeon accesses the nasal framework through internal or external incisions. Bone and cartilage are sculpted, removed, or grafted to achieve the desired shape. Septal work may be done simultaneously to improve airflow.',
  'Stop smoking 4–6 weeks before and after. Stop blood thinners 1 week prior (with physician approval). Arrange 1–2 weeks off work/school. Prepare a recovery space with head elevation, ice packs, and soft foods. No glasses or sunglasses on the nose for 6 weeks.',
  'Day 1–3: Congestion, swelling, and bruising peak; splint in place. Day 5–7: Splint removed; bruising fades. Week 2: Return to work with residual swelling. Week 3–4: Most visible swelling subsides; exercise allowed. Month 3–6: Nasal tip refinement continues. Year 1: Final result as all swelling resolves and scar tissue matures.',
  10,
  'Significant',
  '$6,000–$15,000',
  'Permanent',
  '[
    {"name": "Swelling and bruising", "likelihood": "Very common", "severity": "Mild", "when_to_seek_help": "Normal — peaks at day 3; contact provider if severe or asymmetric"},
    {"name": "Nasal congestion", "likelihood": "Very common", "severity": "Mild", "when_to_seek_help": "Use saline spray; contact provider if persistent > 4 weeks"},
    {"name": "Numbness (tip of nose)", "likelihood": "Common", "severity": "Mild", "when_to_seek_help": "Normal — may take 6–12 months to fully resolve"},
    {"name": "Asymmetry or irregularity", "likelihood": "Uncommon", "severity": "Moderate", "when_to_seek_help": "At 6-month follow-up if still present; revision may be needed after 1 year"},
    {"name": "Septal perforation", "likelihood": "Rare", "severity": "Significant", "when_to_seek_help": "If whistling sound, crusting, or bleeding from septum — contact surgeon"}
  ]'::jsonb,
  ARRAY['Severe or increasing pain', 'Fever or signs of infection', 'Difficulty breathing not due to splint', 'Excessive bleeding', 'Clear fluid draining from nose (CSF leak — emergency)'],
  '[
    {"question": "How long until I see the final result?", "answer": "You will see a major improvement by 3 months, but the final shape — especially the nasal tip — takes 12 months to fully refine as swelling resolves."},
    {"question": "Will there be visible scars?", "answer": "Closed rhinoplasty: no external scars. Open rhinoplasty: a tiny scar across the columella (between nostrils) that fades to nearly invisible."},
    {"question": "Can rhinoplasty fix breathing problems?", "answer": "Yes — functional rhinoplasty or septoplasty corrects a deviated septum, turbinate issues, or valve collapse. Cosmetic and functional work are often combined."}
  ]'::jsonb,
  ARRAY['Unrealistic expectations', 'Active nasal infection', 'Severe bleeding disorders', 'Pregnancy', 'Patients under 16 (facial growth incomplete)'],
  'Adults unhappy with the size, shape, or proportions of their nose, or those with breathing difficulties due to structural issues. Emotional readiness and realistic expectations are essential.',
  ARRAY['Non-surgical rhinoplasty (liquid nose job with filler)', 'Chin augmentation (to balance profile)', 'Septoplasty alone (for breathing only)'],
  true
),

(
  gen_random_uuid(),
  'facelift',
  'Facelift',
  'Surgical',
  'A comprehensive surgical procedure that lifts and tightens sagging facial tissues, jowls, and neck laxity for a more youthful appearance.',
  'The surgeon makes incisions along the hairline and around the ears, then lifts the superficial musculoaponeurotic system (SMAS) — the deep supportive layer of the face. Excess skin is trimmed, and the remaining skin is redraped for a natural, refreshed look without a pulled appearance.',
  'Stop smoking 4–6 weeks before and after. Stop blood thinners 1 week prior (with physician approval). Arrange 2–3 weeks off work/social activities. Prepare recovery space with head elevation, ice packs, soft diet, and button-front clothing. Arrange help for the first 48 hours.',
  'Day 1–3: Swelling, bruising, and tightness peak; drains may be in place. Day 3–7: Drains removed; bruising spreads down neck/chest. Week 2: Sutures removed; swelling improves; can return to light activities. Week 3–4: Most bruising gone; social activities possible with makeup. Month 2–3: Swelling continues to diminish; scars fade. Month 6–12: Final result as tissues settle and scars mature.',
  14,
  'Significant',
  '$8,000–$20,000',
  '10–15 years',
  '[
    {"name": "Swelling and bruising", "likelihood": "Very common", "severity": "Mild", "when_to_seek_help": "Normal — contact provider if severe, asymmetric, or worsening after day 5"},
    {"name": "Numbness (ears, face, neck)", "likelihood": "Very common", "severity": "Mild", "when_to_seek_help": "Normal — resolves over weeks to months"},
    {"name": "Hematoma", "likelihood": "Uncommon", "severity": "Moderate", "when_to_seek_help": "If sudden, painful swelling under the skin — requires urgent drainage"},
    {"name": "Nerve weakness (temporary)", "likelihood": "Uncommon", "severity": "Moderate", "when_to_seek_help": "If facial asymmetry or inability to smile/brow — usually resolves in weeks to months"},
    {"name": "Skin necrosis (rare)", "likelihood": "Rare", "severity": "Severe", "when_to_seek_help": "If skin turns dark, black, or blisters — emergency requiring immediate surgical evaluation"}
  ]'::jsonb,
  ARRAY['Severe or increasing pain', 'Rapid, painful swelling (hematoma)', 'Signs of infection (fever, pus, spreading redness)', 'Skin color changes (dark, black, blue)', 'Difficulty breathing or swallowing'],
  '[
    {"question": "Will I look ''done'' or pulled?", "answer": "Modern facelift techniques lift the deeper SMAS layer, not just the skin. This creates a natural, refreshed appearance — not a windswept look."},
    {"question": "How long does it last?", "answer": "A well-done facelift typically lasts 10–15 years. Aging continues, but you will always look younger than if you had not had the surgery."},
    {"question": "Can I combine it with other procedures?", "answer": "Yes — eyelid surgery, brow lift, fat grafting, and laser resurfacing are commonly combined for a comprehensive rejuvenation."}
  ]'::jsonb,
  ARRAY['Uncontrolled high blood pressure', 'Smoking (must quit 4–6 weeks before)', 'Bleeding disorders', 'Poor wound healing (e.g., uncontrolled diabetes)', 'Unrealistic expectations'],
  'Adults with significant jowls, neck laxity, deep nasolabial folds, and sagging mid-face who want comprehensive, long-lasting rejuvenation and can accommodate 2–3 weeks of recovery.',
  ARRAY['Thread lift', 'Liquid facelift (fillers + Botox)', 'Mini facelift (shorter scar, less downtime)', 'Neck lift alone'],
  true
)
ON CONFLICT (slug) DO NOTHING;
