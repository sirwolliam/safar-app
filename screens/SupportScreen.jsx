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
  StatusBar,
  Dimensions,
} from "react-native";
import { colors, spacing, radius, typography, shadows } from "../theme";
import {
  CaretLeft, MagnifyingGlass, DeviceMobile, BookOpenText, EnvelopeSimple,
  GlobeSimple,
} from "phosphor-react-native";
import { KaabahIcon } from "../KaabahIcon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HeaderPatternBg from "../HeaderPatternBg";
import { SOURCE_NOTE_LONG } from "../content/sourceStatements";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SERIF = "SourceSerif4-Regular";
const SW = Dimensions.get("window").width;

// ─── Content ──────────────────────────────────────────────────────────────────

const FAQ_SECTIONS = [
  {
    id: "app",
    label: "Using the App",
    Icon: DeviceMobile,
    questions: [
      {
        id: "app-1",
        q: "How do I track my Tawaf rounds?",
        a: "Go to Practice → Tawaf Counter. Tap “Completed a round” after each circuit; the ring and the seven numbered dots show how many rounds you have done. After the seventh round, tap again to restart. The count is not saved if you leave the screen.",
      },
      {
        id: "app-2",
        q: "Can I use Safar without an internet connection?",
        a: "Duas, lessons, guides and maps are built into the app, so they work without an internet connection. Prayer times, currency rates, Safar Assist and links to outside media need a connection.",
      },
      {
        id: "app-4",
        q: "How do I turn transliteration or translation on or off?",
        a: "When you open a dua, use the Transliteration and Translation switches at the bottom of the screen to show or hide each. They apply to that dua screen only and are switched back on the next time you open it.",
      },
      {
        id: "app-5",
        q: "Is my data backed up if I change phones?",
        a: "Safar does not require an account. Your bookmarks, notes and checklists are saved on this device only, so they will not carry over to a new phone.",
      },
    ],
  },
  {
    id: "hajj",
    label: "Hajj & Umrah",
    Icon: KaabahIcon,
    questions: [
      {
        id: "haj-1",
        q: "What is the correct order of Umrah practices?",
        a: "The four steps of Umrah are: (1) Ihram — entering the sacred state with the intention and talbiyah; (2) Tawaf — seven circuits around the Kabah; (3) Say — seven trips between Safa and Marwah; (4) Tahallul — shaving or cutting the hair to exit ihram. Learn → Umrah Guide walks you through each step in order.",
      },
      {
        id: "haj-2",
        q: "What are the pillars of Hajj I must not miss?",
        a: "The essential pillars (arkan) of Hajj are: Ihram with intention, standing at Arafah (wuquf), Tawaf al-Ifadah, and Say. Missing any of these invalidates the Hajj.",
      },
      {
        id: "haj-3",
        q: "What should I do if I miss a Wajib act?",
        a: "A wajib (obligatory but not a pillar) act that is missed or performed incorrectly generally requires a dam — the sacrifice of a sheep in Makkah. It is strongly advised to consult a qualified scholar for your specific situation.",
      },
      {
        id: "haj-4",
        q: "Can women perform Tawaf and Say at any time?",
        a: "There is no restriction on women performing Tawaf or Say at any time. However, if a woman is in a state of hayd (menstruation) she may not perform Tawaf until she is pure. Say may be performed in that state according to the majority opinion. Please consult a scholar for personal guidance.",
      },
    ],
  },
  {
    id: "duas",
    label: "Dua Sources & References",
    Icon: BookOpenText,
    questions: [
      {
        id: "dua-1",
        q: "Where do the duas in Safar come from?",
        a: SOURCE_NOTE_LONG,
      },
      {
        id: "dua-2",
        q: "Are the duas specific to Hajj and Umrah only?",
        a: "No. The Dua Library contains duas for all occasions — duas for family, provision, forgiveness, protection, and more. The Hajj & Umrah section is a curated subset of the full library.",
      },
      {
        id: "dua-4",
        q: "Can I suggest a dua to be added?",
        a: "Email your suggestion to hello@trysafar.app and we will consider adding it.",
      },
    ],
  },
];

