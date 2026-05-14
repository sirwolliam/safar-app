/**
 * ProgressScreen.jsx — Safar
 * Step-by-step checklist. Persists via AsyncStorage.
 * Install: npx expo install @react-native-async-storage/async-storage
 */
import React, { useState, useEffect, useMemo } from "react";
import {
  SafeAreaView, View, Text, ScrollView,
  TouchableOpacity, StyleSheet, Dimensions, Image,
} from "react-native";
import Svg, { Rect, Path, Circle, Ellipse, G, Defs, RadialGradient, Stop, Line } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, spacing, radius, shadows, typography } from "../theme";
import { useAccessibility } from "../AccessibilityContext";

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
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: "#F5EDD8",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E8D9B8",
    padding: 16,
  },
  text: {
    fontSize: 12,
    color: "#7A6030",
    lineHeight: 17,
  },
  bold: {
    fontWeight: "600",
  },
});

const { width: SW } = Dimensions.get("window");
const HERO_H = Math.round(SW * 0.375);

// ── Umrah hero — Kaaba + arcade + warm golden hour ────────────────────────────

function UmrahHero({ w, h }) {
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} >
      {/* Sky gradient — warm golden */}
      <Rect width={w} height={h} fill="#E8D8B0"/>
      <Rect width={w} height={h * 0.6} fill="#DFC88A" opacity={0.5}/>

      {/* Sun glow */}
      <Circle cx={w * 0.72} cy={h * 0.35} r={h * 0.28} fill="#F0C84A" opacity={0.18}/>
      <Circle cx={w * 0.72} cy={h * 0.35} r={h * 0.16} fill="#F0C84A" opacity={0.22}/>

      {/* Ground */}
      <Rect x={0} y={h * 0.72} width={w} height={h * 0.28} fill="#D4C498"/>

      {/* Arcade arches — left */}
      {[0.04, 0.11, 0.18].map((x, i) => (
        <G key={i}>
          <Rect x={w*x} y={h*0.38} width={w*0.055} height={h*0.35} rx={2} fill="#C8B880" opacity={0.8}/>
          <Path d={`M${w*x} ${h*0.38} Q${w*(x+0.0275)} ${h*0.26} ${w*(x+0.055)} ${h*0.38}`} fill="#D4C898" opacity={0.9}/>
        </G>
      ))}

      {/* Arcade arches — right */}
      {[0.75, 0.82, 0.89].map((x, i) => (
        <G key={i}>
          <Rect x={w*x} y={h*0.38} width={w*0.055} height={h*0.35} rx={2} fill="#C8B880" opacity={0.8}/>
          <Path d={`M${w*x} ${h*0.38} Q${w*(x+0.0275)} ${h*0.26} ${w*(x+0.055)} ${h*0.38}`} fill="#D4C898" opacity={0.9}/>
        </G>
      ))}

      {/* Mataf floor */}
      <Ellipse cx={w*0.5} cy={h*0.78} rx={w*0.22} ry={h*0.12} fill="#C8B870" opacity={0.5}/>

      {/* Pilgrim crowd dots */}
      {Array.from({length: 28}, (_, i) => {
        const angle = (i / 28) * Math.PI * 2;
        const r = h * 0.13 + (i % 3) * h * 0.04;
        return <Circle key={i} cx={w*0.5 + Math.cos(angle)*r*1.4} cy={h*0.76 + Math.sin(angle)*r*0.6} r={1.8} fill="#8A7840" opacity={0.55}/>;
      })}

      {/* Kaaba */}
      <Rect x={w*0.435} y={h*0.28} width={w*0.13} height={h*0.46} fill="#181008" rx={1}/>
      <Rect x={w*0.435} y={h*0.28} width={w*0.13} height={h*0.46} fill="none" stroke="#C8A840" strokeWidth={1.2} rx={1}/>
      {/* Kiswa band */}
      <Rect x={w*0.435} y={h*0.42} width={w*0.13} height={h*0.09} fill="#C8A840" opacity={0.7}/>
      {/* Door */}
      <Rect x={w*0.484} y={h*0.6} width={w*0.032} height={h*0.14} rx={2} fill="#C8A840" opacity={0.55}/>

      {/* Minarets */}
      {[[0.36, 0.05], [0.64, 0.05]].map(([x, topY], i) => (
        <G key={i}>
          <Rect x={w*x - 3} y={h*topY} width={6} height={h*0.7} rx={2} fill="#C8B880" opacity={0.85}/>
          <Circle cx={w*x} cy={h*topY} r={5} fill="#D4C898"/>
          <Rect x={w*x - 2} y={h*topY - 7} width={4} height={9} rx={1} fill="#C0A860"/>
        </G>
      ))}

      {/* Bottom botanical — left */}
      <Path d={`M${w*0.08} ${h} Q${w*0.06} ${h*0.7} ${w*0.05} ${h*0.5}`} stroke="#8A9860" strokeWidth={1.5} fill="none" strokeLinecap="round"/>
      <Path d={`M${w*0.05} ${h*0.65} Q${w*(-0.01)} ${h*0.55} ${w*0.02} ${h*0.68}`} stroke="#8A9860" strokeWidth={1} fill="#8A9860" fillOpacity={0.3}/>
      <Path d={`M${w*0.05} ${h*0.56} Q${w*0.1} ${h*0.46} ${w*0.09} ${h*0.58}`} stroke="#8A9860" strokeWidth={1} fill="#8A9860" fillOpacity={0.3}/>
    </Svg>
  );
}

