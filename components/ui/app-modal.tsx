"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
          "max-w-[var(--modal-width)] gap-0 rounded-[var(--radius-md)] border border-border bg-card p-0 shadow-sm",
          size === "lg" && "max-w-[var(--modal-width-lg)]",
        )}
      >
        <DialogHeader className="space-y-0 border-b border-border px-4 py-3">
          <DialogTitle className="text-base font-semibold leading-tight">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="px-4 py-4">{children}</div>
        {footer ? (
          <div
            className={cn(
              "app-modal-footer px-4 pb-4",
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
