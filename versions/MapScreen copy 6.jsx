/**
 * MapScreen.jsx — Safar
 * Pilgrimage Route Map
 * - Umrah / Hajj toggle — switches map image and site set
 * - Step-by-step stepper with prev/next controls
 * - Tappable dots open bottom-sheet info card (matches SacredPlacesScreen)
 * - Large readable labels (3× original size)
 * - "View Du'ās" button on each card
 */
import React, { useState, useRef, useEffect } from "react";
import {
  SafeAreaView, View, Text, Image, TouchableOpacity,
  StyleSheet, Dimensions, ScrollView, Animated,
  TouchableWithoutFeedback,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing, radius, shadows } from "../theme";

const SERIF  = "SourceSerif4-Regular";
const BG     = "#F5EFE4";
const CARD   = "#FDFAF4";
const SAGE   = "#4A5C48";
const GOLD   = "#B8922A";
const BORDER = "#E0D8CC";
const { width: SW } = Dimensions.get("window");

// Map fills full screen width with padding
const MAP_W = SW - spacing(5);
// Both route maps are portrait — adjust ratio to your actual image
const MAP_H = MAP_W * (1672 / 941);

// ── Site data ─────────────────────────────────────────────────────────────────

const UMRAH_SITES = [
  {
    id: "haram",
    step: 1,
    name: "Masjid al-\u1e24ar\u0101m",
    arabic: "\u0627\u0644\u0645\u0633\u062c\u062f \u0627\u0644\u062d\u0631\u0627\u0645",
    sub: "Makkah \u00b7 Umrah Step 1",
    desc: "Enter Masjid al-\u1e24ar\u0101m with your right foot, reciting the du\u02bf\u0101 of entry. When the Ka\u02bfbah comes into view, pause and make du\u02bf\u0101 — this is one of the most answered moments of the entire pilgrimage.",
    distance: null,
    duaMode: "umrah",
    cx: 47.5, cy: 17.5,
    color: GOLD,
  },
  {
    id: "tawaf",
    step: 2,
    name: "Taw\u0101f",
    arabic: "\u0637\u0648\u0627\u0641",
    sub: "Around the Ka\u02bfbah \u00b7 Umrah Step 2",
    desc: "Circumambulate the Ka\u02bfbah seven times counter-clockwise, beginning at the Black Stone. Recite 'Bismi-ll\u0101hi wall\u0101hu akbar' at the start of each circuit. Between the Yemeni Corner and the Black Stone, recite Rabban\u0101 \u0101tin\u0101 fid-duny\u0101 \u1e25asanah.",
    distance: null,
    duaMode: "umrah",
    cx: 47.5, cy: 17.5,
    color: GOLD,
  },
  {
    id: "maqam",
    step: 3,
    name: "Maq\u0101m Ibr\u0101h\u012bm",
    arabic: "\u0645\u0642\u0627\u0645 \u0625\u0628\u0631\u0627\u0647\u064a\u0645",
    sub: "After Taw\u0101f \u00b7 Umrah Step 3",
    desc: "After completing Taw\u0101f, pray two rak\u02bfahs behind Maq\u0101m Ibr\u0101h\u012bm — the station of Prophet Ibr\u0101h\u012bm (AS). Recite S\u016brah al-K\u0101fir\u016bn in the first and S\u016brah al-Ikhl\u0101\u1e63 in the second. Then drink Zamzam water.",
    distance: null,
    duaMode: "umrah",
    cx: 50.0, cy: 20.0,
    color: GOLD,
  },
  {
    id: "safa",
    step: 4,
    name: "\u1e62af\u0101 & Marwah",
    arabic: "\u0627\u0644\u0635\u0641\u0627 \u0648\u0627\u0644\u0645\u0631\u0648\u0629",
    sub: "Sa\u02bfy \u00b7 Umrah Step 4",
    desc: "Walk seven lengths between \u1e62af\u0101 and Marwah, commemorating H\u0101jar\u2019s search for water. Begin at \u1e62af\u0101, ascend and face the Ka\u02bfbah, make du\u02bf\u0101, then walk to Marwah. Each one-way walk is one length.",
    distance: "~450 m per length",
    duaMode: "umrah",
    cx: 65.0, cy: 22.0,
    color: GOLD,
  },
  {
    id: "halq",
    step: 5,
    name: "Halq / Taq\u1e63\u012br",
    arabic: "\u062d\u0644\u0642 \u00b7 \u062a\u0642\u0635\u064a\u0631",
    sub: "Exiting Ihr\u0101m \u00b7 Umrah Step 5",
    desc: "Shave the head (Halq) or shorten the hair (Taq\u1e63\u012br) to exit the state of Ihr\u0101m. Men shave the full head or cut from all areas. Women cut a fingertip\u2019s length from the ends. Your Umrah is now complete. Alhamdulill\u0101h.",
    distance: null,
    duaMode: "umrah",
    cx: 47.5, cy: 17.5,
    color: GOLD,
  },
];

