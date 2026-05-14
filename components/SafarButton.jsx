/**
 * SafarButton.jsx
 * Native React Native button component — Safar / Labbayk design system
 *
 * Variants: primary | secondary | ghost | accent | danger
 * Sizes:    sm | md | lg
 */

import React, { useRef } from "react";
import {
  TouchableOpacity,
  Animated,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { colors, spacing, radius, shadows, typography } from "../theme";

export default function SafarButton({
  label,
  onPress,
  variant = "primary",   // primary | secondary | ghost | accent | danger
  size = "md",           // sm | md | lg
  icon,                  // optional left icon (ReactNode or string emoji)
  iconRight,             // optional right icon
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  labelStyle,
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  };

  const vs = variantStyles[variant] || variantStyles.primary;
  const ss = sizeStyles[size] || sizeStyles.md;
  const isDisabled = disabled || loading;

  return (
    <Animated.View
      style={[
        { transform: [{ scale }] },
        fullWidth && { width: "100%" },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        disabled={isDisabled}
        style={[
          styles.base,
          vs.btn,
          ss.btn,
          fullWidth && { width: "100%" },
          isDisabled && styles.disabled,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={vs.labelColor}
          />
        ) : (
          <View style={styles.inner}>
            {icon != null && (
              <View style={styles.iconLeft}>
                {typeof icon === "string" ? (
                  <Text style={[styles.iconText, { fontSize: ss.iconSize }]}>{icon}</Text>
                ) : (
                  icon
                )}
              </View>
            )}
            <Text style={[styles.label, vs.label, ss.label, labelStyle]}>
              {label}
            </Text>
            {iconRight != null && (
              <View style={styles.iconRight}>
                {typeof iconRight === "string" ? (
                  <Text style={[styles.iconText, { fontSize: ss.iconSize }, vs.label]}>
                    {iconRight}
                  </Text>
                ) : (
                  iconRight
                )}
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Variant styles ───────────────────────────────────────────────────────────

const variantStyles = {
  primary: {
    labelColor: colors.inverse,
    btn: {
      backgroundColor: colors.primary,
      borderWidth: 0,
      ...shadows.button,
    },
    label: {
      color: colors.inverse,
    },
  },

  secondary: {
    labelColor: colors.primary,
    btn: {
      backgroundColor: colors.primarySurface,
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    label: {
      color: colors.primary,
    },
  },

  ghost: {
    labelColor: colors.text,
    btn: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.border,
    },
    label: {
      color: colors.textSecondary,
    },
  },

  accent: {
    labelColor: colors.ink900,
    btn: {
      backgroundColor: colors.accent,
      borderWidth: 0,
      ...shadows.accent,
    },
    label: {
      color: colors.ink900,
    },
  },

  danger: {
    labelColor: colors.inverse,
    btn: {
      backgroundColor: colors.error,
      borderWidth: 0,
    },
    label: {
      color: colors.inverse,
    },
  },
};

// ─── Size styles ──────────────────────────────────────────────────────────────

const sizeStyles = {
  sm: {
    btn: {
      paddingVertical: spacing(0.875),
      paddingHorizontal: spacing(1.75),
      borderRadius: radius.md,
      minHeight: 36,
    },
    label: {
      fontSize: typography.small,
      fontWeight: typography.medium,
    },
    iconSize: 13,
  },

  md: {
    btn: {
      paddingVertical: spacing(1.5),
      paddingHorizontal: spacing(2.5),
      borderRadius: radius.md,
      minHeight: 48,
    },
    label: {
      fontSize: typography.body,
      fontWeight: typography.medium,
    },
    iconSize: 15,
  },

  lg: {
    btn: {
      paddingVertical: spacing(2),
      paddingHorizontal: spacing(3),
      borderRadius: radius.lg,
      minHeight: 56,
    },
    label: {
      fontSize: typography.bodyLg,
      fontWeight: typography.medium,
    },
    iconSize: 17,
  },
};

// ─── Base styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    letterSpacing: 0.2,
  },
  iconLeft: {
    marginRight: spacing(0.75),
  },
  iconRight: {
    marginLeft: spacing(0.75),
  },
  iconText: {
    lineHeight: undefined,
  },
  disabled: {
    opacity: 0.45,
  },
});
