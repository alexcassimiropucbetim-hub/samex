"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  id?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  uppercase?: boolean;
  searchPlaceholder?: string;
  searchable?: boolean;
  icon?: React.ReactNode;
}

export default function SearchableSelect({
  options,
  defaultValue = "",
  value,
  onChange,
  name,
  id,
  label,
  placeholder = "Selecione uma opção...",
  required = false,
  disabled = false,
  className = "",
  uppercase = false,
  searchPlaceholder = "Pesquisar...",
  searchable,
  icon,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [search, setSearch] = useState("");

  const showSearch = searchable !== undefined ? searchable : options.length >= 5;

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sincroniza defaultValue se mudar
  useEffect(() => {
    if (!isControlled) {
      setInternalValue(defaultValue);
    }
  }, [defaultValue, isControlled]);

  // Foco automático no campo de pesquisa ao abrir (se pesquisa estiver ativa)
  useEffect(() => {
    if (isOpen && showSearch) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearch("");
    }
  }, [isOpen, showSearch]);

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

  // Normalização para busca sem acentos e case-insensitive
  const normalize = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const filteredOptions = useMemo(() => {
    const term = normalize(search.trim());
    if (!term) return options;

    return options.filter((opt) => {
      const labelMatch = normalize(opt.label).includes(term);
      const sublabelMatch = opt.sublabel
        ? normalize(opt.sublabel).includes(term)
        : false;
      return labelMatch || sublabelMatch;
    });
  }, [options, search]);

  const selectedOption = options.find((opt) => opt.value === currentValue);

  const handleSelect = (val: string) => {
    if (!isControlled) {
      setInternalValue(val);
    }
    if (onChange) {
      onChange(val);
    }
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isControlled) {
      setInternalValue("");
    }
    if (onChange) {
      onChange("");
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-600 mb-1">
          {label}
        </label>
      )}

      {/* Input oculto real enviado no FormData */}
      {name && <input type="hidden" name={name} value={currentValue} />}

      {/* Input invisível para validação nativa de required pelo navegador */}
      {name && (
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
          value={currentValue}
          required={required}
          onChange={() => {}}
        />
      )}

      {/* Botão Gatilho do Dropdown */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`input-glass text-left flex items-center justify-between gap-2 py-2 px-3.5 transition-all ${
          disabled ? "opacity-60 cursor-not-allowed bg-slate-100" : "cursor-pointer"
        } ${isOpen ? "ring-2 ring-blue-500/30 border-blue-500" : ""}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {icon && <div className="shrink-0 text-slate-400">{icon}</div>}
          {selectedOption ? (
            <span
              className={`font-medium text-slate-800 truncate text-sm ${
                uppercase ? "uppercase" : ""
              }`}
            >
              {selectedOption.label}
            </span>
          ) : (
            <span className="text-slate-400 text-sm">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {selectedOption && !disabled && (
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
      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Campo de Busca no Topo do Dropdown (exibido quando showSearch é verdadeiro) */}
          {showSearch && (
            <div className="p-2 border-b border-slate-100 bg-slate-50/70">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
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
                  {filteredOptions.length}{" "}
                  {filteredOptions.length === 1 ? "opção encontrada" : "opções encontradas"}
                </p>
              )}
            </div>
          )}

          {/* Lista com Rolagem */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-slate-400">
                <p className="text-xs">Nenhuma opção encontrada para "{search}".</p>
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-1 text-xs text-blue-600 hover:underline font-medium"
                >
                  Limpar busca
                </button>
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === currentValue;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm flex items-center justify-between gap-2 transition-all ${
                      isSelected
                        ? "bg-blue-50 text-blue-900 font-semibold border border-blue-200"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-transparent font-medium"
                    }`}
                  >
                    <span
                      className={`truncate ${uppercase ? "uppercase" : ""}`}
                      title={opt.label}
                    >
                      {opt.label}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {opt.sublabel && (
                        <span className="text-[10px] text-slate-400 bg-slate-100 border border-slate-200/60 px-1.5 py-0.5 rounded uppercase font-normal">
                          {opt.sublabel}
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
