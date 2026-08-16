/**
 * MapStepListScreen.jsx — Safar
 * Landing screen before the swipeable Map detail view — ornate header
 * matching MapScreen, an explainer of what this feature includes, then
 * the step list itself.
 */
import React from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, StyleSheet, Dimensions, StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CaretLeft, CaretRight } from "phosphor-react-native";
import { spacing, radius } from "../theme";
import HeaderPatternBg from "../HeaderPatternBg";

const { width: SW } = Dimensions.get("window");

const SAGE    = "#4A5C48";
const CARD_BG = "#FDFAF4";
const BORDER  = "rgba(200,185,160,0.45)";
const TEXT    = "#1C1A14";
const MUTED   = "#7A7060";
const SERIF   = "SourceSerif4-Regular";
const BG      = "#EDE8DC";

const UMRAH_LIST = [
  { label:"Ihram",                  sub:"Entering the sacred state",        photo:require("../assets/ihram.jpg") },
  { label:"Enter Masjid al-Haram",  sub:"Your first sight of the Ka'bah",   photo:require("../assets/arrival.jpg") },
  { label:"Tawaf",                  sub:"Seven circuits of the Ka'bah",     photo:require("../assets/tawaf2.jpg") },
  { label:"Maqam Ibrahim & Zamzam", sub:"Prayer, then the blessed well",    photo:require("../assets/maqam_ibrahim_map.png") },
  { label:"Safa & Marwah (Sa'i)",   sub:"Seven journeys between the hills", photo:require("../assets/sayi.jpg") },
  { label:"Halq / Taqseer",         sub:"Completing your Umrah",            photo:require("../assets/Umrah_05_completion_gradient.jpg") },
];

const HAJJ_LIST = [
  { label:"Ihram",                      sub:"8th Dhul Hijjah",                     photo:require("../assets/ihram.jpg") },
  { label:"Mina",                       sub:"8th Dhul Hijjah",                     photo:require("../assets/arrival.jpg") },
  { label:"Arafat",                     sub:"9th Dhul Hijjah — the heart of Hajj", photo:require("../assets/arafah.jpg") },
  { label:"Muzdalifah",                 sub:"Night under the open sky",            photo:require("../assets/arrival.jpg") },
  { label:"Jamarat",                    sub:"10th–12th, in Mina",                  photo:require("../assets/arrival.jpg") },
  { label:"Tawaf al-Ifadah + Farewell", sub:"Return to Makkah",                    photo:require("../assets/tawaf2.jpg") },
];

export default function MapStepListScreen({ navigation, route }) {
  const guide = route?.params?.guide === "hajj" ? "hajj" : "umrah";
  const steps = guide === "hajj" ? HAJJ_LIST : UMRAH_LIST;
  const insets = useSafeAreaInsets();

  return (
    <View style={s.safe}>
      <StatusBar barStyle="light-content" />

      {/* Header — matches MapScreen / MyContactsScreen */}
      <View style={s.header}>
        <HeaderPatternBg width={SW} />
        <View style={[s.headerTopRow, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.85}>
            <CaretLeft size={18} color="#1A1712" weight="bold" />
          </TouchableOpacity>
          <View style={{ width: 36 }} />
        </View>
        <View style={s.headerCenter}>
          <Text style={s.pageTitle}>{guide === "hajj" ? "Hajj Map" : "Umrah Map"}</Text>
          <Text style={s.pageSubtitle}>{steps.length + " Steps, Start to Finish"}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Explainer */}
        <View style={s.explainerCard}>
          <Text style={s.explainerText}>
            {"These maps walk you through every stage of your " + (guide === "hajj" ? "Hajj" : "Umrah") + ", in order. Each step includes a map of exactly where it happens, a photo of what to expect, and a short explanation of what to do — with links to the full guide and relevant du'as."}
            {"\n\n"}
            <Text style={s.explainerTextBold}>Tap any step below to explore it, or work through them one by one.</Text>
          </Text>
        </View>

        {steps.map((step, i) => (
          <TouchableOpacity
            key={step.label}
            style={s.row}
            activeOpacity={0.85}
            onPress={() => navigation?.navigate?.("Map", { guide, stepIndex: i })}
          >
            <Image source={step.photo} style={s.thumb} resizeMode="cover" />
            <View style={s.rowInfo}>
              <Text style={s.rowStep}>{"STEP " + (i + 1)}</Text>
              <Text style={s.rowLabel}>{step.label}</Text>
              <Text style={s.rowSub}>{step.sub}</Text>
            </View>
            <CaretRight size={18} color={MUTED} weight="bold" />
          </TouchableOpacity>
        ))}
        <View style={{ height: spacing(4) }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  header:      { backgroundColor:SAGE, minHeight:160, position:"relative", overflow:"hidden", paddingHorizontal:20, paddingBottom:16 },
  headerTopRow:{ flexDirection:"row", alignItems:"center", justifyContent:"space-between" },
  backBtn:     { width:36, height:36, borderRadius:18, backgroundColor:CARD_BG, borderWidth:1, borderColor:"#D4D0CA", alignItems:"center", justifyContent:"center" },
  headerCenter:{ alignItems:"center", marginTop:16 },
  pageTitle:   { fontFamily:SERIF, fontSize:38, color:CARD_BG },
  pageSubtitle:{ fontSize:14, color:"rgba(255,255,255,0.75)", marginTop:1 },

  scroll: { paddingHorizontal: spacing(2.5), paddingTop: spacing(2) },

  explainerCard: {
    backgroundColor:"#FDFAF4", borderRadius:radius.lg,
    borderWidth:1, borderColor:BORDER,
    padding:16, marginBottom:18,
  },
  explainerText:     { fontSize:16, lineHeight:23, color:"#3A3228" },
  explainerTextBold: { fontSize:16, lineHeight:23, color:"#3A3228", fontWeight:"700" },

  row: { flexDirection: "row", alignItems: "center", backgroundColor: "#FDFAF4", borderRadius: radius.lg, borderWidth: 1, borderColor: BORDER, padding: 10, marginBottom: 10 },
  thumb: { width: 56, height: 56, borderRadius: 12, marginRight: 12 },
  rowInfo: { flex: 1 },
  rowStep: { fontSize: 10, fontWeight: "700", letterSpacing: 1, color: SAGE, marginBottom: 2 },
  rowLabel: { fontFamily: SERIF, fontSize: 18, color: TEXT, marginBottom: 2 },
  rowSub: { fontSize: 12, color: MUTED },
});
