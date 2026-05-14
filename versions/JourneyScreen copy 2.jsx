import React, { useState } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  ImageBackground, StyleSheet, LayoutAnimation, Platform, UIManager,
} from "react-native";
import { colors, spacing, radius, typography, shadows } from "../theme";
import Svg, { Path, Circle } from "react-native-svg";

function GroupIcon({ size = 18, color = "#fff" }) {
  return (
    <Svg width={size} height={size * 0.8} viewBox="0 0 24 20">
      <Circle cx={5}  cy={5}  r={3}   fill={color} opacity={0.7}/>
      <Path d="M0 18 C0 14 2.5 12 5 12 C6.2 12 7.3 12.5 8.1 13.3 C6.8 14.5 6 16.2 6 18 Z" fill={color} opacity={0.7}/>
      <Circle cx={19} cy={5}  r={3}   fill={color} opacity={0.7}/>
      <Path d="M24 18 C24 14 21.5 12 19 12 C17.8 12 16.7 12.5 15.9 13.3 C17.2 14.5 18 16.2 18 18 Z" fill={color} opacity={0.7}/>
      <Circle cx={12} cy={4}  r={3.5} fill={color}/>
      <Path d="M5.5 18 C5.5 13.8 8.5 11 12 11 C15.5 11 18.5 13.8 18.5 18 Z" fill={color}/>
    </Svg>
  );
}

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SERIF = "SourceSerif4-Regular";

