import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Pressable,
} from "react-native";
import {
  Compass,
  BookOpen,
  UsersThree,
  ListChecks,
  X,
} from "phosphor-react-native";

const HUBS = [
  {
    key: "connect",
    label: "Connect",
    icon: UsersThree,
    color: "#3D2240",
    route: "ConnectHub",
  },
  {
    key: "practice",
    label: "Practice",
    icon: Compass,
    color: "#4E3414",
    route: "PracticeHub",
  },
  {
    key: "learn",
    label: "Learn",
    icon: BookOpen,
    color: "#2D4F32",
    route: "LearnHub",
  },
  {
    key: "plan",
    label: "Plan",
    icon: ListChecks,
    color: "#2E4560",
    route: "PlanHub",
  },
];

export default function HubQuickNav({ navigation }) {
  const [open, setOpen] = useState(false);

  const animations = useRef(
    HUBS.map(() => new Animated.Value(0))
  ).current;

  const backdropOpacity = useRef(new Animated.Value(0)).current;

  function openMenu() {
    setOpen(true);
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      ...animations.map((anim, i) =>
        Animated.spring(anim, {
          toValue: 1,
          delay: i * 40,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
        })
      ),
    ]).start();
  }

  function closeMenu() {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      ...animations.map((anim) =>
        Animated.timing(anim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        })
      ),
    ]).start(() => setOpen(false));
  }

  function navigate(hub) {
    closeMenu();
    setTimeout(() => {
      navigation.navigate("HubContainer", { pillar: hub.key });
    }, 150);
  }

  return (
    <View style={styles.container} pointerEvents="box-none">

      {/* Backdrop — only when open */}
      {open ? (
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        >
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={closeMenu}
          />
        </Animated.View>
      ) : null}

      {/* Hub pills — expand upward */}
      {HUBS.map((hub, i) => {
        const HubIcon = hub.icon;
        const translateY = animations[i].interpolate({
          inputRange: [0, 1],
          outputRange: [0, -((i + 1) * 56)],
        });
        const opacity = animations[i];
        return (
          <Animated.View
            key={hub.key}
            style={[
              styles.hubPill,
              {
                opacity,
                transform: [{ translateY }],
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.hubPillInner, { backgroundColor: hub.color }]}
              onPress={() => navigate(hub)}
              activeOpacity={0.85}
            >
              <HubIcon size={18} color="#C8A96A" weight="regular" />
              <Text style={styles.hubLabel}>{hub.label}</Text>
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      {/* Main trigger button */}
      <TouchableOpacity
        style={styles.mainBtn}
        onPress={open ? closeMenu : openMenu}
        activeOpacity={0.85}
      >
        {open ? (
          <X size={20} color="#C8A96A" weight="bold" />
        ) : (
          <Compass size={20} color="#C8A96A" weight="regular" />
        )}
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 90,
    right: 24,
    alignItems: "center",
    zIndex: 100,
  },
  backdrop: {
    position: "absolute",
    top: -1000,
    left: -1000,
    right: -24,
    bottom: -90,
    backgroundColor: "rgba(26,20,16,0.4)",
  },
  mainBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1A1410",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1A1410",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 8,
    elevation: 8,
  },
  hubPill: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  hubPillInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: "#1A1410",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.20,
    shadowRadius: 6,
    elevation: 6,
  },
  hubLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
