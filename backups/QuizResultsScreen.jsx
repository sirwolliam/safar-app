/**
 * QuizResultsScreen.jsx — Safar
 * Shows quiz results — score, encouragement, missed questions with
 * correct answers, and options to retake or go back to topics.
 *
 * Coding rules: StyleSheet.create at module level, literal hex only.
 */
import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CaretLeft, ArrowCounterClockwise, CheckCircle, XCircle } from "phosphor-react-native";
import { getTopicById } from "../quizData";
import { saveResult } from "../quizStore";

const SERIF = "SourceSerif4-Regular";

const PAGE_BG    = "#F5F0E8";
const CARD_BG    = "#FDFAF4";
const TEXT       = "#1A1410";
const TEXT_SEC   = "#8A7D6A";
const TEXT_MUTED = "#5C534A";
const BORDER     = "#DDD5C0";
const SAGE       = "#4A5C48";
const GOLD       = "#C8A96A";
const CORRECT    = "#4A5C48";
const WRONG      = "#C24A4A";

function encouragement(pct) {
  if (pct === 100) return "Masha'Allah, perfect score!";
  if (pct >= 80) return "Excellent work, almost there!";
  if (pct >= 60) return "Good effort, keep learning!";
  if (pct >= 40) return "A solid start. Review and try again.";
  return "Keep going. Every step of learning counts.";
}

export default function QuizResultsScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { topicId, score, total } = route?.params ?? {};
  const topic = getTopicById(topicId);
  const [saved, setSaved] = useState(false);

  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  useEffect(() => {
    if (topicId && score != null && total && !saved) {
      saveResult(topicId, score, total).then(() => setSaved(true));
    }
  }, [topicId, score, total]);

  if (!topic) return null;

  return (
    <View style={s.root}>
      <View style={[s.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 24 }}>
          <CaretLeft size={20} color={TEXT} weight="bold" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Results</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.scoreCard}>
          <Text style={s.scoreNum}>{score}/{total}</Text>
          <Text style={s.scorePct}>{pct}%</Text>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${pct}%`, backgroundColor: pct >= 60 ? SAGE : WRONG }]} />
          </View>
          <Text style={s.encourage}>{encouragement(pct)}</Text>
        </View>

        <View style={s.btnRow}>
          <TouchableOpacity
            style={s.retakeBtn}
            onPress={() => navigation?.replace?.("Quiz", { topicId })}
            activeOpacity={0.85}
          >
            <ArrowCounterClockwise size={16} color={SAGE} weight="bold" />
            <Text style={s.retakeTxt}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.doneBtn}
            onPress={() => navigation?.navigate?.("QuizHub")}
            activeOpacity={0.88}
          >
            <Text style={s.doneTxt}>All Topics</Text>
          </TouchableOpacity>
        </View>

        {score < total ? (
          <>
            <Text style={s.reviewLabel}>REVIEW MISSED QUESTIONS</Text>
            {topic.questions.map((q, idx) => {
              // We don't have per-question results passed here (just score/total),
              // so show all questions with correct answers as a study guide.
              // A future enhancement could pass the full results array.
              return (
                <View key={q.id} style={s.reviewCard}>
                  <View style={s.reviewHeader}>
                    <Text style={s.reviewNum}>{idx + 1}.</Text>
                    <Text style={s.reviewQ}>{q.question}</Text>
                  </View>
                  <View style={s.reviewAnswer}>
                    <CheckCircle size={14} color={CORRECT} weight="fill" />
                    <Text style={s.reviewCorrect}>{q.choices[q.correct]}</Text>
                  </View>
                  <Text style={s.reviewExpl}>{q.explanation}</Text>
                </View>
              );
            })}
          </>
        ) : (
          <View style={s.perfectWrap}>
            <CheckCircle size={36} color={SAGE} weight="fill" />
            <Text style={s.perfectTxt}>You got every question right.</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: PAGE_BG },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 12, backgroundColor: PAGE_BG, borderBottomWidth: 1, borderBottomColor: BORDER },
  headerTitle: { fontFamily: SERIF, fontSize: 17, color: TEXT },

  scroll: { paddingHorizontal: 20, paddingTop: 24 },

  scoreCard: {
    backgroundColor: CARD_BG, borderRadius: 20, borderWidth: 1, borderColor: BORDER,
    padding: 28, alignItems: "center", marginBottom: 16,
    shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  scoreNum: { fontFamily: SERIF, fontSize: 48, color: TEXT, marginBottom: 2 },
  scorePct: { fontSize: 18, fontWeight: "700", color: SAGE, marginBottom: 16 },
  progressBar: { width: "100%", height: 6, backgroundColor: BORDER, borderRadius: 3, overflow: "hidden", marginBottom: 14 },
  progressFill: { height: 6, borderRadius: 3 },
  encourage: { fontFamily: SERIF, fontSize: 16, color: TEXT_MUTED, textAlign: "center" },

  btnRow: { flexDirection: "row", gap: 10, marginBottom: 28 },
  retakeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, borderWidth: 1, borderColor: SAGE, paddingVertical: 14 },
  retakeTxt: { fontSize: 16, color: SAGE, fontWeight: "600" },
  doneBtn: { flex: 1, borderRadius: 12, backgroundColor: SAGE, paddingVertical: 14, alignItems: "center" },
  doneTxt: { fontSize: 16, color: "#FFFFFF", fontWeight: "600" },

  reviewLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1.5, color: TEXT_SEC, marginBottom: 12 },
  reviewCard: { backgroundColor: CARD_BG, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 16, marginBottom: 10 },
  reviewHeader: { flexDirection: "row", gap: 6, marginBottom: 8 },
  reviewNum: { fontSize: 14, fontWeight: "700", color: TEXT_SEC },
  reviewQ: { flex: 1, fontSize: 15, color: TEXT, lineHeight: 21 },
  reviewAnswer: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  reviewCorrect: { fontSize: 14, color: CORRECT, fontWeight: "600" },
  reviewExpl: { fontSize: 13, color: TEXT_MUTED, lineHeight: 19 },

  perfectWrap: { alignItems: "center", paddingVertical: 28, gap: 10 },
  perfectTxt: { fontFamily: SERIF, fontSize: 16, color: TEXT_MUTED, textAlign: "center" },
});
