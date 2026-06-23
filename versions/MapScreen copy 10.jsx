/**
 * MapScreen.jsx — Safar
 * Full-screen map background with all UI overlaid:
 * - Back button + toggle: top
 * - Pulsing dot: over active step marker on map
 * - Stepper + card: bottom overlay
 */
import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, Image, TouchableOpacity,
  StyleSheet, Dimensions, Animated, StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, HandsPraying, CaretLeft, CaretRight } from "phosphor-react-native";
import { spacing, radius } from "../theme";

const { width: SW, height: SH } = Dimensions.get("window");

const SAGE   = "#2D4A34";
const GOLD   = "#B8922A";
const GOLD_L = "#C8A96A";
const BORDER = "rgba(224,216,204,0.60)";
const TEXT   = "#1C1A14";
const MUTED  = "#7A7060";
const SERIF  = "SourceSerif4-Regular";

// Card height — used to offset dot positions
const CARD_H = 260;

// ── Step data ─────────────────────────────────────────────────────────────────
// dot.x / dot.y as fraction of SW × (SH - CARD_H - insets)
// These will need on-device tweaking — good starting values from image analysis
const UMRAH_STEPS = [
  {
    id:"enter",  step:1, label:"Enter Haram",
    title:"Enter Masjid al-Haram",
    date:null,
    desc:"Enter with your right foot reciting the du\u02bf\u0101 of entry. When the Ka\u02bfbah comes into view, pause \u2014 this is among the most answered moments for du\u02bf\u0101 in the pilgrimage.",
    distance:null, duaMode:"umrah",
    dot:{ x:0.48, y:0.20 },
    image:require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"tawaf",  step:2, label:"Tawaf",
    title:"Tawaf \u2014 7 Circuits",
    date:null,
    desc:"Circumambulate the Ka\u02bfbah seven times counter-clockwise from the Black Stone. Recite Bismi-ll\u0101hi All\u0101hu Akbar at each start. Between the Yemeni Corner and the Black Stone recite: Rabban\u0101 \u0101tin\u0101 fid-duny\u0101 \u1e25asanah.",
    distance:"~1.2km total", duaMode:"umrah",
    dot:{ x:0.30, y:0.50 },
    image:require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"maqam",  step:3, label:"Maqam Ibrahim",
    title:"Prayer at Maqam Ibrahim",
    date:null,
    desc:"Pray two rak\u02bfahs with Maqam Ibrahim between you and the Ka\u02bfbah. Recite S\u016brah al-K\u0101fir\u016bn then al-Ikhl\u0101\u1e63. Then drink Zamzam and make du\u02bf\u0101.",
    distance:null, duaMode:"umrah",
    dot:{ x:0.48, y:0.63 },
    image:require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"safa",   step:4, label:"Safa",
    title:"Sa\u02bfi \u2014 Begin at Safa",
    date:null,
    desc:"Ascend \u1e62af\u0101, face the Ka\u02bfbah and make du\u02bf\u0101 three times. Then begin walking toward Marwah. Men walk briskly between the green lights.",
    distance:"~450m per length", duaMode:"umrah",
    dot:{ x:0.83, y:0.42 },
    image:require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"sai",    step:5, label:"Sa\u02bfi",
    title:"Sa\u02bfi \u2014 7 Lengths",
    date:null,
    desc:"Walk seven lengths between \u1e62af\u0101 and Marwah. Begin at \u1e62af\u0101, end at Marwah on the seventh. Make du\u02bf\u0101 and dhikr throughout.",
    distance:"~3.15km total", duaMode:"umrah",
    dot:{ x:0.83, y:0.55 },
    image:require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"halq",   step:6, label:"Halq / Taqseer",
    title:"Halq or Taqseer",
    date:null,
    desc:"Shave the head (Halq) or shorten the hair (Taqseer) to exit Ihr\u0101m. Men: shaving carries greater reward. Women: trim a fingertip\u2019s length. Your Umrah is complete. Alhamdulill\u0101h.",
    distance:null, duaMode:"umrah",
    dot:{ x:0.83, y:0.67 },
    image:require("../assets/Umrah_map_test1.png"),
    note:"Taw\u0101f al-Wad\u0101\u02bf before leaving Makkah is recommended Sunnah, not a required step of Umrah.",
  },
];

