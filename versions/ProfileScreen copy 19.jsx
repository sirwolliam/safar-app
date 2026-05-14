/**
 * ProfileScreen.jsx — Safar  (tab label: "Prepare")
 * Practice & Learn · Save Offline · Bookmarks · Notes
 * Prepare & Shop (affiliate) · Resources · Settings
 */
import React, { useMemo, useRef, useState, useCallback } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, Linking, TextInput,
} from "react-native";
import Svg, { Rect, Path, Ellipse, Circle, G, Line } from "react-native-svg";
import { colors, spacing, radius, shadows, typography } from "../theme";
import { getAffiliateUrl } from "../utils/affiliateLinks";
import { useAccessibility } from "../AccessibilityContext";

const SERIF = "SourceSerif4-Regular";

function ScholarlyFootnote({ style }) {
  return (
    <View style={[fn.wrap, style]}>
      <Text style={fn.text}>
        <Text style={fn.bold}>Sources</Text>{" — "}
        Duas are drawn from Ṣaḥīḥ al-Bukhārī, Ṣaḥīḥ Muslim, Sunan Abī Dāwūd, Sunan al-Tirmidhī, and established scholarly works. Practice and wording may differ across the four madhabs (Ḥanafī, Mālikī, Shāfiʿī, Ḥanbalī). Consult a qualified scholar for rulings specific to your school of thought.
      </Text>
    </View>
  );
}

const fn = StyleSheet.create({
  wrap: {
    marginTop: 16, marginBottom: 8,
    backgroundColor: "#EEE4CB", borderRadius: 10,
    borderWidth: 1, borderColor: "#DDD0A8", padding: 16,
  },
  text: { fontSize: 12, color: "#6B5020", lineHeight: 17 },
  bold: { fontWeight: "600" },
});

const { width: SW } = Dimensions.get("window");

const CATEGORIES = [
  { key:"tools",    label:"Tools",     icon:"🛠",  desc:"Apps & utilities"         },
  { key:"shop",     label:"Shop",      icon:"🛍",  desc:"Essentials for the journey" },
  { key:"islamic",  label:"Scholars",  icon:"📖",  desc:"Trusted Islamic sources"   },
  { key:"media",    label:"Media",     icon:"🎬",  desc:"Videos & podcasts"         },
  { key:"official", label:"Official",  icon:"🕌",  desc:"Saudi & gov resources"     },
  { key:"settings", label:"Settings",  icon:"⚙️",  desc:"Account & preferences"     },
];

const TOOLS = [
  { id: "wtexpect",  icon: "🗺️", title: "What to Expect",       sub: "Health, logistics & travel tips",  screen: "WhatToExpect"       },
  { id: "practice",  icon: "🎧", title: "Practice & Learn",    sub: "Audio, repeat, and recite",      screen: "PracticeLearn"      },
  { id: "prayer",   icon: "🕌", title: "Prayer Times",         sub: "Daily salah times for your city", screen: "PrayerTimes"        },
  { id: "qibla",    icon: "🧭", title: "Qibla Finder",         sub: "Direction of the Ka'bah",         screen: "Qibla"              },
  { id: "currency", icon: "💱", title: "Currency Converter",   sub: "SAR to your home currency",       screen: "CurrencyConverter"  },
  { id: "offline",  icon: "💾", title: "Save for Offline",    sub: "All duas work without internet", screen: "PrintOffline"      },
  { id: "bookmark", icon: "🔖", title: "Bookmarks",           sub: "Your saved duas",                screen: "Bookmarks"         },
  { id: "notes",    icon: "📝", title: "Notes",               sub: "Personal reflections",           screen: "Notes"             },
];

