"use client";

import { useState } from "react";
import { saveEvaluation } from "@/actions/evaluation";
import { useRouter } from "next/navigation";
import { ClipboardCheck, ArrowRight, XCircle, CheckCircle2, Plus, Trash2, BookOpen } from "lucide-react";
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

export type InitialEvaluationData = {
  status?: string | null;
  q1Leitura: string;
  q2Pulso: string;
  q3Afinacao: string;
  q4Escalas: string;
  q5Postura: string;
  q6Timbre: string;
  q7Voz: string;
  q8Dinamica: string;
  observacao?: string | null;
  msaLessons?: string | null;
  methodLessons?: string | null;
  hymns?: string | null;
};

type LessonInput = { page: string, lesson: string };

export function EvaluationForm({ 
  preEvaluationId, 
  candidateName,
  theoryMethods = [],
  practicalMethods = [],
  initialResult,
}: { 
  preEvaluationId: string; 
  candidateName: string;
  theoryMethods?: TheoryMethod[];
  practicalMethods?: PracticalMethod[];
  initialResult?: InitialEvaluationData | null;
}) {
  const router = useRouter();
  const isEditing = Boolean(initialResult);

  // Safely parse JSON array
  const parseJson = (str: string | null | undefined) => {
    if (!str) return [];
    try {
      const parsed = JSON.parse(str);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const initialMsaList = parseJson(initialResult?.msaLessons);
  const initialMethodList = parseJson(initialResult?.methodLessons);
  const initialHymnsList = parseJson(initialResult?.hymns);

  // Determine initial theory method
  const foundTheoryMethod = initialMsaList[0]?.methodId 
    ? theoryMethods.find(m => m.id === initialMsaList[0].methodId)
    : theoryMethods.find(m => m.name === initialMsaList[0]?.methodName);
  const defaultTheoryMethodId = foundTheoryMethod?.id || (theoryMethods.length === 1 ? theoryMethods[0].id : "");

  // Determine initial practical method
  const foundPracticalMethod = initialMethodList[0]?.methodId 
    ? practicalMethods.find(m => m.id === initialMethodList[0].methodId)
    : practicalMethods.find(m => m.name === initialMethodList[0]?.methodName);
  const defaultPracticalMethodId = foundPracticalMethod?.id || (practicalMethods.length === 1 ? practicalMethods[0].id : "");

  // Initial lessons lists
  const defaultMsaLessons: LessonInput[] = initialMsaList.length > 0
    ? initialMsaList.map((l: any) => ({
        page: l?.page !== undefined && l?.page !== null ? String(l.page) : "",
        lesson: l?.lesson !== undefined && l?.lesson !== null ? String(l.lesson) : ""
      }))
    : [{ page: "", lesson: "" }];

  const defaultMethodLessons: LessonInput[] = initialMethodList.length > 0
    ? initialMethodList.map((l: any) => ({
        page: l?.page !== undefined && l?.page !== null ? String(l.page) : "",
        lesson: l?.lesson !== undefined && l?.lesson !== null ? String(l.lesson) : ""
      }))
    : [{ page: "", lesson: "" }];

  const defaultHymns: string[] = Array(10).fill("");
  initialHymnsList.forEach((h: any, idx: number) => {
    if (idx < 10) defaultHymns[idx] = String(h ?? "");
  });

  const [answers, setAnswers] = useState<Record<QuestionId, string>>({
    q1Leitura: initialResult?.q1Leitura || '',
    q2Pulso: initialResult?.q2Pulso || '',
    q3Afinacao: initialResult?.q3Afinacao || '',
    q4Escalas: initialResult?.q4Escalas || '',
    q5Postura: initialResult?.q5Postura || '',
    q6Timbre: initialResult?.q6Timbre || '',
    q7Voz: initialResult?.q7Voz || '',
    q8Dinamica: initialResult?.q8Dinamica || ''
  });

  const [observacao, setObservacao] = useState(initialResult?.observacao || '');
  const [showProgram, setShowProgram] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [globalTheoryMethodId, setGlobalTheoryMethodId] = useState(defaultTheoryMethodId);
  const [globalPracticalMethodId, setGlobalPracticalMethodId] = useState(defaultPracticalMethodId);

  const [msaLessons, setMsaLessons] = useState<LessonInput[]>(defaultMsaLessons);
  const [methodLessons, setMethodLessons] = useState<LessonInput[]>(defaultMethodLessons);
  const [hymns, setHymns] = useState<string[]>(defaultHymns);

  const addMsaLesson = () => {
    if (msaLessons.length < 8) {
      setMsaLessons([...msaLessons, { page: "", lesson: "" }]);
    }
  };

  const removeMsaLesson = (index: number) => {
    if (msaLessons.length > 1) {
      setMsaLessons(msaLessons.filter((_, i) => i !== index));
    } else {
      setMsaLessons([{ page: "", lesson: "" }]);
    }
  };

  const addMethodLesson = () => {
    if (methodLessons.length < 8) {
      setMethodLessons([...methodLessons, { page: "", lesson: "" }]);
    }
  };

  const removeMethodLesson = (index: number) => {
    if (methodLessons.length > 1) {
      setMethodLessons(methodLessons.filter((_, i) => i !== index));
    } else {
      setMethodLessons([{ page: "", lesson: "" }]);
    }
  };

  const allAnswered = Object.values(answers).every(val => val !== '');

  const handleAnswer = (qId: QuestionId, val: string) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleMsaChange = (index: number, field: keyof LessonInput, val: string) => {
    const newArr = [...msaLessons];
    newArr[index] = { ...newArr[index], [field]: val };
    setMsaLessons(newArr);
  };

  const handleMethodChange = (index: number, field: keyof LessonInput, val: string) => {
    const newArr = [...methodLessons];
    newArr[index] = { ...newArr[index], [field]: val };
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
        msaLessons: isApproved && globalTheoryMethodId 
          ? msaLessons.filter(l => l.lesson.trim() !== '' || l.page.trim() !== '').map(l => ({
              methodId: globalTheoryMethodId,
              methodName: theoryMethods?.find(m => m.id === globalTheoryMethodId)?.name || "",
              page: l.page,
              lesson: l.lesson
            }))
          : undefined,
        methodLessons: isApproved && globalPracticalMethodId
          ? methodLessons.filter(l => l.lesson.trim() !== '' || l.page.trim() !== '').map(l => ({
              methodId: globalPracticalMethodId,
              methodName: practicalMethods?.find(m => m.id === globalPracticalMethodId)?.name || "",
              page: l.page,
              lesson: l.lesson
            }))
          : undefined,
        hymns: isApproved ? hymns.filter(h => h.trim() !== '') : undefined,
      });

      router.push(`/portal/pre-avaliacao/resultado?id=${preEvaluationId}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar avaliação.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Abas de navegação direta */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-2 rounded-2xl">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowProgram(false)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              !showProgram
                ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            1. Critérios de Avaliação
          </button>
          <button
            type="button"
            onClick={() => setShowProgram(true)}
            disabled={!allAnswered}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
              showProgram
                ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            2. Estudo Dirigido
          </button>
        </div>

        {isEditing && (
          <span className="text-xs font-semibold px-3 py-1 bg-amber-500/10 text-amber-700 border border-amber-500/20 rounded-full">
            Modo Edição
          </span>
        )}
      </div>

      {!showProgram ? (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-1">
              <ClipboardCheck className="text-green-500" /> Critérios de Avaliação
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              {isEditing ? "Altere a classificação de qualquer critério ou as observações." : "Selecione a classificação para cada um dos itens abaixo."}
            </p>
            
            <div className="space-y-6">
              {questions.map((q) => (
                <div key={q.id} className="border border-slate-200 rounded-xl p-4 bg-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <span className="text-slate-700 font-medium">{q.label}</span>
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
                              ? opt === 'Ruim' ? 'bg-red-500/20 text-red-600 border-red-500/50' :
                                opt === 'Bom' ? 'bg-blue-500/20 text-blue-600 border-blue-500/50' :
                                'bg-green-500/20 text-green-600 border-green-500/50'
                              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
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
              <label className="block text-slate-700 font-medium mb-2">Observação (Opcional)</label>
              <textarea 
                rows={4}
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="Adicione notas ou considerações adicionais..."
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              onClick={() => submitEvaluation(false)}
              disabled={!allAnswered || isLoading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/30 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircle className="w-5 h-5" />
              {isEditing ? "Salvar como: Não apto para exame" : "Ainda não está apto para o exame"}
            </button>
            
            <button
              onClick={() => setShowProgram(true)}
              disabled={!allAnswered || isLoading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isEditing ? "Ver / Editar Estudo Dirigido" : "Continua para o Exame"} <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card p-6 border-blue-500/30 animate-in slide-in-from-bottom-8 duration-500">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <BookOpen className="text-orange-500" /> Programa para estudo dirigido
          </h2>

          <div className="space-y-8">
            {/* Métodos de Teoria */}
            <div>
              <h3 className="text-slate-700 font-medium mb-3">Método de Teoria (até 8 lições)</h3>
              <div className="mb-4">
                <select
                  value={globalTheoryMethodId}
                  onChange={(e) => setGlobalTheoryMethodId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  <option value="">Selecione o método...</option>
                  {theoryMethods.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {msaLessons.map((item, i) => (
                  <div key={`msa-${i}`} className="flex flex-col sm:flex-row items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <input
                      type="text"
                      placeholder={`Pág ${i + 1}`}
                      value={item.page}
                      onChange={(e) => handleMsaChange(i, 'page', e.target.value)}
                      className="w-full sm:w-1/3 bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                    <input
                      type="text"
                      placeholder={`Lição ${i + 1}`}
                      value={item.lesson}
                      onChange={(e) => handleMsaChange(i, 'lesson', e.target.value)}
                      className="w-full sm:flex-1 bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      {msaLessons.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMsaLesson(i)}
                          title="Remover lição"
                          className="flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 p-2.5 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {i === msaLessons.length - 1 && msaLessons.length < 8 && (
                        <button
                          type="button"
                          onClick={addMsaLesson}
                          title="Adicionar mais lição"
                          className="flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white p-2.5 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Método Prático */}
            <div>
              <h3 className="text-slate-700 font-medium mb-3">Método de Prática (até 8 lições)</h3>
              <div className="mb-4">
                <select
                  value={globalPracticalMethodId}
                  onChange={(e) => setGlobalPracticalMethodId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  <option value="">Selecione o método...</option>
                  {practicalMethods.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {methodLessons.map((item, i) => (
                  <div key={`met-${i}`} className="flex flex-col sm:flex-row items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <input
                      type="text"
                      placeholder={`Pág ${i + 1}`}
                      value={item.page}
                      onChange={(e) => handleMethodChange(i, 'page', e.target.value)}
                      className="w-full sm:w-1/3 bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                    <input
                      type="text"
                      placeholder={`Lição ${i + 1}`}
                      value={item.lesson}
                      onChange={(e) => handleMethodChange(i, 'lesson', e.target.value)}
                      className="w-full sm:flex-1 bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      {methodLessons.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMethodLesson(i)}
                          title="Remover lição"
                          className="flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 p-2.5 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {i === methodLessons.length - 1 && methodLessons.length < 8 && (
                        <button
                          type="button"
                          onClick={addMethodLesson}
                          title="Adicionar mais lição"
                          className="flex-shrink-0 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white p-2.5 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hinos */}
            <div>
              <h3 className="text-slate-700 font-medium mb-3">Hinário (até 10 hinos)</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {hymns.map((val, i) => (
                  <input
                    key={`hin-${i}`}
                    type="text"
                    placeholder={`Hino ${i + 1}`}
                    value={val}
                    onChange={(e) => handleHymnsChange(i, e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={() => setShowProgram(false)}
              disabled={isLoading}
              className="px-6 py-3 text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Voltar aos Critérios
            </button>
            <button
              onClick={() => submitEvaluation(true)}
              disabled={isLoading}
              className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-sm"
            >
              <CheckCircle2 className="w-5 h-5" /> {isEditing ? "Salvar Alterações" : "Salvar e Aprovar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
