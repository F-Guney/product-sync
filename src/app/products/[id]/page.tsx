import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { parseRawProduct } from "@/lib/types/product";
import { formatDate, formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ImageCarousel } from "./_components/image-carousel";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) notFound();

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  const raw = parseRawProduct(product.raw);

  return (
    <main className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
      {/* Back nav */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" render={<Link href="/products" />}>
          <ArrowLeftIcon />
          Products
        </Button>

        <div className="flex items-center gap-2">
          {product.archivedAt && (
            <Badge variant="outline" className="text-muted-foreground">
              Archived
            </Badge>
          )}
        </div>
      </div>

      {/* Main 2-col layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left: carousel */}
        <ImageCarousel
          images={product.images.length > 0 ? product.images : product.thumbnail ? [product.thumbnail] : []}
          alt={product.title}
        />

        {/* Right: info */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{product.category}</Badge>
              {product.brand && (
                <span className="text-sm text-muted-foreground">
                  {product.brand}
                </span>
              )}
              {product.sku && (
                <span className="font-mono text-xs text-muted-foreground">
                  SKU: {product.sku}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-semibold">{product.title}</h1>
            {product.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          {/* Price & stock */}
          <div className="flex items-end gap-4">
            <span className="text-3xl font-bold font-mono">
              {formatPrice(product.price)}
            </span>
            {raw.discountPercentage && raw.discountPercentage > 0 && (
              <Badge variant="destructive" className="mb-1">
                -{raw.discountPercentage.toFixed(0)}%
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span>
              Stock:{" "}
              <Badge
                variant={
                  product.stock === 0
                    ? "destructive"
                    : product.stock < 10
                    ? "outline"
                    : "secondary"
                }
              >
                {product.stock}
              </Badge>
            </span>
            {raw.availabilityStatus && (
              <span className="text-muted-foreground">
                {raw.availabilityStatus}
              </span>
            )}
          </div>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <Separator />

          {/* Physical details */}
          {(raw.dimensions || raw.weight || raw.minimumOrderQuantity) && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {raw.dimensions?.width !== undefined && (
                <>
                  <span className="text-muted-foreground">Dimensions</span>
                  <span>
                    {raw.dimensions.width} × {raw.dimensions.height} ×{" "}
                    {raw.dimensions.depth} cm
                  </span>
                </>
              )}
              {raw.weight !== undefined && (
                <>
                  <span className="text-muted-foreground">Weight</span>
                  <span>{raw.weight} kg</span>
                </>
              )}
              {raw.minimumOrderQuantity !== undefined && (
                <>
                  <span className="text-muted-foreground">Min. order</span>
                  <span>{raw.minimumOrderQuantity} units</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Logistics cards */}
      {(raw.shippingInformation ||
        raw.warrantyInformation ||
        raw.returnPolicy) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {raw.shippingInformation && (
            <Card size="sm">
              <CardHeader>
                <CardTitle>Shipping</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {raw.shippingInformation}
                </p>
              </CardContent>
            </Card>
          )}
          {raw.warrantyInformation && (
            <Card size="sm">
              <CardHeader>
                <CardTitle>Warranty</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {raw.warrantyInformation}
                </p>
              </CardContent>
            </Card>
          )}
          {raw.returnPolicy && (
            <Card size="sm">
              <CardHeader>
                <CardTitle>Returns</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {raw.returnPolicy}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Reviews */}
      {raw.reviews && raw.reviews.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">
            Reviews ({raw.reviews.length})
          </h2>
          <div className="flex flex-col gap-3">
            {raw.reviews.map((review, i) => (
              <Card key={i} size="sm">
                <CardContent className="pt-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">
                        {review.reviewerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(review.date)}
                      </p>
                    </div>
                    <Badge variant="outline" className="font-mono">
                      {review.rating}/5
                    </Badge>
                  </div>
                  {review.comment && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {review.comment}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Meta */}
      {raw.meta && (
        <div className="flex flex-col gap-2 text-xs text-muted-foreground">
          {raw.meta.barcode && <span>Barcode: {raw.meta.barcode}</span>}
          {raw.meta.createdAt && (
            <span>Created: {formatDate(raw.meta.createdAt)}</span>
          )}
          {raw.meta.updatedAt && (
            <span>Updated: {formatDate(raw.meta.updatedAt)}</span>
          )}
        </div>
      )}
    </main>
  );
}
