/**
 * QuizHubScreen.jsx — Safar
 * Topic picker for the Practice quiz. Ornate header, card per topic
 * showing title, description, question count, and best score if attempted.
 *
 * Topics with empty question arrays show "Coming soon" and are not tappable.
 *
 * Coding rules: StyleSheet.create at module level, literal hex only.
 */
import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { CaretLeft, CaretRight, Mosque, MapPin, HandHeart, CheckCircle } from "phosphor-react-native";
import HeaderPatternBg from "../HeaderPatternBg";
import { QUIZ_TOPICS } from "../quizData";
import { getAllProgress } from "../quizStore";

const SERIF = "SourceSerif4-Regular";
const { width: SW } = Dimensions.get("window");

const PAGE_BG    = "#F5F0E8";
const CARD_BG    = "#FDFAF4";
const TEXT       = "#1A1410";
const TEXT_SEC   = "#8A7D6A";
const TEXT_MUTED = "#5C534A";
const BORDER     = "#DDD5C0";
const SAGE       = "#4A5C48";
const GOLD       = "#C8A96A";

const ICONS = { Mosque, MapPin, HandHeart };

export default function QuizHubScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [progressMap, setProgressMap] = useState({});

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getAllProgress().then(p => { if (active) setProgressMap(p); });
      return () => { active = false; };
    }, [])
  );

  return (
    <View style={s.root}>
      <View style={s.header}>
        <HeaderPatternBg width={SW} />
        <View style={[s.headerTopRow, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => {
              const returnToTab = route?.params?.returnToTab;
              if (returnToTab) navigation?.getParent?.()?.navigate?.(returnToTab);
              else navigation?.goBack?.();
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 24 }}
            activeOpacity={0.8}
          >
            <CaretLeft size={18} color="#1A1712" weight="bold" />
          </TouchableOpacity>
        </View>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Quiz</Text>
          <Text style={s.headerSub}>Test your knowledge before your journey</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {QUIZ_TOPICS.map(topic => {
          const progress = progressMap[topic.id];
          const available = topic.questions.length > 0;
          const Icon = ICONS[topic.icon] ?? Mosque;
          return (
            <TouchableOpacity
              key={topic.id}
              style={available ? s.card : [s.card, s.cardDisabled]}
              activeOpacity={available ? 0.85 : 1}
              onPress={() => {
                if (available) navigation?.navigate?.("Quiz", { topicId: topic.id });
              }}
            >
              <View style={s.cardIcon}>
                <Icon size={22} color={available ? GOLD : BORDER} weight="regular" />
              </View>
              <View style={s.cardInfo}>
                <Text style={s.cardTitle}>{topic.title}</Text>
                <Text style={s.cardDesc}>{topic.description}</Text>
                {available ? (
                  <Text style={s.cardMeta}>
                    {topic.questions.length} question{topic.questions.length === 1 ? "" : "s"}
                    {progress ? `  ·  Best: ${progress.bestScore}/${progress.bestTotal}` : ""}
                  </Text>
                ) : (
                  <Text style={s.cardComing}>Coming soon</Text>
                )}
              </View>
              {available ? (
                progress ? (
                  <CheckCircle size={20} color={SAGE} weight="fill" />
                ) : (
                  <CaretRight size={18} color={BORDER} weight="bold" />
                )
              ) : null}
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: PAGE_BG },

  header:       { backgroundColor: SAGE, minHeight: 150, position: "relative", overflow: "hidden", paddingHorizontal: 20, paddingBottom: 16 },
  headerTopRow: { flexDirection: "row", alignItems: "center" },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: CARD_BG, borderWidth: 1, borderColor: "#D4D0CA", alignItems: "center", justifyContent: "center" },
  headerCenter: { alignItems: "center", marginTop: 14 },
  headerTitle:  { fontFamily: SERIF, fontSize: 34, color: CARD_BG, textAlign: "center" },
  headerSub:    { fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 2, textAlign: "center" },

  scroll: { paddingHorizontal: 16, paddingTop: 16 },

  card: {
    flexDirection: "row", alignItems: "center", backgroundColor: CARD_BG, borderRadius: 16,
    borderWidth: 1, borderColor: BORDER, padding: 16, marginBottom: 10,
    shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  cardDisabled: { opacity: 0.5 },
  cardIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#4A5C4814", alignItems: "center", justifyContent: "center", marginRight: 14 },
  cardInfo: { flex: 1, marginRight: 8 },
  cardTitle: { fontSize: 17, fontWeight: "700", color: TEXT, marginBottom: 3 },
  cardDesc: { fontSize: 13, color: TEXT_MUTED, marginBottom: 4, lineHeight: 18 },
  cardMeta: { fontSize: 12, color: TEXT_SEC },
  cardComing: { fontSize: 12, color: TEXT_SEC, fontStyle: "italic" },
});
