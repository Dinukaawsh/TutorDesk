"use client";

import * as React from "react";
import { AppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  onSave?: () => void;
  onCancel?: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  saveDisabled?: boolean;
  formId?: string;
  size?: "default" | "lg";
};

export function FormModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  onSave,
  onCancel,
  saveLabel = "Save",
  cancelLabel = "Cancel",
  loading = false,
  saveDisabled = false,
  formId,
  size = "default",
}: FormModalProps) {
  const showFooter = Boolean(onSave || formId);

  function handleCancel() {
    onCancel?.();
    onOpenChange(false);
  }

  const body = (
    <div className={cn("space-y-4", className)}>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      {children}
    </div>
  );

  if (!showFooter) {
    return (
      <AppModal open={open} onOpenChange={onOpenChange} title={title} size={size}>
        {body}
      </AppModal>
    );
  }

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      size={size}
      footer={
        <>
          <Button type="button" variant="outline" disabled={loading} onClick={handleCancel}>
            {cancelLabel}
          </Button>
          <Button
            type={formId ? "submit" : "button"}
            form={formId}
            disabled={loading || saveDisabled}
            onClick={formId ? undefined : onSave}
          >
            {loading ? "Saving..." : saveLabel}
          </Button>
        </>
      }
    >
      {body}
    </AppModal>
  );
}