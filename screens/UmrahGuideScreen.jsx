/**
 * UmrahGuideScreen.jsx — Safar
 * Dashboard layout: hero → countdown → journey path → start learning →
 * along the way (resource grid) → how ready → verse card
 */
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, StyleSheet, StatusBar, Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CalendarBlank, CaretRight, BookOpen, GraduationCap } from "phosphor-react-native";
import { colors, spacing, radius, shadows } from "../theme";

const SERIF    = "SourceSerif4-Regular";
const GOLD     = "#C8A96A";
const GOLD_TXT = "#7A5A10";
const SAGE     = "#2D4A34";
const SW       = Dimensions.get("window").width;
const TILE_W   = Math.floor((SW - spacing(4) - 14) / 3);

const STORAGE_KEY = "safar_umrah_checklist_v1";
const CHECKLIST_TOTAL = 10;

const STEPS = ["Prepare", "Ihram", "Tawaf", "Saʿi", "Complete"];

function pad(n) { return String(n).padStart(2, "0"); }

function computeCountdown(iso) {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return { d: "00", h: "00", m: "00", s: "00" };
  const t = Math.floor(ms / 1000);
  return { d: pad(Math.floor(t / 86400)), h: pad(Math.floor((t % 86400) / 3600)), m: pad(Math.floor((t % 3600) / 60)), s: pad(t % 60) };
}

