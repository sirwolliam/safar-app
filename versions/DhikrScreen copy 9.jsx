/**
 * DhikrScreen.jsx — Safar
 * Dhikr counter with vertical snap picker, goal presets,
 * and a full-screen scrollable analytics section below.
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  SafeAreaView, View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Modal, TouchableWithoutFeedback, Animated,
  TextInput, KeyboardAvoidingView, Platform, Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, CaretDown, ArrowCounterClockwise, Info, X } from "phosphor-react-native";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { spacing } from "../theme";

const { width: SW, height: SH } = Dimensions.get("window");

const BG      = "#0F2318";
const SURFACE = "#1A3028";
const GOLD    = "#C8A96A";
const GOLD_D  = "rgba(200,169,106,0.35)";
const GOLD_F  = "rgba(200,169,106,0.12)";
const MUTED   = "rgba(200,185,160,0.55)";
const MUTED_D = "rgba(200,185,160,0.20)";
const WHITE   = "#F5F0E8";
const SERIF   = "SourceSerif4-Regular";

const ANALYTICS_KEY = "safar_dhikr_analytics_v1";

// ── Goal presets ──────────────────────────────────────────────────────────────
// Based on authenticated Sunnah counts
const GOAL_PRESETS = [
  { label:"11",  value:11  },
  { label:"33",  value:33  },
  { label:"99",  value:99  },
  { label:"100", value:100 },
  { label:"∞",   value:0   }, // no goal
];

const PERIODS = [
  { key:"today",  label:"Today"    },
  { key:"week",   label:"Week"     },
  { key:"month",  label:"Month"    },
  { key:"all",    label:"All Time" },
];

// ── Dhikr list ────────────────────────────────────────────────────────────────
const DHIKRS = [
  { id:"subhanallah",          arabic:"سُبْحَانَ اللَّهِ",                                              translit:"SubhanAllah",                          en:"Glory be to Allah",                                     target:33,  meaning:"An expression of Allah's perfection and freedom from all imperfection.", significance:"'Two words are light on the tongue, heavy on the scales, and beloved to the Most Merciful — SubhanAllahi wa bihamdihi, SubhanAllahil Azeem.' (Bukhari 6406)" },
  { id:"alhamdulillah",        arabic:"الْحَمْدُ لِلَّهِ",                                              translit:"Alhamdulillah",                         en:"All praise is due to Allah",                            target:33,  meaning:"An expression of gratitude and praise to Allah for all His blessings, seen and unseen.", significance:"'Alhamdulillah fills the scales.' (Muslim 223)" },
  { id:"allahuakbar",          arabic:"اللَّهُ أَكْبَرُ",                                               translit:"Allahu Akbar",                          en:"Allah is the Greatest",                                 target:33,  meaning:"A declaration that Allah is greater than everything.", significance:"Together with SubhanAllah and Alhamdulillah these form the tasbih after each prayer — 33 times each." },
  { id:"lailahaillallah",      arabic:"لَا إِلَٰهَ إِلَّا اللَّهُ",                                    translit:"La ilaha illallah",                     en:"There is no god but Allah",                             target:100, meaning:"The declaration of the Oneness of Allah — the foundation of Islamic belief.", significance:"'The best dhikr is La ilaha illallah.' (Tirmidhi 3383)" },
  { id:"astaghfirullah",       arabic:"أَسْتَغْفِرُ اللَّهَ",                                           translit:"Astaghfirullah",                        en:"I seek forgiveness from Allah",                         target:100, meaning:"A supplication for forgiveness. Said to cleanse the heart.", significance:"The Prophet ﷺ sought forgiveness more than 70 times a day. (Bukhari 6307)" },
  { id:"subhanallahiwabihamdih", arabic:"سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",                              translit:"SubhanAllahi wa bihamdih",              en:"Glory be to Allah and praise be to Him",                target:100, meaning:"A combined glorification and praise.", significance:"Whoever says this 100 times a day will have his sins forgiven even if like the foam of the sea. (Bukhari 6405)" },
  { id:"subhanallahilazeem",   arabic:"سُبْحَانَ اللَّهِ الْعَظِيمِ",                                  translit:"SubhanAllahil Azeem",                   en:"Glory be to Allah the Most Great",                      target:100, meaning:"Glorification of Allah with His name Al-Azeem — the Most Great.", significance:"'Light on the tongue, heavy on the scales, beloved to the Most Merciful.' (Bukhari 6406)" },
  { id:"hasbiallah",           arabic:"حَسْبِيَ اللَّهُ",                                               translit:"HasbiAllah",                            en:"Allah is sufficient for me",                            target:7,   meaning:"An expression of complete trust and reliance on Allah.", significance:"Prophet Ibrahim ﷺ said this as he was thrown into the fire. (Bukhari 4563)" },
  { id:"salawat",              arabic:"اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ",                               translit:"Allahumma salli 'ala Muhammad",         en:"O Allah, send blessings upon Muhammad ﷺ",               target:100, meaning:"Sending peace and blessings upon the Prophet ﷺ.", significance:"'Whoever sends one blessing upon me, Allah will send ten blessings upon him.' (Muslim 408)" },
  { id:"lailahaillallahwahdah",arabic:"لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",       translit:"La ilaha illallah wahdahu la sharika lah", en:"There is no god but Allah alone",                   target:100, meaning:"An extended declaration of tawhid.", significance:"'Whoever says this 100 times a day will have a reward equivalent to freeing ten slaves.' (Bukhari 3293)" },
  { id:"rabbighfirli",         arabic:"رَبِّ اغْفِرْ لِي",                                              translit:"Rabbighfir li",                          en:"My Lord, forgive me",                                   target:100, meaning:"A direct personal supplication to Allah for forgiveness.", significance:"A simple powerful du'ā that can be said constantly, especially during ṭawāf and sa'y." },
  { id:"yaallah",              arabic:"يَا اللَّهُ",                                                     translit:"Ya Allah",                              en:"O Allah",                                               target:100, meaning:"Calling upon Allah directly by His greatest name.", significance:"Calling on Allah by name is among the most intimate forms of dhikr and du'ā." },
  { id:"tawbah",               arabic:"أَتُوبُ إِلَى اللَّهِ",                                          translit:"Atubu ilallah",                         en:"I repent to Allah",                                     target:70,  meaning:"An act of sincere repentance and returning to Allah.", significance:"'By Allah, I seek forgiveness and repent to Allah more than seventy times a day.' (Bukhari 6307)" },
  { id:"hawqala",              arabic:"لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",                     translit:"La hawla wa la quwwata illa billah",    en:"There is no power except with Allah",                   target:100, meaning:"Acknowledgement that all power belongs to Allah. Said in times of hardship.", significance:"'It is a treasure from the treasures of Paradise.' (Bukhari 7386)" },
  { id:"bismillah",            arabic:"بِسْمِ اللَّهِ",                                                  translit:"Bismillah",                             en:"In the name of Allah",                                  target:100, meaning:"Said before beginning any action, invoking Allah's blessing.", significance:"'Any important matter not begun with Bismillah is cut off from blessing.' (Abu Dawud 4840)" },
  { id:"innalillah",           arabic:"إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ",                  translit:"Inna lillahi wa inna ilayhi raji'un",   en:"To Allah we belong and to Him we return",               target:33,  meaning:"Said upon any loss or difficulty.", significance:"'There is no Muslim afflicted with a calamity who says this except that Allah compensates him with something better.' (Muslim 918)" },
  { id:"talbiyah",             arabic:"لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ",                                 translit:"Labbayk Allahumma labbayk",             en:"Here I am, O Allah, here I am",                         target:33,  meaning:"The response of the pilgrim to Allah's call. Said during ihrām.", significance:"The pilgrim's declaration of presence and submission to Allah during Ḥajj and Umrah." },
  { id:"allahummaantassalam",  arabic:"اللَّهُمَّ أَنْتَ السَّلَامُ",                                   translit:"Allahumma antas-salam",                 en:"O Allah, You are Peace",                                target:33,  meaning:"Said after each prayer. Acknowledging that Allah is the source of all peace.", significance:"The Prophet ﷺ would say this after finishing each prayer. (Muslim 591)" },
  { id:"allahummainnaka",      arabic:"اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ",                 translit:"Allahumma innaka 'afuwwun",             en:"O Allah, You are forgiving, so forgive me",             target:100, meaning:"A du'ā for forgiveness — especially recommended in Laylatul Qadr and during pilgrimage.", significance:"The Prophet ﷺ taught this du'ā to Aisha for Laylatul Qadr. (Tirmidhi 3513)" },
];

const DURATIONS = [
  { key:"session", label:"This Session" },
  { key:"minutes", label:"15 Minutes"   },
  { key:"hour",    label:"1 Hour"       },
  { key:"day",     label:"For a Day"    },
];

const CUSTOM_TEMPLATE = {
  id:"custom", arabic:"", translit:"", en:"Your custom dhikr",
  meaning:"", significance:"", target:100, isCustom:true,
};

// ── Analytics helpers ─────────────────────────────────────────────────────────
function todayKey() { return new Date().toISOString().slice(0,10); }

function weekKeys() {
  return Array.from({ length:7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6-i));
    return d.toISOString().slice(0,10);
  });
}

function monthKeys() {
  const keys = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(now.getDate() - i);
    keys.push(d.toISOString().slice(0,10));
  }
  return keys;
}

function dayLabel(iso) {
  const d = new Date(iso + "T12:00:00");
  return ["Su","Mo","Tu","We","Th","Fr","Sa"][d.getDay()];
}

function dayTotal(dayData) {
  if (!dayData) return 0;
  return Object.values(dayData).reduce((s,v) => s+v, 0);
}

function getStreak(analytics) {
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().slice(0,10);
    if (!analytics[key] || dayTotal(analytics[key]) === 0) break;
    streak++;
    d.setDate(d.getDate()-1);
  }
  return streak;
}

function getBestDay(analytics) {
  return Math.max(0, ...Object.values(analytics).map(dayTotal));
}

function getPeriodData(analytics, period) {
  const today = todayKey();
  if (period === "today") {
    return analytics[today] ? { [today]: analytics[today] } : {};
  }
  if (period === "week") {
    const keys = weekKeys();
    return Object.fromEntries(keys.filter(k => analytics[k]).map(k => [k, analytics[k]]));
  }
  if (period === "month") {
    const keys = monthKeys();
    return Object.fromEntries(keys.filter(k => analytics[k]).map(k => [k, analytics[k]]));
  }
  return analytics; // all time
}

function getPeriodTotal(analytics, period) {
  return Object.values(getPeriodData(analytics, period)).reduce((s,d) => s+dayTotal(d), 0);
}

async function loadAnalytics() {
  try { const r = await AsyncStorage.getItem(ANALYTICS_KEY); return r ? JSON.parse(r) : {}; }
  catch { return {}; }
}

async function recordCount(dhikrId, amount) {
  const data = await loadAnalytics();
  const key  = todayKey();
  if (!data[key]) data[key] = {};
  data[key][dhikrId] = (data[key][dhikrId] || 0) + amount;
  await AsyncStorage.setItem(ANALYTICS_KEY, JSON.stringify(data)).catch(()=>{});
  return data;
}

// ── Animated count-up number ──────────────────────────────────────────────────
function AnimatedNumber({ value, style }) {
  const animVal = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    Animated.timing(animVal, { toValue:value, duration:600, useNativeDriver:false }).start();
    animVal.addListener(({ value:v }) => setDisplay(Math.round(v)));
    return () => animVal.removeAllListeners();
  }, [value]);
  return <Text style={style}>{display.toLocaleString()}</Text>;
}

// ── Headline stats ────────────────────────────────────────────────────────────
function HeadlineStats({ analytics, period }) {
  const today    = dayTotal(analytics[todayKey()]);
  const weekTot  = weekKeys().reduce((s,k) => s+dayTotal(analytics[k]), 0);
  const streak   = getStreak(analytics);
  const best     = getBestDay(analytics);
  const periodTotal = getPeriodTotal(analytics, period);

  const stats = [
    { label:"Today",        value:today,       icon:"🌙" },
    { label:"This Week",    value:weekTot,      icon:"📅" },
    { label:"Day Streak",   value:streak,       icon:"🔥", suffix:" days" },
    { label:"Personal Best",value:best,         icon:"⭐" },
  ];

  return (
    <View style={hs.grid}>
      {stats.map((s,i) => (
        <View key={i} style={hs.cell}>
          <Text style={hs.icon}>{s.icon}</Text>
          <AnimatedNumber value={s.value} style={hs.num} />
          {s.suffix ? <Text style={hs.suffix}>{s.suffix}</Text> : null}
          <Text style={hs.label}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}
const hs = StyleSheet.create({
  grid:   { flexDirection:"row", flexWrap:"wrap", gap:10, marginHorizontal:spacing(2.5), marginBottom:spacing(2) },
  cell:   { flex:1, minWidth:"45%", backgroundColor:SURFACE, borderRadius:16, borderWidth:1, borderColor:MUTED_D, padding:spacing(2), alignItems:"center", gap:4 },
  icon:   { fontSize:22, marginBottom:2 },
  num:    { fontFamily:SERIF, fontSize:36, color:WHITE, fontWeight:"100", lineHeight:42 },
  suffix: { fontSize:12, color:MUTED, marginTop:-4 },
  label:  { fontSize:11, color:MUTED, letterSpacing:1, textTransform:"uppercase", textAlign:"center" },
});

// ── Weekly bar chart ──────────────────────────────────────────────────────────
function BarChart({ analytics, period }) {
  const keys = period === "month" ? monthKeys() : weekKeys();
  const showEvery = period === "month" ? 5 : 1;
  const totals = keys.map(k => dayTotal(analytics[k]));
  const max    = Math.max(...totals, 1);
  const today  = todayKey();
  const barAnims = useRef(keys.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(40, barAnims.map((a,i) =>
      Animated.timing(a, {
        toValue: totals[i] / max,
        duration: 500,
        useNativeDriver: false,
      })
    )).start();
  }, [period, JSON.stringify(totals)]);

  return (
    <View style={bc.wrap}>
      <Text style={bc.heading}>
        {period === "today" ? "Today's Count" :
         period === "week"  ? "Last 7 Days"   :
         period === "month" ? "Last 30 Days"  : "All Time"}
      </Text>
      <View style={bc.chart}>
        {keys.map((k, i) => {
          const isToday = k === today;
          return (
            <View key={k} style={bc.col}>
              {totals[i] > 0 ? (
                <Text style={bc.val}>{totals[i] > 999 ? Math.round(totals[i]/1000)+"k" : totals[i]}</Text>
              ) : <Text style={bc.val}>{""}</Text>}
              <View style={bc.track}>
                <Animated.View style={[
                  bc.fill,
                  isToday ? bc.fillToday : null,
                  { height: barAnims[i].interpolate({ inputRange:[0,1], outputRange:["0%","100%"] }) },
                ]} />
              </View>
              {(i % showEvery === 0 || i === keys.length-1) ? (
                <Text style={[bc.lbl, isToday && bc.lblToday]}>
                  {period === "month" ? (i+1) : dayLabel(k)}
                </Text>
              ) : <Text style={bc.lbl}>{""}</Text>}
            </View>
          );
        })}
      </View>
    </View>
  );
}
const bc = StyleSheet.create({
  wrap:      { marginHorizontal:spacing(2.5), marginBottom:spacing(2), backgroundColor:SURFACE, borderRadius:18, borderWidth:1, borderColor:MUTED_D, padding:spacing(2) },
  heading:   { fontSize:11, fontWeight:"700", letterSpacing:1.5, color:GOLD, marginBottom:spacing(2), textTransform:"uppercase" },
  chart:     { flexDirection:"row", alignItems:"flex-end", gap:3, height:90 },
  col:       { flex:1, alignItems:"center", height:"100%" },
  val:       { fontSize:8, color:MUTED, height:12, marginBottom:2, textAlign:"center" },
  track:     { flex:1, width:"100%", backgroundColor:GOLD_F, borderRadius:4, overflow:"hidden", justifyContent:"flex-end" },
  fill:      { width:"100%", backgroundColor:GOLD_D, borderRadius:4 },
  fillToday: { backgroundColor:GOLD },
  lbl:       { fontSize:9, color:MUTED, marginTop:4, textAlign:"center" },
  lblToday:  { color:GOLD, fontWeight:"700" },
});

// ── Per-dhikr breakdown ───────────────────────────────────────────────────────
function DhikrBreakdown({ analytics, period }) {
  const data    = getPeriodData(analytics, period);
  const totals  = {};
  Object.values(data).forEach(day => {
    Object.entries(day).forEach(([id, c]) => {
      totals[id] = (totals[id]||0) + c;
    });
  });
  const entries = Object.entries(totals).sort(([,a],[,b]) => b-a).slice(0,8);
  if (!entries.length) {
    return (
      <View style={db.wrap}>
        <Text style={db.heading}>By Dhikr</Text>
        <Text style={db.empty}>No dhikr recorded yet for this period</Text>
      </View>
    );
  }
  const max = entries[0][1];

  return (
    <View style={db.wrap}>
      <Text style={db.heading}>By Dhikr</Text>
      {entries.map(([id, count], i) => {
        const d     = DHIKRS.find(x => x.id===id);
        const label = d ? d.translit : id;
        const pct   = count / max;
        return (
          <View key={id} style={[db.row, i < entries.length-1 ? db.rowBorder : null]}>
            <View style={db.rowLeft}>
              <Text style={db.name} numberOfLines={1}>{label}</Text>
              {d ? <Text style={db.arabic} numberOfLines={1}>{d.arabic}</Text> : null}
            </View>
            <View style={db.barWrap}>
              <View style={db.barTrack}>
                <View style={[db.barFill, { width:`${Math.round(pct*100)}%` }]} />
              </View>
            </View>
            <Text style={db.count}>{count.toLocaleString()}</Text>
          </View>
        );
      })}
    </View>
  );
}
const db = StyleSheet.create({
  wrap:      { marginHorizontal:spacing(2.5), marginBottom:spacing(2), backgroundColor:SURFACE, borderRadius:18, borderWidth:1, borderColor:MUTED_D, padding:spacing(2) },
  heading:   { fontSize:11, fontWeight:"700", letterSpacing:1.5, color:GOLD, marginBottom:spacing(1.5), textTransform:"uppercase" },
  empty:     { fontSize:13, color:MUTED, textAlign:"center", paddingVertical:spacing(2) },
  row:       { flexDirection:"row", alignItems:"center", paddingVertical:10, gap:12 },
  rowBorder: { borderBottomWidth:1, borderBottomColor:"rgba(200,185,160,0.08)" },
  rowLeft:   { width:120 },
  name:      { fontSize:13, color:WHITE, fontWeight:"500" },
  arabic:    { fontSize:12, color:MUTED, writingDirection:"rtl", marginTop:2 },
  barWrap:   { flex:1 },
  barTrack:  { height:5, backgroundColor:GOLD_F, borderRadius:3, overflow:"hidden" },
  barFill:   { height:"100%", backgroundColor:GOLD, borderRadius:3 },
  count:     { fontSize:13, color:GOLD, fontWeight:"600", width:44, textAlign:"right" },
});

// ── Scroll invite ─────────────────────────────────────────────────────────────
function ScrollInvite() {
  const drift = useRef(new Animated.Value(0)).current;
  const fade  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(drift, { toValue:6, duration:1000, useNativeDriver:true }),
          Animated.timing(fade,  { toValue:0.35, duration:1000, useNativeDriver:true }),
        ]),
        Animated.parallel([
          Animated.timing(drift, { toValue:0, duration:1000, useNativeDriver:true }),
          Animated.timing(fade,  { toValue:1, duration:1000, useNativeDriver:true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <View style={si.wrap}>
      {/* Gold lines either side */}
      <View style={si.line} />
      <View style={si.center}>
        <Text style={si.label}>My Dhikr Journey</Text>
        <Animated.View style={{ transform:[{ translateY:drift }], opacity:fade }}>
          <Text style={si.chevron}>{"⌄"}</Text>
        </Animated.View>
      </View>
      <View style={si.line} />
    </View>
  );
}
const si = StyleSheet.create({
  wrap:    { flexDirection:"row", alignItems:"center", marginHorizontal:spacing(2.5), marginTop:spacing(2), marginBottom:spacing(1) },
  line:    { flex:1, height:1, backgroundColor:GOLD_D },
  center:  { alignItems:"center", paddingHorizontal:spacing(2) },
  label:   { fontSize:11, color:MUTED, letterSpacing:1.5, textTransform:"uppercase", marginBottom:2 },
  chevron: { fontSize:18, color:GOLD_D, lineHeight:20 },
});

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
      <Animated.View style={[ov.backdrop, { opacity:fadeAnim }]}>
        <TouchableWithoutFeedback onPress={close}><View style={StyleSheet.absoluteFill} /></TouchableWithoutFeedback>
        <View style={ov.sheet}>
          <TouchableOpacity style={ov.closeBtn} onPress={close} activeOpacity={0.8}>
            <X size={16} color={MUTED} weight="regular" />
          </TouchableOpacity>
          <Text style={ov.arabic}>{dhikr.arabic || dhikr.translit}</Text>
          {!!dhikr.translit && <Text style={ov.translit}>{dhikr.translit}</Text>}
          <View style={ov.divider} />
          {!!dhikr.meaning && <><Text style={ov.sectionLabel}>Meaning</Text><Text style={ov.body}>{dhikr.meaning}</Text></>}
          {!!dhikr.significance && <><Text style={[ov.sectionLabel,{marginTop:16}]}>Significance</Text><Text style={ov.body}>{dhikr.significance}</Text></>}
          {!dhikr.meaning && !dhikr.significance && <Text style={ov.body}>Your custom dhikr.</Text>}
        </View>
      </Animated.View>
    </Modal>
  );
}
const ov = StyleSheet.create({
  backdrop:     { flex:1, backgroundColor:"rgba(0,0,0,0.65)", justifyContent:"flex-end" },
  sheet:        { backgroundColor:SURFACE, borderTopLeftRadius:24, borderTopRightRadius:24, padding:28, paddingBottom:44 },
  closeBtn:     { position:"absolute", top:16, right:16, width:32, height:32, borderRadius:16, backgroundColor:"rgba(255,255,255,0.08)", alignItems:"center", justifyContent:"center" },
  arabic:       { fontFamily:SERIF, fontSize:44, color:WHITE, textAlign:"center", marginTop:8, marginBottom:10, writingDirection:"rtl", lineHeight:62 },
  translit:     { fontSize:22, color:GOLD, textAlign:"center", fontStyle:"italic", marginBottom:16 },
  divider:      { height:1, backgroundColor:"rgba(200,185,160,0.18)", marginBottom:16 },
  sectionLabel: { fontSize:12, fontWeight:"700", color:GOLD, letterSpacing:1, textTransform:"uppercase", marginBottom:6 },
  body:         { fontSize:16, color:"rgba(245,240,232,0.80)", lineHeight:26 },
});

