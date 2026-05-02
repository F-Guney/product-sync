Implement the import pipeline.

1. src/inngest/client.ts: export `inngest = new Inngest({ id: "product-import-case" })`.
2. src/lib/dummyjson.ts: typed fetch helpers `fetchProductsPage(skip, limit, delayMs?)` and `fetchTotal()`. Validate response with Zod (only fields we persist — be lenient, store the rest in `raw`). Support an optional `delayMs` query param so we can simulate slowness in demos.
3. src/inngest/functions/import-products.ts:
    - Trigger event: "products/import.requested" with { jobId }.
    - Concurrency: { limit: 2 } so two concurrent imports max.
    - Retries: 3 (default).
    - Body:
      a. step.run("load-job"): fetch ImportJob by id, mark RUNNING + startedAt, fetch total from dummyjson, write totalItems and totalChunks.
      b. Compute chunk list [{ skip, limit }, ...]. limit = job.chunkSize.
      c. for each chunk: step.run(`fetch-chunk-${i}`, async () => fetchProductsPage + prisma upsertMany). On any chunk's terminal failure (after retries), write an ImportEvent with level=error and increment failed; do NOT throw — continue.
      d. step.run("finalize"): set status = SUCCEEDED if failed===0, PARTIAL if failed<total, FAILED if processed===0. Set finishedAt.
    - Inside each step, also write an ImportEvent (level=info) so the job-detail page has a real audit log.
4. src/app/api/inngest/route.ts: `import { serve } from "inngest/next"` + export GET, POST, PUT.
5. src/actions/imports.ts: `triggerImport(formData)` Server Action — zod-validate { source, chunkSize }, create ImportJob row with status=PENDING, send the inngest event, revalidatePath("/imports"), return jobId.
6. src/app/api/jobs/[id]/route.ts: GET that returns the job + last 50 events as JSON. This is the polling endpoint.

Test locally with `npx inngest-cli dev` and document the exact command in the README. Commit as "feat: durable import pipeline with inngest step functions, retries, partial-failure tolerance".