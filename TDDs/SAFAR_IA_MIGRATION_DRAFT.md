# Safar IA migration — pillars-as-tabs

**Status:** draft for review. Nothing here has been agreed to. This is the source of truth we work FROM in the next session, not one we ship from.

**Built from:** the fresh `App.js` you uploaded 2026-08-02. Every screen currently registered in that file is listed below.

**What this doc is:** one row per screen, showing its current tab-home and its proposed new tab-home under the pillar-based tab bar (Home · Plan · Duas · Learn · Connect). Judgment calls are flagged. Screens that are dead code or genuinely shared destinations are called out separately.

**What this doc is NOT:** a migration plan. No code moves until we agree on this table.

---

## Proposed new tabs

Working assumption from our last conversation:

- **Home** — front door. Days-to-go, what's next, resume-last-thing. Simplified from today's hero carousel.
- **Plan** — everything about getting ready for the trip.
- **Duas** — the du'ā library. Its own tab because it's the most-used content type in a pilgrimage app.
- **Learn** — everything about understanding what you're doing. Guides live front-and-center here.
- **Connect** — the people layer.

Practice concept folds into Duas (the counters become "worship tools" alongside the library).

---

## The screen table

Legend for **Confidence**: 🟢 = obvious placement, 🟡 = defensible but has an argument the other way, 🔴 = real judgment call, worth discussing.

### From current HomeStack

| Screen | Currently in | Proposed home | Confidence | Notes |
|---|---|---|---|---|
| HomeScreen (`HomeMain`) | Home | **Home** | 🟢 | Stays. Content restructures — see "Home content changes" below. |
| HubContainerScreen | Home | **Retire** | 🟡 | If the pillars are the tabs, this "hub of hubs" screen has no job. Its child hub screens (`PlanHubScreen`, `LearnHubScreen`, etc.) become tab landing pages. |
| UmrahGuideScreen | Home | **Learn** | 🟢 | Promoted to top-of-tab visibility. This is one of the app's most important screens. |
| HajjGuideScreen | Home | **Learn** | 🟢 | Same. |
| WhatToExpectScreen | Home, Journey, Prepare | **Learn** | 🟢 | Understanding what the trip is like = Learn. |
| GroupsScreen | Home, Journey | **Connect** | 🟢 | |
| GuidesHubScreen | Home | **Learn** (landing) | 🟡 | Candidate for Learn tab's main landing screen — but "Learn" is bigger than just guides (media, quiz, sacred places). May need a new Learn landing screen instead. |
| ShopScreen | Home | **Home** or standalone | 🔴 | Real question flagged in our conversation — Shop probably doesn't want to live inside a pillar. Options: (a) promoted card on Home, (b) its own top-level access from Home, (c) contextual product cards inside relevant Learn/Plan screens. NOT proposing a Shop tab. |
| MediaScreen | Home, Prepare | **Learn** | 🟡 | Learn is the honest fit, but MediaScreen already has categories that cross-cut Umrah/Hajj/reflection/travel. Might need to be a shared destination reachable from multiple tabs. |
| NotesScreen | Home, Prepare, Tools | **Plan** | 🟢 | Creation tool for trip prep. |
| SettingsScreen | Home, Prepare | **Header-level** | 🟡 | Should not live inside a tab at all. Gear icon in a persistent app header, accessible from anywhere. If persistent header isn't feasible short-term, put it on Home only. |
| NotificationsScreen | Home | **Header-level** | 🟡 | Same as Settings — bell icon in header, not tab content. |
| CalendarScreen | Home | **Plan** | 🟢 | "What's on Tuesday" — pure planning surface. |
| ChecklistsScreen | Home | **Plan** | 🟢 | |
| ChecklistDetailScreen | Home | **Plan** | 🟢 | |
| OfficialResourcesScreen | Home | **Learn** | 🟡 | Assumption — I haven't seen this file. Could equally be Plan (visa info) or a header-level "Resources" link. Needs review. |
| QuizHubScreen | Home | **Learn** | 🟢 | |
| QuizScreen | Home | **Learn** | 🟢 | |
| QuizResultsScreen | Home | **Learn** | 🟢 | |

### From current JourneyStack (tab retired)

