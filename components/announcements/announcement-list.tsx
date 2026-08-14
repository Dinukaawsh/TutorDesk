import type { Announcement, AnnouncementTarget } from "@prisma/client";
import { formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";

type AnnouncementWithSubject = Announcement & {
  subject: { id: string; name: string; color: string | null } | null;
};

function audienceLabel(row: AnnouncementWithSubject) {
  switch (row.targetType as AnnouncementTarget) {
    case "SUBJECT":
      return row.subject ? `Subject: ${row.subject.name}` : "Subject";
    case "GRADE":
      return row.grade ? `Grade ${row.grade}` : "Grade";
    case "SUBJECT_GRADE":
      return row.subject && row.grade
        ? `${row.subject.name} · Grade ${row.grade}`
        : "Subject & grade";
    default:
      return "All students";
  }
}

type AnnouncementListProps = {
  announcements: AnnouncementWithSubject[];
};

export function AnnouncementList({ announcements }: AnnouncementListProps) {
  if (announcements.length === 0) {
    return <p className="text-sm text-muted-foreground">No announcements yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {announcements.map((item) => (
        <li
          key={item.id}
          className="rounded-xl border border-border bg-white/80 p-4 backdrop-blur"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="font-medium text-foreground">{item.title}</h3>
            <time className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</time>
          </div>
          <div className="mt-2">
            <StatusBadge label={audienceLabel(item)} tone="muted" />
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{item.body}</p>
        </li>
      ))}
    </ul>
  );
}
