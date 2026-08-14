"use client";

import * as React from "react";

type FormModalContextValue = {
  pending: boolean;
  setPending: (pending: boolean) => void;
};

const FormModalContext = React.createContext<FormModalContextValue | null>(null);

export function FormModalProvider({
  open,
  children,
}: {
  open: boolean;
  children: React.ReactNode;
}) {
  const [pending, setPendingState] = React.useState(false);

  const setPending = React.useCallback((value: boolean) => {
    setPendingState(value);
  }, []);

  React.useEffect(() => {
    if (!open) {
      setPendingState(false);
    }
  }, [open]);

  const value = React.useMemo(
    () => ({
      pending,
      setPending,
    }),
    [pending, setPending],
  );

  return <FormModalContext.Provider value={value}>{children}</FormModalContext.Provider>;
}

export function useFormModalPending() {
  return React.useContext(FormModalContext);
}

export function useReportFormModalPending(pending: boolean) {
  const ctx = useFormModalPending();

  React.useEffect(() => {
    if (!ctx) {
      return;
    }
    ctx.setPending(pending);
    return () => ctx.setPending(false);
  }, [pending, ctx]);
}
