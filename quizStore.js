/**
 * quizStore.js — Safar
 * Local persistence for quiz progress — best score, last completed date,
 * attempts count per topic. Same small-store pattern as bookmarkStore.js.
 *
 * No Firebase — this is personal progress, not something that syncs.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "safar_quiz_progress_v1";

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

export async function getProgress(topicId) {
  if (!topicId) return null;
  const all = await readAll();
  return all[topicId] ?? null;
}

export async function getAllProgress() {
  return readAll();
}

export async function saveResult(topicId, score, total) {
  if (!topicId) return null;
  const all = await readAll();
  const prev = all[topicId] ?? { bestScore: 0, bestTotal: 0, attempts: 0, lastCompleted: null };
  const isBest = score > prev.bestScore || (score === prev.bestScore && total <= prev.bestTotal);
  all[topicId] = {
    bestScore: isBest ? score : prev.bestScore,
    bestTotal: isBest ? total : prev.bestTotal,
    attempts: prev.attempts + 1,
    lastCompleted: new Date().toISOString(),
  };
  await writeAll(all);
  return all[topicId];
}