// ─── FAQ Accordion Item ───────────────────────────────────────────────────────
function FaqItem({ item, isOpen, onToggle }) {
  return (
    <TouchableOpacity
      style={isOpen ? [faq.item, faq.itemOpen] : faq.item}
      onPress={onToggle}
      activeOpacity={0.85}
    >
      <View style={faq.row}>
        <Text style={isOpen ? [faq.q, faq.qOpen] : faq.q}>{item.q}</Text>
        <Text style={isOpen ? [faq.chevron, faq.chevronOpen] : faq.chevron}>
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
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#D4D0CA",
  },
  itemOpen: {
    backgroundColor: "rgba(47,93,80,0.04)",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  q: {
    flex: 1,
    fontSize: 16,
    fontWeight: "400",
    color: "#1A1712",
    lineHeight: 16 * 1.5,
  },
  qOpen: {
    color: "#2F5D50",
    fontWeight: "500",
  },
  chevron: {
    fontSize: 8,
    color: "#D4D0CA",
    marginTop: 6,
    fontWeight: "600",
  },
  chevronOpen: {
    color: "#2F5D50",
  },
  a: {
    fontSize: 14,
    color: "#5A5650",
    fontWeight: "300",
    lineHeight: 14 * 1.75,
    marginTop: 10,
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
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1A1712",
  },
  action: {
    fontSize: 14,
    color: "#5A5650",
    fontWeight: "300",
  },
  card: {
    backgroundColor: "#FDFAF4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D4D0CA",
    overflow: "hidden",
    shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SupportScreen({ navigation }) {
  const [searchQuery, setSearchQuery]   = useState("");
  const [openFaqId,   setOpenFaqId]     = useState(null);
  const [activeSection, setActiveSection] = useState("app");
  const insets = useSafeAreaInsets();

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
    <View style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <HeaderPatternBg width={SW} />
        <View style={[styles.headerTopRow, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            style={styles.chipBtn}
            onPress={() => navigation?.goBack?.()}
          >
            <CaretLeft size={20} color="#1A1410" weight="bold" />
          </TouchableOpacity>
          <View style={{ width: 36 }} />
        </View>
        <Text style={styles.pageTitle}>Help & Support</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Hero ── */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>How can we help?</Text>
          <Text style={styles.heroSub}>
            Search below or browse by topic. We're here to make your journey as smooth as possible.
          </Text>
        </View>

        {/* ── Search ── */}
        <View style={styles.searchBar}>
          <MagnifyingGlass size={18} color="#C8A96A" weight="regular" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search questions…"
            placeholderTextColor={"#5C534A"}
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
                    style={on ? [styles.chip, styles.chipOn] : styles.chip}
                    onPress={() => {
                      setActiveSection(s.id);
                      setOpenFaqId(null);
                    }}
                    activeOpacity={0.8}
                  >
                    <s.Icon size={18} color={on ? "#FDFAF4" : "#5A5650"} weight={on ? "fill" : "regular"} />
                    <Text style={on ? [styles.chipLabel, styles.chipLabelOn] : styles.chipLabel}>
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
                <View style={{ marginBottom: 8 }}>
                  <MagnifyingGlass size={36} color="#C8A96A" weight="regular" />
                </View>
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
            onPress={() => Linking.openURL("mailto:hello@trysafar.app")}
            activeOpacity={0.85}
          >
            <View style={styles.contactIconWrap}>
              <EnvelopeSimple size={26} color="#5A5650" weight="regular" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email us</Text>
              <Text style={styles.contactValue}>hello@trysafar.app</Text>
            </View>
            <Text style={styles.contactArrow}>›</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.contactDivider} />

          {/* Website */}
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => Linking.openURL("https://trysafar.app")}
            activeOpacity={0.85}
          >
            <View style={styles.contactIconWrap}>
              <GlobeSimple size={26} color="#5A5650" weight="regular" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Website</Text>
              <Text style={styles.contactValue}>trysafar.app</Text>
            </View>
            <Text style={styles.contactArrow}>›</Text>
          </TouchableOpacity>
        </Section>

        {/* ── Footer note ── */}
        <View style={styles.footer}>
          <Text style={styles.footerVersion}>Safar · Version 1.0.0</Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#EDE6D8",
  },

  // Header
  header:       { position: "relative", overflow: "hidden", minHeight: 140, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: "#4A5C48" },
  headerTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 2 },
  chipBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: "#FDFAF4", alignItems: "center", justifyContent: "center" },
  pageTitle:    { fontFamily: SERIF, fontSize: 38, color: "#FDFAF4", textAlign: "center", marginTop: 8, position: "relative", zIndex: 2 },

  scroll: {
    paddingHorizontal: 20,
    paddingTop: 0,
  },

  // Hero
  hero: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 20,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "400",
    color: "#1A1712",
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 14,
    color: "#5A5650",
    fontWeight: "300",
    textAlign: "center",
    lineHeight: 14 * 1.7,
    maxWidth: 280,
  },

  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDFAF4",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: "#D4D0CA",
    marginBottom: 24,
    shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1A1712",
    fontWeight: "300",
    padding: 0,
  },
  searchClear: {
    fontSize: 11,
    color: "#5A5650",
    padding: 2,
  },

  // FAQ section
  faqWrap: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1A1712",
  },
  resultCount: {
    fontSize: 14,
    color: "#5A5650",
    fontWeight: "300",
  },

  // Category chips
  chipRow: {
    gap: 8,
    paddingBottom: 12,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D4D0CA",
    backgroundColor: "#FDFAF4",
  },
  chipOn: {
    backgroundColor: "#2F5D50",
    borderColor: "#2F5D50",
  },
  chipLabel: {
    fontSize: 14,
    color: "#5A5650",
    fontWeight: "300",
  },
  chipLabelOn: {
    color: "#FDFAF4",
    fontWeight: "500",
  },

  // FAQ card container
  faqCard: {
    backgroundColor: "#FDFAF4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D4D0CA",
    overflow: "hidden",
    shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4,
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1A1712",
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 14,
    color: "#5A5650",
    fontWeight: "300",
    textAlign: "center",
    lineHeight: 14 * 1.6,
  },

  // Contact rows
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  contactDivider: {
    height: 1,
    backgroundColor: "#D4D0CA",
    marginLeft: 16 + 44 + 12,
  },
  contactIconWrap: {
    width: 44, height: 44,
    borderRadius: 10,
    backgroundColor: "#EDE6D8",
    borderWidth: 1,
    borderColor: "#D4D0CA",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  contactInfo: { flex: 1 },
  contactLabel: {
    fontSize: 14,
    color: "#5A5650",
    fontWeight: "300",
    marginBottom: 3,
  },
  contactValue: {
    fontSize: 16,
    color: "#1A1712",
    fontWeight: "400",
  },
  contactArrow: {
    fontSize: 18,
    color: "#D4D0CA",
  },

  // Footer
  footer: {
    alignItems: "center",
    paddingVertical: 16,
    marginBottom: 8,
  },
  footerVersion: {
    fontSize: 12,
    color: "#D4D0CA",
    fontWeight: "300",
    letterSpacing: 0.5,
  },
});
