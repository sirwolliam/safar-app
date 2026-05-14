/**
 * GuideCarousel.jsx — Safar
 * Full-screen carousel for Hajj and Umrah visual guides.
 * Import this into HajjGuideScreen and UmrahGuideScreen.
 * Also exports HAJJ_STEPS and UMRAH_STEPS data arrays.
 */
import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  ImageBackground, ScrollView, Dimensions, SafeAreaView, FlatList,
} from "react-native";
import { colors, spacing, radius, shadows } from "./theme";
import AskModal from "../components/AskModal";

const SERIF = "SourceSerif4-Regular";
const { width: SW, height: SH } = Dimensions.get("window");
const IMG_H = Math.round(SH * 0.48);

// ── Hajj steps data ───────────────────────────────────────────────────────────
export const HAJJ_STEPS = [
  {
    num: 1, title: "Ihram", subtitle: "The Intention",
    image: require("../assets/ihram.jpg"),
    body: "Enter the state of Ihram by making the intention (niyyah) for Hajj. Men wear two white seamless cloths; women wear modest clothing. Recite the Talbiyah: Labbayk Allāhumma labbayk — and continue reciting throughout. Ihram marks total devotion and spiritual purity.",
  },
  {
    num: 2, title: "Travel to Makkah", subtitle: "The Arrival",
    image: require("../assets/arrival.jpg"),
    body: "Proceed to Makkah in a spirit of humility and mindfulness. Upon entering, recite the du\'a\' for entering the city. When you first see the Ka\'bah, pause — this moment carries immense spiritual weight. Make du\'a\' at that instant for yourself and those you love.",
  },
  {
    num: 3, title: "Tawaf Al-Qudum", subtitle: "Arrival Tawaf",
    image: require("../assets/tawaf.jpg"),
    body: "Upon reaching Makkah, perform Tawaf — seven circuits around the Ka\'bah, counter-clockwise, keeping the Ka\'bah on your left. Begin at the Black Stone (Hajar al-Aswad). Men perform Idtiba and Ramal in the first three circuits. Make du\'a\' and dhikr throughout.",
  },
  {
    num: 4, title: "Sa\'i", subtitle: "Between Safa and Marwah",
    image: require("../assets/Umrah_04_sai_gradient.jpg"),
    body: "Walk seven times between the hills of Safa and Marwah, commemorating Hajar\'s search for water for her son Ismail. Begin at Safa and end at Marwah. Men run between the green markers. Recite prescribed du\'a\' at each hill with full presence of heart.",
  },
  {
    num: 5, title: "Day of 8th Dhul Hijjah", subtitle: "Travel to Mina",
    image: require("../assets/mina.jpg"),
    body: "On the 8th of Dhul Hijjah, proceed to Mina — a vast valley of white tents housing millions of pilgrims. Spend the day and night in prayer, dhikr and reflection. Pray Dhuhr, Asr, Maghrib, Isha and Fajr — shortening but not combining the prayers.",
  },
  {
    num: 6, title: "Day of 9th Dhul Hijjah", subtitle: "Arafah — The Heart of Hajj",
    image: require("../assets/arafah.jpg"),
    body: "The standing at Arafah (Wuquf) is the central pillar of Hajj. The Prophet said: \'There is no day on which Allah frees more people from the Fire than Arafah.\' Spend the afternoon in intense supplication, dhikr and repentance. Combine and shorten Dhuhr and Asr.",
  },
  {
    num: 7, title: "Muzdalifah", subtitle: "Night Under the Open Sky",
    image: require("../assets/08_muzdalifah_gradient.jpg"),
    body: "After sunset, travel to Muzdalifah. Pray Maghrib and Isha combined. Spend the night under the open sky in simplicity and closeness to Allah. Collect 49-70 small pebbles for the Ramy. Pray Fajr early and make du\'a\' facing the qiblah until before sunrise.",
  },
  {
    num: 8, title: "Ramy Al-Jamarat", subtitle: "Stoning the Pillars",
    image: require("../assets/mina.jpg"),
    body: "On the 10th of Dhul Hijjah, throw seven pebbles at Jamrat Al-Aqabah, saying \'Allahu Akbar\' with each throw. This commemorates Ibrahim\'s rejection of Shaytan. On the 11th and 12th, stone all three pillars — seven pebbles each — after Dhuhr.",
  },
  {
    num: 9, title: "Udhiya (Qurbani)", subtitle: "The Sacrifice",
    image: require("../assets/mina.jpg"),
    body: "Offer the sacrifice (Udhiya) in obedience to Allah — commemorating Ibrahim\'s willingness to sacrifice his son. The sacrifice may be performed in Mina or arranged through official channels. After the sacrifice, men shave (Halq) or shorten (Taqseer) their hair, exiting Ihram.",
  },
  {
    num: 10, title: "Tawaf Al-Ifadah", subtitle: "Tawaf of Fulfillment",
    image: require("../assets/tawaf2.jpg"),
    body: "Return to Makkah and perform Tawaf Al-Ifadah — the obligatory Tawaf of Hajj. This is a pillar of Hajj and cannot be omitted. Seven circuits around the Ka\'bah. This Tawaf marks the full exit from Ihram and is typically performed on the 10th of Dhul Hijjah.",
  },
  {
    num: 11, title: "Sa\'i of Ifadah", subtitle: "Between Safa and Marwah",
    image: require("../assets/03_journey_gradient.jpg"),
    body: "Perform Sa\'i between Safa and Marwah for the second time — seven circuits, beginning at Safa. This is connected to Tawaf Al-Ifadah and completes the rites of Hajj. Return to Mina to complete the remaining days of Tashreeq and the stoning of the Jamarat.",
  },
  {
    num: 12, title: "Completing Hajj", subtitle: "Tawaf Al-Wada — Farewell",
    image: require("../assets/Umrah_04_sai_gradient.jpg"),
    body: "Before departing Makkah, perform Tawaf Al-Wada\' — the obligatory Farewell Tawaf. Complete seven circuits with heartfelt du\'a\'. As you leave, carry the barakah of this journey. May Allah accept your Hajj, forgive your sins, and grant you a Hajj Mabrur. Ameen.",
  },
];

