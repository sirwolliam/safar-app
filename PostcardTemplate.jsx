import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Defs, ClipPath, Image as SvgImage, LinearGradient as SvgGradient, Stop, Mask, Rect, Polygon } from "react-native-svg";
import { PATTERN_PATH } from "./screens/headerPatternPath";
import { MapPin, Mosque, HandHeart, Heart, StarAndCrescent } from "phosphor-react-native";

const SERIF = "SourceSerif4-Regular";
const CARD_BG = "#FDFAF4";
const ICONS = { MapPin, Mosque, HandHeart, Heart, StarAndCrescent };

function GoldPattern({ width, height = 400, opacity = 0.5 }) {
  const scale = width / 375;
  const vh = 133.62 * scale;
  const repeatCount = Math.ceil(height / vh);
  return (
    <View style={{ position: "absolute", top: 0, left: 0, width, height, overflow: "hidden" }}>
      {Array.from({ length: repeatCount }, (_, i) => (
        <Svg key={i} width={width} height={vh} viewBox="0 0 375 133.62" style={{ position: "absolute", top: i * vh, left: 0 }}>
          <Defs>
            <SvgGradient id={`patGrad${i}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#fff" stopOpacity="1" />
              <Stop offset="0.7" stopColor="#fff" stopOpacity="0.4" />
              <Stop offset="1" stopColor="#fff" stopOpacity="0" />
            </SvgGradient>
            <Mask id={`patMask${i}`}>
              <Rect width="375" height="133.62" fill={`url(#patGrad${i})`} />
            </Mask>
          </Defs>
          <Path d={PATTERN_PATH} fill="#bf9f60" opacity={opacity} mask={`url(#patMask${i})`} />
        </Svg>
      ))}
    </View>
  );
}

function StarOrnament({ size = 14, color = "#C8A96A" }) {
  const c = size / 2;
  const r = size * 0.38;
  const pts1 = Array.from({ length: 4 }, (_, i) => {
    const a = (i * 90 - 45) * Math.PI / 180;
    return `${(c + r * Math.cos(a)).toFixed(1)},${(c + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  const pts2 = Array.from({ length: 4 }, (_, i) => {
    const a = (i * 90) * Math.PI / 180;
    return `${(c + r * Math.cos(a)).toFixed(1)},${(c + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Polygon points={pts1} fill={color} opacity="0.9" />
      <Polygon points={pts2} fill={color} opacity="0.9" />
    </Svg>
  );
}

function archPath(W, H) {
  const archW = W * 0.72;
  const xL = (W - archW) / 2;
  const xR = xL + archW;
  const cx = W / 2;
  const cp1 = archW * 0.18;
  const peakY = H * 0.05;
  const shoulderY = H * 0.55;
  return `M ${xL} ${H} C ${xL} ${shoulderY} ${cx - cp1} ${peakY + 18} ${cx} ${peakY} C ${cx + cp1} ${peakY + 18} ${xR} ${shoulderY} ${xR} ${H}`;
}

function archClipPath(W, H) {
  return archPath(W, H) + ` L ${(W + W * 0.72) / 2} ${H} L ${(W - W * 0.72) / 2} ${H} Z`;
}

export default function PostcardTemplate({ template, photoUri, eyebrow, message, dateLabel, width = 320 }) {
  const height = Math.round(width * (16 / 9));
  const Icon = ICONS[template.icon] ?? MapPin;

  if (template.category === "prayer") {
    return (
      <View style={[styles.card, { width, height, borderRadius: width * 0.04, borderWidth: 1.5, borderColor: "#C8A96A44" }]}>
        <LinearGradient colors={[template.accent, shade(template.accent, -18)]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <GoldPattern width={width} height={height * 0.75} opacity={0.18} />
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: height * 0.5 }} pointerEvents="none">
          <Svg width={width} height={height * 0.5} viewBox={`0 0 ${width} ${height * 0.5}`}>
            <Path d={archPath(width, height * 0.5)} fill="none" stroke="#C8A96A" strokeWidth={1} opacity={0.25} />
          </Svg>
        </View>
        <View style={styles.prayerContent}>
          <View style={[styles.iconRing, { borderColor: template.textColor + "55", width: width * 0.16, height: width * 0.16, borderRadius: width * 0.08 }]}>
            <Icon size={width * 0.08} color={template.textColor} weight="regular" />
          </View>
          <Text style={[styles.prayerText, { color: template.textColor, fontSize: width * 0.075, marginTop: width * 0.06 }]}>{message || template.placeholder}</Text>
          <View style={styles.footerRow}>
            <View style={[styles.footerLine, { backgroundColor: template.textColor + "55" }]} />
            <StarOrnament size={width * 0.04} color={template.textColor + "AA"} />
            <Text style={[styles.wordmark, { color: template.textColor + "CC" }]}>SAFAR</Text>
          </View>
        </View>
      </View>
    );
  }

  if (template.layout === "full-bleed") {
    return (
      <View style={[styles.card, { width, height, borderRadius: width * 0.04, backgroundColor: template.accent }]}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <GoldPattern width={width} height={height * 0.75} opacity={0.25} />
        )}
        <LinearGradient colors={["transparent", "transparent", template.accent + "CC", template.accent + "F2"]} locations={[0, 0.4, 0.7, 1]} style={StyleSheet.absoluteFill} />
        {eyebrow ? (
          <View style={styles.eyebrowRow}>
            <MapPin size={width * 0.035} color="#FFFFFF" weight="fill" />
            <Text style={[styles.eyebrowText, { fontSize: width * 0.032 }]}>{eyebrow}</Text>
          </View>
        ) : null}
        <View style={styles.bottomBlock}>
          <Text style={[styles.messageWhite, { fontSize: width * 0.062 }]}>{message || template.placeholder}</Text>
          <View style={styles.footerRow}>
            <StarOrnament size={width * 0.035} color="rgba(255,255,255,0.7)" />
            <Text style={styles.wordmarkWhite}>SAFAR</Text>
            {dateLabel ? <Text style={styles.dateWhite}>{dateLabel}</Text> : null}
          </View>
        </View>
      </View>
    );
  }

  const fArchW = width * 0.88;
  const fArchH = Math.round(fArchW * 0.73);
  return (
    <View style={[styles.card, { width, height, borderRadius: width * 0.04, backgroundColor: CARD_BG, borderWidth: 1, borderColor: "#DDD5C0" }]}>
      <GoldPattern width={width} height={height * 0.75} opacity={0.12} />
      <View style={{ padding: width * 0.045, alignItems: "center" }}>
        <View style={[styles.iconRing, { borderColor: template.accent, width: width * 0.12, height: width * 0.12, borderRadius: width * 0.06, marginBottom: width * 0.02 }]}>
          <Icon size={width * 0.06} color={template.accent} weight="regular" />
        </View>
        {eyebrow ? <Text style={[styles.eyebrowDark, { color: template.accent, fontSize: width * 0.03 }]}>{eyebrow}</Text> : null}
        <View style={{ width: fArchW, height: fArchH, marginTop: width * 0.02 }}>
          <Svg width={fArchW} height={fArchH} viewBox={`0 0 ${fArchW} ${fArchH}`}>
            <Defs>
              <ClipPath id="archClip"><Path d={archClipPath(fArchW, fArchH)} /></ClipPath>
            </Defs>
            {photoUri ? (
              <SvgImage href={{ uri: photoUri }} width={fArchW} height={fArchH * 1.3} x="0" y={-fArchH * 0.15} preserveAspectRatio="xMidYMid slice" clipPath="url(#archClip)" />
            ) : (
              <Path d={archClipPath(fArchW, fArchH)} fill={template.accent + "1A"} />
            )}
            <Path d={archPath(fArchW, fArchH)} fill="none" stroke={template.accent} strokeWidth={1.5} opacity={0.6} />
          </Svg>
        </View>
        <Text style={[styles.messageDark, { fontSize: width * 0.058, marginTop: width * 0.05 }]}>{message || template.placeholder}</Text>
        <View style={[styles.footerRow, { marginTop: width * 0.04 }]}>
          <StarOrnament size={width * 0.035} color="#8A7D6A" />
          <Text style={styles.wordmarkDark}>SAFAR</Text>
          {dateLabel ? <Text style={styles.dateDark}>{dateLabel}</Text> : null}
        </View>
      </View>
    </View>
  );
}

function shade(hex, percent) {
  const n = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0x00FF) + amt));
  const b = Math.max(0, Math.min(255, (n & 0x0000FF) + amt));
  return "#" + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
}

