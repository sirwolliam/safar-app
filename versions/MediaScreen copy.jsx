/**
 * MediaScreen.jsx — Safar
 * Videos, podcasts and articles for Hajj & Umrah preparation.
 * All content links externally — no in-app playback.
 * Filter by topic: All · Umrah · Hajj · Spiritual · Practical
 */
import React, { useState } from "react";
import {
  SafeAreaView, View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Linking,
} from "react-native";
import { ArrowLeft, YoutubeLogo, Microphone, Article, ArrowSquareOut } from "phosphor-react-native";
import { spacing, radius } from "../theme";

const BG     = "#F5EFE4";
const CARD   = "#FDFAF4";
const SAGE   = "#4A5C48";
const GOLD   = "#B8922A";
const BORDER = "#E0D8CC";
const TEXT   = "#1C1A14";
const MUTED  = "#7A7060";
const SERIF  = "SourceSerif4-Regular";

// ── Media content ─────────────────────────────────────────────────────────────
const MEDIA = [
  // ── Videos ──
  {
    id:      "ministry-hajj",
    type:    "video",
    tags:    ["hajj", "practical"],
    title:   "Hajj Step by Step — Official",
    source:  "Saudi Ministry of Hajj",
    desc:    "The official YouTube channel of the Saudi Ministry of Hajj — authenticated guidance direct from the source.",
    url:     "https://www.youtube.com/@HajjMinistry",
  },
  {
    id:      "menk-umrah",
    type:    "video",
    tags:    ["umrah", "practical"],
    title:   "Umrah Guide — Mufti Menk",
    source:  "YouTube",
    desc:    "Step-by-step Umrah walkthrough from Mufti Ismail Menk — clear, accessible and widely recommended for first-time pilgrims.",
    url:     "https://www.youtube.com/results?search_query=mufti+menk+umrah+guide",
  },
  {
    id:      "yaqeen-hajj",
    type:    "video",
    tags:    ["hajj", "spiritual"],
    title:   "The Spirituality of Hajj",
    source:  "Yaqeen Institute",
    desc:    "A video series exploring the deeper spiritual meaning behind each ritual of Hajj — ideal for building your mindset before travel.",
    url:     "https://yaqeeninstitute.org",
  },

  // ── Podcasts ──
  {
    id:      "deenshow-hajj",
    type:    "podcast",
    tags:    ["hajj", "practical"],
    title:   "Preparing for Hajj",
    source:  "The Deen Show",
    desc:    "Audio guide covering the practical and spiritual preparation for Hajj — including what to expect and how to maximise your journey.",
    url:     "https://thedeenshow.com",
  },
  {
    id:      "qalam-hajj",
    type:    "podcast",
    tags:    ["hajj", "umrah", "spiritual"],
    title:   "Hajj & Umrah Prep Series",
    source:  "Qalam Institute",
    desc:    "Podcast and video resources from Qalam Institute covering both Hajj and Umrah — spiritual preparation, duas and practical tips.",
    url:     "https://www.qalaminstitute.org",
  },

  // ── Articles & Scholars ──
  {
    id:      "seekers",
    type:    "article",
    tags:    ["hajj", "umrah", "spiritual", "practical"],
    title:   "Hajj & Umrah Guidance",
    source:  "SeekersGuidance.org",
    desc:    "Online Islamic courses and fatwa service — including detailed scholarly guidance on Hajj and Umrah rites across madhabs.",
    url:     "https://seekersguidance.org",
  },
  {
    id:      "islamqa",
    type:    "article",
    tags:    ["hajj", "umrah", "practical"],
    title:   "Hajj & Umrah Q&A",
    source:  "IslamQA.info",
    desc:    "Comprehensive scholarly Q&A on fiqh and worship — search for specific questions about your pilgrimage rites.",
    url:     "https://islamqa.info/en",
  },
  {
    id:      "sunnah",
    type:    "article",
    tags:    ["hajj", "umrah", "spiritual"],
    title:   "Hadith on Hajj & Umrah",
    source:  "Sunnah.com",
    desc:    "Search the complete authenticated hadith collections — Bukhari, Muslim and more — for the Prophet\u2019s \uFE0F guidance on pilgrimage.",
    url:     "https://sunnah.com",
  },
  {
    id:      "islamweb",
    type:    "article",
    tags:    ["hajj", "umrah", "practical"],
    title:   "Fatawa & Research",
    source:  "Islamweb.net",
    desc:    "Fatawa, Quran and hadith research covering all aspects of Hajj and Umrah preparation and performance.",
    url:     "https://www.islamweb.net/en",
  },
];

