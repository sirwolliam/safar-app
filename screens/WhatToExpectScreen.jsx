/**
 * WhatToExpectScreen.jsx — Safar
 * Tabs: General · Health & Medical
 * Accordion sections. Official/Guidance/Scholarly labels.
 * Health tab includes links to nearest pharmacies via Google Maps.
 */
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, Linking, Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAccessibility } from "../AccessibilityContext";
import {
  CaretLeft, CaretRight, CaretDown,
  Info, SuitcaseRolling, TShirt, Mosque, Heartbeat,
  Lock, ShieldCheck, BookOpen,
  Buildings, Bandaids, Heart, MapPin,
} from "phosphor-react-native";

const SERIF = "SourceSerif4-Regular";

// ── Scholarly footnote ─────────────────────────────────────────────────────────
function ScholarlyFootnote({ style }) {
  return (
    <View style={[fn.wrap, style]}>
      <Text style={fn.text}>
        <Text style={fn.bold}>Sources</Text>{" — "}
        Duas are drawn from Ṣaḥīḥ al-Bukhārī, Ṣaḥīḥ Muslim, Sunan Abī Dāwūd, Sunan al-Tirmidhī, and established scholarly works. Each duʿāʾ is attributed to its primary source. Practice and wording may differ across the four madhabs (Ḥanafī, Mālikī, Shāfiʿī, Ḥanbalī). Consult a qualified scholar for rulings specific to your school of thought.
      </Text>
    </View>
  );
}

const fn = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    backgroundColor: "#FDFAF4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EDE4D4",
    padding: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  text: { fontSize: 12, color: "#5C534A", lineHeight: 17 },
  bold: { fontWeight: "600" },
});

// ── General sections ──────────────────────────────────────────────────────────
const GENERAL_SECTIONS = [
  {
    id: "before", title: "Before You Go", Icon: SuitcaseRolling,
    items: [
      { text: "Apply for a Hajj or Umrah visa via the official Nusuk portal.", type: "official", link: "https://www.nusuk.sa" },
      { text: "Book accommodation early — hotels near the Haram fill up months in advance.", type: "guidance" },
      { text: "A meningitis ACWY vaccine is mandatory. Check requirements for your nationality.", type: "official", link: "https://www.haj.gov.sa" },
      { text: "Make a list of duas, intentions, and names of people to pray for.", type: "guidance" },
      { text: "Carry printed copies of key documents — visa, passport, hotel booking.", type: "guidance" },
    ],
  },
  {
    id: "dress", title: "Dress & What to Bring", Icon: TShirt,
    items: [
      { text: "Men in Ihram wear two unstitched white cloths. No stitched clothing, no headwear, no underwear.", type: "official" },
      { text: "Women should wear modest, loose-fitting clothing covering all except face and hands.", type: "scholarly" },
      { text: "Comfortable open sandals are essential — you will walk several miles daily.", type: "guidance" },
      { text: "Bring a compact umbrella or wide-brimmed hat — temperatures regularly exceed 45°C in summer.", type: "guidance" },
      { text: "Scented products (perfume, scented soap, deodorant) are not permitted while in Ihram.", type: "official" },
      { text: "A small secure bag or waist pouch for documents and phone is strongly recommended.", type: "guidance" },
    ],
  },
  {
    id: "onsite", title: "On Site — Masjid al-Haram", Icon: Mosque,
    items: [
      { text: "The Haram is open 24 hours. Crowds peak around the five daily prayer times.", type: "guidance" },
      { text: "Follow crowd management signs — the Saudi authorities actively manage pedestrian flow.", type: "official" },
      { text: "Zamzam water is freely available in designated cooler stations throughout the Haram.", type: "guidance" },
      { text: "Lost and found is managed by Haram security — go to the nearest guard post.", type: "guidance" },
      { text: "Photography is generally permitted in open areas but be respectful near worshippers in prayer.", type: "guidance" },
    ],
  },
  {
    id: "food", title: "Food, Drink & Sanitation", Icon: Heartbeat,
    items: [
      { text: "All food sold near the Haram is halal — no special checking is required.", type: "guidance" },
      { text: "Drink water frequently, especially during Tawaf. Dehydration is a serious risk.", type: "guidance" },
      { text: "Clean wudu facilities and toilets are available throughout the Haram complex.", type: "guidance" },
      { text: "Avoid unlicensed street food vendors.", type: "guidance" },
    ],
  },
  {
    id: "legal", title: "Legal & Conduct", Icon: Lock,
    items: [
      { text: "Alcohol is strictly prohibited throughout Saudi Arabia.", type: "official" },
      { text: "Public display of affection is not permitted, even between married couples.", type: "official" },
      { text: "Respect prayer times — most shops and services pause during salah.", type: "official" },
      { text: "Photographing government buildings, military, or airport security is prohibited.", type: "official" },
      { text: "Luggage limits: 25kg checked, 7kg cabin per IATA guidelines — verify with your airline.", type: "guidance", link: "https://www.iata.org" },
    ],
  },
  {
    id: "scams", title: "Common Scams & Safety", Icon: ShieldCheck,
    items: [
      { text: "Unlicensed 'guides' often approach pilgrims near the Haram — use only officially registered guides.", type: "guidance" },
      { text: "Currency exchange fraud is common. Use licensed exchange offices or bank ATMs only.", type: "guidance" },
      { text: "Overpriced transport — agree on fare before entering any unmetered taxi.", type: "guidance" },
      { text: "Pickpocketing in crowds — keep documents and valuables in a secure body pouch.", type: "guidance" },
      { text: "Report suspicious activity to the Saudi security services immediately.", type: "official" },
    ],
  },
  {
    id: "practices", title: "Worship Guidance & Schools of Thought", Icon: BookOpen,
    items: [
      { text: "The four main schools (Hanafi, Maliki, Shafi'i, Hanbali) have minor differences in how these are performed.", type: "scholarly" },
      { text: "Opinions differ on where to enter Ihram (e.g. at the Miqat vs at the airport) — follow your madhab.", type: "scholarly" },
      { text: "If uncertain about any act, consult a qualified scholar before your journey.", type: "scholarly" },
      { text: "Shaving (halq) is preferable for men after Umrah; trimming (taqsir) is the minimum.", type: "scholarly" },
      { text: "Sadaqah (charity) during Hajj and Umrah carries special reward. Many opportunities are available on-site.", type: "scholarly" },
    ],
  },
];

