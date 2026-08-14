import { BrandLogo } from "@/components/layout/brand-logo";
import { HeaderSignOutButton } from "@/components/layout/header-sign-out-button";
import { NotificationBell } from "@/components/notifications/notification-bell";

type AppHeaderProps = {
  title: string;
  userName?: string | null;
  userRole?: "teacher" | "student";
  unreadCount?: number;
};

export function AppHeader({ title, userName, userRole, unreadCount = 0 }: AppHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-white/80 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <BrandLogo showText={false} iconSize={28} className="sm:hidden" />
        <BrandLogo iconSize={28} className="hidden sm:flex" />
        <span className="hidden h-5 w-px bg-border sm:block" aria-hidden />
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        {userRole ? (
          <NotificationBell role={userRole} initialUnread={unreadCount} />
        ) : null}
        {userName ? (
          <span className="hidden text-sm text-foreground sm:inline">{userName}</span>
        ) : null}
        <HeaderSignOutButton />
      </div>
    </header>
  );
}
