/**
 * DhikrScreen.jsx — Safar
 * Clean dhikr counter. Low cognitive load.
 */
import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView, View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Modal, TouchableWithoutFeedback, Animated,
  TextInput, KeyboardAvoidingView, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, CaretDown, ArrowCounterClockwise, Info, X } from "phosphor-react-native";
import { spacing } from "../theme";
import * as Haptics from "expo-haptics";

const BG      = "#0F2318";
const SURFACE = "#1A3028";
const GOLD    = "#C8A96A";
const MUTED   = "rgba(200,185,160,0.55)";
const WHITE   = "#F5F0E8";
const SERIF   = "SourceSerif4-Regular";

const DHIKRS = [
  { id:"subhanallah", arabic:"سُبْحَانَ اللَّهِ", translit:"SubhanAllah", en:"Glory be to Allah", target:33,
    meaning:"An expression of Allah's perfection and freedom from all imperfection.",
    significance:"'Two words are light on the tongue, heavy on the scales, and beloved to the Most Merciful — SubhanAllahi wa bihamdihi, SubhanAllahil Azeem.' (Bukhari 6406)" },
  { id:"alhamdulillah", arabic:"الْحَمْدُ لِلَّهِ", translit:"Alhamdulillah", en:"All praise is due to Allah", target:33,
    meaning:"An expression of gratitude and praise to Allah for all His blessings, seen and unseen.",
    significance:"'Alhamdulillah fills the scales.' (Muslim 223)" },
  { id:"allahuakbar", arabic:"اللَّهُ أَكْبَرُ", translit:"Allahu Akbar", en:"Allah is the Greatest", target:33,
    meaning:"A declaration that Allah is greater than everything.",
    significance:"Together with SubhanAllah and Alhamdulillah these form the tasbih after each prayer — 33 times each." },
  { id:"lailahaillallah", arabic:"لَا إِلَٰهَ إِلَّا اللَّهُ", translit:"La ilaha illallah", en:"There is no god but Allah", target:100,
    meaning:"The declaration of the Oneness of Allah — the foundation of Islamic belief.",
    significance:"'The best dhikr is La ilaha illallah.' (Tirmidhi 3383)" },
  { id:"astaghfirullah", arabic:"أَسْتَغْفِرُ اللَّهَ", translit:"Astaghfirullah", en:"I seek forgiveness from Allah", target:100,
    meaning:"A supplication for forgiveness. Said to cleanse the heart.",
    significance:"The Prophet ﷺ sought forgiveness more than 70 times a day. (Bukhari 6307)" },
  { id:"subhanallahiwabihamdih", arabic:"سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", translit:"SubhanAllahi wa bihamdih", en:"Glory be to Allah and praise be to Him", target:100,
    meaning:"A combined glorification and praise.",
    significance:"Whoever says this 100 times a day will have his sins forgiven even if like the foam of the sea. (Bukhari 6405)" },
  { id:"subhanallahilazeem", arabic:"سُبْحَانَ اللَّهِ الْعَظِيمِ", translit:"SubhanAllahil Azeem", en:"Glory be to Allah the Most Great", target:100,
    meaning:"Glorification of Allah with His name Al-Azeem — the Most Great.",
    significance:"'Light on the tongue, heavy on the scales, beloved to the Most Merciful.' (Bukhari 6406)" },
  { id:"hasbiallah", arabic:"حَسْبِيَ اللَّهُ", translit:"HasbiAllah", en:"Allah is sufficient for me", target:7,
    meaning:"An expression of complete trust and reliance on Allah.",
    significance:"Prophet Ibrahim ﷺ said this as he was thrown into the fire. (Bukhari 4563)" },
  { id:"salawat", arabic:"اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ", translit:"Allahumma salli 'ala Muhammad", en:"O Allah, send blessings upon Muhammad ﷺ", target:100,
    meaning:"Sending peace and blessings upon the Prophet ﷺ.",
    significance:"'Whoever sends one blessing upon me, Allah will send ten blessings upon him.' (Muslim 408)" },
  { id:"lailahaillallahwahdah", arabic:"لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ", translit:"La ilaha illallah wahdahu la sharika lah", en:"There is no god but Allah alone, with no partner", target:100,
    meaning:"An extended declaration of tawhid.",
    significance:"'Whoever says this 100 times a day will have a reward equivalent to freeing ten slaves.' (Bukhari 3293)" },
  { id:"rabbighfirli", arabic:"رَبِّ اغْفِرْ لِي", translit:"Rabbighfir li", en:"My Lord, forgive me", target:100,
    meaning:"A direct personal supplication to Allah for forgiveness.",
    significance:"A simple powerful du'ā that can be said constantly, especially during ṭawāf and sa'y." },
  { id:"yaallah", arabic:"يَا اللَّهُ", translit:"Ya Allah", en:"O Allah", target:100,
    meaning:"Calling upon Allah directly by His greatest name.",
    significance:"Calling on Allah by name is among the most intimate forms of dhikr and du'ā." },
  { id:"tawbah", arabic:"أَتُوبُ إِلَى اللَّهِ", translit:"Atubu ilallah", en:"I repent to Allah", target:70,
    meaning:"An act of sincere repentance and returning to Allah.",
    significance:"'By Allah, I seek forgiveness and repent to Allah more than seventy times a day.' (Bukhari 6307)" },
  { id:"hawqala", arabic:"لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", translit:"La hawla wa la quwwata illa billah", en:"There is no power or strength except with Allah", target:100,
    meaning:"Acknowledgement that all power belongs to Allah. Said in times of hardship.",
    significance:"'It is a treasure from the treasures of Paradise.' (Bukhari 7386)" },
  { id:"bismillah", arabic:"بِسْمِ اللَّهِ", translit:"Bismillah", en:"In the name of Allah", target:100,
    meaning:"Said before beginning any action, invoking Allah's blessing.",
    significance:"'Any important matter not begun with Bismillah is cut off from blessing.' (Abu Dawud 4840)" },
  { id:"innalillah", arabic:"إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ", translit:"Inna lillahi wa inna ilayhi raji'un", en:"Indeed, to Allah we belong and to Him we return", target:33,
    meaning:"Said upon any loss or difficulty.",
    significance:"'There is no Muslim afflicted with a calamity who says this except that Allah compensates him with something better.' (Muslim 918)" },
  { id:"hawqalakabeer", arabic:"اللَّهُ أَكْبَرُ كَبِيرًا", translit:"Allahu Akbar kabeera", en:"Allah is the Greatest, the Most Great", target:33,
    meaning:"An extended form of takbeer emphasising Allah's greatness.",
    significance:"Said to begin prayers and as an expression of profound reverence for Allah." },
  { id:"allahummabarik", arabic:"اللَّهُمَّ بَارِكْ", translit:"Allahumma barik", en:"O Allah, bless", target:33,
    meaning:"A prayer for Allah's blessing.",
    significance:"Used to ward off the evil eye and invoke blessings in all circumstances." },
  { id:"talbiyah", arabic:"لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ", translit:"Labbayk Allahumma labbayk", en:"Here I am, O Allah, here I am", target:33,
    meaning:"The response of the pilgrim to Allah's call. Said during ihrām.",
    significance:"The pilgrim's declaration of presence and submission to Allah during Ḥajj and Umrah." },
  { id:"allahummaantassalam", arabic:"اللَّهُمَّ أَنْتَ السَّلَامُ", translit:"Allahumma antas-salam", en:"O Allah, You are Peace", target:33,
    meaning:"Said after each prayer. Acknowledging that Allah is the source of all peace.",
    significance:"The Prophet ﷺ would say this after finishing each prayer. (Muslim 591)" },
  { id:"subhanakallah", arabic:"سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ", translit:"SubhanakaAllahuma wa bihamdik", en:"Glory be to You O Allah and praise be to You", target:33,
    meaning:"A glorification said to begin and conclude gatherings.",
    significance:"'Whoever says this at the end of a gathering will have his sins of that gathering forgiven.' (Tirmidhi 3433)" },
  { id:"allahummainnaka", arabic:"اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ", translit:"Allahumma innaka 'afuwwun tuhibbul 'afwa fa'fu 'anni", en:"O Allah, You are forgiving and love forgiveness, so forgive me", target:100,
    meaning:"A du'ā for forgiveness — especially recommended in Laylatul Qadr and during pilgrimage.",
    significance:"The Prophet ﷺ taught this du'ā to Aisha when she asked what to say on Laylatul Qadr. (Tirmidhi 3513)" },
];

