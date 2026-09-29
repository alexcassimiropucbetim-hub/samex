"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth-scope";

export async function getRRMs() {
  await requireSuperAdmin();
  return await prisma.rRM.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { administrations: true } } }
  });
}

export async function getActiveRRMs() {
  // Isso pode ser útil para selects na interface. Ainda assim, restrito a super admin.
  await requireSuperAdmin();
  return await prisma.rRM.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
}

export async function createRRM(formData: FormData) {
  await requireSuperAdmin();
  const name = formData.get("name") as string;
  if (!name) throw new Error("Nome é obrigatório.");

  await prisma.rRM.create({ data: { name } });
  revalidatePath("/rrm");
}

export async function updateRRM(id: string, formData: FormData) {
  await requireSuperAdmin();
  const name = formData.get("name") as string;
  const active = formData.get("active") === "true";

  if (!name) throw new Error("Nome é obrigatório.");

  await prisma.rRM.update({
    where: { id },
    data: { name, active }
  });
  revalidatePath("/rrm");
}

export async function deleteRRM(id: string) {
  await requireSuperAdmin();
  
  const rrm = await prisma.rRM.findUnique({
    where: { id },
    include: { administrations: true }
  });

  if (!rrm) throw new Error("RRM não encontrada.");
  if (rrm.administrations.length > 0) {
    throw new Error("Não é possível excluir esta RRM pois existem Administrações vinculadas a ela.");
  }

  await prisma.rRM.delete({ where: { id } });
  revalidatePath("/rrm");
}
