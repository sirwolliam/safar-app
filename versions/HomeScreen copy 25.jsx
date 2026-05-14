import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import DuaCard from "../components/DuaCard";
import { colors, spacing, radius, typography, shadows } from "../theme";

const { width: SCREEN_W } = Dimensions.get("window");

// ── Sample data ───────────────────────────────────────────────────────────────
const TAWAF_DUAS = [
  {
    id: "tawaf-1",
    title: "Intention & Beginning",
    stage: "Tawaf · Round 1",
    arabic:
      "اللَّهُمَّ إِيمَانًا بِكَ وَتَصْدِيقًا بِكِتَابِكَ وَوَفَاءً بِعَهْدِكَ وَاتِّبَاعًا لِسُنَّةِ نَبِيِّكَ",
    transliteration:
      "Allāhumma īmānan bika wa taṣdīqan bikitābika wa wafāʾan biʿahdika wa ittibāʿan li sunnati nabiyyika",
    translation:
      "O Allah, with faith in You, confirmation of Your Book, fulfillment of Your promise, and adherence to the way of Your Prophet.",
    source: "Sunan Abī Dāwūd · 2/177",
    isFeatured: true,
  },
  {
    id: "tawaf-blackstone",
    title: "Facing the Black Stone",
    stage: "Tawaf · Each round",
    arabic: "بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ",
    transliteration: "Bismi-llāhi wa-llāhu akbar",
    translation: "In the name of Allah, and Allah is the Greatest.",
    source: "Ṣaḥīḥ al-Bukhārī · 1613",
    isFeatured: false,
  },
];

const SAI_DUAS = [
  {
    id: "sai-safa",
    title: "Upon Ascending Ṣafā",
    stage: "Saʿy · Ṣafā",
    arabic:
      "إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ، أَبْدَأُ بِمَا بَدَأَ اللَّهُ بِهِ",
    transliteration:
      "Inna-ṣ-ṣafā wa-l-marwata min shaʿāʾiri-llāh. Abdaʾu bimā badaʾa-llāhu bih",
    translation:
      "Indeed Ṣafā and Marwah are among the signs of Allah. I begin with what Allah began with.",
    source: "Ṣaḥīḥ Muslim · 1218",
    isFeatured: true,
  },
];

