"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadTestResultToDrive } from "@/lib/googleDrive";

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

  // Se o teste foi finalizado (Aprovado ou Reprovado), disparamos o backup
  if (status === "APROVADO" || status === "REPROVADO") {
    // Não usamos await para não travar o fluxo da UI enquanto o upload acontece
    uploadTestResultToDrive(candidateId, status === "APROVADO").catch(err => {
      console.error("Falha silenciosa no backup do Google Drive:", err);
    });
  }

  revalidatePath("/painel-testes");
}
