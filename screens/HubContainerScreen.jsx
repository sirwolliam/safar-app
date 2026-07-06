/**
 * HubContainerScreen.jsx — Safar
 * Unified hub container. All four pillar views managed via state — no navigation
 * between pillars. Header image crossfades on pillar switch.
 *
 * Coding rules: StyleSheet.create at module level, literal values only.
 * No && in style arrays — ternaries only. Phosphor icons verified.
 */
import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, Image, ScrollView, TouchableOpacity, StyleSheet,
  Animated, Share,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CaretLeft, CaretRight, ArrowSquareOut,
  ListChecks, Compass, ShoppingBag, AddressBook,
  PlayCircle, Link, BookmarkSimple, NotePencil, CurrencyDollar,
  BookOpen, Cube, MapPin, Books,
  PersonSimpleRun, HandsPraying, Sparkle,
  UsersThree, ShareNetwork, Bell, ShareFat,
} from "phosphor-react-native";

const SERIF = "SourceSerif4-Regular";

// ── Pre-require images at module level ────────────────────────────────────────
const PLAN_IMAGE     = require("../assets/hub-headers/plan-header.png");
const LEARN_IMAGE    = require("../assets/hub-headers/learn-header.png");
const PRACTICE_IMAGE = require("../assets/hub-headers/practice-header.png");
const CONNECT_IMAGE  = require("../assets/hub-headers/connect-header.png");

// ── AsyncStorage keys (hero card — Plan only) ─────────────────────────────────
const DEPARTURE_KEY = "safar_departure_date_v1";
const BOARD_KEY     = "safar_journey_board_v1";

