"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { SubjectOption } from "@/components/students/student-filters";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { t } from "@/content/navigation";

type TeacherDashboardFiltersProps = {
  subjects: SubjectOption[];
  grades: string[];
  month: number;
  year: number;
};

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

function yearOptions(currentYear: number) {
  return [currentYear - 1, currentYear, currentYear + 1];
}

export function TeacherDashboardFilters({
  subjects,
  grades,
  month,
  year,
}: TeacherDashboardFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const grade = searchParams.get("grade") ?? "";
  const subjectId = searchParams.get("subjectId") ?? "";

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
      router.push(`/teacher/dashboard?${params.toString()}`);
    });
  }

  return (
    <div className="grid gap-3 rounded-xl border border-border bg-white/80 p-4 backdrop-blur md:grid-cols-2 lg:grid-cols-5">
      <div className="space-y-1">
        <Label>{t("dashboard.filter.subject")}</Label>
        <Select
          value={subjectId || "all"}
          onValueChange={(value) =>
            apply({ subjectId: value === "all" ? "" : value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t("dashboard.filter.allSubjects")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("dashboard.filter.allSubjects")}</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>{t("dashboard.filter.grade")}</Label>
        <Select
          value={grade || "all"}
          onValueChange={(value) => apply({ grade: value === "all" ? "" : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("dashboard.filter.allGrades")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("dashboard.filter.allGrades")}</SelectItem>
            {grades.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>{t("dashboard.filter.month")}</Label>
        <Select
          value={String(month)}
          onValueChange={(value) => apply({ month: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={String(m.value)}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>{t("dashboard.filter.year")}</Label>
        <Select
          value={String(year)}
          onValueChange={(value) => apply({ year: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {yearOptions(year).map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-end">
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => router.push("/teacher/dashboard")}
        >
          {t("dashboard.filter.reset")}
        </Button>
      </div>
    </div>
  );
}
