/**
 * DuaListScreen.jsx — Safar
 * Stage-grouped duas with:
 * - 150px full-bleed image header per section (no rounded corners)
 * - Context line: when/where to say this
 * - "I'm here now" button → Sacred Places map for that location
 * - KEY badge for featured duas
 * - Title size increased to 22pt to match My Umrah screen
 */
import React from "react";
import {
  SafeAreaView, View, Text, ScrollView,
  TouchableOpacity, StyleSheet, ImageBackground,
} from "react-native";
import { colors, spacing, radius, shadows } from "../theme";

const SERIF = "SourceSerif4-Regular";

// ── Stage metadata: image, context line, sacred places site id ────────────────
const STAGE_META = {
  "Ihram": {
    image:   require("../assets/02_ihram_gradient.jpg"),
    context: "Before entering the M\u012bq\u0101t boundary",
    siteId:  null,
  },
  "Tawaf": {
    image:   require("../assets/04_tawaf_gradient.jpg"),
    context: "Circling the Ka\u02bfbah \u2014 seven circuits, beginning at the Black Stone",
    siteId:  "kaaba",
  },
  "Sa'y": {
    image:   require("../assets/05_sai_gradient.jpg"),
    context: "Walking between \u1e62af\u0101 and Marwah \u2014 seven lengths",
    siteId:  "safa_marwa",
  },
  "Zamzam": {
    image:   require("../assets/01_arrival_gradient.jpg"),
    context: "After Taw\u0101f, at the Well of Zamzam",
    siteId:  "zamzam",
  },
  "Maqam": {
    image:   require("../assets/04_tawaf_gradient.jpg"),
    context: "At Maq\u0101m Ibr\u0101h\u012bm, after completing Taw\u0101f",
    siteId:  "maqam_ibrahim",
  },
  "Arafah": {
    image:   require("../assets/07_arafah_gradient.jpg"),
    context: "Standing on the plain of \u02bfArafah \u2014 the heart of Hajj",
    siteId:  "arafah",
  },
  "Muzdalifah": {
    image:   require("../assets/08_muzdalifah_gradient.jpg"),
    context: "Spending the night at Muzdalifah after \u02bfArafah",
    siteId:  "muzdalifah",
  },
  "Mina": {
    image:   require("../assets/06_mina_gradient.jpg"),
    context: "At Min\u0101 \u2014 stoning the Jamar\u0101t and completing the rites",
    siteId:  "mina",
  },
  "Kaaba": {
    image:   require("../assets/04_tawaf_gradient.jpg"),
    context: "In the presence of the Ka\u02bfbah",
    siteId:  "kaaba",
  },
  "General": {
    image:   require("../assets/01_arrival_gradient.jpg"),
    context: "For any moment of worship and remembrance",
    siteId:  null,
  },
  "Daily": {
    image:   require("../assets/03_journey_gradient.jpg"),
    context: "For daily remembrance and morning/evening adhk\u0101r",
    siteId:  null,
  },
  "Before Sleep": {
    image:   require("../assets/03_journey_gradient.jpg"),
    context: "Before closing your eyes each night",
    siteId:  null,
  },
  "default": {
    image:   require("../assets/01_arrival_gradient.jpg"),
    context: "For remembrance and supplication",
    siteId:  null,
  },
};

function getStageMeta(stage) {
  return STAGE_META[stage] ?? STAGE_META["default"];
}

