/**
 * PilgrimageDuasScreen.jsx — Safar
 *
 * Single screen for both Umrah and Hajj du'ā collections.
 * Route param: { mode: "umrah" | "hajj" }
 *
 * Matches reference design exactly:
 * - Back circle + centered serif title + du'ā count
 * - Per stage: card-width rounded image, STAGE pill, large stage name
 * - Below image: icon circle + serif stage title + description paragraph
 * - "Du'ās for [Stage]" section label
 * - Each du'ā as its own separate card: icon circle + serif title + subtitle + chevron
 */
import React, { useMemo } from "react";
import {
  SafeAreaView, View, Text, ScrollView,
  TouchableOpacity, StyleSheet, ImageBackground,
} from "react-native";
import { colors, spacing, radius, shadows } from "../theme";
import { UMRAH_DUAS, HAJJ_DUAS } from "../duaContent";

const SERIF   = "SourceSerif4-Regular";
const BG      = "#F5F0E8";
const CARD    = "#FFFFFF";
const SAGE    = "#4A5C48";
const GOLD    = "#B8922A";
const BORDER  = "#EAE4DC";

// ── Stage order ────────────────────────────────────────────────────────────────
const UMRAH_STAGE_ORDER = [
  "Ihram", "Arrival", "Tawaf", "Maqam", "Sa'y",
  "Zamzam", "Completion", "Farewell",
];
const HAJJ_STAGE_ORDER = [
  "Ihram", "Arrival", "Tawaf", "Maqam", "Sa'y",
  "Zamzam", "Arafah", "Muzdalifah", "Mina",
  "Completion", "Madinah", "Farewell", "General",
];

// ── Stage metadata ─────────────────────────────────────────────────────────────
const STAGE_META = {
  "Ihram": {
    image:       require("../assets/02_ihram_gradient.jpg"),
    emoji:       "🪴",
    title:       "Entering Ihrām",
    description: "Ihrām marks the beginning of your sacred journey. Make your intention, recite the Talbiyah, and enter the state of spiritual purity that will carry you through every rite.",
  },
  "Arrival": {
    image:       require("../assets/01_arrival_gradient.jpg"),
    emoji:       "🕌",
    title:       "Arrival at the Ḥaram",
    description: "Entering Masjid al-Ḥarām for the first time is a moment many pilgrims describe as life-changing. Prepare your heart and your du'ā before you step inside.",
  },
  "Tawaf": {
    image:       require("../assets/04_tawaf_gradient.jpg"),
    emoji:       "🕋",
    title:       "Ṭawāf",
    description: "Circling the Ka'bah seven times is an act of worship performed by millions simultaneously. Begin at the Black Stone and keep the Ka'bah to your left throughout.",
  },
  "Maqam": {
    image:       require("../assets/04_tawaf_gradient.jpg"),
    emoji:       "📿",
    title:       "Maqām Ibrāhīm",
    description: "After Ṭawāf, pray two rak'ahs behind Maqām Ibrāhīm — the standing place of Prophet Ibrāhīm. Recite Sūrat al-Kāfirūn and al-Ikhlāṣ in these rak'ahs.",
  },
  "Sa'y": {
    image:       require("../assets/05_sai_gradient.jpg"),
    emoji:       "🚶",
    title:       "Sa'y between Ṣafā and Marwah",
    description: "Walking seven lengths between Ṣafā and Marwah commemorates Hājar's search for water. Begin at Ṣafā, ascend, face the Ka'bah, and make du'ā before walking to Marwah.",
  },
  "Zamzam": {
    image:       require("../assets/01_arrival_gradient.jpg"),
    emoji:       "💧",
    title:       "Drinking Zamzam",
    description: "Zamzam is the blessed water that sustained Hājar and Ismā'īl. Drink facing the Ka'bah and make du'ā — it is water for whatever purpose it is drunk.",
  },
  "Arafah": {
    image:       require("../assets/07_arafah_gradient.jpg"),
    emoji:       "🌅",
    title:       "Standing at 'Arafah",
    description: "The standing at 'Arafah is the heart of Hajj — 'Hajj is 'Arafah.' Spend the afternoon in constant du'ā, dhikr and seeking forgiveness. This is the day Allah frees most from the Fire.",
  },
  "Muzdalifah": {
    image:       require("../assets/08_muzdalifah_gradient.jpg"),
    emoji:       "🌙",
    title:       "Night at Muzdalifah",
    description: "After leaving 'Arafah, spend the night at Muzdalifah under the open sky. Collect your pebbles for stoning and combine Maghrib and 'Ishā' prayers here.",
  },
  "Mina": {
    image:       require("../assets/06_mina_gradient.jpg"),
    emoji:       "⛺",
    title:       "At Minā",
    description: "At Minā, we stone the Jamarāt and complete the rites of Ḥajj. These du'ās help us stay mindful and seek Allah's acceptance throughout the days of Minā.",
  },
  "Completion": {
    image:       require("../assets/01_arrival_gradient.jpg"),
    emoji:       "✅",
    title:       "Completion",
    description: "Shaving or trimming the hair marks the completion of your pilgrimage rites and the exit from Ihrām. Make du'ā with gratitude for what you have been able to complete.",
  },
  "Madinah": {
    image:       require("../assets/03_journey_gradient.jpg"),
    emoji:       "💚",
    title:       "Visiting Madīnah",
    description: "Visiting the city of the Prophet ﷺ is a gift. Pray in Masjid al-Nabawī, send abundant ṣalawāt upon the Prophet, and visit his blessed grave with reverence and love.",
  },
  "Farewell": {
    image:       require("../assets/01_arrival_gradient.jpg"),
    emoji:       "🤲",
    title:       "Farewell Ṭawāf",
    description: "The farewell Ṭawāf is the last act before leaving Makkah. Leave with your heart full, your du'ās made, and the intention to return.",
  },
  "General": {
    image:       require("../assets/03_journey_gradient.jpg"),
    emoji:       "🤲",
    title:       "General Du'ās",
    description: "These du'ās are for every moment of your pilgrimage — for gratitude, guidance, and closeness to Allah throughout the journey.",
  },
};

