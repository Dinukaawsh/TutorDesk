"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/actions/auth.actions";

export function useActionToast(state: ActionResult) {
  const lastMessage = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!state.message || state.message === lastMessage.current) {
      return;
    }
    lastMessage.current = state.message;
    if (state.success) {
      toast.success(state.message);
    } else {
      toast.error(state.message);
    }
  }, [state.message, state.success]);
}
