/**
 * MyJourneyScreen.jsx — Safar
 * Personal pilgrim dashboard.
 * Sections: journey type toggle · departure card · progress ring ·
 *           quick-access tiles (Board · Checklist · Contacts · Groups) ·
 *           intention card · milestones strip · next step card
 *
 * Navigation: receives `navigation` prop from HomeStack / GuidesStack
 * AsyncStorage keys:
 *   safar_journey_type_v1    — "Umrah" | "Hajj"
 *   safar_departure_v1       — ISO date string
 *   safar_intention_v1       — string
 *   safar_checklist_v1       — array of {id, label, done}
 *   safar_milestones_v1      — array of {id, label, ts}
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, { Circle, Path, G, Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import { colors, spacing, radius, shadows, typography } from "../theme";

const SERIF = "SourceSerif4-Regular";
const { width: SW } = Dimensions.get("window");

const JOURNEY_TYPE_KEY = "safar_journey_type_v1";
const DEPARTURE_KEY    = "safar_departure_v1";
const INTENTION_KEY    = "safar_intention_v1";
const CHECKLIST_KEY    = "safar_checklist_v1";
const MILESTONES_KEY   = "safar_milestones_v1";

// ── Colour constants ──────────────────────────────────────────────────────────
const C = {
  bg:         "#F5F0E8",
  card:       "#FDFAF4",
  cardAlt:    "#EDE6D8",
  green:      "#2F5D50",
  greenLight: "#4A7A60",
  greenMid:   "#3D6B52",
  sage:       "#4A5C48",
  gold:       "#B8922A",
  goldLight:  "#C8A96A",
  goldBorder: "rgba(184,146,42,0.35)",
  goldSurface:"#F5E8C8",
  text:       "#1C1A14",
  mid:        "#5C5040",
  sub:        "#7A7060",
  border:     "#EAE4DC",
  heroBg:     "#1A2818",
  heroText:   "#F0E8C8",
};

// ── Default checklists ────────────────────────────────────────────────────────
const DEFAULT_UMRAH_CHECKLIST = [
  { id:"u1",  label:"Book flights",             done:false },
  { id:"u2",  label:"Book hotel in Makkah",     done:false },
  { id:"u3",  label:"Apply for Umrah visa",     done:false },
  { id:"u4",  label:"Ihraam garments (men)",    done:false },
  { id:"u5",  label:"Sandals without stitching",done:false },
  { id:"u6",  label:"Zamzam bottle",            done:false },
  { id:"u7",  label:"Learn Talbiyah by heart",  done:false },
  { id:"u8",  label:"Memorise Tawaf intention", done:false },
  { id:"u9",  label:"Nusuk app + permit",       done:false },
  { id:"u10", label:"Emergency contacts saved", done:false },
  { id:"u11", label:"Travel insurance",         done:false },
  { id:"u12", label:"Download duas offline",    done:false },
];

const DEFAULT_HAJJ_CHECKLIST = [
  { id:"h1",  label:"Book Hajj package",        done:false },
  { id:"h2",  label:"Hajj visa obtained",       done:false },
  { id:"h3",  label:"Ihraam garments (men)",    done:false },
  { id:"h4",  label:"Memorise Talbiyah",        done:false },
  { id:"h5",  label:"Memorise Arafah duas",     done:false },
  { id:"h6",  label:"Sandals without stitching",done:false },
  { id:"h7",  label:"Meningitis vaccination",   done:false },
  { id:"h8",  label:"Nusuk Hajj permit",        done:false },
  { id:"h9",  label:"Mina tent assignment",     done:false },
  { id:"h10", label:"Group contact plan",       done:false },
  { id:"h11", label:"Zamzam bottle",            done:false },
  { id:"h12", label:"Emergency contacts saved", done:false },
  { id:"h13", label:"Travel insurance",         done:false },
  { id:"h14", label:"Download duas offline",    done:false },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function daysUntil(isoDate) {
  if (!isoDate) return null;
  const now  = new Date();
  const dep  = new Date(isoDate);
  const diff = Math.ceil((dep - now) / (1000 * 60 * 60 * 24));
  return diff;
}

function formatDate(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" });
}

// ── Progress ring SVG ─────────────────────────────────────────────────────────
function ProgressRing({ pct = 0, size = 80, stroke = 6 }) {
  const r   = (size - stroke) / 2;
  const cx  = size / 2;
  const cy  = size / 2;
  const circ = 2 * Math.PI * r;
  const filled = circ * Math.min(1, pct / 100);

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={C.goldLight} />
          <Stop offset="1" stopColor={C.gold} />
        </LinearGradient>
      </Defs>
      {/* Track */}
      <Circle
        cx={cx} cy={cy} r={r}
        stroke={C.border} strokeWidth={stroke} fill="none"
      />
      {/* Filled arc */}
      {pct > 0 && (
        <Circle
          cx={cx} cy={cy} r={r}
          stroke="url(#ringGrad)" strokeWidth={stroke} fill="none"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      )}
      {/* Centre text */}
      {/* Note: SVG Text needs react-native-svg Text — use overlay instead */}
    </Svg>
  );
}