function getMeta(stage) {
  return STAGE_META[stage] ?? {
    image:       require("../assets/01_arrival_gradient.jpg"),
    emoji:       "🤲",
    title:       stage,
    description: "For remembrance and supplication.",
  };
}

// ── Individual du'ā card (each dua is its own card, matching reference) ────────
function DuaCard({ dua, onPress, meta }) {
  return (
    <TouchableOpacity
      style={dc.card}
      onPress={onPress}
      activeOpacity={0.78}
    >
      {/* Icon circle */}
      <View style={dc.iconWrap}>
        <Text style={dc.icon}>{meta.emoji}</Text>
      </View>

      {/* Text block */}
      <View style={dc.textWrap}>
        <Text style={dc.title}>{dua.title}</Text>
        <Text style={dc.sub} numberOfLines={1}>{dua.subtitle}</Text>
      </View>

      {/* Chevron */}
      <Text style={dc.chevron}>›</Text>
    </TouchableOpacity>
  );
}
const dc = StyleSheet.create({
  card:     {
    flexDirection:"row",
    alignItems:"center",
    backgroundColor:CARD,
    borderRadius:14,
    borderWidth:1,
    borderColor:BORDER,
    paddingHorizontal:16,
    paddingVertical:14,
    marginBottom:10,
    ...shadows.card,
  },
  iconWrap: {
    width:46,
    height:46,
    borderRadius:23,
    backgroundColor:"#EEF0EC",
    alignItems:"center",
    justifyContent:"center",
    marginRight:14,
    flexShrink:0,
  },
  icon:     { fontSize:22 },
  textWrap: { flex:1 },
  title:    { fontFamily:SERIF, fontSize:17, color:"#1C1A14", fontWeight:"400", marginBottom:3 },
  sub:      { fontSize:13, color:"#7A7060", lineHeight:18 },
  chevron:  { fontSize:22, color:GOLD, marginLeft:8 },
});

// ── Stage section — matches reference exactly ──────────────────────────────────
function StageSection({ stage, duas, allDuas, navigation }) {
  const meta = getMeta(stage);
  return (
    <View style={ss.block}>

      {/* Card-sized image — rounded corners, horizontal margin */}
      <ImageBackground
        source={meta.image}
        style={ss.image}
        imageStyle={ss.imageRadius}
        resizeMode="cover"
      >
        <View style={ss.scrim} />
        <View style={ss.stagePillWrap}>
          <Text style={ss.stagePillTxt}>STAGE</Text>
        </View>
        <Text style={ss.stageName}>{stage === "Sa'y" ? "Sa'y" : stage}</Text>
      </ImageBackground>

      {/* Stage icon + title + description */}
      <View style={ss.infoRow}>
        <View style={ss.infoIcon}>
          <Text style={ss.infoIconTxt}>{meta.emoji}</Text>
        </View>
        <View style={ss.infoText}>
          <Text style={ss.infoTitle}>{meta.title}</Text>
          <Text style={ss.infoDesc}>{meta.description}</Text>
        </View>
      </View>

      {/* "Du'ās for [Stage]" label */}
      <Text style={ss.sectionLabel}>{"Du\u02bfās for " + (stage === "Sa'y" ? "Sa\u02bfy" : stage)}</Text>

      {/* Individual du'ā cards */}
      {duas.map(dua => (
        <DuaCard
          key={dua.id}
          dua={dua}
          meta={meta}
          onPress={() => navigation.navigate("DuaDetail", {
            dua,
            allDuas,
            currentIndex: allDuas.indexOf(dua),
          })}
        />
      ))}
    </View>
  );
}

