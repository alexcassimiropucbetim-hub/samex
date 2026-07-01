"use client";

import { useState } from "react";
import { saveEvaluation } from "@/actions/evaluation";
import { useRouter } from "next/navigation";
import { ClipboardCheck, ArrowRight, XCircle, CheckCircle2 } from "lucide-react";
import type { TheoryMethod, PracticalMethod } from "@prisma/client";

type QuestionId = 'q1Leitura' | 'q2Pulso' | 'q3Afinacao' | 'q4Escalas' | 'q5Postura' | 'q6Timbre' | 'q7Voz' | 'q8Dinamica';

const questions: { id: QuestionId, label: string }[] = [
  { id: 'q1Leitura', label: '1. Leitura métrica e rítmica' },
  { id: 'q2Pulso', label: '2. Pulso e ritmo no movimento de condução para solfejo e execução instrumental' },
  { id: 'q3Afinacao', label: '3. Afinação na execução instrumental' },
  { id: 'q4Escalas', label: '4. Execução de escalas maiores e cromática de acordo a tonalidade dos hinos' },
  { id: 'q5Postura', label: '5. Postura e ergonomia para tocar' },
  { id: 'q6Timbre', label: '6. Timbre e qualidade sonora' },
  { id: 'q7Voz', label: '7. Voz principal, alternativa e simultâneas (órgão)' },
  { id: 'q8Dinamica', label: '8. Dinâmica e interpretação dos hinos de acordo ao desenho melódico e poesia' },
];

const options = ["Ruim", "Bom", "Ótimo"];

