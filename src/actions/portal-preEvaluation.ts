"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
const safeRevalidatePath = (path: string) => {
  try { revalidatePath(path); } catch (e) {}
};
import { getSession } from "@/lib/auth";
import { sendNotificationToUser } from "@/lib/webpush";
import { getPortalScopes } from "@/lib/portal-data";
import { assertAdministrationAccess } from "@/lib/auth-scope";

export async function createPortalPreEvaluation(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Acesso negado. Sessão inválida.");

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

  // VALIDAR ESCOPO DO PORTAL PARA A IGREJA DESTINO
  const { churchScope } = await getPortalScopes(session);
  const church = await prisma.church.findFirst({
    where: { 
      id: churchId,
      AND: churchScope 
    },
    include: { sector: true }
  });

  if (!church) {
    throw new Error("Acesso negado. Você não tem permissão para cadastrar candidatos nesta Igreja.");
  }
  
  if (church.sectorId !== sectorId) throw new Error("Setor informado não corresponde ao setor da Igreja.");
  
  const candidateAdministrationId = church.sector.administrationId;

  // 2. Validar Instructor Church (mesma administração)
  let finalInstructorChurchId = gender === "F" ? (instructorChurchId === "OUTRA" || !instructorChurchId ? null : instructorChurchId) : null;
  if (finalInstructorChurchId) {
    const instChurch = await prisma.church.findUnique({ where: { id: finalInstructorChurchId }, include: { sector: true } });
    if (!instChurch) throw new Error("Igreja da instrutora inválida.");
    if (instChurch.sector.administrationId !== candidateAdministrationId) {
      throw new Error("A Igreja da Instrutora deve pertencer à mesma Administração.");
    }
  }

  // 3. Validar PersonInCharge (Encarregado deve estar no escopo da pessoa ou na mesma adm se admin)
  const pic = await prisma.personInCharge.findUnique({ where: { id: personInChargeId }, include: { church: { include: { sector: true } } } });
  if (!pic) throw new Error("Encarregado inválido.");
  if (pic.church.sector.administrationId !== candidateAdministrationId) {
    throw new Error("Encarregado deve pertencer à mesma Administração do candidato.");
  }

  const testType = await prisma.testType.findUnique({ where: { id: testTypeId } });
  const testTypeName = testType?.name?.toLowerCase() || "";
  const isExempt = gender === "M" && (testTypeName.includes("reunião") || testTypeName.includes("jovens") || testTypeName.includes("menores"));

  const newEvaluation = await prisma.preEvaluation.create({
    data: {
      candidateName,
      gender,
      sectorId,
      churchId,
      instructorName: gender === "F" ? instructorName : null,
      instructorChurchId: finalInstructorChurchId,
      instructorChurchName: gender === "F" ? (instructorChurchId === "OUTRA" ? instructorChurchName : null) : null,
      instrumentId,
      personInChargeId,
      testTypeId,
      msaStatus,
      msaJustification: msaStatus === "INCOMPLETO" ? msaJustification : null,
      currentInstrumentId: currentInstrumentId || null,
      currentTonality: currentTonality || null,
      desiredTonality: desiredTonality || null,
      officializationDate: officializationDate || null,
      candidateLevel: candidateLevel || null,
      orchestraNeed,
      illness,
      approvedInSectorMeeting,
      meetingDate: meetingDate || null,
      meetingLocality: meetingLocality || null,
      meetingElderName: meetingElderName || null,
      status: isExempt ? "APROVADO" : "PENDENTE",
      finalTestStatus: "PENDENTE",
    },
  });

  if (!isExempt) {
    try {
      const peopleToNotify = await prisma.personInCharge.findMany({
        where: {
          OR: [
            { church: { sectorId } },
            { managedChurches: { some: { sectorId } } }
          ],
          church: { sector: { administrationId: candidateAdministrationId } }
        },
        include: { roleType: true }
      });

      const targets = peopleToNotify.filter(p => {
        const role = p.roleType?.name?.toLowerCase() || "";
        return role.includes("regional") || role.includes("examinadora") || role.includes("setor");
      });

      if (targets.length > 0) {
        await prisma.notification.createMany({
          data: targets.map(t => ({
            personInChargeId: t.id,
            title: "Nova Pré-avaliação",
            message: `Novo pedido de pré-avaliação criado para o candidato(a) ${candidateName}.`,
            type: "CADASTRO"
          }))
        });

        Promise.all(
          targets.map(t => sendNotificationToUser(t.id, {
            title: "Nova Pré-avaliação",
            message: `Novo pedido de pré-avaliação criado para o candidato(a) ${candidateName}.`,
            link: "/portal/pre-avaliacao"
          }))
        ).catch(e => console.error("Erro push CADASTRO", e));
      }
    } catch (error) {
      console.error("Erro ao despachar notificações:", error);
    }
  }

  safeRevalidatePath("/portal/pre-avaliacao");
  safeRevalidatePath("/pre-avaliacao");
}

