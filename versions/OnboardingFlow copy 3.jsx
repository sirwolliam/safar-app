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
// Warm parchment, generous padding, welcoming copy
// ─────────────────────────────────────────────────────────────────────────────
function NameScreen({ onNext }) {
  const [name, setName] = useState("");
  const inputRef = useRef(null);

  const handleContinue = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed) { inputRef.current?.focus(); return; }
    await AsyncStorage.setItem(K.name, trimmed);
    onNext(trimmed);
  }, [name, onNext]);

  const ready = name.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={ns.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={ns.safe}>
        <View style={ns.dotsRow}>
          <ProgressDots total={6} active={1} />
        </View>

        <View style={ns.body}>
          <Text style={ns.eyebrow}>STEP 1 OF 5</Text>
          <Text style={ns.title}>{"Welcome to\nSafar."}</Text>
          <Text style={ns.sub}>
            {"Please enter your name or nickname so we can\npersonalise your Safar experience."}
          </Text>

          {/* Input card — full padded box so it never touches an edge */}
          <View style={ns.inputCard}>
            <Text style={ns.inputLabel}>{"YOUR NAME OR NICKNAME"}</Text>
            <TextInput
              ref={inputRef}
              style={ns.input}
              value={name}
              onChangeText={setName}
              placeholder={"e.g. Ibrahim, Aisha, Abu Bakr\u2026"}
              placeholderTextColor={T.faint}
              autoFocus
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
          </View>
        </View>

        <View style={ns.footer}>
          <TouchableOpacity
            style={ready ? ns.btn : ns.btnDisabled}
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Text style={ready ? ns.btnTxt : ns.btnTxtDisabled}>{"Continue"}</Text>
            <ArrowRight size={18} color={ready ? "#fff" : T.faint} weight="bold" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const ns = StyleSheet.create({
  root:       { flex: 1, backgroundColor: T.bg },
  safe:       { flex: 1 },
  dotsRow:    { paddingTop: 16, paddingHorizontal: 30, alignItems: "center" },
  body:       { flex: 1, paddingTop: 44, paddingHorizontal: 30 },
  eyebrow:    {
    fontSize: 11, letterSpacing: 2.5, color: T.faint,
    fontWeight: "500", textTransform: "uppercase", marginBottom: 16,
  },
  title:      { fontFamily: SERIF, fontSize: 34, color: T.text, lineHeight: 44, marginBottom: 14 },
  sub:        { fontSize: 15, color: T.sub, lineHeight: 24, marginBottom: 36 },
  inputCard:  {
    backgroundColor: T.card, borderRadius: 14,
    borderWidth: 1.5, borderColor: T.border,
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20,
  },
  inputLabel: {
    fontSize: 10, letterSpacing: 2, color: T.faint,
    fontWeight: "500", textTransform: "uppercase", marginBottom: 10,
  },
  input:      {
    fontFamily: SERIF, fontSize: 22, color: T.text,
    borderBottomWidth: 1.5, borderBottomColor: T.primary,
    paddingVertical: 10, paddingHorizontal: 0,
    backgroundColor: "transparent",
  },
  footer:     { paddingBottom: 44, paddingTop: 20, paddingHorizontal: 30 },
  btn:        {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: T.primary, borderRadius: 12, paddingVertical: 16,
  },
  btnDisabled:{
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: T.border, borderRadius: 12, paddingVertical: 16,
  },
  btnTxt:        { fontFamily: SERIF, fontSize: 16, color: "#fff", fontWeight: "500" },
  btnTxtDisabled:{ fontFamily: SERIF, fontSize: 16, color: T.faint, fontWeight: "500" },
});

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 3 — Journey Type
// Darker cards for contrast, arabic left-aligned and larger, check bottom-right
// ─────────────────────────────────────────────────────────────────────────────
const JOURNEY_OPTIONS = [
  {
    id:     "umrah",
    label:  "Umrah",
    arabic: "\u0639\u064f\u0645\u0652\u0631\u064e\u0629",
    desc:   "I\u2019m preparing for Umrah",
    detail: "Du\u02bf\u0101s, step-by-step guide, checklist and tools tailored for Umrah.",
  },
  {
    id:     "hajj",
    label:  "Hajj",
    arabic: "\u062d\u064e\u062c\u0651",
    desc:   "I\u2019m preparing for Hajj",
    detail: "Full Hajj programme, Arafah, Muzdalifah, Jamarat and all five days.",
  },
  {
    id:     "learn",
    label:  "Just Learning",
    arabic: "\u062a\u064e\u0639\u064e\u0644\u0651\u064f\u0645",
    desc:   "I want to learn about pilgrimage",
    detail: "Explore guidance, du\u02bf\u0101s and sacred places at your own pace.",
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
      <View style={jts.dotsRow}>
        <ProgressDots total={6} active={2} />
      </View>

      <ScrollView
        style={jts.scroll}
        contentContainerStyle={jts.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={jts.eyebrow}>{"STEP 2 OF 5"}</Text>
        <Text style={jts.title}>
          {userName
            ? "What brings you\nto Safar, " + userName + "?"
            : "What brings you\nto Safar?"}
        </Text>
        <Text style={jts.sub}>
          {"We\u2019ll personalise your content and guidance\nbased on your journey."}
        </Text>

        <View style={jts.cards}>
          {JOURNEY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={selected === opt.id ? [jts.card, jts.cardSelected] : jts.card}
              onPress={() => setSelected(opt.id)}
              activeOpacity={0.82}
            >
              {/* Arabic — top left, large */}
              <Text style={selected === opt.id ? [jts.arabic, jts.arabicSelected] : jts.arabic}>
                {opt.arabic}
              </Text>

              {/* Label + description */}
              <Text style={jts.cardLabel}>{opt.label}</Text>
              <Text style={jts.cardDesc}>{opt.desc}</Text>
              <Text style={jts.cardDetail}>{opt.detail}</Text>

              {/* Check — bottom right, away from arabic */}
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
          <Text style={selected ? jts.btnTxt : jts.btnTxtDisabled}>{"Continue"}</Text>
          <ArrowRight size={18} color={selected ? "#fff" : T.faint} weight="bold" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const jts = StyleSheet.create({
  root:         { flex: 1, backgroundColor: T.bg },
  dotsRow:      { paddingTop: 16, alignItems: "center" },
  scroll:       { flex: 1 },
  scrollContent:{ paddingHorizontal: 30, paddingTop: 36, paddingBottom: 16 },
  eyebrow:      {
    fontSize: 11, letterSpacing: 2.5, color: T.faint,
    fontWeight: "500", textTransform: "uppercase", marginBottom: 16,
  },
  title:        { fontFamily: SERIF, fontSize: 30, color: T.text, lineHeight: 40, marginBottom: 10 },
  sub:          { fontSize: 15, color: T.sub, lineHeight: 23, marginBottom: 28 },
  cards:        { gap: 14, paddingBottom: 8 },

  card: {
    // Darker card background for contrast against parchment bg
    backgroundColor: "#E8E2D6",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#CFC9BC",
    padding: 20,
    position: "relative",
    minHeight: 120,
  },
  cardSelected: {
    backgroundColor: "#2F5D50",
    borderColor: "#2F5D50",
  },

  // Arabic — large, top left, flush
  arabic: {
    fontFamily: SERIF,
    fontSize: 32,
    color: T.gold,
    marginBottom: 10,
  },
  arabicSelected: {
    color: "rgba(200,169,106,0.9)",
  },

  cardLabel:    { fontFamily: SERIF, fontSize: 18, color: T.text, marginBottom: 3 },
  cardDesc:     { fontSize: 13, color: T.sub, fontWeight: "400", marginBottom: 6 },
  cardDetail:   { fontSize: 13, color: T.faint, lineHeight: 20 },

  // Selected overrides for text on dark bg
  cardLabelSelected:  { color: "#fff" },
  cardDescSelected:   { color: "rgba(255,255,255,0.75)" },
  cardDetailSelected: { color: "rgba(255,255,255,0.55)" },

  // Check sits bottom-right, not overlapping arabic
  checkBadge: {
    position: "absolute",
    bottom: 16,
    right: 16,
  },

  footer:       { paddingHorizontal: 30, paddingBottom: 44, paddingTop: 16 },
  btn:          {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: T.primary, borderRadius: 12, paddingVertical: 16,
  },
  btnDisabled:  {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: T.border, borderRadius: 12, paddingVertical: 16,
  },
  btnTxt:        { fontFamily: SERIF, fontSize: 16, color: "#fff", fontWeight: "500" },
  btnTxtDisabled:{ fontFamily: SERIF, fontSize: 16, color: T.faint, fontWeight: "500" },
});

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 4 — Safar Assist Import  (COMPLETE REDESIGN)
//
// Light parchment palette — warm, calm, part of the journey.
// Broken into 3 micro-stages that build sequentially:
//   Stage A — "What is this?" — headline + illustration placeholder + one-line intro
//   Stage B — "How it works"  — 3 simple step tiles (photo / upload / paste)
//   Stage C — "Try it now"    — active input area for the chosen method
//
// No dark room. No intimidating list. Human, friendly, brief.
// ─────────────────────────────────────────────────────────────────────────────

// Claude AI extraction — unchanged
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
    hotel:            extracted.hotel_name         || null,
    hotelAddress:     extracted.hotel_address      || null,
    airline:          extracted.airline            || null,
    flightNumber:     extracted.flight_number      || null,
    agent:            extracted.travel_agent       || null,
    groupLeader:      extracted.group_leader       || null,
    groupLeaderPhone: extracted.group_leader_phone || null,
    emergency:        extracted.emergency_contact  || null,
  };
  saves.push(AsyncStorage.setItem(K.contacts, JSON.stringify(contacts)));
  const cal = {
    departure:     extracted.departure_date  || null,
    return:        extracted.return_date     || null,
    hotelCheckin:  extracted.hotel_checkin   || null,
    hotelCheckout: extracted.hotel_checkout  || null,
  };
  saves.push(AsyncStorage.setItem(K.cal, JSON.stringify(cal)));
  if (extracted.checklist_items && extracted.checklist_items.length > 0) {
    const items = extracted.checklist_items.map((t, i) => ({
      id: "ai_" + i, text: t, done: false,
    }));
    saves.push(AsyncStorage.setItem(K.checklist, JSON.stringify(items)));
  }
  saves.push(AsyncStorage.setItem(K.board, JSON.stringify({
    hotel:      extracted.hotel_name    || null,
    departure:  extracted.departure_date || null,
    airline:    extracted.airline       || null,
    importedAt: new Date().toISOString(),
  })));
  saves.push(AsyncStorage.setItem(K.importDone, "true"));
  await Promise.all(saves);
}

// The 3 input tiles shown in Stage B
const HOW_STEPS = [
  {
    id:      "photo",
    num:     "1",
    Icon:    Camera,
    title:   "Take a photo",
    body:    "Snap your booking confirmation, email printout, or receipt.",
    expoGo:  false,
  },
  {
    id:      "upload",
    num:     "2",
    Icon:    UploadSimple,
    title:   "Upload or paste a link",
    body:    "PDF, Word doc, or a link to your Notion, Google Doc or Notes.",
    expoGo:  false,
  },
  {
    id:      "paste",
    num:     "3",
    Icon:    TextT,
    title:   "Type or paste",
    body:    "Copy your itinerary or booking details and paste them here.",
    expoGo:  true,
  },
];

function AssistImportScreen({ journeyType, onNext, onSkip }) {
  // stage: "intro" | "how" | "input" | "processing" | "review" | "done" | "error"
  const [stage,      setStage]      = useState("intro");
  const [pasteText,  setPasteText]  = useState("");
  const [linkText,   setLinkText]   = useState("");
  const [extracted,  setExtracted]  = useState(null);
  const [errorMsg,   setErrorMsg]   = useState("");

  const journeyLabel = journeyType === "hajj" ? "Hajj" : "Umrah";

  // ── Core AI call ───────────────────────────────────────────────────────────
  const processText = async (rawText) => {
    setStage("processing");
    try {
      const result = await runAIExtraction(rawText);
      setExtracted(result);
      setStage("review");
    } catch {
      setErrorMsg("Something went wrong. Please try again or skip for now.");
      setStage("error");
    }
  };

  const handlePasteSubmit = useCallback(async () => {
    if (!pasteText.trim()) return;
    await processText(pasteText.trim());
  }, [pasteText]);

  const handleLinkSubmit = useCallback(async () => {
    if (!linkText.trim()) return;
    const rawText = "Link: " + linkText.trim() +
      "\n(Extract key travel details \u2014 dates, hotel, airline, contacts.)";
    await processText(rawText);
  }, [linkText]);

  const handleConfirm = useCallback(async () => {
    if (!extracted) return;
    try {
      await saveExtractedData(extracted);
      setStage("done");
      setTimeout(() => onNext(), 1400);
    } catch {
      setErrorMsg("Could not save your details. Please try again.");
      setStage("error");
    }
  }, [extracted, onNext]);

  // ── PROCESSING ─────────────────────────────────────────────────────────────
  if (stage === "processing") {
    return (
      <SafeAreaView style={as.root}>
        <View style={as.processingWrap}>
          <ActivityIndicator size="large" color={T.primary} />
          <Text style={as.processingTitle}>{"Reading your details\u2026"}</Text>
          <Text style={as.processingSub}>
            {"Safar is securely scanning your document.\nThis takes just a moment."}
          </Text>
          <View style={as.privacyPill}>
            <Lock size={13} color={T.sub} weight="regular" />
            <Text style={as.privacyPillTxt}>
              {"Stored securely on your device only"}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── REVIEW ─────────────────────────────────────────────────────────────────
  if (stage === "review" && extracted) {
    const hasData =
      extracted.departure_date || extracted.hotel_name ||
      extracted.airline || extracted.group_leader ||
      (extracted.checklist_items && extracted.checklist_items.length > 0);

    return (
      <SafeAreaView style={as.root}>
        <ScrollView
          contentContainerStyle={as.reviewContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={as.reviewEyebrow}>{"SAFAR FOUND"}</Text>
          <Text style={as.reviewTitle}>{"Here\u2019s what\nwe\u2019ve added"}</Text>

          {hasData ? (
            <View style={as.reviewCards}>
              {(extracted.departure_date || extracted.return_date) ? (
                <View style={as.reviewCard}>
                  <Text style={as.reviewCardLabel}>{"DATES"}</Text>
                  {extracted.departure_date ? <ReviewRow icon={"Departs"} value={extracted.departure_date} /> : null}
                  {extracted.return_date    ? <ReviewRow icon={"Returns"} value={extracted.return_date}    /> : null}
                  {extracted.hotel_checkin  ? <ReviewRow icon={"Check-in"} value={extracted.hotel_checkin} /> : null}
                  {extracted.hotel_checkout ? <ReviewRow icon={"Check-out"} value={extracted.hotel_checkout} /> : null}
                </View>
              ) : null}

              {(extracted.hotel_name || extracted.airline || extracted.group_leader) ? (
                <View style={as.reviewCard}>
                  <Text style={as.reviewCardLabel}>{"CONTACTS & DETAILS"}</Text>
                  {extracted.hotel_name  ? <ReviewRow icon={"Hotel"} value={extracted.hotel_name} /> : null}
                  {extracted.airline     ? <ReviewRow icon={"Airline"} value={extracted.airline + (extracted.flight_number ? "  " + extracted.flight_number : "")} /> : null}
                  {extracted.group_leader ? <ReviewRow icon={"Leader"} value={extracted.group_leader} /> : null}
                  {extracted.travel_agent ? <ReviewRow icon={"Agent"} value={extracted.travel_agent} /> : null}
                </View>
              ) : null}

              {(extracted.checklist_items && extracted.checklist_items.length > 0) ? (
                <View style={as.reviewCard}>
                  <Text style={as.reviewCardLabel}>{"CHECKLIST ITEMS"}</Text>
                  {extracted.checklist_items.map((item, idx) => (
                    <ReviewRow key={String(idx)} icon={"\u2022"} value={item} />
                  ))}
                </View>
              ) : null}
            </View>
          ) : (
            <View style={as.reviewCard}>
              <Text style={as.reviewNoData}>
                {"We couldn\u2019t find specific travel details. You can add them manually from the Prepare tab."}
              </Text>
            </View>
          )}

          <View style={as.privacyPill}>
            <ShieldCheck size={13} color={T.sub} weight="regular" />
            <Text style={as.privacyPillTxt}>
              {"Your data is securely stored on your device and never shared."}
            </Text>
          </View>
        </ScrollView>

        <View style={as.footer}>
          <TouchableOpacity style={as.primaryBtn} onPress={handleConfirm} activeOpacity={0.88}>
            <Text style={as.primaryBtnTxt}>{"Save and continue"}</Text>
            <ArrowRight size={18} color="#fff" weight="bold" />
          </TouchableOpacity>
          <TouchableOpacity style={as.ghostBtn} onPress={() => setStage("input")} activeOpacity={0.7}>
            <Text style={as.ghostBtnTxt}>{"Try again"}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── DONE ───────────────────────────────────────────────────────────────────
  if (stage === "done") {
    return (
      <SafeAreaView style={as.root}>
        <View style={as.processingWrap}>
          <CheckCircle size={56} color={T.primary} weight="fill" />
          <Text style={as.processingTitle}>{"All saved!"}</Text>
          <Text style={as.processingSub}>
            {"Your journey details have\nbeen added to Safar."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── ERROR ──────────────────────────────────────────────────────────────────
  if (stage === "error") {
    return (
      <SafeAreaView style={as.root}>
        <View style={as.processingWrap}>
          <Text style={as.processingTitle}>{"Something went wrong"}</Text>
          <Text style={as.processingSub}>{errorMsg}</Text>
          <TouchableOpacity style={as.primaryBtn} onPress={() => setStage("input")} activeOpacity={0.85}>
            <Text style={as.primaryBtnTxt}>{"Try again"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onSkip} activeOpacity={0.7}>
            <Text style={as.skipTxt}>{"Skip for now"}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── INPUT — paste or link ──────────────────────────────────────────────────
  if (stage === "input") {
    return (
      <KeyboardAvoidingView
        style={as.root}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <SafeAreaView style={as.safe}>
          <ScrollView
            contentContainerStyle={as.inputContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity onPress={() => setStage("how")} style={as.backRow} activeOpacity={0.7}>
              <Text style={as.backArrow}>{"\u2039"}</Text>
              <Text style={as.backLbl}>{"Back"}</Text>
            </TouchableOpacity>

            <Text style={as.inputScreenTitle}>{"Paste your details"}</Text>
            <Text style={as.inputScreenSub}>
              {"Copy your booking email, itinerary, or any travel text and paste it below."}
            </Text>

            <TextInput
              style={as.pasteArea}
              value={pasteText}
              onChangeText={setPasteText}
              placeholder={"Paste your booking confirmation, email body, or travel details here\u2026"}
              placeholderTextColor={T.faint}
              multiline
              textAlignVertical="top"
            />

            <Text style={as.orDivider}>{"or paste a link"}</Text>

            <TextInput
              style={as.linkField}
              value={linkText}
              onChangeText={setLinkText}
              placeholder={"https://\u2026"}
              placeholderTextColor={T.faint}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />

            <View style={as.privacyPill}>
              <ShieldCheck size={13} color={T.sub} weight="regular" />
              <Text style={as.privacyPillTxt}>
                {"Your data is securely ingested and stored in your private Safar profile on your device. It is never shared or sold."}
              </Text>
            </View>
          </ScrollView>

          <View style={as.footer}>
            <TouchableOpacity
              style={pasteText.trim() || linkText.trim() ? as.primaryBtn : as.primaryBtnDisabled}
              onPress={pasteText.trim() ? handlePasteSubmit : handleLinkSubmit}
              activeOpacity={0.88}
            >
              <Text style={as.primaryBtnTxt}>{"Extract my details"}</Text>
              <ArrowRight size={18} color="#fff" weight="bold" />
            </TouchableOpacity>
            <TouchableOpacity style={as.ghostBtn} onPress={onSkip} activeOpacity={0.7}>
              <Text style={as.ghostBtnTxt}>{"I\u2019ll add details later"}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }

  // ── HOW IT WORKS — 3 step tiles ───────────────────────────────────────────
  if (stage === "how") {
    return (
      <SafeAreaView style={as.root}>
        <ScrollView
          contentContainerStyle={as.howContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={as.dotsRow}>
            <ProgressDots total={6} active={3} />
          </View>

          <Text style={as.eyebrow}>{"STEP 3 OF 5  \u00b7  SAFAR ASSIST"}</Text>
          <Text style={as.howTitle}>{"Here\u2019s how\nit works"}</Text>
          <Text style={as.howSub}>
            {"Three ways to share your " + journeyLabel + " booking details.\nSafar reads them and fills everything in for you."}
          </Text>

          <View style={as.stepTiles}>
            {HOW_STEPS.map((step) => (
              <View key={step.id} style={as.stepTile}>
                <View style={as.stepNumBadge}>
                  <Text style={as.stepNum}>{step.num}</Text>
                </View>
                <View style={as.stepIconCircle}>
                  <step.Icon
                    size={24}
                    color={step.expoGo ? T.primary : T.faint}
                    weight="regular"
                  />
                </View>
                <View style={as.stepText}>
                  <Text style={step.expoGo ? as.stepTitle : as.stepTitleDim}>
                    {step.title}
                  </Text>
                  <Text style={as.stepBody}>{step.body}</Text>
                  {step.expoGo === false ? (
                    <Text style={as.comingSoon}>{"Available in the full app"}</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>

          {/* GIF / diagram placeholder — swap src for actual asset */}
          <View style={as.diagramBox}>
            <Text style={as.diagramPlaceholder}>
              {"[ Animated diagram goes here ]\nPhoto \u2192 Safar reads it \u2192 Dates, contacts & checklist added automatically"}
            </Text>
          </View>

          <View style={as.privacyPill}>
            <ShieldCheck size={13} color={T.sub} weight="regular" />
            <Text style={as.privacyPillTxt}>
              {"Your data is securely ingested and stored in your private Safar profile on your device. It is never shared or sold."}
            </Text>
          </View>
        </ScrollView>

        <View style={as.footer}>
          <TouchableOpacity style={as.primaryBtn} onPress={() => setStage("input")} activeOpacity={0.88}>
            <Text style={as.primaryBtnTxt}>{"Let\u2019s try it"}</Text>
            <ArrowRight size={18} color="#fff" weight="bold" />
          </TouchableOpacity>
          <TouchableOpacity style={as.ghostBtn} onPress={onSkip} activeOpacity={0.7}>
            <Text style={as.ghostBtnTxt}>{"I\u2019ll add details later"}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── INTRO — first thing user sees ─────────────────────────────────────────
  return (
    <SafeAreaView style={as.root}>
      <ScrollView
        contentContainerStyle={as.introContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={as.dotsRow}>
          <ProgressDots total={6} active={3} />
        </View>

        <Text style={as.eyebrow}>{"STEP 3 OF 5  \u00b7  SAFAR ASSIST"}</Text>
        <Text style={as.introTitle}>
          {"Let Safar set\nup your trip\nfor you."}
        </Text>

        {/* Hero illustration placeholder — replace with collage image */}
        <View style={as.heroBox}>
          <Text style={as.heroPlaceholder}>
            {"[ Collage image: person speaking into phone,\ntaking photo of receipt, uploading a doc ]"}
          </Text>
          <Text style={as.heroCaption}>
            {"Share your booking once. Safar fills in the rest."}
          </Text>
        </View>

        <Text style={as.introBody}>
          {"You\u2019ve got your " + journeyLabel + " booking sorted. Now let Safar handle the admin \u2014 your dates, hotel, contacts and checklist, all set up automatically."}
        </Text>

        <View style={as.benefitRow}>
          <CheckCircle size={18} color={T.primary} weight="fill" />
          <Text style={as.benefitTxt}>{"Flight dates added to your calendar"}</Text>
        </View>
        <View style={as.benefitRow}>
          <CheckCircle size={18} color={T.primary} weight="fill" />
          <Text style={as.benefitTxt}>{"Hotel and contacts saved automatically"}</Text>
        </View>
        <View style={as.benefitRow}>
          <CheckCircle size={18} color={T.primary} weight="fill" />
          <Text style={as.benefitTxt}>{"Checklist items pulled from your booking"}</Text>
        </View>

        <View style={as.privacyPill}>
          <ShieldCheck size={13} color={T.sub} weight="regular" />
          <Text style={as.privacyPillTxt}>
            {"Your data is securely ingested and stored in your private Safar profile on your device. It is never shared or sold."}
          </Text>
        </View>
      </ScrollView>

      <View style={as.footer}>
        <TouchableOpacity style={as.primaryBtn} onPress={() => setStage("how")} activeOpacity={0.88}>
          <Text style={as.primaryBtnTxt}>{"Show me how"}</Text>
          <ArrowRight size={18} color="#fff" weight="bold" />
        </TouchableOpacity>
        <TouchableOpacity style={as.ghostBtn} onPress={onSkip} activeOpacity={0.7}>
          <Text style={as.ghostBtnTxt}>{"I\u2019ll add details later"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Review row — shared helper (light palette version)
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
  icon:  { fontSize: 12, color: T.faint, width: 70, flexShrink: 0 },
  value: { fontSize: 14, color: T.text, flex: 1, lineHeight: 20 },
});

const as = StyleSheet.create({
  root:        { flex: 1, backgroundColor: T.bg },
  safe:        { flex: 1 },
  dotsRow:     { paddingTop: 16, alignItems: "center", marginBottom: 0 },
  eyebrow:     {
    fontSize: 11, letterSpacing: 2.5, color: T.faint,
    fontWeight: "500", textTransform: "uppercase",
    marginTop: 20, marginBottom: 14,
  },

  // ── INTRO ──
  introContent:  { paddingHorizontal: 30, paddingTop: 20, paddingBottom: 20 },
  introTitle:    { fontFamily: SERIF, fontSize: 36, color: T.text, lineHeight: 48, marginBottom: 24 },
  introBody:     { fontSize: 15, color: T.sub, lineHeight: 24, marginBottom: 20 },
  heroBox:       {
    backgroundColor: T.card, borderRadius: 16,
    borderWidth: 1.5, borderColor: T.border,
    padding: 20, marginBottom: 24,
    alignItems: "center", minHeight: 160,
    justifyContent: "center",
  },
  heroPlaceholder: { fontSize: 13, color: T.faint, textAlign: "center", lineHeight: 20, marginBottom: 10 },
  heroCaption:     { fontFamily: SERIF, fontSize: 14, color: T.primary, textAlign: "center", fontStyle: "italic" },
  benefitRow:    { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  benefitTxt:    { fontSize: 15, color: T.text, flex: 1, lineHeight: 22 },

  // ── HOW IT WORKS ──
  howContent:   { paddingHorizontal: 30, paddingTop: 20, paddingBottom: 20 },
  howTitle:     { fontFamily: SERIF, fontSize: 32, color: T.text, lineHeight: 42, marginBottom: 10 },
  howSub:       { fontSize: 15, color: T.sub, lineHeight: 23, marginBottom: 28 },
  stepTiles:    { gap: 14, marginBottom: 24 },
  stepTile:     {
    flexDirection: "row", alignItems: "flex-start", gap: 14,
    backgroundColor: T.card, borderRadius: 14,
    borderWidth: 1.5, borderColor: T.border,
    padding: 16,
  },
  stepNumBadge: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: T.primary, alignItems: "center", justifyContent: "center",
    flexShrink: 0, marginTop: 2,
  },
  stepNum:      { fontSize: 12, color: "#fff", fontWeight: "700" },
  stepIconCircle:{
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "#EBF0EC", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  stepText:     { flex: 1 },
  stepTitle:    { fontFamily: SERIF, fontSize: 16, color: T.text, marginBottom: 4 },
  stepTitleDim: { fontFamily: SERIF, fontSize: 16, color: T.faint, marginBottom: 4 },
  stepBody:     { fontSize: 13, color: T.sub, lineHeight: 20 },
  comingSoon:   { fontSize: 11, color: T.gold, marginTop: 4, fontWeight: "500" },
  diagramBox:   {
    backgroundColor: T.card, borderRadius: 14,
    borderWidth: 1.5, borderColor: T.border,
    borderStyle: "dashed",
    padding: 20, marginBottom: 20,
    alignItems: "center", minHeight: 120, justifyContent: "center",
  },
  diagramPlaceholder: { fontSize: 13, color: T.faint, textAlign: "center", lineHeight: 22 },

  // ── INPUT ──
  inputContent:     { paddingHorizontal: 30, paddingTop: 16, paddingBottom: 20 },
  backRow:          { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 24 },
  backArrow:        { fontSize: 26, color: T.primary, lineHeight: 30 },
  backLbl:          { fontSize: 15, color: T.primary, fontWeight: "500" },
  inputScreenTitle: { fontFamily: SERIF, fontSize: 28, color: T.text, lineHeight: 38, marginBottom: 10 },
  inputScreenSub:   { fontSize: 15, color: T.sub, lineHeight: 23, marginBottom: 24 },
  pasteArea:        {
    fontFamily: SERIF, fontSize: 14, color: T.text,
    backgroundColor: T.card, borderRadius: 12,
    borderWidth: 1.5, borderColor: T.border,
    padding: 16, minHeight: 140, marginBottom: 16,
    textAlignVertical: "top",
  },
  orDivider:        { fontSize: 12, color: T.faint, textAlign: "center", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 },
  linkField:        {
    fontFamily: SERIF, fontSize: 14, color: T.text,
    backgroundColor: T.card, borderRadius: 12,
    borderWidth: 1.5, borderColor: T.border,
    paddingHorizontal: 16, paddingVertical: 14,
    marginBottom: 20,
  },

  // ── REVIEW ──
  reviewContent:   { paddingHorizontal: 30, paddingTop: 40, paddingBottom: 20 },
  reviewEyebrow:   { fontSize: 11, letterSpacing: 2.5, color: T.faint, fontWeight: "500", textTransform: "uppercase", marginBottom: 10 },
  reviewTitle:     { fontFamily: SERIF, fontSize: 30, color: T.text, lineHeight: 40, marginBottom: 24 },
  reviewCards:     { gap: 12, marginBottom: 20 },
  reviewCard:      {
    backgroundColor: T.card, borderRadius: 12,
    borderWidth: 1.5, borderColor: T.border, padding: 16,
  },
  reviewCardLabel: { fontSize: 10, letterSpacing: 2, color: T.faint, fontWeight: "500", textTransform: "uppercase", marginBottom: 10 },
  reviewNoData:    { fontSize: 14, color: T.sub, lineHeight: 22 },

  // ── PROCESSING / DONE / ERROR ──
  processingWrap:  { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 18 },
  processingTitle: { fontFamily: SERIF, fontSize: 24, color: T.text, textAlign: "center" },
  processingSub:   { fontSize: 15, color: T.sub, textAlign: "center", lineHeight: 24 },

  // ── SHARED ──
  privacyPill:     {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    backgroundColor: T.card, borderRadius: 10,
    borderWidth: 1, borderColor: T.border,
    padding: 12, marginTop: 16,
  },
  privacyPillTxt:  { flex: 1, fontSize: 12, color: T.sub, lineHeight: 18 },

  footer:          { paddingHorizontal: 30, paddingBottom: 44, paddingTop: 12, gap: 12 },
  primaryBtn:      {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: T.primary, borderRadius: 12, paddingVertical: 16,
  },
  primaryBtnDisabled: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: T.border, borderRadius: 12, paddingVertical: 16,
  },
  primaryBtnTxt:   { fontFamily: SERIF, fontSize: 16, color: "#fff", fontWeight: "500" },
  ghostBtn:        { alignItems: "center", paddingVertical: 8 },
  ghostBtnTxt:     { fontSize: 14, color: T.faint, textDecorationLine: "underline" },
  skipTxt:         { fontSize: 14, color: T.faint, textDecorationLine: "underline", marginTop: 8 },
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
