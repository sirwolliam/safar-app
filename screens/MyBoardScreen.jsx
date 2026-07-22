/**
 * MyBoardScreen.jsx — Safar
 * Unified personal board: notes, checklists, duas, links, and saved content.
 * Six-category filter system, favorites strip, tap-to-open routing.
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, TextInput, KeyboardAvoidingView,
  Platform, Animated, Linking, Alert,
  Dimensions, StatusBar, Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CaretLeft, Plus, Star,
  NotePencil, ListChecks, HandsPraying, LinkSimple,
  VideoCamera, Headphones,
  Sparkle, Trash, PencilSimple, Check,
} from "phosphor-react-native";
import HeaderPatternBg from "../HeaderPatternBg";
import {
  getBoardCards, addBoardCard, updateBoardCard,
  deleteBoardCard, invalidateBoardCache,
} from "../bookmarkStore";
import { getDuaById } from "../dua-content";

const SERIF = "SourceSerif4-Regular";
const { width: SW } = Dimensions.get("window");

const CATEGORIES = [
  { key: "all",       label: "All",        color: "#8A7D6A", Icon: null },
  { key: "dua",       label: "Duas",       color: "#C8A96A", Icon: HandsPraying },
  { key: "note",      label: "Notes",      color: "#66572E", Icon: NotePencil },
  { key: "checklist", label: "Checklists", color: "#4A5C48", Icon: ListChecks },
  { key: "video",     label: "Videos",     color: "#B8524A", Icon: VideoCamera },
  { key: "podcast",   label: "Podcasts",   color: "#6B5080", Icon: Headphones },
  { key: "link",      label: "Links",      color: "#445870", Icon: LinkSimple },
];
const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.key, c]));

const ADD_TYPES = [
  { key: "note",      label: "Note",      Icon: NotePencil,   iconColor: "#66572E", hint: "Write a note or intention" },
  { key: "checklist", label: "Checklist", Icon: ListChecks,   iconColor: "#4A5C48", hint: "Add items to prepare" },
  { key: "dua",       label: "Dua",       Icon: HandsPraying, iconColor: "#C8A96A", hint: "A personal prayer or intention" },
  { key: "link",      label: "Link",      Icon: LinkSimple,   iconColor: "#445870", hint: "Paste a URL or resource" },
];

function getCardCategory(card) {
  if (card.type === "bookmark" && card.sourceType === "dua") return "dua";
  if (card.type === "bookmark" && card.sourceType === "media") {
    if (card.sourceCategory === "video") return "video";
    if (card.sourceCategory === "podcast") return "podcast";
    return "link";
  }
  if (card.type === "dua") return "dua";
  if (card.type === "note") return "note";
  if (card.type === "checklist") return "checklist";
  return "link";
}
function getCatConfig(card) { return CAT_MAP[getCardCategory(card)] || CAT_MAP.note; }

// ── Card face ────────────────────────────────────────────────────────────────
function CardFace({ card, onToggle, onStar, onTap, onDelete }) {
  const cat = getCatConfig(card);
  const starred = card.starred || card.pinned;
  const header = (
    <View style={cf.header}>
      <View style={cf.typeRow}>
        <View style={[cf.dot, { backgroundColor: cat.color }]} />
        <Text style={[cf.typeTxt, { color: cat.color }]}>{cat.label.toUpperCase()}</Text>
      </View>
      <TouchableOpacity onPress={() => onStar(card.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Star size={16} color={starred ? "#C8A96A" : "#C8BFB2"} weight={starred ? "fill" : "regular"} />
      </TouchableOpacity>
    </View>
  );
  const wrap = (children) => (
    <TouchableOpacity style={cf.card} onPress={() => onTap(card)} activeOpacity={0.85}
      onLongPress={() => { Alert.alert("Remove from board?", "This will remove the item from your board.", [{ text: "Cancel", style: "cancel" }, { text: "Remove", style: "destructive", onPress: () => onDelete(card.id) }]); }}>
      {header}{children}
    </TouchableOpacity>
  );

  if (card.type === "note") return wrap(
    <>{card.title ? <Text style={cf.cardTitle} numberOfLines={2}>{card.title}</Text> : null}
    <Text style={cf.cardBody} numberOfLines={5}>{card.text}</Text></>
  );
  if (card.type === "checklist") {
    const done = (card.items || []).filter(i => i.done).length;
    const total = (card.items || []).length;
    return wrap(
      <>{card.title ? <Text style={cf.cardTitle} numberOfLines={1}>{card.title}</Text> : null}
      {(card.items || []).slice(0, 4).map((item, i) => (
        <TouchableOpacity key={i} style={cf.checkRow} onPress={() => onToggle(card.id, i)} activeOpacity={0.8}>
          <View style={item.done ? [cf.checkBox, cf.checkBoxDone] : cf.checkBox}>
            {item.done ? <Check size={12} color="#FFFFFF" weight="bold" /> : null}
          </View>
          <Text style={[cf.checkTxt, item.done ? cf.checkTxtDone : null]} numberOfLines={1}>{item.text}</Text>
        </TouchableOpacity>
      ))}
      {total > 4 ? <Text style={cf.moreItems}>+{total - 4} more</Text> : null}
      {total > 0 ? <View style={cf.progRow}><View style={cf.progTrack}><View style={[cf.progFill, { width: ((done / total) * 100) + "%" }]} /></View><Text style={cf.progTxt}>{done}/{total}</Text></View> : null}</>
    );
  }
  if (card.type === "dua") return wrap(
    <>{card.title ? <Text style={cf.cardTitle} numberOfLines={1}>{card.title}</Text> : null}
    {card.text ? <Text style={cf.cardBody} numberOfLines={3}>{card.text}</Text> : null}</>
  );
  if (card.type === "link") return wrap(
    <>{card.title ? <Text style={cf.cardTitle} numberOfLines={2}>{card.title}</Text> : null}
    {card.url ? <Text style={cf.linkUrl} numberOfLines={1}>{card.url.replace("https://", "")}</Text> : null}</>
  );
  if (card.type === "bookmark") return wrap(
    <>{card.sourceTitle ? <Text style={cf.cardTitle} numberOfLines={2}>{card.sourceTitle}</Text> : null}
    {card.sourceArabic ? <Text style={cf.arabic} numberOfLines={3}>{card.sourceArabic}</Text> : null}
    {card.sourceTranslation ? <Text style={cf.translation} numberOfLines={3}>{card.sourceTranslation}</Text> : null}
    {card.sourceType === "media" ? <Text style={cf.linkUrl} numberOfLines={1}>{card.sourceUrl ? card.sourceUrl.replace("https://", "") : "Saved media"}</Text> : null}</>
  );
  return null;
}
const cf = StyleSheet.create({
  card:         { backgroundColor: "#FDFAF4", borderRadius: 16, borderWidth: 1, borderColor: "#EDE4D4", padding: 14, minHeight: 90, shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  header:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  typeRow:      { flexDirection: "row", alignItems: "center", gap: 6 },
  dot:          { width: 8, height: 8, borderRadius: 4 },
  typeTxt:      { fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  cardTitle:    { fontFamily: SERIF, fontSize: 15, color: "#1A1410", marginBottom: 4, lineHeight: 20 },
  cardBody:     { fontSize: 13, color: "#5C534A", lineHeight: 19 },
  checkRow:     { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  checkBox:     { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: "#C8BFB2", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  checkBoxDone: { backgroundColor: "#4A5C48", borderColor: "#4A5C48" },
  checkTxt:     { flex: 1, fontSize: 13, color: "#1A1410", lineHeight: 18 },
  checkTxtDone: { color: "#8A7D6A", textDecorationLine: "line-through" },
  moreItems:    { fontSize: 13, color: "#8A7D6A", marginTop: 2 },
  progRow:      { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  progTrack:    { flex: 1, height: 3, backgroundColor: "#EDE4D4", borderRadius: 2, overflow: "hidden" },
  progFill:     { height: "100%", backgroundColor: "#4A5C48", borderRadius: 2 },
  progTxt:      { fontSize: 13, color: "#8A7D6A" },
  arabic:       { fontSize: 18, color: "#1A1410", textAlign: "right", lineHeight: 30, marginBottom: 4 },
  translation:  { fontSize: 13, color: "#5C534A", lineHeight: 18, fontStyle: "italic" },
  linkUrl:      { fontSize: 13, color: "#445870", marginTop: 3 },
});

// ── Favorites horizontal strip ───────────────────────────────────────────────
function FavoritesStrip({ cards, onStar, onTap, onClearFavorites }) {
  const starred = cards.filter(c => c.starred || c.pinned);
  if (starred.length === 0) return null;
  return (
    <View style={fa.wrap}>
      <View style={fa.header}><Star size={16} color="#C8A96A" weight="fill" /><Text style={fa.title}>Favorites</Text><View style={{ flex: 1 }} /><TouchableOpacity onPress={onClearFavorites} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}><Text style={fa.clearTxt}>Clear</Text></TouchableOpacity></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={fa.scroll}>
        {starred.map(card => {
          const cat = getCatConfig(card);
          return (
            <TouchableOpacity key={card.id} style={fa.card} onPress={() => onTap(card)} activeOpacity={0.85}>
              <View style={fa.cardTop}><View style={[fa.dot, { backgroundColor: cat.color }]} /><Text style={[fa.cardType, { color: cat.color }]}>{cat.label}</Text></View>
              <Text style={fa.cardTitle} numberOfLines={2}>{card.title || card.sourceTitle || card.text || card.url || "Dua"}</Text>
              <TouchableOpacity style={fa.unstar} onPress={() => onStar(card.id)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                <Star size={12} color="#C8A96A" weight="fill" />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
const fa = StyleSheet.create({
  wrap:     { marginBottom: 16 },
  header:   { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 20, marginBottom: 10 },
  title:    { fontFamily: SERIF, fontSize: 16, color: "#1A1410", fontWeight: "600" },
  scroll:   { paddingHorizontal: 20, gap: 10 },
  card:     { width: 150, backgroundColor: "#FDFAF4", borderRadius: 14, borderWidth: 1, borderColor: "#EDE4D4", padding: 12, position: "relative", shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardTop:  { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 6 },
  dot:      { width: 6, height: 6, borderRadius: 3 },
  cardType: { fontSize: 11, fontWeight: "600" },
  cardTitle:{ fontFamily: SERIF, fontSize: 14, color: "#1A1410", lineHeight: 19 },
  unstar:   { position: "absolute", top: 8, right: 8 },
  clearTxt: { fontSize: 13, color: "#8A7D6A", fontWeight: "500" },
});

// ── Category filter bar ──────────────────────────────────────────────────────
function FilterBar({ active, onSelect, counts }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={fb.row}>
      {CATEGORIES.map(cat => {
        const isActive = active === cat.key;
        const count = cat.key === "all" ? null : counts[cat.key] || 0;
        return (
          <TouchableOpacity key={cat.key}
            style={isActive ? [fb.pill, { backgroundColor: cat.color, borderColor: cat.color }] : fb.pill}
            onPress={() => onSelect(cat.key)} activeOpacity={0.8}>
            {cat.key !== "all" ? <View style={[fb.dot, { backgroundColor: isActive ? "#FFFFFF" : cat.color }]} /> : null}
            <Text style={isActive ? [fb.pillTxt, fb.pillTxtActive] : fb.pillTxt}>
              {cat.label}{count !== null && count > 0 ? " (" + count + ")" : ""}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
const fb = StyleSheet.create({
  row:           { paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  pill:          { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: "#FDFAF4", borderWidth: 1, borderColor: "#EDE4D4" },
  dot:           { width: 6, height: 6, borderRadius: 3 },
  pillTxt:       { fontSize: 13, fontWeight: "600", color: "#5C534A" },
  pillTxtActive: { color: "#FFFFFF" },
});

// ── Add/Edit modal ───────────────────────────────────────────────────────────
function AddEditModal({ visible, editCard, onSave, onClose, onDelete }) {
  const [cardType, setCardType] = useState("note");
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [items, setItems] = useState([{ text: "", done: false }]);
  const [starred, setStarred] = useState(false);
  const isEdit = !!editCard;
  useEffect(() => {
    if (editCard) {
      setCardType(editCard.type === "bookmark" ? "note" : (editCard.type || "note"));
      setText(editCard.text || "");
      setTitle(editCard.title || editCard.sourceTitle || "");
      setUrl(editCard.url || editCard.sourceUrl || "");
      setItems(editCard.items?.length ? editCard.items : [{ text: "", done: false }]);
      setStarred(editCard.starred || editCard.pinned || false);
    }
  }, [editCard]);
  const reset = () => { setCardType("note"); setText(""); setTitle(""); setUrl(""); setItems([{ text: "", done: false }]); setStarred(false); };
  const handleClose = () => { reset(); onClose(); };
  const handleSave = () => {
    const base = editCard
      ? { ...editCard, type: editCard.type === "bookmark" ? editCard.type : cardType, starred, pinned: starred }
      : { id: Date.now().toString(), type: cardType, starred, pinned: starred, createdAt: new Date().toISOString() };
    let card;
    const at = editCard?.type === "bookmark" ? "note" : cardType;
    if (at === "note") card = { ...base, text: text.trim(), title: title.trim() };
    else if (at === "checklist") card = { ...base, title: title.trim(), items: items.filter(i => i.text.trim()) };
    else if (at === "dua") card = { ...base, title: title.trim(), text: text.trim() };
    else if (at === "link") card = { ...base, title: title.trim(), url: url.trim().startsWith("http") ? url.trim() : "https://" + url.trim() };
    else card = { ...base, text: text.trim(), title: title.trim() };
    onSave(card); reset();
  };
  const addItem = () => setItems(prev => [...prev, { text: "", done: false }]);
  const updateItem = (i, txt) => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, text: txt } : it));
  const removeItem = (i) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const activeType = editCard?.type === "bookmark" ? "note" : cardType;
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={am.overlay}>
          <View style={am.sheet}>
            <View style={am.handle} />
            <View style={am.header}>
              <TouchableOpacity onPress={handleClose}><Text style={am.cancel}>Cancel</Text></TouchableOpacity>
              <Text style={am.headerTitle}>{isEdit ? "Edit item" : "Add to board"}</Text>
              <View style={{ width: 50 }} />
            </View>
            {(!isEdit || editCard?.type !== "bookmark") ? (
              <View style={am.typePills}>
                {ADD_TYPES.map(t => {
                  const active = activeType === t.key;
                  const IC = t.Icon;
                  return (
                    <TouchableOpacity key={t.key} style={active ? [am.pill, am.pillActive] : am.pill}
                      onPress={() => setCardType(t.key)} activeOpacity={0.8}>
                      <IC size={16} color={active ? "#FFFFFF" : t.iconColor} weight="regular" />
                      <Text style={active ? [am.pillTxt, am.pillTxtActive] : am.pillTxt}>{t.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <TextInput style={am.input} placeholder="Title (optional)" placeholderTextColor="#8A7D6A" value={title} onChangeText={setTitle} />
              {activeType === "note" && <TextInput style={[am.input, am.inputTall]} placeholder={"Write your note or intention\u2026"} placeholderTextColor="#8A7D6A" value={text} onChangeText={setText} multiline autoFocus={!isEdit} />}
              {activeType === "checklist" && (
                <View style={am.checkWrap}>
                  {items.map((item, i) => (
                    <View key={i} style={am.itemRow}>
                      <View style={am.itemDot} />
                      <TextInput style={am.itemInput} placeholder={"Item " + (i + 1)} placeholderTextColor="#8A7D6A" value={item.text} onChangeText={v => updateItem(i, v)} autoFocus={i === 0 && !isEdit} onSubmitEditing={addItem} returnKeyType="next" />
                      {items.length > 1 ? <TouchableOpacity onPress={() => removeItem(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}><Trash size={16} color="#C8BFB2" weight="regular" /></TouchableOpacity> : null}
                    </View>
                  ))}
                  <TouchableOpacity style={am.addItemBtn} onPress={addItem}><Plus size={14} color="#4A5C48" weight="bold" /><Text style={am.addItemTxt}>Add item</Text></TouchableOpacity>
                </View>
              )}
              {activeType === "dua" && <TextInput style={[am.input, am.inputTall]} placeholder={"Write your dua or intention\u2026"} placeholderTextColor="#8A7D6A" value={text} onChangeText={setText} multiline autoFocus={!isEdit} />}
              {activeType === "link" && <TextInput style={am.input} placeholder="https://..." placeholderTextColor="#8A7D6A" value={url} onChangeText={setUrl} keyboardType="url" autoCapitalize="none" autoCorrect={false} autoFocus={!isEdit} />}
              <View style={am.starRow}>
                <Star size={18} color="#C8A96A" weight={starred ? "fill" : "regular"} />
                <Text style={am.starTxt}>Add to favorites</Text>
                <Switch value={starred} onValueChange={setStarred} trackColor={{ false: "#DDD5C0", true: "#4A5C48" }} thumbColor="#FDFAF4" />
              </View>
              {isEdit ? <TouchableOpacity style={am.deleteRow} onPress={() => { Alert.alert("Remove from board?", "This will remove the item from your board.", [{ text: "Cancel", style: "cancel" }, { text: "Remove", style: "destructive", onPress: () => { onClose(); onDelete(editCard.id); } }]); }}><Trash size={16} color="#C0504D" weight="regular" /><Text style={am.deleteTxt}>Remove from board</Text></TouchableOpacity> : null}
              <View style={{ height: 16 }} />
            </ScrollView>
            <View style={am.stickyFooter}>
              <TouchableOpacity style={am.saveBtn} onPress={handleSave} activeOpacity={0.88}>
                <Text style={am.saveBtnTxt}>{isEdit ? "Save changes" : "Add to board"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
const am = StyleSheet.create({
  overlay:       { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet:         { backgroundColor: "#F5F0E8", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingBottom: 16, maxHeight: "92%" },
  handle:        { width: 36, height: 4, borderRadius: 2, backgroundColor: "#DDD5C0", alignSelf: "center", marginTop: 12, marginBottom: 8 },
  header:        { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  headerTitle:   { fontFamily: SERIF, fontSize: 18, color: "#1A1410" },
  cancel:        { fontSize: 15, color: "#8A7D6A" },
  typePills:     { flexDirection: "row", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  pill:          { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: "#FDFAF4", borderWidth: 1, borderColor: "#EDE4D4" },
  pillActive:    { backgroundColor: "#4A5C48", borderColor: "#4A5C48" },
  pillTxt:       { fontSize: 13, fontWeight: "600", color: "#5C534A" },
  pillTxtActive: { color: "#FFFFFF" },
  input:         { backgroundColor: "#FDFAF4", borderRadius: 14, borderWidth: 1, borderColor: "#EDE4D4", paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: "#1A1410", marginBottom: 12 },
  inputTall:     { minHeight: 100, textAlignVertical: "top" },
  checkWrap:     { backgroundColor: "#FDFAF4", borderRadius: 14, borderWidth: 1, borderColor: "#EDE4D4", padding: 14, marginBottom: 12 },
  itemRow:       { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  itemDot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: "#4A5C48", flexShrink: 0 },
  itemInput:     { flex: 1, fontSize: 15, color: "#1A1410", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: "#EDE4D4" },
  addItemBtn:    { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6 },
  addItemTxt:    { fontSize: 14, color: "#4A5C48", fontWeight: "600" },
  starRow:       { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FDFAF4", borderRadius: 14, borderWidth: 1, borderColor: "#EDE4D4", padding: 14, marginBottom: 8 },
  starTxt:       { flex: 1, fontSize: 15, color: "#1A1410", fontWeight: "500" },
  deleteRow:     { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 14, marginTop: 4 },
  deleteTxt:     { fontSize: 15, color: "#C0504D", fontWeight: "500" },
  stickyFooter:  { paddingTop: 12, borderTopWidth: 1, borderTopColor: "#EDE4D4" },
  saveBtn:       { backgroundColor: "#4A5C48", borderRadius: 14, paddingVertical: 16, alignItems: "center", justifyContent: "center" },
  saveBtnTxt:    { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
});

// ── Two-column grid ──────────────────────────────────────────────────────────
function CardGrid({ cards, onDelete, onToggle, onStar, onTap }) {
  const left = cards.filter((_, i) => i % 2 === 0);
  const right = cards.filter((_, i) => i % 2 !== 0);
  const renderCol = (col) => col.map(card => (
    <View key={card.id} style={{ marginBottom: 12 }}>
      <CardFace card={card} onToggle={(id, i) => onToggle(id, i)} onStar={onStar} onTap={onTap} onDelete={onDelete} />
    </View>
  ));
  return (
    <View style={grid.row}>
      <View style={grid.col}>{renderCol(left)}</View>
      <View style={grid.col}>{renderCol(right)}</View>
    </View>
  );
}
const grid = StyleSheet.create({
  row: { flexDirection: "row", gap: 12, paddingHorizontal: 20 },
  col: { flex: 1 },
});

// ── Main screen ──────────────────────────────────────────────────────────────
export default function MyBoardScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [cards, setCards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editCard, setEditCard] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => { getBoardCards().then(list => setCards(list)).catch(() => {}); }, []);

  const addCard = async (card) => { const u = await addBoardCard(card); setCards(u); invalidateBoardCache(); setShowModal(false); };
  const updateCard = async (card) => { const u = await updateBoardCard(card); setCards(u); invalidateBoardCache(); setEditCard(null); setShowModal(false); };
  const deleteCard = async (id) => { const u = await deleteBoardCard(id); setCards(u); invalidateBoardCache(); };
  const toggleItem = async (cardId, itemIdx) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    const updatedItems = (card.items || []).map((it, i) => i === itemIdx ? { ...it, done: !it.done } : it);
    const u = await updateBoardCard({ ...card, items: updatedItems });
    setCards(u); invalidateBoardCache();
  };
  const toggleStar = async (id) => {
    const card = cards.find(c => c.id === id);
    if (!card) return;
    const ns = !(card.starred || card.pinned);
    const u = await updateBoardCard({ ...card, starred: ns, pinned: ns });
    setCards(u); invalidateBoardCache();
  };

  const clearFavorites = () => {
    Alert.alert("Clear favorites?", "This will unstar all your favorited items. They will stay on your board.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", onPress: async () => {
        const updated = cards.map(c => (c.starred || c.pinned) ? { ...c, starred: false, pinned: false } : c);
        setCards(updated);
        for (const c of updated) { await updateBoardCard(c); }
        invalidateBoardCache();
      }},
    ]);
  };

  const clearBoard = () => {
    Alert.alert("Clear entire board?", "This will permanently remove all items from your board. This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear everything", style: "destructive", onPress: async () => {
        setCards([]);
        await AsyncStorage.setItem("safar_journey_board_v1", JSON.stringify([]));
        invalidateBoardCache();
      }},
    ]);
  };

  const openAdd = () => { setEditCard(null); setShowModal(true); };
  const openEdit = (card) => { setEditCard(card); setShowModal(true); };

  const handleTap = (card) => {
    if (card.type === "bookmark" && card.sourceType === "dua" && card.sourceId) {
      const dua = getDuaById(card.sourceId);
      if (dua) { navigation?.navigate?.("DuaDetail", { dua, allDuas: [dua], currentIndex: 0 }); return; }
    }
    if (card.type === "bookmark" && card.sourceType === "media" && card.sourceUrl) { Linking.openURL(card.sourceUrl); return; }
    if (card.type === "link" && card.url) { Linking.openURL(card.url); return; }
    openEdit(card);
  };

  const counts = {};
  cards.forEach(c => { const k = getCardCategory(c); counts[k] = (counts[k] || 0) + 1; });

  const nonStarred = cards.filter(c => !(c.starred || c.pinned));
  const filtered = activeFilter === "all" ? nonStarred : nonStarred.filter(c => getCardCategory(c) === activeFilter);
  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <View style={s.header}>
        <HeaderPatternBg width={SW} />
        <View style={[s.headerTopRow, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={s.chipBtn} onPress={() => {
            const rt = route?.params?.returnToTab;
            if (rt) { navigation?.getParent?.()?.navigate?.(rt); } else { navigation?.goBack?.(); }
          }} activeOpacity={0.8}><CaretLeft size={20} color="#1A1410" weight="bold" /></TouchableOpacity>
          <TouchableOpacity style={s.addPill} onPress={openAdd} activeOpacity={0.85}>
            <Plus size={16} color="#1A1410" weight="bold" /><Text style={s.addPillTxt}>Add</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.pageTitle}>My Board</Text>
        <Text style={s.pageSub}>Pin what matters. Find it instantly.</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <FavoritesStrip cards={cards} onStar={toggleStar} onTap={handleTap} onClearFavorites={clearFavorites} />
        {cards.length > 0 ? (
          <>
            <FilterBar active={activeFilter} onSelect={setActiveFilter} counts={counts} />
            {sorted.length > 0 ? (
              <CardGrid cards={sorted} onDelete={deleteCard} onToggle={toggleItem} onStar={toggleStar} onTap={handleTap} />
            ) : (
              <View style={s.emptyFilter}><Text style={s.emptyFilterTxt}>{"No " + (CAT_MAP[activeFilter]?.label?.toLowerCase() || "items") + " on your board yet."}</Text></View>
            )}
          </>
        ) : (
          <View style={s.empty}>
            <Sparkle size={48} color="#C8A96A" weight="regular" />
            <Text style={s.emptyTitle}>Start building your board</Text>
            <Text style={s.emptySub}>{"Pin notes, checklists, duas, and links \u2014 everything for your journey in one place."}</Text>
            <TouchableOpacity style={s.emptyCta} onPress={openAdd} activeOpacity={0.88}><Text style={s.emptyCtaTxt}>Add your first item</Text></TouchableOpacity>
          </View>
        )}
        {cards.length === 0 ? (
          <View style={s.quoteCard}>
            <Text style={s.quoteArabic}>{"\u0648\u064E\u0642\u064F\u0644\u0652 \u0631\u064E\u0651\u0628\u0650\u064A \u0632\u0650\u062F\u0652\u0646\u0650\u064A \u0639\u0650\u0644\u0652\u0645\u064B\u0627"}</Text>
            <Text style={s.quoteText}>{"\u201CMy Lord, increase me in knowledge.\u201D"}</Text>
            <Text style={s.quoteRef}>{"\u2014 Surah Ta-Ha, 20:114"}</Text>
          </View>
        ) : null}
        {cards.length > 0 ? <TouchableOpacity style={s.clearBoardBtn} onPress={clearBoard}><Trash size={14} color="#C0504D" weight="regular" /><Text style={s.clearBoardTxt}>Clear entire board</Text></TouchableOpacity> : null}
        <View style={{ height: 40 }} />
      </ScrollView>

      <AddEditModal visible={showModal} editCard={editCard}
        onSave={editCard ? updateCard : addCard}
        onClose={() => { setShowModal(false); setEditCard(null); }}
        onDelete={deleteCard} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F0E8" },
  header:       { position: "relative", overflow: "hidden", minHeight: 170, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: "#4A5C48" },
  headerTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 2 },
  chipBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: "#FDFAF4", alignItems: "center", justifyContent: "center" },
  addPill:      { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FDFAF4", borderRadius: 22, paddingHorizontal: 14, paddingVertical: 8 },
  addPillTxt:   { fontSize: 14, fontWeight: "600", color: "#1A1410" },
  pageTitle:    { fontFamily: SERIF, fontSize: 38, color: "#FDFAF4", textAlign: "center", marginTop: 8, position: "relative", zIndex: 2 },
  pageSub:      { fontSize: 15, color: "#FDFAF4", textAlign: "center", marginTop: 4, position: "relative", zIndex: 2 },
  scroll:       { paddingTop: 16 },
  emptyFilter:    { alignItems: "center", paddingVertical: 32 },
  emptyFilterTxt: { fontSize: 15, color: "#8A7D6A" },
  empty:      { alignItems: "center", paddingHorizontal: 32, paddingTop: 40, paddingBottom: 24 },
  emptyTitle: { fontFamily: SERIF, fontSize: 24, color: "#1A1410", fontWeight: "600", marginTop: 16, marginBottom: 8, textAlign: "center" },
  emptySub:   { fontSize: 15, color: "#5C534A", textAlign: "center", lineHeight: 22, marginBottom: 24 },
  emptyCta:   { backgroundColor: "#4A5C48", borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14 },
  emptyCtaTxt:{ fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
  quoteCard:   { backgroundColor: "#FDFAF4", borderRadius: 20, borderWidth: 1, borderColor: "#EDE4D4", padding: 28, marginHorizontal: 20, marginTop: 8, alignItems: "center", shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  quoteArabic: { fontSize: 22, color: "#1A1410", textAlign: "center", lineHeight: 38, marginBottom: 12 },
  quoteText:   { fontFamily: SERIF, fontSize: 16, color: "#5C534A", textAlign: "center", fontStyle: "italic", lineHeight: 24, marginBottom: 8 },
  quoteRef:    { fontSize: 13, color: "#8A7D6A", fontWeight: "500" },
  clearBoardBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 16, marginTop: 8 },
  clearBoardTxt: { fontSize: 14, color: "#C0504D", fontWeight: "500" },
});
