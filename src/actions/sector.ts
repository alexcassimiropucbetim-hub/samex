"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSector(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) return;

  await prisma.sector.create({
    data: { name },
  });

  revalidatePath("/setores");
}

export async function getSectors() {
  return await prisma.sector.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function updateSector(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) return;

  await prisma.sector.update({
    where: { id },
    data: { name },
  });

  revalidatePath("/setores");
}

export async function deleteSector(id: string) {
  await prisma.sector.delete({
    where: { id },
  });

  revalidatePath("/setores");
}
