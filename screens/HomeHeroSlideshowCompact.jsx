import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, Dimensions } from "react-native";
import { sharedCardStyles } from "./sharedCardStyles";
import { HERO_SLIDES } from "./HomeHeroSlideshowClassic";

const SW = Dimensions.get("window").width;
const CARD_W = SW - 16;
const CARD_H = 210;
const TEXT_COL_W = Math.round(SW * 0.33);   // hard 33% cap
const PAGE_W = SW;                            // FlatList paging math must use SW, not CARD_W (item footprint includes the 8px margin on each side)

export default function HomeHeroSlideshowCompact({ navigation, onShowAbout }) {
  const [heroSlide, setHeroSlide] = useState(0);
  const heroRef   = useRef(null);
  const heroTimer = useRef(null);

  // Auto-advance every 6s
  useEffect(() => {
    heroTimer.current = setInterval(() => {
      setHeroSlide((prev) => {
        const next = (prev + 1) % HERO_SLIDES.length;
        heroRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 6000);
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

  const renderSlide = ({ item: slide }) => (
    <View style={s.pageWrap}>
      <View style={s.card}>
        <Image
          source={slide.image}
          style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, resizeMode: "cover" }}
        />

        <View style={s.textCol}>
          <Text style={[sharedCardStyles.eyebrowText, { color: "#C8A96A" }]}>{slide.tag}</Text>
          <Text style={s.headline} numberOfLines={2}>{slide.headline}</Text>
          <Text style={s.sub} numberOfLines={3}>{slide.sub}</Text>
          <TouchableOpacity style={s.cta} activeOpacity={0.85} onPress={() => handleHeroCta(slide)}>
            <Text style={s.ctaText}>{slide.cta}{"  →"}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.dots}>
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

  return (
    <FlatList
      ref={heroRef}
      data={HERO_SLIDES}
      renderItem={renderSlide}
      keyExtractor={(item) => item.id}
      horizontal
      pagingEnabled
      snapToInterval={PAGE_W}
      decelerationRate="fast"
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={(e) => {
        const idx = Math.round(e.nativeEvent.contentOffset.x / PAGE_W);
        setHeroSlide(idx);
      }}
      style={{ height: CARD_H }}
      getItemLayout={(_, index) => ({
        length: PAGE_W,
        offset: PAGE_W * index,
        index,
      })}
    />
  );
}

const s = StyleSheet.create({
  pageWrap: {
    width: SW,
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    marginHorizontal: 8,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#4A5C48",
  },
  textCol: {
    position: "absolute",
    left: 16,
    top: 16,
    bottom: 16,
    width: TEXT_COL_W,
    justifyContent: "flex-start",
  },
  headline: {
    fontFamily: "SourceSerif4-Regular",
    fontSize: 18,
    color: "#FDFAF4",
    lineHeight: 23,
    marginTop: 6,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  sub: {
    fontSize: 11,
    color: "#FDFAF4",
    lineHeight: 15,
    marginTop: 6,
    opacity: 0.92,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cta: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#FDFAF4",
    marginTop: 12,
  },
  ctaText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1C1A14",
  },
  dots: {
    position: "absolute",
    bottom: 14,
    left: 16,
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(253,250,244,0.35)",
  },
  dotActive: {
    backgroundColor: "#C8A96A",
    width: 16,
  },
});
