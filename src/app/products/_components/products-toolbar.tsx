"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Status = "active" | "archived" | "all";

interface ProductsToolbarProps {
  categories: string[];
  initialQ: string;
  initialCategory: string;
  initialStatus: Status;
}

export function ProductsToolbar({
  categories,
  initialQ,
  initialCategory,
  initialStatus,
}: ProductsToolbarProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState<string | null>(
    initialCategory || null
  );
  const [status, setStatus] = useState<Status>(initialStatus);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function buildUrl(overrides: {
    q?: string;
    category?: string | null;
    status?: Status;
  }) {
    const params = new URLSearchParams();
    const merged = {
      q,
      category,
      status,
      ...overrides,
    };
    if (merged.q) params.set("q", merged.q);
    if (merged.category) params.set("category", merged.category);
    if (merged.status !== "active") params.set("status", merged.status);
    return `/products?${params.toString()}`;
  }

  function handleQChange(value: string) {
    setQ(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      startTransition(() => {
        router.replace(buildUrl({ q: value }));
      });
    }, 300);
  }

  function handleCategoryChange(value: string | null) {
    setCategory(value);
    startTransition(() => {
      router.replace(buildUrl({ category: value }));
    });
  }

  function handleStatusChange(value: string) {
    const s = value as Status;
    setStatus(s);
    startTransition(() => {
      router.replace(buildUrl({ status: s }));
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search products…"
          value={q}
          onChange={(e) => handleQChange(e.target.value)}
          className="pl-8 w-56"
        />
      </div>

      <Select
        value={category}
        onValueChange={(v) => handleCategoryChange(v)}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {category && (
        <button
          onClick={() => handleCategoryChange(null)}
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
        >
          Clear
        </button>
      )}

      <Tabs value={status} onValueChange={handleStatusChange}>
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
