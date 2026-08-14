"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type CheckboxFieldProps = {
  id?: string;
  name?: string;
  value?: string;
  label: React.ReactNode;
  defaultChecked?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

export function CheckboxField({
  id,
  name,
  value,
  label,
  defaultChecked,
  checked: controlledChecked,
  onCheckedChange,
  disabled,
  className,
}: CheckboxFieldProps) {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked ?? false);
  const checked = controlledChecked ?? internalChecked;

  function handleChange(next: boolean) {
    setInternalChecked(next);
    onCheckedChange?.(next);
  }

  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-muted/40",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <Checkbox id={id} checked={checked} onCheckedChange={handleChange} disabled={disabled} />
      {name && value && checked ? <input type="hidden" name={name} value={value} /> : null}
      <span className="flex-1">{label}</span>
    </label>
  );
}
