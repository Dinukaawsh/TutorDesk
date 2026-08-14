"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/layout/brand-logo";
import { cn } from "@/lib/utils";

export type SidebarItem = {
  href: string;
  label: string;
};

export const teacherSidebarItems: SidebarItem[] = [
  { href: "/teacher/dashboard", label: "Dashboard" },
  { href: "/teacher/students", label: "Students" },
  { href: "/teacher/subjects", label: "Subjects" },
];

type AppSidebarProps = {
  items: SidebarItem[];
};

export function AppSidebar({ items }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-white/80 p-4 backdrop-blur md:block">
      <BrandLogo className="mb-6 px-1" iconSize={28} />
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-white"
                  : "text-foreground hover:bg-muted",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
