import React from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Books, Heartbeat, ClipboardText, UsersThree } from "phosphor-react-native";

const SERIF = "SourceSerif4-Regular";

const PILLARS = [
  {
    id:      "learn",
    name:    "Learn",
    desc:    "Understand the rites before you go — step by step, at your pace.",
    bg:      "#1C2B1E",
    badgeBg: "#2F5D50",
    Icon:    Books,
  },
  {
    id:      "practice",
    name:    "Practice",
    desc:    "Rehearse the rites and keep your remembrance — calm and guided.",
    bg:      "#2A1F0E",
    badgeBg: "#5D4A20",
    Icon:    Heartbeat,
  },
  {
    id:      "plan",
    name:    "Plan",
    desc:    "Get everything ready — documents, packing, contacts, money.",
    bg:      "#1A202E",
    badgeBg: "#203050",
    Icon:    ClipboardText,
  },
  {
    id:      "connect",
    name:    "Connect",
    desc:    "Stay close to your group and share the journey with those you love.",
    bg:      "#221820",
    badgeBg: "#3D2040",
    Icon:    UsersThree,
  },
];

export default function PillarIntroScreen({ navigation, route }) {
  const userName = route?.params?.userName ?? "";

  const handleStart = async () => {
    await AsyncStorage.setItem("safar_pillar_intro_seen_v1", "true");
    navigation.replace("MainTabs");
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.greeting}>
          {userName
            ? "You’re all set,\n" + userName + "."
            : "You’re all set."}
        </Text>
        <Text style={s.sub}>{"Here’s a quick look at how Safar is organized."}</Text>

        <View style={s.pillars}>
          {PILLARS.map((pillar) => (
            <View
              key={pillar.id}
              style={[s.pillarRow, { backgroundColor: pillar.bg }]}
            >
              <View style={[s.iconBadge, { backgroundColor: pillar.badgeBg }]}>
                <pillar.Icon size={22} color="#C8A96A" weight="regular" />
              </View>
              <View style={s.pillarText}>
                <Text style={s.pillarName}>{pillar.name}</Text>
                <Text style={s.pillarDesc}>{pillar.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={s.note}>
          {"Duas live at the center of every tab — always one tap away."}
        </Text>
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity style={s.startBtn} onPress={handleStart} activeOpacity={0.88}>
          <Text style={s.startBtnText}>{"Start exploring"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: "#F5F0E8" },
  scroll:       { flex: 1 },
  scrollContent:{ paddingHorizontal: 24, paddingTop: 52, paddingBottom: 24 },

  greeting:     { fontFamily: SERIF, fontSize: 34, color: "#1A1712", lineHeight: 44, marginBottom: 10 },
  sub:          { fontSize: 15, color: "#5C534A", lineHeight: 23, marginBottom: 28 },

  pillars:      { gap: 10, marginBottom: 28 },
  pillarRow:    { flexDirection: "row", alignItems: "center", borderRadius: 16, paddingHorizontal: 20, paddingVertical: 18 },
  iconBadge:    { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", marginRight: 16, flexShrink: 0 },
  pillarText:   { flex: 1 },
  pillarName:   { fontFamily: SERIF, fontSize: 17, color: "#FFFFFF", marginBottom: 4 },
  pillarDesc:   { fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 18 },

  note:         { fontSize: 13, color: "#5C534A", lineHeight: 20, textAlign: "center", paddingHorizontal: 8 },

  footer:       { paddingHorizontal: 24, paddingBottom: 24, paddingTop: 12 },
  startBtn:     { backgroundColor: "#4A5C48", borderRadius: 16, height: 56, alignItems: "center", justifyContent: "center" },
  startBtnText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
});