export function EvaluationForm({ 
  preEvaluationId, 
  candidateName,
  theoryMethods = [],
  practicalMethods = []
}: { 
  preEvaluationId: string; 
  candidateName: string;
  theoryMethods?: TheoryMethod[];
  practicalMethods?: PracticalMethod[];
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<QuestionId, string>>({
    q1Leitura: '', q2Pulso: '', q3Afinacao: '', q4Escalas: '',
    q5Postura: '', q6Timbre: '', q7Voz: '', q8Dinamica: ''
  });
  const [observacao, setObservacao] = useState('');
  const [showProgram, setShowProgram] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Program state
  type LessonInput = { methodId: string, methodName: string, lesson: string };
  const [msaLessons, setMsaLessons] = useState<LessonInput[]>(
    Array.from({ length: 8 }, () => ({ methodId: "", methodName: "", lesson: "" }))
  );
  const [methodLessons, setMethodLessons] = useState<LessonInput[]>(
    Array.from({ length: 8 }, () => ({ methodId: "", methodName: "", lesson: "" }))
  );
  const [hymns, setHymns] = useState<string[]>(Array(10).fill(""));

  const allAnswered = Object.values(answers).every(val => val !== '');

  const handleAnswer = (qId: QuestionId, val: string) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleMsaChange = (index: number, field: keyof LessonInput, val: string) => {
    const newArr = [...msaLessons];
    newArr[index] = { ...newArr[index], [field]: val };
    if (field === 'methodId') {
      const method = theoryMethods.find(m => m.id === val);
      newArr[index].methodName = method?.name || "";
    }
    setMsaLessons(newArr);
  };

  const handleMethodChange = (index: number, field: keyof LessonInput, val: string) => {
    const newArr = [...methodLessons];
    newArr[index] = { ...newArr[index], [field]: val };
    if (field === 'methodId') {
      const method = practicalMethods.find(m => m.id === val);
      newArr[index].methodName = method?.name || "";
    }
    setMethodLessons(newArr);
  };

  const handleHymnsChange = (index: number, val: string) => {
    const newArr = [...hymns];
    newArr[index] = val;
    setHymns(newArr);
  };

  const submitEvaluation = async (isApproved: boolean) => {
    setIsLoading(true);
    try {
      await saveEvaluation({
        preEvaluationId,
        isApproved,
        ...answers,
        observacao,
        // filter out empty fields if approved
        msaLessons: isApproved ? msaLessons.filter(l => l.lesson.trim() !== '' && l.methodId !== '') : undefined,
        methodLessons: isApproved ? methodLessons.filter(l => l.lesson.trim() !== '' && l.methodId !== '') : undefined,
        hymns: isApproved ? hymns.filter(h => h.trim() !== '') : undefined,
      });
      router.push("/portal/pre-avaliacao");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar avaliação.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-1">
          <ClipboardCheck className="text-green-400" /> Criterios de Avaliação
        </h2>
        <p className="text-slate-500 text-sm mb-6">Selecione a classificação para cada um dos itens abaixo.</p>
        
        <div className="space-y-6">
          {questions.map((q) => (
            <div key={q.id} className="border border-slate-200 rounded-xl p-4 bg-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <span className="text-slate-600 font-medium">{q.label}</span>
              <div className="flex gap-2 shrink-0">
                {options.map((opt) => {
                  const isSelected = answers[q.id] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleAnswer(q.id, opt)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
                        isSelected 
                          ? opt === 'Ruim' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                            opt === 'Bom' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                            'bg-green-500/20 text-green-400 border-green-500/50'
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <label className="block text-slate-600 font-medium mb-2">Observação (Opcional)</label>
          <textarea 
            rows={4}
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            placeholder="Adicione notas ou considerações adicionais..."
          />
        </div>
      </div>

      {!showProgram ? (
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <button
            onClick={() => submitEvaluation(false)}
            disabled={!allAnswered || isLoading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XCircle className="w-5 h-5" /> Ainda não está apto para o exame
          </button>
          
          <button
            onClick={() => setShowProgram(true)}
            disabled={!allAnswered || isLoading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continua para o Exame <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="glass-card p-6 border-blue-500/30 animate-in slide-in-from-bottom-8 duration-500">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
             Programa para estudo dirigido
          </h2>

          <div className="space-y-8">
            {/* Métodos de Teoria */}
            <div>
              <h3 className="text-slate-600 font-medium mb-3">Métodos de Teoria (até 8 lições)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {msaLessons.map((item, i) => (
                  <div key={`msa-${i}`} className="flex flex-col sm:flex-row gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <select
                      value={item.methodId}
                      onChange={(e) => handleMsaChange(i, 'methodId', e.target.value)}
                      className="w-full sm:w-1/2 bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="">Selecione o método...</option>
                      {theoryMethods.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder={`Lição ${i + 1}`}
                      value={item.lesson}
                      onChange={(e) => handleMsaChange(i, 'lesson', e.target.value)}
                      className="w-full sm:w-1/2 bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Método Prático */}
            <div>
              <h3 className="text-slate-600 font-medium mb-3">Métodos de Prática (até 8 lições)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {methodLessons.map((item, i) => (
                  <div key={`met-${i}`} className="flex flex-col sm:flex-row gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <select
                      value={item.methodId}
                      onChange={(e) => handleMethodChange(i, 'methodId', e.target.value)}
                      className="w-full sm:w-1/2 bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="">Selecione o método...</option>
                      {practicalMethods.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder={`Lição ${i + 1}`}
                      value={item.lesson}
                      onChange={(e) => handleMethodChange(i, 'lesson', e.target.value)}
                      className="w-full sm:w-1/2 bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Hinário */}
            <div>
              <h3 className="text-slate-600 font-medium mb-3">Hinário (até 10 hinos)</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {hymns.map((val, i) => (
                  <input
                    key={`hin-${i}`}
                    type="text"
                    placeholder={`Hino ${i + 1}`}
                    value={val}
                    onChange={(e) => handleHymnsChange(i, e.target.value)}
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg p-3 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={() => setShowProgram(false)}
              disabled={isLoading}
              className="px-6 py-3 text-slate-500 hover:text-slate-900 font-medium"
            >
              Voltar
            </button>
            <button
              onClick={() => submitEvaluation(true)}
              disabled={isLoading}
              className="flex items-center gap-2 px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5" /> Salvar e Aprovar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
