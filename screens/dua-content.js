/**
 * dua-content.js — Safar
 * Central repository of all duas with Arabic, transliteration, translation and source.
 * AUDIO_FILES maps voice mode + dua ID to a local require() asset.
 * Add audio files to assets/audio/ and register them here.
 */

export const DUAS = [
  // ── Ihram ──────────────────────────────────────────────────────────────────
  {
    id: "talbiyah",
    title: "Talbiyah",
    stage: "Ihram",
    arabic: "\u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643\u064e\u060c \u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643\u064e \u0644\u0627 \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0643\u064e \u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643",
    transliteration: "Labbayk All\u0101humma labbayk, labbayk l\u0101 shar\u012bka laka labbayk",
    translation: "Here I am O Allah, here I am. You have no partner, here I am.",
    source: "\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 1549",
    isFeatured: true,
  },
  // ── Entry ──────────────────────────────────────────────────────────────────
  {
    id: "first-sight-kaaba",
    title: "Upon First Sight of the Ka\u02bfbah",
    stage: "Entry",
    arabic: "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0632\u0650\u062f\u0652 \u0647\u064e\u0630\u064e\u0627 \u0627\u0644\u0652\u0628\u064e\u064a\u0652\u062a\u064e \u0634\u064e\u0631\u064e\u0641\u064b\u0627 \u0648\u064e\u062a\u064e\u0639\u0652\u0638\u0650\u064a\u0645\u064b\u0627 \u0648\u064e\u062a\u064e\u0643\u0652\u0631\u0650\u064a\u0645\u064b\u0627 \u0648\u064e\u0645\u064e\u0647\u064e\u0627\u0628\u064e\u0629\u064b",
    transliteration: "All\u0101humma zid h\u0101dhal-bayta shar\u0101fan wa ta\u02bf\u1e93\u012bman wa tark\u012bman wa mah\u0101bah",
    translation: "O Allah, increase this House in honour, greatness, nobility and reverence.",
    source: "Al-Azraq\u012b",
  },
  // ── Tawaf ─────────────────────────────────────────────────────────────────
  {
    id: "tawaf-start",
    title: "Upon Beginning \u1e62aw\u0101f",
    stage: "Tawaf",
    arabic: "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0647\u0650 \u0648\u064e\u0627\u0644\u0644\u0647\u064f \u0623\u064e\u0643\u0652\u0628\u064e\u0631\u064f",
    transliteration: "Bismi-ll\u0101hi wa-ll\u0101hu akbar",
    translation: "In the name of Allah, and Allah is the Greatest.",
    source: "\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 1613",
    isFeatured: true,
  },
  {
    id: "tawaf-yemeni-corner",
    title: "Between Yemeni Corner & Black Stone",
    stage: "Tawaf",
    arabic: "\u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u0622\u062a\u0650\u0646\u064e\u0627 \u0641\u0650\u064a \u0627\u0644\u062f\u064f\u0651\u0646\u0652\u064a\u064e\u0627 \u062d\u064e\u0633\u064e\u0646\u064e\u0629\u064b \u0648\u064e\u0641\u0650\u064a \u0627\u0644\u0622\u062e\u0650\u0631\u064e\u0629\u0650 \u062d\u064e\u0633\u064e\u0646\u064e\u0629\u064b \u0648\u064e\u0642\u0650\u0646\u064e\u0627 \u0639\u064e\u0630\u064e\u0627\u0628\u064e \u0627\u0644\u0646\u064e\u0651\u0627\u0631\u0650",
    transliteration: "Rabban\u0101 \u0101tin\u0101 fi\u02bfd-duny\u0101 \u1e25asanatan wa fi\u02bfl-\u0101khirati \u1e25asanatan wa qin\u0101 \u02bfadh\u0101ba\u02bbn-n\u0101r",
    translation: "Our Lord, give us good in this world and in the Hereafter, and protect us from the punishment of the Fire.",
    source: "Al-Baqarah 2:201",
  },
  // ── Zamzam ─────────────────────────────────────────────────────────────────
  {
    id: "zamzam",
    title: "When Drinking Zamzam",
    stage: "Tawaf",
    arabic: "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u0646\u0650\u0651\u064a \u0623\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e \u0639\u0650\u0644\u0652\u0645\u064b\u0627 \u0646\u064e\u0627\u0641\u0650\u0639\u064b\u0627 \u0648\u064e\u0631\u0650\u0632\u0652\u0642\u064b\u0627 \u0648\u064e\u0627\u0633\u0650\u0639\u064b\u0627 \u0648\u064e\u0634\u0650\u0641\u064e\u0627\u0621\u064b \u0645\u0650\u0646\u0652 \u0643\u064f\u0644\u0650\u0651 \u062f\u064e\u0627\u0621\u064d",
    transliteration: "All\u0101humma inn\u012b as\u02bfaluka \u02bfilman n\u0101fi\u02bfan wa rizqan w\u0101si\u02bfan wa shif\u0101\u02bfan min kulli d\u0101\u02bf",
    translation: "O Allah, I ask You for beneficial knowledge, abundant provision, and healing from every disease.",
    source: "Ibn M\u0101jah \u00b7 3062",
  },
  // ── Sa'y ──────────────────────────────────────────────────────────────────
  {
    id: "safa-start",
    title: "Upon Ascending \u1e62af\u0101",
    stage: "Sa\u02bfy",
    arabic: "\u0625\u0650\u0646\u064e\u0651 \u0627\u0644\u0635\u064e\u0651\u0641\u064e\u0627 \u0648\u064e\u0627\u0644\u0652\u0645\u064e\u0631\u0652\u0648\u064e\u0629\u064e \u0645\u0650\u0646\u0652 \u0634\u064e\u0639\u064e\u0627\u0626\u0650\u0631\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650",
    transliteration: "Inna\u1e63-\u1e63af\u0101 wal-marwata min sha\u02bf\u0101\u02bfiri-ll\u0101h",
    translation: "Indeed \u1e62af\u0101 and Marwah are among the signs of Allah.",
    source: "\u1e62a\u1e25\u012b\u1e25 Muslim \u00b7 1218",
    isFeatured: true,
  },
  {
    id: "safa-dua",
    title: "Du\u02bf\u0101 on \u1e62af\u0101 & Marwah",
    stage: "Sa\u02bfy",
    arabic: "\u0644\u064e\u0627 \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u064e\u0651\u0627 \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0648\u064e\u062d\u0652\u062f\u064e\u0647\u064f \u0644\u064e\u0627 \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0647\u064f\u060c \u0644\u064e\u0647\u064f \u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u064f \u0648\u064e\u0644\u064e\u0647\u064f \u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f",
    transliteration: "L\u0101 il\u0101ha illa-ll\u0101hu wa\u1e25dahu l\u0101 shar\u012bka lahu, lahu\u02bbl-mulku wa lahu\u02bbl-\u1e25amd",
    translation: "There is no god but Allah alone, with no partner. To Him belongs the dominion and to Him belongs all praise.",
    source: "\u1e62a\u1e25\u012b\u1e25 Muslim \u00b7 1218",
  },
  // ── Arafah ────────────────────────────────────────────────────────────────
  {
    id: "arafah",
    title: "Best Du\u02bf\u0101 at \u02bfarafah",
    stage: "Arafah",
    arabic: "\u0644\u064e\u0627 \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u064e\u0651\u0627 \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0648\u064e\u062d\u0652\u062f\u064e\u0647\u064f \u0644\u064e\u0627 \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0647\u064f\u060c \u0644\u064e\u0647\u064f \u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u064f \u0648\u064e\u0644\u064e\u0647\u064f \u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f \u0648\u064e\u0647\u064f\u0648\u064e \u0639\u064e\u0644\u064e\u0649 \u0643\u064f\u0644\u0650\u0651 \u0634\u064e\u064a\u0652\u0621\u064d \u0642\u064e\u062f\u0650\u064a\u0631\u064c",
    transliteration: "L\u0101 il\u0101ha illa-ll\u0101hu wa\u1e25dahu l\u0101 shar\u012bka lahu, lahu\u02bbl-mulku wa lahu\u02bbl-\u1e25amdu wa huwa \u02bfal\u0101 kulli shay\u02bfin qad\u012br",
    translation: "There is no god but Allah alone, with no partner. To Him belongs the dominion and all praise, and He is over all things powerful.",
    source: "Sunan al-Tirmidh\u012b \u00b7 3585",
    isFeatured: true,
  },
  // ── Muzdalifah ────────────────────────────────────────────────────────────
  {
    id: "muzdalifah",
    title: "Du\u02bf\u0101 at Muzdalifah",
    stage: "Muzdalifah",
    arabic: "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u0646\u064e\u0651 \u0647\u064e\u0630\u064e\u0627 \u0645\u064e\u0634\u0652\u0639\u064e\u0631\u064f \u0627\u0644\u0652\u062d\u064e\u0631\u064e\u0627\u0645\u0650 \u0641\u064e\u0627\u0652\u063a\u0652\u0641\u0650\u0631\u0652 \u0644\u0650\u064a \u0630\u064f\u0646\u064f\u0648\u0628\u0650\u064a \u0648\u064e\u0627\u062c\u0652\u0639\u064e\u0644\u0652\u0646\u0650\u064a \u0645\u0650\u0645\u064e\u0651\u0646\u0652 \u064a\u064f\u062d\u0652\u0633\u0650\u0646\u064f \u0627\u0644\u0652\u064a\u064e\u0648\u0652\u0645\u064e \u0633\u064e\u0639\u0652\u064a\u064e\u0647\u064f",
    transliteration: "All\u0101humma inna h\u0101dh\u0101 mash\u02bfaru\u02bbl-\u1e25ar\u0101mi fagh\u0302fir l\u012b dhun\u016bb\u012b waj\u02bfaln\u012b mimman yu\u1e25sinu\u02bbl-yawma sa\u02bfyah",
    translation: "O Allah, this is Mash\u02bfar al-\u1e24ar\u0101m. Forgive my sins and make me of those who perform this day well.",
    source: "Ibn M\u0101jah",
  },
  // ── Jamarat ───────────────────────────────────────────────────────────────
  {
    id: "jamarat",
    title: "Stoning the Pillars (Jamarat)",
    stage: "Jamarat",
    arabic: "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0648\u064e\u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0623\u064e\u0643\u0652\u0628\u064e\u0631\u064f \u0631\u064e\u063a\u0652\u0645\u064b\u0627 \u0644\u0650\u0644\u0634\u064e\u0651\u064a\u0652\u0637\u064e\u0627\u0646\u0650 \u0648\u064e\u062d\u0650\u0632\u0652\u0628\u0650\u0647\u0650",
    transliteration: "Bismi-ll\u0101hi wall\u0101hu akbar, raghman li\u02bbs-shayt\u0101ni wa \u1e25izbih",
    translation: "In the name of Allah, Allah is Greatest, in humiliation of the devil and his party.",
    source: "Musnad A\u1e25mad",
  },
  // ── Farewell ──────────────────────────────────────────────────────────────
  {
    id: "farewell-tawaf",
    title: "Taw\u0101f al-Wad\u0101\u02bf — Farewell",
    stage: "Farewell",
    arabic: "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u0646\u064e\u0651 \u0627\u0644\u0652\u0628\u064e\u064a\u0652\u062a\u064e \u0628\u064e\u064a\u0652\u062a\u064f\u0643\u064e \u0648\u064e\u0627\u0644\u0652\u062d\u064e\u0631\u064e\u0645\u064e \u062d\u064e\u0631\u064e\u0645\u064f\u0643\u064e \u0648\u064e\u0647\u064e\u0630\u064e\u0627 \u0645\u064e\u0642\u064e\u0627\u0645\u064f \u0627\u0644\u0652\u0639\u064e\u0627\u0626\u0650\u0630\u0650 \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u064e \u0627\u0644\u0646\u064e\u0651\u0627\u0631\u0650",
    transliteration: "All\u0101humma innal-bayta baytuka wal-\u1e25ar\u0101ma \u1e25ar\u0101muka wa h\u0101dh\u0101 maq\u0101mu\u02bbl-\u02bf\u0101\u02bfidhi bika mina\u02bbn-n\u0101r",
    translation: "O Allah, this House is Your House, this sanctuary is Your sanctuary, and this is the place of one who seeks refuge with You from the Fire.",
    source: "Al-Azraq\u012b",
    isFeatured: true,
  },
];

