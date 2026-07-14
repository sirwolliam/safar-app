import React, { useState } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { FileText, Package, HandsPraying, House, CaretRight, CaretLeft } from "phosphor-react-native";
import { CHECKLIST_ITEMS, getAllCategoryProgress } from "../checklistStore";

const SERIF = "SourceSerif4-Regular";

const CATEGORY_ORDER = ["documents", "packing", "spiritual", "before-leaving"];

const CATEGORY_ICONS = {
  "documents":      FileText,
  "packing":        Package,
  "spiritual":      HandsPraying,
  "before-leaving": House,
};

const CATEGORY_COLORS = {
  "documents":      "#2E4560",
  "packing":        "#3A2F1E",
  "spiritual":      "#C8A96A",
  "before-leaving": "#4A5C48",
};

export default function ChecklistsScreen({ navigation }) {
  const [progress, setProgress] = useState({});

  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;
      const load = async () => {
        const result = await getAllCategoryProgress();
        if (!cancelled) setProgress(result);
      };
      load();
      return () => { cancelled = true; };
    }, [])
  );

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
        <Text style={s.headerTitle}>Checklists</Text>
        <View style={s.headerSpacer} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {CATEGORY_ORDER.map((categoryId) => {
          const category = CHECKLIST_ITEMS[categoryId];
          const Icon = CATEGORY_ICONS[categoryId];
          const prog = progress[categoryId] ?? { checked: 0, total: category.items.length };
          const isDone = prog.total > 0 && prog.checked === prog.total;
          return (
            <TouchableOpacity
              key={categoryId}
              style={s.card}
              onPress={() => navigation.navigate("ChecklistDetail", { categoryId })}
              activeOpacity={0.75}
            >
              <View style={[s.iconBox, { backgroundColor: CATEGORY_COLORS[categoryId] }]}>
                <Icon size={24} color={categoryId === "spiritual" ? "#4A3410" : "#C8A96A"} weight="regular" />
              </View>
              <View style={s.rowInfo}>
                <Text style={s.rowLabel}>{category.title}</Text>
                <Text style={isDone ? [s.progressText, s.progressDone] : s.progressText}>
                  {prog.checked + " of " + prog.total + " complete"}
                </Text>
              </View>
              <CaretRight size={18} color="#C8BFB2" weight="bold" />
            </TouchableOpacity>
          );
        })}
        <View style={s.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: "#F5F0E8" },
  header:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#F5F0E8" },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: "#FDFAF4", borderWidth: 1, borderColor: "#D4D0CA", alignItems: "center", justifyContent: "center" },
  headerTitle:  { fontFamily: SERIF, fontSize: 22, color: "#1A1410" },
  headerSpacer: { width: 36 },
  scroll:       { flex: 1 },
  scrollContent:{ paddingTop: 12, paddingBottom: 24 },
  card:         { flexDirection: "row", alignItems: "center", backgroundColor: "#FDFAF4", borderRadius: 16, borderWidth: 1, borderColor: "#DDD5C0", padding: 16, marginHorizontal: 16, marginBottom: 12, shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  iconBox:      { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", marginRight: 14 },
  rowInfo:      { flex: 1 },
  rowLabel:     { fontSize: 17, color: "#1A1410", marginBottom: 4 },
  progressText: { fontSize: 13, color: "#5C534A" },
  progressDone: { color: "#4A5C48" },
  bottomSpacer: { height: 20 },
});
