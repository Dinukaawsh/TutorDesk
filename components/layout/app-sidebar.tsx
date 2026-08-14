"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { t, type NavItem } from "@/content/navigation";
import { cn } from "@/lib/utils";

type AppSidebarProps = {
  items: NavItem[];
};

export function AppSidebar({ items }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-60 md:shrink-0 md:flex-col border-r border-border bg-white/80 backdrop-blur">
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto td-scrollbar p-3">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-white"
                  : "text-foreground hover:bg-muted",
              )}
            >
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
