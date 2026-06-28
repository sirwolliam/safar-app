/**
 * PlanHubScreen.jsx — Safar
 * Plan pillar hub. Photo header + gradient overlay + sub-nav pills + SafarAssist hero card + list rows.
 * Reference implementation for the four-hub template.
 *
 * Coding rules: StyleSheet.create at module level, literal values only.
 * No && in style arrays — ternaries only. Phosphor icons verified.
 */
import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CaretLeft, CaretRight,
  ListChecks, Compass, ShoppingBag, AddressBook,
  PlayCircle, Link, BookmarkSimple, NotePencil, CurrencyDollar,
} from "phosphor-react-native";

const HEADER_IMAGE = require("../assets/hub-headers/plan-header.png");

// ── AsyncStorage keys ─────────────────────────────────────────────────────────
const DEPARTURE_KEY = "safar_departure_date_v1";
const BOARD_KEY     = "safar_journey_board_v1";

// ── Pills config ──────────────────────────────────────────────────────────────
const PILLS = [
  { label: "Plan",     route: "PlanHub"     },
  { label: "Learn",    route: "LearnHub"    },
  { label: "Practice", route: "PracticeHub" },
  { label: "Connect",  route: "ConnectHub"  },
];

// ── List rows ─────────────────────────────────────────────────────────────────
const ROWS = [
  { key: "expect",    Icon: Compass,        label: "What to Expect",     sub: "Crowds, climate, what it really feels like", nav: "stack", target: "WhatToExpect" },
  { key: "checklist", Icon: ListChecks,     label: "Checklist",          sub: "Pack and prepare, nothing missed",           soon: true },
  { key: "shop",      Icon: ShoppingBag,    label: "Shop",               sub: "Essentials for your journey",                nav: "stack", target: "Shop" },
  { key: "contacts",  Icon: AddressBook,    label: "Contacts",           sub: "Hotel, group leader, agent",                 nav: "tab",   tab: "Journey", screen: "MyContacts" },
  { key: "media",     Icon: PlayCircle,     label: "Media",              sub: "Videos, articles and podcasts",              nav: "stack", target: "Media" },
  { key: "resources", Icon: Link,           label: "Official Resources", sub: "Government and authority links",             soon: true },
  { key: "bookmarks", Icon: BookmarkSimple, label: "Bookmarks",          sub: "Your saved content",                         nav: "tab",   tab: "Prepare", screen: "Bookmarks" },
  { key: "notes",     Icon: NotePencil,     label: "Notes",              sub: "Reflections and intentions",                 nav: "stack", target: "Notes" },
  { key: "currency",  Icon: CurrencyDollar, label: "Currency",           sub: "Live exchange rates",                        nav: "stack", target: "CurrencyConverter" },
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
  if (item.nav === "tab") {
    navigation?.getParent?.()?.navigate?.(item.tab, { screen: item.screen });
  } else {
    navigation.navigate(item.target);
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function PlanHubScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [tripState, setTripState] = useState(null);
  const [depDate,   setDepDate]   = useState(null);

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

  const cardSlide   = useRef(new Animated.Value(30)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const rowOpacity  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardSlide, {
        toValue: 0,
        duration: 380,
        delay: 120,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 320,
        delay: 120,
        useNativeDriver: true,
      }),
      Animated.timing(rowOpacity, {
        toValue: 1,
        duration: 280,
        delay: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Image
          source={HEADER_IMAGE}
          defaultSource={HEADER_IMAGE}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            height: "100%",
          }}
          resizeMode="cover"
          fadeDuration={0}
        />
        <LinearGradient
          colors={[
            "transparent",
            "transparent",
            "rgba(26,32,46,0.68)",
            "rgba(26,32,46,0.96)",
          ]}
          locations={[0, 0.42, 0.74, 1]}
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
              <ListChecks size={22} color="#C8A96A" weight="regular" />
            </View>
            <Text style={styles.headerTitle}>Plan</Text>
          </View>
          <Text style={styles.headerSub}>
            Get everything ready — documents, packing, contacts, money.
          </Text>
        </View>
      </View>

      {/* ── Sub-nav pills ────────────────────────────────────────────────── */}
      <View style={styles.pillsBar}>
        {PILLS.map((p) => {
          const active = p.route === "PlanHub";
          return (
            <TouchableOpacity
              key={p.route}
              style={active ? styles.pillActive : styles.pill}
              activeOpacity={active ? 1 : 0.7}
              onPress={() => active ? null : navigation.replace(p.route)}
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
        <Animated.View style={{ opacity: cardOpacity, transform: [{ translateY: cardSlide }] }}>
          {tripState !== null ? (
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
          ) : null}
        </Animated.View>

        {/* List card */}
        <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ translateY: cardSlide }] }]}>
          <Animated.View style={{ opacity: rowOpacity }}>
            {ROWS.map((item, idx) => (
              <TouchableOpacity
                key={item.key}
                style={idx < ROWS.length - 1 ? [styles.row, styles.rowBorder] : styles.row}
                activeOpacity={item.soon ? 1 : 0.75}
                disabled={item.soon}
                onPress={() => goRow(item, navigation)}
              >
                <View style={item.soon ? [styles.rowIcon, styles.rowIconDim] : styles.rowIcon}>
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
                ) : (
                  <CaretRight size={18} color="#C8BFB2" weight="bold" />
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>
        </Animated.View>
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: "#EDE6D8" },
  // Header
  header:        { height: 260, overflow: "hidden", position: "relative", backgroundColor: "#1A202E" },
  backBtn:       { position: "absolute", left: 18, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" },
  headerContent: { position: "absolute", bottom: 22, left: 20, right: 20 },
  titleRow:      { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  iconBadge:     { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: "#C8A96A", alignItems: "center", justifyContent: "center" },
  headerTitle:   { fontFamily: "SourceSerif4-Regular", fontSize: 38, color: "#FFFFFF", fontWeight: "600" },
  headerSub:     { fontSize: 15, color: "rgba(255,255,255,0.82)", lineHeight: 22, maxWidth: "88%" },
  // Pills
  pillsBar:      { backgroundColor: "#FDFAF4", paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#DDD5C8", gap: 4 },
  pill:          { flex: 1, alignItems: "center", paddingVertical: 10 },
  pillActive:    { flex: 1, alignItems: "center", backgroundColor: "#2E4560", borderRadius: 22, paddingVertical: 10 },
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
  heroBigNum:    { fontFamily: "SourceSerif4-Regular", fontSize: 42, color: "#FFFFFF", lineHeight: 44 },
  heroDaysSmall: { fontSize: 11, color: "rgba(255,255,255,0.7)", textAlign: "center", marginTop: 2 },
  heroCardTitle: { fontFamily: "SourceSerif4-Regular", fontSize: 20, color: "#FFFFFF", marginBottom: 6 },
  heroCardSub:   { fontSize: 13, color: "rgba(255,255,255,0.72)", lineHeight: 19 },
  heroCta:       { fontSize: 14, fontWeight: "600", color: "#C8A96A", marginTop: 12 },
  // List card
  card:          { backgroundColor: "#FDFAF4", borderRadius: 20, overflow: "hidden", paddingBottom: 8, marginHorizontal: 16, shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  row:           { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 16, backgroundColor: "#FDFAF4" },
  rowBorder:     { borderBottomWidth: 1, borderBottomColor: "#EDE4D4" },
  rowIcon:       { width: 52, height: 52, borderRadius: 14, backgroundColor: "#2E4560", alignItems: "center", justifyContent: "center", marginRight: 16 },
  rowIconDim:    { opacity: 0.4 },
  rowInfo:       { flex: 1 },
  rowLabel:      { fontFamily: "SourceSerif4-Regular", fontSize: 19, color: "#1C1A14", marginBottom: 3 },
  rowSub:        { fontSize: 13, color: "#5C534A", lineHeight: 18 },
  soonBadge:     { backgroundColor: "#EDE4D4", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  soonText:      { fontSize: 10, fontWeight: "700", letterSpacing: 0.8, color: "#8A7D70" },
  bottomSpacer:  { height: 40 },
});
