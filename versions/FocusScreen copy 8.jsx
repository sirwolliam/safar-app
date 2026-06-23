/**
 * FocusScreen.jsx — Safar
 * Focus Mode landing — three option cards, each navigates to dedicated screen.
 */
import React, { useMemo } from "react";
import {
  SafeAreaView, View, Text, TouchableOpacity, StyleSheet,
} from "react-native";
import { colors, spacing, radius, shadows } from "../theme";
import { useAccessibility } from "../AccessibilityContext";

const SERIF = "SourceSerif4-Regular";

const OPTIONS = [
  {
    key:   "Tawaf",
    title: "Taw\u0101f Counter",
    hint:  "Track 7 circuits around the Ka\u02bfbah",
    badge: "7 rounds",
    screen:"Tawaf",
  },
  {
    key:   "Saiy",
    title: "Sa\u02bfy Tracker",
    hint:  "\u1e62af\u0101 to Marwah and back \u2014 7 lengths",
    badge: "7 lengths",
    screen:"Saiy",
  },
  {
    key:   "Dhikr",
    title: "Dhikr Counter",
    hint:  "Remember Allah with any dhikr",
    badge: "22 dhikrs",
    screen:"Dhikr",
  },
];

export default function FocusScreen({ navigation }) {
  const { colors } = useAccessibility();
  const s = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.wrap}>
        <Text style={s.title}>Focus Mode</Text>
        <Text style={s.sub}>Choose your practice to begin.</Text>

        {OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.key}
            style={s.card}
            onPress={() => navigation?.navigate?.(opt.screen)}
            activeOpacity={0.88}
          >
            <View style={s.cardLeft}>
              <Text style={s.cardTitle}>{opt.title}</Text>
              <Text style={s.cardHint}>{opt.hint}</Text>
            </View>
            <View style={s.badge}>
              <Text style={s.badgeTxt}>{opt.badge}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe: { flex:1, backgroundColor:colors.background },
  wrap: {
    flex:1,
    justifyContent:"center",
    paddingHorizontal:spacing(2.5),
    gap:spacing(1.5),
  },
  title: { fontFamily:SERIF, fontSize:30, color:colors.text, textAlign:"center", marginBottom:4 },
  sub:   { fontSize:15, color:colors.subtext, textAlign:"center", marginBottom:spacing(1) },
  card: {
    backgroundColor:colors.card,
    borderRadius:radius.lg,
    borderWidth:1.5,
    borderColor:colors.border,
    padding:spacing(2.5),
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    ...shadows.card,
  },
  cardLeft:  { gap:4, flex:1 },
  cardTitle: { fontFamily:SERIF, fontSize:22, color:colors.text },
  cardHint:  { fontSize:14, color:colors.subtext },
  badge: {
    backgroundColor:"#EBF2EE",
    borderRadius:radius.pill,
    paddingHorizontal:spacing(1.5),
    paddingVertical:spacing(0.5),
    borderWidth:1,
    borderColor:colors.border,
    marginLeft:spacing(1),
  },
  badgeTxt: { fontSize:12, color:colors.primary, fontWeight:"500" },
});
