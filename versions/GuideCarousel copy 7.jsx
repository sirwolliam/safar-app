/**
 * GuideCarousel.jsx — Safar
 * Full-screen immersive guide carousel.
 * Image fills 100% of screen. Built-in gradient overlay from top.
 * Step number + title centred. Source note at bottom.
 * Thin arrow navigation left/right. No colour overlays — image only.
 */
import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  ImageBackground, Dimensions, FlatList,
} from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

const SERIF = "SourceSerif4-Regular";
const { width: SW, height: SH } = Dimensions.get("window");

export const HAJJ_STEPS = [
  { num:1,  title:"Ihram",                  subtitle:"The Intention",            image:require("../assets/02_ihram_gradient.jpg"),       body:"Make your intention for Hajj at the Miqat. Men wear two white seamless cloths; women wear modest clothing. Recite the Talbiyah and continue throughout.", source:"Ṣaḥīḥ al-Bukhārī · Ṣaḥīḥ Muslim" },
  { num:2,  title:"Travel to Makkah",       subtitle:"The Arrival",              image:require("../assets/01_arrival_gradient.jpg"),      body:"Enter Makkah in humility and mindfulness. Recite the du'a for entering the city. When you first see the Ka'bah, pause and make du'a.", source:"Sunan Abī Dāwūd · Ibn Majah" },
  { num:3,  title:"Tawaf Al-Qudum",         subtitle:"Arrival Tawaf",            image:require("../assets/04_tawaf_gradient.jpg"),        body:"Perform seven circuits around the Ka'bah counter-clockwise, beginning at the Black Stone. Men perform Idtiba and Ramal in the first three circuits.", source:"Ṣaḥīḥ al-Bukhārī · Ṣaḥīḥ Muslim" },
  { num:4,  title:"Sa'i",                   subtitle:"Between Safa and Marwah",  image:require("../assets/05_sai_gradient.jpg"),          body:"Walk seven times between the hills of Safa and Marwah, commemorating Hajar's search for water. Begin at Safa, end at Marwah.", source:"Ṣaḥīḥ al-Bukhārī · Ṣaḥīḥ Muslim" },
  { num:5,  title:"Day of 8th Dhul Hijjah", subtitle:"Travel to Mina",           image:require("../assets/06_mina_gradient.jpg"),         body:"Proceed to Mina on the 8th of Dhul Hijjah. Spend the day and night in prayer and dhikr. Pray five prayers, shortening but not combining them.", source:"Ṣaḥīḥ al-Bukhārī · Sunan al-Tirmidhī" },
  { num:6,  title:"Day of Arafah",          subtitle:"The Heart of Hajj",        image:require("../assets/07_arafah_gradient.jpg"),       body:"The standing at Arafah is the central pillar of Hajj. Spend the afternoon in du'a, dhikr and sincere repentance. No day is more beloved to Allah.", source:"Ṣaḥīḥ Muslim · Sunan Abī Dāwūd" },
  { num:7,  title:"Muzdalifah",             subtitle:"Night Under the Open Sky", image:require("../assets/08_muzdalifah_gradient.jpg"),   body:"After sunset, travel to Muzdalifah. Pray Maghrib and Isha combined. Spend the night in simplicity. Collect pebbles and pray Fajr early.", source:"Ṣaḥīḥ al-Bukhārī · Ṣaḥīḥ Muslim" },
  { num:8,  title:"Ramy Al-Jamarat",        subtitle:"Stoning the Pillars",      image:require("../assets/09_jamarat_gradient.jpg"),      body:"Throw seven pebbles at Jamrat Al-Aqabah on the 10th, saying Allahu Akbar with each throw. Stone all three pillars on the 11th and 12th.", source:"Ṣaḥīḥ al-Bukhārī · Sunan Abī Dāwūd" },
  { num:9,  title:"Udhiya (Qurbani)",       subtitle:"The Sacrifice",            image:require("../assets/10_qurbani_gradient.jpg"),      body:"Offer the sacrifice in obedience to Allah. After the Udhiya, men shave (Halq) or shorten (Taqseer) their hair, exiting the state of Ihram.", source:"Ṣaḥīḥ al-Bukhārī · Ṣaḥīḥ Muslim" },
  { num:10, title:"Tawaf Al-Ifadah",        subtitle:"Tawaf of Fulfillment",     image:require("../assets/11_tawaf_ifadah_gradient.jpg"), body:"Return to Makkah and perform the obligatory Tawaf Al-Ifadah — seven circuits of the Ka'bah. This is a pillar of Hajj and cannot be omitted.", source:"Ṣaḥīḥ al-Bukhārī · Ṣaḥīḥ Muslim" },
  { num:11, title:"Sa'i of Ifadah",         subtitle:"Between Safa and Marwah",  image:require("../assets/03_journey_gradient.jpg"),      body:"Perform Sa'i for the second time — seven circuits from Safa to Marwah. Return to Mina to complete the remaining days of Tashreeq.", source:"Ṣaḥīḥ Muslim · Sunan al-Tirmidhī" },
  { num:12, title:"Tawaf Al-Wada",          subtitle:"The Farewell",             image:require("../assets/12_sai_final_gradient.jpg"),    body:"Before departing, perform the Farewell Tawaf — seven circuits with heartfelt du'a. May Allah accept your Hajj and grant you a Hajj Mabrur. Ameen.", source:"Ṣaḥīḥ al-Bukhārī · Ṣaḥīḥ Muslim" },
];

