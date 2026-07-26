/**
 * momentsStore.js — Safar
 * Template definitions + local persistence for Moments (photo postcards
 * and prayer cards). No Firebase — this is compose-and-export, not a
 * synced feature, so AsyncStorage is the right (and only necessary) layer.
 *
 * Templates are pure data + code-drawn layout, not image assets — see
 * PostcardTemplate.jsx for the actual rendering. This means "framed" vs
 * "full-bleed" and the arch cutout position are guaranteed identical
 * between the grid thumbnail and the final exported image, since both
 * render from the same component.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "safar_moments_v1";

export const PHOTO_TEMPLATES = [
  { id: "arrival",     category: "photo", name: "Arrival",         layout: "full-bleed", accent: "#4A5C48", textColor: "#FFFFFF", icon: "MapPin",   eyebrow: "MAKKAH",         placeholder: "Alhamdulillah, I've arrived safely." },
  { id: "first-sight", category: "photo", name: "First Sight",     layout: "framed",     accent: "#B08F52", textColor: "#2A1F0E", icon: "Mosque",   eyebrow: "MY FIRST SIGHT", placeholder: "My first sight of the Kaaba is a moment I'll never forget." },
  { id: "dua-request", category: "photo", name: "Keep Me in Duas", layout: "framed",     accent: "#584260", textColor: "#FFFFFF", icon: "HandHeart",eyebrow: "",               placeholder: "Please keep me in your duas." },
  { id: "madinah",     category: "photo", name: "Madinah",         layout: "full-bleed", accent: "#7A5B4A", textColor: "#FFFFFF", icon: "Mosque",   eyebrow: "MADINAH",        placeholder: "Peace and blessings upon the Messenger." },
];

export const PRAYER_TEMPLATES = [
  { id: "prayed-for-you",  category: "prayer", name: "Prayed for You",   accent: "#4A5C48", textColor: "#FFFFFF", icon: "HandHeart",     placeholder: "I prayed for you today." },
  { id: "remembered-you",  category: "prayer", name: "Remembered You",   accent: "#7A6B4A", textColor: "#FFFFFF", icon: "Heart",          placeholder: "I remembered you in my duas at a blessed place." },
  { id: "kaaba-prayer",    category: "prayer", name: "Ease and Peace",   accent: "#B08F52", textColor: "#2A1F0E", icon: "Mosque",         placeholder: "Praying that Allah accepts your duas and grants you ease and peace." },
  { id: "night-dua",       category: "prayer", name: "Reunite in Jannah",accent: "#2A2438", textColor: "#FFFFFF", icon: "StarAndCrescent",placeholder: "May Allah accept our journeys and reunite us in Jannah." },
];

export function getTemplateById(id) {
  return [...PHOTO_TEMPLATES, ...PRAYER_TEMPLATES].find(t => t.id === id) ?? null;
}

async function readAll() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

export async function getMoments() {
  const all = await readAll();
  return all.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

export async function saveMoment(moment) {
  const all = await readAll();
  const record = { ...moment, id: moment.id ?? `moment_${Date.now()}`, createdAt: moment.createdAt ?? Date.now() };
  const next = [record, ...all.filter(m => m.id !== record.id)];
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return record;
}

export async function deleteMoment(id) {
  const all = await readAll();
  await AsyncStorage.setItem(KEY, JSON.stringify(all.filter(m => m.id !== id)));
}

export async function clearAllMoments() {
  await AsyncStorage.removeItem(KEY);
}
