# Safar — Technical Design Document
*Hajj & Umrah pilgrimage companion app. React Native (Expo).*
*Last verified: 2026-10-26 against code (App.js and every file reachable from it). This TDD is derived from the actual code, not aspiration — keep it that way.*

---

## 0. How to use this document (read first)

- **This TDD describes what IS, not what's planned.** When code and this doc disagree, the code wins — then fix this doc.
- The previous TDD became unreliable because it claimed features existed that weren't wired. To prevent that: **before building anything, grep the code for the specific thing you're about to build** to confirm it doesn't already exist and to see its real state.
- **File drift is the recurring hazard.** Delivered files in `/outputs` are not automatically merged back into the project. At the start of any work session, confirm the true state of the file you're editing rather than assuming a prior change landed.
- Working directory for source is the project root; screens live in `screens/`.

---

## 1. Product summary

Safar is a companion app for Muslims preparing for and undertaking Hajj or Umrah. Audience: all ages, teens to 50s, explicitly not skewed older. Design tone: warm, calm, reverent — not sterile, not aimed at any one generation. The app should feel like a trusted companion, not a clinical tool.

"Consolidation, not crisis management" is the product north star. Every feature earns its place by answering: does this stop the pilgrim from leaving Safar to do this elsewhere?

The app is organized around Four Pillars: Plan, Learn, Practice, Connect — each is a bottom tab with its own hub screen (`PlanMainScreen`, `LearnMainScreen`, `PracticeMainScreen`, `ConnectMainScreen`; see §4 and §7a). "Practice" is the chosen spelling app-wide (American, not British "Practise").

Three distinct user states drive feature prioritization:
1. Pre-trip (weeks/months out) — planning, learning, memorizing, building lists
2. In-the-moment (performing rites) — fast access, offline, large text
3. Post-trip — reflection, sharing

---

## 2. Tech & conventions

- **Framework:** React Native via Expo.
- **Navigation:** `@react-navigation` — bottom tabs + native stacks.
- **Storage:** `@react-native-async-storage/async-storage`.
- **Icons:** `phosphor-react-native`. ALWAYS verify an icon name exists before use (e.g. `Kaaba` and `Dove` do NOT exist; use `Mosque`, `HandHeart`, `StarAndCrescent`). No emoji in UI.
- **SVG:** `react-native-svg`.
- **Font:** `SourceSerif4-Regular` (constant `SERIF`).
- **Other deps in use:** `expo-haptics`, `react-native-safe-area-context`, `expo-linear-gradient`, `expo-blur`. **Expo SDK 58** (`expo` ^58.0.19, `react-native` 0.88.0); Node 22.13+ required. Search uses `fuse.js` 7; the journey graphic viewer uses `react-native-image-viewing` 0.2.2.

### Folder structure (VERIFIED 2026-06-23 — do not reorganize)
- **Entry point:** `index.js` → `App.js`, both in the **root**. (The old `screens/App.js` stray is gone.)
- **Screens** (navigation destinations: HomeScreen, ProfileScreen, etc.) live in **`screens/`**.
- **Shared modules** (`theme.js`, `AccessibilityContext.js`, `dua-content.js`, `duaLibrary.js`, `firebase.js`, `duas-data.js`) live in the **root**, imported from screens as `../` (e.g. `from "../theme"` — 43 such imports; from "../AccessibilityContext" — 15; "../dua-content" — 8; "../firebase" — 5).
- **Why it's written down:** these locations are dictated by the import paths. Moving a shared module (e.g. `theme.js` → `screens/`) would break dozens of `../` imports for zero benefit. Leave them. The structure (screens together, shared modules one level up) is conventional and correct for this app's size — don't "tidy" it.
- A lone `./theme` import (vs the 43 `../theme`) is a tell of a stale duplicate screen, not a reason to move theme.js.
- **Attic:** `versions/` is gone; `backups/` holds old hand-saved copies. Several orphaned files still sit in the tree (not imported from `App.js`): `components/{AudioPlayer, DuaCard, GuideCarousel, HubBar, HubQuickNav, OnboardingCarousel, SafarButton, SafarCard, SafarIcons, SafarTabBar}.jsx`, `screens/{AudioPlayer, AuthScreen, DuaCard, FocusScreen, GuideCarousel, HajjUmrahPickerScreen, HomeHeroSlideshowCompact, HomeMyJourneyCard, ImportTripScreen, OnboardingCarousel, ProfileScreen, ProfileSettingsRow, QuizReviewScreen}.jsx`, `screens/{affiliateLinks, dua-content, theme}.js`, and root `affiliateLinks.js`, `duaLibrary.js`, `i18n.js`, `audio-generation-script.js`, `family-daily-duas-fortress.js`, `general-library-duas-additions.js`, `hajj-umrah-duas-additions.js`. Git is the version history.

### Coding rules (hard-won)
1. `StyleSheet.create` at module level, **literal values only** — no token references (`colors.primary`, `spacing(2)`) inside screen StyleSheets.
2. **No `&&` in style arrays** — use ternaries. `style={cond ? [a, b] : a}`, never `style={[a, cond && b]}`. (Documented crash pattern.) Same caution for `&&` rendering JSX children when the left side could be `0` or `""`.
3. Phosphor icons only, verified to exist. No emoji.
4. After edits: `npx expo start --clear` (Metro caches aggressively; `--clear` is required to see changes).
5. Verify JSX parses before delivering (e.g. `@babel/parser` with plugins `["jsx","flow"]`).
6. Propose design in plain language and get sign-off before coding (esp. for anything structural/visual).
7. Read the existing file — and grep for the SPECIFIC feature — before writing, to avoid duplicating an existing section.
8. Don't reproduce fabricated Islamic content. Arabic, translations, hadith citations must come from real sources; unverified entries flagged `verified:false` pending qualified human review.
9. **No `react-native-reanimated`** — use the built-in `Animated` API only.
10. **No new packages** without explicit approval. If a new dependency is needed, stop and ask before installing.
11. **Read before writing** — before making any edit, read the target file in full. Never write new code without understanding what already exists. Do not apply "quick fixes" that solve the immediate symptom but create future problems. If a proper fix requires restructuring, do it correctly.
12. **No silent assumptions** — if a file, component, or screen is referenced but not confirmed to exist, check first. Never assume a file exists or contains specific code without reading it.
13. **StyleSheet literal values only** — no `colors.`, `spacing()`, `radius()`, `typography.`, or `shadows.` token references inside `StyleSheet.create`. Hardcoded literal hex values only.

---

## 3. Color system (screen-level decisions)

Do not use theme.js tokens inside `StyleSheet.create`. Use literal hex values.

### Core palette
- Page background: `#F5F0E8` (parchment)
- Page background darker: `#F0EBE1`
- Card background: `#FDFAF4` (warm white)
- Card background warm: `#FDF7EE`
- Dark base: `#1A1410`
- Gold accent: `#C8A96A`
- Sage green (action/active): `#4A5C48`
- Divider: `#EDE4D4`
- Border: `#DDD5C0`
- Text primary: `#1A1410`
- Text secondary: `#8A7D6A`
- Text muted: `#5C534A`

