import React, { useState, useEffect } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  ImageBackground, StyleSheet, LayoutAnimation, Platform,
  UIManager, Modal, TextInput, KeyboardAvoidingView,
  Linking, Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Sparkle, Note, CheckSquare, HandsPraying, Link, MagnifyingGlass } from "phosphor-react-native";
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
  { key:"note",      label:"Note",           Icon:Note,          desc:"Personal intention or reminder" },
  { key:"checklist", label:"Checklist item", Icon:CheckSquare,   desc:"Something to prepare or pack"   },
  { key:"dua",       label:"Pin a Du\u02bf\u0101\u02be", Icon:HandsPraying, desc:"Save a specific du\u02bf\u0101\u02be" },
  { key:"link",      label:"Link",           Icon:Link,          desc:"A URL, booking or resource"      },
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
                    <View style={am.typeEmoji}>
                      <type.Icon size={26} color={colors.primary} weight="regular" />
                    </View>
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
                      <MagnifyingGlass size={16} color={colors.subtext} weight="regular" />
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
  input:          { backgroundColor:colors.card, borderRadius:radius.md, borderWidth:1, borderColor:colors.border, paddingHorizontal:spacing(1.75), paddingVertical:spacing(1.25), fontSize:16, color:colors.text, marginBottom:spacing(1.75),
    ...shadows.card,},
  inputMulti:     { minHeight:72, textAlignVertical:"top" },
  roleRow:        { gap:spacing(0.75), paddingBottom:spacing(1.75) },
  roleChip:       { paddingHorizontal:spacing(1.5), paddingVertical:spacing(0.75), borderRadius:radius.pill, borderWidth:1, borderColor:colors.border, backgroundColor:colors.card },
  roleChipActive: { backgroundColor:colors.primary, borderColor:colors.primary },
  roleChipText:   { fontSize:14, color:colors.subtext },
  roleChipTextActive:{ color:"#fff", fontWeight:"500" },
  saveBtn:        { backgroundColor:colors.primary, borderRadius:radius.md, paddingVertical:spacing(1.75), alignItems:"center", marginTop:spacing(1), ...shadows.button },
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
      <Note size={16} color={colors.subtext} weight="regular" />
      <Text style={bc.noteText}>{card.text}</Text>
    </TouchableOpacity>
  );
  if (card.type === "dua") return (
    <TouchableOpacity style={[bc.card, bc.duaCard]} onLongPress={handleLongPress} activeOpacity={0.9}>
      <View style={bc.duaHeader}>
        <Text style={bc.duaPinLabel}>{"PINNED DU\u02bf\u0100\u02be"}</Text>
        <HandsPraying size={16} color={colors.subtext} weight="regular" />
      </View>
      <Text style={bc.duaTitle}>{card.dua?.title}</Text>
      <Text style={bc.duaArabic} numberOfLines={2}>{card.dua?.arabic}</Text>
      <Text style={bc.duaStage}>{card.dua?.stage}</Text>
    </TouchableOpacity>
  );
  if (card.type === "link") return (
    <TouchableOpacity style={[bc.card, bc.linkCard]} onPress={() => Linking.openURL(card.url)} onLongPress={handleLongPress} activeOpacity={0.85}>
      <View style={bc.linkIconWrap}><Link size={20} color={colors.primary} weight="regular" /></View>
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
  checklistText:     { fontFamily:SERIF, fontSize:16, color:colors.text, flex:1 },
  checklistTextDone: { color:colors.subtext, textDecorationLine:"line-through" },
  noteCard:          { backgroundColor:"#FFFBE8", borderWidth:1, borderColor:"#E8DDA0", padding:spacing(2) },
  noteText:          { fontFamily:SERIF, fontSize:16, color:colors.text, lineHeight:16*1.55 },
  duaCard:           { backgroundColor:"rgba(47,93,80,0.07)", borderWidth:1, borderColor:"rgba(47,93,80,0.2)", padding:spacing(2) },
  duaHeader:         { flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:spacing(0.75) },
  duaPinLabel:       { fontSize:10, fontWeight:"700", letterSpacing:1.5, color:colors.primary },
  duaTitle:          { fontFamily:SERIF, fontSize:16, color:colors.text, marginBottom:spacing(0.5) },
  duaArabic:         { fontSize:16, color:colors.subtext, textAlign:"right", lineHeight:28, marginBottom:spacing(0.5) },
  duaStage:          { fontSize:12, color:colors.primary },
  linkCard:          { flexDirection:"row", alignItems:"center", gap:spacing(1.25), backgroundColor:colors.card, borderWidth:1, borderColor:colors.border, padding:spacing(1.75) },
  linkIconWrap:      { width:38, height:38, borderRadius:radius.sm, backgroundColor:"rgba(47,93,80,0.08)", alignItems:"center", justifyContent:"center", flexShrink:0 },
  linkTitle:         { fontFamily:SERIF, fontSize:16, color:colors.text, marginBottom:2 },
  linkUrl:           { fontSize:12, color:colors.primary },
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
  iconBtn:         { width:36, height:36, borderRadius:18, backgroundColor:colors.background, borderWidth:1, borderColor:colors.border, alignItems:"center", justifyContent:"center",
    ...shadows.card,},
  iconBtnTxt:      { fontSize:20, color:colors.text, lineHeight:24 },
  bookmark:        { fontSize:20, color:colors.border },
  bookmarkActive:  { color:colors.accent },
  headerMid:       { flex:1, alignItems:"center" },
  stage:           { fontSize:12, color:colors.accent, fontWeight:"500", letterSpacing:0.8 },
  title:           { fontFamily:SERIF, fontSize:16, color:colors.text },
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
  translitText:    { fontSize:14, color:colors.subtext, fontStyle:"italic", lineHeight:14*1.7, fontWeight:"400", paddingVertical:spacing(1) },
  transText:       { fontFamily:SERIF, fontSize:16, color:colors.text, lineHeight:16*1.65, fontWeight:"400", paddingVertical:spacing(1) },
  sourceText:      { fontSize:12, color:colors.subtext, marginTop:spacing(1), opacity:0.7 },
  controls:        { position:"absolute", bottom:0, left:0, right:0, flexDirection:"row", alignItems:"center", justifyContent:"space-around", paddingVertical:spacing(2), paddingBottom:spacing(3), backgroundColor:colors.card, borderTopWidth:1, borderTopColor:colors.border, ...shadows.card },
  ctrlBtn:         { alignItems:"center", gap:4, width:64 },
  ctrlBtnDisabled: { opacity:0.3 },
  ctrlIcon:        { fontSize:22, color:colors.subtext },
  ctrlIconDisabled:{ color:colors.border },
  ctrlLabel:       { fontSize:12, color:colors.subtext, fontWeight:"400" },
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
  numText:       { fontSize:14, color:colors.subtext, fontWeight:"500" },
  numTextActive: { color:colors.card },
  numTick:       { fontSize:14, color:colors.card, fontWeight:"700" },
  info:          { flex:1 },
  name:          { fontFamily:SERIF, fontSize:16, color:colors.text, marginBottom:2 },
  nameActive:    { color:colors.primary },
  nameDone:      { color:colors.subtext },
  sub:           { fontSize:14, color:colors.subtext, fontWeight:"400" },
  badge:         { backgroundColor:"rgba(47,93,80,0.10)", borderRadius:radius.pill, paddingHorizontal:spacing(1), paddingVertical:3 },
  badgeText:     { fontSize:12, color:colors.primary, fontWeight:"500" },
  arrow:         { fontSize:18, color:colors.border },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function GuidesScreen({ navigation }) {
  const [mode,           setMode]           = useState("umrah");
  const [playerDua,      setPlayerDua]      = useState(null);
  const [playerStep,     setPlayerStep]     = useState(null);
  const [duaIndex,       setDuaIndex]       = useState(0);
  const [boardCards,     setBoardCards]     = useState([]);
  const departureDate = new Date("2025-11-15"); // placeholder — user sets this
  const [contacts,       setContacts]       = useState([]);

  const steps = mode === "umrah" ? UMRAH_STEPS : HAJJ_STEPS;
  const daysUntil = Math.max(0, Math.ceil((departureDate - new Date()) / (1000 * 60 * 60 * 24)));

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
    <>
      <SafeAreaView style={jn.safe}>

        {/* Sticky header */}
        <View style={jn.header}>
          <View style={jn.headerLeft}>
            <Text style={jn.headerTitle}>Guidance</Text>
            <Text style={jn.headerSub}>Your step-by-step pilgrimage guide</Text>
          </View>
          <View style={jn.departureBadge}>
            <Text style={jn.departureDays}>{daysUntil}</Text>
            <Text style={jn.departureLbl}>{"days\nto go"}</Text>
          </View>
        </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex:1 }} contentContainerStyle={jn.scroll}>

        {/* ── 1. Mode toggle — compact single bar ── */}
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

        {/* ── 2. HERO CARD: Step-by-step Guide ── */}
        <TouchableOpacity style={jn.heroCard}
          onPress={() => navigation?.navigate?.(mode === "umrah" ? "UmrahGuide" : "HajjGuide")}
          activeOpacity={0.92}>
          <ImageBackground
            source={require("../assets/kaaba_mixed.png")}
            style={jn.heroCardBg}
            imageStyle={{ resizeMode:"cover" }}>
            <View style={jn.heroCardScrim} />
            <View style={jn.heroCardContent}>
              {/* Top row: badge left, arrow right */}
              <View style={jn.heroCardTopRow}>
                <View style={jn.heroCardBadge}>
                  <Text style={jn.heroCardBadgeTxt}>{mode === "umrah" ? "UMRAH" : "HAJJ"}</Text>
                </View>
                <Text style={jn.heroCardArrowRight}>{"›"}</Text>
              </View>
              {/* Bottom: title, sub, progress */}
              <View style={jn.heroCardBottom}>
                <Text style={jn.heroCardTitle}>{mode === "umrah" ? "Umrah Guide" : "Hajj Guide"}</Text>
                <Text style={jn.heroCardSub}>{"Complete step-by-step " + (mode === "umrah" ? "Umrah" : "Hajj") + " walkthrough"}</Text>
                {/* Progress with colour bar background */}
                <View style={jn.heroProgWrap}>
                  <View style={jn.heroProgRow}>
                    <View style={jn.heroProgTrack}>
                      {Array.from({ length:steps.length }, (_, i) => (
                        <View key={i} style={i < completedCount ? [jn.heroProgSeg, jn.heroProgSegFill] : jn.heroProgSeg} />
                      ))}
                    </View>
                    <Text style={jn.heroProgLabel}>{completedCount} of {steps.length}</Text>
                  </View>
                </View>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* ── 3. My Journey Board ── */}
        <TouchableOpacity style={jn.boardCard}
          onPress={() => navigation?.navigate?.("MyBoard")}
          activeOpacity={0.88}>
          <ImageBackground
            source={require("../assets/myboard.jpg")}
            style={jn.boardCardBg}
            imageStyle={{ resizeMode:"cover" }}>
            <View style={jn.boardScrim} />
            <View style={jn.boardContent}>
              <Text style={jn.boardEyebrow}>YOUR BOARD</Text>
              <Text style={jn.boardTitle}>My Journey Board</Text>
              <Text style={jn.boardSub}>Notes, duas, links & reminders</Text>
              {boardCards.length > 0 ? (
                <View style={jn.boardStats}>
                  <View style={jn.boardStat}>
                    <Text style={jn.boardStatNum}>{boardCards.length}</Text>
                    <Text style={jn.boardStatLbl}>cards</Text>
                  </View>
                  <View style={jn.boardStatDivider} />
                  {boardChecklist > 0 ? (
                    <View style={jn.boardStat}>
                      <Text style={jn.boardStatNum}>{boardDone}/{boardChecklist}</Text>
                      <Text style={jn.boardStatLbl}>tasks</Text>
                    </View>
                  ) : null}
                </View>
              ) : (
                <Text style={jn.boardEmpty}>Tap to start {"›"}</Text>
              )}
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* ── 4. Du'ā Card — changes with mode toggle ── */}
        <TouchableOpacity
          style={jn.duaCard}
          onPress={() => navigation?.navigate?.("PilgrimageDuas", { mode })}
          activeOpacity={0.88}
        >
          <ImageBackground
            source={mode === "umrah"
              ? require("../assets/tawaf.jpg")
              : require("../assets/arafah.jpg")}
            style={jn.duaCardBg}
            imageStyle={{ borderRadius:16, resizeMode:"cover" }}
          >
            <View style={jn.duaCardScrim} />
            <View style={jn.duaCardContent}>
              <Text style={jn.duaCardEyebrow}>{mode === "umrah" ? "UMRAH" : "HAJJ"}</Text>
              <Text style={jn.duaCardTitle}>
                {mode === "umrah" ? "Umrah Du\u02bf\u0101s" : "Hajj Du\u02bf\u0101s"}
              </Text>
              <Text style={jn.duaCardSub}>
                {mode === "umrah" ? "Every du\u02bf\u0101 for every stage" : "From Ihr\u0101m to Farewell"}
              </Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* ── 5. Safar Assist — AI import card ── */}
        <TouchableOpacity
          style={jn.assistCard}
          onPress={() => navigation?.navigate?.("SafarAssist")}
          activeOpacity={0.88}
        >
          <View style={jn.assistInner}>
            <View style={jn.assistLeft}>
              <View style={jn.assistDot} />
              <View>
                <Text style={jn.assistTitle}>Safar Assist</Text>
                <Text style={jn.assistSub}>{"Add flights, hotels, contacts & group details in seconds"}</Text>
              </View>
            </View>
            <Text style={jn.assistArrow}>{"›"}</Text>
          </View>
          <Text style={jn.assistTagline}>{"Speak it, scan it, or upload it."}</Text>
        </TouchableOpacity>

        {/* ── 4. Sacred Places + What to Expect — real images ── */}
        <View style={jn.halfRow}>

          <TouchableOpacity style={jn.halfCard}
            onPress={() => navigation?.navigate?.("Map")}
            activeOpacity={0.88}>
            <ImageBackground
              source={require("../assets/kaaba_map.png")}
              style={jn.halfCardImg}
              imageStyle={{ resizeMode:"cover" }}>
              <View style={jn.halfCardScrimDark} />
              <View style={jn.halfCardOverlayWrap}>
                {/* Count + label — top right */}
                <View style={jn.halfCardCountWrap}>
                  <Text style={jn.halfCardCount}>14</Text>
                  <Text style={jn.halfCardCategory}>sites</Text>
                </View>
                {/* Title + sub — bottom left */}
                <View style={jn.halfCardOverlay}>
                  <Text style={jn.halfCardCategory}>LOCATIONS</Text>
                  <Text style={jn.halfCardTitleWhite}>Sacred Places</Text>
                  <Text style={jn.halfCardSubWhite}>Duas for each location</Text>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>

          <TouchableOpacity style={jn.halfCard}
            onPress={() => navigation?.navigate?.("WhatToExpect")}
            activeOpacity={0.88}>
            <ImageBackground
              source={require("../assets/what_to_expect.jpg")}
              style={jn.halfCardImg}
              imageStyle={{ resizeMode:"cover" }}>
              <View style={jn.halfCardScrim} />
              <View style={jn.halfCardOverlayWrap}>
                {/* Count + label — top right */}
                <View style={jn.halfCardCountWrap}>
                  <Text style={jn.halfCardCount}>8</Text>
                  <Text style={jn.halfCardCategory}>topics</Text>
                </View>
                {/* Title + sub — bottom left */}
                <View style={jn.halfCardOverlay}>
                  <Text style={jn.halfCardCategory}>LOGISTICS</Text>
                  <Text style={jn.halfCardTitleWhite}>What to Expect</Text>
                  <Text style={jn.halfCardSubWhite}>Plan & prepare</Text>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>

        </View>

        {/* ── 5. Groups + Contacts — compact utility row ── */}
        <View style={jn.compactRow}>

          <TouchableOpacity style={jn.compactCard}
            onPress={() => navigation?.navigate?.("Groups")}
            activeOpacity={0.88}>
            <Text style={jn.compactTitle}>My Groups</Text>
            <Text style={jn.compactSub}>{"Share milestones\nand updates"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={jn.compactCard}
            onPress={() => navigation?.navigate?.("MyContacts")}
            activeOpacity={0.88}>
            <Text style={jn.compactTitle}>My Contacts</Text>
            <Text style={jn.compactSub}>{"Save your\nimportant contacts"}</Text>
          </TouchableOpacity>

        </View>

        <View style={{ height:spacing(5) }} />
      </ScrollView>

    </SafeAreaView>

    {/* Safar Assist floating action button */}
    <TouchableOpacity
      style={jn.fab}
      onPress={() => navigation?.navigate?.("SafarAssist")}
      activeOpacity={0.88}
    >
      <Sparkle size={24} color="#F5F0E8" weight="regular" />
    </TouchableOpacity>
    </>
  );
}

