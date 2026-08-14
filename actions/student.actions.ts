"use server";

import { revalidatePath } from "next/cache";
import {
  FeeStatus,
  NotificationType,
  Role,
  type Prisma,
} from "@prisma/client";
import type { ActionResult } from "@/actions/auth.actions";
import { hashPassword } from "@/lib/auth";
import { getCurrentMonthYear } from "@/lib/fees";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { saveAvatarFile } from "@/lib/save-avatar";
import { requireTeacherSession } from "@/lib/teacher-auth";
import {
  bulkDisableSchema,
  bulkEnableSchema,
  createStudentSchema,
  disableStudentSchema,
  resetPasswordSchema,
  studentIdSchema,
  updateStudentSchema,
} from "@/schemas/student.schema";

function revalidateStudents() {
  revalidatePath("/teacher/students");
}

function parseSubjectIds(formData: FormData) {
  return formData.getAll("subjectIds").map(String).filter(Boolean);
}

function parseTagIds(formData: FormData) {
  return formData.getAll("tagIds").map(String).filter(Boolean);
}

async function ensureFeeRecordsForEnrollments(
  studentId: string,
  subjectIds: string[],
) {
  const { month, year } = getCurrentMonthYear();
  for (const subjectId of subjectIds) {
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

async function syncEnrollments(studentId: string, subjectIds: string[]) {
  const uniqueIds = [...new Set(subjectIds)];
  const existing = await prisma.enrollment.findMany({
    where: { userId: studentId },
    select: { subjectId: true },
  });
  const existingIds = new Set(existing.map((e) => e.subjectId));
  const toAdd = uniqueIds.filter((id) => !existingIds.has(id));
  const toRemove = [...existingIds].filter((id) => !uniqueIds.includes(id));

  if (toRemove.length) {
    await prisma.enrollment.deleteMany({
      where: { userId: studentId, subjectId: { in: toRemove } },
    });
  }

  for (const subjectId of toAdd) {
    await prisma.enrollment.create({
      data: { userId: studentId, subjectId },
    });
  }

  await ensureFeeRecordsForEnrollments(studentId, toAdd);
}

async function syncStudentTags(studentId: string, tagIds: string[]) {
  const uniqueIds = [...new Set(tagIds)];
  const existing = await prisma.studentTagAssignment.findMany({
    where: { userId: studentId },
    select: { tagId: true },
  });
  const existingIds = new Set(existing.map((row) => row.tagId));
  const toAdd = uniqueIds.filter((id) => !existingIds.has(id));
  const toRemove = [...existingIds].filter((id) => !uniqueIds.includes(id));

  if (toRemove.length) {
    await prisma.studentTagAssignment.deleteMany({
      where: { userId: studentId, tagId: { in: toRemove } },
    });
  }

  for (const tagId of toAdd) {
    await prisma.studentTagAssignment.create({
      data: { userId: studentId, tagId },
    });
  }
}

export async function createStudentAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireTeacherSession();
  if (!session) {
    return { success: false, message: "Unauthorized." };
  }

  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    age: formData.get("age") || undefined,
    grade: formData.get("grade") || undefined,
    school: formData.get("school") || undefined,
    stream: formData.get("stream") || undefined,
    phone: formData.get("phone") || undefined,
    whatsapp: formData.get("whatsapp") || undefined,
    subjectIds: parseSubjectIds(formData),
    tagIds: parseTagIds(formData),
  };

  const parsed = createStudentSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { success: false, message: "A user with this email already exists." };
  }

  const avatar = formData.get("avatar");
  let avatarUrl: string | null = null;
  if (avatar instanceof File) {
    avatarUrl = await saveAvatarFile(avatar);
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const { password: _pw, subjectIds, tagIds, ...profile } = parsed.data;

  const student = await prisma.user.create({
    data: {
      ...profile,
      email: profile.email,
      name: profile.name,
      role: Role.STUDENT,
      passwordHash,
      avatarUrl,
      age: profile.age ?? null,
      grade: profile.grade || null,
      school: profile.school || null,
      stream: profile.stream || null,
      phone: profile.phone || null,
      whatsapp: profile.whatsapp || null,
    },
  });

  if (subjectIds.length) {
    await syncEnrollments(student.id, subjectIds);
  }
  await syncStudentTags(student.id, tagIds);

  revalidateStudents();
  return { success: true, message: "Student created." };
}

export async function updateStudentAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireTeacherSession();
  if (!session) {
    return { success: false, message: "Unauthorized." };
  }

  const raw = {
    id: formData.get("id"),
    name: formData.get("name"),
    email: formData.get("email"),
    age: formData.get("age") || undefined,
    grade: formData.get("grade") || undefined,
    school: formData.get("school") || undefined,
    stream: formData.get("stream") || undefined,
    phone: formData.get("phone") || undefined,
    whatsapp: formData.get("whatsapp") || undefined,
    subjectIds: parseSubjectIds(formData),
    tagIds: parseTagIds(formData),
  };

  const parsed = updateStudentSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const student = await prisma.user.findFirst({
    where: { id: parsed.data.id, role: Role.STUDENT },
  });
  if (!student) {
    return { success: false, message: "Student not found." };
  }

  if (parsed.data.email !== student.email) {
    const taken = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (taken) {
      return { success: false, message: "Email is already in use." };
    }
  }

  const avatar = formData.get("avatar");
  let avatarUrl = student.avatarUrl;
  if (avatar instanceof File && avatar.size > 0) {
    avatarUrl = (await saveAvatarFile(avatar)) ?? student.avatarUrl;
  }

  const { id, subjectIds, tagIds, ...profile } = parsed.data;

  await prisma.user.update({
    where: { id },
    data: {
      name: profile.name,
      email: profile.email,
      age: profile.age ?? null,
      grade: profile.grade || null,
      school: profile.school || null,
      stream: profile.stream || null,
      phone: profile.phone || null,
      whatsapp: profile.whatsapp || null,
      avatarUrl,
    },
  });

  await syncEnrollments(id, subjectIds);
  await syncStudentTags(id, tagIds);
  revalidateStudents();
  return { success: true, message: "Student updated." };
}

