import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Music } from "lucide-react";
import MyTestsClient from "./MyTestsClient";

export default async function MeusTestesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Busca os testes do avaliador atual que foram confirmados
  const candidates = await prisma.preEvaluation.findMany({
    where: {
      testEvaluatorId: session.id,
      evaluatorConfirmed: true,
      testSchedule: {
        testDate: {
          gte: today, // Testes futuros ou de hoje
        },
        isClosed: false,
      },
    },
    include: {
      church: { select: { name: true } },
      sector: { select: { name: true } },
      instrument: { select: { name: true } },
      testType: { select: { name: true } },
      testSchedule: { select: { testDate: true } },
    },
    orderBy: [
      { finalTestStatus: "asc" }, // Pendentes primeiro
      { candidateName: "asc" },
    ],
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-lg mx-auto pb-20">
      <div className="bg-[#0b1b36] -mx-4 sm:-mx-8 -mt-4 sm:-mt-8 px-6 py-6 mb-8 shadow-md rounded-b-3xl">
        <div className="flex items-center gap-3 text-white">
          <Music className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold">Aplicar Teste</h1>
            <p className="text-sm text-slate-300">Candidatos aguardando sua avaliação</p>
          </div>
        </div>
      </div>

      <MyTestsClient candidates={candidates as any} />
    </div>
  );
}
