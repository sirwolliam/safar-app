/**
 * quizData.js — Safar
 * Static question bank for the Practice quiz feature.
 * Same pattern as duas-data.js — content authored here, not user-generated.
 *
 * Each topic has an id, title, description, icon (Phosphor name), and an
 * array of questions. Each question has the question text, four choices,
 * the index of the correct choice (0-based), and a brief explanation
 * shown after answering.
 *
 * Content note: v1 topics are deliberately limited to safely factual
 * material — sequence, vocabulary, counts, key duas. Fiqh-adjacent
 * questions (what invalidates Ihram, permissibility rulings) are deferred
 * because they carry real cross-madhab variation that a single graded
 * "correct answer" can't represent honestly. See the session conversation
 * for the full reasoning.
 */

export const QUIZ_TOPICS = [
  {
    id: "umrah-stages",
    title: "Stages of Umrah",
    description: "Test your knowledge of the Umrah pilgrimage sequence",
    icon: "Mosque",
    questions: [
      {
        id: "us1",
        question: "What is the first step a pilgrim must complete before entering Makkah for Umrah?",
        choices: ["Tawaf", "Ihram", "Sa'y", "Halq"],
        correct: 1,
        explanation: "Ihram is the sacred state a pilgrim enters before crossing the Miqat. It involves making the intention (niyyah) and wearing the prescribed garments.",
      },
      {
        id: "us2",
        question: "What is the Miqat?",
        choices: [
          "The black stone on the Kaaba",
          "The well of Zamzam",
          "A designated boundary point where Ihram must be assumed",
          "The area between Safa and Marwa",
        ],
        correct: 2,
        explanation: "The Miqat is a set of boundary points around Makkah. Pilgrims must enter the state of Ihram before crossing these points.",
      },
      {
        id: "us3",
        question: "How many times does a pilgrim circle the Kaaba during Tawaf?",
        choices: ["3 times", "5 times", "7 times", "9 times"],
        correct: 2,
        explanation: "Tawaf consists of seven complete circuits around the Kaaba, moving counter-clockwise with the Kaaba on your left.",
      },
      {
        id: "us4",
        question: "In which direction do pilgrims walk during Tawaf?",
        choices: ["Clockwise", "Counter-clockwise", "Alternating directions", "Any direction"],
        correct: 1,
        explanation: "Pilgrims move counter-clockwise (anti-clockwise) around the Kaaba, keeping the Kaaba to their left side.",
      },
      {
        id: "us5",
        question: "What are the two hills between which Sa'y is performed?",
        choices: ["Arafat and Muzdalifah", "Safa and Marwa", "Hira and Thawr", "Mina and Arafat"],
        correct: 1,
        explanation: "Sa'y is the walking (and partial running) between the hills of Safa and Marwa, commemorating Hajar's search for water for her son Ismail.",
      },
      {
        id: "us6",
        question: "How many times does a pilgrim walk between Safa and Marwa during Sa'y?",
        choices: ["3 times", "5 times", "7 times", "9 times"],
        correct: 2,
        explanation: "Sa'y consists of seven laps: Safa to Marwa is one lap, Marwa back to Safa is a second, and so on, ending at Marwa.",
      },
      {
        id: "us7",
        question: "What marks the completion of Umrah after Sa'y?",
        choices: [
          "Drinking Zamzam water",
          "Praying two rakat at Maqam Ibrahim",
          "Halq (shaving) or Taqsir (trimming) of the hair",
          "Returning to the Miqat",
        ],
        correct: 2,
        explanation: "After completing Sa'y, men shave (Halq) or trim (Taqsir) their hair, and women trim a small portion. This exits the state of Ihram and completes the Umrah.",
      },
      {
        id: "us8",
        question: "What is the correct order of the main stages of Umrah?",
        choices: [
          "Sa'y → Tawaf → Ihram → Halq",
          "Tawaf → Sa'y → Ihram → Halq",
          "Ihram → Tawaf → Sa'y → Halq/Taqsir",
          "Ihram → Sa'y → Tawaf → Halq/Taqsir",
        ],
        correct: 2,
        explanation: "The correct sequence is: enter Ihram at the Miqat, perform Tawaf around the Kaaba, perform Sa'y between Safa and Marwa, then Halq or Taqsir to exit Ihram.",
      },
      {
        id: "us9",
        question: "What prayer is recommended after completing Tawaf, before beginning Sa'y?",
        choices: [
          "Salat al-Istikhara",
          "Two rakat behind Maqam Ibrahim",
          "Salat al-Janazah",
          "Four rakat of Sunnah",
        ],
        correct: 1,
        explanation: "It is Sunnah to pray two rakat behind Maqam Ibrahim (the Station of Ibrahim) after completing Tawaf, before proceeding to Sa'y.",
      },
      {
        id: "us10",
        question: "What is Zamzam water traditionally drunk after during Umrah?",
        choices: [
          "Before entering Ihram",
          "After Tawaf and the two rakat prayer",
          "During Sa'y only",
          "Only after Halq",
        ],
        correct: 1,
        explanation: "Pilgrims traditionally drink Zamzam water after completing Tawaf and praying the two rakat, before beginning Sa'y. However, it can be drunk at any time.",
      },
    ],
  },
  {
    id: "hajj-stages",
    title: "Stages of Hajj",
    description: "The five days of Hajj and their key rituals",
    icon: "MapPin",
    questions: [
      {
        id: "hj1",
        question: "On which Islamic date do pilgrims assume Ihram and travel to Mina to begin Hajj?",
        choices: [
          "7th of Dhul-Hijjah",
          "8th of Dhul-Hijjah",
          "9th of Dhul-Hijjah",
          "10th of Dhul-Hijjah",
        ],
        correct: 1,
        explanation: "Hajj begins on the 8th of Dhul-Hijjah, known as Yawm al-Tarwiyah (Day of Tarwiyah). Pilgrims assume Ihram, travel to Mina, and spend the day and night there.",
      },
      {
        id: "hj2",
        question: "What is the 8th of Dhul-Hijjah called in the context of Hajj?",
        choices: [
          "Yawm al-Nahr",
          "Yawm al-Arafah",
          "Yawm al-Tarwiyah",
          "Yawm al-Qiyamah",
        ],
        correct: 2,
        explanation: "The 8th of Dhul-Hijjah is Yawm al-Tarwiyah (the Day of Watering). Pilgrims proceed to Mina after assuming Ihram and remain there until the morning of the 9th.",
      },
      {
        id: "hj3",
        question: "On which date does the Wuquf — the standing at Arafat — take place?",
        choices: [
          "8th of Dhul-Hijjah",
          "9th of Dhul-Hijjah",
          "10th of Dhul-Hijjah",
          "11th of Dhul-Hijjah",
        ],
        correct: 1,
        explanation: "The Wuquf at Arafat is the central pillar of Hajj and takes place on the 9th of Dhul-Hijjah, also known as Yawm al-Arafah. The Prophet (peace be upon him) said: 'Hajj is Arafah.'",
      },
      {
        id: "hj4",
        question: "After leaving Arafat at sunset on the 9th, where do pilgrims travel next?",
        choices: [
          "Directly to Makkah for Tawaf al-Ifadah",
          "Back to Mina to rest",
          "Muzdalifah",
          "Straight to the Jamarat",
        ],
        correct: 2,
        explanation: "After the Wuquf at Arafat, pilgrims travel to Muzdalifah. There they pray Maghrib and Isha combined, spend the night under the open sky, and collect pebbles for the Rami.",
      },
      {
        id: "hj5",
        question: "How many pebbles does a pilgrim throw at Jamarat al-Aqabah on the 10th of Dhul-Hijjah?",
        choices: ["3", "5", "7", "21"],
        correct: 2,
        explanation: "On the 10th of Dhul-Hijjah, the day of Eid al-Adha, pilgrims throw exactly 7 pebbles at Jamarat al-Aqabah only. All three Jamarat are stoned on the days of Tashreeq that follow.",
      },
      {
        id: "hj6",
        question: "Which Jamarah is stoned alone on the 10th of Dhul-Hijjah?",
        choices: [
          "Jamarat al-Sughra (the Small)",
          "Jamarat al-Wusta (the Middle)",
          "Jamarat al-Aqabah (the Large)",
          "All three are stoned on the 10th",
        ],
        correct: 2,
        explanation: "Only Jamarat al-Aqabah — the largest of the three pillars, closest to Makkah — is stoned on the 10th. On the days of Tashreeq (11th–13th), all three Jamarat are stoned in order from smallest to largest.",
      },
      {
        id: "hj7",
        question: "What is the preferred sequence of major rituals on the 10th of Dhul-Hijjah?",
        choices: [
          "Tawaf → Rami → Qurbani → Halq",
          "Qurbani → Rami → Halq → Tawaf al-Ifadah",
          "Rami → Qurbani → Halq/Taqsir → Tawaf al-Ifadah",
          "Halq → Rami → Tawaf al-Ifadah → Qurbani",
        ],
        correct: 2,
        explanation: "The preferred order on the 10th is: Rami at Jamarat al-Aqabah, then Qurbani (animal sacrifice), then Halq or Taqsir (hair), then Tawaf al-Ifadah and Sa'y. This order follows the Prophet's practice.",
      },
      {
        id: "hj8",
        question: "Tawaf al-Ifadah is also known by which other name?",
        choices: [
          "Tawaf al-Qudum (Arrival Tawaf)",
          "Tawaf al-Wada (Farewell Tawaf)",
          "Tawaf al-Ziyarah (Visitation Tawaf)",
          "Tawaf al-Nafilah (Voluntary Tawaf)",
        ],
        correct: 2,
        explanation: "Tawaf al-Ifadah is also called Tawaf al-Ziyarah (the Tawaf of Visitation). It is a pillar (rukn) of Hajj performed on or after the 10th of Dhul-Hijjah, and Hajj is incomplete without it.",
      },
      {
        id: "hj9",
        question: "Which days are called the Days of Tashreeq?",
        choices: [
          "7th, 8th, and 9th of Dhul-Hijjah",
          "8th, 9th, and 10th of Dhul-Hijjah",
          "11th, 12th, and 13th of Dhul-Hijjah",
          "10th, 11th, and 12th of Dhul-Hijjah",
        ],
        correct: 2,
        explanation: "The Days of Tashreeq are the 11th, 12th, and 13th of Dhul-Hijjah. Pilgrims remain in Mina and perform Rami at all three Jamarat each day. Pilgrims who leave after the 12th perform only two days of Tashreeq.",
      },
      {
        id: "hj10",
        question: "How many pebbles does a pilgrim throw in total across all three Jamarat on each day of Tashreeq?",
        choices: ["7", "14", "21", "49"],
        correct: 2,
        explanation: "On each day of Tashreeq, 7 pebbles are thrown at each of the three Jamarat (Sughra, Wusta, then Aqabah), totalling 21 pebbles per day. A pilgrim who completes all three days of Tashreeq throws 49 pebbles after the 10th.",
      },
    ],
  },
  {
    id: "key-duas",
    title: "Key Duas",
    description: "Essential supplications for Hajj and Umrah",
    icon: "HandHeart",
    questions: [
      {
        id: "kd1",
        question: "With which Arabic phrase does the Talbiyah begin?",
        choices: [
          "Subhanallahi wa bihamdihi",
          "Labbayk Allahumma labbayk",
          "Bismillah ir-rahman ir-raheem",
          "Allahu Akbar kabeera",
        ],
        correct: 1,
        explanation: "The Talbiyah begins 'Labbayk Allahumma labbayk' — 'Here I am, O Allah, here I am.' It is the defining declaration of the pilgrim in Ihram, expressing readiness and submission to Allah's call.",
      },
      {
        id: "kd2",
        question: "At what point during Hajj does a pilgrim stop reciting the Talbiyah?",
        choices: [
          "Upon first sighting the Kaaba",
          "After completing Tawaf al-Ifadah",
          "When throwing the first pebble at Jamarat al-Aqabah on the 10th",
          "After the standing at Arafat",
        ],
        correct: 2,
        explanation: "The Talbiyah is recited continuously from assuming Ihram until the pilgrim throws the first pebble at Jamarat al-Aqabah on the 10th of Dhul-Hijjah. At that point the Talbiyah stops and the takbeer (Allahu Akbar) begins.",
      },
      {
        id: "kd3",
        question: "What is the special significance of the moment a pilgrim first sees the Kaaba in terms of supplication?",
        choices: [
          "The Talbiyah must be recited loudly three times",
          "It is among the moments when dua is especially accepted, and the pilgrim raises their hands and makes sincere supplication",
          "The pilgrim must begin Tawaf immediately without pausing",
          "A specific fixed dua must be recited in Arabic only",
        ],
        correct: 1,
        explanation: "Upon first beholding the Kaaba, the pilgrim raises their hands and makes heartfelt supplication. This moment is among the times when dua is considered especially likely to be answered. The sight of the Kaaba itself is regarded as an act of worship.",
      },
      {
        id: "kd4",
        question: "What is said when touching or gesturing toward the Black Stone at the start of each circuit of Tawaf?",
        choices: [
          "Subhanallah",
          "Allahumma imanan bika wa tasdiqan bi-kitabika",
          "Bismillah, Allahu Akbar",
          "La ilaha illallah wahdah",
        ],
        correct: 2,
        explanation: "When beginning each circuit of Tawaf by touching or gesturing toward the Black Stone, the pilgrim says 'Bismillah, Allahu Akbar' — 'In the name of Allah, Allah is the Greatest.'",
      },
      {
        id: "kd5",
        question: "Which Quranic supplication is recommended in the stretch between the Yemeni Corner and the Black Stone during Tawaf?",
        choices: [
          "Inna lillahi wa inna ilayhi raji'un",
          "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina adhab an-nar",
          "Labbayk Allahumma labbayk",
          "Allahu Akbar walillahil hamd",
        ],
        correct: 1,
        explanation: "'Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina adhab an-nar' — 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire' (Quran 2:201). This is the recommended dua between the Yemeni Corner and the Black Stone.",
      },
      {
        id: "kd6",
        question: "The Prophet (peace be upon him) described the best dua as that of which day?",
        choices: [
          "The 10th of Dhul-Hijjah (Eid al-Adha)",
          "The 27th of Ramadan (Laylat al-Qadr)",
          "The Day of Arafah (9th of Dhul-Hijjah)",
          "The first Friday of Dhul-Hijjah",
        ],
        correct: 2,
        explanation: "The Prophet (peace be upon him) said: 'The best supplication is that of the Day of Arafah, and the best that I and the prophets before me have said is: La ilaha illallahu wahdahu la shareeka lah, lahul mulku wa lahul hamdu wa huwa ala kulli shay'in qadeer.'",
      },
      {
        id: "kd7",
        question: "What specific dhikr is said with each of the seven pebbles thrown during Rami at the Jamarat?",
        choices: [
          "La ilaha illallah",
          "Bismillah",
          "Allahu Akbar",
          "SubhanAllah",
        ],
        correct: 2,
        explanation: "With each pebble thrown at the Jamarat, the pilgrim says 'Allahu Akbar' — 'Allah is the Greatest.' This is the prescribed dhikr for each of the 7 throws.",
      },
      {
        id: "kd8",
        question: "What did the Prophet (peace be upon him) say about the intention when drinking Zamzam water?",
        choices: [
          "One should only drink it with the intention of entering Ihram",
          "Zamzam water is for whatever it is drunk for — the pilgrim should make dua for their specific need",
          "Reciting Ayat al-Kursi three times before drinking is obligatory",
          "There is no recorded teaching about intention when drinking Zamzam",
        ],
        correct: 1,
        explanation: "The Prophet (peace be upon him) said: 'Zamzam water is for whatever it is drunk for (li-ma shuriba lahu).' Pilgrims make a sincere supplication for health, knowledge, forgiveness, or any need before or while drinking.",
      },
      {
        id: "kd9",
        question: "Which Quranic verse is recited upon ascending Safa before beginning Sa'y?",
        choices: [
          "Inna Allaha wa mala'ikatahu yusalluna alan-nabi...",
          "Inna as-Safa wal-Marwata min sha'airillah...",
          "Subhana rabbika rabbil izzati amma yasifun...",
          "Qul huwa Allahu ahad...",
        ],
        correct: 1,
        explanation: "'Inna as-Safa wal-Marwata min sha'airillah' — 'Indeed, Safa and Marwa are among the symbols of Allah' (Quran 2:158). This verse is recited when the pilgrim first ascends Safa and faces the direction of the Kaaba before beginning Sa'y.",
      },
      {
        id: "kd10",
        question: "What is the Multazam, and what is it known for in terms of supplication?",
        choices: [
          "The covered walkway between Safa and Marwa, where pilgrims recite dhikr",
          "The section of the Kaaba wall between the Black Stone and the Kaaba door, where dua is especially accepted",
          "The top of Mount Safa where the prophet Ibrahim called to pilgrimage",
          "The stone enclosure around Maqam Ibrahim",
        ],
        correct: 1,
        explanation: "The Multazam is the roughly two-meter section of the Kaaba wall between the Black Stone and the Kaaba's door. Pilgrims press their chest and hands against it and make heartfelt supplication, as this place is traditionally considered especially receptive to dua.",
      },
    ],
  },
  {
    id: "sacred-places",
    title: "Sacred Places",
    description: "Know the landmarks of Makkah and Madinah",
    icon: "Mosque",
    questions: [
      {
        id: "sp1",
        question: "What is the Maqam Ibrahim?",
        choices: [
          "The tomb of the Prophet Ibrahim located near Makkah",
          "The mountain where Ibrahim received his revelations",
          "A stone bearing the imprint of Prophet Ibrahim's feet, enclosed near the Kaaba",
          "The gate through which Ibrahim first entered Makkah",
        ],
        correct: 2,
        explanation: "Maqam Ibrahim (the Station of Ibrahim) is a stone that traditionally bears the footprint of the Prophet Ibrahim from when he stood on it while building the Kaaba. It is now enclosed in a golden case near the Kaaba. Pilgrims pray two rakat behind it after Tawaf.",
      },
      {
        id: "sp2",
        question: "What is the Hijr Ismail?",
        choices: [
          "The well dug by Ismail that became Zamzam",
          "A semicircular walled area on the northwest side of the Kaaba, considered part of the original Kaaba",
          "The mountain where Ibrahim and Ismail laid the original foundations",
          "The name for the space between the Kaaba and Maqam Ibrahim",
        ],
        correct: 1,
        explanation: "The Hijr Ismail (also called the Hateem) is the semicircular low wall on the northwest side of the Kaaba. Islamic tradition holds it to be part of the original Kaaba structure. Praying inside it is considered equivalent to praying inside the Kaaba itself.",
      },
      {
        id: "sp3",
        question: "What is the approximate distance between the hills of Safa and Marwa?",
        choices: [
          "About 150 meters",
          "About 250 meters",
          "About 450 meters",
          "About 800 meters",
        ],
        correct: 2,
        explanation: "The distance between Safa and Marwa is approximately 450 meters. Pilgrims walk this distance seven times during Sa'y, covering roughly 3.15 kilometers in total.",
      },
      {
        id: "sp4",
        question: "Mount Arafat is also widely known by which other name?",
        choices: [
          "Jabal al-Nour",
          "Jabal al-Rahma (the Mount of Mercy)",
          "Jabal Thawr",
          "Jabal Uhud",
        ],
        correct: 1,
        explanation: "Mount Arafat is also called Jabal al-Rahma — the Mountain of Mercy. The Prophet (peace be upon him) delivered his Farewell Sermon on this plain. It is the site of the Wuquf on the 9th of Dhul-Hijjah, the central pillar of Hajj.",
      },
      {
        id: "sp5",
        question: "The plain of Mina is primarily known during Hajj as the location of:",
        choices: [
          "The Wuquf (standing) on the Day of Arafah",
          "The three Jamarat pillars where Rami is performed",
          "Tawaf al-Ifadah",
          "The Zamzam well",
        ],
        correct: 1,
        explanation: "Mina, located about 5km from the Masjid al-Haram, is the plain containing the three Jamarat pillars. Pilgrims stay here during the nights of Tashreeq and perform Rami each day. It is often called the City of Tents due to the vast tent camps erected for pilgrims.",
      },
      {
        id: "sp6",
        question: "Muzdalifah lies between which two locations?",
        choices: [
          "Makkah and Mina",
          "Mina and Arafat",
          "Arafat and Makkah",
          "Mina and Madinah",
        ],
        correct: 1,
        explanation: "Muzdalifah is an open plain situated between Mina and Arafat. After the Wuquf on the 9th of Dhul-Hijjah, pilgrims travel there, pray Maghrib and Isha combined, spend the night, and collect pebbles for the Rami.",
      },
      {
        id: "sp7",
        question: "In Masjid an-Nabawi in Madinah, what does the Rawdah refer to?",
        choices: [
          "The main courtyard surrounding the mosque",
          "The area between the Prophet's pulpit (minbar) and his tomb",
          "The green dome above the Prophet's grave",
          "The women's prayer section at the rear of the mosque",
        ],
        correct: 1,
        explanation: "The Rawdah (the Garden) is the area between the Prophet's minbar (pulpit) and his blessed tomb. The Prophet (peace be upon him) said: 'Between my house and my pulpit is a garden from the gardens of Paradise.' Pilgrims and visitors seek to pray and make dua here.",
      },
      {
        id: "sp8",
        question: "What are the three Jamarat pillars called, listed from smallest to largest?",
        choices: [
          "Al-Awal, al-Thani, al-Thalith",
          "Al-Sughra, al-Wusta, and al-Aqabah (al-Kubra)",
          "Jamarat Ibrahim, Ismail, and Muhammad",
          "Al-Sagheer, al-Kabeer, al-Akbar",
        ],
        correct: 1,
        explanation: "The three Jamarat are al-Jamarat al-Sughra (the Small), al-Jamarat al-Wusta (the Middle), and al-Jamarat al-Aqabah, also known as al-Kubra (the Great). On the days of Tashreeq they are stoned in order from Sughra to Aqabah.",
      },
      {
        id: "sp9",
        question: "The Multazam is which part of the Kaaba?",
        choices: [
          "The covered walkway encircling the Kaaba",
          "The section of wall between the Black Stone and the Kaaba's door",
          "The stone enclosure around Maqam Ibrahim",
          "The area directly in front of the Kaaba door reserved for the Imam",
        ],
        correct: 1,
        explanation: "The Multazam is the approximately two-meter section of the Kaaba wall between the Black Stone (al-Hajar al-Aswad) and the door of the Kaaba. Pilgrims press their chest, face, and palms against it in supplication.",
      },
      {
        id: "sp10",
        question: "Jabal al-Nour, located near Makkah, is significant because it contains:",
        choices: [
          "The spring of Zamzam in its base",
          "The Cave of Hira, where the Prophet received the first Quranic revelation",
          "The grave of the Prophet Ibrahim",
          "The original site of the Kaaba before it was moved to al-Masjid al-Haram",
        ],
        correct: 1,
        explanation: "Jabal al-Nour (the Mountain of Light) is located about 3km from Masjid al-Haram. It contains the Cave of Hira (Ghar Hira), where the Prophet Muhammad (peace be upon him) received the first revelation through the Angel Jibreel: the opening verses of Surah al-Alaq.",
      },
    ],
  },
];

export function getTopicById(id) {
  return QUIZ_TOPICS.find(t => t.id === id) ?? null;
}
