import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, Dimensions } from "react-native";

const SERIF = "SourceSerif4-Regular";
const { width: SW } = Dimensions.get("window");

// ── Hero slides ───────────────────────────────────────────────────────────────
export const HERO_SLIDES = [
  {
    id: "welcome",
    image: require("../assets/hero_kaaba.png"),
    scrim: "rgba(8,20,12,0.28)",
    tag: "WELCOME TO SAFAR",
    headline: "Your companion for\nHajj and Umrah",
    sub: "Step-by-step guides, duas, smart\nchecklists and tools to help. One app\nfor every step of Hajj and Umrah.",
    cta: "Learn more",
    ctaIsAbout: true,
    ctaScreen: null,
    showGreeting: false,
  },
  {
    id: "media",
    image: require("../assets/hero_media.png"),
    scrim: "rgba(12,8,4,0.55)",
    tag: "HELPFUL MEDIA",
    headline: "Be Ready.",
    sub: "Scholarly guides, travel tips,\nand inspirational content to\nhelp you before, during, and\nafter your journey.",
    cta: "Explore Media",
    ctaIsAbout: false,
    ctaScreen: { tab: "Learn", screen: "Media" },
    showGreeting: false,
  },
  {
    id: "duas",
    image: require("../assets/hero_dua.png"),
    scrim: "rgba(8,16,12,0.26)",
    tag: "DUAS & WORSHIP",
    headline: "Duas for Every Moment",
    sub: "A growing library of verified duas\nfor every occasion - with audio\nso you can learn and practice\nbefore you go.",
    cta: "View duas",
    ctaIsAbout: false,
    ctaScreen: { tab: "Practice", screen: "MyDuas" },
    showGreeting: false,
  },
];

export default function HomeHeroSlideshowClassic({ navigation, displayName, onShowAbout }) {
  const [heroSlide, setHeroSlide] = useState(0);
  const heroRef   = useRef(null);
  const heroTimer = useRef(null);

  // Auto-advance hero every 5s
  useEffect(() => {
    heroTimer.current = setInterval(() => {
      setHeroSlide((prev) => {
        const next = (prev + 1) % HERO_SLIDES.length;
        heroRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 12000);
    return () => clearInterval(heroTimer.current);
  }, []);

  const handleHeroCta = (slide) => {
    if (slide.ctaIsAbout) { onShowAbout(); return; }
    if (slide.ctaScreen) {
      if (typeof slide.ctaScreen === "string") {
        navigation?.navigate?.(slide.ctaScreen);
      } else {
        navigation?.getParent?.()?.navigate?.(slide.ctaScreen.tab, { screen: slide.ctaScreen.screen, initial: false, params: { returnToTab: "Home" } });
      }
    }
  };

  // ── Hero slide renderer ───────────────────────────────────────────────────
  const renderSlide = ({ item: slide }) => {
    const isKaaba = slide.id === "welcome";
    return (
      <View style={{ width: SW - 16, aspectRatio: 1.8, overflow: "hidden", marginHorizontal: 8, borderRadius: 16 }}>

        {/* Ka'bah slide: custom Image so we can scale + shift it */}
        {isKaaba ? (
          <Image
            source={slide.image}
            style={{
              position:   "absolute",
              width:      "115%",
              height:     "120%",
              top:        "-12%",
              left:       "-7.5%",
              resizeMode: "cover",
            }}
          />
        ) : (
          <Image
            source={slide.image}
            style={{ position: "absolute", width: "100%", height: "100%", resizeMode: "cover" }}
          />
        )}

        {/* Very light scrim — keeps photo bright */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor:"rgba(0,0,0,0.20)" }]} />

        {/* Floating panel */}
        <View style={s.heroPanel}>
          <Text style={s.heroTag}>{slide.tag}</Text>

          {slide.showGreeting ? (
            <TouchableOpacity activeOpacity={0.85} onPress={() => onShowAbout()}>
              <Text style={s.heroPanelGreeting} numberOfLines={1} adjustsFontSizeToFit>
                {displayName}
              </Text>
            </TouchableOpacity>
          ) : null}

          {slide.headline ? (
            <Text style={s.heroPanelHeadline}>
              {slide.headline}
            </Text>
          ) : null}

          <Text style={s.heroPanelSub}>
            {slide.sub}
          </Text>
        </View>

        <View style={s.heroBottomRow}>
          <TouchableOpacity
            style={s.heroPanelCta}
            activeOpacity={0.85}
            onPress={() => handleHeroCta(slide)}
          >
            <Text style={s.heroPanelCtaTxt}>{slide.cta}{"  \u2192"}</Text>
          </TouchableOpacity>

          <View style={s.heroDots}>
            {HERO_SLIDES.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  heroRef.current?.scrollToIndex({ index: i, animated: true });
                  setHeroSlide(i);
                }}
              >
                <View style={[s.dot, i === heroSlide ? s.dotActive : null]} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </View>
    );
  };

  return (
    <FlatList
      ref={heroRef}
      data={HERO_SLIDES}
      renderItem={renderSlide}
      keyExtractor={(item) => item.id}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={(e) => {
        const idx = Math.round(e.nativeEvent.contentOffset.x / SW);
        setHeroSlide(idx);
      }}
      style={{ aspectRatio: 1.8, width: SW }}
      getItemLayout={(_, index) => ({
        length: SW,
        offset: SW * index,
        index,
      })}
    />
  );
}

