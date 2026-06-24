"use client";

import { useState } from "react";
import Link from "next/link";
import { User, MapPin, Church, Music, Calendar, Printer, BookOpen, ClipboardCheck, Pencil, Trash2 } from "lucide-react";
import { AllocationButton } from "@/components/AllocationButton";
import { SchedulePreEvaluationModal } from "@/components/SchedulePreEvaluationModal";

// Assuming we pass deletePreEvaluation as a prop or handle it via router.refresh
import { deletePreEvaluation } from "@/actions/preEvaluation";

export default function PreEvaluationTableClient({ 
  preEvaluations, 
  testSchedules, 
  isLocal,
  isRegional = false,
  isExaminadora = false,
  isAdmin = false,
  evaluators = []
}: { 
  preEvaluations: any[], 
  testSchedules: any[], 
  isLocal: boolean,
  isRegional?: boolean,
  isExaminadora?: boolean,
  isAdmin?: boolean,
  evaluators?: any[]
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [schedulingItem, setSchedulingItem] = useState<{ id: string; name: string; initialDate?: Date | null; initialEvaluatorId?: string | null } | null>(null);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const validIds = preEvaluations
        .filter(evalReq => 
          evalReq.testType.name.toUpperCase().includes('OFICIALIZAÇÃO') ||
          evalReq.testType.name.toUpperCase().includes('REUNIÃO DE JOVEM') ||
          evalReq.testType.name.toUpperCase().includes('CULTO OFICIAL') ||
          evalReq.testType.name.toUpperCase().includes('TROCA DE INSTRUMENTO')
        )
        .map(req => req.id);
      setSelectedIds(new Set(validIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelect = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const handlePrintBatch = () => {
    if (selectedIds.size === 0) return;
    const idsString = Array.from(selectedIds).join(",");
    window.open(`/api/pdf/lote?ids=${idsString}`, "_blank");
  };

  return (
    <div className="relative">
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300 w-[90%] sm:w-auto">
          <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 rounded-full shadow-2xl flex items-center justify-between sm:justify-center gap-2 sm:gap-4">
            <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{selectedIds.size} sel.</span>
            <div className="w-px h-4 bg-slate-700 hidden sm:block"></div>
            <button
              onClick={handlePrintBatch}
              className="flex items-center gap-2 bg-[#e95931] hover:bg-[#d64e28] text-white px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-colors whitespace-nowrap"
            >
              <Printer className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Imprimir Selecionados (A4 Paisagem)</span>
              <span className="sm:hidden">Imprimir</span>
            </button>
          </div>
        </div>
      )}

      {!isLocal && preEvaluations.length > 0 && (
        <div className="flex justify-end mb-4">
          <Link
            href={`/api/pdf/lista-inscricoes`}
            target="_blank"
            className="flex items-center gap-2 bg-[#224465] hover:bg-[#1a334d] text-white px-5 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Imprimir Lista em Tabela (A4)
          </Link>
        </div>
      )}

      {schedulingItem && (
        <SchedulePreEvaluationModal 
          preEvaluationId={schedulingItem.id}
          candidateName={schedulingItem.name}
          initialDate={schedulingItem.initialDate}
          initialEvaluatorId={schedulingItem.initialEvaluatorId}
          onClose={() => setSchedulingItem(null)}
          isAdmin={isAdmin}
          evaluators={evaluators}
        />
      )}

      <div className="hidden lg:block glass-card overflow-x-auto p-0">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="p-4 w-12 text-center">
                <input 
                  type="checkbox" 
                  className="rounded border-slate-300 text-[#e95931] focus:ring-[#e95931]"
                  onChange={handleSelectAll}
                  checked={selectedIds.size > 0 && selectedIds.size === preEvaluations.filter(evalReq => 
                    evalReq.testType.name.toUpperCase().includes('OFICIALIZAÇÃO') ||
                    evalReq.testType.name.toUpperCase().includes('REUNIÃO DE JOVEM') ||
                    evalReq.testType.name.toUpperCase().includes('CULTO OFICIAL') ||
                    evalReq.testType.name.toUpperCase().includes('TROCA DE INSTRUMENTO')
                  ).length}
                />
              </th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Candidato(a)</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Instrumento</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Setor / Congregação</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Encarregado</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo de Teste</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data Inscrição</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Agendamento</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {preEvaluations.map((evalReq) => {
              const canPrint = evalReq.testType.name.toUpperCase().includes('OFICIALIZAÇÃO') ||
                               evalReq.testType.name.toUpperCase().includes('REUNIÃO DE JOVEM') ||
                               evalReq.testType.name.toUpperCase().includes('CULTO OFICIAL') ||
                               evalReq.testType.name.toUpperCase().includes('TROCA DE INSTRUMENTO');
              
              const canEvaluate = 
                (!isLocal) && 
                (
                  isAdmin ||
                  (isExaminadora && evalReq.gender === 'F') ||
                  (isRegional && evalReq.gender === 'M')
                );
              
              return (
                <tr key={evalReq.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="p-4 text-center">
                    {canPrint && (
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-[#e95931] focus:ring-[#e95931]"
                        checked={selectedIds.has(evalReq.id)}
                        onChange={(e) => handleSelect(evalReq.id, e.target.checked)}
                      />
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${evalReq.gender === 'F' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                        <User className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-slate-900 uppercase text-sm">{evalReq.candidateName}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-slate-600 font-bold uppercase">
                    {evalReq.testType?.name?.toUpperCase().includes('TROCA DE INSTRUMENTO') ? (
                      <span className="flex flex-col gap-0.5">
                        <span className="text-slate-400 line-through text-[10px]">{evalReq.currentInstrument?.name || 'Não informado'}</span>
                        <span className="text-[#e95931] flex items-center gap-1">
                           ➔ {evalReq.instrument?.name}
                        </span>
                      </span>
                    ) : (
                      evalReq.instrument?.name
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 text-xs text-slate-600 uppercase">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#e95931]" /> {evalReq.sector.name}</span>
                      <span className="flex items-center gap-1"><Church className="w-3 h-3 text-[#e95931]" /> {evalReq.church.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 text-xs uppercase">
                    {evalReq.personInCharge.fullName}
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] font-bold bg-[#e95931]/10 text-[#e95931] border border-[#e95931]/20 px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit uppercase tracking-wider">
                      <Music className="w-3 h-3" /> {evalReq.testType.name}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {new Date(evalReq.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </td>
                  <td className="p-4">
                    {evalReq.scheduledDate ? (
                      <div className="flex flex-col gap-1 text-xs relative group">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-[#e95931]" />
                          {new Date(evalReq.scheduledDate).toLocaleDateString('pt-BR')} às {new Date(evalReq.scheduledDate).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                          
                          {canEvaluate && (
                            <button 
                              onClick={() => setSchedulingItem({ 
                                id: evalReq.id, 
                                name: evalReq.candidateName,
                                initialDate: new Date(evalReq.scheduledDate!),
                                initialEvaluatorId: evalReq.testEvaluatorId
                              })}
                              className="ml-1 text-slate-400 hover:text-[#e95931] transition-colors"
                              title="Editar Agendamento"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </span>
                        <span className="text-slate-500 text-[10px] uppercase">
                          Agendado por: <span className="font-semibold">{evalReq.scheduler?.fullName || "Desconhecido"}</span>
                        </span>
                      </div>
                    ) : canEvaluate ? (
                      <button 
                        onClick={() => setSchedulingItem({ id: evalReq.id, name: evalReq.candidateName })}
                        className="flex items-center gap-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition-colors border border-slate-200"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        Agendar Data
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Não agendado</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1.5 w-fit">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider flex items-center w-fit ${
                        (!evalReq.status || evalReq.status === 'PENDENTE') 
                          ? 'bg-amber-50 text-amber-600 border-amber-200'
                          : evalReq.status === 'APROVADO'
                            ? 'bg-green-50 text-green-600 border-green-200'
                            : 'bg-red-50 text-red-600 border-red-200'
                      }`}>
                        {!evalReq.status ? 'PENDENTE' : evalReq.status === 'APROVADO' ? 'ENCAMINHADO PARA O TESTE' : evalReq.status === 'REPROVADO' ? 'ESTUDAR MAIS UM POUCO' : evalReq.status}
                      </span>
                      {evalReq.status === 'APROVADO' && evalReq.evaluationResult && (
                        <div className="text-[9px] text-slate-500 uppercase leading-tight bg-slate-100 p-1.5 rounded-lg border border-slate-200 mt-1">
                          <span className="block font-bold text-slate-600">Aprovado por:</span>
                          <span className="block truncate max-w-[150px]" title={evalReq.evaluationResult.evaluator?.fullName || 'Não registrado'}>
                            {evalReq.evaluationResult.evaluator?.fullName || 'Não registrado'}
                          </span>
                          <span className="block text-[#e95931] font-medium mt-0.5">
                            {new Date(evalReq.evaluationResult.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end items-center gap-1 opacity-100 lg:opacity-60 group-hover:opacity-100 transition-opacity">
                      {evalReq.status === 'APROVADO' && !evalReq.testScheduleId && (
                        <AllocationButton preEvaluationId={evalReq.id} testSchedules={testSchedules} />
                      )}

                      {canPrint && (
                        <a
                          href={evalReq.testType.name.toUpperCase().includes('TROCA DE INSTRUMENTO') 
                                 ? `/api/pdf/troca-instrumento?id=${evalReq.id}` 
                                 : evalReq.gender === 'M' ? `/api/pdf/musico?id=${evalReq.id}` : `/api/pdf/organista?id=${evalReq.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#e95931] hover:bg-[#e95931]/10 p-2 rounded-lg transition-colors"
                          title={evalReq.testType.name.toUpperCase().includes('TROCA DE INSTRUMENTO') ? 'Imprimir Pedido de Troca de Instrumento' : `Imprimir Pedido de Teste (${evalReq.gender === 'M' ? 'Músicos' : 'Organistas'})`}
                        >
                          <Printer className="w-4 h-4" />
                        </a>
                      )}
                      
                      {evalReq.evaluationResult ? (
                        <>
                          <Link
                            href={`/portal/pre-avaliacao/resultado?id=${evalReq.id}`}
                            className="text-[#224465] hover:bg-[#224465]/10 p-2 rounded-lg transition-colors"
                            title="Ver Estudo Dirigido"
                          >
                            <BookOpen className="w-4 h-4" />
                          </Link>
                          {canEvaluate && (
                            <Link
                              href={`/portal/pre-avaliacao/avaliar?id=${evalReq.id}`}
                              className="text-green-600 hover:bg-green-100 p-2 rounded-lg transition-colors"
                              title="Editar Avaliação"
                            >
                              <ClipboardCheck className="w-4 h-4" />
                            </Link>
                          )}
                          {!canEvaluate && !isLocal && (
                            <div className="text-slate-300 p-2 rounded-lg cursor-not-allowed" title="Perfil sem permissão para avaliar este candidato">
                              <ClipboardCheck className="w-4 h-4" />
                            </div>
                          )}
                        </>
                      ) : (
                        isLocal ? (
                          <div 
                            className="text-slate-300 p-2 rounded-lg cursor-not-allowed"
                            title="Aguardando Regional/Examinadora avaliar"
                          >
                            <BookOpen className="w-4 h-4" />
                          </div>
                        ) : (
                          canEvaluate ? (
                            <Link
                              href={`/portal/pre-avaliacao/avaliar?id=${evalReq.id}`}
                              className="text-green-600 hover:bg-green-100 p-2 rounded-lg transition-colors"
                              title="Realizar Avaliação"
                            >
                              <ClipboardCheck className="w-4 h-4" />
                            </Link>
                          ) : (
                            <div className="text-slate-300 p-2 rounded-lg cursor-not-allowed" title="Perfil sem permissão para avaliar este candidato">
                              <ClipboardCheck className="w-4 h-4" />
                            </div>
                          )
                        )
                      )}
                      <Link 
                        href={`/portal/pre-avaliacao?edit=${evalReq.id}#lista`}
                        className="text-[#224465] hover:bg-[#224465]/10 p-2 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={async () => {
                          if (confirm("Tem certeza que deseja excluir esta pré-avaliação?")) {
                            await deletePreEvaluation(evalReq.id);
                          }
                        }} 
                        className="text-red-500 hover:bg-red-100 p-2 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden flex flex-col gap-4 mt-4">
        {/* Select All Checkbox for Mobile */}
        {preEvaluations.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex items-center justify-between">
             <span className="text-sm font-semibold text-slate-700">Selecionar Todos (Imprimíveis)</span>
             <input 
                type="checkbox" 
                className="rounded border-slate-300 w-5 h-5 text-[#e95931] focus:ring-[#e95931]"
                onChange={handleSelectAll}
                checked={selectedIds.size > 0 && selectedIds.size === preEvaluations.filter(evalReq => 
                  evalReq.testType.name.toUpperCase().includes('OFICIALIZAÇÃO') ||
                  evalReq.testType.name.toUpperCase().includes('REUNIÃO DE JOVEM') ||
                  evalReq.testType.name.toUpperCase().includes('CULTO OFICIAL') ||
                  evalReq.testType.name.toUpperCase().includes('TROCA DE INSTRUMENTO')
                ).length}
              />
          </div>
        )}

        {preEvaluations.map((evalReq) => {
          const canPrint = evalReq.testType.name.toUpperCase().includes('OFICIALIZAÇÃO') ||
                           evalReq.testType.name.toUpperCase().includes('REUNIÃO DE JOVEM') ||
                           evalReq.testType.name.toUpperCase().includes('CULTO OFICIAL') ||
                           evalReq.testType.name.toUpperCase().includes('TROCA DE INSTRUMENTO');
          
          const canEvaluate = 
            (!isLocal) && 
            (
              isAdmin ||
              (isExaminadora && evalReq.gender === 'F') ||
              (isRegional && evalReq.gender === 'M')
            );

          return (
            <div key={evalReq.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {canPrint && (
                    <div className="mt-1">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 w-5 h-5 text-[#e95931] focus:ring-[#e95931]"
                        checked={selectedIds.has(evalReq.id)}
                        onChange={(e) => handleSelect(evalReq.id, e.target.checked)}
                      />
                    </div>
                  )}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${evalReq.gender === 'F' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 uppercase text-sm">{evalReq.candidateName}</span>
                    <span className="text-[10px] font-bold bg-[#e95931]/10 text-[#e95931] border border-[#e95931]/20 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit uppercase mt-1">
                      <Music className="w-3 h-3" /> {evalReq.testType.name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="col-span-2">
                  <p className="text-slate-400 font-medium mb-0.5">Instrumento</p>
                  <div className="font-bold text-slate-700 uppercase">
                    {evalReq.testType?.name?.toUpperCase().includes('TROCA DE INSTRUMENTO') ? (
                      <span className="flex items-center gap-1">
                        <span className="text-slate-400 line-through">{evalReq.currentInstrument?.name || 'Não informado'}</span>
                        <span className="text-[#e95931]">➔ {evalReq.instrument?.name}</span>
                      </span>
                    ) : (
                      evalReq.instrument?.name
                    )}
                  </div>
                </div>
                
                <div className="col-span-2">
                  <p className="text-slate-400 font-medium mb-0.5">Congregação / Setor</p>
                  <p className="font-bold text-slate-700 uppercase">{evalReq.church.name} ({evalReq.sector.name})</p>
                </div>

                <div>
                  <p className="text-slate-400 font-medium mb-0.5">Encarregado</p>
                  <p className="font-bold text-slate-700 uppercase">{evalReq.personInCharge.fullName}</p>
                </div>
                
                <div>
                  <p className="text-slate-400 font-medium mb-0.5">Status</p>
                  <div className="flex flex-col gap-1 w-fit mt-0.5">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider flex items-center w-fit ${
                      (!evalReq.status || evalReq.status === 'PENDENTE') 
                        ? 'bg-amber-50 text-amber-600 border-amber-200'
                        : evalReq.status === 'APROVADO'
                          ? 'bg-green-50 text-green-600 border-green-200'
                          : 'bg-red-50 text-red-600 border-red-200'
                    }`}>
                      {!evalReq.status ? 'PENDENTE' : evalReq.status === 'APROVADO' ? 'ENCAMINHADO' : evalReq.status === 'REPROVADO' ? 'ESTUDAR MAIS' : evalReq.status}
                    </span>
                  </div>
                </div>

                <div className="col-span-2">
                  <p className="text-slate-400 font-medium mb-0.5">Agendamento</p>
                  <div>
                    {evalReq.scheduledDate ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1.5 font-bold text-slate-700">
                          <Calendar className="w-3 h-3 text-[#e95931]" />
                          {new Date(evalReq.scheduledDate).toLocaleDateString('pt-BR')} às {new Date(evalReq.scheduledDate).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                          
                          {canEvaluate && (
                            <button 
                              onClick={() => setSchedulingItem({ 
                                id: evalReq.id, 
                                name: evalReq.candidateName,
                                initialDate: new Date(evalReq.scheduledDate!),
                                initialEvaluatorId: evalReq.testEvaluatorId
                              })}
                              className="ml-1 text-slate-400 hover:text-[#e95931] transition-colors"
                              title="Editar Agendamento"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                          )}
                        </span>
                        <span className="text-slate-500 text-[9px] uppercase font-medium">
                          Por: {evalReq.scheduler?.fullName || "Desconhecido"}
                        </span>
                      </div>
                    ) : canEvaluate ? (
                      <button 
                        onClick={() => setSchedulingItem({ id: evalReq.id, name: evalReq.candidateName })}
                        className="flex items-center gap-1.5 text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-lg transition-colors border border-slate-300 w-fit"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Agendar Data
                      </button>
                    ) : (
                      <span className="text-slate-400 italic font-medium">Não agendado</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 items-center flex-wrap">
                {evalReq.status === 'APROVADO' && !evalReq.testScheduleId && (
                  <AllocationButton preEvaluationId={evalReq.id} testSchedules={testSchedules} />
                )}

                {canPrint && (
                  <a
                    href={evalReq.testType.name.toUpperCase().includes('TROCA DE INSTRUMENTO') 
                            ? `/api/pdf/troca-instrumento?id=${evalReq.id}` 
                            : evalReq.gender === 'M' ? `/api/pdf/musico?id=${evalReq.id}` : `/api/pdf/organista?id=${evalReq.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#e95931] bg-[#e95931]/10 hover:bg-[#e95931]/20 p-2.5 rounded-xl transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                  </a>
                )}
                
                {evalReq.evaluationResult ? (
                  <>
                    <Link
                      href={`/portal/pre-avaliacao/resultado?id=${evalReq.id}`}
                      className="text-[#224465] bg-[#224465]/10 hover:bg-[#224465]/20 p-2.5 rounded-xl transition-colors"
                    >
                      <BookOpen className="w-4 h-4" />
                    </Link>
                    {canEvaluate && (
                      <Link
                        href={`/portal/pre-avaliacao/avaliar?id=${evalReq.id}`}
                        className="text-green-600 bg-green-100 hover:bg-green-200 p-2.5 rounded-xl transition-colors"
                      >
                        <ClipboardCheck className="w-4 h-4" />
                      </Link>
                    )}
                    {!canEvaluate && !isLocal && (
                      <div className="text-slate-400 bg-slate-100 p-2.5 rounded-xl opacity-50 cursor-not-allowed">
                        <ClipboardCheck className="w-4 h-4" />
                      </div>
                    )}
                  </>
                ) : (
                  isLocal ? (
                    <div className="text-slate-400 bg-slate-100 p-2.5 rounded-xl opacity-50 cursor-not-allowed">
                      <BookOpen className="w-4 h-4" />
                    </div>
                  ) : (
                    canEvaluate ? (
                      <Link
                        href={`/portal/pre-avaliacao/avaliar?id=${evalReq.id}`}
                        className="text-green-600 bg-green-100 hover:bg-green-200 p-2.5 rounded-xl transition-colors"
                      >
                        <ClipboardCheck className="w-4 h-4" />
                      </Link>
                    ) : (
                      <div className="text-slate-400 bg-slate-100 p-2.5 rounded-xl opacity-50 cursor-not-allowed">
                        <ClipboardCheck className="w-4 h-4" />
                      </div>
                    )
                  )
                )}
                <Link 
                  href={`/portal/pre-avaliacao?edit=${evalReq.id}#lista`}
                  className="text-[#224465] bg-[#224465]/10 hover:bg-[#224465]/20 p-2.5 rounded-xl transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </Link>
                <button 
                  onClick={async () => {
                    if (confirm("Tem certeza que deseja excluir esta pré-avaliação?")) {
                      await deletePreEvaluation(evalReq.id);
                    }
                  }} 
                  className="text-red-500 bg-red-100 hover:bg-red-200 p-2.5 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
