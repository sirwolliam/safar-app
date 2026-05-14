/**
 * utils/affiliateLinks.js — Safar
 *
 * Automatically routes users to their regional Amazon storefront
 * with the correct affiliate tag for that region.
 *
 * Setup:
 *   1. Sign up for Associates in each region (see AFFILIATE_TAGS below)
 *   2. Replace the placeholder tags with your real tracking IDs
 *   3. For regions you haven't signed up for yet, the default US tag is used
 *
 * Associate program links:
 *   US:  https://affiliate-program.amazon.com
 *   UK:  https://affiliate-program.amazon.co.uk
 *   CA:  https://associates.amazon.ca
 *   AU:  https://affiliate-program.amazon.com.au
 *   MY:  https://associates.amazon.com.my
 *   DE:  https://partnernet.amazon.de   (Germany — large Turkish Muslim community)
 *   FR:  https://partenaires.amazon.fr  (France — large North African Muslim community)
 */

import { NativeModules, Platform } from "react-native";

// ── Your affiliate tags — replace with real IDs after approval ───────────────
// Format: US tags end in -20, UK in -21, CA in -20, AU in -22, MY in -22

const AFFILIATE_TAGS = {
  GB: "YOUR_UK_TAG-21",       // amazon.co.uk  — sign up first
  US: "YOUR_US_TAG-20",       // amazon.com
  CA: "YOUR_CA_TAG-20",       // amazon.ca
  AU: "YOUR_AU_TAG-22",       // amazon.com.au
  MY: "YOUR_MY_TAG-22",       // amazon.com.my
  DE: "YOUR_DE_TAG-21",       // amazon.de
  FR: "YOUR_FR_TAG-21",       // amazon.fr
  default: "YOUR_US_TAG-20",  // fallback for any unlisted country
};

// ── Regional storefront domains ───────────────────────────────────────────────
// Countries without their own storefront fall back to amazon.com

const AMAZON_DOMAINS = {
  GB: "amazon.co.uk",
  IE: "amazon.co.uk",    // Ireland → UK store
  US: "amazon.com",
  CA: "amazon.ca",
  AU: "amazon.com.au",
  NZ: "amazon.com.au",   // New Zealand → AU store
  MY: "amazon.com.my",
  SG: "amazon.sg",
  DE: "amazon.de",
  AT: "amazon.de",       // Austria → DE store
  CH: "amazon.de",       // Switzerland → DE store
  FR: "amazon.fr",
  BE: "amazon.fr",       // Belgium → FR store
  NL: "amazon.nl",
  // All others (PK, BD, NG, EG, TR, ID etc.) → amazon.com
  default: "amazon.com",
};

// ── Get user's country code ───────────────────────────────────────────────────

function getCountryCode() {
  try {
    let locale = "";

    if (Platform.OS === "ios") {
      // iOS: AppleLocale format is "en_GB", "ur_PK" etc.
      locale =
        NativeModules.SettingsManager?.settings?.AppleLocale ||
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
        "";
    } else {
      // Android
      locale = NativeModules.I18nManager?.localeIdentifier || "";
    }

    // Extract country code — last 2 uppercase letters after underscore or hyphen
    const match = locale.match(/[_-]([A-Z]{2})$/);
    if (match) return match[1].toUpperCase();

    // Fallback: try to extract from language tag like "en-GB"
    const parts = locale.split(/[-_]/);
    if (parts.length >= 2) return parts[parts.length - 1].toUpperCase();
  } catch {
    // Silently fall back
  }
  return "US";
}

// ── Build affiliate URL ───────────────────────────────────────────────────────

/**
 * Returns a region-specific Amazon search URL with the correct affiliate tag.
 *
 * @param {string} searchQuery  e.g. "ihram clothing hajj"
 * @returns {string}            Full Amazon URL with affiliate tag
 *
 * Usage:
 *   const url = getAffiliateUrl("ihram clothing hajj");
 *   Linking.openURL(url);
 */
export function getAffiliateUrl(searchQuery) {
  const country = getCountryCode();
  const domain  = AMAZON_DOMAINS[country]  ?? AMAZON_DOMAINS.default;
  const tag     = AFFILIATE_TAGS[country]  ?? AFFILIATE_TAGS.default;
  const encoded = encodeURIComponent(searchQuery);

  return `https://www.${domain}/s?k=${encoded}&tag=${tag}`;
}

/**
 * Returns a region-specific Amazon product URL by ASIN.
 * Only use this if you've verified the ASIN exists in each region.
 * For most cases, use getAffiliateUrl() with a search query instead.
 *
 * @param {string} asin  Amazon product ID e.g. "B08XYZ123"
 */
export function getAffiliateProductUrl(asin) {
  const country = getCountryCode();
  const domain  = AMAZON_DOMAINS[country]  ?? AMAZON_DOMAINS.default;
  const tag     = AFFILIATE_TAGS[country]  ?? AFFILIATE_TAGS.default;

  return `https://www.${domain}/dp/${asin}?tag=${tag}`;
}

/**
 * Returns the user's detected country code.
 * Useful for debugging or showing a "Shopping on amazon.co.uk" label.
 */
export function getDetectedCountry() {
  const country = getCountryCode();
  return {
    country,
    domain: AMAZON_DOMAINS[country] ?? AMAZON_DOMAINS.default,
    isSupported: !!(AMAZON_DOMAINS[country]),
  };
}
