/**
 * ShopScreen.jsx — Safar
 * - Half-height hero: arrival.jpg, scrim, text overlay
 * - Search field
 * - Category pills: icon + label, horizontally scrollable
 * - Banner card: text only, two-line headline, no image
 * - 4-column product tile grid with Phosphor icons
 * - Essentials guide slim card below grid
 */
import React, { useState } from "react";
import {
  SafeAreaView, View, Text, TouchableOpacity, ScrollView,
  TextInput, StyleSheet, Linking, Dimensions, Image,
} from "react-native";
import {
  ArrowLeft, ArrowRight, ShoppingBag, MagnifyingGlass,
  TShirt, BookOpen, FirstAid, Backpack, Sneaker,
  Devices, ShieldCheck, SunHorizon, Baby, Gift,
  HandbagSimple, Umbrella, Sparkle, Star, Syringe,
  Bandaids, SuitcaseRolling, Compass,
} from "phosphor-react-native";
import { spacing, radius } from "../theme";
import { getAffiliateUrl } from "../utils/affiliateLinks";

const { width: SW } = Dimensions.get("window");
const BG     = "#F5EFE4";
const CARD   = "#FDFAF4";
const SAGE   = "#2D4A34";
const SAGE_L = "#4A5C48";
const GOLD   = "#B8922A";
const GOLD_L = "#C8A96A";
const BORDER = "#E0D8CC";
const TEXT   = "#1C1A14";
const MUTED  = "#7A7060";
const SERIF  = "SourceSerif4-Regular";

// ── Category pills ────────────────────────────────────────────────────────────
const CATS = [
  { key:"all",         label:"All",              Icon:ShoppingBag  },
  { key:"ihram",       label:"Ihram",            Icon:TShirt       },
  { key:"books",       label:"Books & Du\u02bf\u0101s", Icon:BookOpen },
  { key:"health",      label:"Health & Care",    Icon:FirstAid     },
  { key:"bags",        label:"Bags",             Icon:Backpack     },
  { key:"footwear",    label:"Footwear",         Icon:Sneaker      },
  { key:"electronics", label:"Electronics",      Icon:Devices      },
  { key:"clothing",    label:"Clothing",         Icon:HandbagSimple},
  { key:"personalcare",label:"Personal Care",    Icon:Bandaids     },
  { key:"umbrellas",   label:"Umbrellas",        Icon:Umbrella     },
  { key:"kids",        label:"Kids & Family",    Icon:Baby         },
  { key:"gifts",       label:"Gifts",            Icon:Gift         },
];

