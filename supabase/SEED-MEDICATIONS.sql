-- SKINgenius: MEDICATIONS + CONDITION LINKS
-- Run after FIXED-SETUP.sql + SEED-ALL-NEW-TABLES.sql
-- ============================================

INSERT INTO public.medications (id, name, drug_class, skin_effects, interactions, pregnancy_category, photosensitivity, evidence_level, citation) VALUES
('tretinoin_topical','Tretinoin (topical)','retinoid',ARRAY['Normalized follicular keratinization','Increased collagen synthesis','Reduces comedones'],ARRAY['Benzoyl peroxide degrades tretinoin','Use separately AM/PM'],NULL,TRUE,'A','AAD Guidelines 2024'),
('adapalene_0.1_0.3','Adapalene','retinoid',ARRAY['Normalized follicular keratinization','Anti-inflammatory via RAR-beta','Less irritating than tretinoin'],ARRAY['Compatible with benzoyl peroxide'],NULL,TRUE,'A','FDA-approved OTC 2016'),
('tazarotene','Tazarotene','retinoid',ARRAY['Potent normalization of keratinization','Reduces plaque thickness'],ARRAY['Avoid with irritating topicals'],NULL,TRUE,'A','Phase III trials'),
('isotretinoin_oral','Isotretinoin (Accutane)','retinoid_oral',ARRAY['Dramatic sebum reduction (up to 90%)','Normalized follicular keratinization','Anti-inflammatory','Prolonged remission in 60-80%'],ARRAY['Tetracyclines contraindicated (pseudotumor cerebri)','Vitamin A supplements contraindicated'],NULL,TRUE,'A','FDA-approved 1982'),
('clindamycin_topical','Clindamycin (topical)','antibiotic_topical',ARRAY['Reduces C. acnes colonization','Anti-inflammatory'],ARRAY['Benzoyl peroxide reduces resistance risk','Erythromycin cross-resistance'],NULL,FALSE,'A','Cochrane Review 2024'),
('erythromycin_topical','Erythromycin (topical)','antibiotic_topical',ARRAY['Reduces C. acnes','Anti-inflammatory'],ARRAY['Higher resistance rates than clindamycin'],NULL,FALSE,'B','Cochrane Review 2024'),
('benzoyl_peroxide','Benzoyl peroxide','antimicrobial',ARRAY['Bactericidal (including resistant C. acnes)','Mild keratolytic','Does not cause bacterial resistance'],ARRAY['Deactivates tretinoin if applied simultaneously','Bleaches fabrics'],NULL,FALSE,'A','AAD Guidelines 2024'),
('doxycycline_40mg','Doxycycline (sub-antimicrobial)','antibiotic_oral',ARRAY['Anti-inflammatory at sub-antimicrobial dose','Reduces MMP activity'],ARRAY['Reduces efficacy of oral contraceptives','Photosensitivity'],NULL,TRUE,'A','FDA-approved 2006'),
('minocycline','Minocycline','antibiotic_oral',ARRAY['Anti-inflammatory','Reduces C. acnes'],ARRAY['Vestibular side effects','Skin pigmentation with long-term use'],NULL,FALSE,'A','Multiple RCTs'),
('azelaic_acid_15_20','Azelaic acid','dicarboxylic_acid',ARRAY['Anti-tyrosinase (lightens PIH)','Anti-inflammatory','Antibacterial','Comedolytic'],ARRAY['Well-tolerated; minimal interactions'],NULL,FALSE,'A','FDA-approved for rosacea'),
('salicylic_acid','Salicylic acid','keratolytic',ARRAY['Comedolytic','Oil-soluble — penetrates follicles','Mild anti-inflammatory'],ARRAY['Minimal systemic absorption topically'],NULL,FALSE,'B','OTC monograph'),
('metronidazole_topical','Metronidazole (topical)','antibiotic_topical',ARRAY['Anti-inflammatory','Reduces Demodex','Antioxidant'],ARRAY['Avoid alcohol (disulfiram-like reaction)'],NULL,FALSE,'A','FDA-approved for rosacea'),
('ivermectin_topical','Ivermectin (topical)','antiparasitic',ARRAY['Reduces Demodex mite density','Anti-inflammatory'],ARRAY['Minimal interactions'],NULL,FALSE,'A','Phase III trials for rosacea'),
('brimonidine','Brimonidine (topical)','alpha_agonist',ARRAY['Vasoconstriction — reduces transient erythema'],ARRAY['Do not use with MAO inhibitors'],NULL,FALSE,'A','FDA-approved for rosacea'),
('oxymetazoline','Oxymetazoline (topical)','alpha_agonist',ARRAY['Vasoconstriction — reduces persistent erythema'],ARRAY['Rebound erythema risk'],NULL,FALSE,'B','FDA-approved 2017'),
('hydrocortisone_1_2_5','Hydrocortisone (topical)','corticosteroid_mild',ARRAY['Anti-inflammatory','Reduces itching','Suppresses immune response'],ARRAY['Thins skin with prolonged use','May worsen rosacea and perioral dermatitis'],NULL,FALSE,'A','Dermatology standard of care'),
('betamethasone','Betamethasone (topical)','corticosteroid_potent',ARRAY['Potent anti-inflammatory','Reduces plaque thickness'],ARRAY['Skin atrophy risk','Hypothalamic-pituitary-adrenal axis suppression'],NULL,FALSE,'A','Dermatology standard of care'),
('clobetasol','Clobetasol (topical)','corticosteroid_superpotent',ARRAY['Maximum anti-inflammatory effect'],ARRAY['Severe skin atrophy risk with prolonged use','Do not use on face >2 weeks'],NULL,FALSE,'A','FDA labeling'),
('tacrolimus_topical','Tacrolimus (topical)','calcineurin_inhibitor',ARRAY['Immunosuppressive without skin atrophy','Anti-inflammatory'],ARRAY['No steroid side effects','Avoid live vaccines'],NULL,FALSE,'A','FDA-approved for atopic dermatitis'),
('pimecrolimus','Pimecrolimus (topical)','calcineurin_inhibitor',ARRAY['Immunosuppressive','Suitable for sensitive areas (face)'],ARRAY['Minimal systemic absorption'],NULL,FALSE,'A','FDA-approved for atopic dermatitis'),
('ketoconazole_topical','Ketoconazole (topical)','antifungal',ARRAY['Antifungal against Malassezia','Anti-inflammatory'],ARRAY['Minimal systemic absorption'],NULL,FALSE,'A','First-line for tinea versicolor'),
('fluconazole_oral','Fluconazole (oral)','antifungal',ARRAY['Systemic antifungal','Effective for extensive tinea versicolor'],ARRAY['Hepatotoxicity risk','Multiple drug interactions (CYP2C9, CYP3A4)'],NULL,FALSE,'A','IDSA Guidelines'),
('terbinafine_oral','Terbinafine (oral)','antifungal',ARRAY['Effective against dermatophytes'],ARRAY['Hepatotoxicity risk'],NULL,FALSE,'A','FDA-approved'),
('acyclovir','Acyclovir','antiviral',ARRAY['Inhibits viral DNA polymerase','Reduces outbreak duration'],ARRAY['Nephrotoxic with dehydration','Probenecid increases levels'],NULL,FALSE,'A','CDC Guidelines'),
('valacyclovir','Valacyclovir','antiviral',ARRAY['Prodrug of acyclovir — better bioavailability','Suppressive therapy reduces recurrence'],ARRAY['Similar to acyclovir'],NULL,FALSE,'A','CDC Guidelines'),
('dupilumab','Dupilumab','biologic',ARRAY['Blocks IL-4/IL-13 signaling','Reduces Th2 inflammation','Improves barrier function'],ARRAY['Conjunctivitis (10-25%)','No immunosuppression'],NULL,FALSE,'A','FDA-approved 2017'),
('risankizumab','Risankizumab','biologic',ARRAY['Blocks IL-23','Clears psoriasis plaques'],ARRAY['Increased infection risk','Requires TB screening'],NULL,FALSE,'A','Phase III UltIMMa trials'),
('secukinumab','Secukinumab','biologic',ARRAY['Blocks IL-17A','Rapid psoriasis clearance'],ARRAY['Candida infection risk','Neutropenia'],NULL,FALSE,'A','Phase III ERASURE trials'),
('adalimumab','Adalimumab','biologic',ARRAY['TNF-alpha inhibitor','Clears psoriasis and hidradenitis'],ARRAY['Serious infections risk','TB screening required','Lymphoma risk'],NULL,FALSE,'A','FDA-approved for psoriasis'),
('ruxolitinib_topical','Ruxolitinib (topical)','jak_inhibitor',ARRAY['Selective JAK1/2 inhibition','Reduces inflammation and itch'],ARRAY['Avoid with strong CYP3A4 inhibitors'],NULL,FALSE,'A','FDA-approved for atopic dermatitis 2021'),
('hydroquinone_4','Hydroquinone','depigmenting',ARRAY['Inhibits tyrosinase','Reduces melanin production'],ARRAY['Ochronosis with prolonged use (>6 months)','Oxidizes — store properly'],NULL,FALSE,'A','Gold standard for melasma'),
('fluorouracil_topical','Fluorouracil (5-FU)','antineoplastic',ARRAY['Destroys abnormal keratinocytes','Field treatment for AK'],ARRAY['Teratogenic','Photosensitizing'],NULL,TRUE,'A','FDA-approved for actinic keratosis'),
('imiquimod','Imiquimod','immune_modifier',ARRAY['TLR7 agonist — stimulates local immune response','Clears superficial BCC and AK'],ARRAY['Local inflammatory reaction expected'],NULL,FALSE,'A','FDA-approved'),
('urea_20_40','Urea (topical)','keratolytic',ARRAY['Hygroscopic — draws moisture into stratum corneum','Softens keratin'],ARRAY['Burning on broken skin'],NULL,FALSE,'A','OTC standard'),
('lactic_acid_12','Lactic acid (topical)','keratolytic',ARRAY['Humectant','Mild exfoliant','Normalizes keratinization'],ARRAY['Stinging on broken skin'],NULL,FALSE,'A','OTC standard'),
('coal_tar','Coal tar','antiproliferative',ARRAY['Slows keratinocyte proliferation','Anti-inflammatory','Antipruritic'],ARRAY['Stains clothing','Folliculitis risk'],NULL,TRUE,'B','Historical psoriasis treatment')
('spironolactone','Spironolactone','antiandrogen',ARRAY['Blocks androgen receptors','Reduces sebum production'],ARRAY['Hyperkalemia risk','Monitor potassium'],NULL,FALSE,'A','Off-label for acne; AAD support'),
('selenium_sulfide_shampoo','Selenium sulfide','antifungal_topical',ARRAY['Cytostatic to Malassezia','Reduces scaling'],ARRAY['May discolor hair'],NULL,FALSE,'A','OTC antifungal shampoo'),
('calcipotriene','Calcipotriene','vitamin_d_analog',ARRAY['Normalizes keratinocyte differentiation','Steroid-sparing'],ARRAY['Hypercalcemia risk with excessive use'],NULL,FALSE,'A','FDA-approved for psoriasis'),
('triple_combination_kligman','Triple combination (Kligman formula)','depigmenting',ARRAY['Hydroquinone + tretinoin + fluocinolone','Synergistic depigmentation'],ARRAY['Ochronosis risk with prolonged HQ use','Atrophy risk with steroid component'],NULL,FALSE,'A','Kligman & Willis 1975'),
('glycolic_acid','Glycolic acid','alpha_hydroxy_acid',ARRAY['Exfoliates stratum corneum','Promotes cell turnover','Improves texture'],ARRAY['Photosensitizing','May irritate sensitive skin'],NULL,TRUE,'B','Widely used chemical peel agent'),
('diclofenac_topical','Diclofenac (topical)','nsaid',ARRAY['Inhibits COX-2','Anti-inflammatory','Promotes apoptosis of abnormal cells'],ARRAY['Minimal systemic absorption'],NULL,FALSE,'A','FDA-approved for actinic keratosis'),
('penciclovir_topical','Penciclovir (topical)','antiviral',ARRAY['Inhibits viral DNA polymerase','Shortens outbreak by hours'],ARRAY['Minimal interactions'],NULL,FALSE,'B','OTC cold sore cream')
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, drug_class=EXCLUDED.drug_class, skin_effects=EXCLUDED.skin_effects, interactions=EXCLUDED.interactions, pregnancy_category=EXCLUDED.pregnancy_category, photosensitivity=EXCLUDED.photosensitivity, evidence_level=EXCLUDED.evidence_level, citation=EXCLUDED.citation;

