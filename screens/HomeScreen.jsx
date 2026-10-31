import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
  Modal,
  StatusBar,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { toggleBookmarkCard, isBookmarkedOnBoard } from "../bookmarkStore";
import Svg, { Path, Defs, LinearGradient as SvgGrad, Stop, Mask, Rect, Polygon } from "react-native-svg";
import { PATTERN_PATH } from "./headerPatternPath";
import HomeCountdownCard from "./HomeCountdownCard";
import HomeJourneyHero from "./HomeJourneyHero";
import HomeGuidesCard from "./HomeGuidesCard";
import HomePrioritiesCard from "./HomePrioritiesCard";
import HomeDailyLessonCard from "./HomeDailyLessonCard";
import HomeHeroSlideshowClassic from "./HomeHeroSlideshowClassic";
import ExploreTiles from "../components/ExploreTiles";
import { sharedCardStyles } from "./sharedCardStyles";
import TripDetailsEditor from "../TripDetailsEditor";
import { SOURCE_NOTE_SHORT } from "../content/sourceStatements";
import { colors } from "../theme";
import { DEFAULT_LOCATION, loadPrayerSettings, refreshPrayerData, getToday, getNextPrayer } from "../prayerTimes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import {
  MapTrifold, BookOpenText, HandsPraying, CompassRose,
  UsersThree, ShoppingBag, CheckSquare, Sparkle,
  ArrowRight, BookOpen, Moon, ListChecks, Users,
  PlayCircle, Wrench, Note, Gear, Info,
  SunHorizon, Compass, Heartbeat, NotePencil, CalendarBlank,
  CaretLeft, CaretRight, CaretDown, CloudSun, MagnifyingGlass,
} from "phosphor-react-native";

const SERIF = "SourceSerif4-Regular";
const { width: SW, height: SH } = Dimensions.get("window");

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAY_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ── Explore your pilgrimage tiles (Learn has its own set via the same ExploreTiles) ──
const EXPLORE_TILES = [
  { label: "Practice",     subtitle: "Rehearse the rituals",       circleColor: "#2D4A34", image: require("../assets/explore_cards/practice.png"),
    go: (navigation) => navigation?.getParent?.()?.navigate?.("Practice", { screen: "PracticeMain" }) },
  { label: "Ziyarah",      subtitle: "Historical places to visit", circleColor: "#2D4A34", image: require("../assets/explore_cards/ziyarah.png"),
    go: (navigation) => navigation?.navigate?.("SacredPlaces") },
  { label: "Safar Assist", subtitle: "Your pilgrim AI companion",  circleColor: "#2D4A34", image: require("../assets/explore_cards/safar_assist.png"),
    go: (navigation) => navigation?.navigate?.("SafarAssist") },
  { label: "Checklists",   subtitle: "Pack and prepare",           circleColor: "#2D4A34", image: require("../assets/explore_cards/checklists.png"),
    go: (navigation) => navigation?.getParent?.()?.navigate?.("Plan", { screen: "Checklists", initial: false, params: { returnToTab: "Home" } }) },
];

// ── Storage keys ──────────────────────────────────────────────────────────────
const DEPARTURE_KEY       = "safar_departure_date_v1";
const USER_NAME_KEY       = "safar_user_name_v1";
const PLAN_STARTED_KEY    = "safar_plan_started_v1";
const INTRO_DISMISSED_KEY = "safar_intro_dismissed_v1";
const CALENDAR_KEY        = "safar_calendar_v1";
const JOURNEY_TYPE_KEY    = "safar_journey_type_v1";

// Same mapping as CalendarScreen.jsx — not exported from that file so duplicated here
const CAL_CATEGORIES = [
  { id: "travel",    label: "Travel",           color: "#2E4560" },
  { id: "worship",   label: "Acts of Worship",  color: "#C8A96A" },
  { id: "group",     label: "Group",            color: "#3D2240" },
  { id: "personal",  label: "Personal",         color: "#4A5C48" },
  { id: "reminders", label: "Reminders",        color: "#3A2F1E" },
];
function getCalCat(id) {
  return CAL_CATEGORIES.find(c => c.id === id) ?? CAL_CATEGORIES[0];
}

// Gregorian date formatted
function getGregorianLabel() {
  const now = new Date();
  const weekday = WEEKDAY_FULL[now.getDay()];
  const day = now.getDate();
  const month = MONTH_ABBR[now.getMonth()];
  const year = now.getFullYear();
  return `${weekday}, ${day} ${month} ${year}`;
}

// ── Today's du'a ──────────────────────────────────────────────────────────────
const DAILY_DUA = {
  id: "hu12",
  arabic:
    "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0627\u062c\u0652\u0639\u064e\u0644\u0652\u0646\u064e\u0627 \u062d\u064e\u062c\u0651\u064b\u0627 \u0645\u064e\u0628\u0652\u0631\u064f\u0648\u0631\u064b\u0627 \u0648\u064e\u0633\u064e\u0639\u0652\u064a\u064b\u0627 \u0645\u064e\u0634\u0652\u0643\u064f\u0648\u0631\u064b\u0627 \u0648\u064e\u0630\u064e\u0646\u0652\u0628\u064b\u0627 \u0645\u064e\u063a\u0652\u0641\u064f\u0648\u0631\u064b\u0627",
  transliteration:
    "Allahumma-jalna hajjan mabruran wa sayan mashuran wa dhanban maghfuran",
  translation:
    "O Allah, make our Hajj one that is accepted, our say one that is appreciated, and our sins forgiven.",
  source: "Ibn Majah \u00b7 2893",
};