const TYPE_CONFIG = {
  video:   { label:"Video",   color:"#B84040", bg:"#FAEAEA", Icon:YoutubeLogo  },
  podcast: { label:"Podcast", color:"#6B4AB8", bg:"#F0EAFA", Icon:Microphone   },
  article: { label:"Article", color:"#2A6B4A", bg:"#E6F2EC", Icon:Article      },
};

// ── Media card ────────────────────────────────────────────────────────────────
function MediaCard({ item }) {
  const conf = TYPE_CONFIG[item.type];
  const { Icon } = conf;

  return (
    <TouchableOpacity
      style={mc.card}
      onPress={() => Linking.openURL(item.url)}
      activeOpacity={0.85}
    >
      {/* Large icon + type badge row */}
      <View style={mc.topRow}>
        <View style={[mc.iconWrap, { backgroundColor:conf.bg }]}>
          <Icon size={28} color={conf.color} weight="thin"/>
        </View>
        <View style={mc.topRight}>
          <View style={[mc.typeBadge, { backgroundColor:conf.bg }]}>
            <Text style={[mc.typeLabel, { color:conf.color }]}>{conf.label}</Text>
          </View>
          <ArrowSquareOut size={16} color={MUTED} weight="regular"/>
        </View>
      </View>

      {/* Title + source */}
      <Text style={mc.title}>{item.title}</Text>
      <Text style={mc.source}>{item.source}</Text>

      {/* Description */}
      <Text style={mc.desc}>{item.desc}</Text>
    </TouchableOpacity>
  );
}

const mc = StyleSheet.create({
  card:      { backgroundColor:CARD, borderRadius:radius.lg, borderWidth:1, borderColor:BORDER, padding:spacing(2), marginBottom:spacing(1.5) },
  topRow:    { flexDirection:"row", alignItems:"center", gap:14, marginBottom:12 },
  iconWrap:  { width:52, height:52, borderRadius:14, alignItems:"center", justifyContent:"center", flexShrink:0 },
  topRight:  { flex:1, flexDirection:"row", alignItems:"center", justifyContent:"space-between" },
  typeBadge: { paddingHorizontal:10, paddingVertical:4, borderRadius:50 },
  typeLabel: { fontSize:11, fontWeight:"700", letterSpacing:0.5 },
  title:     { fontFamily:SERIF, fontSize:17, color:TEXT, marginBottom:3 },
  source:    { fontSize:12, color:GOLD, fontWeight:"600", marginBottom:8 },
  desc:      { fontSize:13, color:MUTED, lineHeight:20 },
});

const TOPIC_FILTERS = [
  { key:"all",       label:"All"       },
  { key:"umrah",     label:"Umrah"     },
  { key:"hajj",      label:"Hajj"      },
  { key:"spiritual", label:"Spiritual" },
  { key:"practical", label:"Practical" },
];

const TYPE_FILTERS = [
  { key:"all",     label:"All types",  Icon:null             },
  { key:"video",   label:"Videos",    Icon:YoutubeLogo       },
  { key:"podcast", label:"Podcasts",  Icon:Microphone        },
  { key:"article", label:"Articles",  Icon:Article           },
];

