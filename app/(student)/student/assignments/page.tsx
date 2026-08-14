import { redirect } from "next/navigation";
import Link from "next/link";
import { AssignmentTarget, Role } from "@prisma/client";
import { auth } from "@/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { prisma } from "@/lib/prisma";

export default async function StudentAssignmentsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.STUDENT) {
    redirect("/login");
  }

  const student = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      enrollments: true,
      submissions: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!student) redirect("/login");

  const subjectIds = student.enrollments.map((e) => e.subjectId);
  const grade = student.grade ?? "";

  const assignments = await prisma.assignment.findMany({
    where: {
      published: true,
      subjectId: subjectIds.length ? { in: subjectIds } : { in: [] },
      OR: [
        {
          targetType: AssignmentTarget.GRADE,
          grade,
        },
        {
          targetType: AssignmentTarget.INDIVIDUAL,
          individualStudentId: student.id,
        },
      ],
    },
    include: { subject: { select: { name: true } } },
    orderBy: { deadline: "asc" },
  });

  const latestByAssignment = new Map<string, (typeof student.submissions)[number]>();
  for (const submission of student.submissions) {
    if (!latestByAssignment.has(submission.assignmentId)) {
      latestByAssignment.set(submission.assignmentId, submission);
    }
  }

  return (
    <>
      <PageHeader title="Assignments" description="Homework and deadlines" />
      {assignments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No assignments for you right now.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {assignments.map((assignment) => {
            const latest = latestByAssignment.get(assignment.id);
            return (
              <Card key={assignment.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{assignment.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{assignment.subject.name}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {latest ? <StatusBadge label={latest.status.replace("_", " ")} /> : null}
                  <Link href={`/student/assignments/${assignment.id}`} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                    Open assignment
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
