/**
 * MapScreen.jsx — Safar
 * Pilgrimage Route Map — Umrah (test) + Hajj
 *
 * Layout:
 *   - Map image rendered proportionally (contain) at top of screen
 *   - Pulsing gold ring overlay on active step marker (pre-baked in image)
 *   - Compact stepper row: ‹ Step X of N ›
 *   - Info card: step title, date/distance, description, Du'ās button
 *
 * Image names (drop in assets/):
 *   umrah_step_1.png … umrah_step_6.png
 *   hajj_step_1.png  … hajj_step_6.png
 *   (test image: Umrah_map_test1.png used for all 6 umrah steps until finals ready)
 */
import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, Image, TouchableOpacity,
  StyleSheet, Dimensions, ScrollView, Animated,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, HandsPraying, CaretLeft, CaretRight } from "phosphor-react-native";
import { spacing, radius } from "../theme";

const { width: SW, height: SH } = Dimensions.get("window");

// ── Image aspect ratio ─────────────────────────────────────────────────────────
// Umrah_map_test1.png is 828 × 1792 → ratio 0.462 (width/height)
// We render it at full SW width — height = SW / 0.462
// But cap at ~62% of screen height so card is always visible without scrolling
const IMG_NATIVE_W = 828;
const IMG_NATIVE_H = 1792;
const IMG_RATIO    = IMG_NATIVE_W / IMG_NATIVE_H;  // ~0.462
const MAP_W        = SW;
const MAP_H        = Math.min(Math.round(SW / IMG_RATIO), Math.round(SH * 0.62));

const BG     = "#F5EFE4";
const CARD   = "#FDFAF4";
const SAGE   = "#2D4A34";
const SAGE_L = "#4A5C48";
const GOLD   = "#B8922A";
const GOLD_L = "#C8A96A";
const BORDER = "#E0D8CC";
const TEXT   = "#1C1A14";
const MUTED  = "#7A7060";
const SERIF  = "SourceSerif4-Regular";

// ── Step data ─────────────────────────────────────────────────────────────────
// dot.x and dot.y are fractions of MAP_W × MAP_H
// Measured from Umrah_map_test1.png marker centres
const UMRAH_STEPS = [
  {
    id:"enter",   step:1, label:"Enter Haram",
    title:"Enter Masjid al-Haram",
    date:null,
    desc:"Enter with your right foot reciting the du\u02bf\u0101 of entry. When the Ka\u02bfbah comes into view, stop and make du\u02bf\u0101 \u2014 this is one of the most answered moments of the entire pilgrimage.",
    distance:null, duaMode:"umrah",
    dot:{ x:0.48, y:0.20 },
    // test: all 6 steps use the same image until finals are ready
    image: require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"tawaf",   step:2, label:"Tawaf",
    title:"Tawaf \u2014 7 Circuits",
    date:null,
    desc:"Circumambulate the Ka\u02bfbah seven times counter-clockwise, beginning at the Black Stone. Recite Bismi-ll\u0101hi All\u0101hu Akbar at each circuit start. Between the Yemeni Corner and the Black Stone recite: Rabban\u0101 \u0101tin\u0101 fid-duny\u0101 \u1e25asanah.",
    distance:"~1.2km total", duaMode:"umrah",
    dot:{ x:0.30, y:0.50 },
    image: require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"maqam",   step:3, label:"Maqam Ibrahim",
    title:"Prayer at Maqam Ibrahim",
    date:null,
    desc:"After completing Tawaf, pray two rak\u02bfahs with Maqam Ibrahim between you and the Ka\u02bfbah if possible. Recite S\u016brah al-K\u0101fir\u016bn then al-Ikhl\u0101\u1e63. Then drink Zamzam water and make du\u02bf\u0101.",
    distance:null, duaMode:"umrah",
    dot:{ x:0.48, y:0.63 },
    image: require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"safa",    step:4, label:"Safa",
    title:"Sa\u02bfi \u2014 Begin at Safa",
    date:null,
    desc:"Walk to \u1e62af\u0101, ascend if possible, face the Ka\u02bfbah and make du\u02bf\u0101 three times. Then begin walking toward Marwah. Men walk briskly between the green lights. This commemorates H\u0101jar\u2019s search for water for Ism\u0101\u02bfil.",
    distance:"~450m per length", duaMode:"umrah",
    dot:{ x:0.83, y:0.56 },
    image: require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"sai",     step:5, label:"Sa\u02bfi",
    title:"Sa\u02bfi \u2014 7 Lengths",
    date:null,
    desc:"Walk seven lengths between \u1e62af\u0101 and Marwah. Begin at \u1e62af\u0101, end at Marwah on the seventh. Each one-way walk counts as one length. Make du\u02bf\u0101 and dhikr throughout.",
    distance:"~3.15km total", duaMode:"umrah",
    dot:{ x:0.83, y:0.68 },
    image: require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"halq",    step:6, label:"Halq / Taqseer",
    title:"Halq or Taqseer",
    date:null,
    desc:"Shave the head (Halq) or shorten the hair (Taqseer) to exit the state of Ihr\u0101m. Men: shaving carries greater reward. Women: trim a fingertip\u2019s length from the hair ends. Your Umrah is now complete. Alhamdulill\u0101h.",
    distance:null, duaMode:"umrah",
    dot:{ x:0.83, y:0.80 },
    image: require("../assets/Umrah_map_test1.png"),
    note:"Taw\u0101f al-Wad\u0101\u02bf is recommended Sunnah before leaving Makkah but is not a required step of Umrah.",
  },
];

