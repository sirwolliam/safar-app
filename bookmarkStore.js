/**
 * bookmarkStore.js — Safar
 * Unified bookmark/board storage layer.
 *
 * All saved content (bookmarks, notes, checklists, duas, links) lives in
 * one AsyncStorage key: safar_journey_board_v1.
 *
 * Bookmarks from the app (saved duas, media) are stored as board cards
 * with type: "bookmark" and cached source content.
 *
 * Legacy migration: on first read, any data in the old bookmark keys
 * (safar_bookmarks_v1, safar_bookmark_media_v1) is converted to board
 * cards and merged into the board. Old keys are then deleted.
 *
 * Exports maintain backward-compatible function signatures so existing
 * screens (DuaDetailScreen, MediaScreen) continue working during the
 * transition. After all screens are updated, legacy exports can be removed.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDuaById } from "./dua-content";

// ── Storage keys ─────────────────────────────────────────────────────────────
const BOARD_KEY = "safar_journey_board_v1";
const LEGACY_DUA_KEY = "safar_bookmarks_v1";
const LEGACY_MEDIA_KEY = "safar_bookmark_media_v1";
const MIGRATION_DONE_KEY = "safar_bookmark_migration_done_v1";

// Re-export for other files that reference BOARD_KEY directly
export { BOARD_KEY };

// Also re-export legacy key names so any file referencing them still compiles
export const DUA_BOOKMARKS_KEY = LEGACY_DUA_KEY;
export const MEDIA_BOOKMARKS_KEY = LEGACY_MEDIA_KEY;

// ── Internal: read/write the board ───────────────────────────────────────────
let _boardCache = null;

async function readBoard() {
  if (_boardCache) return _boardCache;
  try {
    const raw = await AsyncStorage.getItem(BOARD_KEY);
    _boardCache = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(_boardCache)) _boardCache = [];
  } catch {
    _boardCache = [];
  }
  return _boardCache;
}

async function writeBoard(list) {
  _boardCache = list;
  try {
    await AsyncStorage.setItem(BOARD_KEY, JSON.stringify(list));
  } catch {}
  return list;
}

// ── Migration: legacy bookmarks → board cards ────────────────────────────────
export async function runBookmarkMigration() {
  try {
    const alreadyDone = await AsyncStorage.getItem(MIGRATION_DONE_KEY);
    if (alreadyDone === "true") return;

    const board = await readBoard();
    const existingSourceIds = new Set(
      board
        .filter(c => c.type === "bookmark" && c.sourceId)
        .map(c => c.sourceId)
    );

    let newCards = [];

    // Migrate dua bookmarks
    const rawDuas = await AsyncStorage.getItem(LEGACY_DUA_KEY);
    if (rawDuas) {
      try {
        let parsed = JSON.parse(rawDuas);
        if (Array.isArray(parsed)) {
          // Handle legacy plain string array format
          if (parsed.length > 0 && typeof parsed[0] === "string") {
            parsed = parsed.map(id => ({ id, addedAt: new Date().toISOString() }));
          }
          for (const entry of parsed) {
            if (!entry || !entry.id || existingSourceIds.has(entry.id)) continue;
            const dua = getDuaById(entry.id);
            newCards.push({
              id: "migrated_dua_" + entry.id + "_" + Date.now(),
              type: "bookmark",
              sourceType: "dua",
              sourceId: entry.id,
              sourceTitle: dua?.title || entry.id,
              sourceArabic: dua?.arabic || null,
              sourceTranslation: dua?.translation || null,
              pinned: false,
              createdAt: entry.addedAt || new Date().toISOString(),
            });
            existingSourceIds.add(entry.id);
          }
        }
      } catch {}
    }

    // Migrate media bookmarks
    const rawMedia = await AsyncStorage.getItem(LEGACY_MEDIA_KEY);
    if (rawMedia) {
      try {
        let parsed = JSON.parse(rawMedia);
        if (Array.isArray(parsed)) {
          if (parsed.length > 0 && typeof parsed[0] === "string") {
            parsed = parsed.map(id => ({ id, addedAt: new Date().toISOString() }));
          }
          for (const entry of parsed) {
            if (!entry || !entry.id || existingSourceIds.has(entry.id)) continue;
            newCards.push({
              id: "migrated_media_" + entry.id + "_" + Date.now(),
              type: "bookmark",
              sourceType: "media",
              sourceId: entry.id,
              sourceTitle: entry.id, // Media titles aren't resolvable here — display layer handles it
              pinned: false,
              createdAt: entry.addedAt || new Date().toISOString(),
            });
            existingSourceIds.add(entry.id);
          }
        }
      } catch {}
    }

    // Merge and save
    if (newCards.length > 0) {
      await writeBoard([...newCards, ...board]);
    }

    // Mark migration done and clean up legacy keys
    await AsyncStorage.setItem(MIGRATION_DONE_KEY, "true");
    await AsyncStorage.removeItem(LEGACY_DUA_KEY).catch(() => {});
    await AsyncStorage.removeItem(LEGACY_MEDIA_KEY).catch(() => {});
  } catch {
    // Migration failed silently — will retry on next launch
  }
}

// ── Bookmark card helpers ────────────────────────────────────────────────────

function findBookmarkCard(board, sourceType, sourceId) {
  return board.find(
    c => c.type === "bookmark" && c.sourceType === sourceType && c.sourceId === sourceId
  );
}

async function isBookmarkedOnBoard(sourceType, sourceId) {
  if (!sourceId) return false;
  const board = await readBoard();
  return !!findBookmarkCard(board, sourceType, sourceId);
}

async function addBookmarkCard(sourceType, sourceId, extraFields = {}) {
  const board = await readBoard();
  if (findBookmarkCard(board, sourceType, sourceId)) return board; // Already exists

  const card = {
    id: "bookmark_" + sourceType + "_" + sourceId + "_" + Date.now(),
    type: "bookmark",
    sourceType,
    sourceId,
    pinned: false,
    createdAt: new Date().toISOString(),
    ...extraFields,
  };

  return writeBoard([card, ...board]);
}

async function removeBookmarkCard(sourceType, sourceId) {
  const board = await readBoard();
  const filtered = board.filter(
    c => !(c.type === "bookmark" && c.sourceType === sourceType && c.sourceId === sourceId)
  );
  return writeBoard(filtered);
}

async function toggleBookmarkCard(sourceType, sourceId, extraFields = {}) {
  const isBookmarked = await isBookmarkedOnBoard(sourceType, sourceId);
  if (isBookmarked) {
    await removeBookmarkCard(sourceType, sourceId);
    return false;
  } else {
    await addBookmarkCard(sourceType, sourceId, extraFields);
    return true;
  }
}

// ── Dua bookmark exports (backward-compatible signatures) ────────────────────

export async function getDuaBookmarks() {
  const board = await readBoard();
  return board.filter(c => c.type === "bookmark" && c.sourceType === "dua");
}

export async function isDuaBookmarked(id) {
  return isBookmarkedOnBoard("dua", id);
}

export async function setDuaBookmarked(id, value) {
  if (value) {
    const dua = getDuaById(id);
    return addBookmarkCard("dua", id, {
      sourceTitle: dua?.title || id,
      sourceArabic: dua?.arabic || null,
      sourceTranslation: dua?.translation || null,
    });
  }
  return removeBookmarkCard("dua", id);
}

export async function toggleDuaBookmark(id) {
  const dua = getDuaById(id);
  return toggleBookmarkCard("dua", id, {
    sourceTitle: dua?.title || id,
    sourceArabic: dua?.arabic || null,
    sourceTranslation: dua?.translation || null,
  });
}

// ── Media bookmark exports (backward-compatible signatures) ──────────────────

export async function getMediaBookmarks() {
  const board = await readBoard();
  return board.filter(c => c.type === "bookmark" && c.sourceType === "media");
}

export async function isMediaBookmarked(id) {
  return isBookmarkedOnBoard("media", id);
}

export async function setMediaBookmarked(id, value, extraFields = {}) {
  if (value) return addBookmarkCard("media", id, { sourceTitle: id, ...extraFields });
  return removeBookmarkCard("media", id);
}

export async function toggleMediaBookmark(id, extraFields = {}) {
  return toggleBookmarkCard("media", id, { sourceTitle: extraFields.sourceTitle || id, ...extraFields });
}

// ── Board CRUD exports (used by MyBoardScreen) ───────────────────────────────

export async function getBoardCards() {
  return readBoard();
}

export async function addBoardCard(card) {
  const board = await readBoard();
  return writeBoard([card, ...board]);
}

export async function updateBoardCard(updatedCard) {
  const board = await readBoard();
  return writeBoard(board.map(c => c.id === updatedCard.id ? updatedCard : c));
}

export async function deleteBoardCard(id) {
  const board = await readBoard();
  return writeBoard(board.filter(c => c.id !== id));
}

export async function toggleBoardPin(id) {
  const board = await readBoard();
  return writeBoard(board.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
}

// ── Invalidate cache (call after external writes to BOARD_KEY) ───────────────
export function invalidateBoardCache() {
  _boardCache = null;
}
