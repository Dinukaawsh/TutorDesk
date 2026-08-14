import { PageHeader } from "@/components/layout/page-header";
import { LessonsPageClient } from "@/components/lessons/lessons-page-client";
import { prisma } from "@/lib/prisma";

export default async function TeacherLessonsPage() {
  const [lessons, subjects] = await Promise.all([
    prisma.lesson.findMany({
      include: { subject: { select: { name: true, color: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.subject.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <>
      <PageHeader
        title="Lessons"
        description="Create PDF or video lessons for your classes"
      />
      <LessonsPageClient lessons={lessons} subjects={subjects} />
    </>
  );
}
