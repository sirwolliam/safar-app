import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Linking,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { colors, spacing, radius, typography, shadows } from "../theme";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Content ──────────────────────────────────────────────────────────────────

const FAQ_SECTIONS = [
  {
    id: "app",
    label: "Using the App",
    emoji: "📱",
    questions: [
      {
        id: "app-1",
        q: "How do I track my Tawaf rounds?",
        a: "Open the Journey tab and select Tawaf. The app will guide you round by round, showing the relevant duʿāʾ for each. Tap the round indicator to advance manually, or use the auto-track toggle if you have location enabled.",
      },
      {
        id: "app-2",
        q: "Can I use Safar without an internet connection?",
        a: "Yes. All duʿāʾs, guides, and maps are stored on your device after the first download. You can use Safar fully offline inside the Haram — no connection needed.",
      },
      {
        id: "app-3",
        q: "How do I create and share a personal list?",
        a: "Go to Lists → tap the + button → name your list and add duas from the Library. To share, open the list and tap the share icon in the top right. Your group members will receive a link to add it to their own app.",
      },
      {
        id: "app-4",
        q: "How do I turn transliteration or translation on or off?",
        a: "There are quick toggles at the bottom of the Home screen. You can also set your default preference in Settings → Display so it applies to every card automatically.",
      },
      {
        id: "app-5",
        q: "Is my data backed up if I change phones?",
        a: "Yes — as long as you're signed in with the same account, your lists, bookmarks, and journey progress sync automatically to the cloud and restore on any new device.",
      },
    ],
  },
  {
    id: "hajj",
    label: "Hajj & Umrah",
    emoji: "🕋",
    questions: [
      {
        id: "haj-1",
        q: "What is the correct order of Umrah rituals?",
        a: "The four steps of Umrah are: (1) Iḥrām — entering the sacred state with the intention and talbiyah; (2) Ṭawāf — seven circuits around the Kaʿbah; (3) Saʿy — seven trips between Ṣafā and Marwah; (4) Taḥallul — shaving or cutting the hair to exit iḥrām. Safar's Journey tab walks you through each step in order.",
      },
      {
        id: "haj-2",
        q: "What are the pillars of Hajj I must not miss?",
        a: "The essential pillars (arkān) of Hajj are: Iḥrām with intention, standing at ʿArafah (wuqūf), Ṭawāf al-Ifāḍah, and Saʿy. Missing any of these invalidates the Hajj. Safar's Hajj mode includes reminders and timing alerts for each pillar.",
      },
      {
        id: "haj-3",
        q: "What should I do if I miss a Wājib act?",
        a: "A wājib (obligatory but not a pillar) act that is missed or performed incorrectly generally requires a dam — the sacrifice of a sheep in Makkah. It is strongly advised to consult a qualified scholar for your specific situation. Safar can help you identify which acts are wājib in the Journey guides.",
      },
      {
        id: "haj-4",
        q: "Can women perform Tawaf and Saʿy at any time?",
        a: "There is no restriction on women performing Ṭawāf or Saʿy at any time. However, if a woman is in a state of ḥayḍ (menstruation) she may not perform Ṭawāf until she is pure. Saʿy may be performed in that state according to the majority opinion. Please consult a scholar for personal guidance.",
      },
    ],
  },
  {
    id: "duas",
    label: "Duʿāʾ Sources & References",
    emoji: "📖",
    questions: [
      {
        id: "dua-1",
        q: "Where do the duas in Safar come from?",
        a: "Every duʿāʾ in Safar is sourced from authenticated ḥadīth collections — primarily Ṣaḥīḥ al-Bukhārī, Ṣaḥīḥ Muslim, Sunan Abī Dāwūd, and Ibn Mājah — or from established scholarly works on Hajj and Umrah. Each card displays its reference so you can verify independently.",
      },
      {
        id: "dua-2",
        q: "Are the duas specific to Hajj and Umrah only?",
        a: "No. The Duʿāʾ Library contains duas for all occasions — morning and evening adhkār, duas for family, provision, forgiveness, protection, and more. The Hajj & Umrah section is a curated subset of the full library.",
      },
      {
        id: "dua-3",
        q: "Are the Arabic texts verified for accuracy?",
        a: "Yes. All Arabic texts are reviewed by a qualified Arabic scholar before publishing. If you notice a discrepancy, please report it via the flag icon on any dua card or email us at support@safar.app.",
      },
      {
        id: "dua-4",
        q: "Can I suggest a duʿāʾ to be added?",
        a: "Absolutely. Tap the + icon inside the Library and select 'Suggest a Duʿāʾ'. Include the Arabic text, source reference, and transliteration if possible. Our team reviews all suggestions and will notify you if it's added.",
      },
    ],
  },
];

