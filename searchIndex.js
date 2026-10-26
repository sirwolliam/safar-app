/**
 * searchIndex.js — Safar
 * Global keyword search (Phase 1): one Fuse.js index over duas, lessons,
 * sacred places and media. Built once on first use, then cached.
 *
 * Item shape:
 *   { id, type: "dua"|"lesson"|"place"|"media", title, subtitle, body, stage,
 *     tags, route, params, url }
 * `route` + `params` are passed straight to navigation.navigate from the
 * root-stack SearchScreen. Media items have no screen of their own — they carry
 * a `url` and open it directly, exactly like the Media screen's cards.
 */
import Fuse from "fuse.js";
import { DUAS } from "./dua-content";
import { LESSONS } from "./content/lessons";
import { MAKKAH_SITES, MADINAH_SITES } from "./screens/SacredPlacesScreen";
import { MEDIA } from "./screens/MediaScreen";

const LESSON_BODY_MAX = 2000;

// Lesson blocks hold text in many shapes (paragraphs, cards, steps, Q&A).
// Collect every string except structural/asset keys.
const SKIP_KEYS = new Set(["type", "id", "icon", "image", "ctaScreen", "ctaMode", "ctaTab", "ctaParams", "lessonBadge"]);
function collectText(value, out) {
  if (typeof value === "string") { out.push(value); return; }
  if (Array.isArray(value)) { value.forEach((v) => collectText(v, out)); return; }
  if (value && typeof value === "object") {
    Object.keys(value).forEach((k) => { if (!SKIP_KEYS.has(k)) collectText(value[k], out); });
  }
}

// Lessons, Media live in tab stacks; Search sits on the root stack, so those
// targets need the nested MainTabs → tab → screen form.
const inLearnTab = (screen, params) => ({
  route: "MainTabs",
  params: { screen: "Learn", params: { screen, initial: false, params } },
});

function duaItems() {
  // DUAS = every visible dua exactly once (DUA_CONTENT's lists overlap).
  return DUAS.map((dua) => ({
    id: "dua:" + dua.id,
    type: "dua",
    title: dua.title,
    subtitle: dua.stage || (dua.categories && dua.categories[0]) || null,
    body: [dua.translation, dua.transliteration, dua.arabic].filter(Boolean).join(" "),
    stage: dua.stage || null,
    tags: [...(dua.categories || []), ...(dua.keywords || [])],
    route: "DuaDetail",
    params: { dua, allDuas: [dua], currentIndex: 0 },
  }));
}

function lessonItems() {
  return Object.values(LESSONS).map((lesson) => {
    const cover = (lesson.blocks || []).find((b) => b.type === "cover");
    const text = [];
    collectText(lesson.blocks, text);
    return {
      id: "lesson:" + lesson.id,
      type: "lesson",
      title: lesson.title,
      subtitle: (lesson.guide === "hajj" ? "Hajj" : "Umrah") + " · Lesson " + lesson.lessonNumber,
      body: text.join(" ").slice(0, LESSON_BODY_MAX),
      stage: null,
      tags: [lesson.guide, cover && cover.subtitle].filter(Boolean),
      ...inLearnTab("LessonFlow", { lessonId: lesson.id }),
    };
  });
}

function placeItems() {
  const city = (sites, name) => sites.map((site) => ({
    id: "place:" + site.id,
    type: "place",
    title: site.name,
    subtitle: site.sub || null,
    body: site.description || null,
    stage: null,
    tags: [name, site.arabic].filter(Boolean),
    route: "SacredPlaces",
    params: { preselectedSiteId: site.id },
  }));
  return [...city(MAKKAH_SITES, "Makkah"), ...city(MADINAH_SITES, "Madinah")];
}

function mediaItems() {
  return MEDIA.filter((m) => m.url).map((m) => ({
    id: "media:" + m.id,
    type: "media",
    title: m.title,
    subtitle: [m.source, m.duration].filter(Boolean).join(" · ") || null,
    body: m.desc || null,
    stage: null,
    tags: m.tags || null,
    route: null,
    params: null,
    url: m.url,
  }));
}

