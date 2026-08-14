"use server";

import {
  AssignmentTarget,
  FeeStatus,
  Role,
  type Prisma,
} from "@prisma/client";
import { getCurrentMonthYear, getFeePaymentLabelKey } from "@/lib/fees";
import type { FeePaymentLabelKey } from "@/lib/fees";
import { prisma } from "@/lib/prisma";
import { requireStudentSession } from "@/lib/server-auth";
import { requireTeacherSession } from "@/lib/teacher-auth";

export type TeacherDashboardFilters = {
  subjectId?: string;
  grade?: string;
  month?: number;
  year?: number;
};

function buildStudentWhere(filters: TeacherDashboardFilters): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = { role: Role.STUDENT };
  if (filters.grade) {
    where.grade = filters.grade;
  }
  if (filters.subjectId) {
    where.enrollments = { some: { subjectId: filters.subjectId } };
  }
  return where;
}

function buildFeeStudentWhere(filters: TeacherDashboardFilters): Prisma.UserWhereInput {
  return buildStudentWhere(filters);
}

function startOfWeekWindow() {
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + 7);
  return { now, end };
}

export type TeacherDashboardStudentRow = {
  id: string;
  name: string;
  grade: string | null;
  subjects: { id: string; name: string }[];
  feePaymentLabelKey: FeePaymentLabelKey;
  isDisabled: boolean;
  form: {
    id: string;
    name: string;
    email: string;
    age: number | null;
    grade: string | null;
    school: string | null;
    stream: string | null;
    phone: string | null;
    whatsapp: string | null;
    avatarUrl: string | null;
    subjectIds: string[];
    tagIds: string[];
  };
};

export type TeacherDashboardData = {
  filters: { month: number; year: number };
  stats: {
    totalStudents: number;
    pendingFeeReviews: number;
    unpaidFees: number;
    assignmentsDueThisWeek: number;
  };
  students: TeacherDashboardStudentRow[];
  subjects: { id: string; name: string }[];
  grades: string[];
  recentHomework: {
    id: string;
    studentName: string;
    subjectName: string;
    assignmentTitle: string;
    date: string;
  }[];
  recentFeeProofs: {
    id: string;
    studentName: string;
    subjectName: string;
    date: string;
  }[];
};

