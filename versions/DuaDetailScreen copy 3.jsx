/**
 * DuaDetailScreen.jsx — Safar
 * Full dua view with enhanced audio player:
 * play/pause · repeat · loop · speed control · prev/next
 * Arabic · transliteration · translation toggles · font size · bookmark · share
 */
import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView, View, Text, ScrollView,
  TouchableOpacity, StyleSheet, Share, Animated,
} from "react-native";
import { colors, spacing, radius, typography } from "../theme";

const SERIF = "SourceSerif4-Regular";

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5];
const SPEED_LABELS  = ["0.5x", "0.75x", "1x", "1.25x", "1.5x"];

// ── Scholarly footnote ────────────────────────────────────────────────────────
function ScholarlyFootnote() {
  return (
    <View style={fn.wrap}>
      <Text style={fn.text}>
        <Text style={fn.bold}>Sources — </Text>
        Duas are drawn from authenticated hadith collections. Wording may differ across the four madhabs. Consult a qualified scholar for rulings specific to your school of thought.
      </Text>
    </View>
  );
}
const fn = StyleSheet.create({
  wrap: { marginHorizontal:spacing(2.5), marginTop:spacing(2), marginBottom:spacing(1), backgroundColor:"#F5EDD8", borderRadius:radius.md, borderWidth:1, borderColor:"#E8D9B8", padding:spacing(2) },
  text: { fontSize:11, color:"#7A6030", lineHeight:17 },
  bold: { fontWeight:"600" },
});