// ── Pillar configuration ──────────────────────────────────────────────────────
const PILLAR_CONFIG = {
  plan: {
    image:             PLAN_IMAGE,
    gradient:          ["transparent", "transparent", "rgba(26,32,46,0.68)", "rgba(26,32,46,0.96)"],
    gradientLocations: [0, 0.44, 0.72, 1],
    pillColor:         "#2E4560",
    iconBg:            "#2E4560",
    Icon:              ListChecks,
    title:             "Plan",
    subtitle:          "Get everything ready — documents, packing, contacts, money.",
    hasHeroCard:       true,
    rows: [
      { key: "expect",    Icon: Compass,        label: "What to Expect",     sub: "Crowds, climate, what it really feels like", nav: "stack", target: "WhatToExpect"      },
      { key: "checklist", Icon: ListChecks,     label: "Checklist",          sub: "Pack and prepare, nothing missed",           soon: true                                },
      { key: "shop",      Icon: ShoppingBag,    label: "Shop",               sub: "Essentials for your journey",                nav: "stack", target: "Shop"              },
      { key: "contacts",  Icon: AddressBook,    label: "Contacts",           sub: "Hotel, group leader, agent",                 nav: "tab",   tab: "Journey", screen: "MyContacts" },
      { key: "media",     Icon: PlayCircle,     label: "Media",              sub: "Videos, articles and podcasts",              nav: "stack", target: "Media"             },
      { key: "resources", Icon: Link,           label: "Official Resources", sub: "Government and authority links",             soon: true                                },
      { key: "bookmarks", Icon: BookmarkSimple, label: "Bookmarks",          sub: "Your saved content",                         nav: "tab",   tab: "Prepare", screen: "Bookmarks" },
      { key: "notes",     Icon: NotePencil,     label: "Notes",              sub: "Reflections and intentions",                 nav: "stack", target: "Notes"             },
      { key: "currency",  Icon: CurrencyDollar, label: "Currency",           sub: "Live exchange rates",                        nav: "stack", target: "CurrencyConverter" },
    ],
  },
  learn: {
    image:             LEARN_IMAGE,
    gradient:          ["transparent", "transparent", "rgba(28,43,30,0.68)", "rgba(28,43,30,0.96)"],
    gradientLocations: [0, 0.44, 0.72, 1],
    pillColor:         "#2D4F32",
    iconBg:            "#2D4F32",
    Icon:              BookOpen,
    title:             "Learn",
    subtitle:          "Understand the rites before you go — step by step, at your pace.",
    hasHeroCard:       false,
    rows: [
      { key: "umrah",  Icon: Compass,  label: "Umrah Guide",     sub: "Every step of ʿUmrah, in order",            nav: "stack", target: "UmrahGuide"  },
      { key: "hajj",   Icon: Cube,     label: "Hajj Guide",      sub: "The full pilgrimage, day by day",                nav: "stack", target: "HajjGuide"   },
      { key: "expect", Icon: BookOpen, label: "What to Expect",  sub: "Crowds, climate, what it really feels like",     nav: "stack", target: "WhatToExpect" },
      { key: "sacred", Icon: MapPin,   label: "Sacred Places",   sub: "Map of the holy sites",                          nav: "stack", target: "SacredPlaces" },
      { key: "dualib", Icon: Books,    label: "Duʿā Library", sub: "Supplications for every moment",          nav: "tab",   tab: "Duas", screen: "MyDuas" },
    ],
  },
  practice: {
    image:             PRACTICE_IMAGE,
    gradient:          ["transparent", "transparent", "rgba(42,31,14,0.68)", "rgba(42,31,14,0.96)"],
    gradientLocations: [0, 0.44, 0.72, 1],
    pillColor:         "#4E3414",
    iconBg:            "#4E3414",
    Icon:              PersonSimpleRun,
    title:             "Practice",
    subtitle:          "Rehearse the rites and keep your remembrance — calm, guided, hands-free.",
    hasHeroCard:       false,
    rows: [
      { key: "umrahduas", Icon: HandsPraying, label: "Umrah Duʿās",  sub: "Supplications for every step of ʿUmrah", nav: "stack", target: "PilgrimageDuas", params: { mode: "umrah" } },
      { key: "hajjduas",  Icon: Sparkle,      label: "Ḥajj Duʿās",   sub: "Supplications for every step of Ḥajj",  nav: "stack", target: "PilgrimageDuas", params: { mode: "hajj"  } },
      { key: "audio",     Icon: PlayCircle,   label: "Audio Practice",         sub: "Listen and rehearse before you go",           nav: "stack", target: "PracticeLearn"                            },
      { key: "dualib",    Icon: Books,        label: "Duʿā Library", sub: "Supplications for every moment",              nav: "tab",   tab: "Duas", screen: "MyDuas"                      },
      { key: "media",     Icon: PlayCircle,   label: "Media",                  sub: "Videos and podcasts for your preparation",    nav: "stack", target: "Media"                                    },
    ],
  },
  connect: {
    image:             CONNECT_IMAGE,
    gradient:          ["transparent", "transparent", "rgba(34,24,32,0.68)", "rgba(34,24,32,0.96)"],
    gradientLocations: [0, 0.44, 0.72, 1],
    pillColor:         "#3D2240",
    iconBg:            "#3D2240",
    Icon:              UsersThree,
    title:             "Connect",
    subtitle:          "Stay close to your group and share the journey with those you love.",
    hasHeroCard:       false,
    rows: [
      { key: "groups",        Icon: UsersThree,   label: "Groups",        sub: "Coordinate with your travel group",         nav: "tab",   tab: "Journey", screen: "Groups"      },
      { key: "connections",   Icon: ShareNetwork, label: "Connections",   sub: "People on the journey with you",            nav: "tab",   tab: "Journey", screen: "Connections" },
      { key: "contacts",      Icon: AddressBook,  label: "My Contacts",   sub: "Hotel, guide, agent and key numbers",       nav: "tab",   tab: "Journey", screen: "MyContacts"  },
      { key: "notifications", Icon: Bell,         label: "Notifications", sub: "Group invites and connection requests",     nav: "stack", target: "Notifications"               },
      { key: "share",         Icon: ShareFat,     label: "Share Safar",   sub: "Invite friends and family to join you",     nav: "share"                                        },
    ],
  },
};

// ── Pill order ────────────────────────────────────────────────────────────────
const PILLS = [
  { key: "plan",     label: "Plan"     },
  { key: "learn",    label: "Learn"    },
  { key: "practice", label: "Practice" },
  { key: "connect",  label: "Connect"  },
];

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

