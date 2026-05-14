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
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SERIF = "SourceSerif4-Regular";
const { width: SW, height: SH } = Dimensions.get("window");

// ── Storage keys ──────────────────────────────────────────────────────────────
const DEPARTURE_KEY  = "safar_departure_date_v1";
const USER_NAME_KEY  = "safar_user_name_v1";
const CHECKLIST_KEY  = "safar_checklist_done_v1";
const ONBOARDED_KEY  = "safar_onboarded_v1";
const CONTACTS_KEY   = "safar_journey_contacts_v1";

// ── Hero slides ───────────────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    id: "welcome",
    image: require("../assets/kaaba_mixed.png"),
    tag: "WELCOME TO SAFAR",
    headline: "Your Hajj &\nUmrah Companion",
    sub: "Plan, prepare and perform with confidence",
    cta: "Learn More",
    ctaScreen: null,
    ctaIsAbout: true,
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
  },
  {
    id: "duas",
    image: require("../assets/tab_my_lists.jpg"),
    tag: "DU\u02bfĀS & WORSHIP",
    headline: "Every Du\u02bfa\u02be,\nEvery Moment",
    sub: "Authenticated, practised and always with you",
    cta: "View Duas",
    ctaScreen: "Duas",
    ctaIsAbout: false,
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
  },
];

// ── Today's du\u02bfa ─────────────────────────────────────────────────────────────
const DAILY_DUA = {
  arabic: "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \\u0627\u062c\u0639\u0644\u0646\u0627 \u062d\u062c\u0651\u064b\u0627 \u0645\u0628\u0631\u0648\u0631\u064b\u0627 \u0648\u0633\u0639\u064a\u064b\u0627 \u0645\u0634\u0643\u0648\u0631\u064b\u0627 \u0648\u0630\u0646\u0628\u064b\u0627 \u0645\u063a\u0641\u0648\u0631\u064b\u0627",
  transliteration: "All\u0101humma-j\u02bfaln\u0101 \u1e25ajjan mabrūran wa sa\u02bfyan mash\u016bran wa dhanban maghf\u016bran",
  translation: "O Allah, make our Hajj one that is accepted, our sa\u02bfy one that is appreciated, and our sins forgiven.",
  source: "Ibn M\u0101jah \u00b7 2893",
};

// ── Quick action cards ────────────────────────────────────────────────────────
const ACTION_CARDS = [
  {
    id: "calendar",
    label: "My Calendar",
    sub: "Departure & key dates",
    icon: "📅",
    screen: "Journey",
    color: "#1E3D30",
  },
  {
    id: "board",
    label: "My Board",
    sub: "Pinned notes & reminders",
    icon: "📌",
    screen: "MyBoard",
    color: "#2A5242",
  },
  {
    id: "guide",
    label: "Umrah Guide",
    sub: "Step-by-step ritual guide",
    icon: "🕋",
    screen: "UmrahGuide",
    color: "#3B6B58",
  },
];

