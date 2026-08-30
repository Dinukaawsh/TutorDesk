import { listInstitutes } from "@/actions/institute.actions";
import { InstitutesPageClient } from "@/components/institutes/institutes-page-client";
import { PageHeader } from "@/components/layout/page-header";

export default async function TeacherInstitutesPage() {
  const rows = await listInstitutes();
  const institutes = rows.map((institute) => ({
    id: institute.id,
    name: institute.name,
    location: institute.location,
    address: institute.address,
    phone: institute.phone,
    logoUrl: institute.logoUrl,
    studentCount: institute._count.students,
  }));

  return (
    <>
      <PageHeader
        title="Institutes"
        description="Manage branches or locations and assign students to each institute"
      />
      <InstitutesPageClient institutes={institutes} />
    </>
  );
}
