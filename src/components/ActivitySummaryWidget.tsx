"use client";

import { motion } from "framer-motion";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChangeEvent } from "react";

interface ActivityData {
  label: string;
  value: number;
  color: string;
}

export function ActivitySummaryWidget({ data, currentYear }: { data: ActivityData[], currentYear: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleYearChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const year = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", year);
    router.push(`${pathname}?${params.toString()}`);
    router.refresh();
  };

  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  let currentAngle = 0;

  // Generate an array of years for the dropdown
  const startYear = 2024; // Base starting year
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: Math.max(thisYear - startYear + 2, 5) }, (_, i) => thisYear + 1 - i).sort((a, b) => b - a);

  return (
    <div className="glass-card p-6 h-full flex flex-col rounded-[18px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">Resumo de Atividades</h3>
        <select 
          value={currentYear}
          onChange={handleYearChange}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-1.5 cursor-pointer outline-none hover:bg-slate-100 transition-colors"
        >
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      
      <div className="flex-1 flex flex-col xl:flex-row items-center justify-center gap-8">
        {/* Donut Chart */}
        <div className="relative w-48 h-48 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {data.map((item, index) => {
              if (item.value === 0) return null;
              
              const percentage = item.value / total;
              const strokeDasharray = `${percentage * 283} 283`; // 2 * PI * r = 2 * 3.14159 * 45 ≈ 283
              const strokeDashoffset = -currentAngle * 283;
              currentAngle += percentage;

              return (
                <motion.circle
                  key={item.label}
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="10"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  initial={{ strokeDasharray: `0 283` }}
                  animate={{ strokeDasharray }}
                  transition={{ duration: 1, delay: index * 0.2, ease: "easeOut" }}
                  className="drop-shadow-sm"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-slate-900">{total}</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3 w-full">
          {data.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm font-medium text-slate-600">{item.label}</span>
              </div>
              <span className="text-sm font-bold text-slate-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
