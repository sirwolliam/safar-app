/**
 * HajjGuideScreen.jsx — Safar
 * Hub screen for all Hajj content.
 * Links: Step-by-step Guide · Journey Map · Du'ās · Checklist (inline)
 */

import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  ImageBackground, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, spacing, radius, shadows } from "../theme";
import GuideCarousel, { HAJJ_STEPS } from "../components/GuideCarousel";

const SERIF       = "SourceSerif4-Regular";
const STORAGE_KEY = "safar_hajj_checklist_v1";

const HAJJ_CHECKLIST = [
  { id:"hc1",  text:"Obtain Hajj visa and travel documents" },
  { id:"hc2",  text:"Book flights and accommodation in Makkah and Madinah" },
  { id:"hc3",  text:"Register with an authorised Hajj operator" },
  { id:"hc4",  text:"Arrange Udhiya (Qurbani) with a licensed agency" },
  { id:"hc5",  text:"Pack Ihram garments and travel essentials" },
  { id:"hc6",  text:"Learn the steps, du\u02bf\u0101\u02bes and intentions for each rite" },
  { id:"hc7",  text:"Attend a Hajj preparation course or workshop" },
  { id:"hc8",  text:"Get any required vaccinations (meningitis, flu)" },
  { id:"hc9",  text:"Arrange power of attorney and affairs before departure" },
  { id:"hc10", text:"Write down the contact details of your Hajj group leader" },
  { id:"hc11", text:"Memorise key du\u02bf\u0101\u02bes for Tawaf, Sa\u02bfi, and Arafah" },
  { id:"hc12", text:"Pack comfortable walking shoes and unscented toiletries" },
];

