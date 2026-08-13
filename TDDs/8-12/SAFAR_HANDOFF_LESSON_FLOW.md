# SAFAR — Handoff: Lesson Flow System (Umrah & Hajj Guides)

*This appendix documents the Lesson Flow feature built across this session — the multi-screen guided lesson system for both Umrah and Hajj. It supplements SAFAR_TDD.md and prior handoffs. Read this before continuing work on Hajj Lessons 7–16 or any Umrah lesson edits.*

**Standing project rule, unchanged:** project-knowledge file copies are presumed stale. Before touching, referencing, or editing any file, ask the user to upload it fresh. Never trust a Claude Code summary of what it did — always ask for the actual file back and read it yourself before proceeding to the next step or telling the user to test.

---

## What this feature is

A reusable, data-driven multi-screen lesson pager used by both the Umrah Guide and Hajj Guide. One shared component (`LessonFlowScreen.jsx`) renders any lesson by reading an ordered array of typed "blocks" from that lesson's own content file. Adding a new lesson means writing a new content file — it does **not** mean touching the component, unless the lesson needs a genuinely new block type.

**Status at handoff:**
- **Umrah: 10/10 lessons complete.** Full guide built, tested, polished.
- **Hajj: 6/16 lessons complete** (Lessons 1–6). Lessons 7–16 pending — PDFs to be supplied by the user in batches of 2–4 at a time, same as this session's pattern.

---

## Core architecture

### Files
- `screens/LessonFlowScreen.jsx` — the single reusable pager component. Contains all block-type renderers, the header, the footer, and the swipe/navigation logic.
- `screens/LessonListScreen.jsx` — the lesson index screen. Fully generic/data-driven via a `guide` route param (`"umrah"` or `"hajj"`); reads from the same `LESSONS` map and `GUIDE_META` (which hardcodes `totalLessons: 10` for Umrah, `16` for Hajj). Shows real lessons as tappable rows with progress state, and not-yet-built lesson numbers as greyed "Coming soon" rows. Includes a vertical gold connector line threading down through all lesson numbers to signal sequence.
- `lessonProgressStore.js` — AsyncStorage-backed store, same pattern as `checklistStore.js`. Tracks `{ furthestIndex, total }` per `lessonId`. Written to on every screen change (swipe or tap) from `LessonFlowScreen`. Powers the Lesson List's "X of Y screens" / "Completed" state.
- `content/lessons/lesson_umrah_01.js` through `_10.js`, `lesson_hajj_01.js` through `_06.js` (more to come) — one file per lesson, each exporting a single lesson object.
- `content/lessons/index.js` — imports every lesson file and exports a flat `LESSONS` map keyed by `"umrah-01"`, `"hajj-01"`, etc. **This file must be updated every time a new lesson file is added** — both the import line and the map entry.

