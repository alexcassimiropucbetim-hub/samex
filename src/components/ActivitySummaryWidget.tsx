"use client";

import { motion } from "framer-motion";

interface ActivityData {
  label: string;
  value: number;
  color: string;
}

export function ActivitySummaryWidget({ data }: { data: ActivityData[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  let currentAngle = 0;

  return (
    <div className="glass-card p-6 h-full flex flex-col rounded-[18px]">
      <h3 className="text-lg font-bold text-slate-900 mb-6">Resumo de Atividades</h3>
      
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