const HAJJ_STEPS = [
  {
    id:"ihram",      step:1, label:"Ihram",
    title:"Enter Ihr\u0101m",
    date:"8th Dhul Hijjah",
    desc:"At the M\u012bq\u0101t make your intention, wear Ihr\u0101m garments and recite the Talbiyah: Labbayk All\u0101humma labbayk. Continue reciting until you begin the rites.",
    distance:null, duaMode:"hajj",
    dot:{ x:0.20, y:0.48 },
    image:require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"mina",       step:2, label:"Mina",
    title:"Travel to Min\u0101",
    date:"8th Dhul Hijjah",
    desc:"Travel to Min\u0101 ~8km from Makkah. Pray all five prayers here, shortening four rak\u02bfah prayers to two. Spend the night in worship before the Day of Arafat.",
    distance:"~8km from Makkah", duaMode:"hajj",
    dot:{ x:0.47, y:0.42 },
    image:require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"arafat",     step:3, label:"Arafat",
    title:"Wuq\u016bf at \u02bfarafah",
    date:"9th Dhul Hijjah",
    desc:"The most important day of Hajj. Stand at \u02bfarafah from midday to sunset in continuous du\u02bf\u0101, dhikr and istighf\u0101r. The Prophet \u0635 said: \u2018Hajj is \u02bfarafah.\u2019",
    distance:"~14km from Makkah", duaMode:"hajj",
    dot:{ x:0.78, y:0.42 },
    image:require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"muzdalifah", step:4, label:"Muzdalifah",
    title:"Night in Muzdalifah",
    date:"Night of 9th Dhul Hijjah",
    desc:"After sunset travel to Muzdalifah. Combine Maghrib and Ish\u0101\u02bc. Sleep under the open sky. Collect 49\u201370 pebbles. Depart after Fajr.",
    distance:"~9km from Arafat", duaMode:"hajj",
    dot:{ x:0.50, y:0.62 },
    image:require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"jamarat",    step:5, label:"Jamarat",
    title:"Ram\u012b \u2014 Stone the Jamar\u0101t",
    date:"10th\u201312th Dhul Hijjah",
    desc:"Return to Min\u0101. On the 10th throw 7 pebbles at Jamar\u0101t al-\u02bfAqabah. On 11th and 12th stone all three pillars in order. Say All\u0101hu Akbar with each throw.",
    distance:"In Mina", duaMode:"hajj",
    dot:{ x:0.42, y:0.42 },
    image:require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"ifadah",     step:6, label:"Tawaf + Farewell",
    title:"Taw\u0101f al-If\u0101dah + Farewell",
    date:"10th Dhul Hijjah",
    desc:"Return to Makkah and perform Taw\u0101f al-If\u0101dah then Sa\u02bfi. All Ihr\u0101m restrictions are then fully lifted. Perform Taw\u0101f al-Wad\u0101\u02bf before leaving.",
    distance:"Return to Makkah", duaMode:"hajj",
    dot:{ x:0.20, y:0.48 },
    image:require("../assets/Umrah_map_test1.png"),
  },
];

