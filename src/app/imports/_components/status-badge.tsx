import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { JobStatusName } from "@/lib/constants";

interface StatusBadgeProps {
  status: JobStatusName;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  switch (status) {
    case "PENDING":
      return (
        <Badge variant="secondary" className={className}>
          Pending
        </Badge>
      );
    case "RUNNING":
      return (
        <Badge variant="default" className={cn("animate-pulse", className)}>
          Running
        </Badge>
      );
    case "SUCCEEDED":
      return (
        <Badge
          className={cn(
            "bg-emerald-600 text-white hover:bg-emerald-600",
            className,
          )}
        >
          Succeeded
        </Badge>
      );
    case "FAILED":
      return (
        <Badge variant="destructive" className={className}>
          Failed
        </Badge>
      );
    case "PARTIAL":
      return (
        <Badge
          className={cn(
            "bg-amber-500 text-white hover:bg-amber-500",
            className,
          )}
        >
          Partial
        </Badge>
      );
  }
}
