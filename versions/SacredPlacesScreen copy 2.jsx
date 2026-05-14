/**
 * SacredPlacesScreen.jsx — Safar
 * Two cities: Makkah and Madinah
 * Hotspot map + dua count + site detail cards
 */
import React, { useState, useMemo } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, Linking, Image,
} from "react-native";
import Svg, { Rect, Circle, Path, G, Line, Ellipse, Defs, ClipPath, LinearGradient, Stop, Text as SvgText } from "react-native-svg";
import { colors, spacing, radius, shadows, typography } from "../theme";
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
  { id: "nabawi",    name: "Al-Masjid an-Nabawī",    arabic: "المسجد النبوي",        sub: "The Prophet's Mosque",           duas: 8,  cx: 195, cy: 168, official: true },
  { id: "rawdah",    name: "Al-Rawdah al-Sharīfah",  arabic: "الرَّوضَة الشَّرِيفَة", sub: "The Noble Garden — between the minbar and the grave of the Prophet ﷺ", duas: 6, cx: 155, cy: 158, official: true },
  { id: "greendome", name: "The Green Dome",          arabic: "القُبَّة الخَضرَاء",    sub: "Above the grave of the Prophet Muhammad ﷺ", duas: 4, cx: 168, cy: 182 },
  { id: "baqi",      name: "Jannat al-Baqīʿ",        arabic: "جَنَّة البَقِيع",       sub: "Historic cemetery — Companions and family of the Prophet ﷺ", duas: 3, cx: 272, cy: 172 },
  { id: "quba",      name: "Masjid Qubāʾ",           arabic: "مسجد قُبَاء",          sub: "First mosque built in Islam",    duas: 3,  cx: 145, cy: 248 },
  { id: "suffah",    name: "As-Suffah",               arabic: "الصُّفَّة",             sub: "Platform of the Companions of the Bench", duas: 2, cx: 222, cy: 248 },
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
                fill={sel ? colors.primary : "rgba(255,255,255,0.18)"}
                stroke={sel ? colors.primary : "rgba(255,255,255,0.9)"}
                strokeWidth={1.5}
              />
              <Circle
                cx={site.cx} cy={site.cy} r={3}
                fill={sel ? "#fff" : colors.primary}
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
                stroke={sel ? colors.primary : "#fff"}
                strokeWidth={1.5}
              />
              {/* Solid centre dot */}
              <Circle cx={site.cx} cy={site.cy} r={3}
                fill={sel ? colors.primary : "#fff"}
              />
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

// ── Site info card ─────────────────────────────────────────────────────────────

function SiteCard({ site, onViewDuas, city }) {
  if (!site) return null;
  const extra = MADINAH_INFO[site.id];
  return (
    <View style={sc.card}>
      <View style={sc.handle}/>
      <Text style={sc.name}>{site.name}</Text>
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
    backgroundColor: "#FDFAF4", borderRadius: 16, borderWidth: 1,
    borderColor: "#D4D0CA", padding: 20,
    shadowColor: "#6A4A28", shadowOffset: { width:0, height:3 }, shadowOpacity: 0.14, shadowRadius: 8, elevation: 4,
  },
  handle:     { width: 32, height: 3, borderRadius: 2, backgroundColor: "#D4D0CA", alignSelf: "center", marginBottom: 16 },
  name:       { fontFamily: SERIF, fontSize: 22, color: "#1A1712", marginBottom: 2 },
  arabic:     { fontSize: 18, color: "#5A5650", marginBottom: 2 },
  sub:        { fontSize: 14, color: "#5A5650", marginBottom: 10 },
  detail:     { fontSize: 12, color: "#5A5650", lineHeight: 18, marginBottom: 10, fontStyle: "italic" },
  countRow:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTopWidth: 1, borderTopColor: "#D4D0CA", marginBottom: 16 },
  countLabel: { fontSize: 14, color: "#5A5650" },
  countBadge: { backgroundColor: "#EBF2EE", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  countValue: { fontSize: 14, color: "#2F5D50", fontWeight: "500" },
  btn:        { backgroundColor: "#2F5D50", borderRadius: 10, paddingVertical: 14, alignItems: "center", shadowColor: "#6A4A28", shadowOffset: { width:0, height:3 }, shadowOpacity: 0.14, shadowRadius: 8, elevation: 4 },
  btnText:    { fontSize: 16, color: "#fff", fontWeight: "500" },
});

// ── Main screen ───────────────────────────────────────────────────────────────

export default function SacredPlacesScreen({ navigation }) {
  const { colors } = useAccessibility();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [city,     setCity]     = useState("Makkah");
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
          />
        )}

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
              <Text style={selected?.id === site.id ? [s.listArrow, { color:"#2F5D50" }] : s.listArrow}>›</Text>
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

        <View style={{ height: spacing(4) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing(2.5), paddingTop: spacing(2), paddingBottom: spacing(1.5),
  },
  back: { fontSize: 22, color: colors.text },
  headerTitle: { fontFamily: SERIF, fontSize: 22, color: colors.text },
  searchIcon: { fontSize: 18 },

  cityToggle: {
    flexDirection: "row", marginHorizontal: spacing(2.5), marginBottom: spacing(1),
    backgroundColor: colors.card, borderRadius: radius.pill, padding: 3,
    borderWidth: 1, borderColor: colors.border,
  },
  cityOpt: { flex: 1, paddingVertical: spacing(1.25), borderRadius: radius.pill, alignItems: "center" },
  cityOptActive: { backgroundColor: colors.primary },
  cityOptText: { fontSize: 16, color: colors.subtext },
  cityOptTextActive: { color: "#fff", fontWeight: "500" },

  madinahNote: {
    marginHorizontal: spacing(2.5),
    marginTop: spacing(1.5),
    marginBottom: spacing(1.5),
    backgroundColor: "#F5EDD8", borderRadius: radius.md, borderWidth: 1,
    borderColor: "#E8D9B8", padding: spacing(1.75),
  },
  madinahNoteText: { fontSize: 12, color: "#7A6030", lineHeight: 18 },

  mapWrap: { overflow: "hidden" },

  listSection: { paddingHorizontal: spacing(2.5), paddingTop: spacing(2.5) },
  listTitle: {
    fontSize: 12, fontWeight: "600", color: colors.subtext,
    letterSpacing: 1.5, textTransform: "uppercase", marginBottom: spacing(1.5),
  },
  listRow: {
    flexDirection: "row", alignItems: "center", gap: spacing(1.5),
    paddingVertical: spacing(1.75),
  },
  listRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border, flexShrink: 0 },
  dotActive: { backgroundColor: colors.primary },
  listInfo: { flex: 1 },
  listName: { fontFamily: SERIF, fontSize: 16, color: colors.text, marginBottom: 2 },
  listNameActive: { color: colors.primary },
  listSub: { fontSize: 12, color: colors.subtext },
  listCount: { fontSize: 14, color: colors.subtext },
  listArrow: { fontSize: 20, color: colors.border },

  linksCard: {
    marginHorizontal: spacing(2.5), marginTop: spacing(2), backgroundColor: colors.card,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, overflow: "hidden", ...shadows.card,
  },
  linksTitle: {
    fontFamily: SERIF, fontSize: 16, color: colors.text,
    padding: spacing(2), borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  linkRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing(2), paddingVertical: spacing(1.75),
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  linkText: { fontSize: 14, color: colors.primary, flex: 1 },
  linkArrow: { fontSize: 14, color: colors.primary },
});
