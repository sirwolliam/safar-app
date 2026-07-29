/**
 * QuizScreen.jsx — Safar
 * Active quiz — full-bleed image header with overlapping topic title,
 * star progress row, bold-letter choices, and full-screen feedback overlays.
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
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Polygon } from "react-native-svg";
import { CaretLeft, CaretRight, CheckCircle, XCircle } from "phosphor-react-native";
import { getTopicById } from "../quizData";

// Reused from previous session — static require lookup keyed by topic id
const TOPIC_IMAGES = {
  "umrah-stages":  require("../assets/quiz/quiz-umrah.png"),
  "hajj-stages":   require("../assets/quiz/quiz-hajj.png"),
  "key-duas":      require("../assets/quiz/quiz-duas.png"),
  "sacred-places": require("../assets/quiz/quiz-places.png"),
};

// Per-topic display text — two lines using literal \n.
const TITLE_DISPLAY = {
  "umrah-stages":  "Stages of\nUmrah",
  "hajj-stages":   "Stages of\nHajj",
  "key-duas":      "Key\nDuas",
  "sacred-places": "Sacred\nPlaces",
};

// Per-topic title color. Light text for dark images (sacred-places, hajj-stages).
const TITLE_COLORS = {
  "umrah-stages":  "#4A5C48",
  "hajj-stages":   "#FDFAF4",
  "key-duas":      "#7A6B4A",
  "sacred-places": "#FDFAF4",
};

const SERIF = "SourceSerif4-Regular";

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

  const titleColor = TITLE_COLORS[topic.id] ?? TEXT;
  // Light-text topics use a dark shadow; dark-text topics use a light shadow.
  const titleShadowColor = (topic.id === "sacred-places" || topic.id === "hajj-stages")
    ? "rgba(26,20,16,0.7)"
    : "rgba(245,240,232,0.9)";

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

  return (
    <View style={s.root}>
      {/* Full-bleed image header — fixed 200px, no horizontal padding */}
      <View style={s.imgHeader}>
        {TOPIC_IMAGES[topic.id] ? (
          <Image
            source={TOPIC_IMAGES[topic.id]}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: SAGE }]} />
        )}

        {/* Back button — overlaid top-left */}
        <TouchableOpacity
          style={[s.qHeaderBack, { top: insets.top + 10 }]}
          onPress={() => navigation?.goBack?.()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 24 }}
        >
          <CaretLeft size={18} color="#FFFFFF" weight="bold" />
        </TouchableOpacity>

        {/* Question X of Y badge — overlaid top-right, carets are decorative only */}
        <View style={[s.questionBadge, { top: insets.top + 10 }]}>
          <CaretLeft size={10} color={GOLD} weight="bold" />
          <Text style={s.questionBadgeTxt}>Question {currentIdx + 1} of {total}</Text>
          <CaretRight size={10} color={GOLD} weight="bold" />
        </View>
      </View>

      {/* Topic title — negative marginTop lets it straddle the image bottom edge */}
      <Text
        style={[
          s.qTopicTitle,
          { color: titleColor, textShadowColor: titleShadowColor },
        ]}
      >
        {TITLE_DISPLAY[topic.id] ?? topic.title}
      </Text>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Star progress row — filled gold = done, outlined gold = current, muted = upcoming */}
        <View style={s.starsRow}>
          {questions.map((_, i) => (
            <Svg key={i} width={14} height={14} viewBox="0 0 18 18">
              <Polygon
                points="9,1 11.12,6.88 17,9 11.12,11.12 9,17 6.88,11.12 1,9 6.88,6.88"
                fill={i < currentIdx ? GOLD : "none"}
                stroke={i < currentIdx ? "none" : i === currentIdx ? GOLD : BORDER}
                strokeWidth={i === currentIdx ? "1.5" : "1"}
              />
            </Svg>
          ))}
        </View>

        <Text style={s.questionTxt}>{q.question}</Text>

        <View style={s.choicesWrap}>
          {q.choices.map((choice, idx) => {
            const isThisCorrect    = answered && idx === q.correct;
            const isThisWrong      = answered && idx === selected && !isCorrect;
            const isThisUnselected = answered && idx !== q.correct && idx !== selected;
            return (
              <TouchableOpacity
                key={idx}
                style={[
                  s.choice,
                  isThisCorrect ? s.choiceCorrect : null,
                  isThisWrong ? s.choiceWrong : null,
                ]}
                onPress={() => handleSelect(idx)}
                activeOpacity={answered ? 1 : 0.85}
                disabled={answered}
              >
                <View style={s.choiceLead}>
                  {isThisCorrect
                    ? <CheckCircle size={24} color="#2D6B35" weight="fill" />
                    : isThisWrong
                    ? <XCircle size={24} color="#A63828" weight="fill" />
                    : <Text style={[s.choiceLabel, isThisUnselected ? { opacity: 0.4 } : null]}>
                        {String.fromCharCode(65 + idx)}
                      </Text>
                  }
                </View>
                <Text style={[s.choiceTxt, isThisUnselected ? { opacity: 0.4 } : null]}>
                  {choice}
                </Text>
              </TouchableOpacity>
            );
          })}
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

  imgHeader: { height: 250, overflow: "hidden", position: "relative" },
  qHeaderBack: {
    position: "absolute", left: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center", justifyContent: "center",
  },
  questionBadge: {
    position: "absolute", right: 16,
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6,
  },
  questionBadgeTxt: { fontSize: 12, color: "#FFFFFF", fontWeight: "600" },

  qTopicTitle: {
    fontFamily: SERIF, fontSize: 34, fontWeight: "700", lineHeight: 36,
    marginTop: -94, paddingHorizontal: 20, paddingBottom: 8,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  scroll: { paddingHorizontal: 20, paddingTop: 34 },

  starsRow: {
    flexDirection: "row", flexWrap: "wrap", justifyContent: "center",
    gap: 8, marginTop: 6, marginBottom: 16,
  },

  questionTxt: { fontFamily: SERIF, fontSize: 22, color: TEXT, lineHeight: 30, marginBottom: 24 },

  choicesWrap: { gap: 10 },
  choice: {
    flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: CARD_BG,
    borderRadius: 14, borderWidth: 1.5, borderColor: BORDER, padding: 16,
  },
  choiceCorrect: { backgroundColor: "#E8F0E6" },
  choiceWrong:   { backgroundColor: "#F5E0DC" },
  choiceLead:    { width: 28, alignItems: "center" },
  choiceLabel:   { fontFamily: SERIF, fontSize: 22, fontWeight: "700", color: TEXT },
  choiceTxt:     { flex: 1, fontSize: 16, color: TEXT, lineHeight: 22 },

  nextBtn:    { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: SAGE, borderRadius: 12, paddingVertical: 16, marginTop: 20 },
  nextBtnTxt: { fontSize: 16, color: "#FFFFFF", fontWeight: "600" },

  feedbackFull:          { flex: 1 },
  feedbackScroll:        { alignItems: "center", paddingHorizontal: 28 },
  feedbackIconWrap:      { marginBottom: 16 },
  feedbackTitle:         { fontFamily: SERIF, fontSize: 38, color: "#FFFFFF", fontWeight: "700", textAlign: "center" },
  feedbackSubtitle:      { fontSize: 22, color: "#FFFFFF", fontWeight: "600", marginBottom: 24, textAlign: "center", opacity: 0.9 },
  feedbackCard:          { backgroundColor: "rgba(255,255,255,0.95)", borderRadius: 18, padding: 20, width: "100%", marginBottom: 28 },
  feedbackCorrectRow:    { marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#EDE4D4" },
  feedbackCorrectLabel:  { fontSize: 15, color: TEXT_MUTED, marginBottom: 4 },
  feedbackCorrectAnswer: { fontFamily: SERIF, fontSize: 19, color: TEXT, fontWeight: "600" },
  feedbackExpl:          { fontSize: 17, color: TEXT_MUTED, lineHeight: 22 },
  feedbackFooter:        { paddingHorizontal: 28, paddingTop: 8 },
  continueBtn:           { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#FFFFFF", borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32, width: "100%" },
  continueBtnTxt:        { fontSize: 16, fontWeight: "700", color: TEXT },
});
