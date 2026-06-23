/**
 * FocusScreen.jsx — Safar
 *
 * Focus Mode landing. Three full-width image cards — each a portal
 * into the ritual. Tapping enters the counter directly.
 * Dark, immersive, intentional. Matches sub-screen language.
 */
import React from "react";
import {
  SafeAreaView, View, Text, TouchableOpacity,
  StyleSheet, ImageBackground, Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing } from "../theme";

const { width: SW } = Dimensions.get("window");
const BG    = "#0A1A10";
const GOLD  = "#C8A96A";
const WHITE = "#F5F0E8";
const SERIF = "SourceSerif4-Regular";

const OPTIONS = [
  {
    screen:  "Tawaf",
    arabic:  "\u0637\u0648\u0627\u0641",
    title:   "Taw\u0101f Counter",
    sub:     "7 circuits around the Ka\u02bfbah",
    image:   require("../assets/tawaf.jpg"),
    scrim:   "rgba(6,20,10,0.52)",
  },
  {
    screen:  "Saiy",
    arabic:  "\u0633\u0639\u064a",
    title:   "Sa\u02bfi Tracker",
    sub:     "\u1e62af\u0101 to Marwah \u2014 7 lengths",
    image:   require("../assets/Umrah_04_sai_gradient.jpg"),
    scrim:   "rgba(6,20,10,0.48)",
  },
  {
    screen:  "Dhikr",
    arabic:  "\u0630\u0643\u0631",
    title:   "Dhikr Counter",
    sub:     "Remember Allah with any dhikr",
    image:   require("../assets/focus_mode.jpg"),
    scrim:   "rgba(6,20,10,0.55)",
  },
];

export default function FocusScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const CARD_H = (Dimensions.get("window").height - insets.top - insets.bottom - 120) / 3;

  return (
    <SafeAreaView style={[s.safe, { paddingBottom: insets.bottom }]}>

      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Focus Mode</Text>
        <Text style={s.sub}>{"Stay present. Every act of worship counts."}</Text>
      </View>

      {/* Image cards */}
      <View style={s.cards}>
        {OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.screen}
            style={[s.card, { height: CARD_H }]}
            onPress={() => navigation?.navigate?.(opt.screen)}
            activeOpacity={0.88}
          >
            <ImageBackground
              source={opt.image}
              style={s.cardBg}
              imageStyle={{ borderRadius: 16 }}
              resizeMode="cover"
            >
              <View style={[s.scrim, { backgroundColor: opt.scrim }]} />
              <View style={s.cardContent}>
                <Text style={s.cardArabic}>{opt.arabic}</Text>
                <View style={s.cardText}>
                  <Text style={s.cardTitle}>{opt.title}</Text>
                  <Text style={s.cardSub}>{opt.sub}</Text>
                </View>
              </View>
              <View style={s.cardArrow}>
                <Text style={s.arrowTxt}>{"›"}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </View>

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:  { flex:1, backgroundColor:BG },

  header: {
    alignItems:"center",
    paddingTop:spacing(2),
    paddingBottom:spacing(1.5),
    paddingHorizontal:spacing(2.5),
  },
  title: {
    fontFamily:SERIF,
    fontSize:28,
    color:WHITE,
    fontWeight:"400",
    marginBottom:4,
  },
  sub: {
    fontSize:13,
    color:GOLD,
    fontStyle:"italic",
    textAlign:"center",
  },

  cards: {
    flex:1,
    paddingHorizontal:spacing(2.5),
    gap:spacing(1.25),
    paddingBottom:spacing(1),
  },

  card: {
    borderRadius:16,
    overflow:"hidden",
    shadowColor:"#000",
    shadowOffset:{ width:0, height:4 },
    shadowOpacity:0.35,
    shadowRadius:10,
    elevation:6,
  },
  cardBg: {
    flex:1,
    justifyContent:"flex-end",
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius:16,
  },
  cardContent: {
    flexDirection:"row",
    alignItems:"flex-end",
    padding:16,
    gap:16,
  },
  cardArabic: {
    fontFamily:SERIF,
    fontSize:52,
    color:"rgba(200,169,106,0.70)",
    lineHeight:60,
    flexShrink:0,
  },
  cardText:  { flex:1 },
  cardTitle: {
    fontFamily:SERIF,
    fontSize:22,
    color:WHITE,
    fontWeight:"400",
    marginBottom:3,
  },
  cardSub: {
    fontSize:13,
    color:"rgba(245,240,232,0.65)",
    lineHeight:18,
  },
  cardArrow: {
    position:"absolute",
    top:14,
    right:16,
  },
  arrowTxt: {
    fontSize:26,
    color:"rgba(245,240,232,0.40)",
  },
});
