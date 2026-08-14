"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { NotificationType } from "@prisma/client";
import { getNotificationsAction } from "@/actions/notification.actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SHOWN_KEY = "tutordesk_ann_alert_shown";
const POLL_MS = 30_000;

type AlertItem = {
  id: string;
  title: string;
  link: string | null;
};

function readShownIds(): Set<string> {
  if (typeof window === "undefined") {
    return new Set();
  }
  try {
    const raw = sessionStorage.getItem(SHOWN_KEY);
    if (!raw) {
      return new Set();
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return new Set();
    }
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

function writeShownIds(ids: Set<string>) {
  sessionStorage.setItem(SHOWN_KEY, JSON.stringify([...ids]));
}

function playNotificationBeep() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) {
      return;
    }
    const ctx = new Ctx();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.value = 0.08;
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    window.setTimeout(() => {
      oscillator.stop();
      void ctx.close();
    }, 180);
  } catch {
    // ignore audio failures
  }
}

export function AnnouncementAlert() {
  const [alert, setAlert] = useState<AlertItem | null>(null);
  const shownRef = useRef<Set<string>>(new Set());

  const pickAnnouncement = useCallback(async () => {
    const notifications = await getNotificationsAction(30);
    const candidate = notifications.find(
      (n) =>
        n.type === NotificationType.ANNOUNCEMENT_PUBLISHED &&
        n.readAt == null &&
        !shownRef.current.has(n.id),
    );
    if (!candidate) {
      return;
    }
    shownRef.current.add(candidate.id);
    writeShownIds(shownRef.current);
    playNotificationBeep();
    setAlert({
      id: candidate.id,
      title: candidate.title,
      link: candidate.link,
    });
  }, []);

  useEffect(() => {
    shownRef.current = readShownIds();
    void pickAnnouncement();
    const interval = window.setInterval(() => {
      void pickAnnouncement();
    }, POLL_MS);
    return () => window.clearInterval(interval);
  }, [pickAnnouncement]);

  function dismiss() {
    setAlert(null);
  }

  if (!alert) {
    return null;
  }

  const href = alert.link ?? "/student/announcements";

  return (
    <div
      className={cn(
        "pointer-events-none fixed left-1/2 top-16 z-[60] w-[min(92vw,420px)] -translate-x-1/2",
      )}
      role="status"
    >
      <div
        className={cn(
          "announcement-alert-blink pointer-events-auto flex items-start gap-3 rounded-[var(--radius-md)] border border-primary/30 bg-white/95 p-3 shadow-md backdrop-blur",
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">New announcement</p>
          <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{alert.title}</p>
          <Link
            href={href}
            className="mt-2 inline-block text-xs font-medium text-primary underline-offset-2 hover:underline"
            onClick={dismiss}
          >
            View announcements
          </Link>
        </div>
        <Button type="button" variant="ghost" size="sm" className="shrink-0 h-8 px-2" onClick={dismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}
