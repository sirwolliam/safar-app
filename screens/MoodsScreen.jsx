import React from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CaretLeft,
  CloudRain, Drop, Fire, Question, BatteryLow, HandHeart, Leaf, Flame, SunHorizon,
} from "phosphor-react-native";
import HeaderPatternBg from "../HeaderPatternBg";

const SW = Dimensions.get("window").width;
const TILE_W = (SW - 16 * 2 - 10 * 2) / 3;
const TILE_H = Math.round(TILE_W * 1.1);

const MOOD_TILES = [
  { key: "anxious",     label: "Feeling\nAnxious",    icon: CloudRain, image: require("../assets/mood/mood-anxious.png")  },
  { key: "grief",       label: "Grief &\nSadness",    icon: Drop,      image: require("../assets/mood/mood-sad.png")      },
  { key: "frustration", label: "Feeling\nFrustrated", icon: Fire,      image: require("../assets/mood/mood-angry.png")    },
  { key: "faithDoubt",  label: "Faith &\nDoubt",      icon: Question,  image: require("../assets/mood/mood-doubtful.png") },
  { key: "lowEnergy",   label: "Low on\nEnergy",      icon: BatteryLow,image: require("../assets/mood/mood-tired.png")    },
  { key: "contentment", label: "Content &\nGrateful", icon: HandHeart, image: require("../assets/mood/mood-grateful.png") },
  { key: "peace",       label: "Seeking\nPeace",      icon: Leaf,      image: require("../assets/mood/mood-peace.png")    },
  { key: "strength",    label: "Need\nStrength",      icon: Flame,     image: require("../assets/mood/mood-strength.png") },
  { key: "anew",        label: "Starting\nAnew",      icon: SunHorizon,image: require("../assets/mood/mood-anew.png")     },
];

export default function MoodsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={s.safe}>
      <View style={s.header}>
        <HeaderPatternBg width={SW} />
        <View style={[s.headerTopRow, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <CaretLeft size={20} color="#1A1410" weight="bold" />
          </TouchableOpacity>
        </View>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>{"Moods"}</Text>
          <Text style={s.headerSub}>{"Find the right words for how you feel."}</Text>
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.grid}>
        {MOOD_TILES.map((tile) => (
          <TouchableOpacity
            key={tile.key}
            style={s.tile}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("DuaList", { category: tile.key })}
          >
            <Image source={tile.image} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
            <LinearGradient
              colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0.70)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={s.tileContent}>
              <tile.icon size={24} color="#FFFFFF" weight="regular" />
              <Text style={s.tileLabel}>{tile.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: "#EDE6D8" },
  header:       { backgroundColor: "#4A5C48", minHeight: 130, position: "relative", overflow: "hidden", paddingHorizontal: 16, paddingBottom: 16 },
  headerTopRow: { flexDirection: "row", alignItems: "center" },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: "#FDFAF4", alignItems: "center", justifyContent: "center" },
  headerCenter: { alignItems: "center", marginTop: 16 },
  headerTitle:  { fontFamily: "SourceSerif4-Regular", fontSize: 28, color: "#FDFAF4", fontWeight: "400" },
  headerSub:    { fontSize: 13, color: "#FDFAF4", marginTop: 2, opacity: 0.8 },
  grid:         { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  tile:         { width: TILE_W, height: TILE_H, borderRadius: 12, overflow: "hidden" },
  tileContent:  { flex: 1, alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 4 },
  tileLabel:    { fontSize: 14, fontWeight: "600", color: "#FFFFFF", textAlign: "center", lineHeight: 18 },
});
