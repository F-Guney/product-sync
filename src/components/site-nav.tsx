"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/products", label: "Products" },
  { href: "/imports", label: "Imports" },
];

export function SiteNav() {
  const pathname = usePathname();
  return (
    <header className="border-b bg-background">
      <nav className="max-w-7xl mx-auto w-full px-6 h-14 flex items-center gap-6">
        <Link href="/" className="font-semibold">
          Product Sync
        </Link>
        <ul className="flex items-center gap-4">
          {LINKS.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "text-sm transition-colors",
                    active
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