const HAJJ_SITES = [
  {
    id: "haram-hajj",
    step: 1,
    name: "Masjid al-\u1e24ar\u0101m",
    arabic: "\u0627\u0644\u0645\u0633\u062c\u062f \u0627\u0644\u062d\u0631\u0627\u0645",
    sub: "Makkah \u00b7 Hajj Step 1",
    desc: "Arrive in Makkah in the state of Ihr\u0101m. Perform Taw\u0101f al-Qud\u016bm (arrival Taw\u0101f) — seven circuits around the Ka\u02bfbah. This Taw\u0101f is Sunnah for those coming from outside the M\u012bq\u0101t.",
    distance: null,
    duaMode: "hajj",
    cx: 47.5, cy: 17.5,
    color: GOLD,
  },
  {
    id: "mina",
    step: 2,
    name: "Min\u0101",
    arabic: "\u0645\u0646\u0649",
    sub: "8th Dhul \u1e24ijjah \u00b7 Hajj Step 2",
    desc: "Travel to Min\u0101 on the 8th of Dhul \u1e24ijjah (Yawm al-Tarwiyah). Spend the day and night in worship and preparation for \u02bfarafah. Pray Dhuhr, \u02bfA\u1e63r, Maghrib, \u02bfish\u0101\u02bc and Fajr in Min\u0101.",
    distance: "8 km from Makkah",
    duaMode: "hajj",
    cx: 72.5, cy: 37.0,
    color: SAGE,
  },
  {
    id: "arafat",
    step: 3,
    name: "\u02bfarafah",
    arabic: "\u0639\u0631\u0641\u0627\u062a",
    sub: "9th Dhul \u1e24ijjah \u00b7 Hajj Step 3",
    desc: "The most important day of Hajj. Stand on the plain from midday until sunset in continuous du\u02bf\u0101, dhikr and seeking forgiveness. \u201cHajj is \u02bfarafah.\u201d The Prophet \u2611\ufe0f said Allah descends and boasts to the angels of those standing here.",
    distance: "14 km from Makkah",
    duaMode: "hajj",
    cx: 78.0, cy: 60.0,
    color: SAGE,
  },
  {
    id: "muzdalifah",
    step: 4,
    name: "Muzdalifah",
    arabic: "\u0645\u0632\u062f\u0644\u0641\u0629",
    sub: "Night of 9th \u00b7 Hajj Step 4",
    desc: "After leaving \u02bfarafah at sunset, travel to Muzdalifah. Combine Maghrib and \u02bfish\u0101\u02bc prayers. Spend the night under the sky and collect 49 or 70 pebbles for the stoning of the Jamar\u0101t. Depart after Fajr.",
    distance: "9 km from \u02bfarafah",
    duaMode: "hajj",
    cx: 38.0, cy: 65.0,
    color: SAGE,
  },
  {
    id: "jamarat",
    step: 5,
    name: "Jamar\u0101t",
    arabic: "\u0627\u0644\u062c\u0645\u0631\u0627\u062a",
    sub: "10th\u201312th Dhul \u1e24ijjah \u00b7 Hajj Step 5",
    desc: "Return to Min\u0101 and stone the three Jamar\u0101t pillars. Begin with the small pillar, then middle, then large (Jamar\u0101t al-\u02bfAqabah). Say \u2018All\u0101hu Akbar\u2019 with each of the seven stones. Repeat on the 11th and 12th.",
    distance: "In Mina",
    duaMode: "hajj",
    cx: 26.0, cy: 50.0,
    color: SAGE,
  },
  {
    id: "farewell",
    step: 6,
    name: "Taw\u0101f al-Wad\u0101\u02bf",
    arabic: "\u0637\u0648\u0627\u0641 \u0627\u0644\u0648\u062f\u0627\u0639",
    sub: "Before Leaving \u00b7 Hajj Step 6",
    desc: "Before leaving Makkah, perform the farewell Taw\u0101f — seven final circuits around the Ka\u02bfbah. Leave facing the Ka\u02bfbah, your heart full of gratitude. May Allah accept your Hajj. \u0622m\u012bn.",
    distance: null,
    duaMode: "hajj",
    cx: 47.5, cy: 17.5,
    color: GOLD,
  },
];

