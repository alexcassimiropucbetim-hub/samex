"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <div className="no-print flex justify-center mb-8">
      <button 
        onClick={() => window.print()} 
        className="flex items-center gap-2 bg-[#e95931] hover:bg-[#d64e28] text-white px-6 py-2.5 rounded-full text-sm font-bold transition-colors shadow-lg"
      >
        <Printer className="w-5 h-5" />
        Imprimir Agora
      </button>
    </div>
  );
}
