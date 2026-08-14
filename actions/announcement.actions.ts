"use server";

import { revalidatePath } from "next/cache";
import {
  AnnouncementTarget,
  NotificationType,
  Role,
  type Prisma,
} from "@prisma/client";
import type { ActionResult } from "@/actions/auth.actions";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { requireStudentSession } from "@/lib/server-auth";
import { requireTeacherSession } from "@/lib/teacher-auth";
import { createAnnouncementSchema, deleteAnnouncementSchema, updateAnnouncementSchema } from "@/schemas/announcement.schema";

function parseAnnouncementForm(formData: FormData) {
  return {
    title: formData.get("title"),
    body: formData.get("body"),
    targetType: formData.get("targetType"),
    subjectId: formData.get("subjectId") || undefined,
    grade: formData.get("grade") || undefined,
  };
}

async function findTargetedStudentIds(announcement: {
  targetType: AnnouncementTarget;
  subjectId: string | null;
  grade: string | null;
}) {
  const base: Prisma.UserWhereInput = {
    role: Role.STUDENT,
    isDisabled: false,
  };

  switch (announcement.targetType) {
    case AnnouncementTarget.EVERYONE:
      break;
    case AnnouncementTarget.SUBJECT:
      if (!announcement.subjectId) return [];
      base.enrollments = { some: { subjectId: announcement.subjectId } };
      break;
    case AnnouncementTarget.GRADE:
      if (!announcement.grade) return [];
      base.grade = announcement.grade;
      break;
    case AnnouncementTarget.SUBJECT_GRADE:
      if (!announcement.subjectId || !announcement.grade) return [];
      base.grade = announcement.grade;
      base.enrollments = { some: { subjectId: announcement.subjectId } };
      break;
    default:
      return [];
  }

  const students = await prisma.user.findMany({
    where: base,
    select: { id: true },
  });
  return students.map((s) => s.id);
}

async function notifyStudentsOfAnnouncement(announcementId: string) {
  const announcement = await prisma.announcement.findUnique({
    where: { id: announcementId },
    include: { subject: { select: { name: true } } },
  });
  if (!announcement) return;

  const studentIds = await findTargetedStudentIds(announcement);
  await Promise.all(
    studentIds.map((userId) =>
      createNotification({
        userId,
        type: NotificationType.ANNOUNCEMENT_PUBLISHED,
        title: "New announcement",
        message: announcement.title,
        link: "/student/announcements",
      }),
    ),
  );
}

export async function createAnnouncementAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireTeacherSession();
  if (!session) {
    return { success: false, message: "Unauthorized." };
  }

  const parsed = createAnnouncementSchema.safeParse(parseAnnouncementForm(formData));
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { title, body, targetType, subjectId, grade } = parsed.data;

  const announcement = await prisma.announcement.create({
    data: {
      title,
      body,
      targetType,
      subjectId: subjectId?.trim() || null,
      grade: grade?.trim() || null,
    },
  });

  await notifyStudentsOfAnnouncement(announcement.id);

  revalidatePath("/teacher/announcements");
  revalidatePath("/student/announcements");
  return { success: true, message: "Announcement published." };
}

export async function updateAnnouncementAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireTeacherSession();
  if (!session) {
    return { success: false, message: "Unauthorized." };
  }

  const parsed = updateAnnouncementSchema.safeParse({
    ...parseAnnouncementForm(formData),
    id: formData.get("id"),
  });
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { id, title, body, targetType, subjectId, grade } = parsed.data;

  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) {
    return { success: false, message: "Announcement not found." };
  }

  await prisma.announcement.update({
    where: { id },
    data: {
      title,
      body,
      targetType,
      subjectId: subjectId?.trim() || null,
      grade: grade?.trim() || null,
    },
  });

  revalidatePath("/teacher/announcements");
  revalidatePath("/student/announcements");
  return { success: true, message: "Announcement updated." };
}

export async function saveAnnouncementAction(
  prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim();
  if (id) {
    return updateAnnouncementAction(prev, formData);
  }
  return createAnnouncementAction(prev, formData);
}

export async function deleteAnnouncementAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireTeacherSession();
  if (!session) {
    return { success: false, message: "Unauthorized." };
  }

  const parsed = deleteAnnouncementSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) {
    return { success: false, message: "Invalid announcement." };
  }

  const existing = await prisma.announcement.findUnique({ where: { id: parsed.data.id } });
  if (!existing) {
    return { success: false, message: "Announcement not found." };
  }

  await prisma.announcement.delete({ where: { id: parsed.data.id } });

  revalidatePath("/teacher/announcements");
  revalidatePath("/student/announcements");
  return { success: true, message: "Announcement deleted." };
}

export async function getTeacherAnnouncements() {
  const session = await requireTeacherSession();
  if (!session) {
    return [];
  }

  return prisma.announcement.findMany({
    include: { subject: { select: { id: true, name: true, color: true } } },
    orderBy: { createdAt: "desc" },
  });
}

function announcementMatchesStudent(
  announcement: {
    targetType: AnnouncementTarget;
    subjectId: string | null;
    grade: string | null;
  },
  student: { grade: string | null; subjectIds: string[] },
) {
  switch (announcement.targetType) {
    case AnnouncementTarget.EVERYONE:
      return true;
    case AnnouncementTarget.SUBJECT:
      return Boolean(
        announcement.subjectId && student.subjectIds.includes(announcement.subjectId),
      );
    case AnnouncementTarget.GRADE:
      return Boolean(
        announcement.grade && student.grade && announcement.grade === student.grade,
      );
    case AnnouncementTarget.SUBJECT_GRADE:
      return Boolean(
        announcement.subjectId &&
          student.subjectIds.includes(announcement.subjectId) &&
          announcement.grade &&
          student.grade &&
          announcement.grade === student.grade,
      );
    default:
      return false;
  }
}

export async function getStudentAnnouncements() {
  let sessionUser;
  try {
    sessionUser = await requireStudentSession();
  } catch {
    return [];
  }

  const student = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: { enrollments: { select: { subjectId: true } } },
  });
  if (!student) {
    return [];
  }

  const subjectIds = student.enrollments.map((e) => e.subjectId);
  const announcements = await prisma.announcement.findMany({
    include: { subject: { select: { id: true, name: true, color: true } } },
    orderBy: { createdAt: "desc" },
  });

  return announcements.filter((a) =>
    announcementMatchesStudent(a, { grade: student.grade, subjectIds }),
  );
}
