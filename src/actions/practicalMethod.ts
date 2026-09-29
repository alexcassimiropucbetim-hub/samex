"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth-scope";

export async function getPracticalMethods(instrumentId?: string) {
  return await prisma.practicalMethod.findMany({
    where: instrumentId ? { 
      instruments: {
        some: { id: instrumentId }
      }
    } : undefined,
    orderBy: { name: "asc" },
    include: { instruments: true }
  });
}

export async function createPracticalMethod(formData: FormData) {
  await requireSuperAdmin();
  const name = formData.get("name") as string;
  const instrumentIds = formData.getAll("instrumentIds") as string[];
  if (!name || instrumentIds.length === 0) throw new Error("Nome e ao menos um Instrumento são obrigatórios");

  await prisma.practicalMethod.create({
    data: { 
      name, 
      instruments: {
        connect: instrumentIds.map(id => ({ id }))
      }
    },
  });

  revalidatePath("/metodos-pratica");
  revalidatePath("/portal/pre-avaliacao/avaliar");
}

export async function updatePracticalMethod(id: string, formData: FormData) {
  await requireSuperAdmin();
  const name = formData.get("name") as string;
  const instrumentIds = formData.getAll("instrumentIds") as string[];
  if (!name || instrumentIds.length === 0) throw new Error("Nome e ao menos um Instrumento são obrigatórios");

  await prisma.practicalMethod.update({
    where: { id },
    data: { 
      name,
      instruments: {
        set: instrumentIds.map(id => ({ id }))
      }
    },
  });

  revalidatePath("/metodos-pratica");
  revalidatePath("/portal/pre-avaliacao/avaliar");
}

export async function deletePracticalMethod(id: string) {
  await requireSuperAdmin();

  const method = await prisma.practicalMethod.findUnique({ where: { id } });
  if (method) {
    const count = await prisma.preEvaluationResult.count({
      where: {
        OR: [
          { methodLessons: { contains: method.name } }
        ]
      }
    });
    if (count > 0) {
      throw new Error(`Este método não pode ser excluído porque está registrado em ${count} avaliação(ões) de candidatos.`);
    }
  }

  await prisma.practicalMethod.delete({
    where: { id },
  });

  revalidatePath("/metodos-pratica");
  revalidatePath("/portal/pre-avaliacao/avaliar");
}
