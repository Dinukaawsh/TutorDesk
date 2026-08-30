"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/actions/auth.actions";
import { prisma } from "@/lib/prisma";
import { saveInstituteLogo } from "@/lib/uploads";
import { requireTeacherSession } from "@/lib/teacher-auth";
import {
  createInstituteSchema,
  deleteInstituteSchema,
  updateInstituteSchema,
} from "@/schemas/institute.schema";

function revalidateInstitutePaths() {
  revalidatePath("/teacher/institutes");
  revalidatePath("/teacher/students");
  revalidatePath("/teacher/announcements");
  revalidatePath("/teacher/inquiries");
  revalidatePath("/login");
}

export async function listInstitutes() {
  const session = await requireTeacherSession();
  if (!session) {
    return [];
  }

  return prisma.institute.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { students: true } },
    },
  });
}

export async function getPublicInstitutes() {
  return prisma.institute.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      location: true,
      logoUrl: true,
    },
  });
}

export async function createInstituteAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireTeacherSession();
  if (!session) {
    return { success: false, message: "Unauthorized." };
  }

  const parsed = createInstituteSchema.safeParse({
    name: formData.get("name"),
    location: formData.get("location"),
    address: formData.get("address") || undefined,
    phone: formData.get("phone") || undefined,
  });
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const logo = formData.get("logo");
  let logoUrl: string | null = null;
  if (logo instanceof File && logo.size > 0) {
    try {
      logoUrl = await saveInstituteLogo(logo);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Logo upload failed",
      };
    }
  }

  await prisma.institute.create({
    data: {
      name: parsed.data.name,
      location: parsed.data.location,
      address: parsed.data.address || null,
      phone: parsed.data.phone || null,
      logoUrl,
    },
  });

  revalidateInstitutePaths();
  return { success: true, message: "Institute created." };
}

export async function updateInstituteAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireTeacherSession();
  if (!session) {
    return { success: false, message: "Unauthorized." };
  }

  const parsed = updateInstituteSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    location: formData.get("location"),
    address: formData.get("address") || undefined,
    phone: formData.get("phone") || undefined,
  });
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const existing = await prisma.institute.findUnique({ where: { id: parsed.data.id } });
  if (!existing) {
    return { success: false, message: "Institute not found." };
  }

  const logo = formData.get("logo");
  let logoUrl = existing.logoUrl;
  if (logo instanceof File && logo.size > 0) {
    try {
      logoUrl = await saveInstituteLogo(logo);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Logo upload failed",
      };
    }
  }

  await prisma.institute.update({
    where: { id: parsed.data.id },
    data: {
      name: parsed.data.name,
      location: parsed.data.location,
      address: parsed.data.address || null,
      phone: parsed.data.phone || null,
      logoUrl,
    },
  });

  revalidateInstitutePaths();
  return { success: true, message: "Institute updated." };
}

export async function deleteInstituteAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireTeacherSession();
  if (!session) {
    return { success: false, message: "Unauthorized." };
  }

  const parsed = deleteInstituteSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) {
    return { success: false, message: "Invalid institute." };
  }

  const existing = await prisma.institute.findUnique({
    where: { id: parsed.data.id },
    include: { _count: { select: { students: true } } },
  });
  if (!existing) {
    return { success: false, message: "Institute not found." };
  }

  await prisma.institute.delete({ where: { id: parsed.data.id } });

  revalidateInstitutePaths();
  return { success: true, message: "Institute deleted." };
}