export const UMRAH_STEPS = [
  { num:1, title:"Ihram",                subtitle:"Entering the Sacred State",    image:require("../assets/Umrah_01_ihram_gradient.jpg"),     body:"At the Miqat, make your intention for Umrah and enter Ihram. Recite the Talbiyah: Labbayk Allahumma labbayk. Continue reciting until you begin Tawaf.", source:"Ṣaḥīḥ al-Bukhārī · Ṣaḥīḥ Muslim" },
  { num:2, title:"Arrival in Makkah",    subtitle:"Entering the Haram",           image:require("../assets/Umrah_02_arrival_gradient.jpg"),    body:"Enter Masjid al-Haram with your right foot. When you first see the Ka'bah, pause and make du'a — one of the most precious moments of your journey.", source:"Ṣaḥīḥ al-Bukhārī · Ibn Majah" },
  { num:3, title:"Tawaf",                subtitle:"Seven Circuits of the Ka'bah", image:require("../assets/Umrah_03_tawaf_gradient.jpg"),      body:"Circumambulate the Ka'bah seven times counter-clockwise, starting at the Black Stone. Make du'a and dhikr freely throughout.", source:"Ṣaḥīḥ al-Bukhārī · Ṣaḥīḥ Muslim" },
  { num:4, title:"Sa'i",                 subtitle:"Between Safa and Marwah",      image:require("../assets/Umrah_04_sai_gradient.jpg"),        body:"Pray two rak'ahs behind Maqam Ibrahim then walk seven times between Safa and Marwah. Make du'a at each hill in remembrance of Hajar.", source:"Ṣaḥīḥ al-Bukhārī · Sunan Abī Dāwūd" },
  { num:5, title:"Halq or Taqseer",      subtitle:"Completing Umrah",             image:require("../assets/Umrah_05_completion_gradient.jpg"), body:"Shave the head (Halq) or shorten the hair (Taqseer) to exit Ihram. Women cut a small portion. Your Umrah is now complete. Alhamdulillah.", source:"Ṣaḥīḥ al-Bukhārī · Ṣaḥīḥ Muslim" },
  { num:6, title:"Ziyarah of Makkah",    subtitle:"Sacred Sites",                 image:require("../assets/Umrah_06_journey_gradient.jpg"),    body:"Visit the sacred sites of Makkah — Jabal an-Nour, the Cave of Hira and more. Spend time in salah, Quran and du'a inside the Haram.", source:"Sunan al-Tirmidhī · Ibn Majah" },
  { num:7, title:"Farewell & Reflection", subtitle:"Carrying the Journey Home",   image:require("../assets/Umrah_07_reflection_gradient.jpg"), body:"Perform Tawaf Al-Wada before leaving — seven farewell circuits with gratitude. Carry the renewal of Umrah home. May Allah accept you. Ameen.", source:"Ṣaḥīḥ al-Bukhārī · Ṣaḥīḥ Muslim" },
];