// ── Product tiles ─────────────────────────────────────────────────────────────
const PRODUCTS = [
  // Ihram
  { id:"ihram-men",    cat:"ihram",       label:"Ihram Set",         sub:"Men's seamless",    Icon:TShirt,        query:"ihram clothing men hajj"              },
  { id:"ihram-belt",   cat:"ihram",       label:"Ihram Belt",        sub:"Secure fit",        Icon:TShirt,        query:"ihram belt money belt hajj"           },
  { id:"abaya",        cat:"ihram",       label:"Abaya",             sub:"Women's modest",    Icon:TShirt,        query:"abaya hajj umrah women"               },
  // Books
  { id:"fortress",     cat:"books",       label:"Fortress of the Muslim", sub:"Du\u02bf\u0101 book", Icon:BookOpen, query:"fortress muslim hisnul dua book"  },
  { id:"hajj-guide",   cat:"books",       label:"Hajj Guide",        sub:"Step by step",      Icon:BookOpen,      query:"hajj guide book pilgrimage"           },
  { id:"quran",        cat:"books",       label:"Travel Quran",      sub:"Pocket size",       Icon:BookOpen,      query:"pocket quran travel compact"          },
  { id:"tasbeeh",      cat:"books",       label:"Tasbeeh",           sub:"Dhikr counter",     Icon:Sparkle,       query:"tasbeeh misbaha dhikr counter"        },
  // Health
  { id:"sandals",      cat:"footwear",    label:"Ihram Sandals",     sub:"Open-toed",         Icon:Sneaker,       query:"ihram sandals open toe hajj"          },
  { id:"blister",      cat:"health",      label:"Blister Kit",       sub:"Prevention",        Icon:Bandaids,      query:"blister prevention walking kit"       },
  { id:"sunscreen",    cat:"health",      label:"SPF 50+",           sub:"Sun protection",    Icon:SunHorizon,    query:"sunscreen spf 50 travel halal"        },
  { id:"electrolytes", cat:"health",      label:"Electrolytes",      sub:"Hydration sachets", Icon:FirstAid,      query:"electrolyte sachets travel hydration" },
  { id:"first-aid",    cat:"health",      label:"First Aid Kit",     sub:"Travel compact",    Icon:Syringe,       query:"travel first aid kit compact"         },
  // Bags
  { id:"waist-pouch",  cat:"bags",        label:"Waist Pouch",       sub:"Passport & cash",   Icon:Backpack,      query:"hajj waist pouch neck wallet"         },
  { id:"daypack",      cat:"bags",        label:"Daypack",           sub:"Lightweight",       Icon:Backpack,      query:"lightweight foldable daypack travel"  },
  { id:"packing-cubes",cat:"bags",        label:"Packing Cubes",     sub:"Organisation",      Icon:SuitcaseRolling,query:"packing cubes travel luggage"        },
  // Accessories
  { id:"zamzam",       cat:"accessories", label:"Zamzam Bottle",     sub:"Approved size",     Icon:ShieldCheck,   query:"zamzam water bottle airline approved" },
  { id:"prayer-mat",   cat:"accessories", label:"Prayer Mat",        sub:"Travel foldable",   Icon:Compass,       query:"travel prayer mat compact foldable"   },
  { id:"umbrella",     cat:"umbrellas",   label:"Sun Umbrella",      sub:"UV protection",     Icon:Umbrella,      query:"sun umbrella UV compact travel"       },
  // Electronics
  { id:"charger",      cat:"electronics", label:"Power Bank",        sub:"Portable charger",  Icon:Devices,       query:"portable power bank travel compact"   },
  { id:"adapter",      cat:"electronics", label:"Travel Adapter",    sub:"Universal plug",    Icon:Devices,       query:"universal travel adapter Saudi Arabia" },
  // Kids
  { id:"kids-mat",     cat:"kids",        label:"Kids Prayer Mat",   sub:"Child size",        Icon:Baby,          query:"kids prayer mat child size"           },
  { id:"kids-ihram",   cat:"kids",        label:"Kids Ihram",        sub:"Boys' set",         Icon:Baby,          query:"kids ihram boys hajj umrah"           },
  // Gifts
  { id:"gift-set",     cat:"gifts",       label:"Gift Set",          sub:"Islamic gifts",     Icon:Gift,          query:"islamic gift set hajj umrah souvenir" },
  { id:"tasbih-gift",  cat:"gifts",       label:"Tasbih Gift",       sub:"Boxed misbaha",     Icon:Star,          query:"misbaha tasbih gift boxed islamic"    },
];

// ── Product tile — 4 per row ──────────────────────────────────────────────────
function ProductTile({ item, tileW, onPress }) {
  return (
    <TouchableOpacity style={[pt.tile, { width:tileW }]} onPress={onPress} activeOpacity={0.85}>
      <View style={pt.iconBox}>
        <item.Icon size={28} color={GOLD} weight="thin"/>
      </View>
      <Text style={pt.label} numberOfLines={2}>{item.label}</Text>
      <Text style={pt.sub} numberOfLines={1}>{item.sub}</Text>
    </TouchableOpacity>
  );
}

