import React from "react";
import {
  SafeAreaView, View, Text, ScrollView,
  TouchableOpacity, ImageBackground, StyleSheet,
  Dimensions,
} from "react-native";
import { colors, spacing, radius, typography, shadows } from "../theme";

const SERIF = "SourceSerif4-Regular";
const { width: SW, height: SH } = Dimensions.get("window");

// Quick access — 4 compact tiles matching screenshot
const QUICK_ACCESS = [
  { id:"duas",   label:"My Duas",         sub:"Lists you've created",  screen:"Duas",         icon:"\u2661" },
  { id:"expect", label:"What to Expect",  sub:"Learn each step",       screen:"WhatToExpect", icon:"\u2630" },
  { id:"map",    label:"Sacred Places",   sub:"Explore & learn",       screen:"Map",           icon:"\u25ce" },
  { id:"learn",  label:"Practice & Learn",sub:"Audio, recite, repeat", screen:"PracticeLearn",icon:"\u25d1" },
];

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} bounces>

        {/* ── Hero — full screen width, zoomed right, fades top to white ── */}
        <View style={s.heroWrap}>
          <ImageBackground
            source={require("../assets/kaaba_sunset.png")}
            style={s.hero}
            imageStyle={s.heroImg}
          >
            {/* White fade at very top — stacked Views simulate gradient */}
            <View style={[s.heroTopFade, { opacity:1.0 }]} pointerEvents="none">
              <View style={s.fadeLayer1} />
              <View style={s.fadeLayer2} />
              <View style={s.fadeLayer3} />
              <View style={s.fadeLayer4} />
            </View>
            {/* Dark scrim at bottom */}
            <View style={s.heroBottomScrim} pointerEvents="none" />

            {/* Safar title — large, over the white fade at top */}
            <View style={s.heroHeader}>
              <Text style={s.appName}>Safar</Text>
              <Text style={s.appTagline}>Your Journey, Step by Step</Text>
            </View>

            {/* Assalamu alaykum greeting — bottom of hero */}
            <View style={s.heroGreeting}>
              <View style={s.greetRow}>
                <Text style={s.leafEmoji}>{"\uD83C\uDF3F"}</Text>
                <Text style={s.greetTitle}>Assalamu alaykum</Text>
              </View>
            </View>
          </ImageBackground>

          {/* My Plan card — overlaps hero bottom */}
          <TouchableOpacity
            style={s.planCard}
            activeOpacity={0.9}
            onPress={() => navigation?.navigate?.("Journey")}
          >
            <View style={s.planInner}>
              <View style={s.planTitleRow}>
                <Text style={s.planIcon}>{"\uD83D\uDCCB"}</Text>
                <View>
                  <Text style={s.planTitle}>My Plan</Text>
                  <Text style={s.planSub}>Prepare for a meaningful journey</Text>
                </View>
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
              <View style={s.viewPlanRow}>
                <Text style={s.keepGoingText}>{"Keep going\u2014you're making great progress."}</Text>
                <TouchableOpacity onPress={() => navigation?.navigate?.("Journey")} activeOpacity={0.7}>
                  <Text style={s.viewPlanLink}>{"View my plan \u2192"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Body ── */}
        <View style={s.body}>

          {/* Quick access — 4 compact tiles in a row */}
          <View style={s.qaRow}>
            {QUICK_ACCESS.map(item => (
              <TouchableOpacity
                key={item.id}
                style={s.qaItem}
                activeOpacity={0.8}
                onPress={() => navigation?.navigate?.(item.screen)}
              >
                <View style={s.qaIconWrap}>
                  <Text style={s.qaIcon}>{item.icon}</Text>
                </View>
                <Text style={s.qaLabel}>{item.label}</Text>
                <Text style={s.qaSub}>{item.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Focus Mode card */}
          <TouchableOpacity
            style={s.focusCard}
            activeOpacity={0.88}
            onPress={() => navigation?.navigate?.("Focus")}
          >
            <View style={s.focusIconWrap}>
              <Text style={s.focusIcon}>{"\uD83C\uDF19"}</Text>
            </View>
            <View style={s.focusText}>
              <Text style={s.focusTitle}>Focus Mode</Text>
              <Text style={s.focusSub}>{"Distraction-free so you can focus on your duas and be fully present."}</Text>
            </View>
            <Text style={s.focusArrow}>{"\u203a"}</Text>
          </TouchableOpacity>

          <View style={{ height: spacing(4) }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const HERO_H = Math.round(SH * 0.52); // ~52% of screen height — tall and immersive

const s = StyleSheet.create({
  safe:   { flex:1, backgroundColor:"#fff" },
  scroll: { paddingBottom:0 },

  // Hero
  heroWrap: {},
  hero: {
    width:"100%",
    height: HERO_H,
    justifyContent:"space-between",
  },
  heroImg: {
    resizeMode:"cover",
    // Shift the image right so Kaaba is close to right edge, matching screenshot
    left: "8%",
    width: "120%",
  },
  heroTopFade: {
    position:"absolute", top:0, left:0, right:0,
    height: Math.round(HERO_H * 0.42),
    overflow:"hidden",
  },
  fadeLayer1: { flex:1, backgroundColor:"rgba(255,255,255,0.98)" },
  fadeLayer2: { flex:1, backgroundColor:"rgba(255,255,255,0.80)" },
  fadeLayer3: { flex:1, backgroundColor:"rgba(255,255,255,0.45)" },
  fadeLayer4: { flex:1, backgroundColor:"rgba(255,255,255,0.12)" },
  heroBottomScrim: {
    position:"absolute", bottom:0, left:0, right:0,
    height: Math.round(HERO_H * 0.35),
    backgroundColor:"rgba(10,8,4,0.16)",
  },

  // Safar title — over the white fade at top
  heroHeader: {
    paddingHorizontal: spacing(2.5),
    paddingTop: spacing(1.5),
  },
  appName: {
    fontFamily: SERIF,
    fontSize: 42,
    fontWeight: "400",
    color: colors.text,
    lineHeight: 46,
  },
  appTagline: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "400",
    marginTop: 2,
  },

  // Greeting — bottom of hero
  heroGreeting: {
    paddingHorizontal: spacing(2.5),
    paddingBottom: spacing(3.5),
  },
  greetRow:   { flexDirection:"row", alignItems:"center", gap:spacing(1) },
  leafEmoji:  { fontSize:18 },
  greetTitle: {
    fontFamily: SERIF,
    fontSize: typography.title,
    fontWeight: "400",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width:0, height:1 },
    textShadowRadius: 6,
  },

  // Plan card
  planCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    marginHorizontal: spacing(2.5),
    marginTop: -spacing(3),
    shadowColor: "#1A1408",
    shadowOffset: { width:0, height:4 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
  },
  planInner:     { padding: spacing(2.25) },
  planTitleRow:  { flexDirection:"row", alignItems:"flex-start", gap:spacing(1.25), marginBottom:spacing(1.5) },
  planIcon:      { fontSize:24, marginTop:2 },
  planTitle:     { fontFamily:SERIF, fontSize:typography.heading, fontWeight:"400", color:colors.text, marginBottom:2 },
  planSub:       { fontSize:typography.small, color:colors.primary, fontWeight:"300" },
  planDivider:   { height:1, backgroundColor:colors.border, marginBottom:spacing(1.25) },
  planStepsRow:  { flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:spacing(1) },
  planStepsLabel:{ fontFamily:SERIF, fontSize:typography.body, color:colors.text },
  planStepsCount:{ fontFamily:SERIF, fontSize:typography.body, color:colors.primary, fontWeight:"500" },
  progTrack:     { flexDirection:"row", gap:3, marginBottom:spacing(1.25) },
  progSeg:       { flex:1, height:6, borderRadius:3, backgroundColor:colors.border },
  progSegFill:   { backgroundColor:colors.primary },
  viewPlanRow:   { flexDirection:"row", alignItems:"center", justifyContent:"space-between" },
  keepGoingText: { fontSize:typography.tiny, color:colors.subtext, fontWeight:"300", flex:1 },
  viewPlanLink:  { fontSize:typography.small, color:colors.primary, fontWeight:"500" },

  // Body
  body: {
    backgroundColor: colors.background,
    paddingTop: spacing(2.5),
    paddingHorizontal: spacing(2.5),
    marginTop: spacing(2.5),
  },

  // Quick access — 4 compact tiles
  qaRow: { flexDirection:"row", gap:spacing(1), marginBottom:spacing(2) },
  qaItem: {
    flex:1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(1.25),
    gap: 3,
    ...shadows.card,
  },
  qaIconWrap: {
    width:32, height:32, borderRadius:radius.sm,
    backgroundColor: colors.background,
    borderWidth:1, borderColor:colors.border,
    alignItems:"center", justifyContent:"center",
    marginBottom: spacing(0.5),
  },
  qaIcon:  { fontSize:14, color:colors.primary },
  qaLabel: { fontFamily:SERIF, fontSize:10, fontWeight:"400", color:colors.text, lineHeight:14 },
  qaSub:   { fontSize:9, color:colors.primary, fontWeight:"300", lineHeight:13 },

  // Focus card
  focusCard: {
    flexDirection:"row", alignItems:"center",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth:1, borderColor:colors.border,
    padding: spacing(2), gap: spacing(1.5),
    marginBottom: spacing(2),
    ...shadows.card,
  },
  focusIconWrap: {
    width:52, height:52, borderRadius:radius.md,
    backgroundColor: colors.primary,
    alignItems:"center", justifyContent:"center",
    flexShrink:0,
  },
  focusIcon:  { fontSize:24 },
  focusText:  { flex:1 },
  focusTitle: { fontFamily:SERIF, fontSize:typography.body, fontWeight:"400", color:colors.text, marginBottom:3 },
  focusSub:   { fontSize:typography.small, color:colors.primary, fontWeight:"300", lineHeight:typography.small*1.5 },
  focusArrow: { fontSize:22, color:colors.border, lineHeight:26 },
});
