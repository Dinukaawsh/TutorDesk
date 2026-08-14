"use client";

import { useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useFormModalPending } from "@/components/modals/form-modal-context";

export function FormPendingReporter() {
  const { pending } = useFormStatus();
  const ctx = useFormModalPending();

  useEffect(() => {
    ctx?.setPending(pending);
  }, [pending, ctx]);

  return null;
}
