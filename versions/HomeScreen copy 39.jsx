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
const DEPARTURE_KEY = "safar_departure_date_v1";
const USER_NAME_KEY = "safar_user_name_v1";
const CONTACTS_KEY  = "safar_journey_contacts_v1";

// ── Hero slides ───────────────────────────────────────────────────────────────
// Slide 1 only: big greeting + "Welcome to Safar" tag.
// Slides 2–5: tag + headline + sub only (no greeting repeated).
const HERO_SLIDES = [
  {
    id: "welcome",
    image: require("../assets/kaaba_mixed.png"),
    tag: "WELCOME TO SAFAR",
    headline: null,
    sub: "Plan, prepare and perform with confidence",
    cta: "Learn More",
    ctaScreen: null,
    ctaIsAbout: true,
    showGreeting: true,
  },
  {
    id: "journey",
    image: require("../assets/journey3.png"),
    tag: "MY JOURNEY",
    headline: "Your Step-by-Step\nGuide",
    sub: "Every ibadah, in order, with the right du\u02bfa\u02be",
    cta: "View Guides",
    ctaScreen: "Journey",
    ctaIsAbout: false,
    showGreeting: false,
  },
  {
    id: "setup",
    image: require("../assets/what_to_expect.jpg"),
    tag: "AI-POWERED SETUP",
    headline: "Set Up Your\nJourney",
    sub: "Import your booking and build your plan in seconds",
    cta: "Get Started",
    ctaScreen: "ImportTrip",
    ctaIsAbout: false,
    showGreeting: false,
  },
  {
    id: "duas",
    image: require("../assets/tab_my_lists.jpg"),
    tag: "DU\u02bfĀS & WORSHIP",
    headline: "Every Du\u02bfa\u02be,\nEvery Moment",
    sub: "Authenticated, practised and always with you",
    cta: "View Du\u02bfa\u02bes",
    ctaScreen: "Duas",
    ctaIsAbout: false,
    showGreeting: false,
  },
  {
    id: "people",
    image: require("../assets/medina.png"),
    tag: "MY PEOPLE",
    headline: "Travel Together,\nStay Connected",
    sub: "Share milestones with your group and loved ones",
    cta: "View Groups",
    ctaScreen: "Groups",
    ctaIsAbout: false,
    showGreeting: false,
  },
];

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
    backgroundColor: "rgba(15,36,25,0.72)",
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
    shadowOpacity: 0.28,
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
    paddingHorizontal: 36,
    paddingVertical: 12,
    alignSelf: "flex-start",
  },
  btnText: {
    color: "#FDFAF4",
    fontSize: 15,
    fontWeight: "600",
  },
});

// ─────────────────────────────────────────────────────────────────────────────

