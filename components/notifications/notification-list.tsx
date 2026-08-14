import type { Notification } from "@prisma/client";
import { FiInbox } from "react-icons/fi";
import { NotificationItem } from "@/components/notifications/notification-item";

type NotificationListProps = {
  notifications: Notification[];
  compact?: boolean;
  emptyMessage?: string;
};

export function NotificationList({
  notifications,
  compact,
  emptyMessage = "No notifications yet.",
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <FiInbox className="h-8 w-8 text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {notifications.map((notification) => (
        <li key={notification.id}>
          <NotificationItem notification={notification} compact={compact} />
        </li>
      ))}
    </ul>
  );
}
