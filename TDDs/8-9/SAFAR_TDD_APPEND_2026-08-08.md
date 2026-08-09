# SAFAR TDD — Appendix 2026-08-08

*This appendix documents work done since the last TDD update (2026-08-02 mood merge session). It supplements — does not replace — SAFAR_TDD.md and SAFAR_TDD_MASTER.md. When these disagree, code wins; then fix the docs.*

---

## Big picture: what changed

The app underwent a full information architecture restructure and gained a phase-driven Home countdown card. Every session decision below is real, committed, and pushed to `origin/main`.

**Structural changes:**
- **Tab bar restructured** from 5 old tabs (Home/Journey/Duas/Tools/Prepare) to 5 pillar-matched tabs (Home/Plan/Learn/Practice/Connect). Learn is center. Practice is a regular tab.
- **HubContainerScreen retired** — pillar hubs were internal config; four standalone landing screens now exist (PlanMainScreen, LearnMainScreen, PracticeMainScreen, ConnectMainScreen).
- **Journey tab retired.** JourneyScreen deleted. Contents redistributed.
- **Tools tab retired.** ToolsScreen deleted. Contents redistributed.
- **Prepare tab retired.** ProfileScreen exists as a file but is not currently registered (redistribution decision open for future).
- **HomeScreen** cleaned: four-pillar tile grid deleted, My Journey card removed (redundant with countdown card).

**New surfaces:**
- **HomeCountdownCard** (screens/HomeCountdownCard.jsx) — the primary Home surface for date-entered users. Reads real AsyncStorage. Falls back to invitation card for exploring users.
- **Trip Details modal** — inline modal for editing departure date and journey type (Umrah/Hajj). Uses `@react-native-community/datetimepicker`. Includes an "Import your booking details" option that hands off to SafarAssist.
- **Islamic References screen** (screens/IslamicReferencesScreen.jsx) — 4 curated scholarly links, sibling of OfficialResourcesScreen structure.
- **Settings tile on Home** — sage tile at bottom of Home linking to SettingsScreen.

---

## Section update: navigation structure

**Replaces Section 4 of SAFAR_TDD.md.**

**5 bottom tabs:** Home · Plan · Learn · Practice · Connect (custom `SafarTabBar` inside App.js, Learn is the centered button).

**Tab bar behavior:** Tapping any tab always resets to that tab's landing screen (uses `navigation.navigate(routeName, { screen: landing, initial: true })`). Deep stack navigation within a tab is discarded on tab tap — this is intentional. No `popToTop`, no `CommonActions.reset` — the simple `navigate + initial: true` pattern is what works.

**Stack animations:** All 5 stacks have `animation: "none"` on their screenOptions. Instant transitions match the app's calm aesthetic.

**Icon config:**
- Home: `House`
- Plan: `ListChecks`
- Learn: `BookOpenText` (centered)
- Practice: `Moon`
- Connect: `UsersThree`
- Icon size 24, weight `"bold"` when unfocused, `"fill"` when focused. Learn (center) is `size={26} weight="fill"` inside a 56×56 sage circle.

**Pillar colors (from PILLAR_CONFIG, locked, applied throughout):**
- Plan: `#2E4560`
- Learn: `#2D4F32`
- Practice: `#4E3414`
- Connect: `#3D2240`

### Stacks and screens (current registered state)

**HomeStack:** HomeMain, Settings, Support, Notifications

**PlanStack:** PlanMain, Notes, Calendar, Checklists, ChecklistDetail, CurrencyConverter, MyBoard, MyContacts, Support, Shop, WhatToExpect, Media, OfficialResourcesScreen

**LearnStack:** LearnMain, UmrahGuide, HajjGuide, Guides (GuidesHubScreen), WhatToExpect, Media, SacredPlaces, Map, QuizHub, Quiz, QuizResults, IslamicReferences, Shop

**PracticeStack:** PracticeMain (MyDuasScreen), MyDuas, DuaList, Moods, Dhikr, Tawaf, Saiy, PrayerTimes, Qibla, PracticeLearn, HajjUmrahPicker

**ConnectStack:** ConnectMain, Groups, GroupDetail, Connections, MyContacts, Moments, MomentCreator

**Root Stack (full-screen, no tab bar):** Onboarding, PillarIntro, MainTabs, DuaDetail, StepGuide (ProgressScreen), PracticeLearn, PrintOffline, PilgrimageDuas, SafarAssist, SacredPlaces

**Notes:**
- MyContacts appears in both Plan and Connect (Plan needs same-stack reach for its tile; Connect owns it thematically). This is intentional cross-registration.
- WhatToExpect, Media, and Shop appear in multiple stacks for same reason.
- HubContainerScreen.jsx, JourneyScreen.jsx, ToolsScreen.jsx, SafarTabBar.jsx are all DELETED from disk.
- PlanHubScreen, LearnHubScreen, PracticeHubScreen, ConnectHubScreen were confirmed dead code and deleted.

