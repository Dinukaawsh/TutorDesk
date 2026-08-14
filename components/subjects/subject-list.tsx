"use client";

import { useState } from "react";
import { FormModal } from "@/components/modals/form-modal";
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

      <FormModal
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
        title="Edit subject"
        formId="subject-form"
        saveLabel="Update subject"
        onCancel={() => setEditing(null)}
      >
        {editing ? (
          <SubjectForm
            formId="subject-form"
            hideActions
            subject={editing}
            onSuccess={() => setEditing(null)}
          />
        ) : null}
      </FormModal>
    </>
  );
}
