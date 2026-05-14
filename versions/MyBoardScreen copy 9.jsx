/**
 * MyBoardScreen.jsx — Safar
 * Pinboard redesign: two-column grid, type-differentiated cards,
 * pinned strip, quick-add sheet, FAB, swipe gestures.
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, TextInput, KeyboardAvoidingView,
  Platform, Animated, PanResponder, Linking, Alert,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DUAS } from "../dua-content";
import { colors, spacing, radius, typography, shadows } from "../theme";

const SERIF     = "SourceSerif4-Regular";
const BOARD_KEY = "safar_journey_board_v1";
const { width: SW } = Dimensions.get("window");
const COL_W = (SW - spacing(2.5) * 2 - spacing(1.25)) / 2;

const CARD_TYPES = [
  { key:"note",      label:"Note",      emoji:"\uD83D\uDCDD", hint:"Write a note or intention",
    tint:"#FFFBE8", pillBg:"#F0DC88", pillTxt:"#6A5010", border:"#EDD870" },
  { key:"checklist", label:"Checklist", emoji:"\u2713",       hint:"Add items to prepare",
    tint:"#F8FAF8", pillBg:"#D4E8D8", pillTxt:"#1E4A2A", border:"#C4DCC8" },
  { key:"dua",       label:"Du\u02bf\u0101\u02be", emoji:"\uD83E\uDD32", hint:"Save a du\u02bf\u0101\u02be",
    tint:"#EBF2EE", pillBg:"#B8D8C8", pillTxt:"#1A4030", border:"#A8C8B8" },
  { key:"link",      label:"Link",      emoji:"\uD83D\uDD17", hint:"Paste a URL or resource",
    tint:"#EEF2F8", pillBg:"#C0CEE8", pillTxt:"#1A2850", border:"#B0C0DC" },
];

const TYPE_MAP = Object.fromEntries(CARD_TYPES.map(t => [t.key, t]));

// ── Swipeable card wrapper ────────────────────────────────────────────────────
function SwipeCard({ card, onDelete, onEdit, onToggle, onPin, children }) {
  const tx  = useRef(new Animated.Value(0)).current;
  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: (_,gs) => Math.abs(gs.dx) > 8,
    onMoveShouldSetPanResponder:  (_,gs) => Math.abs(gs.dx) > 8 && Math.abs(gs.dx) > Math.abs(gs.dy),
    onPanResponderMove:    (_,gs) => tx.setValue(Math.max(-130, Math.min(80, gs.dx))),
    onPanResponderRelease: (_,gs) => {
      if      (gs.dx < -60) Animated.spring(tx,{toValue:-110,useNativeDriver:true}).start();
      else if (gs.dx >  60) Animated.spring(tx,{toValue:70, useNativeDriver:true}).start();
      else                  Animated.spring(tx,{toValue:0,  useNativeDriver:true}).start();
    },
  })).current;

  const reset = () => Animated.spring(tx,{toValue:0,useNativeDriver:true}).start();

  return (
    <View style={sw.wrap}>
      <View style={sw.editBg}>
        <TouchableOpacity style={sw.actionBtn} onPress={() => { reset(); onEdit(card); }}>
          <Text style={sw.actionTxt}>Edit</Text>
        </TouchableOpacity>
      </View>
      <View style={sw.deleteBg}>
        <TouchableOpacity style={sw.actionBtn} onPress={() => {
          Alert.alert("Remove","Remove this card?",[
            {text:"Cancel",style:"cancel",onPress:reset},
            {text:"Remove",style:"destructive",onPress:() => onDelete(card.id)},
          ]);
        }}>
          <Text style={sw.actionTxt}>Delete</Text>
        </TouchableOpacity>
      </View>
      <Animated.View style={{ transform:[{translateX:tx}] }} {...pan.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
}

const sw = StyleSheet.create({
  wrap:      { marginBottom:spacing(1.25) },
  editBg:    { position:"absolute", left:0, top:0, bottom:0, width:70, backgroundColor:colors.primary, borderRadius:radius.lg, justifyContent:"center", alignItems:"center" },
  deleteBg:  { position:"absolute", right:0, top:0, bottom:0, width:90, backgroundColor:"#D94F4F", borderRadius:radius.lg, justifyContent:"center", alignItems:"center" },
  actionBtn: { flex:1, width:"100%", alignItems:"center", justifyContent:"center" },
  actionTxt: { fontSize:12, color:"#fff", fontWeight:"600" },
});

// ── Card faces ────────────────────────────────────────────────────────────────
function CardFace({ card, onToggle, onPin }) {
  const cfg = TYPE_MAP[card.type] ?? TYPE_MAP.note;

  const header = (
    <View style={cf.header}>
      <View style={[cf.pill, {backgroundColor:cfg.pillBg}]}>
        <Text style={[cf.pillTxt, {color:cfg.pillTxt}]}>{cfg.label.toUpperCase()}</Text>
      </View>
      <TouchableOpacity onPress={() => onPin(card.id)} hitSlop={{top:8,bottom:8,left:8,right:8}}>
        <Text style={[cf.pin, card.pinned ? cf.pinOn : null]}>{"\uD83D\uDCCC"}</Text>
      </TouchableOpacity>
    </View>
  );

  if (card.type === "note") return (
    <View style={[cf.card, {backgroundColor:cfg.tint, borderColor:cfg.border}]}>
      {header}
      {card.title ? <Text style={cf.cardTitle} numberOfLines={2}>{card.title}</Text> : null}
      <Text style={cf.cardBody} numberOfLines={5}>{card.text}</Text>
    </View>
  );

  if (card.type === "checklist") {
    const done  = (card.items??[]).filter(i=>i.done).length;
    const total = (card.items??[]).length;
    return (
      <View style={[cf.card, {backgroundColor:cfg.tint, borderColor:cfg.border}]}>
        {header}
        {card.title ? <Text style={cf.cardTitle} numberOfLines={1}>{card.title}</Text> : null}
        {(card.items??[]).slice(0,4).map((item,i) => (
          <TouchableOpacity key={i} style={cf.checkRow}
            onPress={() => onToggle(card.id, i)} activeOpacity={0.8}>
            <View style={item.done ? cf.checkOn : cf.checkOff}>
              {item.done ? <Text style={cf.checkMark}>{"✓"}</Text> : null}
            </View>
            <Text style={[cf.checkTxt, item.done ? cf.checkDone : null]} numberOfLines={1}>{item.text}</Text>
          </TouchableOpacity>
        ))}
        {total > 4 ? <Text style={cf.moreItems}>+{total-4} more</Text> : null}
        {total > 0 ? (
          <View style={cf.progRow}>
            <View style={cf.progTrack}>
              <View style={[cf.progFill, {width:((done/total)*100)+"%"}]} />
            </View>
            <Text style={cf.progTxt}>{done}/{total}</Text>
          </View>
        ) : null}
      </View>
    );
  }

  if (card.type === "dua") return (
    <View style={[cf.card, {backgroundColor:cfg.tint, borderColor:cfg.border}]}>
      {header}
      {card.title ? <Text style={cf.cardTitle} numberOfLines={1}>{card.title}</Text> : null}
      {card.arabic ? <Text style={cf.arabic} numberOfLines={3}>{card.arabic}</Text> : null}
      {card.translation ? <Text style={cf.translation} numberOfLines={3}>{card.translation}</Text> : null}
    </View>
  );

  if (card.type === "link") return (
    <TouchableOpacity style={[cf.card, {backgroundColor:cfg.tint, borderColor:cfg.border}]}
      onPress={() => card.url && Linking.openURL(card.url)} activeOpacity={0.85}>
      {header}
      {card.title ? <Text style={cf.cardTitle} numberOfLines={2}>{card.title}</Text> : null}
      {card.url ? <Text style={cf.linkUrl} numberOfLines={1}>{card.url.replace("https://","")}</Text> : null}
    </TouchableOpacity>
  );

  return null;
}

const cf = StyleSheet.create({
  card:        { borderRadius:radius.lg, borderWidth:1, padding:spacing(1.5), minHeight:100, ...shadows.card },
  header:      { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:spacing(0.75) },
  pill:        { borderRadius:radius.sm, paddingHorizontal:spacing(0.875), paddingVertical:3 },
  pillTxt:     { fontSize:9, fontWeight:"700", letterSpacing:1.2 },
  pin:         { fontSize:16, opacity:0.35 },
  pinOn:       { opacity:1 },
  cardTitle:   { fontFamily:SERIF, fontSize:15, color:colors.text, marginBottom:4, lineHeight:20 },
  cardBody:    { fontSize:13, color:colors.subtext, lineHeight:19 },
  checkRow:    { flexDirection:"row", alignItems:"center", gap:spacing(0.75), marginBottom:spacing(0.625) },
  checkOff:    { width:18, height:18, borderRadius:9, borderWidth:1.5, borderColor:colors.border, flexShrink:0 },
  checkOn:     { width:18, height:18, borderRadius:9, backgroundColor:colors.primary, alignItems:"center", justifyContent:"center", flexShrink:0 },
  checkMark:   { fontSize:10, color:"#fff", fontWeight:"700" },
  checkTxt:    { flex:1, fontSize:13, color:colors.text, lineHeight:18 },
  checkDone:   { color:colors.subtext, textDecorationLine:"line-through" },
  moreItems:   { fontSize:11, color:colors.subtext, marginTop:2 },
  progRow:     { flexDirection:"row", alignItems:"center", gap:spacing(1), marginTop:spacing(0.75) },
  progTrack:   { flex:1, height:3, backgroundColor:colors.border, borderRadius:2, overflow:"hidden" },
  progFill:    { height:"100%", backgroundColor:colors.primary, borderRadius:2 },
  progTxt:     { fontSize:10, color:colors.subtext },
  arabic:      { fontSize:16, color:colors.text, textAlign:"right", lineHeight:28, marginBottom:4 },
  translation: { fontSize:12, color:colors.subtext, lineHeight:18, fontStyle:"italic" },
  linkUrl:     { fontSize:11, color:colors.primary, marginTop:3 },
});

// ── Pinned horizontal strip ───────────────────────────────────────────────────
function PinnedStrip({ cards, onToggle, onEdit }) {
  const pinned = cards.filter(c => c.pinned);
  if (pinned.length === 0) return null;
  return (
    <View style={ps.wrap}>
      <View style={ps.header}>
        <View style={ps.headerLeft}>
          <Text style={ps.icon}>{"\uD83D\uDCCC"}</Text>
          <View>
            <Text style={ps.title}>Your Pins</Text>
            <Text style={ps.sub}>Your most important items, always at the top</Text>
          </View>
        </View>
        <TouchableOpacity><Text style={ps.manage}>Manage</Text></TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={ps.scroll}>
        {pinned.map(card => {
          const cfg = TYPE_MAP[card.type] ?? TYPE_MAP.note;
          return (
            <TouchableOpacity key={card.id} style={[ps.card, {backgroundColor:cfg.tint, borderColor:cfg.border}]}
              onPress={() => onEdit(card)} activeOpacity={0.85}>
              <View style={[ps.cardPill, {backgroundColor:cfg.pillBg}]}>
                <Text style={[ps.cardPillTxt, {color:cfg.pillTxt}]}>{cfg.emoji} {cfg.label}</Text>
              </View>
              <Text style={ps.cardTitle} numberOfLines={2}>
                {card.title || card.text || card.url || "Du\u02bf\u0101\u02be"}
              </Text>
              <TouchableOpacity style={ps.unpin} onPress={() => onToggle(card.id)} hitSlop={{top:6,bottom:6,left:6,right:6}}>
                <Text style={ps.unpinTxt}>{"×"}</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const ps = StyleSheet.create({
  wrap:        { backgroundColor:colors.card, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, marginHorizontal:spacing(2.5), marginBottom:spacing(1.5), paddingTop:spacing(1.5), ...shadows.card },
  header:      { flexDirection:"row", justifyContent:"space-between", alignItems:"flex-start", paddingHorizontal:spacing(1.75), marginBottom:spacing(1.25) },
  headerLeft:  { flexDirection:"row", gap:spacing(1), alignItems:"flex-start" },
  icon:        { fontSize:18, marginTop:1 },
  title:       { fontFamily:SERIF, fontSize:15, color:colors.text },
  sub:         { fontSize:11, color:colors.subtext, marginTop:1 },
  manage:      { fontSize:12, color:colors.primary, fontWeight:"500" },
  scroll:      { paddingHorizontal:spacing(1.75), paddingBottom:spacing(1.75), gap:spacing(1) },
  card:        { width:140, borderRadius:radius.md, borderWidth:1, padding:spacing(1.25), position:"relative" },
  cardPill:    { borderRadius:radius.sm, paddingHorizontal:spacing(0.875), paddingVertical:3, alignSelf:"flex-start", marginBottom:spacing(0.75) },
  cardPillTxt: { fontSize:10, fontWeight:"600" },
  cardTitle:   { fontFamily:SERIF, fontSize:13, color:colors.text, lineHeight:18 },
  unpin:       { position:"absolute", top:6, right:8 },
  unpinTxt:    { fontSize:16, color:colors.subtext },
});

// ── Quick Add modal ───────────────────────────────────────────────────────────
function QuickAddModal({ visible, editCard, onSave, onClose }) {
  const [cardType,    setCardType]    = useState("note");
  const [text,        setText]        = useState("");
  const [title,       setTitle]       = useState("");
  const [url,         setUrl]         = useState("");
  const [items,       setItems]       = useState([{text:"",done:false}]);
  const [arabic,      setArabic]      = useState("");
  const [translation, setTranslation] = useState("");
  const [pinned,      setPinned]      = useState(false);
  const isEdit = !!editCard;

  useEffect(() => {
    if (editCard) {
      setCardType(editCard.type ?? "note");
      setText(editCard.text ?? "");
      setTitle(editCard.title ?? "");
      setUrl(editCard.url ?? "");
      setItems(editCard.items?.length ? editCard.items : [{text:"",done:false}]);
      setArabic(editCard.arabic ?? "");
      setTranslation(editCard.translation ?? "");
      setPinned(editCard.pinned ?? false);
    }
  }, [editCard]);

  const reset = () => {
    setCardType("note"); setText(""); setTitle(""); setUrl("");
    setItems([{text:"",done:false}]); setArabic(""); setTranslation(""); setPinned(false);
  };
  const handleClose = () => { reset(); onClose(); };

  const handleSave = () => {
    const base = editCard
      ? {...editCard, type:cardType, pinned}
      : {id:Date.now().toString(), type:cardType, pinned, createdAt:new Date().toISOString()};
    let card;
    if (cardType==="note")      card = {...base, text:text.trim(), title:title.trim()};
    if (cardType==="checklist") card = {...base, title:title.trim(), items:items.filter(i=>i.text.trim())};
    if (cardType==="dua")       card = {...base, title:title.trim(), arabic:arabic.trim(), translation:translation.trim()};
    if (cardType==="link")      card = {...base, title:title.trim(), url:url.trim().startsWith("http")?url.trim():"https://"+url.trim()};
    onSave(card); reset();
  };

  const addItem    = () => setItems(prev => [...prev, {text:"",done:false}]);
  const updateItem = (i,txt) => setItems(prev => prev.map((it,idx) => idx===i ? {...it,text:txt} : it));
  const removeItem = (i) => setItems(prev => prev.filter((_,idx) => idx!==i));

  // Smart type detection
  const handleTextChange = (val) => {
    setText(val);
    if (val.startsWith("http")) setCardType("link");
    else if (/[\u0600-\u06FF]/.test(val)) setCardType("dua");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==="ios"?"padding":"height"}>
        <View style={qa.overlay}>
          <View style={qa.sheet}>
            <View style={qa.handle}/>
            {/* Header */}
            <View style={qa.header}>
              <TouchableOpacity onPress={handleClose}><Text style={qa.cancel}>Cancel</Text></TouchableOpacity>
              <Text style={qa.headerTitle}>{isEdit ? "Edit pin" : "What do you want to pin?"}</Text>
              <TouchableOpacity onPress={handleSave}><Text style={qa.save}>Save</Text></TouchableOpacity>
            </View>

            {/* Type selector */}
            <View style={qa.typeRow}>
              {CARD_TYPES.map(t => (
                <TouchableOpacity key={t.key}
                  style={cardType===t.key ? [qa.typeBtn, qa.typeBtnOn, {borderColor:t.border}] : [qa.typeBtn, {borderColor:colors.border}]}
                  onPress={() => setCardType(t.key)} activeOpacity={0.8}>
                  <Text style={qa.typeEmoji}>{t.emoji}</Text>
                  <Text style={[qa.typeTxt, cardType===t.key ? {color:t.pillTxt, fontWeight:"600"} : null]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Shared title field */}
              <TextInput style={qa.input} placeholder="Title (optional)"
                placeholderTextColor={colors.subtext} value={title} onChangeText={setTitle}/>

              {/* Note */}
              {cardType==="note" && (
                <TextInput style={[qa.input, qa.inputTall]} placeholder="Write your note or intention…"
                  placeholderTextColor={colors.subtext} value={text}
                  onChangeText={handleTextChange} multiline autoFocus={!isEdit}/>
              )}

              {/* Checklist */}
              {cardType==="checklist" && (
                <View style={qa.checklistWrap}>
                  {items.map((item,i) => (
                    <View key={i} style={qa.itemRow}>
                      <View style={qa.itemDot}/>
                      <TextInput style={qa.itemInput}
                        placeholder={`Item ${i+1}`} placeholderTextColor={colors.subtext}
                        value={item.text} onChangeText={v => updateItem(i,v)}
                        autoFocus={i===0 && !isEdit}
                        onSubmitEditing={addItem} returnKeyType="next"/>
                      {items.length > 1
                        ? <TouchableOpacity onPress={() => removeItem(i)}><Text style={qa.removeItem}>{"×"}</Text></TouchableOpacity>
                        : null}
                    </View>
                  ))}
                  <TouchableOpacity style={qa.addItemBtn} onPress={addItem}>
                    <Text style={qa.addItemTxt}>{"+ Add item"}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Du'a */}
              {cardType==="dua" && (
                <>
                  <TextInput style={[qa.input, qa.inputArabic]} placeholder="Arabic text…"
                    placeholderTextColor={colors.subtext} value={arabic}
                    onChangeText={setArabic} multiline textAlign="right"/>
                  <TextInput style={[qa.input, qa.inputTall]} placeholder="Translation (optional)…"
                    placeholderTextColor={colors.subtext} value={translation}
                    onChangeText={setTranslation} multiline/>
                </>
              )}

              {/* Link */}
              {cardType==="link" && (
                <TextInput style={qa.input} placeholder="https://…"
                  placeholderTextColor={colors.subtext} value={url}
                  onChangeText={setUrl} keyboardType="url" autoCapitalize="none"
                  autoCorrect={false} autoFocus={!isEdit}/>
              )}

              {/* Pin toggle */}
              <TouchableOpacity style={qa.pinRow} onPress={() => setPinned(v=>!v)} activeOpacity={0.8}>
                <Text style={qa.pinIcon}>{"\uD83D\uDCCC"}</Text>
                <Text style={qa.pinTxt}>Pin to Your Pins</Text>
                <View style={[qa.toggle, pinned ? qa.toggleOn : null]}>
                  <View style={[qa.knob, pinned ? qa.knobOn : null]}/>
                </View>
              </TouchableOpacity>

              <View style={{height:spacing(3)}}/>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const qa = StyleSheet.create({
  overlay:      { flex:1, backgroundColor:"rgba(0,0,0,0.45)", justifyContent:"flex-end" },
  sheet:        { backgroundColor:"#D4E4DC", borderTopLeftRadius:24, borderTopRightRadius:24, paddingHorizontal:spacing(2.5), paddingBottom:spacing(2), maxHeight:"92%" },
  handle:       { width:36, height:4, borderRadius:2, backgroundColor:"rgba(47,93,80,0.3)", alignSelf:"center", marginTop:spacing(1.5), marginBottom:spacing(1) },
  header:       { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:spacing(1.5) },
  headerTitle:  { fontFamily:SERIF, fontSize:16, color:colors.text },
  cancel:       { fontSize:15, color:colors.subtext },
  save:         { fontSize:15, color:colors.primary, fontWeight:"600" },
  typeRow:      { flexDirection:"row", gap:spacing(0.875), marginBottom:spacing(1.5) },
  typeBtn:      { flex:1, alignItems:"center", gap:4, paddingVertical:spacing(1.25), borderRadius:radius.md, borderWidth:1.5, backgroundColor:colors.card },
  typeBtnOn:    { backgroundColor:"#EBF2EE" },
  typeEmoji:    { fontSize:18 },
  typeTxt:      { fontSize:11, color:colors.text },
  input:        { backgroundColor:colors.card, borderRadius:radius.md, borderWidth:1, borderColor:colors.border, paddingHorizontal:spacing(1.75), paddingVertical:spacing(1.25), fontSize:16, color:colors.text, marginBottom:spacing(1.25), ...shadows.card },
  inputTall:    { minHeight:100, textAlignVertical:"top" },
  inputArabic:  { minHeight:80, textAlignVertical:"top", fontSize:18, lineHeight:30 },
  checklistWrap:{ backgroundColor:colors.card, borderRadius:radius.md, borderWidth:1, borderColor:colors.border, padding:spacing(1.5), marginBottom:spacing(1.25), ...shadows.card },
  itemRow:      { flexDirection:"row", alignItems:"center", gap:spacing(1), marginBottom:spacing(1) },
  itemDot:      { width:6, height:6, borderRadius:3, backgroundColor:colors.primary, flexShrink:0 },
  itemInput:    { flex:1, fontSize:16, color:colors.text, paddingVertical:spacing(0.5), borderBottomWidth:1, borderBottomColor:colors.border },
  removeItem:   { fontSize:18, color:colors.subtext, lineHeight:22 },
  addItemBtn:   { paddingVertical:spacing(0.75) },
  addItemTxt:   { fontSize:14, color:colors.primary, fontWeight:"500" },
  pinRow:       { flexDirection:"row", alignItems:"center", gap:spacing(1.25), backgroundColor:colors.card, borderRadius:radius.md, borderWidth:1, borderColor:colors.border, padding:spacing(1.5), marginBottom:spacing(1), ...shadows.card },
  pinIcon:      { fontSize:18 },
  pinTxt:       { flex:1, fontFamily:SERIF, fontSize:15, color:colors.text },
  toggle:       { width:44, height:26, borderRadius:13, backgroundColor:colors.border, justifyContent:"center", paddingHorizontal:3 },
  toggleOn:     { backgroundColor:colors.primary },
  knob:         { width:20, height:20, borderRadius:10, backgroundColor:"#fff", ...shadows.card },
  knobOn:       { alignSelf:"flex-end" },
});

// ── Two-column grid ───────────────────────────────────────────────────────────
function CardGrid({ cards, onDelete, onEdit, onToggle, onPin }) {
  // Split into two columns
  const left  = cards.filter((_,i) => i % 2 === 0);
  const right = cards.filter((_,i) => i % 2 !== 0);

  const renderCol = (col) => col.map(card => (
    <SwipeCard key={card.id} card={card} onDelete={onDelete}
      onEdit={onEdit} onToggle={onToggle} onPin={onPin}>
      <CardFace card={card} onToggle={(id,i) => onToggle(id,i)} onPin={onPin}/>
    </SwipeCard>
  ));

  return (
    <View style={cg.row}>
      <View style={cg.col}>{renderCol(left)}</View>
      <View style={cg.col}>{renderCol(right)}</View>
    </View>
  );
}

const cg = StyleSheet.create({
  row: { flexDirection:"row", gap:spacing(1.25), paddingHorizontal:spacing(2.5) },
  col: { flex:1 },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function MyBoardScreen({ navigation }) {
  const [cards,     setCards]     = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editCard,  setEditCard]  = useState(null);
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    AsyncStorage.getItem(BOARD_KEY)
      .then(v => { if (v) setCards(JSON.parse(v)); })
      .catch(() => {});
  }, []);

  const save       = useCallback(list => {
    setCards(list);
    AsyncStorage.setItem(BOARD_KEY, JSON.stringify(list)).catch(() => {});
  }, []);

  const addCard    = card => { save([card, ...cards]); setShowModal(false); };
  const updateCard = card => { save(cards.map(c => c.id===card.id ? card : c)); setEditCard(null); setShowModal(false); };
  const deleteCard = id   => save(cards.filter(c => c.id!==id));

  const toggleItem = (cardId, itemIdx) => save(cards.map(c => {
    if (c.id !== cardId) return c;
    const items = (c.items??[]).map((it,i) => i===itemIdx ? {...it, done:!it.done} : it);
    return {...c, items};
  }));

  const togglePin  = (id) => save(cards.map(c => c.id===id ? {...c, pinned:!c.pinned} : c));

  const openAdd    = () => { setEditCard(null); setShowModal(true); };
  const openEdit   = (card) => { setEditCard(card); setShowModal(true); };

  const sortedCards = [...cards].sort((a,b) => {
    if (sortOrder==="newest") return new Date(b.createdAt) - new Date(a.createdAt);
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  const unpinnedCards = sortedCards.filter(c => !c.pinned);

  return (
    <SafeAreaView style={s.safe}>

      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.8}>
            <Text style={s.backArrow}>{"\u2039"}</Text>
          </TouchableOpacity>
          <View>
            <Text style={s.headerTitle}>My Journey Board</Text>
            <Text style={s.headerSub}>Pin what you need. Find it instantly.</Text>
          </View>
        </View>
        <TouchableOpacity style={s.headerIcon}>
          <Text style={s.headerIconTxt}>{"\uD83D\uDD0D"}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Add bar ── */}
      <TouchableOpacity style={s.addBar} onPress={openAdd} activeOpacity={0.88}>
        <View style={s.addBarCircle}>
          <Text style={s.addBarPlus}>+</Text>
        </View>
        <Text style={s.addBarTxt}>What do you want to pin?</Text>
        <View style={s.addBarTypes}>
          {CARD_TYPES.map(t => (
            <Text key={t.key} style={s.addBarType}>{t.emoji}</Text>
          ))}
        </View>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Pinned strip ── */}
        <PinnedStrip cards={cards} onToggle={togglePin} onEdit={openEdit}/>

        {/* ── All items ── */}
        {unpinnedCards.length > 0 ? (
          <>
            <View style={s.allHeader}>
              <Text style={s.allTitle}>All items</Text>
              <TouchableOpacity style={s.sortBtn}
                onPress={() => setSortOrder(v => v==="newest" ? "oldest" : "newest")}>
                <Text style={s.sortTxt}>{sortOrder==="newest" ? "Newest" : "Oldest"} {"\u2193"}</Text>
              </TouchableOpacity>
            </View>
            <CardGrid cards={unpinnedCards} onDelete={deleteCard}
              onEdit={openEdit} onToggle={toggleItem} onPin={togglePin}/>
          </>
        ) : cards.filter(c=>!c.pinned).length === 0 && cards.length === 0 ? (
          <View style={s.empty}>
            <View style={s.emptyQuoteCard}>
              <Text style={s.emptyArabic}>{"\u0648\u064E\u0642\u064F\u0644\u0652 \u0631\u064E\u0651\u0628\u0650\u064A \u0632\u0650\u062F\u0652\u0646\u0650\u064A \u0639\u0650\u0644\u0652\u0645\u064B\u0627"}</Text>
              <Text style={s.emptyQuote}>{"\u201cMy Lord, increase me in knowledge.\u201d"}</Text>
              <Text style={s.emptyRef}>{"— Surah Ta-Ha, 20:114"}</Text>
            </View>
            <Text style={s.emptyTitle}>Your board is waiting</Text>
            <Text style={s.emptyBody}>Tap the bar above to pin a note, checklist, du\u02bf\u0101\u02be or link.</Text>
          </View>
        ) : null}

        <View style={{height:spacing(8)}}/>
      </ScrollView>

      {/* ── FAB ── */}
      <TouchableOpacity style={s.fab} onPress={openAdd} activeOpacity={0.85}>
        <Text style={s.fabTxt}>+</Text>
        <Text style={s.fabLabel}>Add</Text>
      </TouchableOpacity>

      <QuickAddModal
        visible={showModal}
        editCard={editCard}
        onSave={editCard ? updateCard : addCard}
        onClose={() => { setShowModal(false); setEditCard(null); }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex:1, backgroundColor:colors.background },

  // Header
  header:       { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:spacing(2.5), paddingTop:spacing(2), paddingBottom:spacing(1.5) },
  headerLeft:   { flexDirection:"row", alignItems:"center", gap:spacing(1.25), flex:1 },
  backBtn:      { width:34, height:34, borderRadius:17, backgroundColor:colors.card, borderWidth:1, borderColor:colors.border, alignItems:"center", justifyContent:"center", ...shadows.card },
  backArrow:    { fontSize:20, color:colors.text, lineHeight:24 },
  headerTitle:  { fontFamily:SERIF, fontSize:20, color:colors.text },
  headerSub:    { fontSize:12, color:colors.subtext, marginTop:1 },
  headerIcon:   { width:34, height:34, borderRadius:17, backgroundColor:colors.card, borderWidth:1, borderColor:colors.border, alignItems:"center", justifyContent:"center", ...shadows.card },
  headerIconTxt:{ fontSize:15 },

  // Add bar
  addBar:       { flexDirection:"row", alignItems:"center", backgroundColor:"#2F5D50", borderRadius:radius.lg, marginHorizontal:spacing(2.5), marginBottom:spacing(1.5), paddingVertical:spacing(1.5), paddingHorizontal:spacing(1.75), gap:spacing(1.25), ...shadows.button },
  addBarCircle: { width:30, height:30, borderRadius:15, borderWidth:1.5, borderColor:"rgba(255,255,255,0.7)", alignItems:"center", justifyContent:"center", flexShrink:0 },
  addBarPlus:   { fontSize:20, color:"#fff", lineHeight:24 },
  addBarTxt:    { fontFamily:SERIF, fontSize:15, color:"#fff", flex:1 },
  addBarTypes:  { flexDirection:"row", gap:spacing(0.5) },
  addBarType:   { fontSize:16 },

  // All items header
  scroll:    { paddingTop:spacing(0.5) },
  allHeader: { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:spacing(2.5), marginBottom:spacing(1.25) },
  allTitle:  { fontFamily:SERIF, fontSize:18, color:colors.text },
  sortBtn:   { borderRadius:radius.pill, borderWidth:1, borderColor:colors.border, paddingHorizontal:spacing(1.25), paddingVertical:spacing(0.5), backgroundColor:colors.card },
  sortTxt:   { fontSize:12, color:colors.subtext },

  // FAB
  fab:      { position:"absolute", bottom:spacing(3), right:spacing(2.5), backgroundColor:colors.primary, borderRadius:radius.xl, paddingHorizontal:spacing(2), paddingVertical:spacing(1.25), flexDirection:"row", alignItems:"center", gap:spacing(0.75), ...shadows.button },
  fabTxt:   { fontSize:20, color:"#fff", lineHeight:24 },
  fabLabel: { fontFamily:SERIF, fontSize:14, color:"#fff" },

  // Empty state
  empty:          { alignItems:"center", padding:spacing(3) },
  emptyQuoteCard: { backgroundColor:colors.card, borderRadius:radius.xl, borderWidth:1, borderColor:colors.border, padding:spacing(2.5), marginBottom:spacing(2.5), width:"100%", alignItems:"center", ...shadows.card },
  emptyArabic:    { fontSize:20, color:colors.text, textAlign:"center", lineHeight:36, marginBottom:spacing(1.5) },
  emptyQuote:     { fontFamily:SERIF, fontSize:15, color:colors.text, textAlign:"center", fontStyle:"italic", lineHeight:22, marginBottom:spacing(0.75) },
  emptyRef:       { fontSize:11, color:colors.subtext },
  emptyTitle:     { fontFamily:SERIF, fontSize:20, color:colors.text, marginBottom:spacing(1), textAlign:"center" },
  emptyBody:      { fontSize:typography.body, color:colors.subtext, textAlign:"center", lineHeight:22 },
});
