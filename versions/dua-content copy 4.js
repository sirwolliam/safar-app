/**
 * dua-content.js — Safar
 * Central repository of all duas with Arabic, transliteration, translation and source.
 *
 * STAGES (used for filtering in DuaListScreen, FocusScreen, PrintOfflineScreen):
 *   "Ihram"       — Entering the state of Ihram
 *   "Entry"       — Entering Makkah and the Masjid al-Haram
 *   "Tawaf"       — Circumambulation of the Ka'bah
 *   "Zamzam"      — Drinking Zamzam water
 *   "Sa'y"        — Walking between Safa and Marwah
 *   "Arafah"      — Standing at Arafah (Hajj)
 *   "Muzdalifah"  — Night at Muzdalifah (Hajj)
 *   "Jamarat"     — Stoning the pillars (Hajj)
 *   "Farewell"    — Farewell Tawaf and leaving Makkah
 *   "Madinah"     — Visiting Al-Madinah al-Munawwarah
 *   "General"     — Everyday supplications for pilgrims
 *
 * AUDIO_FILES maps voice mode + dua ID to a local require() asset.
 * Add audio files to assets/audio/ and register them here.
 */

export const DUAS = [

  // ═══════════════════════════════════════════════════════════════════════════
  // IHRAM
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "talbiyah",
    title: "Talbiyah",
    stage: "Ihram",
    arabic:
      "\u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643\u064e\u060c \u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643\u064e \u0644\u0627 \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0643\u064e \u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643\u064e\u060c \u0625\u0650\u0646\u064e\u0651 \u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064e \u0648\u064e\u0627\u0644\u0646\u0650\u0651\u0639\u0652\u0645\u064e\u0629\u064e \u0644\u064e\u0643\u064e \u0648\u064e\u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u064f\u060c \u0644\u0627 \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0643\u064e",
    transliteration:
      "Labbayk All\u0101humma labbayk, labbayk l\u0101 shar\u012bka laka labbayk. Inna\u02bbl-\u1e25amda wa\u02bbn-ni\u02bfmata laka wal-mulk, l\u0101 shar\u012bka lak",
    translation:
      "Here I am, O Allah, here I am. Here I am, You have no partner, here I am. Truly all praise, grace and sovereignty belong to You. You have no partner.",
    source: "\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 1549",
    isFeatured: true,
  },

  {
    id: "niyyah-umrah",
    title: "Intention for Umrah",
    stage: "Ihram",
    arabic:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u0646\u0650\u0651\u064a \u0623\u064f\u0631\u0650\u064a\u062f\u064f \u0627\u0644\u0652\u0639\u064f\u0645\u0652\u0631\u064e\u0629\u064e \u0641\u064e\u064a\u064e\u0633\u0650\u0651\u0631\u0652\u0647\u064e\u0627 \u0644\u0650\u064a \u0648\u064e\u062a\u064e\u0642\u064e\u0628\u064e\u0651\u0644\u0652\u0647\u064e\u0627 \u0645\u0650\u0646\u0650\u0651\u064a",
    transliteration:
      "All\u0101humma inn\u012b ur\u012bdu\u02bbl-\u02bfumrata fayassirh\u0101 l\u012b wa taqabbalh\u0101 minn\u012b",
    translation:
      "O Allah, I intend to perform Umrah, so make it easy for me and accept it from me.",
    source: "Scholarly consensus (niyyah wording)",
  },

  {
    id: "niyyah-hajj",
    title: "Intention for Hajj",
    stage: "Ihram",
    arabic:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u0646\u0650\u0651\u064a \u0623\u064f\u0631\u0650\u064a\u062f\u064f \u0627\u0644\u0652\u062d\u064e\u062c\u064e\u0651 \u0641\u064e\u064a\u064e\u0633\u0650\u0651\u0631\u0652\u0647\u064f \u0644\u0650\u064a \u0648\u064e\u062a\u064e\u0642\u064e\u0628\u064e\u0651\u0644\u0652\u0647\u064f \u0645\u0650\u0646\u0650\u0651\u064a",
    transliteration:
      "All\u0101humma inn\u012b ur\u012bdu\u02bbl-\u1e25ajja fayassirhu l\u012b wa taqabbalhu minn\u012b",
    translation:
      "O Allah, I intend to perform Hajj, so make it easy for me and accept it from me.",
    source: "Scholarly consensus (niyyah wording)",
  },

  {
    id: "ihram-wearing",
    title: "Du\u02bf\u0101 When Wearing Ihr\u0101m",
    stage: "Ihram",
    arabic:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u0646\u0650\u0651\u064a \u0623\u064f\u062d\u0652\u0631\u0650\u0645\u064f \u0644\u0650\u0646\u064e\u0641\u0652\u0633\u0650\u064a \u0645\u064e\u0627 \u062d\u064e\u0631\u064e\u0651\u0645\u0652\u062a\u064e \u0639\u064e\u0644\u064e\u0649 \u0646\u064e\u0641\u0652\u0633\u0650\u0643\u064e \u0648\u064e\u0623\u064e\u062d\u0652\u0644\u064e\u0644\u0652\u062a\u064e \u0644\u0650\u0646\u064e\u0641\u0652\u0633\u0650\u064a \u0645\u064e\u0627 \u0623\u064e\u062d\u0652\u0644\u064e\u0644\u0652\u062a\u064e \u0644\u0650\u0646\u064e\u0641\u0652\u0633\u0650\u0643\u064e",
    transliteration:
      "All\u0101humma inn\u012b u\u1e25rimu linafs\u012b m\u0101 \u1e25arramta \u02bfal\u0101 nafsika wa a\u1e25laltu linafs\u012b m\u0101 a\u1e25laltu linafsik",
    translation:
      "O Allah, I make forbidden to myself what You have made forbidden to Yourself, and I make lawful to myself what You have made lawful to Yourself.",
    source: "Marasil Ab\u012b D\u0101w\u016bd",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ENTRY
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "entering-makkah",
    title: "Upon Entering Makkah",
    stage: "Entry",
    arabic:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0647\u064e\u0630\u064e\u0627 \u062d\u064e\u0631\u064e\u0645\u064f\u0643\u064e \u0648\u064e\u0623\u064e\u0645\u0652\u0646\u064f\u0643\u064e \u0641\u064e\u062d\u064e\u0631\u0650\u0651\u0645\u0652\u0646\u0650\u064a \u0639\u064e\u0644\u064e\u0649 \u0627\u0644\u0646\u064e\u0651\u0627\u0631\u0650 \u0648\u064e\u0622\u0645\u0650\u0646\u0652\u0646\u0650\u064a \u0645\u0650\u0646\u0652 \u0639\u064e\u0630\u064e\u0627\u0628\u0650\u0643\u064e \u0648\u064e\u0627\u0631\u0652\u0632\u064f\u0642\u0652\u0646\u0650\u064a \u0637\u064e\u0627\u0639\u064e\u062a\u064e\u0643\u064e",
    transliteration:
      "All\u0101humma h\u0101dh\u0101 \u1e25aramuka wa amnuk, fa\u1e25arrimn\u012b \u02bfala\u02bbn-n\u0101ri wa \u0101minn\u012b min \u02bfadh\u0101bika warzuqn\u012b \u1e6d\u0101\u02bfataka",
    translation:
      "O Allah, this is Your sanctuary and Your security. So forbid me to the Fire, keep me safe from Your punishment, and grant me obedience to You.",
    source: "Al-Bayhaq\u012b",
  },

  {
    id: "entering-masjid",
    title: "Upon Entering the Masjid",
    stage: "Entry",
    arabic:
      "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0648\u064e\u0627\u0644\u0633\u064e\u0651\u0644\u064e\u0627\u0645\u064f \u0639\u064e\u0644\u064e\u0649 \u0631\u064e\u0633\u064f\u0648\u0644\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650\u060c \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0627\u0652\u063a\u0652\u0641\u0650\u0631\u0652 \u0644\u0650\u064a \u0630\u064f\u0646\u064f\u0648\u0628\u0650\u064a \u0648\u064e\u0627\u0641\u0652\u062a\u064e\u062d\u0652 \u0644\u0650\u064a \u0623\u064e\u0628\u0652\u0648\u064e\u0627\u0628\u064e \u0631\u064e\u062d\u0652\u0645\u064e\u062a\u0650\u0643\u064e",
    transliteration:
      "Bismi-ll\u0101hi was-sal\u0101mu \u02bfal\u0101 ras\u016bli-ll\u0101h. All\u0101humma\u02bfghfir l\u012b dhun\u016bb\u012b waf-ta\u1e25 l\u012b abw\u0101ba ra\u1e25matik",
    translation:
      "In the name of Allah, and peace be upon the Messenger of Allah. O Allah, forgive my sins and open for me the gates of Your mercy.",
    source: "Sunan Ibn M\u0101jah \u00b7 771",
  },

  {
    id: "first-sight-kaaba",
    title: "Upon First Sight of the Ka\u02bfbah",
    stage: "Entry",
    arabic:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0632\u0650\u062f\u0652 \u0647\u064e\u0630\u064e\u0627 \u0627\u0644\u0652\u0628\u064e\u064a\u0652\u062a\u064e \u0634\u064e\u0631\u064e\u0641\u064b\u0627 \u0648\u064e\u062a\u064e\u0639\u0652\u0638\u0650\u064a\u0645\u064b\u0627 \u0648\u064e\u062a\u064e\u0643\u0652\u0631\u0650\u064a\u0645\u064b\u0627 \u0648\u064e\u0645\u064e\u0647\u064e\u0627\u0628\u064e\u0629\u064b\u060c \u0648\u064e\u0632\u0650\u062f\u0652 \u0645\u064e\u0646\u0652 \u0634\u064e\u0631\u064e\u0651\u0641\u064e\u0647\u064f \u0648\u064e\u0643\u064e\u0631\u064e\u0651\u0645\u064e\u0647\u064f \u0645\u0650\u0645\u064e\u0651\u0646\u0652 \u062d\u064e\u062c\u064e\u0651\u0647\u064f \u0623\u064e\u0648\u0650 \u0627\u0639\u0652\u062a\u064e\u0645\u064e\u0631\u064e\u0647\u064f \u0634\u064e\u0631\u064e\u0641\u064b\u0627 \u0648\u064e\u062a\u064e\u0643\u0652\u0631\u0650\u064a\u0645\u064b\u0627",
    transliteration:
      "All\u0101humma zid h\u0101dhal-bayta shar\u0101fan wa ta\u02bf\u1e93\u012bman wa tark\u012bman wa mah\u0101batan, wa zid man sharrafahu wa karramahu mimman \u1e25ajjahu \u02bfawi\u02bftamarahu shar\u0101fan wa tark\u012bm\u0101",
    translation:
      "O Allah, increase this House in honour, greatness, nobility and reverence, and increase those who honour it \u2014 those who perform Hajj or Umrah \u2014 in honour and nobility.",
    source: "Al-Azraq\u012b",
    isFeatured: true,
  },

  {
    id: "multazam",
    title: "Du\u02bf\u0101 at the Multazam",
    stage: "Entry",
    arabic:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0644\u064e\u0643\u064e \u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f \u0643\u064e\u0645\u064e\u0627 \u064a\u064e\u0646\u0652\u0628\u064e\u063a\u0650\u064a \u0644\u0650\u062c\u064e\u0644\u064e\u0627\u0644\u0650 \u0648\u064e\u062c\u0652\u0647\u0650\u0643\u064e \u0648\u064e\u0639\u064e\u0638\u0650\u064a\u0645\u0650 \u0633\u064f\u0644\u0652\u0637\u064e\u0627\u0646\u0650\u0643\u064e\u060c \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0627\u0652\u063a\u0652\u0641\u0650\u0631\u0652 \u0644\u0650\u064a \u0648\u064e\u0627\u0631\u0652\u062d\u064e\u0645\u0652\u0646\u0650\u064a \u0648\u064e\u0627\u0642\u0652\u0628\u064e\u0644\u0652 \u062a\u064e\u0648\u0652\u0628\u064e\u062a\u0650\u064a",
    transliteration:
      "All\u0101humma laka\u02bbl-\u1e25amdu kam\u0101 yanba\u1e75\u012b li-jal\u0101li wajhika wa \u02bfa\u1e93\u012bmi sul\u1e6d\u0101nik. All\u0101humma\u02bfghfir l\u012b war\u1e25amn\u012b waqbal tawbat\u012b",
    translation:
      "O Allah, all praise is Yours as befits the majesty of Your countenance and the greatness of Your authority. O Allah, forgive me, have mercy on me, and accept my repentance.",
    source: "Al-Azraq\u012b",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TAWAF
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "tawaf-start",
    title: "Upon Beginning \u1e62aw\u0101f",
    stage: "Tawaf",
    arabic: "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0647\u0650 \u0648\u064e\u0627\u0644\u0644\u0647\u064f \u0623\u064e\u0643\u0652\u0628\u064e\u0631\u064f",
    transliteration: "Bismi-ll\u0101hi wall\u0101hu akbar",
    translation: "In the name of Allah, and Allah is the Greatest.",
    source: "\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 1613",
    isFeatured: true,
  },

  {
    id: "tawaf-round-general",
    title: "General Du\u02bf\u0101 During \u1e62aw\u0101f",
    stage: "Tawaf",
    arabic:
      "\u0633\u064f\u0628\u0652\u062d\u064e\u0627\u0646\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0648\u064e\u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f \u0644\u0650\u0644\u0651\u064e\u0647\u0650 \u0648\u064e\u0644\u064e\u0627 \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u064e\u0651\u0627 \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0648\u064e\u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0623\u064e\u0643\u0652\u0628\u064e\u0631\u064f \u0648\u064e\u0644\u064e\u0627 \u062d\u064e\u0648\u0652\u0644\u064e \u0648\u064e\u0644\u064e\u0627 \u0642\u064f\u0648\u064e\u0651\u0629\u064e \u0625\u0650\u0644\u064e\u0651\u0627 \u0628\u0650\u0627\u0644\u0644\u0651\u064e\u0647\u0650",
    transliteration:
      "Sub\u1e25\u0101na-ll\u0101hi wal-\u1e25amdu lill\u0101hi wa l\u0101 il\u0101ha illa-ll\u0101hu wall\u0101hu akbar, wa l\u0101 \u1e25awla wa l\u0101 quwwata ill\u0101 bill\u0101h",
    translation:
      "Glory be to Allah, all praise is for Allah, there is no god but Allah, Allah is the Greatest, and there is no power or might except with Allah.",
    source: "\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 6384",
  },

  {
    id: "tawaf-forgiveness",
    title: "Seeking Forgiveness During \u1e62aw\u0101f",
    stage: "Tawaf",
    arabic:
      "\u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u0627\u0652\u063a\u0652\u0641\u0650\u0631\u0652 \u0644\u064e\u0646\u064e\u0627 \u0648\u064e\u0644\u0650\u0648\u064e\u0627\u0644\u0650\u062f\u064e\u064a\u0652\u0646\u064e\u0627 \u0648\u064e\u0644\u0650\u0644\u0652\u0645\u064f\u0624\u0652\u0645\u0650\u0646\u0650\u064a\u0646\u064e \u064a\u064e\u0648\u0652\u0645\u064e \u064a\u064e\u0642\u064f\u0648\u0645\u064f \u0627\u0644\u0652\u062d\u0650\u0633\u064e\u0627\u0628\u064f",
    transliteration:
      "Rabban\u0101\u02bfghfir lan\u0101 wa liw\u0101lidayn\u0101 wa lil-mu\u02bfmin\u012bna yawma yaq\u016bmu\u02bbl-\u1e25is\u0101b",
    translation:
      "Our Lord, forgive us and our parents and the believers on the Day of Reckoning.",
    source: "Ibr\u0101h\u012bm 14:41",
  },

  {
    id: "tawaf-yemeni-corner",
    title: "Between the Yemeni Corner & Black Stone",
    stage: "Tawaf",
    arabic:
      "\u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u0622\u062a\u0650\u0646\u064e\u0627 \u0641\u0650\u064a \u0627\u0644\u062f\u064f\u0651\u0646\u0652\u064a\u064e\u0627 \u062d\u064e\u0633\u064e\u0646\u064e\u0629\u064b \u0648\u064e\u0641\u0650\u064a \u0627\u0644\u0622\u062e\u0650\u0631\u064e\u0629\u0650 \u062d\u064e\u0633\u064e\u0646\u064e\u0629\u064b \u0648\u064e\u0642\u0650\u0646\u064e\u0627 \u0639\u064e\u0630\u064e\u0627\u0628\u064e \u0627\u0644\u0646\u064e\u0651\u0627\u0631\u0650",
    transliteration:
      "Rabban\u0101 \u0101tin\u0101 fi\u02bfd-duny\u0101 \u1e25asanatan wa fi\u02bfl-\u0101khirati \u1e25asanatan wa qin\u0101 \u02bfadh\u0101ba\u02bbn-n\u0101r",
    translation:
      "Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.",
    source: "Al-Baqarah 2:201",
    isFeatured: true,
  },

  {
    id: "tawaf-hateem",
    title: "Du\u02bf\u0101 Near the \u1e24at\u012bm",
    stage: "Tawaf",
    arabic:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u0646\u064e\u0651\u0643\u064e \u062a\u064e\u0639\u0652\u0644\u064e\u0645\u064f \u0633\u0650\u0631\u0650\u0651\u064a \u0648\u064e\u0639\u064e\u0644\u064e\u0627\u0646\u0650\u064a\u064e\u062a\u0650\u064a \u0641\u064e\u0627\u0642\u0652\u0628\u064e\u0644\u0652 \u0645\u064e\u0639\u0652\u0630\u0650\u0631\u064e\u062a\u0650\u064a\u060c \u0648\u064e\u062a\u064e\u0639\u0652\u0644\u064e\u0645\u064f \u062d\u064e\u0627\u062c\u064e\u062a\u0650\u064a \u0641\u064e\u0623\u064e\u0639\u0652\u0637\u0650\u0646\u0650\u064a \u0633\u064f\u0624\u0652\u0644\u0650\u064a",
    transliteration:
      "All\u0101humma innaka ta\u02bflamu sirr\u012b wa \u02bfal\u0101niyyat\u012b faqbal ma\u02bfdh\u0113rat\u012b, wa ta\u02bflamu \u1e25\u0101jat\u012b fa-a\u02bft\u0323in\u012b su\u02bfl\u012b",
    translation:
      "O Allah, You know my hidden and open affairs, so accept my apology. You know my need, so grant my request.",
    source: "Al-Azraq\u012b",
  },

  {
    id: "tawaf-completion",
    title: "Upon Completing \u1e62aw\u0101f",
    stage: "Tawaf",
    arabic:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u062a\u064e\u0642\u064e\u0628\u064e\u0651\u0644\u0652 \u0645\u0650\u0646\u064e\u0651\u0627 \u0625\u0650\u0646\u064e\u0651\u0643\u064e \u0623\u064e\u0646\u0652\u062a\u064e \u0627\u0644\u0633\u064e\u0651\u0645\u0650\u064a\u0639\u064f \u0627\u0644\u0652\u0639\u064e\u0644\u0650\u064a\u0645\u064f",
    transliteration:
      "All\u0101humma taqabbal minn\u0101, innaka anta\u02bbs-sam\u012b\u02bfu\u02bbl-\u02bfal\u012bm",
    translation:
      "O Allah, accept from us; indeed You are the All-Hearing, the All-Knowing.",
    source: "Al-Baqarah 2:127",
  },

  {
    id: "maqam-ibrahim",
    title: "At Maq\u0101m Ibr\u0101h\u012bm",
    stage: "Tawaf",
    arabic:
      "\u0648\u064e\u0627\u062a\u064e\u0651\u062e\u0650\u0630\u064f\u0648\u0627 \u0645\u0650\u0646\u0652 \u0645\u064e\u0642\u064e\u0627\u0645\u0650 \u0625\u0650\u0628\u0652\u0631\u064e\u0627\u0647\u0650\u064a\u0645\u064e \u0645\u064f\u0635\u064e\u0644\u0651\u064e\u0649",
    transliteration: "Wattakhidh\u016b min maq\u0101mi ibr\u0101h\u012bma mu\u1e63all\u0101",
    translation:
      "And take the Station of Ibrahim as a place of prayer.",
    source: "Al-Baqarah 2:125",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ZAMZAM
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "zamzam",
    title: "When Drinking Zamzam",
    stage: "Zamzam",
    arabic:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u0646\u0650\u0651\u064a \u0623\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e \u0639\u0650\u0644\u0652\u0645\u064b\u0627 \u0646\u064e\u0627\u0641\u0650\u0639\u064b\u0627 \u0648\u064e\u0631\u0650\u0632\u0652\u0642\u064b\u0627 \u0648\u064e\u0627\u0633\u0650\u0639\u064b\u0627 \u0648\u064e\u0634\u0650\u0641\u064e\u0627\u0621\u064b \u0645\u0650\u0646\u0652 \u0643\u064f\u0644\u0650\u0651 \u062f\u064e\u0627\u0621\u064d",
    transliteration:
      "All\u0101humma inn\u012b as\u02bfaluka \u02bfilman n\u0101fi\u02bfan wa rizqan w\u0101si\u02bfan wa shif\u0101\u02bfan min kulli d\u0101\u02bf",
    translation:
      "O Allah, I ask You for beneficial knowledge, abundant provision, and healing from every disease.",
    source: "Ibn M\u0101jah \u00b7 3062",
    isFeatured: true,
  },

  {
    id: "zamzam-facing-kaaba",
    title: "Drinking Zamzam Facing the Ka\u02bfbah",
    stage: "Zamzam",
    arabic:
      "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650\u060c \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0627\u062c\u0652\u0639\u064e\u0644\u0652\u0647\u064f \u0639\u0650\u0644\u0652\u0645\u064b\u0627 \u0646\u064e\u0627\u0641\u0650\u0639\u064b\u0627 \u0648\u064e\u0639\u064e\u0645\u064e\u0644\u0627\u064b \u0635\u064e\u0627\u0644\u0650\u062d\u064b\u0627 \u0648\u064e\u0634\u0650\u0641\u064e\u0627\u0621\u064b \u0645\u0650\u0646\u0652 \u0643\u064f\u0644\u0650\u0651 \u062f\u064e\u0627\u0621\u064d \u0648\u064e\u0633\u064f\u0642\u0652\u0645\u064d",
    transliteration:
      "Bismi-ll\u0101h. All\u0101humma\u02bfj\u02bfalhu \u02bfilman n\u0101fi\u02bfan wa \u02bfamalan \u1e63\u0101li\u1e25an wa shif\u0101\u02bfan min kulli d\u0101\u02bfin wa suqm",
    translation:
      "In the name of Allah. O Allah, make it beneficial knowledge, righteous action, and healing from every illness and ailment.",
    source: "Al-Mustadrak \u00b7 al-H\u0101kim",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SA'Y
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "safa-start",
    title: "Upon Ascending \u1e62af\u0101",
    stage: "Sa\u02bfy",
    arabic:
      "\u0625\u0650\u0646\u064e\u0651 \u0627\u0644\u0635\u064e\u0651\u0641\u064e\u0627 \u0648\u064e\u0627\u0644\u0652\u0645\u064e\u0631\u0652\u0648\u064e\u0629\u064e \u0645\u0650\u0646\u0652 \u0634\u064e\u0639\u064e\u0627\u0626\u0650\u0631\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650",
    transliteration:
      "Inna\u1e63-\u1e63af\u0101 wal-marwata min sha\u02bf\u0101\u02bfiri-ll\u0101h",
    translation:
      "Indeed \u1e62af\u0101 and Marwah are among the signs of Allah.",
    source: "\u1e62a\u1e25\u012b\u1e25 Muslim \u00b7 1218",
    isFeatured: true,
  },

  {
    id: "safa-dua",
    title: "Du\u02bf\u0101 on \u1e62af\u0101 & Marwah",
    stage: "Sa\u02bfy",
    arabic:
      "\u0644\u064e\u0627 \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u064e\u0651\u0627 \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0648\u064e\u062d\u0652\u062f\u064e\u0647\u064f \u0644\u064e\u0627 \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0647\u064f\u060c \u0644\u064e\u0647\u064f \u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u064f \u0648\u064e\u0644\u064e\u0647\u064f \u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f \u0648\u064e\u0647\u064f\u0648\u064e \u0639\u064e\u0644\u064e\u0649 \u0643\u064f\u0644\u0650\u0651 \u0634\u064e\u064a\u0652\u0621\u064d \u0642\u064e\u062f\u0650\u064a\u0631\u064c",
    transliteration:
      "L\u0101 il\u0101ha illa-ll\u0101hu wa\u1e25dahu l\u0101 shar\u012bka lahu, lahu\u02bbl-mulku wa lahu\u02bbl-\u1e25amdu wa huwa \u02bfal\u0101 kulli shay\u02bfin qad\u012br",
    translation:
      "There is no god but Allah alone, with no partner. To Him belongs the dominion and all praise, and He is over all things powerful.",
    source: "\u1e62a\u1e25\u012b\u1e25 Muslim \u00b7 1218",
  },

  {
    id: "say-walking",
    title: "Du\u02bf\u0101 While Walking Between \u1e62af\u0101 and Marwah",
    stage: "Sa\u02bfy",
    arabic:
      "\u0631\u064e\u0628\u0650\u0651 \u0627\u0652\u063a\u0652\u0641\u0650\u0631\u0652 \u0648\u064e\u0627\u0631\u0652\u062d\u064e\u0645\u0652 \u0648\u064e\u0627\u0646\u0652\u0638\u064f\u0631\u0652 \u0625\u0650\u0644\u064e\u0649 \u0645\u064e\u0627 \u062a\u064e\u0639\u0652\u0644\u064e\u0645\u064f\u060c \u0625\u0650\u0646\u064e\u0651\u0643\u064e \u062a\u064e\u0639\u0652\u0644\u064e\u0645\u064f \u0645\u064e\u0627 \u0644\u064e\u0627 \u0646\u064e\u0639\u0652\u0644\u064e\u0645\u064f\u060c \u0625\u0650\u0646\u064e\u0651\u0643\u064e \u0623\u064e\u0646\u0652\u062a\u064e \u0627\u0644\u0623\u064e\u0639\u064e\u0632\u064f\u0651 \u0627\u0644\u0623\u064e\u0643\u0652\u0631\u064e\u0645\u064f",
    transliteration:
      "Rabb-ighfir war\u1e25am wan\u1e93ur il\u0101 m\u0101 ta\u02bflam. Innaka ta\u02bflamu m\u0101 l\u0101 na\u02bflamu, innaka anta\u02bbl-a\u02bfazzu\u02bbl-akram",
    translation:
      "My Lord, forgive, have mercy, and consider what You know. You know what we do not know. You are the Most Honourable, the Most Generous.",
    source: "\u1e62a\u1e25\u012b\u1e25 Muslim \u00b7 1218",
  },

  {
    id: "say-running",
    title: "Du\u02bf\u0101 at the Green Markers",
    stage: "Sa\u02bfy",
    arabic:
      "\u0631\u064e\u0628\u064e\u0651 \u0627\u0646\u0652\u0641\u064e\u0639\u0652\u0646\u0650\u064a \u0628\u0650\u0645\u064e\u0627 \u0639\u064e\u0644\u0651\u064e\u0645\u0652\u062a\u064e\u0646\u0650\u064a\u060c \u0648\u064e\u0639\u064e\u0644\u0650\u0651\u0645\u0652\u0646\u0650\u064a \u0645\u064e\u0627 \u064a\u064e\u0646\u0652\u0641\u064e\u0639\u064f\u0646\u0650\u064a\u060c \u0648\u064e\u0632\u0650\u062f\u0652\u0646\u0650\u064a \u0639\u0650\u0644\u0652\u0645\u064b\u0627",
    transliteration:
      "Rabb-infa\u02bfn\u012b bim\u0101 \u02bfallamtan\u012b, wa \u02bfallitn\u012b m\u0101 yanfa\u02bfun\u012b, wa zidn\u012b \u02bfilm\u0101",
    translation:
      "My Lord, benefit me with what You have taught me, teach me what will benefit me, and increase me in knowledge.",
    source: "Sunan al-Tirmidh\u012b \u00b7 3599",
  },

  {
    id: "say-completion",
    title: "Upon Completing Sa\u02bfy",
    stage: "Sa\u02bfy",
    arabic:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u062a\u064e\u0642\u064e\u0628\u064e\u0651\u0644\u0652 \u0633\u064e\u0639\u0652\u064a\u064e\u0646\u064e\u0627 \u0648\u064e\u0627\u062c\u0652\u0639\u064e\u0644\u0652\u0647\u064f \u0641\u0650\u064a \u0645\u0650\u064a\u0632\u064e\u0627\u0646\u0650 \u062d\u064e\u0633\u064e\u0646\u064e\u0627\u062a\u0650\u0646\u064e\u0627",
    transliteration:
      "All\u0101humma taqabbal sa\u02bfyan\u0101 waj\u02bfalhu f\u012b m\u012bz\u0101ni \u1e25asanat\u012bn\u0101",
    translation:
      "O Allah, accept our Sa\u02bfy and place it in the scale of our good deeds.",
    source: "Scholarly tradition",
  },

  {
    id: "say-marwah",
    title: "Du\u02bf\u0101 Upon Reaching Marwah",
    stage: "Sa\u02bfy",
    arabic:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0623\u064e\u0643\u0652\u0628\u064e\u0631\u064f\u060c \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0623\u064e\u0643\u0652\u0628\u064e\u0631\u064f\u060c \u0644\u064e\u0627 \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u064e\u0651\u0627 \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0648\u064e\u062d\u0652\u062f\u064e\u0647\u064f\u060c \u0623\u064e\u0646\u0652\u062c\u064e\u0632\u064e \u0648\u064e\u0639\u0652\u062f\u064e\u0647\u064f \u0648\u064e\u0646\u064e\u0635\u064e\u0631\u064e \u0639\u064e\u0628\u0652\u062f\u064e\u0647\u064f",
    transliteration:
      "All\u0101hu akbar, All\u0101hu akbar, l\u0101 il\u0101ha illa-ll\u0101hu wa\u1e25dahu, anjaza wa\u02bfdahu wa na\u1e63ara \u02bfabdah",
    translation:
      "Allah is the Greatest, Allah is the Greatest. There is no god but Allah alone. He fulfilled His promise and helped His servant.",
    source: "\u1e62a\u1e25\u012b\u1e25 Muslim \u00b7 1218",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ARAFAH
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "arafah",
    title: "Best Du\u02bf\u0101 at \u02bfarafah",
    stage: "Arafah",
    arabic:
      "\u0644\u064e\u0627 \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u064e\u0651\u0627 \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0648\u064e\u062d\u0652\u062f\u064e\u0647\u064f \u0644\u064e\u0627 \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0647\u064f\u060c \u0644\u064e\u0647\u064f \u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u064f \u0648\u064e\u0644\u064e\u0647\u064f \u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f \u0648\u064e\u0647\u064f\u0648\u064e \u0639\u064e\u0644\u064e\u0649 \u0643\u064f\u0644\u0650\u0651 \u0634\u064e\u064a\u0652\u0621\u064d \u0642\u064e\u062f\u0650\u064a\u0631\u064c",
    transliteration:
      "L\u0101 il\u0101ha illa-ll\u0101hu wa\u1e25dahu l\u0101 shar\u012bka lahu, lahu\u02bbl-mulku wa lahu\u02bbl-\u1e25amdu wa huwa \u02bfal\u0101 kulli shay\u02bfin qad\u012br",
    translation:
      "There is no god but Allah alone, with no partner. To Him belongs the dominion and all praise, and He is over all things powerful.",
    source: "Sunan al-Tirmidh\u012b \u00b7 3585",
    isFeatured: true,
  },

  {
    id: "arafah-standing",
    title: "Du\u02bf\u0101 of Standing at \u02bfarafah",
    stage: "Arafah",
    arabic:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u0646\u064e\u0651\u0643\u064e \u062a\u064e\u0633\u0652\u0645\u064e\u0639\u064f \u0643\u064e\u0644\u064e\u0627\u0645\u0650\u064a \u0648\u064e\u062a\u064e\u0631\u064e\u0649 \u0645\u064e\u0643\u064e\u0627\u0646\u0650\u064a \u0648\u064e\u062a\u064e\u0639\u0652\u0644\u064e\u0645\u064f \u0633\u0650\u0631\u0650\u0651\u064a \u0648\u064e\u0639\u064e\u0644\u064e\u0627\u0646\u0650\u064a\u064e\u062a\u0650\u064a \u0648\u064e\u0644\u064e\u0627 \u064a\u064e\u062e\u0652\u0641\u064e\u0649 \u0639\u064e\u0644\u064e\u064a\u0652\u0643\u064e \u0634\u064e\u064a\u0652\u0621\u064c \u0645\u0650\u0646\u0652 \u0623\u064e\u0645\u0652\u0631\u0650\u064a",
    transliteration:
      "All\u0101humma innaka tasma\u02bfu kal\u0101m\u012b wa tar\u0101 mak\u0101n\u012b wa ta\u02bflamu sirr\u012b wa \u02bfal\u0101niyyat\u012b wa l\u0101 yakhf\u0101 \u02bfalayka shay\u02bfun min amr\u012b",
    translation:
      "O Allah, You hear my words, You see my place, You know my inner and outer affairs, and nothing of my matter is hidden from You.",
    source: "Al-Bayhaq\u012b",
  },

  {
    id: "arafah-forgiveness",
    title: "Seeking Forgiveness at \u02bfarafah",
    stage: "Arafah",
    arabic:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0627\u0652\u063a\u0652\u0641\u0650\u0631\u0652 \u0644\u0650\u064a \u0648\u064e\u0644\u0650\u0648\u064e\u0627\u0644\u0650\u062f\u064e\u064a\u0652 \u0648\u064e\u0644\u0650\u0623\u064e\u0647\u0652\u0644\u0650\u064a \u0648\u064e\u0644\u0650\u062c\u064e\u0645\u0650\u064a\u0639\u0650 \u0627\u0644\u0652\u0645\u064f\u0633\u0652\u0644\u0650\u0645\u0650\u064a\u0646\u064e",
    transliteration:
      "All\u0101humma\u02bfghfir l\u012b wa liw\u0101lidayya wa li-ahll\u012b wa lijam\u012b\u02bfil-muslim\u012bn",
    translation:
      "O Allah, forgive me, my parents, my family, and all Muslims.",
    source: "Scholarly tradition",
  },

  {
    id: "arafah-after-sunset",
    title: "Du\u02bf\u0101 After Sunset at \u02bfarafah",
    stage: "Arafah",
    arabic:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u0644\u064e\u064a\u0652\u0643\u064e \u062a\u064e\u0648\u064e\u062c\u064e\u0651\u0647\u0652\u062a\u064f\u060c \u0648\u064e\u0628\u0650\u0643\u064e \u0622\u0645\u064e\u0646\u0652\u062a\u064f\u060c \u0648\u064e\u0639\u064e\u0644\u064e\u064a\u0652\u0643\u064e \u062a\u064e\u0648\u064e\u0643\u064e\u0651\u0644\u0652\u062a\u064f\u060c \u0625\u0650\u0644\u064e\u064a\u0652\u0643\u064e \u0623\u064e\u0646\u064e\u0628\u0652\u062a\u064f",
    transliteration:
      "All\u0101humma ilayka tawajjahtu, wa bika \u0101mantu, wa \u02bfalayka tawakkaltu, ilayka anabtu",
    translation:
      "O Allah, I have turned my face to You, I have believed in You, I have placed my trust in You, and I have turned back to You.",
    source: "Scholarly tradition",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MUZDALIFAH
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "muzdalifah",
    title: "Du\u02bf\u0101 at Muzdalifah",
    stage: "Muzdalifah",
    arabic:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u0646\u064e\u0651 \u0647\u064e\u0630\u064e\u0627 \u0645\u064e\u0634\u0652\u0639\u064e\u0631\u064f \u0627\u0644\u0652\u062d\u064e\u0631\u064e\u0627\u0645\u0650 \u0641\u064e\u0627\u0652\u063a\u0652\u0641\u0650\u0631\u0652 \u0644\u0650\u064a \u0630\u064f\u0646\u064f\u0648\u0628\u0650\u064a \u0648\u064e\u0627\u062c\u0652\u0639\u064e\u0644\u0652\u0646\u0650\u064a \u0645\u0650\u0645\u064e\u0651\u0646\u0652 \u064a\u064f\u062d\u0652\u0633\u0650\u0646\u064f \u0627\u0644\u0652\u064a\u064e\u0648\u0652\u0645\u064e \u0633\u064e\u0639\u0652\u064a\u064e\u0647\u064f",
    transliteration:
      "All\u0101humma inna h\u0101dh\u0101 mash\u02bfaru\u02bbl-\u1e25ar\u0101mi fagh\u0302fir l\u012b dhun\u016bb\u012b waj\u02bfaln\u012b mimman yu\u1e25sinu\u02bbl-yawma sa\u02bfyah",
    translation:
      "O Allah, this is Mash\u02bfar al-\u1e24ar\u0101m. Forgive my sins and make me of those who perform this day well.",
    source: "Ibn M\u0101jah",
  },

  {
    id: "muzdalifah-arrival",
    title: "Upon Arriving at Muzdalifah",
    stage: "Muzdalifah",
    arabic:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u0646\u064e\u0651\u0627 \u0646\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e \u0623\u064e\u0646\u0652 \u062a\u064e\u062c\u0652\u0639\u064e\u0644\u064e \u0644\u064e\u0646\u064e\u0627 \u0641\u0650\u064a \u0633\u064e\u0641\u064e\u0631\u0650\u0646\u064e\u0627 \u0647\u064e\u0630\u064e\u0627 \u0628\u0631\u064e\u0651\u0643\u064e\u0629\u064b \u0648\u064e\u062a\u064e\u0642\u0652\u0648\u064e\u0649",
    transliteration:
      "All\u0101humma inn\u0101 nas\u02bfaluka an taj\u02bfala lan\u0101 f\u012b safarin\u0101 h\u0101dh\u0101 barakatan wa taqw\u0101",
    translation:
      "O Allah, we ask You to place in this our journey blessings and God-consciousness.",
    source: "Scholarly tradition",
  },

  {
    id: "muzdalifah-dawn",
    title: "Du\u02bf\u0101 at Dawn in Muzdalifah",
    stage: "Muzdalifah",
    arabic:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0628\u0650\u0643\u064e \u0623\u064e\u0635\u0652\u0628\u064e\u062d\u0652\u0646\u064e\u0627 \u0648\u064e\u0628\u0650\u0643\u064e \u0623\u064e\u0645\u0652\u0633\u064e\u064a\u0652\u0646\u064e\u0627\u060c \u0648\u064e\u0628\u0650\u0643\u064e \u0646\u064e\u062d\u0652\u064a\u064e\u0627 \u0648\u064e\u0628\u0650\u0643\u064e \u0646\u064e\u0645\u064f\u0648\u062a\u064f \u0648\u064e\u0625\u0650\u0644\u064e\u064a\u0652\u0643\u064e \u0627\u0644\u0646\u064f\u0651\u0634\u064f\u0648\u0631\u064f",
    transliteration:
      "All\u0101humma bika a\u1e63ba\u1e25n\u0101 wa bika amsayn\u0101, wa bika na\u1e25y\u0101 wa bika nam\u016btu wa ilayka\u02bbn-nush\u016br",
    translation:
      "O Allah, by You we enter the morning and by You we enter the evening; by You we live and by You we die, and to You is the resurrection.",
    source: "Sunan al-Tirmidh\u012b \u00b7 3391",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // JAMARAT
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "jamarat",
    title: "Stoning the Pillars (All Three)",
    stage: "Jamarat",
    arabic:
      "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0648\u064e\u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0623\u064e\u0643\u0652\u0628\u064e\u0631\u064f \u0631\u064e\u063a\u0652\u0645\u064b\u0627 \u0644\u0650\u0644\u0634\u064e\u0651\u064a\u0652\u0637\u064e\u0627\u0646\u0650 \u0648\u064e\u062d\u0650\u0632\u0652\u0628\u0650\u0647\u0650",
    transliteration:
      "Bismi-ll\u0101hi wall\u0101hu akbar, raghman li\u02bfs-shayt\u0101ni wa \u1e25izbih",
    translation:
      "In the name of Allah, Allah is the Greatest, in humiliation of the devil and his party.",
    source: "Musnad A\u1e25mad",
    isFeatured: true,
  },

  {
    id: "jamarat-sughra",
    title: "Stoning Al-Jamar\u0101h al-\u1e62ughr\u0101 (Small Pillar)",
    stage: "Jamarat",
    arabic:
      "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0648\u064e\u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0623\u064e\u0643\u0652\u0628\u064e\u0631\u064f\u060c \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0627\u062c\u0652\u0639\u064e\u0644\u0652\u0647\u064f \u062d\u064e\u062c\u064e\u0651\u0627 \u0645\u064e\u0628\u0652\u0631\u064f\u0648\u0631\u064b\u0627 \u0648\u064e\u0630\u064e\u0646\u0652\u0628\u064b\u0627 \u0645\u064e\u063a\u0652\u0641\u064f\u0648\u0631\u064b\u0627",
    transliteration:
      "Bismi-ll\u0101hi wall\u0101hu akbar. All\u0101humma\u02bfj\u02bfalhu \u1e25ajjan mabrur\u0101n wa dhanban magh\u0302f\u016br\u0101",
    translation:
      "In the name of Allah, Allah is the Greatest. O Allah, make this a blessed Hajj and a forgiven sin.",
    source: "Scholarly tradition",
  },

  {
    id: "jamarat-wusta",
    title: "After Stoning Al-Jamar\u0101h al-Wus\u1e6d\u0101 (Middle Pillar)",
    stage: "Jamarat",
    arabic:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0627\u062c\u0652\u0639\u064e\u0644\u0652\u0647\u064f \u0647\u064e\u062c\u0651\u064b\u0627 \u0645\u064e\u0642\u0652\u0628\u064f\u0648\u0644\u0627\u064b \u0648\u064e\u0633\u064e\u0639\u0652\u064a\u064b\u0627 \u0645\u064e\u0634\u0652\u0643\u064f\u0648\u0631\u064b\u0627 \u0648\u064e\u0630\u064e\u0646\u0652\u0628\u064b\u0627 \u0645\u064e\u063a\u0652\u0641\u064f\u0648\u0631\u064b\u0627",
    transliteration:
      "All\u0101humma\u02bfj\u02bfalhu \u1e25ajjan maqb\u016bl\u0101n wa sa\u02bfyan mashk\u016bran wa dhanban magh\u0302f\u016br\u0101",
    translation:
      "O Allah, make it an accepted Hajj, a thanked effort, and a forgiven sin.",
    source: "Scholarly tradition",
  },

  {
    id: "jamarat-kubra",
    title: "Stoning Al-Jamar\u0101h al-Kubr\u0101 (Large Pillar)",
    stage: "Jamarat",
    arabic:
      "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0648\u064e\u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0623\u064e\u0643\u0652\u0628\u064e\u0631\u064f\u060c \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u062d\u064e\u0642\u0650\u0651\u0631\u0652 \u0627\u0644\u0634\u064e\u0651\u064a\u0652\u0637\u064e\u0627\u0646\u064e \u0648\u064e\u062d\u0650\u0632\u0652\u0628\u064e\u0647\u064f \u0648\u0623\u064e\u0639\u0644\u0650 \u0643\u064e\u0644\u0650\u0645\u064e\u062a\u064e\u0643\u064e",
    transliteration:
      "Bismi-ll\u0101hi wall\u0101hu akbar. All\u0101humma \u1e25aqqir ash-shay\u1e6d\u0101na wa \u1e25izbah\u016b wa a\u02bfli kalimatak",
    translation:
      "In the name of Allah, Allah is the Greatest. O Allah, humiliate the devil and his party, and exalt Your word.",
    source: "Scholarly tradition",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FAREWELL
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "farewell-tawaf",
    title: "Taw\u0101f al-Wad\u0101\u02bf — Farewell",
    stage: "Farewell",
    arabic:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u0646\u064e\u0651 \u0627\u0644\u0652\u0628\u064e\u064a\u0652\u062a\u064e \u0628\u064e\u064a\u0652\u062a\u064f\u0643\u064e \u0648\u064e\u0627\u0644\u0652\u062d\u064e\u0631\u064e\u0645\u064e \u062d\u064e\u0631\u064e\u0645\u064f\u0643\u064e \u0648\u064e\u0647\u064e\u0630\u064e\u0627 \u0645\u064e\u0642\u064e\u0627\u0645\u064f \u0627\u0644\u0652\u0639\u064e\u0627\u0626\u0650\u0630\u0650 \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u064e \u0627\u0644\u0646\u064e\u0651\u0627\u0631\u0650",
    transliteration:
      "All\u0101humma innal-bayta baytuka wal-\u1e25ar\u0101ma \u1e25ar\u0101muka wa h\u0101dh\u0101 maq\u0101mu\u02bbl-\u02bf\u0101\u02bfidhi bika mina\u02bbn-n\u0101r",
    translation:
      "O Allah, this House is Your House, this sanctuary is Your sanctuary, and this is the place of one who seeks refuge with You from the Fire.",
    source: "Al-Azraq\u012b",
    isFeatured: true,
  },

  {
    id: "leaving-makkah",
    title: "Du\u02bf\u0101 When Leaving Makkah",
    stage: "Farewell",
    arabic:
      "\u0622\u064a\u0650\u0628\u064f\u0648\u0646\u064e \u062a\u064e\u0627\u0626\u0650\u0628\u064f\u0648\u0646\u064e \u0639\u064e\u0627\u0628\u0650\u062f\u064f\u0648\u0646\u064e \u0644\u0650\u0631\u064e\u0628\u0650\u0651\u0646\u064e\u0627 \u062d\u064e\u0627\u0645\u0650\u062f\u064f\u0648\u0646\u064e",
    transliteration: "\u0100\u02bfib\u016bna t\u0101\u02bfib\u016bna \u02bf\u0101bid\u016bna lirabbin\u0101 \u1e25\u0101mid\u016bn",
    translation:
      "We return, repenting, worshipping, and praising our Lord.",
    source: "\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 1797",
  },

  {
    id: "farewell-prayer-return",
    title: "Du\u02bf\u0101 for Return to Makkah",
    stage: "Farewell",
    arabic:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0644\u064e\u0627 \u062a\u064e\u062c\u0652\u0639\u064e\u0644\u0652 \u0647\u064e\u0630\u064e\u0627 \u0622\u062e\u0650\u0631\u064e \u0627\u0644\u0652\u0639\u064e\u0647\u0652\u062f\u0650 \u0628\u0650\u0647\u064e\u0630\u064e\u0627 \u0627\u0644\u0652\u0628\u064e\u064a\u0652\u062a\u0650 \u0627\u0644\u0652\u062d\u064e\u0631\u064e\u0627\u0645\u0650\u060c \u0648\u064e\u0627\u0631\u0652\u0632\u064f\u0642\u0652\u0646\u064e\u0627 \u0627\u0644\u0652\u0639\u064e\u0648\u0652\u062f\u064e \u0625\u0650\u0644\u064e\u064a\u0652\u0647\u0650",
    transliteration:
      "All\u0101humma l\u0101 taj\u02bfal h\u0101dh\u0101 \u0101khiral-\u02bfahdi bi-h\u0101dhal-baytil-\u1e25ar\u0101m, warzuqna\u02bbl-\u02bfawda ilayh",
    translation:
      "O Allah, do not make this the last visit to the Sacred House, and grant us the provision to return to it.",
    source: "Sunan al-Tirmidh\u012b \u00b7 3474",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MADINAH
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "entering-madinah",
    title: "Upon Entering al-Mad\u012bnah",
    stage: "Madinah",
    arabic:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0647\u064e\u0630\u064e\u0627 \u062d\u064e\u0631\u064e\u0645\u064f \u0646\u064e\u0628\u0650\u064a\u0650\u0651\u0643\u064e \u0648\u064e\u0627\u0645\u0646\u064f \u0631\u064e\u0633\u064f\u0648\u0644\u0650\u0643\u064e\u060c \u0641\u064e\u062d\u064e\u0631\u0650\u0651\u0645\u0652\u0646\u0650\u064a \u0639\u064e\u0644\u064e\u0649 \u0627\u0644\u0646\u064e\u0651\u0627\u0631\u0650 \u0648\u064e\u0627\u062c\u0652\u0639\u064e\u0644\u0652\u0646\u0650\u064a \u0645\u0650\u0646\u0652 \u0623\u064e\u0647\u0652\u0644\u0650 \u0637\u064e\u0627\u0639\u064e\u062a\u0650\u0643\u064e",
    transliteration:
      "All\u0101humma h\u0101dh\u0101 \u1e25aramu nabiyyika wa amnu ras\u016blik, fa\u1e25arrimn\u012b \u02bfala\u02bbn-n\u0101ri waj\u02bfaln\u012b min ahli \u1e6d\u0101\u02bfatik",
    translation:
      "O Allah, this is the sanctuary of Your Prophet and the security of Your Messenger. Forbid me to the Fire and make me from the people of Your obedience.",
    source: "Scholarly tradition",
    isFeatured: true,
  },

  {
    id: "salawat-prophet",
    title: "Sal\u0101h Upon the Prophet \u0635\u0644\u0649 \u0627\u0644\u0644\u0647 \u0639\u0644\u064a\u0647 \u0648\u0633\u0644\u0645",
    stage: "Madinah",
    arabic:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0635\u064e\u0644\u0650\u0651 \u0639\u064e\u0644\u064e\u0649 \u0645\u064f\u062d\u064e\u0645\u064e\u0651\u062f\u064d \u0648\u064e\u0639\u064e\u0644\u064e\u0649 \u0622\u0644\u0650 \u0645\u064f\u062d\u064e\u0645\u064e\u0651\u062f\u064d\u060c \u0643\u064e\u0645\u064e\u0627 \u0635\u064e\u0644\u064e\u0651\u064a\u0652\u062a\u064e \u0639\u064e\u0644\u064e\u0649 \u0622\u0644\u0650 \u0625\u0650\u0628\u0652\u0631\u064e\u0627\u0647\u0650\u064a\u0645\u064e\u060c \u0625\u0650\u0646\u064e\u0651\u0643\u064e \u062d\u064e\u0645\u0650\u064a\u062f\u064c \u0645\u064e\u062c\u0650\u064a\u062f\u064c",
    transliteration:
      "All\u0101humma \u1e63alli \u02bfal\u0101 Mu\u1e25ammadin wa \u02bfal\u0101 \u0101li Mu\u1e25ammad, kam\u0101 \u1e63allayta \u02bfal\u0101 \u0101li Ibr\u0101h\u012bm, innaka \u1e25am\u012bdun maj\u012bd",
    translation:
      "O Allah, send blessings upon Muhammad and upon the family of Muhammad, as You sent blessings upon the family of Ibrahim; indeed You are Praiseworthy and Glorious.",
    source: "\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 3370",
  },

  {
    id: "rawdah-madinah",
    title: "Du\u02bf\u0101 in Riy\u0101\u1e0d al-Jannah",
    stage: "Madinah",
    arabic:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u0646\u0650\u0651\u064a \u0623\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e \u0628\u0650\u062d\u064f\u0628\u0650\u0651 \u0647\u064e\u0630\u064e\u0627 \u0627\u0644\u0646\u064e\u0651\u0628\u0650\u064a\u0650\u0651 \u0627\u0644\u0643\u064e\u0631\u0650\u064a\u0645\u0650 \u0623\u064e\u0646\u0652 \u062a\u064e\u063a\u0652\u0641\u0650\u0631\u064e \u0644\u0650\u064a \u0648\u064e\u062a\u064e\u0631\u0652\u062d\u064e\u0645\u064e\u0646\u0650\u064a \u0648\u064e\u062a\u064f\u062f\u0652\u062e\u0650\u0644\u064e\u0646\u0650\u064a \u0627\u0644\u0652\u062c\u064e\u0646\u064e\u0651\u0629\u064e \u0628\u0650\u0634\u064e\u0641\u064e\u0627\u0639\u064e\u062a\u0650\u0647\u0650",
    transliteration:
      "All\u0101humma inn\u012b as\u02bfaluka bi-\u1e25ubbi h\u0101dhan-nabiyyil-kar\u012bm an taghfira l\u012b wa tar\u1e25aman\u012b wa tudkhilan\u012b\u02bbl-jannata bi-shaf\u0101\u02bfatih",
    translation:
      "O Allah, I ask You by the love of this noble Prophet that You forgive me, have mercy on me, and enter me into Paradise through his intercession.",
    source: "Scholarly tradition",
  },

  {
    id: "prophets-grave",
    title: "Sal\u0101m at the Prophet\u2019s Grave",
    stage: "Madinah",
    arabic:
      "\u0627\u0644\u0633\u064e\u0651\u0644\u064e\u0627\u0645\u064f \u0639\u064e\u0644\u064e\u064a\u0652\u0643\u064e \u064a\u064e\u0627 \u0631\u064e\u0633\u064f\u0648\u0644\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u0650\u060c \u0627\u0644\u0633\u064e\u0651\u0644\u064e\u0627\u0645\u064f \u0639\u064e\u0644\u064e\u064a\u0652\u0643\u064e \u064a\u064e\u0627 \u0646\u064e\u0628\u0650\u064a\u064e\u0651 \u0627\u0644\u0644\u0651\u064e\u0647\u0650\u060c \u0627\u0644\u0633\u064e\u0651\u0644\u064e\u0627\u0645\u064f \u0639\u064e\u0644\u064e\u064a\u0652\u0643\u064e \u064a\u064e\u0627 \u062e\u064e\u064a\u0652\u0631\u064e \u062e\u064e\u0644\u0652\u0642\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650",
    transliteration:
      "As-sal\u0101mu \u02bfalayka y\u0101 ras\u016bla-ll\u0101h, as-sal\u0101mu \u02bfalayka y\u0101 nabiyya-ll\u0101h, as-sal\u0101mu \u02bfalayka y\u0101 khayra khalqi-ll\u0101h",
    translation:
      "Peace be upon you, O Messenger of Allah. Peace be upon you, O Prophet of Allah. Peace be upon you, O best of Allah\u2019s creation.",
    source: "\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 1233",
  },

  {
    id: "madinah-farewell",
    title: "Du\u02bf\u0101 Leaving al-Mad\u012bnah",
    stage: "Madinah",
    arabic:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0644\u064e\u0627 \u062a\u064e\u062c\u0652\u0639\u064e\u0644\u0652 \u0647\u064e\u0630\u064e\u0627 \u0622\u062e\u0650\u0631\u064e \u0639\u064e\u0647\u0652\u062f\u0650\u064a \u0628\u0650\u0647\u064e\u0630\u064e\u0627 \u0627\u0644\u0645\u064e\u0633\u0652\u062c\u0650\u062f\u0650 \u0627\u0644\u0634\u064e\u0651\u0631\u0650\u064a\u0641\u0650\u060c \u0648\u064e\u0627\u0631\u0652\u0632\u064f\u0642\u0652\u0646\u0650\u064a \u0627\u0644\u0652\u0639\u064e\u0648\u0652\u062f\u064e \u0625\u0650\u0644\u064e\u064a\u0652\u0647\u0650",
    transliteration:
      "All\u0101humma l\u0101 taj\u02bfal h\u0101dh\u0101 \u0101khira \u02bfahd\u012b bi-h\u0101dhal-masjidish-shar\u012bf, warzuqn\u012b\u02bbl-\u02bfawda ilayh",
    translation:
      "O Allah, do not make this the last of my visits to this noble mosque, and grant me the provision to return to it.",
    source: "Scholarly tradition",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GENERAL
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "morning-adhkar",
    title: "Morning Remembrance",
    stage: "General",
    arabic:
      "\u0623\u064e\u0635\u0652\u0628\u064e\u062d\u0652\u0646\u064e\u0627 \u0648\u064e\u0623\u064e\u0635\u0652\u0628\u064e\u062d\u064e \u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u064f \u0644\u0650\u0644\u0651\u064e\u0647\u0650 \u0648\u064e\u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f \u0644\u0650\u0644\u0651\u064e\u0647\u0650\u060c \u0644\u064e\u0627 \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u064e\u0651\u0627 \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0648\u064e\u062d\u0652\u062f\u064e\u0647\u064f \u0644\u064e\u0627 \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0647\u064f\u060c \u0644\u064e\u0647\u064f \u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u064f \u0648\u064e\u0644\u064e\u0647\u064f \u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f \u0648\u064e\u0647\u064f\u0648\u064e \u0639\u064e\u0644\u064e\u0649 \u0643\u064f\u0644\u0650\u0651 \u0634\u064e\u064a\u0652\u0621\u064d \u0642\u064e\u062f\u0650\u064a\u0631\u064c",
    transliteration:
      "A\u1e63ba\u1e25n\u0101 wa a\u1e63ba\u1e25al-mulku lill\u0101hi wal-\u1e25amdu lill\u0101h. L\u0101 il\u0101ha illa-ll\u0101hu wa\u1e25dahu l\u0101 shar\u012bka lahu, lahu\u02bbl-mulku wa lahu\u02bbl-\u1e25amdu wa huwa \u02bfal\u0101 kulli shay\u02bfin qad\u012br",
    translation:
      "We have entered the morning and the dominion belongs to Allah, and all praise is for Allah. There is no god but Allah alone, with no partner. To Him belongs the dominion and all praise, and He is over all things powerful.",
    source: "\u1e62a\u1e25\u012b\u1e25 Muslim \u00b7 2723",
    isFeatured: true,
  },

  {
    id: "evening-adhkar",
    title: "Evening Remembrance",
    stage: "General",
    arabic:
      "\u0623\u064e\u0645\u0652\u0633\u064e\u064a\u0652\u0646\u064e\u0627 \u0648\u064e\u0623\u064e\u0645\u0652\u0633\u064e\u0649 \u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u064f \u0644\u0650\u0644\u0651\u064e\u0647\u0650\u060c \u0648\u064e\u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f \u0644\u0650\u0644\u0651\u064e\u0647\u0650\u060c \u0644\u064e\u0627 \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u064e\u0651\u0627 \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0648\u064e\u062d\u0652\u062f\u064e\u0647\u064f \u0644\u064e\u0627 \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0647\u064f",
    transliteration:
      "Amsayn\u0101 wa amsal-mulku lill\u0101h, wal-\u1e25amdu lill\u0101h. L\u0101 il\u0101ha illa-ll\u0101hu wa\u1e25dahu l\u0101 shar\u012bka lah",
    translation:
      "We have entered the evening and the dominion belongs to Allah, and all praise is for Allah. There is no god but Allah alone, with no partner.",
    source: "\u1e62a\u1e25\u012b\u1e25 Muslim \u00b7 2723",
  },

  {
    id: "dua-for-parents",
    title: "Du\u02bf\u0101 for Parents",
    stage: "General",
    arabic:
      "\u0631\u064e\u0628\u0650\u0651 \u0627\u0631\u0652\u062d\u064e\u0645\u0652\u0647\u064f\u0645\u064e\u0627 \u0643\u064e\u0645\u064e\u0627 \u0631\u064e\u0628\u064e\u0651\u064a\u064e\u0627\u0646\u0650\u064a \u0635\u064e\u063a\u0650\u064a\u0631\u064b\u0627",
    transliteration: "Rabb-ir\u1e25amhum\u0101 kam\u0101 rabbay\u0101n\u012b \u1e63agh\u012br\u0101",
    translation:
      "My Lord, have mercy on them both, as they raised me when I was small.",
    source: "Al-Isr\u0101\u02bf 17:24",
    isFeatured: true,
  },

  {
    id: "dua-for-acceptance",
    title: "Du\u02bf\u0101 for Acceptance of Deeds",
    stage: "General",
    arabic:
      "\u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u062a\u064e\u0642\u064e\u0628\u064e\u0651\u0644\u0652 \u0645\u0650\u0646\u064e\u0651\u0627\u060c \u0625\u0650\u0646\u064e\u0651\u0643\u064e \u0623\u064e\u0646\u0652\u062a\u064e \u0627\u0644\u0633\u064e\u0651\u0645\u0650\u064a\u0639\u064f \u0627\u0644\u0652\u0639\u064e\u0644\u0650\u064a\u0645\u064f",
    transliteration:
      "Rabban\u0101 taqabbal minn\u0101, innaka anta\u02bbs-sam\u012b\u02bfu\u02bbl-\u02bfal\u012bm",
    translation:
      "Our Lord, accept from us; indeed You are the All-Hearing, the All-Knowing.",
    source: "Al-Baqarah 2:127",
  },

  {
    id: "istikhara",
    title: "Du\u02bf\u0101 al-Istikh\u0101rah",
    stage: "General",
    arabic:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u0646\u0650\u0651\u064a \u0623\u064e\u0633\u0652\u062a\u064e\u062e\u0650\u064a\u0631\u064f\u0643\u064e \u0628\u0650\u0639\u0650\u0644\u0652\u0645\u0650\u0643\u064e\u060c \u0648\u064e\u0623\u064e\u0633\u0652\u062a\u064e\u0642\u0652\u062f\u0650\u0631\u064f\u0643\u064e \u0628\u0650\u0642\u064f\u062f\u0652\u0631\u064e\u062a\u0650\u0643\u064e\u060c \u0648\u064e\u0623\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e \u0645\u0650\u0646\u0652 \u0641\u064e\u0636\u0652\u0644\u0650\u0643\u064e \u0627\u0644\u0652\u0639\u064e\u0638\u0650\u064a\u0645\u0650\u060c \u0641\u064e\u0625\u0650\u0646\u064e\u0651\u0643\u064e \u062a\u064e\u0642\u0652\u062f\u0650\u0631\u064f \u0648\u064e\u0644\u064e\u0627 \u0623\u064e\u0642\u0652\u062f\u0650\u0631\u064f\u060c \u0648\u064e\u062a\u064e\u0639\u0652\u0644\u064e\u0645\u064f \u0648\u064e\u0644\u064e\u0627 \u0623\u064e\u0639\u0652\u0644\u064e\u0645\u064f",
    transliteration:
      "All\u0101humma inn\u012b astakh\u012bruka bi\u02bfilmik, wa astaqdiruka biqudratik, wa as\u02bfaluka min fa\u1e0dlika\u02bbl-\u02bfa\u1e93\u012bm. Fa-innaka taqdiru wa l\u0101 aqdir, wa ta\u02bflamu wa l\u0101 a\u02bflam",
    translation:
      "O Allah, I seek Your guidance by Your knowledge, I seek Your assistance by Your power, and I ask You from Your immense bounty. For You have power and I do not, and You know and I do not.",
    source: "\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 1162",
  },

  {
    id: "dua-ease",
    title: "Du\u02bf\u0101 for Ease",
    stage: "General",
    arabic:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0644\u064e\u0627 \u0633\u064e\u0647\u0652\u0644\u064e \u0625\u0650\u0644\u064e\u0651\u0627 \u0645\u064e\u0627 \u062c\u064e\u0639\u064e\u0644\u0652\u062a\u064e\u0647\u064f \u0633\u064e\u0647\u0652\u0644\u0627\u064b\u060c \u0648\u064e\u0623\u064e\u0646\u0652\u062a\u064e \u062a\u064e\u062c\u0652\u0639\u064e\u0644\u064f \u0627\u0644\u0652\u062d\u064e\u0632\u0652\u0646\u064e \u0625\u0650\u0630\u064e\u0627 \u0634\u0650\u0626\u0652\u062a\u064e \u0633\u064e\u0647\u0652\u0644\u0627\u064b",
    transliteration:
      "All\u0101humma l\u0101 sahla ill\u0101 m\u0101 ja\u02bfaltahu sahlan, wa anta taj\u02bfalu\u02bbl-\u1e25azna idh\u0101 shi\u02bfta sahlan",
    translation:
      "O Allah, nothing is easy except what You make easy, and You can make hardship easy if You will.",
    source: "Ibn \u1e24ibb\u0101n",
  },

  {
    id: "dua-tawbah",
    title: "Du\u02bf\u0101 of Repentance",
    stage: "General",
    arabic:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u0646\u0650\u0651\u064a \u0638\u064e\u0644\u064e\u0645\u0652\u062a\u064f \u0646\u064e\u0641\u0652\u0633\u0650\u064a \u0638\u064f\u0644\u0652\u0645\u064b\u0627 \u0643\u064e\u062b\u0650\u064a\u0631\u064b\u0627\u060c \u0648\u064e\u0644\u064e\u0627 \u064a\u064e\u063a\u0652\u0641\u0650\u0631\u064f \u0627\u0644\u0630\u064f\u0651\u0646\u064f\u0648\u0628\u064e \u0625\u0650\u0644\u064e\u0651\u0627 \u0623\u064e\u0646\u0652\u062a\u064e\u060c \u0641\u064e\u0627\u0652\u063a\u0652\u0641\u0650\u0631\u0652 \u0644\u0650\u064a \u0645\u064e\u063a\u0652\u0641\u0650\u0631\u064e\u0629\u064b \u0645\u0650\u0646\u0652 \u0639\u0650\u0646\u0652\u062f\u0650\u0643\u064e \u0648\u064e\u0627\u0631\u0652\u062d\u064e\u0645\u0652\u0646\u0650\u064a\u060c \u0625\u0650\u0646\u064e\u0651\u0643\u064e \u0623\u064e\u0646\u0652\u062a\u064e \u0627\u0644\u0652\u063a\u064e\u0641\u064f\u0648\u0631\u064f \u0627\u0644\u0631\u064e\u0651\u062d\u0650\u064a\u0645\u064f",
    transliteration:
      "All\u0101humma inn\u012b \u1e93alamtu nafs\u012b \u1e93ulman kath\u012br\u0101, wa l\u0101 yaghfiru\u02bdh-dhun\u016bba ill\u0101 ant, fagh\u0302fir l\u012b maghfiratan min \u02bfindika war\u1e25amn\u012b, innaka anta\u02bbl-ghaf\u016bru\u02bbr-ra\u1e25\u012bm",
    translation:
      "O Allah, I have greatly wronged myself, and no one forgives sins except You. So grant me forgiveness from You and have mercy on me. Indeed You are the Forgiving, the Merciful.",
    source: "\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 834",
  },

  {
    id: "dua-gratitude",
    title: "Du\u02bf\u0101 of Gratitude",
    stage: "General",
    arabic:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0623\u064e\u0639\u0650\u0646\u0650\u0651\u064a \u0639\u064e\u0644\u064e\u0649 \u0630\u0650\u0643\u0652\u0631\u0650\u0643\u064e \u0648\u064e\u0634\u064f\u0643\u0652\u0631\u0650\u0643\u064e \u0648\u064e\u062d\u064f\u0633\u0652\u0646\u0650 \u0639\u0650\u0628\u064e\u0627\u062f\u064e\u062a\u0650\u0643\u064e",
    transliteration:
      "All\u0101humma a\u02bfinn\u012b \u02bfal\u0101 dhikrika wa shukrika wa \u1e25usni \u02bfib\u0101datik",
    translation:
      "O Allah, help me to remember You, to thank You, and to worship You well.",
    source: "Sunan Ab\u012b D\u0101w\u016bd \u00b7 1522",
  },

  {
    id: "dua-ummah",
    title: "Du\u02bf\u0101 for the Ummah",
    stage: "General",
    arabic:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0623\u0635\u0652\u0644\u0650\u062d\u0652 \u0623\u064f\u0645\u064e\u0651\u0629\u064e \u0645\u064f\u062d\u064e\u0645\u064e\u0651\u062f\u064d \u0635\u064e\u0644\u0649 \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0639\u064e\u0644\u064e\u064a\u0652\u0647\u0650 \u0648\u064e\u0633\u064e\u0644\u064e\u0651\u0645\u064e\u060c \u0648\u064e\u0627\u062c\u0652\u0639\u064e\u0644\u0652 \u062f\u064f\u0639\u064e\u0627\u0621\u064e\u0646\u064e\u0627 \u0645\u064e\u0642\u0652\u0628\u064f\u0648\u0644\u0627\u064b",
    transliteration:
      "All\u0101humma a\u1e63li\u1e25 ummata Mu\u1e25ammadin \u1e63alla-ll\u0101hu \u02bfalayhi wa sallam, waj\u02bfal du\u02bfa\u02bfan\u0101 maqb\u016bl\u0101",
    translation:
      "O Allah, reform the nation of Muhammad, peace and blessings be upon him, and make our supplications accepted.",
    source: "Scholarly tradition",
  },

  {
    id: "sayyid-istighfar",
    title: "Sayyid al-Istighf\u0101r",
    stage: "General",
    arabic:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0623\u064e\u0646\u0652\u062a\u064e \u0631\u064e\u0628\u0650\u0651\u064a \u0644\u064e\u0627 \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u064e\u0651\u0627 \u0623\u064e\u0646\u0652\u062a\u064e\u060c \u062e\u064e\u0644\u064e\u0642\u0652\u062a\u064e\u0646\u0650\u064a \u0648\u064e\u0623\u064e\u0646\u064e\u0627 \u0639\u064e\u0628\u0652\u062f\u064f\u0643\u064e\u060c \u0648\u064e\u0623\u064e\u0646\u064e\u0627 \u0639\u064e\u0644\u064e\u0649 \u0639\u064e\u0647\u0652\u062f\u0650\u0643\u064e \u0648\u064e\u0648\u064e\u0639\u0652\u062f\u0650\u0643\u064e \u0645\u064e\u0627 \u0627\u0633\u0652\u062a\u064e\u0637\u064e\u0639\u0652\u062a\u064f\u060c \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u0652 \u0634\u064e\u0631\u0650\u0651 \u0645\u064e\u0627 \u0635\u064e\u0646\u064e\u0639\u0652\u062a\u064f\u060c \u0623\u064e\u0628\u064f\u0648\u0621\u064f \u0644\u064e\u0643\u064e \u0628\u0650\u0646\u0650\u0639\u0652\u0645\u064e\u062a\u0650\u0643\u064e \u0639\u064e\u0644\u064e\u064a\u0652\u060c \u0648\u064e\u0623\u064e\u0628\u064f\u0648\u0621\u064f \u0628\u0650\u0630\u064e\u0646\u0652\u0628\u0650\u064a \u0641\u064e\u0627\u0652\u063a\u0652\u0641\u0650\u0631\u0652 \u0644\u0650\u064a\u060c \u0641\u064e\u0625\u0650\u0646\u064e\u0651\u0647\u064f \u0644\u064e\u0627 \u064a\u064e\u063a\u0652\u0641\u0650\u0631\u064f \u0627\u0644\u0630\u064f\u0651\u0646\u064f\u0648\u0628\u064e \u0625\u0650\u0644\u064e\u0651\u0627 \u0623\u064e\u0646\u0652\u062a\u064e",
    transliteration:
      "All\u0101humma anta rabb\u012b l\u0101 il\u0101ha ill\u0101 ant, khalaqtan\u012b wa an\u0101 \u02bfabduk, wa an\u0101 \u02bfal\u0101 \u02bfahdika wa wa\u02bfdika mast\u0101\u1e6fa\u02bft. A\u02bfa\u016bdhu bika min sharri m\u0101 \u1e63ana\u02bft. Ab\u016b\u02bfu laka bini\u02bfmatika \u02bfalayya, wa ab\u016b\u02bfu bidhanb\u012b fagh\u0302fir l\u012b, fa\u02bfinnahu l\u0101 yaghfiru\u02bdh-dhun\u016bba ill\u0101 ant",
    translation:
      "O Allah, You are my Lord. There is no god but You. You created me and I am Your servant. I am upon Your covenant and Your promise to the best of my ability. I seek refuge with You from the evil of what I have done. I acknowledge Your blessings upon me and I acknowledge my sin, so forgive me, for none forgives sins except You.",
    source: "\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 6306",
    isFeatured: true,
  },

  {
    id: "dua-travel",
    title: "Du\u02bf\u0101 for Travel",
    stage: "General",
    arabic:
      "\u0633\u064f\u0628\u0652\u062d\u064e\u0627\u0646\u064e \u0627\u0644\u0651\u064e\u0630\u0650\u064a \u0633\u064e\u062e\u064e\u0651\u0631\u064e \u0644\u064e\u0646\u064e\u0627 \u0647\u064e\u0630\u064e\u0627 \u0648\u064e\u0645\u064e\u0627 \u0643\u064f\u0646\u064e\u0651\u0627 \u0644\u064e\u0647\u064f \u0645\u064f\u0642\u0652\u0631\u0650\u0646\u0650\u064a\u0646\u064e\u060c \u0648\u064e\u0625\u0650\u0646\u064e\u0651\u0627 \u0625\u0650\u0644\u064e\u0649 \u0631\u064e\u0628\u0650\u0651\u0646\u064e\u0627 \u0644\u064e\u0645\u064f\u0646\u0652\u0642\u064e\u0644\u0650\u0628\u064f\u0648\u0646\u064e",
    transliteration:
      "Sub\u1e25\u0101na-lladh\u012b sakhkhara lan\u0101 h\u0101dh\u0101 wa m\u0101 kunn\u0101 lahu muqrin\u012bna, wa inn\u0101 il\u0101 rabbin\u0101 lamunqalib\u016bn",
    translation:
      "Glory be to Him Who has subjected this to us, for we could never have done it ourselves. And to our Lord we shall certainly return.",
    source: "Al-Zukhruf 43:13\u201314",
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

/**
 * getDuasByStage — used by PrintOfflineScreen, DuaListScreen, FocusScreen
 * Stage names must match the `stage` field exactly (case-sensitive).
 */
export function getDuasByStage(stage) {
  return DUAS.filter((d) => d.stage === stage);
}

/**
 * getFeaturedDuas — used by HomeScreen daily dua card
 */
export function getFeaturedDuas() {
  return DUAS.filter((d) => d.isFeatured === true);
}

/**
 * getDuaById — used by DuaDetailScreen
 */
export function getDuaById(id) {
  return DUAS.find((d) => d.id === id) || null;
}

/**
 * STAGES — canonical list for DuaListScreen filter tabs
 * Order matches the pilgrimage sequence.
 */
export const STAGES = [
  "Ihram",
  "Entry",
  "Tawaf",
  "Zamzam",
  "Sa\u02bfy",
  "Arafah",
  "Muzdalifah",
  "Jamarat",
  "Farewell",
  "Madinah",
  "General",
];