const DURATIONS = [
  { key:"session", label:"This Session" },
  { key:"minutes", label:"15 Minutes"   },
  { key:"hour",    label:"1 Hour"       },
  { key:"day",     label:"For a Day"    },
];

const CUSTOM_TEMPLATE = {
  id:"custom", arabic:"", translit:"", en:"Your custom dhikr",
  meaning:"", significance:"", target:100, isCustom:true,
};

// ── Info overlay ──────────────────────────────────────────────────────────────
function InfoOverlay({ dhikr, onClose }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue:1, duration:200, useNativeDriver:true }).start();
  }, []);
  const close = () => {
    Animated.timing(fadeAnim, { toValue:0, duration:160, useNativeDriver:true }).start(onClose);
  };
  return (
    <Modal transparent animationType="none" onRequestClose={close}>
      <Animated.View style={[ov.backdrop, { opacity:fadeAnim }]}>
        <TouchableWithoutFeedback onPress={close}><View style={StyleSheet.absoluteFill} /></TouchableWithoutFeedback>
        <View style={ov.sheet}>
          <TouchableOpacity style={ov.closeBtn} onPress={close} activeOpacity={0.8}>
            <X size={16} color={MUTED} weight="regular" />
          </TouchableOpacity>
          <Text style={ov.arabic}>{dhikr.arabic || dhikr.translit}</Text>
          {!!dhikr.translit && <Text style={ov.translit}>{dhikr.translit}</Text>}
          <View style={ov.divider} />
          {!!dhikr.meaning && <><Text style={ov.sectionLabel}>Meaning</Text><Text style={ov.body}>{dhikr.meaning}</Text></>}
          {!!dhikr.significance && <><Text style={[ov.sectionLabel,{marginTop:16}]}>Significance</Text><Text style={ov.body}>{dhikr.significance}</Text></>}
          {!dhikr.meaning && !dhikr.significance && <Text style={ov.body}>Your custom dhikr.</Text>}
        </View>
      </Animated.View>
    </Modal>
  );
}
const ov = StyleSheet.create({
  backdrop:    { flex:1, backgroundColor:"rgba(0,0,0,0.65)", justifyContent:"flex-end" },
  sheet:       { backgroundColor:SURFACE, borderTopLeftRadius:24, borderTopRightRadius:24, padding:28, paddingBottom:44 },
  closeBtn:    { position:"absolute", top:16, right:16, width:32, height:32, borderRadius:16, backgroundColor:"rgba(255,255,255,0.08)", alignItems:"center", justifyContent:"center" },
  arabic:      { fontFamily:SERIF, fontSize:44, color:WHITE, textAlign:"center", marginTop:8, marginBottom:10, writingDirection:"rtl", lineHeight:62 },
  translit:    { fontSize:22, color:GOLD, textAlign:"center", fontStyle:"italic", marginBottom:16 },
  divider:     { height:1, backgroundColor:"rgba(200,185,160,0.18)", marginBottom:16 },
  sectionLabel:{ fontSize:12, fontWeight:"700", color:GOLD, letterSpacing:1, textTransform:"uppercase", marginBottom:6 },
  body:        { fontSize:22, color:"rgba(245,240,232,0.80)", lineHeight:32 },
});

