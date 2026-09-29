"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin, buildAdministrationWhere, assertAdministrationAccess } from "@/lib/auth-scope";

export async function createSector(formData: FormData) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Acesso negado");

  const name = formData.get("name") as string;
  let administrationId = formData.get("administrationId") as string;

  if (!name) return;

  if (admin.role === "ADMINISTRATION_ADMIN") {
    administrationId = admin.administrationId!;
  } else if (!administrationId) {
    throw new Error("A Administração é obrigatória");
  } else {
    const adm = await prisma.administration.findUnique({ where: { id: administrationId } });
    if (!adm) throw new Error("Administração inválida");
  }

  await prisma.sector.create({
    data: { name, administrationId },
  });

  revalidatePath("/setores");
}

export async function getSectors() {
  const where = await buildAdministrationWhere("Sector");
  return await prisma.sector.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function updateSector(id: string, formData: FormData) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Acesso negado");

  const existingSector = await prisma.sector.findUnique({ where: { id } });
  if (!existingSector) throw new Error("Registro não encontrado ou sem permissão.");
  await assertAdministrationAccess(existingSector.administrationId);

  const name = formData.get("name") as string;
  let administrationId = formData.get("administrationId") as string;

  if (!name) return;

  if (admin.role === "ADMINISTRATION_ADMIN") {
    administrationId = existingSector.administrationId;
  } else if (administrationId && administrationId !== existingSector.administrationId) {
    const adm = await prisma.administration.findUnique({ where: { id: administrationId } });
    if (!adm) throw new Error("Administração inválida");
  } else {
    administrationId = existingSector.administrationId;
  }

  await prisma.sector.update({
    where: { id },
    data: { name, administrationId },
  });

  revalidatePath("/setores");
}

export async function deleteSector(id: string) {
  const existingSector = await prisma.sector.findUnique({ where: { id } });
  if (!existingSector) throw new Error("Registro não encontrado ou sem permissão.");
  await assertAdministrationAccess(existingSector.administrationId);

  await prisma.sector.delete({
    where: { id },
  });

  revalidatePath("/setores");
}
