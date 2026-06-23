/**
 * OnboardingFlow.jsx — Safar
 *
 * Replaces OnboardingCarousel.jsx
 *
 * 6-screen first-launch flow:
 *   Screen 1 — Welcome splash          (full-bleed image, brand moment)
 *   Screen 2 — Your name               (TextInput → safar_user_name_v1)
 *   Screen 3 — Journey type            (Umrah · Hajj · Just Learning → safar_journey_type_v1)
 *   Screen 4 — Safar Assist import     (Hajj/Umrah only — AI ingestion, dark palette)
 *   Screen 5 — When are you going?     (Hajj/Umrah only — date → safar_departure_date_v1)
 *   Screen 6 — You're set              (personalised confirmation)
 *
 * WIRING IN App.js:
 *   1. Add to Root Stack BEFORE MainTabs:
 *        import OnboardingFlow from "./screens/OnboardingFlow";
 *        <Stack.Screen name="Onboarding" component={OnboardingFlow} options={{ gestureEnabled: false }} />
 *
 *   2. In App() function, check AsyncStorage on mount and navigate:
 *        const [ready, setReady] = useState(false);
 *        const [onboarded, setOnboarded] = useState(false);
 *        useEffect(() => {
 *          AsyncStorage.getItem("safar_onboarded_v1").then(val => {
 *            setOnboarded(val === "true");
 *            setReady(true);
 *          });
 *        }, []);
 *        // Pass initialRouteName to Root Stack based on onboarded flag
 *
 *   3. OnboardingFlow calls navigation.replace("MainTabs") on completion.
 *
 * STORAGE KEYS WRITTEN:
 *   safar_onboarded_v1         "true"
 *   safar_user_name_v1         string
 *   safar_journey_type_v1      "umrah" | "hajj" | "learn"
 *   safar_departure_date_v1    ISO date string (Hajj/Umrah only)
 *   safar_import_done_v1       "true" if import completed
 *   safar_journey_contacts_v1  JSON string — from AI import
 *   safar_journey_board_v1     JSON string — from AI import
 *   safar_cal_entries_v1       JSON string — from AI import
 *
 * CRITICAL RULES:
 *   - StyleSheet.create() at module level only
 *   - No && in style arrays — use ternary
 *   - No emoji — Phosphor icons only
 *   - No literal newlines in JS strings — use \n
 *   - No transparent={false} + statusBarTranslucent in Modal
 */

import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
// expo-document-picker: install with `npx expo install expo-document-picker` to enable file upload
// import * as DocumentPicker from "expo-document-picker";

// ── Phosphor icons ────────────────────────────────────────────────────────────
import {
  Camera,
  UploadSimple,
  Link,
  Microphone,
  TextT,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Lock,
} from "phosphor-react-native";

const SERIF = "SourceSerif4-Regular";
const { width: SW, height: SH } = Dimensions.get("window");

// ── Design tokens (hardcoded per Critical Rules) ──────────────────────────────
const T = {
  // Light screens (Name, Date, Done)
  bg:           "#F5F0E8",
  card:         "#FDFAF4",
  primary:      "#2F5D50",
  primaryDark:  "#1E3D34",
  gold:         "#C8A96A",
  goldBorder:   "rgba(200,169,106,0.38)",
  text:         "#1A1712",
  mid:          "#3C3830",
  sub:          "#5A5650",
  faint:        "#9A9690",
  border:       "#D4D0CA",
  // Dark screens (Assist import)
  darkBg:       "#0A1A10",
  darkSurface:  "#122018",
  darkCard:     "#172014",
  darkGreen:    "#2A4820",
  darkAccent:   "#C8A96A",
  darkText:     "#F5F0E8",
  darkSub:      "rgba(245,240,232,0.65)",
  darkFaint:    "rgba(245,240,232,0.38)",
  darkBorder:   "rgba(200,169,106,0.22)",
};

// ── Storage keys ──────────────────────────────────────────────────────────────
const K = {
  onboarded:   "safar_onboarded_v1",
  name:        "safar_user_name_v1",
  journeyType: "safar_journey_type_v1",
  departure:   "safar_departure_date_v1",
  importDone:  "safar_import_done_v1",
  contacts:    "safar_journey_contacts_v1",
  board:       "safar_journey_board_v1",
  cal:         "safar_cal_entries_v1",
  checklist:   "safar_umrah_checklist_v1",
};

// ── Progress dots ─────────────────────────────────────────────────────────────
function ProgressDots({ total, active, dark }) {
  return (
    <View style={dt.row}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={
            i === active
              ? dark
                ? [dt.dot, dt.dotOnDark]
                : [dt.dot, dt.dotOn]
              : dark
              ? [dt.dot, dt.dotOffDark]
              : dt.dot
          }
        />
      ))}
    </View>
  );
}

