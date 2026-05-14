/**
 * DuaDetailScreen.jsx — Safar
 *
 * Dark forest green header + footer with subtle Islamic geometric SVG pattern.
 * Gold divider line. Parchment content area.
 * Five-element control row: ← prev · loop · ▶ play · → next · speed
 */
import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions,
} from "react-native";
import Svg, { Path, Line, G, Polygon, Defs, Pattern, Rect } from "react-native-svg";
import { colors, spacing, radius } from "../theme";

const SERIF      = "SourceSerif4-Regular";
const PARCHMENT  = "#FDFAF4";
const GREEN      = "#1E3D30";
const MID_GREEN  = "#2A5242";
const GOLD       = "#B8922A";
const GOLD_LIGHT = "#C8A96A";

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5];
const SPEED_LABELS  = ["0.5×", "0.75×", "1×", "1.25×", "1.5×"];

// ── Islamic geometric pattern tile ───────────────────────────────────────────
// A 6-pointed star grid rendered as a repeating SVG pattern.
// Drawn at ~8% gold opacity so it adds texture without overwhelming text.
function GeometricPattern({ width, height }) {
  // Each tile is 40×40. Pattern: interlocking hexagons with star centres.
  const tile = 40;
  const cols = Math.ceil(width / tile) + 1;
  const rows = Math.ceil(height / tile) + 1;
  const stars = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = c * tile + (r % 2 === 0 ? 0 : tile / 2);
      const cy = r * tile * 0.866; // √3/2 for hex grid
      // 6-pointed star (Star of David geometry, used widely in Islamic tilework)
      const R = 10; // outer radius
      const ri = 5; // inner radius
      const pts = Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const rad = i % 2 === 0 ? R : ri;
        return `${(cx + rad * Math.cos(angle)).toFixed(1)},${(cy + rad * Math.sin(angle)).toFixed(1)}`;
      }).join(" ");
      stars.push(<Polygon key={`${r}-${c}`} points={pts} fill="none" stroke={GOLD_LIGHT} strokeWidth="0.6" opacity="0.22" />);
    }
  }
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      {stars}
    </Svg>
  );
}