// ── Dhikr selector ────────────────────────────────────────────────────────────
function DhikrSelector({ selected, onSelect, onClose }) {
  const [customText, setCustomText] = useState("");
  const handleCustom = () => {
    if (!customText.trim()) return;
    onSelect({ ...CUSTOM_TEMPLATE, translit:customText.trim(), en:customText.trim() });
    onClose();
  };
  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}><View style={sel.backdrop} /></TouchableWithoutFeedback>
      <KeyboardAvoidingView behavior={Platform.OS==="ios"?"padding":undefined} style={sel.kavWrap}>
        <View style={sel.sheet}>
          <View style={sel.handle} />
          <Text style={sel.title}>Select Dhikr</Text>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {DHIKRS.map(d => (
              <TouchableOpacity key={d.id} style={[sel.row, d.id===selected.id&&sel.rowActive]}
                onPress={() => { onSelect(d); onClose(); }} activeOpacity={0.8}>
                <View style={sel.rowLeft}>
                  <Text style={sel.rowArabic}>{d.arabic}</Text>
                  <Text style={sel.rowTranslit}>{d.translit}</Text>
                  <Text style={sel.rowEn}>{d.en}</Text>
                </View>
                {d.id===selected.id && <View style={sel.dot} />}
              </TouchableOpacity>
            ))}
            <View style={sel.customWrap}>
              <Text style={sel.customLabel}>Custom / Add your own dhikr</Text>
              <View style={sel.customRow}>
                <TextInput style={sel.customInput} placeholder={"Type your dhikr\u2026"}
                  placeholderTextColor={MUTED} value={customText} onChangeText={setCustomText}
                  returnKeyType="done" onSubmitEditing={handleCustom} />
                <TouchableOpacity style={[sel.customBtn,!customText.trim()&&sel.customBtnDisabled]}
                  onPress={handleCustom} activeOpacity={0.8} disabled={!customText.trim()}>
                  <Text style={sel.customBtnTxt}>Use</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ height:24 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
