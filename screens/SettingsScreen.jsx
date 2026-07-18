/**
 * SettingsScreen.jsx — Safar
 * Display, accessibility, account, and privacy settings.
 */
import React, { useState, useMemo } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Switch, Alert, Modal, StatusBar, Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, spacing, radius, shadows, typography } from "../theme";
import { useAccessibility } from "../AccessibilityContext";
import { CaretLeft, Info, CaretRight } from "phosphor-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HeaderPatternBg from "../HeaderPatternBg";

const SERIF = "SourceSerif4-Regular";
const SW = Dimensions.get("window").width;

const ABOUT_CONTENT = "Safar is your companion for every step of your sacred Hajj or Umrah journey.\n\nBuild a personalised step-by-step plan, pin your hotel, guide and travel group, practice the most important duʿāʾs, and carry the guidance of scholars in your pocket.\n\nShare milestones with fellow pilgrims, track your progress through every ibadah, and arrive prepared, calm and confident.\n\nMay Allah accept your journey. آمين";

function AboutSafarModal({ visible, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: "rgba(15,36,25,0.65)", justifyContent: "center", alignItems: "center", paddingHorizontal: 28 }}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={{ backgroundColor: "#FDFAF4", borderRadius: 20, padding: 28, width: "100%", shadowColor: "#4A5C48", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.20, shadowRadius: 24, elevation: 12 }}
          onStartShouldSetResponder={() => true}
        >
          <Text style={{ fontFamily: SERIF, fontSize: 22, fontWeight: "600", color: "#4A5C48", marginBottom: 14 }}>What is Safar?</Text>
          <Text style={{ fontSize: 15, color: "#3A3530", lineHeight: 24, marginBottom: 22 }}>{ABOUT_CONTENT}</Text>
          <TouchableOpacity
            style={{ backgroundColor: "#4A5C48", borderRadius: 50, paddingHorizontal: 32, paddingVertical: 11, alignSelf: "flex-start" }}
            onPress={onClose}
          >
            <Text style={{ color: "#FDFAF4", fontSize: 14, fontWeight: "600" }}>Close</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

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
  const insets = useSafeAreaInsets();
  const s = useMemo(() => createStyles(colors), [colors]);

  const [notif, setNotif] = useState(true);
  const [showAbout, setShowAbout] = useState(false);

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
    <View style={s.safe}>
      <StatusBar barStyle="light-content" />
      <View style={s.header}>
        <HeaderPatternBg width={SW} />
        <View style={[s.headerTopRow, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            style={s.chipBtn}
            onPress={() => navigation?.goBack?.()}
            hitSlop={{ top:12, bottom:12, left:12, right:24 }}
            activeOpacity={0.8}
          >
            <CaretLeft size={20} color="#1A1410" weight="bold" />
          </TouchableOpacity>
          <View style={{ width: 36 }} />
        </View>
        <Text style={s.pageTitle}>Settings</Text>
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

        {/* About */}
        <Text style={s.sectionLabel}>ABOUT</Text>
        <View style={s.card}>
          <TouchableOpacity
            style={[s.row, s.rowBorder]}
            onPress={() => setShowAbout(true)}
            activeOpacity={0.75}
          >
            <View style={s.rowIconBox}>
              <Info size={24} color="#C8A96A" weight="regular" />
            </View>
            <View style={s.rowInfo}>
              <Text style={s.rowLabel}>About Safar</Text>
              <Text style={s.rowSub}>Version, credits and legal</Text>
            </View>
            <CaretRight size={18} color="#C8BFB2" weight="bold" />
          </TouchableOpacity>
        </View>

        {/* Version */}
        <Text style={s.version}>Safar {"\u00b7"} Version 1.0.0</Text>

        <View style={{ height: spacing(4) }} />
      </ScrollView>

      <AboutSafarModal visible={showAbout} onClose={() => setShowAbout(false)} />
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe:   { flex:1, backgroundColor:"#E8DDD0" },
  header:       { position: "relative", overflow: "hidden", minHeight: 140, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: "#4A5C48" },
  headerTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 2 },
  chipBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: "#FDFAF4", alignItems: "center", justifyContent: "center" },
  pageTitle:    { fontFamily: SERIF, fontSize: 38, color: "#FDFAF4", textAlign: "center", marginTop: 8, position: "relative", zIndex: 2 },
  scroll:       { paddingHorizontal:20, paddingTop:16 },
  sectionLabel: { fontSize:10, fontWeight:"700", letterSpacing:1.5, color:"#3A3530", marginBottom:8, marginTop:16 },
  card:         { backgroundColor:colors.card, borderRadius:radius.lg, borderWidth:1, borderColor:"#C8BFB2", overflow:"hidden", ...shadows.card, marginBottom:4 },
  version:      { fontSize:typography.tiny, color:"#C8BFB2", textAlign:"center", marginTop:spacing(3), fontWeight:"400" },
  row:          { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 16 },
  rowBorder:    { borderBottomWidth: 1, borderBottomColor: "#C8BFB2" },
  rowIconBox:   { width: 52, height: 52, borderRadius: 14, backgroundColor: "rgba(58,53,69,0.85)", alignItems: "center", justifyContent: "center", marginRight: 16 },
  rowInfo:      { flex: 1 },
  rowLabel:     { fontSize: 16, color: "#1C1A14", marginBottom: 3 },
  rowSub:       { fontSize: 13, color: "#5C534A", lineHeight: 18 },
});
