// SKINgenius — Design System Constants
// Based on builder/design-database/design-systems/skincare/DESIGN.md
// Emerald + Gold palette, clinical-warm aesthetic

export const Colors = {
  // Primary — Emerald (Trust, Nature, Premium)
  primary: '#047857',
  primaryHover: '#059669',
  primaryActive: '#065F46',
  primary50: '#ECFDF5',
  primary100: '#D1FAE5',
  primary200: '#A7F3D0',

  // Accent — Gold (Luxury, Warmth)
  tertiary: '#D97706',
  tertiaryHover: '#F59E0B',
  tertiaryActive: '#B45309',
  tertiary50: '#FFFBEB',
  tertiary100: '#FEF3C7',
  tertiary200: '#FDE68A',

  // Text
  ink: '#1C1917',
  inkSecondary: '#78716C',
  inkMuted: '#A8A29E',
  inkInverse: '#FFFFFF',

  // Surfaces — Light Track
  canvas: '#FFFBF5',
  surfaceCard: '#FFFFFF',
  surfaceMuted: '#F5F5F4',

  // Surfaces — Dark Track
  canvasDark: '#1C1917',

  // Borders
  hairline: '#E7E5E4',
  hairlineSoft: '#F5F5F4',

  // Semantic
  success: '#16A34A',
  successBg: '#DCFCE7',
  warning: '#EAB308',
  warningBg: '#FEF9C3',
  error: '#DC2626',
  errorBg: '#FEE2E2',
  info: '#2563EB',
  infoBg: '#DBEAFE',

  // Ingredient Safety Spectrum
  ingredientGentle: '#86EFAC',
  ingredientModerate: '#93C5FD',
  ingredientActive: '#FCD34D',
  ingredientClinical: '#FDA4AF',
} as const;

export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  base: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
  section: 80,
} as const;

export const Radii = {
  xs: 4,
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  pill: 9999,
  full: 9999,
} as const;

export const Typography = {
  displayXl: { fontSize: 72, fontWeight: '700' as const, letterSpacing: -1.8 },
  displayLg: { fontSize: 56, fontWeight: '700' as const, letterSpacing: -1.12 },
  displayMd: { fontSize: 40, fontWeight: '600' as const, letterSpacing: -0.6 },
  headline: { fontSize: 28, fontWeight: '600' as const, letterSpacing: -0.28 },
  subhead: { fontSize: 22, fontWeight: '600' as const },
  bodyLg: { fontSize: 18, fontWeight: '400' as const, lineHeight: 29 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodySm: { fontSize: 14, fontWeight: '400' as const, lineHeight: 21 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  captionUppercase: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.77 },
  button: { fontSize: 14, fontWeight: '500' as const },
  navLink: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
} as const;

// Shadows
export const Shadows = {
  card: {
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHover: {
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 4,
  },
  glow: {
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;
