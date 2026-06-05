"use client";

import { useState, useRef, useEffect } from "react";
import { Printer, MoreVertical, CheckCircle, XCircle, BookOpen, FileText } from "lucide-react";
import { assignEvaluator, updateCandidateStatus } from "@/actions/testPanel";

type Candidate = {
  id: string;
  candidateName: string;
  church: { name: string; sector?: { name: string } };
  sector: { name: string };
  instrument: { name: string };
  testType: { name: string };
  status: string;
  finalTestStatus: string | null;
  gender: string;
  testEvaluatorId: string | null;
};

type Evaluator = {
  id: string;
  fullName: string;
  roleType?: { name: string } | null;
};

export function TestPanelTableClient({
  candidates,
  evaluators,
  testScheduleId,
}: {
  candidates: Candidate[];
  evaluators: Evaluator[];
  testScheduleId: string;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(candidates.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleStatusChange = async (candidateId: string, status: string) => {
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate?.testEvaluatorId) {
      alert("Por favor, selecione um avaliador antes de registrar o resultado.");
      return;
    }
    
    setOpenMenuId(null);
    await updateCandidateStatus(candidateId, status);
  };

  const handleEvaluatorChange = async (candidateId: string, evaluatorId: string) => {
    await assignEvaluator(candidateId, evaluatorId === "" ? null : evaluatorId);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Action Buttons */}
      <div className="p-4 flex gap-3 border-b border-slate-100">
        <button 
          onClick={() => window.open(`/imprimir-teste/${testScheduleId}`, '_blank')}
          className="flex items-center gap-2 px-4 py-2 border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 font-medium text-sm transition-colors"
        >
          <Printer className="w-4 h-4" />
          Imprimir Lista
        </button>
        <button 
          onClick={() => {
            if (selectedIds.length === 0) return alert("Selecione pelo menos um candidato.");
            window.open(`/imprimir-resultado/lote?ids=${selectedIds.join(",")}`, '_blank');
          }}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors"
        >
          <Printer className="w-4 h-4 text-orange-500" />
          Imprimir Resultados
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto w-full min-h-[300px]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              <th className="px-6 py-4 w-10">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={selectedIds.length === candidates.length && candidates.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-4 py-4 font-semibold w-10">#</th>
              <th className="px-3 py-4 font-semibold">CANDIDATO</th>
              <th className="px-3 py-4 font-semibold">CONGREGAÇÃO</th>
              <th className="px-3 py-4 font-semibold">SETOR</th>
              <th className="px-3 py-4 font-semibold">INSTRUMENTO</th>
              <th className="px-3 py-4 font-semibold">AVALIADOR</th>
              <th className="px-3 py-4 font-semibold text-center">TIPO</th>
              <th className="px-4 py-4 font-semibold text-right whitespace-nowrap">AÇÃO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {candidates.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-slate-500">
                  Nenhum candidato alocado neste teste.
                </td>
              </tr>
            ) : (
              candidates.map((cand, index) => (
                <tr key={cand.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedIds.includes(cand.id)}
                      onChange={() => handleSelectOne(cand.id)}
                    />
                  </td>
                  <td className="px-4 py-4 text-slate-500">{index + 1}</td>
                  <td className="px-3 py-4 font-bold text-slate-800">
                    <div className="truncate max-w-[140px]" title={cand.candidateName.toUpperCase()}>
                      {cand.candidateName.toUpperCase()}
                    </div>
                  </td>
                  <td className="px-3 py-4 text-slate-500 font-medium">
                    <div className="truncate max-w-[140px]" title={cand.church.name.toUpperCase()}>
                      {cand.church.name.toUpperCase()}
                    </div>
                  </td>
                  <td className="px-3 py-4 text-slate-500 font-medium">
                    <div className="truncate max-w-[120px]" title={cand.sector?.name?.toUpperCase() || ""}>
                      {cand.sector?.name?.toUpperCase() || ""}
                    </div>
                  </td>
                  <td className="px-3 py-4 text-slate-500 font-medium">
                    <div className="truncate max-w-[120px]" title={cand.instrument.name.toUpperCase()}>
                      {cand.instrument.name.toUpperCase()}
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <select
                      className="bg-white border border-slate-200 text-slate-500 text-xs rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-36 lg:w-44 truncate"
                      value={cand.testEvaluatorId || ""}
                      onChange={(e) => handleEvaluatorChange(cand.id, e.target.value)}
                    >
                      <option value="">SELECIONE...</option>
                      {evaluators.filter(ev => {
                        const role = ev.roleType?.name?.toUpperCase() || "";
                        const testName = cand.testType.name.toUpperCase();
                        if (cand.gender === "F") {
                          return role.includes("EXAMINADORA");
                        } else {
                          if (testName.includes("REUNIÃO") && !testName.includes("HOMENS")) {
                            return role.includes("REGIONAL") || role.includes("LOCAL");
                          } else {
                            return role.includes("REGIONAL");
                          }
                        }
                      }).map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.fullName.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-4 text-slate-500 font-medium text-center whitespace-nowrap">
                    {cand.testType.name.toUpperCase()}
                  </td>
                  <td className="px-4 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-3">
                      {cand.finalTestStatus === "PENDENTE" || !cand.finalTestStatus ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 uppercase tracking-widest">
                          PEND.
                        </span>
                      ) : cand.finalTestStatus === "APROVADO" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white uppercase tracking-widest">
                          APROV.
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white uppercase tracking-widest">
                          REPROV.
                        </span>
                      )}
                      <div className="relative" ref={openMenuId === cand.id ? menuRef : null}>
                        <button 
                          onClick={() => setOpenMenuId(openMenuId === cand.id ? null : cand.id)}
                          className="text-orange-400 hover:text-orange-600 transition-colors p-1"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {openMenuId === cand.id && (
                          <div className="absolute right-0 mt-1 w-56 bg-white border border-slate-100 rounded-lg shadow-xl z-50 overflow-hidden py-1">
                            <button 
                              onClick={() => handleStatusChange(cand.id, "APROVADO")}
                              className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4 text-orange-500" />
                              Aprovar
                            </button>
                            <button 
                              onClick={() => handleStatusChange(cand.id, "REPROVADO")}
                              className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors border-b border-slate-100"
                            >
                              <XCircle className="w-4 h-4 text-orange-500" />
                              Reprovar
                            </button>
                            <button 
                              onClick={() => {
                                setOpenMenuId(null);
                                window.open(`/portal/pre-avaliacao/resultado?id=${cand.id}`, '_blank');
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors mt-1"
                            >
                              <BookOpen className="w-4 h-4 text-orange-500" />
                              Ver Estudo Dirigido
                            </button>
                            <button 
                              onClick={() => {
                                setOpenMenuId(null);
                                window.open(`/imprimir-resultado/${cand.id}`, '_blank');
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                            >
                              <FileText className="w-4 h-4 text-orange-500" />
                              Imprimir Resultado
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/30">
        <span className="font-bold text-sm text-slate-800">Total</span>
        <span className="font-black text-sm text-slate-900">{candidates.length}</span>
      </div>
    </div>
  );
}
