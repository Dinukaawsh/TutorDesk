import { Role } from "@prisma/client";
import { PageHeader } from "@/components/layout/page-header";
import { AssignmentsPageClient } from "@/components/assignments/assignments-page-client";
import { prisma } from "@/lib/prisma";

export default async function TeacherAssignmentsPage() {
  const [assignments, subjects, students] = await Promise.all([
    prisma.assignment.findMany({
      include: {
        subject: { select: { name: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.subject.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.user.findMany({
      where: { role: Role.STUDENT, isDisabled: false },
      orderBy: { name: "asc" },
      select: { id: true, name: true, grade: true },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Assignments"
        description="Create homework and review submissions"
      />
      <AssignmentsPageClient assignments={assignments} subjects={subjects} students={students} />
    </>
  );
}
