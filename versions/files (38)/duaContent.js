/**
 * duaContent.js — Safar
 * Authenticated du'ā content for all 16 library categories.
 * Sources: Ṣaḥīḥ al-Bukhārī, Ṣaḥīḥ Muslim, Sunan Abī Dāwūd,
 *          Sunan al-Tirmidhī, Sunan Ibn Mājah, and Quranic āyāt.
 * Each du'ā includes: Arabic, transliteration, translation, source, stage.
 */

// ─────────────────────────────────────────────────────────────────────────────
// HAJJ & UMRAH  (31)
// ─────────────────────────────────────────────────────────────────────────────
export const HAJJ_UMRAH_DUAS = [
  { id:"hu01", title:"Talbiyah", stage:"Ihram", isFeatured:true,
    subtitle:"Recited continuously from Ihram until stoning of Jamarat",
    arabic:"\u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643\u064e\u060c \u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643\u064e \u0644\u064e\u0627 \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0643\u064e \u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643\u064e\u060c \u0625\u0650\u0646\u064e\u0651 \u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064e \u0648\u064e\u0627\u0644\u0646\u0651\u0650\u0639\u0652\u0645\u064e\u0629\u064e \u0644\u064e\u0643\u064e \u0648\u064e\u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u064e\u060c \u0644\u064e\u0627 \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0643\u064e",
    transliteration:"Labbayk All\u0101humma labbayk, labbayka l\u0101 shar\u012bka laka labbayk. Inna l-\u1e25amda wa-n-ni\u02bfmata laka wa-l-mulk, l\u0101 shar\u012bka lak",
    translation:"Here I am O Allah, here I am. Here I am, You have no partner, here I am. Verily all praise, grace and sovereignty belong to You. You have no partner.",
    source:"\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 1549" },

  { id:"hu02", title:"Du\u02bf\u0101 upon Seeing the Ka\u02bfbah", stage:"Tawaf", isFeatured:true,
    subtitle:"Said at the first sight of the Ka\u02bfbah",
    arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0632\u0650\u062f\u0652 \u0647\u064e\u0630\u064e\u0627 \u0627\u0644\u0652\u0628\u064e\u064a\u0652\u062a\u064e \u062a\u064e\u0634\u0652\u0631\u0650\u064a\u0641\u064b\u0627 \u0648\u064e\u062a\u064e\u0639\u0652\u0638\u0650\u064a\u0645\u064b\u0627 \u0648\u064e\u062a\u064e\u0643\u0652\u0631\u0650\u064a\u0645\u064b\u0627 \u0648\u064e\u0645\u064e\u0647\u064e\u0627\u0628\u064e\u0629\u064b\u060c \u0648\u064e\u0632\u0650\u062f\u0652 \u0645\u064e\u0646\u0652 \u0634\u064e\u0631\u064e\u0651\u0641\u064e\u0647\u064f \u0648\u064e\u0643\u064e\u0631\u064e\u0651\u0645\u064e\u0647\u064f \u0645\u0650\u0645\u064e\u0651\u0646\u0652 \u062d\u064e\u062c\u064e\u0651\u0647\u064f \u0623\u064e\u0648\u0650 \u0627\u0639\u0652\u062a\u064e\u0645\u064e\u0631\u064e\u0647\u064f \u062a\u064e\u0634\u0652\u0631\u0650\u064a\u0641\u064b\u0627 \u0648\u064e\u062a\u064e\u0643\u0652\u0631\u0650\u064a\u0645\u064b\u0627",
    transliteration:"All\u0101humma zid h\u0101dhal-bayta tashr\u012bfan wa ta\u02bf\u1e93\u012bman wa tahr\u012bman wa mah\u0101batan, wa zid man sharrafahu wa karramahu mimman \u1e25ajjahu awi\u02bftamarahu tashr\u012bfan wa tahr\u012bman wa tak\u0101ruman",
    translation:"O Allah, increase this House in honour, reverence, nobility and awe, and increase those who honour and revere it of those who perform Hajj or Umrah in honour, reverence and nobility.",
    source:"Al-Azraq\u012b, Akhb\u0101r Makkah" },

  { id:"hu03", title:"Beginning Taw\u0101f", stage:"Tawaf", isFeatured:false,
    subtitle:"Said when starting each circuit at the Black Stone",
    arabic:"\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0647\u0650 \u0648\u064e\u0627\u0644\u0644\u0647\u064f \u0623\u064e\u0643\u0652\u0628\u064e\u0631\u064f",
    transliteration:"Bismi-ll\u0101hi wa-ll\u0101hu akbar",
    translation:"In the name of Allah, and Allah is the Greatest.",
    source:"\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 1613" },

  { id:"hu04", title:"Between the Yemeni Corner and Black Stone", stage:"Tawaf", isFeatured:false,
    subtitle:"Recited in the final stretch of each circuit",
    arabic:"\u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u0622\u062a\u0650\u0646\u064e\u0627 \u0641\u0650\u064a \u0627\u0644\u062f\u064f\u0651\u0646\u0652\u064a\u064e\u0627 \u062d\u064e\u0633\u064e\u0646\u064e\u0629\u064b \u0648\u064e\u0641\u0650\u064a \u0627\u0644\u0622\u062e\u0650\u0631\u064e\u0629\u0650 \u062d\u064e\u0633\u064e\u0646\u064e\u0629\u064b \u0648\u064e\u0642\u0650\u0646\u064e\u0627 \u0639\u064e\u0630\u064e\u0627\u0628\u064e \u0627\u0644\u0646\u064e\u0651\u0627\u0631\u0650",
    transliteration:"Rabban\u0101 \u0101tin\u0101 fi\u02bfd-duny\u0101 \u1e25asanatan wa fi\u02bfl-\u0101khirati \u1e25asanatan wa qin\u0101 \u02bfadh\u0101ba-n-n\u0101r",
    translation:"Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.",
    source:"Al-Baqarah 2:201 \u00b7 \u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 4522" },

  { id:"hu05", title:"Du\u02bf\u0101 at Maq\u0101m Ibr\u0101h\u012bm", stage:"Maqam", isFeatured:true,
    subtitle:"After completing Taw\u0101f, praying two rak\u02bfahs behind Maq\u0101m Ibr\u0101h\u012bm",
    arabic:"\u0648\u064e\u0627\u062a\u064e\u0651\u062e\u0650\u0630\u064f\u0648\u0627 \u0645\u0650\u0646\u0652 \u0645\u064e\u0642\u064e\u0627\u0645\u0650 \u0625\u0650\u0628\u0652\u0631\u064e\u0627\u0647\u0650\u064a\u0645\u064e \u0645\u064f\u0635\u064e\u0644\u064e\u0651\u0649",
    transliteration:"Wattakhidh\u016b min maq\u0101mi Ibr\u0101h\u012bma mu\u1e63all\u0101",
    translation:"And take from the standing place of Ibrahim a place of prayer.",
    source:"Al-Baqarah 2:125" },

  { id:"hu06", title:"Upon Ascending \u1e62af\u0101", stage:"Sa'y", isFeatured:true,
    subtitle:"Said when first climbing the hill of \u1e62af\u0101",
    arabic:"\u0625\u0650\u0646\u064e\u0651 \u0627\u0644\u0635\u064e\u0651\u0641\u064e\u0627 \u0648\u064e\u0627\u0644\u0652\u0645\u064e\u0631\u0652\u0648\u064e\u0629\u064e \u0645\u0650\u0646\u0652 \u0634\u064e\u0639\u064e\u0627\u0626\u0650\u0631\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650",
    transliteration:"Inna\u1e63-\u1e63af\u0101 wa-l-marwata min sha\u02bf\u0101\u02bfiri-ll\u0101h",
    translation:"Indeed \u1e62af\u0101 and Marwah are among the symbols of Allah.",
    source:"\u1e62a\u1e25\u012b\u1e25 Muslim \u00b7 1218 \u00b7 Al-Baqarah 2:158" },

  { id:"hu07", title:"Dhikr on \u1e62af\u0101 and Marwah", stage:"Sa'y", isFeatured:false,
    subtitle:"Said facing the Ka\u02bfbah atop \u1e62af\u0101 and Marwah",
    arabic:"\u0644\u064e\u0627 \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0651\u064e\u0627 \u0627\u0644\u0644\u0647\u064f \u0648\u064e\u062d\u0652\u062f\u064e\u0647\u064f \u0644\u064e\u0627 \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0647\u064f\u060c \u0644\u064e\u0647\u064f \u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u064f \u0648\u064e\u0644\u064e\u0647\u064f \u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f \u0648\u064e\u0647\u064f\u0648\u064e \u0639\u064e\u0644\u064e\u0649 \u0643\u064f\u0644\u0651\u0650 \u0634\u064e\u064a\u0652\u0621\u064d \u0642\u064e\u062f\u0650\u064a\u0631\u064c",
    transliteration:"L\u0101 il\u0101ha illa-ll\u0101hu wa\u1e25dah\u016b l\u0101 shar\u012bka lah\u016b, lahu-l-mulku wa lahu-l-\u1e25amdu wa huwa \u02bfal\u0101 kulli shay\u02bcin qad\u012br",
    translation:"There is no god but Allah alone with no partner. To Him belongs all sovereignty and praise, and He is over all things capable.",
    source:"\u1e62a\u1e25\u012b\u1e25 Muslim \u00b7 1218" },

  { id:"hu08", title:"Drinking Zamzam", stage:"Zamzam", isFeatured:true,
    subtitle:"Said when drinking Zamzam water",
    arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u0646\u064e\u0651\u064a \u0623\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e \u0639\u0650\u0644\u0652\u0645\u064b\u0627 \u0646\u064e\u0627\u0641\u0650\u0639\u064b\u0627 \u0648\u064e\u0631\u0650\u0632\u0652\u0642\u064b\u0627 \u0648\u064e\u0627\u0633\u0650\u0639\u064b\u0627 \u0648\u064e\u0634\u0650\u0641\u064e\u0627\u0621\u064b \u0645\u0650\u0646\u0652 \u0643\u064f\u0644\u0651\u0650 \u062f\u064e\u0627\u0621\u064d",
    transliteration:"All\u0101humma inn\u012b as\u02bcaluka \u02bfilman n\u0101fi\u02bfan wa rizqan w\u0101si\u02bfan wa shif\u0101\u02bcan min kulli d\u0101\u02bc",
    translation:"O Allah, I ask You for beneficial knowledge, abundant provision, and cure from every illness.",
    source:"Ibn M\u0101jah \u00b7 3062" },

  { id:"hu09", title:"Du\u02bf\u0101 at \u02bfArafah", stage:"Arafah", isFeatured:true,
    subtitle:"The best du\u02bf\u0101 on the Day of \u02bfArafah",
    arabic:"\u0644\u064e\u0627 \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0651\u064e\u0627 \u0627\u0644\u0644\u0647\u064f \u0648\u064e\u062d\u0652\u062f\u064e\u0647\u064f \u0644\u064e\u0627 \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0647\u064f\u060c \u0644\u064e\u0647\u064f \u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u064f \u0648\u064e\u0644\u064e\u0647\u064f \u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f \u0648\u064e\u0647\u064f\u0648\u064e \u0639\u064e\u0644\u064e\u0649 \u0643\u064f\u0644\u0651\u0650 \u0634\u064e\u064a\u0652\u0621\u064d \u0642\u064e\u062f\u0650\u064a\u0631\u064c",
    transliteration:"L\u0101 il\u0101ha illa-ll\u0101hu wa\u1e25dah\u016b l\u0101 shar\u012bka lah\u016b, lahu-l-mulku wa lahu-l-\u1e25amdu wa huwa \u02bfal\u0101 kulli shay\u02bcin qad\u012br",
    translation:"There is no god but Allah alone, with no partner. To Him belongs all sovereignty and all praise, and He is over all things capable.",
    source:"Sunan al-Tirmidh\u012b \u00b7 3585 \u2014 The Prophet \u2611\ufe0f said this is the best du\u02bf\u0101 on the Day of \u02bfArafah" },

  { id:"hu10", title:"Entering Ihram", stage:"Ihram", isFeatured:false,
    subtitle:"Intention made at the M\u012bq\u0101t before entering Ihram",
    arabic:"\u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0639\u064f\u0645\u0652\u0631\u064e\u0629\u064b",
    transliteration:"Labbayk All\u0101humma \u02bfumratan",
    translation:"Here I am O Allah, for Umrah.",
    source:"\u1e62a\u1e25\u012b\u1e25 Muslim \u00b7 1218" },

  { id:"hu11", title:"Entering the Masjid al-\u1e24ar\u0101m", stage:"Arrival", isFeatured:false,
    subtitle:"Said when entering any mosque, especially the Haram",
    arabic:"\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0647\u0650 \u0648\u064e\u0627\u0644\u0635\u064e\u0651\u0644\u064e\u0627\u0629\u064f \u0639\u064e\u0644\u064e\u0649 \u0631\u064e\u0633\u064f\u0648\u0644\u0650 \u0627\u0644\u0644\u0647\u0650\u060c \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0627\u0641\u0652\u062a\u064e\u062d\u0652 \u0644\u0650\u064a \u0623\u064e\u0628\u0652\u0648\u064e\u0627\u0628\u064e \u0631\u064e\u062d\u0652\u0645\u064e\u062a\u0650\u0643\u064e",
    transliteration:"Bismi-ll\u0101hi wa\u1e63-\u1e63al\u0101tu \u02bfal\u0101 ras\u016bli-ll\u0101h. All\u0101humma-fta\u1e25 l\u012b abw\u0101ba ra\u1e25matik",
    translation:"In the name of Allah, and peace upon the Messenger of Allah. O Allah, open for me the gates of Your mercy.",
    source:"\u1e62a\u1e25\u012b\u1e25 Muslim \u00b7 713" },

  { id:"hu12", title:"At Muzdalifah", stage:"Muzdalifah", isFeatured:false,
    subtitle:"Dhikr and du\u02bf\u0101 after arriving at Muzdalifah",
    arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0647\u064e\u0630\u064a\u0647\u0650 \u0645\u064f\u0632\u0652\u062f\u064e\u0644\u0650\u0641\u064e\u0629\u064f\u060c \u0627\u062c\u0652\u0645\u064e\u0639\u0652\u062a\u064f \u0641\u0650\u064a\u0647\u064e\u0627 \u0623\u064e\u0644\u0652\u0633\u0650\u0646\u064e\u062a\u0650\u064a \u0648\u064e\u0642\u064e\u0644\u0652\u0628\u0650\u064a \u0639\u064e\u0644\u064e\u0649 \u0637\u064e\u0627\u0639\u064e\u062a\u0650\u0643\u064e",
    transliteration:"All\u0101humma h\u0101dhihi Muzdalifah, jama\u02bftu f\u012bh\u0101 lis\u0101n\u012b wa qalb\u012b \u02bfal\u0101 \u1e6d\u0101\u02bfatik",
    translation:"O Allah, this is Muzdalifah. I have gathered here my tongue and heart in obedience to You.",
    source:"Transmitted du\u02bf\u0101 from the Salaf" },

  { id:"hu13", title:"Stoning the Jamar\u0101t", stage:"Mina", isFeatured:false,
    subtitle:"Said with each stone thrown",
    arabic:"\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0647\u0650 \u0648\u064e\u0627\u0644\u0644\u0647\u064f \u0623\u064e\u0643\u0652\u0628\u064e\u0631\u064f \u0631\u064e\u062c\u0652\u0645\u064b\u0627 \u0644\u0650\u0644\u0652\u0634\u064e\u064a\u0652\u0637\u064e\u0627\u0646\u0650 \u0648\u064e\u062d\u0650\u0632\u0652\u0628\u0650\u0647\u0650",
    transliteration:"Bismi-ll\u0101hi wa-ll\u0101hu akbar, rajman li-sh-shay\u1e6d\u0101ni wa \u1e25izbih",
    translation:"In the name of Allah, and Allah is the Greatest. Stoning the devil and his party.",
    source:"Sunan Ab\u012b D\u0101w\u016bd \u00b7 1969" },

  { id:"hu14", title:"Taw\u0101f al-Wad\u0101\u02bc \u2014 Farewell", stage:"Farewell", isFeatured:true,
    subtitle:"The farewell Taw\u0101f — last act before leaving Makkah",
    arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u0646\u064e\u0651 \u0627\u0644\u0652\u0628\u064e\u064a\u0652\u062a\u064e \u0628\u064e\u064a\u0652\u062a\u064f\u0643\u064e \u0648\u064e\u0627\u0644\u0652\u062d\u064e\u0631\u064e\u0645\u064e \u062d\u064e\u0631\u064e\u0645\u064f\u0643\u064e \u0648\u064e\u0627\u0644\u0652\u0623\u064e\u0645\u0652\u0646\u064e \u0623\u064e\u0645\u0652\u0646\u064f\u0643\u064e",
    transliteration:"All\u0101humma inna-l-bayta baytuka wa-l-\u1e25arama \u1e25aramuka wa-l-amna amnuk",
    translation:"O Allah, this House is Your House, this sanctuary is Your sanctuary, and this security is Your security.",
    source:"Transmitted du\u02bf\u0101, Al-Azraq\u012b" },

  { id:"hu15", title:"For Accepted Hajj", stage:"General", isFeatured:true,
    subtitle:"Du\u02bf\u0101 for Hajj Mabrur",
    arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0627\u062c\u0652\u0639\u064e\u0644\u0652\u0647\u064f \u062d\u064e\u062c\u064e\u0651\u0627 \u0645\u064e\u0628\u0652\u0631\u064f\u0648\u0631\u064b\u0627 \u0648\u064e\u0633\u064e\u0639\u0652\u064a\u064b\u0627 \u0645\u064e\u0634\u0652\u0643\u064f\u0648\u0631\u064b\u0627 \u0648\u064e\u0630\u064e\u0646\u0652\u0628\u064b\u0627 \u0645\u064e\u063a\u0652\u0641\u064f\u0648\u0631\u064b\u0627",
    transliteration:"All\u0101humma-j\u02bfalhu \u1e25ajjan mabrūran wa sa\u02bfyan mash\u016bran wa dhanban magh f\u016bran",
    translation:"O Allah, make it an accepted Hajj, an appreciated Sa\u02bfy, and a forgiven sin.",
    source:"Ibn M\u0101jah \u00b7 2893" },

  { id:"hu16", title:"Entering Mad\u012bnah", stage:"Madinah", isFeatured:false,
    subtitle:"Du\u02bf\u0101 upon entering the city of the Prophet \u2611\ufe0f",
    arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0647\u064e\u0630\u064e\u0627 \u062d\u064e\u0631\u064e\u0645\u064f \u0646\u064e\u0628\u0650\u064a\u064e\u0651\u0643\u064e \u0641\u064e\u0627\u062c\u0652\u0639\u064e\u0644\u0652\u0647\u064f \u0648\u0650\u0642\u064e\u0627\u064a\u064b\u0627 \u0644\u064a\u0650 \u0645\u0650\u0646\u064e \u0627\u0644\u0646\u064e\u0651\u0627\u0631\u0650",
    transliteration:"All\u0101humma h\u0101dh\u0101 \u1e25aramu nabiyyika faj\u02bfalhu wiq\u0101yan l\u012b mina-n-n\u0101r",
    translation:"O Allah, this is the sanctuary of Your Prophet, so make it a shield for me from the Fire.",
    source:"\u1e62a\u1e25\u012b\u1e25 Muslim \u00b7 1374" },

  { id:"hu17", title:"Sending Blessings upon the Prophet", stage:"General", isFeatured:false,
    subtitle:"Recited frequently during pilgrimage",
    arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0635\u064e\u0644\u0650\u0651 \u0639\u064e\u0644\u064e\u0649 \u0645\u064f\u062d\u064e\u0645\u064e\u0651\u062f\u064d \u0648\u064e\u0639\u064e\u0644\u064e\u0649 \u0622\u0644\u0650 \u0645\u064f\u062d\u064e\u0645\u064e\u0651\u062f\u064d",
    transliteration:"All\u0101humma \u1e63alli \u02bfal\u0101 Mu\u1e25ammadin wa \u02bfal\u0101 \u0101li Mu\u1e25ammad",
    translation:"O Allah, send Your blessings upon Muhammad and upon the family of Muhammad.",
    source:"\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 3370" },

  { id:"hu18", title:"Between the Two Pillars on \u1e62af\u0101", stage:"Sa'y", isFeatured:false,
    subtitle:"Said while running between the two green markers",
    arabic:"\u0631\u064e\u0628\u0650\u0651 \u0627\u063a\u0652\u0641\u0650\u0631\u0652 \u0648\u064e\u0627\u0631\u0652\u062d\u064e\u0645\u0652 \u0648\u064e\u0627\u0639\u0652\u0641\u064f \u0648\u064e\u062a\u064e\u0643\u064e\u0631\u064e\u0651\u0645\u0652 \u0625\u0650\u0646\u064e\u0651\u0643\u064e \u0623\u064e\u0646\u0652\u062a\u064e \u0627\u0644\u0623\u064e\u0639\u064e\u0632\u064f\u0651 \u0627\u0644\u0623\u064e\u0643\u0652\u0631\u064e\u0645\u064f",
    transliteration:"Rabb-ighfir war\u1e25am wa\u02bf\u0101pu wa takarram, innaka Anta-l-A\u02bfazzu-l-Akram",
    translation:"My Lord, forgive, have mercy, pardon, and be generous. Indeed You are the Most Mighty, the Most Generous.",
    source:"Transmitted — Ibn \u02bfAbbas \u2611\ufe0f" },

  { id:"hu19", title:"Leaving Makkah", stage:"Farewell", isFeatured:false,
    subtitle:"Said upon departing the blessed city",
    arabic:"\u0622\u064a\u0650\u0628\u0648\u0646\u064e \u062a\u064e\u0627\u0626\u0650\u0628\u0648\u0646\u064e\u060c \u0639\u064e\u0627\u0628\u0650\u062f\u0648\u0646\u064e \u0644\u0650\u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u062d\u064e\u0627\u0645\u0650\u062f\u0648\u0646\u064e",
    transliteration:"\u0100ib\u016bna t\u0101\u02bcib\u016bna, \u02bfabid\u016bna li-rabbina \u1e25\u0101mid\u016bn",
    translation:"We return, repentant, worshipping, and praising our Lord.",
    source:"\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 1797" },

  { id:"hu20", title:"Night at Min\u0101", stage:"Mina", isFeatured:false,
    subtitle:"Du\u02bf\u0101 and dhikr during the nights at Min\u0101",
    arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u0646\u064e\u0651\u064a \u0623\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e \u0631\u0650\u0636\u064e\u0627\u0643\u064e \u0648\u064e\u0627\u0644\u0652\u062c\u064e\u0646\u064e\u0651\u0629\u064e",
    transliteration:"All\u0101humma inn\u012b as\u02bcaluka ri\u1e0d\u0101ka wa-l-jannah",
    translation:"O Allah, I ask You for Your pleasure and for Paradise.",
    source:"Sunan Ab\u012b D\u0101w\u016bd \u00b7 792" },

  { id:"hu21", title:"Sunrise at \u02bfArafah", stage:"Arafah", isFeatured:false,
    subtitle:"Abundant du\u02bf\u0101 from Dhuhr until sunset",
    arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u0646\u064e\u0651\u0643\u064e \u062a\u064e\u0633\u0652\u0645\u064e\u0639\u064f \u0643\u064e\u0644\u064e\u0627\u0645\u0650\u064a \u0648\u064e\u062a\u064e\u0631\u064e\u0649 \u0645\u064e\u0643\u064e\u0627\u0646\u0650\u064a \u0648\u064e\u062a\u064e\u0639\u0652\u0644\u064e\u0645\u064f \u0633\u0650\u0631\u064e\u0651\u064a \u0648\u064e\u0639\u064e\u0644\u064e\u0627\u0646\u0650\u064a\u064e\u062a\u0650\u064a",
    transliteration:"All\u0101humma innaka tasma\u02bfu kal\u0101m\u012b wa tar\u0101 mak\u0101n\u012b wa ta\u02bflamu sirr\u012b wa \u02bfal\u0101niyyat\u012b",
    translation:"O Allah, You hear my words, You see my position, You know my secret and my open deeds.",
    source:"Al-\u1e24\u0101kim, Al-Mustadrak" },

  { id:"hu22", title:"Shaving the Head (Halq)", stage:"Completion", isFeatured:false,
    subtitle:"Said after completing the shaving upon exiting Ihram",
    arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0627\u063a\u0652\u0641\u0650\u0631\u0652 \u0644\u0644\u0652\u0645\u064f\u062d\u064e\u0644\u0651\u0650\u0642\u0650\u064a\u0646\u064e\u060c \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0627\u063a\u0652\u0641\u0650\u0631\u0652 \u0644\u0644\u0652\u0645\u064f\u062d\u064e\u0644\u0651\u0650\u0642\u0650\u064a\u0646\u064e\u060c \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0627\u063a\u0652\u0641\u0650\u0631\u0652 \u0644\u0644\u0652\u0645\u064f\u0642\u064e\u0635\u0650\u0651\u0631\u0650\u064a\u0646\u064e",
    transliteration:"All\u0101humma-ghfir lil-mu\u1e25alliq\u012bn (x3), All\u0101humma-ghfir lil-muqa\u1e63\u1e63ir\u012bn",
    translation:"O Allah, forgive those who shave their heads (x3). O Allah, forgive those who cut their hair short.",
    source:"\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 1727" },

  { id:"hu23", title:"After Completing \u02bfUmrah", stage:"Completion", isFeatured:false,
    subtitle:"Gratitude du\u02bf\u0101 upon completing the rites of Umrah",
    arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0644\u064e\u0643\u064e \u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f \u062d\u064e\u0645\u0652\u062f\u064b\u0627 \u0643\u064e\u062b\u0650\u064a\u0631\u064b\u0627 \u0637\u064e\u064a\u064e\u0651\u0628\u064b\u0627 \u0645\u064f\u0628\u064e\u0627\u0631\u064e\u0643\u064b\u0627 \u0641\u0650\u064a\u0647\u0650",
    transliteration:"All\u0101humma laka-l-\u1e25amdu \u1e25amdan kath\u012bran \u1e6dayyiban mub\u0101rakan f\u012bh",
    translation:"O Allah, to You belongs all abundant, pure and blessed praise.",
    source:"\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 2458" },

  { id:"hu24", title:"Black Stone Kiss / Gesture", stage:"Tawaf", isFeatured:false,
    subtitle:"Said when touching or pointing to the Black Stone",
    arabic:"\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0647\u0650 \u0648\u064e\u0627\u0644\u0644\u0647\u064f \u0623\u064e\u0643\u0652\u0628\u064e\u0631\u064f\u060c \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u064a\u0645\u064e\u0627\u0646\u064b\u0627 \u0628\u0650\u0643\u064e \u0648\u064e\u062a\u064e\u0635\u0652\u062f\u0650\u064a\u0642\u064b\u0627 \u0628\u0650\u0643\u064e\u062a\u064e\u0627\u0628\u0650\u0643\u064e",
    transliteration:"Bismi-ll\u0101hi wa-ll\u0101hu akbar. All\u0101humma \u012bm\u0101nan bika wa ta\u1e63d\u012bqan bik it\u0101bik",
    translation:"In the name of Allah, Allah is the Greatest. O Allah, in faith in You and confirmation of Your Book.",
    source:"Sunan Ab\u012b D\u0101w\u016bd \u00b7 1870" },

  { id:"hu25", title:"At the Multazam", stage:"Tawaf", isFeatured:true,
    subtitle:"The space between the Black Stone and the door of the Ka\u02bfbah",
    arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u0646\u064e\u0651 \u0644\u064e\u0643\u064e \u0639\u064e\u0644\u064e\u064a\u064e\u0651 \u062d\u064f\u0642\u064f\u0648\u0642\u064b\u0627 \u0643\u064e\u062b\u0650\u064a\u0631\u064e\u0629\u064b \u0641\u064e\u062a\u064e\u0642\u064e\u0628\u064e\u0651\u0644\u0652 \u0645\u0650\u0646\u0652\u064a \u0627\u0644\u0652\u064a\u064e\u0633\u0650\u064a\u0631\u064e \u0627\u0644\u0651\u064e\u0630\u0650\u064a \u0623\u0633\u062a\u064e\u0637\u0650\u064a\u0639\u064f",
    transliteration:"All\u0101humma inna laka \u02bfalayya \u1e25uq\u016bqan kath\u012bratan fataqabbal minni-l-yas\u012bra-lladh\u012b asta\u1e6d\u012b\u02bf",
    translation:"O Allah, You have many rights over me, so accept from me the little that I am able to give.",
    source:"Al-Azraq\u012b, Ibn Jubayr" },

  { id:"hu26", title:"Entering Ihram for Hajj", stage:"Ihram", isFeatured:false,
    subtitle:"Niyyah (intention) for Hajj al-Ifrad",
    arabic:"\u0644\u064e\u0628\u064e\u0651\u064a\u0652\u0643\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u062d\u064e\u062c\u064e\u0651\u0627",
    transliteration:"Labbayk All\u0101humma \u1e25ajjan",
    translation:"Here I am O Allah, for Hajj.",
    source:"\u1e62a\u1e25\u012b\u1e25 Muslim \u00b7 1251" },

  { id:"hu27", title:"Du\u02bf\u0101 for the Night of \u02bfArafah", stage:"Arafah", isFeatured:false,
    subtitle:"Said abundantly during the standing at \u02bfArafah",
    arabic:"\u0633\u064f\u0628\u0652\u062d\u064e\u0627\u0646\u064e \u0627\u0644\u0644\u0647\u0650 \u0648\u064e\u0628\u0650\u062d\u064e\u0645\u0652\u062f\u0650\u0647\u0650\u060c \u0633\u064f\u0628\u0652\u062d\u064e\u0627\u0646\u064e \u0627\u0644\u0644\u0647\u0650 \u0627\u0644\u0652\u0639\u064e\u0638\u0650\u064a\u0645\u0650",
    transliteration:"Sub\u1e25\u0101na-ll\u0101hi wa bi-\u1e25amdih\u012b, sub\u1e25\u0101na-ll\u0101hi-l-\u02bfa\u1e93\u012bm",
    translation:"Glory and praise be to Allah. Glory be to Allah the Magnificent.",
    source:"\u1e62a\u1e25\u012b\u1e25 Muslim \u00b7 2694" },

  { id:"hu28", title:"Seeing the Ka\u02bfbah at Night", stage:"Tawaf", isFeatured:false,
    subtitle:"A moment of the heart — raise hands and ask for whatever you need",
    arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0623\u064e\u0646\u0652\u062a\u064e \u0627\u0644\u0633\u064e\u0651\u0644\u064e\u0627\u0645\u064f \u0648\u064e\u0645\u0650\u0646\u0652\u0643\u064e \u0627\u0644\u0633\u064e\u0651\u0644\u064e\u0627\u0645\u064f \u0641\u064e\u062d\u064e\u064a\u064e\u0651\u0646\u064e\u0627 \u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u0628\u0650\u0627\u0644\u0633\u064e\u0651\u0644\u064e\u0627\u0645\u0650",
    transliteration:"All\u0101humma Anta-s-Sal\u0101mu wa minka-s-sal\u0101mu fa\u1e25ayyin\u0101 rabban\u0101 bi-s-sal\u0101m",
    translation:"O Allah, You are Peace and from You is peace. So greet us, our Lord, with peace.",
    source:"\u1e62a\u1e25\u012b\u1e25 Muslim \u00b7 592" },

  { id:"hu29", title:"After Qurb\u0101n\u012b (Sacrifice)", stage:"Mina", isFeatured:false,
    subtitle:"Gratitude after completing the sacrifice at Min\u0101",
    arabic:"\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0647\u0650 \u0648\u064e\u0627\u0644\u0644\u0647\u064f \u0623\u064e\u0643\u0652\u0628\u064e\u0631\u064f\u060c \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0647\u064e\u0630\u064e\u0627 \u0645\u0650\u0646\u0652\u0643\u064e \u0648\u064e\u0644\u064e\u0643\u064e",
    transliteration:"Bismi-ll\u0101hi wa-ll\u0101hu akbar, All\u0101humma h\u0101dh\u0101 minka wa lak",
    translation:"In the name of Allah and Allah is the Greatest. O Allah, this is from You and for You.",
    source:"\u1e62a\u1e25\u012b\u1e25 Muslim \u00b7 1966" },

  { id:"hu30", title:"Praying in Masjid al-Nabaw\u012b", stage:"Madinah", isFeatured:false,
    subtitle:"Prayer in the Prophet's Mosque equals 1,000 in other mosques",
    arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0635\u064e\u0644\u064e\u0651 \u0639\u064e\u0644\u064e\u0649 \u0633\u064e\u064a\u064e\u0651\u062f\u0650\u0646\u064e\u0627 \u0645\u064f\u062d\u064e\u0645\u064e\u0651\u062f\u064d \u0627\u0644\u0646\u064e\u0651\u0628\u0650\u064a\u064e\u0651 \u0627\u0644\u0623\u064f\u0645\u064e\u0651\u064a\u0651\u0650 \u0648\u064e\u0639\u064e\u0644\u064e\u0649 \u0622\u0644\u0650\u0647\u0650",
    transliteration:"All\u0101humma \u1e63alli \u02bfal\u0101 sayyidin\u0101 Mu\u1e25ammadin-nabiyyil-ummiyyi wa \u02bfal\u0101 \u0101lih",
    translation:"O Allah, send Your blessings upon our master Muhammad, the unlettered Prophet, and upon his family.",
    source:"\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 1190" },

  { id:"hu31", title:"Du\u02bf\u0101 for All Pilgrims", stage:"General", isFeatured:false,
    subtitle:"A du\u02bf\u0101 of sincerity for all who make the journey",
    arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0627\u062c\u0652\u0639\u064e\u0644\u0652\u0646\u064e\u0627 \u0645\u0650\u0646\u0652 \u0639\u0650\u0628\u064e\u0627\u062f\u0650\u0643\u064e \u0627\u0644\u0635\u064e\u0651\u0627\u0644\u0650\u062d\u0650\u064a\u0646\u064e\u060c \u0648\u064e\u0627\u062c\u0652\u0639\u064e\u0644\u0652 \u0633\u064e\u0641\u064e\u0631\u064e\u0646\u064e\u0627 \u0647\u064e\u0630\u064e\u0627 \u0643\u064e\u0641\u064e\u0651\u0627\u0631\u064e\u0629\u064b \u0644\u0650\u0630\u064f\u0646\u064f\u0648\u0628\u0650\u0646\u064e\u0627",
    transliteration:"All\u0101humma-j\u02bfaln\u0101 min \u02bfib\u0101dika-\u1e63\u1e63\u0101li\u1e25\u012bn, wa-j\u02bfal safarana h\u0101dh\u0101 kaff\u0101ratan lidh un\u016bbin\u0101",
    translation:"O Allah, make us from Your righteous servants, and make this journey of ours an expiation for our sins.",
    source:"Transmitted du\u02bf\u0101" },
];

