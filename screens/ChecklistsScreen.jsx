import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { FileText, Package, HandsPraying, House, CaretRight, CaretLeft, Plus } from "phosphor-react-native";
import { CHECKLIST_ITEMS, getAllCategoryProgress } from "../checklistStore";
import SafarAssistCard from "../SafarAssistCard";

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

export default function ChecklistsScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
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
    <View style={s.safe}>
      <View style={s.header}>
        <Image
          source={require("../assets/checklists.png")}
          style={s.headerImg}
          resizeMode="cover"
          fadeDuration={0}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.80)"]}
          locations={[0, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <TouchableOpacity
          style={[s.backBtn, { top: insets.top + 14 }]}
            onPress={() => {
              const returnToTab = route?.params?.returnToTab;
              if (returnToTab) {
                navigation?.getParent?.()?.navigate?.(returnToTab);
              } else {
                navigation?.goBack?.();
              }
            }}
          activeOpacity={0.8}
        >
          <CaretLeft size={18} color="#FFFFFF" weight="bold" />
        </TouchableOpacity>
        <View style={s.headerContent}>
          <Text style={s.headerTitle}>Checklists</Text>
        </View>
      </View>

      <View style={s.intro}>
        <Text style={s.introText}>Your checklists are organized into helpful categories, so you can plan and stay organized every step of the way.</Text>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginHorizontal: 16 }}>
          <SafarAssistCard
            title="Import with Safar Assist"
            subtitle="Bring in your checklist from Notes, Reminders, or Google Docs"
            tagline="Speak it, scan it, or upload it"
            onPress={() => navigation.navigate("SafarAssist")}
          />
        </View>
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
        <TouchableOpacity style={s.customCard} onPress={() => {}} activeOpacity={0.75}>
          <View style={[s.iconBox, { backgroundColor: "#C8A96A" }]}>
            <Plus size={24} color="#4A3410" weight="bold" />
          </View>
          <View style={s.rowInfo}>
            <Text style={s.rowLabel}>Create your own checklist</Text>
            <Text style={s.progressText}>Build a custom list for anything else</Text>
          </View>
          <CaretRight size={18} color="#C8BFB2" weight="bold" />
        </TouchableOpacity>
        <View style={s.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: "#F5F0E8" },
  header:       { height: 170, position: "relative", overflow: "hidden", backgroundColor: "#1A1410" },
  headerImg:    { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" },
  backBtn:      { position: "absolute", left: 18, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" },
  headerContent:{ position: "absolute", bottom: 18, left: 20, right: 20 },
  headerTitle:  { fontFamily: SERIF, fontSize: 30, color: "#FFFFFF", fontWeight: "600" },
  intro:        { paddingTop: 20, paddingHorizontal: 20, paddingBottom: 16 },
  introText:    { fontSize: 17, color: "#5C534A", lineHeight: 24, textAlign: "left" },
  scroll:       { flex: 1 },
  scrollContent:{ paddingTop: 12, paddingBottom: 24 },
  card:         { flexDirection: "row", alignItems: "center", backgroundColor: "#FDFAF4", borderRadius: 16, borderWidth: 1, borderColor: "#DDD5C0", padding: 16, marginHorizontal: 16, marginBottom: 12, shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  iconBox:      { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", marginRight: 14 },
  rowInfo:      { flex: 1 },
  rowLabel:     { fontSize: 17, color: "#1A1410", marginBottom: 4 },
  progressText: { fontSize: 13, color: "#5C534A" },
  progressDone: { color: "#4A5C48" },
  customCard:   { flexDirection: "row", alignItems: "center", backgroundColor: "#F3E9D2", borderRadius: 16, borderWidth: 1, borderColor: "#DDD5C0", padding: 16, marginHorizontal: 16, marginBottom: 12, shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  bottomSpacer: { height: 20 },
});