### Navigation wiring
- `App.js` registers two screens inside `LearnStack`: `"LessonList"` (component `LessonListScreen`) and `"LessonFlow"` (component `LessonFlowScreen`).
- `UmrahGuideScreen.jsx` and `HajjGuideScreen.jsx` hero cards both navigate to `navigation.navigate("LessonList", { guide: "umrah" | "hajj" })`. Both guide screens' old `GuideCarousel` usage was removed (import, state, render) — that old carousel component (`screens/GuideCarousel.jsx`) is now dead code but was **left on disk untouched**, not deleted (per project discipline — confirmed via grep it's not referenced elsewhere before making this call, but deletion itself was never executed).
- `LessonListScreen` → tapping a real lesson row navigates to `"LessonFlow", { lessonId }`.
- Inside `LessonFlowScreen`, **every back button (cover's, interior header's) always navigates explicitly to `"LessonList", { guide: lesson.guide }`** — deterministic, not `goBack()`. This was a deliberate reversal mid-session: originally the top-left back button stepped back one screen at a time (matching the bottom chevrons' job), but the user's actual usage instinct was that back = exit to the lesson list, consistent with how the rest of the app behaves. The bottom `‹ X of Y ›` chevrons remain the way to step screen-by-screen within a lesson.
- "Next Lesson" button (rendered on the last screen only) uses `navigation.replace("LessonFlow", { lessonId: nextLessonId })`, computed automatically from `lesson.guide + "-" + String(lesson.lessonNumber + 1).padStart(2, "0")`. If the next lesson doesn't exist in `LESSONS`, the button simply doesn't render — only "Return to Lesson Menu" shows. This is why Hajj Lessons 7+ not existing yet is not a bug — Lesson 6's last screen correctly shows only the menu-return button.

---

## Block type schema (11 types, all implemented)

Every block always renders inside the shared header (title, "LESSON N", eyebrow) and footer (`‹ X of Y ›` counter + action button) **except** `cover`, `closing`, and `moment`, which are full-bleed-image types that suppress the standard header/footer chrome (see "Full-bleed image screens" below).

| Type | Purpose | Key fields |
|---|---|---|
| `cover` | First screen of every lesson | `image` (static import, optional — blank parchment fallback if omitted), `lessonBadge`, `title`, `subtitle`, `readingMinutes` |
| `cardList` | Icon + label rows in bordered cards | `title`, `cards: [{id, icon, label}]`, optional `cardGap` override |
| `qaCardList` | Bold question + answer body, same card style as cardList | `title`, `cards: [{id, question, answer}]`, optional `intro`/`closing` strings for framing text outside the card list |
| `narrativeText` | Icon/image + centered paragraphs, supports mixed headings | `title`, `icon` or `image` (currently only `"kaaba"` supported as a special image key), `paragraphs`: array of strings (plain paragraph) or `{heading: "..."}` objects (bold sub-heading; auto-inserts a thin gold divider before any heading after the first) |
| `bulletList` | Two-column numbered tile grid | `title`, `bullets: [string]` — currently only used by Umrah Lesson 1's "What You'll Learn," with a light-to-solid gold opacity progression per tile (10% → 90% across 9 items) |
| `numberedSteps` | Numbered step cards | `title`, `steps: [{heading, body}]` or `{heading, tagline, body, bullets}` for richer steps (tagline is italic gold subtitle; bullets are small sub-points under body) — both shapes coexist, gated by `typeof step !== "string"` |
| `duaList` | Icon + plain bullet list of dua topics + optional CTA | `title`, `duas: [string]`, optional `ctaLabel`/`ctaScreen`/`ctaMode`/`ctaParams` |
| `companionTool` | Sage-green highlighted CTA card | `title`, `description`, `ctaLabel`, `ctaScreen`, `ctaTab` (for cross-tab nav) or `ctaMode: "root"` (for root-stack nav) |
| `insight` | Cream/gold pull-quote callout | `title` (shows in header — always `"Insight"` by convention), `text` |
| `closing` | Full-bleed final screen, no header/footer chrome, white italic quote + small reference list | `image`, `quote`, `references: [string]` |
| `moment` | Full-bleed **mid-lesson** emotional beat, no header/footer chrome, quote only (no refs) | `image`, `quote` — back button steps back one screen (not exit to list), since it's not the first/last screen |

### Navigation modes for CTA-bearing blocks (`duaList`, `companionTool`)
- `ctaMode: "root"` → `navigation.navigate(ctaScreen, ctaParams)` — for screens registered in the Root Stack (`PilgrimageDuas`, `SacredPlaces`).
- Default (no `ctaMode`) → `navigation.getParent().navigate(ctaTab, { screen: ctaScreen, params: ctaParams })` — for cross-tab jumps (e.g. Learn → Plan/Checklists, Learn → Plan/Notes).

**Confirmed real destinations wired so far:** `PilgrimageDuas` (root), `SacredPlaces` (root — hosts Makkah + Madinah sites/stories, confirmed via reading the actual file), `Checklists` (Plan tab), `Notes` (Plan tab).

**Standing rule: only wire Companion Tool / dua CTAs to screens that actually exist and are reachable today.** Never build a placeholder or stub screen to satisfy a lesson's source content. If a lesson's Companion Tool describes a feature that doesn't exist yet (interactive Tawaf counter, Talbiyah audio player, a "My Journey" bundle screen that was retired, a Miqat locator), **omit that screen entirely from the lesson's block array.** This has already happened for: Umrah Lesson 3 (Miqat), Umrah Lesson 6 (interactive Tawaf guide), Umrah Lesson 9 (self-referential "quick reference"), Hajj Lessons 1–4 (all four Companion Tools pointed to non-existent features).

---

## Full-bleed image screens (`cover`, `closing`, `moment`)

These three share one visual family: `ImageBackground` + `CoverScrim` (SVG vertical gradient, lighter top / darker bottom) + white text. Controlled by a single derived flag:

```js
const hasFullBleedImage = activeBlock.type === "cover" || activeBlock.type === "closing" || activeBlock.type === "moment";
```

This flag gates: whether the arch/pattern header renders at all, footer background transparency, and pager-arrow/counter text color (white vs. dark/gold). Any future full-bleed block type must be added to this condition.

- **`cover`**: back+bookmark icons, badge/title/subtitle/reading-time stack at bottom, "Begin Lesson" button.
- **`closing`**: back+bookmark icons, centered italic quote, small reference list below — used only as the literal last screen of a lesson (currently only Umrah Lesson 10).
- **`moment`**: back-only (no bookmark), centered quote, no references — used mid-lesson for a single emotional beat (currently only Hajj Lesson 6, "Seeing the Ka'bah," placed directly after "After This Lesson" and before "Overview," per that lesson's explicit UX instruction in the source PDF). Its back button calls a passed-in `onStepBack` prop (`goTo(current - 1)`), not the list-exit navigation the other two use — because it's a mid-flow screen, not an entry/exit point.

---

## Design conventions locked this session

- **Header treatment** matches `DuaDetailScreen.jsx` exactly: gradient-fade `HeaderPattern` (SVG, PATTERN_PATH import), `ArchFrame` (faint pointed arch outline), gold `StarOrnament`, floating semi-transparent `navCircle` back button. No bookmark/share/practice icons (those were DuaDetailScreen-specific, deliberately dropped).
- **Header shows, top to bottom:** star ornament → lesson-title eyebrow (small gold caps, the *lesson's own* title, not the screen's) → optional `stageLabel` badge (cover only) → the active screen's own title (large serif).
- **Footer is one unified transparent floating overlay**, used on every screen type — text/icon color switches (white vs. dark/gold) based on `hasFullBleedImage`. This was a real bug fix mid-session: originally interior screens had a solid parchment bar with different padding math than the cover's overlay, causing a visible "jump" when swiping cover → screen 2. Now both share identical position/padding logic.
- **Colors:** `BG` `#F5F0E8` (parchment), `DARK_TEXT` `#1C1A14`, `MID_TEXT` `#4A3F30`, `MUTED` `#8A7D6A`, `GOLD` `#BF9F60`. Buttons use `#A28752` (gold blended ~15% toward black) with white text — same color used for both the cover's "Begin Lesson" and every interior "Continue"/"Next Lesson"/"Return to Lesson Menu" button, for visual consistency.
- **Cards** (`card`, `qaCard`, `bulletRow`, `stepCard`): white background, `#E4DAC5` border, consistent drop shadow. **Real bug fixed this session:** cards originally used the exact same background color as the page (`#F5F0E8` = `#F5F0E8`), making them invisible despite the style existing. Now white for real contrast.
- **Icons inside cards/hero circles are gold** (`GOLD`), not dark — deliberately contrasts against the dark serif titles rather than blending toward the same near-black tone.
- **Prophet's name**: always the ﷺ glyph, never "(PBUH)" — confirmed renders correctly on-device. All source PDFs have this garbled as `■■■ ■■■■ ■■■■ ■■■■` from PDF extraction; always replace with ﷺ when transcribing content.
- **Paragraph spacing**: 10px between consecutive plain paragraphs; headings get a divider + extra spacing before them (not after).
- **Image naming convention**: `assets/lesson_images/umrah_lessonN.png` and `hajj_lessonN.png` — lowercase, no separator between "lesson" and the number, `N` not zero-padded in the filename (matches what's already on disk for Umrah 1–10 and Hajj 1–6).
- **Terminology decision**: Hajj source PDFs use "HAJJ STAGE N" throughout — **the user explicitly chose to normalize this to "Lesson"** everywhere in-app, matching Umrah's convention. Every Hajj content file uses `"LESSON N OF 16"` badges and `lessonNumber`/`title` fields exactly like Umrah, despite the source documents saying "Stage."

---

## Known open items / things NOT yet done

1. **Swipe transition glitch (cover → first interior screen) — deliberately deferred, not forgotten.** The interior arch header is conditionally *mounted*, not animated in — so it snaps into existence mid-swipe rather than fading/scaling smoothly. Decision: **wait until more lessons exist** (more real title-length variety) before attempting a proper fix, since fixing it now risks tuning to Lesson 1's specific proportions only. This is a good candidate for its own dedicated session once several more Hajj lessons are built.
2. **`SacredPlacesScreen.jsx` doesn't yet include Hajj-specific locations** — Mina, Arafah, Muzdalifah, Jamarat. Only Makkah and Madinah sites exist there currently. This will become relevant once Hajj lessons reach those stages (likely Lesson 7+) and their Companion Tools want to link there. Worth a dedicated conversation with the user before assuming those locations should just be added to the existing screen — could also warrant a separate structure.
3. **Old `GuideCarousel.jsx` and its Umrah/Hajj step data are dead code**, confirmed via grep to be unreferenced anywhere except the two guide screens (which no longer import it). Left on disk, never deleted — cleanup is a separate, low-priority future task, not blocking anything.
4. **Progress tracking writes on cover view too** (`furthestIndex: 0` the moment someone opens a lesson, even without advancing) — this was a deliberate choice, distinguishing "started" from "never opened" as real states the Lesson List can differentiate.
5. **No per-lesson unique closing/moment images yet** — both Umrale Lesson 10's `closing` and Hajj Lesson 6's `moment` currently reuse that lesson's own cover image rather than a dedicated separate asset. Easy one-line swap later if the user supplies distinct art.

---

## Workflow discipline for continuing this work

- **Never trust "Claude Code says it's done."** Multiple times this session, a described change either hadn't run, had run against the wrong file, or Claude Code echoed back the prompt instead of executing it. Always get the actual file back (upload or paste) and read it directly before telling the user to test on-device.
- **Screen-number claims from the user are usually exactly right** — when the user says "screen 10" or "screen 14," count the lesson's actual block array; it has reliably matched their count every time this session, which means trusting their numbering and verifying against real content is faster than re-deriving it from scratch.
- **Batch lessons 2–4 at a time.** The user uploads PDFs, Claude reads and maps each to the block schema (flagging anything that needs a new block type before building), confirms with the user, then writes all content files + the `index.js` update as one or two prompts. This pacing has worked well.
- **New block types are rare and deliberate** — only introduced when source content genuinely doesn't fit existing types (e.g. `moment` for Hajj Lesson 6's explicit "delayed reveal" UX instruction). Always check whether an existing type can be reasonably reused first.
- **Full-file rewrites vs. targeted find/replace**: targeted edits are preferred once a file's state is well-verified and the edit is small/isolated. Full-file rewrites are reserved for changes touching many interdependent parts of `LessonFlowScreen.jsx` at once (e.g. the footer unification, the closing-block addition).

---

## Immediate next step

Continue Hajj Lessons 7–16, same batch pattern: user uploads 2–4 PDFs at a time, Claude maps to blocks (flagging new-block-type needs and unbuildable Companion Tools before writing anything), user confirms, Claude writes content files + `index.js` update, user verifies and tests via Learn → Hajj Guide → Lesson List → [lesson].
