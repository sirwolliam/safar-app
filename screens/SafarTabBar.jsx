/**
 * SafarTabBar.jsx
 * Native React Native bottom tab bar — Safar / Labbayk design system
 *
 * Usage (standalone):
 *   <SafarTabBar activeTab="home" onTabPress={(id) => ...} />
 *
 * Usage (with React Navigation — drop-in tabBar prop):
 *   <Tab.Navigator tabBar={(props) => <SafarTabBar navProps={props} />}>
 */

import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors, spacing, radius, shadows, typography } from "../theme";

// ─── Icon set ─────────────────────────────────────────────────────────────────
// Pure React Native SVG-free icons rendered as text glyphs + geometry.
// Replace with react-native-svg icons or expo-vector-icons as preferred.

const TAB_ITEMS = [
  { id: "home",    label: "Home",    icon: "⌂",  activeIcon: "⌂"  },
  { id: "journey", label: "Journey", icon: "◎",  activeIcon: "◎"  },
  { id: "play",    label: "",        icon: "▶",  activeIcon: "▶", isCentral: true },
  { id: "lists",   label: "Lists",   icon: "♡",  activeIcon: "♥"  },
  { id: "profile", label: "Profile", icon: "◯",  activeIcon: "◉"  },
];

// ─── Individual tab item ──────────────────────────────────────────────────────

function TabItem({ item, isActive, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(isActive ? 1 : 0.55)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: isActive ? 1.08 : 1,
        useNativeDriver: true,
        speed: 35,
        bounciness: 8,
      }),
      Animated.timing(opacity, {
        toValue: isActive ? 1 : 0.55,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isActive]);

  if (item.isCentral) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={styles.centralWrap}
      >
        <Animated.View style={[styles.centralBtn, { transform: [{ scale }] }]}>
          <Text style={styles.centralIcon}>{item.icon}</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.tabItem}
    >
      <Animated.View style={[styles.tabContent, { opacity, transform: [{ scale }] }]}>
        <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
          {isActive ? item.activeIcon : item.icon}
        </Text>
        {item.label ? (
          <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
            {item.label}
          </Text>
        ) : null}
        {isActive && !item.isCentral && <View style={styles.activeDot} />}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── SafarTabBar ──────────────────────────────────────────────────────────────

export default function SafarTabBar({
  activeTab = "home",
  onTabPress,
  tabs = TAB_ITEMS,
  // React Navigation compat
  navProps,
}) {
  const navigation = useNavigation();

  // React Navigation integration
  if (navProps) {
    const { state, navigation: navPropsNav } = navProps;
    const routeNames = state.routes.map((r) => r.name.toLowerCase());

    const handleNav = (routeName) => {
      navPropsNav.navigate(routeName);
    };

    return (
      <View style={styles.wrapper}>
        <View style={styles.bar}>
          {tabs.map((item) => {
            const routeIdx = routeNames.indexOf(item.id);
            const active = routeIdx === state.index;
            return (
              <TabItem
                key={item.id}
                item={item}
                isActive={active}
                onPress={() => handleNav(item.id)}
              />
            );
          })}
        </View>
      </View>
    );
  }

  // Standalone usage
  return (
    <View style={styles.wrapper}>
      <View style={styles.bar}>
        {tabs.map((item) => (
          <TabItem
            key={item.id}
            item={item}
            isActive={activeTab === item.id}
            onPress={() => onTabPress?.(item.id)}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const BAR_HEIGHT = Platform.OS === "ios" ? 82 : 64;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "transparent",
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: BAR_HEIGHT,
    paddingBottom: Platform.OS === "ios" ? 20 : 4,
    paddingHorizontal: spacing(1),
    ...shadows.md,
  },

  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing(0.75),
  },

  tabContent: {
    alignItems: "center",
    gap: 3,
    marginBottom: 8,
  },

  tabIcon: {
    fontSize: 20,
    color: colors.subtext,
    lineHeight: 24,
  },

  tabIconActive: {
    color: colors.primary,
  },

  tabLabel: {
    fontSize: typography.xs,
    color: colors.subtext,
    fontWeight: typography.regular,
    letterSpacing: 0.2,
  },

  tabLabelActive: {
    color: colors.primary,
    fontWeight: typography.medium,
  },

  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },

  centralWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
  },

  centralBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.card,
    ...shadows.button,
  },

  centralIcon: {
    fontSize: 20,
    color: colors.inverse,
    lineHeight: 24,
  },
});

// ─── Named export of tab items for external use ───────────────────────────────
export { TAB_ITEMS };
