/**
 * HajjGuideScreen.jsx — Safar
 * Step-by-step Hajj guide with carousel, collapsible checklist,
 * duas card, and sacred places card.
 */
import React, { useState, useEffect } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  ImageBackground, StyleSheet, Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GuideCarousel, { HAJJ_STEPS } from "../components/GuideCarousel";

const SERIF = "SourceSerif4-Regular";
const { width: SW } = Dimensions.get("window");
const STORAGE_KEY = "safar_hajj_checklist_v1";

const HAJJ_CHECKLIST = [
  { id:"hc1",  text:"Obtain Hajj visa and travel documents" },
  { id:"hc2",  text:"Book flights and accommodation in Makkah and Madinah" },
  { id:"hc3",  text:"Register with an authorised Hajj operator" },
  { id:"hc4",  text:"Arrange Udhiya (Qurbani) with a licensed agency" },
  { id:"hc5",  text:"Pack Ihram garments and travel essentials" },
  { id:"hc6",  text:"Learn the steps and intentions for each rite" },
  { id:"hc7",  text:"Attend a Hajj preparation course or workshop" },
  { id:"hc8",  text:"Get any required vaccinations (meningitis, flu)" },
  { id:"hc9",  text:"Arrange power of attorney and affairs before departure" },
  { id:"hc10", text:"Write down the contact details of your Hajj group leader" },
  { id:"hc11", text:"Memorise key du\u02bf\u0101\u02bes for Tawaf, Sa\u02bfi, and Arafah" },
  { id:"hc12", text:"Pack comfortable walking shoes and unscented toiletries" },
];

const HAJJ_DUAS = [
  { title:"Upon Entering Ihram",          stage:"Ihram" },
  { title:"The Talbiyah",                 stage:"Ihram" },
  { title:"Upon Seeing the Ka\u02bfbah",  stage:"Tawaf" },
  { title:"Beginning Tawaf",              stage:"Tawaf" },
  { title:"Between Yemeni Corner & Black Stone", stage:"Tawaf" },
  { title:"Upon Ascending \u1e62af\u0101", stage:"Sa\u02bfy" },
  { title:"At Marwah",                    stage:"Sa\u02bfy" },
  { title:"Standing at Arafah",           stage:"Arafah" },
  { title:"At Muzdalifah",                stage:"Muzdalifah" },
  { title:"Ramy Al-Jamarat",              stage:"Jamarat" },
  { title:"Tawaf Al-Wada\u02bf",          stage:"Farewell" },
];


// ── Scholarly footnote ────────────────────────────────────────────────────────
function ScholarlyFootnote({ style }) {
  return (
    <View style={[fn.wrap, style]}>
      <Text style={fn.text}>
        <Text style={fn.bold}>Sources</Text>{" — "}
        {"Duʿāʾs are drawn from Ṣaḥīḥ al-Bukhārī, Ṣaḥīḥ Muslim, Sunan Abī Dāwūd, Sunan al-Tirmidhī, and established scholarly works. Each duʿāʾ is attributed to its primary source. Practice and wording may differ across the four madhabs (Ḥanafī, Mālikī, Shāfiʿī, Ḥanbalī). Consult a qualified scholar for rulings specific to your school of thought."}
      </Text>
    </View>
  );
}

const fn = StyleSheet.create({
  wrap: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: "#EEE4CB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDD0A8",
    padding: 16,
  },
  text: { fontSize: 12, color: "#6B5020", lineHeight: 17 },
  bold: { fontWeight: "600" },
});

