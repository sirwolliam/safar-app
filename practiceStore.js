/**
 * practiceStore.js — Safar
 * Manages the user's practice queue: an ordered list of du'ā
 * IDs saved for focused practice. Ordering is user-controlled.
 *
 * Schema: AsyncStorage key → JSON array of { id: string, addedAt: ISOString }
 * Order of array = practice sequence order.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

export const PRACTICE_KEY = "safar_practice_v1";

async function readQueue() {
  try {
    const raw = await AsyncStorage.getItem(PRACTICE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(e => e && typeof e.id === "string");
  } catch {
    return [];
  }
}

async function writeQueue(queue) {
  try {
    await AsyncStorage.setItem(PRACTICE_KEY, JSON.stringify(queue));
  } catch {}
  return queue;
}

export const getPracticeQueue = () => readQueue();

export const isInPractice = async (id) => {
  if (!id) return false;
  const q = await readQueue();
  return q.some(e => e.id === id);
};

export const addToPractice = async (id) => {
  if (!id) return await readQueue();
  const q = await readQueue();
  if (q.some(e => e.id === id)) return q;
  return writeQueue([...q, { id, addedAt: new Date().toISOString() }]);
};

export const removeFromPractice = async (id) => {
  if (!id) return await readQueue();
  const q = await readQueue();
  return writeQueue(q.filter(e => e.id !== id));
};

export const togglePractice = async (id) => {
  const current = await isInPractice(id);
  if (current) {
    await removeFromPractice(id);
  } else {
    await addToPractice(id);
  }
  return !current;
};

export const reorderQueue = async (fromIndex, toIndex) => {
  const q = await readQueue();
  if (
    fromIndex < 0 || fromIndex >= q.length ||
    toIndex < 0   || toIndex >= q.length ||
    fromIndex === toIndex
  ) return q;
  const next = [...q];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return writeQueue(next);
};

export const clearPracticeQueue = async () => writeQueue([]);
