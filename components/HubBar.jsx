import React from "react";
import {
  View, Text, TouchableOpacity, StyleSheet
} from "react-native";
import {
  ListChecks, BookOpen, Compass, UsersThree
} from "phosphor-react-native";

const HUBS = [
  { key: "plan",     label: "Plan",
    icon: ListChecks, pillar: "plan"     },
  { key: "learn",    label: "Learn",
    icon: BookOpen,   pillar: "learn"    },
  { key: "practice", label: "Practice",
    icon: Compass,    pillar: "practice" },
  { key: "connect",  label: "Connect",
    icon: UsersThree, pillar: "connect"  },
];

export default function HubBar({ navigation }) {
  return (
    <View style={styles.container}>
      {HUBS.map((hub, index) => {
        const HubIcon = hub.icon;
        const isLast = index === HUBS.length - 1;
        return (
          <TouchableOpacity
            key={hub.key}
            style={isLast
              ? styles.hubItem
              : [styles.hubItem, styles.hubItemBorder]}
            activeOpacity={0.75}
            onPress={() =>
              navigation.navigate("Home", {
                screen: "HubContainer",
                params: { pillar: hub.pillar }
              })
            }
          >
            <HubIcon
              size={16}
              color="#FFFFFF"
              weight="regular"
            />
            <Text style={styles.hubLabel}>
              {hub.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 44,
    alignItems: "center",
    backgroundColor: "rgba(26,20,16,0.35)",
    borderTopWidth: 1,
    borderTopColor: "rgba(200,169,106,0.15)",
  },
  hubItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 44,
  },
  hubItemBorder: {
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.15)",
  },
  hubLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
});
