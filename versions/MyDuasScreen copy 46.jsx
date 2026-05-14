import React, { useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  FlatList,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors, spacing, radius, typography, shadows } from "../theme";

// ── Data ──────────────────────────────────────────────────────────────────────

const MY_LISTS = [
  {
    id: "umrah",
    name: "My Umrah Journey",
    count: 18,
    updated: "2d ago",
    emoji: "🕋",
    gradientTop: "#4A6A50",
    gradientBot: "#2A3C30",
  },
  {
    id: "family",
    name: "Duas for Family",
    count: 24,
    updated: "1w ago",
    emoji: "🌿",
    gradientTop: "#8AA878",
    gradientBot: "#5A7848",
  },
  {
    id: "daily",
    name: "Daily Reminders",
    count: 32,
    updated: "3d ago",
    emoji: "🪴",
    gradientTop: "#C8B888",
    gradientBot: "#906830",
  },
  {
    id: "sleep",
    name: "Before Sleep",
    count: 15,
    updated: "5d ago",
    emoji: "🌙",
    gradientTop: "#283848",
    gradientBot: "#0E1828",
  },
];

const LIBRARY_CATEGORIES = [
  { id: "gratitude",  name: "Gratitude & Praise",   count: 21, emoji: "🤲", shade: "#A8C8A0" },
  { id: "forgive",   name: "Forgiveness",            count: 18, emoji: "🕊", shade: "#C8C4A0" },
  { id: "guidance",  name: "Guidance & Knowledge",   count: 23, emoji: "📖", shade: "#A8B8C8" },
  { id: "protect",   name: "Protection",             count: 20, emoji: "🛡", shade: "#A8C8B8" },
  { id: "patience",  name: "Patience & Trust",       count: 19, emoji: "🌱", shade: "#C8C090" },
  { id: "provision", name: "Provision & Rizq",       count: 17, emoji: "✨", shade: "#B8C8A8" },
];

const FILTER_CHIPS = ["All", "By Theme", "By Occasion", "By Reference"];

// ─────────────────────────────────────────────────────────────────────────────

