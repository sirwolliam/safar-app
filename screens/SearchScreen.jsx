/**
 * SearchScreen.jsx — Safar
 * Global keyword search (Phase 1). Root-stack screen: navigate("Search") from anywhere.
 * Fuzzy search over duas, lessons, sacred places and media (see ../searchIndex.js).
 */
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList, ScrollView,
  StyleSheet, StatusBar, Linking, Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CaretLeft, MagnifyingGlass, X, HandsPraying, BookOpen, MapPin, PlayCircle,
  ClockCounterClockwise, Compass,
} from "phosphor-react-native";
import { buildSearchIndex, getSuggestedSearches, toFuseQuery } from "../searchIndex";

const SERIF = "SourceSerif4-Regular";
const SAGE  = "#2D4A34";

const RECENT_KEY  = "safar_recent_searches_v1";
const RECENT_MAX  = 8;
const DEBOUNCE_MS = 200;
const RESULT_MAX  = 50;
const MAX_SCORE   = 0.5; // Fuse score: 0 = perfect, 1 = unrelated; drop very loose matches

const FILTERS = [
  { key: "all",    label: "All"     },
  { key: "dua",    label: "Duas"    },
  { key: "lesson", label: "Lessons" },
  { key: "place",  label: "Places"  },
  { key: "media",  label: "Media"   },
];

const TYPE_META = {
  screen: { Icon: Compass,      label: "Screen" },
  dua:    { Icon: HandsPraying, label: "Dua"    },
  lesson: { Icon: BookOpen,     label: "Lesson" },
  place:  { Icon: MapPin,       label: "Place"  },
  media:  { Icon: PlayCircle,   label: "Media"  },
};

// Category colours, shared by the filter chip (solid), icon circle (bg + icon) and type badge (bg + badgeText).
// badgeText is darker only for gold: #BF9F60 is 2.1:1 on its tint at badge size; #8A7128 is 3.9:1.
const TYPE_COLORS = {
  screen: { bg: "rgba(74,92,72,0.18)",  icon: "#4A5C48", solid: "#4A5C48", badgeText: "#4A5C48" },  // deep sage (app destinations)
  dua:    { bg: "rgba(45,74,52,0.15)",   icon: "#2D4A34", solid: "#2D4A34", badgeText: "#2D4A34" },  // sage
  lesson: { bg: "rgba(191,159,96,0.18)", icon: "#BF9F60", solid: "#BF9F60", badgeText: "#8A7128" },  // gold
  place:  { bg: "rgba(160,92,60,0.18)",  icon: "#A05C3C", solid: "#A05C3C", badgeText: "#A05C3C" },  // terracotta
  media:  { bg: "rgba(85,107,143,0.18)", icon: "#556B8F", solid: "#556B8F", badgeText: "#556B8F" },  // slate blue
};
const ALL_CHIP_COLOR = "#1A1410"; // "All" spans every category, so its active fill stays neutral


async function saveRecent(query) {
  const q = query.trim();
  if (q.length < 2) return null;
  try {
    const raw = await AsyncStorage.getItem(RECENT_KEY);
    const prev = raw ? JSON.parse(raw) : [];
    const next = [q, ...prev.filter((p) => p.toLowerCase() !== q.toLowerCase())].slice(0, RECENT_MAX);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next));
    return next;
  } catch {
    return null;
  }
}

function ResultRow({ item, onPress }) {
  const meta = TYPE_META[item.type] || TYPE_META.lesson;
  const { Icon } = meta;
  const tint = TYPE_COLORS[item.type] || TYPE_COLORS.dua;
  return (
    <TouchableOpacity style={s.row} activeOpacity={0.75} onPress={onPress}>
      <View style={[s.rowIcon, { backgroundColor: tint.bg }]}><Icon size={18} color={tint.icon} weight="regular" /></View>
      <View style={s.rowText}>
        <Text style={s.rowTitle} numberOfLines={1}>{item.title}</Text>
        {item.subtitle ? <Text style={s.rowSub} numberOfLines={1}>{item.subtitle}</Text> : null}
      </View>
      <View style={[s.badge, { backgroundColor: tint.bg }]}><Text style={[s.badgeTxt, { color: tint.badgeText }]}>{meta.label}</Text></View>
    </TouchableOpacity>
  );
}

