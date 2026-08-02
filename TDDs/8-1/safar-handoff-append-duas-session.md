## Session addendum — workflow notes (append to SAFAR Handoff)

### File naming has drifted before — verify before trusting any reference
This session started confused about which TDD/Handoff files were current
(referenced stale `SAFAR_TDD.md`/`SAFAR_HANDOFF.md` from project knowledge
before learning newer `safar tdd 7-29.md` / `safar handoff 7-29.md` existed
in a different chat). This is a repeat of a documented past problem — file
sync/versioning between this chat's project knowledge, Claude Code's local
copy, and GitHub has broken before. **Standing rule: confirm the exact
current filenames with the user at the start of any new chat rather than
assuming project knowledge is current.**

### Claude Code prompt format — confirmed standing preference
- One single, complete, paste-able block of plain text — not chat prose
  broken up with numbered explanations. Deliver as a file when substantial.
- Every prompt opens with an explicit instruction to read the current
  TDD and Handoff files by name, before doing anything else.
- Every prompt ends with the git steps included directly in the prompt
  text itself (`git add -A`, `git commit -m "..."`, `git push`) — not as a
  separate instruction after the fact.
- Ask Claude Code to summarize/list every file and line it changed before
  committing, especially for anything involving judgment calls (icon
  choices, wording, category mappings) — flag guesses explicitly rather
  than silently deciding.

### This chat has no persistent access to the live repo
Confirmed again this session: I can inspect/edit only the read-only project
knowledge snapshot or whatever's freshly uploaded — never the actual
repository. Several times this session, uploaded "latest" files turned out
to differ from the stale project-knowledge version in small but real ways
(e.g. a single wording tweak already made). **Always ask for the current
version of a file before proposing changes to it, even if it was discussed
or believed finished in a previous session or earlier in the same one.**

### Verification loop that worked well this session, worth repeating
1. Chat proposes a fix/plan in plain language.
2. Chat writes one complete Claude Code prompt (reads TDD/Handoff first,
   ends in git commands).
3. User runs it, then pastes back the actual resulting file(s).
4. Chat diffs what it expected against what's actually there before
   declaring anything done — don't assume a described change landed just
   because a prompt was written for it.

### Dua sourcing reference established this session
For any future dua content work, `sunnah.com/hisn` (the numbered Hisn
al-Muslim edition) is the preferred source going forward — individually
citable per entry, more reliable than the orphaned `duaLibrary.js` file's
looser citations.
