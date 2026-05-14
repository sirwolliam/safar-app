/**
 * PilgrimageDuasScreen.jsx — Safar
 *
 * Handles both Umrah and Hajj du'ā collections.
 * Route param: { mode: "umrah" | "hajj" }
 *
 * Design: each stage is a single cohesive card module containing:
 *   - Image (rounded top corners only)
 *   - STAGE pill + stage name on image
 *   - Divider
 *   - Icon + title + description
 *   - Divider
 *   - Du'ā rows (no internal border between card and rows)
 * All at the same width, same border radius, feeling like one unit.
 */
import React, { useMemo } from "react";
import {
  SafeAreaView, View, Text, ScrollView,
  TouchableOpacity, StyleSheet, ImageBackground,
} from "react-native";
import { spacing, shadows } from "../theme";
import { UMRAH_DUAS, HAJJ_DUAS } from "../dua-content";

const SERIF  = "SourceSerif4-Regular";
const BG     = "#F5F0E8";
const CARD   = "#FFFFFF";
const BORDER = "#EAE4DC";
const SAGE   = "#4A5C48";
const GOLD   = "#B8922A";
const MUTED  = "#7A7060";

// ── Stage order ────────────────────────────────────────────────────────────────
const UMRAH_STAGE_ORDER = [
  "Ihram", "Entry", "Tawaf", "Sa\u02bfy", "Farewell",
];
const HAJJ_STAGE_ORDER = [
  "Ihram", "Entry", "Tawaf", "Sa\u02bfy",
  "Arafah", "Muzdalifah", "Jamarat", "Farewell",
];

// ── Stage metadata ─────────────────────────────────────────────────────────────
const STAGE_META = {
  "Ihram": {
    image:       require("../assets/ihram.jpg"),
    emoji:       "\uD83E\uDEF4",
    displayName: "Entering Ih\u1e5b\u0101m",
    description: "Ih\u1e5b\u0101m marks the beginning of your sacred journey. Make your intention, recite the Talbiyah, and enter the state of spiritual purity that will carry you through every rite.",
  },
  "Entry": {
    image:       require("../assets/arrival.jpg"),
    emoji:       "\uD83D\uDD4C",
    displayName: "Arrival at the \u1e24aram",
    description: "Entering Masjid al-\u1e24ar\u0101m for the first time is a moment many pilgrims describe as life-changing. Prepare your heart and your du\u02bf\u0101 before you step inside.",
  },
  "Tawaf": {
    image:       require("../assets/tawaf.jpg"),
    emoji:       "\uD83D\uDD4B",
    displayName: "\u1e62aw\u0101f",
    description: "Circling the Ka\u02bfbah seven times is an act of worship performed by millions simultaneously. Begin at the Black Stone and keep the Ka\u02bfbah to your left throughout.",
  },
  "Sa\u02bfy": {
    image:       require("../assets/Umrah_04_sai_gradient.jpg"),
    emoji:       "\uD83D\uDEB6",
    displayName: "Sa\u02bfy between \u1e62af\u0101 and Marwah",
    description: "Walking seven lengths between \u1e62af\u0101 and Marwah commemorates H\u0101jar\u2019s search for water. Begin at \u1e62af\u0101, ascend, face the Ka\u02bfbah, and make du\u02bf\u0101 before walking to Marwah.",
  },
  "Arafah": {
    image:       require("../assets/arafah.jpg"),
    emoji:       "\uD83C\uDF05",
    displayName: "Standing at \u02bfarafah",
    description: "The standing at \u02bfarafah is the heart of Hajj \u2014 \u201cHajj is \u02bfarafah.\u201d Spend the afternoon in constant du\u02bf\u0101 and dhikr. This is the day Allah frees most people from the Fire.",
  },
  "Muzdalifah": {
    image:       require("../assets/08_muzdalifah_gradient.jpg"),
    emoji:       "\uD83C\uDF19",
    displayName: "Night at Muzdalifah",
    description: "After leaving \u02bfarafah, spend the night at Muzdalifah under the open sky. Collect your pebbles for stoning and combine Maghrib and \u02bfish\u0101\u02bc prayers here.",
  },
  "Jamarat": {
    image:       require("../assets/mina.jpg"),
    emoji:       "\u26AA",
    displayName: "Stoning at Min\u0101",
    description: "At Min\u0101, we stone the Jamar\u0101t and complete the rites of \u1e24ajj. Say \u2018All\u0101hu Akbar\u2019 with each stone thrown and seek Allah\u2019s acceptance.",
  },
  "Farewell": {
    image:       require("../assets/tawaf2.jpg"),
    emoji:       "\uD83E\uDD32",
    displayName: "Farewell \u1e62aw\u0101f",
    description: "The farewell \u1e62aw\u0101f is the last act before leaving Makkah. Leave with your heart full, your du\u02bf\u0101s made, and the intention to return.",
  },
};