// ── Umrah steps data ──────────────────────────────────────────────────────────
export const UMRAH_STEPS = [
  {
    num: 1, title: "Ihram", subtitle: "Entering the Sacred State",
    image: require("../assets/ihram.jpg"),
    body: "Before reaching the Miqat, make the intention for Umrah and enter Ihram. Men wear two white seamless cloths; women wear modest clothing. Recite the Talbiyah: \'Labbayk Allāhumma labbayk, labbayk lā sharīka laka labbayk.\' Continue reciting until you begin Tawaf.",
  },
  {
    num: 2, title: "Arrival in Makkah", subtitle: "Entering the Haram",
    image: require("../assets/arrival.jpg"),
    body: "Enter Masjid al-Haram with your right foot, reciting the du\'a\' of entering the mosque. When you first see the Ka\'bah, pause and make du\'a\' — this moment is precious and prayers are answered here. Let your heart settle in the presence of Allah\'s House.",
  },
  {
    num: 3, title: "Tawaf", subtitle: "Seven Circuits of the Ka\'bah",
    image: require("../assets/tawaf.jpg"),
    body: "Perform Tawaf — circumambulate the Ka\'bah seven times, counter-clockwise, keeping the Ka\'bah on your left. Begin and end at the Black Stone. Men perform Idtiba and Ramal in the first three circuits. Make du\'a\' and dhikr freely — there are no fixed words required.",
  },
  {
    num: 4, title: "Sa\'i", subtitle: "Between Safa and Marwah",
    image: require("../assets/Umrah_04_sai_gradient.jpg"),
    body: "After Tawaf, pray two rak\'ahs behind Maqam Ibrahim, then proceed to Safa. Walk seven times between Safa and Marwah. Men run between the green markers. Make du\'a\' at each hill. Sa\'i commemorates Hajar\'s profound trust in Allah as she searched for water for Ismail.",
  },
  {
    num: 5, title: "Halq or Taqseer", subtitle: "Completing Umrah",
    image: require("../assets/tawaf2.jpg"),
    body: "Exit Ihram by shaving the head completely (Halq — superior) or shortening the hair (Taqseer). Women cut a small portion of hair. With this act, Umrah is complete and all restrictions of Ihram are lifted. Alhamdulillah — your Umrah is accepted, bi idhnillah.",
  },
  {
    num: 6, title: "Ziyarah of Makkah", subtitle: "Sacred Sites",
    image: require("../assets/03_journey_gradient.jpg"),
    body: "With Umrah complete, visit the sacred sites of Makkah. Jabal an-Nour houses the Cave of Hira where the first revelation descended. Spend time in Masjid al-Haram in salah, Quran and du\'a\' — the reward here is multiplied 100,000 times.",
  },
  {
    num: 7, title: "Farewell & Reflection", subtitle: "Carrying the Journey Home",
    image: require("../assets/arrival.jpg"),
    body: "Before leaving, perform Tawaf Al-Wada\' — seven farewell circuits of the Ka\'bah with a heart full of gratitude. Make sincere du\'a\' for yourself, your family and the ummah. Carry the spiritual renewal of Umrah into your daily life. May Allah accept and return you. Ameen.",
  },
];

