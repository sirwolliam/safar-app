/**
 * ShopScreen.jsx — Safar
 * Curated Hajj & Umrah essentials shop.
 * All links go to Amazon via regional affiliate URLs.
 * Categories: All · Ihram · Books · Health · Bags · Accessories
 */
import React, { useState } from "react";
import {
  SafeAreaView, View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Linking,
} from "react-native";
import {
  ArrowLeft, ShoppingBag, ArrowSquareOut, Star,
  FirstAid, Backpack, BookOpen, Scales, TShirt,
} from "phosphor-react-native";
import { spacing, radius } from "../theme";
import { getAffiliateUrl } from "../utils/affiliateLinks";

const BG     = "#F5EFE4";
const CARD   = "#FDFAF4";
const SAGE   = "#4A5C48";
const GOLD   = "#B8922A";
const GOLD_L = "#C8A96A";
const BORDER = "#E0D8CC";
const TEXT   = "#1C1A14";
const MUTED  = "#7A7060";
const SERIF  = "SourceSerif4-Regular";

// ── Product catalogue ─────────────────────────────────────────────────────────
const PRODUCTS = [
  // ── Ihram ──
  {
    id:       "ihram-men",
    category: "ihram",
    tag:      "Essential",
    name:     "Ihram Clothing — Men",
    desc:     "Two-piece white seamless ihram towels. Unstitched, breathable and lightweight for Tawaf and Sa\u02bfi.",
    query:    "ihram clothing men hajj umrah",
    featured: true,
  },
  {
    id:       "ihram-belt",
    category: "ihram",
    tag:      null,
    name:     "Ihram Belt & Safety Pins",
    desc:     "Keep your ihram secure throughout Tawaf and Sa\u02bfi without worrying about adjustment.",
    query:    "ihram belt money belt hajj",
    featured: false,
  },
  {
    id:       "ihram-bag",
    category: "ihram",
    tag:      null,
    name:     "Ihram Storage Pouch",
    desc:     "Lightweight drawstring bag to keep your ihram clean and folded when not in use.",
    query:    "ihram storage bag pilgrimage",
    featured: false,
  },
  {
    id:       "abaya",
    category: "ihram",
    tag:      "Women",
    name:     "Abaya for Hajj & Umrah",
    desc:     "Modest, breathable abaya suitable for the heat of Makkah. Easy to perform wudu and worship in.",
    query:    "abaya hajj umrah women modest",
    featured: false,
  },

  // ── Books & Duas ──
  {
    id:       "dua-book",
    category: "books",
    tag:      "Popular",
    name:     "Fortress of the Muslim",
    desc:     "Hisnul Muslim — the essential pocket du\u02bf\u0101 book. Authenticated supplications for every occasion including Hajj & Umrah.",
    query:    "fortress of the muslim hisnul muslim dua book",
    featured: true,
  },
  {
    id:       "hajj-guide-book",
    category: "books",
    tag:      null,
    name:     "Hajj & Umrah Guide Book",
    desc:     "Step-by-step scholarly guide to performing Hajj and Umrah correctly. Ideal for first-time pilgrims.",
    query:    "hajj umrah guide book step by step",
    featured: false,
  },
  {
    id:       "quran-travel",
    category: "books",
    tag:      null,
    name:     "Travel Quran",
    desc:     "Compact pocket-size Quran — easy to carry during Tawaf, Sa\u02bfi and the days in Mina and Arafat.",
    query:    "pocket quran travel size arabic",
    featured: false,
  },
  {
    id:       "tasbeeh",
    category: "books",
    tag:      null,
    name:     "Misbaha / Tasbeeh Counter",
    desc:     "Traditional misbaha or digital counter for tracking your dhikr and tasbih throughout the pilgrimage.",
    query:    "misbaha tasbeeh dhikr counter",
    featured: false,
  },

  // ── Health & Comfort ──
  {
    id:       "sandals",
    category: "health",
    tag:      "Essential",
    name:     "Ihram Sandals",
    desc:     "Open-toed sandals that comply with ihram requirements. Supportive sole for the extensive walking of Tawaf and Sa\u02bfi.",
    query:    "ihram sandals hajj umrah open toe",
    featured: true,
  },
  {
    id:       "blister-kit",
    category: "health",
    tag:      null,
    name:     "Blister Prevention Kit",
    desc:     "Gel insoles, blister plasters and anti-chafe balm. Essential for the 3+ km of daily walking during Umrah.",
    query:    "blister prevention kit walking pilgrimage",
    featured: false,
  },
  {
    id:       "sun-protection",
    category: "health",
    tag:      null,
    name:     "Sun Protection — SPF 50+",
    desc:     "High-factor sunscreen and UV-protective lip balm for the intense Saudi sun, especially during outdoor rites at Arafat.",
    query:    "sunscreen spf 50 travel size halal",
    featured: false,
  },
  {
    id:       "electrolytes",
    category: "health",
    tag:      null,
    name:     "Electrolyte Sachets",
    desc:     "Stay hydrated during the heat of Makkah. Lightweight sachets to mix with Zamzam or bottled water.",
    query:    "electrolyte sachets travel hydration",
    featured: false,
  },
  {
    id:       "travel-meds",
    category: "health",
    tag:      null,
    name:     "Travel First Aid Kit",
    desc:     "Compact first aid kit including pain relief, antiseptic wipes, rehydration salts and blister care.",
    query:    "travel first aid kit compact",
    featured: false,
  },

  // ── Bags & Organisation ──
  {
    id:       "waist-bag",
    category: "bags",
    tag:      "Essential",
    name:     "Hajj Waist / Neck Pouch",
    desc:     "Secure your passport, phone and cash during Tawaf and Sa\u02bfi. Worn under ihram — stays hidden and safe.",
    query:    "hajj waist pouch travel neck wallet passport",
    featured: true,
  },
  {
    id:       "daypack",
    category: "bags",
    tag:      null,
    name:     "Lightweight Daypack",
    desc:     "Small foldable backpack for the days in Mina, Arafat and Muzdalifah. Fits water, snacks and essentials.",
    query:    "lightweight foldable daypack travel",
    featured: false,
  },
  {
    id:       "packing-cubes",
    category: "bags",
    tag:      null,
    name:     "Packing Cubes",
    desc:     "Keep your suitcase organised on the journey. Separate cubes for ihram, daily wear, toiletries and duas.",
    query:    "packing cubes travel luggage organiser",
    featured: false,
  },
  {
    id:       "luggage-tag",
    category: "bags",
    tag:      null,
    name:     "Luggage Tags",
    desc:     "Clearly label all your bags. Essential when thousands of identical suitcases arrive at the same hotel.",
    query:    "luggage tags personalised travel",
    featured: false,
  },

  // ── Accessories ──
  {
    id:       "zamzam-bottle",
    category: "accessories",
    tag:      "Popular",
    name:     "Zamzam Water Bottle",
    desc:     "Approved leak-proof bottle for carrying Zamzam water home. Airline-approved sizes available.",
    query:    "zamzam water bottle airline approved",
    featured: true,
  },
  {
    id:       "travel-prayer-mat",
    category: "accessories",
    tag:      null,
    name:     "Travel Prayer Mat",
    desc:     "Compact foldable prayer mat for the journey, the airport and the days in Mina. Lightweight and easy to clean.",
    query:    "travel prayer mat compact foldable",
    featured: false,
  },
  {
    id:       "umbrella",
    category: "accessories",
    tag:      null,
    name:     "Sun Umbrella",
    desc:     "UV-protective compact umbrella for shade during the walk between Safa and Marwah and outdoor rites.",
    query:    "sun umbrella UV protection compact travel",
    featured: false,
  },
  {
    id:       "wheelchair",
    category: "accessories",
    tag:      null,
    name:     "Folding Walking Cane / Support",
    desc:     "Lightweight folding walking stick for elderly pilgrims or those who need support during extensive walking.",
    query:    "folding walking stick elderly travel lightweight",
    featured: false,
  },
];

