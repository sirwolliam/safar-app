/**
 * prayerTimes.js — Safar
 * Prayer times from the AlAdhan monthly calendar, cached on the device.
 * All "today" / "now" logic runs in the selected city's time zone, not the phone's.
 *
 * Pure helpers (cleanTime, cityNow, buildDays, selectPrayer, addDays) never touch
 * AsyncStorage so they can be tested on their own.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PRAYER_METHODS, PRAYER_SCHOOLS, PRAYER_METHOD_KEY, PRAYER_SCHOOL_KEY } from "./prayerSettings";

export const DEFAULT_METHOD = 4;
export const DEFAULT_SCHOOL = 0;
export const DEFAULT_LOCATION = { name: "Makkah", lat: 21.3891, lng: 39.8579 };

const LOCATION_KEY = "safar_prayer_location_v1";
const CACHE_KEY    = "safar_prayer_cache_v1";
const API_BASE     = "https://api.aladhan.com/v1/calendar";
const TIMEOUT_MS   = 15000;

const DAY_KEYS  = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
const NEXT_KEYS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]; // Sunrise is never "next"

// ── Pure helpers ──────────────────────────────────────────────────────────────

const pad2 = (n) => String(n).padStart(2, "0");

// "05:05 (+03)" or "05:05" → "05:05"; anything else → null
export function cleanTime(str) {
  if (typeof str !== "string") return null;
  const m = str.match(/^\s*(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return `${pad2(h)}:${pad2(min)}`;
}

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function deviceNow(now) {
  return {
    dateStr: `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`,
    minutes: now.getHours() * 60 + now.getMinutes(),
    usedDeviceClock: true,
  };
}

// Date and minutes-since-midnight for `now` in an IANA time zone.
// Falls back to the device clock if Intl or the zone is unavailable.
export function cityNow(timeZone, now = new Date()) {
  if (!timeZone) return deviceNow(now);
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    });
    const p = {};
    for (const part of fmt.formatToParts(now)) p[part.type] = part.value;
    const y = Number(p.year), mo = Number(p.month), d = Number(p.day);
    const h = Number(p.hour) % 24, mi = Number(p.minute);
    if ([y, mo, d, h, mi].some((n) => !Number.isFinite(n))) return deviceNow(now);
    return { dateStr: `${y}-${pad2(mo)}-${pad2(d)}`, minutes: h * 60 + mi, usedDeviceClock: false };
  } catch (_) {
    return deviceNow(now);
  }
}

// "YYYY-MM-DD" shifted by n days (calendar arithmetic, no time zone involved)
export function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
}

function nextMonthKey(monthKey) {
  const [y, m] = monthKey.split("-").map(Number);
  return m === 12 ? `${y + 1}-01` : `${y}-${pad2(m + 1)}`;
}

// AlAdhan calendar data[] → the cached day shape. Days with unreadable times are skipped.
export function buildDays(apiData) {
  if (!Array.isArray(apiData)) return [];
  const days = [];
  for (const entry of apiData) {
    const g = entry?.date?.gregorian?.date; // "DD-MM-YYYY"
    const gm = typeof g === "string" ? g.match(/^(\d{2})-(\d{2})-(\d{4})$/) : null;
    if (!gm) continue;
    const t = {};
    let valid = true;
    for (const k of DAY_KEYS) {
      t[k] = cleanTime(entry?.timings?.[k]);
      if (!t[k]) valid = false;
    }
    if (!valid) continue;
    const h = entry?.date?.hijri;
    const hijri = h
      ? { day: Number(h.day), month: { number: Number(h.month?.number), en: h.month?.en ?? "" }, year: Number(h.year) }
      : null;
    days.push({ date: `${gm[3]}-${gm[2]}-${gm[1]}`, t, hijri });
  }
  return days;
}

// Current and next prayer from one day's timings at `minutes` past midnight.
// `tomorrow` / `yesterday` are optional timings objects for the neighbouring days.
export function selectPrayer(today, minutes, tomorrow, yesterday) {
  const list = NEXT_KEYS.map((name) => ({ name, time: today[name], mins: toMinutes(today[name]) }));

  let current = null;
  let next = null;
  for (const p of list) {
    if (minutes >= p.mins) current = p;
    else if (!next) next = p;
  }

  // Before Fajr the current prayer is last night's Isha
  const currentName = current ? current.name : "Isha";
  const currentTime = current ? current.time : (yesterday?.Isha ?? today.Isha);

  if (next) {
    return {
      current: currentName, currentTime,
      next: next.name, nextTime: next.time,
      isTomorrow: false, approximate: false,
      minutesUntil: next.mins - minutes,
    };
  }

  // After Isha: tomorrow's Fajr, or today's Fajr as an estimate if tomorrow is not cached
  const fajr = tomorrow?.Fajr ?? today.Fajr;
  return {
    current: currentName, currentTime,
    next: "Fajr", nextTime: fajr,
    isTomorrow: true, approximate: !tomorrow?.Fajr,
    minutesUntil: 24 * 60 - minutes + toMinutes(fajr),
  };
}

// ── Settings ──────────────────────────────────────────────────────────────────

function validLocation(loc) {
  return !!loc
    && typeof loc.name === "string" && loc.name.length > 0
    && Number.isFinite(loc.lat) && Math.abs(loc.lat) <= 90
    && Number.isFinite(loc.lng) && Math.abs(loc.lng) <= 180;
}

export async function loadPrayerSettings() {
  let method = DEFAULT_METHOD;
  let school = DEFAULT_SCHOOL;
  let location = DEFAULT_LOCATION;
  try {
    const [m, sc, loc] = await Promise.all([
      AsyncStorage.getItem(PRAYER_METHOD_KEY),
      AsyncStorage.getItem(PRAYER_SCHOOL_KEY),
      AsyncStorage.getItem(LOCATION_KEY),
    ]);
    const mNum = Number(m);
    if (m != null && PRAYER_METHODS.some((x) => x.code === mNum)) method = mNum;
    const scNum = Number(sc);
    if (sc != null && PRAYER_SCHOOLS.some((x) => x.code === scNum)) school = scNum;
    if (loc) {
      try {
        const parsed = JSON.parse(loc);
        if (validLocation(parsed)) location = { name: parsed.name, lat: parsed.lat, lng: parsed.lng };
      } catch (_) {}
    }
  } catch (_) {}
  return { method, school, location };
}

// ── Cache ─────────────────────────────────────────────────────────────────────

function cacheKeyFor({ location, method, school }) {
  return `${location.lat.toFixed(4)},${location.lng.toFixed(4)},${method},${school}`;
}

async function readCache(settings) {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    const c = raw ? JSON.parse(raw) : null;
    if (!c || typeof c.months !== "object" || c.months === null) return null;
    if (c.key !== cacheKeyFor(settings)) return null; // settings changed: start fresh
    return c;
  } catch (_) {
    return null;
  }
}

function findDay(cache, dateStr) {
  const month = cache?.months?.[dateStr.slice(0, 7)];
  return Array.isArray(month) ? month.find((d) => d.date === dateStr) ?? null : null;
}

// ── Network ───────────────────────────────────────────────────────────────────

async function fetchMonth({ location, method, school }, year, month) {
  const url = `${API_BASE}/${year}/${month}?latitude=${location.lat}&longitude=${location.lng}&method=${method}&school=${school}`;
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), TIMEOUT_MS) : null;
  try {
    const res = await fetch(url, controller ? { signal: controller.signal } : undefined);
    if (!res.ok) return { ok: false, error: "Could not load prayer times." };
    const json = await res.json();
    if (json?.code !== 200 || !Array.isArray(json.data)) return { ok: false, error: "Could not load prayer times." };
    const days = buildDays(json.data);
    if (days.length === 0) return { ok: false, error: "Could not load prayer times." };
    return { ok: true, days, tz: json.data[0]?.meta?.timezone ?? null };
  } catch (_) {
    return { ok: false, error: "No internet connection." };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// Make sure the city's current and next month are cached. Never throws.
export async function refreshPrayerData(settings, { force = false } = {}) {
  try {
    const old = await readCache(settings);
    const months = old ? old.months : {};
    let tz = old ? old.tz : null;

    // Nothing to do if both months are already cached (no request, so not offline)
    if (!force && tz) {
      const cur = cityNow(tz).dateStr.slice(0, 7);
      if (months[cur] && months[nextMonthKey(cur)]) return { ok: true, offline: false, error: null };
    }

    const fetched = {};
    let error = null;

    // Device's current month first, to learn the city's time zone
    const dev = new Date();
    const devKey = `${dev.getFullYear()}-${pad2(dev.getMonth() + 1)}`;
    if (force || !tz || !months[devKey]) {
      const r = await fetchMonth(settings, dev.getFullYear(), dev.getMonth() + 1);
      if (r.ok) { fetched[devKey] = r.days; tz = r.tz || tz; } else { error = r.error; }
    }

    if (!tz) {
      return { ok: false, offline: false, error: error || "Could not load prayer times." };
    }

    const cur = cityNow(tz).dateStr.slice(0, 7);
    const nxt = nextMonthKey(cur);
    for (const key of [cur, nxt]) {
      if (fetched[key]) continue;
      if (!force && months[key]) continue;
      const [y, m] = key.split("-").map(Number);
      const r = await fetchMonth(settings, y, m);
      if (r.ok) { fetched[key] = r.days; } else { error = r.error; }
    }

    // Keep only the city's current and next month
    const kept = {};
    for (const key of [cur, nxt]) {
      const days = fetched[key] || months[key];
      if (days) kept[key] = days;
    }

    if (Object.keys(fetched).length > 0) {
      const cache = { key: cacheKeyFor(settings), tz, months: kept, savedAt: new Date().toISOString() };
      try { await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch (_) {}
    }

    const haveToday = !!kept[cur];
    if (!haveToday) return { ok: false, offline: false, error: error || "Could not load prayer times." };
    // offline: requests were tried and all failed, so today comes from the saved copy.
    // Any fresh response (even a partial one) means not offline.
    return { ok: true, offline: Object.keys(fetched).length === 0, error };
  } catch (_) {
    return { ok: false, offline: false, error: "Could not load prayer times." };
  }
}

// ── Reads ─────────────────────────────────────────────────────────────────────

export async function getToday(settings) {
  const cache = await readCache(settings);
  if (!cache || !cache.tz) return null;
  const now = cityNow(cache.tz);
  const day = findDay(cache, now.dateStr);
  if (!day) return null;
  const timings = {};
  for (const k of DAY_KEYS) timings[k] = day.t[k];
  return { dateStr: now.dateStr, timings, hijri: day.hijri, timeZone: cache.tz, usedDeviceClock: now.usedDeviceClock };
}

export async function getNextPrayer(settings, now = new Date()) {
  const cache = await readCache(settings);
  if (!cache || !cache.tz) return null;
  const city = cityNow(cache.tz, now);
  const today = findDay(cache, city.dateStr);
  if (!today) return null;
  const tomorrow  = findDay(cache, addDays(city.dateStr, 1));
  const yesterday = findDay(cache, addDays(city.dateStr, -1));
  return selectPrayer(today.t, city.minutes, tomorrow ? tomorrow.t : null, yesterday ? yesterday.t : null);
}