const ss = StyleSheet.create({
  block:       { marginBottom:spacing(2.5) },

  // Card image — inset with margin and rounded corners
  image:       {
    height:200,
    marginHorizontal:spacing(2.5),
    borderRadius:16,
    overflow:"hidden",
    justifyContent:"flex-end",
    padding:16,
    marginBottom:0,
  },
  imageRadius: { borderRadius:16 },
  scrim:       {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:"rgba(8,14,6,0.38)",
    borderRadius:16,
  },
  stagePillWrap: {
    position:"absolute",
    top:14,
    left:14,
    backgroundColor:"rgba(74,92,72,0.88)",
    borderRadius:50,
    paddingHorizontal:10,
    paddingVertical:4,
  },
  stagePillTxt: {
    fontSize:10,
    color:"rgba(255,255,255,0.92)",
    fontWeight:"700",
    letterSpacing:1.5,
    textTransform:"uppercase",
  },
  stageName: {
    fontFamily:SERIF,
    fontSize:36,
    color:"#fff",
    fontWeight:"600",
  },

  // Info row — icon circle left, title + description right
  infoRow:   {
    flexDirection:"row",
    alignItems:"flex-start",
    paddingHorizontal:spacing(2.5),
    paddingTop:spacing(2),
    paddingBottom:spacing(1.5),
    gap:14,
  },
  infoIcon:  {
    width:52,
    height:52,
    borderRadius:26,
    backgroundColor:"#EEF0EC",
    alignItems:"center",
    justifyContent:"center",
    flexShrink:0,
    marginTop:2,
  },
  infoIconTxt:{ fontSize:24 },
  infoText:  { flex:1 },
  infoTitle: {
    fontFamily:SERIF,
    fontSize:22,
    color:"#1C1A14",
    fontWeight:"600",
    marginBottom:6,
  },
  infoDesc:  {
    fontSize:15,
    color:"#5C5040",
    lineHeight:23,
  },

  // Section label
  sectionLabel: {
    fontFamily:SERIF,
    fontSize:18,
    color:"#1C1A14",
    fontWeight:"500",
    marginHorizontal:spacing(2.5),
    marginBottom:spacing(1.25),
  },
});

// ── Screen ─────────────────────────────────────────────────────────────────────
export default function PilgrimageDuasScreen({ route, navigation }) {
  const mode    = route?.params?.mode ?? "umrah";
  const isUmrah = mode === "umrah";

  const allDuas    = isUmrah ? UMRAH_DUAS : HAJJ_DUAS;
  const stageOrder = isUmrah ? UMRAH_STAGE_ORDER : HAJJ_STAGE_ORDER;
  const title      = isUmrah ? "My Umrah Journey" : "My Hajj Journey";

  const grouped = useMemo(() => {
    const map = {};
    allDuas.forEach(d => {
      if (!map[d.stage]) map[d.stage] = [];
      map[d.stage].push(d);
    });
    return map;
  }, [allDuas]);

  const stages = stageOrder.filter(s => grouped[s]?.length > 0);

  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => navigation?.goBack?.()}
          activeOpacity={0.8}
        >
          <Text style={s.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>{title}</Text>
          <Text style={s.headerSub}>{allDuas.length} du\u02bfās</Text>
        </View>
        <View style={{ width:36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {stages.map(stage => (
          <StageSection
            key={stage}
            stage={stage}
            duas={grouped[stage]}
            allDuas={allDuas}
            navigation={navigation}
          />
        ))}

        {/* Scholarly footnote */}
        <View style={s.footnote}>
          <Text style={s.footnoteText}>
            <Text style={s.footnoteBold}>Sources </Text>
            {"— Du\u02bfās drawn from Ṣaḥīḥ al-Bukhārī, Ṣaḥīḥ Muslim, Sunan Abī Dāwūd, Sunan al-Tirmidhī, Sunan Ibn Mājah and established scholarly works. Wording may differ across the four madhhabs. Consult a qualified scholar for rulings specific to your school of thought."}
          </Text>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex:1, backgroundColor:BG },

  header: {
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    paddingHorizontal:spacing(2.5),
    paddingTop:spacing(2),
    paddingBottom:spacing(1.5),
    borderBottomWidth:1,
    borderBottomColor:BORDER,
    backgroundColor:BG,
  },
  backBtn: {
    width:36,
    height:36,
    borderRadius:18,
    backgroundColor:CARD,
    borderWidth:1,
    borderColor:BORDER,
    alignItems:"center",
    justifyContent:"center",
  },
  backArrow:    { fontSize:24, color:"#1C1A14", lineHeight:28 },
  headerCenter: { flex:1, alignItems:"center", paddingHorizontal:spacing(1) },
  headerTitle:  { fontFamily:SERIF, fontSize:22, color:"#1C1A14", fontWeight:"400" },
  headerSub:    { fontSize:12, color:"#7A7060", marginTop:2 },

  scrollContent: {
    paddingTop:spacing(3),
    paddingBottom:spacing(5),
  },

  footnote:     {
    marginHorizontal:spacing(2.5),
    marginTop:spacing(1),
    backgroundColor:"#F5EDD8",
    borderRadius:12,
    borderWidth:1,
    borderColor:"#E8D9B8",
    padding:14,
  },
  footnoteText: { fontSize:12, color:"#7A6030", lineHeight:18 },
  footnoteBold: { fontWeight:"600" },
});
