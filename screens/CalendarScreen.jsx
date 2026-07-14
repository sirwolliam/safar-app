/**
 * CalendarScreen.jsx — Safar
 * Pilgrimage calendar: month grid, day entries, CRUD, Share.
 */
import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, Animated, TextInput,
  KeyboardAvoidingView, Platform, Share, Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import {
  CaretLeft, CaretRight, Plus, X, Trash,
  ShareNetwork, CalendarBlank, Note, MapPin,
  SuitcaseRolling, HandsPraying, UsersThree, Heart, BellSimple,
} from "phosphor-react-native";

// ── Constants ────────────────────────────────────────────────────────────────
const SERIF = "SourceSerif4-Regular";
const STORAGE_KEY = "safar_calendar_v1";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const CATEGORIES = [
  { id: "travel",    label: "Travel",    color: "#2E4560", Icon: SuitcaseRolling },
  { id: "rites",     label: "Rites",     color: "#C8A96A", Icon: HandsPraying   },
  { id: "group",     label: "Group",     color: "#3D2240", Icon: UsersThree     },
  { id: "personal",  label: "Personal",  color: "#4A5C48", Icon: Heart          },
  { id: "reminders", label: "Reminders", color: "#3A2F1E", Icon: BellSimple     },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function todayStr() {
  return toDateStr(new Date());
}

function shiftDate(dateStr, delta) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return toDateStr(dt);
}

function buildGrid(year, month) {
  // Returns array of 6 rows, each row = 7 cells { date: "YYYY-MM-DD" | null, day: number }
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ date: dStr, day: d });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

function formatDayHeading(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const dayName = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dt.getDay()];
  return `${dayName}, ${d} ${MONTH_NAMES[m - 1]}`;
}

function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id) ?? CATEGORIES[0];
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── Storage ──────────────────────────────────────────────────────────────────
async function loadEntries() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveEntries(entries) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {}
}

async function seedDemoEntriesIfEmpty() {
  const existing = await loadEntries();
  if (existing.length > 0) return;
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const demo = [
    { id: uid(), date: `${y}-${m}-03`, title: "Hotel Check-in",      description: "Makkah, Jabal Omar",                                 category: "travel",    location: "Jabal Omar, Makkah",  createdAt: new Date().toISOString() },
    { id: uid(), date: `${y}-${m}-09`, title: "Day of Arafah",       description: "Stand in prayer from Dhuhr to Maghrib",              category: "rites",     location: "Mount Arafat",         createdAt: new Date().toISOString() },
    { id: uid(), date: `${y}-${m}-12`, title: "Group Meeting Point",  description: "Mina, tent block 12, 5:30 PM",                      category: "group",     location: "Mina, Tent Block 12",  createdAt: new Date().toISOString() },
    { id: uid(), date: `${y}-${m}-12`, title: "Visit Masjid Nabawi", description: "Evening visit for Maghrib and Isha prayers",          category: "personal",  location: "Madinah",              createdAt: new Date().toISOString() },
    { id: uid(), date: `${y}-${m}-15`, title: "Call Family",         description: "Let them know we've arrived safely",                  category: "personal",  location: "",                     createdAt: new Date().toISOString() },
    { id: uid(), date: `${y}-${m}-22`, title: "Visa Document Check", description: "Confirm all documents are in order before departure", category: "reminders", location: "",                     createdAt: new Date().toISOString() },
  ];
  await saveEntries(demo);
}

