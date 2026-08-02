/**
 * DuaListScreen.jsx — Safar
 * Ornate sage header + individually-carded dua rows,
 * matching the row style from ToolsScreen.jsx / HubContainerScreen.jsx.
 *
 * Multi-stage lists (Hajj/Umrah, reached via the "Pilgrimage" tile) use
 * plain inline stage labels between groups — no image banners.
 */
import React from "react";
import {
  View, Text, ScrollView,
  TouchableOpacity, StyleSheet, Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CaretLeft, CaretRight } from "phosphor-react-native";
import HeaderPatternBg from "../HeaderPatternBg";
import { DUA_CONTENT } from "../dua-content";

const SERIF = "SourceSerif4-Regular";
const SW = Dimensions.get("window").width;

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
  scared:      { id: "scared",      name: "Feeling Scared" },
  nervous:     { id: "nervous",     name: "Feeling Nervous" },
  overwhelmed: { id: "overwhelmed", name: "Feeling Overwhelmed" },
  tired:       { id: "tired",       name: "Feeling Tired" },
  lazy:        { id: "lazy",        name: "Feeling Lazy" },
  bored:       { id: "bored",       name: "Feeling Bored" },
  sad:         { id: "sad",         name: "Feeling Sad" },
  depressed:   { id: "depressed",   name: "Feeling Depressed" },
  hurt:        { id: "hurt",        name: "Feeling Hurt" },
  lonely:      { id: "lonely",      name: "Feeling Lonely" },
  unloved:     { id: "unloved",     name: "Feeling Unloved" },
  regret:      { id: "regret",      name: "Feeling Regret" },
  angry:       { id: "angry",       name: "Feeling Angry" },
  impatient:   { id: "impatient",   name: "Feeling Impatient" },
  jealous:     { id: "jealous",     name: "Feeling Jealous" },
  greedy:      { id: "greedy",      name: "Feeling Greedy" },
  doubtful:    { id: "doubtful",    name: "Feeling Doubtful" },
  hypocritical:{ id: "hypocritical",name: "Feeling Hypocritical" },
  guilty:      { id: "guilty",      name: "Feeling Guilty" },
  indecisive:  { id: "indecisive",  name: "Feeling Indecisive" },
  weak:        { id: "weak",        name: "Feeling Weak" },
  confused:    { id: "confused",    name: "Feeling Confused" },
  content:     { id: "content",     name: "Feeling Content" },
  happy:       { id: "happy",       name: "Feeling Happy" },
  all:         { id: "all",         name: "All Duas" },
  mood:        { id: "mood",        name: "Mood Duas" },
};

// Stage → context line + Sacred Places site id (retained for future use)
const STAGE_CONTEXT = {
  "Ihram":       { context: "Before entering the Miqat boundary",                                 siteId: null },
  "Tawaf":       { context: "Circling the Kabah — seven circuits, beginning at the Black Stone", siteId: "kaaba" },
  "Say":         { context: "Walking between Safa and Marwah — seven lengths",                    siteId: "safa_marwa" },
  "Zamzam":      { context: "After Tawaf, at the Well of Zamzam",                                  siteId: "zamzam" },
  "Maqam":       { context: "At Maqam Ibrahim, after completing Tawaf",                            siteId: "maqam_ibrahim" },
  "Arafah":      { context: "Standing on the plain of Arafah — the heart of Hajj",                siteId: "arafah" },
  "Muzdalifah":  { context: "Spending the night at Muzdalifah after Arafah",                       siteId: "muzdalifah" },
  "Mina":        { context: "At Mina — stoning the Jamarat on the final days of Hajj",            siteId: "mina" },
  "Jamarat":     { context: "At Mina — stoning the Jamarat",                                      siteId: "mina" },
  "Farewell":    { context: "Before leaving Makkah",                                               siteId: null },
  "Madinah":     { context: "In Madinah, at the Prophet's Masjid",                                 siteId: null },
  "Entry":       { context: "Upon entering Masjid al-Haram",                                       siteId: "kaaba" },
};

function getStageContext(stage) {
  return STAGE_CONTEXT[stage] ?? { context: null, siteId: null };
}

