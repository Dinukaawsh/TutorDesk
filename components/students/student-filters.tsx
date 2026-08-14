"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/ui/search-bar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SubjectOption = { id: string; name: string };

type StudentFiltersProps = {
  subjects: SubjectOption[];
  grades: string[];
};

export function StudentFilters({ subjects, grades }: StudentFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const q = searchParams.get("q") ?? "";
  const grade = searchParams.get("grade") ?? "";
  const subjectId = searchParams.get("subjectId") ?? "";
  const status = searchParams.get("status") ?? "";
  const feeStatus = searchParams.get("feeStatus") ?? "";

  function apply(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    startTransition(() => {
      router.push(`/teacher/students?${params.toString()}`);
    });
  }

  return (
    <form
      className="grid gap-3 rounded-xl border border-border bg-white/80 p-4 backdrop-blur md:grid-cols-2 lg:grid-cols-6"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        apply({
          q: String(fd.get("q") ?? ""),
          grade: String(fd.get("grade") ?? ""),
          subjectId: String(fd.get("subjectId") ?? ""),
          status: String(fd.get("status") ?? ""),
          feeStatus: String(fd.get("feeStatus") ?? ""),
        });
      }}
    >
      <div className="space-y-1 lg:col-span-2">
        <Label htmlFor="filter-q">Search</Label>
        <SearchBar id="filter-q" name="q" defaultValue={q} placeholder="Name, email, phone" />
      </div>
      <div className="space-y-1">
        <Label>Grade</Label>
        <Select
          value={grade || "all"}
          onValueChange={(value) => apply({ grade: value === "all" ? "" : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All grades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All grades</SelectItem>
            {grades.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="grade" value={grade} />
      </div>
      <div className="space-y-1">
        <Label>Subject</Label>
        <Select
          value={subjectId || "all"}
          onValueChange={(value) =>
            apply({ subjectId: value === "all" ? "" : value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="subjectId" value={subjectId} />
      </div>
      <div className="space-y-1">
        <Label>Account</Label>
        <Select
          value={status || "all"}
          onValueChange={(value) => apply({ status: value === "all" ? "" : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="enabled">Enabled</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>
        <input type="hidden" name="status" value={status} />
      </div>
      <div className="space-y-1">
        <Label>Fee (this month)</Label>
        <Select
          value={feeStatus || "all"}
          onValueChange={(value) =>
            apply({ feeStatus: value === "all" ? "" : value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            <SelectItem value="UNPAID">Unpaid</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
          </SelectContent>
        </Select>
        <input type="hidden" name="feeStatus" value={feeStatus} />
      </div>
      <div className="flex items-end gap-2 lg:col-span-6">
        <Button type="submit" disabled={pending}>
          {pending ? "Applying..." : "Apply filters"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/teacher/students")}
        >
          Reset
        </Button>
      </div>
    </form>
  );
}
