"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createChurch(formData: FormData) {
  const name = formData.get("name") as string;
  const sectorId = formData.get("sectorId") as string;
  if (!name || !sectorId) return;

  await prisma.church.create({
    data: { name, sectorId },
  });

  revalidatePath("/igrejas");
}

export async function getChurches() {
  return await prisma.church.findMany({
    include: { sector: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getChurchesPaginated(page: number = 1, pageSize: number = 10, query: string = "") {
  const skip = (page - 1) * pageSize;
  
  const where = query ? {
    OR: [
      { name: { contains: query } },
      { sector: { name: { contains: query } } }
    ]
  } : {};

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
  const name = formData.get("name") as string;
  const sectorId = formData.get("sectorId") as string;
  if (!name || !sectorId) return;

  await prisma.church.update({
    where: { id },
    data: { name, sectorId },
  });

  revalidatePath("/igrejas");
}

export async function deleteChurch(id: string) {
  await prisma.church.delete({
    where: { id },
  });

  revalidatePath("/igrejas");
}
