import React, { useState, useEffect } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  ImageBackground, Image, StyleSheet, Dimensions, Modal,
} from "react-native";
import { colors, spacing, radius, typography, shadows } from "../theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OnboardingCarousel from "../components/OnboardingCarousel";

const SERIF = "SourceSerif4-Regular";
const { width: SW, height: SH } = Dimensions.get("window");
const PLAN_STARTED_KEY    = "safar_plan_started_v1";
const ONBOARDED_KEY       = "safar_onboarded_v1";
const HERO_H = Math.round(SH * 0.40);
const TILE_W = (SW - spacing(2.5) * 2 - spacing(1) * 2) / 3;

const CONTENT_TILES = [
  { id:"expect", label:"What to Expect", sub:"Rituals, health & travel tips", screen:"WhatToExpect", image:require("../assets/prepare2.png") },
  { id:"learn",  label:"Practice & Learn", sub:"Recite & memorise duas",  screen:"PracticeLearn", image:require("../assets/journey3.png") },
  { id:"duas",   label:"My Duas",           sub:"Your saved du\u02bf\u0101\u02be lists",   screen:"Duas",          image:require("../assets/duas2.png") },
];

// ── What is Safar overlay ─────────────────────────────────────────────────────
function AboutModal({ visible, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={ab.overlay} activeOpacity={1} onPress={onClose}>
        <View style={ab.card} onStartShouldSetResponder={() => true}>
          <View style={ab.iconRow}>
            <Text style={ab.icon}>{"\uD83D\uDD4B"}</Text>
          </View>
          <Text style={ab.title}>What is Safar?</Text>
          <Text style={ab.body}>
            Safar is here to help you plan, organise and prepare for your sacred Umrah or Hajj journey.{"\n\n"}
            Create a custom step-by-step plan so you don{"\u2019"}t miss a thing, pin contacts for your hotel, guide and travel group, take personal notes, and track your progress through every ritual.{"\n\n"}
            Join groups with fellow pilgrims to share milestones, learn and practise the most important du{"\u02bf\u0101\u02be"}s, and carry the guidance of scholars in your pocket every step of the way.{"\n\n"}
            May Allah accept your journey. {"\uD83C\uDF3F"}
          </Text>
          <TouchableOpacity style={ab.btn} onPress={onClose} activeOpacity={0.85}>
            <Text style={ab.btnText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const ab = StyleSheet.create({
  overlay: { flex:1, backgroundColor:"rgba(0,0,0,0.55)", alignItems:"center", justifyContent:"center", paddingHorizontal:spacing(3) },
  card:    { backgroundColor:colors.card, borderRadius:20, padding:spacing(3), width:"100%", maxWidth:360 },
  iconRow: { alignItems:"center", marginBottom:spacing(1.5) },
  icon:    { fontSize:32 },
  title:   { fontFamily:SERIF, fontSize:22, color:colors.text, textAlign:"center", marginBottom:spacing(1.5) },
  body:    { fontSize:typography.body, color:colors.subtext, lineHeight:24, fontWeight:"400", textAlign:"left" },
  btn:     { marginTop:spacing(2.5), backgroundColor:colors.primary, borderRadius:radius.md, paddingVertical:spacing(1.5), alignItems:"center" },
  btnText: { fontFamily:SERIF, fontSize:typography.body, color:"#fff", fontWeight:"500" },
});

// ── Groups icon ───────────────────────────────────────────────────────────────
function GroupsIconCircle() {
  return (
    <View style={{ width:42, height:42, borderRadius:21, backgroundColor:"rgba(47,93,80,0.12)", alignItems:"center", justifyContent:"center" }}>
      <Text style={{ fontSize:20 }}>{"\uD83D\uDC65"}</Text>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const [planStarted,    setPlanStarted]    = useState(null);
  const [showAbout,      setShowAbout]      = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check plan started
    AsyncStorage.getItem(PLAN_STARTED_KEY)
      .then(v => setPlanStarted(v === "true"))
      .catch(() => setPlanStarted(false));

    // Check onboarding — show carousel only if never seen before
    AsyncStorage.getItem(ONBOARDED_KEY)
      .then(v => { if (v !== "true") setShowOnboarding(true); })
      .catch(() => setShowOnboarding(true));
  }, []);

  const handlePlanPress = async () => {
    if (!planStarted) {
      await AsyncStorage.setItem(PLAN_STARTED_KEY, "true");
      setPlanStarted(true);
    }
    navigation?.navigate?.("Journey");
  };

  const handleOnboardingComplete = async () => {
    await AsyncStorage.setItem(ONBOARDED_KEY, "true").catch(() => {});
    setShowOnboarding(false);
  };

  const planBtnLabel = planStarted === null ? "Loading..."
    : planStarted ? "View My Plan" : "Create Your Plan";

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} bounces>

        {/* ── Hero ── */}
        <View style={s.heroWrap}>
          <ImageBackground
            source={require("../assets/homescreen_hero2.jpg")}
            style={s.hero}
            imageStyle={s.heroImg}
          >
            {/* Top content row: Safar title + About button */}
            <View style={s.heroTopRow}>
              <View>
                <Text style={s.appName}>Safar</Text>
                <Text style={s.appTagline}>Your Journey, Step by Step</Text>
              </View>
              <TouchableOpacity style={s.aboutBtn} onPress={() => setShowAbout(true)} activeOpacity={0.85}>
                <Text style={s.aboutBtnText}>?</Text>
              </TouchableOpacity>
            </View>

          </ImageBackground>

          {/* ── My Plan card overlapping hero ── */}
          <View style={s.planCard}>
            <View style={s.planTopRow}>
              <View style={s.planTitleBlock}>
                <Text style={s.planTitle}>My Plan</Text>
                <Text style={s.planSub}>
                  {planStarted ? "Prepare for a meaningful journey" : "Helping you prepare for a meaningful journey"}
                </Text>
              </View>
              <TouchableOpacity
                style={!planStarted ? [s.planBtn, s.planBtnCreate] : s.planBtn}
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
                <View key={i} style={i < 4 ? [s.progSeg, s.progSegFill] : s.progSeg} />
              ))}
            </View>
          </View>
        </View>

        {/* ── Body ── */}
        <View style={s.body}>

          {/* Image tiles */}
          <View style={s.tilesRow}>
            {CONTENT_TILES.map(tile => (
              <TouchableOpacity key={tile.id} style={s.tile} activeOpacity={0.88}
                onPress={() => navigation?.navigate?.(tile.screen)}>
                <Image source={tile.image} style={s.tileImg} resizeMode="cover" />
                <View style={s.tileBody}>
                  <Text style={s.tileLabel}>{tile.label}</Text>
                  <Text style={s.tileSub}>{tile.sub}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Connect & Focus — centered label + cards, plain bg ── */}
          <View style={s.connectWrap}>
            <Text style={s.connectLabel}>Connect & Focus</Text>
            <View style={s.actionRow}>
              <TouchableOpacity style={s.actionCard} activeOpacity={0.88}
                onPress={() => navigation?.navigate?.("Groups")}>
                <GroupsIconCircle />
                <View style={s.actionText}>
                  <Text style={s.actionTitle}>Groups</Text>
                  <Text style={s.actionSub}>Share milestones together</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={s.actionCard} activeOpacity={0.88}
                onPress={() => navigation?.navigate?.("Focus")}>
                <View style={{ width:42, height:42, borderRadius:21, backgroundColor:"rgba(47,93,80,0.12)", alignItems:"center", justifyContent:"center" }}>
                  <Text style={{ fontSize:20 }}>{"\uD83C\uDF19"}</Text>
                </View>
                <View style={s.actionText}>
                  <Text style={s.actionTitle}>Focus Mode</Text>
                  <Text style={s.actionSub}>Count rounds · stay present</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </ScrollView>

      <AboutModal visible={showAbout} onClose={() => setShowAbout(false)} />
      <OnboardingCarousel
        visible={showOnboarding}
        onComplete={handleOnboardingComplete}
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex:1, backgroundColor:"#fff" },
  scroll: { paddingBottom:0 },

  // Hero
  heroWrap: {},
  hero:     { width:"100%", height:HERO_H, justifyContent:"flex-start" },
  heroImg:  { resizeMode:"cover" },

  // Hero top row
  heroTopRow: {
    flexDirection:"row",
    alignItems:"flex-start",
    justifyContent:"space-between",
    paddingHorizontal:spacing(2.5),
    paddingTop:spacing(1.5),
  },
  appName:    { fontFamily:SERIF, fontSize:42, fontWeight:"400", color:colors.text, lineHeight:48 },
  appTagline: { fontSize:14, color:colors.primary, fontWeight:"400", marginTop:1 },
  aboutBtn:   {
    width:34, height:34, borderRadius:17,
    backgroundColor:"rgba(255,255,255,0.88)",
    borderWidth:1, borderColor:"rgba(47,93,80,0.25)",
    alignItems:"center", justifyContent:"center",
    marginTop:spacing(0.5),
  },
  aboutBtnText: { fontSize:16, color:colors.primary, fontWeight:"700", lineHeight:20 },

  // Plan card
  planCard: {
    backgroundColor:colors.card, borderRadius:16,
    marginHorizontal:spacing(2.5), marginTop:-spacing(2.5) - 28,
    shadowColor:"#1A1408", shadowOffset:{width:0,height:4},
    shadowOpacity:0.13, shadowRadius:14, elevation:7,
    paddingHorizontal:spacing(2.25), paddingVertical:spacing(1.5),
  },
  planTopRow:    { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:spacing(1.25) },
  planTitleBlock:{ flex:1, paddingRight:spacing(1) },
  planTitle:     { fontFamily:SERIF, fontSize:typography.heading, fontWeight:"400", color:colors.text, marginBottom:2 },
  planSub:       { fontSize:typography.small, color:"#6A5E50", fontWeight:"400" },
  planBtn:       { backgroundColor:colors.primary, borderRadius:radius.pill, paddingHorizontal:spacing(1.75), paddingVertical:spacing(0.875), flexShrink:0 },
  planBtnCreate: { backgroundColor:"#1E4A3A" },
  planBtnText:   { fontSize:typography.small, color:"#fff", fontWeight:"500" },
  planDivider:   { height:1, backgroundColor:colors.border, marginBottom:spacing(1.25) },
  planStepsRow:  { flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:spacing(1) },
  planStepsLabel:{ fontFamily:SERIF, fontSize:typography.body, color:"#4A3E30" },
  planStepsCount:{ fontFamily:SERIF, fontSize:typography.body, color:colors.primary, fontWeight:"500" },
  progTrack:     { flexDirection:"row", gap:3 },
  progSeg:       { flex:1, height:6, borderRadius:3, backgroundColor:colors.border },
  progSegFill:   { backgroundColor:colors.primary },

  // Body — pulled up to show action cards without scrolling
  body: { backgroundColor:colors.background, paddingHorizontal:spacing(2.5), paddingTop:spacing(2), marginTop:spacing(1) },

  // Tiles — +1pt on label and sub
  tilesRow: { flexDirection:"row", gap:spacing(1), marginBottom:spacing(2) },
  tile:     { width:TILE_W, borderRadius:radius.md, overflow:"hidden", backgroundColor:colors.card, borderWidth:1, borderColor:colors.border },
  tileImg:  { width:"100%", height:72 },
  tileBody: { padding:spacing(1), alignItems:"center" },
  tileLabel:{ fontFamily:SERIF, fontSize:12, fontWeight:"400", color:colors.text, lineHeight:16, marginBottom:2, textAlign:"center" },
  tileSub:  { fontSize:11, color:"#6A5E50", fontWeight:"400", lineHeight:15, textAlign:"center" },

  // Connect & Focus — plain wrapper, centered label
  connectWrap: {
    marginTop: spacing(0.5),
    paddingBottom: spacing(1.5),
  },
  connectLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
    color: "#6A5E50",
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: spacing(1.25),
  },

  // Action cards
  actionRow:  { flexDirection:"row", gap:spacing(1.25) },
  actionCard: {
    flex:1, flexDirection:"row", alignItems:"center", gap:spacing(1.25),
    backgroundColor:colors.card, borderRadius:radius.lg,
    borderWidth:1, borderColor:colors.border,
    padding:spacing(1.5),
  },
  actionText: { flex:1 },
  actionTitle:{ fontFamily:SERIF, fontSize:typography.small, color:colors.text, marginBottom:2 },
  actionSub:  { fontSize:10, color:"#6A5E50", fontWeight:"400", lineHeight:13 },
});
