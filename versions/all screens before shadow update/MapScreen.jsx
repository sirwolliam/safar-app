import React, { useState } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, Dimensions,
} from "react-native";
import { colors, spacing, radius, typography, shadows } from "../theme";

const SERIF = "SourceSerif4-Regular";
const { width: SW, height: SH } = Dimensions.get("window");
const MAP_H = Math.round(SW * 0.75);

const MAKKAH_SITES = [
  { id:"kaaba",    name:"Al-Ka\u02bfbah",          arabic:"\u0627\u0644\u0643\u064e\u0639\u0628\u064e\u0629",                   subtitle:"The Most Sacred House",       duaCount:12,
    x:0.48, y:0.42, description:"The cubic structure at the centre of Masjid al-\u1e24ar\u0101m, towards which all Muslims face in prayer. Circumambulating it seven times is the act of \u1e62aw\u0101f." },
  { id:"maqam",    name:"Maq\u0101m Ibr\u0101h\u012bm", arabic:"\u0645\u064e\u0642\u064e\u0627\u0645\u064f \u0625\u0628\u0652\u0631\u064e\u0627\u0647\u0650\u064a\u0645", subtitle:"Station of Prophet Ibr\u0101h\u012bm", duaCount:5,
    x:0.56, y:0.32, description:"The stone bearing the footprint of Prophet Ibr\u0101h\u012bm \u02bfalayhi as-sal\u0101m, located near the Ka\u02bfbah. Praying two rak\u02bfahs here after \u1e62aw\u0101f is Sunnah." },
  { id:"zamzam",   name:"Zamzam",                  arabic:"\u0632\u064e\u0645\u0652\u0632\u064e\u0645",                         subtitle:"The Blessed Well",            duaCount:4,
    x:0.60, y:0.52, description:"The ancient well within Masjid al-\u1e24ar\u0101m, flowing since the time of Hagar. Drinking its water is Sunnah and drinking whilst facing the Ka\u02bfbah is recommended." },
  { id:"safa",     name:"\u1e62af\u0101",           arabic:"\u0627\u0644\u0635\u064e\u0651\u0641\u064e\u0627",                   subtitle:"Start of Sa\u02bfy",           duaCount:6,
    x:0.38, y:0.65, description:"The hill where Sa\u02bfy begins. One recites the verse '\u02beInna \u1e63-\u1e63af\u0101 wal-marwata...' and makes du\u02bf\u0101 whilst facing the Ka\u02bfbah." },
  { id:"marwah",   name:"Marwah",                  arabic:"\u0627\u0644\u0645\u064e\u0631\u0652\u0648\u064e\u0629",               subtitle:"End of Sa\u02bfy",             duaCount:4,
    x:0.66, y:0.65, description:"The hill where Sa\u02bfy ends, after seven passes between \u1e62af\u0101 and Marwah. Du\u02bf\u0101 is made here facing the Ka\u02bfbah direction." },
  { id:"hijr",     name:"Hijr Ism\u0101\u02bf\u012bl", arabic:"\u062d\u0650\u062c\u0652\u0631 \u0625\u0633\u0645\u064e\u0627\u0639\u0650\u064a\u0644", subtitle:"The Sacred Enclosure", duaCount:4,
    x:0.44, y:0.34, description:"The semicircular enclosure to the north of the Ka\u02bfbah, considered part of the Ka\u02bfbah itself. Prayer inside it is like praying inside the Ka\u02bfbah." },
];

