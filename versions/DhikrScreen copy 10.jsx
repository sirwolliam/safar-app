/**
 * DhikrScreen.jsx — Safar
 * Dhikr counter with:
 *  - Compact selector with gold horizontal lines (no box)
 *  - Goal dropdown next to duration pill
 *  - "My Dhikr Summary" scroll invite with animated chevron
 *  - Summary card (total · goal completion · active days · streak)
 *  - Combined stats row with separators
 *  - Goal progress card with edit
 *  - Weekly bar chart
 *  - Per-dhikr breakdown
 *  - No emoji anywhere — Phosphor icons throughout
 */
import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView, View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Modal, TouchableWithoutFeedback, Animated,
  TextInput, KeyboardAvoidingView, Platform, Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft, ArrowCounterClockwise, Info, X, CaretDown,
  HandsPraying, CheckCircle, CalendarCheck, Flame,
  Star, Trophy, Target, PencilSimple,
} from "phosphor-react-native";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { spacing, radius, shadows } from "../theme";

const { width: SW } = Dimensions.get("window");
const BG      = "#0F2318";
const SURFACE = "#1A3028";
const CARD    = "#FDFAF4";
const GOLD    = "#C8A96A";
const GOLD_D  = "rgba(200,169,106,0.32)";
const GOLD_F  = "rgba(200,169,106,0.10)";
const MUTED   = "rgba(200,185,160,0.55)";
const MUTED_D = "rgba(200,185,160,0.18)";
const WHITE   = "#F5F0E8";
const SERIF   = "SourceSerif4-Regular";
const ANALYTICS_KEY = "safar_dhikr_analytics_v1";

// ── Goal presets ──────────────────────────────────────────────────────────────
const GOAL_PRESETS = [
  { label:"No goal",   value:0   },
  { label:"11",        value:11  },
  { label:"33",        value:33  },
  { label:"99",        value:99  },
  { label:"100",       value:100 },
  { label:"Custom…",   value:-1  },
];

const PERIODS = [
  { key:"today", label:"Today"    },
  { key:"week",  label:"Week"     },
  { key:"month", label:"Month"    },
  { key:"all",   label:"All Time" },
];

const DURATIONS = [
  { key:"session", label:"This Session" },
  { key:"minutes", label:"15 Minutes"   },
  { key:"hour",    label:"1 Hour"       },
  { key:"day",     label:"For a Day"    },
];

// ── Dhikr list ────────────────────────────────────────────────────────────────
const DHIKRS = [
  { id:"subhanallah",            arabic:"سُبْحَانَ اللَّهِ",                                            translit:"SubhanAllah",                         en:"Glory be to Allah",                           target:33  },
  { id:"alhamdulillah",          arabic:"الْحَمْدُ لِلَّهِ",                                            translit:"Alhamdulillah",                        en:"All praise is due to Allah",                  target:33  },
  { id:"allahuakbar",            arabic:"اللَّهُ أَكْبَرُ",                                             translit:"Allahu Akbar",                         en:"Allah is the Greatest",                       target:33  },
  { id:"lailahaillallah",        arabic:"لَا إِلَٰهَ إِلَّا اللَّهُ",                                  translit:"La ilaha illallah",                    en:"There is no god but Allah",                   target:100 },
  { id:"astaghfirullah",         arabic:"أَسْتَغْفِرُ اللَّهَ",                                         translit:"Astaghfirullah",                       en:"I seek forgiveness from Allah",               target:100 },
  { id:"subhanallahiwabihamdih", arabic:"سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",                              translit:"SubhanAllahi wa bihamdih",             en:"Glory be to Allah and praise be to Him",      target:100 },
  { id:"subhanallahilazeem",     arabic:"سُبْحَانَ اللَّهِ الْعَظِيمِ",                                translit:"SubhanAllahil Azeem",                  en:"Glory be to Allah the Most Great",            target:100 },
  { id:"hasbiallah",             arabic:"حَسْبِيَ اللَّهُ",                                             translit:"HasbiAllah",                           en:"Allah is sufficient for me",                  target:7   },
  { id:"salawat",                arabic:"اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ",                            translit:"Allahumma salli 'ala Muhammad",        en:"O Allah, send blessings upon Muhammad \uFE0F", target:100 },
  { id:"lailahaillallahwahdah",  arabic:"لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",    translit:"La ilaha illallah wahdahu",            en:"There is no god but Allah alone",             target:100 },
  { id:"rabbighfirli",           arabic:"رَبِّ اغْفِرْ لِي",                                           translit:"Rabbighfir li",                        en:"My Lord, forgive me",                         target:100 },
  { id:"yaallah",                arabic:"يَا اللَّهُ",                                                  translit:"Ya Allah",                             en:"O Allah",                                     target:100 },
  { id:"tawbah",                 arabic:"أَتُوبُ إِلَى اللَّهِ",                                       translit:"Atubu ilallah",                        en:"I repent to Allah",                           target:70  },
  { id:"hawqala",                arabic:"لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",                 translit:"La hawla wa la quwwata illa billah",   en:"There is no power except with Allah",         target:100 },
  { id:"bismillah",              arabic:"بِسْمِ اللَّهِ",                                               translit:"Bismillah",                            en:"In the name of Allah",                        target:100 },
  { id:"talbiyah",               arabic:"لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ",                             translit:"Labbayk Allahumma labbayk",            en:"Here I am, O Allah, here I am",               target:33  },
  { id:"allahummaantassalam",    arabic:"اللَّهُمَّ أَنْتَ السَّلَامُ",                               translit:"Allahumma antas-salam",                en:"O Allah, You are Peace",                      target:33  },
  { id:"allahummainnaka",        arabic:"اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ",             translit:"Allahumma innaka 'afuwwun",            en:"O Allah, You are forgiving, so forgive me",   target:100 },
];