// ── Hajj hero — Mount Arafah + pilgrims + open sky ───────────────────────────

function HajjHero({ w, h }) {
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} >
      {/* Sky — soft blue-gold dawn */}
      <Rect width={w} height={h} fill="#D8E0D0"/>
      <Rect width={w} height={h*0.5} fill="#C8D8C0" opacity={0.4}/>

      {/* Distant mountains */}
      <Path d={`M0 ${h*0.65} L${w*0.15} ${h*0.38} L${w*0.32} ${h*0.65} Z`} fill="#B8C8A8" opacity={0.6}/>
      <Path d={`M${w*0.2} ${h*0.65} L${w*0.42} ${h*0.28} L${w*0.64} ${h*0.65} Z`} fill="#A8B898" opacity={0.7}/>
      <Path d={`M${w*0.55} ${h*0.65} L${w*0.72} ${h*0.35} L${w*0.9} ${h*0.65} Z`} fill="#B0C0A0" opacity={0.6}/>
      <Path d={`M${w*0.78} ${h*0.65} L${w*0.9} ${h*0.44} L${w} ${h*0.58} L${w} ${h*0.65} Z`} fill="#A8B890" opacity={0.5}/>

      {/* Jabal al-Rahmah — centre peak (distinctive pillar shape) */}
      <Path d={`M${w*0.44} ${h*0.72} L${w*0.48} ${h*0.18} L${w*0.52} ${h*0.18} L${w*0.56} ${h*0.72} Z`} fill="#98A888" opacity={0.9}/>
      <Rect x={w*0.488} y={h*0.12} width={w*0.024} height={h*0.08} rx={2} fill="#889878" opacity={0.8}/>

      {/* Mist */}
      <Path d={`M0 ${h*0.62} Q${w*0.25} ${h*0.58} ${w*0.5} ${h*0.62} Q${w*0.75} ${h*0.66} ${w} ${h*0.62}`} fill="none" stroke="#fff" strokeWidth={8} opacity={0.3}/>

      {/* Ground — plains of Arafah */}
      <Rect x={0} y={h*0.7} width={w} height={h*0.3} fill="#C8C8A8"/>

      {/* Pilgrims in white — scattered dots and silhouettes */}
      {Array.from({length: 55}, (_, i) => {
        const x = (i * 37 + (i % 5) * 13) % (w - 8) + 4;
        const y = h*0.72 + (i % 4) * h * 0.055;
        const s = 1.2 + (i % 3) * 0.5;
        return <Ellipse key={i} cx={x} cy={y} rx={s} ry={s*2} fill="#F0ECD8" opacity={0.7}/>;
      })}

      {/* Right botanical */}
      <Path d={`M${w*0.92} ${h} Q${w*0.9} ${h*0.65} ${w*0.88} ${h*0.42}`} stroke="#7A8A68" strokeWidth={1.5} fill="none" strokeLinecap="round"/>
      <Path d={`M${w*0.88} ${h*0.58} Q${w*0.96} ${h*0.48} ${w*0.94} ${h*0.6}`} stroke="#7A8A68" strokeWidth={1} fill="#7A8A68" fillOpacity={0.3}/>
      <Path d={`M${w*0.89} ${h*0.48} Q${w*0.82} ${h*0.4} ${w*0.84} ${h*0.52}`} stroke="#7A8A68" strokeWidth={1} fill="#7A8A68" fillOpacity={0.3}/>
    </Svg>
  );
}

