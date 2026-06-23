/**
 * ShopScreen.jsx — Safar
 * Redesigned to match reference: hero, trust badges, essentials banner,
 * 4-column category grid, guide CTA footer.
 */
import React, { useState } from "react";
import {
  SafeAreaView, View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Linking, Dimensions, Image,
} from "react-native";
import {
  ArrowLeft, ShoppingBag, ArrowRight, CheckCircle,
  Truck, Lock, Headphones, BookOpen,
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

// ── Categories ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { key:"ihram",        label:"Ihram",               count:6,  query:"ihram clothing hajj umrah",              image:require("../assets/ihram.jpg")          },
  { key:"books",        label:"Books & Du\u02bf\u0101s", count:5, query:"dua book hajj umrah fortress muslim",  image:require("../assets/journey3.png")       },
  { key:"health",       label:"Health & Care",        count:4,  query:"hajj umrah health kit first aid",       image:require("../assets/what_to_expect.jpg") },
  { key:"accessories",  label:"Travel Accessories",   count:4,  query:"hajj umrah travel accessories",         image:require("../assets/kaaba_mixed.png")    },
  { key:"bags",         label:"Bags & Storage",       count:3,  query:"hajj umrah bag storage packing",        image:require("../assets/journey3.png")       },
  { key:"footwear",     label:"Footwear",              count:2,  query:"ihram sandals hajj open toe",           image:require("../assets/sayi.jpg")           },
  { key:"electronics",  label:"Electronics",          count:3,  query:"travel electronics hajj umrah portable", image:require("../assets/what_to_expect.jpg")},
  { key:"clothing",     label:"Clothing & Covers",    count:3,  query:"abaya modest clothing hajj umrah",      image:require("../assets/ihram.jpg")          },
  { key:"personalcare", label:"Personal Care",        count:4,  query:"travel toiletries halal personal care", image:require("../assets/focus_mode.jpg")     },
  { key:"umbrellas",    label:"Umbrellas & Rain",      count:2,  query:"travel umbrella sun protection compact", image:require("../assets/arafah.jpg")        },
  { key:"kids",         label:"Kids & Family",         count:3,  query:"kids family hajj umrah travel essentials", image:require("../assets/journey3.png")   },
  { key:"gifts",        label:"Gifts & Souvenirs",    count:2,  query:"hajj umrah gifts souvenirs islamic",    image:require("../assets/kaaba_mixed.png")    },
];

const TRUST_BADGES = [
  { Icon:CheckCircle, label:"Trusted &\nRecommended" },
  { Icon:Truck,       label:"Fast &\nReliable" },
  { Icon:Lock,        label:"Secure\nPayments" },
  { Icon:Headphones,  label:"Support for\nPilgrims" },
];