const UMRAH_STEPS = [
  { id:"ihram", number:1, name:"Entering Ih\u1e5b\u0101m", sub:"Intention & Talb\u012byah", done:true, duas:[{
    id:"ihram-1", title:"Talbiyah", stage:"Ih\u1e5b\u0101m",
    arabic:"\u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643\u064e\u060c \u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643\u064e \u0644\u0627 \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0643\u064e \u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643",
    transliteration:"Labbayk All\u0101humma labbayk, labbayk l\u0101 shar\u012bka laka labbayk",
    translation:"Here I am O Allah, here I am. You have no partner, here I am.",
    source:"\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 1549", isFeatured:true }]},
  { id:"tawaf", number:2, name:"\u1e62aw\u0101f", sub:"7 circuits of the Ka\u02bfbah", active:true, duas:[
    { id:"tawaf-1", title:"Upon Beginning", stage:"Taw\u0101f \u00b7 Each round",
      arabic:"\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0647\u0650 \u0648\u064e\u0627\u0644\u0644\u0647\u064f \u0623\u064e\u0643\u0652\u0628\u064e\u0631\u064f",
      transliteration:"Bismi-ll\u0101hi wa-ll\u0101hu akbar",
      translation:"In the name of Allah, and Allah is the Greatest.",
      source:"\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 1613", isFeatured:true },
    { id:"tawaf-2", title:"Between Yemeni Corner & Black Stone", stage:"Taw\u0101f \u00b7 Each round",
      arabic:"\u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u0622\u062a\u0650\u0646\u064e\u0627 \u0641\u0650\u064a \u0627\u0644\u062f\u064f\u0651\u0646\u0652\u064a\u064e\u0627 \u062d\u064e\u0633\u064e\u0646\u064e\u0629\u064b \u0648\u064e\u0641\u0650\u064a \u0627\u0644\u0622\u062e\u0650\u0631\u064e\u0629\u0650 \u062d\u064e\u0633\u064e\u0646\u064e\u0629\u064b \u0648\u064e\u0642\u0650\u0646\u064e\u0627 \u0639\u064e\u0630\u064e\u0627\u0628\u064e \u0627\u0644\u0646\u064e\u0651\u0627\u0631\u0650",
      transliteration:"Rabban\u0101 \u0101tin\u0101 fi\u02bfd-duny\u0101 \u1e25asanatan wa fi\u02bfl-\u0101khirati \u1e25asanatan wa qin\u0101 \u02bfadh\u0101ba\u02bbn-n\u0101r",
      translation:"Our Lord, give us good in this world and in the Hereafter, and protect us from the Fire.",
      source:"Al-Baqarah 2:201" }]},
  { id:"maqam",  number:3, name:"Pray at Maq\u0101m Ibr\u0101h\u012bm", sub:"2 rak\u02bfahs after \u1e62aw\u0101f", duas:[{
    id:"maqam-1", title:"At Maq\u0101m Ibr\u0101h\u012bm", stage:"After \u1e62aw\u0101f",
    arabic:"\u0648\u064e\u0627\u062a\u064e\u0651\u062e\u0650\u0630\u064f\u0648\u0627 \u0645\u0650\u0646 \u0645\u064e\u0642\u064e\u0627\u0645\u0650 \u0625\u0650\u0628\u0652\u0631\u064e\u0627\u0647\u0650\u064a\u0645\u064e \u0645\u064f\u0635\u064e\u0644\u064b\u0651\u0649",
    transliteration:"Wattakhidh\u016b min maq\u0101mi ibr\u0101h\u012bma mu\u1e63all\u0101",
    translation:"And take the station of Ibr\u0101h\u012bm as a place of prayer.",
    source:"Al-Baqarah 2:125" }]},
  { id:"zamzam", number:4, name:"Drink Zamzam", sub:"At the Zamzam well", duas:[{
    id:"zamzam-1", title:"When Drinking Zamzam", stage:"Zamzam",
    arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u0646\u0650\u0651\u064a \u0623\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e \u0639\u0650\u0644\u0652\u0645\u064b\u0627 \u0646\u064e\u0627\u0641\u0650\u0639\u064b\u0627 \u0648\u064e\u0631\u0650\u0632\u0652\u0642\u064b\u0627 \u0648\u064e\u0627\u0633\u0650\u0639\u064b\u0627 \u0648\u064e\u0634\u0650\u0641\u064e\u0627\u0621\u064b \u0645\u0650\u0646\u0652 \u0643\u064f\u0644\u0650\u0651 \u062f\u064e\u0627\u0621\u064d",
    transliteration:"All\u0101humma inn\u012b as\u02bfaluka \u02bfilman n\u0101fi\u02bfan wa rizqan w\u0101si\u02bfan wa shif\u0101\u02bfan min kulli d\u0101\u02bf",
    translation:"O Allah, I ask You for beneficial knowledge, abundant provision, and healing from every disease.",
    source:"Ibn M\u0101jah \u00b7 3062" }]},
  { id:"saee",     number:5, name:"Sa\u02bfy", sub:"7 trips between \u1e62af\u0101 & Marwah", duas:[{
    id:"safa-1", title:"Upon Ascending \u1e62af\u0101", stage:"Sa\u02bfy \u00b7 \u1e62af\u0101",
    arabic:"\u0625\u0650\u0646\u064e\u0651 \u0627\u0644\u0635\u064e\u0651\u0641\u064e\u0627 \u0648\u064e\u0627\u0644\u0652\u0645\u064e\u0631\u0652\u0648\u064e\u0629\u064e \u0645\u0650\u0646\u0652 \u0634\u064e\u0639\u064e\u0627\u0626\u0650\u0631\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650",
    transliteration:"Inna\u1e63-\u1e63af\u0101 wal-marwata min sha\u02bf\u0101\u02bfiri-ll\u0101h",
    translation:"Indeed \u1e62af\u0101 and Marwah are among the signs of Allah.",
    source:"\u1e62a\u1e25\u012b\u1e25 Muslim \u00b7 1218", isFeatured:true }]},
  { id:"halq",     number:6, name:"Halq / Taqsir",  sub:"Shave or trim hair",   duas:[] },
  { id:"complete", number:7, name:"Umrah Complete", sub:"Exit Ih\u1e5b\u0101m", duas:[] },
];