const CUSTOM_TEMPLATE = { id:"custom", arabic:"", translit:"", en:"Your custom dhikr", target:100, isCustom:true };

// ── Analytics helpers ─────────────────────────────────────────────────────────
const todayKey = () => new Date().toISOString().slice(0,10);

const weekKeys = () => Array.from({length:7},(_,i)=>{
  const d=new Date(); d.setDate(d.getDate()-(6-i)); return d.toISOString().slice(0,10);
});

const monthKeys = () => Array.from({length:30},(_,i)=>{
  const d=new Date(); d.setDate(d.getDate()-(29-i)); return d.toISOString().slice(0,10);
});

const dayLabel = iso => {
  const d=new Date(iso+"T12:00:00");
  return ["Su","Mo","Tu","We","Th","Fr","Sa"][d.getDay()];
};

const dayTotal = day => !day ? 0 : Object.values(day).reduce((s,v)=>s+v,0);

const getStreak = analytics => {
  let streak=0; const d=new Date();
  while(true){
    const k=d.toISOString().slice(0,10);
    if(!analytics[k]||dayTotal(analytics[k])===0) break;
    streak++; d.setDate(d.getDate()-1);
  }
  return streak;
};

const getActiveDays = analytics => Object.values(analytics).filter(d=>dayTotal(d)>0).length;

const getTotalAllTime = analytics =>
  Object.values(analytics).reduce((s,d)=>s+dayTotal(d),0);

const getPeriodKeys = period => {
  if(period==="today")  return [todayKey()];
  if(period==="week")   return weekKeys();
  if(period==="month")  return monthKeys();
  return Object.keys(analytics||{});
};

const getPeriodTotal = (analytics,period) =>
  (period==="all" ? Object.keys(analytics) : getPeriodKeys(period))
    .reduce((s,k)=>s+dayTotal(analytics[k]),0);

async function loadAnalytics() {
  try { const r=await AsyncStorage.getItem(ANALYTICS_KEY); return r?JSON.parse(r):{}; }
  catch { return {}; }
}

async function recordCount(dhikrId,amount) {
  const data=await loadAnalytics();
  const key=todayKey();
  if(!data[key]) data[key]={};
  data[key][dhikrId]=(data[key][dhikrId]||0)+amount;
  await AsyncStorage.setItem(ANALYTICS_KEY,JSON.stringify(data)).catch(()=>{});
  return data;
}

// ── Animated number ───────────────────────────────────────────────────────────
function AnimNumber({value,style}){
  const av=useRef(new Animated.Value(0)).current;
  const [disp,setDisp]=useState(0);
  useEffect(()=>{
    Animated.timing(av,{toValue:value,duration:700,useNativeDriver:false}).start();
    const id=av.addListener(({value:v})=>setDisp(Math.round(v)));
    return ()=>av.removeListener(id);
  },[value]);
  return <Text style={style}>{disp.toLocaleString()}</Text>;
}

