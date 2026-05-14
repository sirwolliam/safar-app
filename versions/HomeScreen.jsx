import React, { useState, useEffect } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  ImageBackground, Image, StyleSheet, Dimensions, Modal,
} from "react-native";
import { colors, spacing, radius, shadows } from "../theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OnboardingCarousel from "../components/OnboardingCarousel";

const SERIF     = "SourceSerif4-Regular";
const { width: SW, height: SH } = Dimensions.get("window");
const PLAN_STARTED_KEY  = "safar_plan_started_v1";
const ONBOARDED_KEY     = "safar_onboarded_v1";
const HERO_H = Math.round(SH * 0.36) + 50;
const TILE_W = (SW - spacing(2.5) * 2 - spacing(1.25)) / 2;

const CONTENT_TILES = [
  { id:"duas",   label:"Duas",           sub:"Browse, save and practise", screen:"Duas",         image:require("../assets/journey3.png") },
  { id:"expect", label:"What to Expect", sub:"Worship, health & travel tips", screen:"WhatToExpect", image:require("../assets/what_to_expect.jpg") },
];

// ── About modal ───────────────────────────────────────────────────────────────
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
            Create a custom step-by-step plan so you don{"\u2019"}t miss a thing, pin contacts for your hotel, guide and travel group, take personal notes, and track your progress through every ibadah.{"\n\n"}
            Join groups with fellow pilgrims to share milestones, learn and practise the most important du{"\u02bf\u0101\u02be"}s, and carry the guidance of scholars in your pocket every step of the way.{"\n\n"}
            May Allah accept your journey. {"\uD83C\uDF3F"}
          </Text>
          <TouchableOpacity style={ab.btn} onPress={onClose} activeOpacity={0.85}>
            <Text style={ab.btnTxt}>Got it</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const ab = StyleSheet.create({
  overlay: { flex:1, backgroundColor:"rgba(0,0,0,0.55)", alignItems:"center", justifyContent:"center", paddingHorizontal:24 },
  card:    { backgroundColor:"#FDFAF4", borderRadius:20, padding:24, width:"100%", maxWidth:360 },
  iconRow: { alignItems:"center", marginBottom:12 },
  icon:    { fontSize:32 },
  title:   { fontFamily:SERIF, fontSize:22, color:"#1A1712", textAlign:"center", marginBottom:12 },
  body:    { fontSize:16, color:"#5A5650", lineHeight:24, fontWeight:"400", textAlign:"left" },
  btn:     { marginTop:20, backgroundColor:"#2F5D50", borderRadius:10, paddingVertical:12, alignItems:"center" },
  btnTxt:  { fontFamily:SERIF, fontSize:16, color:"#fff", fontWeight:"500" },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const [planStarted,    setPlanStarted]    = useState(null);
  const [showAbout,      setShowAbout]      = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PLAN_STARTED_KEY)
      .then(v => setPlanStarted(v === "true"))
      .catch(() => setPlanStarted(false));
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
      <ScrollView showsVerticalScrollIndicator={false} bounces>

        {/* Hero */}
        <ImageBackground
          source={require("../assets/homescreen_hero2.jpg")}
          style={s.hero}
          resizeMode="cover">

          {/* Top row: Safar title + About button */}
          <View style={s.heroTopRow}>
            <View>
              <Text style={s.appName}>Safar</Text>
              <Text style={s.appTagline}>Your companion for Umrah and Hajj.</Text>
            </View>
            <TouchableOpacity style={s.aboutBtn} onPress={() => setShowAbout(true)} activeOpacity={0.85}>
              <Text style={s.aboutBtnTop}>What is</Text>
              <Text style={s.aboutBtnMark}>?</Text>
              <Text style={s.aboutBtnBottom}>Safar</Text>
            </TouchableOpacity>
          </View>

        </ImageBackground>

        {/* My Plan card */}
        <View style={s.planCard}>
          <View style={s.planTopRow}>
            <View style={s.planTitleBlock}>
              <Text style={s.planTitle}>My Plan</Text>
              <Text style={s.planSub}>
                {planStarted ? "My journey, step by step" : "My journey, step by step"}
              </Text>
            </View>
            <TouchableOpacity
              style={!planStarted ? [s.planBtn, s.planBtnCreate] : s.planBtn}
              onPress={handlePlanPress}
              activeOpacity={0.85}>
              <Text style={s.planBtnText}>{planBtnLabel}</Text>
            </TouchableOpacity>
          </View>
          <View style={s.planDivider} />
          <View style={s.planStepsRow}>
            <Text style={s.planStepsLabel}>Steps completed</Text>
            <Text style={s.planStepsCount}>4 of 12</Text>
          </View>
          <View style={s.progTrack}>
            {Array.from({length:12}, (_,i) => (
              <View key={i} style={i < 4 ? [s.progSeg, s.progSegFill] : s.progSeg} />
            ))}
          </View>
        </View>

        {/* Body */}
        <View style={s.body}>

          {/* Two tiles */}
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

          {/* Connect & Focus */}
          <View style={s.connectSection}>
            <Text style={s.connectLabel}>Connect & Focus</Text>
            <View style={s.actionRow}>
              <TouchableOpacity style={s.actionCard} activeOpacity={0.88}
                onPress={() => navigation?.navigate?.("Groups")}>
                <View style={s.actionIconWrap}>
                  <Text style={{ fontSize:20 }}>{"\uD83D\uDC65"}</Text>
                </View>
                <View style={s.actionText}>
                  <Text style={s.actionTitle}>Groups</Text>
                  <Text style={s.actionSub}>Share milestones and updates</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={s.actionCard} activeOpacity={0.88}
                onPress={() => navigation?.navigate?.("Focus")}>
                <View style={s.actionIconWrap}>
                  <Text style={{ fontSize:20 }}>{"\uD83C\uDF19"}</Text>
                </View>
                <View style={s.actionText}>
                  <Text style={s.actionTitle}>Focus Mode</Text>
                  <Text style={s.actionSub}>Count rounds · stay present</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height:spacing(4) }} />
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

