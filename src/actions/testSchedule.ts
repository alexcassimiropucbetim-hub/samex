"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTestSchedule(formData: FormData) {
  const testDate = formData.get("testDate") as string;
  const churchId = formData.get("churchId") as string;
  const masterKey = formData.get("masterKey") as string;
  const elderName = formData.get("elderName") as string;

  if (!testDate || !churchId) return;

  const testSchedule = await prisma.testSchedule.create({
    data: {
      testDate: new Date(testDate),
      churchId,
      masterKey: masterKey || null,
      elderName: elderName || null,
    },
  });

  // Alocar automaticamente todos os candidatos aprovados que aguardam teste
  await prisma.preEvaluation.updateMany({
    where: {
      status: "APROVADO",
      testScheduleId: null
    },
    data: {
      testScheduleId: testSchedule.id,
      finalTestStatus: "PENDENTE"
    }
  });

  revalidatePath("/portal/cadastro-teste");
}

export async function getTestSchedules() {
  return await prisma.testSchedule.findMany({
    include: { church: { include: { sector: true } } },
    orderBy: { testDate: "desc" },
  });
}

export async function deleteTestSchedule(id: string) {
  await prisma.testSchedule.delete({
    where: { id },
  });
  revalidatePath("/portal/cadastro-teste");
}

export async function updateTestSchedule(id: string, formData: FormData) {
  const testDate = formData.get("testDate") as string;
  const churchId = formData.get("churchId") as string;
  const masterKey = formData.get("masterKey") as string;
  const elderName = formData.get("elderName") as string;

  if (!testDate || !churchId) return;

  await prisma.testSchedule.update({
    where: { id },
    data: {
      testDate: new Date(testDate),
      churchId,
      masterKey: masterKey || null,
      elderName: elderName || null,
    },
  });

  revalidatePath("/cadastro-teste");
}
