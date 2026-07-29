/**
 * QuizScreen.jsx — Safar
 * Active quiz — one question at a time. Tap a choice, see immediate
 * green/red feedback + explanation, tap Next. Slim header (not ornate)
 * to maximize content area for reading.
 *
 * Coding rules: StyleSheet.create at module level, literal hex only.
 */
import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CaretLeft } from "phosphor-react-native";
import { getTopicById } from "../quizData";

const SERIF = "SourceSerif4-Regular";

const PAGE_BG    = "#F5F0E8";
const CARD_BG    = "#FDFAF4";
const TEXT       = "#1A1410";
const TEXT_SEC   = "#8A7D6A";
const TEXT_MUTED = "#5C534A";
const BORDER     = "#DDD5C0";
const SAGE       = "#4A5C48";
const GOLD       = "#C8A96A";
const CORRECT_BG = "#4A5C4818";
const CORRECT_BD = "#4A5C48";
const WRONG_BG   = "#C24A4A18";
const WRONG_BD   = "#C24A4A";

export default function QuizScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { topicId } = route?.params ?? {};
  const topic = getTopicById(topicId);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null); // index of tapped choice
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState([]); // array of { questionId, correct }

  if (!topic || topic.questions.length === 0) {
    return (
      <View style={[s.root, { alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ color: TEXT_MUTED }}>No questions available for this topic.</Text>
      </View>
    );
  }

  const questions = topic.questions;
  const q = questions[currentIdx];
  const total = questions.length;
  const isCorrect = selected === q.correct;
  const progressPct = ((currentIdx + (answered ? 1 : 0)) / total) * 100;

  const handleSelect = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    setResults(prev => [...prev, { questionId: q.id, correct: idx === q.correct }]);
  };

  const handleNext = () => {
    if (currentIdx < total - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      const score = [...results].filter(r => r.correct).length;
      navigation?.replace?.("QuizResults", { topicId, score, total });
    }
  };

  const handleQuit = () => {
    navigation?.goBack?.();
  };

  const choiceStyle = (idx) => {
    if (!answered) return s.choice;
    if (idx === q.correct) return [s.choice, s.choiceCorrect];
    if (idx === selected && !isCorrect) return [s.choice, s.choiceWrong];
    return [s.choice, s.choiceDimmed];
  };

  const choiceTextStyle = (idx) => {
    if (!answered) return s.choiceTxt;
    if (idx === q.correct) return [s.choiceTxt, s.choiceTxtCorrect];
    if (idx === selected && !isCorrect) return [s.choiceTxt, s.choiceTxtWrong];
    return [s.choiceTxt, s.choiceTxtDimmed];
  };

  return (
    <View style={s.root}>
      <View style={[s.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={handleQuit} hitSlop={{ top: 12, bottom: 12, left: 12, right: 24 }}>
          <CaretLeft size={20} color={TEXT} weight="bold" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{topic.title}</Text>
        <Text style={s.headerCount}>{currentIdx + 1}/{total}</Text>
      </View>

      <View style={s.progressBar}>
        <View style={[s.progressFill, { width: `${progressPct}%` }]} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.questionTxt}>{q.question}</Text>

        <View style={s.choicesWrap}>
          {q.choices.map((choice, idx) => (
            <TouchableOpacity
              key={idx}
              style={choiceStyle(idx)}
              onPress={() => handleSelect(idx)}
              activeOpacity={answered ? 1 : 0.85}
              disabled={answered}
            >
              <View style={s.choiceLetter}>
                <Text style={s.choiceLetterTxt}>
                  {String.fromCharCode(65 + idx)}
                </Text>
              </View>
              <Text style={choiceTextStyle(idx)}>{choice}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {answered ? (
          <View style={isCorrect ? s.feedbackCorrect : s.feedbackWrong}>
            <Text style={s.feedbackTitle}>{isCorrect ? "Correct!" : "Not quite"}</Text>
            <Text style={s.feedbackTxt}>{q.explanation}</Text>
          </View>
        ) : null}

        <View style={{ height: 80 }} />
      </ScrollView>

      {answered ? (
        <View style={[s.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity style={s.nextBtn} onPress={handleNext} activeOpacity={0.88}>
            <Text style={s.nextBtnTxt}>
              {currentIdx < total - 1 ? "Next Question" : "See Results"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: PAGE_BG },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 12, backgroundColor: PAGE_BG },
  headerTitle: { fontFamily: SERIF, fontSize: 17, color: TEXT },
  headerCount: { fontSize: 14, color: TEXT_SEC, fontWeight: "600" },

  progressBar: { height: 3, backgroundColor: BORDER, marginHorizontal: 20 },
  progressFill: { height: 3, backgroundColor: SAGE, borderRadius: 2 },

  scroll: { paddingHorizontal: 20, paddingTop: 28 },

  questionTxt: { fontFamily: SERIF, fontSize: 22, color: TEXT, lineHeight: 30, marginBottom: 24 },

  choicesWrap: { gap: 10 },
  choice: {
    flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: CARD_BG,
    borderRadius: 14, borderWidth: 1.5, borderColor: BORDER, padding: 16,
  },
  choiceCorrect: { backgroundColor: CORRECT_BG, borderColor: CORRECT_BD },
  choiceWrong: { backgroundColor: WRONG_BG, borderColor: WRONG_BD },
  choiceDimmed: { opacity: 0.45 },
  choiceLetter: { width: 32, height: 32, borderRadius: 16, backgroundColor: PAGE_BG, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: BORDER },
  choiceLetterTxt: { fontSize: 14, fontWeight: "700", color: TEXT_SEC },
  choiceTxt: { flex: 1, fontSize: 16, color: TEXT, lineHeight: 22 },
  choiceTxtCorrect: { color: CORRECT_BD, fontWeight: "600" },
  choiceTxtWrong: { color: WRONG_BD },
  choiceTxtDimmed: { color: TEXT_MUTED },

  feedbackCorrect: { marginTop: 20, backgroundColor: CORRECT_BG, borderRadius: 14, borderWidth: 1, borderColor: CORRECT_BD, padding: 16 },
  feedbackWrong: { marginTop: 20, backgroundColor: WRONG_BG, borderRadius: 14, borderWidth: 1, borderColor: WRONG_BD, padding: 16 },
  feedbackTitle: { fontSize: 16, fontWeight: "700", color: TEXT, marginBottom: 6 },
  feedbackTxt: { fontSize: 14, color: TEXT_MUTED, lineHeight: 20 },

  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 12, backgroundColor: PAGE_BG, borderTopWidth: 1, borderTopColor: BORDER },
  nextBtn: { backgroundColor: SAGE, borderRadius: 12, paddingVertical: 16, alignItems: "center" },
  nextBtnTxt: { fontSize: 16, color: "#FFFFFF", fontWeight: "600" },
});
