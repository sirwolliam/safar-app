/**
 * TawafScreen.jsx — Safar
 */
import React, { useState, useRef, useEffect } from "react";
import {
  SafeAreaView, View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Dimensions, Animated, Modal,
  TouchableWithoutFeedback, Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, G, Path } from "react-native-svg";
import { ArrowLeft, Check, X } from "phosphor-react-native";
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
const RING_SIZE  = SW * 0.58;
const RADIUS     = (RING_SIZE - 40) / 2;
const CX         = RING_SIZE / 2;
const CY         = RING_SIZE / 2;
const STROKE     = 14;
const CIRC       = 2 * Math.PI * RADIUS;

const TAWAF_DUAS = [
  {
    id: "tawaf-start",
    name: "Upon Beginning \u1e6caw\u0101f",
    when: "Said at the Black Stone to begin each round",
    arabic: "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0647\u0650 \u0648\u064e\u0627\u0644\u0644\u0647\u064f \u0623\u064e\u0643\u0652\u0628\u064e\u0631\u064f",
    translit: "Bismi-ll\u0101hi wa-ll\u0101hu akbar",
    translation: "In the name of Allah, and Allah is the Greatest.",
    source: "\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 1613",
  },
  {
    id: "tawaf-yemeni",
    name: "Between Yemeni Corner & Black Stone",
    when: "Recited in the final stretch of each round",
    arabic: "\u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u0622\u062a\u0650\u0646\u064e\u0627 \u0641\u0650\u064a \u0627\u0644\u062f\u064f\u0651\u0646\u0652\u064a\u064e\u0627 \u062d\u064e\u0633\u064e\u0646\u064e\u0629\u064b \u0648\u064e\u0641\u0650\u064a \u0627\u0644\u0622\u062e\u0650\u0631\u064e\u0629\u0650 \u062d\u064e\u0633\u064e\u0646\u064e\u0629\u064b \u0648\u064e\u0642\u0650\u0646\u064e\u0627 \u0639\u064e\u0630\u064e\u0627\u0628\u064e \u0627\u0644\u0646\u064e\u0651\u0627\u0631\u0650",
    translit: "Rabban\u0101 \u0101tin\u0101 fi\u02bfd-duny\u0101 \u1e25asanatan wa fi\u02bfl-\u0101khirati \u1e25asanatan wa qin\u0101 \u02bfadh\u0101ba\u02bbn-n\u0101r",
    translation: "Our Lord, give us good in this world and in the Hereafter, and protect us from the punishment of the Fire.",
    source: "Al-Baqarah 2:201",
  },
];

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
  closeBtn:   { alignSelf:"center", marginTop:20, width:44, height:44, borderRadius:22, backgroundColor:"rgba(255,255,255,0.07)", alignItems:"center", justifyContent:"center" },
  name:       { fontFamily:SERIF, fontSize:20, color:WHITE, marginBottom:4, textAlign:"center" },
  when:       { fontSize:13, color:GOLD, fontStyle:"italic", marginBottom:14, textAlign:"center" },
  divider:    { height:1, backgroundColor:"rgba(200,185,160,0.15)", marginBottom:14 },
  arabic:     { fontFamily:SERIF, fontSize:30, color:WHITE, textAlign:"center", writingDirection:"rtl", lineHeight:46, marginBottom:10 },
  translit:   { fontSize:14, color:GOLD, textAlign:"center", fontStyle:"italic", marginBottom:14 },
  translation:{ fontFamily:SERIF, fontSize:17, color:WHITE, textAlign:"center", lineHeight:26, marginBottom:10 },
  source:     { fontSize:12, color:MUTED, textAlign:"center" },
});