const s = StyleSheet.create({
  // ── Hero: bottom floating glass panel ────────────────────────────────────
  heroPanel: {
    position: "absolute",
    top:      22,
    left:     14,
    right:    14,
  },
  heroTag: {
    fontSize:      10,
    color:         "#FDFAF4",
    fontWeight:    "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom:  10,
    textShadowColor:  "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroPanelGreeting: {
    fontSize:     18,
    color:        "#FFFFFF",
    fontWeight:   "400",
    lineHeight:   22,
    marginBottom: 4,
  },
  heroPanelHeadline: {
    fontSize:     18,
    color:        "rgba(235,228,210,0.92)",
    fontWeight:   "400",
    lineHeight:   22,
    marginBottom: 4,
  },
  heroPanelSub: {
    fontSize:     14,
    color:        "#FFFFFF",
    lineHeight:   19,
    fontWeight:   "400",
    marginBottom: 10,
  },
  heroBottomRow: {
    position:       "absolute",
    bottom:         17,
    left:           14,
    right:          14,
    flexDirection:  "row",
    justifyContent: "space-between",
    alignItems:     "center",
  },
  heroPanelCta: {
    backgroundColor: "#4A5C48",
    borderRadius:    9,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems:      "center",
    alignSelf:       "flex-start",
  },
  heroPanelCtaTxt: {
    fontSize:      13,
    color:         "#FFFFFF",
    fontWeight:    "600",
    letterSpacing: 0.3,
  },

  // ── Hero: dot indicators inside panel ─────────────────────────────────────
  heroDots: {
    flexDirection: "row",
    gap:            6,
    marginRight:    20,
  },
  dot: {
    width:           5,
    height:          5,
    borderRadius:    3,
    backgroundColor: "rgba(255,255,255,0.30)",
  },
  dotActive: {
    backgroundColor: "#FFFFFF",
    width:           18,
  },

  // ── Old hero styles kept for reference — no longer used ──────────────────
  slideContent:   { position:"absolute", bottom:14, left:22, right:22 },
  tagText:        { fontSize:10, color:"rgba(255,255,255,0.92)", fontWeight:"700", textTransform:"uppercase", marginBottom:8 },
  heroGreeting:   { fontFamily:SERIF, fontSize:45, color:"#FFFFFF", fontWeight:"400", lineHeight:50, marginBottom:6 },
  heroHeadline:   { fontFamily:SERIF, fontSize:32, color:"#FFFFFF", fontWeight:"600", lineHeight:40, marginBottom:8 },
  heroSub:        { fontSize:17, color:"rgba(255,255,255,0.88)", lineHeight:25, fontWeight:"400", marginBottom:16 },
  heroCta:        { alignSelf:"flex-start", backgroundColor:"rgba(255,255,255,0.75)", borderRadius:4, paddingHorizontal:12, paddingVertical:5 },
  heroCtaText:    { fontSize:12, color:"#4A5C48", fontWeight:"700" },
});
