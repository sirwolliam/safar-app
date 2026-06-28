# Safar — Technical Design Document
*Hajj & Umrah pilgrimage companion app. React Native (Expo).*
*Last verified: 2026-06-25. This TDD is derived from the actual code, not aspiration — keep it that way.*

---

## 0. How to use this document (read first)

- **This TDD describes what IS, not what's planned.** When code and this doc disagree, the code wins — then fix this doc.
- The previous TDD became unreliable because it claimed features existed that weren't wired. To prevent that: **before building anything, grep the code for the specific thing you're about to build** to confirm it doesn't already exist and to see its real state.
- **File drift is the recurring hazard.** Delivered files in `/outputs` are not automatically merged back into the project. At the start of any work session, confirm the true state of the file you're editing rather than assuming a prior change landed.
- Working directory for source is the project root; screens live in `screens/`.

---

## 1. Product summary

Safar is a companion app for Muslims preparing for and undertaking Hajj or Umrah.

**Core purpose — consolidation, not crisis management.** Today everything a pilgrim needs is scattered: flight and hotel details in email, coordination in WhatsApp groups, ritual explainers on YouTube, du'ās on random websites, packing and prep advice in podcasts, money in a currency app. Safar's job is to bring all of that into one calm place, so that during the journey — focused, moved, surrounded by an intense, stimulating environment — the pilgrim is not context-switching across six apps to find the thing they need. The emotional job is **protect focus and presence**, not soothe panic.

**Two modes of use, both first-class:**
- **Before departure — a preparation hub.** Where most engagement happens. AI trip planner pulls logistics in from booking emails; guides and the du'ā library let the pilgrim learn and bookmark; media and shop pages let them prepare without falling into a YouTube/marketplace rabbit hole; checklist and countdown give a felt sense of readiness. The pilgrim builds the app up beforehand so they barely have to think during the journey.
- **During the journey — a focused companion.** Quick, **offline**, instant reference for the steps and du'ās of each ritual; a place to journal and take notes while the experience is fresh; and the ability to share milestones and photos with travel-group members and loved ones without leaving their headspace.

**Audience.** First-time pilgrims across a wide age range — **teens through 50s, all ages**, not skewed older. Mixed tech-comfort. They may be *concerned* about getting rituals right, but the framing is not terror — it's a meaningful, emotionally heightened journey they want to be present for. Because the age range is broad, the design target is **neutral, not aimed at any one generation**: clean, calm, content-forward, unfussy. Avoid both extremes — oversized type / heavy iconography reads "old," while bright accents / playful motion / trendy layouts read "young." Neutral here still means **warm and calm, not sterile** — keep Safar's parchment/gold/serif warmth and reverence; just don't push any stylistic lever to an extreme. Design priorities that follow: **calm, legible, low cognitive load, simple navigation, and instant offline access** to anything in the "during" set (the Haram is a connectivity dead zone — network dependence for ritual reference is a functional failure).

**Design north star.** Every feature earns its place by answering: *does this stop the pilgrim from leaving Safar to go do this elsewhere?* Consolidation is the thing to protect. No feature should pull the pilgrim into a distracting, endless-scroll experience — curation over feed, everywhere.

**Milestone sharing is central, not social.** Marking a moment ("completed Ṭawāf, alḥamdulillāh"), sharing a photo, letting loved ones feel part of the journey. This is an emotional core feature, delivered via WhatsApp/Linking — NOT a built-in social network or chat.

The app is organized around **Four Pillars**: Learn, Practice, Plan, Connect — surfaced as cards on the Home screen, each opening a Hub. (Note: "Practice" is the chosen spelling app-wide, Americanized from British "Practice".) *Open question for the structure redesign: whether these four pillars match how a pilgrim actually thinks (closer to "before I go / the rituals / while I'm there / my people") and whether Home should adapt to journey stage rather than presenting the same menu throughout.*

---

## 2. Tech & conventions

