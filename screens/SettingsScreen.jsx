/**
 * SettingsScreen.jsx — Safar
 * Display, accessibility, account, and privacy settings.
 */
import React, { useState, useMemo } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Switch, Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, spacing, radius, shadows, typography } from "../theme";
import { useAccessibility } from "../AccessibilityContext";

const SERIF = "SourceSerif4-Regular";

function SettingRow({ label, sub, value, onToggle, isLast, navigation, screen, onPress }) {
  if (onToggle !== undefined) {
    return (
      <View style={!isLast ? [sr.row, sr.rowBorder] : sr.row}>
        <View style={sr.info}>
          <Text style={sr.label}>{label}</Text>
          {sub ? <Text style={sr.sub}>{sub}</Text> : null}
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: "#C8BFB2", true: "#1E3D30" }}
          thumbColor={colors.card}
        />
      </View>
    );
  }
  return (
    <TouchableOpacity
      style={!isLast ? [sr.row, sr.rowBorder] : sr.row}
      onPress={() => (onPress ? onPress() : screen && navigation?.navigate?.(screen))}
      activeOpacity={0.85}
    >
      <View style={sr.info}>
        <Text style={sr.label}>{label}</Text>
        {sub ? <Text style={sr.sub}>{sub}</Text> : null}
      </View>
      <Text style={sr.arrow}>{"\u203a"}</Text>
    </TouchableOpacity>
  );
}

const sr = StyleSheet.create({
  row:       { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:16, paddingVertical:14 },
  rowBorder: { borderBottomWidth:1, borderBottomColor:"#C8BFB2" },
  info:      { flex:1, paddingRight:8 },
  label:     { fontFamily:SERIF, fontSize:16, color:"#100E0A", marginBottom:2 },
  sub:       { fontSize:14, color:"#5A5650", fontWeight:"400" },
  arrow:     { fontSize:18, color:"#C8BFB2" },
});

export default function SettingsScreen({ navigation }) {
  const { colors, largeText, highContrast, reduceMotion, toggle } = useAccessibility();
  const s = useMemo(() => createStyles(colors), [colors]);

  const [notif, setNotif] = useState(true);

  const resetOnboarding = () => {
    Alert.alert(
      "Restart setup?",
      "This will take you back through the welcome and journey setup. Your saved data is not deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restart",
          style: "destructive",
          onPress: async () => {
            try { await AsyncStorage.removeItem("safar_onboarded_v1"); } catch (e) {}
            // navigate() bubbles up through parent navigators until it finds
            // "Onboarding" in the root stack — works from any nesting depth.
            navigation?.navigate?.("Onboarding");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} hitSlop={{ top:12, bottom:12, left:12, right:24 }}>
          <Text style={s.back}>{"\u2190"}</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Settings</Text>
        <View style={{ width:30 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Display */}
        <Text style={s.sectionLabel}>DISPLAY</Text>
        <View style={s.card}>
          <SettingRow
            label="Large Text"
            sub="Increases font sizes throughout the app"
            value={largeText}
            onToggle={() => toggle("largeText")}
          />
          <SettingRow
            label="High Contrast"
            sub="Stronger colour contrast for readability"
            value={highContrast}
            onToggle={() => toggle("highContrast")}
          />
          <SettingRow
            label="Reduce Motion"
            sub="Limits animations and transitions"
            value={reduceMotion}
            onToggle={() => toggle("reduceMotion")}
            isLast
          />
        </View>

        {/* Notifications */}
        <Text style={s.sectionLabel}>NOTIFICATIONS</Text>
        <View style={s.card}>
          <SettingRow
            label="Journey Reminders"
            sub="Daily reminders during your pilgrimage"
            value={notif}
            onToggle={() => setNotif(v => !v)}
            isLast
          />
        </View>

        {/* Account */}
        <Text style={s.sectionLabel}>ACCOUNT</Text>
        <View style={s.card}>
          <SettingRow label="Language" sub="English" navigation={navigation} screen={null} />
          <SettingRow label="Privacy Policy" navigation={navigation} screen={null} />
          <SettingRow label="Terms of Service" navigation={navigation} screen={null} isLast />
        </View>

        {/* Support */}
        <Text style={s.sectionLabel}>SUPPORT</Text>
        <View style={s.card}>
          <SettingRow label="Help & Support" navigation={navigation} screen="Support" isLast />
        </View>

        {/* Setup */}
        <Text style={s.sectionLabel}>SETUP</Text>
        <View style={s.card}>
          <SettingRow
            label="Restart Setup"
            sub="Go through the welcome and journey setup again"
            onPress={resetOnboarding}
            isLast
          />
        </View>

        {/* Version */}
        <Text style={s.version}>Safar {"\u00b7"} Version 1.0.0</Text>

        <View style={{ height: spacing(4) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe:   { flex:1, backgroundColor:"#E8DDD0" },
  header: { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:20, paddingTop:16, paddingBottom:12, borderBottomWidth:1, borderBottomColor:"#C8BFB2" },
  back:        { fontSize:22, color:"#100E0A" },
  headerTitle: { fontFamily:SERIF, fontSize:22, color:"#100E0A" },
  scroll:       { paddingHorizontal:20, paddingTop:16 },
  sectionLabel: { fontSize:10, fontWeight:"700", letterSpacing:1.5, color:"#3A3530", marginBottom:8, marginTop:16 },
  card:         { backgroundColor:colors.card, borderRadius:radius.lg, borderWidth:1, borderColor:"#C8BFB2", overflow:"hidden", ...shadows.card, marginBottom:4 },
  version:      { fontSize:typography.tiny, color:"#C8BFB2", textAlign:"center", marginTop:spacing(3), fontWeight:"400" },
});
