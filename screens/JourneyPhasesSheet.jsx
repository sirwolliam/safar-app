import React from "react";
import {
  View, Text, TouchableOpacity, Pressable, StyleSheet, Modal, Animated, PanResponder, Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "phosphor-react-native";

const SERIF      = "SourceSerif4-Regular";
const SERIF_BOLD = "SourceSerif4-SemiBold";
const SH = Dimensions.get("window").height;
const DISMISS_DY = 80;
const DISMISS_VY = 0.8;

// "Your journey" bottom sheet — opened from the "Phase N of 5" pill on HomeJourneyHero.
// Vertical stepper of the preparation phases; `currentIndex` is highlighted.
// Dismiss: swipe down on the sheet, tap the backdrop, or the X.
export default function JourneyPhasesSheet({ visible, onClose, phases, currentIndex }) {
  const insets = useSafeAreaInsets();
  const translateY = React.useRef(new Animated.Value(SH)).current;

  React.useEffect(() => {
    if (visible) {
      translateY.setValue(SH);
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 0, speed: 14 }).start();
    }
  }, [visible, translateY]);

  // Mutable ref avoids a stale onClose inside the PanResponder (created once).
  const closeRef = React.useRef(onClose);
  React.useEffect(() => { closeRef.current = onClose; });

  const dismiss = React.useCallback(() => {
    Animated.timing(translateY, { toValue: SH, duration: 200, useNativeDriver: true })
      .start(() => closeRef.current?.());
  }, [translateY]);

  // Only claims vertical drags, so taps on the X still reach it.
  const pan = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) => dy > 6 && Math.abs(dy) > Math.abs(dx),
      onPanResponderMove: (_, { dy }) => { if (dy > 0) translateY.setValue(dy); },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > DISMISS_DY || vy > DISMISS_VY) {
          Animated.timing(translateY, { toValue: SH, duration: 180, useNativeDriver: true })
            .start(() => closeRef.current?.());
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start();
        }
      },
    })
  ).current;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={dismiss}>
      <View style={s.root}>
        <Pressable style={s.backdrop} onPress={dismiss} />

        <Animated.View
          style={[s.sheet, { paddingBottom: insets.bottom + 24, transform: [{ translateY }] }]}
          {...pan.panHandlers}
        >
          <View style={s.handle} />

          <View style={s.headerRow}>
            <Text style={s.title}>Your journey</Text>
            <TouchableOpacity style={s.closeBtn} onPress={dismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={18} color="#5C534A" weight="regular" />
            </TouchableOpacity>
          </View>

          {phases.map((phase, i) => {
            const isPast = i < currentIndex;
            const isCurrent = i === currentIndex;
            const isLast = i === phases.length - 1;
            return (
              <View key={phase.key} style={s.step}>
                <View style={s.rail}>
                  <View style={isCurrent ? [s.dot, s.dotCurrent] : isPast ? [s.dot, s.dotPast] : [s.dot, s.dotFuture]}>
                    <Text style={isCurrent || isPast ? [s.dotNum, s.dotNumFilled] : [s.dotNum, s.dotNumFuture]}>{i + 1}</Text>
                  </View>
                  {isLast ? null : <View style={s.line} />}
                </View>
                <View style={isLast ? s.stepText : [s.stepText, s.stepTextSpaced]}>
                  <Text style={isCurrent ? [s.stepName, s.stepNameCurrent] : isPast ? [s.stepName, s.stepNamePast] : s.stepName}>
                    {phase.fullLabel}
                  </Text>
                  <Text style={s.stepDesc} numberOfLines={2}>{phase.short}</Text>
                </View>
              </View>
            );
          })}
        </Animated.View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(26,23,18,0.48)",
  },
  sheet: {
    backgroundColor: "#FDFAF4",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0D8CC",
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontFamily: SERIF,
    fontSize: 22,
    color: "#1A1410",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0EBE1",
  },

  // ── Stepper ──
  step: {
    flexDirection: "row",
  },
  rail: {
    width: 24,
    alignItems: "center",
    marginRight: 14,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dotCurrent: { backgroundColor: "#2D4A34" },
  dotPast:    { backgroundColor: "#8A7F72" },
  dotFuture:  { borderWidth: 1.5, borderColor: "#C8BFB2", backgroundColor: "#FDFAF4" },
  dotNum: {
    fontSize: 12,
    fontWeight: "600",
  },
  dotNumFilled: { color: "#FFFFFF" },
  dotNumFuture: { color: "#8A7F72" },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: "#E0D8CC",
    marginVertical: 4,
  },
  stepText: {
    flex: 1,
    paddingTop: 1,
  },
  stepTextSpaced: {
    paddingBottom: 20,
  },
  stepName: {
    fontFamily: SERIF,
    fontSize: 16,
    color: "#1A1410",
    marginBottom: 2,
  },
  stepNameCurrent: { fontFamily: SERIF_BOLD },
  stepNamePast:    { color: "#8A7F72" },
  stepDesc: {
    fontSize: 13,
    color: "#6B6358",
    lineHeight: 18,
  },
});
