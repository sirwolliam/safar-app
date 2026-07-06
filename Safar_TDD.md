# Safar — Technical Design Document
*Hajj & Umrah pilgrimage companion app. React Native (Expo).*
*Last verified: 2026-07-06. This TDD is derived from the actual code, not aspiration — keep it that way.*

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

The app is organized around Four Pillars: Learn, Practice, Plan, Connect — surfaced as cards on the Home screen, each opening HubContainerScreen. "Practice" is the chosen spelling app-wide (American, not British "Practise").

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
- **Other deps in use:** `expo-haptics`, `react-native-safe-area-context`, `expo-linear-gradient`, `expo-blur` (SDK 54 compatible, installed).

### Folder structure (VERIFIED 2026-06-23 — do not reorganize)
- **Entry point:** `App.js` lives in the **root** (the `screens/App.js` copy is a stale stray — slated for archival).
- **Screens** (navigation destinations: HomeScreen, ProfileScreen, etc.) live in **`screens/`**.
- **Shared modules** (`theme.js`, `AccessibilityContext.js`, `dua-content.js`, `duaLibrary.js`, `firebase.js`, `duas-data.js`) live in the **root**, imported from screens as `../` (e.g. `from "../theme"` — 43 such imports; from "../AccessibilityContext" — 15; "../dua-content" — 8; "../firebase" — 5).
- **Why it's written down:** these locations are dictated by the import paths. Moving a shared module (e.g. `theme.js` → `screens/`) would break dozens of `../` imports for zero benefit. Leave them. The structure (screens together, shared modules one level up) is conventional and correct for this app's size — don't "tidy" it.
- A lone `./theme` import (vs the 43 `../theme`) is a tell of a stale duplicate screen, not a reason to move theme.js.
- **Attic:** `versions/` and assorted root/`screens/` `.jsx` duplicates are old hand-saved backups (the project was manually version-controlled before git). To be archived OUT of the project so the folder is unambiguous for tools/agents. Git is now the version history; manual `copy N` files are redundant.

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
| Tools   | #3A2F1E | Warm brown  |
| Prepare | #3A3545 | Warm slate  |

### Typography rule (agreed 2026-07-06)
- **Serif (`SourceSerif4-Regular`):** page titles ONLY and sacred Arabic content.
- **Everything else:** system sans-serif (omit `fontFamily` entirely).
- **Rationale:** full serif throughout felt dated and heavy across all ages. Sans-serif for navigation and utility content feels lighter and more modern while serif page titles maintain warmth and identity.

### theme.js tokens (reference only — do not use in StyleSheet.create)
- `background` #EDE6D8 · `card` #FDFAF4 · `primary` #2F5D50 · `gold` #C8A96A · `text` #1A1712 · `subtext` #5A5650 · `border` #D4D0CA

---

## 4. Navigation structure (verified 2026-07-06)

**5 bottom tabs:** Home · Journey · Duas (center) · Tools · Prepare

Focus tab retired. Duas moved to center. Tools promoted to a tab.

**Custom tab bar:** inline `SafarTabBar` function in `App.js` (not `components/` or `screens/` — those files exist but are not used in production).
- Tab bar prop: `tabBar={(props) => <SafarTabBar {...props} />}`
- **CRITICAL:** must use spread `{...props}` not `navProps={props}` — the function destructures `{state, descriptors, navigation}` directly.

**HubBar component:** `components/HubBar.jsx` — currently removed from tab bar by user request. Saved for Settings toggle ("Show hub navigation bar" as optional feature). When re-enabled, add to `App.js` tabBar prop above SafarTabBar.

**App boots through an onboarding gate:** reads AsyncStorage flag `safar_onboarded_v1`; if unset → `Onboarding` (OnboardingFlow), else → `MainTabs`. Onboarding writes the flag and `replace("MainTabs")` on completion. No forced signup — onboarding-only by design.

### Stacks (verified current)

**HomeStack:** HomeMain, Hub, HubContainer, PlanHub, LearnHub, PracticeHub, ConnectHub, UmrahGuide, HajjGuide, WhatToExpect, Groups, Guides, PrayerTimes, Qibla, Shop, Media, Notes, Settings, CurrencyConverter, Notifications, SacredPlaces, SafarAssist, PilgrimageDuas, PracticeLearn

**JourneyStack:** JourneyMain, Map, WhatToExpect, Groups, GroupDetail, Connections, MyBoard, MyContacts, Tawaf, Saiy

**DuasStack:** MyDuas, DuaList, Dhikr

