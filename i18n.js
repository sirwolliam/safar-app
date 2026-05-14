/**
 * utils/i18n.js — Safar
 * Lightweight i18n — no external dependency needed.
 * Reads device locale and returns translated strings.
 *
 * Usage:
 *   import { t, setLanguage, getLanguage } from "../utils/i18n";
 *
 *   // In any component:
 *   <Text>{t("home.title")}</Text>
 *   <Text>{t("groups.members", { count: 4 })}</Text>  // → "4 members"
 *
 * Supported languages: en, ur, id
 * Falls back to English if key missing in translation.
 *
 * To add a language:
 *   1. Add a JSON file to i18n/ (e.g. ar.json, ms.json)
 *   2. Import it below
 *   3. Add to TRANSLATIONS object
 */

import { NativeModules, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "../i18n/en.json";
import ur from "../i18n/ur.json";
import id from "../i18n/id.json";

const TRANSLATIONS = { en, ur, id };
const STORAGE_KEY  = "safar_language_v1";

// ── Active language (defaults to device locale) ───────────────────────────────

let activeLanguage = "en";

export function getLanguage() {
  return activeLanguage;
}

export async function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) return; // unsupported — ignore
  activeLanguage = lang;
  await AsyncStorage.setItem(STORAGE_KEY, lang).catch(() => {});
}

export async function loadSavedLanguage() {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved && TRANSLATIONS[saved]) {
      activeLanguage = saved;
      return;
    }
  } catch {}

  // Auto-detect from device locale
  try {
    let locale = "";
    if (Platform.OS === "ios") {
      locale =
        NativeModules.SettingsManager?.settings?.AppleLocale ||
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
        "en";
    } else {
      locale = NativeModules.I18nManager?.localeIdentifier || "en";
    }

    const lang = locale.split(/[-_]/)[0].toLowerCase();
    if (TRANSLATIONS[lang]) activeLanguage = lang;
    // id → id (Bahasa Indonesia)
    // ur → ur (Urdu)
    // en, en-GB, en-US → en
  } catch {}
}

// ── Translation function ──────────────────────────────────────────────────────

/**
 * t("home.greeting")
 * t("groups.members", { count: 4 }) → "4 members" / "4 anggota" / "4 اراکین"
 * t("missing.key") → "missing.key" (fallback — visible in dev, fix before launch)
 */
export function t(key, params = {}) {
  const dict   = TRANSLATIONS[activeLanguage] ?? en;
  const parts  = key.split(".");
  
  // Traverse nested keys: "home.title" → dict.home.title
  let value = dict;
  for (const part of parts) {
    value = value?.[part];
    if (value === undefined) break;
  }

  // Fallback to English
  if (value === undefined || value === null) {
    let fallback = en;
    for (const part of parts) {
      fallback = fallback?.[part];
      if (fallback === undefined) break;
    }
    value = fallback ?? key; // last resort: show the key itself
  }

  if (typeof value !== "string") return key;

  // Replace params: {count} → 4
  return Object.entries(params).reduce(
    (str, [k, v]) => str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v)),
    value
  );
}

// ── Available languages list (for Settings screen) ───────────────────────────

export const AVAILABLE_LANGUAGES = [
  { code: "en", label: "English",           nativeLabel: "English"    },
  { code: "ur", label: "Urdu",              nativeLabel: "اردو"       },
  { code: "id", label: "Bahasa Indonesia",  nativeLabel: "Indonesia"  },
];
