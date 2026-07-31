/**
 * SacredPlacesScreen.jsx — Safar
 * Two cities: Makkah and Madinah
 * Ornate pattern header · full-bleed photo hero · stepper overlaid on hero bottom with scrim
 */
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Linking, Image, PanResponder, Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CaretLeft, CaretRight, HandsPraying, MapPin, MapTrifold } from "phosphor-react-native";
import { getDuaById } from "../dua-content";
import { useAccessibility } from "../AccessibilityContext";
import HeaderPatternBg from "../HeaderPatternBg";

const SERIF      = "SourceSerif4-Regular";
const SERIF_BOLD = "SourceSerif4-SemiBold";
const HERO_H  = 300;
const { width: SW } = Dimensions.get("window");

const VISITED_KEY = "safar_visited_sites_v1";

// ── Site data ─────────────────────────────────────────────────────────────────
const MAKKAH_SITES = [
  {
    id: "kaaba", name: "Al-Kaʿbah", arabic: "الكَعبَة",
    sub: "The Most Sacred House", duas: 12,
    photo: require("../assets/kaaba-map.jpg"),
    description: "The Kaʿbah is the most sacred structure in Islam, the direction every Muslim worldwide faces in prayer, and the focal point of Ṭawāf during Hajj and Umrah. Tradition holds it was built by Prophet Ibrahim and his son Ismaʿil as the first house dedicated to the oneness of Allah. It is draped year-round in the Kiswah, a black silk covering embroidered with gold Qurʾanic calligraphy.",
  },
  {
    id: "hijr", name: "Hijr Ismāʿīl", arabic: "حِجر إِسماعيل",
    sub: "Sanctuary of the Prophet Ismāʿīl ﷺ", duas: 4,
    photo: require("../assets/hijr-ismail-map.jpg"),
    description: "This low, semicircular wall on the Kaʿbah's northwest side is understood by many scholars to have been part of the Kaʿbah's original structure, left out only when the Quraysh rebuilt it with limited funds (Sahih Muslim). Islamic tradition holds it as the resting place of Ismaʿil and his mother Hajar. Because it's considered part of the Kaʿbah itself, pilgrims must walk entirely around it during Ṭawāf rather than cutting through.",
  },
  {
    id: "maqam", name: "Maqām Ibrāhīm", arabic: "مَقَامُ إبْرَاهِيم",
    sub: "Station of Prophet Ibrāhīm", duas: 5,
    photo: require("../assets/maqam-ibrahim-map.jpg"),
    description: "This stone is believed to bear the footprints of Prophet Ibrahim, used as he stood to build the Kaʿbah's upper walls. The Qurʾan instructs believers to take the station of Ibrahim as a place of prayer (2:125), and it's Sunnah to pray two rakahs behind it after Ṭawāf. The stone is preserved today inside a small glass and gold enclosure just steps from the Kaʿbah.",
  },
  {
    id: "zamzam", name: "Zamzam", arabic: "زَمْزَم",
    sub: "The Blessed Well", duas: 4,
    photo: require("../assets/zamzam-map.jpg"),
    description: "This well traces back to Hajar, left with her infant son Ismaʿil in the barren valley of Makkah, searching desperately for water. Tradition holds the well sprang forth beneath the infant's feet as a mercy from Allah, and it has never run dry since. The Prophet ﷺ described its water as blessed, serving whatever intention it is drunk with (Sunan Ibn Majah).",
  },
  {
    id: "yemeni", name: "Yemeni Corner", arabic: "الرُكن اليَمانِي",
    sub: "Second of the two blessed corners", duas: 3,
    photo: require("../assets/yemeni-corner-map.jpg"),
    description: "This is the southwestern corner of the Kaʿbah, named for facing Yemen, sitting just before the Black Stone along the path of Ṭawāf. The Prophet ﷺ said that touching the Black Stone and the Yemeni Corner erases sins (Musnad Ahmad). It's Sunnah to touch it if the crowd allows — without kissing it, and without gesturing toward it if unreachable.",
  },
  {
    id: "safa", name: "Ṣafā & Marwah", arabic: "الصَّفَا وَالْمَرْوَة",
    sub: "Place of Saʿy — 7 passes", duas: 8,
    photo: require("../assets/safa-marwah-map.jpg"),
    description: "These two hills near the Kaʿbah are connected by a gallery where pilgrims perform Saʿy — walking briskly between them seven times, commemorating Hajar's search for water for her infant son. The Qurʾan affirms both hills as being among the symbols of Allah (2:158). Saʿy is an obligatory rite of both Hajj and Umrah, performed immediately after Ṭawāf.",
  },
  {
    id: "jabalnur", name: "Jabal an-Nūr", arabic: "جَبَل النُّور",
    sub: "Site of the first revelation — Cave of Ḥirāʾ", duas: 0,
    photo: require("../assets/jabal-nur-map.jpg"),
    description: "This mountain rises about 3km from the Grand Mosque, and near its summit sits the small cave where the Prophet ﷺ used to retreat for solitary reflection before prophethood. It was here that the Angel Jibril first appeared to him, delivering the opening words of Surah al-Alaq — the first revelation of the Qurʾan. The climb is steep, taking most visitors well over an hour each way.",
  },
  {
    id: "multazam", name: "Al-Multazam", arabic: "الملتزم",
    sub: "Where pilgrims press and supplicate", duas: 0,
    photo: require("../assets/multazam-map.jpg"),
    description: "This is the section of the Kaʿbah's wall between the Black Stone and the door, about two meters wide, named for the Arabic word for \"clinging.\" Ibn Abbas identified this exact spot by name (Muwatta Malik), and it's Sunnah to press one's chest, face, and hands against it while making duʿāʾ. Scholars describe it as a place where supplication is especially heard.",
  },
];

