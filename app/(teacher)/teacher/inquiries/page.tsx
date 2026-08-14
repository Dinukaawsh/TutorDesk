import { getTeacherInquiries } from "@/actions/inquiry.actions";
import { TeacherInquiryList } from "@/components/inquiries/teacher-inquiry-list";
import { PageHeader } from "@/components/layout/page-header";

export default async function TeacherInquiriesPage() {
  const inquiries = await getTeacherInquiries();

  return (
    <>
      <PageHeader
        title="Inquiries"
        description="Review student questions and update their status"
      />
      <TeacherInquiryList inquiries={inquiries} />
    </>
  );
}