export async function disableStudentAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireTeacherSession();
  if (!session) {
    return { success: false, message: "Unauthorized." };
  }

  const raw = {
    id: formData.get("id"),
    reason: formData.get("reason"),
  };

  const parsed = disableStudentSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const found = await prisma.user.findFirst({ where: { id: parsed.data.id, role: Role.STUDENT } });
  if (!found) {
    return { success: false, message: "Student not found." };
  }

  const student = await prisma.user.update({
    where: { id: parsed.data.id },
    data: {
      isDisabled: true,
      disableReason: parsed.data.reason,
      disabledAt: new Date(),
    },
  });

  await createNotification({
    userId: student.id,
    type: NotificationType.ACCOUNT_DISABLED,
    title: "Account disabled",
    message: parsed.data.reason,
  });

  revalidateStudents();
  return { success: true, message: "Student disabled." };
}

export async function bulkDisableStudentsAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireTeacherSession();
  if (!session) {
    return { success: false, message: "Unauthorized." };
  }

  const raw = {
    ids: formData.getAll("ids").map(String),
    reason: formData.get("reason"),
  };

  const parsed = bulkDisableSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      message: parsed.error.flatten().formErrors[0],
    };
  }

  const now = new Date();
  await prisma.user.updateMany({
    where: { id: { in: parsed.data.ids }, role: Role.STUDENT },
    data: {
      isDisabled: true,
      disableReason: parsed.data.reason,
      disabledAt: now,
    },
  });

  await Promise.all(
    parsed.data.ids.map((userId) =>
      createNotification({
        userId,
        type: NotificationType.ACCOUNT_DISABLED,
        title: "Account disabled",
        message: parsed.data.reason,
      }),
    ),
  );

  revalidateStudents();
  return { success: true, message: "Selected students disabled." };
}

export async function bulkEnableStudentsAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireTeacherSession();
  if (!session) {
    return { success: false, message: "Unauthorized." };
  }

  const raw = {
    ids: formData.getAll("ids").map(String),
  };

  const parsed = bulkEnableSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, message: "Select at least one student." };
  }

  await prisma.user.updateMany({
    where: { id: { in: parsed.data.ids }, role: Role.STUDENT },
    data: {
      isDisabled: false,
      disableReason: null,
      disabledAt: null,
    },
  });

  await Promise.all(
    parsed.data.ids.map((userId) =>
      createNotification({
        userId,
        type: NotificationType.ACCOUNT_ENABLED,
        title: "Account enabled",
        message: "Your account has been re-enabled.",
      }),
    ),
  );

  revalidateStudents();
  return { success: true, message: "Selected students enabled." };
}

export async function resetStudentPasswordAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireTeacherSession();
  if (!session) {
    return { success: false, message: "Unauthorized." };
  }

  const raw = {
    id: formData.get("id"),
    password: formData.get("password"),
  };

  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const idParsed = studentIdSchema.safeParse({ id: parsed.data.id });
  if (!idParsed.success) {
    return { success: false, message: "Invalid student." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const studentForReset = await prisma.user.findFirst({
    where: { id: idParsed.data.id, role: Role.STUDENT },
  });
  if (!studentForReset) {
    return { success: false, message: "Student not found." };
  }

  await prisma.user.update({
    where: { id: idParsed.data.id },
    data: { passwordHash, mustChangePassword: true },
  });

  revalidateStudents();
  return { success: true, message: "Password reset." };
}

export type StudentListFilters = {
  q?: string;
  grade?: string;
  subjectId?: string;
  tagId?: string;
  status?: "enabled" | "disabled";
  feeStatus?: FeeStatus;
};

export async function listStudents(filters: StudentListFilters = {}) {
  const session = await requireTeacherSession();
  if (!session) {
    return [];
  }

  const { month, year } = getCurrentMonthYear();
  const where: Prisma.UserWhereInput = { role: Role.STUDENT };

  if (filters.q?.trim()) {
    const q = filters.q.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
    ];
  }

  if (filters.grade) {
    where.grade = filters.grade;
  }

  if (filters.status === "enabled") {
    where.isDisabled = false;
  } else if (filters.status === "disabled") {
    where.isDisabled = true;
  }

  if (filters.subjectId) {
    where.enrollments = { some: { subjectId: filters.subjectId } };
  }

  if (filters.tagId) {
    where.tagAssignments = { some: { tagId: filters.tagId } };
  }

  if (filters.feeStatus) {
    where.feeRecords = {
      some: {
        month,
        year,
        status: filters.feeStatus,
        ...(filters.subjectId ? { subjectId: filters.subjectId } : {}),
      },
    };
  }

  const students = await prisma.user.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      enrollments: {
        include: { subject: { select: { id: true, name: true, color: true } } },
      },
      feeRecords: {
        where: { month, year },
        include: { subject: { select: { id: true, name: true } } },
      },
      tagAssignments: {
        include: { tag: { select: { id: true, name: true, color: true } } },
        orderBy: { tag: { name: "asc" } },
      },
    },
  });

  return students;
}

