"use client";

import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { createAssignmentAction } from "@/actions/assignment.actions";
import { AssignmentCard, type AssignmentCardData } from "@/components/assignments/assignment-card";
import { AssignmentForm } from "@/components/assignments/assignment-form";
import { FormModal } from "@/components/modals/form-modal";
import { IconButton } from "@/components/modals/icon-button";

type AssignmentsPageClientProps = {
  assignments: AssignmentCardData[];
  subjects: { id: string; name: string }[];
  students: { id: string; name: string; grade: string | null }[];
};

export function AssignmentsPageClient({
  assignments,
  subjects,
  students,
}: AssignmentsPageClientProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);

  function handleCreated() {
    setCreateOpen(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <IconButton
          labelKey="action.addAssignment"
          icon={<FiPlus className="h-4 w-4" />}
          variant="default"
          onClick={() => setCreateOpen(true)}
          disabled={subjects.length === 0}
        />
      </div>

      {subjects.length === 0 ? (
        <p className="text-sm text-muted-foreground">Add subjects before creating assignments.</p>
      ) : assignments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No assignments yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {assignments.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))}
        </div>
      )}

      <FormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New assignment"
        description="Set a deadline and target students"
        size="xl"
        formId="assignment-form"
        saveLabel="Create assignment"
        onCancel={() => setCreateOpen(false)}
      >
        <AssignmentForm
          formId="assignment-form"
          hideActions
          action={createAssignmentAction}
          subjects={subjects}
          students={students}
          onSuccess={handleCreated}
        />
      </FormModal>
    </div>
  );
}
