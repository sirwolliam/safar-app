/**
 * HomeScreen.jsx — Safar
 * User mental model:
 *   1. Greeting with name — personal, immediate
 *   2. Departure countdown — where am I in time?
 *   3. Preparation — am I ready?
 *   4. Today's du'a — spiritual practice
 *   5. Journey quick-links — what I need fast
 *   6. My People — contacts and groups
 *   7. Tools strip — tasbeeh, import, focus
 */
import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  ImageBackground, StyleSheet, Dimensions, Modal,
  TextInput, KeyboardAvoidingView, Platform, Animated,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OnboardingCarousel from "../components/OnboardingCarousel";

const SERIF = "SourceSerif4-Regular";
const { width: SW, height: SH } = Dimensions.get("window");
const HERO_H = Math.round(SH * 0.60);

// ── Storage keys ──────────────────────────────────────────────────────────────
const ONBOARDED_KEY     = "safar_onboarded_v1";
const DEPARTURE_KEY     = "safar_departure_date_v1";
const UMRAH_CHECK_KEY   = "safar_umrah_checklist_v1";
const CHECK_DONE_KEY    = "safar_checklist_done_v1";
const CONTACTS_KEY      = "safar_journey_contacts_v1";
const USER_NAME_KEY     = "safar_user_name_v1";
const IMPORT_DONE_KEY   = "safar_import_dismissed_v1";

// ── Daily du'a rotation ───────────────────────────────────────────────────────
const DAILY_DUAS = [
  { arabic:"اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ",
    transliteration:"Allahumma inni as'alukal-'afwa wal-'afiyah",
    translation:"O Allah, I ask You for pardon and well-being.", ref:"Ibn Majah" },
  { arabic:"رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً",
    transliteration:"Rabbana atina fid-dunya hasanah",
    translation:"Our Lord, give us good in this world and in the Hereafter.", ref:"Al-Baqarah 2:201" },
  { arabic:"اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
    transliteration:"Allahumma a'inni 'ala dhikrika wa shukrika",
    translation:"O Allah, help me remember You, be grateful to You, and worship You well.", ref:"Abu Dawud" },
  { arabic:"سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ",
    transliteration:"Subhanallahi wa bihamdihi, Subhanallahil-'Azim",
    translation:"Glory be to Allah and His is the praise; Glory be to Allah the Mighty.", ref:"Al-Bukhari" },
  { arabic:"اللَّهُمَّ اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ",
    transliteration:"Allahummaghfir li wa liwalidayya",
    translation:"O Allah, forgive me, my parents and the believers.", ref:"Nuh 71:28" },
  { arabic:"رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي",
    transliteration:"Rabbi ishrah li sadri wa yassir li amri",
    translation:"My Lord, expand for me my breast and ease for me my task.", ref:"Ta-Ha 20:25-26" },
  { arabic:"حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ",
    transliteration:"Hasbiyallahu la ilaha illa hu, 'alayhi tawakkaltu",
    translation:"Allah is sufficient for me; there is no god but He. In Him I put my trust.", ref:"At-Tawbah 9:129" },
];
const getDailyDua = () => DAILY_DUAS[Math.floor(Date.now() / 86400000) % DAILY_DUAS.length];

