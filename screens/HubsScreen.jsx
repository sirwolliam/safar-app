/**
 * HubsScreen.jsx — Safar
 * Unified four-pillar hub. Pills switch content in-place — no navigation push.
 *
 * Coding rules: StyleSheet.create at module level, literal values only.
 * No && in style arrays — ternaries only. Phosphor icons verified.
 */
import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, Image, ScrollView, TouchableOpacity, StyleSheet,
  Animated, Easing, Share,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CaretLeft, CaretRight,
  ListChecks, BookOpen, PersonSimpleRun, UsersThree,
  Compass, ShoppingBag, AddressBook,
  PlayCircle, Link, BookmarkSimple, NotePencil, CurrencyDollar,
  MapPin, Books, Cube,
  HandsPraying, Sparkle,
  ShareNetwork, Bell, ShareFat, ArrowSquareOut,
} from "phosphor-react-native";

// ── AsyncStorage keys ─────────────────────────────────────────────────────────
const DEPARTURE_KEY = "safar_departure_date_v1";
const BOARD_KEY     = "safar_journey_board_v1";

// ── Tab order ─────────────────────────────────────────────────────────────────
const TABS = ["plan", "learn", "practice", "connect"];

// ── Per-tab config ────────────────────────────────────────────────────────────
const TAB_CONFIG = {
  plan: {
    label: "Plan",
    image: require("../assets/hub-headers/plan-header.png"),
    gradientColors: ["transparent", "transparent", "rgba(26,32,46,0.68)", "rgba(26,32,46,0.96)"],
    gradientLocations: [0, 0.42, 0.74, 1],
    pillBg: "#1A202E",
    rowIconBg: "#1A202E",
    Icon: ListChecks,
    title: "Plan",
    sub: "Get everything ready — documents, packing, contacts, money.",
    hasHero: true,
    rows: [
      { key: "expect",    Icon: Compass,        label: "What to Expect",     sub: "Crowds, climate, what it really feels like", nav: "stack", target: "WhatToExpect" },
      { key: "checklist", Icon: ListChecks,     label: "Checklist",          sub: "Pack and prepare, nothing missed",           soon: true },
      { key: "shop",      Icon: ShoppingBag,    label: "Shop",               sub: "Essentials for your journey",                nav: "stack", target: "Shop" },
      { key: "contacts",  Icon: AddressBook,    label: "Contacts",           sub: "Hotel, group leader, agent",                 nav: "tab",   tab: "Journey", screen: "MyContacts" },
      { key: "media",     Icon: PlayCircle,     label: "Media",              sub: "Videos, articles and podcasts",              nav: "stack", target: "Media" },
      { key: "resources", Icon: Link,           label: "Official Resources", sub: "Government and authority links",             soon: true },
      { key: "bookmarks", Icon: BookmarkSimple, label: "Bookmarks",          sub: "Your saved content",                         nav: "tab",   tab: "Prepare", screen: "Bookmarks" },
      { key: "notes",     Icon: NotePencil,     label: "Notes",              sub: "Reflections and intentions",                 nav: "stack", target: "Notes" },
      { key: "currency",  Icon: CurrencyDollar, label: "Currency",           sub: "Live exchange rates",                        nav: "stack", target: "CurrencyConverter" },
    ],
  },
  learn: {
    label: "Learn",
    image: require("../assets/hub-headers/learn-header.png"),
    gradientColors: ["transparent", "transparent", "rgba(28,43,30,0.65)", "rgba(28,43,30,0.96)"],
    gradientLocations: [0, 0.44, 0.72, 1],
    pillBg: "#1C2B1E",
    rowIconBg: "#1C2B1E",
    Icon: BookOpen,
    title: "Learn",
    sub: "Understand the rites before you go — step by step, at your pace.",
    hasHero: false,
    rows: [
      { key: "umrah",  Icon: Compass,  label: "Umrah Guide",    sub: "Every step of ʿUmrah, in order",            nav: "stack", target: "UmrahGuide" },
      { key: "hajj",   Icon: Cube,     label: "Hajj Guide",     sub: "The full pilgrimage, day by day",            nav: "stack", target: "HajjGuide" },
      { key: "expect", Icon: BookOpen, label: "What to Expect", sub: "Crowds, climate, what it really feels like", nav: "stack", target: "WhatToExpect" },
      { key: "sacred", Icon: MapPin,   label: "Sacred Places",  sub: "Map of the holy sites",                      nav: "tab",   tab: "Journey", screen: "Map" },
      { key: "duas",   Icon: Books,    label: "Duʿā Library",  sub: "Supplications for every moment",             nav: "tab",   tab: "Duas",    screen: "MyDuas" },
    ],
  },
  practice: {
    label: "Practice",
    image: require("../assets/hub-headers/practice-header.png"),
    gradientColors: ["transparent", "transparent", "rgba(42,31,14,0.65)", "rgba(42,31,14,0.96)"],
    gradientLocations: [0, 0.44, 0.72, 1],
    pillBg: "#2A1F0E",
    rowIconBg: "#2A1F0E",
    Icon: PersonSimpleRun,
    title: "Practice",
    sub: "Rehearse the rites and keep your remembrance — calm, guided, hands-free.",
    hasHero: false,
    rows: [
      { key: "umrahduas",  Icon: HandsPraying, label: "Umrah Duʿās",    sub: "Supplications for every step of ʿUmrah", nav: "stack", target: "PilgrimageDuas", params: { mode: "umrah" } },
      { key: "hajjduas",   Icon: Sparkle,      label: "Ḥajj Duʿās",    sub: "Supplications for every step of Ḥajj",  nav: "stack", target: "PilgrimageDuas", params: { mode: "hajj"  } },
      { key: "audio",      Icon: PlayCircle,   label: "Audio Practice", sub: "Listen and rehearse before you go",     nav: "stack", target: "PracticeLearn" },
      { key: "dualibrary", Icon: Books,        label: "Duʿā Library",   sub: "Supplications for every moment",        nav: "tab",   tab: "Duas",  screen: "MyDuas" },
      { key: "media",      Icon: PlayCircle,   label: "Media",          sub: "Videos and podcasts for your preparation", nav: "stack", target: "Media" },
    ],
  },
  connect: {
    label: "Connect",
    image: require("../assets/hub-headers/connect-header.png"),
    gradientColors: ["transparent", "transparent", "rgba(34,24,32,0.65)", "rgba(34,24,32,0.96)"],
    gradientLocations: [0, 0.44, 0.72, 1],
    pillBg: "#221820",
    rowIconBg: "#221820",
    Icon: UsersThree,
    title: "Connect",
    sub: "Stay close to your group and share the journey with those you love.",
    hasHero: false,
    rows: [
      { key: "groups",        Icon: UsersThree,   label: "Groups",        sub: "Coordinate with your travel group",     nav: "tab",   tab: "Journey", screen: "Groups"       },
      { key: "connections",   Icon: ShareNetwork, label: "Connections",   sub: "People on the journey with you",        nav: "tab",   tab: "Journey", screen: "Connections"  },
      { key: "contacts",      Icon: AddressBook,  label: "My Contacts",   sub: "Hotel, guide, agent and key numbers",   nav: "tab",   tab: "Journey", screen: "MyContacts"   },
      { key: "notifications", Icon: Bell,         label: "Notifications", sub: "Group invites and connection requests", nav: "stack", target: "Notifications"                },
      { key: "share",         Icon: ShareFat,     label: "Share Safar",   sub: "Invite friends and family to join you", nav: "share"                                         },
    ],
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function daysUntil(iso) {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    const dep   = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const now   = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.ceil((dep - today) / 86400000);
  } catch (_) { return null; }
}

// ── PillButton — handles press-scale feedback ─────────────────────────────────
function PillButton({ isActive, pillBg, label, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={[styles.pillWrapper, { transform: [{ scale }] }]}>
      <TouchableOpacity
        style={isActive ? [styles.pillActive, { backgroundColor: pillBg }] : styles.pill}
        onPressIn={() => {
          Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
        }}
        onPressOut={() => {
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
        }}
        onPress={onPress}
        activeOpacity={isActive ? 1 : 0.85}
      >
        <Text style={isActive ? styles.pillTextActive : styles.pillText}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function HubsScreen({ navigation, route }) {
  const insets     = useSafeAreaInsets();
  const initialTab = route?.params?.tab ?? "plan";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [tripState, setTripState] = useState(null);
  const [depDate,   setDepDate]   = useState(null);
  const scrollRef  = useRef(null);

  // ── Animation values ──────────────────────────────────────────────────────
  const headerOpacity     = useRef(new Animated.Value(1)).current;
  const contentOpacity    = useRef(new Animated.Value(1)).current;
  const contentTranslateY = useRef(new Animated.Value(0)).current;

  const headerAnimStyle = { opacity: headerOpacity };
  const contentAnimStyle = {
    opacity: contentOpacity,
    transform: [{ translateY: contentTranslateY }],
  };

  // Reset scroll position after tab content updates
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [activeTab]);

  // ── AsyncStorage ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const [dep, board] = await Promise.all([
        AsyncStorage.getItem(DEPARTURE_KEY),
        AsyncStorage.getItem(BOARD_KEY),
      ]);
      if (dep)        { setDepDate(dep); setTripState("has_date"); }
      else if (board) { setTripState("no_date"); }
      else            { setTripState("none"); }
    }
    load();
  }, []);

  const cfg  = TAB_CONFIG[activeTab];
  const days = depDate ? daysUntil(depDate) : null;

  // ── Tab switch with animation ─────────────────────────────────────────────
  function handleTabPress(tabKey) {
    if (tabKey === activeTab) return;

    const easeIn  = Easing.in(Easing.quad);
    const easeOut = Easing.out(Easing.quad);

    Animated.parallel([
      Animated.timing(headerOpacity,  { toValue: 0, duration: 90,  easing: easeIn, useNativeDriver: true }),
      Animated.timing(contentOpacity, { toValue: 0, duration: 100, easing: easeIn, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (!finished) return;
      setActiveTab(tabKey);
      contentTranslateY.setValue(10);
      Animated.parallel([
        Animated.timing(headerOpacity,     { toValue: 1, duration: 180, easing: easeOut, useNativeDriver: true }),
        Animated.timing(contentOpacity,    { toValue: 1, duration: 200, easing: easeOut, useNativeDriver: true }),
        Animated.timing(contentTranslateY, { toValue: 0, duration: 220, easing: easeOut, useNativeDriver: true }),
      ]).start();
    });
  }

  // ── Row navigation ────────────────────────────────────────────────────────
  function goRow(item) {
    if (item.soon) return;
    if (item.nav === "tab-only") {
      navigation?.getParent?.()?.navigate?.(item.tab);
    } else if (item.nav === "tab") {
      navigation?.getParent?.()?.navigate?.(item.tab, { screen: item.screen });
    } else if (item.nav === "share") {
      Share.share({
        message: "Join me on Safar — the companion app for Hajj & Umrah. Download here: https://safar.app (link coming soon)",
        title: "Join me on Safar",
      }).catch(() => {});
    } else {
      navigation.navigate(item.target, item.params);
    }
  }

  return (
    <View style={styles.root}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Image
          source={cfg.image}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
        <LinearGradient
          colors={cfg.gradientColors}
          locations={cfg.gradientLocations}
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
        {/* Animated text overlay — fades on tab switch */}
        <Animated.View style={[styles.headerContent, headerAnimStyle]}>
          <View style={styles.titleRow}>
            <View style={styles.iconBadge}>
              <cfg.Icon size={22} color="#C8A96A" weight="regular" />
            </View>
            <Text style={styles.headerTitle}>{cfg.title}</Text>
          </View>
          <Text style={styles.headerSub}>{cfg.sub}</Text>
        </Animated.View>
      </View>

      {/* ── Sub-nav pills ──────────────────────────────────────────────────── */}
      <View style={styles.pillsBar}>
        {TABS.map((tabKey) => (
          <PillButton
            key={tabKey}
            isActive={tabKey === activeTab}
            pillBg={TAB_CONFIG[tabKey].pillBg}
            label={TAB_CONFIG[tabKey].label}
            onPress={() => handleTabPress(tabKey)}
          />
        ))}
      </View>

      {/* ── Content — animated wrapper so scroll position resets cleanly ───── */}
      <Animated.View style={[styles.scrollWrapper, contentAnimStyle]}>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero card — Plan tab only */}
          {activeTab === "plan" && tripState !== null ? (
            <TouchableOpacity
              style={styles.heroCard}
              activeOpacity={0.88}
              onPress={() => navigation.navigate("SafarAssist")}
            >
              <LinearGradient
                colors={["#1A202E", "#101828"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.heroGradient}
              >
                {tripState === "has_date" ? (
                  <View style={styles.heroPad}>
                    <Text style={styles.heroEyebrow}>YOUR JOURNEY BEGINS SOON</Text>
                    <Text style={styles.heroBigNum}>{days !== null ? String(days) : "—"}</Text>
                    <Text style={styles.heroDaysLabel}>days until departure</Text>
                    <Text style={styles.heroCta}>Review details →</Text>
                  </View>
                ) : tripState === "no_date" ? (
                  <View style={styles.heroPad}>
                    <Text style={styles.heroEyebrow}>TRIP COUNTDOWN</Text>
                    <Text style={styles.heroCardTitle}>Trip details saved — add your dates</Text>
                    <Text style={styles.heroCta}>Review details →</Text>
                  </View>
                ) : (
                  <View style={styles.heroPad}>
                    <Text style={styles.heroEyebrow}>SAFAR ASSIST</Text>
                    <Text style={styles.heroCardTitle}>Set up your trip in seconds</Text>
                    <Text style={styles.heroCardSub}>Import your travel details — we do the rest.</Text>
                    <Text style={styles.heroCta}>Import details →</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ) : null}

          {/* List rows */}
          <View style={styles.card}>
            {cfg.rows.map((item, idx) => (
              <TouchableOpacity
                key={item.key}
                style={idx < cfg.rows.length - 1 ? [styles.row, styles.rowBorder] : styles.row}
                activeOpacity={item.soon ? 1 : 0.75}
                disabled={item.soon}
                onPress={() => goRow(item)}
              >
                <View style={item.soon ? [styles.rowIcon, styles.rowIconDim, { backgroundColor: cfg.rowIconBg }] : [styles.rowIcon, { backgroundColor: cfg.rowIconBg }]}>
                  <item.Icon size={24} color="#C8A96A" weight="regular" />
                </View>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  <Text style={styles.rowSub}>{item.sub}</Text>
                </View>
                {item.soon ? (
                  <View style={styles.soonBadge}>
                    <Text style={styles.soonText}>SOON</Text>
                  </View>
                ) : item.nav === "share" ? (
                  <ArrowSquareOut size={18} color="#C8BFB2" weight="regular" />
                ) : (
                  <CaretRight size={18} color="#C8BFB2" weight="bold" />
                )}
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </Animated.View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: "#EDE6D8" },
  // Header
  header:        { height: 260, overflow: "hidden", backgroundColor: "#000000" },
  backBtn:       { position: "absolute", left: 18, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" },
  headerContent: { position: "absolute", bottom: 22, left: 20, right: 20 },
  titleRow:      { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  iconBadge:     { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: "#C8A96A", alignItems: "center", justifyContent: "center" },
  headerTitle:   { fontFamily: "SourceSerif4-Regular", fontSize: 38, color: "#FFFFFF", fontWeight: "600" },
  headerSub:     { fontSize: 15, color: "rgba(255,255,255,0.82)", lineHeight: 22, maxWidth: "88%" },
  // Pills
  pillsBar:      { backgroundColor: "#FDFAF4", paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#DDD5C8", gap: 4 },
  pillWrapper:   { flex: 1 },
  pill:          { alignItems: "center", paddingVertical: 10 },
  pillActive:    { alignItems: "center", borderRadius: 22, paddingVertical: 10 },
  pillText:      { fontSize: 15, fontWeight: "400", color: "#8A7A6A" },
  pillTextActive:{ fontSize: 15, fontWeight: "600", color: "#FFFFFF" },
  // Scroll
  scrollWrapper: { flex: 1 },
  scroll:        { flex: 1 },
  scrollContent: { paddingTop: 10, paddingHorizontal: 0 },
  // Hero card
  heroCard:      { borderRadius: 16, marginHorizontal: 18, marginBottom: 16, overflow: "hidden" },
  heroGradient:  { borderRadius: 16 },
  heroPad:       { paddingHorizontal: 20, paddingVertical: 10 },
  heroEyebrow:   { fontSize: 10, fontWeight: "700", letterSpacing: 1.2, color: "#C8A96A", marginBottom: 4 },
  heroBigNum:    { fontFamily: "SourceSerif4-Regular", fontSize: 34, color: "#FFFFFF", marginBottom: 2 },
  heroDaysLabel: { fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 0 },
  heroCardTitle: { fontFamily: "SourceSerif4-Regular", fontSize: 20, color: "#FFFFFF", marginBottom: 6 },
  heroCardSub:   { fontSize: 13, color: "rgba(255,255,255,0.72)", lineHeight: 19 },
  heroCta:       { fontSize: 14, fontWeight: "600", color: "#C8A96A", marginTop: 6 },
  // List card
  card:          { backgroundColor: "#FDFAF4", borderTopLeftRadius: 24, borderTopRightRadius: 24, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, overflow: "hidden", paddingBottom: 8, marginHorizontal: 11, shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  row:           { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 16, backgroundColor: "#FDFAF4" },
  rowBorder:     { borderBottomWidth: 1, borderBottomColor: "#EDE4D4" },
  rowIcon:       { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", marginRight: 16 },
  rowIconDim:    { opacity: 0.4 },
  rowInfo:       { flex: 1 },
  rowLabel:      { fontFamily: "SourceSerif4-Regular", fontSize: 17, color: "#1C1A14", marginBottom: 3 },
  rowSub:        { fontSize: 13, color: "#5C534A", lineHeight: 18 },
  soonBadge:     { backgroundColor: "#EDE4D4", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  soonText:      { fontSize: 10, fontWeight: "700", letterSpacing: 0.8, color: "#8A7D70" },
  bottomSpacer:  { height: 40 },
});
