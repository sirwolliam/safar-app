/**
 * QuizHubScreen.jsx — Safar
 * Quiz topic picker — full-bleed header image, colorful topic cards.
 *
 * Coding rules: StyleSheet.create at module level, literal hex only.
 */
import React, { useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import {
  CaretLeft, CaretRight, Mosque, MapPin, HandHeart, Sparkle,
  CheckCircle,
} from "phosphor-react-native";
import { QUIZ_TOPICS } from "../quizData";
import { getAllProgress } from "../quizStore";

const SERIF = "SourceSerif4-Regular";

const PAGE_BG    = "#F5F0E8";
const TEXT       = "#1A1410";
const TEXT_MUTED = "#5C534A";
const SAGE       = "#4A5C48";
const GOLD       = "#C8A96A";

const TOPIC_COLORS = {
  "umrah-stages":  { bg: "#4A5C48", text: "#FFFFFF" },
  "hajj-stages":   { bg: "#584260", text: "#FFFFFF" },
  "key-duas":      { bg: "#7A6B4A", text: "#FFFFFF" },
  "sacred-places": { bg: "#4A6B7A", text: "#FFFFFF" },
};

const ICONS = { Mosque, MapPin, HandHeart, Sparkle };

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
      {/* Full-bleed header — sits outside ScrollView so it bleeds edge to edge */}
      <View style={[s.heroBanner, { height: 250 }]}>
        <Image
          source={require("../assets/quiz/quiz-hub-header.png")}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={[s.heroBannerBack, { top: insets.top + 10 }]}
          onPress={() => {
            const returnToTab = route?.params?.returnToTab;
            if (returnToTab) navigation?.getParent?.()?.navigate?.(returnToTab);
            else navigation?.goBack?.();
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 24 }}
          activeOpacity={0.8}
        >
          <CaretLeft size={20} color="#FFFFFF" weight="bold" />
        </TouchableOpacity>
      </View>

      <Text style={s.hubTitle}>Hajj and Umrah Quiz</Text>
      <Text style={s.hubSub}>Test your knowledge before your journey</Text>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {QUIZ_TOPICS.map(topic => {
          const progress = progressMap[topic.id];
          const available = topic.questions.length > 0;
          const colors = TOPIC_COLORS[topic.id] ?? { bg: SAGE, text: "#FFFFFF" };
          const Icon = ICONS[topic.icon] ?? Mosque;
          return (
            <TouchableOpacity
              key={topic.id}
              style={[s.topicCard, { backgroundColor: colors.bg }, available ? null : s.topicCardDisabled]}
              activeOpacity={available ? 0.88 : 1}
              onPress={() => { if (available) navigation?.navigate?.("Quiz", { topicId: topic.id }); }}
            >
              <View style={s.topicIconWrap}>
                <Icon size={52} color={colors.text} weight="thin" style={{ opacity: 0.2 }} />
              </View>
              <View style={s.topicInfo}>
                <Text style={[s.topicTitle, { color: colors.text }]}>{topic.title}</Text>
                <Text style={[s.topicDesc, { color: colors.text + "CC" }]}>
                  {available ? topic.description : "Coming soon"}
                </Text>
                {progress ? (
                  <View style={s.topicBadge}>
                    <CheckCircle size={12} color={GOLD} weight="fill" />
                    <Text style={s.topicBadgeTxt}>Best: {progress.bestScore}/{progress.bestTotal}</Text>
                  </View>
                ) : null}
              </View>
              {available ? <CaretRight size={20} color={colors.text + "88"} weight="bold" /> : null}
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

  heroBanner: { overflow: "hidden", position: "relative", backgroundColor: "#F0E4C8" },
  heroBannerBack: {
    position: "absolute", left: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center", justifyContent: "center",
  },

  hubTitle: { fontFamily: SERIF, fontSize: 32, fontWeight: "700", color: TEXT, textAlign: "center", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  hubSub: { fontSize: 15, color: TEXT_MUTED, textAlign: "center", marginTop: 5, paddingHorizontal: 20 },

  scroll: { paddingHorizontal: 20, paddingTop: 20 },

  topicCard: {
    flexDirection: "row", alignItems: "center", borderRadius: 18, padding: 16,
    marginBottom: 12, overflow: "hidden", position: "relative", minHeight: 80,
    shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 4,
  },
  topicCardDisabled: { opacity: 0.45 },
  topicIconWrap: { position: "absolute", right: 16, top: 12 },
  topicInfo: { flex: 1, marginRight: 24 },
  topicTitle: { fontFamily: SERIF, fontSize: 19, fontWeight: "700", marginBottom: 4 },
  topicDesc: { fontSize: 13, lineHeight: 18 },
  topicBadge: {
    flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8,
    backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start",
  },
  topicBadgeTxt: { fontSize: 11, color: "#FFFFFF", fontWeight: "600" },
});
