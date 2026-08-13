/**
 * SettingsScreen.jsx — Safar
 * Display, accessibility, account, and privacy settings.
 */
import React, { useState, useMemo, useEffect } from "react";
import {
  SafeAreaView, View, Text, Image, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Switch, Alert, Modal, StatusBar, Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, spacing, radius, shadows, typography } from "../theme";
import { useAccessibility } from "../AccessibilityContext";
import { CaretLeft, Info, CaretRight, PencilSimple, Camera } from "phosphor-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HeaderPatternBg from "../HeaderPatternBg";
import { getCurrentUser } from "../firebase";
import { PRAYER_METHODS, PRAYER_SCHOOLS, PRAYER_METHOD_KEY, PRAYER_SCHOOL_KEY, PRAYER_NOTIFY_KEY } from "../prayerSettings";

let ImagePicker;
try { ImagePicker = require("expo-image-picker"); } catch (_) {}
let Notifications;
try { Notifications = require("expo-notifications"); } catch (_) {}

const AVATARS = [
  { key: "kaabah",   src: require("../assets/avatars/avatar-kaabah.png")   },
  { key: "moon",     src: require("../assets/avatars/avatar-moon.png")     },
  { key: "mosque",   src: require("../assets/avatars/avatar-mosque.png")   },
  { key: "beads",    src: require("../assets/avatars/avatar-beads.png")    },
  { key: "compass",  src: require("../assets/avatars/avatar-compass.png")  },
  { key: "book",     src: require("../assets/avatars/avatar-book.png")     },
  { key: "lantern",  src: require("../assets/avatars/avatar-lantern.png")  },
  { key: "hands",    src: require("../assets/avatars/avatar-hands.png")    },
  { key: "leaf",     src: require("../assets/avatars/avatar-leaf.png")     },
  { key: "mountain", src: require("../assets/avatars/avatar-mountain.png") },
  { key: "star",     src: require("../assets/avatars/avatar-star.png")     },
  { key: "heart",    src: require("../assets/avatars/avatar-heart.png")    },
  { key: "sun",      src: require("../assets/avatars/avatar-sun.png")      },
  { key: "dove",     src: require("../assets/avatars/avatar-dove.png")     },
  { key: "flower",   src: require("../assets/avatars/avatar-flower.png")   },
  { key: "wave",     src: require("../assets/avatars/avatar-wave.png")     },
];
const AVATAR_KEY = "safar_avatar_v1";

const SERIF = "SourceSerif4-Regular";
const SW = Dimensions.get("window").width;

