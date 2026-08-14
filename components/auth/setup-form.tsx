"use client";

import { useActionState } from "react";
import { useActionToast } from "@/hooks/use-action-toast";
import { setupTeacherAction, type ActionResult } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

const initialState: ActionResult = { success: false };

export function SetupForm() {
  const [state, formAction, pending] = useActionState(
    setupTeacherAction,
    initialState,
  );
  useActionToast(state);

  return (
    <form action={formAction} noValidate className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" required>
          Full name
        </Label>
        <Input id="name" name="name" />
        <FieldError message={state.fieldErrors?.name?.[0]} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" required>
          Email
        </Label>
        <Input id="email" name="email" type="email" autoComplete="email" />
        <FieldError message={state.fieldErrors?.email?.[0]} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="whatsapp">WhatsApp (optional)</Label>
        <Input id="whatsapp" name="whatsapp" placeholder="+91..." />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" required>
          Password
        </Label>
        <PasswordInput id="password" name="password" />
        <FieldError message={state.fieldErrors?.password?.[0]} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" required>
          Confirm password
        </Label>
        <PasswordInput id="confirmPassword" name="confirmPassword" />
        <FieldError message={state.fieldErrors?.confirmPassword?.[0]} />
      </div>
      {state.message ? (
        <p className="rounded-lg border border-border bg-muted px-3 py-2 text-sm">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating account..." : "Create teacher account"}
      </Button>
    </form>
  );
}
