"use server";

import { revalidatePath } from "next/cache";
import { InquiryStatus, NotificationType, Role } from "@prisma/client";
import type { ActionResult } from "@/actions/auth.actions";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { requireStudentSession } from "@/lib/server-auth";
import { requireTeacherSession } from "@/lib/teacher-auth";
import { saveInquiryAttachments } from "@/lib/uploads";
import {
  createInquirySchema,
  updateInquirySchema,
  updateInquiryStatusSchema,
} from "@/schemas/inquiry.schema";

function revalidateInquiries() {
  revalidatePath("/teacher/inquiries");
  revalidatePath("/student/inquiries");
}

async function getTeacherUserId() {
  const teacher = await prisma.user.findFirst({
    where: { role: Role.TEACHER },
    select: { id: true },
  });
  return teacher?.id ?? null;
}

function parseAttachmentFiles(formData: FormData) {
  const files = formData.getAll("attachments").filter((f): f is File => f instanceof File);
  return files.filter((f) => f.size > 0);
}

export async function createInquiryAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  let sessionUser;
  try {
    sessionUser = await requireStudentSession();
  } catch {
    return { success: false, message: "Unauthorized." };
  }

  const parsed = createInquirySchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  let attachmentUrls: string[] = [];
  const files = parseAttachmentFiles(formData);
  if (files.length) {
    try {
      attachmentUrls = await saveInquiryAttachments(files);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  const inquiry = await prisma.inquiry.create({
    data: {
      studentId: sessionUser.id,
      title: parsed.data.title,
      body: parsed.data.body,
      attachmentUrls,
    },
  });

  const teacherId = await getTeacherUserId();
  if (teacherId) {
    await createNotification({
      userId: teacherId,
      type: NotificationType.INQUIRY_SUBMITTED,
      title: "New student inquiry",
      message: `${sessionUser.name}: ${inquiry.title}`,
      link: "/teacher/inquiries",
    });
  }

  revalidateInquiries();
  return { success: true, message: "Inquiry submitted." };
}

export async function updateInquiryAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  let sessionUser;
  try {
    sessionUser = await requireStudentSession();
  } catch {
    return { success: false, message: "Unauthorized." };
  }

  const parsed = updateInquirySchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const existing = await prisma.inquiry.findFirst({
    where: { id: parsed.data.id, studentId: sessionUser.id },
  });
  if (!existing) {
    return { success: false, message: "Inquiry not found." };
  }
  if (existing.status !== InquiryStatus.OPEN) {
    return { success: false, message: "Only open inquiries can be edited." };
  }

  const keepUrls = formData.getAll("keepAttachmentUrls").map(String).filter(Boolean);
  let newUrls: string[] = [];
  const files = parseAttachmentFiles(formData);
  if (files.length) {
    try {
      newUrls = await saveInquiryAttachments(files);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }
  const attachmentUrls = [...keepUrls, ...newUrls];

  await prisma.$transaction([
    prisma.inquiryEdit.create({
      data: {
        inquiryId: existing.id,
        titleBefore: existing.title,
        bodyBefore: existing.body,
        attachmentsBefore: existing.attachmentUrls,
      },
    }),
    prisma.inquiry.update({
      where: { id: existing.id },
      data: {
        title: parsed.data.title,
        body: parsed.data.body,
        attachmentUrls,
      },
    }),
  ]);

  const teacherId = await getTeacherUserId();
  if (teacherId) {
    await createNotification({
      userId: teacherId,
      type: NotificationType.INQUIRY_UPDATED,
      title: "Inquiry updated",
      message: `${sessionUser.name}: ${parsed.data.title}`,
      link: "/teacher/inquiries",
    });
  }

  revalidateInquiries();
  return { success: true, message: "Inquiry updated." };
}

export async function getStudentInquiries() {
  let sessionUser;
  try {
    sessionUser = await requireStudentSession();
  } catch {
    return [];
  }

  return prisma.inquiry.findMany({
    where: { studentId: sessionUser.id },
    orderBy: { createdAt: "desc" },
    include: {
      edits: { orderBy: { editedAt: "desc" } },
    },
  });
}

export async function getTeacherInquiries() {
  const session = await requireTeacherSession();
  if (!session) {
    return [];
  }

  return prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      student: {
        select: { id: true, name: true, email: true, grade: true },
      },
      edits: { orderBy: { editedAt: "asc" } },
    },
  });
}

export async function updateInquiryStatusAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireTeacherSession();
  if (!session) {
    return { success: false, message: "Unauthorized." };
  }

  const parsed = updateInquiryStatusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    teacherNote: formData.get("teacherNote") || undefined,
  });
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const inquiry = await prisma.inquiry.findUnique({
    where: { id: parsed.data.id },
  });
  if (!inquiry) {
    return { success: false, message: "Inquiry not found." };
  }

  await prisma.inquiry.update({
    where: { id: parsed.data.id },
    data: {
      status: parsed.data.status,
      teacherNote: parsed.data.teacherNote?.trim() || inquiry.teacherNote,
    },
  });

  await createNotification({
    userId: inquiry.studentId,
    type: NotificationType.INQUIRY_STATUS_CHANGED,
    title: "Inquiry status updated",
    message: `Your inquiry "${inquiry.title}" is now ${parsed.data.status.toLowerCase()}.`,
    link: "/student/inquiries",
  });

  revalidateInquiries();
  return { success: true, message: "Inquiry status updated." };
}