export async function updatePortalPreEvaluation(id: string, formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Acesso negado. Sessão inválida.");

  const { preEvalScope } = await getPortalScopes(session);
  const existing = await prisma.preEvaluation.findFirst({
    where: { 
      id,
      AND: preEvalScope 
    },
    include: { church: { include: { sector: true } } }
  });

  if (!existing) throw new Error("Registro não encontrado ou sem permissão.");

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

  // 1. Validar a nova Church + Sector
  const { churchScope } = await getPortalScopes(session);
  const church = await prisma.church.findFirst({
    where: { 
      id: churchId,
      AND: churchScope 
    },
    include: { sector: true }
  });

  if (!church) {
    throw new Error("Acesso negado para transferir candidato para esta Igreja.");
  }
  if (church.sectorId !== sectorId) throw new Error("Setor informado não corresponde ao setor da Igreja.");
  
  const candidateAdministrationId = church.sector.administrationId;

  let finalInstructorChurchId = gender === "F" ? (instructorChurchId === "OUTRA" || !instructorChurchId ? null : instructorChurchId) : null;
  if (finalInstructorChurchId) {
    const instChurch = await prisma.church.findUnique({ where: { id: finalInstructorChurchId }, include: { sector: true } });
    if (!instChurch) throw new Error("Igreja da instrutora inválida.");
    if (instChurch.sector.administrationId !== candidateAdministrationId) {
      throw new Error("A Igreja da Instrutora deve pertencer à mesma Administração.");
    }
  }

  const pic = await prisma.personInCharge.findUnique({ where: { id: personInChargeId }, include: { church: { include: { sector: true } } } });
  if (!pic) throw new Error("Encarregado inválido.");
  if (pic.church.sector.administrationId !== candidateAdministrationId) {
    throw new Error("Encarregado deve pertencer à mesma Administração do candidato.");
  }

  const testType = await prisma.testType.findUnique({ where: { id: testTypeId } });
  const testTypeName = testType?.name?.toLowerCase() || "";
  const isExempt = gender === "M" && (testTypeName.includes("reunião") || testTypeName.includes("jovens") || testTypeName.includes("menores"));

  // Check if we need to auto allocate
  let initialStatus = existing.status;
  let autoAllocatedTestId = existing.testScheduleId;

  if (isExempt && existing.status === "PENDENTE") {
    initialStatus = "APROVADO";
    const testDate = new Date();
    testDate.setHours(0, 0, 0, 0);

    const testSchedule = await prisma.testSchedule.findFirst({
      where: {
        testDate: { gte: testDate },
        isClosed: false,
        church: { sector: { administrationId: candidateAdministrationId } }
      }
    });
    if (testSchedule) {
      autoAllocatedTestId = testSchedule.id;
    }
  }

  await prisma.preEvaluation.update({
    where: { id },
    data: {
      candidateName,
      gender,
      sectorId,
      churchId,
      instructorName: gender === "F" ? instructorName : null,
      instructorChurchId: finalInstructorChurchId,
      instructorChurchName: gender === "F" ? (instructorChurchId === "OUTRA" ? instructorChurchName : null) : null,
      instrumentId,
      personInChargeId,
      testTypeId,
      msaStatus,
      msaJustification: msaStatus === "INCOMPLETO" ? msaJustification : null,
      currentInstrumentId: currentInstrumentId || null,
      currentTonality: currentTonality || null,
      desiredTonality: desiredTonality || null,
      officializationDate: officializationDate || null,
      candidateLevel: candidateLevel || null,
      orchestraNeed,
      illness,
      approvedInSectorMeeting,
      meetingDate: meetingDate || null,
      meetingLocality: meetingLocality || null,
      meetingElderName: meetingElderName || null,
      status: initialStatus,
      testScheduleId: autoAllocatedTestId,
    },
  });

  safeRevalidatePath("/portal/pre-avaliacao");
  safeRevalidatePath("/pre-avaliacao");
}

