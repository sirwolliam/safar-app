# SAFAR — Session Handoff (2026-08-02)

Append to / replace the prior handoff. Covers the full 2026-08-02 session.
Read alongside `SAFAR_TDD-8-1.md`, which remains the source of truth for
everything predating this session.

---

## 0. How we work together — read this first

**The loop, every time:**

1. **I describe an idea, problem, or request in plain language.** Often
   half-formed. Sometimes I'm reacting to something that looks wrong in the
   app without knowing why.
2. **You respond as a senior product / UI-UX designer and React Native
   expert** — not as an order-taker. You tell me when something is a bad
   idea, when it conflicts with an established pattern, when I'm solving a
   symptom instead of the real problem, and when my instinct is right. You
   propose the alternative rather than just objecting.
3. **You write a single, complete, paste-able Claude Code prompt.** I paste
   it into Claude Code (a separate terminal tool). It edits the actual
   project files.
4. **I paste the resulting file(s) back to you.** You diff what actually
   landed against what you specified — never assume a change worked because
   a prompt was written for it. This has caught real failures (see §4).
5. **You give me the git commands.** Every time. Spelled out. I am not a
   developer and I need `git add -A` / `git commit -m "..."` / `git push`
   written out, not referenced.

**Critical context about me:** I'm not a coder. Don't assume I know what a
stack navigator is, what `flexWrap` does, or why a font weight needs
registering. Explain the *why* in plain terms when it matters, skip it when
it doesn't, and always give exact commands rather than descriptions of
commands.

**The TDD lives OUTSIDE the project folder.** Confirmed this session. Claude
Code physically cannot read it. So: never write "read SAFAR_TDD.md first"
into a Claude Code prompt — it will fail silently or invent something. If
Claude Code needs project context, fold the relevant lines directly into the
prompt text.

**Design ambition — new standing directive going forward:** Up to now, most
changes have deliberately matched existing patterns for consistency
(NotesScreen's header, ToolsScreen's card treatment, etc.). That was right
for cleanup work. Going forward, for genuinely *new* screens and features, I
want you to push harder — propose layouts that are visually interesting and
distinctive rather than stale, predictable, template-looking UI. The Moods
grid (§3) is the first example of this: a full-page tile grid that
deliberately looks different from every other screen in the app, and it works.
Keep doing that. Note the tension to manage: distinctive ≠ inconsistent. The
goal is a design system with more range and personality, not a pile of
one-off screens. When you propose something bolder, say what makes it
cohere with the rest of the app.

---

## 1. Dua library — completed this session

### Mood categories: 0 → 29 tiles, fully populated

Started the session with 4 of 5 mood tiles showing "Coming soon" (empty
category tags) and 6 of 12 theme tiles likewise. Ended with **29 mood
categories all backed by real, sourced content.**

Built across 6 sourcing passes. Entry count went 85 → 100 (`duas-data.js`).

**Sourcing standard held throughout — do not lower it:**
- Every dua verified against Quran.com or Sunnah.com before being written up.
  Nothing added from memory.
- Original English translations written fresh — never copied from the
  reference app (LifeWithAllah) or any other app's phrasing.
- The reference app's screenshots were used **only as a discovery list**
  ("what topics belong under Anxious?"), then each item independently
  sourced. This distinction matters legally and for citation integrity.
- Anything without a verifiable citation was **left out**, not fudged. This
  happened more than once (e.g. a "protection from their evil" dua found
  only on blogs with no hadith reference — dropped).
- Where no authentic dua exists for a concept, said so plainly rather than
  stretching one to fit (e.g. Bored — no classical "boredom" dua exists;
  tagged `dua-steadfastness` as the honest analog instead of inventing).
- All entries carry `verified: false`. Scholarly review happens before
  release, not now.

**Preferred sources, in order:** Qur'an (via Quran.com) → Sunnah.com
(Bukhari, Muslim, Abu Dawud, Tirmidhi, Ibn Majah) → Hisn al-Muslim numbered
edition (`sunnah.com/hisn:N`, individually citable permalinks).

### The 29 mood categories

