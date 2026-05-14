/**
 * SafarCard.jsx
 * Native React Native card component — Safar / Labbayk design system
 *
 * Variants:
 *   default   — parchment card, subtle border + shadow
 *   elevated  — stronger shadow, no border
 *   outlined  — border only, no shadow
 *   filled    — coloured background (primary / accent / custom)
 *   hero      — dark cinematic card for journey/progress
 *   dua       — specialised card for displaying a dua
 */

import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { colors, spacing, radius, shadows, typography } from "../theme";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Generic SafarCard ────────────────────────────────────────────────────────

export function SafarCard({
  children,
  variant = "default",  // default | elevated | outlined | filled
  fillColor,            // when variant="filled", override bg color
  onPress,
  style,
  contentStyle,
  padding = spacing(2.5),
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.985, useNativeDriver: true, speed: 40, bounciness: 3 }).start();

  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start();

  const vs = variantMap[variant] || variantMap.default;
  const cardBg = fillColor || vs.backgroundColor;

  const container = (
    <Animated.View
      style={[
        styles.card,
        vs.shadow,
        {
          backgroundColor: cardBg,
          borderWidth: vs.borderWidth,
          borderColor: vs.borderColor,
          borderRadius: radius.lg,
          padding,
        },
        style,
      ]}
    >
      <View style={contentStyle}>{children}</View>
    </Animated.View>
  );

  if (!onPress) return container;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <Animated.View
          style={[
            styles.card,
            vs.shadow,
            {
              backgroundColor: cardBg,
              borderWidth: vs.borderWidth,
              borderColor: vs.borderColor,
              borderRadius: radius.lg,
              padding,
            },
            style,
          ]}
        >
          <View style={contentStyle}>{children}</View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── DuaCard ─────────────────────────────────────────────────────────────────