// ── Category card ─────────────────────────────────────────────────────────────
function CategoryCard({ cat, onPress, w }) {
  return (
    <TouchableOpacity style={[cc.card, { width:w }]} onPress={onPress} activeOpacity={0.88}>
      <Image source={cat.image} style={cc.img} resizeMode="cover"/>
      <View style={cc.overlay}/>
      <View style={cc.bottom}>
        <View style={cc.textWrap}>
          <Text style={cc.name}>{cat.label}</Text>
          <Text style={cc.count}>{cat.count} items</Text>
        </View>
        <View style={cc.arrowCircle}>
          <ArrowRight size={14} color="#fff" weight="bold"/>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const cc = StyleSheet.create({
  card:       { borderRadius:14, overflow:"hidden", marginBottom:12, backgroundColor:CARD },
  img:        { width:"100%", aspectRatio:1, borderRadius:14 },
  overlay:    { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(0,0,0,0.18)", borderRadius:14 },
  bottom:     { position:"absolute", bottom:0, left:0, right:0, padding:10, flexDirection:"row", alignItems:"flex-end", justifyContent:"space-between" },
  textWrap:   { flex:1 },
  name:       { fontFamily:SERIF, fontSize:13, color:"#fff", fontWeight:"600", lineHeight:17 },
  count:      { fontSize:11, color:"rgba(255,255,255,0.75)", marginTop:1 },
  arrowCircle:{ width:28, height:28, borderRadius:14, backgroundColor:SAGE, alignItems:"center", justifyContent:"center" },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function ShopScreen({ navigation, route }) {
  const handleCat = (cat) => Linking.openURL(getAffiliateUrl(cat.query));
  const handleKit = () => Linking.openURL(getAffiliateUrl("hajj umrah essentials kit pilgrimage"));
  const handleGuide = () => navigation?.navigate?.("Guidance");

  const colW = (SW - spacing(4) - 12) / 2;  // two-column

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} bounces>

        {/* ── Hero ── */}
        <View style={s.hero}>
          <Image
            source={require("../assets/kaaba_mixed.png")}
            style={s.heroImg}
            resizeMode="cover"
          />
          <View style={s.heroFade}/>
          {/* Back */}
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <ArrowLeft size={20} color={TEXT} weight="regular"/>
          </TouchableOpacity>
          {/* Title */}
          <View style={s.heroText}>
            <Text style={s.heroTitle}>Shop Essentials</Text>
            <Text style={s.heroSub}>Curated for Hajj & Umrah pilgrims{"\n"}Everything you need, thoughtfully selected.</Text>
          </View>
        </View>

        {/* ── Trust badges ── */}
        <View style={s.trustRow}>
          {TRUST_BADGES.map(({ Icon, label }, i) => (
            <View key={i} style={s.trustItem}>
              <Icon size={20} color={SAGE} weight="thin"/>
              <Text style={s.trustTxt}>{label}</Text>
            </View>
          ))}
        </View>

        {/* ── Featured essentials banner ── */}
        <TouchableOpacity style={s.banner} onPress={handleKit} activeOpacity={0.88}>
          <View style={s.bannerLeft}>
            <Text style={s.bannerEye}>ESSENTIALS KIT</Text>
            <Text style={s.bannerTitle}>{"Everything you need\nfor Hajj & Umrah"}</Text>
            <Text style={s.bannerSub}>{"From ihram to sandals \u2014 curated for pilgrims"}</Text>
            <View style={s.bannerBtn}>
              <Text style={s.bannerBtnTxt}>Explore Essentials Kit</Text>
              <ArrowRight size={14} color={SAGE} weight="bold"/>
            </View>
          </View>
          <Image
            source={require("../assets/ihram.jpg")}
            style={s.bannerImg}
            resizeMode="cover"
          />
        </TouchableOpacity>

        {/* ── Category grid ── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Browse by category</Text>
          <Text style={s.sectionCount}>{CATEGORIES.length} categories</Text>
        </View>

        <View style={s.grid}>
          {/* Two-column layout */}
          <View style={s.gridCol}>
            {CATEGORIES.filter((_,i) => i%2===0).map(cat => (
              <CategoryCard key={cat.key} cat={cat} onPress={() => handleCat(cat)} w={colW}/>
            ))}
          </View>
          <View style={s.gridCol}>
            {CATEGORIES.filter((_,i) => i%2===1).map(cat => (
              <CategoryCard key={cat.key} cat={cat} onPress={() => handleCat(cat)} w={colW}/>
            ))}
          </View>
        </View>

        {/* ── Guide CTA ── */}
        <TouchableOpacity style={s.guideCta} onPress={handleGuide} activeOpacity={0.88}>
          <View style={s.guideIcon}>
            <BookOpen size={22} color="#fff" weight="thin"/>
          </View>
          <View style={s.guideText}>
            <Text style={s.guideTitle}>Not sure what you need?</Text>
            <Text style={s.guideSub}>Check out our Essentials Guide for first-time pilgrims.</Text>
          </View>
          <TouchableOpacity style={s.guideLink} onPress={handleGuide} activeOpacity={0.8}>
            <Text style={s.guideLinkTxt}>View Guide</Text>
            <ArrowRight size={13} color={SAGE} weight="bold"/>
          </TouchableOpacity>
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

  // Hero
  hero:     { height:280, position:"relative", marginBottom:0 },
  heroImg:  { ...StyleSheet.absoluteFillObject, width:"100%", height:"100%" },
  heroFade: { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(245,239,228,0.55)" },
  backBtn:  { position:"absolute", top:16, left:spacing(2), width:38, height:38, borderRadius:19, backgroundColor:"rgba(253,250,244,0.90)", borderWidth:1, borderColor:BORDER, alignItems:"center", justifyContent:"center" },
  heroText: { position:"absolute", bottom:24, left:spacing(2), right:SW*0.35 },
  heroTitle:{ fontFamily:SERIF, fontSize:36, color:TEXT, lineHeight:42, fontWeight:"400" },
  heroSub:  { fontSize:13, color:MUTED, lineHeight:19, marginTop:8 },

  // Trust badges
  trustRow: { flexDirection:"row", backgroundColor:CARD, marginHorizontal:spacing(2), marginTop:spacing(1.5), borderRadius:radius.lg, borderWidth:1, borderColor:BORDER, padding:spacing(1.5) },
  trustItem:{ flex:1, alignItems:"center", gap:5 },
  trustTxt: { fontSize:10, color:MUTED, textAlign:"center", lineHeight:14, fontWeight:"500" },

  // Banner
  banner:     { marginHorizontal:spacing(2), marginTop:spacing(2), borderRadius:16, backgroundColor:SAGE, overflow:"hidden", flexDirection:"row", alignItems:"center", minHeight:180 },
  bannerLeft: { flex:1, padding:spacing(2.5), justifyContent:"center" },
  bannerEye:  { fontSize:10, color:GOLD_L, fontWeight:"800", letterSpacing:1.5, marginBottom:8 },
  bannerTitle:{ fontFamily:SERIF, fontSize:22, color:"#fff", lineHeight:29, marginBottom:8 },
  bannerSub:  { fontSize:13, color:"rgba(255,255,255,0.70)", lineHeight:19, marginBottom:16 },
  bannerBtn:  { flexDirection:"row", alignItems:"center", gap:8, backgroundColor:"#fff", borderRadius:50, paddingHorizontal:16, paddingVertical:10, alignSelf:"flex-start" },
  bannerBtnTxt:{ fontSize:13, color:SAGE, fontWeight:"700" },
  bannerImg:  { width:SW*0.38, height:"100%", opacity:0.80 },

  // Section header
  sectionHeader:{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:spacing(2), marginTop:spacing(2.5), marginBottom:spacing(1.5) },
  sectionTitle: { fontFamily:SERIF, fontSize:20, color:TEXT },
  sectionCount: { fontSize:13, color:MUTED },

  // Grid
  grid:    { flexDirection:"row", paddingHorizontal:spacing(2), gap:12 },
  gridCol: { flex:1 },

  // Guide CTA
  guideCta:  { flexDirection:"row", alignItems:"center", gap:14, marginHorizontal:spacing(2), marginTop:spacing(1), backgroundColor:CARD, borderRadius:radius.lg, borderWidth:1, borderColor:BORDER, padding:spacing(2) },
  guideIcon: { width:44, height:44, borderRadius:22, backgroundColor:SAGE, alignItems:"center", justifyContent:"center", flexShrink:0 },
  guideText: { flex:1 },
  guideTitle:{ fontFamily:SERIF, fontSize:15, color:TEXT },
  guideSub:  { fontSize:12, color:MUTED, lineHeight:17, marginTop:2 },
  guideLink: { flexDirection:"row", alignItems:"center", gap:4, flexShrink:0 },
  guideLinkTxt:{ fontSize:13, color:SAGE, fontWeight:"700" },

  disclosure:{ fontSize:11, color:MUTED, textAlign:"center", marginTop:spacing(2), marginHorizontal:spacing(2), fontStyle:"italic" },
});
