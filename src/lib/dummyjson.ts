import { z } from "zod";

const BASE_URL = "https://dummyjson.com";

const DummyProductSchema = z
  .object({
    id: z.number().int(),
    title: z.string(),
    description: z.string(),
    category: z.string(),
    price: z.number(),
    rating: z.number(),
    stock: z.number().int(),
    brand: z.string().nullish(),
    sku: z.string().nullish(),
    thumbnail: z.string().nullish(),
    images: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
  })
  .passthrough();

const ProductsPageSchema = z.object({
  products: z.array(DummyProductSchema),
  total: z.number().int(),
  skip: z.number().int(),
  limit: z.number().int(),
});

const TotalSchema = z.object({ total: z.number().int() });

export type DummyProduct = z.infer<typeof DummyProductSchema>;
export type ProductsPage = z.infer<typeof ProductsPageSchema>;

function buildUrl(
  path: string,
  params: Record<string, string | number | undefined>,
): string {
  const url = new URL(path, BASE_URL);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  return url.toString();
}

export async function fetchProductsPage(
  skip: number,
  limit: number,
  delayMs?: number,
): Promise<ProductsPage> {
  const url = buildUrl("/products", { skip, limit, delay: delayMs });
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(
      `dummyjson products page failed: ${res.status} ${res.statusText}`,
    );
  }
  return ProductsPageSchema.parse(await res.json());
}

export async function fetchTotal(delayMs?: number): Promise<number> {
  const url = buildUrl("/products", {
    limit: 1,
    skip: 0,
    select: "id",
    delay: delayMs,
  });
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(
      `dummyjson total fetch failed: ${res.status} ${res.statusText}`,
    );
  }
  return TotalSchema.parse(await res.json()).total;
}
