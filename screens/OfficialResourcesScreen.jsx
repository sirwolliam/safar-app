import React from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CaretLeft, ArrowSquareOut } from "phosphor-react-native";
import HeaderPatternBg from "../HeaderPatternBg";

const SERIF = "SourceSerif4-Regular";
const SW = Dimensions.get("window").width;

const OFFICIAL_LINKS = [
  { title: "Saudi Ministry of Hajj",         sub: "Official pilgrimage authority",                    url: "https://www.haj.gov.sa" },
  { title: "Nusuk App",                       sub: "Official Hajj and Umrah services platform",        url: "https://www.nusuk.sa" },
  { title: "Eatmarna / Tawakkalna",           sub: "Entry permits and health requirements",            url: "https://www.haj.gov.sa/en/InternalPages/Page/47" },
  { title: "Presidency of Holy Mosques",      sub: "Masjid al-Haram and al-Nabawi authority",         url: "https://www.gph.gov.sa" },
  { title: "IATA Travel Centre — KSA",        sub: "Visa and entry requirements",                     url: "https://www.iata.org/en/publications/timatic/" },
];

export default function OfficialResourcesScreen({ navigation, route }) {
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
          <Text style={s.headerTitle}>Official Resources</Text>
          <Text style={s.headerSub}>Government and authority links</Text>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {OFFICIAL_LINKS.map((item) => (
          <TouchableOpacity
            key={item.url}
            style={s.row}
            onPress={() => Linking.openURL(item.url)}
            activeOpacity={0.75}
          >
            <View style={s.rowInfo}>
              <Text style={s.rowTitle}>{item.title}</Text>
              <Text style={s.rowSub}>{item.sub}</Text>
            </View>
            <ArrowSquareOut size={18} color="#C8BFB2" weight="regular" />
          </TouchableOpacity>
        ))}

        <Text style={s.note}>
          {"These are external, official Saudi and international resources — Safar is not affiliated with or responsible for their content."}
        </Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: "#F5F0E8" },
  header:       { backgroundColor: "#4A5C48", minHeight: 150, position: "relative", overflow: "hidden", paddingHorizontal: 20, paddingBottom: 16 },
  headerTopRow: { flexDirection: "row", alignItems: "center" },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: "#FDFAF4", borderWidth: 1, borderColor: "#D4D0CA", alignItems: "center", justifyContent: "center" },
  headerCenter: { alignItems: "center", marginTop: 14 },
  headerTitle:  { fontFamily: SERIF, fontSize: 32, color: "#FDFAF4", textAlign: "center" },
  headerSub:    { fontSize: 13, color: "rgba(255,255,255,0.75)", textAlign: "center", marginTop: 2 },
  scroll:       { flex: 1 },
  scrollContent:{ paddingTop: 12, paddingBottom: 24 },
  row:          { flexDirection: "row", alignItems: "center", backgroundColor: "#FDFAF4", borderRadius: 16, marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: "#EDE4D4", paddingHorizontal: 18, paddingVertical: 16, shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  rowInfo:      { flex: 1 },
  rowTitle:     { fontSize: 17, color: "#1A1410", marginBottom: 3 },
  rowSub:       { fontSize: 13, color: "#5C534A" },
  note:         { fontSize: 12, color: "#8A7D6A", paddingHorizontal: 20 },
});
