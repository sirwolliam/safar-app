## Session addendum — Dua library rebuild (append to SAFAR TDD)

### Data: 65 new duas built, sourced, and reviewed (not yet confirmed merged)
- 16 Hajj/Umrah stage duas — deduped against the live 20-entry set, sourced
  from `duaLibrary.js` (an orphaned file in the codebase, never imported
  anywhere — worth checking if it's still needed for anything else).
- 39 general-library duas (Quran, Salah, gratitude, forgiveness, guidance,
  protection, patience, provision) — also from `duaLibrary.js`.
- 10 family/daily duas — sourced directly from sunnah.com's numbered Hisn
  al-Muslim edition (`sunnah.com/hisn:N`), NOT from duaLibrary.js. This is
  the better source going forward: every entry has a stable, individually
  citable permalink instead of a loose "Ibn Majah 3062"-style reference.
  **Recommend using sunnah.com/hisn as the default source for any future
  dua sourcing.**
- All 65 carry `verified:false` and a `review_flag` explaining any grading
  uncertainty. Nothing should flip to `verified:true` without a qualified
  scholarly reviewer — several entries cite weaker chains (muʿallaqah
  reports, fiqh manuals instead of hadith collections, vague "transmitted
  du'a" attributions) and are flagged as such rather than upgraded.
- Delivered as a Claude Code prompt (merge task), not yet confirmed applied
  — verify `duas-data.js` entry count (should be 85) before assuming this
  landed.

### Two bugs found and fixed (delivered via prompt, verify applied)
1. `dua-content.js` — `DUA_CONTENT.hajj` was pointing at the entire
   unfiltered `DUAS` array instead of the Hajj-filtered `HAJJ_DUAS`. This
   was the root cause of "everything shows up under Hajj & Umrah Duas."
2. `DuaListScreen.jsx` — had a silent fallback (`?? {id:"hajj",...}`) that
   masked bug #1, and didn't know how to read the `{category: key}` param
   shape that `MyDuasScreen.jsx`'s Theme/Mood tiles actually send (it only
   read `{list: {...}}`). Fixed with a `CATEGORY_META` mapping table.

### Known open items (flagged, not resolved — need a product decision)
- **Sleep (13 duas) and Daily (16 duas) have no tile anywhere** in the
  current `MyDuasScreen.jsx` (THEMES has 12 keys, MOODS has 5, neither
  includes sleep or daily). Content exists and is properly tagged, it's
  just unreachable in the UI.
- **Halq, Qurbani, and Mina-days (tashreeq) duas are stopgapped onto
  `stage:"Jamarat"`** — `STAGES`/`HAJJ_STAGES` in `dua-content.js` has no
  dedicated slot for them.
- **"Maqam" stage is sequenced after Sa'y** in `STAGES`, which is
  chronologically backwards (Maqam Ibrahim prayer happens right after
  Tawaf, before Sa'y). The new Maqam-Ibrahim entry was placed under
  `stage:"Tawaf"` instead of the existing "Maqam" stage as a workaround.
- **hu04/hu14 fuller-text variants** of the live `black-stone-takbir` and
  `jamarat` entries (fuller wording with "Bismillah"/"in humiliation of the
  devil") were found but NOT auto-applied — that's editing existing
  content, not adding new, and needs an explicit decision.
- **Category page layout mismatch found and a fix drafted (not yet
  confirmed applied):** flat mood/theme categories (Gratitude, Patience,
  etc.) were opening in the pilgrimage stage-image-block layout instead of
  a Tools/Hub-style hero header + individual dua cards. Fix plan: extract
  `THEMES`/`MOODS` metadata from `MyDuasScreen.jsx` into a shared
  `duaCategoryMeta.js`, give `DuaListScreen.jsx` two render modes
  (stage-grouped for multi-stage pilgrimage lists, flat-card for
  single-stage mood/theme lists), reusing each category's existing icon
  and header image for visual consistency between tile and destination.

### Content style rules confirmed this session
- The word "rites" should not appear anywhere in the app — reword
  naturally wherever found. A tagline duplicated across ~4 hub screens
  should get identical rewording everywhere, not drift into different
  phrasing per screen. (Queued in a prompt, verify applied.)
- Diacritical marks (ā ī ū ḥ ṣ ṭ ḍ ẓ ʿ ʾ) should be stripped from titles,
  stage names, and general app copy (e.g. "Ṭawāf" → "Tawaf") — but the
  `transliteration` field in `duas-data.js` entries keeps full diacritics,
  since that line exists for pronunciation accuracy. "al-" hyphenated
  compounds stay as-is (already the app's convention, per
  `ProgressScreen.jsx`'s "Tawaf al-Qudum", "Jamrat al-Aqabah").
