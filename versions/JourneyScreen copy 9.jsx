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

if (Platform.OS === "android" ? UIManager.setLayoutAnimationEnabledExperimental : null) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SERIF = "SourceSerif4-Regular";
const BOARD_KEY    = "safar_journey_board_v1";
const CONTACTS_KEY = "safar_journey_contacts_v1";

const CONTACT_COLORS = ["#4A7A60","#6B5B7A","#7A5B4A","#4A6B7A","#7A6B4A","#5B7A4A"];
const CONTACT_ROLES  = ["Hotel","Guide","Driver","Travel Agent","Group Member","Family","Doctor","Emergency","Other"];
const ROLE_COLORS    = {
  "Hotel":"rgba(74,106,80,0.12)","Guide":"rgba(107,91,122,0.12)",
  "Driver":"rgba(122,91,74,0.12)","Travel Agent":"rgba(74,107,122,0.12)",
  "Group Member":"rgba(47,93,80,0.12)","Family":"rgba(200,169,106,0.15)",
  "Doctor":"rgba(200,80,80,0.12)","Emergency":"rgba(200,80,80,0.18)",
};

// ── Groups SVG icon ───────────────────────────────────────────────────────────
function GroupIcon({ size = 18, color = "#fff" }) {
  return (
    <Svg width={size} height={size * 0.8} viewBox="0 0 24 20">
      <Circle cx={5}  cy={5}  r={3}   fill={color} opacity={0.7}/>
      <Path d="M0 18 C0 14 2.5 12 5 12 C6.2 12 7.3 12.5 8.1 13.3 C6.8 14.5 6 16.2 6 18 Z" fill={color} opacity={0.7}/>
      <Circle cx={19} cy={5}  r={3}   fill={color} opacity={0.7}/>
      <Path d="M24 18 C24 14 21.5 12 19 12 C17.8 12 16.7 12.5 15.9 13.3 C17.2 14.5 18 16.2 18 18 Z" fill={color} opacity={0.7}/>
      <Circle cx={12} cy={4}  r={3.5} fill={color}/>
      <Path d="M5.5 18 C5.5 13.8 8.5 11 12 11 C15.5 11 18.5 13.8 18.5 18 Z" fill={color}/>
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
                    <Text style={am.fieldLabel}>Search for a du\u02bf\u0101\u02be</Text>
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
  sheet:          { backgroundColor:"#D4E4DC", borderTopLeftRadius:24, borderTopRightRadius:24, paddingHorizontal:spacing(2.5), paddingBottom:spacing(2), maxHeight:"88%" },
  handle:         { width:36, height:4, borderRadius:2, backgroundColor:"rgba(47,93,80,0.3)", alignSelf:"center", marginTop:spacing(1.5), marginBottom:spacing(1) },
  sheetHeader:    { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:spacing(2) },
  sheetTitle:     { fontFamily:SERIF, fontSize:18, color:colors.text },
  closeBtn:       { fontSize:16, color:colors.subtext, width:50, textAlign:"right" },
  colorRow:       { flexDirection:"row", gap:spacing(1), marginBottom:spacing(2) },
  colorSwatch:    { width:32, height:32, borderRadius:16, alignItems:"center", justifyContent:"center" },
  colorSwatchActive:{ borderWidth:2.5, borderColor:colors.text },
  colorCheck:     { fontSize:14, color:"#fff", fontWeight:"700" },
  fieldLabel:     { fontSize:10, fontWeight:"700", letterSpacing:1.5, color:colors.subtext, marginBottom:spacing(0.75) },
  input:          { backgroundColor:colors.card, borderRadius:radius.md, borderWidth:1, borderColor:colors.border, paddingHorizontal:spacing(1.75), paddingVertical:spacing(1.25), fontSize:typography.body, color:colors.text, marginBottom:spacing(1.75) },
  inputMulti:     { minHeight:72, textAlignVertical:"top" },
  roleRow:        { gap:spacing(0.75), paddingBottom:spacing(1.75) },
  roleChip:       { paddingHorizontal:spacing(1.5), paddingVertical:spacing(0.75), borderRadius:radius.pill, borderWidth:1, borderColor:colors.border, backgroundColor:colors.card },
  roleChipActive: { backgroundColor:colors.primary, borderColor:colors.primary },
  roleChipText:   { fontSize:typography.small, color:colors.subtext },
  roleChipTextActive:{ color:"#fff", fontWeight:"500" },
  saveBtn:        { backgroundColor:colors.primary, borderRadius:radius.md, paddingVertical:spacing(1.75), alignItems:"center", marginTop:spacing(1), ...shadows.button },
  saveBtnText:    { fontFamily:SERIF, fontSize:typography.body, color:"#fff", fontWeight:"500" },
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
  card:              { borderRadius:radius.md, marginBottom:spacing(1.25), ...shadows.card },
  checklistCard:     { flexDirection:"row", alignItems:"center", gap:spacing(1.25), backgroundColor:colors.card, borderWidth:1, borderColor:colors.border, padding:spacing(1.75) },
  checkbox:          { width:24, height:24, borderRadius:12, borderWidth:1.5, borderColor:colors.border, alignItems:"center", justifyContent:"center", flexShrink:0 },
  checkboxDone:      { backgroundColor:colors.primary, borderColor:colors.primary },
  checkmark:         { fontSize:12, color:"#fff", fontWeight:"700" },
  checklistText:     { fontFamily:SERIF, fontSize:typography.body, color:colors.text, flex:1 },
  checklistTextDone: { color:colors.subtext, textDecorationLine:"line-through" },
  noteCard:          { backgroundColor:"#FFFBE8", borderWidth:1, borderColor:"#E8DDA0", padding:spacing(2) },
  noteIcon:          { fontSize:16, marginBottom:spacing(0.5) },
  noteText:          { fontFamily:SERIF, fontSize:typography.body, color:colors.text, lineHeight:typography.body*1.55 },
  duaCard:           { backgroundColor:"rgba(47,93,80,0.07)", borderWidth:1, borderColor:"rgba(47,93,80,0.2)", padding:spacing(2) },
  duaHeader:         { flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:spacing(0.75) },
  duaPinLabel:       { fontSize:10, fontWeight:"700", letterSpacing:1.5, color:colors.primary },
  duaTitle:          { fontFamily:SERIF, fontSize:typography.body, color:colors.text, marginBottom:spacing(0.5) },
  duaArabic:         { fontSize:16, color:colors.subtext, textAlign:"right", lineHeight:28, marginBottom:spacing(0.5) },
  duaStage:          { fontSize:typography.tiny, color:colors.primary },
  linkCard:          { flexDirection:"row", alignItems:"center", gap:spacing(1.25), backgroundColor:colors.card, borderWidth:1, borderColor:colors.border, padding:spacing(1.75) },
  linkIconWrap:      { width:38, height:38, borderRadius:radius.sm, backgroundColor:"rgba(47,93,80,0.08)", alignItems:"center", justifyContent:"center", flexShrink:0 },
  linkTitle:         { fontFamily:SERIF, fontSize:typography.body, color:colors.text, marginBottom:2 },
  linkUrl:           { fontSize:typography.tiny, color:colors.primary },
  linkArrow:         { fontSize:16, color:colors.primary },
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
  wrap:            { flex:1, backgroundColor:colors.background },
  header:          { flexDirection:"row", alignItems:"center", gap:spacing(1), paddingHorizontal:spacing(2), paddingVertical:spacing(1.5), borderBottomWidth:1, borderBottomColor:colors.border, backgroundColor:colors.card },
  iconBtn:         { width:36, height:36, borderRadius:18, backgroundColor:colors.background, borderWidth:1, borderColor:colors.border, alignItems:"center", justifyContent:"center" },
  iconBtnTxt:      { fontSize:20, color:colors.text, lineHeight:24 },
  bookmark:        { fontSize:20, color:colors.border },
  bookmarkActive:  { color:colors.accent },
  headerMid:       { flex:1, alignItems:"center" },
  stage:           { fontSize:typography.tiny, color:colors.accent, fontWeight:"500", letterSpacing:0.8 },
  title:           { fontFamily:SERIF, fontSize:typography.body, color:colors.text },
  scroll:          { flex:1 },
  scrollContent:   { paddingHorizontal:spacing(2.5) },
  featuredRow:     { alignItems:"flex-start", marginTop:spacing(2) },
  featuredBadge:   { backgroundColor:colors.accent, paddingHorizontal:spacing(1), paddingVertical:3, borderRadius:4 },
  featuredText:    { fontSize:10, color:colors.card, fontWeight:"700", letterSpacing:1.2 },
  arabicCard:      { backgroundColor:colors.card, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, padding:spacing(2.5), marginTop:spacing(1.5), marginBottom:spacing(2), ...shadows.card },
  arabicText:      { fontSize:28, color:colors.text, textAlign:"right", lineHeight:52, fontWeight:"400" },
  sectionToggle:   { flexDirection:"row", justifyContent:"space-between", alignItems:"center", paddingVertical:spacing(1), borderTopWidth:1, borderTopColor:colors.border },
  sectionLabel:    { fontSize:10, fontWeight:"600", color:colors.accent, letterSpacing:1.8 },
  sectionChev:     { fontSize:10, color:colors.border, fontWeight:"600" },
  translitText:    { fontSize:typography.small, color:colors.subtext, fontStyle:"italic", lineHeight:typography.small*1.7, fontWeight:"300", paddingVertical:spacing(1) },
  transText:       { fontFamily:SERIF, fontSize:typography.body, color:colors.text, lineHeight:typography.body*1.65, fontWeight:"300", paddingVertical:spacing(1) },
  sourceText:      { fontSize:typography.tiny, color:colors.subtext, marginTop:spacing(1), opacity:0.7 },
  controls:        { position:"absolute", bottom:0, left:0, right:0, flexDirection:"row", alignItems:"center", justifyContent:"space-around", paddingVertical:spacing(2), paddingBottom:spacing(3), backgroundColor:colors.card, borderTopWidth:1, borderTopColor:colors.border, ...shadows.card },
  ctrlBtn:         { alignItems:"center", gap:4, width:64 },
  ctrlBtnDisabled: { opacity:0.3 },
  ctrlIcon:        { fontSize:22, color:colors.subtext },
  ctrlIconDisabled:{ color:colors.border },
  ctrlLabel:       { fontSize:typography.tiny, color:colors.subtext, fontWeight:"300" },
  playBtn:         { width:64, height:64, borderRadius:32, backgroundColor:colors.primary, alignItems:"center", justifyContent:"center", ...shadows.button },
  playIcon:        { fontSize:22, color:colors.card, marginLeft:3 },
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
  row:           { flexDirection:"row", alignItems:"center", gap:spacing(1.5), paddingVertical:spacing(1.75), paddingHorizontal:spacing(2), borderBottomWidth:1, borderBottomColor:colors.border, backgroundColor:colors.card },
  rowLast:       { borderBottomWidth:0 },
  rowActive:     { backgroundColor:"rgba(47,93,80,0.05)" },
  num:           { width:34, height:34, borderRadius:17, backgroundColor:colors.border, alignItems:"center", justifyContent:"center", flexShrink:0 },
  numDone:       { backgroundColor:colors.primary },
  numActive:     { backgroundColor:colors.primary },
  numText:       { fontSize:typography.small, color:colors.subtext, fontWeight:"500" },
  numTextActive: { color:colors.card },
  numTick:       { fontSize:14, color:colors.card, fontWeight:"700" },
  info:          { flex:1 },
  name:          { fontFamily:SERIF, fontSize:typography.body, color:colors.text, marginBottom:2 },
  nameActive:    { color:colors.primary },
  nameDone:      { color:colors.subtext },
  sub:           { fontSize:typography.small, color:colors.subtext, fontWeight:"300" },
  badge:         { backgroundColor:"rgba(47,93,80,0.10)", borderRadius:radius.pill, paddingHorizontal:spacing(1), paddingVertical:3 },
  badgeText:     { fontSize:typography.tiny, color:colors.primary, fontWeight:"500" },
  arrow:         { fontSize:18, color:colors.border },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function JourneyScreen({ navigation }) {
  const [mode,           setMode]           = useState("umrah");
  const [playerDua,      setPlayerDua]      = useState(null);
  const [playerStep,     setPlayerStep]     = useState(null);
  const [duaIndex,       setDuaIndex]       = useState(0);
  const [boardCards,     setBoardCards]     = useState([]);
  const [contacts,       setContacts]       = useState([]);

  const steps = mode === "umrah" ? UMRAH_STEPS : HAJJ_STEPS;

  useEffect(() => {
    AsyncStorage.getItem(BOARD_KEY).then(v => { if (v) setBoardCards(JSON.parse(v)); }).catch(() => {});
    AsyncStorage.getItem(CONTACTS_KEY).then(v => { if (v) setContacts(JSON.parse(v)); }).catch(() => {});
  }, []);

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

      <ImageBackground source={require("../assets/journey3.png")} style={jn.hero} imageStyle={jn.heroImg}>
        <View style={jn.heroScrim} />
      </ImageBackground>

      <View style={jn.header}>
        <View style={jn.headerLeft}>
          <Text style={jn.headerTitle}>My Journey</Text>
          <Text style={jn.headerSub}>Your step-by-step pilgrimage guide</Text>
        </View>
        <TouchableOpacity style={jn.groupsBtn} onPress={() => navigation?.navigate?.("Groups")} activeOpacity={0.85}>
          <GroupIcon size={18} color="#fff" />
          <Text style={jn.groupsBtnText}>Groups</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex:1 }}>

        {/* Umrah / Hajj selector */}
        <View style={jn.modeWrap}>
          <View style={jn.modeRow}>
            {[{key:"umrah",emoji:"\uD83D\uDD4B",name:"Umrah",sub:"Lesser pilgrimage"},{key:"hajj",emoji:"\u26F0\uFE0F",name:"Hajj",sub:"Annual pilgrimage"}].map(m => (
              <TouchableOpacity key={m.key} style={[jn.modeOpt, mode===m.key ? jn.modeOptActive : null]}
                onPress={() => { setMode(m.key); setActiveTab("all"); }} activeOpacity={0.8}>
                <Text style={jn.modeEmoji}>{m.emoji}</Text>
                <Text style={[jn.modeName, mode===m.key ? jn.modeNameActive : null]}>{m.name}</Text>
                <Text style={[jn.modeSub,  mode===m.key ? jn.modeSubActive : null]}>{m.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Progress card */}
        <View style={jn.progressCard}>
          <View style={jn.progressTopRow}>
            <Text style={jn.progressTitle}>Steps completed</Text>
            <Text style={jn.progressCount}>{completedCount} of {steps.length}</Text>
          </View>
          <View style={jn.progTrack}>
            {Array.from({length:steps.length},(_,i) => (
              <View key={i} style={[jn.progSeg, i < completedCount ? jn.progSegFill : null]} />
            ))}
          </View>
          <Text style={jn.progressSub}>{"Keep going \u2014 you're making great progress."}</Text>
        </View>

        {/* Step-by-step, Sacred Places, What to Expect, My Board, Contacts */}
        {[
          { id:"guide",    icon:"\uD83D\uDCCB", label:"Step-by-step Guide",  sub:steps.length + " steps \u00b7 " + completedCount + " completed", onPress:() => navigation?.navigate?.("StepGuide",{mode,steps:steps.length,completed:completedCount}) },
          { id:"map",      icon:"\uD83D\uDDFA\uFE0F", label:"Sacred Places", sub:"Kaaba \u00b7 \u1e62af\u0101 \u00b7 Marwah \u00b7 Maq\u0101m Ibrahim \u00b7 Zamzam", onPress:() => navigation?.navigate?.("Map") },
          { id:"expect",   icon:"\uD83D\uDCD6", label:"What to Expect",      sub:"Travel \u00b7 Health \u00b7 Rituals \u00b7 Safety \u00b7 Legal", onPress:() => navigation?.navigate?.("WhatToExpect") },
          { id:"board",    icon:"\uD83D\uDCCB", label:"My Journey Board",    sub: boardCards.length===0 ? "Notes, duas, checklists & links" : boardCards.length + " card" + (boardCards.length===1?"":"s") + (boardChecklist>0?" \u00b7 "+boardDone+"/"+boardChecklist+" tasks done":""), onPress:() => navigation?.navigate?.("MyBoard") },
          { id:"groups",   icon:"\uD83D\uDC65", label:"My Groups",
            sub:"Share milestones with your pilgrimage family",
            onPress:() => navigation?.navigate?.("Groups") },
          { id:"contacts", icon:"\uD83D\uDC64", label:"My Contacts",         sub: contacts.length===0 ? "Hotel, guide, driver & group members" : contacts.length + " contact" + (contacts.length===1?"":"s") + " saved", onPress:() => navigation?.navigate?.("MyContacts") },
        ].map(item => (
          <TouchableOpacity key={item.id} style={jn.linkCard} onPress={item.onPress} activeOpacity={0.85}>
            <View style={jn.linkIconWrap}><Text style={jn.linkIcon}>{item.icon}</Text></View>
            <View style={jn.linkInfo}>
              <Text style={jn.linkLabel}>{item.label}</Text>
              <Text style={jn.linkSub}>{item.sub}</Text>
            </View>
            <Text style={jn.linkArrow}>{"\u203a"}</Text>
          </TouchableOpacity>
        ))}

        <View style={{ height:spacing(5) }} />
      </ScrollView>

    </SafeAreaView>
  );
}

const jn = StyleSheet.create({
  safe:      { flex:1, backgroundColor:colors.background },
  hero:      { width:"100%", height:225 },
  heroImg:   { resizeMode:"cover" },
  heroScrim: { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(0,0,0,0.15)" },

  header: {
    flexDirection:"row", alignItems:"center", justifyContent:"space-between",
    paddingHorizontal:spacing(2.5), paddingVertical:spacing(1.75),
    backgroundColor:colors.background,
  },
  headerLeft:    { flex:1 },
  headerTitle:   { fontFamily:SERIF, fontSize:26, fontWeight:"400", color:colors.text },
  headerSub:     { fontSize:typography.small, color:colors.subtext, fontWeight:"300", marginTop:2 },
  groupsBtn:     { flexDirection:"row", alignItems:"center", gap:spacing(0.75), backgroundColor:colors.primary, borderRadius:radius.pill, paddingHorizontal:spacing(2), paddingVertical:spacing(1), ...shadows.button },
  groupsBtnText: { fontFamily:SERIF, fontSize:typography.body, color:colors.card, fontWeight:"500" },

  modeWrap:      { backgroundColor:colors.card, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, marginHorizontal:spacing(2.5), marginBottom:spacing(1.5), padding:spacing(2), ...shadows.card },
  modeRow:       { flexDirection:"row", gap:spacing(1.25) },
  modeOpt:       { flex:1, alignItems:"center", justifyContent:"center", paddingVertical:spacing(2.5), borderRadius:radius.md, gap:6, backgroundColor:colors.background, borderWidth:1.5, borderColor:colors.border },
  modeOptActive: { borderColor:colors.primary, backgroundColor:"rgba(47,93,80,0.06)" },
  modeEmoji:     { fontSize:28 },
  modeName:      { fontFamily:SERIF, fontSize:typography.body, color:colors.subtext, fontWeight:"400" },
  modeNameActive:{ color:colors.primary, fontWeight:"500" },
  modeSub:       { fontSize:typography.tiny, color:colors.border, fontWeight:"300" },
  modeSubActive: { color:colors.primary },

  progressCard:   { backgroundColor:"rgba(47,93,80,0.08)", borderRadius:radius.lg, borderWidth:1, borderColor:"rgba(47,93,80,0.15)", marginHorizontal:spacing(2.5), marginBottom:spacing(1.5), padding:spacing(2) },
  progressTopRow: { flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:spacing(1) },
  progressTitle:  { fontFamily:SERIF, fontSize:typography.body, color:colors.text },
  progressCount:  { fontFamily:SERIF, fontSize:typography.body, color:colors.primary, fontWeight:"500" },
  progTrack:      { flexDirection:"row", gap:3, marginBottom:spacing(1) },
  progSeg:        { flex:1, height:6, borderRadius:3, backgroundColor:"rgba(47,93,80,0.15)" },
  progSegFill:    { backgroundColor:colors.primary },
  progressSub:    { fontSize:typography.small, color:colors.subtext, fontWeight:"300" },

  linkCard:     { flexDirection:"row", alignItems:"center", backgroundColor:colors.card, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, marginHorizontal:spacing(2.5), marginBottom:spacing(1.25), padding:spacing(2), gap:spacing(1.5), ...shadows.card },
  linkIconWrap: { width:48, height:48, borderRadius:radius.md, backgroundColor:colors.background, borderWidth:1, borderColor:colors.border, alignItems:"center", justifyContent:"center", flexShrink:0 },
  linkIcon:     { fontSize:22 },
  linkInfo:     { flex:1 },
  linkLabel:    { fontFamily:SERIF, fontSize:typography.body, color:colors.text, marginBottom:3 },
  linkSub:      { fontSize:typography.small, color:colors.subtext, fontWeight:"300" },
  linkArrow:    { fontSize:20, color:colors.border },
  linkCounter:  { alignItems:"center", justifyContent:"center", minWidth:40, paddingHorizontal:spacing(0.5) },
  linkCounterNum:{ fontFamily:SERIF, fontSize:18, color:colors.primary, fontWeight:"500", lineHeight:22 },
  linkCounterOf: { fontSize:10, color:colors.subtext, fontWeight:"300", textAlign:"center" },
});
