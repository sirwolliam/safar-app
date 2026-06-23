/**
 * FocusScreen.jsx — Safar
 * Focus Mode landing — rebuilt for usability.
 * No Arabic (decorative, unhelpful to English speakers).
 * Each card now shows:
 *   - Counter type icon + title + what it tracks
 *   - Step pip indicators showing total count
 *   - Instructional tip line
 *   - Prominent gold "Start counting" CTA pill with pulse animation
 *   - Gold bottom strip affordance
 *   - High-contrast arrow badge top-right
 * Header: clear instructional subtitle
 */
import React, { useRef, useEffect } from "react";
import {
  SafeAreaView, View, Text, TouchableOpacity,
  StyleSheet, ImageBackground, Dimensions, Animated,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowsClockwise, Footprints, Repeat } from "phosphor-react-native";
import { spacing, radius } from "../theme";

const { width: SW } = Dimensions.get("window");
const BG     = "#0A1A10";
const GOLD   = "#C8A96A";
const GOLD_D = "#A8893A";
const WHITE  = "#F5F0E8";
const SERIF  = "SourceSerif4-Regular";
const CARD_H = 210;

const OPTIONS = [
  {
    screen:    "Tawaf",
    Icon:      ArrowsClockwise,
    title:     "Taw\u0101f Counter",
    what:      "Circling the Ka\u02bfbah",
    steps:     7,
    stepLabel: "rounds",
    cta:       "Start counting rounds",
    tip:       "Tap once per circuit \u2014 counts all 7 rounds for you",
    image:     require("../assets/tawaf.jpg"),
    scrim:     "rgba(4,16,8,0.55)",
  },
  {
    screen:    "Saiy",
    Icon:      Footprints,
    title:     "Sa\u02bfy Tracker",
    what:      "\u1e62af\u0101 to Marwah",
    steps:     7,
    stepLabel: "lengths",
    cta:       "Start tracking lengths",
    tip:       "Tracks each of your 7 lengths between \u1e62af\u0101 and Marwah",
    image:     require("../assets/sayi.jpg"),
    scrim:     "rgba(4,14,10,0.52)",
  },
  {
    screen:    "Dhikr",
    Icon:      Repeat,
    title:     "Dhikr Counter",
    what:      "Remembrance of Allah",
    steps:     33,
    stepLabel: "counts",
    cta:       "Start counting dhikr",
    tip:       "Tap to count \u2014 set your own target (33, 99, or custom)",
    image:     require("../assets/focus_mode.jpg"),
    scrim:     "rgba(4,14,10,0.58)",
  },
];