**ToolsStack:** ToolsMain, PrayerTimes, Qibla, CurrencyConverter, Tawaf, Saiy, Dhikr, PracticeLearn, Notes, Bookmarks

**PrepareStack:** PrepareMain (ProfileScreen), Bookmarks, Notes, CurrencyConverter, Support, Settings, WhatToExpect, PrintOffline

**Root Stack (full-screen, no tab bar):** Onboarding, MainTabs, DuaDetail, StepGuide, PrintOffline, PilgrimageDuas, SafarAssist, SacredPlaces, PracticeLearn

### Retired (files kept, intentionally unwired)
- `GuidesScreen.jsx` — 945-line pre-Hub monolith, superseded by the Four Pillars + Hub pattern.
- `MyJourneyScreen.jsx` — personal dashboard, superseded by Plan hub.
- `BoardScreen.jsx` — old twin of MyBoardScreen (MyBoard is current).

### Parked components (`parked-components.jsx`)
`FocusModeCard` and `SacredPlacesCard` — removed from Home to cut clutter, preserved for reuse. Not imported anywhere yet.

---

## 5. Home screen (verified 2026-07-06)

### Hero carousel
3 slides (reduced from 5 — journey and people slides removed as they overpromised unbuilt features):
1. Welcome — `kaaba_mixed.png`, greeting
2. Media — `hero-media.png`, "Watch, listen and read your way to readiness"
3. Duas — existing duas hero image

Rationale for reduction: five slides meant most users never saw slides 4–5. Three strong slides with clear distinct messages is more effective.

### Four Pillars grid
2×2 grid, opacity 0.55, serif titles, each navigates to HubContainer with pillar param. Section header: "Where would you like to begin?" centered, fontSize 20, `#1A1712`.

### Bottom utility zone
Background: `#D4C9B4` (warm tan, darker than page background — creates visual zone separation from navigation above).

