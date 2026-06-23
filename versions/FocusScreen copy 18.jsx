/**
 * FocusScreen.jsx — Safar
 * Focus Mode landing — clean, minimal, immersive.
 * All 3 cards visible without scrolling.
 * Gold outline border, simple Start pill, thin Phosphor icons.
 */
import React, { useRef } from "react";
import {
  SafeAreaView, View, Text, TouchableOpacity,
  StyleSheet, ImageBackground, Dimensions, Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowsClockwise, Footprints, Repeat } from "phosphor-react-native";
import { spacing, radius } from "../theme";

const { height: SH } = Dimensions.get("window");
const BG    = "#0A1A10";
const GOLD  = "#C8A96A";
const WHITE = "#F5F0E8";
const SERIF = "SourceSerif4-Regular";

const OPTIONS = [
  {
    screen: "Tawaf",
    Icon:   ArrowsClockwise,
    title:  "Taw\u0101f Counter",
    what:   "Circling the Ka\u02bfbah \u00b7 7 rounds",
    image:  require("../assets/tawaf.jpg"),
    scrim:  "rgba(4,16,8,0.52)",
  },
  {
    screen: "Saiy",
    Icon:   Footprints,
    title:  "Sa\u02bfi Tracker",
    what:   "\u1e62af\u0101 to Marwah \u00b7 7 lengths",
    image:  require("../assets/sayi.jpg"),
    scrim:  "rgba(4,14,10,0.50)",
  },
  {
    screen: "Dhikr",
    Icon:   Repeat,
    title:  "Dhikr Counter",
    what:   "Remembrance of Allah",
    image:  require("../assets/focus_mode.jpg"),
    scrim:  "rgba(4,14,10,0.54)",
  },
];

// ── Card ──────────────────────────────────────────────────────────────────────
function FocusCard({ opt, onPress, cardHeight }) {
  const { Icon } = opt;
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn  = () =>
    Animated.spring(scale, { toValue:0.97, useNativeDriver:true, speed:50, bounciness:3 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue:1,    useNativeDriver:true, speed:30, bounciness:6 }).start();

  return (
    <Animated.View style={[c.outer, { height:cardHeight, transform:[{ scale }] }]}>
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

          {/* Icon + title + subtitle */}
          <View style={c.content}>
            <Icon size={26} color="rgba(245,240,232,0.75)" weight="thin" />
            <Text style={c.title}>{opt.title}</Text>
            <Text style={c.what}>{opt.what}</Text>
          </View>

          {/* Start pill — bottom left, matches arrow badge opacity */}
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
    marginBottom:     spacing(1.5),
    borderRadius:     radius.lg,
    // Gold outline stroke
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

  content: {
    flex:              1,
    justifyContent:    "center",
    paddingHorizontal: spacing(2.5),
    gap:               8,
  },
  title: {
    fontFamily:       SERIF,
    fontSize:         22,
    color:            WHITE,
    fontWeight:       "600",
    textShadowColor:  "rgba(0,0,0,0.60)",
    textShadowOffset: { width:0, height:1 },
    textShadowRadius: 4,
  },
  what: {
    fontSize:   13,
    color:      "rgba(245,240,232,0.58)",
  },

  pillRow: {
    paddingHorizontal: spacing(2.5),
    paddingBottom:     spacing(2),
  },
  pill: {
    alignSelf:         "flex-start",
    backgroundColor:   "rgba(200,169,106,0.18)",
    borderWidth:       1,
    borderColor:       "rgba(200,169,106,0.45)",
    borderRadius:      radius.pill,
    paddingHorizontal: spacing(2),
    paddingVertical:   7,
  },
  pillTxt: {
    fontFamily: SERIF,
    fontSize:   14,
    color:      GOLD,
    fontWeight: "600",
  },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function FocusScreen({ navigation }) {
  const insets  = useSafeAreaInsets();

  // All 3 cards fill available height without scrolling
  const HEADER_H  = 76;
  const available = SH - insets.top - insets.bottom - HEADER_H;
  const cardH     = (available - spacing(1.5) * 3) / 3;

  return (
    <SafeAreaView style={s.safe}>

      {/* Header — compact */}
      <View style={s.header}>
        <Text style={s.title}>Focus Mode</Text>
        <Text style={s.sub}>{"Select a counter below to track your progress"}</Text>
      </View>

      {/* Cards */}
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

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex:1, backgroundColor:BG },

  header: {
    alignItems:        "center",
    paddingTop:        spacing(1.75),
    paddingBottom:     spacing(1.5),
    paddingHorizontal: spacing(3),
  },
  title: {
    fontFamily:   SERIF,
    fontSize:     24,
    color:        WHITE,
    marginBottom: 4,
  },
  sub: {
    fontSize:  13,
    color:     "rgba(245,240,232,0.45)",
    textAlign: "center",
  },

  cards: {
    flex:         1,
    paddingBottom: spacing(1.5),
  },
});