- **Framework:** React Native via Expo.
- **Navigation:** `@react-navigation` — bottom tabs + native stacks.
- **Storage:** `@react-native-async-storage/async-storage`.
- **Icons:** `phosphor-react-native`. ALWAYS verify an icon name exists before use (e.g. `Kaaba` and `Dove` do NOT exist; use `Mosque`, `HandHeart`, `StarAndCrescent`). No emoji in UI.
- **SVG:** `react-native-svg`.
- **Font:** `SourceSerif4-Regular` (constant `SERIF`).
- **Other deps in use:** `expo-haptics`, `react-native-safe-area-context`, `expo-linear-gradient`.

### Folder structure (VERIFIED 2026-06-23 — do not reorganize)
- **Entry point:** `App.js` lives in the **root** (the `screens/App.js` copy is a stale stray — slated for archival).
- **Screens** (navigation destinations: HomeScreen, ProfileScreen, etc.) live in **`screens/`**.
- **Shared modules** (`theme.js`, `AccessibilityContext.js`, `dua-content.js`, `duaLibrary.js`, `firebase.js`, `duas-data.js`) live in the **root**, imported from screens as `../` (e.g. `from "../theme"` — 43 such imports; from "../AccessibilityContext" — 15; "../dua-content" — 8; "../firebase" — 5).
- **Why it's written down:** these locations are dictated by the import paths. Moving a shared module (e.g. `theme.js` → `screens/`) would break dozens of `../` imports for zero benefit. Leave them. The structure (screens together, shared modules one level up) is conventional and correct for this app's size — don't "tidy" it.
- A lone `./theme` import (vs the 43 `../theme`) is a tell of a stale duplicate screen, not a reason to move theme.js.
- **Attic:** `versions/` and assorted root/`screens/` `.jsx` duplicates are old hand-saved backups (the project was manually version-controlled before git). To be archived OUT of the project so the folder is unambiguous for tools/agents. Git is now the version history; manual `copy N` files are redundant.

### Coding rules (hard-won)
1. `StyleSheet.create` at module level.
2. **No `&&` in style arrays** — use ternaries. `style={cond ? [a, b] : a}`, never `style={[a, cond && b]}`. (Documented crash pattern.) Same caution for `&&` rendering JSX children when the left side could be `0` or `""`.
3. Phosphor icons only, verified to exist. No emoji.
4. After edits: `npx expo start --clear` (Metro caches aggressively; `--clear` is required to see changes).
5. Verify JSX parses before delivering (e.g. `@babel/parser` with plugins `["jsx","flow"]`).
6. Propose design in plain language and get sign-off before coding (esp. for anything structural/visual).
7. Read the existing file — and grep for the SPECIFIC feature — before writing, to avoid duplicating an existing section.
8. Don't reproduce fabricated Islamic content. Arabic, translations, hadith citations must come from real sources; unverified entries flagged `verified:false` pending qualified human review.

---

## 3. Theme tokens (`theme.js`)

- `background` #EDE6D8 (parchment, deepened for card contrast)
- `card` #FDFAF4 (cream-white)
- `primary` #2F5D50 (forest green)
- `gold` #C8A96A (and darker golds #BF9F60, #9A7A3A for text/icons)
- `text` #1A1712
- `subtext` #5A5650 (darkened for legibility)
- `border` #D4D0CA

---

## 4. Navigation structure (VERIFIED CURRENT)

**5 bottom tabs (current code):** Home · Journey · Duas · Tools · Prepare (custom `SafarTabBar`, Duas is the centered button). Focus tab retired — it overpromised a do-not-disturb worship mode; the counters (Ṭawāf/Saʿy/Dhikr) are accessible via Tools and Duas tabs instead.

**App boots through an onboarding gate:** reads AsyncStorage flag `safar_onboarded_v1`; if unset → `Onboarding` (OnboardingFlow), else → `MainTabs`. Onboarding writes the flag and `replace("MainTabs")` on completion. No forced signup — onboarding-only by design; signup deferred to where it's contextually needed later. "Restart Setup" lives in Settings.

