/**
 * MapScreen.jsx — Safar
 *
 * Three-layer layout (top to bottom):
 *   1. Toggle (top bar)
 *   2. Photo strip — "what it looks like" — changes per step, crossfades
 *   3. Map — full screen background, spatial context
 *   4. Card — slim, step info + inline du'ās link
 *
 * No scrolling — everything fits in one screen.
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

const PHOTO_H  = 160;   // photo strip height
const SAGE     = "#2D4A34";
const GOLD     = "#B8922A";
const GOLD_L   = "#C8A96A";
const BORDER   = "rgba(200,185,160,0.45)";
const TEXT     = "#1C1A14";
const MUTED    = "#7A7060";
const SERIF    = "SourceSerif4-Regular";

// ── Umrah steps ───────────────────────────────────────────────────────────────
const UMRAH_STEPS = [
  {
    id:"enter",  step:1, label:"Enter Haram",
    title:"Enter Masjid al-Haram",
    date:null, distance:null, duaMode:"umrah",
    desc:"Enter with your right foot reciting the du\u02bf\u0101 of entry. When the Ka\u02bfbah comes into view, pause \u2014 this is among the most answered moments for du\u02bf\u0101 in the pilgrimage.",
    dot:{ x:0.48, y:0.16 },
    photo: require("../assets/arrival.jpg"),
    map:   require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"tawaf",  step:2, label:"Tawaf",
    title:"Tawaf \u2014 7 Circuits",
    date:null, distance:"~1.2km total", duaMode:"umrah",
    desc:"Circumambulate the Ka\u02bfbah seven times counter-clockwise from the Black Stone. Recite Bismi-ll\u0101hi All\u0101hu Akbar at each start.",
    dot:{ x:0.28, y:0.45 },
    photo: require("../assets/tawaf2.jpg"),
    map:   require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"maqam",  step:3, label:"Maqam Ibrahim",
    title:"Prayer at Maqam Ibrahim",
    date:null, distance:null, duaMode:"umrah",
    desc:"Pray two rak\u02bfahs with Maqam Ibrahim between you and the Ka\u02bfbah. Recite S\u016brah al-K\u0101fir\u016bn then al-Ikhl\u0101\u1e63. Then drink Zamzam and make du\u02bf\u0101.",
    dot:{ x:0.46, y:0.57 },
    photo: require("../assets/maqam_ibrahim_map.png"),
    map:   require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"safa",   step:4, label:"Safa",
    title:"Sa\u02bfi \u2014 Begin at Safa",
    date:null, distance:"~450m per length", duaMode:"umrah",
    desc:"Ascend \u1e62af\u0101, face the Ka\u02bfbah and make du\u02bf\u0101 three times. Then begin walking toward Marwah. Men walk briskly between the green lights.",
    dot:{ x:0.81, y:0.52 },
    photo: require("../assets/sayi.jpg"),
    map:   require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"sai",    step:5, label:"Sa\u02bfi",
    title:"Sa\u02bfi \u2014 7 Lengths",
    date:null, distance:"~3.15km total", duaMode:"umrah",
    desc:"Walk seven lengths between \u1e62af\u0101 and Marwah. Begin at \u1e62af\u0101, end at Marwah on the seventh. Make du\u02bf\u0101 and dhikr throughout.",
    dot:{ x:0.81, y:0.64 },
    photo: require("../assets/sayi.jpg"),
    map:   require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"halq",   step:6, label:"Halq / Taqseer",
    title:"Halq or Taqseer",
    date:null, distance:null, duaMode:"umrah",
    desc:"Shave the head (Halq) or shorten the hair (Taqseer) to exit Ihr\u0101m. Men: shaving carries greater reward. Women: trim a fingertip\u2019s length. Umrah complete.",
    dot:{ x:0.68, y:0.75 },
    photo: require("../assets/ihram.jpg"),
    map:   require("../assets/Umrah_map_test1.png"),
    note:"Taw\u0101f al-Wad\u0101\u02bf before leaving Makkah is recommended Sunnah, not a required step of Umrah.",
  },
];

const HAJJ_STEPS = [
  {
    id:"ihram",      step:1, label:"Ihram",
    title:"Enter Ihr\u0101m",
    date:"8th Dhul Hijjah", distance:null, duaMode:"hajj",
    desc:"At the M\u012bq\u0101t make your intention, wear Ihr\u0101m garments and recite the Talbiyah: Labbayk All\u0101humma labbayk.",
    dot:{ x:0.20, y:0.48 },
    photo: require("../assets/ihram.jpg"),
    map:   require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"mina",       step:2, label:"Mina",
    title:"Travel to Min\u0101",
    date:"8th Dhul Hijjah", distance:"~8km from Makkah", duaMode:"hajj",
    desc:"Travel to Min\u0101. Pray all five prayers here shortening four rak\u02bfah prayers to two. Spend the night in worship before the Day of Arafat.",
    dot:{ x:0.47, y:0.42 },
    photo: require("../assets/arrival.jpg"),
    map:   require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"arafat",     step:3, label:"Arafat",
    title:"Wuq\u016bf at \u02bfarafah",
    date:"9th Dhul Hijjah", distance:"~14km from Makkah", duaMode:"hajj",
    desc:"The most important day of Hajj. Stand at \u02bfarafah from midday to sunset in continuous du\u02bf\u0101 and dhikr. The Prophet \u0635 said: \u2018Hajj is \u02bfarafah.\u2019",
    dot:{ x:0.78, y:0.42 },
    photo: require("../assets/arafah.jpg"),
    map:   require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"muzdalifah", step:4, label:"Muzdalifah",
    title:"Night in Muzdalifah",
    date:"Night of 9th", distance:"~9km from Arafat", duaMode:"hajj",
    desc:"After sunset travel to Muzdalifah. Combine Maghrib and Ish\u0101\u02bc. Sleep under the open sky. Collect 49\u201370 pebbles for the Jamar\u0101t.",
    dot:{ x:0.50, y:0.62 },
    photo: require("../assets/arrival.jpg"),
    map:   require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"jamarat",    step:5, label:"Jamarat",
    title:"Ram\u012b \u2014 Stone the Jamar\u0101t",
    date:"10th\u201312th", distance:"In Mina", duaMode:"hajj",
    desc:"Return to Min\u0101. On the 10th throw 7 pebbles at Jamar\u0101t al-\u02bfAqabah. On 11th and 12th stone all three pillars in order. Say All\u0101hu Akbar with each throw.",
    dot:{ x:0.42, y:0.42 },
    photo: require("../assets/arrival.jpg"),
    map:   require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"ifadah",     step:6, label:"Tawaf + Farewell",
    title:"Taw\u0101f al-If\u0101dah + Farewell",
    date:"10th Dhul Hijjah", distance:"Return to Makkah", duaMode:"hajj",
    desc:"Perform Taw\u0101f al-If\u0101dah then Sa\u02bfi. All Ihr\u0101m restrictions are fully lifted. Perform Taw\u0101f al-Wad\u0101\u02bf before leaving Makkah.",
    dot:{ x:0.20, y:0.48 },
    photo: require("../assets/tawaf2.jpg"),
    map:   require("../assets/Umrah_map_test1.png"),
  },
];

// ── Crossfading photo strip ───────────────────────────────────────────────────
function PhotoStrip({ source, stepId }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const prevId  = useRef(stepId);

  useEffect(() => {
    if (prevId.current === stepId) return;
    prevId.current = stepId;
    opacity.setValue(0);
    Animated.timing(opacity, { toValue:1, duration:350, useNativeDriver:true }).start();
  }, [stepId]);

  return (
    <Animated.View style={[s.photoStrip, { opacity }]}>
      <Image source={source} style={s.photoImg} resizeMode="cover"/>
      {/* Bottom fade into map */}
      <View style={s.photoFade}/>
    </Animated.View>
  );
}

