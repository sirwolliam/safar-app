/**
 * MyDuasScreen.jsx — Safar
 * Duas browser: Favourites · Practice · My Duas tabs.
 * Built from design mockup — image-to-code + emil-design-eng craft.
 *
 * Hard rules: StyleSheet.create module-level, literal values only.
 * No && in style arrays — ternaries only. Phosphor icons only.
 * ScrollView not FlatList. Modal not external sheet library.
 */
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Modal,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Star,
  BookOpen,
  User,
  ArrowsCounterClockwise,
  ArrowsClockwise,
  PersonSimpleWalk,
  Mountains,
  Columns,
  Shield,
  Moon,
  ArrowCounterClockwise,
  Heart,
  Users,
  UsersThree,
  Heartbeat,
  Hourglass,
  CloudRain,
  Leaf,
  Flame,
  SunHorizon,
  Sparkle,
  Mosque,
  Compass,
  Plus,
  PlayCircle,
  MagnifyingGlass,
  Sliders,
  CaretLeft,
  CaretRight,
  X,
} from "phosphor-react-native";

const SERIF = "SourceSerif4-Regular";
const HEADER_IMAGE = require("../assets/dua-header.png");

// ── Data ──────────────────────────────────────────────────────────────────────
const HAJJ_ROWS = [
  { key: "ihram",   num: "1", title: "Before Ihram", sub: "Duas before entering the state of Ihram",  image: require("../assets/hajj/hajj-ihram.png"),   mode: "umrah" },
  { key: "tawaf",   num: "2", title: "Tawaf",        sub: "Duas for circumambulating the Kaaba",       image: require("../assets/hajj/hajj-tawaf.png"),   mode: "umrah" },
  { key: "sai",     num: "3", title: "Sa’i",          sub: "Duas for walking between Safa & Marwah",   image: require("../assets/hajj/hajj-saiy.png"),    mode: "umrah" },
  { key: "arafah",  num: "4", title: "Arafah",        sub: "Duas for the Day of Arafah",               image: require("../assets/hajj/hajj-arafah.png"),  mode: "hajj"  },
  { key: "jamarat", num: "5", title: "Jamarat",       sub: "Duas for the stoning of the Jamarat",      image: require("../assets/hajj/hajj-jamarat.png"), mode: "hajj"  },
];

const THEMES = [
  {
    key: "pilgrimage",
    label: "Pilgrimage\n& Worship",
    icon: Mosque,
    image: require("../assets/themes/dua_kaaba.png"),
    overlay: 0.45,
  },
  {
    key: "prayer",
    label: "Salah\n& Prayer",
    icon: Moon,
    image: require("../assets/themes/dua_sleep.png"),
    overlay: 0.25,
  },
  {
    key: "dhikr",
    label: "Dhikr &\nRemembrance",
    icon: Heart,
    image: require("../assets/themes/dua_reminders.png"),
    overlay: 0.40,
  },
  {
    key: "forgiveness",
    label: "Forgiveness\n& Repentance",
    icon: ArrowCounterClockwise,
    image: require("../assets/themes/dua_icon6.png"),
    overlay: 0.35,
  },
  {
    key: "gratitude",
    label: "Gratitude\n& Praise",
    icon: SunHorizon,
    image: require("../assets/themes/dua_icon1.png"),
    overlay: 0.38,
  },
  {
    key: "tawakkul",
    label: "Trust\nin Allah",
    icon: Sparkle,
    image: require("../assets/themes/dua_icon5.png"),
    overlay: 0.35,
  },
  {
    key: "patience",
    label: "Patience\n& Steadfastness",
    icon: Hourglass,
    image: require("../assets/themes/dua_icon2.png"),
    overlay: 0.38,
  },
  {
    key: "family",
    label: "Family\n& Loved Ones",
    icon: UsersThree,
    image: require("../assets/themes/dua_family.png"),
    overlay: 0.42,
  },
  {
    key: "health",
    label: "Health\n& Healing",
    icon: Heartbeat,
    image: require("../assets/themes/dua_icon7.png"),
    overlay: 0.35,
  },
  {
    key: "anxiety",
    label: "Anxiety\n& Worry",
    icon: CloudRain,
    image: require("../assets/themes/dua_icon4.png"),
    overlay: 0.30,
  },
  {
    key: "travel",
    label: "Travel\n& Journey",
    icon: Compass,
    image: require("../assets/themes/dua_icon3.png"),
    overlay: 0.38,
  },
  {
    key: "guidance",
    label: "Guidance\n& Wisdom",
    icon: BookOpen,
    image: require("../assets/themes/duas.png"),
    overlay: 0.48,
  },
];

