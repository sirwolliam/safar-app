import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Check } from "phosphor-react-native";

const DURATION_DEFAULT = 2500;

let listeners = [];

export function showToast(message, options = {}) {
  const { actionLabel, onAction, duration = DURATION_DEFAULT } = options;
  listeners.forEach((fn) => fn({ message, actionLabel, onAction, duration }));
}

export function ToastHost() {
  const [toast, setToast] = useState(null);
  const opacity     = useRef(new Animated.Value(0)).current;
  const translateY  = useRef(new Animated.Value(16)).current;
  const timerRef    = useRef(null);

  useEffect(() => {
    const listener = (next) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      setToast(next);

      Animated.parallel([
        Animated.timing(opacity,    { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();

      timerRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity,    { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 12, duration: 200, useNativeDriver: true }),
        ]).start(() => setToast(null));
      }, next.duration);
    };

    listeners.push(listener);
    return () => {
      listeners = listeners.filter((fn) => fn !== listener);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!toast) return null;

  return (
    <Animated.View
      style={[s.pill, { opacity, transform: [{ translateY }] }]}
      pointerEvents="box-none"
    >
      <Check size={15} color="#FFFFFF" weight="bold" />
      <Text style={s.message}>{toast.message}</Text>
      {toast.actionLabel ? (
        <TouchableOpacity
          onPress={() => {
            if (timerRef.current) clearTimeout(timerRef.current);
            Animated.parallel([
              Animated.timing(opacity,    { toValue: 0, duration: 160, useNativeDriver: true }),
              Animated.timing(translateY, { toValue: 12, duration: 160, useNativeDriver: true }),
            ]).start(() => setToast(null));
            toast.onAction?.();
          }}
          activeOpacity={0.75}
        >
          <Text style={s.action}>{toast.actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  pill: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#2A2218",
    borderRadius: 50,
    paddingHorizontal: 18,
    paddingVertical: 11,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 9999,
  },
  message: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  action: {
    fontSize: 14,
    color: "#C8A96A",
    fontWeight: "700",
    marginLeft: 4,
  },
});
