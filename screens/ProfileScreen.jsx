/**
 * ProfileScreen.jsx — Safar  (tab label: "Prepare")
 * Hub-style header, pill navigation, zone layout.
 */
import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, Image, ImageBackground, ScrollView,
  TouchableOpacity, StyleSheet, Dimensions, Linking,
  TextInput, Modal, StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ListChecks, BookmarkSimple, NotePencil, Compass, Headphones,
  BookOpen, PlayCircle, Gear, Question, Info,
  ArrowSquareOut, MagnifyingGlass, CaretRight,
  Wrench, ShoppingBag, Buildings, MapTrifold, Mosque,
  CurrencyCircleDollar, PencilSimple, PushPin,
} from "phosphor-react-native";
import { getAffiliateUrl } from "../utils/affiliateLinks";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCurrentUser } from "../firebase";

const SERIF = "SourceSerif4-Regular";
const { width: SW } = Dimensions.get("window");

const AVATARS = [
  { key: "kaabah",   src: require("../assets/avatars/avatar-kaabah.png")   },
  { key: "moon",     src: require("../assets/avatars/avatar-moon.png")     },
  { key: "mosque",   src: require("../assets/avatars/avatar-mosque.png")   },
  { key: "beads",    src: require("../assets/avatars/avatar-beads.png")    },
  { key: "compass",  src: require("../assets/avatars/avatar-compass.png")  },
  { key: "book",     src: require("../assets/avatars/avatar-book.png")     },
  { key: "lantern",  src: require("../assets/avatars/avatar-lantern.png")  },
  { key: "hands",    src: require("../assets/avatars/avatar-hands.png")    },
  { key: "leaf",     src: require("../assets/avatars/avatar-leaf.png")     },
  { key: "mountain", src: require("../assets/avatars/avatar-mountain.png") },
  { key: "star",     src: require("../assets/avatars/avatar-star.png")     },
  { key: "heart",    src: require("../assets/avatars/avatar-heart.png")    },
  { key: "sun",      src: require("../assets/avatars/avatar-sun.png")      },
  { key: "dove",     src: require("../assets/avatars/avatar-dove.png")     },
  { key: "flower",   src: require("../assets/avatars/avatar-flower.png")   },
  { key: "wave",     src: require("../assets/avatars/avatar-wave.png")     },
];

const AVATAR_KEY = "safar_avatar_v1";

// ── Data arrays (unchanged) ───────────────────────────────────────────────────
const CATEGORIES = [
  { key: "tools",    label: "Tools",    Icon: Wrench,             desc: "Apps & utilities"           },
  { key: "shop",     label: "Shop",     Icon: ShoppingBag,        desc: "Essentials for the journey" },
  { key: "islamic",  label: "Scholars", Icon: BookOpen,           desc: "Trusted Islamic sources"    },
  { key: "media",    label: "Media",    Icon: PlayCircle,         desc: "Videos & podcasts"          },
  { key: "official", label: "Official", Icon: Buildings,          desc: "Saudi & gov resources"      },
  { key: "settings", label: "Settings", Icon: Gear,               desc: "Account & preferences"      },
];

const TOOLS = [
  { id: "wtexpect",  Icon: MapTrifold,           title: "What to Expect",     sub: "Health, logistics & travel tips",  screen: "WhatToExpect"      },
  { id: "practice",  Icon: Headphones,           title: "Practice & Learn",   sub: "Audio, repeat, and recite",        screen: "PracticeLearn"     },
  { id: "prayer",    Icon: Mosque,               title: "Prayer Times",       sub: "Daily salah times for your city",  screen: "PrayerTimes"       },
  { id: "qibla",     Icon: Compass,              title: "Qibla Finder",       sub: "Direction of the Ka'bah",          screen: "Qibla"             },
  { id: "currency",  Icon: CurrencyCircleDollar, title: "Currency Converter", sub: "SAR to your home currency",        screen: "CurrencyConverter" },
  { id: "board",     Icon: PushPin,               title: "My Board",           sub: "Notes, checklists, and saved content", screen: "MyBoard"      },
  { id: "notes",     Icon: NotePencil,           title: "Notes",              sub: "Personal reflections",             screen: "Notes"             },
];

const AFFILIATE_ITEMS = [
  { id: "ihram",    image: require("../assets/shop/shop-ihram.jpg"),    title: "Ihram Clothing",       sub: "Men's & women's ihram garments",       query: "ihram clothing hajj"            },
  { id: "bag",      image: require("../assets/shop/shop-bag.jpg"),      title: "Hajj & Umrah Bags",    sub: "Waist bags, travel pouches, luggage",  query: "hajj umrah bag"                 },
  { id: "sandals",  image: require("../assets/shop/shop-sandals.jpg"),  title: "Comfortable Sandals",  sub: "Ihram-compliant footwear",             query: "ihram sandals hajj"             },
  { id: "zamzam",   image: require("../assets/shop/shop-zamzam.jpg"),   title: "Zamzam Water Bottle",  sub: "Insulated bottles for the journey",    query: "zamzam water bottle insulated"  },
  { id: "umbrella", image: require("../assets/shop/shop-umbrella.jpg"), title: "Sun Protection",       sub: "Umbrellas, sun cream, cooling towels", query: "hajj umbrella sun protection"   },
  { id: "prayer",   image: require("../assets/shop/shop-prayer.jpg"),   title: "Prayer Essentials",    sub: "Tasbih, prayer mat, compass",          query: "islamic prayer essentials hajj" },
];

