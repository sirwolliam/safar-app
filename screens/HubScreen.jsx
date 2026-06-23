/**
 * HubScreen.jsx — Safar
 * Reusable Four-Pillars hub. One component, four configs (Learn/Practise/Plan/Connect).
 * A hub is a feature-discovery directory: one-line purpose + a list of the features
 * inside that pillar, each tapping through to a REAL registered screen.
 *
 * Navigation rules (from TDD):
 *   - same-stack screen  → navigation.navigate("Name")
 *   - different tab       → navigation.getParent()?.navigate("TabName", { screen, params })
 * Each link declares its `nav` so we call the right one. Only screens that are
 * actually registered are linked — no dead ends.
 *
 * Rule 1: StyleSheet at module level, literal values only.
 * Rule 8: Phosphor icons only (verified to exist in phosphor-react-native).
 */
import React from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from "react-native";
import {
  BookOpen, Compass, MapPin, Sparkle, Books,
  Moon, ArrowsClockwise, PersonSimpleWalk, Heartbeat,
  ClipboardText, ListChecks, AddressBook, CurrencyDollar, Printer,
  UsersThree, ShareNetwork, UserCircle,
  CaretRight, CaretLeft,
} from "phosphor-react-native";

// ── Pillar configs ───────────────────────────────────────────────────────────
// nav: "stack" = navigation.navigate(target)
//      "tab"   = navigation.getParent()?.navigate(tab, { screen, params })
export const HUBS = {
  learn: {
    title: "Learn",
    blurb: "Understand the rites before you go \u2014 step by step, at your pace.",
    bg: "#1C2B1E", circleA: "#2F5D50", circleB: "#1E3D34",
    items: [
      { Icon: Compass,  label: "Umrah Guide",    sub: "Every step of \u02bfUmrah, in order",        nav:"stack", target:"UmrahGuide" },
      { Icon: Compass,  label: "Hajj Guide",     sub: "The full pilgrimage, day by day",            nav:"stack", target:"HajjGuide" },
      { Icon: BookOpen, label: "What to Expect", sub: "Crowds, climate, what it really feels like", nav:"stack", target:"WhatToExpect" },
      { Icon: MapPin,   label: "Sacred Places",  sub: "Map of the holy sites",                       nav:"tab", tab:"Journey", screen:"Map" },
      { Icon: Books,    label: "Du\u02bf\u0101 Library", sub: "Supplications for every moment",       nav:"tab", tab:"Duas", screen:"MyDuas" },
    ],
  },
  practise: {
    title: "Practise",
    blurb: "Rehearse the rites and keep your remembrance \u2014 calm, guided, hands-free.",
    bg: "#2A1F0E", circleA: "#5D4A20", circleB: "#3D3010",
    items: [
      { Icon: Moon,             label: "Focus Mode", sub: "A quiet space for worship",          nav:"tab", tab:"Focus" },
      { Icon: ArrowsClockwise,  label: "\u1e6caw\u0101f Counter", sub: "Track your seven circuits", nav:"tab", tab:"Focus", screen:"Tawaf" },
      { Icon: PersonSimpleWalk, label: "Sa\u02bfy Counter", sub: "\u1e62af\u0101 to Marwah, seven times", nav:"tab", tab:"Focus", screen:"Saiy" },
      { Icon: Heartbeat,        label: "Dhikr Counter", sub: "Count your remembrance",            nav:"tab", tab:"Focus", screen:"Dhikr" },
    ],
  },
  plan: {
    title: "Plan",
    blurb: "Get everything ready \u2014 documents, packing, contacts, money.",
    bg: "#1A202E", circleA: "#203050", circleB: "#101828",
    items: [
      { Icon: ClipboardText,  label: "My Board",   sub: "Your trip at a glance",          nav:"tab", tab:"Journey", screen:"MyBoard" },
      { Icon: ListChecks,     label: "Checklist",  sub: "Pack and prepare, nothing missed", nav:"stack", target:"PracticeLearn" },
      { Icon: AddressBook,    label: "My Contacts", sub: "Hotel, group leader, agent",      nav:"tab", tab:"Journey", screen:"MyContacts" },
      { Icon: CurrencyDollar, label: "Currency",   sub: "Live exchange rates",             nav:"tab", tab:"Prepare", screen:"CurrencyConverter" },
      { Icon: Printer,        label: "Print / Offline", sub: "Take your du\u02bf\u0101s offline", nav:"stack", target:"PrintOffline" },
    ],
  },
  connect: {
    title: "Connect",
    blurb: "Stay close to your group and share the journey with those you love.",
    bg: "#221820", circleA: "#3D2040", circleB: "#22182A",
    items: [
      { Icon: UsersThree,   label: "Groups",      sub: "Coordinate with your travel group", nav:"tab", tab:"Journey", screen:"Groups" },
      { Icon: UserCircle,   label: "Connections", sub: "People on the journey with you",     nav:"tab", tab:"Journey", screen:"Connections" },
      { Icon: AddressBook,  label: "My Contacts", sub: "Key people and numbers",             nav:"tab", tab:"Journey", screen:"MyContacts" },
    ],
  },
};

