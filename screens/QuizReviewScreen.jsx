/**
 * QuizReviewScreen.jsx — Safar
 * Dedicated review screen, reached from Results' "Review Answers" button.
 * Numbered rows, green for correct / rust for incorrect, matching the
 * Claude Design mockup's Screen 6. Rows expand on tap to show the full
 * answer detail (your answer / correct answer / explanation) — the
 * mockup shows the collapsed state only, expand-on-tap is preserved
 * from the previous inline review cards so that detail isn't lost.
 *
 * Coding rules: StyleSheet.create at module level, literal hex only.
 */
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CaretLeft, Check, X } from "phosphor-react-native";
import { getTopicById } from "../quizData";

const SERIF = "SourceSerif4-Regular";

const DARK_GREEN   = "#163C2C";
const CREAM        = "#FBF1E1";
const CARD_BG      = "#FFFDF8";
const BORDER       = "#E4D6BC";
const TEXT         = "#23180F";
const MUTED        = "#8A7A63";
const GREEN_BG     = "#EAF2ED";
const GREEN_TXT    = "#2F7A55";
const RUST_BG      = "#F3D5CC";
const RUST_TXT     = "#B14A32";
const RUST_BORDER  = "#E3B7A9";

function ReviewRow({ question, answer, index }) {
  const [expanded, setExpanded] = useState(false);
  const isCorrect = answer?.correct ?? false;
  const badgeBg = isCorrect ? GREEN_BG : RUST_BG;
  const badgeTxt = isCorrect ? GREEN_TXT : RUST_TXT;

  return (
    <TouchableOpacity
      style={[s.row, isCorrect ? s.rowCorrect : s.rowWrong]}
      onPress={() => setExpanded(e => !e)}
      activeOpacity={0.9}
    >
      <View style={s.topLine}>
        <View style={[s.numBadge, { backgroundColor: badgeBg }]}>
          <Text style={[s.numTxt, { color: badgeTxt }]}>{index + 1}</Text>
        </View>
        <Text style={s.question} numberOfLines={expanded ? undefined : 1}>{question.question}</Text>
        {isCorrect
          ? <Check size={16} color={GREEN_TXT} weight="bold" />
          : <X size={16} color={RUST_TXT} weight="bold" />
        }
      </View>
      {expanded ? (
        <View style={s.detail}>
          {!isCorrect ? (
            <View style={s.answerBlock}>
              <Text style={s.answerLabel}>Your answer</Text>
              <Text style={[s.answerValue, { color: RUST_TXT }]}>
                {String.fromCharCode(65 + (answer?.selectedIdx ?? 0))}. {question.choices[answer?.selectedIdx ?? 0]}
              </Text>
            </View>
          ) : null}
          <View style={s.answerBlock}>
            <Text style={s.answerLabel}>Correct answer</Text>
            <Text style={[s.answerValue, { color: GREEN_TXT }]}>
              {String.fromCharCode(65 + question.correct)}. {question.choices[question.correct]}
            </Text>
          </View>
          <Text style={s.expl}>{question.explanation}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

export default function QuizReviewScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { topicId, answers = [] } = route?.params ?? {};
  const topic = getTopicById(topicId);

  if (!topic) return null;

  return (
    <View style={s.root}>
      <View style={[s.header, { paddingTop: insets.top + 14 }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.8}>
          <CaretLeft size={16} color={CREAM} weight="bold" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Review Answers</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {topic.questions.map((q, idx) => {
          const answer = answers.find(a => a.questionId === q.id);
          return <ReviewRow key={q.id} question={q} answer={answer} index={idx} />;
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: CREAM },

  header: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: DARK_GREEN },
  backBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(255,255,255,0.14)", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: SERIF, fontSize: 19, fontWeight: "700", color: CREAM },

  scroll: { paddingHorizontal: 20, paddingTop: 18 },

  row: { backgroundColor: CARD_BG, borderRadius: 14, borderWidth: 1.5, padding: 14, marginBottom: 10 },
  rowCorrect: { borderColor: BORDER },
  rowWrong: { borderColor: RUST_BORDER, backgroundColor: "#FBEAE6" },

  topLine: { flexDirection: "row", alignItems: "center", gap: 12 },
  numBadge: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  numTxt: { fontSize: 12, fontWeight: "700" },
  question: { flex: 1, fontSize: 14, color: TEXT, lineHeight: 20 },

  detail: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: BORDER, gap: 10 },
  answerBlock: {},
  answerLabel: { fontSize: 11, fontWeight: "700", color: MUTED, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.4 },
  answerValue: { fontFamily: SERIF, fontSize: 15, fontWeight: "700" },
  expl: { fontSize: 13, color: "#4A3F30", lineHeight: 19, marginTop: 2 },
});