// ── Single slide ──────────────────────────────────────────────────────────────
function Slide({ step, total }) {
  return (
    <View style={{ width:SW, flex:1 }}>
      <ImageBackground source={step.image}
        style={{ width:"100%", height:IMG_H }}
        imageStyle={{ resizeMode:"cover" }}>
        <View style={gs.imgScrim} />
        {/* Step badge — top left */}
        <View style={gs.badge}>
          <Text style={gs.badgeNum}>{step.num}</Text>
          <Text style={gs.badgeOf}>{"/ " + total}</Text>
        </View>
        {/* Title — bottom of image */}
        <View style={gs.titleBlock}>
          <Text style={gs.slideSubtitle}>{step.subtitle.toUpperCase()}</Text>
          <Text style={gs.slideTitle}>{step.title}</Text>
        </View>
      </ImageBackground>
      <ScrollView style={{ flex:1, backgroundColor:colors.background }}
        showsVerticalScrollIndicator={false}>
        <Text style={gs.body}>{step.body}</Text>
        <View style={{ height:spacing(3) }} />
      </ScrollView>
    </View>
  );
}

const gs = StyleSheet.create({
  imgScrim:     { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(10,8,4,0.4)" },
  badge:        { position:"absolute", top:spacing(2), left:spacing(2.5), flexDirection:"row", alignItems:"baseline", gap:5 },
  badgeNum:     { fontFamily:SERIF, fontSize:44, color:"#fff", lineHeight:50 },
  badgeOf:      { fontFamily:SERIF, fontSize:16, color:"rgba(255,255,255,0.55)" },
  titleBlock:   { position:"absolute", bottom:0, left:0, right:0, padding:spacing(2.5) },
  slideSubtitle:{ fontSize:11, fontWeight:"700", letterSpacing:2, color:"rgba(255,255,255,0.7)", marginBottom:6 },
  slideTitle:   { fontFamily:SERIF, fontSize:30, color:"#fff", lineHeight:36 },
  body:         { fontSize:16, color:colors.text, lineHeight:26, padding:spacing(2.5), paddingTop:spacing(2) },
});

// ── Main export ───────────────────────────────────────────────────────────────
export default function GuideCarousel({ visible, onClose, steps, title }) {
  const [current, setCurrent] = useState(0);
  const [showAsk, setShowAsk] = useState(false);
  const flatRef = useRef(null);

  const goTo = (idx) => {
    if (idx < 0 || idx >= steps.length) return;
    flatRef.current?.scrollToIndex({ index:idx, animated:true });
    setCurrent(idx);
  };

  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) setCurrent(viewableItems[0].index ?? 0);
  }).current;

  const currentStep = steps[current];
  const askContext = currentStep
    ? `The user is viewing Step ${current + 1} of the ${title}:\n\nStep title: ${currentStep.title ?? ""}\nStep subtitle: ${currentStep.subtitle ?? ""}\nStep body: ${currentStep.body ?? ""}`
    : `The user is viewing the ${title} guide.`;

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <SafeAreaView style={{ flex:1, backgroundColor:colors.background }}>

        {/* Top bar */}
        <View style={gc.topBar}>
          <TouchableOpacity style={gc.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={gc.closeX}>{"×"}</Text>
          </TouchableOpacity>
          <Text style={gc.topTitle}>{title}</Text>
          <Text style={gc.topCount}>{current + 1} / {steps.length}</Text>
        </View>

        {/* Slide list */}
        <FlatList
          ref={flatRef}
          data={steps}
          keyExtractor={(_,i) => String(i)}
          horizontal pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewRef}
          viewabilityConfig={{ itemVisiblePercentThreshold:50 }}
          renderItem={({ item }) => <Slide step={item} total={steps.length} />}
          style={{ flex:1 }}
        />

        {/* Progress dots */}
        <View style={gc.dotsRow}>
          {steps.map((_,i) => (
            <TouchableOpacity key={i} onPress={() => goTo(i)} hitSlop={{top:8,bottom:8,left:4,right:4}}>
              <View style={i === current ? [gc.dot, gc.dotOn] : gc.dot} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Ask about this step */}
        <TouchableOpacity style={gc.askBtn} onPress={() => setShowAsk(true)} activeOpacity={0.8}>
          <View style={gc.askDot} />
          <Text style={gc.askTxt}>Ask about this step</Text>
        </TouchableOpacity>

        {/* Nav buttons */}
        <View style={gc.navRow}>
          <TouchableOpacity
            style={current === 0 ? [gc.navBtn, gc.navBtnOff] : gc.navBtn}
            onPress={() => goTo(current - 1)}
            disabled={current === 0}
            activeOpacity={0.8}>
            <Text style={current === 0 ? [gc.navTxt, gc.navTxtOff] : gc.navTxt}>{"← Previous"}</Text>
          </TouchableOpacity>

          {current < steps.length - 1
            ? <TouchableOpacity style={[gc.navBtn, gc.navBtnPrimary]} onPress={() => goTo(current + 1)} activeOpacity={0.85}>
                <Text style={gc.navTxtPrimary}>{"Next →"}</Text>
              </TouchableOpacity>
            : <TouchableOpacity style={[gc.navBtn, gc.navBtnPrimary]} onPress={onClose} activeOpacity={0.85}>
                <Text style={gc.navTxtPrimary}>{"Done  ✓"}</Text>
              </TouchableOpacity>
          }
        </View>

      </SafeAreaView>

      <AskModal
        visible={showAsk}
        onClose={() => setShowAsk(false)}
        context={askContext}
        contextLabel={`${title} · Step ${current + 1}`}
      />
    </Modal>
  );
}

