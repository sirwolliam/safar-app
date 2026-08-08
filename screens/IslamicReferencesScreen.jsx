import React from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CaretLeft, ArrowSquareOut } from "phosphor-react-native";
import HeaderPatternBg from "../HeaderPatternBg";

const SERIF = "SourceSerif4-Regular";
const SW = Dimensions.get("window").width;

const ISLAMIC_REFERENCES = [
  { title: "Sunnah.com",          sub: "Hadith collections — Bukhari, Muslim, and more",  url: "https://sunnah.com" },
  { title: "IslamQA.info",        sub: "Scholarly Q&A on fiqh and worship",                url: "https://islamqa.info/en" },
  { title: "SeekersGuidance.org", sub: "Online Islamic courses and fatwa service",         url: "https://seekersguidance.org" },
  { title: "Islamweb.net",        sub: "Fatwas, Quran and hadith research",                url: "https://www.islamweb.net/en" },
];

export default function IslamicReferencesScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={s.safe}>
      <View style={s.header}>
        <HeaderPatternBg width={SW} />
        <View style={[s.headerTopRow, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => { const returnToTab = route?.params?.returnToTab; if (returnToTab) { navigation?.getParent?.()?.navigate?.(returnToTab); } else { navigation?.goBack?.(); } }}
            activeOpacity={0.8}
          >
            <CaretLeft size={20} color="#1A1712" weight="bold" />
          </TouchableOpacity>
        </View>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Islamic References</Text>
          <Text style={s.headerSub}>Trusted scholarly sources</Text>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {ISLAMIC_REFERENCES.map((item) => (
          <TouchableOpacity
            key={item.url}
            style={s.row}
            onPress={() => Linking.openURL(item.url)}
            activeOpacity={0.85}
          >
            <View style={s.rowInfo}>
              <Text style={s.rowTitle}>{item.title}</Text>
              <Text style={s.rowSub}>{item.sub}</Text>
            </View>
            <ArrowSquareOut size={18} color="#7A6030" weight="regular" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: "#F5F0E8" },
  header:        { position: "relative", overflow: "hidden", minHeight: 140, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: "#4A5C48" },
  headerTopRow:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 2 },
  backBtn:       { width: 36, height: 36, borderRadius: 18, backgroundColor: "#FDFAF4", alignItems: "center", justifyContent: "center" },
  headerCenter:  { alignItems: "center", marginTop: 8 },
  headerTitle:   { fontFamily: SERIF, fontSize: 28, color: "#FDFAF4", textAlign: "center" },
  headerSub:     { fontSize: 13, color: "rgba(253,250,244,0.75)", textAlign: "center", marginTop: 4 },
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },
  row:           { flexDirection: "row", alignItems: "center", backgroundColor: "#FDFAF4", borderRadius: 12, borderWidth: 1, borderColor: "#E0D8CC", paddingHorizontal: 16, paddingVertical: 14, marginBottom: 10 },
  rowInfo:       { flex: 1, marginRight: 12 },
  rowTitle:      { fontFamily: SERIF, fontSize: 17, color: "#1C1A14", marginBottom: 3 },
  rowSub:        { fontSize: 13, color: "#5C534A", lineHeight: 18 },
});
