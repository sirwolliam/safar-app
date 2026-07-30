/**
 * SacredPlacesScreen.jsx — Safar
 * Two cities: Makkah and Madinah
 * Full-bleed map · numbered pins · single stepper nav · fallback-safe card content
 */
import React, { useState, useEffect, useMemo } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, Linking, Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, { Circle, Path, G, Text as SvgText } from "react-native-svg";
import { CaretLeft, CaretRight, HandsPraying } from "phosphor-react-native";
import { getDuaById } from "../dua-content";
import { useAccessibility } from "../AccessibilityContext";

const SERIF = "SourceSerif4-Regular";
const { width: SW } = Dimensions.get("window");
const MAP_H = 350;

// SVG pin geometry (viewBox units)
const PR = 9;   // circle radius
const PT = 6;   // tail height below circle, tip is the location point
const PW = 5;   // half-width of tail base

// PIN_OFF has no colors-token equivalent — warm medium green kept hardcoded
const PIN_OFF = "#4A7A60";

const VISITED_KEY = "safar_visited_sites_v1";

// ── Site data ─────────────────────────────────────────────────────────────────
const MAKKAH_SITES = [
  {
    id: "kaaba", name: "Al-Kaʿbah", arabic: "الكَعبَة",
    sub: "The Most Sacred House", duas: 12, cx: 193, cy: 211,
    // photo: require("../assets/..."),
    // citation: "Qurʾan 2:125",
    // relatedDuas: [{ id: "...", title: "..." }],
  },
  {
    id: "hijr", name: "Hijr Ismāʿīl", arabic: "حِجر إِسماعيل",
    sub: "Sanctuary of the Prophet Ismāʿīl ﷺ", duas: 4, cx: 190, cy: 188,
    // photo, citation, relatedDuas
  },
  {
    id: "maqam", name: "Maqām Ibrāhīm", arabic: "مَقَامُ إبْرَاهِيم",
    sub: "Station of Prophet Ibrāhīm", duas: 5, cx: 212, cy: 193,
    // photo, citation, relatedDuas
  },
  {
    id: "zamzam", name: "Zamzam", arabic: "زَمْزَم",
    sub: "The Blessed Well", duas: 4, cx: 210, cy: 225,
    // photo, citation, relatedDuas
  },
  {
    id: "yemeni", name: "Yemeni Corner", arabic: "الرُكن اليَمانِي",
    sub: "Second of the two blessed corners", duas: 3, cx: 181, cy: 228,
    // photo, citation, relatedDuas
  },
  {
    id: "safa", name: "Ṣafā & Marwah", arabic: "الصَّفَا وَالْمَرْوَة",
    sub: "Place of Saʿy — 7 passes", duas: 8, cx: 176, cy: 290,
    // photo, citation, relatedDuas
  },
];

const MADINAH_SITES = [
  {
    id: "nabawi", name: "Al-Masjid an-Nabawī", arabic: "المسجد النبوي",
    sub: "The Prophet's Mosque", duas: 8, cx: 195, cy: 168, official: true,
    description: "Built by the Prophet ㏏ after the Hijrah in 622 CE. A prayer here equals 1,000 prayers elsewhere, except al-Masjid al-Ḥarām.",
    // photo, citation, relatedDuas
  },
  {
    id: "rawdah", name: "Al-Rawḍah al-Sharīfah", arabic: "الرَّوضَة الشَّريفَة",
    sub: "The Noble Garden — between the minbar and the grave of the Prophet ﷺ",
    duas: 6, cx: 155, cy: 158, official: true,
    description: "The area between the Prophet's ㏏ grave and his pulpit — a garden from the gardens of Paradise.",
    // photo, citation, relatedDuas
  },
  {
    id: "greendome", name: "The Green Dome", arabic: "القُبَّة الخَضرَاء",
    sub: "Above the grave of the Prophet Muhammad ﷺ", duas: 4, cx: 168, cy: 182,
    description: "The resting place of the Prophet Muhammad ㏏. Sending salām upon him here is among the most virtuous acts a visitor can perform.",
    // photo, citation, relatedDuas
  },
  {
    id: "baqi", name: "Jannat al-Baqīʿ", arabic: "جَنَّة البَقيع",
    sub: "Historic cemetery — Companions and family of the Prophet ﷺ",
    duas: 3, cx: 272, cy: 172,
    description: "The main cemetery of Madīnah where many Companions and family of the Prophet ㏏ are buried.",
    // photo, citation, relatedDuas
  },
  {
    id: "quba", name: "Masjid Qubāʾ", arabic: "مسجد قُبَاء",
    sub: "First mosque built in Islam", duas: 3, cx: 145, cy: 248,
    description: "The first mosque built in Islam. Two rakʿahs here equals the reward of an ʿUmrah.",
    // photo, citation, relatedDuas
  },
  {
    id: "suffah", name: "As-Ṣuffah", arabic: "الصُّفَّة",
    sub: "Platform of the Companions of the Bench", duas: 2, cx: 222, cy: 248,
    description: "The raised platform at the rear of the mosque where poor Companions lived and devoted themselves to learning from the Prophet ㏏.",
    // photo, citation, relatedDuas
  },
];

