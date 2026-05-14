/**
 * SafarIcons.jsx
 * Safar / Labbayk design system — React Native icon set
 *
 * All icons are pure React Native (View + StyleSheet).
 * No SVG dependency required — uses geometric primitives.
 * For higher fidelity, swap inner renderIcon() bodies with react-native-svg paths.
 *
 * Usage:
 *   import { SafarIcon } from "./SafarIcons";
 *   <SafarIcon name="kaaba" size={24} color={colors.primary} />
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme";

// ─── Icon registry ────────────────────────────────────────────────────────────
// Each value is a render function: (size, color) => ReactNode

const ICONS = {
  // Navigation
  home:     (s, c) => <Text style={{ fontSize: s * 0.85, color: c, lineHeight: s }}>⌂</Text>,
  journey:  (s, c) => <CircleIcon size={s} color={c} inner />,
  play:     (s, c) => <Text style={{ fontSize: s * 0.75, color: c, lineHeight: s }}>▶</Text>,
  lists:    (s, c) => <Text style={{ fontSize: s * 0.85, color: c, lineHeight: s }}>♡</Text>,
  listsOn:  (s, c) => <Text style={{ fontSize: s * 0.85, color: c, lineHeight: s }}>♥</Text>,
  profile:  (s, c) => <CircleIcon size={s} color={c} />,

  // Sacred
  kaaba:    (s, c) => <KaabaIcon size={s} color={c} />,
  map:      (s, c) => <Text style={{ fontSize: s * 0.8, color: c, lineHeight: s }}>📍</Text>,
  library:  (s, c) => <Text style={{ fontSize: s * 0.8, color: c, lineHeight: s }}>📖</Text>,
  compass:  (s, c) => <CompassIcon size={s} color={c} />,

  // Actions
  bookmark:   (s, c) => <Text style={{ fontSize: s * 0.85, color: c, lineHeight: s }}>♡</Text>,
  bookmarked: (s, c) => <Text style={{ fontSize: s * 0.85, color: c, lineHeight: s }}>♥</Text>,
  share:      (s, c) => <Text style={{ fontSize: s * 0.75, color: c, lineHeight: s }}>↑</Text>,
  copy:       (s, c) => <Text style={{ fontSize: s * 0.75, color: c, lineHeight: s }}>⎘</Text>,
  search:     (s, c) => <Text style={{ fontSize: s * 0.8,  color: c, lineHeight: s }}>🔍</Text>,
  filter:     (s, c) => <FilterIcon size={s} color={c} />,
  close:      (s, c) => <Text style={{ fontSize: s * 0.7,  color: c, lineHeight: s }}>✕</Text>,
  check:      (s, c) => <Text style={{ fontSize: s * 0.75, color: c, lineHeight: s }}>✓</Text>,
  plus:       (s, c) => <Text style={{ fontSize: s * 0.9,  color: c, lineHeight: s }}>+</Text>,

  // Chevrons
  right:  (s, c) => <Text style={{ fontSize: s * 0.8, color: c, lineHeight: s }}>›</Text>,
  left:   (s, c) => <Text style={{ fontSize: s * 0.8, color: c, lineHeight: s }}>‹</Text>,
  down:   (s, c) => <Text style={{ fontSize: s * 0.5, color: c, lineHeight: s }}>▼</Text>,
  up:     (s, c) => <Text style={{ fontSize: s * 0.5, color: c, lineHeight: s }}>▲</Text>,

  // Status / misc
  bell:     (s, c) => <Text style={{ fontSize: s * 0.8, color: c, lineHeight: s }}>🔔</Text>,
  moon:     (s, c) => <Text style={{ fontSize: s * 0.8, color: c, lineHeight: s }}>🌙</Text>,
  leaf:     (s, c) => <Text style={{ fontSize: s * 0.8, color: c, lineHeight: s }}>🌿</Text>,
  sparkle:  (s, c) => <Text style={{ fontSize: s * 0.8, color: c, lineHeight: s }}>✨</Text>,
  hands:    (s, c) => <Text style={{ fontSize: s * 0.8, color: c, lineHeight: s }}>🤲</Text>,
  group:    (s, c) => <Text style={{ fontSize: s * 0.8, color: c, lineHeight: s }}>👥</Text>,
};

// ─── Geometric sub-components ─────────────────────────────────────────────────

function CircleIcon({ size, color, inner }) {
  return (
    <View style={{
      width: size, height: size,
      borderRadius: size / 2,
      borderWidth: 1.5,
      borderColor: color,
      alignItems: "center",
      justifyContent: "center",
    }}>
      {inner && (
        <View style={{
          width: size * 0.35,
          height: size * 0.35,
          borderRadius: (size * 0.35) / 2,
          backgroundColor: color,
        }} />
      )}
    </View>
  );
}

function KaabaIcon({ size, color }) {
  const s = size;
  return (
    <View style={{
      width: s * 0.6, height: s * 0.75,
      borderWidth: 1.5,
      borderColor: color,
      backgroundColor: "transparent",
      position: "relative",
      alignSelf: "center",
    }}>
      {/* Kiswa band */}
      <View style={{
        position: "absolute",
        top: "28%",
        left: 0, right: 0,
        height: "18%",
        backgroundColor: color,
        opacity: 0.6,
      }} />
      {/* Door */}
      <View style={{
        position: "absolute",
        bottom: 0,
        alignSelf: "center",
        width: "30%",
        height: "28%",
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
        backgroundColor: color,
        opacity: 0.55,
      }} />
    </View>
  );
}

