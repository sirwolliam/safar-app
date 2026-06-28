import React, { useState, useEffect, useRef } from "react";
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
import Svg, { Path, Defs, LinearGradient as SvgGrad, Stop, Mask, Rect } from "react-native-svg";
import { PATTERN_PATH } from "./headerPatternPath";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import {
  MapTrifold, BookOpenText, HandsPraying, CompassRose,
  UsersThree, ShoppingBag, CheckSquare, Sparkle,
  ArrowRight, BookOpen, Moon, ListChecks, Users,
  Clock, PlayCircle, Wrench, Note, Gear, Info,
  SunHorizon,
} from "phosphor-react-native";

const SERIF = "SourceSerif4-Regular";
const { width: SW, height: SH } = Dimensions.get("window");

// ── Storage keys ──────────────────────────────────────────────────────────────
const DEPARTURE_KEY       = "safar_departure_date_v1";
const USER_NAME_KEY       = "safar_user_name_v1";
const PLAN_STARTED_KEY    = "safar_plan_started_v1";
const INTRO_DISMISSED_KEY = "safar_intro_dismissed_v1";

// ── Hero slides ───────────────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    id: "welcome",
    image: require("../assets/kaaba_mixed.png"),
    scrim: "rgba(8,20,12,0.28)",
    tag: "WELCOME TO SAFAR",
    headline: null,
    sub: "Plan, prepare and perform with confidence",
    cta: "Learn more",
    ctaIsAbout: true,
    ctaScreen: null,
    showGreeting: true,
  },
  {
    id: "journey",
    image: require("../assets/hero_guide.jpg"),
    scrim: "rgba(8,16,8,0.26)",
    tag: "MY JOURNEY",
    headline: "Your Step-by-Step Guide",
    sub: "Every ibadah, in order, with the right du\u02bfa\u02be",
    cta: "View guides",
    ctaIsAbout: false,
    ctaScreen: "Guidance",
    showGreeting: false,
  },
  {
    id: "setup",
    image: require("../assets/what_to_expect.jpg"),
    scrim: "rgba(12,8,4,0.26)",
    tag: "AI-POWERED SETUP",
    headline: "Everything you need. Fast.",
    sub: "Add your itinerary, key dates and contacts",
    cta: "Get started",
    ctaIsAbout: false,
    ctaScreen: "SafarAssist",
    showGreeting: false,
  },
  {
    id: "duas",
    image: require("../assets/hero_duas.jpg"),
    scrim: "rgba(8,16,12,0.26)",
    tag: "DU\u02bfĀS & WORSHIP",
    headline: "Every Du\u02bfa\u02be, Every Moment",
    sub: "Authenticated, practiced and always with you",
    cta: "View du\u02bfa\u02bes",
    ctaIsAbout: false,
    ctaScreen: "Duas",
    showGreeting: false,
  },
  {
    id: "people",
    image: require("../assets/hero_groups.jpg"),
    scrim: "rgba(4,12,20,0.26)",
    tag: "MY PEOPLE",
    headline: "Travel Together, Stay Connected",
    sub: "Share milestones with your group and loved ones",
    cta: "View groups",
    ctaIsAbout: false,
    ctaScreen: "Groups",
    showGreeting: false,
  },
];

// ── Prayer times (static placeholder — replace with live API / Adhan lib) ─────
// In production: use the 'adhan' npm package with device location for live times.
const PRAYER_SCHEDULE = [
  { name: "Fajr",    time: "04:52" },
  { name: "Dhuhr",   time: "12:18" },
  { name: "Asr",     time: "15:42" },
  { name: "Maghrib", time: "18:31" },
  { name: "Isha",    time: "20:04" },
];

// Return current and next prayer based on current time
function getPrayerInfo() {
  const now  = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const withMins = PRAYER_SCHEDULE.map((p) => {
    const [h, m] = p.time.split(":").map(Number);
    return { ...p, totalMins: h * 60 + m };
  });
  let current = withMins[withMins.length - 1];
  let next    = withMins[0];
  for (let i = 0; i < withMins.length; i++) {
    if (mins >= withMins[i].totalMins) {
      current = withMins[i];
      next    = withMins[(i + 1) % withMins.length];
    }
  }
  return { current, next };
}

