/**
 * duas-data.js — Safar
 * NORMALIZED MASTER (single source of truth, database-portable).
 * Generated from verification worksheet sets. Do not hand-edit entries here;
 * edit the source JSON and regenerate, OR update via your CMS/Supabase export.
 *
 * Every entry carries verified:false until a qualified reviewer signs off.
 * The adapter (dua-content.js) decides whether unverified entries are shown.
 *
 * MERGE LOG (this pass):
 *  - Base set: 20 entries (7 Hajj/Umrah stage duas + 13 sleep duas)
 *  - + 16 Hajj/Umrah stage duas, merged from duaLibrary.js (deduped against
 *    base; hu04/hu14 fuller-text variants intentionally NOT auto-applied to
 *    existing black-stone-takbir/jamarat entries — separate editorial call)
 *  - + 39 general-library duas (Quran, Salah, gratitude, forgiveness,
 *    guidance, protection, patience, provision), merged from duaLibrary.js
 *  - + 10 family/daily duas, sourced directly from sunnah.com's numbered
 *    Hisn al-Muslim edition (birth, child protection, marriage, bereavement,
 *    visiting the sick, leaving/entering the home)
 *  = 85 entries total. ALL still verified:false — nothing here has scholarly
 *    sign-off yet. See individual review_flag fields before shipping.
 *
 * KNOWN OPEN ITEMS (not fixed by this merge, flagged for follow-up):
 *  - Halq/Qurbani/Mina-days entries are stopgapped onto stage:"Jamarat" —
 *    STAGES/HAJJ_STAGES in dua-content.js has no dedicated slot for them yet.
 *  - "Maqam" stage in STAGES is sequenced after Sa'y, which looks
 *    chronologically backwards (Maqam Ibrahim prayer happens right after
 *    Tawaf). New Maqam-Ibrahim entry was placed under stage:"Tawaf" instead.
 *  - DUA_CONTENT.hajj in dua-content.js maps to the full unfiltered DUAS
 *    array rather than a Hajj-filtered subset — worth checking if intended.
 */

