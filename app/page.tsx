import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { hasTeacherAccount } from "@/actions/auth.actions";

export default async function HomePage() {
  const teacherExists = await hasTeacherAccount();
  if (!teacherExists) {
    redirect("/setup");
  }

  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === Role.TEACHER) {
    redirect("/teacher/dashboard");
  }

  if (session.user.mustChangePassword) {
    redirect("/student/change-password");
  }

  redirect("/student/dashboard");
}