function goRow(item, navigation) {
  if (item.soon) return;
  if (item.nav === "share") {
    Share.share({
      message: "Join me on Safar — the companion app for Hajj & Umrah. Download here: https://safar.app (link coming soon)",
      title: "Join me on Safar",
    });
    return;
  }
  if (item.nav === "tab") {
    navigation?.getParent?.()?.navigate?.(item.tab, { screen: item.screen });
    return;
  }
  if (item.params) {
    navigation.navigate(item.target, item.params);
    return;
  }
  navigation.navigate(item.target);
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function HubContainerScreen({ navigation, route }) {
  const initialPillar = route?.params?.pillar ?? "plan";
  const insets = useSafeAreaInsets();

  const [activePillar,    setActivePillar]    = useState(initialPillar);
  const [displayedImage,  setDisplayedImage]  = useState(PILLAR_CONFIG[initialPillar].image);

  useEffect(() => {
    const incoming = route?.params?.pillar;
    if (incoming && incoming !== activePillar) {
      setActivePillar(incoming);
      setDisplayedImage(
        PILLAR_CONFIG[incoming]?.image ??
        PILLAR_CONFIG["plan"].image
      );
    }
  }, [route?.params?.pillar]);

  // Hero card state (Plan only, loaded once on mount)
  const [tripState, setTripState] = useState(null);
  const [depDate,   setDepDate]   = useState(null);

  const imageScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(imageScale, {
          toValue: 1.08,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(imageScale, {
          toValue: 1.0,
          duration: 8000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

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

  const days = depDate ? daysUntil(depDate) : null;

  function switchPillar(key) {
    if (key === activePillar) return;
    setDisplayedImage(PILLAR_CONFIG[key].image);
    setActivePillar(key);
  }

  const config     = PILLAR_CONFIG[activePillar];
  const PillarIcon = config.Icon;
  const rows       = config.rows;

  return (
    <View style={styles.root}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            { transform: [{ scale: imageScale }] }
          ]}
        >
          <Image
            source={displayedImage}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            resizeMode="cover"
            fadeDuration={0}
          />
        </Animated.View>
        <LinearGradient
          colors={config.gradient}
          locations={config.gradientLocations}
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
              <PillarIcon size={22} color="#C8A96A" weight="regular" />
            </View>
            <Text style={styles.headerTitle}>{config.title}</Text>
          </View>
          <Text style={styles.headerSub}>{config.subtitle}</Text>
        </View>
      </View>

      {/* ── Sub-nav pills ────────────────────────────────────────────────── */}
      <View style={styles.pillsBar}>
        {PILLS.map((p) => {
          const active = p.key === activePillar;
          return (
            <TouchableOpacity
              key={p.key}
              style={active ? [styles.pillActive, { backgroundColor: PILLAR_CONFIG[activePillar].pillColor }] : styles.pill}
              activeOpacity={active ? 1 : 0.7}
              onPress={() => switchPillar(p.key)}
            >
              <Text style={active ? styles.pillTextActive : styles.pillText}>
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── ScrollView ───────────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero card — Plan only */}
        {config.hasHeroCard ? (
          tripState !== null ? (
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
                    <View style={styles.heroLeft}>
                      <Text style={styles.heroEyebrow}>YOUR JOURNEY BEGINS SOON</Text>
                      <Text style={styles.heroCta}>Review details →</Text>
                    </View>
                    <View style={styles.heroRight}>
                      <Text style={styles.heroBigNum}>
                        {days !== null ? String(days) : "—"}
                      </Text>
                      <Text style={styles.heroDaysSmall}>days</Text>
                    </View>
                  </View>
                ) : tripState === "no_date" ? (
                  <View style={styles.heroPad}>
                    <View style={styles.heroLeft}>
                      <Text style={styles.heroEyebrow}>TRIP COUNTDOWN</Text>
                      <Text style={styles.heroCardTitle}>
                        Trip details saved — add your dates
                      </Text>
                      <Text style={styles.heroCta}>Review details →</Text>
                    </View>
                    <View style={styles.heroRight} />
                  </View>
                ) : (
                  <View style={styles.heroPad}>
                    <View style={styles.heroLeft}>
                      <Text style={styles.heroEyebrow}>SAFAR ASSIST</Text>
                      <Text style={styles.heroCardTitle}>
                        Set up your trip in seconds
                      </Text>
                      <Text style={styles.heroCardSub}>
                        Import your travel details — we do the rest.
                      </Text>
                      <Text style={styles.heroCta}>Import details  →</Text>
                    </View>
                    <View style={styles.heroRight} />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ) : null
        ) : null}

        {/* List card */}
        <View style={styles.card}>
          {rows.map((item, idx) => (
            <TouchableOpacity
              key={item.key}
              style={idx < rows.length - 1 ? [styles.row, styles.rowBorder] : styles.row}
              activeOpacity={item.soon ? 1 : 0.75}
              disabled={item.soon}
              onPress={() => goRow(item, navigation)}
            >
              <View style={item.soon ? [styles.rowIcon, styles.rowIconDim, { backgroundColor: config.iconBg }] : [styles.rowIcon, { backgroundColor: config.iconBg }]}>
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
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: "#EDE6D8" },
  // Header
  header:        { height: 260, overflow: "hidden", position: "relative", backgroundColor: "#1A1410" },
  headerImg:     { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" },
  backBtn:       { position: "absolute", left: 18, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" },
  headerContent: { position: "absolute", bottom: 22, left: 20, right: 20 },
  titleRow:      { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  iconBadge:     { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: "#C8A96A", alignItems: "center", justifyContent: "center" },
  headerTitle:   { fontFamily: SERIF, fontSize: 38, color: "#FFFFFF", fontWeight: "600" },
  headerSub:     { fontSize: 15, color: "rgba(255,255,255,0.82)", lineHeight: 22, maxWidth: "88%" },
  // Pills
  pillsBar:      { backgroundColor: "#FDFAF4", paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#DDD5C8", gap: 4 },
  pill:          { flex: 1, alignItems: "center", paddingVertical: 10 },
  pillActive:    { flex: 1, alignItems: "center", borderRadius: 22, paddingVertical: 10 },
  pillText:      { fontSize: 15, fontWeight: "400", color: "#8A7A6A" },
  pillTextActive:{ fontSize: 15, fontWeight: "600", color: "#FFFFFF" },
  // Scroll
  scroll:        { flex: 1 },
  scrollContent: { paddingTop: 10, paddingHorizontal: 0 },
  // Hero card
  heroCard:      { borderRadius: 16, marginHorizontal: 18, marginTop: 0, marginBottom: 16, overflow: "hidden" },
  heroGradient:  { borderRadius: 16 },
  heroPad:       { paddingHorizontal: 20, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heroLeft:      { flex: 1, marginRight: 16 },
  heroRight:     { alignItems: "center", justifyContent: "center" },
  heroEyebrow:   { fontSize: 10, fontWeight: "700", letterSpacing: 1.2, color: "#C8A96A", marginBottom: 6 },
  heroBigNum:    { fontSize: 42, color: "#FFFFFF", lineHeight: 44 },
  heroDaysSmall: { fontSize: 11, color: "rgba(255,255,255,0.7)", textAlign: "center", marginTop: 2 },
  heroCardTitle: { fontSize: 20, color: "#FFFFFF", marginBottom: 6 },
  heroCardSub:   { fontSize: 13, color: "rgba(255,255,255,0.72)", lineHeight: 19 },
  heroCta:       { fontSize: 14, fontWeight: "600", color: "#C8A96A", marginTop: 12 },
  // List card
  card:          { backgroundColor: "#FDFAF4", borderRadius: 20, overflow: "hidden", paddingBottom: 8, marginHorizontal: 16, shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  row:           { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 16, backgroundColor: "#FDFAF4" },
  rowBorder:     { borderBottomWidth: 1, borderBottomColor: "#EDE4D4" },
  rowIcon:       { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", marginRight: 16 },
  rowIconDim:    { opacity: 0.4 },
  rowInfo:       { flex: 1 },
  rowLabel:      { fontSize: 19, color: "#1C1A14", marginBottom: 3 },
  rowSub:        { fontSize: 13, color: "#5C534A", lineHeight: 18 },
  soonBadge:     { backgroundColor: "#EDE4D4", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  soonText:      { fontSize: 10, fontWeight: "700", letterSpacing: 0.8, color: "#8A7D70" },
  bottomSpacer:  { height: 40 },
});
