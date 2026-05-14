/**
 * HomeScreen.jsx — Safar
 */
import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  ImageBackground, StyleSheet, Dimensions, Modal,
  TextInput, KeyboardAvoidingView, Platform, FlatList,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OnboardingCarousel from "../components/OnboardingCarousel";

const SERIF = "SourceSerif4-Regular";
const { width: SW, height: SH } = Dimensions.get("window");
const HERO_H = Math.round(SH * 0.60);

const ONBOARDED_KEY   = "safar_onboarded_v1";
const DEPARTURE_KEY   = "safar_departure_date_v1";
const UMRAH_CHECK_KEY = "safar_umrah_checklist_v1";
const CHECK_DONE_KEY  = "safar_checklist_done_v1";
const CONTACTS_KEY    = "safar_journey_contacts_v1";
const USER_NAME_KEY   = "safar_user_name_v1";

const HERO_SLIDES = [
  { img:require("../assets/kaaba_mixed.png"),     tag:"UMRAH & HAJJ",    headline:"Your companion\nfor the journey",           sub:"Everything you need, in one place" },
  { img:require("../assets/kaaba_map.png"),        tag:"SACRED PLACES",   headline:"Every site.\nEvery du\u02bf\u0101.",                 sub:"Explore with location-specific du\u02bf\u0101s" },
  { img:require("../assets/checklist_kaaba.jpg"),  tag:"PREPARATION",     headline:"Plan every step\nwith confidence",           sub:"Personalised checklist, calendar and guide" },
  { img:require("../assets/tab_my_lists.jpg"),     tag:"DU\u02BF\u0100S",           headline:"Authenticated du\u02bf\u0101s\nfor every moment",    sub:"Verified from major collections. Audio included." },
  { img:require("../assets/journey3.png"),         tag:"STEP-BY-STEP",    headline:"Your guide through\nevery rite",             sub:"Tawaf, Sa\u02bfy, Wuquf and every act of worship" },
];