export async function getTeacherDashboard(
  filters: TeacherDashboardFilters = {},
): Promise<TeacherDashboardData | null> {
  const session = await requireTeacherSession();
  if (!session) {
    return null;
  }

  const { month: defaultMonth, year: defaultYear } = getCurrentMonthYear();
  const month = filters.month ?? defaultMonth;
  const year = filters.year ?? defaultYear;
  const studentWhere = buildStudentWhere(filters);
  const feeStudentWhere = buildFeeStudentWhere(filters);
  const { now, end: weekEnd } = startOfWeekWindow();

  const assignmentWhere: Prisma.AssignmentWhereInput = {
    published: true,
    deadline: { gte: now, lte: weekEnd },
  };
  if (filters.subjectId) {
    assignmentWhere.subjectId = filters.subjectId;
  }
  if (filters.grade) {
    assignmentWhere.AND = [
      {
        OR: [
          { targetType: AssignmentTarget.GRADE, grade: filters.grade },
          { targetType: AssignmentTarget.INDIVIDUAL },
        ],
      },
    ];
  }

  const submissionWhere: Prisma.SubmissionWhereInput = {
    student: studentWhere,
  };
  if (filters.subjectId) {
    submissionWhere.assignment = { subjectId: filters.subjectId };
  }

  const feeProofWhere: Prisma.FeeRecordWhereInput = {
    submittedAt: { not: null },
    student: feeStudentWhere,
  };
  if (filters.subjectId) {
    feeProofWhere.subjectId = filters.subjectId;
  }

  const [
    studentsRaw,
    totalStudents,
    pendingFeeReviews,
    unpaidFees,
    assignmentsDueThisWeek,
    recentHomeworkRows,
    recentFeeProofRows,
    subjectsRows,
    gradeRows,
  ] = await Promise.all([
    prisma.user.findMany({
      where: studentWhere,
      orderBy: { name: "asc" },
      include: {
        enrollments: {
          include: { subject: { select: { id: true, name: true } } },
        },
        feeRecords: {
          where: { month, year },
        },
        tagAssignments: {
          select: { tagId: true },
        },
      },
    }),
    prisma.user.count({ where: studentWhere }),
    prisma.feeRecord.count({
      where: {
        month,
        year,
        status: FeeStatus.PENDING,
        student: feeStudentWhere,
        ...(filters.subjectId ? { subjectId: filters.subjectId } : {}),
      },
    }),
    prisma.feeRecord.count({
      where: {
        month,
        year,
        status: FeeStatus.UNPAID,
        student: feeStudentWhere,
        ...(filters.subjectId ? { subjectId: filters.subjectId } : {}),
      },
    }),
    prisma.assignment.count({ where: assignmentWhere }),
    prisma.submission.findMany({
      where: submissionWhere,
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        student: { select: { name: true } },
        assignment: {
          include: { subject: { select: { name: true } } },
        },
      },
    }),
    prisma.feeRecord.findMany({
      where: feeProofWhere,
      orderBy: { submittedAt: "desc" },
      take: 5,
      include: {
        student: { select: { name: true } },
        subject: { select: { name: true } },
      },
    }),
    prisma.subject.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.user.findMany({
      where: { role: Role.STUDENT, grade: { not: null } },
      select: { grade: true },
      distinct: ["grade"],
    }),
  ]);

  const students: TeacherDashboardStudentRow[] = studentsRaw.map((s) => ({
    id: s.id,
    name: s.name,
    grade: s.grade,
    subjects: s.enrollments.map((e) => ({
      id: e.subject.id,
      name: e.subject.name,
    })),
    feePaymentLabelKey: getFeePaymentLabelKey(s.feeRecords),
    isDisabled: s.isDisabled,
    form: {
      id: s.id,
      name: s.name,
      email: s.email,
      age: s.age,
      grade: s.grade,
      school: s.school,
      stream: s.stream,
      phone: s.phone,
      whatsapp: s.whatsapp,
      avatarUrl: s.avatarUrl,
      subjectIds: s.enrollments.map((e) => e.subjectId),
      tagIds: s.tagAssignments.map((row) => row.tagId),
    },
  }));

  const grades = gradeRows
    .map((g) => g.grade)
    .filter((g): g is string => Boolean(g))
    .sort();

  return {
    filters: { month, year },
    stats: {
      totalStudents,
      pendingFeeReviews,
      unpaidFees,
      assignmentsDueThisWeek,
    },
    students,
    subjects: subjectsRows,
    grades,
    recentHomework: recentHomeworkRows.map((row) => ({
      id: row.id,
      studentName: row.student.name,
      subjectName: row.assignment.subject.name,
      assignmentTitle: row.assignment.title,
      date: row.createdAt.toISOString(),
    })),
    recentFeeProofs: recentFeeProofRows.map((row) => ({
      id: row.id,
      studentName: row.student.name,
      subjectName: row.subject.name,
      date: (row.submittedAt ?? row.updatedAt).toISOString(),
    })),
  };
}

export type StudentDashboardData = {
  student: { name: string; grade: string | null };
  tags: { id: string; name: string; color: string | null }[];
  stats: {
    enrolledSubjects: number;
    pendingAssignments: number;
    dueWithinThreeDays: number;
    recentSubmissionsCount: number;
  };
  subjects: {
    id: string;
    name: string;
    color: string | null;
    feeStatus: FeeStatus;
  }[];
  pendingAssignments: {
    id: string;
    title: string;
    subjectName: string;
    deadline: string;
  }[];
  closingDeadlines: {
    id: string;
    title: string;
    subjectName: string;
    deadline: string;
  }[];
  recentSubmissions: {
    id: string;
    assignmentTitle: string;
    subjectName: string;
    status: string;
    marks: number | null;
    date: string;
  }[];
};

