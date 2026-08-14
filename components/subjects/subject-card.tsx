"use client";

import { useTransition } from "react";
import { deleteSubjectAction } from "@/actions/subject.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

export type SubjectCardData = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  enrollmentCount: number;
};

type SubjectCardProps = {
  subject: SubjectCardData;
  onEdit: (subject: SubjectCardData) => void;
};

export function SubjectCard({ subject, onEdit }: SubjectCardProps) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Delete "${subject.name}"? This cannot be undone.`)) {
      return;
    }
    startTransition(async () => {
      await deleteSubjectAction(subject.id);
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 shrink-0 rounded-full border border-border"
            style={{ backgroundColor: subject.color ?? "#2563eb" }}
          />
          <CardTitle className="text-base">{subject.name}</CardTitle>
        </div>
        <StatusBadge label={`${subject.enrollmentCount} enrolled`} tone="muted" />
      </CardHeader>
      <CardContent className="space-y-3">
        {subject.description ? (
          <p className="text-sm text-muted-foreground">{subject.description}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No description</p>
        )}
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onEdit(subject)}>
            Edit
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={pending}
            onClick={handleDelete}
          >
            {pending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
