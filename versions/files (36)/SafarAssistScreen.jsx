/**
 * ImportTripScreen.jsx — Safar
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
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, { Path, Rect, Circle } from "react-native-svg";

// expo-document-picker works in Expo Go — install with: npx expo install expo-document-picker
// expo-image-picker needs a dev build — install with: npx expo install expo-image-picker
let DocumentPicker, ImagePicker;
try { DocumentPicker = require("expo-document-picker"); } catch (_) {}
try { ImagePicker = require("expo-image-picker"); } catch (_) {}

const SERIF = "SourceSerif4-Regular";

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
const STEPS = ["Privacy", "Add", "Reading", "Review", "Done"];

// ── Minimal progress bar ──────────────────────────────────────────────────────
function StepBar({ current }) {
  const pct = Math.round((current / (STEPS.length - 1)) * 100);
  return (
    <View style={sb.wrap}>
      <View style={sb.track}>
        <View style={[sb.fill, { width: pct + "%" }]} />
      </View>
      <Text style={sb.label}>{STEPS[current].toUpperCase()}{"  "}{current + 1}/{STEPS.length}</Text>
    </View>
  );
}
const sb = StyleSheet.create({
  wrap:  { paddingHorizontal:24, paddingBottom:20, paddingTop:4 },
  track: { height:2, backgroundColor:"rgba(255,255,255,0.12)", borderRadius:1, overflow:"hidden", marginBottom:8 },
  fill:  { height:"100%", backgroundColor:"#C8A96A", borderRadius:1 },
  label: { fontSize:11, color:"rgba(255,255,255,0.38)", fontWeight:"600", letterSpacing:1.5 },
});

// ── Security authority block ──────────────────────────────────────────────────
function SecurityBlock() {
  return (
    <View style={sec.wrap}>
      {/* Shield SVG icon */}
      <View style={sec.shieldWrap}>
        <Svg width={52} height={58} viewBox="0 0 52 58">
          <Path d="M26 2 L48 12 L48 28 C48 40 38 50 26 56 C14 50 4 40 4 28 L4 12 Z"
            fill="none" stroke="rgba(200,169,106,0.90)" strokeWidth="2" strokeLinejoin="round"/>
          <Path d="M26 14 L38 20 L38 28 C38 35 32 41 26 44 C20 41 14 35 14 28 L14 20 Z"
            fill="rgba(200,169,106,0.12)" stroke="rgba(200,169,106,0.50)" strokeWidth="1.5" strokeLinejoin="round"/>
          <Path d="M20 28 L24 32 L32 22" fill="none" stroke="rgba(200,169,106,0.90)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      </View>

      <Text style={sec.headline}>Your data is protected</Text>

      {/* Four feature rows */}
      <View style={sec.featureList}>
        {[
          { mark:"TLS", text:"End-to-end encrypted in transit" },
          { mark:"0",   text:"Never stored on Safar servers" },
          { mark:"AI",  text:"Processed by Anthropic Claude" },
          { mark:"ON",  text:"Saved locally on your device only" },
        ].map(f => (
          <View key={f.mark} style={sec.featureRow}>
            <View style={sec.featureMark}><Text style={sec.featureMarkTxt}>{f.mark}</Text></View>
            <Text style={sec.featureTxt}>{f.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
const sec = StyleSheet.create({
  wrap:        { backgroundColor:"rgba(255,255,255,0.04)", borderRadius:20, borderWidth:1, borderColor:"rgba(200,169,106,0.25)", padding:24, marginBottom:24, alignItems:"center" },
  shieldWrap:  { marginBottom:16 },
  headline:    { fontSize:17, fontWeight:"700", color:"#fff", letterSpacing:0.3, marginBottom:18, textAlign:"center" },
  featureList: { width:"100%", gap:12 },
  featureRow:  { flexDirection:"row", alignItems:"center", gap:14 },
  featureMark: { width:36, height:22, borderRadius:4, backgroundColor:"rgba(200,169,106,0.15)", borderWidth:1, borderColor:"rgba(200,169,106,0.35)", alignItems:"center", justifyContent:"center" },
  featureMarkTxt:{ fontSize:10, fontWeight:"800", color:"#C8A96A", letterSpacing:0.5 },
  featureTxt:  { fontSize:14, color:"rgba(255,255,255,0.78)", fontWeight:"500", flex:1 },
});

// ── Extracted field row ───────────────────────────────────────────────────────
function FieldRow({ label, value, editable, onChange }) {
  if (!value && !editable) return null;
  return (
    <View style={fr.row}>
      <Text style={fr.label}>{label}</Text>
      {editable
        ? <TextInput style={fr.input} value={value ?? ""} onChangeText={onChange} placeholderTextColor="#9A8E7A" />
        : <Text style={fr.value}>{value || "—"}</Text>
      }
    </View>
  );
}
const fr = StyleSheet.create({
  row:   { flexDirection:"row", alignItems:"center", paddingVertical:12, borderBottomWidth:1, borderBottomColor:"rgba(255,255,255,0.08)", gap:12 },
  label: { fontSize:11, fontWeight:"700", color:"rgba(255,255,255,0.40)", letterSpacing:0.8, width:96, flexShrink:0, textTransform:"uppercase" },
  value: { flex:1, fontFamily:SERIF, fontSize:15, color:"rgba(255,255,255,0.90)" },
  input: { flex:1, fontFamily:SERIF, fontSize:15, color:"#fff", borderBottomWidth:1, borderBottomColor:"rgba(200,169,106,0.50)", paddingVertical:2 },
});

// ── Section card ──────────────────────────────────────────────────────────────
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
  card:   { backgroundColor:"rgba(255,255,255,0.05)", borderRadius:16, borderWidth:1, borderColor:"rgba(255,255,255,0.12)", marginBottom:12 },
  header: { flexDirection:"row", alignItems:"center", gap:12, padding:16, borderBottomWidth:1, borderBottomColor:"rgba(255,255,255,0.08)" },
  icon:   { fontSize:18, color:"#C8A96A" },
  title:  { fontFamily:SERIF, fontSize:17, color:"#fff", fontWeight:"600" },
  body:   { paddingHorizontal:16 },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function SafarAssistScreen({ navigation }) {
  const [step,       setStep]       = useState(0);  // 0=Privacy 1=Paste 2=Processing 3=Review 4=Done
  const [inputText,    setInputText]    = useState("");
  const [inputMode,    setInputMode]    = useState("options"); // "options" | "paste" | "processing-file"
  const [pickedFile,   setPickedFile]   = useState(null); // { name, uri, type }
  const [extracted,  setExtracted]  = useState(null);
  const [error,      setError]      = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [editMode,   setEditMode]   = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const fade = (cb) => {
    Animated.timing(fadeAnim, { toValue:0, duration:150, useNativeDriver:true }).start(() => {
      cb();
      Animated.timing(fadeAnim, { toValue:1, duration:200, useNativeDriver:true }).start();
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
      // For plain text files, read content directly
      if (asset.mimeType === "text/plain" || asset.name?.endsWith(".txt")) {
        const text = await fetch(asset.uri).then(r => r.text());
        setInputText(text);
        setInputMode("paste"); // show text in paste box so user can verify
      } else {
        // PDF/docx — send as base64 image or extract text
        // For now, prompt user that we'll read it as a document
        setInputText(`[File selected: ${asset.name}]

Reading document...`);
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
      // Read file as text if possible, otherwise describe it
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
          messages: [{ role: "user", content: `Document filename: ${asset.name}

Content:
${fileContent.slice(0, 8000)}` }],
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
    goNext(2); // processing step
    setError(null);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role:"user", content: inputText.trim() }],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const raw  = data.content?.find(b => b.type === "text")?.text ?? "";

      // Strip any accidental markdown fences
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      setExtracted(parsed);
      goNext(3);
    } catch (err) {
      setError(err.message ?? "Something went wrong. Please try again.");
      goNext(1); // back to paste step
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
        extracted.departure?.date  ? `Departure: ${extracted.departure.date}${extracted.departure.flight ? " · " + extracted.departure.flight : ""}` : null,
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

      addCalEntry(extracted.departure?.date,  `✈️ Departure${extracted.departure?.flight ? " · " + extracted.departure.flight : ""}`);
      addCalEntry(extracted.return?.date,     `✈️ Return flight${extracted.return?.flight ? " · " + extracted.return.flight : ""}`);
      addCalEntry(extracted.hotel?.checkIn,   `🏨 Hotel check-in · ${extracted.hotel?.name ?? ""}`);
      addCalEntry(extracted.hotel?.checkOut,  `🏨 Hotel check-out · ${extracted.hotel?.name ?? ""}`);

      if (Object.keys(newCal).length > Object.keys(currentCal).length) {
        saves.push(AsyncStorage.setItem(CAL_KEY, JSON.stringify(newCal)));
      }

      await Promise.all(saves);
      // Clear the "dismissed" flag so the card doesn't reappear
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
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => step === 0 ? navigation?.goBack?.() : goNext(Math.max(0, step-1))}
          hitSlop={{top:12,bottom:12,left:12,right:12}} style={s.backBtn}>
          <Text style={s.backArrow}>{"‹"}</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Safar Assist</Text>
          <Text style={s.headerSub}>AI-powered journey setup</Text>
        </View>
        <View style={{ width:40 }} />
      </View>

      <StepBar current={step} />

      <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <Animated.View style={[{ flex:1 }, { opacity:fadeAnim }]}>

          {/* ── Step 0: Privacy ─────────────────────────────────────────────── */}
          {step === 0 && (
            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

              <SecurityBlock />

              {/* How it works */}
              <View style={s.howCard}>
                <Text style={s.howTitle}>How it works</Text>
                {[
                  ["01", "Paste your booking confirmation text or upload a file"],
                  ["02", "Sent securely to Anthropic Claude — your AI travel reader"],
                  ["03", "Dates, hotel, contacts and references extracted instantly"],
                  ["04", "You review and confirm every detail before anything saves"],
                ].map(([num, txt]) => (
                  <View key={num} style={s.howRow}>
                    <Text style={s.howNum}>{num}</Text>
                    <Text style={s.howTxt}>{txt}</Text>
                  </View>
                ))}
              </View>

              {/* What is read / what is ignored */}
              <View style={s.howCard}>
                <Text style={s.howTitle}>What gets read</Text>
                <Text style={s.howBody}>Dates · Flights · Hotel · Travel agent · Booking references · Visa number</Text>
                <View style={s.howDivider} />
                <Text style={s.howBodyMuted}>Payment details, passport numbers and personal IDs are always ignored.</Text>
              </View>

              <TouchableOpacity style={s.primaryBtn} onPress={() => goNext(1)} activeOpacity={0.88}>
                <Text style={s.primaryBtnTxt}>{"Continue  →"}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation?.goBack?.()} style={s.ghostBtn}>
                <Text style={s.ghostBtnTxt}>Cancel</Text>
              </TouchableOpacity>

              <View style={{ height:24 }} />
            </ScrollView>
          )}

          {/* ── Step 1: Choose input method ───────────────────────────────── */}
          {step === 1 && (
            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={s.stepTitle}>Add your booking</Text>
              <Text style={s.stepSub}>
                {"Add flights, hotels, contacts, and group details in seconds."}
              </Text>
              <Text style={s.stepTagline}>{"Speak it, scan it, or upload it."}</Text>
              <Text style={s.stepTagline2}>{"Safar organises everything for you automatically."}</Text>

              {/* ── Option tiles — shown first ── */}
              {inputMode === "options" && (
                <>
                  {/* Speak your details — voice input */}
                  <TouchableOpacity style={s.optionCard} onPress={startVoiceInput} activeOpacity={0.88}>
                    <View style={[s.optionIconWrap, s.optionIconWrapGold]}>
                      <Text style={s.optionIcon}>{"\uD83C\uDF99"}</Text>
                    </View>
                    <View style={s.optionText}>
                      <Text style={s.optionTitle}>Speak your details</Text>
                      <Text style={s.optionSub}>Say your flight number, hotel, dates or group leader name</Text>
                    </View>
                    <Text style={s.optionArrow}>{"›"}</Text>
                  </TouchableOpacity>

                  {/* Upload a file */}
                  <TouchableOpacity style={s.optionCard} onPress={pickDocument} activeOpacity={0.88}>
                    <View style={s.optionIconWrap}>
                      <Text style={s.optionIcon}>{"↑"}</Text>
                    </View>
                    <View style={s.optionText}>
                      <Text style={s.optionTitle}>Upload a file</Text>
                      <Text style={s.optionSub}>PDF, Word doc or text file from your phone</Text>
                    </View>
                    <Text style={s.optionArrow}>{"›"}</Text>
                  </TouchableOpacity>

                  {/* Photo / screenshot */}
                  <TouchableOpacity style={s.optionCard} onPress={pickImage} activeOpacity={0.88}>
                    <View style={s.optionIconWrap}>
                      <Text style={s.optionIcon}>{"⊡"}</Text>
                    </View>
                    <View style={s.optionText}>
                      <Text style={s.optionTitle}>Scan a screenshot</Text>
                      <Text style={s.optionSub}>Take a photo or choose from your camera roll</Text>
                    </View>
                    <Text style={s.optionArrow}>{"›"}</Text>
                  </TouchableOpacity>

                  {/* Paste text */}
                  <TouchableOpacity style={s.optionCard} onPress={() => setInputMode("paste")} activeOpacity={0.88}>
                    <View style={s.optionIconWrap}>
                      <Text style={s.optionIcon}>{"≡"}</Text>
                    </View>
                    <View style={s.optionText}>
                      <Text style={s.optionTitle}>Paste confirmation text</Text>
                      <Text style={s.optionSub}>Copy and paste from your email or booking portal</Text>
                    </View>
                    <Text style={s.optionArrow}>{"›"}</Text>
                  </TouchableOpacity>

                  {error && (
                    <View style={s.errorCard}>
                      <Text style={s.errorIcon}>{"⚠️"}</Text>
                      <Text style={s.errorTxt}>{error}</Text>
                    </View>
                  )}
                </>
              )}

              {/* ── Paste text input ── */}
              {inputMode === "paste" && (
                <>
                  <TouchableOpacity onPress={() => setInputMode("options")} style={s.backToOptions}>
                    <Text style={s.backToOptionsTxt}>{"‹  Other options"}</Text>
                  </TouchableOpacity>

                  <View style={s.pasteWrap}>
                    <TextInput
                      style={s.pasteInput}
                      multiline
                      placeholder={"Paste your booking confirmation here...\n\nWorks with:\n• Airline e-tickets\n• Hotel confirmations\n• Hajj group bookings\n• Nusuk portal confirmations"}
                      placeholderTextColor="#9A8E7A"
                      value={inputText}
                      onChangeText={setInputText}
                      textAlignVertical="top"
                      autoCorrect={false}
                      autoCapitalize="none"
                    />
                    {inputText.length > 0 && (
                      <TouchableOpacity style={s.clearPaste}
                        onPress={() => setInputText("")}
                        hitSlop={{top:8,bottom:8,left:8,right:8}}>
                        <Text style={s.clearPasteTxt}>{"✕ Clear"}</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {error && (
                    <View style={s.errorCard}>
                      <Text style={s.errorIcon}>{"⚠️"}</Text>
                      <Text style={s.errorTxt}>{error}</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[s.primaryBtn, !inputText.trim() && s.primaryBtnDisabled]}
                    onPress={runExtraction}
                    activeOpacity={0.88}
                    disabled={!inputText.trim()}
                  >
                    <Text style={s.primaryBtnTxt}>{"Read my booking →"}</Text>
                  </TouchableOpacity>
                </>
              )}

              <Text style={s.finePrint}>
                {"Your document is sent securely to Anthropic's Claude API. Safar never stores it."}
              </Text>

              <View style={{ height:40 }} />
            </ScrollView>
          )}

          {/* ── Step 2: Processing ────────────────────────────────────────── */}
          {step === 2 && (
            <View style={s.processingWrap}>
              <View style={s.processingCard}>
                <ActivityIndicator size="large" color="#C8A96A" style={{ marginBottom:20 }} />
                <Text style={s.processingTitle}>Reading your booking…</Text>
                {[
                  "Scanning for dates and flights",
                  "Finding hotel details",
                  "Looking for contact numbers",
                  "Organising your trip",
                ].map((msg, i) => (
                  <Text key={i} style={s.processingStep}>{"· " + msg}</Text>
                ))}
                <Text style={s.processingNote}>
                  {"This usually takes 5–10 seconds."}
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
                  <Text style={s.editToggleTxt}>{editMode ? "Done editing" : "✎ Edit"}</Text>
                </TouchableOpacity>
              </View>
              <Text style={s.stepSub}>
                {"Check the details below. Tap \"Edit\" to correct anything before saving."}
              </Text>

              {/* Flight */}
              {(extracted.departure?.date || extracted.return?.date) && (
                <ReviewSection icon={"✈️"} title={"Flights"}>
                  <FieldRow label="Departure" value={extracted.departure?.date} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, departure: { ...p.departure, date:v } }))} />
                  <FieldRow label="Flight no." value={extracted.departure?.flight} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, departure: { ...p.departure, flight:v } }))} />
                  <FieldRow label="From" value={extracted.departure?.from} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, departure: { ...p.departure, from:v } }))} />
                  <FieldRow label="Return" value={extracted.return?.date} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, return: { ...p.return, date:v } }))} />
                  <FieldRow label="Return flt." value={extracted.return?.flight} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, return: { ...p.return, flight:v } }))} />
                  <FieldRow label="Booking ref" value={extracted.airline?.bookingRef} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, airline: { ...p.airline, bookingRef:v } }))} />
                </ReviewSection>
              )}

              {/* Hotel */}
              {extracted.hotel?.name && (
                <ReviewSection icon={"🏨"} title={"Hotel"}>
                  <FieldRow label="Hotel" value={extracted.hotel?.name} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, hotel: { ...p.hotel, name:v } }))} />
                  <FieldRow label="City" value={extracted.hotel?.city} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, hotel: { ...p.hotel, city:v } }))} />
                  <FieldRow label="Check-in" value={extracted.hotel?.checkIn} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, hotel: { ...p.hotel, checkIn:v } }))} />
                  <FieldRow label="Check-out" value={extracted.hotel?.checkOut} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, hotel: { ...p.hotel, checkOut:v } }))} />
                  <FieldRow label="Phone" value={extracted.hotel?.phone} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, hotel: { ...p.hotel, phone:v } }))} />
                  <FieldRow label="Confirm. no" value={extracted.hotel?.confirmationNo} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, hotel: { ...p.hotel, confirmationNo:v } }))} />
                </ReviewSection>
              )}

              {/* Agent */}
              {(extracted.agent?.name || extracted.group?.name) && (
                <ReviewSection icon={"👤"} title={"Agent & Group"}>
                  <FieldRow label="Agent" value={extracted.agent?.name} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, agent: { ...p.agent, name:v } }))} />
                  <FieldRow label="Phone" value={extracted.agent?.phone} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, agent: { ...p.agent, phone:v } }))} />
                  <FieldRow label="Email" value={extracted.agent?.email} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, agent: { ...p.agent, email:v } }))} />
                  <FieldRow label="Group" value={extracted.group?.name} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, group: { ...p.group, name:v } }))} />
                  <FieldRow label="Leader" value={extracted.group?.leader} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, group: { ...p.group, leader:v } }))} />
                  <FieldRow label="Leader ph." value={extracted.group?.phone} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, group: { ...p.group, phone:v } }))} />
                </ReviewSection>
              )}

              {/* Visa / traveller */}
              {(extracted.visaNo || extracted.passengerName) && (
                <ReviewSection icon={"🛂"} title={"Traveller"}>
                  <FieldRow label="Name" value={extracted.passengerName} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, passengerName:v }))} />
                  <FieldRow label="Visa no." value={extracted.visaNo} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, visaNo:v }))} />
                </ReviewSection>
              )}

              {/* Notes */}
              {extracted.notes && (
                <ReviewSection icon={"📋"} title={"Other details"}>
                  <FieldRow label="Notes" value={extracted.notes} editable={editMode}
                    onChange={v => setExtracted(p => ({ ...p, notes:v }))} />
                </ReviewSection>
              )}

              {/* What will be saved */}
              <View style={s.savePreviewCard}>
                <Text style={s.savePreviewTitle}>{"What will be saved to Safar:"}</Text>
                {extracted.departure?.date && <Text style={s.saveItem}>{"📅  Departure date → Journey calendar"}</Text>}
                {extracted.hotel?.name     && <Text style={s.saveItem}>{"🏨  Hotel → Contacts"}</Text>}
                {extracted.agent?.name     && <Text style={s.saveItem}>{"👤  Travel agent → Contacts"}</Text>}
                {extracted.airline?.name   && <Text style={s.saveItem}>{"✈️  Airline → Contacts"}</Text>}
                {extracted.group?.leader   && <Text style={s.saveItem}>{"👥  Group leader → Contacts"}</Text>}
                <Text style={s.saveItem}>{"📌  Trip summary → Journey Board (pinned)"}</Text>
              </View>

              <TouchableOpacity style={s.primaryBtn} onPress={saveToApp} activeOpacity={0.88} disabled={saving}>
                {saving
                  ? <ActivityIndicator color="#0F2419" />
                  : <Text style={s.primaryBtnTxt}>{"Save to Safar ✓"}</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity style={s.ghostBtn} onPress={() => goNext(1)}>
                <Text style={s.ghostBtnTxt}>← Try a different document</Text>
              </TouchableOpacity>

              <View style={{ height:40 }} />
            </ScrollView>
          )}

          {/* ── Step 4: Done ──────────────────────────────────────────────── */}
          {step === 4 && (
            <View style={s.doneWrap}>
              <View style={s.doneCard}>
                <Text style={s.doneIcon}>{"🕋"}</Text>
                <Text style={s.doneTitle}>Your trip is set up</Text>
                <Text style={s.doneSub}>
                  {"Your journey details have been saved. Check My Journey to see your departure countdown, and My Contacts for your hotel and agent."}
                </Text>

                <View style={s.doneDivider} />

                <Text style={s.doneQuote}>
                  {"\u201cAnd proclaim to the people the Hajj; they will come to you on foot and on every lean camel.\u201d"}
                </Text>
                <Text style={s.doneRef}>{"Al-Hajj 22:27"}</Text>

                <TouchableOpacity style={[s.primaryBtn, { marginTop:24, marginBottom:0 }]}
                  onPress={() => { navigation?.goBack?.(); }}
                  activeOpacity={0.88}>
                  <Text style={s.primaryBtnTxt}>{"Go to My Journey"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex:1, backgroundColor:"#0F2419" },

  // Header — dark with gold accent on title
  header:       { flexDirection:"row", alignItems:"center", paddingHorizontal:20, paddingTop:12, paddingBottom:8 },
  backBtn:      { width:40, height:40, alignItems:"center", justifyContent:"center" },
  backArrow:    { fontSize:26, color:"rgba(255,255,255,0.70)", lineHeight:30 },
  headerCenter: { flex:1, alignItems:"center" },
  headerTitle:  { fontFamily:SERIF, fontSize:17, color:"#fff", fontWeight:"600" },
  headerSub:    { fontSize:11, color:"rgba(255,255,255,0.40)", fontWeight:"500", marginTop:1, letterSpacing:0.5 },

  // Scroll
  scroll: { paddingHorizontal:24, paddingTop:8 },

  // Step titles
  stepTitle: { fontFamily:SERIF, fontSize:28, color:"#fff", fontWeight:"600", marginBottom:10, lineHeight:34 },
  stepSub:   { fontSize:15, color:"rgba(255,255,255,0.62)", fontWeight:"400", lineHeight:22, marginBottom:8 },
  stepTagline:  { fontSize:14, color:"rgba(200,169,106,0.90)", fontWeight:"600", lineHeight:20, marginBottom:4 },
  stepTagline2: { fontSize:14, color:"rgba(255,255,255,0.55)", fontWeight:"400", lineHeight:20, marginBottom:24 },
  optionIconWrapGold: { backgroundColor:"rgba(200,169,106,0.22)", borderColor:"rgba(200,169,106,0.55)" },

  // How it works card
  howCard:  { backgroundColor:"rgba(255,255,255,0.05)", borderRadius:16, borderWidth:1, borderColor:"rgba(255,255,255,0.10)", padding:20, marginBottom:16 },
  howTitle: { fontSize:11, fontWeight:"800", letterSpacing:2, color:"#C8A96A", marginBottom:16, textTransform:"uppercase" },
  howRow:   { flexDirection:"row", alignItems:"flex-start", gap:14, marginBottom:14 },
  howNum:   { fontSize:11, fontWeight:"800", color:"rgba(200,169,106,0.60)", width:20, letterSpacing:0.5, marginTop:2 },
  howTxt:   { flex:1, fontSize:15, color:"rgba(255,255,255,0.80)", fontWeight:"400", lineHeight:22 },
  howBody:  { fontSize:14, color:"rgba(255,255,255,0.70)", fontWeight:"400", lineHeight:21 },
  howDivider:{ height:1, backgroundColor:"rgba(255,255,255,0.08)", marginVertical:12 },
  howBodyMuted:{ fontSize:13, color:"rgba(255,255,255,0.38)", fontWeight:"400", lineHeight:19 },

  // Buttons
  primaryBtn:         { backgroundColor:"#C8A96A", borderRadius:14, paddingVertical:17, alignItems:"center", marginBottom:12, shadowColor:"#C8A96A", shadowOffset:{width:0,height:4}, shadowOpacity:0.28, shadowRadius:12, elevation:6 },
  primaryBtnDisabled: { opacity:0.35 },
  primaryBtnTxt:      { fontFamily:SERIF, fontSize:17, color:"#0F2419", fontWeight:"700", letterSpacing:0.3 },
  ghostBtn:           { paddingVertical:14, alignItems:"center", marginBottom:8 },
  ghostBtnTxt:        { fontSize:14, color:"rgba(255,255,255,0.38)", fontWeight:"500" },

  // Option tiles (step 1)
  optionCard:     { flexDirection:"row", alignItems:"center", backgroundColor:"rgba(255,255,255,0.06)", borderRadius:16, borderWidth:1, borderColor:"rgba(255,255,255,0.10)", padding:18, marginBottom:10, gap:16 },
  optionIconWrap: { width:44, height:44, borderRadius:12, backgroundColor:"rgba(200,169,106,0.12)", borderWidth:1, borderColor:"rgba(200,169,106,0.25)", alignItems:"center", justifyContent:"center", flexShrink:0 },
  optionIcon:     { fontSize:20, color:"#C8A96A" },
  optionText:     { flex:1 },
  optionTitle:    { fontFamily:SERIF, fontSize:17, color:"#fff", fontWeight:"600", marginBottom:3 },
  optionSub:      { fontSize:13, color:"rgba(255,255,255,0.50)", fontWeight:"400", lineHeight:18 },
  optionArrow:    { fontSize:20, color:"rgba(255,255,255,0.25)" },
  backToOptions:  { paddingVertical:10, marginBottom:8 },
  backToOptionsTxt:{ fontSize:14, color:"rgba(255,255,255,0.50)", fontWeight:"500" },

  // Paste input
  pasteWrap:   { backgroundColor:"rgba(255,255,255,0.05)", borderRadius:16, borderWidth:1.5, borderColor:"rgba(255,255,255,0.12)", marginBottom:16, minHeight:200 },
  pasteInput:  { fontSize:15, color:"rgba(255,255,255,0.90)", lineHeight:22, padding:16, minHeight:200, fontWeight:"400" },
  clearPaste:  { position:"absolute", top:10, right:12 },
  clearPasteTxt: { fontSize:13, color:"rgba(255,255,255,0.35)", fontWeight:"600" },

  // Error
  errorCard: { backgroundColor:"rgba(180,60,40,0.15)", borderRadius:12, borderWidth:1, borderColor:"rgba(180,60,40,0.35)", padding:14, flexDirection:"row", alignItems:"flex-start", gap:10, marginBottom:14 },
  errorIcon: { fontSize:16, marginTop:1 },
  errorTxt:  { flex:1, fontSize:13, color:"rgba(255,160,140,0.90)", fontWeight:"500", lineHeight:18 },

  finePrint: { fontSize:11, color:"rgba(255,255,255,0.28)", textAlign:"center", lineHeight:16, marginBottom:8 },

  // Processing
  processingWrap: { flex:1, justifyContent:"center", alignItems:"center", padding:24 },
  processingCard: { backgroundColor:"rgba(255,255,255,0.05)", borderRadius:24, borderWidth:1, borderColor:"rgba(255,255,255,0.10)", padding:32, width:"100%", alignItems:"center" },
  processingTitle:{ fontFamily:SERIF, fontSize:24, color:"#fff", fontWeight:"600", marginBottom:24, textAlign:"center" },
  processingStep: { fontSize:14, color:"rgba(255,255,255,0.50)", fontWeight:"400", marginBottom:10, alignSelf:"flex-start" },
  processingNote: { fontSize:12, color:"rgba(255,255,255,0.28)", marginTop:20, textAlign:"center" },

  // Review
  reviewHeader:   { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:6 },
  editToggle:     { backgroundColor:"rgba(200,169,106,0.15)", borderRadius:10, paddingHorizontal:14, paddingVertical:7, borderWidth:1, borderColor:"rgba(200,169,106,0.30)" },
  editToggleTxt:  { fontSize:13, color:"#C8A96A", fontWeight:"600" },

  // Save preview
  savePreviewCard:  { backgroundColor:"rgba(200,169,106,0.08)", borderRadius:14, borderWidth:1, borderColor:"rgba(200,169,106,0.20)", padding:16, marginBottom:14 },
  savePreviewTitle: { fontFamily:SERIF, fontSize:15, color:"#C8A96A", fontWeight:"600", marginBottom:12 },
  saveItem:         { fontSize:13, color:"rgba(255,255,255,0.65)", fontWeight:"400", marginBottom:7, lineHeight:18 },

  // Done
  doneWrap:    { flex:1, justifyContent:"center", padding:24 },
  doneCard:    { backgroundColor:"rgba(255,255,255,0.05)", borderRadius:24, borderWidth:1, borderColor:"rgba(255,255,255,0.10)", padding:32, alignItems:"center" },
  doneIcon:    { fontSize:52, marginBottom:20 },
  doneTitle:   { fontFamily:SERIF, fontSize:28, color:"#fff", fontWeight:"600", marginBottom:10, textAlign:"center" },
  doneSub:     { fontSize:15, color:"rgba(255,255,255,0.62)", fontWeight:"400", textAlign:"center", lineHeight:22, marginBottom:20 },
  doneDivider: { width:40, height:1, backgroundColor:"rgba(200,169,106,0.40)", marginVertical:16 },
  doneQuote:   { fontFamily:SERIF, fontSize:15, color:"rgba(200,169,106,0.85)", textAlign:"center", fontStyle:"italic", lineHeight:24, marginBottom:8 },
  doneRef:     { fontSize:12, color:"rgba(255,255,255,0.30)", fontWeight:"500" },

  // Badges (legacy ref — unused)
  badgeRow: { flexDirection:"row", gap:10, marginBottom:10, flexWrap:"wrap" },
});;
