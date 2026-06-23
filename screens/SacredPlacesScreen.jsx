/**
 * SacredPlacesScreen.jsx — Safar
 * Two cities: Makkah and Madinah
 * Hotspot map + dua count + site detail cards
 */
import React, { useState, useEffect, useMemo } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, Linking, Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, { Rect, Circle, Path, G, Line, Ellipse, Defs, ClipPath, LinearGradient, Stop, Text as SvgText } from "react-native-svg";
import { useAccessibility } from "../AccessibilityContext";

const SERIF = "SourceSerif4-Regular";
const { width: SW } = Dimensions.get("window");
const MAP_H = 350;

// ── Site data ─────────────────────────────────────────────────────────────────

const MAKKAH_SITES = [
  { id: "kaaba",  name: "Al-Kaʿbah",      arabic: "الكَعبَة",              sub: "The Most Sacred House",                      duas: 12, cx: 193, cy: 211 },
  { id: "hijr",   name: "Hijr Ismāʿīl",   arabic: "حِجر إِسماعيل",         sub: "Sanctuary of the Prophet Ismāʿīl ﷺ",         duas: 4,  cx: 190, cy: 188 },
  { id: "maqam",  name: "Maqām Ibrāhīm",  arabic: "مَقَامُ إِبْرَاهِيم",   sub: "Station of Prophet Ibrāhīm",                 duas: 5,  cx: 212, cy: 193 },
  { id: "zamzam", name: "Zamzam",          arabic: "زَمْزَم",               sub: "The Blessed Well",                            duas: 4,  cx: 210, cy: 225 },
  { id: "yemeni", name: "Yemeni Corner",   arabic: "الرُّكن اليَمانِي",     sub: "Second of the two blessed corners",           duas: 3,  cx: 181, cy: 228 },
  { id: "safa",   name: "Ṣafā & Marwah",   arabic: "الصَّفَا وَالْمَرْوَة",  sub: "Place of Saʿy — 7 passes",                   duas: 8,  cx: 176, cy: 290 },
];

const MADINAH_SITES = [
  { id: "nabawi",    name: "Al-Masjid an-Nabawī",    arabic: "المسجد النبوي",        sub: "The Prophet's Mosque",           duas: 8,  cx: 195, cy: 168, official: true , description: "Built by the Prophet ㏗ after the Hijrah in 622 CE. A prayer here equals 1,000 prayers elsewhere, except al-Masjid al-Ḥarām."},
  { id: "rawdah",    name: "Al-Rawdah al-Sharīfah",  arabic: "الرَّوضَة الشَّرِيفَة", sub: "The Noble Garden — between the minbar and the grave of the Prophet ﷺ", duas: 6, cx: 155, cy: 158, official: true , description: "The area between the Prophet’s ㏗ grave and his pulpit — a garden from the gardens of Paradise."},
  { id: "greendome", name: "The Green Dome",          arabic: "القُبَّة الخَضرَاء",    sub: "Above the grave of the Prophet Muhammad ﷺ", duas: 4, cx: 168, cy: 182 , description: "The resting place of the Prophet Muhammad ㏗. Sending salām upon him here is among the most virtuous acts a visitor can perform."},
  { id: "baqi",      name: "Jannat al-Baqīʿ",        arabic: "جَنَّة البَقِيع",       sub: "Historic cemetery — Companions and family of the Prophet ﷺ", duas: 3, cx: 272, cy: 172 , description: "The main cemetery of Madīnah where many Companions and family of the Prophet ㏗ are buried."},
  { id: "quba",      name: "Masjid Qubāʾ",           arabic: "مسجد قُبَاء",          sub: "First mosque built in Islam",    duas: 3,  cx: 145, cy: 248 , description: "The first mosque built in Islam. Two rakʿahs here equals the reward of an ʿUmrah."},
  { id: "suffah",    name: "As-Suffah",               arabic: "الصُّفَّة",             sub: "Platform of the Companions of the Bench", duas: 2, cx: 222, cy: 248 , description: "The raised platform at the rear of the mosque where poor Companions lived and devoted themselves to learning from the Prophet ㏗."},
];

