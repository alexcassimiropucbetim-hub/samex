"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createInstrument(formData: FormData) {
  const name = formData.get("name") as string;
  const categoryId = formData.get("categoryId") as string;
  if (!name || !categoryId) return;

  await prisma.instrument.create({
    data: { name, categoryId },
  });

  revalidatePath("/instrumentos");
}

export async function getInstruments() {
  return await prisma.instrument.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInstrumentsPaginated(page: number = 1, pageSize: number = 10, query: string = "") {
  const skip = (page - 1) * pageSize;
  
  const where = query ? {
    OR: [
      { name: { contains: query } },
      { category: { name: { contains: query } } }
    ]
  } : {};

  const [total, data] = await Promise.all([
    prisma.instrument.count({ where }),
    prisma.instrument.findMany({
      where,
      include: { category: true },
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

export async function updateInstrument(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const categoryId = formData.get("categoryId") as string;
  if (!name || !categoryId) return;

  await prisma.instrument.update({
    where: { id },
    data: { name, categoryId },
  });

  revalidatePath("/instrumentos");
}

export async function deleteInstrument(id: string) {
  await prisma.instrument.delete({
    where: { id },
  });

  revalidatePath("/instrumentos");
}
