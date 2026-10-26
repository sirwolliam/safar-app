/**
 * UmrahGuideScreen.jsx — Safar
 * Dashboard layout: hero → 1. start learning → 2. understand the journey →
 * 3. prepare → 4. learn and explore → how ready (quiz)
 */
import React, { useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, StyleSheet, StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ImageView from "react-native-image-viewing";
import { ArrowRight, CaretLeft, CaretRight, BookOpen, GraduationCap, PlayCircle, MapPin, MagnifyingGlass } from "phosphor-react-native";
import { colors, spacing, radius, shadows } from "../theme";

const SERIF    = "SourceSerif4-Regular";
const GOLD     = "#C8A96A";
const SAGE     = "#2D4A34";

const JOURNEY_IMG = require("../assets/umrah_journey.png");
const MAP_CARD_IMG = require("../assets/map_card.png");
const CHECKLIST_CARD_IMG = require("../assets/checklist_kaaba.jpg");
const ESSENTIALS_CARD_IMG = require("../assets/shop/shop-bag.jpg");
const DUA_CARD_IMG = require("../assets/dua-header.png");

const STORAGE_KEY = "safar_umrah_checklist_v1";
const CHECKLIST_TOTAL = 10;

// ── Section building blocks (numbered header, image card, icon link tile) ──
function SectionHeader({ num, title, sub }) {
  return (
    <View>
      <View style={s.secTitleRow}>
        <View style={s.secNum}><Text style={s.secNumTxt}>{num}</Text></View>
        <Text style={s.secTitle}>{title}</Text>
      </View>
      <Text style={s.secSub}>{sub}</Text>
    </View>
  );
}

function ImageCard({ image, title, sub, onPress, fit = "cover" }) {
  return (
    <TouchableOpacity style={s.toolCard} activeOpacity={0.85} onPress={onPress}>
      <View style={s.toolImgWrap}>
        <Image source={image} style={s.toolImg} resizeMode={fit} />
        <View style={s.toolArrow}>
          <CaretRight size={14} color="#FFFFFF" weight="bold" />
        </View>
      </View>
      <View style={s.toolText}>
        <Text style={s.toolTitle} numberOfLines={1}>{title}</Text>
        <Text style={s.toolSub} numberOfLines={2}>{sub}</Text>
      </View>
    </TouchableOpacity>
  );
}

function LinkTile({ Icon, title, sub, onPress }) {
  return (
    <TouchableOpacity style={s.linkTile} activeOpacity={0.85} onPress={onPress}>
      <View style={s.linkIcon}><Icon size={20} color="#2D4A34" weight="regular" /></View>
      <Text style={s.linkTitle} numberOfLines={1}>{title}</Text>
      <Text style={s.linkSub}>{sub}</Text>
      <View style={s.linkCaret}><CaretRight size={14} color="#8A7D6A" weight="bold" /></View>
    </TouchableOpacity>
  );
}

export default function UmrahGuideScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [doneCount, setDoneCount]   = useState(0);
  const [showJourneyViewer, setShowJourneyViewer] = useState(false);

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(v => {
      if (v) setDoneCount(Object.values(JSON.parse(v)).filter(Boolean).length);
    }).catch(() => {});
  }, []));

  const goPlan = () => navigation?.getParent?.()?.navigate?.("Plan");

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>

        {/* ── HERO ── */}
        <View style={s.heroContainer}>
          <Image source={require("../assets/explore_cards/umrah.png")} style={s.heroImg} resizeMode="cover" />
          <View style={s.heroDim} pointerEvents="none" />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.25)", "rgba(0,0,0,0.65)", "rgba(0,0,0,0.90)"]}
            locations={[0, 0.3, 0.7, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <TouchableOpacity style={[s.backBtn, { top: insets.top + 14 }]} onPress={() => navigation?.goBack?.()} activeOpacity={0.8}>
            <CaretLeft size={18} color="#FFFFFF" weight="bold" />
          </TouchableOpacity>
          <TouchableOpacity style={[s.searchBtn, { top: insets.top + 14 }]} onPress={() => navigation?.navigate?.("Search")} activeOpacity={0.8}>
            <MagnifyingGlass size={18} color="#FFFFFF" weight="bold" />
          </TouchableOpacity>
          <View style={s.headerContent}>
            <View style={s.titleRow}>
              <View style={s.iconBadge}>
                <BookOpen size={22} color="#C8A96A" weight="regular" />
              </View>
              <Text style={s.headerTitle}>{"Umrah Guide"}</Text>
            </View>
            <Text style={s.headerSub}>{"Everything you need to learn, prepare, and perform Umrah with confidence."}</Text>
          </View>
        </View>

        <View style={s.body}>

          {/* ── 1. START YOUR LEARNING PATH ── */}
          <View style={s.section}>
            <SectionHeader num={1} title="Start your learning path" sub="Step-by-step lessons for every stage of Umrah." />
            <TouchableOpacity style={s.learnCard} onPress={() => navigation.navigate("LessonList", { guide: "umrah" })} activeOpacity={0.75}>
              <Image source={require("../assets/kaaba_crop.jpg")} style={s.learnBg} resizeMode="cover" />
              <View style={s.learnArrow}>
                <ArrowRight size={16} color="#FFFFFF" weight="regular" />
              </View>
              <View style={s.learnText}>
                <Text style={s.learnTitle}>{"Step-by-Step\nUmrah Lessons"}</Text>
                <Text style={s.learnSub}>{"From Ihram to Tawaf to Sa'i.\nUnderstand it all before you go."}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* ── 2. UNDERSTAND THE JOURNEY ── */}
          <View style={s.section}>
            <SectionHeader num={2} title="Understand the journey" sub="See the key steps and where each rite takes place." />
            <View style={s.cardRow}>
              {/* cover fills the thumbnail (sides are cropped); tap opens the pinch-zoom viewer for the full graphic */}
              <ImageCard image={JOURNEY_IMG} title="Journey overview" sub="A quick visual guide to the steps of Umrah." onPress={() => setShowJourneyViewer(true)} />
              <ImageCard image={MAP_CARD_IMG} title="Pilgrimage Map" sub="See where each rite takes place in Makkah and the holy sites." onPress={() => navigation?.navigate?.("MapStepList", { guide: "umrah" })} />
            </View>
          </View>

          {/* ── 3. PREPARE FOR YOUR JOURNEY ── */}
          <View style={s.section}>
            <SectionHeader num={3} title="Prepare for your journey" sub="Get organized with checklists and essential items." />
            <View style={s.cardRow}>
              <ImageCard image={CHECKLIST_CARD_IMG} title="Umrah Checklist" sub={doneCount + " of " + CHECKLIST_TOTAL + " tasks completed"} onPress={goPlan} />
              <ImageCard image={ESSENTIALS_CARD_IMG} title="Essentials" sub="Hand-picked items for your journey." onPress={() => navigation?.navigate?.("Shop", { category: "all" })} />
            </View>
          </View>

          {/* ── 4. LEARN AND EXPLORE ── */}
          <View style={s.section}>
            <SectionHeader num={4} title="Learn and explore" sub="Deepen your knowledge with duas, videos and important places." />
            <TouchableOpacity style={s.duaCard} activeOpacity={0.85} onPress={() => navigation?.navigate?.("PilgrimageDuas", { mode: "umrah" })}>
              <Image source={DUA_CARD_IMG} style={s.duaImg} resizeMode="cover" />
              <LinearGradient colors={["transparent", "rgba(0,0,0,0.85)"]} style={StyleSheet.absoluteFillObject} />
              <View style={s.duaArrow}>
                <CaretRight size={14} color="#FFFFFF" weight="bold" />
              </View>
              <View style={s.duaText}>
                <Text style={s.duaTitle}>{"Umrah Duas"}</Text>
                <Text style={s.duaSub}>{"Helpful duas for each stage of your journey."}</Text>
              </View>
            </TouchableOpacity>
            <View style={s.linkRow}>
              <LinkTile Icon={PlayCircle} title="Umrah Videos" sub="Watch, listen and learn more." onPress={() => navigation?.navigate?.("Media", { filter: "umrah" })} />
              <LinkTile Icon={MapPin} title="Umrah Sites" sub="Historical places to visit." onPress={() => navigation?.navigate?.("SacredPlaces")} />
            </View>
          </View>

          {/* ── HOW READY ── */}
          <View style={s.quizCard}>
            <View style={[s.iconCircle, { backgroundColor: SAGE }]}>
              <GraduationCap size={22} color="#FDFAF4" weight="regular" />
            </View>
            <View style={s.quizText}>
              <Text style={s.quizTitle}>How ready are you?</Text>
              <Text style={s.quizSub}>{"Test your knowledge in Practice."}</Text>
            </View>
            <TouchableOpacity style={[s.quizBtn, { backgroundColor: GOLD }]} activeOpacity={0.85} onPress={() => navigation?.getParent?.()?.navigate?.("Practice")}>
              <Text style={s.quizBtnTxt}>Take Quiz</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
      <ImageView
        images={[JOURNEY_IMG]}
        imageIndex={0}
        visible={showJourneyViewer}
        onRequestClose={() => setShowJourneyViewer(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  heroContainer: { position: "relative" },
  heroImg:   { width: "100%", height: 260 },
  heroDim:   { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  backBtn:   { position: "absolute", left: 18, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" },
  searchBtn: { position: "absolute", right: 18, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" },
  headerContent: { position: "absolute", bottom: 22, left: 20, right: 20 },
  titleRow:      { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  iconBadge:     { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: "#C8A96A", alignItems: "center", justifyContent: "center" },
  headerTitle:   { fontFamily: SERIF, fontSize: 38, color: "#FFFFFF", fontWeight: "600", textShadowColor: "rgba(0,0,0,0.75)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },
  headerSub:     { fontSize: 15, color: "rgba(255,255,255,0.82)", lineHeight: 22, maxWidth: "88%" },

  body: { paddingHorizontal: spacing(2), paddingTop: spacing(2.5) },

  // Image cards (sections 2 & 3): ExploreTiles-style — image top 60%, cream text area below.
  toolCard:    { flex: 1, height: 190, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "#EDE4D4", backgroundColor: "#FDFAF4", shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  toolImgWrap: { height: "60%", position: "relative", overflow: "hidden" },
  toolImg:     { width: "100%", height: "100%" },
  toolArrow:   { position: "absolute", top: 10, right: 10, width: 26, height: 26, borderRadius: 13, backgroundColor: "#2D4A34", alignItems: "center", justifyContent: "center" },
  toolText:    { flex: 1, padding: 12, backgroundColor: "#FDFAF4", justifyContent: "center" },
  toolTitle:   { fontFamily: SERIF, fontSize: 15, fontWeight: "600", color: "#1C1A14", marginBottom: 2 },
  toolSub:     { fontSize: 11, color: "#8A7D6A", lineHeight: 14 },

  // Numbered section header: gold-brown number circle + serif title; sub indented under the title (28 circle + 10 gap).
  section:     { marginBottom: spacing(2.5) },
  secTitleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  secNum:      { width: 28, height: 28, borderRadius: 14, backgroundColor: "#8B7140", alignItems: "center", justifyContent: "center" },
  secNumTxt:   { color: "#FFFFFF", fontSize: 14, fontWeight: "700", textAlign: "center" },
  secTitle:    { fontFamily: SERIF, fontSize: 22, fontWeight: "600", color: "#1A1410", flexShrink: 1 },
  secSub:      { fontSize: 14, color: "#5C534A", lineHeight: 20, marginTop: 2, marginBottom: 16, marginLeft: 38 },
  cardRow:     { flexDirection: "row", gap: 10 },

  // Section 4: full-width Duas image card, then a 2-up row of cream icon tiles (Videos, Sites).
  duaCard:   { height: 140, borderRadius: radius.lg, overflow: "hidden", backgroundColor: "#1A1410", marginBottom: 10, ...shadows.xs },
  duaImg:    { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" },
  duaArrow:  { position: "absolute", top: 12, right: 12, width: 28, height: 28, borderRadius: 14, backgroundColor: SAGE, alignItems: "center", justifyContent: "center" },
  duaText:   { position: "absolute", left: 16, right: 52, bottom: 14 },
  duaTitle:  { fontFamily: SERIF, fontSize: 22, fontWeight: "600", color: "#FFFFFF" },
  duaSub:    { fontSize: 13, color: "rgba(255,255,255,0.90)", lineHeight: 18, marginTop: 2 },
  linkRow:   { flexDirection: "row", gap: 10 },
  linkTile:  { flex: 1, minHeight: 110, padding: 14, backgroundColor: "#FDFAF4", borderRadius: 16, borderWidth: 1, borderColor: "#EDE4D4", ...shadows.xs },
  linkIcon:  { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(45,74,52,0.1)", alignItems: "center", justifyContent: "center" },
  linkTitle: { fontFamily: SERIF, fontSize: 15, fontWeight: "600", color: "#1C1A14", marginTop: 10 },
  linkSub:   { fontSize: 12, color: "#8A7D6A", lineHeight: 16, marginTop: 2, paddingRight: 14 },
  linkCaret: { position: "absolute", right: 10, bottom: 10 },
  // Start-learning card: title + subtitle with a sage arrow circle top-right; cream card matching DuaListScreen's DuaCard rows (no outer horizontal margin — s.body already pads 16).
  learnCard:  { backgroundColor: "#FDFAF4", borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "#EDE4D4", shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, marginBottom: spacing(2), padding: 20, minHeight: 130 },
  iconCircle: { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center", marginRight: 14 },
  learnBg:    { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 1 },
  learnText:  { flex: 1, justifyContent: "center", alignItems: "flex-start", paddingRight: 28 },
  learnTitle: { fontFamily: SERIF, fontSize: 23, fontWeight: "600", color: "#FFFFFF", marginBottom: 4, textShadowColor: "rgba(0,0,0,0.65)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  learnSub:   { fontSize: 14, color: "rgba(255,255,255,0.90)", lineHeight: 20, textShadowColor: "rgba(0,0,0,0.65)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  learnArrow: { position: "absolute", top: 14, right: 14, width: 32, height: 32, borderRadius: 16, backgroundColor: SAGE, alignItems: "center", justifyContent: "center" },

  quizCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing(1.75), marginBottom: spacing(2.5), ...shadows.xs },
  quizText: { flex: 1 },
  quizTitle:{ fontFamily: SERIF, fontSize: 16, color: colors.text, marginBottom: 2 },
  quizSub:  { fontSize: 12, color: colors.subtext },
  quizBtn:  { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  quizBtnTxt: { fontSize: 13, fontWeight: "700", color: "#FDFAF4" },
});
