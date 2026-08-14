"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function flattenFooterItems(node: React.ReactNode): React.ReactNode[] {
  const items: React.ReactNode[] = [];

  React.Children.forEach(node, (child) => {
    if (child == null || child === false) {
      return;
    }

    if (React.isValidElement(child) && child.type === React.Fragment) {
      items.push(
        ...flattenFooterItems((child.props as { children?: React.ReactNode }).children),
      );
      return;
    }

    items.push(child);
  });

  return items;
}

export type AppModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "default" | "lg" | "xl";
};

export function AppModal({
  open,
  onOpenChange,
  title,
  children,
  footer,
  size = "default",
}: AppModalProps) {
  const footerItems = footer ? flattenFooterItems(footer) : [];
  const twoColumnFooter = footerItems.length === 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[min(90vh,680px)] max-w-[var(--modal-width)] flex-col gap-0 overflow-hidden rounded-[var(--radius-md)] border border-border bg-card p-0 shadow-sm",
          size === "lg" && "max-w-[var(--modal-width-lg)]",
          size === "xl" && "max-h-[var(--modal-max-height-xl)] max-w-[var(--modal-width-xl)]",
        )}
      >
        <DialogHeader className="relative shrink-0 space-y-0 border-b border-border px-4 py-3 pr-10">
          <DialogTitle className="text-base font-semibold leading-tight">
            {title}
          </DialogTitle>
          <DialogClose />
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto td-scrollbar px-4 py-4">
          {children}
        </div>
        {footerItems.length > 0 ? (
          <div
            className={cn(
              "shrink-0 border-t border-border px-4 py-3",
              twoColumnFooter ? "grid grid-cols-2 gap-2" : "flex flex-col gap-2",
            )}
          >
            {footerItems.map((item, index) =>
              React.isValidElement(item) ? (
                React.cloneElement(item, {
                  key: item.key ?? `footer-${index}`,
                } as { key: string })
              ) : (
                <React.Fragment key={`footer-${index}`}>{item}</React.Fragment>
              ),
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
