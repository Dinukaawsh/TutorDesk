"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export type InquiryInstituteOption = { id: string; name: string };

type InquiryFiltersProps = {
  institutes: InquiryInstituteOption[];
};

export function InquiryFilters({ institutes }: InquiryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const instituteId = searchParams.get("instituteId") ?? "";

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
      router.push(`/teacher/inquiries?${params.toString()}`);
    });
  }

  if (institutes.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-white/80 p-4 backdrop-blur">
      <div className="min-w-[180px] flex-1 space-y-1">
        <Label>Institute</Label>
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
      </div>
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={() => router.push("/teacher/inquiries")}
      >
        Reset
      </Button>
    </div>
  );
}
