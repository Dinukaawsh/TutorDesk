"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type SearchBarProps = {
  name?: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  id?: string;
  onSearch?: (query: string) => void;
};

export function SearchBar({
  name = "q",
  defaultValue = "",
  placeholder = "Search...",
  className,
  id,
  onSearch,
}: SearchBarProps) {
  const [value, setValue] = React.useState(defaultValue);

  React.useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  React.useEffect(() => {
    if (!onSearch) return;
    const timer = window.setTimeout(() => onSearch(value), 300);
    return () => window.clearTimeout(timer);
  }, [value, onSearch]);

  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={id ?? name}
        name={onSearch ? undefined : name}
        value={onSearch ? value : undefined}
        defaultValue={onSearch ? undefined : defaultValue}
        onChange={onSearch ? (e) => setValue(e.target.value) : undefined}
        placeholder={placeholder}
        className="pl-9"
      />
      {onSearch ? <input type="hidden" name={name} value={value} /> : null}
    </div>
  );
}
