import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { teacherNavItems } from "@/content/navigation";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.TEACHER) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <AppHeader
        title="Teacher"
        userName={session.user.name}
        userRole="teacher"
      />
      <div className="flex min-h-0 flex-1">
        <AppSidebar items={teacherNavItems} />
        <main className="td-scrollbar min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
