import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { studentNavItems } from "@/content/navigation";
import { getUnreadNotificationCount } from "@/lib/notifications";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.STUDENT) {
    redirect("/login");
  }

  const unreadCount = await getUnreadNotificationCount(session.user.id);

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader
        title="Student"
        userName={session.user.name}
        userRole="student"
        unreadCount={unreadCount}
      />
      <div className="flex flex-1">
        <AppSidebar items={studentNavItems} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
