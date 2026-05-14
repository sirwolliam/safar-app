/**
 * FocusScreen.jsx — Safar
 * Tawaf / Saʿi mode selector pop-up → counter screen
 */
import React, { useState, useMemo } from "react";
import {
  SafeAreaView, View, Text, TouchableOpacity,
  StyleSheet, Dimensions, Modal,
} from "react-native";
import { colors, spacing, radius, shadows, typography } from "../theme";
import { useAccessibility } from "../AccessibilityContext";

const SERIF = "SourceSerif4-Regular";
const { width: SW } = Dimensions.get("window");

const MODES = {
  Tawaf: { total: 7, unit: "Round", label: "TAWAF", hint: "7 circuits around the Kaaba" },
  Saʿi:  { total: 7, unit: "Pass",  label: "SAʿI",  hint: "7 passes between Ṣafā & Marwah" },
};

const QUICK_DUAS = {
  Tawaf: [
    { id: "bs",  label: "At the Black Stone",    sub: "Duʿā & Remembrance" },
    { id: "int", label: "Intention & Beginning", sub: "Duʿā & Remembrance" },
  ],
  Saʿi: [
    { id: "sf",  label: "Upon Ascending Ṣafā",  sub: "Duʿā & Remembrance" },
    { id: "mw",  label: "At Marwah",             sub: "Duʿā & Remembrance" },
  ],
};


// ── Scholarly footnote ────────────────────────────────────────────────────────
function ScholarlyFootnote({ style }) {
  return (
    <View style={[fn.wrap, style]}>
      <Text style={fn.text}>
        <Text style={fn.bold}>Sources</Text>{" — "}
        {"Duʿāʾs are drawn from Ṣaḥīḥ al-Bukhārī, Ṣaḥīḥ Muslim, Sunan Abī Dāwūd, Sunan al-Tirmidhī, and established scholarly works. Each duʿāʾ is attributed to its primary source. Practice and wording may differ across the four madhabs (Ḥanafī, Mālikī, Shāfiʿī, Ḥanbalī). Consult a qualified scholar for rulings specific to your school of thought."}
      </Text>
    </View>
  );
}

const fn = StyleSheet.create({
  wrap: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: "#F5EDD8",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E8D9B8",
    padding: 16,
  },
  text: { fontSize: 12, color: "#7A6030", lineHeight: 17 },
  bold: { fontWeight: "600" },
});