const TUTORIALS = [
  {
    id: "tut-1",
    title: "Getting started with Safar",
    type: "video",
    duration: "2 min",
    emoji: "▶️",
  },
  {
    id: "tut-2",
    title: "Setting up your Umrah journey",
    type: "guide",
    duration: "4 steps",
    emoji: "🗺",
  },
  {
    id: "tut-3",
    title: "Building your personal dua list",
    type: "interactive",
    duration: "3 min",
    emoji: "✦",
  },
  {
    id: "tut-4",
    title: "Sharing with your group",
    type: "guide",
    duration: "3 steps",
    emoji: "🤝",
  },
  {
    id: "tut-5",
    title: "Using the Map of Sacred Places",
    type: "video",
    duration: "2 min",
    emoji: "▶️",
  },
  {
    id: "tut-6",
    title: "Offline mode explained",
    type: "guide",
    duration: "2 steps",
    emoji: "📶",
  },
];

const TYPE_LABELS = {
  video: "Video",
  guide: "Step-by-step",
  interactive: "Interactive",
};

// ─── FAQ Accordion Item ───────────────────────────────────────────────────────
function FaqItem({ item, isOpen, onToggle }) {
  return (
    <TouchableOpacity
      style={[faq.item, isOpen && faq.itemOpen]}
      onPress={onToggle}
      activeOpacity={0.85}
    >
      <View style={faq.row}>
        <Text style={[faq.q, isOpen && faq.qOpen]}>{item.q}</Text>
        <Text style={[faq.chevron, isOpen && faq.chevronOpen]}>
          {isOpen ? "▲" : "▼"}
        </Text>
      </View>
      {isOpen && (
        <Text style={faq.a}>{item.a}</Text>
      )}
    </TouchableOpacity>
  );
}