const MADINAH_INFO = {
  rawdah: {
    detail: "The Rawdah (Garden of Paradise) is the area between the minbar and the grave of the Prophet Muhammad ﷺ. The Prophet ﷺ said: 'Between my house and my pulpit is a garden from the gardens of Paradise.' (Ṣaḥīḥ al-Bukhārī · 1196). Entry is managed and may require permits — check with the Masjid authorities.",
    note: "official",
  },
  baqi: {
    detail: "Jannat al-Baqīʿ is the main Islamic cemetery in Madinah, containing the graves of many Companions (Ṣaḥābah), family members of the Prophet ﷺ, and early Muslims. The Prophet ﷺ regularly visited and prayed for those buried here. Visiting hours are limited and visiting etiquette should be followed.",
    note: "guidance",
  },
  nabawi: {
    detail: "The Prophet's Mosque (Masjid al-Nabawī) was originally built by the Prophet ﷺ himself after the Hijrah in 622 CE. Today it is one of the largest mosques in the world. Visiting it is highly recommended — the Prophet ﷺ said: 'A prayer in this mosque of mine is better than a thousand prayers elsewhere except al-Masjid al-Ḥarām.' (Ṣaḥīḥ Muslim · 1394). It is not part of the obligatory Hajj or Umrah rites.",
    note: "guidance",
  },
};

// ── Simple SVG map ─────────────────────────────────────────────────────────────

