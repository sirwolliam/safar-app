/**
 * DuaDetailScreen.jsx — Safar
 * Pixel-faithful recreation of reference design:
 * - Hero image background with back + bookmark
 * - Large serif title + subtitle over image
 * - White card overlapping image
 * - Centered Arabic (large) → centered transliteration → centered translation → source
 * - Controls: Repeat | Play | Next with labels
 * - Transliteration + Translation toggles at bottom
 */
import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ImageBackground, Dimensions, Share,
} from "react-native";
import { colors, spacing, radius, typography } from "../theme";

const SERIF = "SourceSerif4-Regular";
const { width: SW, height: SH } = Dimensions.get("window");
const HERO_H = Math.round(SH * 0.30);
const CARD_OVERLAP = 44;

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5];
const SPEED_LABELS  = ["0.5x", "0.75x", "1x", "1.25x", "1.5x"];

// ── Audio player state (mock — wire to expo-av in dev build) ──────────────────
function useAudioPlayer(speedIndex) {
  const [playing,  setPlaying]  = useState(false);
  const [elapsed,  setElapsed]  = useState(0);
  const DURATION = 12;
  const timerRef = useRef(null);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setElapsed(p => {
          const next = p + 0.1 * SPEED_OPTIONS[speedIndex];
          if (next >= DURATION) { setPlaying(false); clearInterval(timerRef.current); return DURATION; }
          return next;
        });
      }, 100);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, speedIndex]);

  const play    = () => setPlaying(true);
  const pause   = () => setPlaying(false);
  const repeat  = () => { setElapsed(0); setPlaying(true); };
  const toggle  = () => setPlaying(v => !v);
  const progress = elapsed / DURATION;

  return { playing, progress, elapsed, DURATION, play, pause, repeat, toggle };
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function DuaDetailScreen({ route, navigation }) {
  const { dua, allDuas = [], currentIndex = 0 } = route?.params ?? {};

  const [idx,          setIdx]          = useState(currentIndex);
  const [showTranslit, setShowTranslit] = useState(true);
  const [showTrans,    setShowTrans]    = useState(true);
  const [bookmarked,   setBookmarked]   = useState(false);
  const [speedIndex,   setSpeedIndex]   = useState(2);
  const [looping,      setLooping]      = useState(false);
  const [showSpeed,    setShowSpeed]    = useState(false);

  const audio = useAudioPlayer(speedIndex);

  const activeDua = allDuas.length > 0 ? (allDuas[idx] ?? dua) : dua;
  if (!activeDua) return null;

  const hasPrev = idx > 0;
  const hasNext = idx < allDuas.length - 1;

  const handleShare = () => Share.share({
    message: activeDua.title + "\n\n" + activeDua.arabic + "\n\n" +
             (activeDua.transliteration ?? "") + "\n\n\"" +
             (activeDua.translation ?? "") + "\"\n\n— " +
             (activeDua.source ?? "") + "\n\nShared via Safar",
  });

  const goNext = () => { if (hasNext) { setIdx(i => i + 1); audio.repeat(); } };
  const goPrev = () => { if (hasPrev) { setIdx(i => i - 1); audio.repeat(); } };

  // Progress bar percentage
  const pct = Math.min(100, Math.round(audio.progress * 100));

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        style={{ flex:1 }}
        contentContainerStyle={{ flexGrow:1 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Hero image with header overlay ── */}
        <ImageBackground
          source={require("../assets/kaaba_mixed.png")}
          style={s.hero}
          imageStyle={s.heroImg}
        >
          {/* Dark scrim so white text is readable */}
          <View style={s.heroScrim} />

          {/* Nav row: back arrow + bookmark */}
          <View style={s.navRow}>
            <TouchableOpacity style={s.navBtn} onPress={() => navigation?.goBack?.()}>
              <Text style={s.navIcon}>{"\u2190"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.navBtn} onPress={() => setBookmarked(v => !v)}>
              <Text style={[s.navIcon, bookmarked ? s.bookmarked : null]}>{bookmarked ? "\u2665" : "\u2661"}</Text>
            </TouchableOpacity>
          </View>

          {/* Title block — bottom of hero */}
          <View style={s.heroBottom}>
            <Text style={s.heroTitle}>{activeDua.stage}{allDuas.length > 1 ? "  " + (idx+1) + "/" + allDuas.length : ""}</Text>
            <Text style={s.heroSubtitle}>{activeDua.title}</Text>
          </View>
        </ImageBackground>

        {/* ── White content card overlapping hero ── */}
        <View style={s.card}>

          {/* Arabic — large, centered */}
          <Text style={s.arabic}>{activeDua.arabic}</Text>

          {/* Transliteration — centered italic */}
          {showTranslit && activeDua.transliteration ? (
            <Text style={s.translit}>{activeDua.transliteration}</Text>
          ) : null}

          {/* Translation — centered */}
          {showTrans && activeDua.translation ? (
            <Text style={s.translation}>{activeDua.translation}</Text>
          ) : null}

          {/* Progress bar */}
          <View style={s.progressWrap}>
            <View style={s.progressTrack}>
              <View style={[s.progressFill, { width: pct + "%" }]} />
            </View>
          </View>

          {/* ── Controls ── */}
          <View style={s.controls}>
            {/* Repeat */}
            <TouchableOpacity style={s.ctrlBtn} onPress={audio.repeat} activeOpacity={0.75}>
              <Text style={s.ctrlIcon}>{"\u21BA"}</Text>
              <Text style={s.ctrlLabel}>Repeat</Text>
            </TouchableOpacity>

            {/* Play / Pause — large green circle */}
            <TouchableOpacity style={s.playBtn} onPress={audio.toggle} activeOpacity={0.88}>
              <Text style={s.playIcon}>{audio.playing ? "\u23F8" : "\u25B6"}</Text>
            </TouchableOpacity>

            {/* Next */}
            <TouchableOpacity
              style={s.ctrlBtn}
              onPress={goNext}
              activeOpacity={hasNext ? 0.75 : 1}>
              <Text style={[s.ctrlIcon, !hasNext ? s.ctrlIconDim : null]}>{"\u2192"}</Text>
              <Text style={[s.ctrlLabel, !hasNext ? s.ctrlIconDim : null]}>Next</Text>
            </TouchableOpacity>
          </View>

          {/* Speed + Loop row */}
          <View style={s.extraRow}>
            <TouchableOpacity style={s.speedPill} onPress={() => setShowSpeed(v => !v)} activeOpacity={0.8}>
              <Text style={s.speedPillTxt}>{SPEED_LABELS[speedIndex]}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.loopPill, looping ? s.loopPillOn : null]} onPress={() => setLooping(v => !v)} activeOpacity={0.8}>
              <Text style={[s.loopPillTxt, looping ? s.loopPillTxtOn : null]}>{"\uD83D\uDD01"} Loop</Text>
            </TouchableOpacity>
          </View>

          {/* Speed picker */}
          {showSpeed ? (
            <View style={s.speedGrid}>
              {SPEED_OPTIONS.map((spd, i) => (
                <TouchableOpacity
                  key={spd}
                  style={i === speedIndex ? [s.speedBtn, s.speedBtnOn] : s.speedBtn}
                  onPress={() => { setSpeedIndex(i); setShowSpeed(false); }}
                  activeOpacity={0.8}>
                  <Text style={i === speedIndex ? [s.speedBtnTxt, s.speedBtnTxtOn] : s.speedBtnTxt}>
                    {SPEED_LABELS[i]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          {/* Divider */}
          <View style={s.divider} />

          {/* ── Toggles ── */}
          <View style={s.toggleRow}>
            <Text style={s.toggleLabel}>Transliteration</Text>
            <TouchableOpacity
              style={showTranslit ? [s.toggleTrack, s.toggleTrackOn] : s.toggleTrack}
              onPress={() => setShowTranslit(v => !v)}
              activeOpacity={0.8}>
              <View style={showTranslit ? [s.toggleKnob, s.toggleKnobOn] : s.toggleKnob} />
            </TouchableOpacity>
          </View>

          <View style={s.toggleRow}>
            <Text style={s.toggleLabel}>Translation</Text>
            <TouchableOpacity
              style={showTrans ? [s.toggleTrack, s.toggleTrackOn] : s.toggleTrack}
              onPress={() => setShowTrans(v => !v)}
              activeOpacity={0.8}>
              <View style={showTrans ? [s.toggleKnob, s.toggleKnobOn] : s.toggleKnob} />
            </TouchableOpacity>
          </View>

          <View style={{ height: spacing(2) }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex:1, backgroundColor:colors.background },

  // Hero
  hero:     { width:"100%", height:HERO_H, justifyContent:"space-between" },
  heroImg:  { resizeMode:"cover" },
  heroScrim:{ ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(20,16,10,0.45)" },

  // Nav
  navRow:  { flexDirection:"row", justifyContent:"space-between", alignItems:"center", paddingHorizontal:spacing(2.5), paddingTop:spacing(1.5) },
  navBtn:  { width:36, height:36, alignItems:"center", justifyContent:"center" },
  navIcon: { fontSize:24, color:"#fff" },
  bookmarked: { color:"#F5C842" },

  // Hero title block
  heroBottom:   { paddingHorizontal:spacing(2.5), paddingBottom:spacing(2.5) },
  heroTitle:    { fontFamily:SERIF, fontSize:22, fontWeight:"400", color:"#fff", marginBottom:4, textShadowColor:"rgba(0,0,0,0.4)", textShadowOffset:{width:0,height:1}, textShadowRadius:4 },
  heroSubtitle: { fontSize:15, color:"rgba(255,255,255,0.85)", fontWeight:"400" },

  // White card overlapping hero
  card: {
    backgroundColor:"#fff",
    borderTopLeftRadius:24,
    borderTopRightRadius:24,
    marginTop:-CARD_OVERLAP,
    paddingHorizontal:spacing(3),
    paddingTop:spacing(3.5),
    minHeight:SH * 0.72,
    // Subtle shadow upward
    shadowColor:"#1A1408",
    shadowOffset:{ width:0, height:-4 },
    shadowOpacity:0.08,
    shadowRadius:12,
    elevation:8,
  },

  // Arabic — large, centered
  arabic: {
    fontFamily:SERIF,
    fontSize:34,
    textAlign:"center",
    color:"#1A1408",
    lineHeight:58,
    marginBottom:spacing(2.5),
    writingDirection:"rtl",
  },

  // Transliteration — centered italic grey
  translit: {
    fontSize:15,
    fontStyle:"italic",
    textAlign:"center",
    color:"#6B6055",
    lineHeight:24,
    marginBottom:spacing(2),
    fontWeight:"400",
  },

  // Translation — centered, slightly larger, dark
  translation: {
    fontFamily:SERIF,
    fontSize:15,
    textAlign:"center",
    color:"#2A2218",
    lineHeight:26,
    marginBottom:spacing(1.75),
    fontWeight:"400",
  },

  // Source
  source: {
    fontSize:12,
    color:"#8A7E6A",
    fontWeight:"400",
    marginBottom:spacing(2.5),
  },

  // Progress bar
  progressWrap:  { marginBottom:spacing(2.5) },
  progressTrack: { height:3, backgroundColor:"#E8E0D0", borderRadius:2, overflow:"hidden" },
  progressFill:  { height:"100%", backgroundColor:colors.primary, borderRadius:2 },

  // Controls
  controls: {
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    paddingHorizontal:spacing(1),
    marginBottom:spacing(2),
  },
  ctrlBtn: { alignItems:"center", gap:6, minWidth:64, paddingVertical:spacing(0.5) },
  ctrlIcon:   { fontSize:28, color:"#4A4A4A" },
  ctrlIconDim:{ color:"#C8C0B0" },
  ctrlLabel:  { fontSize:13, color:"#4A4A4A", fontWeight:"400" },

  // Play button — large green circle
  playBtn: {
    width:72,
    height:72,
    borderRadius:36,
    backgroundColor:colors.primary,
    alignItems:"center",
    justifyContent:"center",
    shadowColor:colors.primary,
    shadowOffset:{ width:0, height:4 },
    shadowOpacity:0.35,
    shadowRadius:8,
    elevation:6,
  },
  playIcon: { fontSize:28, color:"#fff", marginLeft:4 },

  // Extra controls row
  extraRow:    { flexDirection:"row", justifyContent:"center", gap:spacing(1.5), marginBottom:spacing(2) },
  speedPill:   { paddingHorizontal:spacing(2), paddingVertical:spacing(0.75), borderRadius:radius.pill, borderWidth:1, borderColor:colors.border, backgroundColor:colors.background },
  speedPillTxt:{ fontSize:13, color:colors.text, fontWeight:"500" },
  loopPill:    { paddingHorizontal:spacing(2), paddingVertical:spacing(0.75), borderRadius:radius.pill, borderWidth:1, borderColor:colors.border, backgroundColor:colors.background },
  loopPillOn:  { backgroundColor:colors.primary, borderColor:colors.primary },
  loopPillTxt: { fontSize:13, color:colors.text, fontWeight:"400" },
  loopPillTxtOn:{ color:"#fff", fontWeight:"500" },

  // Speed picker
  speedGrid:   { flexDirection:"row", gap:spacing(0.75), marginBottom:spacing(1.75) },
  speedBtn:    { flex:1, paddingVertical:spacing(0.875), borderRadius:radius.sm, borderWidth:1, borderColor:colors.border, backgroundColor:colors.background, alignItems:"center" },
  speedBtnOn:  { backgroundColor:colors.primary, borderColor:colors.primary },
  speedBtnTxt: { fontSize:12, color:colors.subtext },
  speedBtnTxtOn:{ color:"#fff", fontWeight:"600" },

  // Divider
  divider: { height:1, backgroundColor:"#EDE8E0", marginBottom:spacing(2) },

  // Toggles
  toggleRow:   { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingVertical:spacing(0.5), marginBottom:spacing(1.25) },
  toggleLabel: { fontSize:15, color:"#2A2218", fontWeight:"400" },
  toggleTrack: { width:48, height:28, borderRadius:14, backgroundColor:"#D0C8BC", justifyContent:"center", paddingHorizontal:3 },
  toggleTrackOn:{ backgroundColor:colors.primary },
  toggleKnob:  { width:22, height:22, borderRadius:11, backgroundColor:"#fff", shadowColor:"#000", shadowOffset:{width:0,height:1}, shadowOpacity:0.15, shadowRadius:2 },
  toggleKnobOn:{ alignSelf:"flex-end" },
});