export default function FocusScreen({ navigation }) {
  const { colors } = useAccessibility();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [mode,        setMode]        = useState(null);
  const [showPicker,  setShowPicker]  = useState(true);
  const [current,     setCurrent]     = useState(1);

  const config = mode ? MODES[mode] : null;

  const handleComplete = () => {
    if (!config) return;
    if (current < config.total) setCurrent(current + 1);
  };

  // ── Mode picker modal ──
  if (showPicker || !mode) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.pickerWrap}>
          <Text style={s.pickerTitle}>Select your practice</Text>
          <Text style={s.pickerSub}>Focus Mode will update based on your selection.</Text>
          {Object.entries(MODES).map(([key, cfg]) => (
            <TouchableOpacity
              key={key}
              style={s.pickerOpt}
              onPress={() => { setMode(key); setCurrent(1); setShowPicker(false); }}
              activeOpacity={0.88}
            >
              <View style={s.pickerOptLeft}>
                <Text style={s.pickerOptTitle}>{key}</Text>
                <Text style={s.pickerOptHint}>{cfg.hint}</Text>
              </View>
              <View style={s.pickerBadge}>
                <Text style={s.pickerBadgeText}>{cfg.total} {cfg.unit}s</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  // ── Counter screen ──
  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => setShowPicker(true)}>
          <Text style={s.headerBtnIcon}>🔊</Text>
          <Text style={s.headerBtnLabel}>Audio</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>★  {config.label}  ★</Text>
          <Text style={s.headerSub}>Count your rounds and recite with full presence</Text>
        </View>
        <TouchableOpacity style={s.headerBtn} onPress={() => { setMode(null); setShowPicker(true); setCurrent(1); }}>
          <Text style={s.headerBtnIcon}>✕</Text>
          <Text style={s.headerBtnLabel}>Exit Focus</Text>
        </TouchableOpacity>
      </View>

      {/* Change practice link */}
      <TouchableOpacity style={s.changePractice} onPress={() => setShowPicker(true)}>
        <Text style={s.changePracticeText}>Switching to {mode === "Tawaf" ? "Saʿi" : "Tawaf"}?  Change practice →</Text>
      </TouchableOpacity>

      {/* Circle counter */}
      <View style={s.circleWrap}>
        <View style={s.circle}>
          <Text style={s.circleNum}>{current}</Text>
          <Text style={s.circleOf}>OF {config.total} {config.unit.toUpperCase()}S</Text>
          <View style={s.circlePill}>
            <Text style={s.circlePillText}>
              {mode === "Tawaf"
                ? `You're on round ${current}`
                : current % 2 === 1
                  ? `${current === 1 ? "Starting at" : "Back to"} Ṣafā`
                  : "Heading to Marwah"
              }
            </Text>
          </View>
        </View>
      </View>

      {/* Dot progress */}
      <View style={s.dots}>
        {Array.from({ length: config.total }, (_, i) => (
          <TouchableOpacity key={i} style={[s.dot, i + 1 === current ? s.dotActive : null]}
            onPress={() => setCurrent(i + 1)}>
            <Text style={[s.dotLabel, i + 1 === current ? s.dotLabelActive : null]}>{i + 1}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* CTA button */}
      <TouchableOpacity style={s.completeBtn} onPress={handleComplete} activeOpacity={0.88}>
        <View style={s.completeBtnLeft}>
          <View style={s.checkCircle}>
            <Text style={s.checkIcon}>✓</Text>
          </View>
          <View>
            <Text style={s.completeBtnTitle}>
              {current < config.total ? `${config.unit} complete` : "All done!"}
            </Text>
            <Text style={s.completeBtnSub}>
              {current < config.total ? `Tap to go to ${config.unit.toLowerCase()} ${current + 1}` : `${config.total} ${config.unit.toLowerCase()}s completed`}
            </Text>
          </View>
        </View>
        {current < config.total && <Text style={s.completeBtnArrow}>›</Text>}
      </TouchableOpacity>

      {/* Quick duas */}
      <Text style={s.quickLabel}>QUICK ACCESS</Text>
      <View style={s.quickRow}>
        {QUICK_DUAS[mode].map((q) => (
          <TouchableOpacity key={q.id} style={s.quickCard}>
            <View style={s.quickIconWrap}>
              <Text style={{ fontSize: 16 }}>{q.id === "bs" || q.id === "sf" ? "🤲" : "◎"}</Text>
            </View>
            <Text style={s.quickTitle}>{q.label}</Text>
            <Text style={s.quickSub}>{q.sub}</Text>
            <Text style={s.quickArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer */}
      <ScholarlyFootnote />
        <View style={s.footer}>
        <Text style={s.footerText}>♡  Take your time. Every step is a sacred practice.</Text>
      </View>

    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  // Picker
  pickerWrap: {
    flex: 1, justifyContent: "center", paddingHorizontal: spacing(2.5), gap: spacing(1.5),
  },
  pickerTitle: { fontFamily: SERIF, fontSize: 28, color: colors.text, textAlign: "center" },
  pickerSub: { fontSize: typography.small, color: colors.subtext, textAlign: "center", marginBottom: spacing(1) },
  pickerOpt: {
    backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1.5,
    borderColor: colors.border, padding: spacing(2.5), flexDirection: "row",
    alignItems: "center", justifyContent: "space-between", ...shadows.card,
  },
  pickerOptLeft: { gap: 4 },
  pickerOptTitle: { fontFamily: SERIF, fontSize: typography.title, color: colors.text },
  pickerOptHint: { fontSize: typography.small, color: colors.subtext },
  pickerBadge: {
    backgroundColor: "#EBF2EE", borderRadius: radius.pill,
    paddingHorizontal: spacing(1.5), paddingVertical: spacing(0.5),
    borderWidth: 1, borderColor: colors.border,
  },
  pickerBadgeText: { fontSize: typography.tiny, color: colors.primary, fontWeight: "500" },

  // Header
  header: {
    flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between",
    paddingHorizontal: spacing(2), paddingTop: spacing(1), paddingBottom: spacing(0.5),
  },
  headerBtn: { alignItems: "center", gap: 3, minWidth: 60 },
  headerBtnIcon: { fontSize: 18, color: colors.text },
  headerBtnLabel: { fontSize: typography.tiny, color: colors.subtext },
  headerCenter: { alignItems: "center", flex: 1 },
  headerTitle: { fontSize: typography.small, fontWeight: "600", color: colors.text, letterSpacing: 1.5 },
  headerSub: { fontSize: 12, color: colors.subtext, marginTop: 2 },

  changePractice: { alignItems: "center", marginBottom: spacing(1) },
  changePracticeText: { fontSize: typography.tiny, color: colors.primary },

  // Circle
  circleWrap: { alignItems: "center", marginVertical: spacing(1.5) },
  circle: {
    width: SW * 0.58, height: SW * 0.58, borderRadius: SW * 0.29,
    borderWidth: 8, borderColor: colors.border,
    borderTopColor: colors.primary, borderRightColor: colors.primary,
    transform: [{ rotate: "-45deg" }], alignItems: "center", justifyContent: "center",
    overflow: "hidden",
  },
  circleNum: {
    fontFamily: SERIF, fontSize: 72, color: colors.primary,
    transform: [{ rotate: "45deg" }], lineHeight: 80,
    textAlign: "center",
  },
  circleOf: {
    fontSize: typography.tiny, fontWeight: "600", color: colors.subtext,
    letterSpacing: 2, transform: [{ rotate: "45deg" }],
    textAlign: "center",
  },
  circlePill: {
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.pill, paddingHorizontal: spacing(1.5), paddingVertical: 4,
    marginTop: spacing(0.75), transform: [{ rotate: "45deg" }],
    alignItems: "center",
  },
  circlePillText: { fontSize: typography.small, color: colors.text, textAlign: "center" },

  // Dots
  dots: { flexDirection: "row", justifyContent: "center", gap: spacing(1), marginBottom: spacing(1.5) },
  dot: {
    width: 34, height: 34, borderRadius: 17, borderWidth: 1,
    borderColor: colors.border, backgroundColor: colors.card, alignItems: "center", justifyContent: "center",
  },
  dotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dotLabel: { fontSize: typography.small, color: colors.subtext },
  dotLabelActive: { color: "#fff", fontWeight: "600" },

  // Complete button
  completeBtn: {
    marginHorizontal: spacing(2.5), backgroundColor: colors.primary, borderRadius: radius.lg,
    padding: spacing(2), flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: spacing(2), ...shadows.button,
  },
  completeBtnLeft: { flexDirection: "row", alignItems: "center", gap: spacing(1.5) },
  checkCircle: {
    width: 34, height: 34, borderRadius: 17, borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)", alignItems: "center", justifyContent: "center",
  },
  checkIcon: { fontSize: 16, color: "#fff" },
  completeBtnTitle: { fontSize: typography.body, fontWeight: "500", color: "#fff" },
  completeBtnSub: { fontSize: typography.small, color: "rgba(255,255,255,0.7)" },
  completeBtnArrow: { fontSize: 26, color: "rgba(255,255,255,0.7)" },

  // Quick duas
  quickLabel: {
    fontSize: typography.tiny, fontWeight: "600", color: colors.subtext,
    letterSpacing: 1.5, textAlign: "center", marginBottom: spacing(1.25),
  },
  quickRow: { flexDirection: "row", paddingHorizontal: spacing(2.5), gap: spacing(1.5), marginBottom: spacing(1.5) },
  quickCard: {
    flex: 1, backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.border, padding: spacing(1.75), gap: 4, ...shadows.card,
  },
  quickIconWrap: {
    width: 36, height: 36, borderRadius: radius.sm, backgroundColor: "#EBF2EE",
    alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  quickTitle: { fontFamily: SERIF, fontSize: typography.small, color: colors.text, lineHeight: 16 },
  quickSub: { fontSize: typography.tiny, color: colors.subtext },
  quickArrow: { fontSize: 14, color: colors.subtext, marginTop: 2 },

  footer: { alignItems: "center", paddingHorizontal: spacing(2.5) },
  footerText: { fontSize: typography.small, color: colors.subtext, textAlign: "center" },
});
