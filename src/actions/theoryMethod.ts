"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTheoryMethods() {
  return await prisma.theoryMethod.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createTheoryMethod(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) throw new Error("Nome é obrigatório");

  await prisma.theoryMethod.create({
    data: { name },
  });

  revalidatePath("/metodos-teoria");
  revalidatePath("/portal/pre-avaliacao/avaliar");
}

export async function updateTheoryMethod(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) throw new Error("Nome é obrigatório");

  await prisma.theoryMethod.update({
    where: { id },
    data: { name },
  });

  revalidatePath("/metodos-teoria");
  revalidatePath("/portal/pre-avaliacao/avaliar");
}

export async function deleteTheoryMethod(id: string) {
  await prisma.theoryMethod.delete({
    where: { id },
  });

  revalidatePath("/metodos-teoria");
  revalidatePath("/portal/pre-avaliacao/avaliar");
}
