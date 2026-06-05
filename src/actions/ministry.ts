"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getMinistries() {
  return await prisma.ministry.findMany({
    include: {
      church: {
        include: { sector: true }
      }
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMinistriesPaginated(page: number = 1, pageSize: number = 10, query: string = "") {
  const skip = (page - 1) * pageSize;
  
  const where = query ? {
    OR: [
      { elderName: { contains: query } },
      { cooperatorName: { contains: query } },
      { church: { name: { contains: query } } },
      { church: { sector: { name: { contains: query } } } }
    ]
  } : {};

  const [total, data] = await Promise.all([
    prisma.ministry.count({ where }),
    prisma.ministry.findMany({
      where,
      include: {
        church: {
          include: { sector: true }
        }
      },
      orderBy: { church: { name: "asc" } },
      skip,
      take: pageSize,
    })
  ]);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / pageSize)
  };
}

export async function createMinistry(formData: FormData) {
  const elderName = formData.get("elderName") as string;
  const cooperatorName = formData.get("cooperatorName") as string;
  const churchId = formData.get("churchId") as string;

  if (!elderName || !cooperatorName || !churchId) {
    return { error: "Preencha todos os campos." };
  }

  try {
    await prisma.ministry.create({
      data: {
        elderName,
        cooperatorName,
        churchId,
      },
    });

    revalidatePath("/ministerios");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: "Já existe um ministério cadastrado para esta congregação." };
    }
    return { error: "Erro ao cadastrar ministério." };
  }
}

export async function updateMinistry(id: string, formData: FormData) {
  const elderName = formData.get("elderName") as string;
  const cooperatorName = formData.get("cooperatorName") as string;
  const churchId = formData.get("churchId") as string;

  if (!elderName || !cooperatorName || !churchId) {
    return { error: "Preencha todos os campos." };
  }

  try {
    await prisma.ministry.update({
      where: { id },
      data: {
        elderName,
        cooperatorName,
        churchId,
      },
    });

    revalidatePath("/ministerios");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: "Já existe um ministério cadastrado para esta congregação." };
    }
    return { error: "Erro ao atualizar ministério." };
  }
}

export async function deleteMinistry(id: string) {
  try {
    await prisma.ministry.delete({
      where: { id },
    });
    revalidatePath("/ministerios");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "Erro ao excluir ministério." };
  }
}