anxious, peace, strength, grateful, anew, scared, nervous, overwhelmed,
tired, lazy, bored, sad, depressed, hurt, lonely, unloved, regret, angry,
impatient, jealous, greedy, doubtful, hypocritical, guilty, indecisive,
weak, confused, content, happy

**Suicidal was deliberately removed from scope.** It appeared in the
reference app. Decision: a spiritual-content tile is the wrong container for
something with real safety stakes — it would need scholarly review, crisis
resource integration, and a different entry point than a tile sitting
between "Bored" and "Happy." Cut rather than half-built. Do not
reintroduce it casually.

### Duplicate-prevention rule — now standing instruction for Claude Code

Two separate duplicate incidents occurred this session (§4). Claude Code now
operates under this standing instruction, which should be restated in future
dua prompts:

> Before adding any new dua entry, search the existing `DUAS_DATA` array for
> any entry whose `arabic` field closely or partially matches the new entry's
> arabic text. If a likely match exists, **stop and report the existing id and
> its current categories** rather than inserting. Only add if no reasonable
> match exists.

This works — it correctly blocked a duplicate on the final pass
(`hamdulillah-pleases-you` → already existed as `gratitude-receiving-favour`).

---

## 2. Known content gap — moods are thin, merge planned but NOT executed

**Unresolved and important.** Most mood categories currently hold only 1–3
duas. This looks unfinished in the UI. Stated target is **5 minimum per
category.**

Merging into ~7–8 emotional families was agreed as the right direction (26
individual tiles was always going to feel fragmented), but **the merge has
not been built.** Proposed groupings, with current unique dua counts:

| Merged family | Pools | Duas now |
|---|---|---|
| Anxious | anxious, nervous, scared, overwhelmed | 4 |
| Grief | sad, depressed, hurt, lonely, unloved, regret | 6 |
| Frustration | angry, impatient, jealous, greedy | 4 |
| Faith & Doubt | doubtful, hypocritical, guilty, indecisive, confused | 4 |
| Low Energy | tired, lazy, bored, weak | 4 |
| Contentment | content, happy + existing gratitude | 11+ |
| Peace / Strength / Grateful / Starting Anew | standalone | 3 / 2 / 11+ / 2 |

Even merged, several families sit at 4 — under target. Getting to a real 5
everywhere needs one more honest sourcing pass, not reshuffling.

**Also agreed but not built:** if we drop to 7–8 family tiles, the Moods grid
should go from **3 columns to 2** (bigger tiles suit fewer, broader
categories).

---

## 3. Screens built / changed this session

### NEW: `MoodsScreen.jsx`
Full-page 3-column wrapping grid of all 29 mood tiles. Deliberately distinct
from every other screen's hero-header-plus-list pattern — this is the design
direction we want more of. Reuses `HeaderPatternBg` ornate header. Tiles
reuse the exact original mood-tile treatment (image + dark gradient overlay +
white Phosphor icon + bold white label). Each tile → `DuaList` with its
category key. Registered in `DuasStack` in `App.js`.

Tile sizing was later changed from fixed 100px to a computed width so 3
columns fill the screen evenly (fixed width left an uneven right margin).

### `MyDuasScreen.jsx`
The horizontal "Duas by Mood" row (5 tiles) was **replaced with a single
entry card** navigating to the new Moods screen. Restyled to match this
file's existing list-row treatment (`#FDF7EE` bg, 16 radius, `#EDE4D4`
border, standard shadow) with a 72×72 empty placeholder box on the left for
an image to be added later. Old `MOODS` array and its styles removed.

### `DuaListScreen.jsx` — substantial redesign
- Sage `#4A5C48` ornate header with `HeaderPatternBg`, matching NotesScreen
- **Root changed from `SafeAreaView` to plain `View` + `useSafeAreaInsets`** —
  this was the fix for "header doesn't reach the top." SafeAreaView pads
  everything below the status bar; the plain-View + manual-insets pattern
  lets the header bleed behind it. This is the established pattern
  (NotesScreen, ToolsScreen, HubContainerScreen all do it).
- Migrated entire StyleSheet off `theme.js` tokens to literal hex (per the
  standing token-architecture rule)
