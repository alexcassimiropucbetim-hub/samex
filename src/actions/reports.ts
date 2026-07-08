"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function getReportsData(year: number) {
  const session = await getSession();
  if (!session) {
    throw new Error("Não autorizado");
  }

  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  // 1. Quantidade de Testes no Ano (Sessões de Teste)
  const totalTestSchedules = await prisma.testSchedule.count({
    where: {
      testDate: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // 2. Avaliações concluídas no ano
  const evaluations = await prisma.preEvaluation.findMany({
    where: {
      status: {
        in: ["APROVADO", "REPROVADO"],
      },
      evaluationResult: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    },
    include: {
      testType: true,
      church: true,
      sector: true,
      evaluationResult: true,
    },
  });

  // Agrupamentos em memória
  
  // A. Quantidade de músicos por teste (Tipo de Teste)
  const byTestType: Record<string, number> = {};
  
  // B. Quantidade por igreja
  const byChurch: Record<string, number> = {};

  // C. Quantidade por setor (Geral do ano)
  const bySector: Record<string, number> = {};

  // D. Quantidade por mês (Geral)
  const byMonth: Record<string, number> = {
    "Jan": 0, "Fev": 0, "Mar": 0, "Abr": 0,
    "Mai": 0, "Jun": 0, "Jul": 0, "Ago": 0,
    "Set": 0, "Out": 0, "Nov": 0, "Dez": 0,
  };
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  // E. Quantidade por setor e mês
  const bySectorAndMonth: Record<string, Record<string, number>> = {};

  evaluations.forEach((ev) => {
    // Test Type
    const testTypeName = ev.testType.name;
    byTestType[testTypeName] = (byTestType[testTypeName] || 0) + 1;

    // Church
    const churchName = ev.church.name;
    byChurch[churchName] = (byChurch[churchName] || 0) + 1;

    // Sector
    const sectorName = ev.sector.name;
    bySector[sectorName] = (bySector[sectorName] || 0) + 1;

    // Month
    if (ev.evaluationResult?.createdAt) {
      const d = new Date(ev.evaluationResult.createdAt);
      const monthLabel = monthNames[d.getMonth()];
      byMonth[monthLabel] += 1;

      if (!bySectorAndMonth[sectorName]) {
        bySectorAndMonth[sectorName] = {
          "Jan": 0, "Fev": 0, "Mar": 0, "Abr": 0,
          "Mai": 0, "Jun": 0, "Jul": 0, "Ago": 0,
          "Set": 0, "Out": 0, "Nov": 0, "Dez": 0,
        };
      }
      bySectorAndMonth[sectorName][monthLabel] += 1;
    }
  });

  return {
    totalTestSchedules,
    totalEvaluations: evaluations.length,
    byTestType: Object.entries(byTestType).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    byChurch: Object.entries(byChurch).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    bySector: Object.entries(bySector).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    byMonth: Object.entries(byMonth).map(([name, value]) => ({ name, value })),
    bySectorAndMonth
  };
}