const HAJJ_STEPS = [
  { id:"ihram_h", number:1,  name:"Ih\u1e5b\u0101m for Hajj",       sub:"8th Dhul Hijjah",              duas:[] },
  { id:"mina",    number:2,  name:"Day in Min\u0101",               sub:"Prayer & preparation",          duas:[] },
  { id:"arafah",  number:3,  name:"Wuq\u016bf at \u02bfarafah",     sub:"9th Dhul Hijjah — pillar",      active:true, duas:[{
    id:"arafah-1", title:"Du\u02bf\u0101 at \u02bfarafah", stage:"\u02bfarafah",
    arabic:"\u0644\u064e\u0627 \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u064e\u0651\u0627 \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0648\u064e\u062d\u0652\u062f\u064e\u0647\u064f \u0644\u064e\u0627 \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0647\u064f",
    transliteration:"L\u0101 il\u0101ha illa-ll\u0101hu wa\u1e25dahu l\u0101 shar\u012bka lah",
    translation:"There is no god but Allah alone, with no partner.",
    source:"Sunan al-Tirmidh\u012b \u00b7 3585", isFeatured:true }]},
  { id:"muzdal",  number:4,  name:"Muzdalifah",                    sub:"Night under the stars",         duas:[] },
  { id:"jamarat", number:5,  name:"Jamarat",                       sub:"Stoning of the pillars",        duas:[] },
  { id:"nahr",    number:6,  name:"Sacrifice",                     sub:"10th Dhul Hijjah",              duas:[] },
  { id:"tawaf_i", number:7,  name:"Taw\u0101f al-If\u0101\u1e0dah", sub:"Pillar of Hajj",                duas:[] },
  { id:"saee_h",  number:8,  name:"Sa\u02bfy",                     sub:"\u1e62af\u0101 & Marwah",        duas:[] },
  { id:"mina_d",  number:9,  name:"Days in Min\u0101",             sub:"11-13th Dhul Hijjah",           duas:[] },
  { id:"wadaa",   number:10, name:"Taw\u0101f al-Wad\u0101\u02bf", sub:"Farewell tawaf",                duas:[] },
];

