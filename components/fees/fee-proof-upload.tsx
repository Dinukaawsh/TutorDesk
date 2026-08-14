"use client";

import { useActionState } from "react";
import { submitFeeProofAction } from "@/actions/fee.actions";
import type { ActionResult } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: ActionResult = { success: false };

type FeeProofUploadProps = {
  feeRecordId: string;
  disabled?: boolean;
};

export function FeeProofUpload({ feeRecordId, disabled }: FeeProofUploadProps) {
  const [state, formAction, pending] = useActionState(submitFeeProofAction, initialState);

  return (
    <form
      action={formAction}
      className="mt-3 space-y-3 rounded-lg border border-dashed border-border bg-white/60 p-3"
    >
      <input type="hidden" name="feeRecordId" value={feeRecordId} />
      <div className="space-y-1">
        <Label htmlFor={`proof-${feeRecordId}`}>Upload proof (photo or PDF)</Label>
        <Input
          id={`proof-${feeRecordId}`}
          name="proof"
          type="file"
          accept="application/pdf,image/*"
          required
          disabled={disabled || pending}
        />
        {state.fieldErrors?.proof?.[0] ? (
          <p className="text-sm text-muted-foreground">{state.fieldErrors.proof[0]}</p>
        ) : null}
      </div>
      <Textarea
        name="studentNote"
        placeholder="Optional note for your teacher"
        rows={2}
        disabled={disabled || pending}
      />
      {state.message ? <p className="text-sm text-muted-foreground">{state.message}</p> : null}
      <Button type="submit" size="sm" disabled={disabled || pending}>
        {pending ? "Submitting..." : "Submit proof"}
      </Button>
    </form>
  );
}
