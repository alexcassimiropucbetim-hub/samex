"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

export async function createPreEvaluation(formData: FormData) {
  const candidateName = formData.get("candidateName") as string;
  const gender = formData.get("gender") as string;
  const sectorId = formData.get("sectorId") as string;
  const churchId = formData.get("churchId") as string;
  
  const instructorName = formData.get("instructorName") as string | null;
  const instructorChurchId = formData.get("instructorChurchId") as string | null;
  const instructorChurchName = formData.get("instructorChurchName") as string | null;
  
  const instrumentId = formData.get("instrumentId") as string;
  const personInChargeId = formData.get("personInChargeId") as string;
  const testTypeId = formData.get("testTypeId") as string;
  
  const msaStatus = formData.get("msaStatus") as string;
  const msaJustification = formData.get("msaJustification") as string | null;

  const currentInstrumentId = formData.get("currentInstrumentId") as string | null;
  const currentTonality = formData.get("currentTonality") as string | null;
  const desiredTonality = formData.get("desiredTonality") as string | null;
  const officializationDate = formData.get("officializationDate") as string | null;
  const candidateLevel = formData.get("candidateLevel") as string | null;
  
  const parseBoolean = (val: string | null) => val ? val === "true" : null;
  const orchestraNeed = parseBoolean(formData.get("orchestraNeed") as string | null);
  const illness = parseBoolean(formData.get("illness") as string | null);
  const approvedInSectorMeeting = parseBoolean(formData.get("approvedInSectorMeeting") as string | null);
  const meetingDate = formData.get("meetingDate") as string | null;
  const meetingLocality = formData.get("meetingLocality") as string | null;
  const meetingElderName = formData.get("meetingElderName") as string | null;

  if (!candidateName || !gender || !sectorId || !churchId || !instrumentId || !personInChargeId || !testTypeId || !msaStatus) {
    throw new Error("Preencha todos os campos obrigatórios.");
  }

  await prisma.preEvaluation.create({
    data: {
      candidateName,
      gender,
      sectorId,
      churchId,
      instructorName: gender === "F" ? instructorName : null,
      instructorChurchId: gender === "F" ? (instructorChurchId === "OUTRA" ? null : instructorChurchId) : null,
      instructorChurchName: gender === "F" ? (instructorChurchId === "OUTRA" ? instructorChurchName : null) : null,
      instrumentId,
      personInChargeId,
      testTypeId,
      msaStatus,
      msaJustification: msaStatus === "INCOMPLETO" ? msaJustification : null,
      currentInstrumentId: currentInstrumentId || null,
      currentTonality,
      desiredTonality,
      officializationDate,
      candidateLevel,
      orchestraNeed,
      illness,
      approvedInSectorMeeting,
      meetingDate,
      meetingLocality,
      meetingElderName,
    },
  });

  try {
    const peopleToNotify = await prisma.personInCharge.findMany({
      where: {
        OR: [
          { church: { sectorId } },
          { managedChurches: { some: { sectorId } } }
        ]
      },
      include: { roleType: true }
    });

    const targets = peopleToNotify.filter(p => {
      const role = p.roleType?.name?.toLowerCase() || "";
      return role.includes("regional") || role.includes("examinadora") || role.includes("setor");
    });

    if (targets.length > 0) {
      await prisma.notification.createMany({
        data: targets.map(person => ({
          personInChargeId: person.id,
          message: `Novo pedido de pré-avaliação criado para o candidato(a) ${candidateName}.`
        }))
      });
    }
  } catch (error) {
    console.error("Erro ao despachar notificações:", error);
  }

  revalidatePath("/pre-avaliacao");
  // Se houver uma tela de listagem futura, revalidar a rota
}

export async function getPreEvaluations() {
  return await prisma.preEvaluation.findMany({
    include: {
      sector: true,
      church: true,
      personInCharge: true,
      testType: true,
      scheduler: true,
      instrument: true,
      currentInstrument: true,
      evaluationResult: {
        include: {
          evaluator: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deletePreEvaluation(id: string) {
  await prisma.preEvaluation.delete({
    where: { id },
  });
  revalidatePath("/pre-avaliacao");
}

export async function schedulePreEvaluationDate(id: string, date: Date, evaluatorId?: string) {
  const session = await getSession();
  if (!session || (session.type !== "encarregado" && session.type !== "admin")) {
    throw new Error("Não autorizado");
  }

  await prisma.preEvaluation.update({
    where: { id },
    data: {
      scheduledDate: date,
      schedulerId: session.type === "encarregado" ? session.id : undefined,
      testEvaluatorId: session.type === "admin" && evaluatorId ? evaluatorId : undefined,
    }
  });

  revalidatePath("/pre-avaliacao");
}

export async function updatePreEvaluation(id: string, formData: FormData) {
  const candidateName = formData.get("candidateName") as string;
  const gender = formData.get("gender") as string;
  const sectorId = formData.get("sectorId") as string;
  const churchId = formData.get("churchId") as string;
  
  const instructorName = formData.get("instructorName") as string | null;
  const instructorChurchId = formData.get("instructorChurchId") as string | null;
  const instructorChurchName = formData.get("instructorChurchName") as string | null;
  
  const instrumentId = formData.get("instrumentId") as string;
  const personInChargeId = formData.get("personInChargeId") as string;
  const testTypeId = formData.get("testTypeId") as string;
  
  const msaStatus = formData.get("msaStatus") as string;
  const msaJustification = formData.get("msaJustification") as string | null;

  const currentInstrumentId = formData.get("currentInstrumentId") as string | null;
  const currentTonality = formData.get("currentTonality") as string | null;
  const desiredTonality = formData.get("desiredTonality") as string | null;
  const officializationDate = formData.get("officializationDate") as string | null;
  const candidateLevel = formData.get("candidateLevel") as string | null;
  
  const parseBoolean = (val: string | null) => val ? val === "true" : null;
  const orchestraNeed = parseBoolean(formData.get("orchestraNeed") as string | null);
  const illness = parseBoolean(formData.get("illness") as string | null);
  const approvedInSectorMeeting = parseBoolean(formData.get("approvedInSectorMeeting") as string | null);
  const meetingDate = formData.get("meetingDate") as string | null;
  const meetingLocality = formData.get("meetingLocality") as string | null;
  const meetingElderName = formData.get("meetingElderName") as string | null;

  if (!candidateName || !gender || !sectorId || !churchId || !instrumentId || !personInChargeId || !testTypeId || !msaStatus) {
    throw new Error("Preencha todos os campos obrigatórios.");
  }

  await prisma.preEvaluation.update({
    where: { id },
    data: {
      candidateName,
      gender,
      sectorId,
      churchId,
      instructorName: gender === "F" ? instructorName : null,
      instructorChurchId: gender === "F" ? (instructorChurchId === "OUTRA" ? null : instructorChurchId) : null,
      instructorChurchName: gender === "F" ? (instructorChurchId === "OUTRA" ? instructorChurchName : null) : null,
      instrumentId,
      personInChargeId,
      testTypeId,
      msaStatus,
      msaJustification: msaStatus === "INCOMPLETO" ? msaJustification : null,
      currentInstrumentId: currentInstrumentId || null,
      currentTonality,
      desiredTonality,
      officializationDate,
      candidateLevel,
      orchestraNeed,
      illness,
      approvedInSectorMeeting,
      meetingDate,
      meetingLocality,
      meetingElderName,
    },
  });

  revalidatePath("/pre-avaliacao");
}
