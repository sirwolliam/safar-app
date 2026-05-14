/**
 * OnboardingCarousel.jsx — Safar
 * Shows once on first launch. Dismissed permanently via AsyncStorage.
 * Full-screen modal overlay with 3 slides, swipe support, dot indicators.
 * Call from HomeScreen — renders as Modal over the entire app.
 */
import React, { useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  Modal, ScrollView, Dimensions, Image,
  Animated,
} from "react-native";
import { colors, spacing, radius, typography } from "../theme";

const SERIF = "SourceSerif4-Regular";
const { width: SW, height: SH } = Dimensions.get("window");

// ── Slide data ────────────────────────────────────────────────────────────────
const SLIDES = [
  {
    id: "welcome",
    image:    require("../assets/kaaba_mixed.png"),
    eyebrow:  "As-sal\u0101mu \u02bfalaykum",
    title:    "Welcome to Safar",
    subtitle: "Your step-by-step companion for Umrah and Hajj. Everything you need, in one place.",
    cta:      null,
  },
  {
    id: "features",
    image:    require("../assets/journey3.png"),
    eyebrow:  "What Safar does",
    title:    "Plan. Learn. Remember.",
    subtitle: null,
    features: [
      { icon: "\uD83D\uDCCB", label: "Step-by-step plan",   desc: "A guided checklist for every ibadah" },
      { icon: "\uD83E\uDD32", label: "Du\u02bf\u0101\u02be for every moment", desc: "Authenticated duas for each sacred place" },
      { icon: "\uD83D\uDCCD", label: "Sacred Places Map",   desc: "Learn the duas tied to each location" },
      { icon: "\uD83D\uDC65", label: "Groups & Milestones", desc: "Share your journey with loved ones" },
    ],
    cta: null,
  },
  {
    id: "start",
    image:    require("../assets/prepare2.png"),
    eyebrow:  "You\u2019re ready",
    title:    "May Allah accept\nyour journey",
    subtitle: "Start by creating your personal plan, or explore the app at your own pace.",
    cta:      "Get Started",
  },
];

// ── Dot indicator ─────────────────────────────────────────────────────────────
function Dots({ total, active }) {
  return (
    <View style={dt.row}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={i === active ? [dt.dot, dt.dotOn] : dt.dot} />
      ))}
    </View>
  );
}

const dt = StyleSheet.create({
  row:   { flexDirection: "row", gap: 7, alignItems: "center" },
  dot:   { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.35)" },
  dotOn: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#fff" },
});

// ── Single slide ──────────────────────────────────────────────────────────────
function Slide({ slide, isLast, onSkip, onNext, onDone, slideIndex, total }) {
  return (
    <View style={{ width: SW, height: SH }}>
      {/* Full-bleed background image */}
      <Image
        source={slide.image}
        style={sl.bgImage}
        resizeMode="cover"
      />

      {/* Dark gradient overlay */}
      <View style={sl.scrim} />

      {/* Skip button — top right */}
      {!isLast && (
        <TouchableOpacity style={sl.skipBtn} onPress={onSkip} activeOpacity={0.8}>
          <Text style={sl.skipTxt}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Content — bottom third */}
      <View style={sl.content}>

        {/* Eyebrow */}
        <Text style={sl.eyebrow}>{slide.eyebrow}</Text>

        {/* Title */}
        <Text style={sl.title}>{slide.title}</Text>

        {/* Subtitle */}
        {slide.subtitle ? (
          <Text style={sl.subtitle}>{slide.subtitle}</Text>
        ) : null}

        {/* Feature list (slide 2 only) */}
        {slide.features ? (
          <View style={sl.features}>
            {slide.features.map(f => (
              <View key={f.label} style={sl.featureRow}>
                <View style={sl.featureIconWrap}>
                  <Text style={sl.featureIcon}>{f.icon}</Text>
                </View>
                <View style={sl.featureText}>
                  <Text style={sl.featureLabel}>{f.label}</Text>
                  <Text style={sl.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {/* Dot indicators */}
        <Dots total={total} active={slideIndex} />

        {/* CTA / Next button */}
        <View style={sl.btnRow}>
          {isLast ? (
            <TouchableOpacity style={sl.ctaBtn} onPress={onDone} activeOpacity={0.88}>
              <Text style={sl.ctaBtnTxt}>{slide.cta}</Text>
              <Text style={sl.ctaBtnArrow}>{"\u2192"}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={sl.nextBtn} onPress={onNext} activeOpacity={0.85}>
              <Text style={sl.nextBtnTxt}>Next</Text>
              <Text style={sl.nextBtnArrow}>{"\u203a"}</Text>
            </TouchableOpacity>
          )}
        </View>

      </View>
    </View>
  );
}

const sl = StyleSheet.create({
  bgImage: {
    position: "absolute", top: 0, left: 0,
    width: SW, height: SH,
  },
  scrim: {
    position: "absolute", top: 0, left: 0,
    width: SW, height: SH,
    backgroundColor: "rgba(10,8,4,0.52)",
  },
  skipBtn: {
    position: "absolute",
    top: 48,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  skipTxt: { fontSize: 13, color: "rgba(255,255,255,0.8)" },

  content: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 32,
    backgroundColor: "rgba(10,8,4,0.35)",
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: "400",
    color: "rgba(255,255,255,0.65)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontFamily: SERIF,
    fontSize: 34,
    fontWeight: "400",
    color: "#fff",
    lineHeight: 42,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "300",
    lineHeight: 24,
    marginBottom: 20,
  },

  // Feature rows (slide 2)
  features: {
    gap: 10,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  featureIcon:  { fontSize: 20 },
  featureText:  { flex: 1 },
  featureLabel: { fontFamily: SERIF, fontSize: 15, color: "#fff", marginBottom: 2 },
  featureDesc:  { fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: "300" },

  // Dots
  btnRow: { marginTop: 20 },

  // Next button
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
    paddingVertical: 14,
  },
  nextBtnTxt:   { fontSize: 16, color: "#fff", fontWeight: "500" },
  nextBtnArrow: { fontSize: 20, color: "rgba(255,255,255,0.7)" },

  // Get Started CTA
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2F5D50",
    borderRadius: 10,
    paddingVertical: 15,
    shadowColor: "#2F5D50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaBtnTxt:   { fontFamily: SERIF, fontSize: 17, color: "#fff", fontWeight: "500" },
  ctaBtnArrow: { fontSize: 18, color: "rgba(255,255,255,0.75)" },
});

// ── Main carousel ─────────────────────────────────────────────────────────────
export default function OnboardingCarousel({ visible, onComplete }) {
  const [idx, setIdx] = useState(0);
  const scrollRef = useRef(null);

  const goTo = (i) => {
    scrollRef.current?.scrollTo({ x: i * SW, animated: true });
    setIdx(i);
  };

  const handleNext = () => {
    if (idx < SLIDES.length - 1) goTo(idx + 1);
  };

  const handleScroll = (e) => {
    const newIdx = Math.round(e.nativeEvent.contentOffset.x / SW);
    if (newIdx !== idx) setIdx(newIdx);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      >
        {SLIDES.map((slide, i) => (
          <Slide
            key={slide.id}
            slide={slide}
            slideIndex={i}
            total={SLIDES.length}
            isLast={i === SLIDES.length - 1}
            onSkip={onComplete}
            onNext={handleNext}
            onDone={onComplete}
          />
        ))}
      </ScrollView>
    </Modal>
  );
}
