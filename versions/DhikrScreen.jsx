/**
 * DhikrScreen.jsx — Safar
 *
 * Clean dhikr counter. Low cognitive load — one thing to do: remember Allah.
 *
 * - Dhikr selector (dropdown) — most popular dhikrs
 * - Large thin counter number
 * - + (large centre), − (left), reset (right)
 * - Duration selector: Session / Minutes / Hour / Day
 * - Translation shown below counter
 * - Info button opens significance overlay
 * - No settings icon, no emoji, no clutter
 */
import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView, View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Modal, TouchableWithoutFeedback, Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, CaretDown, ArrowCounterClockwise, Info, X } from "phosphor-react-native";
import { spacing } from "../theme";

// ── Design tokens ─────────────────────────────────────────────────────────────
const BG       = "#0F2318";   // deep forest green — immersive, calming
const SURFACE  = "#1A3028";   // slightly lighter for cards
const GOLD     = "#C8A96A";
const MUTED    = "rgba(200,185,160,0.55)";
const WHITE    = "#F5F0E8";
const SERIF    = "SourceSerif4-Regular";

// ── Dhikr list ────────────────────────────────────────────────────────────────
const DHIKRS = [
  {
    id: "subhanallah",
    arabic:  "سُبْحَانَ اللَّهِ",
    translit:"SubhanAllah",
    en:      "Glory be to Allah",
    meaning: "An expression of Allah's perfection and freedom from all imperfection. Said to glorify and praise Allah.",
    significance: "The Prophet ﷺ said: 'Two words are light on the tongue, heavy on the scales, and beloved to the Most Merciful — SubhanAllahi wa bihamdihi, SubhanAllahil Azeem.' (Bukhari 6406)",
    target: 33,
  },
  {
    id: "alhamdulillah",
    arabic:  "الْحَمْدُ لِلَّهِ",
    translit:"Alhamdulillah",
    en:      "All praise is due to Allah",
    meaning: "An expression of gratitude and praise to Allah for all His blessings, seen and unseen.",
    significance: "The Prophet ﷺ said: 'Alhamdulillah fills the scales.' (Muslim 223)",
    target: 33,
  },
  {
    id: "allahuakbar",
    arabic:  "اللَّهُ أَكْبَرُ",
    translit:"Allahu Akbar",
    en:      "Allah is the Greatest",
    meaning: "A declaration that Allah is greater than everything — greater than all worries, fears, and distractions.",
    significance: "Together with SubhanAllah and Alhamdulillah, these three form the tasbih after each prayer — 33 times each — completing 99 praises of Allah.",
    target: 33,
  },
  {
    id: "lailahaillallah",
    arabic:  "لَا إِلَٰهَ إِلَّا اللَّهُ",
    translit:"La ilaha illallah",
    en:      "There is no god but Allah",
    meaning: "The declaration of the Oneness of Allah — the foundation of all Islamic belief and the most virtuous dhikr.",
    significance: "The Prophet ﷺ said: 'The best dhikr is La ilaha illallah.' (Tirmidhi 3383)",
    target: 100,
  },
  {
    id: "astaghfirullah",
    arabic:  "أَسْتَغْفِرُ اللَّهَ",
    translit:"Astaghfirullah",
    en:      "I seek forgiveness from Allah",
    meaning: "A supplication for forgiveness. Said to cleanse the heart and seek Allah's mercy.",
    significance: "The Prophet ﷺ said he sought forgiveness more than 70 times a day. Istighfar opens doors of mercy and removes distress. (Bukhari 6307)",
    target: 100,
  },
  {
    id: "subhanallahiwabihamdih",
    arabic:  "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    translit:"SubhanAllahi wa bihamdih",
    en:      "Glory be to Allah and praise be to Him",
    meaning: "A combined glorification and praise — acknowledging Allah's perfection while thanking Him.",
    significance: "The Prophet ﷺ said whoever says this 100 times in a day will have his sins forgiven even if they were as much as the foam of the sea. (Bukhari 6405)",
    target: 100,
  },
  {
    id: "hasbiallah",
    arabic:  "حَسْبِيَ اللَّهُ",
    translit:"HasbiAllah",
    en:      "Allah is sufficient for me",
    meaning: "An expression of complete trust and reliance on Allah, especially in times of difficulty or fear.",
    significance: "The Prophet Ibrahim ﷺ said this as he was thrown into the fire. It is a dhikr of complete tawakkul — trusting Allah entirely. (Bukhari 4563)",
    target: 7,
  },
  {
    id: "salawat",
    arabic:  "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ",
    translit:"Allahumma salli 'ala Muhammad",
    en:      "O Allah, send blessings upon Muhammad",
    meaning: "Sending peace and blessings upon the Prophet ﷺ. One of the most beloved acts to Allah.",
    significance: "The Prophet ﷺ said: 'Whoever sends one blessing upon me, Allah will send ten blessings upon him.' (Muslim 408)",
    target: 100,
  },
];

