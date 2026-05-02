import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

import { JobDetail } from "../_components/job-detail";

export const metadata = {
  title: "Import job — Product Sync",
};

export default async function ImportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await prisma.importJob.findUnique({
    where: { id },
    include: {
      events: {
        orderBy: { createdAt: "desc" },
        take: 200,
      },
    },
  });
  if (!job) notFound();

  return (
    <main className="flex flex-col gap-4 p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">Import job</h1>
          <p className="font-mono text-xs text-muted-foreground">{job.id}</p>
        </div>
        <Link
          href="/imports"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          ← All imports
        </Link>
      </div>

      <JobDetail initialJob={job} />
    </main>
  );
}
