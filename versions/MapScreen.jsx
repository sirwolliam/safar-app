import React, { useState } from "react";
import {
  SafeAreaView, View, Text, ScrollView,
  TouchableOpacity, StyleSheet,
} from "react-native";
import Svg, {
  Rect, Circle, Ellipse, Path, G, Line,
  Defs, RadialGradient, Stop, Image as SvgImage,
} from "react-native-svg";
import { colors, spacing, radius, typography, shadows } from "../theme";

const MAP_H = 340;
const VW = 400;
const VH = 340;

// ── Makkah sites — positions matched to reference image ───────────────────────
// Reference: aerial view, Kaaba dead centre, octagonal mataf
// Maqam Ibrahim — NE of Kaaba
// Yemeni Corner — SW corner of Kaaba
// Safa — south corridor left end
// Marwah — south corridor right end
// Hijr Ismail — north arc of Kaaba
const MAKKAH_SITES = [
  {
    id: "kaaba",
    name: "Al-Kaʿbah",
    arabic: "الكَعبَة",
    subtitle: "The Most Sacred House",
    duaCount: 12,
    cx: 200, cy: 158,
  },
  {
    id: "maqam",
    name: "Maqām Ibrāhīm",
    arabic: "مَقَامُ إبْرَاهِيم",
    subtitle: "Station of Prophet Ibrāhīm",
    duaCount: 5,
    cx: 226, cy: 118,
  },
  {
    id: "yemeni",
    name: "Al-Rukn al-Yamānī",
    arabic: "الرُكْن اليَمَانِي",
    subtitle: "The Yemeni Corner",
    duaCount: 3,
    cx: 168, cy: 168,
  },
  {
    id: "safa",
    name: "Ṣafā",
    arabic: "الصَّفَا",
    subtitle: "Start of Saʿy",
    duaCount: 6,
    cx: 138, cy: 242,
  },
  {
    id: "marwah",
    name: "Marwah",
    arabic: "المَرْوَة",
    subtitle: "End of Saʿy",
    duaCount: 4,
    cx: 268, cy: 242,
  },
  {
    id: "hijr",
    name: "Hijr Ismāʿīl",
    arabic: "حِجْر إسمَاعِيل",
    subtitle: "The Sacred Enclosure",
    duaCount: 4,
    cx: 200, cy: 132,
  },
];

// ── Madinah sites — positions matched to reference image ──────────────────────
// Reference: isometric view looking NW, Nabawi mosque centre-left
// Green Dome — inside mosque slightly right of centre
// Rawdah — between pulpit and tomb, right of green dome
// As-Suffah — platform at rear/south of mosque
// Baqee — cemetery east of mosque
// Quba — separate mosque top-left area
// Jabal Uhud — far north top of image
// Jabal al-Rahmah — bottom left (this is actually in Arafat but shown here)
const MADINAH_SITES = [
  {
    id: "nabawi",
    name: "Al-Masjid an-Nabawī",
    arabic: "المَسجِد النَّبَوِي",
    subtitle: "The Prophet’s Mosque",
    duaCount: 8,
    cx: 188, cy: 178,
    description: "Built by the Prophet ﷺ after the Hijrah in 622 CE. A prayer here equals 1,000 prayers elsewhere, except al-Masjid al-Ḥarām.",
  },
  {
    id: "greendome",
    name: "The Green Dome",
    arabic: "القُبَّة الخَضْرَاء",
    subtitle: "Tomb of the Prophet ﷺ",
    duaCount: 6,
    cx: 218, cy: 195,
    description: "The resting place of the Prophet Muhammad ﷺ. Sending salām upon him here is among the most virtuous acts a visitor can perform.",
  },
  {
    id: "rawdah",
    name: "Riāḍ al-Jannah",
    arabic: "رِيَاض الجَنَّة",
    subtitle: "Al-Rawdah al-Sharīfah",
    duaCount: 5,
    cx: 248, cy: 210,
    description: "The area between the Prophet’s ﷺ grave and his pulpit — a garden from the gardens of Paradise.",
  },
  {
    id: "suffah",
    name: "As-Ṣuffah",
    arabic: "الصُّفَّة",
    subtitle: "Platform of the Companions",
    duaCount: 2,
    cx: 268, cy: 238,
    description: "The raised platform at the rear of the mosque where poor Companions lived and devoted themselves to learning from the Prophet ﷺ.",
  },
  {
    id: "baqee",
    name: "Jannat al-Baqīʿ",
    arabic: "جَنَّة البَقِيع",
    subtitle: "Baqīʿ Cemetery",
    duaCount: 3,
    cx: 298, cy: 162,
    description: "The main cemetery of Madīnah where many Companions and family of the Prophet ﷺ are buried.",
  },
  {
    id: "quba",
    name: "Masjid Qubāʾ",
    arabic: "مَسجِد قُبَاء",
    subtitle: "First Mosque in Islam",
    duaCount: 4,
    cx: 118, cy: 118,
    description: "The first mosque built in Islam. Two rakʿahs here equals the reward of an ʿUmrah.",
  },
  {
    id: "uhud",
    name: "Jabal Uhud",
    arabic: "جَبَل أُحُد",
    subtitle: "Mount Uhud",
    duaCount: 2,
    cx: 298, cy: 52,
    description: "The site of the Battle of Uhud. The Prophet ﷺ said: ‘Uhud is a mountain that loves us and we love it.’",
  },
  {
    id: "rahmah",
    name: "Jabal al-Raḥmah",
    arabic: "جَبَل الرَّحْمَة",
    subtitle: "Mount of Mercy — Arafāt",
    duaCount: 3,
    cx: 78, cy: 292,
    description: "The hill in Arafāt where the Prophet ﷺ delivered his Farewell Sermon. Standing here during Hajj is one of its essential pillars.",
  },
];

