import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { ArrowRight, CaretRight } from "phosphor-react-native";
import { sharedCardStyles } from "./sharedCardStyles";

const SERIF = "SourceSerif4-Regular";

// "Explore your pilgrimage" — shared by HomeScreen and LearnMainScreen so the tiles stay identical.
// Each screen passes its own tiles: { key, label, sub, image, accent: "green" | "gold", onPress }.
// Outer margins come from the host via `style`; the component carries none of its own.
export default function ExploreSection({ tiles, onViewAll, style }) {
  return (
    <View style={style}>
      <View style={s.headerRow}>
        <Text style={sharedCardStyles.eyebrowText}>EXPLORE YOUR PILGRIMAGE</Text>
        <TouchableOpacity style={s.viewAllBtn} onPress={onViewAll} activeOpacity={0.7}>
          <Text style={s.viewAllText}>View all</Text>
          <CaretRight size={14} color="#5C534A" weight="regular" />
        </TouchableOpacity>
      </View>

      <View style={s.grid}>
        {tiles.map((tile) => (
          <TouchableOpacity key={tile.key} style={s.tile} onPress={tile.onPress} activeOpacity={0.85}>
            <Image source={tile.image} style={s.tileImage} resizeMode="cover" />
            <View style={s.tileBody}>
              <View style={s.tileText}>
                <Text style={s.tileTitle} numberOfLines={1}>{tile.label}</Text>
                <Text style={s.tileSub} numberOfLines={2}>{tile.sub}</Text>
              </View>
              <View style={tile.accent === "gold" ? [s.arrow, s.arrowGold] : [s.arrow, s.arrowGreen]}>
                <ArrowRight size={14} color="#FFFFFF" weight="regular" />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 6,
  },
  // Same pill as HomePrioritiesCard's "View all".
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDFAF4",
    borderWidth: 1,
    borderColor: "#E0D8CC",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  viewAllText: {
    fontSize: 12,
    color: "#5C534A",
    fontWeight: "500",
    marginRight: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  tile: {
    width: "48.5%",
    backgroundColor: "#FDFAF4",
    borderWidth: 1,
    borderColor: "rgba(200, 191, 178, 0.5)",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#4A2E10",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  tileImage: {
    width: "100%",
    height: 110,
  },
  tileBody: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  tileText: {
    flex: 1,
  },
  tileTitle: {
    fontFamily: SERIF,
    fontSize: 17,
    fontWeight: "600",
    color: "#1A1712",
    marginBottom: 2,
  },
  tileSub: {
    fontSize: 12,
    color: "#8A7D6A",
    lineHeight: 16,
  },
  arrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowGreen: { backgroundColor: "#2D4A34" },
  arrowGold:  { backgroundColor: "#B48A3C" },
});