// ── Section divider ───────────────────────────────────────────────────────────
function SectionDivider({ title }) {
  return (
    <View style={sd.row}>
      <View style={sd.bar} />
      <Text style={sd.label}>{title}</Text>
      <View style={sd.line} />
    </View>
  );
}
const sd = StyleSheet.create({
  row:   { flexDirection:"row", alignItems:"center", gap:10, marginBottom:12, marginTop:24 },
  bar:   { width:3, height:18, borderRadius:2, backgroundColor:C.green },
  label: { fontFamily:SERIF, fontSize:16, fontWeight:"700", color:C.green },
  line:  { flex:1, height:1, backgroundColor:C.border },
});

// ── Tile button ───────────────────────────────────────────────────────────────
function Tile({ icon, label, sub, onPress, accent }) {
  return (
    <TouchableOpacity
      style={[tl.tile, accent ? tl.tileAccent : null]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      <View style={[tl.iconBox, accent ? tl.iconBoxAccent : null]}>
        <Text style={tl.icon}>{icon}</Text>
      </View>
      <Text style={[tl.label, accent ? tl.labelAccent : null]}>{label}</Text>
      {sub ? <Text style={tl.sub}>{sub}</Text> : null}
    </TouchableOpacity>
  );
}
const TILE_W = (SW - spacing(2.5) * 2 - spacing(1.5)) / 2;
const tl = StyleSheet.create({
  tile: {
    width: TILE_W,
    backgroundColor: C.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: C.border,
    padding: spacing(2),
    alignItems: "flex-start",
    ...shadows.card,
  },
  tileAccent: {
    borderColor: C.goldBorder,
    backgroundColor: "#FFFDF6",
  },
  iconBox: {
    width: 40, height: 40,
    borderRadius: radius.md,
    backgroundColor: C.cardAlt,
    alignItems: "center", justifyContent: "center",
    marginBottom: spacing(1),
  },
  iconBoxAccent: {
    backgroundColor: C.goldSurface,
  },
  icon:  { fontSize: 20 },
  label: { fontFamily:SERIF, fontSize:15, fontWeight:"600", color:C.text, marginBottom:2 },
  labelAccent: { color: C.green },
  sub:   { fontSize:12, color:C.sub, lineHeight:16 },
});

// ── Checklist mini-row ────────────────────────────────────────────────────────
function CheckRow({ item, onToggle }) {
  return (
    <TouchableOpacity style={ck.row} onPress={() => onToggle(item.id)} activeOpacity={0.75}>
      <View style={[ck.box, item.done ? ck.boxDone : null]}>
        {item.done ? <Text style={ck.tick}>{"\u2713"}</Text> : null}
      </View>
      <Text style={[ck.label, item.done ? ck.labelDone : null]}>{item.label}</Text>
    </TouchableOpacity>
  );
}
const ck = StyleSheet.create({
  row:      { flexDirection:"row", alignItems:"center", paddingVertical:7, gap:12 },
  box:      { width:20, height:20, borderRadius:5, borderWidth:1.5, borderColor:C.border, alignItems:"center", justifyContent:"center" },
  boxDone:  { backgroundColor:C.green, borderColor:C.green },
  tick:     { color:"#fff", fontSize:12, fontWeight:"700" },
  label:    { flex:1, fontSize:14, color:C.text, lineHeight:20 },
  labelDone:{ color:C.sub, textDecorationLine:"line-through" },
});

// ── Milestone chip ────────────────────────────────────────────────────────────
function MilestoneChip({ label, onDelete }) {
  return (
    <View style={ms.chip}>
      <Text style={ms.star}>{"\u2605"}</Text>
      <Text style={ms.label}>{label}</Text>
      <TouchableOpacity onPress={onDelete} hitSlop={{top:8,bottom:8,left:8,right:8}}>
        <Text style={ms.del}>{"\u00d7"}</Text>
      </TouchableOpacity>
    </View>
  );
}
const ms = StyleSheet.create({
  chip:  { flexDirection:"row", alignItems:"center", backgroundColor:C.goldSurface, borderRadius:radius.pill, borderWidth:1, borderColor:C.goldBorder, paddingHorizontal:12, paddingVertical:6, gap:6, marginBottom:8, marginRight:8 },
  star:  { fontSize:12, color:C.gold },
  label: { fontSize:13, color:C.green, fontFamily:SERIF, flexShrink:1 },
  del:   { fontSize:16, color:C.sub, lineHeight:18 },
});

// ═════════════════════════════════════════════════════════════════════════════
// Main screen
// ═════════════════════════════════════════════════════════════════════════════
export default function MyJourneyScreen({ navigation }) {
  const [journeyType, setJourneyType] = useState("Umrah");
  const [departure,   setDeparture]   = useState(null);
  const [intention,   setIntention]   = useState("");
  const [checklist,   setChecklist]   = useState([]);
  const [milestones,  setMilestones]  = useState([]);

  // modals
  const [showIntentionModal,  setShowIntentionModal]  = useState(false);
  const [showDepartureModal,  setShowDepartureModal]  = useState(false);
  const [showMilestoneModal,  setShowMilestoneModal]  = useState(false);
  const [showFullChecklist,   setShowFullChecklist]   = useState(false);

  // editing
  const [intentionDraft,  setIntentionDraft]  = useState("");
  const [departureDraft,  setDepartureDraft]  = useState("");
  const [milestoneDraft,  setMilestoneDraft]  = useState("");

  // ── Load persisted state ────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [jt, dep, int, ck, ml] = await Promise.all([
          AsyncStorage.getItem(JOURNEY_TYPE_KEY),
          AsyncStorage.getItem(DEPARTURE_KEY),
          AsyncStorage.getItem(INTENTION_KEY),
          AsyncStorage.getItem(CHECKLIST_KEY),
          AsyncStorage.getItem(MILESTONES_KEY),
        ]);
        const type = jt || "Umrah";
        setJourneyType(type);
        if (dep) setDeparture(dep);
        if (int) setIntention(int);
        if (ck)  setChecklist(JSON.parse(ck));
        else     setChecklist(type === "Hajj" ? DEFAULT_HAJJ_CHECKLIST : DEFAULT_UMRAH_CHECKLIST);
        if (ml)  setMilestones(JSON.parse(ml));
      } catch (_) {}
    })();
  }, []);

  // ── Persist helpers ─────────────────────────────────────────────────────────
  const saveJourneyType = useCallback(async (type) => {
    setJourneyType(type);
    await AsyncStorage.setItem(JOURNEY_TYPE_KEY, type).catch(() => {});
    // reset checklist to correct defaults if empty
    setChecklist(prev => {
      if (prev.length === 0) {
        const def = type === "Hajj" ? DEFAULT_HAJJ_CHECKLIST : DEFAULT_UMRAH_CHECKLIST;
        AsyncStorage.setItem(CHECKLIST_KEY, JSON.stringify(def)).catch(() => {});
        return def;
      }
      return prev;
    });
  }, []);

  const saveIntention = useCallback(async (val) => {
    setIntention(val);
    await AsyncStorage.setItem(INTENTION_KEY, val).catch(() => {});
  }, []);

  const saveDeparture = useCallback(async (val) => {
    setDeparture(val);
    await AsyncStorage.setItem(DEPARTURE_KEY, val).catch(() => {});
  }, []);

  const toggleCheck = useCallback(async (id) => {
    setChecklist(prev => {
      const next = prev.map(i => i.id === id ? { ...i, done: !i.done } : i);
      AsyncStorage.setItem(CHECKLIST_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const addMilestone = useCallback(async (label) => {
    if (!label.trim()) return;
    setMilestones(prev => {
      const next = [{ id: Date.now().toString(), label: label.trim(), ts: new Date().toISOString() }, ...prev];
      AsyncStorage.setItem(MILESTONES_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const deleteMilestone = useCallback(async (id) => {
    setMilestones(prev => {
      const next = prev.filter(m => m.id !== id);
      AsyncStorage.setItem(MILESTONES_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  // ── Derived values ──────────────────────────────────────────────────────────
  const donePct  = checklist.length > 0
    ? Math.round((checklist.filter(i => i.done).length / checklist.length) * 100)
    : 0;
  const doneCount = checklist.filter(i => i.done).length;
  const days = daysUntil(departure);

  const previewChecklist = checklist.slice(0, 5);
  const remaining = checklist.filter(i => !i.done).slice(0, 1)[0];

  // ── Umrah/Hajj next step ────────────────────────────────────────────────────
  const NEXT_STEPS_UMRAH = [
    { pct:[0,25],   step:"Learn the Talbiyah",            screen:"PracticeLearn" },
    { pct:[25,50],  step:"Study the Tawaf steps",         screen:"UmrahGuide"    },
    { pct:[50,75],  step:"Memorise the Sa\u02bfy du\u02bfa\u02be\u02be", screen:"PilgrimageDuas" },
    { pct:[75,99],  step:"Final packing & preparation",   screen:null            },
    { pct:[99,101], step:"You\u2019re ready. Tawakkalna \u02bfala-ll\u0101h", screen:null },
  ];
  const NEXT_STEPS_HAJJ = [
    { pct:[0,20],   step:"Study the Hajj overview",       screen:"HajjGuide"     },
    { pct:[20,45],  step:"Memorise Arafah du\u02bfa\u02be\u02be",        screen:"PilgrimageDuas" },
    { pct:[45,70],  step:"Review Mina & Muzdalifah steps",screen:"HajjGuide"     },
    { pct:[70,95],  step:"Final packing & preparation",   screen:null            },
    { pct:[95,101], step:"You\u2019re ready. Labbayk All\u0101humma labbayk", screen:null },
  ];
  const steps = journeyType === "Hajj" ? NEXT_STEPS_HAJJ : NEXT_STEPS_UMRAH;
  const nextStep = steps.find(s => donePct >= s.pct[0] && donePct < s.pct[1]) || steps[steps.length - 1];

  // ═══════════════════════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.75}>
            <Text style={s.backArrow}>{"\u2039"}</Text>
          </TouchableOpacity>
          <View style={s.headerTextWrap}>
            <Text style={s.headerTitle}>My Journey</Text>
            <Text style={s.headerSub}>Personal pilgrimage dashboard</Text>
          </View>
        </View>

        {/* ── Toggle: Umrah / Hajj ────────────────────────────────────────── */}
        <View style={s.toggleRow}>
          <TouchableOpacity
            style={[s.toggleBtn, journeyType === "Umrah" ? s.toggleActive : null]}
            onPress={() => saveJourneyType("Umrah")}
            activeOpacity={0.82}
          >
            <Text style={[s.toggleTxt, journeyType === "Umrah" ? s.toggleTxtActive : null]}>Umrah</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.toggleBtn, journeyType === "Hajj" ? s.toggleActive : null]}
            onPress={() => saveJourneyType("Hajj")}
            activeOpacity={0.82}
          >
            <Text style={[s.toggleTxt, journeyType === "Hajj" ? s.toggleTxtActive : null]}>Hajj</Text>
          </TouchableOpacity>
        </View>

        {/* ── Departure card ──────────────────────────────────────────────── */}
        <TouchableOpacity
          style={s.departureCard}
          onPress={() => { setDepartureDraft(departure || ""); setShowDepartureModal(true); }}
          activeOpacity={0.85}
        >
          <View style={s.departureLeft}>
            <Text style={s.departureEyebrow}>Departure</Text>
            {departure ? (
              <>
                <Text style={s.departureDate}>{formatDate(departure)}</Text>
                <Text style={s.departureSub}>
                  {days === null ? "" :
                   days > 0  ? `${days} day${days !== 1 ? "s" : ""} to go` :
                   days === 0 ? "Today \u2014 Bismillah!" :
                   "Journey underway"}
                </Text>
              </>
            ) : (
              <Text style={s.departurePlaceholder}>Tap to set your departure date</Text>
            )}
          </View>
          {/* Countdown badge */}
          {days !== null && days >= 0 ? (
            <View style={s.countdownBadge}>
              <Text style={s.countdownNum}>{days > 99 ? "99+" : days}</Text>
              <Text style={s.countdownLabel}>days</Text>
            </View>
          ) : (
            <View style={s.addDateBtn}>
              <Text style={s.addDateTxt}>{"\u002b"}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* ── Progress ring + next step ───────────────────────────────────── */}
        <View style={s.progressCard}>
          <View style={s.ringWrap}>
            <ProgressRing pct={donePct} size={84} stroke={7} />
            {/* Overlay text */}
            <View style={s.ringOverlay}>
              <Text style={s.ringPct}>{donePct}<Text style={s.ringPctSym}>%</Text></Text>
            </View>
          </View>
          <View style={s.progressRight}>
            <Text style={s.progressTitle}>Preparation progress</Text>
            <Text style={s.progressSub}>{doneCount} of {checklist.length} tasks complete</Text>
            <View style={s.progressBar}>
              <View style={[s.progressFill, { width:`${donePct}%` }]} />
            </View>
            {nextStep ? (
              <TouchableOpacity
                style={s.nextStepChip}
                onPress={() => nextStep.screen ? navigation?.navigate?.(nextStep.screen) : null}
                activeOpacity={nextStep.screen ? 0.8 : 1}
              >
                <Text style={s.nextStepLabel}>Up next: </Text>
                <Text style={s.nextStepTxt} numberOfLines={1}>{nextStep.step}</Text>
                {nextStep.screen ? <Text style={s.nextStepArrow}>{" \u203a"}</Text> : null}
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* ── Quick-access tiles ──────────────────────────────────────────── */}
        <SectionDivider title="MY JOURNEY" />
        <View style={s.tileGrid}>
          <Tile
            icon={"\uD83D\uDCCB"}
            label="My Board"
            sub="Notes, intentions, links"
            onPress={() => navigation?.navigate?.("MyBoard")}
            accent={false}
          />
          <Tile
            icon={"\u2713"}
            label="Checklist"
            sub={`${doneCount}/${checklist.length} done`}
            onPress={() => setShowFullChecklist(true)}
            accent={donePct < 100}
          />
          <Tile
            icon={"\uD83D\uDCDE"}
            label="Contacts"
            sub="Hotel, guide, group"
            onPress={() => navigation?.navigate?.("MyContacts")}
            accent={false}
          />
          <Tile
            icon={"\uD83D\uDC65"}
            label="Groups"
            sub="Pilgrimage family"
            onPress={() => navigation?.navigate?.("Groups")}
            accent={false}
          />
        </View>

        {/* ── Intention card ──────────────────────────────────────────────── */}
        <SectionDivider title="MY INTENTION" />
        <TouchableOpacity
          style={s.intentionCard}
          onPress={() => { setIntentionDraft(intention); setShowIntentionModal(true); }}
          activeOpacity={0.85}
        >
          {intention ? (
            <>
              <Text style={s.intentionArabic}>{"\uD83E\uDD32"}</Text>
              <Text style={s.intentionText}>{intention}</Text>
              <Text style={s.intentionEdit}>Edit intention</Text>
            </>
          ) : (
            <>
              <Text style={s.intentionPromptIcon}>{"\uD83E\uDD32"}</Text>
              <Text style={s.intentionPrompt}>Write your intention for this journey</Text>
              <Text style={s.intentionSub}>A sincere niyyah is the foundation of every act of worship</Text>
              <View style={s.intentionAddBtn}>
                <Text style={s.intentionAddTxt}>Add intention</Text>
              </View>
            </>
          )}
        </TouchableOpacity>

        {/* ── Checklist preview ───────────────────────────────────────────── */}
        <SectionDivider title="PREPARATION CHECKLIST" />
        <View style={s.checkCard}>
          {previewChecklist.map(item => (
            <CheckRow key={item.id} item={item} onToggle={toggleCheck} />
          ))}
          {checklist.length > 5 ? (
            <TouchableOpacity style={s.viewAllBtn} onPress={() => setShowFullChecklist(true)} activeOpacity={0.8}>
              <Text style={s.viewAllTxt}>View all {checklist.length} items</Text>
              <Text style={s.viewAllArrow}>{" \u203a"}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* ── Milestones ──────────────────────────────────────────────────── */}
        <SectionDivider title="MILESTONES" />
        <View style={s.milestonesCard}>
          {milestones.length === 0 ? (
            <Text style={s.milestonesEmpty}>
              Record moments of your journey{" \u2014"} completing Tawaf, reaching Arafah, your first sight of the Ka{"\u02bf"}bah.
            </Text>
          ) : (
            <View style={s.milestoneWrap}>
              {milestones.map(m => (
                <MilestoneChip key={m.id} label={m.label} onDelete={() => deleteMilestone(m.id)} />
              ))}
            </View>
          )}
          <TouchableOpacity style={s.addMilestoneBtn} onPress={() => { setMilestoneDraft(""); setShowMilestoneModal(true); }} activeOpacity={0.82}>
            <Text style={s.addMilestoneTxt}>{"\u002b\u0020"}Add milestone</Text>
          </TouchableOpacity>
        </View>

        {/* ── Guidance strip ──────────────────────────────────────────────── */}
        <SectionDivider title="GUIDANCE" />
        <View style={s.guidanceRow}>
          <TouchableOpacity style={s.guidanceBtn} onPress={() => navigation?.navigate?.(journeyType === "Hajj" ? "HajjGuide" : "UmrahGuide")} activeOpacity={0.85}>
            <Text style={s.guidanceBtnIcon}>{"\uD83D\uDCD6"}</Text>
            <Text style={s.guidanceBtnLabel}>{journeyType} Guide</Text>
            <Text style={s.guidanceBtnArrow}>{"\u203a"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.guidanceBtn} onPress={() => navigation?.navigate?.("PilgrimageDuas")} activeOpacity={0.85}>
            <Text style={s.guidanceBtnIcon}>{"\uD83E\uDD32"}</Text>
            <Text style={s.guidanceBtnLabel}>{journeyType} Du{"\u02bf\u0101\u02be"}s</Text>
            <Text style={s.guidanceBtnArrow}>{"\u203a"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.guidanceBtn} onPress={() => navigation?.navigate?.("Map")} activeOpacity={0.85}>
            <Text style={s.guidanceBtnIcon}>{"\uD83D\uDDFA"}</Text>
            <Text style={s.guidanceBtnLabel}>Sacred Map</Text>
            <Text style={s.guidanceBtnArrow}>{"\u203a"}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: spacing(5) }} />
      </ScrollView>

      {/* ══════════════════════════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════════════════════════ */}

      {/* Departure date modal */}
      <Modal visible={showDepartureModal} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={md.overlay}>
          <TouchableOpacity style={md.dismiss} onPress={() => setShowDepartureModal(false)} />
          <View style={md.sheet}>
            <Text style={md.title}>Departure Date</Text>
            <Text style={md.hint}>Enter your date (YYYY-MM-DD)</Text>
            <TextInput
              style={md.input}
              value={departureDraft}
              onChangeText={setDepartureDraft}
              placeholder="e.g. 2025-03-15"
              placeholderTextColor={C.sub}
              keyboardType="numbers-and-punctuation"
              autoFocus
            />
            <TouchableOpacity
              style={md.saveBtn}
              onPress={() => {
                if (/^\d{4}-\d{2}-\d{2}$/.test(departureDraft)) {
                  saveDeparture(departureDraft);
                  setShowDepartureModal(false);
                } else {
                  Alert.alert("Format", "Please enter date as YYYY-MM-DD");
                }
              }}
              activeOpacity={0.85}
            >
              <Text style={md.saveTxt}>Save Date</Text>
            </TouchableOpacity>
            <TouchableOpacity style={md.cancelBtn} onPress={() => setShowDepartureModal(false)} activeOpacity={0.7}>
              <Text style={md.cancelTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Intention modal */}
      <Modal visible={showIntentionModal} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={md.overlay}>
          <TouchableOpacity style={md.dismiss} onPress={() => setShowIntentionModal(false)} />
          <View style={md.sheet}>
            <Text style={md.title}>My Intention</Text>
            <Text style={md.hint}>Write your personal intention for this journey</Text>
            <TextInput
              style={[md.input, md.inputMulti]}
              value={intentionDraft}
              onChangeText={setIntentionDraft}
              placeholder={"e.g. I am making this journey for the sake of Allah alone, seeking forgiveness and closeness to Him\u2026"}
              placeholderTextColor={C.sub}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              autoFocus
            />
            <TouchableOpacity
              style={md.saveBtn}
              onPress={() => {
                saveIntention(intentionDraft);
                setShowIntentionModal(false);
              }}
              activeOpacity={0.85}
            >
              <Text style={md.saveTxt}>Save Intention</Text>
            </TouchableOpacity>
            <TouchableOpacity style={md.cancelBtn} onPress={() => setShowIntentionModal(false)} activeOpacity={0.7}>
              <Text style={md.cancelTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Milestone modal */}
      <Modal visible={showMilestoneModal} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={md.overlay}>
          <TouchableOpacity style={md.dismiss} onPress={() => setShowMilestoneModal(false)} />
          <View style={md.sheet}>
            <Text style={md.title}>Add Milestone</Text>
            <Text style={md.hint}>Record a moment from your journey</Text>
            <TextInput
              style={md.input}
              value={milestoneDraft}
              onChangeText={setMilestoneDraft}
              placeholder={"e.g. Completed first Taw\u0101f \u2014 Alhamdulillah"}
              placeholderTextColor={C.sub}
              autoFocus
            />
            <TouchableOpacity
              style={md.saveBtn}
              onPress={() => {
                addMilestone(milestoneDraft);
                setShowMilestoneModal(false);
              }}
              activeOpacity={0.85}
            >
              <Text style={md.saveTxt}>Add Milestone</Text>
            </TouchableOpacity>
            <TouchableOpacity style={md.cancelBtn} onPress={() => setShowMilestoneModal(false)} activeOpacity={0.7}>
              <Text style={md.cancelTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Full checklist modal */}
      <Modal visible={showFullChecklist} transparent animationType="slide">
        <View style={cl.overlay}>
          <TouchableOpacity style={cl.dismiss} onPress={() => setShowFullChecklist(false)} />
          <View style={cl.sheet}>
            <View style={cl.header}>
              <Text style={cl.title}>Preparation Checklist</Text>
              <TouchableOpacity onPress={() => setShowFullChecklist(false)} hitSlop={{top:12,bottom:12,left:12,right:12}}>
                <Text style={cl.close}>{"\u00d7"}</Text>
              </TouchableOpacity>
            </View>
            <Text style={cl.sub}>{doneCount} of {checklist.length} complete</Text>
            <View style={cl.progressBarWrap}>
              <View style={[cl.progressFill, { width:`${donePct}%` }]} />
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={cl.list}>
              {checklist.map(item => (
                <CheckRow key={item.id} item={item} onToggle={toggleCheck} />
              ))}
              <View style={{ height:24 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Styles
// ═════════════════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  safe:    { flex:1, backgroundColor:C.bg },
  scroll:  { flex:1 },
  content: { paddingHorizontal:spacing(2.5), paddingTop:spacing(1), paddingBottom:spacing(4) },

  // Header
  header:       { flexDirection:"row", alignItems:"center", gap:12, marginBottom:spacing(2.5) },
  backBtn:      { width:36, height:36, borderRadius:18, backgroundColor:C.card, alignItems:"center", justifyContent:"center", borderWidth:1, borderColor:C.border },
  backArrow:    { fontSize:22, color:C.green, lineHeight:28, marginTop:-2 },
  headerTextWrap:{ flex:1 },
  headerTitle:  { fontFamily:SERIF, fontSize:22, fontWeight:"700", color:C.text },
  headerSub:    { fontSize:13, color:C.sub, marginTop:2 },

  // Toggle
  toggleRow:   { flexDirection:"row", backgroundColor:C.card, borderRadius:radius.lg, borderWidth:1, borderColor:C.border, padding:4, marginBottom:spacing(2), ...shadows.xs },
  toggleBtn:   { flex:1, paddingVertical:10, alignItems:"center", borderRadius:radius.md },
  toggleActive:{ backgroundColor:C.green },
  toggleTxt:   { fontFamily:SERIF, fontSize:15, fontWeight:"600", color:C.sub },
  toggleTxtActive:{ color:"#fff" },

  // Departure card
  departureCard: {
    backgroundColor:C.heroBg, borderRadius:radius.xl, padding:spacing(2.5),
    flexDirection:"row", alignItems:"center", marginBottom:spacing(2),
    ...shadows.md,
  },
  departureLeft:     { flex:1 },
  departureEyebrow:  { fontSize:11, color:"rgba(240,232,200,0.55)", letterSpacing:2, textTransform:"uppercase", marginBottom:4 },
  departureDate:     { fontFamily:SERIF, fontSize:20, color:C.heroText, fontWeight:"600" },
  departureSub:      { fontSize:13, color:C.goldLight, marginTop:4 },
  departurePlaceholder:{ fontFamily:SERIF, fontSize:16, color:"rgba(240,232,200,0.45)", fontStyle:"italic" },
  countdownBadge:    { width:64, height:64, borderRadius:32, backgroundColor:"rgba(184,146,42,0.18)", borderWidth:1.5, borderColor:C.goldBorder, alignItems:"center", justifyContent:"center" },
  countdownNum:      { fontFamily:SERIF, fontSize:24, fontWeight:"700", color:C.goldLight },
  countdownLabel:    { fontSize:11, color:C.goldLight, letterSpacing:1 },
  addDateBtn:        { width:44, height:44, borderRadius:22, backgroundColor:"rgba(255,255,255,0.08)", alignItems:"center", justifyContent:"center", borderWidth:1, borderColor:"rgba(255,255,255,0.15)" },
  addDateTxt:        { fontSize:24, color:"rgba(240,232,200,0.6)", lineHeight:28 },

  // Progress card
  progressCard:  { backgroundColor:C.card, borderRadius:radius.xl, padding:spacing(2), flexDirection:"row", alignItems:"center", gap:spacing(2), marginBottom:spacing(2), ...shadows.card, borderWidth:1, borderColor:C.border },
  ringWrap:      { position:"relative", width:84, height:84 },
  ringOverlay:   { position:"absolute", top:0, left:0, right:0, bottom:0, alignItems:"center", justifyContent:"center" },
  ringPct:       { fontFamily:SERIF, fontSize:20, fontWeight:"700", color:C.green },
  ringPctSym:    { fontSize:12 },
  progressRight: { flex:1 },
  progressTitle: { fontFamily:SERIF, fontSize:15, fontWeight:"600", color:C.text, marginBottom:3 },
  progressSub:   { fontSize:12, color:C.sub, marginBottom:8 },
  progressBar:   { height:4, backgroundColor:C.border, borderRadius:2, marginBottom:8, overflow:"hidden" },
  progressFill:  { height:4, backgroundColor:C.gold, borderRadius:2 },
  nextStepChip:  { flexDirection:"row", alignItems:"center", backgroundColor:C.goldSurface, borderRadius:radius.pill, paddingHorizontal:10, paddingVertical:5, borderWidth:1, borderColor:C.goldBorder, flexShrink:1 },
  nextStepLabel: { fontSize:11, color:C.gold, fontWeight:"600" },
  nextStepTxt:   { fontSize:11, color:C.green, flex:1 },
  nextStepArrow: { fontSize:13, color:C.gold, fontWeight:"700" },

  // Tiles
  tileGrid: { flexDirection:"row", flexWrap:"wrap", gap:spacing(1.5) },

  // Intention
  intentionCard:    { backgroundColor:C.card, borderRadius:radius.xl, padding:spacing(2.5), borderWidth:1, borderColor:C.goldBorder, alignItems:"center", ...shadows.xs },
  intentionArabic:  { fontSize:28, marginBottom:spacing(1) },
  intentionText:    { fontFamily:SERIF, fontSize:16, color:C.text, textAlign:"center", lineHeight:24, marginBottom:8 },
  intentionEdit:    { fontSize:12, color:C.sub, textDecorationLine:"underline" },
  intentionPromptIcon:{ fontSize:28, marginBottom:spacing(1) },
  intentionPrompt:  { fontFamily:SERIF, fontSize:16, color:C.text, textAlign:"center", marginBottom:6 },
  intentionSub:     { fontSize:13, color:C.sub, textAlign:"center", lineHeight:19, marginBottom:spacing(2) },
  intentionAddBtn:  { backgroundColor:C.green, borderRadius:radius.pill, paddingHorizontal:20, paddingVertical:10 },
  intentionAddTxt:  { fontFamily:SERIF, fontSize:14, color:"#fff", fontWeight:"600" },

  // Checklist preview
  checkCard:   { backgroundColor:C.card, borderRadius:radius.xl, padding:spacing(2), borderWidth:1, borderColor:C.border, ...shadows.xs },
  viewAllBtn:  { flexDirection:"row", alignItems:"center", justifyContent:"center", marginTop:spacing(1), paddingTop:spacing(1), borderTopWidth:1, borderTopColor:C.border },
  viewAllTxt:  { fontSize:14, color:C.green, fontWeight:"600", fontFamily:SERIF },
  viewAllArrow:{ fontSize:16, color:C.gold, fontWeight:"700" },

  // Milestones
  milestonesCard:  { backgroundColor:C.card, borderRadius:radius.xl, padding:spacing(2), borderWidth:1, borderColor:C.border, ...shadows.xs },
  milestonesEmpty: { fontSize:14, color:C.sub, lineHeight:20, marginBottom:spacing(1.5) },
  milestoneWrap:   { flexDirection:"row", flexWrap:"wrap" },
  addMilestoneBtn: { marginTop:spacing(1.5), alignSelf:"flex-start", backgroundColor:C.cardAlt, borderRadius:radius.pill, paddingHorizontal:16, paddingVertical:8, borderWidth:1, borderColor:C.border },
  addMilestoneTxt: { fontSize:14, color:C.green, fontWeight:"600", fontFamily:SERIF },

  // Guidance strip
  guidanceRow:  { gap:spacing(1) },
  guidanceBtn:  { flexDirection:"row", alignItems:"center", backgroundColor:C.card, borderRadius:radius.lg, padding:spacing(1.75), borderWidth:1, borderColor:C.border, gap:12, ...shadows.xs },
  guidanceBtnIcon: { fontSize:18 },
  guidanceBtnLabel:{ flex:1, fontFamily:SERIF, fontSize:15, fontWeight:"600", color:C.green },
  guidanceBtnArrow:{ fontSize:18, color:C.gold, fontWeight:"700" },
});

// Modal styles
const md = StyleSheet.create({
  overlay:    { flex:1, justifyContent:"flex-end" },
  dismiss:    { flex:1 },
  sheet:      { backgroundColor:C.card, borderTopLeftRadius:radius.xxl, borderTopRightRadius:radius.xxl, padding:spacing(3), paddingBottom:spacing(5), borderTopWidth:1, borderColor:C.border },
  title:      { fontFamily:SERIF, fontSize:20, fontWeight:"700", color:C.text, marginBottom:6 },
  hint:       { fontSize:14, color:C.sub, marginBottom:spacing(2) },
  input:      { backgroundColor:C.bg, borderRadius:radius.md, borderWidth:1, borderColor:C.border, paddingHorizontal:spacing(2), paddingVertical:spacing(1.5), fontSize:16, color:C.text },
  inputMulti: { minHeight:100, paddingTop:spacing(1.5) },
  saveBtn:    { marginTop:spacing(2), backgroundColor:C.green, borderRadius:radius.lg, paddingVertical:spacing(1.75), alignItems:"center" },
  saveTxt:    { fontFamily:SERIF, fontSize:16, color:"#fff", fontWeight:"600" },
  cancelBtn:  { marginTop:spacing(1), alignItems:"center", paddingVertical:spacing(1) },
  cancelTxt:  { fontSize:14, color:C.sub },
});

// Checklist modal styles
const cl = StyleSheet.create({
  overlay:      { flex:1, backgroundColor:"rgba(0,0,0,0.5)", justifyContent:"flex-end" },
  dismiss:      { flex:1 },
  sheet:        { backgroundColor:C.card, borderTopLeftRadius:radius.xxl, borderTopRightRadius:radius.xxl, paddingHorizontal:spacing(2.5), paddingTop:spacing(2.5), maxHeight:"80%", borderTopWidth:1, borderColor:C.border },
  header:       { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:6 },
  title:        { fontFamily:SERIF, fontSize:20, fontWeight:"700", color:C.text },
  close:        { fontSize:26, color:C.sub },
  sub:          { fontSize:13, color:C.sub, marginBottom:spacing(1) },
  progressBarWrap:{ height:4, backgroundColor:C.border, borderRadius:2, marginBottom:spacing(2), overflow:"hidden" },
  progressFill: { height:4, backgroundColor:C.gold, borderRadius:2 },
  list:         { flex:1 },
});