function assignmentTargetsStudent(
  assignment: {
    targetType: AssignmentTarget;
    grade: string | null;
    individualStudentId: string | null;
  },
  studentId: string,
  grade: string,
) {
  if (assignment.targetType === AssignmentTarget.INDIVIDUAL) {
    return assignment.individualStudentId === studentId;
  }
  return Boolean(assignment.grade && assignment.grade === grade);
}

export async function getStudentDashboard(): Promise<StudentDashboardData | null> {
  let sessionUser;
  try {
    sessionUser = await requireStudentSession();
  } catch {
    return null;
  }

  const { month, year } = getCurrentMonthYear();
  const now = new Date();
  const threeDaysLater = new Date(now);
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const student = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      enrollments: {
        include: {
          subject: {
            select: { id: true, name: true, color: true },
          },
        },
      },
      submissions: { orderBy: { createdAt: "desc" } },
      feeRecords: {
        where: { month, year },
        include: { subject: { select: { id: true } } },
      },
      tagAssignments: {
        include: { tag: { select: { id: true, name: true, color: true } } },
        orderBy: { tag: { name: "asc" } },
      },
    },
  });

  if (!student) {
    return null;
  }

  const subjectIds = student.enrollments.map((e) => e.subjectId);
  const grade = student.grade ?? "";

  const assignments =
    subjectIds.length === 0
      ? []
      : await prisma.assignment.findMany({
          where: {
            published: true,
            subjectId: { in: subjectIds },
            OR: [
              { targetType: AssignmentTarget.GRADE, grade },
              {
                targetType: AssignmentTarget.INDIVIDUAL,
                individualStudentId: student.id,
              },
            ],
          },
          include: { subject: { select: { name: true } } },
          orderBy: { deadline: "asc" },
        });

  const latestByAssignment = new Map<string, (typeof student.submissions)[number]>();
  for (const submission of student.submissions) {
    if (!latestByAssignment.has(submission.assignmentId)) {
      latestByAssignment.set(submission.assignmentId, submission);
    }
  }

  const targetedAssignments = assignments.filter((a) =>
    assignmentTargetsStudent(a, student.id, grade),
  );

  const pendingAssignments = targetedAssignments.filter(
    (a) => !latestByAssignment.has(a.id),
  );

  const closingDeadlines = pendingAssignments.filter(
    (a) => a.deadline >= now && a.deadline <= threeDaysLater,
  );

  const recentSubmissionsCount = student.submissions.filter(
    (s) => s.createdAt >= thirtyDaysAgo,
  ).length;

  const feeBySubject = new Map(
    student.feeRecords.map((r) => [r.subjectId, r.status] as const),
  );

  const recentSubmissionRows = await prisma.submission.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      assignment: {
        include: { subject: { select: { name: true } } },
      },
    },
  });

  return {
    student: { name: student.name, grade: student.grade },
    tags: student.tagAssignments.map((row) => ({
      id: row.tag.id,
      name: row.tag.name,
      color: row.tag.color,
    })),
    stats: {
      enrolledSubjects: student.enrollments.length,
      pendingAssignments: pendingAssignments.length,
      dueWithinThreeDays: closingDeadlines.length,
      recentSubmissionsCount,
    },
    subjects: student.enrollments.map((e) => ({
      id: e.subject.id,
      name: e.subject.name,
      color: e.subject.color,
      feeStatus: feeBySubject.get(e.subjectId) ?? FeeStatus.UNPAID,
    })),
    pendingAssignments: pendingAssignments.map((a) => ({
      id: a.id,
      title: a.title,
      subjectName: a.subject.name,
      deadline: a.deadline.toISOString(),
    })),
    closingDeadlines: closingDeadlines.map((a) => ({
      id: a.id,
      title: a.title,
      subjectName: a.subject.name,
      deadline: a.deadline.toISOString(),
    })),
    recentSubmissions: recentSubmissionRows.map((row) => ({
      id: row.id,
      assignmentTitle: row.assignment.title,
      subjectName: row.assignment.subject.name,
      status: row.status,
      marks: row.marks,
      date: row.createdAt.toISOString(),
    })),
  };
}
