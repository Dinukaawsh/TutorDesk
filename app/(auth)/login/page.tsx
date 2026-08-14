import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import {
  getTeacherContact,
  hasTeacherAccount,
} from "@/actions/auth.actions";
import { LoginForm } from "@/components/auth/login-form";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your TutorDesk account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <LoginForm />
        {teacher ? (
          <WhatsAppButton teacherName={teacher.name} whatsapp={teacher.whatsapp} />
        ) : null}
      </CardContent>
    </Card>
  );
}