const DAILY_DUAS = [
  { arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0625\u0646\u0651\u0650\u064a \u0623\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e \u0627\u0644\u0652\u0639\u064e\u0641\u0652\u0648\u064e \u0648\u064e\u0627\u0644\u0652\u0639\u064e\u0627\u0641\u0650\u064a\u064e\u0629\u064e", transliteration:"Allahumma inni as'alukal-'afwa wal-'afiyah", translation:"O Allah, I ask You for pardon and well-being.", ref:"Ibn Majah" },
  { arabic:"\u0631\u064e\u0628\u0651\u064e\u0646\u064e\u0627 \u0622\u062a\u0650\u0646\u064e\u0627 \u0641\u0650\u064a \u0627\u0644\u062f\u0651\u064f\u0646\u0652\u064a\u064e\u0627 \u062d\u064e\u0633\u064e\u0646\u064e\u0629\u064b \u0648\u064e\u0641\u0650\u064a \u0627\u0644\u0652\u0622\u062e\u0650\u0631\u064e\u0629\u0650 \u062d\u064e\u0633\u064e\u0646\u064e\u0629\u064b", transliteration:"Rabbana atina fid-dunya hasanah", translation:"Our Lord, give us good in this world and in the Hereafter.", ref:"Al-Baqarah 2:201" },
  { arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0623\u064e\u0639\u0650\u0646\u0651\u0650\u064a \u0639\u064e\u0644\u064e\u0649 \u0630\u0650\u0643\u0652\u0631\u0650\u0643\u064e \u0648\u064e\u0634\u064f\u0643\u0652\u0631\u0650\u0643\u064e \u0648\u064e\u062d\u064f\u0633\u0652\u0646\u0650 \u0639\u0650\u0628\u064e\u0627\u062f\u064e\u062a\u0650\u0643\u064e", transliteration:"Allahumma a'inni 'ala dhikrika wa shukrika", translation:"O Allah, help me to remember You, be grateful to You, and worship You well.", ref:"Abu Dawud" },
  { arabic:"\u0633\u064f\u0628\u0652\u062d\u064e\u0627\u0646\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0648\u064e\u0628\u0650\u062d\u064e\u0645\u0652\u062f\u0650\u0647\u0650 \u0633\u064f\u0628\u0652\u062d\u064e\u0627\u0646\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0627\u0644\u0652\u0639\u064e\u0638\u0650\u064a\u0645\u0650", transliteration:"Subhanallahi wa bihamdihi, Subhanallahil-'Azim", translation:"Glory be to Allah and His is the praise; Glory be to Allah the Mighty.", ref:"Al-Bukhari" },
  { arabic:"\u062d\u064e\u0633\u0652\u0628\u0650\u064a\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0644\u064e\u0627 \u0625\u0650\u0644\u064e\u0670\u0647\u064e \u0625\u0650\u0644\u0651\u064e\u0627 \u0647\u064f\u0648\u064e \u0639\u064e\u0644\u064e\u064a\u0652\u0647\u0650 \u062a\u064e\u0648\u064e\u0643\u0651\u064e\u0644\u0652\u062a\u064f", transliteration:"Hasbiyallahu la ilaha illa hu, 'alayhi tawakkaltu", translation:"Allah is sufficient for me; there is no god but He. In Him I put my trust.", ref:"At-Tawbah 9:129" },
];
const getDailyDua = () => DAILY_DUAS[Math.floor(Date.now() / 86400000) % DAILY_DUAS.length];

// ── Name prompt ───────────────────────────────────────────────────────────────
function NamePrompt({ visible, onSave }) {
  const [name, setName] = useState("");
  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView style={np.overlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={np.card}>
          <Text style={np.title}>{"As-sal\u0101mu \u02bfalaykum"}</Text>
          <Text style={np.sub}>What would you like us to call you?</Text>
          <TextInput style={np.input} placeholder="Your name" placeholderTextColor="#9A8E7A"
            value={name} onChangeText={setName} autoFocus returnKeyType="done"
            onSubmitEditing={() => name.trim() && onSave(name.trim())} />
          <TouchableOpacity style={[np.btn, !name.trim() && np.btnDisabled]}
            onPress={() => name.trim() && onSave(name.trim())} activeOpacity={0.85}>
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
        <View style={ab.card}>
          <Text style={ab.icon}>{"🕌"}</Text>
          <Text style={ab.title}>What is Safar?</Text>
          <Text style={ab.body}>{"Safar is your step-by-step companion for Umrah and Hajj \u2014 from the moment you decide to go, to the day you return.\n\nPlan your journey, practise du\u02bf\u0101s, explore sacred places, and stay connected with your travel companions.\n\nMay Allah accept your journey. \uD83C\uDF3F"}</Text>
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
  const scrollRef  = useRef(null);
  const heroRef    = useRef(null);
  const heroTimer  = useRef(null);

  const [userName,       setUserName]       = useState("");
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [showAbout,      setShowAbout]      = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [heroSlide,      setHeroSlide]      = useState(0);
  const [daysAway,       setDaysAway]       = useState(null);
  const [departureDateStr, setDepartureDateStr] = useState(null);
  const [checkTotal,     setCheckTotal]     = useState(10);
  const [checkDone,      setCheckDone]      = useState(0);
  const [contactCount,   setContactCount]   = useState(0);
  const dua = getDailyDua();

  useFocusEffect(React.useCallback(() => {
    scrollRef.current?.scrollTo?.({ y:0, animated:false });
    loadData();
    startCarousel();
    return () => clearInterval(heroTimer.current);
  }, []));

  const startCarousel = () => {
    clearInterval(heroTimer.current);
    heroTimer.current = setInterval(() => {
      setHeroSlide(prev => {
        const next = (prev + 1) % HERO_SLIDES.length;
        heroRef.current?.scrollToIndex?.({ index:next, animated:true });
        return next;
      });
    }, 5000);
  };

  const loadData = async () => {
    try {
      const [name, onboarded, departure, checkItems, checkDoneRaw, contacts] =
        await Promise.all([
          AsyncStorage.getItem(USER_NAME_KEY),
          AsyncStorage.getItem(ONBOARDED_KEY),
          AsyncStorage.getItem(DEPARTURE_KEY),
          AsyncStorage.getItem(UMRAH_CHECK_KEY),
          AsyncStorage.getItem(CHECK_DONE_KEY),
          AsyncStorage.getItem(CONTACTS_KEY),
        ]);
      if (name) setUserName(name);
      if (onboarded !== "true") setShowOnboarding(true);
      if (departure) {
        setDepartureDateStr(departure);
        const d = new Date(departure + "T00:00:00");
        setDaysAway(Math.max(0, Math.ceil((d - new Date()) / 86400000)));
      }
      const items = checkItems ? JSON.parse(checkItems) : null;
      setCheckTotal(items ? items.length : 10);
      setCheckDone(checkDoneRaw ? Object.values(JSON.parse(checkDoneRaw)).filter(Boolean).length : 0);
      setContactCount(contacts ? JSON.parse(contacts).length : 0);
    } catch (_) {}
  };

  const handleOnboardingComplete = async (action) => {
    await AsyncStorage.setItem(ONBOARDED_KEY, "true").catch(() => {});
    setShowOnboarding(false);
    const existing = await AsyncStorage.getItem(USER_NAME_KEY).catch(() => null);
    if (!existing) setShowNamePrompt(true);
    if (action === "import") navigation?.navigate?.("ImportTrip");
  };

  const saveName = async (name) => {
    setUserName(name);
    setShowNamePrompt(false);
    if (name) await AsyncStorage.setItem(USER_NAME_KEY, name).catch(() => {});
  };

  const departureFmt = departureDateStr
    ? new Date(departureDateStr + "T00:00:00").toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" })
    : null;
  const checkPct = checkTotal > 0 ? Math.round((checkDone / checkTotal) * 100) : 0;

  const SectionRow = ({ label }) => (
    <View style={s.sectionRow}>
      <View style={s.sectionBar} />
      <Text style={s.sectionLabel}>{label}</Text>
      <View style={s.sectionLine} />
    </View>
  );

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>

        {/* ── HERO CAROUSEL ── */}
        <View style={s.heroWrap}>

          {/* Slides — fills heroWrap */}
          <FlatList
            ref={heroRef}
            data={HERO_SLIDES}
            horizontal pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            getItemLayout={(_, i) => ({ length:SW, offset:SW*i, index:i })}
            style={StyleSheet.absoluteFill}
            onMomentumScrollEnd={e => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SW);
              setHeroSlide(idx);
              startCarousel();
            }}
            renderItem={({ item }) => (
              <View style={{ width:SW, height:HERO_H }}>
                <ImageBackground source={item.img}
                  style={StyleSheet.absoluteFill}
                  imageStyle={{ resizeMode:"cover" }}>
                  <View style={s.heroScrim} />
                  {/* Feature text — bottom third of slide */}
                  <View style={s.slideContent}>
                    <Text style={s.slideTag}>{item.tag}</Text>
                    <Text style={s.slideHeadline}>{item.headline}</Text>
                    <Text style={s.slideSub}>{item.sub}</Text>
                  </View>
                </ImageBackground>
              </View>
            )}
          />

          {/* Top-left: salam + welcome — fixed overlay */}
          <View style={s.heroTopLeft} pointerEvents="none">
            <Text style={s.heroSalam}>{"As-sal\u0101mu \u02bfalaykum"}</Text>
            <Text style={s.heroWelcome}>{"Welcome to Safar"}</Text>
          </View>

          {/* Top-right: info button */}
          <TouchableOpacity style={s.infoBtn} onPress={() => setShowAbout(true)} activeOpacity={0.85}>
            <Text style={s.infoBtnTxt}>{"i"}</Text>
          </TouchableOpacity>

          {/* Bottom: greeting — sits just above dot indicators */}
          <View style={s.heroGreeting} pointerEvents="none">
            {userName ? (
              <Text style={s.heroName}>{userName}</Text>
            ) : null}
          </View>

          {/* Dot indicators — bottom centre, always visible */}
          <View style={s.heroDots} pointerEvents="box-none">
            {HERO_SLIDES.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => {
                heroRef.current?.scrollToIndex?.({ index:i, animated:true });
                setHeroSlide(i);
                startCarousel();
              }} hitSlop={{top:10,bottom:10,left:6,right:6}}>
                <View style={i === heroSlide ? [s.heroDot, s.heroDotActive] : s.heroDot} />
              </TouchableOpacity>
            ))}
          </View>

        </View>
        {/* END HERO */}

        {/* ── CARD LABEL ── */}
        <View style={s.cardLabel}>
          <Text style={s.cardLabelTxt}>
            {daysAway !== null
              ? "Your countdown and preparation — tap to view your journey"
              : "Set up your trip to see your countdown and preparation"}
          </Text>
        </View>

        {/* ── DEPARTURE CARD ── */}
        <View style={s.departureCard}>
          {daysAway !== null ? (
            <View style={s.departureInner}>
              <TouchableOpacity style={s.departureDaysWrap}
                onPress={() => navigation?.navigate?.("Journey")} activeOpacity={0.88}>
                <Text style={s.departureDaysNum}>{daysAway}</Text>
                <Text style={s.departureDaysLbl}>days until departure</Text>
                {departureFmt ? <Text style={s.departureDateFmt}>{departureFmt}</Text> : null}
              </TouchableOpacity>
              <View style={s.departureDivider} />
              <TouchableOpacity style={s.departureProgress}
                onPress={() => navigation?.navigate?.("Journey")} activeOpacity={0.88}>
                <Text style={s.departureProgressEyebrow}>PREPARATION</Text>
                <Text style={s.departureProgressPct}>{checkPct}%</Text>
                <View style={s.departureTrack}>
                  <View style={[s.departureFill, { width: checkPct + "%" }]} />
                </View>
                <Text style={s.departureProgressLbl}>{checkDone} of {checkTotal} done</Text>
                <View style={s.departureProgressCta}>
                  <Text style={s.departureProgressCtaTxt}>
                    {checkPct === 0 ? "Create your plan" : "Track your progress"}
                  </Text>
                  <View style={s.departureProgressArrow}>
                    <Text style={s.departureProgressArrowTxt}>{"›"}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={s.departureSetup}
              onPress={() => navigation?.navigate?.("Journey")} activeOpacity={0.88}>
              <View style={s.departureSetupLeft}>
                <Text style={s.departureSetupTitle}>{"Set Your Departure Date"}</Text>
                <Text style={s.departureSetupSub}>{"Add your trip dates to see your countdown and preparation"}</Text>
              </View>
              <Text style={s.departureSetupArrow}>{"›"}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── CONTENT ── */}
        <View style={s.content}>

          {/* Today's Du'a */}
          <SectionRow label={"TODAY'S DU\u02BF\u0100"} />
          <View style={s.duaCard}>
            <Text style={s.duaArabic}>{dua.arabic}</Text>
            <Text style={s.duaTranslit}>{dua.transliteration}</Text>
            <Text style={s.duaTranslation}>{dua.translation}</Text>
            <Text style={s.duaRef}>{dua.ref}</Text>
            <View style={s.duaBtnRow}>
              <TouchableOpacity style={s.duaBtnPrimary}
                onPress={() => navigation?.navigate?.("Focus")} activeOpacity={0.88}>
                <Text style={s.duaBtnPrimaryTxt}>{"Practise"}</Text>
                <View style={s.duaBtnArrow}><Text style={s.duaBtnArrowTxt}>{"›"}</Text></View>
              </TouchableOpacity>
              <TouchableOpacity style={s.duaBtnSecondary}
                onPress={() => navigation?.navigate?.("Duas")} activeOpacity={0.88}>
                <Text style={s.duaBtnSecondaryTxt}>{"Explore du\u02bf\u0101s"}</Text>
                <View style={[s.duaBtnArrow, s.duaBtnArrowDark]}><Text style={[s.duaBtnArrowTxt, s.duaBtnArrowTxtDark]}>{"›"}</Text></View>
              </TouchableOpacity>
            </View>
          </View>

          {/* My Journey */}
          <SectionRow label="MY JOURNEY" />
          <View style={s.journeyGrid}>
            {[
              { img:require("../assets/kaaba_mixed.png"),     label:"Guide",         sub:"Step-by-step rites",            screen:"Journey" },
              { img:require("../assets/kaaba_map.png"),       label:"Sacred Places", sub:"Sites & du\u02bf\u0101s",       screen:"Map" },
              { img:require("../assets/checklist_kaaba.jpg"), label:"Checklist",     sub:checkDone+"/"+checkTotal+" done",screen:"Journey", badge:checkPct < 100 ? checkTotal-checkDone : null },
              { img:require("../assets/journey3.png"),        label:"My Calendar",   sub:"Dates & notes",                 screen:"Journey" },
            ].map((item, i) => (
              <TouchableOpacity key={i} style={s.journeyTile}
                onPress={() => navigation?.navigate?.(item.screen)} activeOpacity={0.88}>
                <ImageBackground source={item.img} style={StyleSheet.absoluteFill}
                  imageStyle={{ resizeMode:"cover" }}>
                  <View style={s.journeyTileScrim} />
                </ImageBackground>
                {item.badge ? (
                  <View style={s.journeyBadge}><Text style={s.journeyBadgeTxt}>{item.badge}</Text></View>
                ) : null}
                <View style={s.journeyTileContent}>
                  <Text style={s.journeyTileLabel}>{item.label}</Text>
                  <Text style={s.journeyTileSub}>{item.sub}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* My People */}
          <SectionRow label="MY PEOPLE" />
          <View style={s.peopleRow}>
            {[
              { img:require("../assets/contacts2.png"),  eyebrow:"CONTACTS",  title:"My Contacts", sub:contactCount > 0 ? contactCount+" saved" : "Hotel, guide & more", screen:"MyContacts", scrim:0.50 },
              { img:require("../assets/myboard.jpg"),    eyebrow:"COMMUNITY", title:"My Groups",   sub:"Share milestones",                                                screen:"Groups",     scrim:0.45 },
            ].map((item, i) => (
              <TouchableOpacity key={i} style={s.peopleCard}
                onPress={() => navigation?.navigate?.(item.screen)} activeOpacity={0.88}>
                <ImageBackground source={item.img} style={StyleSheet.absoluteFill}
                  imageStyle={{ resizeMode:"cover" }}>
                  <View style={[s.peopleScrim, { backgroundColor:`rgba(6,14,8,${item.scrim})` }]} />
                </ImageBackground>
                <View style={s.peopleContent}>
                  <Text style={s.peopleEyebrow}>{item.eyebrow}</Text>
                  <Text style={s.peopleTitle}>{item.title}</Text>
                  <Text style={s.peopleSub}>{item.sub}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Tools */}
          <SectionRow label="QUICK TOOLS" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.toolsScroll}>
            {[
              { img:require("../assets/checklist_kaaba.jpg"), label:"Tasbeeh",      sub:"Dhikr counter",   screen:"Focus" },
              { img:require("../assets/tab_dua_library.jpg"), label:"Quick Add",    sub:"Import booking",  screen:"ImportTrip" },
              { img:require("../assets/kaaba_map.png"),       label:"Prayer Times", sub:"Today's salah",   screen:"PrayerTimes" },
              { img:require("../assets/medina.png"),          label:"Qibla",        sub:"Find direction",  screen:"Qibla" },
              { img:require("../assets/journey3.png"),        label:"What to Expect",sub:"Plan your trip", screen:"WhatToExpect" },
            ].map((tool, i) => (
              <TouchableOpacity key={i} style={s.toolPill}
                onPress={() => navigation?.navigate?.(tool.screen)} activeOpacity={0.88}>
                <ImageBackground source={tool.img} style={StyleSheet.absoluteFill}
                  imageStyle={{ resizeMode:"cover" }}>
                  <View style={s.toolScrim} />
                </ImageBackground>
                <View style={s.toolContent}>
                  <Text style={s.toolLabel}>{tool.label}</Text>
                  <Text style={s.toolSub}>{tool.sub}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={{ height:40 }} />
        </View>

      </ScrollView>

      <AboutModal visible={showAbout} onClose={() => setShowAbout(false)} />
      <NamePrompt visible={showNamePrompt} onSave={saveName} />
      <OnboardingCarousel visible={showOnboarding} onComplete={handleOnboardingComplete} />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex:1, backgroundColor:"#E8DDD0" },

  // Hero
  heroWrap:       { height:HERO_H, position:"relative", overflow:"hidden" },
  heroScrim:      { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(8,14,10,0.45)" },
  heroTopLeft:    { position:"absolute", top:18, left:20 },
  heroSalam:      { fontSize:13, color:"rgba(255,255,255,0.78)", fontWeight:"500", letterSpacing:0.3 },
  heroWelcome:    { fontSize:12, color:"rgba(255,255,255,0.55)", fontWeight:"400" },
  infoBtn:        { position:"absolute", top:16, right:20, width:34, height:34, borderRadius:17, backgroundColor:"rgba(255,255,255,0.18)", borderWidth:1, borderColor:"rgba(255,255,255,0.35)", alignItems:"center", justifyContent:"center" },
  infoBtnTxt:     { fontSize:15, fontWeight:"700", color:"#fff", fontStyle:"italic" },
  heroGreeting:   { position:"absolute", bottom:52, left:20 },
  heroName:       { fontFamily:SERIF, fontSize:32, color:"#fff", lineHeight:38 },
  // Slide feature text — bottom of each slide
  slideContent:   { position:"absolute", bottom:56, left:20, right:20 },
  slideTag:       { fontSize:10, fontWeight:"800", letterSpacing:2.5, color:"rgba(200,169,106,0.95)", marginBottom:8 },
  slideHeadline:  { fontFamily:SERIF, fontSize:28, color:"#fff", lineHeight:35 },
  slideSub:       { fontSize:13, color:"rgba(255,255,255,0.70)", fontWeight:"500", marginTop:5, lineHeight:18 },
  // Dots — above departure card
  heroDots:       { position:"absolute", bottom:16, left:0, right:0, flexDirection:"row", justifyContent:"center", gap:7, alignItems:"center" },
  heroDot:        { width:7, height:7, borderRadius:4, backgroundColor:"rgba(255,255,255,0.35)", borderWidth:1, borderColor:"rgba(255,255,255,0.55)" },
  heroDotActive:  { width:24, height:7, borderRadius:4, backgroundColor:"#fff", borderWidth:0 },

  // Card label
  cardLabel:      { paddingHorizontal:20, paddingTop:12, paddingBottom:5 },
  cardLabelTxt:   { fontSize:13, color:"#5C534A", fontWeight:"500" },

  // Departure card — normal flow, full width
  departureCard:  { marginHorizontal:20, backgroundColor:"#FDFAF4", borderRadius:20, borderWidth:1, borderColor:"#C8BFB2", shadowColor:"#4A2E10", shadowOffset:{width:0,height:6}, shadowOpacity:0.20, shadowRadius:16, elevation:10, overflow:"hidden", marginBottom:4 },
  departureInner: { flexDirection:"row", alignItems:"stretch" },
  departureDaysWrap:{ flex:1, padding:18, alignItems:"center", justifyContent:"center" },
  departureDaysNum: { fontFamily:SERIF, fontSize:52, color:"#1E3D30", lineHeight:56, fontWeight:"600" },
  departureDaysLbl: { fontSize:12, color:"#5C534A", fontWeight:"600", textAlign:"center", marginTop:2 },
  departureDateFmt: { fontSize:11, color:"#8A7D70", fontWeight:"500", textAlign:"center", marginTop:3 },
  departureDivider: { width:1, backgroundColor:"#E8E0D0", marginVertical:16 },
  departureProgress:{ flex:1, padding:18, justifyContent:"center" },
  departureProgressEyebrow:{ fontSize:9, fontWeight:"800", letterSpacing:2, color:"#3B6B58", marginBottom:6 },
  departureProgressPct:    { fontFamily:SERIF, fontSize:28, color:"#1E3D30", lineHeight:32, fontWeight:"600" },
  departureTrack:    { height:4, backgroundColor:"#E8E0D0", borderRadius:2, marginTop:6, marginBottom:4, overflow:"hidden" },
  departureFill:     { height:"100%", backgroundColor:"#1E3D30", borderRadius:2 },
  departureProgressLbl:    { fontSize:11, color:"#8A7D70", fontWeight:"500" },
  departureProgressCta:    { flexDirection:"row", alignItems:"center", gap:6, marginTop:8 },
  departureProgressCtaTxt: { fontSize:13, color:"#1E3D30", fontWeight:"600", flex:1 },
  departureProgressArrow:  { width:20, height:20, borderRadius:10, borderWidth:1.5, borderColor:"#1E3D30", alignItems:"center", justifyContent:"center" },
  departureProgressArrowTxt:{ fontSize:12, color:"#1E3D30", fontWeight:"700", lineHeight:14 },
  departureSetup:    { flexDirection:"row", alignItems:"center", padding:18, gap:12 },
  departureSetupLeft:{ flex:1 },
  departureSetupTitle:{ fontFamily:SERIF, fontSize:16, color:"#100E0A", marginBottom:4 },
  departureSetupSub: { fontSize:13, color:"#5C534A", fontWeight:"500", lineHeight:18 },
  departureSetupArrow:{ fontSize:26, color:"#C8BFB2" },

  // Content
  content:        { paddingHorizontal:20, paddingTop:16 },
  sectionRow:     { flexDirection:"row", alignItems:"center", gap:10, marginBottom:12, marginTop:22 },
  sectionBar:     { width:3, height:18, borderRadius:2, backgroundColor:"#1E3D30" },
  sectionLine:    { flex:1, height:1, backgroundColor:"#C8BFB2" },
  sectionLabel:   { fontFamily:SERIF, fontSize:16, fontWeight:"700", color:"#1E3D30" },

  // Du'a card
  duaCard:        { backgroundColor:"#FDFAF4", borderRadius:18, borderWidth:1, borderColor:"#C8BFB2", padding:20, shadowColor:"#4A2E10", shadowOffset:{width:0,height:4}, shadowOpacity:0.16, shadowRadius:10, elevation:5 },
  duaArabic:      { fontFamily:SERIF, fontSize:22, color:"#100E0A", textAlign:"center", lineHeight:36, marginBottom:12 },
  duaTranslit:    { fontSize:13, color:"#5C534A", fontStyle:"italic", textAlign:"center", marginBottom:8, lineHeight:20 },
  duaTranslation: { fontFamily:SERIF, fontSize:15, color:"#100E0A", textAlign:"center", lineHeight:22, marginBottom:8 },
  duaRef:         { fontSize:11, color:"#8A7D70", fontWeight:"500", textAlign:"center", marginBottom:16 },
  duaBtnRow:      { flexDirection:"row", gap:10 },
  duaBtnPrimary:  { flex:1, backgroundColor:"#1E3D30", borderRadius:12, paddingVertical:13, paddingHorizontal:16, flexDirection:"row", alignItems:"center", justifyContent:"space-between", shadowColor:"#4A2E10", shadowOffset:{width:0,height:3}, shadowOpacity:0.20, shadowRadius:8, elevation:4 },
  duaBtnPrimaryTxt:{ fontFamily:SERIF, fontSize:15, color:"#fff", fontWeight:"600" },
  duaBtnSecondary: { flex:1, backgroundColor:"#F5EDE0", borderRadius:12, paddingVertical:13, paddingHorizontal:16, flexDirection:"row", alignItems:"center", justifyContent:"space-between", borderWidth:1, borderColor:"#C8BFB2" },
  duaBtnSecondaryTxt:{ fontFamily:SERIF, fontSize:15, color:"#1E3D30", fontWeight:"500" },
  duaBtnArrow:    { width:26, height:26, borderRadius:13, borderWidth:1.5, borderColor:"rgba(255,255,255,0.45)", alignItems:"center", justifyContent:"center" },
  duaBtnArrowDark:{ borderColor:"#1E3D30" },
  duaBtnArrowTxt: { fontSize:15, color:"rgba(255,255,255,0.9)", fontWeight:"700", lineHeight:17 },
  duaBtnArrowTxtDark:{ color:"#1E3D30" },

  // Journey grid
  journeyGrid:    { flexDirection:"row", flexWrap:"wrap", gap:10 },
  journeyTile:    { width:(SW-40-10)/2, height:130, borderRadius:20, overflow:"hidden", shadowColor:"#4A2E10", shadowOffset:{width:0,height:5}, shadowOpacity:0.22, shadowRadius:12, elevation:7 },
  journeyTileScrim:{ ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(6,12,8,0.52)" },
  journeyTileContent:{ position:"absolute", bottom:0, left:0, right:0, padding:13 },
  journeyTileLabel:{ fontFamily:SERIF, fontSize:15, color:"#fff", fontWeight:"600", marginBottom:2 },
  journeyTileSub: { fontSize:11, color:"rgba(255,255,255,0.78)", fontWeight:"500" },
  journeyBadge:   { position:"absolute", top:12, right:12, backgroundColor:"#B8922A", borderRadius:10, minWidth:20, height:20, alignItems:"center", justifyContent:"center", paddingHorizontal:5 },
  journeyBadgeTxt:{ fontSize:11, color:"#fff", fontWeight:"700" },

  // People
  peopleRow:      { flexDirection:"row", gap:10 },
  peopleCard:     { flex:1, height:140, borderRadius:16, overflow:"hidden", shadowColor:"#4A2E10", shadowOffset:{width:0,height:4}, shadowOpacity:0.18, shadowRadius:10, elevation:6 },
  peopleScrim:    { ...StyleSheet.absoluteFillObject },
  peopleContent:  { position:"absolute", bottom:0, left:0, right:0, padding:14 },
  peopleEyebrow:  { fontSize:8, fontWeight:"800", letterSpacing:2, color:"#C8A96A", marginBottom:3 },
  peopleTitle:    { fontFamily:SERIF, fontSize:16, color:"#fff", marginBottom:2, fontWeight:"600" },
  peopleSub:      { fontSize:12, color:"rgba(255,255,255,0.78)", fontWeight:"500" },

  // Quick tools
  toolsScroll:    { paddingBottom:4, gap:10, paddingRight:4 },
  toolPill:       { width:140, height:100, borderRadius:20, overflow:"hidden", shadowColor:"#4A2E10", shadowOffset:{width:0,height:5}, shadowOpacity:0.22, shadowRadius:12, elevation:7 },
  toolScrim:      { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(6,12,8,0.55)" },
  toolContent:    { position:"absolute", bottom:0, left:0, right:0, padding:14 },
  toolLabel:      { fontFamily:SERIF, fontSize:15, color:"#fff", fontWeight:"600", marginBottom:2 },
  toolSub:        { fontSize:11, color:"rgba(255,255,255,0.75)", fontWeight:"500" },
});
