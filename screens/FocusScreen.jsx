/**
 * FocusScreen.jsx — Safar
 * Focus Mode landing.
 * - No icons on cards
 * - Text anchored top-left
 * - "Start →" pill bottom-right
 * - Lighter scrims
 * - Cards reduced 10px, all visible without scrolling
 * - Ask Safar button top-right of header
 */
import React, { useRef, useState } from "react";
import {
  SafeAreaView, View, Text, TouchableOpacity,
  StyleSheet, ImageBackground, Dimensions, Animated, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Sparkle } from "phosphor-react-native";
import { spacing, radius } from "../theme";
import AskModal from "../components/AskModal";

const TAB_BAR_H = Platform.OS === "ios" ? 88 : 72;
const HEADER_H  = 76;
const GAP       = 13;
const TOP_PAD   = 15;
const BG    = "#0A1A10";
const GOLD  = "#C8A96A";
const WHITE = "#F5F0E8";
const SERIF = "SourceSerif4-Regular";

const OPTIONS = [
  {
    screen: "Tawaf",
    title:  "Taw\u0101f Counter",
    what:   "Circling the Ka\u02bfbah \u00b7 7 rounds",
    image:  require("../assets/tawaf.jpg"),
    scrim:  "rgba(4,16,8,0.35)",
  },
  {
    screen: "Saiy",
    title:  "Sa\u02bfi Tracker",
    what:   "\u1e62af\u0101 to Marwah \u00b7 7 lengths",
    image:  require("../assets/sayi.jpg"),
    scrim:  "rgba(4,14,10,0.32)",
  },
  {
    screen: "Dhikr",
    title:  "Dhikr Counter",
    what:   "Remembrance of Allah",
    image:  require("../assets/focus_mode.jpg"),
    scrim:  "rgba(4,14,10,0.36)",
  },
];

// ── Card ──────────────────────────────────────────────────────────────────────
function FocusCard({ opt, onPress, cardHeight }) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn  = () =>
    Animated.spring(scale, { toValue:0.97, useNativeDriver:true, speed:50, bounciness:3 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue:1,    useNativeDriver:true, speed:30, bounciness:6 }).start();

  return (
    <Animated.View style={[c.outer, { height: cardHeight, transform:[{ scale }] }]}>
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
          imageStyle={{ borderRadius: radius.lg }}
        >
          {/* Lighter scrim */}
          <View style={[c.scrim, { backgroundColor: opt.scrim }]} />

          {/* Text — top left */}
          <View style={c.textBlock}>
            <Text style={c.title}>{opt.title}</Text>
            <Text style={c.what}>{opt.what}</Text>
          </View>

          {/* Start pill — bottom right */}
          <View style={c.pillRow}>
            <View style={c.pill}>
              <Text style={c.pillTxt}>{"Start  \u2192"}</Text>
            </View>
          </View>

        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
}

const c = StyleSheet.create({
  outer: {
    marginHorizontal: spacing(2),
    borderRadius:     radius.lg,
    borderWidth:      1,
    borderColor:      "rgba(200,169,106,0.40)",
    shadowColor:      "#000",
    shadowOffset:     { width:0, height:4 },
    shadowOpacity:    0.40,
    shadowRadius:     10,
    elevation:        8,
  },
  touchable: { flex:1, borderRadius:radius.lg, overflow:"hidden" },
  bg:        { flex:1 },
  scrim:     { ...StyleSheet.absoluteFillObject },

  // Text top-left
  textBlock: {
    position:          "absolute",
    top:               spacing(2),
    left:              spacing(2.5),
    right:             spacing(2.5),
  },
  title: {
    fontFamily:       SERIF,
    fontSize:         27,
    color:            WHITE,
    fontWeight:       "600",
    marginBottom:     4,
    textShadowColor:  "rgba(0,0,0,0.55)",
    textShadowOffset: { width:0, height:1 },
    textShadowRadius: 4,
  },
  what: {
    fontSize:         13,
    color:            "rgba(245,240,232,0.70)",
    textShadowColor:  "rgba(0,0,0,0.40)",
    textShadowOffset: { width:0, height:1 },
    textShadowRadius: 3,
  },

  // Pill bottom-right
  pillRow: {
    position:      "absolute",
    bottom:        spacing(2),
    right:         spacing(2.5),
  },
  pill: {
    backgroundColor:   "rgba(200,169,106,0.50)",
    borderWidth:       1,
    borderColor:       "rgba(200,169,106,0.50)",
    borderRadius:      radius.pill,
    paddingHorizontal: spacing(2),
    paddingVertical:   7,
  },
  pillTxt: {
    fontFamily: SERIF,
    fontSize:   14,
    color:      WHITE,
    fontWeight: "600",
  },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function FocusScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [askVisible, setAskVisible] = useState(false);

  // Precise available height: screen - safeArea top/bottom - tab bar - header - gaps between 3 cards
  const { height: SH } = Dimensions.get("window");
  const available = SH - insets.top - insets.bottom - TAB_BAR_H - HEADER_H - TOP_PAD - (GAP * 2);
  // Divide evenly — all three cards identical height
  const cardH = Math.floor(available / 3);

  return (
    <SafeAreaView style={s.safe}>

      {/* Header — Ask Safar top-right */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.title}>Focus Mode</Text>
          <Text style={s.sub}>{"Select a counter to track your progress"}</Text>
        </View>
        <TouchableOpacity
          style={s.askBtn}
          onPress={() => setAskVisible(true)}
          activeOpacity={0.85}
        >
          <Sparkle size={18} color={GOLD} weight="thin" />
        </TouchableOpacity>
      </View>

      {/* Cards — no scroll, all three visible */}
      <View style={s.cards}>
        {OPTIONS.map(opt => (
          <FocusCard
            key={opt.screen}
            opt={opt}
            cardHeight={cardH}
            onPress={() => navigation?.navigate?.(opt.screen)}
          />
        ))}
      </View>

      <AskModal
        visible={askVisible}
        onClose={() => setAskVisible(false)}
        context="Focus Mode — Tawaf Counter, Sa'i Tracker, Dhikr Counter"
        contextLabel="Focus Mode"
      />

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex:1, backgroundColor:BG },

  header: {
    flexDirection:     "row",
    alignItems:        "center",
    justifyContent:    "space-between",
    paddingHorizontal: spacing(2.5),
    paddingTop:        14,
    paddingBottom:     12,
  },
  headerLeft: { flex:1 },
  title: {
    fontFamily:   SERIF,
    fontSize:     26,
    color:        WHITE,
    marginBottom: 3,
  },
  sub: {
    fontSize:  14,
    color:     "rgba(245,240,232,0.45)",
  },
  askBtn: {
    width:           36,
    height:          36,
    borderRadius:    18,
    backgroundColor: "rgba(200,169,106,0.12)",
    borderWidth:     1,
    borderColor:     "rgba(200,169,106,0.35)",
    alignItems:      "center",
    justifyContent:  "center",
    marginLeft:      spacing(1.5),
  },

  cards: {
    flex:         1,
    paddingTop:   TOP_PAD,
    gap:          GAP,
    paddingBottom: spacing(1),
  },
});
