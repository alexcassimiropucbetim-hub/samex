"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth-scope";

export async function getTheoryMethods() {
  return await prisma.theoryMethod.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createTheoryMethod(formData: FormData) {
  await requireSuperAdmin();
  const name = formData.get("name") as string;
  if (!name) throw new Error("Nome é obrigatório");

  await prisma.theoryMethod.create({
    data: { name },
  });

  revalidatePath("/metodos-teoria");
  revalidatePath("/portal/pre-avaliacao/avaliar");
}

export async function updateTheoryMethod(id: string, formData: FormData) {
  await requireSuperAdmin();
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
  await requireSuperAdmin();

  const method = await prisma.theoryMethod.findUnique({ where: { id } });
  if (method) {
    const count = await prisma.preEvaluationResult.count({
      where: {
        OR: [
          { msaLessons: { contains: method.name } },
          { methodLessons: { contains: method.name } }
        ]
      }
    });
    if (count > 0) {
      throw new Error(`Este método não pode ser excluído porque está registrado em ${count} avaliação(ões) de candidatos.`);
    }
  }

  await prisma.theoryMethod.delete({
    where: { id },
  });

  revalidatePath("/metodos-teoria");
  revalidatePath("/portal/pre-avaliacao/avaliar");
}
