import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { AssignmentCard } from "@/components/assignments/assignment-card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export default async function TeacherAssignmentsPage() {
  const assignments = await prisma.assignment.findMany({
    include: {
      subject: { select: { name: true } },
      _count: { select: { submissions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHeader
        title="Assignments"
        description="Create homework and review submissions"
        actions={
          <Button asChild>
            <Link href="/teacher/assignments/new">New assignment</Link>
          </Button>
        }
      />
      {assignments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No assignments yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {assignments.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))}
        </div>
      )}
    </>
  );
}