// ── Makkah SVG (static — no animation) ───────────────────────────────────────
const KX = 200;
const KY = 158;

function MakkahMap({ selectedId, onSelectSite }) {
  return (
    <Svg width="100%" height={MAP_H} viewBox={"0 0 " + VW + " " + VH} preserveAspectRatio="xMidYMid slice">
      <Defs>
        <RadialGradient id="mk_gnd" cx="50%" cy="50%" r="65%">
          <Stop offset="0%"   stopColor="#EDE6D8" />
          <Stop offset="50%"  stopColor="#E0D8C8" />
          <Stop offset="100%" stopColor="#CEC4B0" />
        </RadialGradient>
        <RadialGradient id="mk_court" cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor="#EAE2D0" />
          <Stop offset="100%" stopColor="#DDD5C2" />
        </RadialGradient>
        <RadialGradient id="mk_sepia" cx="50%" cy="50%" r="70%">
          <Stop offset="0%"   stopColor="#C09050" stopOpacity="0.04" />
          <Stop offset="100%" stopColor="#907040" stopOpacity="0.13" />
        </RadialGradient>
      </Defs>

      {/* Ground */}
      <Rect x="0" y="0" width={VW} height={VH} fill="url(#mk_gnd)" />

      {/* Outer mosque — octagonal shape matching reference */}
      <Path
        d={"M "+(KX-90)+" "+(KY-145)+" L "+(KX+90)+" "+(KY-145)+" L "+(KX+158)+" "+(KY-80)+" L "+(KX+158)+" "+(KY+80)+" L "+(KX+90)+" "+(KY+125)+" L "+(KX-90)+" "+(KY+125)+" L "+(KX-158)+" "+(KY+80)+" L "+(KX-158)+" "+(KY-80)+" Z"}
        fill="#D6CEBC" stroke="#C0B8A4" strokeWidth={1.8}
      />

      {/* Arcade columns grid */}
      {[-132,-108,-84,-60,-36,-12,12,36,60,84,108,132].map((dx,i) => (
        <Line key={"vc"+i} x1={KX+dx} y1={KY-140} x2={KX+dx} y2={KY+120} stroke="#C4BCA8" strokeWidth={0.35} opacity={0.55} />
      ))}
      {[-120,-96,-72,-48,-24,0,24,48,72,96].map((dy,i) => (
        <Line key={"hr"+i} x1={KX-155} y1={KY+dy} x2={KX+155} y2={KY+dy} stroke="#C4BCA8" strokeWidth={0.35} opacity={0.55} />
      ))}

      {/* Inner courtyard */}
      <Ellipse cx={KX} cy={KY} rx={118} ry={105} fill="url(#mk_court)" stroke="#C8C0AC" strokeWidth={1.2} />

      {/* Mataf tawaf rings */}
      {[95, 75, 58].map((r,i) => (
        <Ellipse key={"tr"+i} cx={KX} cy={KY} rx={r} ry={r*0.88}
          fill="none" stroke="rgba(110,98,78,0.22)"
          strokeWidth={i===0?1.2:0.7} strokeDasharray={i===1?"5 4":undefined} />
      ))}

      {/* Mataf floor */}
      <Ellipse cx={KX} cy={KY} rx={48} ry={42} fill="#DDD5C0" stroke="#C8C0AA" strokeWidth={1} />

      {/* Pilgrim dots */}
      {Array.from({length:130},(_,i) => {
        const angle = (i/130)*Math.PI*2;
        const r = 50+(i%4)*10+(i%9)*2.2;
        return <Circle key={"cd"+i} cx={KX+Math.cos(angle)*r} cy={KY+Math.sin(angle)*r*0.88} r={1.1} fill="rgba(108,96,76,0.40)" />;
      })}

      {/* Kaaba */}
      <Rect x={KX-13} y={KY-16} width={26} height={32} rx={2} fill="#12100A" stroke="rgba(200,169,106,0.80)" strokeWidth={1.8} />
      <Rect x={KX-13} y={KY-5}  width={26} height={7}  fill="rgba(200,169,106,0.60)" />
      <Rect x={KX-5}  y={KY+10} width={10} height={6} rx={2} fill="rgba(200,169,106,0.50)" />

      {/* Hijr Ismail semicircle — north of Kaaba */}
      <Path
        d={"M "+(KX-13)+" "+(KY-16)+" A 22 22 0 0 1 "+(KX+13)+" "+(KY-16)}
        fill="rgba(230,220,200,0.60)" stroke="rgba(140,120,80,0.45)" strokeWidth={1.5}
      />

      {/* Safa-Marwah corridor — south, horizontal */}
      <Rect x={KX-88} y={KY+108} width={176} height={14} rx={5}
        fill="#CACAB8" stroke="#B8B6A4" strokeWidth={1} />
      <Line x1={KX-80} y1={KY+115} x2={KX+80} y2={KY+115}
        stroke="#A8A898" strokeWidth={0.6} strokeDasharray="4 5" />

      {/* 4 corner minarets */}
      {[[KX-148,KY-128],[KX+148,KY-128],[KX-148,KY+108],[KX+148,KY+108]].map(([mx,my],i) => (
        <G key={"mn"+i}>
          <Circle cx={mx} cy={my} r={7}   fill="#BCBAA8" stroke="#A2A090" strokeWidth={1} />
          <Circle cx={mx} cy={my} r={3.5} fill="#D4D2C0" />
        </G>
      ))}

      {/* Sepia overlay */}
      <Rect x="0" y="0" width={VW} height={VH} fill="url(#mk_sepia)" />

      {/* ── Pins ── */}
      {MAKKAH_SITES.filter(s => s.id !== "kaaba").map(site => {
        const sel = site.id === selectedId;
        return (
          <G key={site.id} onPress={() => onSelectSite(site)}>
            <Circle cx={site.cx} cy={site.cy} r={sel?20:15}
              fill={sel?"rgba(47,93,80,0.22)":"rgba(47,93,80,0.10)"} />
            {sel && <Circle cx={site.cx} cy={site.cy} r={27}
              fill="none" stroke="rgba(47,93,80,0.15)" strokeWidth={1.5} />}
            <Circle cx={site.cx} cy={site.cy} r={12}
              fill={sel?colors.primary:"rgba(255,255,255,0.93)"}
              stroke={colors.primary} strokeWidth={1.5} />
            <Circle cx={site.cx} cy={site.cy} r={4}
              fill={sel?"rgba(255,255,255,0.9)":colors.primary} />
          </G>
        );
      })}

      {/* Kaaba tap zone */}
      <Circle cx={KX} cy={KY} r={26} fill="transparent"
        onPress={() => onSelectSite(MAKKAH_SITES[0])} />
    </Svg>
  );
}