const dt = StyleSheet.create({
  row:        { flexDirection: "row", gap: 7, alignItems: "center", justifyContent: "center" },
  dot:        { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(90,86,80,0.2)" },
  dotOn:      { width: 10, height: 10, borderRadius: 5, backgroundColor: "#2F5D50" },
  dotOnDark:  { width: 10, height: 10, borderRadius: 5, backgroundColor: "#C8A96A" },
  dotOffDark: { backgroundColor: "rgba(200,169,106,0.25)" },
});

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 1 — Welcome
// Full-bleed image, brand greeting, "Begin" CTA
// ─────────────────────────────────────────────────────────────────────────────
function WelcomeScreen({ onNext }) {
  return (
    <View style={ws.root}>
      <Image
        source={require("../assets/kaaba_mixed.png")}
        style={ws.bg}
        resizeMode="cover"
      />
      <View style={ws.scrim} />

      {/* Top: wordmark */}
      <SafeAreaView style={ws.topBar}>
        <Text style={ws.wordmark}>SAFAR</Text>
      </SafeAreaView>

      {/* Bottom: content */}
      <View style={ws.content}>
        <Text style={ws.eyebrow}>{"As-sal\u0101mu \u02bfalaykum"}</Text>
        <Text style={ws.title}>{"Your companion\nfor the journey\nahead."}</Text>
        <Text style={ws.subtitle}>
          {"Everything you need to prepare for Umrah and Hajj \u2014 guidance, du\u02bf\u0101s, contacts, and more."}
        </Text>

        <ProgressDots total={6} active={0} dark />

        <TouchableOpacity style={ws.cta} onPress={onNext} activeOpacity={0.88}>
          <Text style={ws.ctaTxt}>Begin</Text>
          <ArrowRight size={20} color={T.darkBg} weight="bold" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const ws = StyleSheet.create({
  root:      { flex: 1, backgroundColor: T.darkBg },
  bg:        { position: "absolute", top: 0, left: 0, width: SW, height: SH },
  scrim:     { position: "absolute", top: 0, left: 0, width: SW, height: SH, backgroundColor: "rgba(10,26,16,0.58)" },
  topBar:    { position: "absolute", top: 0, left: 0, right: 0, paddingTop: 56, paddingHorizontal: 30, alignItems: "flex-start" },
  wordmark:  { fontSize: 13, letterSpacing: 4, color: T.gold, fontWeight: "500" },
  content:   {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 30, paddingBottom: 52, paddingTop: 32,
    backgroundColor: "rgba(10,26,16,0.45)",
    gap: 0,
  },
  eyebrow:   { fontSize: 12, letterSpacing: 2, color: T.gold, fontWeight: "400", textTransform: "uppercase", marginBottom: 12 },
  title:     { fontFamily: SERIF, fontSize: 36, color: T.darkText, lineHeight: 46, marginBottom: 14 },
  subtitle:  { fontSize: 15, color: T.darkSub, lineHeight: 24, marginBottom: 28 },
  cta:       {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: T.gold, borderRadius: 12, paddingVertical: 16,
    marginTop: 20,
  },
  ctaTxt:    { fontFamily: SERIF, fontSize: 17, color: T.darkBg, fontWeight: "500" },
});

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 2 — Your Name
// Light parchment, single TextInput, stores to AsyncStorage
// ─────────────────────────────────────────────────────────────────────────────
function NameScreen({ onNext }) {
  const [name, setName] = useState("");
  const inputRef = useRef(null);

  const handleContinue = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }
    await AsyncStorage.setItem(K.name, trimmed);
    onNext(trimmed);
  }, [name, onNext]);

  return (
    <KeyboardAvoidingView
      style={ns.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={ns.safe}>
        <ProgressDots total={6} active={1} />

        <View style={ns.body}>
          <Text style={ns.eyebrow}>STEP 1 OF 5</Text>
          <Text style={ns.title}>What should{"\n"}we call you?</Text>
          <Text style={ns.sub}>{"Your name will personalise your Safar experience."}</Text>

          <TextInput
            ref={inputRef}
            style={ns.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={T.faint}
            autoFocus
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleContinue}
          />
        </View>

        <View style={ns.footer}>
          <TouchableOpacity
            style={name.trim().length > 0 ? ns.btn : ns.btnDisabled}
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Text style={name.trim().length > 0 ? ns.btnTxt : ns.btnTxtDisabled}>Continue</Text>
            <ArrowRight
              size={18}
              color={name.trim().length > 0 ? "#fff" : T.faint}
              weight="bold"
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const ns = StyleSheet.create({
  root:          { flex: 1, backgroundColor: T.bg },
  safe:          { flex: 1, paddingHorizontal: 28 },
  body:          { flex: 1, paddingTop: 52 },
  eyebrow:       { fontSize: 11, letterSpacing: 2.5, color: T.faint, fontWeight: "500", textTransform: "uppercase", marginBottom: 18 },
  title:         { fontFamily: SERIF, fontSize: 34, color: T.text, lineHeight: 44, marginBottom: 12 },
  sub:           { fontSize: 15, color: T.sub, lineHeight: 23, marginBottom: 36 },
  input:         {
    fontFamily: SERIF, fontSize: 22, color: T.text,
    borderBottomWidth: 1.5, borderBottomColor: T.primary,
    paddingVertical: 12, paddingHorizontal: 0,
    backgroundColor: "transparent",
  },
  footer:        { paddingBottom: 40, paddingTop: 24 },
  btn:           {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: T.primary, borderRadius: 12, paddingVertical: 16,
  },
  btnDisabled:   {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: T.border, borderRadius: 12, paddingVertical: 16,
  },
  btnTxt:        { fontFamily: SERIF, fontSize: 16, color: "#fff", fontWeight: "500" },
  btnTxtDisabled:{ fontFamily: SERIF, fontSize: 16, color: T.faint, fontWeight: "500" },
});

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 3 — Journey Type
// 3 tappable cards: Umrah · Hajj · Just Learning
// ─────────────────────────────────────────────────────────────────────────────
const JOURNEY_OPTIONS = [
  {
    id:       "umrah",
    label:    "Umrah",
    arabic:   "\u0639\u064f\u0645\u0652\u0631\u064e\u0629",
    desc:     "I\u2019m preparing for Umrah",
    detail:   "Du\u02bf\u0101s, step-by-step guide, checklist and tools tailored for Umrah.",
  },
  {
    id:       "hajj",
    label:    "Hajj",
    arabic:   "\u062d\u064e\u062c\u0651",
    desc:     "I\u2019m preparing for Hajj",
    detail:   "Full Hajj programme, Arafah, Muzdalifah, Jamarat and all five days.",
  },
  {
    id:       "learn",
    label:    "Just Learning",
    arabic:   "\u062a\u064e\u0639\u064e\u0644\u0651\u064f\u0645",
    desc:     "I want to learn about pilgrimage",
    detail:   "Explore guidance, du\u02bf\u0101s and sacred places at your own pace.",
  },
];

function JourneyTypeScreen({ userName, onNext }) {
  const [selected, setSelected] = useState(null);

  const handleContinue = useCallback(async () => {
    if (!selected) return;
    await AsyncStorage.setItem(K.journeyType, selected);
    onNext(selected);
  }, [selected, onNext]);

  return (
    <SafeAreaView style={jts.root}>
      <ProgressDots total={6} active={2} />

      <ScrollView
        style={jts.scroll}
        contentContainerStyle={jts.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={jts.eyebrow}>STEP 2 OF 5</Text>
        <Text style={jts.title}>
          {userName ? "What brings you\nto Safar, " + userName + "?" : "What brings you\nto Safar?"}
        </Text>
        <Text style={jts.sub}>{"We\u2019ll personalise your experience based on your journey."}</Text>

        <View style={jts.cards}>
          {JOURNEY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={
                selected === opt.id
                  ? [jts.card, jts.cardSelected]
                  : jts.card
              }
              onPress={() => setSelected(opt.id)}
              activeOpacity={0.82}
            >
              <View style={jts.cardTop}>
                <View style={jts.cardLeft}>
                  <Text style={jts.cardLabel}>{opt.label}</Text>
                  <Text style={jts.cardDesc}>{opt.desc}</Text>
                </View>
                <Text style={jts.cardArabic}>{opt.arabic}</Text>
              </View>
              <Text style={jts.cardDetail}>{opt.detail}</Text>

              {selected === opt.id ? (
                <View style={jts.checkBadge}>
                  <CheckCircle size={22} color={T.primary} weight="fill" />
                </View>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={jts.footer}>
        <TouchableOpacity
          style={selected ? jts.btn : jts.btnDisabled}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={selected ? jts.btnTxt : jts.btnTxtDisabled}>Continue</Text>
          <ArrowRight
            size={18}
            color={selected ? "#fff" : T.faint}
            weight="bold"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const jts = StyleSheet.create({
  root:         { flex: 1, backgroundColor: T.bg },
  scroll:       { flex: 1 },
  scrollContent:{ paddingHorizontal: 24, paddingTop: 40, paddingBottom: 16 },
  eyebrow:      { fontSize: 11, letterSpacing: 2.5, color: T.faint, fontWeight: "500", textTransform: "uppercase", marginBottom: 16 },
  title:        { fontFamily: SERIF, fontSize: 30, color: T.text, lineHeight: 40, marginBottom: 10 },
  sub:          { fontSize: 15, color: T.sub, lineHeight: 23, marginBottom: 28 },
  cards:        { gap: 14 },
  card:         {
    backgroundColor: T.card, borderRadius: 14,
    borderWidth: 1.5, borderColor: T.border,
    padding: 18, position: "relative",
  },
  cardSelected: {
    borderColor: T.primary,
    backgroundColor: "#F0F5F2",
  },
  cardTop:      { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 },
  cardLeft:     { flex: 1, gap: 3 },
  cardLabel:    { fontFamily: SERIF, fontSize: 18, color: T.text, fontWeight: "400" },
  cardDesc:     { fontSize: 13, color: T.sub, fontWeight: "400" },
  cardArabic:   { fontFamily: SERIF, fontSize: 22, color: T.gold, marginLeft: 12 },
  cardDetail:   { fontSize: 13, color: T.faint, lineHeight: 20 },
  checkBadge:   { position: "absolute", top: 14, right: 14 },
  footer:       { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16 },
  btn:          {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: T.primary, borderRadius: 12, paddingVertical: 16,
  },
  btnDisabled:  {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: T.border, borderRadius: 12, paddingVertical: 16,
  },
  btnTxt:       { fontFamily: SERIF, fontSize: 16, color: "#fff", fontWeight: "500" },
  btnTxtDisabled:{ fontFamily: SERIF, fontSize: 16, color: T.faint, fontWeight: "500" },
});

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 4 — Safar Assist Import
// Dark AI palette — shown only for Hajj or Umrah
// Allows document upload, paste, or link entry
// Claude API extracts contacts, dates, checklist items
// ─────────────────────────────────────────────────────────────────────────────

// Claude AI extraction prompt
const EXTRACTION_PROMPT = (rawText) =>
  "You are a travel assistant for a Muslim pilgrimage app called Safar. " +
  "Extract the following from the provided booking or travel details and return ONLY valid JSON with no extra text:\n" +
  "{\n" +
  '  "departure_date": "YYYY-MM-DD or null",\n' +
  '  "return_date": "YYYY-MM-DD or null",\n' +
  '  "hotel_checkin": "YYYY-MM-DD or null",\n' +
  '  "hotel_checkout": "YYYY-MM-DD or null",\n' +
  '  "hotel_name": "string or null",\n' +
  '  "hotel_address": "string or null",\n' +
  '  "airline": "string or null",\n' +
  '  "flight_number": "string or null",\n' +
  '  "travel_agent": "string or null",\n' +
  '  "group_leader": "string or null",\n' +
  '  "group_leader_phone": "string or null",\n' +
  '  "emergency_contact": "string or null",\n' +
  '  "checklist_items": ["array", "of", "strings", "or", "empty array"]\n' +
  "}\n\n" +
  "Travel details:\n" +
  rawText;

async function runAIExtraction(rawText) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: EXTRACTION_PROMPT(rawText) }],
    }),
  });
  const data = await response.json();
  const raw = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

async function saveExtractedData(extracted) {
  const saves = [];
  if (extracted.departure_date) {
    saves.push(AsyncStorage.setItem(K.departure, extracted.departure_date));
  }
  const contacts = {
    hotel:        extracted.hotel_name    || null,
    hotelAddress: extracted.hotel_address || null,
    airline:      extracted.airline       || null,
    flightNumber: extracted.flight_number || null,
    agent:        extracted.travel_agent  || null,
    groupLeader:  extracted.group_leader  || null,
    groupLeaderPhone: extracted.group_leader_phone || null,
    emergency:    extracted.emergency_contact || null,
  };
  saves.push(AsyncStorage.setItem(K.contacts, JSON.stringify(contacts)));
  const cal = {
    departure:     extracted.departure_date   || null,
    return:        extracted.return_date      || null,
    hotelCheckin:  extracted.hotel_checkin    || null,
    hotelCheckout: extracted.hotel_checkout   || null,
  };
  saves.push(AsyncStorage.setItem(K.cal, JSON.stringify(cal)));
  if (extracted.checklist_items && extracted.checklist_items.length > 0) {
    const items = extracted.checklist_items.map((t, i) => ({ id: "ai_" + i, text: t, done: false }));
    saves.push(AsyncStorage.setItem(K.checklist, JSON.stringify(items)));
  }
  const board = {
    hotel:      extracted.hotel_name   || null,
    departure:  extracted.departure_date || null,
    airline:    extracted.airline      || null,
    importedAt: new Date().toISOString(),
  };
  saves.push(AsyncStorage.setItem(K.board, JSON.stringify(board)));
  saves.push(AsyncStorage.setItem(K.importDone, "true"));
  await Promise.all(saves);
}

const INPUT_METHODS = [
  {
    id:      "upload",
    Icon:    UploadSimple,
    label:   "Upload a file",
    detail:  "PDF, email export, or Word document",
    expoGo:  false,
    devOnly: "Available in the full app",
  },
  {
    id:      "photo",
    Icon:    Camera,
    label:   "Take a photo",
    detail:  "Booking confirmation or printed receipt",
    expoGo:  false,
    devOnly: "Available in the full app",
  },
  {
    id:      "link",
    Icon:    Link,
    label:   "Paste a link",
    detail:  "Notion, Google Docs, Apple Notes share link",
    expoGo:  true,
  },
  {
    id:      "voice",
    Icon:    Microphone,
    label:   "Speak your details",
    detail:  "Flight number, hotel, dates, contacts",
    expoGo:  false,
    devOnly: "Available in the full app",
  },
  {
    id:      "paste",
    Icon:    TextT,
    label:   "Type or paste text",
    detail:  "Any booking text, email body, itinerary",
    expoGo:  true,
  },
];

function AssistImportScreen({ journeyType, onNext, onSkip }) {
  const [activeMethod, setActiveMethod] = useState(null);
  const [pasteText, setPasteText]       = useState("");
  const [linkText, setLinkText]         = useState("");
  const [status, setStatus]             = useState("idle"); // idle | processing | review | done | error
  const [extracted, setExtracted]       = useState(null);
  const [errorMsg, setErrorMsg]         = useState("");

  const journeyLabel = journeyType === "hajj" ? "Hajj" : "Umrah";

  // ── Document upload — requires expo-document-picker (dev build only) ─────────
  // Install: npx expo install expo-document-picker
  // Then uncomment the import at the top and replace this handler with the full version.
  const handleUpload = useCallback(async () => {
    // No-op in Expo Go — upload card is marked expoGo:false so this is never called
  }, []);

  // ── Link fetch ─────────────────────────────────────────────────────────────
  const handleLinkSubmit = useCallback(async () => {
    if (!linkText.trim()) return;
    setStatus("processing");
    const rawText = "Link to document: " + linkText.trim() +
      "\n(Extract key travel details — dates, hotel, airline, group contacts — from this link.)";
    await processText(rawText);
  }, [linkText]);

  // ── Text paste submit ──────────────────────────────────────────────────────
  const handlePasteSubmit = useCallback(async () => {
    if (!pasteText.trim()) return;
    setStatus("processing");
    await processText(pasteText.trim());
  }, [pasteText]);

  // ── Core AI processing ─────────────────────────────────────────────────────
  const processText = async (rawText) => {
    try {
      setStatus("processing");
      const result = await runAIExtraction(rawText);
      setExtracted(result);
      setStatus("review");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again or skip for now.");
    }
  };

  // ── Save confirmed data ────────────────────────────────────────────────────
  const handleConfirm = useCallback(async () => {
    if (!extracted) return;
    try {
      await saveExtractedData(extracted);
      setStatus("done");
      setTimeout(() => onNext(), 1200);
    } catch {
      setStatus("error");
      setErrorMsg("Could not save your details. Please try again.");
    }
  }, [extracted, onNext]);

  // ── Render: processing spinner ─────────────────────────────────────────────
  if (status === "processing") {
    return (
      <View style={ai.root}>
        <SafeAreaView style={ai.safe}>
          <View style={ai.centerBlock}>
            <ActivityIndicator size="large" color={T.gold} />
            <Text style={ai.processingTitle}>{"Reading your details\u2026"}</Text>
            <Text style={ai.processingSub}>
              {"Safar is securely scanning your document using AI.\nThis takes just a moment."}
            </Text>
          </View>
          <View style={ai.privacyRow}>
            <Lock size={14} color={T.darkFaint} weight="regular" />
            <Text style={ai.privacyTxt}>
              {"Your data is processed securely and stored only on your device."}
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── Render: review extracted data ──────────────────────────────────────────
  if (status === "review" && extracted) {
    const hasAnyData =
      extracted.departure_date || extracted.hotel_name ||
      extracted.airline || extracted.group_leader ||
      (extracted.checklist_items && extracted.checklist_items.length > 0);

    return (
      <View style={ai.root}>
        <SafeAreaView style={ai.safe}>
          <ScrollView
            style={ai.reviewScroll}
            contentContainerStyle={ai.reviewContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={ai.reviewEyebrow}>{"SAFAR FOUND"}</Text>
            <Text style={ai.reviewTitle}>{"Here\u2019s what we\u2019ve added"}</Text>

            {hasAnyData ? (
              <View style={ai.reviewCards}>

                {/* Dates */}
                {(extracted.departure_date || extracted.return_date) ? (
                  <View style={ai.reviewCard}>
                    <Text style={ai.reviewCardLabel}>{"DATES"}</Text>
                    {extracted.departure_date ? (
                      <ReviewRow icon={"Departs"} value={extracted.departure_date} />
                    ) : null}
                    {extracted.return_date ? (
                      <ReviewRow icon={"Returns"} value={extracted.return_date} />
                    ) : null}
                    {extracted.hotel_checkin ? (
                      <ReviewRow icon={"Hotel check-in"} value={extracted.hotel_checkin} />
                    ) : null}
                    {extracted.hotel_checkout ? (
                      <ReviewRow icon={"Hotel check-out"} value={extracted.hotel_checkout} />
                    ) : null}
                  </View>
                ) : null}

                {/* Contacts */}
                {(extracted.hotel_name || extracted.airline || extracted.group_leader || extracted.travel_agent) ? (
                  <View style={ai.reviewCard}>
                    <Text style={ai.reviewCardLabel}>{"CONTACTS & DETAILS"}</Text>
                    {extracted.hotel_name ? (
                      <ReviewRow icon={"Hotel"} value={extracted.hotel_name} />
                    ) : null}
                    {extracted.airline ? (
                      <ReviewRow icon={"Airline"} value={extracted.airline + (extracted.flight_number ? "  " + extracted.flight_number : "")} />
                    ) : null}
                    {extracted.group_leader ? (
                      <ReviewRow icon={"Group leader"} value={extracted.group_leader} />
                    ) : null}
                    {extracted.travel_agent ? (
                      <ReviewRow icon={"Travel agent"} value={extracted.travel_agent} />
                    ) : null}
                  </View>
                ) : null}

                {/* Checklist */}
                {(extracted.checklist_items && extracted.checklist_items.length > 0) ? (
                  <View style={ai.reviewCard}>
                    <Text style={ai.reviewCardLabel}>{"CHECKLIST ITEMS"}</Text>
                    {extracted.checklist_items.map((item, idx) => (
                      <ReviewRow key={String(idx)} icon={"  \u2022"} value={item} />
                    ))}
                  </View>
                ) : null}

              </View>
            ) : (
              <View style={ai.reviewCard}>
                <Text style={ai.reviewNoData}>
                  {"We couldn\u2019t find specific travel details in that document. You can add them manually from the Prepare tab."}
                </Text>
              </View>
            )}

            <View style={ai.privacyRow}>
              <ShieldCheck size={14} color={T.darkFaint} weight="regular" />
              <Text style={ai.privacyTxt}>
                {"Your data is encrypted and stored securely on your device. Safar never shares your personal information."}
              </Text>
            </View>
          </ScrollView>

          <View style={ai.reviewFooter}>
            <TouchableOpacity style={ai.confirmBtn} onPress={handleConfirm} activeOpacity={0.88}>
              <Text style={ai.confirmBtnTxt}>{"Save and continue"}</Text>
              <ArrowRight size={18} color={T.darkBg} weight="bold" />
            </TouchableOpacity>
            <TouchableOpacity style={ai.retryBtn} onPress={() => setStatus("idle")} activeOpacity={0.7}>
              <Text style={ai.retryTxt}>{"Try again with different details"}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── Render: done ──────────────────────────────────────────────────────────
  if (status === "done") {
    return (
      <View style={ai.root}>
        <SafeAreaView style={[ai.safe, ai.centerBlock]}>
          <CheckCircle size={52} color={T.gold} weight="fill" />
          <Text style={ai.doneTitle}>{"All saved"}</Text>
          <Text style={ai.doneSub}>{"Your journey details have been added to Safar."}</Text>
        </SafeAreaView>
      </View>
    );
  }

  // ── Render: error ─────────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <View style={ai.root}>
        <SafeAreaView style={ai.safe}>
          <View style={ai.centerBlock}>
            <Text style={ai.errorTitle}>{"Something went wrong"}</Text>
            <Text style={ai.errorSub}>{errorMsg}</Text>
            <TouchableOpacity style={ai.retryBtnFull} onPress={() => setStatus("idle")} activeOpacity={0.85}>
              <Text style={ai.confirmBtnTxt}>{"Try again"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSkip} activeOpacity={0.7}>
              <Text style={ai.skipLink}>{"Skip for now"}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── Render: idle — method selection ───────────────────────────────────────
  return (
    <View style={ai.root}>
      <SafeAreaView style={ai.safe}>
        <ScrollView
          style={ai.scroll}
          contentContainerStyle={ai.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ProgressDots total={6} active={3} dark />

          <Text style={ai.eyebrow}>{"STEP 3 OF 5  \u00b7  SAFAR ASSIST"}</Text>
          <Text style={ai.title}>{"Let Safar do\nthe heavy lifting."}</Text>
          <Text style={ai.intro}>
            {"Share your " + journeyLabel + " booking and Safar will automatically add your flight dates, hotel, contacts, and checklist items."}
          </Text>
          <Text style={ai.introDetail}>
            {"Take a photo of your booking confirmation or receipt, upload a PDF or email, paste a link to your Notion, Google Doc or Notes, or just speak your details aloud. Safar will read it and set everything up for you."}
          </Text>

          {/* Privacy assurance */}
          <View style={ai.trustBanner}>
            <ShieldCheck size={18} color={T.gold} weight="fill" />
            <Text style={ai.trustTxt}>
              {"Your data is securely ingested and stored in your private Safar profile on your device. It is never shared or sold."}
            </Text>
          </View>

          {/* Input method cards */}
          <View style={ai.methods}>
            {INPUT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={
                  method.expoGo === false
                    ? [ai.methodCard, ai.methodCardDisabled]
                    : activeMethod === method.id
                    ? [ai.methodCard, ai.methodCardActive]
                    : ai.methodCard
                }
                onPress={() => {
                  if (method.expoGo === false) return;
                  setActiveMethod(activeMethod === method.id ? null : method.id);
                }}
                activeOpacity={method.expoGo === false ? 1 : 0.8}
              >
                <View style={ai.methodIcon}>
                  <method.Icon
                    size={22}
                    color={method.expoGo === false ? T.darkFaint : activeMethod === method.id ? T.gold : T.darkSub}
                    weight="regular"
                  />
                </View>
                <View style={ai.methodText}>
                  <Text
                    style={
                      method.expoGo === false
                        ? ai.methodLabelDisabled
                        : ai.methodLabel
                    }
                  >
                    {method.label}
                  </Text>
                  <Text style={ai.methodDetail}>
                    {method.expoGo === false ? method.devOnly : method.detail}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Inline input: Upload */}
          {activeMethod === "upload" ? (
            <View style={ai.inlineBlock}>
              <TouchableOpacity style={ai.uploadBtn} onPress={handleUpload} activeOpacity={0.88}>
                <UploadSimple size={20} color={T.darkBg} weight="bold" />
                <Text style={ai.uploadBtnTxt}>{"Choose file"}</Text>
              </TouchableOpacity>
              <Text style={ai.inlineHint}>{"PDF, .docx, or .txt. Works offline."}</Text>
            </View>
          ) : null}

          {/* Inline input: Link */}
          {activeMethod === "link" ? (
            <View style={ai.inlineBlock}>
              <TextInput
                style={ai.linkInput}
                value={linkText}
                onChangeText={setLinkText}
                placeholder={"Paste your link here\u2026"}
                placeholderTextColor={T.darkFaint}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                returnKeyType="go"
                onSubmitEditing={handleLinkSubmit}
              />
              <TouchableOpacity
                style={linkText.trim() ? ai.submitBtn : ai.submitBtnDisabled}
                onPress={handleLinkSubmit}
                activeOpacity={0.88}
              >
                <Text style={ai.uploadBtnTxt}>{"Read this link"}</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Inline input: Paste */}
          {activeMethod === "paste" ? (
            <View style={ai.inlineBlock}>
              <TextInput
                style={ai.pasteInput}
                value={pasteText}
                onChangeText={setPasteText}
                placeholder={"Paste your booking details, email body, or itinerary\u2026"}
                placeholderTextColor={T.darkFaint}
                multiline
                textAlignVertical="top"
                returnKeyType="default"
              />
              <TouchableOpacity
                style={pasteText.trim() ? ai.submitBtn : ai.submitBtnDisabled}
                onPress={handlePasteSubmit}
                activeOpacity={0.88}
              >
                <Text style={ai.uploadBtnTxt}>{"Extract my details"}</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Footer: skip */}
        <View style={ai.footer}>
          <TouchableOpacity onPress={onSkip} activeOpacity={0.7} style={ai.skipBtn}>
            <Text style={ai.skipTxt}>{"I\u2019ll add my details later"}</Text>
          </TouchableOpacity>
          <Text style={ai.skipHint}>
            {"You can always import from the Home screen or Prepare tab."}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

// Small review row helper
function ReviewRow({ icon, value }) {
  return (
    <View style={rr.row}>
      <Text style={rr.icon}>{icon}</Text>
      <Text style={rr.value}>{value}</Text>
    </View>
  );
}
const rr = StyleSheet.create({
  row:   { flexDirection: "row", gap: 10, paddingVertical: 5, alignItems: "flex-start" },
  icon:  { fontSize: 12, color: T.darkFaint, width: 80, flexShrink: 0 },
  value: { fontSize: 14, color: T.darkText, flex: 1, lineHeight: 20 },
});

const ai = StyleSheet.create({
  root:          { flex: 1, backgroundColor: T.darkBg },
  safe:          { flex: 1 },
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 20 },

  eyebrow:       { fontSize: 11, letterSpacing: 2.5, color: T.gold, fontWeight: "500", textTransform: "uppercase", marginTop: 20, marginBottom: 16 },
  title:         { fontFamily: SERIF, fontSize: 32, color: T.darkText, lineHeight: 42, marginBottom: 14 },
  intro:         { fontSize: 16, color: T.darkSub, lineHeight: 25, marginBottom: 12 },
  introDetail:   { fontSize: 14, color: T.darkFaint, lineHeight: 22, marginBottom: 20 },

  trustBanner:   {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: T.darkSurface, borderRadius: 10,
    borderWidth: 1, borderColor: T.darkBorder,
    padding: 14, marginBottom: 24,
  },
  trustTxt:      { flex: 1, fontSize: 13, color: T.darkSub, lineHeight: 20 },

  methods:       { gap: 10, marginBottom: 20 },
  methodCard:    {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: T.darkSurface, borderRadius: 12,
    borderWidth: 1, borderColor: T.darkBorder,
    padding: 16,
  },
  methodCardActive: {
    borderColor: T.gold,
    backgroundColor: "#1A2E1A",
  },
  methodCardDisabled: {
    opacity: 0.4,
  },
  methodIcon:    {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: T.darkCard,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  methodText:    { flex: 1 },
  methodLabel:   { fontFamily: SERIF, fontSize: 15, color: T.darkText, marginBottom: 2 },
  methodLabelDisabled: { fontFamily: SERIF, fontSize: 15, color: T.darkFaint, marginBottom: 2 },
  methodDetail:  { fontSize: 12, color: T.darkFaint, lineHeight: 18 },

  inlineBlock:   {
    backgroundColor: T.darkSurface, borderRadius: 12,
    borderWidth: 1, borderColor: T.darkBorder,
    padding: 16, marginBottom: 16, gap: 12,
  },
  uploadBtn:     {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: T.gold, borderRadius: 10, paddingVertical: 13,
  },
  uploadBtnTxt:  { fontSize: 15, color: T.darkBg, fontWeight: "500" },
  inlineHint:    { fontSize: 12, color: T.darkFaint, textAlign: "center" },
  linkInput:     {
    fontFamily: SERIF, fontSize: 14, color: T.darkText,
    borderWidth: 1, borderColor: T.darkBorder, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: T.darkCard,
  },
  pasteInput:    {
    fontFamily: SERIF, fontSize: 14, color: T.darkText,
    borderWidth: 1, borderColor: T.darkBorder, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: T.darkCard, minHeight: 120,
  },
  submitBtn:     {
    backgroundColor: T.gold, borderRadius: 10,
    paddingVertical: 13, alignItems: "center",
  },
  submitBtnDisabled: {
    backgroundColor: T.darkGreen, borderRadius: 10,
    paddingVertical: 13, alignItems: "center", opacity: 0.5,
  },

  footer:        { paddingHorizontal: 24, paddingBottom: 32, paddingTop: 8, alignItems: "center", gap: 6 },
  skipBtn:       { paddingVertical: 8 },
  skipTxt:       { fontSize: 14, color: T.darkFaint, fontWeight: "400", textDecorationLine: "underline" },
  skipHint:      { fontSize: 12, color: T.darkFaint, textAlign: "center", lineHeight: 18 },

  // Processing / done / error states
  centerBlock:   { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 16 },
  processingTitle: { fontFamily: SERIF, fontSize: 22, color: T.darkText, textAlign: "center", marginTop: 20 },
  processingSub:   { fontSize: 14, color: T.darkSub, textAlign: "center", lineHeight: 22 },
  doneTitle:     { fontFamily: SERIF, fontSize: 26, color: T.darkText, textAlign: "center", marginTop: 12 },
  doneSub:       { fontSize: 15, color: T.darkSub, textAlign: "center", lineHeight: 23 },
  errorTitle:    { fontFamily: SERIF, fontSize: 24, color: T.darkText, textAlign: "center" },
  errorSub:      { fontSize: 14, color: T.darkSub, textAlign: "center", lineHeight: 22, marginBottom: 8 },
  retryBtnFull:  { backgroundColor: T.gold, borderRadius: 10, paddingVertical: 14, paddingHorizontal: 32, alignItems: "center" },
  skipLink:      { fontSize: 14, color: T.darkFaint, textDecorationLine: "underline", marginTop: 8 },

  // Review state
  reviewScroll:  { flex: 1 },
  reviewContent: { paddingHorizontal: 24, paddingTop: 36, paddingBottom: 20 },
  reviewEyebrow: { fontSize: 11, letterSpacing: 2.5, color: T.gold, fontWeight: "500", textTransform: "uppercase", marginBottom: 10 },
  reviewTitle:   { fontFamily: SERIF, fontSize: 28, color: T.darkText, lineHeight: 38, marginBottom: 20 },
  reviewCards:   { gap: 12, marginBottom: 20 },
  reviewCard:    {
    backgroundColor: T.darkSurface, borderRadius: 12,
    borderWidth: 1, borderColor: T.darkBorder, padding: 16,
  },
  reviewCardLabel:{ fontSize: 11, letterSpacing: 2, color: T.gold, fontWeight: "500", textTransform: "uppercase", marginBottom: 10 },
  reviewNoData:  { fontSize: 14, color: T.darkSub, lineHeight: 22 },
  reviewFooter:  { paddingHorizontal: 24, paddingBottom: 32, paddingTop: 12, gap: 12 },
  confirmBtn:    {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: T.gold, borderRadius: 12, paddingVertical: 16,
  },
  confirmBtnTxt: { fontSize: 16, color: T.darkBg, fontWeight: "500" },
  retryBtn:      { alignItems: "center", paddingVertical: 8 },
  retryTxt:      { fontSize: 13, color: T.darkFaint, textDecorationLine: "underline" },
  privacyRow:    {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    marginTop: 12, paddingHorizontal: 4,
  },
  privacyTxt:    { flex: 1, fontSize: 12, color: T.darkFaint, lineHeight: 18 },
});

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 5 — Departure Date
// Light parchment, month/year picker + "Not sure" option
// ─────────────────────────────────────────────────────────────────────────────
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const THIS_YEAR = new Date().getFullYear();
const YEARS = [THIS_YEAR, THIS_YEAR + 1, THIS_YEAR + 2];

function DepartureDateScreen({ journeyType, onNext, onSkip }) {
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear,  setSelectedYear]  = useState(THIS_YEAR);

  const journeyLabel = journeyType === "hajj" ? "Hajj" : "Umrah";

  const handleContinue = useCallback(async () => {
    if (selectedMonth === null) { onSkip(); return; }
    const month = String(selectedMonth + 1).padStart(2, "0");
    const iso   = selectedYear + "-" + month + "-01";
    await AsyncStorage.setItem(K.departure, iso);
    onNext();
  }, [selectedMonth, selectedYear, onNext, onSkip]);

  return (
    <SafeAreaView style={ds.root}>
      <ProgressDots total={6} active={4} />

      <ScrollView
        style={ds.scroll}
        contentContainerStyle={ds.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={ds.eyebrow}>{"STEP 4 OF 5"}</Text>
        <Text style={ds.title}>{"When are you\nplanning to travel?"}</Text>
        <Text style={ds.sub}>
          {"We\u2019ll use this to count down to your " + journeyLabel + " and remind you of what to prepare."}
        </Text>

        {/* Year selector */}
        <Text style={ds.sectionLabel}>{"YEAR"}</Text>
        <View style={ds.yearRow}>
          {YEARS.map((yr) => (
            <TouchableOpacity
              key={String(yr)}
              style={selectedYear === yr ? [ds.yearPill, ds.yearPillActive] : ds.yearPill}
              onPress={() => setSelectedYear(yr)}
              activeOpacity={0.8}
            >
              <Text style={selectedYear === yr ? ds.yearTxtActive : ds.yearTxt}>
                {String(yr)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Month grid */}
        <Text style={ds.sectionLabel}>{"MONTH"}</Text>
        <View style={ds.monthGrid}>
          {MONTHS.map((m, i) => (
            <TouchableOpacity
              key={m}
              style={
                selectedMonth === i
                  ? [ds.monthCell, ds.monthCellActive]
                  : ds.monthCell
              }
              onPress={() => setSelectedMonth(i)}
              activeOpacity={0.8}
            >
              <Text style={selectedMonth === i ? ds.monthTxtActive : ds.monthTxt}>
                {m.slice(0, 3)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedMonth !== null ? (
          <Text style={ds.selectedLabel}>
            {MONTHS[selectedMonth] + " " + selectedYear}
          </Text>
        ) : null}

        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={ds.footer}>
        <TouchableOpacity style={ds.btn} onPress={handleContinue} activeOpacity={0.85}>
          <Text style={ds.btnTxt}>
            {selectedMonth !== null ? "Continue" : "I\u2019m not sure yet"}
          </Text>
          <ArrowRight size={18} color="#fff" weight="bold" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const ds = StyleSheet.create({
  root:          { flex: 1, backgroundColor: T.bg },
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 16 },
  eyebrow:       { fontSize: 11, letterSpacing: 2.5, color: T.faint, fontWeight: "500", textTransform: "uppercase", marginBottom: 16 },
  title:         { fontFamily: SERIF, fontSize: 30, color: T.text, lineHeight: 40, marginBottom: 10 },
  sub:           { fontSize: 15, color: T.sub, lineHeight: 23, marginBottom: 28 },
  sectionLabel:  { fontSize: 11, letterSpacing: 2, color: T.faint, fontWeight: "500", textTransform: "uppercase", marginBottom: 12, marginTop: 4 },
  yearRow:       { flexDirection: "row", gap: 10, marginBottom: 24 },
  yearPill:      {
    paddingHorizontal: 22, paddingVertical: 11,
    borderRadius: 999, borderWidth: 1.5, borderColor: T.border,
    backgroundColor: T.card,
  },
  yearPillActive:{ borderColor: T.primary, backgroundColor: "#EBF0EC" },
  yearTxt:       { fontSize: 15, color: T.sub, fontWeight: "400" },
  yearTxtActive: { fontSize: 15, color: T.primary, fontWeight: "500" },
  monthGrid:     { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  monthCell:     {
    width: "30%", paddingVertical: 12,
    borderRadius: 10, borderWidth: 1.5, borderColor: T.border,
    backgroundColor: T.card, alignItems: "center",
  },
  monthCellActive: { borderColor: T.primary, backgroundColor: "#EBF0EC" },
  monthTxt:      { fontSize: 14, color: T.sub },
  monthTxtActive:{ fontSize: 14, color: T.primary, fontWeight: "500" },
  selectedLabel: { fontFamily: SERIF, fontSize: 17, color: T.primary, textAlign: "center", marginBottom: 8 },
  footer:        { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16 },
  btn:           {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: T.primary, borderRadius: 12, paddingVertical: 16,
  },
  btnTxt:        { fontFamily: SERIF, fontSize: 16, color: "#fff", fontWeight: "500" },
});

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 6 — You're set
// Personalised confirmation, gold Ka'bah accent, open app CTA
// ─────────────────────────────────────────────────────────────────────────────
function ReadyScreen({ userName, journeyType, onComplete }) {
  const [saving, setSaving] = useState(false);

  const MESSAGES = {
    umrah: {
      greeting:  "\u0623\u0647\u0644\u0627\u064b \u0648\u0633\u0647\u0644\u0627\u064b",   // Ahlan wa sahlan
      title:     "May Allah accept\nyour Umrah.",
      sub:       "Your Safar is set up and ready. Explore your guide, learn your du\u02bf\u0101s, and prepare with confidence.",
      cta:       "Open Safar",
    },
    hajj: {
      greeting:  "\u0623\u0647\u0644\u0627\u064b \u0648\u0633\u0647\u0644\u0627\u064b",
      title:     "May Allah accept\nyour Hajj.",
      sub:       "Your Safar is set up and ready. Begin your step-by-step Hajj guide, learn your du\u02bf\u0101s, and track your preparation.",
      cta:       "Open Safar",
    },
    learn: {
      greeting:  "\u0623\u0647\u0644\u0627\u064b \u0648\u0633\u0647\u0644\u0627\u064b",
      title:     "Welcome to Safar.",
      sub:       "Explore guidance, du\u02bf\u0101s and sacred places at your own pace. Safar is always here when you need it.",
      cta:       "Start Exploring",
    },
  };

  const msg = MESSAGES[journeyType] || MESSAGES.learn;

  const handleComplete = useCallback(async () => {
    setSaving(true);
    await AsyncStorage.setItem(K.onboarded, "true");
    onComplete();
  }, [onComplete]);

  return (
    <View style={rs.root}>
      <Image
        source={require("../assets/kaaba_mixed.png")}
        style={rs.bg}
        resizeMode="cover"
      />
      <View style={rs.scrim} />

      <SafeAreaView style={rs.safe}>
        <ProgressDots total={6} active={5} dark />

        <View style={rs.body}>
          {/* Gold crescent / arabesque accent */}
          <View style={rs.iconRing}>
            <Text style={rs.iconSymbol}>{"\uD83D\uDD4B"}</Text>
          </View>

          <Text style={rs.greeting}>{msg.greeting}</Text>
          {userName ? (
            <Text style={rs.name}>{userName}</Text>
          ) : null}
          <Text style={rs.title}>{msg.title}</Text>
          <Text style={rs.sub}>{msg.sub}</Text>
        </View>

        <View style={rs.footer}>
          <TouchableOpacity style={rs.cta} onPress={handleComplete} activeOpacity={0.88}>
            {saving ? (
              <ActivityIndicator size="small" color={T.darkBg} />
            ) : (
              <>
                <Text style={rs.ctaTxt}>{msg.cta}</Text>
                <ArrowRight size={20} color={T.darkBg} weight="bold" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const rs = StyleSheet.create({
  root:    { flex: 1, backgroundColor: T.darkBg },
  bg:      { position: "absolute", top: 0, left: 0, width: SW, height: SH },
  scrim:   { position: "absolute", top: 0, left: 0, width: SW, height: SH, backgroundColor: "rgba(10,26,16,0.65)" },
  safe:    { flex: 1, paddingHorizontal: 28 },
  body:    { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 24 },
  iconRing:{ width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(200,169,106,0.15)", borderWidth: 1, borderColor: T.goldBorder, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  iconSymbol: { fontSize: 30 },
  greeting:{ fontSize: 14, letterSpacing: 1.5, color: T.gold, fontWeight: "400", marginBottom: 6, textAlign: "center" },
  name:    { fontFamily: SERIF, fontSize: 22, color: T.gold, textAlign: "center", marginBottom: 10 },
  title:   { fontFamily: SERIF, fontSize: 34, color: T.darkText, lineHeight: 44, textAlign: "center", marginBottom: 16 },
  sub:     { fontSize: 15, color: T.darkSub, lineHeight: 24, textAlign: "center", maxWidth: SW * 0.82 },
  footer:  { paddingBottom: 52, paddingTop: 20 },
  cta:     {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: T.gold, borderRadius: 12, paddingVertical: 16,
  },
  ctaTxt:  { fontFamily: SERIF, fontSize: 17, color: T.darkBg, fontWeight: "500" },
});

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ORCHESTRATOR
// Manages step state, passes props between screens
// ─────────────────────────────────────────────────────────────────────────────
export default function OnboardingFlow({ navigation }) {
  const [step,        setStep]        = useState(0);
  const [userName,    setUserName]    = useState("");
  const [journeyType, setJourneyType] = useState("umrah");

  // Determine total steps based on journey type
  // learn → 5 steps (no import, no date)
  // umrah/hajj → 6 steps (import + date)
  const isLearn = journeyType === "learn";

  const handleComplete = useCallback(async () => {
    await AsyncStorage.setItem(K.onboarded, "true");
    navigation.replace("MainTabs");
  }, [navigation]);

  // Step routing
  switch (step) {
    case 0:
      return <WelcomeScreen onNext={() => setStep(1)} />;

    case 1:
      return (
        <NameScreen
          onNext={(name) => {
            setUserName(name);
            setStep(2);
          }}
        />
      );

    case 2:
      return (
        <JourneyTypeScreen
          userName={userName}
          onNext={(type) => {
            setJourneyType(type);
            // Skip import + date screens for "learn"
            setStep(type === "learn" ? 5 : 3);
          }}
        />
      );

    case 3:
      // Safar Assist import — Hajj/Umrah only
      return (
        <AssistImportScreen
          journeyType={journeyType}
          onNext={() => setStep(4)}
          onSkip={() => setStep(4)}
        />
      );

    case 4:
      // Departure date — Hajj/Umrah only
      return (
        <DepartureDateScreen
          journeyType={journeyType}
          onNext={() => setStep(5)}
          onSkip={() => setStep(5)}
        />
      );

    case 5:
      return (
        <ReadyScreen
          userName={userName}
          journeyType={journeyType}
          onComplete={handleComplete}
        />
      );

    default:
      return null;
  }
}