export function DuaCard({
  dua,
  showTranslit = true,
  showTranslation = true,
  isBookmarked = false,
  onBookmark,
  style,
}) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  if (!dua) return null;

  return (
    <TouchableOpacity
      style={[duaStyles.card, style]}
      onPress={toggle}
      activeOpacity={0.97}
    >
      {/* Stage pill + bookmark */}
      <View style={duaStyles.topRow}>
        {dua.stage ? (
          <View style={duaStyles.stagePill}>
            <View style={duaStyles.stageDot} />
            <Text style={duaStyles.stageText}>{dua.stage}</Text>
          </View>
        ) : <View />}

        <View style={duaStyles.topRight}>
          {dua.isFeatured && (
            <View style={duaStyles.keyBadge}>
              <Text style={duaStyles.keyText}>KEY</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => onBookmark?.(dua.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[duaStyles.bookmark, isBookmarked && duaStyles.bookmarkActive]}>
              {isBookmarked ? "♥" : "♡"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Title */}
      <Text style={duaStyles.title}>{dua.title}</Text>

      {/* Arabic block */}
      <View style={duaStyles.arabicBlock}>
        <Text style={duaStyles.arabic}>{dua.arabic}</Text>
      </View>

      {/* Expanded content */}
      {expanded && (
        <View style={duaStyles.expanded}>
          {showTranslit && dua.transliteration ? (
            <View style={duaStyles.section}>
              <Text style={duaStyles.sectionLabel}>TRANSLITERATION</Text>
              <Text style={duaStyles.translit}>{dua.transliteration}</Text>
            </View>
          ) : null}

          {showTranslation && dua.translation ? (
            <View style={duaStyles.section}>
              <Text style={duaStyles.sectionLabel}>TRANSLATION</Text>
              <Text style={duaStyles.translation}>"{dua.translation}"</Text>
            </View>
          ) : null}

          {dua.source ? (
            <Text style={duaStyles.source}>{dua.source}</Text>
          ) : null}
        </View>
      )}

      {/* Chevron row */}
      <View style={duaStyles.chevronRow}>
        <View style={duaStyles.divider} />
        <Text style={duaStyles.chevron}>{expanded ? "▲" : "▼"}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── HeroCard ─────────────────────────────────────────────────────────────────

export function HeroCard({ title, eyebrow, progress, progressLabel, onPress, style }) {
  return (
    <TouchableOpacity
      style={[heroStyles.card, style]}
      activeOpacity={0.93}
      onPress={onPress}
    >
      {/* Kaaba illustration */}
      <View style={heroStyles.scene}>
        <View style={heroStyles.kaabaBody}>
          <View style={heroStyles.kiswa} />
          <View style={heroStyles.door} />
        </View>
      </View>

      {/* Content */}
      <View style={heroStyles.content}>
        {eyebrow ? <Text style={heroStyles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={heroStyles.title}>{title}</Text>
        {progress != null && (
          <View style={heroStyles.progRow}>
            <View style={heroStyles.track}>
              <View style={[heroStyles.fill, { width: `${Math.round(progress * 100)}%` }]} />
            </View>
            {progressLabel ? (
              <Text style={heroStyles.progLabel}>{progressLabel}</Text>
            ) : null}
          </View>
        )}
      </View>

      {/* Arrow */}
      <View style={heroStyles.arrow}>
        <Text style={heroStyles.arrowIcon}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Variant map ──────────────────────────────────────────────────────────────

const variantMap = {
  default: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    shadow: shadows.card,
  },
  elevated: {
    backgroundColor: colors.card,
    borderWidth: 0,
    borderColor: "transparent",
    shadow: shadows.md,
  },
  outlined: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.borderMid,
    shadow: shadows.none,
  },
  filled: {
    backgroundColor: colors.primarySurface,
    borderWidth: 0,
    borderColor: "transparent",
    shadow: shadows.none,
  },
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
  },
});

const duaStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(2.5),
    marginBottom: spacing(1.5),
    ...shadows.card,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing(1.25),
  },
  stagePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(0.75),
  },
  stageDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  stageText: {
    fontSize: typography.tiny,
    color: colors.accent,
    fontWeight: typography.semibold,
    letterSpacing: 0.8,
  },
  topRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(1),
  },
  keyBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing(0.75),
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  keyText: {
    fontSize: 9,
    color: colors.card,
    fontWeight: typography.bold,
    letterSpacing: 1,
  },
  bookmark: {
    fontSize: 18,
    color: colors.border,
  },
  bookmarkActive: {
    color: colors.accent,
  },
  title: {
    fontSize: typography.heading,
    fontWeight: typography.medium,
    color: colors.text,
    marginBottom: spacing(1.5),
    lineHeight: typography.heading * 1.35,
  },
  arabicBlock: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(2),
    marginBottom: spacing(1),
    borderWidth: 1,
    borderColor: colors.border,
  },
  arabic: {
    fontSize: 26,
    color: colors.text,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 26 * 1.9,
    fontWeight: typography.regular,
  },
  expanded: {
    marginTop: spacing(1),
  },
  section: {
    marginBottom: spacing(1.5),
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: typography.semibold,
    letterSpacing: 1.8,
    color: colors.accent,
    marginBottom: spacing(0.5),
  },
  translit: {
    fontSize: typography.small,
    color: colors.subtext,
    fontStyle: "italic",
    lineHeight: typography.small * 1.7,
    fontWeight: typography.light,
  },
  translation: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: typography.body * 1.65,
    fontWeight: typography.light,
  },
  source: {
    fontSize: typography.tiny,
    color: colors.subtext,
    marginTop: spacing(0.5),
    opacity: 0.7,
  },
  chevronRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing(1),
    gap: spacing(1),
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  chevron: {
    fontSize: 9,
    color: colors.border,
    fontWeight: typography.semibold,
  },
});

const heroStyles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    overflow: "hidden",
    height: 200,
    backgroundColor: "#1A1408",
    ...shadows.card,
    position: "relative",
  },
  scene: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#1C1A10",
    alignItems: "center",
    justifyContent: "center",
  },
  kaabaBody: {
    width: 80,
    height: 96,
    backgroundColor: "#100E08",
    borderWidth: 1,
    borderColor: "rgba(200,169,106,0.5)",
    position: "relative",
  },
  kiswa: {
    position: "absolute",
    top: 24,
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: "rgba(200,169,106,0.55)",
  },
  door: {
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
    width: 16,
    height: 26,
    backgroundColor: "rgba(200,169,106,0.5)",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  content: {
    position: "absolute",
    bottom: spacing(2),
    left: spacing(2),
    right: spacing(5),
  },
  eyebrow: {
    fontSize: typography.tiny,
    color: "rgba(240,230,200,0.65)",
    fontWeight: typography.light,
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 20,
    fontWeight: typography.regular,
    color: "#F0E8C8",
    marginBottom: spacing(1),
  },
  progRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(1),
  },
  track: {
    flex: 1,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 1,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: 1,
  },
  progLabel: {
    fontSize: typography.tiny,
    color: "rgba(240,230,200,0.5)",
  },
  arrow: {
    position: "absolute",
    bottom: spacing(2),
    right: spacing(2),
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(240,230,200,0.3)",
    backgroundColor: "rgba(240,230,200,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowIcon: {
    fontSize: 16,
    color: "rgba(240,230,200,0.8)",
    lineHeight: 20,
  },
});
