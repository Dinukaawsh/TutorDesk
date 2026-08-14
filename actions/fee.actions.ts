"use server";

import { revalidatePath } from "next/cache";
import { FeeStatus, NotificationType, Role } from "@prisma/client";
import type { ActionResult } from "@/actions/auth.actions";
import type { FeeListFilters } from "@/schemas/fee.schema";
import {
  approveFeeSchema,
  manualMarkPaidSchema,
  rejectFeeSchema,
  submitFeeProofSchema,
} from "@/schemas/fee.schema";
import { getCurrentMonthYear } from "@/lib/fees";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { requireStudentSession, requireTeacherSession } from "@/lib/server-auth";
import { saveFeeProof } from "@/lib/uploads";

function revalidateFeePaths() {
  revalidatePath("/teacher/fees");
  revalidatePath("/student/fees");
}

async function ensureStudentFeeRecords(studentId: string, month: number, year: number) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: studentId },
    select: { subjectId: true },
  });

  for (const { subjectId } of enrollments) {
    await prisma.feeRecord.upsert({
      where: {
        studentId_subjectId_month_year: {
          studentId,
          subjectId,
          month,
          year,
        },
      },
      create: {
        studentId,
        subjectId,
        month,
        year,
        status: FeeStatus.UNPAID,
      },
      update: {},
    });
  }
}

async function notifyTeacherFeeSubmitted(
  studentName: string,
  subjectName: string,
  feeRecordId: string,
) {
  const teacher = await prisma.user.findFirst({
    where: { role: Role.TEACHER },
    select: { id: true },
  });
  if (!teacher) return;

  await createNotification({
    userId: teacher.id,
    type: NotificationType.FEE_SUBMITTED,
    title: "Fee proof submitted",
    message: `${studentName} submitted fee proof for ${subjectName}`,
    link: `/teacher/fees?highlight=${feeRecordId}`,
  });
}

async function notifyStudentFeeReviewed(
  studentId: string,
  subjectName: string,
  status: FeeStatus,
  teacherNote?: string | null,
) {
  const statusLabel = status === FeeStatus.PAID ? "approved" : "needs resubmission";
  const note = teacherNote?.trim() ? ` Note: ${teacherNote.trim()}` : "";
  await createNotification({
    userId: studentId,
    type: NotificationType.FEE_REVIEWED,
    title: "Fee reviewed",
    message: `${subjectName} fee ${statusLabel}.${note}`,
    link: "/student/fees",
  });
}

export async function getTeacherFees(filters: FeeListFilters = {}) {
  try {
    await requireTeacherSession();
  } catch {
    return [];
  }

  const { month: defaultMonth, year: defaultYear } = getCurrentMonthYear();
  const month = filters.month ?? defaultMonth;
  const year = filters.year ?? defaultYear;

  const records = await prisma.feeRecord.findMany({
    where: {
      month,
      year,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.subjectId ? { subjectId: filters.subjectId } : {}),
      ...(filters.studentId ? { studentId: filters.studentId } : {}),
      ...(filters.q?.trim()
        ? {
            student: {
              OR: [
                { name: { contains: filters.q.trim(), mode: "insensitive" } },
                { email: { contains: filters.q.trim(), mode: "insensitive" } },
              ],
            },
          }
        : {}),
    },
    include: {
      student: {
        select: { id: true, name: true, email: true, grade: true },
      },
      subject: { select: { id: true, name: true, color: true } },
    },
    orderBy: [{ status: "asc" }, { student: { name: "asc" } }],
  });

  return records;
}

export async function getStudentFees() {
  let student;
  try {
    student = await requireStudentSession();
  } catch {
    return [];
  }

  const { month, year } = getCurrentMonthYear();
  await ensureStudentFeeRecords(student.id, month, year);

  return prisma.feeRecord.findMany({
    where: { studentId: student.id, month, year },
    include: {
      subject: { select: { id: true, name: true, color: true } },
    },
    orderBy: { subject: { name: "asc" } },
  });
}