function getMeta(stage) {
  return STAGE_META[stage] ?? {
    image:       require("../assets/arrival.jpg"),
    emoji:       "\uD83E\uDD32",
    displayName: stage,
    description: "For remembrance and supplication.",
  };
}

// ── Stage module — one cohesive card for image + info + duas ───────────────────
function StageModule({ stage, duas, allDuas, navigation }) {
  const meta = getMeta(stage);
  return (
    <View style={mod.card}>

      {/* ── Image — rounded top corners ── */}
      <ImageBackground
        source={meta.image}
        style={mod.image}
        imageStyle={mod.imageStyle}
        resizeMode="cover"
      >
        <View style={mod.scrim} />
        {/* STAGE pill */}
        <View style={mod.pill}>
          <Text style={mod.pillTxt}>STAGE</Text>
        </View>
        {/* Stage name */}
        <Text style={mod.stageName}>{meta.displayName}</Text>
      </ImageBackground>

      {/* ── Stage info ── */}
      <View style={mod.infoRow}>
        <View style={mod.iconCircle}>
          <Text style={mod.iconTxt}>{meta.emoji}</Text>
        </View>
        <View style={mod.infoText}>
          <Text style={mod.infoTitle}>{meta.displayName}</Text>
          <Text style={mod.infoDesc}>{meta.description}</Text>
        </View>
      </View>

      {/* ── Divider + section label ── */}
      <View style={mod.divider} />
      <Text style={mod.sectionLabel}>
        {"Du\u02bf\u0101s for " + meta.displayName}
      </Text>

      {/* ── Du'ā rows — no extra card, part of the same module ── */}
      {duas.map((dua, idx) => {
        const isLast = idx === duas.length - 1;
        return (
          <TouchableOpacity
            key={dua.id}
            style={[mod.duaRow, !isLast && mod.duaRowBorder]}
            onPress={() => navigation.navigate("DuaDetail", {
              dua,
              allDuas,
              currentIndex: allDuas.indexOf(dua),
            })}
            activeOpacity={0.75}
          >
            <View style={mod.duaInfo}>
              <Text style={mod.duaTitle}>{dua.title}</Text>
              <Text style={mod.duaSub} numberOfLines={1}>
                {dua.subtitle ?? dua.sub ?? ""}
              </Text>
            </View>
            <Text style={mod.duaChevron}>›</Text>
          </TouchableOpacity>
        );
      })}

      {/* Bottom padding inside card */}
      <View style={{ height: 4 }} />
    </View>
  );
}

