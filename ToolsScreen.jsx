/**
 * ToolsScreen.jsx — Safar
 * Small utility landing: Prayer Times, Qibla, Currency.
 * Icon-row layout (matches the app's list pattern) — no heavy imagery,
 * since these are quick-access tools, not showcase content.
 */
import React from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from "react-native";
import { Clock, Compass, CurrencyDollar, CaretRight, CaretLeft } from "phosphor-react-native";
import { colors, spacing, radius, shadows } from "../theme";

const SERIF = "SourceSerif4-Regular";

const TOOLS = [
  { id: "prayer",   label: "Prayer Times", sub: "Today\u2019s schedule and the next prayer", Icon: Clock,          screen: "PrayerTimes" },
  { id: "qibla",    label: "Qibla",        sub: "Find the direction of the Ka\u02bfbah",       Icon: Compass,        screen: "Qibla" },
  { id: "currency", label: "Currency",     sub: "Live exchange rates for your trip",          Icon: CurrencyDollar, screen: "CurrencyConverter" },
];

export default function ToolsScreen({ navigation }) {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.8}>
          <CaretLeft size={20} color={colors.text} weight="bold" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Tools</Text>
          <Text style={s.headerSub}>Quick utilities for your journey</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.card}>
          {TOOLS.map((t, idx) => (
            <TouchableOpacity
              key={t.id}
              style={idx < TOOLS.length - 1 ? [s.row, s.rowBorder] : s.row}
              activeOpacity={0.75}
              onPress={() => navigation?.navigate?.(t.screen)}
            >
              <View style={s.rowIcon}>
                <t.Icon size={22} color={colors.primary} weight="regular" />
              </View>
              <View style={s.rowInfo}>
                <Text style={s.rowLabel}>{t.label}</Text>
                <Text style={s.rowSub}>{t.sub}</Text>
              </View>
              <CaretRight size={18} color={colors.border} weight="bold" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: colors.background },
  header:      { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing(2.5), paddingTop: spacing(2), paddingBottom: spacing(1.5), borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.background },
  backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  headerCenter:{ flex: 1, alignItems: "center" },
  headerTitle: { fontFamily: SERIF, fontSize: 22, color: colors.text, fontWeight: "400" },
  headerSub:   { fontSize: 12, color: colors.subtext, marginTop: 2 },
  scroll:      { padding: spacing(2.5) },
  card:        { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: "hidden", ...shadows.card },
  row:         { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing(2), paddingVertical: spacing(1.75) },
  rowBorder:   { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowIcon:     { width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(47,93,80,0.10)", alignItems: "center", justifyContent: "center", marginRight: spacing(1.5) },
  rowInfo:     { flex: 1 },
  rowLabel:    { fontFamily: SERIF, fontSize: 17, color: colors.text, fontWeight: "400", marginBottom: 2 },
  rowSub:      { fontSize: 13, color: colors.subtext, lineHeight: 17 },
});