// ── Health sections ───────────────────────────────────────────────────────────
const HEALTH_SECTIONS = [
  {
    id: "facilities", title: "Medical Facilities", Icon: Buildings,
    items: [
      { text: "The Haram Authority operates a 24-hour medical centre inside Masjid al-Haram near Gate 79 (King Fahd Gate).", type: "official" },
      { text: "King Abdullah Medical City in Makkah is the main tertiary referral hospital for pilgrims.", type: "official" },
      { text: "Mobile medical teams operate throughout Mina, Arafah, and Muzdalifah during Hajj season.", type: "official" },
      { text: "Al-Noor Specialist Hospital in Makkah is designated for Hajj pilgrims. Tel: +966 12 556 1500.", type: "official" },
      { text: "Madinah: King Fahad Hospital. Tel: +966 14 845 0000.", type: "official" },
    ],
  },
  {
    id: "emergency", title: "Emergency Numbers", Icon: Bandaids,
    items: [
      { text: "Saudi Emergency (Police): 999", type: "official" },
      { text: "Saudi Ambulance: 911", type: "official" },
      { text: "Civil Defence (Fire): 998", type: "official" },
      { text: "Haram Security (Makkah): +966 12 556 6888", type: "official" },
      { text: "Save your country's embassy number in Saudi Arabia before you travel.", type: "guidance" },
    ],
  },
  {
    id: "prevention", title: "Staying Healthy", Icon: Heart,
    items: [
      { text: "Meningitis ACWY vaccine is mandatory. Seasonal flu vaccination is strongly recommended.", type: "official" },
      { text: "Drink at least 3–4 litres of water per day. Zamzam is freely available throughout the Haram.", type: "guidance" },
      { text: "Heatstroke is a leading cause of pilgrimage illness. Seek shade frequently and avoid peak sun hours.", type: "guidance" },
      { text: "Wear a mask in dense crowds — respiratory infections spread easily during pilgrimage season.", type: "guidance" },
      { text: "Carry any prescription medications with their original packaging and a doctor's letter in Arabic if possible.", type: "guidance" },
      { text: "Diabetics and those with chronic conditions should consult their doctor 6–8 weeks before departure.", type: "guidance" },
    ],
  },
  {
    id: "pharmacy", title: "Finding Pharmacies", Icon: MapPin,
    items: [
      { text: "Al-Dawaa and Nahdi Medical are the two largest pharmacy chains near the Haram — branches within 200m.", type: "guidance" },
      { text: "Most pharmacies in Makkah are open 24 hours during the Hajj season.", type: "guidance" },
      { text: "Basic medications (paracetamol, antihistamine, rehydration sachets) are available without prescription.", type: "guidance" },
    ],
  },
];

