"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";

import { formatDuration, formatRelative } from "./duration";
import { StatusBadge } from "./status-badge";
import type { JobDTO } from "./types";
import { useJobPoll } from "./use-job-poll";

interface JobRowProps {
  initialJob: JobDTO;
}

export function JobRow({ initialJob }: JobRowProps) {
  const job = useJobPoll(initialJob);
  const created = new Date(job.createdAt);

  return (
    <TableRow>
      <TableCell title={created.toLocaleString()}>
        {formatRelative(created)}
      </TableCell>
      <TableCell>{job.source}</TableCell>
      <TableCell>
        <StatusBadge status={job.status} />
      </TableCell>
      <TableCell className="font-mono text-xs">
        {job.processed}
        {" / "}
        {job.totalItems ?? "—"}
        {job.failed > 0 ? (
          <span className="ml-2 text-destructive">({job.failed} failed)</span>
        ) : null}
      </TableCell>
      <TableCell className="font-mono text-xs">
        {formatDuration(job.startedAt, job.finishedAt)}
      </TableCell>
      <TableCell className="text-right">
        <Link
          href={`/imports/${job.id}`}
          className={buttonVariants({ size: "sm", variant: "ghost" })}
        >
          Details
        </Link>
      </TableCell>
    </TableRow>
  );
}
