"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { UserPen, X, Save, Loader2, AlertCircle } from "lucide-react";
import { updateCandidateBasicData, getCandidateEditOptions } from "@/actions/testDetails";
import SearchableSelect from "./SearchableSelect";

interface EditCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: any;
  onSaved?: (updatedCandidate: any) => void;
  initialOptions?: {
    sectors?: any[];
    churches?: any[];
    instruments?: any[];
    testTypes?: any[];
  };
}

export default function EditCandidateModal({
  isOpen,
  onClose,
  candidate,
  onSaved,
  initialOptions,
}: EditCandidateModalProps) {
  const [mounted, setMounted] = useState(false);
  const [candidateName, setCandidateName] = useState("");
  const [gender, setGender] = useState("M");
  const [churchId, setChurchId] = useState("");
  const [sectorId, setSectorId] = useState("");
  const [instrumentId, setInstrumentId] = useState("");
  const [testTypeId, setTestTypeId] = useState("");

  const [options, setOptions] = useState<{
    sectors: any[];
    churches: any[];
    instruments: any[];
    testTypes: any[];
  }>({
    sectors: initialOptions?.sectors || [],
    churches: initialOptions?.churches || [],
    instruments: initialOptions?.instruments || [],
    testTypes: initialOptions?.testTypes || [],
  });

  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Bloquear rolagem do body quando o modal estiver aberto
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Inicializar dados do candidato quando o modal abrir
  useEffect(() => {
    if (candidate && isOpen) {
      setCandidateName(candidate.candidateName || "");
      setGender(candidate.gender || "M");
      const cId = candidate.churchId || candidate.church?.id || "";
      const sId = candidate.sectorId || candidate.sector?.id || "";
      setChurchId(cId);
      setSectorId(sId);
      setInstrumentId(candidate.instrumentId || candidate.instrument?.id || "");
      setTestTypeId(candidate.testTypeId || candidate.testType?.id || "");
      setError(null);
    }
  }, [candidate, isOpen]);

  // Carregar opções se não foram passadas ou estiverem vazias
  useEffect(() => {
    if (isOpen && options.churches.length === 0) {
      setIsLoadingOptions(true);
      getCandidateEditOptions()
        .then((res) => {
          setOptions({
            sectors: res.sectors || [],
            churches: res.churches || [],
            instruments: res.instruments || [],
            testTypes: res.testTypes || [],
          });
        })
        .catch((err) => {
          console.error("Erro ao carregar opções:", err);
          setError("Não foi possível carregar as opções de igrejas e instrumentos.");
        })
        .finally(() => {
          setIsLoadingOptions(false);
        });
    }
  }, [isOpen, options.churches.length]);

  // Fechar no Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !isSaving) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSaving, onClose]);

  // Quando trocar a igreja, sincronizar automaticamente o setor correspondente
  const handleChurchChange = (newChurchId: string) => {
    setChurchId(newChurchId);
    if (newChurchId) {
      const selectedChurch = options.churches.find((c) => c.id === newChurchId);
      if (selectedChurch?.sectorId) {
        setSectorId(selectedChurch.sectorId);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidate?.id) return;

    if (!candidateName.trim()) {
      setError("O nome do candidato é obrigatório.");
      return;
    }
    if (!churchId) {
      setError("Selecione a congregação.");
      return;
    }
    if (!instrumentId) {
      setError("Selecione o instrumento.");
      return;
    }
    if (!testTypeId) {
      setError("Selecione o tipo de teste.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const res = await updateCandidateBasicData({
        candidateId: candidate.id,
        candidateName: candidateName.trim().toUpperCase(),
        gender,
        churchId,
        sectorId,
        instrumentId,
        testTypeId,
      });

      if (res && res.success) {
        if (onSaved) {
          onSaved(res.candidate);
        }
        onClose();
      } else {
        setError("Não foi possível salvar as alterações.");
      }
    } catch (err: any) {
      setError(err?.message || "Ocorreu um erro ao salvar os dados.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      onClick={() => !isSaving && onClose()}
    >
      <div 
        className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl my-auto animate-in zoom-in-95 duration-150 overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
              <UserPen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Editar Dados do Candidato
              </h3>
              <p className="text-xs text-slate-400">
                Altera e atualiza os dados diretamente no cadastro geral.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {isLoadingOptions && (
            <div className="flex items-center justify-center gap-2 py-3 text-xs text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              Carregando opções...
            </div>
          )}

          {/* Nome do Candidato */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Nome do Candidato *
            </label>
            <input
              type="text"
              required
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="Nome completo..."
              className="input-glass uppercase font-medium text-sm w-full py-2"
              autoFocus
            />
          </div>

          {/* Grid: Sexo e Setor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <SearchableSelect
                label="Sexo *"
                value={gender}
                onChange={(val) => setGender(val)}
                searchable={false}
                options={[
                  { value: "M", label: "Masculino" },
                  { value: "F", label: "Feminino" },
                ]}
              />
            </div>

            <div>
              <SearchableSelect
                label="Setor *"
                value={sectorId}
                onChange={(val) => setSectorId(val)}
                placeholder="Selecione o setor..."
                searchPlaceholder="Pesquisar setor..."
                options={options.sectors.map((s) => ({
                  value: s.id,
                  label: s.name,
                }))}
              />
            </div>
          </div>

          {/* Congregação / Igreja */}
          <div>
            <SearchableSelect
              label="Congregação / Igreja *"
              value={churchId}
              onChange={handleChurchChange}
              placeholder="Selecione a congregação..."
              searchPlaceholder="Pesquisar igreja ou setor..."
              uppercase
              options={options.churches.map((c) => ({
                value: c.id,
                label: c.name,
                sublabel: c.sector?.name,
              }))}
            />
          </div>

          {/* Grid: Instrumento e Tipo de Teste */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <SearchableSelect
                label="Instrumento *"
                value={instrumentId}
                onChange={(val) => setInstrumentId(val)}
                placeholder="Selecione o instrumento..."
                searchPlaceholder="Pesquisar instrumento..."
                uppercase
                options={options.instruments.map((i) => ({
                  value: i.id,
                  label: i.name,
                }))}
              />
            </div>

            <div>
              <SearchableSelect
                label="Tipo de Teste *"
                value={testTypeId}
                onChange={(val) => setTestTypeId(val)}
                placeholder="Selecione o tipo..."
                searchPlaceholder="Pesquisar tipo..."
                uppercase
                options={options.testTypes.map((t) => ({
                  value: t.id,
                  label: t.name,
                }))}
              />
            </div>
          </div>

          {/* Rodapé / Ações */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary flex items-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-xl disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar no Cadastro Geral
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
