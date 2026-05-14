/**
 * GuideCarousel.jsx — Safar
 * Popup card carousel for Hajj and Umrah visual guides.
 * Centred overlay modal — card-style slides, image top, text below.
 */
import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Dimensions, FlatList } from "react-native";

const SERIF = "SourceSerif4-Regular";
const { width: SW, height: SH } = Dimensions.get("window");
const CARD_W = SW * 0.88;
const CARD_H = SH * 0.70;
const IMG_H  = CARD_H * 0.52;

export const HAJJ_STEPS = [
  { num:1,  title:"Ihram",                  subtitle:"The Intention",            image:require("../assets/02_ihram_gradient.jpg"),       body:"Make your intention for Hajj at the Miqat. Men wear two white seamless cloths; women wear modest clothing. Recite the Talbiyah and continue throughout." },
  { num:2,  title:"Travel to Makkah",       subtitle:"The Arrival",              image:require("../assets/01_arrival_gradient.jpg"),      body:"Enter Makkah in humility and mindfulness. Recite the du'a for entering the city. When you first see the Ka'bah, pause and make du'a." },
  { num:3,  title:"Tawaf Al-Qudum",         subtitle:"Arrival Tawaf",            image:require("../assets/04_tawaf_gradient.jpg"),        body:"Perform seven circuits around the Ka'bah counter-clockwise, beginning at the Black Stone. Men perform Idtiba and Ramal in the first three circuits." },
  { num:4,  title:"Sa'i",                   subtitle:"Between Safa and Marwah",  image:require("../assets/05_sai_gradient.jpg"),          body:"Walk seven times between the hills of Safa and Marwah, commemorating Hajar's search for water. Begin at Safa, end at Marwah." },
  { num:5,  title:"Day of 8th Dhul Hijjah", subtitle:"Travel to Mina",           image:require("../assets/06_mina_gradient.jpg"),         body:"Proceed to Mina on the 8th of Dhul Hijjah. Spend the day and night in prayer and dhikr. Pray five prayers, shortening but not combining them." },
  { num:6,  title:"Day of Arafah",          subtitle:"The Heart of Hajj",        image:require("../assets/07_arafah_gradient.jpg"),       body:"The standing at Arafah is the central pillar of Hajj. Spend the afternoon in du'a, dhikr and sincere repentance. No day is more beloved to Allah." },
  { num:7,  title:"Muzdalifah",             subtitle:"Night Under the Open Sky", image:require("../assets/08_muzdalifah_gradient.jpg"),   body:"After sunset, travel to Muzdalifah. Pray Maghrib and Isha combined. Spend the night in simplicity. Collect pebbles and pray Fajr early." },
  { num:8,  title:"Ramy Al-Jamarat",        subtitle:"Stoning the Pillars",      image:require("../assets/09_jamarat_gradient.jpg"),      body:"Throw seven pebbles at Jamrat Al-Aqabah on the 10th, saying Allahu Akbar with each throw. Stone all three pillars on the 11th and 12th." },
  { num:9,  title:"Udhiya (Qurbani)",       subtitle:"The Sacrifice",            image:require("../assets/10_qurbani_gradient.jpg"),      body:"Offer the sacrifice in obedience to Allah. After the Udhiya, men shave (Halq) or shorten (Taqseer) their hair, exiting the state of Ihram." },
  { num:10, title:"Tawaf Al-Ifadah",        subtitle:"Tawaf of Fulfillment",     image:require("../assets/11_tawaf_ifadah_gradient.jpg"), body:"Return to Makkah and perform the obligatory Tawaf Al-Ifadah — seven circuits of the Ka'bah. This is a pillar of Hajj and cannot be omitted." },
  { num:11, title:"Sa'i of Ifadah",         subtitle:"Between Safa and Marwah",  image:require("../assets/03_journey_gradient.jpg"),      body:"Perform Sa'i for the second time — seven circuits from Safa to Marwah. Return to Mina to complete the remaining days of Tashreeq." },
  { num:12, title:"Tawaf Al-Wada",          subtitle:"The Farewell",             image:require("../assets/12_sai_final_gradient.jpg"),    body:"Before departing, perform the Farewell Tawaf — seven circuits with heartfelt du'a. May Allah accept your Hajj and grant you a Hajj Mabrur. Ameen." },
];