| Screen | Currently in | Proposed home | Confidence | Notes |
|---|---|---|---|---|
| JourneyScreen (`JourneyMain`) | Journey | **Retire in current form** | 🔴 | Its "you are here now" job moves partly to Home (days-to-go, next-up), partly to Duas' pilgrimage guides. Its board-cards strip is redundant with real Board. Its hardcoded step data (see "Debt to clean up" below) is a fourth checklist system that shouldn't exist. |
| MapScreen | Journey | **Learn** | 🟡 | Sacred Places / pilgrimage map is Learn (understanding geography). Could argue Home (navigation while on trip), but Learn is honest. |
| SiteDuasScreen (stub in App.js) | Journey | **Retire** | 🟢 | Placeholder defined inside App.js. Real SacredPlacesScreen exists as a shared destination. |
| GroupDetailScreen | Journey | **Connect** | 🟢 | |
| ConnectionsScreen | Journey | **Connect** | 🟢 | |
| MyBoardScreen | Journey | **Plan** | 🟢 | Confirmed as the unified saved-things surface (reads bookmarkStore). Belongs in Plan alongside Notes, Checklists, Calendar. |
| MyContactsScreen | Journey | **Connect** | 🟢 | |
| MomentsScreen | Journey | **Connect** | 🟡 | Reflect/share-with-people concept. Could also argue this is post-trip and deserves its own quiet corner. |
| MomentCreatorScreen | Journey | **Connect** | 🟡 | Follows wherever Moments goes. |
| TawafScreen | Journey, Tools | **Duas** | 🟢 | "Worship tool" alongside the du'ā library. |
| SaiyScreen | Journey, Tools | **Duas** | 🟢 | Same. |

### From current DuasStack

| Screen | Currently in | Proposed home | Confidence | Notes |
|---|---|---|---|---|
| MyDuasScreen (`MyDuas`) | Duas | **Duas** (landing) | 🟢 | |
| DuaListScreen | Duas | **Duas** | 🟢 | |
| MoodsScreen | Duas | **Duas** | 🟢 | |
| DhikrScreen | Duas, Tools | **Duas** | 🟢 | Worship tool. |

### From current ToolsStack (tab retired)

| Screen | Currently in | Proposed home | Confidence | Notes |
|---|---|---|---|---|
| ToolsScreen (`ToolsMain`) | Tools | **Retire** | 🟢 | Tools tab goes away. Its contents redistribute below. |
| PrayerTimesScreen | Tools | **Home** or **Duas** | 🔴 | Genuine judgment call. It's a *utility* (Tools instinct), but it's about *worship timing* (Duas instinct), and it's *always-visible information* (Home instinct — you glance to see the next prayer). My lean: Home surfaces it as a card, screen lives in Duas. Discuss. |
| QiblaScreen | Tools | **Home** or **Duas** | 🔴 | Same question as PrayerTimes. Same answer probably. |
| CurrencyConverter (`CurrencyScreen`) | Tools, Prepare | **Plan** | 🟢 | Trip preparation utility. |
| PracticeLearnScreen | Tools, Root-stack | **Duas** | 🟢 | Practice queue for du'ās. |
| (Tawaf/Saiy/Dhikr covered above) | | | | |
| (Notes covered above) | | | | |

### From current PrepareStack (tab retired)

| Screen | Currently in | Proposed home | Confidence | Notes |
|---|---|---|---|---|
| ProfileScreen (`PrepareMain`) | Prepare | **Plan** (landing) | 🟡 | Its "your stuff" role fits Plan. But it also has resource links and shop tiles — needs a content pass, not just a move. |
| SupportScreen | Prepare | **Header-level** | 🟡 | Same reasoning as Settings — accessible everywhere via a header link, not a screen inside a tab. |
| PrintOfflineScreen | Prepare, Root-stack | **Plan** | 🟢 | Preparation action. |
| (Notes / WhatToExpect / CurrencyConverter / Media covered above) | | | | |

### Shared destinations (root Stack — no tab bar)

These push over the whole app for focused tasks. Recommendation: keep as-is, reachable from many surfaces.

