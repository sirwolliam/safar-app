import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { CaretLeft, Check, Plus, Trash } from "phosphor-react-native";
import {
  CHECKLIST_ITEMS, isItemChecked, toggleItemChecked,
  getChecklistById, getCustomChecklists, addCustomItem, deleteCustomItem,
} from "../checklistStore";
import HeaderPatternBg from "../HeaderPatternBg";

const SERIF = "SourceSerif4-Regular";

const CATEGORY_COLORS = {
  "documents":      "#2E4560",
  "packing":        "#3A2F1E",
  "spiritual":      "#C8A96A",
  "before-leaving": "#4A5C48",
};

// Custom (user-created) lists use gold; text on gold is dark, as for "spiritual".
const CUSTOM_COLOR = "#C8A96A";

function colorFor(id) {
  return CATEGORY_COLORS[id] || CUSTOM_COLOR;
}
function onColorFor(id) {
  return colorFor(id) === CUSTOM_COLOR ? "#4A3410" : "#FFFFFF";
}

export default function ChecklistDetailScreen({ navigation, route }) {
  const SW = Dimensions.get("window").width;
  const insets = useSafeAreaInsets();
  const [activeCategoryId, setActiveCategoryId] = useState(route?.params?.categoryId);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customLists, setCustomLists] = useState([]);

  const [checkedMap, setCheckedMap] = useState({});
  const [highlightedId, setHighlightedId] = useState(route?.params?.itemId ?? null);
  const [newItem, setNewItem] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = React.useRef(null);
  const itemPositions = React.useRef({});

  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;
      const load = async () => {
        setLoading(true);
        const cat = await getChecklistById(activeCategoryId);
        const customs = await getCustomChecklists();
        if (cancelled) return;
        setCategory(cat);
        setCustomLists(customs);
        if (cat) {
          const map = {};
          for (const item of cat.items) {
            map[item.id] = await isItemChecked(activeCategoryId, item.id);
          }
          if (!cancelled) setCheckedMap(map);
        } else if (!cancelled) {
          setCheckedMap({});
        }
        if (!cancelled) setLoading(false);
      };
      load();
      return () => { cancelled = true; };
    }, [activeCategoryId])
  );

  React.useEffect(() => {
    const targetId = route?.params?.itemId;
    if (!targetId) return;
    setHighlightedId(targetId);
    const scrollTimer = setTimeout(() => {
      const y = itemPositions.current[targetId];
      if (y != null && scrollRef.current) {
        scrollRef.current.scrollTo({ y: Math.max(0, y - 80), animated: true });
      }
    }, 400);
    const clearTimer = setTimeout(() => setHighlightedId(null), 2800);
    return () => { clearTimeout(scrollTimer); clearTimeout(clearTimer); };
  }, [route?.params?.itemId, activeCategoryId]);

  // Loading guard must come before the not-found guard, or "not found" flashes on every load.
  if (loading) {
    return <View style={s.safe} />;
  }

  if (!category) {
    return (
      <View style={s.safe}>
        <View style={s.header}>
          <HeaderPatternBg width={SW} />
          <View style={[s.headerTopRow, { paddingTop: insets.top + 12 }]}>
            <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
              <CaretLeft size={20} color="#1A1712" weight="bold" />
            </TouchableOpacity>
          </View>
          <Text style={s.headerTitle}>Checklist</Text>
        </View>
        <View style={s.notFound}>
          <Text style={s.notFoundText}>This checklist is no longer available.</Text>
        </View>
      </View>
    );
  }

  const hasSections = category.items.some((item) => item.section);

  const checkedCount = Object.values(checkedMap).filter(Boolean).length;
  const totalCount = category.items.length;

  function captureItemY(itemId, y) {
    itemPositions.current[itemId] = y;
  }

  function handleToggle(item) {
    const next = !checkedMap[item.id];
    setCheckedMap((prev) => ({ ...prev, [item.id]: next }));
    toggleItemChecked(activeCategoryId, item.id);
  }

  // `busy` keeps adds/deletes one at a time — the store's writes aren't serialised.
  async function handleAddItem() {
    const trimmed = newItem.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    const created = await addCustomItem(activeCategoryId, trimmed);
    if (created) {
      setCategory((prev) => (prev ? { ...prev, items: [...prev.items, created] } : prev));
      setNewItem("");
    }
    setBusy(false);
  }

  async function handleDeleteItem(itemId) {
    if (busy) return;
    setBusy(true);
    await deleteCustomItem(activeCategoryId, itemId);
    setCategory((prev) => (prev ? { ...prev, items: prev.items.filter((it) => it.id !== itemId) } : prev));
    setCheckedMap((prev) => {
      const { [itemId]: _removed, ...rest } = prev;
      return rest;
    });
    setBusy(false);
  }

  function renderPill(id, title) {
    return (
      <TouchableOpacity
        key={id}
        style={activeCategoryId === id ? [s.pillActive, { backgroundColor: colorFor(id) }] : s.pill}
        onPress={() => setActiveCategoryId(id)}
        activeOpacity={0.75}
      >
        <Text style={activeCategoryId === id ? [s.pillTextActive, { color: onColorFor(id) }] : s.pillText}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  }

  function renderItem(item) {
    const checked = !!checkedMap[item.id];
    return (
      <TouchableOpacity
        key={item.id}
        style={item.id === highlightedId ? [s.itemRow, s.itemRowHighlighted] : s.itemRow}
        onPress={() => handleToggle(item)}
        onLayout={(e) => captureItemY(item.id, e.nativeEvent.layout.y)}
        activeOpacity={0.7}
      >
        <View style={checked ? [s.checkbox, s.checkboxChecked, { backgroundColor: colorFor(activeCategoryId), borderColor: colorFor(activeCategoryId) }] : s.checkbox}>
          {checked ? <Check size={14} color="#FFFFFF" weight="bold" /> : null}
        </View>
        <Text style={checked ? [s.itemLabel, s.itemLabelChecked] : s.itemLabel}>
          {item.label}
        </Text>
        {category.isCustom ? (
          <TouchableOpacity
            onPress={() => handleDeleteItem(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Trash size={16} color="#B0A090" weight="regular" />
          </TouchableOpacity>
        ) : null}
      </TouchableOpacity>
    );
  }

  function renderGrouped() {
    const sections = [];
    const sectionItems = {};
    for (const item of category.items) {
      if (!sectionItems[item.section]) {
        sections.push(item.section);
        sectionItems[item.section] = [];
      }
      sectionItems[item.section].push(item);
    }
    return sections.map((section) => (
      <View key={section}>
        <Text style={s.sectionHeading}>{section.toUpperCase()}</Text>
        {sectionItems[section].map((item) => renderItem(item))}
      </View>
    ));
  }

  return (
    <View style={s.safe}>
      <View style={s.header}>
        <HeaderPatternBg width={SW} />
        <View style={[s.headerTopRow, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <CaretLeft size={20} color="#1A1712" weight="bold" />
          </TouchableOpacity>
        </View>
        <Text style={s.headerTitle}>{category.title}</Text>
      </View>

      <View style={s.pillsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillsRow}>
          {Object.keys(CHECKLIST_ITEMS).map((key) => renderPill(key, CHECKLIST_ITEMS[key].title))}
          {customLists.map((list) => renderPill(list.id, list.title))}
        </ScrollView>
      </View>

      <ScrollView
        ref={scrollRef}
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={s.summary}>{checkedCount + " of " + totalCount + " complete"}</Text>

        <View style={s.listCard}>
          {category.isCustom ? (
            category.items.length === 0 ? (
              <Text style={s.emptyText}>No items yet. Add your first one below.</Text>
            ) : category.items.map((item) => renderItem(item))
          ) : (
            hasSections ? renderGrouped() : category.items.map((item) => renderItem(item))
          )}
          {category.isCustom ? (
            <View style={s.addRow}>
              <TextInput
                style={s.addInput}
                placeholder="Add an item"
                placeholderTextColor="#B0A090"
                value={newItem}
                onChangeText={setNewItem}
                onSubmitEditing={handleAddItem}
                returnKeyType="done"
                blurOnSubmit={false}
                maxLength={120}
              />
              <TouchableOpacity
                style={newItem.trim().length > 0 ? s.addBtn : [s.addBtn, s.addBtnDisabled]}
                onPress={handleAddItem}
                disabled={newItem.trim().length === 0}
                activeOpacity={0.85}
              >
                <Plus size={18} color="#FFFFFF" weight="bold" />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        <View style={s.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: "#F5F0E8" },
  header:          { backgroundColor: "#F5F0E8", minHeight: 140, position: "relative", overflow: "hidden", paddingHorizontal: 16, paddingBottom: 16 },
  headerTopRow:    { flexDirection: "row", alignItems: "center" },
  backBtn:         { width: 36, height: 36, borderRadius: 18, backgroundColor: "#FDFAF4", borderWidth: 1, borderColor: "#D4D0CA", alignItems: "center", justifyContent: "center" },
  headerTitle:     { fontFamily: SERIF, fontSize: 38, color: "#1A1410", textAlign: "center", marginTop: 16 },
  scroll:          { flex: 1 },
  scrollContent:   { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
  summary:         { fontSize: 14, color: "#5C534A", marginBottom: 14 },
  listCard:        { backgroundColor: "#FDFAF4", borderRadius: 16, borderWidth: 1, borderColor: "#DDD5C0", overflow: "hidden" },
  sectionHeading:  { fontSize: 13, fontWeight: "700", letterSpacing: 1, color: "#8A7D6A", marginTop: 20, marginBottom: 8, marginHorizontal: 20 },
  itemRow:         { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: "#EDE4D4" },
  itemRowHighlighted: { backgroundColor: "#F3E9D2" },
  checkbox:        { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: "#C8BFB2", alignItems: "center", justifyContent: "center", marginRight: 14, flexShrink: 0 },
  checkboxChecked: { backgroundColor: "#4A5C48", borderColor: "#4A5C48" },
  itemLabel:       { flex: 1, fontSize: 15, color: "#1A1410" },
  itemLabelChecked:{ color: "#8A7D70", textDecorationLine: "line-through" },
  pillsWrap:       { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#F5F0E8" },
  pillsRow:        { flexDirection: "row" },
  pill:            { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: "#FDFAF4", borderWidth: 1, borderColor: "#DDD5C0" },
  pillActive:      { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: "#2E4560" },
  pillText:        { fontSize: 13, color: "#5C534A" },
  pillTextActive:  { fontSize: 13, fontWeight: "700", color: "#FFFFFF" },
  notFound:        { flex: 1, alignItems: "center", justifyContent: "center" },
  notFoundText:    { fontSize: 16, color: "#8A7D6A" },
  bottomSpacer:    { height: 20 },
  emptyText:     { fontSize: 15, color: "#8A7D6A", fontStyle: "italic", paddingVertical: 20, paddingHorizontal: 20, textAlign: "center" },
  addRow:        { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1, borderTopColor: "#EDE4D4" },
  addInput:      { flex: 1, backgroundColor: "#F5F0E8", borderRadius: 10, borderWidth: 1, borderColor: "#DDD5C0", paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: "#1A1410" },
  addBtn:        { width: 40, height: 40, borderRadius: 10, backgroundColor: "#4A5C48", alignItems: "center", justifyContent: "center" },
  addBtnDisabled:{ opacity: 0.35 },
});
