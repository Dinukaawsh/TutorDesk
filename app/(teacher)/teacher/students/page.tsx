import { Suspense } from "react";
import { FeeStatus } from "@prisma/client";
import { listStudents } from "@/actions/student.actions";
import { listInstitutes } from "@/actions/institute.actions";
import { listSubjects } from "@/actions/subject.actions";
import { listStudentTags } from "@/actions/tag.actions";
import { PageHeader } from "@/components/layout/page-header";
import { StudentsPageClient } from "@/components/students/students-page-client";
import { formatFeeSummary, getFeePaymentLabelKey } from "@/lib/fees";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function param(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export default async function TeacherStudentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = param(params.q);
  const grade = param(params.grade);
  const subjectId = param(params.subjectId);
  const tagId = param(params.tagId);
  const instituteId = param(params.instituteId);
  const status = param(params.status) as "enabled" | "disabled" | undefined;
  const feeStatusRaw = param(params.feeStatus);
  const feeStatus =
    feeStatusRaw === "UNPAID" || feeStatusRaw === "PENDING" || feeStatusRaw === "PAID"
      ? (feeStatusRaw as FeeStatus)
      : undefined;

  const [subjectsRows, studentsRows, tagRows, instituteRows] = await Promise.all([
    listSubjects(),
    listStudents({
      q,
      grade,
      subjectId,
      tagId,
      instituteId,
      status: status === "enabled" || status === "disabled" ? status : undefined,
      feeStatus,
    }),
    listStudentTags(),
    listInstitutes(),
  ]);

  const subjects = subjectsRows.map((s) => ({ id: s.id, name: s.name }));
  const tags = tagRows.map((tag) => ({ id: tag.id, name: tag.name, color: tag.color }));
  const tagStats = tagRows.map((tag) => ({
    id: tag.id,
    name: tag.name,
    color: tag.color,
    count: tag._count.assignments,
  }));
  const institutes = instituteRows.map((i) => ({
    id: i.id,
    name: i.name,
    location: i.location,
  }));
  const grades = [
    ...new Set(
      studentsRows
        .map((s) => s.grade)
        .filter((g): g is string => Boolean(g)),
    ),
  ].sort();

  const students = studentsRows.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone,
    whatsapp: s.whatsapp,
    grade: s.grade,
    institute: s.institute
      ? { id: s.institute.id, name: s.institute.name, location: s.institute.location }
      : null,
    isDisabled: s.isDisabled,
    avatarUrl: s.avatarUrl,
    subjects: s.enrollments.map((e) => ({
      id: e.subject.id,
      name: e.subject.name,
    })),
    tags: s.tagAssignments.map((row) => ({
      id: row.tag.id,
      name: row.tag.name,
      color: row.tag.color,
    })),
    feeSummary: formatFeeSummary(s.feeRecords),
    feePaymentLabelKey: getFeePaymentLabelKey(s.feeRecords),
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
      instituteId: s.instituteId,
    },
  }));

  return (
    <>
      <PageHeader
        title="Students"
        description="Manage student profiles, enrollments, and account access"
      />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading filters...</p>}>
        <StudentsPageClient
          students={students}
          subjects={subjects}
          grades={grades}
          tags={tags}
          institutes={institutes}
          tagStats={tagStats}
        />
      </Suspense>
    </>
  );
}
