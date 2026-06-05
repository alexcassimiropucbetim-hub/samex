"use client";

import { useState } from "react";
import { UserPlus, X } from "lucide-react";
import { allocateToTest } from "@/actions/allocation";

export function AllocationButton({ preEvaluationId, testSchedules }: { preEvaluationId: string, testSchedules: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState("");
  const [masterKey, setMasterKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAllocate = async () => {
    if (!selectedTestId || !masterKey) {
      setError("Preencha todos os campos.");
      return;
    }
    
    setError("");
    setIsLoading(true);
    try {
      await allocateToTest(preEvaluationId, selectedTestId, masterKey);
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || "Erro desconhecido ao alocar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-slate-500 hover:text-blue-400 p-2 rounded-lg hover:bg-blue-400/10 transition-colors"
        title="Alocar Manualmente no Teste"
      >
        <UserPlus className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-900"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
              <UserPlus className="text-blue-400" /> Alocar Candidato
            </h2>
            
            <p className="text-sm text-slate-500 mb-6">
              Selecione o teste desejado e insira a chave de alocação correspondente.
            </p>

            {error && (
              <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-lg mb-4 border border-red-500/20">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Selecione o Teste em Aberto</label>
                <select
                  value={selectedTestId}
                  onChange={(e) => setSelectedTestId(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="" className="bg-white">Selecione...</option>
                  {testSchedules.map((test) => {
                    const d = new Date(test.testDate);
                    return (
                      <option key={test.id} value={test.id} className="bg-white">
                        {d.toLocaleDateString('pt-BR')} às {d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {test.church?.name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Chave do Teste</label>
                <input
                  type="password"
                  value={masterKey}
                  onChange={(e) => setMasterKey(e.target.value)}
                  placeholder="Insira a chave do teste..."
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="px-4 py-2 text-slate-500 hover:text-slate-900 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAllocate}
                  disabled={isLoading || !selectedTestId || !masterKey}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Alocando..." : "Alocar no Teste"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