function CompassIcon({ size, color }) {
  return (
    <View style={{
      width: size, height: size,
      borderRadius: size / 2,
      borderWidth: 1.5,
      borderColor: color,
      alignItems: "center",
      justifyContent: "center",
    }}>
      <View style={{
        width: 2,
        height: size * 0.55,
        backgroundColor: color,
        transform: [{ rotate: "45deg" }],
        opacity: 0.7,
      }} />
    </View>
  );
}

function FilterIcon({ size, color }) {
  const lineH = 1.5;
  const gap = size * 0.22;
  return (
    <View style={{ width: size, height: size, justifyContent: "center", gap: gap * 0.6 }}>
      {[size * 0.9, size * 0.65, size * 0.4].map((w, i) => (
        <View key={i} style={{
          width: w,
          height: lineH,
          backgroundColor: color,
          alignSelf: "center",
          borderRadius: 1,
        }} />
      ))}
    </View>
  );
}

// ─── SafarIcon ────────────────────────────────────────────────────────────────

export function SafarIcon({
  name,
  size = 22,
  color = colors.text,
  style,
}) {
  const renderer = ICONS[name];
  if (!renderer) {
    // Fallback to a placeholder dot
    return (
      <View style={[{
        width: size, height: size,
        borderRadius: size / 2,
        backgroundColor: colors.border,
      }, style]} />
    );
  }

  return (
    <View style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, style]}>
      {renderer(size, color)}
    </View>
  );
}

// ─── SafarIconButton ──────────────────────────────────────────────────────────

export function SafarIconButton({
  name,
  size = 22,
  color,
  onPress,
  style,
  hitSlop = { top: 8, bottom: 8, left: 8, right: 8 },
  variant = "ghost",  // ghost | filled | outlined
}) {
  const btnColor = color || (variant === "filled" ? colors.inverse : colors.text);
  const containerSize = size * 2;

  const containerStyle = {
    width: containerSize,
    height: containerSize,
    borderRadius: containerSize / 2,
    alignItems: "center",
    justifyContent: "center",
    ...(variant === "filled" && {
      backgroundColor: colors.primary,
    }),
    ...(variant === "outlined" && {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    }),
  };

  return (
    <View
      style={[containerStyle, style]}
      hitSlop={hitSlop}
    >
      {onPress ? (
        <View>
          <SafarIcon name={name} size={size} color={btnColor} />
        </View>
      ) : (
        <SafarIcon name={name} size={size} color={btnColor} />
      )}
    </View>
  );
}

export default SafarIcon;
export { ICONS };
