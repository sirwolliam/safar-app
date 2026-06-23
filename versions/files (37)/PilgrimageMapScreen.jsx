/**
 * PilgrimageMapScreen.jsx — Safar
 * Interactive SVG pilgrimage route map.
 * Toggle between Umrah and Hajj. Tap a stop to see full detail card.
 * Mark stops complete — persisted to AsyncStorage, updates map colours.
 *
 * Stop states:
 *   completed  — filled gold  (#B8922A)
 *   current    — filled green (#4A5C48), pulsing ring
 *   upcoming   — outlined white, transparent fill
 *
 * Storage keys:
 *   safar_umrah_map_done_v1  — { stopId: bool }
 *   safar_hajj_map_done_v1   — { stopId: bool }
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, Animated, Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path, Circle, Line, Text as SvgText, G } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SERIF = "SourceSerif4-Regular";
const { width: SW, height: SH } = Dimensions.get("window");
const MAP_W = SW - 40;   // 20pt margin each side
const MAP_H = MAP_W * 1.6;

// ── Storage keys ─────────────────────────────────────────────────────────────
const UMRAH_DONE_KEY = "safar_umrah_map_done_v1";
const HAJJ_DONE_KEY  = "safar_hajj_map_done_v1";

// ── Colours ───────────────────────────────────────────────────────────────────
const C = {
  bg:        "#E8DDD0",
  card:      "#FDFAF4",
  green:     "#4A5C48",
  midGreen:  "#2A5242",
  gold:      "#B8922A",
  goldLight: "#C8A96A",
  border:    "#C8BFB2",
  subtext:   "#5C534A",
  text:      "#100E0A",
  mapBg:     "#F5EDE0",
  routeLine: "#C8BFB2",
};

// ── Umrah stops ───────────────────────────────────────────────────────────────
// Positions as fractions of MAP_W/MAP_H — Makkah at top, route flows down
const UMRAH_STOPS = [
  {
    id: "u1",
    name: "Masjid al-\u1e24ar\u0101m",
    label: "Masjid\nal-\u1e24ar\u0101m",
    x: 0.50, y: 0.08,
    what: "The Grand Mosque surrounding the Ka\u02bfbah \u2014 the most sacred site in Islam. The Haram is entered with the right foot and a specific du\u02bf\u0101\u02be.",
    todo: "Enter with right foot. Say the du\u02bf\u0101\u02be for entering the mosque. Head towards the Ka\u02bfbah.",
    duration: "Continuous base",
    crowd: "Extremely dense at prayer times. Use the outer circuits if the inner is full.",
    transport: "Walking from most Makkah hotels. Tunnel entrances for wheelchair access.",
    scholar: "The Haram has no specific prayer times restrictions \u2014 you may enter at any time.",
    dua: {
      arabic: "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0648\u064e\u0627\u0644\u0635\u064e\u0651\u0644\u064e\u0627\u0629\u064f \u0639\u064e\u0644\u064e\u0649 \u0631\u064e\u0633\u064f\u0648\u0644\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650\u060c \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0627\u0641\u0652\u062a\u064e\u062d\u0652 \u0644\u0650\u064a \u0623\u064e\u0628\u0652\u0648\u064e\u0627\u0628\u064e \u0631\u064e\u062d\u0652\u0645\u064e\u062a\u0650\u0643\u064e",
      transliteration: "Bismi-ll\u0101hi wa\u1e63-\u1e63al\u0101tu \u02bfal\u0101 ras\u016bli-ll\u0101h. All\u0101humma-fta\u1e25 l\u012b abw\u0101ba ra\u1e25matik",
      translation: "In the name of Allah, and peace upon the Messenger of Allah. O Allah, open for me the gates of Your mercy.",
      source: "\u1e62a\u1e25\u012b\u1e25 Muslim \u00b7 713",
    },
  },
  {
    id: "u2",
    name: "First Sight of the Ka\u02bfbah",
    label: "First Sight\nof Ka\u02bfbah",
    x: 0.50, y: 0.18,
    what: "The moment a pilgrim first sees the Ka\u02bfbah is one of the most spiritually powerful of the entire journey. Du\u02bf\u0101\u02be made at this moment is said to be answered.",
    todo: "Stop and raise your hands in du\u02bf\u0101\u02be. Ask for whatever you need. Take your time.",
    duration: "As long as you need",
    crowd: "Move to the side if crowds are heavy so others can pass.",
    transport: "\u2014",
    scholar: "Ibn Jurayj reported that du\u02bf\u0101\u02be at first sight of the Ka\u02bfbah is among the times when supplication is answered.",
    dua: {
      arabic: "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0632\u0650\u062f\u0652 \u0647\u064e\u0630\u064e\u0627 \u0627\u0644\u0652\u0628\u064e\u064a\u0652\u062a\u064e \u0634\u064e\u0631\u064e\u0641\u064b\u0627 \u0648\u064e\u062a\u064e\u0639\u0652\u0638\u0650\u064a\u0645\u064b\u0627 \u0648\u064e\u062a\u064e\u0643\u0652\u0631\u0650\u064a\u0645\u064b\u0627 \u0648\u064e\u0645\u064e\u0647\u064e\u0627\u0628\u064e\u0629\u064b",
      transliteration: "All\u0101humma zid h\u0101dhal-bayta shar\u0101fan wa ta\u02bf\u1e93\u012bman wa tark\u012bman wa mah\u0101bah",
      translation: "O Allah, increase this House in honour, greatness, nobility and reverence.",
      source: "Al-Azraq\u012b",
    },
  },
  {
    id: "u3",
    name: "\u1e62aw\u0101f",
    label: "\u1e62aw\u0101f\n(7 circuits)",
    x: 0.50, y: 0.32,
    what: "Seven circuits around the Ka\u02bfbah, beginning and ending at the Black Stone (al-\u1e24ajar al-Aswad), moving anti-clockwise.",
    todo: "Begin at the Black Stone, raise right hand and say Takb\u012br. Make du\u02bf\u0101\u02be freely between the Yemeni Corner and Black Stone. Complete 7 rounds.",
    duration: "45\u201390 minutes depending on crowd",
    crowd: "Inner circuits are very dense. Outer circuits are calmer but longer. Wheelchair accessible outer track available.",
    transport: "\u2014",
    scholar: "The Taw\u0101f is a pillar (\u0631\u064f\u0643\u0646) of Umrah. If interrupted, you resume from where you stopped according to the majority view.",
    dua: {
      arabic: "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0647\u0650 \u0648\u064e\u0627\u0644\u0644\u0647\u064f \u0623\u064e\u0643\u0652\u0628\u064e\u0631\u064f",
      transliteration: "Bismi-ll\u0101hi wa-ll\u0101hu akbar",
      translation: "In the name of Allah, and Allah is the Greatest.",
      source: "\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 1613",
    },
  },
  {
    id: "u4",
    name: "Maq\u0101m Ibr\u0101h\u012bm",
    label: "Maq\u0101m\nIbr\u0101h\u012bm",
    x: 0.26, y: 0.44,
    what: "The station of Prophet Ibr\u0101h\u012bm (AS) \u2014 a stone bearing his footprint. After Taw\u0101f, pilgrims pray two rak\u02bfahs behind it.",
    todo: "After completing Taw\u0101f, pray 2 rak\u02bfahs behind Maq\u0101m Ibr\u0101h\u012bm. Recite S\u016brah al-K\u0101fir\u016bn and S\u016brah al-Ikhl\u0101\u1e63.",
    duration: "10\u201315 minutes",
    crowd: "Pray as close as possible. If very crowded, anywhere in the Haram is valid.",
    transport: "\u2014",
    scholar: "This is wajib (obligatory) according to the majority. Leaving it requires a dam (sacrificial compensation) in the \u1e24anaf\u012b school.",
    dua: {
      arabic: "\u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u062a\u064e\u0642\u064e\u0628\u064e\u0651\u0644\u0652 \u0645\u0650\u0646\u064e\u0651\u0627 \u0625\u0650\u0646\u064e\u0651\u0643\u064e \u0623\u064e\u0646\u0652\u062a\u064e \u0627\u0644\u0633\u064e\u0651\u0645\u0650\u064a\u0639\u064f \u0627\u0644\u0652\u0639\u064e\u0644\u0650\u064a\u0645\u064f",
      transliteration: "Rabban\u0101 taqabbal minn\u0101 innaka anta\u02bbs-sam\u012b\u02bful-\u02bfalim",
      translation: "Our Lord, accept from us. Indeed, You are the Hearing, the Knowing.",
      source: "Al-Baqarah 2:127",
    },
  },
  {
    id: "u5",
    name: "Zamzam",
    label: "Zamzam\nWell",
    x: 0.74, y: 0.44,
    what: "The blessed well of Zamzam. Drinking from it is a strongly recommended Sunnah before Sa\u02bfy.",
    todo: "Face the Ka\u02bfbah. Say Bismillah. Drink in three sips. Make du\u02bf\u0101\u02be while drinking.",
    duration: "5\u201310 minutes",
    crowd: "Zamzam dispensers are throughout the Haram \u2014 you need not go to the original well location.",
    transport: "\u2014",
    scholar: "Ibn \u02bfAbb\u0101s reported that the Prophet (SAW) drank Zamzam standing. Both sitting and standing are valid.",
    dua: {
      arabic: "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u0646\u0650\u0651\u064a \u0623\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e \u0639\u0650\u0644\u0652\u0645\u064b\u0627 \u0646\u064e\u0627\u0641\u0650\u0639\u064b\u0627 \u0648\u064e\u0631\u0650\u0632\u0652\u0642\u064b\u0627 \u0648\u064e\u0627\u0633\u0650\u0639\u064b\u0627 \u0648\u064e\u0634\u0650\u0641\u064e\u0627\u0621\u064b \u0645\u0650\u0646\u0652 \u0643\u064f\u0644\u0650\u0651 \u062f\u064e\u0627\u0621\u064d",
      transliteration: "All\u0101humma inn\u012b as\u02bfaluka \u02bfilman n\u0101fi\u02bfan wa rizqan w\u0101si\u02bfan wa shif\u0101\u02bfan min kulli d\u0101\u02bf",
      translation: "O Allah, I ask You for beneficial knowledge, abundant provision, and healing from every disease.",
      source: "Ibn M\u0101jah \u00b7 3062",
    },
  },
  {
    id: "u6",
    name: "Sa\u02bfy",
    label: "Sa\u02bfy\u2014\u1e62af\u0101 to\nMarwah \xd7 7",
    x: 0.50, y: 0.60,
    what: "Walking seven times between the hills of \u1e62af\u0101 and Marwah, commemorating H\u0101jar\u02bfs search for water for her son Ism\u0101\u02bf\u012bl (AS).",
    todo: "Begin at \u1e62af\u0101. Face the Ka\u02bfbah and make du\u02bf\u0101\u02be. Walk to Marwah (one way = one). Men jog lightly between the green lights. Complete 7 (ending at Marwah).",
    duration: "45\u201375 minutes",
    crowd: "Upper level is less crowded. Wheelchair accessible route available on the same level.",
    transport: "The Mas\u02bfa (Sa\u02bfy walkway) is inside the Masjid al-\u1e24ar\u0101m complex.",
    scholar: "Sa\u02bfy is a pillar of Umrah. It must follow a valid Taw\u0101f. The condition of \u1e6dah\u0101rah (purity) is required according to the Sh\u0101fi\u02bf\u012b school.",
    dua: {
      arabic: "\u0625\u0650\u0646\u064e\u0651 \u0627\u0644\u0635\u064e\u0651\u0641\u064e\u0627 \u0648\u064e\u0627\u0644\u0652\u0645\u064e\u0631\u0652\u0648\u064e\u0629\u064e \u0645\u0650\u0646\u0652 \u0634\u064e\u0639\u064e\u0627\u0626\u0650\u0631\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650",
      transliteration: "Inna\u1e63-\u1e63af\u0101 wal-marwata min sha\u02bf\u0101\u02bfiri-ll\u0101h",
      translation: "Indeed \u1e62af\u0101 and Marwah are among the signs of Allah.",
      source: "\u1e62a\u1e25\u012b\u1e25 Muslim \u00b7 1218",
    },
  },
  {
    id: "u7",
    name: "Halq / Taq\u1e63\u012br",
    label: "Halq /\nTaq\u1e63\u012br",
    x: 0.50, y: 0.76,
    what: "Shaving the head (Halq, for men) or shortening the hair (Taq\u1e63\u012br, for women and men preferring it). This releases the pilgrim from the state of I\u1e25r\u0101m.",
    todo: "Men: shave the entire head or shorten all hair equally. Women: cut a fingertip\u2019s length from the ends of the hair. Face Qibla if possible.",
    duration: "15\u201330 minutes",
    crowd: "Barbers available throughout Makkah. Prices vary. Book in advance during peak season.",
    transport: "\u2014",
    scholar: "Shaving (Halq) is preferred over shortening (Taq\u1e63\u012br) for men. The Prophet (SAW) prayed three times for those who shave.",
    dua: {
      arabic: "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0627\u063a\u0652\u0641\u0650\u0631\u0652 \u0644\u0650\u0644\u0652\u0645\u064f\u062d\u064e\u0644\u0650\u0651\u0642\u0650\u064a\u0646\u064e \u0648\u064e\u0627\u0644\u0652\u0645\u064f\u062a\u064e\u0642\u064e\u0635\u0650\u0651\u0631\u0650\u064a\u0646\u064e",
      transliteration: "All\u0101humma-ghfir lil-mu\u1e25alliq\u012bna wal-mutaqa\u1e63\u1e63ir\u012bn",
      translation: "O Allah, forgive those who shave and those who shorten.",
      source: "\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 1727",
    },
  },
];

// ── Hajj stops ────────────────────────────────────────────────────────────────
const HAJJ_STOPS = [
  {
    id: "h1",
    name: "I\u1e25r\u0101m & Talbiyah",
    label: "I\u1e25r\u0101m &\nTalbiyah",
    x: 0.50, y: 0.06,
    what: "Entering the sacred state of I\u1e25r\u0101m at the M\u012bq\u0101t. The pilgrim declares niyyah (intention) for Hajj and begins reciting the Talbiyah.",
    todo: "Bathe, wear I\u1e25r\u0101m garments (men: two white unstitched cloths, women: modest clothing). Pray 2 rak\u02bfahs. Declare niyyah. Begin Talbiyah.",
    duration: "1\u20132 hours at M\u012bq\u0101t",
    crowd: "M\u012bq\u0101t stations vary. Dh\u016bl-\u1e24ul\u012bfah is the M\u012bq\u0101t for those coming from Madinah.",
    transport: "Buses and coaches stop at M\u012bq\u0101t. Maintain I\u1e25r\u0101m for the entire journey to Makkah.",
    scholar: "I\u1e25r\u0101m is a pillar of Hajj. Passing the M\u012bq\u0101t without I\u1e25r\u0101m requires a dam (sacrifice).",
    dua: {
      arabic: "\u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643\u064e\u060c \u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643\u064e \u0644\u0627 \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0643\u064e \u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643",
      transliteration: "Labbayk All\u0101humma labbayk, labbayk l\u0101 shar\u012bka laka labbayk",
      translation: "Here I am O Allah, here I am. You have no partner, here I am.",
      source: "\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 1549",
    },
  },
  {
    id: "h2",
    name: "Taw\u0101f al-Qud\u016bm",
    label: "Taw\u0101f\nal-Qud\u016bm",
    x: 0.50, y: 0.16,
    what: "The arrival Taw\u0101f performed upon entering Makkah. Seven circuits around the Ka\u02bfbah. Sunnah for those performing Hajj Ifr\u0101d or Qir\u0101n.",
    todo: "Same as Umrah Taw\u0101f. Begin at Black Stone, move anti-clockwise. Complete 7 rounds. Pray 2 rak\u02bfahs at Maq\u0101m Ibr\u0101h\u012bm.",
    duration: "45\u201390 minutes",
    crowd: "Very dense in the days leading up to 8 Dhul-Hijjah. Go early in the morning.",
    transport: "\u2014",
    scholar: "Taw\u0101f al-Qud\u016bm is Sunnah, not obligatory. Missing it does not require compensation.",
    dua: {
      arabic: "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0647\u0650 \u0648\u064e\u0627\u0644\u0644\u0647\u064f \u0623\u064e\u0643\u0652\u0628\u064e\u0631\u064f",
      transliteration: "Bismi-ll\u0101hi wa-ll\u0101hu akbar",
      translation: "In the name of Allah, and Allah is the Greatest.",
      source: "\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 1613",
    },
  },
  {
    id: "h3",
    name: "Min\u0101 — 8 Dhul-\u1e24ijjah",
    label: "Min\u0101\n(8 Dhul-\u1e24ijjah)",
    x: 0.50, y: 0.28,
    what: "Pilgrims travel to Min\u0101 on the 8th of Dhul-\u1e24ijjah (Yawm al-Tarwiyah). They spend the day and night here in worship.",
    todo: "Travel to Min\u0101. Pray Dhuhr, Asr, Maghrib, Isha and Fajr in Min\u0101. Shorten prayers (Qa\u1e63r) but do not combine according to the majority. Remain until after Fajr.",
    duration: "Full day and night",
    crowd: "Tent city \u2014 your group will have an assigned tent. Stay with your group leader.",
    transport: "Official Hajj buses. Walking is approximately 8km from the Haram.",
    scholar: "Staying in Min\u0101 on the 8th is Sunnah. Missing it does not require compensation.",
    dua: {
      arabic: "\u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643\u064e\u060c \u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643\u064e \u0644\u0627 \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0643\u064e \u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643",
      transliteration: "Labbayk All\u0101humma labbayk, labbayk l\u0101 shar\u012bka laka labbayk",
      translation: "Here I am O Allah, here I am. You have no partner, here I am.",
      source: "\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 1549",
    },
  },
  {
    id: "h4",
    name: "\u02bfarafah",
    label: "\u02bfarafah\n(9 Dhul-\u1e24ijjah)",
    x: 0.50, y: 0.42,
    what: "The standing at \u02bfarafah (Wuq\u016bf) is the central pillar of Hajj. The Prophet (SAW) said: \u201cHajj is \u02bfarafah.\u201d Pilgrims spend the afternoon in supplication.",
    todo: "Arrive before Dhuhr. Pray Dhuhr and Asr combined and shortened. Face Qibla. Make du\u02bf\u0101\u02be continuously until sunset. Talbiyah throughout. Depart after sunset.",
    duration: "From midday to sunset (approx. 6\u20138 hours)",
    crowd: "Enormous. Stay with your group. Do not leave the boundaries of \u02bfarafah.",
    transport: "Official buses. \u02bfarafah is ~20km from Makkah.",
    scholar: "Missing Wuq\u016bf at \u02bfarafah invalidates the Hajj entirely. It cannot be compensated by any sacrifice.",
    dua: {
      arabic: "\u0644\u064e\u0627 \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u064e\u0651\u0627 \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0648\u064e\u062d\u0652\u062f\u064e\u0647\u064f \u0644\u064e\u0627 \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0647\u064f\u060c \u0644\u064e\u0647\u064f \u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u064f \u0648\u064e\u0644\u064e\u0647\u064f \u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f \u0648\u064e\u0647\u064f\u0648\u064e \u0639\u064e\u0644\u064e\u0649 \u0643\u064f\u0644\u0650\u0651 \u0634\u064e\u064a\u0652\u0621\u064d \u0642\u064e\u062f\u0650\u064a\u0631\u064c",
      transliteration: "L\u0101 il\u0101ha illa-ll\u0101hu wa\u1e25dahu l\u0101 shar\u012bka lahu, lahul-mulku wa lahul-\u1e25amdu wa huwa \u02bfal\u0101 kulli shay\u02bfin qad\u012br",
      translation: "There is no god but Allah alone, with no partner. To Him belongs the dominion and all praise, and He is over all things powerful.",
      source: "Sunan al-Tirmidh\u012b \u00b7 3585",
    },
  },
  {
    id: "h5",
    name: "Muzdalifah",
    label: "Muzdalifah\n(Night)",
    x: 0.50, y: 0.54,
    what: "After leaving \u02bfarafah at sunset, pilgrims travel to Muzdalifah to pray Maghrib and Isha combined, spend the night, and collect pebbles for the Jamarat.",
    todo: "Pray Maghrib and Isha combined on arrival. Sleep under the sky. Pray Fajr early. Collect 49 or 70 small pebbles. Depart for Min\u0101 after Fajr.",
    duration: "Overnight",
    crowd: "Open ground. Stay with your group. The elderly and weak may leave after midnight.",
    transport: "Walk or official buses. Approximately 9km from \u02bfarafah.",
    scholar: "Spending the night in Muzdalifah is wajib according to most scholars. Leaving before midnight requires a dam.",
    dua: {
      arabic: "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u0646\u064e\u0651 \u0647\u064e\u0630\u064e\u0627 \u0645\u064e\u0634\u0652\u0639\u064e\u0631\u064f \u0627\u0644\u0652\u062d\u064e\u0631\u064e\u0627\u0645\u0650 \u0641\u064e\u0627\u063a\u0652\u0641\u0650\u0631\u0652 \u0644\u0650\u064a \u0630\u064f\u0646\u064f\u0648\u0628\u0650\u064a \u0648\u064e\u0627\u062c\u0652\u0639\u064e\u0644\u0652\u0646\u0650\u064a \u0645\u0650\u0645\u064e\u0651\u0646\u0652 \u064a\u064f\u062d\u0652\u0633\u0650\u0646\u064f \u0627\u0644\u0652\u064a\u064e\u0648\u0652\u0645\u064e \u0633\u064e\u0639\u0652\u064a\u064e\u0647\u064f",
      transliteration: "All\u0101humma inna h\u0101dh\u0101 mash\u02bfarul-\u1e25ar\u0101mi faghfir l\u012b dhun\u016bb\u012b waj\u02bfaln\u012b mimman yu\u1e25sinul-yawma sa\u02bfyah",
      translation: "O Allah, this is Mash\u02bfar al-\u1e24ar\u0101m. Forgive my sins and make me of those who perform this day well.",
      source: "Ibn M\u0101jah",
    },
  },
  {
    id: "h6",
    name: "Jamarat — Stoning",
    label: "Jamarat\n(Stoning)",
    x: 0.50, y: 0.64,
    what: "The stoning of the three pillars (Jamarat) in Min\u0101, symbolising the rejection of the devil. Performed on the 10th and the Tashreeq days.",
    todo: "Stone the large Jamarat (al-\u02bfAqabah) first on the 10th with 7 pebbles. On days 11\u201312 (or 13), stone all three pillars with 7 pebbles each, smallest to largest.",
    duration: "1\u20133 hours depending on crowd",
    crowd: "Extremely dangerous at peak times. Stone at non-peak hours (night or early morning). Follow crowd management instructions strictly.",
    transport: "Walking in Min\u0101. The Jamarat bridge is multi-level to manage crowds.",
    scholar: "Stoning is wajib. Missing it requires a dam. Stoning by proxy is permitted for the ill and elderly.",
    dua: {
      arabic: "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0648\u064e\u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0623\u064e\u0643\u0652\u0628\u064e\u0631\u064f \u0631\u064e\u063a\u0652\u0645\u064b\u0627 \u0644\u0650\u0644\u0634\u064e\u0651\u064a\u0652\u0637\u064e\u0627\u0646\u0650 \u0648\u064e\u062d\u0650\u0632\u0652\u0628\u0650\u0647\u0650",
      transliteration: "Bismi-ll\u0101hi wall\u0101hu akbar, raghman li\u02bbs-shayt\u0101ni wa \u1e25izbih",
      translation: "In the name of Allah, Allah is Greatest, in humiliation of the devil and his party.",
      source: "Musnad A\u1e25mad",
    },
  },
  {
    id: "h7",
    name: "Qurb\u0101n\u012b & Halq",
    label: "Qurb\u0101n\u012b\n& Halq",
    x: 0.28, y: 0.74,
    what: "Sacrificing an animal (Qurb\u0101n\u012b) and shaving or shortening the hair on the 10th of Dhul-\u1e24ijjah (Yawm al-Na\u1e25r \u2014 the Day of Sacrifice).",
    todo: "Arrange Qurb\u0101n\u012b through a licensed agency (often done in advance). After slaughter, shave or shorten hair. This partially releases you from I\u1e25r\u0101m.",
    duration: "2\u20134 hours",
    crowd: "Slaughterhouses are official and organised. Book in advance.",
    transport: "\u2014",
    scholar: "Qurb\u0101n\u012b is wajib for those performing Tamattu\u02bf or Qir\u0101n. For Ifr\u0101d it is Sunnah.",
    dua: {
      arabic: "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0647\u0650 \u0648\u064e\u0627\u0644\u0644\u0647\u064f \u0623\u064e\u0643\u0652\u0628\u064e\u0631\u064f \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0645\u0650\u0646\u0652\u0643\u064e \u0648\u064e\u0644\u064e\u0643\u064e",
      transliteration: "Bismi-ll\u0101hi wall\u0101hu akbar, All\u0101humma minka wa lak",
      translation: "In the name of Allah, Allah is Greatest. O Allah, from You and for You.",
      source: "\u1e62a\u1e25\u012b\u1e25 Muslim \u00b7 1966",
    },
  },
  {
    id: "h8",
    name: "Taw\u0101f al-Ifadah",
    label: "Taw\u0101f\nal-Ifa\u1e0dah",
    x: 0.72, y: 0.74,
    what: "The obligatory Taw\u0101f of Hajj, performed after Qurb\u0101n\u012b and Halq on the 10th. This fully releases the pilgrim from I\u1e25r\u0101m.",
    todo: "Return to Makkah from Min\u0101. Perform Taw\u0101f al-Ifa\u1e0dah (7 circuits). Pray 2 rak\u02bfahs. Perform Sa\u02bfy if not done after Taw\u0101f al-Qud\u016bm. Return to Min\u0101.",
    duration: "2\u20133 hours",
    crowd: "Peak crowds on the 10th. Going on the 11th or 12th is valid and less crowded.",
    transport: "Bus or walking from Min\u0101 to Makkah.",
    scholar: "Taw\u0101f al-Ifa\u1e0dah is a pillar (Rukn) of Hajj. Without it, Hajj is not complete.",
    dua: {
      arabic: "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0647\u0650 \u0648\u064e\u0627\u0644\u0644\u0647\u064f \u0623\u064e\u0643\u0652\u0628\u064e\u0631\u064f",
      transliteration: "Bismi-ll\u0101hi wa-ll\u0101hu akbar",
      translation: "In the name of Allah, and Allah is the Greatest.",
      source: "\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 1613",
    },
  },
  {
    id: "h9",
    name: "Min\u0101 — Tashreeq",
    label: "Min\u0101\nTashreeq",
    x: 0.50, y: 0.86,
    what: "Spending the nights of Tashreeq (11th and 12th, or also 13th) in Min\u0101 and completing the remaining Jamarat stonings each day.",
    todo: "Stone all three Jamarat after midday each day. Spend nights in Min\u0101. Those departing early must leave before sunset on the 12th.",
    duration: "2\u20133 days",
    crowd: "Organised by tent. Stone at off-peak times. Night stoning is valid and less crowded.",
    transport: "Walking or bus within Min\u0101.",
    scholar: "Staying for the Tashreeq nights is wajib according to the majority. Leaving after the 12th before sunset is valid.",
    dua: {
      arabic: "\u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u0622\u062a\u0650\u0646\u064e\u0627 \u0641\u0650\u064a \u0627\u0644\u062f\u064f\u0651\u0646\u0652\u064a\u064e\u0627 \u062d\u064e\u0633\u064e\u0646\u064e\u0629\u064b \u0648\u064e\u0641\u0650\u064a \u0627\u0644\u0622\u062e\u0650\u0631\u064e\u0629\u0650 \u062d\u064e\u0633\u064e\u0646\u064e\u0629\u064b \u0648\u064e\u0642\u0650\u0646\u064e\u0627 \u0639\u064e\u0630\u064e\u0627\u0628\u064e \u0627\u0644\u0646\u064e\u0651\u0627\u0631\u0650",
      transliteration: "Rabban\u0101 \u0101tin\u0101 fi\u02bfd-duny\u0101 \u1e25asanatan wa fi\u02bfl-\u0101khirati \u1e25asanatan wa qin\u0101 \u02bfadh\u0101ba\u02bbn-n\u0101r",
      translation: "Our Lord, give us good in this world and in the Hereafter, and protect us from the punishment of the Fire.",
      source: "Al-Baqarah 2:201",
    },
  },
  {
    id: "h10",
    name: "Taw\u0101f al-Wad\u0101\u02bf",
    label: "Taw\u0101f\nal-Wad\u0101\u02bf",
    x: 0.50, y: 0.95,
    what: "The farewell Taw\u0101f \u2014 the final act before leaving Makkah. Performed by all pilgrims before departure.",
    todo: "Perform 7 circuits. After the final circuit, face the Ka\u02bfbah. Make du\u02bf\u0101\u02be. Leave with the Ka\u02bfbah in sight for as long as possible.",
    duration: "45\u201390 minutes",
    crowd: "Can be emotional and crowded. Go early in the morning.",
    transport: "\u2014",
    scholar: "Taw\u0101f al-Wad\u0101\u02bf is wajib for all pilgrims except women in menstruation (they are excused without compensation).",
    dua: {
      arabic: "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u0646\u064e\u0651 \u0627\u0644\u0652\u0628\u064e\u064a\u0652\u062a\u064e \u0628\u064e\u064a\u0652\u062a\u064f\u0643\u064e \u0648\u064e\u0627\u0644\u0652\u062d\u064e\u0631\u064e\u0645\u064e \u062d\u064e\u0631\u064e\u0645\u064f\u0643\u064e \u0648\u064e\u0647\u064e\u0630\u064e\u0627 \u0645\u064e\u0642\u064e\u0627\u0645\u064f \u0627\u0644\u0652\u0639\u064e\u0627\u0626\u0650\u0630\u0650 \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u064e \u0627\u0644\u0646\u064e\u0651\u0627\u0631\u0650",
      transliteration: "All\u0101humma innal-bayta baytuka wal-\u1e25ar\u0101ma \u1e25ar\u0101muka wa h\u0101dh\u0101 maq\u0101mul-\u02bf\u0101\u02bfidhi bika mina\u02bbn-n\u0101r",
      translation: "O Allah, this House is Your House, this sanctuary is Your sanctuary, and this is the place of one who seeks refuge with You from the Fire.",
      source: "Al-Azraq\u012b",
    },
  },
];

// ── Pulse animation component ─────────────────────────────────────────────────
function PulsingRing({ cx, cy, r }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0.1] });
  const scale   = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] });
  return (
    <Animated.View
      style={{
        position: "absolute",
        width: r * 2 + 16,
        height: r * 2 + 16,
        borderRadius: r + 8,
        borderWidth: 2,
        borderColor: C.green,
        left: cx * MAP_W - r - 8,
        top: cy * MAP_H - r - 8,
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function PilgrimageMapScreen({ navigation, route }) {
  const initialMode = route?.params?.initialMode ?? "umrah";
  const [mode, setMode]         = useState(initialMode);   // "umrah" | "hajj"
  const [done, setDone]         = useState({});
  const [selected, setSelected] = useState(null);      // stop object or null
  const sheetAnim = useRef(new Animated.Value(0)).current;

  const stops      = mode === "umrah" ? UMRAH_STOPS : HAJJ_STOPS;
  const storageKey = mode === "umrah" ? UMRAH_DONE_KEY : HAJJ_DONE_KEY;

  // Load done state whenever mode changes
  useEffect(() => {
    AsyncStorage.getItem(storageKey)
      .then(v => { if (v) setDone(JSON.parse(v)); else setDone({}); })
      .catch(() => setDone({}));
  }, [mode]);

  // Derive "current" stop — first incomplete stop
  const currentId = stops.find(s => !done[s.id])?.id ?? null;

  const toggleDone = async (stopId) => {
    const next = { ...done, [stopId]: !done[stopId] };
    setDone(next);
    try { await AsyncStorage.setItem(storageKey, JSON.stringify(next)); } catch (_) {}
  };

  const openStop = (stop) => {
    setSelected(stop);
    Animated.spring(sheetAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 10 }).start();
  };

  const closeStop = () => {
    Animated.timing(sheetAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => setSelected(null));
  };

  const sheetY = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SH * 0.7, 0],
  });

  // ── Stop colour logic ──────────────────────────────────────────────────────
  const stopFill   = (s) => done[s.id] ? C.gold : s.id === currentId ? C.green : "transparent";
  const stopStroke = (s) => done[s.id] ? C.gold : s.id === currentId ? C.green : "rgba(255,255,255,0.75)";
  const stopR      = 10;

  // ── Build route path from stop coordinates ─────────────────────────────────
  const pathD = stops.map((s, i) => {
    const x = s.x * MAP_W;
    const y = s.y * MAP_H;
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(" ");

  // Route segment labels — midpoint between consecutive stops
  const segmentLabels = stops.slice(0, -1).map((s, i) => {
    const next = stops[i + 1];
    const mx = ((s.x + next.x) / 2) * MAP_W;
    const my = ((s.y + next.y) / 2) * MAP_H;
    return { x: mx, y: my, idx: i };
  });

  const completedCount = stops.filter(s => done[s.id]).length;

  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.8}>
          <Text style={s.backArrow}>{"‹"}</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Pilgrimage Map</Text>
          <Text style={s.headerSub}>{completedCount}/{stops.length} stops completed</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Mode toggle */}
      <View style={s.toggle}>
        <TouchableOpacity
          style={[s.toggleBtn, mode === "umrah" ? s.toggleActive : null]}
          onPress={() => setMode("umrah")}
          activeOpacity={0.85}
        >
          <Text style={mode === "umrah" ? s.toggleTxtActive : s.toggleTxt}>Umrah</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.toggleBtn, mode === "hajj" ? s.toggleActive : null]}
          onPress={() => setMode("hajj")}
          activeOpacity={0.85}
        >
          <Text style={mode === "hajj" ? s.toggleTxtActive : s.toggleTxt}>Hajj</Text>
        </TouchableOpacity>
      </View>

      {/* Progress strip */}
      <View style={s.progressWrap}>
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${(completedCount / stops.length) * 100}%` }]} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}
      >
        {/* Map container */}
        <View style={[s.mapBox, { width: MAP_W, height: MAP_H }]}>

          {/* Pulsing ring for current stop — rendered behind SVG */}
          {stops.map(stop =>
            stop.id === currentId ? (
              <PulsingRing
                key={stop.id + "_pulse"}
                cx={stop.x}
                cy={stop.y}
                r={stopR}
              />
            ) : null
          )}

          <Svg width={MAP_W} height={MAP_H}>

            {/* Route path */}
            <Path
              d={pathD}
              stroke={C.routeLine}
              strokeWidth={1.5}
              strokeDasharray="6 4"
              fill="none"
            />

            {/* Connecting lines between branching stops (Umrah: Maqam+Zamzam both connect to Safa) */}
            {mode === "umrah" ? (
              <>
                <Line
                  x1={UMRAH_STOPS[3].x * MAP_W} y1={UMRAH_STOPS[3].y * MAP_H}
                  x2={UMRAH_STOPS[5].x * MAP_W} y2={UMRAH_STOPS[5].y * MAP_H}
                  stroke={C.routeLine} strokeWidth={1.5} strokeDasharray="6 4"
                />
                <Line
                  x1={UMRAH_STOPS[4].x * MAP_W} y1={UMRAH_STOPS[4].y * MAP_H}
                  x2={UMRAH_STOPS[5].x * MAP_W} y2={UMRAH_STOPS[5].y * MAP_H}
                  stroke={C.routeLine} strokeWidth={1.5} strokeDasharray="6 4"
                />
              </>
            ) : (
              <>
                {/* Hajj: Qurbani and Tawaf al-Ifadah both lead from Muzdalifah area */}
                <Line
                  x1={HAJJ_STOPS[6].x * MAP_W} y1={HAJJ_STOPS[6].y * MAP_H}
                  x2={HAJJ_STOPS[8].x * MAP_W} y2={HAJJ_STOPS[8].y * MAP_H}
                  stroke={C.routeLine} strokeWidth={1.5} strokeDasharray="6 4"
                />
                <Line
                  x1={HAJJ_STOPS[7].x * MAP_W} y1={HAJJ_STOPS[7].y * MAP_H}
                  x2={HAJJ_STOPS[8].x * MAP_W} y2={HAJJ_STOPS[8].y * MAP_H}
                  stroke={C.routeLine} strokeWidth={1.5} strokeDasharray="6 4"
                />
              </>
            )}

            {/* Stop circles */}
            {stops.map((stop) => (
              <G key={stop.id}>
                <Circle
                  cx={stop.x * MAP_W}
                  cy={stop.y * MAP_H}
                  r={stopR}
                  fill={stopFill(stop)}
                  stroke={stopStroke(stop)}
                  strokeWidth={done[stop.id] ? 0 : 1.5}
                  onPress={() => openStop(stop)}
                />
                {/* Checkmark inside completed stops */}
                {done[stop.id] ? (
                  <SvgText
                    x={stop.x * MAP_W}
                    y={stop.y * MAP_H + 4}
                    textAnchor="middle"
                    fontSize={11}
                    fill="#FDFAF4"
                    fontWeight="700"
                  >{"✓"}</SvgText>
                ) : null}
              </G>
            ))}

            {/* Stop labels */}
            {stops.map((stop) => {
              const lx = stop.x * MAP_W;
              const ly = stop.y * MAP_H;
              const isLeft  = stop.x < 0.40;
              const isRight = stop.x > 0.60;
              const anchor  = isLeft ? "end" : isRight ? "start" : "middle";
              const dx = isLeft ? -stopR - 4 : isRight ? stopR + 4 : 0;
              const dy = (!isLeft && !isRight) ? stopR + 14 : 4;
              const lines = stop.label.split("\n");
              return (
                <G key={stop.id + "_label"}>
                  {lines.map((line, li) => (
                    <SvgText
                      key={li}
                      x={lx + dx}
                      y={ly + dy + li * 13}
                      textAnchor={anchor}
                      fontSize={9.5}
                      fill={done[stop.id] ? C.gold : stop.id === currentId ? "#FDFAF4" : "rgba(253,250,244,0.80)"}
                      fontWeight={stop.id === currentId ? "700" : "400"}
                    >{line}</SvgText>
                  ))}
                </G>
              );
            })}
          </Svg>
        </View>

        {/* Legend */}
        <View style={s.legend}>
          {[
            { fill: C.gold,  stroke: C.gold,  label: "Completed" },
            { fill: C.green, stroke: C.green, label: "Current stop" },
            { fill: "transparent", stroke: "rgba(100,90,80,0.6)", label: "Upcoming" },
          ].map(item => (
            <View key={item.label} style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: item.fill, borderColor: item.stroke, borderWidth: item.fill === "transparent" ? 1.5 : 0 }]} />
              <Text style={s.legendTxt}>{item.label}</Text>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* ── Bottom sheet stop detail ── */}
      {selected ? (
        <TouchableOpacity style={s.sheetOverlay} activeOpacity={1} onPress={closeStop}>
          <Animated.View
            style={[s.sheet, { transform: [{ translateY: sheetY }] }]}
            onStartShouldSetResponder={() => true}
          >
            {/* Handle */}
            <View style={s.sheetHandle} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
              {/* Stop name + complete button */}
              <View style={s.sheetTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.sheetEyebrow}>{mode === "umrah" ? "UMRAH" : "HAJJ"} \u00b7 STOP {stops.findIndex(s => s.id === selected.id) + 1}</Text>
                  <Text style={s.sheetTitle}>{selected.name}</Text>
                </View>
                <TouchableOpacity
                  style={[s.doneBtn, done[selected.id] ? s.doneBtnDone : null]}
                  onPress={() => toggleDone(selected.id)}
                  activeOpacity={0.85}
                >
                  <Text style={[s.doneBtnTxt, done[selected.id] ? s.doneBtnTxtDone : null]}>
                    {done[selected.id] ? "Completed \u2713" : "Mark done"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={s.sheetDivider} />

              {/* What / What to do */}
              <Text style={s.sheetSectionLabel}>ABOUT THIS STOP</Text>
              <Text style={s.sheetBody}>{selected.what}</Text>

              <Text style={s.sheetSectionLabel}>WHAT TO DO</Text>
              <Text style={s.sheetBody}>{selected.todo}</Text>

              {/* Duration + Crowd + Transport */}
              <View style={s.metaRow}>
                <View style={s.metaCell}>
                  <Text style={s.metaLabel}>DURATION</Text>
                  <Text style={s.metaVal}>{selected.duration}</Text>
                </View>
                <View style={s.metaCellBorder} />
                <View style={s.metaCell}>
                  <Text style={s.metaLabel}>CROWDS</Text>
                  <Text style={s.metaVal}>{selected.crowd}</Text>
                </View>
              </View>

              {selected.transport !== "\u2014" ? (
                <View style={[s.metaRow, { marginTop: 0 }]}>
                  <View style={s.metaCell}>
                    <Text style={s.metaLabel}>TRANSPORT</Text>
                    <Text style={s.metaVal}>{selected.transport}</Text>
                  </View>
                </View>
              ) : null}

              <View style={s.sheetDivider} />

              {/* Du'ā */}
              <Text style={s.sheetSectionLabel}>{"DU\u02bfĀ"}</Text>
              <View style={s.duaBox}>
                <Text style={s.duaArabic}>{selected.dua.arabic}</Text>
                <View style={s.duaInnerDivider} />
                <Text style={s.duaTranslit}>{selected.dua.transliteration}</Text>
                <Text style={s.duaTranslation}>{selected.dua.translation}</Text>
                <Text style={s.duaSource}>{selected.dua.source}</Text>
              </View>

              <View style={s.sheetDivider} />

              {/* Scholar note */}
              <Text style={s.sheetSectionLabel}>SCHOLAR GUIDANCE</Text>
              <Text style={s.sheetBody}>{selected.scholar}</Text>
            </ScrollView>
          </Animated.View>
        </TouchableOpacity>
      ) : null}

    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // Header
  header:       { flexDirection:"row", alignItems:"center", paddingHorizontal:20, paddingVertical:14, backgroundColor:C.bg },
  backBtn:      { width:36, height:36, borderRadius:18, backgroundColor:C.card, borderWidth:1, borderColor:C.border, alignItems:"center", justifyContent:"center" },
  backArrow:    { fontSize:22, color:C.text, lineHeight:26 },
  headerCenter: { flex:1, alignItems:"center" },
  headerTitle:  { fontFamily:SERIF, fontSize:22, color:C.text, fontWeight:"400" },
  headerSub:    { fontSize:12, color:C.subtext, marginTop:2 },

  // Toggle
  toggle:       { flexDirection:"row", marginHorizontal:20, marginBottom:12, backgroundColor:C.card, borderRadius:50, padding:4, borderWidth:1, borderColor:C.border },
  toggleBtn:    { flex:1, paddingVertical:9, borderRadius:50, alignItems:"center" },
  toggleActive: { backgroundColor:C.green },
  toggleTxt:    { fontSize:14, color:C.subtext, fontWeight:"500" },
  toggleTxtActive:{ fontSize:14, color:"#FDFAF4", fontWeight:"600" },

  // Progress
  progressWrap: { paddingHorizontal:20, marginBottom:16 },
  progressTrack:{ height:3, backgroundColor:C.border, borderRadius:2, overflow:"hidden" },
  progressFill: { height:"100%", backgroundColor:C.gold, borderRadius:2 },

  // Map
  mapBox: {
    backgroundColor: C.green,
    borderRadius: 20,
    overflow: "hidden",
    marginHorizontal: 20,
  },

  // Legend
  legend:     { flexDirection:"row", justifyContent:"center", gap:20, marginTop:16, paddingHorizontal:20 },
  legendItem: { flexDirection:"row", alignItems:"center", gap:6 },
  legendDot:  { width:10, height:10, borderRadius:5 },
  legendTxt:  { fontSize:12, color:C.subtext },

  // Sheet overlay
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,24,18,0.50)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: C.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 12,
    maxHeight: SH * 0.82,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: "center", marginBottom: 16,
  },

  // Sheet content
  sheetTopRow:     { flexDirection:"row", alignItems:"flex-start", gap:12, marginBottom:16 },
  sheetEyebrow:    { fontSize:9, color:C.goldLight, fontWeight:"700", marginBottom:4 },
  sheetTitle:      { fontFamily:SERIF, fontSize:22, color:C.text, fontWeight:"400", lineHeight:28 },
  sheetDivider:    { height:1, backgroundColor:C.border, marginVertical:16 },
  sheetSectionLabel:{ fontSize:9, color:C.subtext, fontWeight:"700", textTransform:"uppercase", marginBottom:8, marginTop:4 },
  sheetBody:       { fontSize:14, color:"#3A3530", lineHeight:22, marginBottom:14 },

  // Mark done button
  doneBtn:         { borderWidth:1.5, borderColor:C.green, borderRadius:50, paddingHorizontal:14, paddingVertical:8 },
  doneBtnDone:     { backgroundColor:C.gold, borderColor:C.gold },
  doneBtnTxt:      { fontSize:12, color:C.green, fontWeight:"600" },
  doneBtnTxtDone:  { color:"#FDFAF4" },

  // Meta row
  metaRow:     { flexDirection:"row", backgroundColor:"#F5EDE0", borderRadius:12, marginBottom:8, overflow:"hidden" },
  metaCell:    { flex:1, padding:14 },
  metaCellBorder:{ width:1, backgroundColor:C.border },
  metaLabel:   { fontSize:9, color:C.subtext, fontWeight:"700", textTransform:"uppercase", marginBottom:4 },
  metaVal:     { fontSize:13, color:C.text, lineHeight:19 },

  // Du'ā box
  duaBox:         { backgroundColor:"#F5EDE0", borderRadius:14, padding:16, borderWidth:1, borderColor:"#E8D9B8" },
  duaArabic:      { fontFamily:SERIF, fontSize:20, color:C.green, textAlign:"right", lineHeight:36, marginBottom:12 },
  duaInnerDivider:{ height:1, backgroundColor:C.border, marginBottom:12 },
  duaTranslit:    { fontSize:13, color:C.gold, fontStyle:"italic", lineHeight:20, marginBottom:6, fontWeight:"500" },
  duaTranslation: { fontSize:13, color:"#3A3530", lineHeight:20, marginBottom:8 },
  duaSource:      { fontSize:11, color:C.subtext, fontStyle:"italic" },
});
