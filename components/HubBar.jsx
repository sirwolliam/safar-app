import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { BlurView } from "expo-blur";
import {
  ListChecks,
  BookOpen,
  Compass,
  UsersThree,
} from "phosphor-react-native";

const HUBS = [
  {
    key: "plan",
    label: "Plan",
    icon: ListChecks,
    pillar: "plan",
  },
  {
    key: "learn",
    label: "Learn",
    icon: BookOpen,
    pillar: "learn",
  },
  {
    key: "practice",
    label: "Practice",
    icon: Compass,
    pillar: "practice",
  },
  {
    key: "connect",
    label: "Connect",
    icon: UsersThree,
    pillar: "connect",
  },
];

export default function HubBar({ navigation }) {
  return (
    <BlurView
      intensity={40}
      tint="dark"
      style={styles.container}
    >
      {HUBS.map((hub, index) => {
        const HubIcon = hub.icon;
        const isLast = index === HUBS.length - 1;
        return (
          <TouchableOpacity
            key={hub.key}
            style={isLast ?
              styles.hubItem :
              [styles.hubItem, styles.hubItemBorder]}
            activeOpacity={0.75}
            onPress={() =>
              navigation.navigate("HubContainer",
                { pillar: hub.pillar })
            }
          >
            <HubIcon
              size={14}
              color="#C8A96A"
              weight="regular"
            />
            <Text style={styles.hubLabel}>
              {hub.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 36,
    alignItems: "center",
    backgroundColor: "rgba(26,20,16,0.55)",
    borderTopWidth: 1,
    borderTopColor: "rgba(200,169,106,0.15)",
  },
  hubItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    height: 36,
  },
  hubItemBorder: {
    borderRightWidth: 1,
    borderRightColor: "rgba(200,169,106,0.20)",
  },
  hubLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#C8A96A",
    letterSpacing: 0.3,
  },
});
