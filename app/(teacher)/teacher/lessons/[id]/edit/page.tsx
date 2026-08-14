import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { LessonForm } from "@/components/lessons/lesson-form";
import { updateLessonAction } from "@/actions/lesson.actions";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function EditLessonPage({ params }: Props) {
  const { id } = await params;
  const [lesson, subjects] = await Promise.all([
    prisma.lesson.findUnique({ where: { id } }),
    prisma.subject.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!lesson) notFound();

  return (
    <>
      <PageHeader title="Edit lesson" description={lesson.title} />
      <LessonForm
        action={updateLessonAction}
        subjects={subjects}
        lessonId={lesson.id}
        defaultValues={lesson}
      />
    </>
  );
}
