/**
 * MapScreen.jsx — Safar
 *
 * Isometric pilgrimage route map with tappable location dots.
 * Each dot opens a bottom card with site info and a link to its du'ās.
 *
 * Dot positions are expressed as % of image width/height so they
 * scale correctly on any screen size.
 */
import React, { useState, useRef } from "react";
import {
  SafeAreaView, View, Text, Image, TouchableOpacity,
  StyleSheet, Dimensions, ScrollView, Animated,
  TouchableWithoutFeedback,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing } from "../theme";

const SERIF   = "SourceSerif4-Regular";
const BG      = "#F5EFE4";
const SAGE    = "#4A5C48";
const GOLD    = "#B8922A";
const BORDER  = "#E0D8CC";
const { width: SW } = Dimensions.get("window");

// Image is 941×1672 — portrait
const IMG_W = 941;
const IMG_H = 1672;
const DISPLAY_W = SW - spacing(5); // card-width with margin
const DISPLAY_H = DISPLAY_W * (IMG_H / IMG_W);

// ── Site definitions ──────────────────────────────────────────────────────────
// cx/cy as % of image dimensions, measured from labelled reference image
const SITES = [
  {
    id:      "haram",
    name:    "Masjid al-\u1e24ar\u0101m",
    arabic:  "\u0627\u0644\u0645\u0633\u062c\u062f \u0627\u0644\u062d\u0631\u0627\u0645",
    sub:     "Makkah",
    step:    "Step 1",
    desc:    "Your journey begins here. Enter with your right foot, recite the du\u02bf\u0101 of entry, and let your eyes fall on the Ka\u02bfbah for the first time. Perform Taw\u0101f \u2014 seven circuits around the Ka\u02bfbah \u2014 beginning and ending at the Black Stone.",
    distance: null,
    duaStage: "Entry",
    cx: 47.5,   // % from left
    cy: 17.5,   // % from top
    color: GOLD,
  },
  {
    id:      "safa",
    name:    "\u1e62af\u0101 & Marwah",
    arabic:  "\u0627\u0644\u0635\u0641\u0627 \u0648\u0627\u0644\u0645\u0631\u0648\u0629",
    sub:     "Inside Masjid al-\u1e24ar\u0101m",
    step:    "Step 2",
    desc:    "Walk seven times between \u1e62af\u0101 and Marwah, honouring H\u0101jar\u2019s search for water. Begin at \u1e62af\u0101, ascend and face the Ka\u02bfbah, make du\u02bf\u0101, then walk to Marwah. This is Sa\u02bfy.",
    distance: "~450m per length",
    duaStage: "Sa\u02bfy",
    cx: 65.0,
    cy: 22.0,
    color: GOLD,
  },
  {
    id:      "mina",
    name:    "Min\u0101",
    arabic:  "\u0645\u0646\u0649",
    sub:     "Valley of Tents",
    step:    "Step 3",
    desc:    "Pilgrims travel to Min\u0101 on the 8th of Dhul Hijjah (Yawm al-Tarwiyah) and spend the night. The valley fills with millions of white tents. Spend the day and night in worship and preparation for \u02bfarafah.",
    distance: "8 km from Makkah \u00b7 15\u201320 min",
    duaStage: "Jamarat",
    cx: 72.5,
    cy: 37.0,
    color: SAGE,
  },
  {
    id:      "arafat",
    name:    "\u02bfarafah",
    arabic:  "\u0639\u0631\u0641\u0627\u062a",
    sub:     "The Plain of Standing",
    step:    "Step 4",
    desc:    "The most important day of Hajj \u2014 the 9th of Dhul Hijjah. \u201cHajj is \u02bfarafah.\u201d Stand on the plain from midday until sunset, in continuous du\u02bf\u0101, dhikr and seeking forgiveness. The Prophet \u2611\ufe0f said Allah descends and boasts to the angels of those standing here.",
    distance: "14 km from Makkah \u00b7 20\u201330 min",
    duaStage: "Arafah",
    cx: 78.0,
    cy: 60.0,
    color: SAGE,
  },
  {
    id:      "muzdalifah",
    name:    "Muzdalifah",
    arabic:  "\u0645\u0632\u062f\u0644\u0641\u0629",
    sub:     "Open-Air Night Camp",
    step:    "Step 5",
    desc:    "After leaving \u02bfarafah at sunset, travel to Muzdalifah. Combine Maghrib and \u02bfish\u0101\u02bc prayers. Spend the night under the sky and collect your 49 or 70 pebbles for the stoning of the Jamar\u0101t. Depart after Fajr.",
    distance: "9 km from \u02bfarafah \u00b7 15\u201320 min",
    duaStage: "Muzdalifah",
    cx: 38.0,
    cy: 65.0,
    color: SAGE,
  },
  {
    id:      "jamarat",
    name:    "Jamar\u0101t",
    arabic:  "\u0627\u0644\u062c\u0645\u0631\u0627\u062a",
    sub:     "Mina — Stoning Pillars",
    step:    "Step 6",
    desc:    "Return to Min\u0101 and stone the three Jamar\u0101t pillars on the 10th, 11th and 12th of Dhul Hijjah. Begin with the small pillar, then the middle, then the large (Jamar\u0101t al-\u02bfAqabah). Say \u2018All\u0101hu Akbar\u2019 with each of the seven stones.",
    distance: "9 km from Muzdalifah \u00b7 15\u201320 min",
    duaStage: "Jamarat",
    cx: 26.0,
    cy: 50.0,
    color: SAGE,
  },
];

