/**
 * QuizResultsScreen.jsx — Safar
 * Quiz results — overlapping score ring, stats cards, hadith quote, action buttons.
 *
 * Coding rules: StyleSheet.create at module level, literal hex only.
 */
import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Polygon } from "react-native-svg";
import { CaretLeft } from "phosphor-react-native";
import { getTopicById } from "../quizData";
import { saveResult } from "../quizStore";

const SERIF = "SourceSerif4-Regular";

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function ScoreRing({ score, total, pct }) {
  const size = 140;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = circumference * (total > 0 ? score / total : 0);
  const label = pct >= 80 ? "Excellent!" : pct >= 50 ? "Good Job!" : "Keep Practicing!";
  return (
    <View style={s.ringOuter}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#EDE4D4" strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={radius} stroke="#2F7A55" strokeWidth={stroke} fill="none"
          strokeDasharray={`${filled} ${circumference - filled}`}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
          rotation="-90" origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={s.ringScore}>{score}<Text style={s.ringTotal}>/{total}</Text></Text>
      <Text style={s.ringLabel}>{label}</Text>
    </View>
  );
}

export default function QuizResultsScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { topicId, score, total, elapsed = 0, answers = [] } = route?.params ?? {};
  const topic = getTopicById(topicId);
  const [saved, setSaved] = useState(false);

  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const incorrect = total - score;

  useEffect(() => {
    if (topicId && score != null && total && !saved) {
      saveResult(topicId, score, total).then(() => setSaved(true));
    }
  }, [topicId, score, total]);

  const doShare = async () => {
    try {
      await Share.share({
        message: `I scored ${score}/${total} on the ${topic?.title ?? "Safar"} quiz! Test your pilgrimage knowledge on the Safar app.`,
      });
    } catch (_) {}
  };

  if (!topic) return null;

  return (
    <View style={s.safe}>
      {/* Plain dark-green header */}
      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => navigation?.navigate?.("QuizHub")}
          activeOpacity={0.8}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 24 }}
        >
          <CaretLeft size={20} color="#FBF1E1" weight="bold" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={s.headerTitle}>Quiz Results</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Score ring — marginTop: -70 straddles the header/content boundary */}
      <View style={s.ringWrap}>
        <ScoreRing score={score} total={total} pct={pct} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Stats row — three coloured cards, no icons */}
        <View style={s.statsRow}>
          <View style={[s.statCard, s.statCardCorrect]}>
            <Text style={s.statNumWhite}>{score}</Text>
            <Text style={s.statLabelWhite}>Correct</Text>
          </View>
          <View style={[s.statCard, s.statCardWrong]}>
            <Text style={s.statNumWhite}>{incorrect}</Text>
            <Text style={s.statLabelWhite}>Incorrect</Text>
          </View>
          <View style={[s.statCard, s.statCardNeutral]}>
            <Text style={s.statNumDark}>{formatTime(elapsed)}</Text>
            <Text style={s.statLabelDark}>Time Taken</Text>
          </View>
        </View>

        {/* Hadith quote card */}
        <View style={s.quoteCard}>
          <Svg width={18} height={18} viewBox="0 0 18 18" style={{ alignSelf: "center", marginBottom: 10 }}>
            <Polygon points="9,1 11.12,6.88 17,9 11.12,11.12 9,17 6.88,11.12 1,9 6.88,6.88" fill="#B4842A" />
          </Svg>
          <Text style={s.quoteTxt}>{"“"}Seeking knowledge is an obligation upon every Muslim.{"”"}</Text>
          <Text style={s.quoteAttr}>Prophet Muhammad (peace be upon him)</Text>
        </View>

        {/* Primary button */}
        <TouchableOpacity
          style={s.reviewBtn}
          onPress={() => navigation?.navigate?.("QuizReview", { topicId, answers })}
          activeOpacity={0.85}
        >
          <Text style={s.reviewBtnTxt}>Review Answers</Text>
        </TouchableOpacity>

        {/* Secondary buttons */}
        <View style={s.secondaryRow}>
          <TouchableOpacity
            style={s.secondaryBtn}
            onPress={() => navigation?.replace?.("Quiz", { topicId })}
            activeOpacity={0.85}
          >
            <Text style={s.secondaryBtnTxt}>Retake Quiz</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.secondaryBtn}
            onPress={doShare}
            activeOpacity={0.85}
          >
            <Text style={s.secondaryBtnTxt}>Share Results</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.footnote}>
          Questions sourced from established Islamic scholarship. For detailed rulings consult a qualified scholar.
        </Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F0E8" },

  header: {
    backgroundColor: "#163C2C",
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingBottom: 16,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontFamily: SERIF, fontSize: 19, fontWeight: "700", color: "#FBF1E1" },

  ringWrap: {
    alignItems: "center",
    marginTop: -70,
    zIndex: 10,
    elevation: 10,
  },
  ringOuter: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: "#FFFDF8",
    borderWidth: 4, borderColor: "#FBF1E1",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  ringScore: { fontFamily: SERIF, fontSize: 26, fontWeight: "700", color: "#23180F" },
  ringTotal: { fontFamily: SERIF, fontSize: 16, fontWeight: "400", color: "#8A7D6A" },
  ringLabel: { fontSize: 11, fontWeight: "700", color: "#B4842A", marginTop: 2 },

  scroll: { paddingHorizontal: 20, paddingTop: 30, paddingBottom: 40 },

  statsRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: "center", justifyContent: "center" },
  statCardCorrect: { backgroundColor: "#163C2C" },
  statCardWrong: { backgroundColor: "#7A3324" },
  statCardNeutral: { backgroundColor: "#FFFDF8", borderWidth: 1.5, borderColor: "#E4D6BC" },
  statNumWhite: { fontFamily: SERIF, fontSize: 24, fontWeight: "700", color: "#FFFFFF" },
  statLabelWhite: { fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 2 },
  statNumDark: { fontFamily: SERIF, fontSize: 24, fontWeight: "700", color: "#23180F" },
  statLabelDark: { fontSize: 12, color: "#8A7D6A", marginTop: 2 },

  quoteCard: {
    backgroundColor: "#F3E4C8",
    borderWidth: 1.5, borderColor: "#D8AC4E",
    borderRadius: 16, padding: 16, marginBottom: 16,
  },
  quoteTxt: {
    fontStyle: "italic", fontSize: 13, lineHeight: 20,
    color: "#4A3F30", textAlign: "center", marginBottom: 8,
  },
  quoteAttr: { fontSize: 11.5, color: "#8A7A63", textAlign: "center" },

  reviewBtn: {
    backgroundColor: "#163C2C",
    borderRadius: 14, padding: 15,
    alignItems: "center", marginBottom: 10,
  },
  reviewBtnTxt: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },

  secondaryRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  secondaryBtn: {
    flex: 1, backgroundColor: "#FFFDF8",
    borderWidth: 1.5, borderColor: "#E4D6BC",
    borderRadius: 14, padding: 14, alignItems: "center",
  },
  secondaryBtnTxt: { fontSize: 14, fontWeight: "600", color: "#23180F" },

  footnote: { fontSize: 12, color: "#8A7D6A", textAlign: "center", paddingHorizontal: 20, marginTop: 4 },
});
