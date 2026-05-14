/**
 * audio-generation-script.js — Safar
 *
 * Run this script ONCE from your computer to generate all dua audio files
 * using ElevenLabs API. Files are saved to assets/audio/
 *
 * Setup:
 *   1. npm install elevenlabs dotenv
 *   2. Create .env with ELEVENLABS_API_KEY=your_key_here
 *   3. node audio-generation-script.js
 *
 * Two voices:
 *   - Traditional: measured, clear, reverent — for adult use
 *   - Gentle:      slower, warmer, softer — for children / elderly / beginners
 *
 * ElevenLabs voice IDs — Arabic (MSA):
 *   Browse at: elevenlabs.io/voice-library (filter: Arabic)
 *   Recommended Arabic voices to test:
 *     - "Hamid"  — deep, clear, traditional recitation feel
 *     - "Tariq"  — warm, measured
 *   Replace VOICE_TRADITIONAL and VOICE_GENTLE below after testing.
 */

require("dotenv").config();
const { ElevenLabsClient } = require("elevenlabs");
const fs   = require("fs");
const path = require("path");

const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });

// ── Voice config ──────────────────────────────────────────────────────────────
// Replace these with voice IDs from ElevenLabs Voice Library after testing
const VOICE_TRADITIONAL = "pNInz6obpgDQGcFmaJgB"; // placeholder — test and replace
const VOICE_GENTLE      = "EXAVITQu4vr4xnSDxMaL"; // placeholder — test and replace

const MODEL = "eleven_multilingual_v2";

const VOICE_SETTINGS_TRADITIONAL = {
  stability:        0.75,  // consistent, clear
  similarity_boost: 0.85,
  style:            0.15,  // minimal style variation — reverent, not dramatic
  use_speaker_boost: true,
};

const VOICE_SETTINGS_GENTLE = {
  stability:        0.85,  // very consistent
  similarity_boost: 0.80,
  style:            0.05,  // very calm, gentle
  use_speaker_boost: true,
};

// ── All duas with Arabic text ─────────────────────────────────────────────────

const DUAS = [
  // ── Ihram & Entry
  {
    id: "niyyah-umrah",
    title: "Intention for Umrah",
    arabic: "لَبَّيْكَ اللَّهُمَّ عُمْرَةً",
  },
  {
    id: "niyyah-hajj",
    title: "Intention for Hajj",
    arabic: "لَبَّيْكَ اللَّهُمَّ حَجًّا",
  },
  {
    id: "talbiyah",
    title: "Talbiyah",
    arabic: "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ",
  },
  {
    id: "entering-haram",
    title: "Entering Masjid al-Haram",
    arabic: "بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ اغْفِرْ لِي ذُنُوبِي وَافْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
  },
  {
    id: "first-sight-kaaba",
    title: "First Sight of the Kaaba",
    arabic: "اللَّهُمَّ زِدْ هَذَا الْبَيْتَ تَشْرِيفًا وَتَعْظِيمًا وَتَكْرِيمًا وَمَهَابَةً، وَزِدْ مَنْ شَرَّفَهُ وَكَرَّمَهُ مِمَّنْ حَجَّهُ أَوِ اعْتَمَرَهُ تَشْرِيفًا وَتَكْرِيمًا وَتَعْظِيمًا وَبِرًّا",
  },

  // ── Tawaf
  {
    id: "tawaf-start",
    title: "Beginning Tawaf (at Black Stone)",
    arabic: "بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ، اللَّهُمَّ إِيمَانًا بِكَ وَتَصْدِيقًا بِكِتَابِكَ وَوَفَاءً بِعَهْدِكَ وَاتِّبَاعًا لِسُنَّةِ نَبِيِّكَ مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ",
  },
  {
    id: "tawaf-yemeni-corner",
    title: "Between Yemeni Corner and Black Stone",
    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
  },
  {
    id: "maqam-ibrahim",
    title: "At Maqam Ibrahim",
    arabic: "وَاتَّخِذُوا مِنْ مَقَامِ إِبْرَاهِيمَ مُصَلًّى",
  },
  {
    id: "zamzam",
    title: "Drinking Zamzam",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا وَاسِعًا وَشِفَاءً مِنْ كُلِّ دَاءٍ",
  },

  // ── Saʿy
  {
    id: "safa-start",
    title: "Upon Ascending Safa",
    arabic: "إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ، أَبْدَأُ بِمَا بَدَأَ اللَّهُ بِهِ",
  },
  {
    id: "safa-dua",
    title: "Dua at Safa",
    arabic: "اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
  },
  {
    id: "marwah-dua",
    title: "Dua at Marwah",
    arabic: "اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ وَلِلَّهِ الْحَمْدُ",
  },

  // ── Hajj specific
  {
    id: "arafah",
    title: "Dua at Arafah",
    arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
  },
  {
    id: "muzdalifah",
    title: "Arriving at Muzdalifah",
    arabic: "اللَّهُمَّ إِنَّ هَذِهِ مُزْدَلِفَةُ، جُمِعَتْ فِيهَا أَلْسِنَةٌ مُخْتَلِفَةٌ تَسْأَلُكَ حَوَائِجَ مُتَبَايِنَةً، فَاجْعَلْنِي مِمَّنْ دَعَاكَ فَاسْتَجَبْتَ لَهُ",
  },
  {
    id: "jamarat",
    title: "Stoning the Jamarat",
    arabic: "بِسْمِ اللَّهِ، اللَّهُ أَكْبَرُ، رَغْمًا لِلشَّيْطَانِ وَحِزْبِهِ",
  },

  // ── General / closing
  {
    id: "farewell-tawaf",
    title: "Farewell Tawaf",
    arabic: "اللَّهُمَّ إِنَّ هَذَا الْبَيْتَ بَيْتُكَ وَالْعَبْدَ عَبْدُكَ وَابْنُ عَبْدِكَ وَابْنُ أَمَتِكَ، حَمَلْتَنِي عَلَى مَا سَخَّرْتَ لِي مِنْ خَلْقِكَ",
  },
  {
    id: "leaving-haram",
    title: "Leaving Masjid al-Haram",
    arabic: "بِسْمِ اللَّهِ وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
  },
];

