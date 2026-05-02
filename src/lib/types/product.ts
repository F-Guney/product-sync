import { z } from "zod";

const DimensionsSchema = z.object({
  width: z.number().optional(),
  height: z.number().optional(),
  depth: z.number().optional(),
});

const ReviewSchema = z.object({
  rating: z.number(),
  comment: z.string(),
  date: z.string(),
  reviewerName: z.string(),
  reviewerEmail: z.string(),
});

const MetaSchema = z.object({
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  barcode: z.string().optional(),
  qrCode: z.string().optional(),
});

export const RawProductSchema = z.object({
  dimensions: DimensionsSchema.optional(),
  reviews: z.array(ReviewSchema).optional(),
  meta: MetaSchema.optional(),
  returnPolicy: z.string().optional(),
  warrantyInformation: z.string().optional(),
  shippingInformation: z.string().optional(),
  availabilityStatus: z.string().optional(),
  minimumOrderQuantity: z.number().optional(),
  weight: z.number().optional(),
  discountPercentage: z.number().optional(),
});

export type RawProduct = z.infer<typeof RawProductSchema>;

export function parseRawProduct(raw: unknown): RawProduct {
  const result = RawProductSchema.safeParse(raw);
  return result.success ? result.data : {};
}