const sel = StyleSheet.create({
  backdrop:         { flex:1, backgroundColor:"rgba(0,0,0,0.5)" },
  kavWrap:          { flex:1, justifyContent:"flex-end" },
  sheet:            { backgroundColor:SURFACE, borderTopLeftRadius:24, borderTopRightRadius:24, maxHeight:"80%", paddingBottom:8 },
  handle:           { width:36, height:4, borderRadius:2, backgroundColor:"rgba(200,185,160,0.35)", alignSelf:"center", marginTop:10, marginBottom:4 },
  title:            { fontFamily:SERIF, fontSize:20, color:WHITE, textAlign:"center", paddingVertical:14, borderBottomWidth:1, borderBottomColor:"rgba(200,185,160,0.15)" },
  row:              { paddingHorizontal:24, paddingVertical:16, borderBottomWidth:1, borderBottomColor:"rgba(200,185,160,0.10)", flexDirection:"row", alignItems:"center" },
  rowActive:        { backgroundColor:"rgba(200,169,106,0.10)" },
  rowLeft:          { flex:1, gap:3, alignItems:"center" },
  rowArabic:        { fontFamily:SERIF, fontSize:20, color:WHITE, writingDirection:"rtl", textAlign:"center" },
  rowTranslit:      { fontSize:13, color:GOLD, fontStyle:"italic", textAlign:"center" },
  rowEn:            { fontSize:12, color:MUTED, textAlign:"center" },
  dot:              { width:8, height:8, borderRadius:4, backgroundColor:GOLD },
  customWrap:       { marginHorizontal:20, marginTop:20, marginBottom:8 },
  customLabel:      { fontSize:12, fontWeight:"700", color:GOLD, letterSpacing:0.8, marginBottom:10, textTransform:"uppercase" },
  customRow:        { flexDirection:"row", gap:10, alignItems:"center" },
  customInput:      { flex:1, backgroundColor:"rgba(255,255,255,0.07)", borderRadius:12, borderWidth:1, borderColor:"rgba(200,185,160,0.25)", paddingHorizontal:16, paddingVertical:12, fontSize:15, color:WHITE },
  customBtn:        { backgroundColor:GOLD, borderRadius:12, paddingHorizontal:18, paddingVertical:12 },
  customBtnDisabled:{ opacity:0.4 },
  customBtnTxt:     { fontSize:15, fontWeight:"600", color:"#1A1200" },
});

