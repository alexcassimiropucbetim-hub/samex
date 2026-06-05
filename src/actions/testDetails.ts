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

export async function updateCandidateTestRecord(candidateId: string, evaluatorId: string | null, finalStatus: string) {
  await prisma.preEvaluation.update({
    where: { id: candidateId },
    data: { 
      testEvaluatorId: evaluatorId,
      finalTestStatus: finalStatus
    }
  });
  // We revalidate but don't strictly need to return anything. The client component will handle state optimistically if we want, or rely on router.refresh
}
