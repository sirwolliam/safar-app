import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CalendarBlank, Airplane } from "phosphor-react-native";
import { useFocusEffect } from "@react-navigation/native";
import { sharedCardStyles } from "./sharedCardStyles";

const SERIF = "SourceSerif4-Regular";
const SW = Dimensions.get("window").width;
const CARD_W = SW - 16;
const CARD_H = Math.round(CARD_W / 1.25);
const TITLE_MAX_W = Math.round(CARD_W * 0.5);
const DESC_MAX_W = Math.round(CARD_W * 0.55);

// Duplicated from HomeCountdownCard.jsx — same convention as CATEGORY_ICONS/CATEGORY_COLORS
// in that file: small shared data kept in sync manually so HomeCountdownCard.jsx stays
// fully untouched and reusable elsewhere.
const PHASES = [
  { key: "early",    label: "Early",       fullLabel: "Early Preparation",     description: "You have time to plan carefully. Visas, flights, and accommodation are usually the first priorities." },
  { key: "focused",  label: "Focused",     fullLabel: "Focused Preparation",   description: "A good stretch for learning the steps, memorizing key duas, and shaping your packing list." },
  { key: "final",    label: "Final",       fullLabel: "Final Preparation",     description: "The trip is getting close. Packing, guides, and a word with family often come into focus around now." },
  { key: "onway",    label: "On your way", fullLabel: "On Your Way",           description: "Almost there. Documents, essentials, and a check-in with your group are worth a last look." },
  { key: "onsite",   label: "Pilgrimage",  fullLabel: "Pilgrimage",            description: "You are here. The duas and guides are ready when you need them." },
];

function phaseIndexForDays(daysOut) {
  if (daysOut > 90) return 0;
  if (daysOut > 30) return 1;
  if (daysOut > 7)  return 2;
  if (daysOut > 0)  return 3;
  return 4;
}

export default function HomeJourneyHero({ navigation, onEditTrip }) {
  const [tripDate, setTripDate] = React.useState(null);
  const [pilgrimageType, setPilgrimageType] = React.useState(null);
  const [loaded, setLoaded] = React.useState(false);

  const loadTrip = React.useCallback(async () => {
    try {
      const [dateStr, typeStr] = await Promise.all([
        AsyncStorage.getItem("safar_departure_date_v1"),
        AsyncStorage.getItem("safar_journey_type_v1"),
      ]);
      if (dateStr) setTripDate(dateStr);
      if (typeStr) setPilgrimageType(typeStr);
    } catch (e) {
      // If storage read fails, treat as no trip set
    } finally {
      setLoaded(true);
    }
  }, []);

  React.useEffect(() => { loadTrip(); }, [loadTrip]);
  useFocusEffect(React.useCallback(() => { loadTrip(); }, [loadTrip]));

  const hasDate = tripDate !== null && (pilgrimageType === "umrah" || pilgrimageType === "hajj");
  const pilgrimageLabel = pilgrimageType === "hajj" ? "Hajj" : "Umrah";

  let daysOut = 0;
  if (hasDate) {
    const now = new Date();
    const trip = new Date(tripDate);
    const ms = trip.getTime() - now.getTime();
    daysOut = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }

  const formattedDate = hasDate
    ? new Date(tripDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";

  if (!loaded || !hasDate) return null;

  const phaseIdx = phaseIndexForDays(daysOut);
  const phase = PHASES[phaseIdx];

  return (
    <View style={s.card}>
      <Image
        source={require("../assets/countdown_hero.png")}
        style={{ position: "absolute", width: CARD_W, height: CARD_H, resizeMode: "cover" }}
      />

      <View style={s.content}>
        <View style={s.topRow}>
          <View style={s.eyebrowPill}>
            <Text style={sharedCardStyles.eyebrowText}>YOUR JOURNEY</Text>
          </View>
          <View style={s.phaseTagBox}>
            <Text style={s.phaseTagText}>Phase {phaseIdx + 1} of 5</Text>
          </View>
        </View>

        <Text style={s.phaseName}>{phase.fullLabel}</Text>
        <Text style={s.phaseDescription}>{phase.description}</Text>

        <View style={s.departureRow}>
          <Airplane size={13} color="#8A7D6A" weight="fill" />
          <Text style={s.departureLine}>  Departure · {formattedDate}</Text>
        </View>

        <TouchableOpacity style={s.daysBox} activeOpacity={0.85} onPress={onEditTrip}>
          <View style={s.daysIconWrap}>
            <CalendarBlank size={24} color="#C8A96A" weight="regular" />
          </View>
          <Text style={s.daysNum}>{daysOut}</Text>
          <View style={s.daysLabelStack}>
            <Text style={s.daysLabel}>days until</Text>
            <Text style={s.daysLabel}>your {pilgrimageLabel}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    height: CARD_H,
    marginHorizontal: 8,
    marginBottom: 0,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  content: {
    flex: 1,
    paddingTop: 16,
    paddingLeft: 16,
    paddingRight: 20,
    paddingBottom: 14,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eyebrowPill: {},
  phaseTagBox: {
    backgroundColor: "#7A9176",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  phaseTagText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  phaseName: {
    fontFamily: SERIF,
    fontSize: 28,
    color: "#1A1410",
    marginTop: 8,
    marginBottom: 4,
    lineHeight: 34,
    maxWidth: TITLE_MAX_W,
  },
  phaseDescription: {
    fontSize: 14,
    color: "#5C534A",
    lineHeight: 19,
    maxWidth: DESC_MAX_W,
  },
  departureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  departureLine: {
    fontSize: 13,
    color: "#5C534A",
  },
  daysBox: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 1.5,
    borderColor: "#C8A96A",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#4A5C48",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  daysIconWrap: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  daysNum: {
    fontFamily: SERIF,
    fontSize: 33,
    color: "#FDFAF4",
    fontWeight: "600",
    marginRight: 7,
  },
  daysLabelStack: {
    justifyContent: "center",
  },
  daysLabel: {
    fontSize: 12,
    color: "rgba(253,250,244,0.75)",
  },
});
