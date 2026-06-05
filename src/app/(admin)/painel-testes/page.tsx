import { prisma } from "@/lib/prisma";
import { FlaskConical, Calendar as CalendarIcon, CheckCircle2, Clock, Users } from "lucide-react";
import { TestPanelTableClient } from "./TestPanelTableClient";

export default async function PainelTestesPage() {
  // Encontrar o próximo TestSchedule apenas do mês atual
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

  const testSchedule = await prisma.testSchedule.findFirst({
    where: {
      testDate: {
        gte: today,
        lte: endOfMonth
      },
      isClosed: false
    },
    orderBy: {
      testDate: "asc",
    },
    include: {
      candidates: {
        include: {
          church: { include: { sector: true } },
          sector: true,
          instrument: true,
          testType: true,
        },
        orderBy: { candidateName: 'asc' }
      },
    },
  });

  // Buscar Avaliadores (PersonInCharge)
  const evaluators = await prisma.personInCharge.findMany({
    orderBy: { fullName: "asc" },
    select: { 
      id: true, 
      fullName: true,
      roleType: { select: { name: true } }
    }
  });

  if (!testSchedule) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h2 className="text-2xl font-bold text-slate-700">Nenhum teste programado para este mês</h2>
        <p className="text-slate-500">Não há testes futuros agendados para o mês atual no sistema.</p>
      </div>
    );
  }

  // Estatísticas
  const total = testSchedule.candidates.length;
  const pendentes = testSchedule.candidates.filter(c => c.finalTestStatus === "PENDENTE").length;
  const concluidos = total - pendentes;
  const progresso = total > 0 ? Math.round((concluidos / total) * 100) : 0;

  // Formatar data
  const dateObj = new Date(testSchedule.testDate);
  const formattedDateExt = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).format(dateObj);
  const formattedDateShort = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(dateObj);

  return (
    <div className="-mt-8 -mx-8">
      {/* Barra superior azul marinho */}
      <div className="bg-[#0b1b36] px-8 py-5 flex items-center justify-between text-white shadow-md relative z-10">
        <div className="flex items-center gap-3">
          <FlaskConical className="w-6 h-6 text-slate-300" />
          <h1 className="text-xl font-bold">Teste do Mês</h1>
        </div>
        <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
          <CalendarIcon className="w-5 h-5" />
          <span>{formattedDateExt}</span>
        </div>
      </div>

      <div className="p-8 max-w-[1400px] mx-auto">
        <div className="text-center mb-10 mt-4">
          <h2 className="text-4xl font-bold text-[#0b1b36]">Teste do Mês</h2>
          <p className="text-slate-500 mt-2 font-medium">Data: {formattedDateShort}</p>
        </div>

        {/* Card de Progresso */}
        <div className="glass-card bg-white p-8 mb-10 flex flex-col md:flex-row items-center gap-10 shadow-xl shadow-slate-200/50">
          
          {/* Círculo de Progresso */}
          <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
            {/* Fundo do anel */}
            <svg className="w-full h-full -rotate-90 absolute inset-0" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e2e8f0" strokeWidth="12" />
              <circle 
                cx="50" cy="50" r="40" 
                fill="transparent" 
                stroke="#0ea5e9" 
                strokeWidth="12" 
                strokeLinecap="round"
                strokeDasharray={`${(progresso / 100) * 251.2} 251.2`} 
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="text-center z-10 flex flex-col items-center">
              <span className="text-3xl font-black text-[#0b1b36]">{progresso}%</span>
              <span className="text-xs font-semibold text-slate-500">Concluído</span>
            </div>
          </div>

          <div className="flex-1 w-full">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-lg font-bold text-[#0b1b36]">Progresso do Teste</h3>
              <div className="text-right">
                <span className="text-xl font-black text-[#0ea5e9]">{concluidos}</span>
                <span className="text-lg font-bold text-slate-400"> / {total}</span>
                <p className="text-xs font-medium text-slate-500">candidatos avaliados</p>
              </div>
            </div>
            
            {/* Barra Linear */}
            <div className="w-full bg-slate-200 rounded-full h-3 mb-8 overflow-hidden">
              <div 
                className="bg-[#0ea5e9] h-full rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${progresso}%` }}
              ></div>
            </div>

            {/* Counters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-slate-200 rounded-xl p-4 flex items-center gap-4 bg-slate-50/50">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900 leading-none mb-1">{concluidos}</p>
                  <p className="text-xs font-medium text-slate-500">Concluídos</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 flex items-center gap-4 bg-slate-50/50">
                <div className="w-10 h-10 rounded-full bg-yellow-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-yellow-500/20">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900 leading-none mb-1">{pendentes}</p>
                  <p className="text-xs font-medium text-slate-500">Pendentes</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 flex items-center gap-4 bg-slate-50/50">
                <div className="w-10 h-10 rounded-full bg-slate-400 text-white flex items-center justify-center shrink-0 shadow-md shadow-slate-400/20">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900 leading-none mb-1">{total}</p>
                  <p className="text-xs font-medium text-slate-500">Total de Candidatos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Candidatos */}
        <div className="mt-4">
          <TestPanelTableClient 
            candidates={testSchedule.candidates as any} 
            evaluators={evaluators} 
            testScheduleId={testSchedule.id}
          />
        </div>

      </div>
    </div>
  );
}
