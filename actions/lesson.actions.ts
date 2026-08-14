"use server";

import { revalidatePath } from "next/cache";
import { LessonType, NotificationType, Role } from "@prisma/client";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { requireTeacherSession } from "@/lib/server-auth";
import { saveLessonPdf } from "@/lib/uploads";
import { lessonFormSchema } from "@/schemas/lesson.schema";
import type { ActionResult } from "@/actions/auth.actions";

async function notifyStudentsOfLesson(lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { subject: true },
  });
  if (!lesson || !lesson.published) return;

  const students = await prisma.user.findMany({
    where: {
      role: Role.STUDENT,
      isDisabled: false,
      grade: lesson.grade,
      enrollments: { some: { subjectId: lesson.subjectId } },
    },
    select: { id: true },
  });

  await Promise.all(
    students.map((student) =>
      createNotification({
        userId: student.id,
        type: NotificationType.LESSON_PUBLISHED,
        title: "New lesson published",
        message: `${lesson.subject.name}: ${lesson.title}`,
        link: "/student/lessons",
      }),
    ),
  );
}

function parseLessonForm(formData: FormData) {
  return {
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    type: formData.get("type"),
    subjectId: formData.get("subjectId"),
    grade: formData.get("grade"),
    videoUrl: formData.get("videoUrl") || undefined,
  };
}

export async function createLessonAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireTeacherSession();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const parsed = lessonFormSchema.safeParse(parseLessonForm(formData));
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { title, description, type, subjectId, grade, videoUrl } = parsed.data;
  let contentUrl = videoUrl?.trim() ?? "";

  if (type === LessonType.PDF) {
    const pdf = formData.get("pdf");
    if (!(pdf instanceof File) || pdf.size === 0) {
      return {
        success: false,
        fieldErrors: { pdf: ["PDF file is required"] },
      };
    }
    try {
      contentUrl = await saveLessonPdf(pdf);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  await prisma.lesson.create({
    data: {
      title,
      description: description || null,
      type,
      contentUrl,
      subjectId,
      grade,
    },
  });

  revalidatePath("/teacher/lessons");
  return { success: true, message: "Lesson created" };
}

export async function updateLessonAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireTeacherSession();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const lessonId = String(formData.get("lessonId") ?? "");
  if (!lessonId) {
    return { success: false, message: "Lesson not found" };
  }

  const existing = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!existing) {
    return { success: false, message: "Lesson not found" };
  }

  const parsed = lessonFormSchema.safeParse(parseLessonForm(formData));
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { title, description, type, subjectId, grade, videoUrl } = parsed.data;
  let contentUrl = existing.contentUrl;

  if (type === LessonType.VIDEO) {
    contentUrl = videoUrl?.trim() ?? "";
  } else {
    const pdf = formData.get("pdf");
    if (pdf instanceof File && pdf.size > 0) {
      try {
        contentUrl = await saveLessonPdf(pdf);
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : "Upload failed",
        };
      }
    } else if (existing.type !== LessonType.PDF) {
      return {
        success: false,
        fieldErrors: { pdf: ["PDF file is required"] },
      };
    }
  }

  await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      title,
      description: description || null,
      type,
      contentUrl,
      subjectId,
      grade,
    },
  });

  revalidatePath("/teacher/lessons");
  revalidatePath(`/teacher/lessons/${lessonId}/edit`);
  return { success: true, message: "Lesson updated" };
}

export async function setLessonPublishedAction(
  lessonId: string,
  published: boolean,
): Promise<ActionResult> {
  try {
    await requireTeacherSession();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const lesson = await prisma.lesson.update({
    where: { id: lessonId },
    data: { published },
  });

  if (published) {
    await notifyStudentsOfLesson(lesson.id);
  }

  revalidatePath("/teacher/lessons");
  revalidatePath("/student/lessons");
  return {
    success: true,
    message: published ? "Lesson published" : "Lesson unpublished",
  };
}
export async function toggleLessonPublishFormAction(
  lessonId: string,
  published: boolean,
): Promise<void> {
  await setLessonPublishedAction(lessonId, published);
}
