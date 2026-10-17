import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight } from "phosphor-react-native";
import { LESSONS } from "../content/lessons";
import { sharedCardStyles } from "./sharedCardStyles";

const LESSON_CARD_IMAGES = {
  "hajj-03": require("../assets/lesson_cards/hajj_3.png"),
};

const SERIF = "SourceSerif4-Regular";
const SW = Dimensions.get("window").width;
const CARD_W = SW - 16;
const CARD_H = Math.round(CARD_W / 2.33); // matches image aspect exactly

export default function HomeDailyLessonCard({ navigation }) {
  const lessonIds = Object.keys(LESSONS).sort();
  if (lessonIds.length === 0) return null;

  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now - startOfYear) / 86400000) + 1;
  const index = (dayOfYear - 1) % lessonIds.length;
  const todayLessonId = lessonIds[index];
  const todayLesson = LESSONS[todayLessonId];
  if (!todayLesson) return null;

  const [guidePrefix, numStr] = todayLessonId.split("-");
  const lessonNum = parseInt(numStr, 10);
  const lessonTotal = Object.keys(LESSONS).filter((k) => k.startsWith(guidePrefix + "-")).length;

  const coverBlock = todayLesson.blocks[0];
  const lessonImage =
    LESSON_CARD_IMAGES[todayLessonId] ||
    coverBlock?.image ||
    require("../assets/continue.jpg");

  return (
    <TouchableOpacity
      style={s.card}
      activeOpacity={0.9}
      onPress={() => navigation?.getParent?.()?.navigate?.("Learn", { screen: "LessonFlow", initial: false, params: { lessonId: todayLessonId, returnToTab: "Home" } })}
    >
      <Image source={lessonImage} style={s.image} />

      <LinearGradient
        colors={["transparent", "transparent", "rgba(0,0,0,0.55)", "rgba(0,0,0,0.85)"]}
        locations={[0, 0.4, 0.8, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={s.pill}>
        <Text style={s.pillText}>{`Lesson ${lessonNum} of ${lessonTotal}`}</Text>
      </View>

      <View style={s.bottom}>
        <Text style={s.eyebrow}>TODAY'S LESSON</Text>
        <Text style={s.headline} numberOfLines={2}>{todayLesson.title}</Text>
        <View style={s.ctaRow}>
          <Text style={s.ctaText}>Learn more</Text>
          <ArrowRight size={14} color="#FFFFFF" weight="regular" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    width: CARD_W,
    height: CARD_H,
    marginHorizontal: 8,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#1A1410",
    position: "relative",
  },
  image: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, width: "100%", height: "100%", resizeMode: "cover" },
  pill: {
    position: "absolute", top: 12, right: 12,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  pillText: { color: "#FDFAF4", fontSize: 11, fontWeight: "600", letterSpacing: 0.3 },
  bottom: { position: "absolute", left: 16, right: 16, bottom: 14 },
  eyebrow: { color: "rgba(255,255,255,0.85)", fontSize: 10, fontWeight: "700", letterSpacing: 1.2, marginBottom: 4 },
  headline: { fontFamily: SERIF, fontSize: 20, color: "#FFFFFF", lineHeight: 24 },
  ctaRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  ctaText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600", fontFamily: SERIF, marginRight: 6 },
});