// ── Sample duas ───────────────────────────────────────────────────────────────
const SAMPLE_DUAS = {
  umrah: [
    { id:"u1", title:"Talbiyah", stage:"Ihram",
      subtitle:"Recited continuously upon entering Ih\u0163ram",
      arabic:"\u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643\u064e",
      transliteration:"Labbayk All\u0101humma labbayk",
      translation:"Here I am O Allah, here I am.",
      source:"\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 1549", isFeatured:true },
    { id:"u2", title:"Upon Seeing the Ka\u02bfbah", stage:"Tawaf",
      subtitle:"First sight of the Ka\u02bfbah",
      arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0632\u0650\u062f\u0652 \u0647\u0630\u0627 \u0627\u0644\u0652\u0628\u064e\u064a\u0652\u062a\u064e \u062a\u064e\u0634\u0652\u0631\u0650\u064a\u0641\u064b\u0627",
      transliteration:"All\u0101humma zid h\u0101dhal-bayta tashr\u012bf\u0101",
      translation:"O Allah, increase this House in honour.",
      source:"Al-Azraq\u012b", isFeatured:true },
    { id:"u3", title:"Beginning Taw\u0101f", stage:"Tawaf",
      subtitle:"Said when starting each circuit",
      arabic:"\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0647\u0650 \u0648\u064e\u0627\u0644\u0644\u0647\u064f \u0623\u064e\u0643\u0652\u0628\u064e\u0631\u064f",
      transliteration:"Bismi-ll\u0101hi wa-ll\u0101hu akbar",
      translation:"In the name of Allah, and Allah is the Greatest.",
      source:"\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 1613", isFeatured:false },
    { id:"u4", title:"Between Yemeni Corner & Black Stone", stage:"Tawaf",
      subtitle:"Recited in the final stretch of each round",
      arabic:"\u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u0622\u062a\u0650\u0646\u064e\u0627 \u0641\u0650\u064a \u0627\u0644\u062f\u064f\u0651\u0646\u0652\u064a\u064e\u0627 \u062d\u064e\u0633\u064e\u0646\u064e\u0629\u064b",
      transliteration:"Rabban\u0101 \u0101tin\u0101 fi\u02bfd-duny\u0101 \u1e25asanatan",
      translation:"Our Lord, give us good in this world and the Hereafter.",
      source:"Al-Baqarah 2:201", isFeatured:false },
    { id:"u5", title:"Upon Ascending \u1e62af\u0101", stage:"Sa'y",
      subtitle:"Said when climbing \u1e62af\u0101",
      arabic:"\u0625\u0650\u0646\u064e\u0651 \u0627\u0644\u0635\u064e\u0651\u0641\u064e\u0627 \u0648\u064e\u0627\u0644\u0652\u0645\u064e\u0631\u0652\u0648\u064e\u0629\u064e \u0645\u0650\u0646\u0652 \u0634\u064e\u0639\u064e\u0627\u0626\u0650\u0631\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650",
      transliteration:"Inna\u1e63-\u1e63af\u0101 wal-marwata min sha\u02bf\u0101\u02bfiri-ll\u0101h",
      translation:"Indeed \u1e62af\u0101 and Marwah are among the signs of Allah.",
      source:"\u1e62a\u1e25\u012b\u1e25 Muslim \u00b7 1218", isFeatured:true },
  ],
  family: [
    { id:"f1", title:"Du\u02bf\u0101 for Parents", stage:"General",
      subtitle:"A Quranic prayer for your parents",
      arabic:"\u0631\u064e\u0628\u064e\u0651\u0646\u0650\u064a \u0627\u0631\u0652\u062d\u064e\u0645\u0652\u0647\u064f\u0645\u064e\u0627 \u0643\u064e\u0645\u064e\u0627 \u0631\u064e\u0628\u064e\u0651\u064a\u064e\u0627\u0646\u0650\u064a \u0635\u064e\u063a\u0650\u064a\u0631\u064b\u0627",
      transliteration:"Rabb-ir\u1e25amhum\u0101 kam\u0101 rabbay\u0101n\u012b \u1e63agh\u012br\u0101",
      translation:"My Lord, have mercy on them as they raised me when I was young.",
      source:"Al-Isr\u0101\u02bc 17:24", isFeatured:true },
    { id:"f2", title:"For Protection of Family", stage:"General",
      subtitle:"Ask Allah to protect those you love",
      arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0627\u062d\u0652\u0641\u064e\u0638\u0652\u0646\u0650\u064a \u0648\u064e\u0627\u062d\u0652\u0641\u064e\u0638\u0652 \u0623\u0647\u0652\u0644\u0650\u064a",
      transliteration:"All\u0101humma \u1e25f\u1e0fn\u012b wa\u1e25fa\u1e0f ahli",
      translation:"O Allah, protect me and protect my family.",
      source:"Transmitted du\u02bf\u0101", isFeatured:false },
  ],
  daily: [
    { id:"d1", title:"Morning Du\u02bf\u0101", stage:"Daily",
      subtitle:"Begin your day with remembrance",
      arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0628\u0650\u0643\u064e \u0623\u0635\u0652\u0628\u064e\u062d\u0652\u0646\u064e\u0627 \u0648\u064e\u0628\u0650\u0643\u064e \u0623\u0645\u0652\u0633\u064e\u064a\u0652\u0646\u064e\u0627",
      transliteration:"All\u0101humma bika a\u1e63ba\u1e25n\u0101 wa bika amsayn\u0101",
      translation:"O Allah, by You we enter morning and by You we enter evening.",
      source:"Sunan Ab\u012b D\u0101w\u016bd", isFeatured:true },
    { id:"d2", title:"Before Eating", stage:"Daily",
      subtitle:"Say before every meal",
      arabic:"\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0647\u0650",
      transliteration:"Bismil-l\u0101h",
      translation:"In the name of Allah.",
      source:"\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b", isFeatured:false },
  ],
  sleep: [
    { id:"s1", title:"Before Sleeping", stage:"Before Sleep",
      subtitle:"Close your eyes with His name",
      arabic:"\u0628\u0650\u0627\u0633\u0652\u0645\u0650\u0643\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0623\u064e\u0645\u0648\u062a\u064f \u0648\u064e\u0623\u064e\u062d\u0652\u064a\u064e\u0627",
      transliteration:"Bismika All\u0101humma am\u016btu wa a\u1e25y\u0101",
      translation:"In Your name O Allah I die and I live.",
      source:"\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 6312", isFeatured:true },
  ],
  generic: [
    { id:"g1", title:"Du\u02bf\u0101 for This Moment", stage:"General",
      subtitle:"For remembrance, gratitude and worship",
      arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0623\u064e\u0639\u0650\u0646\u064e\u0651\u064a \u0639\u064e\u0644\u064e\u0649 \u0630\u0650\u0643\u0652\u0631\u0650\u0643\u064e \u0648\u064e\u0634\u064f\u0643\u0652\u0631\u0650\u0643\u064e \u0648\u064e\u062d\u064f\u0633\u0652\u0646\u0650 \u0639\u0650\u0628\u064e\u0627\u062f\u064e\u062a\u0650\u0643\u064e",
      transliteration:"All\u0101humma a\u02bfinn\u012b \u02bfal\u0101 dhikrika wa shukrika wa \u1e25usni \u02bfib\u0101datik",
      translation:"O Allah, help me to remember You, to be grateful to You, and to worship You well.",
      source:"Sunan Ab\u012b D\u0101w\u016bd \u00b7 1522", isFeatured:true },
    { id:"g2", title:"Good in Both Worlds", stage:"General",
      subtitle:"One of the most beloved Quranic duas",
      arabic:"\u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u0622\u062a\u0650\u0646\u064e\u0627 \u0641\u0650\u064a \u0627\u0644\u062f\u064f\u0651\u0646\u0652\u064a\u064e\u0627 \u062d\u064e\u0633\u064e\u0646\u064e\u0629\u064b \u0648\u064e\u0641\u0650\u064a \u0627\u0644\u0622\u062e\u0650\u0631\u064e\u0629\u0650 \u062d\u064e\u0633\u064e\u0646\u064e\u0629\u064b",
      transliteration:"Rabban\u0101 \u0101tin\u0101 fi\u02bfd-duny\u0101 \u1e25asanatan wa fi\u02bfl-\u0101khirati \u1e25asanatan",
      translation:"Our Lord, give us good in this world and good in the Hereafter.",
      source:"Al-Baqarah 2:201", isFeatured:true },
  ],
};

