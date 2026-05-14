import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
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
import AsyncStorage from "@react-native-async-storage/async-storage";

const SERIF = "SourceSerif4-Regular";
const { width: SW, height: SH } = Dimensions.get("window");

// ── Storage keys ──────────────────────────────────────────────────────────────
const DEPARTURE_KEY      = "safar_departure_date_v1";
const USER_NAME_KEY      = "safar_user_name_v1";
const PLAN_STARTED_KEY   = "safar_plan_started_v1";
const INTRO_DISMISSED_KEY = "safar_intro_dismissed_v1";

// ── Hero slides ───────────────────────────────────────────────────────────────
// Each slide has its own lighter scrim value tuned to that image's tone.
// Slide 1 shows the big greeting (user name). Slides 2–5 show headline + sub.
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
    image: require("../assets/journey3.png"),
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
    headline: "Set Up Your\nJourney",
    sub: "Add your booking info and build your plan in seconds",
    cta: "Get started",
    ctaIsAbout: false,
    ctaScreen: "ImportTrip",
    showGreeting: false,
  },
  {
    id: "duas",
    image: require("../assets/tab_my_lists.jpg"),
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
    image: require("../assets/medina.png"),
    scrim: "rgba(4,12,20,0.26)",
    tag: "MY PEOPLE",
    headline: "Travel Together,\nStay Connected",
    sub: "Share milestones with your group and loved ones",
    cta: "View groups",
    ctaIsAbout: false,
    ctaScreen: "Groups",
    showGreeting: false,
  },
];

// ── Today's du'ā (static — would rotate by date in production) ────────────────
const DAILY_DUA = {
  arabic:
    "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0627\u062c\u0639\u0644\u0646\u0627 \u062d\u062c\u0651\u064b\u0627 \u0645\u0628\u0631\u0648\u0631\u064b\u0627 \u0648\u0633\u0639\u064a\u064b\u0627 \u0645\u0634\u0643\u0648\u0631\u064b\u0627 \u0648\u0630\u0646\u0628\u064b\u0627 \u0645\u063a\u0641\u0648\u0631\u064b\u0627",
  transliteration:
    "All\u0101humma-j\u02bfaln\u0101 \u1e25ajjan mabrūran wa sa\u02bfyan mash\u016bran wa dhanban maghf\u016bran",
  translation:
    "O Allah, make our Hajj one that is accepted, our sa\u02bfy one that is appreciated, and our sins forgiven.",
  source: "Ibn M\u0101jah \u00b7 2893",
};

