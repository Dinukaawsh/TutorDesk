"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { Role } from "@prisma/client";
import { auth, signIn, signOut } from "@/auth";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  changePasswordSchema,
  loginSchema,
  setupTeacherSchema,
} from "@/schemas/auth.schema";

export type ActionResult = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function getTeacherContact() {
  return prisma.user.findFirst({
    where: { role: Role.TEACHER },
    select: { name: true, whatsapp: true },
  });
}

export async function hasTeacherAccount() {
  const count = await prisma.user.count({ where: { role: Role.TEACHER } });
  return count > 0;
}

export async function setupTeacherAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const exists = await hasTeacherAccount();
  if (exists) {
    return { success: false, message: "A teacher account already exists." };
  }

  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    whatsapp: formData.get("whatsapp") || undefined,
  };

  const parsed = setupTeacherSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, email, password, whatsapp } = parsed.data;
  const passwordHash = await hashPassword(password);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: Role.TEACHER,
      whatsapp: whatsapp || null,
    },
  });

  redirect("/login?setup=success");
}

export async function loginAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { success: false, message: "Invalid email or password." };
  }

  if (user.isDisabled) {
    return {
      success: false,
      message: user.disableReason ?? "Your account has been disabled.",
    };
  }

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { success: false, message: "Invalid email or password." };
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof Error && error.message.startsWith("DISABLED:")) {
      return { success: false, message: error.message.replace("DISABLED:", "") };
    }
    return { success: false, message: "Invalid email or password." };
  }

  const session = await auth();
  if (!session?.user) {
    return { success: false, message: "Unable to start session." };
  }

  if (session.user.role === Role.TEACHER) {
    redirect("/teacher/dashboard");
  }

  if (session.user.mustChangePassword) {
    redirect("/student/change-password");
  }

  redirect("/student/dashboard");
}

export async function changePasswordAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, message: "You must be signed in." };
  }

  const raw = {
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = changePasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return { success: false, message: "User not found." };
  }

  const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    return { success: false, message: "Current password is incorrect." };
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, mustChangePassword: false },
  });

  revalidatePath("/student");
  redirect("/student/dashboard");
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}