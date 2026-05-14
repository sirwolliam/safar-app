/**
 * PracticeLearnScreen.jsx — Safar
 * Audio playback queue by ritual stage.
 * Repeat mode, sequential playback.
 */
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from "react-native";
import { Audio } from "expo-av";
import { DUAS, AUDIO_FILES } from "../dua-content";
import { colors, spacing, radius, shadows, typography } from "../theme";
import { useAccessibility } from "../AccessibilityContext";

const SERIF = "SourceSerif4-Regular";
// ── Scholarly footnote ─────────────────────────────────────────────────────────

function ScholarlyFootnote({ style }) {
  return (
    <View style={[fn.wrap, style]}>
      <Text style={fn.text}>
        <Text style={fn.bold}>Sources</Text>{" — "}
        Duas are drawn from Ṣaḥīḥ al-Bukhārī, Ṣaḥīḥ Muslim, Sunan Abī Dāwūd, Sunan al-Tirmidhī, and established scholarly works. Each duʿāʾ is attributed to its primary source. Practice and wording may differ across the four madhabs (Ḥanafī, Mālikī, Shāfiʿī, Ḥanbalī). Consult a qualified scholar for rulings specific to your school of thought.
      </Text>
    </View>
  );
}

const fn = StyleSheet.create({
  wrap: {
    marginHorizontal: spacing(2.5),
    marginTop: spacing(2),
    marginBottom: spacing(1),
    backgroundColor: "#F5EDD8",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#E8D9B8",
    padding: spacing(2),
  },
  text: {
    fontSize: typography.tiny,
    color: "#7A6030",
    lineHeight: 17,
  },
  bold: {
    fontWeight: "600",
  },
});


const STAGES = ["All", "Ihram", "Entry", "Tawaf", "Saʿy", "Arafah", "Muzdalifah", "Jamarat", "Farewell"];

