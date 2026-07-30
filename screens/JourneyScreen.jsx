import React, { useState, useEffect } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  ImageBackground, StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, spacing, radius, shadows } from "../theme";
import { CalendarBlank, UsersThree, AddressBook } from "phosphor-react-native";
import SafarAssistCard from "../SafarAssistCard";

const SERIF = "SourceSerif4-Regular";
const BOARD_KEY = "safar_journey_board_v1";

// ── Steps data ────────────────────────────────────────────────────────────────
const UMRAH_STEPS = [
  { id:"ihram", number:1, name:"Entering Ihṛām", sub:"Intention & Talbīyah", done:true, duas:[{
    id:"ihram-1", title:"Talbiyah", stage:"Ihṛām",
    arabic:"لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ",
    transliteration:"Labbayk Allāhumma labbayk",
    translation:"Here I am O Allah, here I am.",
    source:"Ṣaḥīḥ al-Bukhārī · 1549", isFeatured:true }]},
  { id:"tawaf", number:2, name:"Ṣawāf", sub:"7 circuits of the Kaʿbah", active:true, duas:[
    { id:"tawaf-1", title:"Upon Beginning", stage:"Tawāf",
      arabic:"بِسْمِ اللهِ وَاللهُ أَكْبَرُ",
      transliteration:"Bismi-llāhi wa-llāhu akbar",
      translation:"In the name of Allah, and Allah is the Greatest.",
      source:"Ṣaḥīḥ al-Bukhārī · 1613", isFeatured:true },
    { id:"tawaf-2", title:"Between Yemeni Corner & Black Stone", stage:"Tawāf",
      arabic:"رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً",
      transliteration:"Rabbanā ātinā fiʿd-dunyā ḥasanatan",
      translation:"Our Lord, give us good in this world and the Hereafter.",
      source:"Al-Baqarah 2:201" }]},
  { id:"maqam",  number:3, name:"Pray at Maqām Ibrāhīm", sub:"2 rakʿahs after Ṣawāf", duas:[] },
  { id:"zamzam", number:4, name:"Drink Zamzam", sub:"At the Zamzam well", duas:[] },
  { id:"saee",   number:5, name:"Saʿy", sub:"7 trips between Ṣafā & Marwah", duas:[{
    id:"safa-1", title:"Upon Ascending Ṣafā", stage:"Saʿy",
    arabic:"إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ",
    transliteration:"Innaṣ-ṣafā wal-marwata min shaʿāʿiri-llāh",
    translation:"Indeed Ṣafā and Marwah are among the signs of Allah.",
    source:"Ṣaḥīḥ Muslim · 1218", isFeatured:true }]},
  { id:"halq",     number:6, name:"Halq / Taqsir",  sub:"Shave or trim hair",   duas:[] },
  { id:"complete", number:7, name:"Umrah Complete", sub:"Exit Ihṛām", duas:[] },
];

const HAJJ_STEPS = [
  { id:"ihram_h", number:1,  name:"Ihṛām for Hajj",       sub:"8th Dhul Hijjah",              duas:[] },
  { id:"mina",    number:2,  name:"Day in Minā",               sub:"Prayer & preparation",          duas:[] },
  { id:"arafah",  number:3,  name:"Wuqūf at ʿarafah",     sub:"9th Dhul Hijjah — pillar", active:true, duas:[{
    id:"arafah-1", title:"Duʿā at ʿarafah", stage:"ʿarafah",
    arabic:"لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    transliteration:"Lā ilāha illa-llāhu waḥdahu lā sharīka lah",
    translation:"There is no god but Allah alone, with no partner.",
    source:"Sunan al-Tirmidhī · 3585", isFeatured:true }]},
  { id:"muzdal",  number:4,  name:"Muzdalifah",                    sub:"Night under the stars",         duas:[] },
  { id:"jamarat", number:5,  name:"Jamarat",                       sub:"Stoning of the pillars",        duas:[] },
  { id:"nahr",    number:6,  name:"Sacrifice",                     sub:"10th Dhul Hijjah",              duas:[] },
  { id:"tawaf_i", number:7,  name:"Tawāf al-Ifāḍah", sub:"Pillar of Hajj",               duas:[] },
  { id:"saee_h",  number:8,  name:"Saʿy",                     sub:"Ṣafā & Marwah",        duas:[] },
  { id:"mina_d",  number:9,  name:"Days in Minā",             sub:"11-13th Dhul Hijjah",           duas:[] },
  { id:"wadaa",   number:10, name:"Tawāf al-Wadāʿ", sub:"Farewell tawaf",                duas:[] },
];

