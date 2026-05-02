"use client";

import Link from "next/link";
import Image from "next/image";
import { useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { Product } from "@prisma/client";
import { MoreHorizontalIcon, StarIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatPrice } from "@/lib/format";
import { bulkArchive, bulkRestore } from "@/actions/products";

function ActionsCell({ product }: { product: Product }) {
  const [isPending, startTransition] = useTransition();

  function archive() {
    startTransition(async () => {
      const res = await bulkArchive([product.id]).catch((e: unknown) => {
        toast.error(e instanceof Error ? e.message : "Archive failed");
        return null;
      });
      if (res) toast.success("Product archived");
    });
  }

  function restore() {
    startTransition(async () => {
      const res = await bulkRestore([product.id]).catch((e: unknown) => {
        toast.error(e instanceof Error ? e.message : "Restore failed");
        return null;
      });
      if (res) toast.success("Product restored");
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" disabled={isPending} />}
      >
        <MoreHorizontalIcon />
        <span className="sr-only">Actions</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem render={<Link href={`/products/${product.id}`} />}>
          View
        </DropdownMenuItem>
        {product.archivedAt ? (
          <DropdownMenuItem onClick={restore}>Restore</DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={archive}>Archive</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns: ColumnDef<Product>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
        }
        onCheckedChange={(checked) =>
          table.toggleAllPageRowsSelected(checked === true)
        }
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(checked === true)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "thumbnail",
    header: "",
    cell: ({ row }) => {
      const src = row.original.thumbnail;
      if (!src) {
        return <div className="size-10 rounded bg-muted" />;
      }
      return (
        <Image
          src={src}
          alt={row.original.title}
          width={40}
          height={40}
          className="size-10 rounded object-cover"
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <Link
        href={`/products/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.original.category}</Badge>
    ),
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right">Price</div>,
    cell: ({ row }) => (
      <div className="text-right font-mono text-xs">
        {formatPrice(row.original.price)}
      </div>
    ),
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => {
      const stock = row.original.stock;
      const variant =
        stock === 0 ? "destructive" : stock < 10 ? "outline" : "secondary";
      return <Badge variant={variant}>{stock}</Badge>;
    },
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-xs">
        <StarIcon className="size-3 text-yellow-500 fill-yellow-500" />
        {row.original.rating.toFixed(1)}
      </div>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <ActionsCell product={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
];
