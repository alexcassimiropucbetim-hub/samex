"use client";

import { useState } from "react";
import Link from "next/link";
import { Printer, FileCheck } from "lucide-react";
import { CandidateTestRow } from "./CandidateTestRow";

export function CandidateTableClient({ test, evaluators }: { test: any, evaluators: any }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = () => {
    if (selectedIds.length === test.candidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(test.candidates.map((c: any) => c.id));
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const allSelected = test.candidates.length > 0 && selectedIds.length === test.candidates.length;

  return (
    <div className="glass-card border border-slate-200 rounded-2xl bg-white mb-32">
      
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-200 flex gap-3">
        <Link href={`/imprimir-teste/${test.id}`} target="_blank" className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-200 transition-colors border border-slate-200">
          <Printer className="w-4 h-4" /> Imprimir Lista
        </Link>
        <button 
          disabled={selectedIds.length === 0}
          onClick={() => {
            if (selectedIds.length > 0) {
              const url = `/imprimir-resultado/lote?ids=${selectedIds.join(",")}`;
              window.open(url, "_blank");
            }
          }}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border ${selectedIds.length > 0 ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30' : 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'}`}>
          <FileCheck className="w-4 h-4" /> Imprimir Resultados {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
        </button>
      </div>

      {/* Table Header */}
      <div className="flex items-center p-4 border-b border-slate-200 text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider gap-4">
        <div className="w-12 flex items-center gap-3 shrink-0">
          <div 
            onClick={handleSelectAll}
            className={`w-4 h-4 rounded-md border flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 ${allSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-600 hover:border-slate-400'}`}>
            {allSelected && <div className="w-2 h-2 bg-white rounded-sm"></div>}
          </div>
          <span>#</span>
        </div>
        <div className="flex-[1.5] min-w-0">Candidato</div>
        <div className="flex-[1.5] min-w-0">Congregação</div>
        <div className="flex-1 min-w-0">Setor</div>
        <div className="flex-1 min-w-0">Instrumento</div>
        <div className="w-40 shrink-0">Avaliador</div>
        <div className="w-24 shrink-0 text-center">Tipo</div>
        <div className="w-24 shrink-0 text-right">Ação</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-white/5">
        {test.candidates.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">Nenhum candidato vinculado a este teste.</div>
        ) : (
          test.candidates.map((candidate: any, idx: number) => (
            <CandidateTestRow 
              key={candidate.id} 
              candidate={candidate} 
              evaluators={evaluators}
              index={idx + 1}
              isClosed={test.isClosed}
              isSelected={selectedIds.includes(candidate.id)}
              onSelect={() => handleSelect(candidate.id)}
            />
          ))
        )}
      </div>

      {/* Table Footer */}
      <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center rounded-b-2xl">
        <span className="text-sm font-bold text-slate-900">Total</span>
        <span className="text-sm font-bold text-slate-900">{test.candidates.length}</span>
      </div>
    </div>
  );
}
