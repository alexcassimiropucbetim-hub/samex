"use client";

import { Printer, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function PrintControls() {
  const router = useRouter();

  return (
    <div className="fixed top-4 right-4 flex gap-2 no-print z-50">
      <button
        onClick={() => {
          if (window.history.length > 1) {
            router.back();
          } else {
            window.close();
          }
        }}
        className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm border border-slate-200"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>
      <button
        onClick={() => window.print()}
        className="flex items-center gap-2 bg-[#224465] hover:bg-[#1a334d] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
      >
        <Printer className="w-4 h-4" />
        Imprimir
      </button>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .no-print { display: none !important; }
        }
      `}} />
    </div>
  );
}
