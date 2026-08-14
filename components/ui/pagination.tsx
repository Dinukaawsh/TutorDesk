"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const DEFAULT_PAGE_SIZE = 20;

type PaginationProps = {
  totalItems: number;
  page: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  className?: string;
};

function buildPageNumbers(current: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | "ellipsis")[] = [1];
  if (current > 3) pages.push("ellipsis");
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < totalPages - 2) pages.push("ellipsis");
  pages.push(totalPages);
  return pages;
}

export function Pagination({
  totalItems,
  page,
  onPageChange,
  pageSize = DEFAULT_PAGE_SIZE,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  if (totalItems <= pageSize) {
    return null;
  }

  const pages = buildPageNumbers(safePage, totalPages);

  return (
    <nav
      className={cn("flex flex-wrap items-center justify-center gap-1 pt-4", className)}
      aria-label="Pagination"
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-[var(--radius-md)]"
        disabled={safePage <= 1}
        onClick={() => onPageChange(safePage - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {pages.map((item, index) =>
        item === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-2 text-sm text-muted-foreground">
            ...
          </span>
        ) : (
          <Button
            key={item}
            type="button"
            variant={item === safePage ? "default" : "outline"}
            size="sm"
            className="min-w-9 rounded-[var(--radius-md)]"
            onClick={() => onPageChange(item)}
            aria-current={item === safePage ? "page" : undefined}
          >
            {item}
          </Button>
        ),
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-[var(--radius-md)]"
        disabled={safePage >= totalPages}
        onClick={() => onPageChange(safePage + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}

export { DEFAULT_PAGE_SIZE as PAGINATION_PAGE_SIZE };
