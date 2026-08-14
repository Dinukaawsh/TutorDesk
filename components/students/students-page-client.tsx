"use client";

import { useState } from "react";
import { StudentFilters, type SubjectOption } from "@/components/students/student-filters";
import { StudentForm } from "@/components/students/student-form";
import { StudentTable, type StudentRow } from "@/components/students/student-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
        <Button type="button" onClick={() => setCreateOpen(true)}>
          Add student
        </Button>
      </div>
      <StudentFilters subjects={subjects} grades={grades} />
      <StudentTable students={students} subjects={subjects} />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New student</DialogTitle>
          </DialogHeader>
          <StudentForm
            subjects={subjects}
            onSuccess={() => setCreateOpen(false)}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
