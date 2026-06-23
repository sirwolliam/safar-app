/**
 * SaiyScreen.jsx — Safar
 *
 * Sa'y tracker — alternates between Ṣafā and Marwah.
 * 7 lengths total (Ṣafā→Marwah = 1, Marwah→Ṣafā = 2, etc.)
 * Mountain icon fills when that length is completed.
 * Dua overlay for both Sa'y duas.
 */
import React, { useState, useRef, useEffect } from "react";
import {
  SafeAreaView, View, Text, TouchableOpacity,
  StyleSheet, Dimensions, Animated, Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Circle, Line } from "react-native-svg";
import { ArrowLeft, Check, X, MapPin } from "phosphor-react-native";
import { spacing } from "../theme";

const { width: SW } = Dimensions.get("window");
const BG         = "#0A1A10";
const SURFACE    = "#122018";
const CARD       = "#172014";
const GOLD       = "#C8A96A";
const GREEN      = "#5A8C4A";
const GREEN_DARK = "#2A4820";
const GREEN_LITE = "#7AB860";
const MUTED      = "rgba(200,220,190,0.45)";
const WHITE      = "#F5F0E8";
const SERIF      = "SourceSerif4-Regular";
const TOTAL      = 7;

// Sa'y location names — odd lengths end at Marwah, even at Safa
// Length 1: Safa→Marwah, Length 2: Marwah→Safa, etc.
const getDestination = (length) => length % 2 === 1 ? "MARWAH" : "SAFA";
const getOrigin      = (length) => length % 2 === 1 ? "SAFA"   : "MARWAH";

const SAI_DUAS = [
  {
    id: "safa-start",
    name: "Upon Ascending \u1e62af\u0101",
    when: "Said when you first ascend \u1e62af\u0101 and face the Ka\u02bfbah",
    arabic: "\u0625\u0650\u0646\u064e\u0651 \u0627\u0644\u0635\u064e\u0651\u0641\u064e\u0627 \u0648\u064e\u0627\u0644\u0652\u0645\u064e\u0631\u0652\u0648\u064e\u0629\u064e \u0645\u0650\u0646\u0652 \u0634\u064e\u0639\u064e\u0627\u0626\u0650\u0631\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650",
    translit: "Inna\u1e63-\u1e63af\u0101 wal-marwata min sha\u02bf\u0101\u02bfiri-ll\u0101h",
    translation: "Indeed \u1e62af\u0101 and Marwah are among the signs of Allah.",
    source: "\u1e62a\u1e25\u012b\u1e25 Muslim \u00b7 1218",
  },
  {
    id: "safa-dua",
    name: "Du\u02bf\u0101 on \u1e62af\u0101 & Marwah",
    when: "Said while standing on \u1e62af\u0101 or Marwah facing the Ka\u02bfbah",
    arabic: "\u0644\u064e\u0627 \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u064e\u0651\u0627 \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0648\u064e\u062d\u0652\u062f\u064e\u0647\u064f \u0644\u064e\u0627 \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0647\u064f\u060c \u0644\u064e\u0647\u064f \u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u064f \u0648\u064e\u0644\u064e\u0647\u064f \u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f",
    translit: "L\u0101 il\u0101ha illa-ll\u0101hu wa\u1e25dahu l\u0101 shar\u012bka lahu, lahu\u02bbl-mulku wa lahu\u02bbl-\u1e25amd",
    translation: "There is no god but Allah alone, with no partner. To Him belongs the dominion and to Him belongs all praise.",
    source: "\u1e62a\u1e25\u012b\u1e25 Muslim \u00b7 1218",
  },
];

// ── Mountain SVG icon (outline or filled) ─────────────────────────────────────
function Mountain({ size = 40, filled = false, color = GREEN_LITE }) {
  const w = size;
  const h = size * 0.65;
  // Two peaks path
  const path = `M0 ${h} L${w*0.35} ${h*0.2} L${w*0.55} ${h*0.5} L${w*0.7} ${h*0.1} L${w} ${h} Z`;
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Path
        d={path}
        fill={filled ? color : "none"}
        stroke={color}
        strokeWidth={filled ? 0 : 1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={filled ? 1 : 0.7}
      />
    </Svg>
  );
}

