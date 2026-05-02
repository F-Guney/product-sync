Build the product browsing UX.

1. src/app/products/page.tsx (Server Component): fetch products with prisma,
   paginate via searchParams (page, pageSize=20, q, category). Stream via
   Suspense — wrap the table in Suspense with a Skeleton fallback, and put an
2. src/app/products/loading.tsx: full-page skeleton.
3. src/app/products/_components/data-table.tsx + columns.tsx: TanStack Table
   with the official shadcn pattern — row-select checkbox column, sorting,
   column visibility, pagination controls. Columns: select, thumbnail, title,
   category (Badge), price, stock, rating, actions (DropdownMenu: View /
   Archive).
4. src/app/products/_components/bulk-action-bar.tsx: floating bar that
   appears when rows are selected; buttons: "Archive", "Restore", "Change
   category…" (Dialog with Select), "Delete permanently" (with confirm Dialog).
   Show selection count.
5. src/actions/products.ts: Server Actions `bulkArchive(ids: number[])`,
   `bulkRestore(ids)`, `bulkChangeCategory(ids, category)`, `bulkDelete(ids)`.
   Each: zod-validate input, run as a single prisma.$transaction with
   updateMany/deleteMany, call revalidatePath("/products"), return `{ ok,
  affected }`. Use useTransition + toast in the bulk bar for optimistic feel.
6. src/app/products/[id]/page.tsx: detail page rendering all rich fields
   (images carousel, dimensions, warranty, shipping, reviews list, returnPolicy,
   tags as Badges).

After building, run pnpm typecheck && pnpm build. Commit as "feat: product
list, detail, and bulk operations".