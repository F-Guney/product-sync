"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const IdsSchema = z.array(z.number().int()).min(1);
const CategorySchema = z.string().min(1).max(64);

export async function bulkArchive(
  ids: number[]
): Promise<{ ok: boolean; affected: number }> {
  IdsSchema.parse(ids);
  const [result] = await prisma.$transaction([
    prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { archivedAt: new Date() },
    }),
  ]);
  revalidatePath("/products");
  return { ok: true, affected: result.count };
}

export async function bulkRestore(
  ids: number[]
): Promise<{ ok: boolean; affected: number }> {
  IdsSchema.parse(ids);
  const [result] = await prisma.$transaction([
    prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { archivedAt: null },
    }),
  ]);
  revalidatePath("/products");
  return { ok: true, affected: result.count };
}

export async function bulkChangeCategory(
  ids: number[],
  category: string
): Promise<{ ok: boolean; affected: number }> {
  IdsSchema.parse(ids);
  CategorySchema.parse(category);
  const [result] = await prisma.$transaction([
    prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { category },
    }),
  ]);
  revalidatePath("/products");
  return { ok: true, affected: result.count };
}

export async function bulkDelete(
  ids: number[]
): Promise<{ ok: boolean; affected: number }> {
  IdsSchema.parse(ids);
  const [result] = await prisma.$transaction([
    prisma.product.deleteMany({ where: { id: { in: ids } } }),
  ]);
  revalidatePath("/products");
  return { ok: true, affected: result.count };
}
