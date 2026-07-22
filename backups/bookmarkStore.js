import AsyncStorage from "@react-native-async-storage/async-storage";

export const DUA_BOOKMARKS_KEY = "safar_bookmarks_v1";
export const MEDIA_BOOKMARKS_KEY = "safar_bookmark_media_v1";

// Schema: JSON array of { id: string, addedAt: ISOString }.
// Legacy note: DUA_BOOKMARKS_KEY previously stored a plain array of id
// strings (no timestamps) — readList() migrates that shape transparently
// on first read so existing users don't lose saved du'ās.

async function readList(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    if (parsed.length > 0 && typeof parsed[0] === "string") {
      const migrated = parsed.map((id) => ({ id, addedAt: new Date().toISOString() }));
      AsyncStorage.setItem(key, JSON.stringify(migrated)).catch(() => {});
      return migrated;
    }
    return parsed.filter((e) => e && typeof e.id === "string");
  } catch {
    return [];
  }
}

async function writeList(key, list) {
  try { await AsyncStorage.setItem(key, JSON.stringify(list)); } catch {}
  return list;
}

async function isBookmarked(key, id) {
  if (!id) return false;
  const list = await readList(key);
  return list.some((e) => e.id === id);
}

async function setBookmarkedValue(key, id, value) {
  if (!id) return await readList(key);
  const list = await readList(key);
  const exists = list.some((e) => e.id === id);
  let next = list;
  if (value && !exists) next = [...list, { id, addedAt: new Date().toISOString() }];
  else if (!value && exists) next = list.filter((e) => e.id !== id);
  return writeList(key, next);
}

async function toggleBookmarkedValue(key, id) {
  const current = await isBookmarked(key, id);
  await setBookmarkedValue(key, id, !current);
  return !current;
}

export const getDuaBookmarks = () => readList(DUA_BOOKMARKS_KEY);
export const isDuaBookmarked = (id) => isBookmarked(DUA_BOOKMARKS_KEY, id);
export const setDuaBookmarked = (id, value) => setBookmarkedValue(DUA_BOOKMARKS_KEY, id, value);
export const toggleDuaBookmark = (id) => toggleBookmarkedValue(DUA_BOOKMARKS_KEY, id);

export const getMediaBookmarks = () => readList(MEDIA_BOOKMARKS_KEY);
export const isMediaBookmarked = (id) => isBookmarked(MEDIA_BOOKMARKS_KEY, id);
export const setMediaBookmarked = (id, value) => setBookmarkedValue(MEDIA_BOOKMARKS_KEY, id, value);
export const toggleMediaBookmark = (id) => toggleBookmarkedValue(MEDIA_BOOKMARKS_KEY, id);
