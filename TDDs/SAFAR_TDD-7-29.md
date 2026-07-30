# Safar — Technical Design Document
*Hajj & Umrah pilgrimage companion app. React Native (Expo).*
*Last consolidated: 2026-07-29 — full update from an extended 2026-07-28/29 session (Claude Sonnet 5), merged onto the verified 2026-07-22 baseline. Prior merge: 2026-07-22, full update from 2026-07-18 through 2026-07-22 sessions.*

**This is now the single canonical document.** Do not create or maintain a separate handoff doc going forward — fold session learnings back into this file before the session ends.

---

## 0. Workflow context (read first)

- **The user is not a coder — a novice.** Explain steps in plain language when the process itself (not just the design decision) is unfamiliar. Don't assume comfort with terminal, git, or React Native tooling. Give exact copy-paste git commands every time a change is made, and actually prompt the user to run them and report back — don't assume they will without being told plainly. This mattered tonight: real work sat uncommitted on local disk for hours before anyone checked `git status`.
- **This chat (Claude in claude.ai) does UX/UI/product strategy and writes Claude Code prompts.** It has `project_knowledge_search` access to files already added to this project — check those first before asking the user to re-upload. Project knowledge can lag behind the real local project; for anything load-bearing, confirm currency with the user or ask for a fresh upload if there's any doubt.
- **Claude Code (separate tool, run locally) applies the actual code changes.** The user pushes to GitHub themselves.
- **Always ask for the latest version of a file before analyzing or changing it** — even if a change was discussed or believed finished in a prior session. Never assume a previously discussed change actually landed in the file.
- **⚠️ New lesson, 2026-07-29 — this document can go stale inside a single very long session, not just between sessions.** Tonight's session re-read this exact TDD in full at the start, which already documented (see Section 4) that `ConnectHubScreen.jsx`, `PracticeHubScreen.jsx`, and related files were retired 2026-07-12 with an explicit warning not to edit them. Deep into the same session, hours later, both files got edited extensively anyway before the mistake was caught — the information was correct and present, it just aged out of active working context over a long conversation. **Practical implication: on any very long session, if you're about to make a structural assumption about which file is live, re-verify against the actual codebase (a quick grep/import trace) rather than trust your own earlier reading of this document, no matter how recently you read it.** This is not a one-time fixed bug, it's a standing risk in long sessions.
- Repo: `github.com/sirwolliam/safar-app`, branch `main`. Simple flow — no branches/PRs.
- Project root: `/Users/sirwolliam/HajjUmrah2/` (folder name differs from repo name `safar-app` — expected, not a mismatch).
- **Claude Code prompt format:** deliver every prompt directly in the chat reply, inside a single fenced code block, as ONE continuous plain-text block with no numbered lists, headers, or explanations breaking it up inside that block. When a single piece of work touches multiple files, combine all of it into that same one code block. Only split into separate prompts for genuinely unrelated concerns. Do NOT create a downloadable file for prompts — copy directly from chat. Do NOT include `npx expo start --clear` or git commands inside the prompt block — give those separately, after, as steps the user runs themselves.
  - **Exception, confirmed necessary tonight:** genuine full-screen rebuilds, brand-new multi-file features, or any file you have not personally seen the current full contents of (because prior prompts touched it and you never saw the resulting code) should NOT be blind-rebuilt as a prompt or a file replacement. Ask for a fresh read first, or write a "report only, do not change anything" prompt to establish ground truth before proposing a fix. This became essential this session — see Section 4's file-verification lessons.
- **TDD update file delivery:** keep editing the working copy internally whenever something worth recording comes up — but only generate/present a downloadable file when the user explicitly asks for it.

### Your role and rules of engagement

You are a **senior UX, product design, and React Native expert** working on Safar, and also a **Muslim pilgrim preparing for Umrah or Hajj** — bring that perspective when relevant.

**Push back when something is wrong.** Do not simply agree with suggestions. If a decision conflicts with the brand, established UX patterns, good product sense, or a decision already made in this doc, say so and explain why.

**Push the design system forward, not just sideways.** New screens — especially anything with a "fun," playful, or engagement-oriented angle (Quiz is the reference case) — should actively resist feeling stale, templated, or predictable. Bold typography, layouts that break the neat header/content boundary intentionally, color choices that go bolder than the calm utility-screen default when the content calls for it. This is bounded, not unlimited: still literal-hex-only, still Phosphor icons only, still no colored left-border card accents (see Section 7). Bold within the system, not outside it. Don't apply this reflexively to every screen — utility screens (Settings, Support, Prayer Times) should stay calm; screens meant to feel energetic or celebratory should actually feel that way.

**Never write code or a Claude Code prompt until you have:**
1. Read the relevant file(s) in full — ask the user to upload the latest version first, or have Claude Code print it fresh
2. Confirmed the specific feature/style you're about to change actually exists where you think it does, and that the file is actually the live, routed-to file (see Section 4)
3. Described the plan in plain language and received confirmation
4. Checked it doesn't conflict with existing decisions in this document

**One session, one concern.** Don't combine unrelated changes into one Claude Code prompt unless genuinely interdependent.

**Revert safety:** Before any significant structural/visual change, give the user the git "save before" command (Section 11). Always end a response that included applied changes with a git commit/push prompt — and if there's any doubt the last one actually landed, have the user run `git status` and read back what it says before trusting a prior "success."