// ── Info card (bottom sheet) ───────────────────────────────────────────────────
function InfoCard({ site, onClose, onViewDuas, insets }) {
  const slideAnim = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0, useNativeDriver: true, tension: 80, friction: 12,
    }).start();
  }, [site]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 400, duration: 220, useNativeDriver: true,
    }).start(onClose);
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={ic.backdrop} />
      </TouchableWithoutFeedback>

      <Animated.View style={[ic.card, {
        paddingBottom: insets.bottom + 20,
        transform: [{ translateY: slideAnim }],
      }]}>
        <View style={ic.handle} />

        {/* Step pill + close */}
        <View style={ic.topRow}>
          <View style={ic.stepPill}>
            <Text style={ic.stepTxt}>{"Step " + site.step}</Text>
          </View>
          <TouchableOpacity style={ic.closeBtn} onPress={handleClose}
            hitSlop={{ top:8, bottom:8, left:8, right:8 }}>
            <Text style={ic.closeTxt}>{"✕"}</Text>
          </TouchableOpacity>
        </View>

        {/* Arabic + name */}
        <Text style={ic.arabic}>{site.arabic}</Text>
        <Text style={ic.name}>{site.name}</Text>
        <Text style={ic.sub}>{site.sub}</Text>

        {/* Distance */}
        {site.distance ? (
          <View style={ic.distRow}>
            <Text style={ic.distIcon}>{"🚌"}</Text>
            <Text style={ic.distTxt}>{site.distance}</Text>
          </View>
        ) : null}

        {/* Description */}
        <Text style={ic.desc}>{site.desc}</Text>

        {/* View Du'ās */}
        <TouchableOpacity style={ic.duasBtn} onPress={() => onViewDuas(site)} activeOpacity={0.85}>
          <Text style={ic.duasBtnTxt}>{"View Du\u02bf\u0101s for " + site.name + "  \u203a"}</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}

const ic = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(10,16,8,0.32)" },
  card: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: CARD,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 22, paddingTop: 8,
    shadowColor: "#000", shadowOffset: { width:0, height:-4 },
    shadowOpacity: 0.16, shadowRadius: 16, elevation: 14,
  },
  handle:   { width:36, height:4, borderRadius:2, backgroundColor:"#C8BFB2", alignSelf:"center", marginBottom:16 },
  topRow:   { flexDirection:"row", alignItems:"center", marginBottom:12 },
  stepPill: { backgroundColor:SAGE, borderRadius:50, paddingHorizontal:14, paddingVertical:5 },
  stepTxt:  { fontSize:12, color:"#fff", fontWeight:"700", letterSpacing:0.8 },
  closeBtn: { marginLeft:"auto", width:30, height:30, borderRadius:15, backgroundColor:"#EDE8E0", alignItems:"center", justifyContent:"center" },
  closeTxt: { fontSize:13, color:"#5C5040" },
  arabic:   { fontFamily:SERIF, fontSize:24, color:"#1C1A14", textAlign:"right", marginBottom:2 },
  name:     { fontFamily:SERIF, fontSize:26, color:"#1C1A14", fontWeight:"600", marginBottom:3 },
  sub:      { fontSize:14, color:"#7A7060", marginBottom:12 },
  distRow:  { flexDirection:"row", alignItems:"center", gap:6, marginBottom:10 },
  distIcon: { fontSize:14 },
  distTxt:  { fontSize:14, color:"#5C5040" },
  desc:     { fontSize:15, color:"#3A3228", lineHeight:24, marginBottom:20 },
  duasBtn:  { backgroundColor:SAGE, borderRadius:14, paddingVertical:15, alignItems:"center" },
  duasBtnTxt:{ fontSize:16, color:"#fff", fontWeight:"600" },
});

