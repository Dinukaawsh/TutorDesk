import { PageHeader } from "@/components/layout/page-header";
import { LessonForm } from "@/components/lessons/lesson-form";
import { createLessonAction } from "@/actions/lesson.actions";
import { prisma } from "@/lib/prisma";

export default async function NewLessonPage() {
  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <>
      <PageHeader title="New lesson" description="Upload a PDF or add a video link" />
      {subjects.length === 0 ? (
        <p className="text-sm text-muted-foreground">Add subjects before creating lessons.</p>
      ) : (
        <LessonForm action={createLessonAction} subjects={subjects} />
      )}
    </>
  );
}