// ── About modal (tapped from greeting on slide 1) ─────────────────────────────
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
  const [heroSlide, setHeroSlide]         = useState(0);
  const [showAbout, setShowAbout]         = useState(false);
  const [userName, setUserName]           = useState("");
  const [daysAway, setDaysAway]           = useState(null);
  const [planStarted, setPlanStarted]     = useState(false);
  const [introDismissed, setIntroDismissed] = useState(false);
  const heroRef   = useRef(null);
  const heroTimer = useRef(null);

  const HERO_H = Math.round(SH * 0.60);
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
    try {
      await AsyncStorage.setItem(INTRO_DISMISSED_KEY, "true");
    } catch (_) {}
    setIntroDismissed(true);
  };

  const handleHeroCta = (slide) => {
    if (slide.ctaIsAbout) { setShowAbout(true); return; }
    if (slide.ctaScreen) navigation?.navigate?.(slide.ctaScreen);
  };

  // ── Hero slide renderer ───────────────────────────────────────────────────
  const renderSlide = ({ item: slide }) => (
    <ImageBackground
      source={slide.image}
      style={{ width: SW, height: HERO_H }}
      resizeMode="cover"
    >
      {/* Per-image lightweight scrim */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: slide.scrim }]} />

      {/* Top left — salam 14pt (no letterSpacing) + user name */}
      <View style={s.heroTopLeft}>
        <Text style={s.heroSalam}>{"As-sal\u0101mu \u02bfalaykum"}</Text>
        <Text style={s.heroUserName}>{displayName}</Text>
      </View>

      {/* Top right — days to go, two tight unstyled lines */}
      {daysAway !== null ? (
        <View style={s.daysBadge}>
          <Text style={s.daysNum}>{daysAway}</Text>
          <Text style={s.daysLabel}>days to go</Text>
        </View>
      ) : null}

      {/* Bottom content */}
      <View style={s.slideContent}>
        {/* Tag — plain uppercase text only, no shape */}
        <Text style={s.tagText}>{slide.tag}</Text>

        {/* Slide 1: user name as large tappable greeting → About modal */}
        {slide.showGreeting ? (
          <TouchableOpacity activeOpacity={0.85} onPress={() => setShowAbout(true)}>
            <Text style={s.heroGreeting}>{displayName}</Text>
          </TouchableOpacity>
        ) : null}

        {/* Slides 2–5: headline */}
        {slide.headline ? (
          <Text style={s.heroHeadline}>{slide.headline}</Text>
        ) : null}

        <Text style={s.heroSub}>{slide.sub}</Text>

        {/* CTA — small plain text link */}
        <TouchableOpacity activeOpacity={0.80} onPress={() => handleHeroCta(slide)}>
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

  // ── Contextual CTA link text + destination ────────────────────────────────
  // Simple: if plan not started → prompt to add booking info
  //         if plan started     → direct to Umrah Guide
  const ctxLabel = planStarted
    ? "Continue: Umrah Guide, Step 2 \u2192"
    : "Add your booking info \u2192";
  const ctxScreen = planStarted ? "UmrahGuide" : "ImportTrip";

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
            OPTION C CARD — App intro + contextual link
            Outlined parchment box, dismissable, sits directly under hero.
            Upper: short warm description of Safar.
            Lower: single contextual text link that changes with user state.
        ══════════════════════════════════════════════════════════════════ */}
        {introDismissed ? null : (
          <View style={s.introCard}>
            {/* Dismiss X — top right */}
            <TouchableOpacity style={s.introDismiss} onPress={dismissIntro}>
              <Text style={s.introDismissText}>{"\u00D7"}</Text>
            </TouchableOpacity>

            {/* Description */}
            <Text style={s.introTitle}>Your pilgrimage companion</Text>
            <Text style={s.introBody}>
              {"Safar helps you prepare for Hajj or Umrah with step-by-step guidance, du\u02bf\u0101\u02be for every moment, and tools to keep your group connected. Carry it with you \u2014 it\u2019s designed to be used on the ground, when you need it most."}
            </Text>

            {/* Divider */}
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
            Left tiles: light scrim, white text on image
            Right tiles: heavier bottom fade, parchment eyebrow
        ══════════════════════════════════════════════════════════════════ */}
        <View style={s.sectionDivider}>
          <View style={s.sectionBar} />
          <Text style={s.sectionLabel}>MY JOURNEY</Text>
          <View style={s.sectionLine} />
        </View>

        <View style={s.gridRow}>
          {/* Umrah Guide — green-tinted scrim, white text */}
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

          {/* Sacred Places — cool blue-dark scrim, inverted: parchment bg chip */}
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
              {/* Lighter top, heavier bottom gradient simulation */}
              <View style={[s.gridScrim, { backgroundColor: "rgba(8,14,24,0.32)" }]} />
              <View style={s.gridInner}>
                <Text style={s.gridEyebrowGold}>EXPLORE</Text>
                <Text style={s.gridTitleLight}>{"Sacred\nPlaces"}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </View>

        <View style={[s.gridRow, { marginTop: 8 }]}>
          {/* What to Expect — warm amber scrim */}
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

          {/* Hajj Guide — parchment chip on image for contrast variety */}
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
              {/* Very light scrim — image shows through more, text uses dark chip */}
              <View style={[s.gridScrim, { backgroundColor: "rgba(10,20,14,0.28)" }]} />
              <View style={s.gridInner}>
                {/* Inverted chip: parchment background, dark text — contrast variety */}
                <View style={s.gridChip}>
                  <Text style={s.gridChipText}>STEP BY STEP</Text>
                </View>
                <Text style={s.gridTitleLight}>{"Hajj\nGuide"}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </View>

        {/* ══════════════════════════════════════════════════════════════════
            MY PEOPLE
        ══════════════════════════════════════════════════════════════════ */}
        <View style={s.sectionDivider}>
          <View style={s.sectionBar} />
          <Text style={s.sectionLabel}>MY PEOPLE</Text>
          <View style={s.sectionLine} />
        </View>

        <View style={s.gridRow}>
          {/* My Groups — solid dark green card, light text — no image, intentional contrast */}
          <TouchableOpacity
            style={[s.gridTile, s.gridTileShort, s.solidCardGreen, { marginRight: 6 }]}
            activeOpacity={0.88}
            onPress={() => navigation?.navigate?.("Groups")}
          >
            <Text style={s.solidCardEyebrow}>COMMUNITY</Text>
            <Text style={s.solidCardTitle}>{"My\nGroups"}</Text>
          </TouchableOpacity>

          {/* My Contacts — light parchment card, dark text — intentional contrast */}
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
            Each tile has a distinct scrim tone so they don't all look the same
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
            {
              label: "Currency",
              image: require("../assets/tab_dua_library.jpg"),
              scrim: "rgba(12,8,2,0.42)",
              screen: "Currency",
            },
            {
              label: "Prayer Times",
              image: require("../assets/medina.png"),
              scrim: "rgba(4,12,22,0.40)",
              screen: "PrayerTimes",
            },
            {
              label: "Qibla",
              image: require("../assets/kaaba_map.png"),
              scrim: "rgba(6,16,10,0.38)",
              screen: "Qibla",
            },
            {
              label: "Notes",
              image: require("../assets/tab_shared_duas.jpg"),
              scrim: "rgba(10,8,4,0.40)",
              screen: "Notes",
            },
            {
              label: "Bookmarks",
              image: require("../assets/checklist_kaaba.jpg"),
              scrim: "rgba(8,18,10,0.38)",
              screen: "Bookmarks",
            },
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
            TODAY'S DU'Ā — parchment card at the base of the screen
            Light surface for a calm, readable close to the scroll
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

  // ── Hero: top-left salam + name ──────────────────────────────────────────
  heroTopLeft: {
    position: "absolute",
    top: 16,
    left: 20,
  },
  // 14pt, no letterSpacing — user asked three times, locking this in
  heroSalam: {
    fontSize: 14,
    color: "rgba(253,250,244,0.82)",
    fontWeight: "500",
    lineHeight: 18,
  },
  heroUserName: {
    fontFamily: SERIF,
    fontSize: 17,
    color: "#C8A96A",
    fontWeight: "600",
    lineHeight: 22,
  },

  // ── Hero: days to go — two tight lines, no background, top-right ─────────
  daysBadge: {
    position: "absolute",
    top: 16,
    right: 20,
    alignItems: "flex-end",
  },
  daysNum: {
    fontFamily: SERIF,
    fontSize: 22,
    fontWeight: "700",
    color: "#C8A96A",
    lineHeight: 25,
  },
  daysLabel: {
    fontSize: 10,
    color: "rgba(253,250,244,0.75)",
    fontWeight: "500",
    textTransform: "uppercase",
    lineHeight: 13,
  },

  // ── Hero: bottom slide content ────────────────────────────────────────────
  slideContent: {
    position: "absolute",
    bottom: 44,
    left: 22,
    right: 22,
  },
  // Plain uppercase tag text — no pill, no border
  tagText: {
    fontSize: 10,
    color: "#C8A96A",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  // Slide 1: large user name as tappable greeting
  heroGreeting: {
    fontFamily: SERIF,
    fontSize: 45,
    color: "#FDFAF4",
    fontWeight: "400",
    lineHeight: 50,
    marginBottom: 6,
  },
  // Slides 2–5: headline
  heroHeadline: {
    fontFamily: SERIF,
    fontSize: 32,
    color: "#F5EDE0",
    fontWeight: "600",
    lineHeight: 40,
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 17,
    color: "rgba(245,237,224,0.80)",
    lineHeight: 25,
    fontWeight: "400",
    marginBottom: 14,
  },
  // CTA: small plain text link, no button shape
  heroCtaText: {
    fontSize: 13,
    color: "rgba(200,169,106,0.95)",
    fontWeight: "600",
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
    backgroundColor: "rgba(245,237,224,0.30)",
  },
  dotActive: {
    backgroundColor: "#C8A96A",
    width: 18,
  },

  // ── Intro / Option C card ─────────────────────────────────────────────────
  // Outlined box, parchment background — visually distinct from image tiles
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
    marginBottom: 8,
    paddingRight: 20, // clear the × button
  },
  introBody: {
    fontSize: 14,
    color: "#5C534A",
    lineHeight: 22,
    fontWeight: "400",
  },
  introDivider: {
    height: 1,
    backgroundColor: "#E0D8CC",
    marginVertical: 14,
  },
  introCtaText: {
    fontSize: 14,
    color: "#1E3D30",
    fontWeight: "600",
  },

  // ── Section divider — 1pt line ────────────────────────────────────────────
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
  // White eyebrow for darker scrims
  gridEyebrowLight: {
    fontSize: 9,
    color: "rgba(253,250,244,0.70)",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  // Gold eyebrow for variety
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
    color: "#FDFAF4",
    fontWeight: "600",
    lineHeight: 26,
  },
  // Parchment chip — inverted treatment for contrast variety on Hajj Guide tile
  gridChip: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(253,250,244,0.88)",
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

  // ── People: solid-colour cards (no image) for contrast ───────────────────
  solidCardGreen: {
    backgroundColor: "#1E3D30",
    justifyContent: "flex-end",
    padding: 14,
    overflow: "hidden",
  },
  solidCardParch: {
    backgroundColor: "#F5EDE0",
    borderWidth: 1,
    borderColor: "#C8BFB2",
    justifyContent: "flex-end",
    padding: 14,
    overflow: "hidden",
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

  // ── Quick Tools — square tiles, not circles ───────────────────────────────
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
    color: "#FDFAF4",
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
});
