/**
 * safar-tokens.js
 * Design system tokens for Labbayk / Safar — React Native / Expo
 * Ported from the Safar Design System (Labbayk Design System.html)
 *
 * Palette:  warm parchment backgrounds, forest-green primaries,
 *           antique-gold accents, deep-ink text.
 */

// ─── Primitive palette ────────────────────────────────────────────────────────

export const palette = {
  // Parchment scale
  parchment50:  "#FDFAF4",
  parchment100: "#F7F2E8",
  parchment200: "#EDE6D8",
  parchment300: "#E0D8C8",
  parchment400: "#CEC4B0",
  parchment500: "#B8AA94",

  // Forest green scale
  forest50:  "#EBF0EC",
  forest100: "#C8D8CC",
  forest200: "#8AAA92",
  forest300: "#5A826A",
  forest400: "#3D6B52",
  forest500: "#2F5D50",   // primary
  forest600: "#1E3D34",
  forest700: "#122820",

  // Gold / accent scale
  gold100: "#F5E8C8",
  gold200: "#E8D0A0",
  gold300: "#D4B878",
  gold400: "#C8A96A",   // accent
  gold500: "#A88840",

  // Ink scale
  ink900: "#1A1712",
  ink800: "#2A2620",
  ink700: "#3C3830",
  ink600: "#5A5650",
  ink500: "#7A7670",
  ink400: "#9A9690",
  ink300: "#B8B4AE",
  ink200: "#D4D0CA",
  ink100: "#E8E4DE",

  // Pure
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
};

// ─── Semantic tokens ──────────────────────────────────────────────────────────

export const colors = {
  // Surfaces
  background: palette.parchment100,
  backgroundAlt: palette.parchment50,
  card: palette.parchment50,
  cardAlt: palette.parchment200,
  overlay: "rgba(26,23,18,0.48)",

  // Brand
  primary: palette.forest500,
  primaryLight: palette.forest300,
  primaryDark: palette.forest700,
  primarySurface: palette.forest50,

  // Accent
  accent: palette.gold400,
  accentLight: palette.gold200,
  accentDark: palette.gold500,
  accentSurface: palette.gold100,

  // Text
  text: palette.ink900,
  textSecondary: palette.ink700,
  subtext: palette.ink600,    // darkened for legibility (was ink500 #7A7670)
  placeholder: palette.ink500,  // darkened slightly for input placeholders
  inverse: palette.parchment50,

  // Borders
  border: palette.ink100,
  borderMid: palette.ink200,
  borderStrong: palette.ink300,

  // State
  success: "#4A7C5A",
  warning: "#C8903A",
  error: "#9A3A30",
  info: palette.forest400,

  // Hero / dark surfaces
  heroBackground: "#1A1408",
  heroText: "#F0E8C8",
  heroSubtext: "rgba(240,230,200,0.65)",
  heroMuted: "rgba(240,230,200,0.35)",
};

// ─── Typography ───────────────────────────────────────────────────────────────

export const typography = {
  // Font families — use system serif for Arabic, sans for UI
  fontSans: undefined,        // platform default (SF Pro / Roboto)
  fontSerif: undefined,       // platform default serif
  fontArabic: undefined,      // platform Arabic

  // Scale (sp values)
  xs:      10,
  tiny:    11,
  small:   13,
  body:    15,
  bodyLg:  16,
  heading: 17,
  title:   22,
  display: 28,
  arabic:  26,

  // Line-height multipliers
  tight:   1.2,
  normal:  1.5,
  relaxed: 1.7,
  arabic:  1.9,

  // Weights
  light:    "400",   // bumped from 300 for legibility across all screens
  regular:  "400",
  medium:   "500",
  semibold: "600",
  bold:     "700",
};

// ─── Spacing ──────────────────────────────────────────────────────────────────

const BASE = 8;

/**
 * spacing(n) → n × 8px
 * spacing(0.5) → 4, spacing(1) → 8, spacing(2) → 16 …
 */
export const spacing = (n) => Math.round(n * BASE);

// Named aliases
export const space = {
  xs:   spacing(0.5),   // 4
  sm:   spacing(1),     // 8
  md:   spacing(1.5),   // 12
  base: spacing(2),     // 16
  lg:   spacing(2.5),   // 20
  xl:   spacing(3),     // 24
  xxl:  spacing(4),     // 32
  xxxl: spacing(6),     // 48
};

// ─── Border radii ─────────────────────────────────────────────────────────────

export const radius = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   18,
  xl:   24,
  xxl:  32,
  pill: 999,
};

// ─── Shadows ──────────────────────────────────────────────────────────────────

export const shadows = {
  none: {},

  xs: {
    shadowColor: palette.ink900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },

  card: {
    shadowColor: "#8A6A40",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },

  md: {
    shadowColor: palette.ink900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },

  button: {
    shadowColor: palette.forest500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },

  accent: {
    shadowColor: palette.gold400,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
};

// ─── Animation durations ──────────────────────────────────────────────────────

export const duration = {
  fast:   150,
  normal: 250,
  slow:   400,
  xslow:  600,
};

// ─── Z-index scale ────────────────────────────────────────────────────────────

export const zIndex = {
  base:    0,
  raised:  10,
  overlay: 20,
  modal:   30,
  toast:   40,
};

// ─── Default export (legacy compat) ──────────────────────────────────────────

export default {
  palette,
  colors,
  typography,
  spacing,
  space,
  radius,
  shadows,
  duration,
  zIndex,
};
