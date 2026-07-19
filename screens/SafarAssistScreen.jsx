/**
 * SafarAssistScreen.jsx — Safar
 * AI-powered trip document importer.
 * Paste booking confirmation text → Claude API extracts key data →
 * Review → Save to AsyncStorage → populates Journey, Contacts, Board.
 *
 * Works fully in Expo Go (text paste).
 * Photo picker: add expo-image-picker in dev build and uncomment the
 * IMAGE PICKER section below. The API call already handles base64 images.
 *
 * Storage keys populated:
 *   safar_departure_date_v1   — departure date ISO string
 *   safar_journey_contacts_v1 — contacts array
 *   safar_journey_board_v1    — board cards array
 *   safar_cal_entries_v1      — calendar entries object
 */

import React, { useState, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, Animated,
  Image, Dimensions, StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CaretLeft, CaretRight, ShieldCheck, LockSimple, Timer,
  AirplaneTakeoff, CalendarBlank, FileText, ListChecks,
  Microphone, UploadSimple, Camera, ClipboardText,
  Sparkle, PencilSimple, CheckCircle,
} from "phosphor-react-native";

// expo-document-picker works in Expo Go — install with: npx expo install expo-document-picker
// expo-image-picker needs a dev build — install with: npx expo install expo-image-picker
let DocumentPicker, ImagePicker;
try { DocumentPicker = require("expo-document-picker"); } catch (_) {}
try { ImagePicker = require("expo-image-picker"); } catch (_) {}

const SERIF = "SourceSerif4-Regular";
const { width: SW } = Dimensions.get("window");

// ── Storage keys — must match JourneyScreen.jsx ───────────────────────────────
const DEPARTURE_KEY = "safar_departure_date_v1";
const CONTACTS_KEY  = "safar_journey_contacts_v1";
const BOARD_KEY     = "safar_journey_board_v1";
const CAL_KEY       = "safar_cal_entries_v1";

// ── Extraction prompt ─────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a travel document parser for a Hajj and Umrah planning app called Safar.
Extract structured trip data from the document provided. Return ONLY valid JSON — no preamble, no markdown fences.

Return this exact structure (use null for any field not found):
{
  "departure": {
    "date": "YYYY-MM-DD or null",
    "flight": "flight number or null",
    "from": "departure airport/city or null",
    "time": "HH:MM or null"
  },
  "return": {
    "date": "YYYY-MM-DD or null",
    "flight": "flight number or null",
    "time": "HH:MM or null"
  },
  "hotel": {
    "name": "hotel name or null",
    "city": "Makkah or Madinah or other or null",
    "checkIn": "YYYY-MM-DD or null",
    "checkOut": "YYYY-MM-DD or null",
    "phone": "phone number or null",
    "confirmationNo": "confirmation number or null"
  },
  "airline": {
    "name": "airline name or null",
    "phone": "customer service number or null",
    "bookingRef": "booking reference or null"
  },
  "agent": {
    "name": "travel agent or operator name or null",
    "phone": "phone or null",
    "email": "email or null"
  },
  "group": {
    "name": "Hajj/Umrah group name or null",
    "leader": "group leader name or null",
    "phone": "group leader phone or null"
  },
  "visaNo": "visa number or null",
  "passengerName": "traveller full name or null",
  "notes": "any other important information in 1-2 sentences or null"
}

