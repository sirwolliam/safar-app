/**
 * DuaLibraryScreen.jsx — Safar
 * Browse duas by theme, occasion, reference — illustrated cards matching mockup
 */
import React, { useState, useMemo } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Dimensions,
} from "react-native";
import Svg, { Rect, Ellipse, Path, Circle, G, Line } from "react-native-svg";
import { colors, spacing, radius, shadows, typography } from "../theme";
import { useAccessibility } from "../AccessibilityContext";

const SERIF = "SourceSerif4-Regular";
// ── Scholarly footnote ─────────────────────────────────────────────────────────

function ScholarlyFootnote({ style }) {
  return (
    <View style={[fn.wrap, style]}>
      <Text style={fn.text}>
        <Text style={fn.bold}>Sources</Text>{" — "}
        Duas are drawn from Ṣaḥīḥ al-Bukhārī, Ṣaḥīḥ Muslim, Sunan Abī Dāwūd, Sunan al-Tirmidhī, and established scholarly works. Each duʿāʾ is attributed to its primary source. Practice and wording may differ across the four madhabs (Ḥanafī, Mālikī, Shāfiʿī, Ḥanbalī). Consult a qualified scholar for rulings specific to your school of thought.
      </Text>
    </View>
  );
}

const fn = StyleSheet.create({
  wrap: {
    marginHorizontal: spacing(2.5),
    marginTop: spacing(2),
    marginBottom: spacing(1),
    backgroundColor: "#F5EDD8",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#E8D9B8",
    padding: spacing(2),
  },
  text: {
    fontSize: typography.tiny,
    color: "#7A6030",
    lineHeight: 17,
  },
  bold: {
    fontWeight: "600",
  },
});

const { width: SW } = Dimensions.get("window");
const CARD_W = (SW - spacing(2.5) * 2 - spacing(1.5)) / 2;
const CARD_H = CARD_W * 0.9;

const FILTERS = ["All", "By Theme", "By Occasion", "By Reference"];

const CATEGORIES = [
  {
    id: "gratitude", name: "Gratitude & Praise", count: 21,
    bg: "#E8EDE0", accent: "#8AA870",
    illustration: "botanical", // leaf/plant scene
  },
  {
    id: "forgive", name: "Forgiveness", count: 18,
    bg: "#E8EAE0", accent: "#A0A878",
    illustration: "grass",
  },
  {
    id: "guidance", name: "Guidance & Knowledge", count: 23,
    bg: "#EDE8DC", accent: "#C0A870",
    illustration: "flower",
  },
  {
    id: "protect", name: "Protection", count: 20,
    bg: "#E0E8E4", accent: "#78A890",
    illustration: "mountain",
  },
  {
    id: "patience", name: "Patience & Trust", count: 19,
    bg: "#E8EDE0", accent: "#90A878",
    illustration: "botanical",
  },
  {
    id: "provision", name: "Provision & Rizq", count: 17,
    bg: "#EDE8DC", accent: "#A89060",
    illustration: "grass",
  },
];

// ── SVG illustrations matching mockup style (botanical / landscape) ────────────

function BotanicalIllustration({ bg, accent, w, h }) {
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Rect width={w} height={h} fill={bg} />
      {/* Stem */}
      <Path d={`M${w*0.72} ${h} Q${w*0.7} ${h*0.6} ${w*0.68} ${h*0.2}`}
        stroke={accent} strokeWidth={1.5} fill="none" strokeLinecap="round"/>
      {/* Leaves */}
      <Path d={`M${w*0.68} ${h*0.45} Q${w*0.5} ${h*0.3} ${w*0.48} ${h*0.55}`}
        stroke={accent} strokeWidth={1} fill={accent} fillOpacity={0.35}/>
      <Path d={`M${w*0.7} ${h*0.32} Q${w*0.88} ${h*0.22} ${w*0.85} ${h*0.42}`}
        stroke={accent} strokeWidth={1} fill={accent} fillOpacity={0.35}/>
      <Path d={`M${w*0.68} ${h*0.6} Q${w*0.52} ${h*0.5} ${w*0.5} ${h*0.68}`}
        stroke={accent} strokeWidth={1} fill={accent} fillOpacity={0.25}/>
      {/* Small stem */}
      <Path d={`M${w*0.2} ${h} Q${w*0.22} ${h*0.7} ${w*0.25} ${h*0.55}`}
        stroke={accent} strokeWidth={1} fill="none" strokeLinecap="round" opacity={0.5}/>
      <Path d={`M${w*0.25} ${h*0.55} Q${w*0.15} ${h*0.45} ${w*0.18} ${h*0.62}`}
        stroke={accent} strokeWidth={0.8} fill={accent} fillOpacity={0.2}/>
    </Svg>
  );
}

function GrassIllustration({ bg, accent, w, h }) {
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Rect width={w} height={h} fill={bg} />
      {/* Thin plant stems */}
      {[0.55,0.62,0.68,0.74,0.8].map((x, i) => (
        <Path key={i}
          d={`M${w*x} ${h} Q${w*(x-0.02)} ${h*(0.5-i*0.04)} ${w*(x+0.01)} ${h*(0.25-i*0.02)}`}
          stroke={accent} strokeWidth={0.8+i*0.1} fill="none" strokeLinecap="round" opacity={0.7+i*0.05}/>
      ))}
      {/* Seed head dots */}
      {[0.56,0.63,0.69,0.75].map((x, i) => (
        <Circle key={i} cx={w*(x+0.01)} cy={h*(0.24-i*0.02)} r={1.5} fill={accent} opacity={0.6}/>
      ))}
    </Svg>
  );
}

