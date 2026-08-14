"use client";

import { useActionState } from "react";
import { useActionToast } from "@/hooks/use-action-toast";
import { changePasswordAction, type ActionResult } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionResult = { success: false };

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(
    changePasswordAction,
    initialState,
  );
  useActionToast(state);

  return (
    <form action={formAction} noValidate className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword" required>
          Current password
        </Label>
        <Input id="currentPassword" name="currentPassword" type="password" />
        <FieldError message={state.fieldErrors?.currentPassword?.[0]} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword" required>
          New password
        </Label>
        <Input id="newPassword" name="newPassword" type="password" />
        <FieldError message={state.fieldErrors?.newPassword?.[0]} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" required>
          Confirm new password
        </Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" />
        <FieldError message={state.fieldErrors?.confirmPassword?.[0]} />
      </div>
      {state.message ? (
        <p className="rounded-lg border border-border bg-muted px-3 py-2 text-sm">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}
