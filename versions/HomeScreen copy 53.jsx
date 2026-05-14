import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  FlatList,
  StyleSheet,
  Dimensions,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
    headline: "Your Step-by-Step\nGuide",
    sub: "Every ibadah, in order, with the right du\u02bfa\u02be",
    cta: "View guides",
    ctaIsAbout: false,
    ctaScreen: "Journey",
    showGreeting: false,
  },
  {
    id: "setup",
    image: require("../assets/what_to_expect.jpg"),
    scrim: "rgba(12,8,4,0.26)",
    tag: "AI-POWERED SETUP",
    headline: "Everything in One\nPlace, Instantly",
    sub: "Add your itinerary, key dates,\nand contacts in seconds",
    cta: "Get started",
    ctaIsAbout: false,
    ctaScreen: "Journey",
    showGreeting: false,
  },
  {
    id: "duas",
    image: require("../assets/hero_duas.jpg"),
    scrim: "rgba(8,16,12,0.26)",
    tag: "DU\u02bfĀS & WORSHIP",
    headline: "Every Du\u02bfa\u02be,\nEvery Moment",
    sub: "Authenticated, practised and always with you",
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
    headline: "Travel Together,\nStay Connected",
    sub: "Share milestones with your group\nand loved ones",
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
            {"Build a personalised step-by-step plan, pin your hotel, guide and travel group, practise the most important du\u02bf\u0101\u02bes, and carry the guidance of scholars in your pocket.\n\n"}
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
    shadowColor: "#1E3D30",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius: 24,
    elevation: 12,
  },
  title: {
    fontFamily: SERIF,
    fontSize: 22,
    fontWeight: "600",
    color: "#1E3D30",
    marginBottom: 14,
  },
  body: {
    fontSize: 15,
    color: "#3A3530",
    lineHeight: 24,
    marginBottom: 22,
  },
  btn: {
    backgroundColor: "#1E3D30",
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
  const [userName, setUserName]             = useState("");
  const [daysAway, setDaysAway]             = useState(null);
  const [planStarted, setPlanStarted]       = useState(false);
  const [introDismissed, setIntroDismissed] = useState(false);
  const heroRef   = useRef(null);
  const heroTimer = useRef(null);

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
  const ctxScreen = planStarted ? "Journey" : "Journey";

  // Prayer + date data (computed once per render — fine for a home screen)
  const { current: currentPrayer, next: nextPrayer } = getPrayerInfo();
  const hijri    = getHijriDate();
  const gregorian = getGregorianLabel();

  // ── Hero slide renderer ───────────────────────────────────────────────────
  const renderSlide = ({ item: slide }) => (
    <ImageBackground
      source={slide.image}
      style={{ width: SW, height: HERO_H }}
      resizeMode="cover"
    >
      {/* Per-image lightweight scrim */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: slide.scrim }]} />

      {/* Top left — salam 14pt + user name (white text on every slide) */}
      <View style={s.heroTopLeft}>
        <Text style={s.heroSalam}>{"As-sal\u0101mu \u02bfalaykum"}</Text>
        <Text style={s.heroUserName}>{displayName}</Text>
      </View>

      {/* Top right — days to go: always visible, fallback when no date set */}
      <View style={s.daysBadge}>
        <Text style={s.daysNum}>{daysAway !== null ? daysAway : "--"}</Text>
        <View style={s.daysLabelWrap}>
          <Text style={s.daysLabel}>days</Text>
          <Text style={s.daysLabel}>to go</Text>
        </View>
      </View>

      {/* Bottom content */}
      <View style={s.slideContent}>
        {/* Tag — plain white uppercase text */}
        <Text style={s.tagText}>{slide.tag}</Text>

        {/* Slide 1: large user name, tappable → About */}
        {slide.showGreeting ? (
          <TouchableOpacity activeOpacity={0.85} onPress={() => setShowAbout(true)}>
            <Text style={s.heroGreeting}>{displayName}</Text>
          </TouchableOpacity>
        ) : null}

        {/* Slides 2–5: headline — all white */}
        {slide.headline ? (
          <Text style={s.heroHeadline}>{slide.headline}</Text>
        ) : null}

        {/* Sub — all white, reduced opacity for hierarchy */}
        <Text style={s.heroSub}>{slide.sub}</Text>

        {/* CTA — slim white rectangle, dark text inside */}
        <TouchableOpacity
          style={s.heroCta}
          activeOpacity={0.82}
          onPress={() => handleHeroCta(slide)}
        >
          <Text style={s.heroCtaText}>{slide.cta}{" \u2192"}</Text>
        </TouchableOpacity>
      </View>

      {/* Dot indicators */}
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
    </ImageBackground>
  );

  // ── Prayer + calendar card (shown after intro is dismissed) ───────────────
  const PrayerCard = () => (
    <View style={s.prayerCard}>
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
  );

  return (
    <SafeAreaView style={s.safe}>
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
            <Text style={s.introTitle}>Safar is your companion for Hajj and Umrah</Text>
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
            MY JOURNEY — 2×2 image tiles, varied scrims & text treatments
        ══════════════════════════════════════════════════════════════════ */}
        <View style={s.sectionDivider}>
          <View style={s.sectionBar} />
          <Text style={s.sectionLabel}>MY JOURNEY</Text>
          <View style={s.sectionLine} />
        </View>

        <View style={s.gridRow}>
          {/* Umrah Guide */}
          <TouchableOpacity
            style={[s.gridTile, { marginRight: 6 }]}
            activeOpacity={0.88}
            onPress={() => navigation?.navigate?.("UmrahGuide")}
          >
            <ImageBackground
              source={require("../assets/kaaba_mixed.png")}
              style={{ flex: 1 }}
              imageStyle={{ borderRadius: 14 }}
              resizeMode="cover"
            >
              <View style={[s.gridScrim, { backgroundColor: "rgba(10,28,18,0.38)" }]} />
              <View style={s.gridInner}>
                <Text style={s.gridEyebrowLight}>STEP BY STEP</Text>
                <Text style={s.gridTitleLight}>{"Umrah\nGuide"}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>

          {/* Sacred Places */}
          <TouchableOpacity
            style={[s.gridTile, { marginLeft: 6 }]}
            activeOpacity={0.88}
            onPress={() => navigation?.navigate?.("SacredPlaces")}
          >
            <ImageBackground
              source={require("../assets/kaaba_map.png")}
              style={{ flex: 1 }}
              imageStyle={{ borderRadius: 14 }}
              resizeMode="cover"
            >
              <View style={[s.gridScrim, { backgroundColor: "rgba(8,14,24,0.32)" }]} />
              <View style={s.gridInner}>
                <Text style={s.gridEyebrowGold}>EXPLORE</Text>
                <Text style={s.gridTitleLight}>{"Sacred\nPlaces"}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </View>

        <View style={[s.gridRow, { marginTop: 8 }]}>
          {/* What to Expect */}
          <TouchableOpacity
            style={[s.gridTile, s.gridTileShort, { marginRight: 6 }]}
            activeOpacity={0.88}
            onPress={() => navigation?.navigate?.("WhatToExpect")}
          >
            <ImageBackground
              source={require("../assets/what_to_expect.jpg")}
              style={{ flex: 1 }}
              imageStyle={{ borderRadius: 14 }}
              resizeMode="cover"
            >
              <View style={[s.gridScrim, { backgroundColor: "rgba(18,10,4,0.34)" }]} />
              <View style={s.gridInner}>
                <Text style={s.gridEyebrowLight}>LOGISTICS</Text>
                <Text style={s.gridTitleLight}>{"What to\nExpect"}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>

          {/* Hajj Guide — lightest scrim, inverted parchment chip */}
          <TouchableOpacity
            style={[s.gridTile, s.gridTileShort, { marginLeft: 6 }]}
            activeOpacity={0.88}
            onPress={() => navigation?.navigate?.("HajjGuide")}
          >
            <ImageBackground
              source={require("../assets/checklist_kaaba.jpg")}
              style={{ flex: 1 }}
              imageStyle={{ borderRadius: 14 }}
              resizeMode="cover"
            >
              <View style={[s.gridScrim, { backgroundColor: "rgba(10,20,14,0.28)" }]} />
              <View style={s.gridInner}>
                <View style={s.gridChip}>
                  <Text style={s.gridChipText}>STEP BY STEP</Text>
                </View>
                <Text style={s.gridTitleLight}>{"Hajj\nGuide"}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </View>

        {/* ══════════════════════════════════════════════════════════════════
            MY PEOPLE — solid colour cards for contrast against image grid
        ══════════════════════════════════════════════════════════════════ */}
        <View style={s.sectionDivider}>
          <View style={s.sectionBar} />
          <Text style={s.sectionLabel}>MY PEOPLE</Text>
          <View style={s.sectionLine} />
        </View>

        <View style={s.gridRow}>
          {/* My Groups — dark green solid */}
          <TouchableOpacity
            style={[s.gridTile, s.gridTileShort, s.solidCardGreen, { marginRight: 6 }]}
            activeOpacity={0.88}
            onPress={() => navigation?.navigate?.("Groups")}
          >
            <Text style={s.solidCardEyebrow}>COMMUNITY</Text>
            <Text style={s.solidCardTitle}>{"My\nGroups"}</Text>
          </TouchableOpacity>

          {/* My Contacts — light parchment solid */}
          <TouchableOpacity
            style={[s.gridTile, s.gridTileShort, s.solidCardParch, { marginLeft: 6 }]}
            activeOpacity={0.88}
            onPress={() => navigation?.navigate?.("MyContacts")}
          >
            <Text style={s.solidCardEyebrowDark}>TRAVEL</Text>
            <Text style={s.solidCardTitleDark}>{"My\nContacts"}</Text>
          </TouchableOpacity>
        </View>

        {/* ══════════════════════════════════════════════════════════════════
            QUICK TOOLS — square image tiles (not circles)
        ══════════════════════════════════════════════════════════════════ */}
        <View style={s.sectionDivider}>
          <View style={s.sectionBar} />
          <Text style={s.sectionLabel}>QUICK TOOLS</Text>
          <View style={s.sectionLine} />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.toolsScroll}
        >
          {[
            { label: "Currency",     image: require("../assets/tab_dua_library.jpg"),  scrim: "rgba(12,8,2,0.42)",   screen: "Currency" },
            { label: "Prayer Times", image: require("../assets/medina.png"),            scrim: "rgba(4,12,22,0.40)",  screen: "PrayerTimes" },
            { label: "Qibla",        image: require("../assets/kaaba_map.png"),         scrim: "rgba(6,16,10,0.38)",  screen: "Qibla" },
            { label: "Notes",        image: require("../assets/tab_shared_duas.jpg"),   scrim: "rgba(10,8,4,0.40)",   screen: "Notes" },
            { label: "Bookmarks",    image: require("../assets/checklist_kaaba.jpg"),   scrim: "rgba(8,18,10,0.38)",  screen: "Bookmarks" },
          ].map((tool) => (
            <TouchableOpacity
              key={tool.label}
              style={s.toolTile}
              activeOpacity={0.84}
              onPress={() => navigation?.navigate?.(tool.screen)}
            >
              <ImageBackground
                source={tool.image}
                style={StyleSheet.absoluteFill}
                imageStyle={{ borderRadius: 12 }}
                resizeMode="cover"
              >
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: tool.scrim, borderRadius: 12 },
                  ]}
                />
              </ImageBackground>
              <Text style={s.toolLabel}>{tool.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ══════════════════════════════════════════════════════════════════
            TODAY'S DU'Ā
        ══════════════════════════════════════════════════════════════════ */}
        <View style={s.sectionDivider}>
          <View style={s.sectionBar} />
          <Text style={s.sectionLabel}>{"TODAY\u2019S DU\u02bfĀ"}</Text>
          <View style={s.sectionLine} />
        </View>

        <View style={s.duaCard}>
          <Text style={s.duaArabic}>{DAILY_DUA.arabic}</Text>
          <View style={s.duaDivider} />
          <Text style={s.duaTranslit}>{DAILY_DUA.transliteration}</Text>
          <Text style={s.duaTranslation}>{DAILY_DUA.translation}</Text>
          <View style={s.duaFooter}>
            <Text style={s.duaSource}>{DAILY_DUA.source}</Text>
            <View style={s.duaActions}>
              <TouchableOpacity
                style={s.duaBtn}
                onPress={() => navigation?.navigate?.("PracticeLearn")}
              >
                <Text style={s.duaBtnText}>Practise</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.duaBtn, s.duaBtnOutline]}>
                <Text style={s.duaBtnOutlineText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── SCHOLARLY FOOTNOTE ── */}
        <View style={s.footnoteWrap}>
          <Text style={s.footnoteText}>
            <Text style={s.footnoteBold}>Sources</Text>
            {" \u2014 Du\u02bf\u0101\u02bes are drawn from \u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b, \u1e62a\u1e25\u012b\u1e25 Muslim, Sunan Ab\u012b D\u0101w\u016bd, Sunan al-Tirmidh\u012b, and established scholarly works. Practice and wording may differ across the four madhhabs (\u1e24anaf\u012b, M\u0101lik\u012b, Sh\u0101fi\u02bf\u012b, \u1e24anbal\u012b). Consult a qualified scholar for rulings specific to your school of thought."}
          </Text>
        </View>

      </ScrollView>

      <AboutModal visible={showAbout} onClose={() => setShowAbout(false)} />
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

  // ── Hero: bottom slide content — bottom offset increased with taller hero ──
  slideContent: {
    position: "absolute",
    bottom: 14,
    left: 22,
    right: 22,
  },
  // Tag — plain white uppercase, text shadow lifts it off any image background
  tagText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.92)",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.60)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  // Slide 1: large greeting, pure white
  heroGreeting: {
    fontFamily: SERIF,
    fontSize: 45,
    color: "#FFFFFF",
    fontWeight: "400",
    lineHeight: 50,
    marginBottom: 6,
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  // Slides 2–5: headline, pure white
  heroHeadline: {
    fontFamily: SERIF,
    fontSize: 32,
    color: "#FFFFFF",
    fontWeight: "600",
    lineHeight: 40,
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  // Sub — white, softer opacity for hierarchy
  heroSub: {
    fontSize: 17,
    color: "rgba(255,255,255,0.88)",
    lineHeight: 25,
    fontWeight: "400",
    marginBottom: 16,
    textShadowColor: "rgba(0,0,0,0.40)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  // CTA — slim white rectangle, dark gold/green text inside
  heroCta: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  heroCtaText: {
    fontSize: 12,
    color: "#1E3D30",
    fontWeight: "700",
  },

  // ── Hero: dot indicators ──────────────────────────────────────────────────
  heroDots: {
    position: "absolute",
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.30)",
  },
  dotActive: {
    backgroundColor: "#FFFFFF",
    width: 18,
  },

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
    color: "#1E3D30",
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
    color: "#1E3D30",
    fontWeight: "600",
  },

  // ── Prayer / calendar card (after dismiss — same outer footprint) ─────────
  prayerCard: {
    marginHorizontal: 20,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#C8BFB2",
    borderRadius: 16,
    backgroundColor: "#FDFAF4",
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#4A2E10",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
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
    color: "#1E3D30",
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
    color: "#1E3D30",
    fontWeight: "600",
  },
  prayerCurrentTime: {
    fontSize: 15,
    color: "#1E3D30",
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

  // ── Section dividers ──────────────────────────────────────────────────────
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
    backgroundColor: "#1E3D30",
  },
  sectionLabel: {
    fontFamily: SERIF,
    fontSize: 16,
    fontWeight: "700",
    color: "#1E3D30",
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
    color: "#1E3D30",
    fontWeight: "700",
    textTransform: "uppercase",
  },

  // ── People: solid-colour cards ────────────────────────────────────────────
  solidCardGreen: {
    backgroundColor: "#1E3D30",
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
    color: "#1E3D30",
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
    padding: 22,
    shadowColor: "#4A2E10",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 4,
  },
  duaArabic: {
    fontFamily: SERIF,
    fontSize: 22,
    color: "#1E3D30",
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
    backgroundColor: "#1E3D30",
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
    borderColor: "#1E3D30",
  },
  duaBtnOutlineText: {
    fontSize: 12,
    color: "#1E3D30",
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
