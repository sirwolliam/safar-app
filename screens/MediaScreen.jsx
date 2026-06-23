/**
 * MediaScreen.jsx — Safar
 * Redesigned to match reference:
 * - Full hero with Ka'bah + large serif title
 * - Single-row type filter in white pill card
 * - Topic chip row with icons
 * - "Featured for you" split layout (large image left, text right)
 * - Two-column smaller cards below
 * - "Continue learning" placeholder section
 */
import React, { useState } from "react";
import {
  SafeAreaView, View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Linking, Dimensions, Image,
} from "react-native";
import {
  ArrowLeft, YoutubeLogo, Microphone, Article, BookOpen,
  Sparkle, Clock, BookmarkSimple,
} from "phosphor-react-native";
import { spacing, radius } from "../theme";

const { width: SW } = Dimensions.get("window");
const BG     = "#F5EFE4";
const CARD   = "#FDFAF4";
const SAGE   = "#2D4A34";
const SAGE_L = "#4A5C48";
const GOLD   = "#B8922A";
const BORDER = "#E0D8CC";
const TEXT   = "#1C1A14";
const MUTED  = "#7A7060";
const SERIF  = "SourceSerif4-Regular";

// ── Type config ───────────────────────────────────────────────────────────────
const T = {
  video:   { label:"Video",   color:"#C0392B", bg:"rgba(192,57,43,0.10)",  Icon:YoutubeLogo },
  podcast: { label:"Podcast", color:"#6C3483", bg:"rgba(108,52,131,0.10)", Icon:Microphone  },
  article: { label:"Article", color:"#1A5276", bg:"rgba(26,82,118,0.10)",  Icon:Article     },
};

// ── Content ───────────────────────────────────────────────────────────────────
const MEDIA = [
  {
    id:"menk-umrah", type:"video", tags:["umrah","practical"], featured:true,
    title:"Umrah Guide \u2014 Mufti Menk",
    source:"YouTube", duration:"18:45",
    desc:"Step-by-step Umrah walkthrough from Mufti Ismail Menk \u2014 clear, accessible and widely recommended for first-time pilgrims.",
    url:"https://www.youtube.com/results?search_query=mufti+menk+umrah+guide",
    image:require("../assets/tawaf2.jpg"),
    label:"STEP-BY-STEP",
  },
  {
    id:"ministry-hajj", type:"video", tags:["hajj","practical"], featured:false,
    title:"Hajj Step by Step \u2014 Official",
    source:"Saudi Ministry of Hajj", duration:"22:10",
    desc:"Authenticated guidance from the official Saudi Ministry of Hajj YouTube channel.",
    url:"https://www.youtube.com/@HajjMinistry",
    image:require("../assets/kaaba_mixed.png"),
    label:"OFFICIAL",
  },
  {
    id:"yaqeen-hajj", type:"video", tags:["hajj","spiritual"], featured:false,
    title:"The Spirituality of Hajj",
    source:"Yaqeen Institute", duration:"35:00",
    desc:"A video series on the deeper spiritual meaning behind each ritual of Hajj.",
    url:"https://yaqeeninstitute.org",
    image:require("../assets/arafah.jpg"),
    label:"SPIRITUAL",
  },
  {
    id:"qalam-hajj", type:"podcast", tags:["hajj","umrah","spiritual"], featured:false,
    title:"Hajj & Umrah Prep Series",
    source:"Qalam Institute", duration:"45 min",
    desc:"Podcast covering both Hajj and Umrah \u2014 spiritual preparation, duas and practical tips.",
    url:"https://www.qalaminstitute.org",
    image:require("../assets/journey3.png"),
    label:"PODCAST",
  },
  {
    id:"deenshow-hajj", type:"podcast", tags:["hajj","practical"], featured:false,
    title:"Preparing for Hajj",
    source:"The Deen Show", duration:"52 min",
    desc:"Audio guide covering the practical and spiritual preparation for Hajj.",
    url:"https://thedeenshow.com",
    image:require("../assets/what_to_expect.jpg"),
    label:"PODCAST",
  },
  {
    id:"seekers", type:"article", tags:["hajj","umrah","spiritual","practical"], featured:false,
    title:"Hajj & Umrah Guidance",
    source:"SeekersGuidance.org", duration:"6 min read",
    desc:"Scholarly guidance on Hajj and Umrah rites across madhabs.",
    url:"https://seekersguidance.org",
    image:require("../assets/medina.png"),
    label:"ARTICLE",
  },
  {
    id:"islamqa", type:"article", tags:["hajj","umrah","practical"], featured:false,
    title:"Hajj & Umrah Q&A",
    source:"IslamQA.info", duration:"4 min read",
    desc:"Comprehensive scholarly Q&A on fiqh and worship for pilgrims.",
    url:"https://islamqa.info/en",
    image:require("../assets/kaaba_map.png"),
    label:"ARTICLE",
  },
  {
    id:"sunnah", type:"article", tags:["hajj","umrah","spiritual"], featured:false,
    title:"Hadith on Hajj & Umrah",
    source:"Sunnah.com", duration:"Reference",
    desc:"Authenticated hadith collections for the Prophet\u2019s guidance on pilgrimage.",
    url:"https://sunnah.com",
    image:require("../assets/journey3.png"),
    label:"REFERENCE",
  },
  {
    id:"islamweb", type:"article", tags:["hajj","umrah","practical"], featured:false,
    title:"Fatawa & Research",
    source:"Islamweb.net", duration:"Reference",
    desc:"Fatawa, Quran and hadith research for all aspects of Hajj and Umrah.",
    url:"https://www.islamweb.net/en",
    image:require("../assets/what_to_expect.jpg"),
    label:"REFERENCE",
  },
];