// ── Type labels ───────────────────────────────────────────────────────────────
const TYPE_LABELS = {
  official:  { label: "Official",  color: "#1E3D30", bg: "#E2EDE6" },
  guidance:  { label: "Guidance",  color: "#6B5020", bg: "#EEE4CB" },
  scholarly: { label: "Scholarly", color: "#6A5080", bg: "#F0EBF8" },
};

// ── AccordionSection ──────────────────────────────────────────────────────────
function AccordionSection({ section, colors }) {
  const [open, setOpen] = useState(false);

  const ac = useMemo(() => StyleSheet.create({
    wrap: {
      marginHorizontal: 16, marginBottom: 8,
      backgroundColor: "#FDFAF4",
      borderRadius: 16, overflow: "hidden",
      borderWidth: 1, borderColor: "#EDE4D4",
      shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
    },
    header: {
      flexDirection: "row", alignItems: "center",
      justifyContent: "space-between", padding: 16,
    },
    headerLeft: {
      flexDirection: "row", alignItems: "center",
      gap: 12, flex: 1,
    },
    iconBox: {
      width: 40, height: 40, borderRadius: 12,
      backgroundColor: "#2D4F32",
      alignItems: "center", justifyContent: "center",
    },
    title: {
      fontFamily: SERIF, fontSize: 16,
      color: "#1C1A14", flex: 1,
    },
    body: {
      paddingHorizontal: 16, paddingBottom: 8,
      borderTopWidth: 1, borderTopColor: "#EDE4D4",
    },
    item: {
      paddingVertical: 12,
      borderBottomWidth: 1, borderBottomColor: "#EDE4D4",
    },
    badge: {
      alignSelf: "flex-start",
      paddingHorizontal: 8, paddingVertical: 2,
      borderRadius: 50, marginBottom: 6,
    },
    badgeText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
    itemText:  { fontSize: 14, color: "#1C1A14", lineHeight: 21 },
    link: {
      fontSize: 13, color: "#2D4F32",
      fontWeight: "600", marginTop: 6,
    },
  }), []);

  return (
    <View style={ac.wrap}>
      <TouchableOpacity style={ac.header} onPress={() => setOpen(!open)} activeOpacity={0.85}>
        <View style={ac.headerLeft}>
          <View style={ac.iconBox}>
            <section.Icon size={22} color="#C8A96A" weight="regular" />
          </View>
          <Text style={ac.title}>{section.title}</Text>
        </View>
        <CaretDown
          size={16}
          color="#8A7A6A"
          weight="bold"
          style={{ transform: [{ rotate: open ? "0deg" : "-90deg" }] }}
        />
      </TouchableOpacity>
      {open ? (
        <View style={ac.body}>
          {section.items.map((item, i) => {
            const meta = TYPE_LABELS[item.type];
            return (
              <View
                key={i}
                style={i === section.items.length - 1
                  ? [ac.item, { borderBottomWidth: 0 }]
                  : ac.item
                }
              >
                <View style={[ac.badge, { backgroundColor: meta.bg }]}>
                  <Text style={[ac.badgeText, { color: meta.color }]}>{meta.label}</Text>
                </View>
                <Text style={ac.itemText}>{item.text}</Text>
                {item.link ? (
                  <TouchableOpacity onPress={() => Linking.openURL(item.link)}>
                    <Text style={ac.link}>Official source ↗</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

// ── NearbyLinks ───────────────────────────────────────────────────────────────
function NearbyLinks({ colors }) {
  const links = [
    {
      label: "Find nearest pharmacy in Makkah",
      url: "https://www.google.com/maps/search/pharmacy+near+Masjid+al-Haram,+Makkah",
      Icon: MapPin,
    },
    {
      label: "Find nearest hospital in Makkah",
      url: "https://www.google.com/maps/search/hospital+near+Masjid+al-Haram,+Makkah",
      Icon: Buildings,
    },
    {
      label: "Find nearest pharmacy in Madinah",
      url: "https://www.google.com/maps/search/pharmacy+near+Masjid+al-Nabawi,+Madinah",
      Icon: MapPin,
    },
    {
      label: "Find nearest hospital in Madinah",
      url: "https://www.google.com/maps/search/hospital+near+Masjid+al-Nabawi,+Madinah",
      Icon: Buildings,
    },
  ];

  const nl = useMemo(() => StyleSheet.create({
    card: {
      marginHorizontal: 16, marginBottom: 12,
      backgroundColor: "#FDFAF4",
      borderRadius: 16, overflow: "hidden",
      borderWidth: 1, borderColor: "#EDE4D4",
      shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
    },
    titleRow: {
      paddingHorizontal: 16, paddingVertical: 12,
      borderBottomWidth: 1, borderBottomColor: "#EDE4D4",
    },
    titleText: {
      fontSize: 11, fontWeight: "700", color: "#8A7A6A",
      letterSpacing: 1,
    },
    row: {
      flexDirection: "row", alignItems: "center", gap: 14,
      paddingHorizontal: 16, paddingVertical: 14,
    },
    rowBorder: { borderBottomWidth: 1, borderBottomColor: "#EDE4D4" },
    iconBox: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: "#2D4F32",
      alignItems: "center", justifyContent: "center",
    },
    label: { flex: 1, fontSize: 14, color: "#1C1A14", fontWeight: "500" },
    arrow: { fontSize: 14, color: "#8A7A6A" },
  }), []);

  return (
    <View style={nl.card}>
      <View style={nl.titleRow}>
        <Text style={nl.titleText}>Find nearby — opens in Google Maps</Text>
      </View>
      {links.map((link, i) => (
        <TouchableOpacity
          key={link.url}
          style={i < links.length - 1 ? [nl.row, nl.rowBorder] : nl.row}
          onPress={() => Linking.openURL(link.url)}
          activeOpacity={0.85}
        >
          <View style={nl.iconBox}>
            <link.Icon size={18} color="#C8A96A" weight="regular" />
          </View>
          <Text style={nl.label}>{link.label}</Text>
          <CaretRight size={16} color="#8A7A6A" weight="bold" />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function WhatToExpectScreen({ navigation }) {
  const { colors } = useAccessibility();
  const insets = useSafeAreaInsets();

  const cardSlide   = useRef(new Animated.Value(30)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const rowOpacity  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardSlide, {
        toValue: 0, duration: 380, delay: 120, useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1, duration: 320, delay: 120, useNativeDriver: true,
      }),
      Animated.timing(rowOpacity, {
        toValue: 1, duration: 280, delay: 220, useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const [tab, setTab] = useState("general");

  return (
    <View style={styles.root}>

      {/* ── Header — photo + gradient overlay ── */}
      <View style={styles.header}>
        <Image
          source={require("../assets/what_to_expect.jpg")}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
          fadeDuration={0}
        />
        <LinearGradient
          colors={[
            "transparent",
            "transparent",
            "rgba(28,43,30,0.65)",
            "rgba(28,43,30,0.96)",
          ]}
          locations={[0, 0.44, 0.72, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <TouchableOpacity
          style={[styles.backBtn, { top: insets.top + 14 }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <CaretLeft size={18} color="#FFFFFF" weight="bold" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <View style={styles.iconBadge}>
              <Info size={22} color="#C8A96A" weight="regular" />
            </View>
            <Text style={styles.headerTitle}>What to Expect</Text>
          </View>
          <Text style={styles.headerSub}>
            Tips to help you plan, stay safe, and arrive prepared.
          </Text>
        </View>
      </View>

      {/* ── Tab toggle ── */}
      <View style={styles.tabRow}>
        {[["general", "General"], ["health", "Health & Medical"]].map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={tab === key ? [styles.tabOpt, styles.tabOptActive] : styles.tabOpt}
            onPress={() => setTab(key)}
            activeOpacity={0.85}
          >
            <Text style={tab === key ? [styles.tabLabel, styles.tabLabelActive] : styles.tabLabel}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Content ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: cardOpacity, transform: [{ translateY: cardSlide }] }}>
          <Text style={styles.intro}>
            {tab === "general"
              ? "Information from the Saudi Ministry of Hajj, IATA, and established Islamic scholarship."
              : "Medical facilities, emergency contacts, and health guidance for pilgrims."}
          </Text>

          <Animated.View style={{ opacity: rowOpacity }}>
            {tab === "general" ? (
              <>
                {GENERAL_SECTIONS.map((sec) => (
                  <AccordionSection key={sec.id} section={sec} colors={colors} />
                ))}
              </>
            ) : (
              <>
                <NearbyLinks colors={colors} />
                {HEALTH_SECTIONS.map((sec) => (
                  <AccordionSection key={sec.id} section={sec} colors={colors} />
                ))}
              </>
            )}
          </Animated.View>

          <ScholarlyFootnote />

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              Guidance is general advice. Scholarly opinions may vary by
              madhab. Always verify requirements with official sources and
              your local scholar before travel.
            </Text>
            <TouchableOpacity onPress={() => Linking.openURL("https://www.haj.gov.sa")}>
              <Text style={styles.disclaimerLink}>
                Saudi Ministry of Hajj & Umrah ↗
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:           { flex: 1, backgroundColor: "#EDE6D8" },

  header:         { height: 260, overflow: "hidden", position: "relative", backgroundColor: "#1C3A20" },
  backBtn:        { position: "absolute", left: 18, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" },
  headerContent:  { position: "absolute", bottom: 22, left: 20, right: 20 },
  titleRow:       { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  iconBadge:      { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: "#C8A96A", alignItems: "center", justifyContent: "center" },
  headerTitle:    { fontFamily: SERIF, fontSize: 34, color: "#FFFFFF", fontWeight: "600" },
  headerSub:      { fontSize: 14, color: "rgba(255,255,255,0.82)", lineHeight: 20, maxWidth: "90%" },

  tabRow:         { flexDirection: "row", marginHorizontal: 16, marginTop: 12, marginBottom: 4, backgroundColor: "#FDFAF4", borderRadius: 12, padding: 3, borderWidth: 1, borderColor: "#DDD5C8" },
  tabOpt:         { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: "center" },
  tabOptActive:   { backgroundColor: "#2D4F32" },
  tabLabel:       { fontSize: 14, color: "#8A7A6A", fontWeight: "500" },
  tabLabelActive: { fontSize: 14, color: "#FFFFFF", fontWeight: "600" },

  scroll:         { flex: 1 },
  scrollContent:  { paddingTop: 10 },

  intro:          { fontSize: 13, color: "#5C534A", lineHeight: 19, paddingHorizontal: 16, marginBottom: 10, textAlign: "center" },

  disclaimer:     { marginHorizontal: 16, marginTop: 16, padding: 16, backgroundColor: "#FDFAF4", borderRadius: 12, borderWidth: 1, borderColor: "#EDE4D4" },
  disclaimerText: { fontSize: 12, color: "#5C534A", lineHeight: 18, marginBottom: 6 },
  disclaimerLink: { fontSize: 12, color: "#2D4F32", fontWeight: "600" },

  bottomSpacer:   { height: 40 },
});