-- MEDICATION-CONDITION LINKS
INSERT INTO public.medication_condition_links (medication_id, condition_id, relationship, effect_description, evidence_level) VALUES
-- Acne Vulgaris
('tretinoin_topical','acne-vulgaris','improves','First-line retinoid; normalizes follicular keratinization','A'),
('adapalene_0.1_0.3','acne-vulgaris','improves','OTC retinoid; less irritating; compatible with BP','A'),
('isotretinoin_oral','acne-vulgaris','improves','Most effective acne treatment; 60-80% long-term remission','A'),
('clindamycin_topical','acne-vulgaris','improves','Reduces C. acnes; use with BP to prevent resistance','A'),
('benzoyl_peroxide','acne-vulgaris','improves','Bactericidal; does not cause resistance','A'),
('doxycycline_40mg','acne-vulgaris','improves','Sub-antimicrobial dose for anti-inflammatory effect','A'),
('minocycline','acne-vulgaris','improves','Effective but more side effects than doxycycline','A'),
('azelaic_acid_15_20','acne-vulgaris','improves','Good for PIH-prone skin; anti-inflammatory and antibacterial','A'),
('salicylic_acid','acne-vulgaris','improves','Mild comedolytic; OTC first-line','B'),
('hydrocortisone_1_2_5','acne-vulgaris','improves','Intralesional for nodular acne','B'),
-- Hormonal Acne
('isotretinoin_oral','hormonal-acne','improves','Effective for hormonal acne unresponsive to other treatments','A'),
('spironolactone','hormonal-acne','improves','Anti-androgen; off-label but widely used','A'),
('azelaic_acid_15_20','hormonal-acne','improves','Safe option during pregnancy planning','A'),
-- Fungal Acne
('ketoconazole_topical','fungal-acne','improves','First-line antifungal for Malassezia folliculitis','A'),
('fluconazole_oral','fungal-acne','improves','Oral option for extensive disease','A'),
('selenium_sulfide_shampoo','fungal-acne','improves','Shampoo used as body wash','B'),
-- Excess Sebum
('isotretinoin_oral','excess-sebum-enlarged-pores','improves','Reduces sebum production by up to 90%','A'),
('azelaic_acid_15_20','excess-sebum-enlarged-pores','improves','Mild sebostatic effect','B'),
-- Rosacea
('metronidazole_topical','rosacea','improves','First-line for papulopustular rosacea','A'),
('ivermectin_topical','rosacea','improves','First-line; reduces Demodex and inflammation','A'),
('brimonidine','rosacea','improves','Reduces transient erythema','A'),
('oxymetazoline','rosacea','improves','Reduces persistent erythema','B'),
('azelaic_acid_15_20','rosacea','improves','Effective for papulopustular rosacea','A'),
('doxycycline_40mg','rosacea','improves','Sub-antimicrobial anti-inflammatory dose','A'),
('isotretinoin_oral','rosacea','improves','Low-dose for severe refractory rosacea','B'),
('hydrocortisone_1_2_5','rosacea','worsens','Steroid rosacea — rebound inflammation on withdrawal','A'),
-- Perioral Dermatitis
('metronidazole_topical','perioral-dermatitis','improves','Effective for mild perioral dermatitis','A'),
('tacrolimus_topical','perioral-dermatitis','improves','Good for steroid-induced perioral dermatitis','B'),
('erythromycin_topical','perioral-dermatitis','improves','Alternative first-line','B'),
('hydrocortisone_1_2_5','perioral-dermatitis','worsens','Classic cause of perioral dermatitis','A'),
('clobetasol','perioral-dermatitis','worsens','Superpotent steroids are the most common trigger','A'),
-- Psoriasis
('risankizumab','psoriasis','improves','IL-23 inhibitor; >90% clearance in trials','A'),
('secukinumab','psoriasis','improves','IL-17A inhibitor; rapid plaque clearance','A'),
('adalimumab','psoriasis','improves','TNF-alpha inhibitor; well-established efficacy','A'),
('betamethasone','psoriasis','improves','Potent topical steroid for plaques','A'),
('clobetasol','psoriasis','improves','Superpotent; rapid plaque reduction','A'),
('coal_tar','psoriasis','improves','Historical treatment; slows keratinocyte proliferation','B'),
('calcipotriene','psoriasis','improves','Vitamin D analog; steroid-sparing','A'),
('tazarotene','psoriasis','improves','Retinoid; reduces plaque thickness','A'),
('hydrocortisone_1_2_5','psoriasis','improves','Mild steroid for face and flexures','A'),
-- Atopic Dermatitis
('dupilumab','atopic-dermatitis','improves','Blocks IL-4/IL-13; first-line biologic for moderate-severe','A'),
('tacrolimus_topical','atopic-dermatitis','improves','Steroid-sparing; safe for face and long-term use','A'),
('pimecrolimus','atopic-dermatitis','improves','Milder calcineurin inhibitor; suitable for sensitive areas','A'),
('ruxolitinib_topical','atopic-dermatitis','improves','JAK inhibitor; rapid itch relief','A'),
('hydrocortisone_1_2_5','atopic-dermatitis','improves','First-line anti-inflammatory','A'),
('betamethasone','atopic-dermatitis','improves','For thicker lichenified areas','A'),
('fluconazole_oral','atopic-dermatitis','worsens','Not indicated; may trigger flares','D'),
-- Contact Dermatitis
('hydrocortisone_1_2_5','contact-dermatitis','improves','Reduces inflammation and itching','A'),
('betamethasone','contact-dermatitis','improves','For severe acute contact dermatitis','A'),
('tacrolimus_topical','contact-dermatitis','improves','For chronic allergic contact dermatitis','B'),
-- Seborrheic Dermatitis
('ketoconazole_topical','seborrheic-dermatitis','improves','First-line antifungal for scalp and face','A'),
('fluconazole_oral','seborrheic-dermatitis','improves','For extensive or refractory cases','B'),
('hydrocortisone_1_2_5','seborrheic-dermatitis','improves','Short-term for acute flares','A'),
('selenium_sulfide_shampoo','seborrheic-dermatitis','improves','Shampoo for scalp seborrheic dermatitis','A'),
-- Melasma
('hydroquinone_4','melasma','improves','Gold standard depigmenting agent','A'),
('tretinoin_topical','melasma','improves','Enhances hydroquinone penetration; monotherapy less effective','A'),
('azelaic_acid_15_20','melasma','improves','Safe alternative to hydroquinone; pregnancy-safe','A'),
('triple_combination_kligman','melasma','improves','Hydroquinone + tretinoin + steroid; Kligman formula','A'),
-- PIH
('azelaic_acid_15_20','post-inflammatory-hyperpigmentation','improves','Inhibits tyrosinase; safe for darker skin types','A'),
('hydroquinone_4','post-inflammatory-hyperpigmentation','improves','Effective but risk of ochronosis','A'),
('tretinoin_topical','post-inflammatory-hyperpigmentation','improves','Accelerates epidermal turnover','A'),
('glycolic_acid','post-inflammatory-hyperpigmentation','improves','Chemical exfoliant; promotes cell turnover','B'),
-- Solar Lentigines
('hydroquinone_4','solar-lentigines','improves','Lightens age spots','A'),
('tretinoin_topical','solar-lentigines','improves','Fades pigmentation over 6-12 months','A'),
('fluorouracil_topical','solar-lentigines','improves','Field treatment','B'),
-- Vitiligo
('tacrolimus_topical','vitiligo','improves','First-line for facial vitiligo; repigmentation in 60-70%','A'),
('ruxolitinib_topical','vitiligo','improves','FDA-approved for vitiligo 2022; JAK inhibition','A'),
('betamethasone','vitiligo','improves','First-line for non-facial vitiligo','A'),
-- Actinic Keratosis
('fluorouracil_topical','actinic-keratosis','improves','Field treatment; destroys abnormal keratinocytes','A'),
('imiquimod','actinic-keratosis','improves','Immune-mediated clearance','A'),
('diclofenac_topical','actinic-keratosis','improves','Topical NSAID; well-tolerated','B'),
-- Cold Sore
('acyclovir','cold-sore','improves','Reduces outbreak duration by 1-2 days','A'),
('valacyclovir','cold-sore','improves','Better bioavailability; suppressive therapy reduces recurrence 70-80%','A'),
('penciclovir_topical','cold-sore','improves','Topical; modest benefit','B'),
-- Folliculitis
('benzoyl_peroxide','folliculitis','improves','Prevents bacterial folliculitis','A'),
('clindamycin_topical','folliculitis','improves','For bacterial folliculitis','A'),
('ketoconazole_topical','folliculitis','improves','For Pityrosporum folliculitis','A'),
-- Tinea Versicolor
('ketoconazole_topical','tinea-versicolor','improves','First-line; cure rate >90%','A'),
('fluconazole_oral','tinea-versicolor','improves','Oral option for extensive disease','A'),
('terbinafine_oral','tinea-versicolor','improves','Alternative oral antifungal','B'),
-- Keratosis Pilaris
('urea_20_40','keratosis-pilaris','improves','Softens keratin plugs','A'),
('lactic_acid_12','keratosis-pilaris','improves','Exfoliates and hydrates','A'),
('tretinoin_topical','keratosis-pilaris','improves','Normalizes keratinization','B'),
-- Xerosis
('urea_20_40','xerosis','improves','Hygroscopic; draws moisture into skin','A'),
('lactic_acid_12','xerosis','improves','Humectant and mild exfoliant','A'),
-- Barrier Dysfunction
('tacrolimus_topical','barrier-dysfunction','improves','Anti-inflammatory without steroid barrier damage','B'),
('pimecrolimus','barrier-dysfunction','improves','Mild immunomodulation; supports barrier repair','B'),
('hydrocortisone_1_2_5','barrier-dysfunction','worsens','Prolonged use thins epidermis and damages barrier','A'),
('benzoyl_peroxide','barrier-dysfunction','worsens','Can be irritating and drying','B')
ON CONFLICT (medication_id, condition_id, relationship) DO UPDATE SET effect_description=EXCLUDED.effect_description, evidence_level=EXCLUDED.evidence_level;