export async function submitFeeProofAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  let student;
  try {
    student = await requireStudentSession();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const raw = {
    feeRecordId: formData.get("feeRecordId"),
    studentNote: formData.get("studentNote") || undefined,
  };

  const parsed = submitFeeProofSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const record = await prisma.feeRecord.findFirst({
    where: { id: parsed.data.feeRecordId, studentId: student.id },
    include: { subject: true, student: { select: { name: true } } },
  });

  if (!record) {
    return { success: false, message: "Fee record not found" };
  }

  if (record.status === FeeStatus.PAID) {
    return { success: false, message: "This fee is already marked paid" };
  }

  if (record.status === FeeStatus.PENDING) {
    return { success: false, message: "Proof is already pending review" };
  }

  const proof = formData.get("proof");
  if (!(proof instanceof File) || proof.size === 0) {
    return {
      success: false,
      fieldErrors: { proof: ["Upload a photo or PDF"] },
    };
  }

  let proofUrl: string;
  try {
    proofUrl = await saveFeeProof(proof);
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Upload failed",
    };
  }

  await prisma.feeRecord.update({
    where: { id: record.id },
    data: {
      status: FeeStatus.PENDING,
      proofUrl,
      studentNote: parsed.data.studentNote || null,
      teacherNote: null,
      submittedAt: new Date(),
      reviewedAt: null,
    },
  });

  await notifyTeacherFeeSubmitted(
    record.student.name,
    record.subject.name,
    record.id,
  );

  revalidateFeePaths();
  return { success: true, message: "Proof submitted for review" };
}

export async function approveFeeAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireTeacherSession();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const raw = {
    feeRecordId: formData.get("feeRecordId"),
    teacherNote: formData.get("teacherNote") || undefined,
  };

  const parsed = approveFeeSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, message: "Invalid request" };
  }

  const record = await prisma.feeRecord.findUnique({
    where: { id: parsed.data.feeRecordId },
    include: { subject: true },
  });

  if (!record) {
    return { success: false, message: "Fee record not found" };
  }

  if (record.status !== FeeStatus.PENDING) {
    return { success: false, message: "Only pending fees can be approved" };
  }

  await prisma.feeRecord.update({
    where: { id: record.id },
    data: {
      status: FeeStatus.PAID,
      teacherNote: parsed.data.teacherNote || null,
      reviewedAt: new Date(),
    },
  });

  await notifyStudentFeeReviewed(
    record.studentId,
    record.subject.name,
    FeeStatus.PAID,
    parsed.data.teacherNote,
  );

  revalidateFeePaths();
  return { success: true, message: "Marked as paid" };
}

export async function rejectFeeAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireTeacherSession();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const raw = {
    feeRecordId: formData.get("feeRecordId"),
    teacherNote: formData.get("teacherNote"),
  };

  const parsed = rejectFeeSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const record = await prisma.feeRecord.findUnique({
    where: { id: parsed.data.feeRecordId },
    include: { subject: true },
  });

  if (!record) {
    return { success: false, message: "Fee record not found" };
  }

  if (record.status !== FeeStatus.PENDING) {
    return { success: false, message: "Only pending fees can be rejected" };
  }

  await prisma.feeRecord.update({
    where: { id: record.id },
    data: {
      status: FeeStatus.UNPAID,
      teacherNote: parsed.data.teacherNote,
      reviewedAt: new Date(),
      proofUrl: null,
      submittedAt: null,
    },
  });

  await notifyStudentFeeReviewed(
    record.studentId,
    record.subject.name,
    FeeStatus.UNPAID,
    parsed.data.teacherNote,
  );

  revalidateFeePaths();
  return { success: true, message: "Proof rejected" };
}

export async function manualMarkPaidAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireTeacherSession();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const raw = {
    feeRecordId: formData.get("feeRecordId"),
    teacherNote: formData.get("teacherNote") || undefined,
  };

  const parsed = manualMarkPaidSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, message: "Invalid request" };
  }

  const record = await prisma.feeRecord.findUnique({
    where: { id: parsed.data.feeRecordId },
    include: { subject: true },
  });

  if (!record) {
    return { success: false, message: "Fee record not found" };
  }

  if (record.status === FeeStatus.PAID) {
    return { success: false, message: "Already paid" };
  }

  await prisma.feeRecord.update({
    where: { id: record.id },
    data: {
      status: FeeStatus.PAID,
      teacherNote: parsed.data.teacherNote || null,
      reviewedAt: new Date(),
    },
  });

  await notifyStudentFeeReviewed(
    record.studentId,
    record.subject.name,
    FeeStatus.PAID,
    parsed.data.teacherNote ?? "Marked paid by teacher",
  );

  revalidateFeePaths();
  return { success: true, message: "Marked as paid" };
}

export async function getFeeStatusSummary(filters: FeeListFilters = {}) {
  const records = await getTeacherFees(filters);
  return records.reduce(
    (acc, record) => {
      acc[record.status] += 1;
      return acc;
    },
    { UNPAID: 0, PENDING: 0, PAID: 0 } as Record<FeeStatus, number>,
  );
}