const s = StyleSheet.create({
  safe:   { flex:1, backgroundColor:"#fff" },

  // Hero
  hero:        { width:"100%", height:HERO_H, justifyContent:"flex-start" },
  heroTopRow:  {
    flexDirection:"row", alignItems:"flex-start", justifyContent:"space-between",
    paddingHorizontal:20, paddingTop:12,
  },
  appName:    { fontFamily:SERIF, fontSize:28, fontWeight:"400", color:"#1A1712", lineHeight:34 },
  appTagline: { fontSize:14, color:"#2F5D50", fontWeight:"400", marginTop:1 },
  aboutBtn:   {
    borderRadius:10, backgroundColor:"rgba(255,255,255,0.88)",
    borderWidth:1, borderColor:"rgba(47,93,80,0.25)",
    alignItems:"center", justifyContent:"center",
    paddingHorizontal:10, paddingVertical:6,
    marginTop:4,
  },
  aboutBtnTop:    { fontSize:10, color:"#2F5D50", fontWeight:"600", letterSpacing:0.3, lineHeight:13 },
  aboutBtnMark:   { fontSize:18, color:"#2F5D50", fontWeight:"700", lineHeight:22 },
  aboutBtnBottom: { fontSize:10, color:"#2F5D50", fontWeight:"600", letterSpacing:0.3, lineHeight:13 },

  // Plan card
  planCard: {
    backgroundColor:"#FDFAF4", borderRadius:16,
    marginHorizontal:20, marginTop:-16,
    shadowColor:"#6A4A28", shadowOffset:{width:0,height:3},
    shadowOpacity:0.14, shadowRadius:8, elevation:4,
    paddingHorizontal:18, paddingVertical:14,
  },
  planTopRow:    { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:10 },
  planTitleBlock:{ flex:1, paddingRight:8 },
  planTitle:     { fontFamily:SERIF, fontSize:18, fontWeight:"400", color:"#1A1712", marginBottom:2 },
  planSub:       { fontSize:14, color:"#6A5E50", fontWeight:"400" },
  planBtn:       { backgroundColor:"#2F5D50", borderRadius:999, paddingHorizontal:14, paddingVertical:7, flexShrink:0 },
  planBtnCreate: { backgroundColor:"#1E4A3A" },
  planBtnText:   { fontSize:14, color:"#fff", fontWeight:"500" },
  planDivider:   { height:1, backgroundColor:"#D4D0CA", marginBottom:10 },
  planStepsRow:  { flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:8 },
  planStepsLabel:{ fontFamily:SERIF, fontSize:16, color:"#4A3E30" },
  planStepsCount:{ fontFamily:SERIF, fontSize:16, color:"#2F5D50", fontWeight:"500" },
  progTrack:     { flexDirection:"row", gap:3 },
  progSeg:       { flex:1, height:6, borderRadius:3, backgroundColor:"#D4D0CA" },
  progSegFill:   { backgroundColor:"#2F5D50" },

  // Body
  body: { backgroundColor:"#EDE6D8", paddingHorizontal:20, paddingTop:10, marginTop:0 },

  // Tiles
  tilesRow: { flexDirection:"row", gap:10, marginBottom:16 },
  tile:     { width:TILE_W, borderRadius:10, overflow:"hidden", backgroundColor:"#FDFAF4", borderWidth:1, borderColor:"#D4D0CA", shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4 },
  tileImg:  { width:"100%", height:78 },
  tileBody: { padding:10, alignItems:"center" },
  tileLabel:{ fontFamily:SERIF, fontSize:18, fontWeight:"400", color:"#1A1712", lineHeight:23, marginBottom:3, textAlign:"center" },
  tileSub:  { fontSize:16, color:"#6A5E50", fontWeight:"400", lineHeight:20, textAlign:"center" },

  // Connect section
  connectSection: { marginBottom:12 },
  connectLabel:   { fontSize:11, fontWeight:"700", letterSpacing:1.5, color:"#6A5E50", textTransform:"uppercase", textAlign:"center", marginBottom:10 },
  actionRow:  { flexDirection:"row", gap:10 },
  actionCard: { flex:1, flexDirection:"row", alignItems:"center", gap:10, backgroundColor:"#FDFAF4", borderRadius:12, borderWidth:1, borderColor:"#D4D0CA", padding:12, shadowColor:"#6A4A28", shadowOffset:{width:0,height:3}, shadowOpacity:0.14, shadowRadius:8, elevation:4 },
  actionIconWrap: { width:40, height:40, borderRadius:10, backgroundColor:"rgba(47,93,80,0.08)", alignItems:"center", justifyContent:"center", flexShrink:0 },
  actionText: { flex:1 },
  actionTitle:{ fontFamily:SERIF, fontSize:14, color:"#1A1712", marginBottom:2 },
  actionSub:  { fontSize:10, color:"#6A5E50", fontWeight:"400", lineHeight:13 },
});
