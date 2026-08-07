# Safar Phase 2 — Execution checklist

**Status:** Build spec, not strategy. This file exists to be *followed*, not debated. All strategic questions are answered in `SAFAR_IA_MIGRATION_v2.md` — this file assumes those decisions are locked and tells us how to actually execute the tab restructure without breaking the app.

**Built from:** the fresh `App.js` and every screen file uploaded through 2026-08-05, plus a grep audit of every cross-tab `getParent()?.navigate()` call in the live codebase.

**The target:** move from the current 5-tab structure (`Home / Journey / Duas / Tools / Prepare`) to the new 5-tab structure (`Home / Plan / Learn / Practice / Connect`), while keeping the app running the whole way through.

---

## Part 1 — What we're changing

### Tab bar transformation

| Current tab | Fate |
|---|---|
| Home | Stays. Content simplifies (see Part 3). |
| Journey | Retires. Contents redistribute. |
| Duas | Renames to Practice. Absorbs worship counters. |
| Tools | Retires. Contents redistribute. |
| Prepare | Renames to Plan. Absorbs planning tools. |
| — | **New:** Learn tab. |
| — | **New:** Connect tab. |

### The tab bar itself

`TAB_CONFIG` and `SafarTabBar` in `App.js` (lines 127–184) currently define the five tabs. In Phase 2 we redefine `TAB_CONFIG` to:

| Tab | Icon (Phosphor) | Label | Center? |
|---|---|---|---|
| Home | House | Home | no |
| Plan | ListChecks | Plan | no |
| Learn | BookOpen | Learn | no |
| Practice | Moon | Practice | yes (center) |
| Connect | UsersThree | Connect | no |

Practice keeps the center-tab treatment (the old Duas position) because it's the app's highest-use content type. Icon choices are suggestions — you'll want to sign off before we build.

