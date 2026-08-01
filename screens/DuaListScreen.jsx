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
import { DUA_CONTENT } from "../dua-content";

const SERIF = "SourceSerif4-Regular";

// ── Stage metadata: image, context line, sacred places site id ────────────────
const STAGE_META = {
  "Ihram": {
    image:   require("../assets/02_ihram_gradient.jpg"),
    context: "Before entering the Miqat boundary",
    siteId:  null,
  },
  "Tawaf": {
    image:   require("../assets/04_tawaf_gradient.jpg"),
    context: "Circling the Kabah \u2014 seven circuits, beginning at the Black Stone",
    siteId:  "kaaba",
  },
  "Say": {
    image:   require("../assets/05_sai_gradient.jpg"),
    context: "Walking between Safa and Marwah \u2014 seven lengths",
    siteId:  "safa_marwa",
  },
  "Zamzam": {
    image:   require("../assets/01_arrival_gradient.jpg"),
    context: "After Tawaf, at the Well of Zamzam",
    siteId:  "zamzam",
  },
  "Maqam": {
    image:   require("../assets/04_tawaf_gradient.jpg"),
    context: "At Maqam Ibrahim, after completing Tawaf",
    siteId:  "maqam_ibrahim",
  },
  "Arafah": {
    image:   require("../assets/07_arafah_gradient.jpg"),
    context: "Standing on the plain of Arafah \u2014 the heart of Hajj",
    siteId:  "arafah",
  },
  "Muzdalifah": {
    image:   require("../assets/08_muzdalifah_gradient.jpg"),
    context: "Spending the night at Muzdalifah after Arafah",
    siteId:  "muzdalifah",
  },
  "Mina": {
    image:   require("../assets/06_mina_gradient.jpg"),
    context: "At Mina \u2014 stoning the Jamarat on the final days of Hajj",
    siteId:  "mina",
  },
  "Kaaba": {
    image:   require("../assets/04_tawaf_gradient.jpg"),
    context: "In the presence of the Kabah",
    siteId:  "kaaba",
  },
  "General": {
    image:   require("../assets/01_arrival_gradient.jpg"),
    context: "For any moment of worship and remembrance",
    siteId:  null,
  },
  "Daily": {
    image:   require("../assets/03_journey_gradient.jpg"),
    context: "For daily remembrance and morning/evening adhkar",
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

// Maps category keys (from MyDuasScreen theme/mood navigation) to DUA_CONTENT ids + display names.
// Keys with no matching content tag resolve to an empty array → shows "Coming soon" state.
const CATEGORY_META = {
  pilgrimage:  { id: "hajj",      name: "Pilgrimage Duas" },
  forgiveness: { id: "forgive",   name: "Forgiveness & Repentance" },
  gratitude:   { id: "gratitude", name: "Gratitude" },
  patience:    { id: "patience",  name: "Patience" },
  family:      { id: "family",    name: "Family Duas" },
  guidance:    { id: "guidance",  name: "Guidance" },
  grateful:    { id: "gratitude", name: "Feeling Grateful" },
  prayer:      { id: "prayer",    name: "Salah & Prayer" },
  dhikr:       { id: "dhikr",     name: "Dhikr & Remembrance" },
  tawakkul:    { id: "tawakkul",  name: "Tawakkul & Trust" },
  health:      { id: "health",    name: "Health & Healing" },
  anxiety:     { id: "anxiety",   name: "Anxiety & Worry" },
  travel:      { id: "travel",    name: "Travel" },
  anxious:     { id: "anxious",   name: "Feeling Anxious" },
  peace:       { id: "peace",     name: "Seeking Peace" },
  strength:    { id: "strength",  name: "Need Strength" },
  anew:        { id: "anew",      name: "Starting Anew" },
  all:         { id: "all",       name: "All Duas" },
  mood:        { id: "mood",      name: "Mood Duas" },
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
  keyBadge:   { backgroundColor:"#B8922A", paddingHorizontal:7, paddingVertical:2, borderRadius:4 },
  keyBadgeTxt:{ fontSize:10, color:"#fff", fontWeight:"700" },
  chevron:    { fontSize:22, color:colors.border, paddingLeft:8 },
});

// ── Section header: 150px image + context line + "I'm here now" ──────────────
function StageHeader({ stage, navigation }) {
  const meta = getStageMeta(stage);
  return (
    <View>
      <ImageBackground source={meta.image} style={sh.image} resizeMode="cover">
        <View style={sh.scrim} />
        <View style={sh.imageContent}>
          <Text style={sh.eyebrow}>STAGE</Text>
          <Text style={sh.stageTitle}>{stage}</Text>
        </View>
      </ImageBackground>
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
  hereBtn:     { backgroundColor:"#4A5C48", borderRadius:50, paddingHorizontal:12, paddingVertical:6, flexShrink:0 },
  hereBtnTxt:  { fontSize:12, color:"#FDFAF4", fontWeight:"600" },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function DuaListScreen({ route, navigation }) {
  // category param (from theme/mood cards) takes priority; fallback to list param (from guide screens).
  const rawCat = route?.params?.category;
  const list = (rawCat ? CATEGORY_META[rawCat] : null) ?? route?.params?.list ?? null;

  if (!list?.id) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.empty}>
          <Text style={s.emptyTitle}>{"Nothing selected"}</Text>
          <Text style={s.emptyBody}>
            {"Head back to the dua library and pick a category or list."}
          </Text>
          <TouchableOpacity
            style={s.emptyBtn}
            onPress={() => navigation?.navigate?.("MyDuas")}
            activeOpacity={0.8}
          >
            <Text style={s.emptyBtnTxt}>{"Go to dua library"}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // If the ID doesn't exist show an empty state rather than silently
  // showing the wrong duas
  const duas = DUA_CONTENT[list.id] ?? [];

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
          <Text style={s.headerSub}>{duas.length}{" "}{duas.length === 1 ? "dua" : "duas"}</Text>
        </View>
        <View style={{ width:36 }} />
      </View>

      {duas.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyTitle}>{"Coming soon"}</Text>
          <Text style={s.emptyBody}>
            {"Duas for \u201c" + list.name + "\u201d are being added.\nCheck back soon, or explore the Hajj & Umrah duas in the meantime."}
          </Text>
          <TouchableOpacity
            style={s.emptyBtn}
            onPress={() => navigation.replace("DuaList", { list:{ id:"hajj", name:"Hajj & Umrah Duas" } })}
            activeOpacity={0.8}
          >
            <Text style={s.emptyBtnTxt}>{"Browse Hajj & Umrah duas"}</Text>
          </TouchableOpacity>
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

          {/* Scholarly footnote — shown on lists launched from guide screens */}
          <View style={s.footnote}>
            <Text style={s.footnoteText}>
              <Text style={s.footnoteBold}>Sources</Text>
              {" \u2014 Duas are drawn from Sahih al-Bukhari, Sahih Muslim, Sunan Abi Dawud, Sunan al-Tirmidhi, Sunan Ibn Majah, and established scholarly works. Wording may differ across the four madhhabs (Hanafi, Maliki, Shafii, Hanbali). Consult a qualified scholar for rulings specific to your school of thought."}
            </Text>
          </View>

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
  emptyBody:    { fontSize:14, color:colors.subtext, textAlign:"center", lineHeight:22, marginBottom:spacing(2.5) },
  emptyBtn:     { backgroundColor:colors.primary ?? "#1E3D30", borderRadius:12, paddingHorizontal:20, paddingVertical:12 },
  emptyBtnTxt:  { fontSize:14, color:"#fff", fontWeight:"600" },
  footnote:     { marginHorizontal:spacing(2.5), marginTop:spacing(2), marginBottom:spacing(1), backgroundColor:"#F5EDD8", borderRadius:12, borderWidth:1, borderColor:"#E8D9B8", padding:14 },
  footnoteText: { fontSize:12, color:"#7A6030", lineHeight:18 },
  footnoteBold: { fontWeight:"600" },
});
