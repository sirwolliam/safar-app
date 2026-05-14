# Safar — Technical Design Document
React Native + Expo SDK 54 · Hajj & Umrah Companion App · v1.0 pre-release · May 2026

---

## HOW TO USE THIS DOCUMENT
Paste the full contents of this file at the start of a new Claude conversation and say:
"I'm continuing development on the Safar app. Here is the technical design document from our last session."

---

## 1. Core Architecture

**Stack:** React Native + Expo SDK 54, Expo Go on iOS. Apple Developer account pending approval.
**Key packages:** React Navigation (bottom tabs + native stack), AsyncStorage, react-native-svg, SourceSerif4-Regular font, expo-av (NOT installed — audio is UI mock).
**Firebase:** Scaffolded, not connected. Groups/Connections use example data. getCurrentUser() → uid "u4".
**Currency API key:** f426059070cfc830eb7109a1

---

## 2. Navigation Structure (CURRENT)

```
Root Stack
└── MainTabs (tab bar always visible)
    ├── HomeStack     → Home, WhatToExpect, PracticeLearn, Groups
    ├── JourneyStack  → Journey, Map, SiteDuas, WhatToExpect, Groups,
    │                   GroupDetail, Connections, MyBoard, MyContacts
    ├── Focus         → FocusScreen
    ├── DuasStack     → MyDuas, DuaList
    └── PrepareStack  → Prepare, Bookmarks, Notes, Currency, Support, Settings

Full-screen (no tab bar — root stack):
    DuaDetail, StepGuide, PracticeLearn, PrintOffline
```

---

## 3. Critical Rules

### RULE 1: StyleSheet.create() inside useMemo
```js
// CORRECT
const s = useMemo(() => StyleSheet.create({ ... colors.primary ... }), [colors]);
```

### RULE 2: No && in style arrays
```js
// CORRECT
style={condition ? [s.base, s.extra] : s.base}
```

### RULE 3: No expo-image-picker or expo-av imports (not installed)

### RULE 4: No unicode escapes as bare JSX text
```jsx
// CORRECT — wrap in expression
<Text>{"du\u02bf\u0101\u02be"}</Text>
```

### RULE 5: Sticky header pattern
SafeAreaView → hero Image → header View → ScrollView (siblings, never nested)

### RULE 6: No "ritual" in user-facing copy
- "sacred practice" — instructional/UI (Focus screen)
- "ibadah" — elevated spiritual (About modal, onboarding)
- "worship" — heading/label contexts
- "practice" — general instructional

---

## 4. Design System (theme.js — CURRENT)

### Colour tokens
```
colors.primary       = #2F5D50  (forest500)
colors.background    = #EDE6D8  (parchment200 — DEEPENED for card contrast)
colors.card          = #FDFAF4  (parchment50)
colors.border        = #D4D0CA  (ink200 — DEEPENED for crisp edges)
colors.text          = #1A1712  (ink900)
colors.textSecondary = #3C3830  (ink700)
colors.subtext       = #5A5650  (ink600)
colors.placeholder   = #7A7670  (ink500)
colors.accent        = #C8A96A  (gold400)
Sheet green          = #D4E4DC  (all slide-up modals)
```

### Typography scale (UPDATED — all bumped 1-2pt)
```
typography.tiny    = 12  (was 11)
typography.small   = 14  (was 13)
typography.body    = 16  (was 15)
typography.bodyLg  = 17  (was 16)
typography.heading = 18  (was 17)
typography.title   = 22
typography.arabic  = 28  (was 26)
typography.heading weight = "600" (new token — authority/urgency)
```

### Shadows (UPDATED — warmer + deeper)
```
shadows.card = {
  shadowColor: "#6A4A28",
  shadowOffset: { width:0, height:3 },
  shadowOpacity: 0.14,
  shadowRadius: 8,
  elevation: 4,
}
```

