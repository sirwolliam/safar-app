/**
 * MapScreen.jsx — Safar
 *
 * Layout (top to bottom, scrollable):
 *   1. Ornate header — matches MyContactsScreen exactly: pattern band, back
 *      button, big title (Umrah Map / Hajj Map), small subhead = current step name
 *   2. Stepper — arrows + pips, fixed below header
 *   3. Map — full device width, true aspect ratio, tap to expand + pinch-zoom/pan
 *   4. Site photo — landscape card
 *   5. Step card — pill, title, description, Full Guide + Duas buttons
 */
import React, { useState, useRef, useMemo } from "react";
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, StatusBar, PanResponder, Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CaretLeft, HandsPraying, BookOpen, CaretRight, ArrowsOut, X } from "phosphor-react-native";
import { spacing } from "../theme";
import HeaderPatternBg from "../HeaderPatternBg";

const { width: SW } = Dimensions.get("window");

const SAGE     = "#4A5C48";
const CARD_BG  = "#FDFAF4";
const GOLD     = "#B8922A";
const BORDER   = "rgba(200,185,160,0.45)";
const TEXT     = "#1C1A14";
const MUTED    = "#7A7060";
const SERIF    = "SourceSerif4-Regular";
const BG       = "#EDE8DC";

// ── Umrah steps ───────────────────────────────────────────────────────────────
const UMRAH_STEPS = [
  {
    id:"ihram", step:1, label:"Ihram",
    title:"Ihram",
    lessonId:"umrah-03", duaMode:"umrah",
    desc:"Ihram is the sacred state you enter before your Umrah begins — not just white garments, but a state of worship, humility, and devotion. Prepare before reaching the Miqat, make your intention, and begin reciting the Talbiyah as you enter this state.",
    photo: require("../assets/ihram.jpg"),
    map: require("../assets/map_umrah_01_miqaat.png"),
  },
  {
    id:"enter", step:2, label:"Enter Haram",
    title:"Entering Masjid al-Haram",
    lessonId:"umrah-05", duaMode:"umrah",
    desc:"After months of anticipation, you've reached the city that holds the Ka'bah — the first house built for the worship of Allah. Take your time, stay patient in the crowds, and continue the Talbiyah until Tawaf begins.",
    photo: require("../assets/arrival.jpg"),
    map: require("../assets/map_umrah_02_entering_haram.png"),
  },
  {
    id:"tawaf", step:3, label:"Tawaf",
    title:"Tawaf",
    lessonId:"umrah-06", duaMode:"umrah",
    desc:"Tawaf is walking around the Ka'bah seven times, counter-clockwise, beginning and ending at the Black Stone. There's no required du'a for each circuit — just your own sincere remembrance of Allah, at a calm, unhurried pace.",
    photo: require("../assets/tawaf2.jpg"),
    map: require("../assets/map_umrah_03_tawaf.png"),
  },
  {
    id:"maqam", step:4, label:"Maqam Ibrahim",
    title:"Maqam Ibrahim & Zamzam",
    lessonId:"umrah-07", duaMode:"umrah",
    desc:"After Tawaf, pray two rak'ahs near Maqam Ibrahim if space allows — anywhere in the mosque is fine if it's crowded. Then drink from the Zamzam well, the same blessed spring that answered Hajar's search for water for her son Isma'il.",
    photo: require("../assets/maqam_ibrahim_map.png"),
    map: require("../assets/map_umrah_04_maqam_zamzam.png"),
  },
  {
    id:"sai", step:5, label:"Safa & Marwah",
    title:"Safa & Marwah (Sa'i)",
    lessonId:"umrah-08", duaMode:"umrah",
    desc:"Sa'i retraces Hajar's search for water for her infant son — seven journeys on foot between the hills of Safa and Marwah. Walk calmly and make personal du'a; men pick up the pace only briefly between the two green markers.",
    photo: require("../assets/sayi.jpg"),
    map: require("../assets/map_umrah_05_safa_marwah.png"),
  },
  {
    id:"halq", step:6, label:"Halq / Taqseer",
    title:"Halq or Taqseer",
    lessonId:"umrah-09", duaMode:"umrah",
    desc:"Umrah concludes with cutting or shaving the hair — Halq (shaving) or Taqseer (trimming) for men, a small trim for women. Once that's done, the restrictions of Ihram are lifted and your Umrah is complete.",
    photo: require("../assets/Umrah_05_completion_gradient.jpg"),
    map: require("../assets/map_umrah_06_halq_taqseer.png"),
    note:"Tawaf al-Wada before leaving Makkah is recommended Sunnah, not a required step of Umrah.",
  },
];

