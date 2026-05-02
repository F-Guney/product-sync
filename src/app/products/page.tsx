import { Suspense } from "react";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { ProductsToolbar } from "./_components/products-toolbar";
import { ProductsContent } from "./_components/products-content";
import { ProductsTableSkeleton } from "./_components/products-table-skeleton";

const SearchParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(["active", "archived", "all"]).default("active"),
});

function str(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const params = SearchParamsSchema.parse({
    page: str(raw.page),
    pageSize: str(raw.pageSize),
    q: str(raw.q),
    category: str(raw.category),
    status: str(raw.status),
  });

  const categories = await prisma.product.findMany({
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" },
  });

  return (
    <main className="flex flex-col gap-4 p-6 max-w-7xl mx-auto w-full">
      <h1 className="text-xl font-semibold">Products</h1>

      <ProductsToolbar
        categories={categories.map((c) => c.category)}
        initialQ={params.q ?? ""}
        initialCategory={params.category ?? ""}
        initialStatus={params.status}
      />

      <Suspense fallback={<ProductsTableSkeleton />}>
        <ProductsContent
          page={params.page}
          pageSize={params.pageSize}
          q={params.q}
          category={params.category}
          status={params.status}
        />
      </Suspense>
    </main>
  );
}