// ── About modal ───────────────────────────────────────────────────────────────
function AboutModal({ visible, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={ab.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <View style={ab.card}>
          <ScrollView contentContainerStyle={ab.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={ab.title}>What is Safar?</Text>
            <Text style={ab.body}>
              {"Safar is your companion for every step of your sacred Hajj or Umrah journey.\n\n"}
              {"Plan your journey, practise the essential duas, and share every milestone with those you love.\n\n"}
              {"May Allah accept your journey. \u0622\u0645\u064a\u0646"}
            </Text>
            <Text style={ab.pillarsIntro}>{"Here is how Safar is organized to help you prepare for your Hajj or Umrah with confidence."}</Text>
            <View style={ab.pillarsWrap}>
              <View style={ab.pillarCard}>
                <Text style={ab.pillarName}>Plan</Text>
                <Text style={ab.pillarDesc}>Plan your dates, build checklists, and organize every detail before you go.</Text>
              </View>
              <View style={ab.pillarCard}>
                <Text style={ab.pillarName}>Learn</Text>
                <Text style={ab.pillarDesc}>Step-by-step guides, sacred places, and scholarly references for every stage.</Text>
              </View>
              <View style={ab.pillarCard}>
                <Text style={ab.pillarName}>Practice</Text>
                <Text style={ab.pillarDesc}>Rehearse your duas, test your knowledge, and listen to audio guides.</Text>
              </View>
              <View style={ab.pillarCard}>
                <Text style={ab.pillarName}>Connect</Text>
                <Text style={ab.pillarDesc}>Share milestones with your group, manage contacts, and send prayer postcards.</Text>
              </View>
            </View>
          </ScrollView>
          <TouchableOpacity style={ab.btn} onPress={onClose}>
            <Text style={ab.btnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const ab = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,36,25,0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  card: {
    backgroundColor: "#FDFAF4",
    borderRadius: 20,
    padding: 28,
    width: "100%",
    shadowColor: "#4A5C48",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius: 24,
    elevation: 12,
    maxHeight: SH * 0.72,
    overflow: "hidden",
  },
  scrollContent: { paddingBottom: 4 },
  pillarsIntro: { fontSize: 14, color: "#8A7D6A", lineHeight: 21, marginBottom: 14, marginTop: 4 },
  pillarsWrap: { marginTop: 16 },
  pillarCard: { borderWidth: 1, borderColor: "#DDD5C0", borderRadius: 12, padding: 14, marginBottom: 8 },
  pillarName: { fontSize: 17, fontWeight: "700", color: "#B08F52", marginBottom: 2 },
  pillarDesc: { fontSize: 14, color: "#5C534A", lineHeight: 20 },
  intro: { fontSize: 15, color: "#8A7D6A", lineHeight: 22, marginBottom: 16 },
  title: {
    fontFamily: "SourceSerif4-Regular",
    fontSize: 24,
    fontWeight: "600",
    color: "#1A1410",
    marginBottom: 14,
  },
  body: {
    fontSize: 15,
    color: "#3A3530",
    lineHeight: 24,
  },
  btn: {
    backgroundColor: "#4A5C48",
    borderRadius: 50,
    paddingHorizontal: 32,
    paddingVertical: 11,
    alignSelf: "flex-start",
    marginTop: 14,
  },
  btnText: {
    color: "#FDFAF4",
    fontSize: 14,
    fontWeight: "600",
  },
});

// ─────────────────────────────────────────────────────────────────────────────

const GOLD = "#C8A96A";

function StarOrnament({ size = 20, color = GOLD }) {
  const c = size / 2;
  const r = size * 0.38;
  const pts1 = Array.from({ length: 4 }, (_, i) => {
    const a = (i * 90 - 45) * Math.PI / 180;
    return `${(c + r * Math.cos(a)).toFixed(1)},${(c + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  const pts2 = Array.from({ length: 4 }, (_, i) => {
    const a = (i * 90) * Math.PI / 180;
    return `${(c + r * Math.cos(a)).toFixed(1)},${(c + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Polygon points={pts1} fill={color} opacity="0.9" />
      <Polygon points={pts2} fill={color} opacity="0.9" />
    </Svg>
  );
}

function OrnamentDivider() {
  return (
    <View style={od.row}>
      <View style={od.line} />
      <StarOrnament size={14} color={GOLD} />
      <View style={od.line} />
    </View>
  );
}
const od = StyleSheet.create({
  row:  { flexDirection: "row", alignItems: "center",
          marginVertical: 8, paddingHorizontal: 32 },
  line: { flex: 1, height: 1, backgroundColor: GOLD,
          opacity: 0.35 },
});

// ─────────────────────────────────────────────────────────────────────────────

function EventsCard({ events, page, onPageChange, navigation }) {
  const PAGE_SIZE = 3;
  const totalPages = Math.ceil(events.length / PAGE_SIZE);
  const pageEvents = events.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <View style={ec.card}>
      {/* Header */}
      <View style={ec.header}>
        <Text style={ec.title}>{"Upcoming Events"}</Text>
        <View style={ec.headerRight}>
          <TouchableOpacity
            onPress={() => navigation?.getParent?.()?.navigate?.("Plan", { screen: "Calendar", initial: false, params: { returnToTab: "Home" } })}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={ec.viewCalLink}>View Calendar</Text>
          </TouchableOpacity>
          {totalPages > 1 ? (
            <View style={ec.pageRow}>
              <TouchableOpacity
                onPress={() => onPageChange(page - 1)}
                disabled={page === 0}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <CaretLeft size={18} color={page === 0 ? "#C8BFB2" : "#5A4A38"} weight="bold" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onPageChange(page + 1)}
                disabled={page === totalPages - 1}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <CaretRight size={18} color={page === totalPages - 1 ? "#C8BFB2" : "#5A4A38"} weight="bold" />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </View>
      <View style={ec.sectionLine} />

      {/* Event rows */}
      <View style={ec.rows}>
        {pageEvents.map((evt, idx) => {
          const [y, m, d] = evt.date.split("-").map(Number);
          const dt      = new Date(y, m - 1, d);
          const dayName = DAY_NAMES[dt.getDay()];
          const dayNum  = d;
          const cat     = getCalCat(evt.category);
          return (
            <TouchableOpacity
              key={evt.id}
              style={idx < pageEvents.length - 1 ? ec.row : ec.rowLast}
              onPress={() => navigation?.getParent?.()?.navigate?.("Plan", { screen: "Calendar", initial: false, params: { selectedDate: evt.date, returnToTab: "Home" } })}
              activeOpacity={0.75}
            >
              <View style={ec.dayWrap}>
                <Text style={[ec.dayName, { color: cat.color }]}>{dayName}</Text>
                <Text style={[ec.dayNum,  { color: cat.color }]}>{String(dayNum)}</Text>
              </View>
              <View style={ec.divider} />
              <View style={ec.main}>
                <Text style={ec.evtTitle} numberOfLines={1}>{evt.title}</Text>
                <View style={ec.meta}>
                  <View style={[ec.dot, { backgroundColor: cat.color }]} />
                  <Text style={ec.catLabel}>{cat.label}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const ec = StyleSheet.create({
  card: {
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: "rgba(200, 191, 178, 0.5)",
    borderRadius: 16,
    backgroundColor: "#FDFAF4",
    overflow: "hidden",
    shadowColor: "#4A2E10",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  sectionLine: { height: 1, backgroundColor: "#E0D8CC" },
  title: {
    fontFamily: SERIF,
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1712",
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  viewCalLink: { fontSize: 14, color: "#4A5C48", fontWeight: "600" },
  pageRow:  { flexDirection: "row", alignItems: "center", gap: 10 },
  rows:     { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#F0EBE1" },
  row:      { flexDirection: "row", alignItems: "center", backgroundColor: "#FDFAF4", borderWidth: 1, borderColor: "#DDD5C0", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8, shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  rowLast:  { flexDirection: "row", alignItems: "center", backgroundColor: "#FDFAF4", borderWidth: 1, borderColor: "#DDD5C0", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  dayWrap:  { width: 34, alignItems: "center" },
  dayName:  { fontSize: 10, fontWeight: "600", textAlign: "center" },
  dayNum:   { fontSize: 16, fontWeight: "700", width: 28, textAlign: "center" },
  divider:  { width: 1, backgroundColor: "#E0D8CC", marginVertical: 2, marginHorizontal: 12, alignSelf: "stretch" },
  main:     { flex: 1 },
  evtTitle: { fontSize: 15, fontWeight: "600", color: "#1A1410" },
  meta:     { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  dot:      { width: 6, height: 6, borderRadius: 3 },
  catLabel: { fontSize: 11, color: "#8A7D6A" },
});

// ─────────────────────────────────────────────────────────────────────────────

export default function HomeScreen({ navigation }) {
  const [showAbout, setShowAbout]           = useState(false);
  const [showSources, setShowSources]       = useState(false);
  const [userName, setUserName]             = useState("");
  const [daysAway, setDaysAway]             = useState(null);
  const [planStarted, setPlanStarted]       = useState(false);
  const [introDismissed, setIntroDismissed] = useState(false);
  const [lastDua, setLastDua]               = useState(null); // { title, stage, id, allDuas, currentIndex }
  const [duaPinned, setDuaPinned]           = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [eventsPage, setEventsPage]         = useState(0);
  const [departureISO, setDepartureISO]     = useState(null);
  const [journeyType, setJourneyType]       = useState("");
  const [showTripEditor, setShowTripEditor] = useState(false);
  // status: "loading" (no saved times yet) | "ready" | "unavailable" (no saved times, network failed)
  const [prayerInfo, setPrayerInfo]         = useState({ status: "loading", city: DEFAULT_LOCATION.name, today: null, next: null });
  const prayerLoadId = useRef(0);
  const insets    = useSafeAreaInsets();

  const displayName = userName || "Pilgrim";

  useFocusEffect(useCallback(() => {
    isBookmarkedOnBoard("dua", DAILY_DUA.id).then(setDuaPinned);
    const today = new Date().toISOString().slice(0, 10);
    AsyncStorage.getItem(CALENDAR_KEY).then(raw => {
      try {
        const all = JSON.parse(raw ?? "[]");
        const upcoming = Array.isArray(all)
          ? all.filter(e => e.date >= today).sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0)
          : [];
        setUpcomingEvents(upcoming);
        setEventsPage(0);
      } catch (_) {}
    }).catch(() => {});
  }, []));

  // Load persisted state on every focus, so edits made elsewhere (Settings name,
  // trip details, last du'a) show up as soon as the user returns to Home.
  // Missing keys reset to defaults so cleared values propagate too.
  useFocusEffect(useCallback(() => {
    let cancelled = false;
    (async () => {
      try {
        const [name, dep, jt, plan, dismissed, lastDuaRaw] = await Promise.all([
          AsyncStorage.getItem(USER_NAME_KEY),
          AsyncStorage.getItem(DEPARTURE_KEY),
          AsyncStorage.getItem(JOURNEY_TYPE_KEY),
          AsyncStorage.getItem(PLAN_STARTED_KEY),
          AsyncStorage.getItem(INTRO_DISMISSED_KEY),
          AsyncStorage.getItem("SAFAR_LAST_DUA"), // last viewed du'a — for continuation card
        ]);
        if (cancelled) return;

        setUserName(name || "");

        const parsedDep = dep ? new Date(dep) : null;
        if (parsedDep && !isNaN(parsedDep.getTime())) {
          setDepartureISO(dep);
          const diff = Math.ceil((parsedDep - new Date()) / 86400000);
          setDaysAway(diff > 0 ? diff : null);
        } else {
          setDepartureISO(null);
          setDaysAway(null);
        }

        setJourneyType(jt || "");
        setPlanStarted(plan === "true");
        setIntroDismissed(dismissed === "true");

        let parsedDua = null;
        if (lastDuaRaw) {
          try { parsedDua = JSON.parse(lastDuaRaw); } catch (_) {}
        }
        setLastDua(parsedDua);
      } catch (_) {}
    })();
    return () => { cancelled = true; };
  }, []));

  // Prayer card: show saved times straight away, then refresh once per focus
  // (no request is made when the current and next month are already saved).
  const loadPrayer = useCallback(async () => {
    const id = ++prayerLoadId.current;
    const settings = await loadPrayerSettings();
    const city = settings.location.name;
    let today = await getToday(settings);
    let next  = await getNextPrayer(settings);
    if (id !== prayerLoadId.current) return;
    setPrayerInfo({ status: today ? "ready" : "loading", city, today, next });
    await refreshPrayerData(settings, { force: false });
    today = await getToday(settings);
    next  = await getNextPrayer(settings);
    if (id !== prayerLoadId.current) return;
    setPrayerInfo({ status: today ? "ready" : "unavailable", city, today, next });
  }, []);

  useFocusEffect(useCallback(() => { loadPrayer(); }, [loadPrayer]));

  const dismissIntro = async () => {
    try { await AsyncStorage.setItem(INTRO_DISMISSED_KEY, "true"); } catch (_) {}
    setIntroDismissed(true);
  };

  // Call this from Settings → "Reset intro card" during development,
  // or expose as a debug option to testers.
  // Example: navigation?.setParams?.({ resetIntro: resetIntroCard });
  const resetIntroCard = async () => {
    try { await AsyncStorage.removeItem(INTRO_DISMISSED_KEY); } catch (_) {}
    setIntroDismissed(false);
  };

  // Contextual CTA
  const ctxLabel  = planStarted
    ? "Continue: Umrah Guide, Step 2 \u2192"
    : "Add your booking info \u2192";
  const ctxScreen = planStarted ? "Guides" : "SafarAssist";

  const gregorian = getGregorianLabel();
  const prayerHijri = prayerInfo.today ? prayerInfo.today.hijri : null;
  const prayerNext  = prayerInfo.next;
  // Weather strip always shows two cities: the selected one plus Madinah (or Makkah if Madinah is selected)
  const weatherOtherCity = prayerInfo.city === "Madinah" ? "Makkah" : "Madinah";

  const openCalendar    = () => navigation?.getParent?.()?.navigate?.("Plan", { screen: "Calendar", initial: false, params: { returnToTab: "Home" } });
  const openPrayerTimes = () => navigation?.getParent?.()?.navigate?.("Practice", { screen: "PrayerTimes", initial: false, params: { returnToTab: "Home" } });
  const retryPrayer     = () => {
    setPrayerInfo((p) => ({ ...p, status: "loading" }));
    loadPrayer();
  };
  const onPrayerPress = prayerInfo.status === "unavailable" ? retryPrayer : openPrayerTimes;

  // ── Prayer + calendar card (shown after intro is dismissed) ───────────────
  // Two tap areas: the date column opens Calendar; the prayer column and the
  // weather strip open Prayer Times. The vertical divider is not tappable.
  const PrayerCard = () => (
    <View style={s.prayerCard}>
      {/* Prayer + date row */}
      <View style={s.prayerContentRow}>
        {/* Left: dates */}
        <TouchableOpacity style={s.prayerDateCol} activeOpacity={0.85} onPress={openCalendar}>
          <Text style={sharedCardStyles.eyebrowText}>TODAY</Text>
          <View style={s.prayerDateRow}>
            <CalendarBlank size={14} color="#8A7D6A" weight="regular" />
            <Text style={s.prayerGregorian}>{gregorian}</Text>
          </View>
          {prayerHijri ? (
            <Text style={s.prayerHijri}>
              {prayerHijri.day}{" "}{prayerHijri.month.en}{" "}{prayerHijri.year}{" AH"}
            </Text>
          ) : null}
        </TouchableOpacity>

        {/* Divider */}
        <View style={s.prayerDividerV} />

        {/* Right: current + next prayer */}
        <TouchableOpacity style={s.prayerTimesCol} activeOpacity={0.85} onPress={onPrayerPress}>
          {prayerInfo.status === "ready" ? (
            <>
              <View style={s.prayerRow}>
                <View style={s.prayerActiveDot} />
                <Text style={s.prayerCurrentName}>{prayerNext.current}</Text>
                <Text style={s.prayerCurrentTime}>{prayerNext.currentTime}</Text>
              </View>
              <View style={s.prayerDividerH} />
              <Text style={s.prayerCityLabel} numberOfLines={1}>{"Prayer times · " + prayerInfo.city}</Text>
              <View style={s.prayerRow}>
                <View style={s.prayerNextDot} />
                <Text style={s.prayerNextName}>Next · {prayerNext.next}</Text>
                <Text style={s.prayerNextTime}>{prayerNext.nextTime}</Text>
              </View>
            </>
          ) : (
            <Text style={s.prayerUnavailable}>
              {prayerInfo.status === "unavailable" ? "Prayer times unavailable. Tap to retry." : "Loading prayer times…"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Weather strip — temperatures not connected yet, so dashes are shown */}
      <TouchableOpacity activeOpacity={0.85} onPress={onPrayerPress}>
        <View style={s.prayerWeatherLine} />
        <View style={s.prayerWeatherStrip}>
          <View style={s.prayerWeatherCity}>
            <SunHorizon size={18} color="#C8A96A" weight="regular" />
            <Text style={s.prayerWeatherLabel}>{prayerInfo.city}</Text>
            <Text style={s.prayerWeatherTemp}>{"— —"}</Text>
          </View>
          <View style={s.prayerWeatherVertDiv} />
          <View style={s.prayerWeatherCity}>
            <CloudSun size={18} color="#C8A96A" weight="regular" />
            <Text style={s.prayerWeatherLabel}>{weatherOtherCity}</Text>
            <Text style={s.prayerWeatherTemp}>{"— —"}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={s.safe} edges={["bottom", "left", "right"]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >

        {/* ── TOP BAR ── */}
        <View style={[s.topBar, { paddingTop: insets.top + 8 }]}>
          <View style={s.topBarLeft}>
            <Text style={s.topBarSalam}>{"As-salamu alaykum"}</Text>
            <Text style={s.topBarName}>{displayName}</Text>
            <TouchableOpacity
              style={s.journeyPill}
              onPress={() => setShowTripEditor(true)}
              activeOpacity={0.85}
            >
              <Text style={s.journeyPillText}>
                {journeyType === "hajj" ? "Hajj" : journeyType === "umrah" ? "Umrah" : "Learning"}
              </Text>
              <CaretDown size={12} color="#7A9176" weight="bold" />
            </TouchableOpacity>
          </View>
          <View style={s.topBarRight}>
            <Text style={s.wordmarkPlaceholder}>safar</Text>
            <TouchableOpacity onPress={() => navigation?.navigate?.("Search")} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MagnifyingGlass size={22} color="#1A1410" weight="regular" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── CARD STACK — every card is spaced by s.cardStack (gap 16).
            Cards must not carry their own vertical margins. ── */}
        <View style={s.cardStack}>

        {/* ── HOME JOURNEY HERO / GUIDES ── */}
        {(journeyType === "umrah" || journeyType === "hajj") && departureISO ? (
          <HomeJourneyHero navigation={navigation} onEditTrip={() => setShowTripEditor(true)} />
        ) : (
          <HomeGuidesCard navigation={navigation} />
        )}

        {/* ══════════════════════════════════════════════════════════════════
            OPTION C CARD
            Before dismiss: intro text + contextual link
            After dismiss:  prayer times + dual calendar (same footprint)
        ══════════════════════════════════════════════════════════════════ */}
        {introDismissed ? (
          <View>
            <PrayerCard />
          </View>
        ) : (
          <View style={s.introCard}>
            {/* Dismiss × */}
            <TouchableOpacity style={s.introDismiss} onPress={dismissIntro}>
              <Text style={s.introDismissText}>{"\u00D7"}</Text>
            </TouchableOpacity>

            {/* Concise value statement */}
            <Text style={s.introTitle}>Your trusted guide for Hajj and Umrah</Text>
            <Text style={s.introBody}>
              {"Step-by-step guidance, duas for every moment, and tools to help you stay focused and connected."}
            </Text>

            <View style={s.introDivider} />

            {/* Contextual link */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => {
                if (ctxScreen === "Guides") {
                  navigation?.getParent?.()?.navigate?.("Learn", { screen: "Guides", initial: false, params: { returnToTab: "Home" } });
                } else {
                  navigation?.navigate?.(ctxScreen);
                }
              }}
            >
              <Text style={s.introCtaText}>{ctxLabel}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── GUIDES (trip profiles only — Learning shows them at the top with the headline) ── */}
        {(journeyType === "umrah" || journeyType === "hajj") && departureISO ? (
          <HomeGuidesCard navigation={navigation} showHeadline={false} journeyType={journeyType} />
        ) : null}

        {/* ── HOME PRIORITIES CARD (trip profiles only — nothing to prioritize without a date) ── */}
        {(journeyType === "umrah" || journeyType === "hajj") && departureISO ? (
          <HomePrioritiesCard navigation={navigation} />
        ) : null}

        {/* ── HOME DAILY LESSON CARD ── */}
        <HomeDailyLessonCard navigation={navigation} />

        {/* ── EXPLORE YOUR PILGRIMAGE ── */}
        <ExploreTiles
          tiles={EXPLORE_TILES.map((tile) => ({ ...tile, onPress: () => tile.go(navigation) }))}
          viewAllOnPress={() => navigation?.getParent?.()?.navigate?.("Learn", { screen: "LearnMain" })}
        />

        {/* ── HERO CAROUSEL (classic) ── */}
        <HomeHeroSlideshowClassic
          navigation={navigation}
          displayName={displayName}
          onShowAbout={() => setShowAbout(true)}
        />

        {upcomingEvents.length > 0 ? (
          <EventsCard
            events={upcomingEvents}
            page={eventsPage}
            onPageChange={setEventsPage}
            navigation={navigation}
          />
        ) : null}

        {/* My Journey card moved to HomeMyJourneyCard.jsx (parked, not imported). */}

        <View>
          {/* ══════════════════════════════════════════════════════════════════
              QUICK ACCESS ICON GRID — 1×4
          ══════════════════════════════════════════════════════════════════ */}
          <View style={s.shortcutsHeader}>
            <Text style={sharedCardStyles.eyebrowText}>QUICK ACCESS</Text>
          </View>
          <View style={s.gridWrap}>
            {[
              { label: "Qibla",    Icon: Compass,       onPress: () => navigation?.getParent?.()?.navigate?.("Practice", { screen: "Qibla",    initial: false, params: { returnToTab: "Home" } }) },
              { label: "Calendar", Icon: CalendarBlank, onPress: () => navigation?.getParent?.()?.navigate?.("Plan",     { screen: "Calendar", initial: false, params: { returnToTab: "Home" } }) },
              { label: "Dhikr",    Icon: Heartbeat,    onPress: () => navigation?.getParent?.()?.navigate?.("Practice", { screen: "Dhikr",    initial: false, params: { returnToTab: "Home" } }) },
              { label: "Notes",    Icon: NotePencil,   onPress: () => navigation?.getParent?.()?.navigate?.("Plan",     { screen: "Notes",    initial: false, params: { returnToTab: "Home" } }) },
            ].map(({ label, Icon, onPress }) => (
              <TouchableOpacity
                key={label}
                style={s.gridCell}
                onPress={onPress}
                activeOpacity={0.78}
              >
                <View style={s.gridIconWrap}>
                  <Icon size={24} color="#4A5C48" weight="regular" />
                </View>
                <Text style={s.gridLabel}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════════════════
            CONTINUATION CARD — only shown when there's a last-viewed du'a
        ══════════════════════════════════════════════════════════════════ */}
        {lastDua ? (
          <TouchableOpacity
            style={s.continuationCard}
            onPress={() => navigation?.navigate?.("DuaDetail", {
              dua: lastDua.dua,
              allDuas: lastDua.allDuas ?? [],
              currentIndex: lastDua.currentIndex ?? 0,
            })}
            activeOpacity={0.85}
          >
            {/* Full-width image — anchored right so subject shows on right side */}
            <Image
              source={require("../assets/continue.jpg")}
              style={{ position:"absolute", right:0, top:0, bottom:0, width:350 }}
              resizeMode="cover"
            />
            {/* Gradient — left side solid dark, fades right */}
            <LinearGradient
              colors={["#2A3828", "#2A3828", "rgba(42,56,40,0.6)", "transparent"]}
              locations={[0, 0.45, 0.72, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            {/* Text overlaid on left */}
            <View style={s.continuationLeft}>
              <Text style={s.continuationEyebrow} numberOfLines={1}>CONTINUE READING</Text>
              <Text style={s.continuationTitle} numberOfLines={2}>
                {lastDua.dua?.title ?? "Your last dua"}
              </Text>
              {lastDua.dua?.stage ? (
                <Text style={s.continuationStage}>{lastDua.dua.stage}</Text>
              ) : null}
            </View>
            <View style={s.cardCornerBtn}>
              <ArrowRight size={16} color="#FFFFFF" weight="regular" />
            </View>
          </TouchableOpacity>
        ) : null}

        {/* Focus Mode + Sacred Places cards moved to parked-components.jsx
            for reuse on a future screen. */}

        {/* Header + card grouped so the header sits 12px above its card. */}
        <View>
          <View style={s.pillarsHeader}>
            <Text style={[s.pillarsHeaderText, { fontSize: 20, fontWeight: "600", color: "#1A1712", textAlign: "center" }]}>{"Today\u2019s Dua"}</Text>
          </View>

          <View style={s.duaCard}>
            {/* Geometric pattern header (matches Dua Detail screen) */}
            <View style={s.duaPatternWrap} pointerEvents="none">
              <Svg width={SW - 40} height={90} viewBox="0 0 375 133.62" preserveAspectRatio="xMidYMin slice">
                <Defs>
                  <SvgGrad id="duaGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0"   stopColor="#fff" stopOpacity="1" />
                    <Stop offset="0.7" stopColor="#fff" stopOpacity="0.35" />
                    <Stop offset="1"   stopColor="#fff" stopOpacity="0" />
                  </SvgGrad>
                  <Mask id="duaMask"><Rect width="375" height="133.62" fill="url(#duaGrad)" /></Mask>
                </Defs>
                <Path d={PATTERN_PATH} fill="#bf9f60" opacity="0.55" mask="url(#duaMask)" />
              </Svg>
            </View>

            <Text style={s.duaArabicLg}>{DAILY_DUA.arabic}</Text>
            <Text style={s.duaTranslitLg}>{DAILY_DUA.transliteration}</Text>
            <Text style={s.duaTranslationLg}>{"\u201c" + DAILY_DUA.translation + "\u201d"}</Text>
            <Text style={s.duaSourceLg}>{DAILY_DUA.source}</Text>

            <View style={s.duaActions}>
              <TouchableOpacity
                style={s.duaBtn}
                onPress={() => navigation?.navigate?.("PracticeLearn")}
                activeOpacity={0.85}
              >
                <Text style={s.duaBtnText}>Practice</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.duaBtn, s.duaBtnOutline]}
                activeOpacity={0.85}
                onPress={() => {
                  toggleBookmarkCard("dua", DAILY_DUA.id, {
                    sourceTitle: "Dua for an Accepted Hajj",
                    sourceArabic: DAILY_DUA.arabic,
                    sourceTranslation: DAILY_DUA.translation,
                  }).then(setDuaPinned);
                }}
              >
                <Text style={[s.duaBtnOutlineText, { fontSize: 18, color: duaPinned ? "#C8A96A" : "#D4D0CA" }]}>
                  {duaPinned ? "♥" : "♡"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Settings tile + Sources link grouped so the link stays tucked under the tile. */}
        <View>
          <TouchableOpacity
            style={s.settingsTile}
            onPress={() => navigation?.navigate?.("Settings")}
            activeOpacity={0.85}
          >
            <View style={s.settingsTileIconBox}>
              <Gear size={22} color="#4A5C48" weight="regular" />
            </View>
            <View style={s.settingsTileText}>
              <Text style={s.settingsTileLabel}>Settings</Text>
              <Text style={s.settingsTileSub}>App settings, profile, and support</Text>
            </View>
            <Text style={s.settingsTileArrow}>{"›"}</Text>
          </TouchableOpacity>
          {/* ── Compact source line + info popup ── */}
          <TouchableOpacity
            style={s.sourceLine}
            onPress={() => setShowSources(true)}
            activeOpacity={0.7}
          >
            <Info size={15} color="#8A7D6A" weight="regular" />
            <Text style={s.sourceLineTxt}>Sources</Text>
          </TouchableOpacity>
        </View>

        </View>

      </ScrollView>

      <AboutModal visible={showAbout} onClose={() => setShowAbout(false)} />

      {/* Sources popup */}
      <Modal visible={showSources} transparent animationType="fade">
        <TouchableOpacity style={s.sourcesOverlay} activeOpacity={1} onPress={() => setShowSources(false)}>
          <View style={s.sourcesSheet}>
            <Text style={s.sourcesTitle}>Sources</Text>
            <Text style={s.sourcesBody}>
              {SOURCE_NOTE_SHORT + " Practice and wording may differ across the four madhhabs (Hanafi, Maliki, Shafii, Hanbali)."}
            </Text>
            <TouchableOpacity style={s.sourcesClose} onPress={() => setShowSources(false)} activeOpacity={0.85}>
              <Text style={s.sourcesCloseTxt}>Got it</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <TripDetailsEditor
        visible={showTripEditor}
        onClose={() => setShowTripEditor(false)}
        navigation={navigation}
        initialJourneyType={journeyType}
        initialDepartureDate={departureISO}
        onSaved={({ journeyType: jt, departureISO: iso }) => {
          setJourneyType(jt);
          setDepartureISO(iso);
          if (iso) {
            const parsedDep = new Date(iso);
            setDaysAway(!isNaN(parsedDep.getTime()) && Math.ceil((parsedDep - new Date()) / 86400000) > 0
              ? Math.ceil((parsedDep - new Date()) / 86400000)
              : null);
          } else {
            setDaysAway(null);
          }
        }}
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({

  safe: {
    flex: 1,
    backgroundColor: colors.warmBackground,
  },
  scrollContent: { paddingBottom: 16 },
  cardStack: { paddingTop: 16, gap: 16 },

  // ── Hero: top-left — salam 14pt, no letterSpacing, always white ──────────
  heroTopLeft: {
    position: "absolute",
    top: 16,
    left: 20,
  },
  heroSalam: {
    fontSize: 14,        // locked — do not reduce
    color: "rgba(255,255,255,0.82)",
    fontWeight: "500",
    lineHeight: 18,
  },
  heroUserName: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "600",
    lineHeight: 25,
  },

  // ── Hero: top-right — days to go, number left, two-line label right ─────
  daysBadge: {
    position: "absolute",
    top: 16,
    right: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    borderRadius: 8,
    padding: 4,
    backgroundColor: "transparent",
  },
  daysNum: {
    fontSize: 30,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 30,
    paddingTop: 2,
    paddingLeft: 2,
  },
  daysLabelWrap: {
    justifyContent: "flex-start",
    paddingTop: 3,
  },
  daysLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
    textTransform: "uppercase",
    lineHeight: 12,
  },

  // ── Intro card (before dismiss) ───────────────────────────────────────────
  introCard: {
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: "rgba(200, 191, 178, 0.5)",
    borderRadius: 16,
    backgroundColor: "#F9F4E8",
    padding: 18,
    shadowColor: "#4A2E10",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  introDismiss: {
    position: "absolute",
    top: 12,
    right: 14,
    padding: 4,
  },
  introDismissText: {
    fontSize: 18,
    color: "#8A7D70",
    lineHeight: 20,
  },
  introTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A5C48",
    marginBottom: 7,
    paddingRight: 22,
  },
  introBody: {
    fontSize: 13,
    color: "#5C534A",
    lineHeight: 20,
    fontWeight: "400",
  },
  introDivider: {
    height: 1,
    backgroundColor: "#E0D8CC",
    marginVertical: 13,
  },
  introCtaText: {
    fontSize: 14,
    color: "#4A5C48",
    fontWeight: "600",
  },

  // ── Prayer / calendar card (after dismiss — same outer footprint) ─────────
  prayerCard: {
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: "rgba(200, 191, 178, 0.5)",
    borderRadius: 16,
    backgroundColor: "#F9F4E8",
    overflow: "hidden",
    shadowColor: "#4A2E10",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  prayerContentRow: {
    flexDirection: "row",
  },

  // Left column: Gregorian + Hijri dates
  prayerDateCol: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    gap: 5,
  },
  prayerDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  prayerGregorian: {
    fontSize: 12,
    color: "#1C1A14",
    fontWeight: "700",
    lineHeight: 17,
  },
  prayerHijri: {
    fontSize: 13,
    color: "#8A7D6A",
    fontWeight: "400",
    lineHeight: 18,
  },

  // Vertical divider between columns
  prayerDividerV: {
    width: 1,
    backgroundColor: "#E0D8CC",
    marginVertical: 14,
  },

  // Right column: current + next prayer
  prayerTimesCol: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  prayerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  // Active prayer indicator dot — gold
  prayerActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#7A9176",
  },
  // Next prayer dot — muted
  prayerNextDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#C8BFB2",
  },
  prayerCurrentName: {
    flex: 1,
    fontSize: 15,
    color: "#1C1A14",
    fontWeight: "600",
  },
  prayerCurrentTime: {
    fontSize: 15,
    color: "#1C1A14",
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  prayerDividerH: {
    height: 1,
    backgroundColor: "#E0D8CC",
    marginVertical: 8,
  },
  prayerNextName: {
    flex: 1,
    fontSize: 12,
    color: "#5C534A",
    fontWeight: "400",
  },
  prayerNextTime: {
    fontSize: 12,
    color: "#5C534A",
    fontWeight: "500",
    fontVariant: ["tabular-nums"],
  },
  prayerCityLabel: {
    fontSize: 10,
    color: "#8A7D6A",
    textAlign: "right",
    marginBottom: 4,
  },
  prayerUnavailable: {
    fontSize: 15,
    color: "#1C1A14",
    fontWeight: "600",
  },
  prayerWeatherLine: {
    height: 1,
    backgroundColor: "#E0D8CC",
  },
  prayerWeatherStrip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(122, 145, 118, 0.19)",
  },
  prayerWeatherCity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  prayerWeatherLabel: {
    flex: 1,
    fontSize: 12,
    color: "#8A7D70",
  },
  prayerWeatherTemp: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3A3530",
  },
  prayerWeatherVertDiv: {
    width: 1,
    height: 16,
    backgroundColor: "#E0D8CC",
    marginHorizontal: 8,
  },

  // ── Four Pillars ─────────────────────────────────────────────────────────
  pillarsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 12,
  },
  pillarsHeaderText: {
    fontFamily: SERIF,
    fontSize: 16,
    fontWeight: "700",
    color: "#4A5C48",
  },
  pillarsHeaderSub: {
    fontSize: 15,
    color: "#8A7D6A",
    lineHeight: 19,
    marginHorizontal: 20,
    marginTop: -6,
    marginBottom: 4,
  },
  pillarsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 4,
  },
  pillarCard: {
    // ORIGINAL: height: 100, opacity: 0.55
    width: "47%",
    flexGrow: 1,
    height: 138,
    borderRadius: 18,
    overflow: "hidden",
    padding: 12,
    justifyContent: "space-between",
    shadowColor: "#1C2E1C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 8,
    elevation: 6,
  },
  // ORIGINAL: "#1C2B1E", "#2A1F0E", "#1A202E", "#221820"
  // V2: "#3D5C48", "#5C4A28", "#3A4A5C", "#4A3850"
  // V3: "#4A6E58", "#6E5A30", "#4A5E72", "#5A4662"
  // V4: "#5C8A6E", "#8A7040", "#5C7490", "#725880"
  // V5: "#527862", "#786538", "#526880", "#664F70"
  pillarCardLearn:    { backgroundColor: "#446655" },
  pillarCardPractice: { backgroundColor: "#66572E" },
  pillarCardPlan:     { backgroundColor: "#445870" },
  pillarCardConnect:  { backgroundColor: "#584260" },

  // Decorative background circles per pillar
  pillarCircle: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    top: -30,
    right: -25,
    opacity: 0.45,
  },
  pillarCircleSmall: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    bottom: -18,
    left: -12,
    opacity: 0.35,
  },
  pillarCircleLearnA:    { backgroundColor: "#2F5D50" },
  pillarCircleLearnB:    { backgroundColor: "#1E3D34" },
  pillarCirclePracticeA: { backgroundColor: "#5D4A20" },
  pillarCirclePracticeB: { backgroundColor: "#3D3010" },
  pillarCirclePlanA:     { backgroundColor: "#203050" },
  pillarCirclePlanB:     { backgroundColor: "#101828" },
  pillarCircleConnectA:  { backgroundColor: "#3D2040" },
  pillarCircleConnectB:  { backgroundColor: "#22182A" },

  pillarInner: {
    flex: 1,
    justifyContent: "flex-end",
    gap: 8,
  },
  pillarLabel: {
    fontFamily: "SourceSerif4-Regular",
    fontSize: 22,
    color: "#FDFAF4",
    fontWeight: "400",
    lineHeight: 25,
  },
  pillarDesc: {
    fontFamily: "SourceSerif4-Regular",
    fontSize: 14,
    color: "rgba(235,228,210,0.92)",
    fontWeight: "400",
    lineHeight: 19,
  },
  pillarStatBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    alignSelf: "stretch",
    marginTop: 8,
  },
  pillarStatText: {
    fontSize: 11,
    color: "rgba(253,250,244,0.90)",
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  pillarArrowBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(200,169,106,0.5)",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Quick Access header (text uses sharedCardStyles.eyebrowText) ─────────
  shortcutsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
  },

  // ── Section dividers ──────────────────────────────────────────────────────
  // ── Icon grid ────────────────────────────────────────────────────────────────
  gridWrap: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingTop: 12,
    gap: 10,
  },
  gridCell: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(253,250,244,0.5)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DDD5C0",
    paddingVertical: 16,
    paddingHorizontal: 6,
    shadowColor: "#2A1F0E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  gridIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(45, 74, 52, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  gridLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1410",
    textAlign: "center",
    lineHeight: 17,
  },

  cardCornerBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4A5C48",
    alignItems: "center",
    justifyContent: "center",
  },
  // ── Focus Mode card ───────────────────────────────────────────────────────
  // ── Continuation card ─────────────────────────────────────────────────────
  continuationCard: {
    marginHorizontal: 14,
    height: 150,
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
    backgroundColor: "#2A3828",
    shadowColor: "#1C1408",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  continuationLeft: {
    position: "absolute",
    top: 14,
    left: 22,
    right: 54,
  },
  continuationTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  continuationEyebrow: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(200,169,106,0.90)",
    letterSpacing: 1.5,
    marginBottom: 6,
    textAlign: "left",
    textTransform: "uppercase",
  },
  continuationTitle: {
    fontSize: 22,
    color: "#FFFFFF",
    fontWeight: "400",
    lineHeight: 28,
    marginTop: 0,
    textAlign: "left",
  },
  continuationStage: {
    fontSize: 14,
    color: "rgba(255,255,255,0.88)",
    lineHeight: 20,
    fontWeight: "400",
  },
  continuationBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(245,240,232,0.18)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(245,240,232,0.30)",
  },
  continuationRight: {
    width: 350,
    alignSelf: "stretch",
  },
  continuationImg: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // ── Sacred Places card ────────────────────────────────────────────────────
  sacredCard: {
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 4,
    height: 150,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#2A1A08",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 6,
  },
  sacredCardBg:     { flex: 1, justifyContent: "flex-end" },
  sacredCardScrim:  {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8,10,6,0.48)",
    borderRadius: 18,
  },
  sacredCardContent:{ padding: 18 },
  sacredCardEyebrow:{
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(245,240,232,0.70)",
    letterSpacing: 1.5,
    marginBottom: 5,
  },
  sacredCardTitle: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "400",
    marginBottom: 4,
  },
  sacredCardSub: {
    fontSize: 13,
    color: "rgba(245,240,232,0.75)",
    lineHeight: 19,
  },

  focusCard: {
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 4,
    height: 180,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#2A1A08",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 6,
  },
  focusCardBg: {
    flex: 1,
    justifyContent: "flex-end",
  },
  focusCardScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,18,8,0.52)",
    borderRadius: 18,
  },
  focusCardContent: {
    padding: 18,
  },
  focusCardEyebrow: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(245,240,232,0.70)",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  focusCardTitle: {
    fontSize: 22,
    color: "#FFFFFF",
    fontWeight: "400",
    lineHeight: 30,
    marginBottom: 14,
  },
  focusPills: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  focusPill: {
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "rgba(245,240,232,0.50)",
    backgroundColor: "rgba(245,240,232,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  focusPillTxt: {
    fontSize: 12,
    color: "rgba(245,240,232,0.90)",
    fontWeight: "500",
  },

  sectionDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 14,
  },
  sectionBar: {
    width: 3,
    height: 16,
    borderRadius: 2,
    backgroundColor: "#4A5C48",
  },
  sectionLabel: {
    fontFamily: "SourceSerif4-Regular",
    fontSize: 20,
    fontWeight: "600",
    color: "#1A1712",
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#C8BFB2",
  },

  // ── Journey / People image grid ───────────────────────────────────────────
  gridRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  gridTile: {
    flex: 1,
    height: 160,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#4A2E10",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  gridTileShort: {
    height: 130,
  },
  gridScrim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
  },
  gridInner: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 14,
  },
  gridEyebrowLight: {
    fontSize: 9,
    color: "rgba(255,255,255,0.65)",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  gridEyebrowGold: {
    fontSize: 15,
    color: "#C8A96A",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  gridTitleLight: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "600",
    lineHeight: 26,
  },
  // Inverted parchment chip for Hajj Guide eyebrow
  gridChip: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(253,250,244,0.90)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 6,
  },
  gridChipText: {
    fontSize: 8,
    color: "#4A5C48",
    fontWeight: "700",
    textTransform: "uppercase",
  },

  // ── People: solid-colour cards ────────────────────────────────────────────
  solidCardGreen: {
    backgroundColor: "#4A5C48",
    justifyContent: "flex-end",
    padding: 14,
  },
  solidCardParch: {
    backgroundColor: "#F5EDE0",
    borderWidth: 1,
    borderColor: "#C8BFB2",
    justifyContent: "flex-end",
    padding: 14,
  },
  solidCardEyebrow: {
    fontSize: 15,
    color: "#C8A96A",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  solidCardEyebrowDark: {
    fontSize: 9,
    color: "#8A7D70",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  solidCardTitle: {
    fontSize: 20,
    color: "#FDFAF4",
    fontWeight: "600",
    lineHeight: 26,
  },
  solidCardTitleDark: {
    fontSize: 20,
    color: "#4A5C48",
    fontWeight: "600",
    lineHeight: 26,
  },

  // ── Quick Tools — square tiles ────────────────────────────────────────────
  toolsScroll: {
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 4,
  },
  toolTile: {
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "flex-end",
    padding: 8,
    shadowColor: "#4A2E10",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 3,
  },
  toolLabel: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "600",
    lineHeight: 14,
  },

  // ── Du'a card ─────────────────────────────────────────────────────────────
  duaCard: {
    backgroundColor: "#FDFAF4",
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: "rgba(200, 191, 178, 0.5)",
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 22,
    overflow: "hidden",
    shadowColor: "#4A2E10",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 4,
  },
  duaPatternWrap: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    alignItems: "center",
  },
  duaArabicLg: {
    fontFamily: SERIF,
    fontSize: 30,
    color: "#1A1712",
    textAlign: "center",
    lineHeight: 52,
    marginTop: 8,
    marginBottom: 18,
  },
  duaTranslitLg: {
    fontSize: 15,
    color: "#8A7D6A",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 14,
  },
  duaTranslationLg: {
    fontFamily: SERIF,
    fontSize: 19,
    color: "#2A2620",
    textAlign: "center",
    lineHeight: 30,
    marginBottom: 14,
  },
  duaSourceLg: {
    fontSize: 12,
    color: "#9A7A3A",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  sourceLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 4,
    paddingVertical: 6,
  },
  sourceLineTxt: {
    fontSize: 13,
    color: "#8A7D6A",
    fontWeight: "500",
  },
  sourcesOverlay: {
    flex: 1,
    backgroundColor: "rgba(20,16,10,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  sourcesSheet: {
    backgroundColor: "#FDFAF4",
    borderRadius: 18,
    padding: 24,
    width: "100%",
    maxWidth: 380,
  },
  sourcesTitle: {
    fontSize: 20,
    color: "#1A1712",
    fontWeight: "600",
    marginBottom: 12,
  },
  sourcesBody: {
    fontSize: 14,
    color: "#5A5650",
    lineHeight: 22,
    marginBottom: 20,
  },
  sourcesClose: {
    backgroundColor: "#2F5D50",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  sourcesCloseTxt: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  duaArabic: {
    fontFamily: SERIF,
    fontSize: 22,
    color: "#4A5C48",
    textAlign: "right",
    lineHeight: 38,
    marginBottom: 16,
  },
  duaDivider: {
    height: 1,
    backgroundColor: "#E0D8CC",
    marginBottom: 14,
  },
  duaTranslit: {
    fontSize: 14,
    color: "#B8922A",
    fontStyle: "italic",
    lineHeight: 22,
    marginBottom: 8,
    fontWeight: "500",
  },
  duaTranslation: {
    fontSize: 14,
    color: "#3A3530",
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: "400",
  },
  duaFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  duaSource: {
    fontSize: 11,
    color: "#8A7D70",
    fontStyle: "italic",
    flex: 1,
  },
  duaActions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  duaBtn: {
    backgroundColor: "#4A5C48",
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  duaBtnText: {
    fontSize: 12,
    color: "#FDFAF4",
    fontWeight: "600",
  },
  duaBtnOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#4A5C48",
  },
  duaBtnOutlineText: {
    fontSize: 12,
    color: "#4A5C48",
    fontWeight: "600",
  },

  // ── Scholarly footnote ────────────────────────────────────────────────────
  footnoteWrap: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 8,
    backgroundColor: "#F5EDD8",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8D9B8",
    padding: 14,
  },
  footnoteText: {
    fontSize: 12,
    color: "#7A6030",
    lineHeight: 18,
  },
  footnoteBold: {
    fontWeight: "600",
  },

  // ── Top bar (parchment greeting + countdown above hero) ───────────────────
  topBar:         { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 0 },
  topBarLeft:     { flex: 1 },
  topBarSalam:    { fontSize: 14, color: "#8A7D6A", fontWeight: "500", lineHeight: 18 },
  topBarName:     { fontFamily: "SourceSerif4-Regular", fontSize: 20, color: "#1A1410", fontWeight: "600", lineHeight: 25, marginTop: 2 },
  topBarRight:    { flexDirection: "row", alignItems: "center", gap: 14 },
  wordmarkPlaceholder: {
    fontFamily: "SourceSerif4-Regular",
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1410",
    letterSpacing: 0.5,
  },
  journeyPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#7A9176",
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 20,
  },
  journeyPillText: {
    fontSize: 12,
    color: "#7A9176",
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  topBarDaysNum:  { fontSize: 20, color: "#1A1410", fontWeight: "700", lineHeight: 22 },
  topBarDaysLabel:{ fontSize: 13, color: "#8A7D6A", fontWeight: "500", lineHeight: 18 },
  settingsTile: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(253,250,244,0.5)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0D8CC",
    padding: 14,
    marginHorizontal: 14,
  },
  settingsTileIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#4A5C4812",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingsTileText: {
    flex: 1,
  },
  settingsTileLabel: {
    fontSize: 16,
    color: "#1A1410",
    fontWeight: "500",
    marginBottom: 2,
  },
  settingsTileSub: {
    fontSize: 13,
    color: "#5C534A",
    lineHeight: 18,
  },
  settingsTileArrow: {
    fontSize: 22,
    color: "#8A7D6A",
    marginLeft: 8,
  },
});
