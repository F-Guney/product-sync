## Summary

<!-- One paragraph: what changed and why. Link the issue / case-study criterion this PR satisfies. -->

## Changes

<!-- Bullet list of the substantive changes. File paths help reviewers. -->

-

## Verification

```bash
pnpm lint && pnpm typecheck && pnpm build
```

<!-- Paste the output (or a brief summary) so reviewers don't have to re-run it. -->

## AI-assisted work

- [ ] Plan was reviewed before code was written (plan-mode for ≥3-step changes)
- [ ] Commit body includes `Assisted-by: Claude Code` trailer
- [ ] Prompts and decisions are captured in `docs/`
- [ ] No agent-generated code shipped without a verification gate (typecheck / build / test)
- [ ] Subagents used for exploration & verification, not core implementation context

## Screenshots / recordings

<!-- Optional. Required for any UI change. -->
