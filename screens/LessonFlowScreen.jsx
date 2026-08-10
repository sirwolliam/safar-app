/**
 * LessonFlowScreen.jsx — Safar
 * Reusable multi-screen lesson pager. Interior block screens use the
 * DuaDetailScreen-matched header, now with a dynamic "LESSON N" label.
 * NarrativeTextBlock uses two-tier spacing: tight after a heading, wider
 * before a new heading. BulletListBlock numbers are plain typography,
 * not circular badges. QaCardListBlock's intro (if present) renders as
 * its own card, matching the Q&A cards below it.
 */
import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Dimensions, Image, ImageBackground, ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Defs, LinearGradient, Stop, Mask, Rect, Polygon } from "react-native-svg";
import { PATTERN_PATH } from "./headerPatternPath";
import {
  CaretRight, BookmarkSimple, Clock, Question, MoonStars, BookOpen, Heart, Star, ListChecks,
} from "phosphor-react-native";
import { LESSONS } from "../content/lessons";

const SERIF = "SourceSerif4-Regular";
const { width: SW, height: SH } = Dimensions.get("window");

const BG        = "#F5F0E8";
const DARK_TEXT = "#1C1A14";
const MID_TEXT  = "#4A3F30";
const MUTED     = "#8A7D6A";
const GOLD      = "#BF9F60";

const ICON_MAP = { Question, MoonStars, BookOpen, Heart, Star, ListChecks };

