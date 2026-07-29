/**
 * QuizScreen.jsx — Safar
 * Active quiz — full-bleed image header, one question at a time,
 * radio-style choices, and full-screen feedback overlays.
 *
 * Correct: sage green full-screen with large checkmark
 * Wrong: warm muted tone (not harsh red) with explanation
 *
 * Tracks elapsed time for the results screen.
 *
 * Coding rules: StyleSheet.create at module level, literal hex only.
 */
import React, { useState, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Modal, Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CaretLeft, CaretRight, CheckCircle, XCircle } from "phosphor-react-native";
import { getTopicById } from "../quizData";

const TOPIC_IMAGES = {
  "umrah-stages":  require("../assets/quiz/quiz-umrah.png"),
  "hajj-stages":   require("../assets/quiz/quiz-hajj.png"),
  "key-duas":      require("../assets/quiz/quiz-duas.png"),
  "sacred-places": require("../assets/quiz/quiz-places.png"),
};

const SERIF = "SourceSerif4-Regular";
const { width: SW } = Dimensions.get("window");
// quiz topic images are 670×280 px → ratio 2.393:1
const QUESTION_HEADER_H = SW / 2.393;

const PAGE_BG    = "#F5F0E8";
const CARD_BG    = "#FDFAF4";
const TEXT       = "#1A1410";
const TEXT_SEC   = "#8A7D6A";
const TEXT_MUTED = "#5C534A";
const BORDER     = "#DDD5C0";
const SAGE       = "#4A5C48";
const GOLD       = "#C8A96A";
const CORRECT_BG = "#4A5C48";
const WRONG_BG   = "#8B5E3C";

