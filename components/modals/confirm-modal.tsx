"use client";

import * as React from "react";
import { useActionState, useEffect, useState } from "react";
import type { ActionResult } from "@/actions/auth.actions";
import { AppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useActionToast } from "@/hooks/use-action-toast";
import { ModalActionButtonContent } from "@/components/modals/modal-action-button-content";

const initialState: ActionResult = { success: false };

export type ConfirmNoteField = {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  multiline?: boolean;
};

type ConfirmModalBase = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "default" | "destructive";
  formId?: string;
};

type ConfirmModalFormProps = ConfirmModalBase & {
  formAction: (prev: ActionResult | undefined, formData: FormData) => Promise<ActionResult>;
  note?: ConfirmNoteField;
  pending?: boolean;
  onSuccess?: () => void;
  children?: React.ReactNode;
  onConfirm?: never;
  loading?: never;
  showReason?: never;
  reasonRequired?: never;
  reasonLabel?: never;
};

type ConfirmModalCallbackProps = ConfirmModalBase & {
  onConfirm: (reason?: string) => void | Promise<void>;
  loading?: boolean;
  pending?: boolean;
  showReason?: boolean;
  reasonRequired?: boolean;
  reasonLabel?: string;
  formAction?: never;
  note?: never;
  onSuccess?: never;
  children?: never;
};

export type ConfirmModalProps = ConfirmModalFormProps | ConfirmModalCallbackProps;

function isFormProps(props: ConfirmModalProps): props is ConfirmModalFormProps {
  return typeof (props as ConfirmModalFormProps).formAction === "function";
}

type ConfirmModalFormBodyProps = ConfirmModalFormProps & {
  formId: string;
  onClose: () => void;
};

function ConfirmModalFormBody({
  open,
  onOpenChange,
  title,
  message,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "default",
  formAction,
  note,
  pending: pendingProp,
  onSuccess,
  children,
  formId,
  onClose,
}: ConfirmModalFormBodyProps) {
  const [state, action, formPending] = useActionState(formAction, initialState);
  useActionToast(state);

  const pending = pendingProp ?? formPending;
  const bodyText = message ?? description;
  const noteField = note;

  useEffect(() => {
    if (state.success) {
      onSuccess?.();
      onClose();
    }
  }, [state.success, onSuccess, onClose]);

  const footer = [
    <Button
      key="cancel"
      type="button"
      variant="outline"
      className="w-full"
      disabled={pending}
      onClick={() => onOpenChange(false)}
    >
      {cancelLabel}
    </Button>,
    <Button
      key="confirm"
      type="submit"
      form={formId}
      className="w-full"
      variant={confirmVariant}
      disabled={pending}
    >
      <ModalActionButtonContent pending={pending} label={confirmLabel} pendingLabel="Please wait..." />
    </Button>,
  ];

  return (
    <AppModal open={open} onOpenChange={onOpenChange} title={title} footer={footer}>
      <form id={formId} action={action} className="space-y-4">
        {bodyText ? <p className="text-sm text-foreground">{bodyText}</p> : null}
        {noteField ? (
          <div className="space-y-2">
            <Label htmlFor={`confirm-note-${noteField.name}`}>{noteField.label}</Label>
            {noteField.multiline !== false ? (
              <Textarea
                id={`confirm-note-${noteField.name}`}
                name={noteField.name}
                rows={noteField.rows ?? 3}
                required={noteField.required}
                placeholder={noteField.placeholder}
                disabled={pending}
              />
            ) : (
              <Input
                id={`confirm-note-${noteField.name}`}
                name={noteField.name}
                required={noteField.required}
                placeholder={noteField.placeholder}
                disabled={pending}
              />
            )}
            {state.fieldErrors?.[noteField.name]?.[0] ? (
              <p className="text-sm text-muted-foreground">{state.fieldErrors[noteField.name][0]}</p>
            ) : null}
          </div>
        ) : null}
        {children}
        {state.message && !state.success ? (
          <p className="text-sm text-muted-foreground">{state.message}</p>
        ) : null}
      </form>
    </AppModal>
  );
}

export function ConfirmModal(props: ConfirmModalProps) {
  const {
    open,
    onOpenChange,
    title,
    message,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    confirmVariant = "default",
    formId: formIdProp,
  } = props;

  const [reason, setReason] = useState("");
  const [formSession, setFormSession] = useState(0);

  useEffect(() => {
    if (!open) {
      setReason("");
      return;
    }
    if (isFormProps(props)) {
      setFormSession((value) => value + 1);
    }
  }, [open, props]);

  const showReasonField = !isFormProps(props) && props.showReason === true;
  const reasonInvalid =
    showReasonField && props.reasonRequired === true && reason.trim().length === 0;
  const pending = isFormProps(props)
    ? props.pending ?? false
    : props.loading ?? props.pending ?? false;

  async function handleCallbackConfirm() {
    if (isFormProps(props) || reasonInvalid || pending) {
      return;
    }
    await props.onConfirm(showReasonField ? reason.trim() : undefined);
  }

  if (isFormProps(props)) {
    const formId = formIdProp ?? `confirm-modal-form-${formSession}`;
    return (
      <ConfirmModalFormBody
        key={formSession}
        {...props}
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        message={message}
        description={description}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        confirmVariant={confirmVariant}
        formId={formId}
        onClose={() => onOpenChange(false)}
      />
    );
  }

  const bodyText = message ?? description;
  const footer = [
    <Button
      key="cancel"
      type="button"
      variant="outline"
      className="w-full"
      disabled={pending}
      onClick={() => onOpenChange(false)}
    >
      {cancelLabel}
    </Button>,
    <Button
      key="confirm"
      type="button"
      className="w-full"
      variant={confirmVariant}
      disabled={pending || reasonInvalid}
      onClick={() => void handleCallbackConfirm()}
    >
      <ModalActionButtonContent pending={pending} label={confirmLabel} pendingLabel="Please wait..." />
    </Button>,
  ];

  return (
    <AppModal open={open} onOpenChange={onOpenChange} title={title} footer={footer}>
      <div className="space-y-4">
        {bodyText ? <p className="text-sm text-foreground">{bodyText}</p> : null}
        {showReasonField ? (
          <div className="space-y-2">
            <Label htmlFor="confirm-modal-reason">{props.reasonLabel ?? "Reason"}</Label>
            <Textarea
              id="confirm-modal-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              required={props.reasonRequired}
              disabled={pending}
            />
          </div>
        ) : null}
      </div>
    </AppModal>
  );
}
