/**
 * DuaListScreen.jsx — Safar
 * Clean list-row design matching reference image.
 * Each row: icon | title + subtitle | count badge | chevron
 * Tapping navigates to DuaDetailScreen.
 */
import React from "react";
import {
  SafeAreaView, View, Text, ScrollView,
  TouchableOpacity, StyleSheet,
} from "react-native";
import { colors, spacing, radius, typography, shadows } from "../theme";

const SERIF = "SourceSerif4-Regular";

// ── Stage icon map ────────────────────────────────────────────────────────────
const STAGE_ICONS = {
  "Ihram":        "\uD83D\uDFE2",
  "Tawaf":        "\uD83D\uDD4B",
  "Sa'y":         "\uD83D\uDEB6",
  "Zamzam":       "\uD83D\uDCA7",
  "Maqam":        "\uD83D\uDCCD",
  "Arafah":       "\u26F0\uFE0F",
  "Muzdalifah":   "\uD83C\uDF19",
  "Mina":         "\u26FA\uFE0F",
  "Kaaba":        "\uD83D\uDD4B",
  "General":      "\uD83E\uDD32",
  "Daily":        "\uD83C\uDF05",
  "Before Sleep": "\uD83C\uDF19",
  "default":      "\uD83E\uDD32",
};

function stageIcon(stage) {
  return STAGE_ICONS[stage] ?? STAGE_ICONS["default"];
}

