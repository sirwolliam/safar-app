/**
 * WhatToExpectScreen.jsx — Safar
 * Tabs: General · Health & Medical
 * Accordion sections. Official/Guidance/Scholarly labels.
 * Health tab includes links to nearest pharmacies via Google Maps.
 */
import React, { useState, useMemo } from "react";
import {
  SafeAreaView, View, Text, ScrollView, Image,
  TouchableOpacity, StyleSheet, Linking,
} from "react-native";
import { colors, spacing, radius, shadows, typography } from "../theme";
import { useAccessibility } from "../AccessibilityContext";

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
    marginHorizontal: spacing(2.5),
    marginTop: spacing(2),
    marginBottom: spacing(1),
    backgroundColor: "#F5EDD8",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#E8D9B8",
    padding: spacing(2),
  },
  text: {
    fontSize: typography.tiny,
    color: "#7A6030",
    lineHeight: 17,
  },
  bold: {
    fontWeight: "600",
  },
});


// ── General sections ──────────────────────────────────────────────────────────

const GENERAL_SECTIONS = [
  {
    id: "before", title: "Before You Go", icon: "✈️",
    items: [
      { text: "Apply for a Hajj or Umrah visa via the official Nusuk portal.", type: "official", link: "https://www.nusuk.sa" },
      { text: "Book accommodation early — hotels near the Haram fill up months in advance.", type: "guidance" },
      { text: "A meningitis ACWY vaccine is mandatory. Check requirements for your nationality.", type: "official", link: "https://www.haj.gov.sa" },
      { text: "Make a list of duas, intentions, and names of people to pray for.", type: "guidance" },
      { text: "Carry printed copies of key documents — visa, passport, hotel booking.", type: "guidance" },
    ],
  },
  {
    id: "dress", title: "Dress & What to Bring", icon: "👘",
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
    id: "onsite", title: "On Site — Masjid al-Haram", icon: "🕋",
    items: [
      { text: "The Haram is open 24 hours. Crowds peak around the five daily prayer times.", type: "guidance" },
      { text: "Follow crowd management signs — the Saudi authorities actively manage pedestrian flow.", type: "official" },
      { text: "Zamzam water is freely available in designated cooler stations throughout the Haram.", type: "guidance" },
      { text: "Lost and found is managed by Haram security — go to the nearest guard post.", type: "guidance" },
      { text: "Photography is generally permitted in open areas but be respectful near worshippers in prayer.", type: "guidance" },
    ],
  },
  {
    id: "food", title: "Food, Drink & Sanitation", icon: "🍽",
    items: [
      { text: "All food sold near the Haram is halal — no special checking is required.", type: "guidance" },
      { text: "Drink water frequently, especially during Tawaf. Dehydration is a serious risk.", type: "guidance" },
      { text: "Clean wudu facilities and toilets are available throughout the Haram complex.", type: "guidance" },
      { text: "Avoid unlicensed street food vendors.", type: "guidance" },
    ],
  },
  {
    id: "legal", title: "Legal & Conduct", icon: "⚖️",
    items: [
      { text: "Alcohol is strictly prohibited throughout Saudi Arabia.", type: "official" },
      { text: "Public display of affection is not permitted, even between married couples.", type: "official" },
      { text: "Respect prayer times — most shops and services pause during salah.", type: "official" },
      { text: "Photographing government buildings, military, or airport security is prohibited.", type: "official" },
      { text: "Luggage limits: 25kg checked, 7kg cabin per IATA guidelines — verify with your airline.", type: "guidance", link: "https://www.iata.org" },
    ],
  },
  {
    id: "scams", title: "Common Scams & Safety", icon: "⚠️",
    items: [
      { text: "Unlicensed 'guides' often approach pilgrims near the Haram — use only officially registered guides.", type: "guidance" },
      { text: "Currency exchange fraud is common. Use licensed exchange offices or bank ATMs only.", type: "guidance" },
      { text: "Overpriced transport — agree on fare before entering any unmetered taxi.", type: "guidance" },
      { text: "Pickpocketing in crowds — keep documents and valuables in a secure body pouch.", type: "guidance" },
      { text: "Report suspicious activity to the Saudi security services immediately.", type: "official" },
    ],
  },
  {
    id: "practices", title: "Worship Guidance & Schools of Thought", icon: "📖",
    items: [
      { text: "The four main schools (Hanafi, Maliki, Shafi'i, Hanbali) have minor differences in the performance of rites.", type: "scholarly" },
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
    id: "facilities", title: "Medical Facilities", icon: "🏥",
    items: [
      { text: "The Haram Authority operates a 24-hour medical centre inside Masjid al-Haram near Gate 79 (King Fahd Gate).", type: "official" },
      { text: "King Abdullah Medical City in Makkah is the main tertiary referral hospital for pilgrims.", type: "official" },
      { text: "Mobile medical teams operate throughout Mina, Arafah, and Muzdalifah during Hajj season.", type: "official" },
      { text: "Al-Noor Specialist Hospital in Makkah is designated for Hajj pilgrims. Tel: +966 12 556 1500.", type: "official" },
      { text: "Madinah: King Fahad Hospital. Tel: +966 14 845 0000.", type: "official" },
    ],
  },
  {
    id: "emergency", title: "Emergency Numbers", icon: "🚨",
    items: [
      { text: "Saudi Emergency (Police): 999", type: "official" },
      { text: "Saudi Ambulance: 911", type: "official" },
      { text: "Civil Defence (Fire): 998", type: "official" },
      { text: "Haram Security (Makkah): +966 12 556 6888", type: "official" },
      { text: "Save your country's embassy number in Saudi Arabia before you travel.", type: "guidance" },
    ],
  },
  {
    id: "prevention", title: "Staying Healthy", icon: "💊",
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
    id: "pharmacy", title: "Finding Pharmacies", icon: "💊",
    items: [
      { text: "Al-Dawaa and Nahdi Medical are the two largest pharmacy chains near the Haram — branches within 200m.", type: "guidance" },
      { text: "Most pharmacies in Makkah are open 24 hours during the Hajj season.", type: "guidance" },
      { text: "Basic medications (paracetamol, antihistamine, rehydration sachets) are available without prescription.", type: "guidance" },
    ],
  },
];

// ── Type labels ───────────────────────────────────────────────────────────────

const TYPE_LABELS = {
  official:  { label: "Official",   color: colors.primary,  bg: "#EBF2EE" },
  guidance:  { label: "Guidance",   color: "#7A6030",        bg: "#F5EDD8" },
  scholarly: { label: "Scholarly",  color: "#6A5080",        bg: "#F0EBF8" },
};

// ── Accordion ─────────────────────────────────────────────────────────────────

function AccordionSection({ section }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={ac.wrap}>
      <TouchableOpacity style={ac.header} onPress={() => setOpen(!open)} activeOpacity={0.85}>
        <View style={ac.headerLeft}>
          <Text style={{ fontSize: 20 }}>{section.icon}</Text>
          <Text style={ac.title}>{section.title}</Text>
        </View>
        <Text style={ac.chevron}>{open ? "▲" : "▼"}</Text>
      </TouchableOpacity>
      {open && (
        <View style={ac.body}>
          {section.items.map((item, i) => {
            const meta = TYPE_LABELS[item.type];
            return (
              <View key={i} style={i === section.items.length - 1 ? [ac.item, { borderBottomWidth: 0 }] : ac.item}>
                <View style={[ac.badge, { backgroundColor: meta.bg }]}>
                  <Text style={[ac.badgeText, { color: meta.color }]}>{meta.label}</Text>
                </View>
                <Text style={ac.itemText}>{item.text}</Text>
                {item.link && (
                  <TouchableOpacity onPress={() => Linking.openURL(item.link)}>
                    <Text style={ac.link}>Official source ↗</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const create_ac = (colors) => StyleSheet.create({
  wrap: {
    marginHorizontal: spacing(2.5), backgroundColor: colors.card, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing(1),
    overflow: "hidden", ...shadows.card,
  },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: spacing(2),
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: spacing(1.25) },
  title: { fontFamily: SERIF, fontSize: typography.body, color: colors.text },
  chevron: { fontSize: 10, color: colors.subtext },
  body: {
    paddingHorizontal: spacing(2), paddingBottom: spacing(0.5),
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  item: {
    paddingVertical: spacing(1.25), borderBottomWidth: 1,
    borderBottomColor: colors.border + "80", gap: 5,
  },
  badge: {
    alignSelf: "flex-start", paddingHorizontal: spacing(1),
    paddingVertical: 2, borderRadius: radius.pill,
  },
  badgeText: { fontSize: 10, fontWeight: "600", letterSpacing: 0.5 },
  itemText: { fontSize: typography.small, color: colors.text, lineHeight: 20 },
  link: { fontSize: typography.tiny, color: colors.primary, fontWeight: "500" },
});
const ac = create_ac(require("../theme").colors);

// ── Find nearby links ─────────────────────────────────────────────────────────

function NearbyLinks() {
  const links = [
    {
      label: "Find nearest pharmacy in Makkah",
      url: "https://www.google.com/maps/search/pharmacy+near+Masjid+al-Haram,+Makkah",
      icon: "💊",
    },
    {
      label: "Find nearest hospital in Makkah",
      url: "https://www.google.com/maps/search/hospital+near+Masjid+al-Haram,+Makkah",
      icon: "🏥",
    },
    {
      label: "Find nearest pharmacy in Madinah",
      url: "https://www.google.com/maps/search/pharmacy+near+Masjid+al-Nabawi,+Madinah",
      icon: "💊",
    },
    {
      label: "Find nearest hospital in Madinah",
      url: "https://www.google.com/maps/search/hospital+near+Masjid+al-Nabawi,+Madinah",
      icon: "🏥",
    },
  ];

  return (
    <View style={nl.card}>
      <Text style={nl.title}>Find nearby — opens in Google Maps</Text>
      {links.map((link, i) => (
        <TouchableOpacity
          key={link.url}
          style={i < links.length - 1 ? [nl.row, nl.rowBorder] : nl.row}
          onPress={() => Linking.openURL(link.url)}
          activeOpacity={0.85}
        >
          <Text style={{ fontSize: 18 }}>{link.icon}</Text>
          <Text style={nl.label}>{link.label}</Text>
          <Text style={nl.arrow}>↗</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const create_nl = (colors) => StyleSheet.create({
  card: {
    marginHorizontal: spacing(2.5), backgroundColor: colors.card, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, overflow: "hidden",
    marginBottom: spacing(1.5), ...shadows.card,
  },
  title: {
    fontSize: typography.tiny, fontWeight: "600", color: colors.subtext,
    letterSpacing: 1, padding: spacing(1.75),
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  row: {
    flexDirection: "row", alignItems: "center", gap: spacing(1.25),
    paddingHorizontal: spacing(2), paddingVertical: spacing(1.5),
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { flex: 1, fontSize: typography.small, color: colors.primary },
  arrow: { fontSize: typography.small, color: colors.primary },
});
const nl = create_nl(require("../theme").colors);

// ── Main screen ───────────────────────────────────────────────────────────────

export default function WhatToExpectScreen({ navigation }) {
  const { colors } = useAccessibility();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [tab, setTab] = useState("general"); // general | health

  return (
    <SafeAreaView style={s.safe}>

      {/* Hero image — matches Journey/Prepare pattern */}
      <Image
        source={require("../assets/what_to_expect.jpg")}
        style={s.hero}
        resizeMode="cover"
      />

      {/* Sticky header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 24 }} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={s.back}>{"←"}</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>What to Expect</Text>
          <Text style={s.headerSub}>Tips to help you plan and prepare</Text>
        </View>
        <View style={{ width: 30 }} />
      </View>

      {/* Tab toggle */}
      <View style={s.tabRow}>
        {[["general","General"],["health","Health & Medical"]].map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={tab === key ? [s.tabOpt, s.tabOptActive] : s.tabOpt}
            onPress={() => setTab(key)} activeOpacity={0.85}
          >
            <Text style={tab === key ? [s.tabLabel, s.tabLabelActive] : s.tabLabel}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {tab === "general" && (
          <>
            <Text style={s.intro}>
              Information from the Saudi Ministry of Hajj, IATA, and established Islamic scholarship.
              Labels indicate source type.
            </Text>
            {GENERAL_SECTIONS.map((sec) => <AccordionSection key={sec.id} section={sec} />)}
          </>
        )}

        {tab === "health" && (
          <>
            <Text style={s.intro}>
              Medical facilities, emergency contacts, and health guidance for pilgrims.
            </Text>
            <NearbyLinks />
            {HEALTH_SECTIONS.map((sec) => <AccordionSection key={sec.id} section={sec} />)}
          </>
        )}

        {/* Disclaimer */}
        <ScholarlyFootnote />
        <View style={s.disclaimer}>
          <Text style={s.disclaimerText}>
            Guidance is general advice. Scholarly opinions may vary by madhab. Always verify requirements with official sources and your local scholar before travel.
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL("https://www.haj.gov.sa")}>
            <Text style={s.disclaimerLink}>Saudi Ministry of Hajj & Umrah ↗</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: spacing(4) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  // Hero — matches Journey/Prepare at 225px
  hero: { width: "100%", height: 225 },

  // Sticky header
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing(2.5), paddingTop: spacing(2), paddingBottom: spacing(1.25),
    backgroundColor: colors.background,
  },
  back: { fontSize: 22, color: colors.text },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontFamily: SERIF, fontSize: 22, color: colors.text },
  headerSub:   { fontSize: 14, color: colors.subtext, fontWeight: "300", marginTop: 2 },

  tabRow: {
    flexDirection: "row", marginHorizontal: spacing(2.5), marginBottom: spacing(1.5),
    backgroundColor: colors.card, borderRadius: radius.md, padding: 3,
    borderWidth: 1, borderColor: colors.border,
    ...shadows.card,},
  tabOpt: { flex: 1, paddingVertical: spacing(1.25), borderRadius: radius.sm, alignItems: "center" },
  tabOptActive: { backgroundColor: colors.primary },
  tabLabel: { fontSize: typography.small, color: colors.subtext },
  tabLabelActive: { color: "#fff", fontWeight: "500" },

  intro: {
    fontSize: typography.tiny, color: colors.subtext, lineHeight: 18,
    paddingHorizontal: spacing(2.5), marginBottom: spacing(1.5), textAlign: "center",
  },
  scroll: { paddingBottom: spacing(3) },
  disclaimer: {
    marginHorizontal: spacing(2.5), marginTop: spacing(2), padding: spacing(2),
    backgroundColor: "#F5EDD8", borderRadius: radius.md, borderWidth: 1, borderColor: "#E8D9B8",
  },
  disclaimerText: { fontSize: typography.tiny, color: "#7A6030", lineHeight: 18, marginBottom: spacing(0.75) },
  disclaimerLink: { fontSize: typography.tiny, color: colors.primary, fontWeight: "500" },
});
