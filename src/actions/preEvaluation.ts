"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { sendNotificationToUser } from "@/lib/webpush";
import { getAuthenticatedAdmin, buildAdministrationWhere, assertAdministrationAccess } from "@/lib/auth-scope";

export async function createPreEvaluation(formData: FormData) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Acesso negado. Administrador não autenticado.");

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

  // 1. Validar Church + Sector
  const church = await prisma.church.findUnique({ where: { id: churchId }, include: { sector: true } });
  if (!church) throw new Error("Igreja inválida.");
  if (church.sectorId !== sectorId) throw new Error("Setor informado não corresponde ao setor da Igreja.");
  
  const candidateAdministrationId = church.sector.administrationId;
  await assertAdministrationAccess(candidateAdministrationId);

  // 2. Validar Instructor Church
  let finalInstructorChurchId = gender === "F" ? (instructorChurchId === "OUTRA" ? null : instructorChurchId) : null;
  if (finalInstructorChurchId) {
    const instChurch = await prisma.church.findUnique({ where: { id: finalInstructorChurchId }, include: { sector: true } });
    if (!instChurch) throw new Error("Igreja da instrutora inválida.");
    if (instChurch.sector.administrationId !== candidateAdministrationId) {
      throw new Error("A Igreja da Instrutora deve pertencer à mesma Administração.");
    }
  }

  // 3. Validar PersonInCharge
  const pic = await prisma.personInCharge.findUnique({ where: { id: personInChargeId }, include: { church: { include: { sector: true } } } });
  if (!pic) throw new Error("Encarregado inválido.");
  if (pic.church.sector.administrationId !== candidateAdministrationId) {
    throw new Error("Encarregado deve pertencer à mesma Administração do candidato.");
  }

  const testType = await prisma.testType.findUnique({ where: { id: testTypeId } });
  const testTypeName = testType?.name?.toLowerCase() || "";
  const isExempt = gender === "M" && (testTypeName.includes("reunião") || testTypeName.includes("jovens") || testTypeName.includes("menores"));

  let autoAllocatedTestId: string | null = null;
  let initialStatus = "PENDENTE";

  if (isExempt) {
    initialStatus = "APROVADO";
    
    const twentyFourHoursFromNow = new Date();
    twentyFourHoursFromNow.setHours(twentyFourHoursFromNow.getHours() + 24);

    // Autoalocação isolada por Administração
    const nextValidTest = await prisma.testSchedule.findFirst({
      where: {
        testDate: { gte: twentyFourHoursFromNow },
        church: { sector: { administrationId: candidateAdministrationId } }
      },
      orderBy: { testDate: 'asc' }
    });

    if (nextValidTest) {
      autoAllocatedTestId = nextValidTest.id;
    }
  }

  await prisma.preEvaluation.create({
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
      status: initialStatus,
      testScheduleId: autoAllocatedTestId,
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
          data: targets.map(person => ({
            personInChargeId: person.id,
            title: "Novo Pedido de Avaliação",
            message: `Novo pedido de pré-avaliação criado para o candidato(a) ${candidateName}.`,
            type: "CADASTRO"
          }))
        });

        Promise.allSettled(
          targets.map(person => sendNotificationToUser(person.id, {
            title: "Novo Pedido de Avaliação",
            message: `Novo pedido de pré-avaliação criado para o candidato(a) ${candidateName}.`,
            link: "/portal/pre-avaliacao"
          }))
        ).catch(e => console.error("Erro push CADASTRO", e));
      }
    } catch (error) {
      console.error("Erro ao despachar notificações:", error);
    }
  }

  revalidatePath("/pre-avaliacao");
}

export async function getPreEvaluations() {
  const scope = await buildAdministrationWhere("PreEvaluation");
  return await prisma.preEvaluation.findMany({
    where: {
      AND: [
        { finalTestStatus: { not: "APROVADO" } },
        scope
      ]
    },
    include: {
      sector: true,
      church: true,
      personInCharge: true,
      testType: true,
      scheduler: true,
      testEvaluator: true,
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
  const existing = await prisma.preEvaluation.findUnique({
    where: { id },
    include: { church: { include: { sector: true } } }
  });
  if (!existing) throw new Error("Registro não encontrado ou sem permissão.");
  await assertAdministrationAccess(existing.church.sector.administrationId);

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

  const preEvaluation = await prisma.preEvaluation.findUnique({
    where: { id },
    include: { church: { include: { sector: true } } }
  });

  if (!preEvaluation) throw new Error("Registro não encontrado ou sem permissão.");

  // Se admin, aplica isolamento (encarregados só veem suas próprias pelo frontend, mas idealmente deveriamos verificar a nível de encarregado tbm. Para o caso do admin, usamos auth-scope)
  if (session.type === "admin") {
    await assertAdministrationAccess(preEvaluation.church.sector.administrationId);
  }

  if (evaluatorId) {
    const evaluatorPic = await prisma.personInCharge.findUnique({ 
      where: { id: evaluatorId }, 
      include: { church: { include: { sector: true } } } 
    });
    if (!evaluatorPic) throw new Error("Avaliador inválido.");
    if (evaluatorPic.church.sector.administrationId !== preEvaluation.church.sector.administrationId) {
      throw new Error("O Avaliador deve pertencer à mesma Administração do candidato.");
    }
  }

  await prisma.preEvaluation.update({
    where: { id },
    data: {
      scheduledDate: date,
      schedulerId: session.type === "encarregado" ? session.id : undefined,
      testEvaluatorId: session.type === "admin" && evaluatorId ? evaluatorId : undefined,
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

  revalidatePath("/pre-avaliacao");
}

export async function updatePreEvaluation(id: string, formData: FormData) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Acesso negado.");

  const existing = await prisma.preEvaluation.findUnique({
    where: { id },
    include: { church: { include: { sector: true } } }
  });
  if (!existing) throw new Error("Registro não encontrado ou sem permissão.");
  await assertAdministrationAccess(existing.church.sector.administrationId);

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

  // Validar Church + Sector
  const church = await prisma.church.findUnique({ where: { id: churchId }, include: { sector: true } });
  if (!church) throw new Error("Igreja inválida.");
  if (church.sectorId !== sectorId) throw new Error("Setor informado não corresponde ao setor da Igreja.");
  
  const candidateAdministrationId = church.sector.administrationId;
  await assertAdministrationAccess(candidateAdministrationId);

  // Validar Instructor Church
  let finalInstructorChurchId = gender === "F" ? (instructorChurchId === "OUTRA" ? null : instructorChurchId) : null;
  if (finalInstructorChurchId) {
    const instChurch = await prisma.church.findUnique({ where: { id: finalInstructorChurchId }, include: { sector: true } });
    if (!instChurch) throw new Error("Igreja da instrutora inválida.");
    if (instChurch.sector.administrationId !== candidateAdministrationId) {
      throw new Error("A Igreja da Instrutora deve pertencer à mesma Administração.");
    }
  }

  // Validar PersonInCharge
  const pic = await prisma.personInCharge.findUnique({ where: { id: personInChargeId }, include: { church: { include: { sector: true } } } });
  if (!pic) throw new Error("Encarregado inválido.");
  if (pic.church.sector.administrationId !== candidateAdministrationId) {
    throw new Error("Encarregado deve pertencer à mesma Administração do candidato.");
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