const jn = StyleSheet.create({
  safe:   { flex:1, backgroundColor:colors.background },
  scroll: { paddingHorizontal:spacing(2.5), paddingTop:spacing(1.5) },

  // Safar Assist floating button
  fab: {
    position:"absolute",
    bottom:32,
    right:20,
    width:52,
    height:52,
    borderRadius:26,
    backgroundColor:"#4A5C48",
    alignItems:"center",
    justifyContent:"center",
    shadowColor:"#000",
    shadowOffset:{width:0,height:4},
    shadowOpacity:0.25,
    shadowRadius:10,
    elevation:8,
  },


  // Header — fixed 72px matches all other tabs
  header:          { height:72, flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:spacing(2.5), backgroundColor:colors.background },
  headerLeft:      { flex:1 },
  headerTitle:     { fontFamily:SERIF, fontSize:26, fontWeight:"400", color:colors.text },
  headerSub:       { fontSize:14, color:colors.subtext, fontWeight:"400", marginTop:3 },
  // Departure badge — small, never stretches header
  departureBadge:  { alignItems:"center", paddingHorizontal:spacing(1.25), paddingVertical:4, borderWidth:1, borderColor:"#C4A882", borderRadius:radius.md, minWidth:52 },
  departureDays:   { fontFamily:SERIF, fontSize:18, color:colors.text, fontWeight:"400", lineHeight:22 },
  departureLbl:    { fontSize:9, color:colors.subtext, textAlign:"center", lineHeight:12, letterSpacing:0.3 },

  // ── 1. Mode toggle — compact single bar ──────────────────────────────────────
  modeWrap:        { marginBottom:spacing(1.5) },
  modeToggle:      { flexDirection:"row", backgroundColor:colors.card, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, padding:3, ...shadows.card },
  modeOpt:         { flex:1, alignItems:"center", paddingVertical:spacing(1.75), borderRadius:radius.md, gap:4 },
  modeOptActive:   { backgroundColor:colors.primary },
  modeName:        { fontFamily:SERIF, fontSize:19, color:colors.subtext, fontWeight:"400", letterSpacing:1 },
  modeNameActive:  { color:"#fff", fontWeight:"600" },
  modeSub:         { fontSize:13, color:colors.subtext, fontWeight:"400", textAlign:"center" },
  modeSubActive:   { color:"rgba(255,255,255,0.8)" },

  // ── 2. Hero card: Step-by-step Guide — taller at 260 ─────────────────────────
  heroCard:          { borderRadius:radius.xl, overflow:"hidden", marginBottom:spacing(1.5), height:260, ...shadows.card },

  // Du'ā card — full width, changes with mode toggle
  duaCard:       { height:160, borderRadius:16, overflow:"hidden", marginBottom:spacing(1.5), shadowColor:"#1C1408", shadowOffset:{width:0,height:4}, shadowOpacity:0.16, shadowRadius:12, elevation:6 },
  duaCardBg:     { flex:1, justifyContent:"flex-end" },
  duaCardScrim:  { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(8,14,6,0.45)", borderRadius:16 },
  duaCardContent:{ padding:16 },
  duaCardEyebrow:{ fontSize:9, color:"rgba(255,255,255,0.70)", fontWeight:"700", letterSpacing:1.5, textTransform:"uppercase", marginBottom:4 },
  duaCardTitle:  { fontFamily:SERIF, fontSize:20, color:"#fff", fontWeight:"600", marginBottom:2 },
  duaCardSub:    { fontSize:12, color:"rgba(255,255,255,0.75)" },

  assistCard:    { backgroundColor:"#fff", borderRadius:14, borderWidth:1, borderColor:"#EAE4DC", padding:16, marginBottom:spacing(1.5), shadowColor:"#1C1408", shadowOffset:{width:0,height:2}, shadowOpacity:0.08, shadowRadius:8, elevation:3 },
  assistInner:   { flexDirection:"row", alignItems:"center", marginBottom:6 },
  assistLeft:    { flex:1, flexDirection:"row", alignItems:"flex-start", gap:10 },
  assistDot:     { width:10, height:10, borderRadius:5, backgroundColor:"#4A5C48", marginTop:4, flexShrink:0 },
  assistTitle:   { fontFamily:SERIF, fontSize:17, color:"#1C1A14", fontWeight:"600", marginBottom:2 },
  assistSub:     { fontSize:13, color:"#7A7060", lineHeight:18 },
  assistArrow:   { fontSize:22, color:"#B8922A", marginLeft:8 },
  assistTagline: { fontSize:12, color:"#4A5C48", fontWeight:"600", paddingLeft:20 },
  heroCardBg:        { flex:1 },
  heroCardScrim:     { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(10,8,4,0.52)" },
  heroCardContent:   { flex:1, justifyContent:"space-between", padding:spacing(2) },
  heroCardTopRow:    { flexDirection:"row", justifyContent:"space-between", alignItems:"center" },
  heroCardBadge:     { backgroundColor:"#fff", borderRadius:radius.pill, paddingHorizontal:spacing(1.75), paddingVertical:spacing(0.75) },
  heroCardBadgeTxt:  { fontFamily:SERIF, fontSize:13, color:colors.primary, fontWeight:"700", letterSpacing:1 },
  heroCardArrowRight:{ fontSize:28, color:"rgba(255,255,255,0.7)" },
  heroCardBottom:    { },
  heroCardTitle:     { fontFamily:SERIF, fontSize:26, color:"#fff", fontWeight:"400", marginBottom:5 },
  heroCardSub:       { fontSize:14, color:"rgba(255,255,255,0.75)", fontWeight:"400", marginBottom:spacing(1.5) },
  // Progress with coloured background bar
  heroProgWrap:      { backgroundColor:"rgba(20,55,40,0.75)", borderRadius:radius.md, padding:spacing(1.25) },
  heroProgRow:       { flexDirection:"row", alignItems:"center", gap:spacing(1.5) },
  heroProgTrack:     { flex:1, flexDirection:"row", gap:2, height:5 },
  heroProgSeg:       { flex:1, height:"100%", borderRadius:3, backgroundColor:"rgba(255,255,255,0.25)" },
  heroProgSegFill:   { backgroundColor:"#fff" },
  heroProgLabel:     { fontSize:13, color:"#fff", fontWeight:"600" },

  // ── 3. Board card — shorter at 150, YOUR BOARD label, divider ────────────────
  boardCard:       { borderRadius:radius.xl, overflow:"hidden", marginBottom:spacing(1.5), height:150, ...shadows.card },
  boardCardBg:     { flex:1 },
  boardScrim:      { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(10,8,4,0.22)" },
  boardContent:    { position:"absolute", top:0, bottom:0, left:0, right:0, justifyContent:"flex-end", padding:spacing(2) },
  boardEyebrow:    { fontSize:10, fontWeight:"700", letterSpacing:2, color:"rgba(240,228,200,0.7)", marginBottom:4 },
  boardTitle:      { fontFamily:SERIF, fontSize:21, color:"#fff", fontWeight:"400", marginBottom:3 },
  boardSub:        { fontSize:15, color:"rgba(255,255,255,0.68)", marginBottom:spacing(1.25) },
  boardStats:      { flexDirection:"row", gap:spacing(2), alignItems:"center" },
  boardStat:       { alignItems:"flex-start" },
  boardStatNum:    { fontFamily:SERIF, fontSize:28, color:"#fff", fontWeight:"400", lineHeight:32 },
  boardStatLbl:    { fontSize:10, color:"rgba(255,255,255,0.65)", letterSpacing:0.5 },
  boardStatDivider:{ width:1, height:36, backgroundColor:"rgba(255,255,255,0.3)", marginHorizontal:spacing(0.5) },
  boardEmpty:      { fontSize:13, color:"rgba(255,255,255,0.72)", fontStyle:"italic" },

  // ── 4. Half cards — count + category label + title ───────────────────────────
  halfRow:           { flexDirection:"row", gap:spacing(1.25), marginBottom:spacing(1.5) },
  halfCard:          { flex:1, borderRadius:radius.lg, overflow:"hidden", height:160, ...shadows.card },
  halfCardImg:       { flex:1, justifyContent:"flex-end" },
  halfCardScrim:     { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(10,8,4,0.22)" },
  halfCardScrimDark: { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(10,8,4,0.38)" },
  halfCardOverlayWrap:{ ...StyleSheet.absoluteFillObject, justifyContent:"space-between", padding:spacing(1.5) },
  halfCardCountWrap:  { alignSelf:"flex-end", alignItems:"flex-end" },
  halfCardOverlay:   { },
  halfCardCount:     { fontFamily:SERIF, fontSize:22, color:"#fff", fontWeight:"400", lineHeight:26 },
  halfCardCategory:  { fontSize:9, fontWeight:"700", letterSpacing:1.5, color:"rgba(255,255,255,0.72)", marginBottom:3, textTransform:"uppercase" },
  halfCardTitleWhite:{ fontFamily:SERIF, fontSize:17, color:"#fff", fontWeight:"400", marginBottom:2 },
  halfCardSubWhite:  { fontSize:13, color:"rgba(255,255,255,0.85)" },

  // ── 5. Compact image cards: Groups + Contacts ─────────────────────────────────
  compactRow:      { flexDirection:"row", gap:spacing(1.25), marginBottom:spacing(1.5) },
  compactCard:     { flex:1, justifyContent:"flex-end", backgroundColor:colors.card, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, padding:spacing(2), height:149, ...shadows.card },
  compactTitle:    { fontFamily:SERIF, fontSize:17, color:colors.text, fontWeight:"500", marginBottom:4 },
  compactSub:      { fontSize:14, color:colors.subtext, lineHeight:18 },
  compactArrow:    { fontSize:22, color:colors.border },

  // Legacy styles — kept for any remaining refs
  linkCard:       { flexDirection:"row", alignItems:"center", backgroundColor:colors.card, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, marginBottom:spacing(1.25), padding:spacing(2), gap:spacing(1.5), ...shadows.card },
  linkIconWrap:   { width:48, height:48, borderRadius:radius.md, backgroundColor:colors.background, borderWidth:1, borderColor:colors.border, alignItems:"center", justifyContent:"center", flexShrink:0 },
  linkIcon:       { fontSize:22 },
  linkInfo:       { flex:1 },
  linkLabel:      { fontFamily:SERIF, fontSize:16, color:colors.text, marginBottom:3 },
  linkSub:        { fontSize:13, color:colors.subtext, fontWeight:"400" },
  linkArrow:      { fontSize:20, color:colors.border },
  linkCounter:    { alignItems:"center", justifyContent:"center", minWidth:40 },
  linkCounterNum: { fontFamily:SERIF, fontSize:18, color:colors.primary, fontWeight:"500", lineHeight:22 },
  linkCounterOf:  { fontSize:10, color:colors.subtext, textAlign:"center" },
});
