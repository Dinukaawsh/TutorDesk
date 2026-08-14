"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/actions/auth.actions";
import { prisma } from "@/lib/prisma";
import { saveAvatarFile } from "@/lib/save-avatar";
import { requireTeacherSession } from "@/lib/teacher-auth";
import { updateTeacherProfileSchema } from "@/schemas/settings.schema";

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
    select: { avatarUrl: true },
  });
  if (!teacher) {
    return { success: false, message: "Teacher not found." };
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
      whatsapp: parsed.data.whatsapp ?? null,
      defaultCurrency: parsed.data.defaultCurrency,
      avatarUrl,
    },
  });

  revalidatePath("/teacher/settings");
  return { success: true, message: "Settings saved." };
}
