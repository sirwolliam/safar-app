/**
 * PracticeLearnScreen.jsx — Safar
 * Queue manager and dua browser for focused practice.
 * Audio is handled by DuaDetailScreen.
 */
import React, { useState, useEffect, useMemo } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Alert,
} from "react-native";
import { useAccessibility } from "../AccessibilityContext";
import { DUAS } from "../dua-content";
import {
  getPracticeQueue, addToPractice, removeFromPractice,
  reorderQueue, clearPracticeQueue,
} from "../practiceStore";
import {
  CaretLeft, Play, ListChecks, MagnifyingGlass,
  CaretUp, CaretDown, CaretRight, X, Sparkle,
  HandsPraying, ArrowsClockwise,
} from "phosphor-react-native";

const SERIF = "SourceSerif4-Regular";
const STAGES = ["All", "Ihram", "Entry", "Tawaf", "Saʿy",
                "Arafah", "Muzdalifah", "Jamarat", "Farewell"];

// ── Quick Start sets — ids verified against duas-data.js ─────────────────────
const QUICK_SETS = [
  {
    id: "core_umrah",
    label: "Core Umrah",
    sub: "The essential duas for every step of Umrah",
    Icon: HandsPraying,
    color: "#2D4F32",
    ids: ["talbiyah", "black-stone-takbir", "yemeni-corner", "safa-marwah"],
  },
  {
    id: "arafah_day",
    label: "Day of Arafah",
    sub: "Duas for the most blessed day of the year",
    Icon: Sparkle,
    color: "#4A3A6A",
    ids: ["arafah", "muzdalifah", "jamarat"],
  },
  {
    id: "daily",
    label: "Daily Practice",
    sub: "Sleep and evening duas for consistent daily worship",
    Icon: ArrowsClockwise,
    color: "#5A3A1A",
    ids: ["sleep-three-quls", "ayat-al-kursi-sleep", "sleep-tasbih-fatimah", "sleep-bismika-amutu"],
  },
];

