/**
 * DuaListScreen.jsx — Safar
 * Shows duas inside a specific user list (e.g. "My Umrah Journey").
 * Receives `list` object via route.params.
 */
import React, { useState } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  StyleSheet, LayoutAnimation, Platform, UIManager,
} from "react-native";
import { colors, spacing, radius, typography } from "../theme";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SERIF = "SourceSerif4-Regular";

// Sample duas per list — in production these come from AsyncStorage / Firebase
const SAMPLE_DUAS = {
  umrah: [
    { id:"u1", title:"Talbiyah", stage:"Ihram",
      arabic:"\u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643\u064e",
      transliteration:"Labbayk All\u0101humma labbayk",
      translation:"Here I am O Allah, here I am.", source:"\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 1549", isFeatured:true },
    { id:"u2", title:"Upon Seeing the Ka\u02bfbah", stage:"Taw\u0101f",
      arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0632\u0650\u062f\u0652 \u0647\u0630\u0627 \u0627\u0644\u0652\u0628\u064e\u064a\u0652\u062a\u064e \u062a\u064e\u0634\u0652\u0631\u0650\u064a\u0641\u064b\u0627",
      transliteration:"All\u0101humma zid h\u0101dhal-bayta tashr\u012bf\u0101",
      translation:"O Allah, increase this House in honour.", source:"Al-Azraq\u012b", isFeatured:true },
    { id:"u3", title:"Beginning Taw\u0101f", stage:"Taw\u0101f",
      arabic:"\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0647\u0650 \u0648\u064e\u0627\u0644\u0644\u0647\u064f \u0623\u064e\u0643\u0652\u0628\u064e\u0631\u064f",
      transliteration:"Bismi-ll\u0101hi wa-ll\u0101hu akbar",
      translation:"In the name of Allah, and Allah is the Greatest.", source:"\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 1613", isFeatured:false },
    { id:"u4", title:"Between Yemeni Corner & Black Stone", stage:"Taw\u0101f",
      arabic:"\u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u0622\u062a\u0650\u0646\u064e\u0627 \u0641\u0650\u064a \u0627\u0644\u062f\u064f\u0651\u0646\u0652\u064a\u064e\u0627 \u062d\u064e\u0633\u064e\u0646\u064e\u0629\u064b \u0648\u064e\u0641\u0650\u064a \u0627\u0644\u0622\u062e\u0650\u0631\u064e\u0629\u0650 \u062d\u064e\u0633\u064e\u0646\u064e\u0629\u064b",
      transliteration:"Rabban\u0101 \u0101tin\u0101 fi\u02bfd-duny\u0101 \u1e25asanatan",
      translation:"Our Lord, give us good in this world and the Hereafter.", source:"Al-Baqarah 2:201", isFeatured:false },
    { id:"u5", title:"Upon Ascending \u1e62af\u0101", stage:"Sa\u02bfy",
      arabic:"\u0625\u0650\u0646\u064e\u0651 \u0627\u0644\u0635\u064e\u0651\u0641\u064e\u0627 \u0648\u064e\u0627\u0644\u0652\u0645\u064e\u0631\u0652\u0648\u064e\u0629\u064e \u0645\u0650\u0646\u0652 \u0634\u064e\u0639\u064e\u0627\u0626\u0650\u0631\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650",
      transliteration:"Inna\u1e63-\u1e63af\u0101 wal-marwata min sha\u02bf\u0101\u02bfiri-ll\u0101h",
      translation:"Indeed \u1e62af\u0101 and Marwah are among the signs of Allah.", source:"\u1e62a\u1e25\u012b\u1e25 Muslim \u00b7 1218", isFeatured:true },
  ],
  family: [
    { id:"f1", title:"Du\u02bf\u0101 for Parents", stage:"General",
      arabic:"\u0631\u064e\u0628\u064e\u0651\u0646\u0650\u064a \u0627\u0631\u0652\u062d\u064e\u0645\u0652\u0647\u064f\u0645\u064e\u0627 \u0643\u064e\u0645\u064e\u0627 \u0631\u064e\u0628\u064e\u0651\u064a\u064e\u0627\u0646\u0650\u064a \u0635\u064e\u063a\u0650\u064a\u0631\u064b\u0627",
      transliteration:"Rabb-ir\u1e25amhum\u0101 kam\u0101 rabbay\u0101n\u012b \u1e63agh\u012br\u0101",
      translation:"My Lord, have mercy on them as they raised me when I was young.", source:"Al-Isr\u0101\u02bc 17:24", isFeatured:true },
    { id:"f2", title:"For Protection of Family", stage:"General",
      arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0627\u062d\u0652\u0641\u064e\u0638\u0652\u0646\u0650\u064a \u0648\u064e\u0627\u062d\u0652\u0641\u064e\u0638\u0652 \u0623\u0647\u0652\u0644\u0650\u064a",
      transliteration:"All\u0101humma \u1e25f\u1e0fn\u012b wa\u1e25fa\u1e0f ahli",
      translation:"O Allah, protect me and protect my family.", source:"Transmitted du\u02bf\u0101", isFeatured:false },
  ],
  daily: [
    { id:"d1", title:"Morning Du\u02bf\u0101", stage:"Daily",
      arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0628\u0650\u0643\u064e \u0623\u0635\u0652\u0628\u064e\u062d\u0652\u0646\u064e\u0627 \u0648\u064e\u0628\u0650\u0643\u064e \u0623\u0645\u0652\u0633\u064e\u064a\u0652\u0646\u064e\u0627",
      transliteration:"All\u0101humma bika a\u1e63ba\u1e25n\u0101 wa bika amsayn\u0101",
      translation:"O Allah, by You we enter morning and by You we enter evening.", source:"Sunan Ab\u012b D\u0101w\u016bd", isFeatured:true },
    { id:"d2", title:"Before Eating", stage:"Daily",
      arabic:"\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0647\u0650",
      transliteration:"Bismil-l\u0101h",
      translation:"In the name of Allah.", source:"\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b", isFeatured:false },
  ],
  generic: [
    { id:"g1", title:"Du\u02bf\u0101\u02be for This Moment", stage:"General",
      arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0623\u064e\u0639\u0650\u0646\u064e\u0651\u064a \u0639\u064e\u0644\u064e\u0649 \u0630\u0650\u0643\u0652\u0631\u0650\u0643\u064e \u0648\u064e\u0634\u064f\u0643\u0652\u0631\u0650\u0643\u064e \u0648\u064e\u062d\u064f\u0633\u0652\u0646\u0650 \u0639\u0650\u0628\u064e\u0627\u062f\u064e\u062a\u0650\u0643\u064e",
      transliteration:"All\u0101humma a\u02bfinn\u012b \u02bfal\u0101 dhikrika wa shukrika wa \u1e25usni \u02bfib\u0101datik",
      translation:"O Allah, help me to remember You, to be grateful to You, and to worship You well.",
      source:"Sunan Ab\u012b D\u0101w\u016bd \u00b7 1522", isFeatured:true },
    { id:"g2", title:"Du\u02bf\u0101\u02be for Good in Both Worlds", stage:"General",
      arabic:"\u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u0622\u062a\u0650\u0646\u064e\u0627 \u0641\u0650\u064a \u0627\u0644\u062f\u064f\u0651\u0646\u0652\u064a\u064e\u0627 \u062d\u064e\u0633\u064e\u0646\u064e\u0629\u064b \u0648\u064e\u0641\u0650\u064a \u0627\u0644\u0622\u062e\u0650\u0631\u064e\u0629\u0650 \u062d\u064e\u0633\u064e\u0646\u064e\u0629\u064b",
      transliteration:"Rabban\u0101 \u0101tin\u0101 fi\u02bfd-duny\u0101 \u1e25asanatan wa fi\u02bfl-\u0101khirati \u1e25asanatan",
      translation:"Our Lord, give us good in this world and good in the Hereafter.",
      source:"Al-Baqarah 2:201", isFeatured:true },
    { id:"g3", title:"Du\u02bf\u0101\u02be for Steadfastness", stage:"General",
      arabic:"\u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u0644\u064e\u0627 \u062a\u064f\u0632\u0650\u063a\u0652 \u0642\u064f\u0644\u0648\u0628\u064e\u0646\u064e\u0627 \u0628\u064e\u0639\u0652\u062f\u064e \u0625\u0650\u0630\u0652 \u0647\u064e\u062f\u064e\u064a\u0652\u062a\u064e\u0646\u064e\u0627",
      transliteration:"Rabban\u0101 l\u0101 tuzigh qul\u016bban\u0101 ba\u02bfda idh hadaytan\u0101",
      translation:"Our Lord, let not our hearts deviate after You have guided us.",
      source:"\u0100l \u02bfImr\u0101n 3:8", isFeatured:false },
  ],
  sleep: [
    { id:"s1", title:"Before Sleeping", stage:"Before Sleep",
      arabic:"\u0628\u0650\u0627\u0633\u0652\u0645\u0650\u0643\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0623\u064e\u0645\u0648\u062a\u064f \u0648\u064e\u0623\u064e\u062d\u0652\u064a\u064e\u0627",
      transliteration:"Bismika All\u0101humma am\u016btu wa a\u1e25y\u0101",
      translation:"In Your name O Allah I die and I live.", source:"\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 6312", isFeatured:true },
  ],
};

