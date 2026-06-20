-- Direct SQL seed for ingredients - bypasses TypeScript issues
INSERT INTO public.ingredients (id, name, slug, category, description, evidence_level, concerns, pregnancy_safe, min_concentration, max_concentration) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Benzoyl Peroxide', 'benzoyl-peroxide', 'antimicrobial', 'Antimicrobial agent for acne treatment', 'A', '{"acne-vulgaris"}', true, 2.5, 5.0),
('550e8400-e29b-41d4-a716-446655440002', 'Salicylic Acid', 'salicylic-acid', 'bha', 'Beta hydroxy acid for exfoliation', 'A', '{"acne-vulgaris", "comedones"}', true, 0.5, 2.0)
ON CONFLICT (slug) DO NOTHING;
