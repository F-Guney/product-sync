"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/prisma";

const DEMO_USER_ID = "demo-user";

const TriggerImportSchema = z.object({
  source: z.string().min(1).max(64).default("dummyjson"),
  chunkSize: z.coerce.number().int().min(1).max(100).default(30),
});

export async function triggerImport(
  formData: FormData,
): Promise<{ ok: boolean; jobId: string }> {
  const { source, chunkSize } = TriggerImportSchema.parse({
    source: formData.get("source") ?? undefined,
    chunkSize: formData.get("chunkSize") ?? undefined,
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
    data: { jobId: job.id },
  });

  revalidatePath("/imports");
  return { ok: true, jobId: job.id };
}
