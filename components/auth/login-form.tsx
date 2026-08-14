"use client";

import { useActionState } from "react";
import { FiLock, FiMail } from "react-icons/fi";
import { useActionToast } from "@/hooks/use-action-toast";
import { loginAction, type ActionResult } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

const initialState: ActionResult = { success: false };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  useActionToast(state);

  return (
    <form action={formAction} noValidate className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" required>
          Email
        </Label>
        <div className="relative">
          <FiMail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="pl-9"
            placeholder="you@example.com"
          />
        </div>
        <FieldError message={state.fieldErrors?.email?.[0]} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" required>
          Password
        </Label>
        <div className="relative">
          <FiLock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="pl-9"
            placeholder="Enter your password"
          />
        </div>
        <FieldError message={state.fieldErrors?.password?.[0]} />
      </div>
      {state.message && !state.success ? (
        <p className="rounded-[var(--radius-md)] border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-foreground">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" className="h-11 w-full text-base" disabled={pending}>
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <Spinner size="sm" className="border-white border-t-transparent" />
            Signing in...
          </span>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