function DuaPlayer({ dua, onClose, onNext, onPrev, hasPrev, hasNext }) {
  const [showTranslit, setShowTranslit] = useState(true);
  const [showTrans,    setShowTrans]    = useState(true);
  const [bookmarked,   setBookmarked]   = useState(false);
  return (
    <View style={pl.wrap}>
      <View style={pl.header}>
        <TouchableOpacity style={pl.iconBtn} onPress={onClose}>
          <Text style={pl.iconBtnTxt}>{"\u2039"}</Text>
        </TouchableOpacity>
        <View style={pl.headerMid}>
          <Text style={pl.stage}>{dua.stage}</Text>
          <Text style={pl.title} numberOfLines={1}>{dua.title}</Text>
        </View>
        <TouchableOpacity style={pl.iconBtn} onPress={() => setBookmarked(v => !v)}>
          <Text style={[pl.bookmark, bookmarked && pl.bookmarkActive]}>{bookmarked ? "\u2665" : "\u2661"}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={pl.scroll} contentContainerStyle={pl.scrollContent} showsVerticalScrollIndicator={false}>
        {dua.isFeatured && (
          <View style={pl.featuredRow}>
            <View style={pl.featuredBadge}><Text style={pl.featuredText}>{"KEY DU\u02bf\u0100\u02be"}</Text></View>
          </View>
        )}
        <View style={pl.arabicCard}>
          <Text style={pl.arabicText}>{dua.arabic}</Text>
        </View>
        <TouchableOpacity style={pl.sectionToggle}
          onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setShowTranslit(v => !v); }}
          activeOpacity={0.8}>
          <Text style={pl.sectionLabel}>TRANSLITERATION</Text>
          <Text style={pl.sectionChev}>{showTranslit ? "\u25b2" : "\u25bc"}</Text>
        </TouchableOpacity>
        {showTranslit && <Text style={pl.translitText}>{dua.transliteration}</Text>}
        <TouchableOpacity style={[pl.sectionToggle, { marginTop: spacing(1.5) }]}
          onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setShowTrans(v => !v); }}
          activeOpacity={0.8}>
          <Text style={pl.sectionLabel}>TRANSLATION</Text>
          <Text style={pl.sectionChev}>{showTrans ? "\u25b2" : "\u25bc"}</Text>
        </TouchableOpacity>
        {showTrans && <Text style={pl.transText}>{dua.translation}</Text>}
        {dua.source && <Text style={pl.sourceText}>{dua.source}</Text>}
        <View style={{ height: spacing(14) }} />
      </ScrollView>
      <View style={pl.controls}>
        <TouchableOpacity style={[pl.ctrlBtn, !hasPrev && pl.ctrlBtnDisabled]} onPress={onPrev} disabled={!hasPrev} activeOpacity={0.7}>
          <Text style={[pl.ctrlIcon, !hasPrev && pl.ctrlIconDisabled]}>{"\u21ba"}</Text>
          <Text style={[pl.ctrlLabel, !hasPrev && pl.ctrlIconDisabled]}>Repeat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={pl.playBtn} activeOpacity={0.85}>
          <Text style={pl.playIcon}>{"\u25b6"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[pl.ctrlBtn, !hasNext && pl.ctrlBtnDisabled]} onPress={onNext} disabled={!hasNext} activeOpacity={0.7}>
          <Text style={[pl.ctrlIcon, !hasNext && pl.ctrlIconDisabled]}>{"\u2192"}</Text>
          <Text style={[pl.ctrlLabel, !hasNext && pl.ctrlIconDisabled]}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const pl = StyleSheet.create({
  wrap:            { flex:1, backgroundColor:colors.background },
  header:          { flexDirection:"row", alignItems:"center", gap:spacing(1), paddingHorizontal:spacing(2), paddingVertical:spacing(1.5), borderBottomWidth:1, borderBottomColor:colors.border, backgroundColor:colors.card },
  iconBtn:         { width:36, height:36, borderRadius:18, backgroundColor:colors.background, borderWidth:1, borderColor:colors.border, alignItems:"center", justifyContent:"center" },
  iconBtnTxt:      { fontSize:20, color:colors.text, lineHeight:24 },
  bookmark:        { fontSize:20, color:colors.border },
  bookmarkActive:  { color:colors.accent },
  headerMid:       { flex:1, alignItems:"center" },
  stage:           { fontSize:typography.tiny, color:colors.accent, fontWeight:"500", letterSpacing:0.8 },
  title:           { fontFamily:SERIF, fontSize:typography.body, color:colors.text },
  scroll:          { flex:1 },
  scrollContent:   { paddingHorizontal:spacing(2.5) },
  featuredRow:     { alignItems:"flex-start", marginTop:spacing(2) },
  featuredBadge:   { backgroundColor:colors.accent, paddingHorizontal:spacing(1), paddingVertical:3, borderRadius:4 },
  featuredText:    { fontSize:9, color:colors.card, fontWeight:"700", letterSpacing:1.2 },
  arabicCard:      { backgroundColor:colors.card, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, padding:spacing(2.5), marginTop:spacing(1.5), marginBottom:spacing(2), ...shadows.card },
  arabicText:      { fontSize:28, color:colors.text, textAlign:"right", lineHeight:52, fontWeight:"400" },
  sectionToggle:   { flexDirection:"row", justifyContent:"space-between", alignItems:"center", paddingVertical:spacing(1), borderTopWidth:1, borderTopColor:colors.border },
  sectionLabel:    { fontSize:9, fontWeight:"600", color:colors.accent, letterSpacing:1.8 },
  sectionChev:     { fontSize:8, color:colors.border, fontWeight:"600" },
  translitText:    { fontSize:typography.small, color:colors.subtext, fontStyle:"italic", lineHeight:typography.small*1.7, fontWeight:"300", paddingVertical:spacing(1) },
  transText:       { fontFamily:SERIF, fontSize:typography.body, color:colors.text, lineHeight:typography.body*1.65, fontWeight:"300", paddingVertical:spacing(1) },
  sourceText:      { fontSize:typography.tiny, color:colors.subtext, marginTop:spacing(1), opacity:0.7 },
  controls:        { position:"absolute", bottom:0, left:0, right:0, flexDirection:"row", alignItems:"center", justifyContent:"space-around", paddingVertical:spacing(2), paddingBottom:spacing(3), backgroundColor:colors.card, borderTopWidth:1, borderTopColor:colors.border, ...shadows.card },
  ctrlBtn:         { alignItems:"center", gap:4, width:64 },
  ctrlBtnDisabled: { opacity:0.3 },
  ctrlIcon:        { fontSize:22, color:colors.subtext },
  ctrlIconDisabled:{ color:colors.border },
  ctrlLabel:       { fontSize:typography.tiny, color:colors.subtext, fontWeight:"300" },
  playBtn:         { width:64, height:64, borderRadius:32, backgroundColor:colors.primary, alignItems:"center", justifyContent:"center", ...shadows.button },
  playIcon:        { fontSize:22, color:colors.card, marginLeft:3 },
});

