# Safar — Standing instructions

1. **Read `Safar_TDD.md` before starting any task.** It contains current decisions, structure, and conventions. Don't skip this.

2. **`Safar_TDD.md` is the single source of truth.** When code and the TDD disagree, the code wins — then fix the TDD to match.

3. **Record new decisions.** When we agree on a design or structure decision during a session, update `Safar_TDD.md` to reflect it before the session ends.

4. **Grep before building.** Before implementing any feature, grep the codebase to confirm it doesn't already exist.

5. **Coding rules (from TDD):**
   - `StyleSheet.create` at module level, literal values only
   - No `&&` in style arrays — use ternaries
   - Phosphor icons only — verify each name exists before use
   - No emoji in UI

6. **Project structure — do not reorganize:**
   - Entry point: `App.js` (root)
   - Screens: `screens/`
   - Shared modules (`theme.js`, `AccessibilityContext.js`, `dua-content.js`, `firebase.js`): root, imported from screens as `../`