function ChipRow({ items, onPress }) {
  return (
    <View style={s.suggestWrap}>
      {items.map((q) => (
        <TouchableOpacity key={q} style={s.suggestChip} activeOpacity={0.8} onPress={() => onPress(q)}>
          <Text style={s.suggestTxt}>{q}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function SearchScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const fuse = useMemo(() => buildSearchIndex(), []);
  const suggestions = useMemo(() => getSuggestedSearches(), []);

  const [query, setQuery]       = useState("");
  const [debounced, setDebounced] = useState("");
  const [filter, setFilter]     = useState("all");
  const [recent, setRecent]     = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY)
      .then((raw) => { if (raw) setRecent(JSON.parse(raw)); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  const results = useMemo(() => {
    if (debounced.length < 2) return [];
    const q = toFuseQuery(debounced);
    if (!q) return [];
    return fuse.search(q)
      .filter((r) => r.score <= MAX_SCORE)
      .map((r) => r.item)
      .filter((item) => filter === "all" || item.type === filter)
      .slice(0, RESULT_MAX);
  }, [fuse, debounced, filter]);

  const remember = async (q) => {
    const next = await saveRecent(q);
    if (next) setRecent(next);
  };

  const openResult = (item) => {
    remember(query);
    Keyboard.dismiss();
    if (item.url) {
      Linking.openURL(item.url).catch(() => {});
      return;
    }
    navigation?.navigate?.(item.route, item.params);
  };

  const runQuery = (q) => {
    setQuery(q);
    setDebounced(q);
    remember(q);
  };

  const showEmpty = debounced.length < 2;

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* ── Header: back · input · cancel ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <CaretLeft size={20} color="#1A1410" weight="bold" />
        </TouchableOpacity>
        <View style={s.inputWrap}>
          <MagnifyingGlass size={16} color="#8A7D6A" weight="regular" />
          <TextInput
            ref={inputRef}
            style={s.input}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => remember(query)}
            placeholder="Search duas, lessons, places…"
            placeholderTextColor="#B0A090"
            autoFocus
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            clearButtonMode="never"
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => { setQuery(""); inputRef.current?.focus?.(); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={14} color="#8A7D6A" weight="bold" />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} activeOpacity={0.7}>
          <Text style={s.cancel}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* ── Type filter chips ── */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips} keyboardShouldPersistTaps="handled">
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={filter === f.key ? [s.chip, { backgroundColor: f.key === "all" ? ALL_CHIP_COLOR : TYPE_COLORS[f.key].solid }] : s.chip}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.8}
            >
              <Text style={filter === f.key ? [s.chipTxt, s.chipTxtActive] : s.chipTxt}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {showEmpty ? (
        // ── Empty query: recent searches + suggestions ──
        <ScrollView contentContainerStyle={s.emptyWrap} keyboardShouldPersistTaps="handled">
          {recent.length > 0 ? (
            <View style={s.block}>
              <Text style={s.blockTitle}>Recent searches</Text>
              {recent.map((q) => (
                <TouchableOpacity key={q} style={s.recentRow} activeOpacity={0.7} onPress={() => runQuery(q)}>
                  <ClockCounterClockwise size={16} color="#8A7D6A" weight="regular" />
                  <Text style={s.recentTxt} numberOfLines={1}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
          <View style={s.block}>
            <Text style={s.blockTitle}>Try searching for…</Text>
            <ChipRow items={suggestions} onPress={runQuery} />
          </View>
        </ScrollView>
      ) : results.length === 0 ? (
        // ── No results ──
        <ScrollView contentContainerStyle={s.emptyWrap} keyboardShouldPersistTaps="handled">
          <Text style={s.noneTitle}>{"No results for “" + debounced + "”"}</Text>
          <Text style={s.noneSub}>Try a different spelling, a shorter word, or one of these:</Text>
          <ChipRow items={suggestions} onPress={runQuery} />
        </ScrollView>
      ) : (
        // ── Results ──
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ResultRow item={item} onPress={() => openResult(item)} />}
          contentContainerStyle={[s.list, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: "#FDFAF4" },

  header:    { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn:   { width: 32, height: 36, alignItems: "flex-start", justifyContent: "center" },
  inputWrap: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, height: 40, paddingHorizontal: 12, backgroundColor: "#F5F0E8", borderRadius: 12, borderWidth: 1, borderColor: "#EDE4D4" },
  input:     { flex: 1, fontSize: 15, color: "#1A1410", paddingVertical: 0 },
  cancel:    { fontSize: 15, color: SAGE, fontWeight: "500" },

  chips:        { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  chip:         { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: "#EDE4D4" },
  chipTxt:      { fontSize: 13, color: "#5C534A", fontWeight: "500" },
  chipTxtActive:{ color: "#FFFFFF" },

  list:      { paddingHorizontal: 16, paddingTop: 4 },
  row:       { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EDE4D4" },
  rowIcon:   { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  rowText:   { flex: 1 },
  rowTitle:  { fontFamily: SERIF, fontSize: 16, color: "#1A1410" },
  rowSub:    { fontSize: 12, color: "#8A7D6A", marginTop: 2 },
  badge:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgeTxt:  { fontSize: 11, fontWeight: "600" },

  emptyWrap: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 },
  block:     { marginBottom: 24 },
  blockTitle:{ fontSize: 12, fontWeight: "700", letterSpacing: 1, color: "#8A7D6A", textTransform: "uppercase", marginBottom: 10 },
  recentRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
  recentTxt: { flex: 1, fontSize: 15, color: "#1A1410" },

  suggestWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  suggestChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EDE4D4" },
  suggestTxt:  { fontSize: 13, color: "#1A1410" },

  noneTitle: { fontFamily: SERIF, fontSize: 18, color: "#1A1410", marginTop: 8, marginBottom: 6 },
  noneSub:   { fontSize: 14, color: "#5C534A", lineHeight: 20, marginBottom: 14 },
});
