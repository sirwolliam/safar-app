import AsyncStorage from "@react-native-async-storage/async-storage";

// Schema: object keyed by category id, each value is an array of checked item ids.
// Item content (labels, sections) is static and lives in CHECKLIST_ITEMS below —
// only checked state is persisted.

export const CHECKLIST_ITEMS = {
  documents: {
    title: "Documents",
    items: [
      { id: "doc-passport",     label: "Passport (valid 6+ months)" },
      { id: "doc-visa",         label: "Visa" },
      { id: "doc-insurance",    label: "Travel insurance" },
      { id: "doc-vaccine",      label: "Vaccination certificate" },
      { id: "doc-hotel",        label: "Hotel booking confirmation" },
      { id: "doc-flight",       label: "Flight booking confirmation" },
      { id: "doc-contacts",     label: "Emergency contacts list" },
    ],
  },
  packing: {
    title: "Packing",
    items: [
      { id: "pack-ihram",          section: "Clothing",       label: "Ihram (2 sets)" },
      { id: "pack-shoes",          section: "Clothing",       label: "Comfortable walking shoes" },
      { id: "pack-clothing",       section: "Clothing",       label: "Modest everyday clothing" },
      { id: "pack-jacket",         section: "Clothing",       label: "Light jacket or shawl" },
      { id: "pack-soap",           section: "Toiletries",     label: "Unscented soap" },
      { id: "pack-shampoo",        section: "Toiletries",     label: "Unscented shampoo" },
      { id: "pack-toothbrush",     section: "Toiletries",     label: "Toothbrush and toothpaste" },
      { id: "pack-towel",          section: "Toiletries",     label: "Small towel" },
      { id: "pack-charger",        section: "Electronics",    label: "Phone charger" },
      { id: "pack-adapter",        section: "Electronics",    label: "Power adapter" },
      { id: "pack-battery",        section: "Electronics",    label: "Portable battery pack" },
      { id: "pack-mat",            section: "Prayer items",   label: "Prayer mat" },
      { id: "pack-tasbih",         section: "Prayer items",   label: "Tasbih" },
      { id: "pack-quran",          section: "Prayer items",   label: "Pocket Quran or Quran app downloaded" },
      { id: "pack-meds",           section: "Medical",        label: "Personal medications" },
      { id: "pack-firstaid",       section: "Medical",        label: "Basic first aid kit" },
      { id: "pack-painrelief",     section: "Medical",        label: "Pain relief and rehydration salts" },
      { id: "pack-doc-copies",     section: "Documents",      label: "Printed copies of passport and visa" },
      { id: "pack-doc-confirms",   section: "Documents",      label: "Printed hotel and flight confirmations" },
    ],
  },
  spiritual: {
    title: "Spiritual preparation",
    items: [
      { id: "spi-niyyah",      label: "Learn the niyyah (intention) for your rites" },
      { id: "spi-duas",        label: "Memorize key du’ās for the journey" },
      { id: "spi-tawbah",      label: "Make sincere tawbah (repentance)" },
      { id: "spi-debts",       label: "Settle outstanding debts" },
      { id: "spi-will",        label: "Write or update a will" },
      { id: "spi-family",      label: "Inform family of your intention and ask forgiveness" },
    ],
  },
  "before-leaving": {
    title: "Before leaving home",
    items: [
      { id: "bl-mail",         label: "Stop mail delivery" },
      { id: "bl-bills",        label: "Pay upcoming bills in advance" },
      { id: "bl-neighbours",   label: "Inform neighbours of your travel dates" },
      { id: "bl-pets",         label: "Arrange pet care" },
      { id: "bl-security",     label: "Set home security or ask someone to check in" },
      { id: "bl-emergency",    label: "Share emergency contacts with someone at home" },
      { id: "bl-offline",      label: "Download offline maps and apps for the trip" },
    ],
  },
};

const CHECKLIST_PROGRESS_KEY = "safar_checklist_progress_v1";

async function readProgress() {
  try {
    const raw = await AsyncStorage.getItem(CHECKLIST_PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || Array.isArray(parsed) || parsed === null) return {};
    return parsed;
  } catch {
    return {};
  }
}

async function writeProgress(progress) {
  try { await AsyncStorage.setItem(CHECKLIST_PROGRESS_KEY, JSON.stringify(progress)); } catch {}
  return progress;
}

export async function getChecklistProgress(categoryId) {
  const progress = await readProgress();
  const list = progress[categoryId];
  return Array.isArray(list) ? list : [];
}

export async function isItemChecked(categoryId, itemId) {
  const checked = await getChecklistProgress(categoryId);
  return checked.includes(itemId);
}

export async function setItemChecked(categoryId, itemId, value) {
  const progress = await readProgress();
  const current = Array.isArray(progress[categoryId]) ? progress[categoryId] : [];
  const exists = current.includes(itemId);
  let next = current;
  if (value && !exists) next = [...current, itemId];
  else if (!value && exists) next = current.filter((id) => id !== itemId);
  await writeProgress({ ...progress, [categoryId]: next });
  return next;
}

export async function toggleItemChecked(categoryId, itemId) {
  const current = await isItemChecked(categoryId, itemId);
  await setItemChecked(categoryId, itemId, !current);
  return !current;
}

export async function getCategoryProgress(categoryId) {
  const category = CHECKLIST_ITEMS[categoryId];
  const total = category ? category.items.length : 0;
  const checked = await getChecklistProgress(categoryId);
  return { checked: checked.length, total };
}

export async function getAllCategoryProgress() {
  const progress = await readProgress();
  const result = {};
  for (const categoryId of Object.keys(CHECKLIST_ITEMS)) {
    const category = CHECKLIST_ITEMS[categoryId];
    const checked = Array.isArray(progress[categoryId]) ? progress[categoryId] : [];
    result[categoryId] = { checked: checked.length, total: category.items.length };
  }
  return result;
}