const MADINAH_SITES = [
  {
    id: "nabawi", name: "Al-Masjid an-Nabawī", arabic: "المسجد النبوي",
    sub: "The Prophet's Mosque", duas: 8, official: true,
    description: "Built by the Prophet ㏏ after the Hijrah in 622 CE. A prayer here equals 1,000 prayers elsewhere, except al-Masjid al-Ḥarām.",
    // photo, locatorMap, markerPos, citation, relatedDuas
  },
  {
    id: "rawdah", name: "Al-Rawḍah al-Sharīfah", arabic: "الرَّوضَة الشَّريفَة",
    sub: "The Noble Garden — between the minbar and the grave of the Prophet ﷺ",
    duas: 6, official: true,
    description: "The area between the Prophet's ㏏ grave and his pulpit — a garden from the gardens of Paradise.",
    // photo, locatorMap, markerPos, citation, relatedDuas
  },
  {
    id: "greendome", name: "The Green Dome", arabic: "القُبَّة الخَضرَاء",
    sub: "Above the grave of the Prophet Muhammad ﷺ", duas: 4,
    description: "This green-painted dome marks the burial place of the Prophet Muhammad ﷺ and his companions Abu Bakr and Umar. The first dome here was built of wood in 1279 CE; it was rebuilt in stone in 1481, then rebuilt again by Ottoman Sultan Mahmud II in 1818, and wasn't painted green until 1837. It remains one of the most recognized silhouettes in the Muslim world.",
  },
  {
    id: "baqi", name: "Jannat al-Baqīʿ", arabic: "جَنَّة البَقيع",
    sub: "Historic cemetery — Companions and family of the Prophet ﷺ", duas: 3,
    description: "Jannat al-Baqiʿ is the main cemetery of Madinah, resting place for many of the Prophet's ﷺ Companions and family members, including several of his wives and children. The Prophet ﷺ regularly visited to pray for those buried here. Its simplicity — unmarked graves, no headstones — reflects Islamic teaching on humility in death.",
  },
  {
    id: "quba", name: "Masjid Qubāʾ", arabic: "مسجد قُبَاء",
    sub: "First mosque built in Islam", duas: 3,
    description: "The first mosque built in Islam. Two rakʿahs here equals the reward of an ʿUmrah.",
    // photo, locatorMap, markerPos, citation, relatedDuas
  },
  {
    id: "suffah", name: "As-Ṣuffah", arabic: "الصُّفَّة",
    sub: "Platform of the Companions of the Bench", duas: 2,
    description: "This raised platform at the rear of the Prophet's ﷺ Mosque was home to Ahl al-Suffah — Companions, many poor or newly arrived in Madinah with no family there, who devoted themselves entirely to learning directly from the Prophet ﷺ. The Prophet ﷺ regularly ate with them and looked after their needs personally. Their example is often cited as a model of prioritizing knowledge over worldly comfort.",
  },
  {
    id: "qiblatayn", name: "Masjid al-Qiblatayn", arabic: "مسجد القبلتين",
    sub: "Mosque of the Two Qiblahs", duas: 0,
    description: "This mosque marks where the direction of prayer changed from Jerusalem to the Kaʿbah. According to Sahih al-Bukhari, the Prophet ﷺ was leading Zuhr prayer here when the revelation came (Qurʾan 2:144), and the entire congregation turned mid-prayer to face Makkah instead. The name literally means \"Mosque of the Two Qiblahs.\"",
  },
  {
    id: "uhud", name: "Mount Uhud", arabic: "جبل أحد",
    sub: "Site of the Battle of Uhud", duas: 0,
    description: "This mountain was the site of the Battle of Uhud in 3 AH, where the Prophet's ﷺ beloved uncle Hamzah ibn Abdul Muttalib was martyred along with many Companions. The Prophet ﷺ said, \"Uhud is a mountain that loves us, and we love it\" (Sahih al-Bukhari and Sahih Muslim). Pilgrims visit the graves of the martyrs at its base and reflect on the sacrifices made there.",
  },
];