// ── Expandable dua card ───────────────────────────────────────────────────────
function DuaCard({ dua, navigation }) {
  const [expanded, setExpanded] = useState(false);
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(v => !v);
  };
  return (
    <TouchableOpacity style={dc.card} onPress={() => navigation?.navigate?.('DuaDetail', { dua })} activeOpacity={0.95}>
      <View style={dc.topRow}>
        <View style={dc.stagePill}>
          <Text style={dc.stageText}>{dua.stage}</Text>
        </View>
        {dua.isFeatured ? <View style={dc.keyBadge}><Text style={dc.keyBadgeTxt}>KEY</Text></View> : null}
      </View>
      <Text style={dc.title}>{dua.title}</Text>
      <View style={dc.arabicBox}>
        <Text style={dc.arabic}>{dua.arabic}</Text>
      </View>
      {expanded ? (
        <View style={dc.expanded}>
          {dua.transliteration ? (
            <View style={dc.section}>
              <Text style={dc.sectionLbl}>TRANSLITERATION</Text>
              <Text style={dc.translit}>{dua.transliteration}</Text>
            </View>
          ) : null}
          {dua.translation ? (
            <View style={dc.section}>
              <Text style={dc.sectionLbl}>TRANSLATION</Text>
              <Text style={dc.translation}>{"\u201c"}{dua.translation}{"\u201d"}</Text>
            </View>
          ) : null}
          {dua.source ? <Text style={dc.source}>{dua.source}</Text> : null}
        </View>
      ) : null}
      <View style={dc.chevronRow}>
        <View style={dc.divider}/>
        <TouchableOpacity onPress={() => navigation?.navigate?.('DuaDetail', { dua })} hitSlop={{top:8,bottom:8,left:8,right:8}}>
          <Text style={dc.readFull}>Full view {"→"}</Text>
        </TouchableOpacity>
        <Text style={dc.chevron}>{expanded ? "\u25b2" : "\u25bc"}</Text>
      </View>
    </TouchableOpacity>
  );
}

