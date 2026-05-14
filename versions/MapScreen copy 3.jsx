import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import Svg, {
  Rect, Circle, Ellipse, Path, G,
  Line, Defs, RadialGradient, Stop,
} from "react-native-svg";
import { colors, spacing, radius, typography, shadows } from "../theme";

const { width: SW } = Dimensions.get("window");
const MAP_H = 300;
const VW = 400; // SVG viewBox width
const VH = 300; // SVG viewBox height
const KX = 200; // Kaaba centre X
const KY = 145; // Kaaba centre Y

// ─── Sacred site definitions ──────────────────────────────────────────────────
const SITES = [
  {
    id: "kaaba",
    name: "Al-Kaʿbah",
    arabic: "الكَعبَة",
    subtitle: "The Most Sacred House",
    duaCount: 12,
    cx: KX, cy: KY,
  },
  {
    id: "maqam",
    name: "Maqām Ibrāhīm",
    arabic: "مَقَامُ إِبْرَاهِيم",
    subtitle: "Station of Prophet Ibrāhīm",
    duaCount: 5,
    cx: 242, cy: 108,
  },
  {
    id: "zamzam",
    name: "Zamzam",
    arabic: "زَمْزَم",
    subtitle: "The Blessed Well",
    duaCount: 4,
    cx: 238, cy: 175,
  },
  {
    id: "safa",
    name: "Ṣafā & Marwah",
    arabic: "الصَّفَا وَالْمَرْوَة",
    subtitle: "Place of Saʿy",
    duaCount: 8,
    cx: 316, cy: 145,
  },
];

