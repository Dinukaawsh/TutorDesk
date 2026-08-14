"use client";

import * as React from "react";
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, "type"> & {
  showLockIcon?: boolean;
};

export function PasswordInput({ className, showLockIcon, disabled, ...props }: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      {showLockIcon ? (
        <FiLock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      ) : null}
      <Input
        {...props}
        disabled={disabled}
        type={visible ? "text" : "password"}
        className={cn(showLockIcon ? "pl-9 pr-10" : "pr-10", className)}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
        onClick={() => setVisible((value) => !value)}
        disabled={disabled}
      >
        {visible ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
      </button>
    </div>
  );
}
