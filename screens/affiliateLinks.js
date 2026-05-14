/**
 * utils/affiliateLinks.js
 *
 * Centralised affiliate / partner URL builder for Safar.
 * Replace the placeholder URLs with your actual affiliate links
 * before publishing to the App Store / Play Store.
 */

const BASE_LINKS = {
  // Hajj & Umrah packages
  hajjPackages:   "https://safar.app/partners/hajj",
  umrahPackages:  "https://safar.app/partners/umrah",

  // Travel essentials
  ihramClothing:  "https://safar.app/partners/ihram",
  luggageBags:    "https://safar.app/partners/luggage",
  travelInsurance:"https://safar.app/partners/insurance",

  // Books & learning
  hajjGuideBook:  "https://safar.app/partners/books",

  // Accommodation
  makkahHotels:   "https://safar.app/partners/hotels-makkah",
  madinahHotels:  "https://safar.app/partners/hotels-madinah",
};

/**
 * Returns the affiliate URL for a given key.
 * Optionally appends a UTM source tag.
 *
 * @param {keyof typeof BASE_LINKS} key
 * @param {string} [utmSource]
 * @returns {string}
 */
export function getAffiliateUrl(key, utmSource = "safar-app") {
  const base = BASE_LINKS[key];
  if (!base) {
    console.warn(`[affiliateLinks] Unknown key: "${key}"`);
    return "https://safar.app";
  }
  return `${base}?utm_source=${utmSource}`;
}

export default BASE_LINKS;