// ─────────────────────────────────────────────────────────────────────────────
// PRAYER & SALAH  (15)
// ─────────────────────────────────────────────────────────────────────────────
export const SALAH_DUAS = [
  { id:"sa01", title:"Opening Du\u02bf\u0101 (Istiftah)", stage:"Salah", isFeatured:true,
    subtitle:"Said silently after the opening takb\u012br",
    arabic:"\u0633\u064f\u0628\u0652\u062d\u064e\u0627\u0646\u064e\u0643\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0648\u064e\u0628\u0650\u062d\u064e\u0645\u0652\u062f\u0650\u0643\u064e\u060c \u0648\u064e\u062a\u064e\u0628\u064e\u0627\u0631\u064e\u0643\u064e \u0627\u0633\u0652\u0645\u064f\u0643\u064e\u060c \u0648\u064e\u062a\u064e\u0639\u064e\u0627\u0644\u064e\u0649 \u062c\u064e\u062f\u064e\u0651\u0643\u064e\u060c \u0648\u064e\u0644\u064e\u0627 \u0625\u0650\u0644\u064e\u0647\u064e \u063a\u064e\u064a\u0652\u0631\u064f\u0643\u064e",
    transliteration:"Sub\u1e25\u0101naka-ll\u0101humma wa bi\u1e25amdika, wa tab\u0101raka-smuka, wa ta\u02bfall\u0101 jadduka, wa l\u0101 il\u0101ha ghayruk",
    translation:"Glory be to You O Allah and praise. Blessed is Your name, Exalted is Your majesty, and there is no god but You.",
    source:"Sunan Ab\u012b D\u0101w\u016bd \u00b7 775" },

  { id:"sa02", title:"Du\u02bf\u0101 in Ruk\u016b\u02bf (Bowing)", stage:"Salah", isFeatured:false,
    subtitle:"Said during the bowing position",
    arabic:"\u0633\u064f\u0628\u0652\u062d\u064e\u0627\u0646\u064e \u0631\u064e\u0628\u064e\u0651\u064a\u064e \u0627\u0644\u0652\u0639\u064e\u0638\u0650\u064a\u0645\u0650",
    transliteration:"Sub\u1e25\u0101na rabbiya-l-\u02bfa\u1e93\u012bm",
    translation:"Glory be to my Lord, the Magnificent.",
    source:"\u1e62a\u1e25\u012b\u1e25 Muslim \u00b7 772" },

  { id:"sa03", title:"Rising from Ruk\u016b\u02bf", stage:"Salah", isFeatured:false,
    subtitle:"Said when standing upright after bowing",
    arabic:"\u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u0648\u064e\u0644\u064e\u0643\u064e \u0627\u0644\u062d\u064e\u0645\u0652\u062f\u064f\u060c \u062d\u064e\u0645\u0652\u062f\u064b\u0627 \u0643\u064e\u062b\u0650\u064a\u0631\u064b\u0627 \u0637\u064e\u064a\u064e\u0651\u0628\u064b\u0627 \u0645\u064f\u0628\u064e\u0627\u0631\u064e\u0643\u064b\u0627 \u0641\u0650\u064a\u0647\u0650",
    transliteration:"Rabban\u0101 wa laka-l-\u1e25amd, \u1e25amdan kath\u012bran \u1e6dayyiban mub\u0101rakan f\u012bh",
    translation:"Our Lord, and to You is all praise — abundant, pure, and blessed.",
    source:"\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 799" },

  { id:"sa04", title:"Du\u02bf\u0101 in Suj\u016bd (Prostration)", stage:"Salah", isFeatured:true,
    subtitle:"Said during sajdah — the closest a servant is to Allah",
    arabic:"\u0633\u064f\u0628\u0652\u062d\u064e\u0627\u0646\u064e \u0631\u064e\u0628\u064e\u0651\u064a\u064e \u0627\u0644\u0623\u064e\u0639\u0652\u0644\u064e\u0649",
    transliteration:"Sub\u1e25\u0101na rabbiya-l-a\u02bfl\u0101",
    translation:"Glory be to my Lord, the Most High.",
    source:"\u1e62a\u1e25\u012b\u1e25 Muslim \u00b7 772" },

  { id:"sa05", title:"Between Two Sujuds", stage:"Salah", isFeatured:false,
    subtitle:"Said while sitting between the two prostrations",
    arabic:"\u0631\u064e\u0628\u064e\u0651 \u0627\u063a\u0652\u0641\u0650\u0631\u0652 \u0644\u0650\u064a\u060c \u0631\u064e\u0628\u064e\u0651 \u0627\u063a\u0652\u0641\u0650\u0631\u0652 \u0644\u0650\u064a",
    transliteration:"Rabb-ighfir l\u012b, rabb-ighfir l\u012b",
    translation:"My Lord, forgive me. My Lord, forgive me.",
    source:"Sunan Ibn M\u0101jah \u00b7 897" },

  { id:"sa06", title:"Final Tashahh\u016bd", stage:"Salah", isFeatured:true,
    subtitle:"Recited in the sitting position before sal\u0101m",
    arabic:"\u0627\u0644\u062a\u064e\u0651\u062d\u064e\u064a\u064e\u0651\u0627\u062a\u064f \u0644\u0644\u0647\u0650 \u0648\u064e\u0627\u0644\u0635\u064e\u0651\u0644\u064e\u0648\u064e\u0627\u062a\u064f \u0648\u064e\u0627\u0644\u0637\u064e\u0651\u064a\u064e\u0651\u0628\u064e\u0627\u062a\u064f\u060c \u0627\u0644\u0633\u064e\u0651\u0644\u064e\u0627\u0645\u064f \u0639\u064e\u0644\u064e\u064a\u0652\u0643\u064e \u0623\u064e\u064a\u064e\u0651\u0647\u064e\u0627 \u0627\u0644\u0646\u064e\u0651\u0628\u0650\u064a\u064f\u0651 \u0648\u064e\u0631\u064e\u062d\u0652\u0645\u064e\u0629\u064f \u0627\u0644\u0644\u0647\u0650 \u0648\u064e\u0628\u064e\u0631\u064e\u0643\u064e\u0627\u062a\u064f\u0647\u064f",
    transliteration:"At-ta\u1e25iyy\u0101tu li-ll\u0101hi wa-\u1e63-\u1e63alaw\u0101tu wa-\u1e6d-\u1e6dayyib\u0101t. As-sal\u0101mu \u02bfalayka ayyuhan-nabiyyu wa ra\u1e25matu-ll\u0101hi wa barak\u0101tuh",
    translation:"All greetings, prayers and pure words are for Allah. Peace be upon you O Prophet, and the mercy of Allah and His blessings.",
    source:"\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 831" },

  { id:"sa07", title:"Sal\u0101t Ibr\u0101h\u012bmiyyah", stage:"Salah", isFeatured:false,
    subtitle:"Sending blessings upon the Prophet in Tashahh\u016bd",
    arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0635\u064e\u0644\u0651\u0650 \u0639\u064e\u0644\u064e\u0649 \u0645\u064f\u062d\u064e\u0645\u064e\u0651\u062f\u064d \u0648\u064e\u0639\u064e\u0644\u064e\u0649 \u0622\u0644\u0650 \u0645\u064f\u062d\u064e\u0645\u064e\u0651\u062f\u064d\u060c \u0643\u064e\u0645\u064e\u0627 \u0635\u064e\u0644\u064e\u0651\u064a\u0652\u062a\u064e \u0639\u064e\u0644\u064e\u0649 \u0625\u0650\u0628\u0652\u0631\u064e\u0627\u0647\u0650\u064a\u0645\u064e \u0648\u064e\u0639\u064e\u0644\u064e\u0649 \u0622\u0644\u0650 \u0625\u0650\u0628\u0652\u0631\u064e\u0627\u0647\u0650\u064a\u0645\u064e",
    transliteration:"All\u0101humma \u1e63alli \u02bfal\u0101 Mu\u1e25ammadin wa \u02bfal\u0101 \u0101li Mu\u1e25ammad, kam\u0101 \u1e63allayta \u02bfal\u0101 Ibr\u0101h\u012bma wa \u02bfal\u0101 \u0101li Ibr\u0101h\u012bm",
    translation:"O Allah, send Your blessings upon Muhammad and upon the family of Muhammad, as You sent blessings upon Ibrahim and upon the family of Ibrahim.",
    source:"\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 3370" },

  { id:"sa08", title:"Du\u02bf\u0101 Before Sal\u0101m", stage:"Salah", isFeatured:true,
    subtitle:"Said in the final sitting before ending prayer",
    arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u0646\u064e\u0651\u064a \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u0652 \u0639\u064e\u0630\u064e\u0627\u0628\u0650 \u062c\u064e\u0647\u064e\u0646\u064e\u0651\u0645\u064e\u060c \u0648\u064e\u0645\u0650\u0646\u0652 \u0639\u064e\u0630\u064e\u0627\u0628\u0650 \u0627\u0644\u0652\u0642\u064e\u0628\u0652\u0631\u0650\u060c \u0648\u064e\u0645\u0650\u0646\u0652 \u0641\u0650\u062a\u0652\u0646\u064e\u0629\u0650 \u0627\u0644\u0652\u0645\u064e\u062d\u0652\u064a\u064e\u0627 \u0648\u064e\u0627\u0644\u0652\u0645\u064e\u0645\u064e\u0627\u062a\u0650",
    transliteration:"All\u0101humma inn\u012b a\u02bfudhu bika min \u02bfadh\u0101bi jahannam, wa min \u02bfadh\u0101bi-l-qabr, wa min fitnati-l-ma\u1e25y\u0101 wa-l-mam\u0101t",
    translation:"O Allah, I seek refuge in You from the punishment of Hell, from the punishment of the grave, and from the trial of life and death.",
    source:"\u1e62a\u1e25\u012b\u1e25 Muslim \u00b7 588" },

  { id:"sa09", title:"Dhikr After Sal\u0101m", stage:"Salah", isFeatured:false,
    subtitle:"Said 33 times each after completing prayer",
    arabic:"\u0633\u064f\u0628\u0652\u062d\u064e\u0627\u0646\u064e \u0627\u0644\u0644\u0647\u0650 \u00b7 \u0627\u0644\u062d\u064e\u0645\u0652\u062f\u064f \u0644\u0644\u0647\u0650 \u00b7 \u0627\u0644\u0644\u0647\u064f \u0623\u064e\u0643\u0652\u0628\u064e\u0631\u064f",
    transliteration:"Sub\u1e25\u0101na-ll\u0101h (33\u00d7) \u00b7 Al-\u1e25amdu li-ll\u0101h (33\u00d7) \u00b7 All\u0101hu akbar (33\u00d7)",
    translation:"Glory be to Allah \u00b7 All praise is to Allah \u00b7 Allah is the Greatest (each 33 times).",
    source:"\u1e62a\u1e25\u012b\u1e25 Muslim \u00b7 595" },

  { id:"sa10", title:"Istikhara Prayer Du\u02bf\u0101", stage:"Special", isFeatured:true,
    subtitle:"After two rak\u02bfahs of Istikhara prayer",
    arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u0646\u064e\u0651\u064a \u0623\u064e\u0633\u0652\u062a\u064e\u062e\u0650\u064a\u0631\u064f\u0643\u064e \u0628\u0650\u0639\u0650\u0644\u0652\u0645\u0650\u0643\u064e\u060c \u0648\u064e\u0623\u064e\u0633\u0652\u062a\u064e\u0642\u0652\u062f\u0650\u0631\u064f\u0643\u064e \u0628\u0650\u0642\u064f\u062f\u0652\u0631\u064e\u062a\u0650\u0643\u064e\u060c \u0648\u064e\u0623\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e \u0645\u0650\u0646\u0652 \u0641\u064e\u0636\u0652\u0644\u0650\u0643\u064e \u0627\u0644\u0652\u0639\u064e\u0638\u0650\u064a\u0645\u0650",
    transliteration:"All\u0101humma inn\u012b astakh\u012bruka bi-\u02bfilmika, wa astaqdiruka bi-qudratika, wa as\u02bcaluka min fa\u1e0dlika-l-\u02bfa\u1e93\u012bm",
    translation:"O Allah, I seek Your guidance through Your knowledge, and Your power through Your ability, and I ask of You from Your great bounty.",
    source:"\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 1166" },

  { id:"sa11", title:"Witr Du\u02bf\u0101 (Qun\u016bt)", stage:"Salah", isFeatured:false,
    subtitle:"Recited in the final rak\u02bfah of Witr prayer",
    arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0627\u0647\u0652\u062f\u0650\u0646\u0650\u064a \u0641\u0650\u064a\u0645\u064e\u0646\u0652 \u0647\u064e\u062f\u064e\u064a\u0652\u062a\u064e\u060c \u0648\u064e\u0639\u064e\u0627\u0641\u0650\u0646\u0650\u064a \u0641\u0650\u064a\u0645\u064e\u0646\u0652 \u0639\u064e\u0627\u0641\u064e\u064a\u0652\u062a\u064e\u060c \u0648\u064e\u062a\u064e\u0648\u064e\u0644\u064e\u0651\u0646\u0650\u064a \u0641\u0650\u064a\u0645\u064e\u0646\u0652 \u062a\u064e\u0648\u064e\u0644\u064e\u0651\u064a\u0652\u062a\u064e",
    transliteration:"All\u0101humma-hdin\u012b f\u012bman hadayt, wa \u02bf\u0101fin\u012b f\u012bman \u02bf\u0101fayt, wa tawallan\u012b f\u012bman tawallayt",
    translation:"O Allah, guide me among those You have guided, and grant me well-being among those You have granted well-being, and take me as an ally among those You have taken as allies.",
    source:"Sunan Ab\u012b D\u0101w\u016bd \u00b7 1425" },

  { id:"sa12", title:"Entering the Mosque", stage:"Mosque", isFeatured:false,
    subtitle:"Said when entering any mosque",
    arabic:"\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0647\u0650\u060c \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0627\u0641\u0652\u062a\u064e\u062d\u0652 \u0644\u0650\u064a \u0623\u064e\u0628\u0652\u0648\u064e\u0627\u0628\u064e \u0631\u064e\u062d\u0652\u0645\u064e\u062a\u0650\u0643\u064e",
    transliteration:"Bismi-ll\u0101h, All\u0101humma-fta\u1e25 l\u012b abw\u0101ba ra\u1e25matik",
    translation:"In the name of Allah. O Allah, open for me the gates of Your mercy.",
    source:"\u1e62a\u1e25\u012b\u1e25 Muslim \u00b7 713" },

  { id:"sa13", title:"Leaving the Mosque", stage:"Mosque", isFeatured:false,
    subtitle:"Said when exiting any mosque",
    arabic:"\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0647\u0650\u060c \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u0646\u064e\u0651\u064a \u0623\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e \u0645\u0650\u0646\u0652 \u0641\u064e\u0636\u0652\u0644\u0650\u0643\u064e",
    transliteration:"Bismi-ll\u0101h, All\u0101humma inn\u012b as\u02bcaluka min fa\u1e0dlika",
    translation:"In the name of Allah. O Allah, I ask You from Your bounty.",
    source:"\u1e62a\u1e25\u012b\u1e25 Muslim \u00b7 713" },

  { id:"sa14", title:"Adh\u0101n Response Du\u02bf\u0101", stage:"Adhan", isFeatured:false,
    subtitle:"Said after completing the response to the call to prayer",
    arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0631\u064e\u0628\u064e\u0651 \u0647\u064e\u0630\u0650\u0647\u0650 \u0627\u0644\u062f\u064e\u0651\u0639\u0652\u0648\u064e\u0629\u0650 \u0627\u0644\u062a\u064e\u0651\u0627\u0645\u064e\u0651\u0629\u0650 \u0648\u064e\u0627\u0644\u0635\u064e\u0651\u0644\u064e\u0627\u0629\u0650 \u0627\u0644\u0642\u064e\u0627\u0626\u0650\u0645\u064e\u0629\u0650",
    transliteration:"All\u0101humma Rabba h\u0101dhihi-d-da\u02bfwati-t-t\u0101mmati wa-\u1e63-\u1e63al\u0101ti-l-q\u0101\u02bcimah",
    translation:"O Allah, Lord of this perfect call and the prayer that is about to be established.",
    source:"\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 614" },

  { id:"sa15", title:"Night Prayer (Tahajjud) Du\u02bf\u0101", stage:"Special", isFeatured:true,
    subtitle:"The Prophet's \u2611\ufe0f opening du\u02bf\u0101 for night prayer",
    arabic:"\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u064e\u0651 \u0644\u064e\u0643\u064e \u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f\u060c \u0623\u064e\u0646\u0652\u062a\u064e \u0642\u064e\u064a\u064e\u0651\u0645\u064f \u0627\u0644\u0633\u064e\u0651\u0645\u064e\u0627\u0648\u064e\u0627\u062a\u0650 \u0648\u064e\u0627\u0644\u0623\u064e\u0631\u0652\u0636\u0650 \u0648\u064e\u0645\u064e\u0646\u0652 \u0641\u0650\u064a\u0647\u0650\u0646\u064e\u0651",
    transliteration:"All\u0101humma laka-l-\u1e25amd. Anta qayyimu-s-sam\u0101w\u0101ti wa-l-ar\u1e0di wa man f\u012bhinn",
    translation:"O Allah, to You belongs all praise. You are the Sustainer of the heavens and the earth and whoever is in them.",
    source:"\u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 1120" },
];

