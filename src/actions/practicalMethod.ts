"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPracticalMethods(instrumentId?: string) {
  return await prisma.practicalMethod.findMany({
    where: instrumentId ? { instrumentId } : undefined,
    orderBy: { name: "asc" },
    include: { instrument: true }
  });
}

export async function createPracticalMethod(formData: FormData) {
  const name = formData.get("name") as string;
  const instrumentId = formData.get("instrumentId") as string;
  if (!name || !instrumentId) throw new Error("Nome e Instrumento são obrigatórios");

  await prisma.practicalMethod.create({
    data: { name, instrumentId },
  });

  revalidatePath("/metodos-pratica");
  revalidatePath("/portal/pre-avaliacao/avaliar");
}

export async function updatePracticalMethod(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const instrumentId = formData.get("instrumentId") as string;
  if (!name || !instrumentId) throw new Error("Nome e Instrumento são obrigatórios");

  await prisma.practicalMethod.update({
    where: { id },
    data: { name, instrumentId },
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
