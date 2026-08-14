import { PageHeader } from "@/components/layout/page-header";
import { SubjectList } from "@/components/subjects/subject-list";
import { SubjectsPageActions } from "@/components/subjects/subjects-page-actions";
import { listSubjects } from "@/actions/subject.actions";

export default async function TeacherSubjectsPage() {
  const rows = await listSubjects();
  const subjects = rows.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    color: s.color,
    enrollmentCount: s._count.enrollments,
  }));

  return (
    <>
      <PageHeader
        title="Subjects"
        description="Manage subjects for lessons, assignments, and enrollments"
        actions={<SubjectsPageActions />}
      />
      <SubjectList subjects={subjects} />
    </>
  );
}
