"use client";

import { motion } from "framer-motion";
import { FileCheck2, BarChart3, PieChart, ChevronRight, FileText, Music2, MapPin, Search } from "lucide-react";
import Link from "next/link";

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

  const sectorTotal = sectorsData.reduce((acc, curr) => acc + curr.count, 0);
  const categoryTotal = categoriesData.reduce((acc, curr) => acc + curr.count, 0);
  const testTypeTotal = testTypesData.reduce((acc, curr) => acc + curr.count, 0);

  const categoryColors = [
    { text: "text-orange-500", bg: "bg-orange-50", fill: "bg-orange-500" },
    { text: "text-pink-500", bg: "bg-pink-50", fill: "bg-pink-500" },
    { text: "text-purple-500", bg: "bg-purple-50", fill: "bg-purple-500" },
    { text: "text-yellow-500", bg: "bg-yellow-50", fill: "bg-yellow-500" },
    { text: "text-blue-500", bg: "bg-blue-50", fill: "bg-blue-500" },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
      
      {/* Card 1: Por Setor (Azul) */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
            <FileCheck2 className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-[17px] font-bold text-[#0B1B3D] leading-tight">Pré-Avaliações por Setor</h3>
            <p className="text-[12px] text-slate-500 mt-1">Distribuição de pré-avaliações por setor</p>
          </div>
        </div>
        
        <div className="flex justify-end mb-6">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold">
            <BarChart3 className="w-3.5 h-3.5" />
            Total: {sectorTotal}
          </div>
        </div>

        <div className="flex-1 space-y-5">
          {sectorsData.map((item, index) => {
            const percent = sectorTotal > 0 ? ((item.count / sectorTotal) * 100).toFixed(1) : "0.0";
            return (
              <div key={item.name} className="group">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                    <FileCheck2 className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] font-bold text-[#0B1B3D] uppercase">{item.name}</span>
                      <div className="text-right">
                        <span className="text-xl font-black text-blue-600 leading-none block">{item.count}</span>
                        <span className="text-[10px] font-bold text-slate-500">{percent}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.count / maxSectorCount) * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                    className="bg-blue-600 h-full rounded-full"
                  />
                </div>
              </div>
            );
          })}
          {sectorsData.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-4">Nenhum dado encontrado.</p>
          )}
        </div>

        <div className="mt-8 pt-2">
          <Link href="/portal/pre-avaliacao" className="flex items-center justify-between w-full bg-blue-50 hover:bg-blue-100 transition-colors rounded-xl py-3 px-4 text-blue-600 font-bold text-[13px]">
            <div className="flex items-center gap-2 mx-auto">
              <PieChart className="w-4 h-4" />
              Ver relatório completo
            </div>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Card 2: Por Categoria (Laranja/Multicolor) */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100">
            <FileCheck2 className="w-6 h-6 text-orange-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-[17px] font-bold text-[#0B1B3D] leading-tight">Pré-Avaliações por Categoria</h3>
            <p className="text-[12px] text-slate-500 mt-1">Distribuição de pré-avaliações por categoria</p>
          </div>
        </div>
        
        <div className="flex justify-end mb-6">
          <div className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg text-xs font-bold">
            <BarChart3 className="w-3.5 h-3.5" />
            Total: {categoryTotal}
          </div>
        </div>

        <div className="flex-1 space-y-5">
          {categoriesData.map((item, index) => {
            const percent = categoryTotal > 0 ? ((item.count / categoryTotal) * 100).toFixed(1) : "0.0";
            const color = categoryColors[index % categoryColors.length];
            return (
              <div key={item.name} className="group">
                <div className="flex items-center gap-4 mb-3">
                  <div className={`w-10 h-10 rounded-full ${color.bg} flex items-center justify-center shrink-0 border border-white/50 shadow-sm`}>
                    <Music2 className={`w-5 h-5 ${color.text}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] font-bold text-[#0B1B3D] uppercase">{item.name}</span>
                      <div className="text-right">
                        <span className={`text-xl font-black ${color.text} leading-none block`}>{item.count}</span>
                        <span className="text-[10px] font-bold text-slate-500">{percent}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.count / maxCategoryCount) * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                    className={`${color.fill} h-full rounded-full`}
                  />
                </div>
              </div>
            );
          })}
          {categoriesData.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-4">Nenhum dado encontrado.</p>
          )}
        </div>

        <div className="mt-8 pt-2">
          <Link href="/portal/pre-avaliacao" className="flex items-center justify-between w-full bg-orange-50 hover:bg-orange-100 transition-colors rounded-xl py-3 px-4 text-orange-600 font-bold text-[13px]">
            <div className="flex items-center gap-2 mx-auto">
              <PieChart className="w-4 h-4" />
              Ver relatório completo
            </div>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Card 3: Por Tipo de Teste (Verde) */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
            <FileCheck2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-[17px] font-bold text-[#0B1B3D] leading-tight">Pré-Avaliações por Tipo de Teste</h3>
            <p className="text-[12px] text-slate-500 mt-1">Distribuição de pré-avaliações por tipo de teste</p>
          </div>
        </div>
        
        <div className="flex justify-end mb-6">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold">
            <BarChart3 className="w-3.5 h-3.5" />
            Total: {testTypeTotal}
          </div>
        </div>

        <div className="flex-1 space-y-5">
          {testTypesData.map((item, index) => {
            const percent = testTypeTotal > 0 ? ((item.count / testTypeTotal) * 100).toFixed(1) : "0.0";
            return (
              <div key={item.name} className="group">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                    <FileCheck2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] font-bold text-[#0B1B3D] uppercase">{item.name}</span>
                      <div className="text-right">
                        <span className="text-xl font-black text-emerald-600 leading-none block">{item.count}</span>
                        <span className="text-[10px] font-bold text-slate-500">{percent}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.count / maxTestTypeCount) * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                    className="bg-emerald-600 h-full rounded-full"
                  />
                </div>
              </div>
            );
          })}
          {testTypesData.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-4">Nenhum dado encontrado.</p>
          )}
        </div>

        <div className="mt-8 pt-2">
          <Link href="/portal/pre-avaliacao" className="flex items-center justify-between w-full bg-emerald-50 hover:bg-emerald-100 transition-colors rounded-xl py-3 px-4 text-emerald-700 font-bold text-[13px]">
            <div className="flex items-center gap-2 mx-auto">
              <PieChart className="w-4 h-4" />
              Ver relatório completo
            </div>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

    </div>
  );
}
