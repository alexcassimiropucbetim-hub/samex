"use client";

import { useState, useMemo } from "react";
import { FileText, Printer, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

type PendingLetter = {
  id: string;
  candidateName: string;
  instrumentName: string;
  testTypeName: string;
};

export function PendingLettersWidget({ candidates }: { candidates: PendingLetter[] }) {
  const router = useRouter();
  const [printedIds, setPrintedIds] = useState<Set<string>>(new Set());
  const [itemsPerPage, setItemsPerPage] = useState(2);
  const [currentPage, setCurrentPage] = useState(1);


  const handlePrint = (id: string, testTypeName: string) => {
    // Generate the correct PDF link based on test type
    let pdfUrl = "";
    const typeUpper = testTypeName.toUpperCase();
    
    if (typeUpper.includes("TROCA DE INSTRUMENTO")) {
      pdfUrl = `/api/pdf/troca-instrumento?id=${id}`;
    } else if (typeUpper.includes("ORGANISTA") || typeUpper.includes("TECLADO")) {
      pdfUrl = `/api/pdf/organista?id=${id}`;
    } else {
      pdfUrl = `/api/pdf/musico?id=${id}`;
    }

    // Open PDF in new tab
    window.open(pdfUrl, "_blank");

    // Optimistically hide from UI
    setPrintedIds((prev) => new Set(prev).add(id));

    // Refresh router after a short delay so the server state matches
    setTimeout(() => {
      router.refresh();
    }, 2000);
  };

  const visibleCandidates = useMemo(() => {
    return candidates.filter((c) => !printedIds.has(c.id));
  }, [candidates, printedIds]);

  const totalPages = Math.ceil(visibleCandidates.length / itemsPerPage);
  
  // Ensure current page is valid when items change
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  const currentCandidates = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return visibleCandidates.slice(start, start + itemsPerPage);
  }, [visibleCandidates, currentPage, itemsPerPage]);

  if (!candidates || candidates.length === 0 || visibleCandidates.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 border-l-[6px] border-l-orange-500 mb-6 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100 shrink-0">
            <FileText className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0B1B3D]">Cartas de Pedido de Teste Liberadas</h3>
            <p className="text-sm text-slate-500">Candidatos encaminhados que aguardam a impressão da carta.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-semibold text-slate-500">Mostrar:</span>
          <select 
            value={itemsPerPage} 
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-slate-700 font-medium"
          >
            <option value={2}>2</option>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-2">
        {currentCandidates.map((candidate) => (
          <div key={candidate.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors flex-wrap gap-4">
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 uppercase text-sm">{candidate.candidateName}</span>
              <span className="text-xs text-slate-500 uppercase font-medium">{candidate.instrumentName} - {candidate.testTypeName}</span>
            </div>
            <button
              onClick={() => handlePrint(candidate.id, candidate.testTypeName)}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Imprimir Carta
            </button>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
          <span className="text-xs font-semibold text-slate-500">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, visibleCandidates.length)} de {visibleCandidates.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-700 px-2">{currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
