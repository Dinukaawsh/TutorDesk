import { Suspense } from "react";
import { getTeacherInquiries } from "@/actions/inquiry.actions";
import { listInstitutes } from "@/actions/institute.actions";
import { InquiryFilters } from "@/components/inquiries/inquiry-filters";
import { TeacherInquiryList } from "@/components/inquiries/teacher-inquiry-list";
import { PageHeader } from "@/components/layout/page-header";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function param(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export default async function TeacherInquiriesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const instituteId = param(params.instituteId);

  const [inquiries, instituteRows] = await Promise.all([
    getTeacherInquiries({ instituteId }),
    listInstitutes(),
  ]);

  const institutes = instituteRows.map((i) => ({ id: i.id, name: i.name }));

  return (
    <>
      <PageHeader
        title="Inquiries"
        description="Review student questions and update their status"
      />
      <div className="space-y-4">
        <Suspense fallback={null}>
          <InquiryFilters institutes={institutes} />
        </Suspense>
        <TeacherInquiryList inquiries={inquiries} />
      </div>
    </>
  );
}
