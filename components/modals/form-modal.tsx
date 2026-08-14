"use client";

import * as React from "react";
import { AppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FormModalProvider, useFormModalPending } from "@/components/modals/form-modal-context";
import { ModalActionButtonContent } from "@/components/modals/modal-action-button-content";

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

function findChildFormId(node: React.ReactNode): string | undefined {
  let found: string | undefined;

  React.Children.forEach(node, (child) => {
    if (found || !React.isValidElement(child)) {
      return;
    }

    const props = child.props as { formId?: string; children?: React.ReactNode };

    if (typeof props.formId === "string" && props.formId.length > 0) {
      found = props.formId;
      return;
    }

    if (props.children) {
      found = findChildFormId(props.children);
    }
  });

  return found;
}

function FormModalShell({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  onSave,
  onCancel,
  saveLabel,
  cancelLabel,
  loading,
  saveDisabled,
  resolvedFormId,
  size,
  showFooter,
}: FormModalProps & { resolvedFormId?: string; showFooter: boolean }) {
  const ctx = useFormModalPending();
  const pending = loading || ctx?.pending === true;

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

  const footer = showFooter
    ? [
        <Button
          key="cancel"
          type="button"
          variant="outline"
          className="w-full"
          disabled={pending}
          onClick={handleCancel}
        >
          {cancelLabel ?? "Cancel"}
        </Button>,
        <Button
          key="save"
          type={resolvedFormId ? "submit" : "button"}
          form={resolvedFormId}
          className="w-full"
          disabled={pending || saveDisabled}
          onClick={resolvedFormId ? undefined : onSave}
        >
          <ModalActionButtonContent
            pending={pending}
            label={saveLabel ?? "Save"}
            pendingLabel="Please wait..."
          />
        </Button>,
      ]
    : undefined;

  return (
    <AppModal open={open} onOpenChange={onOpenChange} title={title} size={size} footer={footer}>
      {body}
    </AppModal>
  );
}

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
  const resolvedFormId = formId ?? findChildFormId(children);
  const showFooter = Boolean(onSave || resolvedFormId);

  return (
    <FormModalProvider open={open}>
      <FormModalShell
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        description={description}
        className={className}
        onSave={onSave}
        onCancel={onCancel}
        saveLabel={saveLabel}
        cancelLabel={cancelLabel}
        loading={loading}
        saveDisabled={saveDisabled}
        resolvedFormId={resolvedFormId}
        size={size}
        showFooter={showFooter}
      >
        {children}
      </FormModalShell>
    </FormModalProvider>
  );
}
