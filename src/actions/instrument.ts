"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth-scope";

export async function createInstrument(formData: FormData) {
  await requireSuperAdmin();
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
  await requireSuperAdmin();
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
  await requireSuperAdmin();

  const preEvals = await prisma.preEvaluation.count({
    where: {
      OR: [
        { instrumentId: id },
        { currentInstrumentId: id }
      ]
    }
  });

  if (preEvals > 0) {
    throw new Error(`Este instrumento não pode ser excluído porque está em uso por ${preEvals} teste(s) ou pré-avaliação(ões).`);
  }

  await prisma.instrument.delete({
    where: { id },
  });

  revalidatePath("/instrumentos");
}
