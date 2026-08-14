"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/actions/auth.actions";
import { prisma } from "@/lib/prisma";
import { requireTeacherSession } from "@/lib/teacher-auth";
import { createStudentTagSchema, deleteStudentTagSchema } from "@/schemas/tag.schema";

function revalidateTagPaths() {
  revalidatePath("/teacher/students");
  revalidatePath("/student/dashboard");
}

export async function listStudentTags() {
  const session = await requireTeacherSession();
  if (!session) {
    return [];
  }

  return prisma.studentTag.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { assignments: true } },
    },
  });
}

export async function createStudentTagAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireTeacherSession();
  if (!session) {
    return { success: false, message: "Unauthorized." };
  }

  const parsed = createStudentTagSchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color") || undefined,
  });
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const existing = await prisma.studentTag.findUnique({
    where: { name: parsed.data.name },
  });
  if (existing) {
    return { success: false, message: "A tag with this name already exists." };
  }

  await prisma.studentTag.create({
    data: {
      name: parsed.data.name,
      color: parsed.data.color?.trim() || "#2563eb",
    },
  });

  revalidateTagPaths();
  return { success: true, message: "Tag created." };
}

export async function deleteStudentTagAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireTeacherSession();
  if (!session) {
    return { success: false, message: "Unauthorized." };
  }

  const parsed = deleteStudentTagSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) {
    return { success: false, message: "Invalid tag." };
  }

  const existing = await prisma.studentTag.findUnique({ where: { id: parsed.data.id } });
  if (!existing) {
    return { success: false, message: "Tag not found." };
  }

  await prisma.studentTag.delete({ where: { id: parsed.data.id } });
  revalidateTagPaths();
  return { success: true, message: "Tag deleted." };
}

export async function getStudentTagsForStudent(studentId: string) {
  const assignments = await prisma.studentTagAssignment.findMany({
    where: { userId: studentId },
    include: { tag: true },
    orderBy: { tag: { name: "asc" } },
  });
  return assignments.map((row) => row.tag);
}
