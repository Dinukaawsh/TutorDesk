"use client";

import { useActionState } from "react";
import { updateTeacherPasswordAction } from "@/actions/settings.actions";
import type { ActionResult } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useActionToast } from "@/hooks/use-action-toast";

const initialState: ActionResult = { success: false };

export function TeacherPasswordForm() {
  const [state, formAction, pending] = useActionState(updateTeacherPasswordAction, initialState);
  useActionToast(state);

  return (
    <form action={formAction} noValidate className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="teacher-current-password" required>
          Current password
        </Label>
        <Input
          id="teacher-current-password"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
        />
        <FieldError message={state.fieldErrors?.currentPassword?.[0]} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="teacher-new-password" required>
          New password
        </Label>
        <Input
          id="teacher-new-password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
        />
        <FieldError message={state.fieldErrors?.newPassword?.[0]} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="teacher-confirm-password" required>
          Confirm new password
        </Label>
        <Input
          id="teacher-confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
        />
        <FieldError message={state.fieldErrors?.confirmPassword?.[0]} />
      </div>
      {state.message && !state.success ? (
        <p className="rounded-lg border border-border bg-muted px-3 py-2 text-sm">{state.message}</p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <Spinner size="sm" />
            Updating...
          </span>
        ) : (
          "Update password"
        )}
      </Button>
    </form>
  );
}