// ── Madinah SVG (static — no animation) ──────────────────────────────────────
// Isometric perspective — mosque is centre-left, baqee right, quba top-left
const NX = 188;
const NY = 185;

function MadinahMap({ selectedId, onSelectSite }) {
  return (
    <Svg width="100%" height={MAP_H} viewBox={"0 0 " + VW + " " + VH} preserveAspectRatio="xMidYMid slice">
      <Defs>
        <RadialGradient id="md_gnd" cx="50%" cy="50%" r="75%">
          <Stop offset="0%"   stopColor="#EDE8DA" />
          <Stop offset="60%"  stopColor="#DDD5C4" />
          <Stop offset="100%" stopColor="#C8BEAA" />
        </RadialGradient>
        <RadialGradient id="md_court" cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor="#E8E0CE" />
          <Stop offset="100%" stopColor="#D8CFBC" />
        </RadialGradient>
        <RadialGradient id="md_sepia" cx="50%" cy="50%" r="70%">
          <Stop offset="0%"   stopColor="#A08040" stopOpacity="0.03" />
          <Stop offset="100%" stopColor="#806030" stopOpacity="0.11" />
        </RadialGradient>
      </Defs>

      {/* Sky/ground */}
      <Rect x="0" y="0" width={VW} height={VH} fill="url(#md_gnd)" />

      {/* City blocks background — isometric feel */}
      {[
        [20, 20, 80, 55], [115, 20, 70, 45], [210, 20, 60, 40],
        [20, 90, 55, 60],
        [310, 80, 70, 55], [310, 150, 70, 55],
        [20, 260, 80, 60], [120, 290, 60, 45], [220, 290, 80, 45],
      ].map(([x,y,w,h],i) => (
        <Rect key={"blk"+i} x={x} y={y} width={w} height={h} rx={3}
          fill="rgba(210,200,182,0.55)" stroke="rgba(190,180,160,0.40)" strokeWidth={0.8} />
      ))}

      {/* ── Main mosque outer plaza ── */}
      <Rect x={NX-130} y={NY-130} width={268} height={232} rx={14}
        fill="#D8D0BE" stroke="#C0B8A6" strokeWidth={1.5} opacity={0.9} />

      {/* Mosque arcade grid */}
      {[-110,-88,-66,-44,-22,0,22,44,66,88,110].map((dx,i) => (
        <Line key={"nvc"+i} x1={NX+dx} y1={NY-128} x2={NX+dx} y2={NY+100}
          stroke="#C2BAA6" strokeWidth={0.35} opacity={0.5} />
      ))}
      {[-108,-86,-64,-42,-20,0,20,42,64,86].map((dy,i) => (
        <Line key={"nhr"+i} x1={NX-128} y1={NY+dy} x2={NX+136} y2={NY+dy}
          stroke="#C2BAA6" strokeWidth={0.35} opacity={0.5} />
      ))}

      {/* Inner prayer hall */}
      <Rect x={NX-108} y={NY-108} width={220} height={180} rx={8}
        fill="url(#md_court)" stroke="#C4BCA8" strokeWidth={1.2} />

      {/* Umbrella canopies — iconic Nabawi feature, grid pattern */}
      {[
        [NX-85,NY-75],[NX-55,NY-75],[NX-25,NY-75],[NX+5,NY-75],[NX+35,NY-75],[NX+65,NY-75],[NX+95,NY-75],
        [NX-85,NY-45],[NX-55,NY-45],[NX-25,NY-45],[NX+5,NY-45],[NX+35,NY-45],[NX+65,NY-45],[NX+95,NY-45],
        [NX-85,NY-15],[NX-55,NY-15],[NX-25,NY-15],[NX+5,NY-15],[NX+35,NY-15],[NX+65,NY-15],[NX+95,NY-15],
        [NX-85,NY+15],[NX-55,NY+15],[NX-25,NY+15],[NX+5,NY+15],[NX+35,NY+15],[NX+65,NY+15],[NX+95,NY+15],
      ].map(([ux,uy],i) => (
        <G key={"umb"+i}>
          <Circle cx={ux} cy={uy} r={13}
            fill="rgba(225,215,195,0.50)" stroke="rgba(185,175,152,0.55)" strokeWidth={0.6} />
          <Circle cx={ux} cy={uy} r={2} fill="rgba(160,148,120,0.65)" />
        </G>
      ))}

      {/* Green Dome — distinctive landmark, right of centre */}
      <Circle cx={NX+30} cy={NY-22} r={22}
        fill="rgba(55,105,75,0.22)" stroke="rgba(55,105,75,0.45)" strokeWidth={1.5} />
      <Circle cx={NX+30} cy={NY-22} r={14}
        fill="rgba(55,105,75,0.35)" stroke="rgba(55,105,75,0.60)" strokeWidth={1} />
      <Circle cx={NX+30} cy={NY-22} r={6}
        fill="rgba(55,105,75,0.65)" />

      {/* Mihrab south wall */}
      <Path d={"M "+(NX-12)+" "+(NY+70)+" Q "+NX+" "+(NY+60)+" "+(NX+12)+" "+(NY+70)}
        fill="rgba(180,160,100,0.40)" stroke="rgba(160,130,70,0.5)" strokeWidth={1} />

      {/* 10 minarets around mosque */}
      {[
        [NX-125,NY-125],[NX+130,NY-125],
        [NX-125,NY+98], [NX+130,NY+98],
        [NX-60, NY-125],[NX+0,  NY-125],[NX+60, NY-125],
        [NX-60, NY+98], [NX+0,  NY+98], [NX+60, NY+98],
      ].map(([mx,my],i) => (
        <G key={"nmn"+i}>
          <Circle cx={mx} cy={my} r={7}   fill="#B8B6A4" stroke="#A0A090" strokeWidth={1} />
          <Circle cx={mx} cy={my} r={3.5} fill="#CCCAB8" />
        </G>
      ))}

      {/* Al-Rawdah garden — green tinted rectangle inside mosque */}
      <Rect x={NX+10} y={NY-50} width={88} height={70} rx={5}
        fill="rgba(170,195,160,0.28)" stroke="rgba(95,135,85,0.35)" strokeWidth={1} />

      {/* Baqee cemetery — east of mosque */}
      <Rect x={NX+148} y={NY-78} width={90} height={75} rx={8}
        fill="rgba(198,192,174,0.60)" stroke="#B8B0A0" strokeWidth={1} />
      {[NX+158,NX+172,NX+186,NX+200,NX+214,NX+228].map((gx,i) =>
        [NY-65,NY-50,NY-35,NY-20].map((gy,j) => (
          <Rect key={"gr"+i+j} x={gx-3} y={gy-4} width={6} height={9} rx={1}
            fill="rgba(165,155,132,0.65)" />
        ))
      )}

      {/* Quba mosque — top left quadrant */}
      <Rect x={58} y={88} width={58} height={48} rx={6}
        fill="#D0C8B6" stroke="#B8B0A0" strokeWidth={1} />
      <Path d="M 70 88 Q 87 75 105 88"
        fill="rgba(205,195,175,0.75)" stroke="#B0A890" strokeWidth={1} />
      <Circle cx={62}  cy={90} r={4.5} fill="#C0B8A8" stroke="#A8A090" strokeWidth={0.8} />
      <Circle cx={112} cy={90} r={4.5} fill="#C0B8A8" stroke="#A8A090" strokeWidth={0.8} />
      <Circle cx={87}  cy={90} r={4.5} fill="#C0B8A8" stroke="#A8A090" strokeWidth={0.8} />

      {/* Jabal Uhud — mountain suggestion top right */}
      <Path d="M 258 62 L 298 18 L 338 62 Z"
        fill="rgba(195,185,165,0.55)" stroke="rgba(170,158,135,0.50)" strokeWidth={1} />
      <Path d="M 268 62 L 298 28 L 328 62 Z"
        fill="rgba(210,200,180,0.40)" />

      {/* Jabal al-Rahmah — hill suggestion bottom left */}
      <Path d="M 40 318 L 78 278 L 116 318 Z"
        fill="rgba(195,185,165,0.55)" stroke="rgba(170,158,135,0.50)" strokeWidth={1} />
      <Path d="M 52 318 L 78 288 L 104 318 Z"
        fill="rgba(210,200,180,0.40)" />

      {/* Sepia overlay */}
      <Rect x="0" y="0" width={VW} height={VH} fill="url(#md_sepia)" />

      {/* ── Pins ── */}
      {MADINAH_SITES.map(site => {
        const sel = site.id === selectedId;
        return (
          <G key={site.id} onPress={() => onSelectSite(site)}>
            <Circle cx={site.cx} cy={site.cy} r={sel?20:15}
              fill={sel?"rgba(47,93,80,0.22)":"rgba(47,93,80,0.10)"} />
            {sel && <Circle cx={site.cx} cy={site.cy} r={27}
              fill="none" stroke="rgba(47,93,80,0.15)" strokeWidth={1.5} />}
            <Circle cx={site.cx} cy={site.cy} r={12}
              fill={sel?colors.primary:"rgba(255,255,255,0.93)"}
              stroke={colors.primary} strokeWidth={1.5} />
            <Circle cx={site.cx} cy={site.cy} r={4}
              fill={sel?"rgba(255,255,255,0.9)":colors.primary} />
          </G>
        );
      })}
    </Svg>
  );
}