const HAJJ_STEPS = [
  {
    id:"ihram", step:1, label:"Ihram",
    title:"Enter Ihram",
    date:"8th Dhul Hijjah", duaMode:"hajj",
    desc:"At the Miqat make your intention, wear Ihram garments and recite the Talbiyah: Labbayk Allahumma labbayk.",
    photo: require("../assets/ihram.jpg"),
    map: require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"mina", step:2, label:"Mina",
    title:"Travel to Mina",
    date:"8th Dhul Hijjah", distance:"~8km from Makkah", duaMode:"hajj",
    desc:"Travel to Mina. Pray all five prayers here, shortening four-rakah prayers to two. Spend the night in worship before the Day of Arafat.",
    photo: require("../assets/arrival.jpg"),
    map: require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"arafat", step:3, label:"Arafat",
    title:"Wuquf at Arafah",
    date:"9th Dhul Hijjah", distance:"~14km from Makkah", duaMode:"hajj",
    desc:"The most important day of Hajj. Stand at Arafah from midday to sunset in continuous du'a and dhikr. The Prophet ﷺ said: 'Hajj is Arafah.'",
    photo: require("../assets/arafah.jpg"),
    map: require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"muzdalifah", step:4, label:"Muzdalifah",
    title:"Night in Muzdalifah",
    date:"Night of the 9th", distance:"~9km from Arafat", duaMode:"hajj",
    desc:"After sunset, travel to Muzdalifah. Combine Maghrib and Isha. Sleep under the open sky. Collect pebbles for the Jamarat.",
    photo: require("../assets/arrival.jpg"),
    map: require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"jamarat", step:5, label:"Jamarat",
    title:"Rami — Stone the Jamarat",
    date:"10th–12th", distance:"In Mina", duaMode:"hajj",
    desc:"Return to Mina. On the 10th, throw seven pebbles at Jamarat al-Aqabah. On the 11th and 12th, stone all three pillars in order, saying 'Allahu Akbar' with each throw.",
    photo: require("../assets/arrival.jpg"),
    map: require("../assets/Umrah_map_test1.png"),
  },
  {
    id:"ifadah", step:6, label:"Tawaf + Farewell",
    title:"Tawaf al-Ifadah + Farewell",
    date:"10th Dhul Hijjah", distance:"Return to Makkah", duaMode:"hajj",
    desc:"Perform Tawaf al-Ifadah, then Sa'i. All Ihram restrictions are fully lifted. Perform Tawaf al-Wada before leaving Makkah.",
    photo: require("../assets/tawaf2.jpg"),
    map: require("../assets/Umrah_map_test1.png"),
  },
];

