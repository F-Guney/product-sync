"use client";

import { useEffect, useState } from "react";
import { isTerminalJobStatus } from "@/lib/constants";
import type { JobDTO } from "./types";

const DEFAULT_INTERVAL_MS = 2000;

export function useJobPoll(initial: JobDTO, intervalMs: number = DEFAULT_INTERVAL_MS): JobDTO {
  const [job, setJob] = useState<JobDTO>(initial);

  useEffect(() => {
    if (isTerminalJobStatus(job.status)) return;

    const ac = new AbortController();
    let cancelled = false;

    async function tick() {
      try {
        const res = await fetch(`/api/jobs/${initial.id}`, {
          signal: ac.signal,
          cache: "no-store",
        });
        if (!res.ok) return;
        const next = (await res.json()) as JobDTO;
        if (!cancelled) setJob(next);
      } catch {
        // aborted on unmount or transient network error — next tick will retry
      }
    }

    void tick();
    const handle = setInterval(tick, intervalMs);

    return () => {
      cancelled = true;
      ac.abort();
      clearInterval(handle);
    };
  }, [initial.id, job.status, intervalMs]);

  return job;
}
