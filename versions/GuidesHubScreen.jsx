/**
 * GuidesHubScreen.jsx — Safar
 * Clean landing that routes to the Umrah and Hajj step-by-step guides.
 * (Distinct from the retired GuidesScreen monolith.)
 * Two rich image cards — guides are showcase content, so imagery fits.
 *
 * NOTE: asset paths follow the project's naming convention. If a require()
 * throws, swap to an image that exists in /assets.
 */
import React from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ImageBackground,
} from "react-native";
import { CaretLeft } from "phosphor-react-native";
import { colors, spacing, radius, shadows } from "../theme";

const SERIF = "SourceSerif4-Regular";

export default function GuidesHubScreen({ navigation }) {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.8}>
          <CaretLeft size={20} color={colors.text} weight="bold" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Guides</Text>
          <Text style={s.headerSub}>Step-by-step for every rite</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.intro}>
          {"Choose your pilgrimage for a full, step-by-step guide \u2014 each rite explained in order, with du\u02bf\u0101s and tips."}
        </Text>

        {/* Umrah */}
        <TouchableOpacity
          style={s.card}
          activeOpacity={0.88}
          onPress={() => navigation?.navigate?.("UmrahGuide")}
        >
          <ImageBackground
            source={require("../assets/tawaf.jpg")}
            style={s.cardBg}
            imageStyle={{ borderRadius: 16 }}
            resizeMode="cover"
          >
            <View style={s.scrim} />
            <View style={s.cardContent}>
              <Text style={s.eyebrow}>UMRAH</Text>
              <Text style={s.cardTitle}>{"Umrah Guide"}</Text>
              <Text style={s.cardSub}>{"Every step of \u02bfUmrah, in order"}</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* Hajj */}
        <TouchableOpacity
          style={s.card}
          activeOpacity={0.88}
          onPress={() => navigation?.navigate?.("HajjGuide")}
        >
          <ImageBackground
            source={require("../assets/arafah.jpg")}
            style={s.cardBg}
            imageStyle={{ borderRadius: 16 }}
            resizeMode="cover"
          >
            <View style={s.scrim} />
            <View style={s.cardContent}>
              <Text style={s.eyebrow}>HAJJ</Text>
              <Text style={s.cardTitle}>{"Hajj Guide"}</Text>
              <Text style={s.cardSub}>{"The full pilgrimage, day by day"}</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* What to Expect — secondary, compact */}
        <TouchableOpacity
          style={s.compactRow}
          activeOpacity={0.8}
          onPress={() => navigation?.navigate?.("WhatToExpect")}
        >
          <View style={s.compactInfo}>
            <Text style={s.compactTitle}>What to Expect</Text>
            <Text style={s.compactSub}>Crowds, climate, and what it really feels like</Text>
          </View>
          <Text style={s.compactArrow}>{"\u203a"}</Text>
        </TouchableOpacity>
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
  scroll:      { padding: spacing(2.5), gap: spacing(1.5) },
  intro:       { fontSize: 15, color: colors.subtext, lineHeight: 22, marginBottom: spacing(0.5) },

  card:        { height: 160, borderRadius: 16, overflow: "hidden", ...shadows.card },
  cardBg:      { flex: 1, justifyContent: "flex-end" },
  scrim:       { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(8,14,6,0.42)", borderRadius: 16 },
  cardContent: { padding: 18 },
  eyebrow:     { fontSize: 10, color: "rgba(255,255,255,0.72)", fontWeight: "700", letterSpacing: 1.5, marginBottom: 6 },
  cardTitle:   { fontFamily: SERIF, fontSize: 26, color: "#fff", fontWeight: "600", marginBottom: 3 },
  cardSub:     { fontSize: 13, color: "rgba(255,255,255,0.82)" },

  compactRow:  { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing(2), paddingVertical: spacing(1.75), ...shadows.card },
  compactInfo: { flex: 1 },
  compactTitle:{ fontFamily: SERIF, fontSize: 17, color: colors.text, marginBottom: 2 },
  compactSub:  { fontSize: 13, color: colors.subtext, lineHeight: 17 },
  compactArrow:{ fontSize: 22, color: colors.border, paddingLeft: 8 },
});
