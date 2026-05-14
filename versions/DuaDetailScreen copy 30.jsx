/**
 * DuaDetailScreen.jsx — Safar
 * Pixel-accurate recreation of the reference design:
 * - Warm off-white background (#F5F0E8)
 * - Geometric SVG pattern as subtle header texture
 * - Gold 8-pointed star ornament as section dividers
 * - Large centered Arabic, italic transliteration, serif translation
 * - Dark sage-green (#4A5C48) fixed controls bar with icon labels
 * - Gold active toggles, vertical divider between them
 */
import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Line, Circle, G, Polygon } from "react-native-svg";
import { spacing, radius } from "../theme";
import AskModal from "../components/AskModal";
import { HEADER_PATTERN_PATH, HEADER_PATTERN_VIEWBOX } from "./headerPattern";

// ── Design tokens ─────────────────────────────────────────────────────────────
const SERIF      = "SourceSerif4-Regular";
const BG         = "#F5F0E8";   // warm off-white
const DARK_TEXT  = "#1C1A14";   // near-black for Arabic + translation
const MID_TEXT   = "#4A3F30";   // body text
const MUTED      = "#8A7D6A";   // counter, muted labels
const GOLD       = "#BF9F60";   // gold ornaments, active states
const GOLD_DARK  = "#9A7A3A";   // darker gold for text labels
const CTRL_BG    = "#4A5C48";   // dark sage-green controls bar
const CTRL_ICON  = "#E8E0D0";   // parchment icons on dark bar
const CTRL_MUTED = "#8A9E88";   // muted labels on dark bar

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5];
const SPEED_LABELS  = ["0.5×", "0.75×", "1×", "1.25×", "1.5×"];