export const UMRAH_STEPS = [
  { num:1, title:"Ihram",                subtitle:"Entering the Sacred State",    image:require("../assets/Umrah_01_ihram_gradient.jpg"),     body:"At the Miqat, make your intention for Umrah and enter Ihram. Recite the Talbiyah: Labbayk Allahumma labbayk. Continue reciting until you begin Tawaf." },
  { num:2, title:"Arrival in Makkah",    subtitle:"Entering the Haram",           image:require("../assets/Umrah_02_arrival_gradient.jpg"),    body:"Enter Masjid al-Haram with your right foot. When you first see the Ka'bah, pause and make du'a — one of the most precious moments of your journey." },
  { num:3, title:"Tawaf",                subtitle:"Seven Circuits of the Ka'bah", image:require("../assets/Umrah_03_tawaf_gradient.jpg"),      body:"Circumambulate the Ka'bah seven times counter-clockwise, starting at the Black Stone. Make du'a and dhikr freely throughout." },
  { num:4, title:"Sa'i",                 subtitle:"Between Safa and Marwah",      image:require("../assets/Umrah_04_sai_gradient.jpg"),        body:"Pray two rak'ahs behind Maqam Ibrahim then walk seven times between Safa and Marwah. Make du'a at each hill in remembrance of Hajar." },
  { num:5, title:"Halq or Taqseer",      subtitle:"Completing Umrah",             image:require("../assets/Umrah_05_completion_gradient.jpg"), body:"Shave the head (Halq) or shorten the hair (Taqseer) to exit Ihram. Women cut a small portion. Your Umrah is now complete. Alhamdulillah." },
  { num:6, title:"Ziyarah of Makkah",    subtitle:"Sacred Sites",                 image:require("../assets/Umrah_06_journey_gradient.jpg"),    body:"Visit the sacred sites of Makkah — Jabal an-Nour, the Cave of Hira and more. Spend time in salah, Quran and du'a inside the Haram." },
  { num:7, title:"Farewell & Reflection", subtitle:"Carrying the Journey Home",   image:require("../assets/Umrah_07_reflection_gradient.jpg"), body:"Perform Tawaf Al-Wada before leaving — seven farewell circuits with gratitude. Carry the renewal of Umrah home. May Allah accept you. Ameen." },
];

function Slide({ step, total }) {
  return (
    <View style={sl.card}>
      <View style={sl.imgWrap}>
        <Image source={step.image} style={sl.img} resizeMode="cover" />
        <View style={sl.imgOverlay} />
        <View style={sl.badge}>
          <Text style={sl.badgeNum}>{step.num}</Text>
          <Text style={sl.badgeTotal}>{"/" + total}</Text>
        </View>
      </View>
      <View style={sl.content}>
        <Text style={sl.subtitle}>{step.subtitle.toUpperCase()}</Text>
        <View style={sl.divider} />
        <Text style={sl.title}>{step.title}</Text>
        <Text style={sl.body}>{step.body}</Text>
      </View>
    </View>
  );
}

