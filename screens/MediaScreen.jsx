/**
 * MediaScreen.jsx — Safar
 * Learning paths + browse by topic + format rows.
 * Hard rules: no && in style arrays, ternaries only.
 * No new npm packages. Phosphor icons only.
 */
import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView, View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Linking, Image, TextInput, FlatList,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CaretLeft, CaretRight, YoutubeLogo, Microphone,
  Article, BookOpen, BookOpenText, Books, Sparkle,
  BookmarkSimple, MagnifyingGlass, PlayCircle,
  UsersThree, SuitcaseRolling, HandsPraying,
  Heart, MapPin, Compass,
} from "phosphor-react-native";
import { getMediaBookmarks, toggleMediaBookmark } from "../bookmarkStore";
import { showToast } from "../Toast";

// ORIGINAL LIGHT: BG="#F5EFE4" CARD="#FDFAF4" BORDER="#E0D8CC" TEXT="#1C1A14" MUTED="#7A7060"
const BG    = "#000000";
const CARD  = "#141414";
const SAGE  = "#C8A96A";
const SAGE_L= "#C8A96A";
const GOLD  = "#C8A96A";
const BORDER= "rgba(200,185,160,0.18)";
const TEXT  = "#F5EFE4";
const MUTED = "rgba(245,239,228,0.55)";
const SERIF = "SourceSerif4-Regular";
const { width: SW } = Dimensions.get("window");

// ── Type config (exported for BookmarksScreen) ────────────────────────────────
export const T = {
  video:   { label:"Video",   color:"#E05550", bg:"rgba(224,85,80,0.18)",   Icon:YoutubeLogo },
  podcast: { label:"Podcast", color:"#A064C8", bg:"rgba(160,100,200,0.18)", Icon:Microphone  },
  article: { label:"Article", color:"#5090C8", bg:"rgba(80,144,200,0.18)",  Icon:Article     },
};

