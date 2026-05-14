import React, { useState } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Image, ImageBackground, Modal, KeyboardAvoidingView, Platform, Dimensions,
} from "react-native";
import { colors, spacing, radius, typography, shadows } from "../theme";

const SERIF = "SourceSerif4-Regular";
const { width: SW } = Dimensions.get("window");

const MY_LISTS = [
  { id:"umrah",  name:"My Umrah Journey", count:18, updated:"2d ago", img:require("../assets/dua_kaaba.jpg"),    gradientBot:"#2A3C30" },
  { id:"family", name:"Duas for Family",  count:24, updated:"1w ago", img:require("../assets/dua_family.jpg"),   gradientBot:"#5A7848" },
  { id:"daily",  name:"Daily Reminders",  count:32, updated:"3d ago", img:require("../assets/dua_reminders.jpg"),gradientBot:"#906830" },
  { id:"sleep",  name:"Before Sleep",     count:15, updated:"5d ago", img:require("../assets/dua_sleep.jpg"),    gradientBot:"#0E1828" },
];

// Extra images available for custom lists
const LIST_IMAGES = [
  { key:"kaaba",     img:require("../assets/dua_kaaba.jpg")     },
  { key:"family",    img:require("../assets/dua_family.jpg")    },
  { key:"reminders", img:require("../assets/dua_reminders.jpg") },
  { key:"sleep",     img:require("../assets/dua_sleep.jpg")     },
  { key:"icon1",     img:require("../assets/dua_icon1.jpg")     },
  { key:"icon2",     img:require("../assets/dua_icon2.jpg")     },
  { key:"icon3",     img:require("../assets/dua_icon3.jpg")     },
  { key:"icon4",     img:require("../assets/dua_icon4.jpg")     },
  { key:"icon5",     img:require("../assets/dua_icon5.jpg")     },
  { key:"icon6",     img:require("../assets/dua_icon6.jpg")     },
  { key:"icon7",     img:require("../assets/dua_icon7.jpg")     },
];

const SHARED_DUAS = [
  { id:"s1", name:"Ahmed\u2019s Tawaf List",    sharedBy:"Ahmed Al-Rashid",      count:6,  updated:"1d ago", emoji:"\uD83D\uDD4B", img:require("../assets/dua_icon5.jpg") },
  { id:"s2", name:"Fatima\u2019s Morning Duas", sharedBy:"Fatima Hassan",         count:12, updated:"3d ago", emoji:"\uD83C\uDF05", img:require("../assets/dua_icon3.jpg") },
  { id:"s3", name:"Group Pilgrimage Duas",      sharedBy:"Our Pilgrimage Family", count:9,  updated:"5d ago", emoji:"\uD83E\uDD32", img:require("../assets/dua_kaaba.jpg") },
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

// ── Tab items config ─────────────────────────────────────────────────────────
const TAB_ITEMS = [
  {
    key:"myLists", label:"My Dua Lists",
    sub:"Your duas, saved for you to recite or practice.",
    icon:"📋", starBadge:true,
  },
  {
    key:"library", label:"Dua Library",
    sub:"Explore duas for every moment of your journey.",
    icon:"📖", starBadge:false,
  },
  {
    key:"shared",  label:"Shared Duas",
    sub:"Duas shared by friends and group members.",
    icon:"👥", starBadge:false,
  },
];

// ── NavCard — single tab card ─────────────────────────────────────────────────
function NavCard({ item, isActive, onPress }) {
  return (
    <TouchableOpacity
      style={isActive ? [nc.card, nc.cardActive] : nc.card}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* Icon circle */}
      <View style={nc.iconWrap}>
        <View style={isActive ? [nc.iconCircle, nc.iconCircleActive] : nc.iconCircle}>
          <Text style={nc.iconEmoji}>{item.icon}</Text>
        </View>
        {item.starBadge && (
          <View style={nc.starBadge}>
            <Text style={nc.starTxt}>{"★"}</Text>
          </View>
        )}
      </View>

      {/* Label */}
      <Text style={isActive ? [nc.label, nc.labelActive] : nc.label}>
        {item.label}
      </Text>

      {/* Description */}
      <Text style={isActive ? [nc.sub, nc.subActive] : nc.sub} numberOfLines={3}>
        {item.sub}
      </Text>

      {/* Arrow */}
      <Text style={isActive ? [nc.arrow, nc.arrowActive] : nc.arrow}>{"→"}</Text>
    </TouchableOpacity>
  );
}