// ── Summary card (reference image style) ─────────────────────────────────────
function SummaryCard({ analytics, goal, period }) {
  const total      = getTotalAllTime(analytics);
  const activeDays = getActiveDays(analytics);
  const streak     = getStreak(analytics);
  const todayCount = dayTotal(analytics[todayKey()]);
  const goalPct    = goal > 0 ? Math.min(Math.round((todayCount/goal)*100),100) : null;

  const metrics = [
    { Icon:HandsPraying, value:total,      label:"Total Dhikr",      suffix:""   },
    { Icon:CheckCircle,  value:goalPct,     label:"Goal Today",       suffix:goalPct!==null?"%":null, noGoal:goalPct===null },
    { Icon:CalendarCheck,value:activeDays,  label:"Active Days",      suffix:""   },
    { Icon:Flame,        value:streak,      label:"Day Streak",       suffix:"d"  },
  ];

  return (
    <View style={sc.card}>
      {/* Card header */}
      <View style={sc.header}>
        <Text style={sc.headerTitle}>My Dhikr Summary</Text>
        <Text style={sc.headerSub}>All time</Text>
      </View>
      <View style={sc.dividerH} />

      {/* Metrics row */}
      <View style={sc.metricsRow}>
        {metrics.map((m,i) => (
          <React.Fragment key={i}>
            {i > 0 && <View style={sc.separator} />}
            <View style={sc.metric}>
              <m.Icon size={18} color="#4A5C48" weight="thin" />
              {m.noGoal
                ? <Text style={sc.metricValueSmall}>—</Text>
                : <AnimNumber value={m.value} style={sc.metricValue} />
              }
              {m.suffix && !m.noGoal
                ? <Text style={sc.metricSuffix}>{m.suffix}</Text>
                : null
              }
              <Text style={sc.metricLabel}>{m.label}</Text>
            </View>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}
const sc = StyleSheet.create({
  card: {
    marginHorizontal: spacing(2.5),
    marginBottom:     spacing(2),
    backgroundColor:  CARD,
    borderRadius:     radius.lg,
    borderWidth:      1,
    borderColor:      "#EAE4DC",
    ...shadows.card,
    overflow:         "hidden",
  },
  header:      { paddingHorizontal:spacing(2), paddingTop:spacing(1.75), paddingBottom:spacing(1.25), flexDirection:"row", alignItems:"baseline", justifyContent:"space-between" },
  headerTitle: { fontFamily:SERIF, fontSize:16, color:"#1C1A14", fontWeight:"600" },
  headerSub:   { fontSize:11, color:"#7A7060", letterSpacing:0.5 },
  dividerH:    { height:1, backgroundColor:"#EAE4DC" },
  metricsRow:  { flexDirection:"row", paddingVertical:spacing(2) },
  metric:      { flex:1, alignItems:"center", gap:4 },
  separator:   { width:1, backgroundColor:"#EAE4DC", marginVertical:spacing(0.5) },
  metricValue: { fontFamily:SERIF, fontSize:22, color:"#1C1A14", fontWeight:"400", lineHeight:26 },
  metricValueSmall: { fontFamily:SERIF, fontSize:18, color:"#9A9690", lineHeight:22 },
  metricSuffix:{ fontSize:11, color:"#7A7060", marginTop:-2 },
  metricLabel: { fontSize:10, color:"#7A7060", letterSpacing:0.8, textTransform:"uppercase", textAlign:"center" },
});

// ── Goal progress card ────────────────────────────────────────────────────────
function GoalCard({ goal, count, onEdit }) {
  const pct   = goal > 0 ? Math.min(count/goal,1) : 0;
  const done  = goal > 0 && count >= goal;

  return (
    <View style={gc.card}>
      <View style={gc.header}>
        <View style={gc.headerLeft}>
          <Target size={16} color="#4A5C48" weight="thin" />
          <Text style={gc.title}>Session Goal</Text>
        </View>
        <TouchableOpacity style={gc.editBtn} onPress={onEdit} activeOpacity={0.8}>
          <PencilSimple size={14} color={GOLD} weight="thin" />
          <Text style={gc.editTxt}>{goal > 0 ? "Edit" : "Set goal"}</Text>
        </TouchableOpacity>
      </View>

      {goal > 0 ? (
        <>
          <View style={gc.progressRow}>
            <Text style={gc.countTxt}>{count}</Text>
            <Text style={gc.slash}>{" / "}</Text>
            <Text style={gc.goalTxt}>{goal}</Text>
            {done && <Trophy size={16} color={GOLD} weight="fill" style={{ marginLeft:8 }} />}
          </View>
          <View style={gc.track}>
            <View style={[gc.fill, {width:`${Math.round(pct*100)}%`}, done&&gc.fillDone]} />
          </View>
          <Text style={gc.pctTxt}>{Math.round(pct*100)}% complete</Text>
        </>
      ) : (
        <Text style={gc.noGoal}>No goal set — tap Edit to add one</Text>
      )}
    </View>
  );
}
const gc = StyleSheet.create({
  card:        { marginHorizontal:spacing(2.5), marginBottom:spacing(2), backgroundColor:SURFACE, borderRadius:radius.lg, borderWidth:1, borderColor:MUTED_D, padding:spacing(2) },
  header:      { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:spacing(1.25) },
  headerLeft:  { flexDirection:"row", alignItems:"center", gap:6 },
  title:       { fontSize:12, fontWeight:"700", letterSpacing:1, color:GOLD, textTransform:"uppercase" },
  editBtn:     { flexDirection:"row", alignItems:"center", gap:4 },
  editTxt:     { fontSize:12, color:GOLD },
  progressRow: { flexDirection:"row", alignItems:"baseline", marginBottom:spacing(1) },
  countTxt:    { fontFamily:SERIF, fontSize:28, color:WHITE, fontWeight:"100" },
  slash:       { fontSize:16, color:MUTED },
  goalTxt:     { fontFamily:SERIF, fontSize:16, color:MUTED },
  track:       { height:4, backgroundColor:MUTED_D, borderRadius:2, overflow:"hidden", marginBottom:6 },
  fill:        { height:"100%", backgroundColor:GOLD_D, borderRadius:2 },
  fillDone:    { backgroundColor:GOLD },
  pctTxt:      { fontSize:11, color:MUTED },
  noGoal:      { fontSize:13, color:MUTED, fontStyle:"italic", paddingVertical:spacing(0.5) },
});

// ── Bar chart ─────────────────────────────────────────────────────────────────
function BarChart({ analytics, period }) {
  const keys    = period==="month" ? monthKeys() : weekKeys();
  const every   = period==="month" ? 5 : 1;
  const totals  = keys.map(k=>dayTotal(analytics[k]));
  const max     = Math.max(...totals,1);
  const today   = todayKey();
  const anims   = useRef(keys.map(()=>new Animated.Value(0))).current;

  useEffect(()=>{
    anims.forEach(a=>a.setValue(0));
    Animated.stagger(35, anims.map((a,i)=>
      Animated.timing(a,{toValue:totals[i]/max,duration:480,useNativeDriver:false})
    )).start();
  },[period]);

  return (
    <View style={bch.wrap}>
      <Text style={bch.heading}>
        {period==="today"?"Today":period==="week"?"Last 7 Days":period==="month"?"Last 30 Days":"All Time"}
      </Text>
      <View style={bch.chart}>
        {keys.map((k,i)=>{
          const isToday=k===today;
          return (
            <View key={k} style={bch.col}>
              <Text style={bch.val}>{totals[i]>0?totals[i]>999?Math.round(totals[i]/1000)+"k":totals[i]:""}</Text>
              <View style={bch.track}>
                <Animated.View style={[
                  bch.fill, isToday&&bch.fillToday,
                  {height:anims[i].interpolate({inputRange:[0,1],outputRange:["0%","100%"]})},
                ]} />
              </View>
              {i%every===0||i===keys.length-1
                ? <Text style={[bch.lbl,isToday&&bch.lblToday]}>{period==="month"?i+1:dayLabel(k)}</Text>
                : <Text style={bch.lbl}>{""}</Text>
              }
            </View>
          );
        })}
      </View>
    </View>
  );
}
const bch = StyleSheet.create({
  wrap:      { marginHorizontal:spacing(2.5), marginBottom:spacing(2), backgroundColor:SURFACE, borderRadius:radius.lg, borderWidth:1, borderColor:MUTED_D, padding:spacing(2) },
  heading:   { fontSize:10, fontWeight:"700", letterSpacing:1.5, color:GOLD, marginBottom:spacing(1.75), textTransform:"uppercase" },
  chart:     { flexDirection:"row", alignItems:"flex-end", gap:3, height:88 },
  col:       { flex:1, alignItems:"center", height:"100%" },
  val:       { fontSize:8, color:MUTED, height:11, marginBottom:2, textAlign:"center" },
  track:     { flex:1, width:"100%", backgroundColor:GOLD_F, borderRadius:3, overflow:"hidden", justifyContent:"flex-end" },
  fill:      { width:"100%", backgroundColor:GOLD_D, borderRadius:3 },
  fillToday: { backgroundColor:GOLD },
  lbl:       { fontSize:9, color:MUTED, marginTop:4, textAlign:"center" },
  lblToday:  { color:GOLD, fontWeight:"700" },
});

// ── Per-dhikr breakdown ───────────────────────────────────────────────────────
function DhikrBreakdown({ analytics, period }) {
  const keys   = period==="all" ? Object.keys(analytics)
               : period==="month" ? monthKeys()
               : period==="week"  ? weekKeys()
               : [todayKey()];
  const totals = {};
  keys.forEach(k=>{
    if(!analytics[k]) return;
    Object.entries(analytics[k]).forEach(([id,c])=>{ totals[id]=(totals[id]||0)+c; });
  });
  const entries = Object.entries(totals).sort(([,a],[,b])=>b-a).slice(0,8);
  if(!entries.length) return (
    <View style={db.wrap}>
      <Text style={db.heading}>By Dhikr</Text>
      <Text style={db.empty}>No dhikr recorded for this period</Text>
    </View>
  );
  const maxV = entries[0][1];
  return (
    <View style={db.wrap}>
      <Text style={db.heading}>By Dhikr</Text>
      {entries.map(([id,count],i)=>{
        const d=DHIKRS.find(x=>x.id===id);
        const label=d?d.translit:id;
        const pct=count/maxV;
        return (
          <View key={id} style={[db.row,i<entries.length-1&&db.rowBorder]}>
            <View style={db.left}>
              <Text style={db.name} numberOfLines={1}>{label}</Text>
              {d?<Text style={db.arabic} numberOfLines={1}>{d.arabic}</Text>:null}
            </View>
            <View style={db.barWrap}>
              <View style={db.track}>
                <View style={[db.fill,{width:`${Math.round(pct*100)}%`}]} />
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
  wrap:      { marginHorizontal:spacing(2.5), marginBottom:spacing(4), backgroundColor:SURFACE, borderRadius:radius.lg, borderWidth:1, borderColor:MUTED_D, padding:spacing(2) },
  heading:   { fontSize:10, fontWeight:"700", letterSpacing:1.5, color:GOLD, marginBottom:spacing(1.5), textTransform:"uppercase" },
  empty:     { fontSize:13, color:MUTED, textAlign:"center", paddingVertical:spacing(2) },
  row:       { flexDirection:"row", alignItems:"center", paddingVertical:9, gap:10 },
  rowBorder: { borderBottomWidth:1, borderBottomColor:"rgba(200,185,160,0.08)" },
  left:      { width:110 },
  name:      { fontSize:12, color:WHITE, fontWeight:"500" },
  arabic:    { fontSize:11, color:MUTED, writingDirection:"rtl", marginTop:2 },
  barWrap:   { flex:1 },
  track:     { height:4, backgroundColor:GOLD_F, borderRadius:2, overflow:"hidden" },
  fill:      { height:"100%", backgroundColor:GOLD, borderRadius:2 },
  count:     { fontSize:12, color:GOLD, fontWeight:"600", width:40, textAlign:"right" },
});

// ── Scroll invite ─────────────────────────────────────────────────────────────
function ScrollInvite() {
  const drift = useRef(new Animated.Value(0)).current;
  const fade  = useRef(new Animated.Value(1)).current;
  useEffect(()=>{
    Animated.loop(Animated.parallel([
      Animated.sequence([
        Animated.timing(drift,{toValue:5,duration:1100,useNativeDriver:true}),
        Animated.timing(drift,{toValue:0,duration:1100,useNativeDriver:true}),
      ]),
      Animated.sequence([
        Animated.timing(fade,{toValue:0.30,duration:1100,useNativeDriver:true}),
        Animated.timing(fade,{toValue:1,duration:1100,useNativeDriver:true}),
      ]),
    ])).start();
  },[]);
  return (
    <View style={si.wrap}>
      <View style={si.line} />
      <View style={si.center}>
        <Text style={si.label}>My Dhikr Summary</Text>
        <Animated.View style={{transform:[{translateY:drift}],opacity:fade}}>
          <CaretDown size={14} color={GOLD_D} weight="thin" />
        </Animated.View>
      </View>
      <View style={si.line} />
    </View>
  );
}
const si = StyleSheet.create({
  wrap:   { flexDirection:"row", alignItems:"center", marginHorizontal:spacing(2.5), marginTop:spacing(2.5), marginBottom:spacing(2) },
  line:   { flex:1, height:1, backgroundColor:GOLD_D },
  center: { alignItems:"center", paddingHorizontal:spacing(2), gap:4 },
  label:  { fontSize:10, color:MUTED, letterSpacing:1.5, textTransform:"uppercase" },
});

// ── Info overlay ──────────────────────────────────────────────────────────────
function InfoOverlay({ dhikr, onClose }) {
  const fade=useRef(new Animated.Value(0)).current;
  useEffect(()=>{ Animated.timing(fade,{toValue:1,duration:200,useNativeDriver:true}).start(); },[]);
  const close=()=>{ Animated.timing(fade,{toValue:0,duration:160,useNativeDriver:true}).start(onClose); };
  return (
    <Modal transparent animationType="none" onRequestClose={close}>
      <Animated.View style={[ov.backdrop,{opacity:fade}]}>
        <TouchableWithoutFeedback onPress={close}><View style={StyleSheet.absoluteFill}/></TouchableWithoutFeedback>
        <View style={ov.sheet}>
          <TouchableOpacity style={ov.closeBtn} onPress={close} activeOpacity={0.8}>
            <X size={16} color={MUTED} weight="regular"/>
          </TouchableOpacity>
          <Text style={ov.arabic}>{dhikr.arabic||dhikr.translit}</Text>
          {!!dhikr.translit&&<Text style={ov.translit}>{dhikr.translit}</Text>}
          <View style={ov.div}/>
          {!!dhikr.meaning&&<><Text style={ov.sl}>Meaning</Text><Text style={ov.body}>{dhikr.meaning}</Text></>}
          {!!dhikr.significance&&<><Text style={[ov.sl,{marginTop:14}]}>Significance</Text><Text style={ov.body}>{dhikr.significance}</Text></>}
          {!dhikr.meaning&&!dhikr.significance&&<Text style={ov.body}>Your custom dhikr.</Text>}
        </View>
      </Animated.View>
    </Modal>
  );
}
const ov = StyleSheet.create({
  backdrop: { flex:1, backgroundColor:"rgba(0,0,0,0.65)", justifyContent:"flex-end" },
  sheet:    { backgroundColor:SURFACE, borderTopLeftRadius:24, borderTopRightRadius:24, padding:28, paddingBottom:44 },
  closeBtn: { position:"absolute", top:16, right:16, width:32, height:32, borderRadius:16, backgroundColor:"rgba(255,255,255,0.08)", alignItems:"center", justifyContent:"center" },
  arabic:   { fontFamily:SERIF, fontSize:40, color:WHITE, textAlign:"center", marginTop:8, marginBottom:8, writingDirection:"rtl", lineHeight:56 },
  translit: { fontSize:20, color:GOLD, textAlign:"center", fontStyle:"italic", marginBottom:14 },
  div:      { height:1, backgroundColor:MUTED_D, marginBottom:14 },
  sl:       { fontSize:11, fontWeight:"700", color:GOLD, letterSpacing:1, textTransform:"uppercase", marginBottom:5 },
  body:     { fontSize:15, color:"rgba(245,240,232,0.80)", lineHeight:24 },
});

// ── Dhikr selector modal ──────────────────────────────────────────────────────
function DhikrSelector({ selected, onSelect, onClose }) {
  const [custom, setCustom] = useState("");
  const doCustom = () => {
    if(!custom.trim()) return;
    onSelect({...CUSTOM_TEMPLATE, translit:custom.trim(), en:custom.trim()});
    onClose();
  };
  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}><View style={sel.bg}/></TouchableWithoutFeedback>
      <KeyboardAvoidingView behavior={Platform.OS==="ios"?"padding":undefined} style={sel.kav}>
        <View style={sel.sheet}>
          <View style={sel.handle}/>
          <Text style={sel.title}>Select Dhikr</Text>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {DHIKRS.map(d=>(
              <TouchableOpacity key={d.id} style={[sel.row,d.id===selected.id&&sel.rowOn]}
                onPress={()=>{onSelect(d);onClose();}} activeOpacity={0.8}>
                <View style={sel.left}>
                  <Text style={sel.arabic}>{d.arabic}</Text>
                  <Text style={sel.translit}>{d.translit}</Text>
                  <Text style={sel.en}>{d.en}</Text>
                </View>
                {d.id===selected.id&&<View style={sel.dot}/>}
              </TouchableOpacity>
            ))}
            <View style={sel.customWrap}>
              <Text style={sel.customLbl}>Custom dhikr</Text>
              <View style={sel.customRow}>
                <TextInput style={sel.input} placeholder="Type your dhikr…" placeholderTextColor={MUTED}
                  value={custom} onChangeText={setCustom} returnKeyType="done" onSubmitEditing={doCustom}/>
                <TouchableOpacity style={[sel.useBtn,!custom.trim()&&{opacity:0.4}]}
                  onPress={doCustom} disabled={!custom.trim()} activeOpacity={0.8}>
                  <Text style={sel.useTxt}>Use</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={{height:24}}/>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
const sel = StyleSheet.create({
  bg:        { flex:1, backgroundColor:"rgba(0,0,0,0.5)" },
  kav:       { flex:1, justifyContent:"flex-end" },
  sheet:     { backgroundColor:SURFACE, borderTopLeftRadius:24, borderTopRightRadius:24, maxHeight:"80%", paddingBottom:8 },
  handle:    { width:36, height:4, borderRadius:2, backgroundColor:MUTED_D, alignSelf:"center", marginTop:10, marginBottom:4 },
  title:     { fontFamily:SERIF, fontSize:20, color:WHITE, textAlign:"center", paddingVertical:14, borderBottomWidth:1, borderBottomColor:MUTED_D },
  row:       { paddingHorizontal:24, paddingVertical:14, borderBottomWidth:1, borderBottomColor:"rgba(200,185,160,0.08)", flexDirection:"row", alignItems:"center" },
  rowOn:     { backgroundColor:GOLD_F },
  left:      { flex:1, gap:3, alignItems:"center" },
  arabic:    { fontFamily:SERIF, fontSize:18, color:WHITE, writingDirection:"rtl", textAlign:"center" },
  translit:  { fontSize:13, color:GOLD, fontStyle:"italic", textAlign:"center" },
  en:        { fontSize:11, color:MUTED, textAlign:"center" },
  dot:       { width:8, height:8, borderRadius:4, backgroundColor:GOLD },
  customWrap:{ marginHorizontal:20, marginTop:20, marginBottom:8 },
  customLbl: { fontSize:11, fontWeight:"700", color:GOLD, letterSpacing:0.8, marginBottom:8, textTransform:"uppercase" },
  customRow: { flexDirection:"row", gap:10, alignItems:"center" },
  input:     { flex:1, backgroundColor:"rgba(255,255,255,0.07)", borderRadius:12, borderWidth:1, borderColor:MUTED_D, paddingHorizontal:16, paddingVertical:12, fontSize:15, color:WHITE },
  useBtn:    { backgroundColor:GOLD, borderRadius:12, paddingHorizontal:18, paddingVertical:12 },
  useTxt:    { fontSize:15, fontWeight:"600", color:"#1A1200" },
});

// ── Duration dropdown ─────────────────────────────────────────────────────────
function DurationDropdown({ selected, onSelect }) {
  const [open,setOpen]=useState(false);
  const cur=DURATIONS.find(d=>d.key===selected)??DURATIONS[0];
  return (
    <>
      <TouchableOpacity style={dd.btn} onPress={()=>setOpen(true)} activeOpacity={0.8}>
        <Text style={dd.lbl}>{cur.label}</Text>
        <CaretDown size={13} color={MUTED} weight="regular"/>
      </TouchableOpacity>
      {open&&(
        <Modal transparent animationType="fade" onRequestClose={()=>setOpen(false)}>
          <TouchableWithoutFeedback onPress={()=>setOpen(false)}><View style={dd.backdrop}/></TouchableWithoutFeedback>
          <View style={dd.sheet}>
            {DURATIONS.map(d=>(
              <TouchableOpacity key={d.key} style={dd.row} onPress={()=>{onSelect(d.key);setOpen(false);}} activeOpacity={0.8}>
                <Text style={[dd.rowTxt,d.key===selected&&dd.rowOn]}>{d.label}</Text>
                {d.key===selected&&<View style={dd.dot}/>}
              </TouchableOpacity>
            ))}
          </View>
        </Modal>
      )}
    </>
  );
}
const dd = StyleSheet.create({
  btn:     { flexDirection:"row", alignItems:"center", gap:7, backgroundColor:SURFACE, borderRadius:50, paddingHorizontal:16, paddingVertical:10, borderWidth:1, borderColor:MUTED_D },
  lbl:     { fontSize:13, color:WHITE },
  backdrop:{ flex:1, backgroundColor:"rgba(0,0,0,0.4)" },
  sheet:   { position:"absolute", bottom:80, alignSelf:"center", backgroundColor:SURFACE, borderRadius:16, borderWidth:1, borderColor:MUTED_D, overflow:"hidden", minWidth:190 },
  row:     { paddingHorizontal:22, paddingVertical:13, flexDirection:"row", alignItems:"center", justifyContent:"space-between" },
  rowTxt:  { fontSize:15, color:WHITE },
  rowOn:   { color:GOLD, fontWeight:"500" },
  dot:     { width:7, height:7, borderRadius:3.5, backgroundColor:GOLD },
});

// ── Goal dropdown ─────────────────────────────────────────────────────────────
function GoalDropdown({ goal, onSelect }) {
  const [open,setOpen]=useState(false);
  const [custom,setCustom]=useState("");
  const [showCustom,setShowCustom]=useState(false);
  const cur=GOAL_PRESETS.find(p=>p.value===goal)??GOAL_PRESETS[0];
  const label=goal===0?"No goal":goal===-1?"Custom":String(goal);
  return (
    <>
      <TouchableOpacity style={dd.btn} onPress={()=>setOpen(true)} activeOpacity={0.8}>
        <Target size={13} color={MUTED} weight="thin"/>
        <Text style={dd.lbl}>{label}</Text>
        <CaretDown size={13} color={MUTED} weight="regular"/>
      </TouchableOpacity>
      {open&&(
        <Modal transparent animationType="fade" onRequestClose={()=>{setOpen(false);setShowCustom(false);}}>
          <TouchableWithoutFeedback onPress={()=>{setOpen(false);setShowCustom(false);}}><View style={dd.backdrop}/></TouchableWithoutFeedback>
          <KeyboardAvoidingView behavior={Platform.OS==="ios"?"padding":undefined} style={{position:"absolute",bottom:80,alignSelf:"center",width:220}}>
            <View style={[dd.sheet,{width:220,bottom:0,position:"relative"}]}>
              {GOAL_PRESETS.map(p=>(
                <TouchableOpacity key={p.label} style={dd.row} activeOpacity={0.8}
                  onPress={()=>{
                    if(p.value===-1){setShowCustom(true);return;}
                    onSelect(p.value);setOpen(false);setShowCustom(false);
                  }}>
                  <Text style={[dd.rowTxt,goal===p.value&&dd.rowOn]}>{p.label}</Text>
                  {goal===p.value&&<View style={dd.dot}/>}
                </TouchableOpacity>
              ))}
              {showCustom&&(
                <View style={{paddingHorizontal:16,paddingBottom:12,gap:8}}>
                  <TextInput style={[sel.input,{fontSize:14}]}
                    placeholder="Enter number…" placeholderTextColor={MUTED}
                    value={custom} onChangeText={setCustom}
                    keyboardType="number-pad" autoFocus
                    returnKeyType="done"
                    onSubmitEditing={()=>{
                      const n=parseInt(custom);
                      if(n>0){onSelect(n);setOpen(false);setShowCustom(false);setCustom("");}
                    }}/>
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </>
  );
}

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

  useEffect(()=>{ loadAnalytics().then(setAnalytics); },[]);

  const add = async () => {
    const next=count+1;
    setCount(next);
    if(goal>0&&next===goal){
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const updated=await recordCount(dhikr.id,1);
    setAnalytics({...updated});
  };

  const minus=()=>{ setCount(c=>Math.max(0,c-1)); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };
  const reset=()=>{ setCount(0); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); };

  return (
    <SafeAreaView style={[s.safe,{paddingBottom:insets.bottom}]}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.hBtn} onPress={()=>navigation?.goBack?.()} activeOpacity={0.8}>
          <ArrowLeft size={22} color={WHITE} weight="regular"/>
        </TouchableOpacity>
        <View style={s.hCenter}>
          <Text style={s.title}>Dhikr Counter</Text>
          <Text style={s.sub}>Remember Allah, and find peace.</Text>
        </View>
        <View style={{width:40}}/>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:spacing(6)}}>

        {/* ── Compact selector — gold lines, no box ── */}
        <View style={s.selectorWrap}>
          <View style={s.goldLine}/>
          <TouchableOpacity style={s.selectorRow} onPress={()=>setShowPicker(true)} activeOpacity={0.85}>
            <View style={s.selectorText}>
              {/* Arabic 75% of 51px = ~38px */}
              <Text style={s.selArabic} adjustsFontSizeToFit numberOfLines={1}>
                {dhikr.arabic||dhikr.translit}
              </Text>
              {/* Transliteration 75% of 33px = ~25px */}
              <Text style={s.selTranslit}>{dhikr.translit}</Text>
            </View>
            <CaretDown size={16} color={GOLD_D} weight="regular"/>
          </TouchableOpacity>
          <View style={s.goldLine}/>
        </View>

        {/* Count */}
        <View style={s.countWrap}>
          <Text style={s.countNum}>{count}</Text>
          {goal>0&&(
            <View style={s.goalBar}>
              <View style={[s.goalFill,{width:`${Math.min(Math.round((count/goal)*100),100)}%`}]}/>
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={s.controls}>
          <TouchableOpacity style={s.sideBtn} onPress={minus} activeOpacity={0.8}>
            <Text style={s.sideTxt}>{"−"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.addBtn} onPress={add} activeOpacity={0.85}>
            <Text style={s.addTxt}>{"+"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.sideBtn} onPress={reset} activeOpacity={0.8}>
            <ArrowCounterClockwise size={22} color={WHITE} weight="regular"/>
          </TouchableOpacity>
        </View>

        {/* Duration + Goal row */}
        <View style={s.dropRow}>
          <DurationDropdown selected={duration} onSelect={setDuration}/>
          <GoalDropdown goal={goal} onSelect={setGoal}/>
        </View>

        {/* Translation — 18pt */}
        <View style={s.transRow}>
          <Text style={s.transTxt}>{dhikr.en}</Text>
          <TouchableOpacity style={s.infoBtn} onPress={()=>setShowInfo(true)} activeOpacity={0.8}>
            <Info size={17} color={GOLD} weight="regular"/>
          </TouchableOpacity>
        </View>

        {/* Scroll invite */}
        <ScrollInvite/>

        {/* ── Analytics section ── */}

        {/* Period toggle */}
        <View style={s.periodRow}>
          {PERIODS.map(p=>(
            <TouchableOpacity key={p.key}
              style={[s.periodPill,period===p.key&&s.periodOn]}
              onPress={()=>setPeriod(p.key)} activeOpacity={0.8}>
              <Text style={[s.periodLbl,period===p.key&&s.periodLblOn]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <SummaryCard analytics={analytics} goal={goal} period={period}/>
        <GoalCard goal={goal} count={count} onEdit={()=>setShowPicker(false)}/>
        <BarChart analytics={analytics} period={period}/>
        <DhikrBreakdown analytics={analytics} period={period}/>

      </ScrollView>

      {showPicker&&(
        <DhikrSelector selected={dhikr}
          onSelect={d=>{setDhikr(d);setCount(0);}}
          onClose={()=>setShowPicker(false)}/>
      )}
      {showInfo&&(
        <InfoOverlay dhikr={dhikr} onClose={()=>setShowInfo(false)}/>
      )}

    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex:1, backgroundColor:BG },

  header:  { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:spacing(2.5), paddingTop:spacing(2), paddingBottom:spacing(1) },
  hBtn:    { width:40, height:40, alignItems:"center", justifyContent:"center" },
  hCenter: { flex:1, alignItems:"center" },
  title:   { fontFamily:SERIF, fontSize:28, color:WHITE, fontWeight:"400" },
  sub:     { fontSize:14, color:GOLD, marginTop:3, fontStyle:"italic" },

  // Compact selector with gold lines
  selectorWrap: { marginTop:spacing(2) },
  goldLine:     { height:1, backgroundColor:GOLD_D },
  selectorRow:  { flexDirection:"row", alignItems:"center", justifyContent:"center", paddingVertical:12, paddingHorizontal:spacing(2.5), gap:12 },
  selectorText: { flex:1, alignItems:"center", gap:4 },
  // 75% of previous sizes
  selArabic:    { fontFamily:SERIF, fontSize:38, color:WHITE, writingDirection:"rtl", lineHeight:46, textAlign:"center" },
  selTranslit:  { fontSize:25, color:GOLD, fontStyle:"italic", textAlign:"center" },

  // Count
  countWrap: { alignItems:"center", marginTop:spacing(3), marginBottom:spacing(1) },
  countNum:  { fontSize:128, color:WHITE, fontWeight:"100", lineHeight:138, letterSpacing:-6 },
  goalBar:   { width:140, height:3, backgroundColor:MUTED_D, borderRadius:2, overflow:"hidden", marginTop:6 },
  goalFill:  { height:"100%", backgroundColor:GOLD, borderRadius:2 },

  // Controls
  controls: { flexDirection:"row", alignItems:"center", justifyContent:"center", gap:spacing(3), marginTop:spacing(4), marginBottom:spacing(3.5) },
  sideBtn:  { width:58, height:58, borderRadius:29, backgroundColor:SURFACE, borderWidth:1, borderColor:MUTED_D, alignItems:"center", justifyContent:"center" },
  sideTxt:  { fontSize:30, color:WHITE, fontWeight:"200", lineHeight:36 },
  addBtn:   { width:84, height:84, borderRadius:42, backgroundColor:SURFACE, borderWidth:1.5, borderColor:GOLD, alignItems:"center", justifyContent:"center", shadowColor:GOLD, shadowOffset:{width:0,height:0}, shadowOpacity:0.28, shadowRadius:14, elevation:6 },
  addTxt:   { fontSize:48, color:GOLD, fontWeight:"200", lineHeight:56 },

  // Dropdowns row
  dropRow: { flexDirection:"row", alignItems:"center", justifyContent:"center", gap:spacing(1.5), marginBottom:spacing(3), flexWrap:"wrap", paddingHorizontal:spacing(2) },

  // Translation
  transRow: { marginHorizontal:spacing(2.5), flexDirection:"row", alignItems:"center", justifyContent:"center", gap:10 },
  transTxt: { fontFamily:SERIF, fontSize:18, color:"rgba(245,240,232,0.68)", textAlign:"center", lineHeight:27, fontStyle:"italic", flexShrink:1 },
  infoBtn:  { width:30, height:30, borderRadius:15, backgroundColor:GOLD_F, alignItems:"center", justifyContent:"center", borderWidth:1, borderColor:GOLD_D, flexShrink:0 },

  // Period toggle
  periodRow:  { flexDirection:"row", gap:8, justifyContent:"center", marginBottom:spacing(2), marginHorizontal:spacing(2.5) },
  periodPill: { flex:1, paddingVertical:9, borderRadius:50, borderWidth:1, borderColor:MUTED_D, alignItems:"center" },
  periodOn:   { backgroundColor:GOLD_F, borderColor:GOLD },
  periodLbl:  { fontSize:12, color:MUTED },
  periodLblOn:{ color:GOLD, fontWeight:"600" },
});