const MADINAH_INFO = {
  rawdah: {
    detail: "The Rawḍah (Garden of Paradise) is the area between the minbar and the grave of the Prophet Muhammad ﷺ. The Prophet ﷺ said: 'Between my house and my pulpit is a garden from the gardens of Paradise.' (Ṣaḥīḥ al-Bukhārī · 1196). Entry is managed and may require permits — check with the Masjid authorities.",
    note: "official",
  },
  baqi: {
    detail: "Jannat al-Baqīʿ is the main Islamic cemetery in Madinah, containing the graves of many Companions (Ṣaḥābah), family members of the Prophet ﷺ, and early Muslims. The Prophet ﷺ regularly visited and prayed for those buried here. Visiting hours are limited and visiting etiquette should be followed.",
    note: "guidance",
  },
  nabawi: {
    detail: "The Prophet's Mosque (Masjid al-Nabawī) was originally built by the Prophet ﷺ himself after the Hijrah in 622 CE. Today it is one of the largest mosques in the world. Visiting it is highly recommended — the Prophet ﷺ said: 'A prayer in this mosque of mine is better than a thousand prayers elsewhere except al-Masjid al-Ḥarām.' (Ṣaḥīḥ Muslim · 1394). It is not part of what is required in Hajj or Umrah.",
    note: "guidance",
  },
};

// ── Numbered SVG pin ──────────────────────────────────────────────────────────
// Pin tip sits at (cx, cy); circle body rises above; tail is the triangle between.
function Pin({ site, index, isSelected, onPress, colors }) {
  const { cx, cy } = site;
  const fill  = isSelected ? colors.primary : PIN_OFF;
  const bodyY = cy - PT - PR;
  return (
    <G onPress={onPress}>
      <Circle cx={cx} cy={bodyY} r={PR + PT + 6} fill="transparent" />
      <Path
        d={`M ${cx - PW} ${cy - PT} L ${cx + PW} ${cy - PT} L ${cx} ${cy} Z`}
        fill={fill}
      />
      <Circle cx={cx} cy={bodyY} r={PR} fill={fill} />
      {isSelected && (
        <Circle cx={cx} cy={bodyY} r={PR + 2.5} fill="none" stroke="#fff" strokeWidth={1.5} />
      )}
      <SvgText
        x={cx}
        y={bodyY}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#fff"
        fontSize={6.5}
        fontWeight="700"
      >
        {String(index + 1)}
      </SvgText>
    </G>
  );
}

// ── Map components ────────────────────────────────────────────────────────────
function MakkahMap({ selected, onSelect, colors }) {
  return (
    <View style={{ width: "100%", height: MAP_H }}>
      <Image
        source={require("../assets/kaaba_map.png")}
        style={{ width: "100%", height: MAP_H }}
        resizeMode="cover"
      />
      <Svg
        style={{ position: "absolute", top: 0, left: 0 }}
        width="100%"
        height={MAP_H}
        viewBox="80 60 240 290"
      >
        {MAKKAH_SITES.map((site, i) => (
          <Pin
            key={site.id}
            site={site}
            index={i}
            isSelected={site.id === selected?.id}
            onPress={() => onSelect(site)}
            colors={colors}
          />
        ))}
      </Svg>
    </View>
  );
}