- Background `#EDE6D8` to match Tools/Hub
- Stage headers (Ihram, Tawaf…) → `SourceSerif4-Bold`, fontSize 20 → 24
- Stage context text → fontSize 13 → 15, color → `#5C534A` (was too faint)
- Dua card titles → `SourceSerif4-SemiBold`
- KEY badge moved from inline-next-to-title to absolute top-right of card
- **"I'm here now" button removed entirely** — it was broken (navigated to
  `Map`, which lives in `JourneyStack`, from a screen in `DuasStack`; sibling
  stacks can't reach each other with a plain `navigate()`). Feature was
  unwanted and unremembered, so deleted rather than fixed.
- Sources footer shortened (see below)

### Fonts — `App.js`
Only `SourceSerif4-Regular` was ever loaded, which is why `fontWeight: "600"`
did nothing on custom-font text. **Bold, SemiBold, and Medium weights were
added to `assets/fonts/` and registered in `useFonts()`.** Real weight range
now available app-wide.

### Sources footer (final wording)
> Sources — Duas are drawn from the Qur'an and the major hadith collections
> (Sahih al-Bukhari, Sahih Muslim, Sunan Abi Dawud, Jami' at-Tirmidhi, Sunan
> Ibn Majah) via Sunnah.com and Hisn al-Muslim. Wording may differ slightly
> across the four madhhabs.

Deliberately short. No "not yet scholar-reviewed" disclaimer — review happens
before release, no need to surface it in-app now.

---

## 4. Failures caught this session — the verify-don't-trust rule earning its keep

Three separate times, the "paste the file back and diff it" step caught
something a summary alone would have missed:

1. **Duplicate dua entries (4 of them).** Pass 1 added six new duas; four had
   Arabic text identical to duas already in the library under different ids.
   Claude Code flagged the collision honestly but defaulted to "add as new"
   — wrong default, and it was **my prompt's fault** for not instructing a
   pre-check. Fixed by deleting the 4 dupes and merging their mood tags onto
   the originals. Led directly to the standing instruction in §1.
2. **`sayyid-al-istighfar` added twice.** Same root cause, later pass — it
   already existed (tagged `forgive`/`daily`, `is_featured: true`) from
   before these sessions. Merged, duplicate deleted.
3. **An entire pass silently didn't run.** Files pasted back were byte-identical
   to the previous pass's output. Entry count was the giveaway (88, expected
   90). Turned out the prompt hadn't been submitted. **Always check the entry
   count, not just spot-check a few fields.**

---

## 5. Other work started this session

### Media library sourcing
- Current `MediaScreen.jsx` content is **placeholder** — several `url` fields
  are YouTube *search-result* links, not real videos. Needs replacing, not
  extending.
- Topic taxonomy agreed to expand from 4 (Umrah/Hajj/Spiritual/Practical) to
  **8**: Umrah, Hajj, Planning & Logistics, Documents & Paperwork, Packing &
  Shopping, Spiritual Prep, During Your Trip, Reflection & After. **Code
  change not yet made** — waiting on content.
- Target: 6–8 real items per topic.
- **Deliverable created:** `Safar_Media_Library_Tracker.xlsx` — 3 tabs
  (Instructions / Media Tracker / Progress), dropdowns for Topic/Type/Status,
  auto-counting progress formulas. Built for a teen assistant working ~1hr/day.
- Also queued: Media row subtitle is inconsistent between hubs — PracticeHub
  says "Videos and podcasts for your preparation", PlanHub says "Videos,
  articles and podcasts". Both should read **"Videos, articles and podcasts"**.