const MADINAH_SITES = [
  { id:"nabawi",    name:"Al-Masjid an-Nabaw\u012b",         arabic:"\u0627\u0644\u0645\u064e\u0633\u062c\u0650\u062f \u0627\u0644\u0646\u064e\u0651\u0628\u064e\u0648\u0650\u064a",    subtitle:"The Prophet's Mosque",     duaCount:8,
    x:0.46, y:0.48, description:"Built by the Prophet \ufdfa after the Hijrah. A prayer here equals 1,000 prayers elsewhere, except al-Masjid al-\u1e24ar\u0101m." },
  { id:"greendome", name:"The Green Dome",                   arabic:"\u0627\u0644\u0642\u064f\u0628\u064e\u0651\u0629 \u0627\u0644\u062e\u064e\u0636\u0652\u0631\u064e\u0627\u0621",   subtitle:"Tomb of the Prophet \ufdfa",duaCount:6,
    x:0.54, y:0.52, description:"The resting place of the Prophet Muhammad \ufdfa. Sending sal\u0101m upon him here is among the most virtuous acts a visitor can perform." },
  { id:"rawdah",    name:"Ri\u0101\u1e0d al-Jannah",         arabic:"\u0631\u0650\u064a\u064e\u0627\u0636 \u0627\u0644\u062c\u064e\u0646\u064e\u0651\u0629",                           subtitle:"Al-Rawdah al-Shar\u012bfah", duaCount:5,
    x:0.60, y:0.52, description:"The area between the Prophet's \ufdfa grave and his pulpit \u2014 a garden from the gardens of Paradise." },
  { id:"quba",      name:"Masjid Qub\u0101\u02be",           arabic:"\u0645\u064e\u0633\u062c\u0650\u062f \u0642\u064f\u0628\u064e\u0627\u0621",                                       subtitle:"First Mosque in Islam",     duaCount:4,
    x:0.28, y:0.28, description:"The first mosque built in Islam. Two rak\u02bfahs here equals the reward of an \u02bfUmrah." },
  { id:"baqee",     name:"Jannat al-Baq\u012b\u02bf",        arabic:"\u062c\u064e\u0646\u064e\u0651\u0629 \u0627\u0644\u0628\u064e\u0642\u0650\u064a\u0639",                           subtitle:"Baq\u012b\u02bf Cemetery",   duaCount:3,
    x:0.72, y:0.36, description:"The main cemetery of Mad\u012bnah where many Companions and family of the Prophet \ufdfa are buried." },
  { id:"uhud",      name:"Jabal Uhud",                       arabic:"\u062c\u064e\u0628\u064e\u0644 \u0623\u064f\u062d\u064f\u062f",                                                   subtitle:"Mount Uhud",                duaCount:2,
    x:0.72, y:0.14, description:"The site of the Battle of Uhud. The Prophet \ufdfa said: 'Uhud is a mountain that loves us and we love it.'" },
];