const AFFILIATE_ITEMS = [
  { id: "ihram",    icon: "🕌", title: "Ihram Clothing",        sub: "Men's & women's ihram garments",    query: "ihram clothing hajj"             },
  { id: "bag",      icon: "🎒", title: "Hajj & Umrah Bags",     sub: "Waist bags, travel pouches, luggage", query: "hajj umrah bag"                },
  { id: "sandals",  icon: "👡", title: "Comfortable Sandals",   sub: "Ihram-compliant footwear",          query: "ihram sandals hajj"              },
  { id: "zamzam",   icon: "💧", title: "Zamzam Water Bottle",   sub: "Insulated bottles for the journey", query: "zamzam water bottle insulated"   },
  { id: "umbrella", icon: "☂️", title: "Sun Protection",        sub: "Umbrellas, sun cream, cooling towels", query: "hajj umbrella sun protection" },
  { id: "prayer",   icon: "📿", title: "Prayer Essentials",     sub: "Tasbih, prayer mat, compass",       query: "islamic prayer essentials hajj"  },
];

const ISLAMIC_REFS = [
  { title: "Sunnah.com",          sub: "Hadith collections — Bukhari, Muslim & more",  url: "https://sunnah.com" },
  { title: "IslamQA.info",        sub: "Scholarly Q&A on fiqh and worship",             url: "https://islamqa.info/en" },
  { title: "SeekersGuidance.org", sub: "Online Islamic courses and fatwa service",      url: "https://seekersguidance.org" },
  { title: "Islamweb.net",        sub: "Fatwas, Quran & hadith research",               url: "https://www.islamweb.net/en" },
];

const MULTIMEDIA = [
  { title: "Hajj Step by Step — Official",   sub: "Saudi Ministry of Hajj YouTube",           url: "https://www.youtube.com/@HajjMinistry" },
  { title: "Yaqeen Institute — Hajj Series", sub: "Video series on the spirituality of Hajj", url: "https://yaqeeninstitute.org" },
  { title: "Umrah Guide — Mufti Menk",       sub: "YouTube playlist — step by step",          url: "https://www.youtube.com/results?search_query=mufti+menk+umrah+guide" },
  { title: "The Deen Show — Hajj Podcast",   sub: "Audio guide to preparing for Hajj",        url: "https://thedeenshow.com" },
  { title: "Qalam Institute — Hajj Prep",    sub: "Podcast and video resources",               url: "https://www.qalaminstitute.org" },
];

const OFFICIAL_LINKS = [
  { title: "Saudi Ministry of Hajj",     sub: "Official pilgrimage authority",           url: "https://www.haj.gov.sa" },
  { title: "Nusuk App",                  sub: "Official Hajj & Umrah services platform", url: "https://www.nusuk.sa" },
  { title: "Eatmarna / Tawakkalna",      sub: "Entry permits and health requirements",   url: "https://www.haj.gov.sa/en/InternalPages/Page/47" },
  { title: "Presidency of Holy Mosques", sub: "Masjid al-Haram & al-Nabawi authority",   url: "https://www.gph.gov.sa" },
  { title: "IATA Travel Centre — KSA",   sub: "Visa and entry requirements",             url: "https://www.iata.org/en/publications/timatic/" },
];

function SectionHeader({ title, sub, styles }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.sectionBar} />
        <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
        <View style={styles.sectionLine} />
      </View>
      {sub ? <Text style={styles.sectionSub}>{sub}</Text> : null}
    </View>
  );
}

