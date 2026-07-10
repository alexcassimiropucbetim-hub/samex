"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, User } from "lucide-react";

type PreEvaluation = {
  id: string;
  candidateName: string;
  status: string | null;
  testType?: { name: string };
  instrument?: { name: string };
  church?: { name: string };
  sector?: { name: string };
  createdAt: Date | string;
  scheduledDate?: Date | string | null;
};

export function LatestRegistrations({ registrations }: { registrations: PreEvaluation[] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Sorting descending by date to guarantee latest first
  const sortedRegistrations = [...registrations].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const displayCount = isExpanded ? sortedRegistrations.length : 5;
  const visibleRegistrations = sortedRegistrations.slice(0, displayCount);

  if (registrations.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
      <div 
        className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            Últimas Inscrições Feitas
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Candidatos cadastrados recentemente e seu status de pré-avaliação.
          </p>
        </div>
        <button className="p-1.5 bg-white rounded-full shadow-sm border border-slate-200 text-slate-500">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="p-3 pl-5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Candidato & Teste</th>
              <th className="p-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Congregação & Setor</th>
              <th className="p-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Datas</th>
              <th className="p-3 pr-5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleRegistrations.map((reg) => (
              <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3 pl-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-blue-100 text-blue-600">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <h4 className="font-bold text-slate-800 uppercase text-xs">{reg.candidateName}</h4>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase mt-0.5 flex items-center gap-1">
                        {reg.testType?.name || 'Teste'} {reg.instrument?.name ? `• ${reg.instrument.name}` : ''}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-[10px] font-medium uppercase">
                  <span className="block font-bold text-slate-700">{reg.church?.name}</span>
                  <span className="block text-slate-500 mt-0.5">{reg.sector?.name}</span>
                </td>
                <td className="p-3 text-[10px] uppercase font-bold text-slate-500">
                  <span className="block text-slate-400">Inscrito: {new Date(reg.createdAt).toLocaleDateString('pt-BR')}</span>
                  {reg.scheduledDate ? (
                    <span className="block text-[#e95931] mt-0.5">Agendado: {new Date(reg.scheduledDate).toLocaleDateString('pt-BR')}</span>
                  ) : (
                    <span className="block text-slate-400 italic mt-0.5">Não agendado</span>
                  )}
                </td>
                <td className="p-3 pr-5 text-right">
                  <span className={`inline-flex px-2.5 py-1 rounded-md border tracking-wider text-[9px] font-bold uppercase whitespace-nowrap ${
                    (!reg.status || reg.status === 'PENDENTE') 
                      ? 'bg-amber-50 text-amber-600 border-amber-200'
                      : reg.status === 'APROVADO'
                        ? 'bg-green-50 text-green-600 border-green-200'
                        : 'bg-red-50 text-red-600 border-red-200'
                  }`}>
                    {!reg.status ? 'PENDENTE' : reg.status === 'APROVADO' ? 'ENCAMINHADO' : reg.status === 'REPROVADO' ? 'ESTUDAR MAIS' : reg.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {registrations.length > 5 && (
          <div className="p-4 border-t border-slate-100">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full py-2 text-xs font-bold text-[#e95931] hover:bg-[#e95931]/10 rounded-lg transition-colors border border-transparent hover:border-[#e95931]/20"
            >
              {isExpanded ? 'Mostrar menos' : `Mostrar todas as ${registrations.length} inscrições`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
