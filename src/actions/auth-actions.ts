"use server";

import { logout as authLogout, getSession, createSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function logout() {
  await authLogout();
  redirect("/login");
}

export async function switchActiveChurch(churchId: string) {
  const session = await getSession();
  if (!session || session.type !== "encarregado") {
    throw new Error("Não autorizado.");
  }

  const encarregado = await prisma.personInCharge.findUnique({
    where: { id: session.id },
    include: { church: true, managedChurches: true }
  });

  if (!encarregado) {
    throw new Error("Usuário não encontrado.");
  }

  const authorizedIds = [encarregado.churchId, ...encarregado.managedChurches.map(c => c.id)];
  if (!authorizedIds.includes(churchId)) {
    throw new Error("Você não tem permissão para acessar esta congregação.");
  }

  await createSession({
    ...session,
    churchId: churchId,
  });

  revalidatePath("/portal", "layout");
  return { success: true };
}
