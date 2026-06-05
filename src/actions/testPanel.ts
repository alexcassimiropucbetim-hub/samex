"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function assignEvaluator(candidateId: string, evaluatorId: string | null) {
  await prisma.preEvaluation.update({
    where: { id: candidateId },
    data: {
      testEvaluatorId: evaluatorId,
    },
  });

  revalidatePath("/painel-testes");
}

export async function updateCandidateStatus(candidateId: string, status: string) {
  await prisma.preEvaluation.update({
    where: { id: candidateId },
    data: {
      status,
      finalTestStatus: status, // Update both to keep them synced for now
    },
  });

  revalidatePath("/painel-testes");
}

