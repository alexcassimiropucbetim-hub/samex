"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) return;

  await prisma.instrumentCategory.create({
    data: { name },
  });

  revalidatePath("/categorias");
}

export async function getCategories() {
  return await prisma.instrumentCategory.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) return;

  await prisma.instrumentCategory.update({
    where: { id },
    data: { name },
  });

  revalidatePath("/categorias");
}

export async function deleteCategory(id: string) {
  await prisma.instrumentCategory.delete({
    where: { id },
  });

  revalidatePath("/categorias");
}
