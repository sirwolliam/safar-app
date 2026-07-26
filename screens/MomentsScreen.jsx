/**
 * MomentsScreen.jsx — Safar
 * Moments hub — pick a photo postcard or prayer card template to start
 * creating, browse ones you've already made.
 *
 * Coding rules: StyleSheet.create at module level, literal hex only.
 * No && in style arrays — ternaries only.
 */
import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { CaretLeft, ImageSquare } from "phosphor-react-native";
import HeaderPatternBg from "../HeaderPatternBg";
import PostcardTemplate from "../PostcardTemplate";
import { PHOTO_TEMPLATES, PRAYER_TEMPLATES, getMoments } from "../momentsStore";

const SERIF = "SourceSerif4-Regular";
const { width: SW } = Dimensions.get("window");

const PAGE_BG  = "#F5F0E8";
const CARD_BG  = "#FDFAF4";
const TEXT     = "#1A1410";
const TEXT_SEC = "#8A7D6A";
const TEXT_MUTED = "#5C534A";
const BORDER   = "#DDD5C0";
const SAGE     = "#4A5C48";

const THUMB_W = (SW - 20 * 2 - 14) / 2;

export default function MomentsScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState("photo"); // "photo" | "prayer"
  const [savedMoments, setSavedMoments] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getMoments().then(m => { if (active) setSavedMoments(m); });
      return () => { active = false; };
    }, [])
  );

  const templates = tab === "photo" ? PHOTO_TEMPLATES : PRAYER_TEMPLATES;

  return (
    <View style={s.root}>
      <View style={s.header}>
        <HeaderPatternBg width={SW} />
        <View style={[s.headerTopRow, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity style={s.backBtn} onPress={() => { const returnToTab = route?.params?.returnToTab; if (returnToTab) { navigation?.getParent?.()?.navigate?.(returnToTab); } else { navigation?.goBack?.(); } }} activeOpacity={0.8}>
            <CaretLeft size={18} color="#1A1712" weight="bold" />
          </TouchableOpacity>
        </View>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Moments</Text>
          <Text style={s.headerSub}>Share beautiful moments with loved ones</Text>
        </View>
      </View>

      <View style={s.tabRow}>
        <TouchableOpacity style={tab === "photo" ? [s.tab, s.tabActive] : s.tab} onPress={() => setTab("photo")} activeOpacity={0.85}>
          <Text style={tab === "photo" ? [s.tabTxt, s.tabTxtActive] : s.tabTxt}>Photo Cards</Text>
        </TouchableOpacity>
        <TouchableOpacity style={tab === "prayer" ? [s.tab, s.tabActive] : s.tab} onPress={() => setTab("prayer")} activeOpacity={0.85}>
          <Text style={tab === "prayer" ? [s.tabTxt, s.tabTxtActive] : s.tabTxt}>Prayer Cards</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.grid}>
          {templates.map(t => (
            <TouchableOpacity
              key={t.id}
              style={s.gridItem}
              activeOpacity={0.85}
              onPress={() => navigation?.navigate?.("MomentCreator", { templateId: t.id })}
            >
              <PostcardTemplate template={t} width={THUMB_W} />
              <Text style={s.gridLabel}>{t.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {savedMoments.length > 0 ? (
          <View style={s.savedSection}>
            <Text style={s.sectionLabel}>MY POSTCARDS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {savedMoments.map((m, index) => {
                const t = [...PHOTO_TEMPLATES, ...PRAYER_TEMPLATES].find(x => x.id === m.templateId);
                if (!t) return null;
                return (
                  <TouchableOpacity
                    key={m.id || index}
                    activeOpacity={0.85}
                    onPress={() => navigation?.navigate?.("MomentCreator", { templateId: t.id, savedMomentId: m.id })}
                  >
                    <PostcardTemplate template={t} photoUri={m.photoUri} eyebrow={m.eyebrow} message={m.message} dateLabel={m.dateLabel} width={130} />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : (
          <View style={s.emptySaved}>
            <ImageSquare size={28} color={BORDER} weight="thin" />
            <Text style={s.emptySavedTxt}>Postcards you create will be saved here.</Text>
          </View>
        )}

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

  tabRow:  { flexDirection: "row", gap: 8, backgroundColor: PAGE_BG, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  tab:     { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 20, backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER },
  tabActive: { backgroundColor: SAGE, borderColor: SAGE },
  tabTxt:  { fontSize: 14, fontWeight: "600", color: TEXT_MUTED },
  tabTxtActive: { color: "#FFFFFF" },

  scroll: { paddingHorizontal: 20, paddingTop: 12 },
  grid:   { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  gridItem: { marginBottom: 4 },
  gridLabel: { fontSize: 13, fontWeight: "600", color: TEXT, marginTop: 8, textAlign: "center" },

  savedSection: { marginTop: 28 },
  sectionLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1.5, color: TEXT_SEC, marginBottom: 12 },

  emptySaved: { alignItems: "center", paddingVertical: 28, marginTop: 20, gap: 8 },
  emptySavedTxt: { fontSize: 13, color: TEXT_MUTED, textAlign: "center" },
});