// ── Pulsing dot ───────────────────────────────────────────────────────────────
function PulsingDot({ x, y }) {
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
      <View style={{ position:"absolute", left:x-20, top:y-20, width:40, height:40, alignItems:"center", justifyContent:"center" }}>
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

  // Map area starts below: status bar + inset + toggle bar + photo strip
  const topBarH   = insets.top + 54;
  const mapOffset = topBarH + PHOTO_H;
  const mapH      = SH - mapOffset;

  // Dot position within the map area
  const dotX = current.dot.x * SW;
  const dotY = mapOffset + (current.dot.y * mapH);

  return (
    <View style={[s.root, { backgroundColor:"#EDE8DC" }]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent"/>

      {/* ── Layer 1: Map — fills remaining space below photo strip ── */}
      <View style={[s.mapLayer, { top:mapOffset, height:mapH }]}>
        <Image
          source={current.map}
          style={{ width:SW, height:mapH }}
          resizeMode="contain"
        />
      </View>

      {/* ── Layer 2: Pulsing dot on map ── */}
      <PulsingDot x={dotX} y={dotY}/>

      {/* ── Layer 3: Top bar — back + toggle ── */}
      <View style={[s.topBar, { paddingTop: insets.top + 8 }]}>
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

      {/* ── Layer 4: Photo strip — fixed height, crossfades per step ── */}
      <View style={[s.photoWrap, { top: topBarH - 2 }]}>
        <PhotoStrip source={current.photo} stepId={current.id}/>
        {/* Thin separator line */}
        <View style={s.separator}/>
      </View>

      {/* ── Layer 5: Bottom overlay — stepper + slim card ── */}
      <View style={[s.bottom, { paddingBottom: insets.bottom + 10 }]}>

        {/* Stepper */}
        <View style={s.stepperRow}>
          <TouchableOpacity
            style={[s.arrow, idx===0 && s.arrowDim]}
            onPress={() => setIdx(i => Math.max(0,i-1))}
            disabled={idx===0} activeOpacity={0.8}
            hitSlop={{top:14,bottom:14,left:14,right:14}}
          >
            <CaretLeft size={16} color={idx===0 ? MUTED : SAGE} weight="bold"/>
          </TouchableOpacity>

          <View style={s.pipRow}>
            {steps.map((_,i) => (
              <TouchableOpacity key={i} onPress={() => setIdx(i)}
                hitSlop={{top:8,bottom:8,left:6,right:6}} activeOpacity={0.7}>
                <View style={[s.pip, i===idx && s.pipOn]}/>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[s.arrow, idx===total-1 && s.arrowDim]}
            onPress={() => setIdx(i => Math.min(total-1,i+1))}
            disabled={idx===total-1} activeOpacity={0.8}
            hitSlop={{top:14,bottom:14,left:14,right:14}}
          >
            <CaretRight size={16} color={idx===total-1 ? MUTED : SAGE} weight="bold"/>
          </TouchableOpacity>
        </View>

        {/* Slim card */}
        <View style={s.card}>
          {/* Top row: pill + meta */}
          <View style={s.cardTop}>
            <View style={s.stepPill}>
              <Text style={s.stepPillTxt}>{"Step " + current.step + " of " + total}</Text>
            </View>
            {current.distance
              ? <Text style={s.meta}>{current.distance}</Text>
              : null}
            {current.date
              ? <Text style={s.meta}>{current.date}</Text>
              : null}
          </View>

          {/* Title */}
          <Text style={s.title}>{current.title}</Text>

          {/* Description — 2 lines max to keep card slim */}
          <Text style={s.desc} numberOfLines={2}>{current.desc}</Text>

          {/* Optional note */}
          {current.note
            ? <Text style={s.note} numberOfLines={2}>{"\u2139\uFE0F  " + current.note}</Text>
            : null}

          {/* Inline du'ās link — no button */}
          <TouchableOpacity
            onPress={() => navigation?.navigate?.("PilgrimageDuas", { mode: current.duaMode })}
            activeOpacity={0.7}
            style={s.duaLink}
            hitSlop={{top:8,bottom:8,left:0,right:0}}
          >
            <HandsPraying size={14} color={SAGE} weight="thin"/>
            <Text style={s.duaLinkTxt}>{"Du\u02bf\u0101s for " + current.label + "  \u2192"}</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex:1 },

  // Map layer
  mapLayer: { position:"absolute", left:0, right:0, overflow:"hidden" },

  // Top bar
  topBar: {
    position:"absolute", left:0, right:0, zIndex:30,
    flexDirection:"row", alignItems:"center", justifyContent:"space-between",
    paddingHorizontal:spacing(2), paddingBottom:10,
    backgroundColor:"rgba(237,232,220,0.92)",
  },
  backBtn: {
    width:38, height:38, borderRadius:19,
    backgroundColor:"rgba(253,250,244,0.95)",
    borderWidth:1, borderColor:BORDER,
    alignItems:"center", justifyContent:"center",
  },
  toggle:   { flexDirection:"row", backgroundColor:"rgba(237,232,220,0.95)", borderRadius:50, padding:3, borderWidth:1, borderColor:BORDER },
  tBtn:     { paddingHorizontal:20, paddingVertical:7, borderRadius:50 },
  tBtnOn:   { backgroundColor:SAGE },
  tTxt:     { fontFamily:SERIF, fontSize:14, color:MUTED },
  tTxtOn:   { color:"#fff" },

  // Photo strip
  photoWrap:  { position:"absolute", left:0, right:0, height:PHOTO_H, zIndex:20 },
  photoStrip: { width:SW, height:PHOTO_H },
  photoImg:   { width:"100%", height:"100%" },
  photoFade:  {
    position:"absolute", bottom:0, left:0, right:0, height:40,
    // Fade from transparent to the parchment map background
    backgroundColor:"transparent",
    // React Native doesn't support gradient here without expo-linear-gradient,
    // using a semi-transparent overlay instead
  },
  separator:  { height:1, backgroundColor:"rgba(180,165,140,0.40)" },

  // Bottom overlay
  bottom: {
    position:"absolute", left:0, right:0, bottom:0, zIndex:30,
  },

  // Stepper
  stepperRow: {
    flexDirection:"row", alignItems:"center", justifyContent:"space-between",
    paddingHorizontal:spacing(2), marginBottom:8,
  },
  arrow:    {
    width:36, height:36, borderRadius:18,
    backgroundColor:"rgba(253,250,244,0.92)",
    borderWidth:1, borderColor:BORDER,
    alignItems:"center", justifyContent:"center",
  },
  arrowDim: { opacity:0.35 },
  pipRow:   { flexDirection:"row", gap:7, alignItems:"center" },
  pip:      { width:7, height:7, borderRadius:4, backgroundColor:"rgba(45,74,52,0.25)" },
  pipOn:    { width:22, backgroundColor:SAGE },

  // Card — slim
  card: {
    marginHorizontal:spacing(2),
    backgroundColor:"rgba(253,250,244,0.97)",
    borderRadius:18,
    borderWidth:1, borderColor:BORDER,
    paddingHorizontal:spacing(2),
    paddingTop:14,
    paddingBottom:14,
    shadowColor:"#1C1408",
    shadowOffset:{ width:0, height:-3 },
    shadowOpacity:0.08,
    shadowRadius:10,
    elevation:10,
  },
  cardTop:    { flexDirection:"row", alignItems:"center", gap:8, marginBottom:7, flexWrap:"wrap" },
  stepPill:   { backgroundColor:SAGE, borderRadius:50, paddingHorizontal:11, paddingVertical:3 },
  stepPillTxt:{ fontSize:11, color:"#fff", fontWeight:"600" },
  meta:       { fontSize:11, color:GOLD, fontWeight:"600" },
  title:      { fontFamily:SERIF, fontSize:18, color:TEXT, marginBottom:5, lineHeight:24 },
  desc:       { fontSize:13, color:"#3A3228", lineHeight:19, marginBottom:8 },
  note:       { fontSize:11, color:MUTED, fontStyle:"italic", lineHeight:16, marginBottom:8 },
  duaLink:    { flexDirection:"row", alignItems:"center", gap:6 },
  duaLinkTxt: { fontSize:13, color:SAGE, fontWeight:"600" },
});
