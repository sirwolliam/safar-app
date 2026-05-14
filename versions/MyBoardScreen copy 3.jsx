/**
 * MyBoardScreen.jsx — Safar
 * Clean uniform card design. Fixed swipe reveal layout.
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, TextInput, KeyboardAvoidingView,
  Platform, Animated, PanResponder, Linking, Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DUAS } from "../dua-content";
import { colors, spacing, radius, typography, shadows } from "../theme";

const SERIF     = "SourceSerif4-Regular";
const BOARD_KEY = "safar_journey_board_v1";

const CARD_TYPES = [
  { key:"note",      label:"Note",           emoji:"\uD83D\uDCDD", desc:"Personal intention or reminder" },
  { key:"checklist", label:"Checklist item", emoji:"\u2713",       desc:"Something to prepare or pack"   },
  { key:"dua",       label:"Pin a Du\u02bf\u0101\u02be", emoji:"\uD83E\uDD32", desc:"Save a specific du\u02bf\u0101\u02be" },
  { key:"link",      label:"Link",           emoji:"\uD83D\uDD17", desc:"A URL, booking or resource" },
];

const SUGGESTIONS = {
  note:      ["My intention for this journey", "Things to remember at the Ka\u02bfbah", "Du\u02bf\u0101\u02be for my family"],
  checklist: ["Pack ihram clothing","Renew passport","Book accommodation near Haram","Get travel insurance","Exchange currency to SAR","Download offline maps"],
  link:      ["Flight booking","Hotel near Haram","Nusuk registration"],
};

// ── Swipeable card ────────────────────────────────────────────────────────────
function SwipeCard({ card, onDelete, onEdit, onToggle }) {
  const tx = useRef(new Animated.Value(0)).current;

  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: (_,gs) => Math.abs(gs.dx) > 10,
    onMoveShouldSetPanResponder:  (_,gs) => Math.abs(gs.dx) > 10 && Math.abs(gs.dx) > Math.abs(gs.dy),
    onPanResponderMove:    (_,gs) => tx.setValue(Math.max(-130, Math.min(90, gs.dx))),
    onPanResponderRelease: (_,gs) => {
      if      (gs.dx < -65) Animated.spring(tx, { toValue:-110, useNativeDriver:true }).start();
      else if (gs.dx >  65) Animated.spring(tx, { toValue:80,   useNativeDriver:true }).start();
      else                  Animated.spring(tx, { toValue:0,    useNativeDriver:true }).start();
    },
  })).current;

  const reset = () => Animated.spring(tx, { toValue:0, useNativeDriver:true }).start();

  const handlePress = () => {
    if (Math.abs(tx._value) > 15) { reset(); return; }
    if (card.type === "checklist") onToggle(card.id);
    if (card.type === "link" && card.url) Linking.openURL(card.url);
  };

  return (
    <View style={sw.wrap}>
      {/* Edit action — left side */}
      <View style={sw.editBg}>
        <TouchableOpacity style={sw.actionBtn} onPress={() => { reset(); onEdit(card); }}>
          <Text style={sw.actionIcon}>{"\u270F\uFE0F"}</Text>
          <Text style={sw.actionTxt}>Edit</Text>
        </TouchableOpacity>
      </View>
      {/* Delete action — right side */}
      <View style={sw.deleteBg}>
        <TouchableOpacity style={sw.actionBtn} onPress={() => {
          Alert.alert("Remove","Remove this card?",[
            { text:"Cancel", style:"cancel", onPress:reset },
            { text:"Remove", style:"destructive", onPress:() => onDelete(card.id) },
          ]);
        }}>
          <Text style={sw.actionIcon}>{"\uD83D\uDDD1\uFE0F"}</Text>
          <Text style={sw.actionTxt}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Card face */}
      <Animated.View style={[sw.face, { transform:[{ translateX:tx }] }]} {...pan.panHandlers}>
        <TouchableOpacity style={sw.card} onPress={handlePress} activeOpacity={0.92}>
          <CardFace card={card} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const sw = StyleSheet.create({
  wrap:      { marginBottom:spacing(1), borderRadius:radius.md, overflow:"hidden" },
  editBg:    { position:"absolute", left:0, top:0, bottom:0, width:80, backgroundColor:colors.primary, borderRadius:radius.md, justifyContent:"center", alignItems:"center" },
  deleteBg:  { position:"absolute", right:0, top:0, bottom:0, width:110, backgroundColor:"#D94F4F", borderRadius:radius.md, justifyContent:"center", alignItems:"center" },
  actionBtn: { alignItems:"center", justifyContent:"center", flex:1, width:"100%", gap:4 },
  actionIcon:{ fontSize:18 },
  actionTxt: { fontSize:11, color:"#fff", fontWeight:"600" },
  face:      { borderRadius:radius.md },
  card:      { backgroundColor:colors.card, borderRadius:radius.md, borderWidth:1, borderColor:colors.border, paddingHorizontal:spacing(2), paddingVertical:spacing(1.75), flexDirection:"row", alignItems:"center", gap:spacing(1.25),
    ...shadows.card,},
});

