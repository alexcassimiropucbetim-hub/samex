"use client";

import { useState } from "react";
import { X, Calendar } from "lucide-react";
import { schedulePreEvaluationDate } from "@/actions/preEvaluation";

interface Props {
  preEvaluationId: string;
  candidateName: string;
  initialDate?: Date | null;
  initialEvaluatorId?: string | null;
  onClose: () => void;
  isAdmin?: boolean;
  evaluators?: any[];
}

export function SchedulePreEvaluationModal({ preEvaluationId, candidateName, initialDate, initialEvaluatorId, onClose, isAdmin, evaluators = [] }: Props) {
  const [dateStr, setDateStr] = useState(
    initialDate ? new Date(initialDate.getTime() - initialDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""
  );
  const [evaluatorId, setEvaluatorId] = useState(initialEvaluatorId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateStr) return;

    try {
      setIsSubmitting(true);
      const date = new Date(dateStr);
      await schedulePreEvaluationDate(preEvaluationId, date, isAdmin ? evaluatorId : undefined);
      onClose();
    } catch (error) {
      console.error("Erro ao agendar data:", error);
      alert("Ocorreu um erro ao tentar agendar a data. Verifique se você tem permissão.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Agendar Data</h2>
              <p className="text-xs text-slate-500">Candidato(a): {candidateName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 block">
              Data e Hora da Avaliação
            </label>
            <input
              type="datetime-local"
              required
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-slate-700"
            />
          </div>

          {isAdmin && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block">
                Selecione o Avaliador (Regional/Examinadora)
              </label>
              <select
                required
                value={evaluatorId}
                onChange={(e) => setEvaluatorId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-slate-700"
              >
                <option value="">Selecione um avaliador...</option>
                {evaluators.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.fullName} ({ev.roleType?.name || 'Sem cargo'})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !dateStr || (isAdmin && !evaluatorId)}
              className="px-5 py-2.5 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? "Salvando..." : "Confirmar Agendamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