### Pillar identity colors (icon squares + gradient base + active pill)
| Pillar  | Color   | Feel        |
|---------|---------|-------------|
| Plan    | #2E4560 | Navy        |
| Learn   | #2D4F32 | Forest green|
| Practice| #4E3414 | Amber       |
| Connect | #3D2240 | Plum        |

Tools (`#3A2F1E`) and Prepare (`#3A3545`) were identities for tabs that no longer exist — see *Retired / designed, not built*.

### Typography rule (agreed 2026-07-06)
- **Serif (`SourceSerif4-Regular`):** page titles ONLY and sacred Arabic content.
- **Everything else:** system sans-serif (omit `fontFamily` entirely).
- **Rationale:** full serif throughout felt dated and heavy across all ages. Sans-serif for navigation and utility content feels lighter and more modern while serif page titles maintain warmth and identity.

### theme.js tokens (reference only — do not use in StyleSheet.create)
- `background` #EDE6D8 · `card` #FDFAF4 · `primary` #2F5D50 · `gold` #C8A96A · `text` #1A1712 · `subtext` #5A5650 · `border` #D4D0CA

---

## 4. Navigation structure (verified 2026-10-26 against App.js)

**App boots through an onboarding gate:** reads AsyncStorage flag `safar_onboarded_v1`; if unset → `Onboarding` (OnboardingFlow), else → `MainTabs`. Onboarding writes the flag on completion. No forced signup — onboarding-only by design.

**5 bottom tabs, in order:** Home · Plan · Learn (centre, raised button) · Practice · Connect.

| Tab | Icon | Stack | Registered screens (first = tab root) |
|---|---|---|---|
| Home | House | HomeNavigator | HomeMain, Settings, Support, Notifications |
| Plan | ListChecks | PlanNavigator | PlanMain, Notes, Calendar, Checklists, ChecklistDetail, CurrencyConverter, MyBoard, MyContacts, Support, Shop, WhatToExpect, OfficialResourcesScreen, Media |
| Learn | BookOpenText (centre) | LearnNavigator | LearnMain, UmrahGuide, HajjGuide, LessonFlow, LessonList, Guides, WhatToExpect, Media, SacredPlaces, Map, MapStepList, IslamicReferences, QuizHub, Quiz, QuizResults, Shop |
| Practice | Moon | PracticeNavigator | PracticeMain, MyDuas, DuaList, Moods, Dhikr, Tawaf, Saiy, PrayerTimes, Qibla, PracticeLearn |
| Connect | UsersThree | ConnectNavigator | ConnectMain, Groups, GroupDetail, Connections, MyContacts, Moments, MomentCreator |

**Root stack (full-screen, no tab bar):** Onboarding, PillarIntro, MainTabs, DuaDetail, StepGuide (ProgressScreen), PracticeLearn, PrintOffline, PilgrimageDuas, SafarAssist, SacredPlaces, Search.

- All stacks: `headerShown: false`; tab stacks use `animation: "none"`.
- **`backBehavior`** is not set on the Tab navigator → library default **`firstRoute`**. A `goBack()` that a tab's stack can't handle (e.g. on a tab root) switches to the **Home** tab.
- Screens registered in more than one place: Support (Home, Plan), MyContacts (Plan, Connect), WhatToExpect / Media / Shop (Plan, Learn), SacredPlaces (Learn, root), PracticeLearn (Practice, root).
- **Cross-tab navigation idiom:** `navigation.getParent().navigate(tab, { screen, initial: false, params: { returnToTab } })` — `initial: false` keeps the tab's hub underneath so Back lands there. Root-stack screens (Search, DuaDetail, PilgrimageDuas, SafarAssist, SacredPlaces) are reached with a plain `navigate(name)` from anywhere; Search reaches tab screens with the nested `MainTabs › tab › screen` form.

**Custom tab bar:** inline `SafarTabBar` function in `App.js` (the `components/SafarTabBar.jsx` file is orphaned).
- Tab bar prop: `tabBar={(props) => <SafarTabBar {...props} />}`
- **CRITICAL:** must use spread `{...props}` not `navProps={props}` — the function destructures `{state, descriptors, navigation}` directly.
- Tapping a tab always resets it to its landing screen (`navigate(tab, { screen: <TabMain>, initial: true })`).
- Learn is the centre tab: a raised 56px circle (`center: true` in `TAB_CONFIG`).

**HubBar:** `components/HubBar.jsx` is orphaned (not imported). See *Retired / designed, not built*.

## 5. Home screen (verified 2026-10-26 against HomeScreen.jsx)

### Card stack order (top → bottom)
1. Top bar (outside the stack).
2. `HomeJourneyHero` — **only** Hajj/Umrah profiles with a departure date; otherwise `HomeGuidesCard` with the headline (Learning profile).
3. Intro card ("Your trusted guide for Hajj and Umrah" + contextual link: "Add your booking info →" → `SafarAssist`, or "Continue: Umrah Guide, Step 2 →" → Learn › Guides once `safar_plan_started_v1` is set). Dismissing it (× → `safar_intro_dismissed_v1`) swaps in the **Prayer card** in the same slot.
4. `HomeGuidesCard` without headline — trip profiles only.
5. `HomePrioritiesCard` — trip profiles only.
6. `HomeDailyLessonCard`.
7. `ExploreTiles` ("EXPLORE YOUR PILGRIMAGE").
8. `HomeHeroSlideshowClassic` (3 slides).
9. Upcoming Events card — only when calendar events exist (`safar_calendar_v1`).
10. Quick Access (Qibla · Calendar · Dhikr · Notes).
11. Continuation card — only when `SAFAR_LAST_DUA` exists.
12. Today's Dua.
13. Settings tile (→ `Settings`) + "Sources" link (opens a sources popup).

### Hero carousel (`HomeHeroSlideshowClassic`, position 8 in the stack)
3 slides (reduced from 5 — journey and people slides removed as they overpromised unbuilt features):
1. Welcome — `hero_kaaba.png`, "Learn more" CTA (opens the About modal)
2. Media — `hero_media.png`, "Explore Media" → Learn › Media
3. Duas — `hero_dua.png`, "View duas" → Practice › MyDuas

Rationale for reduction: five slides meant most users never saw slides 4–5. Three strong slides with clear distinct messages is more effective.

### Four Pillars grid — removed
No longer on Home (the pillars are bottom tabs). The old "Where would you like to begin?" 2×2 grid is gone.

### Home background (agreed 2026-10-16)
Home's outer `SafeAreaView` uses `colors.warmBackground` (`theme.js`) = `#F6EEDA`, a warm amber parchment wash that sits slightly darker than the cards (`#FDFAF4` / `#F9F4E8`) so they lift off the page. Card colors are unchanged. Home is the only screen using the token so far; it's there to carry the tint app-wide later.

### Journey phases sheet (agreed 2026-10-16)
The "Phase N of 5" pill on `HomeJourneyHero` opens `screens/JourneyPhasesSheet.jsx`, a "Your journey" bottom sheet with a vertical stepper of the **5 preparation phases** (same `PHASES` the pill counts, from days-to-go), not ritual steps. Each step: numbered 24px dot + connecting line, serif 16px name, one-line `short` description (13px `#6B6358`). Current = `#2D4A34` dot + SemiBold name; past = `#8A7F72` dot + dimmed name; future = outlined dot. Dismiss via swipe down, backdrop tap or X. No icons/imagery in the steps.