// ── Dhikr selector modal ──────────────────────────────────────────────────────
function DhikrSelector({ selected, onSelect, onClose }) {
  const [customText, setCustomText] = useState("");
  const handleCustom = () => {
    if (!customText.trim()) return;
    onSelect({ ...CUSTOM_TEMPLATE, translit:customText.trim(), en:customText.trim() });
    onClose();
  };
  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}><View style={sel.backdrop} /></TouchableWithoutFeedback>
      <KeyboardAvoidingView behavior={Platform.OS==="ios"?"padding":undefined} style={sel.kavWrap}>
        <View style={sel.sheet}>
          <View style={sel.handle} />
          <Text style={sel.title}>Select Dhikr</Text>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {DHIKRS.map(d => (
              <TouchableOpacity key={d.id} style={[sel.row, d.id===selected.id&&sel.rowActive]}
                onPress={() => { onSelect(d); onClose(); }} activeOpacity={0.8}>
                <View style={sel.rowLeft}>
                  <Text style={sel.rowArabic}>{d.arabic}</Text>
                  <Text style={sel.rowTranslit}>{d.translit}</Text>
                  <Text style={sel.rowEn}>{d.en}</Text>
                </View>
                {d.id===selected.id && <View style={sel.dot} />}
              </TouchableOpacity>
            ))}
            <View style={sel.customWrap}>
              <Text style={sel.customLabel}>Custom / Add your own dhikr</Text>
              <View style={sel.customRow}>
                <TextInput style={sel.customInput} placeholder={"Type your dhikr\u2026"}
                  placeholderTextColor={MUTED} value={customText} onChangeText={setCustomText}
                  returnKeyType="done" onSubmitEditing={handleCustom} />
                <TouchableOpacity style={[sel.customBtn,!customText.trim()&&sel.customBtnDisabled]}
                  onPress={handleCustom} activeOpacity={0.8} disabled={!customText.trim()}>
                  <Text style={sel.customBtnTxt}>Use</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ height:24 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
