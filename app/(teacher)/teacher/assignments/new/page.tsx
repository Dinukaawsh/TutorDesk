import { Role } from "@prisma/client";
import { PageHeader } from "@/components/layout/page-header";
import { AssignmentForm } from "@/components/assignments/assignment-form";
import { createAssignmentAction } from "@/actions/assignment.actions";
import { prisma } from "@/lib/prisma";

export default async function NewAssignmentPage() {
  const [subjects, students] = await Promise.all([
    prisma.subject.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.user.findMany({
      where: { role: Role.STUDENT, isDisabled: false },
      orderBy: { name: "asc" },
      select: { id: true, name: true, grade: true },
    }),
  ]);

  return (
    <>
      <PageHeader title="New assignment" description="Set a deadline and target students" />
      {subjects.length === 0 ? (
        <p className="text-sm text-muted-foreground">Add subjects before creating assignments.</p>
      ) : (
        <AssignmentForm action={createAssignmentAction} subjects={subjects} students={students} />
      )}
    </>
  );
}