### Stacks and screens
- **HomeStack:** HomeMain, Hub, **PlanHub** (PlanHubScreen), UmrahGuide, HajjGuide, WhatToExpect, Groups, Guides (GuidesHubScreen), Tools, Shop, Media, Notes, Settings, Notifications
- **JourneyStack:** JourneyMain, Map, SiteDuas*, WhatToExpect, Groups, GroupDetail, Connections, MyBoard, MyContacts, Tawaf, Saiy
- **DuasStack:** MyDuas, DuaList, Dhikr
- **ToolsStack:** ToolsMain, PrayerTimes, Qibla, CurrencyConverter, Tawaf, Saiy, Dhikr
- **PrepareStack:** PrepareMain (ProfileScreen), Bookmarks, Notes, CurrencyConverter, Support, Settings
- **Root Stack (full-screen, no tab bar):** Onboarding, MainTabs, DuaDetail, StepGuide (ProgressScreen), PracticeLearn, PrintOffline, PilgrimageDuas, SafarAssist, SacredPlaces

\*SiteDuas is currently a thin inline placeholder defined inside App.js, not the full SacredPlacesScreen.

**Status: zero dead links** as of last verification. All `navigate()` targets resolve to registered routes.

### Retired (files kept, intentionally unwired — do not re-wire without reason)
- `GuidesScreen.jsx` — 945-line pre-Hub monolith, superseded by the Four Pillars + Hub pattern.
- `MyJourneyScreen.jsx` — personal dashboard, superseded by Plan hub.
- `BoardScreen.jsx` — old twin of MyBoardScreen (MyBoard is current).

### Parked components (`parked-components.jsx`)
`FocusModeCard` and `SacredPlacesCard` — removed from Home to cut clutter, preserved for reuse on a future screen. Not imported anywhere yet.

---

## 5. Home screen (current design)

Vertical order: **hero slideshow → welcome card → Four Pillars → My Journey card → My Shortcuts → Du'ā of the Day.**

