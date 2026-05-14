/**
 * components/AudioPlayer.jsx — Safar
 * Minimal audio player for a single dua.
 * Used by DuaDetailScreen.
 */
import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Audio } from "expo-av";
import { colors, spacing, radius, shadows, typography } from "../theme";

const SERIF = "SourceSerif4-Regular";

export default function AudioPlayer({ duaId, audioFiles, voiceMode = "traditional" }) {
  const soundRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | loading | playing | paused

  useEffect(() => {
    return () => { soundRef.current?.unloadAsync(); };
  }, []);

  const source = audioFiles?.[voiceMode]?.[duaId];

  const togglePlay = async () => {
    if (!source) return;

    if (status === "playing") {
      await soundRef.current?.pauseAsync();
      setStatus("paused");
      return;
    }
    if (status === "paused") {
      await soundRef.current?.playAsync();
      setStatus("playing");
      return;
    }

    setStatus("loading");
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        source,
        { shouldPlay: true },
        ps => {
          if (ps.didJustFinish) { setStatus("idle"); soundRef.current?.unloadAsync(); soundRef.current = null; }
        }
      );
      soundRef.current = sound;
      setStatus("playing");
    } catch {
      setStatus("idle");
    }
  };

  if (!source) {
    return (
      <View style={s.unavailWrap}>
        <Text style={s.unavailText}>Audio recitation coming soon</Text>
      </View>
    );
  }

  return (
    <View style={s.wrap}>
      <TouchableOpacity style={s.playBtn} onPress={togglePlay} activeOpacity={0.85}>
        {status === "loading"
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={s.playIcon}>{status === "playing" ? "\u23F8" : "\u25B6"}</Text>
        }
      </TouchableOpacity>
      <View style={s.track}>
        <View style={[s.progress, status === "playing" && s.progressActive]} />
      </View>
      <Text style={s.statusLabel}>
        {status === "idle" ? "Tap to listen" : status === "loading" ? "Loading..." : status === "playing" ? "Playing" : "Paused"}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap:          { flexDirection:"row", alignItems:"center", gap:spacing(1.5), backgroundColor:colors.card, borderRadius:radius.md, borderWidth:1, borderColor:colors.border, padding:spacing(1.75), ...shadows.card },
  playBtn:       { width:44, height:44, borderRadius:22, backgroundColor:colors.primary, alignItems:"center", justifyContent:"center", flexShrink:0, ...shadows.button },
  playIcon:      { fontSize:18, color:"#fff", marginLeft:2 },
  track:         { flex:1, height:4, backgroundColor:colors.border, borderRadius:2, overflow:"hidden" },
  progress:      { width:"0%", height:"100%", backgroundColor:colors.primary, borderRadius:2 },
  progressActive:{ width:"40%" },
  statusLabel:   { fontSize:typography.tiny, color:colors.subtext, fontWeight:"300" },
  unavailWrap:   { backgroundColor:colors.background, borderRadius:radius.md, borderWidth:1, borderColor:colors.border, padding:spacing(1.75), alignItems:"center" },
  unavailText:   { fontSize:typography.small, color:colors.subtext, fontWeight:"300" },
});
