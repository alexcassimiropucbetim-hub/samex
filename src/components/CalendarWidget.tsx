"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import clsx from "clsx";

interface CalendarEvent {
  id: string;
  date: Date;
  type?: string;
}

export function CalendarWidget({ events = [] }: { events?: CalendarEvent[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // Extract event days per type (for the dots)
  const eventDays = events.reduce((acc, e) => {
    const d = new Date(e.date);
    if (d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()) {
      const day = d.getDate();
      if (!acc[day]) acc[day] = [];
      acc[day].push(e.type || "ensaio");
    }
    return acc;
  }, {} as Record<number, string[]>);

  const getDotColor = (types: string[]) => {
    if (types.includes("reuniao")) return "bg-green-500";
    if (types.includes("oficializacao")) return "bg-purple-500";
    if (types.includes("teste")) return "bg-blue-500";
    return "bg-orange-500";
  };

  const renderDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-12 md:h-14 flex items-center justify-center border-b border-r border-slate-100 last:border-r-0">
          <span className="text-slate-300 font-medium text-sm">
            {new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate() - firstDayOfMonth + i + 1}
          </span>
        </div>
      );
    }

    const today = new Date();
    const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();

    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = isCurrentMonth && today.getDate() === i;
      const dayEvents = eventDays[i];
      const hasEvent = !!dayEvents;
      
      const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), i).getDay();
      const isSunday = dayOfWeek === 0;

      days.push(
        <div 
          key={i} 
          className="h-12 md:h-14 flex flex-col items-center justify-center border-b border-r border-slate-100 relative cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <span className={clsx(
            "w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-colors z-10",
            isToday 
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/30" 
              : hasEvent 
                ? "text-orange-500" 
                : "text-slate-700"
          )}>
            {i}
          </span>
          {isToday && (
            <span className="absolute bottom-1 w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
          )}
          {hasEvent && !isToday && (
            <span className={clsx("absolute bottom-1 w-1.5 h-1.5 rounded-full", getDotColor(dayEvents))}></span>
          )}
        </div>
      );
    }
    
    // Empty cells for the end of the month
    const totalCells = days.length;
    const remainingCells = 42 - totalCells; // 6 rows * 7 days
    
    for (let i = 1; i <= remainingCells; i++) {
      days.push(
        <div key={`empty-end-${i}`} className="h-12 md:h-14 flex items-center justify-center border-b border-r border-slate-100 last:border-r-0">
          <span className="text-slate-300 font-medium text-sm">{i}</span>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 border-l-[6px] border-l-blue-600 h-full flex flex-col">
      <div className="flex items-start justify-between mb-8">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-[#0B1B3D] flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#0B1B3D]">
              {monthNames[currentDate.getMonth()]} <span className="text-blue-500">{currentDate.getFullYear()}</span>
            </h3>
            <p className="text-slate-500 text-sm mt-0.5">Selecione uma data para ver os eventos</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl transition-all text-slate-500">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl transition-all text-slate-500">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="border border-slate-100 rounded-2xl overflow-hidden flex-1 flex flex-col">
        <div className="grid grid-cols-7 border-b border-slate-100">
          {dayNames.map((day, i) => (
            <div key={day} className={clsx(
              "text-center py-4 text-xs font-bold uppercase tracking-wider",
              i === 0 ? "text-orange-500" : "text-slate-600"
            )}>
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 flex-1">
          {renderDays()}
        </div>
      </div>

      <div className="mt-6 bg-slate-50 rounded-xl py-4 px-6 flex items-center justify-center gap-8">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          <span className="text-xs font-semibold text-slate-500">Hoje</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          <span className="text-xs font-semibold text-slate-500">Com eventos</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="text-xs font-semibold text-slate-500">Reuniões</span>
        </div>
      </div>
    </div>
  );
}