export default function HajjGuideScreen({ navigation }) {
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

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.8}>
          <Text style={s.backArrow}>{"‹"}</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>My Hajj</Text>
          <Text style={s.headerSub}>Your complete Hajj companion</Text>
        </View>
        <View style={{ width:36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Hero image ── */}
        <ImageBackground
          source={require("../assets/07_arafah_gradient.jpg")}
          style={s.hero}
          imageStyle={{ borderRadius:16 }}
          resizeMode="cover"
        >
          <View style={s.heroScrim} />
          <View style={s.heroContent}>
            <Text style={s.heroEyebrow}>HAJJ GUIDE</Text>
            <Text style={s.heroTitle}>{"Prepare for your\nHajj journey"}</Text>
            <Text style={s.heroSub}>{"Step-by-step guidance, maps, du\u02bf\u0101\u02bes and checklists \u2014 everything in one place."}</Text>
          </View>
        </ImageBackground>

        {/* ── Hub cards ── */}
        <View style={s.sectionDivider}>
          <View style={s.sectionBar} />
          <Text style={s.sectionLabel}>MY HAJJ TOOLS</Text>
          <View style={s.sectionLine} />
        </View>

        {/* Step-by-step Guide */}
        <TouchableOpacity style={s.hubCard} onPress={() => setShowCarousel(true)} activeOpacity={0.88}>
          <View style={[s.hubIconBox, { backgroundColor:"#1E3D30" }]}>
            <Text style={s.hubIcon}>{"\uD83D\uDCD6"}</Text>
          </View>
          <View style={s.hubText}>
            <Text style={s.hubTitle}>Step-by-Step Guide</Text>
            <Text style={s.hubSub}>Visual walkthrough of every Hajj rite in order</Text>
          </View>
          <Text style={s.hubArrow}>{"›"}</Text>
        </TouchableOpacity>

        {/* Journey Map */}
        <TouchableOpacity style={s.hubCard} onPress={() => navigation?.navigate?.("PilgrimageMap", { mode:"hajj" })} activeOpacity={0.88}>
          <View style={[s.hubIconBox, { backgroundColor:"#2A5242" }]}>
            <Text style={s.hubIcon}>{"\uD83D\uDDFA\uFE0F"}</Text>
          </View>
          <View style={s.hubText}>
            <Text style={s.hubTitle}>Journey Map</Text>
            <Text style={s.hubSub}>Interactive Hajj route map with du\u02bf\u0101\u02bes for every stop</Text>
          </View>
          <Text style={s.hubArrow}>{"›"}</Text>
        </TouchableOpacity>

        {/* Du'ās */}
        <TouchableOpacity style={s.hubCard} onPress={() => navigation?.navigate?.("DuaList", { categoryId: "hajj_umrah", title: "Hajj Du\u02bf\u0101s" })} activeOpacity={0.88}>
          <View style={[s.hubIconBox, { backgroundColor:"#3B6B58" }]}>
            <Text style={s.hubIcon}>{"\uD83E\uDD0D"}</Text>
          </View>
          <View style={s.hubText}>
            <Text style={s.hubTitle}>{"Du\u02bf\u0101\u02bes"}</Text>
            <Text style={s.hubSub}>Authenticated du\u02bf\u0101\u02bes for every moment of Hajj</Text>
          </View>
          <Text style={s.hubArrow}>{"›"}</Text>
        </TouchableOpacity>

        {/* ── Checklist (inline) ── */}
        <View style={s.sectionDivider}>
          <View style={s.sectionBar} />
          <Text style={s.sectionLabel}>MY HAJJ CHECKLIST</Text>
          <View style={s.sectionLine} />
          <Text style={s.sectionCount}>{completedCount}/{HAJJ_CHECKLIST.length}</Text>
        </View>

        <View style={s.progWrap}>
          <View style={s.progTrack}>
            <View style={[s.progFill, { width: `${(completedCount / HAJJ_CHECKLIST.length) * 100}%` }]} />
          </View>
        </View>

        <View style={s.checklist}>
          {HAJJ_CHECKLIST.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={idx < HAJJ_CHECKLIST.length - 1 ? [s.checkRow, s.checkRowBorder] : s.checkRow}
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

        <View style={{ height: spacing(5) }} />
      </ScrollView>

      <GuideCarousel
        visible={showCarousel}
        steps={HAJJ_STEPS}
        title={"My Hajj Guide"}
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
  headerTitle:  { fontFamily:SERIF, fontSize:26, color:colors.text, fontWeight:"400" },
  headerSub:    { fontSize:14, color:colors.subtext, marginTop:2 },

  hero:        { height:220, marginBottom:spacing(2), borderRadius:16, overflow:"hidden", marginHorizontal:-spacing(2.5), ...shadows.card },
  heroScrim:   { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(10,24,16,0.50)", borderRadius:16 },
  heroContent: { flex:1, justifyContent:"flex-end", padding:spacing(2.5) },
  heroEyebrow: { fontSize:9, color:"#C8A96A", fontWeight:"700", textTransform:"uppercase", marginBottom:6 },
  heroTitle:   { fontFamily:SERIF, fontSize:30, color:"#FDFAF4", fontWeight:"400", lineHeight:38, marginBottom:8 },
  heroSub:     { fontSize:15, color:"rgba(253,250,244,0.78)", lineHeight:22 },

  sectionDivider: { flexDirection:"row", alignItems:"center", gap:10, marginBottom:12, marginTop:22 },
  sectionBar:     { width:3, height:16, borderRadius:2, backgroundColor:"#1E3D30" },
  sectionLabel:   { fontFamily:SERIF, fontSize:16, fontWeight:"700", color:"#1E3D30" },
  sectionLine:    { flex:1, height:1, backgroundColor:colors.border },
  sectionCount:   { fontSize:12, color:colors.subtext, fontWeight:"500" },

  hubCard:   { flexDirection:"row", alignItems:"center", backgroundColor:colors.card, borderRadius:radius.lg, padding:spacing(1.75), marginBottom:spacing(1.25), borderWidth:1, borderColor:colors.border, ...shadows.card },
  hubIconBox:{ width:44, height:44, borderRadius:12, alignItems:"center", justifyContent:"center", marginRight:spacing(1.5) },
  hubIcon:   { fontSize:20 },
  hubText:   { flex:1 },
  hubTitle:  { fontFamily:SERIF, fontSize:18, color:colors.text, fontWeight:"600", marginBottom:4 },
  hubSub:    { fontSize:14, color:colors.subtext, lineHeight:20 },
  hubArrow:  { fontSize:24, color:colors.subtext, paddingLeft:8 },

  progWrap:  { marginBottom:spacing(1.5) },
  progTrack: { height:3, backgroundColor:colors.border, borderRadius:2, overflow:"hidden" },
  progFill:  { height:"100%", backgroundColor:"#1E3D30", borderRadius:2 },

  checklist:     { backgroundColor:colors.card, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, overflow:"hidden", ...shadows.card },
  checkRow:      { flexDirection:"row", alignItems:"center", gap:spacing(1.5), padding:spacing(1.75) },
  checkRowBorder:{ borderBottomWidth:1, borderBottomColor:colors.border },
  checkBox:      { width:24, height:24, borderRadius:12, borderWidth:1.5, borderColor:colors.border, alignItems:"center", justifyContent:"center", flexShrink:0 },
  checkBoxDone:  { backgroundColor:"#1E3D30", borderColor:"#1E3D30" },
  checkMark:     { fontSize:12, color:"#fff", fontWeight:"700" },
  checkTxt:      { flex:1, fontFamily:SERIF, fontSize:15, color:colors.text, lineHeight:21 },
  checkTxtDone:  { color:colors.subtext, textDecorationLine:"line-through" },
});