const gc = StyleSheet.create({
  topBar:       { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:spacing(2.5), paddingVertical:spacing(1.5), borderBottomWidth:1, borderBottomColor:colors.border },
  closeBtn:     { width:34, height:34, borderRadius:17, backgroundColor:colors.card, borderWidth:1, borderColor:colors.border, alignItems:"center", justifyContent:"center", ...shadows.card },
  closeX:       { fontSize:20, color:colors.text, lineHeight:24 },
  topTitle:     { fontFamily:SERIF, fontSize:16, color:colors.text },
  topCount:     { fontSize:13, color:colors.subtext, minWidth:40, textAlign:"right" },
  dotsRow:      { flexDirection:"row", justifyContent:"center", gap:spacing(0.75), paddingVertical:spacing(1.25) },
  dot:          { width:6, height:6, borderRadius:3, backgroundColor:colors.border },
  dotOn:        { width:18, backgroundColor:colors.primary },
  askBtn:       { flexDirection:"row", alignItems:"center", justifyContent:"center", gap:7, paddingVertical:8, marginBottom:2 },
  askDot:       { width:7, height:7, borderRadius:3.5, backgroundColor:"#4A5C48" },
  askTxt:       { fontSize:13, color:"#4A5C48", fontWeight:"600" },
  navRow:       { flexDirection:"row", gap:spacing(1.25), paddingHorizontal:spacing(2.5), paddingBottom:spacing(2.5), paddingTop:spacing(0.5) },
  navBtn:       { flex:1, borderRadius:radius.md, paddingVertical:spacing(1.5), alignItems:"center", backgroundColor:colors.card, borderWidth:1, borderColor:colors.border },
  navBtnOff:    { opacity:0.4 },
  navBtnPrimary:{ backgroundColor:colors.primary, borderColor:colors.primary },
  navTxt:       { fontFamily:SERIF, fontSize:15, color:colors.text },
  navTxtOff:    { color:colors.subtext },
  navTxtPrimary:{ fontFamily:SERIF, fontSize:15, color:"#fff" },
});
