/**
 * UmrahGuideScreen.jsx — Safar
 * Hero → carousel, Umrah Du'ās, Pilgrimage Map, Sacred Places, Checklist
 */
import React, { useState, useEffect } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  ImageBackground, StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, spacing, radius, shadows } from "../theme";
import GuideCarousel, { UMRAH_STEPS } from "../GuideCarousel";

const SERIF       = "SourceSerif4-Regular";
const STORAGE_KEY = "safar_umrah_checklist_v1";

const UMRAH_CHECKLIST = [
  { id:"uc1",  text:"Obtain a valid Umrah visa" },
  { id:"uc2",  text:"Book flights and accommodation near the Haram" },
  { id:"uc3",  text:"Pack Ihram garments and travel essentials" },
  { id:"uc4",  text:"Learn the steps, du\u02bf\u0101\u02bes and intentions for each rite" },
  { id:"uc5",  text:"Memorise the Talbiyah and du\u02bf\u0101\u02be for entering Ihram" },
  { id:"uc6",  text:"Get any required vaccinations (meningitis, flu)" },
  { id:"uc7",  text:"Plan visits to sacred sites in Makkah and Madinah" },
  { id:"uc8",  text:"Pack comfortable walking shoes and unscented toiletries" },
  { id:"uc9",  text:"Arrange travel insurance and emergency contacts" },
  { id:"uc10", text:"Notify your bank of travel and exchange currency to SAR" },
];

