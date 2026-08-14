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

const initialState: ActionResult = { success: false };
const FORM_ID = "confirm-modal-form";

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
  } = props;

  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) {
      setReason("");
    }
  }, [open]);

  const [state, action, formPending] = useActionState(
    isFormProps(props) ? props.formAction : async () => initialState,
    initialState,
  );

  useActionToast(state);

  useEffect(() => {
    if (isFormProps(props) && state.success) {
      props.onSuccess?.();
      onOpenChange(false);
    }
  }, [state.success, onOpenChange, props]);

  const pending = isFormProps(props)
    ? props.pending ?? formPending
    : props.loading ?? props.pending ?? false;

  const noteField = isFormProps(props) ? props.note : undefined;
  const formChildren = isFormProps(props) ? props.children : null;
  const bodyText = message ?? description;

  const showReasonField = !isFormProps(props) && props.showReason === true;
  const reasonInvalid =
    showReasonField && props.reasonRequired === true && reason.trim().length === 0;

  async function handleCallbackConfirm() {
    if (isFormProps(props) || reasonInvalid || pending) {
      return;
    }
    await props.onConfirm(showReasonField ? reason.trim() : undefined);
  }

  const footer = (
    <>
      <Button type="button" variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>
        {cancelLabel}
      </Button>
      {isFormProps(props) ? (
        <Button type="submit" form={FORM_ID} variant={confirmVariant} disabled={pending}>
          {pending ? "Please wait..." : confirmLabel}
        </Button>
      ) : (
        <Button
          type="button"
          variant={confirmVariant}
          disabled={pending || reasonInvalid}
          onClick={() => void handleCallbackConfirm()}
        >
          {pending ? "Please wait..." : confirmLabel}
        </Button>
      )}
    </>
  );

  const fields = (
    <>
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
      {formChildren}
      {state.message && !state.success && isFormProps(props) ? (
        <p className="text-sm text-muted-foreground">{state.message}</p>
      ) : null}
    </>
  );

  return (
    <AppModal open={open} onOpenChange={onOpenChange} title={title} footer={footer}>
      {isFormProps(props) ? (
        <form id={FORM_ID} action={action} className="space-y-4">
          {fields}
        </form>
      ) : (
        <div className="space-y-4">{fields}</div>
      )}
    </AppModal>
  );
}