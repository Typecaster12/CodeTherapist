# Rules — Code Therapist

> This file contains the non-negotiable rules and conventions for building Code Therapist.
> Every development session must follow these rules without exception.

---

## Rule 1 — Package Manager: BUN Only

- **Always use `bun` as the package manager** for all frontend and JavaScript-related tasks.
- Never use `npm` or `yarn` unless something is critically broken and `bun` has no viable alternative (e.g., a tool that explicitly refuses to work with bun).
- If `npm` must be used as a last resort, document the reason in `completedTasks.md`.

```bash
# ✅ Correct
bun install
bun add <package>
bun run dev

# ❌ Incorrect
npm install
npm run dev
yarn add <package>
```

---

## Rule 2 — Feature-by-Feature Development

- Development must happen **one feature at a time**.
- A feature is only considered "done" when it has been **tested and verified** to work correctly.
- Do **NOT** move to the next feature until the current feature passes basic testing.
- Testing includes: manual testing, checking API responses, verifying UI renders correctly, and checking DB writes where applicable.

```
Feature N (Build) → Feature N (Test & Verify) → ✅ Mark Complete → Feature N+1
```

---

## Rule 3 — Always Read Context Before Development

- Before starting any development task, **always read `context.md`** to understand the project vision, architecture, and constraints.
- Rules in `rules.md` must be kept in mind at all times during development.
- After every completed task, **`completedTasks.md` must be updated** with the task name and a short description of what was done.

---

## Summary Checklist (Before Every Task)

- [ ] Read `context.md` for project context
- [ ] Check `rules.md` for any relevant constraints
- [ ] Use `bun` as package manager
- [ ] Build only the current feature — no jumping ahead
- [ ] Test and verify before marking complete
- [ ] Update `completedTasks.md` after completion

