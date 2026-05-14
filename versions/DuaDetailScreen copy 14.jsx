/**
 * DuaDetailScreen.jsx — Safar  (Option C)
 * Full-screen parchment layout — no hero image.
 *
 * Structure:
 *   SafeAreaView (parchment)
 *     Header row: ‹ back · title centered · bookmark
 *     1pt gold divider line
 *     ScrollView: stage label · dua title · Arabic · translit · translation
 *     Fixed bottom: progress · controls · speed+toggles row
 */
import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions,
} from "react-native";
import Svg, { Path, Line } from "react-native-svg";
import { colors, spacing, radius } from "../theme";

const SERIF     = "SourceSerif4-Regular";
const PARCHMENT = "#FDFAF4";
const GOLD      = "#B8922A";
const GOLD_LIGHT = "#C8A96A";
const { height: SH } = Dimensions.get("window");

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5];
const SPEED_LABELS  = ["0.5×", "0.75×", "1×", "1.25×", "1.5×"];

// ── SVG icons ─────────────────────────────────────────────────────────────────
function BackIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M11 6l-6 6 6 6" stroke="#1E3D30" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function BookmarkIcon({ active }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill={active ? GOLD : "none"}>
      <Path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"
        stroke={active ? GOLD : "#1E3D30"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function LoopIcon({ active, size = 15 }) {
  const c = active ? PARCHMENT : "#5C534A";
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
  const c = dim ? "#C8C0B0" : "#5C534A";
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

  const hasNext = idx < allDuas.length - 1;
  const goNext  = () => { if (hasNext) { setIdx(i => i + 1); audio.repeat(); } };

  const pct = Math.min(100, Math.round(audio.progress * 100));

  return (
    <SafeAreaView style={s.safe}>

      {/* ── Header row: back · title · bookmark ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.8}>
          <BackIcon />
        </TouchableOpacity>

        <View style={s.headerCenter}>
          {/* Stage label — small gold uppercase above title */}
          {activeDua.stage ? (
            <Text style={s.headerStage}>{activeDua.stage}</Text>
          ) : null}
          {/* Du'ā title — centered, serif, dark green */}
          <Text style={s.headerTitle}>{activeDua.title}</Text>
          {/* Counter if navigating a list */}
          {allDuas.length > 1 ? (
            <Text style={s.headerCounter}>{idx + 1} of {allDuas.length}</Text>
          ) : null}
        </View>

        <TouchableOpacity style={s.headerBtn} onPress={() => setBookmarked(v => !v)} activeOpacity={0.8}>
          <BookmarkIcon active={bookmarked} />
        </TouchableOpacity>
      </View>

      {/* Gold divider line */}
      <View style={s.goldLine} />

      {/* ── Scrollable dua content ── */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
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
      </ScrollView>

      {/* ── Fixed bottom: progress · controls · speed+toggles ── */}
      <View style={s.fixedBottom}>

        {/* Thin separator */}
        <View style={s.bottomSep} />

        {/* Progress bar */}
        <View style={s.progressWrap}>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: pct + "%" }]} />
          </View>
        </View>

        {/* Controls: loop · play · next */}
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

        {/* Speed picker (expands above when open) */}
        {showSpeed ? (
          <View style={s.speedGrid}>
            {SPEED_OPTIONS.map((_, i) => (
              <TouchableOpacity
                key={i}
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

        {/* One line: Transliteration [toggle] · [speed] · Translation [toggle] */}
        <View style={s.bottomRow}>
          <Text style={s.toggleLabel}>Transliteration</Text>
          <Toggle value={showTranslit} onToggle={() => setShowTranslit(v => !v)} />

          <TouchableOpacity
            style={s.speedCircle}
            onPress={() => setShowSpeed(v => !v)}
            activeOpacity={0.8}
          >
            <Text style={s.speedTxt}>{SPEED_LABELS[speedIndex]}</Text>
          </TouchableOpacity>

          <Text style={s.toggleLabel}>Translation</Text>
          <Toggle value={showTrans} onToggle={() => setShowTrans(v => !v)} />
        </View>

      </View>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({

  safe: { flex:1, backgroundColor:PARCHMENT },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection:"row",
    alignItems:"flex-start",
    justifyContent:"space-between",
    paddingHorizontal:spacing(2),
    paddingTop:spacing(1.5),
    paddingBottom:spacing(1.5),
    backgroundColor:"#EDE0CC",
  },
  headerBtn: {
    width:40,
    height:40,
    alignItems:"center",
    justifyContent:"center",
    borderRadius:20,
    backgroundColor:"rgba(160,140,110,0.18)",
    marginTop:2,
  },
  headerCenter: {
    flex:1,
    alignItems:"center",
    paddingHorizontal:spacing(1),
  },
  headerStage: {
    fontSize:10,
    color:GOLD,
    fontWeight:"700",
    textTransform:"uppercase",
    letterSpacing:1.5,
    marginBottom:3,
  },
  headerTitle: {
    fontFamily:SERIF,
    fontSize:18,
    fontWeight:"600",
    color:"#1E3D30",
    textAlign:"center",
    lineHeight:25,
  },
  headerCounter: {
    fontSize:11,
    color:"#8A7D70",
    marginTop:2,
  },

  // ── Gold divider line ────────────────────────────────────────────────────────
  goldLine: {
    height:1,
    backgroundColor:GOLD_LIGHT,
    marginHorizontal:spacing(2.5),
    marginBottom:spacing(0.5),
    opacity:0.55,
  },

  // ── Scrollable content ───────────────────────────────────────────────────────
  scroll: { flex:1 },
  scrollContent: {
    paddingHorizontal:spacing(3) + 15,
    paddingTop:spacing(3),
    paddingBottom:spacing(2),
  },

  arabic: {
    fontFamily:SERIF,
    fontSize:32,
    textAlign:"center",
    color:"#1A1408",
    lineHeight:56,
    marginBottom:spacing(2.5),
    writingDirection:"rtl",
  },
  translit: {
    fontSize:17,
    fontStyle:"italic",
    textAlign:"center",
    color:"#6B6055",
    lineHeight:26,
    marginBottom:spacing(2),
    fontWeight:"400",
  },
  translation: {
    fontFamily:SERIF,
    fontSize:17,
    textAlign:"center",
    color:"#2A2218",
    lineHeight:28,
    marginBottom:spacing(1.5),
    fontWeight:"400",
  },

  // ── Fixed bottom — mirrors header colour ─────────────────────────────────────
  fixedBottom: {
    paddingHorizontal:spacing(2.5),
    paddingBottom:spacing(2),
    paddingTop:spacing(1.5),
    backgroundColor:"#EDE0CC",
  },
  bottomSep: { height:0 },

  progressWrap:  { marginBottom:spacing(1.75) },
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

  speedGrid: {
    flexDirection:"row",
    gap:spacing(0.75),
    marginBottom:spacing(1),
  },
  speedBtn: {
    flex:1,
    paddingVertical:spacing(0.75),
    borderRadius:radius.sm,
    borderWidth:1,
    borderColor:"#C8BFB2",
    backgroundColor:"transparent",
    alignItems:"center",
  },
  speedBtnOn:   { backgroundColor:colors.primary, borderColor:colors.primary },
  speedBtnTxt:  { fontSize:11, color:"#5C534A" },
  speedBtnTxtOn:{ color:"#fff", fontWeight:"600" },

  // Single bottom row: label · toggle · [speed] · label · toggle
  bottomRow: {
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    paddingTop:4,
  },
  toggleLabel: {
    fontSize:13,
    color:"#5C534A",
    fontWeight:"500",
  },
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
});