### Key design principles
- Background (#EDE6D8) vs card (#FDFAF4) contrast ratio ~1.8:1 — cards lift off page
- Border (#D4D0CA) visible against both background and card
- Serif font (SourceSerif4-Regular): titles, card names, dua text, modal titles, CTAs
- Min font size: 10pt (navigation labels only)
- fontWeight "300" eliminated — "400" minimum everywhere

---

## 5. Screen Inventory

### Tab Screens
- **HomeScreen.jsx** ✅
  - Hero: homescreen_hero2.jpg (white fade built in, 40% SH)
  - 2 tiles: Duas (journey3.png) + What to Expect (what_to_expect.jpg)
  - Tile text: 18pt label, 16pt sub
  - "What is / ? / Safar" stacked about button
  - Connect & Focus section below tiles
  - OnboardingCarousel (safar_onboarded_v1)

- **JourneyScreen.jsx** ✅ — FULLY REDESIGNED
  - No hero image
  - Compact UMRAH/HAJJ toggle bar (solid green fill when active)
  - Days to departure counter top-right (light brown badge, no fill)
  - Step-by-step Guide: dominant hero card (260px, kaaba_mixed.png, white inverted badge, progress in coloured bg wrap)
  - My Journey Board: myboard.jpg (180px, YOUR BOARD eyebrow, text left-stacked, stat divider)
  - Sacred Places: half-width (kaaba_map.png, 14 / LOCATIONS label top-right)
  - What to Expect: half-width (what_to_expect.jpg, 8 / LOGISTICS label top-right)
  - My Groups + My Contacts: text-only cards, 149px tall, justifyContent flex-end

- **FocusScreen.jsx** ✅ — Tawaf/Saʿy counter

- **MyDuasScreen.jsx** ✅ — FULLY REDESIGNED
  - Header: "Duas" / "Your duas, organised for every moment"
  - Nav tray (sage #EBF2EE container) with 3 image-based tab buttons:
    - My Dua Lists: tab_dua_library.jpg — "Your duas, saved for you to recite or practice."
    - Dua Library: tab_my_lists.jpg — "Explore duas for every moment of your journey"
    - Shared Duas: tab_shared_duas.jpg — "Duas shared by friends and group members"
  - Active tab: green border (#8AB8A0), scrim, green text
  - List cards: full-bleed 80px portrait images, 88px height, 3px row gap
  - Add a List: inline pill button → modal with image picker (11 images) + live preview
  - Add a Dua: inline pill button on My Lists + Shared tabs
  - Library: 16 category cards with nature photos, search + filter

- **ProfileScreen.jsx** ✅ — REDESIGNED
  - No hero image
  - Category shelf: full-bleed sage (#EBF2EE) background, bottom border, 3×2 grid
  - Active shelf item: solid colors.primary fill, white text
  - Scroll-to-section via sectionY refs on each section wrapper
  - 6 sections: Tools, Prepare & Shop, Islamic Reference, Video & Podcasts, Official Resources, Accounts & Settings

### Duas Stack
- **DuaListScreen.jsx** ✅ — title 17/600, sub 14pt
- **DuaDetailScreen.jsx** ✅ — full-screen, Arabic 34pt, translit 17pt, translation 17pt

### Stack Screens (tab bar visible)
- **ProgressScreen.jsx** ✅
- **MapScreen.jsx** ✅ — SVG aerial map
- **GroupsScreen.jsx** ✅
- **MyBoardScreen.jsx** ✅ — FULLY REBUILT (see below)
- **MyContactsScreen.jsx** ✅
- **BookmarksScreen.jsx** ✅ — item text 15pt
- **NotesScreen.jsx** ✅ — preview text 15pt
- **CurrencyScreen.jsx** ✅
- **WhatToExpectScreen.jsx** ✅ — what_to_expect.jpg hero, body 16pt
- **SupportScreen.jsx** ✅ — body 16pt
- **SettingsScreen.jsx** ✅
- **ConnectionsScreen.jsx** ✅
- **PracticeLearnScreen.jsx** ✅ — full-screen
- **PrintOfflineScreen.jsx** ✅ — full-screen

### Components
- **OnboardingCarousel.jsx** ✅ — components/ folder, once-ever (safar_onboarded_v1)

---

## 6. MyBoardScreen — Full Rebuild Details

Architecture:
- Two-column masonry grid (COL_W = half screen minus gap)
- SwipeCard wrapper (swipe right=edit, left=delete)
- CardFace renders per type
- PinnedStrip — horizontal scroll of pinned cards
- QuickAddModal — bottom sheet with type selector, smart detection, pin toggle
- FAB — green pill "+ Add" bottom-right

Card types + tints:
```
note:      tint #FFFBE8, pill #F0DC88/#6A5010 (warm yellow)
checklist: tint #F8FAF8, pill #D4E8D8/#1E4A2A (white-green)
dua:       tint #EBF2EE, pill #B8D8C8/#1A4030 (sage)
link:      tint #EEF2F8, pill #C0CEE8/#1A2850 (blue-grey)
```

Smart add detection:
- Paste URL → auto-switch to Link type
- Arabic text detected → auto-switch to Duʿāʾ type

Your Pins strip: horizontal scroll, appears when cards are pinned.
Subhead: "Your most important items, always at the top"

Persistent storage: AsyncStorage key "safar_journey_board_v1"

---

## 7. Assets (all in assets/)

### Photos
```
homescreen_hero2.jpg     — HomeScreen hero
kaaba_mixed.png          — JourneyScreen step card, DuaDetailScreen, OnboardingCarousel
journey3.png             — HomeScreen Duas tile, OnboardingCarousel slide 2
prepare2.png             — OnboardingCarousel slide 3
what_to_expect.jpg       — WhatToExpectScreen hero, JourneyScreen What to Expect card
kaaba_map.png            — MapScreen + JourneyScreen Sacred Places card
medina.png               — MapScreen
myboard.jpg              — JourneyScreen My Journey Board card
```

### My Dua List images
```
dua_kaaba.jpg, dua_family.jpg, dua_reminders.jpg, dua_sleep.jpg
dua_icon1.jpg through dua_icon7.jpg (image picker options)
```

### Tab button images
```
tab_my_lists.jpg         — used on Dua Library button
tab_dua_library.jpg      — used on My Dua Lists button
tab_shared_duas.jpg      — Shared Duas button
```

### Dua category images
```
cat_gratitude.jpg, cat_forgive.jpg, cat_guidance.jpg, cat_protect.jpg,
cat_patience.jpg, cat_provision.jpg, cat_healing2.jpg, cat_anxiety2.jpg,
cat_travel2.jpg, cat_morning.jpg, cat_parents.jpg, cat_repentance.jpg,
cat_salah2.jpg, cat_guidance2.jpg, cat_hajj2.jpg, cat_entering.jpg
```

### Fonts
```
fonts/SourceSerif4-Regular.ttf
```

### Audio
```
assets/audio/  — EMPTY. Needed for PracticeLearnScreen + DuaDetailScreen.
```

---

## 8. What's Mid-Build

- **dua-content.js** — 12 duas only. Priority: expand to 50+ across all Umrah + Hajj stages
- **DuaDetailScreen audio** — UI complete with mock timer. Wire to expo-av post dev build
- **GroupsScreen Firebase** — scaffolded, not connected
- **MyBoardScreen drag reorder** — deferred to dev build
- **Map pin positions** — need device verification
- **ProfileScreen departure date** — hardcoded placeholder in JourneyScreen, needs AsyncStorage setter in Settings

---

## 9. Pending (Apple Developer Account)

```bash
npm install -g eas-cli && eas login && eas build:configure
eas build --profile development --platform ios
npx expo start --dev-client
```
Unlocks: expo-av, expo-image-picker, react-native-draggable-flatlist, Share Extension, TestFlight.

---

## 10. Key Design Decisions

| Decision | Detail |
|---|---|
| Background deepened | parchment100 → parchment200 (#EDE6D8) — 1.8:1 contrast with cards |
| Borders deepened | ink100 → ink200 (#D4D0CA) — crisp card edges |
| Typography bumped | All scales +1-2pt. arabic 28pt, translation 17pt, body 16pt |
| Heading weight | "600" token added — authority without aggression |
| Shadow warmer+deeper | #6A4A28, opacity 0.14, radius 8 |
| JourneyScreen | No hero. Tiered card hierarchy: step-by-step dominant, board featured, half-width pair, utility row |
| MyBoardScreen | Pinboard model. Two-column grid, type tints, Your Pins strip, smart add detection |
| MyDuasScreen | Nav tray (sage container) with image-based tab buttons |
| ProfileScreen | Category shelf (full-bleed sage, 3×2 grid, scroll-to-section) replaces hero |
| HomeScreen tiles | 3 tiles → 2 (Duas + What to Expect). 18/16pt text |
| Navigation | Tab bar visible on all browsing/decision screens. Full-screen for DuaDetail, StepGuide, PracticeLearn, PrintOffline |
| "Ritual" removed | ibadah / sacred practice / worship throughout |

---

## 11. Discarded Ideas

| Idea | Why |
|---|---|
| Module-level StyleSheet | Crashes Expo Go |
| && in style arrays | Returns false, crashes StyleSheet |
| expo-image-picker/av in Expo Go | Not installed |
| Hero image on JourneyScreen | Step-by-step card is the visual anchor |
| Green band behind Groups/Contacts | Replaced with text-only cards |
| FAB as only add action on MyBoard | Green pill "+ Add" FAB + add bar together |
| Progress tracking on MyBoard | It's a pinboard, not a task tracker |
| Horizontal chip pills on ProfileScreen | Squash — replaced with shelf grid |
| "Pinned for Today" | Pilgrim context doesn't map to "today" — renamed "Your Pins" |
| Three HomeScreen tiles | Duas + What to Expect combined, Practice & Learn accessible within Duas tab |

---

## 12. Crash Patterns

1. `getUseOfValueInStyleWarning of undefined` → module-level StyleSheet
2. `Property 'useState' doesn't exist` → missing useState in React import
3. `Unable to resolve module expo-image-picker` → not installed
4. `&& style in style array` → replace with ternary
5. `The action navigate with payload...` → screen not in right navigator
6. Literal `du\u02bf...` rendering → unicode escape in JSX text node, wrap in `{"..."}`

---

*Safar TDD v3 — Updated May 2026*
*Next session: paste this file and say "Continue Safar development"*