function StepRow({ step, isLast, onPress }) {
  return (
    <TouchableOpacity style={[sr.row, isLast && sr.rowLast, step.active && sr.rowActive]}
      onPress={onPress} activeOpacity={0.85}
      disabled={!step.duas || step.duas.length === 0}>
      <View style={[sr.num, step.done && sr.numDone, step.active && sr.numActive]}>
        {step.done ? <Text style={sr.numTick}>{"\u2713"}</Text>
          : <Text style={[sr.numText, step.active && sr.numTextActive]}>{step.number}</Text>}
      </View>
      <View style={sr.info}>
        <Text style={[sr.name, step.active && sr.nameActive, step.done && sr.nameDone]}>{step.name}</Text>
        <Text style={sr.sub}>{step.sub}</Text>
      </View>
      {step.duas && step.duas.length > 0 && (
        <View style={sr.badge}><Text style={sr.badgeText}>{step.duas.length} {step.duas.length===1?"du\u02bf\u0101\u02be":"du\u02bf\u0101\u02bes"}</Text></View>
      )}
      <Text style={sr.arrow}>{"\u203a"}</Text>
    </TouchableOpacity>
  );
}

const sr = StyleSheet.create({
  row:           { flexDirection:"row", alignItems:"center", gap:spacing(1.5), paddingVertical:spacing(1.75), paddingHorizontal:spacing(2), borderBottomWidth:1, borderBottomColor:colors.border, backgroundColor:colors.card },
  rowLast:       { borderBottomWidth:0 },
  rowActive:     { backgroundColor:"rgba(47,93,80,0.05)" },
  num:           { width:34, height:34, borderRadius:17, backgroundColor:colors.border, alignItems:"center", justifyContent:"center", flexShrink:0 },
  numDone:       { backgroundColor:colors.primary },
  numActive:     { backgroundColor:colors.primary },
  numText:       { fontSize:typography.small, color:colors.subtext, fontWeight:"500" },
  numTextActive: { color:colors.card },
  numTick:       { fontSize:14, color:colors.card, fontWeight:"700" },
  info:          { flex:1 },
  name:          { fontFamily:SERIF, fontSize:typography.body, color:colors.text, marginBottom:2 },
  nameActive:    { color:colors.primary },
  nameDone:      { color:colors.subtext },
  sub:           { fontSize:typography.small, color:colors.subtext, fontWeight:"300" },
  badge:         { backgroundColor:"rgba(47,93,80,0.10)", borderRadius:radius.pill, paddingHorizontal:spacing(1), paddingVertical:3 },
  badgeText:     { fontSize:typography.tiny, color:colors.primary, fontWeight:"500" },
  arrow:         { fontSize:18, color:colors.border },
});