function MakkahMap({ selected, onSelect }) {
  return (
    <View style={{ width: "100%", height: MAP_H }}>
      {/* Makkah aerial illustration */}
      <Image
        source={require("../assets/kaaba_map.png")}
        style={{ width: "100%", height: MAP_H }}
        resizeMode="cover"
      />
      {/* SVG pin + fade overlay */}
      <Svg
        style={{ position: "absolute", top: 0, left: 0 }}
        width="100%"
        height={MAP_H}
        viewBox="80 60 240 290"
      >

        {/* Pins */}
        {MAKKAH_SITES.map((site) => {
          const sel = site.id === selected?.id;
          return (
            <G key={site.id} onPress={() => onSelect(site)}>
              <Circle cx={site.cx} cy={site.cy} r={24} fill="transparent"/>
              <Circle
                cx={site.cx} cy={site.cy} r={8}
                fill={sel ? "#1E3D30" : "rgba(255,255,255,0.18)"}
                stroke={sel ? "#1E3D30" : "rgba(255,255,255,0.9)"}
                strokeWidth={1.5}
              />
              <Circle
                cx={site.cx} cy={site.cy} r={3}
                fill={sel ? "#fff" : "#1E3D30"}
              />
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

function MacdinahMap({ selected, onSelect }) {
  return (
    <View style={{ width: "100%", height: MAP_H }}>
      {/* Real aerial illustration of Madinah */}
      <Image
        source={require("../assets/medina.png")}
        style={{ width: "140%", height: MAP_H * 1.4, marginLeft: "-20%", marginTop: -MAP_H * 0.15 }}
        resizeMode="cover"
      />
      {/* SVG pin overlay — matches image coordinates */}
      <Svg
        style={{ position: "absolute", top: 0, left: 0 }}
        width="100%"
        height={MAP_H}
        viewBox="80 75 240 210"
      >




        {MADINAH_SITES.map((site) => {
          const sel = site.id === selected?.id;
          return (
            <G key={site.id} onPress={() => onSelect(site)}>
              {/* Tap zone */}
              <Circle cx={site.cx} cy={site.cy} r={24} fill="transparent"/>
              {/* Outer ring — transparent fill */}
              <Circle
                cx={site.cx} cy={site.cy} r={8}
                fill={sel ? "rgba(47,93,80,0.25)" : "rgba(255,255,255,0.15)"}
                stroke={sel ? "#1E3D30" : "#fff"}
                strokeWidth={1.5}
              />
              {/* Solid centre dot */}
              <Circle cx={site.cx} cy={site.cy} r={3}
                fill={sel ? "#1E3D30" : "#fff"}
              />
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

// ── Site info card ─────────────────────────────────────────────────────────────


// ── Location chips ────────────────────────────────────────────────────────────
function LocationChips({ sites, selectedId, onSelect, visited }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}
      contentContainerStyle={lc.row}>
      {sites.map(s => {
        const on = s.id === selectedId;
        return (
          <TouchableOpacity key={s.id}
            style={on ? [lc.chip, lc.chipOn] : lc.chip}
            onPress={() => onSelect(s)} activeOpacity={0.8}>
            <Text style={on ? [lc.label, lc.labelOn] : lc.label}>{s.name}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const lc = StyleSheet.create({
  row:    { paddingHorizontal:20, paddingVertical:10, gap:8 },
  chip:   { paddingHorizontal:14, paddingVertical:7, borderRadius:999, borderWidth:1, borderColor:"#C8BFB2", backgroundColor:"#F5EDE0" },
  chipOn: { backgroundColor:"#1E3D30", borderColor:"#1E3D30" },
  label:  { fontSize:13, color:"#3A3530" },
  labelOn:{ fontSize:13, color:"#fff", fontWeight:"500" },
});

function SiteCard({ site, onViewDuas, city, isVisited, onToggleVisited }) {
  if (!site) return null;
  const extra = MADINAH_INFO[site.id];
  return (
    <View style={sc.card}>
      <View style={sc.handle}/>
      <View style={sc.nameRow}>
        <Text style={sc.name}>{site.name}</Text>
        {onToggleVisited && (
          <TouchableOpacity
            style={isVisited ? [sc.visitedBtn, sc.visitedBtnOn] : sc.visitedBtn}
            onPress={() => onToggleVisited(site.id)}
            hitSlop={{top:8,bottom:8,left:8,right:8}}
            activeOpacity={0.8}>
            <Text style={isVisited ? [sc.visitedTxt, sc.visitedTxtOn] : sc.visitedTxt}>
              {isVisited ? "✓ Visited" : "Mark visited"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={sc.arabic}>{site.arabic}</Text>
      <Text style={sc.sub}>{site.sub}</Text>
      {extra?.detail && (
        <Text style={sc.detail}>{extra.detail}</Text>
      )}
      <View style={sc.countRow}>
        <Text style={sc.countLabel}>Duʿāʾs at this place</Text>
        <View style={sc.countBadge}>
          <Text style={sc.countValue}>{site.duas} Duʿāʾs</Text>
        </View>
      </View>
      <TouchableOpacity style={sc.btn} onPress={() => onViewDuas?.(site)} activeOpacity={0.88}>
        <Text style={sc.btnText}>View Duʿāʾs  →</Text>
      </TouchableOpacity>
    </View>
  );
}

const sc = StyleSheet.create({
  card: {
    marginHorizontal: 20, marginTop: -20,
    backgroundColor: "#F5EDE0", borderRadius: 16, borderWidth: 1,
    borderColor: "#C8BFB2", padding: 20,
    shadowColor: "#4A2E10", shadowOffset: { width:0, height:3 }, shadowOpacity: 0.14, shadowRadius: 8, elevation: 4,
  },
  handle:     { width: 32, height: 3, borderRadius: 2, backgroundColor: "#C8BFB2", alignSelf: "center", marginBottom: 16 },
  nameRow:      { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:2 },
  name:         { fontFamily: SERIF, fontSize: 22, color: "#100E0A", flex:1 },
  visitedBtn:   { borderRadius:20, borderWidth:1.5, borderColor:"#C8BFB2", paddingHorizontal:10, paddingVertical:5 },
  visitedBtnOn: { backgroundColor:"#1E3D30", borderColor:"#1E3D30" },
  visitedTxt:   { fontSize:12, color:"#5C534A", fontWeight:"600" },
  visitedTxtOn: { color:"#fff" },
  arabic:     { fontSize: 18, color: "#3A3530", marginBottom: 2 },
  sub:        { fontSize: 14, color: "#3A3530", marginBottom: 10 },
  detail:     { fontSize: 12, color: "#3A3530", lineHeight: 18, marginBottom: 10, fontStyle: "italic" },
  countRow:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTopWidth: 1, borderTopColor: "#C8BFB2", marginBottom: 16 },
  countLabel: { fontSize: 14, color: "#3A3530" },
  countBadge: { backgroundColor: "#E2EDE6", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  countValue: { fontSize: 14, color: "#1E3D30", fontWeight: "500" },
  btn:        { backgroundColor: "#1E3D30", borderRadius: 10, paddingVertical: 14, alignItems: "center", shadowColor: "#4A2E10", shadowOffset: { width:0, height:3 }, shadowOpacity: 0.14, shadowRadius: 8, elevation: 4 },
  btnText:    { fontSize: 16, color: "#fff", fontWeight: "500" },
});

// ── Main screen ───────────────────────────────────────────────────────────────


// ── Scholarly footnote ────────────────────────────────────────────────────────
function ScholarlyFootnote({ style }) {
  return (
    <View style={[fn.wrap, style]}>
      <Text style={fn.text}>
        <Text style={fn.bold}>Sources</Text>{" — "}
        {"Duʿāʾs are drawn from Ṣaḥīḥ al-Bukhārī, Ṣaḥīḥ Muslim, Sunan Abī Dāwūd, Sunan al-Tirmidhī, and established scholarly works. Each duʿāʾ is attributed to its primary source. Practice and wording may differ across the four madhabs (Ḥanafī, Mālikī, Shāfiʿī, Ḥanbalī). Consult a qualified scholar for rulings specific to your school of thought."}
      </Text>
    </View>
  );
}

const fn = StyleSheet.create({
  wrap: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: "#EEE4CB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDD0A8",
    padding: 16,
  },
  text: { fontSize: 12, color: "#6B5020", lineHeight: 17 },
  bold: { fontWeight: "600" },
});

const VISITED_KEY = "safar_visited_sites_v1";

export default function SacredPlacesScreen({ navigation }) {
  const { colors } = useAccessibility();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [city,     setCity]     = useState("Makkah");

  useEffect(() => {
    AsyncStorage.getItem(VISITED_KEY).then(v => { if (v) setVisited(JSON.parse(v)); }).catch(() => {});
  }, []);

  const toggleVisited = (siteId) => {
    setVisited(prev => {
      const updated = { ...prev, [siteId]: !prev[siteId] };
      AsyncStorage.setItem(VISITED_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };
  const [visited,    setVisited]    = React.useState({});
  const [selected, setSelected] = useState(null);

  const sites = city === "Makkah" ? MAKKAH_SITES : MADINAH_SITES;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 24 }} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Sacred Places</Text>
        <TouchableOpacity>
          <Text style={s.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* City toggle */}
      <View style={s.cityToggle}>
        {["Makkah", "Madinah"].map((c) => (
          <TouchableOpacity
            key={c}
            style={city === c ? [s.cityOpt, s.cityOptActive] : s.cityOpt}
            onPress={() => { setCity(c); setSelected(null); }}
            activeOpacity={0.85}
          >
            <Text style={city === c ? [s.cityOptText, s.cityOptTextActive] : s.cityOptText}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Map */}
        <View style={s.mapWrap}>
          {city === "Makkah"
            ? <MakkahMap selected={selected} onSelect={setSelected} />
            : <MacdinahMap selected={selected} onSelect={setSelected} />
          }
        </View>



        {/* Madinah note — below map */}
        {city === "Madinah" && (
          <View style={s.madinahNote}>
            <Text style={s.madinahNoteText}>
              Visiting Madinah is not part of the Hajj or Umrah rites, but is a beloved and highly recommended practice. The sites below are outside Masjid al-Ḥarām.
            </Text>
          </View>
        )}

        {/* Site card */}
        {selected && (
          <SiteCard
            site={selected}
            city={city}
            onViewDuas={(site) => navigation?.navigate?.("SiteDuas", { site, city })}
            isVisited={!!visited[selected?.id]}
            onToggleVisited={toggleVisited}
          />
        )}

        <LocationChips sites={sites} selectedId={selected?.id} onSelect={setSelected} visited={visited} />

        {/* Site list */}
        <View style={s.listSection}>
          <Text style={s.listTitle}>All sites</Text>
          {sites.map((site, i) => (
            <TouchableOpacity
              key={site.id}
              style={i < sites.length - 1 ? [s.listRow, s.listRowBorder] : s.listRow}
              onPress={() => setSelected(site)}
              activeOpacity={0.85}
            >
              <View style={selected?.id === site.id ? [s.dot, s.dotActive] : s.dot}/>
              <View style={s.listInfo}>
                <Text style={selected?.id === site.id ? [s.listName, s.listNameActive] : s.listName}>{site.name}</Text>
                <Text style={s.listSub}>{site.sub}</Text>
              </View>
              <Text style={s.listCount}>{site.duas} duas</Text>
              <Text style={selected?.id === site.id ? [s.listArrow, { color:"#1E3D30" }] : s.listArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Madinah external links */}
        {city === "Madinah" && (
          <View style={s.linksCard}>
            <Text style={s.linksTitle}>Official resources</Text>
            {[
              ["Presidency of the Two Holy Mosques", "https://www.gph.gov.sa"],
              ["Rawdah visit booking (Nusuk)", "https://www.nusuk.sa"],
              ["Saudi Ministry of Hajj", "https://www.haj.gov.sa"],
            ].map(([label, url]) => (
              <TouchableOpacity key={url} style={s.linkRow} onPress={() => Linking.openURL(url)}>
                <Text style={s.linkText}>{label}</Text>
                <Text style={s.linkArrow}>↗</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <ScholarlyFootnote />
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (C) => StyleSheet.create({
  safe:          { flex:1, backgroundColor: "#E8DDD0" },
  header:        { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:20, paddingTop:16, paddingBottom:12 },
  back:          { fontSize:22, color: "#100E0A" },
  headerTitle:   { fontFamily:SERIF, fontSize:22, color: "#100E0A" },
  searchIcon:    { fontSize:18 },

  cityToggle:     { flexDirection:"row", marginHorizontal:20, marginBottom:8, backgroundColor: "#F5EDE0", borderRadius:999, padding:3, borderWidth:1, borderColor: "#C8BFB2" },
  cityOpt:        { flex:1, paddingVertical:10, borderRadius:999, alignItems:"center" },
  cityOptActive:  { backgroundColor: "#1E3D30" },
  cityOptText:    { fontSize:16, color: "#5C534A" },
  cityOptTextActive: { color:"#fff", fontWeight:"500" },

  madinahNote:     { marginHorizontal:20, marginTop:12, marginBottom:12, backgroundColor:"#EEE4CB", borderRadius:10, borderWidth:1, borderColor:"#DDD0A8", padding:14 },
  madinahNoteText: { fontSize:12, color:"#6B5020", lineHeight:18 },

  mapWrap:     { overflow:"hidden" },

  listSection: { paddingHorizontal:20, paddingTop:20 },
  listTitle:   { fontSize:10, fontWeight:"800", letterSpacing:2, color: "#5C534A", letterSpacing:1.5, textTransform:"uppercase", marginBottom:12 },
  listRow:     { flexDirection:"row", alignItems:"center", gap:12, paddingVertical:14 },
  listRowBorder: { borderBottomWidth:1, borderBottomColor: "#C8BFB2" },
  dot:         { width:8, height:8, borderRadius:4, backgroundColor: "#C8BFB2", flexShrink:0 },
  dotActive:   { backgroundColor: "#1E3D30" },
  listInfo:    { flex:1 },
  listName:    { fontFamily:SERIF, fontSize:16, color: "#100E0A", marginBottom:2 },
  listNameActive: { color: "#1E3D30" },
  listSub:     { fontSize:12, color: "#5C534A" },
  listCount:   { fontSize:14, color: "#5C534A" },
  listArrow:   { fontSize:20, color: "#C8BFB2" },

  linksCard:  { marginHorizontal:20, marginTop:16, backgroundColor: "#F5EDE0", borderRadius:10, borderWidth:1, borderColor: "#C8BFB2", overflow:"hidden", shadowColor:"#4A2E10", shadowOffset:{width:0,height:3}, shadowOpacity:0.20, shadowRadius:10, elevation:5 },
  linksTitle: { fontFamily:SERIF, fontSize:16, color: "#100E0A", padding:16, borderBottomWidth:1, borderBottomColor: "#C8BFB2" },
  linkRow:    { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:16, paddingVertical:14, borderBottomWidth:1, borderBottomColor: "#C8BFB2" },
  linkText:   { fontSize:14, color: "#1E3D30", flex:1 },
  linkArrow:  { fontSize:14, color: "#1E3D30" },
});
