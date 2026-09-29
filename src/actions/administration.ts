"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth-scope";

export async function getAdministrations() {
  await requireSuperAdmin();
  return await prisma.administration.findMany({
    orderBy: { name: "asc" },
    include: {
      rrm: true,
      admin: { select: { username: true, name: true, id: true } },
      _count: { select: { sectors: true } }
    }
  });
}

export async function getActiveAdministrations() {
  await requireSuperAdmin();
  return await prisma.administration.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
}

export async function createAdministration(formData: FormData) {
  await requireSuperAdmin();
  const name = formData.get("name") as string;
  const rrmId = formData.get("rrmId") as string;
  
  if (!name || !rrmId) throw new Error("Nome e RRM são obrigatórios.");

  const rrmExists = await prisma.rRM.findUnique({ where: { id: rrmId } });
  if (!rrmExists) throw new Error("RRM informada não existe.");

  await prisma.administration.create({ data: { name, rrmId } });
  revalidatePath("/administracoes");
}

export async function updateAdministration(id: string, formData: FormData) {
  await requireSuperAdmin();
  const name = formData.get("name") as string;
  const rrmId = formData.get("rrmId") as string;
  const active = formData.get("active") === "true";

  if (!name || !rrmId) throw new Error("Nome e RRM são obrigatórios.");

  const rrmExists = await prisma.rRM.findUnique({ where: { id: rrmId } });
  if (!rrmExists) throw new Error("RRM informada não existe.");

  await prisma.administration.update({
    where: { id },
    data: { name, rrmId, active }
  });
  revalidatePath("/administracoes");
}

export async function deleteAdministration(id: string) {
  await requireSuperAdmin();
  
  const adm = await prisma.administration.findUnique({
    where: { id },
    include: { sectors: true, admin: true, evaluators: true }
  });

  if (!adm) throw new Error("Administração não encontrada.");
  
  if (adm.sectors.length > 0 || adm.admin || adm.evaluators.length > 0) {
    throw new Error("Não é possível excluir esta Administração pois existem Setores, Administrador ou Avaliadores vinculados a ela.");
  }

  await prisma.administration.delete({ where: { id } });
  revalidatePath("/administracoes");
}