const HAJJ_STEPS = [
  {
    id:"ihram",      step:1, label:"Ihram",
    title:"Enter Ihr\u0101m",
    date:"8th Dhul Hijjah",
    desc:"At the M\u012bq\u0101t make your intention for Hajj, wear Ihr\u0101m garments and recite the Talbiyah: Labbayk All\u0101humma labbayk. Continue reciting until you begin the rites.",
    distance:null, duaMode:"hajj",
    dot:{ x:0.20, y:0.48 },
    image: require("../assets/Umrah_map_test1.png"), // placeholder
  },
  {
    id:"mina",       step:2, label:"Mina",
    title:"Travel to Min\u0101",
    date:"8th Dhul Hijjah",
    desc:"Travel to Min\u0101 ~8km from Makkah. Pray all five prayers here shortening four rak\u02bfah prayers to two. Spend the night in worship before the Day of Arafat.",
    distance:"~8km from Makkah", duaMode:"hajj",
    dot:{ x:0.47, y:0.42 },
    image: require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"arafat",     step:3, label:"Arafat",
    title:"Wuq\u016bf at \u02bfarafah",
    date:"9th Dhul Hijjah",
    desc:"The most important day of Hajj. Stand at the plain of \u02bfarafah from midday to sunset in continuous du\u02bf\u0101, dhikr and istighf\u0101r. The Prophet \u0635 said: \u2018Hajj is \u02bfarafah.\u2019",
    distance:"~14km from Makkah", duaMode:"hajj",
    dot:{ x:0.78, y:0.42 },
    image: require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"muzdalifah", step:4, label:"Muzdalifah",
    title:"Night in Muzdalifah",
    date:"Night of 9th Dhul Hijjah",
    desc:"After sunset travel to Muzdalifah. Combine Maghrib and Ish\u0101\u02bc prayers. Sleep under the open sky. Collect 49\u201370 pebbles. Depart after Fajr.",
    distance:"~9km from Arafat", duaMode:"hajj",
    dot:{ x:0.50, y:0.62 },
    image: require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"jamarat",    step:5, label:"Jamarat",
    title:"Ram\u012b \u2014 Stone the Jamar\u0101t",
    date:"10th\u201312th Dhul Hijjah",
    desc:"Return to Min\u0101. On the 10th throw 7 pebbles at Jamar\u0101t al-\u02bfAqabah. On 11th and 12th stone all three pillars in order. Say All\u0101hu Akbar with each throw.",
    distance:"In Mina", duaMode:"hajj",
    dot:{ x:0.42, y:0.42 },
    image: require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"ifadah",     step:6, label:"Tawaf + Farewell",
    title:"Taw\u0101f al-If\u0101dah + Farewell",
    date:"10th Dhul Hijjah",
    desc:"Return to Makkah and perform Taw\u0101f al-If\u0101dah \u2014 the obligatory Taw\u0101f of Hajj \u2014 followed by Sa\u02bfi. All Ihr\u0101m restrictions are then fully lifted. Perform Taw\u0101f al-Wad\u0101\u02bf before leaving.",
    distance:"Return to Makkah", duaMode:"hajj",
    dot:{ x:0.20, y:0.48 },
    image: require("../assets/Umrah_map_test1.png"),
  },
];