// ─── SVG aerial map ───────────────────────────────────────────────────────────
function AerialMap({ selectedId, onSelectSite }) {
  return (
    <Svg
      width="100%"
      height={MAP_H}
      viewBox={`0 0 ${VW} ${VH}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <Defs>
        <RadialGradient id="gnd" cx="50%" cy="50%" r="65%">
          <Stop offset="0%"   stopColor="#EDE6D8" />
          <Stop offset="50%"  stopColor="#E0D8C8" />
          <Stop offset="100%" stopColor="#CEC4B0" />
        </RadialGradient>
        <RadialGradient id="sepia" cx="50%" cy="50%" r="70%">
          <Stop offset="0%"   stopColor="#C09050" stopOpacity="0.04" />
          <Stop offset="100%" stopColor="#907040" stopOpacity="0.13" />
        </RadialGradient>
        <RadialGradient id="courtGrad" cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor="#EAE2D0" />
          <Stop offset="100%" stopColor="#DDD5C2" />
        </RadialGradient>
      </Defs>

      {/* Ground */}
      <Rect x="0" y="0" width={VW} height={VH} fill="url(#gnd)" />

      {/* Outer mosque building */}
      <Rect
        x={KX - 158} y={KY - 118}
        width={316} height={236}
        rx={18} fill="#D6CEBC"
        stroke="#C0B8A4" strokeWidth={1.8}
      />

      {/* Arcade grid — vertical columns */}
      {[-132,-108,-84,-60,-36,-12,12,36,60,84,108,132].map((dx, i) => (
        <Line key={`vc${i}`}
          x1={KX+dx} y1={KY-118} x2={KX+dx} y2={KY+118}
          stroke="#C4BCA8" strokeWidth={0.35} opacity={0.55}
        />
      ))}
      {/* horizontal rows */}
      {[-96,-72,-48,-24,0,24,48,72,96].map((dy, i) => (
        <Line key={`hr${i}`}
          x1={KX-158} y1={KY+dy} x2={KX+158} y2={KY+dy}
          stroke="#C4BCA8" strokeWidth={0.35} opacity={0.55}
        />
      ))}

      {/* Inner courtyard */}
      <Rect
        x={KX - 122} y={KY - 88}
        width={244} height={176}
        rx={10} fill="url(#courtGrad)"
        stroke="#C8C0AC" strokeWidth={1.2}
      />

      {/* Mataf tawaf rings */}
      {[106, 84, 66].map((r, i) => (
        <Ellipse key={`tr${i}`}
          cx={KX} cy={KY}
          rx={r} ry={r * 0.88}
          fill="none"
          stroke="rgba(110,98,78,0.20)"
          strokeWidth={i === 0 ? 1.2 : 0.75}
          strokeDasharray={i === 1 ? "5 4" : undefined}
        />
      ))}

      {/* Mataf floor */}
      <Ellipse
        cx={KX} cy={KY}
        rx={52} ry={46}
        fill="#DDD5C0"
        stroke="#C8C0AA" strokeWidth={1}
      />

      {/* Pilgrim crowd dots in tawaf band */}
      {Array.from({ length: 110 }, (_, i) => {
        const angle = (i / 110) * Math.PI * 2;
        const r = 56 + (i % 4) * 11 + (i % 11) * 2.5;
        return (
          <Circle key={`cd${i}`}
            cx={KX + Math.cos(angle) * r}
            cy={KY + Math.sin(angle) * r * 0.88}
            r={1.15}
            fill="rgba(108,96,76,0.42)"
          />
        );
      })}

      {/* The Kaaba — dark square */}
      <Rect
        x={KX - 14} y={KY - 17}
        width={28} height={34}
        rx={2}
        fill="#12100A"
        stroke="rgba(200,169,106,0.75)"
        strokeWidth={1.6}
      />
      {/* Kiswa gold band */}
      <Rect
        x={KX - 14} y={KY - 4}
        width={28} height={7}
        fill="rgba(200,169,106,0.58)"
      />
      {/* Door */}
      <Rect
        x={KX - 5} y={KY + 11}
        width={10} height={6}
        rx={2}
        fill="rgba(200,169,106,0.48)"
      />

      {/* 4 corner minarets */}
      {[
        [KX - 150, KY - 110],
        [KX + 150, KY - 110],
        [KX - 150, KY + 110],
        [KX + 150, KY + 110],
      ].map(([mx, my], i) => (
        <G key={`mn${i}`}>
          <Circle cx={mx} cy={my} r={7}   fill="#BCBAA8" stroke="#A2A090" strokeWidth={1}   />
          <Circle cx={mx} cy={my} r={3.5} fill="#D4D2C0" />
        </G>
      ))}

      {/* Masa corridor — Safa to Marwa (right side) */}
      <Rect
        x={KX + 152} y={KY - 64}
        width={17} height={128}
        rx={5}
        fill="#CACAB8" stroke="#B8B6A4" strokeWidth={1}
      />
      <Line
        x1={KX+160} y1={KY-58}
        x2={KX+160} y2={KY+58}
        stroke="#A8A898" strokeWidth={0.6}
        strokeDasharray="3 5"
      />

      {/* Hijr Ismail arc */}
      <Path
        d={`M ${KX - 14} ${KY - 17} A 20 20 0 0 1 ${KX + 14} ${KY - 17}`}
        fill="none" stroke="rgba(140,120,80,0.35)" strokeWidth={1.5}
      />

      {/* Sepia warmth overlay */}
      <Rect x="0" y="0" width={VW} height={VH} fill="url(#sepia)" />

      {/* Site pins (not Kaaba — it's implied by the rendered shape) */}
      {SITES.filter((s) => s.id !== "kaaba").map((site) => {
        const sel = site.id === selectedId;
        return (
          <G key={site.id} onPress={() => onSelectSite(site)}>
            {/* Outer glow ring */}
            <Circle
              cx={site.cx} cy={site.cy}
              r={sel ? 21 : 17}
              fill={sel ? "rgba(47,93,80,0.20)" : "rgba(47,93,80,0.10)"}
            />
            {/* Pin body */}
            <Circle
              cx={site.cx} cy={site.cy}
              r={13}
              fill={sel ? colors.primary : "rgba(255,255,255,0.93)"}
              stroke={colors.primary}
              strokeWidth={1.5}
            />
            {/* Inner dot */}
            <Circle
              cx={site.cx} cy={site.cy}
              r={4.5}
              fill={sel ? "rgba(255,255,255,0.9)" : colors.primary}
            />
          </G>
        );
      })}

      {/* Kaaba tap zone */}
      <Circle
        cx={KX} cy={KY} r={28}
        fill="transparent"
        onPress={() => onSelectSite(SITES[0])}
      />
    </Svg>
  );
}

// ─── Site bottom card ─────────────────────────────────────────────────────────
function SiteCard({ site, onViewDuas }) {
  if (!site) return null;
  return (
    <View style={sc.card}>
      <View style={sc.handle} />
      <Text style={sc.name}>{site.name}</Text>
      <Text style={sc.arabic}>{site.arabic}</Text>
      <Text style={sc.subtitle}>{site.subtitle}</Text>
      <View style={sc.countRow}>
        <Text style={sc.countLabel}>Duʿāʾs at this place</Text>
        <Text style={sc.countValue}>{site.duaCount} Duʿāʾs</Text>
      </View>
      <TouchableOpacity
        style={sc.btn}
        onPress={() => onViewDuas?.(site)}
        activeOpacity={0.88}
      >
        <Text style={sc.btnText}>View Duʿāʾs</Text>
        <Text style={sc.btnArrow}>→</Text>
      </TouchableOpacity>
    </View>
  );
}

const sc = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing(2),
    marginTop: -spacing(2.5),
    padding: spacing(2.5),
    ...shadows.card,
  },
  handle: {
    width: 32, height: 3,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: spacing(2),
  },
  name: {
    fontSize: 22,
    fontWeight: "400",
    color: colors.text,
    marginBottom: 2,
  },
  arabic: {
    fontSize: 18,
    color: colors.subtext,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: colors.subtext,
    fontWeight: "300",
    marginBottom: spacing(2),
  },
  countRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing(1.5),
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  countLabel: {
    fontSize: 14,
    color: colors.subtext,
    fontWeight: "300",
  },
  countValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing(1),
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing(1.75),
    marginTop: spacing(2),
    ...shadows.button,
  },
  btnText: {
    fontSize: 16,
    color: colors.card,
    fontWeight: "500",
  },
  btnArrow: {
    fontSize: 16,
    color: "rgba(255,255,255,0.65)",
  },
});

// ─── Nearby chips ─────────────────────────────────────────────────────────────
function NearbyChips({ sites, selectedId, onSelect }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={chip.row}
    >
      {sites.map((s) => {
        const on = s.id === selectedId;
        return (
          <TouchableOpacity
            key={s.id}
            style={[chip.pill, on && chip.pillOn]}
            onPress={() => onSelect(s)}
            activeOpacity={0.8}
          >
            <Text style={[chip.label, on && chip.labelOn]}>{s.name}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const chip = StyleSheet.create({
  row: {
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.5),
    gap: spacing(1),
  },
  pill: {
    paddingHorizontal: spacing(1.75),
    paddingVertical: spacing(0.875),
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    fontSize: 14,
    color: colors.subtext,
    fontWeight: "300",
  },
  labelOn: {
    color: colors.card,
    fontWeight: "500",
  },
});

// ─── All-sites list ───────────────────────────────────────────────────────────
function SiteList({ sites, selectedId, onSelect }) {
  return (
    <View style={list.section}>
      <Text style={list.sectionTitle}>All sacred sites</Text>
      {sites.map((s, i) => {
        const on = s.id === selectedId;
        const last = i === sites.length - 1;
        return (
          <TouchableOpacity
            key={s.id}
            style={[list.row, last && list.rowLast]}
            onPress={() => onSelect(s)}
            activeOpacity={0.85}
          >
            <View style={[list.dot, on && list.dotOn]} />
            <View style={list.info}>
              <Text style={[list.name, on && list.nameOn]}>{s.name}</Text>
              <Text style={list.sub}>{s.subtitle}</Text>
            </View>
            <Text style={[list.count, on && list.countOn]}>{s.duaCount} duʿāʾs</Text>
            <Text style={list.arrow}>›</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const list = StyleSheet.create({
  section: {
    paddingHorizontal: spacing(2),
    paddingTop: spacing(2.5),
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.subtext,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: spacing(1.5),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(1.5),
    paddingVertical: spacing(2),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLast: { borderBottomWidth: 0 },
  dot: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    flexShrink: 0,
  },
  dotOn: { backgroundColor: colors.primary },
  info: { flex: 1 },
  name: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.text,
    marginBottom: 2,
  },
  nameOn: { color: colors.primary, fontWeight: "500" },
  sub: {
    fontSize: 14,
    color: colors.subtext,
    fontWeight: "300",
  },
  count: {
    fontSize: 14,
    color: colors.subtext,
    fontWeight: "300",
  },
  countOn: { color: colors.primary, fontWeight: "500" },
  arrow: {
    fontSize: 18,
    color: colors.border,
    lineHeight: 22,
  },
});

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function MapScreen({ navigation }) {
  const [selected, setSelected] = useState(SITES[0]);

  return (
    <SafeAreaView style={styles.safe}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation?.goBack?.()}
        >
          <Text style={styles.iconBtnTxt}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Sacred Places</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={styles.iconBtnTxt}>🔍</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Aerial map */}
        <View style={styles.mapWrap}>
          <AerialMap selectedId={selected?.id} onSelectSite={setSelected} />
        </View>

        {/* Site card */}
        <SiteCard
          site={selected}
          onViewDuas={(s) => navigation?.navigate?.("SiteDuas", { site: s })}
        />

        {/* Nearby chips */}
        <NearbyChips
          sites={SITES}
          selectedId={selected?.id}
          onSelect={setSelected}
        />

        {/* Site list */}
        <SiteList
          sites={SITES}
          selectedId={selected?.id}
          onSelect={setSelected}
        />

        <View style={{ height: spacing(5) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.5),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  iconBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
  },
  iconBtnTxt: {
    fontSize: 20,
    color: colors.text,
    lineHeight: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "500",
    color: colors.text,
  },
  mapWrap: {
    backgroundColor: "#E6DECE",
    overflow: "hidden",
  },
});
