import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEMO_USER_ID } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

import { JobRow } from "./_components/job-row";
import { TriggerImportForm } from "./_components/trigger-import-form";

export const metadata = {
  title: "Imports — Product Sync",
};

export const dynamic = "force-dynamic";

export default async function ImportsPage() {
  const jobs = await prisma.importJob.findMany({
    where: { createdBy: DEMO_USER_ID },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="flex flex-col gap-4 p-6 max-w-7xl mx-auto w-full">
      <h1 className="text-xl font-semibold">Imports</h1>

      <TriggerImportForm />

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Created</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-8"
                >
                  No imports yet. Trigger one above to get started.
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => <JobRow key={job.id} initialJob={job} />)
            )}
          </TableBody>
        </Table>
      </Card>
    </main>
  );
}
