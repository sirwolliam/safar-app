/**
 * FocusScreen.jsx — Safar
 * Focus Mode landing — dark, immersive, three large tap options.
 * Matches the visual language of TawafScreen, SaiyScreen, DhikrScreen.
 */
import React from "react";
import {
  SafeAreaView, View, Text, TouchableOpacity, StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing } from "../theme";

const BG      = "#0A1A10";
const SURFACE = "#122018";
const CARD    = "#172014";
const GOLD    = "#C8A96A";
const GREEN   = "#5A8C4A";
const MUTED   = "rgba(200,220,190,0.45)";
const WHITE   = "#F5F0E8";
const SERIF   = "SourceSerif4-Regular";

const OPTIONS = [
  {
    screen: "Tawaf",
    title:  "Taw\u0101f",
    sub:    "7 circuits around the Ka\u02bfbah",
    badge:  "7 rounds",
    arabic: "\u0637\u0648\u0627\u0641",
  },
  {
    screen: "Saiy",
    title:  "Sa\u02bfi",
    sub:    "\u1e62af\u0101 to Marwah \u2014 7 lengths",
    badge:  "7 lengths",
    arabic: "\u0633\u0639\u064a",
  },
  {
    screen: "Dhikr",
    title:  "Dhikr",
    sub:    "Remember Allah with any dhikr",
    badge:  "22 dhikrs",
    arabic: "\u0630\u0643\u0631",
  },
];

export default function FocusScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[s.safe, { paddingBottom:insets.bottom }]}>

      <View style={s.header}>
        <Text style={s.title}>Focus Mode</Text>
        <Text style={s.sub}>{"Stay present. Every act of worship counts."}</Text>
      </View>

      <View style={s.options}>
        {OPTIONS.map((opt, i) => (
          <TouchableOpacity
            key={opt.screen}
            style={s.card}
            onPress={() => navigation?.navigate?.(opt.screen)}
            activeOpacity={0.82}
          >
            <View style={s.cardLeft}>
              <Text style={s.cardArabic}>{opt.arabic}</Text>
              <Text style={s.cardTitle}>{opt.title}</Text>
              <Text style={s.cardSub}>{opt.sub}</Text>
            </View>
            <View style={s.cardRight}>
              <View style={s.badge}>
                <Text style={s.badgeTxt}>{opt.badge}</Text>
              </View>
              <Text style={s.chevron}>{"›"}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.footer}>
        {"Tap a practice to begin."}
      </Text>

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex:1, backgroundColor:BG },

  header: {
    alignItems:"center",
    paddingTop:spacing(3),
    paddingBottom:spacing(2.5),
    paddingHorizontal:spacing(2.5),
  },
  title: { fontFamily:SERIF, fontSize:30, color:WHITE, fontWeight:"400", marginBottom:6 },
  sub:   { fontSize:14, color:GOLD, fontStyle:"italic", textAlign:"center" },

  options: {
    flex:1,
    paddingHorizontal:spacing(2.5),
    gap:spacing(1.5),
    justifyContent:"center",
  },

  card: {
    backgroundColor:CARD,
    borderRadius:18,
    borderWidth:1,
    borderColor:"rgba(90,140,74,0.30)",
    paddingVertical:spacing(2.5),
    paddingHorizontal:spacing(2.5),
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    shadowColor:"#000",
    shadowOffset:{ width:0, height:3 },
    shadowOpacity:0.20,
    shadowRadius:8,
    elevation:4,
  },
  cardLeft:  { flex:1, gap:4 },
  cardArabic:{ fontFamily:SERIF, fontSize:22, color:GOLD, marginBottom:2 },
  cardTitle: { fontFamily:SERIF, fontSize:24, color:WHITE, fontWeight:"400" },
  cardSub:   { fontSize:13, color:MUTED, lineHeight:18 },
  cardRight: { alignItems:"flex-end", gap:spacing(1), marginLeft:spacing(1.5) },

  badge: {
    backgroundColor:"rgba(90,140,74,0.20)",
    borderRadius:50,
    paddingHorizontal:12,
    paddingVertical:4,
    borderWidth:1,
    borderColor:"rgba(90,140,74,0.40)",
  },
  badgeTxt: { fontSize:12, color:GREEN, fontWeight:"600" },
  chevron:  { fontSize:22, color:"rgba(90,140,74,0.60)" },

  footer: {
    textAlign:"center",
    fontSize:13,
    color:MUTED,
    paddingBottom:spacing(2),
  },
});
