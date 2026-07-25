/**
 * groupMetaStore.js — Safar
 * Local persistence for group display metadata (name edits, avatar choice)
 * not yet backed by real Firebase. firebase.js is currently fully stubbed,
 * so without this, a rename or avatar change made in GroupDetailScreen
 * wouldn't show up back on GroupsScreen's list, and wouldn't survive an
 * app reload. Same small-store pattern as bookmarkStore.js / practiceStore.js.
 *
 * Shape stored per group: { name?: string, avatarMode?: "icon"|"initials"|"photo", photoUri?: string }
 *
 * Once real Firebase groups exist, move name/avatar to fields on the
 * Firestore group doc and retire this file.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "safar_group_meta_v1";

async function readAll() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

async function writeAll(map) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(map));
  } catch (_) {}
}

export async function getGroupMeta(groupId) {
  if (!groupId) return null;
  const all = await readAll();
  return all[groupId] ?? null;
}

export async function getAllGroupMeta() {
  return readAll();
}

export async function setGroupMeta(groupId, patch) {
  if (!groupId) return null;
  const all = await readAll();
  all[groupId] = { ...(all[groupId] ?? {}), ...patch };
  await writeAll(all);
  return all[groupId];
}
