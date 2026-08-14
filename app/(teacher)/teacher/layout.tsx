import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { getUnreadNotificationCount } from "@/lib/notifications";

const teacherNav = [
  { href: "/teacher/dashboard", label: "Dashboard" },
  { href: "/teacher/students", label: "Students" },
  { href: "/teacher/subjects", label: "Subjects" },
  { href: "/teacher/lessons", label: "Lessons" },
  { href: "/teacher/assignments", label: "Assignments" },
  { href: "/teacher/fees", label: "Fees" },
  { href: "/teacher/notifications", label: "Notifications" },
];

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.TEACHER) {
    redirect("/login");
  }

  const unreadCount = await getUnreadNotificationCount(session.user.id);

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader
        title="Teacher"
        userName={session.user.name}
        userRole="teacher"
        unreadCount={unreadCount}
      />
      <div className="flex flex-1">
        <AppSidebar items={teacherNav} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
