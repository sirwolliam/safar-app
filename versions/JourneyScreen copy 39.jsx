import React, { useState, useEffect } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  ImageBackground, StyleSheet, LayoutAnimation, Platform,
  UIManager, Modal, TextInput, KeyboardAvoidingView,
  Linking, Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, spacing, radius, typography, shadows } from "../theme";
import Svg, { Path, Circle } from "react-native-svg";
import GuideCarousel, { HAJJ_STEPS as HAJJ_GUIDE_STEPS, UMRAH_STEPS as UMRAH_GUIDE_STEPS } from "../components/GuideCarousel";
import { Calendar } from "react-native-calendars";

if (Platform.OS === "android" ? UIManager.setLayoutAnimationEnabledExperimental : null) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SERIF = "SourceSerif4-Regular";
const BOARD_KEY       = "safar_journey_board_v1";
const CONTACTS_KEY    = "safar_journey_contacts_v1";
const HAJJ_CHECK_KEY  = "safar_hajj_checklist_v1";
const UMRAH_CHECK_KEY = "safar_umrah_checklist_v1";
const DEPARTURE_KEY   = "safar_departure_date_v1";

// ── Pre-marked Hajj key dates 1446 AH (2025) ─────────────────────────────────
// Approximate Gregorian equivalents — user should verify with local authority
const HAJJ_KEY_DATES = {
  "2025-06-04": { marked:true, dotColor:"#C8A96A", type:"hajj", label:"Ihram Day — 8th Dhul Hijjah" },
  "2025-06-05": { marked:true, dotColor:"#C8A96A", type:"hajj", label:"Day of Arafah — 9th Dhul Hijjah" },
  "2025-06-06": { marked:true, dotColor:"#C8A96A", type:"hajj", label:"Eid al-Adha — 10th Dhul Hijjah" },
  "2025-06-07": { marked:true, dotColor:"#C8A96A", type:"hajj", label:"11th Dhul Hijjah — Tashreeq" },
  "2025-06-08": { marked:true, dotColor:"#C8A96A", type:"hajj", label:"12th Dhul Hijjah — Tashreeq" },
  "2025-06-09": { marked:true, dotColor:"#C8A96A", type:"hajj", label:"13th Dhul Hijjah — Tashreeq" },
};

const CONTACT_COLORS = ["#4A7A60","#6B5B7A","#7A5B4A","#4A6B7A","#7A6B4A","#5B7A4A"];
const CONTACT_ROLES  = ["Hotel","Guide","Driver","Travel Agent","Group Member","Family","Doctor","Emergency","Other"];
const ROLE_COLORS    = {
  "Hotel":"rgba(74,106,80,0.12)","Guide":"rgba(107,91,122,0.12)",
  "Driver":"rgba(122,91,74,0.12)","Travel Agent":"rgba(74,107,122,0.12)",
  "Group Member":"rgba(47,93,80,0.12)","Family":"rgba(200,169,106,0.15)",
  "Doctor":"rgba(200,80,80,0.12)","Emergency":"rgba(200,80,80,0.18)",
};

// ── Groups SVG icon ───────────────────────────────────────────────────────────
function GroupIcon({ size = 18, color = "#2F5D50" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={9}  cy={7}  r={3.5} stroke={color} strokeWidth={1.5}/>
      <Circle cx={17} cy={8}  r={2.5} stroke={color} strokeWidth={1.5}/>
      <Path d="M2 20 C2 15.6 5.1 13 9 13 C12.9 13 16 15.6 16 20" stroke={color} strokeWidth={1.5} strokeLinecap="round"/>
      <Path d="M17 13 C19.8 13 22 15 22 18" stroke={color} strokeWidth={1.5} strokeLinecap="round"/>
    </Svg>
  );
}

function ContactIcon({ size = 18, color = "#2F5D50" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 4 L4 20 L20 20 L20 4 Z" stroke={color} strokeWidth={1.5} strokeLinejoin="round"/>
      <Path d="M7 4 L7 20" stroke={color} strokeWidth={1.5}/>
      <Path d="M3 8 L7 8" stroke={color} strokeWidth={1.5}/>
      <Path d="M3 12 L7 12" stroke={color} strokeWidth={1.5}/>
      <Path d="M3 16 L7 16" stroke={color} strokeWidth={1.5}/>
      <Circle cx={14} cy={10} r={2.5} stroke={color} strokeWidth={1.5}/>
      <Path d="M10 18 C10 15.2 11.8 14 14 14 C16.2 14 18 15.2 18 18" stroke={color} strokeWidth={1.5} strokeLinecap="round"/>
    </Svg>
  );
}

