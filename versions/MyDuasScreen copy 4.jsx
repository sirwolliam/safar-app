import React, { useState } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Image,
} from "react-native";
import { colors, spacing, radius, typography, shadows } from "../theme";

const SERIF = "SourceSerif4-Regular";

const MY_LISTS = [
  { id:"umrah",  name:"My Umrah Journey", count:18, updated:"2d ago", emoji:"🕋",  gradientBot:"#2A3C30" },
  { id:"family", name:"Duas for Family",  count:24, updated:"1w ago", emoji:"🌿",  gradientBot:"#5A7848" },
  { id:"daily",  name:"Daily Reminders",  count:32, updated:"3d ago", emoji:"🪴",  gradientBot:"#906830" },
  { id:"sleep",  name:"Before Sleep",     count:15, updated:"5d ago", emoji:"🌙",  gradientBot:"#0E1828" },
];

const LIBRARY_CATEGORIES = [
  { id:"gratitude", name:"Gratitude & Praise",  count:21, emoji:"🤲", shade:"#A8C8A0" },
  { id:"forgive",   name:"Forgiveness",          count:18, emoji:"🕊", shade:"#C8C4A0" },
  { id:"guidance",  name:"Guidance & Knowledge", count:23, emoji:"📖", shade:"#A8B8C8" },
  { id:"protect",   name:"Protection",           count:20, emoji:"🛡", shade:"#A8C8B8" },
  { id:"patience",  name:"Patience & Trust",     count:19, emoji:"🌱", shade:"#C8C090" },
  { id:"provision", name:"Provision & Rizq",     count:17, emoji:"✨", shade:"#B8C8A8" },
];

const FILTER_CHIPS = ["All", "By Theme", "By Occasion", "By Reference"];