const mod = StyleSheet.create({
  // The whole card — one rounded rectangle
  card: {
    marginHorizontal: spacing(2.5),
    marginBottom: spacing(2.5),
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
    ...shadows.card,
  },

  // Image — fills card width, rounded only at top
  image: {
    height: 190,
    justifyContent: "flex-end",
    padding: 16,
  },
  imageStyle: {
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8,14,6,0.38)",
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
  },

  // STAGE pill
  pill: {
    position: "absolute",
    top: 14,
    left: 14,
    backgroundColor: "rgba(74,92,72,0.90)",
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillTxt: {
    fontSize: 10,
    color: "rgba(255,255,255,0.95)",
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  stageName: {
    fontFamily: SERIF,
    fontSize: 30,
    color: "#fff",
    fontWeight: "600",
  },

  // Info row
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    paddingBottom: 14,
    gap: 14,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EEF0EC",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  iconTxt:   { fontSize: 22 },
  infoText:  { flex: 1 },
  infoTitle: {
    fontFamily: SERIF,
    fontSize: 19,
    color: "#1C1A14",
    fontWeight: "600",
    marginBottom: 5,
  },
  infoDesc: {
    fontSize: 14,
    color: MUTED,
    lineHeight: 21,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginHorizontal: 16,
  },

  // Section label
  sectionLabel: {
    fontFamily: SERIF,
    fontSize: 15,
    color: MUTED,
    fontWeight: "500",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontSize: 11,
  },

  // Du'ā rows — inside the card, no extra border
  duaRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  duaRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  duaInfo:   { flex: 1 },
  duaTitle:  {
    fontFamily: SERIF,
    fontSize: 16,
    color: "#1C1A14",
    fontWeight: "400",
    marginBottom: 2,
  },
  duaSub: {
    fontSize: 12,
    color: MUTED,
    lineHeight: 17,
  },
  duaChevron: {
    fontSize: 20,
    color: GOLD,
    marginLeft: 8,
  },
});

// ── Screen ─────────────────────────────────────────────────────────────────────
export default function PilgrimageDuasScreen({ route, navigation }) {
  const mode    = route?.params?.mode ?? "umrah";
  const isUmrah = mode === "umrah";

  const allDuas    = isUmrah ? UMRAH_DUAS : HAJJ_DUAS;
  const stageOrder = isUmrah ? UMRAH_STAGE_ORDER : HAJJ_STAGE_ORDER;

  // Title: "Umrah Du'ās" / "Hajj Du'ās" — no "Journey"
  const title = isUmrah ? "Umrah Du\u02bf\u0101s" : "Hajj Du\u02bf\u0101s";

  const grouped = useMemo(() => {
    const map = {};
    (allDuas ?? []).forEach(d => {
      const key = d.stage ?? "General";
      if (!map[key]) map[key] = [];
      map[key].push(d);
    });
    return map;
  }, [allDuas]);

  const stages = stageOrder.filter(s => (grouped[s] ?? []).length > 0);

  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => navigation?.goBack?.()}
          activeOpacity={0.8}
        >
          <Text style={s.backArrow}>{"‹"}</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>{title}</Text>
          <Text style={s.headerSub}>
            {(allDuas ?? []).length}{" du\u02bf\u0101s \u00b7 "}
            {stages.length}{" stages"}
          </Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {stages.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyTxt}>No du\u02bf\u0101s found.</Text>
          </View>
        ) : (
          stages.map(stage => (
            <StageModule
              key={stage}
              stage={stage}
              duas={grouped[stage]}
              allDuas={allDuas ?? []}
              navigation={navigation}
            />
          ))
        )}

        {/* Scholarly footnote */}
        <View style={s.footnote}>
          <Text style={s.footnoteText}>
            <Text style={s.footnoteBold}>{"Sources \u2014 "}</Text>
            {"Du\u02bf\u0101s drawn from \u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b, \u1e62a\u1e25\u012b\u1e25 Muslim, Sunan Ab\u012b D\u0101w\u016bd, Sunan al-Tirmidh\u012b and Sunan Ibn M\u0101jah. Consult a qualified scholar for rulings specific to your school of thought."}
          </Text>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}

// ── Screen styles ──────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing(2.5),
    paddingTop: spacing(2),
    paddingBottom: spacing(1.5),
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: BG,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#fff",
    borderWidth: 1, borderColor: BORDER,
    alignItems: "center", justifyContent: "center",
  },
  backArrow:    { fontSize: 24, color: "#1C1A14", lineHeight: 28 },
  headerCenter: { flex: 1, alignItems: "center", paddingHorizontal: spacing(1) },
  headerTitle:  { fontFamily: SERIF, fontSize: 22, color: "#1C1A14", fontWeight: "400" },
  headerSub:    { fontSize: 12, color: MUTED, marginTop: 2 },

  scrollContent: {
    paddingTop: spacing(3),
    paddingBottom: spacing(5),
  },

  empty:    { alignItems: "center", paddingVertical: 60 },
  emptyTxt: { fontSize: 15, color: MUTED },

  footnote: {
    marginHorizontal: spacing(2.5),
    marginTop: spacing(1),
    backgroundColor: "#F5EDD8",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8D9B8",
    padding: 14,
  },
  footnoteText: { fontSize: 12, color: "#7A6030", lineHeight: 18 },
  footnoteBold: { fontWeight: "600" },
});