const ISLAMIC_REFS = [
  { title: "Sunnah.com",          sub: "Hadith collections — Bukhari, Muslim & more",  url: "https://sunnah.com" },
  { title: "IslamQA.info",        sub: "Scholarly Q&A on fiqh and worship",             url: "https://islamqa.info/en" },
  { title: "SeekersGuidance.org", sub: "Online Islamic courses and fatwa service",      url: "https://seekersguidance.org" },
  { title: "Islamweb.net",        sub: "Fatwas, Quran & hadith research",               url: "https://www.islamweb.net/en" },
];

const MULTIMEDIA = [
  { title: "Hajj Step by Step — Official",   sub: "Saudi Ministry of Hajj YouTube",           url: "https://www.youtube.com/@HajjMinistry" },
  { title: "Yaqeen Institute — Hajj Series", sub: "Video series on the spirituality of Hajj", url: "https://yaqeeninstitute.org" },
  { title: "Umrah Guide — Mufti Menk",       sub: "YouTube playlist — step by step",          url: "https://www.youtube.com/results?search_query=mufti+menk+umrah+guide" },
  { title: "The Deen Show — Hajj Podcast",   sub: "Audio guide to preparing for Hajj",        url: "https://thedeenshow.com" },
  { title: "Qalam Institute — Hajj Prep",    sub: "Podcast and video resources",               url: "https://www.qalaminstitute.org" },
];

const OFFICIAL_LINKS = [
  { title: "Saudi Ministry of Hajj",     sub: "Official pilgrimage authority",           url: "https://www.haj.gov.sa" },
  { title: "Nusuk App",                  sub: "Official Hajj & Umrah services platform", url: "https://www.nusuk.sa" },
  { title: "Eatmarna / Tawakkalna",      sub: "Entry permits and health requirements",   url: "https://www.haj.gov.sa/en/InternalPages/Page/47" },
  { title: "Presidency of Holy Mosques", sub: "Masjid al-Haram & al-Nabawi authority",   url: "https://www.gph.gov.sa" },
  { title: "IATA Travel Centre — KSA",   sub: "Visa and entry requirements",             url: "https://www.iata.org/en/publications/timatic/" },
];

// ── Pill nav items ────────────────────────────────────────────────────────────
const PILLS = [
  { key: "personal",  label: "Personal"  },
  { key: "resources", label: "Resources" },
  { key: "shop",      label: "Shop"      },
  { key: "official",  label: "Official"  },
];

// ── AffiliateCard (unchanged) ─────────────────────────────────────────────────
function AffiliateCard({ items, styles }) {
  return (
    <>
      <View style={styles.affiliateGrid}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.affiliateTile}
            onPress={() => Linking.openURL(getAffiliateUrl(item.query))}
            activeOpacity={0.88}
          >
            <ImageBackground
              source={item.image}
              style={styles.affiliateTileBg}
              imageStyle={{ borderRadius: 14 }}
              resizeMode="cover"
            >
              <LinearGradient
                colors={["transparent", "rgba(20,14,8,0.72)"]}
                start={{ x: 0, y: 0.4 }}
                end={{ x: 0, y: 1 }}
                style={styles.affiliateTileGradient}
              >
                <Text style={styles.affiliateTitle}>{item.title}</Text>
                <Text style={styles.affiliateSub}>{item.sub}</Text>
                <Text style={styles.affiliateShop}>Shop ↗</Text>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.affiliateDisclosure}>
        Links above may earn Safar a small commission at no extra cost to you.
      </Text>
    </>
  );
}

// ── About modal (unchanged) ───────────────────────────────────────────────────
const ABOUT_CONTENT = "Safar is your companion for every step of your sacred Hajj or Umrah journey.\n\nBuild a personalised step-by-step plan, pin your hotel, guide and travel group, practice the most important duʿāʾs, and carry the guidance of scholars in your pocket.\n\nShare milestones with fellow pilgrims, track your progress through every ibadah, and arrive prepared, calm and confident.\n\nMay Allah accept your journey. آمين";

