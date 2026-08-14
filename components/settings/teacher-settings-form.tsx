"use client";

import { useActionState, useState } from "react";
import { updateTeacherProfileAction } from "@/actions/settings.actions";
import type { ActionResult } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useActionToast } from "@/hooks/use-action-toast";

const CURRENCIES = ["LKR", "USD", "EUR", "GBP", "INR", "AUD"] as const;

const initialState: ActionResult = { success: false };

export type TeacherSettingsData = {
  name: string;
  email: string;
  whatsapp: string | null;
  avatarUrl: string | null;
  defaultCurrency: string | null;
};

type TeacherSettingsFormProps = {
  teacher: TeacherSettingsData;
};

export function TeacherSettingsForm({ teacher }: TeacherSettingsFormProps) {
  const [state, formAction, pending] = useActionState(updateTeacherProfileAction, initialState);
  const [currency, setCurrency] = useState(teacher.defaultCurrency ?? "LKR");

  useActionToast(state);

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="shrink-0">
          {teacher.avatarUrl ? (
            <img
              src={teacher.avatarUrl}
              alt=""
              className="h-20 w-20 rounded-full border border-border object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-muted text-sm text-muted-foreground">
              No photo
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="teacher-avatar">Profile photo</Label>
          <Input id="teacher-avatar" name="avatar" type="file" accept="image/*" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="teacher-name">Display name</Label>
          <Input id="teacher-name" name="name" defaultValue={teacher.name} required />
          {state.fieldErrors?.name?.[0] ? (
            <p className="text-sm text-black/70">{state.fieldErrors.name[0]}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="teacher-email">Email</Label>
          <Input
            id="teacher-email"
            name="email"
            type="email"
            defaultValue={teacher.email}
            required
          />
          {state.fieldErrors?.email?.[0] ? (
            <p className="text-sm text-black/70">{state.fieldErrors.email[0]}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="teacher-whatsapp">WhatsApp</Label>
          <Input
            id="teacher-whatsapp"
            name="whatsapp"
            defaultValue={teacher.whatsapp ?? ""}
            placeholder="+94..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="teacher-currency">Default currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger id="teacher-currency">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((code) => (
                <SelectItem key={code} value={code}>
                  {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="defaultCurrency" value={currency} />
        </div>
      </div>

      {state.message && !state.success ? (
        <p className="rounded-lg border border-border bg-muted px-3 py-2 text-sm">{state.message}</p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <Spinner size="sm" />
            Saving...
          </span>
        ) : (
          "Save settings"
        )}
      </Button>
    </form>
  );
}