const TYPE_BTNS = [
  { key:"all",     label:"All",      Icon:null       },
  { key:"video",   label:"Videos",   Icon:YoutubeLogo },
  { key:"podcast", label:"Podcasts", Icon:Microphone  },
  { key:"article", label:"Articles", Icon:Article     },
];

const TOPICS = [
  { key:"all",       label:"All Topics",  Icon:BookOpen   },
  { key:"umrah",     label:"Umrah",       Icon:Sparkle    },
  { key:"hajj",      label:"Hajj",        Icon:Sparkle    },
  { key:"spiritual", label:"Spiritual",   Icon:Sparkle    },
  { key:"practical", label:"Practical",   Icon:BookOpen   },
];

// ── Featured card — large image left, text right ──────────────────────────────
function FeaturedCard({ item }) {
  const conf = T[item.type];
  return (
    <TouchableOpacity style={fc.card} onPress={() => Linking.openURL(item.url)} activeOpacity={0.88}>
      {/* Left image */}
      <View style={fc.imgWrap}>
        <Image source={item.image} style={fc.img} resizeMode="cover"/>
        {item.label && (
          <View style={fc.labelPill}>
            <Text style={fc.labelTxt}>{item.label}</Text>
          </View>
        )}
        {/* Play button overlay for videos */}
        {item.type === "video" && (
          <View style={fc.playBtn}>
            <YoutubeLogo size={22} color="#fff" weight="fill"/>
          </View>
        )}
        {/* Title overlay at bottom */}
        <View style={fc.imgOverlay}>
          <Text style={fc.imgTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={fc.imgSource}>{item.source}</Text>
        </View>
      </View>

      {/* Right content */}
      <View style={fc.right}>
        <View style={[fc.typePill, { backgroundColor:conf.bg }]}>
          <conf.Icon size={11} color={conf.color} weight="fill"/>
          <Text style={[fc.typeLabel, { color:conf.color }]}>{conf.label}</Text>
          {item.duration && <Text style={[fc.dur, { color:conf.color }]}>{item.duration}</Text>}
        </View>
        <Text style={fc.title}>{item.title}</Text>
        <Text style={fc.desc} numberOfLines={4}>{item.desc}</Text>
        <TouchableOpacity style={fc.bookmark} hitSlop={{top:8,bottom:8,left:8,right:8}}>
          <BookmarkSimple size={18} color={MUTED} weight="regular"/>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const fc = StyleSheet.create({
  card:      { flexDirection:"row", backgroundColor:CARD, borderRadius:radius.lg, borderWidth:1, borderColor:BORDER, overflow:"hidden", marginBottom:spacing(1.5), shadowColor:"#000", shadowOffset:{width:0,height:2}, shadowOpacity:0.06, shadowRadius:8, elevation:3 },
  imgWrap:   { width:SW*0.40, position:"relative" },
  img:       { width:"100%", height:"100%" },
  labelPill: { position:"absolute", top:10, left:10, backgroundColor:SAGE, borderRadius:50, paddingHorizontal:8, paddingVertical:4 },
  labelTxt:  { fontSize:9, color:"#fff", fontWeight:"800", letterSpacing:0.8 },
  playBtn:   { position:"absolute", bottom:44, right:10, width:40, height:40, borderRadius:20, backgroundColor:"rgba(0,0,0,0.60)", alignItems:"center", justifyContent:"center" },
  imgOverlay:{ position:"absolute", bottom:0, left:0, right:0, padding:10, backgroundColor:"rgba(0,0,0,0.50)" },
  imgTitle:  { fontFamily:SERIF, fontSize:13, color:"#fff", fontWeight:"600", lineHeight:17 },
  imgSource: { fontSize:10, color:"rgba(255,255,255,0.75)", marginTop:2 },
  right:     { flex:1, padding:spacing(1.5), position:"relative" },
  typePill:  { flexDirection:"row", alignItems:"center", gap:4, paddingHorizontal:8, paddingVertical:4, borderRadius:50, alignSelf:"flex-start", marginBottom:8 },
  typeLabel: { fontSize:10, fontWeight:"700" },
  dur:       { fontSize:10, opacity:0.80 },
  title:     { fontFamily:SERIF, fontSize:15, color:TEXT, lineHeight:20, marginBottom:6 },
  desc:      { fontSize:12, color:MUTED, lineHeight:18 },
  bookmark:  { position:"absolute", bottom:10, right:10 },
});

// ── Small card — used in two-column grid ──────────────────────────────────────
function SmallCard({ item, w }) {
  const conf = T[item.type];
  return (
    <TouchableOpacity style={[sc.card, { width:w }]} onPress={() => Linking.openURL(item.url)} activeOpacity={0.88}>
      {/* Thumbnail */}
      <View style={sc.imgWrap}>
        <Image source={item.image} style={sc.img} resizeMode="cover"/>
        {item.type === "video" && (
          <View style={sc.playBtn}>
            <YoutubeLogo size={14} color="#fff" weight="fill"/>
          </View>
        )}
      </View>
      {/* Type badge */}
      <View style={[sc.badge, { backgroundColor:conf.bg }]}>
        <conf.Icon size={9} color={conf.color} weight="fill"/>
        <Text style={[sc.badgeTxt, { color:conf.color }]}>{conf.label}</Text>
        {item.duration && <Text style={[sc.dur, { color:conf.color }]}>{item.duration}</Text>}
      </View>
      <Text style={sc.title} numberOfLines={2}>{item.title}</Text>
      <Text style={[sc.source, { color:conf.color }]}>{item.source}</Text>
      <Text style={sc.desc} numberOfLines={3}>{item.desc}</Text>
      <TouchableOpacity style={sc.bookmark} hitSlop={{top:8,bottom:8,left:8,right:8}}>
        <BookmarkSimple size={16} color={MUTED} weight="regular"/>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const SCARD_H = 220;
const sc = StyleSheet.create({
  card:      { backgroundColor:CARD, borderRadius:radius.lg, borderWidth:1, borderColor:BORDER, overflow:"hidden", marginBottom:spacing(1.5), shadowColor:"#000", shadowOffset:{width:0,height:2}, shadowOpacity:0.06, shadowRadius:6, elevation:2 },
  imgWrap:   { width:"100%", height:110, position:"relative" },
  img:       { width:"100%", height:"100%" },
  playBtn:   { position:"absolute", bottom:8, right:8, width:30, height:30, borderRadius:15, backgroundColor:"rgba(0,0,0,0.55)", alignItems:"center", justifyContent:"center" },
  badge:     { flexDirection:"row", alignItems:"center", gap:4, margin:10, marginBottom:6, paddingHorizontal:7, paddingVertical:3, borderRadius:50, alignSelf:"flex-start" },
  badgeTxt:  { fontSize:9, fontWeight:"700" },
  dur:       { fontSize:9, opacity:0.80 },
  title:     { fontFamily:SERIF, fontSize:13, color:TEXT, lineHeight:18, paddingHorizontal:10, marginBottom:3 },
  source:    { fontSize:11, fontWeight:"700", paddingHorizontal:10, marginBottom:6 },
  desc:      { fontSize:11, color:MUTED, lineHeight:16, paddingHorizontal:10, paddingBottom:30 },
  bookmark:  { position:"absolute", bottom:8, right:8 },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function MediaScreen({ navigation, route }) {
  const initialFilter = route?.params?.filter ?? "all";
  const [typeFilter,  setTypeFilter]  = useState("all");
  const [topicFilter, setTopicFilter] = useState(initialFilter);

  const filtered = MEDIA.filter(m => {
    const typeMatch  = typeFilter  === "all" || m.type === typeFilter;
    const topicMatch = topicFilter === "all" || m.tags.includes(topicFilter);
    return typeMatch && topicMatch;
  });

  const featured    = filtered.find(m => m.featured) ?? filtered[0];
  const nonFeatured = filtered.filter(m => m.id !== (featured?.id ?? "")).slice(0,6);

  const colW = (SW - spacing(4) - 12) / 2;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} bounces>

        {/* ── Hero ── */}
        <View style={s.hero}>
          <Image source={require("../assets/kaaba_mixed.png")} style={s.heroImg} resizeMode="cover"/>
          <View style={s.heroFade}/>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <ArrowLeft size={20} color={TEXT} weight="regular"/>
          </TouchableOpacity>
          <View style={s.heroText}>
            <Text style={s.heroTitle}>{"Learn\n& Prepare"}</Text>
            <Text style={s.heroSub}>{"Inspiration and guidance\nfor your Hajj & Umrah journey"}</Text>
          </View>
        </View>

        {/* ── Type filter — horizontal pill row in white card ── */}
        <View style={s.typeCard}>
          {TYPE_BTNS.map(({ key, label, Icon }) => {
            const on   = typeFilter === key;
            const conf = T[key];
            return (
              <TouchableOpacity
                key={key}
                style={[s.typeBtn, on && s.typeBtnOn]}
                onPress={() => setTypeFilter(key)}
                activeOpacity={0.8}
              >
                {Icon ? (
                  <Icon size={15} color={on ? "#fff" : MUTED} weight={on?"fill":"regular"}/>
                ) : (
                  <YoutubeLogo size={15} color={on ? "#fff" : MUTED} weight={on?"fill":"thin"}/>
                )}
                <Text style={[s.typeTxt, on && s.typeTxtOn]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Topic chips ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.topicRow}>
          {TOPICS.map(({ key, label, Icon }) => {
            const on = topicFilter === key;
            return (
              <TouchableOpacity
                key={key}
                style={[s.topicChip, on && s.topicChipOn]}
                onPress={() => setTopicFilter(key)}
                activeOpacity={0.8}
              >
                <Icon size={13} color={on ? "#fff" : MUTED} weight={on?"fill":"thin"}/>
                <Text style={[s.topicTxt, on && s.topicTxtOn]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Featured ── */}
        {filtered.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={s.sectionLeft}>
                <Sparkle size={16} color={GOLD} weight="fill"/>
                <Text style={s.sectionTitle}>Featured for you</Text>
              </View>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={s.viewAll}>View all</Text>
              </TouchableOpacity>
            </View>
            {featured && <FeaturedCard item={featured}/>}
          </View>
        )}

        {/* ── Two-column grid ── */}
        {nonFeatured.length > 0 && (
          <View style={s.grid}>
            <View style={s.gridCol}>
              {nonFeatured.filter((_,i)=>i%2===0).map(item => (
                <SmallCard key={item.id} item={item} w={colW}/>
              ))}
            </View>
            <View style={s.gridCol}>
              {nonFeatured.filter((_,i)=>i%2===1).map(item => (
                <SmallCard key={item.id} item={item} w={colW}/>
              ))}
            </View>
          </View>
        )}

        {/* Empty */}
        {filtered.length === 0 && (
          <View style={s.empty}>
            <Text style={s.emptyTxt}>No resources match this combination.</Text>
            <TouchableOpacity onPress={() => { setTypeFilter("all"); setTopicFilter("all"); }}>
              <Text style={s.emptyLink}>Clear filters</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={s.disclosure}>
          All links open externally. Safar is not affiliated with these resources.
        </Text>
        <View style={{ height:spacing(4) }}/>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex:1, backgroundColor:BG },

  // Hero
  hero:     { height:260, position:"relative" },
  heroImg:  { ...StyleSheet.absoluteFillObject, width:"100%", height:"100%" },
  heroFade: { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(245,239,228,0.52)" },
  backBtn:  { position:"absolute", top:16, left:spacing(2), width:38, height:38, borderRadius:19, backgroundColor:"rgba(253,250,244,0.90)", borderWidth:1, borderColor:BORDER, alignItems:"center", justifyContent:"center" },
  heroText: { position:"absolute", bottom:24, left:spacing(2), right:SW*0.38 },
  heroTitle:{ fontFamily:SERIF, fontSize:40, color:TEXT, lineHeight:46, fontWeight:"400" },
  heroSub:  { fontSize:13, color:MUTED, lineHeight:19, marginTop:8 },

  // Type filter card
  typeCard: { flexDirection:"row", backgroundColor:CARD, marginHorizontal:spacing(2), marginTop:spacing(1.5), borderRadius:radius.lg, borderWidth:1, borderColor:BORDER, padding:5, gap:4 },
  typeBtn:  { flex:1, flexDirection:"row", alignItems:"center", justifyContent:"center", gap:6, paddingVertical:10, borderRadius:10 },
  typeBtnOn:{ backgroundColor:SAGE },
  typeTxt:  { fontSize:13, color:MUTED, fontWeight:"500" },
  typeTxtOn:{ color:"#fff", fontWeight:"600" },

  // Topic chips
  topicRow:  { paddingHorizontal:spacing(2), paddingVertical:spacing(1.25), gap:8, flexDirection:"row" },
  topicChip: { flexDirection:"row", alignItems:"center", gap:6, paddingHorizontal:14, paddingVertical:8, borderRadius:50, borderWidth:1, borderColor:BORDER, backgroundColor:CARD },
  topicChipOn:{ backgroundColor:SAGE, borderColor:SAGE },
  topicTxt:  { fontSize:13, color:MUTED, fontWeight:"500" },
  topicTxtOn:{ color:"#fff" },

  // Sections
  section:      { paddingHorizontal:spacing(2), marginTop:spacing(0.5) },
  sectionHeader:{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:spacing(1.25) },
  sectionLeft:  { flexDirection:"row", alignItems:"center", gap:6 },
  sectionTitle: { fontFamily:SERIF, fontSize:18, color:TEXT },
  viewAll:      { fontSize:13, color:SAGE_L, fontWeight:"600" },

  // Grid
  grid:    { flexDirection:"row", paddingHorizontal:spacing(2), gap:12, marginTop:spacing(0.5) },
  gridCol: { flex:1 },

  empty:    { alignItems:"center", paddingVertical:spacing(4), gap:12 },
  emptyTxt: { fontSize:15, color:MUTED },
  emptyLink:{ fontSize:14, color:SAGE, fontWeight:"600" },

  disclosure:{ fontSize:11, color:MUTED, textAlign:"center", marginTop:spacing(2), marginHorizontal:spacing(2), fontStyle:"italic" },
});
