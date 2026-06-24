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

  const church = await prisma.church.findUnique({ where: { id: churchId } });
  const dateStr = new Date(testDate).toLocaleString("pt-BR", { dateStyle: "short" });

  // Alocar automaticamente todos os candidatos aprovados que aguardam teste
  const pendingEvaluations = await prisma.preEvaluation.findMany({
    where: { status: "APROVADO", testScheduleId: null },
    select: { id: true, personInChargeId: true, candidateName: true }
  });

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

  // Notificar todos os encarregados sobre o novo exame
  const allEncarregados = await prisma.personInCharge.findMany({ select: { id: true } });
  if (allEncarregados.length > 0) {
    await prisma.notification.createMany({
      data: allEncarregados.map(enc => ({
        personInChargeId: enc.id,
        message: `Novo exame agendado em ${church?.name || "Igreja Local"} para o dia ${dateStr}.`
      }))
    });
  }

  // Notificar os encarregados dos candidatos alocados automaticamente
  if (pendingEvaluations.length > 0) {
    await prisma.notification.createMany({
      data: pendingEvaluations.map(evalData => ({
        personInChargeId: evalData.personInChargeId,
        message: `O candidato ${evalData.candidateName} foi alocado automaticamente no exame de ${dateStr}.`
      }))
    });
  }

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

  const church = await prisma.church.findUnique({ where: { id: churchId } });
  const dateStr = new Date(testDate).toLocaleString("pt-BR", { dateStyle: "short" });

  const allEncarregados = await prisma.personInCharge.findMany({ select: { id: true } });
  if (allEncarregados.length > 0) {
    await prisma.notification.createMany({
      data: allEncarregados.map(enc => ({
        personInChargeId: enc.id,
        message: `Houve uma alteração no exame de ${church?.name || "Igreja Local"}. Nova data: ${dateStr}.`
      }))
    });
  }

  revalidatePath("/cadastro-teste");
}