// ── Card face content ─────────────────────────────────────────────────────────
function CardFace({ card }) {
  const handle = <Text style={cf.handle}>{"\u2630"}</Text>;

  if (card.type === "checklist") return (
    <>
      <View style={card.done ? cf.checkOn : cf.check}>
        {card.done ? <Text style={cf.checkMark}>{"✓"}</Text> : null}
      </View>
      <Text style={[cf.checkTxt, card.done ? cf.checkTxtDone : null]}>{card.text}</Text>
      {handle}
    </>
  );

  if (card.type === "note") return (
    <>
      <Text style={cf.typeTag}>NOTE</Text>
      <Text style={cf.bodyTxt} numberOfLines={2}>{card.text}</Text>
      {handle}
    </>
  );

  if (card.type === "dua") return (
    <>
      <Text style={cf.typeTag}>DU\u02bf\u0100\u02be</Text>
      <View style={{ flex:1 }}>
        <Text style={cf.bodyTxt} numberOfLines={1}>{card.dua?.title}</Text>
        <Text style={cf.subtleTxt} numberOfLines={1}>{card.dua?.stage}</Text>
      </View>
      {handle}
    </>
  );

  if (card.type === "link") return (
    <>
      <Text style={cf.typeTag}>LINK</Text>
      <View style={{ flex:1 }}>
        <Text style={cf.bodyTxt} numberOfLines={1}>{card.title}</Text>
        <Text style={cf.subtleTxt} numberOfLines={1}>{card.url?.replace("https://","")}</Text>
      </View>
      <Text style={cf.linkArrow}>{"\u2197"}</Text>
    </>
  );

  return null;
}

const cf = StyleSheet.create({
  typeTag:     { fontSize:10, fontWeight:"700", letterSpacing:1.5, color:colors.primary, width:38 },
  bodyTxt:     { flex:1, fontFamily:SERIF, fontSize:typography.body, color:colors.text },
  subtleTxt:   { fontSize:typography.tiny, color:colors.subtext, marginTop:2 },
  check:       { width:22, height:22, borderRadius:11, borderWidth:1.5, borderColor:colors.border, alignItems:"center", justifyContent:"center", flexShrink:0 },
  checkOn:     { width:22, height:22, borderRadius:11, backgroundColor:colors.primary, alignItems:"center", justifyContent:"center", flexShrink:0 },
  checkMark:   { fontSize:12, color:"#fff", fontWeight:"700" },
  checkTxt:    { flex:1, fontFamily:SERIF, fontSize:typography.body, color:colors.text },
  checkTxtDone:{ color:colors.subtext, textDecorationLine:"line-through" },
  handle:      { fontSize:15, color:colors.border },
  linkArrow:   { fontSize:14, color:colors.primary },
});