const sl = StyleSheet.create({
  card:       { width:CARD_W, height:CARD_H, backgroundColor:"#FDFAF4", borderRadius:24, overflow:"hidden", shadowColor:"#1A1712", shadowOffset:{width:0,height:8}, shadowOpacity:0.2, shadowRadius:24, elevation:12 },
  imgWrap:    { width:"100%", height:IMG_H },
  img:        { width:"100%", height:"100%" },
  imgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(237,230,216,0.15)" },
  badge:      { position:"absolute", top:14, left:0, right:0, flexDirection:"row", justifyContent:"center", alignItems:"baseline", gap:3 },
  badgeNum:   { fontFamily:SERIF, fontSize:38, color:"#fff", lineHeight:44, textShadowColor:"rgba(0,0,0,0.25)", textShadowOffset:{width:0,height:1}, textShadowRadius:6 },
  badgeTotal: { fontFamily:SERIF, fontSize:14, color:"rgba(255,255,255,0.65)", textShadowColor:"rgba(0,0,0,0.25)", textShadowOffset:{width:0,height:1}, textShadowRadius:4 },
  content:    { flex:1, paddingHorizontal:22, paddingTop:18, paddingBottom:14, alignItems:"center" },
  subtitle:   { fontSize:10, fontWeight:"700", letterSpacing:2, color:"#2F5D50", textAlign:"center", marginBottom:8 },
  divider:    { width:28, height:1.5, backgroundColor:"#C8A96A", marginBottom:10 },
  title:      { fontFamily:SERIF, fontSize:22, color:"#1A1712", textAlign:"center", marginBottom:10, lineHeight:28 },
  body:       { fontSize:14, color:"#5A5650", lineHeight:21, textAlign:"center" },
});

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

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <View style={gc.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onClose} activeOpacity={1} />
        <View style={gc.container}>
          <View style={gc.header}>
            <Text style={gc.headerTitle}>{title}</Text>
            <TouchableOpacity style={gc.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={gc.closeX}>{"×"}</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            ref={flatRef}
            data={steps}
            keyExtractor={(_,i) => String(i)}
            horizontal pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewRef}
            viewabilityConfig={{ itemVisiblePercentThreshold:50 }}
            renderItem={({ item }) => (
              <View style={{ width:CARD_W }}>
                <Slide step={item} total={steps.length} />
              </View>
            )}
            snapToInterval={CARD_W}
            decelerationRate="fast"
            style={{ width:CARD_W }}
          />
          <View style={gc.dotsRow}>
            {steps.map((_,i) => (
              <TouchableOpacity key={i} onPress={() => goTo(i)} hitSlop={{top:8,bottom:8,left:4,right:4}}>
                <View style={i === current ? [gc.dot, gc.dotOn] : gc.dot} />
              </TouchableOpacity>
            ))}
          </View>
          <View style={gc.navRow}>
            <TouchableOpacity style={current === 0 ? [gc.navBtn, gc.navBtnOff] : gc.navBtn} onPress={() => goTo(current - 1)} disabled={current === 0} activeOpacity={0.8}>
              <Text style={current === 0 ? [gc.navTxt, gc.navTxtDim] : gc.navTxt}>{"← Prev"}</Text>
            </TouchableOpacity>
            {current < steps.length - 1
              ? <TouchableOpacity style={[gc.navBtn, gc.navBtnPrimary]} onPress={() => goTo(current + 1)} activeOpacity={0.85}><Text style={gc.navTxtPrimary}>{"Next →"}</Text></TouchableOpacity>
              : <TouchableOpacity style={[gc.navBtn, gc.navBtnPrimary]} onPress={onClose} activeOpacity={0.85}><Text style={gc.navTxtPrimary}>{"Done ✓"}</Text></TouchableOpacity>
            }
          </View>
        </View>
      </View>
    </Modal>
  );
}

const gc = StyleSheet.create({
  backdrop:      { flex:1, backgroundColor:"rgba(10,8,4,0.62)", alignItems:"center", justifyContent:"center" },
  container:     { width:CARD_W, alignItems:"center" },
  header:        { width:"100%", flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:14, paddingHorizontal:2 },
  headerTitle:   { fontFamily:SERIF, fontSize:16, color:"#fff" },
  closeBtn:      { width:32, height:32, borderRadius:16, backgroundColor:"rgba(255,255,255,0.15)", borderWidth:1, borderColor:"rgba(255,255,255,0.3)", alignItems:"center", justifyContent:"center" },
  closeX:        { fontSize:20, color:"#fff", lineHeight:24 },
  dotsRow:       { flexDirection:"row", justifyContent:"center", gap:6, paddingVertical:14 },
  dot:           { width:6, height:6, borderRadius:3, backgroundColor:"rgba(255,255,255,0.3)" },
  dotOn:         { width:18, backgroundColor:"#fff" },
  navRow:        { flexDirection:"row", gap:10, width:"100%" },
  navBtn:        { flex:1, borderRadius:10, paddingVertical:12, alignItems:"center", backgroundColor:"rgba(255,255,255,0.15)", borderWidth:1, borderColor:"rgba(255,255,255,0.3)" },
  navBtnOff:     { opacity:0.35 },
  navBtnPrimary: { backgroundColor:"#2F5D50", borderColor:"#2F5D50" },
  navTxt:        { fontFamily:SERIF, fontSize:15, color:"#fff" },
  navTxtDim:     { color:"rgba(255,255,255,0.4)" },
  navTxtPrimary: { fontFamily:SERIF, fontSize:15, color:"#fff" },
});