const sel = StyleSheet.create({
  backdrop:          { flex:1, backgroundColor:"rgba(0,0,0,0.5)" },
  kavWrap:           { flex:1, justifyContent:"flex-end" },
  sheet:             { backgroundColor:SURFACE, borderTopLeftRadius:24, borderTopRightRadius:24, maxHeight:"80%", paddingBottom:8 },
  handle:            { width:36, height:4, borderRadius:2, backgroundColor:MUTED_D, alignSelf:"center", marginTop:10, marginBottom:4 },
  title:             { fontFamily:SERIF, fontSize:20, color:WHITE, textAlign:"center", paddingVertical:14, borderBottomWidth:1, borderBottomColor:"rgba(200,185,160,0.15)" },
  row:               { paddingHorizontal:24, paddingVertical:16, borderBottomWidth:1, borderBottomColor:"rgba(200,185,160,0.10)", flexDirection:"row", alignItems:"center" },
  rowActive:         { backgroundColor:"rgba(200,169,106,0.10)" },
  rowLeft:           { flex:1, gap:3, alignItems:"center" },
  rowArabic:         { fontFamily:SERIF, fontSize:20, color:WHITE, writingDirection:"rtl", textAlign:"center" },
  rowTranslit:       { fontSize:13, color:GOLD, fontStyle:"italic", textAlign:"center" },
  rowEn:             { fontSize:12, color:MUTED, textAlign:"center" },
  dot:               { width:8, height:8, borderRadius:4, backgroundColor:GOLD },
  customWrap:        { marginHorizontal:20, marginTop:20, marginBottom:8 },
  customLabel:       { fontSize:12, fontWeight:"700", color:GOLD, letterSpacing:0.8, marginBottom:10, textTransform:"uppercase" },
  customRow:         { flexDirection:"row", gap:10, alignItems:"center" },
  customInput:       { flex:1, backgroundColor:"rgba(255,255,255,0.07)", borderRadius:12, borderWidth:1, borderColor:MUTED_D, paddingHorizontal:16, paddingVertical:12, fontSize:15, color:WHITE },
  customBtn:         { backgroundColor:GOLD, borderRadius:12, paddingHorizontal:18, paddingVertical:12 },
  customBtnDisabled: { opacity:0.4 },
  customBtnTxt:      { fontSize:15, fontWeight:"600", color:"#1A1200" },
});