export default function MyDuasScreen({ navigation }) {
  const [tab,          setTab]          = useState("myLists");
  const [view,         setView]         = useState("lists");
  const [activeFilter, setActiveFilter] = useState("By Theme");
  const [searchQuery,  setSearchQuery]  = useState("");

  return (
    <SafeAreaView style={s.safe}>

      {/* Hero image — full width at top */}
      {view === "lists" && (
        <Image
          source={require("../assets/duas2.png")}
          style={s.heroImage}
          resizeMode="cover"
        />
      )}

      {/* Sticky header — outside ScrollView, matches Journey pattern */}
      <View style={s.header}>
        <Text style={s.headerTitle}>
"My Du\u02bf\u0101\u02beS"
        </Text>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.addBtn}>
            <Text style={s.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* MY LISTS VIEW */}
        {(view === "lists" && tab !== "library") && (
          <>
            {/* 3-column tab buttons */}
            <View style={s.tabRow}>
              <TouchableOpacity
                style={tab === "myLists" ? [s.tabBtn, s.tabBtnActive] : s.tabBtn}
                onPress={() => setTab("myLists")} activeOpacity={0.8}>
                <Text style={tab === "myLists" ? [s.tabBtnLabel, s.tabBtnLabelActive] : s.tabBtnLabel}>My Lists</Text>
                <Text style={tab === "myLists" ? s.tabBtnSubActive : s.tabBtnSub}>Duas you{"’"}ve saved</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={tab === "library" ? [s.tabBtn, s.tabBtnActive] : s.tabBtn}
                onPress={() => { setTab("library"); setView("library"); }} activeOpacity={0.8}>
                <Text style={tab === "library" ? [s.tabBtnLabel, s.tabBtnLabelActive] : s.tabBtnLabel}>Library</Text>
                <Text style={tab === "library" ? s.tabBtnSubActive : s.tabBtnSub}>Browse all duas</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={tab === "shared" ? [s.tabBtn, s.tabBtnActive] : s.tabBtn}
                onPress={() => setTab("shared")} activeOpacity={0.8}>
                <Text style={tab === "shared" ? [s.tabBtnLabel, s.tabBtnLabelActive] : s.tabBtnLabel}>Shared</Text>
                <Text style={tab === "shared" ? s.tabBtnSubActive : s.tabBtnSub}>From your groups</Text>
              </TouchableOpacity>
            </View>

            {/* List rows */}
            <View style={s.listContainer}>
              {MY_LISTS.map((list, idx) => (
                <TouchableOpacity
                  key={list.id}
                  style={idx < MY_LISTS.length - 1 ? [s.listRow, s.listRowBorder] : s.listRow}
                  onPress={() => navigation?.navigate?.("DuaList", { list })}
                  activeOpacity={0.8}
                >
                  <View style={[s.listThumb, { backgroundColor: list.gradientBot }]}>
                    <Text style={s.listThumbEmoji}>{list.emoji}</Text>
                  </View>
                  <View style={s.listInfo}>
                    <Text style={s.listName}>{list.name}</Text>
                    <Text style={s.listMeta}>{list.count} duas · Updated {list.updated}</Text>
                  </View>
                  <Text style={s.listArrow}>{"\u203a"}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={s.newListBtn} activeOpacity={0.85}>
              <Text style={s.newListBtnText}>+ Create new list</Text>
            </TouchableOpacity>
          </>
        )}

        {/* LIBRARY VIEW */}
        {view === "library" && (
          <>
            <View style={s.searchBar}>
              <Text style={s.searchIcon}>{"\uD83D\uDD0D"}</Text>
              <TextInput
                style={s.searchInput}
                placeholder="Search duas…"
                placeholderTextColor={colors.subtext}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity>
                <Text style={s.filterIcon}>{"\u229F"}</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
              {FILTER_CHIPS.map((chip) => (
                <TouchableOpacity
                  key={chip}
                  style={activeFilter === chip ? [s.filterChip, s.filterChipActive] : s.filterChip}
                  onPress={() => setActiveFilter(chip)}
                  activeOpacity={0.8}
                >
                  <Text style={activeFilter === chip ? [s.filterChipText, s.filterChipTextActive] : s.filterChipText}>{chip}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={s.categoryGrid}>
              {LIBRARY_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[s.categoryCard, { backgroundColor: cat.shade + "55" }]}
                  activeOpacity={0.85}
                >
                  <View style={[s.catImage, { backgroundColor: cat.shade }]}>
                    <Text style={s.catEmoji}>{cat.emoji}</Text>
                  </View>
                  <View style={s.catBody}>
                    <Text style={s.catName}>{cat.name}</Text>
                    <Text style={s.catCount}>{cat.count} duas</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <View style={{ height: spacing(4) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex:1, backgroundColor:colors.background },
  heroImage: { width:"100%", height:225 },
  scroll:    { paddingHorizontal:spacing(2.5), paddingTop:spacing(0.5) },

  header: {
    flexDirection:"row", alignItems:"center", justifyContent:"space-between",
    paddingHorizontal: spacing(2.5),
    paddingTop: spacing(2),
    paddingBottom: spacing(1.5),
    backgroundColor: colors.background,
  },
  headerTitle:    { fontFamily:SERIF, fontSize:26, fontWeight:"400", color:colors.text },
  headerRight:    { flexDirection:"row", alignItems:"center", gap:spacing(1) },
  libraryLink:    { paddingHorizontal:spacing(1.5), paddingVertical:spacing(0.5), borderRadius:radius.sm, borderWidth:1, borderColor:colors.border },
  libraryLinkText:{ fontSize:typography.small, color:colors.subtext, fontWeight:"400" },
  addBtn:         { width:34, height:34, borderRadius:17, backgroundColor:colors.primary, alignItems:"center", justifyContent:"center", ...shadows.button },
  addBtnText:     { fontSize:22, color:colors.card, lineHeight:26, fontWeight:"300" },
  backBtnText:    { fontSize:typography.small, color:colors.primary, fontWeight:"400" },

  // 3-column tab buttons
  tabRow:            { flexDirection:"row", gap:spacing(1), marginBottom:spacing(2) },
  tabBtn:            { flex:1, backgroundColor:colors.card, borderRadius:radius.md, borderWidth:1, borderColor:colors.border, padding:spacing(1.5), alignItems:"center", gap:3 },
  tabBtnActive:      { backgroundColor:colors.primary, borderColor:colors.primary },
  tabBtnLabel:       { fontFamily:SERIF, fontSize:typography.small, color:colors.text, fontWeight:"400" },
  tabBtnLabelActive: { color:"#fff", fontWeight:"500" },
  tabBtnSub:         { fontSize:9, color:colors.subtext, textAlign:"center", lineHeight:13 },
  tabBtnSubActive:   { fontSize:9, color:"rgba(255,255,255,0.75)", textAlign:"center", lineHeight:13 },

  // Tall card segment — matches Journey Umrah/Hajj buttons
  segmentCtrl: {
    flexDirection:"row", gap:spacing(1.25), marginBottom:spacing(2),
  },
  segOpt: {
    flex:1, paddingVertical:spacing(2.5),
    borderRadius:radius.md, alignItems:"center", justifyContent:"center", gap:6,
    backgroundColor:colors.background, borderWidth:1.5, borderColor:colors.border,
  },
  segOptActive: { borderColor:colors.primary, backgroundColor:"rgba(47,93,80,0.06)" },
  segIcon:      { fontSize:24 },
  segLabel:     { fontFamily:SERIF, fontSize:typography.body, color:colors.subtext, fontWeight:"400" },
  segLabelActive:{ color:colors.primary, fontWeight:"500" },

  // List rows
  listContainer: { backgroundColor:colors.card, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, overflow:"hidden", marginBottom:spacing(2), ...shadows.card },
  listRow:       { flexDirection:"row", alignItems:"center", paddingHorizontal:spacing(2), paddingVertical:spacing(1.75), gap:spacing(1.5) },
  listRowBorder: { borderBottomWidth:1, borderBottomColor:colors.border },
  listThumb:     { width:54, height:54, borderRadius:radius.md, alignItems:"center", justifyContent:"center", flexShrink:0 },
  listThumbEmoji:{ fontSize:24 },
  listInfo:      { flex:1 },
  listName:      { fontFamily:SERIF, fontSize:typography.body, fontWeight:"500", color:colors.text, marginBottom:3 },
  listMeta:      { fontSize:typography.small, color:colors.subtext, fontWeight:"300" },
  listArrow:     { fontSize:18, color:colors.border },

  newListBtn:    { borderRadius:radius.md, borderWidth:1.5, borderColor:colors.border, borderStyle:"dashed", paddingVertical:spacing(2), alignItems:"center", marginBottom:spacing(2) },
  newListBtnText:{ fontFamily:SERIF, fontSize:typography.body, color:colors.subtext, fontWeight:"300" },

  // Search / Library
  searchBar:    { flexDirection:"row", alignItems:"center", backgroundColor:colors.card, borderRadius:radius.md, paddingHorizontal:spacing(2), paddingVertical:spacing(1.25), gap:spacing(1), borderWidth:1, borderColor:colors.border, marginBottom:spacing(1.5), ...shadows.card },
  searchIcon:   { fontSize:14, color:colors.subtext },
  searchInput:  { flex:1, fontSize:typography.body, color:colors.text, fontWeight:"300", padding:0 },
  filterIcon:   { fontSize:15, color:colors.subtext },
  filterRow:    { gap:spacing(1), paddingBottom:spacing(2) },
  filterChip:   { paddingHorizontal:spacing(2), paddingVertical:spacing(0.75), borderRadius:radius.pill, borderWidth:1, borderColor:colors.border, backgroundColor:"transparent" },
  filterChipActive:    { backgroundColor:colors.primary, borderColor:colors.primary },
  filterChipText:      { fontSize:typography.small, color:colors.subtext, fontWeight:"300" },
  filterChipTextActive:{ color:colors.card, fontWeight:"400" },

  categoryGrid: { flexDirection:"row", flexWrap:"wrap", gap:spacing(1.25) },
  categoryCard: { width:"47.5%", borderRadius:radius.md, overflow:"hidden", borderWidth:1, borderColor:colors.border, ...shadows.card },
  catImage:     { height:80, alignItems:"center", justifyContent:"center" },
  catEmoji:     { fontSize:30, opacity:0.85 },
  catBody:      { padding:spacing(1.25), backgroundColor:colors.card },
  catName:      { fontFamily:SERIF, fontSize:typography.small, fontWeight:"500", color:colors.text, lineHeight:typography.small*1.4, marginBottom:2 },
  catCount:     { fontSize:typography.tiny, color:colors.subtext, fontWeight:"300" },
});
