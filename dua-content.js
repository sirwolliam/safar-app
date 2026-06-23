/**
 * dua-content.js — Safar  (ADAPTER)
 * -----------------------------------------------------------------------------
 * Reads the normalized master (duas-data.js) and exposes it in the exact shape
 * the screens already use. Screens and DuaCard need NO changes.
 *
 * KEY BEHAVIOURS
 *  - Categories are built from each dua's `categories` tag array (NOT faked
 *    stage-filters). One dua can appear in several categories.
 *  - Pilgrimage lists (umrah/hajj) are built from `stage`.
 *  - Field names are mapped to what DuaCard expects: source_full→source,
 *    is_featured→isFeatured.
 *  - The `verified` gate decides what users see. SHOW_UNVERIFIED=true during
 *    development so categories populate; set false for a shippable build so
 *    only scholar-approved duas appear.
 */

import { DUAS_DATA } from "./duas-data";

// ── Dev toggle ────────────────────────────────────────────────────────────────
// true  → show every dua (dev: watch categories fill up)
// false → show ONLY verified:true duas (ship-safe; "scholar-verified" enforced)
export const SHOW_UNVERIFIED = true;

// ── Map normalized entry → screen/DuaCard field names ────────────────────────
function adapt(d) {
  return {
    id: d.id,
    title: d.title,
    stage: d.stage || undefined,
    arabic: d.arabic,
    transliteration: d.transliteration,
    translation: d.translation,
    source: d.source_full,            // DuaCard reads dua.source
    isFeatured: !!d.is_featured,      // DuaCard reads dua.isFeatured
    categories: d.categories || [],
    keywords: d.keywords || [],
    authenticity: d.authenticity,
    verified: !!d.verified,
    reviewFlag: d.review_flag || null,
  };
}

// Visible pool, honouring the verified gate
const VISIBLE = DUAS_DATA.filter((d) => SHOW_UNVERIFIED || d.verified).map(adapt);

// ── Canonical exports the TDD references ─────────────────────────────────────
export const DUAS = VISIBLE;

export const STAGES = [
  "Ihram", "Entry", "Tawaf", "Zamzam", "Saʿy", "Maqam",
  "Arafah", "Muzdalifah", "Jamarat", "Farewell", "Madinah",
];

export function getDuasByStage(stage) {
  return DUAS.filter((d) => d.stage === stage);
}
export function getFeaturedDuas() {
  return DUAS.filter((d) => d.isFeatured);
}
export function getDuaById(id) {
  return DUAS.find((d) => d.id === id);
}

// Helper: every dua carrying a given category tag
function byTag(tag) {
  return DUAS.filter((d) => d.categories.includes(tag));
}
// Helper: pilgrimage subsets by stage membership
function byStages(stageList) {
  return DUAS.filter((d) => d.stage && stageList.includes(d.stage));
}

const UMRAH_STAGES = ["Ihram", "Entry", "Tawaf", "Zamzam", "Saʿy", "Farewell"];
const HAJJ_STAGES = [
  "Ihram", "Entry", "Tawaf", "Zamzam", "Saʿy",
  "Arafah", "Muzdalifah", "Jamarat", "Farewell",
];

export const UMRAH_DUAS = byStages(UMRAH_STAGES);
export const HAJJ_DUAS = byStages(HAJJ_STAGES);

// ── DUA_CONTENT — keyed by the IDs the screens navigate with ─────────────────
// Pilgrimage routes use stages; Discover/My-Lists use REAL category tags.
export const DUA_CONTENT = {
  // Pilgrimage routes
  hajj:       DUAS,
  umrah:      UMRAH_DUAS,
  umrahDuas:  UMRAH_DUAS,
  hajjDuas:   HAJJ_DUAS,

  // Discover categories — now backed by real tags
  gratitude:  byTag("gratitude"),
  forgive:    byTag("forgive"),
  guidance:   byTag("guidance"),
  protect:    byTag("protect"),
  patience:   byTag("patience"),
  provision:  byTag("provision"),

  // My Lists
  family:     byTag("family"),
  daily:      byTag("daily"),
  sleep:      byTag("sleep"),
};

// ── Live counts (replaces hardcoded fakes in MyDuasScreen) ───────────────────
export function countFor(id) {
  return (DUA_CONTENT[id] || []).length;
}

// ── Audio map kept for expo-av wiring later (unchanged contract) ─────────────
export const AUDIO_FILES = { traditional: {}, gentle: {} };