function AboutSafarModal({ visible, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: "rgba(15,36,25,0.65)", justifyContent: "center", alignItems: "center", paddingHorizontal: 28 }}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={{ backgroundColor: "#FDFAF4", borderRadius: 20, padding: 28, width: "100%", shadowColor: "#4A5C48", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.20, shadowRadius: 24, elevation: 12 }}
          onStartShouldSetResponder={() => true}
        >
          <Text style={{ fontFamily: SERIF, fontSize: 22, fontWeight: "600", color: "#4A5C48", marginBottom: 14 }}>What is Safar?</Text>
          <Text style={{ fontSize: 15, color: "#3A3530", lineHeight: 24, marginBottom: 22 }}>{ABOUT_CONTENT}</Text>
          <TouchableOpacity
            style={{ backgroundColor: "#4A5C48", borderRadius: 50, paddingHorizontal: 32, paddingVertical: 11, alignSelf: "flex-start" }}
            onPress={onClose}
          >
            <Text style={{ color: "#FDFAF4", fontSize: 14, fontWeight: "600" }}>Close</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const sectionY  = useRef({});
  const [activeKey,        setActiveKey]        = useState("personal");
  const [searchQuery,      setSearchQuery]      = useState("");
  const [searchFocused,    setSearchFocused]    = useState(false);
  const [showAbout,        setShowAbout]        = useState(false);
  const [avatarKey,        setAvatarKey]        = useState(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [userName,         setUserName]         = useState("Pilgrim");
  const [journeyType,      setJourneyType]      = useState("");
  const [userEmail,        setUserEmail]        = useState("");
  const [showEditSheet,    setShowEditSheet]    = useState(false);
  const [editName,         setEditName]         = useState("");
  const [editEmail,        setEditEmail]        = useState("");
  const [editJourney,      setEditJourney]      = useState("");

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join("");

  const journeyLabel =
    journeyType === "hajj"  ? "Hajj"     :
    journeyType === "umrah" ? "Umrah"    :
    journeyType === "learn" ? "Learning" : "";

  useEffect(() => {
    async function loadProfile() {
      const [name, journey, avatar] =
        await Promise.all([
          AsyncStorage.getItem("safar_user_name_v1"),
          AsyncStorage.getItem("safar_journey_type_v1"),
          AsyncStorage.getItem(AVATAR_KEY),
        ]);
      setUserName(name ?? "Pilgrim");
      setJourneyType(journey ?? "");
      setAvatarKey(avatar ?? null);

      const user = getCurrentUser();
      setUserEmail(user?.email ?? "");
    }
    loadProfile();
  }, []);

  async function selectAvatar(key) {
    setAvatarKey(key);
    setShowAvatarPicker(false);
    await AsyncStorage.setItem(AVATAR_KEY, key);
  }

  async function saveProfile() {
    const trimmedName  = editName.trim();
    const trimmedEmail = editEmail.trim();

    if (trimmedName) {
      await AsyncStorage.setItem("safar_user_name_v1", trimmedName);
      setUserName(trimmedName);
    }
    if (trimmedEmail) {
      await AsyncStorage.setItem("safar_user_email_v1", trimmedEmail);
      setUserEmail(trimmedEmail);
    }
    if (editJourney) {
      await AsyncStorage.setItem("safar_journey_type_v1", editJourney);
      setJourneyType(editJourney);
    }
    setShowEditSheet(false);
  }

  const scrollTo = (key) => {
    const y = sectionY.current[key];
    if (y !== undefined) {
      setActiveKey(key);
      scrollRef.current?.scrollTo({ y, animated: true });
    }
  };

  const q = searchQuery.toLowerCase().trim();
  const filterItems = (items) => !q ? items : items.filter(item =>
    item.title?.toLowerCase().includes(q) || item.sub?.toLowerCase().includes(q)
  );
  const isSearching = q.length > 0;

  const noSearchResults =
    filterItems(TOOLS).length === 0 &&
    filterItems(AFFILIATE_ITEMS).length === 0 &&
    filterItems(ISLAMIC_REFS).length === 0 &&
    filterItems(MULTIMEDIA).length === 0 &&
    filterItems(OFFICIAL_LINKS).length === 0;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />

      {/* ── Photo header ─────────────────────────────────────────────────── */}
      <View style={s.header}>
        <Image
          source={require("../assets/prepare-header.jpg")}
          style={s.headerImg}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.10)", "rgba(58,53,69,0.72)", "rgba(58,53,69,0.96)"]}
          locations={[0, 0.35, 0.75, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={s.gradient}
        />
        <View style={[s.headerContent, { paddingTop: insets.top + 16 }]}>
          <View style={s.titleRow}>
            <View style={s.iconCircle}>
              <ListChecks size={22} color="#C8A96A" weight="regular" />
            </View>
            <Text style={s.headerTitle}>Prepare</Text>
          </View>
          <Text style={s.headerSub}>Everything you need before and during your journey</Text>
        </View>
      </View>

      {/* ── Search bar ───────────────────────────────────────────────────── */}
      <View style={s.searchWrap}>
        <View style={s.searchBar}>
          <MagnifyingGlass size={18} color="#8A7D6A" weight="regular" />
          <TextInput
            style={s.searchInput}
            placeholder="Search tools, resources…"
            placeholderTextColor="#8A7D6A"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            returnKeyType="search"
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={s.searchClear}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* ── Section pill nav ─────────────────────────────────────────────── */}
      {!isSearching ? (
        <View style={s.pillsBar}>
          {PILLS.map((p) => {
            const active = p.key === activeKey;
            return (
              <TouchableOpacity
                key={p.key}
                style={active ? s.pillActive : s.pill}
                onPress={() => scrollTo(p.key)}
                activeOpacity={active ? 1 : 0.7}
              >
                <Text style={active ? s.pillTextActive : s.pillText}>{p.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {isSearching ? (
          <View>
            {filterItems(TOOLS).length > 0 ? (
              <View>
                <Text style={s.eyebrow}>TOOLS</Text>
                <View style={s.listCard}>
                  {filterItems(TOOLS).map((item, i, arr) => {
                    const ItemIcon = item.Icon;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={i < arr.length - 1 ? [s.row, s.rowBorder] : s.row}
                        onPress={() => navigation?.navigate?.(item.screen)}
                        activeOpacity={0.75}
                      >
                        <View style={s.rowIconBox}>
                          <ItemIcon size={24} color="#C8A96A" weight="regular" />
                        </View>
                        <View style={s.rowInfo}>
                          <Text style={s.rowLabel}>{item.title}</Text>
                          <Text style={s.rowSub}>{item.sub}</Text>
                        </View>
                        <CaretRight size={18} color="#C8BFB2" weight="bold" />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : null}

            {filterItems(AFFILIATE_ITEMS).length > 0 ? (
              <View>
                <Text style={s.eyebrow}>SHOP</Text>
                <View style={s.affiliateCard}>
                  <AffiliateCard styles={s} items={filterItems(AFFILIATE_ITEMS)} />
                </View>
              </View>
            ) : null}

            {filterItems(ISLAMIC_REFS).length > 0 ? (
              <View>
                <Text style={s.eyebrow}>ISLAMIC REFERENCE</Text>
                <View style={s.listCard}>
                  {filterItems(ISLAMIC_REFS).map((item, i, arr) => (
                    <TouchableOpacity
                      key={item.url}
                      style={i < arr.length - 1 ? [s.row, s.rowBorder] : s.row}
                      onPress={() => Linking.openURL(item.url)}
                      activeOpacity={0.75}
                    >
                      <View style={s.rowInfo}>
                        <Text style={s.rowLabel}>{item.title}</Text>
                        <Text style={s.rowSub}>{item.sub}</Text>
                      </View>
                      <ArrowSquareOut size={18} color="#C8BFB2" weight="regular" />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null}

            {filterItems(MULTIMEDIA).length > 0 ? (
              <View>
                <Text style={s.eyebrow}>MEDIA</Text>
                <View style={s.listCard}>
                  {filterItems(MULTIMEDIA).map((item, i, arr) => (
                    <TouchableOpacity
                      key={item.url}
                      style={i < arr.length - 1 ? [s.row, s.rowBorder] : s.row}
                      onPress={() => Linking.openURL(item.url)}
                      activeOpacity={0.75}
                    >
                      <View style={s.rowInfo}>
                        <Text style={s.rowLabel}>{item.title}</Text>
                        <Text style={s.rowSub}>{item.sub}</Text>
                      </View>
                      <ArrowSquareOut size={18} color="#C8BFB2" weight="regular" />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null}

            {filterItems(OFFICIAL_LINKS).length > 0 ? (
              <View>
                <Text style={s.eyebrow}>OFFICIAL</Text>
                <View style={s.listCard}>
                  {filterItems(OFFICIAL_LINKS).map((item, i, arr) => (
                    <TouchableOpacity
                      key={item.url}
                      style={i < arr.length - 1 ? [s.row, s.rowBorder] : s.row}
                      onPress={() => Linking.openURL(item.url)}
                      activeOpacity={0.75}
                    >
                      <View style={s.rowInfo}>
                        <Text style={s.rowLabel}>{item.title}</Text>
                        <Text style={s.rowSub}>{item.sub}</Text>
                      </View>
                      <ArrowSquareOut size={18} color="#C8BFB2" weight="regular" />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null}

            {noSearchResults ? (
              <View style={s.emptySearch}>
                <Text style={s.emptySearchText}>No results for "{searchQuery}"</Text>
              </View>
            ) : null}
          </View>
        ) : (
          <>
            {/* ── Zone 1: Personal ──────────────────────────────────────── */}
            <View onLayout={e => { sectionY.current.personal = e.nativeEvent.layout.y; }}>

              <View style={s.profileCard}>

                {/* Left column — avatar */}
                <View style={s.profileAvatarCol}>
                  <TouchableOpacity
                    style={[
                      s.profileAvatar,
                      avatarKey ? null : { backgroundColor: "#3A3545" },
                    ]}
                    onPress={() => {
                      setEditName(userName);
                      setEditEmail(userEmail);
                      setEditJourney(journeyType);
                      setShowEditSheet(true);
                    }}
                    activeOpacity={0.85}
                  >
                    {avatarKey ? (
                      <Image
                        source={AVATARS.find(
                          a => a.key === avatarKey)?.src}
                        style={s.profileAvatarImg}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={s.profileInitials}>
                        {initials || "S"}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Vertical divider */}
                <View style={s.profileDividerV} />

                {/* Right column — info */}
                <View style={s.profileInfoCol}>

                  {/* Top row: journey badge + pencil */}
                  <View style={s.profileTopRow}>
                    {journeyLabel ? (
                      <View style={s.journeyBadge}>
                        <Text style={s.journeyBadgeText}>
                          {journeyLabel}
                        </Text>
                      </View>
                    ) : null}
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity
                      onPress={() => {
                        setEditName(userName);
                        setEditEmail(userEmail);
                        setEditJourney(journeyType);
                        setShowEditSheet(true);
                      }}
                      activeOpacity={0.75}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <PencilSimple size={14} color="#8A7D6A" weight="regular" />
                    </TouchableOpacity>
                  </View>

                  {/* Name */}
                  <Text style={s.profileName} numberOfLines={1}>
                    {userName || "Pilgrim"}
                  </Text>

                  {/* Email */}
                  {userEmail ? (
                    <Text style={s.profileEmail} numberOfLines={1}>
                      {userEmail}
                    </Text>
                  ) : null}

                </View>

              </View>

              <View style={s.tileGrid}>
                <TouchableOpacity
                  style={[s.tile, { backgroundColor: "rgba(58,53,69,0.82)" }]}
                  onPress={() => navigation?.getParent?.()?.navigate?.("Journey", { screen: "MyBoard", initial: false, params: { returnToTab: "Prepare" } })}
                  activeOpacity={0.85}
                >
                  <PushPin size={28} color="#C8A96A" weight="regular" />
                  <View>
                    <Text style={s.tileLabel}>My Board</Text>
                    <Text style={s.tileSub}>Saved content</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[s.tile, { backgroundColor: "rgba(58,53,69,0.82)" }]}
                  onPress={() => navigation?.navigate?.("Notes")}
                  activeOpacity={0.85}
                >
                  <NotePencil size={28} color="#C8A96A" weight="regular" />
                  <View>
                    <Text style={s.tileLabel}>Notes</Text>
                    <Text style={s.tileSub}>Reflections</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[s.tile, { backgroundColor: "rgba(58,53,69,0.82)" }]}
                  onPress={() => navigation?.navigate?.("WhatToExpect")}
                  activeOpacity={0.85}
                >
                  <Compass size={28} color="#C8A96A" weight="regular" />
                  <View>
                    <Text style={s.tileLabel}>What to Expect</Text>
                    <Text style={s.tileSub}>Health & logistics</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[s.tile, { backgroundColor: "rgba(58,53,69,0.82)" }]}
                  onPress={() => navigation?.navigate?.("PracticeLearn")}
                  activeOpacity={0.85}
                >
                  <Headphones size={28} color="#C8A96A" weight="regular" />
                  <View>
                    <Text style={s.tileLabel}>Practice & Learn</Text>
                    <Text style={s.tileSub}>Audio & recite</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Zone 2: Shop ─────────────────────────────────────────── */}
            <View onLayout={e => { sectionY.current.shop = e.nativeEvent.layout.y; }}>
              <Text style={s.eyebrow}>SHOP</Text>

              {/* Shop banner card */}
              <View style={s.shopSection}>
                <View style={s.shopSectionClip}>
                  <TouchableOpacity
                    style={s.shopBanner}
                    onPress={() => navigation?.navigate?.("Shop")}
                    activeOpacity={0.9}
                  >
                    <ImageBackground
                      source={require("../assets/shop/shop-banner.jpg")}
                      style={s.shopBannerBg}
                      resizeMode="cover"
                    >
                      <LinearGradient
                        colors={["rgba(10,8,4,0.18)", "rgba(10,8,4,0.72)"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={s.shopBannerGradient}
                      >
                        <View style={s.shopBannerBadge}>
                          <Text style={s.shopBannerBadgeTxt}>THE SAFAR SHOP</Text>
                        </View>
                        <View style={s.shopBannerBottom}>
                          <Text style={s.shopBannerTitle}>
                            Everything you need for the journey
                          </Text>
                          <Text style={s.shopBannerSub}>
                            Curated essentials — ihram, sandals, sun
                            protection and more
                          </Text>
                          <Text style={s.shopBannerCta}>Browse all ↗</Text>
                        </View>
                      </LinearGradient>
                    </ImageBackground>
                  </TouchableOpacity>

                  <View style={s.affiliateCard}>
                    <AffiliateCard styles={s} items={AFFILIATE_ITEMS} />
                  </View>
                </View>
              </View>
            </View>

            {/* ── Zone 3: Resources ────────────────────────────────────── */}
            <View onLayout={e => { sectionY.current.resources = e.nativeEvent.layout.y; }}>
              <Text style={s.eyebrow}>RESOURCES</Text>
              <View style={s.listCard}>
                <TouchableOpacity
                  style={[s.row, s.rowBorder]}
                  onPress={() => Linking.openURL(ISLAMIC_REFS[0].url)}
                  activeOpacity={0.75}
                >
                  <View style={s.rowIconBox}>
                    <BookOpen size={24} color="#C8A96A" weight="regular" />
                  </View>
                  <View style={s.rowInfo}>
                    <Text style={s.rowLabel}>Islamic Scholars & References</Text>
                    <Text style={s.rowSub}>Sunnah.com, IslamQA, SeekersGuidance</Text>
                  </View>
                  <CaretRight size={18} color="#C8BFB2" weight="bold" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={s.row}
                  onPress={() => navigation?.navigate?.("Media")}
                  activeOpacity={0.75}
                >
                  <View style={s.rowIconBox}>
                    <PlayCircle size={24} color="#C8A96A" weight="regular" />
                  </View>
                  <View style={s.rowInfo}>
                    <Text style={s.rowLabel}>Media & Videos</Text>
                    <Text style={s.rowSub}>Hajj guides, podcasts, lectures</Text>
                  </View>
                  <CaretRight size={18} color="#C8BFB2" weight="bold" />
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Zone 4: Settings & Support ───────────────────────────── */}
            <View>
              <Text style={s.eyebrow}>SETTINGS & SUPPORT</Text>
              <View style={s.listCard}>
                <TouchableOpacity
                  style={[s.row, s.rowBorder]}
                  onPress={() => navigation?.navigate?.("Settings")}
                  activeOpacity={0.75}
                >
                  <View style={s.rowIconBox}>
                    <Gear size={24} color="#C8A96A" weight="regular" />
                  </View>
                  <View style={s.rowInfo}>
                    <Text style={s.rowLabel}>Settings</Text>
                    <Text style={s.rowSub}>Account, notifications & preferences</Text>
                  </View>
                  <CaretRight size={18} color="#C8BFB2" weight="bold" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={s.row}
                  onPress={() => navigation?.navigate?.("Support")}
                  activeOpacity={0.75}
                >
                  <View style={s.rowIconBox}>
                    <Question size={24} color="#C8A96A" weight="regular" />
                  </View>
                  <View style={s.rowInfo}>
                    <Text style={s.rowLabel}>Support & Help</Text>
                    <Text style={s.rowSub}>FAQs, contact and feedback</Text>
                  </View>
                  <CaretRight size={18} color="#C8BFB2" weight="bold" />
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Zone 5: Official ─────────────────────────────────────── */}
            <View onLayout={e => { sectionY.current.official = e.nativeEvent.layout.y; }}>
              <Text style={s.eyebrow}>OFFICIAL</Text>
              <View style={s.listCard}>
                {OFFICIAL_LINKS.map((item, i, arr) => (
                  <TouchableOpacity
                    key={item.url}
                    style={i < arr.length - 1 ? [s.row, s.rowBorder] : s.row}
                    onPress={() => Linking.openURL(item.url)}
                    activeOpacity={0.75}
                  >
                    <View style={s.rowInfo}>
                      <Text style={s.rowLabel}>{item.title}</Text>
                      <Text style={s.rowSub}>{item.sub}</Text>
                    </View>
                    <ArrowSquareOut size={18} color="#C8BFB2" weight="regular" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ height: 40 }} />
          </>
        )}
      </ScrollView>

      <AboutSafarModal visible={showAbout} onClose={() => setShowAbout(false)} />

      <Modal
        visible={showEditSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditSheet(false)}
      >
        <TouchableOpacity
          style={s.pickerBackdrop}
          activeOpacity={1}
          onPress={() => setShowEditSheet(false)}
        >
          <View
            style={s.pickerSheet}
            onStartShouldSetResponder={() => true}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingHorizontal: 24,
                paddingBottom: 16,
              }}
            >

              {/* 1 — handle */}
              <View style={s.pickerHandle} />

              {/* 2 — title */}
              <Text style={s.pickerTitle}>Edit Profile</Text>

              {/* 3 — Your Details label */}
              <Text style={s.editSectionLabel}>Your Details</Text>

              {/* 4 — Name */}
              <View style={s.editField}>
                <Text style={s.editFieldLabel}>Name</Text>
                <TextInput
                  style={s.editFieldInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Your name"
                  placeholderTextColor="#C8BFB2"
                  autoCorrect={false}
                />
              </View>

              {/* 5 — Email */}
              <View style={s.editField}>
                <Text style={s.editFieldLabel}>Email</Text>
                <TextInput
                  style={s.editFieldInput}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="your@email.com"
                  placeholderTextColor="#C8BFB2"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* 6 — Journey selector */}
              <Text style={s.editFieldLabel}>Journey</Text>
              <View style={s.editJourneyRow}>
                {["umrah", "hajj", "learn"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={editJourney === type
                      ? [s.editJourneyPill, s.editJourneyPillActive]
                      : s.editJourneyPill}
                    onPress={() => setEditJourney(type)}
                    activeOpacity={0.75}
                  >
                    <Text style={editJourney === type
                      ? [s.editJourneyText, s.editJourneyTextActive]
                      : s.editJourneyText}>
                      {type === "umrah" ? "Umrah" :
                       type === "hajj"  ? "Hajj"  :
                       "Learning"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 7 — Divider */}
              <View style={s.editDivider} />

              {/* 8 — Avatar label */}
              <Text style={s.editSectionLabel}>Avatar</Text>

              {/* 9 — Initials option */}
              <TouchableOpacity
                style={s.pickerInitialsRow}
                onPress={async () => {
                  setAvatarKey(null);
                  await AsyncStorage.removeItem(AVATAR_KEY);
                }}
                activeOpacity={0.75}
              >
                <View style={s.pickerInitialsCircle}>
                  <Text style={s.pickerInitialsText}>{initials || "S"}</Text>
                </View>
                <Text style={s.pickerInitialsLabel}>Use my initials</Text>
                {!avatarKey ? (
                  <View style={s.pickerCheck}>
                    <Text style={s.pickerCheckText}>✓</Text>
                  </View>
                ) : null}
              </TouchableOpacity>

              {/* 10 — Avatar grid */}
              <View style={s.pickerGrid}>
                {AVATARS.map((avatar) => (
                  <TouchableOpacity
                    key={avatar.key}
                    style={avatarKey === avatar.key
                      ? [s.pickerItem, s.pickerItemActive]
                      : s.pickerItem}
                    onPress={async () => {
                      setAvatarKey(avatar.key);
                      await AsyncStorage.setItem(AVATAR_KEY, avatar.key);
                    }}
                    activeOpacity={0.75}
                  >
                    <Image
                      source={avatar.src}
                      style={s.pickerItemImg}
                      resizeMode="cover"
                    />
                    {avatarKey === avatar.key ? (
                      <View style={s.pickerItemCheck}>
                        <Text style={s.pickerCheckText}>✓</Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                ))}
              </View>

              {/* 11 — Save button */}
              <TouchableOpacity
                style={s.editSaveBtn}
                onPress={saveProfile}
                activeOpacity={0.85}
              >
                <Text style={s.editSaveBtnText}>Save Profile</Text>
              </TouchableOpacity>

            </ScrollView>

          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F0E8" },

  // Header
  header: { height: 260, overflow: "hidden", backgroundColor: "#3A3545" },
  headerImg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" },
  gradient: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  headerContent: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "flex-end", paddingHorizontal: 20, paddingBottom: 22 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: "#C8A96A", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: SERIF, fontSize: 38, color: "#FFFFFF", fontWeight: "600" },
  headerSub: { fontSize: 15, color: "rgba(255,255,255,0.82)", lineHeight: 22, maxWidth: "88%" },

  // Search
  searchWrap: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "#F5F0E8" },
  searchBar: {
    backgroundColor: "#FDFAF4",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#2A1F0E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
  },
  searchInput: { flex: 1, fontSize: 15, color: "#1C1A14", padding: 0 },
  searchClear: { fontSize: 14, color: "#8A7D6A" },

  // Pill nav
  pillsBar: {
    backgroundColor: "#FDFAF4",
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E0D4",
  },
  pill: { flex: 1, alignItems: "center", paddingVertical: 10 },
  pillActive: { flex: 1, alignItems: "center", paddingVertical: 10, backgroundColor: "#3A3545", borderRadius: 22 },
  pillText: { fontSize: 13, color: "#8A7A6A" },
  pillTextActive: { fontSize: 13, fontWeight: "600", color: "#FFFFFF" },

  // Scroll
  scroll: { paddingBottom: 40 },

  // Eyebrow section labels
  eyebrow: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#B08F52",
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 10,
  },

  // Tile grid (Zone 1)
  tileGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 10 },
  tile: { width: "47%", flexGrow: 1, height: 110, borderRadius: 16, overflow: "hidden", padding: 16, justifyContent: "space-between" },
  tileLabel: { fontSize: 15, fontWeight: "600", color: "#FFFFFF" },
  tileSub: { fontSize: 12, color: "rgba(255,255,255,0.72)", marginTop: 2 },

  // List card
  listCard: {
    backgroundColor: "#FDFAF4",
    borderRadius: 16,
    marginHorizontal: 16,
    shadowColor: "#2A1F0E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  // Row anatomy
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#EDE4D4" },
  rowIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(58,53,69,0.85)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  rowInfo: { flex: 1 },
  rowLabel: { fontSize: 16, color: "#1C1A14", marginBottom: 3 },
  rowSub: { fontSize: 13, color: "#5C534A", lineHeight: 18 },

  // Shop banner
  shopBanner: {
    height: 155,
  },
  shopBannerBg: {
    flex: 1,
  },
  shopBannerGradient: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  shopBannerBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(200,169,106,0.22)",
    borderWidth: 1,
    borderColor: "#C8A96A",
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  shopBannerBadgeTxt: {
    fontSize: 10,
    fontWeight: "700",
    color: "#C8A96A",
    letterSpacing: 1.5,
  },
  shopBannerBottom: {
    gap: 3,
  },
  shopBannerTitle: {
    fontFamily: "SourceSerif4-Regular",
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "600",
    lineHeight: 24,
  },
  shopBannerSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.72)",
    lineHeight: 17,
  },
  shopBannerCta: {
    fontSize: 13,
    color: "#C8A96A",
    fontWeight: "700",
    marginTop: 4,
  },

  // Shop section wrapper + clip
  shopSection: { marginHorizontal: 16, marginBottom: 12, borderRadius: 16, backgroundColor: "#FDFAF4", shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.14, shadowRadius: 10, elevation: 4 },
  shopSectionClip: { borderRadius: 16, overflow: "hidden" },

  // Affiliate card wrapper (Zone 3)
  affiliateCard: {
    padding: 16,
  },
  affiliateDisclosure: { fontSize: 12, color: "#8A7D6A", fontStyle: "italic", marginTop: 10, lineHeight: 16 },
  affiliateGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  affiliateTile: {
    width: "47%",
    flexGrow: 1,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#2A1F0E",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  affiliateTileBg: {
    height: 140,
    justifyContent: "flex-end",
  },
  affiliateTileGradient: {
    borderRadius: 14,
    padding: 12,
    justifyContent: "flex-end",
    flex: 1,
  },
  affiliateTitle: { fontFamily: "SourceSerif4-Regular", fontSize: 14, color: "#FFFFFF", fontWeight: "600", lineHeight: 18, marginBottom: 2 },
  affiliateSub: { fontSize: 11, color: "rgba(255,255,255,0.75)", lineHeight: 15, marginBottom: 6 },
  affiliateShop: { fontSize: 12, color: "#C8A96A", fontWeight: "700" },

  // Empty search
  emptySearch: { alignItems: "center", paddingVertical: 48 },
  emptySearchText: { fontSize: 16, color: "#8A7D6A", textAlign: "center" },

  profileAvatarWrap: {
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },

  // Profile card & avatar
  profileCard: {
    marginHorizontal: 13,
    marginTop: 8,
    marginBottom: 10,
    backgroundColor: "#FDFAF4",
    borderWidth: 1,
    borderColor: "#C8BFB2",
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
    shadowColor: "#4A2E10",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  profileAvatarCol: {
    width: 100,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 5,
  },
  profileDividerV: {
    width: 1,
    backgroundColor: "#E0D8CC",
    marginVertical: 14,
  },
  profileInfoCol: {
    flex: 1,
    padding: 14,
    justifyContent: "center",
    gap: 5,
  },
  profileTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  profileInitials: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  profileAvatarImg: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  profileAvatarEdit: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#C8A96A",
    alignItems: "center",
    justifyContent: "center",
  },
  profileAvatarEditText: {
    fontSize: 10,
    color: "#FFFFFF",
  },
  profileName: {
    fontFamily: "SourceSerif4-Regular",
    fontSize: 22,
    fontWeight: "600",
    color: "#1A1410",
  },
  journeyBadge: {
    backgroundColor: "rgba(74,92,72,0.12)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  journeyBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4A5C48",
    letterSpacing: 0.3,
  },
  profileEmail: {
    fontSize: 14,
    color: "#8A7D6A",
    marginTop: 2,
  },

  // Avatar picker modal
  pickerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(26,20,16,0.60)",
    justifyContent: "flex-end",
  },
  pickerSheet: {
    backgroundColor: "#FDFAF4",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: 40,
    maxHeight: "90%",
  },
  pickerHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DDD5C0",
    alignSelf: "center",
    marginBottom: 20,
  },
  pickerTitle: {
    fontFamily: "SourceSerif4-Regular",
    fontSize: 20,
    color: "#1A1410",
    fontWeight: "600",
    marginBottom: 4,
  },
  pickerSub: {
    fontSize: 13,
    color: "#8A7D6A",
    marginBottom: 20,
  },
  pickerInitialsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EDE4D4",
    marginBottom: 16,
  },
  pickerInitialsCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#C8A96A",
    alignItems: "center",
    justifyContent: "center",
  },
  pickerInitialsText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  pickerInitialsLabel: {
    flex: 1,
    fontSize: 15,
    color: "#1A1410",
    fontWeight: "500",
  },
  pickerCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#4A5C48",
    alignItems: "center",
    justifyContent: "center",
  },
  pickerCheckText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  pickerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pickerItem: {
    width: "22%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  pickerItemActive: {
    borderColor: "#4A5C48",
  },
  pickerItemImg: {
    width: "100%",
    height: "100%",
  },
  pickerItemCheck: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#4A5C48",
    alignItems: "center",
    justifyContent: "center",
  },

  // Edit sheet styles
  editSectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.0,
    color: "#C8A96A",
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 4,
  },
  editDivider: {
    height: 1,
    backgroundColor: "#EDE4D4",
    marginVertical: 16,
  },
  editField: {
    marginBottom: 12,
  },
  editFieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8A7D6A",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  editFieldInput: {
    backgroundColor: "#F0EBE1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1A1410",
    borderWidth: 1,
    borderColor: "#DDD5C0",
  },
  editJourneyRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
    marginBottom: 20,
  },
  editJourneyPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#F0EBE1",
    borderWidth: 1,
    borderColor: "#DDD5C0",
  },
  editJourneyPillActive: {
    backgroundColor: "#4A5C48",
    borderColor: "#4A5C48",
  },
  editJourneyText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#5C534A",
  },
  editJourneyTextActive: {
    color: "#FFFFFF",
  },
  editSaveBtn: {
    backgroundColor: "#1A1410",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  editSaveBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#C8A96A",
    letterSpacing: 0.3,
  },
});