// ── Pulsing ring ──────────────────────────────────────────────────────────────
function PulsingRing({ x, y }) {
  const ring = useRef(new Animated.Value(1)).current;
  const opac = useRef(new Animated.Value(0.75)).current;

  useEffect(() => {
    const a = Animated.loop(Animated.parallel([
      Animated.sequence([
        Animated.timing(ring, { toValue:2.2, duration:900, useNativeDriver:true }),
        Animated.timing(ring, { toValue:1,   duration:900, useNativeDriver:true }),
      ]),
      Animated.sequence([
        Animated.timing(opac, { toValue:0,    duration:900, useNativeDriver:true }),
        Animated.timing(opac, { toValue:0.75, duration:900, useNativeDriver:true }),
      ]),
    ]));
    a.start();
    return () => a.stop();
  }, [x, y]);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { zIndex:10 }]}>
      <View style={{ position:"absolute", left: x - 20, top: y - 20, width:40, height:40, alignItems:"center", justifyContent:"center" }}>
        <Animated.View style={{
          position:"absolute", width:40, height:40, borderRadius:20,
          borderWidth:2.5, borderColor:GOLD_L,
          opacity:opac, transform:[{ scale:ring }],
        }}/>
        <View style={{
          width:14, height:14, borderRadius:7, backgroundColor:GOLD,
          borderWidth:3, borderColor:"#fff",
          shadowColor:"#000", shadowOffset:{width:0,height:2},
          shadowOpacity:0.45, shadowRadius:5, elevation:6,
        }}/>
      </View>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function MapScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState("Umrah");
  const [idx,  setIdx]  = useState(0);

  const steps   = mode === "Hajj" ? HAJJ_STEPS : UMRAH_STEPS;
  const total   = steps.length;
  const current = steps[idx];

  const switchMode = (m) => { setMode(m); setIdx(0); };

  // Dot pixel position — map fills full screen
  const dotX = current.dot.x * SW;
  const dotY = current.dot.y * SH;

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent"/>

      {/* ── Full screen map image ── */}
      <Image
        source={current.image}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      {/* ── Pulsing dot ── */}
      <PulsingRing x={dotX} y={dotY}/>

      {/* ── Top bar: back + toggle ── */}
      <View style={[s.topBar, { top: insets.top + 10 }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <ArrowLeft size={20} color={TEXT} weight="regular"/>
        </TouchableOpacity>

        <View style={s.toggle}>
          {["Umrah","Hajj"].map(m => (
            <TouchableOpacity
              key={m}
              style={[s.tBtn, mode===m && s.tBtnOn]}
              onPress={() => switchMode(m)}
              activeOpacity={0.85}
            >
              <Text style={[s.tTxt, mode===m && s.tTxtOn]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ width:44 }}/>
      </View>

      {/* ── Bottom overlay: stepper + card ── */}
      <View style={[s.bottom, { paddingBottom: insets.bottom + 12 }]}>

        {/* Stepper row */}
        <View style={s.stepperRow}>
          <TouchableOpacity
            style={[s.arrow, idx===0 && s.arrowDim]}
            onPress={() => setIdx(i => Math.max(0,i-1))}
            disabled={idx===0}
            activeOpacity={0.8}
            hitSlop={{top:14,bottom:14,left:14,right:14}}
          >
            <CaretLeft size={18} color={idx===0 ? MUTED : SAGE} weight="bold"/>
          </TouchableOpacity>

          {/* Dot indicators */}
          <View style={s.dotRow}>
            {steps.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => setIdx(i)} hitSlop={{top:8,bottom:8,left:6,right:6}} activeOpacity={0.7}>
                <View style={[s.pip, i===idx && s.pipOn]}/>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[s.arrow, idx===total-1 && s.arrowDim]}
            onPress={() => setIdx(i => Math.min(total-1,i+1))}
            disabled={idx===total-1}
            activeOpacity={0.8}
            hitSlop={{top:14,bottom:14,left:14,right:14}}
          >
            <CaretRight size={18} color={idx===total-1 ? MUTED : SAGE} weight="bold"/>
          </TouchableOpacity>
        </View>

        {/* Info card */}
        <View style={s.card}>
          {/* Top row */}
          <View style={s.cardTop}>
            <View style={s.stepPill}>
              <Text style={s.stepPillTxt}>{"Step " + current.step + " of " + total}</Text>
            </View>
            {current.date
              ? <Text style={s.cardDate}>{current.date}</Text>
              : null
            }
            {current.distance
              ? <Text style={s.cardDist}>{current.distance}</Text>
              : null
            }
          </View>

          {/* Title + desc */}
          <Text style={s.cardTitle}>{current.title}</Text>
          <Text style={s.cardDesc} numberOfLines={3}>{current.desc}</Text>

          {/* Note */}
          {current.note
            ? <Text style={s.cardNote} numberOfLines={2}>{current.note}</Text>
            : null
          }

          {/* Du'ās button */}
          <TouchableOpacity
            style={s.duaBtn}
            onPress={() => navigation?.navigate?.("PilgrimageDuas", { mode: current.duaMode })}
            activeOpacity={0.85}
          >
            <HandsPraying size={15} color="#fff" weight="thin"/>
            <Text style={s.duaBtnTxt}>{"Du\u02bf\u0101s for " + current.label}</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex:1, backgroundColor:"#F5EFE4" },

  // Top bar
  topBar: {
    position:"absolute", left:0, right:0, zIndex:20,
    flexDirection:"row", alignItems:"center", justifyContent:"space-between",
    paddingHorizontal:spacing(2),
  },
  backBtn: {
    width:40, height:40, borderRadius:20,
    backgroundColor:"rgba(253,250,244,0.90)",
    borderWidth:1, borderColor:"rgba(224,216,204,0.70)",
    alignItems:"center", justifyContent:"center",
    shadowColor:"#000", shadowOffset:{width:0,height:2},
    shadowOpacity:0.12, shadowRadius:6, elevation:4,
  },
  toggle:   {
    flexDirection:"row",
    backgroundColor:"rgba(253,250,244,0.92)",
    borderRadius:50, borderWidth:1,
    borderColor:"rgba(224,216,204,0.70)",
    padding:3,
    shadowColor:"#000", shadowOffset:{width:0,height:2},
    shadowOpacity:0.10, shadowRadius:6, elevation:4,
  },
  tBtn:     { paddingHorizontal:20, paddingVertical:8, borderRadius:50 },
  tBtnOn:   { backgroundColor:SAGE },
  tTxt:     { fontFamily:SERIF, fontSize:14, color:MUTED },
  tTxtOn:   { color:"#fff" },

  // Bottom overlay
  bottom: {
    position:"absolute", left:0, right:0, bottom:0, zIndex:20,
  },

  // Stepper
  stepperRow: {
    flexDirection:"row", alignItems:"center", justifyContent:"space-between",
    paddingHorizontal:spacing(2), marginBottom:10,
  },
  arrow:    {
    width:38, height:38, borderRadius:19,
    backgroundColor:"rgba(253,250,244,0.92)",
    borderWidth:1, borderColor:BORDER,
    alignItems:"center", justifyContent:"center",
    shadowColor:"#000", shadowOffset:{width:0,height:2},
    shadowOpacity:0.10, shadowRadius:5, elevation:3,
  },
  arrowDim: { opacity:0.35 },
  dotRow:   { flexDirection:"row", gap:7, alignItems:"center" },
  pip:      { width:7, height:7, borderRadius:4, backgroundColor:"rgba(74,92,72,0.30)" },
  pipOn:    { width:22, backgroundColor:SAGE },

  // Card
  card: {
    marginHorizontal:spacing(2),
    backgroundColor:"rgba(253,250,244,0.97)",
    borderRadius:20,
    borderWidth:1, borderColor:BORDER,
    padding:spacing(2),
    shadowColor:"#000", shadowOffset:{width:0,height:-4},
    shadowOpacity:0.08, shadowRadius:12, elevation:12,
  },
  cardTop:    { flexDirection:"row", alignItems:"center", gap:8, marginBottom:8, flexWrap:"wrap" },
  stepPill:   { backgroundColor:SAGE, borderRadius:50, paddingHorizontal:12, paddingVertical:4 },
  stepPillTxt:{ fontSize:12, color:"#fff", fontWeight:"600" },
  cardDate:   { fontSize:12, color:MUTED },
  cardDist:   { fontSize:12, color:GOLD, fontWeight:"600" },
  cardTitle:  { fontFamily:SERIF, fontSize:19, color:TEXT, marginBottom:5, lineHeight:26 },
  cardDesc:   { fontSize:13, color:"#3A3228", lineHeight:20, marginBottom:12 },
  cardNote:   { fontSize:11, color:MUTED, fontStyle:"italic", lineHeight:16, marginBottom:10 },
  duaBtn:     { backgroundColor:SAGE, borderRadius:11, paddingVertical:12, flexDirection:"row", alignItems:"center", justifyContent:"center", gap:8 },
  duaBtnTxt:  { fontSize:14, color:"#fff", fontWeight:"600" },
});