Extract everything you can find. Be precise with dates — always use YYYY-MM-DD format.`;

// ── Steps ─────────────────────────────────────────────────────────────────────
const STEPS = ["Welcome", "Add", "Organizing", "Review", "Done"];

// ── Organize features for landing page ────────────────────────────────────────
const ORGANIZE_FEATURES = [
  { Icon: AirplaneTakeoff, title: "Flights &\nReservations",    sub: "Flights, hotels, transfers, and boarding passes.",           source: "From Gmail, PDF, and Photos",          iconBg: "#2A5C4E", iconColor: "#FFFFFF", sourceColor: "#2A5C4E" },
  { Icon: CalendarBlank,   title: "Itineraries &\nTravel Plans", sub: "Daily plans, schedules, activities, and bookmarks.",         source: "From Google Docs, Notion, and Notes",  iconBg: "#7A6020", iconColor: "#FFFFFF", sourceColor: "#7A6020" },
  { Icon: FileText,        title: "Documents &\nVisas",          sub: "Visas, tickets, insurance, and other important documents.", source: "From PDF, Photos, and Files",          iconBg: "#B8524A", iconColor: "#FFFFFF", sourceColor: "#B8524A" },
  { Icon: ListChecks,      title: "Packing Lists &\nReminders",  sub: "Packing lists, notes, and important reminders.",            source: "From Notes and Notion",                iconBg: "#6B5080", iconColor: "#FFFFFF", sourceColor: "#6B5080" },
];

const IMPORT_SOURCES = [
  { image: require("../assets/safar_import_logos/google_docs.png"), label: "Google Docs" },
  { image: require("../assets/safar_import_logos/gmail.png"),       label: "Gmail" },
  { image: require("../assets/safar_import_logos/notion.png"),      label: "Notion" },
  { image: require("../assets/safar_import_logos/apple_notes.png"), label: "Apple Notes" },
  { image: require("../assets/safar_import_logos/pdf.png"),         label: "PDF" },
  { image: require("../assets/safar_import_logos/photos.png"),      label: "Photos" },
  { image: require("../assets/safar_import_logos/files.png"),       label: "Files" },
];

// ── Progress bar ──────────────────────────────────────────────────────────────
function StepBar({ current }) {
  return (
    <View style={pb.wrap}>
      <View style={pb.steps}>
        {STEPS.map((name, i) => (
          <View key={i} style={pb.stepCol}>
            <View style={i < current ? [pb.dot, pb.dotDone] : i === current ? [pb.dot, pb.dotActive] : pb.dot} />
            <Text style={i <= current ? [pb.stepLabel, pb.stepLabelActive] : pb.stepLabel}>{name}</Text>
          </View>
        ))}
      </View>
      <View style={pb.track}>
        <View style={[pb.fill, { width: Math.round((current / (STEPS.length - 1)) * 100) + "%" }]} />
      </View>
    </View>
  );
}
const pb = StyleSheet.create({
  wrap:            { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  steps:           { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  stepCol:         { alignItems: "center", gap: 4 },
  dot:             { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(200,169,106,0.35)" },
  dotActive:       { backgroundColor: "#C8A96A", width: 10, height: 10, borderRadius: 5 },
  dotDone:         { backgroundColor: "#C8A96A" },
  stepLabel:       { fontSize: 11, color: "#C8BFB2", fontWeight: "500" },
  stepLabelActive: { color: "#4A5C48", fontWeight: "700" },
  track:           { height: 3, backgroundColor: "rgba(200,169,106,0.25)", borderRadius: 2, overflow: "hidden" },
  fill:            { height: "100%", backgroundColor: "#C8A96A", borderRadius: 2 },
});

// ── Extracted field row ───────────────────────────────────────────────────────
function FieldRow({ label, value, editable, onChange }) {
  if (!value && !editable) return null;
  return (
    <View style={fr.row}>
      <Text style={fr.label}>{label}</Text>
      {editable
        ? <TextInput style={fr.input} value={value ?? ""} onChangeText={onChange} placeholderTextColor="#8A7D6A" />
        : <Text style={fr.value}>{value || "\u2014"}</Text>
      }
    </View>
  );
}
const fr = StyleSheet.create({
  row:   { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EDE4D4", gap: 12 },
  label: { fontSize: 13, fontWeight: "700", color: "#8A7D6A", letterSpacing: 0.5, width: 96, flexShrink: 0, textTransform: "uppercase" },
  value: { flex: 1, fontFamily: SERIF, fontSize: 16, color: "#1A1410" },
  input: { flex: 1, fontFamily: SERIF, fontSize: 16, color: "#1A1410", borderBottomWidth: 1.5, borderBottomColor: "#4A5C48", paddingVertical: 2 },
});

// ── Review section card ──────────────────────────────────────────────────────
function ReviewSection({ icon, title, children }) {
  return (
    <View style={rs.card}>
      <View style={rs.header}>
        <Text style={rs.icon}>{icon}</Text>
        <Text style={rs.title}>{title}</Text>
      </View>
      <View style={rs.body}>{children}</View>
    </View>
  );
}
const rs = StyleSheet.create({
  card:   { backgroundColor: "#FDFAF4", borderRadius: 16, borderWidth: 1, borderColor: "#EDE4D4", marginBottom: 12, shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: "#EDE4D4" },
  icon:   { fontSize: 20 },
  title:  { fontFamily: SERIF, fontSize: 18, color: "#1A1410", fontWeight: "600" },
  body:   { paddingHorizontal: 16 },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function SafarAssistScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [step,       setStep]       = useState(0);  // 0=Welcome 1=Add 2=Processing 3=Review 4=Done
  const [inputText,    setInputText]    = useState("");
  const [inputMode,    setInputMode]    = useState("options"); // "options" | "paste" | "processing-file"
  const [pickedFile,   setPickedFile]   = useState(null); // { name, uri, type }
  const [extracted,  setExtracted]  = useState(null);
  const [error,      setError]      = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [editMode,   setEditMode]   = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const fade = (cb) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      cb();
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  const goNext = (n) => fade(() => setStep(n ?? step + 1));

  // Voice input — uses expo-speech-recognition, graceful fallback to paste
  const startVoiceInput = async () => {
    let SR;
    try { SR = require("expo-speech-recognition"); } catch (_) {}
    if (!SR) {
      setInputMode("paste");
      return;
    }
    try {
      const result = await SR.ExpoSpeechRecognitionModule?.startListeningAsync?.({
        lang: "en-US",
        interimResults: false,
      });
      if (result?.value) {
        setInputText(result.value);
        setInputMode("paste");
      }
    } catch (_) {
      setInputMode("paste");
    }
  };

  // ── Pick a document (PDF, txt, docx) ────────────────────────────────────────
  const pickDocument = async () => {
    if (!DocumentPicker) {
      Alert.alert("Not available", "Please install expo-document-picker:\n\nnpx expo install expo-document-picker");
      return;
    }
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "text/plain", "text/html",
               "application/msword",
               "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets?.[0] ?? result;
      setPickedFile({ name: asset.name, uri: asset.uri, type: asset.mimeType ?? "unknown" });
      if (asset.mimeType === "text/plain" || asset.name?.endsWith(".txt")) {
        const text = await fetch(asset.uri).then(r => r.text());
        setInputText(text);
        setInputMode("paste");
      } else {
        setInputText(`[File selected: ${asset.name}]\n\nReading document...`);
        await runFileExtraction(asset);
      }
    } catch (err) {
      Alert.alert("Couldn't open file", err.message ?? "Please try a different file.");
    }
  };

  // ── Pick a photo/screenshot ───────────────────────────────────────────────
  const pickImage = async () => {
    if (!ImagePicker) {
      Alert.alert("Dev build required", "Photo import needs a development build.\n\nInstall with:\nnpx expo install expo-image-picker\n\nFor now, use a PDF or paste the text from your email.");
      return;
    }
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission needed", "Allow photo access to import booking screenshots.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
        base64: true,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      setPickedFile({ name: "booking_screenshot.jpg", uri: asset.uri, type: "image/jpeg" });
      await runImageExtraction(asset.base64, asset.uri);
    } catch (err) {
      Alert.alert("Couldn't open photo", err.message ?? "Please try again.");
    }
  };

  // ── Extract from image (base64) ───────────────────────────────────────────
  const runImageExtraction = async (base64Data, uri) => {
    goNext(2);
    setError(null);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64Data } },
              { type: "text", text: "Extract the booking details from this image." },
            ],
          }],
        }),
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const raw  = data.content?.find(b => b.type === "text")?.text ?? "";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setExtracted(parsed);
      goNext(3);
    } catch (err) {
      setError(err.message ?? "Couldn't read the image. Try pasting the text instead.");
      goNext(1);
    }
  };

  // ── Extract from file (PDF etc — send file content description) ──────────
  const runFileExtraction = async (asset) => {
    goNext(2);
    setError(null);
    try {
      let fileContent = "";
      try {
        fileContent = await fetch(asset.uri).then(r => r.text());
      } catch (_) {
        fileContent = `[${asset.name} — ${asset.mimeType}]`;
      }
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: `Document filename: ${asset.name}\n\nContent:\n${fileContent.slice(0, 8000)}` }],
        }),
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const raw  = data.content?.find(b => b.type === "text")?.text ?? "";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setExtracted(parsed);
      goNext(3);
    } catch (err) {
      setError(err.message ?? "Couldn't read the file. Try pasting the text instead.");
      goNext(1);
      setInputMode("paste");
    }
  };

  // ── Call Claude API (text) ────────────────────────────────────────────────
  const runExtraction = async () => {
    if (!inputText.trim()) {
      Alert.alert("Nothing to read", "Please paste your booking confirmation text first.");
      return;
    }
    goNext(2);
    setError(null);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: inputText.trim() }],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const raw  = data.content?.find(b => b.type === "text")?.text ?? "";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setExtracted(parsed);
      goNext(3);
    } catch (err) {
      setError(err.message ?? "Something went wrong. Please try again.");
      goNext(1);
    }
  };

  // ── Save to AsyncStorage ──────────────────────────────────────────────────
  const saveToApp = async () => {
    if (!extracted) return;
    setSaving(true);
    try {
      const saves = [];

      // 1. Departure date
      if (extracted.departure?.date) {
        saves.push(AsyncStorage.setItem(DEPARTURE_KEY, extracted.departure.date));
      }

      // 2. Contacts — hotel, airline, agent, group leader
      const currentContacts = JSON.parse(await AsyncStorage.getItem(CONTACTS_KEY) ?? "[]");
      const newContacts = [...currentContacts];

      const addContact = (name, role, phone, email) => {
        if (!name) return;
        newContacts.push({
          id: `import_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
          name, role,
          phone: phone ?? "",
          email: email ?? "",
          whatsapp: "",
          notes: "Added from booking import",
          starred: false,
          createdAt: new Date().toISOString(),
        });
      };

      addContact(extracted.hotel?.name,   "Hotel",         extracted.hotel?.phone,   null);
      addContact(extracted.airline?.name, "Airline",       extracted.airline?.phone, null);
      addContact(extracted.agent?.name,   "Travel Agent",  extracted.agent?.phone,   extracted.agent?.email);
      addContact(extracted.group?.leader, "Group Leader",  extracted.group?.phone,   null);

      if (newContacts.length > currentContacts.length) {
        saves.push(AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(newContacts)));
      }

      // 3. Board — pin a trip summary card
      const currentBoard = JSON.parse(await AsyncStorage.getItem(BOARD_KEY) ?? "[]");
      const summaryLines = [
        extracted.departure?.date  ? `Departure: ${extracted.departure.date}${extracted.departure.flight ? " \u00b7 " + extracted.departure.flight : ""}` : null,
        extracted.hotel?.name      ? `Hotel: ${extracted.hotel.name}` : null,
        extracted.airline?.bookingRef ? `Booking ref: ${extracted.airline.bookingRef}` : null,
        extracted.visaNo           ? `Visa: ${extracted.visaNo}` : null,
        extracted.notes            ? extracted.notes : null,
      ].filter(Boolean).join("\n");

      const tripCard = {
        id:        `trip_import_${Date.now()}`,
        type:      "note",
        title:     "My Trip Details",
        text:      summaryLines,
        pinned:    true,
        createdAt: new Date().toISOString(),
      };
      saves.push(AsyncStorage.setItem(BOARD_KEY, JSON.stringify([tripCard, ...currentBoard])));

      // 4. Calendar entries — add hotel check-in/out and return date
      const currentCal = JSON.parse(await AsyncStorage.getItem(CAL_KEY) ?? "{}");
      const newCal = { ...currentCal };

      const addCalEntry = (date, note) => {
        if (!date || !note) return;
        newCal[date] = [...(newCal[date] ?? []), note];
      };

      addCalEntry(extracted.departure?.date,  `Departure${extracted.departure?.flight ? " \u00b7 " + extracted.departure.flight : ""}`);
      addCalEntry(extracted.return?.date,     `Return flight${extracted.return?.flight ? " \u00b7 " + extracted.return.flight : ""}`);
      addCalEntry(extracted.hotel?.checkIn,   `Hotel check-in \u00b7 ${extracted.hotel?.name ?? ""}`);
      addCalEntry(extracted.hotel?.checkOut,  `Hotel check-out \u00b7 ${extracted.hotel?.name ?? ""}`);

      if (Object.keys(newCal).length > Object.keys(currentCal).length) {
        saves.push(AsyncStorage.setItem(CAL_KEY, JSON.stringify(newCal)));
      }

      await Promise.all(saves);
      await AsyncStorage.removeItem("safar_import_dismissed_v1");
      goNext(4);
    } catch (err) {
      Alert.alert("Save error", "Something went wrong saving your trip details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Render steps ──────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />

      {/* ── Hub Header ── */}
      {step === 0 && (
        <View style={s.header}>
          <Image
            source={require("../assets/safar-assist-card3.png")}
            style={s.headerImg}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.10)", "rgba(30,28,20,0.72)", "rgba(30,28,20,0.96)"]}
            locations={[0, 0.35, 0.75, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={s.headerGradient}
          />
          <View style={[s.headerContent, { paddingTop: insets.top + 12 }]}>
            <TouchableOpacity
              style={s.headerBackBtn}
              onPress={() => navigation?.goBack?.()}
              activeOpacity={0.8}
            >
              <CaretLeft size={20} color="#FFFFFF" weight="bold" />
            </TouchableOpacity>
            <View style={s.headerBottom}>
              <View style={s.headerTitleRow}>
                <View style={s.headerIconCircle}>
                  <Sparkle size={22} color="#C8A96A" weight="regular" />
                </View>
                <Text style={s.headerTitle}>Safar Assist</Text>
              </View>
              <Text style={s.headerSub}>Bring your journey into Safar</Text>
            </View>
          </View>
        </View>
      )}
      {step > 0 && (
        <View style={[s.compactHeader, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            style={s.compactBackBtn}
            onPress={() => goNext(Math.max(0, step - 1))}
            activeOpacity={0.8}
          >
            <CaretLeft size={20} color="#1A1410" weight="bold" />
          </TouchableOpacity>
          <Text style={s.compactTitle}>Safar Assist</Text>
          <View style={{ width: 36 }} />
        </View>
      )}

      {/* Step bar — shown on steps 1+ */}
      {step > 0 && <StepBar current={step} />}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>

          {/* ── Step 0: Welcome landing ──────────────────────────────────── */}
          {step === 0 && (
            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

              <Text style={s.heroBody}>{"Import your travel plans once. Safar Assist automatically organizes your itinerary, contacts, reminders, checklists, and travel documents—all in one place."}</Text>

              {/* Import from */}
              <Text style={s.sectionTitle}>Import from</Text>
              <View style={s.importRow}>
                {IMPORT_SOURCES.map((src, i) => (
                  <View key={i} style={s.importItem}>
                    <Image source={src.image} style={s.importLogo} resizeMode="contain" />
                    <Text style={s.importLabel}>{src.label}</Text>
                  </View>
                ))}
              </View>

              {/* CTA */}
              <TouchableOpacity style={s.primaryBtn} onPress={() => goNext(1)} activeOpacity={0.88}>
                <Sparkle size={20} color="#FFFFFF" weight="regular" />
                <Text style={s.primaryBtnTxt}>Bring My Journey Into Safar</Text>
                <CaretRight size={18} color="#FFFFFF" weight="bold" />
              </TouchableOpacity>

              <View style={s.trustBlock}>
                <View style={s.trustLine}><Timer size={14} color="#8A7D6A" weight="regular" /><Text style={s.trustLineTxt}>Takes about 30 seconds</Text></View>
                <View style={s.trustLine}><ShieldCheck size={14} color="#8A7D6A" weight="regular" /><Text style={s.trustLineTxt}>{"Your data stays private \u00b7 You\u2019re always in control"}</Text></View>
              </View>

              <View style={s.sectionDivider} />

              {/* Organize features */}
              <Text style={s.sectionTitle}>Safar will automatically organize</Text>
              <View style={s.featureGrid}>
                {ORGANIZE_FEATURES.map((f, i) => (
                  <View key={i} style={s.featureCard}>
                    <View style={[s.featureIconWrap, { backgroundColor: f.iconBg + "18" }]}>
                      <f.Icon size={24} color={f.iconBg} weight="regular" />
                    </View>
                    <Text style={s.featureTitle}>{f.title}</Text>
                    <Text style={s.featureSub}>{f.sub}</Text>
                    <Text style={[s.featureSource, { color: f.sourceColor }]}>{f.source}</Text>
                  </View>
                ))}
              </View>

              <View style={{ height: 32 }} />
            </ScrollView>
          )}

          {/* ── Step 1: Choose input method ───────────────────────────────── */}
          {step === 1 && (
            inputMode === "options" ? (
              <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
                <Text style={s.stepTitle}>Add your booking</Text>
                <Text style={s.stepSub}>Add flights, hotels, contacts, and group details in seconds.</Text>
                <TouchableOpacity style={s.optionCard} onPress={startVoiceInput} activeOpacity={0.8}>
                  <View style={s.optionIconWrap}><Microphone size={22} color="#C8A96A" weight="regular" /></View>
                  <View style={s.optionText}><Text style={s.optionTitle}>Speak your details</Text><Text style={s.optionSub}>Say your flight number, hotel, dates or group leader name</Text></View>
                  <CaretRight size={18} color="#C8BFB2" weight="bold" />
                </TouchableOpacity>
                <TouchableOpacity style={s.optionCard} onPress={pickDocument} activeOpacity={0.8}>
                  <View style={s.optionIconWrap}><UploadSimple size={22} color="#C8A96A" weight="regular" /></View>
                  <View style={s.optionText}><Text style={s.optionTitle}>Upload a file</Text><Text style={s.optionSub}>PDF, Word doc or text file from your phone</Text></View>
                  <CaretRight size={18} color="#C8BFB2" weight="bold" />
                </TouchableOpacity>
                <TouchableOpacity style={s.optionCard} onPress={pickImage} activeOpacity={0.8}>
                  <View style={s.optionIconWrap}><Camera size={22} color="#C8A96A" weight="regular" /></View>
                  <View style={s.optionText}><Text style={s.optionTitle}>Scan a screenshot</Text><Text style={s.optionSub}>Take a photo or choose from your camera roll</Text></View>
                  <CaretRight size={18} color="#C8BFB2" weight="bold" />
                </TouchableOpacity>
                <TouchableOpacity style={s.optionCard} onPress={() => setInputMode("paste")} activeOpacity={0.8}>
                  <View style={s.optionIconWrap}><ClipboardText size={22} color="#C8A96A" weight="regular" /></View>
                  <View style={s.optionText}><Text style={s.optionTitle}>Paste confirmation text</Text><Text style={s.optionSub}>Copy and paste from your email or booking portal</Text></View>
                  <CaretRight size={18} color="#C8BFB2" weight="bold" />
                </TouchableOpacity>
                {error ? <View style={s.errorCard}><Text style={s.errorTxt}>{error}</Text></View> : null}
                <View style={{ height: 40 }} />
              </ScrollView>
            ) : (
              <>
                <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                  <TouchableOpacity onPress={() => setInputMode("options")} style={s.backToOptions}>
                    <Text style={s.backToOptionsTxt}>{"\u2039  Other options"}</Text>
                  </TouchableOpacity>
                  <View style={s.pasteWrap}>
                    <TextInput
                      style={s.pasteInput}
                      multiline
                      placeholder={"Paste your booking confirmation here...\n\nWorks with:\n\u2022 Airline e-tickets\n\u2022 Hotel confirmations\n\u2022 Hajj group bookings\n\u2022 Nusuk portal confirmations"}
                      placeholderTextColor="#8A7D6A"
                      value={inputText}
                      onChangeText={setInputText}
                      textAlignVertical="top"
                      autoCorrect={false}
                      autoCapitalize="none"
                    />
                    {inputText.length > 0 ? <TouchableOpacity style={s.clearPaste} onPress={() => setInputText("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}><Text style={s.clearPasteTxt}>{"\u2715 Clear"}</Text></TouchableOpacity> : null}
                  </View>
                  {error ? <View style={s.errorCard}><Text style={s.errorTxt}>{error}</Text></View> : null}
                  <View style={{ height: 16 }} />
                </ScrollView>
                <View style={s.stickyFooter}>
                  <TouchableOpacity
                    style={inputText.trim() ? s.primaryBtn : [s.primaryBtn, s.primaryBtnDisabled]}
                    onPress={runExtraction}
                    activeOpacity={0.88}
                    disabled={!inputText.trim()}
                  >
                    <Text style={s.primaryBtnTxt}>Read my booking</Text>
                    <CaretRight size={18} color="#FFFFFF" weight="bold" />
                  </TouchableOpacity>
                  <View style={s.footerNote}>
                    <ShieldCheck size={14} color="#8A7D6A" weight="regular" />
                    <Text style={s.footerNoteTxt}>{"Your document is sent securely to Anthropic\u2019s Claude API. Safar never stores it."}</Text>
                  </View>
                </View>
              </>
            )
          )}

          {/* ── Step 2: Processing ────────────────────────────────────────── */}
          {step === 2 && (
            <View style={s.processingWrap}>
              <View style={s.processingCard}>
                <ActivityIndicator size="large" color="#4A5C48" style={{ marginBottom: 24 }} />
                <Text style={s.processingTitle}>Reading your booking\u2026</Text>
                {[
                  "Scanning for dates and flights",
                  "Finding hotel details",
                  "Looking for contact numbers",
                  "Organising your trip",
                ].map((msg, i) => (
                  <Text key={i} style={s.processingStep}>{"\u00b7  " + msg}</Text>
                ))}
                <Text style={s.processingNote}>
                  This usually takes 5\u201310 seconds.
                </Text>
              </View>
            </View>
          )}

          {/* ── Step 3: Review ────────────────────────────────────────────── */}
          {step === 3 && extracted && (
            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
              <View style={s.reviewHeader}>
                <Text style={s.stepTitle}>Review your trip</Text>
                <TouchableOpacity onPress={() => setEditMode(v => !v)} style={s.editToggle}>
                  <PencilSimple size={14} color="#4A5C48" weight="bold" />
                  <Text style={s.editToggleTxt}>{editMode ? "Done editing" : "Edit"}</Text>
                </TouchableOpacity>
              </View>
              <Text style={s.stepSub}>
                Check the details below. Tap \u201cEdit\u201d to correct anything before saving.
              </Text>

              {(extracted.departure?.date || extracted.return?.date) ? (
                <ReviewSection icon={"\u2708\uFE0F"} title={"Flights"}>
                  <FieldRow label="Departure" value={extracted.departure?.date} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, departure: { ...p.departure, date: v } }))} />
                  <FieldRow label="Flight no." value={extracted.departure?.flight} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, departure: { ...p.departure, flight: v } }))} />
                  <FieldRow label="From" value={extracted.departure?.from} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, departure: { ...p.departure, from: v } }))} />
                  <FieldRow label="Return" value={extracted.return?.date} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, return: { ...p.return, date: v } }))} />
                  <FieldRow label="Return flt." value={extracted.return?.flight} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, return: { ...p.return, flight: v } }))} />
                  <FieldRow label="Booking ref" value={extracted.airline?.bookingRef} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, airline: { ...p.airline, bookingRef: v } }))} />
                </ReviewSection>
              ) : null}

              {extracted.hotel?.name ? (
                <ReviewSection icon={"\uD83C\uDFE8"} title={"Hotel"}>
                  <FieldRow label="Hotel" value={extracted.hotel?.name} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, hotel: { ...p.hotel, name: v } }))} />
                  <FieldRow label="City" value={extracted.hotel?.city} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, hotel: { ...p.hotel, city: v } }))} />
                  <FieldRow label="Check-in" value={extracted.hotel?.checkIn} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, hotel: { ...p.hotel, checkIn: v } }))} />
                  <FieldRow label="Check-out" value={extracted.hotel?.checkOut} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, hotel: { ...p.hotel, checkOut: v } }))} />
                  <FieldRow label="Phone" value={extracted.hotel?.phone} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, hotel: { ...p.hotel, phone: v } }))} />
                  <FieldRow label="Confirm. no" value={extracted.hotel?.confirmationNo} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, hotel: { ...p.hotel, confirmationNo: v } }))} />
                </ReviewSection>
              ) : null}

              {(extracted.agent?.name || extracted.group?.name) ? (
                <ReviewSection icon={"\uD83D\uDC64"} title={"Agent & Group"}>
                  <FieldRow label="Agent" value={extracted.agent?.name} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, agent: { ...p.agent, name: v } }))} />
                  <FieldRow label="Phone" value={extracted.agent?.phone} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, agent: { ...p.agent, phone: v } }))} />
                  <FieldRow label="Email" value={extracted.agent?.email} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, agent: { ...p.agent, email: v } }))} />
                  <FieldRow label="Group" value={extracted.group?.name} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, group: { ...p.group, name: v } }))} />
                  <FieldRow label="Leader" value={extracted.group?.leader} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, group: { ...p.group, leader: v } }))} />
                  <FieldRow label="Leader ph." value={extracted.group?.phone} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, group: { ...p.group, phone: v } }))} />
                </ReviewSection>
              ) : null}

              {(extracted.visaNo || extracted.passengerName) ? (
                <ReviewSection icon={"\uD83D\uDEC2"} title={"Traveller"}>
                  <FieldRow label="Name" value={extracted.passengerName} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, passengerName: v }))} />
                  <FieldRow label="Visa no." value={extracted.visaNo} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, visaNo: v }))} />
                </ReviewSection>
              ) : null}

              {extracted.notes ? (
                <ReviewSection icon={"\uD83D\uDCCB"} title={"Other details"}>
                  <FieldRow label="Notes" value={extracted.notes} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, notes: v }))} />
                </ReviewSection>
              ) : null}

              {/* What will be saved */}
              <View style={s.savePreviewCard}>
                <Text style={s.savePreviewTitle}>What will be saved to Safar</Text>
                {extracted.departure?.date ? <Text style={s.saveItem}>Departure date \u2192 Journey calendar</Text> : null}
                {extracted.hotel?.name     ? <Text style={s.saveItem}>Hotel \u2192 Contacts</Text> : null}
                {extracted.agent?.name     ? <Text style={s.saveItem}>Travel agent \u2192 Contacts</Text> : null}
                {extracted.airline?.name   ? <Text style={s.saveItem}>Airline \u2192 Contacts</Text> : null}
                {extracted.group?.leader   ? <Text style={s.saveItem}>Group leader \u2192 Contacts</Text> : null}
                <Text style={s.saveItem}>Trip summary \u2192 Journey Board (pinned)</Text>
              </View>

              <TouchableOpacity style={s.primaryBtn} onPress={saveToApp} activeOpacity={0.88} disabled={saving}>
                {saving
                  ? <ActivityIndicator color="#FFFFFF" />
                  : <>
                      <CheckCircle size={20} color="#FFFFFF" weight="bold" />
                      <Text style={s.primaryBtnTxt}>Save to Safar</Text>
                    </>
                }
              </TouchableOpacity>

              <TouchableOpacity style={s.ghostBtn} onPress={() => goNext(1)}>
                <Text style={s.ghostBtnTxt}>{"\u2190 Try a different document"}</Text>
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </ScrollView>
          )}

          {/* ── Step 4: Done ──────────────────────────────────────────────── */}
          {step === 4 && (
            <View style={s.doneWrap}>
              <View style={s.doneCard}>
                <CheckCircle size={56} color="#4A5C48" weight="regular" />
                <Text style={s.doneTitle}>Your trip is set up</Text>
                <Text style={s.doneSub}>
                  Your journey details have been saved. Check My Journey to see your departure countdown, and My Contacts for your hotel and agent.
                </Text>

                <View style={s.doneDivider} />

                <Text style={s.doneQuote}>
                  {"\u201cAnd proclaim to the people the Hajj; they will come to you on foot and on every lean camel.\u201d"}
                </Text>
                <Text style={s.doneRef}>Al-Hajj 22:27</Text>

                <TouchableOpacity style={[s.primaryBtn, { marginTop: 28, marginBottom: 0, width: "100%" }]}
                  onPress={() => navigation?.goBack?.()}
                  activeOpacity={0.88}>
                  <Text style={s.primaryBtnTxt}>Go to My Journey</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F0E8" },

  // Hub header
  header:       { height: 260, overflow: "hidden" },
  headerImg:    { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" },
  headerGradient: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  headerContent:  { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 22 },
  headerBackBtn:  { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.25)", alignItems: "center", justifyContent: "center", alignSelf: "flex-start" },
  headerBottom:     { gap: 4 },
  headerTitleRow:   { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  headerIconCircle: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: "#C8A96A", alignItems: "center", justifyContent: "center" },
  headerTitle:  { fontFamily: SERIF, fontSize: 38, color: "#FFFFFF", fontWeight: "600" },
  headerSub:    { fontSize: 15, color: "rgba(255,255,255,0.82)", lineHeight: 22 },

  // Scroll
  scroll: { paddingHorizontal: 20, paddingTop: 16 },

  // Section headers
  sectionTitle: { fontFamily: SERIF, fontSize: 20, color: "#1A1410", fontWeight: "600", marginBottom: 4, marginTop: 12 },
  sectionSub:   { fontSize: 14, color: "#5C534A", lineHeight: 20, marginBottom: 16 },

  // Feature cards (grid)
  featureCard:   { width: "47%", flexGrow: 1, backgroundColor: "#FDFAF4", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#EDE4D4", shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  featureIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#EBF2EE", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  featureTitle:  { fontSize: 16, fontWeight: "700", color: "#1A1410", marginBottom: 6, lineHeight: 22 },
  featureSub:    { fontSize: 13, color: "#5C534A", lineHeight: 18, marginBottom: 8 },
  featureSource: { fontSize: 13, color: "#4A5C48", fontWeight: "600" },

  // Step titles
  stepTitle: { fontFamily: SERIF, fontSize: 28, color: "#1A1410", fontWeight: "600", marginBottom: 8, lineHeight: 34 },
  stepSub:   { fontSize: 15, color: "#5C534A", fontWeight: "400", lineHeight: 22, marginBottom: 20 },

  // Option tiles (step 1)
  optionCard:     { flexDirection: "row", alignItems: "center", backgroundColor: "#FDFAF4", borderRadius: 16, borderWidth: 1, borderColor: "#EDE4D4", padding: 18, marginBottom: 12, gap: 14, shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  optionIconWrap: { width: 48, height: 48, borderRadius: 14, backgroundColor: "#4A5C48", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  optionText:     { flex: 1 },
  optionTitle:    { fontSize: 17, fontWeight: "600", color: "#1A1410", marginBottom: 3 },
  optionSub:      { fontSize: 14, color: "#5C534A", lineHeight: 19 },
  backToOptions:  { paddingVertical: 10, marginBottom: 8 },
  backToOptionsTxt: { fontSize: 15, color: "#4A5C48", fontWeight: "600" },

  // Paste input
  pasteWrap:    { backgroundColor: "#FDFAF4", borderRadius: 16, borderWidth: 1.5, borderColor: "#EDE4D4", marginBottom: 16, minHeight: 200 },
  pasteInput:   { fontSize: 15, color: "#1A1410", lineHeight: 22, padding: 16, minHeight: 140, fontWeight: "400" },
  clearPaste:   { position: "absolute", top: 10, right: 12 },
  clearPasteTxt: { fontSize: 14, color: "#8A7D6A", fontWeight: "600" },

  // Sticky paste footer
  stickyFooter: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, backgroundColor: "#F5F0E8", borderTopWidth: 1, borderTopColor: "#EDE4D4" },

  // Buttons
  primaryBtn:         { backgroundColor: "#4A5C48", borderRadius: 16, paddingVertical: 18, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 10, marginBottom: 4, shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 },
  primaryBtnDisabled: { opacity: 0.35 },
  primaryBtnTxt:      { fontFamily: SERIF, fontSize: 17, color: "#FFFFFF", fontWeight: "700" },
  ghostBtn:           { paddingVertical: 14, alignItems: "center", marginBottom: 8 },
  ghostBtnTxt:        { fontSize: 15, color: "#8A7D6A", fontWeight: "500" },

  // Error
  errorCard: { backgroundColor: "rgba(180,60,40,0.08)", borderRadius: 12, borderWidth: 1, borderColor: "rgba(180,60,40,0.25)", padding: 14, marginBottom: 14 },
  errorTxt:  { fontSize: 14, color: "#A04030", fontWeight: "500", lineHeight: 20 },

  // Processing
  processingWrap:  { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  processingCard:  { backgroundColor: "#FDFAF4", borderRadius: 24, borderWidth: 1, borderColor: "#EDE4D4", padding: 32, width: "100%", alignItems: "center", shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 16, elevation: 5 },
  processingTitle: { fontFamily: SERIF, fontSize: 24, color: "#1A1410", fontWeight: "600", marginBottom: 24, textAlign: "center" },
  processingStep:  { fontSize: 15, color: "#5C534A", fontWeight: "400", marginBottom: 10, alignSelf: "flex-start" },
  processingNote:  { fontSize: 13, color: "#8A7D6A", marginTop: 20, textAlign: "center" },

  // Review
  reviewHeader:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  editToggle:     { backgroundColor: "#EBF2EE", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: "#4A5C48", flexDirection: "row", alignItems: "center", gap: 6 },
  editToggleTxt:  { fontSize: 14, color: "#4A5C48", fontWeight: "600" },

  // Save preview
  savePreviewCard:  { backgroundColor: "#EBF2EE", borderRadius: 16, borderWidth: 1, borderColor: "#4A5C48", padding: 18, marginBottom: 16 },
  savePreviewTitle: { fontFamily: SERIF, fontSize: 16, color: "#4A5C48", fontWeight: "600", marginBottom: 12 },
  saveItem:         { fontSize: 14, color: "#1A1410", fontWeight: "400", marginBottom: 8, lineHeight: 20 },

  // Done
  doneWrap:    { flex: 1, justifyContent: "center", padding: 24 },
  doneCard:    { backgroundColor: "#FDFAF4", borderRadius: 24, borderWidth: 1, borderColor: "#EDE4D4", padding: 32, alignItems: "center", shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 16, elevation: 5 },
  doneTitle:   { fontFamily: SERIF, fontSize: 28, color: "#1A1410", fontWeight: "600", marginBottom: 10, textAlign: "center", marginTop: 16 },
  doneSub:     { fontSize: 15, color: "#5C534A", fontWeight: "400", textAlign: "center", lineHeight: 22, marginBottom: 20 },
  doneDivider: { width: 40, height: 2, backgroundColor: "#C8A96A", borderRadius: 1, marginVertical: 16 },
  doneQuote:   { fontFamily: SERIF, fontSize: 16, color: "#5C534A", textAlign: "center", fontStyle: "italic", lineHeight: 24, marginBottom: 8 },
  doneRef:     { fontSize: 13, color: "#8A7D6A", fontWeight: "500" },

  // Hero body
  heroBody: { fontSize: 16, color: "#5C534A", lineHeight: 22, marginBottom: 8 },

  // Feature grid (2-up wrap)
  featureGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24, marginTop: 8 },

  // Trust block
  trustBlock:   { alignItems: "center", gap: 6, marginTop: 4, marginBottom: 28 },
  trustLine:    { flexDirection: "row", alignItems: "center", gap: 6 },
  trustLineTxt: { fontSize: 13, color: "#8A7D6A", fontWeight: "500" },

  // Section divider
  sectionDivider: { height: 1, backgroundColor: "#D4CCBC", marginHorizontal: 20, marginBottom: 8 },

  // Import sources grid
  importRow:    { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6, marginHorizontal: -12, marginBottom: 12, marginTop: 4 },
  importItem:    { alignItems: "center", width: 42 },
  importLogo:    { width: 36, height: 36, marginBottom: 6 },
  importLabel:   { fontSize: 12, color: "#5C534A", textAlign: "center", fontWeight: "500" },

  // Compact header (steps 1-4)
  compactHeader:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, backgroundColor: "#F5F0E8" },
  compactBackBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#FDFAF4", borderWidth: 1, borderColor: "#EDE4D4", alignItems: "center", justifyContent: "center" },
  compactTitle:   { fontFamily: SERIF, fontSize: 18, color: "#1A1410" },

  // Footer note
  footerNote:    { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8, marginBottom: 8 },
  footerNoteTxt: { fontSize: 13, color: "#8A7D6A", fontWeight: "400", lineHeight: 18 },
});