// ── Type filter cards — large icons ──────────────────────────────────────────
function TypeFilterRow({ activeType, onSelect }) {
  return (
    <View style={tf.row}>
      {TYPE_FILTERS.map(t => {
        const active = activeType === t.key;
        const conf   = TYPE_CONFIG[t.key];
        const color  = conf ? conf.color : SAGE;
        const bg     = conf ? conf.bg    : "#EEF2EE";
        const { Icon } = t;

        return (
          <TouchableOpacity
            key={t.key}
            style={[
              tf.card,
              active && { backgroundColor: conf ? conf.bg : "#E6EEE6", borderColor: color },
            ]}
            onPress={() => onSelect(t.key)}
            activeOpacity={0.82}
          >
            {Icon ? (
              <Icon
                size={32}
                color={active ? color : MUTED}
                weight={active ? "fill" : "thin"}
              />
            ) : (
              <View style={tf.allDots}>
                <YoutubeLogo size={14} color={active ? SAGE : MUTED} weight={active?"fill":"thin"}/>
                <Microphone  size={14} color={active ? SAGE : MUTED} weight={active?"fill":"thin"}/>
                <Article     size={14} color={active ? SAGE : MUTED} weight={active?"fill":"thin"}/>
              </View>
            )}
            <Text style={[tf.label, active && { color, fontWeight:"700" }]}>
              {t.label}
            </Text>
            {active && <View style={[tf.dot, { backgroundColor:color }]}/>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tf = StyleSheet.create({
  row:     { flexDirection:"row", paddingHorizontal:spacing(2), gap:10, marginBottom:spacing(1.5) },
  card:    {
    flex:1, alignItems:"center", justifyContent:"center",
    paddingVertical:16, gap:8,
    backgroundColor:CARD, borderRadius:radius.lg,
    borderWidth:1.5, borderColor:BORDER,
  },
  allDots: { flexDirection:"row", gap:3, alignItems:"center" },
  label:   { fontSize:12, color:MUTED, fontWeight:"500", textAlign:"center" },
  dot:     { width:5, height:5, borderRadius:3, marginTop:2 },
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

      {/* Type filter — large icon cards */}
      <TypeFilterRow activeType={typeFilter} onSelect={setTypeFilter}/>

      {/* Topic filter — pill row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.topics}
      >
        {TOPIC_FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[s.topicPill, topicFilter===f.key && s.topicPillOn]}
            onPress={() => setTopicFilter(f.key)}
            activeOpacity={0.8}
          >
            <Text style={[s.topicTxt, topicFilter===f.key && s.topicTxtOn]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Count */}
      <Text style={s.count}>
        {filtered.length} resource{filtered.length !== 1 ? "s" : ""}
        {typeFilter !== "all" || topicFilter !== "all"
          ? " — tap a filter to clear"
          : ""}
      </Text>

      {/* Cards */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.list}>
        {filtered.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyTxt}>No resources match this filter combination.</Text>
            <TouchableOpacity onPress={() => { setTypeFilter("all"); setTopicFilter("all"); }} activeOpacity={0.8}>
              <Text style={s.emptyLink}>Clear filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map(item => <MediaCard key={item.id} item={item}/>)
        )}

        <View style={s.footer}>
          <Text style={s.footerTxt}>
            All links open in your browser or app. Safar is not affiliated with any of these resources.
          </Text>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex:1, backgroundColor:BG },

  header:  { flexDirection:"row", alignItems:"center", paddingHorizontal:spacing(2), paddingTop:spacing(1.75), paddingBottom:spacing(1.5) },
  backBtn: { width:36, height:36, borderRadius:18, backgroundColor:CARD, borderWidth:1, borderColor:BORDER, alignItems:"center", justifyContent:"center" },
  hCenter: { flex:1, alignItems:"center" },
  hTitle:  { fontFamily:SERIF, fontSize:22, color:TEXT },
  hSub:    { fontSize:13, color:MUTED, marginTop:2 },

  topics:       { paddingHorizontal:spacing(2), paddingBottom:spacing(1.25), gap:8, flexDirection:"row" },
  topicPill:    { paddingHorizontal:16, paddingVertical:8, borderRadius:50, borderWidth:1, borderColor:BORDER, backgroundColor:CARD },
  topicPillOn:  { backgroundColor:SAGE, borderColor:SAGE },
  topicTxt:     { fontSize:13, color:MUTED, fontWeight:"500" },
  topicTxtOn:   { color:"#fff" },

  count: { fontSize:12, color:MUTED, paddingHorizontal:spacing(2), marginBottom:spacing(1) },
  list:  { paddingHorizontal:spacing(2), paddingBottom:spacing(4) },

  empty:    { alignItems:"center", paddingVertical:spacing(4), gap:12 },
  emptyTxt: { fontSize:15, color:MUTED, textAlign:"center" },
  emptyLink:{ fontSize:14, color:SAGE, fontWeight:"600" },

  footer:    { borderTopWidth:1, borderTopColor:BORDER, paddingTop:spacing(1.5), marginTop:spacing(1) },
  footerTxt: { fontSize:11, color:MUTED, textAlign:"center", lineHeight:18, fontStyle:"italic" },
});