function FlowerIllustration({ bg, accent, w, h }) {
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Rect width={w} height={h} fill={bg} />
      {/* Main stem */}
      <Path d={`M${w*0.65} ${h} Q${w*0.63} ${h*0.65} ${w*0.62} ${h*0.42}`}
        stroke={accent} strokeWidth={1.5} fill="none" strokeLinecap="round"/>
      {/* Flower head */}
      {[0,60,120,180,240,300].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const cx = w*0.62 + Math.cos(rad)*8;
        const cy = h*0.38 + Math.sin(rad)*8;
        return <Ellipse key={i} cx={cx} cy={cy} rx={5} ry={3}
          fill={accent} opacity={0.45}
          transform={`rotate(${deg},${cx},${cy})`}/>;
      })}
      <Circle cx={w*0.62} cy={h*0.38} r={4} fill={accent} opacity={0.7}/>
      {/* Side leaf */}
      <Path d={`M${w*0.63} ${h*0.6} Q${w*0.45} ${h*0.5} ${w*0.48} ${h*0.65}`}
        stroke={accent} strokeWidth={1} fill={accent} fillOpacity={0.3}/>
    </Svg>
  );
}

function MountainIllustration({ bg, accent, w, h }) {
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Rect width={w} height={h} fill={bg} />
      {/* Far mountain */}
      <Path d={`M0 ${h*0.8} L${w*0.3} ${h*0.45} L${w*0.6} ${h*0.8} Z`}
        fill={accent} fillOpacity={0.2} stroke="none"/>
      {/* Near mountain */}
      <Path d={`M${w*0.1} ${h} L${w*0.45} ${h*0.38} L${w*0.8} ${h} Z`}
        fill={accent} fillOpacity={0.35} stroke="none"/>
      {/* Mist lines */}
      <Path d={`M0 ${h*0.72} Q${w*0.3} ${h*0.68} ${w} ${h*0.72}`}
        stroke="#fff" strokeWidth={6} fill="none" opacity={0.4}/>
      <Path d={`M0 ${h*0.78} Q${w*0.4} ${h*0.74} ${w} ${h*0.78}`}
        stroke="#fff" strokeWidth={4} fill="none" opacity={0.3}/>
    </Svg>
  );
}

function CardIllustration({ type, bg, accent, w, h }) {
  if (type === "mountain") return <MountainIllustration bg={bg} accent={accent} w={w} h={h}/>;
  if (type === "flower")   return <FlowerIllustration   bg={bg} accent={accent} w={w} h={h}/>;
  if (type === "grass")    return <GrassIllustration    bg={bg} accent={accent} w={w} h={h}/>;
  return                          <BotanicalIllustration bg={bg} accent={accent} w={w} h={h}/>;
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function DuaLibraryScreen({ navigation }) {
  const { colors } = useAccessibility();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [filter, setFilter] = useState("By Theme");
  const [query, setQuery]   = useState("");

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation?.goBack?.()} style={s.backBtn}>
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Dua Library</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Search */}
        <View style={s.searchBar}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search duas..."
            placeholderTextColor={colors.placeholder}
            value={query}
            onChangeText={setQuery}
          />
          <TouchableOpacity>
            <Text style={{ fontSize: 16, color: colors.subtext }}>⚙</Text>
          </TouchableOpacity>
        </View>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[s.filterChip, filter === f && s.filterChipActive]}
              onPress={() => setFilter(f)} activeOpacity={0.8}
            >
              <Text style={[s.filterChipText, filter === f && s.filterChipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Category grid */}
        <View style={s.grid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[s.card, { width: CARD_W }]}
              onPress={() => navigation?.navigate?.("DuaCategory", { category: cat })}
              activeOpacity={0.88}
            >
              <View style={[s.cardImage, { height: CARD_H * 0.58, overflow: "hidden", borderTopLeftRadius: radius.md, borderTopRightRadius: radius.md }]}>
                <CardIllustration
                  type={cat.illustration}
                  bg={cat.bg}
                  accent={cat.accent}
                  w={CARD_W}
                  h={CARD_H * 0.58}
                />
              </View>
              <View style={s.cardBody}>
                <Text style={s.cardName}>{cat.name}</Text>
                <Text style={s.cardCount}>{cat.count} duas</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <ScholarlyFootnote />
        <View style={{ height: spacing(4) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: spacing(3) },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing(2.5), paddingTop: spacing(2), paddingBottom: spacing(1.5),
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  backArrow: { fontSize: 22, color: colors.text },
  headerTitle: { fontFamily: SERIF, fontSize: 22, color: colors.text },

  searchBar: {
    flexDirection: "row", alignItems: "center", gap: spacing(1),
    backgroundColor: colors.card, borderRadius: radius.pill,
    paddingHorizontal: spacing(2), paddingVertical: spacing(1.25),
    marginHorizontal: spacing(2.5), borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing(1.5), ...shadows.card,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, fontSize: typography.body, color: colors.text, padding: 0 },

  filterRow: { paddingHorizontal: spacing(2.5), gap: spacing(1), paddingBottom: spacing(1.5) },
  filterChip: {
    paddingHorizontal: spacing(1.75), paddingVertical: spacing(0.75),
    borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.card,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { fontSize: typography.small, color: colors.subtext },
  filterChipTextActive: { color: "#fff", fontWeight: "500" },

  grid: {
    flexDirection: "row", flexWrap: "wrap", gap: spacing(1.5),
    paddingHorizontal: spacing(2.5),
  },
  card: {
    backgroundColor: colors.card, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, overflow: "hidden", ...shadows.card,
  },
  cardImage: {},
  cardBody: { padding: spacing(1.25) },
  cardName: { fontFamily: SERIF, fontSize: typography.small, color: colors.text, lineHeight: 18, marginBottom: 3 },
  cardCount: { fontSize: typography.tiny, color: colors.subtext },
});