// Islamic calendar approximation (Hijri) — good to within ±1 day
// For production use a proper Hijri library (e.g. 'hijri-date' or 'moment-hijri')
function getHijriDate() {
  const now      = new Date();
  const julianDay =
    Math.floor((now.getTime() - new Date(1970, 0, 1).getTime()) / 86400000) +
    2440588;
  const l = julianDay + 68569;
  const n = Math.floor((4 * l) / 146097);
  const ll = l - Math.floor((146097 * n + 3) / 4);
  const i = Math.floor((4000 * (ll + 1)) / 1461001);
  const lll = ll - Math.floor((1461 * i) / 4) + 31;
  const j = Math.floor((80 * lll) / 2447);
  const day = lll - Math.floor((2447 * j) / 80);
  const jj = Math.floor(j / 11);
  const month = j + 2 - 12 * jj;
  const year  = 100 * (n - 49) + i + jj - 1;
  const hijriYear  = Math.floor((year - 622) * (33 / 32));
  const HIJRI_MONTHS = [
    "Muharram","Safar","Rab\u012b\u02bf al-Awwal","Rab\u012b\u02bf al-\u1e24khar",
    "Jum\u0101d\u0101 al-\u016al\u00e1","Jum\u0101d\u0101 al-\u1e24khr\u00e1",
    "Rajab","Sha\u02bcb\u0101n","Rama\u1e0d\u0101n","Shaww\u0101l",
    "Dh\u016b al-Qa\u02bfdah","Dh\u016b al-\u1e24ijjah",
  ];
  return {
    day,
    month: HIJRI_MONTHS[(month - 1) % 12],
    year: hijriYear,
  };
}

