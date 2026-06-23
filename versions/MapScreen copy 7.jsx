/**
 * MapScreen.jsx — Safar
 * Pilgrimage Route Map
 * - Umrah / Hajj toggle
 * - Beautiful illustrated maps (no-label versions)
 * - Pulsing gold dot on map at active step location
 * - Permanent info card below map
 * - Prev / Next stepper
 * - Starts on Ka'bah for both routes
 */
import React, { useState, useRef, useEffect } from "react";
import {
  SafeAreaView, View, Text, Image, TouchableOpacity,
  StyleSheet, Dimensions, ScrollView, Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, HandsPraying } from "phosphor-react-native";
import { spacing, radius } from "../theme";

const { width: SW } = Dimensions.get("window");
const BG    = "#F5EFE4";
const CARD  = "#FDFAF4";
const SAGE  = "#4A5C48";
const GOLD  = "#B8922A";
const GOLD_L= "#C8A96A";
const BORDER= "#E0D8CC";
const TEXT  = "#1C1A14";
const MUTED = "#7A7060";
const SERIF = "SourceSerif4-Regular";

// ── Umrah steps ───────────────────────────────────────────────────────────────
// dot.x and dot.y are fractions of the map image dimensions
const UMRAH_STEPS = [
  {
    id:"kaaba",   step:1, label:"Enter Haram",
    title:"Enter Masjid al-Haram",
    date:null,
    desc:"Enter with your right foot reciting the du\u02bf\u0101 of entry. When the Ka\u02bfbah comes into view, pause \u2014 this is among the most answered moments for du\u02bf\u0101 in the entire pilgrimage.",
    distance:null, duaMode:"umrah",
    dot:{ x:0.43, y:0.47 },
  },
  {
    id:"tawaf",   step:2, label:"Tawaf",
    title:"Tawaf \u2014 7 Circuits",
    date:null,
    desc:"Circumambulate the Ka\u02bfbah seven times counter-clockwise, beginning at the Black Stone. Recite \u2018Bismi-ll\u0101hi All\u0101hu Akbar\u2019 at each start. Between the Yemeni Corner and the Black Stone recite: Rabban\u0101 \u0101tin\u0101 fid-duny\u0101 hasanah.",
    distance:"~1.2km total", duaMode:"umrah",
    dot:{ x:0.43, y:0.47 },
  },
  {
    id:"maqam",   step:3, label:"Maqam Ibrahim",
    title:"Prayer at Maqam Ibrahim",
    date:null,
    desc:"Pray two rak\u02bfahs with Maqam Ibrahim between you and the Ka\u02bfbah. Recite S\u016brah al-K\u0101fir\u016bn in the first rak\u02bfah and S\u016brah al-Ikhl\u0101\u1e63 in the second. Then drink Zamzam water and make du\u02bf\u0101.",
    distance:null, duaMode:"umrah",
    dot:{ x:0.455, y:0.565 },
  },
  {
    id:"safa",    step:4, label:"Safa",
    title:"Sa\u02bfi \u2014 Begin at Safa",
    date:null,
    desc:"Ascend \u1e62af\u0101 and face the Ka\u02bfbah. Make du\u02bf\u0101, recite the du\u02bf\u0101 of \u1e62af\u0101 three times, then walk toward Marwah. Men walk briskly between the green lights \u2014 this is Sunnah.",
    distance:"~450m per length", duaMode:"umrah",
    dot:{ x:0.845, y:0.33 },
  },
  {
    id:"sai",     step:5, label:"Sa\u02bfi",
    title:"Sa\u02bfi \u2014 7 Lengths",
    date:null,
    desc:"Walk seven lengths between \u1e62af\u0101 and Marwah, commemorating H\u0101jar\u2019s search for water. Each one-way walk is one length. Begin at \u1e62af\u0101 and end at Marwah on the seventh length.",
    distance:"~3.15km total", duaMode:"umrah",
    dot:{ x:0.845, y:0.53 },
  },
  {
    id:"halq",    step:6, label:"Halq / Taqseer",
    title:"Halq or Taqseer",
    date:null,
    desc:"Shave the head (Halq) or shorten the hair uniformly (Taqseer) to exit Ihr\u0101m. Men: shaving carries greater reward. Women: cut a fingertip\u2019s length from the ends. Your Umrah is now complete. Alhamdulill\u0101h.",
    distance:null, duaMode:"umrah",
    dot:{ x:0.43, y:0.47 },
    note:"Taw\u0101f al-Wad\u0101\u02bf (farewell Tawaf) is recommended Sunnah before leaving Makkah but is not a required step of Umrah.",
  },
];