// ── Screen ────────────────────────────────────────────────────────────────────
export default function PracticeLearnScreen({ navigation }) {
  const { colors } = useAccessibility();
  const s = useMemo(() => createStyles(colors), [colors]);

  const [queue,       setQueue]       = useState([]);
  const [practiceIds, setPracticeIds] = useState(new Set());
  const [searchText,  setSearchText]  = useState("");
  const [stage,       setStage]       = useState("All");
  const [section,     setSection]     = useState("queue");

  useEffect(() => {
    getPracticeQueue().then(q => {
      setQueue(q);
      setPracticeIds(new Set(q.map(e => e.id)));
    });
  }, []);

  const handleToggle = async (id) => {
    if (practiceIds.has(id)) {
      const next = await removeFromPractice(id);
      setQueue(next);
      setPracticeIds(new Set(next.map(e => e.id)));
    } else {
      const next = await addToPractice(id);
      setQueue(next);
      setPracticeIds(new Set(next.map(e => e.id)));
    }
  };

  const handleMove = async (fromIndex, toIndex) => {
    const next = await reorderQueue(fromIndex, toIndex);
    setQueue(next);
  };

  const handleRemoveFromQueue = async (id) => {
    const next = await removeFromPractice(id);
    setQueue(next);
    setPracticeIds(new Set(next.map(e => e.id)));
  };

  const handleQuickSet = async (set) => {
    const validIds = set.ids.filter(id => DUAS.some(d => d.id === id));
    if (validIds.length === 0) {
      Alert.alert("Coming soon",
        "This set will be available once more duas are added.");
      return;
    }
    let q = await getPracticeQueue();
    for (const id of validIds) {
      if (!q.some(e => e.id === id)) {
        q = await addToPractice(id);
      }
    }
    const final = await getPracticeQueue();
    setQueue(final);
    setPracticeIds(new Set(final.map(e => e.id)));
    setSection("queue");
  };

  const handleStartPractice = () => {
    if (queue.length === 0) return;
    const allDuas = queue
      .map(e => DUAS.find(d => d.id === e.id))
      .filter(Boolean);
    if (allDuas.length === 0) return;
    navigation.navigate("DuaDetail", {
      dua: allDuas[0],
      allDuas,
      currentIndex: 0,
    });
  };

  const handleClearQueue = () => {
    Alert.alert(
      "Clear practice queue?",
      "This removes all duas from your practice list.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear", style: "destructive",
          onPress: async () => {
            await clearPracticeQueue();
            setQueue([]);
            setPracticeIds(new Set());
          },
        },
      ]
    );
  };

  const filtered = useMemo(() => {
    let list = stage === "All"
      ? DUAS
      : DUAS.filter(d => d.stage === stage);
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      list = list.filter(d =>
        d.title?.toLowerCase().includes(q) ||
        d.stage?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [stage, searchText]);

  return (
    <SafeAreaView style={s.safe}>

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => navigation?.goBack?.()}
          activeOpacity={0.8}
        >
          <CaretLeft size={20} color={colors.text} weight="bold" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <View style={s.headerTitleRow}>
            <ListChecks size={20} color="#C8A96A" weight="regular" />
            <Text style={s.headerTitle}>Practice</Text>
          </View>
          <Text style={s.headerSub}>
            Build your practice queue and start learning
          </Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* ── Section tabs ── */}
      <View style={s.tabBar}>
        {[
          ["queue",      "My Queue"],
          ["browse",     "Browse"],
          ["quickstart", "Quick Start"],
        ].map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={section === key
              ? [s.tab, s.tabActive]
              : s.tab}
            onPress={() => setSection(key)}
            activeOpacity={0.75}
          >
            <Text style={section === key
              ? [s.tabText, s.tabTextActive]
              : s.tabText}>
              {label}{key === "queue" && queue.length > 0 ? ` (${queue.length})` : ""}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── SECTION: My Queue ── */}
        {section === "queue" ? (
          queue.length === 0 ? (
            <View style={s.empty}>
              <View style={s.emptyIconBox}>
                <ListChecks size={36} color="#C8A96A" weight="regular" />
              </View>
              <Text style={s.emptyTitle}>Your queue is empty</Text>
              <Text style={s.emptyBody}>
                Browse duas and tap + Add, or use a Quick Start
                set to begin practicing.
              </Text>
              <TouchableOpacity
                style={s.emptyBtn}
                onPress={() => setSection("browse")}
                activeOpacity={0.85}
              >
                <Text style={s.emptyBtnText}>Browse Duas</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.emptyBtnOutline}
                onPress={() => setSection("quickstart")}
                activeOpacity={0.85}
              >
                <Text style={s.emptyBtnOutlineText}>Quick Start</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={s.startHero}
                onPress={handleStartPractice}
                activeOpacity={0.88}
              >
                <View style={s.startHeroLeft}>
                  <Text style={s.startHeroEyebrow}>
                    {queue.length} DUA{queue.length !== 1 ? "S" : ""} QUEUED
                  </Text>
                  <Text style={s.startHeroTitle}>Start Practice</Text>
                  <Text style={s.startHeroSub}>Opens in Dua Player with audio</Text>
                </View>
                <View style={s.startHeroPlay}>
                  <Play size={28} color="#2D4F32" weight="fill" />
                </View>
              </TouchableOpacity>

              <View style={s.queueCard}>
                {queue.map((item, index) => {
                  const dua = DUAS.find(d => d.id === item.id);
                  if (!dua) return null;
                  return (
                    <View
                      key={item.id}
                      style={index < queue.length - 1
                        ? [s.queueRow, s.queueRowBorder]
                        : s.queueRow}
                    >
                      <View style={s.reorderCol}>
                        <TouchableOpacity
                          onPress={() => handleMove(index, index - 1)}
                          disabled={index === 0}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <CaretUp
                            size={16}
                            color={index === 0 ? "#DDD5C0" : "#5C534A"}
                            weight="bold"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleMove(index, index + 1)}
                          disabled={index === queue.length - 1}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <CaretDown
                            size={16}
                            color={index === queue.length - 1 ? "#DDD5C0" : "#5C534A"}
                            weight="bold"
                          />
                        </TouchableOpacity>
                      </View>
                      <View style={s.queueBadge}>
                        <Text style={s.queueBadgeText}>{index + 1}</Text>
                      </View>
                      <View style={s.queueInfo}>
                        <Text style={s.queueTitle} numberOfLines={2}>
                          {dua.title}
                        </Text>
                        <Text style={s.queueStage}>{dua.stage}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRemoveFromQueue(item.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <X size={16} color="#8A7D6A" weight="bold" />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>

              <TouchableOpacity onPress={handleClearQueue} style={s.clearRow}>
                <Text style={s.clearBtn}>Clear queue</Text>
              </TouchableOpacity>
            </>
          )
        ) : null}

        {/* ── SECTION: Browse & Add ── */}
        {section === "browse" ? (
          <>
            <View style={s.controlBar}>
              <MagnifyingGlass size={15} color="#8A7D6A" weight="regular" />
              <TextInput
                style={s.searchInput}
                placeholder="Search duas"
                placeholderTextColor="#8A7D6A"
                value={searchText}
                onChangeText={setSearchText}
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.stageRow}
            >
              {STAGES.map(st => (
                <TouchableOpacity
                  key={st}
                  style={stage === st
                    ? [s.stagePill, s.stagePillActive]
                    : s.stagePill}
                  onPress={() => setStage(st)}
                  activeOpacity={0.75}
                >
                  <Text style={stage === st
                    ? [s.stagePillText, s.stagePillTextActive]
                    : s.stagePillText}>
                    {st}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={s.browseCard}>
              {filtered.map((dua, index) => (
                <TouchableOpacity
                  key={dua.id}
                  style={index < filtered.length - 1
                    ? [s.browseRow, s.browseRowBorder]
                    : s.browseRow}
                  onPress={() => navigation.navigate("DuaDetail", {
                    dua,
                    allDuas: filtered,
                    currentIndex: index,
                  })}
                  activeOpacity={0.75}
                >
                  <View style={s.browseIconBox}>
                    <HandsPraying size={20} color="#C8A96A" weight="regular" />
                  </View>
                  <View style={s.browseInfo}>
                    <Text style={s.browseTitle}>{dua.title}</Text>
                    <Text style={s.browseStage}>{dua.stage}</Text>
                  </View>
                  <TouchableOpacity
                    style={practiceIds.has(dua.id)
                      ? [s.addPill, s.addPillActive]
                      : s.addPill}
                    onPress={() => handleToggle(dua.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                  >
                    <Text style={practiceIds.has(dua.id)
                      ? [s.addPillText, s.addPillTextActive]
                      : s.addPillText}>
                      {practiceIds.has(dua.id) ? "Added" : "+ Add"}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : null}

        {/* ── SECTION: Quick Start ── */}
        {section === "quickstart" ? (
          <>
            <Text style={s.quickIntro}>
              Add a curated set of duas to your practice queue in one tap.
            </Text>
            {QUICK_SETS.map(set => (
              <TouchableOpacity
                key={set.id}
                style={s.quickCard}
                onPress={() => handleQuickSet(set)}
                activeOpacity={0.85}
              >
                <View style={[s.quickIconBox, { backgroundColor: set.color }]}>
                  <set.Icon size={28} color="#C8A96A" weight="regular" />
                </View>
                <View style={s.quickInfo}>
                  <Text style={s.quickLabel}>{set.label}</Text>
                  <Text style={s.quickSub}>{set.sub}</Text>
                </View>
                <CaretRight size={18} color="#C8BFB2" weight="bold" />
              </TouchableOpacity>
            ))}
          </>
        ) : null}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const createStyles = (colors) => StyleSheet.create({
  safe:   { flex: 1, backgroundColor: "#EDE6D8" },
  scroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 },

  // Header
  header:         { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, backgroundColor: "#EDE6D8" },
  backBtn:        { width: 36, height: 36, borderRadius: 18, backgroundColor: "#FDFAF4", borderWidth: 1, borderColor: "#DDD5C0", alignItems: "center", justifyContent: "center" },
  headerCenter:   { flex: 1, alignItems: "center" },
  headerTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle:    { fontFamily: SERIF, fontSize: 28, color: "#1C1A14", fontWeight: "400" },
  headerSub:      { fontSize: 12, color: "#5C534A", marginTop: 2, textAlign: "center" },

  // Section tabs — full-width hub style
  tabBar:        { flexDirection: "row", backgroundColor: "#FDFAF4", paddingHorizontal: 12, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#DDD5C8", gap: 4 },
  tab:           { flex: 1, alignItems: "center", paddingVertical: 11, borderRadius: 22 },
  tabActive:     { backgroundColor: "#2D4F32" },
  tabText:       { fontSize: 14, fontWeight: "500", color: "#8A7A6A" },
  tabTextActive: { fontSize: 14, fontWeight: "600", color: "#FFFFFF" },

  // Start Practice — large hero card
  startHero:        { flexDirection: "row", alignItems: "center", backgroundColor: "#2D4F32", borderRadius: 20, marginBottom: 16, paddingVertical: 24, paddingHorizontal: 24, shadowColor: "#1A2E1A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 12, elevation: 6 },
  startHeroLeft:    { flex: 1 },
  startHeroEyebrow: { fontSize: 11, color: "#C8A96A", fontWeight: "700", letterSpacing: 1.5, marginBottom: 6 },
  startHeroTitle:   { fontFamily: SERIF, fontSize: 30, color: "#FFFFFF", fontWeight: "600", lineHeight: 36, marginBottom: 4 },
  startHeroSub:     { fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 18 },
  startHeroPlay:    { width: 64, height: 64, borderRadius: 32, backgroundColor: "#C8A96A", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },

  // Queue — grouped card container
  queueCard:      { backgroundColor: "#FDFAF4", borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: "#E8E0D0", marginBottom: 8, shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  queueRow:       { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  queueRowBorder: { borderBottomWidth: 1, borderBottomColor: "#EDE4D4" },
  reorderCol:     { gap: 6, alignItems: "center" },
  queueBadge:     { width: 32, height: 32, borderRadius: 16, backgroundColor: "#2D4F32", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  queueBadgeText: { fontSize: 13, color: "#FFFFFF", fontWeight: "700" },
  queueInfo:      { flex: 1 },
  queueTitle:     { fontFamily: SERIF, fontSize: 16, color: "#1C1A14", lineHeight: 22 },
  queueStage:     { fontSize: 12, color: "#8A7A6A", marginTop: 2 },
  clearRow:       { alignItems: "center", paddingVertical: 8 },
  clearBtn:       { fontSize: 13, color: "#8A7A6A", textDecorationLine: "underline" },

  // Browse
  controlBar:  { flexDirection: "row", alignItems: "center", marginBottom: 10, backgroundColor: "#FDFAF4", borderRadius: 12, borderWidth: 1, borderColor: "#DDD5C0", paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  searchInput: { flex: 1, fontSize: 15, color: "#1C1A14", padding: 0 },
  stageRow:    { paddingBottom: 12, gap: 8, flexDirection: "row" },

  // Stage pills — hub sizing
  stagePill:           { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 50, borderWidth: 1.5, borderColor: "#DDD5C0", backgroundColor: "#FDFAF4" },
  stagePillActive:     { backgroundColor: "#2D4F32", borderColor: "#2D4F32" },
  stagePillText:       { fontSize: 14, fontWeight: "500", color: "#5C534A" },
  stagePillTextActive: { color: "#FFFFFF", fontWeight: "600" },

  // Browse card + rows
  browseCard:      { backgroundColor: "#FDFAF4", borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: "#E8E0D0", shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  browseRow:       { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  browseRowBorder: { borderBottomWidth: 1, borderBottomColor: "#EDE4D4" },
  browseIconBox:   { width: 44, height: 44, borderRadius: 12, backgroundColor: "#2D4F32", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  browseInfo:      { flex: 1 },
  browseTitle:     { fontFamily: SERIF, fontSize: 16, color: "#1C1A14" },
  browseStage:     { fontSize: 12, color: "#8A7A6A", marginTop: 2 },

  // Add pill
  addPill:           { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 50, borderWidth: 1.5, borderColor: "#2D4F32", backgroundColor: "transparent" },
  addPillActive:     { backgroundColor: "#2D4F32" },
  addPillText:       { fontSize: 13, color: "#2D4F32", fontWeight: "600" },
  addPillTextActive: { color: "#FFFFFF" },

  // Quick Start
  quickIntro:   { fontSize: 14, color: "#5C534A", marginBottom: 14, lineHeight: 21 },
  quickCard:    { flexDirection: "row", alignItems: "center", backgroundColor: "#FDFAF4", borderRadius: 18, borderWidth: 1, borderColor: "#E8E0D0", marginBottom: 12, padding: 18, gap: 16, shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  quickIconBox: { width: 60, height: 60, borderRadius: 16, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  quickInfo:    { flex: 1 },
  quickLabel:   { fontFamily: SERIF, fontSize: 20, color: "#1C1A14", marginBottom: 4 },
  quickSub:     { fontSize: 13, color: "#5C534A", lineHeight: 19 },

  // Empty state
  empty:               { alignItems: "center", paddingVertical: 48, paddingHorizontal: 32, gap: 12 },
  emptyIconBox:        { width: 72, height: 72, borderRadius: 36, backgroundColor: "#FDFAF4", borderWidth: 1.5, borderColor: "#C8A96A", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyTitle:          { fontFamily: SERIF, fontSize: 22, color: "#1C1A14", textAlign: "center" },
  emptyBody:           { fontSize: 15, color: "#5C534A", textAlign: "center", lineHeight: 22 },
  emptyBtn:            { marginTop: 8, backgroundColor: "#2D4F32", borderRadius: 50, paddingHorizontal: 28, paddingVertical: 13, shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 8, elevation: 4 },
  emptyBtnText:        { fontSize: 15, color: "#FFFFFF", fontWeight: "600" },
  emptyBtnOutline:     { paddingHorizontal: 28, paddingVertical: 13, borderRadius: 50, borderWidth: 1.5, borderColor: "#2D4F32" },
  emptyBtnOutlineText: { fontSize: 15, color: "#2D4F32", fontWeight: "600" },
});