export default function HajjGuideScreen({ navigation }) {
  const [done,          setDone]          = useState({});
  const [showCarousel,  setShowCarousel]  = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [duasOpen,      setDuasOpen]      = useState(false);

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
          <Text style={s.headerTitle}>My Hajj Guide</Text>
          <Text style={s.headerSub}>Step-by-step pilgrimage guide</Text>
        </View>
        <View style={{ width:36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Hajj 101 hero card ── */}
        <TouchableOpacity style={s.guideCard} onPress={() => setShowCarousel(true)} activeOpacity={0.9}>
          <ImageBackground
            source={require("../assets/04_tawaf_gradient.jpg")}
            style={s.guideCardBg}
            resizeMode="cover">
            <View style={s.guideCardScrim} />
            <View style={s.guideCardTop}>
              <View style={s.guideCardBadge}>
                <Text style={s.guideCardBadgeTxt}>HAJJ 101</Text>
              </View>
              <Text style={s.guideCardArrow}>{"›"}</Text>
            </View>
            <View style={s.guideCardBottom}>
              <Text style={s.guideCardTitle}>Visual Step-by-Step Guide</Text>
              <Text style={s.guideCardSub}>{"12 steps with images and descriptions"}</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* ── Collapsible Checklist ── */}
        <TouchableOpacity style={s.accordionHeader} onPress={() => setChecklistOpen(v => !v)} activeOpacity={0.85}>
          <View style={s.accordionLeft}>
            <Text style={s.accordionIcon}>{"✓"}</Text>
            <View>
              <Text style={s.accordionTitle}>My Hajj Checklist</Text>
              <Text style={s.accordionSub}>{completedCount}/{HAJJ_CHECKLIST.length} completed</Text>
            </View>
          </View>
          <View style={s.accordionRight}>
            {/* Mini progress bar */}
            <View style={s.miniProgTrack}>
              <View style={[s.miniProgFill, { width: ((completedCount / HAJJ_CHECKLIST.length) * 100) + "%" }]} />
            </View>
            <Text style={s.accordionChev}>{checklistOpen ? "▲" : "▼"}</Text>
          </View>
        </TouchableOpacity>

        {checklistOpen && (
          <View style={s.accordionBody}>
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
        )}

        {/* ── Duas card ── */}
        <TouchableOpacity style={s.accordionHeader} onPress={() => setDuasOpen(v => !v)} activeOpacity={0.85}>
          <View style={s.accordionLeft}>
            <Text style={s.accordionIcon}>{"🤲"}</Text>
            <View>
              <Text style={s.accordionTitle}>Hajj Du'as</Text>
              <Text style={s.accordionSub}>{HAJJ_DUAS.length} du'as across all stages</Text>
            </View>
          </View>
          <Text style={s.accordionChev}>{duasOpen ? "▲" : "▼"}</Text>
        </TouchableOpacity>

        {duasOpen && (
          <View style={s.accordionBody}>
            {HAJJ_DUAS.map((dua, idx) => (
              <TouchableOpacity
                key={idx}
                style={idx < HAJJ_DUAS.length - 1 ? [s.duaRow, s.duaRowBorder] : s.duaRow}
                activeOpacity={0.8}
                onPress={() => navigation?.navigate?.("DuaList", { filter: dua.stage })}
              >
                <View style={s.duaStagePill}>
                  <Text style={s.duaStageText}>{dua.stage}</Text>
                </View>
                <Text style={s.duaTitle}>{dua.title}</Text>
                <Text style={s.duaArrow}>{"›"}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Sacred Places card ── */}
        <TouchableOpacity
          style={s.sacredCard}
          onPress={() => navigation?.navigate?.("Map")}
          activeOpacity={0.88}
        >
          <ImageBackground
            source={require("../assets/kaaba_map.png")}
            style={s.sacredCardBg}
            resizeMode="cover"
          >
            <View style={s.sacredCardScrim} />
            <View style={s.sacredCardContent}>
              <View>
                <Text style={s.sacredCardEyebrow}>{"EXPLORE"}</Text>
                <Text style={s.sacredCardTitle}>Sacred Places Map</Text>
                <Text style={s.sacredCardSub}>{"Makkah & Madinah sites with du'as"}</Text>
              </View>
              <View style={s.sacredCardArrowWrap}>
                <Text style={s.sacredCardArrow}>{"›"}</Text>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        <ScholarlyFootnote />
        <View style={{ height:40 }} />
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
  safe:   { flex:1, backgroundColor:"#E8DDD0" },
  scroll: { paddingHorizontal:20, paddingTop:12 },

  // Header
  header:       { flexDirection:"row", alignItems:"center", paddingHorizontal:20, paddingVertical:14, backgroundColor:"#E8DDD0" },
  backBtn:      { width:36, height:36, borderRadius:18, backgroundColor:"#F5EDE0", borderWidth:1, borderColor:"#C8BFB2", alignItems:"center", justifyContent:"center", shadowColor:"#4A2E10", shadowOffset:{width:0,height:3}, shadowOpacity:0.20, shadowRadius:10, elevation:5 },
  backArrow:    { fontSize:22, color:"#100E0A", lineHeight:26 },
  headerCenter: { flex:1, alignItems:"center" },
  headerTitle:  { fontFamily:SERIF, fontSize:26, color:"#100E0A", fontWeight:"400" },
  headerSub:    { fontSize:13, color:"#3A3530", marginTop:2 },

  // Guide hero card
  guideCard:        { borderRadius:20, overflow:"hidden", height:200, marginBottom:16, shadowColor:"#4A2E10", shadowOffset:{width:0,height:3}, shadowOpacity:0.20, shadowRadius:10, elevation:5 },
  guideCardBg:      { flex:1, justifyContent:"space-between" },
  guideCardScrim:   { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(10,8,4,0.38)" },
  guideCardTop:     { flexDirection:"row", justifyContent:"space-between", alignItems:"center", padding:16 },
  guideCardBadge:   { backgroundColor:"#fff", borderRadius:20, paddingHorizontal:14, paddingVertical:6 },
  guideCardBadgeTxt:{ fontFamily:SERIF, fontSize:12, color:"#1E3D30", fontWeight:"700", letterSpacing:1 },
  guideCardArrow:   { fontSize:26, color:"rgba(255,255,255,0.7)" },
  guideCardBottom:  { padding:18, paddingTop:0 },
  guideCardTitle:   { fontFamily:SERIF, fontSize:24, color:"#fff", fontWeight:"400", marginBottom:4 },
  guideCardSub:     { fontSize:13, color:"rgba(255,255,255,0.75)" },

  // Accordion header (shared by checklist + duas)
  accordionHeader: {
    flexDirection:"row", alignItems:"center", justifyContent:"space-between",
    backgroundColor:"#F5EDE0", borderRadius:14, borderWidth:1, borderColor:"#C8BFB2",
    paddingHorizontal:16, paddingVertical:14, marginBottom:4,
    shadowColor:"#4A2E10", shadowOffset:{width:0,height:2}, shadowOpacity:0.10, shadowRadius:6, elevation:3,
  },
  accordionLeft:  { flexDirection:"row", alignItems:"center", gap:12, flex:1 },
  accordionIcon:  { fontSize:18, color:"#1E3D30" },
  accordionTitle: { fontFamily:SERIF, fontSize:16, color:"#100E0A" },
  accordionSub:   { fontSize:12, color:"#3A3530", marginTop:1 },
  accordionRight: { flexDirection:"row", alignItems:"center", gap:10 },
  accordionChev:  { fontSize:11, color:"#3A3530" },

  // Mini progress bar inside checklist header
  miniProgTrack: { width:50, height:3, backgroundColor:"#C8BFB2", borderRadius:2, overflow:"hidden" },
  miniProgFill:  { height:"100%", backgroundColor:"#1E3D30", borderRadius:2 },

  // Accordion body (checklist rows)
  accordionBody: {
    backgroundColor:"#F5EDE0", borderRadius:14, borderWidth:1, borderColor:"#C8BFB2",
    overflow:"hidden", marginBottom:12,
    shadowColor:"#4A2E10", shadowOffset:{width:0,height:2}, shadowOpacity:0.14, shadowRadius:8, elevation:4,
  },
  checkRow:      { flexDirection:"row", alignItems:"center", gap:12, padding:14 },
  checkRowBorder:{ borderBottomWidth:1, borderBottomColor:"#C8BFB2" },
  checkBox:      { width:22, height:22, borderRadius:11, borderWidth:1.5, borderColor:"#C8BFB2", alignItems:"center", justifyContent:"center", flexShrink:0 },
  checkBoxDone:  { backgroundColor:"#1E3D30", borderColor:"#1E3D30" },
  checkMark:     { fontSize:11, color:"#fff", fontWeight:"700" },
  checkTxt:      { flex:1, fontFamily:SERIF, fontSize:14, color:"#100E0A", lineHeight:20 },
  checkTxtDone:  { color:"#3A3530", textDecorationLine:"line-through" },

  // Dua rows inside accordion
  duaRow:        { flexDirection:"row", alignItems:"center", gap:10, padding:14 },
  duaRowBorder:  { borderBottomWidth:1, borderBottomColor:"#C8BFB2" },
  duaStagePill:  { backgroundColor:"#E2EDE6", borderRadius:6, paddingHorizontal:8, paddingVertical:3, flexShrink:0 },
  duaStageText:  { fontSize:10, color:"#1E3D30", fontWeight:"600" },
  duaTitle:      { flex:1, fontFamily:SERIF, fontSize:14, color:"#100E0A" },
  duaArrow:      { fontSize:18, color:"#C8BFB2" },

  // Sacred Places card
  sacredCard:        { borderRadius:16, overflow:"hidden", height:120, marginBottom:16, shadowColor:"#4A2E10", shadowOffset:{width:0,height:3}, shadowOpacity:0.20, shadowRadius:10, elevation:5 },
  sacredCardBg:      { flex:1 },
  sacredCardScrim:   { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(10,8,4,0.42)" },
  sacredCardContent: { flex:1, flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:20, paddingVertical:16 },
  sacredCardEyebrow: { fontSize:9, fontWeight:"700", letterSpacing:2, color:"rgba(255,255,255,0.65)", marginBottom:4 },
  sacredCardTitle:   { fontFamily:SERIF, fontSize:20, color:"#fff", marginBottom:3 },
  sacredCardSub:     { fontSize:12, color:"rgba(255,255,255,0.72)" },
  sacredCardArrowWrap:{ width:36, height:36, borderRadius:18, backgroundColor:"rgba(255,255,255,0.15)", alignItems:"center", justifyContent:"center" },
  sacredCardArrow:   { fontSize:22, color:"#fff" },
});
