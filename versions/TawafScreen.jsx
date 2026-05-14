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
import Svg, { Circle, G } from "react-native-svg";
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
const RING_SIZE  = SW * 0.72;
const RADIUS     = (RING_SIZE - 40) / 2;
const CX         = RING_SIZE / 2;
const CY         = RING_SIZE / 2;
const STROKE     = 14;
const CIRC       = 2 * Math.PI * RADIUS;

const TAWAF_DUAS = [
  {
    id: "tawaf-start",
    name: "Upon Beginning \u1e62aw\u0101f",
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
          <TouchableOpacity style={dl.closeBtn} onPress={close} activeOpacity={0.8} hitSlop={{top:16,bottom:16,left:16,right:16}}>
            <X size={16} color={MUTED} weight="regular" />
          </TouchableOpacity>
          <Text style={dl.name}>{dua.name}</Text>
          <Text style={dl.when}>{dua.when}</Text>
          <View style={dl.divider} />
          <Text style={dl.arabic}>{dua.arabic}</Text>
          <Text style={dl.translit}>{dua.translit}</Text>
          <View style={dl.divider} />
          <Text style={dl.translation}>{dua.translation}</Text>
          <Text style={dl.source}>{dua.source}</Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
const dl = StyleSheet.create({
  backdrop:   { flex:1, backgroundColor:"rgba(0,0,0,0.72)", alignItems:"center", justifyContent:"center", padding:24 },
  card:       { backgroundColor:SURFACE, borderRadius:20, padding:28, width:"100%", borderWidth:1, borderColor:"rgba(200,185,160,0.20)" },
  closeBtn:   { position:"absolute", top:14, right:14, width:36, height:36, borderRadius:18, backgroundColor:"rgba(255,255,255,0.07)", alignItems:"center", justifyContent:"center" },
  name:       { fontFamily:SERIF, fontSize:20, color:WHITE, marginBottom:4, paddingRight:30 },
  when:       { fontSize:13, color:GOLD, fontStyle:"italic", marginBottom:14 },
  divider:    { height:1, backgroundColor:"rgba(200,185,160,0.15)", marginBottom:14 },
  arabic:     { fontFamily:SERIF, fontSize:26, color:WHITE, textAlign:"center", writingDirection:"rtl", lineHeight:42, marginBottom:10 },
  translit:   { fontSize:14, color:GOLD, textAlign:"center", fontStyle:"italic", marginBottom:14 },
  translation:{ fontFamily:SERIF, fontSize:17, color:WHITE, textAlign:"center", lineHeight:26, marginBottom:10 },
  source:     { fontSize:12, color:MUTED, textAlign:"center" },
});

function TawafRing({ current }) {
  const completed = Math.min(current - 1, TOTAL);
  const progress  = completed / TOTAL;
  const strokeDash = CIRC * progress;
  const markers = Array.from({ length:TOTAL }, (_, i) => {
    const angle = (i / TOTAL) * 2 * Math.PI - Math.PI / 2;
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
            rotation={-90} origin={`${CX}, ${CY}`}
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
  roundLabel: { fontSize:18, color:GOLD, fontWeight:"500", letterSpacing:0.5, marginBottom:2 },
  roundNum:   { fontFamily:SERIF, fontSize:110, color:WHITE, fontWeight:"400", lineHeight:116, letterSpacing:-4 },
  roundOf:    { fontSize:22, color:GOLD, fontWeight:"500", marginTop:-10 },
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
            <Text style={s.subtitle}>Track your rounds of \u1e62aw\u0101f.</Text>
          </View>
          <View style={{ width:40 }} />
        </View>

        <View style={s.ringWrap}>
          <TawafRing current={current} />
        </View>

        {!done ? (
          <TouchableOpacity style={s.completeBtn} onPress={handleComplete} activeOpacity={0.85}>
            <Text style={s.completeBtnPlus}>{"+"}</Text>
            <Text style={s.completeBtnTxt}>{"Completed\na round"}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={s.doneBtn} onPress={reset} activeOpacity={0.85}>
            <Check size={24} color={WHITE} weight="regular" />
            <Text style={s.completeBtnTxt}>{"Alhamdulillah!\nTap to restart"}</Text>
          </TouchableOpacity>
        )}

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

        <View style={s.instructCard}>
          <Text style={s.instructTxt}>{"Tap once after completing\neach round of \u1e62aw\u0101f"}</Text>
        </View>

        <Text style={s.duasSectionLabel}>{"\u202dDu\u02bf\u0101s for \u1e62aw\u0101f"}</Text>
        <View style={s.duasRow}>
          {TAWAF_DUAS.map(dua => (
            <TouchableOpacity key={dua.id} style={s.duaCard} onPress={() => setActiveDua(dua)} activeOpacity={0.82}>
              <Text style={s.duaCardName}>{dua.name}</Text>
              <Text style={s.duaCardWhen}>{dua.when}</Text>
              <View style={s.duaCardFooter}>
                <Text style={s.duaCardView}>{"View du\u02bf\u0101  \u203a"}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.footer}>
          <Text style={s.footerTxt}>
            {"May Allah accept your "}
            <Text style={{ color:GOLD }}>{"\u1e62aw\u0101f"}</Text>
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
  ringWrap:     { alignItems:"center", marginVertical:spacing(2) },
  completeBtn: {
    marginHorizontal:spacing(3), backgroundColor:GREEN_DARK, borderRadius:18,
    borderWidth:1.5, borderColor:GOLD, paddingVertical:22,
    flexDirection:"row", alignItems:"center", justifyContent:"center", gap:16,
    marginBottom:spacing(2), shadowColor:GREEN, shadowOffset:{width:0,height:4},
    shadowOpacity:0.30, shadowRadius:12, elevation:6,
  },
  doneBtn: {
    marginHorizontal:spacing(3), backgroundColor:"#2A5C30", borderRadius:18,
    borderWidth:1.5, borderColor:GREEN_LITE, paddingVertical:22,
    flexDirection:"row", alignItems:"center", justifyContent:"center", gap:16, marginBottom:spacing(2),
  },
  completeBtnPlus: { fontSize:36, color:WHITE, fontWeight:"200", lineHeight:40 },
  completeBtnTxt:  { fontFamily:SERIF, fontSize:22, color:WHITE, lineHeight:30 },
  dotsCard: {
    marginHorizontal:spacing(2.5), backgroundColor:CARD, borderRadius:16,
    borderWidth:1, borderColor:"rgba(90,140,74,0.25)", paddingVertical:18,
    paddingHorizontal:16, alignItems:"center", marginBottom:spacing(2),
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
  duasRow:    { flexDirection:"row", marginHorizontal:spacing(2.5), gap:spacing(1.25), marginBottom:spacing(2) },
  duaCard:    { flex:1, backgroundColor:CARD, borderRadius:14, borderWidth:1, borderColor:"rgba(90,140,74,0.25)", padding:16 },
  duaCardName:{ fontFamily:SERIF, fontSize:16, color:WHITE, marginBottom:6, lineHeight:22 },
  duaCardWhen:{ fontSize:12, color:MUTED, lineHeight:18, marginBottom:12 },
  duaCardFooter:{ borderTopWidth:1, borderTopColor:"rgba(200,185,160,0.12)", paddingTop:10 },
  duaCardView:{ fontSize:13, color:GOLD, fontWeight:"500" },
  footer:     { alignItems:"center", paddingTop:spacing(1) },
  footerTxt:  { fontSize:16, color:MUTED, textAlign:"center" },
});
