"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPersonInCharge(formData: FormData) {
  const login = formData.get("login") as string;
  const fullName = formData.get("fullName") as string;
  const gender = formData.get("gender") as string;
  const cardNumber = formData.get("cardNumber") as string;
  const churchId = formData.get("churchId") as string;
  const roleTypeId = formData.get("roleTypeId") as string;
  const testTypeIds = formData.getAll("testTypeIds") as string[];
  const managedChurchIds = formData.getAll("managedChurchIds") as string[];
  
  if (!login || !fullName || !gender || !cardNumber || !churchId || !roleTypeId) return;

  try {
    await prisma.personInCharge.create({
      data: { 
        login, fullName, gender, cardNumber, churchId, roleTypeId,
        allowedTestTypes: {
          connect: testTypeIds.map(id => ({ id }))
        },
        managedChurches: {
          connect: managedChurchIds.map(id => ({ id }))
        }
      },
    });

    revalidatePath("/encarregados");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: "O Login ou a Carteirinha informados já estão em uso." };
    }
    console.error(error);
    return { success: false, error: "Ocorreu um erro ao cadastrar o encarregado." };
  }
}

export async function getPeopleInCharge() {
  return await prisma.personInCharge.findMany({
    include: { church: true, roleType: true, allowedTestTypes: true, managedChurches: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPeopleInChargePaginated(page: number = 1, pageSize: number = 10, query: string = "") {
  const skip = (page - 1) * pageSize;
  
  const where = query ? {
    OR: [
      { fullName: { contains: query } },
      { login: { contains: query } },
      { cardNumber: { contains: query } },
      { church: { name: { contains: query } } },
      { roleType: { name: { contains: query } } }
    ]
  } : {};

  const [total, data] = await Promise.all([
    prisma.personInCharge.count({ where }),
    prisma.personInCharge.findMany({
      where,
      include: { church: true, roleType: true, allowedTestTypes: true, managedChurches: true },
      orderBy: { fullName: "asc" },
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

export async function getPersonInChargeById(id: string) {
  if (!id) return null;
  return await prisma.personInCharge.findUnique({
    where: { id },
    include: { church: true, roleType: true, allowedTestTypes: true, managedChurches: true },
  });
}

export async function deletePersonInCharge(id: string) {
  await prisma.personInCharge.delete({
    where: { id },
  });

  revalidatePath("/encarregados");
}

export async function updatePersonInCharge(id: string, formData: FormData) {
  const login = formData.get("login") as string;
  const fullName = formData.get("fullName") as string;
  const gender = formData.get("gender") as string;
  const cardNumber = formData.get("cardNumber") as string;
  const churchId = formData.get("churchId") as string;
  const roleTypeId = formData.get("roleTypeId") as string;
  const testTypeIds = formData.getAll("testTypeIds") as string[];
  const managedChurchIds = formData.getAll("managedChurchIds") as string[];
  
  if (!login || !fullName || !gender || !cardNumber || !churchId || !roleTypeId) return;

  try {
    await prisma.personInCharge.update({
      where: { id },
      data: { 
        login, fullName, gender, cardNumber, churchId, roleTypeId,
        allowedTestTypes: {
          set: [], // Clear existing
          connect: testTypeIds.map(tid => ({ id: tid }))
        },
        managedChurches: {
          set: [], // Clear existing
          connect: managedChurchIds.map(id => ({ id }))
        }
      },
    });

    revalidatePath("/encarregados");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: "O Login ou a Carteirinha informados já estão em uso." };
    }
    console.error(error);
    return { success: false, error: "Ocorreu um erro ao atualizar o encarregado." };
  }
}
