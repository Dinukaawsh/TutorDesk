import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import {
  getTeacherContact,
  hasTeacherAccount,
} from "@/actions/auth.actions";
import { LoginForm } from "@/components/auth/login-form";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";

export default async function LoginPage() {
  const teacherExists = await hasTeacherAccount();
  if (!teacherExists) {
    redirect("/setup");
  }

  const session = await auth();
  if (session?.user) {
    redirect(
      session.user.role === Role.TEACHER
        ? "/teacher/dashboard"
        : session.user.mustChangePassword
          ? "/student/change-password"
          : "/student/dashboard",
    );
  }

  const teacher = await getTeacherContact();

  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-border bg-white/90 shadow-sm backdrop-blur">
      <div className="border-b border-border bg-primary/5 px-6 py-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to your TutorDesk account</p>
      </div>
      <div className="space-y-5 px-6 py-6">
        <LoginForm />
        {teacher?.whatsapp ? (
          <div className="border-t border-border pt-4">
            <p className="mb-2 text-center text-xs text-muted-foreground">Need help signing in?</p>
            <WhatsAppButton teacherName={teacher.name} whatsapp={teacher.whatsapp} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
