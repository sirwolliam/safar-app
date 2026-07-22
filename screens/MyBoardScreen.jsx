/**
 * MyBoardScreen.jsx — Safar
 * Personal pinboard: notes, checklists, duas, and links.
 * Two-column grid, pinned strip, bottom-sheet add/edit modal.
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, TextInput, KeyboardAvoidingView,
  Platform, Animated, PanResponder, Linking, Alert,
  Dimensions, StatusBar, Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CaretLeft, CaretRight, Plus, PushPin,
  NotePencil, ListChecks, HandsPraying, LinkSimple,
  Sparkle, Trash, PencilSimple, Check, SortDescending,
  BookmarkSimple,
} from "phosphor-react-native";
import HeaderPatternBg from "../HeaderPatternBg";
import { getBoardCards, addBoardCard, updateBoardCard, deleteBoardCard, toggleBoardPin, invalidateBoardCache } from "../bookmarkStore";

const SERIF = "SourceSerif4-Regular";
const { width: SW } = Dimensions.get("window");

// ── Card types with Phosphor icons and unified parchment palette ─────────────
const CARD_TYPES = [
  { key: "note",      label: "Note",      Icon: NotePencil,   iconColor: "#66572E", hint: "Write a note or intention" },
  { key: "checklist", label: "Checklist", Icon: ListChecks,   iconColor: "#4A5C48", hint: "Add items to prepare" },
  { key: "dua",       label: "Dua",       Icon: HandsPraying, iconColor: "#C8A96A", hint: "Save a dua" },
  { key: "link",      label: "Link",      Icon: LinkSimple,      iconColor: "#445870", hint: "Paste a URL or resource" },
  { key: "bookmark",  label: "Saved",     Icon: BookmarkSimple,  iconColor: "#4A5C48", hint: "Saved from the app" },
];

const TYPE_MAP = Object.fromEntries(CARD_TYPES.map(t => [t.key, t]));

// ── Swipeable card wrapper ───────────────────────────────────────────────────
function SwipeCard({ card, onDelete, onEdit, children }) {
  const tx = useRef(new Animated.Value(0)).current;
  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 8,
    onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 8 && Math.abs(gs.dx) > Math.abs(gs.dy),
    onPanResponderMove: (_, gs) => tx.setValue(Math.max(-120, Math.min(80, gs.dx))),
    onPanResponderRelease: (_, gs) => {
      if (gs.dx < -60) Animated.spring(tx, { toValue: -100, useNativeDriver: true }).start();
      else if (gs.dx > 60) Animated.spring(tx, { toValue: 70, useNativeDriver: true }).start();
      else Animated.spring(tx, { toValue: 0, useNativeDriver: true }).start();
    },
  })).current;

  const reset = () => Animated.spring(tx, { toValue: 0, useNativeDriver: true }).start();

  return (
    <View style={{ marginBottom: 12 }}>
      <View style={swipe.editBg}>
        <TouchableOpacity style={swipe.actionBtn} onPress={() => { reset(); onEdit(card); }}>
          <PencilSimple size={16} color="#FFFFFF" weight="bold" />
          <Text style={swipe.actionTxt}>Edit</Text>
        </TouchableOpacity>
      </View>
      <View style={swipe.deleteBg}>
        <TouchableOpacity style={swipe.actionBtn} onPress={() => {
          Alert.alert("Remove", "Remove this card?", [
            { text: "Cancel", style: "cancel", onPress: reset },
            { text: "Remove", style: "destructive", onPress: () => onDelete(card.id) },
          ]);
        }}>
          <Trash size={16} color="#FFFFFF" weight="bold" />
          <Text style={swipe.actionTxt}>Delete</Text>
        </TouchableOpacity>
      </View>
      <Animated.View style={{ transform: [{ translateX: tx }] }} {...pan.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
}

const swipe = StyleSheet.create({
  editBg:    { position: "absolute", left: 0, top: 0, bottom: 12, width: 70, backgroundColor: "#4A5C48", borderRadius: 16, justifyContent: "center", alignItems: "center" },
  deleteBg:  { position: "absolute", right: 0, top: 0, bottom: 12, width: 90, backgroundColor: "#C0504D", borderRadius: 16, justifyContent: "center", alignItems: "center" },
  actionBtn: { flex: 1, width: "100%", alignItems: "center", justifyContent: "center", gap: 4 },
  actionTxt: { fontSize: 11, color: "#FFFFFF", fontWeight: "600" },
});

// ── Card face ────────────────────────────────────────────────────────────────
function CardFace({ card, onToggle, onPin }) {
  const cfg = TYPE_MAP[card.type] || TYPE_MAP.note;
  const IconComp = cfg.Icon;

  const header = (
    <View style={cf.header}>
      <View style={cf.typeRow}>
        <IconComp size={14} color={cfg.iconColor} weight="regular" />
        <Text style={[cf.typeTxt, { color: cfg.iconColor }]}>{cfg.label.toUpperCase()}</Text>
      </View>
      <TouchableOpacity onPress={() => onPin(card.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <PushPin size={16} color={card.pinned ? "#C8A96A" : "#C8BFB2"} weight={card.pinned ? "fill" : "regular"} />
      </TouchableOpacity>
    </View>
  );

  if (card.type === "note") return (
    <View style={cf.card}>
      {header}
      {card.title ? <Text style={cf.cardTitle} numberOfLines={2}>{card.title}</Text> : null}
      <Text style={cf.cardBody} numberOfLines={5}>{card.text}</Text>
    </View>
  );

  if (card.type === "checklist") {
    const done = (card.items || []).filter(i => i.done).length;
    const total = (card.items || []).length;
    return (
      <View style={cf.card}>
        {header}
        {card.title ? <Text style={cf.cardTitle} numberOfLines={1}>{card.title}</Text> : null}
        {(card.items || []).slice(0, 4).map((item, i) => (
          <TouchableOpacity key={i} style={cf.checkRow}
            onPress={() => onToggle(card.id, i)} activeOpacity={0.8}>
            <View style={item.done ? [cf.checkBox, cf.checkBoxDone] : cf.checkBox}>
              {item.done ? <Check size={12} color="#FFFFFF" weight="bold" /> : null}
            </View>
            <Text style={[cf.checkTxt, item.done ? cf.checkTxtDone : null]} numberOfLines={1}>{item.text}</Text>
          </TouchableOpacity>
        ))}
        {total > 4 ? <Text style={cf.moreItems}>+{total - 4} more</Text> : null}
        {total > 0 ? (
          <View style={cf.progRow}>
            <View style={cf.progTrack}>
              <View style={[cf.progFill, { width: ((done / total) * 100) + "%" }]} />
            </View>
            <Text style={cf.progTxt}>{done}/{total}</Text>
          </View>
        ) : null}
      </View>
    );
  }

  if (card.type === "dua") return (
    <View style={cf.card}>
      {header}
      {card.title ? <Text style={cf.cardTitle} numberOfLines={1}>{card.title}</Text> : null}
      {card.arabic ? <Text style={cf.arabic} numberOfLines={3}>{card.arabic}</Text> : null}
      {card.translation ? <Text style={cf.translation} numberOfLines={3}>{card.translation}</Text> : null}
    </View>
  );

  if (card.type === "link") return (
    <TouchableOpacity style={cf.card}
      onPress={() => card.url && Linking.openURL(card.url)} activeOpacity={0.85}>
      {header}
      {card.title ? <Text style={cf.cardTitle} numberOfLines={2}>{card.title}</Text> : null}
      {card.url ? <Text style={cf.linkUrl} numberOfLines={1}>{card.url.replace("https://", "")}</Text> : null}
    </TouchableOpacity>
  );

  if (card.type === "bookmark") return (
    <View style={cf.card}>
      {header}
      {card.sourceTitle ? <Text style={cf.cardTitle} numberOfLines={2}>{card.sourceTitle}</Text> : null}
      {card.sourceArabic ? <Text style={cf.arabic} numberOfLines={3}>{card.sourceArabic}</Text> : null}
      {card.sourceTranslation ? <Text style={cf.translation} numberOfLines={3}>{card.sourceTranslation}</Text> : null}
      {card.sourceType === "media" ? <Text style={cf.linkUrl} numberOfLines={1}>Saved from Media</Text> : null}
    </View>
  );

  return null;
}

const cf = StyleSheet.create({
  card:         { backgroundColor: "#FDFAF4", borderRadius: 16, borderWidth: 1, borderColor: "#EDE4D4", padding: 14, minHeight: 90, shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  header:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  typeRow:      { flexDirection: "row", alignItems: "center", gap: 5 },
  typeTxt:      { fontSize: 10, fontWeight: "700", letterSpacing: 1 },
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

// ── Pinned horizontal strip ──────────────────────────────────────────────────
function PinnedStrip({ cards, onToggle, onEdit }) {
  const pinned = cards.filter(c => c.pinned);
  if (pinned.length === 0) return null;

  return (
    <View style={pin.wrap}>
      <View style={pin.header}>
        <PushPin size={16} color="#C8A96A" weight="fill" />
        <Text style={pin.title}>Pinned</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={pin.scroll}>
        {pinned.map(card => {
          const cfg = TYPE_MAP[card.type] || TYPE_MAP.note;
          const IconComp = cfg.Icon;
          return (
            <TouchableOpacity key={card.id} style={pin.card}
              onPress={() => onEdit(card)} activeOpacity={0.85}>
              <View style={pin.cardTop}>
                <IconComp size={14} color={cfg.iconColor} weight="regular" />
                <Text style={[pin.cardType, { color: cfg.iconColor }]}>{cfg.label}</Text>
              </View>
              <Text style={pin.cardTitle} numberOfLines={2}>
                {card.title || card.text || card.url || "Dua"}
              </Text>
              <TouchableOpacity style={pin.unpin} onPress={() => onToggle(card.id)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                <PushPin size={12} color="#C8A96A" weight="fill" />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const pin = StyleSheet.create({
  wrap:     { marginBottom: 16 },
  header:   { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 20, marginBottom: 10 },
  title:    { fontFamily: SERIF, fontSize: 16, color: "#1A1410", fontWeight: "600" },
  scroll:   { paddingHorizontal: 20, gap: 10 },
  card:     { width: 150, backgroundColor: "#FDFAF4", borderRadius: 14, borderWidth: 1, borderColor: "#EDE4D4", padding: 12, position: "relative", shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardTop:  { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 6 },
  cardType: { fontSize: 11, fontWeight: "600" },
  cardTitle:{ fontFamily: SERIF, fontSize: 14, color: "#1A1410", lineHeight: 19 },
  unpin:    { position: "absolute", top: 8, right: 8 },
});

// ── Add/Edit modal ───────────────────────────────────────────────────────────
function AddEditModal({ visible, editCard, onSave, onClose }) {
  const [cardType, setCardType] = useState("note");
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [items, setItems] = useState([{ text: "", done: false }]);
  const [arabic, setArabic] = useState("");
  const [translation, setTranslation] = useState("");
  const [pinned, setPinned] = useState(false);
  const isEdit = !!editCard;

  useEffect(() => {
    if (editCard) {
      setCardType(editCard.type || "note");
      setText(editCard.text || "");
      setTitle(editCard.title || "");
      setUrl(editCard.url || "");
      setItems(editCard.items?.length ? editCard.items : [{ text: "", done: false }]);
      setArabic(editCard.arabic || "");
      setTranslation(editCard.translation || "");
      setPinned(editCard.pinned || false);
    }
  }, [editCard]);

  const reset = () => {
    setCardType("note"); setText(""); setTitle(""); setUrl("");
    setItems([{ text: "", done: false }]); setArabic(""); setTranslation(""); setPinned(false);
  };
  const handleClose = () => { reset(); onClose(); };

  const handleSave = () => {
    const base = editCard
      ? { ...editCard, type: cardType, pinned }
      : { id: Date.now().toString(), type: cardType, pinned, createdAt: new Date().toISOString() };
    let card;
    if (cardType === "note") card = { ...base, text: text.trim(), title: title.trim() };
    if (cardType === "checklist") card = { ...base, title: title.trim(), items: items.filter(i => i.text.trim()) };
    if (cardType === "dua") card = { ...base, title: title.trim(), arabic: arabic.trim(), translation: translation.trim() };
    if (cardType === "link") card = { ...base, title: title.trim(), url: url.trim().startsWith("http") ? url.trim() : "https://" + url.trim() };
    onSave(card); reset();
  };

  const addItem = () => setItems(prev => [...prev, { text: "", done: false }]);
  const updateItem = (i, txt) => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, text: txt } : it));
  const removeItem = (i) => setItems(prev => prev.filter((_, idx) => idx !== i));

  const handleTextChange = (val) => {
    setText(val);
    if (val.startsWith("http")) setCardType("link");
    else if (/[\u0600-\u06FF]/.test(val)) setCardType("dua");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={am.overlay}>
          <View style={am.sheet}>
            <View style={am.handle} />

            {/* Header */}
            <View style={am.header}>
              <TouchableOpacity onPress={handleClose}>
                <Text style={am.cancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={am.headerTitle}>{isEdit ? "Edit item" : "Add to board"}</Text>
              <View style={{ width: 50 }} />
            </View>

            {/* Type selector — compact pills (bookmark excluded; created from other screens) */}
            <View style={am.typePills}>
              {CARD_TYPES.filter(t => t.key !== "bookmark").map(t => {
                const active = cardType === t.key;
                const IconComp = t.Icon;
                return (
                  <TouchableOpacity key={t.key}
                    style={active ? [am.pill, am.pillActive] : am.pill}
                    onPress={() => setCardType(t.key)} activeOpacity={0.8}>
                    <IconComp size={16} color={active ? "#FFFFFF" : t.iconColor} weight="regular" />
                    <Text style={active ? [am.pillTxt, am.pillTxtActive] : am.pillTxt}>{t.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Title */}
              <TextInput style={am.input} placeholder="Title (optional)"
                placeholderTextColor="#8A7D6A" value={title} onChangeText={setTitle} />

              {/* Note body */}
              {cardType === "note" && (
                <TextInput style={[am.input, am.inputTall]}
                  placeholder={"Write your note or intention\u2026"}
                  placeholderTextColor="#8A7D6A" value={text}
                  onChangeText={handleTextChange} multiline autoFocus={!isEdit} />
              )}

              {/* Checklist items */}
              {cardType === "checklist" && (
                <View style={am.checkWrap}>
                  {items.map((item, i) => (
                    <View key={i} style={am.itemRow}>
                      <View style={am.itemDot} />
                      <TextInput style={am.itemInput}
                        placeholder={`Item ${i + 1}`} placeholderTextColor="#8A7D6A"
                        value={item.text} onChangeText={v => updateItem(i, v)}
                        autoFocus={i === 0 && !isEdit}
                        onSubmitEditing={addItem} returnKeyType="next" />
                      {items.length > 1 ? (
                        <TouchableOpacity onPress={() => removeItem(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                          <Trash size={16} color="#C8BFB2" weight="regular" />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  ))}
                  <TouchableOpacity style={am.addItemBtn} onPress={addItem}>
                    <Plus size={14} color="#4A5C48" weight="bold" />
                    <Text style={am.addItemTxt}>Add item</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Dua fields */}
              {cardType === "dua" && (
                <>
                  <TextInput style={[am.input, am.inputArabic]}
                    placeholder={"Arabic text\u2026"}
                    placeholderTextColor="#8A7D6A" value={arabic}
                    onChangeText={setArabic} multiline textAlign="right" />
                  <TextInput style={[am.input, am.inputTall]}
                    placeholder={"Translation (optional)\u2026"}
                    placeholderTextColor="#8A7D6A" value={translation}
                    onChangeText={setTranslation} multiline />
                </>
              )}

              {/* Link URL */}
              {cardType === "link" && (
                <TextInput style={am.input} placeholder="https://..."
                  placeholderTextColor="#8A7D6A" value={url}
                  onChangeText={setUrl} keyboardType="url" autoCapitalize="none"
                  autoCorrect={false} autoFocus={!isEdit} />
              )}

              {/* Pin toggle */}
              <View style={am.pinRow}>
                <PushPin size={18} color="#C8A96A" weight={pinned ? "fill" : "regular"} />
                <Text style={am.pinTxt}>Pin to top of board</Text>
                <Switch
                  value={pinned}
                  onValueChange={setPinned}
                  trackColor={{ false: "#DDD5C0", true: "#4A5C48" }}
                  thumbColor="#FDFAF4"
                />
              </View>

              <View style={{ height: 16 }} />
            </ScrollView>

            {/* Sticky save */}
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

  typePills:     { flexDirection: "row", gap: 8, marginBottom: 16 },
  pill:          { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: "#FDFAF4", borderWidth: 1, borderColor: "#EDE4D4" },
  pillActive:    { backgroundColor: "#4A5C48", borderColor: "#4A5C48" },
  pillTxt:       { fontSize: 13, fontWeight: "600", color: "#5C534A" },
  pillTxtActive: { color: "#FFFFFF" },

  input:         { backgroundColor: "#FDFAF4", borderRadius: 14, borderWidth: 1, borderColor: "#EDE4D4", paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: "#1A1410", marginBottom: 12 },
  inputTall:     { minHeight: 100, textAlignVertical: "top" },
  inputArabic:   { minHeight: 80, textAlignVertical: "top", fontSize: 18, lineHeight: 30 },

  checkWrap:     { backgroundColor: "#FDFAF4", borderRadius: 14, borderWidth: 1, borderColor: "#EDE4D4", padding: 14, marginBottom: 12 },
  itemRow:       { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  itemDot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: "#4A5C48", flexShrink: 0 },
  itemInput:     { flex: 1, fontSize: 15, color: "#1A1410", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: "#EDE4D4" },
  addItemBtn:    { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6 },
  addItemTxt:    { fontSize: 14, color: "#4A5C48", fontWeight: "600" },

  pinRow:        { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FDFAF4", borderRadius: 14, borderWidth: 1, borderColor: "#EDE4D4", padding: 14, marginBottom: 8 },
  pinTxt:        { flex: 1, fontSize: 15, color: "#1A1410", fontWeight: "500" },

  stickyFooter:  { paddingTop: 12, borderTopWidth: 1, borderTopColor: "#EDE4D4" },
  saveBtn:       { backgroundColor: "#4A5C48", borderRadius: 14, paddingVertical: 16, alignItems: "center", justifyContent: "center" },
  saveBtnTxt:    { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
});

// ── Two-column grid ──────────────────────────────────────────────────────────
function CardGrid({ cards, onDelete, onEdit, onToggle, onPin }) {
  const left = cards.filter((_, i) => i % 2 === 0);
  const right = cards.filter((_, i) => i % 2 !== 0);

  const renderCol = (col) => col.map(card => (
    <SwipeCard key={card.id} card={card} onDelete={onDelete} onEdit={onEdit}>
      <CardFace card={card} onToggle={(id, i) => onToggle(id, i)} onPin={onPin} />
    </SwipeCard>
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
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    getBoardCards().then(list => setCards(list)).catch(() => {});
  }, []);

  const save = useCallback(async (list) => {
    setCards(list);
    invalidateBoardCache();
  }, []);

  const addCard = async (card) => { const updated = await addBoardCard(card); setCards(updated); invalidateBoardCache(); setShowModal(false); };
  const updateCard = async (card) => { const updated = await updateBoardCard(card); setCards(updated); invalidateBoardCache(); setEditCard(null); setShowModal(false); };
  const deleteCard = async (id) => { const updated = await deleteBoardCard(id); setCards(updated); invalidateBoardCache(); };

  const toggleItem = async (cardId, itemIdx) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    const updatedItems = (card.items || []).map((it, i) => i === itemIdx ? { ...it, done: !it.done } : it);
    const updated = await updateBoardCard({ ...card, items: updatedItems });
    setCards(updated);
    invalidateBoardCache();
  };

  const togglePin = async (id) => { const updated = await toggleBoardPin(id); setCards(updated); invalidateBoardCache(); };

  const openAdd = () => { setEditCard(null); setShowModal(true); };
  const openEdit = (card) => { setEditCard(card); setShowModal(true); };

  const sortedCards = [...cards].sort((a, b) => {
    if (sortOrder === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  const unpinnedCards = sortedCards.filter(c => !c.pinned);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />

      {/* ── Sage Ornate Header ── */}
      <View style={s.header}>
        <HeaderPatternBg width={SW} />
        <View style={[s.headerTopRow, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={s.chipBtn}
            onPress={() => {
              const returnToTab = route?.params?.returnToTab;
              if (returnToTab) { navigation?.getParent?.()?.navigate?.(returnToTab); }
              else { navigation?.goBack?.(); }
            }}
            activeOpacity={0.8}>
            <CaretLeft size={20} color="#1A1410" weight="bold" />
          </TouchableOpacity>
          <TouchableOpacity style={s.addPill} onPress={openAdd} activeOpacity={0.85}>
            <Plus size={16} color="#1A1410" weight="bold" />
            <Text style={s.addPillTxt}>Add</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.pageTitle}>My Board</Text>
        <Text style={s.pageSub}>Pin what matters. Find it instantly.</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Pinned strip */}
        <PinnedStrip cards={cards} onToggle={togglePin} onEdit={openEdit} />

        {/* All items */}
        {unpinnedCards.length > 0 ? (
          <>
            <View style={s.allHeader}>
              <Text style={s.allTitle}>All items</Text>
              <TouchableOpacity style={s.sortBtn}
                onPress={() => setSortOrder(v => v === "newest" ? "oldest" : "newest")}>
                <SortDescending size={14} color="#8A7D6A" weight="regular" />
                <Text style={s.sortTxt}>{sortOrder === "newest" ? "Newest" : "Oldest"}</Text>
              </TouchableOpacity>
            </View>
            <CardGrid cards={unpinnedCards} onDelete={deleteCard}
              onEdit={openEdit} onToggle={toggleItem} onPin={togglePin} />
          </>
        ) : cards.length === 0 ? (
          <View style={s.empty}>
            <Sparkle size={48} color="#C8A96A" weight="regular" />
            <Text style={s.emptyTitle}>Start building your board</Text>
            <Text style={s.emptySub}>Pin notes, checklists, duas, and links {"\u2014"} everything for your journey in one place.</Text>
            <TouchableOpacity style={s.emptyCta} onPress={openAdd} activeOpacity={0.88}>
              <Text style={s.emptyCtaTxt}>Add your first item</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Quranic verse — at the bottom as closing inspiration */}
        {cards.length === 0 ? (
          <View style={s.quoteCard}>
            <Text style={s.quoteArabic}>{"\u0648\u064E\u0642\u064F\u0644\u0652 \u0631\u064E\u0651\u0628\u0650\u064A \u0632\u0650\u062F\u0652\u0646\u0650\u064A \u0639\u0650\u0644\u0652\u0645\u064B\u0627"}</Text>
            <Text style={s.quoteText}>{"\u201CMy Lord, increase me in knowledge.\u201D"}</Text>
            <Text style={s.quoteRef}>{"\u2014 Surah Ta-Ha, 20:114"}</Text>
          </View>
        ) : null}

        <View style={{ height: 40 }} />
      </ScrollView>

      <AddEditModal
        visible={showModal}
        editCard={editCard}
        onSave={editCard ? updateCard : addCard}
        onClose={() => { setShowModal(false); setEditCard(null); }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F0E8" },

  // Sage Ornate Header
  header:       { position: "relative", overflow: "hidden", minHeight: 170, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: "#4A5C48" },
  headerTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 2 },
  chipBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: "#FDFAF4", alignItems: "center", justifyContent: "center" },
  addPill:      { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FDFAF4", borderRadius: 22, paddingHorizontal: 14, paddingVertical: 8 },
  addPillTxt:   { fontSize: 14, fontWeight: "600", color: "#1A1410" },
  pageTitle:    { fontFamily: SERIF, fontSize: 38, color: "#FDFAF4", textAlign: "center", marginTop: 8, position: "relative", zIndex: 2 },
  pageSub:      { fontSize: 15, color: "#FDFAF4", textAlign: "center", marginTop: 4, position: "relative", zIndex: 2 },

  // Scroll
  scroll: { paddingTop: 16 },

  // All items header
  allHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 12 },
  allTitle:  { fontFamily: SERIF, fontSize: 18, color: "#1A1410", fontWeight: "600" },
  sortBtn:   { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 20, borderWidth: 1, borderColor: "#DDD5C0", paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "#FDFAF4" },
  sortTxt:   { fontSize: 13, color: "#8A7D6A", fontWeight: "500" },

  // Empty state
  empty:      { alignItems: "center", paddingHorizontal: 32, paddingTop: 40, paddingBottom: 24 },
  emptyTitle: { fontFamily: SERIF, fontSize: 24, color: "#1A1410", fontWeight: "600", marginTop: 16, marginBottom: 8, textAlign: "center" },
  emptySub:   { fontSize: 15, color: "#5C534A", textAlign: "center", lineHeight: 22, marginBottom: 24 },
  emptyCta:   { backgroundColor: "#4A5C48", borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14 },
  emptyCtaTxt:{ fontSize: 15, fontWeight: "700", color: "#FFFFFF" },

  // Quote card
  quoteCard:   { backgroundColor: "#FDFAF4", borderRadius: 20, borderWidth: 1, borderColor: "#EDE4D4", padding: 28, marginHorizontal: 20, marginTop: 8, alignItems: "center", shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  quoteArabic: { fontSize: 22, color: "#1A1410", textAlign: "center", lineHeight: 38, marginBottom: 12 },
  quoteText:   { fontFamily: SERIF, fontSize: 16, color: "#5C534A", textAlign: "center", fontStyle: "italic", lineHeight: 24, marginBottom: 8 },
  quoteRef:    { fontSize: 13, color: "#8A7D6A", fontWeight: "500" },
});
