/**
 * DuaListScreen.jsx — Safar
 * Shows a list of duas for a given category.
 * Accepts route.params.categoryId to look up from DUA_CATEGORIES,
 * or route.params.duas array for direct passing.
 */
import React from "react";
import {
  SafeAreaView, View, Text, ScrollView,
  TouchableOpacity, StyleSheet,
} from "react-native";
import { colors, spacing, radius, typography, shadows } from "../theme";
import { DUA_CATEGORIES } from "../duaLibrary";

const SERIF = "SourceSerif4-Regular";

const STAGE_ICONS = {
  "Ihram": "\uD83D\uDFE2", "Entry": "\uD83D\uDD4B", "Tawaf": "\uD83D\uDD4B",
  "Zamzam": "\uD83D\uDCA7", "Sa'y": "\uD83D\uDEB6", "Arafah": "\u26F0\uFE0F",
  "Muzdalifah": "\uD83C\uDF19", "Jamarat": "\uD83E\uDEA8", "Halq": "\u2702\uFE0F",
  "Qurbani": "\uD83D\uDC11", "Farewell": "\uD83D\uDC4B", "Mina": "\u26FA\uFE0F",
  "Salah": "\uD83E\uDD32", "Quranic": "\uD83D\uDCD6", "Gratitude": "\uD83E\uDD32",
  "Forgiveness": "\uD83D\uDD4A", "Guidance": "\uD83D\uDCCD",
  "Protection": "\uD83D\uDEE1", "Patience": "\uD83C\uDF31",
  "Provision": "\u2728", "General": "\uD83E\uDD32",
  "default": "\uD83E\uDD32",
};

function stageIcon(stage) { return STAGE_ICONS[stage] ?? STAGE_ICONS["default"]; }

function DuaRow({ dua, index, total, onPress }) {
  const isLast = index === total - 1;
  return (
    <TouchableOpacity
      style={isLast ? [row.wrap, row.wrapLast] : row.wrap}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={row.iconWrap}>
        <Text style={row.icon}>{stageIcon(dua.stage)}</Text>
      </View>
      <View style={row.info}>
        <Text style={row.title}>{dua.title}</Text>
        <Text style={row.sub} numberOfLines={1}>{dua.subtitle ?? dua.stage}</Text>
      </View>
      {dua.isFeatured ? (
        <View style={row.keyBadge}><Text style={row.keyBadgeTxt}>KEY</Text></View>
      ) : null}
      <Text style={row.chevron}>{"\u203a"}</Text>
    </TouchableOpacity>
  );
}

const row = StyleSheet.create({
  wrap:       { flexDirection:"row", alignItems:"center", paddingHorizontal:spacing(2), paddingVertical:spacing(1.75), gap:spacing(1.5), borderBottomWidth:1, borderBottomColor:colors.border, backgroundColor:colors.card },
  wrapLast:   { borderBottomWidth:0 },
  iconWrap:   { width:44, height:44, borderRadius:22, backgroundColor:colors.background, borderWidth:1, borderColor:colors.border, alignItems:"center", justifyContent:"center", flexShrink:0 },
  icon:       { fontSize:20 },
  info:       { flex:1 },
  title:      { fontFamily:SERIF, fontSize:16, color:colors.text, marginBottom:3, fontWeight:"400" },
  sub:        { fontSize:12, color:colors.subtext, fontWeight:"400" },
  keyBadge:   { backgroundColor:colors.accent, paddingHorizontal:spacing(0.875), paddingVertical:3, borderRadius:4, marginRight:spacing(0.5) },
  keyBadgeTxt:{ fontSize:10, color:"#fff", fontWeight:"700", letterSpacing:0.8 },
  chevron:    { fontSize:20, color:colors.border },
});

function StageDivider({ label }) {
  return (
    <View style={sd.wrap}><Text style={sd.label}>{label.toUpperCase()}</Text></View>
  );
}
const sd = StyleSheet.create({
  wrap:  { paddingHorizontal:spacing(2.5), paddingTop:spacing(2), paddingBottom:spacing(0.75) },
  label: { fontSize:11, fontWeight:"700", letterSpacing:1.5, color:colors.subtext },
});

export default function DuaListScreen({ route, navigation }) {
  // Support categoryId lookup OR direct duas array
  const { categoryId, duas: directDuas, title: directTitle } = route?.params ?? {};

  let duas = [];
  let listName = directTitle ?? "Du\u02bf\u0101s";

  if (directDuas) {
    duas = directDuas;
  } else if (categoryId) {
    const cat = DUA_CATEGORIES.find(c => c.id === categoryId);
    if (cat) { duas = cat.duas; listName = cat.name; }
  }

  // Group by stage
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
          <Text style={s.headerTitle} numberOfLines={1}>{listName}</Text>
          <Text style={s.headerSub}>{duas.length} {duas.length === 1 ? "du\u02bf\u0101\u02be" : "du\u02bf\u0101\u02bes"}</Text>
        </View>
        <View style={{ width:36 }} />
      </View>

      {duas.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>{"\uD83E\uDD32"}</Text>
          <Text style={s.emptyTitle}>No du\u02bf\u0101\u02bes yet</Text>
          <Text style={s.emptyBody}>This list is empty.</Text>
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
          <View style={{ height:spacing(5) }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex:1, backgroundColor:colors.background },
  header:      { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:spacing(2.5), paddingTop:spacing(2), paddingBottom:spacing(1.5), borderBottomWidth:1, borderBottomColor:colors.border, backgroundColor:colors.background },
  backBtn:     { width:36, height:36, borderRadius:18, backgroundColor:colors.card, borderWidth:1, borderColor:colors.border, alignItems:"center", justifyContent:"center" },
  backArrow:   { fontSize:22, color:colors.text, lineHeight:26 },
  headerCenter:{ flex:1, alignItems:"center", paddingHorizontal:spacing(1) },
  headerTitle: { fontFamily:SERIF, fontSize:18, color:colors.text },
  headerSub:   { fontSize:12, color:colors.subtext, marginTop:2 },
  card:        { marginHorizontal:spacing(2.5), backgroundColor:colors.card, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, overflow:"hidden", marginBottom:spacing(1), ...shadows.card },
  empty:       { flex:1, alignItems:"center", justifyContent:"center", padding:spacing(3) },
  emptyEmoji:  { fontSize:44, marginBottom:spacing(1.5) },
  emptyTitle:  { fontFamily:SERIF, fontSize:20, color:colors.text, marginBottom:spacing(1) },
  emptyBody:   { fontSize:14, color:colors.subtext, textAlign:"center", lineHeight:22 },
});

