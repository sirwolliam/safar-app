import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { colors, spacing, radius, typography, shadows } from "../theme";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * DuaCard
 *
 * Props:
 *   dua: {
 *     id: string,
 *     title: string,           // e.g. "Upon Beginning Tawaf"
 *     arabic: string,          // Arabic text
 *     transliteration: string, // Latin romanisation
 *     translation: string,     // English meaning
 *     source: string,          // e.g. "Sunan Abi Dawud 2/177"
 *     stage?: string,          // e.g. "Tawaf · Round 1"  (optional eyebrow)
 *     isFeatured?: boolean,
 *   }
 *   showTranslit?: boolean     // controlled externally (default true)
 *   showTranslation?: boolean  // controlled externally (default true)
 *   onBookmark?: (id) => void
 *   isBookmarked?: boolean
 */
export default function DuaCard({
  dua = PLACEHOLDER_DUA,
  showTranslit = true,
  showTranslation = true,
  onBookmark,
  isBookmarked = false,
}) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={toggle}
      activeOpacity={0.97}
    >
      {/* ── Top row: stage label + bookmark ── */}
      <View style={styles.topRow}>
        {dua.stage ? (
          <View style={styles.stagePill}>
            <View style={styles.stageDot} />
            <Text style={styles.stageText}>{dua.stage}</Text>
          </View>
        ) : (
          <View />
        )}

        <View style={styles.topRight}>
          {dua.isFeatured && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>KEY</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => onBookmark?.(dua.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.bookmark, isBookmarked && styles.bookmarkActive]}>
              {isBookmarked ? "♥" : "♡"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Title ── */}
      <Text style={styles.title}>{dua.title}</Text>

      {/* ── Arabic ── */}
      <View style={styles.arabicBlock}>
        <Text style={styles.arabic}>{dua.arabic}</Text>
      </View>

      {/* ── Expanded: transliteration + translation ── */}
      {expanded && (
        <View style={styles.expandedContent}>
          {showTranslit && dua.transliteration ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>TRANSLITERATION</Text>
              <Text style={styles.translit}>{dua.transliteration}</Text>
            </View>
          ) : null}

          {showTranslation && dua.translation ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>TRANSLATION</Text>
              <Text style={styles.translation}>"{dua.translation}"</Text>
            </View>
          ) : null}

          {dua.source ? (
            <Text style={styles.source}>{dua.source}</Text>
          ) : null}
        </View>
      )}

      {/* ── Expand / collapse chevron ── */}
      <View style={styles.chevronRow}>
        <View style={styles.divider} />
        <Text style={styles.chevron}>{expanded ? "▲" : "▼"}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Placeholder so the card renders without props ─────────────────────────────
const PLACEHOLDER_DUA = {
  id: "placeholder",
  title: "Upon Beginning Tawaf",
  stage: "Tawaf · Round 1",
  arabic:
    "اللَّهُمَّ إِيمَانًا بِكَ وَتَصْدِيقًا بِكِتَابِكَ وَوَفَاءً بِعَهْدِكَ",
  transliteration:
    "Allāhumma īmānan bika wa taṣdīqan bikitābika wa wafāʾan biʿahdika",
  translation:
    "O Allah, with faith in You, confirmation of Your Book, and fulfillment of Your covenant.",
  source: "Sunan Abī Dāwūd · 2/177",
  isFeatured: true,
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(2.5),
    marginBottom: spacing(1.5),
    ...shadows.card,
  },

  // Top row
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
    fontSize: 12,
    color: colors.accent,
    fontWeight: "500",
    letterSpacing: 0.8,
  },
  topRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(1),
  },
  featuredBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing(0.75),
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  featuredText: {
    fontSize: 9,
    color: colors.card,
    fontWeight: "700",
    letterSpacing: 1,
  },
  bookmark: {
    fontSize: 18,
    color: colors.border,
  },
  bookmarkActive: {
    color: colors.accent,
  },

  // Title
  title: {
    fontSize: 18,
    fontWeight: "500",
    color: colors.text,
    marginBottom: spacing(1.5),
    lineHeight: 24,
  },

  // Arabic
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
    fontSize: 28,
    color: colors.text,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 53,
    fontWeight: "400",
  },

  // Expanded sections
  expandedContent: {
    marginTop: spacing(1),
  },
  section: {
    marginBottom: spacing(1.5),
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 1.8,
    color: colors.accent,
    marginBottom: spacing(0.5),
  },
  translit: {
    fontSize: 14,
    color: colors.subtext,
    fontStyle: "italic",
    lineHeight: 24,
    fontWeight: "300",
  },
  translation: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 26,
    fontWeight: "300",
  },
  source: {
    fontSize: 12,
    color: colors.subtext,
    marginTop: spacing(0.5),
    opacity: 0.7,
  },

  // Chevron
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
    fontWeight: "600",
  },
});
