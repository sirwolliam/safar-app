/**
 * DuaDetailScreen.jsx — Safar
 * Layout:
 *   SafeAreaView (parchment bg)
 *     Hero image (30% screen)
 *       ↳ title block centered at bottom, above card
 *     Card (parchment, 5px margins, fills remaining space)
 *       ↳ ScrollView — Arabic + transliteration + translation (scrollable)
 *       ↳ Fixed bottom — progress bar · controls · speed · toggles (constant)
 */
import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ImageBackground, Dimensions, Share,
} from "react-native";
import Svg, { Path, Line } from "react-native-svg";
import { colors, spacing, radius } from "../theme";

const SERIF        = "SourceSerif4-Regular";
const PARCHMENT    = "#FDFAF4";
const { width: SW, height: SH } = Dimensions.get("window");
const HERO_H       = Math.round(SH * 0.30);
const CARD_OVERLAP = 69;

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5];
const SPEED_LABELS  = ["0.5×", "0.75×", "1×", "1.25×", "1.5×"];

// ── SVG icons (thin line) ─────────────────────────────────────────────────────
function LoopIcon({ active, size = 15 }) {
  const c = active ? PARCHMENT : "#4A4A4A";
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M17 2l4 4-4 4" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M3 11V9a4 4 0 014-4h14" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M7 22l-4-4 4-4" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M21 13v2a4 4 0 01-4 4H3" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function PlayIcon() {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <Path d="M5 3l14 9-14 9V3z" stroke={PARCHMENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function PauseIcon() {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <Line x1="9" y1="4" x2="9" y2="20" stroke={PARCHMENT} strokeWidth="2" strokeLinecap="round"/>
      <Line x1="15" y1="4" x2="15" y2="20" stroke={PARCHMENT} strokeWidth="2" strokeLinecap="round"/>
    </Svg>
  );
}

function NextIcon({ dim }) {
  const c = dim ? "#C8C0B0" : "#4A4A4A";
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h14M13 6l6 6-6 6" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ value, onToggle }) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.75}
      style={[tog.track, value ? tog.trackOn : null]}
    >
      <View style={[tog.knob, value ? tog.knobOn : null]} />
    </TouchableOpacity>
  );
}
const tog = StyleSheet.create({
  track:   { width:33, height:20, borderRadius:10, backgroundColor:"rgba(180,170,158,0.45)", justifyContent:"center", paddingHorizontal:2 },
  trackOn: { backgroundColor:"rgba(30,61,48,0.65)" },
  knob:    { width:16, height:16, borderRadius:8, backgroundColor:"#fff", shadowColor:"#000", shadowOffset:{width:0,height:1}, shadowOpacity:0.18, shadowRadius:2, elevation:2 },
  knobOn:  { alignSelf:"flex-end" },
});

// ── Audio (mock) ──────────────────────────────────────────────────────────────
function useAudioPlayer(speedIndex) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const DURATION = 12;
  const timer = useRef(null);

  useEffect(() => {
    if (playing) {
      timer.current = setInterval(() => {
        setElapsed(p => {
          const next = p + 0.1 * SPEED_OPTIONS[speedIndex];
          if (next >= DURATION) { setPlaying(false); clearInterval(timer.current); return DURATION; }
          return next;
        });
      }, 100);
    } else { clearInterval(timer.current); }
    return () => clearInterval(timer.current);
  }, [playing, speedIndex]);

  return {
    playing,
    progress: elapsed / DURATION,
    toggle:  () => setPlaying(v => !v),
    repeat:  () => { setElapsed(0); setPlaying(true); },
  };
}

