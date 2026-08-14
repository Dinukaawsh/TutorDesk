"use client";

import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { StudentFilters, type SubjectOption } from "@/components/students/student-filters";
import { StudentForm } from "@/components/students/student-form";
import { StudentTable, type StudentRow } from "@/components/students/student-table";
import { FormModal } from "@/components/modals/form-modal";
import { IconButton } from "@/components/modals/icon-button";

type StudentsPageClientProps = {
  students: StudentRow[];
  subjects: SubjectOption[];
  grades: string[];
};

export function StudentsPageClient({
  students,
  subjects,
  grades,
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
      <StudentFilters subjects={subjects} grades={grades} />
      <StudentTable students={students} subjects={subjects} />

      <FormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New student"
        className="max-w-2xl"
      >
        <StudentForm
          subjects={subjects}
          onSuccess={() => setCreateOpen(false)}
          onCancel={() => setCreateOpen(false)}
        />
      </FormModal>
    </div>
  );
}
