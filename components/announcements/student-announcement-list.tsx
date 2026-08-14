import { AnnouncementList } from "@/components/announcements/announcement-list";

type StudentAnnouncementListProps = {
  announcements: Parameters<typeof AnnouncementList>[0]["announcements"];
};

export function StudentAnnouncementList({ announcements }: StudentAnnouncementListProps) {
  return <AnnouncementList announcements={announcements} />;
}
