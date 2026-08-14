"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type AppModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "default" | "lg";
};

export function AppModal({
  open,
  onOpenChange,
  title,
  children,
  footer,
  size = "default",
}: AppModalProps) {
  const footerCount = footer ? React.Children.count(footer) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[min(85vh,640px)] max-w-[var(--modal-width)] flex-col gap-0 overflow-hidden rounded-[var(--radius-md)] border border-border bg-card p-0 shadow-sm",
          size === "lg" && "max-w-[var(--modal-width-lg)]",
        )}
      >
        <DialogHeader className="shrink-0 space-y-0 border-b border-border px-4 py-3">
          <DialogTitle className="text-base font-semibold leading-tight">
            {title}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="td-scrollbar min-h-0 max-h-[50vh] flex-1">
          <div className="px-4 py-4">{children}</div>
        </ScrollArea>
        {footer ? (
          <div
            className={cn(
              "app-modal-footer shrink-0 border-t border-border px-4 py-3",
              footerCount === 2 && "app-modal-footer-two",
            )}
          >
            {footer}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
