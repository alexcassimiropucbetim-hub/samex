"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function getAdmins() {
  const admins = await prisma.admin.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      username: true,
      createdAt: true,
    }
  });
  return admins;
}

export async function createAdmin(formData: FormData) {
  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!name || !username || !password) return { success: false, error: "Preencha todos os campos." };

  const hashedPassword = await hash(password, 10);

  try {
    await prisma.admin.create({
      data: {
        name,
        username,
        password: hashedPassword,
      },
    });
    revalidatePath("/usuarios");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating admin:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "O Login informado já está em uso." };
    }
    return { success: false, error: "Erro ao cadastrar usuário." };
  }
}

export async function updateAdminPassword(id: string, formData: FormData) {
  const password = formData.get("password") as string;
  if (!password) return;

  const hashedPassword = await hash(password, 10);

  try {
    await prisma.admin.update({
      where: { id },
      data: { password: hashedPassword },
    });
    revalidatePath("/usuarios");
  } catch (error) {
    console.error("Error updating admin password:", error);
  }
}

export async function updateAdmin(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!name || !username) return { success: false, error: "Nome e Login são obrigatórios." };

  const updateData: any = { name, username };
  if (password && password.trim() !== "") {
    updateData.password = await hash(password, 10);
  }

  try {
    await prisma.admin.update({
      where: { id },
      data: updateData,
    });
    revalidatePath("/usuarios");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating admin:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "O Login informado já está em uso." };
    }
    return { success: false, error: "Erro ao atualizar usuário." };
  }
}

export async function deleteAdmin(id: string) {
  try {
    await prisma.admin.delete({
      where: { id },
    });
    revalidatePath("/usuarios");
    return { success: true };
  } catch (error) {
    console.error("Error deleting admin:", error);
    return { success: false, error: "Erro ao excluir usuário." };
  }
}