const CATEGORIES = [
  { key:"all",         label:"All"          },
  { key:"ihram",       label:"Ihram"        },
  { key:"books",       label:"Books & Du\u02bf\u0101s" },
  { key:"health",      label:"Health"       },
  { key:"bags",        label:"Bags"         },
  { key:"accessories", label:"Accessories"  },
];

const CAT_ICONS = {
  ihram:       TShirt,
  books:       BookOpen,
  health:      FirstAid,
  bags:        Backpack,
  accessories: Star,
  all:         ShoppingBag,
};

// ── Product card ──────────────────────────────────────────────────────────────
function ProductCard({ item }) {
  const CatIcon = CAT_ICONS[item.category] ?? ShoppingBag;

  const handleShop = () => {
    const url = getAffiliateUrl(item.query);
    Linking.openURL(url);
  };

  return (
    <View style={pc.card}>
      {/* Header row */}
      <View style={pc.headerRow}>
        <View style={pc.iconWrap}>
          <CatIcon size={20} color={SAGE} weight="thin"/>
        </View>
        <View style={pc.headerText}>
          <Text style={pc.name}>{item.name}</Text>
          {item.tag ? (
            <View style={pc.tagPill}>
              <Text style={pc.tagTxt}>{item.tag}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Description */}
      <Text style={pc.desc}>{item.desc}</Text>

      {/* Shop button */}
      <TouchableOpacity style={pc.shopBtn} onPress={handleShop} activeOpacity={0.85}>
        <ShoppingBag size={14} color="#fff" weight="thin"/>
        <Text style={pc.shopTxt}>Shop on Amazon</Text>
        <ArrowSquareOut size={13} color="rgba(255,255,255,0.70)" weight="regular"/>
      </TouchableOpacity>
    </View>
  );
}

const pc = StyleSheet.create({
  card:       { backgroundColor:CARD, borderRadius:radius.lg, borderWidth:1, borderColor:BORDER, padding:spacing(2), marginBottom:spacing(1.5) },
  headerRow:  { flexDirection:"row", alignItems:"flex-start", gap:12, marginBottom:10 },
  iconWrap:   { width:40, height:40, borderRadius:10, backgroundColor:"#EEF2EE", borderWidth:1, borderColor:"#D4DDD4", alignItems:"center", justifyContent:"center", flexShrink:0 },
  headerText: { flex:1, flexDirection:"row", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:6 },
  name:       { fontFamily:SERIF, fontSize:16, color:TEXT, flex:1 },
  tagPill:    { backgroundColor:"rgba(184,146,42,0.12)", borderRadius:50, paddingHorizontal:8, paddingVertical:3, borderWidth:1, borderColor:"rgba(184,146,42,0.30)" },
  tagTxt:     { fontSize:10, color:GOLD, fontWeight:"700", letterSpacing:0.5 },
  desc:       { fontSize:13, color:MUTED, lineHeight:20, marginBottom:14 },
  shopBtn:    { flexDirection:"row", alignItems:"center", gap:7, backgroundColor:SAGE, borderRadius:10, paddingVertical:11, paddingHorizontal:16, alignSelf:"flex-start" },
  shopTxt:    { fontSize:13, color:"#fff", fontWeight:"600" },
});

// ── Featured banner ───────────────────────────────────────────────────────────
function FeaturedBanner({ onShop }) {
  return (
    <TouchableOpacity style={fb.card} onPress={onShop} activeOpacity={0.88}>
      <View style={fb.left}>
        <Text style={fb.eyebrow}>ESSENTIALS KIT</Text>
        <Text style={fb.title}>Everything you need for Hajj & Umrah</Text>
        <Text style={fb.sub}>From ihram to sandals — curated for pilgrims</Text>
      </View>
      <View style={fb.iconWrap}>
        <ShoppingBag size={36} color={GOLD_L} weight="thin"/>
      </View>
    </TouchableOpacity>
  );
}

const fb = StyleSheet.create({
  card:    { backgroundColor:SAGE, borderRadius:radius.lg, padding:spacing(2.5), flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:spacing(2) },
  left:    { flex:1, gap:4 },
  eyebrow: { fontSize:10, color:"rgba(200,169,106,0.80)", fontWeight:"700", letterSpacing:1.5 },
  title:   { fontFamily:SERIF, fontSize:18, color:"#fff", lineHeight:24 },
  sub:     { fontSize:13, color:"rgba(255,255,255,0.65)" },
  iconWrap:{ width:56, height:56, borderRadius:28, backgroundColor:"rgba(255,255,255,0.10)", alignItems:"center", justifyContent:"center" },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function ShopScreen({ navigation, route }) {
  const initialCat = route?.params?.category ?? "all";
  const [category, setCategory] = useState(initialCat);

  const products = category === "all"
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === category);

  const featured = PRODUCTS.filter(p => p.featured);

  const handleFeaturedShop = () => {
    Linking.openURL(getAffiliateUrl("hajj umrah essentials kit pilgrimage"));
  };

  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <ArrowLeft size={20} color={TEXT} weight="regular"/>
        </TouchableOpacity>
        <View style={s.hCenter}>
          <Text style={s.hTitle}>Shop Essentials</Text>
          <Text style={s.hSub}>Curated for Hajj & Umrah pilgrims</Text>
        </View>
        <View style={{ width:36 }}/>
      </View>

      {/* Category pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.cats}
      >
        {CATEGORIES.map(cat => {
          const CatIcon = CAT_ICONS[cat.key];
          const active  = category === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[s.catPill, active && s.catPillOn]}
              onPress={() => setCategory(cat.key)}
              activeOpacity={0.8}
            >
              <CatIcon size={13} color={active ? "#fff" : MUTED} weight="thin"/>
              <Text style={[s.catTxt, active && s.catTxtOn]}>{cat.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.list}>

        {/* Featured banner — only on All */}
        {category === "all" && (
          <FeaturedBanner onShop={handleFeaturedShop}/>
        )}

        {/* Count */}
        <Text style={s.count}>{products.length} item{products.length !== 1 ? "s" : ""}</Text>

        {/* Products */}
        {products.map(item => (
          <ProductCard key={item.id} item={item}/>
        ))}

        {/* Affiliate disclosure */}
        <View style={s.disclosure}>
          <Scales size={14} color={MUTED} weight="thin"/>
          <Text style={s.disclosureTxt}>
            Safar earns a small commission on purchases made through these links at no extra cost to you. This helps keep the app free.
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

  cats:       { paddingHorizontal:spacing(2), paddingVertical:spacing(1.25), gap:8, flexDirection:"row" },
  catPill:    { flexDirection:"row", alignItems:"center", gap:6, paddingHorizontal:14, paddingVertical:8, borderRadius:50, borderWidth:1, borderColor:BORDER, backgroundColor:CARD },
  catPillOn:  { backgroundColor:SAGE, borderColor:SAGE },
  catTxt:     { fontSize:13, color:MUTED, fontWeight:"500" },
  catTxtOn:   { color:"#fff" },

  list:  { paddingHorizontal:spacing(2), paddingBottom:spacing(4) },
  count: { fontSize:12, color:MUTED, marginBottom:spacing(1.5) },

  disclosure:    { flexDirection:"row", alignItems:"flex-start", gap:8, borderTopWidth:1, borderTopColor:BORDER, paddingTop:spacing(1.5), marginTop:spacing(1) },
  disclosureTxt: { fontSize:11, color:MUTED, lineHeight:17, flex:1, fontStyle:"italic" },
});
