"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth-scope";

export async function createTestType(formData: FormData) {
  await requireSuperAdmin();
  const name = formData.get("name") as string;
  if (!name) return;

  await prisma.testType.create({
    data: { name },
  });

  revalidatePath("/tipos-teste");
}

export async function getTestTypes() {
  return await prisma.testType.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteTestType(id: string) {
  await requireSuperAdmin();

  const preEvals = await prisma.preEvaluation.count({ where: { testTypeId: id } });
  if (preEvals > 0) {
    throw new Error(`Este tipo de teste não pode ser excluído porque está em uso por ${preEvals} teste(s) ou pré-avaliação(ões).`);
  }

  const personInCharge = await prisma.personInCharge.count({
    where: { allowedTestTypes: { some: { id } } }
  });
  if (personInCharge > 0) {
    throw new Error(`Este tipo de teste não pode ser excluído porque está habilitado para ${personInCharge} encarregado(s) examinador(es).`);
  }

  await prisma.testType.delete({
    where: { id },
  });

  revalidatePath("/tipos-teste");
}

export async function updateTestType(id: string, formData: FormData) {
  await requireSuperAdmin();
  const name = formData.get("name") as string;
  if (!name) return;

  await prisma.testType.update({
    where: { id },
    data: { name },
  });

  revalidatePath("/tipos-teste");
}
