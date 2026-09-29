"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth-scope";

export async function createCategory(formData: FormData) {
  await requireSuperAdmin();
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
  await requireSuperAdmin();
  const name = formData.get("name") as string;
  if (!name) return;

  await prisma.instrumentCategory.update({
    where: { id },
    data: { name },
  });

  revalidatePath("/categorias");
}

export async function deleteCategory(id: string) {
  await requireSuperAdmin();

  const count = await prisma.instrument.count({ where: { categoryId: id } });
  if (count > 0) {
    throw new Error(`Esta categoria não pode ser excluída porque possui ${count} instrumento(s) vinculado(s).`);
  }

  await prisma.instrumentCategory.delete({
    where: { id },
  });

  revalidatePath("/categorias");
}