export async function deletePortalPreEvaluation(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Acesso negado. Sessão inválida.");

  const { preEvalScope } = await getPortalScopes(session);
  const existing = await prisma.preEvaluation.findFirst({
    where: { 
      id,
      AND: preEvalScope 
    }
  });

  if (!existing) throw new Error("Registro não encontrado ou sem permissão.");

  await prisma.preEvaluation.delete({
    where: { id },
  });
  
  safeRevalidatePath("/portal/pre-avaliacao");
  safeRevalidatePath("/pre-avaliacao");
}

export async function schedulePortalPreEvaluationDate(id: string, date: Date, evaluatorId?: string) {
  const session = await getSession();
  if (!session || (session.type !== "encarregado" && session.type !== "admin")) {
    throw new Error("Não autorizado");
  }

  const { preEvalScope } = await getPortalScopes(session);
  const preEvaluation = await prisma.preEvaluation.findFirst({
    where: { 
      id,
      AND: preEvalScope
    },
    include: { church: { include: { sector: true } } }
  });

  if (!preEvaluation) throw new Error("Registro não encontrado ou sem permissão.");

  if (evaluatorId) {
    const { personInChargeScope } = await getPortalScopes(session);
    const evaluatorPic = await prisma.personInCharge.findFirst({ 
      where: { 
        id: evaluatorId,
        AND: personInChargeScope
      }
    });
    if (!evaluatorPic) throw new Error("Avaliador inválido ou sem permissão.");
  }

  await prisma.preEvaluation.update({
    where: { id },
    data: {
      scheduledDate: date,
      schedulerId: session.type === "encarregado" ? session.id : undefined,
      testEvaluatorId: evaluatorId ? evaluatorId : undefined,
    }
  });

  const dateStr = new Date(date).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  await prisma.notification.create({
    data: {
      personInChargeId: preEvaluation.personInChargeId,
      title: "Avaliação Agendada",
      message: `A pré-avaliação de ${preEvaluation.candidateName} foi agendada para ${dateStr}.`,
      type: "AGENDAMENTO"
    }
  });

  sendNotificationToUser(preEvaluation.personInChargeId, {
    title: "Avaliação Agendada",
    message: `A pré-avaliação de ${preEvaluation.candidateName} foi agendada para ${dateStr}.`,
    link: "/portal/pre-avaliacao"
  }).catch(e => console.error("Erro push AGENDAMENTO", e));

  safeRevalidatePath("/portal/pre-avaliacao");
  safeRevalidatePath("/pre-avaliacao");
}

export async function allocatePortalToTest(preEvaluationId: string, testScheduleId: string, masterKey: string) {
  const session = await getSession();
  if (!session) throw new Error("Acesso negado. Sessão inválida.");

  const { testScheduleScope, preEvalScope } = await getPortalScopes(session);

  const testSchedule = await prisma.testSchedule.findFirst({
    where: { 
      id: testScheduleId,
      AND: testScheduleScope
    }
  });

  if (!testSchedule) {
    throw new Error("Agendamento não encontrado ou sem permissão.");
  }

  if (testSchedule.masterKey !== masterKey) {
    throw new Error("Chave do Teste inválida.");
  }

  const evaluation = await prisma.preEvaluation.findFirst({
    where: { 
      id: preEvaluationId,
      AND: preEvalScope
    }
  });

  if (!evaluation) {
    throw new Error("Candidato não encontrado ou sem permissão.");
  }

  await prisma.preEvaluation.update({
    where: { id: preEvaluationId },
    data: { testScheduleId }
  });

  safeRevalidatePath("/portal/pre-avaliacao");
  safeRevalidatePath("/pre-avaliacao");
}
