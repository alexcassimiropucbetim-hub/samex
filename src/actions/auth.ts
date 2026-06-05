"use server";

import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function loginEncarregado(formData: FormData) {
  const cardNumber = formData.get("cardNumber") as string;
  const login = formData.get("login") as string;
  const selectedChurchId = formData.get("selectedChurchId") as string;

  if (!cardNumber || !login) {
    return { error: "Preencha a carteirinha e o login." };
  }

  const encarregado = await prisma.personInCharge.findUnique({
    where: { cardNumber },
    include: { roleType: true, church: true, managedChurches: true },
  });

  if (!encarregado || encarregado.login !== login) {
    return { error: "Credenciais inválidas. Verifique sua carteirinha e login." };
  }

  // Combine primary church and managed churches, removing duplicates
  const allChurchesMap = new Map();
  allChurchesMap.set(encarregado.churchId, encarregado.church);
  encarregado.managedChurches.forEach(c => allChurchesMap.set(c.id, c));
  
  const allChurches = Array.from(allChurchesMap.values());

  // If there are multiple churches and the user hasn't selected one yet, return the list to UI
  if (allChurches.length > 1 && !selectedChurchId) {
    return { requireChurchSelection: true, churches: allChurches };
  }

  // If there's only 1 church, or the user has already selected one, proceed to create session
  const finalChurchId = selectedChurchId || encarregado.churchId;

  // Create session
  await createSession({
    id: encarregado.id,
    type: "encarregado",
    name: encarregado.fullName,
    roleName: encarregado.roleType?.name || "Sem Cargo",
    churchId: finalChurchId,
  });

  // Redirect based on role? For now, everyone goes to /portal
  redirect("/portal");
}

export async function loginAdmin(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Preencha o usuário e a senha." };
  }

  const admin = await prisma.admin.findUnique({
    where: { username },
  });

  if (!admin) {
    return { error: "Usuário não encontrado." };
  }

  const isValidPassword = await bcrypt.compare(password, admin.password);
  if (!isValidPassword) {
    return { error: "Senha incorreta." };
  }

  // Create session
  await createSession({
    id: admin.id,
    type: "admin",
    name: admin.name,
  });

  // Admins go to the dashboard (base registrations)
  redirect("/");
}