### Cross-tab navigation pattern

`getParent()?.navigate?.(tabName, { screen: screenName, initial: false, params: { returnToTab: originTab } })`

The `returnToTab` param is critical. Many receiver screens have a back button pattern:
```js
if (returnToTab) getParent().navigate(returnToTab) else goBack()
```

Screens with this pattern: MyBoardScreen, CalendarScreen, MomentsScreen, GroupsScreen, MyContactsScreen, ConnectionsScreen, GroupDetailScreen, OfficialResourcesScreen, PrayerTimesScreen, QiblaScreen, DhikrScreen, QuizHubScreen, NotesScreen, MediaScreen, MyDuasScreen, ChecklistsScreen (added this session).

**Do not pass old tab names** as `returnToTab` values (`"Journey"`, `"Tools"`, `"Prepare"` are all obsolete). Always pass the caller's current tab name.

### CalendarScreen back-button quirk (fixed)

CalendarScreen previously excluded `"Home"` from returnToTab handling (`if (returnToTab && returnToTab !== "Home")`). That exclusion was removed this session. Now: any valid returnToTab triggers the tab jump.

---

## Home screen composition

**Top-to-bottom order:**
1. Top bar (Salaam + name, right side reserved for future wordmark)
2. HomeCountdownCard OR invitation card (depending on hasDate)
3. Hero carousel
4. Intro card (dismissible) OR Prayer card (post-dismissal)
5. Events card
6. My Journey card (informational, links to Plan/MyBoard)
7. Shortcuts grid (cross-tab jumps to Calendar/Notes/Qibla/Dhikr)
8. Continue reading card
9. Today's Du'ā
10. Settings tile
11. Sources footer

**Removed this session:** four-pillar tile grid, hero-carousel days counter, standalone My Journey card content.

---

## HomeCountdownCard specification

**File:** `screens/HomeCountdownCard.jsx`

**Behavior:**
- Reads `safar_departure_date_v1` and `safar_journey_type_v1` from AsyncStorage on mount
- Renders nothing while loading (`if (!loaded) return null`)
- If no date OR journey_type is not "umrah"/"hajj" → renders invitation card
- Else renders countdown card

**Invitation card (no date):**
- Sage background, gold accents
- Eyebrow: "GET STARTED"
- Headline: "Ready to plan your\nHajj or Umrah?"
- Sub: "Add your trip details for a personalized preparation timeline, tips, and reminders."
- Kaaba PNG (108×108) top-right corner
- Chevron in bottom-right corner
- Whole card tappable, opens trip-details modal

**Countdown card (has date):**

Structure — two sibling cards inside one wrapper:

**Card 1: Phase header (sage `#4A5C48`)**
- "YOUR JOURNEY" eyebrow (gold, centered inline with phase pill)
- "Phase X of 5" pill on top-right (gold text on translucent sage)
- Phase full label (serif 28pt, off-white)
- Phase description (14pt, off-white 85% opacity)
- Days-to-go box (bordered gold 1.5px, semi-transparent, tappable → opens trip-details modal, has subtle shadow)
  - "Departure · [date]" text above box (11pt, off-white 60%, centered)
  - Gold calendar icon (36pt)
  - Days number (serif 48pt) + "days until\nyour [Type]" stacked
- Kaaba PNG (114×114) alongside days-box, bottom-aligned with days-box
- Timeline strip: 5 dots with active phase gold-filled, past phases outlined gold, future phases muted gold outlines. Thin gold hairlines top and bottom of strip.

**Card 2: Checklist mechanic (parchment cream)**
- "THIS WEEK" gold eyebrow
- "Things to focus on" small gray sub-line
- "View all" pill on right → cross-tab to Plan/Checklists
- Framing sentence (serif 20pt, dark)
- 4 task rows, each with checkbox, pillar dot (10px), task label, chevron
- Tap row → cross-tab to pillar tab
- Tap checkbox → local state toggle (NOT persisted yet — Phase 3c work)

### The 5 phases (locked)

```js
const PHASES = [
  { key: "early",   label: "Early",       fullLabel: "Early Preparation",   description: "..." },
  { key: "focused", label: "Focused",     fullLabel: "Focused Preparation", description: "..." },
  { key: "final",   label: "Final",       fullLabel: "Final Preparation",   description: "..." },
  { key: "onway",   label: "On your way", fullLabel: "On Your Way",         description: "..." },
  { key: "onsite",  label: "Pilgrimage",  fullLabel: "Pilgrimage",          description: "..." },
];
```

