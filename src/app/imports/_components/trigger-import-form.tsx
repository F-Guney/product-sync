"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { triggerImport } from "@/actions/imports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TriggerImportForm() {
  const [pending, startTransition] = useTransition();
  const [advanced, setAdvanced] = useState(false);

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const res = await triggerImport(formData);
        if (res.ok) {
          toast.success("Import queued", { description: `Job ${res.jobId}` });
        }
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to queue import",
        );
      }
    });
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="source">Source</Label>
          <Input
            id="source"
            name="source"
            defaultValue="dummyjson"
            className="w-44"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="chunkSize">Chunk size</Label>
          <Input
            id="chunkSize"
            name="chunkSize"
            type="number"
            min={1}
            max={100}
            defaultValue={30}
            className="w-28"
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Queuing…" : "Trigger import"}
        </Button>
        <button
          type="button"
          onClick={() => setAdvanced((v) => !v)}
          className="ml-auto text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
          aria-expanded={advanced}
        >
          {advanced ? "Hide advanced" : "Advanced"}
        </button>
      </div>
      {advanced ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="simulateLatencyMs">
            Simulate slow API (ms per request)
          </Label>
          <Input
            id="simulateLatencyMs"
            name="simulateLatencyMs"
            type="number"
            min={0}
            max={10_000}
            placeholder="e.g., 500"
            className="w-44"
          />
          <p className="text-xs text-muted-foreground">
            Adds artificial latency to each DummyJSON fetch so live polling is
            observable in the demo.
          </p>
        </div>
      ) : null}
    </form>
  );
}
