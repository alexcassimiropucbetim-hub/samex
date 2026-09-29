"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { sendNotificationToUser } from "@/lib/webpush";
import { getAuthenticatedAdmin, assertAdministrationAccess } from "@/lib/auth-scope";

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
    const admin = await getAuthenticatedAdmin();

    const { 
      preEvaluationId, 
      isApproved, 
      q1Leitura, q2Pulso, q3Afinacao, q4Escalas, q5Postura, q6Timbre, q7Voz, q8Dinamica, 
      observacao, msaLessons, methodLessons, hymns 
    } = data;

    const evaluation = await prisma.preEvaluation.findUnique({
      where: { id: preEvaluationId },
      include: { church: { include: { sector: true } } }
    });

    if (!evaluation) {
      throw new Error("Registro não encontrado ou sem permissão.");
    }

    const candAdminId = evaluation.church.sector.administrationId;

    if (admin) {
      await assertAdministrationAccess(candAdminId);
    }

    const evaluatorId = session?.type === "encarregado" ? session.id : null;

    if (evaluatorId) {
      const pic = await prisma.personInCharge.findUnique({
        where: { id: evaluatorId },
        include: { church: { include: { sector: true } } }
      });
      if (!pic || pic.church.sector.administrationId !== candAdminId) {
        throw new Error("Acesso negado. Avaliador não pertence à mesma Administração.");
      }
    }

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
      const twentyFourHoursFromNow = new Date();
      twentyFourHoursFromNow.setHours(twentyFourHoursFromNow.getHours() + 24);

      const nextValidTest = await prisma.testSchedule.findFirst({
        where: {
          testDate: { gte: twentyFourHoursFromNow },
          church: { sector: { administrationId: candAdminId } }
        },
        orderBy: { testDate: 'asc' }
      });

      if (nextValidTest) {
        autoAllocatedTestId = nextValidTest.id;
      }
    }

    const status = isApproved ? "APROVADO" : "REPROVADO";
    const updatedEval = await prisma.preEvaluation.update({
      where: { id: preEvaluationId },
      data: { 
        status,
        testScheduleId: autoAllocatedTestId 
      }
    });

    await prisma.notification.create({
      data: {
        personInChargeId: updatedEval.personInChargeId,
        title: "Resultado de Avaliação",
        message: `O candidato ${updatedEval.candidateName} foi avaliado. Resultado: ${status}.`,
        type: "RESULTADO"
      }
    });

    sendNotificationToUser(updatedEval.personInChargeId, {
      title: "Resultado de Avaliação",
      message: `O candidato ${updatedEval.candidateName} foi avaliado. Resultado: ${status}.`,
      link: "/portal/pre-avaliacao"
    }).catch(e => console.error("Erro push RESULTADO", e));

    await import("@/lib/audit").then(m => m.logActivity(
      "AVALIOU_CANDIDATO",
      "PreEvaluation",
      preEvaluationId,
      { status, observacao, autoAllocatedTestId }
    ));

    revalidatePath("/portal");
    revalidatePath("/portal/pre-avaliacao");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to save evaluation:", error);
    throw new Error("Falha ao salvar avaliação: " + (error?.message || String(error)));
  }
}
