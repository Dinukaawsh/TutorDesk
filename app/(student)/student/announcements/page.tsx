import { getStudentAnnouncements } from "@/actions/announcement.actions";
import { StudentAnnouncementList } from "@/components/announcements/student-announcement-list";
import { PageHeader } from "@/components/layout/page-header";

export default async function StudentAnnouncementsPage() {
  const announcements = await getStudentAnnouncements();

  return (
    <>
      <PageHeader
        title="Announcements"
        description="Messages from your teacher"
      />
      <StudentAnnouncementList announcements={announcements} />
    </>
  );
}