| Screen | Notes |
|---|---|
| Onboarding | First-launch gate. Unchanged. |
| PillarIntro | First-launch intro. **Content needs updating** to reflect that the pillars are now the tab bar — the current copy will read confused otherwise. |
| MainTabs | Container for the tab bar. |
| DuaDetail | Full-screen du'ā read. Unchanged. |
| StepGuide (ProgressScreen) | Unchanged. |
| PracticeLearn | Also lives in Duas — keep root-stack registration for cross-tab reach. |
| PrintOffline | Also lives in Plan — same pattern. |
| PilgrimageDuas | Unchanged. |
| SafarAssist | Unchanged. |
| SacredPlaces | Unchanged. |

---

## Home content changes (previewed, not spec'd)

The tab restructure only works if Home also changes. Rough shape:

- **Hero carousel shrinks or goes away for users with a trip.** New users get a short welcome; users with a departure date see something purposeful (e.g. "82 days to Umrah — 3 checklist items due this week").
- **The Four Pillars grid disappears from Home.** The pillars ARE the tabs now — repeating them on Home is redundant. That's ~90 lines of Home that go away.
- **The "About Safar" / welcome-content role moves entirely to Onboarding + PillarIntro.** Home stops being a marketing surface.
- **PrayerTimes stays surfaced on Home** (glance-value info), Qibla probably also.
- **Today's Du'ā** stays. Continuation card stays. Journey card stays but simplifies (was pointing at the retired Journey tab — now points to Plan or to a specific "my pilgrimage" surface).
- **My Shortcuts grid stays but changes contents** — currently Qibla / Calendar / Dhikr / Notes. Those are now cross-tab jumps; the shortcut concept still holds.

None of this is spec'd. It's the shape.

---

## Onboarding + PillarIntro content changes

Both need copy revisions so a new user learns "Plan / Duas / Learn / Connect are the four sections of the app" rather than "the app is organized into four pillars that you'll find on the Home screen." Not a redesign — a copy pass. `PillarList` component may need updating too.

---

## Debt to clean up during (or after) migration

Not required for the IA move, but flagging so it doesn't get lost:

- **Umrah/Hajj Guide screens each have their own hardcoded checklist** with their own AsyncStorage keys, disconnected from `checklistStore.js`.
- **JourneyScreen has hardcoded `UMRAH_STEPS`/`HAJJ_STEPS` arrays with their own duas** — a fourth parallel system (after `duas-data.js`, `duaLibrary.js`, and the guide screens).
- **JourneyScreen writes to `safar_journey_board_v1`** — a separate board key from the real `bookmarkStore` board. Deadwood or bug — needs investigation.
- **`GuidesScreen.jsx` exists as a file but is not registered anywhere.** TDD flags it as retired. Delete.
- **`ProgressScreen.jsx` and `MyJourneyScreen.jsx`** were flagged as dead code in the TDD. Delete.
- **`headerPattern.js` and `duaLibrary.js`** flagged as orphaned in the TDD. Investigate before delete (Home's daily dua still uses `duaLibrary.js` per TDD — verify before removing).
- **`NotificationsScreen` is registered but was described as "half-removed" in the TDD.** Finish the removal or finish the build. Don't leave it in limbo.
- **`backups/` folder uninvestigated per TDD.** Check before we start moving things.

---

## Questions for you to think about overnight

1. **Shop.** Genuinely no obvious pillar home. Which of the three options (Home card / standalone section / contextual promotions inside screens) sounds right?
2. **PrayerTimes and Qibla.** Home / Duas / somewhere else?
3. **Moments.** Connect, or a quieter "reflection" surface I'm not proposing yet?
4. **Practice-as-a-word.** In the current pillar model, "Practice" is one of the four. If Duas absorbs the practice role, do we rename anything, or is the pillar-vs-tab-label separation fine?
5. **OfficialResources.** Learn or header-level?
6. **The "Journey" concept broadly.** In the current app, "Journey" is trying to mean two things: (a) your logistical trip and (b) where-you-are-in-the-rites. This split moves (a) to Plan and (b) into Home + Duas. Does that split feel right, or does the sense of "the pilgrimage as a narrative arc" need its own home somewhere?

---

## What next session looks like

You come back with reactions to this doc — approvals, disagreements, answers to the questions above. We resolve every 🔴 and 🟡. Result is a locked table.

Then, only then, we start planning the actual migration order — which is a separate exercise, because the order matters (Home changes need to land last; guides need to move before Home restructure so the pillar tiles have somewhere to point to; etc.).

No code moves until the table is locked.