### Product decision: articles stay in Media, not Learn
The meaningful line isn't video-vs-article, it's **first-party vs.
third-party**. Learn hub = Safar's own authored content, never leaves the
app. Media = curated pointers out to other people's content, all
`Linking.openURL`. Moving articles to Learn would blur that and hurt topic
browsing (you'd have to check two places to cover one topic). Type filter
already lets reading-only users filter to Articles inside Media.

---

## 6. Open items — next session

**Immediate / queued but unbuilt:**
- Mood family merge (§2) + 3-col → 2-col grid change
- One more sourcing pass to get thin families to 5+ duas
- Media hub subtitle consistency fix (one-line change × 2 files)
- Media `TOPICS` array expansion to 8, once content exists
- Verify all 29 mood tile images load correctly at runtime — `require()`
  failures only surface on build, not from reading code

**Checklists feature — user requested, spec not started.**
Wants: add rows to checklist categories, edit rows, save/pin a checklist to
the Board from the checklist screen, and load/add a saved checklist from the
Board. **File to be uploaded next session before any spec is written.**
Flag in advance: if checklist data is currently static/hardcoded, "edit a
row" means introducing real local persistence — a storage-layer job, not a
UI tweak. Two-part effort, not a quick pass.

**Information architecture — the big open question.**
Raised at end of session, not resolved. Notes, Checklists, Journey, Calendar,
Bookmarks, and Board are six organizational surfaces and the boundaries
aren't legible to a user. Specifically:
- **Bookmarks and Board are two answers to the same question** ("where does
  saved stuff go?"). A user hitting a star can't predict which bin it lands
  in. This is the sharpest problem.
- **Calendar and Journey** overlap on "what's happening when," though these
  may genuinely be different jobs (Journey = narrative "where am I in this
  pilgrimage"; Calendar = "what's on Tuesday") — defensible if Journey
  visibly reads *from* Calendar rather than running parallel.
- Notes and Checklists as *creation* tools are fine separate; both should be
  able to land on the Board.
- Likely direction: **two destinations instead of four.** Collapse Bookmarks
  into Board. Keep Calendar as the time layer, Journey as the narrative view
  over it.
- Worth its own session, reading all six screens first before proposing IA.

**Carried from prior sessions, still unresolved:**
- `ProgressScreen.jsx` — confirmed dead code, not deleted
- `MyJourneyScreen.jsx` — dead, not deleted
- `backups/` folder — never investigated, contains at least one stale duplicate
- `JourneyScreen.jsx` — needs its own cleanup session (old token
  architecture, duplicate modals, unconfirmed ritual-progress data)
- `NotificationsScreen.jsx` — pulled from Connect hub UI, file + stack
  registration never cleaned up
- `headerPattern.js` — stray duplicate of `headerPatternPath.js` (different
  viewBox, different export name, not imported anywhere). Untouched. Worth a
  "what is this" check someday.
- `duaLibrary.js` — orphaned, never imported. Was used as a content source in
  a prior session. Check nothing depends on it before deleting.
- Theme tile restructure: 6 theme tiles still point at empty tags (prayer,
  dhikr, tawakkul, health, anxiety, travel); Daily (16), Sleep (13),
  Protection (12), Provision (8) have real content but **no tile anywhere**
- Both "View all" links on MyDuasScreen navigate to non-existent categories
  (`all`, `mood`) — dead ends
- Crop/zoom for Moments — parked, waiting on dev build
- ShopScreen redesign — next major feature, informed by TDD §14 affiliate plan
- Quiz header images: pre-cropped/pre-sized as final assets after a long
  runtime-math debugging saga. **Follow that approach for any new hero image
  work** — don't rely on calculated aspect ratios.

---

## 7. Standing technical rules confirmed this session

- **No theme tokens in StyleSheets.** Literal hex values only. Migrate files
  off `theme.js` imports opportunistically when touching them.
- **Screen root = plain `View` + `useSafeAreaInsets`**, never `SafeAreaView`,
  when the header should bleed behind the status bar.
- **Established backgrounds:** `#EDE6D8` (Tools/Hub/list pages), `#F5F0E8`
  (Notes), `#FDFAF4` / `#FDF7EE` (cards), `#4A5C48` (sage headers).
- **Standard card treatment:** radius 16, border `#EDE4D4`, shadow
  `#2A1F0E` / offset {0,2} / opacity 0.08 / radius 8 / elevation 3.
- **Cross-stack navigation** needs the nested form:
  `navigation.navigate("Journey", { screen: "Map", params: {...} })`.
  A plain `navigate("Map")` from a sibling stack fails.
- **Custom fonts need every weight explicitly registered** in `useFonts()`.
  `fontWeight` alone does nothing on a custom family.
- Mood tile images live in `assets/mood/` (singular), named `mood-{key}.png`.
