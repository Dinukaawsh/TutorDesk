import { Role } from "@prisma/client";
import { auth } from "@/auth";

export async function requireTeacherSession() {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.TEACHER) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function requireStudentSession() {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.STUDENT) {
    throw new Error("Unauthorized");
  }
  return session.user;
}
