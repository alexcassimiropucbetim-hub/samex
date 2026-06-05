"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createRoleType(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) return;

  await prisma.roleType.create({
    data: { name },
  });

  revalidatePath("/cargos");
}

export async function getRoleTypes() {
  return await prisma.roleType.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteRoleType(id: string) {
  await prisma.roleType.delete({
    where: { id },
  });

  revalidatePath("/cargos");
}

export async function updateRoleType(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) return;

  await prisma.roleType.update({
    where: { id },
    data: { name },
  });

  revalidatePath("/cargos");
}