const nc = StyleSheet.create({
  card:         { flex:1, backgroundColor:"#FDFAF4", borderRadius:16, borderWidth:1, borderColor:"#E8E0D0", padding:14, alignItems:"flex-start", shadowColor:"#1A1712", shadowOffset:{width:0,height:2}, shadowOpacity:0.06, shadowRadius:6, elevation:2 },
  cardActive:   { backgroundColor:"#2F5D50", borderColor:"#2F5D50", shadowColor:"#1A3A2A", shadowOpacity:0.18, elevation:5 },
  iconWrap:     { position:"relative", marginBottom:12 },
  iconCircle:   { width:52, height:52, borderRadius:26, backgroundColor:"#F0EBE2", alignItems:"center", justifyContent:"center" },
  iconCircleActive: { backgroundColor:"rgba(255,255,255,0.2)" },
  iconEmoji:    { fontSize:24 },
  starBadge:    { position:"absolute", top:-3, right:-3, width:18, height:18, borderRadius:9, backgroundColor:"#C8A96A", alignItems:"center", justifyContent:"center" },
  starTxt:      { fontSize:9, color:"#fff" },
  label:        { fontFamily:SERIF, fontSize:16, color:"#1A1712", marginBottom:6, lineHeight:20 },
  labelActive:  { color:"#fff" },
  sub:          { fontSize:13, color:"#7A7060", lineHeight:18, marginBottom:10, minHeight:54 },
  subActive:    { color:"rgba(255,255,255,0.75)" },
  arrow:        { fontSize:18, color:"#B8B0A0", marginTop:"auto" },
  arrowActive:  { color:"rgba(255,255,255,0.7)" },
});

// ── TabBar — three card row inside a container ────────────────────────────────
function TabBar({ active, onSelect }) {
  return (
    <View style={tb.container}>
      <View style={tb.row}>
        {TAB_ITEMS.map(t => (
          <NavCard
            key={t.key}
            item={t}
            isActive={active === t.key}
            onPress={() => onSelect(t.key)}
          />
        ))}
      </View>
    </View>
  );
}

const tb = StyleSheet.create({
  container: { backgroundColor:"#F0EBE2", borderRadius:20, marginHorizontal:20, marginBottom:16, padding:10, shadowColor:"#1A1712", shadowOffset:{width:0,height:2}, shadowOpacity:0.08, shadowRadius:8, elevation:3 },
  row:       { flexDirection:"row", gap:8 },
});

