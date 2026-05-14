/**
 * AudioPlayer.jsx — Safar
 * Reusable audio player component for dua recitation
 * Uses expo-av for playback
 *
 * Install: npx expo install expo-av
 *
 * Two modes:
 *   traditional — measured, clear adult recitation
 *   gentle      — slower, warmer, for children/beginners
 */
import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from "react-native";
import { Audio } from "expo-av";
import { colors, spacing, radius, shadows, typography } from "../theme";

const SERIF = "SourceSerif4-Regular";

export default function AudioPlayer({ duaId, audioFiles, style }) {
  const [voiceMode, setVoiceMode] = useState("traditional"); // traditional | gentle
  const [status,    setStatus]    = useState("idle");         // idle | loading | playing | paused | error
  const [position,  setPosition]  = useState(0);  // ms
  const [duration,  setDuration]  = useState(0);  // ms
  const soundRef = useRef(null);

  // Clean up on unmount
  useEffect(() => {
    return () => { soundRef.current?.unloadAsync(); };
  }, []);

  // Unload when voice mode changes
  useEffect(() => {
    stopAndUnload();
  }, [voiceMode]);

  const stopAndUnload = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync().catch(() => {});
      await soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }
    setStatus("idle");
    setPosition(0);
    setDuration(0);
  };

  const getAudioSource = () => {
    return audioFiles?.[voiceMode]?.[duaId] ?? null;
  };

  const handlePlayPause = async () => {
    const source = getAudioSource();
    if (!source) { setStatus("error"); return; }

    try {
      if (status === "playing") {
        await soundRef.current?.pauseAsync();
        setStatus("paused");
        return;
      }

      if (status === "paused" && soundRef.current) {
        await soundRef.current.playAsync();
        setStatus("playing");
        return;
      }

      // Fresh load
      setStatus("loading");
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

      const { sound } = await Audio.Sound.createAsync(
        source,
        { shouldPlay: true },
        (playbackStatus) => {
          if (!playbackStatus.isLoaded) return;
          setPosition(playbackStatus.positionMillis);
          setDuration(playbackStatus.durationMillis || 0);
          if (playbackStatus.didJustFinish) {
            setStatus("idle");
            setPosition(0);
          }
        }
      );

      soundRef.current = sound;
      setStatus("playing");
    } catch (e) {
      console.error("Audio error:", e);
      setStatus("error");
    }
  };

  const handleRestart = async () => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(0);
      await soundRef.current.playAsync();
      setStatus("playing");
    }
  };

  const progress = duration > 0 ? position / duration : 0;
  const formatTime = (ms) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  return (
    <View style={[s.container, style]}>

      {/* Voice mode toggle */}
      <View style={s.modeRow}>
        <Text style={s.modeLabel}>Voice</Text>
        <View style={s.modeToggle}>
          {[["traditional", "Traditional"], ["gentle", "Gentle (for children)"]].map(([key, label]) => (
            <TouchableOpacity
              key={key}
              style={[s.modeOpt, voiceMode === key && s.modeOptActive]}
              onPress={() => setVoiceMode(key)}
              activeOpacity={0.8}
            >
              <Text style={[s.modeOptText, voiceMode === key && s.modeOptTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Controls row */}
      <View style={s.controls}>

        {/* Restart */}
        <TouchableOpacity
          style={s.iconBtn}
          onPress={handleRestart}
          disabled={status === "idle" || status === "loading"}
          activeOpacity={0.7}
        >
          <Text style={[s.iconBtnText, (status === "idle" || status === "loading") && s.disabled]}>↩</Text>
        </TouchableOpacity>

        {/* Play / pause main button */}
        <TouchableOpacity style={s.playBtn} onPress={handlePlayPause} activeOpacity={0.88}>
          {status === "loading" ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={s.playBtnIcon}>
              {status === "playing" ? "⏸" : "▶"}
            </Text>
          )}
        </TouchableOpacity>

        {/* Stop */}
        <TouchableOpacity
          style={s.iconBtn}
          onPress={stopAndUnload}
          disabled={status === "idle"}
          activeOpacity={0.7}
        >
          <Text style={[s.iconBtnText, status === "idle" && s.disabled]}>⏹</Text>
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      {duration > 0 && (
        <View style={s.progressWrap}>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
          <View style={s.timeRow}>
            <Text style={s.timeText}>{formatTime(position)}</Text>
            <Text style={s.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>
      )}

      {status === "error" && (
        <Text style={s.errorText}>Audio unavailable — please check your connection.</Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: "#EBF2EE",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#C8DDD0",
    padding: spacing(2),
  },

  modeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(1.25),
    marginBottom: spacing(1.5),
  },
  modeLabel: {
    fontSize: typography.tiny,
    color: colors.subtext,
    fontWeight: "500",
  },
  modeToggle: {
    flexDirection: "row",
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.pill,
    padding: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeOpt: {
    flex: 1,
    paddingVertical: spacing(0.75),
    borderRadius: radius.pill,
    alignItems: "center",
  },
  modeOptActive: { backgroundColor: colors.primary },
  modeOptText: { fontSize: typography.tiny, color: colors.subtext },
  modeOptTextActive: { color: "#fff", fontWeight: "500" },

  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing(2.5),
    marginBottom: spacing(1.25),
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    alignItems: "center", justifyContent: "center",
  },
  iconBtnText: { fontSize: 16, color: colors.text },
  disabled: { opacity: 0.3 },

  playBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center",
    ...shadows.button,
  },
  playBtnIcon: { fontSize: 20, color: "#fff", lineHeight: 24 },

  progressWrap: { gap: 4 },
  progressTrack: {
    height: 3, backgroundColor: colors.border,
    borderRadius: 2, overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: colors.primary, borderRadius: 2 },
  timeRow: { flexDirection: "row", justifyContent: "space-between" },
  timeText: { fontSize: 10, color: colors.subtext },

  errorText: {
    fontSize: typography.tiny, color: colors.error,
    textAlign: "center", marginTop: spacing(0.75),
  },
});
