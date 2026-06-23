/**
 * MapScreen.jsx — Safar
 * Pilgrimage Route Map — full screen
 * - Full screen illustrated map (no tab bar)
 * - Condensed overlay card at bottom
 * - Pulsing gold dot on active step location
 * - Umrah / Hajj toggle
 * - Compact prev/next stepper
 * Images: umrah_route_nolabels.png · hajj_route_nolabels.png
 */
import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, Image, TouchableOpacity,
  StyleSheet, Dimensions, ScrollView, Animated,
  StatusBar, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, HandsPraying, CaretLeft, CaretRight } from "phosphor-react-native";
import { spacing, radius } from "../theme";

const { width: SW, height: SH } = Dimensions.get("window");

const CARD_H = 220;   // overlay card height
const CARD_H_NOTE = 248; // taller when there's a note

const BG    = "#F5EFE4";
const CARD  = "rgba(253,250,244,0.97)";
const SAGE  = "#4A5C48";
const GOLD  = "#B8922A";
const GOLD_L= "#C8A96A";
const BORDER= "rgba(224,216,204,0.80)";
const TEXT  = "#1C1A14";
const MUTED = "#7A7060";
const SERIF = "SourceSerif4-Regular";

// ── Umrah steps ───────────────────────────────────────────────────────────────
// dot positions as fraction of rendered map dimensions
// umrah_route_nolabels.png: isometric top-down mosque, fills full frame
// Masjid: x≈10-90%, y≈15-92%  |  Sa'i corridor right side x≈82-92%
const UMRAH_STEPS = [
  {
    id:"enter",  step:1, label:"Enter Haram",
    title:"Enter Masjid al-Haram",
    date:null,
    desc:"Enter with your right foot reciting the du\u02bf\u0101 of entry. When the Ka\u02bfbah comes into view pause \u2014 this is among the most answered moments for du\u02bf\u0101 in the pilgrimage.",
    distance:null, duaMode:"umrah",
    dot:{ x:0.43, y:0.46 },
  },
  {
    id:"tawaf",  step:2, label:"Tawaf",
    title:"Tawaf \u2014 7 Circuits",
    date:null,
    desc:"Circumambulate the Ka\u02bfbah seven times counter-clockwise from the Black Stone. Recite Bismi-ll\u0101hi All\u0101hu Akbar at each start. Between the Yemeni Corner and the Black Stone recite: Rabban\u0101 \u0101tin\u0101 fid-duny\u0101 hasanah.",
    distance:"~1.2km total", duaMode:"umrah",
    dot:{ x:0.43, y:0.46 },
  },
  {
    id:"maqam",  step:3, label:"Maqam Ibrahim",
    title:"Prayer at Maqam Ibrahim",
    date:null,
    desc:"Pray two rak\u02bfahs with Maqam Ibrahim between you and the Ka\u02bfbah. Recite S\u016brah al-K\u0101fir\u016bn then al-Ikhl\u0101\u1e63. Then drink Zamzam and make du\u02bf\u0101.",
    distance:null, duaMode:"umrah",
    dot:{ x:0.455, y:0.565 },
  },
  {
    id:"safa",   step:4, label:"Safa",
    title:"Sa\u02bfi \u2014 Start at Safa",
    date:null,
    desc:"Ascend \u1e62af\u0101, face the Ka\u02bfbah and make du\u02bf\u0101. Men walk briskly between the green lights. Each walk from \u1e62af\u0101 to Marwah or back is one length.",
    distance:"~450m per length", duaMode:"umrah",
    dot:{ x:0.862, y:0.305 },
  },
  {
    id:"sai",    step:5, label:"Sa\u02bfi",
    title:"Sa\u02bfi \u2014 7 Lengths",
    date:null,
    desc:"Walk seven lengths between \u1e62af\u0101 and Marwah. Begin at \u1e62af\u0101, end at Marwah on the seventh. This commemorates H\u0101jar\u2019s search for water for her son Ism\u0101\u02bfil.",
    distance:"~3.15km total", duaMode:"umrah",
    dot:{ x:0.862, y:0.585 },
  },
  {
    id:"halq",   step:6, label:"Halq / Taqseer",
    title:"Halq or Taqseer",
    date:null,
    desc:"Shave the head (Halq) or shorten the hair (Taqseer) to exit Ihr\u0101m. Men: shaving carries greater reward. Women: cut a fingertip\u2019s length. Your Umrah is complete. Alhamdulill\u0101h.",
    distance:null, duaMode:"umrah",
    dot:{ x:0.43, y:0.46 },
    note:"Taw\u0101f al-Wad\u0101\u02bf before leaving is recommended Sunnah but not a required step of Umrah.",
  },
];