// ── Sample duas ───────────────────────────────────────────────────────────────
const SAMPLE_DUAS = {
  umrah: [
    { id:"u1", title:"Talbiyah", stage:"Ihram", subtitle:"Recited upon entering Ihram",
      arabic:"\u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643\u064e",
      transliteration:"Labbayk All\u0101humma labbayk",
      translation:"Here I am O Allah, here I am.", source:"\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 1549", isFeatured:true },
    { id:"u2", title:"Upon Seeing the Ka\u02bfbah", stage:"Tawaf", subtitle:"First sight of the Ka\u02bfbah",
      arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0632\u0650\u062f\u0652 \u0647\u0630\u0627 \u0627\u0644\u0652\u0628\u064e\u064a\u0652\u062a\u064e \u062a\u064e\u0634\u0652\u0631\u0650\u064a\u0641\u064b\u0627",
      transliteration:"All\u0101humma zid h\u0101dhal-bayta tashr\u012bf\u0101",
      translation:"O Allah, increase this House in honour.", source:"Al-Azraq\u012b", isFeatured:true },
    { id:"u3", title:"Beginning Taw\u0101f", stage:"Tawaf", subtitle:"Said when starting each circuit",
      arabic:"\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0647\u0650 \u0648\u064e\u0627\u0644\u0644\u0647\u064f \u0623\u064e\u0643\u0652\u0628\u064e\u0631\u064f",
      transliteration:"Bismi-ll\u0101hi wa-ll\u0101hu akbar",
      translation:"In the name of Allah, and Allah is the Greatest.", source:"\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 1613", isFeatured:false },
    { id:"u4", title:"Between Yemeni Corner & Black Stone", stage:"Tawaf", subtitle:"Recited in the final stretch of each round",
      arabic:"\u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u0622\u062a\u0650\u0646\u064e\u0627 \u0641\u0650\u064a \u0627\u0644\u062f\u064f\u0651\u0646\u0652\u064a\u064e\u0627 \u062d\u064e\u0633\u064e\u0646\u064e\u0629\u064b",
      transliteration:"Rabban\u0101 \u0101tin\u0101 fi\u02bfd-duny\u0101 \u1e25asanatan",
      translation:"Our Lord, give us good in this world and the Hereafter.", source:"Al-Baqarah 2:201", isFeatured:false },
    { id:"u5", title:"Upon Ascending \u1e62af\u0101", stage:"Sa'y", subtitle:"Said when climbing Safa",
      arabic:"\u0625\u0650\u0646\u064e\u0651 \u0627\u0644\u0635\u064e\u0651\u0641\u064e\u0627 \u0648\u064e\u0627\u0644\u0652\u0645\u064e\u0631\u0652\u0648\u064e\u0629\u064e \u0645\u0650\u0646\u0652 \u0634\u064e\u0639\u064e\u0627\u0626\u0650\u0631\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650",
      transliteration:"Inna\u1e63-\u1e63af\u0101 wal-marwata min sha\u02bf\u0101\u02bfiri-ll\u0101h",
      translation:"Indeed \u1e62af\u0101 and Marwah are among the signs of Allah.", source:"\u1e62a\u1e25\u012b\u1e25 Muslim \u00b7 1218", isFeatured:true },
  ],
  family: [
    { id:"f1", title:"Du\u02bf\u0101 for Parents", stage:"General", subtitle:"A Quranic prayer for your parents",
      arabic:"\u0631\u064e\u0628\u064e\u0651\u0646\u0650\u064a \u0627\u0631\u0652\u062d\u064e\u0645\u0652\u0647\u064f\u0645\u064e\u0627 \u0643\u064e\u0645\u064e\u0627 \u0631\u064e\u0628\u064e\u0651\u064a\u064e\u0627\u0646\u0650\u064a \u0635\u064e\u063a\u0650\u064a\u0631\u064b\u0627",
      transliteration:"Rabb-ir\u1e25amhum\u0101 kam\u0101 rabbay\u0101n\u012b \u1e63agh\u012br\u0101",
      translation:"My Lord, have mercy on them as they raised me when I was young.", source:"Al-Isr\u0101\u02bc 17:24", isFeatured:true },
    { id:"f2", title:"For Protection of Family", stage:"General", subtitle:"Ask Allah to protect those you love",
      arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0627\u062d\u0652\u0641\u064e\u0638\u0652\u0646\u0650\u064a \u0648\u064e\u0627\u062d\u0652\u0641\u064e\u0638\u0652 \u0623\u0647\u0652\u0644\u0650\u064a",
      transliteration:"All\u0101humma \u1e25f\u1e0fn\u012b wa\u1e25fa\u1e0f ahli",
      translation:"O Allah, protect me and protect my family.", source:"Transmitted du\u02bf\u0101", isFeatured:false },
  ],
  daily: [
    { id:"d1", title:"Morning Du\u02bf\u0101", stage:"Daily", subtitle:"Begin your day with remembrance",
      arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0628\u0650\u0643\u064e \u0623\u0635\u0652\u0628\u064e\u062d\u0652\u0646\u064e\u0627 \u0648\u064e\u0628\u0650\u0643\u064e \u0623\u0645\u0652\u0633\u064e\u064a\u0652\u0646\u064e\u0627",
      transliteration:"All\u0101humma bika a\u1e63ba\u1e25n\u0101 wa bika amsayn\u0101",
      translation:"O Allah, by You we enter morning and by You we enter evening.", source:"Sunan Ab\u012b D\u0101w\u016bd", isFeatured:true },
    { id:"d2", title:"Before Eating", stage:"Daily", subtitle:"Say before every meal",
      arabic:"\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0647\u0650",
      transliteration:"Bismil-l\u0101h",
      translation:"In the name of Allah.", source:"\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b", isFeatured:false },
  ],
  sleep: [
    { id:"s1", title:"Before Sleeping", stage:"Before Sleep", subtitle:"Close your eyes with His name",
      arabic:"\u0628\u0650\u0627\u0633\u0652\u0645\u0650\u0643\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0623\u064e\u0645\u0648\u062a\u064f \u0648\u064e\u0623\u064e\u062d\u0652\u064a\u064e\u0627",
      transliteration:"Bismika All\u0101humma am\u016btu wa a\u1e25y\u0101",
      translation:"In Your name O Allah I die and I live.", source:"\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 6312", isFeatured:true },
  ],
  generic: [
    { id:"g1", title:"Du\u02bf\u0101 for This Moment", stage:"General", subtitle:"For remembrance, gratitude and worship",
      arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0623\u064e\u0639\u0650\u0646\u064e\u0651\u064a \u0639\u064e\u0644\u064e\u0649 \u0630\u0650\u0643\u0652\u0631\u0650\u0643\u064e \u0648\u064e\u0634\u064f\u0643\u0652\u0631\u0650\u0643\u064e \u0648\u064e\u062d\u064f\u0633\u0652\u0646\u0650 \u0639\u0650\u0628\u064e\u0627\u062f\u064e\u062a\u0650\u0643\u064e",
      transliteration:"All\u0101humma a\u02bfinn\u012b \u02bfal\u0101 dhikrika wa shukrika wa \u1e25usni \u02bfib\u0101datik",
      translation:"O Allah, help me to remember You, to be grateful to You, and to worship You well.",
      source:"Sunan Ab\u012b D\u0101w\u016bd \u00b7 1522", isFeatured:true },
    { id:"g2", title:"Good in Both Worlds", stage:"General", subtitle:"One of the most beloved Quranic duas",
      arabic:"\u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u0622\u062a\u0650\u0646\u064e\u0627 \u0641\u0650\u064a \u0627\u0644\u062f\u064f\u0651\u0646\u0652\u064a\u064e\u0627 \u062d\u064e\u0633\u064e\u0646\u064e\u0629\u064b \u0648\u064e\u0641\u0650\u064a \u0627\u0644\u0622\u062e\u0650\u0631\u064e\u0629\u0650 \u062d\u064e\u0633\u064e\u0646\u064e\u0629\u064b",
      transliteration:"Rabban\u0101 \u0101tin\u0101 fi\u02bfd-duny\u0101 \u1e25asanatan wa fi\u02bfl-\u0101khirati \u1e25asanatan",
      translation:"Our Lord, give us good in this world and good in the Hereafter.",
      source:"Al-Baqarah 2:201", isFeatured:true },
    { id:"g3", title:"Du\u02bf\u0101 for Steadfastness", stage:"General", subtitle:"Ask for a firm and guided heart",
      arabic:"\u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u0644\u064e\u0627 \u062a\u064f\u0632\u0650\u063a\u0652 \u0642\u064f\u0644\u0648\u0628\u064e\u0646\u064e\u0627 \u0628\u064e\u0639\u0652\u062f\u064e \u0625\u0650\u0630\u0652 \u0647\u064e\u062f\u064e\u064a\u0652\u062a\u064e\u0646\u064e\u0627",
      transliteration:"Rabban\u0101 l\u0101 tuzigh qul\u016bban\u0101 ba\u02bfda idh hadaytan\u0101",
      translation:"Our Lord, let not our hearts deviate after You have guided us.",
      source:"\u0100l \u02bfImr\u0101n 3:8", isFeatured:false },
  ],
};

