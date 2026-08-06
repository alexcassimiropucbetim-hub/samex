"use client";

import { Search, Bell, MapPin, ChevronDown } from "lucide-react";

export function DashboardHeader({ name, date, weekday }: { name: string, date: string, weekday: string }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          A Paz de Deus, {name}!
        </h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Hoje é {weekday}, {date}.
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Global Search */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Pesquisar..." 
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64 shadow-sm"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors shadow-sm text-slate-500">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Region Selector */}
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors shadow-sm">
          <MapPin className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-bold text-slate-700">Regional Sul</span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </div>
  );
}
