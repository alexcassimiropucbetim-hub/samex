"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Church, ChevronDown, Check, Loader2 } from "lucide-react";
import { switchActiveChurch } from "@/actions/auth-actions";
import { useRouter } from "next/navigation";
import clsx from "clsx";

type ChurchItem = {
  id: string;
  name: string;
  isPrimary?: boolean;
  sector?: { name: string } | null;
};

type ChurchSwitcherProps = {
  churches: ChurchItem[];
  activeChurchId: string;
  isSidebar?: boolean;
};

export function ChurchSwitcher({ churches, activeChurchId, isSidebar = false }: ChurchSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const activeChurch = churches.find((c) => c.id === activeChurchId) || churches[0];

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fechar no Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelect = (churchId: string) => {
    if (churchId === activeChurchId || isPending) {
      setIsOpen(false);
      return;
    }

    startTransition(async () => {
      try {
        await switchActiveChurch(churchId);
        setIsOpen(false);
        router.refresh();
      } catch (err: any) {
        alert(err?.message || "Erro ao trocar de congregação.");
      }
    });
  };

  // Se o encarregado tiver apenas 1 igreja, mostra apenas um selo informativo
  if (churches.length <= 1) {
    if (isSidebar) {
      return (
        <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
          <Church className="w-4 h-4 text-orange-500 shrink-0" />
          <span className="truncate uppercase font-semibold">{activeChurch?.name || "Congregação"}</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 px-3.5 py-2 bg-white/90 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 shadow-sm">
        <Church className="w-4 h-4 text-orange-500 shrink-0" />
        <span className="truncate uppercase">{activeChurch?.name || "Congregação"}</span>
      </div>
    );
  }

  // Se tiver mais de 1 igreja, exibe o seletor interativo com dropdown
  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={clsx(
          "flex items-center justify-between gap-2.5 transition-all duration-200 text-left font-medium",
          isSidebar
            ? "w-full px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs text-xs text-slate-800"
            : "px-3.5 py-2 bg-white hover:bg-slate-50/80 border border-slate-200/90 rounded-xl shadow-sm text-xs text-slate-800",
          isOpen && "ring-2 ring-orange-500/20 border-orange-500",
          isPending && "opacity-70 cursor-wait"
        )}
        title="Alternar Congregação"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Church className="w-3.5 h-3.5" />
            )}
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] text-slate-400 font-semibold uppercase leading-tight">
              Congregação Ativa
            </span>
            <span className="block font-bold text-slate-800 truncate uppercase leading-tight max-w-[160px] sm:max-w-[200px]">
              {activeChurch?.name || "Selecione..."}
            </span>
          </div>
        </div>
        <ChevronDown
          className={clsx(
            "w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0",
            isOpen && "rotate-180 text-orange-500"
          )}
        />
      </button>

      {isOpen && (
        <div
          className={clsx(
            "absolute z-50 mt-1.5 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-150",
            isSidebar ? "left-0" : "right-0 md:left-0 md:right-auto"
          )}
        >
          <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Suas Congregações ({churches.length})
            </span>
            <span className="text-[10px] text-orange-600 font-medium">Troca rápida</span>
          </div>

          <div className="max-h-64 overflow-y-auto p-1.5 space-y-1">
            {churches.map((church) => {
              const isSelected = church.id === activeChurchId;
              return (
                <button
                  key={church.id}
                  type="button"
                  onClick={() => handleSelect(church.id)}
                  disabled={isPending}
                  className={clsx(
                    "w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between gap-2 transition-all duration-150",
                    isSelected
                      ? "bg-orange-50/90 text-orange-950 font-bold border border-orange-200/80 shadow-xs"
                      : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent font-medium"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={clsx(
                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                        isSelected
                          ? "bg-orange-500 text-white"
                          : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                      )}
                    >
                      <Church className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate uppercase leading-tight">{church.name}</span>
                        {church.isPrimary && (
                          <span className="text-[9px] bg-slate-200/80 text-slate-600 px-1.5 py-0.2 rounded font-semibold uppercase shrink-0">
                            Sede
                          </span>
                        )}
                      </div>
                      {church.sector?.name && (
                        <span className="text-[10px] text-slate-400 block truncate mt-0.5 font-normal">
                          Setor: {church.sector.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