**Never write Claude Code prompts that say "report back" or "confirm first"** inside a change-making prompt — Claude Code is not interactive; that prompt must be complete and correct before pasting. Separately, DO write dedicated "report only, don't change anything" prompts when you need to establish ground truth before proposing a fix — this was one of the most reliable tools of the whole session for resolving confusion cheaply before it became an expensive wrong edit.

**No fabricated citations, ever.** Arabic text, translations, hadith citations, and any religious content claim must come from real, verified sources — check before publishing, not after. Tonight's session caught and fixed a results-screen quote citing Ibn Mājah 224 for a hadith that multiple scholarly sources actually grade as having a weak chain; replaced with a properly *Muttafaqun ʿAlayhi* citation (Sahih al-Bukhari 71 / Sahih Muslim 1037) after actually checking. Apply the same scrutiny to any future religious content rather than trusting a plausible-sounding attribution.

---

## 1. What Safar is

Safar (سفر — Arabic for "journey") is a companion app for Muslims preparing for and performing Hajj or Umrah. It is a **preparation tool first, reference companion second.**

Part of a broader ecosystem: **the app** (primary product), **video content** (YouTube/social), **digital planners** (downloadable/printable), and **a website** — brand tone, color system, and visual language must stay consistent across all of them.

### Product north star
"Consolidation, not crisis management." Every feature earns its place by answering: **does this stop the pilgrim from leaving Safar to do this elsewhere?**

This test was applied hard tonight against two real feature proposals: a Duolingo-style gamified daily-challenge system (rejected — streak mechanics assume an indefinite habit, but pilgrimage prep has a natural, correct endpoint; gamification vocabulary risks trivializing devotional content), and live location sharing for Groups (rejected — contradicts the offline-first positioning, and competes with WhatsApp/Apple/Google Maps at something they already do better). Both are recorded fully in Section 15.

### The pilgrim's three states (drives feature priority)
1. **Pre-trip** — planning, learning, memorizing, building lists
2. **In-the-moment** (performing rites) — fast access, offline, large text, no friction
3. **Post-trip** — reflection, journaling, sharing

### Audience
All ages, teens to 50s — not skewed older. Warm, calm, reverent tone; no stylistic lever pushed to an extreme.

---

## 2. Brand identity

### Color palette (literal hex values only — never theme tokens in StyleSheet)

| Role | Hex | Notes |
|------|-----|-------|
| Page background | `#F5F0E8` | Warm parchment |
| Card background | `#FDFAF4` | Near-white |
| Dark base | `#1A1410` | Primary text |
| Gold accent | `#C8A96A` | Icons, active states, ornaments — dark surfaces only |
| Gold, light-background variant | `#B08F52` | Use this instead of `#C8A96A` when gold text/icons sit on parchment or `#FDFAF4` — the lighter gold is low-contrast there |
| Sage green (actions) | `#4A5C48` | Buttons, active pills |
| Border | `#DDD5C0` | Subtle |
| Divider | `#EDE4D4` | Between rows |
| Text primary | `#1A1410` | |
| Text secondary | `#8A7D6A` | Subtext, labels |
| Text muted | `#5C534A` | Captions, hints |
| Danger/emergency | `#C24A4A` | Reserved for genuinely urgent contexts (Emergency contact accent, delete confirmations) — not a general-purpose accent |

### Pillar identity colors

| Pillar | Color | Feel |
|--------|-------|------|
| Plan | `#445870` | Dusk navy |
| Learn | `#446655` | Deep sage/teal |
| Practice | `#66572E` | Warm olive |
| Connect | `#584260` | Dusk plum |
| Tools | `#3A2F1E` | Warm brown |
| Prepare | `#3A3545` | Warm slate |

**Icon-box convention, established across Groups/Contacts/Quiz this session:** a default/fallback icon (e.g. a generic group icon, an unphotographed contact) sits in a solid circle filled with that content's home pillar's identity color, with a `#C8A96A` gold icon on top — not a translucent/washed-out tint. This reads as far higher contrast and matches how Tools' row icons already worked.

> ⚠️ **Superseded palettes** — do not use: `background #EDE6D8`/`primary #2F5D50`, `Home background #E8DDD0`, dark Focus-screen tokens, four-pillar-only dark card backgrounds. If a surviving screen still uses these, it needs a migration pass — flag it, don't assume it's done.

### ⚠️ Banned pattern — no colored left-border/left-stripe card accent, ever

Tried explicitly on the HomeScreen "About Safar" popup this session and rejected outright by the user. **This is now a permanent design rule — do not propose or apply a colored left border/stripe as a card accent anywhere in the app, in any future session, even if it seems like a natural fit for a new feature.**

### Typography