function MenuCard({ items, navigation, styles }) {
  return (
    <View style={styles.menuCard}>
      {items.map((item, i) => (
        <TouchableOpacity
          key={item.id}
          style={i < items.length - 1 ? [styles.menuRow, styles.menuRowBorder] : styles.menuRow}
          onPress={() => navigation?.navigate?.(item.screen)}
          activeOpacity={0.85}
        >
          <View style={styles.menuIconWrap}>
            <Text style={{ fontSize: 20 }}>{item.icon}</Text>
          </View>
          <View style={styles.menuInfo}>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuSub}>{item.sub}</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function LinkCard({ items, styles }) {
  return (
    <View style={styles.menuCard}>
      {items.map((item, i) => (
        <TouchableOpacity
          key={item.url}
          style={i < items.length - 1 ? [styles.menuRow, styles.menuRowBorder] : styles.menuRow}
          onPress={() => Linking.openURL(item.url)}
          activeOpacity={0.85}
        >
          <View style={styles.menuInfo}>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuSub}>{item.sub}</Text>
          </View>
          <Text style={styles.externalArrow}>↗</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function AffiliateCard({ items, styles }) {
  return (
    <>
      <Text style={styles.affiliateDisclosure}>
        Links below may earn Safar a small commission at no extra cost to you.
      </Text>
      <View style={styles.affiliateGrid}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.affiliateTile}
            onPress={() => Linking.openURL(getAffiliateUrl(item.query))}
            activeOpacity={0.85}
          >
            <Text style={styles.affiliateEmoji}>{item.icon}</Text>
            <Text style={styles.affiliateTitle}>{item.title}</Text>
            <Text style={styles.affiliateSub}>{item.sub}</Text>
            <Text style={styles.affiliateShop}>Shop ↗</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}

export default function ProfileScreen({ navigation }) {
  const { colors } = useAccessibility();
  const s = useMemo(() => createStyles(colors), [colors]);
  const scrollRef    = useRef(null);
  const sectionY     = useRef({});
  const [activeKey, setActiveKey] = useState("tools");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const scrollTo = (key) => {
    const y = sectionY.current[key];
    if (y !== undefined) {
      setActiveKey(key);
      scrollRef.current?.scrollTo({ y, animated:true });
    }
  };

  const q = searchQuery.toLowerCase().trim();
  const filterItems = (items) => !q ? items : items.filter(item =>
    item.title?.toLowerCase().includes(q) || item.sub?.toLowerCase().includes(q)
  );
  const isSearching = q.length > 0;

  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Prepare</Text>
        <Text style={s.headerSub}>Everything you need before and during your journey</Text>
      </View>

      {/* Search bar */}
      <View style={s.searchWrap}>
        <View style={[s.searchBar, searchFocused && s.searchBarFocused]}>
          <Text style={s.searchIcon}>{"🔍"}</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search tools, resources, links…"
            placeholderTextColor="#5C534A"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} hitSlop={{top:8,bottom:8,left:8,right:8}}>
              <Text style={s.searchClear}>{"✕"}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tab navigation — horizontal scroll with icon + label + underline */}
      {!isSearching && (
        <View style={s.tabsWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.tabsRow}
          >
            {CATEGORIES.map(cat => {
              const active = activeKey === cat.key;
              return (
                <TouchableOpacity
                  key={cat.key}
                  style={s.tab}
                  onPress={() => scrollTo(cat.key)}
                  activeOpacity={0.75}
                >
                  <Text style={s.tabIcon}>{cat.icon}</Text>
                  <Text style={active ? [s.tabLabel, s.tabLabelActive] : s.tabLabel}>
                    {cat.label}
                  </Text>
                  {active && <View style={s.tabUnderline} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={s.tabsBorder} />
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}>

        {/* Search results */}
        {isSearching ? (
          <View>
            {filterItems(TOOLS).length > 0 && (
              <>
                <SectionHeader styles={s} title="Tools" />
                <MenuCard styles={s} items={filterItems(TOOLS)} navigation={navigation} />
              </>
            )}
            {filterItems(AFFILIATE_ITEMS).length > 0 && (
              <>
                <SectionHeader styles={s} title="Prepare & Shop" />
                <AffiliateCard styles={s} items={filterItems(AFFILIATE_ITEMS)} />
              </>
            )}
            {filterItems(ISLAMIC_REFS).length > 0 && (
              <>
                <SectionHeader styles={s} title="Islamic Reference" />
                <LinkCard styles={s} items={filterItems(ISLAMIC_REFS)} />
              </>
            )}
            {filterItems(MULTIMEDIA).length > 0 && (
              <>
                <SectionHeader styles={s} title="Videos & Podcasts" />
                <LinkCard styles={s} items={filterItems(MULTIMEDIA)} />
              </>
            )}
            {filterItems(OFFICIAL_LINKS).length > 0 && (
              <>
                <SectionHeader styles={s} title="Official Resources" />
                <LinkCard styles={s} items={filterItems(OFFICIAL_LINKS)} />
              </>
            )}
            {filterItems(TOOLS).length === 0 &&
             filterItems(AFFILIATE_ITEMS).length === 0 &&
             filterItems(ISLAMIC_REFS).length === 0 &&
             filterItems(MULTIMEDIA).length === 0 &&
             filterItems(OFFICIAL_LINKS).length === 0 && (
              <View style={s.emptySearch}>
                <Text style={s.emptySearchIcon}>{"🔍"}</Text>
                <Text style={s.emptySearchText}>No results for "{searchQuery}"</Text>
              </View>
            )}
          </View>
        ) : (
          <>
        {/* Tools */}
        <View onLayout={e => { sectionY.current.tools = e.nativeEvent.layout.y; }}>
          <SectionHeader styles={s} title="Tools" sub="Apps and utilities for your journey" />
          <MenuCard styles={s} items={TOOLS} navigation={navigation} />
        </View>

        {/* Prepare & Shop */}
        <View onLayout={e => { sectionY.current.shop = e.nativeEvent.layout.y; }}>
          <SectionHeader styles={s} title="Prepare & Shop" sub="Curated essentials for the journey" />
          <AffiliateCard styles={s} items={AFFILIATE_ITEMS} />
        </View>

        {/* Islamic reference */}
        <View onLayout={e => { sectionY.current.islamic = e.nativeEvent.layout.y; }}>
          <SectionHeader styles={s} title="Islamic Reference" sub="Trusted scholarly sources and fatwa services" />
          <LinkCard styles={s} items={ISLAMIC_REFS} />
        </View>

        {/* Multimedia */}
        <View onLayout={e => { sectionY.current.media = e.nativeEvent.layout.y; }}>
          <SectionHeader styles={s} title="Videos & Podcasts" sub="How-to guides and spiritual preparation" />
          <LinkCard styles={s} items={MULTIMEDIA} />
        </View>

        {/* Official */}
        <View onLayout={e => { sectionY.current.official = e.nativeEvent.layout.y; }}>
          <SectionHeader styles={s} title="Official Resources" sub="Saudi government and pilgrimage authorities" />
          <LinkCard styles={s} items={OFFICIAL_LINKS} />
        </View>

        {/* Account & Settings */}
        <View onLayout={e => { sectionY.current.settings = e.nativeEvent.layout.y; }}>
          <SectionHeader styles={s} title="Accounts & Settings" />
          <View style={s.menuCard}>
            <TouchableOpacity
              style={[s.menuRow, s.menuRowBorder]}
              onPress={() => navigation?.navigate?.("Settings")}
              activeOpacity={0.85}>
              <View style={s.menuIconWrap}><Text style={{ fontSize:20 }}>{"⚙️"}</Text></View>
              <View style={s.menuInfo}>
                <Text style={s.menuTitle}>Settings</Text>
                <Text style={s.menuSub}>Voice, display, account, privacy</Text>
              </View>
              <Text style={s.menuArrow}>{"›"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.menuRow}
              onPress={() => navigation?.navigate?.("Support")}
              activeOpacity={0.85}>
              <View style={s.menuIconWrap}><Text style={{ fontSize:20 }}>{"🤲"}</Text></View>
              <View style={s.menuInfo}>
                <Text style={s.menuTitle}>Help & Support</Text>
                <Text style={s.menuSub}>FAQs, tutorials, contact us</Text>
              </View>
              <Text style={s.menuArrow}>{"›"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScholarlyFootnote />
        <View style={{ height:40 }} />
        </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe:   { flex:1, backgroundColor:"#E8DDD0" },

  // Header
  header:      { paddingHorizontal:20, paddingTop:16, paddingBottom:10, backgroundColor:"#E8DDD0" },
  headerTitle: { fontFamily:SERIF, fontSize:28, fontWeight:"600", color:colors.text, marginBottom:3 },
  headerSub:   { fontSize:14, color:colors.subtext, fontWeight:"400" },

  // Search bar
  searchWrap:        { paddingHorizontal:20, paddingBottom:12 },
  searchBar:         { flexDirection:"row", alignItems:"center", gap:10, backgroundColor:colors.card, borderRadius:14, borderWidth:1.5, borderColor:colors.border, paddingHorizontal:14, paddingVertical:11, shadowColor:"#4A2E10", shadowOffset:{width:0,height:2}, shadowOpacity:0.14, shadowRadius:6, elevation:3 },
  searchBarFocused:  { borderColor:colors.primary },
  searchIcon:        { fontSize:15, opacity:0.5 },
  searchInput:       { flex:1, fontSize:16, color:colors.text, padding:0 },
  searchClear:       { fontSize:14, color:colors.subtext, paddingLeft:4 },

  // Tab navigation — horizontal scroll
  tabsWrap:      { marginBottom:0, backgroundColor:"#E8DDD0" },
  tabsRow:       { paddingHorizontal:16, paddingBottom:0, gap:0 },
  tab:           { alignItems:"center", paddingHorizontal:14, paddingVertical:10, position:"relative", minWidth:72 },
  tabIcon:       { fontSize:20, marginBottom:4 },
  tabLabel:      { fontSize:13, color:colors.subtext, fontWeight:"400", textAlign:"center" },
  tabLabelActive:{ color:colors.primary, fontWeight:"600" },
  tabUnderline:  { position:"absolute", bottom:0, left:10, right:10, height:2.5, backgroundColor:colors.primary, borderRadius:2 },
  tabsBorder:    { height:1, backgroundColor:colors.border, marginBottom:4 },

  scroll: { paddingBottom:40 },

  // Section headers — generous spacing, clear hierarchy
  sectionHeader:   { paddingHorizontal:20, marginTop:28, marginBottom:12 },
  sectionTitleRow: { flexDirection:"row", alignItems:"center", gap:10, marginBottom:4 },
  sectionBar:      { width:3, height:14, borderRadius:2, backgroundColor:colors.primary },
  sectionTitle:    { fontFamily:SERIF, fontSize:13, fontWeight:"700", letterSpacing:1.5, color:colors.primary, lineHeight:14 },
  sectionLine:     { flex:1, height:1, backgroundColor:colors.border },
  sectionSub:      { fontSize:14, color:colors.subtext, lineHeight:20, marginLeft:13 },

  // Menu card
  menuCard:      { marginHorizontal:20, backgroundColor:colors.card, borderRadius:16, borderWidth:1, borderColor:colors.border, overflow:"hidden", shadowColor:"#4A2E10", shadowOffset:{width:0,height:3}, shadowOpacity:0.18, shadowRadius:10, elevation:5 },
  menuRow:       { flexDirection:"row", alignItems:"center", gap:14, paddingHorizontal:18, paddingVertical:16 },
  menuRowBorder: { borderBottomWidth:1, borderBottomColor:colors.border },
  menuIconWrap:  { width:46, height:46, borderRadius:12, backgroundColor:"#E2EDE6", alignItems:"center", justifyContent:"center", flexShrink:0 },
  menuInfo:      { flex:1 },
  menuTitle:     { fontFamily:SERIF, fontSize:16, color:colors.text, marginBottom:2 },
  menuSub:       { fontSize:14, color:colors.subtext },
  menuArrow:     { fontSize:20, color:colors.border },
  externalArrow: { fontSize:14, color:colors.primary, fontWeight:"500" },

  // Affiliate grid
  affiliateDisclosure: { fontSize:12, color:colors.subtext, fontStyle:"italic", marginHorizontal:20, marginBottom:10, lineHeight:16 },
  affiliateGrid:       { flexDirection:"row", flexWrap:"wrap", gap:12, paddingHorizontal:20 },
  affiliateTile:       { width:(SW - 40 - 12)/2, backgroundColor:colors.card, borderRadius:14, borderWidth:1, borderColor:colors.border, padding:16, gap:4, shadowColor:"#4A2E10", shadowOffset:{width:0,height:2}, shadowOpacity:0.14, shadowRadius:6, elevation:3 },
  affiliateEmoji:      { fontSize:26, marginBottom:4 },
  affiliateTitle:      { fontFamily:SERIF, fontSize:14, color:colors.text, lineHeight:18 },
  affiliateSub:        { fontSize:12, color:colors.subtext, lineHeight:16, flex:1 },
  affiliateShop:       { fontSize:12, color:"#7A5A2A", fontWeight:"600", marginTop:4 },

  // Empty search state
  emptySearch:     { alignItems:"center", paddingVertical:48 },
  emptySearchIcon: { fontSize:36, marginBottom:12, opacity:0.4 },
  emptySearchText: { fontSize:16, color:colors.subtext, textAlign:"center" },
});