function MacdinahMap({ selected, onSelect, colors }) {
  return (
    <View style={{ width: "100%", height: MAP_H }}>
      <Image
        source={require("../assets/medina.png")}
        style={{ width: "140%", height: MAP_H * 1.4, marginLeft: "-20%", marginTop: -MAP_H * 0.15 }}
        resizeMode="cover"
      />
      <Svg
        style={{ position: "absolute", top: 0, left: 0 }}
        width="100%"
        height={MAP_H}
        viewBox="80 75 240 210"
      >
        {MADINAH_SITES.map((site, i) => (
          <Pin
            key={site.id}
            site={site}
            index={i}
            isSelected={site.id === selected?.id}
            onPress={() => onSelect(site)}
            colors={colors}
          />
        ))}
      </Svg>
    </View>
  );
}

// ── Location chips ────────────────────────────────────────────────────────────
function LocationChips({ sites, selectedId, onSelect, styles }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {sites.map(s => {
        const on = s.id === selectedId;
        return (
          <TouchableOpacity key={s.id}
            style={on ? [styles.chip, styles.chipOn] : styles.chip}
            onPress={() => onSelect(s)} activeOpacity={0.8}>
            <Text style={on ? [styles.label, styles.labelOn] : styles.label}>{s.name}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const createLcStyles = (C) => StyleSheet.create({
  row:    { paddingHorizontal: 4, paddingVertical: 8, gap: 8 },
  chip:   { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: C.border, backgroundColor: C.card },
  chipOn: { backgroundColor: C.primary, borderColor: C.primary },
  label:  { fontSize: 13, color: C.text },
  labelOn:{ fontSize: 13, color: "#fff", fontWeight: "500" },
});

// ── Site card ─────────────────────────────────────────────────────────────────
function SiteCard({ site, sites, onSelect, onViewDuas, city, isVisited, onToggleVisited, navigation, styles, lcStyles, colors }) {
  if (!site) return null;
  const idx   = sites.findIndex(s => s.id === site.id);
  const extra = MADINAH_INFO[site.id];
  const hasDuas = Array.isArray(site.relatedDuas) && site.relatedDuas.length > 0;

  return (
    <View style={styles.card}>

      {/* ── 1. Stepper: arrow · chips · arrow ── */}
      <View style={styles.stepperRow}>
        <TouchableOpacity
          style={styles.arrowBtn}
          onPress={() => onSelect(sites[idx - 1])}
          disabled={idx === 0}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 6 }}
          activeOpacity={0.7}
        >
          <CaretLeft size={20} color={idx === 0 ? colors.border : colors.primary} weight="bold" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <LocationChips sites={sites} selectedId={site.id} onSelect={onSelect} styles={lcStyles} />
        </View>
        <TouchableOpacity
          style={styles.arrowBtn}
          onPress={() => onSelect(sites[idx + 1])}
          disabled={idx === sites.length - 1}
          hitSlop={{ top: 10, bottom: 10, left: 6, right: 10 }}
          activeOpacity={0.7}
        >
          <CaretRight size={20} color={idx === sites.length - 1 ? colors.border : colors.primary} weight="bold" />
        </TouchableOpacity>
      </View>
      <View style={styles.stepperDivider} />

      <View style={styles.body}>
        {/* ── 2. Name + visited pill ── */}
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={2}>{site.name}</Text>
          {onToggleVisited ? (
            <TouchableOpacity
              style={isVisited ? [styles.visitedBtn, styles.visitedBtnOn] : styles.visitedBtn}
              onPress={() => onToggleVisited(site.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.8}
            >
              <Text style={isVisited ? [styles.visitedTxt, styles.visitedTxtOn] : styles.visitedTxt}>
                {isVisited ? "✓ Visited" : "Mark visited"}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* ── 3. Arabic name + subtitle ── */}
        <Text style={styles.arabic}>{site.arabic}</Text>
        <Text style={styles.sub}>{site.sub}</Text>

        {/* ── 4. Photo (omitted entirely when absent) ── */}
        {site.photo ? (
          <Image source={site.photo} style={styles.photo} resizeMode="cover" />
        ) : null}

        {/* ── 5. Description / detail ── */}
        {extra?.detail ? (
          <Text style={styles.detail}>{extra.detail}</Text>
        ) : null}

        {/* ── 6. Citation (omitted entirely when absent) ── */}
        {site.citation ? (
          <Text style={styles.citation}>{site.citation}</Text>
        ) : null}

        {/* ── 7. Duas section ── */}
        {hasDuas ? (
          <View style={styles.relatedSection}>
            {site.relatedDuas.map(rd => {
              const fullDua = getDuaById(rd.id);
              return (
                <TouchableOpacity
                  key={rd.id}
                  style={styles.duaRow}
                  onPress={() => fullDua && navigation?.navigate?.("DuaDetail", { dua: fullDua, allDuas: [fullDua], currentIndex: 0 })}
                  activeOpacity={0.8}
                >
                  <HandsPraying size={16} color={colors.primary} />
                  <Text style={styles.duaRowTitle} numberOfLines={1}>{rd.title}</Text>
                  <CaretRight size={14} color={colors.border} />
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <>
            <View style={styles.countRow}>
              <Text style={styles.countLabel}>{"Duʿāʾs at this place"}</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countValue}>{site.duas} {"Duʿāʾs"}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.btn} onPress={() => onViewDuas?.(site)} activeOpacity={0.88}>
              <Text style={styles.btnText}>{"View Duʿāʾs  →"}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const createScStyles = (C) => StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: -20,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    shadowColor: "#4A2E10",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 4,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  arrowBtn: {
    padding: 4,
  },
  stepperDivider: {
    height: 1,
    backgroundColor: C.border,
    marginTop: 6,
  },
  body: {
    padding: 20,
  },
  nameRow:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 2 },
  name:         { fontFamily: SERIF, fontSize: 22, color: C.text, flex: 1, marginRight: 8 },
  visitedBtn:   { borderRadius: 20, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 10, paddingVertical: 5, flexShrink: 0 },
  visitedBtnOn: { backgroundColor: C.primary, borderColor: C.primary },
  visitedTxt:   { fontSize: 12, color: C.subtext, fontWeight: "600" },
  visitedTxtOn: { fontSize: 12, color: "#fff", fontWeight: "600" },
  arabic:       { fontSize: 18, color: C.text, marginBottom: 2 },
  sub:          { fontSize: 14, color: C.text, marginBottom: 10 },
  photo: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    marginBottom: 12,
  },
  detail:         { fontSize: 12, color: C.text, lineHeight: 18, marginBottom: 10, fontStyle: "italic" },
  // citation color has no colors-token equivalent (distinctive sage green #5A8A72 — kept hardcoded)
  citation:       { fontSize: 11, color: "#5A8A72", fontWeight: "600", marginBottom: 10 },
  relatedSection: { marginTop: 8, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 12 },
  duaRow:         { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  duaRowTitle:    { flex: 1, fontSize: 14, color: C.primary, fontWeight: "500" },
  countRow:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border, marginBottom: 16 },
  countLabel:     { fontSize: 14, color: C.text },
  // countBadge background has no colors-token equivalent (light mint #E2EDE6 — kept hardcoded)
  countBadge:     { backgroundColor: "#E2EDE6", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  countValue:     { fontSize: 14, color: C.primary, fontWeight: "500" },
  btn:            { backgroundColor: C.primary, borderRadius: 10, paddingVertical: 14, alignItems: "center", shadowColor: "#4A2E10", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.14, shadowRadius: 8, elevation: 4 },
  btnText:        { fontSize: 16, color: "#fff", fontWeight: "500" },
});

// ── Scholarly footnote ────────────────────────────────────────────────────────
// Warm amber brand colors (#EEE4CB, #DDD0A8, #6B5020) have no colors-token equivalent — kept hardcoded
function ScholarlyFootnote({ styles }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>
        <Text style={styles.bold}>Sources</Text>{" — "}
        {"Duʿāʾs are drawn from Ṣaḥīḥ al-Bukhārī, Ṣaḥīḥ Muslim, Sunan Abī Dāwūd, Sunan al-Tirmiḏī, and established scholarly works. Each duʿāʾ is attributed to its primary source. Practice and wording may differ across the four madhabs (Ḥanafī, Mālikī, Shāfiʿī, Ḥanbalī). Consult a qualified scholar for rulings specific to your school of thought."}
      </Text>
    </View>
  );
}

const createFnStyles = () => StyleSheet.create({
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

// ── Main screen ───────────────────────────────────────────────────────────────
export default function SacredPlacesScreen({ navigation }) {
  const { colors } = useAccessibility();
  const s    = useMemo(() => createStyles(colors),   [colors]);
  const lcS  = useMemo(() => createLcStyles(colors), [colors]);
  const scS  = useMemo(() => createScStyles(colors), [colors]);
  const fnS  = useMemo(() => createFnStyles(),       []);

  const [city,     setCity]     = useState("Makkah");
  const [visited,  setVisited]  = useState({});
  const [selected, setSelected] = useState(MAKKAH_SITES[0]);

  useEffect(() => {
    AsyncStorage.getItem(VISITED_KEY).then(v => { if (v) setVisited(JSON.parse(v)); }).catch(() => {});
  }, []);

  const sites = city === "Makkah" ? MAKKAH_SITES : MADINAH_SITES;

  const toggleVisited = (siteId) => {
    setVisited(prev => {
      const updated = { ...prev, [siteId]: !prev[siteId] };
      AsyncStorage.setItem(VISITED_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack?.()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 24 }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={s.back}>{"←"}</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Sacred Places</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* City toggle */}
      <View style={s.cityToggle}>
        {["Makkah", "Madinah"].map((c) => (
          <TouchableOpacity
            key={c}
            style={city === c ? [s.cityOpt, s.cityOptActive] : s.cityOpt}
            onPress={() => {
              const newSites = c === "Makkah" ? MAKKAH_SITES : MADINAH_SITES;
              setCity(c);
              setSelected(newSites[0]);
            }}
            activeOpacity={0.85}
          >
            <Text style={city === c ? [s.cityOptText, s.cityOptTextActive] : s.cityOptText}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Full-bleed map ── */}
        <View style={s.mapWrap}>
          {city === "Makkah"
            ? <MakkahMap selected={selected} onSelect={setSelected} colors={colors} />
            : <MacdinahMap selected={selected} onSelect={setSelected} colors={colors} />
          }
        </View>

        {/* ── Card overlapping map bottom edge ── */}
        <SiteCard
          site={selected}
          sites={sites}
          onSelect={setSelected}
          city={city}
          onViewDuas={(site) => navigation?.navigate?.("SiteDuas", { site, city })}
          isVisited={!!visited[selected?.id]}
          onToggleVisited={toggleVisited}
          navigation={navigation}
          styles={scS}
          lcStyles={lcS}
          colors={colors}
        />

        {/* ── Madinah context note (below card) ── */}
        {city === "Madinah" ? (
          <View style={s.madinahNote}>
            <Text style={s.madinahNoteText}>
              {"Visiting Madinah is not part of Hajj or Umrah, but is a beloved and highly recommended practice. The sites below are outside Masjid al-Ḥarām."}
            </Text>
          </View>
        ) : null}

        {/* ── All sites list (secondary, below map+card block) ── */}
        <View style={s.listSection}>
          <Text style={s.listTitle}>All sites</Text>
          {sites.map((site, i) => (
            <TouchableOpacity
              key={site.id}
              style={i < sites.length - 1 ? [s.listRow, s.listRowBorder] : s.listRow}
              onPress={() => setSelected(site)}
              activeOpacity={0.85}
            >
              <View style={s.listNum}>
                <Text style={s.listNumText}>{i + 1}</Text>
              </View>
              <View style={s.listInfo}>
                <Text style={selected?.id === site.id ? [s.listName, s.listNameActive] : s.listName}>{site.name}</Text>
                <Text style={s.listSub}>{site.sub}</Text>
              </View>
              <Text style={s.listCount}>{site.duas} duʿāʾs</Text>
              <Text style={selected?.id === site.id ? [s.listArrow, { color: colors.primary }] : s.listArrow}>{"›"}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Madinah official resources ── */}
        {city === "Madinah" ? (
          <View style={s.linksCard}>
            <Text style={s.linksTitle}>Official resources</Text>
            {[
              ["Presidency of the Two Holy Mosques", "https://www.gph.gov.sa"],
              ["Rawdah visit booking (Nusuk)", "https://www.nusuk.sa"],
              ["Saudi Ministry of Hajj", "https://www.haj.gov.sa"],
            ].map(([label, url]) => (
              <TouchableOpacity key={url} style={s.linkRow} onPress={() => Linking.openURL(url)}>
                <Text style={s.linkText}>{label}</Text>
                <Text style={s.linkArrow}>{"↗"}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        <ScholarlyFootnote styles={fnS} />
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (C) => StyleSheet.create({
  safe:          { flex: 1, backgroundColor: C.background },
  header:        { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  back:          { fontSize: 22, color: C.text },
  headerTitle:   { fontFamily: SERIF, fontSize: 22, color: C.text },

  cityToggle:        { flexDirection: "row", marginHorizontal: 20, marginBottom: 8, backgroundColor: C.card, borderRadius: 999, padding: 3, borderWidth: 1, borderColor: C.border },
  cityOpt:           { flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: "center" },
  cityOptActive:     { backgroundColor: C.primary },
  cityOptText:       { fontSize: 16, color: C.subtext },
  cityOptTextActive: { color: "#fff", fontWeight: "500" },

  mapWrap: { overflow: "hidden" },

  // Warm amber note colors (#EEE4CB, #DDD0A8, #6B5020) have no colors-token equivalent — kept hardcoded
  madinahNote:     { marginHorizontal: 20, marginTop: 16, marginBottom: 4, backgroundColor: "#EEE4CB", borderRadius: 10, borderWidth: 1, borderColor: "#DDD0A8", padding: 14 },
  madinahNoteText: { fontSize: 12, color: "#6B5020", lineHeight: 18 },

  listSection:    { paddingHorizontal: 20, paddingTop: 24 },
  listTitle:      { fontSize: 10, fontWeight: "800", letterSpacing: 1.5, color: C.subtext, textTransform: "uppercase", marginBottom: 12 },
  listRow:        { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  listRowBorder:  { borderBottomWidth: 1, borderBottomColor: C.border },
  listNum:        { width: 22, height: 22, borderRadius: 11, backgroundColor: C.primary, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  listNumText:    { fontSize: 11, color: "#fff", fontWeight: "700" },
  listInfo:       { flex: 1 },
  listName:       { fontFamily: SERIF, fontSize: 16, color: C.text, marginBottom: 2 },
  listNameActive: { color: C.primary },
  listSub:        { fontSize: 12, color: C.subtext },
  listCount:      { fontSize: 14, color: C.subtext },
  listArrow:      { fontSize: 20, color: C.border },

  linksCard:  { marginHorizontal: 20, marginTop: 16, backgroundColor: C.card, borderRadius: 10, borderWidth: 1, borderColor: C.border, overflow: "hidden", shadowColor: "#4A2E10", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.20, shadowRadius: 10, elevation: 5 },
  linksTitle: { fontFamily: SERIF, fontSize: 16, color: C.text, padding: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  linkRow:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  linkText:   { fontSize: 14, color: C.primary, flex: 1 },
  linkArrow:  { fontSize: 14, color: C.primary },
});
