import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { LessonList } from "@/components/lessons/lesson-list";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export default async function TeacherLessonsPage() {
  const lessons = await prisma.lesson.findMany({
    include: { subject: { select: { name: true, color: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHeader
        title="Lessons"
        description="Create PDF or video lessons for your classes"
        actions={
          <Button asChild>
            <Link href="/teacher/lessons/new">New lesson</Link>
          </Button>
        }
      />
      <LessonList lessons={lessons} />
    </>
  );
}
