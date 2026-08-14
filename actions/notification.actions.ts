"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  getUnreadNotificationCount,
  markNotificationRead,
} from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

export async function getNotificationsAction(limit = 30) {
  const userId = await requireUserId();
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadCountAction() {
  const userId = await requireUserId();
  return getUnreadNotificationCount(userId);
}

export async function markReadAction(notificationId: string) {
  const userId = await requireUserId();
  await markNotificationRead(notificationId, userId);
  revalidatePath("/teacher/notifications");
  revalidatePath("/student/notifications");
  return { success: true };
}

export async function markAllReadFormAction(): Promise<void> {
  await markAllReadAction();
}

export async function markAllReadAction() {
  const userId = await requireUserId();
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/teacher/notifications");
  revalidatePath("/student/notifications");
  return { success: true };
}