// ── Add a List modal ──────────────────────────────────────────────────────────
function NewListModal({ visible, onClose }) {
  const [name,  setName]  = useState("");
  const [emoji, setEmoji] = useState("\uD83D\uDD4B");

  const [selImg, setSelImg] = useState(LIST_IMAGES[0].key);
  const activeImg = LIST_IMAGES.find(i => i.key === selImg) || LIST_IMAGES[0];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==="ios"?"padding":"height"}>
        <ScrollView keyboardShouldPersistTaps="handled" style={{ flex:1 }} contentContainerStyle={{ justifyContent:"flex-end", flexGrow:1 }}>
        <View style={nl.overlay}>
          <View style={nl.sheet}>
            <View style={nl.handle}/>
            <Text style={nl.title}>Add a Dua List</Text>
            <Text style={nl.sub}>Create a new list to organise your duas</Text>

            <Text style={nl.fieldLabel}>LIST NAME</Text>
            <TextInput style={nl.input} placeholder="e.g. My Hajj Journey, Before Sleep..."
              placeholderTextColor="#5A5650" value={name} onChangeText={setName}
              autoFocus returnKeyType="done"/>

            <Text style={nl.fieldLabel}>CHOOSE A COVER IMAGE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={nl.imgPickerRow}>
              {LIST_IMAGES.map(item => (
                <TouchableOpacity key={item.key}
                  style={selImg === item.key ? [nl.imgPickerThumb, nl.imgPickerThumbOn] : nl.imgPickerThumb}
                  onPress={() => setSelImg(item.key)} activeOpacity={0.8}>
                  <Image source={item.img} style={nl.imgPickerImg} resizeMode="cover"/>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Live preview */}
            {name.trim() ? (
              <View style={nl.preview}>
                <View style={nl.previewImgWrap}>
                  <Image source={activeImg.img} style={nl.previewImg} resizeMode="cover"/>
                </View>
                <View style={{ flex:1 }}>
                  <Text style={nl.previewName}>{name.trim()}</Text>
                  <Text style={nl.previewMeta}>0 duas  {"\u00b7"}  Just created</Text>
                </View>
                <Text style={{ fontSize:18, color:"#D4D0CA" }}>{"\u203a"}</Text>
              </View>
            ) : null}

            <View style={nl.btnRow}>
              <TouchableOpacity style={nl.cancelBtn} onPress={() => { setName(""); setSelImg(LIST_IMAGES[0].key); onClose(); }}>
                <Text style={nl.cancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={!name.trim() ? [nl.createBtn, { opacity:0.4 }] : nl.createBtn}
                onPress={() => { setName(""); setSelImg(LIST_IMAGES[0].key); onClose(); }} disabled={!name.trim()}>
                <Text style={nl.createTxt}>Create List</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const nl = StyleSheet.create({
  overlay:          { flex:1, backgroundColor:"rgba(0,0,0,0.4)", justifyContent:"flex-end" },
  sheet:            { backgroundColor:"#D4E4DC", borderTopLeftRadius:24, borderTopRightRadius:24, padding:20, paddingBottom:40 },
  handle:           { width:36, height:4, borderRadius:2, backgroundColor:"rgba(47,93,80,0.3)", alignSelf:"center", marginBottom:12 },
  title:            { fontFamily:SERIF, fontSize:22, color:"#1A1712", marginBottom:4 },
  sub:              { fontSize:13, color:"#5A5650", fontWeight:"400", marginBottom:16 },
  fieldLabel:       { fontSize:10, fontWeight:"700", letterSpacing:1.5, color:"#5A5650", marginBottom:7 },
  input:            { backgroundColor:"#FDFAF4", borderRadius:10, borderWidth:1, borderColor:"#D4D0CA", padding:14, fontSize:16, color:"#1A1712", marginBottom:16, shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4 },
  imgPickerRow:     { gap:8, paddingBottom:16 },
  imgPickerThumb:   { width:64, height:80, borderRadius:6, overflow:"hidden", borderWidth:2, borderColor:"transparent" },
  imgPickerThumbOn: { borderColor:"#2F5D50" },
  imgPickerImg:     { width:"100%", height:"100%" },
  preview:          { flexDirection:"row", alignItems:"center", gap:12, backgroundColor:"#FDFAF4", borderRadius:10, borderWidth:1, borderColor:"#D4D0CA", overflow:"hidden", marginBottom:16, shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4 },
  previewImgWrap:   { width:52, height:64, flexShrink:0 },
  previewImg:       { width:"100%", height:"100%" },
  previewName:      { fontFamily:SERIF, fontSize:15, fontWeight:"500", color:"#1A1712", marginBottom:2, paddingRight:8 },
  previewMeta:      { fontSize:12, color:"#5A5650" },
  btnRow:           { flexDirection:"row", gap:10 },
  cancelBtn:        { flex:1, borderRadius:10, borderWidth:1, borderColor:"#D4D0CA", paddingVertical:14, alignItems:"center", backgroundColor:"#FDFAF4", shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4 },
  cancelTxt:        { fontSize:16, color:"#1A1712" },
  createBtn:        { flex:1, borderRadius:10, backgroundColor:"#2F5D50", paddingVertical:14, alignItems:"center" },
  createTxt:        { fontSize:16, color:"#fff", fontWeight:"600" },
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
              placeholderTextColor="#5A5650"
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
            />
            <Text style={ad.fieldLabel}>Dua text</Text>
            <TextInput
              style={ad.inputLg}
              placeholder="Type or paste your dua here..."
              placeholderTextColor="#5A5650"
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
  sheet:      { backgroundColor:"#D4E4DC", borderTopLeftRadius:24, borderTopRightRadius:24, padding:20, paddingBottom:40 },
  handle:     { width:36, height:4, borderRadius:2, backgroundColor:"rgba(47,93,80,0.3)", alignSelf:"center", marginBottom:12 },
  title:      { fontFamily:SERIF, fontSize:20, color:"#1A1712", marginBottom:4 },
  sub:        { fontSize:13, color:"#5A5650", fontWeight:"400", marginBottom:16 },
  fieldLabel: { fontSize:11, fontWeight:"700", letterSpacing:1.4, color:"#5A5650", marginBottom:6 },
  inputSm:    { backgroundColor:"#FDFAF4", borderRadius:10, borderWidth:1, borderColor:"#D4D0CA", padding:14, fontSize:16, color:"#1A1712", marginBottom:14,
    shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4,},
  inputLg:    { backgroundColor:"#FDFAF4", borderRadius:10, borderWidth:1, borderColor:"#D4D0CA", padding:14, fontSize:16, color:"#1A1712", marginBottom:16, minHeight:120,
    shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4,},
  btnRow:     { flexDirection:"row", gap:10 },
  cancelBtn:  { flex:1, borderRadius:10, borderWidth:1, borderColor:"#D4D0CA", paddingVertical:14, alignItems:"center", backgroundColor:"#FDFAF4",
    shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4,},
  cancelTxt:  { fontSize:16, color:"#1A1712" },
  saveBtn:    { flex:1, borderRadius:10, backgroundColor:"#2F5D50", paddingVertical:14, alignItems:"center" },
  saveTxt:    { fontSize:16, color:"#fff", fontWeight:"600" },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function MyDuasScreen({ navigation }) {
  const [activeTab,    setActiveTab]    = useState("myLists");
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery,  setSearchQuery]  = useState("");
  const [showNewList,  setShowNewList]  = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
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

      {/* Header — matches My Journey / Prepare style */}
      <View style={s.header}>
        <Text style={s.headerTitle}>{"Du\u02bf\u0101s"}</Text>
        <Text style={s.headerSub}>{"Your du\u02bf\u0101s, organised for every moment"}</Text>
      </View>

      {/* Tab bar */}
      <TabBar active={activeTab} onSelect={setActiveTab}/>

      {/* Global search */}
      <View style={s.globalSearchWrap}>
        <View style={[s.globalSearchBar, searchFocused && s.globalSearchFocused]}>
          <Text style={s.globalSearchIcon}>{"🔍"}</Text>
          <TextInput
            style={s.globalSearchInput}
            placeholder={"Search duas, lists, categories…"}
            placeholderTextColor="#9A8E7A"
            value={globalSearch}
            onChangeText={setGlobalSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            returnKeyType="search"
          />
          {globalSearch.length > 0 && (
            <TouchableOpacity onPress={() => setGlobalSearch("")}
              hitSlop={{top:8,bottom:8,left:8,right:8}}>
              <Text style={s.globalSearchClear}>{"✕"}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── My Dua Lists ── */}
      {activeTab === "myLists" && (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* My Dua Lists header with inline Add a List button */}
          <View style={s.tabPageHeaderRow}>
            <View style={{ flex:1 }}>
              <Text style={s.tabPageTitle}>My Dua Lists</Text>
              <Text style={s.tabPageSub}>Your personal collection of saved duas</Text>
            </View>
            <TouchableOpacity style={s.addDuaHeaderBtn} onPress={() => setShowNewList(true)} activeOpacity={0.85}>
              <Text style={s.addDuaHeaderBtnTxt}>+ Add a List</Text>
            </TouchableOpacity>
          </View>

          {/* Existing lists */}
          <View style={s.listContainer}>
            {MY_LISTS.map((list, idx) => (
              <TouchableOpacity key={list.id}
                style={idx < MY_LISTS.length - 1 ? [s.listRow, s.listRowBorder] : s.listRow}
                onPress={() => navigation.navigate("DuaList", { list })}
                activeOpacity={0.8}>
                {/* Full-bleed image — no wrapper padding */}
                <Image source={list.img} style={s.listImg} resizeMode="cover"/>
                <View style={s.listInfo}>
                  <Text style={s.listName}>{list.name}</Text>
                  <Text style={s.listMeta}>{list.count} duas</Text>
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
                  <View style={[s.listThumb, { backgroundColor:"#2F5D50" }]}>
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

          <View style={{ height:32 }}/>
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
              placeholderTextColor="#5A5650" value={searchQuery} onChangeText={setSearchQuery}/>
            {searchQuery.length > 0 ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Text style={{ fontSize:16, color:"#5A5650" }}>{"\u2715"}</Text>
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
          <View style={{ height:32 }}/>
        </ScrollView>
      )}

      {/* ── Shared Duas ── */}
      {activeTab === "shared" && (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* Shared Duas header with inline Add a Dua button */}
          <View style={s.tabPageHeaderRow}>
            <View style={{ flex:1 }}>
              <Text style={s.tabPageTitle}>Shared Duas</Text>
              <Text style={s.tabPageSub}>Duas others have shared with you</Text>
            </View>
            <TouchableOpacity style={s.addDuaHeaderBtn} onPress={() => setShowAddSharedDua(true)} activeOpacity={0.85}>
              <Text style={s.addDuaHeaderBtnTxt}>+ Add a Dua</Text>
            </TouchableOpacity>
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
                  <Image source={item.img} style={s.listImg} resizeMode="cover"/>
                  <View style={s.listInfo}>
                    <Text style={s.listName}>{item.name}</Text>
                    <Text style={s.listMeta}>{item.count} duas</Text>
                  </View>
                  <Text style={s.listArrow}>{"\u203a"}</Text>
                </TouchableOpacity>
              ))}
              {sharedCustomDuas.map((dua, idx) => (
                <View key={dua.id}
                  style={idx < sharedCustomDuas.length - 1 ? [s.listRow, s.listRowBorder] : s.listRow}>
                  <View style={[s.listThumb, { backgroundColor:"#2F5D50" }]}>
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

          <View style={{ height:32 }}/>
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
  safe:        { flex:1, backgroundColor:"#EDE6D8" },
  // Header — matches My Journey / Prepare
  header:      { paddingHorizontal:20, paddingTop:16, paddingBottom:12 },
  headerTitle: { fontFamily:SERIF, fontSize:28, fontWeight:"400", color:"#1A1712" },
  headerSub:   { fontSize:14, color:"#5A5650", fontWeight:"400", marginTop:2 },
  // Hero styles kept as empty to avoid ref errors (no longer used)
  heroHeader:  {}, heroImg:{}, heroFadeLeft:{}, heroFade1:{}, heroFade2:{}, heroContent:{},
  addBtn:             { width:34, height:34, borderRadius:17, backgroundColor:"#2F5D50", alignItems:"center", justifyContent:"center" },
  addBtnTxt:          { fontSize:22, color:"#fff", lineHeight:26, fontWeight:"400" },
  addDuaHeaderBtn:    { backgroundColor:"#2F5D50", borderRadius:999, paddingHorizontal:14, paddingVertical:7 },
  addDuaHeaderBtnTxt: { fontSize:13, color:"#fff", fontWeight:"600" },
  addDuaHeaderBtn:    { backgroundColor:"#2F5D50", borderRadius:999, paddingHorizontal:14, paddingVertical:7 },
  addDuaHeaderBtnTxt: { fontSize:13, color:"#fff", fontWeight:"600" },

  // Global search
  globalSearchWrap:    { paddingHorizontal:20, paddingBottom:10 },
  globalSearchBar:     { flexDirection:"row", alignItems:"center", gap:10, backgroundColor:"#FDFAF4", borderRadius:14, borderWidth:1.5, borderColor:"#D4D0CA", paddingHorizontal:14, paddingVertical:11, shadowColor:"#6A4A28", shadowOffset:{width:0,height:2}, shadowOpacity:0.08, shadowRadius:4, elevation:2 },
  globalSearchFocused: { borderColor:"#2F5D50" },
  globalSearchIcon:    { fontSize:15, opacity:0.5 },
  globalSearchInput:   { flex:1, fontSize:16, color:"#1A1712", padding:0 },
  globalSearchClear:   { fontSize:14, color:"#9A8E7A", paddingLeft:4 },

  scroll: { paddingHorizontal:20, paddingTop:10 },

  // Tab page title blocks
  tabPageHeader:    { marginBottom:16 },
  tabPageHeaderRow: { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:16 },
  tabPageTitle:     { fontFamily:SERIF, fontSize:22, fontWeight:"400", color:"#1A1712", marginBottom:4 },
  tabPageSub:       { fontSize:13, color:"#5A5650", fontWeight:"400", lineHeight:18 },

  // List rows
  listContainer:  { backgroundColor:"#FDFAF4", borderRadius:16, borderWidth:1, borderColor:"#D4D0CA", overflow:"hidden", marginBottom:10, shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4 },
  listRow:        { flexDirection:"row", alignItems:"stretch", height:88 },
  listRowBorder:  { borderBottomWidth:1, borderBottomColor:"#DDD5C2", marginBottom:3 },
  listImg:        { width:80, height:"100%" },
  listImgWrap:    { width:80, height:"100%", flexShrink:0 },
  listThumb:      { width:52, height:52, borderRadius:10, alignItems:"center", justifyContent:"center", flexShrink:0, marginLeft:16 },
  listThumbEmoji: { fontSize:24 },
  listInfo:       { flex:1, justifyContent:"center", paddingLeft:20, paddingRight:8 },
  listName:       { fontFamily:SERIF, fontSize:17, fontWeight:"500", color:"#1A1712", marginBottom:4 },
  listMeta:       { fontSize:13, color:"#5A5650", fontWeight:"400" },
  listArrow:      { fontSize:20, color:"#D4D0CA", alignSelf:"center", paddingRight:16 },

  // Add a Dua card
  addDuaCard:    { flexDirection:"row", alignItems:"center", backgroundColor:"#EBF2EE", borderRadius:16, borderWidth:1.5, borderColor:"#C8DDD0", paddingHorizontal:16, paddingVertical:16, gap:12, marginBottom:16 },
  addDuaIconWrap:{ width:52, height:52, borderRadius:10, backgroundColor:"#2F5D50", alignItems:"center", justifyContent:"center", flexShrink:0 },
  addDuaIcon:    { fontSize:28, color:"#fff", fontWeight:"400", lineHeight:34 },
  addDuaInfo:    { flex:1 },
  addDuaTitle:   { fontFamily:SERIF, fontSize:17, fontWeight:"500", color:"#1A1712", marginBottom:3 },
  addDuaSub:     { fontSize:13, color:"#5A5650", fontWeight:"400" },

  // Create new list button
  newListBtn:    { borderRadius:10, borderWidth:1.5, borderColor:"#D4D0CA", borderStyle:"dashed", paddingVertical:18, alignItems:"center", marginBottom:16 },
  newListBtnTxt: { fontFamily:SERIF, fontSize:16, color:"#5A5650", fontWeight:"400" },

  // Library
  searchBar:       { flexDirection:"row", alignItems:"center", backgroundColor:"#FDFAF4", borderRadius:10, paddingHorizontal:16, paddingVertical:10, gap:8, borderWidth:1, borderColor:"#D4D0CA", marginBottom:12, shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4 },
  searchIcon:      { fontSize:14, color:"#5A5650" },
  searchInput:     { flex:1, fontSize:16, color:"#1A1712", fontWeight:"400", padding:0 },
  filterRow:       { gap:8, paddingBottom:12 },
  filterChip:      { paddingHorizontal:14, paddingVertical:7, borderRadius:999, borderWidth:1, borderColor:"#D4D0CA", backgroundColor:"#FDFAF4",
    shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4,},
  filterChipOn:    { backgroundColor:"#2F5D50", borderColor:"#2F5D50" },
  filterChipTxt:   { fontSize:14, color:"#5A5650" },
  filterChipTxtOn: { color:"#fff", fontWeight:"500" },
  categoryGrid:    { flexDirection:"row", flexWrap:"wrap", gap:10 },
  categoryCard:    { width:"47.5%", borderRadius:10, overflow:"hidden", borderWidth:1, borderColor:"#D4D0CA", shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4 },
  catImage:        { width:"100%", height:100 },
  catEmoji:        { fontSize:34, opacity:0.9 },
  catBody:         { padding:12, backgroundColor:"#FDFAF4" },
  catName:         { fontFamily:SERIF, fontSize:16, fontWeight:"500", color:"#1A1712", lineHeight:20, marginBottom:2 },
  catCount:        { fontSize:14, color:"#5A5650", fontWeight:"400" },

  // Empty state
  empty:      { alignItems:"center", paddingVertical:40 },
  emptyEmoji: { fontSize:40, marginBottom:12 },
  emptyTitle: { fontFamily:SERIF, fontSize:20, color:"#1A1712", marginBottom:8 },
  emptyBody:  { fontSize:16, color:"#5A5650", textAlign:"center", lineHeight:22, paddingHorizontal:16 },
});