// ── Sub-components ───────────────────────────────────────────────────────────
function EntryCard({ entry, onEdit, onDelete, onShare }) {
  const cat = getCategoryById(entry.category);
  return (
    <View style={ec.cardShadow}>
      <View style={ec.card}>
      <View style={[ec.catBar, { backgroundColor: cat.color }]} />
      <View style={ec.body}>
        <View style={ec.topRow}>
          <View style={[ec.catTag, { backgroundColor: cat.color + "22" }]}>
            <cat.Icon size={12} color={cat.color} weight="fill" />
            <Text style={[ec.catLabel, { color: cat.color }]}>{cat.label}</Text>
          </View>
          <View style={ec.actions}>
            <TouchableOpacity
              style={ec.actionBtn}
              onPress={onShare}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <ShareNetwork size={15} color="#8A7D6A" weight="regular" />
            </TouchableOpacity>
            <TouchableOpacity
              style={ec.actionBtn}
              onPress={onEdit}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <Note size={15} color="#8A7D6A" weight="regular" />
            </TouchableOpacity>
            <TouchableOpacity
              style={ec.actionBtn}
              onPress={onDelete}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <Trash size={15} color="#C44B4B" weight="regular" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={ec.title} numberOfLines={2}>{entry.title}</Text>
        {entry.description ? (
          <Text style={ec.desc} numberOfLines={3}>{entry.description}</Text>
        ) : null}
        {entry.location ? (
          <View style={ec.locRow}>
            <MapPin size={12} color="#8A7D6A" weight="regular" />
            <Text style={ec.locText}>{entry.location}</Text>
          </View>
        ) : null}
      </View>
      </View>
    </View>
  );
}

