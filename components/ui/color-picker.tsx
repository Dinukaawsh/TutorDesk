"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function normalizeHex(value: string): string | null {
  const trimmed = value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) return trimmed;
  if (/^[0-9A-Fa-f]{6}$/.test(trimmed)) return `#${trimmed}`;
  return null;
}

type ColorPickerProps = {
  name?: string;
  defaultValue?: string;
  id?: string;
  label?: string;
  className?: string;
};

export function ColorPicker({
  name = "color",
  defaultValue = "#2563eb",
  id,
  label,
  className,
}: ColorPickerProps) {
  const initial = normalizeHex(defaultValue) ?? "#2563eb";
  const [hex, setHex] = React.useState(initial);

  const pickerValue = normalizeHex(hex) ?? initial;

  function handleHexChange(next: string) {
    setHex(next);
  }

  function handlePickerChange(next: string) {
    setHex(next);
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <Label htmlFor={id ?? `${name}-hex`}>{label}</Label> : null}
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={pickerValue}
          onChange={(e) => handlePickerChange(e.target.value)}
          className="h-10 w-12 cursor-pointer rounded-[var(--radius-md)] border border-border bg-white p-1"
          aria-label="Pick color"
        />
        <Input
          id={id ?? `${name}-hex`}
          value={hex}
          onChange={(e) => handleHexChange(e.target.value)}
          placeholder="#2563eb"
          className="font-mono"
        />
      </div>
      <input type="hidden" name={name} value={normalizeHex(hex) ?? pickerValue} />
    </div>
  );
}
