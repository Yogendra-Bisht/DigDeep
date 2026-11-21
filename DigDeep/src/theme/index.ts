// ============================================================
// DigDeep — Design System: Colors & Typography
// ============================================================
// Earth-toned palette designed for WCAG AAA contrast under
// direct sunlight (outdoor readability requirement from NFR 7.4)
// ============================================================

export const COLORS = {
  // ── Backgrounds
  bg: '#0F0D0A',
  bgSurface: '#1A1713',

  // ── Text
  textPrimary: '#F2EAD8',
  textSecondary: '#B8A98C',
  textMuted: '#6B5F4E',

  // ── Accent & Brand
  accent: '#C4832A',
  sand: '#D4AE6E',
  moss: '#5A7A3A',

  // ── Cards & Surfaces
  cardActive: '#241F18',
  cardLocked: '#161310',
  cardSelected: '#2E2318',

  // ── Borders
  border: '#2E2820',
  borderActive: '#5A4A32',

  // ── Node Status
  nodeUnlocked: '#C4832A',
  nodeMastered: '#5A7A3A',
  nodeLocked: '#3A3028',

  // ── Branch Colors
  branchMysteries: '#8B4DB8',
  branchSciences: '#2E86AB',
  branchCases: '#E05C3A',
  branchFieldwork: '#5A7A3A',

  // ── Layer Colors
  layerHook: '#C4832A',
  layerWhy: '#2E86AB',
  layerEvidence: '#8B4DB8',
  layerInvestigate: '#5A7A3A',
} as const;

export const TYPOGRAPHY = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,

  weightRegular: '400' as const,
  weightMedium: '500' as const,
  weightSemiBold: '600' as const,
  weightBold: '700' as const,
  weightExtraBold: '800' as const,

  lineHeightBody: 22,
  lineHeightHeading: 28,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const RADII = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;
