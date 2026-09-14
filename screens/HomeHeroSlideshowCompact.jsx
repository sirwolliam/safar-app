import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { sharedCardStyles } from "./sharedCardStyles";
import { HERO_SLIDES } from "./HomeHeroSlideshowClassic";

const SERIF = "SourceSerif4-Regular";
const SW = Dimensions.get("window").width;

// Visible card sizing — inset 8px each side, matching the marginHorizontal: 8
// convention used by every other card on Home.
const CARD_W = SW - 16;
const CARD_H = 210;
const IMAGE_W = Math.round(CARD_W * 0.49);
const TEXT_COL_W = Math.round(CARD_W * 0.52);
const GRADIENT_W = 60;

// NOTE: FlatList paging/offset math (getItemLayout, snapToInterval, the scroll-end
// index calc) must use SW, not CARD_W. Each rendered item's actual footprint in the
// scroll content is CARD_W + marginHorizontal*2 = SW (RN flexbox margins don't
// collapse), so SW is the true per-slide advance distance. Using CARD_W there would
// under-measure by 16px per slide and the snap position would drift out of sync with
// the dot indicator as the user pages through.
const PAGE_W = SW;

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
          style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: IMAGE_W, resizeMode: "cover" }}
        />
        <LinearGradient
          colors={["#4A5C48", "rgba(74,92,72,0)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ position: "absolute", left: CARD_W - IMAGE_W, top: 0, bottom: 0, width: GRADIENT_W }}
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
    backgroundColor: "#4A5C48",
    position: "relative",
  },
  textCol: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: TEXT_COL_W,
    padding: 16,
  },
  headline: {
    fontFamily: SERIF,
    fontSize: 20,
    color: "#FDFAF4",
    lineHeight: 26,
    marginTop: 6,
  },
  sub: {
    fontSize: 12,
    color: "rgba(253,250,244,0.85)",
    lineHeight: 17,
    marginTop: 6,
  },
  cta: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FDFAF4",
    marginTop: 12,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1C1A14",
  },
  dots: {
    position: "absolute",
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
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
