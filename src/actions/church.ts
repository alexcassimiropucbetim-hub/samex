"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin, buildAdministrationWhere, assertAdministrationAccess } from "@/lib/auth-scope";

export async function createChurch(formData: FormData) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Acesso negado");

  const name = formData.get("name") as string;
  const sectorId = formData.get("sectorId") as string;
  if (!name || !sectorId) return;

  const sector = await prisma.sector.findUnique({ where: { id: sectorId } });
  if (!sector) throw new Error("Setor inválido");

  await assertAdministrationAccess(sector.administrationId);

  await prisma.church.create({
    data: { name, sectorId },
  });

  revalidatePath("/igrejas");
}

export async function getChurches() {
  const where = await buildAdministrationWhere("Church");
  return await prisma.church.findMany({
    where,
    include: { sector: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getChurchesPaginated(page: number = 1, pageSize: number = 10, query: string = "") {
  const skip = (page - 1) * pageSize;
  const baseWhere = await buildAdministrationWhere("Church");
  
  const searchWhere = query ? {
    OR: [
      { name: { contains: query } },
      { sector: { name: { contains: query } } }
    ]
  } : {};

  const where = { AND: [baseWhere, searchWhere] };

  const [total, data] = await Promise.all([
    prisma.church.count({ where }),
    prisma.church.findMany({
      where,
      include: { sector: true },
      orderBy: { name: "asc" },
      skip,
      take: pageSize,
    })
  ]);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / pageSize)
  };
}

export async function updateChurch(id: string, formData: FormData) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Acesso negado");

  const existingChurch = await prisma.church.findUnique({ where: { id }, include: { sector: true } });
  if (!existingChurch) throw new Error("Registro não encontrado ou sem permissão.");
  await assertAdministrationAccess(existingChurch.sector.administrationId);

  const name = formData.get("name") as string;
  const sectorId = formData.get("sectorId") as string;
  if (!name || !sectorId) return;

  if (sectorId !== existingChurch.sectorId) {
    const newSector = await prisma.sector.findUnique({ where: { id: sectorId } });
    if (!newSector) throw new Error("Setor inválido");
    await assertAdministrationAccess(newSector.administrationId);
  }

  await prisma.church.update({
    where: { id },
    data: { name, sectorId },
  });

  revalidatePath("/igrejas");
}

export async function deleteChurch(id: string) {
  const existingChurch = await prisma.church.findUnique({ where: { id }, include: { sector: true } });
  if (!existingChurch) throw new Error("Registro não encontrado ou sem permissão.");
  await assertAdministrationAccess(existingChurch.sector.administrationId);

  await prisma.church.delete({
    where: { id },
  });

  revalidatePath("/igrejas");
}