**Pillar colors** (locked from `HubContainerScreen`'s `PILLAR_CONFIG`):
- Plan: `#2E4560`
- Learn: `#2D4F32`
- Practice: `#4E3414`
- Connect: `#3D2240`

These get used for active tab tint, section headers inside each tab, and item dots on the Home countdown card.

---

## Part 2 — The new stack registrations

Each of the five stacks gets rebuilt to hold the right screens. Complete target-state below. Screens moving between stacks are marked.

### HomeStack (mostly unchanged)

```
HomeMain, HubContainer (retire), Settings, Notifications
```

Everything else that was in HomeStack moves out (see below). Home becomes leaner.

### PlanStack (new — replaces PrepareStack)

Landing screen: **`ProfileScreen`** (already the `PrepareMain` landing — same file, new name).

```
PlanMain (ProfileScreen), Notes, CurrencyConverter, PrintOffline,
Calendar, Checklists, ChecklistDetail, MyBoard (moved from Journey),
MyContacts (moved from Journey), Support (moved from Prepare)
```

### LearnStack (new)

Landing screen: **need to decide.** Two options in the migration doc — either build a new small Learn landing that surfaces guides/quiz/media, or reuse `GuidesHubScreen` as the landing. Working assumption: build a minimal new landing. This is a small file, not a big design task.

```
LearnMain (new), UmrahGuide, HajjGuide, GuidesHub, WhatToExpect,
Media, SacredPlaces (linked, was root-stack), Map (moved from Journey),
QuizHub, Quiz, QuizResults, OfficialResources
```

### PracticeStack (rename of DuasStack, with additions)

Landing screen: **`MyDuasScreen`** (same as today).

```
PracticeMain (MyDuasScreen), DuaList, Moods,
Dhikr, Tawaf (moved from Journey/Tools), Saiy (moved from Journey/Tools),
PracticeLearn (moved from Tools), PrayerTimes (moved from Tools),
Qibla (moved from Tools), HajjUmrahPicker
```

### ConnectStack (new)

Landing screen: **need to decide.** No current screen fits — Groups is the most obvious candidate, but Connect really needs a proper landing that shows all four Connect concerns (groups, contacts, moments, notifications). Working assumption: build a minimal new landing similar to Learn's.

```
ConnectMain (new), Groups, GroupDetail, Connections, MyContacts,
Moments, MomentCreator
```

### Root Stack (unchanged)

```
Onboarding, PillarIntro, MainTabs,
DuaDetail, StepGuide, PracticeLearn, PrintOffline,
PilgrimageDuas, SafarAssist, SacredPlaces
```

---

## Part 3 — Cross-tab navigation calls that break

**This is the single most fragile part of Phase 2.** Below is every `getParent()?.navigate()` call in the current codebase. Every one of them targets one of the tabs by name — and every tab name changes. So every one needs updating.

Confirmed via grep of the fresh uploads:

### HomeScreen (lines 906, 916, 918, 946, 948)

| Current call | Target tab that no longer exists | Update to |
|---|---|---|
| `getParent().navigate("Journey", ...)` | Journey → gone | `navigate("Plan", { screen: "MyBoard" })` |
| `getParent().navigate("Journey", { screen: "MyBoard" })` | Journey → gone | `navigate("Plan", { screen: "MyBoard" })` |
| `getParent().navigate("Journey", { screen: "MyContacts" })` | Journey → gone | `navigate("Connect", { screen: "MyContacts" })` |
| `getParent().navigate("Tools", { screen: "Qibla" })` | Tools → gone | `navigate("Practice", { screen: "Qibla" })` |
| `getParent().navigate("Tools", { screen: "Dhikr" })` | Tools → gone | `navigate("Practice", { screen: "Dhikr" })` |

Also: HomeScreen currently has a "My Journey" card pointing at the Journey tab landing. That's obsolete. Retire the card entirely — its role is absorbed by the Home countdown card in Phase 3.

### CalendarScreen (line 351)

`getParent().navigate(returnToTab)` — the `returnToTab` param is set by whoever navigated here. All callers currently pass `"Home"`, `"Tools"`, or `"Prepare"`. Need to update every caller to pass the new tab name. Ideally, just standardize on `navigation.goBack()` here since Calendar is only ever reached from one place in the flow.

### JourneyScreen (line 306)

`getParent().navigate("Home", { screen: "Calendar" })` — Journey is being retired, so this whole file goes away in Phase 2. No update needed; the file is deleted.

### MyBoardScreen (line 441)

`getParent().navigate(rt)` where `rt` is `returnToTab`. Same story as CalendarScreen — depends on who sent them here. Standardize to `goBack()` if possible, or update all callers.

### ProfileScreen (line 563)

`getParent().navigate("Journey", { screen: "MyBoard" })` → update to `navigate("Plan", { screen: "MyBoard" })`. Note: ProfileScreen is *becoming* PlanMain, so this is now a same-stack call — should just be `navigation.navigate("MyBoard")` after the migration.

### ToolsScreen (lines 76, 78)

The whole file is being retired since Tools tab goes away. Not updated — deleted.

### HubContainerScreen (line 151)

The `goRow()` function dispatches cross-tab navigation via `getParent().navigate(item.tab, ...)` based on `item.tab` in `PILLAR_CONFIG`. Every entry in that config that specifies a `tab` value needs its target updated:

| Old `tab` value | New `tab` value |
|---|---|
| `"Home"` | `"Home"` (unchanged) |
| `"Journey"` | `"Plan"` for board-related, `"Connect"` for people-related |
| `"Prepare"` | `"Plan"` |
| `"Tools"` | `"Practice"` for worship counters, `"Home"` for prayer/qibla ambient (if surfaced there), `"Plan"` for currency |
| `"Duas"` | `"Practice"` |

There are ~20 entries in `PILLAR_CONFIG`. Each needs walking through individually — no shortcut here. This is worth doing all at once in one commit.

---

## Part 4 — What has to happen in what order

Phase 2 breaks into 5 discrete commits, in strict order. Each is small enough to review and revert cleanly.

### Phase 2a — Tab bar rename + basic tab structure

**Scope:** `App.js` only. No screen files touched.

**Changes:**
1. Update `TAB_CONFIG` with new tab names, icons, labels
2. Rename `PrepareStack` → `PlanStack`, `DuasStack` → `PracticeStack`, `ToolsStack` → (delete), `JourneyStack` → (delete)
3. Create empty shells for `LearnStack` and `ConnectStack` (temporary landings pointing at a placeholder)
4. Update `MainTabs` to register the 5 new tabs

**What breaks after this commit:** the app opens. Old navigation calls (which point at `"Journey"`, `"Tools"`, `"Prepare"`) will throw errors at runtime. This is intentional — the app is now visibly in a broken state until Phase 2b lands.

**Verifiable outcome:** the tab bar shows the new labels/icons. Tapping tabs loads placeholder content for Learn and Connect; Plan and Practice load their old content (still working); Home shows unchanged.

**Don't ship this alone.** Phase 2a is a stepping stone — you should complete Phase 2b in the same session.

### Phase 2b — Move screens to new stacks

**Scope:** `App.js`. Big edit — every stack navigator changes.

**Changes:**
1. Rebuild `HomeNavigator` with the reduced screen set from Part 2
2. Rebuild `PlanNavigator` (from old PrepareStack) with additions
3. Rebuild `PracticeNavigator` (from old DuasStack) with additions
4. Build `LearnNavigator` with all Learn-tab screens
5. Build `ConnectNavigator` with all Connect-tab screens
6. Update root Stack registration (no changes here, but verify PilgrimageDuas/SafarAssist/SacredPlaces still route correctly)

**What breaks after this commit:** every cross-tab `getParent().navigate()` call still uses old tab names. Any tap that triggers cross-tab navigation will crash. Same-tab navigation still works.

**Verifiable outcome:** app launches without errors, tabs show the right screens as landings, tapping within a tab works.

### Phase 2c — Fix cross-tab navigation calls

**Scope:** 5 screen files: `HomeScreen`, `CalendarScreen`, `MyBoardScreen`, `ProfileScreen`, `HubContainerScreen`. `JourneyScreen` and `ToolsScreen` are being deleted anyway.

**Changes:**
1. Walk through Part 3 of this doc systematically. Every `getParent().navigate()` call gets updated to point at the new tab name.
2. `PILLAR_CONFIG` in `HubContainerScreen` gets a full audit — every `tab:` value updates per the mapping in Part 3.

**What breaks after this commit:** cross-tab navigation now works — but only through code paths we've explicitly updated. If we missed one, tapping that particular tile still crashes. So this needs eye-on-app testing after landing.

**Verifiable outcome:** every tile on every screen navigates without error.

### Phase 2d — Delete retired files

**Scope:** delete `JourneyScreen.jsx`, `ToolsScreen.jsx`. Remove imports from `App.js`. Verify nothing else imports them.

**Preconditions:**
- Phase 2b and 2c must be complete
- Both files' navigation targets must have been redistributed to the new tabs

**What breaks after this commit:** nothing, if 2b and 2c were done correctly. If we missed a redistribution, this commit will reveal it as an import error.

**Verifiable outcome:** app builds and runs without either file present.

### Phase 2e — Home content pass

**Scope:** `HomeScreen.jsx`. This is the visible-to-user commit.

**Changes:**
1. Delete the four-pillar tile grid (it's redundant with the new tab bar)
2. Delete the "My Journey" card (obsolete — its role goes to the Phase 3 Home countdown card)
3. Delete the shortcut grid targeting the old Tools tab (now a tap on the tab bar)
4. Update HeroCarousel and any other content-surface configs to reflect the new tab structure
5. Simplify Home to: hero + prayer times/qibla ambient + today's du'ā + placeholder for Phase 3 countdown card

**What breaks:** nothing. This is a Home-only visual restructure.

**Verifiable outcome:** Home looks simpler, no dead links, ready for the Phase 3 countdown card.

---

## Part 5 — What's decided vs. still open

### Locked (safe to build against)

- Five new tabs with names, order, and pillar colors
- Every screen's new stack home
- Every cross-tab navigation call has a specified target
- The Home four-pillar grid is deleted
- The "My Journey" card is deleted
- The `JourneyScreen` and `ToolsScreen` files are deleted

### Small decisions still open (need answer before we start)

1. **Tab bar icon choices.** I proposed BookOpen (Learn) and UsersThree (Connect). You have final say on all five.
2. **LearnStack landing.** Build a new minimal landing, or reuse `GuidesHubScreen`? Either works — I lean new landing so Learn has a "front door" that shows all its content types, not just guides.
3. **ConnectStack landing.** Same question. I lean new landing.
4. **Return-to-tab behavior.** Multiple screens use a `returnToTab` param today. Do we keep this convention (updating targets) or standardize on `goBack()`? I lean `goBack()` — simpler and less brittle.
5. **Phase 2a alone vs. phase 2a+b together.** Phase 2a leaves the app in a broken state. Do we ship these as one commit or two? Ship-as-one is simpler; ship-as-two is safer for review. I lean ship-as-one *within the same session*, with the commit message noting it's the first half of a paired change.

### Larger decisions deferred to Phase 3+

- What the Home countdown card actually contains (Phase 3)
- What each pillar tab's landing shows in detail (Phase 3)
- Content authoring for phase-timed checklist items (Phase 3)
- What During-mode and After-mode Home look like (deferred)
- Shop's home in the app (still an open question from the migration doc)
- MyBoard renaming (still open — will be validated by user feedback)

---

## Part 6 — What could go wrong

Named honestly so we plan for it:

**Missed cross-tab call.** The grep found what's in the fresh uploads. If any screen I don't have a fresh copy of makes cross-tab navigation calls, they'll break silently until you tap that specific path. Mitigation: walk every screen after Phase 2c, tap every button. Especially screens I haven't seen fresh recently.

**PILLAR_CONFIG rewrite miss.** `HubContainerScreen` has ~20 config entries. Missing one means one tile in one hub doesn't work. Mitigation: do the update as a systematic pass, not selective.

**Deep-link parameter breakage.** Some navigation calls pass parameters like `{ mode: "umrah" }`. Those need to survive the migration unchanged. Mitigation: preserve all parameter passing exactly during Phase 2c.

**Onboarding still references old tabs in copy.** `OnboardingFlow` and `PillarIntroScreen` may reference "Duas tab" or "Prepare tab" in their teaching copy. Needs a fresh read once Phase 2 is done.

**Hardcoded checklist arrays in Guide screens.** `UmrahGuideScreen` and `HajjGuideScreen` each carry their own hardcoded checklists that never touch `checklistStore`. This isn't a Phase 2 blocker — those files are moving to Learn as-is — but it's queued for a later cleanup pass. Flagged so it doesn't get lost.

---

## What to do next

Answer the 5 small open decisions in Part 5. Once those are locked, I can write the actual Claude Code prompt for Phase 2a+2b.

I would strongly recommend we don't start Phase 2 execution today. This checklist itself is enough for a session. Sleep on it, review the decisions, come back fresh to execute.

If you want to move now anyway, I'll write the first prompt.
