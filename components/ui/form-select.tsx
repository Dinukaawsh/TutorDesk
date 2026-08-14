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

export type FormSelectOption = {
  value: string;
  label: string;
};

type FormSelectProps = {
  id?: string;
  label: string;
  required?: boolean;
  name: string;
  defaultValue?: string;
  value?: string;
  placeholder?: string;
  options: FormSelectOption[];
  allowEmpty?: boolean;
  emptyLabel?: string;
  className?: string;
  onValueChange?: (value: string) => void;
};

export function FormSelect({
  id,
  label,
  required,
  name,
  defaultValue = "",
  value,
  placeholder = "Select",
  options,
  allowEmpty = false,
  emptyLabel = "Select",
  className,
  onValueChange,
}: FormSelectProps) {
  const [internal, setInternal] = React.useState(defaultValue);

  React.useEffect(() => {
    if (value !== undefined) {
      setInternal(value);
    }
  }, [value]);

  function handleChange(next: string) {
    const resolved = next === "__empty__" ? "" : next;
    setInternal(resolved);
    onValueChange?.(resolved);
  }

  const selectValue = internal || (allowEmpty ? "__empty__" : internal);

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id ?? name} required={required}>
        {label}
      </Label>
      <Select value={selectValue} onValueChange={handleChange}>
        <SelectTrigger id={id ?? name}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {allowEmpty ? <SelectItem value="__empty__">{emptyLabel}</SelectItem> : null}
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
