import { prisma } from "@/lib/prisma";
import { Users, LayoutList } from "lucide-react";
import { TestQueueClient } from "@/components/TestQueueClient";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function FilaTestePortalPage() {
  const session = await getSession();
  if (!session) redirect("/portal/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const testSchedule = await prisma.testSchedule.findFirst({
    where: {
      testDate: { gte: today },
      isClosed: false
    },
    include: {
      church: true,
      candidates: {
        where: { 
          testEvaluatorId: { not: null },
          finalTestStatus: "PENDENTE"
        },
        include: {
          testEvaluator: {
            select: { fullName: true, roleType: { select: { name: true } } }
          },
          instrument: true,
          testType: true,
        },
        orderBy: { candidateName: 'asc' }
      }
    }
  });

  if (!testSchedule) {
    return (
      <div className="p-8 max-w-[1200px] mx-auto text-center mt-12">
        <div className="inline-flex bg-slate-100 p-6 rounded-full mb-6 text-slate-400">
          <LayoutList className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-slate-700">Nenhum teste programado</h2>
        <p className="text-slate-500 mt-2">Não há fila de teste ativa no momento.</p>
      </div>
    );
  }

  // Agrupar candidatos por avaliador
  const groupsMap = new Map<string, any>();
  let totalCandidates = 0;

  testSchedule.candidates.forEach(candidate => {
    const evalId = candidate.testEvaluatorId!;
    if (!groupsMap.has(evalId)) {
      groupsMap.set(evalId, {
        evaluatorId: evalId,
        evaluatorName: candidate.testEvaluator?.fullName || "Avaliador Desconhecido",
        evaluatorRole: candidate.testEvaluator?.roleType?.name || "Sem Cargo",
        candidates: []
      });
    }
    groupsMap.get(evalId).candidates.push(candidate);
    totalCandidates++;
  });

  const groups = Array.from(groupsMap.values()).sort((a, b) => a.evaluatorName.localeCompare(b.evaluatorName));

  const formattedDate = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(testSchedule.testDate);
  const locationName = testSchedule.church?.name || "Local não informado";

  return (
    <div className="p-4 sm:p-8">
      <TestQueueClient 
        groups={groups}
        testDate={formattedDate}
        testLocation={locationName}
        totalCandidates={totalCandidates}
        totalEvaluators={groups.length}
      />
    </div>
  );
}