// ── Full-screen slide ─────────────────────────────────────────────────────────
function Slide({ step, total, guideTitle }) {
  return (
    <View style={sl.slide}>
      {/* Image — 100% fill, no overlay */}
      <ImageBackground
        source={step.image}
        style={StyleSheet.absoluteFill}
        imageStyle={{ resizeMode:"cover" }}
      />

      {/* All content — single top-aligned block */}
      <View style={sl.content}>
        {/* Step circle */}
        <View style={sl.stepCircle}>
          <Text style={sl.stepCircleNum}>{step.num}</Text>
          <Text style={sl.stepCircleSep}>{"/"}</Text>
          <Text style={sl.stepCircleTotal}>{total}</Text>
        </View>

        {/* Guide title */}
        <Text style={sl.guideTitle}>{guideTitle.toUpperCase()}</Text>

        {/* Step text — immediately below guide title */}
        <Text style={sl.subtitle}>{step.subtitle}</Text>
        <View style={sl.divider} />
        <Text style={sl.title}>{step.title}</Text>
        <Text style={sl.body}>{step.body}</Text>
      </View>

      {/* Source — pinned to bottom */}
      <View style={sl.sourceWrap}>
        <View style={sl.sourcePill}>
          <Text style={sl.sourceTxt}>{step.source + " · Consult a scholar for your madhab"}</Text>
        </View>
      </View>
    </View>
  );
}

const sl = StyleSheet.create({
  slide:   { width:SW, height:SH },

  // Single content block — top-aligned, centred
  content: { position:"absolute", top:64, left:0, right:0, paddingHorizontal:28, alignItems:"center" },

  // Step circle
  stepCircle:     { width:52, height:52, borderRadius:26, backgroundColor:"#1E3D30", alignItems:"center", justifyContent:"center", flexDirection:"row", gap:1, marginBottom:10, shadowColor:"#000", shadowOffset:{width:0,height:2}, shadowOpacity:0.30, shadowRadius:6, elevation:6 },
  stepCircleNum:  { fontSize:18, fontWeight:"800", color:"#fff", lineHeight:22 },
  stepCircleSep:  { fontSize:12, color:"rgba(255,255,255,0.50)", lineHeight:22 },
  stepCircleTotal:{ fontSize:12, color:"rgba(255,255,255,0.50)", lineHeight:22 },

  // Guide title
  guideTitle: { fontSize:11, fontWeight:"800", letterSpacing:3, color:"#C8A96A", marginBottom:16 },

  // Step text
  subtitle:   { fontSize:11, fontWeight:"700", letterSpacing:2.5, color:"#1E3D30", textAlign:"center", marginBottom:10, textTransform:"uppercase" },
  divider:    { width:28, height:1.5, backgroundColor:"#1E3D30", opacity:0.40, marginBottom:12 },
  title:      { fontFamily:SERIF, fontSize:26, color:"#1E3D30", textAlign:"center", marginBottom:12, lineHeight:32 },
  body:       { fontSize:14, color:"#1E3D30", lineHeight:22, textAlign:"center", fontWeight:"500", maxWidth:SW - 64 },

  // Source footer
  sourceWrap: { position:"absolute", bottom:44, left:28, right:28, alignItems:"center" },
  sourcePill: { backgroundColor:"rgba(0,0,0,0.30)", borderRadius:12, paddingHorizontal:14, paddingVertical:8 },
  sourceTxt:  { fontSize:9, color:"rgba(255,255,255,0.60)", textAlign:"center", lineHeight:14, fontWeight:"400", letterSpacing:0.3 },
});

