/**
 * NotesScreen.jsx — Safar
 * Freeform personal notes. Saved locally via AsyncStorage.
 */
import React, { useState, useEffect, useMemo } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Modal, KeyboardAvoidingView, Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, spacing, radius, shadows, typography } from "../theme";
import { useAccessibility } from "../AccessibilityContext";

const SERIF = "SourceSerif4-Regular";
const STORAGE_KEY = "safar_notes_v1";

function NoteModal({ note, visible, onSave, onClose }) {
  const [text, setText] = useState(note?.text ?? "");
  const [title, setTitle] = useState(note?.title ?? "");

  useEffect(() => {
    setText(note?.text ?? "");
    setTitle(note?.title ?? "");
  }, [note]);

  const handleSave = () => {
    if (!text.trim()) return;
    onSave({ ...note, title: title.trim() || "Untitled note", text: text.trim() });
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
              placeholderTextColor={colors.subtext}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={nm.bodyInput}
              placeholder="Write your note…"
              placeholderTextColor={colors.subtext}
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

const create_nm = (colors) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#F0EBE0", borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    padding: spacing(2.5), paddingBottom: spacing(5), minHeight: "65%",
  },
  sheetHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing(2),
  },
  cancel: { fontSize: typography.body, color: colors.subtext },
  sheetTitle: { fontFamily: SERIF, fontSize: typography.body, color: colors.text },
  save: { fontSize: typography.body, color: colors.primary, fontWeight: "600" },
  titleInput: {
    fontSize: typography.heading, fontFamily: SERIF, color: colors.text,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    paddingBottom: spacing(1.25), marginBottom: spacing(1.5),
  },
  bodyInput: {
    flex: 1, fontSize: typography.body, color: colors.text,
    lineHeight: 26, textAlignVertical: "top",
  },
});
const nm = create_nm(require("../theme").colors);

export default function NotesScreen({ navigation }) {
  const { colors } = useAccessibility();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [notes, setNotes] = useState([
    {
      id: "n1",
      title: "My intentions for this journey",
      text: "Ya Allah, I make this journey seeking Your pleasure alone. I ask You to accept my Umrah, forgive my sins, and grant me the ability to return again. Please keep my family safe while I am away and bless them in my absence.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    {
      id: "n2",
      title: "Things to remember at the Kaaba",
      text: "Face the Black Stone at the start of each circuit. Make dua between the Yemeni Corner and the Black Stone — this is a special place. Don't push — stay calm and patient with the crowd. Remember why you are here.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    },
    {
      id: "n3",
      title: "Duas to make for family",
      text: "For my mother: grant her health, ease her pain and fill her heart with peace.\nFor my father: forgive him, have mercy on him and elevate his rank.\nFor my children: guide them, protect them and make them from those who establish the prayer.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    },
    {
      id: "n4",
      title: "Reflection after Tawaf",
      text: "Subhanallah — the feeling of completing the first Tawaf is indescribable. Every step felt significant. I wept at the Yemeni Corner without expecting to. Make time to just stand and look at the Kaaba before leaving.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
  ]);
  const [editing,  setEditing]  = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => { if (v) { const parsed = JSON.parse(v); if (parsed.length > 0) setNotes(parsed); } })
      .catch(() => {});
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

  const openNew  = () => { setEditing(null); setShowModal(true); };
  const openEdit = (note) => { setEditing(note); setShowModal(true); };

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 24 }} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Notes</Text>
        <TouchableOpacity style={s.addBtn} onPress={openNew}>
          <Text style={s.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {notes.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>📝</Text>
          <Text style={s.emptyTitle}>No notes yet</Text>
          <Text style={s.emptyBody}>Jot down personal reflections, intentions, or anything on your heart.</Text>
          <TouchableOpacity style={s.emptyBtn} onPress={openNew}>
            <Text style={s.emptyBtnText}>Write your first note</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {notes.map((note) => (
            <TouchableOpacity
              key={note.id}
              style={s.noteCard}
              onPress={() => openEdit(note)}
              activeOpacity={0.85}
            >
              <View style={s.noteTop}>
                <Text style={s.noteTitle} numberOfLines={1}>{note.title}</Text>
                <TouchableOpacity onPress={() => handleDelete(note.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={s.deleteIcon}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={s.notePreview} numberOfLines={3}>{note.text}</Text>
              <Text style={s.noteDate}>{formatDate(note.createdAt)}</Text>
            </TouchableOpacity>
          ))}
          <View style={{ height: spacing(4) }} />
        </ScrollView>
      )}

      <NoteModal
        note={editing}
        visible={showModal}
        onSave={handleSave}
        onClose={() => { setShowModal(false); setEditing(null); }}
      />
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
  addBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center", ...shadows.button,
  },
  addBtnText: { fontSize: 22, color: "#fff", lineHeight: 26 },

  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing(3) },
  emptyEmoji: { fontSize: 48, marginBottom: spacing(2) },
  emptyTitle: { fontFamily: SERIF, fontSize: 22, color: colors.text, marginBottom: spacing(1) },
  emptyBody: { fontSize: typography.body, color: colors.subtext, textAlign: "center", lineHeight: 22, marginBottom: spacing(2.5) },
  emptyBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing(1.5), paddingHorizontal: spacing(3), ...shadows.button },
  emptyBtnText: { color: "#fff", fontWeight: "500" },

  scroll: { paddingHorizontal: spacing(2.5) },
  noteCard: {
    backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.border, padding: spacing(2), marginBottom: spacing(1.25), ...shadows.card,
  },
  noteTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing(0.75) },
  noteTitle: { fontFamily: SERIF, fontSize: typography.body, color: colors.text, flex: 1 },
  deleteIcon: { fontSize: 14, color: colors.border, paddingLeft: spacing(1) },
  notePreview: { fontSize: typography.small, color: colors.subtext, lineHeight: 20, marginBottom: spacing(0.75) },
  noteDate: { fontSize: typography.tiny, color: colors.subtext },
});
