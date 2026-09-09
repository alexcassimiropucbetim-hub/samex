"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTestDetails(id: string) {
  return await prisma.testSchedule.findUnique({
    where: { id },
    include: {
      church: {
        include: { sector: true }
      },
      candidates: {
        include: {
          church: true,
          sector: true,
          instrument: true,
          testType: true,
          testEvaluator: true,
          evaluationResult: true,
        },
        orderBy: {
          candidateName: "asc"
        }
      }
    }
  });
}

export async function getEligibleEvaluators() {
  return await prisma.personInCharge.findMany({
    include: {
      roleType: true,
      allowedTestTypes: true
    },
    orderBy: { fullName: "asc" }
  });
}

export async function toggleTestLock(id: string, isClosed: boolean) {
  await prisma.testSchedule.update({
    where: { id },
    data: { isClosed }
  });
  revalidatePath(`/portal/cadastro-teste/${id}`);
}

import { getSession } from "@/lib/auth";

export async function updateCandidateTestRecord(candidateId: string, evaluatorId: string | null, finalStatus: string) {
  const session = await getSession();
  
  // Fetch current evaluator to see if it's changing
  const current = await prisma.preEvaluation.findUnique({
    where: { id: candidateId },
    select: { testEvaluatorId: true, candidateName: true }
  });

  const isChangingEvaluator = current?.testEvaluatorId !== evaluatorId;

  const dataToUpdate: any = {
    testEvaluatorId: evaluatorId,
    finalTestStatus: finalStatus,
  };

  if (isChangingEvaluator && session) {
    if (session.type === "admin") {
      dataToUpdate.evaluatorAssignedByAdmin = session.id; // Or username if it were username, but session.id holds the id
    } else {
      dataToUpdate.evaluatorAssignedById = session.id;
    }
    dataToUpdate.evaluatorAssignedAt = new Date();
  }

  await prisma.preEvaluation.update({
    where: { id: candidateId },
    data: dataToUpdate
  });

  // Log the activity if it changed
  if (isChangingEvaluator && session) {
    await prisma.activityLog.create({
      data: {
        action: "APONTOU_AVALIADOR",
        entityType: "PreEvaluation",
        entityId: candidateId,
        details: `Candidato ${current?.candidateName} apontado para avaliador ${evaluatorId || 'nenhum'}`,
        personInChargeId: session.type === "encarregado" ? session.id : null,
        adminUsername: session.type === "admin" ? session.name : null, 
      }
    });
  }
}
