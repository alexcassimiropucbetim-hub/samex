"use client";

import { useState } from "react";
import { Calendar, Music, Users, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
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
      case "teste": return <ShieldCheck className="w-5 h-5 text-blue-500" />;
      case "ensaio": return <Music className="w-5 h-5 text-orange-500" />;
      case "reuniao": return <Users className="w-5 h-5 text-emerald-500" />;
      case "oficializacao": return <Calendar className="w-5 h-5 text-purple-500" />;
      default: return <Calendar className="w-5 h-5 text-slate-500" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case "teste": return "bg-blue-500/10 border-blue-500/20";
      case "ensaio": return "bg-orange-500/10 border-orange-500/20";
      case "reuniao": return "bg-emerald-500/10 border-emerald-500/20";
      case "oficializacao": return "bg-purple-500/10 border-purple-500/20";
      default: return "bg-slate-100 border-slate-200";
    }
  };

  return (
    <div className="glass-card flex flex-col rounded-[18px] h-full overflow-hidden">
      <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Próximos Eventos</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 py-8">
            <Calendar className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm">Nenhum evento próximo</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {events.map((event) => {
              const isExpanded = expandedId === event.id;
              
              return (
                <div 
                  key={event.id}
                  className={clsx(
                    "flex flex-col p-3 rounded-xl transition-colors cursor-pointer border",
                    isExpanded ? "bg-slate-50 border-slate-200" : "hover:bg-slate-50 border-transparent"
                  )}
                  onClick={() => toggleExpand(event.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${getBg(event.type)}`}>
                      {getIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 truncate">{event.title}</h4>
                      <p className="text-xs font-medium text-slate-500">
                        {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(event.date))}
                      </p>
                    </div>
                    <div className="shrink-0 text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                  
                  {isExpanded && event.description && (
                    <div className="mt-3 pl-14 pr-2 pb-2 text-sm text-slate-600 animate-in fade-in slide-in-from-top-2 duration-200">
                      {event.description}
                    </div>
                  )}
                  {isExpanded && !event.description && (
                    <div className="mt-3 pl-14 pr-2 pb-2 text-xs italic text-slate-400 animate-in fade-in slide-in-from-top-2 duration-200">
                      Sem descrição adicional.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