// ── Animated info card ─────────────────────────────────────────────────────────
function InfoCard({ site, onClose, onViewDuas, insets }) {
  const slideAnim = useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }, [site]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true,
    }).start(onClose);
  };

  return (
    <>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={ic.backdrop} />
      </TouchableWithoutFeedback>

      {/* Card */}
      <Animated.View
        style={[ic.card, { paddingBottom: insets.bottom + 16, transform: [{ translateY: slideAnim }] }]}
      >
        {/* Handle */}
        <View style={ic.handle} />

        {/* Step pill */}
        <View style={ic.stepRow}>
          <View style={ic.stepPill}>
            <Text style={ic.stepTxt}>{site.step}</Text>
          </View>
          <TouchableOpacity style={ic.closeBtn} onPress={handleClose} hitSlop={{top:8,bottom:8,left:8,right:8}}>
            <Text style={ic.closeTxt}>{"✕"}</Text>
          </TouchableOpacity>
        </View>

        {/* Site name */}
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

        {/* View Du'ās button */}
        <TouchableOpacity style={ic.duasBtn} onPress={() => onViewDuas(site)} activeOpacity={0.85}>
          <Text style={ic.duasBtnTxt}>{"View Du\u02bf\u0101s for " + site.name + "  \u203a"}</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}

