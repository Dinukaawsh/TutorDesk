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

const MONTHS = [
  { value: "1", label: "Jan" },
  { value: "2", label: "Feb" },
  { value: "3", label: "Mar" },
  { value: "4", label: "Apr" },
  { value: "5", label: "May" },
  { value: "6", label: "Jun" },
  { value: "7", label: "Jul" },
  { value: "8", label: "Aug" },
  { value: "9", label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dec" },
];

type MonthYearPickerProps = {
  month: number;
  year: number;
  monthName?: string;
  yearName?: string;
  label?: string;
  yearRange?: { start: number; end: number };
  className?: string;
};

export function MonthYearPicker({
  month,
  year,
  monthName = "month",
  yearName = "year",
  label = "Period",
  yearRange,
  className,
}: MonthYearPickerProps) {
  const now = new Date().getFullYear();
  const startYear = yearRange?.start ?? now - 5;
  const endYear = yearRange?.end ?? now + 1;

  const [monthValue, setMonthValue] = React.useState(String(month));
  const [yearValue, setYearValue] = React.useState(String(year));

  React.useEffect(() => {
    setMonthValue(String(month));
    setYearValue(String(year));
  }, [month, year]);

  const years: number[] = [];
  for (let y = endYear; y >= startYear; y--) years.push(y);

  return (
    <div className={className}>
      {label ? <Label className="mb-1 block">{label}</Label> : null}
      <div className="grid grid-cols-2 gap-2">
        <Select value={monthValue} onValueChange={setMonthValue}>
          <SelectTrigger aria-label="Month">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={yearValue} onValueChange={setYearValue}>
          <SelectTrigger aria-label="Year">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <input type="hidden" name={monthName} value={monthValue} />
      <input type="hidden" name={yearName} value={yearValue} />
    </div>
  );
}