// ── Card modal ────────────────────────────────────────────────────────────────
function CardModal({ visible, editCard, onSave, onClose }) {
  const [step,        setStep]        = useState("type");
  const [cardType,    setCardType]    = useState(null);
  const [text,        setText]        = useState("");
  const [title,       setTitle]       = useState("");
  const [url,         setUrl]         = useState("");
  const [selectedDua, setSelectedDua] = useState(null);
  const [duaSearch,   setDuaSearch]   = useState("");
  const isEdit = !!editCard;

  useEffect(() => {
    if (editCard) {
      setCardType(editCard.type); setStep("form");
      setText(editCard.text ?? ""); setTitle(editCard.title ?? "");
      setUrl(editCard.url ?? ""); setSelectedDua(editCard.dua ?? null);
    }
  }, [editCard]);

  const reset = () => { setStep("type"); setCardType(null); setText(""); setTitle(""); setUrl(""); setSelectedDua(null); setDuaSearch(""); };
  const handleClose = () => { reset(); onClose(); };

  const handleSave = () => {
    let card = editCard ? { ...editCard } : { id:Date.now().toString(), type:cardType, createdAt:new Date().toISOString() };
    if (cardType === "note")      card = { ...card, text:text.trim() };
    if (cardType === "checklist") card = { ...card, text:text.trim() };
    if (cardType === "dua")       card = { ...card, dua:selectedDua };
    if (cardType === "link")      card = { ...card, title:title.trim()||url, url:url.trim().startsWith("http")?url.trim():"https://"+url.trim() };
    if (!text.trim() && cardType !== "dua" && cardType !== "link") return;
    if (cardType === "dua" && !selectedDua) return;
    if (cardType === "link" && !url.trim()) return;
    onSave(card); reset();
  };

  const filteredDuas = DUAS.filter(d =>
    d.title.toLowerCase().includes(duaSearch.toLowerCase()) ||
    (d.stage ?? "").toLowerCase().includes(duaSearch.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==="ios"?"padding":"height"}>
        <View style={md.overlay}>
          <View style={md.sheet}>
            <View style={md.handle} />
            <View style={md.header}>
              {step==="form" && !isEdit
                ? <TouchableOpacity onPress={() => setStep("type")}><Text style={md.back}>{"\u2039"} Back</Text></TouchableOpacity>
                : <View style={{ width:50 }} />}
              <Text style={md.title}>{isEdit ? "Edit card" : step==="type" ? "Add to board" : CARD_TYPES.find(t=>t.key===cardType)?.label}</Text>
              <TouchableOpacity onPress={handleClose}><Text style={md.close}>{"\u2715"}</Text></TouchableOpacity>
            </View>

            {step === "type" && !isEdit && (
              <View style={md.typeGrid}>
                {CARD_TYPES.map(type => (
                  <TouchableOpacity key={type.key} style={md.typeOpt}
                    onPress={() => { setCardType(type.key); setStep("form"); }} activeOpacity={0.85}>
                    <Text style={md.typeEmoji}>{type.emoji}</Text>
                    <Text style={md.typeLabel}>{type.label}</Text>
                    <Text style={md.typeDesc}>{type.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {step === "form" && (
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {(cardType === "note" || cardType === "checklist") && (
                  <>
                    <Text style={md.fieldLabel}>{cardType==="note" ? "What would you like to remember?" : "What do you need to prepare?"}</Text>
                    <TextInput style={cardType==="note" ? [md.input, md.inputMulti] : md.input}
                      placeholder={cardType==="note" ? "e.g. My intention for this journey..." : "e.g. Pack ihram clothing"}
                      placeholderTextColor={colors.subtext} value={text} onChangeText={setText}
                      multiline={cardType==="note"} autoFocus={!isEdit} />
                    {!isEdit && (SUGGESTIONS[cardType]??[]).map(s => (
                      <TouchableOpacity key={s} style={md.suggestion} onPress={() => setText(s)}>
                        <Text style={md.suggestionTxt}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
                {cardType === "dua" && (
                  <>
                    <Text style={md.fieldLabel}>Search for a du\u02bf\u0101\u02be</Text>
                    <View style={md.searchBar}>
                      <Text style={{ fontSize:14, color:colors.subtext }}>{"\uD83D\uDD0D"}</Text>
                      <TextInput style={md.searchInput} placeholder="Search by title or stage..."
                        placeholderTextColor={colors.subtext} value={duaSearch} onChangeText={setDuaSearch} />
                    </View>
                    {filteredDuas.map(dua => (
                      <TouchableOpacity key={dua.id}
                        style={selectedDua?.id===dua.id ? [md.duaRow, md.duaRowOn] : md.duaRow}
                        onPress={() => setSelectedDua(dua)} activeOpacity={0.85}>
                        <View style={selectedDua?.id===dua.id ? md.duaCheckOn : md.duaCheck}>
                          {selectedDua?.id===dua.id ? <Text style={{ fontSize:10, color:"#fff", fontWeight:"700" }}>{"✓"}</Text> : null}
                        </View>
                        <View style={{ flex:1 }}>
                          <Text style={md.duaTitle}>{dua.title}</Text>
                          <Text style={md.duaStage}>{dua.stage}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
                {cardType === "link" && (
                  <>
                    <Text style={md.fieldLabel}>URL</Text>
                    <TextInput style={md.input} placeholder="https://..." placeholderTextColor={colors.subtext}
                      value={url} onChangeText={setUrl} keyboardType="url" autoCapitalize="none" autoCorrect={false} autoFocus={!isEdit} />
                    <Text style={md.fieldLabel}>Title (optional)</Text>
                    <TextInput style={md.input} placeholder="e.g. My hotel booking"
                      placeholderTextColor={colors.subtext} value={title} onChangeText={setTitle} />
                  </>
                )}
                <TouchableOpacity style={md.saveBtn} onPress={handleSave} activeOpacity={0.88}>
                  <Text style={md.saveBtnTxt}>{isEdit ? "Save changes" : "Add to board"}</Text>
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

const md = StyleSheet.create({
  overlay:      { flex:1, backgroundColor:"rgba(0,0,0,0.4)", justifyContent:"flex-end" },
  sheet:        { backgroundColor:"#D4E4DC", borderTopLeftRadius:24, borderTopRightRadius:24, paddingHorizontal:spacing(2.5), paddingBottom:spacing(2), maxHeight:"90%" },
  handle:       { width:36, height:4, borderRadius:2, backgroundColor:"rgba(47,93,80,0.3)", alignSelf:"center", marginTop:spacing(1.5), marginBottom:spacing(1) },
  header:       { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:spacing(2) },
  back:         { fontSize:typography.body, color:colors.primary, fontWeight:"500", width:50 },
  title:        { fontFamily:SERIF, fontSize:18, color:colors.text },
  close:        { fontSize:16, color:colors.subtext, width:50, textAlign:"right" },
  typeGrid:     { flexDirection:"row", flexWrap:"wrap", gap:spacing(1.25), marginBottom:spacing(2) },
  typeOpt:      { width:"47%", backgroundColor:colors.card, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, padding:spacing(2), alignItems:"center", gap:6,
    ...shadows.card,},
  typeEmoji:    { fontSize:26 },
  typeLabel:    { fontFamily:SERIF, fontSize:typography.body, color:colors.text },
  typeDesc:     { fontSize:typography.tiny, color:colors.subtext, textAlign:"center", lineHeight:16 },
  fieldLabel:   { fontSize:10, fontWeight:"700", letterSpacing:1.5, color:colors.subtext, marginBottom:spacing(0.75) },
  input:        { backgroundColor:colors.card, borderRadius:radius.md, borderWidth:1, borderColor:colors.border, paddingHorizontal:spacing(1.75), paddingVertical:spacing(1.25), fontSize:typography.body, color:colors.text, marginBottom:spacing(1.75),
    ...shadows.card,},
  inputMulti:   { minHeight:100, textAlignVertical:"top" },
  suggestion:   { backgroundColor:"rgba(47,93,80,0.08)", borderRadius:radius.sm, paddingHorizontal:spacing(1.5), paddingVertical:spacing(1), marginBottom:spacing(0.75) },
  suggestionTxt:{ fontSize:typography.small, color:colors.primary },
  searchBar:    { flexDirection:"row", alignItems:"center", gap:spacing(1), backgroundColor:colors.card, borderRadius:radius.md, borderWidth:1, borderColor:colors.border, paddingHorizontal:spacing(1.75), paddingVertical:spacing(1.25), marginBottom:spacing(1.5),
    ...shadows.card,},
  searchInput:  { flex:1, fontSize:typography.body, color:colors.text, padding:0 },
  duaRow:       { flexDirection:"row", alignItems:"center", gap:spacing(1.25), paddingVertical:spacing(1.25), borderBottomWidth:1, borderBottomColor:colors.border },
  duaRowOn:     { backgroundColor:"rgba(47,93,80,0.06)", borderRadius:radius.sm },
  duaCheck:     { width:22, height:22, borderRadius:11, borderWidth:1.5, borderColor:colors.border, alignItems:"center", justifyContent:"center" },
  duaCheckOn:   { width:22, height:22, borderRadius:11, backgroundColor:colors.primary, alignItems:"center", justifyContent:"center" },
  duaTitle:     { fontFamily:SERIF, fontSize:typography.body, color:colors.text, marginBottom:2 },
  duaStage:     { fontSize:typography.tiny, color:colors.subtext },
  saveBtn:      { backgroundColor:colors.primary, borderRadius:radius.md, paddingVertical:spacing(1.75), alignItems:"center", marginTop:spacing(2) },
  saveBtnTxt:   { fontFamily:SERIF, fontSize:typography.body, color:"#fff", fontWeight:"500" },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function MyBoardScreen({ navigation }) {
  const [cards,     setCards]     = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editCard,  setEditCard]  = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(BOARD_KEY).then(v => { if (v) setCards(JSON.parse(v)); }).catch(() => {});
  }, []);

  const save = useCallback(list => {
    setCards(list);
    AsyncStorage.setItem(BOARD_KEY, JSON.stringify(list)).catch(() => {});
  }, []);

  const addCard    = card => { save([card, ...cards]); setShowModal(false); };
  const updateCard = card => { save(cards.map(c => c.id===card.id ? card : c)); setEditCard(null); setShowModal(false); };
  const deleteCard = id   => save(cards.filter(c => c.id!==id));
  const toggleCard = id   => save(cards.map(c => c.id===id ? {...c, done:!c.done} : c));

  const done      = cards.filter(c => c.type==="checklist" && c.done).length;
  const checklist = cards.filter(c => c.type==="checklist").length;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.8}>
          <Text style={s.backArrow}>{"\u2039"}</Text>
        </TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>My Journey Board</Text>
          <Text style={s.headerSub}>Notes, checklists, duas and links</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => { setEditCard(null); setShowModal(true); }} activeOpacity={0.85}>
          <Text style={s.addBtnTxt}>+</Text>
        </TouchableOpacity>
      </View>

      {checklist > 0 && (
        <View style={s.progressWrap}>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width:(done/checklist*100)+"%" }]} />
          </View>
          <Text style={s.progressLabel}>{done} of {checklist} tasks done</Text>
        </View>
      )}

      {cards.length > 0 && (
        <View style={s.hintRow}>
          <Text style={s.hint}>{"\u2190\u2192"} Swipe to edit or delete{"   "}{"\u2630"} Drag to reorder</Text>
        </View>
      )}

      {cards.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>{"\uD83D\uDCCB"}</Text>
          <Text style={s.emptyTitle}>Your board is empty</Text>
          <Text style={s.emptyBody}>Add notes, checklist items, pinned du\u02bf\u0101\u02beS and links to personalise your journey.</Text>
          <TouchableOpacity style={s.emptyBtn} onPress={() => setShowModal(true)} activeOpacity={0.85}>
            <Text style={s.emptyBtnTxt}>+ Add your first card</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {cards.map(card => (
            <SwipeCard key={card.id} card={card}
              onDelete={deleteCard}
              onEdit={c => { setEditCard(c); setShowModal(true); }}
              onToggle={toggleCard} />
          ))}
          <View style={{ height:spacing(8) }} />
        </ScrollView>
      )}

      <CardModal visible={showModal} editCard={editCard}
        onSave={editCard ? updateCard : addCard}
        onClose={() => { setShowModal(false); setEditCard(null); }} />

      {cards.length > 0 && (
        <TouchableOpacity style={s.fab} onPress={() => { setEditCard(null); setShowModal(true); }} activeOpacity={0.88}>
          <Text style={s.fabTxt}>+</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex:1, backgroundColor:colors.background },
  header:        { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:spacing(2.5), paddingTop:spacing(2), paddingBottom:spacing(1.5) },
  backBtn:       { width:36, height:36, borderRadius:18, backgroundColor:colors.card, borderWidth:1, borderColor:colors.border, alignItems:"center", justifyContent:"center" },
  backArrow:     { fontSize:22, color:colors.text, lineHeight:26 },
  headerTitle:   { fontFamily:SERIF, fontSize:22, color:colors.text },
  headerSub:     { fontSize:12, color:colors.subtext, fontWeight:"400", marginTop:1 },
  addBtn:        { width:36, height:36, borderRadius:18, backgroundColor:colors.primary, alignItems:"center", justifyContent:"center" },
  addBtnTxt:     { fontSize:22, color:"#fff", lineHeight:26 },
  progressWrap:  { paddingHorizontal:spacing(2.5), marginBottom:spacing(0.5) },
  progressTrack: { height:3, backgroundColor:colors.border, borderRadius:2, overflow:"hidden", marginBottom:4 },
  progressFill:  { height:"100%", backgroundColor:colors.primary, borderRadius:2 },
  progressLabel: { fontSize:typography.tiny, color:colors.primary, fontWeight:"600" },
  hintRow:       { paddingHorizontal:spacing(2.5), marginBottom:spacing(1.25) },
  hint:          { fontSize:typography.tiny, color:colors.subtext, fontWeight:"400" },
  scroll:        { paddingHorizontal:spacing(2.5), paddingTop:spacing(0.5) },
  empty:         { flex:1, alignItems:"center", justifyContent:"center", padding:spacing(3) },
  emptyEmoji:    { fontSize:44, marginBottom:spacing(1.5) },
  emptyTitle:    { fontFamily:SERIF, fontSize:20, color:colors.text, marginBottom:spacing(1) },
  emptyBody:     { fontSize:typography.body, color:colors.subtext, textAlign:"center", lineHeight:22, marginBottom:spacing(2.5) },
  emptyBtn:      { backgroundColor:colors.primary, borderRadius:radius.md, paddingVertical:spacing(1.5), paddingHorizontal:spacing(3) },
  emptyBtnTxt:   { color:"#fff", fontWeight:"500" },
  fab:           { position:"absolute", bottom:spacing(3), right:spacing(2.5), width:52, height:52, borderRadius:26, backgroundColor:colors.primary, alignItems:"center", justifyContent:"center" },
  fabTxt:        { fontSize:28, color:"#fff", lineHeight:34, marginTop:-2 },
});
