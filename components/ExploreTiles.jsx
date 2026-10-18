import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { ArrowRight, CaretRight } from "phosphor-react-native";
import { sharedCardStyles } from "../screens/sharedCardStyles";

const SERIF = "SourceSerif4-Regular";

// "Explore your pilgrimage" — shared by HomeScreen and LearnMainScreen so the tiles stay identical.
// Each screen passes its own tiles: { label, subtitle, image, circleColor, onPress }.
// The section owns its 16px side padding; hosts should not add horizontal margins.
// "View all" pill renders only when viewAllOnPress is a function.
export default function ExploreTiles({ title = "EXPLORE YOUR PILGRIMAGE", viewAllOnPress, tiles = [] }) {
  return (
    <View style={s.section}>
      <View style={s.headerRow}>
        <Text style={sharedCardStyles.eyebrowText}>{title}</Text>
        {typeof viewAllOnPress === "function" ? (
          <TouchableOpacity style={s.viewAllBtn} onPress={viewAllOnPress} activeOpacity={0.7}>
            <Text style={s.viewAllText}>View all</Text>
            <ArrowRight size={12} color="#5C534A" weight="regular" />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={s.grid}>
        {[tiles.slice(0, 2), tiles.slice(2, 4)].map((row, i) => (
          <View key={i} style={s.row}>
            {row.map((tile) => (
              <TouchableOpacity key={tile.label} style={s.tile} onPress={tile.onPress} activeOpacity={0.85}>
                <View style={s.photoWrap}>
                  <Image source={tile.image} style={s.photo} resizeMode="cover" />
                  {/* Solid circle reads on any photo, so no gradient overlay is needed. */}
                  <View style={[s.arrow, { backgroundColor: tile.circleColor }]}>
                    <CaretRight size={14} color="#FFFFFF" weight="bold" />
                  </View>
                </View>
                <View style={s.body}>
                  <Text style={s.tileTitle} numberOfLines={1}>{tile.label}</Text>
                  <Text style={s.tileSub} numberOfLines={2}>{tile.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
    gap: 4,
  },
  viewAllText: {
    fontSize: 12,
    color: "#5C534A",
    fontWeight: "500",
  },
  grid: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  tile: {
    flex: 1,
    aspectRatio: 0.92,
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
  photoWrap: {
    height: "55%",
    width: "100%",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  arrow: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  tileTitle: {
    fontFamily: SERIF,
    fontSize: 17,
    color: "#1A1410",
    marginBottom: 2,
  },
  tileSub: {
    fontSize: 13,
    color: "#8A7F72",
    lineHeight: 17,
  },
});
