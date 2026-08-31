"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Play, MapPin, Music } from "lucide-react";
import { startTest, submitTestResult } from "@/actions/testPanel";

type Candidate = {
  id: string;
  candidateName: string;
  church: { name: string };
  sector: { name: string };
  instrument: { name: string };
  testType: { name: string };
  testStartTime: Date | null;
  finalTestStatus: string | null;
};

export default function MyTestsClient({ candidates }: { candidates: Candidate[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStartTest = async (candidateId: string) => {
    setLoadingId(candidateId);
    await startTest(candidateId);
    setLoadingId(null);
  };

  const handleResult = async (candidateId: string, status: string) => {
    setLoadingId(candidateId);
    await submitTestResult(candidateId, status);
    setLoadingId(null);
  };

  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <CheckCircle className="w-16 h-16 text-emerald-400 mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-slate-700">Nenhum teste pendente</h2>
        <p className="text-slate-500 mt-2">Você não possui candidatos alocados ou todos já foram avaliados.</p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-8 space-y-4">
      {candidates.map((cand) => (
        <div key={cand.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-lg text-slate-800 uppercase leading-tight mb-2">
              {cand.candidateName}
            </h3>
            
            <div className="flex flex-col gap-1.5 mt-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Music className="w-4 h-4 text-orange-500 shrink-0" />
                <span className="uppercase font-medium">{cand.instrument.name}</span>
                <span className="text-slate-300">•</span>
                <span className="uppercase text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100">{cand.testType.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                <span className="uppercase">{cand.church.name} ({cand.sector.name})</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50/50">
            {cand.finalTestStatus === "APROVADO" || cand.finalTestStatus === "REPROVADO" ? (
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200">
                {cand.finalTestStatus === "APROVADO" ? (
                  <>
                    <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
                    <span className="font-bold text-emerald-600 uppercase">Aprovado</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-8 h-8 text-red-500 mb-2" />
                    <span className="font-bold text-red-600 uppercase">Reprovado</span>
                  </>
                )}
              </div>
            ) : !cand.testStartTime ? (
              <button
                onClick={() => handleStartTest(cand.id)}
                disabled={loadingId === cand.id}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Play className="w-5 h-5 fill-current" />
                {loadingId === cand.id ? "Iniciando..." : "INICIAR TESTE"}
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => handleResult(cand.id, "APROVADO")}
                  disabled={loadingId === cand.id}
                  className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-6 h-6" />
                  APROVAR
                </button>
                <button
                  onClick={() => handleResult(cand.id, "REPROVADO")}
                  disabled={loadingId === cand.id}
                  className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-6 h-6" />
                  REPROVAR
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
