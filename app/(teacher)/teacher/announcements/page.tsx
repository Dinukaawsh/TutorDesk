import { getTeacherAnnouncements } from "@/actions/announcement.actions";
import { listInstitutes } from "@/actions/institute.actions";
import { listSubjects } from "@/actions/subject.actions";
import { TeacherAnnouncementsClient } from "@/components/announcements/teacher-announcements-client";
import { PageHeader } from "@/components/layout/page-header";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export default async function TeacherAnnouncementsPage() {
  const [announcements, subjects, instituteRows] = await Promise.all([
    getTeacherAnnouncements(),
    listSubjects(),
    listInstitutes(),
  ]);

  const gradeRows = await prisma.user.findMany({
    where: { role: Role.STUDENT, grade: { not: null } },
    select: { grade: true },
    distinct: ["grade"],
  });
  const grades = gradeRows
    .map((g) => g.grade)
    .filter((g): g is string => Boolean(g))
    .sort();

  return (
    <>
      <PageHeader
        title="Announcements"
        description="Broadcast messages to all students or targeted groups"
      />
      <TeacherAnnouncementsClient
        announcements={announcements}
        subjects={subjects.map((s) => ({ id: s.id, name: s.name }))}
        institutes={instituteRows.map((i) => ({ id: i.id, name: i.name, location: i.location }))}
        grades={grades}
      />
    </>
  );
}
