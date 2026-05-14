/**
 * FocusScreen.jsx — Safar
 * Tawaf / Saʿi mode selector pop-up → counter screen
 */
import React, { useState, useMemo, useEffect } from "react";
import {
  SafeAreaView, View, Text, TouchableOpacity,
  StyleSheet, Dimensions, Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
    backgroundColor: "#EEE4CB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDD0A8",
    padding: 16,
  },
  text: { fontSize: 12, color: "#6B5020", lineHeight: 17 },
  bold: { fontWeight: "600" },
});

const FOCUS_HISTORY_KEY = "safar_focus_history_v1";

export default function FocusScreen({ navigation }) {
  const { colors } = useAccessibility();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [mode,        setMode]        = useState(null);
  const [showPicker,  setShowPicker]  = useState(true);
  const [current,     setCurrent]     = useState(1);
  const [totalTaps,  setTotalTaps]  = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(FOCUS_HISTORY_KEY).then(v => { if (v) setTotalTaps(parseInt(v) || 0); }).catch(() => {});
  }, []);

  const config = mode ? MODES[mode] : null;

  const handleComplete = () => {
    if (!config) return;
    if (current < config.total) {
      setCurrent(current + 1);
      const newTotal = totalTaps + 1;
      setTotalTaps(newTotal);
      AsyncStorage.setItem(FOCUS_HISTORY_KEY, String(newTotal)).catch(() => {});
      try { Haptics?.impactAsync?.(Haptics?.ImpactFeedbackStyle?.Light); } catch (_) {}
    }
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
          <Text style={s.headerTitle}>{config.label}</Text>
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
      {totalTaps > 0 && (
        <Text style={s.totalCount}>{"Total recitations: " + totalTaps.toLocaleString()}</Text>
      )}
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
  safe: { flex: 1, backgroundColor: "#E8DDD0" },

  // Picker
  pickerWrap: {
    flex: 1, justifyContent: "center", paddingHorizontal: 20, gap: 12,
  },
  pickerTitle: { fontFamily: SERIF, fontSize: 28, color: "#100E0A", textAlign: "center" },
  pickerSub: { fontSize: 14, color: "#3A3530", textAlign: "center", marginBottom: 8 },
  pickerOpt: {
    backgroundColor: "#F5EDE0", borderRadius: 16, borderWidth: 1.5,
    borderColor: "#C8BFB2", padding: 20, flexDirection: "row",
    alignItems: "center", justifyContent: "space-between", shadowColor:"#4A2E10", shadowOffset:{width:0,height:3}, shadowOpacity:0.20, shadowRadius:10, elevation:5,
  },
  pickerOptLeft: { gap: 4 },
  pickerOptTitle: { fontFamily: SERIF, fontSize: 22, color: "#100E0A" },
  pickerOptHint: { fontSize: 14, color: "#3A3530" },
  pickerBadge: {
    backgroundColor: "#E2EDE6", borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderColor: "#C8BFB2",
  },
  pickerBadgeText: { fontSize: 12, color: "#1E3D30", fontWeight: "500" },

  // Header
  header: {
    flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4,
  },
  headerBtn: { alignItems: "center", gap: 3, minWidth: 60 },
  headerBtnIcon: { fontSize: 18, color: "#100E0A" },
  headerBtnLabel: { fontSize: 12, color: "#3A3530" },
  headerCenter: { alignItems: "center", flex: 1 },
  headerTitle: { fontSize: 14, fontWeight: "600", color: "#100E0A", letterSpacing: 1.5 },
  headerSub: { fontSize: 12, color: "#3A3530", marginTop: 2 },

  changePractice: { alignItems: "center", marginBottom: 8 },
  changePracticeText: { fontSize: 12, color: "#1E3D30" },

  // Circle
  circleWrap: { alignItems: "center", marginVertical: 12 },
  circle: {
    width: SW * 0.58, height: SW * 0.58, borderRadius: SW * 0.29,
    borderWidth: 8, borderColor: "#C8BFB2",
    borderTopColor: "#1E3D30", borderRightColor: "#1E3D30",
    transform: [{ rotate: "-45deg" }], alignItems: "center", justifyContent: "center",
    overflow: "hidden",
  },
  circleNum: {
    fontFamily: SERIF, fontSize: 72, color: "#1E3D30",
    transform: [{ rotate: "45deg" }], lineHeight: 80,
    textAlign: "center",
  },
  circleOf: {
    fontSize: 12, fontWeight: "600", color: "#3A3530",
    letterSpacing: 2, transform: [{ rotate: "45deg" }],
    textAlign: "center",
  },
  circlePill: {
    backgroundColor: "#E8DDD0", borderWidth: 1, borderColor: "#C8BFB2",
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4,
    marginTop: 6, transform: [{ rotate: "45deg" }],
    alignItems: "center",
  },
  circlePillText: { fontSize: 14, color: "#100E0A", textAlign: "center" },

  // Dots
  dots: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 12 },
  dot: {
    width: 34, height: 34, borderRadius: 17, borderWidth: 1,
    borderColor: "#C8BFB2", backgroundColor: "#F5EDE0", alignItems: "center", justifyContent: "center",
  },
  dotActive: { backgroundColor: "#1E3D30", borderColor: "#1E3D30" },
  dotLabel: { fontSize: 14, color: "#3A3530" },
  dotLabelActive: { color: "#fff", fontWeight: "600" },

  // Complete button
  totalCount: { fontSize:13, color:"#5C534A", fontWeight:"500", textAlign:"center", marginBottom:12 },
  completeBtn: {
    marginHorizontal: 20, backgroundColor: "#1E3D30", borderRadius: 16,
    padding: 16, flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 16, shadowColor:"#4A2E10", shadowOffset:{width:0,height:3}, shadowOpacity:0.20, shadowRadius:10, elevation:5,
  },
  completeBtnLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  checkCircle: {
    width: 34, height: 34, borderRadius: 17, borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)", alignItems: "center", justifyContent: "center",
  },
  checkIcon: { fontSize: 16, color: "#fff" },
  completeBtnTitle: { fontSize: 16, fontWeight: "500", color: "#fff" },
  completeBtnSub: { fontSize: 14, color: "rgba(255,255,255,0.7)" },
  completeBtnArrow: { fontSize: 26, color: "rgba(255,255,255,0.7)" },

  // Quick duas
  quickLabel: {
    fontSize: 12, fontWeight: "600", color: "#3A3530",
    letterSpacing: 1.5, textAlign: "center", marginBottom: 10,
  },
  quickRow: { flexDirection: "row", paddingHorizontal: 20, gap: 12, marginBottom: 12 },
  quickCard: {
    flex: 1, backgroundColor: "#F5EDE0", borderRadius: 10, borderWidth: 1,
    borderColor: "#C8BFB2", padding: 14, gap: 4, shadowColor:"#4A2E10", shadowOffset:{width:0,height:3}, shadowOpacity:0.20, shadowRadius:10, elevation:5,
  },
  quickIconWrap: {
    width: 36, height: 36, borderRadius: 6, backgroundColor: "#E2EDE6",
    alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  quickTitle: { fontFamily: SERIF, fontSize: 14, color: "#100E0A", lineHeight: 16 },
  quickSub: { fontSize: 12, color: "#3A3530" },
  quickArrow: { fontSize: 14, color: "#3A3530", marginTop: 2 },

  footer: { alignItems: "center", paddingHorizontal: 20 },
  footerText: { fontSize: 14, color: "#3A3530", textAlign: "center" },
});
