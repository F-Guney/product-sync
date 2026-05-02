"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { formatDuration } from "./duration";
import { StatusBadge } from "./status-badge";
import type { JobDTO, JobEventDTO } from "./types";
import { useJobPoll } from "./use-job-poll";

interface JobDetailProps {
  initialJob: JobDTO;
}

export function JobDetail({ initialJob }: JobDetailProps) {
  const job = useJobPoll(initialJob);

  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="events">
          Events
          {job.events ? (
            <span className="ml-1 text-xs text-muted-foreground">
              ({job.events.length})
            </span>
          ) : null}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <Overview job={job} />
      </TabsContent>

      <TabsContent value="events">
        <EventsList events={job.events ?? []} />
      </TabsContent>
    </Tabs>
  );
}

function Overview({ job }: { job: JobDTO }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Stat label="Status">
          <StatusBadge status={job.status} />
        </Stat>
        <Stat label="Source">{job.source}</Stat>
        <Stat label="Chunk size" mono>
          {job.chunkSize}
        </Stat>
        <Stat label="Duration" mono>
          {formatDuration(job.startedAt, job.finishedAt)}
        </Stat>
        <Stat label="Processed" mono>
          {job.processed}
        </Stat>
        <Stat label="Failed" mono>
          <span className={job.failed > 0 ? "text-destructive" : undefined}>
            {job.failed}
          </span>
        </Stat>
        <Stat label="Total" mono>
          {job.totalItems ?? "—"}
        </Stat>
        <Stat label="Created" title={new Date(job.createdAt).toLocaleString()}>
          {new Date(job.createdAt).toLocaleString()}
        </Stat>
        <Stat
          label="Started"
          title={
            job.startedAt ? new Date(job.startedAt).toLocaleString() : undefined
          }
        >
          {job.startedAt ? new Date(job.startedAt).toLocaleString() : "—"}
        </Stat>
        <Stat
          label="Finished"
          title={
            job.finishedAt
              ? new Date(job.finishedAt).toLocaleString()
              : undefined
          }
        >
          {job.finishedAt ? new Date(job.finishedAt).toLocaleString() : "—"}
        </Stat>
      </div>

      {job.error ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Job error</CardTitle>
            <CardDescription>
              The terminal error recorded by the import pipeline.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs whitespace-pre-wrap break-words text-destructive">
              {job.error}
            </pre>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

interface StatProps {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
  title?: string;
}

function Stat({ label, children, mono, title }: StatProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border bg-card p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn("text-sm", mono && "font-mono")}
        title={title}
      >
        {children}
      </span>
    </div>
  );
}

function EventsList({ events }: { events: JobEventDTO[] }) {
  if (events.length === 0) {
    return (
      <div className="text-sm text-muted-foreground rounded-lg border bg-card p-6 text-center">
        No events yet.
      </div>
    );
  }
  return (
    <div className="rounded-lg border bg-card max-h-[60vh] overflow-auto">
      <ul className="divide-y">
        {events.map((ev) => (
          <li key={ev.id} className="flex flex-col gap-1 p-3 sm:flex-row sm:items-start sm:gap-3">
            <span
              className="text-xs font-mono text-muted-foreground sm:w-32 shrink-0"
              title={new Date(ev.createdAt).toLocaleString()}
            >
              {new Date(ev.createdAt).toLocaleTimeString()}
            </span>
            <EventLevelBadge level={ev.level} />
            <div className="flex-1 min-w-0">
              <p className="text-sm">{ev.message}</p>
              {ev.meta != null ? (
                <details className="mt-1">
                  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                    meta
                  </summary>
                  <pre className="mt-1 text-xs font-mono whitespace-pre-wrap break-words text-muted-foreground">
                    {JSON.stringify(ev.meta, null, 2)}
                  </pre>
                </details>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EventLevelBadge({ level }: { level: string }) {
  if (level === "error") {
    return <Badge variant="destructive">error</Badge>;
  }
  if (level === "warn") {
    return (
      <Badge className="bg-amber-500 text-white hover:bg-amber-500">
        warn
      </Badge>
    );
  }
  return <Badge variant="secondary">{level}</Badge>;
}
