"use server";

import { revalidatePath } from "next/cache";
import {
  AssignmentTarget,
  NotificationType,
  Role,
  SubmissionStatus,
} from "@prisma/client";
import type { ActionResult } from "@/actions/auth.actions";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { requireStudentSession, requireTeacherSession } from "@/lib/server-auth";
import { saveAssignmentAttachment, saveSubmissionFiles } from "@/lib/uploads";
import {
  assignmentFormSchema,
  gradeSubmissionSchema,
  reopenSubmissionPortalSchema,
} from "@/schemas/assignment.schema";

async function getTargetedStudentIds(assignmentId: string) {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
  });
  if (!assignment || !assignment.published) return [] as string[];

  if (assignment.targetType === AssignmentTarget.INDIVIDUAL) {
    return assignment.individualStudentId ? [assignment.individualStudentId] : [];
  }

  if (!assignment.grade) return [] as string[];

  const students = await prisma.user.findMany({
    where: {
      role: Role.STUDENT,
      isDisabled: false,
      grade: assignment.grade,
      enrollments: { some: { subjectId: assignment.subjectId } },
    },
    select: { id: true },
  });
  return students.map((s) => s.id);
}

async function notifyStudentsOfAssignment(assignmentId: string) {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { subject: true },
  });
  if (!assignment || !assignment.published) return;

  const studentIds = await getTargetedStudentIds(assignmentId);
  await Promise.all(
    studentIds.map((userId) =>
      createNotification({
        userId,
        type: NotificationType.ASSIGNMENT_PUBLISHED,
        title: "New assignment",
        message: `${assignment.subject.name}: ${assignment.title}`,
        link: `/student/assignments/${assignment.id}`,
      }),
    ),
  );
}

function parseAssignmentForm(formData: FormData) {
  return {
    title: formData.get("title"),
    instructions: formData.get("instructions") || undefined,
    subjectId: formData.get("subjectId"),
    targetType: formData.get("targetType"),
    grade: formData.get("grade") || undefined,
    individualStudentId: formData.get("individualStudentId") || undefined,
    deadline: formData.get("deadline"),
  };
}

function parseResubmitDeadline(value: string): Date | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

function canStudentSubmitLatest(
  latest: {
    status: SubmissionStatus;
    portalOpen: boolean;
    resubmitDeadline: Date | null;
  } | null,
  now: Date,
): boolean {
  if (!latest) {
    return true;
  }
  return (
    latest.status === SubmissionStatus.FAILED &&
    latest.portalOpen &&
    latest.resubmitDeadline != null &&
    now <= latest.resubmitDeadline
  );
}

export async function createAssignmentAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireTeacherSession();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const parsed = assignmentFormSchema.safeParse(parseAssignmentForm(formData));
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;
  const deadline = new Date(data.deadline);
  if (Number.isNaN(deadline.getTime())) {
    return { success: false, message: "Invalid deadline" };
  }

  let attachmentUrl: string | null = null;
  const attachment = formData.get("attachment");
  if (attachment instanceof File && attachment.size > 0) {
    try {
      attachmentUrl = await saveAssignmentAttachment(attachment);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  await prisma.assignment.create({
    data: {
      title: data.title,
      instructions: data.instructions || null,
      attachmentUrl,
      subjectId: data.subjectId,
      grade:
        data.targetType === AssignmentTarget.GRADE ? (data.grade ?? null) : null,
      targetType: data.targetType,
      individualStudentId:
        data.targetType === AssignmentTarget.INDIVIDUAL
          ? (data.individualStudentId ?? null)
          : null,
      deadline,
    },
  });

  revalidatePath("/teacher/assignments");
  return { success: true, message: "Assignment created" };
}

export async function setAssignmentPublishedAction(
  assignmentId: string,
  published: boolean,
): Promise<ActionResult> {
  try {
    await requireTeacherSession();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  await prisma.assignment.update({
    where: { id: assignmentId },
    data: { published },
  });

  if (published) {
    await notifyStudentsOfAssignment(assignmentId);
  }

  revalidatePath("/teacher/assignments");
  revalidatePath(`/teacher/assignments/${assignmentId}`);
  revalidatePath("/student/assignments");
  return {
    success: true,
    message: published ? "Assignment published" : "Assignment unpublished",
  };
}

export async function gradeSubmissionAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireTeacherSession();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const raw = {
    submissionId: formData.get("submissionId"),
    marks: formData.get("marks"),
    status: formData.get("status"),
    feedback: formData.get("feedback") || undefined,
    resubmitDeadline: formData.get("resubmitDeadline") || undefined,
  };

  const parsed = gradeSubmissionSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const submission = await prisma.submission.findUnique({
    where: { id: parsed.data.submissionId },
    include: { assignment: true, student: true },
  });

  if (!submission) {
    return { success: false, message: "Submission not found" };
  }

  let resubmitDeadline: Date | null = null;
  if (parsed.data.status === SubmissionStatus.FAILED) {
    resubmitDeadline = parseResubmitDeadline(parsed.data.resubmitDeadline ?? "");
    if (!resubmitDeadline) {
      return { success: false, message: "Invalid resubmit deadline" };
    }
  }

  await prisma.submission.update({
    where: { id: submission.id },
    data: {
      marks: parsed.data.marks,
      status: parsed.data.status,
      feedback: parsed.data.feedback || null,
      ...(parsed.data.status === SubmissionStatus.FAILED
        ? { portalOpen: true, resubmitDeadline }
        : { portalOpen: false, resubmitDeadline: null }),
    },
  });

  await createNotification({
    userId: submission.studentId,
    type: NotificationType.ASSIGNMENT_GRADED,
    title: "Assignment graded",
    message: `${submission.assignment.title}: ${parsed.data.status}`,
    link: `/student/assignments/${submission.assignmentId}`,
  });

  revalidatePath(`/teacher/assignments/${submission.assignmentId}`);
  revalidatePath(`/student/assignments/${submission.assignmentId}`);
  return { success: true, message: "Submission graded" };
}

export async function reopenSubmissionPortalAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireTeacherSession();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const parsed = reopenSubmissionPortalSchema.safeParse({
    submissionId: formData.get("submissionId"),
    resubmitDeadline: formData.get("resubmitDeadline"),
  });

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const resubmitDeadline = parseResubmitDeadline(parsed.data.resubmitDeadline);
  if (!resubmitDeadline) {
    return { success: false, message: "Invalid resubmit deadline" };
  }

  const submission = await prisma.submission.findUnique({
    where: { id: parsed.data.submissionId },
    include: { assignment: true, student: true },
  });

  if (!submission) {
    return { success: false, message: "Submission not found" };
  }

  await prisma.submission.update({
    where: { id: submission.id },
    data: {
      status: SubmissionStatus.FAILED,
      portalOpen: true,
      resubmitDeadline,
    },
  });

  await createNotification({
    userId: submission.studentId,
    type: NotificationType.ASSIGNMENT_GRADED,
    title: "Resubmission opened",
    message: `${submission.assignment.title}: you may resubmit before the new deadline`,
    link: `/student/assignments/${submission.assignmentId}`,
  });

  revalidatePath(`/teacher/assignments/${submission.assignmentId}`);
  revalidatePath(`/student/assignments/${submission.assignmentId}`);
  return { success: true, message: "Submission portal reopened" };
}

