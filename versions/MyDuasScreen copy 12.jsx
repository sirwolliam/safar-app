import React, { useState } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Image, Modal, KeyboardAvoidingView, Platform,
} from "react-native";
import { colors, spacing, radius, typography, shadows } from "../theme";

const SERIF = "SourceSerif4-Regular";

const MY_LISTS = [
  { id:"umrah",  name:"My Umrah Journey", count:18, updated:"2d ago", emoji:"\uD83D\uDD4B", gradientBot:"#2A3C30" },
  { id:"family", name:"Duas for Family",  count:24, updated:"1w ago", emoji:"\uD83C\uDF3F", gradientBot:"#5A7848" },
  { id:"daily",  name:"Daily Reminders",  count:32, updated:"3d ago", emoji:"\uD83E\uDEB4", gradientBot:"#906830" },
  { id:"sleep",  name:"Before Sleep",     count:15, updated:"5d ago", emoji:"\uD83C\uDF19", gradientBot:"#0E1828" },
];

const SHARED_DUAS = [
  { id:"s1", name:"Ahmed\u2019s Tawaf List",    sharedBy:"Ahmed Al-Rashid",      count:6,  updated:"1d ago", emoji:"\uD83D\uDD4B" },
  { id:"s2", name:"Fatima\u2019s Morning Duas", sharedBy:"Fatima Hassan",         count:12, updated:"3d ago", emoji:"\uD83C\uDF05" },
  { id:"s3", name:"Group Pilgrimage Duas",      sharedBy:"Our Pilgrimage Family", count:9,  updated:"5d ago", emoji:"\uD83E\uDD32" },
];

const LIBRARY_CATEGORIES = [
  { id:"gratitude",  name:"Gratitude & Praise",    count:21, emoji:"\uD83E\uDD32", shade:"#A8C8A0", img:require("../assets/cat_gratitude.jpg") },
  { id:"forgive",    name:"Forgiveness",            count:18, emoji:"\uD83D\uDC4F", shade:"#C8C4A0", img:require("../assets/cat_forgive.jpg") },
  { id:"guidance",   name:"Guidance & Knowledge",   count:23, emoji:"\uD83D\uDCD6", shade:"#A8B8C8", img:require("../assets/cat_guidance.jpg") },
  { id:"protect",    name:"Protection",             count:20, emoji:"\uD83D\uDEE1\uFE0F", shade:"#A8C8B8", img:require("../assets/cat_protect.jpg") },
  { id:"patience",   name:"Patience & Strength",    count:19, emoji:"\uD83C\uDF31", shade:"#C8C090", img:require("../assets/cat_patience.jpg") },
  { id:"provision",  name:"Provision & Rizq",       count:17, emoji:"\u2728",        shade:"#B8C8A8", img:require("../assets/cat_provision.jpg") },
  { id:"healing",    name:"Healing & Health",       count:14, emoji:"\uD83E\uDE79", shade:"#C8A8A8", img:require("../assets/cat_healing2.jpg") },
  { id:"anxiety",    name:"Anxiety & Worry",        count:16, emoji:"\uD83D\uDE4F", shade:"#B8B8C8", img:require("../assets/cat_anxiety2.jpg") },
  { id:"travel",     name:"Travel & Safety",        count:12, emoji:"\uD83D\uDEEB", shade:"#C8D4A8", img:require("../assets/cat_travel2.jpg") },
  { id:"morning",    name:"Morning & Evening",      count:22, emoji:"\uD83C\uDF05", shade:"#F0D8A8", img:require("../assets/cat_morning.jpg") },
  { id:"parents",    name:"Parents & Family",       count:11, emoji:"\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67", shade:"#D4B8C8", img:require("../assets/cat_parents.jpg") },
  { id:"repentance", name:"Repentance & Tawbah",    count:13, emoji:"\uD83C\uDF3A", shade:"#C8C8A0", img:require("../assets/cat_repentance.jpg") },
  { id:"salah",      name:"Prayer & Salah",         count:15, emoji:"\uD83D\uDCFF", shade:"#A8C0C8", img:require("../assets/cat_salah2.jpg") },
  { id:"quran",      name:"Quranic Duas",           count:28, emoji:"\uD83D\uDCD6", shade:"#A8B4C0", img:require("../assets/cat_guidance2.jpg") },
  { id:"hajj",       name:"Hajj & Umrah",           count:31, emoji:"\uD83D\uDD4B", shade:"#B4C4A8", img:require("../assets/cat_hajj2.jpg") },
  { id:"entering",   name:"Entering & Leaving",     count:10, emoji:"\uD83D\uDEAA", shade:"#C4B8A8", img:require("../assets/cat_entering.jpg") },
];