Contains in order:
- **My Shortcuts** (4 items horizontal row): Qibla · Prayer Times · Dhikr · Notes. Reduced from 8 items — these four are the most urgently needed during the trip. Fixed in v1, no customization (edit button removed).
- **Prayer Times card** (tappable → PrayerTimes). Contains weather strip: Makkah + Madinah temp, mocked, placeholder for OpenWeatherMap API (Makkah lat: 21.3891, lon: 39.8579).
- **My Journey card** with photo header (`myboard.jpg`, 150px), text overlay at bottom, quick links row.
- **Continuation card** (last du'ā read).
- **Today's Du'ā** section.

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
- ~20 entries sourced (pilgrimage du'ās + sleep/protection adhkar) from Hisn al-Muslim. **All `verified:false` pending scholar review.** Categories still needing harvest: guidance, patience, family, daily, morning/evening adhkar, repentance.
- **Never fabricate** Arabic/translation/citations.

---

## 7. Design principles (agreed)

- **Pillars = cards, not pills.** Use pills only for filterable content (Du'ā library, Media).
- **Hub link cards:** uniform MEDIUM rich cards (~90–110px, photo + title + one-line desc) — "premium but not huge." Consistency reads as premium. (1–2 may be larger as primary; rest compact — mix decided per hub.)
- **Card cohesion principle:** shared "grammar" (radius / shadow / border / spacing / type tokens) + deliberate 1–2 variable deviations for hierarchy. NOT all identical (blends together), NOT all different (looks random).
- **Match the app's existing card style** rather than inventing new looks: `#FDFAF4` fill, thin border, the standard subtle warm shadow.
- Low cognitive load, legible, calm — the audience spans all ages (teens–50s), so keep the style **neutral**: not optimized for one generation, warm but never sterile, no stylistic lever pushed to an extreme.
- Don't over-design; live with changes on device before iterating further.
- **Hub template structure (applies to all four pillar hubs):**
  1. Colored hero header band with LinearGradient — pillar identity color, holds icon badge + title + subtitle.
  2. Sub-nav pills (Plan · Learn · Practice · Connect) for lateral hopping.
  3. One emphasized hero card (Plan only: SafarAssist). ONE hero per hub — promoting two dilutes both.
  4. Uniform list rows — tinted icon square + title + sub + chevron.

---

## 7a. HubContainerScreen.jsx

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

## 7b. ToolsScreen.jsx

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

## 7c. MyDuasScreen.jsx (Duas tab root)

`screens/MyDuasScreen.jsx` — the center tab, the heartbeat of the app. Designed to serve three distinct use modes:
1. Pre-trip learning (studious, unhurried)
2. In-the-moment ritual reference (fast, offline, 3 taps maximum)
3. Personal du'ā practice (ongoing, daily)

### Header
Hub-style photo header: `../assets/dua-header.png`, 260px, LinearGradient overlay, `BookOpen` icon badge, serif "Duas" title, subtitle: "Supplications for every moment of your journey". Add Dua button: top right, sage green `#4A5C48`, gold text.

### Search + Practice row (sticky)
Uses `stickyHeaderIndices={[1]}` — search row is index 1 in ScrollView, sticks when scrolled past the header. Search bar and Practice pill sit in same row (`searchRow`). Practice pill navigates to `PracticeLearn`.

### Three-tab bar
Discover · Favourites · My Duas. Active tab: `#4A5C48` sage green, white text. Inactive: `#EDE4D4` background, muted text. Tabs control view state, not navigation.

### Discover view — sections

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

### Favourites and My Duas tabs
Currently empty states (Star icon / User icon). Build pass after DuaDetail screen redesign.

### Add Dua modal
Bottom-sheet `Modal` (transparent) with `Animated.timing` slide-up. Fields: arabic text, title, "For" field, tag picker, location tag, save. Tags: Health, Family, Forgiveness, Gratitude, Protection, Custom. Location tags: Arafah, Mina, Tawaf, Madinah, General, Custom. Save writes to local AsyncStorage.

### Du'ā content sources (decided)
- Primary: Hisnul Muslim (Fortress of Muslim)
- Secondary: Qur'anic du'ās
- Tertiary: authenticated hadith via Sunnah.com
- **Mandatory:** scholar review before App Store submission. All current entries `verified:false`.

---

## 7d. ProfileScreen.jsx (Prepare tab root)

`screens/ProfileScreen.jsx` — significant redesign from original. Old design had: raw photo header, horizontal tab bar (Tools/Shop/Scholars/Media/Official), teal icon colors — all replaced.

### Header
Hub-style photo header: `../assets/prepare-header.jpg`, 260px. Title: "Prepare". Subtitle: "Everything you need before and during your journey". No back button (tab root). Pillar color: `#3A3545` (warm slate).

### Section pill nav
Four pills scrolling to sections: Personal · Resources · Shop · Official. Active pill: `#3A3545`. Replaces old horizontal tab bar. Preserves existing `scrollTo()` logic.

### Profile card
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

### Page zones in order
1. **Profile card**
2. **Personal tiles** (2×2 grid): Bookmarks · Notes · What to Expect · Practice & Learn. These four are the most frequently used preparation tools.
3. **Resources card** (listCard style): Islamic Scholars & References · Media & Videos · Save for Offline
4. **Shop card** (affiliate grid, 2-column)
5. **Settings & Support card** (listCard style): Settings (→ SettingsScreen) · Support & Help (→ SupportScreen). Positioned between Shop and Official — utility/admin content sits logically here before external links.
6. **Official Links card** (external links, ArrowSquareOut icon)

**About Safar** is in SettingsScreen, not ProfileScreen. Convention: About belongs in Settings.

### Search
Full-text search bar above pill nav. `filterItems()` searches title and sub fields across all content zones. `isSearching` hides pills and shows filtered results inline.

---

## 7e. Hub header images

All stored in `assets/hub-headers/`

| Screen  | File | Subject |
|---------|------|---------|
| Plan    | plan-header.png | Aerial Ka'bah, amber/orange sky — "this is what you're preparing for" |
| Learn   | learn-header.PNG | Mountain path with location pin — journey/destination metaphor |
| Practice| practice-header.PNG | Prayer mat + tasbih + Ka'bah through arch, sunrise — objects of practice |
| Connect | connect-header.PNG | Pilgrims from behind facing Ka'bah at night — community and shared purpose |
| Tools   | tools-header.png | Warm studious scene — utility and preparation |
| Duas    | dua-header.png | Intimate, devotional |
| Prepare | prepare-header.jpg | Notebook/writing scene — personal preparation |

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

## 7g. HubBar component

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

## 8. Screens still needing redesign (priority order)

1. **DuaDetailScreen** — most important screen in the app. Pilgrim in-the-moment needs Arabic large enough to read while moving, transliteration toggle, audio, prev/next navigation between ritual sequence.

2. **PilgrimageDuasScreen** — Hajj and Umrah du'ās in sequence. Core feature.

3. **UmrahGuideScreen / HajjGuideScreen** — step-by-step guides. Critical for first-timers. Must be scannable while walking: large text, clear sequence, offline.

4. **MediaScreen** — mockup exists (ChatGPT_Image_Jul_3 files). Has experience level filter concept (First Timer / Some Experience / Experienced) — keep as UI placeholder, wire content later. Real content needed before full build: no fabricated view counts or "Safar Podcast" placeholder.

5. **ShopScreen** — redesign after DuaDetail and Media.

6. **MyDuasScreen linked screens:** Favourites view (empty state), My Duas view (empty state), DuaList screen per category.

7. **GroupsScreen, ConnectionsScreen, MyContactsScreen** — social screens need visual consistency work.

8. **PrayerTimesScreen, QiblaScreen, CurrencyScreen** — utility screens need design pass.

9. **WhatToExpectScreen** — needs honest first-person content about physical reality of Hajj/Umrah (distances, heat, crowds). Currently too sanitised.

10. **NotesScreen, BookmarksScreen** — simple but need design consistency pass.

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
- Full 5-day forecast for Journey tab (activates closer to departure date)

**HubBar secondary navigation:**
- Saved in `components/HubBar.jsx`, currently disabled
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
- **One personal collection, lives in Journey tab** — gathers ALL bookmarks, saved du'ās, and notes for the trip. Accessible before and during.
- **Capture must never require categorizing** — neutral default (general/uncategorized). Capture first, categorize optionally.
- **Hubs show filtered VIEWS of the one store**, not their own copies.

**SafarAssist (AI trip setup):**
- Import travel details from booking emails
- Auto-populate journey board, dates, hotel, group
- Three states already built in HubContainerScreen hero card (no trip / trip with dates / trip without dates)
- Full build pending

**Unresolved screen questions:**
- `ImportTripScreen` (904 lines) — likely tied to SafarAssist; built, was orphaned. Keep/wire/retire?
- `NotificationsScreen` — built, unwired. Not-yet-wired or abandoned?
- `AuthScreen` — built, unwired. Deferred by design (onboarding-only chosen); revisit if/when a real auth backend exists.
- `HajjUmrahPickerScreen` — du'ā-library gateway; confirm its role vs GuidesHubScreen.
- `SacredPlacesScreen` — registered, but only reached from retired GuidesScreen; needs a real entry point.

---

## 10. Key UX decisions and rationale

These decisions were made after discussion and should not be reversed without good reason.

**Focus tab retired:** pilgrims don't use the app during Tawaf — too intense. Counters moved to Tools (utility) and Journey.

**Duas center tab:** the heartbeat of the app. Most important feature deserves center position.

**HubContainerScreen single-screen architecture:** eliminates image flicker on pill switches. Four individual hub files still exist but are superseded.

**Serif page titles only:** full serif throughout felt dated across all age groups. Keeping serif only for page titles maintains warmth and identity while sans-serif everywhere else feels lighter and more modern.

**Carousel reduced to 3 slides:** users never see slides 4–5 before navigating away. Journey and People slides removed — they overpromised unbuilt features.

**Shortcuts reduced to 4:** Qibla, Prayer Times, Dhikr, Notes — the four most urgently needed during the trip. Eight equal items with no hierarchy is hard to scan. No customization in v1.

**Settings & Support as a listCard:** buried text rows at the bottom of Prepare were too hidden. Settings will grow (text size, audio, accessibility) and needs to be easily findable. Positioned between Shop and Official — utility/admin before external links.

**About Safar moved into Settings:** universal mobile convention. Elevating it to a separate link overstated its importance.

**Avatar system:** initials as default (no setup required), 16 watercolor icons as alternatives. Single consolidated edit sheet handles all profile editing — one flow beats two separate flows.

**Typography hierarchy:** serif page titles communicate identity and warmth. Sans-serif for navigation, labels, and utility text communicates speed and modernity. The contrast between the two creates hierarchy.

**Prepare screen redesign rationale:** original screen had teal icons (matched nothing in the palette), horizontal tabs (duplicated navigation), and no visual identity. Replaced with hub-style header, section pills, tile grid for primary tools, and card sections for resources — combining hub page DNA with Duas page DNA.

**Known caveats:**
- GuidesHubScreen uses `require("../assets/tawaf.jpg")` and `arafah.jpg` — confirm those assets exist or swap.
- ShopScreen imports `getAffiliateUrl` from `"../utils/affiliateLinks"` — confirm the file resolves at that path.
- Nothing here is device-tested by the assistant; code-level verification only. Confirm on simulator.
