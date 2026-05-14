/**
 * AccessibilityContext.js
 *
 * Provides app-wide accessibility preferences AND a reactive `colors` object
 * so screens can call:
 *
 *   const { colors } = useAccessibility();
 *
 * and get the correct palette whether or not high-contrast mode is on.
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { AccessibilityInfo } from "react-native";

// ── Base palette (matches your existing theme.js) ─────────────────────────────
const BASE_COLORS = {
  background:  "#F5F0E8",
  card:        "#FDFAF4",
  border:      "#E0D8C8",
  text:        "#2A2218",
  subtext:     "#8A7E6A",
  primary:     "#2F5D50",
  accent:      "#C8A96A",
};

// ── High-contrast overrides ───────────────────────────────────────────────────
const HIGH_CONTRAST_COLORS = {
  ...BASE_COLORS,
  background:  "#FFFFFF",
  card:        "#FFFFFF",
  border:      "#999999",
  text:        "#000000",
  subtext:     "#444444",
  primary:     "#1A3D30",
  accent:      "#8B6914",
};

// ─────────────────────────────────────────────────────────────────────────────

const AccessibilityContext = createContext({
  colors:       BASE_COLORS,
  largeText:    false,
  highContrast: false,
  reduceMotion: false,
  toggle:       () => {},
});

export function AccessibilityProvider({ children }) {
  const [largeText,    setLargeText]    = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Respect OS-level reduce-motion setting automatically
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion
    );
    return () => sub?.remove?.();
  }, []);

  const toggle = (key) => {
    if (key === "largeText")    setLargeText((v) => !v);
    if (key === "highContrast") setHighContrast((v) => !v);
    if (key === "reduceMotion") setReduceMotion((v) => !v);
  };

  // Recompute colors only when highContrast changes
  const colors = useMemo(
    () => (highContrast ? HIGH_CONTRAST_COLORS : BASE_COLORS),
    [highContrast]
  );

  return (
    <AccessibilityContext.Provider
      value={{ colors, largeText, highContrast, reduceMotion, toggle }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}

export default AccessibilityContext;
