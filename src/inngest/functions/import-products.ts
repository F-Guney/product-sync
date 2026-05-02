import { JobStatus, Prisma } from "@prisma/client";
import { eventType, staticSchema } from "inngest";

import { fetchProductsPage, fetchTotal, type DummyProduct } from "@/lib/dummyjson";
import { prisma } from "@/lib/prisma";

import { inngest } from "../client";

const importRequestedEvent = eventType("products/import.requested" as const, {
  schema: staticSchema<{ jobId: string; simulateLatencyMs?: number }>(),
});

function productWriteFromDummy(
  p: DummyProduct,
): Prisma.ProductUncheckedCreateInput {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    category: p.category,
    price: p.price,
    rating: p.rating,
    stock: p.stock,
    brand: p.brand ?? null,
    sku: p.sku ?? null,
    thumbnail: p.thumbnail ?? null,
    images: p.images,
    tags: p.tags,
    raw: p as unknown as Prisma.InputJsonValue,
  };
}

export const importProducts = inngest.createFunction(
  {
    id: "import-products",
    triggers: [importRequestedEvent],
    concurrency: { limit: 2 },
    retries: 3,
  },
  async ({ event, step }) => {
    const { jobId, simulateLatencyMs } = event.data;

    // a. Load job, fetch total, mark RUNNING, write start audit event.
    const { totalItems, chunkSize } = await step.run("load-job", async () => {
      const job = await prisma.importJob.findUniqueOrThrow({
        where: { id: jobId },
      });
      const total = await fetchTotal(simulateLatencyMs);
      const totalChunks = Math.ceil(total / job.chunkSize);
      await prisma.$transaction([
        prisma.importJob.update({
          where: { id: jobId },
          data: {
            status: JobStatus.RUNNING,
            startedAt: new Date(),
            totalItems: total,
          },
        }),
        prisma.importEvent.create({
          data: {
            jobId,
            level: "info",
            message: `Starting import: ${total} products in ${totalChunks} chunks of ${job.chunkSize}`,
            meta: { total, totalChunks, chunkSize: job.chunkSize },
          },
        }),
      ]);
      return { totalItems: total, chunkSize: job.chunkSize };
    });

    // b. Compute chunk list at runtime (no totalChunks column in schema).
    const chunks: { skip: number; limit: number }[] = [];
    for (let skip = 0; skip < totalItems; skip += chunkSize) {
      chunks.push({ skip, limit: Math.min(chunkSize, totalItems - skip) });
    }

    // c. Per-chunk fetch + upsert. try/catch is OUTSIDE step.run so a chunk's
    //    terminal failure does not abort the run — CLAUDE.md §Inngest.
    for (let i = 0; i < chunks.length; i++) {
      const { skip, limit } = chunks[i];
      try {
        await step.run(`fetch-chunk-${i}`, async () => {
          const page = await fetchProductsPage(skip, limit, simulateLatencyMs);
          await prisma.$transaction([
            ...page.products.map((p) =>
              prisma.product.upsert({
                where: { id: p.id },
                create: productWriteFromDummy(p),
                update: productWriteFromDummy(p),
              }),
            ),
            prisma.importJob.update({
              where: { id: jobId },
              data: { processed: { increment: page.products.length } },
            }),
            prisma.importEvent.create({
              data: {
                jobId,
                level: "info",
                message: `Chunk ${i + 1}/${chunks.length} ok: ${page.products.length} products [skip=${skip}, limit=${limit}]`,
                meta: { chunkIndex: i, skip, limit, count: page.products.length },
              },
            }),
          ]);
          return { count: page.products.length };
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        await step.run(`record-chunk-${i}-failure`, async () => {
          await prisma.$transaction([
            prisma.importJob.update({
              where: { id: jobId },
              data: { failed: { increment: limit } },
            }),
            prisma.importEvent.create({
              data: {
                jobId,
                level: "error",
                message: `Chunk ${i + 1}/${chunks.length} failed after retries: ${message}`,
                meta: { chunkIndex: i, skip, limit, error: message },
              },
            }),
          ]);
        });
      }
    }

    // d. Finalize: determine terminal status and write summary event.
    await step.run("finalize", async () => {
      const job = await prisma.importJob.findUniqueOrThrow({
        where: { id: jobId },
      });
      const status: JobStatus =
        job.failed === 0
          ? JobStatus.SUCCEEDED
          : job.processed === 0
            ? JobStatus.FAILED
            : JobStatus.PARTIAL;
      const level =
        status === JobStatus.SUCCEEDED
          ? "info"
          : status === JobStatus.PARTIAL
            ? "warn"
            : "error";
      await prisma.$transaction([
        prisma.importJob.update({
          where: { id: jobId },
          data: { status, finishedAt: new Date() },
        }),
        prisma.importEvent.create({
          data: {
            jobId,
            level,
            message: `Job ${status}: processed=${job.processed} failed=${job.failed} of ${job.totalItems ?? "?"}`,
            meta: {
              status,
              processed: job.processed,
              failed: job.failed,
              totalItems: job.totalItems,
            },
          },
        }),
      ]);
    });
  },
);