export default function QuizScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { topicId } = route?.params ?? {};
  const topic = getTopicById(topicId);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected]     = useState(null);
  const [answered, setAnswered]     = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [results, setResults]       = useState([]);
  const startTime = useRef(Date.now());

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

  const handleSelect = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    setResults(prev => [...prev, { questionId: q.id, selectedIdx: idx, correct: idx === q.correct }]);
    setTimeout(() => setShowFeedback(true), 200);
  };

  const handleContinue = () => {
    setShowFeedback(false);
    if (currentIdx < total - 1) {
      setTimeout(() => {
        setCurrentIdx(prev => prev + 1);
        setSelected(null);
        setAnswered(false);
      }, 150);
    } else {
      const score = [...results].filter(r => r.correct).length;
      const elapsed = Math.round((Date.now() - startTime.current) / 1000);
      navigation?.replace?.("QuizResults", { topicId, score, total, elapsed, answers: results });
    }
  };

  const choiceBorder = (idx) => {
    if (!answered) return BORDER;
    if (idx === q.correct) return SAGE;
    if (idx === selected && !isCorrect) return "#C24A4A";
    return BORDER;
  };

  const choiceRadio = (idx) => {
    if (!answered) return s.radio;
    if (idx === q.correct) return [s.radio, s.radioCorrect];
    if (idx === selected && !isCorrect) return [s.radio, s.radioWrong];
    return s.radio;
  };

  return (
    <View style={s.root}>
      {/* Full-bleed image header — replaces old text header + illustrationZone */}
      <View style={[s.questionHeader, { height: QUESTION_HEADER_H }]}>
        {TOPIC_IMAGES[topic.id] ? (
          <Image
            source={TOPIC_IMAGES[topic.id]}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: SAGE }]} />
        )}
        <LinearGradient
          colors={["transparent", "rgba(20,14,8,0.80)"]}
          style={StyleSheet.absoluteFillObject}
        />
        <TouchableOpacity
          style={[s.qHeaderBack, { top: insets.top + 10 }]}
          onPress={() => navigation?.goBack?.()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 24 }}
        >
          <CaretLeft size={18} color="#FFFFFF" weight="bold" />
        </TouchableOpacity>
        <View style={s.qHeaderBottom}>
          <Text style={s.qHeaderTitle}>{topic.title}</Text>
          {/* Decorative carets are visual bookends only — no onPress */}
          <View style={s.qHeaderCountRow}>
            <CaretLeft size={12} color="rgba(255,255,255,0.55)" weight="bold" />
            <Text style={s.qHeaderCount}>Question {currentIdx + 1} of {total}</Text>
            <CaretRight size={12} color="rgba(255,255,255,0.55)" weight="bold" />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.questionTxt}>{q.question}</Text>

        <View style={s.choicesWrap}>
          {q.choices.map((choice, idx) => (
            <TouchableOpacity
              key={idx}
              style={[s.choice, { borderColor: choiceBorder(idx) }]}
              onPress={() => handleSelect(idx)}
              activeOpacity={answered ? 1 : 0.85}
              disabled={answered}
            >
              <View style={choiceRadio(idx)}>
                {answered && idx === q.correct ? <View style={s.radioFillCorrect} /> : null}
                {answered && idx === selected && !isCorrect ? <View style={s.radioFillWrong} /> : null}
              </View>
              <Text style={s.choiceLabel}>{String.fromCharCode(65 + idx)}.</Text>
              <Text style={[s.choiceTxt, answered && idx !== q.correct && idx !== selected ? { opacity: 0.4 } : null]}>
                {choice}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {answered && !showFeedback ? (
          <TouchableOpacity style={s.nextBtn} onPress={() => setShowFeedback(true)} activeOpacity={0.88}>
            <Text style={s.nextBtnTxt}>Next Question</Text>
            <CaretRight size={16} color="#FFFFFF" weight="bold" />
          </TouchableOpacity>
        ) : null}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Full-screen feedback overlay — scrollable content + fixed footer button */}
      <Modal visible={showFeedback} transparent={false} animationType="fade">
        <View style={[s.feedbackFull, { backgroundColor: isCorrect ? CORRECT_BG : WRONG_BG }]}>
          <ScrollView
            contentContainerStyle={[s.feedbackScroll, { paddingTop: insets.top + 40 }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={s.feedbackIconWrap}>
              {isCorrect
                ? <CheckCircle size={80} color="#FFFFFF" weight="fill" />
                : <XCircle size={80} color="#FFFFFF" weight="fill" />
              }
            </View>
            <Text style={s.feedbackTitle}>
              {isCorrect ? "MashaAllah!" : "Not quite."}
            </Text>
            <Text style={s.feedbackSubtitle}>
              {isCorrect ? "Correct Answer" : "Keep going!"}
            </Text>

            <View style={s.feedbackCard}>
              {!isCorrect ? (
                <View style={s.feedbackCorrectRow}>
                  <Text style={s.feedbackCorrectLabel}>The correct answer is:</Text>
                  <Text style={s.feedbackCorrectAnswer}>{String.fromCharCode(65 + q.correct)}. {q.choices[q.correct]}</Text>
                </View>
              ) : null}
              <Text style={s.feedbackExpl}>{q.explanation}</Text>
            </View>
          </ScrollView>

          <View style={[s.feedbackFooter, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity style={s.continueBtn} onPress={handleContinue} activeOpacity={0.88}>
              <Text style={s.continueBtnTxt}>Continue</Text>
              <CaretRight size={16} color={isCorrect ? CORRECT_BG : WRONG_BG} weight="bold" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: PAGE_BG },

  questionHeader: { overflow: "hidden", position: "relative" },
  qHeaderBack: {
    position: "absolute", left: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center", justifyContent: "center",
  },
  qHeaderBottom: { position: "absolute", bottom: 14, left: 20, right: 20 },
  qHeaderTitle: { fontSize: 22, fontWeight: "700", color: "#FFFFFF", marginBottom: 6 },
  qHeaderCountRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  qHeaderCount: { fontSize: 14, color: "rgba(255,255,255,0.85)", fontWeight: "500" },

  scroll: { paddingHorizontal: 20, paddingTop: 16 },

  questionTxt: { fontFamily: SERIF, fontSize: 22, color: TEXT, lineHeight: 30, marginBottom: 24 },

  choicesWrap: { gap: 10 },
  choice: {
    flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: CARD_BG,
    borderRadius: 14, borderWidth: 1.5, padding: 16,
  },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: BORDER, alignItems: "center", justifyContent: "center" },
  radioCorrect: { borderColor: SAGE },
  radioWrong: { borderColor: "#C24A4A" },
  radioFillCorrect: { width: 12, height: 12, borderRadius: 6, backgroundColor: SAGE },
  radioFillWrong: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#C24A4A" },
  choiceLabel: { fontSize: 15, fontWeight: "600", color: TEXT_SEC, width: 20 },
  choiceTxt: { flex: 1, fontSize: 16, color: TEXT, lineHeight: 22 },

  nextBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: SAGE, borderRadius: 12, paddingVertical: 16, marginTop: 20 },
  nextBtnTxt: { fontSize: 16, color: "#FFFFFF", fontWeight: "600" },

  feedbackFull: { flex: 1 },
  feedbackScroll: { alignItems: "center", paddingHorizontal: 28 },
  feedbackIconWrap: { marginBottom: 16 },
  feedbackTitle: { fontFamily: SERIF, fontSize: 36, color: "#FFFFFF", fontWeight: "700", textAlign: "center" },
  feedbackSubtitle: { fontSize: 20, color: "#FFFFFF", fontWeight: "600", marginBottom: 24, textAlign: "center", opacity: 0.9 },
  feedbackCard: { backgroundColor: "rgba(255,255,255,0.95)", borderRadius: 18, padding: 20, width: "100%", marginBottom: 28 },
  feedbackCorrectRow: { marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#EDE4D4" },
  feedbackCorrectLabel: { fontSize: 13, color: TEXT_MUTED, marginBottom: 4 },
  feedbackCorrectAnswer: { fontFamily: SERIF, fontSize: 17, color: TEXT, fontWeight: "600" },
  feedbackExpl: { fontSize: 15, color: TEXT_MUTED, lineHeight: 22 },
  feedbackFooter: { paddingHorizontal: 28, paddingTop: 8 },
  continueBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#FFFFFF", borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32, width: "100%" },
  continueBtnTxt: { fontSize: 16, fontWeight: "700", color: TEXT },
});