// ── Dua row — matches reference image style ───────────────────────────────────
function DuaRow({ dua, index, total, onPress }) {
  const isLast = index === total - 1;
  return (
    <TouchableOpacity
      style={isLast ? [row.wrap, row.wrapLast] : row.wrap}
      onPress={onPress}
      activeOpacity={0.75}>

      {/* Left icon circle */}
      <View style={row.iconWrap}>
        <Text style={row.icon}>{stageIcon(dua.stage)}</Text>
      </View>

      {/* Title + subtitle */}
      <View style={row.info}>
        <Text style={row.title}>{dua.title}</Text>
        <Text style={row.sub} numberOfLines={1}>
          {dua.subtitle ?? dua.stage}
        </Text>
      </View>

      {/* KEY badge if featured */}
      {dua.isFeatured ? (
        <View style={row.keyBadge}>
          <Text style={row.keyBadgeTxt}>KEY</Text>
        </View>
      ) : null}

      {/* Chevron */}
      <Text style={row.chevron}>{"\u203a"}</Text>
    </TouchableOpacity>
  );
}

const row = StyleSheet.create({
  wrap:       { flexDirection:"row", alignItems:"center", paddingHorizontal:16, paddingVertical:14, gap:12, borderBottomWidth:1, borderBottomColor:"#D4D0CA", backgroundColor:"#FDFAF4" },
  wrapLast:   { borderBottomWidth:0 },
  iconWrap:   { width:44, height:44, borderRadius:22, backgroundColor:"#EDE6D8", borderWidth:1, borderColor:"#D4D0CA", alignItems:"center", justifyContent:"center", flexShrink:0 },
  icon:       { fontSize:20 },
  info:       { flex:1 },
  title:      { fontFamily:SERIF, fontSize:16, color:"#1A1712", marginBottom:3, fontWeight:"400" },
  sub:        { fontSize:12, color:"#5A5650", fontWeight:"400" },
  keyBadge:   { backgroundColor:"#C8A96A", paddingHorizontal:7, paddingVertical:3, borderRadius:4, marginRight:4 },
  keyBadgeTxt:{ fontSize:10, color:"#fff", fontWeight:"700", letterSpacing:0.8 },
  chevron:    { fontSize:20, color:"#D4D0CA" },
});

