# Safar IA migration — v2

**Status:** working document. This supersedes the v1 draft from the previous session.

**Built from:** the fresh `App.js` uploaded 2026-08-02, every screen file uploaded across this session's conversation, and the two external product reviews you shared today. When conflicts arose, uploaded files were treated as truth over project-knowledge copies.

**What this doc is:** the source of truth for the IA restructure and the Home countdown card work. All decisions we've reached go in here. All open questions are named here so nothing lives only in a chat history that we'll forget.

**What this doc is NOT:** a launch plan. It doesn't cover marketing, user acquisition, scholarly review of du'ā content, or any of the launch-adjacent workstreams. It's product architecture and design principles only.

---

## Part 1 — Product principles

These are the top-level commitments the rest of the doc rests on. Every downstream decision was tested against them, and every future decision should be too.

### The one-sentence mission

Safar exists to **remove unnecessary uncertainty so pilgrims can devote more attention to what actually matters.** That's a preparedness product, not an engagement product. Those are almost opposite incentives.

Consequences of that framing that guide every downstream call:

- Don't interrupt. Don't nag. Don't gamify. Don't chase daily active users for their own sake.
- Be there exactly when needed, and recede when not.
- Every new feature must answer *"does this make the pilgrim feel one step ahead?"* If not, cut it.
- When close to launch: instead of asking *"would this feature make the app more impressive?"*, ask *"would removing this feature make the app less trustworthy?"* Those are different tests, and only the second one matters.

### The four anxieties framework

Pilgrims don't download Safar because they want another app. They download it because they have uncertainty. Each of the four pillars answers a specific anxiety:

| Pillar | Anxiety it reduces |
|---|---|
| Plan | "I'm afraid I'll forget something." |
| Learn | "I'm afraid I won't know what to do." |
| Practice | "I'm afraid I won't be ready." |
| Connect | "I'm afraid I'll lose touch or feel alone." |

This is the primary lens for every future placement decision. When debating where a screen or feature belongs, ask *"which anxiety does this reduce"* — not *"what category is this."*

### Copy voice: informing, not instructing

The app is a companion, not an authority. Copy should inform pilgrims and gently nudge, never dictate. Concretely:

