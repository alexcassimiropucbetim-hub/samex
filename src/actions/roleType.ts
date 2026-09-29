"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth-scope";

export async function createRoleType(formData: FormData) {
  await requireSuperAdmin();
  const name = formData.get("name") as string;
  if (!name) return;

  await prisma.roleType.create({
    data: { name },
  });

  revalidatePath("/cargos");
}

export async function getRoleTypes() {
  return await prisma.roleType.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteRoleType(id: string) {
  await requireSuperAdmin();

  const count = await prisma.personInCharge.count({ where: { roleTypeId: id } });
  if (count > 0) {
    throw new Error(`Este cargo não pode ser excluído porque existem ${count} encarregado(s) vinculado(s) a ele.`);
  }

  await prisma.roleType.delete({
    where: { id },
  });

  revalidatePath("/cargos");
}

export async function updateRoleType(id: string, formData: FormData) {
  await requireSuperAdmin();
  const name = formData.get("name") as string;
  if (!name) return;

  await prisma.roleType.update({
    where: { id },
    data: { name },
  });

  revalidatePath("/cargos");
}
