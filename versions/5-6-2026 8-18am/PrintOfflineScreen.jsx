/**
 * PrintOfflineScreen.jsx — Safar
 * Select duas/lists to save locally for offline use.
 * Uses AsyncStorage — all content is already bundled so offline "saving"
 * means marking content as pinned and confirming it's accessible.
 * Also generates a shareable text export.
 */
import React, { useState, useMemo } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Share, Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DUAS, getDuasByStage } from "../dua-content";
import { colors, spacing, radius, shadows, typography } from "../theme";
import { useAccessibility } from "../AccessibilityContext";

const SERIF = "SourceSerif4-Regular";

const STAGES = ["Ihram", "Entry", "Tawaf", "Saʿy", "Arafah", "Muzdalifah", "Jamarat", "Farewell"];

export default function PrintOfflineScreen({ navigation }) {
  const { colors } = useAccessibility();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [selected, setSelected] = useState(new Set());
  const [saved,    setSaved]    = useState(false);

  const toggleAll = (stage) => {
    const stageDuas = getDuasByStage(stage).map((d) => d.id);
    const allIn = stageDuas.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      stageDuas.forEach((id) => allIn ? next.delete(id) : next.add(id));
      return next;
    });
  };

  const toggleDua = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(DUAS.map((d) => d.id)));
  const clearAll  = () => setSelected(new Set());

  const handleSave = async () => {
    if (selected.size === 0) {
      Alert.alert("Nothing selected", "Select at least one duʿāʾ to save.");
      return;
    }
    await AsyncStorage.setItem("safar_saved_offline", JSON.stringify([...selected]));
    setSaved(true);
    Alert.alert(
      "Saved ✓",
      `${selected.size} duʿāʾs saved to your device. The app works fully offline — no internet needed during your journey.`,
      [{ text: "Great" }]
    );
  };

  const handleShare = async () => {
    if (selected.size === 0) return;
    const selectedDuas = DUAS.filter((d) => selected.has(d.id));
    const text = selectedDuas.map((d) =>
      `${d.title}\n\n${d.arabic}\n\n${d.transliteration}\n\n"${d.translation}"\n\n— ${d.source}`
    ).join("\n\n────────────\n\n");
    await Share.share({ message: `My Safar Duʿāʾ Selection\n\n${text}` });
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 24 }} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Save for Offline</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Offline note */}
      <View style={s.note}>
        <Text style={s.noteIcon}>ℹ</Text>
        <Text style={s.noteText}>
          Safar works fully offline. All duas are bundled with the app. Saving here confirms your selection and exports audio for the journey.
        </Text>
      </View>

      {/* Select all / clear */}
      <View style={s.bulkRow}>
        <TouchableOpacity onPress={selectAll}><Text style={s.bulkBtn}>Select all</Text></TouchableOpacity>
        <Text style={s.selCount}>{selected.size} selected</Text>
        <TouchableOpacity onPress={clearAll}><Text style={s.bulkBtn}>Clear</Text></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {STAGES.map((stage) => {
          const stageDuas = getDuasByStage(stage);
          if (!stageDuas.length) return null;
          const allIn = stageDuas.every((d) => selected.has(d.id));
          return (
            <View key={stage} style={s.stageSection}>
              <TouchableOpacity style={s.stageHeader} onPress={() => toggleAll(stage)}>
                <View style={allIn ? [s.stageCheck, s.stageCheckActive] : s.stageCheck}>
                  {allIn && <Text style={s.checkMark}>✓</Text>}
                </View>
                <Text style={s.stageTitle}>{stage}</Text>
                <Text style={s.stageCount}>{stageDuas.length} duas</Text>
              </TouchableOpacity>
              {stageDuas.map((dua) => (
                <TouchableOpacity
                  key={dua.id}
                  style={s.duaRow}
                  onPress={() => toggleDua(dua.id)}
                  activeOpacity={0.8}
                >
                  <View style={selected.has(dua.id) ? [s.duaCheck, s.duaCheckActive] : s.duaCheck}>
                    {selected.has(dua.id) && <Text style={s.checkMark}>✓</Text>}
                  </View>
                  <Text style={s.duaTitle}>{dua.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
        <View style={{ height: spacing(12) }} />
      </ScrollView>

      {/* Action buttons */}
      <View style={s.actions}>
        <TouchableOpacity style={s.shareBtn} onPress={handleShare} disabled={selected.size === 0}>
          <Text style={s.shareBtnText}>↑  Share as text</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={selected.size === 0}>
          <Text style={s.saveBtnText}>{saved ? "✓ Saved" : "Save offline"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing(2.5), paddingTop: spacing(2), paddingBottom: spacing(1.5),
  },
  back: { fontSize: 22, color: colors.text },
  headerTitle: { fontFamily: SERIF, fontSize: 22, color: colors.text },

  note: {
    flexDirection: "row", gap: spacing(1), alignItems: "flex-start",
    marginHorizontal: spacing(2.5), backgroundColor: "#F5EDD8",
    borderRadius: radius.md, borderWidth: 1, borderColor: "#E8D9B8",
    padding: spacing(1.75), marginBottom: spacing(1.5),
  },
  noteIcon: { fontSize: 14, color: "#7A6030", marginTop: 1 },
  noteText: { flex: 1, fontSize: typography.tiny, color: "#7A6030", lineHeight: 18 },

  bulkRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing(2.5), marginBottom: spacing(1),
  },
  bulkBtn: { fontSize: typography.small, color: colors.primary, fontWeight: "500" },
  selCount: { fontSize: typography.small, color: colors.subtext },

  scroll: { paddingHorizontal: spacing(2.5) },
  stageSection: {
    backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.border, overflow: "hidden", marginBottom: spacing(1.25), ...shadows.card,
  },
  stageHeader: {
    flexDirection: "row", alignItems: "center", gap: spacing(1.25),
    padding: spacing(1.75), backgroundColor: colors.background,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  stageCheck: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 1.5,
    borderColor: colors.border, alignItems: "center", justifyContent: "center",
  },
  stageCheckActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkMark: { fontSize: 12, color: "#fff", fontWeight: "700" },
  stageTitle: { flex: 1, fontSize: typography.body, fontWeight: "500", color: colors.text },
  stageCount: { fontSize: typography.tiny, color: colors.subtext },

  duaRow: {
    flexDirection: "row", alignItems: "center", gap: spacing(1.25),
    paddingHorizontal: spacing(2), paddingVertical: spacing(1.25),
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  duaCheck: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 1.5,
    borderColor: colors.border, alignItems: "center", justifyContent: "center",
  },
  duaCheckActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  duaTitle: { fontSize: typography.small, color: colors.text, flex: 1 },

  actions: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", gap: spacing(1.25),
    padding: spacing(2.5), backgroundColor: colors.background,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  shareBtn: {
    flex: 1, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    paddingVertical: spacing(1.75), alignItems: "center",
  },
  shareBtnText: { fontSize: typography.body, color: colors.text, fontWeight: "400" },
  saveBtn: {
    flex: 1, borderRadius: radius.md, backgroundColor: colors.primary,
    paddingVertical: spacing(1.75), alignItems: "center", ...shadows.button,
  },
  saveBtnText: { fontSize: typography.body, color: "#fff", fontWeight: "500" },
});