export async function submitAssignmentAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  let student;
  try {
    student = await requireStudentSession();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const assignmentId = String(formData.get("assignmentId") ?? "");
  if (!assignmentId) {
    return { success: false, message: "Assignment not found" };
  }

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { subject: true },
  });

  if (!assignment || !assignment.published) {
    return { success: false, message: "Assignment not available" };
  }

  const enrollment = await prisma.enrollment.findFirst({
    where: { userId: student.id, subjectId: assignment.subjectId },
  });

  const userRecord = await prisma.user.findUnique({ where: { id: student.id } });

  const isIndividualTarget =
    assignment.targetType === AssignmentTarget.INDIVIDUAL &&
    assignment.individualStudentId === student.id;

  const isGradeTarget =
    assignment.targetType === AssignmentTarget.GRADE &&
    assignment.grade &&
    userRecord?.grade === assignment.grade &&
    enrollment;

  if (!isIndividualTarget && !isGradeTarget) {
    return { success: false, message: "You cannot submit this assignment" };
  }

  const latest = await prisma.submission.findFirst({
    where: { assignmentId, studentId: student.id },
    orderBy: { attemptNumber: "desc" },
  });

  const now = new Date();
  const isLate = now > assignment.deadline;

  if (!canStudentSubmitLatest(latest, now)) {
    if (latest && latest.status !== SubmissionStatus.FAILED) {
      return { success: false, message: "You already submitted this assignment" };
    }
    if (latest?.status === SubmissionStatus.FAILED && !latest.portalOpen) {
      return { success: false, message: "The submission portal is closed" };
    }
    if (
      latest?.status === SubmissionStatus.FAILED &&
      latest.resubmitDeadline &&
      now > latest.resubmitDeadline
    ) {
      return { success: false, message: "The resubmit deadline has passed" };
    }
    return { success: false, message: "You cannot submit at this time" };
  }

  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    return {
      success: false,
      fieldErrors: { files: ["Upload at least one photo or PDF"] },
    };
  }

  let fileUrls: string[];
  try {
    fileUrls = await saveSubmissionFiles(files);
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Upload failed",
    };
  }

  const created = await prisma.submission.create({
    data: {
      assignmentId,
      studentId: student.id,
      status: SubmissionStatus.SUBMITTED,
      isLate,
      fileUrls,
      attemptNumber: latest ? latest.attemptNumber + 1 : 1,
      portalOpen: false,
    },
  });

  if (latest) {
    await prisma.submission.update({
      where: { id: latest.id },
      data: { portalOpen: false },
    });
  }

  await prisma.submission.update({
    where: { id: created.id },
    data: { portalOpen: false },
  });

  const teacher = await prisma.user.findFirst({
    where: { role: Role.TEACHER },
    select: { id: true },
  });

  if (teacher) {
    await createNotification({
      userId: teacher.id,
      type: NotificationType.HOMEWORK_SUBMITTED,
      title: "Homework submitted",
      message: `${userRecord?.name ?? "A student"} submitted ${assignment.title}`,
      link: `/teacher/assignments/${assignment.id}`,
    });
  }

  revalidatePath(`/student/assignments/${assignmentId}`);
  revalidatePath("/student/assignments");
  revalidatePath(`/teacher/assignments/${assignmentId}`);
  return { success: true, message: isLate ? "Submitted (late)" : "Submitted" };
}

export async function toggleAssignmentPublishFormAction(
  assignmentId: string,
  published: boolean,
): Promise<void> {
  await setAssignmentPublishedAction(assignmentId, published);
}
