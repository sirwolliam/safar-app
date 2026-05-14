/**
 * MyBoardScreen.jsx — Safar
 * Redesigned to match reference: hero banner, top pins strip,
 * two-column grid, type-differentiated cards with icons.
 * All logic preserved — full reusable component architecture.
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, TextInput, KeyboardAvoidingView,
  Platform, Animated, PanResponder, Linking, Alert,
  Dimensions, ImageBackground,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DUAS } from "../dua-content";

const SERIF     = "SourceSerif4-Regular";
const BOARD_KEY = "safar_journey_board_v1";
const { width: SW } = Dimensions.get("window");
const COL_W     = (SW - 40 - 10) / 2;

// ── Card type config ──────────────────────────────────────────────────────────
const CARD_TYPES = [
  { key:"note",      label:"Note",      emoji:"📝", icon:"✏️",
    tint:"#FFFDF0", pillBg:"#F5E6A0", pillTxt:"#6A4E10", border:"#EDD870",
    iconBg:"#FDF6D0" },
  { key:"checklist", label:"Checklist", emoji:"✅", icon:"☑️",
    tint:"#F6FAF7", pillBg:"#C8E6D0", pillTxt:"#1A4A28", border:"#B8D8C0",
    iconBg:"#DCF0E4" },
  { key:"dua",       label:"Du\u02bf\u0101\u02be", emoji:"🤲", icon:"🤲",
    tint:"#F0F6F3", pillBg:"#B8D8CC", pillTxt:"#1A3A30", border:"#A8C8BC",
    iconBg:"#D4ECE4" },
  { key:"link",      label:"Link",      emoji:"🔗", icon:"🔗",
    tint:"#F2F4FA", pillBg:"#C0CEE8", pillTxt:"#1A2850", border:"#B0BED8",
    iconBg:"#D8DEF4" },
];
const TYPE_MAP = Object.fromEntries(CARD_TYPES.map(t => [t.key, t]));

// ── TypePill — reusable label chip ───────────────────────────────────────────
function TypePill({ cardType, size = "sm" }) {
  const cfg = TYPE_MAP[cardType] ?? TYPE_MAP.note;
  return (
    <View style={[tp.pill, { backgroundColor: cfg.pillBg }, size === "xs" && tp.pillXs]}>
      <Text style={[tp.txt, { color: cfg.pillTxt }, size === "xs" && tp.txtXs]}>
        {cfg.label.toUpperCase()}
      </Text>
    </View>
  );
}
const tp = StyleSheet.create({
  pill:  { borderRadius:6, paddingHorizontal:8, paddingVertical:3, alignSelf:"flex-start" },
  pillXs:{ paddingHorizontal:6, paddingVertical:2, borderRadius:4 },
  txt:   { fontSize:9, fontWeight:"700", letterSpacing:1.2 },
  txtXs: { fontSize:8, letterSpacing:1 },
});

// ── CardIcon — type-tinted icon circle ────────────────────────────────────────
function CardIcon({ cardType, size = 40 }) {
  const cfg = TYPE_MAP[cardType] ?? TYPE_MAP.note;
  return (
    <View style={[ci.wrap, { width:size, height:size, borderRadius:size/2, backgroundColor:cfg.iconBg }]}>
      <Text style={{ fontSize: size * 0.45 }}>{cfg.icon}</Text>
    </View>
  );
}
const ci = StyleSheet.create({
  wrap: { alignItems:"center", justifyContent:"center", flexShrink:0 },
});

// ── PinButton — reusable pin toggle ──────────────────────────────────────────
function PinButton({ pinned, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} hitSlop={{top:8,bottom:8,left:8,right:8}} style={pb.btn}>
      <Text style={[pb.icon, pinned && pb.iconOn]}>{"📌"}</Text>
    </TouchableOpacity>
  );
}
const pb = StyleSheet.create({
  btn:    {},
  icon:   { fontSize:14, opacity:0.3 },
  iconOn: { opacity:1 },
});

// ── CardFace — renders the right card type ────────────────────────────────────
function CardFace({ card, onToggle, onPin }) {
  const cfg = TYPE_MAP[card.type] ?? TYPE_MAP.note;

  const headerRow = (
    <View style={cf.headerRow}>
      <TypePill cardType={card.type} />
      <PinButton pinned={card.pinned} onPress={() => onPin(card.id)} />
    </View>
  );

  const iconAndTitle = (
    <View style={cf.iconTitleRow}>
      <CardIcon cardType={card.type} size={36} />
      <Text style={cf.cardTitle} numberOfLines={2}>
        {card.title || (card.type === "dua" ? "Du\u02bf\u0101\u02be" : card.type === "link" ? "Link" : "Note")}
      </Text>
    </View>
  );

  if (card.type === "note") return (
    <View style={[cf.card, { backgroundColor:cfg.tint, borderColor:cfg.border }]}>
      {headerRow}
      {iconAndTitle}
      {card.text ? <Text style={cf.cardBody} numberOfLines={4}>{card.text}</Text> : null}
    </View>
  );

  if (card.type === "checklist") {
    const done  = (card.items ?? []).filter(i => i.done).length;
    const total = (card.items ?? []).length;
    return (
      <View style={[cf.card, { backgroundColor:cfg.tint, borderColor:cfg.border }]}>
        {headerRow}
        {iconAndTitle}
        {(card.items ?? []).slice(0, 3).map((item, i) => (
          <TouchableOpacity key={i} style={cf.checkRow}
            onPress={() => onToggle(card.id, i)} activeOpacity={0.8}>
            <View style={item.done ? cf.checkOn : cf.checkOff}>
              {item.done ? <Text style={cf.checkMark}>{"✓"}</Text> : null}
            </View>
            <Text style={[cf.checkTxt, item.done && cf.checkDone]} numberOfLines={1}>
              {item.text}
            </Text>
          </TouchableOpacity>
        ))}
        {total > 3 ? <Text style={cf.moreItems}>+{total - 3} more</Text> : null}
        {total > 0 ? (
          <View style={cf.progRow}>
            <View style={cf.progTrack}>
              <View style={[cf.progFill, { width:((done/total)*100)+"%" }]} />
            </View>
            <Text style={cf.progTxt}>{done}/{total}</Text>
          </View>
        ) : null}
        <Text style={cf.cardSub}>{total} items</Text>
      </View>
    );
  }

  if (card.type === "dua") return (
    <View style={[cf.card, { backgroundColor:cfg.tint, borderColor:cfg.border }]}>
      {headerRow}
      {iconAndTitle}
      {card.arabic ? <Text style={cf.arabic} numberOfLines={2}>{card.arabic}</Text> : null}
      {card.translation ? <Text style={cf.cardBody} numberOfLines={2}>{card.translation}</Text> : null}
      {card.arabic ? <Text style={cf.cardSub}>{(card.arabic.split(" ").length)} words</Text> : null}
    </View>
  );

  if (card.type === "link") return (
    <TouchableOpacity style={[cf.card, { backgroundColor:cfg.tint, borderColor:cfg.border }]}
      onPress={() => card.url && Linking.openURL(card.url)} activeOpacity={0.88}>
      {headerRow}
      {iconAndTitle}
      {card.url ? <Text style={cf.linkUrl} numberOfLines={1}>{card.url.replace(/^https?:\/\//,"")}</Text> : null}
      {card.text ? <Text style={cf.cardBody} numberOfLines={2}>{card.text}</Text> : null}
    </TouchableOpacity>
  );

  return null;
}

const cf = StyleSheet.create({
  card:        { borderRadius:16, borderWidth:1, padding:14, shadowColor:"#100E0A", shadowOffset:{width:0,height:2}, shadowOpacity:0.06, shadowRadius:8, elevation:3, marginBottom:10 },
  headerRow:   { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:10 },
  iconTitleRow:{ flexDirection:"row", alignItems:"flex-start", gap:10, marginBottom:8 },
  cardTitle:   { fontFamily:SERIF, fontSize:15, color:"#100E0A", flex:1, lineHeight:20 },
  cardBody:    { fontSize:12, color:"#3A3530", lineHeight:18, marginBottom:4 },
  cardSub:     { fontSize:11, color:"#5C534A", marginTop:4 },
  checkRow:    { flexDirection:"row", alignItems:"center", gap:7, marginBottom:5 },
  checkOff:    { width:16, height:16, borderRadius:8, borderWidth:1.5, borderColor:"#C8C0B0", flexShrink:0 },
  checkOn:     { width:16, height:16, borderRadius:8, backgroundColor:"#1E3D30", alignItems:"center", justifyContent:"center", flexShrink:0 },
  checkMark:   { fontSize:9, color:"#fff", fontWeight:"700" },
  checkTxt:    { flex:1, fontSize:12, color:"#100E0A", lineHeight:17 },
  checkDone:   { color:"#5C534A", textDecorationLine:"line-through" },
  moreItems:   { fontSize:10, color:"#5C534A", marginTop:2 },
  progRow:     { flexDirection:"row", alignItems:"center", gap:6, marginTop:6 },
  progTrack:   { flex:1, height:2.5, backgroundColor:"#C8BFB2", borderRadius:2, overflow:"hidden" },
  progFill:    { height:"100%", backgroundColor:"#1E3D30", borderRadius:2 },
  progTxt:     { fontSize:10, color:"#5C534A" },
  arabic:      { fontSize:15, color:"#100E0A", textAlign:"right", lineHeight:26, marginBottom:4 },
  linkUrl:     { fontSize:11, color:"#1E3D30", marginTop:2, marginBottom:4 },
});

// ── HeroBanner — inspirational image card ────────────────────────────────────
function HeroBanner() {
  return (
    <View style={hb.wrap}>
      <ImageBackground
        source={require("../assets/homescreen_hero1.jpg")}
        style={hb.bg}
        imageStyle={hb.bgImg}
      >
        <View style={hb.scrim} />
        <View style={hb.content}>
          <Text style={hb.quote}>{"Every step\nbegins here."}</Text>
        </View>
      </ImageBackground>
    </View>
  );
}
const hb = StyleSheet.create({
  wrap:    { marginHorizontal:20, borderRadius:20, overflow:"hidden", height:148, marginBottom:14, shadowColor:"#100E0A", shadowOffset:{width:0,height:4}, shadowOpacity:0.12, shadowRadius:12, elevation:5 },
  bg:      { flex:1 },
  bgImg:   { resizeMode:"cover", top:-40 },
  scrim:   { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(240,230,210,0.45)" },
  content: { flex:1, justifyContent:"center", paddingHorizontal:22, paddingVertical:20 },
  quote:   { fontFamily:SERIF, fontSize:28, color:"#100E0A", lineHeight:35, maxWidth:"62%" },
  sub:     { height:0 },
});

// ── AddBar — "What do you want to pin?" ──────────────────────────────────────
function AddBar({ onAdd }) {
  return (
    <View style={ab.wrap}>
      <View style={ab.topRow}>
        <TouchableOpacity style={ab.circleBtn} onPress={() => onAdd(null)} activeOpacity={0.85}>
          <Text style={ab.circlePlus}>{"+"}</Text>
        </TouchableOpacity>
        <Text style={ab.prompt}>What do you want to pin?</Text>
      </View>
      <View style={ab.typeRow}>
        {CARD_TYPES.map(t => (
          <TouchableOpacity key={t.key} style={ab.typeBtn}
            onPress={() => onAdd(t.key)} activeOpacity={0.8}>
            <Text style={ab.typeEmoji}>{t.emoji}</Text>
            <Text style={ab.typeLabel}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
const ab = StyleSheet.create({
  wrap:      { backgroundColor:"#1E3D30", marginHorizontal:20, borderRadius:18, padding:16, marginBottom:14, shadowColor:"#1A3A2A", shadowOffset:{width:0,height:4}, shadowOpacity:0.2, shadowRadius:12, elevation:6 },
  topRow:    { flexDirection:"row", alignItems:"center", gap:12, marginBottom:14 },
  circleBtn: { width:44, height:44, borderRadius:22, borderWidth:1.5, borderColor:"rgba(255,255,255,0.4)", borderStyle:"dashed", alignItems:"center", justifyContent:"center", flexShrink:0 },
  circlePlus:{ fontSize:22, color:"#fff", lineHeight:26 },
  prompt:    { fontFamily:SERIF, fontSize:16, color:"#fff", flex:1 },
  typeRow:   { flexDirection:"row", gap:8 },
  typeBtn:   { flex:1, backgroundColor:"rgba(255,255,255,0.12)", borderRadius:12, borderWidth:1, borderColor:"rgba(255,255,255,0.2)", paddingVertical:10, alignItems:"center", gap:5 },
  typeEmoji: { fontSize:22 },
  typeLabel: { fontSize:11, color:"rgba(255,255,255,0.88)", fontWeight:"500" },
});

// ── TopPinsStrip — pinned items horizontal scroll ─────────────────────────────
function TopPinsStrip({ cards, onUnpin, onEdit }) {
  const pinned = useMemo(() => cards.filter(c => c.pinned), [cards]);

  return (
    <View style={tp2.wrap}>
      <View style={tp2.header}>
        <View style={tp2.headerLeft}>
          <Text style={tp2.headerIcon}>{"📌"}</Text>
          <View>
            <Text style={tp2.title}>Your Top Pins</Text>
            <Text style={tp2.sub}>Quick access to your most important items.</Text>
          </View>
        </View>
        {pinned.length > 0 && (
          <TouchableOpacity><Text style={tp2.manage}>Manage</Text></TouchableOpacity>
        )}
      </View>

      {pinned.length === 0 ? (
        <Text style={tp2.empty}>{"Tap 📌 on any card to pin it here"}</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={tp2.scroll}>
          {pinned.map(card => {
            const cfg = TYPE_MAP[card.type] ?? TYPE_MAP.note;
            return (
              <TouchableOpacity key={card.id}
                style={[tp2.pinCard, { backgroundColor: cfg.tint, borderColor: cfg.border }]}
                onPress={() => onEdit(card)} activeOpacity={0.85}>
                {/* Dismiss X */}
                <TouchableOpacity style={tp2.x}
                  onPress={() => onUnpin(card.id)}
                  hitSlop={{top:8,bottom:8,left:8,right:8}}>
                  <Text style={tp2.xTxt}>{"×"}</Text>
                </TouchableOpacity>
                <TypePill cardType={card.type} size="xs" />
                <View style={tp2.pinIconRow}>
                  <CardIcon cardType={card.type} size={28} />
                  <Text style={tp2.pinTitle} numberOfLines={2}>
                    {card.title || card.text?.slice(0, 30) || "Item"}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const tp2 = StyleSheet.create({
  wrap:      { backgroundColor:"#F5EDE0", borderRadius:18, borderWidth:1, borderColor:"#DDD5C8", marginHorizontal:20, marginBottom:14, paddingTop:16, shadowColor:"#100E0A", shadowOffset:{width:0,height:2}, shadowOpacity:0.06, shadowRadius:8, elevation:2 },
  header:    { flexDirection:"row", justifyContent:"space-between", alignItems:"flex-start", paddingHorizontal:16, marginBottom:4 },
  headerLeft:{ flexDirection:"row", gap:10, alignItems:"flex-start", flex:1 },
  headerIcon:{ fontSize:18, marginTop:1 },
  title:     { fontFamily:SERIF, fontSize:16, color:"#100E0A", marginBottom:1 },
  sub:       { fontSize:12, color:"#3A3530" },
  manage:    { fontSize:13, color:"#1E3D30", fontWeight:"500" },
  empty:     { fontSize:13, color:"#5C534A", textAlign:"center", paddingHorizontal:16, paddingBottom:16, paddingTop:8, fontStyle:"italic" },
  scroll:    { paddingHorizontal:16, paddingBottom:16, paddingTop:10, gap:10 },
  pinCard:   { width:150, borderRadius:12, borderWidth:1, padding:12, position:"relative" },
  x:         { position:"absolute", top:6, right:8, zIndex:1 },
  xTxt:      { fontSize:16, color:"#5C534A" },
  pinIconRow:{ flexDirection:"row", alignItems:"center", gap:8, marginTop:8 },
  pinTitle:  { fontFamily:SERIF, fontSize:13, color:"#100E0A", flex:1, lineHeight:18 },
});

