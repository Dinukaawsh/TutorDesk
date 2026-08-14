"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/actions/auth.actions";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveAvatarFile } from "@/lib/save-avatar";
import { requireTeacherSession } from "@/lib/teacher-auth";
import {
  updateTeacherPasswordSchema,
  updateTeacherProfileSchema,
} from "@/schemas/settings.schema";

export async function getTeacherProfile() {
  const session = await requireTeacherSession();
  if (!session) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      whatsapp: true,
      avatarUrl: true,
      defaultCurrency: true,
    },
  });
}

export async function updateTeacherProfileAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireTeacherSession();
  if (!session) {
    return { success: false, message: "Unauthorized." };
  }

  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    whatsapp: formData.get("whatsapp") || undefined,
    defaultCurrency: formData.get("defaultCurrency") || "LKR",
  };

  const parsed = updateTeacherProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const teacher = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { avatarUrl: true, email: true },
  });
  if (!teacher) {
    return { success: false, message: "Teacher not found." };
  }

  if (parsed.data.email !== teacher.email) {
    const taken = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (taken) {
      return { success: false, message: "Email is already in use." };
    }
  }

  const avatar = formData.get("avatar");
  let avatarUrl = teacher.avatarUrl;
  if (avatar instanceof File && avatar.size > 0) {
    avatarUrl = (await saveAvatarFile(avatar)) ?? teacher.avatarUrl;
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      whatsapp: parsed.data.whatsapp ?? null,
      defaultCurrency: parsed.data.defaultCurrency,
      avatarUrl,
    },
  });

  revalidatePath("/teacher/settings");
  return { success: true, message: "Settings saved." };
}

export async function updateTeacherPasswordAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireTeacherSession();
  if (!session) {
    return { success: false, message: "Unauthorized." };
  }

  const parsed = updateTeacherPasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const teacher = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!teacher) {
    return { success: false, message: "Teacher not found." };
  }

  const valid = await verifyPassword(parsed.data.currentPassword, teacher.passwordHash);
  if (!valid) {
    return { success: false, message: "Current password is incorrect." };
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({
    where: { id: teacher.id },
    data: { passwordHash },
  });

  revalidatePath("/teacher/settings");
  return { success: true, message: "Password updated." };
}