const MADINAH_INFO = {
  rawdah: {
    detail: "The Rawḍah (Garden of Paradise) is the area between the minbar and the grave of the Prophet Muhammad ﷺ. The Prophet ﷺ said: 'Between my house and my pulpit is a garden from the gardens of Paradise.' (Ṣaḥīḥ al-Bukhārī · 1196). Entry is managed and may require permits — check with the Masjid authorities.",
  },
  baqi: {
    detail: "Jannat al-Baqīʿ is the main Islamic cemetery in Madinah, containing the graves of many Companions (Ṣaḥābah), family members of the Prophet ﷺ, and early Muslims. The Prophet ﷺ regularly visited and prayed for those buried here. Visiting hours are limited and visiting etiquette should be followed.",
  },
  nabawi: {
    detail: "The Prophet's Mosque (Masjid al-Nabawī) was originally built by the Prophet ﷺ himself after the Hijrah in 622 CE. Today it is one of the largest mosques in the world. Visiting it is highly recommended — the Prophet ﷺ said: 'A prayer in this mosque of mine is better than a thousand prayers elsewhere except al-Masjid al-Ḥarām.' (Ṣaḥīḥ Muslim · 1394). It is not part of what is required in Hajj or Umrah.",
  },
};

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

// Overlay chip styles — white-on-dark for use over the hero scrim
const createOlcStyles = () => StyleSheet.create({
  row:    { paddingHorizontal: 4, paddingVertical: 0, gap: 8 },
  chip:   { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,0.45)", backgroundColor: "rgba(0,0,0,0.28)" },
  chipOn: { backgroundColor: "#4A5C48", borderColor: "#4A5C48" },
  label:  { fontSize: 13, color: "rgba(255,255,255,0.92)" },
  labelOn:{ fontSize: 13, color: "#FFFFFF", fontWeight: "600" },
});

