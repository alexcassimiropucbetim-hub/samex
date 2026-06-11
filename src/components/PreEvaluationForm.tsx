"use client";

import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, CheckCircle2, User, Music, FileText, Check, X } from "lucide-react";
import { createPreEvaluation, updatePreEvaluation } from "@/actions/preEvaluation";
import Link from "next/link";

type Props = {
  sectors: { id: string; name: string }[];
  churches: { id: string; name: string; sectorId: string }[];
  instruments: { id: string; name: string; categoryId: string }[];
  personInCharges: { id: string; fullName: string; churchId: string; roleType: { name: string } | null }[];
  testTypes: { id: string; name: string }[];
  initialData?: {
    id: string;
    sectorId: string;
    churchId: string;
    candidateName: string;
    gender: string;
    instructorName: string;
    instructorChurchId: string;
    instructorChurchName?: string;
    instrumentId: string;
    personInChargeId: string;
    testTypeId: string;
    msaStatus: string;
    msaJustification: string;
    currentInstrumentId?: string | null;
    currentTonality?: string | null;
    desiredTonality?: string | null;
    officializationDate?: string | null;
    candidateLevel?: string | null;
    orchestraNeed?: boolean | null;
    illness?: boolean | null;
    approvedInSectorMeeting?: boolean | null;
    meetingDate?: string | null;
    meetingLocality?: string | null;
    meetingElderName?: string | null;
  };
};

