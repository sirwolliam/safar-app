/**
 * MediaScreen.jsx — Safar
 * Videos, podcasts and articles.
 * - Fixed-height type buttons (no size shift on switch)
 * - Pills with alignSelf:"flex-start" (no vertical stretch)
 * - Vibrant cards: bold icon containers with coloured shadows,
 *   coloured left accent border, strong type colour identity
 */
import React, { useState } from "react";
import {
  SafeAreaView, View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Linking,
} from "react-native";
import {
  ArrowLeft, YoutubeLogo, Microphone, Article, ArrowSquareOut,
} from "phosphor-react-native";
import { spacing, radius } from "../theme";

const { width: SW } = require("react-native").Dimensions.get("window");

const BG     = "#F5EFE4";
const CARD   = "#FDFAF4";
const SAGE   = "#4A5C48";
const GOLD   = "#B8922A";
const BORDER = "#E0D8CC";
const TEXT   = "#1C1A14";
const MUTED  = "#7A7060";
const SERIF  = "SourceSerif4-Regular";

// ── Type palette — rich, distinct ─────────────────────────────────────────────
const T = {
  video: {
    label:"Video",
    // deep crimson
    solid:   "#9B1C1C",
    light:   "#FDF2F2",
    mid:     "rgba(155,28,28,0.10)",
    border:  "rgba(155,28,28,0.35)",
    shadow:  "#9B1C1C",
    Icon:    YoutubeLogo,
  },
  podcast: {
    label:"Podcast",
    // deep violet
    solid:   "#4C1D95",
    light:   "#F5F0FF",
    mid:     "rgba(76,29,149,0.10)",
    border:  "rgba(76,29,149,0.35)",
    shadow:  "#4C1D95",
    Icon:    Microphone,
  },
  article: {
    label:"Article",
    // deep ocean blue
    solid:   "#1E3A5F",
    light:   "#EFF6FF",
    mid:     "rgba(30,58,95,0.10)",
    border:  "rgba(30,58,95,0.35)",
    shadow:  "#1E3A5F",
    Icon:    Article,
  },
};

// ── Content ───────────────────────────────────────────────────────────────────
const MEDIA = [
  {
    id:"ministry-hajj", type:"video", tags:["hajj","practical"],
    title:"Hajj Step by Step \u2014 Official",
    source:"Saudi Ministry of Hajj",
    desc:"The official YouTube channel of the Saudi Ministry of Hajj \u2014 authenticated guidance direct from the source.",
    url:"https://www.youtube.com/@HajjMinistry",
  },
  {
    id:"menk-umrah", type:"video", tags:["umrah","practical"],
    title:"Umrah Guide \u2014 Mufti Menk",
    source:"YouTube",
    desc:"Step-by-step Umrah walkthrough from Mufti Ismail Menk \u2014 clear, accessible and widely recommended for first-time pilgrims.",
    url:"https://www.youtube.com/results?search_query=mufti+menk+umrah+guide",
  },
  {
    id:"yaqeen-hajj", type:"video", tags:["hajj","spiritual"],
    title:"The Spirituality of Hajj",
    source:"Yaqeen Institute",
    desc:"A video series on the deeper spiritual meaning behind each ritual of Hajj \u2014 ideal for building your mindset before travel.",
    url:"https://yaqeeninstitute.org",
  },
  {
    id:"deenshow-hajj", type:"podcast", tags:["hajj","practical"],
    title:"Preparing for Hajj",
    source:"The Deen Show",
    desc:"Audio guide covering the practical and spiritual preparation for Hajj \u2014 including what to expect and how to maximise your journey.",
    url:"https://thedeenshow.com",
  },
  {
    id:"qalam-hajj", type:"podcast", tags:["hajj","umrah","spiritual"],
    title:"Hajj & Umrah Prep Series",
    source:"Qalam Institute",
    desc:"Podcast and video resources covering both Hajj and Umrah \u2014 spiritual preparation, duas and practical tips.",
    url:"https://www.qalaminstitute.org",
  },
  {
    id:"seekers", type:"article", tags:["hajj","umrah","spiritual","practical"],
    title:"Hajj & Umrah Guidance",
    source:"SeekersGuidance.org",
    desc:"Online Islamic courses and fatwa service with detailed scholarly guidance on Hajj and Umrah rites across madhabs.",
    url:"https://seekersguidance.org",
  },
  {
    id:"islamqa", type:"article", tags:["hajj","umrah","practical"],
    title:"Hajj & Umrah Q&A",
    source:"IslamQA.info",
    desc:"Comprehensive scholarly Q&A on fiqh and worship \u2014 search for specific questions about your pilgrimage rites.",
    url:"https://islamqa.info/en",
  },
  {
    id:"sunnah", type:"article", tags:["hajj","umrah","spiritual"],
    title:"Hadith on Hajj & Umrah",
    source:"Sunnah.com",
    desc:"Search authenticated hadith collections \u2014 Bukhari, Muslim and more \u2014 for the Prophet\u2019s \uFE0F guidance on pilgrimage.",
    url:"https://sunnah.com",
  },
  {
    id:"islamweb", type:"article", tags:["hajj","umrah","practical"],
    title:"Fatawa & Research",
    source:"Islamweb.net",
    desc:"Fatawa, Quran and hadith research covering all aspects of Hajj and Umrah preparation and performance.",
    url:"https://www.islamweb.net/en",
  },
];

