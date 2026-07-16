# Safar — Technical Design Document
*Hajj & Umrah pilgrimage companion app. React Native (Expo).*
*Last consolidated: 2026-07-11 — merged from SAFAR_TDD.md (Jun 20), SAFAR_TDD_MASTER.md (Jun, Sessions 1–7), and SAFAR_HANDOFF.md (Jul 11).*

**This is now the single canonical document.** `SAFAR_TDD_MASTER.md` and `SAFAR_HANDOFF.md` are retired — do not create or maintain them separately again. If a new insight emerges in a session, add it to *this* file before the session ends, not a new one.

---

## 0. Workflow context (read first)

- **The user is not a coder — a novice.** Explain steps in plain language when the process itself (not just the design decision) is unfamiliar. Don't assume comfort with terminal, git, or React Native tooling.
- **This chat (Claude in claude.ai) does UX/UI/product strategy and writes Claude Code prompts.** It has `project_knowledge_search` access to files already added to this project (screens, theme, etc.) — check those first before asking the user to re-upload. However, project knowledge can lag behind the real local project (files only update here when re-added), so for anything load-bearing — before writing a Claude Code prompt, or when a discrepancy is suspected — confirm with the user whether the project copy is current, and ask for a fresh upload if there's any doubt.
- **Claude Code (separate tool, run locally) applies the actual code changes.** The user pushes to GitHub themselves.
- **Always ask for the latest version of a file before analyzing or changing it** — even if a change was discussed or believed finished in a prior session. Never assume a previously discussed change actually landed in the file. Delivered content is not automatically merged back into the real project.
- Repo: `github.com/sirwolliam/safar-app`, branch `main`. Simple flow — no branches/PRs mentioned; confirm with user if this ever matters for a prompt.
- Project root confirmed: `/Users/sirwolliam/HajjUmrah2/` (folder name differs from repo name `safar-app` — that's expected/fine, not a mismatch).
- **Claude Code prompt format:** deliver every prompt directly in the chat reply, inside a single fenced code block, as ONE continuous plain-text block with no numbered lists, headers, or explanations breaking it up inside that block — written as flowing instructional prose the user copies in one action via the code block's copy button. **When a single piece of work touches multiple files, combine all of it into that same one code block** (clearly stating which file each part applies to inline, e.g. "In App.js, ... Then, in screens/X.jsx, ...") rather than giving separate prompts per file — the user finds multiple prompts harder to track and more error-prone to paste in the right order. Only split into genuinely separate prompts when the changes are unrelated concerns (per the existing "one session, one concern" rule), not simply because they touch different files. Do NOT create a downloadable file for prompts (no create_file/present_files) — the user wants to copy directly from the chat, not download anything. Do NOT include the `npx expo start --clear` command or git commands inside that code block — give those separately in the chat reply, after the prompt block, as steps the user runs themselves in terminal once Claude Code has finished.
- **TDD update file delivery:** keep editing the working copy of this TDD internally whenever something worth recording comes up (decisions, fixes, new components, open questions) — but do NOT create/present a downloadable file after every edit. Only generate and present the updated TDD file when the user explicitly asks for it (e.g. "give me the updated TDD," "show me the file"). This avoids interrupting the conversation with a file prompt after every small change.

### Your role and rules of engagement

You are a **senior UX, product design, and React Native expert** working on Safar, and also a **Muslim pilgrim preparing for Umrah or Hajj** — bring that perspective when relevant.

**Push back when something is wrong.** Do not simply agree with suggestions. If a decision conflicts with the brand, established UX patterns, good product sense, or a decision already made in this doc, say so and explain why. The goal is the strongest outcome, not validation.

**Never write code or a Claude Code prompt until you have:**
1. Read the relevant file(s) in full — ask the user to upload the latest version first
2. Confirmed the specific feature/style you're about to change actually exists where you think it does
3. Described the plan in plain language and received confirmation
4. Checked it doesn't conflict with existing decisions in this document

**One session, one concern.** Don't combine unrelated changes into one Claude Code prompt unless genuinely interdependent.

**Revert safety:** Before any significant structural/visual change, give the user the git "save before" command (see Section 11). Always end a response that included applied changes with a git commit prompt.

**Never write Claude Code prompts that say "report back" or "confirm first"** — Claude Code is not interactive; the prompt must be complete and correct before pasting.

---

## 1. What Safar is

Safar (سفر — Arabic for "journey") is a companion app for Muslims preparing for and performing Hajj or Umrah. It is a **preparation tool first, reference companion second** — helping pilgrims know what to expect, what to learn, and what to do for a fulfilling Umrah or Hajj.

It's part of a broader ecosystem: **the app** (primary product), **video content** (YouTube/social), **digital planners** (downloadable/printable), and **a website** — brand tone, color system, and visual language must stay consistent across all of them.

### Product north star
"Consolidation, not crisis management." Every feature earns its place by answering: **does this stop the pilgrim from leaving Safar to do this elsewhere?**

### The pilgrim's three states (drives feature priority)
1. **Pre-trip** — planning, learning, memorizing, building lists
2. **In-the-moment** (performing rites) — fast access, offline, large text, no friction
3. **Post-trip** — reflection, journaling, sharing

### Audience
All ages, teens to 50s — not skewed older. Warm, calm, reverent tone; no stylistic lever pushed to an extreme. (Note: an earlier draft of this doc described the audience as skewing older/less tech-comfortable — superseded by the "all ages" framing above. Keep legibility and low cognitive load regardless; they're good defaults for any audience under pilgrimage-prep stress.)

---

## 2. Brand identity — CURRENT (decided by 2026-07-06)

### Color palette (literal hex values only — never theme tokens in StyleSheet)

| Role | Hex | Notes |
|------|-----|-------|
| Page background | `#F5F0E8` | Warm parchment |
| Card background | `#FDFAF4` | Near-white |
| Dark base | `#1A1410` | Primary text |
| Gold accent | `#C8A96A` | Icons, active states, ornaments |
| Sage green (actions) | `#4A5C48` | Buttons, active pills |
| Border | `#DDD5C0` | Subtle |
| Divider | `#EDE4D4` | Between rows |
| Text primary | `#1A1410` | |
| Text secondary | `#8A7D6A` | Subtext, labels |
| Text muted | `#5C534A` | Captions, hints |

### Pillar identity colors

| Pillar | Color | Feel |
|--------|-------|------|
| Plan | `#2E4560` | Navy |
| Learn | `#2D4F32` | Forest green |
| Practice | `#4E3414` | Warm amber |
| Connect | `#3D2240` | Plum |
| Tools | `#3A2F1E` | Warm brown |
| Prepare | `#3A3545` | Warm slate |

> ⚠️ **Superseded palettes** — do not use. Earlier sessions used `background #EDE6D8`/`primary #2F5D50` (TDD Jun 20), and a related-but-different variant with `Home background #E8DDD0`, `Primary green #4A5C48/#2A3828`, dark Focus-screen tokens (`#0A1A10` etc.), and four-pillar-only dark card backgrounds (TDD_MASTER). If any surviving screen still uses these values, that screen needs a pass to bring it onto the current palette above — flag it, don't assume it's already been migrated.

### Typography (decided 2026-07-06 — do not reverse without strong reason)

- **`SourceSerif4-Regular` (SERIF constant):** page titles ONLY and sacred Arabic content
- **Everything else:** system sans-serif — omit `fontFamily` entirely
- **Rationale:** full serif throughout felt dated and heavy; sans-serif for navigation/utility content is lighter and more modern; the contrast creates hierarchy.

### Visual language rules
- Warm, real photography over AI illustration or stock imagery
- Cards: `#FDFAF4` fill, `#DDD5C0` border, subtle warm shadow, consistent radius
- Rounded corners, never sharp
- Gold (`#C8A96A`) for icons in dark contexts (hub headers, dark cards)
- No emoji anywhere in the UI — Phosphor icons only
- No `&&` in style arrays — use ternaries (`style={cond ? [a,b] : a}`)
- Literal hex values in `StyleSheet.create` — never `colors.primary` or `spacing()` tokens

---

## 3. Tech stack & hard coding rules

### Stack
- **Framework:** React Native via Expo (SDK 54 per last confirmed build)
- **Navigation:** `@react-navigation` — bottom tabs + native stacks
- **Storage:** `@react-native-async-storage/async-storage`
- **Icons:** `phosphor-react-native` — ALWAYS verify an icon name exists before use (e.g. `Kaaba` and `Dove` do NOT exist; use `Mosque`, `HandHeart`, `StarAndCrescent`)
- **SVG:** `react-native-svg`
- **Other confirmed active:** `expo-haptics`, `react-native-safe-area-context`, `expo-linear-gradient`, `expo-blur`
- **Font:** `SourceSerif4-Regular` (`SERIF` constant), loaded via `useFonts`
- **Anthropic Claude API** — via fetch, active but ⚠️ needs a backend proxy before submission (API key currently in client bundle — security blocker)
- **Currency Exchange API** — active, ⚠️ key was stored in TDD_MASTER in plaintext (`f426059070cfc830eb7109a1`) — treat as compromised/rotate before submission, don't re-paste it into future docs
- **NOT installed** (importing any of these causes an immediate crash — use graceful fallbacks): `expo-av` (audio is UI-mock only), `expo-image-picker`, `expo-document-picker`, `expo-notifications`
- **No `react-native-reanimated`** — use built-in `Animated` API only
- **No new packages without explicit approval**

### Hard rules — never break these (with the "why," since these were hard-won)

1. **`StyleSheet.create` at module level, literal hex values only.** Never reference `colors.`, `spacing()`, `radius.`, `typography.`, `shadows.` tokens inside StyleSheet — this was the root cause of 6+ crashes in earlier sessions (token resolves before it's available at module parse time).
2. **No `&&` in style arrays.** `style={[s.base, condition && s.extra]}` crashes StyleSheet in Expo Go when `condition` is false. Always `style={condition ? [s.base, s.extra] : s.base}`. Same caution for `&&` rendering JSX children when the left side could be `0` or `""` (renders the literal `0`/empty string).
3. **No unavailable packages** — see NOT installed list above.
4. **No literal newlines in JS strings** — use `\n` escapes, never template literals with real line breaks in JSX.
5. **Unicode escapes only inside JSX expressions**, never as bare text: `<Text>{"Du\u02bfā"}</Text>` — correct. `<Text>Du\u02bfā</Text>` — renders literally, wrong.
6. **Never combine `transparent={false}` + `statusBarTranslucent` on Modal** — freezes the Expo Go JS bridge.
7. **After any file replacement:** `npx expo start --clear` (Metro caches aggressively).
8. **Phosphor icons only, verified to exist.** No emoji anywhere.
9. **File location conventions:**
   - Screens live in `screens/`
   - Root files (`theme.js`, `dua-content.js`, `AccessibilityContext.js`, `affiliateLinks.js`) imported with `../` from screens
   - `dua-content.js` is hyphenated — always `import { ... } from "../dua-content"`
   - `GuideCarousel.jsx` lives in `screens/`, NOT `components/`
   - `AskModal.jsx` lives in `components/`
10. **Design-first workflow:** before writing code for a new screen, redesign, or significant UI change — propose the design in plain language (zones, hierarchy, what's removed/added), get explicit sign-off, then build. Exempt: quick bug fixes, copy changes, single-line style tweaks.
11. **Read before writing:** before writing any code, read (a) the file being modified, (b) anything it imports from or navigates to, (c) the theme/token file if styles are involved, (d) related screens sharing navigation targets. No exceptions, even for small changes.
12. **No quick fixes** that solve the symptom but create future problems.
13. **No silent assumptions** — if a file or component isn't confirmed to exist, check first.
14. **Never fabricate Islamic content.** Arabic text, translations, hadith citations must come from real, verified sources.

---

## 4. Navigation & architecture — CURRENT

### 5 bottom tabs
**Home · Journey · Duas (center) · Tools · Prepare** — custom `SafarTabBar`.

> ⚠️ **Superseded:** earlier versions of this doc listed `Home · Journey · Focus · Duas · Prepare` with a centered Focus tab. **Focus tab is retired** — pilgrims don't use apps mid-Tawaf; counters moved to Tools. Verify no lingering nav references to a Focus tab remain.

### App boot / onboarding gate
Reads AsyncStorage flag `safar_onboarded_v1`; unset → `Onboarding` (OnboardingFlow), else → `MainTabs`. OnboardingFlow writes the flag and calls `navigation.replace("MainTabs")` on completion. **No forced signup** — onboarding-only by design, deferred until a real auth backend exists. "Restart Setup" lives in Settings. To reset manually: `AsyncStorage.removeItem("safar_onboarded_v1")`.

⚠️ TDD_MASTER noted this was hardcoded to always show `"Onboarding"` for dev testing — confirm current state before assuming the flag-read logic is live.

### Stacks and screens (as of last verification, TDD Jun 20 — reconfirm before relying on this for anything load-bearing, since it predates the Focus-tab retirement and HubContainerScreen consolidation)
- **HomeStack:** HomeMain, Hub, UmrahGuide, HajjGuide, WhatToExpect, Groups, Guides (GuidesHubScreen), Tools, PrayerTimes, Qibla, Shop, Media, Notes, Settings, CurrencyConverter
- **JourneyStack:** JourneyMain, Map, SiteDuas*, WhatToExpect, Groups, GroupDetail, Connections, MyBoard, MyContacts
- **DuasStack:** MyDuas, DuaList
- **PrepareStack:** PrepareMain (ProfileScreen), Bookmarks, Notes, CurrencyConverter, Support, Settings
- **Root Stack (full-screen, no tab bar):** Onboarding, MainTabs, DuaDetail, StepGuide (ProgressScreen), PracticeLearn, PrintOffline, PilgrimageDuas, SafarAssist, SacredPlaces

\*SiteDuas was a thin inline placeholder defined inside App.js as of last check, not the full SacredPlacesScreen — confirm current state.

Old **FocusStack** (FocusMain, Tawaf, Saiy, Dhikr) — needs reconfirming now that the Focus tab is retired; Tawaf/Saiy/Dhikr presumably moved under Tools, but verify against the actual current App.js before assuming.

### HubContainerScreen (current — replaces old per-pillar hub screens)
Single screen replaces four individual hub screens to eliminate image flicker on pill switches. This supersedes TDD_MASTER's "LearnHub / PractiseHub / PlanHub / ConnectHub — not yet built" — they were built, then consolidated into one container rather than shipped as four separate files. Don't propose rebuilding four separate hub screens.

### Retired (files kept, intentionally unwired — do not re-wire without reason)
- `GuidesScreen.jsx` — 945-line pre-Hub monolith, superseded by Four Pillars + Hub pattern
- `MyJourneyScreen.jsx` — personal dashboard, superseded by Plan hub
- `BoardScreen.jsx` — old twin of MyBoardScreen (MyBoard is current)
- `OnboardingCarousel.jsx` — superseded by `OnboardingFlow.jsx` (6-screen sequence)
- `GroupDetailScreen.jsx` — retired 2026-07-12. Older, separate implementation of group members + milestone feed (plain `firebase` imports, no invite code, no swipe-delete, no group color/edit, no Share). Fully superseded by functionality now built directly into `GroupsScreen.jsx` (which has invite codes via `generateInviteCode`/`joinGroupByCode`, swipe-to-delete milestones, group edit/color, and a working `Share.share()` invite flow). Confirmed via direct grep of `GroupsScreen.jsx` that nothing navigates to `"GroupDetail"` before unwiring — removed from `App.js`'s `JourneyStack` registration and its import, file itself left in the project per the standard retirement pattern used for the other files in this list.
- `HubScreen.jsx`, `PlanHubScreen.jsx`, `LearnHubScreen.jsx`, `PracticeHubScreen.jsx`, `ConnectHubScreen.jsx` — retired 2026-07-12. **Why this happened, in plain terms, worth remembering:** at some point the project moved from "one separate hub screen file per pillar" to "one shared `HubContainerScreen.jsx` file that renders all four pillars via a config object" — the TDD already documented this decision ("HubContainerScreen replaces four individual hub screens to eliminate image flicker on pill switches") but the four old separate files, plus an even earlier generic `HubScreen.jsx` attempt, were never actually removed from the project or unwired from `App.js`. All five looked completely legitimate and fully built, which caused real wasted work this session: a Calendar entry-point prompt was correctly applied to `PlanHubScreen.jsx` three times with zero visible effect before the mistake was found, and a later styling request for "all four hub screens" was about to be applied to the same wrong set of files a second time before this was caught and fully confirmed. **Confirmed beyond doubt via direct grep of `HomeScreen.jsx`:** every Four Pillars card navigates to `navigation.navigate("HubContainer", { pillar: "plan" | "learn" | "practice" | "connect" })` — there is no code path anywhere that opens `"Hub"`, `"PlanHub"`, `"LearnHub"`, `"PracticeHub"`, or `"ConnectHub"` directly. **Any future request involving "the Learn/Practice/Plan/Connect hub screens" or "the four pillar screens" means `HubContainerScreen.jsx` and its `PILLAR_CONFIG` object exclusively — never these five retired files, even though their names sound exactly right for the request.**

### Parked components (`parked-components.jsx`)
`FocusModeCard` and `SacredPlacesCard` — removed from Home to cut clutter, preserved for reuse. Not imported anywhere yet.

### Navigation helper — tab vs. stack
```js
// Navigate to a tab from a stack screen:
navigation?.getParent?.()?.navigate?.("TabName");
// Navigate to a stack screen:
navigation?.navigate?.("ScreenName");
```

---

## 5. Home screen (current design)

Vertical order: **hero slideshow → welcome card → Four Pillars → My Journey card → My Shortcuts → Du'ā of the Day.**

- **Hero:** full-bleed image (no beige top bar); `useSafeAreaInsets()` offsets salam/name/badge below the notch; light-content StatusBar.
- **Four Pillars:** cards, NOT pills (pills imply filtering; pillars are navigation). Each opens `Hub` with `{ hub: "learn"|"practise"|"plan"|"connect" }`. Route param key stays `"practise"` internally; visible label is "Practice."
- **My Journey card:** countdown + quick-links row (Board, Checklist, Contacts, Groups). Arrow → Plan hub. Kept deliberately despite Plan-pillar overlap — different intent (shortcut vs. destination). Journey quick-links must stay consistent with Plan/Connect hubs, never drift.
- **My Shortcuts:** 2×4 grid, light-gold tiles (`#F3E9D2` bg, gold border, `#9A7A3A` icons, `#6A5A38` labels). 8 items: Groups, Guides, Shop, Prayer Times, Media, Tools, Notes, Settings.
- **Du'ā of the Day:** styled to match DuaDetailScreen — geometric SVG pattern header (`PATTERN_PATH` from `./headerPatternPath`), large centered serif Arabic, italic transliteration, serif translation. Source caption collapsed to a small "Du'ā sources" line + Info icon → modal with full scholarly text.

⚠️ HomeScreen key state (from TDD_MASTER, unconfirmed current): `heroSlide`, `heroRef`, `heroTimer`, `userName` (from `safar_user_name_v1`), `daysAway` (from `safar_departure_date_v1`), `planStarted`, `introDismissed`, `lastDua` (from `SAFAR_LAST_DUA`). Verify against the real file — this predates the current Home vertical order above.

---

## 6. Content: Du'ās

- Normalized schema for DB/CMS import: `id, title, arabic, transliteration, translation, source_collection/reference/full, authenticity (sahih/hasan/quran), stage, stage_order, categories[], keywords[], is_featured, audio_traditional/gentle, verified/verified_by/verified_date`
- `dua-content.js` (project root, **hyphenated filename** — always `import from "../dua-content"`) is the adapter mapping normalized fields to screen field names; builds content by category tag. Has a `SHOW_UNVERIFIED` dev toggle.
- ~20+ entries sourced (pilgrimage du'ās + sleep/protection adhkar) from Hisn al-Muslim / authenticated hadith via Sunnah.com. **All `verified:false` pending scholar review.** Categories still needing harvest: guidance, patience, family, daily, morning/evening adhkar, repentance, travel, Madinah, Arafah, forgiveness.
- ⚠️ TDD_MASTER described an earlier, larger content set (53 duas across named stages: Ihram, Entry, Tawaf, Zamzam, Sa'y, Arafah, Muzdalifah, Jamarat, Farewell, Madinah, General) with a different object shape (`isFeatured`, `source` as single string). This may be stale relative to the normalized schema above, or the normalized schema may be a planned migration not yet complete — **do not assume either is current without checking the real `dua-content.js`.**
- **Never fabricate** Arabic/translation/citations. Primary sources: Hisnul Muslim, Qur'anic du'ās, authenticated hadith via Sunnah.com. Scholar review is mandatory before App Store submission.

---

## 7. Design principles (agreed)

- **Pillars = cards, not pills.** Pills are for filterable content (Du'ā library, Media type filters).
- **Hub template structure:** colored hero header + sub-nav pills + hero card (Plan only) + uniform list rows.
- **Hub link cards:** uniform MEDIUM rich cards (~90–110px, photo + title + one-line desc) — "premium but not huge." Consistency reads as premium; 1–2 may run larger as primary with the rest compact.
- **Settings/utility rows are intentionally a different, thinner pattern than Hub rows — do not unify them.** Decided 2026-07-12. Hub rows (`ConnectHubScreen` etc.) use a 52×52 colored icon box + serif label + subtext inside a rounded shadow card — appropriate because each row is a primary navigational destination. Settings/Support rows (`SettingRow` in SettingsScreen.jsx) are flat list rows — label + optional subtext + a `Switch` or `›` chevron, no icon box, no card, thin border between rows — appropriate because these are low-stakes config/utility links meant for fast scanning, not deliberate navigational decisions. Matching them to the Hub format would misrepresent what these rows do and slow down a screen that should be quick to skim. If a new config/utility screen is built, follow `SettingRow`'s pattern, not the Hub card pattern.

- **A third visual tier: Settings + Support share a dark "important-admin-page" header, distinct from both Hub screens and ordinary light utility screens.** Decided 2026-07-12. Rationale from the user: every screen reached from Prepare was starting to look the same (same beige/parchment header, blending into the scroll), and Settings + Support specifically deserve to read as visually important — a pilgrim needs to recognize them as "the serious admin pages" at a glance, distinct from lighter content screens. This is a deliberate three-tier system, not scope creep on the Hub pattern:
  - **Tier 1 — Hub/pillar screens** (`HubContainerScreen`, `ConnectHubScreen`, etc.): dark header in the *pillar's own identity color* (navy/forest/amber/plum/brown/slate per Section 2) — signals "primary navigation destination."
  - **Tier 2 — Settings + Support**: dark header in `#3A3545` (the **Prepare** pillar color specifically, since both screens are reached from Prepare) — signals "important admin/utility pair," visually grouped with each other, distinct from Tier 1 and Tier 3.
  - **Tier 3 — everything else** (Notes, Bookmarks, CurrencyConverter, etc.): light header matching the page background — ordinary content/utility screens, no special visual weight.
  - Settings and Support are intentionally the *same* tier as each other (not one more prominent than the other) — user confirmed this explicitly, having considered and rejected giving Support extra weight for being the more urgent/time-pressured of the two.
  - Implementation specifics: header background `#3A3545`, back arrow + title text `#FDFAF4`, title `fontFamily: "SourceSerif4-Regular"`, `fontSize: 22` (both screens now match — Support was previously sans-serif `18`, now corrected to match Settings' existing serif `22`), no header bottom border (dark header doesn't need one). **Support's back arrow sits inside a light circular chip button (`iconBtn`, `#FDFAF4` background) — the arrow itself must stay dark (`#1A1712`) for contrast against that chip, not light, even though the header behind the chip is dark.** Settings' back arrow has no chip — it's bare text directly on the dark header, so it correctly uses light (`#FDFAF4`). Fixed 2026-07-12 after the arrow was initially set to light on Support, making it invisible against its own light chip. Don't assume both screens' back buttons share one color rule — check whether a chip wraps the arrow before choosing dark vs. light.
  - **Do not extend Tier 2 treatment to other screens without deliberate reconsideration** — if a future session is asked to make another Prepare-adjacent screen "look more important," check whether it truly belongs conceptually with Settings/Support (admin/config) or is actually content (which belongs in Tier 3, or possibly Tier 1 if it's a real pillar destination).
- **Card cohesion principle:** shared "grammar" (radius/shadow/border/spacing/type) + deliberate 1–2 variable deviations for hierarchy. Not all identical (blends together), not all different (looks random).
- **Card grammar:** `#FDFAF4` fill, `#DDD5C0` border, subtle warm shadow, consistent radius (matches DuaCard / HubScreen).
- Low cognitive load, high contrast, legible text.
- Don't over-design — live with changes on device before iterating further.
- **Gold icons on dark surfaces** — `#C8A96A`, Phosphor `weight="regular"` typically.
- **About Safar lives in Settings** — not a separate link in Prepare.
- **MediaScreen dark theme** (`#000000`) — intentional departure from parchment theme; deliberate for a media-consumption context.

### Product decisions
- **Duas in the center tab** — the heartbeat of the app, most important feature
- **Focus tab retired** — counters moved to Tools
- **HubContainerScreen single-screen** — eliminates image flicker on pill switches
- **Carousel reduced to 3 slides** — users never see 4–5 before navigating away
- **Shortcuts reduced to 4** — Qibla, Prayer Times, Dhikr, Notes. No customization in v1
- **"Practice" spelling** — American English app-wide (not British "Practise") — note some internal route params still use `"practise"`, that's fine, it's the visible label that matters
- **Onboarding-only, no forced signup** — no auth backend yet; deferred by design

### Discarded ideas — do not revisit
| Idea | Why discarded |
|---|---|
| Intent picker on every app open | Adds mandatory friction before any value; fixed by better home screen hierarchy |
| Module-level StyleSheet with theme refs | Crashes at module parse time — 6+ instances |
| `&&` in style arrays | Returns `false`, crashes StyleSheet in Expo Go |
| `expo-image-picker` in Expo Go | Not installed, immediate crash |
| DuaList/DuaDetail in root stack only | Tab navigation couldn't find screens |
| Inline Board/Contacts tabs in JourneyScreen | Too cluttered, moved to standalone screens |
| `react-native-draggable-flatlist` in Expo Go | Requires native build, gesture conflicts |
| Unicode escapes as bare JSX text nodes | Render literally |
| Native iOS share sheet from Expo Go | Requires Share Extension |
| "Community" as pillar/grid label | Implies social network — replaced with "Connect" |
| Hub screens as mandatory navigation layer every session | Adds a tap for returning users; smart routing deferred until usage data available |

---

## 8. Product/business decisions — ⚠️ UNCONFIRMED, NEEDS REVISIT

The following appeared in TDD_MASTER (June) and have not been reconfirmed since. Treat as **shelved/uncertain, not active** — do not build against these or state them as settled without checking with the user first.

| Decision | Detail |
|---|---|
| Pricing | $9.99 one-time, no subscription, no paywall |
| Family sharing | iOS Family Sharing + Google Play Family Library — automatic, market explicitly |
| Android pricing | Local pricing per country — purchasing power parity |
| Safar Duas Edition | $1.99 · separate lightweight edition · same codebase · `APP_MODE` config flag |
| Gifting | Native App Store gifting · gift card generator · sadaqa jariya framing |
| Multi-language | English first · Urdu + Indonesian planned later · locale keys from the start |
| YouTube | After app complete · same visual identity · scholar-verified · Shorts + long-form |
| Scholar verification | Required before submission · covers app + YouTube simultaneously |

Also unconfirmed/possibly stale: WhatsApp integration plan (React Native `Linking` API, no native modules — share milestone / contact chat / group invite via deep link), and the marketing message drafts from that session.

---

## 9. Open questions (not yet resolved)

- `ImportTripScreen` — likely tied to SafarAssist; built, orphaned. Keep/wire/retire?
- `NotificationsScreen` — built, unwired. Keep/wire/retire?
- `AuthScreen` — deferred by design. Revisit if/when auth backend exists
- `SacredPlacesScreen` — registered but unreachable in the current nav. Needs entry point + content commitment
- Shop bookmarking — should Shop items be bookmarkable? No mechanism currently. May belong in a shopping checklist instead.
- `HajjUmrahPickerScreen` — du'ā-library gateway; confirm its role vs. GuidesHubScreen/HubContainerScreen (may be superseded)
- Whether the 53-dua/named-stage content set (TDD_MASTER) and the normalized-schema content set (current TDD) are the same evolved file or a fork — resolve before doing any content work
- **ProfileScreen (Prepare) row icons — needs verification.** A superseded snippet (`ProfileSettingsRow.jsx`) shows the Help & Support and Settings rows using emoji (🤲, ⚙️) rather than Phosphor icons — inconsistent with the emoji removal done on SupportScreen (2026-07-12). Not yet confirmed whether ProfileScreen's live code still has this, or whether it was already updated. Flagged 2026-07-12, deliberately deferred by user — check next time ProfileScreen is touched, don't assume it's fixed.

### Known caveats needing verification (may be stale — check before relying on)
- Claude API key reportedly in client bundle — needs backend proxy before submission (security blocker, not cosmetic)
- Currency Exchange API key was documented in plaintext in a prior doc — treat as compromised, rotate
- `ShopScreen` imports `getAffiliateUrl` from `"../utils/affiliateLinks"` — confirmed correct 2026-07-12, a copy of `affiliateLinks.js` exists in a `utils/` folder in the project (previously flagged here as a suspected broken path; that was wrong, retracted). ⚠️ Open question instead: is the root-level `affiliateLinks.js` (Section 3 file list) and the `utils/` copy the same file duplicated, or have they diverged independently? If two copies are maintained separately, whichever one doesn't get edited will silently go stale — worth a one-time check, not urgent.
- Some screens may still reference superseded color tokens — audit before assuming full migration to the current palette (Section 2)

---

## 10. Key screens and their status

### Completed / solid
- **HomeScreen** — hero carousel (3 slides), 2×2 pillar tiles with stat badges and ornament divider, prayer times, journey continuation card
- **BookmarksScreen** — full redesign: pills, grid/list toggle, search, tile cards with watermark icons, edit modal, real AsyncStorage persistence via `bookmarkStore.js`
- **NotesScreen** — large cards, tag system (Before/During/After/Custom), divider line, search, grid/list toggle
- **PracticeLearnScreen** — queue manager, browse section, quick start sets, large hero "Start Practice" button
- **MediaScreen** — full dark theme (`#000000`), carousel hero, learning paths, browse by topic, horizontal video/podcast/article rows, all text sans-serif except page title
- **WhatToExpectScreen** — hub-style redesign with photo header, gradient overlay, accordion sections, Phosphor icons
- **ProfileScreen (Prepare)** — hub header, section pills, profile card, 2×2 personal tiles, shop banner + tiles with real product images, resource links
- **DuaDetailScreen** — complete: large centered Arabic, geometric pattern header, prev/next navigation with counter, transliteration/translation toggles, speed control, bookmark heart wired to real persistence via bookmarkStore. Only gap is mock (non-real) audio — see note below, deprioritized.
- **SettingsScreen / SupportScreen** — Tier 2 dark header (`#3A3545`, Prepare's color) applied 2026-07-12, see Section 7 for full rationale. SupportScreen also fully de-emojified (Phosphor icons + custom KaabahIcon throughout), icon sizes increased for legibility, hero spacing fixed. Both share identical serif page-title treatment now.
- **ChecklistsScreen / ChecklistDetailScreen** — built 2026-07-13. Four real checklist categories (Documents, Packing with sub-sections, Spiritual preparation, Before Leaving Home) with seed content, persisted checked-state via `checklistStore.js`, per-category accent colors, pill-based in-place switching between checklists on the detail screen, "Create your own checklist" entry point (button present, not yet wired to a real creation flow — no such screen exists yet). Reachable from Plan hub (`HubContainerScreen.jsx`, row label "Checklists," plural). Full detail in the shared-modules and "Ornate Header" sections below.
- **CalendarScreen** — built 2026-07-12, iterated extensively 2026-07-13 (Ornate Header, Safar Assist card repositioning, contrast/spacing fixes). Month grid, per-category color-coded entries, Add/Edit sheet, "This month" list. Lives in `HomeStack` (moved off Root Stack to keep the bottom tab bar visible). Full detail in dedicated CalendarScreen entry further below in this section and in the "Ornate Header"/SafarAssistCard entries.
- **Ornate Header pattern** — applied across 9 screens as of 2026-07-13 (Checklists, ChecklistDetail, Bookmarks, MyContacts, Notes, PrayerTimes, Qibla, PracticeLearn, Calendar). CurrencyScreen still pending. Full spec in its own named section below — search "Ornate Header."
- **SafarAssistCard** — reusable shared component built 2026-07-13, wired into 5 screens with contextual per-screen copy (Checklists, Bookmarks, Calendar, Notes, MyContacts) plus migrated from JourneyScreen's old one-off card. Full spec in the shared-modules section below.
- **Bottom tab bar visibility rule — decided 2026-07-12.** Every screen in the app should keep the bottom tab bar visible, with **DuaDetailScreen as the sole deliberate exception** (full-screen, immersive, no tab bar — intentional given it's the Du'ā Player, the app's most important screen, and a focused reading/recitation moment benefits from no competing UI). This means screens should generally NOT live in the Root Stack (which is full-screen/tab-less by nature) unless they have the same kind of deliberate immersive justification as DuaDetail. **CalendarScreen was moved from Root Stack into `HomeStack` for this reason** (2026-07-12) — it originally went into Root Stack specifically to solve a cross-stack reachability problem (needed to be callable from Tools, Plan hub, and JourneyScreen, which live in different stacks), but that came at the cost of losing the tab bar, which turned out to matter once seen in practice. The correct pattern, now applied: put the screen in ONE tab's stack (Calendar → `HomeStack`, alongside Tools), and have entry points from OTHER stacks use the `nav: "tab"` cross-stack pattern already established in `HubContainerScreen.jsx` (`{ nav: "tab", tab: "Home", screen: "Calendar" }`) or the equivalent `navigation.getParent()?.navigate("Home", { screen: "Calendar" })` call from a plain screen like `JourneyScreen.jsx` — rather than defaulting to the Root Stack just because a screen needs multi-stack reachability. Root Stack should be reserved for screens with a genuine "distraction-free destination" justification, not used as a convenience to dodge cross-stack navigation.
  - ⚠️ **Follow-up, not yet done:** `SafarAssistScreen` and `PilgrimageDuasScreen` are still in the Root Stack (tab bar hidden) and were not evaluated against this new rule — per the user's explicit "all pages except Dua Detail" answer, both should likely be moved into an appropriate tab stack the same way Calendar was, unless a genuine immersive-destination case can be made for either (not yet assessed). Do this as its own scoped task, not folded into an unrelated prompt.
- ⚠️ **Correction, 2026-07-12: `ToolsScreen` is NOT part of `HomeStack`.** When Calendar was moved into `HomeStack` to fix the missing-tab-bar problem, the fix assumed `ToolsScreen` was also in `HomeStack` (since Tools and Calendar's other entry points seemed related) — this was wrong and caused a live navigation error ("action NAVIGATE... was not handled by any navigator") the first time a user tapped Calendar from Tools. **Confirmed real structure from `App.js`:** `Tools` is registered as `<Tab.Screen name="Tools" component={ToolsNavigator} />` — its own dedicated bottom tab with its own stack (`ToolsStack`), where `ToolsScreen` itself is registered as `"ToolsMain"`. This is a genuine sibling navigator to `HomeStack`, not a nested screen within it. Fixed by making `ToolsScreen`'s Calendar row use `navigation.getParent()?.navigate("Home", { screen: "Calendar" })` specifically for that one row, while every other Tools row keeps its normal same-stack `navigate()` call (since e.g. PrayerTimes and Qibla ARE registered inside `ToolsStack` itself). **Lesson, reinforced a second time this session:** before writing any cross-stack navigation fix, grep `App.js` for the ACTUAL registration of both the calling screen and the target screen — do not assume two screens share a navigator just because they're conceptually related or were previously assumed to be co-located.
- **Confirmed navigator map (partial, from direct App.js reads this session) — refer to this before assuming a screen's stack membership:**
  - `HomeStack` (tab `Home`): HomeMain, Hub, PlanHub, LearnHub, PracticeHub, ConnectHub, HubContainer, UmrahGuide, HajjGuide, WhatToExpect, Groups, Guides, Shop, Media, Notes, Settings, Notifications, **Calendar**
  - `ToolsStack` (tab `Tools`, its own separate navigator): ToolsMain (= ToolsScreen.jsx), PrayerTimes, Qibla, (others not yet fully read this session — re-verify before assuming any specific Tools row's stack membership)
  - Root Stack (full-screen, no tab bar): Onboarding, MainTabs, DuaDetail, PilgrimageDuas, SafarAssist, SacredPlaces (Calendar removed from here 2026-07-12)
- **`returnToTab` / `screenParams` pattern — the proven, general solution for cross-tab back-button navigation.** Decided and proven working 2026-07-13, after three real bugs (Calendar-from-Tools initially landing on the wrong screen, Bookmarks-from-Tools returning to Home instead of Tools, Bookmarks-from-Plan-hub returning to Prepare instead of Home/Plan). **The root cause in all three cases:** when screen A (in one tab's stack) cross-navigates into screen B (registered in a different tab's stack) via `navigation.getParent()?.navigate(tabName, { screen: "B" })`, screen B's plain `navigation.goBack()` has no real history to fall back to in its own stack — it either falls back to that tab's default screen or produces unpredictable results, not back to wherever the user actually came from. **The fix pattern, now used in two places (`ToolsScreen.jsx`'s Bookmarks row, `HubContainerScreen.jsx`'s Plan-hub Bookmarks row) and confirmed working in both:** the calling screen passes an extra param (`returnToTab: "TabName"`) alongside the cross-tab navigation call, and the target screen's back button checks for that param — if present, explicitly calls `navigation.getParent()?.navigate(returnToTab)` instead of `goBack()`; if absent (i.e. the screen was opened normally, same-tab), it falls back to ordinary `goBack()` unchanged. In `HubContainerScreen.jsx` specifically, this required generalizing the shared `goRow` function's `"tab"` case to accept an optional `screenParams` field on any row config (distinct from the existing `params` field used by the `"stack"` case), so any future row needing this pattern can opt in without a one-off code change. **Any new cross-tab entry point to a shared screen (Bookmarks, Calendar, or similar) should use this pattern from the start, not be discovered as a bug after the fact** — check whether the target screen's back button already supports a `returnToTab`-style param before assuming a fresh cross-tab link will "just work."
- **CalendarScreen — full feature detail.** Month grid (Gregorian primary, Hijri secondary placeholder text — real Hijri conversion still needs a library, not yet wired), category dots per day, tap-to-select day with a promoted detail panel below showing entry cards, plus a "This month" section listing every entry across the whole displayed month (added after initial build) so entries are scannable without tapping each day individually. Five categories — Travel `#2E4560`, Rites `#C8A96A`, Group `#3D2240`, Personal `#4A5C48`, Reminders `#3A2F1E` — each also has a real Phosphor icon (`SuitcaseRolling`, `HandsPraying`, `UsersThree`, `Heart`, `BellSimple` respectively), an enhancement beyond the original spec. Add/Edit entry bottom sheet: title, category picker, notes, save/delete, per-entry share (the sheet shipped simpler than originally specced — no all-day/start-end-time/location fields were actually built in the first pass; confirm current field set against the real file before assuming the original spec's full field list is present). Entries persist to AsyncStorage under `safar_calendar_v1`. Demo/seed data: `seedDemoEntriesIfEmpty()` writes 6 example entries (one per category, one day with 2 entries) only if no entries exist yet — won't overwrite real user data. Screen-level "Share day" — confirm this shipped; the header's confirmed buttons are back and Add (+) only, "Share day" was part of the original spec but not verified present in the built file. Entry points: ToolsScreen (2nd row, after Dhikr Counter, confirmed), JourneyScreen (new full-width card below Groups/Contacts, confirmed), `HubContainerScreen.jsx`'s `PILLAR_CONFIG.plan.rows` array (added after "What to Expect", confirmed 2026-07-12 as the actually-correct live file — see note below for the full story).

- ⚠️ **Architectural finding, corrected 2026-07-12: THREE Plan-hub-shaped files exist in this project; only `HubContainerScreen.jsx` is actually live.** This took three wrong attempts to resolve, worth recording precisely so it never happens again:
  1. First attempt: edited `PlanHubScreen.jsx` (photo header, hero countdown card, its own `ROWS` array). Confirmed correct in the file three times, never appeared on-device. Assumed at the time this was the live Plan hub — wrong.
  2. Second attempt, after checking `App.js`: found `HubScreen.jsx` (single reusable component, `HUBS.plan.items` config, route `"Hub"` + param `{ hub: "plan" }`) registered in `App.js` and assumed *this* was live instead, based on route-naming plausibility. Edited it correctly. Still didn't appear on-device.
  3. Only on the third attempt, after actually grepping `HomeScreen.jsx`'s real Four Pillars card `onPress` handler directly, was the true answer found: `navigation.navigate("HubContainer", { pillar: "plan" })` — a **third** file, `HubContainerScreen.jsx`, with its own `PILLAR_CONFIG.plan.rows` array, matching the TDD's own existing note about `HubContainerScreen` replacing the four individual hub screens "to eliminate image flicker on pill switches." This was documented in this file all along (see the `HubContainerScreen` note elsewhere in this section) — it should have been the very first place checked.
  - **`HubScreen.jsx` and `PlanHubScreen.jsx` both appear to be dead/superseded files** — not imported or navigated to from `HomeScreen.jsx`'s real pillar cards, yet both are still registered in `App.js` (`"Hub"` and `"PlanHub"` routes respectively) and still physically present in the project. They may be reachable only through some other, not-yet-found path, or may be fully orphaned leftovers from before the `HubContainerScreen` consolidation. Do not assume either is dead without checking — but do not assume either is live either. **Confirm the real live file via the actual `onPress`/`navigate` call site in the calling screen before editing, every time** — do not infer from route names, file names, or which file "sounds right." This is the second and third time in this session a wrong-file assumption wasted a full round-trip (first was `GroupDetailScreen` vs `GroupsScreen`, though that one was caught before wasted edits; this Plan hub confusion cost three).
  - ✅ **Resolved 2026-07-12:** the Plan hub confusion (three files, only one live) is fully resolved — see the Retired Files list below for the complete, final account of what happened and why. `HubContainerScreen.jsx` is the sole live implementation for all four pillars.
  - ⚠️ **Bug history worth remembering:** (1) header Add-button icon was set to the same color as its own button background (`#FDFAF4` on `#FDFAF4`), making it invisible — same mistake class as the SupportScreen back-arrow bug earlier this session, second independent occurrence. (2) Add Entry sheet rendered as an empty dark backdrop with no visible card. First diagnosis (animation timing race between `setShowModal(true)` and the `Animated.parallel` slide-in) was **wrong** — the fix was applied correctly (moved animation trigger into a `useEffect` watching `showModal`) but the bug persisted, proving the real cause was elsewhere. Actual root cause, found on second pass by reading the real style definitions: `sheet` style had `maxHeight: "90%"` with no resolved `height`, while its child `sheetKav` used `flex: 1` — a flex child cannot resolve against a parent whose height comes only from `maxHeight`, so it collapsed to zero height and rendered nothing. Fixed by removing `flex: 1` from `sheetKav` and `sheetScroll`, letting both size to content naturally. **Lesson for future sessions:** when a component "renders but shows nothing," check for `flex: 1` on a child whose parent only has `maxHeight` set, before assuming an animation/timing cause — this bug class is layout, not logic, and static code reading (not just describing the symptom) was what actually found it.
- **MyDuasScreen** — Add a Du'ā modal wired, Import Du'ās modal, Shared with me section

### Custom shared modules
- **`bookmarkStore.js`** — single source of truth for du'ā and media bookmark *writes* (`safar_bookmarks_v1`, `safar_bookmark_media_v1`). Exports: `getDuaBookmarks`, `isDuaBookmarked`, `toggleDuaBookmark`, `getMediaBookmarks`, `isMediaBookmarked`, `toggleMediaBookmark`. `BookmarksScreen.jsx` maintains its own display-layer cache (`safar_bookmarks_v2`, includes link bookmarks which have no other home) that re-derives du'ā/media entries fresh from `bookmarkStore.js` on every screen focus via `useFocusEffect` — fixed 2026-07-12 after bookmarks added from DuaDetailScreen weren't appearing in Bookmarks (the old logic only synced once, on first-ever load, then trusted a stale V2 cache indefinitely). Preserves link bookmarks and custom title/note edits made via the Edit Bookmark modal across refreshes. If a future screen adds its own bookmark-reading logic, make sure it reads live from `bookmarkStore.js` (or from `BookmarksScreen`'s now-self-refreshing V2 cache) rather than caching a snapshot once — same bug class, easy to reintroduce.
- **`practiceStore.js`** — practice queue persistence. Exports: `getPracticeQueue`, `addToPractice`, `removeFromPractice`, `reorderQueue`, `clearPracticeQueue`, `isInPractice`, `togglePractice`
- **`Toast.jsx`** — imperative toast/snackbar. Call `showToast(message, { actionLabel, onAction })`. Render `<ToastHost />` once in App.js
- **`KaabahIcon.jsx`** — custom icon component (2026-07-12) matching Phosphor's prop conventions (`size`, `color`, `weight` — supports `"regular"`/`"fill"` only, not all six Phosphor weights). Built because Phosphor has no literal Ka'bah icon; closest built-in (`Mosque`) is too generic for Hajj/Umrah-specific content. Flat square silhouette with a gold band (`#C8A96A`, hardcoded regardless of `color` prop) evoking the kiswah. Currently used on SupportScreen's "Hajj & Umrah" FAQ chip — reusable anywhere else Ka'bah iconography is needed (WhatToExpectScreen, UmrahGuideScreen, HajjGuideScreen, etc. are candidates, not yet wired).
- **`HeaderPatternBg.jsx`** — reusable header background component (2026-07-13), extracted from `DuaDetailScreen.jsx`'s original internal `HeaderPattern` function. Renders the gold geometric SVG motif (`PATTERN_PATH` from `screens/headerPatternPath.js`) with a top-to-bottom fade mask, scaled to screen width via a single `width` prop. `DuaDetailScreen.jsx` itself was left untouched (keeps its own internal copy) — this extraction is purely additive, used by other screens applying the "Ornate Header" pattern (see below).
- **`SafarAssistCard.jsx`** — reusable shared card component (2026-07-13) for promoting the Safar Assist AI-import feature consistently across screens, replacing what was previously a one-off flat card unique to `JourneyScreen.jsx`. Photo-background treatment (mini hero-card style, not the flat/dark version originally mocked up and rejected) — dark scrim overlay, small sparkle icon badge positioned top-right (absolutely positioned, not inline with title), left-aligned serif title, sans-serif subtitle (capped at 2 lines via `numberOfLines={2}`), optional tagline below a subtle divider. Props: `title`, `subtitle`, `tagline` (optional), `onPress`, `image` (optional, defaults to `safar-assist-card2.png`; a second option `safar-assist-card3.png` exists in assets for future A/B comparison, not yet tried). Text sized at roughly 70% of an earlier, too-large iteration (title `24`, subtitle `11`, tagline `10` — deliberately kept one point apart from subtitle so they don't read as identical weight). **Does not supply its own `marginHorizontal`** — this was tried once and caused inconsistent card width across screens (some screens' containers already provide horizontal padding, some don't); the component now assumes no horizontal spacing of its own, and each hosting screen is responsible for its own inset (`ChecklistsScreen.jsx` wraps it in a `marginHorizontal: 16` View since its container has none; JourneyScreen/BookmarksScreen/CalendarScreen/NotesScreen/MyContactsScreen don't need a wrapper since their containers already pad correctly).
  - **Migrated `JourneyScreen.jsx`'s original Safar Assist card** to use this shared component instead of its own separate `assistCard` styling — the old `assistCard`/`assistInner`/`assistLeft`/`assistDot`/`assistTitle`/`assistSub`/`assistArrow`/`assistTagline` styles were removed as part of this migration.
  - **Wired in with contextual per-screen copy** (same visual shell, different message) on: `ChecklistsScreen.jsx` ("Bring in your checklist from Notes, Reminders, or Google Docs"), `BookmarksScreen.jsx` ("Bring in your saved links and notes"), `CalendarScreen.jsx` ("Bring in your dates and itinerary" — positioned between the selected day's events and the "This month" list, after being moved twice: first from above the day-events section down to the very bottom of scroll, then to its current position, since the original placement pushed day-events below the fold when a user tapped a date, and bottom-of-scroll made it too easy to miss), `NotesScreen.jsx` ("Bring in your notes from Apple Notes, Google Docs, or anywhere else"), `MyContactsScreen.jsx` ("Bring in your contacts from your phone, Notes, or Google Docs").
  - ⚠️ **`MyContactsScreen.jsx` had dead, unused `importRow`/`importTipPanel` styles already in the file before this session's changes** — defined in the StyleSheet but never referenced in any JSX. Not a competing feature, just orphaned CSS from something removed earlier. Left as-is (not part of this session's scope to clean up), but worth knowing if it resurfaces in a future audit of dead code.

### "Ornate Header" — named reusable header treatment
Established 2026-07-13. When the user asks to apply "Ornate Header" to a screen, it means:
- The gold geometric pattern via `<HeaderPatternBg width={SW} />` (see shared modules above), rendered as the first child of the header container.
- **No star ornament** — deliberately excluded after review. It only made sense in DuaDetailScreen tied to a "stage" label; on a plain utility screen it read as decorative clutter with no job to do. Do not add it when applying this pattern elsewhere, even though DuaDetailScreen (the origin of the pattern) still has one.
- Pattern **bleeds to the true top of the screen**, including behind the status bar/notch. This requires replacing the screen's outer `SafeAreaView` with a plain `View`, then applying `useSafeAreaInsets()` manually so only the header's actual content (back button row) gets pushed down by `insets.top`, while the header container itself (and therefore the pattern inside it) extends to `y: 0`. (First attempt on ChecklistsScreen left the pattern short of the true top edge because `SafeAreaView` insets everything, including the pattern — fixed by this approach, confirmed working.)
- Header container needs `position: "relative"`, `overflow: "hidden"`, and enough height (`minHeight` around 140, tune per screen) for the pattern to fade naturally and the title to sit clearly below the densest part of it.
- Page title: increase `fontSize` to `38` (matching ToolsScreen/HubContainerScreen page titles) — a real, deliberate size increase from the smaller size (often `22`) used on plain-header utility screens, not a typo. Keep the screen's existing `fontFamily` (serif), `color` (`#1A1410`), and center alignment unchanged — only size changes.
- Content below the header is otherwise unaffected — no other layout, card, or row styling changes are part of this pattern.
- **Applied and confirmed working (2026-07-13):** `ChecklistsScreen.jsx`, `ChecklistDetailScreen.jsx`, `BookmarksScreen.jsx`, `MyContactsScreen.jsx`, `NotesScreen.jsx` (required a resend — first combined prompt silently skipped this file while applying correctly to MyContactsScreen in the same prompt; lesson: verify each file in a multi-file prompt landed, don't assume uniform success), `PrayerTimesScreen.jsx` (most structurally complex — notify + refresh buttons relocated into the new top row), `QiblaScreen.jsx`, `PracticeLearnScreen.jsx`, `CalendarScreen.jsx` (applied 2026-07-13 end of session — not yet visually confirmed by user, check on-device next session before assuming it landed cleanly, since this screen's header was flagged as possibly more complex than the standard pattern).
- **Not yet done:** `CurrencyScreen.jsx` — file not yet uploaded, explicitly deferred to next session.
- ⚠️ **Caveat, learned on BookmarksScreen.jsx: `overflow: "hidden"` on the header container (required to clip the pattern SVG correctly) means `minHeight` is a hard ceiling, not just a minimum, for practical purposes.** Adding spacing (margin, padding) to content inside the header without also increasing `minHeight` to match will cause `overflow: "hidden"` to silently clip content instead of the header growing to fit — this happened once already (adding `marginTop` to space out a crowded title/subhead only made clipping worse, since `minHeight` wasn't increased alongside it). **Whenever adjusting spacing inside an Ornate Header's content, always check whether the header's own `minHeight` needs to increase by a matching or larger amount in the same change** — don't add internal spacing as an isolated fix.
- **Font note:** Fraunces was explored as a possible serif replacement for page titles (a real font file was downloaded, verified, and previewed against actual Home screen contexts) — user decided to keep `SourceSerif4-Regular` as-is. Do not resurface this as an open question unless the user raises it again.

### Still to build (priority order per this doc)
1. PilgrimageDuasScreen
2. UmrahGuideScreen / HajjGuideScreen
3. ShopScreen redesign
4. FAQ section in Learn hub
5. SacredPlacesScreen (needs content commitment first)
6. **Share feature (replaces PrintOfflineScreen)** — scoped 2026-07-12. `PrintOfflineScreen` ("Save for Offline") is being retired, not redesigned — its core premise was solving a problem that doesn't exist (confirming du'ās are offline, when the app is already fully offline-bundled by default per its own code comment). What replaces it is a proper cross-app **Share** feature:
   - **v1 scope: OS share sheet only** (React Native `Share` API — already used in the current `PrintOfflineScreen.handleShare`, no new package needed). "Share to another Safar user" is explicitly deferred — it requires user identity/accounts, which requires the auth backend the app doesn't have yet (per Section 5, onboarding-only/no auth is deliberate). Do not build UI placeholders for Safar-to-Safar sharing in v1 — add it as a real option only once the backend exists, not as a disabled/greyed-out stub now.
   - **Where Share applies, and why each was included/excluded:**
     - **Du'ās** — yes. Extends the existing `handleShare` text-export pattern from the old PrintOfflineScreen (Arabic + transliteration + translation + source), applied per-du'ā from DuaDetailScreen and/or bulk from MyDuasScreen. Clear, frequent real use case (sending a du'ā to a family member joining the trip).
     - **Checklists** — yes, but v1 is a **one-time text export only**, not live/collaborative. A true shared/synced checklist (Apple Notes-style, live updates, notifications when a family member checks something off) is a *separate, larger feature* requiring the auth backend for real multi-user identity — formally parked, see below. Don't conflate the two when scoping checklist work.
     - **Milestones** — yes, arguably the most natural share moment (reaching Arafah, completing Hajj). Check whether `GroupsScreen`'s existing "milestone feed" already covers part of this before designing from scratch.
     - **Shopping items** — yes, **per-item only**, not a curated multi-item collection. User validated this from personal experience: pilgrims frequently ask each other for specific product links/recommendations one at a time (e.g. "which ihram did you buy?"). Share button on a single shopping item/product tile → OS share sheet (product name + affiliate link), same mechanism as everything else. Do not build a "collection" or "shopping list" data model for this — that was considered and explicitly rejected as over-scoped; the real ask is a share button per item, identical in kind to sharing a single du'ā.
     - **Media** — lower priority, share a link to the external video/article/podcast, minimal effort, not urgent.
   - **Podcast "listen offline" — separate small feature, not part of Share.** Explored and rejected: real Spotify/Apple Music/Tidal API integration to programmatically build an offline playlist. Rejected because it needs separate OAuth integration per platform (three+ platforms), uncertain content matching (no guarantee a given podcast episode exists on every platform to add), and is a genuinely large new-integration project under the "no new packages/integrations without approval" rule — not a quick add despite sounding like one. **What's actually being built instead:** a simple prompt/tip on podcast items suggesting the user save/download it themselves in their preferred app for offline listening (e.g. "Open in Spotify" deep link if available, plus a one-line tip like "Add to a playlist and download for offline listening during your trip"). Uses `Linking` (already used elsewhere per TDD, e.g. WhatsApp integration) — no OAuth, no ToS risk, no new package.
   - **Explicitly parked, not dismissed: collaborative/shared checklists.** Real multi-user sync (shared list, live updates, notifications on changes — the Apple Notes shared-list model) for families/groups traveling together. Genuinely good idea, validated by the user, but requires real accounts/identity and likely a real-time sync backend — blocked on the same auth-backend decision already deferred elsewhere in this doc (Section 5, Connect features). User has confirmed the auth backend will likely be needed for other features too, so this isn't a one-off blocker — revisit this specific feature once that backend decision is made, don't try to build a lightweight version of "collaborative" without it.
   - **Next step:** design the actual Share UI/interaction pattern (icon placement, what the share sheet content looks like per content type) before writing any Claude Code prompts — not yet done as of this entry.

> **DuaDetailScreen — confirmed complete as of 2026-07-12**, verified against the live file via project knowledge, not just the doc. Large Arabic display ✓, prev/next navigation ✓ (with counter, dimmed-arrow end states), bookmark persistence ✓. The "needs full redesign" line that used to sit here was stale — the redesign happened and the user is happy with it. Removed from the build list.
>
> **Known, accepted gap — not tracked as a priority:** audio playback across the app (DuaDetailScreen, PracticeLearnScreen, TawafScreen) is a **mock** — a `setInterval` timer simulating playback against a hardcoded duration, not real audio via `expo-av`. Controls (play/pause/speed/loop) are fully built and wired to the fake timer, so it looks and behaves correctly in the UI — it just doesn't produce sound. Real playback requires `expo-av` (not currently installed, would crash in Expo Go) and an EAS dev build. Explicitly deprioritized by the user (2026-07-12) — don't resurface as a blocker or propose fixing it until the user raises it, since it's a known dev-build dependency, not an oversight.

---

## 11. Git reference

### Standard commit pattern
```bash
git add -A
git commit -m "description of what changed"
git push
```

### Revert-safety pattern (use before any significant structural/visual change)
Save current state first:
```bash
git add -A
git commit -m "Save before [description of change]"
git push
```

Revert a single file if needed:
```bash
git checkout HEAD~1 -- screens/FileName.jsx
git add screens/FileName.jsx
git commit -m "Revert [description]"
git push
```

View history:
```bash
git log --oneline
```

---

## 12. Assets — ⚠️ carried forward from TDD_MASTER (June), verify still accurate

### Images referenced in code (last confirmed June)
| File | Used on |
|---|---|
| `kaaba_mixed.png` | Hero carousel · Onboarding |
| `hero_guide.jpg`, `what_to_expect.jpg`, `hero_duas.jpg`, `hero_groups.jpg` | Hero carousel slides |
| `tawaf.jpg`, `tawaf2.jpg` | Tawaf-related cards |
| `sayi.jpg` | Sa'y card |
| `focus_mode.jpg` | Formerly Focus screen — needs recheck now Focus is retired |
| `sacred_places.png` | Sacred Places card |
| `continue.jpg` | Continuation card background |
| `arafah.jpg`, `arrival.jpg`, `ihram.jpg`, `mina.jpg` | PilgrimageDuas stage images |
| `umrah_route.png` | MapScreen isometric map |
| `Artboard_2_3x.png` | DuaDetailScreen header pattern |
| `[cat_*.jpg]` | Du'ā library category images |

### Shop images (confirmed current per Handoff, Jul)
`assets/shop/shop-{ihram,bag,sandals,zamzam,umbrella,prayer}.jpg`, `assets/shop/shop-banner.jpg`

### Fonts
`assets/fonts/SourceSerif4-Regular.ttf` → `"SourceSerif4-Regular"`

### Still needed (per Section 9, content research task list)
- Sacred place images — Ka'bah, Nabawi, Arafah, Mina, pilgrims, architecture
- Hub header images — Plan, Practice, Connect headers
- Media content — YouTube videos, podcasts, articles

---

## 13. Content & asset research (ongoing assistant task list)

A separate assistant (~1 hour/day) populates content via a task doc. Key areas: du'ā content gaps (morning/evening/travel/Madinah/forgiveness/Arafah), sacred place images, hub header images, shop product affiliate links, media content, FAQ content, checklists (documents/packing/spiritual/before-leaving).

---

## 14. Naming conventions

- The Dua Player = `DuaDetailScreen` — use "Dua Player" in all references
- Domain: `trysafar.app` — registered
- Instagram: `@trysafarapp`
- Email: `hello@trysafar.app`

---

## 15. Planned future features (not yet built)

- Smart checklists — time-staged by departure date, four categories
- Weather widget — Makkah + Madinah, OpenWeatherMap API
- SafarAssist — AI trip setup, import from booking emails
- Document storage — local encrypted, cloud sync v2
- Learning paths — guided content sequences in MediaScreen (structure built, needs real content)
- HubBar — secondary navigation bar, currently disabled, toggleable in Settings
- User playlists — media playlist feature (after media content is solid)
- Connect features — groups, shared checklists, meeting points (requires backend)
- Share Extension — for saving external links/media to Bookmarks (requires dev build)
- Prayer times widget, spiritual journal, du'ā memorization mode, post-pilgrimage 40-day programme (later phases, unconfirmed priority — see Section 8 caveat)