// ── Pulsing ring overlay ───────────────────────────────────────────────────────
function PulsingRing({ dot, mapH }) {
  const ring  = useRef(new Animated.Value(1)).current;
  const opac  = useRef(new Animated.Value(0.75)).current;

  useEffect(() => {
    const a = Animated.loop(Animated.parallel([
      Animated.sequence([
        Animated.timing(ring, { toValue:2.0, duration:900, useNativeDriver:true }),
        Animated.timing(ring, { toValue:1,   duration:900, useNativeDriver:true }),
      ]),
      Animated.sequence([
        Animated.timing(opac, { toValue:0,    duration:900, useNativeDriver:true }),
        Animated.timing(opac, { toValue:0.75, duration:900, useNativeDriver:true }),
      ]),
    ]));
    a.start();
    return () => a.stop();
  }, [dot.x, dot.y]);

  const cx = dot.x * MAP_W - 22;
  const cy = dot.y * mapH - 22;

  return (
    <View
      pointerEvents="none"
      style={{ position:"absolute", left:cx, top:cy, width:44, height:44, alignItems:"center", justifyContent:"center" }}
    >
      {/* Outer pulsing ring */}
      <Animated.View style={{
        position:"absolute",
        width:44, height:44, borderRadius:22,
        borderWidth:2.5,
        borderColor:GOLD_L,
        opacity:opac,
        transform:[{ scale:ring }],
      }}/>
      {/* Inner solid dot */}
      <View style={{
        width:16, height:16, borderRadius:8,
        backgroundColor:GOLD,
        borderWidth:3, borderColor:"#fff",
        shadowColor:"#000",
        shadowOffset:{ width:0, height:2 },
        shadowOpacity:0.40,
        shadowRadius:5,
        elevation:6,
      }}/>
    </View>
  );
}