// ── Madinah notice ────────────────────────────────────────────────────────────
function MadinahNotice() {
  return (
    <View style={mn.wrap}>
      <Text style={mn.text}>
        Visiting Madīnah is not part of the Hajj or Umrah rites, but is a beloved and highly recommended practice.
      </Text>
    </View>
  );
}
const mn = StyleSheet.create({
  wrap: {
    backgroundColor: "rgba(47,93,80,0.08)", borderRadius: radius.md,
    borderWidth: 1, borderColor: "rgba(47,93,80,0.15)",
    padding: spacing(1.5), marginHorizontal: spacing(2), marginTop: spacing(2),
  },
  text: { fontSize: typography.small, color: colors.primary, fontWeight: "300", lineHeight: typography.small*1.6 },
});

// ── Site card ─────────────────────────────────────────────────────────────────
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
        <Text style={sc.countLabel}>DuʿāʾS at this place</Text>
        <Text style={sc.countValue}>{site.duaCount} DuʿāʾS</Text>
      </View>
      <TouchableOpacity style={sc.btn} onPress={() => onViewDuas?.(site)} activeOpacity={0.88}>
        <Text style={sc.btnText}>View DuʿāʾS</Text>
        <Text style={sc.btnArrow}>→</Text>
      </TouchableOpacity>
    </View>
  );
}
const sc = StyleSheet.create({
  card: {
    backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1,
    borderColor: colors.border, marginHorizontal: spacing(2), marginTop: -spacing(2.5),
    padding: spacing(2.5), ...shadows.card,
  },
  handle: { width: 32, height: 3, borderRadius: 2, backgroundColor: colors.border, alignSelf: "center", marginBottom: spacing(2) },
  name:        { fontSize: typography.title,   fontWeight: "400", color: colors.text,    marginBottom: 2 },
  arabic:      { fontSize: typography.heading, color: colors.subtext, marginBottom: 2 },
  subtitle:    { fontSize: typography.small,   color: colors.subtext, fontWeight: "300", marginBottom: spacing(1) },
  description: { fontSize: typography.small, color: colors.subtext, fontWeight: "300", lineHeight: typography.small*1.65, marginBottom: spacing(1.5), paddingTop: spacing(1), borderTopWidth: 1, borderTopColor: colors.border },
  countRow:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: spacing(1.5), borderTopWidth: 1, borderTopColor: colors.border },
  countLabel:  { fontSize: typography.small, color: colors.subtext, fontWeight: "300" },
  countValue:  { fontSize: typography.small, color: colors.text,    fontWeight: "500" },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing(1), backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing(1.75), marginTop: spacing(2), ...shadows.button },
  btnText:  { fontSize: typography.body, color: colors.card,                fontWeight: "500" },
  btnArrow: { fontSize: typography.body, color: "rgba(255,255,255,0.65)" },
});

