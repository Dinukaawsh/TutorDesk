"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type BottomActionBarProps = {
  open: boolean;
  children: React.ReactNode;
  className?: string;
};

export function BottomActionBar({ open, children, className }: BottomActionBarProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 pb-6">
      <div
        className={cn(
          "pointer-events-auto w-full max-w-lg animate-in slide-in-from-bottom-4 rounded-xl border border-border bg-white p-4 shadow-lg",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