const STEPS = {
  Umrah: [
    { id: "u1",  title: "Enter Ihram",           sub: "Make niyyah and recite Talbiyah",        detail: "Perform ghusl, wear ihram garments. At the Miqat, make your intention for Umrah and begin reciting the Talbiyah continuously." },
    { id: "u2",  title: "Recite Talbiyah",        sub: "Continue until first sight of Kaaba",    detail: "Recite Labbayk Allāhumma labbayk continuously throughout your journey. Men recite aloud, women quietly." },
    { id: "u3",  title: "Enter Masjid al-Haram",  sub: "Right foot first, dua at entry",         detail: "Enter with your right foot. Recite the mosque entry dua and proceed with humility." },
    { id: "u4",  title: "Perform Tawaf",          sub: "7 circuits, begin at Black Stone",        detail: "Begin at the Black Stone (Hajar al-Aswad), keeping the Kaaba on your left. Complete 7 circuits. Men should perform Raml (brisk walking) in the first 3 circuits if possible." },
    { id: "u5",  title: "Pray at Maqam Ibrahim",  sub: "2 rakah behind the Maqam",               detail: "After Tawaf, pray 2 rakah behind Maqam Ibrahim. Recite Surah al-Kafirun in the first and Surah al-Ikhlas in the second." },
    { id: "u6",  title: "Drink Zamzam",           sub: "Face Kaaba, make dua",                   detail: "Drink Zamzam water facing the Kaaba. Make dua for beneficial knowledge, provision, and health." },
    { id: "u7",  title: "Perform Saʿy",           sub: "7 passes, Safa to Marwah",               detail: "Begin at Safa. Complete 7 passes between Safa and Marwah (Safa→Marwah = 1 pass). Men should run between the green markers." },
    { id: "u8",  title: "Halq or Taqsir",         sub: "Shave or trim hair to exit Ihram",       detail: "Men: shaving the head (halq) is preferable; trimming at least a fingertip length (taqsir) is the minimum. Women: trim a fingertip length from hair. This completes Umrah." },
  ],
  Hajj: [
    { id: "h1",  title: "Enter Ihram at Miqat",        sub: "8 Dhul Hijjah",                     detail: "Perform ghusl, wear ihram garments at the Miqat. Make intention for Hajj and begin Talbiyah." },
    { id: "h2",  title: "Tawaf al-Qudum",              sub: "Arrival Tawaf upon reaching Makkah", detail: "Perform 7 circuits of Tawaf as a greeting upon arrival. Not obligatory but highly recommended." },
    { id: "h3",  title: "Travel to Mina",              sub: "Morning of 8 Dhul Hijjah",           detail: "Leave for Mina after Fajr on the 8th. Spend the day and night in Mina, praying Dhuhr, Asr, Maghrib, Isha (shortened) and Fajr." },
    { id: "h4",  title: "Travel to Arafah",            sub: "Morning of 9 Dhul Hijjah",           detail: "The most important pillar of Hajj. Arrive by midday. Pray Dhuhr and Asr combined and shortened. Make abundant dua until sunset — this is the greatest day of the year." },
    { id: "h5",  title: "Standing at Arafah",          sub: "Wuquf — remain until sunset",        detail: "Face the Qiblah and make dua, dhikr, and istighfar continuously. The Prophet ﷺ said the best dua is the dua of Arafah." },
    { id: "h6",  title: "Travel to Muzdalifah",        sub: "After sunset on 9 Dhul Hijjah",      detail: "Travel to Muzdalifah after sunset. Pray Maghrib and Isha combined. Collect 49–70 pebbles for the Jamarat. Sleep under the open sky." },
    { id: "h7",  title: "Rami al-Jamarat",             sub: "10 Dhul Hijjah — stone the Aqabah",  detail: "After Fajr, travel back to Mina. Stone Jamrat al-Aqabah with 7 pebbles, saying Allahu Akbar with each throw." },
    { id: "h8",  title: "Sacrifice (Udhiyah / Nahr)",  sub: "10 Dhul Hijjah",                     detail: "Arrange a sacrifice (through an authorized agent if needed). This fulfills the Sunnah of Prophet Ibrahim ﷺ." },
    { id: "h9",  title: "Halq or Taqsir",              sub: "Shave or trim to exit partial Ihram", detail: "Men shave or trim. Women trim a fingertip length. After this you exit partial Ihram — regular clothing is permitted but intimacy remains prohibited until Tawaf Ifadah." },
    { id: "h10", title: "Tawaf al-Ifadah",             sub: "Return to Makkah for main Tawaf",    detail: "This is a pillar (rukn) of Hajj — Hajj is incomplete without it. Perform 7 circuits. Pray 2 rakah at Maqam Ibrahim." },
    { id: "h11", title: "Saʿy between Safa & Marwah",  sub: "If not performed after Qudum",       detail: "Perform 7 passes between Safa and Marwah. Required if not done after Tawaf al-Qudum." },
    { id: "h12", title: "Ayyam al-Tashriq in Mina",   sub: "11–13 Dhul Hijjah",                  detail: "Return to Mina. Stone all three Jamarat each day (21 pebbles/day) after midday. Spend at least 2 nights (11th & 12th). May leave after the 12th if you depart before sunset." },
    { id: "h13", title: "Tawaf al-Wadaʿ",             sub: "Farewell Tawaf before leaving Makkah", detail: "The last act before leaving Makkah. Perform 7 circuits. This is obligatory (wajib) — omitting it requires a dam (penalty)." },
  ],
};

