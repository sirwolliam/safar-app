/**
 * ToolsScreen.jsx — Safar
 * Hub-style landing for tools and counters.
 */
import React from "react";
import {
  View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LinearGradient } from "expo-linear-gradient";
import {
  Wrench, Heartbeat, Clock, Compass, CurrencyDollar,
  ArrowsClockwise, PersonSimpleWalk, PlayCircle,
  NotePencil, BookmarkSimple, CaretRight, CalendarBlank,
} from "phosphor-react-native";

const SERIF = "SourceSerif4-Regular";

const TOOLS = [
  { id: "dhikr",     label: "Dhikr Counter",           sub: "Count your remembrance",                      Icon: Heartbeat,        screen: "Dhikr"            },
  { id: "calendar",  label: "Calendar",                sub: "Your pilgrimage dates and reminders",          Icon: CalendarBlank,    screen: "Calendar"         },
  { id: "prayer",    label: "Prayer Times",             sub: "Today’s schedule and the next prayer",   Icon: Clock,            screen: "PrayerTimes"      },
  { id: "qibla",     label: "Qibla",                   sub: "Find the direction of the Kaʿbah",        Icon: Compass,          screen: "Qibla"            },
  { id: "currency",  label: "Currency",                 sub: "Live exchange rates for your trip",           Icon: CurrencyDollar,   screen: "CurrencyConverter"},
  { id: "tawaf",     label: "Ṭawāf Counter",  sub: "Track your seven circuits",                   Icon: ArrowsClockwise,  screen: "Tawaf"            },
  { id: "saiy",      label: "Saʿy Tracker",        sub: "Ṣafā to Marwah, seven times",       Icon: PersonSimpleWalk, screen: "Saiy"             },
  { id: "practice",  label: "Audio Practice",           sub: "Listen and rehearse before you go",           Icon: PlayCircle,       screen: "PracticeLearn"    },
  { id: "notes",     label: "Notes",                   sub: "Reflections and intentions",                  Icon: NotePencil,       screen: "Notes"            },
  { id: "bookmarks", label: "Bookmarks",               sub: "Your saved content",                          Icon: BookmarkSimple,   screen: "Bookmarks"        },
];

export default function ToolsScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />

      <View style={s.header}>
        <Image
          source={require("../assets/hub-headers/tools-header.png")}
          style={s.headerImg}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.10)", "rgba(30,28,20,0.72)", "rgba(30,28,20,0.96)"]}
          locations={[0, 0.35, 0.75, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={s.gradient}
        />
        <View style={[s.headerContent, { paddingTop: insets.top + 16 }]}>
          <View style={s.titleRow}>
            <View style={s.iconCircle}>
              <Wrench size={22} color="#C8A96A" weight="regular" />
            </View>
            <Text style={s.title}>Tools</Text>
          </View>
          <Text style={s.subtitle}>Everything you need, always at hand.</Text>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
          {TOOLS.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={s.row}
              activeOpacity={0.75}
              onPress={() => {
                if (tool.screen === "Calendar") {
                  navigation?.getParent?.()?.navigate?.("Home", { screen: "Calendar" });
                } else if (tool.screen === "Bookmarks") {
                  navigation?.getParent?.()?.navigate?.("Prepare", { screen: "Bookmarks", params: { returnToTab: "Tools" } });
                } else {
                  navigation.navigate(tool.screen);
                }
              }}
            >
              <View style={s.rowIconBox}>
                <tool.Icon size={24} color="#E8D4A0" weight="regular" />
              </View>
              <View style={s.rowInfo}>
                <Text style={s.rowLabel}>{tool.label}</Text>
                <Text style={s.rowSub}>{tool.sub}</Text>
              </View>
              <CaretRight size={18} color="#C8BFB2" weight="bold" />
            </TouchableOpacity>
          ))}
        <View style={s.bottomPad} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: "#EDE6D8" },
  header:       { height: 260, overflow: "hidden" },
  headerImg:    { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" },
  gradient:     { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  headerContent:{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "flex-end", paddingHorizontal: 20, paddingBottom: 22 },
  titleRow:     { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  iconCircle:   { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: "#C8A96A", alignItems: "center", justifyContent: "center" },
  title:        { fontFamily: SERIF, fontSize: 38, color: "#FFFFFF", fontWeight: "600" },
  subtitle:     { fontSize: 15, color: "rgba(255,255,255,0.82)", lineHeight: 22, maxWidth: "88%" },
  scroll:       { flex: 1 },
  scrollContent:{ paddingTop: 12 },
  row:          { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 16, backgroundColor: "#FDFAF4", borderRadius: 16, marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: "#EDE4D4", shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  rowIconBox:   { width: 52, height: 52, borderRadius: 14, backgroundColor: "#3A2F1E", alignItems: "center", justifyContent: "center", marginRight: 16 },
  rowInfo:      { flex: 1 },
  rowLabel:     { fontSize: 19, color: "#1C1A14", marginBottom: 3 },
  rowSub:       { fontSize: 13, color: "#5C534A", lineHeight: 18 },
  bottomPad:    { height: 40 },
});
