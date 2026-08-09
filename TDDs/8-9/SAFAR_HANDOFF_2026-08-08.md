# SAFAR — Handoff to next session (2026-08-08)

## What you need to know before we start

**You are a senior UX, product design, and React Native expert continuing work on Safar, a Hajj & Umrah pilgrimage companion app.** The user is a designer (not a developer) who executes edits via Claude Code prompts you write. They paste prompts, verify results, and commit via git.

**Your voice:** direct, candid, no glazing. The user has explicitly asked for shorter responses without preamble. Push back when they're wrong. Trust their design instincts — they've been right more than you have this project. Ask them to show a screenshot only when something's genuinely broken or ambiguous; they use iPhone and airdropping is friction.

**Before every session:** read `SAFAR_TDD.md` and `SAFAR_TDD_MASTER.md`. Also read this file and `SAFAR_TDD_APPEND_2026-08-08.md` (the appendix documenting today's work).

**Before every deletion or file edit:** ask the user to upload the fresh file. The project-knowledge copies are stale. Grep results confirm belief; they don't establish truth. Files can be doing significant internal work even with no external imports.

## Where we are

The countdown card on Home is fully wired to real trip data. The app has been restructured to a pillar-based tab bar (Home · Plan · Learn · Practice · Connect). Everything visual and structural is landed and committed. What remains is one piece of editorial content authoring plus small code wiring.

## The next task: Phase 3c — author phase-timed checklist content

The Home countdown card currently shows 4 hardcoded test tasks:
```
{ id: "visa",      label: "Book your visa appointment",       pillar: "plan"     },
{ id: "ihram",     label: "Read the guide to Ihram",          pillar: "learn"    },
{ id: "insurance", label: "Confirm your travel insurance",    pillar: "plan"     },
{ id: "niyyah",    label: "Memorize the intention (niyyah)",  pillar: "practice" },
```

Also a hardcoded weekly framing:
```
const TEST_WEEKLY_FRAMING = "Start your visa application";
```

These need to be replaced with real data driven by the current phase (Early / Focused / Final / On Your Way / Pilgrimage).

**Foundation is ready:**
- `checklistStore.js` schema has `daysOutThreshold: null` on every item (Phase 1b landed)
- 39 items across 4 categories (documents, packing, spiritual, before-leaving)
- Home countdown card computes `daysOut` and `phaseIdx` correctly from real trip date

**What's missing:**
1. **Editorial: assign `daysOutThreshold` values** to each of the 39 items in `checklistStore.js`. This is real editorial thinking about "what should a pilgrim focus on at 60 days out vs. 45."
2. **Editorial: write 5 "This week" framing sentences**, one for each phase.
3. **Code: wire the countdown card** to read from `checklistStore` filtered by current phase (small work once content is authored).
4. **Code: persist check-off state** so tapping the checkbox on Home writes to `checklistStore`.

## How to approach it

**Do NOT draft all 39 threshold values in one shot.** The user wants to work through this collaboratively, category by category. You are the pilgrim they trust to have opinions, but they will edit/reject as they go. Work in this order:

1. Show the user the current items grouped by category
2. For each category, propose a threshold per item with brief reasoning
3. They accept, reject, or shift
4. Once thresholds are locked across all 4 categories, write the 5 phase framing sentences
5. Then write the wiring code

**Voice for the framing sentences:** "informing not instructing." Locked in this session. Examples from the phase descriptions we already have:
- "You have time to plan carefully. Visas, flights, and accommodation are usually the first priorities."
- "The trip is getting close. Packing, guides, and a word with family often come into focus around now."

Not "Book your visa now!" Not "You must memorize..." Observational, gentle, non-directive.

**On the threshold interpretation:** items appear at their threshold and stay until checked. On Home, show up to 4 items whose threshold is closest to (but not less than) current days-to-go, prioritizing incomplete items. This was agreed as the v1 approach.

## Ask the user first thing

Ask them to run this in Terminal:

```
cat checklistStore.js | grep -E "id:|label:" | head -50
```

That gives you the current list to work from. Then start with category one (documents) and walk through it together.

## Other things pending

- **Prepare content redistribution decision:** Some old ProfileScreen content (avatar picker, profile identity) still has no clear home. Not urgent.
- **Islamic scholarly sites & multimedia content** discussed but only "Islamic References" was built. Multimedia links folded into future MediaScreen curation work.
- **User feedback from two friends** — high value input still pending. When it comes, adjust based on what they see.

## What NOT to do

- Do NOT try to solve every remaining item at once. Content authoring for #3 is a real focused workstream.
- Do NOT drift into strategy/philosophy conversations without the user requesting them.
- Do NOT trust project-knowledge file copies. Always ask for fresh uploads.
- Do NOT delete files without proving no dependencies exist (Section 0 discipline from TDD).
- Do NOT use imperative voice in user-facing copy ("take care of X," "study Y") — always informing not instructing.

## Git state

All work through 2026-08-08 is committed and pushed. Clean starting point.