export default function PracticeLearnScreen({ navigation }) {
  const { colors } = useAccessibility();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [stage,      setStage]      = useState("All");
  const [voiceMode,  setVoiceMode]  = useState("traditional");
  const [repeat,     setRepeat]     = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [status,     setStatus]     = useState("idle"); // idle|loading|playing|paused
  const soundRef = useRef(null);

  const filtered = stage === "All" ? DUAS : DUAS.filter((d) => d.stage === stage);
  const current  = filtered[currentIdx];

  useEffect(() => {
    return () => { soundRef.current?.unloadAsync(); };
  }, []);

  useEffect(() => {
    stopAudio();
    setCurrentIdx(0);
  }, [stage]);

  const stopAudio = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync().catch(() => {});
      await soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }
    setStatus("idle");
  };

  const playDua = async (idx) => {
    await stopAudio();
    const dua = filtered[idx];
    if (!dua) return;

    const source = AUDIO_FILES?.[voiceMode]?.[dua.id];
    if (!source) { setStatus("idle"); return; }

    setStatus("loading");
    setCurrentIdx(idx);

    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        source,
        { shouldPlay: true },
        (ps) => {
          if (!ps.isLoaded) return;
          if (ps.didJustFinish) {
            const next = idx + 1;
            if (next < filtered.length) {
              playDua(next);
            } else if (repeat) {
              playDua(0);
            } else {
              setStatus("idle");
            }
          }
        }
      );
      soundRef.current = sound;
      setStatus("playing");
    } catch { setStatus("idle"); }
  };

  const togglePlayPause = async () => {
    if (status === "playing") {
      await soundRef.current?.pauseAsync();
      setStatus("paused");
    } else if (status === "paused") {
      await soundRef.current?.playAsync();
      setStatus("playing");
    } else {
      playDua(currentIdx);
    }
  };

  const goNext = () => {
    const next = currentIdx + 1;
    if (next < filtered.length) playDua(next);
    else if (repeat) playDua(0);
  };

  const goPrev = () => {
    const prev = currentIdx - 1;
    if (prev >= 0) playDua(prev);
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 24 }} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Practice & Learn</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Voice toggle */}
      <View style={s.voiceRow}>
        <Text style={s.voiceLabel}>Voice</Text>
        <View style={s.voiceToggle}>
          {[["traditional","Traditional"],["gentle","Gentle"]].map(([k,l]) => (
            <TouchableOpacity
              key={k}
              style={[s.voiceOpt, voiceMode === k && s.voiceOptActive]}
              onPress={() => { setVoiceMode(k); stopAudio(); }}
            >
              <Text style={[s.voiceOptText, voiceMode === k && s.voiceOptTextActive]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Stage filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.stageRow}>
        {STAGES.map((st) => (
          <TouchableOpacity
            key={st}
            style={[s.stageChip, stage === st && s.stageChipActive]}
            onPress={() => setStage(st)} activeOpacity={0.8}
          >
            <Text style={[s.stageChipText, stage === st && s.stageChipTextActive]}>{st}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Now playing card */}
      {current && (
        <View style={s.nowPlaying}>
          <Text style={s.npStage}>{current.stage}</Text>
          <Text style={s.npTitle}>{current.title}</Text>
          <Text style={s.npArabic} numberOfLines={2}>{current.arabic}</Text>

          {/* Controls */}
          <View style={s.controls}>
            <TouchableOpacity style={s.controlBtn} onPress={goPrev} disabled={currentIdx === 0}>
              <Text style={[s.controlIcon, currentIdx === 0 && s.controlDisabled]}>⏮</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.playBtn} onPress={togglePlayPause}>
              {status === "loading"
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.playIcon}>{status === "playing" ? "⏸" : "▶"}</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity style={s.controlBtn} onPress={goNext} disabled={currentIdx === filtered.length - 1 && !repeat}>
              <Text style={[s.controlIcon, currentIdx === filtered.length - 1 && !repeat && s.controlDisabled]}>⏭</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.repeatBtn, repeat && s.repeatBtnActive]} onPress={() => setRepeat(r => !r)}>
              <Text style={[s.repeatIcon, repeat && s.repeatIconActive]}>↺</Text>
            </TouchableOpacity>
          </View>

          <Text style={s.npCount}>{currentIdx + 1} / {filtered.length}</Text>
        </View>
      )}

      {/* Dua list */}
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {filtered.map((dua, i) => (
          <TouchableOpacity
            key={dua.id}
            style={[s.duaRow, i === currentIdx && s.duaRowActive]}
            onPress={() => playDua(i)} activeOpacity={0.85}
          >
            <View style={[s.trackNum, i === currentIdx && s.trackNumActive]}>
              {status === "playing" && i === currentIdx
                ? <Text style={s.playingDot}>▶</Text>
                : <Text style={[s.trackNumText, i === currentIdx && s.trackNumTextActive]}>{i + 1}</Text>
              }
            </View>
            <View style={s.duaInfo}>
              <Text style={[s.duaTitle, i === currentIdx && s.duaTitleActive]}>{dua.title}</Text>
              <Text style={s.duaStage}>{dua.stage}</Text>
            </View>
          </TouchableOpacity>
        ))}
        <ScholarlyFootnote />
        <View style={{ height: spacing(4) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing(2.5), paddingTop: spacing(2), paddingBottom: spacing(1),
  },
  back: { fontSize: 22, color: colors.text },
  headerTitle: { fontFamily: SERIF, fontSize: 22, color: colors.text },

  voiceRow: {
    flexDirection: "row", alignItems: "center", gap: spacing(1.25),
    paddingHorizontal: spacing(2.5), marginBottom: spacing(1),
  },
  voiceLabel: { fontSize: typography.tiny, color: colors.subtext },
  voiceToggle: {
    flex: 1, flexDirection: "row", backgroundColor: colors.card,
    borderRadius: radius.pill, padding: 3, borderWidth: 1, borderColor: colors.border,
  },
  voiceOpt: { flex: 1, paddingVertical: spacing(0.75), borderRadius: radius.pill, alignItems: "center" },
  voiceOptActive: { backgroundColor: colors.primary },
  voiceOptText: { fontSize: typography.tiny, color: colors.subtext },
  voiceOptTextActive: { color: "#fff", fontWeight: "500" },

  stageRow: { paddingHorizontal: spacing(2.5), gap: spacing(1), paddingBottom: spacing(1.5) },
  stageChip: {
    paddingHorizontal: spacing(1.75), paddingVertical: spacing(0.75),
    borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card,
  },
  stageChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  stageChipText: { fontSize: typography.tiny, color: colors.subtext },
  stageChipTextActive: { color: "#fff", fontWeight: "500" },

  nowPlaying: {
    marginHorizontal: spacing(2.5), backgroundColor: "#EBF2EE",
    borderRadius: radius.lg, borderWidth: 1, borderColor: "#C8DDD0",
    padding: spacing(2.5), marginBottom: spacing(1.5), ...shadows.card,
  },
  npStage: { fontSize: typography.tiny, color: colors.primary, fontWeight: "600", letterSpacing: 1, marginBottom: 3 },
  npTitle: { fontFamily: SERIF, fontSize: typography.heading, color: colors.text, marginBottom: spacing(0.75) },
  npArabic: { fontSize: 18, color: colors.subtext, textAlign: "right", marginBottom: spacing(2), lineHeight: 32 },
  controls: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing(2), marginBottom: spacing(1) },
  controlBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  controlIcon: { fontSize: 22, color: colors.text },
  controlDisabled: { opacity: 0.3 },
  playBtn: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center", ...shadows.button,
  },
  playIcon: { fontSize: 22, color: "#fff" },
  repeatBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20 },
  repeatBtnActive: { backgroundColor: "rgba(47,93,80,0.15)" },
  repeatIcon: { fontSize: 22, color: colors.subtext },
  repeatIconActive: { color: colors.primary },
  npCount: { fontSize: typography.tiny, color: colors.subtext, textAlign: "center" },

  scroll: { paddingHorizontal: spacing(2.5) },
  duaRow: {
    flexDirection: "row", alignItems: "center", gap: spacing(1.5),
    paddingVertical: spacing(1.5), borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  duaRowActive: { backgroundColor: "rgba(47,93,80,0.06)", borderRadius: radius.sm },
  trackNum: {
    width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center",
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
  },
  trackNumActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  trackNumText: { fontSize: typography.tiny, color: colors.subtext, fontWeight: "500" },
  trackNumTextActive: { color: "#fff" },
  playingDot: { fontSize: 10, color: "#fff" },
  duaInfo: { flex: 1 },
  duaTitle: { fontSize: typography.body, color: colors.text, fontFamily: SERIF },
  duaTitleActive: { color: colors.primary, fontWeight: "500" },
  duaStage: { fontSize: typography.tiny, color: colors.subtext, marginTop: 2 },
});
