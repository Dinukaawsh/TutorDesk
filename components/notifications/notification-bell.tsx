import { NotificationDropdown } from "@/components/notifications/notification-dropdown";

type NotificationBellProps = {
  role: "teacher" | "student";
  initialUnread?: number;
};

export function NotificationBell({ role, initialUnread }: NotificationBellProps) {
  const href =
    role === "teacher" ? "/teacher/notifications" : "/student/notifications";
  return <NotificationDropdown notificationsHref={href} initialUnread={initialUnread} />;
}
