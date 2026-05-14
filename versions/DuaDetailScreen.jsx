/**
 * DuaDetailScreen.jsx — Safar
 * Full dua view: Arabic · transliteration · translation
 * toggles · AudioPlayer · bookmark · add to list
 */
import React, { useState, useMemo } from "react";
import {
  SafeAreaView, View, Text, ScrollView,
  TouchableOpacity, StyleSheet, Share,
} from "react-native";
import { colors, spacing, radius, shadows, typography } from "../theme";
import { useAccessibility } from "../AccessibilityContext";
import AudioPlayer from "../components/AudioPlayer";
import { AUDIO_FILES } from "../dua-content";

const SERIF = "SourceSerif4-Regular";
// ── Scholarly footnote ─────────────────────────────────────────────────────────

function ScholarlyFootnote({ style }) {
  return (
    <View style={[fn.wrap, style]}>
      <Text style={fn.text}>
        <Text style={fn.bold}>Sources</Text>{" — "}
        Duas are drawn from Ṣaḥīḥ al-Bukhārī, Ṣaḥīḥ Muslim, Sunan Abī Dāwūd, Sunan al-Tirmidhī, and established scholarly works. Each duʿāʾ is attributed to its primary source. Practice and wording may differ across the four madhabs (Ḥanafī, Mālikī, Shāfiʿī, Ḥanbalī). Consult a qualified scholar for rulings specific to your school of thought.
      </Text>
    </View>
  );
}

const fn = StyleSheet.create({
  wrap: {
    marginHorizontal: spacing(2.5),
    marginTop: spacing(2),
    marginBottom: spacing(1),
    backgroundColor: "#F5EDD8",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#E8D9B8",
    padding: spacing(2),
  },
  text: {
    fontSize: typography.tiny,
    color: "#7A6030",
    lineHeight: 17,
  },
  bold: {
    fontWeight: "600",
  },
});


