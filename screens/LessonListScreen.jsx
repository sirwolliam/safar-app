import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { CaretLeft, CaretRight, Check } from "phosphor-react-native";
import { LESSONS } from "../content/lessons";
import { getAllLessonProgress } from "../lessonProgressStore";
import HeaderPatternBg from "../HeaderPatternBg";

const SERIF = "SourceSerif4-Regular";
const GOLD = "#BF9F60";

const GUIDE_META = {
  umrah: { title: "Umrah Guide", totalLessons: 10 },
  hajj:  { title: "Hajj Guide",  totalLessons: 16 },
};

export default function LessonListScreen({ navigation, route }) {
  const SW = Dimensions.get("window").width;
  const insets = useSafeAreaInsets();
  const guide = route?.params?.guide || "umrah";
  const meta = GUIDE_META[guide] || GUIDE_META.umrah;

  const [progress, setProgress] = useState({});

  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;
      const load = async () => {
        const result = await getAllLessonProgress();
        if (!cancelled) setProgress(result);
      };
      load();
      return () => { cancelled = true; };
    }, [])
  );

  const rows = [];
  for (let n = 1; n <= meta.totalLessons; n++) {
    const num = String(n).padStart(2, "0");
    const lessonId = guide + "-" + num;
    const lesson = LESSONS[lessonId];
    rows.push({ n, lessonId, lesson });
  }

  return (
    <View style={s.safe}>
      <View style={s.header}>
        <HeaderPatternBg width={SW} />
        <View style={[s.headerTopRow, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.8}>
            <CaretLeft size={20} color="#1A1712" weight="bold" />
          </TouchableOpacity>
        </View>
        <Text style={s.headerTitle}>{meta.title}</Text>
        <Text style={s.headerSubhead}>{meta.totalLessons} lessons to help you prepare with understanding and confidence.</Text>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {rows.map(({ n, lessonId, lesson }, idx) => {
          const isLastRow = idx === rows.length - 1;
          if (!lesson) {
            return (
              <React.Fragment key={lessonId}>
                <View style={[s.card, s.cardLocked]}>
                <View style={[s.numberBadge, s.numberBadgeLocked]}>
                  <Text style={s.numberBadgeTextLocked}>{n}</Text>
                </View>
                <View style={s.rowInfo}>
                  <Text style={s.rowLabelLocked}>{"Lesson " + n}</Text>
                  <Text style={s.progressTextLocked}>Coming soon</Text>
                </View>
              </View>
              {!isLastRow ? <View style={s.connector} /> : null}
              </React.Fragment>
            );
          }

          const prog = progress[lessonId];
          const total = lesson.blocks.length;
          const isCompleted = prog && prog.furthestIndex >= total - 1;
          const isStarted = prog && !isCompleted;
          const pct = prog ? Math.min(100, Math.round(((prog.furthestIndex + 1) / total) * 100)) : 0;

          return (
            <React.Fragment key={lessonId}>
            <TouchableOpacity
              style={s.card}
              onPress={() => navigation.navigate("LessonFlow", { lessonId })}
              activeOpacity={0.75}
            >
              <View style={s.numberBadge}>
                {isCompleted ? (
                  <Check size={18} color="#FFFFFF" weight="bold" />
                ) : (
                  <Text style={s.numberBadgeText}>{n}</Text>
                )}
              </View>
              <View style={s.rowInfo}>
                <Text style={s.rowLabel}>{lesson.title}</Text>
                <Text style={isCompleted ? [s.progressText, s.progressDone] : isStarted ? [s.progressText, s.progressActive] : s.progressText}>
                  {isCompleted ? "Completed" : isStarted ? (prog.furthestIndex + 1) + " of " + total + " screens" : (lesson.blocks[0]?.readingMinutes || 4) + " min read"}
                </Text>
                {isStarted ? (
                  <View style={s.progWrap}>
                    <View style={s.progTrack}>
                      <View style={[s.progFill, { width: pct + "%" }]} />
                    </View>
                  </View>
                ) : null}
              </View>
              <CaretRight size={18} color="#C8BFB2" weight="bold" />
            </TouchableOpacity>
            {!isLastRow ? <View style={s.connector} /> : null}
            </React.Fragment>
          );
        })}
        <View style={s.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: "#F5F0E8" },
  header:       { backgroundColor: "#F5F0E8", minHeight: 170, position: "relative", overflow: "hidden", paddingHorizontal: 16, paddingBottom: 20 },
  headerTopRow: { flexDirection: "row", alignItems: "center" },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: "#FDFAF4", borderWidth: 1, borderColor: "#D4D0CA", alignItems: "center", justifyContent: "center" },
  headerTitle:  { fontFamily: SERIF, fontSize: 34, color: "#1A1410", textAlign: "center", marginTop: 16 },
  headerSubhead:{ fontSize: 15, color: "#5C534A", textAlign: "center", marginTop: 6, paddingHorizontal: 24, lineHeight: 20 },
  scroll:       { flex: 1 },
  scrollContent:{ paddingTop: 12, paddingBottom: 24 },

  card:         { flexDirection: "row", alignItems: "center", backgroundColor: "#FDFAF4", borderRadius: 16, borderWidth: 1, borderColor: "#DDD5C0", padding: 16, marginHorizontal: 16, marginBottom: 4, shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  connector:    { width: 2, height: 14, backgroundColor: GOLD, opacity: 0.4, marginLeft: 51, marginBottom: 4 },
  cardLocked:   { opacity: 0.5 },
  numberBadge:      { width: 40, height: 40, borderRadius: 20, backgroundColor: GOLD, alignItems: "center", justifyContent: "center", marginRight: 14, flexShrink: 0 },
  numberBadgeLocked:{ backgroundColor: "#DDD5C0" },
  numberBadgeText:      { fontFamily: SERIF, fontSize: 16, color: "#FFFFFF", fontWeight: "600" },
  numberBadgeTextLocked:{ fontFamily: SERIF, fontSize: 16, color: "#8A7D6A", fontWeight: "600" },
  rowInfo:      { flex: 1 },
  rowLabel:     { fontFamily: SERIF, fontSize: 20, color: "#1A1410", marginBottom: 4, fontWeight: "700" },
  rowLabelLocked:{ fontSize: 16, color: "#8A7D6A", marginBottom: 4, fontWeight: "500" },
  progressText: { fontSize: 13, color: "#5C534A", fontWeight: "300" },
  progressTextLocked:{ fontSize: 13, color: "#A79E90" },
  progressDone: { color: "#4A5C48", fontWeight: "600" },
  progressActive:{ color: GOLD, fontWeight: "600" },
  progWrap:     { marginTop: 8 },
  progTrack:    { height: 3, backgroundColor: "#EDE4D4", borderRadius: 2, overflow: "hidden" },
  progFill:     { height: "100%", backgroundColor: GOLD, borderRadius: 2 },
  bottomSpacer: { height: 20 },
});
