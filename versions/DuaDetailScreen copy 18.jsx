/**
 * DuaDetailScreen.jsx — Safar
 *
 * Sage header + footer (CAC6B9). Gold divider. Parchment content.
 * Five-element control row: ← prev · loop · ▶ play · → next · speed
 * Ask about this du'ā → AskModal
 */
import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions,
} from "react-native";
import Svg, { Path, Line } from "react-native-svg";
import { colors, spacing, radius } from "../theme";
import AskModal from "../components/AskModal";

const SERIF      = "SourceSerif4-Regular";
const PARCHMENT  = "#FDFAF4";
const GREEN      = "#CAC6B9";
const GOLD       = "#B8922A";
const GOLD_LIGHT = "#C8A96A";

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5];
const SPEED_LABELS  = ["0.5×", "0.75×", "1×", "1.25×", "1.5×"];

// ── SVG icons ─────────────────────────────────────────────────────────────────
function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M11 6l-6 6 6 6" stroke="#3A3530" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function BookmarkIcon({ active }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill={active ? GOLD : "none"}>
      <Path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"
        stroke={active ? GOLD : "#3A3530"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function PrevIcon({ dim }) {
  const c = dim ? "rgba(58,53,48,0.28)" : "#3A3530";
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M11 6l-6 6 6 6" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function NextIcon({ dim }) {
  const c = dim ? "rgba(58,53,48,0.28)" : "#3A3530";
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h14M13 6l6 6-6 6" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function LoopIcon({ active }) {
  const c = active ? GOLD : "rgba(58,53,48,0.65)";
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M17 2l4 4-4 4" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M3 11V9a4 4 0 014-4h14" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M7 22l-4-4 4-4" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M21 13v2a4 4 0 01-4 4H3" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function PlayIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path d="M5 3l14 9-14 9V3z" stroke="#3A3530" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function PauseIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Line x1="9" y1="4" x2="9" y2="20" stroke="#3A3530" strokeWidth="2.2" strokeLinecap="round"/>
      <Line x1="15" y1="4" x2="15" y2="20" stroke="#3A3530" strokeWidth="2.2" strokeLinecap="round"/>
    </Svg>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ value, onToggle }) {
  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.75}
      style={[tog.track, value ? tog.trackOn : null]}>
      <View style={[tog.knob, value ? tog.knobOn : null]} />
    </TouchableOpacity>
  );
}
const tog = StyleSheet.create({
  track:   { width:33, height:20, borderRadius:10, backgroundColor:"rgba(100,95,88,0.20)", justifyContent:"center", paddingHorizontal:2 },
  trackOn: { backgroundColor:GOLD },
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
  const [showAsk,      setShowAsk]      = useState(false);
  const [showSpeed,    setShowSpeed]    = useState(false);

  const audio = useAudioPlayer(speedIndex);

  const activeDua = allDuas.length > 0 ? (allDuas[idx] ?? dua) : dua;
  if (!activeDua) return null;

  const hasPrev = idx > 0;
  const hasNext = idx < allDuas.length - 1;
  const goPrev  = () => { if (hasPrev) { setIdx(i => i - 1); audio.repeat(); } };
  const goNext  = () => { if (hasNext) { setIdx(i => i + 1); audio.repeat(); } };

  const pct = Math.min(100, Math.round(audio.progress * 100));

  return (
    <>
      <SafeAreaView style={s.safe}>

        {/* ── Header — sage ── */}
        <View style={s.header}>
          <View style={s.navRow}>
            <TouchableOpacity style={s.navBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.8}>
              <BackIcon />
            </TouchableOpacity>
            <TouchableOpacity style={s.navBtn} onPress={() => setBookmarked(v => !v)} activeOpacity={0.8}>
              <BookmarkIcon active={bookmarked} />
            </TouchableOpacity>
          </View>

          <View style={s.headerCenter}>
            {activeDua.stage ? (
              <Text style={s.headerStage}>{activeDua.stage}</Text>
            ) : null}
            <Text style={s.headerTitle}>{activeDua.title}</Text>
            {allDuas.length > 1 ? (
              <Text style={s.headerCounter}>{idx + 1} of {allDuas.length}</Text>
            ) : null}
          </View>

          <View style={s.headerGoldLine} />
        </View>

        {/* ── Scrollable content — parchment ── */}
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
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

          {/* Ask about this du'ā */}
          <TouchableOpacity style={s.askLink} onPress={() => setShowAsk(true)} activeOpacity={0.75}>
            <View style={s.askDot} />
            <Text style={s.askLinkTxt}>{"Ask about this du\u02bf\u0101\u02be"}</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* ── Fixed bottom — sage ── */}
        <View style={s.fixedBottom}>
          <View style={s.footerGoldLine} />

          {/* Progress bar */}
          <View style={s.progressWrap}>
            <View style={s.progressTrack}>
              <View style={[s.progressFill, { width: pct + "%" }]} />
            </View>
          </View>

          {/* Five controls: ← loop ▶ → speed */}
          <View style={s.controls}>
            <TouchableOpacity style={s.ctrlBtn} onPress={goPrev} activeOpacity={hasPrev ? 0.75 : 1}>
              <PrevIcon dim={!hasPrev} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.ctrlBtn, looping ? s.ctrlBtnActive : null]}
              onPress={() => setLooping(v => !v)}
              activeOpacity={0.75}
            >
              <LoopIcon active={looping} />
            </TouchableOpacity>

            <TouchableOpacity style={s.playBtn} onPress={audio.toggle} activeOpacity={0.88}>
              {audio.playing ? <PauseIcon /> : <PlayIcon />}
            </TouchableOpacity>

            <TouchableOpacity style={s.ctrlBtn} onPress={goNext} activeOpacity={hasNext ? 0.75 : 1}>
              <NextIcon dim={!hasNext} />
            </TouchableOpacity>

            <TouchableOpacity style={s.ctrlBtn} onPress={() => setShowSpeed(v => !v)} activeOpacity={0.8}>
              <Text style={s.speedTxt}>{SPEED_LABELS[speedIndex]}</Text>
            </TouchableOpacity>
          </View>

          {/* Speed picker */}
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

          {/* Toggles — one line */}
          <View style={s.togglesRow}>
            <Text style={s.toggleLabel}>Transliteration</Text>
            <Toggle value={showTranslit} onToggle={() => setShowTranslit(v => !v)} />
            <View style={{ flex:1 }} />
            <Text style={s.toggleLabel}>Translation</Text>
            <Toggle value={showTrans} onToggle={() => setShowTrans(v => !v)} />
          </View>
        </View>

      </SafeAreaView>

      {/* AskModal — outside SafeAreaView, inside Fragment */}
      {activeDua && (
        <AskModal
          visible={showAsk}
          onClose={() => setShowAsk(false)}
          context={`The user is reading this du\u02bf\u0101\u02be:\n\nTitle: ${activeDua.title}\nStage: ${activeDua.stage ?? ""}\nArabic: ${activeDua.arabic}\nTransliteration: ${activeDua.transliteration ?? ""}\nTranslation: ${activeDua.translation ?? ""}\nSource: ${activeDua.source ?? ""}`}
          contextLabel={activeDua.title}
        />
      )}
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({

  safe: { flex:1, backgroundColor:GREEN },

  // Header — sage
  header: {
    backgroundColor:GREEN,
  },
  navRow: {
    flexDirection:"row",
    justifyContent:"space-between",
    paddingHorizontal:spacing(2),
    paddingTop:spacing(1.5),
    paddingBottom:spacing(0.5),
  },
  navBtn: {
    width:36,
    height:36,
    alignItems:"center",
    justifyContent:"center",
    borderRadius:18,
    backgroundColor:"rgba(58,53,48,0.08)",
  },
  headerCenter: {
    alignItems:"center",
    paddingHorizontal:spacing(3),
    paddingBottom:spacing(1.75),
  },
  headerStage: {
    fontSize:10,
    color:GOLD,
    fontWeight:"700",
    textTransform:"uppercase",
    letterSpacing:1.5,
    marginBottom:4,
  },
  headerTitle: {
    fontFamily:SERIF,
    fontSize:18,
    fontWeight:"600",
    color:"#2A2218",
    textAlign:"center",
    lineHeight:25,
  },
  headerCounter: {
    fontSize:11,
    color:"rgba(58,53,48,0.50)",
    marginTop:4,
  },
  headerGoldLine: {
    height:1,
    backgroundColor:GOLD_LIGHT,
    opacity:0.60,
  },

  // Content — parchment
  scroll:        { flex:1, backgroundColor:PARCHMENT },
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

  // Ask link
  askLink: {
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"center",
    gap:7,
    paddingVertical:14,
    marginTop:4,
  },
  askDot: {
    width:7,
    height:7,
    borderRadius:3.5,
    backgroundColor:GOLD,
  },
  askLinkTxt: {
    fontSize:14,
    color:GOLD,
    fontWeight:"600",
  },

  // Fixed bottom — sage
  fixedBottom: {
    backgroundColor:GREEN,
    paddingHorizontal:spacing(2.5),
    paddingBottom:spacing(2.5),
  },
  footerGoldLine: {
    height:1,
    backgroundColor:GOLD_LIGHT,
    opacity:0.60,
    marginBottom:spacing(1.5),
  },

  progressWrap:  { marginBottom:spacing(1.5) },
  progressTrack: { height:2, backgroundColor:"rgba(58,53,48,0.15)", borderRadius:1, overflow:"hidden" },
  progressFill:  { height:"100%", backgroundColor:GOLD, borderRadius:1 },

  controls: {
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    paddingHorizontal:spacing(1),
    marginBottom:spacing(1.5),
  },
  ctrlBtn: {
    width:44,
    height:44,
    borderRadius:22,
    alignItems:"center",
    justifyContent:"center",
    backgroundColor:"rgba(58,53,48,0.08)",
    borderWidth:1,
    borderColor:"rgba(58,53,48,0.14)",
  },
  ctrlBtnActive: {
    backgroundColor:"rgba(184,146,42,0.15)",
    borderColor:GOLD,
  },
  playBtn: {
    width:68,
    height:68,
    borderRadius:34,
    backgroundColor:PARCHMENT,
    borderWidth:1.5,
    borderColor:GOLD,
    alignItems:"center",
    justifyContent:"center",
    shadowColor:"#4A2E10",
    shadowOffset:{width:0,height:3},
    shadowOpacity:0.18,
    shadowRadius:8,
    elevation:4,
  },

  speedTxt: { fontSize:11, color:"rgba(58,53,48,0.70)", fontWeight:"600" },
  speedGrid: { flexDirection:"row", gap:spacing(0.75), marginBottom:spacing(1) },
  speedBtn:  { flex:1, paddingVertical:spacing(0.75), borderRadius:radius.sm, borderWidth:1, borderColor:"rgba(58,53,48,0.20)", backgroundColor:"transparent", alignItems:"center" },
  speedBtnOn:    { backgroundColor:GOLD, borderColor:GOLD },
  speedBtnTxt:   { fontSize:11, color:"rgba(58,53,48,0.60)" },
  speedBtnTxtOn: { color:PARCHMENT, fontWeight:"700" },

  togglesRow: {
    flexDirection:"row",
    alignItems:"center",
    gap:8,
    paddingTop:2,
  },
  toggleLabel: {
    fontSize:12,
    color:"rgba(58,53,48,0.65)",
    fontWeight:"500",
  },
});