// ── Hajj steps ────────────────────────────────────────────────────────────────
// hajj_route_nolabels.png: illustrated map with content in top ~58% of image
// Makkah left x≈15%, Mina centre x≈47%, Arafat right x≈78%, Muzdalifah below centre x≈50%
const HAJJ_STEPS = [
  {
    id:"ihram",       step:1, label:"Ihram",
    title:"Enter Ihr\u0101m",
    date:"8th Dhul Hijjah",
    desc:"At the M\u012bq\u0101t make your intention, wear Ihr\u0101m garments and recite the Talbiyah: Labbayk All\u0101humma labbayk. Continue reciting until you begin the rites in Makkah.",
    distance:null, duaMode:"hajj",
    dot:{ x:0.185, y:0.46 },
  },
  {
    id:"mina",        step:2, label:"Mina",
    title:"Travel to Min\u0101",
    date:"8th Dhul Hijjah",
    desc:"Travel to Min\u0101 \u2014 the tent city ~8km from Makkah. Pray all five prayers here, shortening four rak\u02bfah prayers to two. Spend the night in worship before the Day of Arafat.",
    distance:"~8km from Makkah", duaMode:"hajj",
    dot:{ x:0.470, y:0.40 },
  },
  {
    id:"arafat",      step:3, label:"Arafat",
    title:"Wuq\u016bf at \u02bfarafah",
    date:"9th Dhul Hijjah",
    desc:"The most important day of Hajj. Stand at the plain of \u02bfarafah from midday to sunset in continuous du\u02bf\u0101, dhikr and istighf\u0101r. The Prophet \u0635 said: \u2018Hajj is \u02bfarafah.\u2019",
    distance:"~14km from Makkah", duaMode:"hajj",
    dot:{ x:0.778, y:0.40 },
  },
  {
    id:"muzdalifah",  step:4, label:"Muzdalifah",
    title:"Night in Muzdalifah",
    date:"Night of 9th Dhul Hijjah",
    desc:"After sunset travel to Muzdalifah. Combine Maghrib and Ish\u0101\u02bc prayers. Sleep under the open sky. Collect 49\u201370 small pebbles for the Jamar\u0101t. Depart after Fajr.",
    distance:"~9km from Arafat", duaMode:"hajj",
    dot:{ x:0.500, y:0.620 },
  },
  {
    id:"jamarat",     step:5, label:"Jamarat",
    title:"Ram\u012b \u2014 Stone the Jamar\u0101t",
    date:"10th\u201312th Dhul Hijjah",
    desc:"Return to Min\u0101. On the 10th throw 7 pebbles at Jamar\u0101t al-\u02bfAqabah only. On the 11th and 12th stone all three pillars in order: small, middle, large. Say All\u0101hu Akbar with each throw.",
    distance:"In Mina", duaMode:"hajj",
    dot:{ x:0.420, y:0.40 },
  },
  {
    id:"qurbani",     step:6, label:"Qurbani + Halq",
    title:"Sacrifice + Hair",
    date:"10th Dhul Hijjah \u2014 Eid al-Adha",
    desc:"Offer the Qurb\u0101ni then shave or trim hair to partially exit Ihr\u0101m. Most restrictions lift after this. Marital relations remain prohibited until Taw\u0101f al-If\u0101dah is complete.",
    distance:null, duaMode:"hajj",
    dot:{ x:0.470, y:0.40 },
  },
  {
    id:"ifadah",      step:7, label:"Tawaf al-Ifadah",
    title:"Taw\u0101f al-If\u0101dah + Sa\u02bfi",
    date:"10th Dhul Hijjah",
    desc:"Return to Makkah and perform Taw\u0101f al-If\u0101dah \u2014 the obligatory Taw\u0101f of Hajj \u2014 seven circuits then Sa\u02bfi. All Ihr\u0101m restrictions are then fully lifted.",
    distance:"Return to Makkah", duaMode:"hajj",
    dot:{ x:0.185, y:0.46 },
  },
  {
    id:"wada",        step:8, label:"Farewell Tawaf",
    title:"Taw\u0101f al-Wad\u0101\u02bf",
    date:"Before leaving Makkah",
    desc:"Before departing Makkah perform the farewell Taw\u0101f \u2014 seven final circuits around the Ka\u02bfbah. May Allah accept your Hajj. \u0100m\u012bn.",
    distance:null, duaMode:"hajj",
    dot:{ x:0.185, y:0.46 },
  },
];