// ── Main screen ───────────────────────────────────────────────────────────────
export default function JourneyScreen({ navigation }) {
  const [mode,       setMode]       = useState("umrah");
  const [boardCards, setBoardCards] = useState([]);
  const departureDate = new Date("2025-11-15"); // placeholder — user sets this

  const steps = mode === "umrah" ? UMRAH_STEPS : HAJJ_STEPS;
  const daysUntil = Math.max(0, Math.ceil((departureDate - new Date()) / (1000 * 60 * 60 * 24)));

  useEffect(() => {
    AsyncStorage.getItem(BOARD_KEY).then(v => { if (v) setBoardCards(JSON.parse(v)); }).catch(() => {});
  }, []);

  const completedCount = steps.filter(s => s.done).length;
  const boardDone      = boardCards.filter(c => c.type==="checklist" ? c.done : null).length;
  const boardChecklist = boardCards.filter(c => c.type==="checklist").length;

  return (
    <SafeAreaView style={jn.safe}>

      {/* No hero image — the step-by-step card carries that visual weight */}

      {/* Sticky header */}
      <View style={jn.header}>
        <View style={jn.headerLeft}>
          <Text style={jn.headerTitle}>My Journey</Text>
          <Text style={jn.headerSub}>Your step-by-step pilgrimage guide</Text>
        </View>
        <View style={jn.departureBadge}>
          <Text style={jn.departureDays}>{daysUntil}</Text>
          <Text style={jn.departureLbl}>{"days\nto go"}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex:1 }} contentContainerStyle={jn.scroll}>

        {/* ── 1. Mode toggle — compact single bar ── */}
        <View style={jn.modeWrap}>
          <View style={jn.modeToggle}>
            {[
              { key:"umrah", name:"UMRAH", sub:"Any time of year" },
              { key:"hajj",  name:"HAJJ",  sub:"Dhul Hijjah" },
            ].map(m => (
              <TouchableOpacity key={m.key}
                style={mode === m.key ? [jn.modeOpt, jn.modeOptActive] : jn.modeOpt}
                onPress={() => setMode(m.key)} activeOpacity={0.8}>
                <Text style={mode === m.key ? [jn.modeName, jn.modeNameActive] : jn.modeName}>{m.name}</Text>
                <Text style={mode === m.key ? [jn.modeSub, jn.modeSubActive] : jn.modeSub}>{m.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── 2. HERO CARD: Step-by-step Guide ── */}
        <TouchableOpacity style={jn.heroCard}
          onPress={() => navigation?.navigate?.(mode === "umrah" ? "UmrahGuide" : "HajjGuide")}
          activeOpacity={0.92}>
          <ImageBackground
            source={require("../assets/kaaba_mixed.png")}
            style={jn.heroCardBg}
            imageStyle={{ resizeMode:"cover" }}>
            <View style={jn.heroCardScrim} />
            <View style={jn.heroCardContent}>
              {/* Top row: badge left, arrow right */}
              <View style={jn.heroCardTopRow}>
                <View style={jn.heroCardBadge}>
                  <Text style={jn.heroCardBadgeTxt}>{mode === "umrah" ? "UMRAH" : "HAJJ"}</Text>
                </View>
                <Text style={jn.heroCardArrowRight}>{"›"}</Text>
              </View>
              {/* Bottom: title, sub, progress */}
              <View style={jn.heroCardBottom}>
                <Text style={jn.heroCardTitle}>{mode === "umrah" ? "My Umrah Guide" : "My Hajj Guide"}</Text>
                <Text style={jn.heroCardSub}>{"Complete step-by-step " + (mode === "umrah" ? "Umrah" : "Hajj") + " walkthrough"}</Text>
                {/* Progress with colour bar background */}
                <View style={jn.heroProgWrap}>
                  <View style={jn.heroProgRow}>
                    <View style={jn.heroProgTrack}>
                      {Array.from({ length:steps.length }, (_, i) => (
                        <View key={i} style={i < completedCount ? [jn.heroProgSeg, jn.heroProgSegFill] : jn.heroProgSeg} />
                      ))}
                    </View>
                    <Text style={jn.heroProgLabel}>{completedCount} of {steps.length}</Text>
                  </View>
                </View>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* ── 3. My Journey Board ── */}
        <TouchableOpacity style={jn.boardCard}
          onPress={() => navigation?.navigate?.("MyBoard")}
          activeOpacity={0.88}>
          <ImageBackground
            source={require("../assets/myboard.jpg")}
            style={jn.boardCardBg}
            imageStyle={{ resizeMode:"cover" }}>
            <View style={jn.boardScrim} />
            <View style={jn.boardContent}>
              <Text style={jn.boardEyebrow}>YOUR BOARD</Text>
              <Text style={jn.boardTitle}>My Journey Board</Text>
              <Text style={jn.boardSub}>Notes, duas, links & reminders</Text>
              {boardCards.length > 0 ? (
                <View style={jn.boardStats}>
                  <View style={jn.boardStat}>
                    <Text style={jn.boardStatNum}>{boardCards.length}</Text>
                    <Text style={jn.boardStatLbl}>cards</Text>
                  </View>
                  <View style={jn.boardStatDivider} />
                  {boardChecklist > 0 ? (
                    <View style={jn.boardStat}>
                      <Text style={jn.boardStatNum}>{boardDone}/{boardChecklist}</Text>
                      <Text style={jn.boardStatLbl}>tasks</Text>
                    </View>
                  ) : null}
                </View>
              ) : (
                <Text style={jn.boardEmpty}>Tap to start {"›"}</Text>
              )}
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* ── 4. Du'ā Card — changes with mode toggle ── */}
        <TouchableOpacity
          style={jn.duaCard}
          onPress={() => navigation?.navigate?.("PilgrimageDuas", { mode })}
          activeOpacity={0.88}
        >
          <ImageBackground
            source={mode === "umrah"
              ? require("../assets/tawaf.jpg")
              : require("../assets/arafah.jpg")}
            style={jn.duaCardBg}
            imageStyle={{ borderRadius:16, resizeMode:"cover" }}
          >
            <View style={jn.duaCardScrim} />
            <View style={jn.duaCardContent}>
              <Text style={jn.duaCardEyebrow}>{mode === "umrah" ? "UMRAH" : "HAJJ"}</Text>
              <Text style={jn.duaCardTitle}>
                {mode === "umrah" ? "Umrah Duʿās" : "Hajj Duʿās"}
              </Text>
              <Text style={jn.duaCardSub}>
                {mode === "umrah" ? "Every duʿā for every stage" : "From Ihrām to Farewell"}
              </Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* ── 5. Safar Assist — AI import card ── */}
        <SafarAssistCard
          title="Safar Assist"
          subtitle="Add flights, hotels, contacts & group details in seconds"
          tagline="Speak it, scan it, or upload it."
          onPress={() => navigation?.navigate?.("SafarAssist")}
        />

        {/* ── 4. Sacred Places + What to Expect — real images ── */}
        <View style={jn.halfRow}>

          <TouchableOpacity style={jn.halfCard}
            onPress={() => navigation?.navigate?.("Map")}
            activeOpacity={0.88}>
            <ImageBackground
              source={require("../assets/kaaba_map.png")}
              style={jn.halfCardImg}
              imageStyle={{ resizeMode:"cover" }}>
              <View style={jn.halfCardScrimDark} />
              <View style={jn.halfCardOverlayWrap}>
                {/* Count + label — top right */}
                <View style={jn.halfCardCountWrap}>
                  <Text style={jn.halfCardCount}>14</Text>
                  <Text style={jn.halfCardCategory}>sites</Text>
                </View>
                {/* Title + sub — bottom left */}
                <View style={jn.halfCardOverlay}>
                  <Text style={jn.halfCardCategory}>LOCATIONS</Text>
                  <Text style={jn.halfCardTitleWhite}>Sacred Places</Text>
                  <Text style={jn.halfCardSubWhite}>Duas for each location</Text>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>

          <TouchableOpacity style={jn.halfCard}
            onPress={() => navigation?.navigate?.("WhatToExpect")}
            activeOpacity={0.88}>
            <ImageBackground
              source={require("../assets/what_to_expect.jpg")}
              style={jn.halfCardImg}
              imageStyle={{ resizeMode:"cover" }}>
              <View style={jn.halfCardScrim} />
              <View style={jn.halfCardOverlayWrap}>
                {/* Count + label — top right */}
                <View style={jn.halfCardCountWrap}>
                  <Text style={jn.halfCardCount}>8</Text>
                  <Text style={jn.halfCardCategory}>topics</Text>
                </View>
                {/* Title + sub — bottom left */}
                <View style={jn.halfCardOverlay}>
                  <Text style={jn.halfCardCategory}>LOGISTICS</Text>
                  <Text style={jn.halfCardTitleWhite}>What to Expect</Text>
                  <Text style={jn.halfCardSubWhite}>Plan & prepare</Text>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>

        </View>

        {/* ── 5. Groups + Contacts — compact utility row ── */}
        <View style={jn.compactRow}>

          <TouchableOpacity style={jn.compactCard}
            onPress={() => navigation?.navigate?.("Groups")}
            activeOpacity={0.88}>
            <View style={jn.compactIconWrap}>
              <UsersThree size={22} color="#2F5D50" weight="regular" />
            </View>
            <Text style={jn.compactTitle}>My Groups</Text>
            <Text style={jn.compactSub}>{"Share milestones\nand updates"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={jn.compactCard}
            onPress={() => navigation?.navigate?.("MyContacts")}
            activeOpacity={0.88}>
            <View style={jn.compactIconWrap}>
              <AddressBook size={22} color="#2F5D50" weight="regular" />
            </View>
            <Text style={jn.compactTitle}>My Contacts</Text>
            <Text style={jn.compactSub}>{"Save your\nimportant contacts"}</Text>
          </TouchableOpacity>

        </View>

        {/* ── 6. Calendar — full-width compact card ── */}
        <View style={jn.compactRow}>
          <TouchableOpacity style={jn.compactCard}
            onPress={() => navigation?.getParent?.()?.navigate?.("Home", { screen: "Calendar", initial: false, params: { returnToTab: "Journey" } })}
            activeOpacity={0.88}>
            <View style={jn.compactIconWrap}>
              <CalendarBlank size={22} color="#2F5D50" weight="regular" />
            </View>
            <Text style={jn.compactTitle}>Calendar</Text>
            <Text style={jn.compactSub}>Dates, rites and reminders for your journey</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height:spacing(5) }} />
      </ScrollView>

    </SafeAreaView>
  );
}

