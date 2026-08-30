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
import { t } from "@/content/navigation";

export type SubjectOption = { id: string; name: string };

export type TagOption = { id: string; name: string; color: string | null };

export type InstituteOption = { id: string; name: string; location: string };

type StudentFiltersProps = {
  subjects: SubjectOption[];
  grades: string[];
  tags: TagOption[];
  institutes: InstituteOption[];
};

export function StudentFilters({ subjects, grades, tags, institutes }: StudentFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const q = searchParams.get("q") ?? "";
  const grade = searchParams.get("grade") ?? "";
  const subjectId = searchParams.get("subjectId") ?? "";
  const tagId = searchParams.get("tagId") ?? "";
  const instituteId = searchParams.get("instituteId") ?? "";
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
      className="grid gap-3 rounded-xl border border-border bg-white/80 p-4 backdrop-blur md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        apply({
          q: String(fd.get("q") ?? ""),
          grade: String(fd.get("grade") ?? ""),
          subjectId: String(fd.get("subjectId") ?? ""),
          tagId: String(fd.get("tagId") ?? ""),
          instituteId: String(fd.get("instituteId") ?? ""),
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
        <Label>Tag</Label>
        <Select
          value={tagId || "all"}
          onValueChange={(value) => apply({ tagId: value === "all" ? "" : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tags</SelectItem>
            {tags.map((tag) => (
              <SelectItem key={tag.id} value={tag.id}>
                {tag.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="tagId" value={tagId} />
      </div>
      <div className="space-y-1">
        <Label>{t("students.institute.filter")}</Label>
        <Select
          value={instituteId || "all"}
          onValueChange={(value) => apply({ instituteId: value === "all" ? "" : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All institutes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All institutes</SelectItem>
            {institutes.map((institute) => (
              <SelectItem key={institute.id} value={institute.id}>
                {institute.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="instituteId" value={instituteId} />
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
      <div className="flex items-end gap-2 xl:col-span-8">
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
