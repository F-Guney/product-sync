## Ship

---
description: Lint, typecheck, build, and create a conventional commit. Use after each feature.
allowed-tools: Bash(pnpm *), Bash(git *)
---

Run `pnpm lint`, `pnpm typecheck`, `pnpm build` in sequence. If any fails, fix
and rerun. When all pass, run `git add -A`, then craft a Conventional Commits
message with type/scope from the diff. Commit body must end with:

Assisted-by: Claude Code

Then `git status` to confirm a clean tree.