// ── Screen ─────────────────────────────────────────────────────────────────────
export default function MapScreen({ navigation }) {
  const insets  = useSafeAreaInsets();
  const [mode,  setMode]  = useState("Umrah");
  const [idx,   setIdx]   = useState(0);

  const steps   = mode === "Hajj" ? HAJJ_STEPS : UMRAH_STEPS;
  const total   = steps.length;
  const current = steps[idx];

  const switchMode = (m) => { setMode(m); setIdx(0); };

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content"/>

      {/* ── Header bar ── */}
      <View style={s.headerBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <ArrowLeft size={20} color={TEXT} weight="regular"/>
        </TouchableOpacity>
        {/* Umrah / Hajj toggle */}
        <View style={s.toggle}>
          {["Umrah","Hajj"].map(m => (
            <TouchableOpacity
              key={m}
              style={[s.toggleBtn, mode===m && s.toggleBtnOn]}
              onPress={() => switchMode(m)}
              activeOpacity={0.85}
            >
              <Text style={[s.toggleTxt, mode===m && s.toggleTxtOn]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ width:38 }}/>
      </View>

      {/* ── Map image + dot overlay ── */}
      <View style={[s.mapWrap, { height: MAP_H }]}>
        <Image
          source={current.image}
          style={{ width: MAP_W, height: MAP_H }}
          resizeMode="contain"
        />
        <PulsingRing dot={current.dot} mapH={MAP_H}/>
      </View>

      {/* ── Stepper row ── */}
      <View style={s.stepperRow}>
        <TouchableOpacity
          style={[s.stepArrow, idx===0 && s.stepArrowDim]}
          onPress={() => setIdx(i => Math.max(0, i-1))}
          disabled={idx===0}
          activeOpacity={0.8}
          hitSlop={{top:12,bottom:12,left:12,right:12}}
        >
          <CaretLeft size={18} color={idx===0 ? MUTED : SAGE} weight="bold"/>
        </TouchableOpacity>

        {/* Step dots */}
        <View style={s.dotRow}>
          {steps.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => setIdx(i)} hitSlop={{top:8,bottom:8,left:6,right:6}} activeOpacity={0.7}>
              <View style={[s.stepDot, i===idx && s.stepDotOn]}/>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[s.stepArrow, idx===total-1 && s.stepArrowDim]}
          onPress={() => setIdx(i => Math.min(total-1, i+1))}
          disabled={idx===total-1}
          activeOpacity={0.8}
          hitSlop={{top:12,bottom:12,left:12,right:12}}
        >
          <CaretRight size={18} color={idx===total-1 ? MUTED : SAGE} weight="bold"/>
        </TouchableOpacity>
      </View>

      {/* ── Info card ── */}
      <View style={s.card}>
        {/* Step label + date */}
        <View style={s.cardTop}>
          <View style={s.stepPill}>
            <Text style={s.stepPillTxt}>{"Step " + current.step + " of " + total}</Text>
          </View>
          {current.date
            ? <Text style={s.cardDate}>{current.date}</Text>
            : null
          }
        </View>

        {/* Title */}
        <Text style={s.cardTitle}>{current.title}</Text>

        {/* Distance */}
        {current.distance
          ? <Text style={s.cardDist}>{current.distance}</Text>
          : null
        }

        {/* Description */}
        <Text style={s.cardDesc}>{current.desc}</Text>

        {/* Optional note */}
        {current.note
          ? <View style={s.notePill}><Text style={s.noteTxt}>{current.note}</Text></View>
          : null
        }

        {/* Du'ās button */}
        <TouchableOpacity
          style={s.duaBtn}
          onPress={() => navigation?.navigate?.("PilgrimageDuas", { mode: current.duaMode })}
          activeOpacity={0.85}
        >
          <HandsPraying size={16} color="#fff" weight="thin"/>
          <Text style={s.duaBtnTxt}>{"Du\u02bf\u0101s for " + current.label}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex:1, backgroundColor:BG },

  // Header
  headerBar: {
    flexDirection:"row", alignItems:"center", justifyContent:"space-between",
    paddingHorizontal:spacing(2), paddingVertical:10,
    backgroundColor:BG,
  },
  backBtn: {
    width:38, height:38, borderRadius:19,
    backgroundColor:CARD, borderWidth:1, borderColor:BORDER,
    alignItems:"center", justifyContent:"center",
  },
  toggle:       { flexDirection:"row", backgroundColor:"#EDE8E0", borderRadius:50, padding:3, borderWidth:1, borderColor:BORDER },
  toggleBtn:    { paddingHorizontal:22, paddingVertical:8, borderRadius:50 },
  toggleBtnOn:  { backgroundColor:SAGE },
  toggleTxt:    { fontFamily:SERIF, fontSize:14, color:MUTED },
  toggleTxtOn:  { color:"#fff" },

  // Map
  mapWrap: {
    width:MAP_W,
    overflow:"hidden",
    backgroundColor:BG,
  },

  // Stepper
  stepperRow: {
    flexDirection:"row", alignItems:"center", justifyContent:"space-between",
    paddingHorizontal:spacing(2.5),
    paddingVertical:10,
    backgroundColor:BG,
  },
  stepArrow:    { width:36, height:36, borderRadius:18, backgroundColor:CARD, borderWidth:1, borderColor:BORDER, alignItems:"center", justifyContent:"center" },
  stepArrowDim: { opacity:0.35 },
  dotRow:       { flexDirection:"row", gap:8, alignItems:"center" },
  stepDot:      { width:7, height:7, borderRadius:4, backgroundColor:BORDER },
  stepDotOn:    { width:20, backgroundColor:SAGE },

  // Info card
  card: {
    marginHorizontal:spacing(2), marginBottom:spacing(2),
    backgroundColor:CARD,
    borderRadius:radius.lg,
    borderWidth:1, borderColor:BORDER,
    padding:spacing(2),
    shadowColor:"#1C1408",
    shadowOffset:{ width:0, height:3 },
    shadowOpacity:0.10,
    shadowRadius:10,
    elevation:4,
  },
  cardTop:    { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:10 },
  stepPill:   { backgroundColor:SAGE, borderRadius:50, paddingHorizontal:12, paddingVertical:4 },
  stepPillTxt:{ fontSize:12, color:"#fff", fontWeight:"600" },
  cardDate:   { fontSize:12, color:MUTED },
  cardTitle:  { fontFamily:SERIF, fontSize:20, color:TEXT, marginBottom:4, lineHeight:27 },
  cardDist:   { fontSize:12, color:GOLD, fontWeight:"600", marginBottom:8 },
  cardDesc:   { fontSize:14, color:"#3A3228", lineHeight:22, marginBottom:14 },
  notePill:   { backgroundColor:"#F5EFE4", borderRadius:10, borderWidth:1, borderColor:BORDER, padding:10, marginBottom:14 },
  noteTxt:    { fontSize:12, color:MUTED, fontStyle:"italic", lineHeight:18 },
  duaBtn:     { backgroundColor:SAGE, borderRadius:12, paddingVertical:13, flexDirection:"row", alignItems:"center", justifyContent:"center", gap:8 },
  duaBtnTxt:  { fontSize:15, color:"#fff", fontWeight:"600" },
});
