"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTestType(formData: FormData) {
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
  await prisma.testType.delete({
    where: { id },
  });

  revalidatePath("/tipos-teste");
}

export async function updateTestType(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) return;

  await prisma.testType.update({
    where: { id },
    data: { name },
  });

  revalidatePath("/tipos-teste");
}
