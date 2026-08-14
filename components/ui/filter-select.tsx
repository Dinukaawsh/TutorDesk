"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type FilterSelectOption = {
  value: string;
  label: string;
};

type FilterSelectProps = {
  label: string;
  name: string;
  value: string;
  placeholder?: string;
  options: FilterSelectOption[];
  emptyValue?: string;
  emptyLabel?: string;
  className?: string;
  onValueChange?: (value: string) => void;
};

export function FilterSelect({
  label,
  name,
  value,
  placeholder = "Select",
  options,
  emptyValue = "",
  emptyLabel = "All",
  className,
  onValueChange,
}: FilterSelectProps) {
  const [internal, setInternal] = React.useState(value);

  React.useEffect(() => {
    setInternal(value);
  }, [value]);

  function handleChange(next: string) {
    const resolved = next === "__empty__" ? emptyValue : next;
    setInternal(resolved);
    onValueChange?.(resolved);
  }

  return (
    <div className={cn("space-y-1", className)}>
      <Label>{label}</Label>
      <Select value={!internal ? "__empty__" : internal} onValueChange={handleChange}>
        <SelectTrigger id={name}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__empty__">{emptyLabel}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <input type="hidden" name={name} value={internal} />
    </div>
  );
}