const styles = StyleSheet.create({
  card: { overflow: "hidden", position: "relative" },
  eyebrowRow: { position: "absolute", top: "6%", left: 0, right: 0, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 },
  eyebrowText: { color: "#FFFFFF", fontWeight: "700", letterSpacing: 2 },
  eyebrowDark: { fontWeight: "700", letterSpacing: 2, marginBottom: 4 },
  bottomBlock: { position: "absolute", bottom: "8%", left: "8%", right: "8%" },
  messageWhite: { fontFamily: SERIF, color: "#FFFFFF", textAlign: "center" },
  messageDark: { fontFamily: SERIF, color: "#1A1410", textAlign: "center" },
  footerRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 10 },
  footerLine: { width: 24, height: 1 },
  wordmark: { fontSize: 11, fontWeight: "700", letterSpacing: 2 },
  wordmarkWhite: { fontSize: 11, fontWeight: "700", letterSpacing: 2, color: "rgba(255,255,255,0.85)" },
  wordmarkDark: { fontSize: 11, fontWeight: "700", letterSpacing: 2, color: "#8A7D6A" },
  dateWhite: { fontSize: 11, color: "rgba(255,255,255,0.7)" },
  dateDark: { fontSize: 11, color: "#8A7D6A" },
  iconRing: { alignItems: "center", justifyContent: "center", borderWidth: 1.5 },
  prayerContent: { flex: 1, alignItems: "center", justifyContent: "center", padding: "12%" },
  prayerText: { fontFamily: SERIF, textAlign: "center" },
});
