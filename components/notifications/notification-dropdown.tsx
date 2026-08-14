"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import type { Notification } from "@prisma/client";
import {
  getNotificationsAction,
  getUnreadCountAction,
  markAllReadAction,
} from "@/actions/notification.actions";
import { NotificationList } from "@/components/notifications/notification-list";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NotificationDropdownProps = {
  notificationsHref: string;
  initialUnread?: number;
};

export function NotificationDropdown({
  notificationsHref,
  initialUnread = 0,
}: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(initialUnread);
  const [items, setItems] = useState<Notification[]>([]);
  const [pending, startTransition] = useTransition();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUnread(initialUnread);
  }, [initialUnread]);

  useEffect(() => {
    if (!open) return;
    startTransition(async () => {
      const data = await getNotificationsAction(8);
      setItems(data);
      const count = await getUnreadCountAction();
      setUnread(count);
    });
  }, [open]);

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", onDocClick);
    }
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  function handleMarkAll() {
    startTransition(async () => {
      await markAllReadAction();
      setUnread(0);
      setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date() })));
    });
  }

  return (
    <div className="relative" ref={panelRef}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="relative"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </Button>
      {open ? (
        <div
          className={cn(
            "absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-white shadow-lg",
            pending && "opacity-90",
          )}
        >
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            <Button type="button" variant="ghost" size="sm" onClick={handleMarkAll} disabled={pending || unread === 0}>
              Mark all read
            </Button>
          </div>
          <div className="max-h-80 overflow-y-auto p-1">
            <NotificationList notifications={items} compact emptyMessage="You're all caught up." />
          </div>
          <div className="border-t border-border p-2">
            <Button asChild variant="ghost" size="sm" className="w-full">
              <Link href={notificationsHref} onClick={() => setOpen(false)}>
                View all
              </Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