- **Hero:** full-bleed image (no beige top bar); uses `useSafeAreaInsets()` to offset salam/name/badge below the notch; light-content StatusBar.
- **Four Pillars:** cards (NOT pills — pills imply filtering; pillars are navigation). Each opens `Hub` with `{ hub: "learn"|"practice"|"plan"|"connect" }`. (Route param key stays "practice" internally; visible label is "Practice".) Pillar secondary text matches hero card secondary text (13px, ~0.92 opacity).
- **My Journey card:** below pillars. Countdown + quick-links row (Board, Checklist, Contacts, Groups). Arrow → Plan hub. *Kept deliberately despite Plan-pillar overlap — different intent (shortcut vs destination). Rule: journey quick-links must stay consistent with Plan/Connect hubs, never drift.*
- **My Shortcuts:** 2×4 grid, light-gold tiles (#F3E9D2 bg, gold border, #9A7A3A icons, #6A5A38 labels) — quiet, doesn't compete with pillars. 8 items: Groups, Guides, Shop, Prayer Times, Media, Tools, Notes, Settings.
- **Du'ā of the Day:** styled to match DuaDetailScreen — geometric SVG pattern header (`PATTERN_PATH` from `./headerPatternPath`), large centered serif Arabic, italic transliteration, serif translation. Source caption collapsed to a small "Du'ā sources" line + Info icon → modal popup with full scholarly text.
- Section titles ("Explore", "My Shortcuts", "Today's Du'ā") use the plain `pillarsHeaderText` style.

---

## 6. Content: Du'ās

- Normalized schema designed for DB/CMS import: id, title, arabic, transliteration, translation, source_collection/reference/full, authenticity (sahih/hasan/quran), stage, stage_order, categories[], keywords[], is_featured, audio_traditional/gentle, verified/verified_by/verified_date.
- `dua-content.js` is the adapter mapping normalized fields to screen field names; builds content by category tag. Has a `SHOW_UNVERIFIED` dev toggle.
- ~20 entries sourced (pilgrimage du'ās + sleep/protection adhkar) from Hisn al-Muslim. **All `verified:false` pending scholar review.** Categories still needing harvest: guidance, patience, family, daily, morning/evening adhkar, repentance.
- **Never fabricate** Arabic/translation/citations.

---

## 7. Design principles (agreed)

- **Pillars = cards, not pills.** Use pills only for filterable content (Du'ā library, Media).
- **Hub link cards:** uniform MEDIUM rich cards (~90–110px, photo + title + one-line desc) — "premium but not huge." Consistency reads as premium. (1–2 may be larger as primary; rest compact — mix decided per hub.)
- **Card cohesion principle:** shared "grammar" (radius / shadow / border / spacing / type tokens) + deliberate 1–2 variable deviations for hierarchy. NOT all identical (blends together), NOT all different (looks random). Define a named card-tier system as its own focused pass.
- **Match the app's existing card style** rather than inventing new looks: `colors.card` fill, thin `colors.border`, the standard subtle warm shadow (as DuaCard / HubScreen use).
- Low cognitive load, legible, calm — the audience spans all ages (teens–50s), so keep the style **neutral**: not optimized for one generation, warm but never sterile, no stylistic lever pushed to an extreme.
- Don't over-design; live with changes on device before iterating further.

---

## 7b. Hub design + Plan + Personal Collection (DECIDED 2026-06-23)

### Hub template (APPROVED — applies to all four pillar hubs)
Visual template locked from design mockups. Structure top→bottom:
1. **Colored hero header band** (pillar's identity color, subtle `expo-linear-gradient` — keep direction/intensity identical across all four). Holds: salam + name + search (quiet), large serif pillar title, one-line warm intent subline.
2. **Sub-nav pills** (Learn/Practice/Plan/Connect) for lateral hopping between hubs.
3. **One emphasized context card** — the single "loudest" body element; personal + live (e.g. "Continue learning 60%", "Trip countdown 42 days"). MUST have a graceful **empty state** for new users / no-date users (e.g. "Set your travel dates", "Start your first guide") — never show a broken-looking empty countdown. Date stays optional.
4. **Uniform list rows** — tinted icon square + title + one-line sub + chevron. Same grammar across all hubs (this is the "shared grammar + 1 deliberate deviation" principle; the deviation is the hero/promoted card).
- **Hierarchy rule: ONE hero per hub.** Promoting two cards dilutes both. Each hub gets a single promoted card; rest uniform.
- **Neutrality:** color confined to the header keeps it calm/all-ages (resolves the saturation risk of fully-colored cards). Earthy muted hues, not bright.
- **To verify:** amber (Practice) header — white text contrast may be marginal; test for legibility (outdoor/Makkah sun, all ages).
- Build **Plan first** as the reference implementation, then roll the template to the others. ✓ **Plan hub built 2026-06-24** — see `screens/PlanHubScreen.jsx`.

### Plan hub — contents & order (DECIDED)
Ordered as you'd actually plan a trip (sequence = a path, not a menu):
1. **SafarAssist** — *promoted hero card* (taller/richer/distinct, may carry pillar color). "Import your travel details, we set up the rest." The headline feature + first step that populates everything downstream.
2. **What to Expect** — deliberately placed in Plan (not Learn): it informs what you plan, buy, expect. (Accept the Learn/Plan overlap on purpose.)
3. **Checklist** — pack & prepare. *(Fix: currently mis-points to `PracticeLearn`; route to real checklist.)*
4. **Shop**
5. **Contacts**
6. **Media** — videos, articles, podcasts.
7. **Official Resources** — links.
8. **Bookmarks** — (capture point → feeds the Collection; see below)
9. **Notes** — (capture point → feeds the Collection)
- **Currency** — keep, low/near the reference end; a dip-in tool, not a planning stage.
- **My Board is REMOVED from Plan.** One hero per hub = SafarAssist owns Plan's top; My Board owned Journey. (And My Board is being replaced — see Collection.)

### Personal Collection system (DECIDED — separate build, do NOT block Plan on it)
Replaces "My Board" (kill the dashboard execution; the idea was sound, the design wasn't).
- **One personal collection, lives in the Journey tab** — gathers ALL bookmarks, saved du'ās, and notes for the trip. The "everything I kept, one spot, one link" surface. Accessible **before and during** (during = highest need; why Journey beats Prepare).
- **Capture happens anywhere, in context; everything flows into the one store.** Plan's Notes/Bookmarks rows are *capture points*, not separate stores.
- **Notes & Bookmarks are category-aware** — tagged by pillar (Learn/Practice/Plan/Connect) or topic/rite. This tagging is the spine that lets one store serve many views.
- **Hubs show filtered VIEWS of the one store**, not their own copies. e.g. Plan's "planning notes" = the collection filtered to the Plan tag. One Notes system, one Bookmarks system, many lenses.
- **Capture must never require categorizing** — provide a neutral default (general/uncategorized). Capture first, categorize optionally (no friction when pasting a quick thought).
- **Scope note:** this is its own build pass (unified store + tagging + filtered views across multiple screens). Ship the Plan *hub* on the approved template first; build the Collection system after. Plan's template doesn't depend on it.

---

## 7c. Plan hub — built (2026-06-24)

`screens/PlanHubScreen.jsx` — dedicated screen (not a config of the old HubScreen) implementing the approved hub template for the Plan pillar.

**Wiring:**
- Registered in HomeStack as `PlanHub` (App.js)
- Both Plan pillar entry points in HomeScreen updated: `navigate("PlanHub")` replaces the old `navigate("Hub", { hub: "plan" })`

**Layout (top → bottom):**
1. `expo-linear-gradient` header band (navy: `#1A202E` → `#101828`) with salam + name, large serif "Plan" title, subtitle
2. Segmented control sub-nav (Learn · Practice · Plan · Connect) — matches MyDuasScreen pill style; active pill tracks state, tapping Learn/Practice/Connect navigates to `Hub` with the corresponding key
3. SafarAssist hero card (full-width, navy gradient) — three live states driven by AsyncStorage:
   - **State A** (no trip): "Set up your trip in seconds" + "Import details" CTA → `navigate("SafarAssist")`
   - **State B** (trip + date): countdown number + "days until your departure" + "Review details →" → `navigate("SafarAssist")`
   - **State C** (trip saved, no date): "Trip details saved — add your dates" + "Review details" CTA → `navigate("SafarAssist")`
   - Keys read: `safar_departure_date_v1`, `safar_journey_board_v1`, `safar_user_name_v1`
4. Nine uniform list rows (tinted navy icon square + title + sub + chevron), in approved order

**Navigation status per row:**
- What to Expect → `WhatToExpect` (HomeStack) ✓
- Checklist → **Soon** (no real screen yet)
- Shop → `Shop` (HomeStack) ✓
- Contacts → `Journey` tab / `MyContacts` ✓
- Media → `Media` (HomeStack) ✓
- Official Resources → **Soon** (no screen yet)
- Bookmarks → `Prepare` tab / `Bookmarks` ✓
- Notes → `Notes` (HomeStack) ✓
- Currency → `CurrencyConverter` (HomeStack) ✓

---

## 8. Open items / next steps

**Sequenced plan:** (1) sitemap ✓ done · (2) redesign structure together · (3) refine/design each page · (4) finalize content (du'ā audio, media links).

**Immediate next:** structure redesign conversation — is the 5-tab + 4-pillar model right? Where do SacredPlaces and SafarAssist best belong? How should each Hub be organized (with the medium rich-card treatment)?

**Then:** roll the hub template to Learn, Practice, and Connect (Plan is the reference — see `PlanHubScreen.jsx`).

**Content to finalize:** du'ā audio (traditional + gentle), media links, harvest remaining du'ā categories, scholar verification pass to flip `verified:true`.

**Unresolved screen questions (need product owner's memory):**
- `ImportTripScreen` (904 lines) — likely tied to SafarAssist; built, was orphaned. Keep/wire/retire?
- `NotificationsScreen` — built, unwired. Not-yet-wired or abandoned?
- `AuthScreen` — built, unwired. Deferred by design (onboarding-only chosen); revisit if/when a real auth backend exists.
- `HajjUmrahPickerScreen` — du'ā-library gateway; confirm its role vs GuidesHubScreen.
- `SacredPlacesScreen` — now registered, but in-app only reached from the retired GuidesScreen; needs a real entry point in the redesign.

**Known caveats:**
- GuidesHubScreen uses `require("../assets/tawaf.jpg")` and `arafah.jpg` — confirm those assets exist or swap.
- ShopScreen imports `getAffiliateUrl` from `"../utils/affiliateLinks"` — confirm the file resolves at that path in the real folder tree.
- Nothing here is device-tested by the assistant; code-level verification only. Confirm on simulator.