export default function JourneyScreen({ navigation }) {
  const [mode,       setMode]       = useState("umrah");
  const [activeTab,  setActiveTab]  = useState("all");
  const [playerDua,  setPlayerDua]  = useState(null);
  const [playerStep, setPlayerStep] = useState(null);
  const [duaIndex,   setDuaIndex]   = useState(0);

  const steps = mode === "umrah" ? UMRAH_STEPS : HAJJ_STEPS;
  const openStep = (step) => {
    if (!step.duas || step.duas.length === 0) return;
    setPlayerStep(step); setDuaIndex(0); setPlayerDua(step.duas[0]);
  };
  const handleNext = () => {
    const duas = playerStep?.duas ?? [];
    if (duaIndex + 1 < duas.length) { setDuaIndex(duaIndex+1); setPlayerDua(duas[duaIndex+1]); }
  };
  const handlePrev = () => {
    if (duaIndex - 1 >= 0) { setDuaIndex(duaIndex-1); setPlayerDua(playerStep.duas[duaIndex-1]); }
  };

  if (playerDua) {
    return (
      <SafeAreaView style={{ flex:1, backgroundColor:colors.background }}>
        <DuaPlayer dua={playerDua} onClose={() => setPlayerDua(null)}
          onNext={handleNext} onPrev={handlePrev}
          hasPrev={duaIndex > 0} hasNext={duaIndex < (playerStep?.duas?.length ?? 1) - 1} />
      </SafeAreaView>
    );
  }

  const visibleSteps   = activeTab === "done" ? steps.filter(s => s.done) : steps;
  const completedCount = steps.filter(s => s.done).length;

  return (
    <SafeAreaView style={jn.safe}>

      {/* Hero image — full width at top */}
      <ImageBackground source={require("../assets/journey3.png")} style={jn.hero} imageStyle={jn.heroImg}>
        <View style={jn.heroScrim} />
      </ImageBackground>

      {/* Header */}
      <View style={jn.header}>
        <Text style={jn.headerTitle}>My Journey</Text>
        <TouchableOpacity style={jn.groupsBtn}
          onPress={() => navigation?.navigate?.("Groups")} activeOpacity={0.85}>
          <GroupIcon size={18} color="#fff" />
          <Text style={jn.groupsBtnText}>Groups</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex:1 }}>

        {/* Umrah / Hajj — tall cards matching screenshot */}
        <View style={jn.modeWrap}>
          <Text style={jn.modeWrapLabel}>Your journey</Text>
          <View style={jn.modeRow}>
            <TouchableOpacity style={[jn.modeOpt, mode==="umrah" && jn.modeOptActive]}
              onPress={() => { setMode("umrah"); setActiveTab("all"); }} activeOpacity={0.8}>
              <Text style={jn.modeEmoji}>{"\uD83D\uDD4B"}</Text>
              <Text style={[jn.modeName, mode==="umrah" && jn.modeNameActive]}>Umrah</Text>
              <Text style={[jn.modeSub,  mode==="umrah" && jn.modeSubActive]}>Lesser pilgrimage</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[jn.modeOpt, mode==="hajj" && jn.modeOptActive]}
              onPress={() => { setMode("hajj"); setActiveTab("all"); }} activeOpacity={0.8}>
              <Text style={jn.modeEmoji}>{"\u26F0\uFE0F"}</Text>
              <Text style={[jn.modeName, mode==="hajj" && jn.modeNameActive]}>Hajj</Text>
              <Text style={[jn.modeSub,  mode==="hajj" && jn.modeSubActive]}>Annual pilgrimage</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress card */}
        <View style={jn.progressCard}>
          <View style={jn.progressTopRow}>
            <Text style={jn.progressTitle}>Steps completed</Text>
            <Text style={jn.progressCount}>{completedCount} of {steps.length}</Text>
          </View>
          <View style={jn.progTrack}>
            {Array.from({length: steps.length}, (_, i) => (
              <View key={i} style={[jn.progSeg, i < completedCount && jn.progSegFill]} />
            ))}
          </View>
          <Text style={jn.progressSub}>{"Keep going \u2014 you're making great progress."}</Text>
        </View>

        {/* Link cards */}
        {[
          { id:"guide",  icon:"\uD83D\uDCCB", label:"Step-by-step Guide",
            sub:steps.length + " steps \u00b7 " + completedCount + " completed",
            onPress:() => navigation?.navigate?.("StepGuide", { mode, steps:steps.length, completed:completedCount }) },
          { id:"map",    icon:"\uD83D\uDDFA\uFE0F", label:"Sacred Places",
            sub:"Kaaba \u00b7 \u1e62af\u0101 \u00b7 Marwah \u00b7 Maq\u0101m Ibrahim \u00b7 Zamzam",
            onPress:() => navigation?.navigate?.("Map") },
          { id:"expect", icon:"\uD83D\uDCD6", label:"What to Expect",
            sub:"Travel \u00b7 Health \u00b7 Rituals \u00b7 Safety \u00b7 Legal",
            onPress:() => navigation?.navigate?.("WhatToExpect") },
        ].map((item) => (
          <TouchableOpacity key={item.id} style={jn.linkCard}
            onPress={item.onPress} activeOpacity={0.85}>
            <View style={jn.linkIconWrap}>
              <Text style={jn.linkIcon}>{item.icon}</Text>
            </View>
            <View style={jn.linkInfo}>
              <Text style={jn.linkLabel}>{item.label}</Text>
              <Text style={jn.linkSub}>{item.sub}</Text>
            </View>
            <Text style={jn.linkArrow}>{"\u203a"}</Text>
          </TouchableOpacity>
        ))}

        {/* All Steps / Completed tabs */}
        <View style={jn.tabs}>
          {[["all","All Steps"],["done","Completed"]].map(([key,label]) => (
            <TouchableOpacity key={key} style={[jn.tab, activeTab===key && jn.tabActive]}
              onPress={() => setActiveTab(key)} activeOpacity={0.8}>
              <Text style={[jn.tabLabel, activeTab===key && jn.tabLabelActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Step list */}
        <View style={jn.stepCard}>
          {visibleSteps.map((step, i) => (
            <StepRow key={step.id} step={step} isLast={i===visibleSteps.length-1} onPress={() => openStep(step)} />
          ))}
        </View>

        {/* Tip */}
        <View style={jn.tipCard}>
          <Text style={jn.tipIcon}>{"\u2600\uFE0F"}</Text>
          <Text style={jn.tipText}>Tap any step to read its du\u02bf\u0101\u02beS. Take time to learn each meaning before your journey.</Text>
        </View>

        <View style={{ height:spacing(5) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const jn = StyleSheet.create({
  safe:      { flex:1, backgroundColor:colors.background },
  hero:      { width:"100%", height:225 },
  heroImg:   { resizeMode:"cover" },
  heroScrim: { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(0,0,0,0.15)" },

  header: {
    flexDirection:"row", alignItems:"center", justifyContent:"space-between",
    paddingHorizontal:spacing(2.5), paddingVertical:spacing(1.75),
    backgroundColor:colors.background,
  },
  headerTitle:  { fontFamily:SERIF, fontSize:26, fontWeight:"400", color:colors.text },
  groupsBtn:    { flexDirection:"row", alignItems:"center", gap:spacing(0.75), backgroundColor:colors.primary, borderRadius:radius.pill, paddingHorizontal:spacing(2), paddingVertical:spacing(1), ...shadows.button },
  groupsIcon:   { fontSize:16 },
  groupsBtnText:{ fontFamily:SERIF, fontSize:typography.body, color:colors.card, fontWeight:"500" },

  // Umrah/Hajj — tall card style exactly matching screenshot
  modeWrap:      { backgroundColor:colors.card, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, marginHorizontal:spacing(2.5), marginBottom:spacing(1.5), padding:spacing(2), ...shadows.card },
  modeWrapLabel: { fontFamily:SERIF, fontSize:typography.body, color:colors.text, marginBottom:spacing(1.5) },
  modeRow:       { flexDirection:"row", gap:spacing(1.25) },
  modeOpt:       { flex:1, alignItems:"center", justifyContent:"center", paddingVertical:spacing(2.5), borderRadius:radius.md, gap:6, backgroundColor:colors.background, borderWidth:1.5, borderColor:colors.border },
  modeOptActive: { borderColor:colors.primary, backgroundColor:"rgba(47,93,80,0.06)" },
  modeEmoji:     { fontSize:28 },
  modeName:      { fontFamily:SERIF, fontSize:typography.body, color:colors.subtext, fontWeight:"400" },
  modeNameActive:{ color:colors.primary, fontWeight:"500" },
  modeSub:       { fontSize:typography.tiny, color:colors.border, fontWeight:"300" },
  modeSubActive: { color:colors.primary },

  progressCard:   { backgroundColor:"rgba(47,93,80,0.08)", borderRadius:radius.lg, borderWidth:1, borderColor:"rgba(47,93,80,0.15)", marginHorizontal:spacing(2.5), marginBottom:spacing(1.5), padding:spacing(2) },
  progressTopRow: { flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:spacing(1) },
  progressTitle:  { fontFamily:SERIF, fontSize:typography.body, color:colors.text },
  progressCount:  { fontFamily:SERIF, fontSize:typography.body, color:colors.primary, fontWeight:"500" },
  progTrack:      { flexDirection:"row", gap:3, marginBottom:spacing(1) },
  progSeg:        { flex:1, height:6, borderRadius:3, backgroundColor:"rgba(47,93,80,0.15)" },
  progSegFill:    { backgroundColor:colors.primary },
  progressSub:    { fontSize:typography.small, color:colors.subtext, fontWeight:"300" },

  linkCard:     { flexDirection:"row", alignItems:"center", backgroundColor:colors.card, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, marginHorizontal:spacing(2.5), marginBottom:spacing(1.25), padding:spacing(2), gap:spacing(1.5), ...shadows.card },
  linkIconWrap: { width:48, height:48, borderRadius:radius.md, backgroundColor:colors.background, borderWidth:1, borderColor:colors.border, alignItems:"center", justifyContent:"center", flexShrink:0 },
  linkIcon:     { fontSize:22 },
  linkInfo:     { flex:1 },
  linkLabel:    { fontFamily:SERIF, fontSize:typography.body, color:colors.text, marginBottom:3 },
  linkSub:      { fontSize:typography.small, color:colors.subtext, fontWeight:"300" },
  linkArrow:    { fontSize:20, color:colors.border },

  tabs:          { flexDirection:"row", marginHorizontal:spacing(2.5), marginTop:spacing(1.5), marginBottom:spacing(1.5), backgroundColor:"rgba(200,190,168,0.20)", borderRadius:radius.md, padding:3, borderWidth:1, borderColor:colors.border },
  tab:           { flex:1, paddingVertical:spacing(1), borderRadius:radius.sm, alignItems:"center" },
  tabActive:     { backgroundColor:colors.card, ...shadows.card },
  tabLabel:      { fontSize:typography.small, color:colors.subtext, fontWeight:"300" },
  tabLabelActive:{ color:colors.text, fontWeight:"500" },

  stepCard: { marginHorizontal:spacing(2.5), backgroundColor:colors.card, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, overflow:"hidden", ...shadows.card },

  tipCard: { flexDirection:"row", alignItems:"flex-start", gap:spacing(1.25), marginHorizontal:spacing(2.5), marginTop:spacing(2), backgroundColor:"rgba(200,169,106,0.10)", borderRadius:radius.md, borderWidth:1, borderColor:"rgba(200,169,106,0.25)", padding:spacing(1.75) },
  tipIcon: { fontSize:16, marginTop:1 },
  tipText: { flex:1, fontSize:typography.small, color:colors.subtext, fontWeight:"300", lineHeight:typography.small*1.65 },
});
