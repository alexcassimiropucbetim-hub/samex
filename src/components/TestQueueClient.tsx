"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, User, Info, CalendarDays, MapPin, ChevronUp, ChevronDown } from "lucide-react";
import clsx from "clsx";

type Candidate = {
  id: string;
  candidateName: string;
  instrument: { name: string };
  testType: { name: string };
};

type EvaluatorGroup = {
  evaluatorId: string;
  evaluatorName: string;
  evaluatorRole: string;
  candidates: Candidate[];
};

type TestQueueClientProps = {
  testDate: string;
  testLocation: string;
  totalCandidates: number;
  totalEvaluators: number;
  groups: EvaluatorGroup[];
};

const THEMES = [
  { border: "border-l-blue-600", bg: "bg-blue-600", badgeBg: "bg-blue-50", badgeText: "text-blue-600" },
  { border: "border-l-rose-500", bg: "bg-rose-500", badgeBg: "bg-rose-50", badgeText: "text-rose-600" },
  { border: "border-l-emerald-500", bg: "bg-emerald-500", badgeBg: "bg-emerald-50", badgeText: "text-emerald-600" },
  { border: "border-l-orange-500", bg: "bg-orange-500", badgeBg: "bg-orange-50", badgeText: "text-orange-600" },
  { border: "border-l-purple-600", bg: "bg-purple-600", badgeBg: "bg-purple-50", badgeText: "text-purple-600" },
];

export function TestQueueClient({ testDate, testLocation, totalCandidates, totalEvaluators, groups }: TestQueueClientProps) {
  const router = useRouter();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 15000);
    return () => clearInterval(interval);
  }, [router]);

  const toggleGroup = (id: string) => {
    setCollapsedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 bg-slate-50 min-h-screen p-4 sm:p-8 -m-4 sm:-m-8">
      
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="mt-1">
            <Users className="w-10 h-10 text-[#0b1b36]" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#0b1b36]">Fila para Teste</h1>
            <p className="text-sm font-medium text-slate-500">Candidatos alocados para os avaliadores realizarem os testes</p>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 px-6 py-4 min-w-[200px]">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data do Teste</p>
              <p className="text-sm font-black text-[#0b1b36]">{testDate}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 px-6 py-4 min-w-[200px]">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Local</p>
              <p className="text-sm font-black text-[#0b1b36] uppercase">{testLocation}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center gap-6 px-6 py-5">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-[#0b1b36] leading-none">{totalCandidates}</p>
            <p className="text-sm font-medium text-slate-500 mt-1">Candidatos na fila</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center gap-6 px-6 py-5">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-[#0b1b36] leading-none">{totalEvaluators}</p>
            <p className="text-sm font-medium text-slate-500 mt-1">Avaliadores ativos</p>
          </div>
        </div>

        <div className="md:col-span-1 xl:col-span-2 bg-[#eff6ff] rounded-2xl border border-blue-100 flex items-start sm:items-center gap-4 px-6 py-5">
          <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center shrink-0 mt-1 sm:mt-0">
            <Info className="w-4 h-4 text-blue-700" />
          </div>
          <p className="text-sm font-medium text-blue-800 leading-snug">
            A fila é dinâmica e atualizada automaticamente conforme os resultados são lançados.
          </p>
        </div>
      </div>

      {/* Evaluator Lists */}
      <div className="space-y-4 pt-2">
        {groups.map((group, index) => {
          const theme = THEMES[index % THEMES.length];
          const isCollapsed = collapsedGroups[group.evaluatorId];

          return (
            <div key={group.evaluatorId} className={clsx("bg-white rounded-[20px] shadow-sm border border-slate-200 overflow-hidden border-l-[8px]", theme.border)}>
              {/* Card Header */}
              <button 
                onClick={() => toggleGroup(group.evaluatorId)}
                className="w-full bg-white px-6 py-5 flex items-center justify-between focus:outline-none"
              >
                <div className="flex items-center gap-4">
                  <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm", theme.bg)}>
                    <User className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-[17px] font-black text-[#0b1b36] uppercase leading-tight">{group.evaluatorName}</h3>
                    <p className="text-sm font-semibold text-[#0b1b36]/70">{group.evaluatorRole}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={clsx("px-4 py-1.5 rounded-full text-sm font-bold", theme.badgeBg, theme.badgeText)}>
                    {group.candidates.length} candidato{group.candidates.length !== 1 && 's'}
                  </span>
                  <div className="w-8 h-8 flex items-center justify-center text-blue-600 bg-blue-50 rounded-full">
                    {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                  </div>
                </div>
              </button>

              {/* Table */}
              {!isCollapsed && (
                <div className="px-6 pb-6 pt-2 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#f1f5f9] rounded-xl overflow-hidden">
                        <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 first:rounded-l-xl">#</th>
                        <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">CANDIDATO(A)</th>
                        <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">INSTRUMENTO</th>
                        <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 last:rounded-r-xl">TIPO DE TESTE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.candidates.map((candidate, idx) => (
                        <tr key={candidate.id} className={clsx("border-b border-slate-100 last:border-0", idx % 2 === 0 ? "bg-white" : "bg-slate-50/50")}>
                          <td className="px-6 py-3.5 text-[15px] font-bold text-[#0b1b36]">{idx + 1}</td>
                          <td className="px-6 py-3.5 text-[15px] font-bold text-[#0b1b36] uppercase">{candidate.candidateName}</td>
                          <td className="px-6 py-3.5 text-[15px] font-medium text-slate-600 uppercase">{candidate.instrument.name}</td>
                          <td className="px-6 py-3.5 text-[15px] font-medium text-slate-600 uppercase">{candidate.testType.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
        
        {groups.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center flex flex-col items-center">
            <Users className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-700">Fila Vazia</h3>
            <p className="text-slate-500 mt-2">Nenhum candidato foi apontado para um avaliador no momento.</p>
          </div>
        )}
      </div>
    </div>
  );
}