// ── Pulsing dot ───────────────────────────────────────────────────────────────
function PulsingDot({ dotX, dotY, mapW, mapH }) {
  const ring  = useRef(new Animated.Value(1)).current;
  const opac  = useRef(new Animated.Value(0.70)).current;

  useEffect(() => {
    const a = Animated.loop(Animated.parallel([
      Animated.sequence([
        Animated.timing(ring, { toValue:2.2, duration:900, useNativeDriver:true }),
        Animated.timing(ring, { toValue:1,   duration:900, useNativeDriver:true }),
      ]),
      Animated.sequence([
        Animated.timing(opac, { toValue:0,    duration:900, useNativeDriver:true }),
        Animated.timing(opac, { toValue:0.70, duration:900, useNativeDriver:true }),
      ]),
    ]));
    a.start();
    return () => a.stop();
  }, [dotX, dotY]);

  const cx = dotX * mapW;
  const cy = dotY * mapH;

  return (
    <View pointerEvents="none" style={{ position:"absolute", left:cx-22, top:cy-22, width:44, height:44, alignItems:"center", justifyContent:"center" }}>
      <Animated.View style={{
        position:"absolute", width:44, height:44, borderRadius:22,
        borderWidth:2, borderColor:GOLD_L, opacity:opac, transform:[{ scale:ring }],
      }}/>
      <View style={{
        width:16, height:16, borderRadius:8, backgroundColor:GOLD,
        borderWidth:3, borderColor:"#fff",
        shadowColor:"#000", shadowOffset:{width:0,height:2}, shadowOpacity:0.45, shadowRadius:5, elevation:6,
      }}/>
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
  const hasNote = !!current.note;

  const switchMode = (m) => { setMode(m); setIdx(0); };

  // Map fills full screen — card overlays at bottom
  const mapW = SW;
  const mapH = SH;

  // Card height
  const cardH = hasNote ? CARD_H_NOTE : CARD_H;

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content"/>

      {/* Full screen map */}
      <Image
        source={mode === "Hajj"
          ? require("../assets/hajj_route_nolabels.png")
          : require("../assets/umrah_route_nolabels.png")}
        style={{ width:mapW, height:mapH, position:"absolute", top:0, left:0 }}
        resizeMode="cover"
      />

      {/* Pulsing dot */}
      <PulsingDot
        dotX={current.dot.x}
        dotY={current.dot.y}
        mapW={mapW}
        mapH={mapH - cardH - insets.bottom}
      />

      {/* Back button — top left */}
      <TouchableOpacity
        style={[s.backBtn, { top: insets.top + 12 }]}
        onPress={() => navigation?.goBack?.()}
        activeOpacity={0.85}
      >
        <ArrowLeft size={20} color={TEXT} weight="regular"/>
      </TouchableOpacity>

      {/* Toggle — top centre */}
      <View style={[s.toggleWrap, { top: insets.top + 10 }]}>
        <View style={s.toggle}>
          {["Umrah","Hajj"].map(m => (
            <TouchableOpacity
              key={m}
              style={[s.tBtn, mode===m && s.tActive]}
              onPress={() => switchMode(m)}
              activeOpacity={0.85}
            >
              <Text style={[s.tTxt, mode===m && s.tTxtActive]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Overlay card — bottom */}
      <View style={[s.card, { paddingBottom: insets.bottom + 12, bottom: 0 }]}>

        {/* Step chips + prev/next in one compact row */}
        <View style={s.navRow}>
          <TouchableOpacity
            style={[s.navArrow, idx===0 && s.navArrowDim]}
            onPress={() => setIdx(i => Math.max(0,i-1))}
            disabled={idx===0}
            activeOpacity={0.8}
          >
            <CaretLeft size={16} color={idx===0 ? MUTED : SAGE} weight="bold"/>
          </TouchableOpacity>

          {/* Chips — scrollable */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips} style={{ flex:1 }}>
            {steps.map((step, i) => (
              <TouchableOpacity
                key={step.id}
                style={[s.chip, i===idx && s.chipOn]}
                onPress={() => setIdx(i)}
                activeOpacity={0.8}
              >
                <Text style={[s.chipTxt, i===idx && s.chipTxtOn]}>{step.step}. {step.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[s.navArrow, idx===total-1 && s.navArrowDim]}
            onPress={() => setIdx(i => Math.min(total-1,i+1))}
            disabled={idx===total-1}
            activeOpacity={0.8}
          >
            <CaretRight size={16} color={idx===total-1 ? MUTED : SAGE} weight="bold"/>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={s.divider}/>

        {/* Step info — compact */}
        <View style={s.infoRow}>
          <View style={s.infoLeft}>
            {/* Step pill */}
            <View style={s.stepPill}>
              <Text style={s.stepTxt}>Step {current.step} of {total}</Text>
            </View>
            <Text style={s.infoTitle} numberOfLines={1}>{current.title}</Text>
            {current.date ? <Text style={s.infoDate}>{current.date}</Text> : null}
            {current.distance ? <Text style={s.infoDist}>{current.distance}</Text> : null}
            <Text style={s.infoDesc} numberOfLines={3}>{current.desc}</Text>
            {current.note ? <Text style={s.infoNote} numberOfLines={2}>{current.note}</Text> : null}
          </View>

          {/* Du'ās button — right side */}
          <TouchableOpacity
            style={s.duaBtn}
            onPress={() => navigation?.navigate?.("PilgrimageDuas", { mode: current.duaMode })}
            activeOpacity={0.85}
          >
            <HandsPraying size={18} color="#fff" weight="thin"/>
            <Text style={s.duaTxt}>Du\u02bf\u0101s</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex:1, backgroundColor:"#F5EFE4" },

  // Back button
  backBtn: {
    position:"absolute", left:16, zIndex:20,
    width:38, height:38, borderRadius:19,
    backgroundColor:"rgba(253,250,244,0.92)",
    borderWidth:1, borderColor:BORDER,
    alignItems:"center", justifyContent:"center",
    shadowColor:"#000", shadowOffset:{width:0,height:2}, shadowOpacity:0.12, shadowRadius:6, elevation:4,
  },

  // Toggle
  toggleWrap: {
    position:"absolute", left:0, right:0, zIndex:20,
    alignItems:"center",
  },
  toggle: {
    flexDirection:"row",
    backgroundColor:"rgba(253,250,244,0.92)",
    borderRadius:50, borderWidth:1, borderColor:BORDER,
    padding:3,
    shadowColor:"#000", shadowOffset:{width:0,height:2}, shadowOpacity:0.10, shadowRadius:6, elevation:4,
  },
  tBtn:       { paddingHorizontal:20, paddingVertical:7, borderRadius:50 },
  tActive:    { backgroundColor:SAGE },
  tTxt:       { fontFamily:SERIF, fontSize:14, color:MUTED, fontWeight:"400" },
  tTxtActive: { color:"#fff" },

  // Overlay card
  card: {
    position:     "absolute",
    left:         0, right:0,
    backgroundColor: CARD,
    borderTopLeftRadius:  20,
    borderTopRightRadius: 20,
    borderTopWidth:       1,
    borderColor:          BORDER,
    paddingTop:           12,
    paddingHorizontal:    spacing(2),
    shadowColor:"#000", shadowOffset:{width:0,height:-4}, shadowOpacity:0.08, shadowRadius:12, elevation:12,
  },

  // Nav row
  navRow: { flexDirection:"row", alignItems:"center", gap:6, marginBottom:10 },
  navArrow:    { width:30, height:30, borderRadius:15, backgroundColor:"#EDE8E0", alignItems:"center", justifyContent:"center" },
  navArrowDim: { opacity:0.40 },
  chips:       { gap:6, paddingHorizontal:2, flexDirection:"row" },
  chip:        { paddingHorizontal:12, paddingVertical:6, borderRadius:50, borderWidth:1, borderColor:BORDER, backgroundColor:"#F0EAE2" },
  chipOn:      { backgroundColor:SAGE, borderColor:SAGE },
  chipTxt:     { fontSize:12, color:MUTED, fontWeight:"500" },
  chipTxtOn:   { color:"#fff" },

  divider: { height:1, backgroundColor:BORDER, marginBottom:10 },

  // Info row
  infoRow:  { flexDirection:"row", alignItems:"flex-start", gap:12 },
  infoLeft: { flex:1 },
  stepPill: { alignSelf:"flex-start", backgroundColor:SAGE, borderRadius:50, paddingHorizontal:10, paddingVertical:3, marginBottom:5 },
  stepTxt:  { fontSize:11, color:"#fff", fontWeight:"600" },
  infoTitle:{ fontFamily:SERIF, fontSize:17, color:TEXT, marginBottom:2 },
  infoDate: { fontSize:11, color:MUTED, marginBottom:2 },
  infoDist: { fontSize:11, color:GOLD, fontWeight:"600", marginBottom:4 },
  infoDesc: { fontSize:13, color:"#3A3228", lineHeight:19 },
  infoNote: { fontSize:11, color:MUTED, fontStyle:"italic", lineHeight:16, marginTop:5 },

  // Du'ās button
  duaBtn: {
    backgroundColor:SAGE, borderRadius:12,
    paddingVertical:10, paddingHorizontal:14,
    alignItems:"center", justifyContent:"center", gap:6,
    minWidth:70,
  },
  duaTxt: { fontSize:12, color:"#fff", fontWeight:"600" },
});