const TOPICS = [
  { key:"all",       label:"All"        },
  { key:"umrah",     label:"Umrah"      },
  { key:"hajj",      label:"Hajj"       },
  { key:"spiritual", label:"Spiritual"  },
  { key:"practical", label:"Practical"  },
];

// ── Type filter buttons — fixed height ────────────────────────────────────────
const BTN_H = 96;

function TypeButtons({ active, onSelect }) {
  const types = [
    { key:"all",     label:"All",     icon:null },
    { key:"video",   label:"Video",   icon:T.video   },
    { key:"podcast", label:"Podcast", icon:T.podcast },
    { key:"article", label:"Article", icon:T.article },
  ];

  return (
    <View style={tb.row}>
      {types.map(({ key, label, icon:conf }) => {
        const on = active === key;
        return (
          <TouchableOpacity
            key={key}
            style={[
              tb.btn,
              on && conf  && { backgroundColor:conf.light, borderColor:conf.solid, borderWidth:2 },
              on && !conf && { backgroundColor:"#E8F0E8", borderColor:SAGE, borderWidth:2 },
            ]}
            onPress={() => onSelect(key)}
            activeOpacity={0.82}
          >
            {/* Icon box */}
            <View style={[
              tb.iconBox,
              on && conf  && { backgroundColor:conf.solid, shadowColor:conf.shadow, shadowOpacity:0.55, shadowRadius:10, shadowOffset:{width:0,height:5}, elevation:8 },
              on && !conf && { backgroundColor:SAGE,        shadowColor:SAGE,        shadowOpacity:0.40, shadowRadius:8,  shadowOffset:{width:0,height:4}, elevation:6 },
              !on         && { backgroundColor:"#E2DDD6" },
            ]}>
              {key === "all" ? (
                <View style={tb.cluster}>
                  <YoutubeLogo size={9}  color={on?"#fff":MUTED} weight="fill"/>
                  <Microphone  size={9}  color={on?"#fff":MUTED} weight="fill"/>
                  <Article     size={9}  color={on?"#fff":MUTED} weight="fill"/>
                </View>
              ) : conf ? (
                <conf.Icon size={26} color={on?"#fff":conf.solid} weight={on?"fill":"thin"}/>
              ) : null}
            </View>
            {/* Label */}
            <Text style={[
              tb.label,
              on && conf  && { color:conf.solid, fontWeight:"700" },
              on && !conf && { color:SAGE,       fontWeight:"700" },
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tb = StyleSheet.create({
  row:     { flexDirection:"row", paddingHorizontal:spacing(2), gap:10, marginBottom:12 },
  btn:     {
    flex:1, height:BTN_H,
    alignItems:"center", justifyContent:"center", gap:9,
    backgroundColor:CARD,
    borderRadius:radius.lg, borderWidth:1.5, borderColor:BORDER,
  },
  iconBox: {
    width:46, height:46, borderRadius:13,
    alignItems:"center", justifyContent:"center",
  },
  cluster: { flexDirection:"row", flexWrap:"wrap", gap:3, width:22, alignItems:"center", justifyContent:"center" },
  label:   { fontSize:12, color:MUTED, fontWeight:"500" },
});

// ── Media card — vibrant ──────────────────────────────────────────────────────
function MediaCard({ item }) {
  const conf = T[item.type];
  const Icon = conf.Icon;

  return (
    <TouchableOpacity
      style={[mc.card, { borderLeftColor:conf.solid }]}
      onPress={() => Linking.openURL(item.url)}
      activeOpacity={0.85}
    >
      {/* Top row: icon + badge + arrow */}
      <View style={mc.topRow}>
        {/* Large icon — coloured with shadow */}
        <View style={[mc.iconWrap, {
          backgroundColor:conf.solid,
          shadowColor:conf.shadow,
          shadowOpacity:0.55,
          shadowRadius:12,
          shadowOffset:{width:0,height:6},
          elevation:10,
        }]}>
          <Icon size={28} color="#fff" weight="fill"/>
        </View>

        <View style={mc.topRight}>
          {/* Type badge */}
          <View style={[mc.badge, { backgroundColor:conf.mid, borderColor:conf.border, borderWidth:1 }]}>
            <Icon size={10} color={conf.solid} weight="fill"/>
            <Text style={[mc.badgeTxt, { color:conf.solid }]}>{conf.label}</Text>
          </View>
          <ArrowSquareOut size={17} color={MUTED} weight="regular"/>
        </View>
      </View>

      {/* Title */}
      <Text style={mc.title}>{item.title}</Text>

      {/* Source */}
      <Text style={[mc.source, { color:conf.solid }]}>{item.source}</Text>

      {/* Desc */}
      <Text style={mc.desc}>{item.desc}</Text>
    </TouchableOpacity>
  );
}

const mc = StyleSheet.create({
  card: {
    backgroundColor:CARD,
    borderRadius:radius.lg,
    borderWidth:1, borderColor:BORDER,
    borderLeftWidth:4,
    padding:spacing(2),
    marginBottom:spacing(1.75),
    shadowColor:"#1C1A14",
    shadowOffset:{width:0,height:3},
    shadowOpacity:0.08,
    shadowRadius:8,
    elevation:3,
  },
  topRow:   { flexDirection:"row", alignItems:"center", gap:14, marginBottom:14 },
  iconWrap: { width:54, height:54, borderRadius:14, alignItems:"center", justifyContent:"center", flexShrink:0 },
  topRight: { flex:1, flexDirection:"row", alignItems:"center", justifyContent:"space-between" },
  badge:    { flexDirection:"row", alignItems:"center", gap:5, paddingHorizontal:10, paddingVertical:5, borderRadius:50 },
  badgeTxt: { fontSize:11, fontWeight:"700", letterSpacing:0.3 },
  title:    { fontFamily:SERIF, fontSize:18, color:TEXT, marginBottom:4, lineHeight:26 },
  source:   { fontSize:12, fontWeight:"700", letterSpacing:0.3, marginBottom:10 },
  desc:     { fontSize:13, color:MUTED, lineHeight:21 },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function MediaScreen({ navigation, route }) {
  const initialFilter = route?.params?.filter ?? "all";
  const [topicFilter, setTopicFilter] = useState(initialFilter);
  const [typeFilter,  setTypeFilter]  = useState("all");

  const filtered = MEDIA.filter(m => {
    const topicMatch = topicFilter === "all" || m.tags.includes(topicFilter);
    const typeMatch  = typeFilter  === "all" || m.type === typeFilter;
    return topicMatch && typeMatch;
  });

  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <ArrowLeft size={20} color={TEXT} weight="regular"/>
        </TouchableOpacity>
        <View style={s.hCenter}>
          <Text style={s.hTitle}>Watch & Listen</Text>
          <Text style={s.hSub}>Videos, podcasts and articles</Text>
        </View>
        <View style={{ width:36 }}/>
      </View>

      {/* Type buttons */}
      <TypeButtons active={typeFilter} onSelect={setTypeFilter}/>

      {/* Topic pills — alignSelf on each pill prevents vertical stretch */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.pillScroll}
        contentContainerStyle={s.pillRow}
      >
        {TOPICS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[s.pill, topicFilter===f.key && s.pillOn]}
            onPress={() => setTopicFilter(f.key)}
            activeOpacity={0.8}
          >
            <Text style={[s.pillTxt, topicFilter===f.key && s.pillTxtOn]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Count */}
      <Text style={s.count}>
        {filtered.length} resource{filtered.length !== 1 ? "s" : ""}
      </Text>

      {/* List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.list}>
        {filtered.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyTxt}>No resources match this combination.</Text>
            <TouchableOpacity
              onPress={() => { setTypeFilter("all"); setTopicFilter("all"); }}
              activeOpacity={0.8}
            >
              <Text style={s.emptyLink}>Clear filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map(item => <MediaCard key={item.id} item={item}/>)
        )}
        <View style={s.footer}>
          <Text style={s.footerTxt}>
            All links open in your browser or app. Safar is not affiliated with these resources.
          </Text>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex:1, backgroundColor:BG },

  header:  { flexDirection:"row", alignItems:"center", paddingHorizontal:spacing(2), paddingTop:spacing(1.75), paddingBottom:spacing(1.5) },
  backBtn: { width:36, height:36, borderRadius:18, backgroundColor:CARD, borderWidth:1, borderColor:BORDER, alignItems:"center", justifyContent:"center" },
  hCenter: { flex:1, alignItems:"center" },
  hTitle:  { fontFamily:SERIF, fontSize:22, color:TEXT },
  hSub:    { fontSize:13, color:MUTED, marginTop:2 },

  // Pills — fixed height scroll row
  pillScroll: { flexGrow:0 },
  pillRow:    { paddingHorizontal:spacing(2), paddingBottom:spacing(1.5), gap:8, flexDirection:"row", alignItems:"center" },
  pill:       { alignSelf:"flex-start", paddingHorizontal:16, paddingVertical:8, borderRadius:50, borderWidth:1, borderColor:BORDER, backgroundColor:CARD },
  pillOn:     { backgroundColor:SAGE, borderColor:SAGE },
  pillTxt:    { fontSize:13, color:MUTED, fontWeight:"500" },
  pillTxtOn:  { color:"#fff" },

  count: { fontSize:12, color:MUTED, paddingHorizontal:spacing(2), marginBottom:spacing(1.25) },
  list:  { paddingHorizontal:spacing(2), paddingBottom:spacing(4) },

  empty:    { alignItems:"center", paddingVertical:spacing(4), gap:12 },
  emptyTxt: { fontSize:15, color:MUTED, textAlign:"center" },
  emptyLink:{ fontSize:14, color:SAGE, fontWeight:"600" },

  footer:    { borderTopWidth:1, borderTopColor:BORDER, paddingTop:spacing(1.5), marginTop:spacing(1) },
  footerTxt: { fontSize:11, color:MUTED, textAlign:"center", lineHeight:18, fontStyle:"italic" },
});
