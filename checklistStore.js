import AsyncStorage from "@react-native-async-storage/async-storage";

// Schema: object keyed by category id, each value is an array of checked item ids.
// Item content (labels, sections) is static and lives in CHECKLIST_ITEMS below —
// only checked state is persisted.

export const CHECKLIST_ITEMS = {
  documents: {
    title: "Documents",
    items: [
      { id: "doc-passport",     label: "Passport (valid 6+ months)",             daysOutThreshold: 120 },
      { id: "doc-visa",         label: "Visa",                                   daysOutThreshold: 45  },
      { id: "doc-insurance",    label: "Travel insurance",                       daysOutThreshold: 45  },
      { id: "doc-vaccine",      label: "Vaccination certificate",                daysOutThreshold: 45  },
      { id: "doc-hotel",        label: "Hotel booking confirmation",             daysOutThreshold: 90  },
      { id: "doc-flight",       label: "Flight booking confirmation",            daysOutThreshold: 90  },
      { id: "doc-contacts",     label: "Emergency contacts list",                daysOutThreshold: 14  },
    ],
  },
  packing: {
    title: "Packing",
    items: [
      { id: "pack-ihram",          label: "Ihram (2 sets)",                          daysOutThreshold: 30, section: "Clothing"     },
      { id: "pack-shoes",          label: "Comfortable walking shoes",               daysOutThreshold: 30, section: "Clothing"     },
      { id: "pack-clothing",       label: "Modest everyday clothing",                daysOutThreshold: 14, section: "Clothing"     },
      { id: "pack-jacket",         label: "Light jacket or shawl",                   daysOutThreshold: 14, section: "Clothing"     },
      { id: "pack-soap",           label: "Unscented soap",                          daysOutThreshold: 7,  section: "Toiletries"   },
      { id: "pack-shampoo",        label: "Unscented shampoo",                       daysOutThreshold: 7,  section: "Toiletries"   },
      { id: "pack-toothbrush",     label: "Toothbrush and toothpaste",               daysOutThreshold: 7,  section: "Toiletries"   },
      { id: "pack-towel",          label: "Small towel",                             daysOutThreshold: 7,  section: "Toiletries"   },
      { id: "pack-charger",        label: "Phone charger",                           daysOutThreshold: 7,  section: "Electronics"  },
      { id: "pack-adapter",        label: "Power adapter",                           daysOutThreshold: 10, section: "Electronics"  },
      { id: "pack-battery",        label: "Portable battery pack",                   daysOutThreshold: 10, section: "Electronics"  },
      { id: "pack-mat",            label: "Prayer mat",                              daysOutThreshold: 14, section: "Prayer items" },
      { id: "pack-tasbih",         label: "Tasbih",                                  daysOutThreshold: 14, section: "Prayer items" },
      { id: "pack-quran",          label: "Pocket Quran or Quran app downloaded",    daysOutThreshold: 21, section: "Prayer items" },
      { id: "pack-meds",           label: "Personal medications",                    daysOutThreshold: 21, section: "Medical"      },
      { id: "pack-firstaid",       label: "Basic first aid kit",                     daysOutThreshold: 21, section: "Medical"      },
      { id: "pack-painrelief",     label: "Pain relief and rehydration salts",       daysOutThreshold: 10, section: "Medical"      },
      { id: "pack-doc-copies",     label: "Printed copies of passport and visa",     daysOutThreshold: 3,  section: "Documents"    },
      { id: "pack-doc-confirms",   label: "Printed hotel and flight confirmations",   daysOutThreshold: 3,  section: "Documents"    },
    ],
  },
  spiritual: {
    title: "Spiritual preparation",
    items: [
      { id: "spi-niyyah",      label: "Learn the niyyah (intention) for your pilgrimage", daysOutThreshold: 14 },
      { id: "spi-duas",        label: "Memorize key du’ās for the journey",               daysOutThreshold: 30 },
      { id: "spi-tawbah",      label: "Make sincere tawbah (repentance)",                 daysOutThreshold: 90 },
      { id: "spi-debts",       label: "Settle outstanding debts",                         daysOutThreshold: 60 },
      { id: "spi-will",        label: "Write or update a will",                           daysOutThreshold: 90 },
      { id: "spi-family",      label: "Inform family of your intention and ask forgiveness", daysOutThreshold: 30 },
    ],
  },
  "before-leaving": {
    title: "Before leaving home",
    items: [
      { id: "bl-mail",         label: "Stop mail delivery",                          daysOutThreshold: 3  },
      { id: "bl-bills",        label: "Pay upcoming bills in advance",               daysOutThreshold: 7  },
      { id: "bl-neighbours",   label: "Inform neighbours of your travel dates",      daysOutThreshold: 5  },
      { id: "bl-pets",         label: "Arrange pet care",                            daysOutThreshold: 21 },
      { id: "bl-security",     label: "Set home security or ask someone to check in", daysOutThreshold: 21 },
      { id: "bl-emergency",    label: "Share emergency contacts with someone at home", daysOutThreshold: 10 },
      { id: "bl-offline",      label: "Download offline maps and apps for the trip", daysOutThreshold: 7  },
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
