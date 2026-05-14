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
              placeholderTextColor={"#3A3530"}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={nm.bodyInput}
              placeholder="Write your note…"
              placeholderTextColor={"#3A3530"}
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
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#F0EBE0", borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 40, minHeight: "65%",
  },
  sheetHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16,
  },
  cancel:     { fontSize: 16, color: "#5A5650" },
  sheetTitle: { fontFamily: SERIF, fontSize: 16, color: "#100E0A" },
  save:       { fontSize: 16, color: "#1E3D30", fontWeight: "600" },
  titleInput: {
    fontSize: 18, fontFamily: SERIF, color: "#100E0A",
    borderBottomWidth: 1, borderBottomColor: "#C8BFB2",
    paddingBottom: 10, marginBottom: 12,
  },
  bodyInput: {
    flex: 1, fontSize: 16, color: "#100E0A",
    lineHeight: 26, textAlignVertical: "top",
  },
});

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
  const openWithTemplate = () => { setEditing({ id:null, title:"My Intention (Niyyah)", body:"I intend to perform " }); setShowModal(true); };

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
        <Text style={s.headerTitle}>Reflections & Intentions</Text>
        <TouchableOpacity style={s.addBtn} onPress={openWithTemplate}>
          <Text style={s.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {notes.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>📝</Text>
          <Text style={s.emptyTitle}>No notes yet</Text>
          <Text style={s.emptyBody}>Jot down personal reflections, intentions, or anything on your heart.</Text>
          <TouchableOpacity style={s.emptyBtn} onPress={openWithTemplate}>
            <Text style={s.emptyBtnText}>Write your intention</Text>
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
          <View style={{ height: 32 }} />
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
  safe: { flex: 1, backgroundColor: "#E8DDD0" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  back: { fontSize: 22, color: "#100E0A" },
  headerTitle: { fontFamily: SERIF, fontSize: 22, color: "#100E0A" },
  addBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: "#1E3D30",
    alignItems: "center", justifyContent: "center", shadowColor:"#4A2E10", shadowOffset:{width:0,height:3}, shadowOpacity:0.20, shadowRadius:10, elevation:5,
  },
  addBtnText: { fontSize: 22, color: "#fff", lineHeight: 26 },

  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontFamily: SERIF, fontSize: 22, color: "#100E0A", marginBottom: 8 },
  emptyBody: { fontSize: 16, color: "#3A3530", textAlign: "center", lineHeight: 22, marginBottom: 20 },
  emptyBtn: { backgroundColor: "#1E3D30", borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24, shadowColor:"#4A2E10", shadowOffset:{width:0,height:3}, shadowOpacity:0.20, shadowRadius:10, elevation:5 },
  emptyBtnText: { color: "#fff", fontWeight: "500" },

  scroll: { paddingHorizontal: 20 },
  noteCard: {
    backgroundColor: "#E8DDD0", borderRadius: 10, borderWidth: 1,
    borderColor: "#C8BFB2", padding: 16, marginBottom: 10, shadowColor:"#4A2E10", shadowOffset:{width:0,height:3}, shadowOpacity:0.20, shadowRadius:10, elevation:5,
  },
  noteTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  noteTitle: { fontFamily: SERIF, fontSize: 16, color: "#100E0A", flex: 1 },
  deleteIcon: { fontSize: 14, color: "#C8BFB2", paddingLeft: 8 },
  notePreview: { fontSize: 14, color: "#3A3530", lineHeight: 20, marginBottom: 6 },
  noteDate: { fontSize: 12, color: "#3A3530" },
});
