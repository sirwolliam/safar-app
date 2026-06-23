/**
 * ProfileScreen.jsx — Safar  (tab label: "Prepare")
 * Practice & Learn · Save Offline · Bookmarks · Notes
 * Prepare & Shop (affiliate) · Resources · Settings
 */
import React, { useMemo, useRef, useState, useCallback } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, Linking, TextInput, ImageBackground, Modal,
} from "react-native";
import { Wrench, ShoppingBag, BookOpen, PlayCircle, Buildings,
         MapTrifold, Headphones, Mosque, Compass, CurrencyCircleDollar,
         BookmarkSimple, NotePencil } from "phosphor-react-native";
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
  { key:"tools",    label:"Tools",     Icon:Wrench,       desc:"Apps & utilities"         },
  { key:"shop",     label:"Shop",      Icon:ShoppingBag,  desc:"Essentials for the journey" },
  { key:"islamic",  label:"Scholars",  Icon:BookOpen,     desc:"Trusted Islamic sources"   },
  { key:"media",    label:"Media",     Icon:PlayCircle,   desc:"Videos & podcasts"         },
  { key:"official", label:"Official",  Icon:Buildings,    desc:"Saudi & gov resources"     },
  { key:"settings", label:"Settings",  icon:"⚙️",  desc:"Account & preferences"     },
];