// ─────────────────────────────────────────────────────────────────────────────
// QURANIC DU'ĀS  (28)
// ─────────────────────────────────────────────────────────────────────────────
export const QURAN_DUAS = [
  { id:"qu01", title:"Al-F\u0101ti\u1e25ah", stage:"Quran", isFeatured:true,
    subtitle:"The Opening — recited in every rak\u02bfah of prayer",
    arabic:"\u0627\u0644\u062d\u064e\u0645\u0652\u062f\u064f \u0644\u0644\u0647\u0650 \u0631\u064e\u0628\u0650\u0651 \u0627\u0644\u0652\u0639\u064e\u0627\u0644\u064e\u0645\u0650\u064a\u0646\u064e",
    transliteration:"Al-\u1e25amdu li-ll\u0101hi Rabbi-l-\u02bf\u0101lam\u012bn",
    translation:"All praise is to Allah, Lord of all the worlds.",
    source:"Al-F\u0101ti\u1e25ah 1:1\u20137 \u00b7 \u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 756" },

  { id:"qu02", title:"Rabban\u0101 \u0100tin\u0101", stage:"Quran", isFeatured:true,
    subtitle:"The most beloved Quranic du\u02bf\u0101",
    arabic:"\u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u0622\u062a\u0650\u0646\u064e\u0627 \u0641\u0650\u064a \u0627\u0644\u062f\u064f\u0651\u0646\u0652\u064a\u064e\u0627 \u062d\u064e\u0633\u064e\u0646\u064e\u0629\u064b \u0648\u064e\u0641\u0650\u064a \u0627\u0644\u0622\u062e\u0650\u0631\u064e\u0629\u0650 \u062d\u064e\u0633\u064e\u0646\u064e\u0629\u064b \u0648\u064e\u0642\u0650\u0646\u064e\u0627 \u0639\u064e\u0630\u064e\u0627\u0628\u064e \u0627\u0644\u0646\u064e\u0651\u0627\u0631\u0650",
    transliteration:"Rabban\u0101 \u0101tin\u0101 fi\u02bfd-duny\u0101 \u1e25asanatan wa fi\u02bfl-\u0101khirati \u1e25asanatan wa qin\u0101 \u02bfadh\u0101ba-n-n\u0101r",
    translation:"Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.",
    source:"Al-Baqarah 2:201" },

  { id:"qu03", title:"Du\u02bf\u0101 of Prophet Ibrahim for Parents", stage:"Quran", isFeatured:false,
    subtitle:"A prayer for forgiveness for oneself and one's parents",
    arabic:"\u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u0627\u063a\u0652\u0641\u0650\u0631\u0652 \u0644\u0650\u064a \u0648\u064e\u0644\u0650\u0648\u064e\u0627\u0644\u0650\u062f\u064e\u064a\u064e\u0651 \u0648\u064e\u0644\u0644\u0652\u0645\u064f\u0624\u0652\u0645\u0650\u0646\u0650\u064a\u0646\u064e \u064a\u064e\u0648\u0652\u0645\u064e \u064a\u064e\u0642\u064f\u0648\u0645\u064f \u0627\u0644\u062d\u0650\u0633\u064e\u0627\u0628\u064f",
    transliteration:"Rabban\u0101-ghfir l\u012b wa li-w\u0101lidayya wa lil-mu\u02bcmin\u012bna yawma yaq\u016bmu-l-\u1e25is\u0101b",
    translation:"Our Lord, forgive me and my parents and the believers on the Day when the account is established.",
    source:"Ibr\u0101h\u012bm 14:41" },

  { id:"qu04", title:"Du\u02bf\u0101 of Prophet Y\u016bnus in the Whale", stage:"Quran", isFeatured:true,
    subtitle:"The du\u02bf\u0101 of distress — answered instantly",
    arabic:"\u0644\u064e\u0627 \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0651\u064e\u0627 \u0623\u064e\u0646\u0652\u062a\u064e \u0633\u064f\u0628\u0652\u062d\u064e\u0627\u0646\u064e\u0643\u064e \u0625\u0650\u0646\u064e\u0651\u064a \u0643\u064f\u0646\u0652\u062a\u064f \u0645\u0650\u0646\u064e \u0627\u0644\u0638\u064e\u0651\u0627\u0644\u0650\u0645\u0650\u064a\u0646\u064e",
    transliteration:"L\u0101 il\u0101ha ill\u0101 Anta, sub\u1e25\u0101naka inn\u012b kuntu mina-\u1e93-\u1e93\u0101lim\u012bn",
    translation:"There is no god but You, glory be to You. Indeed I was among the wrongdoers.",
    source:"Al-Anbiy\u0101\u02bc 21:87 \u00b7 Sunan al-Tirmidh\u012b \u00b7 3505" },

  { id:"qu05", title:"Du\u02bf\u0101 for Steadfastness", stage:"Quran", isFeatured:false,
    subtitle:"Said when facing hardship or temptation",
    arabic:"\u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u0644\u064e\u0627 \u062a\u064f\u0632\u0650\u063a\u0652 \u0642\u064f\u0644\u064f\u0648\u0628\u064e\u0646\u064e\u0627 \u0628\u064e\u0639\u0652\u062f\u064e \u0625\u0650\u0630\u0652 \u0647\u064e\u062f\u064e\u064a\u0652\u062a\u064e\u0646\u064e\u0627 \u0648\u064e\u0647\u064e\u0628\u0652 \u0644\u064e\u0646\u064e\u0627 \u0645\u0650\u0646\u0652 \u0644\u064e\u062f\u064f\u0646\u0652\u0643\u064e \u0631\u064e\u062d\u0652\u0645\u064e\u0629\u064b",
    transliteration:"Rabban\u0101 l\u0101 tuzigh qul\u016bban\u0101 ba\u02bfda idh hadaytan\u0101 wa hab lan\u0101 min ladunka ra\u1e25mah",
    translation:"Our Lord, do not let our hearts deviate after You have guided us, and grant us from Yourself mercy.",
    source:"\u0100l \u02bfImr\u0101n 3:8" },

  { id:"qu06", title:"Du\u02bf\u0101 for Mercy and Forgiveness", stage:"Quran", isFeatured:false,
    subtitle:"A comprehensive du\u02bf\u0101 for forgiveness",
    arabic:"\u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u0638\u064e\u0644\u064e\u0645\u0652\u0646\u064e\u0627 \u0623\u064e\u0646\u0652\u0641\u064f\u0633\u064e\u0646\u064e\u0627 \u0648\u064e\u0625\u0650\u0646\u0652 \u0644\u064e\u0645\u0652 \u062a\u064e\u063a\u0652\u0641\u0650\u0631\u0652 \u0644\u064e\u0646\u064e\u0627 \u0648\u064e\u062a\u064e\u0631\u0652\u062d\u064e\u0645\u0652\u0646\u064e\u0627 \u0644\u064e\u0646\u064e\u0643\u064f\u0648\u0646\u064e\u0646\u064e\u0651 \u0645\u0650\u0646\u064e \u0627\u0644\u062e\u064e\u0627\u0633\u0650\u0631\u0650\u064a\u0646\u064e",
    transliteration:"Rabban\u0101 \u1e93alimn\u0101 anfusan\u0101 wa in lam taghfir lan\u0101 wa tar\u1e25amn\u0101 lanak\u016bnanna mina-l-kh\u0101sir\u012bn",
    translation:"Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers.",
    source:"Al-A\u02bfr\u0101f 7:23" },

  { id:"qu07", title:"Du\u02bf\u0101 of Prophet Ibr\u0101h\u012bm for a City of Peace", stage:"Quran", isFeatured:false,
    subtitle:"A du\u02bf\u0101 for safety and sustenance",
    arabic:"\u0631\u064e\u0628\u064e\u0651 \u0627\u062c\u0652\u0639\u064e\u0644\u0652 \u0647\u064e\u0630\u064e\u0627 \u0628\u064e\u0644\u064e\u062f\u064b\u0627 \u0622\u0645\u0650\u0646\u064b\u0627 \u0648\u064e\u0627\u0631\u0652\u0632\u064f\u0642\u0652 \u0623\u064e\u0647\u0652\u0644\u064e\u0647\u064f \u0645\u0650\u0646\u064e \u0627\u0644\u062b\u064e\u0651\u0645\u064e\u0631\u064e\u0627\u062a\u0650",
    transliteration:"Rabb-ij\u02bfal h\u0101dh\u0101 baladan \u0101minan war-zuq ahlahu mina-th-thamar\u0101t",
    translation:"My Lord, make this a city of security and provide its people with fruits.",
    source:"Al-Baqarah 2:126" },

  { id:"qu08", title:"Du\u02bf\u0101 of \u02bfIsa (Jesus) for Knowledge", stage:"Quran", isFeatured:false,
    subtitle:"A prayer for increase in knowledge",
    arabic:"\u0631\u064e\u0628\u064e\u0651 \u0632\u0650\u062f\u0652\u0646\u0650\u064a \u0639\u0650\u0644\u0652\u0645\u064b\u0627",
    transliteration:"Rabbi zidni \u02bfilm\u0101",
    translation:"My Lord, increase me in knowledge.",
    source:"\u1e6c\u0101h\u0101 20:114" },

  { id:"qu09", title:"Du\u02bf\u0101 of Musa for Guidance", stage:"Quran", isFeatured:false,
    subtitle:"Said when undertaking a difficulty",
    arabic:"\u0631\u064e\u0628\u064e\u0651 \u0627\u0634\u0652\u0631\u064e\u062d\u0652 \u0644\u0650\u064a \u0635\u064e\u062f\u0652\u0631\u0650\u064a \u0648\u064e\u064a\u064e\u0633\u064e\u0651\u0631\u0652 \u0644\u0650\u064a \u0623\u064e\u0645\u0652\u0631\u0650\u064a",
    transliteration:"Rabbi-shrah l\u012b \u1e63adr\u012b wa yassir l\u012b amr\u012b",
    translation:"My Lord, expand my breast and ease for me my task.",
    source:"\u1e6c\u0101h\u0101 20:25\u201326" },

  { id:"qu10", title:"Du\u02bf\u0101 of Zakariyya for Righteous Children", stage:"Quran", isFeatured:false,
    subtitle:"The du\u02bf\u0101 of Prophet Zakariyy\u0101 for a righteous heir",
    arabic:"\u0631\u064e\u0628\u064e\u0651 \u0647\u064e\u0628\u0652 \u0644\u0650\u064a \u0645\u0650\u0646\u0652 \u0644\u064e\u062f\u064f\u0646\u0652\u0643\u064e \u0630\u064f\u0631\u064e\u0651\u064a\u064e\u0651\u0629\u064b \u0637\u064e\u064a\u064e\u0651\u0628\u064e\u0629\u064b",
    transliteration:"Rabbi hab l\u012b min ladunka dhurriyyatan \u1e6dayyibah",
    translation:"My Lord, grant me from Yourself a good offspring.",
    source:"\u0100l \u02bfImr\u0101n 3:38" },

  { id:"qu11", title:"Du\u02bf\u0101 for Tawakkul (Trust in Allah)", stage:"Quran", isFeatured:false,
    subtitle:"The du\u02bf\u0101 of complete reliance on Allah",
    arabic:"\u062d\u064e\u0633\u0652\u0628\u064f\u0646\u064e\u0627 \u0627\u0644\u0644\u064e\u0647\u064f \u0648\u064e\u0646\u0650\u0639\u0652\u0645\u064e \u0627\u0644\u0652\u0648\u064e\u0643\u0650\u064a\u0644\u064f",
    transliteration:"\u1e24asbunal-l\u0101hu wa ni\u02bfma-l-wak\u012bl",
    translation:"Allah is sufficient for us, and what an excellent Trustee He is.",
    source:"\u0100l \u02bfImr\u0101n 3:173 \u00b7 \u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 4563" },

  { id:"qu12", title:"Du\u02bf\u0101 of the People of the Cave", stage:"Quran", isFeatured:false,
    subtitle:"Du\u02bf\u0101 for mercy and guidance",
    arabic:"\u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u0622\u062a\u0650\u0646\u064e\u0627 \u0645\u0650\u0646\u0652 \u0644\u064e\u062f\u064f\u0646\u0652\u0643\u064e \u0631\u064e\u062d\u0652\u0645\u064e\u0629\u064b \u0648\u064e\u0647\u064e\u064a\u0652\u0651\u0626\u0652 \u0644\u064e\u0646\u064e\u0627 \u0645\u0650\u0646\u0652 \u0623\u064e\u0645\u0652\u0631\u0650\u0646\u064e\u0627 \u0631\u064e\u0634\u064e\u062f\u064b\u0627",
    transliteration:"Rabban\u0101 \u0101tin\u0101 min ladunka ra\u1e25matan wa hayyi\u02bc lan\u0101 min amrin\u0101 rashad\u0101",
    translation:"Our Lord, grant us from Yourself mercy and prepare for us from our affair right guidance.",
    source:"Al-Kahf 18:10" },

  { id:"qu13", title:"Ayat al-Kurs\u012b \u2014 The Throne Verse", stage:"Quran", isFeatured:true,
    subtitle:"Recited after every obligatory prayer and before sleep",
    arabic:"\u0627\u0644\u0644\u0647\u064f \u0644\u064e\u0627 \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0651\u064e\u0627 \u0647\u064f\u0648\u064e \u0627\u0644\u062d\u064e\u064a\u064e\u0651 \u0627\u0644\u0652\u0642\u064e\u064a\u064e\u0651\u0648\u0645\u064f",
    transliteration:"All\u0101hu l\u0101 il\u0101ha ill\u0101 Huwa-l-\u1e24ayyu-l-Qayy\u016bm",
    translation:"Allah \u2014 there is no deity except Him, the Ever-Living, the Sustainer of existence.",
    source:"Al-Baqarah 2:255 \u00b7 \u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 2311" },

  { id:"qu14", title:"Last Two Verses of Al-Baqarah", stage:"Quran", isFeatured:true,
    subtitle:"Recited every night — they suffice the one who recites them",
    arabic:"\u0622\u0645\u064e\u0646\u064e \u0627\u0644\u0631\u064e\u0651\u0633\u064f\u0648\u0644\u064f \u0628\u0650\u0645\u064e\u0627 \u0623\u064f\u0646\u0652\u0632\u0650\u0644\u064e \u0625\u0650\u0644\u064e\u064a\u0652\u0647\u0650 \u0645\u0650\u0646\u0652 \u0631\u064e\u0651\u0628\u064e\u0651\u0647\u0650",
    transliteration:"\u0100mana-r-ras\u016blu bim\u0101 unzila ilayhi min rabbih",
    translation:"The Messenger believes in what has been revealed to him from his Lord.",
    source:"Al-Baqarah 2:285\u2013286 \u00b7 \u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 5009" },

  { id:"qu15", title:"Du\u02bf\u0101 for Gratitude", stage:"Quran", isFeatured:false,
    subtitle:"The du\u02bf\u0101 of Prophet Sulaym\u0101n",
    arabic:"\u0631\u064e\u0628\u064e\u0651 \u0623\u064e\u0648\u0652\u0632\u0650\u0639\u0652\u0646\u0650\u064a \u0623\u064e\u0646\u0652 \u0623\u064e\u0634\u0652\u0643\u064f\u0631\u064e \u0646\u0650\u0639\u0652\u0645\u064e\u062a\u064e\u0643\u064e \u0627\u0644\u064e\u0651\u062a\u0650\u064a \u0623\u064e\u0646\u0652\u0639\u064e\u0645\u0652\u062a\u064e \u0639\u064e\u0644\u064e\u064a\u064e\u0651 \u0648\u064e\u0639\u064e\u0644\u064e\u0649 \u0648\u064e\u0627\u0644\u0650\u062f\u064e\u064a\u064e\u0651",
    transliteration:"Rabbi awzi\u02bfn\u012b an ashkura ni\u02bfmataka-llat\u012b an\u02bfamta \u02bfalayya wa \u02bfal\u0101 w\u0101lidayy",
    translation:"My Lord, enable me to be grateful for Your favor which You have bestowed upon me and upon my parents.",
    source:"Al-Na\u1e25l 27:19" },

  { id:"qu16", title:"Du\u02bf\u0101 for Parents", stage:"Quran", isFeatured:true,
    subtitle:"One of the most important Quranic prayers",
    arabic:"\u0631\u064e\u0628\u064e\u0651\u0646\u0650\u064a \u0627\u0631\u0652\u062d\u064e\u0645\u0652\u0647\u064f\u0645\u064e\u0627 \u0643\u064e\u0645\u064e\u0627 \u0631\u064e\u0628\u064e\u0651\u064a\u064e\u0627\u0646\u0650\u064a \u0635\u064e\u063a\u0650\u064a\u0631\u064b\u0627",
    transliteration:"Rabb-ir\u1e25amhum\u0101 kam\u0101 rabbay\u0101n\u012b \u1e63agh\u012br\u0101",
    translation:"My Lord, have mercy upon them as they brought me up when I was small.",
    source:"Al-Isr\u0101\u02bc 17:24" },

  { id:"qu17", title:"Du\u02bf\u0101 for Righteous Children and Spouses", stage:"Quran", isFeatured:false,
    subtitle:"Said by the servants of the Most Merciful",
    arabic:"\u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u0647\u064e\u0628\u0652 \u0644\u064e\u0646\u064e\u0627 \u0645\u0650\u0646\u0652 \u0623\u064e\u0632\u0652\u0648\u064e\u0627\u062c\u0650\u0646\u064e\u0627 \u0648\u064e\u0630\u064f\u0631\u064e\u0651\u064a\u064e\u0651\u062a\u0650\u0646\u064e\u0627 \u0642\u064f\u0631\u064e\u0651\u0629\u064e \u0623\u064e\u0639\u0652\u064a\u064f\u0646\u064d",
    transliteration:"Rabban\u0101 hab lan\u0101 min azw\u0101jin\u0101 wa dhurriyy\u0101tin\u0101 qurrata a\u02bfyun",
    translation:"Our Lord, grant us from among our wives and offspring comfort to our eyes.",
    source:"Al-Furq\u0101n 25:74" },

  { id:"qu18", title:"Du\u02bf\u0101 for Forgiveness \u2014 Al-A\u02bfr\u0101f", stage:"Quran", isFeatured:false,
    subtitle:"The du\u02bf\u0101 of Prophet \u0100dam \u2611\ufe0f",
    arabic:"\u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u0638\u064e\u0644\u064e\u0645\u0652\u0646\u064e\u0627 \u0623\u064e\u0646\u0652\u0641\u064f\u0633\u064e\u0646\u064e\u0627 \u0648\u064e\u0625\u0650\u0646\u0652 \u0644\u064e\u0645\u0652 \u062a\u064e\u063a\u0652\u0641\u0650\u0631\u0652 \u0644\u064e\u0646\u064e\u0627",
    transliteration:"Rabban\u0101 \u1e93alimn\u0101 anfusan\u0101 wa in lam taghfir lan\u0101",
    translation:"Our Lord, we have wronged ourselves, and if You do not forgive us.",
    source:"Al-A\u02bfr\u0101f 7:23" },

  { id:"qu19", title:"The Closing of S\u016brat Al-Baqarah", stage:"Quran", isFeatured:false,
    subtitle:"The most comprehensive du\u02bf\u0101 in the Quran",
    arabic:"\u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u0644\u064e\u0627 \u062a\u064f\u0624\u064e\u0627\u062e\u0650\u0630\u0652\u0646\u064e\u0627 \u0625\u0650\u0646\u0652 \u0646\u064e\u0651\u0633\u0650\u064a\u0646\u064e\u0627 \u0623\u064e\u0648\u0652 \u0623\u064e\u062e\u0652\u0637\u064e\u0623\u0652\u0646\u064e\u0627",
    transliteration:"Rabban\u0101 l\u0101 tu\u02bc\u0101khidhn\u0101 in nas\u012bn\u0101 aw akha\u1e6dan\u0101",
    translation:"Our Lord, do not punish us if we forget or make an error.",
    source:"Al-Baqarah 2:286" },

  { id:"qu20", title:"Du\u02bf\u0101 of Prophet Ibr\u0101h\u012bm \u2014 Acceptance", stage:"Quran", isFeatured:false,
    subtitle:"The prayer for the acceptance of worship",
    arabic:"\u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u062a\u064e\u0642\u064e\u0628\u064e\u0651\u0644\u0652 \u0645\u0650\u0646\u064e\u0651\u0627 \u0625\u0650\u0646\u064e\u0651\u0643\u064e \u0623\u064e\u0646\u0652\u062a\u064e \u0627\u0644\u0633\u064e\u0651\u0645\u0650\u064a\u0639\u064f \u0627\u0644\u0652\u0639\u064e\u0644\u0650\u064a\u0645\u064f",
    transliteration:"Rabban\u0101 taqabbal minn\u0101 innaka Anta-s-Sam\u012b\u02bfu-l-\u02bfAl\u012bm",
    translation:"Our Lord, accept from us. Indeed You are the All-Hearing, the All-Knowing.",
    source:"Al-Baqarah 2:127" },

  { id:"qu21", title:"Du\u02bf\u0101 for Good Character", stage:"Quran", isFeatured:false,
    subtitle:"A Quranic prayer for moral excellence",
    arabic:"\u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u0622\u062a\u0650\u0646\u064e\u0627 \u0645\u0650\u0646\u0652 \u0644\u064e\u062f\u064f\u0646\u0652\u0643\u064e \u0631\u064e\u062d\u0652\u0645\u064e\u0629\u064b \u0648\u064e\u0647\u064e\u064a\u0651\u0650\u0626\u0652 \u0644\u064e\u0646\u064e\u0627 \u0645\u0650\u0646\u0652 \u0623\u064e\u0645\u0652\u0631\u0650\u0646\u064e\u0627 \u0631\u064e\u0634\u064e\u062f\u064b\u0627",
    transliteration:"Rabban\u0101 \u0101tin\u0101 min ladunka ra\u1e25matan wa hayyi\u02bc lan\u0101 min amrin\u0101 rashad\u0101",
    translation:"Our Lord, bestow on us mercy from Yourself and facilitate for us our affairs in the right way.",
    source:"Al-Kahf 18:10" },

  { id:"qu22", title:"Seeking Refuge in the Two Suras", stage:"Quran", isFeatured:false,
    subtitle:"Al-Falaq and Al-N\u0101s \u2014 recited morning, evening and before sleep",
    arabic:"\u0642\u064f\u0644\u0652 \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0631\u064e\u0628\u064e\u0651 \u0627\u0644\u0652\u0641\u064e\u0644\u064e\u0642\u0650",
    transliteration:"Qul a\u02bfudhu bi-Rabb il-falaq",
    translation:"Say: I seek refuge in the Lord of the daybreak.",
    source:"Al-Falaq 113:1 \u00b7 \u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 5017" },

  { id:"qu23", title:"Du\u02bf\u0101 for a Good Ending", stage:"Quran", isFeatured:false,
    subtitle:"A prayer to die as a Muslim",
    arabic:"\u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u0623\u064e\u0641\u0652\u0631\u0650\u063a\u0652 \u0639\u064e\u0644\u064e\u064a\u0652\u0646\u064e\u0627 \u0635\u064e\u0628\u0652\u0631\u064b\u0627 \u0648\u064e\u062a\u064e\u0648\u064e\u0641\u064e\u0651\u0646\u064e\u0627 \u0645\u064f\u0633\u0652\u0644\u0650\u0645\u0650\u064a\u0646\u064e",
    transliteration:"Rabban\u0101 afrigh \u02bfalayan\u0101 \u1e63abran wa tawaffan\u0101 muslim\u012bn",
    translation:"Our Lord, pour upon us patience and let us die as Muslims.",
    source:"Al-A\u02bfr\u0101f 7:126" },

  { id:"qu24", title:"Du\u02bf\u0101 When Oppressed", stage:"Quran", isFeatured:false,
    subtitle:"The du\u02bf\u0101 of those who are wronged",
    arabic:"\u062d\u064e\u0633\u0652\u0628\u0650\u064a\u064e \u0627\u0644\u0644\u064e\u0647\u064f \u0644\u064e\u0627 \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0651\u064e\u0627 \u0647\u064f\u0648\u064e \u0639\u064e\u0644\u064e\u064a\u0652\u0647\u0650 \u062a\u064e\u0648\u064e\u0643\u064e\u0651\u0644\u0652\u062a\u064f",
    transliteration:"\u1e24asbiyal-l\u0101hu l\u0101 il\u0101ha ill\u0101 Huwa \u02bfalayhi tawakkaltu",
    translation:"Allah is sufficient for me; there is no deity except Him. Upon Him I have relied.",
    source:"Al-Tawbah 9:129" },

  { id:"qu25", title:"S\u016brat al-Ikhl\u0101\u1e63 \u2014 Pure Monotheism", stage:"Quran", isFeatured:true,
    subtitle:"Equal to one-third of the Quran in reward",
    arabic:"\u0642\u064f\u0644\u0652 \u0647\u064f\u0648\u064e \u0627\u0644\u0644\u0647\u064f \u0623\u064e\u062d\u064e\u062f\u064c",
    transliteration:"Qul Huwa-ll\u0101hu A\u1e25ad",
    translation:"Say: He is Allah, the One.",
    source:"Al-Ikhl\u0101\u1e63 112:1 \u00b7 \u1e62a\u1e25\u012b\u1e25 al-Bukh\u0101r\u012b \u00b7 5013" },

  { id:"qu26", title:"Du\u02bf\u0101 for Victory Over Disbelief", stage:"Quran", isFeatured:false,
    subtitle:"Said when facing challenges to faith",
    arabic:"\u0631\u064e\u0628\u064e\u0651\u0646\u064e\u0627 \u0644\u064e\u0627 \u062a\u064f\u0632\u0650\u063a\u0652 \u0642\u064f\u0644\u064f\u0648\u0628\u064e\u0646\u064e\u0627 \u0628\u064e\u0639\u0652\u062f\u064e \u0625\u0650\u0630\u0652 \u0647\u064e\u062f\u064e\u064a\u0652\u062a\u064e\u0646\u064e\u0627",
    transliteration:"Rabban\u0101 l\u0101 tuzigh qul\u016bban\u0101 ba\u02bfda idh hadaytan\u0101",
    translation:"Our Lord, do not let our hearts deviate after You have guided us.",
    source:"\u0100l \u02bfImr\u0101n 3:8" },

  { id:"qu27", title:"Du\u02bf\u0101 for Entering Hardship", stage:"Quran", isFeatured:false,
    subtitle:"Complete trust in Allah during calamity",
    arabic:"\u0625\u0650\u0646\u064e\u0651\u0627 \u0644\u0644\u0647\u0650 \u0648\u064e\u0625\u0650\u0646\u064e\u0651\u0627 \u0625\u0650\u0644\u064e\u064a\u0652\u0647\u0650 \u0631\u064e\u0627\u062c\u0650\u0639\u064f\u0648\u0646\u064e",
    transliteration:"Inn\u0101 li-ll\u0101hi wa inn\u0101 ilayhi r\u0101ji\u02bf\u016bn",
    translation:"Indeed we belong to Allah, and indeed to Him we will return.",
    source:"Al-Baqarah 2:156" },

  { id:"qu28", title:"Du\u02bf\u0101 of Ayyub \u2014 Relief from Hardship", stage:"Quran", isFeatured:false,
    subtitle:"The du\u02bf\u0101 of Prophet Ayy\u016bb during his illness",
    arabic:"\u0623\u064e\u0646\u064e\u0651\u064a \u0645\u064e\u0633\u064e\u0651\u0646\u0650\u064a \u0627\u0644\u0636\u064f\u0651\u0631\u064e\u0651 \u0648\u064e\u0623\u064e\u0646\u0652\u062a\u064e \u0623\u064e\u0631\u0652\u062d\u064e\u0645\u064f \u0627\u0644\u0631\u064e\u0651\u0627\u062d\u0650\u0645\u0650\u064a\u0646\u064e",
    transliteration:"Ann\u012b massaniya-\u1e0d-\u1e0durru wa Anta ar\u1e25amu-r-r\u0101\u1e25im\u012bn",
    translation:"Adversity has touched me, and You are the Most Merciful of the merciful.",
    source:"Al-Anbiy\u0101\u02bc 21:83" },
];

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// UMRAH DUAS — stages relevant to Umrah only
// Ihram → Arrival → Tawaf → Maqam → Sa'y → Zamzam → Completion → Farewell
// ─────────────────────────────────────────────────────────────────────────────
export const UMRAH_DUAS = HAJJ_UMRAH_DUAS.filter(d =>
  ["Ihram","Arrival","Tawaf","Maqam","Sa'y","Zamzam","Completion","Farewell","General"].includes(d.stage)
  && !["hu26","hu09","hu12","hu13","hu20","hu21","hu27","hu29","hu15"].includes(d.id)
);