// Gregorian date formatted
function getGregorianLabel() {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ── Today's du'ā ──────────────────────────────────────────────────────────────
const DAILY_DUA = {
  arabic:
    "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0627\u062c\u0639\u0644\u0646\u0627 \u062d\u062c\u0651\u064b\u0627 \u0645\u0628\u0631\u0648\u0631\u064b\u0627 \u0648\u0633\u0639\u064a\u064b\u0627 \u0645\u0634\u0643\u0648\u0631\u064b\u0627 \u0648\u0630\u0646\u0628\u064b\u0627 \u0645\u063a\u0641\u0648\u0631\u064b\u0627",
  transliteration:
    "All\u0101humma-j\u02bfaln\u0101 \u1e25ajjan mabrūran wa sa\u02bfyan mash\u016bran wa dhanban maghf\u016bran",
  translation:
    "O Allah, make our Hajj one that is accepted, our sa\u02bfy one that is appreciated, and our sins forgiven.",
  source: "Ibn M\u0101jah \u00b7 2893",
};

// ── About modal ───────────────────────────────────────────────────────────────
function AboutModal({ visible, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={ab.overlay} activeOpacity={1} onPress={onClose}>
        <View style={ab.card} onStartShouldSetResponder={() => true}>
          <Text style={ab.title}>What is Safar?</Text>
          <Text style={ab.body}>
            {"Safar is your companion for every step of your sacred Hajj or Umrah journey.\n\n"}
            {"Build a personalised step-by-step plan, pin your hotel, guide and travel group, practice the most important du\u02bf\u0101\u02bes, and carry the guidance of scholars in your pocket.\n\n"}
            {"Share milestones with fellow pilgrims, track your progress through every ibadah, and arrive prepared, calm and confident.\n\n"}
            {"May Allah accept your journey. \u0622\u0645\u064a\u0646"}
          </Text>
          <TouchableOpacity style={ab.btn} onPress={onClose}>
            <Text style={ab.btnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
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
  },
  title: {
    fontFamily: SERIF,
    fontSize: 22,
    fontWeight: "600",
    color: "#4A5C48",
    marginBottom: 14,
  },
  body: {
    fontSize: 15,
    color: "#3A3530",
    lineHeight: 24,
    marginBottom: 22,
  },
  btn: {
    backgroundColor: "#4A5C48",
    borderRadius: 50,
    paddingHorizontal: 32,
    paddingVertical: 11,
    alignSelf: "flex-start",
  },
  btnText: {
    color: "#FDFAF4",
    fontSize: 14,
    fontWeight: "600",
  },
});

// ─────────────────────────────────────────────────────────────────────────────

export default function HomeScreen({ navigation }) {
  const [heroSlide, setHeroSlide]           = useState(0);
  const [showAbout, setShowAbout]           = useState(false);
  const [showSources, setShowSources]       = useState(false);
  const [userName, setUserName]             = useState("");
  const [daysAway, setDaysAway]             = useState(null);
  const [planStarted, setPlanStarted]       = useState(false);
  const [introDismissed, setIntroDismissed] = useState(false);
  const [lastDua, setLastDua]               = useState(null); // { title, stage, id, allDuas, currentIndex }
  const heroRef   = useRef(null);
  const heroTimer = useRef(null);
  const insets    = useSafeAreaInsets();

  const HERO_H    = Math.round(SH * 0.60) + 35;
  const displayName = userName || "Pilgrim";

  // Auto-advance hero every 5s
  useEffect(() => {
    heroTimer.current = setInterval(() => {
      setHeroSlide((prev) => {
        const next = (prev + 1) % HERO_SLIDES.length;
        heroRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 5000);
    return () => clearInterval(heroTimer.current);
  }, []);

  // Load persisted state
  useEffect(() => {
    (async () => {
      try {
        const name = await AsyncStorage.getItem(USER_NAME_KEY);
        if (name) setUserName(name);

        const dep = await AsyncStorage.getItem(DEPARTURE_KEY);
        if (dep) {
          const diff = Math.ceil((new Date(dep) - new Date()) / 86400000);
          if (diff > 0) setDaysAway(diff);
        }

        const plan = await AsyncStorage.getItem(PLAN_STARTED_KEY);
        if (plan === "true") setPlanStarted(true);

        const dismissed = await AsyncStorage.getItem(INTRO_DISMISSED_KEY);
        if (dismissed === "true") setIntroDismissed(true);

        // Last viewed du'ā — for continuation card
        const lastDuaRaw = await AsyncStorage.getItem("SAFAR_LAST_DUA");
        if (lastDuaRaw) {
          try { setLastDua(JSON.parse(lastDuaRaw)); } catch (_) {}
        }
      } catch (_) {}
    })();
  }, []);

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

  const handleHeroCta = (slide) => {
    if (slide.ctaIsAbout) { setShowAbout(true); return; }
    if (slide.ctaScreen) navigation?.navigate?.(slide.ctaScreen);
  };

  // Contextual CTA
  const ctxLabel  = planStarted
    ? "Continue: Umrah Guide, Step 2 \u2192"
    : "Add your booking info \u2192";
  const ctxScreen = planStarted ? "Guides" : "SafarAssist";

  // Prayer + date data (computed once per render — fine for a home screen)
  const { current: currentPrayer, next: nextPrayer } = getPrayerInfo();
  const hijri    = getHijriDate();
  const gregorian = getGregorianLabel();

  // ── Hero slide renderer ───────────────────────────────────────────────────
  const renderSlide = ({ item: slide }) => {
    const isKaaba = slide.id === "welcome";
    return (
      <View style={{ width: SW, height: HERO_H, overflow: "hidden" }}>

        {/* Ka'bah slide: custom Image so we can scale + shift it */}
        {isKaaba ? (
          <Image
            source={slide.image}
            style={{
              position:  "absolute",
              width:     SW * 1.15,
              height:    HERO_H * 1.20,
              top:       -HERO_H * 0.12 - 30,
              left:      -(SW * 0.075),
              resizeMode:"cover",
            }}
          />
        ) : (
          <Image
            source={slide.image}
            style={{ position:"absolute", width:SW, height:HERO_H, resizeMode:"cover" }}
          />
        )}

        {/* Very light scrim — keeps photo bright */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor:"rgba(0,0,0,0.08)" }]} />

        {/* Top left — salam + user name */}
        <View style={[s.heroTopLeft, { top: insets.top + 12 }]}>
          <Text style={s.heroSalam}>{"As-sal\u0101mu \u02bfalaykum"}</Text>
          <Text style={s.heroUserName}>{displayName}</Text>
        </View>

        {/* Top right — days badge */}
        <View style={[s.daysBadge, { top: insets.top + 12 }]}>
          <Text style={s.daysNum}>{daysAway !== null ? daysAway : "--"}</Text>
          <View style={s.daysLabelWrap}>
            <Text style={s.daysLabel}>days</Text>
            <Text style={s.daysLabel}>to go</Text>
          </View>
        </View>

        {/* Floating panel */}
        <View style={s.heroPanel}>
          <Text style={s.heroTag}>{slide.tag}</Text>

          {slide.showGreeting ? (
            <TouchableOpacity activeOpacity={0.85} onPress={() => setShowAbout(true)}>
              <Text style={s.heroPanelGreeting} numberOfLines={1} adjustsFontSizeToFit>
                {displayName}
              </Text>
            </TouchableOpacity>
          ) : null}

          {slide.headline ? (
            <Text style={s.heroPanelHeadline} numberOfLines={2}>
              {slide.headline}
            </Text>
          ) : null}

          <Text style={s.heroPanelSub} numberOfLines={2}>
            {slide.sub}
          </Text>

          <TouchableOpacity
            style={s.heroPanelCta}
            activeOpacity={0.85}
            onPress={() => handleHeroCta(slide)}
          >
            <Text style={s.heroPanelCtaTxt}>{slide.cta}{"  \u2192"}</Text>
          </TouchableOpacity>

          <View style={s.heroDots}>
            {HERO_SLIDES.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  heroRef.current?.scrollToIndex({ index: i, animated: true });
                  setHeroSlide(i);
                }}
              >
                <View style={[s.dot, i === heroSlide ? s.dotActive : null]} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </View>
    );
  };

  // ── Prayer + calendar card (shown after intro is dismissed) ───────────────
  const PrayerCard = () => (
    <View style={s.prayerCard}>
      {/* Prayer + date row */}
      <View style={s.prayerContentRow}>
        {/* Left: dates */}
        <View style={s.prayerDateCol}>
          <Text style={s.prayerGregorian}>{gregorian}</Text>
          <Text style={s.prayerHijri}>
            {hijri.day}{" "}{hijri.month}{" "}{hijri.year}{" AH"}
          </Text>
        </View>

        {/* Divider */}
        <View style={s.prayerDividerV} />

        {/* Right: current + next prayer */}
        <View style={s.prayerTimesCol}>
          <View style={s.prayerRow}>
            <View style={s.prayerActiveDot} />
            <Text style={s.prayerCurrentName}>{currentPrayer.name}</Text>
            <Text style={s.prayerCurrentTime}>{currentPrayer.time}</Text>
          </View>
          <View style={s.prayerDividerH} />
          <View style={s.prayerRow}>
            <View style={s.prayerNextDot} />
            <Text style={s.prayerNextName}>Next · {nextPrayer.name}</Text>
            <Text style={s.prayerNextTime}>{nextPrayer.time}</Text>
          </View>
        </View>
      </View>

      {/* Weather strip */}
      <View style={s.prayerWeatherLine} />
      {/* MOCK — replace with OpenWeatherMap API call for
          Makkah (lat: 21.3891, lon: 39.8579) */}
      <View style={s.prayerWeatherStrip}>
        <View style={s.prayerWeatherCity}>
          <SunHorizon size={18} color="#C8A96A" weight="regular" />
          <Text style={s.prayerWeatherLabel}>Makkah</Text>
          <Text style={s.prayerWeatherTemp}>38°C</Text>
        </View>
        <View style={s.prayerWeatherVertDiv} />
        <View style={s.prayerWeatherCity}>
          <SunHorizon size={18} color="#C8A96A" weight="regular" />
          <Text style={s.prayerWeatherLabel}>Madinah</Text>
          <Text style={s.prayerWeatherTemp}>34°C</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.safe} edges={["bottom", "left", "right"]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 52 }}
      >

        {/* ── HERO CAROUSEL ── */}
        <FlatList
          ref={heroRef}
          data={HERO_SLIDES}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / SW);
            setHeroSlide(idx);
          }}
          style={{ height: HERO_H }}
          getItemLayout={(_, index) => ({
            length: SW,
            offset: SW * index,
            index,
          })}
        />

        {/* ══════════════════════════════════════════════════════════════════
            FOUR PILLARS — wayfinding hub cards
            Each opens a dedicated hub screen (stubs navigate to closest
            existing screen; replace targets when hub screens are built)
        ══════════════════════════════════════════════════════════════════ */}
        <View style={[s.pillarsHeader, { marginTop: 19 }]}>
          <Text style={[s.pillarsHeaderText, { fontSize: 20, fontWeight: "600", color: "#1A1712" }]}>Prepare for every step</Text>
        </View>
        <View style={s.pillarsGrid}>

          {/* Plan */}
          <TouchableOpacity
            style={[s.pillarCard, s.pillarCardPlan]}
            activeOpacity={0.88}
            onPress={() => navigation?.navigate?.("HubContainer", { pillar: "plan" })}
          >
            <View style={s.pillarInner}>
              <View>
                <Text style={s.pillarLabel}>Plan</Text>
                <Text style={s.pillarDesc}>{"Dates, checklist,\nnotes & contacts"}</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Learn */}
          <TouchableOpacity
            style={[s.pillarCard, s.pillarCardLearn]}
            activeOpacity={0.88}
            onPress={() => navigation?.navigate?.("HubContainer", { pillar: "learn" })}
          >
            <View style={s.pillarInner}>
              <View>
                <Text style={s.pillarLabel}>Learn</Text>
                <Text style={s.pillarDesc}>{"Guides, sacred places\n& what to expect"}</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Practice */}
          <TouchableOpacity
            style={[s.pillarCard, s.pillarCardPractice]}
            activeOpacity={0.88}
            onPress={() => navigation?.navigate?.("HubContainer", { pillar: "practice" })}
          >
            <View style={s.pillarInner}>
              <View>
                <Text style={s.pillarLabel}>Practice</Text>
                <Text style={s.pillarDesc}>{"Du\u02bf\u0101s, Focus mode\n& step-by-step"}</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Connect */}
          <TouchableOpacity
            style={[s.pillarCard, s.pillarCardConnect]}
            activeOpacity={0.88}
            onPress={() => navigation?.navigate?.("HubContainer", { pillar: "connect" })}
          >
            <View style={s.pillarInner}>
              <View>
                <Text style={s.pillarLabel}>Connect</Text>
                <Text style={s.pillarDesc}>{"Groups, milestones\n& companions"}</Text>
              </View>
            </View>
          </TouchableOpacity>

        </View>

        {/* ══════════════════════════════════════════════════════════════════
            OPTION C CARD
            Before dismiss: intro text + contextual link
            After dismiss:  prayer times + dual calendar (same footprint)
        ══════════════════════════════════════════════════════════════════ */}
        {introDismissed ? (
          <PrayerCard />
        ) : (
          <View style={s.introCard}>
            {/* Dismiss × */}
            <TouchableOpacity style={s.introDismiss} onPress={dismissIntro}>
              <Text style={s.introDismissText}>{"\u00D7"}</Text>
            </TouchableOpacity>

            {/* Concise value statement */}
            <Text style={s.introTitle}>Your trusted guide for Hajj and Umrah</Text>
            <Text style={s.introBody}>
              {"Step-by-step guidance, du\u02bf\u0101\u02bes for every moment, and tools to help you stay focused and connected."}
            </Text>

            <View style={s.introDivider} />

            {/* Contextual link */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => navigation?.navigate?.(ctxScreen)}
            >
              <Text style={s.introCtaText}>{ctxLabel}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            MY JOURNEY CARD
        ══════════════════════════════════════════════════════════════════ */}
        <View style={s.journeyCard}>
          <View style={s.journeyCardTop}>
            <View>
              <Text style={s.journeyCardEyebrow}>MY JOURNEY</Text>
              <Text style={s.journeyCardTitle}>
                {daysAway !== null
                  ? `${daysAway} days until departure`
                  : "Plan your pilgrimage"}
              </Text>
            </View>
            <TouchableOpacity
              style={s.journeyCardBtn}
              onPress={() => navigation?.navigate?.("Hubs", { tab: "plan" })}
              activeOpacity={0.85}
            >
              <ArrowRight size={18} color="#FFFFFF" weight="regular" />
            </TouchableOpacity>
          </View>

          {/* Quick links row */}
          <View style={s.journeyLinks}>
            {[
              { label:"Board",     screen:"MyBoard"     },
              { label:"Checklist", screen:"WhatToExpect"},
              { label:"Contacts",  screen:"MyContacts"  },
              { label:"Groups",    screen:"Groups"      },
            ].map((item, i, arr) => (
              <React.Fragment key={item.label}>
                <TouchableOpacity
                  style={s.journeyLink}
                  onPress={() => navigation?.navigate?.(item.screen)}
                  activeOpacity={0.75}
                >
                  <Text style={s.journeyLinkTxt}>{item.label}</Text>
                </TouchableOpacity>
                {i < arr.length - 1 ? <View style={s.journeyLinkDiv} /> : null}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════════════════
            MY SHORTCUTS ICON GRID — 2×4
        ══════════════════════════════════════════════════════════════════ */}
        <View style={s.shortcutsHeader}>
          <Text style={s.shortcutsHeaderText}>My Shortcuts</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={s.shortcutsHeaderEdit}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={s.gridWrap}>
          {[
            { label:"Groups",       Icon:UsersThree,   screen:"Groups"      },
            { label:"Guides",        Icon:BookOpenText, screen:"Guides"      },
            { label:"Shop",          Icon:ShoppingBag,  screen:"Shop"        },
            { label:"Prayer Times",  Icon:Clock,        screen:"PrayerTimes" },
            { label:"Media",         Icon:PlayCircle,   screen:"Media"       },
            { label:"Tools",         Icon:Wrench,       screen:"Tools"       },
            { label:"Notes",         Icon:Note,         screen:"Notes"       },
            { label:"Settings",      Icon:Gear,         screen:"Settings"    },
          ].map(({ label, Icon, screen }) => (
            <TouchableOpacity
              key={label}
              style={s.gridCell}
              onPress={() => navigation?.navigate?.(screen)}
              activeOpacity={0.78}
            >
              <View style={s.gridIconWrap}>
                <Icon size={24} color="#9A7A3A" weight="regular" />
              </View>
              <Text style={s.gridLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ══════════════════════════════════════════════════════════════════
            CONTINUATION CARD — only shown when there's a last-viewed du'ā
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
              style={{ position:"absolute", right:0, top:0, bottom:0, width:350, height:104 }}
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
              {/* Top row: eyebrow + arrow */}
              <View style={s.continuationTopRow}>
                <Text style={s.continuationEyebrow} numberOfLines={1}>CONTINUE READING</Text>
                <View style={s.continuationBtn}>
                  <ArrowRight size={16} color="#F5F0E8" weight="regular" />
                </View>
              </View>
              <Text style={s.continuationTitle} numberOfLines={2}>
                {lastDua.dua?.title ?? "Your last du\u02bf\u0101\u02be"}
              </Text>
              {lastDua.dua?.stage ? (
                <Text style={s.continuationStage}>{lastDua.dua.stage}</Text>
              ) : null}
            </View>
          </TouchableOpacity>
        ) : null}

        {/* Focus Mode + Sacred Places cards moved to parked-components.jsx
            for reuse on a future screen. */}

        <View style={s.pillarsHeader}>
          <Text style={s.pillarsHeaderText}>{"Today\u2019s Du\u02bf\u0101"}</Text>
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
            <TouchableOpacity style={[s.duaBtn, s.duaBtnOutline]} activeOpacity={0.85}>
              <Text style={s.duaBtnOutlineText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Compact source line + info popup ── */}
        <TouchableOpacity
          style={s.sourceLine}
          onPress={() => setShowSources(true)}
          activeOpacity={0.7}
        >
          <Info size={15} color="#8A7D6A" weight="regular" />
          <Text style={s.sourceLineTxt}>Du'ā sources</Text>
        </TouchableOpacity>

      </ScrollView>

      <AboutModal visible={showAbout} onClose={() => setShowAbout(false)} />

      {/* Sources popup */}
      <Modal visible={showSources} transparent animationType="fade">
        <TouchableOpacity style={s.sourcesOverlay} activeOpacity={1} onPress={() => setShowSources(false)}>
          <View style={s.sourcesSheet}>
            <Text style={s.sourcesTitle}>Du'ā Sources</Text>
            <Text style={s.sourcesBody}>
              {"Du\u02bf\u0101\u02bes are drawn from \u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b, \u1e62a\u1e25\u012b\u1e25 Muslim, Sunan Ab\u012b D\u0101w\u016bd, Sunan al-Tirmidh\u012b, and established scholarly works. Practice and wording may differ across the four madhhabs (\u1e24anaf\u012b, M\u0101lik\u012b, Sh\u0101fi\u02bf\u012b, \u1e24anbal\u012b). Consult a qualified scholar for rulings specific to your school of thought."}
            </Text>
            <TouchableOpacity style={s.sourcesClose} onPress={() => setShowSources(false)} activeOpacity={0.85}>
              <Text style={s.sourcesCloseTxt}>Got it</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({

  safe: {
    flex: 1,
    backgroundColor: "#E8DDD0",
  },

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
    fontFamily: SERIF,
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
    fontFamily: SERIF,
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

  // ── Hero: bottom floating glass panel ────────────────────────────────────
  heroPanel: {
    position:          "absolute",
    bottom:            20,
    left:              18,
    right:             18,
    backgroundColor:   "rgba(8,20,12,0.57)",
    borderRadius:      16,
    paddingTop:        16,
    paddingBottom:     14,
    paddingHorizontal: 18,
  },
  heroTag: {
    fontSize:      10,
    color:         "rgba(200,169,106,0.90)",
    fontWeight:    "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom:  6,
  },
  heroPanelGreeting: {
    fontFamily:   SERIF,
    fontSize:     22,
    color:        "#FFFFFF",
    fontWeight:   "400",
    lineHeight:   28,
    marginBottom: 4,
  },
  heroPanelHeadline: {
    fontFamily:   SERIF,
    fontSize:     22,
    color:        "#FFFFFF",
    fontWeight:   "400",
    lineHeight:   28,
    marginBottom: 4,
  },
  heroPanelSub: {
    fontSize:     13,
    color:        "rgba(235,228,210,0.92)",
    lineHeight:   19,
    fontWeight:   "400",
    marginBottom: 12,
  },
  heroPanelCta: {
    backgroundColor: "#4A5C48",
    borderRadius:    9,
    paddingVertical: 11,
    alignItems:      "center",
    marginBottom:    10,
  },
  heroPanelCtaTxt: {
    fontFamily:    SERIF,
    fontSize:      15,
    color:         "#FFFFFF",
    fontWeight:    "600",
    letterSpacing: 0.3,
  },

  // ── Hero: dot indicators inside panel ─────────────────────────────────────
  heroDots: {
    flexDirection:  "row",
    justifyContent: "center",
    gap:            6,
  },
  dot: {
    width:           5,
    height:          5,
    borderRadius:    3,
    backgroundColor: "rgba(255,255,255,0.30)",
  },
  dotActive: {
    backgroundColor: "#C8A96A",
    width:           18,
  },

  // ── Old hero styles kept for reference — no longer used ──────────────────
  slideContent:   { position:"absolute", bottom:14, left:22, right:22 },
  tagText:        { fontSize:10, color:"rgba(255,255,255,0.92)", fontWeight:"700", textTransform:"uppercase", marginBottom:8 },
  heroGreeting:   { fontFamily:SERIF, fontSize:45, color:"#FFFFFF", fontWeight:"400", lineHeight:50, marginBottom:6 },
  heroHeadline:   { fontFamily:SERIF, fontSize:32, color:"#FFFFFF", fontWeight:"600", lineHeight:40, marginBottom:8 },
  heroSub:        { fontSize:17, color:"rgba(255,255,255,0.88)", lineHeight:25, fontWeight:"400", marginBottom:16 },
  heroCta:        { alignSelf:"flex-start", backgroundColor:"rgba(255,255,255,0.75)", borderRadius:4, paddingHorizontal:12, paddingVertical:5 },
  heroCtaText:    { fontSize:12, color:"#4A5C48", fontWeight:"700" },

  // ── Intro card (before dismiss) ───────────────────────────────────────────
  introCard: {
    marginHorizontal: 20,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#C8BFB2",
    borderRadius: 16,
    backgroundColor: "#FDFAF4",
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
    fontFamily: SERIF,
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
    marginHorizontal: 13,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#C8BFB2",
    borderRadius: 16,
    backgroundColor: "#FDFAF4",
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
  prayerGregorian: {
    fontSize: 12,
    color: "#3A3530",
    fontWeight: "500",
    lineHeight: 17,
  },
  prayerHijri: {
    fontFamily: SERIF,
    fontSize: 13,
    color: "#4A5C48",
    fontWeight: "600",
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
    backgroundColor: "#B8922A",
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
    fontFamily: SERIF,
    fontSize: 15,
    color: "#4A5C48",
    fontWeight: "600",
  },
  prayerCurrentTime: {
    fontSize: 15,
    color: "#4A5C48",
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
    color: "#8A7D70",
    fontWeight: "400",
  },
  prayerNextTime: {
    fontSize: 12,
    color: "#8A7D70",
    fontWeight: "500",
    fontVariant: ["tabular-nums"],
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
    backgroundColor: "#F0EBE1",
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
    marginTop: 22,
    marginBottom: 12,
  },
  pillarsHeaderText: {
    fontFamily: SERIF,
    fontSize: 16,
    fontWeight: "700",
    color: "#4A5C48",
  },
  pillarsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 4,
  },
  pillarCard: {
    width: "47%",
    flexGrow: 1,
    height: 120,
    borderRadius: 18,
    overflow: "hidden",
    padding: 16,
    justifyContent: "space-between",
    opacity: 0.75,
    shadowColor: "#1C2E1C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 8,
    elevation: 6,
  },
  pillarCardLearn:    { backgroundColor: "#1C2B1E" },
  pillarCardPractice: { backgroundColor: "#2A1F0E" },
  pillarCardPlan:     { backgroundColor: "#1A202E" },
  pillarCardConnect:  { backgroundColor: "#221820" },

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
    fontFamily: SERIF,
    fontSize: 20,
    color: "#FDFAF4",
    fontWeight: "400",
    lineHeight: 25,
  },
  pillarDesc: {
    fontSize: 13,
    color: "rgba(235,228,210,0.92)",
    fontWeight: "400",
    lineHeight: 19,
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

  // ── My Shortcuts header ───────────────────────────────────────────────────
  shortcutsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 0,
  },
  shortcutsHeaderText: {
    fontFamily: SERIF,
    fontSize: 16,
    fontWeight: "700",
    color: "#4A5C48",
  },
  shortcutsHeaderEdit: {
    fontSize: 13,
    color: "#8A7D70",
    fontWeight: "500",
  },

  // ── Section dividers ──────────────────────────────────────────────────────
  // ── Icon grid ────────────────────────────────────────────────────────────────
  gridWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 14,
    paddingTop: 20,
    paddingBottom: 8,
    gap: 10,
  },
  gridCell: {
    width: "22%",
    flexGrow: 1,
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F3E9D2",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(184,146,42,0.30)",
    paddingVertical: 16,
    paddingHorizontal: 6,
    shadowColor: "#6A4A28",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 5,
    elevation: 2,
  },
  gridIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(184,146,42,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  gridLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6A5A38",
    textAlign: "center",
    lineHeight: 17,
  },

  // ── My Journey card ───────────────────────────────────────────────────────
  journeyCard: {
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: "#FDFAF4",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(184,146,42,0.40)",
    shadowColor: "#1C2E1C",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
  },
  journeyCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
  },
  journeyCardEyebrow: {
    fontSize: 10,
    fontWeight: "700",
    color: "#B8922A",
    letterSpacing: 1.2,
    marginBottom: 3,
  },
  journeyCardTitle: {
    fontFamily: SERIF,
    fontSize: 18,
    color: "#1C1A14",
    fontWeight: "400",
  },
  journeyCardBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4A5C48",
    alignItems: "center",
    justifyContent: "center",
  },
  journeyLinks: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "rgba(184,146,42,0.22)",
  },
  journeyLink: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  journeyLinkTxt: {
    fontSize: 13,
    color: "#4A5C48",
    fontWeight: "600",
  },
  journeyLinkDiv: {
    width: 1,
    backgroundColor: "rgba(184,146,42,0.22)",
    marginVertical: 8,
  },

  // ── Focus Mode card ───────────────────────────────────────────────────────
  // ── Continuation card ─────────────────────────────────────────────────────
  continuationCard: {
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 0,
    height: 104,
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
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    justifyContent: "center",
    gap: 3,
  },
  continuationTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  continuationEyebrow: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(200,169,106,0.90)",
    letterSpacing: 1.4,
  },
  continuationTitle: {
    fontFamily: SERIF,
    fontSize: 22,
    color: "#FDFAF4",
    fontWeight: "400",
  },
  continuationStage: {
    fontSize: 13,
    color: "rgba(245,240,232,0.60)",
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
    fontFamily: SERIF,
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
    fontFamily: SERIF,
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
    fontFamily: SERIF,
    fontSize: 16,
    fontWeight: "700",
    color: "#4A5C48",
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
    fontSize: 9,
    color: "#C8A96A",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  gridTitleLight: {
    fontFamily: SERIF,
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
    fontSize: 9,
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
    fontFamily: SERIF,
    fontSize: 20,
    color: "#FDFAF4",
    fontWeight: "600",
    lineHeight: 26,
  },
  solidCardTitleDark: {
    fontFamily: SERIF,
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

  // ── Du'ā card ─────────────────────────────────────────────────────────────
  duaCard: {
    backgroundColor: "#FDFAF4",
    marginHorizontal: 20,
    borderRadius: 18,
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
    marginTop: 16,
    marginBottom: 8,
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
    fontFamily: SERIF,
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
    fontFamily: SERIF,
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
    gap: 8,
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
});