const STORAGE_KEY = "safar_progress_v1";

export default function ProgressScreen({ route, navigation }) {
  const { colors } = useAccessibility();
  const s = useMemo(() => createStyles(colors), [colors]);
  const journey = route?.params?.journey ?? "Umrah";
  const steps   = STEPS[journey] ?? STEPS.Umrah;

  const [completed, setCompleted] = useState(new Set());
  const [expanded,  setExpanded]  = useState(null);

  // Load saved progress
  useEffect(() => {
    AsyncStorage.getItem(`${STORAGE_KEY}_${journey}`)
      .then((val) => { if (val) setCompleted(new Set(JSON.parse(val))); })
      .catch(() => {});
  }, [journey]);

  const toggleStep = (id) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      AsyncStorage.setItem(`${STORAGE_KEY}_${journey}`, JSON.stringify([...next])).catch(() => {});
      return next;
    });
  };

  const pct = Math.round((completed.size / steps.length) * 100);

  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 24 }} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>My {journey} Checklist</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Hero image — kaaba_mixed.png, centred crop showing Kaaba + people */}
      <View style={s.heroWrap}>
        <Image
          source={require("../assets/kaaba_mixed.png")}
          style={s.heroImage}
          resizeMode="cover"
        />
        <View style={s.heroScrim} />
      </View>

      {/* Progress bar */}
      <View style={s.progressCard}>
        <View style={s.progressTop}>
          <Text style={s.progressText}>{completed.size} of {steps.length} steps</Text>
          <Text style={s.progressPct}>{pct}%</Text>
        </View>
        <View style={s.track}>
          <View style={[s.fill, { width: `${pct}%` }]} />
        </View>
        {pct === 100 && (
          <Text style={s.completeMsg}>🌿 Alhamdulillah — journey complete!</Text>
        )}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {steps.map((step, i) => {
          const done = completed.has(step.id);
          const open = expanded === step.id;
          return (
            <View key={step.id} style={done ? [s.stepCard, s.stepCardDone] : s.stepCard}>
              <TouchableOpacity
                style={s.stepRow}
                onPress={() => setExpanded(open ? null : step.id)}
                activeOpacity={0.85}
              >
                <TouchableOpacity style={done ? [s.check, s.checkDone] : s.check} onPress={() => toggleStep(step.id)}>
                  {done && <Text style={s.checkIcon}>✓</Text>}
                  {!done && <Text style={s.stepNum}>{i + 1}</Text>}
                </TouchableOpacity>
                <View style={s.stepInfo}>
                  <Text style={done ? [s.stepTitle, s.stepTitleDone] : s.stepTitle}>{step.title}</Text>
                  <Text style={s.stepSub}>{step.sub}</Text>
                </View>
                <Text style={s.chevron}>{open ? "▲" : "▼"}</Text>
              </TouchableOpacity>
              {open && (
                <View style={s.detail}>
                  <Text style={s.detailText}>{step.detail}</Text>
                  <TouchableOpacity
                    style={s.markBtn}
                    onPress={() => toggleStep(step.id)}
                  >
                    <Text style={s.markBtnText}>
                      {done ? "Mark as incomplete" : "Mark as complete  ✓"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
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
  },
  back: { fontSize: 22, color: colors.text },
  headerTitle: { fontFamily: SERIF, fontSize: 22, color: colors.text },

  heroWrap: {
    height: HERO_H,
    marginBottom: spacing(1.5),
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: HERO_H,
    // Landscape image — resizeMode "cover" centres on the Kaaba + people
  },
  heroScrim: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  progressCard: {
    marginHorizontal: spacing(2.5), backgroundColor: "#EBF2EE", borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: spacing(2), marginBottom: spacing(1.5), ...shadows.card,
  },
  progressTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing(1) },
  progressText: { fontSize: typography.small, color: colors.text, fontWeight: "500" },
  progressPct:  { fontSize: typography.small, color: colors.primary, fontWeight: "600" },
  track: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: "hidden" },
  fill:  { height: "100%", backgroundColor: colors.primary, borderRadius: 3 },
  completeMsg: { fontSize: typography.small, color: colors.primary, marginTop: spacing(1), textAlign: "center" },

  scroll: { paddingHorizontal: spacing(2.5) },
  stepCard: {
    backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.border, marginBottom: spacing(1), overflow: "hidden", ...shadows.card,
  },
  stepCardDone: { opacity: 0.7 },
  stepRow: {
    flexDirection: "row", alignItems: "center",
    padding: spacing(2), gap: spacing(1.5),
  },
  check: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 2,
    borderColor: colors.primary, alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  checkDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkIcon: { fontSize: 16, color: "#fff", fontWeight: "700" },
  stepNum:   { fontSize: typography.small, color: colors.primary, fontWeight: "600" },
  stepInfo:  { flex: 1 },
  stepTitle: { fontFamily: SERIF, fontSize: typography.body, color: colors.text },
  stepTitleDone: { textDecorationLine: "line-through", color: colors.subtext },
  stepSub:   { fontSize: typography.tiny, color: colors.subtext, marginTop: 2 },
  chevron:   { fontSize: 10, color: colors.border },

  detail: {
    paddingHorizontal: spacing(2), paddingBottom: spacing(2),
    borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing(1.5),
  },
  detailText: { fontSize: typography.small, color: colors.text, lineHeight: 22, marginBottom: spacing(1.5) },
  markBtn: {
    backgroundColor: colors.primary, borderRadius: radius.sm,
    paddingVertical: spacing(1.25), alignItems: "center",
  },
  markBtnText: { fontSize: typography.small, color: "#fff", fontWeight: "500" },
});