// ── Name prompt modal ─────────────────────────────────────────────────────────
function NamePrompt({ visible, onSave }) {
  const [name, setName] = useState("");
  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView style={np.overlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={np.card}>
          <Text style={np.title}>{"As-sal\u0101mu \u02bfalaykum"}</Text>
          <Text style={np.sub}>What would you like us to call you?</Text>
          <TextInput
            style={np.input}
            placeholder="Your name"
            placeholderTextColor="#9A8E7A"
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={() => name.trim() && onSave(name.trim())}
          />
          <TouchableOpacity
            style={[np.btn, !name.trim() && np.btnDisabled]}
            onPress={() => name.trim() && onSave(name.trim())}
            activeOpacity={0.85}>
            <Text style={np.btnTxt}>Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onSave("")} style={np.skip}>
            <Text style={np.skipTxt}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
const np = StyleSheet.create({
  overlay:    { flex:1, backgroundColor:"rgba(0,0,0,0.55)", alignItems:"center", justifyContent:"center", paddingHorizontal:24 },
  card:       { backgroundColor:"#F5EDE0", borderRadius:24, padding:28, width:"100%", shadowColor:"#1A1208", shadowOffset:{width:0,height:8}, shadowOpacity:0.25, shadowRadius:20, elevation:12 },
  title:      { fontFamily:SERIF, fontSize:22, color:"#1E3D30", textAlign:"center", marginBottom:8 },
  sub:        { fontSize:15, color:"#5C534A", textAlign:"center", marginBottom:20, fontWeight:"500" },
  input:      { backgroundColor:"#FDFAF4", borderRadius:12, borderWidth:1.5, borderColor:"#C8BFB2", paddingHorizontal:16, paddingVertical:14, fontSize:18, fontFamily:SERIF, color:"#100E0A", marginBottom:16 },
  btn:        { backgroundColor:"#1E3D30", borderRadius:12, paddingVertical:14, alignItems:"center" },
  btnDisabled:{ opacity:0.4 },
  btnTxt:     { fontFamily:SERIF, fontSize:16, color:"#fff", fontWeight:"600" },
  skip:       { paddingTop:14, alignItems:"center" },
  skipTxt:    { fontSize:14, color:"#8A7D70", fontWeight:"500" },
});

// ── About modal ───────────────────────────────────────────────────────────────
function AboutModal({ visible, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={ab.overlay} activeOpacity={1} onPress={onClose}>
        <View style={ab.card} onStartShouldSetResponder={() => true}>
          <Text style={ab.icon}>{"🕌"}</Text>
          <Text style={ab.title}>What is Safar?</Text>
          <Text style={ab.body}>
            {"Safar is your step-by-step companion for Umrah and Hajj \u2014 from the moment you decide to go, to the day you return.\n\nPlan your journey, learn and practise du\u02bf\u0101s, explore sacred places, and stay connected with your travel companions.\n\nMay Allah accept your journey. \uD83C\uDF3F"}
          </Text>
          <TouchableOpacity style={ab.btn} onPress={onClose} activeOpacity={0.85}>
            <Text style={ab.btnTxt}>Got it</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
const ab = StyleSheet.create({
  overlay: { flex:1, backgroundColor:"rgba(0,0,0,0.55)", alignItems:"center", justifyContent:"center", paddingHorizontal:24 },
  card:    { backgroundColor:"#F5EDE0", borderRadius:20, padding:24, width:"100%" },
  icon:    { fontSize:32, textAlign:"center", marginBottom:12 },
  title:   { fontFamily:SERIF, fontSize:22, color:"#100E0A", textAlign:"center", marginBottom:12 },
  body:    { fontSize:15, color:"#3A3530", lineHeight:23, fontWeight:"500" },
  btn:     { marginTop:20, backgroundColor:"#1E3D30", borderRadius:10, paddingVertical:14, alignItems:"center" },
  btnTxt:  { fontFamily:SERIF, fontSize:16, color:"#fff", fontWeight:"600" },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const scrollRef = useRef(null);
  const [userName,       setUserName]       = useState("");
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [showAbout,      setShowAbout]      = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [daysAway,       setDaysAway]       = useState(null);
  const [departureDateStr, setDepartureDateStr] = useState(null);
  const [checkTotal,     setCheckTotal]     = useState(10);
  const [checkDone,      setCheckDone]      = useState(0);
  const [contactCount,   setContactCount]   = useState(0);
  const [importDone,     setImportDone]     = useState(true);
  const dua = getDailyDua();

  useFocusEffect(
    React.useCallback(() => {
      scrollRef.current?.scrollTo?.({ y:0, animated:false });
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const [name, onboarded, departure, checkItems, checkDoneRaw, contacts, imported] =
        await Promise.all([
          AsyncStorage.getItem(USER_NAME_KEY),
          AsyncStorage.getItem(ONBOARDED_KEY),
          AsyncStorage.getItem(DEPARTURE_KEY),
          AsyncStorage.getItem(UMRAH_CHECK_KEY),
          AsyncStorage.getItem(CHECK_DONE_KEY),
          AsyncStorage.getItem(CONTACTS_KEY),
          AsyncStorage.getItem(IMPORT_DONE_KEY),
        ]);

      // Name
      if (name) setUserName(name);

      // Onboarding
      if (onboarded !== "true") setShowOnboarding(true);

      // Departure
      if (departure) {
        setDepartureDateStr(departure);
        const d = new Date(departure + "T00:00:00");
        const days = Math.max(0, Math.ceil((d - new Date()) / 86400000));
        setDaysAway(days);
      }

      // Checklist
      const items = checkItems ? JSON.parse(checkItems) : null;
      const total = items ? items.length : 10;
      const done  = checkDoneRaw ? Object.values(JSON.parse(checkDoneRaw)).filter(Boolean).length : 0;
      setCheckTotal(total);
      setCheckDone(done);

      // Contacts
      const ctcts = contacts ? JSON.parse(contacts) : [];
      setContactCount(ctcts.length);

      // Import
      setImportDone(imported === "1");
    } catch (_) {}
  };

  const handleOnboardingComplete = async (action) => {
    await AsyncStorage.setItem(ONBOARDED_KEY, "true").catch(() => {});
    setShowOnboarding(false);
    // After onboarding ask for name
    const existing = await AsyncStorage.getItem(USER_NAME_KEY).catch(() => null);
    if (!existing) setShowNamePrompt(true);
    if (action === "import") navigation?.navigate?.("ImportTrip");
  };

  const saveName = async (name) => {
    setUserName(name);
    setShowNamePrompt(false);
    if (name) await AsyncStorage.setItem(USER_NAME_KEY, name).catch(() => {});
  };

  // Departure display
  const departureFmt = departureDateStr
    ? new Date(departureDateStr + "T00:00:00").toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" })
    : null;
  const checkPct = checkTotal > 0 ? Math.round((checkDone / checkTotal) * 100) : 0;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>

        {/* ── Hero — 60% screen height ── */}
        <View style={s.heroWrap}>
          <ImageBackground
            source={require("../assets/kaaba_mixed.png")}
            style={s.hero}
            imageStyle={s.heroImg}
          >
            <View style={s.heroScrim} />

            {/* Info button */}
            <TouchableOpacity style={s.infoBtn} onPress={() => setShowAbout(true)} activeOpacity={0.85}>
              <Text style={s.infoBtnTxt}>{"i"}</Text>
            </TouchableOpacity>

            {/* Greeting — bottom of hero */}
            <View style={s.heroGreeting}>
              <Text style={s.heroSalam}>{"As-sal\u0101mu \u02bfalaykum"}</Text>
              {userName ? (
                <Text style={s.heroName}>{userName}</Text>
              ) : (
                <Text style={s.heroNamePlaceholder}>{"Welcome to Safar"}</Text>
              )}
              <Text style={s.heroTagline}>{"Your companion for Umrah & Hajj"}</Text>
            </View>
          </ImageBackground>

          {/* ── Departure card — overlaps hero ── */}
          <View style={s.departureCard}>
            {daysAway !== null ? (
              <View style={s.departureInner}>
                {/* Left — countdown */}
                <TouchableOpacity style={s.departureDaysWrap}
                  onPress={() => navigation?.navigate?.("Journey")} activeOpacity={0.88}>
                  <Text style={s.departureDaysNum}>{daysAway}</Text>
                  <Text style={s.departureDaysLbl}>days until departure</Text>
                  {departureFmt ? <Text style={s.departureDateFmt}>{departureFmt}</Text> : null}
                </TouchableOpacity>

                <View style={s.departureDivider} />

                {/* Right — checklist progress */}
                <TouchableOpacity style={s.departureProgress}
                  onPress={() => navigation?.navigate?.("Journey")} activeOpacity={0.88}>
                  <Text style={s.departureProgressEyebrow}>PREPARATION</Text>
                  <Text style={s.departureProgressPct}>{checkPct}%</Text>
                  <View style={s.departureTrack}>
                    <View style={[s.departureFill, { width: checkPct + "%" }]} />
                  </View>
                  <Text style={s.departureProgressLbl}>{checkDone} of {checkTotal} done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* No departure set yet */
              <TouchableOpacity style={s.departureSetup}
                onPress={() => navigation?.navigate?.("Journey")} activeOpacity={0.88}>
                <View style={s.departureSetupLeft}>
                  <Text style={s.departureSetupTitle}>{"Set Your Departure Date"}</Text>
                  <Text style={s.departureSetupSub}>{"Add your trip dates to see your countdown and track preparation"}</Text>
                </View>
                <Text style={s.departureSetupArrow}>{"›"}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Content below hero ── */}
        <View style={s.content}>

          {/* ── Today's Du'a ── */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionLabel}>{"TODAY'S DU\u02BF\u0100"}</Text>
          </View>
          <View style={s.duaCard}>
            <Text style={s.duaArabic}>{dua.arabic}</Text>
            <Text style={s.duaTranslit}>{dua.transliteration}</Text>
            <Text style={s.duaTranslation}>{dua.translation}</Text>
            <Text style={s.duaRef}>{dua.ref}</Text>
            <View style={s.duaBtnRow}>
              <TouchableOpacity style={s.duaBtnPrimary}
                onPress={() => navigation?.navigate?.("Focus")} activeOpacity={0.88}>
                <Text style={s.duaBtnPrimaryTxt}>{"📿  Practise"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.duaBtnSecondary}
                onPress={() => navigation?.navigate?.("Duas")} activeOpacity={0.88}>
                <Text style={s.duaBtnSecondaryTxt}>{"Explore du\u02bf\u0101s"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── My Journey ── */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionLabel}>MY JOURNEY</Text>
          </View>
          <View style={s.journeyGrid}>
            {[
              { icon:"📖", label:"Guide",          sub:"Step-by-step rites",         screen:"Journey",    badge:null },
              { icon:"📍", label:"Sacred Places",  sub:"Sites & du\u02bf\u0101s",     screen:"Map",        badge:null },
              { icon:"✅", label:"Checklist",      sub:checkDone+"/"+checkTotal+" done", screen:"Journey", badge:checkPct < 100 ? checkTotal - checkDone : null },
              { icon:"📅", label:"My Calendar",    sub:"Dates & notes",               screen:"Journey",    badge:null },
            ].map((item, i) => (
              <TouchableOpacity key={i} style={s.journeyTile}
                onPress={() => navigation?.navigate?.(item.screen)} activeOpacity={0.88}>
                <View style={s.journeyTileIcon}>
                  <Text style={{ fontSize:22 }}>{item.icon}</Text>
                </View>
                <Text style={s.journeyTileLabel}>{item.label}</Text>
                <Text style={s.journeyTileSub}>{item.sub}</Text>
                {item.badge ? (
                  <View style={s.journeyBadge}>
                    <Text style={s.journeyBadgeTxt}>{item.badge}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>

          {/* ── My People ── */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionLabel}>MY PEOPLE</Text>
          </View>
          <View style={s.peopleRow}>
            <TouchableOpacity style={s.peopleCard}
              onPress={() => navigation?.navigate?.("MyContacts")} activeOpacity={0.88}>
              <ImageBackground source={require("../assets/contacts2.png")}
                style={s.peopleBg} imageStyle={s.peopleBgImg}>
                <View style={s.peopleScrim} />
                <View style={s.peopleContent}>
                  <Text style={s.peopleEyebrow}>CONTACTS</Text>
                  <Text style={s.peopleTitle}>My Contacts</Text>
                  <Text style={s.peopleSub}>
                    {contactCount > 0 ? contactCount + " saved" : "Add hotel, guide & more"}
                  </Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
            <TouchableOpacity style={s.peopleCard}
              onPress={() => navigation?.navigate?.("Groups")} activeOpacity={0.88}>
              <ImageBackground source={require("../assets/myboard.jpg")}
                style={s.peopleBg} imageStyle={s.peopleBgImg}>
                <View style={s.peopleScrim} />
                <View style={s.peopleContent}>
                  <Text style={s.peopleEyebrow}>COMMUNITY</Text>
                  <Text style={s.peopleTitle}>My Groups</Text>
                  <Text style={s.peopleSub}>Share milestones</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          </View>

          {/* ── Tools strip ── */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionLabel}>QUICK TOOLS</Text>
          </View>
          <View style={s.toolsRow}>
            <TouchableOpacity style={s.toolCard}
              onPress={() => navigation?.navigate?.("Focus")} activeOpacity={0.88}>
              <Text style={s.toolIcon}>📿</Text>
              <Text style={s.toolLabel}>Tasbeeh</Text>
              <Text style={s.toolSub}>Dhikr counter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.toolCard}
              onPress={() => navigation?.navigate?.("ImportTrip")} activeOpacity={0.88}>
              <Text style={s.toolIcon}>📄</Text>
              <Text style={s.toolLabel}>Quick Add</Text>
              <Text style={s.toolSub}>Import booking</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.toolCard}
              onPress={() => navigation?.navigate?.("PrayerTimes")} activeOpacity={0.88}>
              <Text style={s.toolIcon}>🕌</Text>
              <Text style={s.toolLabel}>Prayer Times</Text>
              <Text style={s.toolSub}>Today's salah</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.toolCard}
              onPress={() => navigation?.navigate?.("Qibla")} activeOpacity={0.88}>
              <Text style={s.toolIcon}>🧭</Text>
              <Text style={s.toolLabel}>Qibla</Text>
              <Text style={s.toolSub}>Find direction</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height:40 }} />
        </View>
      </ScrollView>

      <AboutModal visible={showAbout} onClose={() => setShowAbout(false)} />
      <NamePrompt visible={showNamePrompt} onSave={saveName} />
      <OnboardingCarousel
        visible={showOnboarding}
        onComplete={handleOnboardingComplete}
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:    { flex:1, backgroundColor:"#E8DDD0" },

  // ── Hero ──────────────────────────────────────────────────────────────────
  heroWrap: { position:"relative", marginBottom:0 },
  hero:     { height:HERO_H, justifyContent:"space-between" },
  heroImg:  { resizeMode:"cover" },
  heroScrim:{ ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(8,14,10,0.42)" },

  // Info button
  infoBtn:    { position:"absolute", top:16, right:20, width:34, height:34, borderRadius:17, backgroundColor:"rgba(255,255,255,0.18)", borderWidth:1, borderColor:"rgba(255,255,255,0.35)", alignItems:"center", justifyContent:"center" },
  infoBtnTxt: { fontSize:15, fontWeight:"700", color:"#fff", fontStyle:"italic" },

  // Greeting
  heroGreeting:      { position:"absolute", bottom:80, left:20, right:20 },
  heroSalam:         { fontSize:13, color:"rgba(255,255,255,0.72)", fontWeight:"500", letterSpacing:0.5, marginBottom:6 },
  heroName:          { fontFamily:SERIF, fontSize:36, color:"#fff", lineHeight:42, marginBottom:4 },
  heroNamePlaceholder:{ fontFamily:SERIF, fontSize:28, color:"#fff", lineHeight:34, marginBottom:4 },
  heroTagline:       { fontSize:14, color:"rgba(255,255,255,0.65)", fontWeight:"400" },

  // ── Departure card — overlaps hero ────────────────────────────────────────
  departureCard: {
    position:"absolute", bottom:-36, left:20, right:20,
    backgroundColor:"#FDFAF4", borderRadius:20, borderWidth:1, borderColor:"#C8BFB2",
    shadowColor:"#4A2E10", shadowOffset:{width:0,height:6}, shadowOpacity:0.20, shadowRadius:16, elevation:10,
    overflow:"hidden",
  },
  departureInner:    { flexDirection:"row", alignItems:"stretch" },
  departureDaysWrap: { flex:1, padding:18, alignItems:"center", justifyContent:"center" },
  departureDaysNum:  { fontFamily:SERIF, fontSize:52, color:"#1E3D30", lineHeight:56, fontWeight:"600" },
  departureDaysLbl:  { fontSize:12, color:"#5C534A", fontWeight:"600", textAlign:"center", marginTop:2 },
  departureDateFmt:  { fontSize:11, color:"#8A7D70", fontWeight:"500", textAlign:"center", marginTop:3 },
  departureDivider:  { width:1, backgroundColor:"#E8E0D0", marginVertical:16 },
  departureProgress: { flex:1, padding:18, justifyContent:"center" },
  departureProgressEyebrow:{ fontSize:9, fontWeight:"800", letterSpacing:2, color:"#3B6B58", marginBottom:6 },
  departureProgressPct:    { fontFamily:SERIF, fontSize:28, color:"#1E3D30", lineHeight:32, fontWeight:"600" },
  departureTrack:    { height:4, backgroundColor:"#E8E0D0", borderRadius:2, marginTop:6, marginBottom:4, overflow:"hidden" },
  departureFill:     { height:"100%", backgroundColor:"#1E3D30", borderRadius:2 },
  departureProgressLbl:    { fontSize:11, color:"#8A7D70", fontWeight:"500" },
  // No departure set
  departureSetup:    { flexDirection:"row", alignItems:"center", padding:18, gap:12 },
  departureSetupLeft:{ flex:1 },
  departureSetupTitle:{ fontFamily:SERIF, fontSize:16, color:"#100E0A", marginBottom:4 },
  departureSetupSub: { fontSize:13, color:"#5C534A", fontWeight:"500", lineHeight:18 },
  departureSetupArrow:{ fontSize:26, color:"#C8BFB2" },

  // ── Content ───────────────────────────────────────────────────────────────
  content: { paddingTop:56, paddingHorizontal:20 }, // 56 = departure card height / 2

  sectionHeader:  { marginBottom:12, marginTop:24 },
  sectionLabel:   { fontSize:10, fontWeight:"800", letterSpacing:2.5, color:"#1E3D30" },

  // ── Today's Du'a ──────────────────────────────────────────────────────────
  duaCard: {
    backgroundColor:"#FDFAF4", borderRadius:18, borderWidth:1, borderColor:"#C8BFB2",
    padding:20, shadowColor:"#4A2E10", shadowOffset:{width:0,height:4},
    shadowOpacity:0.16, shadowRadius:10, elevation:5,
  },
  duaArabic:      { fontFamily:SERIF, fontSize:22, color:"#100E0A", textAlign:"center", lineHeight:36, marginBottom:12 },
  duaTranslit:    { fontSize:13, color:"#5C534A", fontStyle:"italic", textAlign:"center", marginBottom:8, lineHeight:20 },
  duaTranslation: { fontFamily:SERIF, fontSize:15, color:"#100E0A", textAlign:"center", lineHeight:22, marginBottom:8 },
  duaRef:         { fontSize:11, color:"#8A7D70", fontWeight:"500", textAlign:"center", marginBottom:16 },
  duaBtnRow:      { flexDirection:"row", gap:10 },
  duaBtnPrimary:  { flex:1, backgroundColor:"#1E3D30", borderRadius:12, paddingVertical:13, alignItems:"center", shadowColor:"#4A2E10", shadowOffset:{width:0,height:3}, shadowOpacity:0.20, shadowRadius:8, elevation:4 },
  duaBtnPrimaryTxt:{ fontFamily:SERIF, fontSize:15, color:"#fff", fontWeight:"600" },
  duaBtnSecondary: { flex:1, backgroundColor:"#F5EDE0", borderRadius:12, paddingVertical:13, alignItems:"center", borderWidth:1, borderColor:"#C8BFB2" },
  duaBtnSecondaryTxt:{ fontFamily:SERIF, fontSize:15, color:"#1E3D30", fontWeight:"500" },

  // ── Journey grid ──────────────────────────────────────────────────────────
  journeyGrid:    { flexDirection:"row", flexWrap:"wrap", gap:10 },
  journeyTile:    {
    width:(SW - 40 - 10) / 2, backgroundColor:"#FDFAF4",
    borderRadius:16, borderWidth:1, borderColor:"#C8BFB2",
    padding:16, shadowColor:"#4A2E10", shadowOffset:{width:0,height:3},
    shadowOpacity:0.14, shadowRadius:8, elevation:4, position:"relative",
  },
  journeyTileIcon:{ width:44, height:44, borderRadius:22, backgroundColor:"#EAF0EC", alignItems:"center", justifyContent:"center", marginBottom:10 },
  journeyTileLabel:{ fontFamily:SERIF, fontSize:16, color:"#100E0A", fontWeight:"600", marginBottom:3 },
  journeyTileSub: { fontSize:12, color:"#5C534A", fontWeight:"500", lineHeight:17 },
  journeyBadge:   { position:"absolute", top:12, right:12, backgroundColor:"#B8922A", borderRadius:10, minWidth:20, height:20, alignItems:"center", justifyContent:"center", paddingHorizontal:5 },
  journeyBadgeTxt:{ fontSize:11, color:"#fff", fontWeight:"700" },

  // ── My People ─────────────────────────────────────────────────────────────
  peopleRow:     { flexDirection:"row", gap:10 },
  peopleCard:    { flex:1, borderRadius:16, overflow:"hidden", height:140, shadowColor:"#4A2E10", shadowOffset:{width:0,height:4}, shadowOpacity:0.18, shadowRadius:10, elevation:6 },
  peopleBg:      { flex:1 },
  peopleBgImg:   { resizeMode:"cover" },
  peopleScrim:   { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(6,14,8,0.50)" },
  peopleContent: { position:"absolute", bottom:0, left:0, right:0, padding:14 },
  peopleEyebrow: { fontSize:8, fontWeight:"800", letterSpacing:2, color:"#C8A96A", marginBottom:3 },
  peopleTitle:   { fontFamily:SERIF, fontSize:16, color:"#fff", marginBottom:2, fontWeight:"600" },
  peopleSub:     { fontSize:12, color:"rgba(255,255,255,0.78)", fontWeight:"500" },

  // ── Tools strip ───────────────────────────────────────────────────────────
  toolsRow:  { flexDirection:"row", gap:8 },
  toolCard:  {
    flex:1, backgroundColor:"#FDFAF4", borderRadius:14, borderWidth:1, borderColor:"#C8BFB2",
    paddingVertical:14, paddingHorizontal:8, alignItems:"center", gap:5,
    shadowColor:"#4A2E10", shadowOffset:{width:0,height:2}, shadowOpacity:0.12, shadowRadius:6, elevation:3,
  },
  toolIcon:  { fontSize:22 },
  toolLabel: { fontFamily:SERIF, fontSize:13, color:"#100E0A", fontWeight:"600", textAlign:"center" },
  toolSub:   { fontSize:10, color:"#5C534A", fontWeight:"500", textAlign:"center" },
});