const QUICK_ACCESS = [
  { id: "hajj",    label: "Hajj & Umrah", icon: "🕋" },
  { id: "map",     label: "Sacred Map",   icon: "📍" },
  { id: "library", label: "Dua Library",  icon: "📖" },
  { id: "lists",   label: "My Lists",     icon: "♡"  },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function HomeScreen({ navigation }) {
  const [showTranslit, setShowTranslit]       = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [bookmarked, setBookmarked]           = useState(new Set());
  const [activeMode, setActiveMode]           = useState("Umrah"); // "Umrah" | "Hajj"

  const toggleBookmark = (id) => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>As-salāmu ʿalaykum</Text>
            <Text style={styles.name}>Wol</Text>
            <Text style={styles.location}>Makkah al-Mukarramah</Text>
          </View>
          <View style={styles.logoBlock}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🕋</Text>
            </View>
            <Text style={styles.logoLabel}>LABBAYK</Text>
          </View>
        </View>

        {/* ── Hero journey card ── */}
        <TouchableOpacity
          style={styles.heroCard}
          activeOpacity={0.93}
          onPress={() => navigation?.navigate?.("Journey")}
        >
          {/* Kaaba image area */}
          <View style={styles.heroImageArea}>
            <View style={styles.kaabaScene}>
              <View style={styles.kaabaBody}>
                <View style={styles.kaabaKiswa} />
                <View style={styles.kaabaDoor} />
              </View>
            </View>
            <View style={styles.heroGradient} />
          </View>

          {/* Content overlay */}
          <View style={styles.heroContent}>
            <Text style={styles.heroEyebrow}>Continue your journey</Text>
            <Text style={styles.heroTitle}>Tawaf</Text>
            <View style={styles.heroProgRow}>
              <View style={styles.heroProgTrack}>
                <View style={[styles.heroProgFill, { width: "29%" }]} />
              </View>
              <Text style={styles.heroProgLabel}>Round 2 of 7</Text>
            </View>
          </View>
          <View style={styles.heroArrow}>
            <Text style={styles.heroArrowIcon}>›</Text>
          </View>
        </TouchableOpacity>

        {/* ── Mode toggle ── */}
        <View style={styles.modeToggle}>
          {["Umrah", "Hajj"].map((mode) => {
            const active = mode === activeMode;
            return (
              <TouchableOpacity
                key={mode}
                style={[styles.modeOpt, active && styles.modeOptActive]}
                onPress={() => setActiveMode(mode)}
                activeOpacity={0.8}
              >
                <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>
                  {mode}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Quick access ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>Quick access</Text>
          <TouchableOpacity>
            <Text style={styles.sectionHeaderLink}>View all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.quickGrid}>
          {QUICK_ACCESS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.quickItem}
              activeOpacity={0.8}
            >
              <View style={styles.quickIconWrap}>
                <Text style={styles.quickIcon}>{item.icon}</Text>
              </View>
              <Text style={styles.quickLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Tawaf section ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tawaf</Text>
          {TAWAF_DUAS.map((dua) => (
            <DuaCard
              key={dua.id}
              dua={dua}
              showTranslit={showTranslit}
              showTranslation={showTranslation}
              isBookmarked={bookmarked.has(dua.id)}
              onBookmark={toggleBookmark}
            />
          ))}
        </View>

        {/* ── Saʿy section ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saʿy</Text>
          {SAI_DUAS.map((dua) => (
            <DuaCard
              key={dua.id}
              dua={dua}
              showTranslit={showTranslit}
              showTranslation={showTranslation}
              isBookmarked={bookmarked.has(dua.id)}
              onBookmark={toggleBookmark}
            />
          ))}
        </View>

        {/* ── Quranic quote card ── */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>
            "Call upon Me; I will respond to you."
          </Text>
          <Text style={styles.quoteRef}>— Surah Ghafir (40:60)</Text>
          <View style={styles.quoteDots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* ── Display preferences ── */}
        <View style={styles.prefsRow}>
          <PrefsToggle
            label="Transliteration"
            value={showTranslit}
            onToggle={() => setShowTranslit((v) => !v)}
          />
          <PrefsToggle
            label="Translation"
            value={showTranslation}
            onToggle={() => setShowTranslation((v) => !v)}
          />
        </View>

        {/* Bottom padding */}
        <View style={{ height: spacing(4) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Small toggle component used in prefs row ──────────────────────────────────
function PrefsToggle({ label, value, onToggle }) {
  return (
    <TouchableOpacity style={togStyles.row} onPress={onToggle} activeOpacity={0.8}>
      <Text style={togStyles.label}>{label}</Text>
      <View style={[togStyles.track, value && togStyles.trackOn]}>
        <View style={[togStyles.knob, value && togStyles.knobOn]} />
      </View>
    </TouchableOpacity>
  );
}

const togStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(1),
  },
  label: {
    fontSize: 14,
    color: colors.subtext,
    fontWeight: "300",
  },
  track: {
    width: 38,
    height: 20,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  trackOn: {
    backgroundColor: colors.primary,
  },
  knob: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.card,
    ...shadows.card,
  },
  knobOn: {
    alignSelf: "flex-end",
  },
});

// ── Main styles ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing(2.5),
    paddingTop: spacing(2.5),
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing(2),
  },
  headerLeft: {},
  greeting: {
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: colors.subtext,
    marginBottom: spacing(0.5),
    fontWeight: "400",
  },
  name: {
    fontSize: 22,
    fontWeight: "400",
    color: colors.text,
    lineHeight: 26,
  },
  location: {
    fontSize: 14,
    color: colors.subtext,
    fontWeight: "300",
    marginTop: 2,
  },
  logoBlock: {
    alignItems: "center",
    gap: spacing(0.75),
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
  },
  logoEmoji: { fontSize: 20 },
  logoLabel: {
    fontSize: 8,
    letterSpacing: 2,
    color: colors.primary,
    fontWeight: "600",
  },

  // Hero card
  heroCard: {
    borderRadius: radius.lg,
    overflow: "hidden",
    height: 200,
    marginBottom: spacing(2),
    backgroundColor: "#1A1408",
    ...shadows.card,
  },
  heroImageArea: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#1A1408",
  },
  kaabaScene: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1C1A10",
  },
  kaabaBody: {
    width: 80,
    height: 96,
    backgroundColor: "#100E08",
    borderWidth: 1,
    borderColor: "rgba(200,169,106,0.5)",
    position: "relative",
  },
  kaabaKiswa: {
    position: "absolute",
    top: 24,
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: "rgba(200,169,106,0.55)",
  },
  kaabaDoor: {
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
    width: 16,
    height: 26,
    backgroundColor: "rgba(200,169,106,0.5)",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    // RN doesn't support CSS gradients inline — use expo-linear-gradient if needed
    // This provides a dark bottom fade as a semi-transparent overlay:
    bottom: 0,
  },
  heroContent: {
    position: "absolute",
    bottom: spacing(2),
    left: spacing(2),
    right: spacing(5),
  },
  heroEyebrow: {
    fontSize: 12,
    color: "rgba(240,230,200,0.65)",
    fontWeight: "300",
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "400",
    color: "#F0E8C8",
    marginBottom: spacing(1),
  },
  heroProgRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(1),
  },
  heroProgTrack: {
    flex: 1,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 1,
    overflow: "hidden",
  },
  heroProgFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: 1,
  },
  heroProgLabel: {
    fontSize: 12,
    color: "rgba(240,230,200,0.5)",
  },
  heroArrow: {
    position: "absolute",
    bottom: spacing(2),
    right: spacing(2),
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(240,230,200,0.3)",
    backgroundColor: "rgba(240,230,200,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroArrowIcon: {
    fontSize: 16,
    color: "rgba(240,230,200,0.8)",
    lineHeight: 20,
  },

  // Mode toggle
  modeToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(200,190,170,0.25)",
    borderRadius: radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing(2.5),
  },
  modeOpt: {
    flex: 1,
    paddingVertical: spacing(1),
    borderRadius: radius.sm,
    alignItems: "center",
  },
  modeOptActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  modeLabel: {
    fontSize: 16,
    color: colors.subtext,
    fontWeight: "300",
  },
  modeLabelActive: {
    color: colors.card,
    fontWeight: "500",
  },

  // Quick access
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing(1.25),
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
  },
  sectionHeaderLink: {
    fontSize: 14,
    color: colors.subtext,
    fontWeight: "300",
  },
  quickGrid: {
    flexDirection: "row",
    gap: spacing(1),
    marginBottom: spacing(3),
  },
  quickItem: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing(1.5),
    alignItems: "center",
    gap: spacing(0.75),
    ...shadows.card,
  },
  quickIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  quickIcon: { fontSize: 18 },
  quickLabel: {
    fontSize: 10,
    color: colors.subtext,
    textAlign: "center",
    lineHeight: 14,
    fontWeight: "300",
  },

  // Sections
  section: {
    marginBottom: spacing(3),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: colors.text,
    marginBottom: spacing(1.5),
  },

  // Quote card
  quoteCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(2.5),
    marginBottom: spacing(2),
    alignItems: "center",
    ...shadows.card,
  },
  quoteText: {
    fontSize: 16,
    color: colors.text,
    fontStyle: "italic",
    fontWeight: "300",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: spacing(0.75),
  },
  quoteRef: {
    fontSize: 14,
    color: colors.subtext,
    fontWeight: "300",
  },
  quoteDots: {
    flexDirection: "row",
    gap: 5,
    marginTop: spacing(1.5),
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },

  // Prefs row
  prefsRow: {
    flexDirection: "row",
    gap: spacing(3),
    justifyContent: "center",
    marginBottom: spacing(2),
  },
});
