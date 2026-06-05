"use client";

import { useState } from "react";
import { updateCandidateTestRecord } from "@/actions/testDetails";
import { MoreVertical, CheckCircle2, XCircle, Eye, Printer, FileText, BookOpen } from "lucide-react";
import Link from "next/link";

type Evaluator = {
  id: string;
  fullName: string;
  gender: string;
  roleType?: { name: string } | null;
  allowedTestTypes?: { id: string }[] | null;
};

type CandidateTestRowProps = {
  candidate: any;
  evaluators: Evaluator[];
  index: number;
  isClosed: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
};

export function CandidateTestRow({ candidate, evaluators, index, isClosed, isSelected, onSelect }: CandidateTestRowProps) {
  const [evaluatorId, setEvaluatorId] = useState(candidate.testEvaluatorId || "");
  const [status, setStatus] = useState(candidate.finalTestStatus || "PENDENTE");
  const [isSaving, setIsSaving] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Filtrar avaliadores disponíveis para este candidato
  const availableEvaluators = evaluators.filter(ev => {
    // 1. O encarregado tem permissão para este tipo de teste?
    const canDoTestType = ev.allowedTestTypes?.some(t => t.id === candidate.testTypeId);
    if (!canDoTestType) return false;

    // 2. Regra de gênero: mulher avalia mulher, homem avalia homem
    if (ev.gender !== candidate.gender) return false;

    return true;
  });

  const handleEvaluatorChange = async (newId: string) => {
    if (isClosed) return;
    setEvaluatorId(newId);
    setIsSaving(true);
    await updateCandidateTestRecord(candidate.id, newId || null, status);
    setIsSaving(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (isClosed) return;
    if (!evaluatorId) {
      alert("Por favor, selecione um avaliador antes de registrar o resultado.");
      return;
    }
    setStatus(newStatus);
    setShowMenu(false);
    setIsSaving(true);
    await updateCandidateTestRecord(candidate.id, evaluatorId, newStatus);
    setIsSaving(false);
  };

  return (
    <div className={`relative ${showMenu ? 'z-50' : 'z-10'} flex items-center p-4 border-b border-slate-200 hover:bg-white transition-colors gap-4 ${isSaving ? 'opacity-50' : ''}`}>
      <div className="w-12 flex items-center gap-3 shrink-0">
        <div 
          onClick={onSelect}
          className={`w-4 h-4 rounded-md border flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-600 hover:border-slate-400'}`}>
          {isSelected && <div className="w-2 h-2 bg-white rounded-sm"></div>}
        </div>
        <span className="text-slate-500 text-sm">{index}</span>
      </div>
      
      <div className="flex-[1.5] min-w-0">
        <span className="text-sm font-semibold text-slate-900 uppercase truncate block">{candidate.candidateName}</span>
      </div>
      
      <div className="flex-[1.5] min-w-0">
        <span className="text-sm text-slate-600 uppercase truncate block">{candidate.church.name}</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <span className="text-sm text-slate-600 uppercase truncate block">{candidate.sector.name}</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <span className="text-sm text-slate-600 uppercase truncate block">{candidate.instrument.name}</span>
      </div>
      
      <div className="w-40 shrink-0">
        <select
          value={evaluatorId}
          onChange={(e) => handleEvaluatorChange(e.target.value)}
          disabled={isClosed}
          className="w-full bg-white/50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed uppercase"
        >
          <option value="">Selecione...</option>
          {availableEvaluators.map(ev => (
            <option key={ev.id} value={ev.id}>{ev.fullName}</option>
          ))}
        </select>
      </div>
      
      <div className="w-24 shrink-0 text-center">
        <span className="text-sm text-slate-600 truncate block">{candidate.testType.name.split(" ")[0]}</span>
      </div>
      
      <div className="w-24 shrink-0 flex items-center justify-end gap-2 relative">
        {status === "APROVADO" && (
          <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Aprov.</span>
        )}
        {status === "REPROVADO" && (
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Reprov.</span>
        )}
        {status === "AUSENTE" && (
          <span className="bg-slate-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Ausente</span>
        )}
        
        <button 
          onClick={() => setShowMenu(!showMenu)}
          disabled={isClosed}
          className="text-slate-500 hover:text-slate-900 p-1 disabled:opacity-50"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {showMenu && !isClosed && (
          <div className="absolute top-8 right-0 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden w-56 flex flex-col py-1">
            <button onClick={() => handleStatusChange("APROVADO")} className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 flex items-center gap-3 transition-colors">
              <CheckCircle2 className="w-4 h-4 text-orange-400" /> Aprovar
            </button>
            <button onClick={() => handleStatusChange("REPROVADO")} className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 flex items-center gap-3 transition-colors">
              <XCircle className="w-4 h-4 text-red-500" /> Reprovar
            </button>
            
            <div className="h-px bg-slate-100 my-1 w-full" />
            
            {candidate.evaluationResult && (
              <a href={`/portal/pre-avaliacao/resultado?id=${candidate.id}`} target="_blank" rel="noopener noreferrer" onClick={() => setShowMenu(false)} className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 flex items-center gap-3 transition-colors">
                <BookOpen className="w-4 h-4 text-blue-400" /> Ver Estudo Dirigido
              </a>
            )}
            <Link href={`/imprimir-resultado/${candidate.id}`} target="_blank" onClick={() => setShowMenu(false)} className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 flex items-center gap-3 transition-colors">
              <FileText className="w-4 h-4 text-slate-500" /> Imprimir Resultado
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
