# Product Import Case Study

A Next.js 16 application that imports products from DummyJSON into a Postgres
database with durable, observable, retryable background jobs. It also
demonstrates **how to manage an AI agent through a multi-feature delivery**.

🔗 **Live demo:** https://product-sync-delta.vercel.app

## What this demonstrates

| Evaluation criterion | Where to look |
|---|---|
| Handling long-running operations | `src/inngest/functions/import-products.ts` — chunked, step-isolated, retried |
| Slow / failing external services | Per-step exponential backoff (Inngest default), partial-failure tolerance (status `PARTIAL`), `?delay=` toggle in the trigger form proves it on the live site |
| Scaling with data volume | Chunked imports (default 30/req), `upsertMany`-style transactions, indexes on category and (jobId, createdAt) |
| Concurrent operations | Inngest concurrency cap of 2 imports, Prisma `$transaction` for bulk product mutations |
| Deployed working version | Vercel (URL above) |
| AI usage proof | `docs/` (chronological prompt log) · every commit body carries `Assisted-by: Claude Code` |

## Architecture (TL;DR)

Three deliberate scope cuts I want to call out:
1. **No real auth** — single demo user. Real apps would add Auth.js + per-user job scoping.
2. **No queue back-pressure tuning** — the Inngest free tier handles the case-study volume. For 100k+ products I'd add cursor-based pagination from the upstream API and a fan-out step.
3. **Polling, not websockets** — 2s polling on the imports page is good enough. Inngest's realtime channel would be the upgrade.

## Stack

Next.js 16 · TypeScript · Prisma 7 + Neon (Postgres, scale-to-zero) · Inngest
(durable jobs) · Tailwind v4 · shadcn/ui · TanStack Table · Zod · pnpm.

## Run locally

```bash
pnpm install
cp .env.example .env.local            # fill DATABASE_URL from Neon
pnpm db:push && pnpm db:seed
pnpm dev                              # terminal 1
npx inngest-cli@latest dev            # terminal 2 — opens http://localhost:8288
```

## How AI was managed (the meta-deliverable)

The graders emphasized "not which tool you used, but how you managed AI."
Here's my workflow, in order of leverage:

1. **A `CLAUDE.md`** sets architectural guardrails the agent revisits
   every session — instead of repeating instructions in every prompt.
2. **Plan mode for every architecturally significant change** (3 of 6 prompts).
   I review the plan before approving execution. This caught two design
   mistakes before any code was written.
3. **Six discrete prompts**, each ending in `pnpm typecheck && pnpm build` as
   the verification gate. One prompt = one commit = one auditable unit.
4. **Subagents for verification and exploration** so the main context stays
   focused on the current feature. This let me run a final "find stragglers"
   sweep without polluting the build context.
5. **Conventional Commits with `Assisted-by: Claude Code` trailer** so
   `git log --grep` reproduces the AI-assistance audit trail.

## Trade-offs I'd revisit with more time

- Replace polling with Inngest realtime channels.
- Add Auth.js + per-user RLS-style scoping in queries.
- Move bulk operations themselves to Inngest for >1k-row batches.
- E2E tests with Playwright; right now only `lib/dummyjson.ts` is unit-tested.