// ── Site card — stepper removed, card starts at body content ─────────────────
function SiteCard({ site, onViewDuas, isVisited, onToggleVisited, navigation, styles, colors }) {
  if (!site) return null;
  const extra   = MADINAH_INFO[site.id];
  const hasDuas = Array.isArray(site.relatedDuas) && site.relatedDuas.length > 0;

  return (
    <View style={styles.card}>
      <View style={styles.body}>
        {/* ── 1. Name + visited pill ── */}
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

        {/* ── 2. Arabic name + subtitle ── */}
        <Text style={styles.arabic}>{site.arabic}</Text>
        <Text style={styles.sub}>{site.sub}</Text>

        {/* ── 3. Description ── */}
        {site.description ? (
          <Text style={styles.desc}>{site.description}</Text>
        ) : null}

        {/* ── 4. Locator map thumbnail (small position map — distinct from hero photo) ── */}
        {site.locatorMap ? (
          <View style={styles.locator}>
            <Image source={site.locatorMap} style={styles.locatorImg} resizeMode="cover" />
            <View style={[styles.locatorPin, site.markerPos
              ? { left: `${(site.markerPos.x * 100).toFixed(1)}%`, top: `${(site.markerPos.y * 100).toFixed(1)}%` }
              : { left: "50%", top: "50%" }
            ]}>
              <MapPin size={12} color={colors.primary} weight="fill" />
            </View>
          </View>
        ) : (
          <View style={styles.locatorFallback}>
            <MapTrifold size={24} color={colors.primary} weight="duotone" />
          </View>
        )}

        {/* ── 5. Citation ── */}
        {site.citation ? (
          <Text style={styles.citation}>{site.citation}</Text>
        ) : null}

        {/* ── 6. Duas section ── */}
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
    marginTop: 0,
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
  body:           { padding: 20 },
  nameRow:        { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 2 },
  name:           { fontFamily: SERIF_BOLD, fontSize: 22, color: C.text, flex: 1, marginRight: 8 },
  visitedBtn:     { borderRadius: 20, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 10, paddingVertical: 5, flexShrink: 0 },
  visitedBtnOn:   { backgroundColor: C.primary, borderColor: C.primary },
  visitedTxt:     { fontSize: 12, color: C.subtext, fontWeight: "600" },
  visitedTxtOn:   { fontSize: 12, color: "#fff", fontWeight: "600" },
  arabic:         { fontSize: 18, color: C.text, marginBottom: 2 },
  sub:            { fontSize: 14, color: C.text, marginBottom: 10 },
  desc:           { fontSize: 14, color: C.text, lineHeight: 22, marginBottom: 12 },
  detail:         { fontSize: 12, color: C.text, lineHeight: 18, marginBottom: 10, fontStyle: "italic" },
  citation:       { fontSize: 11, color: "#5A8A72", fontWeight: "600", marginBottom: 10 },
  locator:        { width: "100%", height: 80, borderRadius: 8, overflow: "hidden", marginBottom: 12 },
  locatorImg:     { width: "100%", height: 80 },
  locatorPin:     { position: "absolute", marginLeft: -6, marginTop: -12 },
  locatorFallback:{ width: "100%", height: 80, borderRadius: 8, backgroundColor: C.primary + "18", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  relatedSection: { marginTop: 8, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 12 },
  duaRow:         { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  duaRowTitle:    { flex: 1, fontSize: 14, color: C.primary, fontWeight: "500" },
  countRow:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border, marginBottom: 16 },
  countLabel:     { fontSize: 14, color: C.text },
  countBadge:     { backgroundColor: "#E2EDE6", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  countValue:     { fontSize: 14, color: C.primary, fontWeight: "500" },
  btn:            { backgroundColor: "#4A5C48", borderRadius: 10, paddingVertical: 14, alignItems: "center", shadowColor: "#4A2E10", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.14, shadowRadius: 8, elevation: 4 },
  btnText:        { fontSize: 16, color: "#fff", fontWeight: "500" },
});

// ── Scholarly footnote ────────────────────────────────────────────────────────
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
  const insets = useSafeAreaInsets();
  const s    = useMemo(() => createStyles(colors),   [colors]);
  const scS  = useMemo(() => createScStyles(colors), [colors]);
  const oLcS = useMemo(() => createOlcStyles(),      []);
  const fnS  = useMemo(() => createFnStyles(),       []);

  const [city,     setCity]     = useState("Makkah");
  const [visited,  setVisited]  = useState({});
  const [selected, setSelected] = useState(MAKKAH_SITES[0]);

  useEffect(() => {
    AsyncStorage.getItem(VISITED_KEY).then(v => { if (v) setVisited(JSON.parse(v)); }).catch(() => {});
  }, []);

  const sites = city === "Makkah" ? MAKKAH_SITES : MADINAH_SITES;
  const idx   = sites.findIndex(s => s.id === selected.id);

  // Swipe nav — mutable ref avoids stale-closure on PanResponder (created once)
  const swipeRef = useRef({ sites, selected, setSelected });
  useEffect(() => { swipeRef.current = { sites, selected, setSelected }; });
  const SWIPE_THRESHOLD = 40;
  const heroPan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8,
      onPanResponderRelease: (_, { dx }) => {
        const { sites, selected, setSelected } = swipeRef.current;
        const i = sites.findIndex(s => s.id === selected.id);
        if (dx < -SWIPE_THRESHOLD && i < sites.length - 1) setSelected(sites[i + 1]);
        else if (dx > SWIPE_THRESHOLD && i > 0) setSelected(sites[i - 1]);
      },
    })
  ).current;

  const toggleVisited = (siteId) => {
    setVisited(prev => {
      const updated = { ...prev, [siteId]: !prev[siteId] };
      AsyncStorage.setItem(VISITED_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  return (
    <View style={s.safe}>

      {/* ── Ornate pattern header (matches CalendarScreen / GroupsScreen) ── */}
      <View style={s.header}>
        <HeaderPatternBg width={SW} />
        <View style={[s.headerTopRow, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity
            style={s.headerBtn}
            onPress={() => navigation?.goBack?.()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 24 }}
            activeOpacity={0.8}
          >
            <CaretLeft size={18} color="#1A1410" weight="bold" />
          </TouchableOpacity>
          <View style={{ width: 36 }} />
        </View>
        <Text style={s.headerTitle}>Sacred Places</Text>
      </View>

      {/* ── City toggle — below header, outside ScrollView ── */}
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

        {/* ── Hero: full-bleed photo + gradient scrim + stepper overlay ── */}
        <View style={s.heroContainer} {...heroPan.panHandlers}>
          {selected?.photo ? (
            <Image source={selected.photo} style={s.heroImg} resizeMode="cover" />
          ) : (
            <View style={s.heroFallback}>
              <MapPin size={48} color={colors.primary} weight="duotone" />
            </View>
          )}

          {/* Scrim covers bottom third of hero for stepper legibility */}
          <View style={s.heroScrim} pointerEvents="none">
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.78)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
          </View>

          {/* Stepper overlaid at hero bottom: arrow · chips · arrow */}
          <View style={s.heroStepper}>
            <TouchableOpacity
              style={s.heroArrowBtn}
              onPress={() => idx > 0 && setSelected(sites[idx - 1])}
              disabled={idx === 0}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 6 }}
              activeOpacity={0.7}
            >
              <CaretLeft size={20} color={idx === 0 ? "rgba(255,255,255,0.3)" : "#FFFFFF"} weight="bold" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <LocationChips sites={sites} selectedId={selected.id} onSelect={setSelected} styles={oLcS} />
            </View>
            <TouchableOpacity
              style={s.heroArrowBtn}
              onPress={() => idx < sites.length - 1 && setSelected(sites[idx + 1])}
              disabled={idx === sites.length - 1}
              hitSlop={{ top: 10, bottom: 10, left: 6, right: 10 }}
              activeOpacity={0.7}
            >
              <CaretRight size={20} color={idx === sites.length - 1 ? "rgba(255,255,255,0.3)" : "#FFFFFF"} weight="bold" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Site card ── */}
        <SiteCard
          site={selected}
          onViewDuas={(site) => navigation?.navigate?.("SiteDuas", { site, city })}
          isVisited={!!visited[selected?.id]}
          onToggleVisited={toggleVisited}
          navigation={navigation}
          styles={scS}
          colors={colors}
        />

        {/* ── Madinah context note ── */}
        {city === "Madinah" ? (
          <View style={s.madinahNote}>
            <Text style={s.madinahNoteText}>
              {"Visiting Madinah is not part of Hajj or Umrah, but is a beloved and highly recommended practice. The sites below are outside Masjid al-Ḥarām."}
            </Text>
          </View>
        ) : null}

        {/* ── All sites list ── */}
        <View style={s.listSection}>
          <Text style={s.listTitle}>All sites</Text>
          {sites.map((site, i) => (
            <TouchableOpacity
              key={site.id}
              style={
                i < sites.length - 1
                  ? (selected?.id === site.id ? [s.listRow, s.listRowBorder, s.listRowActive] : [s.listRow, s.listRowBorder])
                  : (selected?.id === site.id ? [s.listRow, s.listRowActive] : s.listRow)
              }
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
              <Text style={selected?.id === site.id ? [s.listArrow, { color: "#4A5C48" }] : s.listArrow}>{"›"}</Text>
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
    </View>
  );
}

const createStyles = (C) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.background },

  // ── Ornate pattern header (matches CalendarScreen / GroupsScreen exactly) ──
  header:        { backgroundColor: "#4A5C48", minHeight: 110, position: "relative", overflow: "hidden", paddingHorizontal: 16, paddingBottom: 8 },
  headerTopRow:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: "#FDFAF4", borderWidth: 1, borderColor: "#D4D0CA", alignItems: "center", justifyContent: "center" },
  headerTitle:   { fontFamily: SERIF, fontSize: 38, color: "#FDFAF4", textAlign: "center", marginTop: 4 },

  // ── City toggle ──
  cityToggle:        { flexDirection: "row", marginHorizontal: 20, marginTop: 12, marginBottom: 12, backgroundColor: C.card, borderRadius: 999, padding: 3, borderWidth: 1, borderColor: C.border },
  cityOpt:           { flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: "center" },
  cityOptActive:     { backgroundColor: "#4A5C48" },
  cityOptText:       { fontSize: 16, color: C.subtext },
  cityOptTextActive: { color: "#fff", fontWeight: "500" },

  // ── Hero container: photo + scrim + stepper ──
  heroContainer: { width: "100%", height: HERO_H, position: "relative", marginBottom: 8 },
  heroImg:       { width: "100%", height: HERO_H },
  heroFallback:  { ...StyleSheet.absoluteFillObject, backgroundColor: C.primary + "18", alignItems: "center", justifyContent: "center" },
  heroScrim:     { position: "absolute", left: 0, right: 0, bottom: 0, height: 110 },
  heroStepper:   { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingBottom: 10, paddingTop: 6 },
  heroArrowBtn:  { padding: 6 },

  // ── Warm amber note colors (#EEE4CB, #DDD0A8, #6B5020) — kept hardcoded ──
  madinahNote:     { marginHorizontal: 20, marginTop: 16, marginBottom: 4, backgroundColor: "#EEE4CB", borderRadius: 10, borderWidth: 1, borderColor: "#DDD0A8", padding: 14 },
  madinahNoteText: { fontSize: 12, color: "#6B5020", lineHeight: 18 },

  listSection:    { paddingHorizontal: 20, paddingTop: 24 },
  listTitle:      { fontSize: 10, fontWeight: "800", letterSpacing: 1.5, color: C.subtext, textTransform: "uppercase", marginBottom: 12 },
  listRow:        { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  listRowBorder:  { borderBottomWidth: 1, borderBottomColor: C.border },
  listRowActive:  { backgroundColor: "#4A5C4818" },
  listNum:        { width: 22, height: 22, borderRadius: 11, backgroundColor: "#4A5C48", alignItems: "center", justifyContent: "center", flexShrink: 0 },
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
