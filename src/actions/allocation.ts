"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function allocateToTest(preEvaluationId: string, testScheduleId: string, masterKey: string) {
  try {
    const testSchedule = await prisma.testSchedule.findUnique({
      where: { id: testScheduleId }
    });

    if (!testSchedule) {
      throw new Error("Agendamento não encontrado.");
    }

    if (testSchedule.masterKey !== masterKey) {
      throw new Error("Chave do Teste inválida.");
    }

    await prisma.preEvaluation.update({
      where: { id: preEvaluationId },
      data: { testScheduleId }
    });

    revalidatePath("/portal");
    revalidatePath("/portal/pre-avaliacao");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Erro ao alocar candidato.");
  }
}