export const DUAS_DATA = [
  {
    "id": "talbiyah",
    "title": "Talbiyah — The Pilgrim's Announcement of Arrival",
    "arabic": "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لا شَرِيكَ لَكَ لَبَّيْكَ، إنَّ الْحَمْدَ، وَالنِّعْمَةَ، لَكَ وَالْمُلْكُ، لا شَرِيكَ لَكَ",
    "transliteration": "Labbayk Allāhumma labbayk, labbayk lā sharīka laka labbayk, innal-ḥamda wanniʿmata laka wal-mulk, lā sharīka lak",
    "translation": "I am here at Your service, O Allah, I am here at Your service. I am here at Your service, You have no partner, I am here at Your service. Surely the praise and blessings are Yours, and the dominion. You have no partner.",
    "source_full": "Al-Bukhārī (Fatḥ al-Bārī 3/408) · Muslim 2/841",
    "authenticity": "sahih",
    "stage": "Ihram",
    "stage_order": 1,
    "categories": [
      "general"
    ],
    "keywords": [
      "talbiyah",
      "ihram",
      "labbayk",
      "arrival",
      "intention",
      "miqat"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "FotM/115",
    "review_flag": null
  },
  {
    "id": "black-stone-takbir",
    "title": "Saying Allahu Akbar When Passing the Black Stone",
    "arabic": "اللهُ أَكْبَر",
    "transliteration": "Allāhu Akbar",
    "translation": "Allah is the Most Great.",
    "source_full": "Al-Bukhārī (Fatḥ al-Bārī 3/476)",
    "authenticity": "sahih",
    "stage": "Tawaf",
    "stage_order": 3,
    "categories": [
      "general"
    ],
    "keywords": [
      "black stone",
      "hajar aswad",
      "tawaf",
      "takbir",
      "circuit"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "FotM/116",
    "review_flag": null
  },
  {
    "id": "yemeni-corner",
    "title": "Between the Yemeni Corner and the Black Stone",
    "arabic": "رَبَّنَا آتِنَا في الدُّنْيَا حَسَنَةً وَفي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    "transliteration": "Rabbanā ātinā fid-dunyā ḥasanatan wa fil-ākhirati ḥasanatan wa qinā ʿadhāban-nār",
    "translation": "Our Lord, grant us the good things in this world and the good things in the next life, and save us from the punishment of the Fire.",
    "source_full": "Abū Dāwūd 2/179 · Aḥmad 3/411 · al-Albānī: ḥasan (Ṣaḥīḥ Abī Dāwūd 1/354) · Qurʾān 2:201",
    "authenticity": "hasan",
    "stage": "Tawaf",
    "stage_order": 3,
    "categories": [
      "general",
      "forgive",
      "provision"
    ],
    "keywords": [
      "yemeni corner",
      "rukn yamani",
      "tawaf",
      "rabbana atina",
      "baqarah"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "FotM/117",
    "review_flag": null
  },
  {
    "id": "safa-marwah",
    "title": "Standing at Safa and Marwah",
    "arabic": "إِنَّ الصَّفَا وَالمَرْوَةَ مِنْ شَعَائِرِ اللهِ، أَبْدَأُ بِمَا بَدَأَ اللهُ بِهِ",
    "transliteration": "Innaṣ-ṣafā wal-marwata min shaʿāʾirillāh. Abdaʾu bimā badaʾallāhu bihi",
    "translation": "Surely Ṣafā and Marwah are among the symbols of Allah. I begin with that which Allah began.",
    "extended_arabic": "لا إِلهَ إلاَّ اللهُ وَحْدَهُ لا شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ وهُوَ عَلى كُلِّ شَيءٍ قَديرٌ، لا إِلَهَ إلا اللهُ وَحْدَهُ، أَنْجَزَ وَعْدَهُ، وَنَصَرَ عَبْدَهُ وَهَزَمَ الأَحْزَابَ وَحْدَهُ",
    "extended_transliteration": "Lā ilāha illallāhu waḥdahu lā sharīka lahu, lahul-mulku wa lahul-ḥamdu wa huwa ʿalā kulli shayʾin qadīr. Lā ilāha illallāhu waḥdahu, anjaza waʿdahu, wa naṣara ʿabdahu, wa hazamal-aḥzāba waḥdah",
    "extended_translation": "None has the right to be worshipped but Allah alone, Who has no partner. His is the dominion and His is the praise, and He is able to do all things. None has the right to be worshipped but Allah alone; He fulfilled His promise, aided His servant, and alone defeated the confederates. (Said three times, facing the Qiblah, at both Ṣafā and Marwah.)",
    "source_full": "Muslim 2/888",
    "authenticity": "sahih",
    "stage": "Say",
    "stage_order": 4,
    "categories": [
      "general"
    ],
    "keywords": [
      "safa",
      "marwah",
      "say",
      "saiy",
      "shaair",
      "between hills"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "FotM/118",
    "review_flag": "SOURCE INCONSISTENCY: On the mirror page, one Arabic line reads 'Allāhu Akbar ×3' but the transliteration beneath it reads 'Lā ilāha illallāh, Allāhu Akbar'. Also the long passage transliteration contains 'illallāhu ilahaahu' which appears to be a typo not present in the Arabic. The takbīr line has been omitted from this entry pending reviewer decision on the correct sequence and wording. DO NOT ship until reconciled against a primary Hisn al-Muslim print edition."
  },
  {
    "id": "arafah",
    "title": "The Best Supplication — Day of Arafah",
    "arabic": "لا إِلَهَ إلاَّ اللهُ وَحْدَهُ لا شَريكَ لَهُ، لَهُ المُلْكُ ولَهُ الحَمْدُ وهُوَ عَلَى كُلِّ شَيْءٍ قَديرٌ",
    "transliteration": "Lā ilāha illallāhu waḥdahu lā sharīka lahu, lahul-mulku wa lahul-ḥamdu wa huwa ʿalā kulli shayʾin qadīr",
    "translation": "None has the right to be worshipped but Allah alone, Who has no partner. His is the dominion and His is the praise, and He is able to do all things.",
    "source_full": "al-Tirmidhī · al-Albānī: ḥasan (Ṣaḥīḥ al-Tirmidhī 3/184; al-Silsilah al-Ṣaḥīḥah 4/6)",
    "authenticity": "hasan",
    "stage": "Arafah",
    "stage_order": 6,
    "categories": [
      "general",
      "gratitude"
    ],
    "keywords": [
      "arafah",
      "arafat",
      "day of arafah",
      "best dua",
      "tahlil"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "FotM/119",
    "review_flag": null
  },
  {
    "id": "muzdalifah",
    "title": "At the Sacred Area of Muzdalifah (al-Mashar al-Haram)",
    "arabic": "اللهُ أَكْبَرُ، اللهُ أَحَدٌ، لا إِلَهَ إِلاَّ اللهُ",
    "transliteration": "Allāhu Akbar, Allāhu Aḥad, lā ilāha illallāh",
    "translation": "Allah is the Most Great; Allah is One; there is none worthy of worship but Allah. (The Prophet ﷺ faced the Qiblah and repeated words of remembrance until the sky grew light.)",
    "source_full": "Muslim 2/891",
    "authenticity": "sahih",
    "stage": "Muzdalifah",
    "stage_order": 7,
    "categories": [
      "general"
    ],
    "keywords": [
      "muzdalifah",
      "mashar haram",
      "tahlil",
      "takbir",
      "night"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "FotM/120",
    "review_flag": "NOTE: The mirror presents this as a description of the Prophet's ﷺ remembrance (takbīr, tahlīl) rather than a single fixed formula. Reviewer to confirm how it should be framed for users — as a described practice or a recitable text."
  },
  {
    "id": "jamarat",
    "title": "Saying Allahu Akbar While Stoning the Jamarat at Mina",
    "arabic": "اللهُ أَكْبَرُ",
    "transliteration": "Allāhu Akbar",
    "translation": "Allah is the Most Great. (Said with each pebble thrown at the three pillars.)",
    "source_full": "Al-Bukhārī (Fatḥ al-Bārī 3/581) · Muslim",
    "authenticity": "sahih",
    "stage": "Jamarat",
    "stage_order": 8,
    "categories": [
      "general"
    ],
    "keywords": [
      "jamarat",
      "stoning",
      "mina",
      "pillars",
      "takbir",
      "pebbles"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "FotM/121",
    "review_flag": null
  },
  {
    "id": "sleep-three-quls",
    "title": "The Three Quls Before Sleep",
    "arabic": "قُلْ هُوَ اللهُ أَحَدٌ… / قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ… / قُلْ أَعُوذُ بِرَبِّ النَّاسِ…",
    "transliteration": "Qul Huwallāhu Aḥad… / Qul aʿūdhu bi-Rabbil-falaq… / Qul aʿūdhu bi-Rabbin-nās…",
    "translation": "Recite al-Ikhlāṣ, al-Falaq and an-Nās in full. Cup the palms, blow gently into them, recite, then wipe over the body — head, face, front — three times.",
    "source_full": "Qurʾān 112–114 · al-Bukhārī (Fatḥ al-Bārī 9/62) · Muslim 4/1723",
    "authenticity": "quran",
    "stage": null,
    "stage_order": 99,
    "categories": [
      "sleep",
      "protect"
    ],
    "keywords": [
      "three quls",
      "ikhlas",
      "falaq",
      "nas",
      "sleep",
      "protection",
      "refuge"
    ],
    "is_featured": true,
    "source_page": "FotM/028",
    "review_flag": "Full surah text abbreviated here with ellipses; reviewer/build to insert the complete Arabic of all three surahs."
  },
  {
    "id": "ayat-al-kursi-sleep",
    "title": "Ayat al-Kursi Before Sleep",
    "arabic": "اللهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ، لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ…",
    "transliteration": "Allāhu lā ilāha illā Huwal-Ḥayyul-Qayyūm, lā taʾkhudhuhu sinatun wa lā nawm…",
    "translation": "Allah! There is no god but He, the Ever-Living, the Sustainer. Neither slumber nor sleep overtakes Him… (full verse). Whoever recites it on lying down has a guardian from Allah, and Satan will not approach until morning.",
    "source_full": "Qurʾān 2:255 · al-Bukhārī (Fatḥ al-Bārī 4/487)",
    "authenticity": "quran",
    "stage": null,
    "stage_order": 100,
    "categories": [
      "sleep",
      "protect"
    ],
    "keywords": [
      "ayat al-kursi",
      "throne verse",
      "baqarah",
      "sleep",
      "protection"
    ],
    "is_featured": true,
    "source_page": "FotM/028",
    "review_flag": "Arabic truncated; insert full 2:255."
  },
  {
    "id": "sleep-baqarah-closing",
    "title": "Closing Verses of al-Baqarah",
    "arabic": "آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ وَالْمُؤْمِنُونَ…",
    "transliteration": "Āmanar-Rasūlu bimā unzila ilayhi mir-Rabbihi wal-muʾminūn…",
    "translation": "The two closing verses of al-Baqarah. Whoever recites them at night, they will suffice him.",
    "source_full": "Qurʾān 2:285–286 · al-Bukhārī (Fatḥ al-Bārī 9/94) · Muslim 1/554",
    "authenticity": "quran",
    "stage": null,
    "stage_order": 101,
    "categories": [
      "sleep",
      "protect",
      "forgive"
    ],
    "keywords": [
      "baqarah",
      "amana rasul",
      "sleep",
      "two verses"
    ],
    "is_featured": false,
    "source_page": "FotM/028",
    "review_flag": "Arabic truncated; insert full 2:285-286."
  },
  {
    "id": "sleep-bismika-rabbi",
    "title": "Lying Down: With Your Name My Lord",
    "arabic": "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا، بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ",
    "transliteration": "Bismika Rabbī waḍaʿtu janbī, wa bika arfaʿuhu, fa-in amsakta nafsī farḥamhā, wa in arsaltahā faḥfaẓhā, bimā taḥfaẓu bihi ʿibādakaṣ-ṣāliḥīn",
    "translation": "With Your Name my Lord I lay myself down, and with Your Name I rise. If You take my soul, have mercy on it, and if You release it, protect it as You protect Your righteous servants.",
    "source_full": "al-Bukhārī 11/126 · Muslim 4/2084",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 102,
    "categories": [
      "sleep"
    ],
    "keywords": [
      "sleep",
      "lying down",
      "bismika",
      "soul"
    ],
    "is_featured": true,
    "source_page": "FotM/028",
    "review_flag": null
  },
  {
    "id": "sleep-khalaqta-nafsi",
    "title": "You Created My Soul",
    "arabic": "اللَّهُمَّ إِنَّكَ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا، لَكَ مَمَاتُهَا وَمَحْيَاهَا، إِنْ أَحْيَيْتَهَا فَاحْفَظْهَا، وَإِنْ أَمَتَّهَا فَاغْفِرْ لَهَا، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ",
    "transliteration": "Allāhumma innaka khalaqta nafsī wa Anta tawaffāhā, laka mamātuhā wa maḥyāhā, in aḥyaytahā faḥfaẓhā, wa in amattahā faghfir lahā. Allāhumma innī asʾalukal-ʿāfiyah",
    "translation": "O Allah, You created my soul and You take it back. Unto You is its death and its life. If You give it life, protect it; if You cause it to die, forgive it. O Allah, I ask You for wellbeing.",
    "source_full": "Muslim 4/2083 · Aḥmad 2/79",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 103,
    "categories": [
      "sleep",
      "forgive"
    ],
    "keywords": [
      "sleep",
      "soul",
      "afiyah",
      "wellbeing",
      "forgiveness"
    ],
    "is_featured": false,
    "source_page": "FotM/028",
    "review_flag": null
  },
  {
    "id": "sleep-qini-adhabaka",
    "title": "Save Me On the Day of Resurrection",
    "arabic": "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
    "transliteration": "Allāhumma qinī ʿadhābaka yawma tabʿathu ʿibādak",
    "translation": "O Allah, save me from Your punishment on the Day You resurrect Your servants. (Said three times, hand under the cheek.)",
    "source_full": "Abū Dāwūd 4/311 · al-Albānī (Ṣaḥīḥ al-Tirmidhī 3/143)",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 104,
    "categories": [
      "sleep"
    ],
    "keywords": [
      "sleep",
      "resurrection",
      "punishment",
      "three times"
    ],
    "is_featured": false,
    "source_page": "FotM/028",
    "review_flag": null
  },
  {
    "id": "sleep-bismika-amutu",
    "title": "In Your Name I Die and Live",
    "arabic": "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    "transliteration": "Bismika Allāhumma amūtu wa aḥyā",
    "translation": "In Your Name, O Allah, I die and I live.",
    "source_full": "al-Bukhārī (Fatḥ al-Bārī 11/113) · Muslim 4/2083",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 105,
    "categories": [
      "sleep"
    ],
    "keywords": [
      "sleep",
      "die",
      "live",
      "bismika"
    ],
    "is_featured": true,
    "source_page": "FotM/028",
    "review_flag": null
  },
  {
    "id": "sleep-tasbih-fatimah",
    "title": "Tasbih Before Sleep (33/33/34)",
    "arabic": "سُبْحَانَ اللهِ، وَالْحَمْدُ للهِ، وَاللهُ أَكْبَرُ",
    "transliteration": "Subḥānallāh (×33), Walḥamdu lillāh (×33), Wallāhu Akbar (×34)",
    "translation": "Glory is to Allah (33), praise is to Allah (33), Allah is the Most Great (34).",
    "source_full": "al-Bukhārī (Fatḥ al-Bārī 7/71) · Muslim 4/2091",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 106,
    "categories": [
      "sleep",
      "gratitude"
    ],
    "keywords": [
      "tasbih",
      "sleep",
      "subhanallah",
      "alhamdulillah",
      "allahu akbar"
    ],
    "is_featured": false,
    "source_page": "FotM/028",
    "review_flag": null
  },
  {
    "id": "sleep-rabbas-samawat",
    "title": "Lord of the Seven Heavens",
    "arabic": "اللَّهُمَّ رَبَّ السَّمَاوَاتِ السَّبْعِ وَرَبَّ الْعَرْشِ الْعَظِيمِ، رَبَّنَا وَرَبَّ كُلِّ شَيْءٍ…",
    "transliteration": "Allāhumma Rabbas-samāwātis-sabʿi wa Rabbal-ʿArshil-ʿAẓīm, Rabbanā wa Rabba kulli shayʾin…",
    "translation": "O Allah, Lord of the seven heavens and the Magnificent Throne, our Lord and Lord of all things… I seek refuge in You from the evil of all things You seize by the forelock. You are the First, the Last, the Most High, the Most Near. Settle our debt and free us from poverty.",
    "source_full": "Muslim 4/2084",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 107,
    "categories": [
      "sleep",
      "protect",
      "provision"
    ],
    "keywords": [
      "sleep",
      "throne",
      "debt",
      "poverty",
      "refuge",
      "provision"
    ],
    "is_featured": false,
    "source_page": "FotM/028",
    "review_flag": "Arabic truncated mid-text; insert full passage."
  },
  {
    "id": "sleep-alhamdu-at'amana",
    "title": "Praise to Allah Who Fed Us",
    "arabic": "الْحَمْدُ للهِ الَّذِي أَطْعَمَنَا وَسَقَانَا، وَكَفَانَا، وَآوَانَا، فَكَمْ مِمَّنْ لَا كَافِيَ لَهُ وَلَا مُؤْوِيَ",
    "transliteration": "Alḥamdu lillāhil-ladhī aṭʿamanā wa saqānā, wa kafānā, wa āwānā, fakam mimman lā kāfiya lahu wa lā muʾwiya",
    "translation": "Praise is to Allah Who fed us, gave us drink, sufficed us, and gave us shelter — for how many have none to suffice or shelter them.",
    "source_full": "Muslim 4/2085",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 108,
    "categories": [
      "sleep",
      "gratitude"
    ],
    "keywords": [
      "sleep",
      "gratitude",
      "food",
      "shelter",
      "praise"
    ],
    "is_featured": false,
    "source_page": "FotM/028",
    "review_flag": null
  },
  {
    "id": "sleep-alimal-ghayb",
    "title": "Knower of the Unseen",
    "arabic": "اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ فَاطِرَ السَّمَاوَاتِ وَالْأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ…",
    "transliteration": "Allāhumma ʿĀlimal-ghaybi wash-shahādati fāṭiras-samāwāti wal-arḍi, Rabba kulli shayʾin wa malīkahu, ash-hadu an lā ilāha illā Anta…",
    "translation": "O Allah, Knower of the unseen and the seen, Originator of the heavens and earth, Lord and Sovereign of all things, I bear witness there is no god but You. I seek refuge in You from the evil of my soul, from Satan and his idolatry, and from bringing evil on myself or any Muslim.",
    "source_full": "Abū Dāwūd 4/317 · al-Albānī (Ṣaḥīḥ al-Tirmidhī 3/142)",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 109,
    "categories": [
      "sleep",
      "protect"
    ],
    "keywords": [
      "sleep",
      "unseen",
      "refuge",
      "satan",
      "protection"
    ],
    "is_featured": false,
    "source_page": "FotM/028",
    "review_flag": "Arabic truncated; insert full passage."
  },
  {
    "id": "sleep-sajdah-mulk",
    "title": "Reciting Surahs as-Sajdah & al-Mulk",
    "arabic": "الۤمۤ تَنْزِيلُ الْكِتَابِ… / تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ…",
    "transliteration": "(Recite Sūrah 32 as-Sajdah and Sūrah 67 al-Mulk in full)",
    "translation": "The Prophet ﷺ would recite Sūrah as-Sajdah and Sūrah al-Mulk before sleeping.",
    "source_full": "al-Tirmidhī · al-Nasāʾī · al-Albānī (Ṣaḥīḥ al-Jāmiʿ 4/255)",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 110,
    "categories": [
      "sleep"
    ],
    "keywords": [
      "sleep",
      "sajdah",
      "mulk",
      "surah",
      "recitation"
    ],
    "is_featured": false,
    "source_page": "FotM/028",
    "review_flag": "Reference to full surahs, not a short text — UI should link to the surahs rather than display inline."
  },
  {
    "id": "sleep-aslamtu-nafsi",
    "title": "I Submit Myself to You",
    "arabic": "اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لَا مَلْجَأَ وَلَا مَنْجَا مِنْكَ إِلَّا إِلَيْكَ، آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ",
    "transliteration": "Allāhumma aslamtu nafsī ilayka, wa fawwaḍtu amrī ilayka, wa wajjahtu wajhī ilayka, wa aljaʾtu ẓahrī ilayka, raghbatan wa rahbatan ilayka, lā maljaʾa wa lā manjā minka illā ilayk, āmantu bikitābikal-ladhī anzalta wa bi-nabiyyikal-ladhī arsalt",
    "translation": "O Allah, I submit myself to You, entrust my affair to You, turn my face to You, and lay my back in reliance on You, in hope and fear of You. There is no refuge or escape from You except to You. I believe in Your Book which You revealed and Your Prophet whom You sent. (Whoever says this and dies that night dies upon the fiṭrah.)",
    "source_full": "al-Bukhārī (Fatḥ al-Bārī 11/113) · Muslim 4/2081",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 111,
    "categories": [
      "sleep",
      "forgive"
    ],
    "keywords": [
      "sleep",
      "submission",
      "fitrah",
      "reliance",
      "tawakkul"
    ],
    "is_featured": true,
    "source_page": "FotM/028",
    "review_flag": "Source transliteration had 'laa raalja' (typo for 'laa maljaa'); corrected to match Arabic — reviewer confirm."
  },
  {
    "id": "entering-masjid-haram",
    "title": "Entering the Masjid al-Haram",
    "arabic": "بِسْمِ اللهِ وَالصَّلَاةُ عَلَى رَسُولِ اللهِ، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    "transliteration": "Bismillāhi waṣ-ṣalātu ʿalā rasūlillāh. Allāhumma-ftaḥ lī abwāba raḥmatik",
    "translation": "In the name of Allah, and peace be upon the Messenger of Allah. O Allah, open for me the gates of Your mercy.",
    "source_full": "Ṣaḥīḥ Muslim 713",
    "authenticity": "sahih",
    "stage": "Entry",
    "stage_order": 2,
    "categories": [
      "general"
    ],
    "keywords": [
      "entering masjid al-haram",
      "mosque",
      "mercy",
      "entry"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (hu02). General mosque-entry dua, not Hajj-specific — confirm wording matches the general du'ā for entering any masjid used elsewhere in the app to avoid two versions."
  },
  {
    "id": "first-sight-kaabah",
    "title": "Upon First Sight of the Kabah",
    "arabic": "اللَّهُمَّ زِدْ هَذَا الْبَيْتَ شَرَفًا وَتَعْظِيمًا وَتَكْرِيمًا وَمَهَابَةً وَزِدْ مَنْ شَرَّفَهُ وَكَرَّمَهُ مِمَّنْ حَجَّهُ أَوِ اعْتَمَرَهُ شَرَفًا وَتَكْرِيمًا وَبِرًّا وَتَقْوَى",
    "transliteration": "Allāhumma zid hādhal-bayta sharafan wa taʿẓīman wa tarkīman wa mahābatan wa zid man sharrafahu wa karramahu mimman ḥajjahu awiʿtamarahu sharafan wa tarkīman wa birran wa taqwā",
    "translation": "O Allah, increase this House in honour, greatness, nobility and reverence, and increase those who honour and revere it — those who perform Hajj or Umrah — in honour, nobility, righteousness and piety.",
    "source_full": "Al-Azraqī · al-Bayhaqī",
    "authenticity": "unverified",
    "stage": "Entry",
    "stage_order": 2,
    "categories": [
      "general"
    ],
    "keywords": [
      "first sight",
      "kaabah",
      "entry",
      "reverence"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (hu03). Widely circulated in pilgrim guides but the chain (al-Azraqī/al-Bayhaqī, not a hadith collection) is not strong — several scholars grade this weak/mursal. Verify grading before shipping, or frame as 'commonly recited' rather than an authenticated hadith."
  },
  {
    "id": "istilam-black-stone",
    "title": "At the Black Stone (Istilam)",
    "arabic": "بِسْمِ اللهِ وَاللهُ أَكْبَرُ، اللَّهُمَّ إِيمَانًا بِكَ وَتَصْدِيقًا بِكِتَابِكَ وَوَفَاءً بِعَهْدِكَ وَاتِّبَاعًا لِسُنَّةِ نَبِيِّكَ",
    "transliteration": "Bismillāhi wallāhu akbar. Allāhumma īmānan bika wa taṣdīqan bik, wa wafāʿan biʿahdika wattibāʿan li-sunnati nabiyyik",
    "translation": "In the name of Allah, and Allah is Greatest. O Allah, out of faith in You, conviction in You, fulfillment of Your covenant and following the Sunnah of Your Prophet.",
    "source_full": "Musnad Aḥmad",
    "authenticity": "unverified",
    "stage": "Tawaf",
    "stage_order": 3,
    "categories": [
      "general"
    ],
    "keywords": [
      "black stone",
      "istilam",
      "hajar aswad",
      "touching"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (hu06). This longer istilām wording is graded weak (da'if) by some scholars (incl. al-Albānī in some collections) despite wide circulation. Verify grading before shipping — do not present as sahih without review."
  },
  {
    "id": "maqam-ibrahim-prayer",
    "title": "Prayer at Maqam Ibrahim",
    "arabic": "وَاتَّخِذُوا مِنْ مَقَامِ إِبْرَاهِيمَ مُصَلًّى",
    "transliteration": "Wattakhidhū min maqāmi Ibrāhīma muṣallā",
    "translation": "And take from the station of Ibrahim a place of prayer.",
    "source_full": "Qurʾān 2:125",
    "authenticity": "quran",
    "stage": "Tawaf",
    "stage_order": 3,
    "categories": [
      "general"
    ],
    "keywords": [
      "maqam ibrahim",
      "two rakah",
      "after tawaf",
      "prayer"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (hu07). Quranic verse, not a recited du'a per se — screens should present this as the basis for praying two rak'ahs at Maqam Ibrahim after Tawaf, not as text to recite. Placed under stage 'Tawaf' rather than the existing (currently empty) 'Maqam' stage — see file header note on stage ordering."
  },
  {
    "id": "drinking-zamzam",
    "title": "Drinking Zamzam Water",
    "arabic": "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا وَاسِعًا وَشِفَاءً مِنْ كُلِّ دَاءٍ",
    "transliteration": "Allāhumma innī asʾaluka ʿilman nāfiʿan wa rizqan wāsiʿan wa shifāʿan min kulli dāʿ",
    "translation": "O Allah, I ask You for beneficial knowledge, abundant provision, and healing from every disease.",
    "source_full": "Ibn Mājah 3062 · al-Ḥākim",
    "authenticity": "unverified",
    "stage": "Zamzam",
    "stage_order": 5,
    "categories": [
      "general",
      "provision"
    ],
    "keywords": [
      "zamzam",
      "water",
      "provision",
      "healing",
      "knowledge"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (hu08). Al-Hakim authenticated this and adh-Dhahabi concurred, but some later scholars dispute it — grading is not unanimous. Fills your currently-empty 'Zamzam' stage; confirm grading before shipping."
  },
  {
    "id": "dua-acceptance-hajj",
    "title": "Dua for Acceptance of Hajj",
    "arabic": "اللَّهُمَّ اجْعَلْنَا حَجًّا مَبْرُورًا وَسَعْيًا مَشْكُورًا وَذَنْبًا مَغْفُورًا",
    "transliteration": "Allāhumma-jʿalnā ḥajjan mabrūran wa saʿyan mashkūran wa dhanban maghfūran",
    "translation": "O Allah, make our Hajj one that is accepted, our saʿy one that is appreciated, and our sins forgiven.",
    "source_full": "Ibn Mājah 2893",
    "authenticity": "unverified",
    "stage": "Arafah",
    "stage_order": 6,
    "categories": [
      "general",
      "forgive"
    ],
    "keywords": [
      "arafah",
      "accepted hajj",
      "hajj mabrur",
      "forgiveness"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (hu12). Verify Ibn Majah grading before shipping."
  },
  {
    "id": "muzdalifah-forgiveness",
    "title": "Dua at Muzdalifah",
    "arabic": "اللَّهُمَّ إِنَّ هَذَا مَشْعَرُ الْحَرَامِ فَاغْفِرْ لِي ذُنُوبِي وَاجْعَلْنِي مِمَّنْ يُحْسِنُ الْيَوْمَ سَعْيَهُ",
    "transliteration": "Allāhumma inna hādhā mashʿarul-ḥarāmi faghfir lī dhunūbī wajʿalnī mimman yuḥsinul-yawma saʿyah",
    "translation": "O Allah, this is Mashʿar al-Ḥarām. Forgive my sins and make me among those who excel this day.",
    "source_full": "Ibn Mājah · al-Shāfiʿī",
    "authenticity": "unverified",
    "stage": "Muzdalifah",
    "stage_order": 7,
    "categories": [
      "general",
      "forgive"
    ],
    "keywords": [
      "muzdalifah",
      "forgiveness",
      "mashar haram"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (hu13). Distinct wording from your live 'muzdalifah' entry (Allāhu Akbar, Allāhu Aḥad...) — this is not a duplicate, it's a different recommended dua for the same stage. Verify grading before shipping."
  },
  {
    "id": "after-stoning-jamarat",
    "title": "After Stoning the Small and Middle Jamarat",
    "arabic": "اللَّهُمَّ اجْعَلْهُ حَجًّا مَبْرُورًا وَذَنْبًا مَغْفُورًا وَسَعْيًا مَشْكُورًا",
    "transliteration": "Allāhumma-jʿalhu ḥajjan mabrūran wa dhanban maghfūran wa saʿyan mashkūran",
    "translation": "O Allah, make it an accepted Hajj, a forgiven sin and an appreciated saʿy.",
    "source_full": "Transmitted from the Companions",
    "authenticity": "unverified",
    "stage": "Jamarat",
    "stage_order": 8,
    "categories": [
      "general",
      "forgive"
    ],
    "keywords": [
      "jamarat",
      "after stoning",
      "dua",
      "mina"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (hu15). This is an athar (companion practice), not a Prophetic hadith — label accordingly, don't present with the same weight as a sahih hadith."
  },
  {
    "id": "shaving-hair-forgiveness",
    "title": "For Those Shaving and Shortening Hair",
    "arabic": "اللَّهُمَّ اغْفِرْ لِلْمُحَلِّقِينَ وَالْمُقَصِّرِينَ",
    "transliteration": "Allāhumma-ghfir lil-muḥalliqīna wal-mutaqaṣṣirīn",
    "translation": "O Allah, forgive those who shave and those who shorten their hair.",
    "source_full": "Ṣaḥīḥ al-Bukhārī 1727",
    "authenticity": "sahih",
    "stage": "Jamarat",
    "stage_order": 8,
    "categories": [
      "general",
      "forgive"
    ],
    "keywords": [
      "halq",
      "shaving",
      "hair",
      "ihram exit",
      "mina"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (hu16). Stopgapped to stage 'Jamarat' — no 'Halq' stage exists yet. Note: the well-known hadith has the Prophet ﷺ repeating this three times for those who shave and once for those who shorten; this single-line version simplifies that — confirm intended framing."
  },
  {
    "id": "before-slaughtering-animal",
    "title": "Before Slaughtering the Animal",
    "arabic": "بِسْمِ اللهِ وَاللهُ أَكْبَرُ، اللَّهُمَّ مِنْكَ وَلَكَ",
    "transliteration": "Bismillāhi wallāhu akbar, Allāhumma minka wa lak",
    "translation": "In the name of Allah, Allah is Greatest. O Allah, from You and for You.",
    "source_full": "Ṣaḥīḥ Muslim 1966",
    "authenticity": "sahih",
    "stage": "Jamarat",
    "stage_order": 8,
    "categories": [
      "general"
    ],
    "keywords": [
      "qurbani",
      "sacrifice",
      "slaughter",
      "mina"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (hu17). Stopgapped to stage 'Jamarat' — no 'Qurbani' stage exists yet. Most pilgrims today authorize sacrifice via Nusuk rather than perform this personally; consider framing as 'if you attend the sacrifice' context."
  },
  {
    "id": "tawaf-al-wada-farewell",
    "title": "Tawaf al-Wada — Farewell",
    "arabic": "اللَّهُمَّ إِنَّ الْبَيْتَ بَيْتُكَ وَالْحَرَمَ حَرَمُكَ وَهَذَا مَقَامُ الْعَائِذِ بِكَ مِنَ النَّارِ",
    "transliteration": "Allāhumma innal-bayta baytuka wal-ḥarāma ḥarāmuka wa hādhā maqāmul-ʿāʾidhi bika minaʾn-nār",
    "translation": "O Allah, this House is Your House, this sanctuary is Your sanctuary, and this is the station of one who seeks refuge with You from the Fire.",
    "source_full": "Al-Azraqī",
    "authenticity": "unverified",
    "stage": "Farewell",
    "stage_order": 9,
    "categories": [
      "general",
      "protect"
    ],
    "keywords": [
      "tawaf al-wada",
      "farewell",
      "leaving makkah"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (hu18). Fills your currently-empty 'Farewell' stage. Chain not strong (al-Azraqi, not a hadith collection) — verify before shipping as anything more than 'commonly recited'."
  },
  {
    "id": "dua-accepted-pilgrimage",
    "title": "Dua for Accepted Pilgrimage",
    "arabic": "اللَّهُمَّ إِنِّي أَسْأَلُكَ رِضَاكَ وَالْجَنَّةَ وَأَعُوذُ بِكَ مِنْ سَخَطِكَ وَالنَّارِ",
    "transliteration": "Allāhumma innī asʿaluka riḍāka wal-jannata wa aʿūdhu bika min sakhaṭika wan-nār",
    "translation": "O Allah, I ask You for Your pleasure and Paradise, and I seek refuge in You from Your anger and the Fire.",
    "source_full": "Sunan al-Nasāʿī 1305",
    "authenticity": "unverified",
    "stage": null,
    "stage_order": 90,
    "categories": [
      "general",
      "protect"
    ],
    "keywords": [
      "general",
      "acceptance",
      "paradise",
      "refuge"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (hu19). General pilgrimage dua, not tied to a single stage — verify grading before shipping."
  },
  {
    "id": "entering-madinah",
    "title": "Dua Upon Entering Madinah",
    "arabic": "اللَّهُمَّ هَذَا حَرَمُ نَبِيِّكَ فَاجْعَلْهُ وِقَايَةً لِي مِنَ النَّارِ وَأَمَانًا مِنَ الْعَذَابِ وَارْزُقْنِي رِزْقًا حَسَنًا",
    "transliteration": "Allāhumma hādhā ḥaramu nabiyyika fajʿalhu wiqāyatan lī mina-n-nāri wa amānan minal-ʿadhābi war-zuqnī rizqan ḥasanan",
    "translation": "O Allah, this is the sanctuary of Your Prophet, so make it a protection for me from the Fire and safety from punishment, and grant me wholesome provision.",
    "source_full": "Ibn ʿAdī · al-Bazzār",
    "authenticity": "unverified",
    "stage": "Madinah",
    "stage_order": 10,
    "categories": [
      "general",
      "protect",
      "provision"
    ],
    "keywords": [
      "madinah",
      "entering",
      "prophet's sanctuary"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (hu20). Fills your currently-empty 'Madinah' stage. Ibn 'Adi and al-Bazzar are weaker collections generally used for weak/da'if reports — do NOT ship as sahih. Needs qualified scholarly grading before release."
  },
  {
    "id": "salutation-prophets-grave",
    "title": "Salutation Upon Visiting the Prophet's Grave",
    "arabic": "السَّلَامُ عَلَيْكَ يَا رَسُولَ اللهِ، السَّلَامُ عَلَيْكَ يَا نَبِيَّ اللهِ، السَّلَامُ عَلَيْكَ يَا خَيْرَ خَلْقِ اللهِ",
    "transliteration": "As-salāmu ʿalayaka yā rasūla-llāh, as-salāmu ʿalayaka yā nabiyya-llāh, as-salāmu ʿalayaka yā khayra khalqi-llāh",
    "translation": "Peace be upon you O Messenger of Allah, peace be upon you O Prophet of Allah, peace be upon you O best of Allah's creation.",
    "source_full": "Ibn Qudāmah, al-Mughnī",
    "authenticity": "unverified",
    "stage": "Madinah",
    "stage_order": 10,
    "categories": [
      "general"
    ],
    "keywords": [
      "madinah",
      "prophet's grave",
      "salutation",
      "visiting"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (hu21). Important distinction: al-Mughni is a fiqh manual, not a hadith collection — this is scholarly-recommended wording, not a hadith text. Present it that way; don't imply Prophetic authentication it doesn't have."
  },
  {
    "id": "mina-days-tashreeq",
    "title": "During the Days in Mina (Tashriq)",
    "arabic": "اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، لَا إِلَهَ إِلَّا اللهُ، وَاللهُ أَكْبَرُ، اللهُ أَكْبَرُ، وَلِلَّهِ الْحَمْدُ",
    "transliteration": "Allāhu akbar, Allāhu akbar, lā ilāha ill-Allāh, wallāhu akbar, Allāhu akbar, wa lillāhi-l-ḥamd",
    "translation": "Allah is Greatest, Allah is Greatest, there is no god but Allah, and Allah is Greatest, Allah is Greatest, and to Allah belongs all praise.",
    "source_full": "Ṣaḥīḥ al-Bukhārī (muʿallaqah)",
    "authenticity": "unverified",
    "stage": "Jamarat",
    "stage_order": 8,
    "categories": [
      "general",
      "gratitude"
    ],
    "keywords": [
      "mina",
      "tashreeq",
      "takbir",
      "days of mina"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (hu22). Stopgapped to stage 'Jamarat' — no 'Mina' stage exists yet. IMPORTANT: 'muʿallaqah' means this appears in Bukhari WITHOUT a connected chain — it should not be labeled simply 'Sahih al-Bukhari' as if fully authenticated. Correct this before shipping regardless of merge decision."
  },
  {
    "id": "returning-from-pilgrimage",
    "title": "Dua for Returning from Pilgrimage",
    "arabic": "آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ",
    "transliteration": "Āʿibūna tāʿibūna ʿābidūna lirabbina ḥāmidūn",
    "translation": "We are those who return, repent, worship our Lord and praise Him.",
    "source_full": "Ṣaḥīḥ Muslim 1342",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 91,
    "categories": [
      "general",
      "gratitude"
    ],
    "keywords": [
      "returning",
      "going home",
      "after hajj",
      "after umrah"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (hu23). General closing dua, not tied to a stage."
  },
  {
    "id": "dua-steadfastness",
    "title": "Dua for Steadfastness",
    "arabic": "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً إِنَّكَ أَنْتَ الْوَهَّابُ",
    "transliteration": "Rabbanā lā tuzigh qulūbanā baʿda idh hadaytanā wa hab lanā min ladunka raḥmah. Innaka antal-wahhāb",
    "translation": "Our Lord, let not our hearts deviate after You have guided us, and grant us from Yourself mercy. Indeed You are the Bestower.",
    "source_full": "Āl ʿImrān 3:8",
    "authenticity": "quran",
    "stage": null,
    "stage_order": 200,
    "categories": [
      "guidance",
      "anew",
      "bored"
    ],
    "keywords": [
      "dua",
      "steadfastness"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (q02)."
  },
  {
    "id": "dua-musa-ease",
    "title": "Dua of Sayyidana Musa — Help & Ease",
    "arabic": "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِنْ لِسَانِي يَفْقَهُوا قَوْلِي",
    "transliteration": "Rabb-iʿshraḥ lī ṣadrī wa yassir lī amrī wa-ḥlul ʿuqdatan min lisānī yafqahū qawlī",
    "translation": "My Lord, expand my chest, ease my affair, and untie the knot from my tongue so they may understand my speech.",
    "source_full": "Ṣūrah Ḑāhā 20:25–28",
    "authenticity": "quran",
    "stage": null,
    "stage_order": 201,
    "categories": [
      "guidance",
      "peace",
      "strength",
      "nervous",
      "overwhelmed"
    ],
    "keywords": [
      "dua",
      "sayyidana",
      "musa",
      "help",
      "ease"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (q03)."
  },
  {
    "id": "dua-ayyub-hardship",
    "title": "Dua of Aybb — Relief from Hardship",
    "arabic": "أَنِّي مَسَّنِي الضُّرُّ وَأَنْتَ أَرْحَمُ الرَّاحِمِينَ",
    "transliteration": "Annī massanī aḍ-ḍurru wa anta arḥamuʿr-rāḥimīn",
    "translation": "Indeed, adversity has touched me, and You are the Most Merciful of the merciful.",
    "source_full": "Al-Anbiyāʼ 21:83",
    "authenticity": "quran",
    "stage": null,
    "stage_order": 202,
    "categories": [
      "patience"
    ],
    "keywords": [
      "dua",
      "aybb",
      "relief",
      "from",
      "hardship"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (q04)."
  },
  {
    "id": "dua-yunus-darkness",
    "title": "Dua of Yunus — In the Depths of Darkness",
    "arabic": "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    "transliteration": "Lā ilāha illā anta subḥānaka innī kuntu minaẓ-ẓālimīn",
    "translation": "There is no god except You; glory be to You. Indeed, I have been among the wrongdoers.",
    "source_full": "Al-Anbiyāʼ 21:87",
    "authenticity": "quran",
    "stage": null,
    "stage_order": 203,
    "categories": [
      "patience",
      "forgive"
    ],
    "keywords": [
      "dua",
      "yunus",
      "depths",
      "darkness"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (q05)."
  },
  {
    "id": "dua-ibrahim-makkah",
    "title": "Dua of Ibrahim for the City of Makkah",
    "arabic": "رَبِّ اجْعَلْ هَذَا بَلَدًا آمِنًا وَارْزُقْ أَهْلَهُ مِنَ الثَّمَرَاتِ مَنْ آمَنَ مِنْهُمْ بِاللَّهِ وَالْيَوْمِ الْآخِرِ",
    "transliteration": "Rabbijʿal hādhā baladan āminan war-zuq ahlahu minaʿṭh-ṭhamarāti man āmana minhum billāhi wal-yawmil-ākhir",
    "translation": "My Lord, make this a secure city and provide its people with fruits — whoever among them believes in Allah and the Last Day.",
    "source_full": "Al-Baqarah 2:126",
    "authenticity": "quran",
    "stage": null,
    "stage_order": 204,
    "categories": [
      "provision"
    ],
    "keywords": [
      "dua",
      "ibrahim",
      "city",
      "makkah"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (q07)."
  },
  {
    "id": "dua-righteous-offspring",
    "title": "Dua for Righteous Offspring",
    "arabic": "رَبِّ هَبْ لِي مِنَ الصَّالِحِينَ",
    "transliteration": "Rabb-i hab lī minaʿṣ-ṣāliḥīn",
    "translation": "My Lord, grant me a child from among the righteous.",
    "source_full": "Al-Ṣāffāt 37:100",
    "authenticity": "quran",
    "stage": null,
    "stage_order": 205,
    "categories": [
      "family"
    ],
    "keywords": [
      "dua",
      "righteous",
      "offspring"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (q08). Seeds the empty 'family' category."
  },
  {
    "id": "dua-for-parents",
    "title": "Dua for Parents",
    "arabic": "رَبَّنِي ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    "transliteration": "Rabb-irḥamhumā kamā rabbayānī ṣaghīrā",
    "translation": "My Lord, have mercy on them both as they raised me when I was young.",
    "source_full": "Al-Isrāʼ 17:24",
    "authenticity": "quran",
    "stage": null,
    "stage_order": 206,
    "categories": [
      "family"
    ],
    "keywords": [
      "dua",
      "parents"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (q09). Seeds the empty 'family' category."
  },
  {
    "id": "dua-straight-path",
    "title": "Dua for Guidance to the Straight Path",
    "arabic": "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
    "transliteration": "Ihdināʿṣ-ṣirāṭal-mustaqīm",
    "translation": "Guide us to the straight path.",
    "source_full": "Al-Fātiḥah 1:6",
    "authenticity": "quran",
    "stage": null,
    "stage_order": 207,
    "categories": [
      "guidance",
      "daily"
    ],
    "keywords": [
      "dua",
      "guidance",
      "straight",
      "path"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (q10). Recited in every unit of every prayer — strong 'daily' fit."
  },
  {
    "id": "dua-for-knowledge",
    "title": "Dua for Knowledge",
    "arabic": "رَبِّ زِدْنِي عِلْمًا",
    "transliteration": "Rabb-i zidnī ʿilmā",
    "translation": "My Lord, increase me in knowledge.",
    "source_full": "Ṣūrah Ḑāhā 20:114",
    "authenticity": "quran",
    "stage": null,
    "stage_order": 208,
    "categories": [
      "guidance"
    ],
    "keywords": [
      "dua",
      "knowledge"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (q11)."
  },
  {
    "id": "dua-isa-table-spread",
    "title": "Dua of Isa (Jesus) — The Table Spread",
    "arabic": "اللَّهُمَّ رَبَّنَا أَنْزِلْ عَلَيْنَا مَائِدَةً مِنَ السَّمَاءِ تَكُونُ لَنَا عِيدًا",
    "transliteration": "Allāhumma rabbanā anzil ʿalayanā māʿidatan minaʿs-samāʿi takūnu lanā ʿīdan",
    "translation": "O Allah, our Lord, send down to us a table spread from heaven that will be a festival for us.",
    "source_full": "Al-Māʿidah 5:114",
    "authenticity": "quran",
    "stage": null,
    "stage_order": 209,
    "categories": [
      "provision"
    ],
    "keywords": [
      "dua",
      "isa",
      "(jesus)",
      "table",
      "spread"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (q12)."
  },
  {
    "id": "salah-opening-dua",
    "title": "Opening Dua (Iftitah)",
    "arabic": "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدَّكَ، وَلَا إِلَهَ غَيْرُكَ",
    "transliteration": "Subḥānakallahumma wa biḥamdika wa tabārakasmuka wa taʿālā jadduka wa lā ilāha ghayruk",
    "translation": "Glory be to You O Allah and praise be to You, blessed is Your name and exalted is Your majesty, and there is no god but You.",
    "source_full": "Sunan Abī Dāwūd · 775",
    "authenticity": "unverified",
    "stage": null,
    "stage_order": 210,
    "categories": [
      "daily"
    ],
    "keywords": [
      "opening",
      "dua",
      "(iftitah)"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (p01). Abu Dawud citation with no explicit grading in source — verify before shipping."
  },
  {
    "id": "salah-ruku-dua",
    "title": "Dua of Ruku",
    "arabic": "سُبْحَانَ رَبَّي الْعَظِيمِ",
    "transliteration": "Subḥāna rabbiyaʿl-ʿaẓīm",
    "translation": "Glory be to my Lord the Most Great.",
    "source_full": "Ṣaḥīḥ Muslim · 772",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 211,
    "categories": [
      "daily"
    ],
    "keywords": [
      "dua",
      "ruku"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (p02)."
  },
  {
    "id": "salah-rising-ruku",
    "title": "Rising from Ruku",
    "arabic": "رَبَّنَا وَلَكَ الْحَمْدُ، حَمْدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ",
    "transliteration": "Rabbanā wa lakal-ḥamd, ḥamdan kathīran ṭayyiban mubārakan fīh",
    "translation": "Our Lord, and to You be praise — abundant, pure and blessed praise.",
    "source_full": "Ṣaḥīḥ al-Bukhārī · 799",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 212,
    "categories": [
      "daily"
    ],
    "keywords": [
      "rising",
      "from",
      "ruku"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (p03)."
  },
  {
    "id": "salah-sujud-dua",
    "title": "Dua of Sujud",
    "arabic": "سُبْحَانَ رَبَّي الأَعْلَى",
    "transliteration": "Subḥāna rabbiyaʿl-aʿlā",
    "translation": "Glory be to my Lord the Most High.",
    "source_full": "Ṣaḥīḥ Muslim · 772",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 213,
    "categories": [
      "daily"
    ],
    "keywords": [
      "dua",
      "sujud"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (p04)."
  },
  {
    "id": "salah-between-prostrations",
    "title": "Dua Between the Two Prostrations",
    "arabic": "رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي",
    "transliteration": "Rabb-ighfir lī, Rabb-ighfir lī",
    "translation": "My Lord, forgive me. My Lord, forgive me.",
    "source_full": "Sunan Ibn Mājah · 897",
    "authenticity": "unverified",
    "stage": null,
    "stage_order": 214,
    "categories": [
      "daily"
    ],
    "keywords": [
      "dua",
      "between",
      "prostrations"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (p05). Ibn Majah citation, no explicit grading in source — verify."
  },
  {
    "id": "salah-tashahhud",
    "title": "Tashahhud",
    "arabic": "التَّحَِيَّاتُ لِللَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ",
    "transliteration": "At-taḥiyyātu lillāhi waʿṣ-ṣalawātu waʿṭ-ṭayibāt. As-salāmu ʿalayka ayyuhan-nabiyyu wa raḥmatullāhi wa barakātuh",
    "translation": "All greetings, prayers and pure words are for Allah. Peace be upon you O Prophet, and the mercy of Allah and His blessings.",
    "source_full": "Ṣaḥīḥ al-Bukhārī · 831",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 215,
    "categories": [
      "daily"
    ],
    "keywords": [
      "tashahhud"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (p06)."
  },
  {
    "id": "salah-ibrahimi-salawat",
    "title": "Ibrahimi Salat — Darood Ibrahim",
    "arabic": "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ",
    "transliteration": "Allāhumma ṣalli ʿalā Muḥammadin wa ʿalā āli Muḥammadin, kamā ṣallayta ʿalā Ibrāhīma wa ʿalā āli Ibrāhīm, innaka ḥamīdun majīd",
    "translation": "O Allah, send blessings upon Muhammad and upon the family of Muhammad, as You sent blessings upon Ibrahim and upon the family of Ibrahim. Indeed You are Praiseworthy and Majestic.",
    "source_full": "Ṣaḥīḥ al-Bukhārī · 3370",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 216,
    "categories": [
      "daily"
    ],
    "keywords": [
      "ibrahimi",
      "salat",
      "darood",
      "ibrahim"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (p07)."
  },
  {
    "id": "salah-before-salam",
    "title": "Before Salam — Dua at End of Prayer",
    "arabic": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ جَهَنَّمَ، وَمِنْ عَذَابِ الْقَبْرِ، وَمِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ، وَمِنْ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ",
    "transliteration": "Allāhumma innī aʿwūdhu bika min ʿadhābi jahannama wa min ʿadhābil-qabri wa min fitnatiʿl-maḥyā wal-mamāti wa min fitnatiʿl-masīḥid-dajjāl",
    "translation": "O Allah, I seek refuge in You from the punishment of Hell, the punishment of the grave, the trial of life and death, and the trial of the Dajjal.",
    "source_full": "Ṣaḥīḥ Muslim · 588",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 217,
    "categories": [
      "daily",
      "protect"
    ],
    "keywords": [
      "before",
      "salam",
      "dua",
      "prayer"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (p08)."
  },
  {
    "id": "salah-after-salam-tasbih",
    "title": "After Salam — Tasbih",
    "arabic": "سُبْحَانَ اللَّهِ · الحَمْدُ للَّهِ · اللَّهُ أَكْبَرُ",
    "transliteration": "Subḥāna-llāh (33×) · Alḥamdu-lillāh (33×) · Allāhu akbar (33×)",
    "translation": "Glory be to Allah (33×) · All praise is for Allah (33×) · Allah is the Greatest (33×)",
    "source_full": "Ṣaḥīḥ Muslim · 597",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 218,
    "categories": [
      "daily",
      "gratitude"
    ],
    "keywords": [
      "after",
      "salam",
      "tasbih"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (p09)."
  },
  {
    "id": "alhamdulillah",
    "title": "Saying Alhamdulillah",
    "arabic": "الْحَمْدُ للَّهِ رَبِّ الْعَالَمِينَ",
    "transliteration": "Alḥamdu-lillāhi rabbil-ʿālamīn",
    "translation": "All praise is for Allah, Lord of all the worlds.",
    "source_full": "Al-Fātiḥah 1:2",
    "authenticity": "quran",
    "stage": null,
    "stage_order": 219,
    "categories": [
      "gratitude"
    ],
    "keywords": [
      "saying",
      "alhamdulillah"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (gr01)."
  },
  {
    "id": "dua-gratitude-worship",
    "title": "Dua for Gratitude and Worship",
    "arabic": "اللَّهُمَّ أَعِنَّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
    "transliteration": "Allāhumma aʿinnī ʿalā dhikrika wa shukrika wa ḥusni ʿibādatik",
    "translation": "O Allah, help me to remember You, to be grateful to You, and to worship You well.",
    "source_full": "Sunan Abī Dāwūd · 1522",
    "authenticity": "unverified",
    "stage": null,
    "stage_order": 220,
    "categories": [
      "gratitude",
      "daily"
    ],
    "keywords": [
      "dua",
      "gratitude",
      "worship"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (gr02). Abu Dawud citation, no explicit grading in source — verify."
  },
  {
    "id": "praise-after-blessing",
    "title": "Praise After Every Blessing",
    "arabic": "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
    "transliteration": "Subḥāna-llāhi wa biḥamdih, subḥāna-llāhil-ʿaẓīm",
    "translation": "Glory be to Allah and praise be to Him; glory be to Allah the Most Great.",
    "source_full": "Ṣaḥīḥ al-Bukhārī · 6682",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 221,
    "categories": [
      "gratitude"
    ],
    "keywords": [
      "praise",
      "after",
      "every",
      "blessing"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (gr03)."
  },
  {
    "id": "gratitude-receiving-favour",
    "title": "Gratitude When Receiving a Favour",
    "arabic": "الحَمْدُ للَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ",
    "transliteration": "Alḥamdu-lillāhil-ladhī bi-niʿmatihi tatimuʿṣ-ṣāliḥāt",
    "translation": "All praise is for Allah by whose grace good deeds are completed.",
    "source_full": "Ibn Mājah · 3803",
    "authenticity": "unverified",
    "stage": null,
    "stage_order": 222,
    "categories": [
      "gratitude",
      "happy"
    ],
    "keywords": [
      "gratitude",
      "when",
      "receiving",
      "favour"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (gr04). Ibn Majah citation, no explicit grading in source — verify."
  },
  {
    "id": "dua-lifetime-gratitude",
    "title": "Dua for a Lifetime of Gratitude",
    "arabic": "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَى وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ",
    "transliteration": "Rabb-i awziʿnī an ashkura niʿmataka-llatī anʿamta ʿalayya wa ʿalā wālidayya wa an aʿmala ṣāliḥan tarḍāh",
    "translation": "My Lord, inspire me to be grateful for the favour You have bestowed upon me and upon my parents, and to do good deeds that please You.",
    "source_full": "Al-Naml 27:19",
    "authenticity": "quran",
    "stage": null,
    "stage_order": 223,
    "categories": [
      "gratitude",
      "family"
    ],
    "keywords": [
      "dua",
      "lifetime",
      "gratitude"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (gr05). Mentions parents directly — also seeds 'family'."
  },
  {
    "id": "sayyid-al-istighfar",
    "title": "Sayyid al-Istighfar — Master Forgiveness Dua",
    "arabic": "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    "transliteration": "Allāhumma anta rabbī lā ilāha illā ant. Khalaqtanī wa ana ʿabduk. Wa ana ʿalā ʿahdika wa waʿdika mastaṭaʿt. Aʿwūdhu bika min sharri mā ṣanaʿt. Abūʿu laka bi-niʿmatika ʿalayya wa abūʿu bidhanbī fagh-fir lī fa-innahu lā yaghfiruʿdh-dhunūba illā ant",
    "translation": "O Allah, You are my Lord. There is no god but You. You created me and I am Your servant. I am upon Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your blessings upon me and I acknowledge my sins, so forgive me, for none forgives sins except You.",
    "source_full": "Ṣaḥīḥ al-Bukhārī · 6306",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 224,
    "categories": [
      "forgive",
      "daily",
      "guilty"
    ],
    "keywords": [
      "sayyid",
      "al-istighfar",
      "master",
      "forgiveness",
      "dua"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (fo01). The well-known morning/evening master forgiveness dua — strong 'daily' fit."
  },
  {
    "id": "dua-seeking-forgiveness",
    "title": "Seeking Forgiveness",
    "arabic": "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الحَيَّ القَيَّومُ وَأَتُوبُ إِلَيْهِ",
    "transliteration": "Astaghfiru-llāhal-ʿaẓīma-lladhī lā ilāha illā huwal-ḥayyul-qayyūmu wa atūbu ilayh",
    "translation": "I seek forgiveness from Allah the Mighty, whom there is no god except He, the Ever-Living, the Sustainer, and I repent to Him.",
    "source_full": "Sunan al-Tirmidhī · 3577",
    "authenticity": "unverified",
    "stage": null,
    "stage_order": 225,
    "categories": [
      "forgive"
    ],
    "keywords": [
      "seeking",
      "forgiveness"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (fo02). Tirmidhi citation, no explicit grading in source — verify."
  },
  {
    "id": "dua-forgiveness-all-sins",
    "title": "Dua for Forgiveness of All Sins",
    "arabic": "اللَّهُمَّ اغْفِرْ لِي مَا قَدَّمْتُ وَمَا أَخَّرْتُ، وَمَا أَسْرَرْتُ وَمَا أَعْلَنْتُ، وَمَا أَسْرَفْتُ، وَمَا أَنْتَ أَعْلَمُ بِهِ مِنَّي",
    "transliteration": "Allāhumma-ghfir lī mā qaddamtu wa mā akhkhartu, wa mā asrartu wa mā aʿlantu, wa mā asraftu, wa mā anta aʿlamu bihī minnī",
    "translation": "O Allah, forgive me for what I have done before and what I will do, what I have concealed and what I have disclosed, what I have exceeded in, and what You know of me better than I do.",
    "source_full": "Ṣaḥīḥ Muslim · 483",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 226,
    "categories": [
      "forgive"
    ],
    "keywords": [
      "dua",
      "forgiveness",
      "sins"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (fo03)."
  },
  {
    "id": "dua-tawbah-turning-back",
    "title": "Tawbah — Turning Back to Allah",
    "arabic": "رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَّنَ مِنَ الْخَاسِرِينَ",
    "transliteration": "Rabbanā ẓalumnā anfusanā wa in lam taghfir lanā wa tarḥamnā lanakūnanna minal-khāsirīn",
    "translation": "Our Lord, we have wronged ourselves. If You do not forgive us and have mercy on us, we shall surely be among the losers.",
    "source_full": "Al-Aʿrāf 7:23",
    "authenticity": "quran",
    "stage": null,
    "stage_order": 227,
    "categories": [
      "forgive"
    ],
    "keywords": [
      "tawbah",
      "turning",
      "back",
      "allah"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (fo04). NOTE: identical verse to duaLibrary's q06 (Al-A'raf 7:23) — q06 was dropped as an internal duplicate; keep only this one."
  },
  {
    "id": "dua-guidance-right-path",
    "title": "Dua for Guidance to the Right Path",
    "arabic": "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ، صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ",
    "transliteration": "Ihdināʿṣ-ṣirāṭal-mustaqīm. Ṣirāṭal-ladhīna anʿamta ʿalayhim",
    "translation": "Guide us to the straight path — the path of those upon whom You have bestowed favour.",
    "source_full": "Al-Fātiḥah 1:6–7",
    "authenticity": "quran",
    "stage": null,
    "stage_order": 228,
    "categories": [
      "guidance"
    ],
    "keywords": [
      "dua",
      "guidance",
      "right",
      "path"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (gd01)."
  },
  {
    "id": "dua-beneficial-knowledge",
    "title": "Dua for Beneficial Knowledge",
    "arabic": "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا",
    "transliteration": "Allāhumma innī asʿaluka ʿilman nāfiʿan wa rizqan ṭayyiban wa ʿamalan mutaqabbalan",
    "translation": "O Allah, I ask You for beneficial knowledge, pure provision, and accepted deeds.",
    "source_full": "Sunan Ibn Mājah · 925 · Graded Ṣaḥīḥ",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 229,
    "categories": [
      "guidance"
    ],
    "keywords": [
      "dua",
      "beneficial",
      "knowledge"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (gd02). Source notes 'Graded Sahih' — confirm against a primary reference before relying on that grading as-is."
  },
  {
    "id": "dua-knowledge-understanding",
    "title": "Dua for Knowledge and Understanding",
    "arabic": "رَبِّ زِدْنِي عِلْمًا",
    "transliteration": "Rabb-i zidnī ʿilmā",
    "translation": "My Lord, increase me in knowledge.",
    "source_full": "Ṣūrah Ḑāhā 20:114",
    "authenticity": "quran",
    "stage": null,
    "stage_order": 230,
    "categories": [
      "guidance"
    ],
    "keywords": [
      "dua",
      "knowledge",
      "understanding"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (gd03)."
  },
  {
    "id": "dua-sound-heart",
    "title": "Dua for a Sound Heart",
    "arabic": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عِلْمٍ لَا يَنْفَعُ، وَمِنْ قَلْبٍ لَا يَخْشَعُ، وَمِنْ نَفْسٍ لَا تَشْبَعُ، وَمِنْ دَعْوَةٍ لَا يُسْتَجَابُ لَهَا",
    "transliteration": "Allāhumma innī aʿwūdhu bika min ʿilmin lā yanfaʿu wa min qalbin lā yakhshaʿu wa min nafsin lā tashbaʿu wa min daʿwatin lā yustajābu lahā",
    "translation": "O Allah, I seek refuge in You from knowledge that does not benefit, from a heart that does not fear, from a soul that is not satisfied, and from a duʿāʾ that is not answered.",
    "source_full": "Ṣaḥīḥ Muslim · 2722",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 231,
    "categories": [
      "guidance"
    ],
    "keywords": [
      "dua",
      "sound",
      "heart"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (gd04)."
  },
  {
    "id": "morning-protection-dua",
    "title": "Morning Protection Dua",
    "arabic": "بِسْمِ اللهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    "transliteration": "Bismi-llāhil-ladhī lā yaḍurru maʿa-smihī shayʿun fiʿl-arḍi wa lā fiʿs-samāʿi wa huwas-samīʿul-ʿalīm",
    "translation": "In the name of Allah with whose name nothing in the earth or heaven can cause harm, and He is the All-Hearing, All-Knowing.",
    "source_full": "Sunan Abī Dāwūd · 5088",
    "authenticity": "unverified",
    "stage": null,
    "stage_order": 232,
    "categories": [
      "protect",
      "daily"
    ],
    "keywords": [
      "morning",
      "protection",
      "dua"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (pr02). Abu Dawud citation, no explicit grading in source — verify."
  },
  {
    "id": "seeking-refuge-four",
    "title": "Seeking Refuge from the Four",
    "arabic": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ",
    "transliteration": "Allāhumma innī aʿwūdhu bika minal-hammi wal-ḥazani wal-ʿajzi wal-kasali wal-bukhli wal-jubni wa ḍalaʿid-dayni wa ghalabatr-rijāl",
    "translation": "O Allah, I seek refuge in You from anxiety and grief, from weakness and laziness, from miserliness and cowardice, and from the burden of debt and the oppression of men.",
    "source_full": "Ṣaḥīḥ al-Bukhārī · 2893",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 233,
    "categories": [
      "protect",
      "daily",
      "peace",
      "anxious",
      "tired",
      "lazy",
      "overwhelmed",
      "sad",
      "greedy",
      "weak"
    ],
    "keywords": [
      "seeking",
      "refuge",
      "from",
      "four"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (pr03)."
  },
  {
    "id": "inna-lillahi-hardship",
    "title": "Ina Lillahi — In Times of Hardship",
    "arabic": "إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ، اللَّهُمَّ أَجْرْنِي فِي مُصِيبَتِي وَاخْلُفْ لِي خَيْرًا مِنْهَا",
    "transliteration": "Innā lillāhi wa innā ilayhi rājiʿūn. Allāhumma ajirnī fī muṣībatī wa-khluf lī khayran minhā",
    "translation": "Indeed we belong to Allah and to Him we shall return. O Allah, reward me in my affliction and replace it for me with something better.",
    "source_full": "Ṣaḥīḥ Muslim · 918",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 234,
    "categories": [
      "patience"
    ],
    "keywords": [
      "lillahi",
      "times",
      "hardship"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (pa01)."
  },
  {
    "id": "dua-tawakkul",
    "title": "Dua for Tawakkul",
    "arabic": "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    "transliteration": "Ḥasbunal-lāhu wa niʿmal-wakīl",
    "translation": "Allah is sufficient for us and He is the best disposer of affairs.",
    "source_full": "Āl ʿImrān 3:173 · Ṣaḥīḥ al-Bukhārī · 4563",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 235,
    "categories": [
      "patience",
      "peace",
      "scared",
      "nervous"
    ],
    "keywords": [
      "dua",
      "tawakkul"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (pa02). Dual-sourced: Quran 3:173, also attested in Bukhari 4563."
  },
  {
    "id": "dua-firmness-sabr",
    "title": "Dua for Firmness and Sabr",
    "arabic": "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ",
    "transliteration": "Rabbanā afrigh ʿalayanā ṣabran wa thabbit aqdāmanā wanṣurnā ʿalal-qawmil-kāfirīn",
    "translation": "Our Lord, pour upon us patience and plant firmly our feet and give us victory over the disbelieving people.",
    "source_full": "Al-Baqarah 2:250",
    "authenticity": "quran",
    "stage": null,
    "stage_order": 236,
    "categories": [
      "patience"
    ],
    "keywords": [
      "dua",
      "firmness",
      "sabr"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (pa03)."
  },
  {
    "id": "dua-halal-provision",
    "title": "Dua for Halal Provision",
    "arabic": "اللَّهُمَّ اكْفِنِي بحلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",
    "transliteration": "Allāhumma-kfinī biḥalālika ʿan ḥarāmika wa aghninī bi-faḍlika ʿamman siwāk",
    "translation": "O Allah, suffice me with what is lawful against what is unlawful, and make me independent of all besides You by Your bounty.",
    "source_full": "Sunan al-Tirmidhī · 3563",
    "authenticity": "unverified",
    "stage": null,
    "stage_order": 237,
    "categories": [
      "provision"
    ],
    "keywords": [
      "dua",
      "halal",
      "provision"
    ],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (pv01). Tirmidhi citation, no explicit grading in source — verify."
  },
  {
    "id": "dua-barakah-provision",
    "title": "Dua for Barakah in Provision",
    "arabic": "اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ",
    "transliteration": "Allāhumma bārik lanā fīmā razaqtanā wa qinā ʿadhāban-nār",
    "translation": "O Allah, bless us in what You have provided for us and protect us from the punishment of the Fire.",
    "source_full": "Transmitted duʿā",
    "authenticity": "unverified",
    "stage": null,
    "stage_order": 238,
    "categories": [
      "provision"
    ],
    "keywords": [
      "dua",
      "barakah",
      "provision"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Merged from duaLibrary.js (pv03). Source listed only as 'Transmitted du'a' — no collection or reference at all. This needs real sourcing or should be dropped; do not ship without a proper citation."
  },
  {
    "id": "dua-birth-congratulation-reply",
    "title": "Congratulating a New Parent (and the Reply)",
    "arabic": "بَارَكَ اللَّهُ لَكَ فِي الْمَوْهُوبِ لَكَ، وَشَكَرْتَ الْوَاهِبَ، وَبَلَغَ أَشُدَّهُ، وَرُزِقْتَ بِرَّهُ. [الرد]: بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ، وَجَزَاكَ اللَّهُ خَيْراً، وَرَزَقَكَ اللَّهُ مِثْلَهُ، وَأَجْزَلَ ثَوَابَكَ",
    "transliteration": "Bārakallāhu laka fi'l-mawhūbi lak, wa shakarta'l-wāhib, wa balagha ashuddah, wa ruziqta birrah. [Reply]: Bārakallāhu laka wa bāraka 'alayk, wa jazākallāhu khayra, wa razaqakallāhu mithlah, wa ajzala thawābak",
    "translation": "May Allah bless you with His gift to you, and may you give thanks; may the child reach maturity, and may you be granted its righteousness. [Reply]: May Allah bless you and shower blessings upon you, reward you well, grant you its like, and multiply your reward.",
    "source_full": "An-Nawawi, Kitab al-Adhkar p.349 - Sahih al-Adhkar 2/713 (Salim al-Hilali) -- Hisn al-Muslim 145",
    "authenticity": "unverified",
    "stage": null,
    "stage_order": 300,
    "categories": [
      "family"
    ],
    "keywords": [],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Sourced directly from sunnah.com/hisn:145 (chapter 47 of Hisn al-Muslim). Cited via a scholar's compilation (An-Nawawi/al-Hilali) rather than a primary hadith collection -- verify grading before shipping."
  },
  {
    "id": "dua-children-protection",
    "title": "Placing Children Under Allah's Protection",
    "arabic": "أُعِيذُكُمَا بِكَلِمَاتِ اللَّهِ التَّامَّةِ، مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ",
    "transliteration": "U'idhukuma bikalimati-llahit-tammati min kulli shaytanin wa hammah, wa min kulli 'aynin lammah",
    "translation": "I seek protection for you both in the Perfect Words of Allah, from every devil and every beast, and from every envious blameworthy eye.",
    "source_full": "Sahih al-Bukhari 4/119 -- Hisn al-Muslim 146",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 301,
    "categories": [
      "family",
      "protect"
    ],
    "keywords": [],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Sourced from sunnah.com/hisn:146 (chapter 48). The dua the Prophet used for Hasan and Husayn -- recite naming your own children in place of 'you both'."
  },
  {
    "id": "dua-newlywed-blessing",
    "title": "Congratulating a Newlywed Couple",
    "arabic": "بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ",
    "transliteration": "Barakallahu laka wa baraka 'alayka wa jama'a baynakuma fi khayr",
    "translation": "May Allah bless you, and shower His blessings upon you, and unite you both in goodness.",
    "source_full": "Sunan Abi Dawud 2130 - Jami' at-Tirmidhi 1091 (graded hasan sahih by at-Tirmidhi) -- Hisn al-Muslim, ch. 79",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 302,
    "categories": [
      "family"
    ],
    "keywords": [],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Well-attested across Abu Dawud, Tirmidhi and Ibn Majah with consistent wording -- one of the most reliably graded entries in this batch."
  },
  {
    "id": "dua-wedding-night",
    "title": "On the Wedding Night",
    "arabic": "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا وَخَيْرَ مَا جَبَلْتَهَا عَلَيْهِ، وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ مَا جَبَلْتَهَا عَلَيْهِ",
    "transliteration": "Allahumma inni as'aluka khayraha wa khayra ma jabaltaha 'alayh, wa a'udhu bika min sharriha wa sharri ma jabaltaha 'alayh",
    "translation": "O Allah, I ask You for the good in her and the good You have shaped her upon, and I seek refuge in You from the evil in her and the evil You have shaped her upon.",
    "source_full": "Abu Dawud - Ibn Majah - al-Hakim - al-Bayhaqi (hasan isnad per multiple compilers) -- Hisn al-Muslim, ch. 80",
    "authenticity": "unverified",
    "stage": null,
    "stage_order": 303,
    "categories": [
      "family"
    ],
    "keywords": [],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Traditionally said by the husband placing his hand on his wife's forehead on the wedding night. Grading is 'hasan' per several compilers but not uniformly agreed -- verify before shipping."
  },
  {
    "id": "dua-before-intimacy",
    "title": "Before Intimacy With One's Spouse",
    "arabic": "بِسْمِ اللَّهِ، اللَّهُمَّ جَنِّبْنَا الشَّيْطَانَ وَجَنِّبِ الشَّيْطَانَ مَا رَزَقْتَنَا",
    "transliteration": "Bismillah, Allahumma jannibna ash-shaytana wa jannibi ash-shaytana ma razaqtana",
    "translation": "In the name of Allah, O Allah, keep us away from Satan and keep Satan away from what You provide us.",
    "source_full": "Sahih al-Bukhari 7398 - Sahih Muslim 1434 -- Hisn al-Muslim, ch. 81",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 304,
    "categories": [
      "family"
    ],
    "keywords": [],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Directly and consistently attested in Bukhari and Muslim -- high confidence entry."
  },
  {
    "id": "dua-condolence-bereaved",
    "title": "Offering Condolences to the Bereaved",
    "arabic": "إِنَّ لِلَّهِ مَا أَخَذَ، وَلَهُ مَا أَعْطَى، وَكُلُّ شَيْءٍ عِنْدَهُ بِأَجَلٍ مُسَمًّى، فَلْتَصْبِرْ وَلْتَحْتَسِبْ. أَعْظَمَ اللَّهُ أَجْرَكَ، وَأَحْسَنَ عَزَاءَكَ، وَغَفَرَ لِمَيِّتِكَ",
    "transliteration": "Inna lillahi ma akhadh, wa lahu ma a'ta, wa kullu shay'in 'indahu bi ajalin musamma, faltasbir wa'l-tahtasib. A'zamallahu ajrak, wa ahsana 'aza'ak, wa ghafara limayyitik",
    "translation": "Surely to Allah belongs what He has taken, and to Him belongs what He has given, and everything with Him has an appointed time -- so be patient and seek reward. May Allah magnify your reward, perfect your bereavement, and forgive your departed.",
    "source_full": "Al-Bukhari 2/80 - Muslim 2/636 (opening); An-Nawawi, Kitab al-Adhkar p.126 (reply formula) -- Hisn al-Muslim 162",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 305,
    "categories": [
      "family",
      "patience"
    ],
    "keywords": [],
    "is_featured": true,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "The first sentence is directly sahih (Bukhari/Muslim). The second ('A'zamallahu ajrak...') is from an-Nawawi's compilation, not a primary hadith -- commonly paired but worth noting the split provenance. Also note: this dua asks forgiveness for the deceased, which is only appropriate if the deceased died a believer."
  },
  {
    "id": "dua-visiting-sick-relief",
    "title": "When Visiting the Sick (I)",
    "arabic": "لَا بَأْسَ طَهُورٌ إِنْ شَاءَ اللَّهُ",
    "transliteration": "La ba's, tahurun in sha'Allah",
    "translation": "Do not worry, it will be a purification (for you), Allah willing.",
    "source_full": "Al-Bukhari, cf. al-'Asqalani, Fath al-Bari 10/118 -- Hisn al-Muslim 147",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 306,
    "categories": [
      "family"
    ],
    "keywords": [],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Short, easy to say at a bedside -- pairs well with the fuller dua that follows (hisn:148)."
  },
  {
    "id": "dua-visiting-sick-healing",
    "title": "When Visiting the Sick (II)",
    "arabic": "أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ",
    "transliteration": "As'alullaha-l-'Azima Rabba-l-'Arshi-l-'Azimi an yashfiyak",
    "translation": "I ask Allah the Almighty, Lord of the Magnificent Throne, to heal you. (Recite seven times.)",
    "source_full": "At-Tirmidhi - Abu Dawud (al-Albani: Sahih at-Tirmidhi 2/210) -- Hisn al-Muslim 148",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 307,
    "categories": [
      "family"
    ],
    "keywords": [],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Sourced directly from sunnah.com/hisn -- cross-check the citation before flipping verified:true."
  },
  {
    "id": "dua-leaving-home",
    "title": "Remembrance When Leaving the Home",
    "arabic": "بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    "transliteration": "Bismillahi, tawakkaltu 'alallahi, wa la hawla wa la quwwata illa billah",
    "translation": "In the name of Allah, I have placed my trust in Allah; there is no might and no power except by Allah.",
    "source_full": "Abu Dawud 4/325 - At-Tirmidhi 5/490 (al-Albani: Sahih at-Tirmidhi 3/151) -- Hisn al-Muslim 16",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 308,
    "categories": [
      "daily"
    ],
    "keywords": [],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Fills a gap you already had -- chapter 10 of Hisn al-Muslim, and surprisingly not previously in your set given how often it's searched for."
  },
  {
    "id": "dua-entering-home",
    "title": "Remembrance Upon Entering the Home",
    "arabic": "بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى رَبِّنَا تَوَكَّلْنَا",
    "transliteration": "Bismillahi walajna, wa bismillahi kharajna, wa 'ala Rabbina tawakkalna",
    "translation": "In the name of Allah we enter, in the name of Allah we leave, and upon our Lord we depend. (Then greet those present.)",
    "source_full": "Abu Dawud 4/325 -- Hisn al-Muslim 18",
    "authenticity": "unverified",
    "stage": null,
    "stage_order": 309,
    "categories": [
      "daily",
      "family"
    ],
    "keywords": [],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Companion piece to the leaving-home dua above; the source doesn't carry an explicit standalone grading beyond the general Abu Dawud citation -- verify before shipping."
  },
  {
    "id": "muqallib-qulub",
    "title": "O Turner of Hearts",
    "arabic": "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ",
    "transliteration": "Ya Muqallib al-qulub, thabbit qalbi 'ala dinik",
    "translation": "O Turner of hearts, keep my heart firm upon Your religion.",
    "source_full": "Jami' at-Tirmidhi 3522 (hasan)",
    "authenticity": "hasan",
    "stage": null,
    "stage_order": 311,
    "categories": [
      "strength"
    ],
    "keywords": [
      "heart",
      "firmness",
      "steadfastness"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": null
  },
  {
    "id": "ashab-kahf-rashada",
    "title": "Dua of the People of the Cave",
    "arabic": "رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا",
    "transliteration": "Rabbana atina min ladunka rahmatan wa hayyi lana min amrina rashada",
    "translation": "Our Lord, grant us mercy from Yourself and prepare for us right guidance in our affair.",
    "source_full": "Qur'an 18:10",
    "authenticity": "quran",
    "stage": null,
    "stage_order": 315,
    "categories": [
      "anew"
    ],
    "keywords": [
      "new beginning",
      "guidance",
      "youth",
      "cave"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": null
  },
  {
    "id": "hasbiya-allah-throne",
    "title": "Hasbiya Allah",
    "arabic": "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ ۖ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
    "transliteration": "Hasbiya Allahu la ilaha illa huwa, 'alayhi tawakkaltu wa huwa rabbul-'arshil-'azim",
    "translation": "Allah is sufficient for me; there is no deity except Him. On Him I have relied, and He is Lord of the Great Throne.",
    "source_full": "Qur'an 9:129",
    "authenticity": "quran",
    "stage": null,
    "stage_order": 316,
    "categories": [
      "scared",
      "overwhelmed"
    ],
    "keywords": [
      "trust",
      "distress",
      "throne",
      "sufficiency"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": null
  },
  {
    "id": "ayat-al-karima",
    "title": "Ayat al-Karima — Dua of Yunus",
    "arabic": "لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَٰنَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
    "transliteration": "La ilaha illa anta subhanaka inni kuntu minaz-zalimin",
    "translation": "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.",
    "source_full": "Qur'an 21:87 · also Jami' at-Tirmidhi 3505",
    "authenticity": "quran",
    "stage": null,
    "stage_order": 317,
    "categories": [
      "sad",
      "depressed",
      "regret"
    ],
    "keywords": [
      "yunus",
      "jonah",
      "distress",
      "repentance",
      "relief"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": null
  },
  {
    "id": "rahmataka-arju",
    "title": "Do Not Leave Me to Myself",
    "arabic": "اللَّهُمَّ رَحْمَتَكَ أَرْجُو فَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ وَأَصْلِحْ لِي شَأْنِي كُلَّهُ لَا إِلَهَ إِلَّا أَنْتَ",
    "transliteration": "Allahumma rahmataka arju, fala takilni ila nafsi tarfata 'ayn, wa aslih li sha'ni kullah, la ilaha illa ant",
    "translation": "O Allah, it is Your mercy I hope for — do not leave me to myself even for the blink of an eye, and set right all my affairs. There is no god but You.",
    "source_full": "Sunan Abi Dawud · Hisn al-Muslim 123 (hasan, al-Albani)",
    "authenticity": "hasan",
    "stage": null,
    "stage_order": 318,
    "categories": [
      "lonely",
      "unloved",
      "hurt"
    ],
    "keywords": [
      "mercy",
      "alone",
      "distress",
      "affairs"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": null
  },
  {
    "id": "hamazat-shayateen",
    "title": "Refuge from the Incitements of Devils",
    "arabic": "وَقُل رَّبِّ أَعُوذُ بِكَ مِنْ هَمَزَاتِ الشَّيَاطِينِ وَأَعُوذُ بِكَ رَبِّ أَن يَحْضُرُونِ",
    "transliteration": "Wa qul rabbi a'udhu bika min hamazatish-shayateen, wa a'udhu bika rabbi an yahdurun",
    "translation": "My Lord, I seek refuge in You from the incitements of the devils, and I seek refuge in You, my Lord, lest they be present with me.",
    "source_full": "Qur'an 23:97-98",
    "authenticity": "quran",
    "stage": null,
    "stage_order": 319,
    "categories": [
      "angry"
    ],
    "keywords": [
      "anger",
      "devils",
      "incitement",
      "refuge"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": null
  },
  {
    "id": "surah-al-falaq",
    "title": "Surah al-Falaq",
    "arabic": "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ مِنْ شَرِّ مَا خَلَقَ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ",
    "transliteration": "Qul a'udhu bi rabbil-falaq, min sharri ma khalaq, wa min sharri ghasiqin idha waqab, wa min sharrin-naffathati fil-'uqad, wa min sharri hasidin idha hasad",
    "translation": "Say, 'I seek refuge in the Lord of daybreak, from the evil of that which He created, and from the evil of darkness when it settles, and from the evil of the blowers in knots, and from the evil of an envier when he envies.'",
    "source_full": "Qur'an 113 (Surah al-Falaq)",
    "authenticity": "quran",
    "stage": null,
    "stage_order": 320,
    "categories": [
      "jealous"
    ],
    "keywords": [
      "envy",
      "protection",
      "falaq",
      "hasad"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": null
  },
  {
    "id": "la-sahla-illa",
    "title": "Nothing Is Easy Except What You Make Easy",
    "arabic": "اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا",
    "transliteration": "Allahumma la sahla illa ma ja'altahu sahla, wa anta taj'alul-hazna idha shi'ta sahla",
    "translation": "O Allah, nothing is easy except what You make easy, and You make the difficult easy when You will.",
    "source_full": "Hisn al-Muslim 139 · Sahih Ibn Hibban",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 321,
    "categories": [
      "impatient"
    ],
    "keywords": [
      "ease",
      "difficulty",
      "patience",
      "waiting"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": null
  },
  {
    "id": "amantu-billah",
    "title": "Amantu Billah — I Believe in Allah",
    "arabic": "آمَنْتُ بِاللَّهِ",
    "transliteration": "Amantu billah",
    "translation": "I believe in Allah.",
    "source_full": "Sahih Muslim 134",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 322,
    "categories": [
      "doubtful",
      "hypocritical"
    ],
    "keywords": [
      "faith",
      "whispers",
      "waswas",
      "affirmation"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Short affirmation rather than a full multi-clause dua — this is the exact prophetic response taught for intrusive doubts about faith, per the hadith context, not a paraphrase."
  },
  {
    "id": "dua-istikharah",
    "title": "Dua of Istikharah — Seeking Guidance",
    "arabic": "اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ فَإِنَّكَ تَقْدِرُ وَلَا أَقْدِرُ وَتَعْلَمُ وَلَا أَعْلَمُ وَأَنْتَ عَلَّامُ الْغُيُوبِ اللَّهُمَّ إِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الْأَمْرَ خَيْرٌ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي فَاقْدُرْهُ لِي وَيَسِّرْهُ لِي ثُمَّ بَارِكْ لِي فِيهِ وَإِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الْأَمْرَ شَرٌّ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي فَاصْرِفْهُ عَنِّي وَاصْرِفْنِي عَنْهُ وَاقْدُرْ لِيَ الْخَيْرَ حَيْثُ كَانَ ثُمَّ أَرْضِنِي بِهِ",
    "transliteration": "Allahumma inni astakhiruka bi 'ilmika, wa astaqdiruka bi qudratika, wa as'aluka min fadlika al-'azim, fa innaka taqdiru wa la aqdiru, wa ta'lamu wa la a'lamu, wa anta 'allamu al-ghuyub. Allahumma in kunta ta'lamu anna hadha al-amra khayrun li fi dini wa ma'ashi wa 'aqibati amri, faqdurhu li wa yassirhu li thumma barik li fihi. Wa in kunta ta'lamu anna hadha al-amra sharrun li fi dini wa ma'ashi wa 'aqibati amri, fasrifhu 'anni wasrifni 'anhu, waqdur li al-khayra haythu kana thumma ardini bih",
    "translation": "O Allah, I seek Your guidance by virtue of Your knowledge, and I seek ability by virtue of Your power, and I ask You of Your great bounty. You have power and I have none. You know and I do not. You are the Knower of hidden things. O Allah, if in Your knowledge this matter is good for me in my religion, my livelihood, and the outcome of my affair, then decree it for me, make it easy for me, and bless me in it. But if in Your knowledge this matter is bad for me in my religion, my livelihood, and the outcome of my affair, then turn it away from me, and turn me away from it, and decree for me what is good wherever it may be, and make me content with it.",
    "source_full": "Sahih al-Bukhari 1166",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 324,
    "categories": [
      "indecisive",
      "confused"
    ],
    "keywords": [
      "istikharah",
      "guidance",
      "decision",
      "prayer"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": "Traditionally recited after two voluntary rak'ahs with the specific matter named aloud where the text says 'this matter' — consider a UI note on the detail screen at some point, not required for this data pass."
  },
  {
    "id": "radhitu-billahi-rabba",
    "title": "Radhitu Billahi Rabba — I Am Content",
    "arabic": "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
    "transliteration": "Radhitu billahi rabba, wa bil-islami dinan, wa bi-Muhammadin sallallahu 'alayhi wa sallama nabiyya",
    "translation": "I am content with Allah as my Lord, Islam as my religion, and Muhammad ﷺ as my Prophet.",
    "source_full": "Sunan Abi Dawud 1529 · also Jami' at-Tirmidhi 3389 (hasan gharib)",
    "authenticity": "hasan",
    "stage": null,
    "stage_order": 325,
    "categories": [
      "content"
    ],
    "keywords": [
      "contentment",
      "satisfaction",
      "acceptance",
      "morning evening"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": null
  },
  {
    "id": "ahyini-ma-kanat",
    "title": "The Patient's Wish",
    "arabic": "اللَّهُمَّ أَحْيِنِي مَا كَانَتِ الْحَيَاةُ خَيْرًا لِي، وَتَوَفَّنِي إِذَا كَانَتِ الْوَفَاةُ خَيْرًا لِي",
    "transliteration": "Allahumma ahyini ma kanatil-hayatu khayran li, wa tawaffani idha kanatil-wafatu khayran li",
    "translation": "O Allah, keep me alive as long as life is good for me, and cause me to die when death is better for me.",
    "source_full": "Sahih al-Bukhari 5671 · Sahih Muslim 2680 (Muttafaqun 'Alayhi)",
    "authenticity": "sahih",
    "stage": null,
    "stage_order": 327,
    "categories": [
      "depressed",
      "sad"
    ],
    "keywords": [
      "hardship",
      "wish",
      "patience",
      "trust"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": null
  },
  {
    "id": "rabbana-zalamna",
    "title": "Rabbana Zalamna Anfusana — Adam & Hawwa's Repentance",
    "arabic": "رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",
    "transliteration": "Rabbana zalamna anfusana, wa in lam taghfir lana wa tarhamna lanakunanna minal-khasirin",
    "translation": "Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers.",
    "source_full": "Qur'an 7:23",
    "authenticity": "quran",
    "stage": null,
    "stage_order": 329,
    "categories": [
      "regret",
      "guilty"
    ],
    "keywords": [
      "adam",
      "hawwa",
      "repentance",
      "forgiveness"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": null
  },
  {
    "id": "afini-fi-badani",
    "title": "Health in Body, Hearing, and Sight",
    "arabic": "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ",
    "transliteration": "Allahumma 'afini fi badani, Allahumma 'afini fi sam'i, Allahumma 'afini fi basari, la ilaha illa ant",
    "translation": "O Allah, grant health to my body. O Allah, grant health to my hearing. O Allah, grant health to my sight. There is no god but You.",
    "source_full": "Sunan Abi Dawud 5090",
    "authenticity": "hasan",
    "stage": null,
    "stage_order": 330,
    "categories": [
      "tired",
      "weak"
    ],
    "keywords": [
      "health",
      "afiyah",
      "morning",
      "evening"
    ],
    "is_featured": false,
    "audio_traditional": null,
    "audio_gentle": null,
    "verified": false,
    "verified_by": "",
    "verified_date": "",
    "source_page": "",
    "review_flag": null
  }
];
