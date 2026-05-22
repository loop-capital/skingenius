import { calculateFitScore } from './src/lib/recommendations/fitScore';

// Mock data for testing
const mockProduct = {
  id: 'test-product-1',
  name: 'Test Acne Treatment',
  brand: 'TestBrand',
  price_tier: '$$',
  category: 'treatment',
  ingredients: [
    { id: 'ing-1', name: 'Benzoyl Peroxide' },
    { id: 'ing-2', name: 'Niacinamide' }
  ],
  pregnancy_safe: false,
  suitable_for_skin_types: ['oily', 'combination'],
  suitable_for_fitzpatrick: [1, 2, 3, 4],
  contraindicated_ingredients: []
};

const mockConditions = [
  { id: 'acne-vulgaris', confidence: 0.8, severity: 'moderate' }
];

const mockUserProfile = {
  skin_type: 'oily',
  fitzpatrick: 3,
  is_pregnant: false,
  allergies: []
};

console.log('Testing Fit Score calculation...');
const result = calculateFitScore(mockProduct, mockConditions, mockUserProfile);
console.log('Result:', result);