// ── Screen ────────────────────────────────────────────────────────────────────
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

  const goNext = () => { if (hasNext) { setIdx(i => i + 1); audio.repeat(); } };

  const pct = Math.min(100, Math.round(audio.progress * 100));

  return (
    <SafeAreaView style={s.safe}>

      {/* ── Hero ── */}
      <ImageBackground
        source={require("../assets/kaaba_mixed.png")}
        style={s.hero}
        imageStyle={{ resizeMode:"cover" }}
      >
        <View style={s.heroScrim} />

        {/* Nav */}
        <View style={s.navRow}>
          <TouchableOpacity style={s.navBtn} onPress={() => navigation?.goBack?.()}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path d="M19 12H5M11 6l-6 6 6 6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </TouchableOpacity>
          <TouchableOpacity style={s.navBtn} onPress={() => setBookmarked(v => !v)}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill={bookmarked ? "#F5C842" : "none"}>
              <Path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" stroke={bookmarked ? "#F5C842" : "#fff"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Title block — centered horizontally above card */}
        <View style={s.heroBottom}>
          {/* Stage / counter */}
          <Text style={s.heroStage}>
            {activeDua.stage}{allDuas.length > 1 ? "  " + (idx + 1) + "/" + allDuas.length : ""}
          </Text>
          {/* Dua title — 30% bigger than previous 30pt = 39pt, centered */}
          <Text style={s.duaTitle}>{activeDua.title}</Text>
          {/* Subtitle — 30% bigger than previous 15pt ≈ 20pt */}
          <Text style={s.duaSub}>{activeDua.subtitle ?? ""}</Text>
        </View>
      </ImageBackground>

      {/* ── Card — parchment, 5px margins, fills remaining space ── */}
      <View style={s.card}>

        {/* Scrollable content area — Arabic + text */}
        <ScrollView
          style={s.contentScroll}
          contentContainerStyle={s.contentPad}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Text style={s.arabic}>{activeDua.arabic}</Text>

          {showTranslit && activeDua.transliteration ? (
            <Text style={s.translit}>{activeDua.transliteration}</Text>
          ) : null}

          {showTrans && activeDua.translation ? (
            <Text style={s.translation}>{activeDua.translation}</Text>
          ) : null}
        </ScrollView>

        {/* ── Fixed bottom — never moves between duas ── */}
        <View style={s.fixedBottom}>

          {/* Progress bar */}
          <View style={s.progressWrap}>
            <View style={s.progressTrack}>
              <View style={[s.progressFill, { width: pct + "%" }]} />
            </View>
          </View>

          {/* Controls */}
          <View style={s.controls}>
            <TouchableOpacity
              style={[s.ctrlCircle, looping ? s.ctrlCircleOn : null]}
              onPress={() => setLooping(v => !v)}
              activeOpacity={0.75}
            >
              <LoopIcon active={looping} size={15} />
            </TouchableOpacity>

            <TouchableOpacity style={s.playBtn} onPress={audio.toggle} activeOpacity={0.88}>
              {audio.playing ? <PauseIcon /> : <PlayIcon />}
            </TouchableOpacity>

            <TouchableOpacity
              style={s.ctrlCircle}
              onPress={goNext}
              activeOpacity={hasNext ? 0.75 : 1}
            >
              <NextIcon dim={!hasNext} />
            </TouchableOpacity>
          </View>

          {/* Speed circle — 60% of 48 = ~29px */}
          <View style={s.speedRow}>
            <TouchableOpacity
              style={s.speedCircle}
              onPress={() => setShowSpeed(v => !v)}
              activeOpacity={0.8}
            >
              <Text style={s.speedTxt}>{SPEED_LABELS[speedIndex]}</Text>
            </TouchableOpacity>
          </View>

          {showSpeed ? (
            <View style={s.speedGrid}>
              {SPEED_OPTIONS.map((spd, i) => (
                <TouchableOpacity
                  key={spd}
                  style={i === speedIndex ? [s.speedBtn, s.speedBtnOn] : s.speedBtn}
                  onPress={() => { setSpeedIndex(i); setShowSpeed(false); }}
                  activeOpacity={0.8}
                >
                  <Text style={i === speedIndex ? [s.speedBtnTxt, s.speedBtnTxtOn] : s.speedBtnTxt}>
                    {SPEED_LABELS[i]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          {/* Toggles — one line: Transliteration [toggle]  Translation [toggle] */}
          <View style={s.togglesRow}>
            <Text style={s.toggleLabel}>Transliteration</Text>
            <Toggle value={showTranslit} onToggle={() => setShowTranslit(v => !v)} />
            <View style={s.toggleSpacer} />
            <Text style={s.toggleLabel}>Translation</Text>
            <Toggle value={showTrans} onToggle={() => setShowTrans(v => !v)} />
          </View>

        </View>
      </View>

    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // Parchment background — nav bar matches card
  safe: { flex:1, backgroundColor:PARCHMENT },

  hero:      { width:"100%", height:HERO_H, justifyContent:"space-between" },
  heroScrim: { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(20,16,10,0.45)" },

  navRow: { flexDirection:"row", justifyContent:"space-between", alignItems:"center", paddingHorizontal:spacing(2.5), paddingTop:spacing(1.5) },
  navBtn: { width:36, height:36, alignItems:"center", justifyContent:"center" },

  // Title block — centered, sits between hero and card
  heroBottom: {
    paddingHorizontal:spacing(3),
    paddingBottom:spacing(2),
    alignItems:"center",
  },
  heroStage: {
    fontSize:11,
    color:"rgba(255,255,255,0.70)",
    fontWeight:"600",
    textTransform:"uppercase",
    letterSpacing:1.5,
    marginBottom:6,
    textShadowColor:"rgba(0,0,0,0.4)",
    textShadowOffset:{width:0,height:1},
    textShadowRadius:4,
  },
  // 30% bigger than previous 30pt
  duaTitle: {
    fontFamily:SERIF,
    fontSize:39,
    fontWeight:"600",
    color:"#fff",
    textAlign:"center",
    lineHeight:47,
    textShadowColor:"rgba(0,0,0,0.5)",
    textShadowOffset:{width:0,height:1},
    textShadowRadius:6,
    marginBottom:6,
  },
  // 30% bigger than previous 15pt ≈ 20pt
  duaSub: {
    fontSize:20,
    color:"rgba(255,255,255,0.80)",
    textAlign:"center",
    fontWeight:"400",
    lineHeight:27,
    textShadowColor:"rgba(0,0,0,0.35)",
    textShadowOffset:{width:0,height:1},
    textShadowRadius:4,
  },

  // Card — parchment, 5px side margins, fills remaining height
  card: {
    flex:1,
    backgroundColor:PARCHMENT,
    borderTopLeftRadius:24,
    borderTopRightRadius:24,
    marginTop:-CARD_OVERLAP,
    marginHorizontal:5,
    shadowColor:"#1A1408",
    shadowOffset:{ width:0, height:-4 },
    shadowOpacity:0.08,
    shadowRadius:12,
    elevation:8,
    overflow:"hidden",
  },

  // Scrollable text content
  contentScroll: { flex:1 },
  contentPad:    { paddingHorizontal:spacing(3), paddingTop:spacing(3), paddingBottom:spacing(2) },

  arabic: {
    fontFamily:SERIF,
    fontSize:34,
    textAlign:"center",
    color:"#1A1408",
    lineHeight:58,
    marginBottom:spacing(2.5),
    writingDirection:"rtl",
  },
  translit: {
    fontSize:19,
    fontStyle:"italic",
    textAlign:"center",
    color:"#6B6055",
    lineHeight:28,
    marginBottom:spacing(2),
    fontWeight:"400",
  },
  translation: {
    fontFamily:SERIF,
    fontSize:19,
    textAlign:"center",
    color:"#2A2218",
    lineHeight:30,
    marginBottom:spacing(1.5),
    fontWeight:"400",
  },

  // Fixed bottom — locked in place regardless of content height
  fixedBottom: {
    paddingHorizontal:spacing(2.5),
    paddingBottom:spacing(2),
    borderTopWidth:1,
    borderTopColor:"rgba(200,191,178,0.40)",
    backgroundColor:PARCHMENT,
  },

  progressWrap:  { marginTop:spacing(1.5), marginBottom:spacing(1.75) },
  progressTrack: { height:3, backgroundColor:"rgba(200,191,178,0.60)", borderRadius:2, overflow:"hidden" },
  progressFill:  { height:"100%", backgroundColor:colors.primary, borderRadius:2 },

  controls: {
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    paddingHorizontal:spacing(3),
    marginBottom:spacing(1.25),
  },

  ctrlCircle: {
    width:36,
    height:36,
    borderRadius:18,
    borderWidth:1.5,
    borderColor:"#C8BFB2",
    alignItems:"center",
    justifyContent:"center",
    backgroundColor:"transparent",
  },
  ctrlCircleOn: {
    backgroundColor:colors.primary,
    borderColor:colors.primary,
  },

  playBtn: {
    width:64,
    height:64,
    borderRadius:32,
    backgroundColor:colors.primary,
    alignItems:"center",
    justifyContent:"center",
    shadowColor:colors.primary,
    shadowOffset:{width:0,height:4},
    shadowOpacity:0.35,
    shadowRadius:8,
    elevation:6,
  },

  // Speed circle — 60% of 48 = ~29px
  speedRow:    { alignItems:"center", marginBottom:spacing(1.25) },
  speedCircle: {
    width:30,
    height:30,
    borderRadius:15,
    borderWidth:1,
    borderColor:"#C8BFB2",
    backgroundColor:"transparent",
    alignItems:"center",
    justifyContent:"center",
  },
  speedTxt: { fontSize:10, color:"#5C534A", fontWeight:"600" },
  speedGrid: { flexDirection:"row", gap:spacing(0.75), marginBottom:spacing(1.25) },
  speedBtn:  { flex:1, paddingVertical:spacing(0.75), borderRadius:radius.sm, borderWidth:1, borderColor:"#C8BFB2", backgroundColor:"transparent", alignItems:"center" },
  speedBtnOn:  { backgroundColor:colors.primary, borderColor:colors.primary },
  speedBtnTxt: { fontSize:11, color:"#5C534A" },
  speedBtnTxtOn:{ color:"#fff", fontWeight:"600" },

  // Toggles — single row: label · toggle · spacer · label · toggle
  togglesRow: {
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"center",
    gap:8,
    paddingTop:4,
  },
  toggleLabel: {
    fontSize:13,
    color:"#5C534A",
    fontWeight:"500",
  },
  toggleSpacer: {
    width:20,
  },
});