- Avoid imperative verbs ("take care of X," "study Y," "finalize Z")
- Use observational or descriptive framing instead ("visas and flights are usually the first priorities")
- Reserve authoritative voice for scholarly content (du'ā sources, hadith citations), where authority is earned
- Reassurance stays quiet — one small phrase per sentence at most

This voice applies to every future content decision: Home card copy, empty states, phase transitions, contextual nudges, error messages, help text.

### The five phases

The pilgrim's experience of the app is organized by four phase modes plus a fifth for users without dates:

| Phase | Trigger | Home behavior |
|---|---|---|
| Exploring | No trip dates | Standard welcome hero, learning content forward, unobtrusive "add dates" invitation |
| Early Preparation | 90+ days out | Home countdown card, early-stage checklist items, planning-heavy priorities |
| Focused Preparation | 30–90 days | Card content shifts toward learning and practice items |
| Final Preparation | 7–30 days | Card content shifts toward packing, review, family communication |
| On Your Way | 0–7 days | Card content is documents, essentials, group check-in |
| Pilgrimage | During trip | Home simplifies dramatically — the app recedes |
| Reflecting | Post-trip | Home reorients to saved content, moments, revisiting duas that mattered |

Two important properties of this framework:

**One question drives everything.** Onboarding asks *"when is your trip?"* — not *"what kind of user are you?"* One answer, all downstream personalization derives from it. Users can add or change dates at any time; the framework accommodates the shift automatically.

**Exploring is a first-class mode, not a defect.** Users without dates get a genuine experience, not a nag to add dates. Their Home surface is optimized for learning and discovery. Adding dates later is a value exchange, framed as an offer with a clear promise (personalized preparation timeline), not a form field.

### The ambient / active / destination pattern

Content and features fall into three categories, each with different design treatment:

- **Ambient utilities** — glance-value info that appears without navigation. Prayer times, Qibla direction, days-to-go, today's du'ā. Lives on Home, always visible, no dedicated screens needed.
- **Active utilities** — tools the user opens with intent. Tawaf counter, Sa'y counter, currency converter, dhikr counter, practice queue. Lives inside its pillar tab with real prominence, not buried in submenus.
- **Content destinations** — surfaces the user navigates to. Guides, du'ā library, media, checklists, groups. Normal tab content with normal tab conventions.

This distinction affects placement, prominence, and interaction design. A screen fits its pillar; an ambient utility fits Home; an active utility fits a pillar with visibility.

---

## Part 2 — The new tab structure

### Locked decisions

**Five tabs**: Home · Plan · Learn · Practice · Connect

These map directly to the pillars the onboarding already teaches. The navigation reinforces the promise instead of competing with it.

**Prepare tab retires.** Its contents distribute cleanly across the other pillars.

**Tools tab retires.** Its contents distribute — ambient utilities to Home, active utilities to their honest pillar homes.

**Journey tab retires.** But the pilgrimage-type concept (Umrah vs. Hajj) persists as a first-class app concept throughout. Users declare their pilgrimage at onboarding, can change it in settings, and it drives Home countdown copy, checklist content, and pillar-tab personalization. The Learn tab treats both guides evenhandedly (per-visit picker in `GuidesHubScreen`). The Practice tab's du'ā collections keep their existing per-visit picker (`HajjUmrahPickerScreen`). No tab is dedicated to "the journey" as a concept — that job is distributed across every relevant tab, which is stronger than centralizing it.

### Pillar charters

Each pillar has a one-sentence charter and a list of what belongs / doesn't belong. These are decision-forcing tools; every future feature placement gets tested against them.

**Plan** — *Everything about getting ready for the trip.*
- Belongs: checklists, notes, calendar, currency converter, print/offline, board (saved things), profile/settings landing
- Doesn't belong: learning content, worship acts, group communication, purely ambient info

**Learn** — *Everything about understanding the pilgrimage.*
- Belongs: Umrah/Hajj guides, What to Expect, media (videos/podcasts/articles), sacred places, quiz, official resources
- Doesn't belong: worship counters, du'ā practice sessions, personal planning tools, group communication

**Practice** — *Everything about the acts of worship themselves.*
- Belongs: du'ā library, moods, dhikr counter, tawaf counter, sa'y counter, PracticeLearn queue, pilgrimage duas
- Doesn't belong: passive reading content, planning tools, group communication

**Connect** — *Share the journey with the people who matter.*
- Belongs: groups, group chat, family updates, milestone/moment sharing, emergency contacts, shared itinerary/context
- Doesn't belong: public feeds, discovery of strangers, follow/friend mechanics, engagement metrics, likes, comments

**Home** — *The pilgrim's personalized, phase-aware landing.*
- Belongs: countdown card (Preparing phases only), today's du'ā, prayer times, Qibla, welcome hero (Exploring phase only), emotional touchpoint (Preparing phases)
- Doesn't belong: pillar tile grids (redundant with tabs), full-screen carousels for feature discovery, engagement bait

### Screen migration table

Every screen currently registered in `App.js` and its proposed new home:

| Screen | Currently in | Proposed home | Notes |
|---|---|---|---|
| HomeScreen | Home | Home | Stays. Content restructures significantly — see Part 3. |
| HubContainerScreen | Home | Retire | "Hub of hubs" has no job when pillars are the tabs. |
| UmrahGuideScreen | Home | Learn | Top-of-tab visibility. Most important content in the app. |
| HajjGuideScreen | Home | Learn | Same. |
| WhatToExpectScreen | Home / Journey / Prepare | Learn | Understanding the trip. |
| GroupsScreen | Home / Journey | Connect | |
| GroupDetailScreen | Journey | Connect | |
| GuidesHubScreen | Home | Learn (landing candidate) | Umrah/Hajj picker for guides. |
| ShopScreen | Home | Home card or standalone | Real open question. See Part 5. |
| MediaScreen | Home / Prepare | Learn | |
| NotesScreen | Home / Prepare / Tools | Plan | Multiple duplicate registrations cleaned up. |
| SettingsScreen | Home / Prepare | Header-level | Not a tab-owned screen — gear icon accessible everywhere. |
| NotificationsScreen | Home | Header-level or retire | Half-removed per TDD. Needs a decision — finish removal or finish build. Not both. |
| CalendarScreen | Home | Plan | |
| ChecklistsScreen | Home | Plan | |
| ChecklistDetailScreen | Home | Plan | |
| OfficialResourcesScreen | Home | Learn | |
| QuizHubScreen | Home | Practice | Moved from Learn per the intake-vs-doing distinction. |
| QuizScreen | Home | Practice | Same. |
| QuizResultsScreen | Home | Practice | Same. |
| JourneyScreen | Journey | Retire in current form | Redistributes to Home + Duas' pilgrimage guides. |
| MapScreen | Journey | Learn | Sacred Places / pilgrimage map. |
| SiteDuasScreen | Journey | Retire | Stub in App.js. Real SacredPlacesScreen exists. |
| ConnectionsScreen | Journey | Connect | |
| MyBoardScreen | Journey | Plan | Unified saved-things surface. Belongs alongside Notes/Checklists/Calendar. |
| MyContactsScreen | Journey | Connect | |
| MomentsScreen | Journey | Connect | |
| MomentCreatorScreen | Journey | Connect | |
| TawafScreen | Journey / Tools | Practice | Worship counter. |
| SaiyScreen | Journey / Tools | Practice | Same. |
| MyDuasScreen | Duas | Practice (landing) | |
| DuaListScreen | Duas | Practice | |
| MoodsScreen | Duas | Practice | |
| DhikrScreen | Duas / Tools | Practice | Worship counter. |
| ToolsScreen | Tools | Retire | Contents redistribute below. |
| PrayerTimesScreen | Tools | Home ambient + Practice | Surfaces on Home; screen lives in Practice. |
| QiblaScreen | Tools | Home ambient + Practice | Same pattern. |
| CurrencyScreen | Tools / Prepare | Plan | |
| PracticeLearnScreen | Tools / Root-stack | Practice | |
| ProfileScreen | Prepare | Plan (landing candidate) | Needs content pass, not just move. |
| SupportScreen | Prepare | Header-level | Not tab content. |
| PrintOfflineScreen | Prepare / Root-stack | Plan | |
| ProgressScreen | Root-stack (StepGuide) | Stays root-stack | Full-screen. |
| DuaDetailScreen | Root-stack | Stays root-stack | Full-screen. |
| PilgrimageDuasScreen | Root-stack | Stays root-stack | |
| SafarAssistScreen | Root-stack | Stays root-stack | |
| SacredPlacesScreen | Root-stack | Stays root-stack | |
| HajjUmrahPickerScreen | ? | Practice (linked from du'ā library) | Small gateway screen. |
| Onboarding | Root gate | Root gate | Content revisions needed — see Part 4. |
| PillarIntroScreen | Root gate | Root gate | Content revisions needed — see Part 4. |
| PostcardTemplate | Component | Component | Used inside Moments. |

---

## Part 3 — The Home countdown card

### What it is

A phase-driven, tap-off checklist card that lives at the top of Home for users who've entered dates. Not a countdown clock. Not a marketing surface. A calm, active preparation surface.

### Structural specification

The card is split into two visually-distinct sections, presented as sibling cards on Home:

**Card 1 — The phase header**

Contains, in order:
- "YOUR JOURNEY" label (small pill or tag)
- Phase name (large serif, e.g. "Early Preparation")
- Phase description sentence (informing voice, phase-specific — see below)
- Days-to-go anchor (calendar icon + number + "days until your Umrah/Hajj")
- Small illustration accent (Kaaba motif at small scale — not a hero-sized image)
- Phase timeline (5 dots showing the arc: Early → Focused → Final → On Your Way → Pilgrimage)
- "Phase X of 5" corner tag

**Card 2 — The checklist mechanic**

Contains, in order:
- "This week" label (small, sage)
- Editorial framing sentence (large serif, phase-appropriate)
- 4 checklist rows, each with:
  - Checkbox (tap to check off)
  - Pillar dot (small colored circle indicating which pillar this item belongs to)
  - Task label
  - Chevron (indicates the row is tappable — opens the pillar tab)

**No third card for overall progress.** Retired. If pilgrim-facing progress needs to surface later, it happens contextually (post-check-off satisfaction moment), not as a persistent bar.

### Phase-specific content

Same card structure across all phases. Only the content shifts. Phase description sentences use the *informing, not instructing* voice locked earlier this session:

**Early Preparation** (90+ days)
> You have time to plan carefully. Visas, flights, and accommodation are usually the first priorities.

**Focused Preparation** (30–90 days)
> A good stretch for learning the rites, memorizing key duas, and shaping your packing list.

**Final Preparation** (7–30 days)
> The trip is getting close. Packing, guides, and a word with family often come into focus around now.

**On Your Way** (0–7 days)
> Almost there. Documents, essentials, and a check-in with your group are worth a last look.

**Pilgrimage** (during the trip)
> You are here. The duas and guides are ready when you need them.

### Card behavior across modes

**Exploring (no date):** Card doesn't appear. A smaller, unobtrusive "invitation" appears in its place — a one-line prompt framing date entry as an offer, not a nag. Example wording (draft, not locked): *"Planning a trip? Add your dates for a personalized preparation timeline."*

**Preparing phases:** Card appears as specified above. Content shifts across phase thresholds.

**Pilgrimage:** Card behavior TBD. Working assumption from this session's user-usage discussion: pilgrims won't use the app in real-time during pilgrimage except for duas and notes. The card may pare back to a "You are here" state pointing to duas and notes, or disappear entirely and let Home surface only what's needed. Design work still open.

**Reflecting:** Card transforms into a memory surface — showing back saved duas, notes written during the trip, milestones completed. Fundamentally different job. Design work still open.

### Open card questions

- **What happens when all 4 items get checked off?** Card empties out and looks barren? Auto-refills from a queue? Collapses to a "caught up" state? Not decided.
- **Custom items with due dates:** the Phase 1b schema is ready to accept them, but the UI to create custom items and the logic to surface them on the card aren't built. Deferred.
- **Pillar colors:** the mockups use sage/gold/blue/coral. These need to be locked as the canonical pillar color palette and applied consistently across the app (tab bar, headers, item dots).

---

## Part 4 — Home restructure

Home changes materially even outside the countdown card. What lands on Home in each mode:

### Exploring user (no date)

- Welcome hero (current design stays)
- Small "add dates for personalized experience" invitation
- Today's du'ā
- Prayer times / Qibla ambient strip
- Contextual content surfacing (Learn-forward)
- Ambient content (soft, discoverable)

### Preparing user (date entered)

- Phase header card (see Part 3)
- Checklist mechanic card (see Part 3)
- Contextual reminders — content promoted based on phase (e.g. "Today's duas to practice")
- New emotional touchpoint replacing welcome hero — TBD (rotating ayah/hadith surface is the working direction, not locked)
- Today's du'ā
- Prayer times / Qibla ambient strip

### Removed from Home (both modes)

- The four-pillar tile grid — redundant when pillars are the tab bar
- The "My Journey" card — redundant with the phase header
- The shortcuts grid (Qibla/Calendar/Dhikr/Notes) — now one tab-tap away, no shortcut needed
- The HubContainer routing on pillar tiles — retired with the tab restructure

### Onboarding and PillarIntro content revisions

Both screens need copy revisions:

- Onboarding: introduce Safar's mission (the "one-sentence" from Part 1), then ask the trip-date question framed as an offer with value exchange, then Umrah-vs-Hajj, then optional name. `PillarIntroScreen` follows and now says *"Here's the app for exploring/preparing for Umrah in 84 days"* — content-shifted based on the mode already established.
- Content copy for both screens uses the *informing, not instructing* voice locked in Part 1.

---

## Part 5 — Open questions still unresolved

These are the questions that would need real answers before we can consider Phase 2 complete. Some are content questions, some are IA questions, some are external.

**Shop.** No pillar home is obviously right. Three options: (a) promoted card on Home, (b) standalone section reached from Home, (c) contextual product cards inside relevant Learn/Plan screens. Not a Shop tab. Not decided.

**MyBoard renaming.** External reviewer flagged "Board" as vague. Candidate replacements: "Saved," "Journey Kit," "For My Journey," "My Essentials." Not decided. Will be validated by user feedback.

**PrayerTimes and Qibla screen ownership.** Ambient on Home is settled. Screen destinations live in Practice per the current draft, but Home ambient + Practice screens might feel like duplication. Design work still open.

**NotificationsScreen.** Half-removed per TDD. Either finish removing it (delete file, deregister from App.js, remove navigation calls) or finish building it. Currently in limbo.

**Layer 1 timeline authoring.** The phase-driven checklist needs actual content — task items assigned to `daysOutThreshold` values across all 90+ days. This is editorial work. Not started. May need scholarly partnership for legitimacy.

**Pilgrimage phase (During-mode) design.** Beyond "app recedes, duas and notes stay usable" — no specific design work has been done. Includes: what does Home look like, does the tab bar change, does the phase header disappear, what surfaces stay.

**Reflecting phase (After-mode) design.** Same as above — a working concept, not a specification.

**Pillar color palette lock-in.** The Home card mockups use specific colors. Those need to be committed as canonical and rolled through the app.

**AI features roadmap.** Four layers identified (curated timeline → progress-aware nudging → content recommendation → conversational coach). Layer 1 shipping with Phase 3 (Home card). Layers 2-4 are deferred, sequenced by cost and content maturity.

---

## Part 6 — Migration order

Assumes we don't get user feedback before executing. If we do, that changes priorities based on what surfaces.

**Phase 1 — Foundation** ✅
- Phase 1a: Delete confirmed dead files ✅
- Phase 1b: Add `daysOutThreshold` schema field to checklistStore ✅
- Phase 1c: Delete `duaLibrary.js` (deferred — needs manual dua-by-dua verification first)

**Phase 2 — Tab restructure** (next)
- Batch upload of tab-landing and utility screens for verification
- Update App.js — rename tabs, delete Prepare/Tools/Journey tabs, move screen registrations
- Redistribute screens per the migration table (Part 2)
- Update all `navigation.navigate()` calls in the codebase to reflect new stacks
- Update tab bar icons and colors
- Consolidate parallel checklist systems (Guide screens + Journey screen) into `checklistStore` during their moves
- Update HomeScreen to remove pillar grid, Journey card, shortcuts grid
- Update onboarding and PillarIntro copy

Estimated: 4-6 sessions.

**Phase 3 — Home countdown card** (after Phase 2)
- Build the phase header card component
- Build the checklist mechanic card component
- Wire cards to `checklistStore` with phase-filtering logic
- Populate authored task list with `daysOutThreshold` values (real editorial work)
- Add Exploring-mode invitation variant

**Phase 4 — Checklist time-awareness** (after Phase 3)
- Add due-date UI to checklist items
- Add in-app overdue indicators
- Custom items with due dates flow into Home card

**Phase 5 — Deferred**
- Push notifications
- Sharing
- AI layers 2-4
- During-mode design work
- After-mode design work

---

## Part 7 — What this doc doesn't lock

Explicit acknowledgment of the gaps, so we don't pretend this is more decided than it is:

- **No user data yet.** Everything in this doc is design-and-strategy reasoning without evidence of how real pilgrims use the app. The friends' user sessions are still the highest-priority input for the coming week.
- **No visual design for the countdown card at phone width.** The mockups are at desktop dimensions. Real phone rendering may surface layout issues.
- **No pillar-color palette locked as system-level values.** Just applied in the card mockups.
- **No content authored yet for the phase-driven checklist.** The schema is ready; the content is empty.
- **No decision on Shop.** Real gap.
- **No After-mode or During-mode design.** Placeholder-only in this doc.
- **The consolidated checklist system** (four parallel systems merging into one) is queued for Phase 2 but not designed yet.

---

## Meta: how this doc gets used

- Every future placement decision refers back to Part 1 (principles) and Part 2 (pillar charters).
- Every design decision on Home refers to Part 3.
- Every open question is either resolved into this doc as it's decided, or promoted from Part 5 into the appropriate section.
- The migration order in Part 6 is the source of truth for what we're building next.

This doc gets rewritten, not versioned. When a decision changes, the old version dies. There is no v3 lineage — there's only current.