// ── CardGrid — two-column masonry ─────────────────────────────────────────────
function CardGrid({ cards, onDelete, onEdit, onToggle, onPin }) {
  const left  = cards.filter((_, i) => i % 2 === 0);
  const right = cards.filter((_, i) => i % 2 !== 0);

  const renderCard = (card) => (
    <TouchableOpacity key={card.id} onPress={() => onEdit(card)} activeOpacity={0.9}
      onLongPress={() => Alert.alert("Remove card", "Remove this card?", [
        { text:"Cancel", style:"cancel" },
        { text:"Remove", style:"destructive", onPress:() => onDelete(card.id) },
      ])}>
      <CardFace card={card} onToggle={onToggle} onPin={onPin} />
    </TouchableOpacity>
  );

  return (
    <View style={cg.row}>
      <View style={cg.col}>{left.map(renderCard)}</View>
      <View style={cg.col}>{right.map(renderCard)}</View>
    </View>
  );
}

const cg = StyleSheet.create({
  row: { flexDirection:"row", gap:10, paddingHorizontal:20 },
  col: { flex:1 },
});

// ── QuickAddModal ─────────────────────────────────────────────────────────────
function QuickAddModal({ visible, editCard, initialType, onSave, onClose }) {
  const [cardType, setCardType] = useState(initialType ?? "note");
  const [title,    setTitle]    = useState("");
  const [text,     setText]     = useState("");
  const [url,      setUrl]      = useState("");
  const [arabic,   setArabic]   = useState("");
  const [transl,   setTransl]   = useState("");
  const [items,    setItems]    = useState([{ text:"", done:false }]);
  const [pinned,   setPinned]   = useState(false);

  useEffect(() => {
    if (editCard) {
      setCardType(editCard.type ?? "note");
      setTitle(editCard.title ?? "");
      setText(editCard.text ?? "");
      setUrl(editCard.url ?? "");
      setArabic(editCard.arabic ?? "");
      setTransl(editCard.translation ?? "");
      setItems(editCard.items?.length ? editCard.items : [{ text:"", done:false }]);
      setPinned(editCard.pinned ?? false);
    } else {
      setCardType(initialType ?? "note");
      setTitle(""); setText(""); setUrl(""); setArabic(""); setTransl("");
      setItems([{ text:"", done:false }]); setPinned(false);
    }
  }, [editCard, visible, initialType]);

  const handleSave = () => {
    const id = editCard?.id ?? Date.now().toString();
    const base = { id, type:cardType, title:title.trim(), pinned,
                   createdAt: editCard?.createdAt ?? new Date().toISOString() };
    if (cardType === "note")      onSave({ ...base, text:text.trim() });
    if (cardType === "checklist") onSave({ ...base, items: items.filter(i => i.text.trim()) });
    if (cardType === "dua")       onSave({ ...base, arabic:arabic.trim(), translation:transl.trim() });
    if (cardType === "link")      onSave({ ...base, url:url.trim(), text:text.trim() });
  };

  const cfg = TYPE_MAP[cardType];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==="ios" ? "padding" : "height"}>
        <View style={qa.overlay}>
          <View style={qa.sheet}>
            <View style={qa.handle} />

            {/* Sheet header */}
            <View style={qa.sheetHeader}>
              <TouchableOpacity onPress={onClose}><Text style={qa.cancel}>Cancel</Text></TouchableOpacity>
              <Text style={qa.sheetTitle}>{editCard ? "Edit card" : "New card"}</Text>
              <TouchableOpacity onPress={handleSave}><Text style={qa.save}>Save</Text></TouchableOpacity>
            </View>

            {/* Type selector */}
            <View style={qa.typeRow}>
              {CARD_TYPES.map(t => (
                <TouchableOpacity key={t.key}
                  style={[qa.typeBtn, cardType===t.key && { backgroundColor:t.pillBg, borderColor:t.border }]}
                  onPress={() => setCardType(t.key)} activeOpacity={0.8}>
                  <Text style={qa.typeEmoji}>{t.emoji}</Text>
                  <Text style={[qa.typeLabel, cardType===t.key && { color:t.pillTxt, fontWeight:"600" }]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

              {/* Title field — all types */}
              <TextInput style={qa.input}
                placeholder="Title (optional)"
                placeholderTextColor="#5C534A"
                value={title} onChangeText={setTitle} />

              {/* Type-specific fields */}
              {cardType === "note" && (
                <TextInput style={[qa.input, qa.inputTall]}
                  placeholder="Write your note…"
                  placeholderTextColor="#5C534A"
                  value={text} onChangeText={setText}
                  multiline />
              )}

              {cardType === "checklist" && (
                <View style={qa.checklistWrap}>
                  {items.map((item, i) => (
                    <View key={i} style={qa.itemRow}>
                      <View style={qa.itemDot} />
                      <TextInput style={qa.itemInput}
                        placeholder={`Item ${i+1}`}
                        placeholderTextColor="#5C534A"
                        value={item.text}
                        onChangeText={t => {
                          const next = [...items];
                          next[i] = { ...next[i], text:t };
                          setItems(next);
                        }} />
                      <TouchableOpacity onPress={() => setItems(items.filter((_,j) => j!==i))}
                        hitSlop={{top:8,bottom:8,left:8,right:8}}>
                        <Text style={qa.removeItem}>{"×"}</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity style={qa.addItemBtn}
                    onPress={() => setItems([...items, { text:"", done:false }])}>
                    <Text style={qa.addItemTxt}>{"+ Add item"}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {cardType === "dua" && (
                <>
                  <TextInput style={[qa.input, qa.inputArabic]}
                    placeholder="Arabic text"
                    placeholderTextColor="#5C534A"
                    value={arabic} onChangeText={setArabic}
                    multiline textAlign="right" />
                  <TextInput style={[qa.input, qa.inputTall]}
                    placeholder="Translation"
                    placeholderTextColor="#5C534A"
                    value={transl} onChangeText={setTransl}
                    multiline />
                </>
              )}

              {cardType === "link" && (
                <>
                  <TextInput style={qa.input}
                    placeholder="URL"
                    placeholderTextColor="#5C534A"
                    value={url} onChangeText={setUrl}
                    keyboardType="url" autoCapitalize="none" />
                  <TextInput style={[qa.input, qa.inputTall]}
                    placeholder="Notes (optional)"
                    placeholderTextColor="#5C534A"
                    value={text} onChangeText={setText}
                    multiline />
                </>
              )}

              {/* Pin toggle */}
              <View style={qa.pinRow}>
                <Text style={qa.pinTxt}>{"📌  Pin to top"}</Text>
                <TouchableOpacity
                  style={pinned ? [qa.toggle, qa.toggleOn] : qa.toggle}
                  onPress={() => setPinned(v => !v)}>
                  <View style={pinned ? [qa.knob, qa.knobOn] : qa.knob} />
                </TouchableOpacity>
              </View>

              <View style={{ height:32 }} />
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const qa = StyleSheet.create({
  overlay:      { flex:1, backgroundColor:"rgba(0,0,0,0.45)", justifyContent:"flex-end" },
  sheet:        { backgroundColor:"#C8DDD4", borderTopLeftRadius:24, borderTopRightRadius:24, paddingHorizontal:20, paddingBottom:16, maxHeight:"92%" },
  handle:       { width:36, height:4, borderRadius:2, backgroundColor:"rgba(47,93,80,0.3)", alignSelf:"center", marginTop:12, marginBottom:8 },
  sheetHeader:  { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:14 },
  sheetTitle:   { fontFamily:SERIF, fontSize:17, color:"#100E0A" },
  cancel:       { fontSize:15, color:"#3A3530", width:60 },
  save:         { fontSize:15, color:"#1E3D30", fontWeight:"600", width:60, textAlign:"right" },
  typeRow:      { flexDirection:"row", gap:8, marginBottom:14 },
  typeBtn:      { flex:1, alignItems:"center", paddingVertical:10, borderRadius:12, borderWidth:1.5, borderColor:"#C8BFB2", backgroundColor:"#F5EDE0", gap:4 },
  typeEmoji:    { fontSize:20 },
  typeLabel:    { fontSize:11, color:"#3A3530" },
  input:        { backgroundColor:"#F5EDE0", borderRadius:12, borderWidth:1, borderColor:"#C8BFB2", paddingHorizontal:14, paddingVertical:12, fontSize:16, color:"#100E0A", marginBottom:10, shadowColor:"#100E0A", shadowOffset:{width:0,height:1}, shadowOpacity:0.06, shadowRadius:4, elevation:1 },
  inputTall:    { minHeight:96, textAlignVertical:"top" },
  inputArabic:  { minHeight:80, textAlignVertical:"top", fontSize:18, lineHeight:30 },
  checklistWrap:{ backgroundColor:"#F5EDE0", borderRadius:12, borderWidth:1, borderColor:"#C8BFB2", padding:12, marginBottom:10 },
  itemRow:      { flexDirection:"row", alignItems:"center", gap:8, marginBottom:8 },
  itemDot:      { width:6, height:6, borderRadius:3, backgroundColor:"#1E3D30", flexShrink:0 },
  itemInput:    { flex:1, fontSize:16, color:"#100E0A", paddingVertical:4, borderBottomWidth:1, borderBottomColor:"#C8BFB2" },
  removeItem:   { fontSize:18, color:"#5C534A", lineHeight:22 },
  addItemBtn:   { paddingVertical:6 },
  addItemTxt:   { fontSize:14, color:"#1E3D30", fontWeight:"500" },
  pinRow:       { flexDirection:"row", alignItems:"center", justifyContent:"space-between", backgroundColor:"#F5EDE0", borderRadius:12, borderWidth:1, borderColor:"#C8BFB2", padding:14, marginBottom:8 },
  pinTxt:       { fontFamily:SERIF, fontSize:15, color:"#100E0A" },
  toggle:       { width:44, height:26, borderRadius:13, backgroundColor:"#C8BFB2", justifyContent:"center", paddingHorizontal:3 },
  toggleOn:     { backgroundColor:"#1E3D30" },
  knob:         { width:20, height:20, borderRadius:10, backgroundColor:"#fff", shadowColor:"#100E0A", shadowOffset:{width:0,height:1}, shadowOpacity:0.15, shadowRadius:2, elevation:1 },
  knobOn:       { alignSelf:"flex-end" },
});

// ── EmptyState ────────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <View style={es.wrap}>
      <View style={es.quoteCard}>
        <Text style={es.arabic}>{"\u0648\u064E\u0642\u064F\u0644\u0652 \u0631\u064E\u0651\u0628\u0650\u064A \u0632\u0650\u062F\u0652\u0646\u0650\u064A \u0639\u0650\u0644\u0652\u0645\u064B\u0627"}</Text>
        <Text style={es.quote}>{"\u201cMy Lord, increase me in knowledge.\u201d"}</Text>
        <Text style={es.ref}>{"Surah Ta-Ha · 20:114"}</Text>
      </View>
      <Text style={es.title}>Your board is waiting</Text>
      <Text style={es.body}>{"Pin a note, checklist, du\u02bf\u0101\u02be or link to keep it close during your journey."}</Text>
    </View>
  );
}
const es = StyleSheet.create({
  wrap:      { alignItems:"center", padding:20, paddingTop:8 },
  quoteCard: { backgroundColor:"#F5EDE0", borderRadius:20, borderWidth:1, borderColor:"#DDD5C8", padding:22, marginBottom:20, width:"100%", alignItems:"center", shadowColor:"#100E0A", shadowOffset:{width:0,height:2}, shadowOpacity:0.06, shadowRadius:8, elevation:2 },
  arabic:    { fontSize:22, color:"#100E0A", textAlign:"center", lineHeight:38, marginBottom:12 },
  quote:     { fontFamily:SERIF, fontSize:15, color:"#100E0A", textAlign:"center", fontStyle:"italic", lineHeight:22, marginBottom:6 },
  ref:       { fontSize:11, color:"#5C534A" },
  title:     { fontFamily:SERIF, fontSize:20, color:"#100E0A", marginBottom:8, textAlign:"center" },
  body:      { fontSize:15, color:"#3A3530", textAlign:"center", lineHeight:22 },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function MyBoardScreen({ navigation }) {
  const [cards,       setCards]       = useState([]);
  const [showModal,   setShowModal]   = useState(false);
  const [editCard,    setEditCard]    = useState(null);
  const [initialType, setInitialType] = useState(null);
  const [sortOrder,   setSortOrder]   = useState("newest");

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
    const items = (c.items ?? []).map((it, i) => i===itemIdx ? { ...it, done:!it.done } : it);
    return { ...c, items };
  }));
  const togglePin  = id => save(cards.map(c => c.id===id ? { ...c, pinned:!c.pinned } : c));

  const openAdd  = (type) => { setEditCard(null); setInitialType(type); setShowModal(true); };
  const openEdit = (card) => { setEditCard(card); setInitialType(null); setShowModal(true); };

  const sorted   = useMemo(() => [...cards].sort((a,b) =>
    sortOrder==="newest" ? new Date(b.createdAt) - new Date(a.createdAt)
                         : new Date(a.createdAt) - new Date(b.createdAt)
  ), [cards, sortOrder]);

  const unpinned = useMemo(() => sorted.filter(c => !c.pinned), [sorted]);

  return (
    <SafeAreaView style={s.safe}>

      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.8}>
            <Text style={s.backArrow}>{"‹"}</Text>
          </TouchableOpacity>
          <View>
            <Text style={s.headerTitle}>My Board</Text>
            <Text style={s.headerSub}>Pin what you need. Find it instantly.</Text>
          </View>
        </View>
        <View style={s.headerActions}>
          <TouchableOpacity style={s.headerBtn}>
            <Text style={s.headerBtnTxt}>{"🔍"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Hero banner ── */}
        <HeroBanner />

        {/* ── Add bar ── */}
        <AddBar onAdd={openAdd} />

        {/* ── Top Pins strip ── */}
        <TopPinsStrip cards={cards} onUnpin={togglePin} onEdit={openEdit} />

        {/* ── All items ── */}
        {unpinned.length > 0 ? (
          <>
            <View style={s.allHeader}>
              <Text style={s.allTitle}>All Items</Text>
              <TouchableOpacity style={s.sortBtn}
                onPress={() => setSortOrder(v => v==="newest" ? "oldest" : "newest")}>
                <Text style={s.sortTxt}>{sortOrder==="newest" ? "Newest" : "Oldest"} {"↓"}</Text>
              </TouchableOpacity>
            </View>
            <CardGrid
              cards={unpinned}
              onDelete={deleteCard}
              onEdit={openEdit}
              onToggle={toggleItem}
              onPin={togglePin}
            />
          </>
        ) : cards.length === 0 ? (
          <EmptyState />
        ) : null}

        <View style={{ height:100 }} />
      </ScrollView>

      {/* ── FAB ── */}
      <TouchableOpacity style={s.fab} onPress={() => openAdd(null)} activeOpacity={0.88}>
        <Text style={s.fabPlus}>{"+"}</Text>
        <Text style={s.fabLabel}>Add New Pin</Text>
      </TouchableOpacity>

      <QuickAddModal
        visible={showModal}
        editCard={editCard}
        initialType={initialType}
        onSave={editCard ? updateCard : addCard}
        onClose={() => { setShowModal(false); setEditCard(null); setInitialType(null); }}
      />

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex:1, backgroundColor:"#F5F5F5" },
  scroll:  { paddingTop:8 },

  // Header
  header:       { flexDirection:"row", alignItems:"flex-start", justifyContent:"space-between", paddingHorizontal:20, paddingTop:8, paddingBottom:14 },
  headerLeft:   { flexDirection:"row", alignItems:"flex-start", gap:12, flex:1 },
  backBtn:      { width:36, height:36, borderRadius:18, backgroundColor:"#fff", borderWidth:1, borderColor:"#DDD5C8", alignItems:"center", justifyContent:"center", shadowColor:"#100E0A", shadowOffset:{width:0,height:1}, shadowOpacity:0.08, shadowRadius:3, elevation:2, marginTop:2 },
  backArrow:    { fontSize:22, color:"#100E0A", lineHeight:26 },
  headerTitle:  { fontFamily:SERIF, fontSize:26, color:"#100E0A", fontWeight:"400", lineHeight:30 },
  headerSub:    { fontSize:13, color:"#5C534A", marginTop:2 },
  headerActions:{ flexDirection:"row", gap:8, marginTop:2 },
  headerBtn:    { width:40, height:40, borderRadius:20, backgroundColor:"#fff", borderWidth:1, borderColor:"#DDD5C8", alignItems:"center", justifyContent:"center", shadowColor:"#100E0A", shadowOffset:{width:0,height:1}, shadowOpacity:0.08, shadowRadius:3, elevation:2 },
  headerBtnTxt: { fontSize:16, color:"#100E0A" },

  // All items section
  allHeader: { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:20, marginBottom:12, marginTop:4 },
  allTitle:  { fontFamily:SERIF, fontSize:22, color:"#100E0A", fontWeight:"400" },
  sortBtn:   { backgroundColor:"#fff", borderRadius:20, borderWidth:1, borderColor:"#DDD5C8", paddingHorizontal:12, paddingVertical:6, shadowColor:"#100E0A", shadowOffset:{width:0,height:1}, shadowOpacity:0.06, shadowRadius:3, elevation:1 },
  sortTxt:   { fontSize:13, color:"#3A3530" },

  // FAB
  fab:      { position:"absolute", bottom:28, right:20, backgroundColor:"#1A3A2A", borderRadius:28, paddingHorizontal:20, paddingVertical:14, flexDirection:"row", alignItems:"center", gap:8, shadowColor:"#100E0A", shadowOffset:{width:0,height:4}, shadowOpacity:0.25, shadowRadius:12, elevation:8 },
  fabPlus:  { fontSize:20, color:"#fff", lineHeight:24 },
  fabLabel: { fontFamily:SERIF, fontSize:15, color:"#fff" },
});
