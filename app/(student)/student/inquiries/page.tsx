import { getStudentInquiries } from "@/actions/inquiry.actions";
import { StudentInquiryList } from "@/components/inquiries/student-inquiry-list";
import { PageHeader } from "@/components/layout/page-header";

export default async function StudentInquiriesPage() {
  const inquiries = await getStudentInquiries();

  return (
    <>
      <PageHeader
        title="Inquiries"
        description="Ask your teacher questions or request help"
      />
      <StudentInquiryList inquiries={inquiries} />
    </>
  );
}