const TOOLS = [
  { id: "wtexpect",  Icon: MapTrifold,           title: "What to Expect",       sub: "Health, logistics & travel tips",  screen: "WhatToExpect"       },
  { id: "practice",  Icon: Headphones,           title: "Practice & Learn",    sub: "Audio, repeat, and recite",      screen: "PracticeLearn"      },
  { id: "prayer",    Icon: Mosque,               title: "Prayer Times",         sub: "Daily salah times for your city", screen: "PrayerTimes"        },
  { id: "qibla",     Icon: Compass,              title: "Qibla Finder",         sub: "Direction of the Ka'bah",         screen: "Qibla"              },
  { id: "currency",  Icon: CurrencyCircleDollar, title: "Currency Converter",   sub: "SAR to your home currency",       screen: "CurrencyConverter"  },
  { id: "bookmark",  Icon: BookmarkSimple,        title: "Bookmarks",           sub: "Your saved duas",                screen: "Bookmarks"         },
  { id: "notes",     Icon: NotePencil,           title: "Notes",               sub: "Personal reflections",           screen: "Notes"             },
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
            <item.Icon size={20} color={colors.primary} weight="thin" />
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

const ABOUT_CONTENT = "Safar is your companion for every step of your sacred Hajj or Umrah journey.\n\nBuild a personalised step-by-step plan, pin your hotel, guide and travel group, practise the most important du\u02bf\u0101\u02bes, and carry the guidance of scholars in your pocket.\n\nShare milestones with fellow pilgrims, track your progress through every ibadah, and arrive prepared, calm and confident.\n\nMay Allah accept your journey. \u0622\u0645\u064a\u0646";

function AboutSafarModal({ visible, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        style={{ flex:1, backgroundColor:"rgba(15,36,25,0.65)", justifyContent:"center", alignItems:"center", paddingHorizontal:28 }}
        activeOpacity={1} onPress={onClose}
      >
        <View
          style={{ backgroundColor:"#FDFAF4", borderRadius:20, padding:28, width:"100%", shadowColor:"#4A5C48", shadowOffset:{width:0,height:8}, shadowOpacity:0.20, shadowRadius:24, elevation:12 }}
          onStartShouldSetResponder={() => true}
        >
          <Text style={{ fontFamily:SERIF, fontSize:22, fontWeight:"600", color:"#4A5C48", marginBottom:14 }}>What is Safar?</Text>
          <Text style={{ fontSize:15, color:"#3A3530", lineHeight:24, marginBottom:22 }}>{ABOUT_CONTENT}</Text>
          <TouchableOpacity
            style={{ backgroundColor:"#4A5C48", borderRadius:50, paddingHorizontal:32, paddingVertical:11, alignSelf:"flex-start" }}
            onPress={onClose}
          >
            <Text style={{ color:"#FDFAF4", fontSize:14, fontWeight:"600" }}>Close</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export default function ProfileScreen({ navigation }) {
  const { colors } = useAccessibility();
  const s = useMemo(() => createStyles(colors), [colors]);
  const scrollRef    = useRef(null);
  const sectionY     = useRef({});
  const [activeKey, setActiveKey]     = useState("tools");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [showAbout, setShowAbout]     = useState(false);

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

      {/* Header — fixed height matches all other tabs */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.headerTitleRow}>
            <Text style={s.headerTitle}>Prepare</Text>
            <View style={s.headerIcons}>
              <TouchableOpacity style={s.headerIconBtn}
                onPress={() => navigation?.navigate?.("Support")} activeOpacity={0.8}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="12" r="10" stroke="#4A5C48" strokeWidth="1.8"/>
                  <Path d="M9.5 9.5C9.5 8.12 10.62 7 12 7s2.5 1.12 2.5 2.5c0 1.5-2.5 2-2.5 3.5" stroke="#4A5C48" strokeWidth="1.8" strokeLinecap="round"/>
                  <Circle cx="12" cy="17" r="0.8" fill="#4A5C48"/>
                </Svg>
              </TouchableOpacity>
              <TouchableOpacity style={s.headerIconBtn}
                onPress={() => navigation?.navigate?.("Settings")} activeOpacity={0.8}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="#4A5C48" strokeWidth="1.8"/>
                  <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="#4A5C48" strokeWidth="1.8"/>
                </Svg>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={s.headerSub}>Everything you need before and during your journey</Text>
        </View>
      </View>

      {/* Hero image — same height as Duas page hero */}
      <ImageBackground
        source={require("../assets/tab_dua_library.jpg")}
        style={s.heroImg}
        imageStyle={s.heroImgStyle}
      >
        <View style={s.heroScrim} />
      </ImageBackground>

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
                  <View style={{ marginBottom:4 }}>
                    <cat.Icon
                      size={20}
                      color={active ? colors.primary : "#7A7060"}
                      weight="thin"
                    />
                  </View>
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

      {/* Search bar — below nav */}
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
              <View style={s.menuIconWrap}>
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="#4A5C48" strokeWidth="1.6"/>
                  <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="#4A5C48" strokeWidth="1.6"/>
                </Svg>
              </View>
              <View style={s.menuInfo}>
                <Text style={s.menuTitle}>Settings</Text>
                <Text style={s.menuSub}>Voice, display, account, privacy</Text>
              </View>
              <Text style={s.menuArrow}>{"›"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.menuRow, s.menuRowBorder]}
              onPress={() => navigation?.navigate?.("Support")}
              activeOpacity={0.85}>
              <View style={s.menuIconWrap}>
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="12" r="10" stroke="#4A5C48" strokeWidth="1.6"/>
                  <Path d="M9.5 9.5C9.5 8.12 10.62 7 12 7s2.5 1.12 2.5 2.5c0 1.5-2.5 2-2.5 3.5" stroke="#4A5C48" strokeWidth="1.6" strokeLinecap="round"/>
                  <Circle cx="12" cy="17" r="0.8" fill="#4A5C48"/>
                </Svg>
              </View>
              <View style={s.menuInfo}>
                <Text style={s.menuTitle}>Help & Support</Text>
                <Text style={s.menuSub}>FAQs, tutorials, contact us</Text>
              </View>
              <Text style={s.menuArrow}>{"›"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.menuRow}
              onPress={() => setShowAbout(true)}
              activeOpacity={0.85}>
              <View style={s.menuIconWrap}>
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="#4A5C48" strokeWidth="1.6"/>
                  <Path d="M12 11v6M12 8v.5" stroke="#4A5C48" strokeWidth="1.8" strokeLinecap="round"/>
                </Svg>
              </View>
              <View style={s.menuInfo}>
                <Text style={s.menuTitle}>About Safar</Text>
                <Text style={s.menuSub}>What is Safar and how to use it</Text>
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

      <AboutSafarModal visible={showAbout} onClose={() => setShowAbout(false)} />
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe:   { flex:1, backgroundColor:colors.background },
  heroImg:      { height:96, marginBottom:12 },
  heroImgStyle: { resizeMode:"cover" },
  heroScrim:    { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(30,61,48,0.15)" },

  // Header — consistent padding matches all other tabs
  header:         { paddingHorizontal:spacing(2.5), paddingTop:14, paddingBottom:12, backgroundColor:colors.background },
  headerLeft:     { flex:1 },
  headerTitleRow: { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:3 },
  headerIcons:    { flexDirection:"row", gap:8 },
  headerIconBtn:  { width:32, height:32, borderRadius:16, backgroundColor:colors.card, borderWidth:1, borderColor:colors.border, alignItems:"center", justifyContent:"center" },
  headerTitle:    { fontFamily:SERIF, fontSize:26, fontWeight:"400", color:colors.text },
  headerSub:      { fontSize:14, color:colors.subtext, fontWeight:"400" },

  // Search bar
  searchWrap:        { paddingHorizontal:20, paddingBottom:12, paddingTop:16 },
  searchBar:         { flexDirection:"row", alignItems:"center", gap:10, backgroundColor:colors.card, borderRadius:14, borderWidth:1.5, borderColor:colors.border, paddingHorizontal:14, paddingVertical:11, shadowColor:"#4A2E10", shadowOffset:{width:0,height:2}, shadowOpacity:0.14, shadowRadius:6, elevation:3 },
  searchBarFocused:  { borderColor:colors.primary },
  searchIcon:        { fontSize:15, opacity:0.5 },
  searchInput:       { flex:1, fontSize:16, color:colors.text, padding:0 },
  searchClear:       { fontSize:14, color:colors.subtext, paddingLeft:4 },

  // Tab navigation — horizontal scroll
  tabsWrap:      { marginBottom:0, backgroundColor:"#E8DDD0" },
  tabsRow:       { paddingHorizontal:16, paddingBottom:0, gap:0 },
  tab:           { alignItems:"center", paddingHorizontal:14, paddingVertical:10, position:"relative", minWidth:72 },
  tabLabel:      { fontSize:13, color:"#3A3530", fontWeight:"600", textAlign:"center" },
  tabLabelActive:{ color:colors.primary, fontWeight:"600" },
  tabUnderline:  { position:"absolute", bottom:0, left:10, right:10, height:2.5, backgroundColor:colors.primary, borderRadius:2 },
  tabsBorder:    { height:1, backgroundColor:colors.border, marginBottom:4 },

  scroll: { paddingBottom:40 },

  // Section headers — generous spacing, clear hierarchy
  sectionHeader:   { paddingHorizontal:20, marginTop:28, marginBottom:12 },
  sectionTitleRow: { flexDirection:"row", alignItems:"center", gap:10, marginBottom:4 },
  sectionBar:      { width:3, height:20, borderRadius:2, backgroundColor:colors.primary },
  sectionTitle:    { fontFamily:SERIF, fontSize:17, fontWeight:"700", letterSpacing:0.5, color:colors.primary, lineHeight:20 },
  sectionLine:     { flex:1, height:1, backgroundColor:colors.border },
  sectionSub:      { fontSize:14, color:"#3A3530", fontWeight:"600", lineHeight:20, marginLeft:13 },

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