const MOODS = [
  { key: "anxious",  label: "Feeling\nAnxious",  icon: CloudRain,  image: require("../assets/mood/mood-anxious.png")  },
  { key: "peace",    label: "Seeking\nPeace",    icon: Leaf,       image: require("../assets/mood/mood-peace.png")    },
  { key: "strength", label: "Need\nStrength",    icon: Flame,      image: require("../assets/mood/mood-strength.png") },
  { key: "grateful", label: "Feeling\nGrateful", icon: Moon,       image: require("../assets/mood/mood-grateful.png") },
  { key: "anew",     label: "Starting\nAnew",    icon: SunHorizon, image: require("../assets/mood/mood-anew.png")     },
];

const TAGS      = ["Health", "Family", "Forgiveness", "Gratitude", "Protection", "Custom"];
const LOCATIONS = ["Arafah", "Mina", "Tawaf", "Madinah", "General", "Custom"];

// ── Component ─────────────────────────────────────────────────────────────────
export default function MyDuasScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [activeTab,    setActiveTab]    = useState("discover");
  const [search,       setSearch]       = useState("");
  const [showModal,    setShowModal]    = useState(false);
  const [duaText,      setDuaText]      = useState("");
  const [duaTitle,     setDuaTitle]     = useState("");
  const [duaFor,       setDuaFor]       = useState("");
  const [selectedTag,  setSelectedTag]  = useState(null);
  const [selectedLoc,  setSelectedLoc]  = useState(null);

  const slideAnim   = useRef(new Animated.Value(700)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  function openModal() {
    setShowModal(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function closeModal() {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 700,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowModal(false);
      setDuaText("");
      setDuaTitle("");
      setDuaFor("");
      setSelectedTag(null);
      setSelectedLoc(null);
    });
  }

  function saveDua() {
    closeModal();
  }

  return (
    <View style={styles.root}>

      {/* ── Main scroll ──────────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Image
            source={HEADER_IMAGE}
            defaultSource={HEADER_IMAGE}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" }}
            resizeMode="cover"
            fadeDuration={0}
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.10)", "rgba(26,20,16,0.72)", "rgba(26,20,16,0.96)"]}
            locations={[0, 0.35, 0.75, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + 14 }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <CaretLeft size={18} color="#FFFFFF" weight="bold" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <View style={styles.iconBadge}>
                <BookOpen size={22} color="#C8A96A" weight="regular" />
              </View>
              <Text style={styles.headerTitle}>Duas</Text>
            </View>
            <Text style={styles.headerSub}>
              Supplications for every moment of your journey
            </Text>
          </View>
          <TouchableOpacity style={[styles.addBtn, { top: insets.top + 14 }]} onPress={openModal} activeOpacity={0.85}>
            <Plus size={14} color="#C8A96A" weight="bold" />
            <Text style={styles.addBtnText}>Add Dua</Text>
          </TouchableOpacity>
        </View>

        {/* Search + Practice */}
        <View style={styles.searchRow}>
          <View style={styles.searchBarInner}>
            <MagnifyingGlass size={18} color="#8A7D6A" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search duas..."
              placeholderTextColor="#B0A090"
              value={search}
              onChangeText={setSearch}
            />
            <Sliders size={18} color="#8A7D6A" />
          </View>
          <TouchableOpacity
            style={styles.practicePill}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("PracticeLearn")}
          >
            <PlayCircle size={18} color="#1A1410" weight="fill" />
            <Text style={styles.practicePillText}>Practice</Text>
          </TouchableOpacity>
        </View>

        {/* Tab bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={activeTab === "discover" ? [styles.tab, styles.tabActive] : styles.tab}
            onPress={() => setActiveTab("discover")}
            activeOpacity={0.8}
          >
            <Star
              size={16}
              color={activeTab === "discover" ? "#FFFFFF" : "#5C534A"}
              weight={activeTab === "discover" ? "fill" : "regular"}
            />
            <Text style={activeTab === "discover" ? [styles.tabLabel, styles.tabLabelActive] : styles.tabLabel}>
              Discover
            </Text>
          </TouchableOpacity>

          <View style={styles.tabDivider} />

          <TouchableOpacity
            style={activeTab === "favourites" ? [styles.tab, styles.tabActive] : styles.tab}
            onPress={() => setActiveTab("favourites")}
            activeOpacity={0.8}
          >
            <Star
              size={16}
              color={activeTab === "favourites" ? "#FFFFFF" : "#5C534A"}
              weight={activeTab === "favourites" ? "fill" : "regular"}
            />
            <Text style={activeTab === "favourites" ? [styles.tabLabel, styles.tabLabelActive] : styles.tabLabel}>
              Favourites
            </Text>
          </TouchableOpacity>

          <View style={styles.tabDivider} />

          <TouchableOpacity
            style={activeTab === "myduas" ? [styles.tab, styles.tabActive] : styles.tab}
            onPress={() => setActiveTab("myduas")}
            activeOpacity={0.8}
          >
            <User
              size={16}
              color={activeTab === "myduas" ? "#FFFFFF" : "#5C534A"}
              weight="regular"
            />
            <Text style={activeTab === "myduas" ? [styles.tabLabel, styles.tabLabelActive] : styles.tabLabel}>
              My Duas
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Tab: Discover ────────────────────────────────────────────── */}
        {activeTab === "discover" ? (
          <View>
            {/* Duas for Hajj & Umrah */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardHeaderLeft}>
                  <Text style={styles.sectionTitle}>Duas for Hajj & Umrah</Text>
                  <Text style={styles.sectionSub}>
                    {"Step-by-step supplications for every\nmoment of your worship."}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate("PilgrimageDuas", { mode: "umrah" })}
                  activeOpacity={0.75}
                >
                  <Text style={styles.viewAll}>View all  ›</Text>
                </TouchableOpacity>
              </View>

              {HAJJ_ROWS.map((item, idx) => (
                <TouchableOpacity
                  key={item.key}
                  style={idx < HAJJ_ROWS.length - 1 ? [styles.row, styles.rowBorder] : styles.row}
                  activeOpacity={0.75}
                  onPress={() => navigation.navigate("PilgrimageDuas", { mode: item.mode })}
                >
                  <View style={styles.rowThumb}>
                    <Image source={item.image} style={styles.rowThumbImg} resizeMode="cover" />
                  </View>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowTitle}>{item.num}. {item.title}</Text>
                    <Text style={styles.rowSub} numberOfLines={2} ellipsizeMode="tail">{item.sub}</Text>
                  </View>
                  <CaretRight size={16} color="#B0A090" weight="bold" />
                </TouchableOpacity>
              ))}

            </View>

            {/* Themes / Library */}
            <View style={styles.themeSection}>
              <View style={styles.sectionRow}>
                <View style={styles.sectionHeaderLeft}>
                  <Text style={styles.sectionTitle}>Themes / Library</Text>
                  <Text style={styles.sectionSub}>Browse duas by topic</Text>
                </View>
                <TouchableOpacity
                  style={styles.sectionViewAll}
                  onPress={() => navigation.navigate("DuaList", { category: "all" })}
                  activeOpacity={0.75}
                >
                  <Text style={styles.viewAll}>View all  ›</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.themeScrollView}
                contentContainerStyle={styles.themeScroll}
              >
                {THEMES.map((theme) => (
                  <TouchableOpacity
                    key={theme.key}
                    style={styles.themeCardWrapper}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate("DuaList", { category: theme.key })}
                  >
                    <View style={styles.themeCard}>
                      <Image
                        source={theme.image}
                        style={StyleSheet.absoluteFillObject}
                        resizeMode="cover"
                      />
                      <LinearGradient
                        colors={["transparent", `rgba(26,20,16,${theme.overlay})`]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <View style={styles.themeCardContent}>
                        <theme.icon size={40} color="#FFFFFF" weight="regular" />
                      </View>
                    </View>
                    <Text style={styles.themeLabel}>{theme.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Duas by Mood */}
            <View style={styles.moodSection}>
              <View style={styles.sectionRow}>
                <View style={styles.sectionHeaderLeft}>
                  <Text style={styles.sectionTitle}>Duas by Mood</Text>
                  <Text style={styles.sectionSub}>Find the right words for how you feel</Text>
                </View>
                <TouchableOpacity
                  style={styles.sectionViewAll}
                  onPress={() => navigation.navigate("DuaList", { category: "mood" })}
                  activeOpacity={0.75}
                >
                  <Text style={styles.viewAll}>View all  ›</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.moodScroll}
              >
                {MOODS.map((m) => (
                  <TouchableOpacity
                    key={m.key}
                    style={styles.moodCard}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate("DuaList", { category: m.key })}
                  >
                    <Image
                      source={m.image}
                      style={StyleSheet.absoluteFillObject}
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0.70)"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <View style={styles.moodCardContent}>
                      <m.icon size={24} color="#FFFFFF" weight="regular" />
                      <Text style={styles.moodLabel}>{m.label}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

        ) : activeTab === "favourites" ? (
          <View style={styles.emptyTab}>
            <Star size={48} color="#C8A96A" weight="regular" />
            <Text style={styles.favEmptyTitle}>Your favourite duas</Text>
            <Text style={styles.favEmptySub}>{"Tap ★ on any du’ā to save it here."}</Text>
          </View>

        ) : (
          <View style={styles.emptyTab}>
            <User size={44} color="#C8A96A" weight="regular" />
            <Text style={styles.emptyTitle}>My Duas</Text>
            <Text style={styles.emptySub}>Duas you have saved will appear here.</Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* ── Add Dua Modal (bottom sheet) ─────────────────────────────────── */}
      <Modal transparent visible={showModal} onRequestClose={closeModal}>
        <View style={styles.modalRoot}>
          <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
            <TouchableOpacity
              style={styles.backdropTouch}
              onPress={closeModal}
              activeOpacity={1}
            />
          </Animated.View>
          <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.sheetKav}
            >
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeaderRow}>
                <Text style={styles.sheetTitle}>Add Dua</Text>
                <TouchableOpacity onPress={closeModal} activeOpacity={0.7}>
                  <X size={20} color="#8A7D6A" />
                </TouchableOpacity>
              </View>
              <ScrollView
                style={styles.sheetScroll}
                contentContainerStyle={styles.sheetScrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Dua text */}
                <TextInput
                  style={styles.duaInput}
                  placeholder="Paste or type your dua here"
                  placeholderTextColor="#B0A090"
                  multiline
                  value={duaText}
                  onChangeText={setDuaText}
                  textAlignVertical="top"
                />

                {/* Title */}
                <Text style={styles.fieldEyebrow}>TITLE (OPTIONAL)</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="Name this dua"
                  placeholderTextColor="#B0A090"
                  value={duaTitle}
                  onChangeText={setDuaTitle}
                />

                {/* For */}
                <Text style={styles.fieldEyebrow}>FOR (OPTIONAL)</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="e.g. For Mum"
                  placeholderTextColor="#B0A090"
                  value={duaFor}
                  onChangeText={setDuaFor}
                />

                {/* Tag picker */}
                <Text style={styles.fieldEyebrow}>TAG</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pillRow}
                >
                  {TAGS.map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={selectedTag === t ? [styles.pill, styles.pillActive] : styles.pill}
                      onPress={() => setSelectedTag(selectedTag === t ? null : t)}
                      activeOpacity={0.8}
                    >
                      <Text style={selectedTag === t ? [styles.pillText, styles.pillTextActive] : styles.pillText}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Location picker */}
                <Text style={styles.fieldEyebrow}>LOCATION</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pillRow}
                >
                  {LOCATIONS.map((l) => (
                    <TouchableOpacity
                      key={l}
                      style={selectedLoc === l ? [styles.pill, styles.pillActive] : styles.pill}
                      onPress={() => setSelectedLoc(selectedLoc === l ? null : l)}
                      activeOpacity={0.8}
                    >
                      <Text style={selectedLoc === l ? [styles.pillText, styles.pillTextActive] : styles.pillText}>
                        {l}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Actions */}
                <TouchableOpacity style={styles.saveBtn} onPress={saveDua} activeOpacity={0.85}>
                  <Text style={styles.saveBtnText}>Save Dua</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelLink} onPress={closeModal} activeOpacity={0.7}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <View style={styles.sheetBottom} />
              </ScrollView>
            </KeyboardAvoidingView>
          </Animated.View>
        </View>
      </Modal>

    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:           { flex: 1, backgroundColor: "#F0EBE1" },

  // ── Header
  header:         { height: 260, overflow: "hidden", position: "relative", backgroundColor: "#1A1410" },
  backBtn:        { position: "absolute", left: 18, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" },
  headerContent:  { position: "absolute", bottom: 22, left: 20, right: 20 },
  titleRow:       { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  iconBadge:      { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: "#C8A96A", alignItems: "center", justifyContent: "center" },
  headerTitle:    { fontFamily: SERIF, fontSize: 38, color: "#FFFFFF", fontWeight: "600" },
  headerSub:      { fontSize: 15, color: "rgba(255,255,255,0.82)", lineHeight: 22, maxWidth: "88%" },
  addBtn:         { position: "absolute", top: 0, right: 20, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#4A5C48", borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10 },
  addBtnText:     { fontSize: 14, fontWeight: "600", color: "#C8A96A" },

  // ── Scroll
  scroll:         { flex: 1 },
  scrollContent:  { paddingBottom: 16 },

  // ── Search + Practice row
  searchRow:       { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginTop: 14, gap: 8 },
  searchBarInner:  { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#FDFAF4", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, gap: 8, shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 6, elevation: 3 },
  practicePill:    { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FDFAF4", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, shadowColor: "#1A1410", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.20, shadowRadius: 6, elevation: 4 },
  practicePillText:{ fontSize: 14, fontWeight: "600", color: "#1A1410" },
  searchInput:    { flex: 1, fontSize: 15, color: "#1A1410" },

  // ── Tabs
  tabBar:         { flexDirection: "row", backgroundColor: "#FDFAF4", borderRadius: 16, marginHorizontal: 16, marginTop: 12, padding: 4, gap: 4, borderWidth: 0.5, borderColor: "#DDD5C0" },
  tab:            { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 13, gap: 6, backgroundColor: "#EDE4D4", borderRadius: 12 },
  tabActive:      { backgroundColor: "#4A5C48", borderRadius: 12 },
  tabDivider:     { width: 0, backgroundColor: "transparent" },
  tabLabel:       { fontSize: 13, fontWeight: "600", color: "#5C534A" },
  tabLabelActive: { color: "#FFFFFF" },

  // ── Hajj card
  card:           { backgroundColor: "#FDF7EE", borderRadius: 20, marginHorizontal: 16, marginTop: 16, overflow: "hidden", borderWidth: 0.5, borderColor: "#DDD5C0" },
  cardHeaderRow:  { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#EDE4D4" },
  cardHeaderLeft: { flex: 1, paddingRight: 12 },
  sectionTitle:   { fontSize: 20, color: "#1A1410", marginBottom: 5 },
  sectionSub:     { fontSize: 13, color: "#8A7D6A", lineHeight: 19 },

  // ── List rows
  row:            { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, minHeight: 88, backgroundColor: "#FDF7EE" },
  rowBorder:      { borderBottomWidth: 1, borderBottomColor: "#EDE4D4" },
  rowIcon:        { width: 52, height: 52, borderRadius: 14, backgroundColor: "#243020", alignItems: "center", justifyContent: "center", marginRight: 14 },
  rowThumb:       { width: 72, height: 72, borderRadius: 14, overflow: "hidden", marginRight: 14 },
  rowThumbImg:    { width: "100%", height: "100%" },
  rowInfo:        { flex: 1, paddingRight: 8 },
  rowTitle:       { fontSize: 20, color: "#1A1410", marginBottom: 2 },
  rowSub:         { fontSize: 14, color: "#8A7D6A", lineHeight: 19 },

  // ── View all row (bottom of card)
  viewAll:        { fontSize: 13, fontWeight: "600", color: "#C8A96A" },

  // ── Shared section row (header + view all)
  sectionRow:       { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  sectionHeaderLeft:{ flex: 1, alignItems: "flex-start" },
  sectionViewAll:   { alignSelf: "flex-start", paddingTop: 2 },

  // ── Themes
  themeSection:     { backgroundColor: "#FDF7EE", borderRadius: 16, marginHorizontal: 16, marginTop: 16, marginBottom: 0, paddingBottom: 16, borderWidth: 0, shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 6, elevation: 3 },
  themeScrollView:  { paddingBottom: 8 },
  themeScroll:      { paddingHorizontal: 16, paddingBottom: 8, alignItems: "flex-start", gap: 8 },
  themeCardWrapper: { width: 110, alignItems: "center", marginRight: 8, overflow: "visible" },
  themeCard:        { width: 110, height: 110, borderRadius: 14, overflow: "hidden" },
  themeCardContent: { flex: 1, alignItems: "center", justifyContent: "center" },
  themeLabel:       { fontSize: 14, color: "#1A1410", textAlign: "center", lineHeight: 18, marginTop: 6, paddingHorizontal: 4 },

  // ── Moods
  moodSection:    { backgroundColor: "#FDF7EE", borderRadius: 16, marginHorizontal: 16, marginTop: 16, marginBottom: 12, paddingBottom: 16, borderWidth: 0, shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 6, elevation: 3 },
  moodScroll:     { paddingHorizontal: 16, paddingBottom: 8, gap: 10 },
  moodCard:       { width: 100, height: 110, borderRadius: 12, overflow: "hidden", marginRight: 10 },
  moodCardContent:{ flex: 1, alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 4 },
  moodLabel:      { fontSize: 14, fontWeight: "600", color: "#FFFFFF", textAlign: "center", lineHeight: 18 },

  // ── Empty tab states
  emptyTab:       { alignItems: "center", paddingTop: 64, paddingBottom: 40, gap: 14 },
  emptyTitle:     { fontSize: 24, color: "#1A1410" },
  emptySub:       { fontSize: 14, color: "#8A7D6A", textAlign: "center" },
  favEmptyTitle:  { fontSize: 20, color: "#1A1410" },
  favEmptySub:    { fontSize: 14, color: "#8A7D6A", textAlign: "center", marginTop: 8, paddingHorizontal: 32 },

  bottomSpacer:   { height: 32 },

  // ── Modal
  modalRoot:      { flex: 1, justifyContent: "flex-end" },
  backdrop:       { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.48)" },
  backdropTouch:  { flex: 1 },
  sheet:          { backgroundColor: "#FDFAF4", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "88%" },
  sheetKav:       { flex: 1 },
  sheetHandle:    { width: 40, height: 4, borderRadius: 2, backgroundColor: "#DDD5C0", alignSelf: "center", marginTop: 12, marginBottom: 4 },
  sheetHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#EDE4D4" },
  sheetTitle:     { fontSize: 20, color: "#1A1410" },
  sheetScroll:    { flex: 1 },
  sheetScrollContent: { paddingHorizontal: 20, paddingTop: 4 },

  // ── Add Dua form
  duaInput:       { backgroundColor: "#F5F0E8", borderRadius: 14, borderWidth: 1, borderColor: "#DDD5C0", padding: 16, fontSize: 16, color: "#1A1410", minHeight: 120, marginTop: 20, marginBottom: 22 },
  fieldEyebrow:   { fontSize: 10, fontWeight: "700", letterSpacing: 1.2, color: "#C8A96A", marginBottom: 10 },
  fieldInput:     { backgroundColor: "#F5F0E8", borderRadius: 12, borderWidth: 1, borderColor: "#DDD5C0", paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: "#1A1410", marginBottom: 22 },
  pillRow:        { gap: 8, paddingBottom: 22 },
  pill:           { borderRadius: 20, borderWidth: 1, borderColor: "#DDD5C0", paddingHorizontal: 15, paddingVertical: 9, backgroundColor: "#F5F0E8" },
  pillActive:     { backgroundColor: "#1A1410", borderColor: "#1A1410" },
  pillText:       { fontSize: 13, fontWeight: "500", color: "#5A4E42" },
  pillTextActive: { color: "#C8A96A" },
  saveBtn:        { backgroundColor: "#1A1410", borderRadius: 28, paddingVertical: 16, alignItems: "center", marginTop: 6, marginBottom: 14 },
  saveBtnText:    { fontSize: 16, fontWeight: "600", color: "#C8A96A" },
  cancelLink:     { alignItems: "center", paddingVertical: 8 },
  cancelText:     { fontSize: 15, color: "#8A7D6A" },
  sheetBottom:    { height: 40 },
});