// ── SVG icons — all white for dark green background ──────────────────────────
function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M11 6l-6 6 6 6" stroke={PARCHMENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function BookmarkIcon({ active }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill={active ? GOLD : "none"}>
      <Path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"
        stroke={active ? GOLD : PARCHMENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function PrevIcon({ dim }) {
  const c = dim ? "rgba(253,250,244,0.28)" : PARCHMENT;
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M11 6l-6 6 6 6" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function NextIcon({ dim }) {
  const c = dim ? "rgba(253,250,244,0.28)" : PARCHMENT;
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h14M13 6l6 6-6 6" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function LoopIcon({ active }) {
  const c = active ? GOLD_LIGHT : "rgba(253,250,244,0.70)";
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
      <Path d="M5 3l14 9-14 9V3z" stroke={PARCHMENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function PauseIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Line x1="9" y1="4" x2="9" y2="20" stroke={PARCHMENT} strokeWidth="2.2" strokeLinecap="round"/>
      <Line x1="15" y1="4" x2="15" y2="20" stroke={PARCHMENT} strokeWidth="2.2" strokeLinecap="round"/>
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
  track:   { width:33, height:20, borderRadius:10, backgroundColor:"rgba(253,250,244,0.18)", justifyContent:"center", paddingHorizontal:2 },
  trackOn: { backgroundColor:GOLD },
  knob:    { width:16, height:16, borderRadius:8, backgroundColor:PARCHMENT, shadowColor:"#000", shadowOffset:{width:0,height:1}, shadowOpacity:0.2, shadowRadius:2, elevation:2 },
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
  const [headerH,      setHeaderH]      = useState(80);

  const audio = useAudioPlayer(speedIndex);

  const activeDua = allDuas.length > 0 ? (allDuas[idx] ?? dua) : dua;
  if (!activeDua) return null;

  const hasPrev = idx > 0;
  const hasNext = idx < allDuas.length - 1;
  const goPrev  = () => { if (hasPrev) { setIdx(i => i - 1); audio.repeat(); } };
  const goNext  = () => { if (hasNext) { setIdx(i => i + 1); audio.repeat(); } };

  const pct = Math.min(100, Math.round(audio.progress * 100));
  const { width: SW } = Dimensions.get("window");

  return (
    <SafeAreaView style={s.safe}>

      {/* ── Header — dark green with geometric pattern ── */}
      <View
        style={s.header}
        onLayout={e => setHeaderH(e.nativeEvent.layout.height)}
      >
        {/* Geometric pattern behind header content */}
        <GeometricPattern width={SW} height={headerH} />

        {/* Nav row */}
        <View style={s.navRow}>
          <TouchableOpacity style={s.navBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.8}>
            <BackIcon />
          </TouchableOpacity>
          <TouchableOpacity style={s.navBtn} onPress={() => setBookmarked(v => !v)} activeOpacity={0.8}>
            <BookmarkIcon active={bookmarked} />
          </TouchableOpacity>
        </View>

        {/* Title block */}
        <View style={s.headerCenter}>
          {activeDua.stage ? (
            <Text style={s.headerStage}>{activeDua.stage}</Text>
          ) : null}
          <Text style={s.headerTitle}>{activeDua.title}</Text>
          {allDuas.length > 1 ? (
            <Text style={s.headerCounter}>{idx + 1} of {allDuas.length}</Text>
          ) : null}
        </View>

        {/* Gold divider at bottom of header */}
        <View style={s.headerGoldLine} />
      </View>

      {/* ── Scrollable dua content — parchment ── */}
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
      </ScrollView>

      {/* ── Fixed bottom — dark green with geometric pattern ── */}
      <View style={s.fixedBottom}>
        <GeometricPattern width={SW} height={180} />

        {/* Gold top line */}
        <View style={s.footerGoldLine} />

        {/* Progress bar */}
        <View style={s.progressWrap}>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: pct + "%" }]} />
          </View>
        </View>

        {/* Five-element control row: ← · loop · ▶ play · → · speed */}
        <View style={s.controls}>

          {/* Prev */}
          <TouchableOpacity
            style={s.ctrlBtn}
            onPress={goPrev}
            activeOpacity={hasPrev ? 0.75 : 1}
          >
            <PrevIcon dim={!hasPrev} />
          </TouchableOpacity>

          {/* Loop */}
          <TouchableOpacity
            style={[s.ctrlBtn, looping ? s.ctrlBtnActive : null]}
            onPress={() => setLooping(v => !v)}
            activeOpacity={0.75}
          >
            <LoopIcon active={looping} />
          </TouchableOpacity>

          {/* Play / Pause — large gold-ringed circle, centred */}
          <TouchableOpacity style={s.playBtn} onPress={audio.toggle} activeOpacity={0.88}>
            {audio.playing ? <PauseIcon /> : <PlayIcon />}
          </TouchableOpacity>

          {/* Next */}
          <TouchableOpacity
            style={s.ctrlBtn}
            onPress={goNext}
            activeOpacity={hasNext ? 0.75 : 1}
          >
            <NextIcon dim={!hasNext} />
          </TouchableOpacity>

          {/* Speed */}
          <TouchableOpacity
            style={s.ctrlBtn}
            onPress={() => setShowSpeed(v => !v)}
            activeOpacity={0.8}
          >
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

        {/* Toggles row — label · toggle · spacer · label · toggle */}
        <View style={s.togglesRow}>
          <Text style={s.toggleLabel}>Transliteration</Text>
          <Toggle value={showTranslit} onToggle={() => setShowTranslit(v => !v)} />
          <View style={{ flex:1 }} />
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

  // ── Header — dark green ───────────────────────────────────────────────────────
  header: {
    backgroundColor:GREEN,
    overflow:"hidden",
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
    backgroundColor:"rgba(253,250,244,0.10)",
  },
  headerCenter: {
    alignItems:"center",
    paddingHorizontal:spacing(3),
    paddingBottom:spacing(1.75),
  },
  headerStage: {
    fontSize:10,
    color:GOLD_LIGHT,
    fontWeight:"700",
    textTransform:"uppercase",
    letterSpacing:1.5,
    marginBottom:4,
  },
  headerTitle: {
    fontFamily:SERIF,
    fontSize:18,
    fontWeight:"600",
    color:PARCHMENT,
    textAlign:"center",
    lineHeight:25,
  },
  headerCounter: {
    fontSize:11,
    color:"rgba(253,250,244,0.55)",
    marginTop:4,
  },
  // Gold line at bottom of header
  headerGoldLine: {
    height:1,
    backgroundColor:GOLD_LIGHT,
    opacity:0.60,
  },

  // ── Content ───────────────────────────────────────────────────────────────────
  scroll: { flex:1, backgroundColor:PARCHMENT },
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

  // ── Fixed bottom — dark green ─────────────────────────────────────────────────
  fixedBottom: {
    backgroundColor:GREEN,
    paddingHorizontal:spacing(2.5),
    paddingBottom:spacing(2.5),
    overflow:"hidden",
  },
  footerGoldLine: {
    height:1,
    backgroundColor:GOLD_LIGHT,
    opacity:0.60,
    marginBottom:spacing(1.5),
  },

  progressWrap:  { marginBottom:spacing(1.5) },
  progressTrack: { height:2, backgroundColor:"rgba(253,250,244,0.18)", borderRadius:1, overflow:"hidden" },
  progressFill:  { height:"100%", backgroundColor:GOLD_LIGHT, borderRadius:1 },

  // Five-element control row — equal spacing, play centred and largest
  controls: {
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    paddingHorizontal:spacing(1),
    marginBottom:spacing(1.5),
  },

  // Small ghost circle buttons for prev, loop, next, speed
  ctrlBtn: {
    width:44,
    height:44,
    borderRadius:22,
    alignItems:"center",
    justifyContent:"center",
    backgroundColor:"rgba(253,250,244,0.08)",
    borderWidth:1,
    borderColor:"rgba(253,250,244,0.16)",
  },
  ctrlBtnActive: {
    backgroundColor:"rgba(200,169,106,0.22)",
    borderColor:GOLD_LIGHT,
  },

  // Play — larger solid gold-bordered circle
  playBtn: {
    width:68,
    height:68,
    borderRadius:34,
    backgroundColor:MID_GREEN,
    borderWidth:1.5,
    borderColor:GOLD_LIGHT,
    alignItems:"center",
    justifyContent:"center",
    shadowColor:"#000",
    shadowOffset:{width:0,height:4},
    shadowOpacity:0.30,
    shadowRadius:8,
    elevation:6,
  },

  speedTxt: {
    fontSize:11,
    color:"rgba(253,250,244,0.80)",
    fontWeight:"600",
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
    borderColor:"rgba(253,250,244,0.22)",
    backgroundColor:"transparent",
    alignItems:"center",
  },
  speedBtnOn:    { backgroundColor:GOLD, borderColor:GOLD },
  speedBtnTxt:   { fontSize:11, color:"rgba(253,250,244,0.70)" },
  speedBtnTxtOn: { color:GREEN, fontWeight:"700" },

  // Toggles — one line on dark green
  togglesRow: {
    flexDirection:"row",
    alignItems:"center",
    gap:8,
    paddingTop:2,
  },
  toggleLabel: {
    fontSize:12,
    color:"rgba(253,250,244,0.70)",
    fontWeight:"500",
  },
});
