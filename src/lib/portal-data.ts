import { prisma } from "@/lib/prisma";
import { buildAdministrationWhere } from "@/lib/auth-scope";

export async function getPortalScopes(session: any) {
  const isRegional = Boolean(session?.roleName?.toLowerCase().includes("regional"));
  const isExaminadora = Boolean(session?.roleName?.toLowerCase().includes("examinadora"));
  const isAdmin = session?.type === "admin";

  let preEvalScope: any = {};
  let testScheduleScope: any = {};
  let churchScope: any = {};
  let sectorScope: any = {};
  let personInChargeScope: any = {};

  if (isAdmin) {
    preEvalScope = await buildAdministrationWhere("PreEvaluation");
    testScheduleScope = await buildAdministrationWhere("TestSchedule");
    churchScope = await buildAdministrationWhere("Church");
    sectorScope = await buildAdministrationWhere("Sector");
    personInChargeScope = await buildAdministrationWhere("PersonInCharge");
  } else {
    const encarregado = await prisma.personInCharge.findUnique({
      where: { id: session?.id },
      include: {
        managedChurches: true,
        church: {
          include: { sector: true }
        }
      }
    });
    
    if (encarregado) {
      const admId = encarregado.church?.sector?.administrationId;

      if ((isRegional || isExaminadora) && admId) {
        // Encarregado Regional e Examinadoras possuem visão de toda a sua Administração
        churchScope = { sector: { administrationId: admId } };
        sectorScope = { administrationId: admId };
        personInChargeScope = { church: { sector: { administrationId: admId } } };
        testScheduleScope = { church: { sector: { administrationId: admId } } };

        if (isExaminadora) {
          preEvalScope = {
            church: { sector: { administrationId: admId } },
            gender: 'F'
          };
        } else {
          preEvalScope = {
            church: { sector: { administrationId: admId } }
          };
        }
      } else {
        const authorizedChurchIds = [
          encarregado.churchId,
          ...encarregado.managedChurches.map(c => c.id)
        ];
        
        preEvalScope = { churchId: { in: authorizedChurchIds } };
        testScheduleScope = { churchId: { in: authorizedChurchIds } };
        personInChargeScope = { churchId: { in: authorizedChurchIds } };
        churchScope = { id: { in: authorizedChurchIds } };
        sectorScope = { churches: { some: { id: { in: authorizedChurchIds } } } };
      }
    } else {
      // Fallback for invalid session without encarregado record
      preEvalScope = { id: "INVALID" };
      testScheduleScope = { id: "INVALID" };
      churchScope = { id: "INVALID" };
      sectorScope = { id: "INVALID" };
      personInChargeScope = { id: "INVALID" };
    }
  }

  return { preEvalScope, testScheduleScope, churchScope, sectorScope, personInChargeScope, isAdmin, isExaminadora, isRegional };
}

export async function getPortalSectors(session: any) {
  const { sectorScope } = await getPortalScopes(session);
  return await prisma.sector.findMany({
    where: sectorScope,
    orderBy: { createdAt: "desc" }
  });
}

export async function getPortalChurches(session: any) {
  const { churchScope } = await getPortalScopes(session);
  return await prisma.church.findMany({
    where: churchScope,
    include: { sector: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function getPortalPeopleInCharge(session: any) {
  const { personInChargeScope } = await getPortalScopes(session);
  return await prisma.personInCharge.findMany({
    where: personInChargeScope,
    include: {
      church: true,
      roleType: true,
      managedChurches: true,
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function getPortalTestSchedules(session: any) {
  const { testScheduleScope } = await getPortalScopes(session);
  return await prisma.testSchedule.findMany({
    where: testScheduleScope,
    include: {
      church: { include: { sector: true } },
      candidates: true
    },
    orderBy: { testDate: "desc" }
  });
}

export async function getPortalPreEvaluations(session: any) {
  const { preEvalScope } = await getPortalScopes(session);
  return await prisma.preEvaluation.findMany({
    where: preEvalScope,
    include: {
      sector: true, church: true, personInCharge: true, testType: true,
      scheduler: true, testEvaluator: true, instrument: true, currentInstrument: true,
      evaluationResult: { include: { evaluator: true } }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function getPortalTestDetails(id: string, session: any) {
  const { testScheduleScope } = await getPortalScopes(session);
  return await prisma.testSchedule.findFirst({
    where: { 
      id,
      AND: [testScheduleScope]
    },
    include: {
      church: { include: { sector: true } },
      candidates: {
        include: {
          church: true, sector: true, instrument: true, testType: true,
          testEvaluator: true, evaluationResult: true,
        },
        orderBy: { candidateName: "asc" }
      }
    }
  });
}

export async function getPortalEligibleEvaluators(session: any) {
  const { personInChargeScope } = await getPortalScopes(session);
  return await prisma.personInCharge.findMany({
    where: {
      AND: [
        personInChargeScope,
        {
          OR: [
            { roleType: { name: { contains: "examinadora", mode: "insensitive" } } },
            { roleType: { name: { contains: "regional", mode: "insensitive" } } },
            { roleType: { name: { contains: "local", mode: "insensitive" } } },
          ]
        }
      ]
    },
    orderBy: { fullName: "asc" }
  });
}

