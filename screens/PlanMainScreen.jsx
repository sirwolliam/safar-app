import React from "react";
import {
  View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Share,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SafarAssistCard from "../SafarAssistCard";
import {
  CaretLeft, CaretRight, ArrowSquareOut,
  ListChecks, Compass, ShoppingBag, AddressBook,
  PlayCircle, Link, PushPin, NotePencil, CurrencyDollar, CalendarBlank,
} from "phosphor-react-native";

const SERIF = "SourceSerif4-Regular";
const ICON_BG = "#2E4560";
const HEADER_IMAGE = require("../assets/hub-headers/plan-header.png");
const GRADIENT = ["transparent", "transparent", "rgba(26,32,46,0.68)", "rgba(26,32,46,0.96)"];
const GRADIENT_LOCS = [0, 0.44, 0.72, 1];

const ROWS = [
  { key: "expect",    Icon: Compass,        label: "What to Expect",     sub: "Crowds, climate, what it really feels like", nav: "stack", target: "WhatToExpect"                       },
  { key: "calendar",  Icon: CalendarBlank,  label: "Calendar",           sub: "Track dates, milestones and reminders",      nav: "stack", target: "Calendar"                           },
  { key: "checklist", Icon: ListChecks,     label: "Checklist",          sub: "Pack and prepare, nothing missed",           nav: "stack", target: "Checklists"                          },
  { key: "shop",      Icon: ShoppingBag,    label: "Shop",               sub: "Essentials for your journey",                nav: "stack", target: "Shop"                               },
  { key: "contacts",  Icon: AddressBook,    label: "Contacts",           sub: "Hotel, group leader, agent",                 nav: "tab",   tab: "Connect", screen: "MyContacts"          },
  { key: "media",     Icon: PlayCircle,     label: "Media",              sub: "Videos, articles and podcasts",              nav: "tab",   tab: "Learn",   screen: "Media"               },
  { key: "resources", Icon: Link,           label: "Official Resources", sub: "Government and authority links",             nav: "stack", target: "OfficialResourcesScreen" },
  { key: "board",     Icon: PushPin,        label: "My Board",           sub: "Notes, checklists, and saved content",        nav: "stack", target: "MyBoard"                           },
  { key: "notes",     Icon: NotePencil,     label: "Notes",              sub: "Reflections and intentions",                 nav: "stack", target: "Notes"                             },
  { key: "currency",  Icon: CurrencyDollar, label: "Currency",           sub: "Live exchange rates",                        nav: "stack", target: "CurrencyConverter"                 },
];

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
    navigation?.getParent?.()?.navigate?.(item.tab, {
      screen: item.screen,
      initial: false,
      params: { returnToTab: "Plan" },
    });
    return;
  }
  if (item.params) {
    navigation.navigate(item.target, item.params);
    return;
  }
  navigation.navigate(item.target);
}

export default function PlanMainScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Image
          source={HEADER_IMAGE}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" }}
          resizeMode="cover"
          fadeDuration={0}
        />
        <LinearGradient
          colors={GRADIENT}
          locations={GRADIENT_LOCS}
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
            <Text style={styles.headerTitle}>{"Plan"}</Text>
          </View>
          <Text style={styles.headerSub}>{"Get everything ready — documents, packing, contacts, money."}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {ROWS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.row}
            activeOpacity={item.soon ? 1 : 0.75}
            disabled={item.soon}
            onPress={() => goRow(item, navigation)}
          >
            <View style={item.soon ? [styles.rowIcon, styles.rowIconDim, { backgroundColor: ICON_BG }] : [styles.rowIcon, { backgroundColor: ICON_BG }]}>
              <item.Icon size={24} color="#C8A96A" weight="regular" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Text style={styles.rowSub}>{item.sub}</Text>
            </View>
            {item.soon ? (
              <View style={styles.soonBadge}>
                <Text style={styles.soonText}>{"SOON"}</Text>
              </View>
            ) : item.nav === "share" ? (
              <ArrowSquareOut size={18} color="#C8BFB2" weight="regular" />
            ) : (
              <CaretRight size={18} color="#C8BFB2" weight="bold" />
            )}
          </TouchableOpacity>
        ))}
        <View style={{ marginHorizontal: 16 }}>
          <SafarAssistCard
            title="Import with Safar Assist"
            subtitle="Bring in your calendar, checklists, contacts, and documents"
            tagline="Speak it, scan it, or upload it"
            onPress={() => navigation.navigate("SafarAssist")}
          />
        </View>
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: "#EDE6D8" },
  header:        { height: 260, overflow: "hidden", position: "relative", backgroundColor: "#1A1410" },
  backBtn:       { position: "absolute", left: 18, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" },
  headerContent: { position: "absolute", bottom: 22, left: 20, right: 20 },
  titleRow:      { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  iconBadge:     { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: "#C8A96A", alignItems: "center", justifyContent: "center" },
  headerTitle:   { fontFamily: SERIF, fontSize: 38, color: "#FFFFFF", fontWeight: "600" },
  headerSub:     { fontSize: 15, color: "rgba(255,255,255,0.82)", lineHeight: 22, maxWidth: "88%" },
  scroll:        { flex: 1 },
  scrollContent: { paddingTop: 10, paddingHorizontal: 0 },
  row:           { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 16, backgroundColor: "#FDFAF4", borderRadius: 16, marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: "#EDE4D4", shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  rowIcon:       { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", marginRight: 16 },
  rowIconDim:    { opacity: 0.4 },
  rowInfo:       { flex: 1 },
  rowLabel:      { fontSize: 19, color: "#1C1A14", marginBottom: 3 },
  rowSub:        { fontSize: 13, color: "#5C534A", lineHeight: 18 },
  soonBadge:     { backgroundColor: "#EDE4D4", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  soonText:      { fontSize: 10, fontWeight: "700", letterSpacing: 0.8, color: "#8A7D70" },
  bottomSpacer:  { height: 40 },
});
