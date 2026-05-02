"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { inngest } from "@/inngest/client";
import { DEMO_USER_ID } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

const TriggerImportSchema = z.object({
  source: z.string().min(1).max(64).default("dummyjson"),
  chunkSize: z.coerce.number().int().min(1).max(100).default(30),
  simulateLatencyMs: z.coerce.number().int().min(0).max(10_000).optional(),
});

export async function triggerImport(
  formData: FormData,
): Promise<{ ok: boolean; jobId: string }> {
  const { source, chunkSize, simulateLatencyMs } = TriggerImportSchema.parse({
    source: formData.get("source") ?? undefined,
    chunkSize: formData.get("chunkSize") ?? undefined,
    simulateLatencyMs: formData.get("simulateLatencyMs") || undefined,
  });

  const job = await prisma.importJob.create({
    data: {
      source,
      chunkSize,
      status: "PENDING",
      createdBy: DEMO_USER_ID,
    },
  });

  await inngest.send({
    name: "products/import.requested",
    data: { jobId: job.id, simulateLatencyMs },
  });

  revalidatePath("/imports");
  return { ok: true, jobId: job.id };
}
