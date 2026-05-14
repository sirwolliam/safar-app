/**
 * ProfileScreen.jsx — Safar  (tab label: "Prepare")
 * Practice & Learn · Save Offline · Bookmarks · Notes
 * Prepare & Shop (affiliate) · Resources · Settings
 */
import React, { useMemo, useRef, useState } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, Linking,
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
    marginTop: spacing(2), marginBottom: spacing(1),
    backgroundColor: "#F5EDD8", borderRadius: radius.md,
    borderWidth: 1, borderColor: "#E8D9B8", padding: spacing(2),
  },
  text: { fontSize: typography.tiny, color: "#7A6030", lineHeight: 17 },
  bold: { fontWeight: "600" },
});

const { width: SW } = Dimensions.get("window");

const CATEGORIES = [
  { key:"tools",     label:"Tools"             },
  { key:"shop",      label:"Prepare & Shop"    },
  { key:"islamic",   label:"Islamic Reference" },
  { key:"media",     label:"Video & Podcasts"  },
  { key:"official",  label:"Official Resources"},
  { key:"settings",  label:"Accounts & Settings"},
];

const TOOLS = [
  { id: "practice", icon: "🎧", title: "Practice & Learn",    sub: "Audio, repeat, and recite",      screen: "PracticeLearn"     },
  { id: "currency", icon: "💱", title: "Currency Converter",  sub: "SAR to your home currency",      screen: "CurrencyConverter" },
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
      <Text style={styles.sectionTitle}>{title}</Text>
      {sub && <Text style={styles.sectionSub}>{sub}</Text>}
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

  const scrollTo = (key) => {
    const y = sectionY.current[key];
    if (y !== undefined) {
      setActiveKey(key);
      scrollRef.current?.scrollTo({ y, animated:true });
    }
  };

  return (
    <SafeAreaView style={s.safe}>

      {/* Sticky header — no hero image */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Prepare</Text>
          <Text style={s.headerSub}>Everything you need before you travel</Text>
        </View>
      </View>

      {/* Category shelf — 3×2 grid, tap to jump to section */}
      <View style={s.shelf}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity key={cat.key}
            style={activeKey === cat.key ? [s.shelfItem, s.shelfItemActive] : s.shelfItem}
            onPress={() => scrollTo(cat.key)} activeOpacity={0.85}>
            <Text style={activeKey === cat.key ? [s.shelfItemTxt, s.shelfItemTxtActive] : s.shelfItemTxt}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}>

        {/* Tools */}
        <View onLayout={e => { sectionY.current.tools = e.nativeEvent.layout.y; }}>
          <SectionHeader styles={s} title="Tools" />
          <MenuCard styles={s} items={TOOLS} navigation={navigation} />
        </View>

        {/* Prepare & Shop */}
        <View onLayout={e => { sectionY.current.shop = e.nativeEvent.layout.y; }}>
          <SectionHeader styles={s} title="Prepare & Shop" sub="Curated essentials for your journey" />
          <AffiliateCard styles={s} items={AFFILIATE_ITEMS} />
        </View>

        {/* Islamic reference */}
        <View onLayout={e => { sectionY.current.islamic = e.nativeEvent.layout.y; }}>
          <SectionHeader styles={s} title="Islamic Reference" sub="Trusted scholarly sources" />
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
        <View style={{ height:spacing(5) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe:   { flex:1, backgroundColor:colors.background },

  // Header — sits at top, no hero above it
  header: {
    paddingHorizontal:spacing(2.5),
    paddingTop:spacing(2),
    paddingBottom:spacing(1.25),
    backgroundColor:colors.background,
  },
  headerTitle: { fontFamily:SERIF, fontSize:28, fontWeight:"400", color:colors.text },
  headerSub:   { fontSize:14, color:colors.subtext, fontWeight:"400", marginTop:1 },

  // Category shelf — segmented 3×2 grid
  shelf:             { marginHorizontal:spacing(2.5), marginBottom:spacing(1.5), backgroundColor:colors.card, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, padding:spacing(0.875), flexDirection:"row", flexWrap:"wrap", gap:spacing(0.625), ...shadows.card },
  shelfItem:         { width:"32%", paddingVertical:spacing(1.25), borderRadius:radius.md, alignItems:"center", justifyContent:"center", backgroundColor:colors.background },
  shelfItemActive:   { backgroundColor:colors.primary },
  shelfItemTxt:      { fontFamily:SERIF, fontSize:12, color:colors.text, textAlign:"center", lineHeight:16 },
  shelfItemTxtActive:{ color:"#fff", fontWeight:"500" },

  scroll: { paddingBottom:spacing(3) },

  sectionHeader: { paddingHorizontal:spacing(2.5), marginTop:spacing(2.5), marginBottom:spacing(1) },
  sectionTitle:  { fontFamily:SERIF, fontSize:typography.heading, fontWeight:"400", color:colors.text },
  sectionSub:    { fontSize:typography.tiny, color:colors.subtext, marginTop:2 },

  menuCard:      { marginHorizontal:spacing(2.5), backgroundColor:colors.card, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, overflow:"hidden", ...shadows.card },
  menuRow:       { flexDirection:"row", alignItems:"center", gap:spacing(1.5), paddingHorizontal:spacing(2), paddingVertical:spacing(1.75) },
  menuRowBorder: { borderBottomWidth:1, borderBottomColor:colors.border },
  menuIconWrap:  { width:44, height:44, borderRadius:radius.md, backgroundColor:"#EBF2EE", alignItems:"center", justifyContent:"center", flexShrink:0 },
  menuInfo:      { flex:1 },
  menuTitle:     { fontFamily:SERIF, fontSize:typography.body, color:colors.text, marginBottom:2 },
  menuSub:       { fontSize:typography.small, color:colors.subtext },
  menuArrow:     { fontSize:20, color:colors.border },
  externalArrow: { fontSize:typography.small, color:colors.primary, fontWeight:"500" },

  affiliateDisclosure: { fontSize:typography.tiny, color:colors.subtext, fontStyle:"italic", marginHorizontal:spacing(2.5), marginBottom:spacing(1), lineHeight:16 },
  affiliateGrid:       { flexDirection:"row", flexWrap:"wrap", gap:spacing(1.25), paddingHorizontal:spacing(2.5) },
  affiliateTile:       { width:(SW - spacing(2.5)*2 - spacing(1.25))/2, backgroundColor:colors.card, borderRadius:radius.md, borderWidth:1, borderColor:colors.border, padding:spacing(1.75), gap:4, ...shadows.card },
  affiliateEmoji:      { fontSize:26, marginBottom:3 },
  affiliateTitle:      { fontFamily:SERIF, fontSize:typography.small, color:colors.text, lineHeight:17 },
  affiliateSub:        { fontSize:typography.tiny, color:colors.subtext, lineHeight:15, flex:1 },
  affiliateShop:       { fontSize:typography.tiny, color:colors.primary, fontWeight:"600", marginTop:4 },
});