// ── Audio Player Component ────────────────────────────────────────────────────
// NOTE: In production use expo-av. This is a UI-complete mock that shows the
// correct controls and state — wire up to expo-av when dev build is ready.
function AudioPlayer({ dua, onNext, onPrev, hasNext, hasPrev }) {
  const [playing,    setPlaying]    = useState(false);
  const [looping,    setLooping]    = useState(false);
  const [speedIndex, setSpeedIndex] = useState(2); // default 1x
  const [progress,   setProgress]   = useState(0);
  const [elapsed,    setElapsed]    = useState(0);
  const MOCK_DURATION = 12; // seconds
  const intervalRef = useRef(null);
  const progAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => {
          const next = prev + 0.1 * SPEED_OPTIONS[speedIndex];
          if (next >= MOCK_DURATION) {
            if (looping) { setElapsed(0); setProgress(0); return 0; }
            setPlaying(false);
            clearInterval(intervalRef.current);
            return MOCK_DURATION;
          }
          setProgress(next / MOCK_DURATION);
          return next;
        });
      }, 100);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, speedIndex, looping]);

  const togglePlay = () => setPlaying(v => !v);
  const handleRepeat = () => { setElapsed(0); setProgress(0); setPlaying(true); };
  const cycleSpeed = () => setSpeedIndex(v => (v + 1) % SPEED_OPTIONS.length);
  const formatTime = s => Math.floor(s) + "s";

  return (
    <View style={ap.wrap}>
      {/* Progress bar */}
      <View style={ap.progressTrack}>
        <View style={[ap.progressFill, { width:(progress * 100) + "%" }]} />
        {/* Thumb */}
        <View style={[ap.thumb, { left: `${progress * 100}%` }]} />
      </View>
      <View style={ap.timeRow}>
        <Text style={ap.timeText}>{formatTime(elapsed)}</Text>
        <Text style={ap.timeText}>{formatTime(MOCK_DURATION)}</Text>
      </View>

      {/* Controls row */}
      <View style={ap.controls}>

        {/* Repeat */}
        <TouchableOpacity style={ap.ctrlBtn} onPress={handleRepeat} activeOpacity={0.7}>
          <Text style={ap.ctrlIcon}>{"\u21BA"}</Text>
          <Text style={ap.ctrlLabel}>Repeat</Text>
        </TouchableOpacity>

        {/* Prev */}
        <TouchableOpacity
          style={hasPrev ? ap.navBtn : [ap.navBtn, ap.navBtnDim]}
          onPress={hasPrev ? onPrev : null} activeOpacity={0.7}>
          <Text style={ap.navIcon}>{"\u23EE"}</Text>
        </TouchableOpacity>

        {/* Play / Pause */}
        <TouchableOpacity style={ap.playBtn} onPress={togglePlay} activeOpacity={0.85}>
          <Text style={ap.playIcon}>{playing ? "\u23F8" : "\u25B6"}</Text>
        </TouchableOpacity>

        {/* Next */}
        <TouchableOpacity
          style={hasNext ? ap.navBtn : [ap.navBtn, ap.navBtnDim]}
          onPress={hasNext ? onNext : null} activeOpacity={0.7}>
          <Text style={ap.navIcon}>{"\u23ED"}</Text>
        </TouchableOpacity>

        {/* Loop */}
        <TouchableOpacity style={ap.ctrlBtn} onPress={() => setLooping(v => !v)} activeOpacity={0.7}>
          <Text style={looping ? [ap.ctrlIcon, ap.ctrlIconOn] : ap.ctrlIcon}>{"\uD83D\uDD01"}</Text>
          <Text style={looping ? [ap.ctrlLabel, ap.ctrlLabelOn] : ap.ctrlLabel}>Loop</Text>
        </TouchableOpacity>
      </View>

      {/* Speed control */}
      <View style={ap.speedRow}>
        <Text style={ap.speedLabel}>Speed</Text>
        <View style={ap.speedBtns}>
          {SPEED_OPTIONS.map((spd, i) => (
            <TouchableOpacity
              key={spd}
              style={i === speedIndex ? [ap.speedBtn, ap.speedBtnOn] : ap.speedBtn}
              onPress={() => setSpeedIndex(i)}
              activeOpacity={0.8}>
              <Text style={i === speedIndex ? [ap.speedBtnTxt, ap.speedBtnTxtOn] : ap.speedBtnTxt}>
                {SPEED_LABELS[i]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Audio note */}
      <Text style={ap.audioNote}>
        {"\uD83D\uDD0A"} Audio recitation will play when audio files are added to the app.
      </Text>
    </View>
  );
}

const ap = StyleSheet.create({
  wrap:         { backgroundColor:colors.card, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, padding:spacing(2.5), marginBottom:spacing(2) },
  progressTrack:{ height:4, backgroundColor:colors.border, borderRadius:2, marginBottom:4, overflow:"visible" },
  progressFill: { height:"100%", backgroundColor:colors.primary, borderRadius:2 },
  thumb:        { position:"absolute", top:-5, width:14, height:14, borderRadius:7, backgroundColor:colors.primary, marginLeft:-7 },
  timeRow:      { flexDirection:"row", justifyContent:"space-between", marginBottom:spacing(2) },
  timeText:     { fontSize:11, color:colors.subtext },
  controls:     { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:spacing(2) },
  ctrlBtn:      { alignItems:"center", gap:4, minWidth:52 },
  ctrlIcon:     { fontSize:22, color:colors.subtext },
  ctrlIconOn:   { color:colors.primary },
  ctrlLabel:    { fontSize:11, color:colors.subtext },
  ctrlLabelOn:  { color:colors.primary, fontWeight:"600" },
  navBtn:       { width:44, height:44, borderRadius:22, backgroundColor:colors.background, borderWidth:1, borderColor:colors.border, alignItems:"center", justifyContent:"center" },
  navBtnDim:    { opacity:0.35 },
  navIcon:      { fontSize:20, color:colors.text },
  playBtn:      { width:64, height:64, borderRadius:32, backgroundColor:colors.primary, alignItems:"center", justifyContent:"center" },
  playIcon:     { fontSize:26, color:"#fff", marginLeft:3 },
  speedRow:     { flexDirection:"row", alignItems:"center", gap:spacing(1.25), paddingTop:spacing(1.75), borderTopWidth:1, borderTopColor:colors.border },
  speedLabel:   { fontSize:12, color:colors.subtext, fontWeight:"400", width:42 },
  speedBtns:    { flex:1, flexDirection:"row", gap:spacing(0.75) },
  speedBtn:     { flex:1, paddingVertical:spacing(0.75), borderRadius:radius.sm, borderWidth:1, borderColor:colors.border, backgroundColor:colors.background, alignItems:"center" },
  speedBtnOn:   { backgroundColor:colors.primary, borderColor:colors.primary },
  speedBtnTxt:  { fontSize:11, color:colors.subtext, fontWeight:"400" },
  speedBtnTxtOn:{ color:"#fff", fontWeight:"600" },
  audioNote:    { fontSize:11, color:colors.subtext, fontWeight:"300", textAlign:"center", marginTop:spacing(1.25), lineHeight:16 },
});

// ── Toggle row ────────────────────────────────────────────────────────────────
function ToggleRow({ label, value, onToggle }) {
  return (
    <View style={tg.row}>
      <Text style={tg.label}>{label}</Text>
      <TouchableOpacity style={value ? [tg.track, tg.trackOn] : tg.track} onPress={onToggle} activeOpacity={0.8}>
        <View style={value ? [tg.knob, tg.knobOn] : tg.knob} />
      </TouchableOpacity>
    </View>
  );
}
const tg = StyleSheet.create({
  row:     { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingVertical:spacing(1.25), borderTopWidth:1, borderTopColor:colors.border },
  label:   { fontSize:14, color:colors.text },
  track:   { width:44, height:24, borderRadius:12, backgroundColor:colors.border, justifyContent:"center", paddingHorizontal:3 },
  trackOn: { backgroundColor:colors.primary },
  knob:    { width:18, height:18, borderRadius:9, backgroundColor:colors.card },
  knobOn:  { alignSelf:"flex-end" },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function DuaDetailScreen({ route, navigation }) {
  const { dua, allDuas = [], currentIndex = 0 } = route?.params ?? {};

  const [showArabic,   setShowArabic]   = useState(true);
  const [showTranslit, setShowTranslit] = useState(true);
  const [showTrans,    setShowTrans]    = useState(true);
  const [bookmarked,   setBookmarked]   = useState(false);
  const [fontSize,     setFontSize]     = useState("md");
  const [idx,          setIdx]          = useState(currentIndex);

  const activeDua = allDuas.length > 0 ? allDuas[idx] : dua;
  if (!activeDua) return null;

  const hasPrev = idx > 0;
  const hasNext = idx < allDuas.length - 1;

  const arabicSize = fontSize === "sm" ? 22 : fontSize === "lg" ? 36 : 28;
  const bodySize   = fontSize === "sm" ? 13  : fontSize === "lg" ? 17  : 15;

  const handleShare = async () => {
    await Share.share({
      message: activeDua.title + "\n\n" + activeDua.arabic + "\n\n" + activeDua.transliteration + "\n\n\"" + activeDua.translation + "\"\n\n\u2014 " + activeDua.source + "\n\nShared via Safar",
    });
  };

  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.iconBtn} onPress={() => navigation?.goBack?.()}>
          <Text style={s.backIcon}>{"\u2039"}</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerStage}>{activeDua.stage}</Text>
          <Text style={s.headerTitle} numberOfLines={1}>{activeDua.title}</Text>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.iconBtn} onPress={handleShare}>
            <Text style={s.iconTxt}>{"\u2191"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.iconBtn} onPress={() => setBookmarked(v => !v)}>
            <Text style={bookmarked ? [s.iconTxt, s.bookmarked] : s.iconTxt}>{bookmarked ? "\u2665" : "\u2661"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* KEY badge */}
        {activeDua.isFeatured ? (
          <View style={s.keyRow}>
            <View style={s.keyBadge}><Text style={s.keyBadgeTxt}>KEY DU\u02bf\u0100\u02be</Text></View>
          </View>
        ) : null}

        {/* Font size row */}
        <View style={s.fontRow}>
          <Text style={s.fontLabel}>Text size</Text>
          <View style={s.fontBtns}>
            {[["sm","A"],["md","A"],["lg","A"]].map(([key, lbl], i) => (
              <TouchableOpacity
                key={key}
                style={fontSize === key ? [s.fontBtn, s.fontBtnOn] : s.fontBtn}
                onPress={() => setFontSize(key)}>
                <Text style={[{ fontSize:11+i*3 }, fontSize === key ? s.fontBtnTxtOn : s.fontBtnTxt]}>{lbl}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Arabic */}
        {showArabic ? (
          <View style={s.arabicCard}>
            <Text style={[s.arabic, { fontSize:arabicSize, lineHeight:arabicSize * 1.9 }]}>
              {activeDua.arabic}
            </Text>
          </View>
        ) : null}

        {/* Transliteration */}
        {showTranslit && activeDua.transliteration ? (
          <View style={s.section}>
            <Text style={s.sectionLbl}>TRANSLITERATION</Text>
            <Text style={[s.translit, { fontSize:bodySize }]}>{activeDua.transliteration}</Text>
          </View>
        ) : null}

        {/* Translation */}
        {showTrans && activeDua.translation ? (
          <View style={s.section}>
            <Text style={s.sectionLbl}>TRANSLATION</Text>
            <Text style={[s.translation, { fontSize:bodySize }]}>{"\u201c"}{activeDua.translation}{"\u201d"}</Text>
          </View>
        ) : null}

        {/* Source */}
        {activeDua.source ? <Text style={s.source}>Reference: {activeDua.source}</Text> : null}

        {/* Audio player */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionLbl}>AUDIO RECITATION</Text>
        </View>
        <AudioPlayer
          dua={activeDua}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onPrev={() => { if (hasPrev) setIdx(i => i - 1); }}
          onNext={() => { if (hasNext) setIdx(i => i + 1); }}
        />

        {/* Display toggles */}
        <View style={s.togglesCard}>
          <Text style={s.togglesTitle}>Display options</Text>
          <ToggleRow label="Arabic text"      value={showArabic}   onToggle={() => setShowArabic(v => !v)} />
          <ToggleRow label="Transliteration"  value={showTranslit} onToggle={() => setShowTranslit(v => !v)} />
          <ToggleRow label="Translation"      value={showTrans}    onToggle={() => setShowTrans(v => !v)} />
        </View>

        {/* Prev / Next navigation */}
        {allDuas.length > 1 ? (
          <View style={s.navRow}>
            <TouchableOpacity
              style={hasPrev ? s.navPill : [s.navPill, s.navPillDim]}
              onPress={() => { if (hasPrev) setIdx(i => i - 1); }}
              disabled={!hasPrev} activeOpacity={0.8}>
              <Text style={s.navPillTxt}>{"\u2190"} Previous</Text>
            </TouchableOpacity>
            <Text style={s.navCount}>{idx + 1} / {allDuas.length}</Text>
            <TouchableOpacity
              style={hasNext ? s.navPill : [s.navPill, s.navPillDim]}
              onPress={() => { if (hasNext) setIdx(i => i + 1); }}
              disabled={!hasNext} activeOpacity={0.8}>
              <Text style={s.navPillTxt}>Next {"\u2192"}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <ScholarlyFootnote />
        <View style={{ height:spacing(4) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex:1, backgroundColor:colors.background },

  header:     { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:spacing(2), paddingTop:spacing(2), paddingBottom:spacing(1.5), borderBottomWidth:1, borderBottomColor:colors.border },
  iconBtn:    { width:36, height:36, alignItems:"center", justifyContent:"center" },
  backIcon:   { fontSize:26, color:colors.text, lineHeight:30 },
  iconTxt:    { fontSize:22, color:colors.subtext },
  bookmarked: { color:colors.accent },
  headerCenter:{ flex:1, alignItems:"center", paddingHorizontal:spacing(1) },
  headerStage: { fontSize:12, color:colors.accent, fontWeight:"500", letterSpacing:0.8 },
  headerTitle: { fontFamily:SERIF, fontSize:16, color:colors.text, marginTop:1 },
  headerRight: { flexDirection:"row", gap:spacing(0.25) },

  scroll:     { paddingHorizontal:spacing(2.5), paddingTop:spacing(1.5) },

  keyRow:     { alignItems:"flex-start", marginBottom:spacing(1.5) },
  keyBadge:   { backgroundColor:colors.accent, paddingHorizontal:spacing(1), paddingVertical:4, borderRadius:4 },
  keyBadgeTxt:{ fontSize:10, color:"#fff", fontWeight:"700", letterSpacing:1.2 },

  fontRow:    { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:spacing(1.75) },
  fontLabel:  { fontSize:12, color:colors.subtext },
  fontBtns:   { flexDirection:"row", gap:spacing(0.75) },
  fontBtn:    { width:34, height:34, borderRadius:17, borderWidth:1, borderColor:colors.border, backgroundColor:colors.card, alignItems:"center", justifyContent:"center" },
  fontBtnOn:  { backgroundColor:colors.primary, borderColor:colors.primary },
  fontBtnTxt: { color:colors.subtext },
  fontBtnTxtOn:{ color:"#fff", fontWeight:"600" },

  arabicCard: { backgroundColor:colors.card, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, paddingVertical:spacing(3), paddingHorizontal:spacing(2.5), marginBottom:spacing(2.5) },
  arabic:     { textAlign:"right", color:colors.text, fontWeight:"400" },

  section:    { marginBottom:spacing(2) },
  sectionHeader:{ marginBottom:spacing(1) },
  sectionLbl: { fontSize:10, fontWeight:"700", letterSpacing:1.8, color:colors.accent },
  translit:   { color:colors.subtext, fontStyle:"italic", fontWeight:"300", lineHeight:26, marginTop:spacing(0.75) },
  translation:{ fontFamily:SERIF, color:colors.text, fontWeight:"300", lineHeight:26, marginTop:spacing(0.75) },
  source:     { fontSize:12, color:colors.subtext, marginBottom:spacing(2), fontWeight:"300" },

  togglesCard: { backgroundColor:colors.card, borderRadius:radius.md, borderWidth:1, borderColor:colors.border, padding:spacing(2), marginBottom:spacing(2) },
  togglesTitle:{ fontFamily:SERIF, fontSize:15, color:colors.text, marginBottom:spacing(0.5) },

  navRow:     { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:spacing(2) },
  navPill:    { backgroundColor:colors.card, borderRadius:radius.md, borderWidth:1, borderColor:colors.border, paddingHorizontal:spacing(2), paddingVertical:spacing(1.25) },
  navPillDim: { opacity:0.35 },
  navPillTxt: { fontSize:13, color:colors.primary, fontWeight:"500" },
  navCount:   { fontSize:12, color:colors.subtext },
});
