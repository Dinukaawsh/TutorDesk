"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FilterSelect } from "@/components/ui/filter-select";
import { MonthYearPicker } from "@/components/ui/month-year-picker";
import { SearchBar } from "@/components/ui/search-bar";

type FeeFiltersProps = {
  month: number;
  year: number;
  status?: string;
  subjectId?: string;
  grade?: string;
  q?: string;
  subjects: { id: string; name: string }[];
  grades: string[];
};

export function FeeFilters({
  month,
  year,
  status = "",
  subjectId = "",
  grade = "",
  q = "",
  subjects,
  grades,
}: FeeFiltersProps) {
  return (
    <>
      <MonthYearPicker month={month} year={year} label="Period" className="space-y-1" />
      <FilterSelect
        label="Status"
        name="status"
        value={status}
        emptyLabel="All"
        options={[
          { value: "UNPAID", label: "Unpaid" },
          { value: "PENDING", label: "Pending" },
          { value: "PAID", label: "Paid" },
        ]}
      />
      <FilterSelect
        label="Subject"
        name="subjectId"
        value={subjectId}
        emptyLabel="All subjects"
        options={subjects.map((s) => ({ value: s.id, label: s.name }))}
      />
      <FilterSelect
        label="Grade"
        name="grade"
        value={grade}
        emptyLabel="All grades"
        options={grades.map((g) => ({ value: g, label: `Grade ${g}` }))}
      />
      <div className="space-y-1 sm:col-span-2 lg:col-span-1">
        <label htmlFor="fee-q" className="text-sm font-medium leading-none">
          Student
        </label>
        <SearchBar id="fee-q" name="q" defaultValue={q} placeholder="Name or email" />
      </div>
      <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5">
        <Button type="submit">Apply filters</Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/teacher/fees">Reset</Link>
        </Button>
      </div>
    </>
  );
}
