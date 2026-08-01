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
    transliteration: "Labbayk Allahumma labbayk, labbayk la sharika laka labbayk",
    translation: "Here I am O Allah, here I am. You have no partner, here I am.",
    source: "Sahih al-Bukhari \u00b7 1549",
    isFeatured: true,
  },
  // ── Entry ──────────────────────────────────────────────────────────────────
  {
    id: "first-sight-kaaba",
    title: "Upon First Sight of the Kabah",
    stage: "Entry",
    arabic: "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0632\u0650\u062f\u0652 \u0647\u064e\u0630\u064e\u0627 \u0627\u0644\u0652\u0628\u064e\u064a\u0652\u062a\u064e \u0634\u064e\u0631\u064e\u0641\u064b\u0627 \u0648\u064e\u062a\u064e\u0639\u0652\u0638\u0650\u064a\u0645\u064b\u0627 \u0648\u064e\u062a\u064e\u0643\u0652\u0631\u0650\u064a\u0645\u064b\u0627 \u0648\u064e\u0645\u064e\u0647\u064e\u0627\u0628\u064e\u0629\u064b",
    transliteration: "Allahumma zid hadhal-bayta sharafan wa taziman wa tarkiman wa mahabah",
    translation: "O Allah, increase this House in honour, greatness, nobility and reverence.",
    source: "Al-Azraqi",
  },
  // ── Tawaf ─────────────────────────────────────────────────────────────────
  {
    id: "tawaf-start",
    title: "Upon Beginning Sawaf",
    stage: "Tawaf",
    arabic: "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0647\u0650 \u0648\u064e\u0627\u0644\u0644\u0647\u064f \u0623\u064e\u0643\u0652\u0628\u064e\u0631\u064f",
    transliteration: "Bismi-llahi wa-llahu akbar",
    translation: "In the name of Allah, and Allah is the Greatest.",
    source: "Sahih al-Bukhari \u00b7 1613",
    isFeatured: true,
  },
  {
    id: "tawaf-yemeni-corner",
    title: "Between Yemeni Corner & Black Stone",
    stage: "Tawaf",
    arabic: "\u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u0622\u062a\u0650\u0646\u064e\u0627 \u0641\u0650\u064a \u0627\u0644\u062f\u064f\u0651\u0646\u0652\u064a\u064e\u0627 \u062d\u064e\u0633\u064e\u0646\u064e\u0629\u064b \u0648\u064e\u0641\u0650\u064a \u0627\u0644\u0622\u062e\u0650\u0631\u064e\u0629\u0650 \u062d\u064e\u0633\u064e\u0646\u064e\u0629\u064b \u0648\u064e\u0642\u0650\u0646\u064e\u0627 \u0639\u064e\u0630\u064e\u0627\u0628\u064e \u0627\u0644\u0646\u064e\u0651\u0627\u0631\u0650",
    transliteration: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina adhaban-nar",
    translation: "Our Lord, give us good in this world and in the Hereafter, and protect us from the punishment of the Fire.",
    source: "Al-Baqarah 2:201",
  },
  // ── Zamzam ─────────────────────────────────────────────────────────────────
  {
    id: "zamzam",
    title: "When Drinking Zamzam",
    stage: "Tawaf",
    arabic: "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u0646\u0650\u0651\u064a \u0623\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e \u0639\u0650\u0644\u0652\u0645\u064b\u0627 \u0646\u064e\u0627\u0641\u0650\u0639\u064b\u0627 \u0648\u064e\u0631\u0650\u0632\u0652\u0642\u064b\u0627 \u0648\u064e\u0627\u0633\u0650\u0639\u064b\u0627 \u0648\u064e\u0634\u0650\u0641\u064e\u0627\u0621\u064b \u0645\u0650\u0646\u0652 \u0643\u064f\u0644\u0650\u0651 \u062f\u064e\u0627\u0621\u064d",
    transliteration: "Allahumma inni asaluka ilman nafian wa rizqan wasian wa shifaan min kulli da",
    translation: "O Allah, I ask You for beneficial knowledge, abundant provision, and healing from every disease.",
    source: "Ibn Majah \u00b7 3062",
  },
  // ── Sa'y ──────────────────────────────────────────────────────────────────
  {
    id: "safa-start",
    title: "Upon Ascending Safa",
    stage: "Say",
    arabic: "\u0625\u0650\u0646\u064e\u0651 \u0627\u0644\u0635\u064e\u0651\u0641\u064e\u0627 \u0648\u064e\u0627\u0644\u0652\u0645\u064e\u0631\u0652\u0648\u064e\u0629\u064e \u0645\u0650\u0646\u0652 \u0634\u064e\u0639\u064e\u0627\u0626\u0650\u0631\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650",
    transliteration: "Innas-safa wal-marwata min shaairi-llah",
    translation: "Indeed Safa and Marwah are among the signs of Allah.",
    source: "Sahih Muslim \u00b7 1218",
    isFeatured: true,
  },
  {
    id: "safa-dua",
    title: "Dua on Safa & Marwah",
    stage: "Say",
    arabic: "\u0644\u064e\u0627 \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u064e\u0651\u0627 \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0648\u064e\u062d\u0652\u062f\u064e\u0647\u064f \u0644\u064e\u0627 \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0647\u064f\u060c \u0644\u064e\u0647\u064f \u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u064f \u0648\u064e\u0644\u064e\u0647\u064f \u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f",
    transliteration: "La ilaha illa-llahu wahdahu la sharika lahu, lahul-mulku wa lahul-hamd",
    translation: "There is no god but Allah alone, with no partner. To Him belongs the dominion and to Him belongs all praise.",
    source: "Sahih Muslim \u00b7 1218",
  },
  // ── Arafah ────────────────────────────────────────────────────────────────
  {
    id: "arafah",
    title: "Best Dua at arafah",
    stage: "Arafah",
    arabic: "\u0644\u064e\u0627 \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u064e\u0651\u0627 \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0648\u064e\u062d\u0652\u062f\u064e\u0647\u064f \u0644\u064e\u0627 \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0647\u064f\u060c \u0644\u064e\u0647\u064f \u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u064f \u0648\u064e\u0644\u064e\u0647\u064f \u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f \u0648\u064e\u0647\u064f\u0648\u064e \u0639\u064e\u0644\u064e\u0649 \u0643\u064f\u0644\u0650\u0651 \u0634\u064e\u064a\u0652\u0621\u064d \u0642\u064e\u062f\u0650\u064a\u0631\u064c",
    transliteration: "La ilaha illa-llahu wahdahu la sharika lahu, lahul-mulku wa lahul-hamdu wa huwa ala kulli shayin qadir",
    translation: "There is no god but Allah alone, with no partner. To Him belongs the dominion and all praise, and He is over all things powerful.",
    source: "Sunan al-Tirmidhi \u00b7 3585",
    isFeatured: true,
  },
  // ── Muzdalifah ────────────────────────────────────────────────────────────
  {
    id: "muzdalifah",
    title: "Dua at Muzdalifah",
    stage: "Muzdalifah",
    arabic: "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u0646\u064e\u0651 \u0647\u064e\u0630\u064e\u0627 \u0645\u064e\u0634\u0652\u0639\u064e\u0631\u064f \u0627\u0644\u0652\u062d\u064e\u0631\u064e\u0627\u0645\u0650 \u0641\u064e\u0627\u0652\u063a\u0652\u0641\u0650\u0631\u0652 \u0644\u0650\u064a \u0630\u064f\u0646\u064f\u0648\u0628\u0650\u064a \u0648\u064e\u0627\u062c\u0652\u0639\u064e\u0644\u0652\u0646\u0650\u064a \u0645\u0650\u0645\u064e\u0651\u0646\u0652 \u064a\u064f\u062d\u0652\u0633\u0650\u0646\u064f \u0627\u0644\u0652\u064a\u064e\u0648\u0652\u0645\u064e \u0633\u064e\u0639\u0652\u064a\u064e\u0647\u064f",
    transliteration: "Allahumma inna hadha masharul-harami fagh\u0302fir li dhunubi wajalni mimman yuhsinul-yawma sayah",
    translation: "O Allah, this is Mashar al-Haram. Forgive my sins and make me of those who perform this day well.",
    source: "Ibn Majah",
  },
  // ── Jamarat ───────────────────────────────────────────────────────────────
  {
    id: "jamarat",
    title: "Stoning the Pillars (Jamarat)",
    stage: "Jamarat",
    arabic: "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0648\u064e\u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0623\u064e\u0643\u0652\u0628\u064e\u0631\u064f \u0631\u064e\u063a\u0652\u0645\u064b\u0627 \u0644\u0650\u0644\u0634\u064e\u0651\u064a\u0652\u0637\u064e\u0627\u0646\u0650 \u0648\u064e\u062d\u0650\u0632\u0652\u0628\u0650\u0647\u0650",
    transliteration: "Bismi-llahi wallahu akbar, raghman lis-shaytani wa hizbih",
    translation: "In the name of Allah, Allah is Greatest, in humiliation of the devil and his party.",
    source: "Musnad Ahmad",
  },
  // ── Farewell ──────────────────────────────────────────────────────────────
  {
    id: "farewell-tawaf",
    title: "Tawaf al-Wada — Farewell",
    stage: "Farewell",
    arabic: "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u0646\u064e\u0651 \u0627\u0644\u0652\u0628\u064e\u064a\u0652\u062a\u064e \u0628\u064e\u064a\u0652\u062a\u064f\u0643\u064e \u0648\u064e\u0627\u0644\u0652\u062d\u064e\u0631\u064e\u0645\u064e \u062d\u064e\u0631\u064e\u0645\u064f\u0643\u064e \u0648\u064e\u0647\u064e\u0630\u064e\u0627 \u0645\u064e\u0642\u064e\u0627\u0645\u064f \u0627\u0644\u0652\u0639\u064e\u0627\u0626\u0650\u0630\u0650 \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u064e \u0627\u0644\u0646\u064e\u0651\u0627\u0631\u0650",
    transliteration: "Allahumma innal-bayta baytuka wal-harama haramuka wa hadha maqamul-aidhi bika minan-nar",
    translation: "O Allah, this House is Your House, this sanctuary is Your sanctuary, and this is the place of one who seeks refuge with You from the Fire.",
    source: "Al-Azraqi",
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
  ["Ihram", "Entry", "Tawaf", "Say", "Farewell"].includes(d.stage)
);

// ── Hajj duas — full pilgrimage ────────────────────────────────────────────────
export const HAJJ_DUAS = DUAS.filter(d =>
  ["Ihram", "Entry", "Tawaf", "Say", "Arafah", "Muzdalifah", "Jamarat", "Farewell"].includes(d.stage)
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
