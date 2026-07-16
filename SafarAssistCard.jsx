import React from "react";
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet } from "react-native";
import { Sparkle } from "phosphor-react-native";

export default function SafarAssistCard({ title, subtitle, tagline, onPress, image }) {
  const src = image ?? require("./assets/safar-assist-card2.png");
  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.88}>
      <ImageBackground source={src} style={s.cardBg} imageStyle={{ borderRadius: 16, resizeMode: "cover" }}>
        <View style={s.scrim} />
        <View style={s.iconBadge}>
          <Sparkle size={18} color="#C8A96A" weight="fill" />
        </View>
        <View style={s.content}>
          <View style={s.topRow}>
            <Text style={s.title}>{title}</Text>
          </View>
          <Text style={s.subtitle} numberOfLines={2}>{subtitle}</Text>
          {tagline ? (
            <>
              <View style={s.divider} />
              <Text style={s.tagline}>{tagline}</Text>
            </>
          ) : null}
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card:      { borderRadius: 16, height: 118, overflow: "hidden", marginBottom: 12 },
  cardBg:    { flex: 1, width: "100%", height: "100%" },
  scrim:     { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(20,26,18,0.55)" },
  iconBadge: { position: "absolute", top: 12, right: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(74,92,72,0.85)", alignItems: "center", justifyContent: "center" },
  content:   { flex: 1, padding: 16, paddingRight: 56, justifyContent: "flex-start" },
  topRow:    { flexDirection: "row", alignItems: "center" },
  title:     { fontFamily: "SourceSerif4-Regular", fontSize: 24, color: "#FDFAF4", flexShrink: 1 },
  subtitle:  { fontSize: 11, color: "#D4DACF", marginTop: 6, lineHeight: 16 },
  divider:   { height: 1, backgroundColor: "rgba(255,255,255,0.15)", marginTop: 10, marginBottom: 6 },
  tagline:   { fontSize: 10, color: "#A8B5A2" },
});
