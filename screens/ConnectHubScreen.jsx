/**
 * ConnectHubScreen.jsx — Safar
 * Connect pillar hub. Photo header + gradient overlay + sub-nav pills + list rows.
 *
 * Coding rules: StyleSheet.create at module level, literal values only.
 * No && in style arrays — ternaries only. Phosphor icons verified.
 */
import React, { useEffect, useRef } from "react";
import {
  View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Share, Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CaretLeft, CaretRight,
  UsersThree, ShareNetwork, AddressBook, Bell, ShareFat, ArrowSquareOut,
} from "phosphor-react-native";

const HEADER_IMAGE = require("../assets/hub-headers/connect-header.png");

// ── Pills config ──────────────────────────────────────────────────────────────
const PILLS = [
  { label: "Plan",     route: "PlanHub"     },
  { label: "Learn",    route: "LearnHub"    },
  { label: "Practice", route: "PracticeHub" },
  { label: "Connect",  route: "ConnectHub"  },
];

// ── List rows ─────────────────────────────────────────────────────────────────
const ROWS = [
  { key: "groups",        Icon: UsersThree,   label: "Groups",        sub: "Coordinate with your travel group",     nav: "parent", tab: "Journey", screen: "Groups"      },
  { key: "connections",   Icon: ShareNetwork, label: "Connections",   sub: "People on the journey with you",        nav: "parent", tab: "Journey", screen: "Connections" },
  { key: "contacts",      Icon: AddressBook,  label: "My Contacts",   sub: "Hotel, guide, agent and key numbers",  nav: "parent", tab: "Journey", screen: "MyContacts"  },
  { key: "notifications", Icon: Bell,         label: "Notifications", sub: "Group invites and connection requests", nav: "stack",  target: "Notifications"              },
  { key: "share",         Icon: ShareFat,     label: "Share Safar",   sub: "Invite friends and family to join you", nav: "share"                                        },
];

// ── Helper ────────────────────────────────────────────────────────────────────
async function goRow(item, navigation) {
  if (item.nav === "parent") {
    navigation?.getParent?.()?.navigate?.(item.tab, { screen: item.screen });
  } else if (item.nav === "stack") {
    navigation.navigate(item.target);
  } else if (item.nav === "share") {
    try {
      await Share.share({
        message: "Join me on Safar — the companion app for Hajj & Umrah. Download here: https://safar.app (link coming soon)",
        title: "Join me on Safar",
      });
    } catch (_) {}
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ConnectHubScreen({ navigation }) {
  const insets = useSafeAreaInsets();

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
            "rgba(34,24,32,0.65)",
            "rgba(34,24,32,0.96)",
          ]}
          locations={[0, 0.44, 0.72, 1]}
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
              <UsersThree size={22} color="#C8A96A" weight="regular" />
            </View>
            <Text style={styles.headerTitle}>Connect</Text>
          </View>
          <Text style={styles.headerSub}>
            Stay close to your group and share the journey with those you love.
          </Text>
        </View>
      </View>

      {/* ── Sub-nav pills ────────────────────────────────────────────────── */}
      <View style={styles.pillsBar}>
        {PILLS.map((p) => {
          const active = p.route === "ConnectHub";
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
        <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ translateY: cardSlide }] }]}>
          <Animated.View style={{ opacity: rowOpacity }}>
            {ROWS.map((item, idx) => (
              <TouchableOpacity
                key={item.key}
                style={idx < ROWS.length - 1 ? [styles.row, styles.rowBorder] : styles.row}
                activeOpacity={0.75}
                onPress={() => goRow(item, navigation)}
              >
                <View style={styles.rowIcon}>
                  <item.Icon size={24} color="#C8A96A" weight="regular" />
                </View>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  <Text style={styles.rowSub}>{item.sub}</Text>
                </View>
                {item.nav === "share" ? <ArrowSquareOut size={18} color="#C8BFB2" weight="regular" /> : <CaretRight size={18} color="#C8BFB2" weight="bold" />}
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
  header:        { height: 260, overflow: "hidden", position: "relative", backgroundColor: "#221820" },
  backBtn:       { position: "absolute", left: 18, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" },
  headerContent: { position: "absolute", bottom: 22, left: 20, right: 20 },
  titleRow:      { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  iconBadge:     { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: "#C8A96A", alignItems: "center", justifyContent: "center" },
  headerTitle:   { fontFamily: "SourceSerif4-Regular", fontSize: 38, color: "#FFFFFF", fontWeight: "600" },
  headerSub:     { fontSize: 15, color: "rgba(255,255,255,0.82)", lineHeight: 22, maxWidth: "88%" },
  // Pills
  pillsBar:      { backgroundColor: "#FDFAF4", paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#DDD5C8", gap: 4 },
  pill:          { flex: 1, alignItems: "center", paddingVertical: 10 },
  pillActive:    { flex: 1, alignItems: "center", backgroundColor: "#3D2240", borderRadius: 22, paddingVertical: 10 },
  pillText:      { fontSize: 15, fontWeight: "400", color: "#8A7A6A" },
  pillTextActive:{ fontSize: 15, fontWeight: "600", color: "#FFFFFF" },
  // Scroll
  scroll:        { flex: 1 },
  scrollContent: { paddingTop: 10, paddingHorizontal: 0 },
  // List card
  card:          { backgroundColor: "#FDFAF4", borderRadius: 20, overflow: "hidden", paddingBottom: 8, marginHorizontal: 16, shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  row:           { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 16, backgroundColor: "#FDFAF4" },
  rowBorder:     { borderBottomWidth: 1, borderBottomColor: "#EDE4D4" },
  rowIcon:       { width: 52, height: 52, borderRadius: 14, backgroundColor: "#3D2240", alignItems: "center", justifyContent: "center", marginRight: 16 },
  rowInfo:       { flex: 1 },
  rowLabel:      { fontFamily: "SourceSerif4-Regular", fontSize: 19, color: "#1C1A14", marginBottom: 3 },
  rowSub:        { fontSize: 13, color: "#5C534A", lineHeight: 18 },
  bottomSpacer:  { height: 40 },
});
