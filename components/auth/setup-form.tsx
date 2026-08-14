"use client";

import { useActionState } from "react";
import { useActionToast } from "@/hooks/use-action-toast";
import { setupTeacherAction, type ActionResult } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionResult = { success: false };

export function SetupForm() {
  const [state, formAction, pending] = useActionState(
    setupTeacherAction,
    initialState,
  );
  useActionToast(state);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" required />
        {state.fieldErrors?.name?.[0] ? (
          <p className="text-sm text-black/70">{state.fieldErrors.name[0]}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
        {state.fieldErrors?.email?.[0] ? (
          <p className="text-sm text-black/70">{state.fieldErrors.email[0]}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="whatsapp">WhatsApp (optional)</Label>
        <Input id="whatsapp" name="whatsapp" placeholder="+91..." />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
        {state.fieldErrors?.password?.[0] ? (
          <p className="text-sm text-black/70">{state.fieldErrors.password[0]}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required />
        {state.fieldErrors?.confirmPassword?.[0] ? (
          <p className="text-sm text-black/70">
            {state.fieldErrors.confirmPassword[0]}
          </p>
        ) : null}
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