export default function MapScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const guide  = route?.params?.guide === "hajj" ? "hajj" : "umrah";
  const [idx, setIdx] = useState(route?.params?.stepIndex ?? 0);
  const [showFullMap, setShowFullMap] = useState(false);

  const steps   = guide === "hajj" ? HAJJ_STEPS : UMRAH_STEPS;
  const total   = steps.length;
  const current = steps[idx];

  const mapDims = useMemo(() => {
    const src = Image.resolveAssetSource(current.map);
    if (src?.width && src?.height) {
      return { width: SW, height: SW * (src.height / src.width) };
    }
    return { width: SW, height: SW * 0.62 };
  }, [current.map]);

  const swipePan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 20 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderRelease: (_, g) => {
        if (g.dx < -40) setIdx(i => Math.min(total - 1, i + 1));
        else if (g.dx > 40) setIdx(i => Math.max(0, i - 1));
      },
    })
  ).current;

  return (
    <View style={s.safe}>
      <StatusBar barStyle="light-content" />

      {/* Header — matches MyContactsScreen exactly */}
      <View style={s.header}>
        <HeaderPatternBg width={SW} />
        <View style={[s.headerTopRow, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <CaretLeft size={18} color="#1A1712" weight="bold" />
          </TouchableOpacity>
          <View style={{ width: 36 }} />
        </View>
        <View style={s.headerCenter}>
          <Text style={s.pageTitle}>{guide === "hajj" ? "Hajj Map" : "Umrah Map"}</Text>
          <Text style={s.pageSubtitle}>{current.title}</Text>
        </View>
      </View>

      <View style={s.stepperRow}>
        <TouchableOpacity
          style={[s.arrow, idx === 0 && s.arrowDim]}
          onPress={() => setIdx(i => Math.max(0, i - 1))}
          disabled={idx === 0} activeOpacity={0.8}
          hitSlop={{ top:14, bottom:14, left:14, right:14 }}
        >
          <CaretLeft size={16} color={idx === 0 ? MUTED : SAGE} weight="bold" />
        </TouchableOpacity>

        <View style={s.pipRow}>
          {steps.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => setIdx(i)}
              hitSlop={{ top:8, bottom:8, left:6, right:6 }} activeOpacity={0.7}>
              <View style={[s.pip, i === idx && s.pipOn]} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[s.arrow, idx === total - 1 && s.arrowDim]}
          onPress={() => setIdx(i => Math.min(total - 1, i + 1))}
          disabled={idx === total - 1} activeOpacity={0.8}
          hitSlop={{ top:14, bottom:14, left:14, right:14 }}
        >
          <CaretRight size={16} color={idx === total - 1 ? MUTED : SAGE} weight="bold" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
        {...swipePan.panHandlers}
      >
        <TouchableOpacity
          style={[s.mapWrap, { height: mapDims.height }]}
          onPress={() => setShowFullMap(true)}
          activeOpacity={0.92}
        >
          <Image source={current.map} style={{ width: mapDims.width, height: mapDims.height }} resizeMode="cover" />
          <View style={s.mapExpandHint}>
            <ArrowsOut size={16} color="#FFFFFF" weight="bold" />
          </View>
        </TouchableOpacity>

        <View style={s.padded}>
          <View style={s.photoCard}>
            <Image source={current.photo} style={s.photoImg} resizeMode="cover" />
          </View>

          <View style={s.card}>
            <View style={s.cardTop}>
              <View style={s.stepPill}>
                <Text style={s.stepPillTxt}>{"Step " + current.step + " of " + total}</Text>
              </View>
              {current.distance ? <Text style={s.meta}>{current.distance}</Text> : null}
              {current.date ? <Text style={s.meta}>{current.date}</Text> : null}
            </View>

            <Text style={s.title}>{current.title}</Text>
            <Text style={s.desc}>{current.desc}</Text>

            {current.note ? (
              <Text style={s.note}>{"Note: " + current.note}</Text>
            ) : null}

            <View style={s.buttonsRow}>
              {current.lessonId ? (
                <TouchableOpacity
                  onPress={() => navigation?.navigate?.("LessonFlow", { lessonId: current.lessonId })}
                  activeOpacity={0.85}
                  style={s.btnPrimary}
                >
                  <BookOpen size={18} color="#FFFFFF" weight="regular" />
                  <Text style={s.btnPrimaryTxt}>Full Guide</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                onPress={() => navigation?.navigate?.("PilgrimageDuas", { mode: current.duaMode })}
                activeOpacity={0.85}
                style={current.lessonId ? s.btnSecondary : [s.btnSecondary, { flex:1 }]}
              >
                <HandsPraying size={18} color={SAGE} weight="regular" />
                <Text style={s.btnSecondaryTxt}>Duas</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal visible={showFullMap} transparent animationType="fade" onRequestClose={() => setShowFullMap(false)}>
        <View style={s.mapModalBackdrop}>
          <ScrollView
            style={{ flex:1, width:"100%" }}
            contentContainerStyle={s.mapModalScrollContent}
            minimumZoomScale={1}
            maximumZoomScale={4}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          >
            <Image source={current.map} style={{ width: mapDims.width, height: mapDims.height }} resizeMode="contain" />
          </ScrollView>
          <TouchableOpacity style={s.mapModalCloseBtn} onPress={() => setShowFullMap(false)} activeOpacity={0.8}>
            <X size={20} color="#FFFFFF" weight="bold" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex:1, backgroundColor:BG },

  header:      { backgroundColor:SAGE, minHeight:160, position:"relative", overflow:"hidden", paddingHorizontal:20, paddingBottom:16 },
  headerTopRow:{ flexDirection:"row", alignItems:"center", justifyContent:"space-between" },
  backBtn:     { width:36, height:36, borderRadius:18, backgroundColor:CARD_BG, borderWidth:1, borderColor:"#D4D0CA", alignItems:"center", justifyContent:"center" },
  headerCenter:{ alignItems:"center", marginTop:16 },
  pageTitle:   { fontFamily:SERIF, fontSize:38, color:CARD_BG },
  pageSubtitle:{ fontSize:14, color:"rgba(255,255,255,0.75)", marginTop:1 },

  stepperRow: {
    flexDirection:"row", alignItems:"center", justifyContent:"space-between",
    paddingHorizontal:spacing(2.5), paddingVertical:10,
  },
  arrow: {
    width:36, height:36, borderRadius:18,
    backgroundColor:CARD_BG, borderWidth:1, borderColor:BORDER,
    alignItems:"center", justifyContent:"center",
  },
  arrowDim: { opacity:0.35 },
  pipRow:   { flexDirection:"row", gap:7, alignItems:"center" },
  pip:      { width:7, height:7, borderRadius:4, backgroundColor:"rgba(45,74,52,0.25)" },
  pipOn:    { width:22, backgroundColor:SAGE },

  mapWrap: { width:SW, backgroundColor:"#E4DDCC", position:"relative", marginBottom:16 },
  mapExpandHint: {
    position:"absolute", bottom:10, right:10,
    width:32, height:32, borderRadius:16,
    backgroundColor:"rgba(0,0,0,0.45)",
    alignItems:"center", justifyContent:"center",
  },
  mapModalBackdrop: { flex:1, backgroundColor:"rgba(10,8,6,0.94)", alignItems:"center", justifyContent:"center" },
  mapModalScrollContent: { flexGrow:1, alignItems:"center", justifyContent:"center" },
  mapModalCloseBtn: {
    position:"absolute", top:56, right:20,
    width:40, height:40, borderRadius:20,
    backgroundColor:"rgba(255,255,255,0.15)",
    alignItems:"center", justifyContent:"center",
  },

  padded: { paddingHorizontal:spacing(2.5) },

  photoCard: {
    borderRadius:16, overflow:"hidden", marginBottom:16,
    borderWidth:1, borderColor:BORDER,
    shadowColor:"#1C1408", shadowOffset:{ width:0, height:3 },
    shadowOpacity:0.08, shadowRadius:10, elevation:6,
  },
  photoImg: { width:"100%", height:180 },

  card: {
    backgroundColor:CARD_BG,
    borderRadius:20,
    borderWidth:1, borderColor:BORDER,
    padding:spacing(2.25),
    shadowColor:"#1C1408",
    shadowOffset:{ width:0, height:3 },
    shadowOpacity:0.08,
    shadowRadius:10,
    elevation:6,
  },
  cardTop:    { flexDirection:"row", alignItems:"center", gap:8, marginBottom:10, flexWrap:"wrap" },
  stepPill:   { backgroundColor:SAGE, borderRadius:50, paddingHorizontal:12, paddingVertical:4 },
  stepPillTxt:{ fontSize:12, color:"#fff", fontWeight:"600" },
  meta:       { fontSize:12, color:GOLD, fontWeight:"600" },
  title:      { fontFamily:SERIF, fontSize:24, color:TEXT, marginBottom:10, lineHeight:30 },
  desc:       { fontSize:16, color:"#3A3228", lineHeight:24, marginBottom:12 },
  note:       { fontSize:13, color:MUTED, fontStyle:"italic", lineHeight:19, marginBottom:12 },

  buttonsRow: { flexDirection:"row", gap:10, marginTop:4 },
  btnPrimary: {
    flex:1, flexDirection:"row", alignItems:"center", justifyContent:"center", gap:8,
    backgroundColor:SAGE, borderRadius:14, paddingVertical:14,
  },
  btnPrimaryTxt:   { fontSize:15, fontWeight:"700", color:"#FFFFFF" },
  btnSecondary: {
    flex:1, flexDirection:"row", alignItems:"center", justifyContent:"center", gap:8,
    backgroundColor:"#FFFFFF", borderRadius:14, paddingVertical:14,
    borderWidth:1.5, borderColor:SAGE,
  },
  btnSecondaryTxt: { fontSize:15, fontWeight:"700", color:SAGE },
});