const pt = StyleSheet.create({
  tile:    {
    backgroundColor:CARD,
    borderRadius:14,
    borderWidth:1,
    borderColor:BORDER,
    alignItems:"center",
    paddingTop:14,
    paddingBottom:12,
    paddingHorizontal:6,
    gap:6,
  },
  iconBox: {
    width:52, height:52, borderRadius:14,
    backgroundColor:"rgba(184,146,42,0.15)",
    borderWidth:1, borderColor:"rgba(184,146,42,0.35)",
    alignItems:"center", justifyContent:"center",
    marginBottom:2,
  },
  label:   { fontSize:13, color:TEXT, fontWeight:"600", textAlign:"center", lineHeight:17 },
  sub:     { fontSize:11, color:MUTED, textAlign:"center" },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function ShopScreen({ navigation }) {
  const [activeCat, setActiveCat]   = useState("all");
  const [searchTxt, setSearchTxt]   = useState("");

  const visibleProducts = PRODUCTS.filter(p => {
    const catMatch    = activeCat === "all" || p.cat === activeCat;
    const searchMatch = !searchTxt.trim() ||
      p.label.toLowerCase().includes(searchTxt.toLowerCase()) ||
      p.sub.toLowerCase().includes(searchTxt.toLowerCase());
    return catMatch && searchMatch;
  });

  // 3-column tile width
  const GAP   = 10;
  const HPAD  = spacing(2);
  const tileW = (SW - HPAD * 2 - GAP * 2) / 3;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} bounces keyboardShouldPersistTaps="handled">

        {/* ── Hero — half height, arrival.jpg, scrim ── */}
        <View style={s.hero}>
          <Image source={require("../assets/arrival.jpg")} style={s.heroImg} resizeMode="cover"/>
          {/* Dark scrim — no white gradient */}
          <View style={s.heroScrim}/>
          {/* Back button */}
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <ArrowLeft size={20} color="#fff" weight="regular"/>
          </TouchableOpacity>
          {/* Text */}
          <View style={s.heroText}>
            <Text style={s.heroTitle}>Shop Essentials</Text>
            <Text style={s.heroSub}>Curated for Hajj & Umrah pilgrims</Text>
          </View>
        </View>

        {/* ── Search ── */}
        <View style={s.searchWrap}>
          <MagnifyingGlass size={18} color={MUTED} weight="regular" style={s.searchIcon}/>
          <TextInput
            style={s.searchInput}
            placeholder="Search essentials…"
            placeholderTextColor={MUTED}
            value={searchTxt}
            onChangeText={setSearchTxt}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>

        {/* ── Category pills ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.pillRow}
        >
          {CATS.map(({ key, label, Icon }) => {
            const on = activeCat === key;
            return (
              <TouchableOpacity
                key={key}
                style={[s.pill, on && s.pillOn]}
                onPress={() => setActiveCat(key)}
                activeOpacity={0.8}
              >
                <Icon size={16} color={on ? "#fff" : SAGE_L} weight={on ? "fill" : "regular"}/>
                <Text style={[s.pillTxt, on && s.pillTxtOn]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Essentials banner — text only, no image ── */}
        <TouchableOpacity
          style={s.banner}
          onPress={() => Linking.openURL(getAffiliateUrl("hajj umrah essentials kit pilgrimage"))}
          activeOpacity={0.88}
        >
          <View style={s.bannerInner}>
            <Text style={s.bannerEye}>ESSENTIALS KIT</Text>
            <Text style={s.bannerTitle}>{"Everything you need\nfor Hajj & Umrah"}</Text>
            <Text style={s.bannerSub}>From ihram to sandals — curated for pilgrims</Text>
            <View style={s.bannerBtn}>
              <Text style={s.bannerBtnTxt}>Explore Essentials Kit</Text>
              <ArrowRight size={13} color={SAGE} weight="bold"/>
            </View>
          </View>
        </TouchableOpacity>

        {/* ── Product grid — 4 columns ── */}
        <View style={s.gridHeader}>
          <Text style={s.gridTitle}>
            {activeCat === "all"
              ? "All Essentials"
              : CATS.find(c=>c.key===activeCat)?.label ?? "Products"}
          </Text>
          <Text style={s.gridCount}>{visibleProducts.length} items</Text>
        </View>

        {visibleProducts.length > 0 ? (
          <View style={s.grid}>
            {Array.from({ length: Math.ceil(visibleProducts.length / 3) }).map((_, rowIdx) => (
              <View key={rowIdx} style={s.tileRow}>
                {visibleProducts.slice(rowIdx*3, rowIdx*3+3).map(item => (
                  <ProductTile
                    key={item.id}
                    item={item}
                    tileW={tileW}
                    onPress={() => Linking.openURL(getAffiliateUrl(item.query))}
                  />
                ))}
                {visibleProducts.slice(rowIdx*3, rowIdx*3+3).length < 3 &&
                  Array.from({ length: 3 - visibleProducts.slice(rowIdx*3, rowIdx*3+3).length }).map((_,i) => (
                    <View key={`empty-${i}`} style={{ width:tileW }}/>
                  ))
                }
              </View>
            ))}
          </View>
        ) : (
          <View style={s.empty}>
            <Text style={s.emptyTxt}>No items found.</Text>
            <TouchableOpacity onPress={() => { setActiveCat("all"); setSearchTxt(""); }}>
              <Text style={s.emptyLink}>Clear filters</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Essentials guide slim card ── */}
        <TouchableOpacity
          style={s.guideCard}
          onPress={() => navigation?.navigate?.("WhatToExpect")}
          activeOpacity={0.88}
        >
          <View style={s.guideIconWrap}>
            <Compass size={22} color="#fff" weight="thin"/>
          </View>
          <View style={s.guideTextWrap}>
            <Text style={s.guideTitle}>New to Hajj or Umrah?</Text>
            <Text style={s.guideSub}>Read our First-Timer's Essentials Guide</Text>
          </View>
          <View style={s.guideArrow}>
            <ArrowRight size={15} color={SAGE} weight="bold"/>
          </View>
        </TouchableOpacity>

        {/* Affiliate disclosure */}
        <Text style={s.disclosure}>
          Safar earns a small commission on purchases at no extra cost to you.
        </Text>

        <View style={{ height:spacing(4) }}/>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex:1, backgroundColor:BG },

  // Hero — half height (~140px), arrival.jpg, dark scrim, white text
  hero:      { height:140, position:"relative" },
  heroImg:   { ...StyleSheet.absoluteFillObject, width:"100%", height:"100%" },
  heroScrim: { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(8,20,12,0.52)" },
  backBtn:   { position:"absolute", top:14, left:spacing(2), width:36, height:36, borderRadius:18, backgroundColor:"rgba(0,0,0,0.30)", alignItems:"center", justifyContent:"center" },
  heroText:  { position:"absolute", bottom:18, left:spacing(2) },
  heroTitle: { fontFamily:SERIF, fontSize:26, color:"#fff", fontWeight:"400" },
  heroSub:   { fontSize:13, color:"rgba(255,255,255,0.78)", marginTop:3 },

  // Search
  searchWrap: {
    flexDirection:"row", alignItems:"center",
    backgroundColor:CARD, borderRadius:radius.lg,
    borderWidth:1, borderColor:BORDER,
    marginHorizontal:spacing(2), marginTop:spacing(1.5),
    paddingHorizontal:14, paddingVertical:11, gap:10,
  },
  searchIcon:  {},
  searchInput: { flex:1, fontSize:15, color:TEXT, padding:0 },

  // Category pills
  pillRow: { paddingHorizontal:spacing(2), paddingVertical:spacing(1.25), gap:8, flexDirection:"row" },
  pill:    { flexDirection:"row", alignItems:"center", gap:7, paddingHorizontal:16, paddingVertical:10, borderRadius:50, borderWidth:1.5, borderColor:BORDER, backgroundColor:CARD },
  pillOn:  { backgroundColor:SAGE, borderColor:SAGE },
  pillTxt: { fontSize:14, color:SAGE_L, fontWeight:"600" },
  pillTxtOn:{ color:"#fff" },

  // Banner — text only
  banner:      { marginHorizontal:spacing(2), marginTop:spacing(0.5), borderRadius:16, backgroundColor:SAGE, overflow:"hidden" },
  bannerInner: { padding:spacing(2.5) },
  bannerEye:   { fontSize:10, color:GOLD_L, fontWeight:"800", letterSpacing:1.5, marginBottom:8 },
  bannerTitle: { fontFamily:SERIF, fontSize:22, color:"#fff", lineHeight:30, marginBottom:8 },
  bannerSub:   { fontSize:13, color:"rgba(255,255,255,0.70)", lineHeight:19, marginBottom:18 },
  bannerBtn:   { flexDirection:"row", alignItems:"center", gap:8, backgroundColor:"#fff", borderRadius:50, paddingHorizontal:18, paddingVertical:11, alignSelf:"flex-start" },
  bannerBtnTxt:{ fontSize:13, color:SAGE, fontWeight:"700" },

  // Grid header
  gridHeader:  { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:spacing(2), marginTop:spacing(2), marginBottom:spacing(1.25) },
  gridTitle:   { fontFamily:SERIF, fontSize:18, color:TEXT },
  gridCount:   { fontSize:13, color:MUTED },

  // Product grid
  grid:        { paddingHorizontal:spacing(2) },
  tileRow:     { flexDirection:"row", gap:10, marginBottom:10 },

  // Empty state
  empty:    { alignItems:"center", paddingVertical:spacing(3), gap:10 },
  emptyTxt: { fontSize:15, color:MUTED },
  emptyLink:{ fontSize:14, color:SAGE, fontWeight:"600" },

  // Guide CTA slim card
  guideCard:    { flexDirection:"row", alignItems:"center", gap:14, marginHorizontal:spacing(2), marginTop:spacing(2), backgroundColor:CARD, borderRadius:radius.lg, borderWidth:1, borderColor:BORDER, padding:spacing(2) },
  guideIconWrap:{ width:42, height:42, borderRadius:21, backgroundColor:SAGE, alignItems:"center", justifyContent:"center", flexShrink:0 },
  guideTextWrap:{ flex:1 },
  guideTitle:   { fontFamily:SERIF, fontSize:15, color:TEXT },
  guideSub:     { fontSize:12, color:MUTED, marginTop:2 },
  guideArrow:   { width:32, height:32, borderRadius:16, backgroundColor:"#EEF2EE", alignItems:"center", justifyContent:"center" },

  disclosure:{ fontSize:11, color:MUTED, textAlign:"center", marginTop:spacing(2), marginHorizontal:spacing(2), fontStyle:"italic" },
});