export default function UmrahGuideScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [tripDate, setTripDate]     = useState(null);
  const [countdown, setCountdown]   = useState({ d: "--", h: "--", m: "--", s: "--" });
  const [doneCount, setDoneCount]   = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    AsyncStorage.getItem("safar_departure_date_v1").then(v => { if (v) setTripDate(v); }).catch(() => {});
  }, []);

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(v => {
      if (v) setDoneCount(Object.values(JSON.parse(v)).filter(Boolean).length);
    }).catch(() => {});
  }, []));

  useEffect(() => {
    if (!tripDate) return;
    const tick = () => setCountdown(computeCountdown(tripDate));
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [tripDate]);

  const goPlan = () => navigation?.getParent?.()?.navigate?.("Plan");

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>

        {/* ── HERO ── */}
        <View style={[s.hero, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.8}>
            <Text style={s.backArrow}>{"‹"}</Text>
          </TouchableOpacity>
          <View style={s.heroRow}>
            <View style={s.heroLeft}>
              <View style={s.guidePill}><Text style={s.guidePillTxt}>UMRAH GUIDE</Text></View>
              <Text style={s.heroHeadline}>{"Your journey\nof devotion,\nmade simple."}</Text>
              <Text style={s.heroSub}>{"Everything you need to learn, prepare, and perform Umrah with confidence."}</Text>
            </View>
            <View style={s.heroImgWrap}>
              <Image source={require("../assets/kaaba_mixed.png")} style={s.heroImg} resizeMode="cover" />
              <LinearGradient colors={[colors.background, "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.heroFade} />
            </View>
          </View>
        </View>

        <View style={s.body}>

          {/* ── COUNTDOWN ── */}
          <View style={s.card}>
            <Text style={s.countLabel}>UMRAH COUNTDOWN</Text>
            <Text style={s.countSub}>Your journey begins in</Text>
            <View style={s.countRow}>
              {[{ v: countdown.d, u: "DAYS" }, { v: countdown.h, u: "HRS" }, { v: countdown.m, u: "MINS" }, { v: countdown.s, u: "SECS" }].map((c, i) => (
                <React.Fragment key={c.u}>
                  {i > 0 ? <Text style={s.countColon}>{":"}</Text> : null}
                  <View style={s.countBlock}>
                    <Text style={s.countNum}>{c.v}</Text>
                    <Text style={s.countUnit}>{c.u}</Text>
                  </View>
                </React.Fragment>
              ))}
              <View style={{ flex: 1 }} />
              <Image source={require("../assets/kaaba_framed.png")} style={s.countImg} resizeMode="contain" />
            </View>
            <TouchableOpacity style={s.updateRow} onPress={goPlan} activeOpacity={0.8}>
              <CalendarBlank size={13} color={GOLD_TXT} weight="regular" />
              <Text style={[s.updateTxt, { color: GOLD_TXT }]}>Edit date</Text>
              <View style={{ flex: 1 }} />
              <CaretRight size={13} color={GOLD_TXT} weight="bold" />
            </TouchableOpacity>
          </View>

          {/* ── JOURNEY PATH ── */}
          <Text style={s.sectionTitle}>Your Umrah journey</Text>
          <Text style={s.sectionSub}>Follow the path to completion.</Text>
          <View style={s.stepsRow}>
            {STEPS.map((step, i) => (
              <React.Fragment key={step}>
                <View style={s.stepItem}>
                  <View style={s.stepDot} />
                  <Text style={s.stepLbl}>{step}</Text>
                </View>
                {i < STEPS.length - 1 ? <View style={s.stepLine} /> : null}
              </React.Fragment>
            ))}
          </View>

          {/* ── START LEARNING ── */}
          <TouchableOpacity style={s.learnCard} onPress={() => navigation.navigate("LessonList", { guide: "umrah" })} activeOpacity={0.88}>
            <View style={[s.iconCircle, { backgroundColor: SAGE }]}>
              <BookOpen size={24} color="#FDFAF4" weight="regular" />
            </View>
            <View style={s.learnText}>
              <Text style={s.learnTitle}>Start your learning path</Text>
              <Text style={s.learnSub}>Step-by-step lessons for every stage of Umrah.</Text>
            </View>
            <View style={s.learnArrow}>
              <CaretRight size={18} color={colors.subtext} weight="bold" />
            </View>
          </TouchableOpacity>

          {/* ── ALONG THE WAY ── */}
          <Text style={s.sectionTitle}>Along the way</Text>
          <Text style={s.sectionSub}>Essential tools and resources for your journey.</Text>
          <View style={s.grid}>
            <TouchableOpacity style={s.tile} activeOpacity={0.8} onPress={() => navigation?.navigate?.("PilgrimageDuas", { mode: "umrah" })}>
              <Text style={s.tileTitle}>Duas</Text>
              <Text style={s.tileDesc}>{"Essential duas\nfor every stage."}</Text>
              <CaretRight size={11} color={colors.subtext} weight="bold" style={{ alignSelf: "flex-end", marginTop: 6 }} />
            </TouchableOpacity>
            <TouchableOpacity style={s.tile} activeOpacity={0.8} onPress={() => navigation?.navigate?.("Media", { filter: "umrah" })}>
              <Text style={s.tileTitle}>Videos & Media</Text>
              <Text style={s.tileDesc}>{"Watch, listen and\nlearn more."}</Text>
              <CaretRight size={11} color={colors.subtext} weight="bold" style={{ alignSelf: "flex-end", marginTop: 6 }} />
            </TouchableOpacity>
            <TouchableOpacity style={s.tile} activeOpacity={0.8} onPress={() => navigation?.navigate?.("Shop", { category: "all" })}>
              <Text style={s.tileTitle}>Essentials</Text>
              <Text style={s.tileDesc}>{"Hand-picked items\nfor your journey."}</Text>
              <CaretRight size={11} color={colors.subtext} weight="bold" style={{ alignSelf: "flex-end", marginTop: 6 }} />
            </TouchableOpacity>
            <TouchableOpacity style={s.tile} activeOpacity={0.8} onPress={() => navigation?.navigate?.("MapStepList", { guide: "umrah" })}>
              <Text style={s.tileTitle}>Pilgrimage Map</Text>
              <Text style={s.tileDesc}>{"See where each\nstep takes place."}</Text>
              <CaretRight size={11} color={colors.subtext} weight="bold" style={{ alignSelf: "flex-end", marginTop: 6 }} />
            </TouchableOpacity>
            <TouchableOpacity style={s.tile} activeOpacity={0.8} onPress={() => navigation?.navigate?.("SacredPlaces")}>
              <Text style={s.tileTitle}>Sacred Places</Text>
              <Text style={s.tileDesc}>{"Places to know\nand visit."}</Text>
              <CaretRight size={11} color={colors.subtext} weight="bold" style={{ alignSelf: "flex-end", marginTop: 6 }} />
            </TouchableOpacity>
            <TouchableOpacity style={s.tile} activeOpacity={0.8} onPress={goPlan}>
              <Text style={s.tileTitle}>Umrah Checklist</Text>
              <Text style={s.tileDesc}>{doneCount + " of " + CHECKLIST_TOTAL + " tasks\ncompleted"}</Text>
              <View style={s.tileBar}><View style={[s.tileBarFill, { width: ((doneCount / CHECKLIST_TOTAL) * 100) + "%" }]} /></View>
            </TouchableOpacity>
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

          {/* ── VERSE CARD ── */}
          <View style={s.verseCard}>
            <Image source={require("../assets/kaaba_sunset.png")} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
            <LinearGradient colors={["rgba(20,14,6,0.70)", "rgba(20,14,6,0.90)"]} style={StyleSheet.absoluteFillObject} />
            <Text style={s.verseOpen}>{"“"}</Text>
            <Text style={s.verseArabic}>{"وَأَتِمُوا الْحَجَّ وَالْعُمْرَةَ لِللَّهِ"}</Text>
            <Text style={s.verseTr}>{"“And complete the Hajj and Umrah for Allah.”"}</Text>
            <Text style={s.verseRef}>{"– Quran 2:196"}</Text>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  hero:      { backgroundColor: colors.background, paddingHorizontal: spacing(2), paddingBottom: spacing(2) },
  backBtn:   { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.07)", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  backArrow: { fontSize: 24, color: colors.text, lineHeight: 28, marginTop: -2 },
  heroRow:   { flexDirection: "row", alignItems: "flex-start" },
  heroLeft:  { flex: 1, paddingRight: 8 },
  guidePill: { alignSelf: "flex-start", backgroundColor: GOLD, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 12 },
  guidePillTxt: { fontSize: 11, fontWeight: "700", color: "#FDFAF4", letterSpacing: 0.6 },
  heroHeadline: { fontFamily: SERIF, fontSize: 28, color: colors.text, lineHeight: 35, marginBottom: 10, fontWeight: "600" },
  heroSub:   { fontSize: 13, color: colors.subtext, lineHeight: 19 },
  heroImgWrap: { width: 144, height: 188, position: "relative" },
  heroImg:   { width: "100%", height: "100%", borderRadius: 16 },
  heroFade:  { position: "absolute", top: 0, bottom: 0, left: 0, width: 36 },

  body: { paddingHorizontal: spacing(2) },

  card:     { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing(2), marginBottom: spacing(2.5), ...shadows.xs },
  countTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  countLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1.1, color: GOLD_TXT },
  editBtn:  { flexDirection: "row", alignItems: "center", gap: 4 },
  editTxt:  { fontSize: 12, color: colors.subtext },
  countSub: { fontSize: 13, color: colors.subtext, marginBottom: 10 },
  countRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 10 },
  countBlock: { alignItems: "center" },
  countNum: { fontFamily: SERIF, fontSize: 30, color: colors.text, fontWeight: "600" },
  countUnit:{ fontSize: 9, fontWeight: "700", color: colors.subtext, letterSpacing: 0.4, marginTop: 2 },
  countColon: { fontSize: 26, color: colors.subtext, marginHorizontal: 5, marginBottom: 14, lineHeight: 34 },
  countImg: { width: 95, height: 95, marginLeft: 8, marginBottom: -4 },
  updateRow:{ flexDirection: "row", alignItems: "center", gap: 6, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
  updateTxt:{ fontSize: 13, color: GOLD_TXT, fontWeight: "500" },

  sectionTitle: { fontFamily: SERIF, fontSize: 20, color: colors.text, marginBottom: 3, marginTop: spacing(1.5) },
  sectionSub:   { fontSize: 13, color: colors.subtext, marginBottom: 12 },

  stepsRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing(2.5), paddingHorizontal: 2 },
  stepItem: { alignItems: "center" },
  stepDot:  { width: 10, height: 10, borderRadius: 5, backgroundColor: GOLD, marginBottom: 6 },
  stepLine: { flex: 1, height: 1.5, backgroundColor: GOLD, opacity: 0.35, marginBottom: 16 },
  stepLbl:  { fontSize: 10, color: colors.subtext, textAlign: "center", maxWidth: 50 },

  learnCard:  { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing(1.75), marginBottom: spacing(2.5), ...shadows.xs },
  iconCircle: { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center", marginRight: 14 },
  learnText:  { flex: 1 },
  learnTitle: { fontFamily: SERIF, fontSize: 16, color: colors.text, marginBottom: 3 },
  learnSub:   { fontSize: 12, color: colors.subtext, lineHeight: 17 },
  learnArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: spacing(2.5) },
  tile: { width: TILE_W, backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 10, minHeight: 88, ...shadows.xs },
  tileTitle: { fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 4, lineHeight: 17 },
  tileDesc:  { fontSize: 11, color: colors.subtext, lineHeight: 15, flex: 1 },
  tileBar:     { height: 3, backgroundColor: colors.border, borderRadius: 2, marginTop: 8, overflow: "hidden" },
  tileBarFill: { height: "100%", backgroundColor: GOLD, borderRadius: 2 },

  quizCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing(1.75), marginBottom: spacing(2.5), ...shadows.xs },
  quizText: { flex: 1 },
  quizTitle:{ fontFamily: SERIF, fontSize: 16, color: colors.text, marginBottom: 2 },
  quizSub:  { fontSize: 12, color: colors.subtext },
  quizBtn:  { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  quizBtnTxt: { fontSize: 13, fontWeight: "700", color: "#FDFAF4" },

  verseCard:  { borderRadius: radius.lg, overflow: "hidden", padding: spacing(2.5), minHeight: 150, justifyContent: "center", ...shadows.card },
  verseOpen:  { fontFamily: SERIF, fontSize: 36, color: GOLD, lineHeight: 36, marginBottom: -2 },
  verseArabic:{ fontFamily: SERIF, fontSize: 20, color: "#FDFAF4", textAlign: "right", lineHeight: 34, marginBottom: 8 },
  verseTr:    { fontFamily: SERIF, fontSize: 14, color: "rgba(255,255,255,0.88)", fontStyle: "italic", lineHeight: 21, marginBottom: 4 },
  verseRef:   { fontSize: 12, color: "rgba(255,255,255,0.60)" },
});
