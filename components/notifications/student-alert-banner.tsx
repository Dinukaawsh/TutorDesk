"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { NotificationType } from "@prisma/client";
import { getNotificationsAction } from "@/actions/notification.actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SHOWN_KEY = "tutordesk_student_alert_shown";
const POLL_MS = 30_000;

const ALERT_TYPES = new Set<NotificationType>([
  NotificationType.ANNOUNCEMENT_PUBLISHED,
  NotificationType.ASSIGNMENT_PUBLISHED,
]);

type AlertItem = {
  id: string;
  title: string;
  link: string | null;
  kind: "announcement" | "assignment";
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

export function StudentAlertBanner() {
  const [alert, setAlert] = useState<AlertItem | null>(null);
  const shownRef = useRef<Set<string>>(new Set());

  const pickAlert = useCallback(async () => {
    const notifications = await getNotificationsAction(30);
    const candidate = notifications.find(
      (n) => ALERT_TYPES.has(n.type) && n.readAt == null && !shownRef.current.has(n.id),
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
      kind:
        candidate.type === NotificationType.ASSIGNMENT_PUBLISHED ? "assignment" : "announcement",
    });
  }, []);

  useEffect(() => {
    shownRef.current = readShownIds();
    void pickAlert();
    const interval = window.setInterval(() => {
      void pickAlert();
    }, POLL_MS);
    return () => window.clearInterval(interval);
  }, [pickAlert]);

  function dismiss() {
    setAlert(null);
  }

  if (!alert) {
    return null;
  }

  const href =
    alert.link ??
    (alert.kind === "assignment" ? "/student/assignments" : "/student/announcements");
  const label = alert.kind === "assignment" ? "New assignment" : "New announcement";
  const cta =
    alert.kind === "assignment" ? "View assignment" : "View announcements";

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
          <p className="text-xs font-medium uppercase tracking-wide text-primary">{label}</p>
          <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{alert.title}</p>
          <Link
            href={href}
            className="mt-2 inline-block text-xs font-medium text-primary underline-offset-2 hover:underline"
            onClick={dismiss}
          >
            {cta}
          </Link>
        </div>
        <Button type="button" variant="ghost" size="sm" className="shrink-0 h-8 px-2" onClick={dismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}