// ── Content (exported for BookmarksScreen) ────────────────────────────────────
export const MEDIA = [
  {
    id:"menk-umrah", type:"video", tags:["umrah","practical"], featured:true,
    level:"first",
    title:"Umrah Guide — Mufti Menk",
    source:"YouTube", duration:"18:45",
    desc:"Step-by-step Umrah walkthrough from Mufti Ismail Menk — clear, accessible and widely recommended for first-time pilgrims.",
    url:"https://www.youtube.com/results?search_query=mufti+menk+umrah+guide",
    image:require("../assets/tawaf2.jpg"),
    label:"STEP-BY-STEP",
  },
  {
    id:"ministry-hajj", type:"video", tags:["hajj","practical"], featured:false,
    level:"first",
    title:"Hajj Step by Step — Official",
    source:"Saudi Ministry of Hajj", duration:"22:10",
    desc:"Authenticated guidance from the official Saudi Ministry of Hajj YouTube channel.",
    url:"https://www.youtube.com/@HajjMinistry",
    image:require("../assets/kaaba_mixed.png"),
    label:"OFFICIAL",
  },
  {
    id:"yaqeen-hajj", type:"video", tags:["hajj","spiritual"], featured:false,
    level:"all",
    title:"The Spirituality of Hajj",
    source:"Yaqeen Institute", duration:"35:00",
    desc:"A video series on the deeper spiritual meaning behind each ritual of Hajj.",
    url:"https://yaqeeninstitute.org",
    image:require("../assets/arafah.jpg"),
    label:"SPIRITUAL",
  },
  {
    id:"qalam-hajj", type:"podcast", tags:["hajj","umrah","spiritual"], featured:false,
    level:"all",
    title:"Hajj & Umrah Prep Series",
    source:"Qalam Institute", duration:"45 min",
    desc:"Podcast covering both Hajj and Umrah — spiritual preparation, duas and practical tips.",
    url:"https://www.qalaminstitute.org",
    image:require("../assets/journey3.png"),
    label:"PODCAST",
  },
  {
    id:"deenshow-hajj", type:"podcast", tags:["hajj","practical"], featured:false,
    level:"all",
    title:"Preparing for Hajj",
    source:"The Deen Show", duration:"52 min",
    desc:"Audio guide covering the practical and spiritual preparation for Hajj.",
    url:"https://thedeenshow.com",
    image:require("../assets/what_to_expect.jpg"),
    label:"PODCAST",
  },
  {
    id:"seekers", type:"article", tags:["hajj","umrah","spiritual","practical"], featured:false,
    level:"all",
    title:"Hajj & Umrah Guidance",
    source:"SeekersGuidance.org", duration:"6 min read",
    desc:"Scholarly guidance on Hajj and Umrah across madhabs.",
    url:"https://seekersguidance.org",
    image:require("../assets/medina.png"),
    label:"ARTICLE",
  },
  {
    id:"islamqa", type:"article", tags:["hajj","umrah","practical"], featured:false,
    level:"experienced",
    title:"Hajj & Umrah Q&A",
    source:"IslamQA.info", duration:"4 min read",
    desc:"Comprehensive scholarly Q&A on fiqh and worship for pilgrims.",
    url:"https://islamqa.info/en",
    image:require("../assets/kaaba_map.png"),
    label:"ARTICLE",
  },
  {
    id:"sunnah", type:"article", tags:["hajj","umrah","spiritual"], featured:false,
    level:"experienced",
    title:"Hadith on Hajj & Umrah",
    source:"Sunnah.com", duration:"Reference",
    desc:"Authenticated hadith collections for the Prophet’s guidance on pilgrimage.",
    url:"https://sunnah.com",
    image:require("../assets/journey3.png"),
    label:"REFERENCE",
  },
  {
    id:"islamweb", type:"article", tags:["hajj","umrah","practical"], featured:false,
    level:"experienced",
    title:"Fatawa & Research",
    source:"Islamweb.net", duration:"Reference",
    desc:"Fatawa, Quran and hadith research for all aspects of Hajj and Umrah.",
    url:"https://www.islamweb.net/en",
    image:require("../assets/what_to_expect.jpg"),
    label:"REFERENCE",
  },
];

// ── New data constants ─────────────────────────────────────────────────────────
const LEARNING_PATHS = [
  {
    id: "first-umrah",
    label: "First Time Umrah",
    sub: "Everything you need from intention to completion",
    Icon: HandsPraying,
    color: "#4A5C48",
    level: "first",
    items: ["menk-umrah", "seekers", "qalam-hajj"],
  },
  {
    id: "first-hajj",
    label: "First Time Hajj",
    sub: "A complete guide to the five pillars of Hajj",
    Icon: MapPin,
    color: "#3A4A5C",
    level: "first",
    items: ["ministry-hajj", "yaqeen-hajj", "islamqa"],
  },
  {
    id: "spiritual-prep",
    label: "Spiritual Preparation",
    sub: "Prepare your heart before the journey begins",
    Icon: Heart,
    color: "#5A3050",
    level: "all",
    items: ["yaqeen-hajj", "qalam-hajj", "sunnah"],
  },
  {
    id: "pack-prepare",
    label: "Pack & Prepare",
    sub: "Everything practical before you fly",
    Icon: SuitcaseRolling,
    color: "#5A3A1A",
    level: "all",
    items: ["deenshow-hajj", "seekers", "islamweb"],
  },
  {
    id: "family-travel",
    label: "Traveling with Family",
    sub: "Tips for a smooth journey with loved ones",
    Icon: UsersThree,
    color: "#4A3A6A",
    level: "all",
    items: ["menk-umrah", "deenshow-hajj", "islamqa"],
  },
];