// ── Location dot ──────────────────────────────────────────────────────────────
function LocationDot({ site, isActive, onPress, mapW, mapH }) {
  const x = (site.cx / 100) * mapW;
  const y = (site.cy / 100) * mapH;
  const isGold = site.color === GOLD;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue:1.35, duration:700, useNativeDriver:true }),
          Animated.timing(pulseAnim, { toValue:1,    duration:700, useNativeDriver:true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isActive]);

  return (
    <TouchableOpacity
      style={[dt.wrap, { left: x - 22, top: y - 22 }]}
      onPress={() => onPress(site)}
      activeOpacity={0.8}
      hitSlop={{ top:12, bottom:12, left:12, right:12 }}
    >
      {/* Pulse ring — only on active step */}
      {isActive && (
        <Animated.View style={[
          dt.ring,
          isGold ? dt.ringGold : dt.ringSage,
          { transform: [{ scale: pulseAnim }] }
        ]} />
      )}
      {/* Centre dot */}
      <View style={[
        dt.dot,
        isGold ? dt.dotGold : dt.dotSage,
        isActive ? dt.dotActive : null,
      ]} />
      {/* Label — 3× larger than original */}
      <View style={[dt.labelWrap, isActive ? dt.labelWrapActive : null]}>
        <Text style={[dt.label, isActive ? dt.labelActive : null]} numberOfLines={2}>
          {site.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const dt = StyleSheet.create({
  wrap:           { position:"absolute", width:44, height:44, alignItems:"center", justifyContent:"center" },
  ring:           { position:"absolute", width:36, height:36, borderRadius:18, borderWidth:2.5, opacity:0.45 },
  ringGold:       { borderColor:GOLD },
  ringSage:       { borderColor:SAGE },
  dot:            { width:18, height:18, borderRadius:9, borderWidth:2.5, borderColor:"#fff",
                    shadowColor:"#000", shadowOffset:{width:0,height:2}, shadowOpacity:0.35, shadowRadius:5, elevation:5 },
  dotActive:      { width:24, height:24, borderRadius:12 },
  dotGold:        { backgroundColor:GOLD },
  dotSage:        { backgroundColor:SAGE },
  labelWrap:      { position:"absolute", top:38, backgroundColor:"rgba(255,255,255,0.94)",
                    borderRadius:8, paddingHorizontal:8, paddingVertical:4,
                    borderWidth:1, borderColor:"rgba(0,0,0,0.10)",
                    shadowColor:"#000", shadowOffset:{width:0,height:1}, shadowOpacity:0.12, shadowRadius:4, elevation:2,
                    maxWidth:140 },
  labelWrapActive:{ backgroundColor:SAGE, borderColor:SAGE },
  label:          { fontSize:13, color:"#1C1A14", fontWeight:"600", textAlign:"center", lineHeight:17 },
  labelActive:    { color:"#fff" },
});

// ── Stepper bar ───────────────────────────────────────────────────────────────
function StepperBar({ sites, activeStep, onStep }) {
  return (
    <View style={sp.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={sp.row}>
        {sites.map((site) => {
          const isActive = site.step === activeStep;
          return (
            <TouchableOpacity
              key={site.id}
              style={[sp.chip, isActive ? sp.chipActive : null]}
              onPress={() => onStep(site.step)}
              activeOpacity={0.8}
            >
              <View style={[sp.num, isActive ? sp.numActive : null]}>
                <Text style={[sp.numTxt, isActive ? sp.numTxtActive : null]}>{site.step}</Text>
              </View>
              <Text style={[sp.label, isActive ? sp.labelActive : null]} numberOfLines={1}>
                {site.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const sp = StyleSheet.create({
  wrap:         { borderBottomWidth:1, borderBottomColor:BORDER, backgroundColor:CARD },
  row:          { paddingHorizontal:spacing(2), paddingVertical:spacing(1.25), gap:8, flexDirection:"row" },
  chip:         { flexDirection:"row", alignItems:"center", gap:7, paddingHorizontal:12, paddingVertical:8,
                  borderRadius:radius.pill, borderWidth:1, borderColor:BORDER, backgroundColor:"#F5EFE4" },
  chipActive:   { backgroundColor:SAGE, borderColor:SAGE },
  num:          { width:22, height:22, borderRadius:11, backgroundColor:BORDER, alignItems:"center", justifyContent:"center" },
  numActive:    { backgroundColor:"rgba(255,255,255,0.25)" },
  numTxt:       { fontSize:11, fontWeight:"700", color:"#5C5040" },
  numTxtActive: { color:"#fff" },
  label:        { fontSize:13, color:"#5C5040", fontWeight:"500", maxWidth:90 },
  labelActive:  { color:"#fff" },
});

// ── Prev / Next controls ──────────────────────────────────────────────────────
function StepControls({ current, total, onPrev, onNext }) {
  return (
    <View style={sc.row}>
      <TouchableOpacity
        style={[sc.btn, current <= 1 ? sc.btnDisabled : null]}
        onPress={onPrev} disabled={current <= 1} activeOpacity={0.8}
      >
        <Text style={[sc.arrow, current <= 1 ? sc.arrowDisabled : null]}>{"‹"}</Text>
        <Text style={[sc.label, current <= 1 ? sc.arrowDisabled : null]}>Previous</Text>
      </TouchableOpacity>

      <View style={sc.counter}>
        <Text style={sc.counterTxt}>{current} <Text style={sc.counterOf}>of</Text> {total}</Text>
      </View>

      <TouchableOpacity
        style={[sc.btn, sc.btnRight, current >= total ? sc.btnDisabled : null]}
        onPress={onNext} disabled={current >= total} activeOpacity={0.8}
      >
        <Text style={[sc.label, current >= total ? sc.arrowDisabled : null]}>Next</Text>
        <Text style={[sc.arrow, current >= total ? sc.arrowDisabled : null]}>{"›"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const sc = StyleSheet.create({
  row:          { flexDirection:"row", alignItems:"center", justifyContent:"space-between",
                  paddingHorizontal:spacing(2.5), paddingVertical:spacing(1.25),
                  borderTopWidth:1, borderTopColor:BORDER, backgroundColor:CARD },
  btn:          { flexDirection:"row", alignItems:"center", gap:4, paddingVertical:6, paddingHorizontal:12,
                  borderRadius:radius.pill, borderWidth:1, borderColor:BORDER },
  btnRight:     { flexDirection:"row" },
  btnDisabled:  { opacity:0.3 },
  arrow:        { fontSize:20, color:SAGE, lineHeight:24 },
  arrowDisabled:{ color:"#B8B4AE" },
  label:        { fontSize:14, color:SAGE, fontWeight:"600" },
  counter:      { alignItems:"center" },
  counterTxt:   { fontFamily:SERIF, fontSize:16, color:"#1C1A14", fontWeight:"600" },
  counterOf:    { fontSize:13, color:"#7A7060", fontWeight:"400" },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function MapScreen({ navigation }) {
  const [journeyType, setJourneyType] = useState("Umrah");
  const [activeStep,  setActiveStep]  = useState(1);
  const [selected,    setSelected]    = useState(null);
  const insets = useSafeAreaInsets();

  const sites = journeyType === "Hajj" ? HAJJ_SITES : UMRAH_SITES;
  const total = sites.length;

  // When switching journey type, reset to step 1
  const switchType = (type) => {
    setJourneyType(type);
    setActiveStep(1);
    setSelected(null);
  };

  const handleDotPress = (site) => {
    setActiveStep(site.step);
    setSelected(site);
  };

  const handleStepperPress = (step) => {
    setActiveStep(step);
    setSelected(null);
  };

  const handlePrev = () => {
    const next = Math.max(1, activeStep - 1);
    setActiveStep(next);
    setSelected(null);
  };

  const handleNext = () => {
    const next = Math.min(total, activeStep + 1);
    setActiveStep(next);
    setSelected(null);
  };

  const handleViewDuas = (site) => {
    setSelected(null);
    navigation?.navigate?.("PilgrimageDuas", { mode: site.duaMode });
  };

  const mapImage = journeyType === "Hajj"
    ? require("../assets/hajj_route.png")
    : require("../assets/umrah_route.png");

  return (
    <View style={s.root}>
      <SafeAreaView style={s.safe} edges={["top"]}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.8}>
            <Text style={s.backArrow}>{"‹"}</Text>
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>Pilgrimage Map</Text>
            <Text style={s.headerSub}>Step-by-step route guide</Text>
          </View>
          <View style={{ width:36 }} />
        </View>

        {/* Umrah / Hajj toggle */}
        <View style={s.toggleWrap}>
          <View style={s.toggle}>
            {["Umrah","Hajj"].map(type => (
              <TouchableOpacity
                key={type}
                style={[s.toggleBtn, journeyType === type ? s.toggleBtnActive : null]}
                onPress={() => switchType(type)}
                activeOpacity={0.85}
              >
                <Text style={[s.toggleTxt, journeyType === type ? s.toggleTxtActive : null]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stepper bar */}
        <StepperBar sites={sites} activeStep={activeStep} onStep={handleStepperPress} />

        {/* Map */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scrollContent}
          scrollEnabled={!selected}
        >
          <View style={[s.mapContainer, { width:MAP_W, height:MAP_H }]}>
            <Image
              source={mapImage}
              style={s.mapImage}
              resizeMode="cover"
            />
            {/* All dots — active step highlighted */}
            {sites.map(site => (
              <LocationDot
                key={site.id}
                site={site}
                isActive={site.step === activeStep}
                onPress={handleDotPress}
                mapW={MAP_W}
                mapH={MAP_H}
              />
            ))}
          </View>

          {/* Legend */}
          <View style={s.legend}>
            <View style={s.legendRow}>
              <View style={[s.legendDot, { backgroundColor:GOLD }]} />
              <Text style={s.legendTxt}>Umrah & Hajj stages</Text>
            </View>
            {journeyType === "Hajj" && (
              <View style={s.legendRow}>
                <View style={[s.legendDot, { backgroundColor:SAGE }]} />
                <Text style={s.legendTxt}>Hajj only stages</Text>
              </View>
            )}
          </View>

          <View style={{ height: spacing(10) }} />
        </ScrollView>

        {/* Prev / Next stepper controls — pinned above info card */}
        {!selected && (
          <StepControls
            current={activeStep}
            total={total}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        )}

      </SafeAreaView>

      {/* Bottom sheet info card */}
      {selected ? (
        <InfoCard
          site={selected}
          onClose={() => setSelected(null)}
          onViewDuas={handleViewDuas}
          insets={insets}
        />
      ) : null}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex:1, backgroundColor:BG },
  safe: { flex:1 },

  header: {
    flexDirection:"row", alignItems:"center",
    paddingHorizontal:spacing(2.5),
    paddingTop:spacing(1.5), paddingBottom:spacing(1.5),
    borderBottomWidth:1, borderBottomColor:BORDER,
    backgroundColor:CARD,
  },
  backBtn:      { width:36, height:36, borderRadius:18, backgroundColor:"#fff", borderWidth:1, borderColor:BORDER, alignItems:"center", justifyContent:"center" },
  backArrow:    { fontSize:24, color:"#1C1A14", lineHeight:28 },
  headerCenter: { flex:1, alignItems:"center" },
  headerTitle:  { fontFamily:SERIF, fontSize:20, color:"#1C1A14" },
  headerSub:    { fontSize:12, color:"#7A7060", marginTop:1 },

  toggleWrap: { paddingHorizontal:spacing(2.5), paddingVertical:spacing(1.25), backgroundColor:CARD, borderBottomWidth:1, borderBottomColor:BORDER },
  toggle:     { flexDirection:"row", backgroundColor:"#F0EAE0", borderRadius:radius.pill, padding:3, borderWidth:1, borderColor:BORDER },
  toggleBtn:  { flex:1, paddingVertical:10, alignItems:"center", borderRadius:radius.pill },
  toggleBtnActive: { backgroundColor:SAGE },
  toggleTxt:  { fontFamily:SERIF, fontSize:15, fontWeight:"600", color:"#7A7060" },
  toggleTxtActive: { color:"#fff" },

  scrollContent: { alignItems:"center", paddingTop:spacing(3), paddingBottom:spacing(2) },
  mapContainer:  {
    borderRadius:20, overflow:"hidden",
    shadowColor:"#1C1408", shadowOffset:{width:0,height:6},
    shadowOpacity:0.18, shadowRadius:20, elevation:10,
  },
  mapImage: { width:"100%", height:"100%" },

  legend:    { flexDirection:"row", gap:spacing(3), marginTop:spacing(2), paddingHorizontal:spacing(2.5) },
  legendRow: { flexDirection:"row", alignItems:"center", gap:8 },
  legendDot: { width:10, height:10, borderRadius:5 },
  legendTxt: { fontSize:13, color:"#5C5040" },
});