// Navigation destinations ("what to pack" → Checklist). body = the vocabulary people type for it.
// Tab-stack targets use the nested MainTabs form; initial:false keeps each hub underneath for Back.
const inTab = (tab, screen) => ({ route: "MainTabs", params: { screen: tab, params: { screen, initial: false } } });
const SCREENS = [
  { key: "checklist",      title: "Checklist",      subtitle: "Pack and prepare for your journey",        body: "what to pack packing luggage essentials prepare preparation list items",     ...inTab("Plan", "Checklists") },
  { key: "essentials",     title: "Essentials",     subtitle: "Hand-picked items for your journey",       body: "shop buy pack essentials items products ihram clothing",                     ...inTab("Plan", "Shop") },
  { key: "what-to-expect", title: "What to Expect", subtitle: "Crowds, climate, what it really feels like", body: "crowds weather climate heat expect preparation first time",               ...inTab("Plan", "WhatToExpect") },
  { key: "qibla",          title: "Qibla",          subtitle: "Find the direction of prayer",             body: "qibla direction compass face prayer kaaba",                                  ...inTab("Practice", "Qibla") },
  { key: "prayer-times",   title: "Prayer Times",   subtitle: "Daily prayer schedule",                    body: "prayer times fajr dhuhr asr maghrib isha salah schedule",                   ...inTab("Practice", "PrayerTimes") },
  { key: "calendar",       title: "Calendar",       subtitle: "Track dates, milestones and reminders",    body: "calendar dates schedule events reminders",                                   ...inTab("Plan", "Calendar") },
  { key: "contacts",       title: "Contacts",       subtitle: "Hotel, group leader, agent",               body: "contacts phone numbers hotel group leader agent emergency",                  ...inTab("Connect", "MyContacts") },
  { key: "notes",          title: "Notes",          subtitle: "Reflections and intentions",               body: "notes journal reflections intentions write",                                 ...inTab("Plan", "Notes") },
  { key: "currency",       title: "Currency",       subtitle: "Live exchange rates",                      body: "currency money exchange rates saudi riyal convert",                          ...inTab("Plan", "CurrencyConverter") },
  { key: "media",          title: "Media Library",  subtitle: "Videos, articles and podcasts",            body: "media videos articles podcasts watch listen library",                        ...inTab("Learn", "Media") },
  { key: "practice",       title: "Practice",       subtitle: "Rehearse duas, audio and quizzes",         body: "practice rehearse quiz audio recitation learning memorize",                  ...inTab("Practice", "PracticeMain") },
  { key: "dua-library",    title: "Dua Library",    subtitle: "Browse all duas",                          body: "dua library all duas supplications prayers",                                 ...inTab("Practice", "MyDuas") },
];

function screenItems() {
  return SCREENS.map(({ key, ...rest }) => ({ id: "screen-" + key, type: "screen", stage: null, tags: null, ...rest }));
}

let cached = null;

export function getSearchItems() {
  if (!cached) cached = { items: [...screenItems(), ...duaItems(), ...lessonItems(), ...placeItems(), ...mediaItems()] };
  return cached.items;
}

export function buildSearchIndex() {
  if (!cached || !cached.fuse) {
    const items = getSearchItems();
    cached.fuse = new Fuse(items, {
      keys: [
        { name: "title",    weight: 0.55 },
        { name: "subtitle", weight: 0.20 },
        { name: "body",     weight: 0.10 },
        { name: "stage",    weight: 0.08 },
        { name: "tags",     weight: 0.07 },
      ],
      threshold: 0.4,       // fuzzy enough for transliteration variants (Sa'i / Say / Sai)
      ignoreLocation: true,
      includeScore: true,
      minMatchCharLength: 3,
      useExtendedSearch: true, // whitespace-separated tokens are ANDed (see toFuseQuery)
    });
  }
  return cached.fuse;
}

// Raw user text → Fuse logical query: every word must fuzzy-match SOME field (title, body, tags…).
// - Not the '-prefixed string form: in extended search 'word means an exact substring, which breaks
//   typos ("tawaaf"), and a plain multi-word string must match within ONE field ("Days of Tashreeq" → 0).
// - Filler words are dropped so "Dua for Tawaf" is matched on "Dua" + "Tawaf".
// Returns null when nothing searchable is left.
const SEARCH_KEYS = ["title", "subtitle", "body", "stage", "tags"];
const STOPWORDS = new Set([
  "what", "to", "the", "a", "an", "of", "in", "on", "for", "is", "it", "this", "that", "my", "your",
  "do", "i", "can", "how", "when", "where", "and", "or", "with", "at", "be",
]);
export function toFuseQuery(raw) {
  const words = raw.trim().toLowerCase().split(/\s+/).filter(Boolean);
  let tokens = words.filter((t) => t.length >= 3 && !STOPWORDS.has(t));
  // Nothing meaningful left ("what is it") → fall back to the raw text as one fuzzy term.
  if (!tokens.length) tokens = raw.trim().length >= 3 ? [raw.trim()] : [];
  if (!tokens.length) return null;
  return { $and: tokens.map((t) => ({ $or: SEARCH_KEYS.map((k) => ({ [k]: t })) })) };
}

export function getSuggestedSearches() {
  return ["Dua for Tawaf", "What to pack", "Zamzam", "Days of Tashreeq", "Ihram", "Arafah"];
}