const ic = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,16,8,0.30)",
  },
  card: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FDFAF4",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 12,
  },
  handle:     { width: 36, height: 4, borderRadius: 2, backgroundColor: "#C8BFB2", alignSelf: "center", marginBottom: 14 },
  stepRow:    { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  stepPill:   { backgroundColor: SAGE, borderRadius: 50, paddingHorizontal: 12, paddingVertical: 4 },
  stepTxt:    { fontSize: 11, color: "#fff", fontWeight: "700", letterSpacing: 0.8 },
  closeBtn:   { marginLeft: "auto", width: 28, height: 28, borderRadius: 14, backgroundColor: "#EDE8E0", alignItems: "center", justifyContent: "center" },
  closeTxt:   { fontSize: 12, color: "#5C5040" },
  arabic:     { fontFamily: SERIF, fontSize: 22, color: "#1C1A14", textAlign: "right", marginBottom: 2 },
  name:       { fontFamily: SERIF, fontSize: 24, color: "#1C1A14", fontWeight: "600", marginBottom: 2 },
  sub:        { fontSize: 13, color: "#7A7060", marginBottom: 10 },
  distRow:    { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  distIcon:   { fontSize: 14 },
  distTxt:    { fontSize: 13, color: "#5C5040" },
  desc:       { fontSize: 15, color: "#3A3228", lineHeight: 23, marginBottom: 18 },
  duasBtn:    { backgroundColor: SAGE, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  duasBtnTxt: { fontSize: 16, color: "#fff", fontWeight: "600" },
});

// ── Location dot ───────────────────────────────────────────────────────────────
function LocationDot({ site, onPress, mapW, mapH }) {
  const x = (site.cx / 100) * mapW;
  const y = (site.cy / 100) * mapH;
  const isGold = site.color === GOLD;

  return (
    <TouchableOpacity
      style={[dot.wrap, { left: x - 18, top: y - 18 }]}
      onPress={() => onPress(site)}
      activeOpacity={0.8}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      {/* Pulse ring */}
      <View style={[dot.ring, isGold ? dot.ringGold : dot.ringSage]} />
      {/* Centre dot */}
      <View style={[dot.dot, isGold ? dot.dotGold : dot.dotSage]} />
      {/* Label */}
      <View style={dot.labelWrap}>
        <Text style={dot.label} numberOfLines={1}>{site.name}</Text>
      </View>
    </TouchableOpacity>
  );
}

const dot = StyleSheet.create({
  wrap:     { position: "absolute", width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  ring:     { position: "absolute", width: 28, height: 28, borderRadius: 14, borderWidth: 2, opacity: 0.35 },
  ringGold: { borderColor: GOLD },
  ringSage: { borderColor: SAGE },
  dot:      { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: "#fff", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.30, shadowRadius: 4, elevation: 4 },
  dotGold:  { backgroundColor: GOLD },
  dotSage:  { backgroundColor: SAGE },
  labelWrap:{ position: "absolute", top: 32, backgroundColor: "rgba(255,255,255,0.92)", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: "rgba(0,0,0,0.08)" },
  label:    { fontSize: 10, color: "#1C1A14", fontWeight: "600", whiteSpace: "nowrap" },
});

// ── Screen ─────────────────────────────────────────────────────────────────────
export default function MapScreen({ navigation }) {
  const [selected, setSelected] = useState(null);
  const insets = useSafeAreaInsets();

  const handleViewDuas = (site) => {
    setSelected(null);
    // Navigate to the relevant stage in PilgrimageDuas
    navigation?.navigate?.("PilgrimageDuas", { mode: "hajj" });
  };

  return (
    <View style={s.root}>
      <SafeAreaView style={s.safe} edges={["top"]}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.8}>
            <Text style={s.backArrow}>{"‹"}</Text>
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>Pilgrimage Route</Text>
            <Text style={s.headerSub}>Tap a location to learn more</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scrollContent}
          scrollEnabled={!selected}
        >
          {/* Map container */}
          <View style={[s.mapContainer, { width: DISPLAY_W, height: DISPLAY_H }]}>

            {/* Isometric map image */}
            <Image
              source={require("../assets/Umrah_route_.PNG")}
              style={s.mapImage}
              resizeMode="cover"
            />

            {/* Location dots — overlaid absolutely */}
            {SITES.map(site => (
              <LocationDot
                key={site.id}
                site={site}
                onPress={setSelected}
                mapW={DISPLAY_W}
                mapH={DISPLAY_H}
              />
            ))}
          </View>

          {/* Legend */}
          <View style={s.legend}>
            <View style={s.legendRow}>
              <View style={[s.legendDot, { backgroundColor: GOLD }]} />
              <Text style={s.legendTxt}>Umrah &amp; Hajj stages</Text>
            </View>
            <View style={s.legendRow}>
              <View style={[s.legendDot, { backgroundColor: SAGE }]} />
              <Text style={s.legendTxt}>Hajj only stages</Text>
            </View>
          </View>
        </ScrollView>

      </SafeAreaView>

      {/* Info card overlay */}
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

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: BG },
  safe:        { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing(2.5),
    paddingTop: spacing(1.5),
    paddingBottom: spacing(1.5),
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: "#fff", borderWidth: 1, borderColor: BORDER, alignItems: "center", justifyContent: "center" },
  backArrow:    { fontSize: 24, color: "#1C1A14", lineHeight: 28 },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle:  { fontFamily: SERIF, fontSize: 20, color: "#1C1A14", fontWeight: "400" },
  headerSub:    { fontSize: 12, color: "#7A7060", marginTop: 1 },

  scrollContent: { alignItems: "center", paddingVertical: spacing(3) },

  mapContainer: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#1C1408",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },

  legend: {
    flexDirection: "row",
    gap: spacing(3),
    marginTop: spacing(2.5),
    paddingHorizontal: spacing(2.5),
  },
  legendRow:  { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot:  { width: 10, height: 10, borderRadius: 5 },
  legendTxt:  { fontSize: 13, color: "#5C5040" },
});