// ── Output directories ────────────────────────────────────────────────────────

const OUT_TRADITIONAL = path.join(__dirname, "assets/audio/traditional");
const OUT_GENTLE      = path.join(__dirname, "assets/audio/gentle");

[OUT_TRADITIONAL, OUT_GENTLE].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ── Generate function ─────────────────────────────────────────────────────────

async function generateAudio(dua, voiceId, settings, outputDir) {
  const filePath = path.join(outputDir, `${dua.id}.mp3`);

  // Skip if already generated
  if (fs.existsSync(filePath)) {
    console.log(`  ✓ Already exists: ${dua.id}`);
    return;
  }

  try {
    const audio = await client.textToSpeech.convert(voiceId, {
      text: dua.arabic,
      model_id: MODEL,
      voice_settings: settings,
      output_format: "mp3_44100_128",
    });

    // Stream to file
    const chunks = [];
    for await (const chunk of audio) chunks.push(chunk);
    fs.writeFileSync(filePath, Buffer.concat(chunks));
    console.log(`  ✓ Generated: ${dua.id}`);

    // Small delay to respect rate limits
    await new Promise((r) => setTimeout(r, 500));
  } catch (err) {
    console.error(`  ✗ Failed: ${dua.id} — ${err.message}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nGenerating ${DUAS.length} duas × 2 voices = ${DUAS.length * 2} files\n`);

  console.log("── Traditional voice ─────────────────────────────────────");
  for (const dua of DUAS) {
    await generateAudio(dua, VOICE_TRADITIONAL, VOICE_SETTINGS_TRADITIONAL, OUT_TRADITIONAL);
  }

  console.log("\n── Gentle voice ──────────────────────────────────────────");
  for (const dua of DUAS) {
    await generateAudio(dua, VOICE_GENTLE, VOICE_SETTINGS_GENTLE, OUT_GENTLE);
  }

  console.log("\n✓ All done. Files saved to assets/audio/");
  console.log("  traditional/ — measured, clear, adult recitation");
  console.log("  gentle/      — slower, warmer, for children & beginners\n");
}

main().catch(console.error);