// ── Steps data ────────────────────────────────────────────────────────────────
const UMRAH_STEPS = [
  { id:"ihram", number:1, name:"Entering Ih\u1e5b\u0101m", sub:"Intention & Talb\u012byah", done:true, duas:[{
    id:"ihram-1", title:"Talbiyah", stage:"Ih\u1e5b\u0101m",
    arabic:"\u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643\u064e",
    transliteration:"Labbayk All\u0101humma labbayk",
    translation:"Here I am O Allah, here I am.",
    source:"\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 1549", isFeatured:true }]},
  { id:"tawaf", number:2, name:"\u1e62aw\u0101f", sub:"7 circuits of the Ka\u02bfbah", active:true, duas:[
    { id:"tawaf-1", title:"Upon Beginning", stage:"Taw\u0101f",
      arabic:"\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0647\u0650 \u0648\u064e\u0627\u0644\u0644\u0647\u064f \u0623\u064e\u0643\u0652\u0628\u064e\u0631\u064f",
      transliteration:"Bismi-ll\u0101hi wa-ll\u0101hu akbar",
      translation:"In the name of Allah, and Allah is the Greatest.",
      source:"\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 1613", isFeatured:true },
    { id:"tawaf-2", title:"Between Yemeni Corner & Black Stone", stage:"Taw\u0101f",
      arabic:"\u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u0622\u062a\u0650\u0646\u064e\u0627 \u0641\u0650\u064a \u0627\u0644\u062f\u064f\u0651\u0646\u0652\u064a\u064e\u0627 \u062d\u064e\u0633\u064e\u0646\u064e\u0629\u064b",
      transliteration:"Rabban\u0101 \u0101tin\u0101 fi\u02bfd-duny\u0101 \u1e25asanatan",
      translation:"Our Lord, give us good in this world and the Hereafter.",
      source:"Al-Baqarah 2:201" }]},
  { id:"maqam",  number:3, name:"Pray at Maq\u0101m Ibr\u0101h\u012bm", sub:"2 rak\u02bfahs after \u1e62aw\u0101f", duas:[] },
  { id:"zamzam", number:4, name:"Drink Zamzam", sub:"At the Zamzam well", duas:[] },
  { id:"saee",   number:5, name:"Sa\u02bfy", sub:"7 trips between \u1e62af\u0101 & Marwah", duas:[{
    id:"safa-1", title:"Upon Ascending \u1e62af\u0101", stage:"Sa\u02bfy",
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
  { id:"arafah",  number:3,  name:"Wuq\u016bf at \u02bfarafah",     sub:"9th Dhul Hijjah \u2014 pillar", active:true, duas:[{
    id:"arafah-1", title:"Du\u02bf\u0101 at \u02bfarafah", stage:"\u02bfarafah",
    arabic:"\u0644\u064e\u0627 \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u064e\u0651\u0627 \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0648\u064e\u062d\u0652\u062f\u064e\u0647\u064f \u0644\u064e\u0627 \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0647\u064f",
    transliteration:"L\u0101 il\u0101ha illa-ll\u0101hu wa\u1e25dahu l\u0101 shar\u012bka lah",
    translation:"There is no god but Allah alone, with no partner.",
    source:"Sunan al-Tirmidh\u012b \u00b7 3585", isFeatured:true }]},
  { id:"muzdal",  number:4,  name:"Muzdalifah",                    sub:"Night under the stars",         duas:[] },
  { id:"jamarat", number:5,  name:"Jamarat",                       sub:"Stoning of the pillars",        duas:[] },
  { id:"nahr",    number:6,  name:"Sacrifice",                     sub:"10th Dhul Hijjah",              duas:[] },
  { id:"tawaf_i", number:7,  name:"Taw\u0101f al-If\u0101\u1e0dah", sub:"Pillar of Hajj",               duas:[] },
  { id:"saee_h",  number:8,  name:"Sa\u02bfy",                     sub:"\u1e62af\u0101 & Marwah",        duas:[] },
  { id:"mina_d",  number:9,  name:"Days in Min\u0101",             sub:"11-13th Dhul Hijjah",           duas:[] },
  { id:"wadaa",   number:10, name:"Taw\u0101f al-Wad\u0101\u02bf", sub:"Farewell tawaf",                duas:[] },
];

// ── Board card type config ────────────────────────────────────────────────────
const CARD_TYPES = [
  { key:"note",      label:"Note",           emoji:"\uD83D\uDCDD", desc:"Personal intention or reminder" },
  { key:"checklist", label:"Checklist item", emoji:"\u2713",       desc:"Something to prepare or pack"   },
  { key:"dua",       label:"Pin a Du\u02bf\u0101\u02be", emoji:"\uD83E\uDD32", desc:"Save a specific du\u02bf\u0101\u02be" },
  { key:"link",      label:"Link",           emoji:"\uD83D\uDD17", desc:"A URL, booking or resource"      },
];

const CARD_SUGGESTIONS = {
  note:      ["My intention for this journey","Things to remember at the Ka\u02bfbah","Du\u02bf\u0101\u02be for my family"],
  checklist: ["Pack ihram clothing","Renew passport","Book accommodation near Haram","Get travel insurance","Exchange currency to SAR","Download offline maps"],
  link:      ["Flight booking","Hotel near Haram","Nusuk registration"],
};

// ── Add Card Modal ────────────────────────────────────────────────────────────
function AddCardModal({ visible, onAdd, onClose }) {
  const [step,        setStep]        = useState("type");
  const [cardType,    setCardType]    = useState(null);
  const [text,        setText]        = useState("");
  const [title,       setTitle]       = useState("");
  const [url,         setUrl]         = useState("");
  const [selectedDua, setSelectedDua] = useState(null);
  const [duaSearch,   setDuaSearch]   = useState("");

  const reset = () => { setStep("type"); setCardType(null); setText(""); setTitle(""); setUrl(""); setSelectedDua(null); setDuaSearch(""); };
  const handleClose = () => { reset(); onClose(); };

  const handleAdd = () => {
    let card = { id:Date.now().toString(), type:cardType, createdAt:new Date().toISOString() };
    if (cardType === "note")      card = { ...card, text:text.trim() };
    if (cardType === "checklist") card = { ...card, text:text.trim(), done:false };
    if (cardType === "dua")       card = { ...card, dua:selectedDua };
    if (cardType === "link")      card = { ...card, title:title.trim()||url, url:url.trim().startsWith("http")?url.trim():"https://"+url.trim() };
    if (!text.trim() && cardType !== "dua" && cardType !== "link") return;
    if (cardType === "dua" && !selectedDua) return;
    if (cardType === "link" && !url.trim()) return;
    onAdd(card); reset();
  };

  const filteredDuas = DUAS.filter(d =>
    d.title.toLowerCase().includes(duaSearch.toLowerCase()) ||
    (d.stage ?? "").toLowerCase().includes(duaSearch.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==="ios"?"padding":"height"}>
        <View style={am.overlay}>
          <View style={am.sheet}>
            <View style={am.handle} />
            <View style={am.sheetHeader}>
              {step === "form"
                ? <TouchableOpacity onPress={() => setStep("type")}><Text style={am.back}>{"\u2039"} Back</Text></TouchableOpacity>
                : <View style={{ width:50 }} />
              }
              <Text style={am.sheetTitle}>{step==="type" ? "Add to your board" : CARD_TYPES.find(t=>t.key===cardType)?.label}</Text>
              <TouchableOpacity onPress={handleClose}><Text style={am.closeBtn}>{"\u2715"}</Text></TouchableOpacity>
            </View>

            {step === "type" && (
              <View style={am.typeGrid}>
                {CARD_TYPES.map(type => (
                  <TouchableOpacity key={type.key} style={am.typeOpt}
                    onPress={() => { setCardType(type.key); setStep("form"); }} activeOpacity={0.85}>
                    <View style={am.typeEmoji}><Text style={{ fontSize:26 }}>{type.emoji}</Text></View>
                    <Text style={am.typeLabel}>{type.label}</Text>
                    <Text style={am.typeDesc}>{type.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {step === "form" && (
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {cardType === "note" && (
                  <>
                    <Text style={am.fieldLabel}>What would you like to remember?</Text>
                    <TextInput style={[am.input, am.inputMulti]} placeholder="e.g. My intention for this journey..." placeholderTextColor={colors.subtext} value={text} onChangeText={setText} multiline autoFocus />
                    {CARD_SUGGESTIONS.note.map(s => (
                      <TouchableOpacity key={s} style={am.suggestion} onPress={() => setText(s)}>
                        <Text style={am.suggestionText}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
                {cardType === "checklist" && (
                  <>
                    <Text style={am.fieldLabel}>What do you need to prepare?</Text>
                    <TextInput style={am.input} placeholder="e.g. Pack ihram clothing" placeholderTextColor={colors.subtext} value={text} onChangeText={setText} autoFocus />
                    <Text style={am.suggestTitle}>Suggestions</Text>
                    {CARD_SUGGESTIONS.checklist.map(s => (
                      <TouchableOpacity key={s} style={am.suggestion} onPress={() => setText(s)}>
                        <Text style={am.suggestionText}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
                {cardType === "dua" && (
                  <>
                    <Text style={am.fieldLabel}>{"Search for a du\u02bf\u0101\u02be"}</Text>
                    <View style={am.searchBar}>
                      <Text style={{ fontSize:14, color:colors.subtext }}>{"\uD83D\uDD0D"}</Text>
                      <TextInput style={am.searchInput} placeholder="Search by title or stage..." placeholderTextColor={colors.subtext} value={duaSearch} onChangeText={setDuaSearch} autoFocus />
                    </View>
                    {filteredDuas.map(dua => (
                      <TouchableOpacity key={dua.id} style={[am.duaRow, selectedDua?.id===dua.id ? am.duaRowSelected : null]}
                        onPress={() => setSelectedDua(dua)} activeOpacity={0.85}>
                        <View style={[am.duaCheck, selectedDua?.id===dua.id ? am.duaCheckOn : null]}>
                          {selectedDua?.id===dua.id && <Text style={{ fontSize:10, color:"#fff", fontWeight:"700" }}>{"✓"}</Text>}
                        </View>
                        <View style={{ flex:1 }}>
                          <Text style={am.duaTitle}>{dua.title}</Text>
                          <Text style={am.duaStage}>{dua.stage}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
                {cardType === "link" && (
                  <>
                    <Text style={am.fieldLabel}>URL</Text>
                    <TextInput style={am.input} placeholder="https://..." placeholderTextColor={colors.subtext} value={url} onChangeText={setUrl} keyboardType="url" autoCapitalize="none" autoCorrect={false} autoFocus />
                    <Text style={am.fieldLabel}>Title (optional)</Text>
                    <TextInput style={am.input} placeholder="e.g. My hotel booking" placeholderTextColor={colors.subtext} value={title} onChangeText={setTitle} />
                    <Text style={am.suggestTitle}>Suggestions</Text>
                    {CARD_SUGGESTIONS.link.map(s => (
                      <TouchableOpacity key={s} style={am.suggestion} onPress={() => setTitle(s)}>
                        <Text style={am.suggestionText}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
                <TouchableOpacity style={am.saveBtn} onPress={handleAdd} activeOpacity={0.88}>
                  <Text style={am.saveBtnText}>Add to board</Text>
                </TouchableOpacity>
                <View style={{ height:spacing(3) }} />
              </ScrollView>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Add Contact Modal ─────────────────────────────────────────────────────────
function AddContactModal({ visible, onAdd, onClose }) {
  const [name,       setName]       = useState("");
  const [role,       setRole]       = useState("Hotel");
  const [phone,      setPhone]      = useState("");
  const [note,       setNote]       = useState("");
  const [colorIndex, setColorIndex] = useState(0);

  const reset = () => { setName(""); setRole("Hotel"); setPhone(""); setNote(""); setColorIndex(0); };
  const handleClose = () => { reset(); onClose(); };
  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({ name:name.trim(), role, phone:phone.trim(), note:note.trim(), colorIndex });
    reset();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==="ios"?"padding":"height"}>
        <View style={cm.overlay}>
          <View style={cm.sheet}>
            <View style={cm.handle} />
            <View style={cm.sheetHeader}>
              <View style={{ width:50 }} />
              <Text style={cm.sheetTitle}>Add Contact</Text>
              <TouchableOpacity onPress={handleClose}><Text style={cm.closeBtn}>{"\u2715"}</Text></TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

              {/* Colour picker */}
              <View style={cm.colorRow}>
                {CONTACT_COLORS.map((col, i) => (
                  <TouchableOpacity key={i} style={[cm.colorSwatch, { backgroundColor:col }, colorIndex===i ? cm.colorSwatchActive : null]}
                    onPress={() => setColorIndex(i)} activeOpacity={0.8}>
                    {colorIndex===i && <Text style={cm.colorCheck}>{"✓"}</Text>}
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={cm.fieldLabel}>Name *</Text>
              <TextInput style={cm.input} placeholder="e.g. Al-Andalus Hotel" placeholderTextColor={colors.subtext} value={name} onChangeText={setName} autoFocus />

              <Text style={cm.fieldLabel}>Role</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={cm.roleRow}>
                {CONTACT_ROLES.map(r => (
                  <TouchableOpacity key={r} style={[cm.roleChip, role===r ? cm.roleChipActive : null]}
                    onPress={() => setRole(r)} activeOpacity={0.8}>
                    <Text style={[cm.roleChipText, role===r ? cm.roleChipTextActive : null]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={cm.fieldLabel}>Phone (optional)</Text>
              <TextInput style={cm.input} placeholder="+966 XX XXX XXXX" placeholderTextColor={colors.subtext} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

              <Text style={cm.fieldLabel}>Note (optional)</Text>
              <TextInput style={[cm.input, cm.inputMulti]} placeholder="e.g. Check-in time 3pm, ask for Ibrahim at reception" placeholderTextColor={colors.subtext} value={note} onChangeText={setNote} multiline />

              <TouchableOpacity style={cm.saveBtn} onPress={handleAdd} activeOpacity={0.88}>
                <Text style={cm.saveBtnText}>Save contact</Text>
              </TouchableOpacity>
              <View style={{ height:spacing(3) }} />
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const cm = StyleSheet.create({
  overlay:        { flex:1, backgroundColor:"rgba(0,0,0,0.4)", justifyContent:"flex-end" },
  sheet:          { backgroundColor:"#D4E4DC", borderTopLeftRadius:24, borderTopRightRadius:24, paddingHorizontal:20, paddingBottom:16, maxHeight:"88%" },
  handle:         { width:36, height:4, borderRadius:2, backgroundColor:"rgba(47,93,80,0.3)", alignSelf:"center", marginTop:12, marginBottom:8 },
  sheetHeader:    { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:16 },
  sheetTitle:     { fontFamily:SERIF, fontSize:18, color:"#1A1712" },
  closeBtn:       { fontSize:16, color:"#5A5650", width:50, textAlign:"right" },
  colorRow:       { flexDirection:"row", gap:8, marginBottom:16 },
  colorSwatch:    { width:32, height:32, borderRadius:16, alignItems:"center", justifyContent:"center" },
  colorSwatchActive:{ borderWidth:2.5, borderColor:"#1A1712" },
  colorCheck:     { fontSize:14, color:"#fff", fontWeight:"700" },
  fieldLabel:     { fontSize:10, fontWeight:"700", letterSpacing:1.5, color:"#5A5650", marginBottom:6 },
  input:          { backgroundColor:"#FDFAF4", borderRadius:10, borderWidth:1, borderColor:"#D4D0CA", paddingHorizontal:14, paddingVertical:10, fontSize:16, color:"#1A1712", marginBottom:14,
    shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4,},
  inputMulti:     { minHeight:72, textAlignVertical:"top" },
  roleRow:        { gap:6, paddingBottom:14 },
  roleChip:       { paddingHorizontal:12, paddingVertical:6, borderRadius:999, borderWidth:1, borderColor:"#D4D0CA", backgroundColor:"#FDFAF4" },
  roleChipActive: { backgroundColor:"#2F5D50", borderColor:"#2F5D50" },
  roleChipText:   { fontSize:14, color:"#5A5650" },
  roleChipTextActive:{ color:"#fff", fontWeight:"500" },
  saveBtn:        { backgroundColor:"#2F5D50", borderRadius:10, paddingVertical:14, alignItems:"center", marginTop:8, shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4 },
  saveBtnText:    { fontFamily:SERIF, fontSize:16, color:"#fff", fontWeight:"500" },
});

// ── Board card components ─────────────────────────────────────────────────────
function BoardCard({ card, onToggle, onDelete }) {
  const handleLongPress = () => {
    Alert.alert("Remove card", "Remove this from your board?", [
      { text:"Cancel", style:"cancel" },
      { text:"Remove", style:"destructive", onPress:() => onDelete(card.id) },
    ]);
  };
  if (card.type === "checklist") return (
    <TouchableOpacity style={[bc.card, bc.checklistCard]} onPress={() => onToggle(card.id)} onLongPress={handleLongPress} activeOpacity={0.85}>
      <View style={[bc.checkbox, card.done ? bc.checkboxDone : null]}>
        {card.done && <Text style={bc.checkmark}>{"✓"}</Text>}
      </View>
      <Text style={[bc.checklistText, card.done ? bc.checklistTextDone : null]}>{card.text}</Text>
    </TouchableOpacity>
  );
  if (card.type === "note") return (
    <TouchableOpacity style={[bc.card, bc.noteCard]} onLongPress={handleLongPress} activeOpacity={0.9}>
      <Text style={bc.noteIcon}>{"\uD83D\uDCDD"}</Text>
      <Text style={bc.noteText}>{card.text}</Text>
    </TouchableOpacity>
  );
  if (card.type === "dua") return (
    <TouchableOpacity style={[bc.card, bc.duaCard]} onLongPress={handleLongPress} activeOpacity={0.9}>
      <View style={bc.duaHeader}>
        <Text style={bc.duaPinLabel}>{"PINNED DU\u02bf\u0100\u02be"}</Text>
        <Text style={{ fontSize:14 }}>{"\uD83E\uDD32"}</Text>
      </View>
      <Text style={bc.duaTitle}>{card.dua?.title}</Text>
      <Text style={bc.duaArabic} numberOfLines={2}>{card.dua?.arabic}</Text>
      <Text style={bc.duaStage}>{card.dua?.stage}</Text>
    </TouchableOpacity>
  );
  if (card.type === "link") return (
    <TouchableOpacity style={[bc.card, bc.linkCard]} onPress={() => Linking.openURL(card.url)} onLongPress={handleLongPress} activeOpacity={0.85}>
      <View style={bc.linkIconWrap}><Text style={{ fontSize:18 }}>{"\uD83D\uDD17"}</Text></View>
      <View style={{ flex:1 }}>
        <Text style={bc.linkTitle} numberOfLines={1}>{card.title}</Text>
        <Text style={bc.linkUrl} numberOfLines={1}>{card.url.replace("https://","").replace("http://","")}</Text>
      </View>
      <Text style={bc.linkArrow}>{"\u2197"}</Text>
    </TouchableOpacity>
  );
  return null;
}

const bc = StyleSheet.create({
  card:              { borderRadius:10, marginBottom:10, shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4 },
  checklistCard:     { flexDirection:"row", alignItems:"center", gap:10, backgroundColor:"#FDFAF4", borderWidth:1, borderColor:"#D4D0CA", padding:14 },
  checkbox:          { width:24, height:24, borderRadius:12, borderWidth:1.5, borderColor:"#D4D0CA", alignItems:"center", justifyContent:"center", flexShrink:0 },
  checkboxDone:      { backgroundColor:"#2F5D50", borderColor:"#2F5D50" },
  checkmark:         { fontSize:12, color:"#fff", fontWeight:"700" },
  checklistText:     { fontFamily:SERIF, fontSize:16, color:"#1A1712", flex:1 },
  checklistTextDone: { color:"#5A5650", textDecorationLine:"line-through" },
  noteCard:          { backgroundColor:"#FFFBE8", borderWidth:1, borderColor:"#E8DDA0", padding:16 },
  noteIcon:          { fontSize:16, marginBottom:4 },
  noteText:          { fontFamily:SERIF, fontSize:16, color:"#1A1712", lineHeight:16*1.55 },
  duaCard:           { backgroundColor:"rgba(47,93,80,0.07)", borderWidth:1, borderColor:"rgba(47,93,80,0.2)", padding:16 },
  duaHeader:         { flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:6 },
  duaPinLabel:       { fontSize:10, fontWeight:"700", letterSpacing:1.5, color:"#2F5D50" },
  duaTitle:          { fontFamily:SERIF, fontSize:16, color:"#1A1712", marginBottom:4 },
  duaArabic:         { fontSize:16, color:"#5A5650", textAlign:"right", lineHeight:28, marginBottom:4 },
  duaStage:          { fontSize:12, color:"#2F5D50" },
  linkCard:          { flexDirection:"row", alignItems:"center", gap:10, backgroundColor:"#FDFAF4", borderWidth:1, borderColor:"#D4D0CA", padding:14 },
  linkIconWrap:      { width:38, height:38, borderRadius:6, backgroundColor:"rgba(47,93,80,0.08)", alignItems:"center", justifyContent:"center", flexShrink:0 },
  linkTitle:         { fontFamily:SERIF, fontSize:16, color:"#1A1712", marginBottom:2 },
  linkUrl:           { fontSize:12, color:"#2F5D50" },
  linkArrow:         { fontSize:16, color:"#2F5D50" },
});

// ── Dua Player ────────────────────────────────────────────────────────────────
function DuaPlayer({ dua, onClose, onNext, onPrev, hasPrev, hasNext }) {
  const [showTranslit, setShowTranslit] = useState(true);
  const [showTrans,    setShowTrans]    = useState(true);
  const [bookmarked,   setBookmarked]   = useState(false);
  return (
    <View style={pl.wrap}>
      <View style={pl.header}>
        <TouchableOpacity style={pl.iconBtn} onPress={onClose}><Text style={pl.iconBtnTxt}>{"\u2039"}</Text></TouchableOpacity>
        <View style={pl.headerMid}>
          <Text style={pl.stage}>{dua.stage}</Text>
          <Text style={pl.title} numberOfLines={1}>{dua.title}</Text>
        </View>
        <TouchableOpacity style={pl.iconBtn} onPress={() => setBookmarked(v => !v)}>
          <Text style={[pl.bookmark, bookmarked ? pl.bookmarkActive : null]}>{bookmarked ? "\u2665" : "\u2661"}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={pl.scroll} contentContainerStyle={pl.scrollContent} showsVerticalScrollIndicator={false}>
        {dua.isFeatured && (
          <View style={pl.featuredRow}><View style={pl.featuredBadge}><Text style={pl.featuredText}>{"KEY DU\u02bf\u0100\u02be"}</Text></View></View>
        )}
        <View style={pl.arabicCard}><Text style={pl.arabicText}>{dua.arabic}</Text></View>
        <TouchableOpacity style={pl.sectionToggle}
          onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setShowTranslit(v => !v); }} activeOpacity={0.8}>
          <Text style={pl.sectionLabel}>TRANSLITERATION</Text>
          <Text style={pl.sectionChev}>{showTranslit ? "\u25b2" : "\u25bc"}</Text>
        </TouchableOpacity>
        {showTranslit && <Text style={pl.translitText}>{dua.transliteration}</Text>}
        <TouchableOpacity style={[pl.sectionToggle, { marginTop:spacing(1.5) }]}
          onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setShowTrans(v => !v); }} activeOpacity={0.8}>
          <Text style={pl.sectionLabel}>TRANSLATION</Text>
          <Text style={pl.sectionChev}>{showTrans ? "\u25b2" : "\u25bc"}</Text>
        </TouchableOpacity>
        {showTrans && <Text style={pl.transText}>{dua.translation}</Text>}
        {dua.source && <Text style={pl.sourceText}>{dua.source}</Text>}
        <View style={{ height:spacing(14) }} />
      </ScrollView>
      <View style={pl.controls}>
        <TouchableOpacity style={[pl.ctrlBtn, !hasPrev ? pl.ctrlBtnDisabled : null]} onPress={onPrev} disabled={!hasPrev} activeOpacity={0.7}>
          <Text style={[pl.ctrlIcon, !hasPrev ? pl.ctrlIconDisabled : null]}>{"\u21ba"}</Text>
          <Text style={[pl.ctrlLabel, !hasPrev ? pl.ctrlIconDisabled : null]}>Repeat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={pl.playBtn} activeOpacity={0.85}><Text style={pl.playIcon}>{"\u25b6"}</Text></TouchableOpacity>
        <TouchableOpacity style={[pl.ctrlBtn, !hasNext ? pl.ctrlBtnDisabled : null]} onPress={onNext} disabled={!hasNext} activeOpacity={0.7}>
          <Text style={[pl.ctrlIcon, !hasNext ? pl.ctrlIconDisabled : null]}>{"\u2192"}</Text>
          <Text style={[pl.ctrlLabel, !hasNext ? pl.ctrlIconDisabled : null]}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const pl = StyleSheet.create({
  wrap:            { flex:1, backgroundColor:"#EDE6D8" },
  header:          { flexDirection:"row", alignItems:"center", gap:8, paddingHorizontal:16, paddingVertical:12, borderBottomWidth:1, borderBottomColor:"#D4D0CA", backgroundColor:"#FDFAF4" },
  iconBtn:         { width:36, height:36, borderRadius:18, backgroundColor:"#EDE6D8", borderWidth:1, borderColor:"#D4D0CA", alignItems:"center", justifyContent:"center",
    shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4,},
  iconBtnTxt:      { fontSize:20, color:"#1A1712", lineHeight:24 },
  bookmark:        { fontSize:20, color:"#D4D0CA" },
  bookmarkActive:  { color:"#C8A96A" },
  headerMid:       { flex:1, alignItems:"center" },
  stage:           { fontSize:12, color:"#C8A96A", fontWeight:"500", letterSpacing:0.8 },
  title:           { fontFamily:SERIF, fontSize:16, color:"#1A1712" },
  scroll:          { flex:1 },
  scrollContent:   { paddingHorizontal:20 },
  featuredRow:     { alignItems:"flex-start", marginTop:16 },
  featuredBadge:   { backgroundColor:"#C8A96A", paddingHorizontal:8, paddingVertical:3, borderRadius:4 },
  featuredText:    { fontSize:10, color:"#FDFAF4", fontWeight:"700", letterSpacing:1.2 },
  arabicCard:      { backgroundColor:"#FDFAF4", borderRadius:12, borderWidth:1, borderColor:"#D4D0CA", padding:20, marginTop:12, marginBottom:16, shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4 },
  arabicText:      { fontSize:28, color:"#1A1712", textAlign:"right", lineHeight:52, fontWeight:"400" },
  sectionToggle:   { flexDirection:"row", justifyContent:"space-between", alignItems:"center", paddingVertical:8, borderTopWidth:1, borderTopColor:"#D4D0CA" },
  sectionLabel:    { fontSize:10, fontWeight:"600", color:"#C8A96A", letterSpacing:1.8 },
  sectionChev:     { fontSize:10, color:"#D4D0CA", fontWeight:"600" },
  translitText:    { fontSize:14, color:"#5A5650", fontStyle:"italic", lineHeight:14*1.7, fontWeight:"400", paddingVertical:8 },
  transText:       { fontFamily:SERIF, fontSize:16, color:"#1A1712", lineHeight:16*1.65, fontWeight:"400", paddingVertical:8 },
  sourceText:      { fontSize:12, color:"#5A5650", marginTop:8, opacity:0.7 },
  controls:        { position:"absolute", bottom:0, left:0, right:0, flexDirection:"row", alignItems:"center", justifyContent:"space-around", paddingVertical:16, paddingBottom:24, backgroundColor:"#FDFAF4", borderTopWidth:1, borderTopColor:"#D4D0CA", shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4 },
  ctrlBtn:         { alignItems:"center", gap:4, width:64 },
  ctrlBtnDisabled: { opacity:0.3 },
  ctrlIcon:        { fontSize:22, color:"#5A5650" },
  ctrlIconDisabled:{ color:"#D4D0CA" },
  ctrlLabel:       { fontSize:12, color:"#5A5650", fontWeight:"400" },
  playBtn:         { width:64, height:64, borderRadius:32, backgroundColor:"#2F5D50", alignItems:"center", justifyContent:"center", shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4 },
  playIcon:        { fontSize:22, color:"#FDFAF4", marginLeft:3 },
});

// ── Step row ──────────────────────────────────────────────────────────────────
function StepRow({ step, isLast, onPress }) {
  return (
    <TouchableOpacity style={[sr.row, isLast ? sr.rowLast : null, step.active ? sr.rowActive : null]}
      onPress={onPress} activeOpacity={0.85} disabled={!step.duas || step.duas.length === 0}>
      <View style={[sr.num, step.done ? sr.numDone : null, step.active ? sr.numActive : null]}>
        {step.done ? <Text style={sr.numTick}>{"✓"}</Text>
          : <Text style={[sr.numText, step.active ? sr.numTextActive : null]}>{step.number}</Text>}
      </View>
      <View style={sr.info}>
        <Text style={[sr.name, step.active ? sr.nameActive : null, step.done ? sr.nameDone : null]}>{step.name}</Text>
        <Text style={sr.sub}>{step.sub}</Text>
      </View>
      {step.duas ? step.duas.length : null > 0 && (
        <View style={sr.badge}><Text style={sr.badgeText}>{step.duas.length} {step.duas.length===1?"du\u02bf\u0101\u02be":"du\u02bf\u0101\u02bes"}</Text></View>
      )}
      <Text style={sr.arrow}>{"\u203a"}</Text>
    </TouchableOpacity>
  );
}

const sr = StyleSheet.create({
  row:           { flexDirection:"row", alignItems:"center", gap:12, paddingVertical:14, paddingHorizontal:16, borderBottomWidth:1, borderBottomColor:"#D4D0CA", backgroundColor:"#FDFAF4" },
  rowLast:       { borderBottomWidth:0 },
  rowActive:     { backgroundColor:"rgba(47,93,80,0.05)" },
  num:           { width:34, height:34, borderRadius:17, backgroundColor:"#D4D0CA", alignItems:"center", justifyContent:"center", flexShrink:0 },
  numDone:       { backgroundColor:"#2F5D50" },
  numActive:     { backgroundColor:"#2F5D50" },
  numText:       { fontSize:14, color:"#5A5650", fontWeight:"500" },
  numTextActive: { color:"#FDFAF4" },
  numTick:       { fontSize:14, color:"#FDFAF4", fontWeight:"700" },
  info:          { flex:1 },
  name:          { fontFamily:SERIF, fontSize:16, color:"#1A1712", marginBottom:2 },
  nameActive:    { color:"#2F5D50" },
  nameDone:      { color:"#5A5650" },
  sub:           { fontSize:14, color:"#5A5650", fontWeight:"400" },
  badge:         { backgroundColor:"rgba(47,93,80,0.10)", borderRadius:999, paddingHorizontal:8, paddingVertical:3 },
  badgeText:     { fontSize:12, color:"#2F5D50", fontWeight:"500" },
  arrow:         { fontSize:18, color:"#D4D0CA" },
});


// ── Checklist data ────────────────────────────────────────────────────────────
const DEFAULT_HAJJ_CHECKLIST = [
  { id:"hc1",  text:"Obtain Hajj visa and travel documents" },
  { id:"hc2",  text:"Book flights and accommodation in Makkah and Madinah" },
  { id:"hc3",  text:"Register with an authorised Hajj operator" },
  { id:"hc4",  text:"Arrange Udhiya (Qurbani) with a licensed agency" },
  { id:"hc5",  text:"Pack Ihram garments and travel essentials" },
  { id:"hc6",  text:"Learn the steps and intentions for each rite" },
  { id:"hc7",  text:"Attend a Hajj preparation course or workshop" },
  { id:"hc8",  text:"Get any required vaccinations (meningitis, flu)" },
  { id:"hc9",  text:"Arrange power of attorney and affairs before departure" },
  { id:"hc10", text:"Write down the contact details of your Hajj group leader" },
  { id:"hc11", text:"Memorise key duʿāʾs for Tawaf, Saʿi, and Arafah" },
  { id:"hc12", text:"Pack comfortable walking shoes and unscented toiletries" },
];

const DEFAULT_UMRAH_CHECKLIST = [
  { id:"uc1",  text:"Obtain a valid Umrah visa" },
  { id:"uc2",  text:"Book flights and accommodation near the Haram" },
  { id:"uc3",  text:"Pack Ihram garments and travel essentials" },
  { id:"uc4",  text:"Learn the steps and intentions for each rite" },
  { id:"uc5",  text:"Memorise the Talbiyah and duʿāʾ for entering Ihram" },
  { id:"uc6",  text:"Get any required vaccinations (meningitis, flu)" },
  { id:"uc7",  text:"Plan visits to sacred sites in Makkah and Madinah" },
  { id:"uc8",  text:"Pack comfortable walking shoes and unscented toiletries" },
  { id:"uc9",  text:"Arrange travel insurance and emergency contacts" },
  { id:"uc10", text:"Notify your bank of travel and exchange currency to SAR" },
];

// ── Main screen ───────────────────────────────────────────────────────────────
export default function JourneyScreen({ navigation }) {
  const [mode,           setMode]           = useState("umrah");
  const [playerDua,      setPlayerDua]      = useState(null);
  const [playerStep,     setPlayerStep]     = useState(null);
  const [duaIndex,       setDuaIndex]       = useState(0);
  const [boardCards,     setBoardCards]     = useState([]);
  const [contacts,       setContacts]       = useState([]);
  const [showCarousel,     setShowCarousel]     = useState(false);
  const [showCalendar,     setShowCalendar]     = useState(false);
  const [departureDateStr, setDepartureDateStr] = useState("2025-11-15");
  const [selectedDayLabel, setSelectedDayLabel] = useState(null);
  const [calEntries,       setCalEntries]       = useState({});
  const [addingEntry,      setAddingEntry]      = useState(null); // date string being annotated
  const [entryText,        setEntryText]        = useState("");
  const [checklistOpen,  setChecklistOpen]  = useState(false);
  const [checkDone,      setCheckDone]      = useState({});
  const [checkItems,     setCheckItems]     = useState(null); // null = use defaults
  const [editingItem,    setEditingItem]    = useState(null); // { id, text }

  const steps = mode === "umrah" ? UMRAH_STEPS : HAJJ_STEPS;
  const departureDate = new Date(departureDateStr);
  const daysUntil = !isNaN(departureDate) ? Math.max(0, Math.ceil((departureDate - new Date()) / (1000 * 60 * 60 * 24))) : 0;

  useEffect(() => {
    AsyncStorage.getItem(BOARD_KEY).then(v => { if (v) setBoardCards(JSON.parse(v)); }).catch(() => {});
    AsyncStorage.getItem(CONTACTS_KEY).then(v => { if (v) setContacts(JSON.parse(v)); }).catch(() => {});
    AsyncStorage.getItem(DEPARTURE_KEY).then(v => { if (v) setDepartureDateStr(v); }).catch(() => {});
    AsyncStorage.getItem("safar_cal_entries_v1").then(v => { if (v) setCalEntries(JSON.parse(v)); }).catch(() => {});
  }, []);

  // Load checklist state when mode changes
  useEffect(() => {
    const key = mode === "hajj" ? HAJJ_CHECK_KEY : UMRAH_CHECK_KEY;
    AsyncStorage.getItem(key).then(v => { if (v) setCheckDone(JSON.parse(v)); else setCheckDone({}); }).catch(() => {});
    setCheckItems(null); // reset to defaults when mode changes
    setChecklistOpen(false);
  }, [mode]);

  const activeChecklist = checkItems ?? (mode === "hajj" ? DEFAULT_HAJJ_CHECKLIST : DEFAULT_UMRAH_CHECKLIST);

  const toggleCheckItem = (id) => {
    const next = { ...checkDone, [id]: !checkDone[id] };
    setCheckDone(next);
    const key = mode === "hajj" ? HAJJ_CHECK_KEY : UMRAH_CHECK_KEY;
    AsyncStorage.setItem(key, JSON.stringify(next)).catch(() => {});
  };

  const saveEditedItem = (id, newText) => {
    if (!newText.trim()) return;
    const base = checkItems ?? (mode === "hajj" ? DEFAULT_HAJJ_CHECKLIST : DEFAULT_UMRAH_CHECKLIST);
    const updated = base.map(item => item.id === id ? { ...item, text: newText.trim() } : item);
    setCheckItems(updated);
    setEditingItem(null);
  };

  const checkCompletedCount = Object.values(checkDone).filter(Boolean).length;

  // Build marked dates — Hajj key dates in gold, departure in green
  const entryDots = Object.keys(calEntries)
    .filter(d => (calEntries[d] ?? []).length > 0)
    .reduce((acc, d) => ({ ...acc, [d]: { marked:true, dotColor:"#2F5D50" } }), {});

  const markedDates = {
    ...HAJJ_KEY_DATES,
    ...entryDots,
    [departureDateStr]: {
      selected: true,
      selectedColor: "#2F5D50",
      marked: true,
      dotColor: "#C8A96A",
    },
  };

  const handleDayPress = (day) => {
    const dateStr = day.dateString;
    // First tap sets departure, subsequent taps on same date open entry adder
    if (dateStr !== departureDateStr) {
      setDepartureDateStr(dateStr);
      AsyncStorage.setItem(DEPARTURE_KEY, dateStr).catch(() => {});
    }
    setAddingEntry(dateStr);
    setEntryText("");
    if (HAJJ_KEY_DATES[dateStr]) {
      setSelectedDayLabel(HAJJ_KEY_DATES[dateStr].label);
    } else {
      setSelectedDayLabel(null);
    }
  };

  const saveEntry = () => {
    if (!entryText.trim() || !addingEntry) return;
    const updated = {
      ...calEntries,
      [addingEntry]: [...(calEntries[addingEntry] ?? []), entryText.trim()],
    };
    setCalEntries(updated);
    AsyncStorage.setItem("safar_cal_entries_v1", JSON.stringify(updated)).catch(() => {});
    setEntryText("");
    setAddingEntry(null);
  };

  const removeEntry = (dateStr, idx) => {
    const updated = {
      ...calEntries,
      [dateStr]: (calEntries[dateStr] ?? []).filter((_, i) => i !== idx),
    };
    setCalEntries(updated);
    AsyncStorage.setItem("safar_cal_entries_v1", JSON.stringify(updated)).catch(() => {});
  };

  const dDate = new Date(departureDateStr + "T00:00:00");
  const departureDayNum   = !isNaN(dDate) ? dDate.getDate().toString() : "--";
  const departureMonthYr  = !isNaN(dDate) ? dDate.toLocaleDateString("en-GB", { month:"long", year:"numeric" }) : "";

  const openStep  = step => { if (!step.duas?.length) return; setPlayerStep(step); setDuaIndex(0); setPlayerDua(step.duas[0]); };
  const handleNext = () => { const d = playerStep?.duas ?? []; if (duaIndex+1 < d.length) { setDuaIndex(duaIndex+1); setPlayerDua(d[duaIndex+1]); } };
  const handlePrev = () => { if (duaIndex-1 >= 0) { setDuaIndex(duaIndex-1); setPlayerDua(playerStep.duas[duaIndex-1]); } };

  if (playerDua) return (
    <SafeAreaView style={{ flex:1, backgroundColor:colors.background }}>
      <DuaPlayer dua={playerDua} onClose={() => setPlayerDua(null)}
        onNext={handleNext} onPrev={handlePrev}
        hasPrev={duaIndex > 0} hasNext={duaIndex < (playerStep?.duas?.length ?? 1) - 1} />
    </SafeAreaView>
  );

  const completedCount = steps.filter(s => s.done).length;
  const boardDone      = boardCards.filter(c => c.type==="checklist" ? c.done : null).length;
  const boardChecklist = boardCards.filter(c => c.type==="checklist").length;

  return (
    <SafeAreaView style={jn.safe}>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex:1 }} contentContainerStyle={jn.scroll}>

        {/* ── Page header ── */}
        <View style={jn.pageHeader}>
          <View style={jn.pageTitleRow}>
            <Text style={jn.pageTitle}>My Journey</Text>
            <View style={jn.departureBadge}>
              <Text style={jn.departureDays}>{daysUntil}</Text>
              <Text style={jn.departureLbl}>{"days to go"}</Text>
            </View>
          </View>
          <Text style={jn.pageSub}>{"Your hub to plan and prepare\nevery step with confidence."}</Text>
        </View>

        {/* ── 1. Mode toggle ── */}
        <View style={jn.modeWrap}>
          <View style={jn.modeToggle}>
            {[
              { key:"umrah", name:"UMRAH", sub:"Any time of year" },
              { key:"hajj",  name:"HAJJ",  sub:"Dhul Hijjah" },
            ].map(m => (
              <TouchableOpacity key={m.key}
                style={mode === m.key ? [jn.modeOpt, jn.modeOptActive] : jn.modeOpt}
                onPress={() => setMode(m.key)} activeOpacity={0.8}>
                <Text style={mode === m.key ? [jn.modeName, jn.modeNameActive] : jn.modeName}>{m.name}</Text>
                <Text style={mode === m.key ? [jn.modeSub, jn.modeSubActive] : jn.modeSub}>{m.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── 2b. Dates card ── */}
        <TouchableOpacity style={jn.datesCard} onPress={() => setShowCalendar(true)} activeOpacity={0.88}>
          <View style={jn.datesCardLeft}>
            <Text style={jn.datesCardEyebrow}>CALENDAR</Text>
            <Text style={jn.datesCardTitle}>Mark Your Dates</Text>
            <Text style={jn.datesCardSub}>{"Set your departure, Hajj days\nand other important dates"}</Text>
          </View>
          <View style={jn.datesCardDivider} />
          <View style={jn.datesCardRight}>
            <Text style={jn.datesCardDayNum}>{departureDayNum}</Text>
            <Text style={jn.datesCardMonthYr}>{departureMonthYr}</Text>
            <Text style={jn.datesCardDays}>{daysUntil} days away</Text>
          </View>
        </TouchableOpacity>

        {/* ── Calendar bottom sheet ── */}
        <Modal visible={showCalendar} animationType="slide" transparent
          onRequestClose={() => setShowCalendar(false)}>
          <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==="ios" ? "padding" : "height"}>
            {/* Tap outside to dismiss */}
            <TouchableOpacity style={jn.calOverlay} activeOpacity={1}
              onPress={() => { setShowCalendar(false); setAddingEntry(null); }}>
              <View style={jn.calSheet}>
              <TouchableOpacity style={{ flex:1 }} activeOpacity={1} onPress={() => {}}>

                {/* ── Fixed top: handle + header + legend + calendar ── */}
                <View style={jn.calFixed}>
                  <View style={jn.calHandle} />

                  <View style={jn.calHeader}>
                    <View>
                      <Text style={jn.calTitle}>My Journey Dates</Text>
                      <Text style={jn.calSub}>Tap a date to set departure or add a note</Text>
                    </View>
                    <TouchableOpacity style={jn.calCloseBtn}
                      onPress={() => { setShowCalendar(false); setAddingEntry(null); }}>
                      <Text style={jn.calCloseTxt}>{"Done"}</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={jn.calLegend}>
                    <View style={jn.calLegendItem}>
                      <View style={[jn.calLegendDot, { backgroundColor:"#2F5D50" }]} />
                      <Text style={jn.calLegendTxt}>Departure / notes</Text>
                    </View>
                    <View style={jn.calLegendItem}>
                      <View style={[jn.calLegendDot, { backgroundColor:"#C8A96A" }]} />
                      <Text style={jn.calLegendTxt}>Key Hajj dates</Text>
                    </View>
                  </View>

                  <Calendar
                    current={departureDateStr}
                    onDayPress={handleDayPress}
                    markedDates={markedDates}
                    markingType="dot"
                    theme={{
                      backgroundColor: "#FDFAF4",
                      calendarBackground: "#FDFAF4",
                      textSectionTitleColor: "#5A5650",
                      selectedDayBackgroundColor: "#2F5D50",
                      selectedDayTextColor: "#fff",
                      todayTextColor: "#2F5D50",
                      todayBackgroundColor: "#EBF2EE",
                      dayTextColor: "#1A1712",
                      textDisabledColor: "#C4C0BA",
                      dotColor: "#C8A96A",
                      selectedDotColor: "#C8A96A",
                      arrowColor: "#2F5D50",
                      monthTextColor: "#1A1712",
                      textMonthFontFamily: "SourceSerif4-Regular",
                      textMonthFontSize: 18,
                      textDayHeaderFontSize: 12,
                      textDayFontSize: 15,
                    }}
                  />

                  {/* Divider between calendar and entries */}
                  <View style={jn.calDivider} />
                </View>

                {/* ── Scrollable entries panel ── */}
                <ScrollView
                  style={jn.calEntriesScroll}
                  contentContainerStyle={jn.calEntriesContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  {/* Hajj key date label */}
                  {selectedDayLabel && (
                    <View style={jn.calDayLabel}>
                      <Text style={jn.calDayLabelIcon}>{"🕋"}</Text>
                      <Text style={jn.calDayLabelTxt}>{selectedDayLabel}</Text>
                    </View>
                  )}

                  {/* Entry input for selected date */}
                  {addingEntry && (
                    <View style={jn.calEntryInputWrap}>
                      <Text style={jn.calEntryDateHdr}>
                        {new Date(addingEntry + "T00:00:00").toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long" })}
                      </Text>
                      <View style={jn.calEntryInputRow}>
                        <TextInput
                          style={jn.calEntryInput}
                          placeholder="Add a note for this date..."
                          placeholderTextColor="#9A8E7A"
                          value={entryText}
                          onChangeText={setEntryText}
                          onSubmitEditing={saveEntry}
                          returnKeyType="done"
                          autoFocus
                        />
                        <TouchableOpacity style={jn.calEntrySaveBtn} onPress={saveEntry} activeOpacity={0.85}>
                          <Text style={jn.calEntrySaveTxt}>{"Add"}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Empty entries state */}
                  {Object.keys(calEntries).filter(d => (calEntries[d] ?? []).length > 0).length === 0 &&
                   !addingEntry && (
                    <Text style={jn.calEntriesEmpty}>
                      {"Tap any date to add a note, reminder or intention."}
                    </Text>
                  )}

                  {/* All entries — grouped by date, sorted */}
                  {Object.keys(calEntries)
                    .filter(d => (calEntries[d] ?? []).length > 0)
                    .sort()
                    .map(dateStr => (
                      <View key={dateStr} style={jn.calEntryGroup}>
                        <Text style={jn.calEntryGroupDate}>
                          {new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", { weekday:"short", day:"numeric", month:"long" })}
                          {dateStr === departureDateStr ? "  ✈️" : ""}
                          {HAJJ_KEY_DATES[dateStr] ? "  🕋" : ""}
                        </Text>
                        {(calEntries[dateStr] ?? []).map((entry, idx) => (
                          <View key={idx} style={jn.calEntryRow}>
                            <View style={jn.calEntryDot} />
                            <Text style={jn.calEntryTxt}>{entry}</Text>
                            <TouchableOpacity
                              onPress={() => removeEntry(dateStr, idx)}
                              hitSlop={{top:8,bottom:8,left:8,right:8}}>
                              <Text style={jn.calEntryRemove}>{"×"}</Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    ))
                  }

                  {/* Scholarly note */}
                  <View style={jn.calNote}>
                    <Text style={jn.calNoteTxt}>
                      {"Gold dots mark estimated Hajj 1446 AH dates. Verify with your local authority or Hajj operator before travel."}
                    </Text>
                  </View>

                  <View style={{ height:32 }} />
                </ScrollView>

              </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </Modal>

        {/* ── 3. Guide card ── */}
        <TouchableOpacity style={jn.wideCard}
          onPress={() => setShowCarousel(true)}
          activeOpacity={0.92}>
          <ImageBackground
            source={require("../assets/kaaba_mixed.png")}
            style={jn.wideCardBg}
            imageStyle={{ resizeMode:"cover" }}>
            <View style={jn.guideCardScrim} />
            <View style={jn.wideCardContent}>
              <View style={jn.wideCardTopRow}>
                <View style={jn.guideCardBadge}>
                  <Text style={jn.guideCardBadgeTxt}>{mode === "umrah" ? "UMRAH" : "HAJJ"}</Text>
                </View>
                <Text style={jn.wideCardArrow}>{"›"}</Text>
              </View>
              <View>
                <Text style={jn.wideCardTitle}>{mode === "umrah" ? "Umrah Guide" : "Hajj Guide"}</Text>
                <Text style={jn.wideCardSub}>{"Complete step-by-step " + (mode === "umrah" ? "Umrah" : "Hajj") + " walkthrough"}</Text>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* ── 4. Journey Board card ── */}
        <TouchableOpacity style={jn.wideCard}
          onPress={() => navigation?.navigate?.("MyBoard")}
          activeOpacity={0.88}>
          <ImageBackground
            source={require("../assets/myboard.jpg")}
            style={jn.wideCardBg}
            imageStyle={{ resizeMode:"cover" }}>
            <View style={jn.wideCardScrim} />
            <View style={jn.wideCardContent}>
              <View style={jn.wideCardTopRow}>
                <View style={{ flex:1 }} />
                <Text style={jn.wideCardArrow}>{"›"}</Text>
              </View>
              <View>
                <Text style={jn.wideCardEyebrow}>YOUR BOARD</Text>
                <Text style={jn.wideCardTitle}>My Journey Board</Text>
                <Text style={jn.wideCardSub}>Notes, duas, links & reminders</Text>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* ── 5. Sacred Places ── */}
        <TouchableOpacity style={jn.wideCard}
          onPress={() => navigation?.navigate?.("Map")}
          activeOpacity={0.88}>
          <ImageBackground
            source={require("../assets/kaaba_map.png")}
            style={jn.wideCardBg}
            imageStyle={{ resizeMode:"cover" }}>
            <View style={jn.wideCardScrimDark} />
            <View style={jn.wideCardContent}>
              {/* Counter — top right */}
              <View style={jn.wideCardTopRow}>
                <View style={{ flex:1 }} />
                <View style={jn.wideCardCountBadge}>
                  <Text style={jn.wideCardCountNum}>14</Text>
                  <Text style={jn.wideCardCountLbl}>sites</Text>
                </View>
              </View>
              {/* Title + arrow row — bottom */}
              <View style={jn.wideCardBottomRow}>
                <View>
                  <Text style={jn.wideCardEyebrow}>LOCATIONS</Text>
                  <Text style={jn.wideCardTitle}>Sacred Places</Text>
                  <Text style={jn.wideCardSub}>{"Du'as for each location"}</Text>
                </View>
                <Text style={jn.wideCardArrowBottom}>{"›"}</Text>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* ── 6. Duas card ── */}
        <TouchableOpacity style={jn.wideCard}
          onPress={() => navigation?.navigate?.("DuaList", { filter: mode === "umrah" ? "Umrah" : "Hajj" })}
          activeOpacity={0.88}>
          <ImageBackground
            source={require("../assets/tab_shared_duas.jpg")}
            style={jn.wideCardBg}
            imageStyle={{ resizeMode:"cover" }}>
            <View style={jn.wideCardScrim} />
            <View style={jn.wideCardContent}>
              <View style={jn.wideCardTopRow}>
                <View style={{ flex:1 }} />
                <View style={jn.wideCardCountBadge}>
                  <Text style={jn.wideCardCountNum}>{mode === "umrah" ? "9" : "11"}</Text>
                  <Text style={jn.wideCardCountLbl}>duas</Text>
                </View>
              </View>
              <View style={jn.wideCardBottomRow}>
                <View>
                  <Text style={jn.wideCardEyebrow}>{"DU'AS"}</Text>
                  <Text style={jn.wideCardTitle}>{mode === "umrah" ? "Umrah Du'as" : "Hajj Du'as"}</Text>
                  <Text style={jn.wideCardSub}>{"Authenticated du'as for every step"}</Text>
                </View>
                <Text style={jn.wideCardArrowBottom}>{"›"}</Text>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* ── 7. What to Expect ── */}
        <TouchableOpacity style={jn.wideCard}
          onPress={() => navigation?.navigate?.("WhatToExpect")}
          activeOpacity={0.88}>
          <ImageBackground
            source={require("../assets/what_to_expect.jpg")}
            style={jn.wideCardBg}
            imageStyle={{ resizeMode:"cover" }}>
            <View style={jn.wideCardScrim} />
            <View style={jn.wideCardContent}>
              {/* Counter — top right */}
              <View style={jn.wideCardTopRow}>
                <View style={{ flex:1 }} />
                <View style={jn.wideCardCountBadge}>
                  <Text style={jn.wideCardCountNum}>8</Text>
                  <Text style={jn.wideCardCountLbl}>topics</Text>
                </View>
              </View>
              {/* Title + arrow row — bottom */}
              <View style={jn.wideCardBottomRow}>
                <View>
                  <Text style={jn.wideCardEyebrow}>LOGISTICS</Text>
                  <Text style={jn.wideCardTitle}>What to Expect</Text>
                  <Text style={jn.wideCardSub}>Health, worship & travel tips</Text>
                </View>
                <Text style={jn.wideCardArrowBottom}>{"›"}</Text>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* ── 7. Checklist dropdown ── */}
        <TouchableOpacity style={jn.checklistHeader} onPress={() => setChecklistOpen(v => !v)} activeOpacity={0.85}>
          <ImageBackground
            source={mode === "hajj" ? require("../assets/07_arafah_gradient.jpg") : require("../assets/tab_dua_library.jpg")}
            style={jn.checklistHeaderBg}
            imageStyle={{ resizeMode:"cover", borderRadius:16 }}>
            <View style={jn.checklistHeaderScrim} />
            <View style={jn.checklistHeaderContent}>
              <View style={jn.checklistHeaderLeft}>
                <Text style={jn.checklistEyebrow}>PREPARATION</Text>
                <Text style={jn.checklistTitle}>{mode === "hajj" ? "My Hajj Checklist" : "My Umrah Checklist"}</Text>
                <Text style={jn.checklistProgress}>{checkCompletedCount}/{activeChecklist.length} completed</Text>
              </View>
              <View style={jn.checklistHeaderRight}>
                <View style={jn.miniProgTrack}>
                  <View style={[jn.miniProgFill, { width: (checkCompletedCount / activeChecklist.length * 100) + "%" }]} />
                </View>
                <Text style={jn.checklistChev}>{checklistOpen ? "▲" : "▼"}</Text>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {checklistOpen && (
          <View style={jn.checklistBody}>
            {/* Explainer */}
            <View style={jn.checklistExplainer}>
              <Text style={jn.checklistExplainerIcon}>{"💡"}</Text>
              <Text style={jn.checklistExplainerTxt}>
                {"These are suggested items. Tap any entry to edit it, or add your own below."}
              </Text>
            </View>
            {activeChecklist.map((item, idx) => (
              <View key={item.id} style={[jn.checkRow, jn.checkRowBorder]}>
                <TouchableOpacity onPress={() => toggleCheckItem(item.id)} activeOpacity={0.8}>
                  <View style={checkDone[item.id] ? [jn.checkBox, jn.checkBoxDone] : jn.checkBox}>
                    {checkDone[item.id] ? <Text style={jn.checkMark}>{"✓"}</Text> : null}
                  </View>
                </TouchableOpacity>
                {editingItem?.id === item.id ? (
                  <TextInput
                    style={jn.checkInput}
                    value={editingItem.text}
                    onChangeText={t => setEditingItem({ id: item.id, text: t })}
                    onBlur={() => saveEditedItem(item.id, editingItem.text)}
                    onSubmitEditing={() => saveEditedItem(item.id, editingItem.text)}
                    autoFocus
                    returnKeyType="done"
                  />
                ) : (
                  <TouchableOpacity style={{ flex:1 }} onPress={() => setEditingItem({ id: item.id, text: item.text })} activeOpacity={0.7}>
                    <Text style={checkDone[item.id] ? [jn.checkTxt, jn.checkTxtDone] : jn.checkTxt}>{item.text}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setEditingItem({ id: item.id, text: item.text })} hitSlop={{top:8,bottom:8,left:8,right:8}}>
                  <Text style={jn.checkEditIcon}>{"✎"}</Text>
                </TouchableOpacity>
              </View>
            ))}
            {/* Add item row */}
            {editingItem?.id === "__new__" ? (
              <View style={jn.checkAddActive}>
                <TextInput
                  style={jn.checkInput}
                  placeholder="Add a checklist item..."
                  placeholderTextColor="#9A8E7A"
                  value={editingItem.text}
                  onChangeText={t => setEditingItem({ id:"__new__", text:t })}
                  onBlur={() => {
                    if (editingItem.text.trim()) {
                      const newId = "custom_" + Date.now();
                      const base = checkItems ?? (mode === "hajj" ? DEFAULT_HAJJ_CHECKLIST : DEFAULT_UMRAH_CHECKLIST);
                      setCheckItems([...base, { id:newId, text:editingItem.text.trim() }]);
                    }
                    setEditingItem(null);
                  }}
                  onSubmitEditing={() => {
                    if (editingItem.text.trim()) {
                      const newId = "custom_" + Date.now();
                      const base = checkItems ?? (mode === "hajj" ? DEFAULT_HAJJ_CHECKLIST : DEFAULT_UMRAH_CHECKLIST);
                      setCheckItems([...base, { id:newId, text:editingItem.text.trim() }]);
                    }
                    setEditingItem(null);
                  }}
                  autoFocus
                  returnKeyType="done"
                />
              </View>
            ) : (
              <TouchableOpacity style={jn.checkAddRow}
                onPress={() => setEditingItem({ id:"__new__", text:"" })}
                activeOpacity={0.8}>
                <View style={jn.checkAddIcon}>
                  <Text style={jn.checkAddPlus}>{"+"}</Text>
                </View>
                <Text style={jn.checkAddTxt}>Add an item</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ── 8. My Contacts (left) + My Groups (right) ── */}
        <View style={jn.pairRow}>

          <TouchableOpacity style={jn.pairCard}
            onPress={() => navigation?.navigate?.("MyContacts")}
            activeOpacity={0.88}>
            <ImageBackground
              source={require("../assets/contacts2.png")}
              style={jn.pairCardBg}
              imageStyle={{ resizeMode:"cover" }}>
              <View style={jn.pairCardScrim} />
              <View style={jn.pairCardContent}>
                <Text style={jn.pairCardEyebrow}>CONTACTS</Text>
                <Text style={jn.pairCardTitle}>My Contacts</Text>
                <Text style={jn.pairCardSub}>Hotel, guide & emergency</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>

          <TouchableOpacity style={jn.pairCard}
            onPress={() => navigation?.navigate?.("Groups")}
            activeOpacity={0.88}>
            <ImageBackground
              source={require("../assets/myboard.jpg")}
              style={jn.pairCardBg}
              imageStyle={{ resizeMode:"cover" }}>
              <View style={jn.pairCardScrimLight} />
              <View style={jn.pairCardContent}>
                <Text style={jn.pairCardEyebrow}>COMMUNITY</Text>
                <Text style={jn.pairCardTitle}>My Groups</Text>
                <Text style={jn.pairCardSub}>Share milestones & updates</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>

        </View>

        <View style={{ height:40 }} />
      </ScrollView>

      <GuideCarousel
        visible={showCarousel}
        steps={mode === "umrah" ? UMRAH_GUIDE_STEPS : HAJJ_GUIDE_STEPS}
        title={mode === "umrah" ? "Umrah Guide" : "Hajj Guide"}
        onClose={() => setShowCarousel(false)}
      />

    </SafeAreaView>
  );
}

const jn = StyleSheet.create({
  safe:   { flex:1, backgroundColor:"#EDE6D8" },
  scroll: { paddingHorizontal:20, paddingTop:0 },

  // ── Page header ─────────────────────────────────────────────────────────────
  pageHeader:    { paddingTop:14, paddingBottom:10, paddingHorizontal:2 },
  pageTitleRow:  { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:4 },
  pageTitle:     { fontFamily:SERIF, fontSize:32, fontWeight:"400", color:"#1A1712", flex:1 },
  pageSub:       { fontSize:14, color:"#5A5650", lineHeight:22, fontWeight:"400", maxWidth:"68%" },
  departureBadge:{ alignItems:"center", backgroundColor:"#FDFAF4", borderRadius:10, borderWidth:1, borderColor:"#C4A882", paddingHorizontal:12, paddingVertical:5, marginLeft:12, shadowColor:"#6A4A28", shadowOffset:{width:0,height:2}, shadowOpacity:0.10, shadowRadius:4, elevation:2 },
  departureDays: { fontFamily:SERIF, fontSize:20, color:"#1A1712", fontWeight:"400" },
  departureLbl:  { fontSize:9, color:"#5A5650", textAlign:"center", letterSpacing:0.3 },

  // ── 1. Board hero ────────────────────────────────────────────────────────────
  boardHero:          { borderRadius:0, overflow:"hidden", height:234, marginBottom:14, marginHorizontal:-20 },
  boardHeroBg:        { flex:1 },
  boardHeroScrim:     { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(10,8,4,0.30)" },
  boardDeparture:     { position:"absolute", top:16, right:20, alignItems:"flex-end", backgroundColor:"rgba(10,8,4,0.35)", borderRadius:10, paddingHorizontal:12, paddingVertical:6, borderWidth:1, borderColor:"rgba(196,168,130,0.5)" },
  boardDepartureDays: { fontFamily:SERIF, fontSize:22, color:"#fff", fontWeight:"400", lineHeight:26 },
  boardDepartureLbl:  { fontSize:9, color:"rgba(255,255,255,0.7)", letterSpacing:0.5, textAlign:"right" },
  boardHeroContent:   { position:"absolute", bottom:0, left:0, right:0, padding:20 },
  boardEyebrow:       { fontSize:10, fontWeight:"700", letterSpacing:2, color:"rgba(240,228,200,0.75)", marginBottom:4 },
  boardTitle:         { fontFamily:SERIF, fontSize:26, color:"#fff", fontWeight:"400", marginBottom:3 },
  boardSub:           { fontSize:15, color:"rgba(255,255,255,0.72)", marginBottom:12 },
  boardStats:         { flexDirection:"row", gap:16, alignItems:"center" },
  boardStat:          { alignItems:"flex-start" },
  boardStatNum:       { fontFamily:SERIF, fontSize:28, color:"#fff", fontWeight:"400", lineHeight:32 },
  boardStatLbl:       { fontSize:10, color:"rgba(255,255,255,0.65)", letterSpacing:0.5 },
  boardStatDivider:   { width:1, height:36, backgroundColor:"rgba(255,255,255,0.3)" },
  boardEmpty:         { fontSize:13, color:"rgba(255,255,255,0.72)", fontStyle:"italic" },

  // ── 2. Mode toggle ───────────────────────────────────────────────────────────
  modeWrap:       { marginBottom:8 },
  modeToggle:     { flexDirection:"row", backgroundColor:"#FDFAF4", borderRadius:12, borderWidth:1, borderColor:"#D4D0CA", padding:3, shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4 },
  modeOpt:        { flex:1, alignItems:"center", paddingVertical:14, borderRadius:10, gap:4 },
  modeOptActive:  { backgroundColor:"#2F5D50" },
  modeName:       { fontFamily:SERIF, fontSize:19, color:"#5A5650", fontWeight:"400", letterSpacing:1 },
  modeNameActive: { color:"#fff", fontWeight:"600" },
  modeSub:        { fontSize:13, color:"#5A5650", fontWeight:"400", textAlign:"center" },
  modeSubActive:  { color:"rgba(255,255,255,0.8)" },

  // ── Dates card ──────────────────────────────────────────────────────────────
  datesCard:        { flexDirection:"row", alignItems:"center", backgroundColor:"#FDFAF4", borderRadius:16, borderWidth:1, borderColor:"#D4D0CA", marginBottom:12, padding:18, shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.12, shadowRadius:8, elevation:4, gap:12 },
  datesCardLeft:    { flex:1 },
  datesCardDivider: { width:1, alignSelf:"stretch", backgroundColor:"#D4D0CA", marginHorizontal:4 },
  datesCardEyebrow: { fontSize:9, fontWeight:"700", letterSpacing:2, color:"#9A8E7A", marginBottom:4, textTransform:"uppercase" },
  datesCardTitle:   { fontFamily:SERIF, fontSize:20, color:"#1A1712", marginBottom:4 },
  datesCardSub:     { fontSize:13, color:"#5A5650", lineHeight:18 },
  datesCardRight:   { alignItems:"center", gap:2, minWidth:72 },
  datesCardDayNum:  { fontFamily:SERIF, fontSize:52, color:"#2F5D50", lineHeight:58, fontWeight:"400" },
  datesCardMonthYr: { fontFamily:SERIF, fontSize:13, color:"#5A5650", textAlign:"center", lineHeight:17 },
  datesCardDays:    { fontSize:11, color:"#9A8E7A", textAlign:"center", marginTop:2 },

  // ── Calendar sheet ───────────────────────────────────────────────────────────
  calOverlay:      { flex:1, backgroundColor:"rgba(0,0,0,0.45)", justifyContent:"flex-end" },
  calSheet:        { backgroundColor:"#FDFAF4", borderTopLeftRadius:24, borderTopRightRadius:24, flex:1, maxHeight:"92%" },
  calHandle:       { width:36, height:4, borderRadius:2, backgroundColor:"#D4D0CA", alignSelf:"center", marginTop:12, marginBottom:4 },
  calHeader:       { flexDirection:"row", alignItems:"flex-start", justifyContent:"space-between", paddingTop:14, paddingBottom:12 },
  calTitle:        { fontFamily:SERIF, fontSize:20, color:"#1A1712" },
  calSub:          { fontSize:13, color:"#5A5650", marginTop:2 },
  calCloseBtn:     { backgroundColor:"#2F5D50", borderRadius:20, paddingHorizontal:16, paddingVertical:8 },
  calCloseTxt:     { fontSize:14, color:"#fff", fontWeight:"500" },
  calLegend:       { flexDirection:"row", gap:20, paddingBottom:10, borderBottomWidth:1, borderBottomColor:"#E8E0D0", marginBottom:4 },
  calLegendItem:   { flexDirection:"row", alignItems:"center", gap:6 },
  calLegendDot:    { width:8, height:8, borderRadius:4 },
  calLegendTxt:    { fontSize:12, color:"#5A5650" },
  calDayLabel:     { flexDirection:"row", alignItems:"center", gap:8, backgroundColor:"#EBF2EE", borderRadius:10, marginHorizontal:4, marginTop:8, padding:12 },
  calDayLabelIcon: { fontSize:16 },
  calDayLabelTxt:  { fontFamily:SERIF, fontSize:14, color:"#1A1712", flex:1 },
  calNote:              { backgroundColor:"#F5EDD8", borderRadius:10, borderWidth:1, borderColor:"#E8D9B8", padding:12, margin:4, marginTop:8 },
  calNoteTxt:           { fontSize:11, color:"#7A6030", lineHeight:17 },
  calFixed:             { backgroundColor:"#FDFAF4", paddingHorizontal:20, borderTopLeftRadius:24, borderTopRightRadius:24, flexShrink:0 },
  calDivider:           { height:1, backgroundColor:"#E8E0D0", marginTop:4, marginBottom:0 },
  calEntriesScroll:     { flex:1, paddingHorizontal:20, minHeight:120 },
  calEntriesContent:    { paddingTop:12, paddingBottom:8 },
  calEntriesEmpty:      { fontSize:14, color:"#9A8E7A", textAlign:"center", paddingVertical:20, fontStyle:"italic" },
  calEntryInputWrap:    { backgroundColor:"#EBF2EE", borderRadius:12, marginHorizontal:4, marginTop:10, padding:12 },
  calEntryDateHdr:      { fontFamily:SERIF, fontSize:14, color:"#1A1712", marginBottom:8 },
  calEntryInputRow:     { flexDirection:"row", gap:8, alignItems:"center" },
  calEntryInput:        { flex:1, backgroundColor:"#FDFAF4", borderRadius:10, borderWidth:1, borderColor:"#C8DDD0", paddingHorizontal:12, paddingVertical:10, fontSize:15, color:"#1A1712" },
  calEntrySaveBtn:      { backgroundColor:"#2F5D50", borderRadius:10, paddingHorizontal:14, paddingVertical:10 },
  calEntrySaveTxt:      { fontSize:14, color:"#fff", fontWeight:"500" },
  calEntryGroup:        { marginHorizontal:4, marginTop:12 },
  calEntryGroupDate:    { fontFamily:SERIF, fontSize:13, color:"#2F5D50", marginBottom:6, paddingBottom:4, borderBottomWidth:1, borderBottomColor:"#E8E0D0" },
  calEntryRow:          { flexDirection:"row", alignItems:"flex-start", gap:8, paddingVertical:5 },
  calEntryDot:          { width:5, height:5, borderRadius:3, backgroundColor:"#2F5D50", marginTop:7, flexShrink:0 },
  calEntryTxt:          { flex:1, fontSize:14, color:"#1A1712", lineHeight:20 },
  calEntryRemove:       { fontSize:18, color:"#C4C0BA", lineHeight:22 },

  // ── Board card departure badge ──────────────────────────────────────────────
  boardCardDeparture:     { backgroundColor:"rgba(255,255,255,0.15)", borderRadius:8, borderWidth:1, borderColor:"rgba(255,255,255,0.25)", paddingHorizontal:10, paddingVertical:5, alignItems:"center" },
  boardCardDepartureDays: { fontFamily:SERIF, fontSize:20, color:"#fff", lineHeight:24 },
  boardCardDepartureLbl:  { fontSize:9, color:"rgba(255,255,255,0.65)", letterSpacing:0.5 },

  // ── Wide cards (Guide, Sacred Places, What to Expect) ───────────────────────
  wideCard:        { borderRadius:16, overflow:"hidden", height:160, marginBottom:12, shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4 },
  wideCardBg:      { flex:1 },
  wideCardScrim:    { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(10,8,4,0.30)" },
  wideCardScrimDark: { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(10,8,4,0.38)" },
  wideCardContent:   { flex:1, justifyContent:"space-between", padding:18 },
  wideCardTopRow:    { flexDirection:"row", justifyContent:"space-between", alignItems:"flex-start" },
  wideCardBottomRow: { flexDirection:"row", alignItems:"flex-end", justifyContent:"space-between" },
  wideCardArrow:     { fontSize:26, color:"rgba(255,255,255,0.7)" },
  wideCardArrowBottom:{ fontSize:32, color:"rgba(255,255,255,0.7)", lineHeight:36, paddingBottom:2 },
  wideCardEyebrow: { fontSize:9, fontWeight:"700", letterSpacing:2, color:"rgba(255,255,255,0.65)", marginBottom:4, textTransform:"uppercase" },
  wideCardTitle:   { fontFamily:SERIF, fontSize:22, color:"#fff", fontWeight:"400", marginBottom:3 },
  wideCardSub:     { fontSize:13, color:"rgba(255,255,255,0.78)" },
  // Guide badge
  guideCardScrim:   { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(10,8,4,0.32)" },
  guideCardBadge:   { backgroundColor:"#fff", borderRadius:999, paddingHorizontal:14, paddingVertical:6 },
  guideCardBadgeTxt:{ fontFamily:SERIF, fontSize:12, color:"#2F5D50", fontWeight:"700", letterSpacing:1 },
  // Count badge (Sacred Places / What to Expect)
  wideCardCountBadge:{ backgroundColor:"rgba(255,255,255,0.15)", borderRadius:8, borderWidth:1, borderColor:"rgba(255,255,255,0.25)", paddingHorizontal:10, paddingVertical:5, alignItems:"center" },
  wideCardCountNum:  { fontFamily:SERIF, fontSize:20, color:"#fff", lineHeight:24 },
  wideCardCountLbl:  { fontSize:9, color:"rgba(255,255,255,0.65)", letterSpacing:1 },

  // ── Checklist dropdown ───────────────────────────────────────────────────────
  checklistHeader:        { borderRadius:16, overflow:"hidden", marginBottom:0, height:96, shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4 },
  checklistHeaderBg:      { flex:1 },
  checklistHeaderScrim:   { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(10,8,4,0.35)", borderRadius:16 },
  checklistHeaderContent: { flex:1, flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:18, paddingVertical:14 },
  checklistHeaderLeft:    { flex:1 },
  checklistEyebrow:       { fontSize:9, fontWeight:"700", letterSpacing:2, color:"rgba(255,255,255,0.6)", marginBottom:3 },
  checklistTitle:         { fontFamily:SERIF, fontSize:18, color:"#fff", marginBottom:3 },
  checklistProgress:      { fontSize:12, color:"rgba(255,255,255,0.72)" },
  checklistHeaderRight:   { alignItems:"flex-end", gap:8 },
  miniProgTrack:          { width:60, height:3, backgroundColor:"rgba(255,255,255,0.25)", borderRadius:2, overflow:"hidden" },
  miniProgFill:           { height:"100%", backgroundColor:"#fff", borderRadius:2 },
  checklistChev:          { fontSize:18, color:"rgba(255,255,255,0.9)", fontWeight:"600" },
  checklistBody:          { backgroundColor:"#FDFAF4", borderRadius:14, borderWidth:1, borderColor:"#D4D0CA", overflow:"hidden", marginBottom:20, shadowColor:"#6A4A28", shadowOffset:{width:0,height:2}, shadowOpacity:0.08, shadowRadius:6, elevation:2 },
  checklistExplainer:     { flexDirection:"row", alignItems:"flex-start", gap:8, paddingHorizontal:14, paddingVertical:12, backgroundColor:"#F5EDD8", borderBottomWidth:1, borderBottomColor:"#E8D9B8" },
  checklistExplainerIcon: { fontSize:14, marginTop:1 },
  checklistExplainerTxt:  { flex:1, fontSize:12, color:"#7A6030", lineHeight:18 },
  checkAddRow:            { flexDirection:"row", alignItems:"center", gap:10, paddingHorizontal:14, paddingVertical:14, borderTopWidth:1, borderTopColor:"#D4D0CA" },
  checkAddActive:         { paddingHorizontal:14, paddingVertical:12, borderTopWidth:1, borderTopColor:"#D4D0CA" },
  checkAddIcon:           { width:22, height:22, borderRadius:11, borderWidth:1.5, borderStyle:"dashed", borderColor:"#2F5D50", alignItems:"center", justifyContent:"center", flexShrink:0 },
  checkAddPlus:           { fontSize:14, color:"#2F5D50", lineHeight:18 },
  checkAddTxt:            { fontFamily:SERIF, fontSize:14, color:"#2F5D50" },
  checkRow:               { flexDirection:"row", alignItems:"center", gap:12, paddingHorizontal:14, paddingVertical:16 },
  checkRowBorder:         { borderBottomWidth:1, borderBottomColor:"#D4D0CA" },
  checkBox:               { width:22, height:22, borderRadius:11, borderWidth:1.5, borderColor:"#D4D0CA", alignItems:"center", justifyContent:"center", flexShrink:0 },
  checkBoxDone:           { backgroundColor:"#2F5D50", borderColor:"#2F5D50" },
  checkMark:              { fontSize:11, color:"#fff", fontWeight:"700" },
  checkTxt:               { flex:1, fontFamily:SERIF, fontSize:14, color:"#1A1712", lineHeight:20 },
  checkTxtDone:           { color:"#5A5650", textDecorationLine:"line-through" },
  checkInput:             { flex:1, fontFamily:SERIF, fontSize:14, color:"#1A1712", borderBottomWidth:1.5, borderBottomColor:"#2F5D50", paddingVertical:2 },
  checkEditIcon:          { fontSize:14, color:"#D4D0CA", paddingLeft:4 },

  // ── Pair row: Contacts (left) + Groups (right) ───────────────────────────────
  pairRow:         { flexDirection:"row", gap:12, marginBottom:12, marginTop:13 },
  pairCard:        { flex:1, borderRadius:16, overflow:"hidden", height:150, shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4 },
  pairCardBg:      { flex:1 },
  pairCardScrim:    { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(10,8,4,0.45)" },
  pairCardScrimLight:{ ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(10,8,4,0.30)" },
  pairCardContent: { position:"absolute", bottom:0, left:0, right:0, padding:14 },
  pairCardEyebrow: { fontSize:9, fontWeight:"700", letterSpacing:2, color:"rgba(255,255,255,0.65)", marginBottom:3, textTransform:"uppercase" },
  pairCardTitle:   { fontFamily:SERIF, fontSize:17, color:"#fff", fontWeight:"400", marginBottom:2 },
  pairCardSub:     { fontSize:12, color:"rgba(255,255,255,0.75)" },

  // Legacy refs kept for safety
  halfCardScrim:       { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(10,8,4,0.22)" },
  halfCardScrimDark:   { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(10,8,4,0.38)" },
  halfCardOverlayWrap: { ...StyleSheet.absoluteFillObject, justifyContent:"space-between", padding:14 },
  halfCardCountWrap:   { alignSelf:"flex-end", alignItems:"flex-end" },
  halfCardOverlay:     { },
  halfCardCount:       { fontFamily:SERIF, fontSize:22, color:"#fff", fontWeight:"400", lineHeight:26 },
  halfCardCategory:    { fontSize:9, fontWeight:"700", letterSpacing:1.5, color:"rgba(255,255,255,0.72)", marginBottom:3, textTransform:"uppercase" },
  halfCardTitleWhite:  { fontFamily:SERIF, fontSize:17, color:"#fff", fontWeight:"400", marginBottom:2 },
  halfCardSubWhite:    { fontSize:13, color:"rgba(255,255,255,0.85)" },
  fullRow:             { flexDirection:"row", gap:12, marginBottom:12 },
  fullRowCard:         { flex:1, borderRadius:16, overflow:"hidden", height:150, shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4 },
  fullRowCardImg:      { flex:1, justifyContent:"flex-end" },
  compactRow:          { flexDirection:"row", gap:12, marginBottom:12 },
  compactCard:         { flex:1, justifyContent:"flex-end", backgroundColor:"#FDFAF4", borderRadius:16, borderWidth:1, borderColor:"#D4D0CA", padding:16, height:120, shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4 },
  compactTitle:        { fontFamily:SERIF, fontSize:17, color:"#1A1712", fontWeight:"500", marginBottom:4 },
  compactSub:          { fontSize:14, color:"#5A5650", lineHeight:18 },
  halfRow:             { flexDirection:"row", gap:12, marginBottom:12 },
  halfCard:            { flex:1, borderRadius:16, overflow:"hidden", height:150, shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4 },
  halfCardImg:         { flex:1, justifyContent:"flex-end" },
  guideCard:           { borderRadius:16, overflow:"hidden", height:160, marginBottom:12, shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4 },
  guideCardBg:         { flex:1 },
  guideCardContent:    { flex:1, justifyContent:"space-between", padding:18 },
  guideCardTopRow:     { flexDirection:"row", justifyContent:"space-between", alignItems:"center" },
  guideCardArrow:      { fontSize:26, color:"rgba(255,255,255,0.7)" },
  guideCardBottom:     { },
  guideCardTitle:      { fontFamily:SERIF, fontSize:22, color:"#fff", fontWeight:"400", marginBottom:3 },
  guideCardSub:        { fontSize:13, color:"rgba(255,255,255,0.78)" },
  linkCard:            { flexDirection:"row", alignItems:"center", backgroundColor:"#FDFAF4", borderRadius:16, borderWidth:1, borderColor:"#D4D0CA", marginBottom:10, padding:16, gap:12, shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4 },
  linkIconWrap:        { width:48, height:48, borderRadius:10, backgroundColor:"#EDE6D8", borderWidth:1, borderColor:"#D4D0CA", alignItems:"center", justifyContent:"center", flexShrink:0 },
  linkIcon:            { fontSize:22 },
  linkInfo:            { flex:1 },
  linkLabel:           { fontFamily:SERIF, fontSize:16, color:"#1A1712", marginBottom:3 },
  linkSub:             { fontSize:13, color:"#5A5650", fontWeight:"400" },
  linkArrow:           { fontSize:20, color:"#D4D0CA" },
  linkCounter:         { alignItems:"center", justifyContent:"center", minWidth:40 },
  linkCounterNum:      { fontFamily:SERIF, fontSize:18, color:"#2F5D50", fontWeight:"500", lineHeight:22 },
  linkCounterOf:       { fontSize:10, color:"#5A5650", textAlign:"center" },
  heroCard:            { borderRadius:20, overflow:"hidden", marginBottom:14, height:260, shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4 },
  heroCardBg:          { flex:1 },
  heroCardScrim:       { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(10,8,4,0.52)" },
  heroCardContent:     { flex:1, justifyContent:"space-between", padding:16 },
  heroCardTopRow:      { flexDirection:"row", justifyContent:"space-between", alignItems:"center" },
  heroCardBadge:       { backgroundColor:"#fff", borderRadius:999, paddingHorizontal:14, paddingVertical:6 },
  heroCardBadgeTxt:    { fontFamily:SERIF, fontSize:13, color:"#2F5D50", fontWeight:"700", letterSpacing:1 },
  heroCardArrowRight:  { fontSize:28, color:"rgba(255,255,255,0.7)" },
  heroCardBottom:      { },
  heroCardTitle:       { fontFamily:SERIF, fontSize:26, color:"#fff", fontWeight:"400", marginBottom:5 },
  heroCardSub:         { fontSize:14, color:"rgba(255,255,255,0.75)", fontWeight:"400", marginBottom:12 },
  heroProgWrap:        { backgroundColor:"rgba(20,55,40,0.75)", borderRadius:10, padding:10 },
  heroProgRow:         { flexDirection:"row", alignItems:"center", gap:12 },
  heroProgTrack:       { flex:1, flexDirection:"row", gap:2, height:5 },
  heroProgSeg:         { flex:1, height:"100%", borderRadius:3, backgroundColor:"rgba(255,255,255,0.25)" },
  heroProgSegFill:     { backgroundColor:"#fff" },
  heroProgLabel:       { fontSize:13, color:"#fff", fontWeight:"600" },
  boardCard:           { borderRadius:20, overflow:"hidden", marginBottom:14, height:150, shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4 },
  boardCardBg:         { flex:1 },
  boardScrim:          { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(10,8,4,0.22)" },
  boardContent:        { position:"absolute", top:0, bottom:0, left:0, right:0, justifyContent:"flex-end", padding:16 },
  header:              { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:20, paddingVertical:14, backgroundColor:"#EDE6D8" },
  headerLeft:          { flex:1 },
  headerTitle:         { fontFamily:SERIF, fontSize:26, fontWeight:"400", color:"#1A1712" },
  headerSub:           { fontSize:14, color:"#5A5650", fontWeight:"400", marginTop:2 },
  departureBadge:      { alignItems:"center", paddingHorizontal:12, paddingVertical:6, borderWidth:1, borderColor:"#C4A882", borderRadius:10 },
  departureDays:       { fontFamily:SERIF, fontSize:22, color:"#1A1712", fontWeight:"400", lineHeight:26 },
  departureLbl:        { fontSize:10, color:"#5A5650", textAlign:"center", lineHeight:13, letterSpacing:0.3 },
  boardHero:           { borderRadius:0, overflow:"hidden", height:0, marginBottom:0, marginHorizontal:-20 }, // removed
});