// ── Arrow button ──────────────────────────────────────────────────────────────
function ArrowBtn({ dir, onPress, disabled }) {
  return (
    <TouchableOpacity
      style={[ar.btn, disabled && ar.btnDisabled]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
        {dir === "left"
          ? <Path d="M17 6 L9 14 L17 22" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          : <Path d="M11 6 L19 14 L11 22" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        }
      </Svg>
    </TouchableOpacity>
  );
}
const ar = StyleSheet.create({
  btn:        { width:44, height:44, borderRadius:22, borderWidth:1, borderColor:"rgba(255,255,255,0.22)", backgroundColor:"rgba(0,0,0,0.20)", alignItems:"center", justifyContent:"center" },
  btnDisabled:{ opacity:0.18 },
});

// ── Main export ───────────────────────────────────────────────────────────────
export default function GuideCarousel({ visible, onClose, steps, title }) {
  const [current, setCurrent] = useState(0);
  const flatRef = useRef(null);

  const goTo = (idx) => {
    if (idx < 0 || idx >= steps.length) return;
    flatRef.current?.scrollToIndex({ index:idx, animated:true });
    setCurrent(idx);
  };

  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) setCurrent(viewableItems[0].index ?? 0);
  }).current;

  // Progress bar width
  const pct = steps.length > 1 ? Math.round((current / (steps.length - 1)) * 100) : 100;

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent={false}>
      <View style={gc.root}>

        {/* Full-screen swipeable slides */}
        <FlatList
          ref={flatRef}
          data={steps}
          keyExtractor={(_, i) => String(i)}
          horizontal pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewRef}
          viewabilityConfig={{ itemVisiblePercentThreshold:50 }}
          getItemLayout={(_, i) => ({ length:SW, offset:SW*i, index:i })}
          renderItem={({ item }) => (
            <Slide step={item} total={steps.length} guideTitle={title} />
          )}
        />

        {/* Left arrow */}
        <View style={[gc.arrow, gc.arrowLeft]} pointerEvents="box-none">
          <ArrowBtn dir="left" onPress={() => goTo(current - 1)} disabled={current === 0} />
        </View>

        {/* Right arrow / Done */}
        <View style={[gc.arrow, gc.arrowRight]} pointerEvents="box-none">
          {current < steps.length - 1
            ? <ArrowBtn dir="right" onPress={() => goTo(current + 1)} disabled={false} />
            : (
              <TouchableOpacity style={gc.doneBtn} onPress={onClose} activeOpacity={0.85}>
                <Text style={gc.doneTxt}>Done</Text>
              </TouchableOpacity>
            )
          }
        </View>

        {/* Close button — top right */}
        <TouchableOpacity style={gc.closeBtn} onPress={onClose} activeOpacity={0.8}>
          <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
            <Path d="M2 2 L16 16M16 2 L2 16" stroke="rgba(255,255,255,0.80)" strokeWidth="1.8" strokeLinecap="round"/>
          </Svg>
        </TouchableOpacity>

        {/* Progress bar — very bottom */}
        <View style={gc.progressBar} pointerEvents="none">
          <View style={[gc.progressFill, { width: pct + "%" }]} />
        </View>

        {/* Dot indicators */}
        <View style={gc.dotsRow} pointerEvents="box-none">
          {steps.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => goTo(i)}
              hitSlop={{top:10,bottom:10,left:6,right:6}}>
              <View style={i === current ? [gc.dot, gc.dotOn] : gc.dot} />
            </TouchableOpacity>
          ))}
        </View>

      </View>
    </Modal>
  );
}

const gc = StyleSheet.create({
  root:        { flex:1, backgroundColor:"#000", width:SW, height:SH },
  arrow:       { position:"absolute", top:"50%", marginTop:-22 },
  arrowLeft:   { left:16 },
  arrowRight:  { right:16 },
  closeBtn:    { position:"absolute", top:54, right:20, width:36, height:36, borderRadius:18, backgroundColor:"rgba(0,0,0,0.35)", borderWidth:1, borderColor:"rgba(255,255,255,0.20)", alignItems:"center", justifyContent:"center" },
  doneBtn:     { backgroundColor:"rgba(200,169,106,0.90)", borderRadius:20, paddingHorizontal:16, paddingVertical:10 },
  doneTxt:     { fontFamily:SERIF, fontSize:14, color:"#0F2419", fontWeight:"700" },
  progressBar: { position:"absolute", bottom:0, left:0, width:"100%", height:2, backgroundColor:"rgba(255,255,255,0.12)" },
  progressFill:{ height:"100%", backgroundColor:"#C8A96A" },
  dotsRow:     { position:"absolute", bottom:12, left:0, right:0, flexDirection:"row", justifyContent:"center", gap:6, alignItems:"center" },
  dot:         { width:5, height:5, borderRadius:3, backgroundColor:"rgba(255,255,255,0.30)" },
  dotOn:       { width:18, height:5, borderRadius:3, backgroundColor:"#C8A96A" },
});