// ── Chips ─────────────────────────────────────────────────────────────────────
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
  row:    { paddingHorizontal: spacing(2), paddingVertical: spacing(1.5), gap: spacing(1) },
  pill:   { paddingHorizontal: spacing(1.75), paddingVertical: spacing(0.875), borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  pillOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  label:  { fontSize: typography.small, color: colors.subtext, fontWeight: "300" },
  labelOn:{ color: colors.card, fontWeight: "500" },
});

// ── Site list ─────────────────────────────────────────────────────────────────
function SiteList({ sites, selectedId, onSelect }) {
  return (
    <View style={lst.section}>
      <Text style={lst.sectionTitle}>All sacred sites</Text>
      {sites.map((s, i) => {
        const on = s.id === selectedId;
        return (
          <TouchableOpacity key={s.id}
            style={[lst.row, i === sites.length-1 && lst.rowLast]}
            onPress={() => onSelect(s)} activeOpacity={0.85}>
            <View style={[lst.dot, on && lst.dotOn]} />
            <View style={lst.info}>
              <Text style={[lst.name, on && lst.nameOn]}>{s.name}</Text>
              <Text style={lst.sub}>{s.subtitle}</Text>
            </View>
            <Text style={[lst.count, on && lst.countOn]}>{s.duaCount} duas</Text>
            <Text style={lst.arrow}>›</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
const lst = StyleSheet.create({
  section:      { paddingHorizontal: spacing(2), paddingTop: spacing(2.5) },
  sectionTitle: { fontSize: typography.tiny, fontWeight: "600", color: colors.subtext, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: spacing(1.5) },
  row:     { flexDirection: "row", alignItems: "center", gap: spacing(1.5), paddingVertical: spacing(2), borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLast: { borderBottomWidth: 0 },
  dot:     { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border, flexShrink: 0 },
  dotOn:   { backgroundColor: colors.primary },
  info:    { flex: 1 },
  name:    { fontSize: typography.body, fontWeight: "400", color: colors.text, marginBottom: 2 },
  nameOn:  { color: colors.primary, fontWeight: "500" },
  sub:     { fontSize: typography.small, color: colors.subtext, fontWeight: "300" },
  count:   { fontSize: typography.small, color: colors.subtext, fontWeight: "300" },
  countOn: { color: colors.primary, fontWeight: "500" },
  arrow:   { fontSize: 18, color: colors.border, lineHeight: 22 },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function MapScreen({ navigation }) {
  const [city,     setCity]     = useState("Makkah");
  const [selected, setSelected] = useState(MAKKAH_SITES[0]);

  const sites = city === "Makkah" ? MAKKAH_SITES : MADINAH_SITES;

  const handleSelectSite = (site) => setSelected(site);
  const handleCitySwitch = (c) => {
    setCity(c);
    setSelected(c === "Makkah" ? MAKKAH_SITES[0] : MADINAH_SITES[0]);
  };

  return (
    <SafeAreaView style={styles.safe}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation?.goBack?.()}>
          <Text style={styles.iconBtnTxt}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Sacred Places</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={styles.iconBtnTxt}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* City toggle */}
      <View style={styles.cityToggle}>
        {["Makkah","Madinah"].map(c => {
          const on = c === city;
          return (
            <TouchableOpacity key={c}
              style={[styles.cityOpt, on && styles.cityOptOn]}
              onPress={() => handleCitySwitch(c)} activeOpacity={0.8}>
              <Text style={[styles.cityLabel, on && styles.cityLabelOn]}>{c}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>

        {/* Map — static, no animation */}
        <View style={styles.mapWrap}>
          {city === "Makkah"
            ? <MakkahMap  selectedId={selected?.id} onSelectSite={handleSelectSite} />
            : <MadinahMap selectedId={selected?.id} onSelectSite={handleSelectSite} />
          }
        </View>

        {city === "Madinah" && <MadinahNotice />}

        <SiteCard
          site={selected}
          onViewDuas={s => navigation?.navigate?.("SiteDuas", { site: s })}
        />
        <NearbyChips sites={sites} selectedId={selected?.id} onSelect={handleSelectSite} />
        <SiteList    sites={sites} selectedId={selected?.id} onSelect={handleSelectSite} />

        <View style={{ height: spacing(5) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing(2), paddingVertical: spacing(1.5),
    borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    alignItems: "center", justifyContent: "center", ...shadows.card,
  },
  iconBtnTxt: { fontSize: 20, color: colors.text, lineHeight: 24 },
  title: { fontSize: typography.heading, fontWeight: "500", color: colors.text },
  cityToggle: {
    flexDirection: "row", backgroundColor: "rgba(200,190,170,0.25)",
    borderRadius: radius.md, padding: 3, borderWidth: 1, borderColor: colors.border,
    marginHorizontal: spacing(2), marginVertical: spacing(1.5),
  },
  cityOpt:     { flex: 1, paddingVertical: spacing(1), borderRadius: radius.sm, alignItems: "center" },
  cityOptOn:   { backgroundColor: colors.primary, shadowColor: colors.primary, shadowOffset: { width:0, height:2 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 4 },
  cityLabel:   { fontSize: typography.body, color: colors.subtext, fontWeight: "300" },
  cityLabelOn: { color: colors.card, fontWeight: "500" },
  mapWrap:     { backgroundColor: "#E8E0CE", overflow: "hidden" },
});
