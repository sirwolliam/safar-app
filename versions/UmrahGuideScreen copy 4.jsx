/**
 * UmrahGuideScreen.jsx — Safar
 * Step-by-step Umrah guide with checklist and visual carousel.
 */
import React, { useState, useEffect } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  ImageBackground, StyleSheet, Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, spacing, radius, shadows } from "../theme";
import { UMRAH_STEPS } from "../guideContent";
import GuideCarousel from "../components/GuideCarousel";

const SERIF   = "SourceSerif4-Regular";
const { width: SW } = Dimensions.get("window");
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

      {/* Sticky header */}
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

        {/* ── Umrah 101 Card — opens carousel ── */}
        <TouchableOpacity style={s.guideCard} onPress={() => setShowCarousel(true)} activeOpacity={0.9}>
          <ImageBackground
            source={require("../assets/guide/umrah_03_tawaf.jpg")}
            style={s.guideCardBg}
            resizeMode="cover">
            <View style={s.guideCardScrim} />
            <View style={s.guideCardTop}>
              <View style={s.guideCardBadge}>
                <Text style={s.guideCardBadgeTxt}>UMRAH 101</Text>
              </View>
              <Text style={s.guideCardArrow}>{"›"}</Text>
            </View>
            <View style={s.guideCardBottom}>
              <Text style={s.guideCardTitle}>Visual Step-by-Step Guide</Text>
              <Text style={s.guideCardSub}>{"7 steps with images, descriptions and tips"}</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* ── Checklist section ── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>My Umrah Checklist</Text>
          <Text style={s.sectionCount}>{completedCount}/{UMRAH_CHECKLIST.length} done</Text>
        </View>

        {/* Progress bar */}
        <View style={s.progWrap}>
          <View style={s.progTrack}>
            <View style={[s.progFill, { width: ((completedCount / UMRAH_CHECKLIST.length) * 100) + "%" }]} />
          </View>
        </View>

        <View style={s.checklist}>
          {UMRAH_CHECKLIST.map((item, idx) => (
            <TouchableOpacity key={item.id} style={idx < UMRAH_CHECKLIST.length - 1 ? [s.checkRow, s.checkRowBorder] : s.checkRow}
              onPress={() => toggle(item.id)} activeOpacity={0.8}>
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

  header:       { flexDirection:"row", alignItems:"center", paddingHorizontal:spacing(2.5), paddingVertical:spacing(1.75), backgroundColor:colors.background },
  backBtn:      { width:36, height:36, borderRadius:18, backgroundColor:colors.card, borderWidth:1, borderColor:colors.border, alignItems:"center", justifyContent:"center", ...shadows.card },
  backArrow:    { fontSize:22, color:colors.text, lineHeight:26 },
  headerCenter: { flex:1, alignItems:"center" },
  headerTitle:  { fontFamily:SERIF, fontSize:28, color:colors.text, fontWeight:"400" },
  headerSub:    { fontSize:13, color:colors.subtext, marginTop:2 },

  guideCard:        { overflow:"hidden", height:220, marginBottom:spacing(2.5), ...shadows.card },
  guideCardBg:      { flex:1, justifyContent:"space-between" },
  guideCardScrim:   { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(10,8,4,0.52)" },
  guideCardTop:     { flexDirection:"row", justifyContent:"space-between", alignItems:"center", padding:spacing(2) },
  guideCardBadge:   { backgroundColor:"#fff", borderRadius:radius.pill, paddingHorizontal:spacing(1.75), paddingVertical:spacing(0.75) },
  guideCardBadgeTxt:{ fontFamily:SERIF, fontSize:13, color:colors.primary, fontWeight:"700", letterSpacing:1 },
  guideCardArrow:   { fontSize:28, color:"rgba(255,255,255,0.7)" },
  guideCardBottom:  { padding:spacing(2.5), paddingTop:0 },
  guideCardTitle:   { fontFamily:SERIF, fontSize:26, color:"#fff", fontWeight:"400", marginBottom:5 },
  guideCardSub:     { fontSize:14, color:"rgba(255,255,255,0.75)" },

  sectionHeader: { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:spacing(1) },
  sectionTitle:  { fontFamily:SERIF, fontSize:20, color:colors.text },
  sectionCount:  { fontSize:13, color:colors.subtext },

  progWrap:  { marginBottom:spacing(1.5) },
  progTrack: { height:4, backgroundColor:colors.border, borderRadius:2, overflow:"hidden" },
  progFill:  { height:"100%", backgroundColor:colors.primary, borderRadius:2 },

  checklist:     { backgroundColor:colors.card, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, overflow:"hidden", ...shadows.card },
  checkRow:      { flexDirection:"row", alignItems:"center", gap:spacing(1.5), padding:spacing(1.75) },
  checkRowBorder:{ borderBottomWidth:1, borderBottomColor:colors.border },
  checkBox:      { width:24, height:24, borderRadius:12, borderWidth:1.5, borderColor:colors.border, alignItems:"center", justifyContent:"center", flexShrink:0 },
  checkBoxDone:  { backgroundColor:colors.primary, borderColor:colors.primary },
  checkMark:     { fontSize:12, color:"#fff", fontWeight:"700" },
  checkTxt:      { flex:1, fontFamily:SERIF, fontSize:15, color:colors.text, lineHeight:21 },
  checkTxtDone:  { color:colors.subtext, textDecorationLine:"line-through" },
});