// ── Hajj steps ────────────────────────────────────────────────────────────────
const HAJJ_STEPS = [
  {
    id:"ihram",       step:1, label:"Ihram",
    title:"Enter Ihr\u0101m",
    date:"8th Dhul Hijjah",
    desc:"At the M\u012bq\u0101t, make your intention for Hajj, wear the Ihr\u0101m garments, and recite the Talbiyah: Labbayk All\u0101humma labbayk. Continue reciting until you begin the rites.",
    distance:null, duaMode:"hajj",
    dot:{ x:0.185, y:0.50 },
  },
  {
    id:"mina",        step:2, label:"Mina",
    title:"Travel to Min\u0101",
    date:"8th Dhul Hijjah",
    desc:"Travel to Min\u0101 \u2014 the tent city approximately 8km from Makkah. Perform all five daily prayers here, shortening the four rak\u02bfah prayers to two without combining. Spend the night in worship and rest before Arafat.",
    distance:"~8km from Makkah", duaMode:"hajj",
    dot:{ x:0.470, y:0.43 },
  },
  {
    id:"arafat",      step:3, label:"Arafat",
    title:"Wuq\u016bf at \u02bfarafah",
    date:"9th Dhul Hijjah",
    desc:"The most important day of Hajj. Travel to the plain of \u02bfarafah after Fajr. Stand from midday until sunset in continuous du\u02bf\u0101, dhikr, and istighf\u0101r. The Prophet \u0635 said: \u2018Hajj is \u02bfarafah.\u2019 Allah descends and forgives all who stand here.",
    distance:"~14km from Makkah", duaMode:"hajj",
    dot:{ x:0.775, y:0.43 },
  },
  {
    id:"muzdalifah",  step:4, label:"Muzdalifah",
    title:"Night in Muzdalifah",
    date:"Night of 9th Dhul Hijjah",
    desc:"After sunset depart \u02bfarafah and travel to Muzdalifah. Combine Maghrib and Ish\u0101\u02bc prayers on arrival. Spend the night under the open sky \u2014 no tents here. Collect 49\u201370 small pebbles for the Jamar\u0101t. Depart after Fajr.",
    distance:"~9km from Arafat", duaMode:"hajj",
    dot:{ x:0.500, y:0.65 },
  },
  {
    id:"jamarat",     step:5, label:"Jamarat",
    title:"Ram\u012b \u2014 Stoning the Jamar\u0101t",
    date:"10th\u201312th Dhul Hijjah",
    desc:"Return to Min\u0101 and stone the Jamar\u0101t. On the 10th, throw 7 pebbles at Jamar\u0101t al-\u02bfAqabah only. On the 11th and 12th, stone all three pillars in order: small, middle, then large. Say All\u0101hu Akbar with each throw.",
    distance:"In Mina", duaMode:"hajj",
    dot:{ x:0.400, y:0.43 },
  },
  {
    id:"qurbani",     step:6, label:"Qurbani + Halq",
    title:"Sacrifice + Hair",
    date:"10th Dhul Hijjah \u2014 Eid al-Adha",
    desc:"Offer the Qurb\u0101ni (animal sacrifice). Then shave the head (Halq) or trim the hair (Taqseer). This marks partial exit from Ihr\u0101m \u2014 most restrictions are lifted. Marital relations remain prohibited until Taw\u0101f al-If\u0101dah.",
    distance:null, duaMode:"hajj",
    dot:{ x:0.470, y:0.43 },
  },
  {
    id:"ifadah",      step:7, label:"Tawaf al-Ifadah",
    title:"Taw\u0101f al-If\u0101dah + Sa\u02bfi",
    date:"10th Dhul Hijjah",
    desc:"Return to Makkah and perform Taw\u0101f al-If\u0101dah \u2014 the obligatory Taw\u0101f of Hajj \u2014 seven circuits around the Ka\u02bfbah. Follow with Sa\u02bfi between \u1e62af\u0101 and Marwah. All Ihr\u0101m restrictions are then fully lifted.",
    distance:"Return to Makkah", duaMode:"hajj",
    dot:{ x:0.185, y:0.50 },
  },
  {
    id:"wada",        step:8, label:"Farewell Tawaf",
    title:"Taw\u0101f al-Wad\u0101\u02bf",
    date:"Before leaving Makkah",
    desc:"Before departing Makkah perform the farewell Taw\u0101f \u2014 seven final circuits around the Ka\u02bfbah. Leave facing the Ka\u02bfbah if possible, your heart full of gratitude. May Allah accept your Hajj. \u0100m\u012bn.",
    distance:null, duaMode:"hajj",
    dot:{ x:0.185, y:0.50 },
  },
];