export default function UmrahGuideScreen({ navigation }) {
  const [done,         setDone]         = useState({});
  const [showCarousel, setShowCarousel] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(v => { if (v) setDone(JSON.parse(v)); })
      .catch(() => {});
  }, []);

  const toggle = (id) => {
    const next = { ...done, [id]: !done[id] };
    setDone(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  };

  const completedCount = Object.values(done).filter(Boolean).length;

  return (
    <SafeAreaView style={s.safe}>

      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.8}>
          <Text style={s.backArrow}>{"‹"}</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>My Umrah Guide</Text>
          <Text style={s.headerSub}>Step-by-step pilgrimage guide</Text>
        </View>
        <View style={{ width:36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── 1. Hero — opens GuideCarousel ── */}
        <TouchableOpacity style={s.heroCard} onPress={() => setShowCarousel(true)} activeOpacity={0.9}>
          <ImageBackground
            source={require("../assets/Umrah_03_tawaf_gradient.jpg")}
            style={s.heroCardBg}
            resizeMode="cover"
          >
            <View style={s.heroCardScrim} />
            <View style={s.heroCardTop}>
              <View style={s.badge}><Text style={s.badgeTxt}>UMRAH 101</Text></View>
              <Text style={s.heroArrow}>{"›"}</Text>
            </View>
            <View style={s.heroCardBottom}>
              <Text style={s.heroCardTitle}>Visual Step-by-Step Guide</Text>
              <Text style={s.heroCardSub}>7 steps with images, descriptions and tips</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* ── 2. Umrah Du'ās — full width ── */}
        <TouchableOpacity
          style={s.fullCard}
          activeOpacity={0.88}
          onPress={() => navigation?.navigate?.("PilgrimageDuas", { mode:"umrah" })}
        >
          <ImageBackground
            source={require("../assets/Umrah_03_tawaf_gradient.jpg")}
            style={{ flex:1 }}
            imageStyle={{ borderRadius:14 }}
            resizeMode="cover"
          >
            <View style={[s.fullCardScrim, { backgroundColor:"rgba(10,24,16,0.42)" }]} />
            <View style={s.fullCardInner}>
              <Text style={s.fullCardEyebrow}>{"DU\u02bfĀS"}</Text>
              <Text style={s.fullCardTitle}>{"Umrah Du\u02bf\u0101\u02bes"}</Text>
              <Text style={s.fullCardSub}>{"23 du\u02bf\u0101\u02bes for every step of your Umrah"}</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* ── 3 & 4. Half-width cards: Pilgrimage Map + Sacred Places ── */}
        <View style={s.halfRow}>
          <TouchableOpacity
            style={[s.halfCard, { marginRight:6 }]}
            activeOpacity={0.88}
            onPress={() => navigation?.navigate?.("PilgrimageMap", { initialMode:"umrah" })}
          >
            <ImageBackground
              source={require("../assets/kaaba_map.png")}
              style={{ flex:1 }}
              imageStyle={{ borderRadius:14 }}
              resizeMode="cover"
            >
              <View style={[s.halfScrim, { backgroundColor:"rgba(8,14,24,0.44)" }]} />
              <View style={s.halfInner}>
                <Text style={s.halfEyebrow}>ROUTE MAP</Text>
                <Text style={s.halfTitle}>{"Pilgrimage\nMap"}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.halfCard, { marginLeft:6 }]}
            activeOpacity={0.88}
            onPress={() => navigation?.navigate?.("Map")}
          >
            <ImageBackground
              source={require("../assets/medina.png")}
              style={{ flex:1 }}
              imageStyle={{ borderRadius:14 }}
              resizeMode="cover"
            >
              <View style={[s.halfScrim, { backgroundColor:"rgba(10,20,30,0.40)" }]} />
              <View style={s.halfInner}>
                <Text style={s.halfEyebrow}>EXPLORE</Text>
                <Text style={s.halfTitle}>{"Sacred\nPlaces"}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </View>

        {/* ── 5. Checklist ── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>My Umrah Checklist</Text>
          <Text style={s.sectionCount}>{completedCount}/{UMRAH_CHECKLIST.length} done</Text>
        </View>
        <View style={s.progWrap}>
          <View style={s.progTrack}>
            <View style={[s.progFill, { width: ((completedCount / UMRAH_CHECKLIST.length) * 100) + "%" }]} />
          </View>
        </View>
        <View style={s.checklist}>
          {UMRAH_CHECKLIST.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={idx < UMRAH_CHECKLIST.length - 1 ? [s.checkRow, s.checkRowBorder] : s.checkRow}
              onPress={() => toggle(item.id)}
              activeOpacity={0.8}
            >
              <View style={done[item.id] ? [s.checkBox, s.checkBoxDone] : s.checkBox}>
                {done[item.id] ? <Text style={s.checkMark}>{"✓"}</Text> : null}
              </View>
              <Text style={done[item.id] ? [s.checkTxt, s.checkTxtDone] : s.checkTxt}>{item.text}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height:spacing(5) }} />
      </ScrollView>

      <GuideCarousel
        visible={showCarousel}
        steps={UMRAH_STEPS}
        title={"My Umrah Guide"}
        onClose={() => setShowCarousel(false)}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex:1, backgroundColor:colors.background },
  scroll: { paddingHorizontal:spacing(2.5), paddingTop:spacing(1.5) },

  header:        { flexDirection:"row", alignItems:"center", paddingHorizontal:spacing(2.5), paddingVertical:spacing(1.75), backgroundColor:colors.background },
  backBtn:       { width:36, height:36, borderRadius:18, backgroundColor:colors.card, borderWidth:1, borderColor:colors.border, alignItems:"center", justifyContent:"center", ...shadows.card },
  backArrow:     { fontSize:22, color:colors.text, lineHeight:26 },
  headerCenter:  { flex:1, alignItems:"center" },
  headerTitle:   { fontFamily:SERIF, fontSize:28, color:colors.text, fontWeight:"400" },
  headerSub:     { fontSize:13, color:colors.subtext, marginTop:2 },

  // Hero — no borderRadius
  heroCard:        { overflow:"hidden", height:220, marginBottom:spacing(2), ...shadows.card },
  heroCardBg:      { flex:1, justifyContent:"space-between" },
  heroCardScrim:   { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(10,8,4,0.46)" },
  heroCardTop:     { flexDirection:"row", justifyContent:"space-between", alignItems:"center", padding:spacing(2) },
  badge:           { backgroundColor:"#fff", borderRadius:radius.pill, paddingHorizontal:spacing(1.75), paddingVertical:spacing(0.75) },
  badgeTxt:        { fontFamily:SERIF, fontSize:13, color:colors.primary, fontWeight:"700" },
  heroArrow:       { fontSize:28, color:"rgba(255,255,255,0.7)" },
  heroCardBottom:  { padding:spacing(2.5), paddingTop:0 },
  heroCardTitle:   { fontFamily:SERIF, fontSize:26, color:"#fff", fontWeight:"400", marginBottom:5 },
  heroCardSub:     { fontSize:14, color:"rgba(255,255,255,0.75)" },

  // Full-width Du'ās card
  fullCard:        { height:130, borderRadius:14, overflow:"hidden", marginBottom:spacing(1.5), ...shadows.card },
  fullCardScrim:   { ...StyleSheet.absoluteFillObject, borderRadius:14 },
  fullCardInner:   { flex:1, justifyContent:"flex-end", padding:16 },
  fullCardEyebrow: { fontSize:9, color:"rgba(255,255,255,0.68)", fontWeight:"700", textTransform:"uppercase", marginBottom:4 },
  fullCardTitle:   { fontFamily:SERIF, fontSize:22, color:"#FFFFFF", fontWeight:"600", marginBottom:3 },
  fullCardSub:     { fontSize:13, color:"rgba(255,255,255,0.75)" },

  // Half-width cards row
  halfRow:    { flexDirection:"row", marginBottom:spacing(2.5) },
  halfCard:   { flex:1, height:130, borderRadius:14, overflow:"hidden", ...shadows.card },
  halfScrim:  { ...StyleSheet.absoluteFillObject, borderRadius:14 },
  halfInner:  { flex:1, justifyContent:"flex-end", padding:14 },
  halfEyebrow:{ fontSize:9, color:"rgba(255,255,255,0.65)", fontWeight:"700", textTransform:"uppercase", marginBottom:4 },
  halfTitle:  { fontFamily:SERIF, fontSize:18, color:"#FFFFFF", fontWeight:"600", lineHeight:23 },

  // Checklist
  sectionHeader: { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:spacing(1) },
  sectionTitle:  { fontFamily:SERIF, fontSize:20, color:colors.text },
  sectionCount:  { fontSize:13, color:colors.subtext },
  progWrap:      { marginBottom:spacing(1.5) },
  progTrack:     { height:4, backgroundColor:colors.border, borderRadius:2, overflow:"hidden" },
  progFill:      { height:"100%", backgroundColor:colors.primary, borderRadius:2 },
  checklist:     { backgroundColor:colors.card, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, overflow:"hidden", ...shadows.card },
  checkRow:      { flexDirection:"row", alignItems:"center", gap:spacing(1.5), padding:spacing(1.75) },
  checkRowBorder:{ borderBottomWidth:1, borderBottomColor:colors.border },
  checkBox:      { width:24, height:24, borderRadius:12, borderWidth:1.5, borderColor:colors.border, alignItems:"center", justifyContent:"center", flexShrink:0 },
  checkBoxDone:  { backgroundColor:colors.primary, borderColor:colors.primary },
  checkMark:     { fontSize:12, color:"#fff", fontWeight:"700" },
  checkTxt:      { flex:1, fontFamily:SERIF, fontSize:15, color:colors.text, lineHeight:21 },
  checkTxtDone:  { color:colors.subtext, textDecorationLine:"line-through" },
});
