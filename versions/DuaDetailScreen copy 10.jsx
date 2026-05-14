/**
 * DuaDetailScreen.jsx — Safar
 * - Hero image background with back + bookmark
 * - Centered dua title at top of card, 2× size, 15pt top padding
 * - Arabic → transliteration → translation (text 4pt bigger)
 * - Transliteration + Translation toggles side-by-side, label centered above toggle
 * - Modern thin-line SVG loop icon (circle) + play/pause icon (circle)
 * - Speed pill stays as-is
 * - Card pulled up 25px extra
 */
import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ImageBackground, Dimensions, Share,
} from "react-native";
import Svg, { Path, Circle, Rect, Line, Polyline, G } from "react-native-svg";
import { colors, spacing, radius, typography } from "../theme";

const SERIF = "SourceSerif4-Regular";
const { width: SW, height: SH } = Dimensions.get("window");
const HERO_H       = Math.round(SH * 0.30);
const CARD_OVERLAP = 44 + 25; // pulled up extra 25px

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5];
const SPEED_LABELS  = ["0.5x", "0.75x", "1x", "1.25x", "1.5x"];

// ── SVG Icons — thin line style ───────────────────────────────────────────────

// Loop / repeat icon
function LoopIcon({ active, size = 22 }) {
  const col = active ? "#FDFAF4" : "#4A4A4A";
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17 2l4 4-4 4"
        stroke={col} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      />
      <Path
        d="M3 11V9a4 4 0 014-4h14"
        stroke={col} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      />
      <Path
        d="M7 22l-4-4 4-4"
        stroke={col} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      />
      <Path
        d="M21 13v2a4 4 0 01-4 4H3"
        stroke={col} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

// Play icon — triangle outline
function PlayIcon() {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 3l14 9-14 9V3z"
        stroke="#FDFAF4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

// Pause icon — two vertical lines
function PauseIcon() {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <Line x1="9" y1="4" x2="9" y2="20" stroke="#FDFAF4" strokeWidth="2" strokeLinecap="round" />
      <Line x1="15" y1="4" x2="15" y2="20" stroke="#FDFAF4" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

// Next arrow icon
function NextIcon({ dim }) {
  const col = dim ? "#C8C0B0" : "#4A4A4A";
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h14M13 6l6 6-6 6" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Modern toggle — thin pill with animated knob feel via state
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
  track:   { width:33, height:20, borderRadius:10, backgroundColor:"rgba(200,191,178,0.50)", justifyContent:"center", paddingHorizontal:2 },
  trackOn: { backgroundColor:"rgba(30,61,48,0.70)" },
  knob:    { width:16, height:16, borderRadius:8, backgroundColor:"#fff", shadowColor:"#000", shadowOffset:{width:0,height:1}, shadowOpacity:0.18, shadowRadius:2, elevation:2 },
  knobOn:  { alignSelf:"flex-end" },
});

// ── Audio player (mock) ───────────────────────────────────────────────────────
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
             (activeDua.translation ?? "") + "\"\n\nShared via Safar",
  });

  const goNext = () => { if (hasNext) { setIdx(i => i + 1); audio.repeat(); } };
  const goPrev = () => { if (hasPrev) { setIdx(i => i - 1); audio.repeat(); } };

  const pct = Math.min(100, Math.round(audio.progress * 100));

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        style={{ flex:1 }}
        contentContainerStyle={{ flexGrow:1 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Hero ── */}
        <ImageBackground
          source={require("../assets/kaaba_mixed.png")}
          style={s.hero}
          imageStyle={s.heroImg}
        >
          <View style={s.heroScrim} />

          <View style={s.navRow}>
            <TouchableOpacity style={s.navBtn} onPress={() => navigation?.goBack?.()}>
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path d="M19 12H5M11 6l-6 6 6 6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
            <TouchableOpacity style={s.navBtn} onPress={() => setBookmarked(v => !v)}>
              <Svg width={22} height={22} viewBox="0 0 24 24" fill={bookmarked ? "#F5C842" : "none"}>
                <Path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" stroke={bookmarked ? "#F5C842" : "#fff"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
          </View>

          <View style={s.heroBottom}>
            <Text style={s.heroTitle}>{activeDua.stage}{allDuas.length > 1 ? "  " + (idx+1) + "/" + allDuas.length : ""}</Text>
            <Text style={s.heroSubtitle}>{activeDua.title}</Text>
            {/* Dua title floats above the white card */}
            <Text style={s.duaTitle}>{activeDua.title}</Text>
          </View>
        </ImageBackground>

        {/* ── Card — 5px margin each side so background peeks through ── */}
        <View style={s.card}>

          {/* Arabic */}
          <Text style={s.arabic}>{activeDua.arabic}</Text>

          {/* Transliteration */}
          {showTranslit && activeDua.transliteration ? (
            <Text style={s.translit}>{activeDua.transliteration}</Text>
          ) : null}

          {/* Translation */}
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
            {/* Loop — circle button */}
            <TouchableOpacity
              style={[s.ctrlCircle, looping ? s.ctrlCircleOn : null]}
              onPress={() => setLooping(v => !v)}
              activeOpacity={0.75}
            >
              <LoopIcon active={looping} size={15} />
            </TouchableOpacity>

            {/* Play / Pause — large green circle with SVG icon */}
            <TouchableOpacity style={s.playBtn} onPress={audio.toggle} activeOpacity={0.88}>
              {audio.playing ? <PauseIcon /> : <PlayIcon />}
            </TouchableOpacity>

            {/* Next — circle button */}
            <TouchableOpacity
              style={s.ctrlCircle}
              onPress={goNext}
              activeOpacity={hasNext ? 0.75 : 1}
            >
              <NextIcon dim={!hasNext} />
            </TouchableOpacity>
          </View>

          {/* Speed row */}
          <View style={s.extraRow}>
            <TouchableOpacity style={s.speedPill} onPress={() => setShowSpeed(v => !v)} activeOpacity={0.8}>
              <Text style={s.speedPillTxt}>{SPEED_LABELS[speedIndex]}</Text>
            </TouchableOpacity>
          </View>

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

          {/* ── Toggles — label left, toggle right, one line each ── */}
          <View style={s.toggleRow}>
            <Text style={s.toggleLabel}>Transliteration</Text>
            <Toggle value={showTranslit} onToggle={() => setShowTranslit(v => !v)} />
          </View>
          <View style={s.toggleRow}>
            <Text style={s.toggleLabel}>Translation</Text>
            <Toggle value={showTrans} onToggle={() => setShowTrans(v => !v)} />
          </View>

          <View style={{ height: spacing(2) }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // White background so the tab bar blends seamlessly with the card
  safe: { flex:1, backgroundColor:"#fff" },

  hero:     { width:"100%", height:HERO_H, justifyContent:"space-between" },
  heroImg:  { resizeMode:"cover" },
  heroScrim:{ ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(20,16,10,0.45)" },

  navRow:  { flexDirection:"row", justifyContent:"space-between", alignItems:"center", paddingHorizontal:spacing(2.5), paddingTop:spacing(1.5) },
  navBtn:  { width:36, height:36, alignItems:"center", justifyContent:"center" },

  heroBottom:   { paddingHorizontal:spacing(2.5), paddingBottom:spacing(1) },
  heroTitle:    { fontFamily:SERIF, fontSize:22, fontWeight:"400", color:"#fff", marginBottom:4, textShadowColor:"rgba(0,0,0,0.4)", textShadowOffset:{width:0,height:1}, textShadowRadius:4 },
  heroSubtitle: { fontSize:15, color:"rgba(255,255,255,0.85)", fontWeight:"400", marginBottom:10 },

  // Dua title — sits above card, over hero image
  duaTitle: {
    fontFamily:SERIF,
    fontSize:30,
    fontWeight:"600",
    color:"#fff",
    textAlign:"center",
    lineHeight:38,
    textShadowColor:"rgba(0,0,0,0.5)",
    textShadowOffset:{ width:0, height:1 },
    textShadowRadius:6,
    marginBottom:spacing(1.5),
  },

  // Card — 5px margin each side so background peeks through
  card: {
    backgroundColor:"#fff",
    borderTopLeftRadius:24,
    borderTopRightRadius:24,
    marginTop:-CARD_OVERLAP,
    marginHorizontal:5,
    paddingHorizontal:spacing(3),
    paddingTop:spacing(3),
    minHeight:SH * 0.72,
    shadowColor:"#1A1408",
    shadowOffset:{ width:0, height:-4 },
    shadowOpacity:0.08,
    shadowRadius:12,
    elevation:8,
  },

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
    marginBottom:spacing(1.75),
    fontWeight:"400",
  },

  progressWrap:  { marginBottom:spacing(2) },
  progressTrack: { height:3, backgroundColor:"#E8E0D0", borderRadius:2, overflow:"hidden" },
  progressFill:  { height:"100%", backgroundColor:colors.primary, borderRadius:2 },

  controls: {
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    paddingHorizontal:spacing(3),
    marginBottom:spacing(1.5),
  },

  // Loop + Next circles — 75% of 48 = 36
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
    shadowOffset:{ width:0, height:4 },
    shadowOpacity:0.35,
    shadowRadius:8,
    elevation:6,
  },

  // Speed — circle shape (equal padding makes it round)
  extraRow:    { flexDirection:"row", justifyContent:"center", marginBottom:spacing(1.5) },
  speedPill:   { width:48, height:48, borderRadius:24, borderWidth:1, borderColor:colors.border, backgroundColor:colors.background, alignItems:"center", justifyContent:"center" },
  speedPillTxt:{ fontSize:13, color:colors.text, fontWeight:"500" },
  speedGrid:   { flexDirection:"row", gap:spacing(0.75), marginBottom:spacing(1.5) },
  speedBtn:    { flex:1, paddingVertical:spacing(0.875), borderRadius:radius.sm, borderWidth:1, borderColor:colors.border, backgroundColor:colors.background, alignItems:"center" },
  speedBtnOn:  { backgroundColor:colors.primary, borderColor:colors.primary },
  speedBtnTxt: { fontSize:12, color:colors.subtext },
  speedBtnTxtOn:{ color:"#fff", fontWeight:"600" },

  // Toggles — label left, toggle right, inline rows, no divider above
  toggleRow: {
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    paddingVertical:6,
    marginBottom:4,
  },
  toggleLabel: {
    fontSize:14,
    color:"#5C534A",
    fontWeight:"500",
  },
});

