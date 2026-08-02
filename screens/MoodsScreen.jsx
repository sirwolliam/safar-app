import React from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CaretLeft,
  CloudRain, Leaf, Flame, Moon, SunHorizon,
  Ghost, Pulse, Waves, BatteryLow, Bed, Coffee, Drop, CloudFog,
  Bandaids, User, HeartBreak, ClockCounterClockwise, Fire, Timer,
  Eye, Coins, Question, MaskHappy, Scales, ArrowsLeftRight,
  BatteryWarning, PuzzlePiece, HandHeart, Smiley,
} from "phosphor-react-native";
import HeaderPatternBg from "../HeaderPatternBg";

const SW = Dimensions.get("window").width;

const MOOD_TILES = [
  { key: "anxious",      label: "Feeling\nAnxious",       icon: CloudRain,             image: require("../assets/mood/mood-anxious.png")      },
  { key: "peace",        label: "Seeking\nPeace",          icon: Leaf,                  image: require("../assets/mood/mood-peace.png")        },
  { key: "strength",     label: "Need\nStrength",          icon: Flame,                 image: require("../assets/mood/mood-strength.png")     },
  { key: "grateful",     label: "Feeling\nGrateful",       icon: Moon,                  image: require("../assets/mood/mood-grateful.png")     },
  { key: "anew",         label: "Starting\nAnew",          icon: SunHorizon,            image: require("../assets/mood/mood-anew.png")         },
  { key: "scared",       label: "Feeling\nScared",         icon: Ghost,                 image: require("../assets/mood/mood-scared.png")       },
  { key: "nervous",      label: "Feeling\nNervous",        icon: Pulse,                 image: require("../assets/mood/mood-nervous.png")      },
  { key: "overwhelmed",  label: "Feeling\nOverwhelmed",    icon: Waves,                 image: require("../assets/mood/mood-overwhelmed.png")  },
  { key: "tired",        label: "Feeling\nTired",          icon: BatteryLow,            image: require("../assets/mood/mood-tired.png")        },
  { key: "lazy",         label: "Feeling\nLazy",           icon: Bed,                   image: require("../assets/mood/mood-lazy.png")         },
  { key: "bored",        label: "Feeling\nBored",          icon: Coffee,                image: require("../assets/mood/mood-bored.png")        },
  { key: "sad",          label: "Feeling\nSad",            icon: Drop,                  image: require("../assets/mood/mood-sad.png")          },
  { key: "depressed",    label: "Feeling\nDepressed",      icon: CloudFog,              image: require("../assets/mood/mood-depressed.png")    },
  { key: "hurt",         label: "Feeling\nHurt",           icon: Bandaids,              image: require("../assets/mood/mood-hurt.png")         },
  { key: "lonely",       label: "Feeling\nLonely",         icon: User,                  image: require("../assets/mood/mood-lonely.png")       },
  { key: "unloved",      label: "Feeling\nUnloved",        icon: HeartBreak,            image: require("../assets/mood/mood-unloved.png")      },
  { key: "regret",       label: "Feeling\nRegret",         icon: ClockCounterClockwise, image: require("../assets/mood/mood-regret.png")       },
  { key: "angry",        label: "Feeling\nAngry",          icon: Fire,                  image: require("../assets/mood/mood-angry.png")        },
  { key: "impatient",    label: "Feeling\nImpatient",      icon: Timer,                 image: require("../assets/mood/mood-impatient.png")    },
  { key: "jealous",      label: "Feeling\nJealous",        icon: Eye,                   image: require("../assets/mood/mood-jealous.png")      },
  { key: "greedy",       label: "Feeling\nGreedy",         icon: Coins,                 image: require("../assets/mood/mood-greedy.png")       },
  { key: "doubtful",     label: "Feeling\nDoubtful",       icon: Question,              image: require("../assets/mood/mood-doubtful.png")     },
  { key: "hypocritical", label: "Feeling\nHypocritical",   icon: MaskHappy,             image: require("../assets/mood/mood-hypocritical.png") },
  { key: "guilty",       label: "Feeling\nGuilty",         icon: Scales,                image: require("../assets/mood/mood-guilty.png")       },
  { key: "indecisive",   label: "Feeling\nIndecisive",     icon: ArrowsLeftRight,       image: require("../assets/mood/mood-indecisive.png")   },
  { key: "weak",         label: "Feeling\nWeak",           icon: BatteryWarning,        image: require("../assets/mood/mood-weak.png")         },
  { key: "confused",     label: "Feeling\nConfused",       icon: PuzzlePiece,           image: require("../assets/mood/mood-confused.png")     },
  { key: "content",      label: "Feeling\nContent",        icon: HandHeart,             image: require("../assets/mood/mood-content.png")      },
  { key: "happy",        label: "Feeling\nHappy",          icon: Smiley,                image: require("../assets/mood/mood-happy.png")        },
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
  tile:         { width: 100, height: 110, borderRadius: 12, overflow: "hidden" },
  tileContent:  { flex: 1, alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 4 },
  tileLabel:    { fontSize: 14, fontWeight: "600", color: "#FFFFFF", textAlign: "center", lineHeight: 18 },
});