/**
 * AUDIO_FILES — map voice mode + dua ID to a local audio asset.
 * Add .mp3 files to assets/audio/ and register below.
 * Example: require("../assets/audio/traditional/talbiyah.mp3")
 */
export const AUDIO_FILES = {
  traditional: {
    // talbiyah: require("../assets/audio/traditional/talbiyah.mp3"),
  },
  gentle: {
    // talbiyah: require("../assets/audio/gentle/talbiyah.mp3"),
  },
};

// Helper used by PrintOfflineScreen
export function getDuasByStage(stage) {
  return DUAS.filter(d => d.stage === stage);
}

// ── Umrah-specific duas ────────────────────────────────────────────────────────
export const UMRAH_DUAS = DUAS.filter(d =>
  ["Ihram", "Entry", "Tawaf", "Sa\u02bfy", "Farewell"].includes(d.stage)
);

// ── Hajj duas — full pilgrimage ────────────────────────────────────────────────
export const HAJJ_DUAS = DUAS.filter(d =>
  ["Ihram", "Entry", "Tawaf", "Sa\u02bfy", "Arafah", "Muzdalifah", "Jamarat", "Farewell"].includes(d.stage)
);

// ── DUA_CONTENT map keyed by category id ──────────────────────────────────────
export const DUA_CONTENT = {
  // ── Pilgrimage routes ──
  hajj:       DUAS,
  umrahDuas:  UMRAH_DUAS,
  hajjDuas:   HAJJ_DUAS,
  umrah:      UMRAH_DUAS,   // MyDuasScreen "My Umrah Journey" list

  // ── My Lists ── (stage-filtered subsets for now — expand as dua library grows)
  family: DUAS.filter(d => ["General","Daily","Entry"].includes(d.stage)),
  daily:  DUAS.filter(d => ["Daily","General","Entry"].includes(d.stage)),
  sleep:  DUAS.filter(d => ["General","Before Sleep","Daily"].includes(d.stage)),

  // ── Discover categories — keys match MyDuasScreen DISCOVER_CATS IDs ──
  quran:      DUAS.filter(d => d.source?.toLowerCase().includes("quran") || d.source?.toLowerCase().includes("surah")),
  protect:    DUAS.filter(d =>
    d.title?.toLowerCase().includes("protect") ||
    d.text?.toLowerCase().includes("protect") ||
    ["General","Daily"].includes(d.stage)
  ),
  forgive:    DUAS.filter(d =>
    d.title?.toLowerCase().includes("forgiv") ||
    d.text?.toLowerCase().includes("istighfar") ||
    d.stage === "General"
  ),
  gratitude:  DUAS.filter(d =>
    d.title?.toLowerCase().includes("gratitud") ||
    d.title?.toLowerCase().includes("shukr") ||
    d.stage === "General"
  ),
  guidance:   DUAS.filter(d =>
    d.title?.toLowerCase().includes("guid") ||
    d.stage === "General"
  ),

  // ── Shared lists (use same content as umrah for now) ──
  s1: UMRAH_DUAS.filter(d => d.stage === "Tawaf"),
  s2: DUAS.filter(d => ["Daily","General"].includes(d.stage)),
  s3: UMRAH_DUAS,
};
