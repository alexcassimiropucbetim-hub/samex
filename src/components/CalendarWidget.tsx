"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarEvent {
  id: string;
  date: Date;
}

export function CalendarWidget({ events = [] }: { events?: CalendarEvent[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const eventDays = events
    .filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    })
    .map(e => new Date(e.date).getDate());

  const renderDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 md:h-10"></div>);
    }

    const today = new Date();
    const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();

    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = isCurrentMonth && today.getDate() === i;
      const hasEvent = eventDays.includes(i);

      days.push(
        <div 
          key={i} 
          className="h-8 md:h-10 flex items-center justify-center relative cursor-pointer group"
        >
          <span className={`
            w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full text-xs md:text-sm font-medium transition-colors
            ${isToday ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30" : "text-slate-700 group-hover:bg-slate-100"}
          `}>
            {i}
          </span>
          {hasEvent && !isToday && (
            <span className="absolute bottom-1 w-1 h-1 bg-orange-400 rounded-full"></span>
          )}
          {hasEvent && isToday && (
            <span className="absolute bottom-1 w-1 h-1 bg-white rounded-full"></span>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="glass-card p-6 rounded-[18px] h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 flex-1 content-start">
        {renderDays()}
      </div>
    </div>
  );
}
