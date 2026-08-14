"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const SPLASH_KEY = "tutordesk_splash_seen";
const SPLASH_MS = 1500;
const FADE_MS = 400;

function SplashOverlay() {
  const [phase, setPhase] = useState<"visible" | "fading" | "off">(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(SPLASH_KEY)) {
      return "off";
    }
    return "visible";
  });

  useEffect(() => {
    if (sessionStorage.getItem(SPLASH_KEY)) {
      return;
    }
    if (phase === "off") {
      return;
    }
    const fadeTimer = window.setTimeout(() => setPhase("fading"), SPLASH_MS);
    const doneTimer = window.setTimeout(() => {
      sessionStorage.setItem(SPLASH_KEY, "1");
      setPhase("off");
    }, SPLASH_MS + FADE_MS);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  if (phase === "off") {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#EEF4FF] transition-opacity duration-[400ms] ease-out",
        phase === "fading" && "pointer-events-none opacity-0",
      )}
      aria-hidden={phase === "fading"}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-white/70 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-white/60 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-white/50 blur-3xl" />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-3">
        <Image
          src="/brand/logo-icon.png"
          alt=""
          width={64}
          height={64}
          className="rounded-lg"
          priority
        />
        <span className="text-2xl font-semibold tracking-tight text-foreground">TutorDesk</span>
      </div>
    </div>
  );
}

export function SplashProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SplashOverlay />
      {children}
    </>
  );
}