const BROWSE_TOPICS = [
  { key: "umrah",     label: "Umrah Guides",      sub: "Step-by-step rites",          Icon: HandsPraying,    color: "#1A1A1A" },
  { key: "hajj",      label: "Hajj Guides",        sub: "The full pilgrimage",         Icon: MapPin,          color: "#3A4A5C" },
  { key: "spiritual", label: "Spiritual Growth",   sub: "Deepen your connection",      Icon: Heart,           color: "#5A3050" },
  { key: "practical", label: "Planning & Prep",    sub: "Visas, packing, logistics",   Icon: SuitcaseRolling, color: "#5A3A1A" },
  { key: "family",    label: "Family Travel",      sub: "Tips for traveling together", Icon: UsersThree,      color: "#4A3A6A" },
  { key: "worship",   label: "Duʿā & Worship",sub: "Supplications for the trip",  Icon: BookOpen,        color: "#1A1A1A" },
];

const HERO_SLIDES_MEDIA = MEDIA.slice(0, 4);
const HERO_H_MEDIA = 280;

// ── Card components ───────────────────────────────────────────────────────────

function LearningPathCard({ path, onPress }) {
  const items = path.items
    .map(id => MEDIA.find(m => m.id === id))
    .filter(Boolean);
  const types = [...new Set(items.map(i => i.type))];

  return (
    <TouchableOpacity
      style={lp.card}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <LinearGradient
        colors={[path.color, path.color + "BB"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={lp.gradient}
      >
        <View style={lp.iconWrap}>
          <path.Icon size={26} color="#C8A96A" weight="regular" />
        </View>
        <View style={lp.content}>
          <Text style={lp.label}>{path.label}</Text>
          <Text style={lp.sub} numberOfLines={2}>{path.sub}</Text>
          <View style={lp.meta}>
            <Text style={lp.count}>{items.length} items</Text>
            <View style={lp.typePills}>
              {types.map(t => (
                <View key={t} style={lp.typePill}>
                  <Text style={lp.typePillText}>{T[t].label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <CaretRight size={18} color="rgba(255,255,255,0.7)" weight="bold" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const lp = StyleSheet.create({
  card:         { marginHorizontal: 16, marginBottom: 10, borderRadius: 16, overflow: "hidden", shadowColor: "#1A1410", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.18, shadowRadius: 10, elevation: 5 },
  gradient:     { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  iconWrap:     { width: 48, height: 48, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  content:      { flex: 1, gap: 3 },
  label:        { fontSize: 17, color: "#FFFFFF", fontWeight: "600" },
  sub:          { fontSize: 12, color: "rgba(255,255,255,0.72)", lineHeight: 17 },
  meta:         { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  count:        { fontSize: 11, color: "rgba(255,255,255,0.60)" },
  typePills:    { flexDirection: "row", gap: 4 },
  typePill:     { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 50, paddingHorizontal: 7, paddingVertical: 2 },
  typePillText: { fontSize: 10, color: "rgba(255,255,255,0.85)", fontWeight: "600" },
});

function TopicCard({ topic, onPress }) {
  return (
    <TouchableOpacity
      style={tc.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[tc.iconBox, { backgroundColor: topic.color }]}>
        <topic.Icon size={20} color="#C8A96A" weight="regular" />
      </View>
      <View style={tc.info}>
        <Text style={tc.label}>{topic.label}</Text>
        <Text style={tc.sub}>{topic.sub}</Text>
      </View>
    </TouchableOpacity>
  );
}

const tc = StyleSheet.create({
  card:    { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 12, gap: 10, shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  iconBox: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  info:    { flex: 1 },
  label:   { fontSize: 13, color: TEXT, fontWeight: "500", marginBottom: 2 },
  sub:     { fontSize: 11, color: MUTED, lineHeight: 15 },
});

function VideoCard({ item, bookmarked, onToggleBookmark }) {
  return (
    <TouchableOpacity
      style={vc.card}
      onPress={() => Linking.openURL(item.url)}
      activeOpacity={0.88}
    >
      <View style={vc.thumb}>
        <Image source={item.image} style={vc.thumbImg} resizeMode="cover" />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.55)"]}
          start={{ x: 0, y: 0.4 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={vc.playBtn}>
          <PlayCircle size={30} color="#FFFFFF" weight="fill" />
        </View>
        <View style={vc.duration}>
          <Text style={vc.durationText}>{item.duration}</Text>
        </View>
        <TouchableOpacity
          style={vc.bookmark}
          onPress={() => onToggleBookmark?.(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <BookmarkSimple
            size={16}
            color={bookmarked ? GOLD : "#FFFFFF"}
            weight={bookmarked ? "fill" : "regular"}
          />
        </TouchableOpacity>
      </View>
      <View style={vc.info}>
        <Text style={vc.title} numberOfLines={2}>{item.title}</Text>
        <View style={vc.meta}>
          <YoutubeLogo size={12} color={MUTED} weight="fill" />
          <Text style={vc.source} numberOfLines={1}>{item.source}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const vc = StyleSheet.create({
  card:         { width: 200, marginRight: 12, backgroundColor: CARD, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: BORDER, shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  thumb:        { width: "100%", height: 120, position: "relative" },
  thumbImg:     { width: "100%", height: "100%" },
  playBtn:      { position: "absolute", top: "50%", left: "50%", marginTop: -15, marginLeft: -15 },
  duration:     { position: "absolute", bottom: 8, left: 8, backgroundColor: "rgba(0,0,0,0.72)", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  durationText: { fontSize: 11, color: "#FFFFFF", fontWeight: "600" },
  bookmark:     { position: "absolute", top: 8, right: 8 },
  info:         { padding: 10, gap: 5 },
  title:        { fontSize: 13, color: TEXT, lineHeight: 18, fontWeight: "500" },
  meta:         { flexDirection: "row", alignItems: "center", gap: 5 },
  source:       { fontSize: 11, color: MUTED, flex: 1 },
});

function PodcastCard({ item, bookmarked, onToggleBookmark }) {
  return (
    <TouchableOpacity
      style={pc.card}
      onPress={() => Linking.openURL(item.url)}
      activeOpacity={0.88}
    >
      <View style={pc.artWrap}>
        <Image source={item.image} style={pc.art} resizeMode="cover" />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.55)"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={pc.playBtn}>
          <PlayCircle size={26} color="#FFFFFF" weight="fill" />
        </View>
        <TouchableOpacity
          style={pc.bookmark}
          onPress={() => onToggleBookmark?.(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <BookmarkSimple
            size={16}
            color={bookmarked ? GOLD : "#FFFFFF"}
            weight={bookmarked ? "fill" : "regular"}
          />
        </TouchableOpacity>
      </View>
      <View style={pc.info}>
        <Text style={pc.title} numberOfLines={2}>{item.title}</Text>
        <View style={pc.meta}>
          <Microphone size={11} color={MUTED} weight="fill" />
          <Text style={pc.source}>{item.source}</Text>
          <Text style={pc.dot}>·</Text>
          <Text style={pc.dur}>{item.duration}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const pc = StyleSheet.create({
  card:     { width: 155, marginRight: 12, backgroundColor: CARD, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: BORDER, shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  artWrap:  { width: "100%", height: 155, position: "relative" },
  art:      { width: "100%", height: "100%" },
  playBtn:  { position: "absolute", bottom: 10, right: 10 },
  bookmark: { position: "absolute", top: 8, right: 8 },
  info:     { padding: 10, gap: 4 },
  title:    { fontSize: 13, color: TEXT, lineHeight: 18, fontWeight: "500" },
  meta:     { flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap" },
  source:   { fontSize: 11, color: MUTED },
  dot:      { fontSize: 11, color: MUTED },
  dur:      { fontSize: 11, color: MUTED },
});

function ArticleCard({ item, bookmarked, onToggleBookmark }) {
  return (
    <TouchableOpacity
      style={arc.card}
      onPress={() => Linking.openURL(item.url)}
      activeOpacity={0.88}
    >
      <View style={arc.imgWrap}>
        <Image source={item.image} style={arc.img} resizeMode="cover" />
        <View style={arc.categoryPill}>
          <Text style={arc.categoryText}>{item.label}</Text>
        </View>
      </View>
      <View style={arc.info}>
        <Text style={arc.title} numberOfLines={2}>{item.title}</Text>
        <View style={arc.footer}>
          <View style={arc.meta}>
            <Article size={11} color={MUTED} weight="regular" />
            <Text style={arc.dur}>{item.duration}</Text>
          </View>
          <TouchableOpacity
            onPress={() => onToggleBookmark?.(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <BookmarkSimple
              size={16}
              color={bookmarked ? GOLD : MUTED}
              weight={bookmarked ? "fill" : "regular"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const arc = StyleSheet.create({
  card:         { width: 175, marginRight: 12, backgroundColor: CARD, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: BORDER, shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  imgWrap:      { width: "100%", height: 105, position: "relative" },
  img:          { width: "100%", height: "100%" },
  categoryPill: { position: "absolute", top: 8, left: 8, backgroundColor: T.article.color, borderRadius: 50, paddingHorizontal: 8, paddingVertical: 3 },
  categoryText: { fontSize: 10, fontWeight: "500", color: "#FFFFFF" },
  info:         { padding: 10, gap: 6 },
  title:        { fontSize: 13, color: TEXT, lineHeight: 18, fontWeight: "500" },
  footer:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  meta:         { flexDirection: "row", alignItems: "center", gap: 4 },
  dur:          { fontSize: 11, color: MUTED },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function MediaScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const heroRef    = useRef(null);
  const [search,        setSearch]        = useState("");
  const [heroSlide,     setHeroSlide]     = useState(0);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getMediaBookmarks().then((list) => {
      if (!cancelled) setBookmarkedIds(list.map((e) => e.id));
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide(prev => {
        const next = (prev + 1) % HERO_SLIDES_MEDIA.length;
        heroRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleBookmark = (id) => {
    const was = bookmarkedIds.includes(id);
    setBookmarkedIds(prev => was
      ? prev.filter(x => x !== id)
      : [...prev, id]
    );
    toggleMediaBookmark(id).then(newState => {
      setBookmarkedIds(prev => {
        const has = prev.includes(id);
        if (newState && !has) return [...prev, id];
        if (!newState && has) return prev.filter(x => x !== id);
        return prev;
      });
      if (newState) {
        showToast("Bookmark added", {
          actionLabel: "View",
          onAction: () => navigation.navigate("Tools", { screen: "Bookmarks" }),
        });
      }
    });
  };

  const videos   = MEDIA.filter(m => m.type === "video");
  const podcasts = MEDIA.filter(m => m.type === "podcast");
  const articles = MEDIA.filter(m => m.type === "article");

  const searchResults = search.trim()
    ? MEDIA.filter(m =>
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.source.toLowerCase().includes(search.toLowerCase()) ||
        m.desc.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >

        {/* ── Page title ── */}
        <View style={s.pageHeader}>
          <View style={s.pageTitleRow}>
            <PlayCircle size={28} color="#C8A96A" weight="regular" />
            <Text style={s.pageTitle}>Media</Text>
          </View>
          <Text style={s.pageSub}>
            Curated content to inspire, prepare and guide your journey.
          </Text>
          <Text style={s.pageDisclosure}>
            All links open externally. Safar is not affiliated
            with these resources.
          </Text>
        </View>

        {/* ── Hero carousel ── */}
        <View style={{ height: HERO_H_MEDIA }}>
          <FlatList
            ref={heroRef}
            data={HERO_SLIDES_MEDIA}
            keyExtractor={item => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={e => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SW);
              setHeroSlide(idx);
            }}
            style={{ height: HERO_H_MEDIA }}
            getItemLayout={(_, index) => ({
              length: SW,
              offset: SW * index,
              index,
            })}
            renderItem={({ item }) => {
              const conf = T[item.type];
              return (
                <TouchableOpacity
                  style={{ width: SW, height: HERO_H_MEDIA, overflow: "hidden" }}
                  onPress={() => Linking.openURL(item.url)}
                  activeOpacity={0.92}
                >
                  <Image
                    source={item.image}
                    style={{ position: "absolute", width: SW, height: HERO_H_MEDIA }}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={["rgba(0,0,0,0.08)", "rgba(0,0,0,0.72)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <View style={[s.slideBadge, { bottom: 97, left: 16, backgroundColor: conf.color }]}>
                    <conf.Icon size={14} color="#FFFFFF" weight="fill" />
                    <Text style={s.slideBadgeText}>{conf.label}</Text>
                  </View>
                  <View style={s.slideContent}>
                    <Text style={s.slideTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={s.slideSource}>{item.source}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />

          {/* Back button — floats above carousel */}
          <TouchableOpacity
            style={[s.backBtn, { top: 16 }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <CaretLeft size={18} color="#FFFFFF" weight="bold" />
          </TouchableOpacity>

          {/* Dot indicators */}
          <View style={s.heroDots}>
            {HERO_SLIDES_MEDIA.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  heroRef.current?.scrollToIndex({ index: i, animated: true });
                  setHeroSlide(i);
                }}
              >
                <View style={i === heroSlide ? [s.dot, s.dotActive] : s.dot} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Search bar ── */}
        <View style={s.searchBar}>
          <MagnifyingGlass size={16} color={MUTED} weight="regular" />
          <TextInput
            style={s.searchInput}
            placeholder="Search videos, podcasts, articles…"
            placeholderTextColor={MUTED}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>


        {/* ── Search results (replaces everything when searching) ── */}
        {searchResults !== null ? (
          <View>
            <View style={s.sectionRowHeader}>
              <Text style={s.sectionTitle}>
                {searchResults.length} result
                {searchResults.length !== 1 ? "s" : ""}
              </Text>
            </View>
            {searchResults.length === 0 ? (
              <View style={s.empty}>
                <Text style={s.emptyTxt}>No results for "{search}"</Text>
              </View>
            ) : (
              <View style={s.searchResultsCard}>
                {searchResults.map((item, idx) => {
                  const conf = T[item.type];
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={idx < searchResults.length - 1
                        ? [s.resultRow, s.resultRowBorder]
                        : s.resultRow}
                      onPress={() => Linking.openURL(item.url)}
                      activeOpacity={0.8}
                    >
                      <View style={s.resultThumb}>
                        <Image
                          source={item.image}
                          style={s.resultThumbImg}
                          resizeMode="cover"
                        />
                        {item.type === "video" ? (
                          <View style={s.resultPlay}>
                            <PlayCircle size={18} color="#FFFFFF" weight="fill" />
                          </View>
                        ) : null}
                      </View>
                      <View style={s.resultInfo}>
                        <View style={[s.resultBadge, { backgroundColor: conf.color }]}>
                          <conf.Icon size={10} color="#FFFFFF" weight="fill" />
                          <Text style={[s.resultBadgeText, { color: "#FFFFFF" }]}>
                            {conf.label}
                          </Text>
                        </View>
                        <Text style={s.resultTitle} numberOfLines={2}>
                          {item.title}
                        </Text>
                        <Text style={s.resultSource}>{item.source}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleToggleBookmark(item.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <BookmarkSimple
                          size={18}
                          color={bookmarkedIds.includes(item.id) ? GOLD : MUTED}
                          weight={bookmarkedIds.includes(item.id) ? "fill" : "regular"}
                        />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        ) : (
          <>
            {/* ── YouTube Videos ── */}
            {videos.length > 0 ? (
              <View style={s.typeSection}>
                <View style={s.sectionRowHeader}>
                  <View style={s.sectionTitleRow}>
                    <YoutubeLogo size={20} color={T.video.color} weight="fill" />
                    <Text style={[s.sectionTitle, { color: T.video.color }]}>Videos</Text>
                  </View>
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text style={s.viewAll}>View all  ›</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.cardScroll}
                >
                  {videos.map(item => (
                    <VideoCard
                      key={item.id}
                      item={item}
                      bookmarked={bookmarkedIds.includes(item.id)}
                      onToggleBookmark={handleToggleBookmark}
                    />
                  ))}
                </ScrollView>
                <View style={{ height: 12 }} />
              </View>
            ) : null}

            {/* ── Podcasts ── */}
            {podcasts.length > 0 ? (
              <View style={s.typeSection}>
                <View style={s.sectionRowHeader}>
                  <View style={s.sectionTitleRow}>
                    <Microphone size={20} color={T.podcast.color} weight="fill" />
                    <Text style={[s.sectionTitle, { color: T.podcast.color }]}>Podcasts</Text>
                  </View>
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text style={s.viewAll}>View all  ›</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.cardScroll}
                >
                  {podcasts.map(item => (
                    <PodcastCard
                      key={item.id}
                      item={item}
                      bookmarked={bookmarkedIds.includes(item.id)}
                      onToggleBookmark={handleToggleBookmark}
                    />
                  ))}
                </ScrollView>
                <View style={{ height: 12 }} />
              </View>
            ) : null}

            {/* ── Articles ── */}
            {articles.length > 0 ? (
              <View style={s.typeSection}>
                <View style={s.sectionRowHeader}>
                  <View style={s.sectionTitleRow}>
                    <BookOpenText size={20} color={T.article.color} weight="regular" />
                    <Text style={[s.sectionTitle, { color: T.article.color }]}>Articles</Text>
                  </View>
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text style={s.viewAll}>View all  ›</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.cardScroll}
                >
                  {articles.map(item => (
                    <ArticleCard
                      key={item.id}
                      item={item}
                      bookmarked={bookmarkedIds.includes(item.id)}
                      onToggleBookmark={handleToggleBookmark}
                    />
                  ))}
                </ScrollView>
                <View style={{ height: 12 }} />
              </View>
            ) : null}

            {/* ── Learning Paths ── */}
            <View style={s.darkSection95}>
              <View style={s.sectionHeader}>
                <View style={s.sectionTitleRow}>
                  <Books size={22} color={TEXT} weight="regular" />
                  <Text style={s.sectionTitle}>Learning Paths</Text>
                </View>
                <Text style={s.sectionSub}>
                  Guided journeys from start to finish
                </Text>
              </View>
              {LEARNING_PATHS.map(path => (
                <LearningPathCard
                  key={path.id}
                  path={path}
                  onPress={() => {
                    const first = MEDIA.find(m => m.id === path.items[0]);
                    if (first) Linking.openURL(first.url);
                  }}
                />
              ))}
              <View style={{ height: 12 }} />
            </View>

            {/* ── Browse by Topic ── */}
            <View style={s.darkSection90}>
              <View style={s.sectionHeader}>
                <View style={s.sectionTitleRow}>
                  <Compass size={22} color={TEXT} weight="regular" />
                  <Text style={s.sectionTitle}>Browse by topic</Text>
                </View>
              </View>
              <View style={s.topicGrid}>
                {BROWSE_TOPICS.map((topic, i) => {
                  if (i % 2 !== 0) return null;
                  const right = BROWSE_TOPICS[i + 1];
                  return (
                    <View key={topic.key + i} style={s.topicRow}>
                      <TopicCard topic={topic} onPress={() => {}} />
                      {right ? (
                        <TopicCard topic={right} onPress={() => {}} />
                      ) : (
                        <View style={{ flex: 1 }} />
                      )}
                    </View>
                  );
                })}
              </View>
              <View style={{ height: 12 }} />
            </View>

          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: BG },
  scrollContent: { paddingBottom: 32 },

  // Page header
  pageHeader:      { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, backgroundColor: BG },
  pageTitleRow:    { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 2 },
  pageTitle:       { fontFamily: SERIF, fontSize: 34, color: TEXT, fontWeight: "400", lineHeight: 40 },
  pageSub:         { fontSize: 13, color: TEXT, lineHeight: 19, marginTop: 4 },
  pageDisclosure:  { fontSize: 11, color: MUTED, marginTop: 2, lineHeight: 16 },

  // Hero carousel
  backBtn:        { position: "absolute", left: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.35)", borderWidth: 1, borderColor: "rgba(255,255,255,0.20)", alignItems: "center", justifyContent: "center" },
  slideBadge:     { position: "absolute", flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.50)", borderRadius: 50, paddingHorizontal: 14, paddingVertical: 7 },
  slideBadgeText: { fontSize: 13, color: "#FFFFFF", fontWeight: "500", letterSpacing: 0.5 },
  slideContent:   { position: "absolute", bottom: 32, left: 16, right: 16 },
  slideTitle:     { fontSize: 24, color: "#FFFFFF", fontWeight: "600", lineHeight: 30, marginBottom: 6 },
  slideSource:    { fontSize: 13, color: "rgba(255,255,255,0.75)" },
  heroDots:       { position: "absolute", bottom: 12, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 6 },
  dot:            { width: 5, height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.35)" },
  dotActive:      { backgroundColor: "#C8A96A", width: 18 },

  // Search
  searchBar:   { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginTop: 19, marginBottom: 5, backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  searchInput: { flex: 1, fontSize: 15, color: TEXT, padding: 0 },

  // Section headers
  sectionHeader:    { paddingHorizontal: 16, marginTop: 22, marginBottom: 10 },
  sectionTitle:     { fontSize: 20, color: TEXT, fontWeight: "600" },
  sectionSub:       { fontSize: 13, color: MUTED, marginTop: 3 },
  sectionRowHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, marginTop: 10, marginBottom: 10 },
  sectionTitleRow:  { flexDirection: "row", alignItems: "center", gap: 8 },
  viewAll:     { fontSize: 13, color: "rgba(255,255,255,0.55)", fontWeight: "600" },
  typeSection:   { marginTop: 6, paddingTop: 2 },
  darkSection95: { backgroundColor: "rgba(255,255,255,0.10)", marginTop: 8 },
  darkSection90: { backgroundColor: "rgba(0,0,0,0.90)", marginTop: 8 },

  // Topic grid
  topicGrid: { paddingHorizontal: 16, gap: 10 },
  topicRow:  { flexDirection: "row", gap: 10 },

  // Horizontal card scroll
  cardScroll: { paddingHorizontal: 16, paddingBottom: 4 },

  // Search results
  searchResultsCard: { marginHorizontal: 16, backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, overflow: "hidden", shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  resultRow:         { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
  resultRowBorder:   { borderBottomWidth: 1, borderBottomColor: BORDER },
  resultThumb:       { width: 72, height: 54, borderRadius: 8, overflow: "hidden", flexShrink: 0, position: "relative" },
  resultThumbImg:    { width: "100%", height: "100%" },
  resultPlay:        { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.25)" },
  resultInfo:        { flex: 1, gap: 3 },
  resultBadge:       { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 50 },
  resultBadgeText:   { fontSize: 10, fontWeight: "500" },
  resultTitle:       { fontSize: 14, color: TEXT, lineHeight: 19, fontWeight: "500" },
  resultSource:      { fontSize: 12, color: MUTED },

  // Empty state
  empty:    { alignItems: "center", paddingVertical: 32, gap: 10 },
  emptyTxt: { fontSize: 15, color: MUTED },
});
