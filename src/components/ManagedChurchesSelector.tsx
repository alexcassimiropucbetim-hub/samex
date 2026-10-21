"use client";

import { useState, useMemo } from "react";
import { Search, X, Check, Building2, Filter } from "lucide-react";

export interface ChurchOption {
  id: string;
  name: string;
  sector?: {
    id?: string;
    name: string;
  } | null;
}

interface ManagedChurchesSelectorProps {
  churches: ChurchOption[];
  initialSelectedIds?: string[];
}

export default function ManagedChurchesSelector({
  churches,
  initialSelectedIds = [],
}: ManagedChurchesSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [search, setSearch] = useState("");
  const [onlySelected, setOnlySelected] = useState(false);

  // Normalização de texto para busca sem acentos e case-insensitive
  const normalize = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const filteredChurches = useMemo(() => {
    const term = normalize(search.trim());

    return churches.filter((church) => {
      // Filtro de "Apenas selecionadas"
      if (onlySelected && !selectedIds.includes(church.id)) {
        return false;
      }

      // Se não há termo de busca, retorna todos os válidos
      if (!term) return true;

      const nameMatch = normalize(church.name).includes(term);
      const sectorMatch = church.sector?.name
        ? normalize(church.sector.name).includes(term)
        : false;

      return nameMatch || sectorMatch;
    });
  }, [churches, search, onlySelected, selectedIds]);

  const toggleChurch = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClearSearch = () => {
    setSearch("");
  };

  if (churches.length === 0) {
    return (
      <div className="pt-2">
        <label className="block text-sm font-medium text-slate-600 mb-2">
          Igrejas de Atuação (Opcional - Múltiplas)
        </label>
        <p className="text-xs text-amber-500">Cadastre Igrejas primeiro.</p>
      </div>
    );
  }

  return (
    <div className="pt-2 space-y-2">
      {/* Inputs ocultos que garantem o envio no FormData mesmo quando filtrados */}
      {selectedIds.map((id) => (
        <input key={id} type="hidden" name="managedChurchIds" value={id} />
      ))}

      {/* Cabeçalho com label e contador */}
      <div className="flex items-center justify-between gap-2">
        <label className="block text-sm font-medium text-slate-700">
          Igrejas de Atuação (Opcional)
        </label>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
            selectedIds.length > 0
              ? "bg-blue-100 text-blue-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {selectedIds.length}{" "}
          {selectedIds.length === 1 ? "selecionada" : "selecionadas"}
        </span>
      </div>

      <p className="text-[11px] text-slate-400">
        Selecione além da Comum Congregação, quais outras igrejas ele gerencia.
      </p>

      {/* Campo de Pesquisa */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar igreja ou setor..."
          className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all placeholder:text-slate-400 text-slate-800"
        />
        {search && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
            title="Limpar pesquisa"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Barra de Ações Rápidas / Filtros */}
      <div className="flex items-center justify-between text-[11px] px-1 text-slate-500">
        <div className="flex items-center gap-1.5">
          {search && (
            <span>
              {filteredChurches.length}{" "}
              {filteredChurches.length === 1 ? "encontrada" : "encontradas"}
            </span>
          )}
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlySelected((prev) => !prev)}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium transition-colors ${
                onlySelected
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              <Filter className="w-3 h-3" />
              {onlySelected ? "Ver todas" : "Apenas selecionadas"}
            </button>
            {!onlySelected && (
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                Limpar
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lista de Igrejas com scroll */}
      <div className="space-y-1 max-h-48 overflow-y-auto pr-1 custom-scrollbar border border-slate-200 rounded-lg p-2 bg-slate-50/60">
        {filteredChurches.length === 0 ? (
          <div className="py-5 text-center text-slate-400">
            <Building2 className="w-6 h-6 mx-auto mb-1 text-slate-300" />
            <p className="text-xs">
              {onlySelected
                ? "Nenhuma igreja selecionada."
                : search
                ? `Nenhuma igreja encontrada para "${search}".`
                : "Nenhuma igreja disponível."}
            </p>
            {search && !onlySelected && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="mt-1.5 text-xs text-blue-600 hover:underline font-medium"
              >
                Limpar pesquisa
              </button>
            )}
            {onlySelected && (
              <button
                type="button"
                onClick={() => setOnlySelected(false)}
                className="mt-1.5 text-xs text-blue-600 hover:underline font-medium"
              >
                Mostrar todas as igrejas
              </button>
            )}
          </div>
        ) : (
          filteredChurches.map((church) => {
            const isChecked = selectedIds.includes(church.id);
            return (
              <label
                key={church.id}
                className={`flex items-center justify-between gap-2 text-xs sm:text-sm px-2 py-1.5 rounded-md cursor-pointer transition-all select-none ${
                  isChecked
                    ? "bg-blue-50/90 border border-blue-200 text-blue-900 font-medium shadow-xs"
                    : "hover:bg-white text-slate-700 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleChurch(church.id)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/40 cursor-pointer h-4 w-4 shrink-0"
                  />
                  <span className="uppercase truncate" title={church.name}>
                    {church.name}
                  </span>
                </div>
                {church.sector?.name && (
                  <span className="text-[10px] text-slate-400 bg-white/80 border border-slate-200/60 px-1.5 py-0.5 rounded uppercase shrink-0 font-normal">
                    {church.sector.name}
                  </span>
                )}
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}
