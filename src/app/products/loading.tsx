import { Skeleton } from "@/components/ui/skeleton";
import { ProductsTableSkeleton } from "./_components/products-table-skeleton";

export default function Loading() {
  return (
    <main className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-32" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-8 w-56" />
      </div>
      <ProductsTableSkeleton />
    </main>
  );
}
