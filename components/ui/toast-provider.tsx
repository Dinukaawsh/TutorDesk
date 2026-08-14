"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      theme="light"
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "border border-border bg-white/90 text-foreground shadow-lg backdrop-blur-md",
          title: "text-foreground font-medium",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-white",
          cancelButton: "bg-muted text-foreground",
          closeButton: "border-border bg-white/80 text-foreground",
        },
      }}
    />
  );
}
