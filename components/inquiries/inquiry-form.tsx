"use client";

import { useActionState, useEffect } from "react";
import {
  createInquiryAction,
  updateInquiryAction,
} from "@/actions/inquiry.actions";
import type { ActionResult } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";

type InquiryFormProps = {
  inquiry?: {
    id: string;
    title: string;
    body: string;
    attachmentUrls: string[];
  };
  onSuccess?: () => void;
  onCancel?: () => void;
};

const initial: ActionResult = { success: false };

export function InquiryForm({ inquiry, onSuccess, onCancel }: InquiryFormProps) {
  const action = inquiry ? updateInquiryAction : createInquiryAction;
  const [state, formAction, pending] = useActionState(action, initial);
  useActionToast(state);

  useEffect(() => {
    if (state.success) {
      onSuccess?.();
    }
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} noValidate className="space-y-4">
      {inquiry ? <input type="hidden" name="id" value={inquiry.id} /> : null}
      {inquiry?.attachmentUrls.map((url) => (
        <input key={url} type="hidden" name="keepAttachmentUrls" value={url} />
      ))}
      <div className="space-y-2">
        <Label htmlFor="inquiry-title" required>
          Title
        </Label>
        <Input
          id="inquiry-title"
          name="title"
          defaultValue={inquiry?.title ?? ""}
        />
        <FieldError message={state.fieldErrors?.title?.[0]} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="inquiry-body" required>
          Message
        </Label>
        <Textarea
          id="inquiry-body"
          name="body"
          rows={5}
          defaultValue={inquiry?.body ?? ""}
        />
        <FieldError message={state.fieldErrors?.body?.[0]} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="inquiry-attachments">Attachments (optional)</Label>
        <Input
          id="inquiry-attachments"
          name="attachments"
          type="file"
          multiple
          accept="application/pdf,image/jpeg,image/png,image/webp"
        />
        {inquiry?.attachmentUrls.length ? (
          <p className="text-xs text-muted-foreground">
            Existing files are kept unless you upload new ones.
          </p>
        ) : null}
      </div>
      {state.message && !state.success ? <p className="text-sm">{state.message}</p> : null}
      <div className="flex flex-wrap gap-2">
        {onCancel ? (
          <Button type="button" variant="outline" className="rounded-[4px]" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" className="rounded-[4px]" disabled={pending}>
          {pending ? "Saving..." : inquiry ? "Save changes" : "Submit inquiry"}
        </Button>
      </div>
    </form>
  );
}