// map image aspect ratios
const UMRAH_ASPECT = 0.875;
const HAJJ_ASPECT  = 0.60;

// ── Pulsing dot ───────────────────────────────────────────────────────────────
function PulsingDot({ dotX, dotY, mapW, mapH }) {
  const pulse = useRef(new Animated.Value(1)).current;
  const opac  = useRef(new Animated.Value(0.65)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulse, { toValue:2.0, duration:900, useNativeDriver:true }),
          Animated.timing(pulse, { toValue:1,   duration:900, useNativeDriver:true }),
        ]),
        Animated.sequence([
          Animated.timing(opac, { toValue:0,    duration:900, useNativeDriver:true }),
          Animated.timing(opac, { toValue:0.65, duration:900, useNativeDriver:true }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const cx = dotX * mapW;
  const cy = dotY * mapH;

  return (
    <View style={{ position:"absolute", left:cx - 20, top:cy - 20, width:40, height:40, alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
      <Animated.View style={{
        position:"absolute", width:40, height:40, borderRadius:20,
        borderWidth:2, borderColor:GOLD_L, opacity:opac, transform:[{ scale:pulse }],
      }}/>
      <View style={{
        width:14, height:14, borderRadius:7, backgroundColor:GOLD,
        borderWidth:2.5, borderColor:"#fff",
        shadowColor:"#000", shadowOffset:{width:0,height:2}, shadowOpacity:0.40, shadowRadius:4, elevation:5,
      }}/>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function MapScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [mode,  setMode]  = useState("Umrah");
  const [idx,   setIdx]   = useState(0);

  const steps   = mode === "Hajj" ? HAJJ_STEPS : UMRAH_STEPS;
  const total   = steps.length;
  const current = steps[idx];

  const mapW = SW - spacing(4);
  const mapH = Math.round(mapW * (mode === "Hajj" ? HAJJ_ASPECT : UMRAH_ASPECT));

  const switchMode = (m) => { setMode(m); setIdx(0); };

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.8}>
          <ArrowLeft size={20} color={TEXT} weight="regular"/>
        </TouchableOpacity>
        <View style={s.hCenter}>
          <Text style={s.hTitle}>Pilgrimage Map</Text>
          <Text style={s.hSub}>Step-by-step route guide</Text>
        </View>
        <View style={{ width:36 }}/>
      </View>

      {/* Toggle */}
      <View style={s.toggleWrap}>
        <View style={s.toggle}>
          {["Umrah","Hajj"].map(m => (
            <TouchableOpacity key={m} style={[s.tBtn, mode===m && s.tActive]} onPress={() => switchMode(m)} activeOpacity={0.85}>
              <Text style={[s.tTxt, mode===m && s.tTxtActive]}>{m}</Text>
              <Text style={[s.tSub, mode===m && s.tSubActive]}>{m==="Umrah" ? "Any time of year" : "Dhul Hijjah"}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + spacing(3) }}>

        {/* Map */}
        <View style={[s.mapWrap, { width:mapW, height:mapH, marginHorizontal:spacing(2) }]}>
          <Image
            source={mode === "Hajj"
              ? require("../assets/hajj_route.png")
              : require("../assets/umrah_route.png")}
            style={{ width:mapW, height:mapH }}
            resizeMode="cover"
          />
          <PulsingDot dotX={current.dot.x} dotY={current.dot.y} mapW={mapW} mapH={mapH}/>
        </View>

        {/* Step chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
          {steps.map((step, i) => (
            <TouchableOpacity key={step.id} style={[s.chip, i===idx && s.chipOn]} onPress={() => setIdx(i)} activeOpacity={0.8}>
              <View style={[s.chipNum, i===idx && s.chipNumOn]}>
                <Text style={[s.chipNumTxt, i===idx && s.chipNumTxtOn]}>{step.step}</Text>
              </View>
              <Text style={[s.chipLbl, i===idx && s.chipLblOn]} numberOfLines={1}>{step.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Prev / Next */}
        <View style={s.controls}>
          <TouchableOpacity style={[s.ctrlBtn, idx===0 && s.ctrlDisabled]} onPress={() => setIdx(i => Math.max(0,i-1))} disabled={idx===0} activeOpacity={0.8}>
            <Text style={[s.ctrlArrow, idx===0 && s.ctrlDim]}>{"‹"}</Text>
            <Text style={[s.ctrlLbl, idx===0 && s.ctrlDim]}>Previous</Text>
          </TouchableOpacity>
          <Text style={s.ctrlCounter}>{idx+1}<Text style={s.ctrlOf}>{" of "+total}</Text></Text>
          <TouchableOpacity style={[s.ctrlBtn, idx===total-1 && s.ctrlDisabled]} onPress={() => setIdx(i => Math.min(total-1,i+1))} disabled={idx===total-1} activeOpacity={0.8}>
            <Text style={[s.ctrlLbl, idx===total-1 && s.ctrlDim]}>Next</Text>
            <Text style={[s.ctrlArrow, idx===total-1 && s.ctrlDim]}>{"›"}</Text>
          </TouchableOpacity>
        </View>

        {/* Info card */}
        <View style={s.card}>
          {/* Step pill + date */}
          <View style={s.cardTop}>
            <View style={s.stepPill}>
              <Text style={s.stepTxt}>{"Step "+current.step}</Text>
            </View>
            {current.date ? <Text style={s.cardDate}>{current.date}</Text> : null}
          </View>

          {/* Title */}
          <Text style={s.cardTitle}>{current.title}</Text>

          {/* Distance */}
          {current.distance ? <Text style={s.cardDist}>{current.distance}</Text> : null}

          {/* Description */}
          <Text style={s.cardDesc}>{current.desc}</Text>

          {/* Note (e.g. optional Tawaf al-Wada') */}
          {current.note ? (
            <View style={s.notePill}>
              <Text style={s.noteTxt}>{current.note}</Text>
            </View>
          ) : null}

          {/* Du'ās button */}
          <TouchableOpacity
            style={s.duaBtn}
            onPress={() => navigation?.navigate?.("PilgrimageDuas", { mode: current.duaMode })}
            activeOpacity={0.85}
          >
            <HandsPraying size={16} color="#fff" weight="thin"/>
            <Text style={s.duaBtnTxt}>{"View du\u02bf\u0101s for " + current.label}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex:1, backgroundColor:BG },

  // Header
  header:  { flexDirection:"row", alignItems:"center", paddingHorizontal:spacing(2), paddingTop:spacing(1.5), paddingBottom:spacing(1.5), backgroundColor:BG },
  backBtn: { width:36, height:36, borderRadius:18, backgroundColor:CARD, borderWidth:1, borderColor:BORDER, alignItems:"center", justifyContent:"center" },
  hCenter: { flex:1, alignItems:"center" },
  hTitle:  { fontFamily:SERIF, fontSize:20, color:TEXT },
  hSub:    { fontSize:12, color:MUTED, marginTop:1 },

  // Toggle
  toggleWrap: { paddingHorizontal:spacing(2), paddingBottom:spacing(1.5) },
  toggle:     { flexDirection:"row", backgroundColor:"#EDE8E0", borderRadius:14, padding:3, borderWidth:1, borderColor:BORDER },
  tBtn:       { flex:1, alignItems:"center", paddingVertical:10, borderRadius:11 },
  tActive:    { backgroundColor:SAGE },
  tTxt:       { fontFamily:SERIF, fontSize:16, color:MUTED },
  tTxtActive: { color:"#fff" },
  tSub:       { fontSize:10, color:"rgba(122,112,96,0.70)", marginTop:2 },
  tSubActive: { color:"rgba(255,255,255,0.60)" },

  // Map
  mapWrap: {
    borderRadius:16, overflow:"hidden", marginBottom:spacing(1.5),
    shadowColor:"#1C1408", shadowOffset:{width:0,height:4}, shadowOpacity:0.14, shadowRadius:12, elevation:6,
  },

  // Step chips
  chips: { paddingHorizontal:spacing(2), paddingVertical:spacing(1), gap:8, flexDirection:"row" },
  chip:       { flexDirection:"row", alignItems:"center", gap:6, paddingHorizontal:12, paddingVertical:8, borderRadius:50, borderWidth:1, borderColor:BORDER, backgroundColor:CARD },
  chipOn:     { backgroundColor:SAGE, borderColor:SAGE },
  chipNum:    { width:20, height:20, borderRadius:10, backgroundColor:BORDER, alignItems:"center", justifyContent:"center" },
  chipNumOn:  { backgroundColor:"rgba(255,255,255,0.22)" },
  chipNumTxt: { fontSize:11, fontWeight:"700", color:MUTED },
  chipNumTxtOn:{ color:"#fff" },
  chipLbl:    { fontSize:13, color:MUTED, fontWeight:"500", maxWidth:96 },
  chipLblOn:  { color:"#fff" },

  // Controls
  controls:    { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginHorizontal:spacing(2), marginBottom:spacing(1.5) },
  ctrlBtn:     { flexDirection:"row", alignItems:"center", gap:4, paddingVertical:8, paddingHorizontal:14, borderRadius:50, borderWidth:1, borderColor:BORDER, backgroundColor:CARD },
  ctrlDisabled:{ opacity:0.35 },
  ctrlArrow:   { fontSize:22, color:SAGE, lineHeight:26 },
  ctrlDim:     { color:MUTED },
  ctrlLbl:     { fontSize:14, color:SAGE, fontWeight:"600" },
  ctrlCounter: { fontFamily:SERIF, fontSize:18, color:TEXT },
  ctrlOf:      { fontSize:14, color:MUTED, fontWeight:"400" },

  // Info card
  card:      { backgroundColor:CARD, marginHorizontal:spacing(2), borderRadius:radius.lg, borderWidth:1, borderColor:BORDER, padding:spacing(2) },
  cardTop:   { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:10 },
  stepPill:  { backgroundColor:SAGE, borderRadius:50, paddingHorizontal:12, paddingVertical:4 },
  stepTxt:   { fontSize:12, color:"#fff", fontWeight:"700", letterSpacing:0.5 },
  cardDate:  { fontSize:12, color:MUTED },
  cardTitle: { fontFamily:SERIF, fontSize:21, color:TEXT, marginBottom:4, lineHeight:28 },
  cardDist:  { fontSize:12, color:GOLD, fontWeight:"600", marginBottom:10 },
  cardDesc:  { fontSize:14, color:"#3A3228", lineHeight:23, marginBottom:14 },
  notePill:  { backgroundColor:"#F5EFE4", borderRadius:10, borderWidth:1, borderColor:BORDER, padding:10, marginBottom:14 },
  noteTxt:   { fontSize:12, color:MUTED, fontStyle:"italic", lineHeight:18 },
  duaBtn:    { backgroundColor:SAGE, borderRadius:12, paddingVertical:14, flexDirection:"row", alignItems:"center", justifyContent:"center", gap:8 },
  duaBtnTxt: { fontSize:15, color:"#fff", fontWeight:"600" },
});