export default function HomeScreen({ navigation }) {
  const [heroSlide, setHeroSlide]       = useState(0);
  const [showAbout, setShowAbout]       = useState(false);
  const [userName, setUserName]         = useState("");
  const [daysAway, setDaysAway]         = useState(null);
  const heroRef   = useRef(null);
  const heroTimer = useRef(null);

  const HERO_H = Math.round(SH * 0.60);

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

  // Load persisted user data
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
      } catch (_) {}
    })();
  }, []);

  const handleHeroCta = (slide) => {
    if (slide.ctaIsAbout) { setShowAbout(true); return; }
    if (slide.ctaScreen) navigation?.navigate?.(slide.ctaScreen);
  };

  // ── Render one hero slide ─────────────────────────────────────────────────
  const renderSlide = ({ item: slide }) => (
    <ImageBackground
      source={slide.image}
      style={{ width: SW, height: HERO_H }}
      resizeMode="cover"
    >
      {/* Scrim */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "rgba(10,24,16,0.50)" },
        ]}
      />

      {/* Top left — salam (10pt, no letterSpacing) + app name, top-aligned with badge */}
      <View style={s.heroTopLeft}>
        <Text style={s.heroSalam}>{"As-sal\u0101mu \u02bfalaykum"}</Text>
        <Text style={s.heroAppName}>Safar</Text>
      </View>

      {/* Top right — compact days to go badge, two tight lines */}
      {daysAway !== null ? (
        <View style={s.daysBadge}>
          <Text style={s.daysNum}>{daysAway}</Text>
          <Text style={s.daysLabel}>days to go</Text>
        </View>
      ) : null}

      {/* Bottom content */}
      <View style={s.slideContent}>
        {/* Tag — plain text, no pill shape */}
        <Text style={s.tagText}>{slide.tag}</Text>

        {/* Slide 1 only: big tappable greeting */}
        {slide.showGreeting ? (
          <TouchableOpacity activeOpacity={0.85} onPress={() => setShowAbout(true)}>
            <Text style={s.heroGreeting}>
              {userName ? userName : "Welcome"}
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* Slides 2–5: headline */}
        {slide.headline ? (
          <Text style={s.heroHeadline}>{slide.headline}</Text>
        ) : null}

        {/* Sub */}
        <Text style={s.heroSub}>{slide.sub}</Text>

        {/* CTA — small plain text link (50% of previous pill size) */}
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

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
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

        {/* ── THREE CARDS DIRECTLY UNDER HERO ── */}
        {/* Order: My Board (left) · My Calendar (right) · Umrah Guide (wide, half height) */}
        <View style={s.cardsWrap}>

          {/* Row 1: My Board + My Calendar — equal halves, full height */}
          <View style={s.cardRow}>
            <TouchableOpacity
              style={[s.cardTile, { marginRight: 6 }]}
              activeOpacity={0.88}
              onPress={() => navigation?.navigate?.("MyBoard")}
            >
              <ImageBackground
                source={require("../assets/myboard.jpg")}
                style={{ flex: 1 }}
                imageStyle={{ borderRadius: 14 }}
                resizeMode="cover"
              >
                <View style={s.cardScrim} />
                <View style={s.cardInner}>
                  <Text style={s.cardEyebrow}>YOUR BOARD</Text>
                  <Text style={s.cardTitle}>{"My\nBoard"}</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.cardTile, { marginLeft: 6 }]}
              activeOpacity={0.88}
              onPress={() => navigation?.navigate?.("Journey")}
            >
              <ImageBackground
                source={require("../assets/journey3.png")}
                style={{ flex: 1 }}
                imageStyle={{ borderRadius: 14 }}
                resizeMode="cover"
              >
                <View style={[s.cardScrim, { backgroundColor: "rgba(10,20,30,0.46)" }]} />
                <View style={s.cardInner}>
                  <Text style={s.cardEyebrow}>CALENDAR</Text>
                  <Text style={s.cardTitle}>{"My\nCalendar"}</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          </View>

          {/* Row 2: Umrah Guide — full width, half height of row above */}
          <TouchableOpacity
            style={s.guideWide}
            activeOpacity={0.88}
            onPress={() => navigation?.navigate?.("UmrahGuide")}
          >
            <ImageBackground
              source={require("../assets/kaaba_mixed.png")}
              style={{ flex: 1 }}
              imageStyle={{ borderRadius: 14 }}
              resizeMode="cover"
            >
              <View style={[s.cardScrim, { backgroundColor: "rgba(10,24,16,0.58)" }]} />
              <View style={s.guideInner}>
                <Text style={s.guideEyebrow}>STEP BY STEP</Text>
                <Text style={s.guideTitle}>Umrah Guide</Text>
              </View>
              <Text style={s.guideArrow}>{"View guide \u2192"}</Text>
            </ImageBackground>
          </TouchableOpacity>
        </View>

        {/* ── MY JOURNEY ── */}
        <View style={s.sectionDivider}>
          <View style={s.sectionBar} />
          <Text style={s.sectionLabel}>MY JOURNEY</Text>
          <View style={s.sectionLine} />
        </View>

        <View style={s.gridRow}>
          <TouchableOpacity
            style={[s.gridTile, { marginRight: 6 }]}
            activeOpacity={0.88}
            onPress={() => navigation?.navigate?.("SacredPlaces")}
          >
            <ImageBackground
              source={require("../assets/kaaba_map.png")}
              style={{ flex: 1 }}
              imageStyle={{ borderRadius: 14 }}
              resizeMode="cover"
            >
              <View style={[s.cardScrim, { backgroundColor: "rgba(10,20,30,0.45)" }]} />
              <View style={s.cardInner}>
                <Text style={s.cardEyebrow}>EXPLORE</Text>
                <Text style={s.cardTitle}>{"Sacred\nPlaces"}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.gridTile, { marginLeft: 6 }]}
            activeOpacity={0.88}
            onPress={() => navigation?.navigate?.("WhatToExpect")}
          >
            <ImageBackground
              source={require("../assets/what_to_expect.jpg")}
              style={{ flex: 1 }}
              imageStyle={{ borderRadius: 14 }}
              resizeMode="cover"
            >
              <View style={[s.cardScrim, { backgroundColor: "rgba(20,10,5,0.50)" }]} />
              <View style={s.cardInner}>
                <Text style={s.cardEyebrow}>LOGISTICS</Text>
                <Text style={s.cardTitle}>{"What to\nExpect"}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </View>

        {/* ── MY PEOPLE ── */}
        <View style={s.sectionDivider}>
          <View style={s.sectionBar} />
          <Text style={s.sectionLabel}>MY PEOPLE</Text>
          <View style={s.sectionLine} />
        </View>

        <View style={s.gridRow}>
          <TouchableOpacity
            style={[s.gridTile, s.gridTileShort, { marginRight: 6 }]}
            activeOpacity={0.88}
            onPress={() => navigation?.navigate?.("Groups")}
          >
            <ImageBackground
              source={require("../assets/myboard.jpg")}
              style={{ flex: 1 }}
              imageStyle={{ borderRadius: 14 }}
              resizeMode="cover"
            >
              <View style={[s.cardScrim, { backgroundColor: "rgba(30,61,48,0.52)" }]} />
              <View style={s.cardInner}>
                <Text style={s.cardEyebrow}>COMMUNITY</Text>
                <Text style={s.cardTitle}>{"My\nGroups"}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.gridTile, s.gridTileShort, { marginLeft: 6 }]}
            activeOpacity={0.88}
            onPress={() => navigation?.navigate?.("MyContacts")}
          >
            <ImageBackground
              source={require("../assets/contacts2.png")}
              style={{ flex: 1 }}
              imageStyle={{ borderRadius: 14 }}
              resizeMode="cover"
            >
              <View style={[s.cardScrim, { backgroundColor: "rgba(10,24,16,0.50)" }]} />
              <View style={s.cardInner}>
                <Text style={s.cardEyebrow}>TRAVEL</Text>
                <Text style={s.cardTitle}>{"My\nContacts"}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </View>

        {/* ── QUICK TOOLS — horizontal image pill cards ── */}
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
            { label: "Currency",     image: require("../assets/tab_dua_library.jpg"),   screen: "Currency" },
            { label: "Prayer Times", image: require("../assets/medina.png"),             screen: "PrayerTimes" },
            { label: "Qibla",        image: require("../assets/kaaba_map.png"),          screen: "Qibla" },
            { label: "Notes",        image: require("../assets/tab_shared_duas.jpg"),    screen: "Notes" },
            { label: "Bookmarks",    image: require("../assets/checklist_kaaba.jpg"),    screen: "Bookmarks" },
          ].map((tool) => (
            <TouchableOpacity
              key={tool.label}
              style={s.toolPill}
              activeOpacity={0.82}
              onPress={() => navigation?.navigate?.(tool.screen)}
            >
              <ImageBackground
                source={tool.image}
                style={StyleSheet.absoluteFill}
                imageStyle={{ borderRadius: 50 }}
                resizeMode="cover"
              >
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: "rgba(15,36,25,0.55)", borderRadius: 50 },
                  ]}
                />
              </ImageBackground>
              <Text style={s.toolLabel}>{tool.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── TODAY'S DU'Ā (bottom of screen) ── */}
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

  // ── Days to go — compact two-line badge, no background, top-right ──
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
    lineHeight: 24,
  },
  daysLabel: {
    fontSize: 10,
    color: "rgba(240,230,200,0.80)",
    fontWeight: "500",
    textTransform: "uppercase",
    lineHeight: 13,
  },

  // ── Hero top left — salam + app name ──
  heroTopLeft: {
    position: "absolute",
    top: 16,
    left: 20,
  },
  // 10pt, no letterSpacing, top-aligned with days badge
  heroSalam: {
    fontSize: 10,
    color: "rgba(240,230,200,0.70)",
    fontWeight: "500",
    lineHeight: 14,
  },
  heroAppName: {
    fontFamily: SERIF,
    fontSize: 18,
    color: "#C8A96A",
    fontWeight: "700",
  },

  // ── Slide bottom content ──
  slideContent: {
    position: "absolute",
    bottom: 44,
    left: 22,
    right: 22,
  },

  // Tag — plain text, no pill/border/background
  tagText: {
    fontSize: 10,
    color: "#C8A96A",
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 8,
  },

  // Slide 1 greeting — 45pt, tappable
  heroGreeting: {
    fontFamily: SERIF,
    fontSize: 45,
    color: "#FDFAF4",
    fontWeight: "400",
    lineHeight: 50,
    marginBottom: 6,
  },

  // Slides 2–5 headline — 32pt
  heroHeadline: {
    fontFamily: SERIF,
    fontSize: 32,
    color: "#F0E8C8",
    fontWeight: "600",
    lineHeight: 40,
    marginBottom: 8,
  },

  // Sub — 18pt
  heroSub: {
    fontSize: 18,
    color: "rgba(240,230,200,0.75)",
    lineHeight: 26,
    fontWeight: "400",
    marginBottom: 14,
  },

  // CTA — small plain text, no button shape (50% of pill version)
  heroCtaText: {
    fontSize: 12,
    color: "rgba(200,169,106,0.90)",
    fontWeight: "600",
  },

  // Dot indicators
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
    backgroundColor: "rgba(240,230,200,0.30)",
  },
  dotActive: {
    backgroundColor: "#C8A96A",
    width: 16,
  },

  // ── Three cards directly under hero ──
  cardsWrap: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 8,
  },
  // Row 1: two equal cards
  cardRow: {
    flexDirection: "row",
    height: 160,
  },
  cardTile: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#4A2E10",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.20,
    shadowRadius: 8,
    elevation: 4,
  },
  cardScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,24,16,0.45)",
    borderRadius: 14,
  },
  cardInner: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 14,
  },
  cardEyebrow: {
    fontSize: 9,
    color: "#C8A96A",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  cardTitle: {
    fontFamily: SERIF,
    fontSize: 20,
    color: "#FDFAF4",
    fontWeight: "600",
    lineHeight: 25,
  },

  // Row 2: Umrah Guide wide, half height of row 1
  guideWide: {
    height: 80,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#4A2E10",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.20,
    shadowRadius: 8,
    elevation: 4,
  },
  guideInner: {
    position: "absolute",
    left: 16,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  guideEyebrow: {
    fontSize: 9,
    color: "#C8A96A",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 3,
  },
  guideTitle: {
    fontFamily: SERIF,
    fontSize: 18,
    color: "#FDFAF4",
    fontWeight: "600",
  },
  guideArrow: {
    position: "absolute",
    right: 18,
    top: 0,
    bottom: 0,
    fontSize: 12,
    color: "rgba(200,169,106,0.85)",
    fontWeight: "600",
    lineHeight: 80,
    textAlignVertical: "center",
  },

  // ── Section divider — 1pt thin line ──
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
  // 1pt thin line
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#C8BFB2",
  },

  // ── Journey / People grid ──
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
    shadowOpacity: 0.20,
    shadowRadius: 8,
    elevation: 4,
  },
  gridTileShort: {
    height: 130,
  },

  // ── Quick Tools — horizontal image pill cards ──
  toolsScroll: {
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 4,
  },
  toolPill: {
    width: 88,
    height: 88,
    borderRadius: 44,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4A2E10",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 3,
  },
  toolLabel: {
    fontSize: 11,
    color: "#FDFAF4",
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 6,
    lineHeight: 15,
  },

  // ── Du'ā card ──
  duaCard: {
    backgroundColor: "#FDFAF4",
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 22,
    shadowColor: "#4A2E10",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 5,
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
    backgroundColor: "#C8BFB2",
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
