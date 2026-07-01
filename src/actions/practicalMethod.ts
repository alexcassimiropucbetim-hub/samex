"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
  await prisma.practicalMethod.delete({
    where: { id },
  });

  revalidatePath("/metodos-pratica");
  revalidatePath("/portal/pre-avaliacao/avaliar");
}