const DURATIONS = [
  { key: "session", label: "This Session" },
  { key: "minutes", label: "15 Minutes"  },
  { key: "hour",    label: "1 Hour"      },
  { key: "day",     label: "For a Day"   },
];

// ── Info overlay ──────────────────────────────────────────────────────────────
function InfoOverlay({ dhikr, onClose }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue:1, duration:200, useNativeDriver:true }).start();
  }, []);
  const close = () => {
    Animated.timing(fadeAnim, { toValue:0, duration:160, useNativeDriver:true }).start(onClose);
  };
  return (
    <Modal transparent animationType="none" onRequestClose={close}>
      <Animated.View style={[ov.backdrop, { opacity: fadeAnim }]}>
        <TouchableWithoutFeedback onPress={close}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
        <View style={ov.sheet}>
          <TouchableOpacity style={ov.closeBtn} onPress={close} activeOpacity={0.8}>
            <X size={16} color={MUTED} weight="regular" />
          </TouchableOpacity>
          <Text style={ov.arabic}>{dhikr.arabic}</Text>
          <Text style={ov.translit}>{dhikr.translit}</Text>
          <View style={ov.divider} />
          <Text style={ov.sectionLabel}>Meaning</Text>
          <Text style={ov.body}>{dhikr.meaning}</Text>
          <Text style={[ov.sectionLabel, { marginTop: 16 }]}>Significance</Text>
          <Text style={ov.body}>{dhikr.significance}</Text>
        </View>
      </Animated.View>
    </Modal>
  );
}

const ov = StyleSheet.create({
  backdrop:  { flex:1, backgroundColor:"rgba(0,0,0,0.65)", justifyContent:"flex-end" },
  sheet:     { backgroundColor:SURFACE, borderTopLeftRadius:24, borderTopRightRadius:24, padding:28, paddingBottom:40 },
  closeBtn:  { position:"absolute", top:16, right:16, width:32, height:32, borderRadius:16, backgroundColor:"rgba(255,255,255,0.08)", alignItems:"center", justifyContent:"center" },
  arabic:    { fontFamily:SERIF, fontSize:26, color:WHITE, textAlign:"center", marginTop:8, marginBottom:6, writingDirection:"rtl" },
  translit:  { fontSize:15, color:GOLD, textAlign:"center", fontStyle:"italic", marginBottom:16 },
  divider:   { height:1, backgroundColor:"rgba(200,185,160,0.18)", marginBottom:16 },
  sectionLabel:{ fontSize:12, fontWeight:"700", color:GOLD, letterSpacing:1, textTransform:"uppercase", marginBottom:6 },
  body:      { fontSize:15, color:"rgba(245,240,232,0.80)", lineHeight:23 },
});

