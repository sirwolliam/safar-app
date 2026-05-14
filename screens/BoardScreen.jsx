/**
 * BoardScreen.jsx — Safar
 * My Journey Board — notes, checklist items, pinned duas, links.
 * Swipe left to delete, swipe right to edit, long-press + drag to reorder.
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, TextInput, KeyboardAvoidingView,
  Platform, Linking, Alert, Animated, PanResponder,
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
  { key:"link",      label:"Link",           emoji:"\uD83D\uDD17", desc:"A URL, booking or resource"      },
];

const SUGGESTIONS = {
  note:      ["My intention for this journey","Things to remember at the Ka\u02bfbah","Du\u02bf\u0101\u02be for my family"],
  checklist: ["Pack ihram clothing","Renew passport","Book accommodation near Haram","Get travel insurance","Exchange currency to SAR","Download offline maps"],
  link:      ["Flight booking","Hotel near Haram","Nusuk registration"],
};

// ── Swipeable card ────────────────────────────────────────────────────────────
const SWIPE_THRESHOLD = 60;

function SwipeableCard({ card, onDelete, onEdit, onToggle, children }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [swiping, setSwiping] = useState(false);

  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dy) < 15,
    onPanResponderGrant: () => setSwiping(true),
    onPanResponderMove: (_, g) => {
      translateX.setValue(Math.max(-120, Math.min(80, g.dx)));
    },
    onPanResponderRelease: (_, g) => {
      setSwiping(false);
      if (g.dx < -SWIPE_THRESHOLD) {
        // Snap to delete reveal
        Animated.spring(translateX, { toValue:-100, useNativeDriver:true, tension:60, friction:8 }).start();
      } else if (g.dx > SWIPE_THRESHOLD) {
        // Snap to edit reveal
        Animated.spring(translateX, { toValue:70, useNativeDriver:true, tension:60, friction:8 }).start();
      } else {
        // Snap back
        Animated.spring(translateX, { toValue:0, useNativeDriver:true, tension:60, friction:8 }).start();
      }
    },
  })).current;

  const resetSwipe = () => {
    Animated.spring(translateX, { toValue:0, useNativeDriver:true, tension:60, friction:8 }).start();
  };

  return (
    <View style={sw.wrap}>
      {/* Delete action — behind card on right */}
      <TouchableOpacity style={sw.deleteAction} onPress={() => { resetSwipe(); onDelete(); }}>
        <Text style={sw.deleteIcon}>{"\uD83D\uDDD1"}</Text>
        <Text style={sw.deleteLabel}>Delete</Text>
      </TouchableOpacity>

      {/* Edit action — behind card on left */}
      <TouchableOpacity style={sw.editAction} onPress={() => { resetSwipe(); onEdit(); }}>
        <Text style={sw.editIcon}>{"\u270E"}</Text>
        <Text style={sw.editLabel}>Edit</Text>
      </TouchableOpacity>

      {/* Card itself */}
      <Animated.View
        style={[sw.card, { transform:[{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => {
            if (card.type === "checklist") onToggle();
            else if (card.type === "link") Linking.openURL(card.url);
          }}
        >
          {children}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const sw = StyleSheet.create({
  wrap:         { marginBottom:spacing(1), position:"relative" },
  deleteAction: { position:"absolute", right:0, top:0, bottom:0, width:90, backgroundColor:"#E53935", borderRadius:radius.md, alignItems:"center", justifyContent:"center", gap:4 },
  deleteIcon:   { fontSize:20 },
  deleteLabel:  { fontSize:typography.tiny, color:"#fff", fontWeight:"600" },
  editAction:   { position:"absolute", left:0, top:0, bottom:0, width:70, backgroundColor:colors.primary, borderRadius:radius.md, alignItems:"center", justifyContent:"center", gap:4 },
  editIcon:     { fontSize:20, color:"#fff" },
  editLabel:    { fontSize:typography.tiny, color:"#fff", fontWeight:"600" },
  card:         { backgroundColor:colors.card },
});

// ── Draggable list ────────────────────────────────────────────────────────────
function DraggableList({ cards, onReorder, renderCard }) {
  const [dragIndex, setDragIndex]   = useState(null);
  const [hoverIndex, setHoverIndex] = useState(null);
  const ITEM_H = 72;

  const handleLongPress = (index) => {
    setDragIndex(index);
    setHoverIndex(index);
  };

  const handleDragMove = (index, direction) => {
    // direction: -1 = up, 1 = down
    if (dragIndex === null) return;
    const newIndex = dragIndex + direction;
    if (newIndex < 0 || newIndex >= cards.length) return;
    const next = [...cards];
    [next[dragIndex], next[newIndex]] = [next[newIndex], next[dragIndex]];
    onReorder(next);
    setDragIndex(newIndex);
    setHoverIndex(newIndex);
  };

  const handleDrop = () => {
    setDragIndex(null);
    setHoverIndex(null);
  };

  return (
    <View>
      {cards.map((card, index) => {
        const isDragging = dragIndex === index;
        return (
          <View key={card.id} style={isDragging ? [dl.itemWrap, dl.itemDragging] : dl.itemWrap}>
            {renderCard(card, index)}
            {isDragging && (
              <View style={dl.dragControls}>
                <TouchableOpacity style={dl.dragBtn} onPress={() => handleDragMove(index, -1)} disabled={index===0}>
                  <Text style={index===0 ? [dl.dragBtnText, dl.dragBtnDisabled] : dl.dragBtnText}>{"\u2191"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[dl.dragBtn, dl.dragBtnDone]} onPress={handleDrop}>
                  <Text style={dl.dragDoneText}>Done</Text>
                </TouchableOpacity>
                <TouchableOpacity style={dl.dragBtn} onPress={() => handleDragMove(index, 1)} disabled={index===cards.length-1}>
                  <Text style={index===cards.length-1 ? [dl.dragBtnText, dl.dragBtnDisabled] : dl.dragBtnText}>{"\u2193"}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const dl = StyleSheet.create({
  itemWrap:      { position:"relative" },
  itemDragging:  { zIndex:10, shadowColor:"#000", shadowOffset:{width:0,height:4}, shadowOpacity:0.18, shadowRadius:8, elevation:8, borderRadius:radius.md, backgroundColor:colors.card },
  dragControls:  { position:"absolute", right:spacing(1), top:0, bottom:0, flexDirection:"row", alignItems:"center", gap:spacing(0.5), backgroundColor:"rgba(255,255,255,0.95)", borderRadius:radius.sm, paddingHorizontal:spacing(0.75) },
  dragBtn:       { width:32, height:32, borderRadius:16, backgroundColor:colors.background, borderWidth:1, borderColor:colors.border, alignItems:"center", justifyContent:"center" },
  dragBtnDone:   { backgroundColor:colors.primary, borderColor:colors.primary, paddingHorizontal:spacing(1), width:"auto" },
  dragBtnText:   { fontSize:16, color:colors.primary, fontWeight:"700" },
  dragBtnDisabled:{ color:colors.border },
  dragDoneText:  { fontSize:typography.tiny, color:"#fff", fontWeight:"600" },
});

// ── Add / Edit Card Modal ─────────────────────────────────────────────────────
function CardModal({ visible, editCard, onSave, onClose }) {
  const isEdit = !!editCard;
  const [step,        setStep]        = useState(isEdit ? "form" : "type");
  const [cardType,    setCardType]    = useState(editCard?.type ?? null);
  const [text,        setText]        = useState(editCard?.text ?? "");
  const [title,       setTitle]       = useState(editCard?.title ?? "");
  const [url,         setUrl]         = useState(editCard?.url ?? "");
  const [selectedDua, setSelectedDua] = useState(editCard?.dua ?? null);
  const [duaSearch,   setDuaSearch]   = useState("");

  useEffect(() => {
    if (visible) {
      setStep(isEdit ? "form" : "type");
      setCardType(editCard?.type ?? null);
      setText(editCard?.text ?? "");
      setTitle(editCard?.title ?? "");
      setUrl(editCard?.url ?? "");
      setSelectedDua(editCard?.dua ?? null);
      setDuaSearch("");
    }
  }, [visible, editCard]);

  const handleSave = () => {
    let card = { ...(editCard ?? {}), id:editCard?.id ?? Date.now().toString(), type:cardType, createdAt:editCard?.createdAt ?? new Date().toISOString() };
    if (cardType === "note")      card = { ...card, text:text.trim() };
    if (cardType === "checklist") card = { ...card, text:text.trim(), done:editCard?.done ?? false };
    if (cardType === "dua")       card = { ...card, dua:selectedDua };
    if (cardType === "link")      card = { ...card, title:title.trim()||url, url:url.trim().startsWith("http")?url.trim():"https://"+url.trim() };
    if ((cardType === "note" || cardType === "checklist") && !text.trim()) return;
    if (cardType === "dua" && !selectedDua) return;
    if (cardType === "link" && !url.trim()) return;
    onSave(card);
  };

  const filteredDuas = DUAS.filter(d =>
    d.title.toLowerCase().includes(duaSearch.toLowerCase()) ||
    (d.stage ?? "").toLowerCase().includes(duaSearch.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==="ios"?"padding":"height"}>
        <View style={cm.overlay}>
          <View style={cm.sheet}>
            <View style={cm.handle} />
            <View style={cm.header}>
              {step === "form" && !isEdit
                ? <TouchableOpacity onPress={() => setStep("type")}><Text style={cm.back}>{"\u2039"} Back</Text></TouchableOpacity>
                : <View style={{ width:50 }} />}
              <Text style={cm.title}>{isEdit ? "Edit card" : step==="type" ? "Add to board" : CARD_TYPES.find(t=>t.key===cardType)?.label}</Text>
              <TouchableOpacity onPress={onClose}><Text style={cm.close}>{"\u2715"}</Text></TouchableOpacity>
            </View>

            {/* Type picker */}
            {step === "type" && (
              <View style={cm.typeGrid}>
                {CARD_TYPES.map(t => (
                  <TouchableOpacity key={t.key} style={cm.typeOpt}
                    onPress={() => { setCardType(t.key); setStep("form"); }} activeOpacity={0.85}>
                    <View style={cm.typeEmoji}><Text style={{ fontSize:26 }}>{t.emoji}</Text></View>
                    <Text style={cm.typeLabel}>{t.label}</Text>
                    <Text style={cm.typeDesc}>{t.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Form */}
            {step === "form" && (
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {(cardType==="note" || cardType==="checklist") && (
                  <>
                    <Text style={cm.label}>{cardType==="note" ? "What would you like to remember?" : "What do you need to prepare?"}</Text>
                    <TextInput style={cardType==="note" ? [cm.input, cm.inputMulti] : cm.input}
                      placeholder={cardType==="note" ? "e.g. My intention..." : "e.g. Pack ihram clothing"}
                      placeholderTextColor={colors.subtext} value={text} onChangeText={setText}
                      multiline={cardType==="note"} autoFocus={!isEdit} />
                    {!isEdit && (SUGGESTIONS[cardType]??[]).map(s => (
                      <TouchableOpacity key={s} style={cm.chip} onPress={() => setText(s)}>
                        <Text style={cm.chipText}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
                {cardType === "dua" && (
                  <>
                    <Text style={cm.label}>Search for a du\u02bf\u0101\u02be</Text>
                    <View style={cm.searchBar}>
                      <Text style={{ fontSize:14, color:colors.subtext }}>{"\uD83D\uDD0D"}</Text>
                      <TextInput style={cm.searchInput} placeholder="Search..." placeholderTextColor={colors.subtext}
                        value={duaSearch} onChangeText={setDuaSearch} autoFocus={!isEdit} />
                    </View>
                    {filteredDuas.slice(0,20).map(dua => (
                      <TouchableOpacity key={dua.id}
                        style={selectedDua?.id===dua.id ? [cm.duaRow, cm.duaRowOn] : cm.duaRow}
                        onPress={() => setSelectedDua(dua)} activeOpacity={0.85}>
                        <View style={selectedDua?.id===dua.id ? [cm.duaCheck, cm.duaCheckOn] : cm.duaCheck}>
                          {selectedDua?.id===dua.id && <Text style={{ fontSize:10, color:"#fff", fontWeight:"700" }}>{"✓"}</Text>}
                        </View>
                        <View style={{ flex:1 }}>
                          <Text style={cm.duaTitle}>{dua.title}</Text>
                          <Text style={cm.duaStage}>{dua.stage}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
                {cardType === "link" && (
                  <>
                    <Text style={cm.label}>URL</Text>
                    <TextInput style={cm.input} placeholder="https://..." placeholderTextColor={colors.subtext}
                      value={url} onChangeText={setUrl} keyboardType="url" autoCapitalize="none" autoCorrect={false} autoFocus={!isEdit} />
                    <Text style={cm.label}>Title (optional)</Text>
                    <TextInput style={cm.input} placeholder="e.g. My hotel booking" placeholderTextColor={colors.subtext}
                      value={title} onChangeText={setTitle} />
                    {!isEdit && (SUGGESTIONS.link??[]).map(s => (
                      <TouchableOpacity key={s} style={cm.chip} onPress={() => setTitle(s)}>
                        <Text style={cm.chipText}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
                <TouchableOpacity style={cm.saveBtn} onPress={handleSave} activeOpacity={0.88}>
                  <Text style={cm.saveBtnText}>{isEdit ? "Save changes" : "Add to board"}</Text>
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

const cm = StyleSheet.create({
  overlay:    { flex:1, backgroundColor:"rgba(0,0,0,0.4)", justifyContent:"flex-end" },
  sheet:      { backgroundColor:"#D4E4DC", borderTopLeftRadius:24, borderTopRightRadius:24, paddingHorizontal:spacing(2.5), paddingBottom:spacing(2), maxHeight:"90%" },
  handle:     { width:36, height:4, borderRadius:2, backgroundColor:"rgba(47,93,80,0.3)", alignSelf:"center", marginTop:spacing(1.5), marginBottom:spacing(1) },
  header:     { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:spacing(2) },
  back:       { fontSize:typography.body, color:colors.primary, fontWeight:"500", width:50 },
  title:      { fontFamily:SERIF, fontSize:18, color:colors.text },
  close:      { fontSize:16, color:colors.subtext, width:50, textAlign:"right" },
  typeGrid:   { flexDirection:"row", flexWrap:"wrap", gap:spacing(1.25), marginBottom:spacing(2) },
  typeOpt:    { width:"47%", backgroundColor:colors.card, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, padding:spacing(2), alignItems:"center", gap:6, ...shadows.card },
  typeEmoji:  { width:52, height:52, borderRadius:26, backgroundColor:"rgba(47,93,80,0.08)", alignItems:"center", justifyContent:"center" },
  typeLabel:  { fontFamily:SERIF, fontSize:typography.body, color:colors.text },
  typeDesc:   { fontSize:typography.tiny, color:colors.subtext, textAlign:"center", lineHeight:16 },
  label:      { fontSize:10, fontWeight:"700", letterSpacing:1.5, color:colors.subtext, marginBottom:spacing(0.75) },
  input:      { backgroundColor:colors.card, borderRadius:radius.md, borderWidth:1, borderColor:colors.border, paddingHorizontal:spacing(1.75), paddingVertical:spacing(1.25), fontSize:typography.body, color:colors.text, marginBottom:spacing(1.75),
    ...shadows.card,},
  inputMulti: { minHeight:100, textAlignVertical:"top" },
  chip:       { backgroundColor:"rgba(47,93,80,0.08)", borderRadius:radius.sm, paddingHorizontal:spacing(1.5), paddingVertical:spacing(0.875), marginBottom:spacing(0.75) },
  chipText:   { fontSize:typography.small, color:colors.primary },
  searchBar:  { flexDirection:"row", alignItems:"center", gap:spacing(1), backgroundColor:colors.card, borderRadius:radius.md, borderWidth:1, borderColor:colors.border, paddingHorizontal:spacing(1.75), paddingVertical:spacing(1.25), marginBottom:spacing(1.5),
    ...shadows.card,},
  searchInput:{ flex:1, fontSize:typography.body, color:colors.text, padding:0 },
  duaRow:     { flexDirection:"row", alignItems:"center", gap:spacing(1.25), paddingVertical:spacing(1.25), borderBottomWidth:1, borderBottomColor:colors.border },
  duaRowOn:   { backgroundColor:"rgba(47,93,80,0.06)", borderRadius:radius.sm },
  duaCheck:   { width:22, height:22, borderRadius:11, borderWidth:1.5, borderColor:colors.border, alignItems:"center", justifyContent:"center" },
  duaCheckOn: { backgroundColor:colors.primary, borderColor:colors.primary },
  duaTitle:   { fontFamily:SERIF, fontSize:typography.body, color:colors.text, marginBottom:2 },
  duaStage:   { fontSize:typography.tiny, color:colors.subtext },
  saveBtn:    { backgroundColor:colors.primary, borderRadius:radius.md, paddingVertical:spacing(1.75), alignItems:"center", marginTop:spacing(2), ...shadows.button },
  saveBtnText:{ fontFamily:SERIF, fontSize:typography.body, color:"#fff", fontWeight:"500" },
});

// ── Card content views ────────────────────────────────────────────────────────
function CardContent({ card }) {
  if (card.type === "checklist") return (
    <View style={cc.checklistCard}>
      <View style={card.done ? [cc.checkbox, cc.checkboxDone] : cc.checkbox}>
        {card.done && <Text style={cc.checkmark}>{"✓"}</Text>}
      </View>
      <Text style={card.done ? [cc.checklistText, cc.checklistTextDone] : cc.checklistText}>{card.text}</Text>
      <Text style={cc.dragHint}>{"\u2630"}</Text>
    </View>
  );
  if (card.type === "note") return (
    <View style={cc.noteCard}>
      <View style={cc.noteTop}>
        <Text style={cc.noteIcon}>{"\uD83D\uDCDD"}</Text>
        <Text style={cc.dragHint}>{"\u2630"}</Text>
      </View>
      <Text style={cc.noteText}>{card.text}</Text>
    </View>
  );
  if (card.type === "dua") return (
    <View style={cc.duaCard}>
      <View style={cc.duaHeader}>
        <Text style={cc.duaPinLabel}>{"PINNED DU\u02bf\u0100\u02be"}</Text>
        <View style={{ flexDirection:"row", alignItems:"center", gap:spacing(0.75) }}>
          <Text style={{ fontSize:14 }}>{"\uD83E\uDD32"}</Text>
          <Text style={cc.dragHint}>{"\u2630"}</Text>
        </View>
      </View>
      <Text style={cc.duaTitle}>{card.dua?.title}</Text>
      <Text style={cc.duaArabic} numberOfLines={2}>{card.dua?.arabic}</Text>
      <Text style={cc.duaStage}>{card.dua?.stage}</Text>
    </View>
  );
  if (card.type === "link") return (
    <View style={cc.linkCard}>
      <View style={cc.linkIconWrap}><Text style={{ fontSize:18 }}>{"\uD83D\uDD17"}</Text></View>
      <View style={{ flex:1 }}>
        <Text style={cc.linkTitle} numberOfLines={1}>{card.title}</Text>
        <Text style={cc.linkUrl} numberOfLines={1}>{card.url.replace("https://","").replace("http://","")}</Text>
      </View>
      <Text style={cc.dragHint}>{"\u2630"}</Text>
    </View>
  );
  return null;
}

const cc = StyleSheet.create({
  dragHint:          { fontSize:16, color:colors.border, marginLeft:spacing(0.5) },
  checklistCard:     { flexDirection:"row", alignItems:"center", gap:spacing(1.25), backgroundColor:colors.card, borderRadius:radius.md, borderWidth:1, borderColor:colors.border, padding:spacing(1.75),
    ...shadows.card,},
  checkbox:          { width:24, height:24, borderRadius:12, borderWidth:1.5, borderColor:colors.border, alignItems:"center", justifyContent:"center", flexShrink:0 },
  checkboxDone:      { backgroundColor:colors.primary, borderColor:colors.primary },
  checkmark:         { fontSize:12, color:"#fff", fontWeight:"700" },
  checklistText:     { fontFamily:SERIF, fontSize:typography.body, color:colors.text, flex:1 },
  checklistTextDone: { color:colors.subtext, textDecorationLine:"line-through" },
  noteCard:          { backgroundColor:"#FFFBE8", borderRadius:radius.md, borderWidth:1, borderColor:"#E8DDA0", padding:spacing(2),
    ...shadows.card,},
  noteTop:           { flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:spacing(0.5) },
  noteIcon:          { fontSize:16 },
  noteText:          { fontFamily:SERIF, fontSize:typography.body, color:colors.text, lineHeight:typography.body*1.55 },
  duaCard:           { backgroundColor:"rgba(47,93,80,0.07)", borderRadius:radius.md, borderWidth:1, borderColor:"rgba(47,93,80,0.2)", padding:spacing(2) },
  duaHeader:         { flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:spacing(0.75) },
  duaPinLabel:       { fontSize:9, fontWeight:"700", letterSpacing:1.5, color:colors.primary },
  duaTitle:          { fontFamily:SERIF, fontSize:typography.body, color:colors.text, marginBottom:spacing(0.5) },
  duaArabic:         { fontSize:16, color:colors.subtext, textAlign:"right", lineHeight:28, marginBottom:spacing(0.5) },
  duaStage:          { fontSize:typography.tiny, color:colors.primary },
  linkCard:          { flexDirection:"row", alignItems:"center", gap:spacing(1.25), backgroundColor:colors.card, borderRadius:radius.md, borderWidth:1, borderColor:colors.border, padding:spacing(1.75),
    ...shadows.card,},
  linkIconWrap:      { width:38, height:38, borderRadius:radius.sm, backgroundColor:"rgba(47,93,80,0.08)", alignItems:"center", justifyContent:"center", flexShrink:0 },
  linkTitle:         { fontFamily:SERIF, fontSize:typography.body, color:colors.text, marginBottom:2 },
  linkUrl:           { fontSize:typography.tiny, color:colors.primary },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function BoardScreen({ navigation }) {
  const [cards,     setCards]     = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editCard,  setEditCard]  = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(BOARD_KEY).then(v => { if (v) setCards(JSON.parse(v)); }).catch(() => {});
  }, []);

  const save = useCallback((next) => {
    setCards(next);
    AsyncStorage.setItem(BOARD_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const handleSave = (card) => {
    const exists = cards.find(c => c.id === card.id);
    save(exists ? cards.map(c => c.id===card.id ? card : c) : [card, ...cards]);
    setShowModal(false); setEditCard(null);
  };

  const handleDelete = (id) => {
    Alert.alert("Delete card", "Remove this from your board?", [
      { text:"Cancel", style:"cancel" },
      { text:"Delete", style:"destructive", onPress:() => save(cards.filter(c => c.id!==id)) },
    ]);
  };

  const handleEdit  = (card) => { setEditCard(card); setShowModal(true); };
  const handleToggle = (id)  => save(cards.map(c => c.id===id ? {...c, done:!c.done} : c));

  const doneCount  = cards.filter(c => c.type==="checklist" && c.done).length;
  const totalCheck = cards.filter(c => c.type==="checklist").length;
  const pct        = totalCheck > 0 ? Math.round(doneCount / totalCheck * 100) : 0;

  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()} hitSlop={{ top:12, bottom:12, left:12, right:12 }}>
          <Text style={s.backIcon}>{"\u2039"}</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Board</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => { setEditCard(null); setShowModal(true); }} activeOpacity={0.85}>
          <Text style={s.addBtnText}>{"+"}</Text>
        </TouchableOpacity>
      </View>

      {/* Progress bar (checklist items only) */}
      {totalCheck > 0 && (
        <View style={s.progressWrap}>
          <View style={s.progTrack}>
            <View style={[s.progFill, { width:pct+"%" }]} />
          </View>
          <Text style={s.progLabel}>{doneCount} of {totalCheck} tasks done{pct===100?" \uD83C\uDF3F":""}</Text>
        </View>
      )}

      {cards.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>{"\uD83D\uDCCB"}</Text>
          <Text style={s.emptyTitle}>Your board is empty</Text>
          <Text style={s.emptyBody}>Add notes, checklist items, pinned du\u02bf\u0101\u02beS and useful links to personalise your journey.</Text>
          <TouchableOpacity style={s.emptyBtn} onPress={() => setShowModal(true)} activeOpacity={0.85}>
            <Text style={s.emptyBtnText}>{"+ Add your first card"}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <Text style={s.hint}>{"\u2190"} Swipe left to delete  \u00b7  Swipe right to edit  \u00b7  Long press to reorder</Text>
          <DraggableList
            cards={cards}
            onReorder={save}
            renderCard={(card) => (
              <SwipeableCard
                key={card.id}
                card={card}
                onDelete={() => handleDelete(card.id)}
                onEdit={() => handleEdit(card)}
                onToggle={() => handleToggle(card.id)}
              >
                <CardContent card={card} />
              </SwipeableCard>
            )}
          />
          <View style={{ height:spacing(5) }} />
        </ScrollView>
      )}

      <CardModal
        visible={showModal}
        editCard={editCard}
        onSave={handleSave}
        onClose={() => { setShowModal(false); setEditCard(null); }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex:1, backgroundColor:colors.background },
  header:      { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:spacing(2.5), paddingTop:spacing(2), paddingBottom:spacing(1.5), borderBottomWidth:1, borderBottomColor:colors.border, backgroundColor:colors.background },
  backBtn:     { width:36, height:36, alignItems:"center", justifyContent:"center" },
  backIcon:    { fontSize:28, color:colors.text, lineHeight:34 },
  headerTitle: { fontFamily:SERIF, fontSize:22, color:colors.text },
  addBtn:      { width:36, height:36, borderRadius:18, backgroundColor:colors.primary, alignItems:"center", justifyContent:"center", ...shadows.button },
  addBtnText:  { fontSize:22, color:"#fff", lineHeight:26 },
  progressWrap:{ paddingHorizontal:spacing(2.5), paddingTop:spacing(1.5), gap:spacing(0.75) },
  progTrack:   { height:4, backgroundColor:colors.border, borderRadius:2, overflow:"hidden" },
  progFill:    { height:"100%", backgroundColor:colors.primary, borderRadius:2 },
  progLabel:   { fontSize:typography.tiny, color:colors.subtext, fontWeight:"400" },
  empty:       { flex:1, alignItems:"center", justifyContent:"center", padding:spacing(3) },
  emptyEmoji:  { fontSize:44, marginBottom:spacing(1.5) },
  emptyTitle:  { fontFamily:SERIF, fontSize:20, color:colors.text, marginBottom:spacing(1) },
  emptyBody:   { fontSize:typography.body, color:colors.subtext, textAlign:"center", lineHeight:22, marginBottom:spacing(2.5) },
  emptyBtn:    { backgroundColor:colors.primary, borderRadius:radius.md, paddingVertical:spacing(1.5), paddingHorizontal:spacing(3), ...shadows.button },
  emptyBtnText:{ color:"#fff", fontWeight:"500" },
  scroll:      { paddingHorizontal:spacing(2.5), paddingTop:spacing(1.5) },
  hint:        { fontSize:typography.tiny, color:colors.subtext, textAlign:"center", marginBottom:spacing(1.5), fontWeight:"400" },
});
