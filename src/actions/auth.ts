"use server";

import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function loginEncarregado(formData: FormData) {
  const cardNumber = formData.get("cardNumber") as string;
  const login = formData.get("login") as string;

  if (!cardNumber || !login) {
    return { error: "Preencha a carteirinha e o login." };
  }

  const encarregado = await prisma.personInCharge.findUnique({
    where: { cardNumber },
    include: { roleType: true },
  });

  if (!encarregado || encarregado.login !== login) {
    return { error: "Credenciais inválidas. Verifique sua carteirinha e login." };
  }

  // Create session
  await createSession({
    id: encarregado.id,
    type: "encarregado",
    name: encarregado.fullName,
    roleName: encarregado.roleType?.name || "Sem Cargo",
    churchId: encarregado.churchId,
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