// ── Dua row ───────────────────────────────────────────────────────────────────
function DuaRow({ dua, index, total, onPress }) {
  return (
    <TouchableOpacity
      style={[row.wrap, index < total - 1 ? row.border : null]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={row.info}>
        <View style={row.titleRow}>
          <Text style={row.title}>{dua.title}</Text>
          {dua.isFeatured ? (
            <View style={row.keyBadge}>
              <Text style={row.keyBadgeTxt}>KEY</Text>
            </View>
          ) : null}
        </View>
        <Text style={row.sub} numberOfLines={1}>{dua.subtitle ?? dua.stage}</Text>
      </View>
      <Text style={row.chevron}>{"\u203a"}</Text>
    </TouchableOpacity>
  );
}

const row = StyleSheet.create({
  wrap:       { flexDirection:"row", alignItems:"center", paddingHorizontal:spacing(2), paddingVertical:spacing(1.75), backgroundColor:colors.card },
  border:     { borderBottomWidth:1, borderBottomColor:colors.border },
  info:       { flex:1 },
  titleRow:   { flexDirection:"row", alignItems:"center", gap:8, marginBottom:3 },
  title:      { fontFamily:SERIF, fontSize:17, color:colors.text, fontWeight:"400", flexShrink:1 },
  sub:        { fontSize:13, color:colors.subtext },
  keyBadge:   { backgroundColor:colors.accent, paddingHorizontal:7, paddingVertical:2, borderRadius:4 },
  keyBadgeTxt:{ fontSize:10, color:"#fff", fontWeight:"700" },
  chevron:    { fontSize:22, color:colors.border, paddingLeft:8 },
});

// ── Section header ────────────────────────────────────────────────────────────
// 150px full-bleed image (no borderRadius) + context line + optional "I'm here now"
function StageHeader({ stage, navigation }) {
  const meta = getStageMeta(stage);
  return (
    <View>
      {/* Full-bleed 150px image — no rounded corners */}
      <ImageBackground
        source={meta.image}
        style={sh.image}
        resizeMode="cover"
      >
        <View style={sh.scrim} />
        <View style={sh.imageContent}>
          <Text style={sh.eyebrow}>STAGE</Text>
          <Text style={sh.stageTitle}>{stage}</Text>
        </View>
      </ImageBackground>

      {/* Context bar */}
      <View style={sh.contextBar}>
        <Text style={sh.contextText}>{meta.context}</Text>
        {meta.siteId ? (
          <TouchableOpacity
            style={sh.hereBtn}
            activeOpacity={0.82}
            onPress={() => navigation?.navigate?.("Map", { highlightSite: meta.siteId })}
          >
            <Text style={sh.hereBtnTxt}>{"I\u2019m here now \u2192"}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const sh = StyleSheet.create({
  image:       { height:150, width:"100%" },
  scrim:       { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(10,24,16,0.38)" },
  imageContent:{ flex:1, justifyContent:"flex-end", padding:16 },
  eyebrow:     { fontSize:9, color:"rgba(255,255,255,0.68)", fontWeight:"700", textTransform:"uppercase", marginBottom:4 },
  stageTitle:  { fontFamily:SERIF, fontSize:26, color:"#FFFFFF", fontWeight:"600" },
  contextBar:  { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:spacing(2.5), paddingVertical:11, backgroundColor:colors.card, borderBottomWidth:1, borderBottomColor:colors.border },
  contextText: { flex:1, fontSize:13, color:colors.subtext, lineHeight:18, paddingRight:10 },
  hereBtn:     { backgroundColor:"#1E3D30", borderRadius:50, paddingHorizontal:12, paddingVertical:6, flexShrink:0 },
  hereBtnTxt:  { fontSize:12, color:"#FDFAF4", fontWeight:"600" },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function DuaListScreen({ route, navigation }) {
  const list = route?.params?.list ?? { id:"umrah", name:"My Umrah Journey" };
  const specificDuas = SAMPLE_DUAS[list.id];
  const duas = specificDuas ?? SAMPLE_DUAS["generic"];

  const stages = [];
  const grouped = {};
  duas.forEach(d => {
    if (!grouped[d.stage]) { grouped[d.stage] = []; stages.push(d.stage); }
    grouped[d.stage].push(d);
  });

  return (
    <SafeAreaView style={s.safe}>

      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.8}>
          <Text style={s.backArrow}>{"\u2039"}</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle} numberOfLines={1}>{list.name}</Text>
          <Text style={s.headerSub}>{duas.length}{" "}{duas.length === 1 ? "du\u02bf\u0101\u02be" : "du\u02bf\u0101\u02bes"}</Text>
        </View>
        <View style={{ width:36 }} />
      </View>

      {duas.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyTitle}>{"No du\u02bf\u0101\u02bes yet"}</Text>
          <Text style={s.emptyBody}>This list is empty.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:spacing(5) }}>
          {stages.map(stage => (
            <View key={stage} style={s.stageBlock}>

              {/* Image header shown whenever there are multiple stages */}
              {stages.length > 1 ? (
                <StageHeader stage={stage} navigation={navigation} />
              ) : null}

              {/* Duas card */}
              <View style={s.card}>
                {grouped[stage].map((dua, idx) => (
                  <DuaRow
                    key={dua.id}
                    dua={dua}
                    index={idx}
                    total={grouped[stage].length}
                    onPress={() => navigation.navigate("DuaDetail", {
                      dua,
                      allDuas: duas,
                      currentIndex: duas.indexOf(dua),
                    })}
                  />
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex:1, backgroundColor:colors.background },
  header:       { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:spacing(2.5), paddingTop:spacing(2), paddingBottom:spacing(1.5), borderBottomWidth:1, borderBottomColor:colors.border, backgroundColor:colors.background },
  backBtn:      { width:36, height:36, borderRadius:18, backgroundColor:colors.card, borderWidth:1, borderColor:colors.border, alignItems:"center", justifyContent:"center" },
  backArrow:    { fontSize:22, color:colors.text, lineHeight:26 },
  headerCenter: { flex:1, alignItems:"center", paddingHorizontal:spacing(1) },
  // Title size 22pt — matches My Umrah screen
  headerTitle:  { fontFamily:SERIF, fontSize:22, color:colors.text, fontWeight:"400" },
  headerSub:    { fontSize:12, color:colors.subtext, marginTop:2 },
  stageBlock:   { marginBottom:spacing(1.5) },
  card:         { marginHorizontal:spacing(2.5), backgroundColor:colors.card, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, overflow:"hidden", ...shadows.card },
  empty:        { flex:1, alignItems:"center", justifyContent:"center", padding:spacing(3) },
  emptyTitle:   { fontFamily:SERIF, fontSize:20, color:colors.text, marginBottom:spacing(1) },
  emptyBody:    { fontSize:14, color:colors.subtext, textAlign:"center", lineHeight:22 },
});