function TawafRing({ current }) {
  const completed = Math.min(current - 1, TOTAL);
  const progress  = completed / TOTAL;
  const strokeDash = CIRC * progress;
  const markers = Array.from({ length:TOTAL }, (_, i) => {
    const angle = -(i / TOTAL) * 2 * Math.PI - Math.PI / 2;
    return {
      x: CX + RADIUS * Math.cos(angle),
      y: CY + RADIUS * Math.sin(angle),
      filled: i < completed,
      active: i === completed && current <= TOTAL,
    };
  });
  return (
    <View style={{ width:RING_SIZE, height:RING_SIZE, alignItems:"center", justifyContent:"center" }}>
      <Svg width={RING_SIZE} height={RING_SIZE} style={StyleSheet.absoluteFill}>
        <Circle cx={CX} cy={CY} r={RADIUS} stroke={GREEN_DARK} strokeWidth={STROKE} fill="none" />
        {strokeDash > 0 && (
          <Circle
            cx={CX} cy={CY} r={RADIUS}
            stroke={GREEN} strokeWidth={STROKE} fill="none"
            strokeDasharray={`${strokeDash} ${CIRC}`}
            strokeLinecap="round"
            rotation={90} origin={`${CX}, ${CY}`}
            transform={`scale(-1,1) translate(-${RING_SIZE},0)`}
          />
        )}
        {markers.map((m, i) => (
          <G key={i}>
            <Circle cx={m.x} cy={m.y} r={9}
              fill={m.filled ? GREEN : m.active ? "none" : GREEN_DARK}
              stroke={m.active ? GREEN_LITE : m.filled ? GREEN : "rgba(90,140,74,0.4)"}
              strokeWidth={m.active ? 2.5 : 1}
            />
          </G>
        ))}
      </Svg>
      {/* Ghosted Ka'bah icon behind counter */}
      <Svg
        width={RING_SIZE * 0.38}
        height={RING_SIZE * 0.38}
        viewBox="0 0 100 100"
        style={{ position:"absolute", opacity:0.08 }}
      >
        {/* Ka'bah cube: front face, top face, side face */}
        <Path d="M20 75 L20 35 L50 25 L80 35 L80 75 Z" fill={WHITE} />
        <Path d="M20 35 L50 20 L80 35 L50 45 Z" fill="rgba(255,255,255,0.6)" />
        <Path d="M80 35 L80 75 L50 85 L50 45 Z" fill="rgba(255,255,255,0.3)" />
        {/* Kiswa band */}
        <Path d="M20 50 L80 50 L80 58 L20 58 Z" fill={GOLD} opacity="0.6" />
      </Svg>
      <View style={rg.inner}>
        <Text style={rg.roundLabel}>Round</Text>
        <Text style={rg.roundNum}>{current > TOTAL ? TOTAL : current}</Text>
        <Text style={rg.roundOf}>{"of " + TOTAL}</Text>
      </View>
    </View>
  );
}
const rg = StyleSheet.create({
  inner:      { alignItems:"center" },
  roundLabel: { fontSize:18, color:GOLD, fontWeight:"500", letterSpacing:0.5, marginBottom:8 },
  roundNum:   { fontSize:80, color:WHITE, fontWeight:"200", lineHeight:84, letterSpacing:-3, marginBottom:8 },
  roundOf:    { fontSize:22, color:GOLD, fontWeight:"500" },
});