const ec = StyleSheet.create({
  cardShadow: { shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2, marginBottom: 10 },
  card:       { flexDirection: "row", backgroundColor: "#FDFAF4", borderRadius: 12, borderWidth: 1, borderColor: "#DDD5C0", overflow: "hidden" },
  catBar:   { width: 4 },
  body:     { flex: 1, paddingHorizontal: 14, paddingVertical: 12 },
  topRow:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  catTag:   { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  catLabel: { fontSize: 11, fontWeight: "600" },
  actions:  { flexDirection: "row", gap: 8 },
  actionBtn:{ width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  title:    { fontSize: 15, fontWeight: "600", color: "#1A1410", lineHeight: 21, marginBottom: 3 },
  desc:     { fontSize: 13, color: "#5C534A", lineHeight: 19 },
  locRow:   { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  locText:  { fontSize: 12, color: "#8A7D6A" },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function CalendarScreen({ navigation }) {
  const today = todayStr();
  const todayDate = new Date();

  const [entries, setEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentYear, setCurrentYear] = useState(todayDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(todayDate.getMonth());

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalTitle, setModalTitle] = useState("");
  const [modalDesc, setModalDesc] = useState("");
  const [modalCategory, setModalCategory] = useState("personal");
  const [modalLocation, setModalLocation] = useState("");

  // Animations
  const slideAnim = useRef(new Animated.Value(500)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  // ── Load entries on focus ──
  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;
      const load = async () => {
        await seedDemoEntriesIfEmpty();
        const data = await loadEntries();
        if (!cancelled) setEntries(data);
      };
      load();
      return () => { cancelled = true; };
    }, [])
  );

  // ── Calendar grid ──
  const grid = buildGrid(currentYear, currentMonth);

  const entryDates = new Set(entries.map(e => e.date));

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  // ── Modal open/close ──
  const openModal = useCallback((entry) => {
    if (entry) {
      setEditingId(entry.id);
      setModalTitle(entry.title);
      setModalDesc(entry.description ?? "");
      setModalCategory(entry.category ?? "personal");
      setModalLocation(entry.location ?? "");
    } else {
      setEditingId(null);
      setModalTitle("");
      setModalDesc("");
      setModalCategory("personal");
      setModalLocation("");
    }
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 500, duration: 240, useNativeDriver: true }),
      Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setShowModal(false);
      setEditingId(null);
    });
  }, [slideAnim, backdropAnim]);

  // ── Slide in when modal becomes visible ──
  useEffect(() => {
    if (showModal) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 1, duration: 240, useNativeDriver: true }),
      ]).start();
    }
  }, [showModal]);

  // ── CRUD ──
  const commitEntry = useCallback(async () => {
    const title = modalTitle.trim();
    if (!title) return;

    let updated;
    if (editingId) {
      updated = entries.map(e =>
        e.id === editingId
          ? { ...e, title, description: modalDesc.trim(), category: modalCategory, location: modalLocation.trim() }
          : e
      );
    } else {
      const newEntry = {
        id: uid(),
        date: selectedDate,
        title,
        description: modalDesc.trim(),
        category: modalCategory,
        location: modalLocation.trim(),
        createdAt: new Date().toISOString(),
      };
      updated = [...entries, newEntry];
    }

    updated.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    setEntries(updated);
    await saveEntries(updated);
  }, [modalTitle, modalDesc, modalCategory, modalLocation, editingId, entries, selectedDate]);

  const deleteEntry = useCallback((id) => {
    Alert.alert("Delete entry?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const updated = entries.filter(e => e.id !== id);
          setEntries(updated);
          await saveEntries(updated);
        },
      },
    ]);
  }, [entries]);

  const shareEntry = useCallback(async (entry) => {
    try {
      const cat = getCategoryById(entry.category);
      const parts = [entry.title, ""];
      if (entry.description) parts.push(entry.description, "");
      parts.push(`${cat.label} · ${formatDayHeading(entry.date)}`);
      parts.push("Shared via Safar");
      await Share.share({ message: parts.join("\n") });
    } catch {}
  }, []);

  // ── Entries for selected day ──
  const dayEntries = entries.filter(e => e.date === selectedDate);

  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.headerBtn}
          onPress={() => navigation?.goBack?.()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 24 }}
          activeOpacity={0.8}
        >
          <CaretLeft size={20} color="#1A1712" weight="bold" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Calendar</Text>
        <TouchableOpacity
          style={s.headerBtn}
          onPress={() => openModal(null)}
          hitSlop={{ top: 12, bottom: 12, left: 24, right: 12 }}
          activeOpacity={0.8}
        >
          <Plus size={20} color="#1A1712" weight="bold" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* Month navigator */}
        <View style={s.monthNav}>
          <TouchableOpacity style={s.monthArrow} onPress={prevMonth} activeOpacity={0.7}>
            <CaretLeft size={20} color="#1A1410" weight="bold" />
          </TouchableOpacity>
          <Text style={s.monthLabel}>{MONTH_NAMES[currentMonth]} {currentYear}</Text>
          <TouchableOpacity style={s.monthArrow} onPress={nextMonth} activeOpacity={0.7}>
            <CaretRight size={20} color="#1A1410" weight="bold" />
          </TouchableOpacity>
        </View>

        {/* Calendar grid */}
        <View style={s.gridCard}>
          {/* Day headers */}
          <View style={s.gridRow}>
            {DAY_LABELS.map((label, i) => (
              <View key={i} style={s.gridCell}>
                <Text style={s.gridDayHeader}>{label}</Text>
              </View>
            ))}
          </View>

          {/* Day cells */}
          {grid.map((row, ri) => (
            <View key={ri} style={s.gridRow}>
              {row.map((cell, ci) => {
                if (!cell) {
                  return <View key={ci} style={s.gridCell} />;
                }
                const isSelected = cell.date === selectedDate;
                const isToday = cell.date === today;
                const hasDot = entryDates.has(cell.date);

                return (
                  <TouchableOpacity
                    key={ci}
                    style={s.gridCell}
                    onPress={() => setSelectedDate(cell.date)}
                    activeOpacity={0.75}
                  >
                    <View style={isSelected ? s.dayCellSelected : isToday ? s.dayCellToday : s.dayCell}>
                      <Text style={isSelected ? s.dayNumSelected : isToday ? s.dayNumToday : s.dayNum}>
                        {cell.day}
                      </Text>
                    </View>
                    {hasDot ? (
                      <View style={isSelected ? s.dotSelected : s.dot} />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Selected day section */}
        <Text style={s.dayHeading}>{formatDayHeading(selectedDate)}</Text>

        {dayEntries.length > 0 ? (
          <View style={s.entriesSection}>
            {dayEntries.map(entry => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onEdit={() => openModal(entry)}
                onDelete={() => deleteEntry(entry.id)}
                onShare={() => shareEntry(entry)}
              />
            ))}
          </View>
        ) : (
          <View style={s.empty}>
            <CalendarBlank size={36} color="#C8BFB2" weight="thin" />
            <Text style={s.emptyText}>No entries for this day</Text>
            <TouchableOpacity
              style={s.emptyBtn}
              onPress={() => openModal(null)}
              activeOpacity={0.8}
            >
              <Plus size={14} color="#FDFAF4" weight="bold" />
              <Text style={s.emptyBtnText}>Add entry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* This month section */}
        {(() => {
          const monthEntries = entries
            .filter(e => {
              const [ey, em] = e.date.split("-").map(Number);
              return ey === currentYear && em === currentMonth + 1;
            })
            .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
          return (
            <>
              <Text style={[s.dayHeading, { marginTop: 24 }]}>This month</Text>
              {monthEntries.length === 0 ? (
                <Text style={s.monthListEmpty}>No entries yet this month</Text>
              ) : (
                monthEntries.map(entry => {
                  const cat = getCategoryById(entry.category);
                  const dayNum = Number(entry.date.split("-")[2]);
                  const dayName = formatDayHeading(entry.date).split(",")[0].slice(0, 3);
                  return (
                    <TouchableOpacity
                      key={entry.id}
                      style={s.monthListRow}
                      onPress={() => setSelectedDate(entry.date)}
                      activeOpacity={0.75}
                    >
                      <View style={s.monthListDayWrap}>
                        <Text style={[s.monthListDayName, { color: cat.color }]}>{dayName}</Text>
                        <Text style={[s.monthListDay, { color: cat.color, textAlign: "center" }]}>{dayNum}</Text>
                      </View>
                      <Text style={s.monthListTitle} numberOfLines={1}>{entry.title}</Text>
                      <View style={s.monthListMeta}>
                        <View style={[s.monthListDot, { backgroundColor: cat.color }]} />
                        <Text style={s.monthListCat}>{cat.label}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </>
          );
        })()}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom sheet modal */}
      <Modal transparent visible={showModal} onRequestClose={closeModal}>
        <View style={s.modalRoot}>
          <Animated.View style={[s.backdrop, { opacity: backdropAnim }]}>
            <TouchableOpacity style={s.backdropTouch} onPress={closeModal} activeOpacity={1} />
          </Animated.View>
          <Animated.View style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={s.sheetKav}
            >
              <View style={s.sheetHandle} />
              <View style={s.sheetHeaderRow}>
                <Text style={s.sheetTitle}>{editingId ? "Edit Entry" : "Add Entry"}</Text>
                <TouchableOpacity onPress={closeModal} activeOpacity={0.7}>
                  <X size={20} color="#8A7D6A" weight="regular" />
                </TouchableOpacity>
              </View>

              {/* Date navigation */}
              <View style={s.dateNavRow}>
                <TouchableOpacity
                  style={s.dateNavArrow}
                  onPress={() => setSelectedDate(shiftDate(selectedDate, -1))}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}
                >
                  <CaretLeft size={18} color="#5C534A" weight="regular" />
                </TouchableOpacity>
                <Text style={s.dateNavText}>{formatDayHeading(selectedDate)}</Text>
                <TouchableOpacity
                  style={s.dateNavArrow}
                  onPress={() => setSelectedDate(shiftDate(selectedDate, 1))}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}
                >
                  <CaretRight size={18} color="#5C534A" weight="regular" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={s.sheetScroll}
                contentContainerStyle={s.sheetScrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >

                {/* Title */}
                <Text style={s.inputLabel}>Title</Text>
                <TextInput
                  style={s.titleInput}
                  placeholder="Entry title"
                  placeholderTextColor="#B0A090"
                  value={modalTitle}
                  onChangeText={setModalTitle}
                  returnKeyType="next"
                />

                {/* Location */}
                <Text style={s.inputLabel}>Location (optional)</Text>
                <TextInput
                  style={s.titleInput}
                  placeholder="e.g. Masjid al-Haram, Makkah"
                  placeholderTextColor="#B0A090"
                  value={modalLocation}
                  onChangeText={setModalLocation}
                  returnKeyType="next"
                />

                {/* Category */}
                <Text style={s.inputLabel}>Category</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.catRow}
                >
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat.id}
                      style={modalCategory === cat.id
                        ? [s.catChip, { backgroundColor: cat.color }]
                        : s.catChipOff}
                      onPress={() => setModalCategory(cat.id)}
                      activeOpacity={0.8}
                    >
                      <cat.Icon
                        size={20}
                        color={modalCategory === cat.id ? "#FDFAF4" : "#5C534A"}
                        weight={modalCategory === cat.id ? "fill" : "regular"}
                      />
                      <Text style={modalCategory === cat.id ? s.catChipTextOn : s.catChipTextOff}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Description */}
                <Text style={s.inputLabel}>Notes (optional)</Text>
                <TextInput
                  style={s.descInput}
                  placeholder="Add any notes or reminders..."
                  placeholderTextColor="#B0A090"
                  multiline
                  value={modalDesc}
                  onChangeText={setModalDesc}
                  textAlignVertical="top"
                />

                {/* Actions */}
                <TouchableOpacity
                  style={modalTitle.trim() ? s.saveBtn : s.saveBtnDisabled}
                  onPress={async () => { await commitEntry(); closeModal(); }}
                  disabled={!modalTitle.trim()}
                  activeOpacity={0.85}
                >
                  <Text style={s.saveBtnText}>{editingId ? "Save changes" : "Add to calendar"}</Text>
                </TouchableOpacity>

                {!editingId ? (
                  <TouchableOpacity
                    style={modalTitle.trim() ? s.addMoreBtn : s.addMoreBtnDisabled}
                    onPress={async () => {
                      await commitEntry();
                      setModalTitle("");
                      setModalDesc("");
                      setModalCategory("personal");
                      setModalLocation("");
                    }}
                    disabled={!modalTitle.trim()}
                    activeOpacity={0.85}
                  >
                    <Text style={s.addMoreBtnText}>Add more events</Text>
                  </TouchableOpacity>
                ) : null}

                {editingId ? (
                  <TouchableOpacity
                    style={s.deleteBtn}
                    onPress={() => {
                      closeModal();
                      setTimeout(() => deleteEntry(editingId), 300);
                    }}
                    activeOpacity={0.8}
                  >
                    <Trash size={15} color="#C44B4B" weight="regular" />
                    <Text style={s.deleteBtnText}>Delete entry</Text>
                  </TouchableOpacity>
                ) : null}

              </ScrollView>
            </KeyboardAvoidingView>
          </Animated.View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: "#F5F0E8" },

  // Header
  header:        { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#3A3545" },
  headerBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: "#FDFAF4", borderWidth: 1, borderColor: "#D4D0CA", alignItems: "center", justifyContent: "center" },
  headerTitle:   { fontFamily: SERIF, fontSize: 22, color: "#FDFAF4" },

  // Scroll
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 24 },

  // Month navigator
  monthNav:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  monthArrow:    { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  monthLabel:    { fontFamily: SERIF, fontSize: 20, color: "#1A1410" },

  // Grid card
  gridCard:      { backgroundColor: "#FDFAF4", borderRadius: 16, borderWidth: 1, borderColor: "#DDD5C0", padding: 12, marginBottom: 24, shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  gridRow:       { flexDirection: "row" },
  gridCell:      { flex: 1, alignItems: "center", paddingVertical: 4 },
  gridDayHeader: { fontSize: 11, fontWeight: "700", color: "#8A7D6A", marginBottom: 4 },

  // Day cells
  dayCell:         { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  dayCellSelected: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "#4A5C48" },
  dayCellToday:    { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "#C8A96A" },
  dayNum:          { fontSize: 14, color: "#1A1410", fontWeight: "400" },
  dayNumSelected:  { fontSize: 14, color: "#FDFAF4", fontWeight: "600" },
  dayNumToday:     { fontSize: 14, color: "#C8A96A", fontWeight: "600" },
  dot:             { width: 4, height: 4, borderRadius: 2, backgroundColor: "#4A5C48", marginTop: 2 },
  dotSelected:     { width: 4, height: 4, borderRadius: 2, backgroundColor: "#A8C4A6", marginTop: 2 },

  // Day heading
  dayHeading:    { fontFamily: SERIF, fontSize: 20, color: "#1A1410", marginBottom: 14 },

  // Entries section
  entriesSection: { },

  // Empty state
  empty:         { alignItems: "center", paddingVertical: 36, backgroundColor: "#FDFAF4", borderRadius: 16, borderWidth: 1, borderColor: "#DDD5C0" },
  emptyText:     { fontSize: 14, color: "#8A7D6A", marginTop: 12, marginBottom: 16 },
  emptyBtn:      { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#4A5C48", borderRadius: 20, paddingHorizontal: 18, paddingVertical: 9 },
  emptyBtnText:  { fontSize: 13, fontWeight: "600", color: "#FDFAF4" },

  // Modal
  modalRoot:     { flex: 1, justifyContent: "flex-end" },
  backdrop:      { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15,10,5,0.55)" },
  backdropTouch: { flex: 1 },
  sheet:         { backgroundColor: "#FDFAF4", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "90%", paddingBottom: Platform.OS === "ios" ? 0 : 20 },
  sheetKav:      {},
  sheetHandle:   { width: 40, height: 4, borderRadius: 2, backgroundColor: "#DDD5C0", alignSelf: "center", marginTop: 12, marginBottom: 4 },
  sheetHeaderRow:{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#EDE4D4" },
  sheetTitle:    { fontSize: 17, fontWeight: "600", color: "#1A1410" },
  sheetScroll:   {},
  sheetScrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },

  // Inputs
  inputLabel:    { fontSize: 12, fontWeight: "600", color: "#5C534A", letterSpacing: 0.5, marginBottom: 6, marginTop: 16 },
  titleInput:    { backgroundColor: "#F5F0E8", borderRadius: 10, borderWidth: 1, borderColor: "#DDD5C0", paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#1A1410" },
  descInput:     { backgroundColor: "#F5F0E8", borderRadius: 10, borderWidth: 1, borderColor: "#DDD5C0", paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#1A1410", minHeight: 100 },

  // Category chips
  catRow:        { flexDirection: "row", gap: 8, paddingBottom: 4 },
  catChip:       { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 20 },
  catChipOff:    { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 20, backgroundColor: "#F0EBE1", borderWidth: 1, borderColor: "#DDD5C0" },
  catChipTextOn: { fontSize: 17, fontWeight: "600", color: "#FDFAF4" },
  catChipTextOff:{ fontSize: 17, fontWeight: "500", color: "#5C534A" },

  // This month list
  monthListEmpty:{ fontSize: 14, color: "#8A7D6A", marginBottom: 8 },
  monthListRow:  { flexDirection: "row", alignItems: "center", backgroundColor: "#FDFAF4", borderWidth: 1, borderColor: "#DDD5C0", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8, shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  monthListDayWrap: { width: 34, alignItems: "center" },
  monthListDayName: { fontSize: 10, fontWeight: "600", textAlign: "center" },
  monthListDay:  { fontSize: 16, fontWeight: "700", width: 28 },
  monthListTitle:{ flex: 1, fontSize: 14, fontWeight: "600", color: "#1A1410" },
  monthListMeta: { flexDirection: "row", alignItems: "center", gap: 5 },
  monthListDot:  { width: 6, height: 6, borderRadius: 3 },
  monthListCat:  { fontSize: 11, color: "#8A7D6A" },

  // Date nav row in sheet
  dateNavRow:         { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EDE4D4" },
  dateNavArrow:       { padding: 4 },
  dateNavText:        { fontSize: 15, fontWeight: "600", color: "#1A1410" },

  // Add more events button
  addMoreBtn:         { backgroundColor: "#F0EBE1", borderWidth: 1, borderColor: "#4A5C48", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 10 },
  addMoreBtnDisabled: { backgroundColor: "#F0EBE1", borderWidth: 1, borderColor: "#C8BFB2", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 10 },
  addMoreBtnText:     { fontSize: 14, fontWeight: "600", color: "#4A5C48" },

  // Save / delete
  saveBtn:         { backgroundColor: "#4A5C48", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 24 },
  saveBtnDisabled: { backgroundColor: "#A8C4A6", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 24 },
  saveBtnText:     { fontSize: 15, fontWeight: "600", color: "#FDFAF4" },
  deleteBtn:       { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 14, marginTop: 8 },
  deleteBtnText:   { fontSize: 14, color: "#C44B4B", fontWeight: "500" },
});
