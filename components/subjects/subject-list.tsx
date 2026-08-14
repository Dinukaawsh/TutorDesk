"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SubjectCard, type SubjectCardData } from "@/components/subjects/subject-card";
import { SubjectForm } from "@/components/subjects/subject-form";

type SubjectListProps = {
  subjects: SubjectCardData[];
};

export function SubjectList({ subjects }: SubjectListProps) {
  const [editing, setEditing] = useState<SubjectCardData | null>(null);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} onEdit={setEditing} />
        ))}
        {subjects.length === 0 ? (
          <p className="text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
            No subjects yet. Create your first subject to enroll students.
          </p>
        ) : null}
      </div>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit subject</DialogTitle>
          </DialogHeader>
          {editing ? (
            <SubjectForm
              subject={editing}
              onSuccess={() => setEditing(null)}
              onCancel={() => setEditing(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