const faq = StyleSheet.create({
  item: {
    paddingVertical: spacing(1.75),
    paddingHorizontal: spacing(2),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemOpen: {
    backgroundColor: "rgba(47,93,80,0.04)",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing(1.5),
  },
  q: {
    flex: 1,
    fontSize: typography.body,
    fontWeight: "400",
    color: colors.text,
    lineHeight: typography.body * 1.5,
  },
  qOpen: {
    color: colors.primary,
    fontWeight: "500",
  },
  chevron: {
    fontSize: 8,
    color: colors.border,
    marginTop: 6,
    fontWeight: "600",
  },
  chevronOpen: {
    color: colors.primary,
  },
  a: {
    fontSize: typography.small,
    color: colors.subtext,
    fontWeight: "300",
    lineHeight: typography.small * 1.75,
    marginTop: spacing(1.25),
  },
});

// ─── Tutorial Card ────────────────────────────────────────────────────────────
function TutorialCard({ item }) {
  return (
    <TouchableOpacity style={tut.card} activeOpacity={0.85}>
      <View style={tut.iconWrap}>
        <Text style={tut.icon}>{item.emoji}</Text>
      </View>
      <View style={tut.info}>
        <Text style={tut.title}>{item.title}</Text>
        <View style={tut.meta}>
          <View style={tut.typePill}>
            <Text style={tut.typeText}>{TYPE_LABELS[item.type]}</Text>
          </View>
          <Text style={tut.duration}>{item.duration}</Text>
        </View>
      </View>
      <Text style={tut.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const tut = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(1.5),
    paddingVertical: spacing(1.5),
    paddingHorizontal: spacing(2),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  icon: { fontSize: 20 },
  info: { flex: 1 },
  title: {
    fontSize: typography.body,
    fontWeight: "400",
    color: colors.text,
    marginBottom: 5,
    lineHeight: typography.body * 1.4,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(1),
  },
  typePill: {
    backgroundColor: "rgba(47,93,80,0.10)",
    borderRadius: radius.xs,
    paddingHorizontal: spacing(0.75),
    paddingVertical: 2,
  },
  typeText: {
    fontSize: typography.tiny,
    color: colors.primary,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  duration: {
    fontSize: typography.tiny,
    color: colors.subtext,
    fontWeight: "300",
  },
  arrow: {
    fontSize: 18,
    color: colors.border,
  },
});

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, children, action, onAction }) {
  return (
    <View style={sec.wrap}>
      <View style={sec.header}>
        <Text style={sec.title}>{title}</Text>
        {action && (
          <TouchableOpacity onPress={onAction}>
            <Text style={sec.action}>{action}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={sec.card}>
        {children}
      </View>
    </View>
  );
}

const sec = StyleSheet.create({
  wrap: {
    marginBottom: spacing(3),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing(1.25),
    paddingHorizontal: spacing(0.5),
  },
  title: {
    fontSize: typography.body,
    fontWeight: "500",
    color: colors.text,
  },
  action: {
    fontSize: typography.small,
    color: colors.subtext,
    fontWeight: "300",
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...shadows.card,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SupportScreen({ navigation }) {
  const [searchQuery, setSearchQuery]   = useState("");
  const [openFaqId,   setOpenFaqId]     = useState(null);
  const [activeSection, setActiveSection] = useState("app");

  const toggleFaq = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  const currentSection = FAQ_SECTIONS.find((s) => s.id === activeSection);

  const filteredQuestions = searchQuery.trim().length > 1
    ? FAQ_SECTIONS.flatMap((s) => s.questions).filter(
        (q) =>
          q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentSection?.questions ?? [];

  const isSearching = searchQuery.trim().length > 1;

  return (
    <SafeAreaView style={styles.safe}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation?.goBack?.()}
        >
          <Text style={styles.iconBtnTxt}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Hero ── */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🤲</Text>
          <Text style={styles.heroTitle}>How can we help?</Text>
          <Text style={styles.heroSub}>
            Search below or browse by topic. We're here to make your journey as smooth as possible.
          </Text>
        </View>

        {/* ── Search ── */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search questions…"
            placeholderTextColor={colors.subtext}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Text style={styles.searchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Tutorials ── */}
        {!isSearching && (
          <Section title="Tutorials & guides" action="View all">
            {TUTORIALS.map((t, i) => (
              <TutorialCard
                key={t.id}
                item={t}
                isLast={i === TUTORIALS.length - 1}
              />
            ))}
          </Section>
        )}

        {/* ── FAQ ── */}
        <View style={styles.faqWrap}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              {isSearching ? `Results for "${searchQuery}"` : "Frequently asked"}
            </Text>
            {isSearching && (
              <Text style={styles.resultCount}>
                {filteredQuestions.length} found
              </Text>
            )}
          </View>

          {/* Category chips — hidden during search */}
          {!isSearching && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {FAQ_SECTIONS.map((s) => {
                const on = s.id === activeSection;
                return (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.chip, on && styles.chipOn]}
                    onPress={() => {
                      setActiveSection(s.id);
                      setOpenFaqId(null);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.chipEmoji}>{s.emoji}</Text>
                    <Text style={[styles.chipLabel, on && styles.chipLabelOn]}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* FAQ accordion */}
          <View style={styles.faqCard}>
            {filteredQuestions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={styles.emptyTitle}>No results found</Text>
                <Text style={styles.emptySub}>
                  Try different keywords or contact us directly below.
                </Text>
              </View>
            ) : (
              filteredQuestions.map((item, i) => (
                <FaqItem
                  key={item.id}
                  item={item}
                  isOpen={openFaqId === item.id}
                  onToggle={() => toggleFaq(item.id)}
                  isLast={i === filteredQuestions.length - 1}
                />
              ))
            )}
          </View>
        </View>

        {/* ── Contact ── */}
        <Section title="Contact us">

          {/* Email */}
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => Linking.openURL("mailto:support@safar.app")}
            activeOpacity={0.85}
          >
            <View style={styles.contactIconWrap}>
              <Text style={styles.contactIcon}>✉️</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email support</Text>
              <Text style={styles.contactValue}>support@safar.app</Text>
            </View>
            <Text style={styles.contactArrow}>›</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.contactDivider} />

          {/* Live chat */}
          <TouchableOpacity
            style={styles.contactRow}
            activeOpacity={0.85}
          >
            <View style={styles.contactIconWrap}>
              <Text style={styles.contactIcon}>💬</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Live chat</Text>
              <View style={styles.chatBadgeRow}>
                <Text style={styles.contactValue}>Start a conversation</Text>
                <View style={styles.onlineBadge}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.onlineText}>Online</Text>
                </View>
              </View>
            </View>
            <Text style={styles.contactArrow}>›</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.contactDivider} />

          {/* Website */}
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => Linking.openURL("https://safar.app")}
            activeOpacity={0.85}
          >
            <View style={styles.contactIconWrap}>
              <Text style={styles.contactIcon}>🌐</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Website</Text>
              <Text style={styles.contactValue}>safar.app</Text>
            </View>
            <Text style={styles.contactArrow}>›</Text>
          </TouchableOpacity>
        </Section>

        {/* ── Footer note ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Our team typically responds within 24 hours.{"\n"}
            During Hajj season, response times may be longer.
          </Text>
          <Text style={styles.footerVersion}>Safar · Version 1.0.0</Text>
        </View>

        <View style={{ height: spacing(4) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.5),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  iconBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
  },
  iconBtnTxt: {
    fontSize: 20,
    color: colors.text,
    lineHeight: 24,
  },
  title: {
    fontSize: typography.heading,
    fontWeight: "500",
    color: colors.text,
  },

  scroll: {
    paddingHorizontal: spacing(2.5),
    paddingTop: spacing(2.5),
  },

  // Hero
  hero: {
    alignItems: "center",
    paddingVertical: spacing(2.5),
    marginBottom: spacing(2),
  },
  heroEmoji: {
    fontSize: 36,
    marginBottom: spacing(1),
  },
  heroTitle: {
    fontSize: typography.title,
    fontWeight: "400",
    color: colors.text,
    marginBottom: spacing(0.75),
  },
  heroSub: {
    fontSize: typography.small,
    color: colors.subtext,
    fontWeight: "300",
    textAlign: "center",
    lineHeight: typography.small * 1.7,
    maxWidth: 280,
  },

  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.25),
    gap: spacing(1),
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing(3),
    ...shadows.card,
  },
  searchIcon:  { fontSize: 14, color: colors.subtext },
  searchInput: {
    flex: 1,
    fontSize: typography.body,
    color: colors.text,
    fontWeight: "300",
    padding: 0,
  },
  searchClear: {
    fontSize: 11,
    color: colors.subtext,
    padding: 2,
  },

  // FAQ section
  faqWrap: {
    marginBottom: spacing(3),
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing(1.25),
    paddingHorizontal: spacing(0.5),
  },
  sectionTitle: {
    fontSize: typography.body,
    fontWeight: "500",
    color: colors.text,
  },
  resultCount: {
    fontSize: typography.small,
    color: colors.subtext,
    fontWeight: "300",
  },

  // Category chips
  chipRow: {
    gap: spacing(1),
    paddingBottom: spacing(1.5),
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(0.5),
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(0.75),
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipEmoji: { fontSize: 13 },
  chipLabel: {
    fontSize: typography.small,
    color: colors.subtext,
    fontWeight: "300",
  },
  chipLabelOn: {
    color: colors.card,
    fontWeight: "500",
  },

  // FAQ card container
  faqCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...shadows.card,
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing(4),
    paddingHorizontal: spacing(3),
  },
  emptyEmoji: { fontSize: 28, marginBottom: spacing(1) },
  emptyTitle: {
    fontSize: typography.body,
    fontWeight: "500",
    color: colors.text,
    marginBottom: spacing(0.5),
  },
  emptySub: {
    fontSize: typography.small,
    color: colors.subtext,
    fontWeight: "300",
    textAlign: "center",
    lineHeight: typography.small * 1.6,
  },

  // Contact rows
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.75),
    gap: spacing(1.5),
  },
  contactDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing(2) + 44 + spacing(1.5),
  },
  contactIconWrap: {
    width: 44, height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  contactIcon: { fontSize: 20 },
  contactInfo: { flex: 1 },
  contactLabel: {
    fontSize: typography.small,
    color: colors.subtext,
    fontWeight: "300",
    marginBottom: 3,
  },
  contactValue: {
    fontSize: typography.body,
    color: colors.text,
    fontWeight: "400",
  },
  contactArrow: {
    fontSize: 18,
    color: colors.border,
  },
  chatBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(1),
  },
  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(47,130,80,0.12)",
    borderRadius: radius.pill,
    paddingHorizontal: spacing(0.75),
    paddingVertical: 2,
  },
  onlineDot: {
    width: 5, height: 5,
    borderRadius: 3,
    backgroundColor: "#3A9A60",
  },
  onlineText: {
    fontSize: typography.tiny,
    color: "#3A9A60",
    fontWeight: "500",
  },

  // Footer
  footer: {
    alignItems: "center",
    paddingVertical: spacing(2),
    marginBottom: spacing(1),
  },
  footerText: {
    fontSize: typography.tiny,
    color: colors.subtext,
    fontWeight: "300",
    textAlign: "center",
    lineHeight: typography.tiny * 1.8,
    marginBottom: spacing(1),
  },
  footerVersion: {
    fontSize: typography.tiny,
    color: colors.border,
    fontWeight: "300",
    letterSpacing: 0.5,
  },
});
