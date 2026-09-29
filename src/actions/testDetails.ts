"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin, assertAdministrationAccess, buildAdministrationWhere } from "@/lib/auth-scope";
import { getSession } from "@/lib/auth";

export async function getTestDetails(id: string) {
  const schedule = await prisma.testSchedule.findUnique({
    where: { id },
    include: { church: { include: { sector: true } } }
  });

  if (!schedule) return null;

  const admin = await getAuthenticatedAdmin();
  if (admin) {
    try {
      await assertAdministrationAccess(schedule.church.sector.administrationId);
    } catch {
      return null; // Não revelar existência retornando erro em visualização
    }
  }

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
  const scope = await buildAdministrationWhere("PersonInCharge");
  return await prisma.personInCharge.findMany({
    where: scope,
    include: {
      roleType: true,
      allowedTestTypes: true
    },
    orderBy: { fullName: "asc" }
  });
}

export async function toggleTestLock(id: string, isClosed: boolean) {
  const schedule = await prisma.testSchedule.findUnique({
    where: { id },
    include: { church: { include: { sector: true } } }
  });
  if (!schedule) throw new Error("Registro não encontrado ou sem permissão.");
  
  const admin = await getAuthenticatedAdmin();
  if (admin) {
    await assertAdministrationAccess(schedule.church.sector.administrationId);
  }

  await prisma.testSchedule.update({
    where: { id },
    data: { isClosed }
  });
  revalidatePath(`/portal/cadastro-teste/${id}`);
}

export async function updateCandidateTestRecord(candidateId: string, evaluatorId: string | null, finalStatus: string) {
  const session = await getSession();
  const admin = await getAuthenticatedAdmin();

  const current = await prisma.preEvaluation.findUnique({
    where: { id: candidateId },
    include: { church: { include: { sector: true } } }
  });

  if (!current) throw new Error("Registro não encontrado ou sem permissão.");

  const candAdminId = current.church.sector.administrationId;
  if (admin) {
    await assertAdministrationAccess(candAdminId);
  }

  if (evaluatorId) {
    const pic = await prisma.personInCharge.findUnique({
      where: { id: evaluatorId },
      include: { church: { include: { sector: true } } }
    });
    if (!pic || pic.church.sector.administrationId !== candAdminId) {
      throw new Error("Acesso negado. Avaliador inválido.");
    }
  }

  const isChangingEvaluator = current.testEvaluatorId !== evaluatorId;

  const dataToUpdate: any = {
    testEvaluatorId: evaluatorId,
    finalTestStatus: finalStatus,
  };

  if (isChangingEvaluator && session) {
    if (session.type === "admin") {
      dataToUpdate.evaluatorAssignedByAdmin = session.id;
    } else {
      dataToUpdate.evaluatorAssignedById = session.id;
    }
    dataToUpdate.evaluatorAssignedAt = new Date();
  }

  await prisma.preEvaluation.update({
    where: { id: candidateId },
    data: dataToUpdate
  });

  if (isChangingEvaluator && session) {
    await prisma.activityLog.create({
      data: {
        action: "APONTOU_AVALIADOR",
        entityType: "PreEvaluation",
        entityId: candidateId,
        details: `Candidato ${current.candidateName} apontado para avaliador ${evaluatorId || 'nenhum'}`,
        personInChargeId: session.type === "encarregado" ? session.id : null,
        adminUsername: session.type === "admin" ? session.name : null, 
      }
    });
  }
}
