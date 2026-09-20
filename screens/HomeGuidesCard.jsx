import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const SERIF = "SourceSerif4-Regular";

// Duplicated from LearnMainScreen.jsx — kept independent so the two files can evolve separately.
const GUIDES = [
  {
    key: "umrah", label: "Umrah Guide", sub: "Every step of Umrah, in order",
    target: "UmrahGuide",
    image: require("../assets/umrah_guide_card.png"),
    tags: ["Guide", "Duas", "Map", "Checklist"],
  },
  {
    key: "hajj", label: "Hajj Guide", sub: "The full pilgrimage, day by day",
    target: "HajjGuide",
    image: require("../assets/hajj_guide_card.jpg"),
    tags: ["Guide", "Duas", "Map", "Checklist"],
  },
];

export default function HomeGuidesCard({ navigation }) {
  return (
    <View>
      {GUIDES.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={s.guideCard}
          activeOpacity={0.9}
          onPress={() => navigation?.getParent?.()?.navigate?.("Learn", { screen: item.target, initial: false, params: { returnToTab: "Home" } })}
        >
          <Image source={item.image} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
          <LinearGradient
            colors={["transparent", "rgba(20,16,10,0.80)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={s.guideCardInner}>
            <Text style={s.guideCardTitle}>{item.label}</Text>
            <Text style={s.guideCardSub}>{item.sub}</Text>
            <View style={s.tagRow}>
              {item.tags.map((t) => (
                <View key={t} style={s.tagPill}>
                  <Text style={s.tagPillText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  guideCard:      { height: 190, borderRadius: 20, overflow: "hidden", position: "relative", marginHorizontal: 8, marginBottom: 14, backgroundColor: "#1A1410", shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 4 },
  guideCardInner: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 18 },
  guideCardTitle: { fontFamily: SERIF, fontSize: 26, color: "#FFFFFF", fontWeight: "600", marginBottom: 4 },
  guideCardSub:   { fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 20, marginBottom: 10 },
  tagRow:         { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tagPill:        { backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 50, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.30)" },
  tagPillText:    { fontSize: 10, fontWeight: "700", color: "#FFFFFF", letterSpacing: 0.3 },
});