// ── Stage section header ──────────────────────────────────────────────────────
function StageDivider({ label }) {
  return (
    <View style={sd.wrap}>
      <Text style={sd.label}>{label.toUpperCase()}</Text>
    </View>
  );
}

const sd = StyleSheet.create({
  wrap:  { paddingHorizontal:20, paddingTop:16, paddingBottom:6 },
  label: { fontSize:11, fontWeight:"700", letterSpacing:1.5, color:"#5A5650" },
});

// ── Screen ────────────────────────────────────────────────────────────────────

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
    backgroundColor: "#F5EDD8",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E8D9B8",
    padding: 16,
  },
  text: { fontSize: 12, color: "#7A6030", lineHeight: 17 },
  bold: { fontWeight: "600" },
});


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
  wrap: { marginHorizontal: 20, marginTop: 16, marginBottom: 8, backgroundColor: "#F5EDD8", borderRadius: 10, borderWidth: 1, borderColor: "#E8D9B8", padding: 16 },
  text: { fontSize: 12, color: "#7A6030", lineHeight: 17 },
  bold: { fontWeight: "600" },
});

export default function DuaListScreen({ route, navigation }) {
  const list = route?.params?.list ?? { id:"umrah", name:"My Umrah Journey", count:18, emoji:"\uD83D\uDD4B" };
  const specificDuas = SAMPLE_DUAS[list.id];
  const duas = specificDuas ?? SAMPLE_DUAS["generic"];

  // Group by stage for section headers
  const stages = [];
  const grouped = {};
  duas.forEach(d => {
    if (!grouped[d.stage]) { grouped[d.stage] = []; stages.push(d.stage); }
    grouped[d.stage].push(d);
  });

  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.8}>
          <Text style={s.backArrow}>{"\u2039"}</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle} numberOfLines={1}>{list.name}</Text>
          <Text style={s.headerSub}>{duas.length} {duas.length === 1 ? "du\u02bf\u0101\u02be" : "du\u02bf\u0101\u02bes"}</Text>
        </View>
        <View style={{ width:36 }} />
      </View>

      {duas.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>{"\uD83E\uDD32"}</Text>
          <Text style={s.emptyTitle}>{"No du\u02bf\u0101\u02bes yet"}</Text>
          <Text style={s.emptyBody}>This list is empty. Duas will appear here when added.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {stages.map(stage => (
            <View key={stage}>
              {stages.length > 1 ? <StageDivider label={stage} /> : null}
              <View style={s.card}>
                {grouped[stage].map((dua, idx) => (
                  <DuaRow
                    key={dua.id}
                    dua={dua}
                    index={idx}
                    total={grouped[stage].length}
                    onPress={() => navigation.navigate("DuaDetail", { dua, allDuas:duas, currentIndex:duas.indexOf(dua) })}
                  />
                ))}
              </View>
            </View>
          ))}
          <ScholarlyFootnote />
          <View style={{ height:spacing(5) }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex:1, backgroundColor:"#EDE6D8" },
  header:      { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:20, paddingTop:16, paddingBottom:12, borderBottomWidth:1, borderBottomColor:"#D4D0CA", backgroundColor:"#EDE6D8" },
  backBtn:     { width:36, height:36, borderRadius:18, backgroundColor:"#FDFAF4", borderWidth:1, borderColor:"#D4D0CA", alignItems:"center", justifyContent:"center" },
  backArrow:   { fontSize:22, color:"#1A1712", lineHeight:26 },
  headerCenter:{ flex:1, alignItems:"center", paddingHorizontal:8 },
  headerTitle: { fontFamily:SERIF, fontSize:18, color:"#1A1712" },
  headerSub:   { fontSize:12, color:"#5A5650", marginTop:2 },
  card:        { marginHorizontal:20, backgroundColor:"#FDFAF4", borderRadius:12, borderWidth:1, borderColor:"#D4D0CA", overflow:"hidden", marginBottom:8,
    shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4,},
  empty:       { flex:1, alignItems:"center", justifyContent:"center", padding:24 },
  emptyEmoji:  { fontSize:44, marginBottom:12 },
  emptyTitle:  { fontFamily:SERIF, fontSize:20, color:"#1A1712", marginBottom:8 },
  emptyBody:   { fontSize:14, color:"#5A5650", textAlign:"center", lineHeight:22 },
});
