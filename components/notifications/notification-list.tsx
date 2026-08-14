import type { Notification } from "@prisma/client";
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
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
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