// ── Duration selector ─────────────────────────────────────────────────────────
function DurationSelector({ selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const current = DURATIONS.find(d => d.key===selected) ?? DURATIONS[0];
  return (
    <>
      <TouchableOpacity style={dur.btn} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <Text style={dur.label}>{current.label}</Text>
        <CaretDown size={14} color={MUTED} weight="regular" />
      </TouchableOpacity>
      {open && (
        <Modal transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <TouchableWithoutFeedback onPress={() => setOpen(false)}><View style={dur.backdrop} /></TouchableWithoutFeedback>
          <View style={dur.sheet}>
            {DURATIONS.map(d => (
              <TouchableOpacity key={d.key} style={dur.row} onPress={() => { onSelect(d.key); setOpen(false); }} activeOpacity={0.8}>
                <Text style={[dur.rowTxt, d.key===selected&&dur.rowTxtActive]}>{d.label}</Text>
                {d.key===selected && <View style={dur.rowDot} />}
              </TouchableOpacity>
            ))}
          </View>
        </Modal>
      )}
    </>
  );
}
const dur = StyleSheet.create({
  btn:          { flexDirection:"row", alignItems:"center", gap:8, backgroundColor:SURFACE, borderRadius:50, paddingHorizontal:20, paddingVertical:12, borderWidth:1, borderColor:"rgba(200,185,160,0.20)", alignSelf:"center" },
  label:        { fontSize:15, color:WHITE },
  backdrop:     { flex:1, backgroundColor:"rgba(0,0,0,0.4)" },
  sheet:        { position:"absolute", bottom:80, alignSelf:"center", backgroundColor:"#1A3028", borderRadius:16, borderWidth:1, borderColor:"rgba(200,185,160,0.20)", overflow:"hidden", minWidth:200 },
  row:          { paddingHorizontal:24, paddingVertical:14, flexDirection:"row", alignItems:"center", justifyContent:"space-between" },
  rowTxt:       { fontSize:16, color:WHITE },
  rowTxtActive: { color:GOLD, fontWeight:"500" },
  rowDot:       { width:7, height:7, borderRadius:3.5, backgroundColor:GOLD },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function DhikrScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [dhikr,      setDhikr]      = useState(DHIKRS[0]);
  const [count,      setCount]      = useState(0);
  const [duration,   setDuration]   = useState("session");
  const [showPicker, setShowPicker] = useState(false);
  const [showInfo,   setShowInfo]   = useState(false);

  const add   = () => {
    const next = count + 1;
    setCount(next);
    if (dhikr.target && next === dhikr.target) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  const minus = () => {
    setCount(c => Math.max(0, c - 1));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  const reset = () => {
    setCount(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  return (
    <SafeAreaView style={[s.safe, { paddingBottom:insets.bottom }]}>

      {/* Header — info button removed from here */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.8}>
          <ArrowLeft size={22} color={WHITE} weight="regular" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.title}>Dhikr Counter</Text>
          <Text style={s.subtitle}>{"Remember Allah, and find peace."}</Text>
        </View>
        <View style={{ width:40 }} />
      </View>

      {/* Dhikr selector */}
      <TouchableOpacity style={s.selector} onPress={() => setShowPicker(true)} activeOpacity={0.85}>
        <View style={s.selectorInner}>
          <Text style={s.selectorHint}>SELECT DHIKR</Text>
          <Text style={s.selectorArabic}>{dhikr.arabic || dhikr.translit}</Text>
          <Text style={s.selectorTranslit}>{dhikr.translit}</Text>
        </View>
        <View style={{ width:16 }} />
        <CaretDown size={20} color={GOLD} weight="regular" />
      </TouchableOpacity>

      {/* Count */}
      <View style={s.countWrap}>
        <Text style={s.countNum}>{count}</Text>
        <Text style={s.countLabel}>Count</Text>
      </View>

      {/* Controls */}
      <View style={s.controls}>
        <TouchableOpacity style={s.sideBtn} onPress={minus} activeOpacity={0.8}>
          <Text style={s.sideBtnTxt}>{"−"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.addBtn} onPress={add} activeOpacity={0.85}>
          <Text style={s.addBtnTxt}>{"+"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.sideBtn} onPress={reset} activeOpacity={0.8}>
          <ArrowCounterClockwise size={22} color={WHITE} weight="regular" />
        </TouchableOpacity>
      </View>

      {/* Duration */}
      <View style={s.durationWrap}>
        <DurationSelector selected={duration} onSelect={setDuration} />
      </View>

      {/* Translation + info button on same row */}
      <View style={s.translationWrap}>
        <Text style={s.translationText}>{dhikr.en}</Text>
        <TouchableOpacity style={s.infoBtn} onPress={() => setShowInfo(true)} activeOpacity={0.8}>
          <Info size={18} color={GOLD} weight="regular" />
        </TouchableOpacity>
      </View>

      {showPicker && (
        <DhikrSelector selected={dhikr}
          onSelect={d => { setDhikr(d); setCount(0); }}
          onClose={() => setShowPicker(false)} />
      )}
      {showInfo && (
        <InfoOverlay dhikr={dhikr} onClose={() => setShowInfo(false)} />
      )}

    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex:1, backgroundColor:BG },

  header: {
    flexDirection:"row", alignItems:"center", justifyContent:"space-between",
    paddingHorizontal:spacing(2.5), paddingTop:spacing(2), paddingBottom:spacing(1),
  },
  headerBtn:    { width:40, height:40, alignItems:"center", justifyContent:"center" },
  headerCenter: { flex:1, alignItems:"center" },
  title:        { fontFamily:SERIF, fontSize:28, color:WHITE, fontWeight:"400" },
  subtitle:     { fontSize:14, color:GOLD, marginTop:3, fontStyle:"italic" },

  selector: {
    flexDirection:"row", alignItems:"center",
    marginHorizontal:spacing(2.5), marginTop:spacing(2),
    backgroundColor:SURFACE, borderRadius:16, borderWidth:1,
    borderColor:"rgba(200,185,160,0.20)", paddingVertical:18, paddingHorizontal:20,
  },
  selectorInner:   { flex:1, alignItems:"center" },
  selectorHint:    { fontSize:13, color:GOLD, fontWeight:"700", letterSpacing:1, marginBottom:10, textAlign:"center" },
  selectorArabic:  { fontFamily:SERIF, fontSize:34, color:WHITE, writingDirection:"rtl", lineHeight:46, marginBottom:6, textAlign:"center" },
  selectorTranslit:{ fontSize:22, color:GOLD, fontStyle:"italic", textAlign:"center" },

  countWrap: { alignItems:"center", marginTop:spacing(3), marginBottom:spacing(1) },
  countNum:  { fontSize:128, color:WHITE, fontWeight:"100", lineHeight:138, letterSpacing:-6 },
  countLabel:{ fontSize:14, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginTop:-6 },

  controls: {
    flexDirection:"row", alignItems:"center", justifyContent:"center",
    gap:spacing(3), marginTop:spacing(4), marginBottom:spacing(3.5),
  },
  sideBtn:    { width:58, height:58, borderRadius:29, backgroundColor:SURFACE, borderWidth:1, borderColor:"rgba(200,185,160,0.20)", alignItems:"center", justifyContent:"center" },
  sideBtnTxt: { fontSize:30, color:WHITE, fontWeight:"200", lineHeight:36 },
  addBtn: {
    width:84, height:84, borderRadius:42, backgroundColor:SURFACE,
    borderWidth:1.5, borderColor:GOLD, alignItems:"center", justifyContent:"center",
    shadowColor:GOLD, shadowOffset:{width:0,height:0}, shadowOpacity:0.28, shadowRadius:14, elevation:6,
  },
  addBtnTxt:{ fontSize:48, color:GOLD, fontWeight:"200", lineHeight:56 },

  durationWrap: { alignItems:"center", marginBottom:spacing(3) },

  translationWrap: {
    marginHorizontal:spacing(2.5), flexDirection:"row",
    alignItems:"center", justifyContent:"center", gap:10,
  },
  translationText: {
    fontFamily:SERIF, fontSize:20, color:"rgba(245,240,232,0.70)",
    textAlign:"center", lineHeight:30, fontStyle:"italic", flexShrink:1,
  },
  infoBtn: {
    width:32, height:32, borderRadius:16, backgroundColor:"rgba(200,169,106,0.12)",
    alignItems:"center", justifyContent:"center", borderWidth:1,
    borderColor:"rgba(200,169,106,0.25)", flexShrink:0,
  },
});
