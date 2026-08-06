"use client";

import { useState } from "react";
import { Calendar, Music, Users, ShieldCheck, ChevronDown, ChevronUp, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

interface EventItem {
  id: string;
  title: string;
  date: Date;
  type: string;
  description?: string | null;
}

export function NextEventsWidget({ events }: { events: EventItem[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "teste": return <ShieldCheck className="w-5 h-5 text-white" />;
      case "ensaio": return <Music className="w-5 h-5 text-white" />;
      case "reuniao": return <Users className="w-5 h-5 text-white" />;
      case "oficializacao": return <Calendar className="w-5 h-5 text-white" />;
      default: return <Calendar className="w-5 h-5 text-white" />;
    }
  };

  const getTheme = (type: string) => {
    switch (type) {
      case "teste": return { bg: "bg-blue-500", border: "border-l-blue-500" };
      case "ensaio": return { bg: "bg-orange-500", border: "border-l-orange-500" };
      case "reuniao": return { bg: "bg-green-500", border: "border-l-green-500" };
      case "oficializacao": return { bg: "bg-purple-500", border: "border-l-purple-500" };
      default: return { bg: "bg-slate-500", border: "border-l-slate-500" };
    }
  };

  return (
    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="flex gap-4 mb-6 shrink-0">
        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-[#0B1B3D]">Próximos Eventos</h3>
          <p className="text-slate-500 text-sm mt-0.5">Confira os próximos compromissos</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-1 custom-scrollbar">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 py-8">
            <Calendar className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm">Nenhum evento próximo</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pb-2">
            {events.map((event) => {
              const isExpanded = expandedId === event.id;
              const theme = getTheme(event.type);
              
              return (
                <div 
                  key={event.id}
                  className={clsx(
                    "flex flex-col bg-white border border-slate-100 border-l-[4px] rounded-xl shadow-sm transition-all cursor-pointer hover:shadow-md",
                    theme.border,
                    isExpanded ? "ring-2 ring-slate-100" : ""
                  )}
                  onClick={() => toggleExpand(event.id)}
                >
                  <div className="flex items-center gap-4 p-4">
                    <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm", theme.bg)}>
                      {getIcon(event.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-[#0B1B3D] uppercase tracking-wide truncate">{event.title}</h4>
                      
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" /> 
                          {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(event.date))}
                        </div>
                        <span className="text-slate-300">|</span>
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> 
                          {new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' }).format(new Date(event.date))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="shrink-0 text-slate-400 pl-2">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                  
                  {isExpanded && event.description && (
                    <div className="px-4 pb-4 pt-1 ml-[4.5rem] text-sm text-slate-600 animate-in fade-in slide-in-from-top-2 duration-200 border-t border-slate-50 mt-1">
                      {event.description}
                    </div>
                  )}
                  {isExpanded && !event.description && (
                    <div className="px-4 pb-4 pt-1 ml-[4.5rem] text-xs italic text-slate-400 animate-in fade-in slide-in-from-top-2 duration-200 border-t border-slate-50 mt-1">
                      Sem descrição adicional.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-4 shrink-0 border-t border-transparent">
        <Link href="/portal/eventos" className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-blue-600 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors">
          <Calendar className="w-5 h-5" /> Ver agenda completa <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
