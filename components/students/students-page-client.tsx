"use client";

import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { StudentFilters, type SubjectOption, type TagOption } from "@/components/students/student-filters";
import { StudentForm } from "@/components/students/student-form";
import { StudentTable, type StudentRow } from "@/components/students/student-table";
import { StudentTagsManager, type StudentTagOption } from "@/components/students/student-tags-manager";
import { FormModal } from "@/components/modals/form-modal";
import { IconButton } from "@/components/modals/icon-button";

type StudentsPageClientProps = {
  students: StudentRow[];
  subjects: SubjectOption[];
  grades: string[];
  tags: TagOption[];
  tagStats: StudentTagOption[];
};

export function StudentsPageClient({
  students,
  subjects,
  grades,
  tags,
  tagStats,
}: StudentsPageClientProps) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <IconButton
          labelKey="action.addStudent"
          icon={<FiPlus className="h-4 w-4" />}
          variant="default"
          onClick={() => setCreateOpen(true)}
        />
      </div>
      <StudentTagsManager tags={tagStats} />
      <StudentFilters subjects={subjects} grades={grades} tags={tags} />
      <StudentTable students={students} subjects={subjects} tags={tags} grades={grades} />

      <FormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New student"
        className="max-w-2xl"
        formId="student-form"
        saveLabel="Create student"
        onCancel={() => setCreateOpen(false)}
      >
        <StudentForm
          formId="student-form"
          hideActions
          subjects={subjects}
          tags={tags}
          onSuccess={() => setCreateOpen(false)}
        />
      </FormModal>
    </div>
  );
}