// ── Dua overlay ───────────────────────────────────────────────────────────────
function DuaOverlay({ dua, onClose }) {
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue:1, useNativeDriver:true, tension:80, friction:10 }),
      Animated.timing(fadeAnim, { toValue:1, duration:180, useNativeDriver:true }),
    ]).start();
  }, []);
  const close = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue:0.92, duration:150, useNativeDriver:true }),
      Animated.timing(fadeAnim, { toValue:0, duration:150, useNativeDriver:true }),
    ]).start(onClose);
  };
  return (
    <Modal transparent animationType="none" onRequestClose={close}>
      <Animated.View style={[dl.backdrop, { opacity:fadeAnim }]}>
        <TouchableWithoutFeedback onPress={close}><View style={StyleSheet.absoluteFill} /></TouchableWithoutFeedback>
        <Animated.View style={[dl.card, { transform:[{ scale:scaleAnim }] }]}>
          <Text style={dl.name}>{dua.name}</Text>
          <Text style={dl.when}>{dua.when}</Text>
          <View style={dl.divider} />
          <Text style={dl.arabic}>{dua.arabic}</Text>
          <Text style={dl.translit}>{dua.translit}</Text>
          <View style={dl.divider} />
          <Text style={dl.translation}>{dua.translation}</Text>
          <Text style={dl.source}>{dua.source}</Text>
          <TouchableOpacity style={dl.closeBtn} onPress={close} activeOpacity={0.8} hitSlop={{top:16,bottom:16,left:16,right:16}}>
            <X size={18} color={MUTED} weight="regular" />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
const dl = StyleSheet.create({
  backdrop:   { flex:1, backgroundColor:"rgba(0,0,0,0.72)", alignItems:"center", justifyContent:"center", padding:24 },
  card:       { backgroundColor:SURFACE, borderRadius:20, padding:28, width:"100%", borderWidth:1, borderColor:"rgba(200,185,160,0.20)" },
  name:       { fontFamily:SERIF, fontSize:20, color:WHITE, marginBottom:4, textAlign:"center" },
  when:       { fontSize:13, color:GOLD, fontStyle:"italic", marginBottom:14, textAlign:"center" },
  divider:    { height:1, backgroundColor:"rgba(200,185,160,0.15)", marginBottom:14 },
  arabic:     { fontFamily:SERIF, fontSize:26, color:WHITE, textAlign:"center", writingDirection:"rtl", lineHeight:42, marginBottom:10 },
  translit:   { fontSize:14, color:GOLD, textAlign:"center", fontStyle:"italic", marginBottom:14 },
  translation:{ fontFamily:SERIF, fontSize:17, color:WHITE, textAlign:"center", lineHeight:26, marginBottom:10 },
  source:     { fontSize:12, color:MUTED, textAlign:"center", marginBottom:0 },
  closeBtn:   { alignSelf:"center", marginTop:20, width:44, height:44, borderRadius:22, backgroundColor:"rgba(255,255,255,0.07)", alignItems:"center", justifyContent:"center" },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function SaiyScreen({ navigation }) {
  const insets    = useSafeAreaInsets();
  const [current,   setCurrent]   = useState(1);   // current length (1–7)
  const [done,      setDone]      = useState(false);
  const [activeDua, setActiveDua] = useState(null);

  // Where we're heading this length
  const destination = done ? "MARWAH" : getDestination(current);
  const completed   = done ? TOTAL : current - 1;

  const handleTap = () => {
    if (done) return;
    if (current >= TOTAL) { setDone(true); }
    else { setCurrent(c => c + 1); }
  };

  const reset = () => { setCurrent(1); setDone(false); };

  // Button colours based on destination
  const btnColor  = destination === "MARWAH" ? "#2A5020" : "#1E3A28";
  const btnBorder = "rgba(90,140,74,0.45)";

  const GRAPHIC_W = SW - spacing(5) * 2;

  return (
    <SafeAreaView style={[s.safe, { paddingBottom:insets.bottom }]}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.8}>
          <ArrowLeft size={22} color={WHITE} weight="regular" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.title}>Sa\u02bfy Tracker</Text>
          <Text style={s.subtitle}>{"Track your Sa\u02bfy between \u1e62af\u0101 and Marwah."}</Text>
        </View>
        <View style={{ width:40 }} />
      </View>

      {/* Graphic + button */}
      <View style={[s.graphicWrap, { width:GRAPHIC_W }]}>

        {/* SAFA label + mountain top */}
        <View style={s.locationTop}>
          <Text style={s.locationLabel}>SAFA</Text>
          <Mountain size={44} filled={completed >= 2} color={GREEN_LITE} />
        </View>

        {/* Side arrows + centre button */}
        <View style={s.middleRow}>
          {/* Left arrow — going down (Marwah→Safa direction) */}
          <View style={s.arrowWrap}>
            <Text style={[s.arrow, { color: destination === "SAFA" ? GREEN_LITE : "rgba(90,140,74,0.30)" }]}>
              {"↓"}
            </Text>
          </View>

          {/* Centre tap button */}
          <TouchableOpacity
            style={[s.centreBtn, { backgroundColor:btnColor, borderColor:btnBorder }]}
            onPress={done ? reset : handleTap}
            activeOpacity={0.85}
          >
            <MapPin size={28} color={WHITE} weight="fill" />
            <Text style={s.centreBtnLabel}>
              {done ? "Alhamdulillah!" : "I have reached"}
            </Text>
            <Text style={s.centreBtnDest}>
              {done ? "Tap to restart" : destination}
            </Text>
            {!done && <Text style={s.centreBtnTap}>Tap here</Text>}
          </TouchableOpacity>

          {/* Right arrow — going up (Safa→Marwah direction) */}
          <View style={s.arrowWrap}>
            <Text style={[s.arrow, { color: destination === "MARWAH" ? GREEN_LITE : "rgba(90,140,74,0.30)" }]}>
              {"↑"}
            </Text>
          </View>
        </View>

        {/* MARWAH label + mountain bottom */}
        <View style={s.locationBottom}>
          <Mountain size={44} filled={completed >= 1} color={GREEN_LITE} />
          <Text style={s.locationLabel}>MARWAH</Text>
        </View>

        {/* Dashed oval track */}
        <Svg
          style={StyleSheet.absoluteFill}
          width={GRAPHIC_W}
          height="100%"
          pointerEvents="none"
        >
          <Circle
            cx={GRAPHIC_W / 2}
            cy="50%"
            rx={GRAPHIC_W * 0.45}
            ry="44%"
            fill="none"
            stroke={GOLD}
            strokeWidth={1}
            strokeDasharray="6 5"
            opacity={0.35}
          />
        </Svg>
      </View>

      {/* Progress dots */}
      <View style={s.dotsCard}>
        <View style={s.dots}>
          {Array.from({ length:TOTAL }, (_, i) => {
            const isComplete = i < completed;
            const isActive   = !done && i === current - 1;
            return (
              <View key={i} style={s.dotWrap}>
                {i > 0 && <View style={[s.dotLine, isComplete && s.dotLineFilled]} />}
                <View style={[s.dot, isComplete && s.dotComplete, isActive && s.dotActive]}>
                  {isComplete
                    ? <Check size={14} color={WHITE} weight="bold" />
                    : <Text style={[s.dotNum, isActive && s.dotNumActive]}>{i + 1}</Text>
                  }
                </View>
              </View>
            );
          })}
        </View>
        <Text style={s.dotsLabel}>
          {done ? "All 7 lengths complete" : `Round ${current} of ${TOTAL}`}
        </Text>
      </View>

      {/* Dua cards */}
      <View style={s.duasRow}>
        {SAI_DUAS.map(dua => (
          <TouchableOpacity key={dua.id} style={s.duaCard} onPress={() => setActiveDua(dua)} activeOpacity={0.82}>
            <Text style={s.duaCardName}>{dua.name}</Text>
            <Text style={s.duaCardWhen}>{dua.when}</Text>
            <View style={s.duaCardFooter}>
              <Text style={s.duaCardView}>{"View du\u02bf\u0101  \u203a"}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer */}
      <View style={s.footer}>
        <Text style={s.footerTxt}>
          {"May Allah accept your "}
          <Text style={{ color:GOLD }}>{"Sa\u02bfy"}</Text>
          {"."}
        </Text>
      </View>

      {activeDua && <DuaOverlay dua={activeDua} onClose={() => setActiveDua(null)} />}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex:1, backgroundColor:BG },

  header: {
    flexDirection:"row", alignItems:"center", justifyContent:"space-between",
    paddingHorizontal:spacing(2.5), paddingTop:spacing(1.5), paddingBottom:spacing(1),
  },
  backBtn:      { width:40, height:40, alignItems:"center", justifyContent:"center" },
  headerCenter: { flex:1, alignItems:"center" },
  title:        { fontFamily:SERIF, fontSize:26, color:WHITE, fontWeight:"400" },
  subtitle:     { fontSize:13, color:GOLD, fontStyle:"italic", marginTop:2 },

  // Graphic area
  graphicWrap: {
    alignSelf:"center",
    height: SW * 0.58,
    justifyContent:"space-between",
    marginVertical:spacing(0.5),
  },
  locationTop: {
    alignItems:"center",
    gap:4,
    paddingTop:4,
  },
  locationBottom: {
    alignItems:"center",
    gap:4,
    paddingBottom:4,
  },
  locationLabel: {
    fontSize:14,
    fontWeight:"700",
    color:GOLD,
    letterSpacing:2,
  },
  middleRow: {
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    flex:1,
  },
  arrowWrap: {
    width:44,
    alignItems:"center",
    justifyContent:"center",
  },
  arrow: {
    fontSize:32,
    fontWeight:"300",
    lineHeight:40,
  },

  // Centre button
  centreBtn: {
    flex:1,
    marginHorizontal:spacing(1),
    borderRadius:18,
    borderWidth:1,
    paddingVertical:18,
    alignItems:"center",
    justifyContent:"center",
    gap:4,
    shadowColor:GREEN,
    shadowOffset:{ width:0, height:4 },
    shadowOpacity:0.30,
    shadowRadius:12,
    elevation:6,
  },
  centreBtnLabel: {
    fontSize:14,
    color:"rgba(245,240,232,0.75)",
    fontWeight:"400",
    marginTop:4,
  },
  centreBtnDest: {
    fontSize:32,
    color:WHITE,
    fontWeight:"700",
    letterSpacing:2,
    lineHeight:38,
  },
  centreBtnTap: {
    fontSize:13,
    color:"rgba(245,240,232,0.55)",
    marginTop:4,
  },

  // Progress dots
  dotsCard: {
    marginHorizontal:spacing(2.5),
    borderRadius:16,
    paddingVertical:10,
    paddingHorizontal:16,
    alignItems:"center",
    marginBottom:spacing(1),
  },
  dots:         { flexDirection:"row", alignItems:"center", justifyContent:"center", marginBottom:6 },
  dotWrap:      { flexDirection:"row", alignItems:"center" },
  dotLine:      { width:14, height:2, backgroundColor:GREEN_DARK },
  dotLineFilled:{ backgroundColor:GREEN },
  dot:          { width:34, height:34, borderRadius:17, backgroundColor:SURFACE, borderWidth:1.5, borderColor:"rgba(90,140,74,0.40)", alignItems:"center", justifyContent:"center" },
  dotComplete:  { backgroundColor:GREEN, borderColor:GREEN },
  dotActive:    { borderColor:GREEN_LITE, borderWidth:2 },
  dotNum:       { fontSize:14, color:MUTED, fontWeight:"500" },
  dotNumActive: { color:GREEN_LITE, fontWeight:"700" },
  dotsLabel:    { fontSize:13, color:GOLD, fontWeight:"500" },

  // Dua cards
  duasRow:    { flexDirection:"row", marginHorizontal:spacing(2.5), gap:spacing(1.25), marginBottom:spacing(1) },
  duaCard:    { flex:1, backgroundColor:CARD, borderRadius:14, borderWidth:1, borderColor:"rgba(90,140,74,0.25)", padding:14 },
  duaCardName:{ fontFamily:SERIF, fontSize:15, color:WHITE, marginBottom:5, lineHeight:20 },
  duaCardWhen:{ fontSize:11, color:MUTED, lineHeight:16, marginBottom:10 },
  duaCardFooter:{ borderTopWidth:1, borderTopColor:"rgba(200,185,160,0.12)", paddingTop:8 },
  duaCardView:{ fontSize:12, color:GOLD, fontWeight:"500" },

  // Footer
  footer:     { alignItems:"center", paddingTop:spacing(0.5) },
  footerTxt:  { fontSize:14, color:MUTED, textAlign:"center" },
});