const jn = StyleSheet.create({
  safe:   { flex:1, backgroundColor:colors.background },
  scroll: { paddingHorizontal:spacing(2.5), paddingTop:spacing(1.5) },

  // Header
  header:          { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:spacing(2.5), paddingVertical:spacing(1.75), backgroundColor:colors.background },
  headerLeft:      { flex:1 },
  headerTitle:     { fontFamily:SERIF, fontSize:26, fontWeight:"400", color:colors.text },
  headerSub:       { fontSize:14, color:colors.subtext, fontWeight:"400", marginTop:2 },
  // Departure counter — top right
  departureBadge:  { alignItems:"center", paddingHorizontal:spacing(1.5), paddingVertical:spacing(0.75), borderWidth:1, borderColor:"#C4A882", borderRadius:radius.md },
  departureDays:   { fontFamily:SERIF, fontSize:22, color:colors.text, fontWeight:"400", lineHeight:26 },
  departureLbl:    { fontSize:10, color:colors.subtext, textAlign:"center", lineHeight:13, letterSpacing:0.3 },

  // ── 1. Mode toggle — compact single bar ──────────────────────────────────────
  modeWrap:        { marginBottom:spacing(1.5) },
  modeToggle:      { flexDirection:"row", backgroundColor:colors.card, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, padding:3, ...shadows.card },
  modeOpt:         { flex:1, alignItems:"center", paddingVertical:spacing(1.75), borderRadius:radius.md, gap:4 },
  modeOptActive:   { backgroundColor:colors.primary },
  modeName:        { fontFamily:SERIF, fontSize:19, color:colors.subtext, fontWeight:"400", letterSpacing:1 },
  modeNameActive:  { color:"#fff", fontWeight:"600" },
  modeSub:         { fontSize:13, color:colors.subtext, fontWeight:"400", textAlign:"center" },
  modeSubActive:   { color:"rgba(255,255,255,0.8)" },

  // ── 2. Hero card: Step-by-step Guide — taller at 260 ─────────────────────────
  heroCard:          { borderRadius:radius.xl, overflow:"hidden", marginBottom:spacing(1.5), height:260, ...shadows.card },

  // Du'ā card — full width, changes with mode toggle
  duaCard:       { height:160, borderRadius:16, overflow:"hidden", marginBottom:spacing(1.5), shadowColor:"#1C1408", shadowOffset:{width:0,height:4}, shadowOpacity:0.16, shadowRadius:12, elevation:6 },
  duaCardBg:     { flex:1, justifyContent:"flex-end" },
  duaCardScrim:  { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(8,14,6,0.45)", borderRadius:16 },
  duaCardContent:{ padding:16 },
  duaCardEyebrow:{ fontSize:9, color:"rgba(255,255,255,0.70)", fontWeight:"700", letterSpacing:1.5, textTransform:"uppercase", marginBottom:4 },
  duaCardTitle:  { fontFamily:SERIF, fontSize:20, color:"#fff", fontWeight:"600", marginBottom:2 },
  duaCardSub:    { fontSize:12, color:"rgba(255,255,255,0.75)" },

  heroCardBg:        { flex:1 },
  heroCardScrim:     { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(10,8,4,0.52)" },
  heroCardContent:   { flex:1, justifyContent:"space-between", padding:spacing(2) },
  heroCardTopRow:    { flexDirection:"row", justifyContent:"space-between", alignItems:"center" },
  heroCardBadge:     { backgroundColor:"#fff", borderRadius:radius.pill, paddingHorizontal:spacing(1.75), paddingVertical:spacing(0.75) },
  heroCardBadgeTxt:  { fontFamily:SERIF, fontSize:13, color:colors.primary, fontWeight:"700", letterSpacing:1 },
  heroCardArrowRight:{ fontSize:28, color:"rgba(255,255,255,0.7)" },
  heroCardBottom:    { },
  heroCardTitle:     { fontFamily:SERIF, fontSize:26, color:"#fff", fontWeight:"400", marginBottom:5 },
  heroCardSub:       { fontSize:14, color:"rgba(255,255,255,0.75)", fontWeight:"400", marginBottom:spacing(1.5) },
  // Progress with coloured background bar
  heroProgWrap:      { backgroundColor:"rgba(20,55,40,0.75)", borderRadius:radius.md, padding:spacing(1.25) },
  heroProgRow:       { flexDirection:"row", alignItems:"center", gap:spacing(1.5) },
  heroProgTrack:     { flex:1, flexDirection:"row", gap:2, height:5 },
  heroProgSeg:       { flex:1, height:"100%", borderRadius:3, backgroundColor:"rgba(255,255,255,0.25)" },
  heroProgSegFill:   { backgroundColor:"#fff" },
  heroProgLabel:     { fontSize:13, color:"#fff", fontWeight:"600" },

  // ── 3. Board card — shorter at 150, YOUR BOARD label, divider ────────────────
  boardCard:       { borderRadius:radius.xl, overflow:"hidden", marginBottom:spacing(1.5), height:150, ...shadows.card },
  boardCardBg:     { flex:1 },
  boardScrim:      { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(10,8,4,0.22)" },
  boardContent:    { position:"absolute", top:0, bottom:0, left:0, right:0, justifyContent:"flex-end", padding:spacing(2) },
  boardEyebrow:    { fontSize:10, fontWeight:"700", letterSpacing:2, color:"rgba(240,228,200,0.7)", marginBottom:4 },
  boardTitle:      { fontFamily:SERIF, fontSize:21, color:"#fff", fontWeight:"400", marginBottom:3 },
  boardSub:        { fontSize:15, color:"rgba(255,255,255,0.68)", marginBottom:spacing(1.25) },
  boardStats:      { flexDirection:"row", gap:spacing(2), alignItems:"center" },
  boardStat:       { alignItems:"flex-start" },
  boardStatNum:    { fontFamily:SERIF, fontSize:28, color:"#fff", fontWeight:"400", lineHeight:32 },
  boardStatLbl:    { fontSize:10, color:"rgba(255,255,255,0.65)", letterSpacing:0.5 },
  boardStatDivider:{ width:1, height:36, backgroundColor:"rgba(255,255,255,0.3)", marginHorizontal:spacing(0.5) },
  boardEmpty:      { fontSize:13, color:"rgba(255,255,255,0.72)", fontStyle:"italic" },

  // ── 4. Half cards — count + category label + title ───────────────────────────
  halfRow:           { flexDirection:"row", gap:spacing(1.25), marginBottom:spacing(1.5) },
  halfCard:          { flex:1, borderRadius:radius.lg, overflow:"hidden", height:160, ...shadows.card },
  halfCardImg:       { flex:1, justifyContent:"flex-end" },
  halfCardScrim:     { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(10,8,4,0.22)" },
  halfCardScrimDark: { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(10,8,4,0.38)" },
  halfCardOverlayWrap:{ ...StyleSheet.absoluteFillObject, justifyContent:"space-between", padding:spacing(1.5) },
  halfCardCountWrap:  { alignSelf:"flex-end", alignItems:"flex-end" },
  halfCardOverlay:   { },
  halfCardCount:     { fontFamily:SERIF, fontSize:22, color:"#fff", fontWeight:"400", lineHeight:26 },
  halfCardCategory:  { fontSize:9, fontWeight:"700", letterSpacing:1.5, color:"rgba(255,255,255,0.72)", marginBottom:3, textTransform:"uppercase" },
  halfCardTitleWhite:{ fontFamily:SERIF, fontSize:17, color:"#fff", fontWeight:"400", marginBottom:2 },
  halfCardSubWhite:  { fontSize:13, color:"rgba(255,255,255,0.85)" },

  // ── 5. Compact image cards: Groups + Contacts ─────────────────────────────────
  compactRow:      { flexDirection:"row", gap:spacing(1.25), marginBottom:spacing(1.5) },
  compactCard:     { flex:1, justifyContent:"flex-end", backgroundColor:colors.card, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, padding:spacing(2), height:149, ...shadows.card },
  compactIconWrap: { marginBottom:8 },
  compactTitle:    { fontFamily:SERIF, fontSize:17, color:colors.text, fontWeight:"500", marginBottom:4 },
  compactSub:      { fontSize:14, color:colors.subtext, lineHeight:18 },
  compactArrow:    { fontSize:22, color:colors.border },

  // Legacy styles — kept for any remaining refs
  linkCard:       { flexDirection:"row", alignItems:"center", backgroundColor:colors.card, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, marginBottom:spacing(1.25), padding:spacing(2), gap:spacing(1.5), ...shadows.card },
  linkIconWrap:   { width:48, height:48, borderRadius:radius.md, backgroundColor:colors.background, borderWidth:1, borderColor:colors.border, alignItems:"center", justifyContent:"center", flexShrink:0 },
  linkIcon:       { fontSize:22 },
  linkInfo:       { flex:1 },
  linkLabel:      { fontFamily:SERIF, fontSize:16, color:colors.text, marginBottom:3 },
  linkSub:        { fontSize:13, color:colors.subtext, fontWeight:"400" },
  linkArrow:      { fontSize:20, color:colors.border },
  linkCounter:    { alignItems:"center", justifyContent:"center", minWidth:40 },
  linkCounterNum: { fontFamily:SERIF, fontSize:18, color:colors.primary, fontWeight:"500", lineHeight:22 },
  linkCounterOf:  { fontSize:10, color:colors.subtext, textAlign:"center" },
});
