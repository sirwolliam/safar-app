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
import GuideCarousel, { UMRAH_STEPS } from "../components/GuideCarousel";

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
  safe:   { flex:1, backgroundColor:"#EDE6D8" },
  scroll: { paddingHorizontal:20, paddingTop:12 },

  header:       { flexDirection:"row", alignItems:"center", paddingHorizontal:20, paddingVertical:14, backgroundColor:"#EDE6D8" },
  backBtn:      { width:36, height:36, borderRadius:18, backgroundColor:"#FDFAF4", borderWidth:1, borderColor:"#D4D0CA", alignItems:"center", justifyContent:"center", shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4 },
  backArrow:    { fontSize:22, color:"#1A1712", lineHeight:26 },
  headerCenter: { flex:1, alignItems:"center" },
  headerTitle:  { fontFamily:SERIF, fontSize:26, color:"#1A1712", fontWeight:"400" },
  headerSub:    { fontSize:13, color:"#5A5650", marginTop:2 },

  guideCard:        { borderRadius:24, overflow:"hidden", height:220, marginBottom:20, shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4 },
  guideCardBg:      { flex:1, justifyContent:"space-between" },
  guideCardScrim:   { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(10,8,4,0.52)" },
  guideCardTop:     { flexDirection:"row", justifyContent:"space-between", alignItems:"center", padding:16 },
  guideCardBadge:   { backgroundColor:"#fff", borderRadius:20, paddingHorizontal:14, paddingVertical:6 },
  guideCardBadgeTxt:{ fontFamily:SERIF, fontSize:13, color:"#2F5D50", fontWeight:"700", letterSpacing:1 },
  guideCardArrow:   { fontSize:28, color:"rgba(255,255,255,0.7)" },
  guideCardBottom:  { padding:20, paddingTop:0 },
  guideCardTitle:   { fontFamily:SERIF, fontSize:26, color:"#fff", fontWeight:"400", marginBottom:5 },
  guideCardSub:     { fontSize:14, color:"rgba(255,255,255,0.75)" },

  sectionHeader: { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:8 },
  sectionTitle:  { fontFamily:SERIF, fontSize:20, color:"#1A1712" },
  sectionCount:  { fontSize:13, color:"#5A5650" },

  progWrap:  { marginBottom:12 },
  progTrack: { height:4, backgroundColor:"#D4D0CA", borderRadius:2, overflow:"hidden" },
  progFill:  { height:"100%", backgroundColor:"#2F5D50", borderRadius:2 },

  checklist:     { backgroundColor:"#FDFAF4", borderRadius:16, borderWidth:1, borderColor:"#D4D0CA", overflow:"hidden", shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4 },
  checkRow:      { flexDirection:"row", alignItems:"center", gap:12, padding:14 },
  checkRowBorder:{ borderBottomWidth:1, borderBottomColor:"#D4D0CA" },
  checkBox:      { width:24, height:24, borderRadius:12, borderWidth:1.5, borderColor:"#D4D0CA", alignItems:"center", justifyContent:"center", flexShrink:0 },
  checkBoxDone:  { backgroundColor:"#2F5D50", borderColor:"#2F5D50" },
  checkMark:     { fontSize:12, color:"#fff", fontWeight:"700" },
  checkTxt:      { flex:1, fontFamily:SERIF, fontSize:15, color:"#1A1712", lineHeight:21 },
  checkTxtDone:  { color:"#5A5650", textDecorationLine:"line-through" },
});