export default function PreEvaluationForm({ sectors, churches, instruments, personInCharges, testTypes, initialData }: Props) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    sectorId: initialData?.sectorId || "",
    churchId: initialData?.churchId || "",
    candidateName: initialData?.candidateName || "",
    gender: initialData?.gender || "",
    instructorName: initialData?.instructorName || "",
    instructorChurchId: initialData?.instructorChurchName ? "OUTRA" : (initialData?.instructorChurchId || ""),
    instructorChurchName: initialData?.instructorChurchName || "",
    instrumentId: initialData?.instrumentId || "",
    personInChargeId: initialData?.personInChargeId || "",
    testTypeId: initialData?.testTypeId || "",
    msaStatus: initialData?.msaStatus || "",
    msaJustification: initialData?.msaJustification || "",
    currentInstrumentId: initialData?.currentInstrumentId || "",
    currentTonality: initialData?.currentTonality || "",
    desiredTonality: initialData?.desiredTonality || "",
    officializationDate: initialData?.officializationDate || "",
    candidateLevel: initialData?.candidateLevel || "",
    orchestraNeed: initialData?.orchestraNeed !== undefined && initialData?.orchestraNeed !== null ? String(initialData.orchestraNeed) : "",
    illness: initialData?.illness !== undefined && initialData?.illness !== null ? String(initialData.illness) : "",
    approvedInSectorMeeting: initialData?.approvedInSectorMeeting !== undefined && initialData?.approvedInSectorMeeting !== null ? String(initialData.approvedInSectorMeeting) : "",
    meetingDate: initialData?.meetingDate || "",
    meetingLocality: initialData?.meetingLocality || "",
    meetingElderName: initialData?.meetingElderName || "",
  });

  const initialDataStr = JSON.stringify(initialData);

  useEffect(() => {
    if (initialData) {
      setFormData({
        sectorId: initialData.sectorId || "",
        churchId: initialData.churchId || "",
        candidateName: initialData.candidateName || "",
        gender: initialData.gender || "",
        instructorName: initialData.instructorName || "",
        instructorChurchId: initialData.instructorChurchName ? "OUTRA" : (initialData.instructorChurchId || ""),
        instructorChurchName: initialData.instructorChurchName || "",
        instrumentId: initialData.instrumentId || "",
        personInChargeId: initialData.personInChargeId || "",
        testTypeId: initialData.testTypeId || "",
        msaStatus: initialData.msaStatus || "",
        msaJustification: initialData.msaJustification || "",
        currentInstrumentId: initialData.currentInstrumentId || "",
        currentTonality: initialData.currentTonality || "",
        desiredTonality: initialData.desiredTonality || "",
        officializationDate: initialData.officializationDate || "",
        candidateLevel: initialData.candidateLevel || "",
        orchestraNeed: initialData.orchestraNeed !== undefined && initialData.orchestraNeed !== null ? String(initialData.orchestraNeed) : "",
        illness: initialData.illness !== undefined && initialData.illness !== null ? String(initialData.illness) : "",
        approvedInSectorMeeting: initialData.approvedInSectorMeeting !== undefined && initialData.approvedInSectorMeeting !== null ? String(initialData.approvedInSectorMeeting) : "",
        meetingDate: initialData.meetingDate || "",
        meetingLocality: initialData.meetingLocality || "",
        meetingElderName: initialData.meetingElderName || "",
      });
      setStep(1); // Resetar pro começo ao editar novo
    }
  }, [initialDataStr]);

  const updateForm = (field: keyof typeof formData, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-selecionar encarregado quando a congregação muda
      if (field === "churchId" && value) {
        const encarregadosDaIgreja = personInCharges.filter(p => p.churchId === value);
        if (encarregadosDaIgreja.length > 0) {
          newData.personInChargeId = encarregadosDaIgreja[0].id;
        } else {
          newData.personInChargeId = ""; // Limpa se não houver
        }
      }

      // Limpar congregação e encarregado se o setor mudar
      if (field === "sectorId") {
        newData.churchId = "";
        newData.personInChargeId = "";
      }

      // Quando selecionado sexo feminino, setar instrumento para Órgão Eletrônico
      if (field === "gender" && value === "F") {
        const orgao = instruments.find(i => 
          i.name.toLowerCase().includes('órgão') || 
          i.name.toLowerCase().includes('orgao')
        );
        if (orgao) {
          newData.instrumentId = orgao.id;
        }
      }

      return newData;
    });
  };

  const filteredChurches = churches.filter(c => c.sectorId === formData.sectorId);
  const filteredPersonInCharges = formData.churchId 
    ? personInCharges.filter(p => p.churchId === formData.churchId)
    : personInCharges;

  const steps = [
    { id: 1, title: "Candidato(a)", icon: User },
    { id: 2, title: "Tipo de Teste", icon: Music },
    { id: 3, title: "MSA", icon: FileText },
    { id: 4, title: "Confirmação", icon: CheckCircle2 },
  ];

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    try {
      if (initialData?.id) {
        await updatePreEvaluation(initialData.id, data);
      } else {
        await createPreEvaluation(data);
      }
      setSuccess(true);
    } catch (error) {
      alert("Ocorreu um erro ao salvar o pedido.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="glass-card text-center py-16 space-y-4">
        <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Pedido de Pré-Avaliação {initialData?.id ? "Atualizado" : "Enviado"}!</h2>
        <p className="text-slate-500">O cadastro foi realizado com sucesso.</p>
        <Link 
          href="/portal/pre-avaliacao"
          className="btn-primary mt-8 inline-block"
        >
          {initialData?.id ? "Voltar aos Cadastros" : "Fazer Novo Pedido"}
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-card max-w-4xl mx-auto relative">
      {initialData?.id && (
        <div className="absolute -top-4 -right-4">
          <Link href="/portal/pre-avaliacao" className="flex items-center gap-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border border-red-500/30">
            <X className="w-4 h-4" /> Cancelar Edição
          </Link>
        </div>
      )}

      {/* Stepper */}
      <div className="flex flex-row justify-between items-start mb-8 relative">
        <div className="absolute left-0 top-4 sm:top-5 w-full h-0.5 bg-slate-200"></div>
        {steps.map((s) => {
          const Icon = s.icon;
          const isActive = step >= s.id;
          return (
            <div key={s.id} className="flex flex-col items-center gap-1 sm:gap-2 relative z-10 w-1/4">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full flex items-center justify-center border-2 transition-colors ${
                isActive ? "bg-[#e95931] border-[#e95931] text-white shadow-lg shadow-[#e95931]/30" : "bg-white border-slate-200 text-slate-400"
              }`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className={`text-[10px] sm:text-sm font-medium px-1 sm:px-2 py-0.5 rounded-full text-center leading-tight ${isActive ? "text-[#e95931] bg-[#e95931]/10" : "text-slate-500 bg-white/80"}`}>
                {s.title}
              </span>
            </div>
          );
        })}
      </div>

      <div className="space-y-6">
        {/* Etapa 1: Candidato */}
        {step === 1 && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4 sm:mb-6">Dados do Candidato(a)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Setor</label>
                <select value={formData.sectorId} onChange={e => updateForm("sectorId", e.target.value)} className="input-glass">
                  <option value="">Selecione um setor...</option>
                  {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Congregação</label>
                <select value={formData.churchId} onChange={e => updateForm("churchId", e.target.value)} disabled={!formData.sectorId} className="input-glass disabled:opacity-50">
                  <option value="">Selecione uma congregação...</option>
                  {filteredChurches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Nome Completo do(a) Candidato(a)</label>
              <input type="text" value={formData.candidateName} onChange={e => updateForm("candidateName", e.target.value)} className="input-glass" placeholder="Nome sem abreviações" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Sexo</label>
              <select value={formData.gender} onChange={e => updateForm("gender", e.target.value)} className="input-glass">
                <option value="">Selecione...</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>

            {formData.gender === "F" && (
              <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl space-y-4 mt-4">
                <h4 className="text-sm sm:text-base text-orange-400 font-medium">Dados da Instrutora</h4>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Nome completo da Instrutora</label>
                  <input type="text" value={formData.instructorName} onChange={e => updateForm("instructorName", e.target.value)} className="input-glass" placeholder="Nome sem abreviações" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Comum congregação da Instrutora</label>
                  <select value={formData.instructorChurchId} onChange={e => updateForm("instructorChurchId", e.target.value)} className="input-glass">
                    <option value="">Selecione a igreja...</option>
                    {churches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    <option value="OUTRA">OUTRA (Digitar Manualmente)</option>
                  </select>
                </div>
                {formData.instructorChurchId === "OUTRA" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Nome da Congregação (Instrutora)</label>
                    <input type="text" value={formData.instructorChurchName || ""} onChange={e => updateForm("instructorChurchName", e.target.value)} className="input-glass" placeholder="Digite o nome da comum da instrutora" />
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Instrumento</label>
                <select value={formData.instrumentId} onChange={e => updateForm("instrumentId", e.target.value)} className="input-glass">
                  <option value="">Selecione...</option>
                  {instruments.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Encarregado Responsável</label>
                <select value={formData.personInChargeId} onChange={e => updateForm("personInChargeId", e.target.value)} className="input-glass">
                  <option value="">Selecione...</option>
                  {filteredPersonInCharges.map(p => (
                    <option key={p.id} value={p.id}>{p.fullName}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Etapa 2: Tipo de Teste */}
        {step === 2 && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4 sm:mb-6">Tipo de Teste</h3>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Qual teste será realizado?</label>
              <select value={formData.testTypeId} onChange={e => updateForm("testTypeId", e.target.value)} className="input-glass">
                <option value="">Selecione o tipo de teste...</option>
                {testTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            {testTypes.find(t => t.id === formData.testTypeId)?.name.toUpperCase().includes('TROCA DE INSTRUMENTO') && (
              <div className="mt-8 space-y-6 pt-6 border-t border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                <h4 className="text-base sm:text-lg font-semibold text-orange-400">Informações sobre troca de instrumento</h4>
                
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Instrumento atual</label>
                  <select value={formData.currentInstrumentId} onChange={e => updateForm("currentInstrumentId", e.target.value)} className="input-glass">
                    <option value="">Selecione o instrumento atual</option>
                    {instruments.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Tonalidade atual</label>
                    <input type="text" value={formData.currentTonality} onChange={e => updateForm("currentTonality", e.target.value)} className="input-glass" placeholder="EX.: SI BEMOL" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Tonalidade desejada</label>
                    <input type="text" value={formData.desiredTonality} onChange={e => updateForm("desiredTonality", e.target.value)} className="input-glass" placeholder="EX.: MI BEMOL" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Data da oficialização</label>
                  <input type="date" value={formData.officializationDate} onChange={e => updateForm("officializationDate", e.target.value)} className="input-glass" />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Nível do candidato</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 text-slate-600 cursor-pointer w-fit">
                        <input type="radio" name="level" value="RJM" checked={formData.candidateLevel === "RJM"} onChange={e => updateForm("candidateLevel", e.target.value)} className="text-orange-500 bg-slate-100 border-slate-300 focus:ring-orange-500/50" />
                        Toca nas RJM
                      </label>
                      <label className="flex items-center gap-3 text-slate-600 cursor-pointer w-fit">
                        <input type="radio" name="level" value="CULTOS" checked={formData.candidateLevel === "CULTOS"} onChange={e => updateForm("candidateLevel", e.target.value)} className="text-orange-500 bg-slate-100 border-slate-300 focus:ring-orange-500/50" />
                        Cultos oficiais
                      </label>
                      <label className="flex items-center gap-3 text-slate-600 cursor-pointer w-fit">
                        <input type="radio" name="level" value="OFICIALIZADO" checked={formData.candidateLevel === "OFICIALIZADO"} onChange={e => updateForm("candidateLevel", e.target.value)} className="text-orange-500 bg-slate-100 border-slate-300 focus:ring-orange-500/50" />
                        Oficializado
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Por necessidade da orquestra?</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-3 text-slate-600 cursor-pointer">
                        <input type="radio" name="orchestraNeed" value="true" checked={formData.orchestraNeed === "true"} onChange={e => updateForm("orchestraNeed", e.target.value)} className="text-orange-500 bg-slate-100 border-slate-300 focus:ring-orange-500/50" />
                        Sim
                      </label>
                      <label className="flex items-center gap-3 text-slate-600 cursor-pointer">
                        <input type="radio" name="orchestraNeed" value="false" checked={formData.orchestraNeed === "false"} onChange={e => updateForm("orchestraNeed", e.target.value)} className="text-orange-500 bg-slate-100 border-slate-300 focus:ring-orange-500/50" />
                        Não
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Por enfermidade?</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-3 text-slate-600 cursor-pointer">
                        <input type="radio" name="illness" value="true" checked={formData.illness === "true"} onChange={e => updateForm("illness", e.target.value)} className="text-orange-500 bg-slate-100 border-slate-300 focus:ring-orange-500/50" />
                        Sim
                      </label>
                      <label className="flex items-center gap-3 text-slate-600 cursor-pointer">
                        <input type="radio" name="illness" value="false" checked={formData.illness === "false"} onChange={e => updateForm("illness", e.target.value)} className="text-orange-500 bg-slate-100 border-slate-300 focus:ring-orange-500/50" />
                        Não
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Aprovado em reunião do setor?</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-3 text-slate-600 cursor-pointer">
                        <input type="radio" name="approved" value="true" checked={formData.approvedInSectorMeeting === "true"} onChange={e => updateForm("approvedInSectorMeeting", e.target.value)} className="text-orange-500 bg-slate-100 border-slate-300 focus:ring-orange-500/50" />
                        Sim
                      </label>
                      <label className="flex items-center gap-3 text-slate-600 cursor-pointer">
                        <input type="radio" name="approved" value="false" checked={formData.approvedInSectorMeeting === "false"} onChange={e => updateForm("approvedInSectorMeeting", e.target.value)} className="text-orange-500 bg-slate-100 border-slate-300 focus:ring-orange-500/50" />
                        Não
                      </label>
                    </div>

                    {formData.approvedInSectorMeeting !== "" && (
                      <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl animate-in fade-in zoom-in-95 duration-200 grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Data da reunião</label>
                          <input type="date" value={formData.meetingDate} onChange={e => updateForm("meetingDate", e.target.value)} className="input-glass" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Localidade</label>
                          <input type="text" value={formData.meetingLocality} onChange={e => updateForm("meetingLocality", e.target.value)} className="input-glass" placeholder="EX.: COMUM X" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Nome do Ancião</label>
                          <input type="text" value={formData.meetingElderName} onChange={e => updateForm("meetingElderName", e.target.value)} className="input-glass" placeholder="NOME COMPLETO" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Etapa 3: MSA */}
        {step === 3 && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4 sm:mb-6">Programa Mínimo (Hinário, Método e MSA)</h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                <input 
                  type="radio" 
                  name="msa" 
                  value="COMPLETO" 
                  checked={formData.msaStatus === "COMPLETO"}
                  onChange={e => updateForm("msaStatus", e.target.value)}
                  className="w-5 h-5 text-orange-500 bg-slate-100 border-slate-300 focus:ring-orange-500/50"
                />
                <span className="text-slate-600">Completou todo programa mínimo oficial</span>
              </label>

              <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                <input 
                  type="radio" 
                  name="msa" 
                  value="INCOMPLETO" 
                  checked={formData.msaStatus === "INCOMPLETO"}
                  onChange={e => updateForm("msaStatus", e.target.value)}
                  className="w-5 h-5 text-orange-500 bg-slate-100 border-slate-300 focus:ring-orange-500/50"
                />
                <span className="text-slate-600">Incompleto</span>
              </label>
            </div>

            {formData.msaStatus === "INCOMPLETO" && (
              <div className="mt-6 animate-in fade-in zoom-in-95 duration-200">
                <label className="block text-sm font-medium text-orange-400 mb-1">Justificativa do programa incompleto</label>
                <textarea 
                  value={formData.msaJustification} 
                  onChange={e => updateForm("msaJustification", e.target.value)} 
                  className="input-glass min-h-[100px] resize-y" 
                  placeholder="Explique o motivo..."
                />
              </div>
            )}
          </div>
        )}

        {/* Etapa 4: Confirmação */}
        {step === 4 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4 sm:mb-6">Confirmação de Dados</h3>
            
            <div className="bg-slate-100 border border-slate-200 rounded-xl p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-4">
                <div>
                  <p className="text-slate-500">Candidato(a)</p>
                  <p className="text-slate-600 font-medium">{formData.candidateName || "-"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Sexo</p>
                  <p className="text-slate-600 font-medium">{formData.gender === "M" ? "Masculino" : formData.gender === "F" ? "Feminino" : "-"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Setor</p>
                  <p className="text-slate-600 font-medium">{sectors.find(s => s.id === formData.sectorId)?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Congregação</p>
                  <p className="text-slate-600 font-medium">{churches.find(c => c.id === formData.churchId)?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Instrumento</p>
                  <p className="text-slate-600 font-medium">{instruments.find(i => i.id === formData.instrumentId)?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Encarregado Resp.</p>
                  <p className="text-slate-600 font-medium">{personInCharges.find(p => p.id === formData.personInChargeId)?.fullName || "-"}</p>
                </div>
              </div>

              {formData.gender === "F" && (
                <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <p className="text-slate-500">Instrutora</p>
                    <p className="text-slate-600 font-medium">{formData.instructorName || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Igreja da Instrutora</p>
                    <p className="text-slate-600 font-medium">
                      {formData.instructorChurchId === "OUTRA" 
                        ? formData.instructorChurchName 
                        : churches.find(c => c.id === formData.instructorChurchId)?.name || "-"}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-4">
                <div>
                  <p className="text-slate-500">Tipo de Teste</p>
                  <p className="text-slate-600 font-medium">{testTypes.find(t => t.id === formData.testTypeId)?.name || "-"}</p>
                </div>
              </div>

              <div>
                <p className="text-slate-500">Programa Mínimo</p>
                <p className="text-slate-600 font-medium">
                  {formData.msaStatus === "COMPLETO" ? "Completo" : "Incompleto"}
                </p>
                {formData.msaStatus === "INCOMPLETO" && (
                  <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-xs uppercase font-semibold mb-1">Justificativa</p>
                    <p className="text-slate-600">{formData.msaJustification || "Não informada"}</p>
                  </div>
                )}
              </div>
            </div>

            <p className="text-slate-500 text-sm text-center">
              Revise os dados acima. Se estiver tudo correto, clique em confirmar para finalizar o pedido de pré-avaliação.
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-10 pt-6 border-t border-slate-200">
        <button 
          onClick={handleBack} 
          disabled={step === 1 || isLoading}
          className="px-6 py-2 rounded-lg text-slate-600 font-medium hover:bg-slate-100 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" /> Voltar
        </button>

        {step < 4 ? (
          <button 
            onClick={handleNext}
            className="btn-primary flex items-center gap-2 px-8"
          >
            Próximo <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="btn-primary bg-green-600 hover:bg-green-700 shadow-green-500/30 flex items-center gap-2 px-8"
          >
            {isLoading ? "Salvando..." : (
              <>Confirmar Cadastro <CheckCircle2 className="w-5 h-5" /></>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