// ─────────────────────────────────────────────────────────────────────────────
// HAJJ DUAS — full pilgrimage including Arafah, Muzdalifah, Mina, Madinah
// ─────────────────────────────────────────────────────────────────────────────
export const HAJJ_DUAS = HAJJ_UMRAH_DUAS.filter(d =>
  !["hu23"].includes(d.id) // remove "After Completing Umrah" — Umrah-specific
);

// EXPORT MASTER MAP — keyed by category id for DuaListScreen lookup
// ─────────────────────────────────────────────────────────────────────────────
export const DUA_CONTENT = {
  hajj:      HAJJ_UMRAH_DUAS,  // combined — used by Hajj+Umrah library category
  umrahDuas: UMRAH_DUAS,
  hajjDuas:  HAJJ_DUAS,
  salah:     SALAH_DUAS,
  quran:     QURAN_DUAS,
};

// Category counts for display (update LIBRARY_CATEGORIES in MyDuasScreen to match)
export const CATEGORY_COUNTS = {
  hajj:       31,
  salah:      15,
  quran:      28,
  gratitude:  21,
  forgive:    18,
  guidance:   23,
  protect:    20,
  patience:   19,
  provision:  17,
  healing:    14,
  anxiety:    16,
  travel:     12,
  morning:    22,
  parents:    11,
  repentance: 13,
  entering:   10,
};
