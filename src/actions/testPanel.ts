"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadTestResultToDrive } from "@/lib/googleDrive";

export async function assignEvaluator(candidateId: string, evaluatorId: string | null) {
  await prisma.preEvaluation.update({
    where: { id: candidateId },
    data: {
      testEvaluatorId: evaluatorId,
      evaluatorConfirmed: false, // Reseta a confirmação ao trocar
    },
  });

  revalidatePath("/painel-testes");
}

export async function confirmEvaluator(candidateId: string, confirmed: boolean) {
  await prisma.preEvaluation.update({
    where: { id: candidateId },
    data: {
      evaluatorConfirmed: confirmed,
    },
  });

  revalidatePath("/painel-testes");
}

export async function startTest(candidateId: string) {
  await prisma.preEvaluation.update({
    where: { id: candidateId },
    data: {
      testStartTime: new Date(),
    },
  });

  revalidatePath("/portal/meus-testes");
  revalidatePath("/painel-testes");
}

export async function submitTestResult(candidateId: string, status: string) {
  await prisma.preEvaluation.update({
    where: { id: candidateId },
    data: {
      status,
      finalTestStatus: status,
      testEndTime: new Date(),
    },
  });

  // Se o teste foi finalizado (Aprovado ou Reprovado), disparamos o backup
  if (status === "APROVADO" || status === "REPROVADO") {
    uploadTestResultToDrive(candidateId, status === "APROVADO").catch(err => {
      console.error("Falha silenciosa no backup do Google Drive:", err);
    });
  }

  revalidatePath("/portal/meus-testes");
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
