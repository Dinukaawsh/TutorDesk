"use server";

import { revalidatePath } from "next/cache";
import { subjectIdSchema, subjectSchema } from "@/schemas/subject.schema";
import { requireTeacherSession } from "@/lib/teacher-auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/actions/auth.actions";

function revalidateSubjects() {
  revalidatePath("/teacher/subjects");
  revalidatePath("/teacher/students");
}

export async function createSubjectAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireTeacherSession();
  if (!session) {
    return { success: false, message: "Unauthorized." };
  }

  const raw = {
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    color: formData.get("color") || undefined,
  };

  const parsed = subjectSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, description, color } = parsed.data;
  await prisma.subject.create({
    data: {
      name,
      description: description || null,
      color: color || null,
    },
  });

  revalidateSubjects();
  return { success: true, message: "Subject created." };
}

export async function updateSubjectAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireTeacherSession();
  if (!session) {
    return { success: false, message: "Unauthorized." };
  }

  const id = String(formData.get("id") ?? "");
  const idParsed = subjectIdSchema.safeParse({ id });
  if (!idParsed.success) {
    return { success: false, message: "Invalid subject." };
  }

  const raw = {
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    color: formData.get("color") || undefined,
  };

  const parsed = subjectSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, description, color } = parsed.data;
  await prisma.subject.update({
    where: { id: idParsed.data.id },
    data: {
      name,
      description: description || null,
      color: color || null,
    },
  });

  revalidateSubjects();
  return { success: true, message: "Subject updated." };
}

export async function deleteSubjectAction(id: string): Promise<ActionResult> {
  const session = await requireTeacherSession();
  if (!session) {
    return { success: false, message: "Unauthorized." };
  }

  const parsed = subjectIdSchema.safeParse({ id });
  if (!parsed.success) {
    return { success: false, message: "Invalid subject." };
  }

  await prisma.subject.delete({ where: { id: parsed.data.id } });
  revalidateSubjects();
  return { success: true, message: "Subject deleted." };
}

export async function listSubjects() {
  const session = await requireTeacherSession();
  if (!session) {
    return [];
  }

  return prisma.subject.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { enrollments: true } },
    },
  });
}
