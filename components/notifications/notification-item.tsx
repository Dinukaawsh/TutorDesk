"use client";

import { useRouter } from "next/navigation";
import type { Notification } from "@prisma/client";
import { markReadAction } from "@/actions/notification.actions";
import { cn } from "@/lib/utils";

type NotificationItemProps = {
  notification: Notification;
  compact?: boolean;
};

function formatWhen(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function NotificationItem({ notification, compact }: NotificationItemProps) {
  const router = useRouter();
  const unread = !notification.readAt;

  async function handleOpen() {
    if (unread) {
      await markReadAction(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleOpen()}
      className={cn(
        "w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted/60",
        unread ? "bg-primary/5" : "bg-transparent",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={cn("font-medium text-foreground", unread && "text-primary")}>
          {notification.title}
        </p>
        {!compact ? (
          <time className="shrink-0 text-xs text-muted-foreground">
            {formatWhen(notification.createdAt)}
          </time>
        ) : null}
      </div>
      <p className="mt-0.5 text-sm text-muted-foreground">{notification.message}</p>
    </button>
  );
}
