"use client";

import * as React from "react";
import { AppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";

type ViewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  closeLabel?: string;
  footer?: React.ReactNode;
  size?: "default" | "lg" | "large";
};

export function ViewModal({
  open,
  onOpenChange,
  title,
  children,
  closeLabel = "Close",
  footer,
  size = "lg",
}: ViewModalProps) {
  const modalSize = size === "large" ? "lg" : size;

  const resolvedFooter =
    footer ?? (
      <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
        {closeLabel}
      </Button>
    );

  return (
    <AppModal open={open} onOpenChange={onOpenChange} title={title} size={modalSize} footer={resolvedFooter}>
      <div className="max-h-[70vh] space-y-3 overflow-y-auto text-sm text-foreground">{children}</div>
    </AppModal>
  );
}