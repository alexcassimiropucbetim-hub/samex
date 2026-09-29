"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { requireSuperAdmin } from "@/lib/auth-scope";

export async function getAdmins() {
  await requireSuperAdmin();
  const admins = await prisma.admin.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      administrationId: true,
      createdAt: true,
    }
  });
  return admins;
}

export async function createAdmin(formData: FormData) {
  await requireSuperAdmin();

  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const administrationId = formData.get("administrationId") as string;

  if (!name || !username || !password || !role) return { success: false, error: "Preencha todos os campos obrigatórios." };

  if (role !== "SUPER_ADMIN" && role !== "ADMINISTRATION_ADMIN") {
    return { success: false, error: "Role inválida." };
  }

  if (role === "SUPER_ADMIN" && administrationId) {
    return { success: false, error: "SUPER_ADMIN não pode ter uma Administração vinculada." };
  }

  if (role === "ADMINISTRATION_ADMIN" && !administrationId) {
    return { success: false, error: "ADMINISTRATION_ADMIN deve obrigatoriamente ter uma Administração vinculada." };
  }

  if (administrationId) {
    const adm = await prisma.administration.findUnique({ where: { id: administrationId } });
    if (!adm) return { success: false, error: "Administração inválida." };
    
    const existingAdminForAdm = await prisma.admin.findUnique({ where: { administrationId } });
    if (existingAdminForAdm) {
      return { success: false, error: "Esta Administração já possui um Administrador vinculado." };
    }
  }

  const hashedPassword = await hash(password, 10);

  try {
    await prisma.admin.create({
      data: {
        name,
        username,
        password: hashedPassword,
        role: role as any,
        administrationId: administrationId || null,
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
  await requireSuperAdmin();

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
  await requireSuperAdmin();

  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const administrationId = formData.get("administrationId") as string;

  if (!name || !username || !role) return { success: false, error: "Nome, Login e Role são obrigatórios." };

  if (role !== "SUPER_ADMIN" && role !== "ADMINISTRATION_ADMIN") {
    return { success: false, error: "Role inválida." };
  }

  if (role === "SUPER_ADMIN" && administrationId) {
    return { success: false, error: "SUPER_ADMIN não pode ter uma Administração vinculada." };
  }

  if (role === "ADMINISTRATION_ADMIN" && !administrationId) {
    return { success: false, error: "ADMINISTRATION_ADMIN deve obrigatoriamente ter uma Administração vinculada." };
  }

  if (administrationId) {
    const adm = await prisma.administration.findUnique({ where: { id: administrationId } });
    if (!adm) return { success: false, error: "Administração inválida." };
    
    const existingAdminForAdm = await prisma.admin.findFirst({
      where: {
        administrationId,
        id: { not: id }
      }
    });
    if (existingAdminForAdm) {
      return { success: false, error: "Esta Administração já possui outro Administrador vinculado." };
    }
  }

  const updateData: any = { 
    name, 
    username,
    role,
    administrationId: administrationId || null,
  };

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
  await requireSuperAdmin();

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