// ── Individually-carded dua row ───────────────────────────────────────────────
function DuaCard({ dua, onPress }) {
  return (
    <TouchableOpacity style={card.row} activeOpacity={0.75} onPress={onPress}>
      <View style={card.info}>
        <View style={card.titleRow}>
          <Text style={card.title}>{dua.title}</Text>
        </View>
        <Text style={card.sub} numberOfLines={2}>
          {dua.subtitle ?? dua.translation ?? dua.stage}
        </Text>
      </View>
      <CaretRight size={18} color="#C8BFB2" weight="bold" />
      {dua.isFeatured ? (
        <View style={card.keyBadge}>
          <Text style={card.keyBadgeTxt}>KEY</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const card = StyleSheet.create({
  row:        { flexDirection:"row", alignItems:"center", paddingHorizontal:18, paddingVertical:16, backgroundColor:"#FDFAF4", borderRadius:16, marginHorizontal:16, marginBottom:12, borderWidth:1, borderColor:"#EDE4D4", shadowColor:"#2A1F0E", shadowOffset:{ width:0, height:2 }, shadowOpacity:0.08, shadowRadius:8, elevation:3 },
  info:       { flex:1, marginRight:10 },
  titleRow:   { flexDirection:"row", alignItems:"center", gap:8, marginBottom:4 },
  title:      { fontFamily:"SourceSerif4-SemiBold", fontSize:18, color:"#1C1A14", flexShrink:1 },
  sub:        { fontSize:13, color:"#5C534A", lineHeight:18 },
  keyBadge:   { position:"absolute", top:10, right:10, backgroundColor:"#B8922A", paddingHorizontal:7, paddingVertical:2, borderRadius:4 },
  keyBadgeTxt:{ fontSize:10, color:"#fff", fontWeight:"700" },
});

// Inline section label for multi-stage lists (text only, no image banner)
function StageLabel({ stage }) {
  const { context } = getStageContext(stage);
  return (
    <View style={sl.wrap}>
      <View style={sl.textCol}>
        <Text style={sl.stage}>{stage}</Text>
        {context ? <Text style={sl.context}>{context}</Text> : null}
      </View>
    </View>
  );
}

const sl = StyleSheet.create({
  wrap:    { flexDirection:"row", alignItems:"center", paddingHorizontal:20, paddingTop:18, paddingBottom:8 },
  textCol: { flex:1 },
  stage:   { fontFamily:"SourceSerif4-Bold", fontSize:24, color:"#1A1410", fontWeight:"600" },
  context: { fontSize:15, color:"#5C534A", marginTop:2, lineHeight:20 },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function DuaListScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  // category param (from theme/mood cards) takes priority; fallback to list param (from guide screens).
  const rawCat = route?.params?.category;
  const list = (rawCat ? CATEGORY_META[rawCat] : null) ?? route?.params?.list ?? null;

  if (!list?.id) {
    return (
      <View style={s.safe}>
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
      </View>
    );
  }

  const duas = DUA_CONTENT[list.id] ?? [];

  const stages = [];
  const grouped = {};
  duas.forEach(d => {
    const key = d.stage ?? "__flat__";
    if (!grouped[key]) { grouped[key] = []; stages.push(key); }
    grouped[key].push(d);
  });
  const isMultiStage = stages.length > 1 || (stages.length === 1 && stages[0] !== "__flat__");

  return (
    <View style={s.safe}>
      {/* Ornate sage header */}
      <View style={s.header}>
        <HeaderPatternBg width={SW} />
        <View style={[s.headerTopRow, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.8}>
            <CaretLeft size={20} color="#1A1410" weight="bold" />
          </TouchableOpacity>
        </View>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle} numberOfLines={1}>{list.name}</Text>
          <Text style={s.headerSub}>{duas.length}{" "}{duas.length === 1 ? "dua" : "duas"}</Text>
        </View>
      </View>

      {duas.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyTitle}>{"Coming soon"}</Text>
          <Text style={s.emptyBody}>
            {"Duas for “" + list.name + "” are being added.\nCheck back soon, or explore the Hajj & Umrah duas in the meantime."}
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
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop:14, paddingBottom:40 }}>
          {stages.map(stageKey => (
            <View key={stageKey}>
              {isMultiStage && stageKey !== "__flat__" ? (
                <StageLabel stage={stageKey} />
              ) : null}
              {grouped[stageKey].map(dua => (
                <DuaCard
                  key={dua.id}
                  dua={dua}
                  onPress={() => navigation.navigate("DuaDetail", {
                    dua,
                    allDuas: duas,
                    currentIndex: duas.indexOf(dua),
                  })}
                />
              ))}
            </View>
          ))}

          {/* Scholarly footnote */}
          <View style={s.footnote}>
            <Text style={s.footnoteText}>
              <Text style={s.footnoteBold}>Sources</Text>
              {" — Duas are drawn from Sahih al-Bukhari, Sahih Muslim, Sunan Abi Dawud, Sunan al-Tirmidhi, Sunan Ibn Majah, and established scholarly works. Wording may differ across the four madhhabs (Hanafi, Maliki, Shafii, Hanbali). Consult a qualified scholar for rulings specific to your school of thought."}
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex:1, backgroundColor:"#EDE6D8" },

  header: {
    backgroundColor: "#4A5C48",
    minHeight: 130,
    position: "relative",
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FDFAF4",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    alignItems: "center",
    marginTop: 16,
  },
  headerTitle: { fontFamily:SERIF, fontSize:28, color:"#FDFAF4", fontWeight:"400" },
  headerSub:   { fontSize:13, color:"#FDFAF4", marginTop:2, opacity:0.8 },

  empty:      { flex:1, alignItems:"center", justifyContent:"center", padding:24 },
  emptyTitle: { fontFamily:SERIF, fontSize:20, color:"#1A1410", marginBottom:8 },
  emptyBody:  { fontSize:14, color:"#8A7D6A", textAlign:"center", lineHeight:22, marginBottom:20 },
  emptyBtn:   { backgroundColor:"#4A5C48", borderRadius:12, paddingHorizontal:20, paddingVertical:12 },
  emptyBtnTxt:{ fontSize:14, color:"#fff", fontWeight:"600" },

  footnote:     { marginHorizontal:20, marginTop:8, marginBottom:8, backgroundColor:"#F5EDD8", borderRadius:12, borderWidth:1, borderColor:"#E8D9B8", padding:14 },
  footnoteText: { fontSize:12, color:"#7A6030", lineHeight:18 },
  footnoteBold: { fontWeight:"600" },
});
