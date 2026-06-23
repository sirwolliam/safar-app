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

const FILTERS = [
  { key:"all",       label:"All"       },
  { key:"umrah",     label:"Umrah"     },
  { key:"hajj",      label:"Hajj"      },
  { key:"spiritual", label:"Spiritual" },
  { key:"practical", label:"Practical" },
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
      {/* Type icon + badge */}
      <View style={mc.topRow}>
        <View style={[mc.typeBadge, { backgroundColor:conf.bg }]}>
          <Icon size={13} color={conf.color} weight="fill"/>
          <Text style={[mc.typeLabel, { color:conf.color }]}>{conf.label}</Text>
        </View>
        <ArrowSquareOut size={16} color={MUTED} weight="regular"/>
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
  topRow:    { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:10 },
  typeBadge: { flexDirection:"row", alignItems:"center", gap:5, paddingHorizontal:10, paddingVertical:4, borderRadius:50 },
  typeLabel: { fontSize:11, fontWeight:"700", letterSpacing:0.5 },
  title:     { fontFamily:SERIF, fontSize:17, color:TEXT, marginBottom:3 },
  source:    { fontSize:12, color:GOLD, fontWeight:"600", marginBottom:8 },
  desc:      { fontSize:13, color:MUTED, lineHeight:20 },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function MediaScreen({ navigation, route }) {
  // Accept initial filter from navigation params (e.g. from UmrahGuideScreen)
  const initialFilter = route?.params?.filter ?? "all";
  const [filter, setFilter] = useState(initialFilter);

  const filtered = filter === "all"
    ? MEDIA
    : MEDIA.filter(m => m.tags.includes(filter));

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

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filters}
      >
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[s.filterPill, filter===f.key && s.filterPillOn]}
            onPress={() => setFilter(f.key)}
            activeOpacity={0.8}
          >
            <Text style={[s.filterTxt, filter===f.key && s.filterTxtOn]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Count */}
      <Text style={s.count}>{filtered.length} resource{filtered.length !== 1 ? "s" : ""}</Text>

      {/* Cards */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.list}>
        {filtered.map(item => (
          <MediaCard key={item.id} item={item}/>
        ))}

        {/* Footer note */}
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

  filters:      { paddingHorizontal:spacing(2), paddingVertical:spacing(1.25), gap:8, flexDirection:"row" },
  filterPill:   { paddingHorizontal:16, paddingVertical:8, borderRadius:50, borderWidth:1, borderColor:BORDER, backgroundColor:CARD },
  filterPillOn: { backgroundColor:SAGE, borderColor:SAGE },
  filterTxt:    { fontSize:14, color:MUTED, fontWeight:"500" },
  filterTxtOn:  { color:"#fff" },

  count: { fontSize:12, color:MUTED, paddingHorizontal:spacing(2), marginBottom:spacing(1), marginTop:2 },

  list:   { paddingHorizontal:spacing(2), paddingBottom:spacing(4) },

  footer:    { borderTopWidth:1, borderTopColor:BORDER, paddingTop:spacing(1.5), marginTop:spacing(1) },
  footerTxt: { fontSize:11, color:MUTED, textAlign:"center", lineHeight:18, fontStyle:"italic" },
});