const FILTER_CHIPS = ["All", "Worship", "Daily Life", "Hajj & Umrah", "Quran"];
const THEME_MAP = {
  "Worship":      ["salah","quran","repentance"],
  "Daily Life":   ["morning","travel","anxiety","healing","parents","entering","provision"],
  "Hajj & Umrah": ["hajj","protect","patience","gratitude","forgive"],
  "Quran":        ["quran","gratitude","guidance"],
};

// ── Tab bar ───────────────────────────────────────────────────────────────────
function TabBar({ active, onSelect }) {
  return (
    <View style={tb.row}>
      {[
        { key:"myLists", label:"My Dua Lists", sub:"Your saved lists", icon:"\uD83D\uDCDD" },
        { key:"library", label:"Dua Library",  sub:"Browse all duas",  icon:"\uD83D\uDCD6" },
        { key:"shared",  label:"Shared",       sub:"Shared with me",   icon:"\uD83E\uDD32" },
      ].map(t => (
        <TouchableOpacity key={t.key}
          style={active === t.key ? [tb.btn, tb.btnOn] : tb.btn}
          onPress={() => onSelect(t.key)} activeOpacity={0.8}>
          <Text style={tb.icon}>{t.icon}</Text>
          <Text style={active === t.key ? [tb.label, tb.labelOn] : tb.label}>{t.label}</Text>
          <Text style={active === t.key ? [tb.sub, tb.subOn] : tb.sub}>{t.sub}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const tb = StyleSheet.create({
  row:    { flexDirection:"row", gap:spacing(1), paddingHorizontal:spacing(2.5), paddingBottom:spacing(1.5) },
  btn:    { flex:1, backgroundColor:"#EBF2EE", borderRadius:radius.md, borderWidth:1.5, borderColor:"#C8DDD0", paddingVertical:spacing(2), paddingHorizontal:spacing(1), alignItems:"center", gap:5 },
  btnOn:  { backgroundColor:"#4A8A6A", borderColor:"#4A8A6A" },
  icon:   { fontSize:22 },
  label:  { fontFamily:SERIF, fontSize:13, color:colors.text, textAlign:"center", lineHeight:17 },
  labelOn:{ color:"#fff", fontWeight:"600" },
  sub:    { fontSize:10, color:colors.subtext, textAlign:"center", lineHeight:14 },
  subOn:  { color:"rgba(255,255,255,0.85)" },
});

// ── New list modal ────────────────────────────────────────────────────────────
function NewListModal({ visible, onClose }) {
  const [name, setName] = useState("");
  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==="ios"?"padding":"height"}>
        <View style={nl.overlay}>
          <View style={nl.sheet}>
            <View style={nl.handle}/>
            <Text style={nl.title}>Create new list</Text>
            <Text style={nl.sub}>Give your list a name to get started</Text>
            <TextInput style={nl.input} placeholder="e.g. Hajj Journey Duas"
              placeholderTextColor={colors.subtext} value={name} onChangeText={setName}
              autoFocus returnKeyType="done"/>
            <View style={nl.btnRow}>
              <TouchableOpacity style={nl.cancelBtn} onPress={() => { setName(""); onClose(); }}>
                <Text style={nl.cancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={!name.trim() ? [nl.createBtn, { opacity:0.4 }] : nl.createBtn}
                onPress={() => { setName(""); onClose(); }} disabled={!name.trim()}>
                <Text style={nl.createTxt}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const nl = StyleSheet.create({
  overlay:   { flex:1, backgroundColor:"rgba(0,0,0,0.4)", justifyContent:"flex-end" },
  sheet:     { backgroundColor:"#D4E4DC", borderTopLeftRadius:24, borderTopRightRadius:24, padding:spacing(2.5), paddingBottom:spacing(5) },
  handle:    { width:36, height:4, borderRadius:2, backgroundColor:"rgba(47,93,80,0.3)", alignSelf:"center", marginBottom:spacing(1.5) },
  title:     { fontFamily:SERIF, fontSize:20, color:colors.text, marginBottom:4 },
  sub:       { fontSize:typography.small, color:colors.subtext, marginBottom:spacing(1.5) },
  input:     { backgroundColor:colors.card, borderRadius:radius.md, borderWidth:1, borderColor:colors.border, padding:spacing(1.75), fontSize:typography.body, color:colors.text, marginBottom:spacing(2) },
  btnRow:    { flexDirection:"row", gap:spacing(1.25) },
  cancelBtn: { flex:1, borderRadius:radius.md, borderWidth:1, borderColor:colors.border, paddingVertical:spacing(1.75), alignItems:"center", backgroundColor:colors.card },
  cancelTxt: { fontSize:typography.body, color:colors.text },
  createBtn: { flex:1, borderRadius:radius.md, backgroundColor:colors.primary, paddingVertical:spacing(1.75), alignItems:"center" },
  createTxt: { fontSize:typography.body, color:"#fff", fontWeight:"600" },
});

// ── Add a Dua modal ───────────────────────────────────────────────────────────
function AddDuaModal({ visible, onClose, onSave }) {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==="ios"?"padding":"height"}>
        <View style={ad.overlay}>
          <View style={ad.sheet}>
            <View style={ad.handle}/>
            <Text style={ad.title}>Add a Dua</Text>
            <Text style={ad.sub}>Save your own dua or paste a dua request</Text>
            <Text style={ad.fieldLabel}>Title (optional)</Text>
            <TextInput
              style={ad.inputSm}
              placeholder="e.g. Dua for my family"
              placeholderTextColor={colors.subtext}
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
            />
            <Text style={ad.fieldLabel}>Dua text</Text>
            <TextInput
              style={ad.inputLg}
              placeholder="Type or paste your dua here..."
              placeholderTextColor={colors.subtext}
              value={text}
              onChangeText={setText}
              multiline
              textAlignVertical="top"
              autoFocus
            />
            <View style={ad.btnRow}>
              <TouchableOpacity style={ad.cancelBtn} onPress={() => { setText(""); setTitle(""); onClose(); }}>
                <Text style={ad.cancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={!text.trim() ? [ad.saveBtn, { opacity:0.4 }] : ad.saveBtn}
                onPress={() => { if (text.trim()) { onSave(title.trim() || text.trim()); setText(""); setTitle(""); } }}
                disabled={!text.trim()}>
                <Text style={ad.saveTxt}>Save Dua</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const ad = StyleSheet.create({
  overlay:    { flex:1, backgroundColor:"rgba(0,0,0,0.4)", justifyContent:"flex-end" },
  sheet:      { backgroundColor:"#D4E4DC", borderTopLeftRadius:24, borderTopRightRadius:24, padding:spacing(2.5), paddingBottom:spacing(5) },
  handle:     { width:36, height:4, borderRadius:2, backgroundColor:"rgba(47,93,80,0.3)", alignSelf:"center", marginBottom:spacing(1.5) },
  title:      { fontFamily:SERIF, fontSize:20, color:colors.text, marginBottom:4 },
  sub:        { fontSize:13, color:colors.subtext, fontWeight:"300", marginBottom:spacing(2) },
  fieldLabel: { fontSize:11, fontWeight:"700", letterSpacing:1.4, color:colors.subtext, marginBottom:spacing(0.75) },
  inputSm:    { backgroundColor:colors.card, borderRadius:radius.md, borderWidth:1, borderColor:colors.border, padding:spacing(1.75), fontSize:typography.body, color:colors.text, marginBottom:spacing(1.75) },
  inputLg:    { backgroundColor:colors.card, borderRadius:radius.md, borderWidth:1, borderColor:colors.border, padding:spacing(1.75), fontSize:typography.body, color:colors.text, marginBottom:spacing(2), minHeight:120 },
  btnRow:     { flexDirection:"row", gap:spacing(1.25) },
  cancelBtn:  { flex:1, borderRadius:radius.md, borderWidth:1, borderColor:colors.border, paddingVertical:spacing(1.75), alignItems:"center", backgroundColor:colors.card },
  cancelTxt:  { fontSize:typography.body, color:colors.text },
  saveBtn:    { flex:1, borderRadius:radius.md, backgroundColor:colors.primary, paddingVertical:spacing(1.75), alignItems:"center" },
  saveTxt:    { fontSize:typography.body, color:"#fff", fontWeight:"600" },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function MyDuasScreen({ navigation }) {
  const [activeTab,    setActiveTab]    = useState("myLists");
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery,  setSearchQuery]  = useState("");
  const [showNewList,  setShowNewList]  = useState(false);
  const [showAddDua,        setShowAddDua]        = useState(false);
  const [customDuas,        setCustomDuas]        = useState([]);
  const [showAddSharedDua,  setShowAddSharedDua]  = useState(false);
  const [sharedCustomDuas,  setSharedCustomDuas]  = useState([]);

  const visibleCats = LIBRARY_CATEGORIES.filter(cat => {
    const matchesFilter = activeFilter === "All" || (THEME_MAP[activeFilter] ?? []).includes(cat.id);
    const matchesSearch = !searchQuery || cat.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <SafeAreaView style={s.safe}>

      {/* Hero — only on My Lists tab */}
      {activeTab === "myLists" && (
        <Image source={require("../assets/duas2.png")} style={s.hero} resizeMode="cover"/>
      )}

      {/* Sticky header — + button only on My Lists tab */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.headerTitle}>My Duas</Text>
          <Text style={s.headerSub}>Your personal collection of duas</Text>
        </View>
        {activeTab === "myLists" ? (
          <TouchableOpacity style={s.addBtn} onPress={() => setShowNewList(true)} activeOpacity={0.85}>
            <Text style={s.addBtnTxt}>+</Text>
          </TouchableOpacity>
        ) : <View style={{ width:34 }} />}
      </View>

      {/* Tab bar */}
      <TabBar active={activeTab} onSelect={setActiveTab}/>

      {/* ── My Dua Lists ── */}
      {activeTab === "myLists" && (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* Existing lists */}
          <View style={s.listContainer}>
            {MY_LISTS.map((list, idx) => (
              <TouchableOpacity key={list.id}
                style={idx < MY_LISTS.length - 1 ? [s.listRow, s.listRowBorder] : s.listRow}
                onPress={() => navigation.navigate("DuaList", { list })}
                activeOpacity={0.8}>
                <View style={[s.listThumb, { backgroundColor:list.gradientBot }]}>
                  <Text style={s.listThumbEmoji}>{list.emoji}</Text>
                </View>
                <View style={s.listInfo}>
                  <Text style={s.listName}>{list.name}</Text>
                  <Text style={s.listMeta}>{list.count} duas  {"\u00b7"}  Updated {list.updated}</Text>
                </View>
                <Text style={s.listArrow}>{"\u203a"}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom saved duas */}
          {customDuas.length > 0 && (
            <View style={s.listContainer}>
              {customDuas.map((dua, idx) => (
                <View key={dua.id}
                  style={idx < customDuas.length - 1 ? [s.listRow, s.listRowBorder] : s.listRow}>
                  <View style={[s.listThumb, { backgroundColor:colors.primary }]}>
                    <Text style={s.listThumbEmoji}>{"\uD83E\uDD32"}</Text>
                  </View>
                  <View style={s.listInfo}>
                    <Text style={s.listName} numberOfLines={2}>{dua.text}</Text>
                    <Text style={s.listMeta}>Added {dua.added}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Add a Dua card */}
          <TouchableOpacity style={s.addDuaCard} onPress={() => setShowAddDua(true)} activeOpacity={0.85}>
            <View style={s.addDuaIconWrap}>
              <Text style={s.addDuaIcon}>+</Text>
            </View>
            <View style={s.addDuaInfo}>
              <Text style={s.addDuaTitle}>Add a Dua</Text>
              <Text style={s.addDuaSub}>Save your own dua or paste a dua request</Text>
            </View>
            <Text style={s.listArrow}>{"\u203a"}</Text>
          </TouchableOpacity>

          {/* Create new list */}
          <TouchableOpacity style={s.newListBtn} onPress={() => setShowNewList(true)} activeOpacity={0.85}>
            <Text style={s.newListBtnTxt}>+ Create new list</Text>
          </TouchableOpacity>

          <View style={{ height:spacing(4) }}/>
        </ScrollView>
      )}

      {/* ── Dua Library ── */}
      {activeTab === "library" && (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Library title */}
          <View style={s.tabPageHeader}>
            <Text style={s.tabPageTitle}>Dua Library</Text>
            <Text style={s.tabPageSub}>A wide collection of duas for every moment of your journey</Text>
          </View>

          {/* Search */}
          <View style={s.searchBar}>
            <Text style={s.searchIcon}>{"\uD83D\uDD0D"}</Text>
            <TextInput style={s.searchInput} placeholder="Search categories..."
              placeholderTextColor={colors.subtext} value={searchQuery} onChangeText={setSearchQuery}/>
            {searchQuery.length > 0 ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Text style={{ fontSize:16, color:colors.subtext }}>{"\u2715"}</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Filter chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
            {FILTER_CHIPS.map(chip => (
              <TouchableOpacity key={chip}
                style={activeFilter === chip ? [s.filterChip, s.filterChipOn] : s.filterChip}
                onPress={() => setActiveFilter(chip)} activeOpacity={0.8}>
                <Text style={activeFilter === chip ? [s.filterChipTxt, s.filterChipTxtOn] : s.filterChipTxt}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {visibleCats.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>{"\uD83D\uDD0D"}</Text>
              <Text style={s.emptyTitle}>No categories found</Text>
              <Text style={s.emptyBody}>Try a different search or filter.</Text>
            </View>
          ) : (
            <View style={s.categoryGrid}>
              {visibleCats.map(cat => (
                <TouchableOpacity key={cat.id}
                  style={[s.categoryCard, { backgroundColor:cat.shade + "55" }]}
                  onPress={() => navigation.navigate("DuaList", {
                    list:{ id:cat.id, name:cat.name, count:cat.count, emoji:cat.emoji, gradientBot:cat.shade }
                  })}
                  activeOpacity={0.85}>
                  {cat.img ? (
                    <Image source={cat.img} style={s.catImage} resizeMode="cover"/>
                  ) : (
                    <View style={[s.catImage, { backgroundColor:cat.shade }]}>
                      <Text style={s.catEmoji}>{cat.emoji}</Text>
                    </View>
                  )}
                  <View style={s.catBody}>
                    <Text style={s.catName}>{cat.name}</Text>
                    <Text style={s.catCount}>{cat.count} duas</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <View style={{ height:spacing(4) }}/>
        </ScrollView>
      )}

      {/* ── Shared Duas ── */}
      {activeTab === "shared" && (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* Shared title */}
          <View style={s.tabPageHeader}>
            <Text style={s.tabPageTitle}>Shared Duas</Text>
            <Text style={s.tabPageSub}>Duas shared with me from groups and contacts</Text>
          </View>

          {SHARED_DUAS.length === 0 && sharedCustomDuas.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>{"\uD83E\uDD32"}</Text>
              <Text style={s.emptyTitle}>Nothing shared yet</Text>
              <Text style={s.emptyBody}>When group members share dua lists with you, they will appear here.</Text>
            </View>
          ) : (
            <View style={s.listContainer}>
              {SHARED_DUAS.map((item, idx) => (
                <TouchableOpacity key={item.id}
                  style={idx < SHARED_DUAS.length - 1 || sharedCustomDuas.length > 0 ? [s.listRow, s.listRowBorder] : s.listRow}
                  onPress={() => navigation.navigate("DuaList", {
                    list:{ id:item.id, name:item.name, count:item.count, emoji:item.emoji, gradientBot:"#2A3C30" }
                  })}
                  activeOpacity={0.8}>
                  <View style={[s.listThumb, { backgroundColor:"#3A6B50" }]}>
                    <Text style={s.listThumbEmoji}>{item.emoji}</Text>
                  </View>
                  <View style={s.listInfo}>
                    <Text style={s.listName}>{item.name}</Text>
                    <Text style={s.listMeta}>{item.count} duas  {"\u00b7"}  {item.updated}</Text>
                  </View>
                  <Text style={s.listArrow}>{"\u203a"}</Text>
                </TouchableOpacity>
              ))}
              {sharedCustomDuas.map((dua, idx) => (
                <View key={dua.id}
                  style={idx < sharedCustomDuas.length - 1 ? [s.listRow, s.listRowBorder] : s.listRow}>
                  <View style={[s.listThumb, { backgroundColor:colors.primary }]}>
                    <Text style={s.listThumbEmoji}>{"\uD83E\uDD32"}</Text>
                  </View>
                  <View style={s.listInfo}>
                    <Text style={s.listName} numberOfLines={2}>{dua.text}</Text>
                    <Text style={s.listMeta}>Added {dua.added}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Add a Dua card */}
          <TouchableOpacity style={s.addDuaCard} onPress={() => setShowAddSharedDua(true)} activeOpacity={0.85}>
            <View style={s.addDuaIconWrap}>
              <Text style={s.addDuaIcon}>+</Text>
            </View>
            <View style={s.addDuaInfo}>
              <Text style={s.addDuaTitle}>Add a Dua</Text>
              <Text style={s.addDuaSub}>Save your own dua or paste a dua request</Text>
            </View>
            <Text style={s.listArrow}>{"\u203a"}</Text>
          </TouchableOpacity>

          <View style={{ height:spacing(4) }}/>
        </ScrollView>
      )}

      {/* Modals */}
      <NewListModal visible={showNewList} onClose={() => setShowNewList(false)}/>
      <AddDuaModal
        visible={showAddDua}
        onClose={() => setShowAddDua(false)}
        onSave={(text) => {
          setCustomDuas(prev => [...prev, { id:Date.now().toString(), text, added:"just now" }]);
          setShowAddDua(false);
        }}
      />
      <AddDuaModal
        visible={showAddSharedDua}
        onClose={() => setShowAddSharedDua(false)}
        onSave={(text) => {
          setSharedCustomDuas(prev => [...prev, { id:Date.now().toString(), text, added:"just now" }]);
          setShowAddSharedDua(false);
        }}
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:        { flex:1, backgroundColor:colors.background },
  hero:        { width:"100%", height:225 },

  // Header
  header:      { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:spacing(2.5), paddingTop:spacing(2), paddingBottom:spacing(1.25), backgroundColor:colors.background },
  headerLeft:  { flex:1 },
  headerTitle: { fontFamily:SERIF, fontSize:26, fontWeight:"400", color:colors.text },
  headerSub:   { fontSize:14, color:colors.subtext, fontWeight:"300", marginTop:1 },
  addBtn:      { width:34, height:34, borderRadius:17, backgroundColor:colors.primary, alignItems:"center", justifyContent:"center" },
  addBtnTxt:   { fontSize:22, color:"#fff", lineHeight:26, fontWeight:"300" },

  scroll: { paddingHorizontal:spacing(2.5), paddingTop:spacing(1.25) },

  // Tab page title blocks
  tabPageHeader: { marginBottom:spacing(2) },
  tabPageTitle:  { fontFamily:SERIF, fontSize:22, fontWeight:"400", color:colors.text, marginBottom:4 },
  tabPageSub:    { fontSize:13, color:colors.subtext, fontWeight:"300", lineHeight:18 },

  // List rows
  listContainer: { backgroundColor:colors.card, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, overflow:"hidden", marginBottom:spacing(2), ...shadows.card },
  listRow:       { flexDirection:"row", alignItems:"center", paddingHorizontal:spacing(2), paddingVertical:spacing(2), gap:spacing(1.5) },
  listRowBorder: { borderBottomWidth:1, borderBottomColor:colors.border },
  listThumb:     { width:52, height:52, borderRadius:radius.md, alignItems:"center", justifyContent:"center", flexShrink:0 },
  listThumbEmoji:{ fontSize:24 },
  listInfo:      { flex:1 },
  listName:      { fontFamily:SERIF, fontSize:17, fontWeight:"500", color:colors.text, marginBottom:3 },
  listMeta:      { fontSize:13, color:colors.subtext, fontWeight:"300" },
  listArrow:     { fontSize:20, color:colors.border },

  // Add a Dua card
  addDuaCard:    { flexDirection:"row", alignItems:"center", backgroundColor:"#EBF2EE", borderRadius:radius.lg, borderWidth:1.5, borderColor:"#C8DDD0", paddingHorizontal:spacing(2), paddingVertical:spacing(2), gap:spacing(1.5), marginBottom:spacing(2) },
  addDuaIconWrap:{ width:52, height:52, borderRadius:radius.md, backgroundColor:colors.primary, alignItems:"center", justifyContent:"center", flexShrink:0 },
  addDuaIcon:    { fontSize:28, color:"#fff", fontWeight:"300", lineHeight:34 },
  addDuaInfo:    { flex:1 },
  addDuaTitle:   { fontFamily:SERIF, fontSize:17, fontWeight:"500", color:colors.text, marginBottom:3 },
  addDuaSub:     { fontSize:13, color:colors.subtext, fontWeight:"300" },

  // Create new list button
  newListBtn:    { borderRadius:radius.md, borderWidth:1.5, borderColor:colors.border, borderStyle:"dashed", paddingVertical:spacing(2.25), alignItems:"center", marginBottom:spacing(2) },
  newListBtnTxt: { fontFamily:SERIF, fontSize:typography.body, color:colors.subtext, fontWeight:"300" },

  // Library
  searchBar:       { flexDirection:"row", alignItems:"center", backgroundColor:colors.card, borderRadius:radius.md, paddingHorizontal:spacing(2), paddingVertical:spacing(1.25), gap:spacing(1), borderWidth:1, borderColor:colors.border, marginBottom:spacing(1.5), ...shadows.card },
  searchIcon:      { fontSize:14, color:colors.subtext },
  searchInput:     { flex:1, fontSize:typography.body, color:colors.text, fontWeight:"300", padding:0 },
  filterRow:       { gap:spacing(1), paddingBottom:spacing(1.5) },
  filterChip:      { paddingHorizontal:spacing(1.75), paddingVertical:spacing(0.875), borderRadius:radius.pill, borderWidth:1, borderColor:colors.border, backgroundColor:colors.card },
  filterChipOn:    { backgroundColor:colors.primary, borderColor:colors.primary },
  filterChipTxt:   { fontSize:typography.small, color:colors.subtext },
  filterChipTxtOn: { color:"#fff", fontWeight:"500" },
  categoryGrid:    { flexDirection:"row", flexWrap:"wrap", gap:spacing(1.25) },
  categoryCard:    { width:"47.5%", borderRadius:radius.md, overflow:"hidden", borderWidth:1, borderColor:colors.border, ...shadows.card },
  catImage:        { width:"100%", height:96 },
  catEmoji:        { fontSize:34, opacity:0.9 },
  catBody:         { padding:spacing(1.5), backgroundColor:colors.card },
  catName:         { fontFamily:SERIF, fontSize:typography.body, fontWeight:"500", color:colors.text, lineHeight:20, marginBottom:2 },
  catCount:        { fontSize:typography.small, color:colors.subtext, fontWeight:"300" },

  // Empty state
  empty:      { alignItems:"center", paddingVertical:spacing(5) },
  emptyEmoji: { fontSize:40, marginBottom:spacing(1.5) },
  emptyTitle: { fontFamily:SERIF, fontSize:20, color:colors.text, marginBottom:spacing(1) },
  emptyBody:  { fontSize:typography.body, color:colors.subtext, textAlign:"center", lineHeight:22, paddingHorizontal:spacing(2) },
});
