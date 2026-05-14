import React, { useState, useEffect } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  ImageBackground, Image, StyleSheet, Dimensions,
} from "react-native";
import { colors, spacing, radius, typography, shadows } from "../theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SERIF = "SourceSerif4-Regular";
const { width: SW, height: SH } = Dimensions.get("window");
const PLAN_STARTED_KEY = "safar_plan_started_v1";

// ── Content tiles — image-based ───────────────────────────────────────────────
const CONTENT_TILES = [
  {
    id: "duas",
    label: "My Duas",
    sub: "Lists you've created",
    screen: "Duas",
    image: require("../assets/duas2.png"),
  },
  {
    id: "expect",
    label: "What to Expect",
    sub: "Learn each step",
    screen: "WhatToExpect",
    image: require("../assets/prepare2.png"),
  },
  {
    id: "learn",
    label: "Practice & Learn",
    sub: "Audio, recite, repeat",
    screen: "PracticeLearn",
    image: require("../assets/journey3.png"),
  },
];

// ── Groups icon SVG-ish using unicode ─────────────────────────────────────────
function GroupsIconCircle() {
  return (
    <View style={ic.wrap}>
      <Text style={ic.text}>{"\uD83D\uDC65"}</Text>
    </View>
  );
}
const ic = StyleSheet.create({
  wrap: { width:42, height:42, borderRadius:21, backgroundColor:"rgba(47,93,80,0.12)", alignItems:"center", justifyContent:"center" },
  text: { fontSize:20 },
});

