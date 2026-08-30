"use client";

import { useActionState, useEffect } from "react";
import { createInstituteAction, updateInstituteAction } from "@/actions/institute.actions";
import type { ActionResult } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormPendingReporter } from "@/components/modals/form-pending-reporter";
import { useReportFormModalPending } from "@/components/modals/form-modal-context";
import { useActionToast } from "@/hooks/use-action-toast";

export type InstituteFormData = {
  id: string;
  name: string;
  location: string;
  address: string | null;
  phone: string | null;
  logoUrl: string | null;
};

type InstituteFormProps = {
  institute?: InstituteFormData | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  formId?: string;
  hideActions?: boolean;
};

const initialState: ActionResult = { success: false };

export function InstituteForm({
  institute,
  onSuccess,
  onCancel,
  formId,
  hideActions,
}: InstituteFormProps) {
  const action = institute ? updateInstituteAction : createInstituteAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  useActionToast(state);
  useReportFormModalPending(pending);

  useEffect(() => {
    if (state.success) {
      onSuccess?.();
    }
  }, [state.success, onSuccess]);

  const showActions = !formId && !hideActions;

  return (
    <form action={formAction} id={formId} noValidate className="space-y-4">
      <FormPendingReporter />
      {institute ? <input type="hidden" name="id" value={institute.id} /> : null}

      {institute?.logoUrl ? (
        <div className="flex items-center gap-3">
          <img
            src={institute.logoUrl}
            alt=""
            className="h-14 w-14 rounded-lg border border-border object-cover"
          />
          <p className="text-xs text-muted-foreground">Upload a new logo to replace the current one.</p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="institute-name" required>
            Institute name
          </Label>
          <Input id="institute-name" name="name" defaultValue={institute?.name ?? ""} />
          <FieldError message={state.fieldErrors?.name?.[0]} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="institute-location" required>
            Location
          </Label>
          <Input
            id="institute-location"
            name="location"
            defaultValue={institute?.location ?? ""}
            placeholder="e.g. Colombo"
          />
          <FieldError message={state.fieldErrors?.location?.[0]} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="institute-phone">Phone (optional)</Label>
          <Input id="institute-phone" name="phone" defaultValue={institute?.phone ?? ""} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="institute-address">Address (optional)</Label>
          <Input id="institute-address" name="address" defaultValue={institute?.address ?? ""} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="institute-logo">Logo (optional)</Label>
          <Input id="institute-logo" name="logo" type="file" accept="image/*" />
        </div>
      </div>

      {state.message && !state.success ? (
        <p className="rounded-lg border border-border bg-muted px-3 py-2 text-sm">{state.message}</p>
      ) : null}

      {showActions ? (
        <div className={onCancel ? "grid grid-cols-2 gap-2" : "flex"}>
          {onCancel ? (
            <Button type="button" variant="outline" className="rounded-[4px]" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
          <Button type="submit" className="rounded-[4px]" disabled={pending}>
            {pending ? "Saving..." : institute ? "Update institute" : "Create institute"}
          </Button>
        </div>
      ) : null}
    </form>
  );
}