export default function DuaDetailScreen({ route, navigation }) {
  const { colors } = useAccessibility();
  const s = useMemo(() => createStyles(colors), [colors]);
  const { dua, isBookmarked: initBookmarked = false } = route?.params ?? {};

  const [showArabic,   setShowArabic]   = useState(true);
  const [showTranslit, setShowTranslit] = useState(true);
  const [showTrans,    setShowTrans]    = useState(true);
  const [bookmarked,   setBookmarked]   = useState(initBookmarked);
  const [fontSize,     setFontSize]     = useState("md"); // sm | md | lg

  if (!dua) return null;

  const arabicSize = fontSize === "sm" ? 22 : fontSize === "lg" ? 34 : 28;
  const bodySize   = fontSize === "sm" ? typography.small : fontSize === "lg" ? typography.bodyLg : typography.body;

  const handleShare = async () => {
    await Share.share({
      message: `${dua.title}\n\n${dua.arabic}\n\n${dua.transliteration}\n\n"${dua.translation}"\n\n— ${dua.source}\n\nShared via Safar`,
    });
  };

  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerStage} numberOfLines={1}>{dua.stage}</Text>
        <View style={s.headerRight}>
          <TouchableOpacity onPress={handleShare} style={s.iconBtn}>
            <Text style={s.iconBtnText}>↑</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setBookmarked(b => !b)} style={s.iconBtn}>
            <Text style={[s.iconBtnText, bookmarked && s.bookmarkedIcon]}>
              {bookmarked ? "♥" : "♡"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Title + source */}
        <Text style={s.title}>{dua.title}</Text>
        <Text style={s.source}>{dua.source}</Text>

        {/* Stage pill */}
        {dua.stage && (
          <View style={s.stagePill}>
            <View style={s.stageDot} />
            <Text style={s.stageText}>{dua.stage}</Text>
          </View>
        )}

        {/* Font size controls */}
        <View style={s.fontRow}>
          <Text style={s.fontLabel}>Text size</Text>
          <View style={s.fontBtns}>
            {[["sm","A"],["md","A"],["lg","A"]].map(([key, label], i) => (
              <TouchableOpacity
                key={key}
                style={[s.fontBtn, fontSize === key && s.fontBtnActive]}
                onPress={() => setFontSize(key)}
              >
                <Text style={[
                  s.fontBtnText,
                  { fontSize: 11 + i * 3 },
                  fontSize === key && s.fontBtnTextActive,
                ]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Arabic */}
        {showArabic && (
          <View style={s.arabicBlock}>
            <Text style={[s.arabic, { fontSize: arabicSize, lineHeight: arabicSize * 2 }]}>
              {dua.arabic}
            </Text>
          </View>
        )}

        {/* Transliteration */}
        {showTranslit && dua.transliteration && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>TRANSLITERATION</Text>
            <Text style={[s.translit, { fontSize: bodySize }]}>{dua.transliteration}</Text>
          </View>
        )}

        {/* Translation */}
        {showTrans && dua.translation && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>TRANSLATION</Text>
            <Text style={[s.translation, { fontSize: bodySize }]}>"{dua.translation}"</Text>
          </View>
        )}

        {/* Audio player */}
        <View style={s.audioWrap}>
          <Text style={s.sectionLabel}>AUDIO RECITATION</Text>
          <AudioPlayer duaId={dua.id} audioFiles={AUDIO_FILES} />
        </View>

        {/* Display toggles */}
        <View style={s.togglesCard}>
          <Text style={s.togglesTitle}>Display options</Text>
          {[
            ["Arabic text", showArabic,   setShowArabic],
            ["Transliteration", showTranslit, setShowTranslit],
            ["Translation", showTrans,    setShowTrans],
          ].map(([label, val, setter]) => (
            <View key={label} style={s.toggleRow}>
              <Text style={s.toggleLabel}>{label}</Text>
              <TouchableOpacity
                style={[s.toggle, val && s.toggleOn]}
                onPress={() => setter(v => !v)}
              >
                <View style={[s.knob, val && s.knobOn]} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Add to list */}
        <TouchableOpacity
          style={s.addToListBtn}
          onPress={() => navigation?.navigate?.("AddToList", { dua })}
          activeOpacity={0.88}
        >
          <Text style={s.addToListIcon}>+</Text>
          <Text style={s.addToListText}>Add to a list</Text>
        </TouchableOpacity>

        <ScholarlyFootnote />
        <View style={{ height: spacing(4) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing(2.5), paddingTop: spacing(2), paddingBottom: spacing(1.5),
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  backIcon: { fontSize: 22, color: colors.text },
  headerStage: { fontFamily: SERIF, fontSize: typography.body, color: colors.primary, flex: 1, textAlign: "center" },
  headerRight: { flexDirection: "row", gap: spacing(0.5) },
  iconBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  iconBtnText: { fontSize: 20, color: colors.subtext },
  bookmarkedIcon: { color: colors.accent },

  scroll: { paddingHorizontal: spacing(2.5), paddingTop: spacing(2) },
  title: { fontFamily: SERIF, fontSize: typography.title, color: colors.text, marginBottom: spacing(0.5) },
  source: { fontSize: typography.tiny, color: colors.subtext, marginBottom: spacing(1.5) },

  stagePill: {
    flexDirection: "row", alignItems: "center", gap: spacing(0.75),
    alignSelf: "flex-start", marginBottom: spacing(2),
  },
  stageDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.accent },
  stageText: { fontSize: typography.tiny, color: colors.accent, fontWeight: "600", letterSpacing: 0.8 },

  fontRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: spacing(2),
  },
  fontLabel: { fontSize: typography.tiny, color: colors.subtext },
  fontBtns: { flexDirection: "row", gap: spacing(0.75) },
  fontBtn: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.card, alignItems: "center", justifyContent: "center",
  },
  fontBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  fontBtnText: { color: colors.subtext },
  fontBtnTextActive: { color: "#fff", fontWeight: "600" },

  arabicBlock: {
    backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1,
    borderColor: colors.border, paddingVertical: spacing(3), paddingHorizontal: spacing(2.5),
    marginBottom: spacing(2), ...shadows.card,
  },
  arabic: {
    textAlign: "right", writingDirection: "rtl",
    color: colors.text, fontWeight: "400",
  },

  section: { marginBottom: spacing(2) },
  sectionLabel: {
    fontSize: 10, fontWeight: "700", letterSpacing: 1.8,
    color: colors.accent, marginBottom: spacing(0.75),
  },
  translit: {
    color: colors.subtext, fontStyle: "italic", fontWeight: "300",
    lineHeight: 26,
  },
  translation: {
    color: colors.text, fontWeight: "300", lineHeight: 26,
    fontFamily: SERIF,
  },

  audioWrap: { marginBottom: spacing(2.5) },

  togglesCard: {
    backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.border, padding: spacing(2), marginBottom: spacing(1.5), ...shadows.card,
  },
  togglesTitle: { fontFamily: SERIF, fontSize: typography.body, color: colors.text, marginBottom: spacing(1.5) },
  toggleRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: spacing(1), borderTopWidth: 1, borderTopColor: colors.border,
  },
  toggleLabel: { fontSize: typography.small, color: colors.text },
  toggle: {
    width: 44, height: 24, borderRadius: 12, backgroundColor: colors.border,
    justifyContent: "center", paddingHorizontal: 3,
  },
  toggleOn: { backgroundColor: colors.primary },
  knob: {
    width: 18, height: 18, borderRadius: 9, backgroundColor: colors.card,
    ...shadows.card,
  },
  knobOn: { alignSelf: "flex-end" },

  addToListBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: spacing(1), backgroundColor: "#EBF2EE", borderRadius: radius.md,
    borderWidth: 1, borderColor: "#C8DDD0", paddingVertical: spacing(1.75),
  },
  addToListIcon: { fontSize: 20, color: colors.primary },
  addToListText: { fontSize: typography.body, color: colors.primary, fontWeight: "500" },
});