// ── 8-pointed star ornament (gold) ───────────────────────────────────────────
function StarOrnament({ size = 20, color = GOLD }) {
  // Two overlapping squares rotated 45° = 8-pointed star
  const c = size / 2;
  const r = size * 0.38;
  const pts1 = Array.from({ length: 4 }, (_, i) => {
    const a = (i * 90 - 45) * Math.PI / 180;
    return `${(c + r * Math.cos(a)).toFixed(1)},${(c + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  const pts2 = Array.from({ length: 4 }, (_, i) => {
    const a = (i * 90) * Math.PI / 180;
    return `${(c + r * Math.cos(a)).toFixed(1)},${(c + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Polygon points={pts1} fill={color} opacity="0.9" />
      <Polygon points={pts2} fill={color} opacity="0.9" />
    </Svg>
  );
}

// ── Ornament divider: line · star · line ─────────────────────────────────────
function OrnamentDivider() {
  return (
    <View style={od.row}>
      <View style={od.line} />
      <StarOrnament size={14} color={GOLD} />
      <View style={od.line} />
    </View>
  );
}
const od = StyleSheet.create({
  row:  { flexDirection:"row", alignItems:"center", marginVertical:22, paddingHorizontal:40 },
  line: { flex:1, height:1, backgroundColor:GOLD, opacity:0.35 },
});

// ── Header pattern (geometric SVG, very subtle) ───────────────────────────────
function HeaderPattern({ width, height }) {
  // viewBox height doubled (352.6 → 705) so the pattern is half the visual size.
  // absoluteFill covers the headerZone regardless of its actual height.
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 1052.1 705"
      preserveAspectRatio="xMidYMin slice"
      style={StyleSheet.absoluteFill}
    >
      <Path
        d={HEADER_PATTERN_PATH}
        fill={GOLD}
        opacity="0.14"
      />
    </Svg>
  );
}

// ── Arch frame — pointed Islamic arch drawn at bottom of header ───────────────
// A subtle teardrop/pointed arch that frames the title zone.
// Drawn as a single SVG path: two arcs meeting at a point at the top.
function ArchFrame({ width }) {
  const W = width;
  const H = 220;           // total arch height
  const archW = W * 0.72;  // arch opening width
  const xL = (W - archW) / 2;
  const xR = xL + archW;
  const cx = W / 2;
  // The arch: start bottom-left corner, arc up to a pointed top, arc down to bottom-right
  // Using two cubic bezier curves to create the classical pointed Islamic arch shape
  const cp1 = archW * 0.18;   // control point inset from edge
  const peakY = 12;            // how far the point extends above the arch crown
  const shoulderY = H * 0.55; // where the curves start their upward sweep
  const d = [
    `M ${xL} ${H}`,
    `C ${xL} ${shoulderY} ${cx - cp1} ${peakY + 18} ${cx} ${peakY}`,
    `C ${cx + cp1} ${peakY + 18} ${xR} ${shoulderY} ${xR} ${H}`,
  ].join(" ");
  return (
    <Svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      <Path
        d={d}
        fill="none"
        stroke={GOLD}
        strokeWidth="1"
        opacity="0.30"
      />
    </Svg>
  );
}


function Counter({ current, total }) {
  return (
    <View style={ctr.row}>
      <View style={ctr.line} />
      <View style={ctr.dot} />
      <Text style={ctr.txt}>{current} of {total}</Text>
      <View style={ctr.dot} />
      <View style={ctr.line} />
    </View>
  );
}
const ctr = StyleSheet.create({
  row:  { flexDirection:"row", alignItems:"center", gap:8, marginTop:6 },
  line: { width:28, height:1, backgroundColor:GOLD, opacity:0.45 },
  dot:  { width:5, height:5, borderRadius:2.5, backgroundColor:GOLD },
  txt:  { fontSize:13, color:MUTED, fontWeight:"700" },
});

// ── SVG icons — all parchment on dark bar ─────────────────────────────────────
function IconBack({ color = CTRL_ICON, size = 22 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M11 6l-6 6 6 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function IconBookmark({ active, size = 22 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={active ? GOLD : "none"}>
      <Path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"
        stroke={active ? GOLD : MID_TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function IconRepeat({ size = 22, color = CTRL_ICON }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M17 2l4 4-4 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M3 11V9a4 4 0 014-4h14" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M7 22l-4-4 4-4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M21 13v2a4 4 0 01-4 4H3" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function IconPlay({ size = 28 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 3l14 9-14 9V3z" stroke={MID_TEXT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function IconPause({ size = 28 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="9" y1="4" x2="9" y2="20" stroke={MID_TEXT} strokeWidth="2.2" strokeLinecap="round"/>
      <Line x1="15" y1="4" x2="15" y2="20" stroke={MID_TEXT} strokeWidth="2.2" strokeLinecap="round"/>
    </Svg>
  );
}

function IconArrowRight({ dim, size = 22, color = CTRL_ICON }) {
  const c = dim ? "rgba(232,224,208,0.28)" : color;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h14M13 6l6 6-6 6" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function IconArrowLeft({ dim, size = 22, color = CTRL_ICON }) {
  const c = dim ? "rgba(232,224,208,0.28)" : color;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M11 6l-6 6 6 6" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function IconChat({ size = 16 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
        stroke={GOLD_DARK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

// ── Modern toggle ─────────────────────────────────────────────────────────────
function Toggle({ value, onToggle }) {
  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.8}
      style={[tog.track, value ? tog.trackOn : null]}>
      <View style={[tog.knob, value ? tog.knobOn : null]} />
    </TouchableOpacity>
  );
}
const tog = StyleSheet.create({
  track:   { width:44, height:26, borderRadius:13, backgroundColor:"rgba(232,224,208,0.22)", justifyContent:"center", paddingHorizontal:3 },
  trackOn: { backgroundColor:GOLD },
  knob:    { width:20, height:20, borderRadius:10, backgroundColor:"#fff", shadowColor:"#000", shadowOffset:{width:0,height:1}, shadowOpacity:0.22, shadowRadius:3, elevation:2 },
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
          const n = p + 0.1 * SPEED_OPTIONS[speedIndex];
          if (n >= DURATION) { setPlaying(false); clearInterval(timer.current); return DURATION; }
          return n;
        });
      }, 100);
    } else { clearInterval(timer.current); }
    return () => clearInterval(timer.current);
  }, [playing, speedIndex]);
  return {
    playing,
    progress: elapsed / DURATION,
    toggle: () => setPlaying(v => !v),
    repeat: () => { setElapsed(0); setPlaying(true); },
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
  const { width: SW } = Dimensions.get("window");
  const insets = useSafeAreaInsets();

  const activeDua = allDuas.length > 0 ? (allDuas[idx] ?? dua) : dua;
  if (!activeDua) return null;

  const hasPrev = idx > 0;
  const hasNext = idx < allDuas.length - 1;
  const goPrev  = () => { if (hasPrev) { setIdx(i => i - 1); audio.repeat(); } };
  const goNext  = () => { if (hasNext) { setIdx(i => i + 1); audio.repeat(); } };
  const pct     = Math.min(100, Math.round(audio.progress * 100));

  return (
    <>
      <View style={[s.safe, { paddingBottom: 0 }]}>

        {/* ── Header zone: full bleed to top of screen ── */}
        <View style={s.headerZone}>
          {/* Geometric pattern — fixed 400px height, never reflows on dua change */}
          <HeaderPattern width={SW} height={400} />

          {/* Subtle pointed arch framing the title */}
          <ArchFrame width={SW} />

          {/* Spacer so content clears the floating nav buttons — 15px less to pull block up */}
          <View style={{ height: insets.top + 22 }} />

          {/* Star ornament */}
          <View style={s.headerStar}>
            <StarOrnament size={22} color={GOLD} />
          </View>

          {/* Stage label */}
          {activeDua.stage ? (
            <Text style={s.stageLabel}>{(activeDua.stage ?? "").toUpperCase()}</Text>
          ) : null}

          {/* Du'ā title */}
          <Text style={s.duaTitle}>{activeDua.title}</Text>

          {/* Counter */}
          {allDuas.length > 1 ? (
            <Counter current={idx + 1} total={allDuas.length} />
          ) : null}
        </View>

        {/* ── Nav buttons: absolutely positioned over header ── */}
        <View style={[s.topNav, { top: insets.top + 8 }]}>
          <TouchableOpacity style={s.navCircle} onPress={() => navigation?.goBack?.()} activeOpacity={0.8}>
            <IconBack color={MID_TEXT} size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={s.navCircle} onPress={() => setBookmarked(v => !v)} activeOpacity={0.8}>
            <IconBookmark active={bookmarked} size={20} />
          </TouchableOpacity>
        </View>

        {/* ── Scrollable content ── */}
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Arabic */}
          <Text style={s.arabic}>{activeDua.arabic}</Text>

          {/* Ornament divider before transliteration */}
          {showTranslit && activeDua.transliteration ? <OrnamentDivider /> : null}

          {/* Transliteration */}
          {showTranslit && activeDua.transliteration ? (
            <Text style={s.translit}>{activeDua.transliteration}</Text>
          ) : null}

          {/* Ornament divider before translation */}
          {showTrans && activeDua.translation ? <OrnamentDivider /> : null}

          {/* Translation */}
          {showTrans && activeDua.translation ? (
            <Text style={s.translation}>{activeDua.translation}</Text>
          ) : null}

          {/* Ask pill button */}
          <TouchableOpacity style={s.askPill} onPress={() => setShowAsk(true)} activeOpacity={0.8}>
            <IconChat size={15} />
            <Text style={s.askPillTxt}>{"Ask about this du\u02bf\u0101\u02be"}</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* ── Fixed controls bar — dark sage green, bleeds to screen bottom ── */}
        <View style={[s.ctrlBar, { paddingBottom: spacing(2) + insets.bottom }]}>

          {/* Progress bar */}
          <View style={s.progressWrap}>
            <View style={s.progressTrack}>
              <View style={[s.progressFill, { width: pct + "%" }]} />
            </View>
          </View>

          {/* Five controls with labels */}
          <View style={s.ctrlRow}>

            {/* Repeat / Loop — shifted down 8px */}
            <TouchableOpacity style={[s.ctrlItem, {marginTop:8}]} onPress={() => setLooping(v => !v)} activeOpacity={0.8}>
              <View style={[s.ctrlCircle, looping ? s.ctrlCircleOn : null]}>
                <IconRepeat size={15} color={looping ? GOLD : CTRL_ICON} />
              </View>
              <Text style={[s.ctrlLabel, looping ? s.ctrlLabelOn : null]}>Repeat</Text>
            </TouchableOpacity>

            {/* Previous — shifted down 8px */}
            <TouchableOpacity style={[s.ctrlItem, {marginTop:8}]} onPress={goPrev} activeOpacity={hasPrev ? 0.75 : 1}>
              <View style={s.ctrlCircle}>
                <IconArrowLeft dim={!hasPrev} size={15} />
              </View>
              <Text style={s.ctrlLabel}>Previous</Text>
            </TouchableOpacity>

            {/* Play / Pause — stays at original vertical position, then up 5px more */}
            <TouchableOpacity style={[s.ctrlItem, {marginTop:-5}]} onPress={audio.toggle} activeOpacity={0.88}>
              <View style={s.playCircle}>
                {audio.playing ? <IconPause size={26} /> : <IconPlay size={26} />}
              </View>
            </TouchableOpacity>

            {/* Next — shifted down 8px */}
            <TouchableOpacity style={[s.ctrlItem, {marginTop:8}]} onPress={goNext} activeOpacity={hasNext ? 0.75 : 1}>
              <View style={s.ctrlCircle}>
                <IconArrowRight dim={!hasNext} size={15} />
              </View>
              <Text style={s.ctrlLabel}>Next</Text>
            </TouchableOpacity>

            {/* Speed — shifted down 8px */}
            <TouchableOpacity style={[s.ctrlItem, {marginTop:8}]} onPress={() => setShowSpeed(v => !v)} activeOpacity={0.8}>
              <View style={s.ctrlCircle}>
                <Text style={s.speedCircleTxt}>{SPEED_LABELS[speedIndex]}</Text>
              </View>
              <Text style={s.ctrlLabel}>Speed</Text>
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

        </View>

        {/* Toggles — float over the system nav bar at the very bottom */}
        <View style={[s.togglesOverlay, { bottom: insets.bottom > 0 ? insets.bottom - 8 : 8 }]}>
          <Text style={s.toggleLabel}>Transliteration</Text>
          <Toggle value={showTranslit} onToggle={() => setShowTranslit(v => !v)} />
          <View style={s.toggleDivider} />
          <Text style={s.toggleLabel}>Translation</Text>
          <Toggle value={showTrans} onToggle={() => setShowTrans(v => !v)} />
        </View>

      </View>

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

  safe: { flex:1, backgroundColor:BG },

  // Nav buttons — absolutely positioned over the header
  topNav: {
    position:"absolute",
    left:0,
    right:0,
    flexDirection:"row",
    justifyContent:"space-between",
    paddingHorizontal:spacing(2),
    zIndex:20,
  },
  navCircle: {
    width:40,
    height:40,
    borderRadius:20,
    backgroundColor:"rgba(255,255,255,0.75)",
    alignItems:"center",
    justifyContent:"center",
    shadowColor:"#2A1A08",
    shadowOffset:{width:0,height:1},
    shadowOpacity:0.08,
    shadowRadius:4,
    elevation:2,
  },

  // Header zone — full bleed to top of screen, no top padding (inset spacer in JSX)
  headerZone: {
    alignItems:"center",
    paddingBottom:spacing(2),
    overflow:"hidden",
    backgroundColor:BG,
  },

  // Star sits below the inset spacer
  headerStar: {
    marginBottom:5,
    zIndex:2,
  },
  stageLabel: {
    fontSize:11,
    fontWeight:"700",
    color:GOLD,
    letterSpacing:2,
    textTransform:"uppercase",
    marginBottom:6,
  },
  duaTitle: {
    fontFamily:SERIF,
    fontSize:32,
    fontWeight:"600",
    color:DARK_TEXT,
    textAlign:"center",
    lineHeight:40,
    paddingHorizontal:spacing(3),
  },

  // Content scroll
  scroll:        { flex:1 },
  scrollContent: {
    paddingHorizontal:spacing(3) + 15,
    paddingTop:spacing(3),
    paddingBottom:spacing(2),
  },

  arabic: {
    fontFamily:SERIF,
    fontSize:32,
    textAlign:"center",
    color:DARK_TEXT,
    lineHeight:56,
    writingDirection:"rtl",
    hyphens:"none",
  },
  translit: {
    fontSize:17,
    fontStyle:"italic",
    textAlign:"center",
    color:MID_TEXT,
    lineHeight:27,
    fontWeight:"400",
    marginTop:10,
  },
  translation: {
    fontFamily:SERIF,
    fontSize:18,
    textAlign:"center",
    color:DARK_TEXT,
    lineHeight:30,
    fontWeight:"400",
    marginTop:10,
  },

  // Ask pill — outlined gold, compact
  askPill: {
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"center",
    gap:5,
    alignSelf:"center",
    marginTop:20,
    marginBottom:6,
    paddingHorizontal:14,
    paddingVertical:7,
    borderRadius:50,
    borderWidth:1,
    borderColor:GOLD,
    backgroundColor:"rgba(191,159,96,0.07)",
  },
  askPillTxt: {
    fontSize:12,
    color:GOLD_DARK,
    fontWeight:"600",
  },

  // Controls bar — dark sage green
  ctrlBar: {
    backgroundColor:CTRL_BG,
    paddingTop:0,
    paddingBottom:spacing(1),
    paddingHorizontal:spacing(2.5),
  },

  progressWrap:  { marginBottom:spacing(1.5) },
  progressTrack: { height:2, backgroundColor:"rgba(232,224,208,0.18)", borderRadius:1, overflow:"hidden" },
  progressFill:  { height:"100%", backgroundColor:GOLD, borderRadius:1 },

  ctrlRow: {
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    paddingHorizontal:spacing(1),
    marginBottom:spacing(1.5),
    marginTop:-10,
  },

  ctrlItem: {
    alignItems:"center",
    justifyContent:"center",
    gap:6,
    flex:1,
  },
  // 75% of 48 = 36
  ctrlCircle: {
    width:36,
    height:36,
    borderRadius:18,
    borderWidth:1,
    borderColor:"rgba(232,224,208,0.25)",
    backgroundColor:"rgba(232,224,208,0.08)",
    alignItems:"center",
    justifyContent:"center",
  },
  ctrlCircleOn: {
    borderColor:GOLD,
    backgroundColor:"rgba(191,159,96,0.18)",
  },
  ctrlLabel: {
    fontSize:11,
    color:CTRL_MUTED,
    fontWeight:"400",
    textAlign:"center",
  },
  ctrlLabelOn: {
    color:GOLD,
  },

  // Play circle — larger, white with shadow
  playCircle: {
    width:64,
    height:64,
    borderRadius:32,
    backgroundColor:"rgba(245,240,232,0.95)",
    alignItems:"center",
    justifyContent:"center",
    shadowColor:"#000",
    shadowOffset:{width:0,height:4},
    shadowOpacity:0.25,
    shadowRadius:8,
    elevation:6,
  },

  speedCircleTxt: {
    fontSize:11,
    color:CTRL_ICON,
    fontWeight:"600",
  },

  speedGrid: {
    flexDirection:"row",
    gap:spacing(0.75),
    marginBottom:spacing(1.25),
  },
  speedBtn: {
    flex:1,
    paddingVertical:spacing(0.75),
    borderRadius:radius.sm,
    borderWidth:1,
    borderColor:"rgba(232,224,208,0.22)",
    backgroundColor:"transparent",
    alignItems:"center",
  },
  speedBtnOn:    { backgroundColor:GOLD, borderColor:GOLD },
  speedBtnTxt:   { fontSize:11, color:"rgba(232,224,208,0.65)" },
  speedBtnTxtOn: { color:CTRL_BG, fontWeight:"700" },

  // Toggles — absolutely positioned over system nav bar
  togglesOverlay: {
    position:"absolute",
    left:0,
    right:0,
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"center",
    gap:12,
    paddingVertical:8,
    backgroundColor:CTRL_BG,
    zIndex:10,
  },
  toggleLabel: {
    fontSize:13,
    color:"rgba(232,224,208,0.80)",
    fontWeight:"400",
  },
  toggleDivider: {
    width:1,
    height:24,
    backgroundColor:"rgba(232,224,208,0.25)",
    marginHorizontal:8,
  },
});