export default function MyDuasScreen() {
  const [tab,          setTab]          = useState("myLists"); // "myLists" | "shared"
  const [view,         setView]         = useState("lists");   // "lists" | "library"
  const [activeFilter, setActiveFilter] = useState("By Theme");
  const [searchQuery,  setSearchQuery]  = useState("");

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {view === "lists" ? "My Lists" : "Duʿāʾ Library"}
          </Text>
          <View style={styles.headerRight}>
            {view === "lists" ? (
              <>
                <TouchableOpacity
                  style={styles.libraryLink}
                  onPress={() => setView("library")}
                >
                  <Text style={styles.libraryLinkText}>Library</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addBtn}>
                  <Text style={styles.addBtnText}>+</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => setView("lists")}
              >
                <Text style={styles.backBtnText}>← Lists</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ══════════════ MY LISTS VIEW ══════════════ */}
        {view === "lists" && (
          <>
            {/* Segment */}
            <View style={styles.segmentCtrl}>
              {[["myLists", "My Lists"], ["shared", "Shared with me"]].map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.segOpt, tab === key && styles.segOptActive]}
                  onPress={() => setTab(key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.segLabel, tab === key && styles.segLabelActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* List rows */}
            <View style={styles.listContainer}>
              {MY_LISTS.map((list, idx) => (
                <TouchableOpacity
                  key={list.id}
                  style={[
                    styles.listRow,
                    idx < MY_LISTS.length - 1 && styles.listRowBorder,
                  ]}
                  activeOpacity={0.8}
                >
                  {/* Thumbnail */}
                  <View
                    style={[
                      styles.listThumb,
                      { backgroundColor: list.gradientBot },
                    ]}
                  >
                    <Text style={styles.listThumbEmoji}>{list.emoji}</Text>
                  </View>

                  {/* Info */}
                  <View style={styles.listInfo}>
                    <Text style={styles.listName}>{list.name}</Text>
                    <Text style={styles.listMeta}>
                      {list.count} duas · Updated {list.updated}
                    </Text>
                  </View>

                  <Text style={styles.listArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── New list CTA ── */}
            <TouchableOpacity style={styles.newListBtn} activeOpacity={0.85}>
              <Text style={styles.newListBtnText}>+ Create new list</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ══════════════ LIBRARY VIEW ══════════════ */}
        {view === "library" && (
          <>
            {/* Search bar */}
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search duas…"
                placeholderTextColor={colors.subtext}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity>
                <Text style={styles.filterIcon}>⊟</Text>
              </TouchableOpacity>
            </View>

            {/* Filter chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {FILTER_CHIPS.map((chip) => (
                <TouchableOpacity
                  key={chip}
                  style={[
                    styles.filterChip,
                    activeFilter === chip && styles.filterChipActive,
                  ]}
                  onPress={() => setActiveFilter(chip)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      activeFilter === chip && styles.filterChipTextActive,
                    ]}
                  >
                    {chip}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Category grid */}
            <View style={styles.categoryGrid}>
              {LIBRARY_CATEGORIES.map((cat, idx) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryCard, { backgroundColor: cat.shade + "55" }]}
                  activeOpacity={0.85}
                >
                  {/* Nature-ish image area */}
                  <View style={[styles.catImage, { backgroundColor: cat.shade }]}>
                    <Text style={styles.catEmoji}>{cat.emoji}</Text>
                  </View>
                  <View style={styles.catBody}>
                    <Text style={styles.catName}>{cat.name}</Text>
                    <Text style={styles.catCount}>{cat.count} duas</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <View style={{ height: spacing(4) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing(2.5),
    paddingTop: spacing(2.5),
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing(2),
  },
  headerTitle: {
    fontSize: typography.title,
    fontWeight: "400",
    color: colors.text,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(1),
  },
  libraryLink: {
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(0.5),
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  libraryLinkText: {
    fontSize: typography.small,
    color: colors.subtext,
    fontWeight: "400",
  },
  addBtn: {
    width: 34, height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.button,
  },
  addBtnText: {
    fontSize: 22,
    color: colors.card,
    lineHeight: 26,
    fontWeight: "300",
  },
  backBtn: {},
  backBtnText: {
    fontSize: typography.small,
    color: colors.primary,
    fontWeight: "400",
  },

  // Segment control
  segmentCtrl: {
    flexDirection: "row",
    backgroundColor: "rgba(200,190,168,0.2)",
    borderRadius: radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing(2),
  },
  segOpt: {
    flex: 1,
    paddingVertical: spacing(1),
    borderRadius: radius.sm,
    alignItems: "center",
  },
  segOptActive: {
    backgroundColor: colors.card,
    shadowColor: "#2A2A2A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segLabel: {
    fontSize: typography.small,
    color: colors.subtext,
    fontWeight: "300",
  },
  segLabelActive: {
    color: colors.text,
    fontWeight: "500",
  },

  // List rows
  listContainer: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    marginBottom: spacing(2),
    ...shadows.card,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.75),
    gap: spacing(1.5),
  },
  listRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listThumb: {
    width: 54, height: 54,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  listThumbEmoji: { fontSize: 24 },
  listInfo: { flex: 1 },
  listName: {
    fontSize: typography.body,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 3,
  },
  listMeta: {
    fontSize: typography.small,
    color: colors.subtext,
    fontWeight: "300",
  },
  listArrow: {
    fontSize: 18,
    color: colors.border,
  },

  // New list button
  newListBtn: {
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: "dashed",
    paddingVertical: spacing(2),
    alignItems: "center",
    marginBottom: spacing(2),
  },
  newListBtnText: {
    fontSize: typography.body,
    color: colors.subtext,
    fontWeight: "300",
  },

  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.25),
    gap: spacing(1),
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing(1.5),
    ...shadows.card,
  },
  searchIcon:  { fontSize: 14, color: colors.subtext },
  searchInput: {
    flex: 1,
    fontSize: typography.body,
    color: colors.text,
    fontWeight: "300",
    padding: 0,
  },
  filterIcon: { fontSize: 15, color: colors.subtext },

  // Filter chips
  filterRow: {
    gap: spacing(1),
    paddingBottom: spacing(2),
  },
  filterChip: {
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(0.75),
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "transparent",
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: typography.small,
    color: colors.subtext,
    fontWeight: "300",
  },
  filterChipTextActive: {
    color: colors.card,
    fontWeight: "400",
  },

  // Category grid
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing(1.25),
  },
  categoryCard: {
    width: "47.5%",
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  catImage: {
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  catEmoji: { fontSize: 30, opacity: 0.85 },
  catBody: {
    padding: spacing(1.25),
    backgroundColor: colors.card,
  },
  catName: {
    fontSize: typography.small,
    fontWeight: "500",
    color: colors.text,
    lineHeight: typography.small * 1.4,
    marginBottom: 2,
  },
  catCount: {
    fontSize: typography.tiny,
    color: colors.subtext,
    fontWeight: "300",
  },
});
