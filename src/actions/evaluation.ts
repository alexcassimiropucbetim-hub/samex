"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth";

export async function saveEvaluation(data: {
  preEvaluationId: string;
  isApproved: boolean;
  q1Leitura: string;
  q2Pulso: string;
  q3Afinacao: string;
  q4Escalas: string;
  q5Postura: string;
  q6Timbre: string;
  q7Voz: string;
  q8Dinamica: string;
  observacao?: string;
  msaLessons?: any[];
  methodLessons?: any[];
  hymns?: string[];
}) {
  try {
    const session = await getSession();
    const evaluatorId = session?.id;

    const { 
      preEvaluationId, 
      isApproved, 
      q1Leitura, q2Pulso, q3Afinacao, q4Escalas, q5Postura, q6Timbre, q7Voz, q8Dinamica, 
      observacao, msaLessons, methodLessons, hymns 
    } = data;

    // Save or update the PreEvaluationResult
    await prisma.preEvaluationResult.upsert({
      where: { preEvaluationId },
      update: {
        q1Leitura, q2Pulso, q3Afinacao, q4Escalas, q5Postura, q6Timbre, q7Voz, q8Dinamica,
        observacao,
        msaLessons: msaLessons ? JSON.stringify(msaLessons) : null,
        methodLessons: methodLessons ? JSON.stringify(methodLessons) : null,
        hymns: hymns ? JSON.stringify(hymns) : null,
        evaluatorId,
      },
      create: {
        preEvaluationId,
        q1Leitura, q2Pulso, q3Afinacao, q4Escalas, q5Postura, q6Timbre, q7Voz, q8Dinamica,
        observacao,
        msaLessons: msaLessons ? JSON.stringify(msaLessons) : null,
        methodLessons: methodLessons ? JSON.stringify(methodLessons) : null,
        hymns: hymns ? JSON.stringify(hymns) : null,
        evaluatorId,
      }
    });

    let autoAllocatedTestId: string | null = null;

    if (isApproved) {
      // Find a valid test > 24 hours away
      const twentyFourHoursFromNow = new Date();
      twentyFourHoursFromNow.setHours(twentyFourHoursFromNow.getHours() + 24);

      const nextValidTest = await prisma.testSchedule.findFirst({
        where: {
          testDate: {
            gte: twentyFourHoursFromNow
          }
        },
        orderBy: {
          testDate: 'asc'
        }
      });

      if (nextValidTest) {
        autoAllocatedTestId = nextValidTest.id;
      }
    }

    const status = isApproved ? "APROVADO" : "REPROVADO";
    await prisma.preEvaluation.update({
      where: { id: preEvaluationId },
      data: { 
        status,
        testScheduleId: autoAllocatedTestId 
      }
    });

    revalidatePath("/portal");
    revalidatePath("/portal/pre-avaliacao");
    return { success: true };
  } catch (error) {
    console.error("Failed to save evaluation:", error);
    throw new Error("Falha ao salvar avaliação");
  }
}
