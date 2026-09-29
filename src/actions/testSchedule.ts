"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin, assertAdministrationAccess, buildAdministrationWhere } from "@/lib/auth-scope";

export async function createTestSchedule(formData: FormData) {
  const admin = await getAuthenticatedAdmin();
  const testDate = formData.get("testDate") as string;
  const churchId = formData.get("churchId") as string;
  const masterKey = formData.get("masterKey") as string;
  const elderName = formData.get("elderName") as string;

  if (!testDate || !churchId) return;

  const church = await prisma.church.findUnique({ 
    where: { id: churchId },
    include: { sector: true }
  });
  if (!church) throw new Error("Igreja não encontrada.");
  
  if (admin) {
    await assertAdministrationAccess(church.sector.administrationId);
  }

  const testSchedule = await prisma.testSchedule.create({
    data: {
      testDate: new Date(testDate),
      churchId,
      masterKey: masterKey || null,
      elderName: elderName || null,
    },
  });

  const dateStr = new Date(testDate).toLocaleString("pt-BR", { dateStyle: "short" });

  // Alocar automaticamente todos os candidatos aprovados que aguardam teste
  // **CORREÇÃO**: Apenas da mesma Administração do Exame!
  const pendingEvaluations = await prisma.preEvaluation.findMany({
    where: { 
      status: "APROVADO", 
      testScheduleId: null,
      church: { sector: { administrationId: church.sector.administrationId } }
    },
    select: { id: true, personInChargeId: true, candidateName: true }
  });

  if (pendingEvaluations.length > 0) {
    const ids = pendingEvaluations.map(p => p.id);
    await prisma.preEvaluation.updateMany({
      where: { id: { in: ids } },
      data: {
        testScheduleId: testSchedule.id,
        finalTestStatus: "PENDENTE"
      }
    });

    // Notificar os encarregados dos candidatos alocados automaticamente
    await prisma.notification.createMany({
      data: pendingEvaluations.map(evalData => ({
        personInChargeId: evalData.personInChargeId,
        message: `O candidato ${evalData.candidateName} foi alocado automaticamente no exame de ${dateStr}.`
      }))
    });
  }

  // Notificar todos os encarregados **da mesma Administração** sobre o novo exame
  const encarregadosLocal = await prisma.personInCharge.findMany({ 
    where: { church: { sector: { administrationId: church.sector.administrationId } } },
    select: { id: true } 
  });

  if (encarregadosLocal.length > 0) {
    await prisma.notification.createMany({
      data: encarregadosLocal.map(enc => ({
        personInChargeId: enc.id,
        message: `Novo exame agendado em ${church.name} para o dia ${dateStr}.`
      }))
    });
  }

  revalidatePath("/portal/cadastro-teste");
}

export async function getTestSchedules() {
  const scope = await buildAdministrationWhere("TestSchedule");
  return await prisma.testSchedule.findMany({
    where: scope,
    include: { church: { include: { sector: true } } },
    orderBy: { testDate: "desc" },
  });
}

export async function deleteTestSchedule(id: string) {
  const schedule = await prisma.testSchedule.findUnique({
    where: { id },
    include: { church: { include: { sector: true } } }
  });
  if (!schedule) throw new Error("Registro não encontrado ou sem permissão.");

  const admin = await getAuthenticatedAdmin();
  if (admin) {
    await assertAdministrationAccess(schedule.church.sector.administrationId);
  }

  await prisma.testSchedule.delete({
    where: { id },
  });
  revalidatePath("/portal/cadastro-teste");
}

export async function updateTestSchedule(id: string, formData: FormData) {
  const admin = await getAuthenticatedAdmin();
  const testDate = formData.get("testDate") as string;
  const churchId = formData.get("churchId") as string;
  const masterKey = formData.get("masterKey") as string;
  const elderName = formData.get("elderName") as string;

  if (!testDate || !churchId) return;

  const existing = await prisma.testSchedule.findUnique({
    where: { id },
    include: { church: { include: { sector: true } } }
  });
  if (!existing) throw new Error("Registro não encontrado ou sem permissão.");

  if (admin) {
    await assertAdministrationAccess(existing.church.sector.administrationId);
  }

  const newChurch = await prisma.church.findUnique({ 
    where: { id: churchId },
    include: { sector: true }
  });
  if (!newChurch) throw new Error("Nova Igreja inválida.");

  if (admin) {
    // Se mudou a igreja, precisa ter acesso à nova igreja
    await assertAdministrationAccess(newChurch.sector.administrationId);
    
    // Um ADMINISTRATION_ADMIN não pode mover de uma adm pra outra (o assert já bloquearia se ele tentasse mover pra outra que ele não tem acesso, 
    // mas pra garantir a regra: ele não pode fazer isso nem se ele tivesse duplo papel - o que não existe, mas ok)
    if (admin.role !== "SUPER_ADMIN" && existing.church.sector.administrationId !== newChurch.sector.administrationId) {
      throw new Error("Não é possível transferir agendas entre Administrações.");
    }
  }

  await prisma.testSchedule.update({
    where: { id },
    data: {
      testDate: new Date(testDate),
      churchId,
      masterKey: masterKey || null,
      elderName: elderName || null,
    },
  });

  const dateStr = new Date(testDate).toLocaleString("pt-BR", { dateStyle: "short" });

  const encarregadosLocal = await prisma.personInCharge.findMany({ 
    where: { church: { sector: { administrationId: newChurch.sector.administrationId } } },
    select: { id: true } 
  });
  
  if (encarregadosLocal.length > 0) {
    await prisma.notification.createMany({
      data: encarregadosLocal.map(enc => ({
        personInChargeId: enc.id,
        message: `Houve uma alteração no exame de ${newChurch.name}. Nova data: ${dateStr}.`
      }))
    });
  }

  revalidatePath("/cadastro-teste");
}
