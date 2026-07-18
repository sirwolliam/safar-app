import React from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PillarList from "../PillarList";

const SERIF = "SourceSerif4-Regular";

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

        <PillarList showFooterNote />
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

  footer:       { paddingHorizontal: 24, paddingBottom: 24, paddingTop: 12 },
  startBtn:     { backgroundColor: "#4A5C48", borderRadius: 16, height: 56, alignItems: "center", justifyContent: "center" },
  startBtnText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
});
