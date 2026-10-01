"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin, buildAdministrationWhere, assertAdministrationAccess } from "@/lib/auth-scope";

export async function getMinistries() {
  const baseWhere = await buildAdministrationWhere("Ministry");
  return await prisma.ministry.findMany({
    where: baseWhere,
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
  const baseWhere = await buildAdministrationWhere("Ministry");
  
  const searchWhere = query ? {
    OR: [
      { elderName: { contains: query } },
      { cooperatorName: { contains: query } },
      { church: { name: { contains: query } } },
      { church: { sector: { name: { contains: query } } } }
    ]
  } : {};

  const where = { AND: [baseWhere, searchWhere] };

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
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Acesso negado");

  const elderName = formData.get("elderName") as string;
  const cooperatorName = formData.get("cooperatorName") as string;
  const churchId = formData.get("churchId") as string;

  if (!elderName || !cooperatorName || !churchId) {
    return { error: "Preencha todos os campos." };
  }

  try {
    const church = await prisma.church.findUnique({ where: { id: churchId }, include: { sector: true } });
    if (!church) throw new Error("Igreja inválida");
    await assertAdministrationAccess(church.sector.administrationId);

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
    return { error: error.message || "Erro ao cadastrar ministério." };
  }
}

export async function updateMinistry(id: string, formData: FormData) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Acesso negado");

  const elderName = formData.get("elderName") as string;
  const cooperatorName = formData.get("cooperatorName") as string;
  const churchId = formData.get("churchId") as string;

  if (!elderName || !cooperatorName || !churchId) {
    return { error: "Preencha todos os campos." };
  }

  try {
    const existingMinistry = await prisma.ministry.findUnique({ where: { id }, include: { church: { include: { sector: true } } } });
    if (!existingMinistry) throw new Error("Registro não encontrado ou sem permissão.");
    await assertAdministrationAccess(existingMinistry.church.sector.administrationId);

    if (churchId !== existingMinistry.churchId) {
      const newChurch = await prisma.church.findUnique({ where: { id: churchId }, include: { sector: true } });
      if (!newChurch) throw new Error("Igreja inválida");
      await assertAdministrationAccess(newChurch.sector.administrationId);
    }

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
    return { error: error.message || "Erro ao atualizar ministério." };
  }
}

export async function deleteMinistry(id: string) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Acesso negado");

  try {
    const existingMinistry = await prisma.ministry.findUnique({ where: { id }, include: { church: { include: { sector: true } } } });
    if (!existingMinistry) throw new Error("Registro não encontrado ou sem permissão.");
    await assertAdministrationAccess(existingMinistry.church.sector.administrationId);

    await prisma.ministry.delete({
      where: { id },
    });
    revalidatePath("/ministerios");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Erro ao excluir ministério." };
  }
}
