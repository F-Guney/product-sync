import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { DataTable } from "./data-table";

interface ProductsContentProps {
  page: number;
  pageSize: number;
  q?: string;
  category?: string;
  status: "active" | "archived" | "all";
}

function buildWhere(params: Omit<ProductsContentProps, "page" | "pageSize">) {
  const { q, category, status } = params;
  return {
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" as const } },
        { brand: { contains: q, mode: "insensitive" as const } },
      ],
    }),
    ...(category && { category }),
    ...(status === "active" && { archivedAt: null }),
    ...(status === "archived" && {
      archivedAt: { not: null } as Prisma.DateTimeNullableFilter,
    }),
  };
}

export async function ProductsContent({
  page,
  pageSize,
  q,
  category,
  status,
}: ProductsContentProps) {
  const where = buildWhere({ q, category, status });

  const [products, total, allCategories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { id: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
    prisma.product.findMany({
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" },
    }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <DataTable
      data={products}
      categories={allCategories.map((c) => c.category)}
      pageCount={pageCount}
      currentPage={page}
      total={total}
    />
  );
}