function StarOrnament({ size = 20, color = GOLD }) {
  const c = size / 2;
  const r = size * 0.38;
  const pts1 = Array.from({ length: 4 }, (_, i) => {
    const a = (i * 90 - 45) * Math.PI / 180;
    return `${(c + r * Math.cos(a)).toFixed(1)},${(c + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  const pts2 = Array.from({ length: 4 }, (_, i) => {
    const a = (i * 90) * Math.PI / 180;
    return `${(c + r * Math.cos(a)).toFixed(1)},${(c + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Polygon points={pts1} fill={color} opacity="0.9" />
      <Polygon points={pts2} fill={color} opacity="0.9" />
    </Svg>
  );
}

function HeaderPattern({ width, height }) {
  const scale = width / 375;
  const vh = 133.62 * scale;
  return (
    <Svg width={width} height={vh} viewBox="0 0 375 133.62" style={{ position: "absolute", top: 0, left: 0 }}>
      <Defs>
        <LinearGradient id="hpGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#fff" stopOpacity="1" />
          <Stop offset="0.7" stopColor="#fff" stopOpacity="0.4" />
          <Stop offset="1" stopColor="#fff" stopOpacity="0" />
        </LinearGradient>
        <Mask id="hpMask">
          <Rect width="375" height="133.62" fill="url(#hpGrad)" />
        </Mask>
      </Defs>
      <Path d={PATTERN_PATH} fill="#bf9f60" opacity="0.65" mask="url(#hpMask)" />
    </Svg>
  );
}

function ArchFrame({ width }) {
  const W = width;
  const H = 220;
  const archW = W * 0.72;
  const xL = (W - archW) / 2;
  const xR = xL + archW;
  const cx = W / 2;
  const cp1 = archW * 0.18;
  const peakY = 12;
  const shoulderY = H * 0.55;
  const d = [
    `M ${xL} ${H}`,
    `C ${xL} ${shoulderY} ${cx - cp1} ${peakY + 18} ${cx} ${peakY}`,
    `C ${cx + cp1} ${peakY + 18} ${xR} ${shoulderY} ${xR} ${H}`,
  ].join(" ");
  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Path d={d} fill="none" stroke={GOLD} strokeWidth="1" opacity="0.30" />
    </Svg>
  );
}

function IconBack({ color = MID_TEXT, size = 20 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M11 6l-6 6 6 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CoverScrim({ width, height }) {
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id="coverScrimGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#0A0804" stopOpacity="0.10" />
          <Stop offset="0.45" stopColor="#0A0804" stopOpacity="0.25" />
          <Stop offset="0.65" stopColor="#0A0804" stopOpacity="0.50" />
          <Stop offset="1" stopColor="#0A0804" stopOpacity="0.72" />
        </LinearGradient>
      </Defs>
      <Rect width={width} height={height} fill="url(#coverScrimGrad)" />
    </Svg>
  );
}

function HeroIcon({ name, image }) {
  if (image === "kaaba") {
    return (
      <View style={bs.kaabaImageWrap}>
        <Image source={require("../assets/kaaba_framed.png")} style={bs.kaabaImage} resizeMode="contain" />
      </View>
    );
  }
  const Icon = ICON_MAP[name] || BookOpen;
  return (
    <View style={bs.heroIconWrap}>
      <Icon size={40} color={GOLD} weight="regular" />
    </View>
  );
}

function SmallIcon({ name }) {
  const Icon = ICON_MAP[name] || Question;
  return (
    <View style={bs.smallIconWrap}>
      <Icon size={20} color={GOLD} weight="regular" />
    </View>
  );
}

function CoverBlock({ block, navigation, insets }) {
  const content = (
    <>
      <View style={[bs.coverTopRow, { paddingTop: (insets?.top ?? 0) + 12 }]}>
        <TouchableOpacity style={bs.coverIconBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.8}>
          <IconBack color={block.image ? "#FFFFFF" : MID_TEXT} size={20} />
        </TouchableOpacity>
        <TouchableOpacity style={bs.coverIconBtn} activeOpacity={0.8}>
          <BookmarkSimple size={18} color={block.image ? "#FFFFFF" : MID_TEXT} weight="regular" />
        </TouchableOpacity>
      </View>
      <View style={bs.coverSpacer} />
      <View style={bs.coverBottom}>
        <Text style={bs.coverBadge}>{block.lessonBadge}</Text>
        <Text style={block.image ? [bs.coverTitle, bs.coverTitleOnImage] : bs.coverTitle}>{block.title}</Text>
        <Text style={block.image ? [bs.coverSubtitle, bs.coverSubtitleOnImage] : bs.coverSubtitle}>{block.subtitle}</Text>
        <View style={bs.coverMetaRow}>
          <Clock size={14} color={GOLD} weight="regular" style={{ marginRight: 6 }} />
          <Text style={block.image ? [bs.coverMeta, bs.coverMetaOnImage] : bs.coverMeta}>{block.readingMinutes} min read</Text>
        </View>
      </View>
    </>
  );

  if (block.image) {
    return (
      <ImageBackground source={block.image} style={bs.coverWrap} resizeMode="cover">
        <CoverScrim width={SW} height={SH} />
        {content}
      </ImageBackground>
    );
  }

  return <View style={[bs.coverWrap, { backgroundColor: BG }]}>{content}</View>;
}

function CardListBlock({ block }) {
  return (
    <ScrollView style={bs.blockWrap} contentContainerStyle={bs.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={[bs.cardStack, block.cardGap ? { gap: block.cardGap } : null]}>
        {block.cards.map((card) => (
          <View key={card.id} style={bs.card}>
            <SmallIcon name={card.icon} />
            <Text style={bs.cardLabel}>{card.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function QaCardListBlock({ block }) {
  return (
    <ScrollView style={bs.blockWrap} contentContainerStyle={bs.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={[bs.cardStack, { marginTop: -20 }]}>
        {block.intro ? (
          <View style={bs.qaCard}>
            <Text style={bs.qaIntro}>{block.intro}</Text>
          </View>
        ) : null}
        {block.cards.map((card) => (
          <View key={card.id} style={bs.qaCard}>
            <Text style={bs.qaQuestion}>{card.question}</Text>
            <Text style={bs.qaAnswer}>{card.answer}</Text>
          </View>
        ))}
        {block.closing ? <Text style={bs.qaClosing}>{block.closing}</Text> : null}
      </View>
    </ScrollView>
  );
}

function NarrativeTextBlock({ block }) {
  const paragraphs = block.paragraphs;
  return (
    <ScrollView style={bs.blockWrap} contentContainerStyle={bs.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={block.image ? { marginTop: -33, alignItems: "center", width: "100%" } : { alignItems: "center", width: "100%" }}>
        <HeroIcon name={block.icon} image={block.image} />
        <View style={bs.narrativeWrap}>
          {paragraphs.map((p, i) => {
            const isHeading = typeof p !== "string";
            const next = paragraphs[i + 1];
            const nextIsHeading = next != null && typeof next !== "string";
            const isLast = i === paragraphs.length - 1;
            const marginBottom = isLast ? 0 : nextIsHeading ? 22 : 8;
            return isHeading ? (
              <Text key={i} style={[bs.narrativeHeading, { marginBottom }]}>{p.heading}</Text>
            ) : (
              <Text key={i} style={[bs.narrativeParagraph, { marginBottom }]}>{p}</Text>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

function BulletListBlock({ block }) {
  return (
    <ScrollView style={bs.blockWrap} contentContainerStyle={bs.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={bs.bulletGrid}>
        {block.bullets.map((b, i) => (
          <View key={i} style={bs.bulletTile}>
            <Text style={bs.bulletTileNumber}>{i + 1}</Text>
            <Text style={bs.bulletTileText}>{b}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function NumberedStepsBlock({ block }) {
  return (
    <ScrollView style={bs.blockWrap} contentContainerStyle={bs.scrollContent} showsVerticalScrollIndicator={false}>
      <HeroIcon name={block.icon} />
      <View style={{ width: "100%", gap: 14 }}>
        {block.steps.map((step, i) => (
          <View key={i} style={bs.stepRow}>
            <Text style={bs.stepNum}>{i + 1}.</Text>
            <Text style={bs.stepText}>{step}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const BLOCK_COMPONENTS = {
  cover: CoverBlock,
  cardList: CardListBlock,
  qaCardList: QaCardListBlock,
  narrativeText: NarrativeTextBlock,
  bulletList: BulletListBlock,
  numberedSteps: NumberedStepsBlock,
};

export default function LessonFlowScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const lessonId = route?.params?.lessonId;
  const lesson = LESSONS[lessonId];

  const [current, setCurrent] = useState(0);
  const [headerH, setHeaderH] = useState(0);
  const flatRef = useRef(null);

  if (!lesson) {
    return (
      <View style={s.safe}>
        <Text style={s.notFound}>Lesson not found</Text>
      </View>
    );
  }

  const blocks = lesson.blocks;
  const total = blocks.length;
  const isFirst = current === 0;
  const isLast = current === total - 1;
  const activeBlock = blocks[current];
  const isCoverActive = activeBlock.type === "cover";

  const goTo = (idx) => {
    if (idx < 0 || idx >= total) return;
    flatRef.current?.scrollToIndex({ index: idx, animated: true });
    setCurrent(idx);
  };

  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) setCurrent(viewableItems[0].index ?? 0);
  }).current;

  const continueLabel = isFirst ? "Begin Lesson" : "Continue";
  const onContinuePress = () => goTo(current + 1);

  const nextLessonNum = String(lesson.lessonNumber + 1).padStart(2, "0");
  const nextLessonId = lesson.guide + "-" + nextLessonNum;
  const nextLesson = LESSONS[nextLessonId];

  return (
    <View style={s.safe}>
      {!isCoverActive ? (
        <>
          <View style={s.headerZone} onLayout={(e) => setHeaderH(e.nativeEvent.layout.height)}>
            <HeaderPattern width={SW} height={headerH} />
            <ArchFrame width={SW} />
            <View style={{ height: insets.top + 22 }} />
            <View style={s.headerStar}>
              <StarOrnament size={22} color={GOLD} />
            </View>
            <Text style={s.lessonEyebrow}>{lesson.title.toUpperCase()}</Text>
            <Text style={s.lessonNumberLabel}>{"LESSON " + lesson.lessonNumber}</Text>
            {activeBlock.lessonBadge ? (
              <Text style={s.stageLabel}>{activeBlock.lessonBadge}</Text>
            ) : null}
            <Text style={s.duaTitle}>{activeBlock.title}</Text>
          </View>

          <View style={[s.topNav, { top: insets.top + 8 }]}>
            <TouchableOpacity style={s.navCircle} onPress={() => goTo(current - 1)} activeOpacity={0.8}>
              <IconBack color={MID_TEXT} size={20} />
            </TouchableOpacity>
          </View>
        </>
      ) : null}

      <FlatList
        ref={flatRef}
        style={{ flex: 1 }}
        data={blocks}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewRef}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        getItemLayout={(_, i) => ({ length: SW, offset: SW * i, index: i })}
        renderItem={({ item }) => {
          const BlockComponent = BLOCK_COMPONENTS[item.type];
          if (!BlockComponent) return <View style={{ width: SW }} />;
          return (
            <View style={{ width: SW }}>
              <BlockComponent block={item} navigation={navigation} insets={insets} />
            </View>
          );
        }}
      />

      <View style={[s.footerOverlay, { paddingBottom: 9 + insets.bottom }]} pointerEvents="box-none">
        <View style={s.pagerRow}>
          <TouchableOpacity onPress={() => goTo(current - 1)} disabled={isFirst} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={[isCoverActive ? s.pagerArrowOnImage : s.pagerArrow, isFirst ? (isCoverActive ? s.pagerArrowDisabledOnImage : s.pagerArrowDisabled) : null]}>{"‹"}</Text>
          </TouchableOpacity>
          <Text style={isCoverActive ? s.pagerLabelOnImage : s.pagerLabel}>{(current + 1) + " of " + total}</Text>
          <TouchableOpacity onPress={() => goTo(current + 1)} disabled={isLast} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <CaretRight size={16} color={isLast ? (isCoverActive ? "rgba(255,255,255,0.35)" : "#DDD5C0") : (isCoverActive ? "#FFFFFF" : GOLD)} weight="bold" />
          </TouchableOpacity>
        </View>

        {isLast ? (
          <View style={s.lastScreenButtons}>
            {nextLesson ? (
              <TouchableOpacity style={s.continueBtn} onPress={() => navigation.replace("LessonFlow", { lessonId: nextLessonId })} activeOpacity={0.88}>
                <Text style={s.continueBtnText}>{"Next Lesson: " + nextLesson.title}</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={s.secondaryBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.8}>
              <Text style={s.secondaryBtnText}>Return to Lesson Menu</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={s.continueBtn} onPress={onContinuePress} activeOpacity={0.88}>
            <Text style={s.continueBtnText}>{continueLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", fontSize: 16, color: "#8A7D6A" },

  headerZone: { alignItems: "center", paddingBottom: 26, overflow: "hidden", backgroundColor: BG, position: "relative" },
  headerStar: { marginBottom: 5, zIndex: 2 },
  stageLabel: { fontSize: 11, fontWeight: "700", color: GOLD, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 },
  lessonEyebrow: { fontSize: 11, fontWeight: "700", color: GOLD, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 2 },
  lessonNumberLabel: { fontFamily: SERIF, fontSize: 15, fontWeight: "400", color: MUTED, textAlign: "center", marginBottom: 6 },
  duaTitle: { fontFamily: SERIF, fontSize: 30, fontWeight: "600", color: DARK_TEXT, textAlign: "center", lineHeight: 38, paddingHorizontal: 32, marginTop: 40 },

  topNav: { position: "absolute", left: 0, right: 0, flexDirection: "row", justifyContent: "flex-start", paddingHorizontal: 16, zIndex: 20 },
  navCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.75)", alignItems: "center", justifyContent: "center", shadowColor: "#2A1A08", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },

  footerOverlay: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 10, backgroundColor: "transparent" },
  pagerRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 14 },
  pagerArrow: { fontSize: 20, color: GOLD, lineHeight: 24 },
  pagerArrowDisabled: { color: "#DDD5C0" },
  pagerArrowOnImage: { fontSize: 20, color: "#FFFFFF", lineHeight: 24 },
  pagerArrowDisabledOnImage: { color: "rgba(255,255,255,0.35)" },
  pagerLabel: { fontSize: 13, color: MID_TEXT, fontWeight: "500", minWidth: 60, textAlign: "center" },
  pagerLabelOnImage: { fontSize: 13, color: "#FFFFFF", fontWeight: "500", minWidth: 60, textAlign: "center" },
  continueBtn: { backgroundColor: "#A28752", borderRadius: 30, paddingVertical: 16, alignItems: "center", justifyContent: "center" },
  continueBtnText: { fontFamily: SERIF, fontSize: 16, color: "#FFFFFF", fontWeight: "600" },
  lastScreenButtons: { gap: 10 },
  secondaryBtn: { paddingVertical: 12, alignItems: "center", justifyContent: "center" },
  secondaryBtnText: { fontFamily: SERIF, fontSize: 15, color: MID_TEXT, fontWeight: "500" },
});

const bs = StyleSheet.create({
  blockWrap: { flex: 1, backgroundColor: BG },
  scrollContent: { paddingHorizontal: 28, paddingTop: 30, paddingBottom: 220, alignItems: "center" },

  heroIconWrap: { width: 88, height: 88, borderRadius: 44, backgroundColor: "#EFEAE0", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  kaabaImageWrap: { alignItems: "center", justifyContent: "center", marginBottom: 16 },
  kaabaImage: { width: 120, height: 120 },
  smallIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#EFEAE0", alignItems: "center", justifyContent: "center", marginRight: 14 },

  cardStack: { width: "100%", gap: 12 },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1, borderColor: "#E4DAC5", padding: 16, width: "100%", shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  cardLabel: { flex: 1, fontSize: 19, color: DARK_TEXT, lineHeight: 26 },

  qaCard: { backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1, borderColor: "#E4DAC5", padding: 16, width: "100%", shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  qaIntro: { fontSize: 18, color: DARK_TEXT, lineHeight: 25 },
  qaQuestion: { fontSize: 19, fontWeight: "700", color: DARK_TEXT, marginBottom: 6 },
  qaAnswer: { fontSize: 18, color: "#5C534A", lineHeight: 25 },
  qaClosing: { fontSize: 19, fontWeight: "700", color: DARK_TEXT, lineHeight: 27, textAlign: "center", marginTop: 6, paddingHorizontal: 6 },

  narrativeWrap: { width: "100%" },
  narrativeHeading: { fontSize: 19, fontWeight: "700", color: DARK_TEXT, lineHeight: 26, textAlign: "center" },
  narrativeParagraph: { fontSize: 19, color: DARK_TEXT, lineHeight: 28, textAlign: "center" },

  bulletGrid: { width: "100%", flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12, marginTop: -15 },
  bulletTile: { width: "48%", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1, borderColor: "#E4DAC5", paddingVertical: 18, paddingHorizontal: 10, shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  bulletTileNumber: { fontSize: 12, fontWeight: "700", color: GOLD, letterSpacing: 0.5, marginBottom: 6 },
  bulletTileText: { fontSize: 18, color: DARK_TEXT, textAlign: "center", lineHeight: 24 },

  bulletRow: { flexDirection: "row", alignItems: "flex-start", backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1, borderColor: "#E4DAC5", padding: 16, shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  bulletDot: { fontSize: 15, color: DARK_TEXT, marginRight: 8 },
  bulletText: { flex: 1, fontSize: 19, color: DARK_TEXT, lineHeight: 26 },

  stepRow: { flexDirection: "row", alignItems: "flex-start" },
  stepNum: { fontSize: 15, color: DARK_TEXT, fontWeight: "700", marginRight: 8, minWidth: 20 },
  stepText: { flex: 1, fontSize: 15, color: DARK_TEXT, lineHeight: 21 },

  coverWrap: { flex: 1 },
  coverTopRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20 },
  coverIconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.10)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.5)", alignItems: "center", justifyContent: "center" },
  coverSpacer: { flex: 1 },
  coverBottom: { paddingHorizontal: 28, paddingBottom: 40, marginBottom: 90 },
  coverBadge: { fontSize: 11, fontWeight: "700", letterSpacing: 1.2, color: GOLD, marginBottom: 8, textTransform: "uppercase" },
  coverTitle: { fontFamily: SERIF, fontSize: 32, color: DARK_TEXT, marginBottom: 10, lineHeight: 38 },
  coverSubtitle: { fontSize: 19, color: "#5C534A", lineHeight: 26, marginBottom: 16 },
  coverMetaRow: { flexDirection: "row", alignItems: "center" },
  coverMeta: { fontSize: 13, color: "#8A7D6A" },
  coverTitleOnImage: { color: "#FFFFFF" },
  coverSubtitleOnImage: { color: "rgba(255,255,255,0.85)" },
  coverMetaOnImage: { color: "rgba(255,255,255,0.75)" },
});
