# product-sync

Product catalogue sync tool built with Next.js, Prisma, Inngest, and DummyJSON.

## Stack

- **Next.js 16** (App Router, TypeScript strict mode)
- **Prisma 7 + Neon** (Postgres, serverless driver adapter)
- **Inngest** — durable background jobs with step retries
- **Tailwind v4 + shadcn/ui**
- **Zod** — runtime validation for actions, events, and external payloads

## Local setup

1. Copy `.env.example` to `.env.local` and fill in `DATABASE_URL` (Neon connection string) and, optionally, `INNGEST_EVENT_KEY` / `INNGEST_SIGNING_KEY` for cloud environments.

2. Push the schema to your dev database:

   ```bash
   pnpm db:push
   ```

3. Start the dev server:

   ```bash
   pnpm dev
   ```

## Importing products (Inngest)

The product-import pipeline runs as an Inngest durable function. In dev, run two processes side-by-side:

```bash
# 1. Next.js
pnpm dev

# 2. Inngest dev server, pointed at the local serve handler
npx inngest-cli@latest dev -u http://localhost:3000/api/inngest
```

Open the Inngest dev UI at <http://localhost:8288>. Trigger an import either by:

1. Calling `triggerImport` from the `/imports` page (once it exists) — it creates an `ImportJob` row and fires `products/import.requested`, or
2. Sending the event manually from the dev UI's **Send Event** panel with payload:

   ```json
   { "data": { "jobId": "<existing-importjob-id>" } }
   ```

   (Create an `ImportJob` row first via `pnpm db:seed` or a direct SQL insert with `status = 'PENDING'` and `createdBy = 'demo-user'`.)

Poll job progress at:

```
GET /api/jobs/<jobId>
```

Returns the job row plus the most recent 50 audit events. Status transitions: `PENDING → RUNNING → SUCCEEDED | PARTIAL | FAILED`.

## Verification

```bash
pnpm lint && pnpm typecheck && pnpm build
```
