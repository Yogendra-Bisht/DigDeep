// ============================================================
// DigDeep — Design System: Colors & Typography
// ============================================================
// Earth-toned palette designed for WCAG AAA contrast under
// direct sunlight (outdoor readability requirement from NFR 7.4)
// ============================================================

export const COLORS = {
  // ── Backgrounds (Midnight Lapis & Obsidian Slate)
  bg: '#0B101B',
  bgSurface: '#131B2E',

  // ── Text
  textPrimary: '#F8F4E8',
  textSecondary: '#B4C0D3',
  textMuted: '#6D7D99',

  // ── Accent & Brand (Burnished Gold & Turquoise)
  accent: '#E6B34A',
  sand: '#F5CE78',
  moss: '#2DD4BF',

  // ── Cards & Surfaces
  cardActive: '#1A243B',
  cardLocked: '#101726',
  cardSelected: '#23304F',

  // ── Borders
  border: '#26334D',
  borderActive: '#E6B34A',

  // ── Node Status
  nodeUnlocked: '#E6B34A',
  nodeMastered: '#34D399',
  nodeLocked: '#2A364F',

  // ── Branch Colors (Eye-Catching Jewel Tones)
  branchMysteries: '#B469FF',   // Royal Amethyst
  branchSciences: '#38BDF8',    // Celestial Cyan
  branchCases: '#FF6B57',       // Terracotta Coral
  branchFieldwork: '#2DD4BF',   // Jade Turquoise

  // ── Layer / Section Colors
  layerHook: '#E6B34A',
  layerWhy: '#38BDF8',
  layerEvidence: '#B469FF',
  layerInvestigate: '#2DD4BF',
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

// ── Ancient Manuscript / Aged Parchment Codex Palette ─────────
export const PARCHMENT = {
  paper: '#F3E5C6',         // Warm aged vellum
  paperDark: '#E6D2A8',     // Margin / deckle edge / inset frame
  paperShadow: '#CBB182',   // Spine crease & page-stack shadow
  paperHighlight: '#FAF2DF',// Illuminated card highlight
  inkPrimary: '#2A1B0E',    // Iron-gall dark sepia ink
  inkSecondary: '#583E26',  // Faded brown ink
  inkMuted: '#7E6449',      // Marginalia / pencil annotations
  rubric: '#8B261D',        // Vermilion rubricated drop-caps & stamps
  goldLeaf: '#B48322',      // Illuminated gold border & seals
  waxSeal: '#7D1E18',       // Crimson wax stamp
  border: '#A98A5B',        // Hand-ruled sepia border
  borderDouble: '#7A5B34',  // Outer double-rule border
} as const;

export const FONTS = {
  // Native platform font families — zero extra native linking required
  handwriting: 'cursive' as const,
  serif: 'serif' as const,
  mono: 'monospace' as const,
} as const;