function MapImage({ city, sites, selectedId, onSelect }) {
  const imgSource = city === "Makkah"
    ? require("../assets/kaaba_map.png")
    : require("../assets/medina.png");

  return (
    <View style={mi.wrap}>
      <Image source={imgSource} style={mi.img} resizeMode="cover" />
      {/* Pins overlaid on image */}
      {sites.map(site => {
        const sel = site.id === selectedId;
        const left = site.x * SW - 14;
        const top  = site.y * MAP_H - 14;
        return (
          <TouchableOpacity
            key={site.id}
            style={[mi.pin, { left, top }, sel && mi.pinActive]}
            onPress={() => onSelect(site)}
            activeOpacity={0.8}
          >
            <View style={[mi.pinInner, sel && mi.pinInnerActive]} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const mi = StyleSheet.create({
  wrap:          { width:"100%", height:MAP_H, position:"relative" },
  img:           { width:"100%", height:MAP_H },
  pin:           { position:"absolute", width:28, height:28, borderRadius:14, backgroundColor:"rgba(255,255,255,0.88)", borderWidth:1.5, borderColor:colors.primary, alignItems:"center", justifyContent:"center" },
  pinActive:     { backgroundColor:colors.primary, width:32, height:32, borderRadius:16, marginLeft:-2, marginTop:-2 },
  pinInner:      { width:8, height:8, borderRadius:4, backgroundColor:colors.primary },
  pinInnerActive:{ backgroundColor:colors.card },
});

function SiteCard({ site, onViewDuas }) {
  if (!site) return null;
  return (
    <View style={sc.card}>
      <View style={sc.handle} />
      <Text style={sc.name}>{site.name}</Text>
      <Text style={sc.arabic}>{site.arabic}</Text>
      <Text style={sc.subtitle}>{site.subtitle}</Text>
      {site.description && <Text style={sc.description}>{site.description}</Text>}
      <View style={sc.countRow}>
        <Text style={sc.countLabel}>Du\u02bf\u0101\u02beS at this place</Text>
        <Text style={sc.countValue}>{site.duaCount} Du\u02bf\u0101\u02beS</Text>
      </View>
      <TouchableOpacity style={sc.btn} onPress={() => onViewDuas(site)} activeOpacity={0.88}>
        <Text style={sc.btnText}>View Du\u02bf\u0101\u02beS</Text>
        <Text style={sc.btnArrow}>{"\u2192"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const sc = StyleSheet.create({
  card:       { backgroundColor:colors.card, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, marginHorizontal:spacing(2), marginTop:-spacing(2.5), padding:spacing(2.5), ...shadows.card },
  handle:     { width:32, height:3, borderRadius:2, backgroundColor:colors.border, alignSelf:"center", marginBottom:spacing(2) },
  name:       { fontFamily:SERIF, fontSize:typography.title, fontWeight:"400", color:colors.text, marginBottom:2 },
  arabic:     { fontSize:typography.heading, color:colors.subtext, marginBottom:2 },
  subtitle:   { fontSize:typography.small, color:colors.subtext, fontWeight:"300", marginBottom:spacing(1) },
  description:{ fontSize:typography.small, color:colors.subtext, fontWeight:"300", lineHeight:typography.small*1.65, marginBottom:spacing(1.5), paddingTop:spacing(1), borderTopWidth:1, borderTopColor:colors.border },
  countRow:   { flexDirection:"row", justifyContent:"space-between", alignItems:"center", paddingTop:spacing(1.5), borderTopWidth:1, borderTopColor:colors.border },
  countLabel: { fontSize:typography.small, color:colors.subtext, fontWeight:"300" },
  countValue: { fontSize:typography.small, color:colors.text, fontWeight:"500" },
  btn:        { flexDirection:"row", alignItems:"center", justifyContent:"center", gap:spacing(1), backgroundColor:colors.primary, borderRadius:radius.md, paddingVertical:spacing(1.75), marginTop:spacing(2), ...shadows.button },
  btnText:    { fontFamily:SERIF, fontSize:typography.body, color:colors.card, fontWeight:"500" },
  btnArrow:   { fontSize:typography.body, color:"rgba(255,255,255,0.65)" },
});

function NearbyChips({ sites, selectedId, onSelect }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={chip.row}>
      {sites.map(s => {
        const on = s.id === selectedId;
        return (
          <TouchableOpacity key={s.id} style={[chip.pill, on && chip.pillOn]} onPress={() => onSelect(s)} activeOpacity={0.8}>
            <Text style={[chip.label, on && chip.labelOn]}>{s.name}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const chip = StyleSheet.create({
  row:    { paddingHorizontal:spacing(2), paddingVertical:spacing(1.5), gap:spacing(1) },
  pill:   { paddingHorizontal:spacing(1.75), paddingVertical:spacing(0.875), borderRadius:radius.pill, borderWidth:1, borderColor:colors.border },
  pillOn: { backgroundColor:colors.primary, borderColor:colors.primary },
  label:  { fontSize:typography.small, color:colors.subtext, fontWeight:"300" },
  labelOn:{ color:colors.card, fontWeight:"500" },
});

function SiteList({ sites, selectedId, onSelect }) {
  return (
    <View style={lst.section}>
      <Text style={lst.sectionTitle}>All sacred sites</Text>
      {sites.map((s, i) => {
        const on = s.id === selectedId;
        return (
          <TouchableOpacity key={s.id} style={[lst.row, i===sites.length-1 && lst.rowLast]}
            onPress={() => onSelect(s)} activeOpacity={0.85}>
            <View style={[lst.dot, on && lst.dotOn]} />
            <View style={lst.info}>
              <Text style={[lst.name, on && lst.nameOn]}>{s.name}</Text>
              <Text style={lst.sub}>{s.subtitle}</Text>
            </View>
            <Text style={[lst.count, on && lst.countOn]}>{s.duaCount} duas</Text>
            <Text style={lst.arrow}>{"\u203a"}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const lst = StyleSheet.create({
  section:      { paddingHorizontal:spacing(2), paddingTop:spacing(2.5) },
  sectionTitle: { fontSize:typography.tiny, fontWeight:"600", color:colors.subtext, letterSpacing:1.5, textTransform:"uppercase", marginBottom:spacing(1.5) },
  row:          { flexDirection:"row", alignItems:"center", gap:spacing(1.5), paddingVertical:spacing(2), borderBottomWidth:1, borderBottomColor:colors.border },
  rowLast:      { borderBottomWidth:0 },
  dot:          { width:8, height:8, borderRadius:4, backgroundColor:colors.border, flexShrink:0 },
  dotOn:        { backgroundColor:colors.primary },
  info:         { flex:1 },
  name:         { fontFamily:SERIF, fontSize:typography.body, fontWeight:"400", color:colors.text, marginBottom:2 },
  nameOn:       { color:colors.primary, fontWeight:"500" },
  sub:          { fontSize:typography.small, color:colors.subtext, fontWeight:"300" },
  count:        { fontSize:typography.small, color:colors.subtext, fontWeight:"300" },
  countOn:      { color:colors.primary, fontWeight:"500" },
  arrow:        { fontSize:18, color:colors.border, lineHeight:22 },
});

export default function MapScreen({ navigation }) {
  const [city,     setCity]     = useState("Makkah");
  const [selected, setSelected] = useState(MAKKAH_SITES[0]);

  const sites = city === "Makkah" ? MAKKAH_SITES : MADINAH_SITES;

  const handleCitySwitch = (c) => {
    setCity(c);
    setSelected(c === "Makkah" ? MAKKAH_SITES[0] : MADINAH_SITES[0]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation?.goBack?.()}>
          <Text style={styles.iconBtnTxt}>{"\u2039"}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Sacred Places</Text>
        <View style={styles.iconBtn} />
      </View>

      {/* City toggle */}
      <View style={styles.cityToggle}>
        {["Makkah","Madinah"].map(c => {
          const on = c === city;
          return (
            <TouchableOpacity key={c} style={[styles.cityOpt, on && styles.cityOptOn]}
              onPress={() => handleCitySwitch(c)} activeOpacity={0.8}>
              <Text style={[styles.cityLabel, on && styles.cityLabelOn]}>{c}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Map with pins overlaid */}
        <MapImage city={city} sites={sites} selectedId={selected?.id} onSelect={setSelected} />

        {/* Madinah notice */}
        {city === "Madinah" && (
          <View style={styles.madinahNotice}>
            <Text style={styles.madinahNoticeText}>
              Visiting Mad\u012bnah is not part of the Hajj or Umrah rites, but is a beloved and highly recommended practice.
            </Text>
          </View>
        )}

        {/* Site card — expands inline on the page */}
        <SiteCard
          site={selected}
          onViewDuas={s => navigation?.navigate?.("SiteDuas", { site: s })}
        />

        <NearbyChips sites={sites} selectedId={selected?.id} onSelect={setSelected} />
        <SiteList    sites={sites} selectedId={selected?.id} onSelect={setSelected} />

        <View style={{ height:spacing(5) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex:1, backgroundColor:colors.background },
  header: { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:spacing(2), paddingVertical:spacing(1.5), borderBottomWidth:1, borderBottomColor:colors.border, backgroundColor:colors.background },
  iconBtn:    { width:36, height:36, borderRadius:18, backgroundColor:colors.card, borderWidth:1, borderColor:colors.border, alignItems:"center", justifyContent:"center", ...shadows.card },
  iconBtnTxt: { fontSize:20, color:colors.text, lineHeight:24 },
  title:      { fontFamily:SERIF, fontSize:typography.heading, fontWeight:"500", color:colors.text },

  cityToggle: { flexDirection:"row", backgroundColor:"rgba(200,190,170,0.25)", borderRadius:radius.md, padding:3, borderWidth:1, borderColor:colors.border, marginHorizontal:spacing(2), marginVertical:spacing(1.5) },
  cityOpt:    { flex:1, paddingVertical:spacing(1), borderRadius:radius.sm, alignItems:"center" },
  cityOptOn:  { backgroundColor:colors.primary, shadowColor:colors.primary, shadowOffset:{width:0,height:2}, shadowOpacity:0.25, shadowRadius:6, elevation:4 },
  cityLabel:  { fontSize:typography.body, color:colors.subtext, fontWeight:"300" },
  cityLabelOn:{ color:colors.card, fontWeight:"500" },

  madinahNotice: { backgroundColor:"rgba(47,93,80,0.08)", borderRadius:radius.md, borderWidth:1, borderColor:"rgba(47,93,80,0.15)", padding:spacing(1.5), marginHorizontal:spacing(2), marginTop:spacing(1.5) },
  madinahNoticeText: { fontSize:typography.small, color:colors.primary, fontWeight:"300", lineHeight:typography.small*1.6 },
});