### Top bar (agreed 2026-10-18)
Left column: "As-salamu alaykum" (14px) → display name (serif 20px) → journey pill (Hajj / Umrah / Learning; outlined sage `#7A9176`, `alignSelf: "flex-start"`, 6px below the name; tap opens `TripDetailsEditor`). The pill carries a 12px sage `CaretDown` after the label (row, gap 4) to signal it opens settings; `TripDetailsEditor` shows a `Gear` (20px `#5C534A`) top-right that closes the sheet and opens Settings — rendered only when the host passes `navigation` (Home does, Settings doesn't) (agreed 2026-10-25). Right column: the "safar" wordmark, then a 22px `#1A1410` `MagnifyingGlass` (`hitSlop` 10) → `navigate("Search")`; row, gap 14, vertically centred against the left column.

### Card spacing (agreed 2026-09-27)
All Home cards sit inside one `s.cardStack` View (`paddingTop: 16, gap: 16`); ScrollView content `paddingBottom: 16`; top bar `paddingBottom: 0`. Cards carry **no vertical margins** of their own — the stack owns spacing. A section header and its content are grouped in one View (header→content spacing stays internal, e.g. `marginBottom: 12`).

### Explore your pilgrimage (agreed 2026-09-27, rebuilt 2026-10-16)
Shared component `components/ExploreTiles.jsx` (replaces `screens/ExploreSection.jsx`, now in `backups/`) — used on **Home** and **Learn** so tiles stay identical. Props: `title` (default "EXPLORE YOUR PILGRIMAGE"), `viewAllOnPress`, `tiles` = `[{ label, subtitle, image, circleColor, onPress }]`.
- Section owns 16px side padding (hosts add no horizontal margin). Header row: `sharedCardStyles.eyebrowText` (12px, 700, letterSpacing 1.2, uppercase, `#C8A96A`) — the one eyebrow style for every Home section heading + "View all →" pill (same pill as HomePrioritiesCard).
- 2×2 grid, 8px gap. Tile: parchment card, radius 16, 1px `rgba(200,191,178,0.5)` border, aspectRatio 0.92; photo fills top 70% (was 55%, changed 2026-10-23); 28px circle (`circleColor`, white CaretRight) top-right of the photo; serif title 17px `#1A1410`; subtitle 13px `#8A7F72`, **one line** (truncates with ellipsis — the 30% text area has no room for a second line). No gradient on the photo — the solid circle stays legible. A tile with `image: null` shows a solid `#E6DED0` placeholder.
- Home (after Daily Lesson card; same on every profile, agreed 2026-10-23): Practice (→ Practice tab `PracticeMain`) · Ziyarah (→ `SacredPlaces`) · Safar Assist (→ `SafarAssist`) · Checklists (→ Plan tab `Checklists`). All circles `#2D4A34`.
- Learn (below the guide cards): Practice · Ziyarah · Duas · Media (all circles `#2D4A34` sage). Umrah/Hajj omitted — they're the guide cards at the top of Learn.
- Images: all from `assets/explore_cards/` (umrah, hajj, ziyarah, duas, practice, media).
- "View all" (agreed 2026-10-18): on Home it opens the Learn tab (`navigate("Learn", { screen: "LearnMain" })`); on Learn the pill is hidden since the user is already on the hub. `ExploreTiles` renders the pill only when `viewAllOnPress` is a function.

### Guides card intro (`HomeGuidesCard.jsx`, agreed 2026-09-26)
Intro headline rotates per day (replaces the old static "Take your time."). `HEADLINES` array at module level, index = day-of-year % length: "Ready when you are." · "The journey begins." · "Bismillah — let's begin." Computed once at module load, so it updates on app restart, not at midnight.

**Placement by profile (agreed 2026-10-23).** Prop `showHeadline` (default `true`) controls the headline + subhead; the two guide tiles always render.
- **Learning** (no trip, or hajj/umrah without a departure date): at the top of the card stack, with headline.
- **Hajj/Umrah with a departure date** (when `HomeJourneyHero` shows): below the intro/Prayer card, above `HomePrioritiesCard`, with `showHeadline={false}` and `journeyType={journeyType}`. Uses the same condition as the hero, so the guides never appear twice.
- Prop `journeyType`: `"hajj"` shows Hajj Guide first; `"umrah"` or undefined keeps the default Umrah-first order.

**Priorities before Daily Lesson (agreed 2026-10-23).** On every profile `HomePrioritiesCard` sits directly above `HomeDailyLessonCard`, to break up the run of similar cards and keep focus on the guides above. HomePrioritiesCard renders only on Hajj/Umrah profiles with a departure date (same condition as `HomeJourneyHero`); Learning mode hides it (agreed 2026-10-25).

### Lower cards (no separate background zone — the old `#D4C9B4` band is gone; everything sits on the page wash)
- **Quick Access** (formerly My Shortcuts; 4 cells in a row, heading = `sharedCardStyles.eyebrowText`, 44px icon circles `rgba(45, 74, 52, 0.1)`, icons `#4A5C48`): Qibla · Calendar · Dhikr · Notes, each a cross-tab deep link with `returnToTab: "Home"`. Fixed in v1, no customization.
- **Prayer card** (replaces the intro card once dismissed; tappable → Practice › PrayerTimes). Static prayer schedule + approximate Hijri date; weather strip with **mocked** Makkah 38°C / Madinah 34°C (placeholder for OpenWeatherMap, Makkah lat 21.3891, lon 39.8579).
- **Continuation card** (last du'ā read, from `SAFAR_LAST_DUA`) → `DuaDetail`.
- **Today's Du'ā** — fixed du'ā (`hu12`, Ibn Majah 2893) with Practice (→ PracticeLearn) and a pin-to-board heart.

### Card text system (dark photo cards)
All dark photo cards (journey, continuation, hero) share the same text hierarchy:
- Eyebrow: fontSize 10, fontWeight "700", color `rgba(200,169,106,0.90)`, letterSpacing 1.5, textTransform uppercase
- Title: fontSize 22, color `#FFFFFF`, fontWeight "400", lineHeight 28
- Sub: fontSize 14, color `rgba(255,255,255,0.88)`, lineHeight 20, fontWeight "400"
- Container: position absolute, bottom 14, left 22, right 22

### Arrow buttons on dark cards
Both journey and continuation cards use `cardCornerBtn`: position absolute, top 12, right 12, 32×32, borderRadius 16, backgroundColor `#4A5C48` (sage green), ArrowRight icon size 16, white.

---

## 6. Content: Du'ās

- Normalized schema designed for DB/CMS import: id, title, arabic, transliteration, translation, source_collection/reference/full, authenticity (sahih/hasan/quran), stage, stage_order, categories[], keywords[], is_featured, audio_traditional/gentle, verified/verified_by/verified_date.
- `dua-content.js` is the adapter mapping normalized fields to screen field names; builds content by category tag. Has a `SHOW_UNVERIFIED` dev toggle.
- **99 entries** in `duas-data.js` (`DUAS_DATA`). **None has `verified: true`** (86 carry `"verified": false`, the rest have no flag, which the adapter also treats as unverified). They are visible only because `SHOW_UNVERIFIED = true` in `dua-content.js`; set it to `false` and every list empties.
- **Never fabricate** Arabic/translation/citations.

---

## 7. Design principles (agreed)

- **Pillars = cards, not pills.** Use pills only for filterable content (Du'ā library, Media).
- **Hub link cards:** uniform MEDIUM rich cards (~90–110px, photo + title + one-line desc) — "premium but not huge." Consistency reads as premium. (1–2 may be larger as primary; rest compact — mix decided per hub.)
- **Card cohesion principle:** shared "grammar" (radius / shadow / border / spacing / type tokens) + deliberate 1–2 variable deviations for hierarchy. NOT all identical (blends together), NOT all different (looks random).
- **Match the app's existing card style** rather than inventing new looks: `#FDFAF4` fill, thin border, the standard subtle warm shadow.
- Low cognitive load, legible, calm — the audience spans all ages (teens–50s), so keep the style **neutral**: not optimized for one generation, warm but never sterile, no stylistic lever pushed to an extreme.
- Don't over-design; live with changes on device before iterating further.
- **Hub template structure (original design; see §7a for what is built — the four hubs have no sub-nav pills, and the Safar Assist card appears on Plan and Connect):**
  1. Colored hero header band with LinearGradient — pillar identity color, holds icon badge + title + subtitle.
  2. Sub-nav pills (Plan · Learn · Practice · Connect) for lateral hopping.
  3. One emphasized hero card (Plan only: SafarAssist). ONE hero per hub — promoting two dilutes both.
  4. Uniform list rows — tinted icon square + title + sub + chevron.

---

## 7a. Pillar hubs as built — PlanMainScreen, LearnMainScreen, PracticeMainScreen, ConnectMainScreen

Each hub is the **root screen of its tab's stack** (§4). All four share one template; only colour, copy, icon and rows differ.

**Hero (all four):** 260px header, `hub-headers/{plan,learn,practice,connect}-header.png` (`cover`, `fadeDuration 0`) under a bottom gradient `["transparent","transparent", <tint>@0.68, <tint>@0.96]` at `[0, 0.44, 0.72, 1]`. Back button top-left and **search button top-right** — matched pair: 36px circles, `rgba(0,0,0,0.35)`, white bold 18px `CaretLeft` / `MagnifyingGlass`, `top: insets.top + 14`, `left / right: 18`. Search → `navigate("Search")`. Overlay at bottom 22 / sides 20: 44px gold-ringed (`#C8A96A`, 1.5px) icon badge + white serif 38 title, then 15/22 white-82% subtitle (maxWidth 88%). Page `#EDE6D8`.

**Rows (all four):** cream `#FDFAF4` cards (radius 16, `#EDE4D4` border, soft shadow, 16px side margin, 12px gap), 52px rounded icon square in the hub colour with a gold 24px icon, 19px label + 13px sub, `CaretRight` (or `ArrowSquareOut` for share rows). Row types: `nav: "stack"` (same stack or root), `nav: "tab"` (cross-tab with `returnToTab`), `nav: "share"` (system share sheet), `soon: true` (dimmed + SOON badge — none use it today).

| Hub | Colour (icon squares) | Gradient tint | Badge icon | Subtitle | Rows (in order) | Extra |
|---|---|---|---|---|---|---|
| Plan | `#2E4560` navy | `rgba(26,32,46,…)` | ListChecks | "Get everything ready — documents, packing, contacts, money." | What to Expect · Calendar · Checklist · Shop · Contacts (→ Connect tab) · Media (→ Learn tab) · Official Resources · My Board · Notes · Currency | SafarAssistCard "Import with Safar Assist" → `SafarAssist` |
| Learn | `#2D4F32` forest | `rgba(28,43,30,…)` | BookOpen | "Understand every step before you go — at your own pace." | (after 2 guide photo cards — Umrah Guide, Hajj Guide — and `ExploreTiles`: Practice · Ziyarah · Duas · Media, no "View all") What to Expect · Ziyarah · Dua Library (→ Practice tab) · Islamic References | — |
| Practice | `#4E3414` brown | `rgba(42,31,14,…)` | PersonSimpleRun | "Rehearse each step and keep your remembrance — calm, guided, hands-free." | Umrah Duas · Hajj Duas (→ `PilgrimageDuas {mode}`) · Audio Practice · Quiz (→ Learn tab) · Dua Library · Tawaf Counter · Sa'i Counter · Dhikr Counter · Prayer Times · Qibla · Media (→ Learn tab) | — |
| Connect | `#3D2240` plum | `rgba(34,24,32,…)` | UsersThree | "Stay close to your group and share the journey with those you love." | Groups · Connections · My Contacts · Moments · Share Safar (share sheet) | SafarAssistCard "Import your group details and travel contacts" |

All row and tile targets resolve to registered screens (audited 2026-10-26).

**Back button on a tab root:** the hub's own stack has nothing to pop, so `goBack()` bubbles to the tab navigator, which (default `firstRoute`) **switches to the Home tab** — not the previous tab. See *Known issues*.

---

## 7e. Hub header images

All stored in `assets/hub-headers/`

| Screen  | File | Subject |
|---------|------|---------|
| Plan    | plan-header.png | Aerial Ka'bah, amber/orange sky — "this is what you're preparing for" |
| Learn   | learn-header.png | Mountain path with location pin — journey/destination metaphor |
| Practice| practice-header.png | Prayer mat + tasbih + Ka'bah through arch, sunrise — objects of practice |
| Connect | connect-header.png | Pilgrims from behind facing Ka'bah at night — community and shared purpose |

Other header images: `assets/dua-header.png` (MyDuasScreen header; also the guide screens' Duas card). `hub-headers/tools-header.png` and the `*-design.png` files are unused; `prepare-header.jpg` belonged to the retired Prepare tab.

**Image selection rationale:** real photography over AI illustration. Photos are emotionally resonant for pilgrims — their actual destination, not a stylized version. Illustration styles age quickly and feel inconsistent with the warm photo language established by the hub screens.

**Spec:** 390×260px, no `@3x` suffix. Naming without `@3x` is required — `@3x` suffix caused load failures in this project.

---

## 7f. GitHub repository

**Repo:** `github.com/sirwolliam/safar-app`
**Branch:** main

**End of every session commit ritual:**
```
git add -A
git commit -m "description of session work"
git push
```

Git commands go in terminal, not in Claude Code.

---

## 7h. Global search (Phase 1, built 2026-10-25)

- **`searchIndex.js`** (root): one Fuse.js 7 index, built once and cached. `buildSearchIndex()`, `getSearchItems()`, `getSuggestedSearches()`. Item shape `{ id, type, title, subtitle, body, stage, tags, route, params, url }`.
- **Sources (162 items):** screens 12 (app destinations — Checklist, Essentials, What to Expect, Qibla, Prayer Times, Calendar, Contacts, Notes, Currency, Media Library, Practice, Dua Library; `body` holds the words people type, e.g. "what to pack packing luggage"; nested `MainTabs › tab › screen` with `initial:false`), duas 99 (from `DUAS` — every visible dua once; `DUA_CONTENT` lists overlap so they are not iterated), lessons 26 (`LESSONS`; all block text gathered, capped at 2000 chars), places 16 (`MAKKAH_SITES` + `MADINAH_SITES`, now exported from `SacredPlacesScreen`), media 9 (`MEDIA` from `MediaScreen`).
- **Fuse config (tuned 2026-10-25):** keys title .55 / subtitle .20 / body .10 / stage .08 / tags .07; threshold 0.4; ignoreLocation; minMatchCharLength 3; useExtendedSearch.
- **Query form:** `toFuseQuery(raw)` lowercases, drops stopwords (what, to, the, a, of, for, how, my, your, can, where…) and words under 3 letters (falls back to the raw text if nothing is left) and builds a logical `$and` of per-word `$or`s across all keys — every word must fuzzy-match *some* field. Not the `'word` string form (that is exact-substring in Fuse and breaks typos) and not a plain multi-word string (Fuse ANDs those within one field, so "Days of Tashreeq" returned 0).
- **Routing from the root stack:** duas → `DuaDetail { dua, allDuas:[dua], currentIndex:0 }`; places → `SacredPlaces { preselectedSiteId }` (screen now honours it, switching city); lessons → `MainTabs › Learn › LessonFlow { lessonId }` (nested form — Search is on the root stack); media → `Linking.openURL(url)` like the Media cards.
- **`screens/SearchScreen.jsx`** (root stack, `navigate("Search")`): back · input (autofocus) · Cancel; chips All/Duas/Lessons/Places/Media; 200ms debounce; empty state = recent searches (`safar_recent_searches_v1`, max 8, deduped, newest first; saved on submit, result tap, chip tap) + "Try searching for…" chips; no-results message + chips. Rows: type icon in a per-type tinted circle (dua sage `#2D4A34`, lesson gold `#BF9F60`, place terracotta `#A05C3C`, media slate `#556B8F`; bg = same hue at 15–18%) ; the type badge uses the same tint bg with the solid colour as text (gold badge text darkened to `#8A7128` for legibility); active filter chips fill with the category solid (All = `#1A1410`) with white text, serif 16 title, 12px subtitle, cream type badge.
- **Score cut:** results with Fuse score > 0.5 are dropped in `SearchScreen` (`MAX_SCORE`); if none remain the no-results state + suggestions shows. Screens appear under "All" only (no chip); deep-sage `#4A5C48` Compass icon, "Screen" badge.
- **Entry points:** magnifier button on Home (22px `#1A1410` next to the wordmark), Plan / Learn / Practice / Connect hubs and the Hajj / Umrah guides (36px `rgba(0,0,0,0.35)` circle, white bold 18px icon, `top: insets.top + 14, right: 18` — mirror of each screen's back button). All call `navigate("Search")`.
- **Known limits:** short single words still fuzz widely ("pack" → "Black Stone"; "Sai" → 26 hits, right one first).

## 8. Screens still needing redesign (priority order)

1. **DuaDetailScreen** — most important screen in the app. Pilgrim in-the-moment needs Arabic large enough to read while moving, transliteration toggle, audio, prev/next navigation between ritual sequence.

2. **PilgrimageDuasScreen** — Hajj and Umrah du'ās in sequence. Core feature.

3. **UmrahGuideScreen / HajjGuideScreen** — step-by-step guides. Critical for first-timers. Must be scannable while walking: large text, clear sequence, offline.
   - Hero (agreed 2026-10-23, restyled 2026-10-24 to the hub pattern): 260px `cover` image (`assets/explore_cards/hajj.png` / `umrah.png`) with two dark layers so the white title reads on any photo (even white-ihram crowds): a solid 35% black `heroDim` View over the whole image, then a bottom-weighted gradient (`["transparent","rgba(0,0,0,0.25)","rgba(0,0,0,0.65)","rgba(0,0,0,0.90)"]` @ `[0,0.3,0.7,1]`). Order: Image → heroDim → LinearGradient → back button → headerContent. Title has a text shadow (`rgba(0,0,0,0.75)`, offset 0/2, radius 6), floating back button (36px, `rgba(0,0,0,0.35)`, `top: insets.top + 14`, `left: 18`). Overlaid at bottom-left (bottom 22, left/right 20): gold-ringed 44px BookOpen badge + white serif 38 title "Hajj Guide" / "Umrah Guide", then the subtitle **on the image** below the title row (15/22 `rgba(255,255,255,0.82)`, maxWidth 88% — same as the hub heroes; moved back onto the image 2026-10-25). No pill and no text section below the hero; `s.body` has `paddingTop: spacing(2.5)` so section 1 starts 20px under the image. The "Your Hajj/Umrah journey" heading uses `journeyTitle` (marginTop `spacing(0.5)`) — "Along the way" keeps the default `sectionTitle` spacing.
   - **No countdown** (removed 2026-10-24) — the trip countdown lives on Home only; guide screens hold no departure-date state or timers.
   - **Body = 4 numbered sections** (agreed 2026-10-24), each a `SectionHeader` (28px `#8B7140` number circle + serif 22 `#1A1410` title; 14px `#5C534A` sub indented 38 under the title) followed by its cards: **1. Start your learning path** (the start-learning card) → **2. Understand the journey** (Journey overview card [journey graphic, `resizeMode="contain"`, tap opens the pinch-zoom viewer] + Pilgrimage Map card → `MapStepList`) → **3. Prepare for your journey** (Checklist card → `goPlan`, sub "N of TOTAL tasks completed" + Essentials card `shop/shop-bag.jpg` → Shop) → **4. Learn and explore** (full-width 140px Duas image card [`dua-header.png`, scrim transparent→`rgba(0,0,0,0.85)`, white serif 22 "Hajj/Umrah Duas" + 13px sub, 28px sage CaretRight circle top-right] → `PilgrimageDuas { mode }`; then a 2-up row of cream icon `LinkTile`s: Videos → `Media { filter }` (Media ignores `filter` today), Sites → `SacredPlaces`; padding 14, minHeight 110, 36px sage-tint icon circle with 20px icon, serif 15 title, 12px sub, caret bottom-right). Then the quiz card, which ends the screen (verse card removed 2026-10-24). The "Along the way" grid and the standalone journey image are gone. Sections 2 & 3 use `ImageCard` (ExploreTiles-style, spec below).
   - Start-learning card (agreed 2026-10-24) is the first card under the hero text: cream card matching DuaListScreen `DuaCard` (`#FDFAF4`, radius 16, 1px `#EDE4D4` border, same shadow; padding 20, minHeight 130, no outer horizontal margin since `s.body` pads 16). White serif 23 title "Step-by-Step\nHajj Lessons" / "Step-by-Step\nUmrah Lessons" → 14px subtitle "From intention to Tawaf to farewell.\nUnderstand it all before you go." (Umrah: "From Ihram to Tawaf to Sa'i.\n…"; no em dash) in white 90%, both with a soft text shadow (`rgba(0,0,0,0.65)`, 0/1, radius 4) (no icon badge), text block vertically centred and left-aligned (`learnText` flex 1, justifyContent center); 32px sage arrow circle (white ArrowRight 16) absolute top/right 14, the only arrow; `kaaba_crop.jpg` at full opacity fills the card behind the content (`learnBg`, card has `overflow: "hidden"`); activeOpacity 0.75; whole card → `LessonList { guide }`. (Order superseded by the 4-section structure above.) The journey path is a single image, not code: `hajj_journey.png` (1535×1024, 3:2) / `umrah_journey.png` (1600×682, height = width ÷ 2.344), full body width, `resizeMode="contain"` (agreed 2026-10-24; the old inline Umrah dot stepper was removed). Tapping it opens a fullscreen pinch/double-tap zoom viewer (`react-native-image-viewing` 0.2.2, pure JS, swipe down to close); an 11px italic hint "Tap to enlarge · Pinch to zoom" sits under the image.
   - `ImageCard` (sections 2 & 3): two side-by-side 190px ExploreTiles-style cards (cream `#FDFAF4`, radius 16, `#EDE4D4` border, DuaCard shadow; image fills the top 60% with a 26px sage CaretRight circle top-right; cream text area below: serif 15 title `#1C1A14` + 11px sub `#8A7D6A`, no scrim). Pilgrimage Map → `MapStepList { guide }` (`map_card.png`, both screens); Checklist → `goPlan`, sub "N of TOTAL tasks completed" (`checklist_kaaba.jpg`). "Along the way" keeps Duas · Media · Essentials · Ziyarah as a 2×2 grid (`TILE_W` = half width).

   - **LessonListScreen** (agreed 2026-10-25): titles "Hajj Lessons" / "Umrah Lessons" (not "… Guide", to avoid clashing with the parent screen). Header is a shorter hub-style hero: 170px `cover` image (Hajj `explore_cards/hajj.png`, Umrah `explore_cards/umrah2.png`), scrim transparent→`rgba(0,0,0,0.80)`, hub back button, white serif 30 title at bottom 18 / sides 20; the "N lessons to help you prepare…" intro sits below the hero on cream (17/24 `#5C534A`, left-aligned, padding 20/20/16, fixed above the list). No HeaderPatternBg.

4. **MediaScreen** — mockup exists (ChatGPT_Image_Jul_3 files). Has experience level filter concept (First Timer / Some Experience / Experienced) — keep as UI placeholder, wire content later. Real content needed before full build: no fabricated view counts or "Safar Podcast" placeholder.

5. **ShopScreen** — redesign after DuaDetail and Media.

6. **MyDuasScreen (Practice stack) linked screens:** Favourites view (empty state), My Duas view (empty state), DuaList screen per category.

7. **GroupsScreen, ConnectionsScreen, MyContactsScreen** — social screens need visual consistency work.

8. **PrayerTimesScreen, QiblaScreen, CurrencyScreen** — utility screens need design pass.

9. **WhatToExpectScreen** — needs honest first-person content about physical reality of Hajj/Umrah (distances, heat, crowds). Currently too sanitised.

10. **NotesScreen** — simple but needs a design consistency pass. (There is no BookmarksScreen; pinned items live on My Board via `bookmarkStore.js`.)

---

## 9. Planned features (not yet built)

**Document storage system:**
- Categories: Identity Documents, Trip Details, Emergency
- Local-first encrypted storage (v1)
- Cloud sync via iCloud/Google Drive (v2)
- Zero-knowledge approach: "stored only on this device"
- Quick Access mode for airport use (large text, max brightness)
- Passport OCR auto-fill (Phase 2)
- Trust strategy: radical transparency about where data lives

**Smart checklists:**
- Time-staged by departure date
- Auto-populate when documents uploaded
- Categories: Documents, Packing, Shopping, Clothing, Du'ās
- Shopping list links to Shop page with curated kits (elderly, families, first-timers)

**Weather widget:**
- Makkah + Madinah
- Currently mocked on prayer card
- Real API: OpenWeatherMap (Makkah lat: 21.3891, lon: 39.8579)
- Full 5-day forecast (originally planned for a Journey tab, which no longer exists)

**HubBar secondary navigation:**
- Saved in `components/HubBar.jsx`, orphaned (not imported); it navigates to `HubContainer`, which no longer exists, so it needs rewiring before reuse
- Will be toggleable in Settings: "Show hub navigation bar"
- When enabled: slim bar above tab bar, Plan · Learn · Practice · Connect
- Uses `expo-blur` (installed, SDK 54)

**Personal du'ā collection:**
- Users can add custom du'ās via + button
- Paste from WhatsApp/messages
- Tag by location (Arafah, Mina etc.) and theme
- "For" field for family prayer requests
- Private by default
- Share with Safar users (Phase 2)
- **One personal collection** (originally slotted into a Journey tab, which no longer exists — My Board on the Plan tab is the nearest live equivalent) — gathers ALL bookmarks, saved du'ās, and notes for the trip. Accessible before and during.
- **Capture must never require categorizing** — neutral default (general/uncategorized). Capture first, categorize optionally.
- **Hubs show filtered VIEWS of the one store**, not their own copies.

**SafarAssist (AI trip setup):**
- Import travel details from booking emails
- Auto-populate journey board, dates, hotel, group
- The three-state hero card lived in the retired HubContainerScreen; today Plan and Connect show a static `SafarAssistCard` → `SafarAssist`, and Home links to it (Explore tile, intro card, countdown card)
- Full build pending

**Unresolved screen questions:**
- `ImportTripScreen` — likely tied to SafarAssist; orphaned (not imported). Keep/wire/retire?
- `NotificationsScreen` — registered in HomeStack, but nothing navigates to it. Not-yet-wired or abandoned?
- `AuthScreen` — orphaned (not imported). Deferred by design (onboarding-only chosen); revisit if/when a real auth backend exists.
- `HajjUmrahPickerScreen` — du'ā-library gateway; orphaned (not imported). Confirm its role vs GuidesHubScreen.
- `SacredPlacesScreen` — resolved: reachable from Home and Learn Explore tiles, the Learn "Ziyarah" row, the guide screens' Sites tile and search results.

---

## 10. Key UX decisions and rationale

These decisions were made after discussion and should not be reversed without good reason.

**Focus tab retired:** pilgrims don't use the app during Tawaf — too intense. Counters (Tawaf, Sa'i, Dhikr) now live on the Practice hub (the Tools and Journey tabs they first moved to are gone).

**Duas center tab — superseded:** Duas was once the centre tab ("the heartbeat of the app"). The centre tab is now **Learn**; the Dua Library (MyDuas) lives in the Practice stack.

**HubContainerScreen single-screen architecture — superseded:** built to stop image flicker on pill switches; the app now uses four separate tab-root hubs (§7a) with no pill switching, so the flicker case doesn't arise.

**Serif page titles only:** full serif throughout felt dated across all age groups. Keeping serif only for page titles maintains warmth and identity while sans-serif everywhere else feels lighter and more modern.

**Carousel reduced to 3 slides:** users never see slides 4–5 before navigating away. Journey and People slides removed — they overpromised unbuilt features.

**Shortcuts reduced to 4:** Qibla, Calendar, Dhikr, Notes (Prayer Times moved to the Prayer card) — the four most urgently needed during the trip. Eight equal items with no hierarchy is hard to scan. No customization in v1.

**Settings & Support as a listCard (Prepare — retired):** buried text rows at the bottom of Prepare were too hidden. Today Settings is a tile at the bottom of Home and Help & Support is a row inside Settings. Settings will grow (text size, audio, accessibility) and needs to be easily findable. Positioned between Shop and Official — utility/admin before external links.

**About Safar moved into Settings:** universal mobile convention. Elevating it to a separate link overstated its importance.

**Avatar system (ProfileScreen — retired, not in the app):** initials as default (no setup required), 16 watercolor icons as alternatives. Single consolidated edit sheet handles all profile editing — one flow beats two separate flows.

**Typography hierarchy:** serif page titles communicate identity and warmth. Sans-serif for navigation, labels, and utility text communicates speed and modernity. The contrast between the two creates hierarchy.

**Prepare screen redesign rationale (retired, not in the app):** original screen had teal icons (matched nothing in the palette), horizontal tabs (duplicated navigation), and no visual identity. Replaced with hub-style header, section pills, tile grid for primary tools, and card sections for resources — combining hub page DNA with Duas page DNA.

**Known caveats:**
- GuidesHubScreen uses `require("../assets/tawaf.jpg")` and `arafah.jpg` — both exist (checked 2026-10-26).
- ShopScreen imports `getAffiliateUrl` from `"../utils/affiliateLinks"` — resolves (`utils/affiliateLinks.js` is live; root and `screens/` copies are orphaned).
- Nothing here is device-tested by the assistant; code-level verification only. Confirm on simulator.

---

## 11. Known issues (verified 2026-10-26)

- **Learn → Duas Explore tile passes no `mode`.** `navigation.navigate("PilgrimageDuas")` (LearnMainScreen); PilgrimageDuas falls back to `route?.params?.mode ?? "umrah"`, so it always opens **Umrah**. (Home's Explore tiles no longer include Duas.)
- **`safar.app` placeholder.** "Share Safar" text on all four hubs says "https://safar.app (link coming soon)"; SupportScreen links `mailto:support@safar.app` and `https://safar.app` and mentions support@safar.app in an FAQ answer. `firebase.js` uses `guest@safar.app` as a local placeholder identity.
- **PrintOffline unreachable.** Registered on the root stack; no live file navigates to it.
- **Hub back buttons on tab roots.** Plan / Learn / Practice / Connect each show a back button although they are tab roots; it switches to the Home tab (`firstRoute`), not the previous tab or screen.
- **No du'ā is verified.** 0 of 99 entries have `verified: true`; everything is shown via `SHOW_UNVERIFIED = true`. Scholar review is required before App Store submission.
- **MediaScreen is black-themed** (`BG #000000`, cards `#141414`) unlike the rest of the app, and has no-op controls: the three "View all ›" buttons have no `onPress`, and topic cards use `onPress={() => {}}`. Media also ignores the `filter` param the guide screens pass.

---

## 12. Retired / designed, not built

Kept for their design rationale. Nothing in this section is reachable in the app unless its status line says so.

### HubContainerScreen.jsx (was §7a)

> **Status: not in the app** — `screens/HubContainerScreen.jsx` no longer exists; the four pillar hubs are separate tab-root screens (§7a).

`screens/HubContainerScreen.jsx` — single unified screen replacing the four individual hub screens (PlanHubScreen, LearnHubScreen, PracticeHubScreen, ConnectHubScreen). Those files still exist but HubContainerScreen is what the app uses.

**Rationale:** four separate screens caused image flickering on pill switches because the image unmounted/remounted on each navigation. Single screen with state-based pillar switching eliminates this.

**PILLAR_CONFIG** at module level defines all four pillars:
```js
{
  image,             // pre-required at module level — prevents flicker
  gradient,          // colors[] for LinearGradient
  gradientLocations, // locations[]
  pillColor,         // active pill backgroundColor
  iconBg,            // icon square backgroundColor
  Icon,              // Phosphor icon component
  title,             // "Plan" | "Learn" | "Practice" | "Connect"
  subtitle,          // one-line intent string
  hasHeroCard,       // boolean — show SafarAssist hero card (Plan only)
  rows,              // array of list rows
}
```

**Per-pillar identity colors:**
| Pillar   | Color   | Feel        |
|----------|---------|-------------|
| Plan     | #2E4560 | Navy        |
| Learn    | #2D4F32 | Forest green|
| Practice | #4E3414 | Warm brown  |
| Connect  | #3D2240 | Plum        |

**Ken Burns zoom animation:** slow continuous scale loop (1.0 → 1.08 → 1.0, 8s each direction) using React Native `Animated` API. Implemented as `Animated.View` wrapping `Image` — not `Animated.Image` (Animated.View + Image is more reliable on device).

**Pill switching:** `navigation.replace()` with `useEffect` watching `route.params?.pillar` to update `activePillar` state when param changes. Image switching is instant via `setDisplayedImage()` — no crossfade. Ken Burns zoom continues uninterrupted.

**Header:** 260px, photo + LinearGradient overlay, back button (not on tab roots), icon badge + title + subtitle at bottom of header.

**Sub-nav pills order:** Plan · Learn · Practice · Connect (maps to pilgrim journey).

**Plan hub SafarAssist hero card — three AsyncStorage states:**
- State A (no trip): "Set up your trip in seconds" + "Import details" CTA → `navigate("SafarAssist")`
- State B (trip + date): countdown number + "days until your departure" → `navigate("SafarAssist")`
- State C (trip saved, no date): "Trip details saved — add your dates" → `navigate("SafarAssist")`
- Keys read: `safar_departure_date_v1`, `safar_journey_board_v1`, `safar_user_name_v1`

**Photo headers:** `../assets/hub-headers/{plan,learn,practice,connect}-header.png` — 390×260px, no `@3x` suffix.

---

### ToolsScreen.jsx (Tools tab) (was §7b)

> **Status: not in the app** — `screens/ToolsScreen.jsx` no longer exists and there is no Tools tab; its tools now live on the Practice and Plan hubs.

`screens/ToolsScreen.jsx` — matches hub screen template exactly.

**Photo header:** `../assets/hub-headers/tools-header.png`, 260px height, dark gradient overlay. No back button (tab root).

**Nine rows in order:**
1. Dhikr Counter — top, most universally used, not trip-specific. Available anytime, anywhere.
2. Prayer Times
3. Qibla
4. Currency
5. Ṭawāf Counter
6. Saʿy Tracker
7. Audio Practice
8. Notes
9. Bookmarks

Rationale for Dhikr at top: used constantly, not just during Hajj/Umrah. Tawaf/Sa'y counters are ritual-specific; general tools lead.

---

### MyDuasScreen.jsx as the Duas tab root (was §7c)

> **Status: MyDuasScreen is live but not a tab root** — it is registered in the Practice stack (reached from the Practice hub, Learn hub row, Home hero slide and search). There is no Duas tab. The section below is the original design and has not been re-verified line by line.

`screens/MyDuasScreen.jsx` — the center tab, the heartbeat of the app. Designed to serve three distinct use modes:
1. Pre-trip learning (studious, unhurried)
2. In-the-moment ritual reference (fast, offline, 3 taps maximum)
3. Personal du'ā practice (ongoing, daily)

#### Header
Hub-style photo header: `../assets/dua-header.png`, 260px, LinearGradient overlay, `BookOpen` icon badge, serif "Duas" title, subtitle: "Supplications for every moment of your journey". Add Dua button: top right, sage green `#4A5C48`, gold text.

#### Search + Practice row (sticky)
Uses `stickyHeaderIndices={[1]}` — search row is index 1 in ScrollView, sticks when scrolled past the header. Search bar and Practice pill sit in same row (`searchRow`). Practice pill navigates to `PracticeLearn`.

#### Three-tab bar
Discover · Favourites · My Duas. Active tab: `#4A5C48` sage green, white text. Inactive: `#EDE4D4` background, muted text. Tabs control view state, not navigation.

#### Discover view — sections

**Hajj & Umrah card** (`#FDF7EE`):
- 5 ritual rows with 72×72 photo thumbnails from `../assets/hajj/`
- Assets: `hajj-ihram.png`, `hajj-tawaf.png`, `hajj-saiy.png`, `hajj-arafah.png`, `hajj-jamarat.png`
- "View all moments →" link top right

**Themes / Library** (`#FDF7EE`):
- 12 categories, horizontal scroll, 110×110px cards
- Photos from `../assets/themes/`, per-card LinearGradient overlay
- Phosphor icon centered (size 40, color `#FFFFFF`), label below card (`#1A1410`, serif, fontSize 14)

| Category | Image | Overlay |
|---|---|---|
| Pilgrimage & Worship | dua_kaaba.png | 0.45 |
| Salah & Prayer | dua_sleep.png | 0.25 |
| Dhikr & Remembrance | dua_reminders.png | 0.40 |
| Forgiveness & Repentance | dua_icon6.png | 0.35 |
| Gratitude & Praise | dua_icon1.png | 0.38 |
| Trust in Allah | dua_icon5.png | 0.35 |
| Patience & Steadfastness | dua_icon2.png | 0.38 |
| Family & Loved Ones | dua_family.png | 0.42 |
| Health & Healing | dua_icon7.png | 0.40 |
| Anxiety & Worry | dua_icon4.png | 0.30 |
| Travel & Journey | dua_icon3.png | 0.38 |
| Guidance & Wisdom | duas.png | 0.48 |

**Duas by Mood** (`#FDF7EE`):
- 5 mood cards, horizontal scroll, 100×110px
- Photos from `../assets/mood/`: `mood-{anxious,peace,strength,grateful,anew}.png`
- Dark gradient overlay `["rgba(0,0,0,0.15)", "rgba(0,0,0,0.70)"]`, white icon, white label

#### Favourites and My Duas tabs
Currently empty states (Star icon / User icon). Build pass after DuaDetail screen redesign.

#### Add Dua modal
Bottom-sheet `Modal` (transparent) with `Animated.timing` slide-up. Fields: arabic text, title, "For" field, tag picker, location tag, save. Tags: Health, Family, Forgiveness, Gratitude, Protection, Custom. Location tags: Arafah, Mina, Tawaf, Madinah, General, Custom. Save writes to local AsyncStorage.

#### Du'ā content sources (decided)
- Primary: Hisnul Muslim (Fortress of Muslim)
- Secondary: Qur'anic du'ās
- Tertiary: authenticated hadith via Sunnah.com
- **Mandatory:** scholar review before App Store submission. All current entries `verified:false`.

---

### ProfileScreen.jsx (Prepare tab root) (was §7d)

> **Status: not in the app** — `screens/ProfileScreen.jsx` exists but is unregistered and not imported; there is no Prepare tab.

`screens/ProfileScreen.jsx` — significant redesign from original. Old design had: raw photo header, horizontal tab bar (Tools/Shop/Scholars/Media/Official), teal icon colors — all replaced.

#### Header
Hub-style photo header: `../assets/prepare-header.jpg`, 260px. Title: "Prepare". Subtitle: "Everything you need before and during your journey". No back button (tab root). Pillar color: `#3A3545` (warm slate).

#### Section pill nav
Four pills scrolling to sections: Personal · Resources · Shop · Official. Active pill: `#3A3545`. Replaces old horizontal tab bar. Preserves existing `scrollTo()` logic.

#### Profile card
Matches prayer card two-column layout:
- Left column: avatar (72×72 circle), tap opens edit sheet
- Vertical divider `#E0D8CC`
- Right column: journey badge + pencil icon (top row), username (serif, fontSize 22), email

**Avatar system:**
- Default: user initials in `#3A3545` circle
- 16 watercolor avatar icons in `../assets/avatars/`
- Stored in AsyncStorage key: `safar_avatar_v1`
- Picker opens via pencil icon OR avatar tap

**Consolidated edit sheet** (single bottom sheet for all profile editing, `maxHeight: "90%"` with internal ScrollView):
1. Name field
2. Email field
3. Journey type selector (Umrah / Hajj / Learning pills)
4. Avatar section (initials option + 16-icon grid)
5. Save button

**AsyncStorage keys:**
- `safar_user_name_v1`
- `safar_journey_type_v1` (umrah / hajj / learn)
- `safar_user_email_v1`
- `safar_avatar_v1`

#### Page zones in order
1. **Profile card**
2. **Personal tiles** (2×2 grid): Bookmarks · Notes · What to Expect · Practice & Learn. These four are the most frequently used preparation tools.
3. **Resources card** (listCard style): Islamic Scholars & References · Media & Videos · Save for Offline
4. **Shop card** (affiliate grid, 2-column)
5. **Settings & Support card** (listCard style): Settings (→ SettingsScreen) · Support & Help (→ SupportScreen). Positioned between Shop and Official — utility/admin content sits logically here before external links.
6. **Official Links card** (external links, ArrowSquareOut icon)

**About Safar** is in SettingsScreen, not ProfileScreen. Convention: About belongs in Settings.

#### Search
Full-text search bar above pill nav. `filterItems()` searches title and sub fields across all content zones. `isSearching` hides pills and shows filtered results inline.

---

### HubBar component (was §7g)

> **Status: not in the app** — `components/HubBar.jsx` is orphaned (not imported) and points at the retired `HubContainer` route.

`components/HubBar.jsx` — slim horizontal hub navigation bar, 36px tall.

**Purpose:** one-tap access to any of the four pillar hubs without going through Home screen.

**Navigation:** each item calls `navigation.navigate("HubContainer", { pillar: hub.key })`.

**Four items (left → right):** Plan · Learn · Practice · Connect

**Design:**
- Container: `BlurView` from `expo-blur`, `intensity={40}`, `tint="dark"`
- `backgroundColor: "rgba(26,20,16,0.55)"` — warm dark tint over blur (smoked-glass effect)
- `borderTopWidth: 1`, `borderTopColor: "rgba(200,169,106,0.15)"` — subtle gold hairline
- Height: 36px
- Item dividers: `borderRightColor: "rgba(200,169,106,0.20)"`
- Icon: Phosphor, size 14, color `#C8A96A`
- Label: fontSize 12, fontWeight 600, color `#C8A96A`, letterSpacing 0.3

**Current status:** disabled — removed from tab bar by user request. Will be re-enabled as a Settings toggle: "Show hub navigation bar." When re-enabled, render above SafarTabBar in App.js tabBar prop.

---