export default function TawafScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [current,   setCurrent]   = useState(1);
  const [done,      setDone]      = useState(false);
  const [activeDua, setActiveDua] = useState(null);

  const handleComplete = () => {
    if (done) return;
    if (current >= TOTAL) { setDone(true); setCurrent(TOTAL + 1); }
    else setCurrent(c => c + 1);
  };

  const reset = () => { setCurrent(1); setDone(false); };

  return (
    <SafeAreaView style={[s.safe, { paddingBottom:insets.bottom }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.8}>
            <ArrowLeft size={22} color={WHITE} weight="regular" />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.title}>Tawaf Counter</Text>
            <Text style={s.subtitle}>{"Track your rounds of \u1e6caw\u0101f."}</Text>
          </View>
          <View style={{ width:40 }} />
        </View>

        <View style={s.ringWrap}>
          <TawafRing current={current} />
        </View>

        {/* Fixed-height wrapper — prevents layout jump when button swaps */}
        <View style={s.btnWrap}>
          {!done ? (
            <TouchableOpacity style={s.completeBtn} onPress={handleComplete} activeOpacity={0.85}>
              <Text style={s.completeBtnPlus}>{"+"}</Text>
              <Text style={s.completeBtnTxt}>{"Completed\na round"}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={s.doneBtn} onPress={reset} activeOpacity={0.85}>
              <Check size={48} color={WHITE} weight="regular" />
              <Text style={s.completeBtnTxt}>{"Alhamdulillah!\nTap to restart"}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={s.dotsCard}>
          <View style={s.dots}>
            {Array.from({ length:TOTAL }, (_, i) => {
              const isComplete = i < (done ? TOTAL : current - 1);
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
          <Text style={s.dotsLabel}>{"Continue until " + TOTAL + " rounds"}</Text>
        </View>

        <View style={s.duasRow}>
          {TAWAF_DUAS.map(dua => (
            <TouchableOpacity key={dua.id} style={s.duaCard} onPress={() => setActiveDua(dua)} activeOpacity={0.82}>
              {/* View du'ā — prominent at top */}
              <View style={s.duaCardHeader}>
                <Text style={s.duaCardView}>{"View du\u02bf\u0101"}</Text>
                <Text style={s.duaCardArrow}>{"›"}</Text>
              </View>
              <View style={s.duaCardDivider}/>
              {/* Name and when below */}
              <Text style={s.duaCardName}>{dua.name}</Text>
              <Text style={s.duaCardWhen}>{dua.when}</Text>
              {/* Arabic preview */}
              <Text style={s.duaCardArabic} numberOfLines={1}>{dua.arabic}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.footer}>
          <Text style={s.footerTxt}>
            {"May Allah accept your "}
            <Text style={{ color:GOLD }}>{"\u1e6caw\u0101f"}</Text>
            {"."}
          </Text>
        </View>

      </ScrollView>
      {activeDua && <DuaOverlay dua={activeDua} onClose={() => setActiveDua(null)} />}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex:1, backgroundColor:BG },
  scroll: { paddingBottom:spacing(4) },
  header: { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:spacing(2.5), paddingTop:spacing(2), paddingBottom:spacing(1) },
  backBtn:      { width:40, height:40, alignItems:"center", justifyContent:"center" },
  headerCenter: { flex:1, alignItems:"center" },
  title:        { fontFamily:SERIF, fontSize:28, color:WHITE, fontWeight:"400" },
  subtitle:     { fontSize:14, color:GOLD, fontStyle:"italic", marginTop:3 },
  ringWrap:     { alignItems:"center", marginTop:spacing(1), marginBottom:spacing(1) },
  btnWrap: {
    height: 82,
    marginBottom: spacing(2),
    alignItems: "center",
    justifyContent: "center",
  },
  completeBtn: {
    alignSelf:"center", width:RING_SIZE, backgroundColor:GREEN_DARK, borderRadius:14,
    borderWidth:1, borderColor:"rgba(90,140,74,0.40)", paddingVertical:9,
    flexDirection:"row", alignItems:"center", justifyContent:"center", gap:16,
    shadowColor:GREEN, shadowOffset:{width:0,height:4},
    shadowOpacity:0.30, shadowRadius:12, elevation:6,
  },
  doneBtn: {
    alignSelf:"center", width:RING_SIZE, backgroundColor:"#2A5C30", borderRadius:14,
    borderWidth:1, borderColor:"rgba(122,184,96,0.50)", paddingVertical:9,
    flexDirection:"row", alignItems:"center", justifyContent:"center", gap:16,
  },
  completeBtnPlus: { fontSize:56, color:WHITE, fontWeight:"200", lineHeight:64 },
  completeBtnTxt:  { fontFamily:SERIF, fontSize:20, color:WHITE, lineHeight:28 },
  dotsCard: {
    marginHorizontal:spacing(2.5), borderRadius:16,
    paddingVertical:10, paddingHorizontal:16, alignItems:"center", marginBottom:0,
  },
  dots:         { flexDirection:"row", alignItems:"center", justifyContent:"center", marginBottom:10 },
  dotWrap:      { flexDirection:"row", alignItems:"center" },
  dotLine:      { width:14, height:2, backgroundColor:GREEN_DARK },
  dotLineFilled:{ backgroundColor:GREEN },
  dot:          { width:36, height:36, borderRadius:18, backgroundColor:SURFACE, borderWidth:1.5, borderColor:"rgba(90,140,74,0.40)", alignItems:"center", justifyContent:"center" },
  dotComplete:  { backgroundColor:GREEN, borderColor:GREEN },
  dotActive:    { borderColor:GREEN_LITE, borderWidth:2 },
  dotNum:       { fontSize:15, color:MUTED, fontWeight:"500" },
  dotNumActive: { color:GREEN_LITE, fontWeight:"700" },
  dotsLabel:    { fontSize:14, color:MUTED },
  instructCard: {
    marginHorizontal:spacing(2.5), borderRadius:14, borderWidth:1,
    borderColor:"rgba(200,185,160,0.22)", paddingVertical:16, paddingHorizontal:18,
    marginBottom:spacing(2), backgroundColor:"rgba(255,255,255,0.03)",
  },
  instructTxt: { fontSize:16, color:"rgba(245,240,232,0.75)", textAlign:"center", lineHeight:26 },
  duasSectionLabel: { fontSize:13, fontWeight:"600", color:MUTED, letterSpacing:1, textTransform:"uppercase", textAlign:"center", marginBottom:spacing(1.25) },
  duasRow:       { flexDirection:"row", marginHorizontal:spacing(2.5), gap:spacing(1.25), marginBottom:spacing(2), marginTop:spacing(1) },
  duaCard:       { flex:1, backgroundColor:CARD, borderRadius:14, borderWidth:1, borderColor:"rgba(90,140,74,0.30)", padding:16, gap:0 },
  duaCardHeader: { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:12 },
  duaCardView:   { fontFamily:SERIF, fontSize:20, color:GOLD, fontWeight:"600" },
  duaCardArrow:  { fontSize:26, color:GOLD, fontWeight:"300", lineHeight:28 },
  duaCardDivider:{ height:1, backgroundColor:"rgba(200,185,160,0.15)", marginBottom:12 },
  duaCardName:   { fontFamily:SERIF, fontSize:15, color:WHITE, marginBottom:6, lineHeight:21 },
  duaCardWhen:   { fontSize:12, color:MUTED, lineHeight:17, marginBottom:12 },
  duaCardArabic: { fontFamily:SERIF, fontSize:18, color:"rgba(200,169,106,0.55)", textAlign:"right", writingDirection:"rtl" },
  footer:     { alignItems:"center", paddingTop:spacing(1) },
  footerTxt:  { fontSize:16, color:MUTED, textAlign:"center" },
});