// ── Duration selector ─────────────────────────────────────────────────────────
function DurationSelector({ selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const current = DURATIONS.find(d => d.key===selected) ?? DURATIONS[0];
  return (
    <>
      <TouchableOpacity style={dur.btn} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <Text style={dur.label}>{current.label}</Text>
        <CaretDown size={14} color={MUTED} weight="regular" />
      </TouchableOpacity>
      {open && (
        <Modal transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <TouchableWithoutFeedback onPress={() => setOpen(false)}><View style={dur.backdrop} /></TouchableWithoutFeedback>
          <View style={dur.sheet}>
            {DURATIONS.map(d => (
              <TouchableOpacity key={d.key} style={dur.row} onPress={() => { onSelect(d.key); setOpen(false); }} activeOpacity={0.8}>
                <Text style={[dur.rowTxt, d.key===selected&&dur.rowTxtActive]}>{d.label}</Text>
                {d.key===selected && <View style={dur.rowDot} />}
              </TouchableOpacity>
            ))}
          </View>
        </Modal>
      )}
    </>
  );
}
const dur = StyleSheet.create({
  btn:          { flexDirection:"row", alignItems:"center", gap:8, backgroundColor:SURFACE, borderRadius:50, paddingHorizontal:20, paddingVertical:12, borderWidth:1, borderColor:MUTED_D, alignSelf:"center" },
  label:        { fontSize:15, color:WHITE },
  backdrop:     { flex:1, backgroundColor:"rgba(0,0,0,0.4)" },
  sheet:        { position:"absolute", bottom:80, alignSelf:"center", backgroundColor:SURFACE, borderRadius:16, borderWidth:1, borderColor:MUTED_D, overflow:"hidden", minWidth:200 },
  row:          { paddingHorizontal:24, paddingVertical:14, flexDirection:"row", alignItems:"center", justifyContent:"space-between" },
  rowTxt:       { fontSize:16, color:WHITE },
  rowTxtActive: { color:GOLD, fontWeight:"500" },
  rowDot:       { width:7, height:7, borderRadius:3.5, backgroundColor:GOLD },
});

// ── Goal selector ─────────────────────────────────────────────────────────────
function GoalSelector({ goal, onSelect }) {
  return (
    <View style={gs.wrap}>
      {GOAL_PRESETS.map(p => {
        const active = goal === p.value;
        return (
          <TouchableOpacity
            key={p.label}
            style={[gs.pill, active ? gs.pillActive : null]}
            onPress={() => onSelect(p.value)}
            activeOpacity={0.8}
          >
            <Text style={[gs.label, active ? gs.labelActive : null]}>{p.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
const gs = StyleSheet.create({
  wrap:        { flexDirection:"row", gap:8, alignSelf:"center", alignItems:"center" },
  pill:        { paddingHorizontal:14, paddingVertical:8, borderRadius:50, borderWidth:1, borderColor:MUTED_D, backgroundColor:"transparent" },
  pillActive:  { backgroundColor:GOLD_F, borderColor:GOLD },
  label:       { fontSize:13, color:MUTED },
  labelActive: { color:GOLD, fontWeight:"600" },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function DhikrScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [dhikr,      setDhikr]      = useState(DHIKRS[0]);
  const [count,      setCount]      = useState(0);
  const [goal,       setGoal]       = useState(33);
  const [duration,   setDuration]   = useState("session");
  const [showPicker, setShowPicker] = useState(false);
  const [showInfo,   setShowInfo]   = useState(false);
  const [analytics,  setAnalytics]  = useState({});
  const [period,     setPeriod]     = useState("week");

  useEffect(() => { loadAnalytics().then(setAnalytics); }, []);

  const add = async () => {
    const next = count + 1;
    setCount(next);
    if (goal > 0 && next === goal) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const updated = await recordCount(dhikr.id, 1);
    setAnalytics({ ...updated });
  };

  const minus = () => {
    setCount(c => Math.max(0,c-1));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const reset = () => {
    setCount(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  // Goal progress
  const goalPct = goal > 0 ? Math.min(count / goal, 1) : 0;

  return (
    <SafeAreaView style={[s.safe, { paddingBottom:insets.bottom }]}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.8}>
          <ArrowLeft size={22} color={WHITE} weight="regular" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.title}>Dhikr Counter</Text>
          <Text style={s.subtitle}>{"Remember Allah, and find peace."}</Text>
        </View>
        <View style={{ width:40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:spacing(6) }}>

        {/* Dhikr selector button */}
        <TouchableOpacity style={s.selector} onPress={() => setShowPicker(true)} activeOpacity={0.85}>
          <View style={s.selectorInner}>
            <Text style={s.selectorHint}>SELECT DHIKR</Text>
            <Text style={s.selectorArabic} adjustsFontSizeToFit numberOfLines={2}>
              {dhikr.arabic || dhikr.translit}
            </Text>
            <Text style={s.selectorTranslit}>{dhikr.translit}</Text>
          </View>
          <CaretDown size={20} color={GOLD} weight="regular" />
        </TouchableOpacity>

        {/* Count */}
        <View style={s.countWrap}>
          <Text style={s.countNum}>{count}</Text>
          {goal > 0 && (
            <View style={s.goalBar}>
              <View style={[s.goalFill, { width:`${Math.round(goalPct*100)}%` }]} />
            </View>
          )}
          <Text style={s.countLabel}>
            {goal > 0 ? `${count} of ${goal}` : "Count"}
          </Text>
        </View>

        {/* Controls */}
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

        {/* Duration + Goal row */}
        <View style={s.controlsRow}>
          <DurationSelector selected={duration} onSelect={setDuration} />
          <GoalSelector goal={goal} onSelect={setGoal} />
        </View>

        {/* Translation + info — 2pt smaller */}
        <View style={s.translationWrap}>
          <Text style={s.translationText}>{dhikr.en}</Text>
          <TouchableOpacity style={s.infoBtn} onPress={() => setShowInfo(true)} activeOpacity={0.8}>
            <Info size={18} color={GOLD} weight="regular" />
          </TouchableOpacity>
        </View>

        {/* Scroll invite — My Dhikr Journey */}
        <ScrollInvite />

        {/* ── Analytics section ── */}
        <View style={s.analyticsSection}>

          {/* Period toggle */}
          <View style={s.periodRow}>
            {PERIODS.map(p => (
              <TouchableOpacity
                key={p.key}
                style={[s.periodPill, period===p.key ? s.periodPillActive : null]}
                onPress={() => setPeriod(p.key)}
                activeOpacity={0.8}
              >
                <Text style={[s.periodLabel, period===p.key ? s.periodLabelActive : null]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <HeadlineStats analytics={analytics} period={period} />
          <BarChart       analytics={analytics} period={period} />
          <DhikrBreakdown analytics={analytics} period={period} />

        </View>

      </ScrollView>

      {showPicker && (
        <DhikrSelector selected={dhikr}
          onSelect={d => { setDhikr(d); setCount(0); }}
          onClose={() => setShowPicker(false)} />
      )}
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
    flexDirection:"row", alignItems:"center", justifyContent:"space-between",
    paddingHorizontal:spacing(2.5), paddingTop:spacing(2), paddingBottom:spacing(1),
  },
  headerBtn:    { width:40, height:40, alignItems:"center", justifyContent:"center" },
  headerCenter: { flex:1, alignItems:"center" },
  title:        { fontFamily:SERIF, fontSize:28, color:WHITE, fontWeight:"400" },
  subtitle:     { fontSize:14, color:GOLD, marginTop:3, fontStyle:"italic" },

  // Dhikr selector — now a button opening modal
  selector: {
    flexDirection:"row", alignItems:"center",
    marginHorizontal:spacing(2.5), marginTop:spacing(2),
    backgroundColor:SURFACE, borderRadius:16, borderWidth:1,
    borderColor:MUTED_D, paddingVertical:20, paddingHorizontal:20,
  },
  selectorInner:   { flex:1, alignItems:"center", gap:8 },
  selectorHint:    { fontSize:10, color:GOLD, fontWeight:"700", letterSpacing:1.5, textTransform:"uppercase" },
  // Arabic 1.5× original 34px = 51px
  selectorArabic:  { fontFamily:SERIF, fontSize:51, color:WHITE, writingDirection:"rtl",
                     lineHeight:62, textAlign:"center", maxWidth:SW - 100 },
  // Transliteration 1.5× original 22px = 33px
  selectorTranslit:{ fontSize:33, color:GOLD, fontStyle:"italic", textAlign:"center" },

  // Count
  countWrap:  { alignItems:"center", marginTop:spacing(3), marginBottom:spacing(1) },
  countNum:   { fontSize:128, color:WHITE, fontWeight:"100", lineHeight:138, letterSpacing:-6 },
  goalBar:    { width:160, height:3, backgroundColor:MUTED_D, borderRadius:2, overflow:"hidden", marginTop:4 },
  goalFill:   { height:"100%", backgroundColor:GOLD, borderRadius:2 },
  countLabel: { fontSize:14, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginTop:6 },

  // Controls
  controls: {
    flexDirection:"row", alignItems:"center", justifyContent:"center",
    gap:spacing(3), marginTop:spacing(4), marginBottom:spacing(3.5),
  },
  sideBtn:    { width:58, height:58, borderRadius:29, backgroundColor:SURFACE, borderWidth:1, borderColor:MUTED_D, alignItems:"center", justifyContent:"center" },
  sideBtnTxt: { fontSize:30, color:WHITE, fontWeight:"200", lineHeight:36 },
  addBtn:     { width:84, height:84, borderRadius:42, backgroundColor:SURFACE, borderWidth:1.5, borderColor:GOLD, alignItems:"center", justifyContent:"center", shadowColor:GOLD, shadowOffset:{width:0,height:0}, shadowOpacity:0.28, shadowRadius:14, elevation:6 },
  addBtnTxt:  { fontSize:48, color:GOLD, fontWeight:"200", lineHeight:56 },

  // Duration + goal row
  controlsRow: { flexDirection:"row", alignItems:"center", justifyContent:"center", gap:spacing(2), marginBottom:spacing(3), flexWrap:"wrap", paddingHorizontal:spacing(2) },

  // Translation — reduced 2pt from 20 to 18
  translationWrap: { marginHorizontal:spacing(2.5), flexDirection:"row", alignItems:"center", justifyContent:"center", gap:10 },
  translationText: { fontFamily:SERIF, fontSize:18, color:"rgba(245,240,232,0.70)", textAlign:"center", lineHeight:28, fontStyle:"italic", flexShrink:1 },
  infoBtn:         { width:32, height:32, borderRadius:16, backgroundColor:GOLD_F, alignItems:"center", justifyContent:"center", borderWidth:1, borderColor:GOLD_D, flexShrink:0 },

  // Analytics section
  analyticsSection: { marginTop:spacing(2) },
  periodRow:        { flexDirection:"row", gap:8, justifyContent:"center", marginBottom:spacing(2), marginHorizontal:spacing(2.5) },
  periodPill:       { flex:1, paddingVertical:9, borderRadius:50, borderWidth:1, borderColor:MUTED_D, alignItems:"center" },
  periodPillActive: { backgroundColor:GOLD_F, borderColor:GOLD },
  periodLabel:      { fontSize:13, color:MUTED },
  periodLabelActive:{ color:GOLD, fontWeight:"600" },
});