export default function HomeScreen({ navigation }) {
  const [planStarted, setPlanStarted] = useState(null); // null = loading

  useEffect(() => {
    AsyncStorage.getItem(PLAN_STARTED_KEY)
      .then(v => setPlanStarted(v === "true"))
      .catch(() => setPlanStarted(false));
  }, []);

  const handlePlanPress = async () => {
    if (!planStarted) {
      await AsyncStorage.setItem(PLAN_STARTED_KEY, "true");
      setPlanStarted(true);
    }
    navigation?.navigate?.("Journey");
  };

  const planBtnLabel = planStarted === null
    ? "Loading..."
    : planStarted
      ? "View My Plan"
      : "Create Your Plan";

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} bounces>

        {/* ── Hero ── */}
        <View style={s.heroWrap}>
          <ImageBackground
            source={require("../assets/kaaba_sunset.png")}
            style={s.hero}
            imageStyle={s.heroImg}
          >
            {/* White fade top — stacked layers */}
            <View style={s.topFade} pointerEvents="none">
              <View style={s.fadeL1} />
              <View style={s.fadeL2} />
              <View style={s.fadeL3} />
              <View style={s.fadeL4} />
            </View>

            {/* Dark scrim bottom */}
            <View style={s.bottomScrim} pointerEvents="none" />

            {/* Safar title over white fade */}
            <View style={s.heroTop}>
              <Text style={s.appName}>Safar</Text>
              <Text style={s.appTagline}>Your Journey, Step by Step</Text>
            </View>

            {/* Greeting bottom */}
            <View style={s.heroBottom}>
              <Text style={s.leafEmoji}>{"\uD83C\uDF3F"}</Text>
              <Text style={s.greetText}>Assalamu alaykum</Text>
            </View>
          </ImageBackground>

          {/* ── My Plan card — compact, overlapping hero ── */}
          <View style={s.planCard}>
            <View style={s.planTopRow}>
              <View style={s.planTitleBlock}>
                <Text style={s.planTitle}>My Plan</Text>
                <Text style={s.planSub}>
                  {planStarted
                    ? "Prepare for a meaningful journey"
                    : "Helping you prepare for a meaningful journey"}
                </Text>
              </View>
              <TouchableOpacity
                style={[s.planBtn, !planStarted && s.planBtnCreate]}
                onPress={handlePlanPress}
                activeOpacity={0.85}
              >
                <Text style={s.planBtnText}>{planBtnLabel}</Text>
              </TouchableOpacity>
            </View>

            <View style={s.planDivider} />

            <View style={s.planStepsRow}>
              <Text style={s.planStepsLabel}>Steps completed</Text>
              <Text style={s.planStepsCount}>4 of 12</Text>
            </View>
            <View style={s.progTrack}>
              {Array.from({length:12},(_,i) => (
                <View key={i} style={[s.progSeg, i < 4 && s.progSegFill]} />
              ))}
            </View>
          </View>
        </View>

        {/* ── Body ── */}
        <View style={s.body}>

          {/* ── 3 image-based content tiles ── */}
          <View style={s.tilesRow}>
            {CONTENT_TILES.map(tile => (
              <TouchableOpacity
                key={tile.id}
                style={s.tile}
                activeOpacity={0.88}
                onPress={() => navigation?.navigate?.(tile.screen)}
              >
                <Image source={tile.image} style={s.tileImg} resizeMode="cover" />
                <View style={s.tileBody}>
                  <Text style={s.tileLabel}>{tile.label}</Text>
                  <Text style={s.tileSub}>{tile.sub}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Groups + Focus Mode — 2-column icon cards ── */}
          <View style={s.actionRow}>

            {/* Groups */}
            <TouchableOpacity
              style={s.actionCard}
              activeOpacity={0.88}
              onPress={() => navigation?.navigate?.("Groups")}
            >
              <GroupsIconCircle />
              <View style={s.actionText}>
                <Text style={s.actionTitle}>Groups</Text>
                <Text style={s.actionSub}>Your pilgrimage family</Text>
              </View>
            </TouchableOpacity>

            {/* Focus Mode */}
            <TouchableOpacity
              style={s.actionCard}
              activeOpacity={0.88}
              onPress={() => navigation?.navigate?.("Focus")}
            >
              <View style={s.focusIconCircle}>
                <Text style={s.focusIconText}>{"\uD83C\uDF19"}</Text>
              </View>
              <View style={s.actionText}>
                <Text style={s.actionTitle}>Focus Mode</Text>
                <Text style={s.actionSub}>Distraction-free duas</Text>
              </View>
            </TouchableOpacity>

          </View>

          <View style={{ height: spacing(4) }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const HERO_H = Math.round(SH * 0.50);
const TILE_W = (SW - spacing(2.5) * 2 - spacing(1) * 2) / 3;

const s = StyleSheet.create({
  safe:   { flex:1, backgroundColor:"#fff" },
  scroll: { paddingBottom:0 },

  // ── Hero ──
  heroWrap: {},
  hero: { width:"100%", height:HERO_H, justifyContent:"space-between" },
  heroImg: { resizeMode:"cover", left:"6%", width:"118%" },

  // White top fade
  topFade:  { position:"absolute", top:0, left:0, right:0, height:Math.round(HERO_H*0.38), overflow:"hidden" },
  fadeL1:   { flex:1, backgroundColor:"rgba(255,255,255,0.97)" },
  fadeL2:   { flex:1, backgroundColor:"rgba(255,255,255,0.78)" },
  fadeL3:   { flex:1, backgroundColor:"rgba(255,255,255,0.40)" },
  fadeL4:   { flex:1, backgroundColor:"rgba(255,255,255,0.10)" },

  // Dark bottom scrim
  bottomScrim: { position:"absolute", bottom:0, left:0, right:0, height:Math.round(HERO_H*0.32), backgroundColor:"rgba(8,6,2,0.18)" },

  // Safar title area
  heroTop: { paddingHorizontal:spacing(2.5), paddingTop:spacing(1.5) },
  appName: { fontFamily:SERIF, fontSize:42, fontWeight:"400", color:colors.text, lineHeight:48 },
  appTagline: { fontSize:14, color:colors.primary, fontWeight:"400", marginTop:1 },

  // Greeting
  heroBottom: { flexDirection:"row", alignItems:"center", gap:spacing(0.75), paddingHorizontal:spacing(2.5), paddingBottom:spacing(3) },
  leafEmoji:  { fontSize:16 },
  greetText:  {
    fontFamily:SERIF, fontSize:typography.title, color:"#fff",
    textShadowColor:"rgba(0,0,0,0.4)", textShadowOffset:{width:0,height:1}, textShadowRadius:6,
  },

  // ── Plan card ──
  planCard: {
    backgroundColor:colors.card, borderRadius:16,
    marginHorizontal:spacing(2.5), marginTop:-spacing(2.5),
    shadowColor:"#1A1408", shadowOffset:{width:0,height:4},
    shadowOpacity:0.13, shadowRadius:14, elevation:7,
    paddingHorizontal:spacing(2.25), paddingVertical:spacing(1.75),
  },
  planTopRow:   { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:spacing(1.25) },
  planTitleBlock:{ flex:1, paddingRight:spacing(1) },
  planTitle:    { fontFamily:SERIF, fontSize:typography.heading, fontWeight:"400", color:colors.text, marginBottom:2 },
  planSub:      { fontSize:typography.small, color:colors.subtext, fontWeight:"300" },

  // Plan button — green for "View", darker for "Create"
  planBtn: {
    backgroundColor:colors.primary, borderRadius:radius.pill,
    paddingHorizontal:spacing(1.75), paddingVertical:spacing(0.875),
    ...shadows.button, flexShrink:0,
  },
  planBtnCreate: { backgroundColor:"#1E4A3A" },
  planBtnText:   { fontSize:typography.small, color:"#fff", fontWeight:"500" },

  planDivider:   { height:1, backgroundColor:colors.border, marginBottom:spacing(1.25) },
  planStepsRow:  { flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:spacing(1) },
  planStepsLabel:{ fontFamily:SERIF, fontSize:typography.body, color:colors.text },
  planStepsCount:{ fontFamily:SERIF, fontSize:typography.body, color:colors.primary, fontWeight:"500" },
  progTrack:     { flexDirection:"row", gap:3 },
  progSeg:       { flex:1, height:6, borderRadius:3, backgroundColor:colors.border },
  progSegFill:   { backgroundColor:colors.primary },

  // ── Body ──
  body: { backgroundColor:colors.background, paddingHorizontal:spacing(2.5), paddingTop:spacing(2.5), marginTop:spacing(2) },

  // ── Image tiles ──
  tilesRow: { flexDirection:"row", gap:spacing(1), marginBottom:spacing(1.5) },
  tile: {
    width:TILE_W, borderRadius:radius.md, overflow:"hidden",
    backgroundColor:colors.card, borderWidth:1, borderColor:colors.border,
    ...shadows.card,
  },
  tileImg:  { width:"100%", height:90 },
  tileBody: { padding:spacing(1) },
  tileLabel:{ fontFamily:SERIF, fontSize:10, fontWeight:"400", color:colors.text, lineHeight:14, marginBottom:2 },
  tileSub:  { fontSize:9, color:colors.subtext, fontWeight:"300", lineHeight:13 },

  // ── Action cards (Groups + Focus) ──
  actionRow: { flexDirection:"row", gap:spacing(1.25) },
  actionCard: {
    flex:1, flexDirection:"row", alignItems:"center", gap:spacing(1.25),
    backgroundColor:colors.card, borderRadius:radius.lg,
    borderWidth:1, borderColor:colors.border,
    padding:spacing(1.5), ...shadows.card,
  },
  actionText:  { flex:1 },
  actionTitle: { fontFamily:SERIF, fontSize:typography.small, color:colors.text, marginBottom:2 },
  actionSub:   { fontSize:9, color:colors.subtext, fontWeight:"300", lineHeight:13 },

  focusIconCircle: { width:42, height:42, borderRadius:21, backgroundColor:"rgba(47,93,80,0.12)", alignItems:"center", justifyContent:"center" },
  focusIconText:   { fontSize:20 },
});
