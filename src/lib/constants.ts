export const DEMO_USER_ID = "demo-user";

export const JOB_STATUSES = [
  "PENDING",
  "RUNNING",
  "SUCCEEDED",
  "FAILED",
  "PARTIAL",
] as const;

export type JobStatusName = (typeof JOB_STATUSES)[number];

export const TERMINAL_JOB_STATUSES: ReadonlySet<JobStatusName> = new Set([
  "SUCCEEDED",
  "FAILED",
  "PARTIAL",
]);

export function isTerminalJobStatus(status: JobStatusName): boolean {
  return TERMINAL_JOB_STATUSES.has(status);
}
