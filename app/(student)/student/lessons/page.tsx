import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { PageHeader } from "@/components/layout/page-header";
import { StudentLessonList } from "@/components/lessons/student-lesson-list";
import { prisma } from "@/lib/prisma";

export default async function StudentLessonsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.STUDENT) {
    redirect("/login");
  }

  const student = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { enrollments: true },
  });

  if (!student) redirect("/login");

  const subjectIds = student.enrollments.map((e) => e.subjectId);
  const grade = student.grade ?? "";

  const lessons = subjectIds.length
    ? await prisma.lesson.findMany({
        where: {
          published: true,
          grade,
          subjectId: { in: subjectIds },
        },
        include: { subject: { select: { name: true, color: true } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <>
      <PageHeader title="Lessons" description="Published lessons for your grade and subjects" />
      <StudentLessonList lessons={lessons} />
    </>
  );
}
