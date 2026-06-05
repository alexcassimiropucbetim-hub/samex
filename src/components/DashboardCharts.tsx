"use client";

import { motion } from "framer-motion";

type ChartData = {
  name: string;
  count: number;
};

interface Props {
  sectorsData: ChartData[];
  categoriesData: ChartData[];
  testTypesData: ChartData[];
}

export default function DashboardCharts({ sectorsData, categoriesData, testTypesData }: Props) {
  const maxSectorCount = Math.max(...sectorsData.map(d => d.count), 1);
  const maxCategoryCount = Math.max(...categoriesData.map(d => d.count), 1);
  const maxTestTypeCount = Math.max(...testTypesData.map(d => d.count), 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
      {/* Chart by Sector */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Pré-Avaliações por Setor</h3>
        <div className="space-y-4">
          {sectorsData.map((item, index) => (
            <div key={item.name} className="relative">
              <div className="flex justify-between text-sm font-medium mb-1">
                <span className="text-slate-700">{item.name}</span>
                <span className="text-slate-900 font-bold">{item.count}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.count / maxSectorCount) * 100}%` }}
                  transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full"
                />
              </div>
            </div>
          ))}
          {sectorsData.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-4">Nenhum dado encontrado.</p>
          )}
        </div>
      </div>

      {/* Chart by Category */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Pré-Avaliações por Categoria</h3>
        <div className="space-y-4">
          {categoriesData.map((item, index) => (
            <div key={item.name} className="relative">
              <div className="flex justify-between text-sm font-medium mb-1">
                <span className="text-slate-700">{item.name}</span>
                <span className="text-slate-900 font-bold">{item.count}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.count / maxCategoryCount) * 100}%` }}
                  transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                  className="bg-gradient-to-r from-orange-400 to-pink-500 h-full rounded-full"
                />
              </div>
            </div>
          ))}
          {categoriesData.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-4">Nenhum dado encontrado.</p>
          )}
        </div>
      </div>

      {/* Chart by Test Type */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Pré-Avaliações por Tipo de Teste</h3>
        <div className="space-y-4">
          {testTypesData.map((item, index) => (
            <div key={item.name} className="relative">
              <div className="flex justify-between text-sm font-medium mb-1">
                <span className="text-slate-700">{item.name}</span>
                <span className="text-slate-900 font-bold">{item.count}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.count / maxTestTypeCount) * 100}%` }}
                  transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                  className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full"
                />
              </div>
            </div>
          ))}
          {testTypesData.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-4">Nenhum dado encontrado.</p>
          )}
        </div>
      </div>
    </div>
  );
}