const dc = StyleSheet.create({
  card:       { backgroundColor:colors.card, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, padding:spacing(2.5), marginBottom:spacing(1.5) },
  topRow:     { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:spacing(1.25) },
  stagePill:  { flexDirection:"row", alignItems:"center" },
  stageText:  { fontSize:typography.tiny, color:colors.accent, fontWeight:"500", letterSpacing:0.8 },
  keyBadge:   { backgroundColor:colors.accent, paddingHorizontal:spacing(0.75), paddingVertical:2, borderRadius:radius.xs },
  keyBadgeTxt:{ fontSize:9, color:colors.card, fontWeight:"700", letterSpacing:1 },
  title:      { fontFamily:SERIF, fontSize:typography.heading, fontWeight:"500", color:colors.text, marginBottom:spacing(1.5) },
  arabicBox:  { backgroundColor:colors.background, borderRadius:radius.md, paddingVertical:spacing(2), paddingHorizontal:spacing(2), marginBottom:spacing(1), borderWidth:1, borderColor:colors.border },
  arabic:     { fontSize:26, color:colors.text, textAlign:"right", lineHeight:46, fontWeight:"400" },
  expanded:   { marginTop:spacing(1) },
  section:    { marginBottom:spacing(1.5) },
  sectionLbl: { fontSize:9, fontWeight:"600", letterSpacing:1.8, color:colors.accent, marginBottom:spacing(0.5) },
  translit:   { fontSize:typography.small, color:colors.subtext, fontStyle:"italic", lineHeight:typography.small*1.7, fontWeight:"300" },
  translation:{ fontFamily:SERIF, fontSize:typography.body, color:colors.text, lineHeight:typography.body*1.65, fontWeight:"300" },
  source:     { fontSize:typography.tiny, color:colors.subtext, opacity:0.7, marginTop:spacing(0.5) },
  chevronRow: { flexDirection:"row", alignItems:"center", marginTop:spacing(1), gap:spacing(1) },
  divider:    { flex:1, height:1, backgroundColor:colors.border },
  chevron:    { fontSize:9, color:colors.border, fontWeight:"600" },
  readFull:   { fontSize:typography.tiny, color:colors.primary, fontWeight:"500" },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function DuaListScreen({ route, navigation }) {
  const list = route?.params?.list ?? { id:"umrah", name:"My Umrah Journey", count:18, emoji:"\uD83D\uDD4B", gradientBot:"#2A3C30" };
  // For known lists use specific duas; for library categories use a generic set
  const specificDuas = SAMPLE_DUAS[list.id];
  const duas = specificDuas ?? SAMPLE_DUAS["generic"];

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.8}>
          <Text style={s.backArrow}>{"\u2039"}</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>{list.name}</Text>
          <Text style={s.headerSub}>{duas.length} du\u02bf\u0101\u02beS</Text>
        </View>
        <TouchableOpacity style={s.addBtn} activeOpacity={0.85}>
          <Text style={s.addBtnTxt}>+</Text>
        </TouchableOpacity>
      </View>

      {duas.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>{"\uD83E\uDD32"}</Text>
          <Text style={s.emptyTitle}>No du\u02bf\u0101\u02beS yet</Text>
          <Text style={s.emptyBody}>Tap + to add your first du\u02bf\u0101\u02be to this list.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <Text style={s.hint}>Tap any card to expand transliteration and translation.</Text>
          {duas.map(dua => <DuaCard key={dua.id} dua={dua} navigation={navigation} />)}
          <View style={{ height:spacing(4) }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex:1, backgroundColor:colors.background },
  header:       { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:spacing(2.5), paddingTop:spacing(2), paddingBottom:spacing(1.5), borderBottomWidth:1, borderBottomColor:colors.border },
  backBtn:      { width:36, height:36, borderRadius:18, backgroundColor:colors.card, borderWidth:1, borderColor:colors.border, alignItems:"center", justifyContent:"center" },
  backArrow:    { fontSize:22, color:colors.text, lineHeight:26 },
  headerCenter: { flex:1, alignItems:"center" },
  headerTitle:  { fontFamily:SERIF, fontSize:18, color:colors.text },
  headerSub:    { fontSize:typography.tiny, color:colors.subtext, marginTop:1 },
  addBtn:       { width:36, height:36, borderRadius:18, backgroundColor:colors.primary, alignItems:"center", justifyContent:"center" },
  addBtnTxt:    { fontSize:22, color:"#fff", lineHeight:26 },
  scroll:       { paddingHorizontal:spacing(2.5), paddingTop:spacing(1.5) },
  hint:         { fontSize:typography.tiny, color:colors.subtext, fontWeight:"300", marginBottom:spacing(1.5) },
  empty:        { flex:1, alignItems:"center", justifyContent:"center", padding:spacing(3) },
  emptyEmoji:   { fontSize:44, marginBottom:spacing(1.5) },
  emptyTitle:   { fontFamily:SERIF, fontSize:20, color:colors.text, marginBottom:spacing(1) },
  emptyBody:    { fontSize:typography.body, color:colors.subtext, textAlign:"center", lineHeight:22 },
});