// ── Dhikr selector sheet ───────────────────────────────────────────────────────
function DhikrSelector({ selected, onSelect, onClose }) {
  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={sel.backdrop} />
      </TouchableWithoutFeedback>
      <View style={sel.sheet}>
        <View style={sel.handle} />
        <Text style={sel.title}>Select Dhikr</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {DHIKRS.map(d => (
            <TouchableOpacity
              key={d.id}
              style={[sel.row, d.id === selected.id && sel.rowActive]}
              onPress={() => { onSelect(d); onClose(); }}
              activeOpacity={0.8}
            >
              <View style={sel.rowLeft}>
                <Text style={sel.rowArabic}>{d.arabic}</Text>
                <Text style={sel.rowTranslit}>{d.translit}</Text>
                <Text style={sel.rowEn}>{d.en}</Text>
              </View>
              {d.id === selected.id && <View style={sel.dot} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const sel = StyleSheet.create({
  backdrop: { flex:1, backgroundColor:"rgba(0,0,0,0.5)" },
  sheet:    { backgroundColor:SURFACE, borderTopLeftRadius:24, borderTopRightRadius:24, maxHeight:"75%", paddingBottom:32 },
  handle:   { width:36, height:4, borderRadius:2, backgroundColor:"rgba(200,185,160,0.35)", alignSelf:"center", marginTop:10, marginBottom:4 },
  title:    { fontFamily:SERIF, fontSize:20, color:WHITE, textAlign:"center", paddingVertical:14, borderBottomWidth:1, borderBottomColor:"rgba(200,185,160,0.15)" },
  row:      { paddingHorizontal:24, paddingVertical:16, borderBottomWidth:1, borderBottomColor:"rgba(200,185,160,0.10)", flexDirection:"row", alignItems:"center" },
  rowActive:{ backgroundColor:"rgba(200,169,106,0.10)" },
  rowLeft:  { flex:1, gap:3 },
  rowArabic:{ fontFamily:SERIF, fontSize:20, color:WHITE, writingDirection:"rtl" },
  rowTranslit:{ fontSize:13, color:GOLD, fontStyle:"italic" },
  rowEn:    { fontSize:12, color:MUTED },
  dot:      { width:8, height:8, borderRadius:4, backgroundColor:GOLD },
});

// ── Duration selector ─────────────────────────────────────────────────────────
function DurationSelector({ selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const current = DURATIONS.find(d => d.key === selected) ?? DURATIONS[0];
  return (
    <>
      <TouchableOpacity style={dur.btn} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <Text style={dur.label}>{current.label}</Text>
        <CaretDown size={14} color={MUTED} weight="regular" />
      </TouchableOpacity>
      {open && (
        <Modal transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <TouchableWithoutFeedback onPress={() => setOpen(false)}>
            <View style={dur.backdrop} />
          </TouchableWithoutFeedback>
          <View style={dur.sheet}>
            {DURATIONS.map(d => (
              <TouchableOpacity key={d.key} style={dur.row} onPress={() => { onSelect(d.key); setOpen(false); }} activeOpacity={0.8}>
                <Text style={[dur.rowTxt, d.key === selected && dur.rowTxtActive]}>{d.label}</Text>
                {d.key === selected && <View style={dur.rowDot} />}
              </TouchableOpacity>
            ))}
          </View>
        </Modal>
      )}
    </>
  );
}

const dur = StyleSheet.create({
  btn:       { flexDirection:"row", alignItems:"center", gap:8, backgroundColor:SURFACE, borderRadius:50, paddingHorizontal:20, paddingVertical:12, borderWidth:1, borderColor:"rgba(200,185,160,0.20)", alignSelf:"center" },
  label:     { fontSize:15, color:WHITE, fontWeight:"400" },
  backdrop:  { flex:1, backgroundColor:"rgba(0,0,0,0.4)" },
  sheet:     { position:"absolute", bottom:80, alignSelf:"center", backgroundColor:"#1A3028", borderRadius:16, borderWidth:1, borderColor:"rgba(200,185,160,0.20)", overflow:"hidden", minWidth:200 },
  row:       { paddingHorizontal:24, paddingVertical:14, flexDirection:"row", alignItems:"center", justifyContent:"space-between" },
  rowTxt:    { fontSize:16, color:WHITE },
  rowTxtActive:{ color:GOLD, fontWeight:"500" },
  rowDot:    { width:7, height:7, borderRadius:3.5, backgroundColor:GOLD },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function DhikrScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [dhikr,       setDhikr]       = useState(DHIKRS[0]);
  const [count,       setCount]       = useState(0);
  const [duration,    setDuration]    = useState("session");
  const [showPicker,  setShowPicker]  = useState(false);
  const [showInfo,    setShowInfo]    = useState(false);

  const add   = () => setCount(c => c + 1);
  const minus = () => setCount(c => Math.max(0, c - 1));
  const reset = () => setCount(0);

  const handleSelectDhikr = (d) => {
    setDhikr(d);
    setCount(0);
  };

  return (
    <SafeAreaView style={[s.safe, { paddingBottom: insets.bottom }]}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.8}>
          <ArrowLeft size={22} color={WHITE} weight="regular" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.title}>Dhikr Counter</Text>
          <Text style={s.subtitle}>{"Remember Allah, and find peace."}</Text>
        </View>
        {/* Info button */}
        <TouchableOpacity style={s.headerBtn} onPress={() => setShowInfo(true)} activeOpacity={0.8}>
          <Info size={22} color={GOLD} weight="regular" />
        </TouchableOpacity>
      </View>

      {/* Dhikr selector */}
      <TouchableOpacity style={s.selector} onPress={() => setShowPicker(true)} activeOpacity={0.85}>
        <View style={s.selectorInner}>
          <Text style={s.selectorHint}>Select Dhikr</Text>
          <Text style={s.selectorArabic}>{dhikr.arabic}</Text>
          <Text style={s.selectorTranslit}>{dhikr.translit}</Text>
        </View>
        <CaretDown size={18} color={GOLD} weight="regular" />
      </TouchableOpacity>

      {/* Count */}
      <View style={s.countWrap}>
        <Text style={s.countNum}>{count}</Text>
        <Text style={s.countLabel}>Count</Text>
      </View>

      {/* Controls: − · + · reset */}
      <View style={s.controls}>
        <TouchableOpacity style={s.sideBtn} onPress={minus} activeOpacity={0.8}>
          <Text style={s.sideBtnTxt}>{"−"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.addBtn} onPress={add} activeOpacity={0.85}>
          <Text style={s.addBtnTxt}>{"+"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.sideBtn} onPress={reset} activeOpacity={0.8}>
          <ArrowCounterClockwise size={22} color={WHITE} weight="regular" />
        </TouchableOpacity>
      </View>

      {/* Duration selector */}
      <View style={s.durationWrap}>
        <DurationSelector selected={duration} onSelect={setDuration} />
      </View>

      {/* Translation */}
      <View style={s.translationWrap}>
        <Text style={s.translationText}>{dhikr.en}</Text>
      </View>

      {/* Dhikr selector sheet */}
      {showPicker && (
        <DhikrSelector
          selected={dhikr}
          onSelect={handleSelectDhikr}
          onClose={() => setShowPicker(false)}
        />
      )}

      {/* Info overlay */}
      {showInfo && (
        <InfoOverlay dhikr={dhikr} onClose={() => setShowInfo(false)} />
      )}

    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex:1, backgroundColor:BG },

  header: {
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    paddingHorizontal:spacing(2.5),
    paddingTop:spacing(2),
    paddingBottom:spacing(1),
  },
  headerBtn: {
    width:40,
    height:40,
    alignItems:"center",
    justifyContent:"center",
  },
  headerCenter:{ flex:1, alignItems:"center" },
  title:    { fontFamily:SERIF, fontSize:28, color:WHITE, fontWeight:"400" },
  subtitle: { fontSize:14, color:GOLD, marginTop:3, fontStyle:"italic" },

  // Selector
  selector: {
    flexDirection:"row",
    alignItems:"center",
    marginHorizontal:spacing(2.5),
    marginTop:spacing(2),
    backgroundColor:SURFACE,
    borderRadius:16,
    borderWidth:1,
    borderColor:"rgba(200,185,160,0.20)",
    padding:20,
  },
  selectorInner:{ flex:1, gap:4 },
  selectorHint: { fontSize:12, color:GOLD, fontWeight:"600", letterSpacing:0.5 },
  selectorArabic: {
    fontFamily:SERIF,
    fontSize:26,
    color:WHITE,
    writingDirection:"rtl",
    lineHeight:38,
  },
  selectorTranslit:{ fontSize:15, color:GOLD, fontStyle:"italic" },

  // Count
  countWrap: {
    alignItems:"center",
    marginTop:spacing(3),
    marginBottom:spacing(1),
  },
  countNum: {
    fontSize:110,
    color:WHITE,
    fontWeight:"100",  // thin — matches reference
    lineHeight:120,
    letterSpacing:-4,
  },
  countLabel: {
    fontSize:14,
    color:MUTED,
    letterSpacing:1,
    textTransform:"uppercase",
    marginTop:-8,
  },

  // Controls
  controls: {
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"center",
    gap:spacing(3),
    marginTop:spacing(2),
    marginBottom:spacing(3),
  },
  sideBtn: {
    width:56,
    height:56,
    borderRadius:28,
    backgroundColor:SURFACE,
    borderWidth:1,
    borderColor:"rgba(200,185,160,0.20)",
    alignItems:"center",
    justifyContent:"center",
  },
  sideBtnTxt: {
    fontSize:28,
    color:WHITE,
    fontWeight:"200",
    lineHeight:34,
  },
  addBtn: {
    width:80,
    height:80,
    borderRadius:40,
    backgroundColor:SURFACE,
    borderWidth:1.5,
    borderColor:GOLD,
    alignItems:"center",
    justifyContent:"center",
    shadowColor:GOLD,
    shadowOffset:{ width:0, height:0 },
    shadowOpacity:0.25,
    shadowRadius:12,
    elevation:6,
  },
  addBtnTxt: {
    fontSize:44,
    color:GOLD,
    fontWeight:"200",
    lineHeight:52,
  },

  // Duration
  durationWrap: {
    alignItems:"center",
    marginBottom:spacing(3),
  },

  // Translation
  translationWrap: {
    marginHorizontal:spacing(2.5),
    alignItems:"center",
  },
  translationText: {
    fontFamily:SERIF,
    fontSize:20,
    color:"rgba(245,240,232,0.70)",
    textAlign:"center",
    lineHeight:30,
    fontStyle:"italic",
  },
});
