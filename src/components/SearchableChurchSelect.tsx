"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Church, Search, ChevronDown, Check, X } from "lucide-react";

export interface ChurchSelectOption {
  id: string;
  name: string;
  sector?: {
    id?: string;
    name: string;
  } | null;
}

interface SearchableChurchSelectProps {
  churches: ChurchSelectOption[];
  defaultValue?: string;
  name?: string;
  id?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export default function SearchableChurchSelect({
  churches,
  defaultValue = "",
  name = "churchId",
  id = "churchId",
  label = "Igreja",
  placeholder = "Selecione uma comum...",
  required = true,
}: SearchableChurchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(defaultValue);
  const [search, setSearch] = useState("");
  
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sincroniza se o defaultValue mudar (ex: ao trocar o registro em edição)
  useEffect(() => {
    setSelectedId(defaultValue);
  }, [defaultValue]);

  // Foco automático no input de busca ao abrir o dropdown
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearch("");
    }
  }, [isOpen]);

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fechar ao pressionar Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Normalização para busca sem acentos e minúsculas
  const normalize = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const filteredChurches = useMemo(() => {
    const term = normalize(search.trim());
    if (!term) return churches;

    return churches.filter((church) => {
      const nameMatch = normalize(church.name).includes(term);
      const sectorMatch = church.sector?.name
        ? normalize(church.sector.name).includes(term)
        : false;
      return nameMatch || sectorMatch;
    });
  }, [churches, search]);

  const selectedChurch = churches.find((c) => c.id === selectedId);

  const handleSelect = (churchId: string) => {
    setSelectedId(churchId);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedId("");
  };

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-600 mb-1">
          {label}
        </label>
      )}

      {/* Input oculto real que envia o valor no FormData */}
      <input type="hidden" name={name} value={selectedId} />

      {/* Input invisível para validação nativa de HTML5 (ex: required) sem quebrar o layout */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        style={{
          opacity: 0,
          width: 0,
          height: 0,
          position: "absolute",
          pointerEvents: "none",
          left: 0,
          bottom: 0,
        }}
        value={selectedId}
        required={required}
        onChange={() => {}}
      />

      {/* Botão Gatilho do Dropdown */}
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className={`input-glass text-left flex items-center justify-between gap-2 py-2 px-3.5 transition-all ${
          isOpen ? "ring-2 ring-blue-500/30 border-blue-500" : ""
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Church className={`w-4 h-4 shrink-0 transition-colors ${selectedChurch ? "text-blue-500" : "text-slate-400"}`} />
          {selectedChurch ? (
            <span className="font-medium text-slate-800 uppercase truncate text-sm">
              {selectedChurch.name}
            </span>
          ) : (
            <span className="text-slate-400 text-sm">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {selectedChurch && (
            <span
              onClick={handleClear}
              className="p-0.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Limpar seleção"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-blue-500" : ""
            }`}
          />
        </div>
      </button>

      {/* Painel Dropdown Flutuante com Pesquisa */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Campo de Busca no Topo do Dropdown */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/70">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar igreja ou setor..."
                className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all placeholder:text-slate-400 text-slate-800"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
                  title="Limpar busca"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {search && (
              <p className="text-[11px] text-slate-400 mt-1 px-1">
                {filteredChurches.length}{" "}
                {filteredChurches.length === 1 ? "igreja encontrada" : "igrejas encontradas"}
              </p>
            )}
          </div>

          {/* Lista com Rolagem */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
            {filteredChurches.length === 0 ? (
              <div className="py-6 text-center text-slate-400">
                <Church className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                <p className="text-xs">Nenhuma igreja encontrada para "{search}".</p>
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-1 text-xs text-blue-600 hover:underline font-medium"
                >
                  Limpar busca
                </button>
              </div>
            ) : (
              filteredChurches.map((church) => {
                const isSelected = church.id === selectedId;
                return (
                  <button
                    key={church.id}
                    type="button"
                    onClick={() => handleSelect(church.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm flex items-center justify-between gap-2 transition-all ${
                      isSelected
                        ? "bg-blue-50 text-blue-900 font-semibold border border-blue-200"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-transparent font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="uppercase truncate" title={church.name}>
                        {church.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {church.sector?.name && (
                        <span className="text-[10px] text-slate-400 bg-slate-100 border border-slate-200/60 px-1.5 py-0.5 rounded uppercase font-normal">
                          {church.sector.name}
                        </span>
                      )}
                      {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
