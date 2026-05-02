# Architecture

## Pipeline

```
┌──────────────┐    triggerImport()    ┌─────────────────────────────┐
│ Trigger form │ ─────────────────────▶│ Server Action (src/actions) │
│  /imports    │   FormData + Zod      │ creates ImportJob (PENDING) │
└──────────────┘                       └──────────────┬──────────────┘
                                                      │ inngest.send
                                                      ▼ products/import.requested
                         ┌────────────────────────────────────────────┐
                         │  importProducts  (concurrency: 2, retry 3) │
                         ├────────────────────────────────────────────┤
                         │  step.run('load-job') ─ fetchTotal, RUNNING│
                         │      │                                     │
                         │      ▼   for each chunk of 30              │
                         │  step.run('fetch-chunk-N')                 │
                         │     fetchProductsPage(skip, 30, delayMs)   │
                         │     prisma.$transaction(upsert × 30)       │
                         │     try/catch OUTSIDE step → PARTIAL ok    │
                         │      │                                     │
                         │      ▼                                     │
                         │  step.run('finalize') ─ SUCCEEDED|PARTIAL  │
                         └─────────────────────┬──────────────────────┘
                                               │
                 GET /api/jobs/[id] every 2s   ▼
                         ┌────────────────────────────────────────────┐
                         │  /imports & /imports/[id]  (live polling)  │
                         └────────────────────────────────────────────┘
```

## Handling slow / failing external APIs

The DummyJSON API is the single external dependency. Three layers absorb its
unreliability:

- **Per-step retries.** Every `step.run` block in
  `src/inngest/functions/import-products.ts` is retried up to 3 times by
  Inngest with exponential backoff (`retries: 3` on the function definition).
  A transient 5xx or timeout never reaches the user.
- **Partial-failure isolation.** The per-chunk `try/catch` lives **outside**
  `step.run` (lines 79–126). If one chunk exhausts its retries, the function
  records the failure on `ImportJob.failed` and continues with the next
  chunk. The terminal status becomes `PARTIAL` instead of `FAILED` — useful
  data is preserved.
- **Latency simulation, end-to-end.** `fetchProductsPage(skip, limit, delayMs)`
  in `src/lib/dummyjson.ts` (lines 50, 65) appends `?delay=` to the upstream
  call. The `simulateLatencyMs` field on the trigger form is threaded through
  the server action → Inngest event → fetch helper, so a reviewer can
  reproduce slow-API behaviour from the live site.

## Scaling to N products

- **Chunked work.** `chunkSize` defaults to 30 in `prisma/schema.prisma`.
  Each chunk is its own durable step, so the function can be paused, resumed,
  and retried at chunk granularity.
- **Batched writes.** Each chunk wraps its 30 upserts in a single
  `prisma.$transaction`, which costs one round-trip to Neon instead of 30.
- **Indexes that match access patterns.** `Product @@index([category])`
  (`prisma/schema.prisma:27`) backs the category filter on `/products`.
  `ImportEvent @@index([jobId, createdAt])` (line 55) keeps the event-log
  query under `/imports/[id]` cheap as the table grows.
- **Above 100k products** the upgrade path is cursor pagination from the
  upstream API plus a fan-out step that emits N `process-chunk` events in
  parallel. The current shape supports the change without refactoring the
  consumer.

## Concurrent operations

- **Job-level cap.** `importProducts` declares `concurrency: { limit: 2 }`
  (`src/inngest/functions/import-products.ts:37`). At most two import jobs
  run at once; the rest queue. This protects Neon's connection budget on
  the free tier.
- **Step-level retries.** `retries: 3` (line 38) gives every step independent
  backoff without re-running the whole function.
- **Bulk product mutations.** The four bulk actions in
  `src/actions/products.ts` (`bulkArchive`, `bulkRestore`,
  `bulkChangeCategory`, `bulkDelete`) all use `prisma.$transaction` so
  partial writes are impossible if a row constraint trips mid-batch.