// ── About modal ───────────────────────────────────────────────────────────────
function AboutModal({ visible, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={ab.overlay} activeOpacity={1} onPress={onClose}>
        <View style={ab.card} onStartShouldSetResponder={() => true}>
          <Text style={ab.icon}>{"\uD83D\uDD4B"}</Text>
          <Text style={ab.title}>What is Safar?</Text>
          <Text style={ab.body}>
            Safar is your companion for every step of your sacred Hajj or Umrah journey.{"\n\n"}
            Build a personalised step-by-step plan, pin your hotel, guide and travel group, practise the most important du\u02bf\u0101\u02beS, and carry the guidance of scholars in your pocket.{"\n\n"}
            Share milestones with fellow pilgrims, track your progress through every ibadah, and arrive prepared, calm and confident.{"\n\n"}
            May Allah accept your journey. \u0622\u0645\u064a\u0646
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
    alignItems: "center",
    shadowColor: "#1E3D30",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 12,
  },
  icon: { fontSize: 36, marginBottom: 12 },
  title: {
    fontFamily: SERIF,
    fontSize: 22,
    fontWeight: "600",
    color: "#1E3D30",
    marginBottom: 14,
    textAlign: "center",
  },
  body: {
    fontSize: 15,
    color: "#3A3530",
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 22,
  },
  btn: {
    backgroundColor: "#1E3D30",
    borderRadius: 50,
    paddingHorizontal: 36,
    paddingVertical: 12,
  },
  btnText: {
    color: "#FDFAF4",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.4,
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
  const fadeAnim  = useRef(new Animated.Value(1)).current;

  // Auto-advance hero
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

  // Load user data
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

  const HERO_H = Math.round(SH * 0.60);

  // ── Render hero slide ──────────────────────────────────────────────────────
  const renderSlide = ({ item: slide }) => (
    <ImageBackground
      source={slide.image}
      style={{ width: SW, height: HERO_H }}
      resizeMode="cover"
    >
      {/* Dark scrim */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(10,24,16,0.52)" }]} />

      {/* Days to go badge — top right */}
      {daysAway !== null ? (
        <View style={s.daysBadge}>
          <Text style={s.daysNum}>{daysAway}</Text>
          <Text style={s.daysLabel}>days to go</Text>
        </View>
      ) : null}

      {/* Top left label */}
      <View style={s.heroTopLeft}>
        <Text style={s.heroSalam}>{"As-sal\u0101mu \u02bfalaykum"}</Text>
        <Text style={s.heroAppName}>Safar</Text>
      </View>

      {/* Slide content — bottom */}
      <View style={s.slideContent}>
        {/* Tag */}
        <View style={s.tagPill}>
          <Text style={s.tagText}>{slide.tag}</Text>
        </View>

        {/* Greeting / headline */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setShowAbout(true)}
        >
          <Text style={s.heroGreeting}>
            {userName ? userName : "Welcome"}
          </Text>
        </TouchableOpacity>

        <Text style={s.heroHeadline}>{slide.headline}</Text>
        <Text style={s.heroSub}>{slide.sub}</Text>

        {/* CTA */}
        <TouchableOpacity
          style={s.heroCta}
          activeOpacity={0.85}
          onPress={() => handleHeroCta(slide)}
        >
          <Text style={s.heroCtaText}>{slide.cta} →</Text>
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── HERO CAROUSEL ── */}
        <FlatList
          ref={heroRef}
          data={HERO_SLIDES}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={true}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / SW);
            setHeroSlide(idx);
          }}
          style={{ height: HERO_H }}
          getItemLayout={(_, index) => ({ length: SW, offset: SW * index, index })}
        />

        {/* ── SECTION LABEL ── */}
        <View style={s.sectionDivider}>
          <View style={s.sectionBar} />
          <Text style={s.sectionLabel}>MY JOURNEY</Text>
          <View style={[s.sectionBar, { flex: 1 }]} />
        </View>

        {/* ── ACTION CARDS (replaces countdown card) ── */}
        <View style={s.actionRow}>
          {ACTION_CARDS.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={[s.actionCard, { borderTopColor: card.color }]}
              activeOpacity={0.85}
              onPress={() => navigation?.navigate?.(card.screen)}
            >
              <Text style={s.actionIcon}>{card.icon}</Text>
              <Text style={s.actionLabel}>{card.label}</Text>
              <Text style={s.actionSub}>{card.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── JOURNEY GRID ── */}
        <View style={s.gridRow}>
          {/* Umrah Guide */}
          <TouchableOpacity
            style={[s.gridTile, { marginRight: 6 }]}
            activeOpacity={0.88}
            onPress={() => navigation?.navigate?.("UmrahGuide")}
          >
            <ImageBackground
              source={require("../assets/kaaba_mixed.png")}
              style={s.gridImage}
              imageStyle={{ borderRadius: 14 }}
              resizeMode="cover"
            >
              <View style={s.gridScrim} />
              <Text style={s.gridEyebrow}>STEP BY STEP</Text>
              <Text style={s.gridTitle}>Umrah{"\n"}Guide</Text>
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
              style={s.gridImage}
              imageStyle={{ borderRadius: 14 }}
              resizeMode="cover"
            >
              <View style={[s.gridScrim, { backgroundColor: "rgba(10,20,30,0.45)" }]} />
              <Text style={s.gridEyebrow}>EXPLORE</Text>
              <Text style={s.gridTitle}>Sacred{"\n"}Places</Text>
            </ImageBackground>
          </TouchableOpacity>
        </View>

        {/* ── MY PEOPLE ── */}
        <View style={s.sectionDivider}>
          <View style={s.sectionBar} />
          <Text style={s.sectionLabel}>MY PEOPLE</Text>
          <View style={[s.sectionBar, { flex: 1 }]} />
        </View>

        <View style={s.gridRow}>
          <TouchableOpacity
            style={[s.gridTile, s.gridTileShort, { marginRight: 6 }]}
            activeOpacity={0.88}
            onPress={() => navigation?.navigate?.("Groups")}
          >
            <ImageBackground
              source={require("../assets/myboard.jpg")}
              style={s.gridImage}
              imageStyle={{ borderRadius: 14 }}
              resizeMode="cover"
            >
              <View style={[s.gridScrim, { backgroundColor: "rgba(30,61,48,0.50)" }]} />
              <Text style={s.gridEyebrow}>COMMUNITY</Text>
              <Text style={s.gridTitle}>My{"\n"}Groups</Text>
            </ImageBackground>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.gridTile, s.gridTileShort, { marginLeft: 6 }]}
            activeOpacity={0.88}
            onPress={() => navigation?.navigate?.("MyContacts")}
          >
            <ImageBackground
              source={require("../assets/contacts2.png")}
              style={s.gridImage}
              imageStyle={{ borderRadius: 14 }}
              resizeMode="cover"
            >
              <View style={[s.gridScrim, { backgroundColor: "rgba(10,24,16,0.50)" }]} />
              <Text style={s.gridEyebrow}>TRAVEL</Text>
              <Text style={s.gridTitle}>My{"\n"}Contacts</Text>
            </ImageBackground>
          </TouchableOpacity>
        </View>

        {/* ── QUICK TOOLS ── */}
        <View style={s.sectionDivider}>
          <View style={s.sectionBar} />
          <Text style={s.sectionLabel}>QUICK TOOLS</Text>
          <View style={[s.sectionBar, { flex: 1 }]} />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.toolsScroll}
        >
          {[
            { label: "Currency",     icon: "💱", screen: "Currency" },
            { label: "Prayer Times", icon: "🕐", screen: "PrayerTimes" },
            { label: "Qibla",        icon: "🧭", screen: "Qibla" },
            { label: "Notes",        icon: "📝", screen: "Notes" },
            { label: "Bookmarks",    icon: "🔖", screen: "Bookmarks" },
          ].map((tool) => (
            <TouchableOpacity
              key={tool.label}
              style={s.toolPill}
              activeOpacity={0.82}
              onPress={() => navigation?.navigate?.(tool.screen)}
            >
              <Text style={s.toolIcon}>{tool.icon}</Text>
              <Text style={s.toolLabel}>{tool.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── TODAY'S DU\u02bfĀ (bottom) ── */}
        <View style={s.sectionDivider}>
          <View style={s.sectionBar} />
          <Text style={s.sectionLabel}>{"TODAY\u2019S DU\u02bfĀ"}</Text>
          <View style={[s.sectionBar, { flex: 1 }]} />
        </View>

        <View style={s.duaCard}>
          <Text style={s.duaArabic}>{DAILY_DUA.arabic}</Text>
          <View style={s.duaDivider} />
          <Text style={s.duaTranslit}>{DAILY_DUA.transliteration}</Text>
          <Text style={s.duaTranslation}>{DAILY_DUA.translation}</Text>
          <View style={s.duaFooter}>
            <Text style={s.duaSource}>{DAILY_DUA.source}</Text>
            <View style={s.duaActions}>
              <TouchableOpacity style={s.duaBtn}>
                <Text style={s.duaBtnText}>Practice</Text>
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

  // ── Days to go badge ──
  daysBadge: {
    position: "absolute",
    top: 16,
    right: 20,
    backgroundColor: "rgba(15,36,25,0.72)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(200,169,106,0.45)",
    alignItems: "center",
  },
  daysNum: {
    fontFamily: SERIF,
    fontSize: 22,
    fontWeight: "700",
    color: "#C8A96A",
    lineHeight: 26,
  },
  daysLabel: {
    fontSize: 10,
    color: "rgba(240,230,200,0.80)",
    letterSpacing: 0.5,
    fontWeight: "500",
    textTransform: "uppercase",
  },

  // ── Hero top left ──
  heroTopLeft: {
    position: "absolute",
    top: 16,
    left: 20,
  },
  heroSalam: {
    fontSize: 11,
    color: "rgba(240,230,200,0.70)",
    letterSpacing: 0.8,
    fontWeight: "500",
    marginBottom: 2,
  },
  heroAppName: {
    fontFamily: SERIF,
    fontSize: 18,
    color: "#C8A96A",
    fontWeight: "700",
    letterSpacing: 1,
  },

  // ── Slide content ──
  slideContent: {
    position: "absolute",
    bottom: 48,
    left: 22,
    right: 22,
  },
  tagPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(200,169,106,0.22)",
    borderWidth: 1,
    borderColor: "rgba(200,169,106,0.55)",
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 10,
  },
  tagText: {
    fontSize: 10,
    color: "#C8A96A",
    letterSpacing: 2,
    fontWeight: "600",
    textTransform: "uppercase",
  },

  // Greeting — tappable, 50% bigger than old 30pt = 45pt
  heroGreeting: {
    fontFamily: SERIF,
    fontSize: 45,
    color: "#FDFAF4",
    fontWeight: "400",
    lineHeight: 50,
    marginBottom: 6,
  },

  // Headline — was ~18pt, now ~32pt (75% bigger)
  heroHeadline: {
    fontFamily: SERIF,
    fontSize: 32,
    color: "#F0E8C8",
    fontWeight: "600",
    lineHeight: 40,
    marginBottom: 8,
  },

  // Sub — was ~12pt, now ~21pt (75% bigger)
  heroSub: {
    fontSize: 18,
    color: "rgba(240,230,200,0.75)",
    lineHeight: 26,
    fontWeight: "400",
    marginBottom: 18,
  },

  // CTA button
  heroCta: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(200,169,106,0.18)",
    borderWidth: 1,
    borderColor: "rgba(200,169,106,0.60)",
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  heroCtaText: {
    fontSize: 14,
    color: "#C8A96A",
    fontWeight: "600",
    letterSpacing: 0.4,
  },

  // Dot indicators
  heroDots: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(240,230,200,0.35)",
  },
  dotActive: {
    backgroundColor: "#C8A96A",
    width: 18,
  },

  // ── Section divider ──
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
    height: 18,
    borderRadius: 2,
    backgroundColor: "#1E3D30",
  },
  sectionLabel: {
    fontFamily: SERIF,
    fontSize: 16,
    fontWeight: "700",
    color: "#1E3D30",
    letterSpacing: 0.5,
  },

  // ── Action cards (3 cards replacing countdown) ──
  actionRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#FDFAF4",
    borderRadius: 14,
    padding: 14,
    borderTopWidth: 3,
    borderTopColor: "#1E3D30",
    shadowColor: "#4A2E10",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIcon: { fontSize: 22, marginBottom: 8 },
  actionLabel: {
    fontFamily: SERIF,
    fontSize: 13,
    fontWeight: "600",
    color: "#100E0A",
    marginBottom: 3,
    lineHeight: 17,
  },
  actionSub: {
    fontSize: 11,
    color: "#5C534A",
    lineHeight: 15,
    fontWeight: "400",
  },

  // ── Journey grid tiles ──
  gridRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 4,
  },
  gridTile: {
    flex: 1,
    height: 180,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#4A2E10",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 5,
  },
  gridTileShort: {
    height: 150,
  },
  gridImage: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 14,
  },
  gridScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,24,16,0.45)",
    borderRadius: 14,
  },
  gridEyebrow: {
    fontSize: 9,
    color: "#C8A96A",
    letterSpacing: 2,
    fontWeight: "700",
    marginBottom: 4,
  },
  gridTitle: {
    fontFamily: SERIF,
    fontSize: 22,
    color: "#FDFAF4",
    fontWeight: "600",
    lineHeight: 28,
  },

  // ── Tools strip ──
  toolsScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  toolPill: {
    backgroundColor: "#FDFAF4",
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#C8BFB2",
    shadowColor: "#4A2E10",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
  },
  toolIcon: { fontSize: 20 },
  toolLabel: {
    fontSize: 11,
    color: "#3A3530",
    fontWeight: "500",
    letterSpacing: 0.2,
  },

  // ── Du\u02bfa card ──
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
    marginBottom: 8,
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
    letterSpacing: 0.3,
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
    letterSpacing: 0.3,
  },
});
