"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Printer, ArrowLeft, Layout, Columns2, Square } from "lucide-react";
import { ResultadoModelo2Card, CandidateForModelo2 } from "./ResultadoModelo2Card";

type Props = {
  candidates: (CandidateForModelo2 & { resolvedEvaluatorName?: string })[];
  isBatch?: boolean;
};

export function Modelo2PrintClient({ candidates, isBatch = false }: Props) {
  const router = useRouter();

  // State: 'landscape' or 'portrait'
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");
  // State: 2 per page or 1 per page
  const [perPage, setPerPage] = useState<1 | 2>(2);

  // Prepare pages
  // If single candidate and perPage === 2, we show 2 copies on the sheet.
  // If batch and perPage === 2, we group candidates in pairs of 2.
  let pages: (CandidateForModelo2 & { resolvedEvaluatorName?: string })[][] = [];

  if (!isBatch && candidates.length === 1) {
    if (perPage === 2) {
      pages = [[candidates[0], candidates[0]]];
    } else {
      pages = [[candidates[0]]];
    }
  } else {
    if (perPage === 2) {
      for (let i = 0; i < candidates.length; i += 2) {
        const pair = [candidates[i]];
        if (candidates[i + 1]) {
          pair.push(candidates[i + 1]);
        } else {
          // Odd candidate on last page: duplicate so paper isn't half blank
          pair.push(candidates[i]);
        }
        pages.push(pair);
      }
    } else {
      pages = candidates.map((c) => [c]);
    }
  }

  const handlePrint = () => {
    window.print();
  };

  const layoutMode =
    orientation === "landscape"
      ? perPage === 2
        ? "landscape-2"
        : "landscape-1"
      : perPage === 2
      ? "portrait-2"
      : "portrait-1";

  return (
    <div className="min-h-screen bg-slate-200/80 print:bg-white text-slate-900">
      {/* Dynamic Print CSS */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @page {
          size: A4 ${orientation};
          margin: 0.5cm 0.6cm;
        }
        @media print {
          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .sheet-container {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: none !important;
          }
        }
      `
        }}
      />

      {/* Interactive Control Header */}
      <header className="sticky top-0 z-50 bg-[#0d2847] text-white px-4 py-3 shadow-lg no-print">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Voltar + Info */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  router.back();
                } else {
                  window.close();
                }
              }}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
            <div className="hidden sm:block">
              <span className="text-sm font-black tracking-wide uppercase">Impressão Modelo 2</span>
              <span className="text-xs text-white/70 block">
                {candidates.length} resultado{candidates.length > 1 ? "s" : ""} •{" "}
                {pages.length} folha{pages.length > 1 ? "s" : ""} A4
              </span>
            </div>
          </div>

          {/* Center: Controls for Orientation & Per Page */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            {/* Orientação */}
            <div className="flex items-center bg-black/30 p-1 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => setOrientation("landscape")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  orientation === "landscape"
                    ? "bg-[#ff6b35] text-white shadow-md"
                    : "text-white/80 hover:text-white hover:bg-white/5"
                }`}
              >
                <Layout className="w-3.5 h-3.5 rotate-90" />
                <span>Paisagem</span>
              </button>
              <button
                onClick={() => setOrientation("portrait")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  orientation === "portrait"
                    ? "bg-[#ff6b35] text-white shadow-md"
                    : "text-white/80 hover:text-white hover:bg-white/5"
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Retrato</span>
              </button>
            </div>

            {/* Distribuição: 2 por folha vs 1 por folha */}
            <div className="flex items-center bg-black/30 p-1 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => setPerPage(2)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  perPage === 2
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-white/80 hover:text-white hover:bg-white/5"
                }`}
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span>2 por Folha</span>
              </button>
              <button
                onClick={() => setPerPage(1)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  perPage === 1
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-white/80 hover:text-white hover:bg-white/5"
                }`}
              >
                <Square className="w-3.5 h-3.5" />
                <span>1 por Folha</span>
              </button>
            </div>
          </div>

          {/* Right: Imprimir */}
          <div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-5 py-2 rounded-xl text-sm font-black shadow-md hover:shadow-lg transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Agora</span>
            </button>
          </div>
        </div>
      </header>

      {/* Pages Container */}
      <main className="p-4 sm:p-8 print:p-0 flex flex-col items-center gap-8 print:gap-0">
        {pages.map((pageCandidates, pageIndex) => {
          const isLastPage = pageIndex === pages.length - 1;

          return (
            <div
              key={pageIndex}
              className={`sheet-container bg-white rounded-xl shadow-2xl p-6 print:p-0 print:rounded-none print:shadow-none box-border flex flex-col justify-between ${
                orientation === "landscape"
                  ? "w-full max-w-[285mm] h-[198mm]"
                  : "w-full max-w-[198mm] h-[285mm]"
              }`}
              style={{
                pageBreakAfter: isLastPage ? "auto" : "always",
                pageBreakInside: "avoid"
              }}
            >
              {/* If Landscape & 2 per page: 2 columns side by side */}
              {orientation === "landscape" && perPage === 2 && (
                <div className="grid grid-cols-2 gap-6 w-full h-full items-stretch">
                  <div className="w-full h-full">
                    <ResultadoModelo2Card
                      candidate={pageCandidates[0]}
                      resolvedEvaluatorName={pageCandidates[0].resolvedEvaluatorName}
                      layoutMode="landscape-2"
                    />
                  </div>
                  <div className="w-full h-full">
                    <ResultadoModelo2Card
                      candidate={pageCandidates[1] || pageCandidates[0]}
                      resolvedEvaluatorName={
                        pageCandidates[1]?.resolvedEvaluatorName || pageCandidates[0].resolvedEvaluatorName
                      }
                      layoutMode="landscape-2"
                    />
                  </div>
                </div>
              )}

              {/* If Portrait & 2 per page: 2 rows stacked top and bottom */}
              {orientation === "portrait" && perPage === 2 && (
                <div className="flex flex-col justify-between w-full h-full gap-5">
                  <div className="w-full h-[48%]">
                    <ResultadoModelo2Card
                      candidate={pageCandidates[0]}
                      resolvedEvaluatorName={pageCandidates[0].resolvedEvaluatorName}
                      layoutMode="portrait-2"
                    />
                  </div>
                  <div className="w-full h-[48%]">
                    <ResultadoModelo2Card
                      candidate={pageCandidates[1] || pageCandidates[0]}
                      resolvedEvaluatorName={
                        pageCandidates[1]?.resolvedEvaluatorName || pageCandidates[0].resolvedEvaluatorName
                      }
                      layoutMode="portrait-2"
                    />
                  </div>
                </div>
              )}

              {/* If 1 per page (fills the sheet) */}
              {perPage === 1 && (
                <div className="w-full h-full">
                  <ResultadoModelo2Card
                    candidate={pageCandidates[0]}
                    resolvedEvaluatorName={pageCandidates[0].resolvedEvaluatorName}
                    layoutMode={orientation === "landscape" ? "landscape-1" : "portrait-1"}
                  />
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}
