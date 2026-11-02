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
      include: { 
        church: { include: { sector: true } },
        evaluationResult: true
      }
    });

    if (!evaluation) {
      throw new Error("Registro não encontrado ou sem permissão.");
    }

    const candAdminId = evaluation.church.sector.administrationId;

    if (admin) {
      await assertAdministrationAccess(candAdminId);
    }

    const isEditing = Boolean(evaluation.evaluationResult);
    const evaluatorId = session?.type === "encarregado" ? session.id : (evaluation.evaluationResult?.evaluatorId || null);

    if (evaluatorId && session?.type === "encarregado") {
      const pic = await prisma.personInCharge.findUnique({
        where: { id: evaluatorId },
        include: { church: { include: { sector: true } } }
      });
      if (!pic) {
        throw new Error("Acesso negado. Avaliador não encontrado.");
      }
      if (pic.church.sector.administrationId !== candAdminId && evaluation.testEvaluatorId !== evaluatorId) {
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
      // Se já possuía um agendamento vinculado, preserva
      if (evaluation.testScheduleId) {
        autoAllocatedTestId = evaluation.testScheduleId;
      } else {
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
    } else {
      // Reprovado não tem teste agendado
      autoAllocatedTestId = null;
    }

    const status = isApproved ? "APROVADO" : "REPROVADO";
    const updatedEval = await prisma.preEvaluation.update({
      where: { id: preEvaluationId },
      data: { 
        status,
        testScheduleId: autoAllocatedTestId 
      }
    });

    const notifTitle = isEditing ? "Avaliação Atualizada" : "Resultado de Avaliação";
    const notifMsg = `A avaliação do candidato ${updatedEval.candidateName} foi ${isEditing ? "atualizada" : "registrada"}. Resultado: ${status}.`;

    await prisma.notification.create({
      data: {
        personInChargeId: updatedEval.personInChargeId,
        title: notifTitle,
        message: notifMsg,
        type: "RESULTADO"
      }
    });

    sendNotificationToUser(updatedEval.personInChargeId, {
      title: notifTitle,
      message: notifMsg,
      link: `/portal/pre-avaliacao/resultado?id=${preEvaluationId}`
    }).catch(e => console.error("Erro push RESULTADO", e));

    await import("@/lib/audit").then(m => m.logActivity(
      isEditing ? "EDITOU_AVALIACAO_CANDIDATO" : "AVALIOU_CANDIDATO",
      "PreEvaluation",
      preEvaluationId,
      { status, observacao, autoAllocatedTestId }
    ));

    revalidatePath("/portal");
    revalidatePath("/portal/pre-avaliacao");
    revalidatePath("/portal/pre-avaliacao/resultado");
    revalidatePath("/portal/pre-avaliacao/avaliar");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to save evaluation:", error);
    throw new Error("Falha ao salvar avaliação: " + (error?.message || String(error)));
  }
}