const ABOUT_CONTENT = "Safar is your companion for every step of your sacred Hajj or Umrah journey.\n\nBuild a personalised step-by-step plan, pin your hotel, guide and travel group, practice the most important duas, and carry the guidance of scholars in your pocket.\n\nShare milestones with fellow pilgrims, track your progress through every ibadah, and arrive prepared, calm and confident.\n\nMay Allah accept your journey. آمين";

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

  const [showAbout, setShowAbout] = useState(false);

  const [prayerMethod,      setPrayerMethod]      = useState(4);
  const [prayerSchool,      setPrayerSchool]      = useState(0);
  const [prayerNotify,      setPrayerNotify]      = useState(false);
  const [showMethodPicker,  setShowMethodPicker]  = useState(false);

  const [avatarKey,     setAvatarKey]     = useState(null);
  const [userName,      setUserName]      = useState("Pilgrim");
  const [journeyType,   setJourneyType]   = useState("");
  const [userEmail,     setUserEmail]     = useState("");
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [editName,      setEditName]      = useState("");
  const [editEmail,     setEditEmail]     = useState("");
  const [editJourney,   setEditJourney]   = useState("");

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join("");

  const journeyLabel =
    journeyType === "hajj"  ? "Hajj"     :
    journeyType === "umrah" ? "Umrah"    :
    journeyType === "learn" ? "Learning" : "";

  useEffect(() => {
    async function loadProfile() {
      const [name, journey, avatar] =
        await Promise.all([
          AsyncStorage.getItem("safar_user_name_v1"),
          AsyncStorage.getItem("safar_journey_type_v1"),
          AsyncStorage.getItem(AVATAR_KEY),
        ]);
      setUserName(name ?? "Pilgrim");
      setJourneyType(journey ?? "");
      setAvatarKey(avatar ?? null);

      const user = getCurrentUser();
      setUserEmail(user?.email ?? "");

      const [m, sc, n] = await Promise.all([
        AsyncStorage.getItem(PRAYER_METHOD_KEY),
        AsyncStorage.getItem(PRAYER_SCHOOL_KEY),
        AsyncStorage.getItem(PRAYER_NOTIFY_KEY),
      ]);
      if (m != null) setPrayerMethod(Number(m));
      if (sc != null) setPrayerSchool(Number(sc));
      if (n != null) setPrayerNotify(n === "true");
    }
    loadProfile();
  }, []);

  async function selectPrayerMethod(code) {
    setPrayerMethod(code);
    await AsyncStorage.setItem(PRAYER_METHOD_KEY, String(code));
    setShowMethodPicker(false);
  }

  async function selectPrayerSchool(code) {
    setPrayerSchool(code);
    await AsyncStorage.setItem(PRAYER_SCHOOL_KEY, String(code));
  }

  async function togglePrayerNotify() {
    if (!Notifications) {
      Alert.alert("Dev build required", "Prayer time notifications need expo-notifications.\n\nnpx expo install expo-notifications");
      return;
    }
    if (!prayerNotify) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Allow notifications to get prayer time reminders.");
        return;
      }
    }
    const next = !prayerNotify;
    setPrayerNotify(next);
    await AsyncStorage.setItem(PRAYER_NOTIFY_KEY, next ? "true" : "false");
  }

  function openEditSheet() {
    setEditName(userName);
    setEditEmail(userEmail);
    setEditJourney(journeyType);
    setShowEditSheet(true);
  }

  async function pickPhoto() {
    if (!ImagePicker) {
      Alert.alert("Not available", "Photo avatars require expo-image-picker.");
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        const value = "photo::" + result.assets[0].uri;
        setAvatarKey(value);
        await AsyncStorage.setItem(AVATAR_KEY, value);
      }
    } catch (_) {}
  }

  async function saveProfile() {
    const trimmedName  = editName.trim();
    const trimmedEmail = editEmail.trim();

    if (trimmedName) {
      await AsyncStorage.setItem("safar_user_name_v1", trimmedName);
      setUserName(trimmedName);
    }
    if (trimmedEmail) {
      await AsyncStorage.setItem("safar_user_email_v1", trimmedEmail);
      setUserEmail(trimmedEmail);
    }
    if (editJourney) {
      await AsyncStorage.setItem("safar_journey_type_v1", editJourney);
      setJourneyType(editJourney);
    }
    setShowEditSheet(false);
  }

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

  const clearTripData = () => {
    Alert.alert(
      "Clear trip data?",
      "This removes your departure date and pilgrimage type only. Other data stays. This is a temporary testing button.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("safar_departure_date_v1");
              await AsyncStorage.removeItem("safar_journey_type_v1");
            } catch (e) {}
            Alert.alert("Cleared", "Trip data removed. Restart the app or go to Home to see the invitation card.");
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

        {/* Profile */}
        <Text style={s.sectionLabel}>PROFILE</Text>
        <View style={s.card}>
          <TouchableOpacity style={es.profileRow} onPress={openEditSheet} activeOpacity={0.8}>
            <View style={[es.profileAvatar, avatarKey ? null : { backgroundColor: "#3A3545" }]}>
              {avatarKey ? (
                avatarKey.startsWith("photo::") ? (
                  <Image source={{ uri: avatarKey.slice(7) }} style={es.profileAvatarImg} resizeMode="cover" />
                ) : (
                  <Image source={AVATARS.find(a => a.key === avatarKey)?.src} style={es.profileAvatarImg} resizeMode="cover" />
                )
              ) : (
                <Text style={es.profileInitials}>{initials || "S"}</Text>
              )}
            </View>
            <View style={es.profileInfo}>
              <Text style={es.profileName} numberOfLines={1}>{userName || "Pilgrim"}</Text>
              {userEmail ? <Text style={es.profileEmail} numberOfLines={1}>{userEmail}</Text> : null}
              {journeyLabel ? (
                <View style={es.journeyBadge}>
                  <Text style={es.journeyBadgeText}>{journeyLabel}</Text>
                </View>
              ) : null}
            </View>
            <PencilSimple size={16} color="#8A7D6A" weight="regular" />
          </TouchableOpacity>
        </View>

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

        {/* Prayer Times */}
        <Text style={s.sectionLabel}>PRAYER TIMES</Text>
        <View style={s.card}>
          <SettingRow
            label="Calculation Method"
            sub={PRAYER_METHODS.find(m => m.code === prayerMethod)?.label}
            onPress={() => setShowMethodPicker(true)}
          />
          <View style={es.editField}>
            <Text style={[es.editFieldLabel, { paddingHorizontal: 18, paddingTop: 14 }]}>Asr Calculation</Text>
            <View style={[es.editJourneyRow, { paddingHorizontal: 18, marginBottom: 14 }]}>
              {PRAYER_SCHOOLS.map((sc) => (
                <TouchableOpacity
                  key={sc.code}
                  style={prayerSchool === sc.code ? [es.editJourneyPill, es.editJourneyPillActive] : es.editJourneyPill}
                  onPress={() => selectPrayerSchool(sc.code)}
                  activeOpacity={0.75}
                >
                  <Text style={prayerSchool === sc.code ? [es.editJourneyText, es.editJourneyTextActive] : es.editJourneyText} numberOfLines={1}>
                    {sc.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <SettingRow
            label="Prayer Time Reminders"
            sub="Get notified as prayer times approach"
            value={prayerNotify}
            onToggle={togglePrayerNotify}
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
          />
          <SettingRow
            label="Clear Trip Data (Test)"
            sub="Testing: clears trip date and pilgrimage type"
            onPress={clearTripData}
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

      <Modal
        visible={showMethodPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMethodPicker(false)}
      >
        <TouchableOpacity style={es.pickerBackdrop} activeOpacity={1} onPress={() => setShowMethodPicker(false)}>
          <View style={es.pickerSheet} onStartShouldSetResponder={() => true}>
            <View style={es.pickerHandle} />
            <Text style={[es.pickerTitle, { paddingHorizontal: 24 }]}>Calculation Method</Text>
            <View style={{ paddingHorizontal: 24, paddingTop: 12 }}>
              {PRAYER_METHODS.map((m) => (
                <TouchableOpacity
                  key={m.code}
                  style={sr.row}
                  onPress={() => selectPrayerMethod(m.code)}
                  activeOpacity={0.75}
                >
                  <View style={sr.info}>
                    <Text style={sr.label}>{m.label}</Text>
                  </View>
                  {prayerMethod === m.code ? (
                    <View style={es.pickerCheck}><Text style={es.pickerCheckText}>{"✓"}</Text></View>
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showEditSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditSheet(false)}
      >
        <TouchableOpacity style={es.pickerBackdrop} activeOpacity={1} onPress={() => setShowEditSheet(false)}>
          <View style={es.pickerSheet} onStartShouldSetResponder={() => true}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
            >
              <View style={es.pickerHandle} />
              <Text style={es.pickerTitle}>Edit Profile</Text>

              <Text style={es.editSectionLabel}>Your Details</Text>

              <View style={es.editField}>
                <Text style={es.editFieldLabel}>Name</Text>
                <TextInput
                  style={es.editFieldInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Your name"
                  placeholderTextColor="#C8BFB2"
                  autoCorrect={false}
                />
              </View>

              <View style={es.editField}>
                <Text style={es.editFieldLabel}>Email</Text>
                <TextInput
                  style={es.editFieldInput}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="your@email.com"
                  placeholderTextColor="#C8BFB2"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <Text style={es.editFieldLabel}>Journey</Text>
              <View style={es.editJourneyRow}>
                {["umrah", "hajj", "learn"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={editJourney === type ? [es.editJourneyPill, es.editJourneyPillActive] : es.editJourneyPill}
                    onPress={() => setEditJourney(type)}
                    activeOpacity={0.75}
                  >
                    <Text style={editJourney === type ? [es.editJourneyText, es.editJourneyTextActive] : es.editJourneyText}>
                      {type === "umrah" ? "Umrah" : type === "hajj" ? "Hajj" : "Learning"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={es.editDivider} />

              <Text style={es.editSectionLabel}>Avatar</Text>

              <TouchableOpacity
                style={es.pickerInitialsRow}
                onPress={async () => {
                  setAvatarKey(null);
                  await AsyncStorage.removeItem(AVATAR_KEY);
                }}
                activeOpacity={0.75}
              >
                <View style={es.pickerInitialsCircle}>
                  <Text style={es.pickerInitialsText}>{initials || "S"}</Text>
                </View>
                <Text style={es.pickerInitialsLabel}>Use my initials</Text>
                {!avatarKey ? (
                  <View style={es.pickerCheck}><Text style={es.pickerCheckText}>{"✓"}</Text></View>
                ) : null}
              </TouchableOpacity>

              <View style={es.pickerGrid}>
                <TouchableOpacity
                  style={avatarKey?.startsWith("photo::") ? [es.pickerPhotoTile, es.pickerItemActive] : es.pickerPhotoTile}
                  onPress={pickPhoto}
                  activeOpacity={0.75}
                >
                  {avatarKey?.startsWith("photo::") ? (
                    <Image source={{ uri: avatarKey.slice(7) }} style={es.pickerItemImg} resizeMode="cover" />
                  ) : (
                    <>
                      <Camera size={22} color="#8A7D6A" weight="regular" />
                      <Text style={es.pickerPhotoLabel}>Use Photo</Text>
                    </>
                  )}
                  {avatarKey?.startsWith("photo::") ? (
                    <View style={es.pickerItemCheck}><Text style={es.pickerCheckText}>{"✓"}</Text></View>
                  ) : null}
                </TouchableOpacity>
                {AVATARS.map((avatar) => (
                  <TouchableOpacity
                    key={avatar.key}
                    style={avatarKey === avatar.key ? [es.pickerItem, es.pickerItemActive] : es.pickerItem}
                    onPress={async () => {
                      setAvatarKey(avatar.key);
                      await AsyncStorage.setItem(AVATAR_KEY, avatar.key);
                    }}
                    activeOpacity={0.75}
                  >
                    <Image source={avatar.src} style={es.pickerItemImg} resizeMode="cover" />
                    {avatarKey === avatar.key ? (
                      <View style={es.pickerItemCheck}><Text style={es.pickerCheckText}>{"✓"}</Text></View>
                    ) : null}
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={es.editSaveBtn} onPress={saveProfile} activeOpacity={0.85}>
                <Text style={es.editSaveBtnText}>Save Profile</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const es = StyleSheet.create({
  profileRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  profileAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  profileAvatarImg: { width: 48, height: 48 },
  profileInitials: { fontSize: 18, fontWeight: "700", color: "#FFFFFF" },
  profileInfo: { flex: 1, gap: 3 },
  profileName: { fontFamily: "SourceSerif4-Regular", fontSize: 16, color: "#100E0A" },
  profileEmail: { fontSize: 13, color: "#5A5650" },
  journeyBadge: { alignSelf: "flex-start", backgroundColor: "rgba(58,53,69,0.10)", borderRadius: 50, paddingHorizontal: 8, paddingVertical: 2, marginTop: 2 },
  journeyBadgeText: { fontSize: 11, fontWeight: "600", color: "#3A3545" },

  pickerBackdrop: { flex: 1, backgroundColor: "rgba(26,20,16,0.60)", justifyContent: "flex-end" },
  pickerSheet: { backgroundColor: "#FDFAF4", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 16, paddingBottom: 40, maxHeight: "90%" },
  pickerHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "#DDD5C0", alignSelf: "center", marginBottom: 20 },
  pickerTitle: { fontFamily: "SourceSerif4-Regular", fontSize: 20, color: "#1A1410", fontWeight: "600", marginBottom: 4 },
  pickerInitialsRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EDE4D4", marginBottom: 16 },
  pickerInitialsCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#C8A96A", alignItems: "center", justifyContent: "center" },
  pickerInitialsText: { fontSize: 18, fontWeight: "700", color: "#FFFFFF" },
  pickerInitialsLabel: { flex: 1, fontSize: 15, color: "#1A1410", fontWeight: "500" },
  pickerCheck: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#4A5C48", alignItems: "center", justifyContent: "center" },
  pickerCheckText: { fontSize: 12, color: "#FFFFFF", fontWeight: "700" },
  pickerGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pickerItem: { width: "22%", aspectRatio: 1, borderRadius: 12, overflow: "hidden", borderWidth: 2, borderColor: "transparent" },
  pickerItemActive: { borderColor: "#4A5C48" },
  pickerItemImg: { width: "100%", height: "100%" },
  pickerItemCheck: { position: "absolute", top: 4, right: 4, width: 18, height: 18, borderRadius: 9, backgroundColor: "#4A5C48", alignItems: "center", justifyContent: "center" },
  pickerPhotoTile: { width: "22%", aspectRatio: 1, borderRadius: 12, overflow: "hidden", borderWidth: 2, borderColor: "#C8BFB2", borderStyle: "dashed", alignItems: "center", justifyContent: "center", backgroundColor: "#F0EBE1", gap: 4 },
  pickerPhotoLabel: { fontSize: 9, fontWeight: "600", color: "#8A7D6A", textAlign: "center" },

  editSectionLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1.0, color: "#C8A96A", textTransform: "uppercase", marginBottom: 10, marginTop: 4 },
  editDivider: { height: 1, backgroundColor: "#EDE4D4", marginVertical: 16 },
  editField: { marginBottom: 12 },
  editFieldLabel: { fontSize: 12, fontWeight: "600", color: "#8A7D6A", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  editFieldInput: { backgroundColor: "#F0EBE1", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#1A1410", borderWidth: 1, borderColor: "#DDD5C0" },
  editJourneyRow: { flexDirection: "row", gap: 8, marginTop: 6, marginBottom: 20 },
  editJourneyPill: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", backgroundColor: "#F0EBE1", borderWidth: 1, borderColor: "#DDD5C0" },
  editJourneyPillActive: { backgroundColor: "#4A5C48", borderColor: "#4A5C48" },
  editJourneyText: { fontSize: 13, fontWeight: "600", color: "#5C534A" },
  editJourneyTextActive: { color: "#FFFFFF" },
  editSaveBtn: { backgroundColor: "#1A1410", borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  editSaveBtnText: { fontSize: 15, fontWeight: "600", color: "#C8A96A", letterSpacing: 0.3 },
});

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
