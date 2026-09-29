"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin, buildAdministrationWhere, assertAdministrationAccess } from "@/lib/auth-scope";

export async function createEvaluator(formData: FormData) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Acesso negado");

  const name = formData.get("name") as string;
  let administrationId = formData.get("administrationId") as string;

  if (!name) return;

  if (admin.role === "ADMINISTRATION_ADMIN") {
    administrationId = admin.administrationId!;
  } else if (!administrationId) {
    throw new Error("A Administração é obrigatória");
  } else {
    const adm = await prisma.administration.findUnique({ where: { id: administrationId } });
    if (!adm) throw new Error("Administração inválida");
  }

  await prisma.evaluator.create({
    data: { name, administrationId },
  });

  revalidatePath("/avaliadores");
}

export async function getEvaluators() {
  const where = await buildAdministrationWhere("Evaluator");
  return await prisma.evaluator.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteEvaluator(id: string) {
  const existingEvaluator = await prisma.evaluator.findUnique({ where: { id } });
  if (!existingEvaluator) throw new Error("Registro não encontrado ou sem permissão.");
  await assertAdministrationAccess(existingEvaluator.administrationId);

  await prisma.evaluator.delete({
    where: { id },
  });

  revalidatePath("/avaliadores");
}

export async function updateEvaluator(id: string, formData: FormData) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Acesso negado");

  const existingEvaluator = await prisma.evaluator.findUnique({ where: { id } });
  if (!existingEvaluator) throw new Error("Registro não encontrado ou sem permissão.");
  await assertAdministrationAccess(existingEvaluator.administrationId);

  const name = formData.get("name") as string;
  let administrationId = formData.get("administrationId") as string;
  
  if (!name) return;

  if (admin.role === "ADMINISTRATION_ADMIN") {
    administrationId = existingEvaluator.administrationId;
  } else if (administrationId && administrationId !== existingEvaluator.administrationId) {
    const adm = await prisma.administration.findUnique({ where: { id: administrationId } });
    if (!adm) throw new Error("Administração inválida");
  } else {
    administrationId = existingEvaluator.administrationId;
  }

  await prisma.evaluator.update({
    where: { id },
    data: { name, administrationId },
  });

  revalidatePath("/avaliadores");
}