- **`SourceSerif4-Regular` (SERIF constant):** page titles ONLY and sacred Arabic content. On Quiz's redesigned screens specifically, some headline moments also use this at large sizes as a deliberate bold-typography choice.
- **Everything else:** system sans-serif — omit `fontFamily` entirely.
- **Canonical row-label spec** (confirmed against `HubContainerScreen.jsx`'s `rowLabel`/`rowSub`): title `fontSize: 19`, color `#1C1A14`, no `fontFamily`, no `fontWeight` (regular weight). Subtitle `fontSize: 13`, color `#5C534A`. Icon box `40×40`, icon size `22`. **This is the reference to check any icon-box-plus-title-plus-subtitle card pattern against.**
- Minimum text size: 13px, no exceptions.

### Visual language rules
- Warm, real photography for utility/guide screens; illustrated artwork is now also an established, deliberate register for playful/study-mode content (see Quiz below) — the two are not interchangeable.
- Cards: `#FDFAF4` fill, `#DDD5C0` border, subtle warm shadow, consistent radius, shadow strength `shadowOpacity: 0.08, shadowRadius: 8` (standardized this session).
- Rounded corners, never sharp.
- No emoji anywhere in the UI — Phosphor icons only. Exception: country flags on CurrencyScreen (SVG assets, not emoji).
- No `&&` in style arrays — use ternaries.
- Literal hex values in `StyleSheet.create` — never theme tokens.

---

## 3. Tech stack & hard coding rules

### Stack
- **Framework:** React Native via Expo (SDK 54 per last confirmed build)
- **Navigation:** `@react-navigation` — bottom tabs + native stacks
- **Storage:** `@react-native-async-storage/async-storage`
- **Icons:** `phosphor-react-native` — ALWAYS verify an icon name exists before use (`Kaaba`/`Dove` do NOT exist; use `Mosque`, `HandHeart`, `StarAndCrescent`). Icons used this session that are plausible-standard but **not yet confirmed on-device**: `Siren`, `Pill`, `FirstAid`, `Hospital`, `DotsThreeVertical`, `PencilSimple`, `Trash`, `Check`, `XCircle`. Icons *confirmed* working this session: `CaretLeft/Right/Up/Down`, `Plus`, `UsersThree`, `ShareFat`, `ShareNetwork`, `Copy`, `ImageSquare`, `LinkSimple`, `X`, `Camera`, `MapPin`, `HandHeart`, `Heart`, `StarAndCrescent`, `Mosque`, `CheckCircle`, `MagnifyingGlass`, `AddressBook`.
- **SVG:** `react-native-svg`
- **`expo-image-picker` — NOW INSTALLED AND CONFIRMED WORKING in Expo Go, as of 2026-07-29.** Previously listed as "NOT installed, crashes immediately" — that is now out of date. Every graceful-fallback `try { require("expo-image-picker") } catch` pattern built before this fix now actually succeeds instead of hitting the catch block; several screens still have stale "coming soon" fallback copy that's now technically unreachable but hasn't been cleaned up — low-priority cosmetic debt.
- **`react-native-view-shot` — installed and confirmed working in Expo Go, as of 2026-07-29.** Used by Moments to bake a photo + template into one shareable image. No dev build needed for this specific capability.
- **`react-native-gesture-handler` — installed, as of 2026-07-29.** ⚠️ However, gesture-based interactions combining it with Reanimated v4 (confirmed installed at v4.1.7) **crash in Expo Go specifically** — a real native worklet incompatibility with Expo Go's runtime, not a code bug. This is the one confirmed case this session where a feature genuinely needs a dev build to work: custom pinch/pan crop-and-zoom for Moments is parked for this reason.
- **Anthropic Claude API** — via fetch, active but ⚠️ needs a backend proxy before submission (API key currently in client bundle — security blocker)
- **Currency Exchange API** — key was documented in plaintext in an old doc — treat as compromised, rotate before submission
- **Still NOT installed:** `expo-av` (audio is UI-mock only), `expo-document-picker`, `expo-notifications` (remote push notifications specifically require a dev build, confirmed against current Expo docs this session — a real current SDK 53+ restriction).
- **No new packages without explicit approval.**

### Hard rules — never break these

1. **`StyleSheet.create` at module level, literal hex values only.** Never reference `colors.`, `spacing()`, `radius.`, `typography.`, `shadows.` tokens inside StyleSheet — root cause of 6+ crashes historically. `JourneyScreen.jsx` (the real, live Journey-tab root screen — see Section 4) still violates this as of 2026-07-29 and needs its own migration pass.
2. **No `&&` in style arrays.** Always `style={condition ? [a,b] : a}`.
3. **No unavailable packages** — see list above.
4. **No literal newlines in JS strings** — use `\n` escapes.
5. **Unicode escapes only inside JSX expressions**, never as bare text.
6. **Never combine `transparent={false}` + `statusBarTranslucent` on Modal.**
7. **After any file replacement:** `npx expo start --clear`. If a visual change still doesn't appear after a provably-correct code fix, the next suspects, in order: the file was never actually replaced in the right folder; a Metro cache is stale (`watchman watch-del-all`, clear `$TMPDIR/metro-*`); Expo Go itself has a stale cached bundle (fully delete-and-reinstall, not just close it); the file was never actually committed/tracked by git in the first place.
8. **Phosphor icons only, verified to exist.** No emoji anywhere.
9. **File location conventions:** screens live in `screens/`; root files (`theme.js`, `dua-content.js`, `AccessibilityContext.js`, `affiliateLinks.js`, `momentsStore.js`, `quizData.js`, `quizStore.js`, `groupMetaStore.js`) imported with `../` from screens; shared components at project root (`HeaderPatternBg.jsx`, `SafarAssistCard.jsx`, `PillarList.jsx`, `KaabahIcon.jsx`, `flagAssets.js`, `PostcardTemplate.jsx`) imported from screens as `"../ComponentName"`.
10. **Design-first workflow:** propose the design in plain language, get sign-off, then build.
11. **Read before writing, always.** No exceptions.
12. **No quick fixes** that solve the symptom but create future problems.
13. **No silent assumptions** — see Section 4's dead-file lessons.
14. **Never fabricate Islamic content.** See Section 0.
15. **Watch for smart/curly quote characters (' ' " ") inside JSX.** They cause hard syntax errors when they land in an attribute value or get mixed into pasted/typed content — this happened this session inside an SVG block, breaking multiple attributes at once. Sweep the whole affected section, not just the one line the error points to.
16. **Pre-crop and pre-size hero/header images to their exact final target dimensions before they reach the app** — don't rely on runtime aspect-ratio math for critical hero imagery. A fixed height + `resizeMode: cover` on a properly pre-sized file is more reliable than calculated-ratio + `resizeMode: contain`, which consumed a large amount of debugging time this session despite being mathematically correct at every step checked.

---

## 4. Navigation & architecture — CURRENT, with corrections

### 5 bottom tabs
**Home · Journey · Duas (center) · Tools · Prepare** — custom `SafarTabBar`. Confirmed accurate.

### App boot / onboarding gate
Reads AsyncStorage flag `safar_onboarded_v1`; unset → `Onboarding`, else → `MainTabs`. **Onboarding flow, confirmed against the real file this session:** Screen 3 (journey type) writes `safar_journey_type_v1`. Screen 4 (Safar Assist import) offers AI import or skip. Screen 5 (departure date) is a month/year picker — optional, writes `safar_departure_date_v1` if set, advances either way if skipped. Screen 6 sets `safar_onboarded_v1` and calls `navigation.replace("MainTabs")`. `safar_departure_date_v1` confirmed feeding a "days away" counter on Home. Whether `safar_journey_type_v1` drives anything downstream was **not confirmed** this session.

### ⚠️ THE central lesson of this entire document: verify which file is actually live before touching it

This document already contained a fully worked example of this exact trap before tonight's session even started — the Plan-hub confusion (three files, three wrong edits) — and tonight's session hit the same trap again anyway, on different files. **Treat this as a recurring risk, not a fixed historical bug.**

**Confirmed dead/retired files, current as of 2026-07-29:**
- `ConnectHubScreen.jsx` — dead, edited extensively before discovery. **Deleted 2026-07-29.**
- `PracticeHubScreen.jsx` — same pattern. **Deleted 2026-07-29.**
- `ProgressScreen.jsx` — confirmed dead. **Not yet deleted.**
- `MyJourneyScreen.jsx` — already correctly listed as retired prior to tonight. Confirmed again: last touched May, pre-refactor. Still not deleted.
- `HubScreen.jsx`, `PlanHubScreen.jsx`, `LearnHubScreen.jsx` — retired 2026-07-12, not touched this session.
- `BookmarksScreen.jsx`, `BoardScreen.jsx` — deleted 2026-07-22.

**⚠️ Correction to a previously-documented retirement — `GroupDetailScreen.jsx` is LIVE again, not retired.** The 2026-07-22 version of this document stated `GroupDetailScreen.jsx` was retired 2026-07-12, absorbed into `GroupsScreen.jsx`. **That architecture changed again this session.** Groups was deliberately split back into a list/detail pair — `GroupsScreen.jsx` is now a clean list of group cards, `GroupDetailScreen.jsx` was rebuilt as the real per-group screen. Both confirmed registered on `JourneyStack` and working on-device. **Do not treat the 2026-07-12 retirement note as current.** Full detail in Section 10.

**The real, live `HubContainerScreen.jsx` practice and connect pillar rows, confirmed as of 2026-07-29:**
- **Connect pillar rows:** Groups, Connections, My Contacts (all `nav: "tab"` to Journey stack), **Moments** (new this session, replaced the old Notifications row), Share Safar.
- **Practice pillar rows:** **Quiz** (new this session, added as the first row, `nav: "stack"` to `QuizHub`), Umrah/Hajj Du'ās, Audio Practice, Du'ā Library, Media (icon corrected from a duplicate `PlayCircle` shared with Audio Practice to `Video`, this session).

**The `tab`-type navigation handler in `HubContainerScreen.jsx` now passes `returnToTab` and `initial: false` on every cross-tab navigate** — this was missing before this session (confirmed root cause of Groups/Moments back buttons stranding users in the wrong tab) and is now fixed. Value used: `"Home"`.

**`JourneyScreen.jsx` — the real, live Journey-tab root screen, needs its own dedicated cleanup session.** Not previously documented under this name (only `MyJourneyScreen.jsx`, its retired predecessor, was listed). Confirmed live and actively maintained. Still on the old `colors`/`theme` token architecture (hard-rule violation). Has its own embedded, duplicate "Add Contact" and "Add Card" modals writing to the *same* AsyncStorage keys as `MyContactsScreen.jsx`/`MyBoardScreen.jsx` (data isn't fragmented) but the UI has drifted — e.g. it still has the six-color contact swatch picker deliberately removed from `MyContactsScreen`'s rebuild. Also contains `UMRAH_STEPS`/`HAJJ_STEPS` ritual-sequence data (a genuinely good concept — progress through the actual rites, duas attached per step) whose `done`/`active` flags appeared hardcoded in what was reviewed — not fully confirmed either way. **Needs a focused session**: token migration, consolidating the duplicate modals, determining whether the ritual-step tracker is functional or decorative.

### Stacks and screens, updated 2026-07-29

- **HomeStack:** HomeMain, HubContainer, HajjGuide, WhatToExpect, Groups, GuidesHubScreen, Shop, Media, Notes, Settings, CurrencyConverter, Calendar, Checklists, ChecklistDetail, OfficialResourcesScreen, **QuizHub, Quiz, QuizResults, QuizReview** (new)
- **JourneyStack:** JourneyMain (→ `JourneyScreen.jsx`), WhatToExpect, Groups, **GroupDetail** (live again), MyBoard, MyContacts, **Moments, MomentCreator** (new), Tawaf, Saiy
- **DuasStack:** MyDuas, DuaList, Dhikr
- **ToolsStack:** ToolsMain, PrayerTimes, Qibla, CurrencyConverter, Tawaf, Saiy, Dhikr, PracticeLearn, Notes
- **PrepareStack:** PrepareMain (ProfileScreen), Notes, CurrencyConverter, Support, WhatToExpect, PrintOffline, Media
- **Root Stack (full-screen, no tab bar):** Onboarding, MainTabs, DuaDetail, StepGuide (ProgressScreen — confirmed dead), PracticeLearn, PilgrimageDuas, SafarAssist, SacredPlaces

Note: `CurrencyConverter` exists on `ToolsStack`/`PrepareStack` but not `HomeStack` — a hub row navigating within-stack to it from `HomeStack` failed for this reason; fixed by switching that row to cross-tab navigation.

### Retired (files deleted or kept unwired — do not re-wire without reason)
- `GuidesScreen.jsx` — 945-line pre-Hub monolith
- `BoardScreen.jsx`, `HubScreen.jsx`, `PlanHubScreen.jsx`, `BookmarksScreen.jsx` — deleted 2026-07-22
- `LearnHubScreen.jsx` — retired 2026-07-12
- `ConnectHubScreen.jsx`, `PracticeHubScreen.jsx` — deleted 2026-07-29
- `MyJourneyScreen.jsx`, `ProgressScreen.jsx` — confirmed dead, not yet deleted
- `OnboardingCarousel.jsx` — superseded by `OnboardingFlow.jsx`

### Navigation helper — tab vs. stack
```js
// Navigate to a tab from a stack screen:
navigation?.getParent?.()?.navigate?.("TabName");

// Navigate to a stack screen:
navigation?.navigate?.("ScreenName");

// Cross-tab navigate that must return correctly on back:
navigation?.getParent?.()?.navigate?.("TabName", {
  screen: "ScreenName",
  initial: false,
  params: { returnToTab: "OriginTabName" },
});
```

The destination screen's back button must check `route?.params?.returnToTab` and call `navigation?.getParent?.()?.navigate?.(returnToTab)` instead of `goBack()` when present. **Confirmed present and correct on:** `GroupDetailScreen`, `MyContactsScreen`, `ConnectionsScreen`, `GroupsScreen`, `MomentsScreen`, `QuizHubScreen`, `CalendarScreen`, `PrayerTimesScreen`, `QiblaScreen`, `DhikrScreen`. Any new cross-tab-reachable screen needs this from day one.

### Parked components (`parked-components.jsx`)
`FocusModeCard` and `SacredPlacesCard` — removed from Home, preserved for reuse.

---

## 5. Home screen (current design)

Vertical order: **hero slideshow → welcome card → Four Pillars → My Journey card → My Shortcuts → Du'ā of the Day.**

- **Hero:** media eyebrow tag now reads "HELPFUL VIDEOS, PODCASTS, AND ARTICLES" (was "CURATED MEDIA"); headline now reads "Learn. Prepare. Be ready." (was "Educate. Prepare. Be ready.").
- **My Shortcuts:** Qibla/Prayer Times/Dhikr shortcut cards were confirmed broken this session (navigated within `HomeStack` to screens only on `ToolsStack`/`DuasStack`) — fixed with cross-tab `getParent().navigate()` including `returnToTab: "Home"`. **Visual contrast issue identified but not fixed, per explicit user decision** — translucent tile backgrounds, mismatched wrapper color. A mocked-up alternative was built and shown but the user chose to keep the current version — revisit only if asked.
- **Du'ā of the Day:** now **pinnable**. Wired directly to `duaLibrary.js`'s real entry `hu12` (not `dua-content.js`/`duas-data.js` — see Section 6) via `toggleBookmarkCard`/`isBookmarkedOnBoard` from `bookmarkStore.js`, called directly rather than through the `toggleDuaBookmark` wrapper (which resolves via `dua-content.js`, where this dua doesn't exist). Pin button matches `DuaCard.jsx`'s existing pattern — plain Unicode heart glyph, outline vs. filled.
- **About Safar popup:** simplified this session. Nested `PillarList` render replaced with a plain inline text list (pillar name in bold gold `#B08F52`, description below, no icons). Modal height reduced. Body copy shortened. **A colored left-border accent was tried and explicitly rejected — see Section 2.**
- **Footer:** "Dua Sources" shortened to "Sources."

---

## 6. Content: Du'ās — ⚠️ THREE separate dua data sources exist, confirmed this session

Confirmed this session: `duaLibrary.js` is a **third**, separate dua data file from the previously-known `dua-content.js` (adapter) / `duas-data.js` (normalized source) pair — different shape again (`id`, `stage`, `title`, `subtitle`, `isFeatured`, plus `arabic`/`transliteration`/`translation`/`source`). This is where Home's daily dua (`hu12`) actually lives. **`dua-content.js`/`duas-data.js` does not contain `hu12` at all** — confirmed by searching both for its distinctive text.

**Practical implication:** before assuming a dua is reachable through `bookmarkStore.js`'s `toggleDuaBookmark`/`getDuaById` (which resolve via `dua-content.js`), confirm it actually exists there. If it only lives in `duaLibrary.js`, call `toggleBookmarkCard`/`isBookmarkedOnBoard` directly with the real title/Arabic/translation rather than fabricating missing metadata to force it into `duas-data.js`'s shape.

This three-file situation should be resolved (migrated to one canonical source) eventually — not attempted this session, flagged as real debt.

**Never fabricate** Arabic/translation/citations. Scholar review is mandatory before App Store submission.

---

## 7. Design principles (agreed)

- **Pillars = cards, not pills.**
- **Settings/utility rows are intentionally a different, thinner pattern than Hub rows.**
- **Header tier system, current as of 2026-07-29:**
  - **Pillar Hub Header:** tall image-backed header (height 260) — ToolsScreen, HubContainerScreen, SafarAssistScreen.
  - **Sage Ornate Header:** sage `#4A5C48` + gold `HeaderPatternBg`. Used on Currency, MyBoard, Notes, PrayerTimes, Qibla, Settings, Support, Checklists, ChecklistDetail, MyContacts, Connections, OfficialResources, **Groups (list screen — added this session)**.
  - **Sage Solid Header — CalendarScreen exception.**
  - **⚠️ New this session: full-bleed illustrated topic header, NOT Ornate Header, used deliberately on Quiz's screens.** Quiz's Hub and question screens use a full-width illustrated topic image instead of the gold-pattern treatment — a deliberate choice, made because Quiz is meant to feel more playful/energetic. On the question screen, the topic title overlaps the boundary between the header image and content below (negative-margin technique) rather than sitting neatly in either zone. Per-topic title colors match each topic's Hub card color (Umrah `#4A5C48`, Hajj white override on `#584260` since that image is darker, Duas `#7A6B4A`, Places `#FDFAF4`). **Do not apply Ornate Header to Quiz's screens** — considered exception, not a gap to fix.
  - **⚠️ New jewel-tone palette, Quiz correct/incorrect/results screens only:** forest green `#163C2C` (correct), rust-brown `#7A3324` (incorrect, deliberately not red), light gold `#E8CB8A` (feedback titles). **Scoped to these specific moments** — don't extend without a deliberate conversation.
- **Card grammar:** `#FDFAF4` fill, `#DDD5C0` border, `shadowOpacity: 0.08, shadowRadius: 8` (standardized this session).
- **Icon-box convention:** solid pillar-color circle + gold icon for default content icons (see Section 2).
- **No colored left-border/left-stripe card accent, ever.**
- Low cognitive load, high contrast, legible text. Minimum text size 13px.
- **Copy standard: the word "rites" is not used in the app.**
- **About Safar lives in Settings.**
- **MediaScreen dark theme** (`#000000`) — intentional.

### Product decisions
- **Duas in the center tab.**
- **"Practice" spelling** — American English app-wide.
- **Onboarding-only, no forced signup** — deferred by design. See Section 15 for what this currently blocks.

### Discarded ideas — do not revisit
| Idea | Why discarded |
|---|---|
| Intent picker on every app open | Adds mandatory friction before any value |
| Module-level StyleSheet with theme refs | Crashes at module parse time |
| `&&` in style arrays | Crashes StyleSheet in Expo Go |
| Colored left-border/stripe card accent | Tried, explicitly rejected 2026-07-29 |
| Real-time chat inside Groups | Competes with WhatsApp on its own turf; needs push (dev build); real safety surface. See Section 15. |
| Live location sharing in Groups | Contradicts offline-first; Apple/Google/WhatsApp already do it better. See Section 15. |
| Duolingo-style daily challenge streaks | Assumes an indefinite habit; pilgrimage prep has a natural endpoint. Gamification risks trivializing devotional content. See Section 15. |
| Personalization quiz for Shop filtering a live product database | Needs exactly the maintained database the Shop architecture avoids; asks users to disclose health info for a shopping filter. See Section 14. |
| "Community" as pillar/grid label | Implies social network — replaced with "Connect" |

---

## 8. Product/business decisions — ⚠️ UNCONFIRMED, NEEDS REVISIT

Unchanged this session — pricing $9.99 one-time, family sharing, Duas Edition, gifting, multi-language, YouTube, scholar verification. Treat as shelved/uncertain.

---

## 9. Open questions (not yet resolved)

- `ImportTripScreen` — likely tied to SafarAssist; built, orphaned. Not touched this session.
- **`NotificationsScreen` — partially resolved this session.** Row removed from `HubContainerScreen`'s Connect pillar (replaced by Moments). Screen file and `App.js` stack registration **not** fully cleaned up as of 2026-07-29.
- `AuthScreen` — deferred by design.
- `SacredPlacesScreen` — registered but unreachable, needs entry point + content commitment. Queued as part of Map/Sacred Places redesign work.
- `HajjUmrahPickerScreen` — role vs. GuidesHubScreen/HubContainerScreen unclear.
- Dua data source question — now confirmed as **three** genuinely separate files (Section 6).
- **`backups/` folder** — discovered this session, contains at least one stale duplicate Quiz screen copy. Not investigated further.
- **Dev build** — considered directly this session, decided to hold off. Confirmed concrete reason to do it eventually: custom gesture-based crop/zoom for Moments (Section 3). Also unlocks real push notifications.
- **Security blockers before App Store:** Claude API key needs backend proxy. Currency Exchange API key treat as compromised, rotate.

---

## 10. Key screens and their status

### Rebuilt this session, confirmed working

- **`GroupsScreen.jsx` + `GroupDetailScreen.jsx`** — full list/detail split rebuild (see Section 4 correction — this pair is live). List: Sage Ornate Header, group cards, "My Groups"/"Shared with Me" toggle (`ownerUid` added to the data model). Detail: members row, milestone feed (kept — chat and live location both considered and rejected, Section 15), avatar picker (icon/initials/photo), invite codes, edit/delete overflow menu, long-press-to-delete (not swipe). `groupMetaStore.js` (new) persists name/avatar edits since Firebase is fully stubbed (below).
- **`MyContactsScreen.jsx`** — full rebuild. Palette migration, Phosphor icons, long-press menu, photo avatars, alphabetical sort (was silently broken), sticky footer save button. Six-color swatch picker removed — it was decorative, not systematic; kept color for Emergency contacts only (`#C24A4A`, the one category where fast visual triage matters).
- **`ConnectionsScreen.jsx`** — same full-rebuild treatment, `returnToTab` back button added (previously ignored it entirely).
- **Firebase reality check, confirmed this session:** `firebase.js` is **fully stubbed** — `getCurrentUser()` returns a hardcoded guest, subscriptions always callback empty, writes just log to console. Every "real data" path in Groups/Connections currently never fires — the demo/example data is not a fallback, it's the only thing any user currently sees. Real Firebase setup is a separate, larger project (schema, security rules, real accounts — the last of which the TDD deliberately deferred elsewhere).

### New features built this session

- **Moments** (postcard/prayer-card creation and sharing) — `momentsStore.js` (AsyncStorage, no Firebase needed), `PostcardTemplate.jsx` (shared render component for both grid thumbnails and the `ViewShot` capture target, so they can't drift apart), `MomentsScreen.jsx`, `MomentCreatorScreen.jsx`. Templates are **code-drawn, not pre-made PNG assets** — an SVG-clipped pointed Islamic arch (matching `DuaDetailScreen`'s real cubic-bezier `ArchFrame`/`HeaderPattern`), the same gold `PATTERN_PATH` used in headers app-wide, an 8-pointed star ornament. Chosen because the user couldn't produce alpha-transparency cutout PNGs — code-drawing the frame removed that requirement. Real view/edit mode distinction for saved Moments. **Crop/zoom parked — needs a dev build**, Section 3.
- **Quiz** — `quizData.js` (Umrah/Hajj/Duas/Sacred Places, 10 questions each, scoped to safely factual content — not fiqh-adjacent permissibility questions with cross-madhab variation), `quizStore.js`, `QuizHubScreen.jsx`, `QuizScreen.jsx`, `QuizResultsScreen.jsx`, `QuizReviewScreen.jsx` (separate dedicated review screen, matching a Claude Design mockup the user brought in). See Section 7 for the deliberate visual departure. Results screen hadith card styled to match Home's dua-card treatment but intentionally omits Arabic/transliteration (a citation, not a recitation). Sources footnote lives on the Hub screen only. **Quiz header images pre-cropped/pre-sized as final assets** — the reference case for Section 3's rule 16.
- **Profile avatar** — photo picker added alongside the existing preset illustration grid (real illustrated artwork, not an icon+color system).

### Updated this session
- **`WhatToExpectScreen.jsx`** — text sizing corrected to the canonical spec (Section 2). Icons updated (`Hospital`/`Siren`/`Pill` — unverified). Emergency Numbers gets `#C24A4A`. Sources footnote removed from Health & Medical tab only.
- **`OfficialResourcesScreen.jsx`** — Sage Ornate Header applied.

### Completed / solid, carried forward from 2026-07-22, not re-verified this session
HomeScreen, MyBoardScreen, NotesScreen, PracticeLearnScreen, CalendarScreen, MyDuasScreen, DuaDetailScreen — see the 2026-07-22 archive for full detail if needed.

### Custom shared modules
All modules from 2026-07-22 (`bookmarkStore.js`, `practiceStore.js`, `Toast.jsx`, `KaabahIcon.jsx`, `PillarList.jsx`, `flagAssets.js`, `HeaderPatternBg.jsx`, `SafarAssistCard.jsx`) confirmed still accurate. **New this session:** `momentsStore.js`, `quizStore.js`, `quizData.js`, `groupMetaStore.js`, `PostcardTemplate.jsx`.

### Still to build (priority order, carried forward)
1. PilgrimageDuasScreen
2. UmrahGuideScreen / HajjGuideScreen
3. **ShopScreen redesign** — now informed by the affiliate architecture work this session, see Section 14. Not started.
4. FAQ section in Learn hub
5. SacredPlacesScreen (needs content commitment first)
6. Share feature (replaces PrintOfflineScreen) — unchanged, not touched this session.

---

## 11. Git reference

### Standard commit pattern
```bash
git add -A
git commit -m "description of what changed"
git push
```

### Revert-safety pattern
```bash
git add -A
git commit -m "Save before [description of change]"
git push
```

### ⚠️ Lessons from this session

- **"Everything up-to-date" from `git push` is not proof anything was saved** — can mean nothing was staged/committed. Always follow with `git status` and read back what it says.
- **A batch of quiz-feature work plus several homescreen/hub edits sat uncommitted for hours** before this was caught.
- **GitHub requires a Personal Access Token now, not a password.** Generate at GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → `repo` scope.
- **When embedding a token into a remote URL, the placeholder text must actually be substituted** — this session hit the literal string `YOUR_GITHUB_USERNAME:YOUR_TOKEN` saved into the URL, twice. Prefer letting git prompt fresh for credentials over embedding them in the URL.

### Revert a single file
```bash
git checkout HEAD~1 -- screens/FileName.jsx
git add screens/FileName.jsx
git commit -m "Revert [description]"
git push
```

### View history
```bash
git log --oneline
```

---

## 12. Assets

Carried forward from 2026-07-22, plus new this session: **`assets/quiz/`** — `quiz-hub-header.png`, `quiz-umrah.png`, `quiz-hajj.png`, `quiz-duas.png`, `quiz-places-2.png`. Pre-cropped/pre-sized to final dimensions directly, not left to runtime math — see Section 3, rule 16. Follow the same approach for any new hero/header image going forward.

---

## 13. Content & asset research (ongoing assistant task list)

Unchanged in concept from 2026-07-22. **New this session:** a full Amazon affiliate shop content/production plan — see Section 14. A printable Wish List research checklist (Word doc + Google-Docs-checklist-ready text) was built for the production assistant, covering 91 product types across 17 categories plus 4 Pilgrim Kits.

---

## 14. Shop / Amazon affiliate strategy — new section, 2026-07-29

Extensive planning happened this session; **no app code was written yet** — architecture and content-production planning only.

### Chosen architecture
- **Amazon Associates Storefront** (not Seller Brand Storefront — different program, requires Brand Registry, not applicable). Public Storefronts with Idea Lists are now included in standard Associates registration as of an April 2026 update — previously required Influencer Program approval (real social following), which wouldn't have been accessible here.
- **Safar shows category/kit cards linking to Amazon Idea Lists — no in-app product database.** Deliberate: a hand-maintained catalog goes stale fast, and Amazon's own terms restrict displaying/caching their product images/prices outside official tools anyway.
- **Commission reality check:** category rates (roughly 1-4.5% for relevant categories) are essentially fixed regardless of UX approach — the real lever is conversion, not rate.
- **International note:** Saudi Arabia is excluded from Amazon's simplified "Earn Globally" tooling, requiring a separate locally-registered account. Cross-border redirection uses product-matching, not exact translation — niche items risk falling back to a low-rate generic search result.

### Content structure
91 product types across 17 flat categories, organized primarily as **Pilgrim Kits** (First-Time Umrah, Hajj Essentials, Senior Pilgrim, Family) as the main Shop entry point, flat categories secondary. Each product type gets up to three tier picks (Budget/Best Value/Premium) — **specific branded picks live only in Amazon's Idea Lists, never hardcoded into Safar or this document.**

**Open question:** whether Family/Senior should be standalone kits (current structure) or add-on modules layered onto a pilgrimage-type kit, since a family doing Hajj needs both sets of items.

**Workflow:** a dedicated Amazon account builds Wish Lists now (no approval wait), migrating to real Idea Lists once Associates is approved on the same account. Wish Lists do **not** carry affiliate tracking on their own — only links generated from inside the actual Storefront/Idea List tools do.

### Product Selection SOP
4.5★+ rating, 1,000+ reviews (or trusted specialty brand), in stock, reputable non-knockoff brand, genuinely suitable for Hajj/Umrah conditions. Medical category recommends organizational products only, never specific medications by name.

---

## 15. Considered and rejected — feature decisions worth remembering the reasoning for

- **Real-time chat inside Groups.** Rejected: competes directly with WhatsApp, which does it better already (delivery receipts, voice notes, offline resilience); needs push notifications (dev build); opens a real safety/moderation surface. The milestone/Āmeen feed does something WhatsApp doesn't — devotional, curated moments rather than open conversation — kept for that reason.
- **Live location sharing in Groups.** Rejected: contradicts offline-first positioning; Apple/Google/WhatsApp already solve this better (fails the north-star test directly). A **static, pre-planned Meeting Point** (agreed in advance, zero-connectivity-safe) was proposed as the actual offline-native alternative — not built yet, a good candidate for a future Groups addition.
- **Duolingo-style daily challenges with streak gamification.** Rejected as a streak mechanic specifically — pilgrimage prep has a natural endpoint, unlike an indefinite habit, so a streak would punish someone for successfully finishing their prep. Real tonal risk flagged too: wrapping devotional content in commercial-engagement packaging risks reading as tone-deaf to the more traditionally-minded half of the audience. Quiz captures the legitimate underlying idea without streak pressure.
- **A personalization quiz for Shop** (auto-generated shopping list from health/mobility/budget answers). Good v2 idea, not built — needs exactly the live queryable product database the Shop architecture (Section 14) was designed to avoid, and asks users to disclose health information for a shopping filter, which deserves deliberate handling.
