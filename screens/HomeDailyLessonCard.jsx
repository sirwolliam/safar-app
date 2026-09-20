import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight } from "phosphor-react-native";
import { LESSONS } from "../content/lessons";
import { sharedCardStyles } from "./sharedCardStyles";

const SERIF = "SourceSerif4-Regular";
const SW = Dimensions.get("window").width;
const CARD_W = SW - 16;
const CARD_H = 200;

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
  const guideName = guidePrefix === "hajj" ? "Hajj" : "Umrah";
  const lessonNum = parseInt(numStr, 10);
  const lessonTotal = Object.keys(LESSONS).filter((k) => k.startsWith(guidePrefix + "-")).length;

  const coverBlock = todayLesson.blocks[0];
  const lessonImage = coverBlock?.image || require("../assets/continue.jpg");
  const lessonSubtitle = coverBlock?.subtitle || "";

  return (
    <TouchableOpacity
      style={s.card}
      activeOpacity={0.9}
      onPress={() => navigation?.getParent?.()?.navigate?.("Learn", { screen: "LessonFlow", initial: false, params: { lessonId: todayLessonId, returnToTab: "Home" } })}
    >
      <Image
        source={lessonImage}
        style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: Math.round(CARD_W * 0.55), resizeMode: "cover" }}
      />

      <LinearGradient
        colors={["#F9F4E8", "#F9F4E8", "rgba(249,244,232,0.7)", "transparent"]}
        locations={[0, 0.35, 0.6, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={s.textCol}>
        <Text style={sharedCardStyles.eyebrowText}>TODAY'S LESSON</Text>
        <Text style={s.headline} numberOfLines={1}>{todayLesson.title}</Text>
        {lessonSubtitle ? (
          <Text style={s.subhead} numberOfLines={3}>{lessonSubtitle}</Text>
        ) : null}
      </View>

      <View style={s.lessonPill}>
        <Text style={{ color: "#FDFAF4", fontSize: 12, fontWeight: "500" }}>{`Lesson ${lessonNum} of ${lessonTotal}`}</Text>
      </View>

      <View style={s.cta}>
        <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "600", fontFamily: SERIF, marginRight: 8 }}>Learn more</Text>
        <ArrowRight size={16} color="#FFFFFF" weight="regular" />
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
    backgroundColor: "#F9F4E8",
    borderWidth: 1,
    borderColor: "rgba(200, 191, 178, 0.5)",
    position: "relative",
  },
  textCol: {
    position: "absolute",
    top: 18,
    left: 18,
    right: 100,
  },
  headline: {
    fontFamily: SERIF,
    fontSize: 24,
    color: "#1A1410",
    marginTop: 6,
    lineHeight: 30,
  },
  subhead: {
    fontSize: 13,
    color: "#5C534A",
    marginTop: 8,
    lineHeight: 18,
  },
  lessonPill: {
    position: "absolute",
    top: 14,
    right: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(58, 47, 30, 0.75)",
  },
  cta: {
    position: "absolute",
    bottom: 18,
    left: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 30,
    backgroundColor: "#2D4A34",
  },
});
