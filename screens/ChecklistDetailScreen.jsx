import React, { useState } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { CaretLeft, Check } from "phosphor-react-native";
import { CHECKLIST_ITEMS, isItemChecked, toggleItemChecked } from "../checklistStore";

const SERIF = "SourceSerif4-Regular";

const CATEGORY_COLORS = {
  "documents":      "#2E4560",
  "packing":        "#3A2F1E",
  "spiritual":      "#C8A96A",
  "before-leaving": "#4A5C48",
};

export default function ChecklistDetailScreen({ navigation, route }) {
  const [activeCategoryId, setActiveCategoryId] = useState(route?.params?.categoryId);
  const category = CHECKLIST_ITEMS[activeCategoryId];

  const [checkedMap, setCheckedMap] = useState({});

  useFocusEffect(
    React.useCallback(() => {
      if (!category) return;
      let cancelled = false;
      const load = async () => {
        const map = {};
        for (const item of category.items) {
          map[item.id] = await isItemChecked(activeCategoryId, item.id);
        }
        if (!cancelled) setCheckedMap(map);
      };
      load();
      return () => { cancelled = true; };
    }, [activeCategoryId])
  );

  if (!category) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.notFound}>
          <Text style={s.notFoundText}>Checklist not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const hasSections = category.items.some((item) => item.section);

  const checkedCount = Object.values(checkedMap).filter(Boolean).length;
  const totalCount = category.items.length;

  function handleToggle(item) {
    const next = !checkedMap[item.id];
    setCheckedMap((prev) => ({ ...prev, [item.id]: next }));
    toggleItemChecked(activeCategoryId, item.id);
  }

  function renderItem(item) {
    const checked = !!checkedMap[item.id];
    return (
      <TouchableOpacity
        key={item.id}
        style={s.itemRow}
        onPress={() => handleToggle(item)}
        activeOpacity={0.7}
      >
        <View style={checked ? [s.checkbox, s.checkboxChecked, { backgroundColor: CATEGORY_COLORS[activeCategoryId], borderColor: CATEGORY_COLORS[activeCategoryId] }] : s.checkbox}>
          {checked ? <Check size={14} color="#FFFFFF" weight="bold" /> : null}
        </View>
        <Text style={checked ? [s.itemLabel, s.itemLabelChecked] : s.itemLabel}>
          {item.label}
        </Text>
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
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <CaretLeft size={20} color="#1A1712" weight="bold" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{category.title}</Text>
        <View style={s.headerSpacer} />
      </View>

      <View style={s.pillsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillsRow}>
          {Object.keys(CHECKLIST_ITEMS).map((key) => (
            <TouchableOpacity
              key={key}
              style={activeCategoryId === key ? [s.pillActive, { backgroundColor: CATEGORY_COLORS[key] }] : s.pill}
              onPress={() => setActiveCategoryId(key)}
              activeOpacity={0.75}
            >
              <Text style={activeCategoryId === key ? [s.pillTextActive, { color: key === "spiritual" ? "#4A3410" : "#FFFFFF" }] : s.pillText}>
                {CHECKLIST_ITEMS[key].title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.summary}>{checkedCount + " of " + totalCount + " complete"}</Text>

        <View style={s.listCard}>
          {hasSections ? renderGrouped() : category.items.map((item) => renderItem(item))}
        </View>

        <View style={s.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: "#F5F0E8" },
  header:          { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#F5F0E8" },
  backBtn:         { width: 36, height: 36, borderRadius: 18, backgroundColor: "#FDFAF4", borderWidth: 1, borderColor: "#D4D0CA", alignItems: "center", justifyContent: "center" },
  headerTitle:     { fontFamily: SERIF, fontSize: 22, color: "#1A1410", flex: 1, textAlign: "center" },
  headerSpacer:    { width: 36 },
  scroll:          { flex: 1 },
  scrollContent:   { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
  summary:         { fontSize: 14, color: "#5C534A", marginBottom: 14 },
  listCard:        { backgroundColor: "#FDFAF4", borderRadius: 16, borderWidth: 1, borderColor: "#DDD5C0", overflow: "hidden" },
  sectionHeading:  { fontSize: 13, fontWeight: "700", letterSpacing: 1, color: "#8A7D6A", marginTop: 20, marginBottom: 8, marginHorizontal: 20 },
  itemRow:         { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: "#EDE4D4" },
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
});