function go(navigation, item) {
  if (item.soon) return;
  if (item.nav === "tab") {
    const params = item.screen ? { screen: item.screen, params: item.params } : undefined;
    navigation?.getParent?.()?.navigate?.(item.tab, params);
  } else {
    navigation?.navigate?.(item.target, item.params);
  }
}

export default function HubScreen({ route, navigation }) {
  const key = route?.params?.hub ?? "learn";
  const cfg = HUBS[key] ?? HUBS.learn;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header band in the pillar's colour */}
      <View style={[styles.hero, { backgroundColor: cfg.bg }]}>
        <View style={[styles.circle, styles.circleA, { backgroundColor: cfg.circleA }]} />
        <View style={[styles.circle, styles.circleB, { backgroundColor: cfg.circleB }]} />
        <View style={styles.heroTop}>
          <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.backBtn} activeOpacity={0.8}>
            <CaretLeft size={20} color="#F5F0E8" weight="bold" />
          </TouchableOpacity>
        </View>
        <View style={styles.heroBody}>
          <Text style={styles.heroTitle}>{cfg.title}</Text>
          <Text style={styles.heroBlurb}>{cfg.blurb}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {cfg.items.map((item, idx) => (
            <TouchableOpacity
              key={item.label}
              style={idx < cfg.items.length - 1 ? [styles.row, styles.rowBorder] : styles.row}
              activeOpacity={item.soon ? 1 : 0.75}
              disabled={item.soon}
              onPress={() => go(navigation, item)}
            >
              <View style={[styles.rowIcon, { backgroundColor: cfg.bg }, item.soon ? styles.dim : null]}>
                <item.Icon size={20} color="#C8A96A" weight="regular" />
              </View>
              <View style={styles.rowInfo}>
                <Text style={item.soon ? [styles.rowLabel, styles.dimText] : styles.rowLabel}>{item.label}</Text>
                <Text style={styles.rowSub}>{item.sub}</Text>
              </View>
              {item.soon ? (
                <View style={styles.soonPill}><Text style={styles.soonTxt}>SOON</Text></View>
              ) : (
                <CaretRight size={18} color="#C8BFB2" weight="bold" />
              )}
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: "#F5F0E8" },
  hero:      { paddingTop: 8, paddingBottom: 26, paddingHorizontal: 20, overflow: "hidden" },
  circle:    { position: "absolute", borderRadius: 999, opacity: 0.5 },
  circleA:   { width: 180, height: 180, top: -60, right: -40 },
  circleB:   { width: 120, height: 120, bottom: -50, left: -20 },
  heroTop:   { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  backBtn:   { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  heroBody:  { marginTop: 6 },
  heroTitle: { fontFamily: "SourceSerif4-Regular", fontSize: 32, color: "#FFFFFF", fontWeight: "600", marginBottom: 6 },
  heroBlurb: { fontSize: 14, color: "rgba(245,240,232,0.78)", lineHeight: 20, maxWidth: "92%" },
  scroll:    { padding: 20 },
  card:      { backgroundColor: "#FDFAF4", borderRadius: 18, borderWidth: 1, borderColor: "#C8BFB2", overflow: "hidden" },
  row:       { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 15, backgroundColor: "#FDFAF4" },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#EDE4D4" },
  rowIcon:   { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 14 },
  rowInfo:   { flex: 1 },
  rowLabel:  { fontFamily: "SourceSerif4-Regular", fontSize: 17, color: "#1C1A14", fontWeight: "400", marginBottom: 2 },
  rowSub:    { fontSize: 13, color: "#5C534A", lineHeight: 17 },
  dim:       { opacity: 0.4 },
  dimText:   { color: "#8A7D70" },
  soonPill:  { backgroundColor: "#EDE4D4", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  soonTxt:   { fontSize: 9, fontWeight: "700", letterSpacing: 1, color: "#8A7D70" },
});
