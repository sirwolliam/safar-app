import AsyncStorage from "@react-native-async-storage/async-storage";

// Schema: object keyed by lessonId, each value is { furthestIndex, total }.
// furthestIndex is the highest block index the user has reached (0-based).
// A lesson is "completed" when furthestIndex === total - 1.

const LESSON_PROGRESS_KEY = "safar_lesson_progress_v1";

async function readProgress() {
  try {
    const raw = await AsyncStorage.getItem(LESSON_PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || Array.isArray(parsed) || parsed === null) return {};
    return parsed;
  } catch {
    return {};
  }
}

async function writeProgress(progress) {
  try { await AsyncStorage.setItem(LESSON_PROGRESS_KEY, JSON.stringify(progress)); } catch {}
  return progress;
}

export async function getLessonProgress(lessonId) {
  const progress = await readProgress();
  return progress[lessonId] || null;
}

export async function getAllLessonProgress() {
  return await readProgress();
}

export async function updateLessonProgress(lessonId, currentIndex, total) {
  const progress = await readProgress();
  const existing = progress[lessonId];
  const furthestIndex = existing ? Math.max(existing.furthestIndex, currentIndex) : currentIndex;
  const next = { ...progress, [lessonId]: { furthestIndex, total } };
  await writeProgress(next);
  return next[lessonId];
}
