/**
 * NotesScreen.jsx — Safar
 * Freeform personal notes with journey tags. Saved locally via AsyncStorage.
 */
import React, { useState, useEffect, useMemo } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Modal, KeyboardAvoidingView, Platform, Alert, Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAccessibility } from "../AccessibilityContext";
import HeaderPatternBg from "../HeaderPatternBg";
import SafarAssistCard from "../SafarAssistCard";
import {
  CaretLeft, NotePencil, Plus,
  MagnifyingGlass, SquaresFour, List, CaretRight,
} from "phosphor-react-native";

const SERIF       = "SourceSerif4-Regular";
const STORAGE_KEY = "safar_notes_v2";
const V1_KEY      = "safar_notes_v1";

const TAG_CONFIG = {
  "Before": { color: "#2F5D50", bg: "#E8F2EE" },
  "During": { color: "#2C3E5A", bg: "#E8EDF5" },
  "After":  { color: "#6B4A1A", bg: "#F5EDE0" },
};

const PRESET_TAGS = ["Before", "During", "After"];

// ── NoteModal ─────────────────────────────────────────────────────────────────
function NoteModal({ note, visible, onSave, onClose }) {
  const [text,       setText]       = useState("");
  const [title,      setTitle]      = useState("");
  const [tag,        setTag]        = useState(null);
  const [customMode, setCustomMode] = useState(false);
  const [customText, setCustomText] = useState("");

  useEffect(() => {
    setText(note?.text ?? "");
    setTitle(note?.title ?? "");
    const t = note?.tag ?? null;
    if (t && !PRESET_TAGS.includes(t)) {
      setTag(null);
      setCustomMode(true);
      setCustomText(t);
    } else {
      setTag(t);
      setCustomMode(false);
      setCustomText("");
    }
  }, [note?.id, visible]);

  const handleTagPress = (t) => {
    setCustomMode(false);
    setCustomText("");
    setTag(tag === t ? null : t);
  };

  const handleCustomPress = () => {
    setTag(null);
    setCustomMode(true);
  };

  const handleCustomSubmit = () => {
    if (!customText.trim()) {
      setCustomMode(false);
      setTag(null);
    }
  };

  const handleSave = () => {
    if (!text.trim()) return;
    const finalTag = customMode ? (customText.trim() || null) : tag;
    onSave({
      ...note,
      title: title.trim() || "Untitled note",
      text:  text.trim(),
      tag:   finalTag,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={nm.overlay}>
          <View style={nm.sheet}>
            <View style={nm.sheetHeader}>
              <TouchableOpacity onPress={onClose}>
                <Text style={nm.cancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={nm.sheetTitle}>{note?.id ? "Edit note" : "New note"}</Text>
              <TouchableOpacity onPress={handleSave}>
                <Text style={nm.save}>Save</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={nm.titleInput}
              placeholder="Title (optional)"
              placeholderTextColor="#3A3530"
              value={title}
              onChangeText={setTitle}
            />

            {/* ── Tag selector ── */}
            <View style={nm.tagRow}>
              {PRESET_TAGS.map((t) => {
                const active = tag === t && !customMode;
                const cfg = TAG_CONFIG[t];
                return (
                  <TouchableOpacity
                    key={t}
                    style={active
                      ? [nm.tagPill, { backgroundColor: cfg.color, borderColor: cfg.color }]
                      : [nm.tagPill, { borderColor: cfg.color }]
                    }
                    onPress={() => handleTagPress(t)}
                    activeOpacity={0.75}
                  >
                    <Text style={active
                      ? [nm.tagPillText, { color: "#FFFFFF" }]
                      : [nm.tagPillText, { color: cfg.color }]
                    }>
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={customMode
                  ? [nm.tagPill, { backgroundColor: "#5C534A", borderColor: "#5C534A" }]
                  : [nm.tagPill, { borderColor: "#5C534A" }]
                }
                onPress={handleCustomPress}
                activeOpacity={0.75}
              >
                <Text style={customMode
                  ? [nm.tagPillText, { color: "#FFFFFF" }]
                  : [nm.tagPillText, { color: "#5C534A" }]
                }>
                  Custom
                </Text>
              </TouchableOpacity>
            </View>

            {customMode ? (
              <TextInput
                style={nm.customInput}
                placeholder="Type a tag name…"
                placeholderTextColor="#8A7D6A"
                value={customText}
                onChangeText={setCustomText}
                onSubmitEditing={handleCustomSubmit}
                onBlur={handleCustomSubmit}
                returnKeyType="done"
                autoFocus
              />
            ) : null}

            <TextInput
              style={nm.bodyInput}
              placeholder="Write your note…"
              placeholderTextColor="#3A3530"
              value={text}
              onChangeText={setText}
              multiline
              autoFocus={!note?.id}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const nm = StyleSheet.create({
  overlay:     { flex: 1, backgroundColor: "transparent", justifyContent: "flex-end" },
  sheet:       { backgroundColor: "#F0EBE0", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40, minHeight: "65%", shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.14, shadowRadius: 16, elevation: 10 },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  cancel:      { fontSize: 16, color: "#5A5650" },
  sheetTitle:  { fontFamily: SERIF, fontSize: 16, color: "#100E0A" },
  save:        { fontSize: 16, color: "#1E3D30", fontWeight: "600" },
  titleInput:  { fontSize: 18, fontFamily: SERIF, color: "#100E0A", borderBottomWidth: 1, borderBottomColor: "#C8BFB2", paddingBottom: 10, marginBottom: 12 },
  tagRow:      { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  tagPill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 50, borderWidth: 1.5 },
  tagPillText: { fontSize: 13, fontWeight: "600" },
  customInput: { backgroundColor: "#E8E0D0", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, color: "#1A1410", marginBottom: 12 },
  bodyInput:   { flex: 1, fontSize: 16, color: "#100E0A", lineHeight: 26, textAlignVertical: "top" },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function NotesScreen({ navigation }) {
  const { colors } = useAccessibility();
  const s = useMemo(() => createStyles(colors), [colors]);
  const SW = Dimensions.get("window").width;
  const insets = useSafeAreaInsets();

  const [notes, setNotes] = useState([
    {
      id: "n1",
      title: "My intentions for this journey",
      text: "Ya Allah, I make this journey seeking Your pleasure alone. I ask You to accept my Umrah, forgive my sins, and grant me the ability to return again. Please keep my family safe while I am away and bless them in my absence.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      tag: "Before",
    },
    {
      id: "n2",
      title: "Things to remember at the Kaaba",
      text: "Face the Black Stone at the start of each circuit. Make dua between the Yemeni Corner and the Black Stone — this is a special place. Don't push — stay calm and patient with the crowd. Remember why you are here.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      tag: "During",
    },
    {
      id: "n3",
      title: "Duas to make for family",
      text: "For my mother: grant her health, ease her pain and fill her heart with peace.\nFor my father: forgive him, have mercy on him and elevate his rank.\nFor my children: guide them, protect them and make them from those who establish the prayer.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      tag: "Before",
    },
    {
      id: "n4",
      title: "Reflection after Tawaf",
      text: "Subhanallah — the feeling of completing the first Tawaf is indescribable. Every step felt significant. I wept at the Yemeni Corner without expecting to. Make time to just stand and look at the Kaaba before leaving.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      tag: "After",
    },
  ]);
  const [editing,   setEditing]   = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [viewMode,   setViewMode]   = useState("grid");

  useEffect(() => {
    const load = async () => {
      try {
        const v2Raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (v2Raw) {
          const parsed = JSON.parse(v2Raw);
          if (parsed.length > 0) { setNotes(parsed); return; }
        }
        const v1Raw = await AsyncStorage.getItem(V1_KEY);
        if (v1Raw) {
          const parsed = JSON.parse(v1Raw);
          if (parsed.length > 0) {
            const migrated = parsed.map((n) => ({ ...n, tag: null }));
            setNotes(migrated);
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(migrated)).catch(() => {});
          }
        }
      } catch {}
    };
    load();
  }, []);

  const saveNotes = (updated) => {
    setNotes(updated);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
  };

  const handleSave = (note) => {
    const updated = note.id
      ? notes.map((n) => n.id === note.id ? note : n)
      : [{ ...note, id: Date.now().toString(), createdAt: new Date().toISOString() }, ...notes];
    saveNotes(updated);
    setShowModal(false);
    setEditing(null);
  };

  const handleDelete = (id) => {
    saveNotes(notes.filter((n) => n.id !== id));
  };

  const openEdit = (note) => { setEditing(note); setShowModal(true); };

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  const filtered = useMemo(() => {
    if (!searchText.trim()) return notes;
    const q = searchText.trim().toLowerCase();
    return notes.filter(n =>
      n.title?.toLowerCase().includes(q) ||
      n.text?.toLowerCase().includes(q)
    );
  }, [notes, searchText]);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <View style={s.safe}>
      {/* ── Header ── */}
      <View style={s.header}>
        <HeaderPatternBg width={SW} />
        <View style={[s.headerTopRow, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => navigation?.goBack?.()}
            activeOpacity={0.8}
          >
            <CaretLeft size={20} color={colors.text} weight="bold" />
          </TouchableOpacity>
          <TouchableOpacity
            style={s.addBtn}
            onPress={() => { setEditing(null); setShowModal(true); }}
            activeOpacity={0.85}
          >
            <Plus size={20} color="#1A1410" weight="bold" />
          </TouchableOpacity>
        </View>

        <View style={s.headerCenter}>
          <View style={s.headerTitleRow}>
            <NotePencil size={20} color="#C8A96A" weight="regular" />
            <Text style={s.headerTitle}>Notes</Text>
          </View>
          <Text style={s.headerSub}>Intentions, reflections, and reminders.</Text>
        </View>
      </View>

      {/* ── Search + Grid/List toggle ── */}
      <View style={s.controlBar}>
        <MagnifyingGlass size={15} color="#8A7D6A" weight="regular" />
        <TextInput
          style={s.searchInput}
          placeholder="Search notes"
          placeholderTextColor="#8A7D6A"
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        <View style={s.divider} />
        <TouchableOpacity
          style={viewMode === "grid" ? [s.modeBtn, s.modeBtnActive] : s.modeBtn}
          onPress={() => setViewMode("grid")}
          activeOpacity={0.75}
        >
          <SquaresFour
            size={16}
            color={viewMode === "grid" ? "#1A1410" : "#8A7D6A"}
            weight="regular"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={viewMode === "list" ? [s.modeBtn, s.modeBtnActive] : s.modeBtn}
          onPress={() => setViewMode("list")}
          activeOpacity={0.75}
        >
          <List
            size={16}
            color={viewMode === "list" ? "#1A1410" : "#8A7D6A"}
            weight="regular"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <SafarAssistCard
          title="Import with Safar Assist"
          subtitle="Bring in your notes from Apple Notes, Google Docs, or anywhere else"
          tagline="Speak it, scan it, or upload it"
          onPress={() => navigation.navigate("SafarAssist")}
        />
        {notes.length === 0 ? (
          <View style={s.empty}>
            <NotePencil size={48} color="#DDD5C0" weight="thin" />
            <Text style={s.emptyTitle}>No notes yet</Text>
            <Text style={s.emptyBody}>
              Jot down intentions, reflections, or anything on your heart.
            </Text>
            <TouchableOpacity
              style={s.emptyBtn}
              onPress={() => setShowModal(true)}
              activeOpacity={0.85}
            >
              <Text style={s.emptyBtnText}>Write your first note</Text>
            </TouchableOpacity>
          </View>
        ) : filtered.length === 0 ? (
          <View style={s.empty}>
            <MagnifyingGlass size={48} color="#DDD5C0" weight="thin" />
            <Text style={s.emptyTitle}>No results</Text>
            <Text style={s.emptyBody}>No notes match your search.</Text>
          </View>
        ) : filtered.map((note) => {
          const tc = TAG_CONFIG[note.tag] ?? { color: "#5C534A", bg: "#F0EBE0" };
          if (viewMode === "list") {
            return (
              <TouchableOpacity
                key={note.id}
                style={s.listRow}
                onPress={() => openEdit(note)}
                activeOpacity={0.85}
                onLongPress={() =>
                  Alert.alert(
                    "Delete note?",
                    "This cannot be undone.",
                    [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete", style: "destructive",
                        onPress: () => handleDelete(note.id) },
                    ]
                  )
                }
              >
                <View style={[s.listDot, { backgroundColor: tc.color }]} />
                <View style={s.listInfo}>
                  <Text style={s.listTitle} numberOfLines={1}>
                    {note.title || note.text.split(" ").slice(0, 7).join(" ")}
                  </Text>
                  <Text style={s.listMeta}>
                    {note.tag ? note.tag + " · " : ""}{formatDate(note.createdAt)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity
              key={note.id}
              style={s.card}
              onPress={() => openEdit(note)}
              activeOpacity={0.85}
              onLongPress={() =>
                Alert.alert(
                  "Delete note?",
                  "This cannot be undone.",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive",
                      onPress: () => handleDelete(note.id) },
                  ]
                )
              }
            >
              <View style={s.cardBody}>
                <View style={s.cardTitleRow}>
                  <Text style={s.cardTitle} numberOfLines={2}>
                    {note.title || note.text.split(" ").slice(0, 7).join(" ")}
                  </Text>
                  <CaretRight size={16} color="#C8BFB2" weight="bold" />
                </View>
                {note.title ? (
                  <>
                    <View style={s.cardDivider} />
                    <Text style={s.cardPreview} numberOfLines={3}>
                      {note.text}
                    </Text>
                  </>
                ) : null}
                <View style={s.cardFooter}>
                  {note.tag ? (
                    <View style={[s.tagPill, { backgroundColor: tc.bg }]}>
                      <Text style={[s.tagText, { color: tc.color }]}>
                        {note.tag}
                      </Text>
                    </View>
                  ) : null}
                  <Text style={s.cardDate}>{formatDate(note.createdAt)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 32 }} />
      </ScrollView>

      <NoteModal
        note={editing}
        visible={showModal}
        onSave={handleSave}
        onClose={() => { setShowModal(false); setEditing(null); }}
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const createStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F0E8" },

  header: {
    backgroundColor: "#4A5C48",
    minHeight: 160,
    position: "relative",
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    alignItems: "center",
    marginTop: 16,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontFamily: "SourceSerif4-Regular",
    fontSize: 38,
    color: "#FDFAF4",
    fontWeight: "400",
  },
  headerSub: {
    fontSize: 15,
    color: "#FDFAF4",
    marginTop: 2,
    textAlign: "center",
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FDFAF4",
    alignItems: "center",
    justifyContent: "center",
  },

  controlBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    backgroundColor: "#FDFAF4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDD5C0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1A1410",
    padding: 0,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: "#DDD5C0",
  },
  modeBtn: {
    padding: 6,
    borderRadius: 6,
  },
  modeBtnActive: {
    backgroundColor: "#E8E0D0",
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDFAF4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E0D0",
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    shadowColor: "#2A1F0E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  listDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  listInfo: { flex: 1 },
  listTitle: {
    fontFamily: "SourceSerif4-Regular",
    fontSize: 15,
    color: "#1A1410",
    fontWeight: "500",
  },
  listMeta: {
    fontSize: 12,
    color: "#8A7D6A",
    marginTop: 2,
  },

  scroll: { paddingHorizontal: 16, paddingTop: 8 },

  card: {
    flexDirection: "row",
    backgroundColor: "#FDFAF4",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8E0D0",
    marginBottom: 12,
    shadowColor: "#2A1F0E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 5,
  },
  cardBody: {
    flex: 1,
    padding: 16,
    gap: 0,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#E8E0D0",
    marginTop: 10,
    marginBottom: 10,
  },
  cardTitle: {
    fontFamily: "SourceSerif4-Regular",
    fontSize: 20,
    color: "#1A1410",
    fontWeight: "600",
    lineHeight: 26,
  },
  cardPreview: {
    fontSize: 14,
    color: "#5C534A",
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 50,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardDate: {
    fontSize: 12,
    color: "#8A7D6A",
  },

  empty: {
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: "SourceSerif4-Regular",
    fontSize: 20,
    color: "#1A1410",
    textAlign: "center",
  },
  emptyBody: {
    fontSize: 15,
    color: "#8A7D6A",
    textAlign: "center",
    lineHeight: 22,
  },
  emptyBtn: {
    marginTop: 8,
    backgroundColor: "#4A5C48",
    borderRadius: 50,
    paddingHorizontal: 24,
    paddingVertical: 11,
  },
  emptyBtnText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
