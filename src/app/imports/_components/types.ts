import type { JobStatusName } from "@/lib/constants";

export interface JobEventDTO {
  id: string;
  jobId: string;
  level: string;
  message: string;
  meta: unknown;
  createdAt: string | Date;
}

export interface JobDTO {
  id: string;
  source: string;
  status: JobStatusName;
  totalItems: number | null;
  processed: number;
  failed: number;
  chunkSize: number;
  startedAt: string | Date | null;
  finishedAt: string | Date | null;
  error: string | null;
  createdBy: string;
  createdAt: string | Date;
  events?: JobEventDTO[];
}
