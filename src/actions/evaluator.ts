"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createEvaluator(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) return;

  await prisma.evaluator.create({
    data: { name },
  });

  revalidatePath("/avaliadores");
}

export async function getEvaluators() {
  return await prisma.evaluator.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteEvaluator(id: string) {
  await prisma.evaluator.delete({
    where: { id },
  });

  revalidatePath("/avaliadores");
}

export async function updateEvaluator(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  
  if (!name) return;

  await prisma.evaluator.update({
    where: { id },
    data: { name },
  });

  revalidatePath("/avaliadores");
}