// ── Pulsing ring behind the CTA pill ─────────────────────────────────────────
function PulseRing() {
  const scale = useRef(new Animated.Value(1)).current;
  const opac  = useRef(new Animated.Value(0.65)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue:1.22, duration:950, useNativeDriver:true }),
          Animated.timing(scale, { toValue:1,    duration:950, useNativeDriver:true }),
        ]),
        Animated.sequence([
          Animated.timing(opac, { toValue:0.10, duration:950, useNativeDriver:true }),
          Animated.timing(opac, { toValue:0.65, duration:950, useNativeDriver:true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[pr.ring, { transform:[{ scale }], opacity:opac }]} />
  );
}
const pr = StyleSheet.create({
  ring: {
    position:"absolute",
    width:46, height:46, borderRadius:23,
    borderWidth:2, borderColor:GOLD,
  },
});

// ── Step pips ─────────────────────────────────────────────────────────────────
function StepPips({ total, label }) {
  const show    = Math.min(total, 9);
  const hasMore = total > 9;
  return (
    <View style={pp.row}>
      {Array.from({ length: show }, (_, i) => (
        <View key={i} style={pp.pip} />
      ))}
      {hasMore && <Text style={pp.ellipsis}>{"···"}</Text>}
      <Text style={pp.label}>{total + "\u2009" + label}</Text>
    </View>
  );
}
const pp = StyleSheet.create({
  row:     { flexDirection:"row", alignItems:"center", flexWrap:"wrap", gap:5, marginBottom:10 },
  pip:     { width:7, height:7, borderRadius:4, backgroundColor:"rgba(200,169,106,0.50)" },
  ellipsis:{ fontSize:12, color:"rgba(200,169,106,0.50)", letterSpacing:2, marginLeft:2 },
  label:   { fontSize:12, color:"rgba(245,240,232,0.55)", fontWeight:"500", marginLeft:4 },
});

// ── Focus card ────────────────────────────────────────────────────────────────
function FocusCard({ opt, onPress }) {
  const { Icon } = opt;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn  = () =>
    Animated.spring(scaleAnim, { toValue:0.97, useNativeDriver:true, speed:50, bounciness:3 }).start();
  const onPressOut = () =>
    Animated.spring(scaleAnim, { toValue:1,    useNativeDriver:true, speed:30, bounciness:6 }).start();

  return (
    <Animated.View style={[c.outer, { transform:[{ scale:scaleAnim }] }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        style={c.touchable}
      >
        <ImageBackground
          source={opt.image}
          style={c.bg}
          resizeMode="cover"
          imageStyle={{ borderRadius:radius.lg }}
        >
          {/* Scrim */}
          <View style={[c.scrim, { backgroundColor:opt.scrim }]} />

          {/* Top row: icon + title/what left | arrow badge right */}
          <View style={c.topRow}>
            <View style={c.iconBlock}>
              <View style={c.iconWrap}>
                <Icon size={22} color="rgba(245,240,232,0.90)" weight="thin" />
              </View>
              <View style={c.titleBlock}>
                <Text style={c.title}>{opt.title}</Text>
                <Text style={c.what}>{opt.what}</Text>
              </View>
            </View>

            {/* Arrow badge — unmissable interactive cue */}
            <View style={c.arrowBadge}>
              <Text style={c.arrowTxt}>{"›"}</Text>
            </View>
          </View>

          {/* Step pips + count */}
          <StepPips total={opt.steps} label={opt.stepLabel} />

          {/* Tip */}
          <Text style={c.tip}>{opt.tip}</Text>

          {/* CTA pill with pulse */}
          <View style={c.ctaRow}>
            <View style={c.ctaWrap}>
              <PulseRing />
              <View style={c.ctaPill}>
                <Text style={c.ctaTxt}>{opt.cta}</Text>
                <Text style={c.ctaArrow}>{"  \u2192"}</Text>
              </View>
            </View>
          </View>

          {/* Gold bottom strip */}
          <View style={c.strip} />

        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
}

const c = StyleSheet.create({
  outer: {
    marginHorizontal: spacing(2),
    marginBottom:     spacing(1.75),
    borderRadius:     radius.lg,
    shadowColor:      "#000",
    shadowOffset:     { width:0, height:5 },
    shadowOpacity:    0.50,
    shadowRadius:     12,
    elevation:        9,
  },
  touchable: { height:CARD_H, borderRadius:radius.lg, overflow:"hidden" },
  bg:        { flex:1, padding:spacing(2), justifyContent:"flex-start", borderRadius:radius.lg },
  scrim:     { ...StyleSheet.absoluteFillObject, borderRadius:radius.lg },

  // Top row
  topRow:     { flexDirection:"row", alignItems:"flex-start", justifyContent:"space-between", marginBottom:spacing(1.5) },
  iconBlock:  { flexDirection:"row", alignItems:"center", gap:10, flex:1 },
  iconWrap:   {
    width:46, height:46, borderRadius:12,
    backgroundColor:"rgba(255,255,255,0.13)",
    borderWidth:1, borderColor:"rgba(255,255,255,0.20)",
    alignItems:"center", justifyContent:"center", flexShrink:0,
  },
  titleBlock: { flex:1 },
  title:      {
    fontFamily:SERIF, fontSize:20, color:WHITE, fontWeight:"600",
    textShadowColor:"rgba(0,0,0,0.65)", textShadowOffset:{width:0,height:1}, textShadowRadius:5,
  },
  what: { fontSize:13, color:"rgba(245,240,232,0.65)", marginTop:2 },

  // Arrow badge
  arrowBadge: {
    width:36, height:36, borderRadius:18,
    backgroundColor:"rgba(200,169,106,0.20)",
    borderWidth:1.5, borderColor:"rgba(200,169,106,0.65)",
    alignItems:"center", justifyContent:"center", flexShrink:0,
  },
  arrowTxt: { fontSize:22, color:GOLD, fontWeight:"700", lineHeight:26 },

  // Tip
  tip: {
    fontSize:12, color:"rgba(245,240,232,0.52)",
    fontStyle:"italic", marginBottom:spacing(1.5), lineHeight:17,
  },

  // CTA
  ctaRow:  { alignItems:"flex-start" },
  ctaWrap: { position:"relative", alignItems:"center", justifyContent:"center" },
  ctaPill: {
    flexDirection:"row", alignItems:"center",
    backgroundColor:GOLD,
    borderRadius:radius.pill,
    paddingHorizontal:spacing(2.25),
    paddingVertical:10,
    shadowColor:GOLD_D,
    shadowOffset:{ width:0, height:3 },
    shadowOpacity:0.60,
    shadowRadius:8,
    elevation:6,
  },
  ctaTxt:   { fontFamily:SERIF, fontSize:15, color:"#0A1A10", fontWeight:"700" },
  ctaArrow: { fontSize:16, color:"#0A1A10", fontWeight:"700" },

  // Gold strip
  strip: {
    position:"absolute", bottom:0, left:0, right:0,
    height:4, backgroundColor:GOLD, opacity:0.90,
    borderBottomLeftRadius:radius.lg, borderBottomRightRadius:radius.lg,
  },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function FocusScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[s.safe, { paddingBottom:insets.bottom }]}>

      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Focus Mode</Text>
        <Text style={s.sub}>
          {"Select a counter below to track your progress\nduring Taw\u0101f, Sa\u02bfy, or Dhikr"}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.list}>

        {OPTIONS.map(opt => (
          <FocusCard
            key={opt.screen}
            opt={opt}
            onPress={() => navigation?.navigate?.(opt.screen)}
          />
        ))}

        {/* Footer instruction */}
        <View style={s.footer}>
          <Text style={s.footerTxt}>
            {"Tap any card to open its counter \u2014 use it during your pilgrimage to stay on track"}
          </Text>
        </View>

        <View style={{ height:spacing(3) }} />
      </ScrollView>

    </SafeAreaView>
  );
}

// ── Screen styles ─────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex:1, backgroundColor:BG },

  header: {
    alignItems:        "center",
    paddingTop:        spacing(2.5),
    paddingBottom:     spacing(2),
    paddingHorizontal: spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(200,169,106,0.15)",
  },
  title: {
    fontFamily:   SERIF,
    fontSize:     28,
    color:        WHITE,
    fontWeight:   "400",
    marginBottom: 8,
  },
  sub: {
    fontSize:   14,
    color:      "rgba(245,240,232,0.58)",
    textAlign:  "center",
    lineHeight: 22,
  },

  list: { paddingTop:spacing(2.5) },

  footer: {
    marginHorizontal: spacing(3),
    marginTop:        spacing(0.5),
    padding:          spacing(1.75),
    borderRadius:     radius.md,
    backgroundColor:  "rgba(200,169,106,0.07)",
    borderWidth:      1,
    borderColor:      "rgba(200,169,106,0.15)",
  },
  footerTxt: {
    fontSize:   13,
    color:      "rgba(245,240,232,0.45)",
    textAlign:  "center",
    lineHeight: 20,
  },
});
