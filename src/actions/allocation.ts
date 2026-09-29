"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin, assertAdministrationAccess } from "@/lib/auth-scope";

export async function allocateToTest(preEvaluationId: string, testScheduleId: string, masterKey: string) {
  try {
    const admin = await getAuthenticatedAdmin();
    
    const testSchedule = await prisma.testSchedule.findUnique({
      where: { id: testScheduleId },
      include: { church: { include: { sector: true } } }
    });

    if (!testSchedule) {
      throw new Error("Agendamento não encontrado.");
    }

    if (testSchedule.masterKey !== masterKey) {
      throw new Error("Chave do Teste inválida.");
    }

    const evaluation = await prisma.preEvaluation.findUnique({
      where: { id: preEvaluationId },
      include: { church: { include: { sector: true } } }
    });

    if (!evaluation) {
      throw new Error("Candidato não encontrado.");
    }

    const testAdminId = testSchedule.church.sector.administrationId;
    const candAdminId = evaluation.church.sector.administrationId;

    if (testAdminId !== candAdminId) {
      throw new Error("Acesso negado. O Candidato e a Agenda de Exames devem pertencer à mesma Administração.");
    }

    // Se for admin, garante o isolamento da Administração
    if (admin) {
      await assertAdministrationAccess(testAdminId);
    }

    await prisma.preEvaluation.update({
      where: { id: preEvaluationId },
      data: { testScheduleId }
    });

    const dateStr = new Date(testSchedule.testDate).toLocaleString("pt-BR", { dateStyle: "short" });

    await prisma.notification.create({
      data: {
        personInChargeId: evaluation.personInChargeId,
        message: `O candidato ${evaluation.candidateName} foi alocado no exame do dia ${dateStr}.`
      }
    });

    revalidatePath("/portal");
    revalidatePath("/portal/pre-avaliacao");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Erro ao alocar candidato.");
  }
}