Thresholds:
```js
function phaseIndexForDays(daysOut) {
  if (daysOut > 90) return 0;
  if (daysOut > 30) return 1;
  if (daysOut > 7)  return 2;
  if (daysOut > 0)  return 3;
  return 4;
}
```

Locked phase descriptions (informing-not-instructing voice):
- Early: "You have time to plan carefully. Visas, flights, and accommodation are usually the first priorities."
- Focused: "A good stretch for learning the steps, memorizing key duas, and shaping your packing list."
- Final: "The trip is getting close. Packing, guides, and a word with family often come into focus around now."
- On Your Way: "Almost there. Documents, essentials, and a check-in with your group are worth a last look."
- Pilgrimage: "You are here. The duas and guides are ready when you need them."

---

## Trip Details modal

Same modal opens from two places: tapping the days-box on the countdown card, or tapping the invitation card.

**Contents:**
- Title: "Trip Details"
- Sub: "Set your pilgrimage type and departure date."
- Segmented control: Umrah / Hajj (sage active state, cream inactive)
- Native date picker spinner (`@react-native-community/datetimepicker`)
- "Import your booking details" row — sage `#4A5C48` background, gold Sparkle icon (25pt), gold border 1px, white text. Sub: "Quickly bring in your travel details from email, notes, or docs." Tapping closes modal and navigates to SafarAssist.
- Cancel / Save buttons

**Save action:** writes both `safar_departure_date_v1` and `safar_journey_type_v1` to AsyncStorage, updates local state, closes modal. Countdown card immediately reflects new values.

---

## Copy voice: informing, not instructing

**Locked this session.** Applies to Home card, empty states, phase transitions, contextual nudges, error messages, help text.

**Avoid:** imperative verbs ("take care of X," "study Y," "finalize Z")

**Prefer:** observational/descriptive framing ("visas and flights are usually the first priorities")

**Reserve authoritative voice** for scholarly content (du'ā sources, hadith citations), where authority is earned.

**Word to avoid:** "rites" — use "steps" or "stages" instead. One occurrence in Focused Preparation description already corrected.

---

## Design principles reaffirmed this session

- **Preparedness over engagement.** No streaks, no gamification, no daily-active-user metrics. Quiet by default.
- **Ambient / active / destination utility framework.**
  - Ambient (prayer times, days-to-go, today's du'ā): on Home, no screen navigation
  - Active (counters, currency converter): live in pillar tabs with prominence
  - Destination (guides, checklists, du'ā library): normal tab content
- **Four anxieties, one per pillar:** Plan="afraid I'll forget," Learn="afraid I won't know," Practice="afraid I won't be ready," Connect="afraid I'll lose touch."
- **Settings quiet by default.** No push notifications, weekly emails, or persistent nudges by default. Opt-in only, via Settings.

---

## Prompt discipline (hard-won this session)

**Before deletion:**
1. Ask user to upload the file fresh
2. Grep the codebase for imports and references
3. Verify with `ls` in Terminal that the file exists on disk
4. Only then delete

**HubContainerScreen was almost deleted** based on stale mental model — user pushback saved it. Reason: it hosted pillar UIs via internal config, not via imports of separate pillar files. Grep showed no imports but the code was very much alive.

**Never assume project-knowledge file copies are current.** The user has fresh files on disk that supersede the project-mount versions.

---

## Committed and pushed

All work described above is on `origin/main`. Recent commit log (newest first):

- Kaaba icon integration (multiple polish rounds)
- Trip details modal + segmented control + date picker + Import row
- Departure date line above days-box
- Countdown card wired to real AsyncStorage
- Invitation card for no-date state
- Islamic References screen created and moved below Dua Library
- OfficialResources moved from Learn to Plan
- Settings tile on Home
- Learn icon swapped to BookOpenText
- Center tab moved from Practice to Learn
- Multiple returnToTab receiver additions (Notes, Media, MyDuas, Checklists)
- CalendarScreen Home-exclusion removed
- Tab reset via `navigate + initial: true` (final working pattern)
- Animation: "none" on all 5 stacks
- Phase 2: full tab restructure (Home/Plan/Learn/Practice/Connect)
- Worship counter tiles added to Practice landing
- Icon polish (size 24, weight bold)
- SafarTabBar.jsx deleted
- Islamic References styling and placement

---

## What's next (Phase 3c)

**Content authoring for phase-timed checklist items.** See handoff prompt for the workflow. Do NOT touch this without the user's active participation — it's editorial work, not code work.

**After content authoring:**
- Wire HomeCountdownCard to read from checklistStore filtered by phase
- Persist check-off state (Home checkbox writes to checklistStore)
- Remove TEST_WEEKLY_FRAMING and TEST_TASKS constants
