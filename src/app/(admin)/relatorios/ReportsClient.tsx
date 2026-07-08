"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Users, FileSignature, Music, Church, MapPin, CalendarDays, Filter } from "lucide-react";
import clsx from "clsx";

type MetricData = {
  name: string;
  value: number;
};

type SectorMonthData = Record<string, Record<string, number>>;

interface ReportsClientProps {
  year: number;
  availableYears: number[];
  data: {
    totalTestSchedules: number;
    totalEvaluations: number;
    byTestType: MetricData[];
    byChurch: MetricData[];
    bySector: MetricData[];
    byMonth: MetricData[];
    bySectorAndMonth: SectorMonthData;
  };
}

export function ReportsClient({ data, year, availableYears }: ReportsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("ano", e.target.value);
    router.push(`?${params.toString()}`);
  };

  const BarChart = ({ items, colorClass }: { items: MetricData[], colorClass: string }) => {
    const maxVal = Math.max(...items.map(i => i.value), 1);
    
    return (
      <div className="space-y-4 mt-4">
        {items.map((item, idx) => {
          const percentage = (item.value / maxVal) * 100;
          return (
            <div key={idx} className="relative">
              <div className="flex justify-between mb-1 text-sm font-medium text-slate-700">
                <span>{item.name}</span>
                <span>{item.value}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div 
                  className={clsx("h-2.5 rounded-full transition-all duration-500", colorClass)} 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <p className="text-sm text-slate-500 italic">Nenhum dado encontrado para este período.</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-700">
          <Filter className="w-5 h-5 text-slate-400" />
          <span className="font-medium">Filtros</span>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="yearFilter" className="text-sm text-slate-600 font-medium">Ano Base:</label>
          <select
            id="yearFilter"
            value={year}
            onChange={handleYearChange}
            className="w-32 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-500">Agendamentos (Exames)</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><CalendarDays className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-bold text-slate-800 mt-4">{data.totalTestSchedules}</p>
          <p className="text-xs text-slate-500 mt-1">Sessões cadastradas no ano</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-500">Candidatos Avaliados</h3>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Users className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-bold text-slate-800 mt-4">{data.totalEvaluations}</p>
          <p className="text-xs text-slate-500 mt-1">Testes concluídos no ano</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quantidade de Músicos por Teste e Ano */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <FileSignature className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-slate-800">Candidatos por Tipo de Teste</h2>
          </div>
          <p className="text-sm text-slate-500">
            Reunião de Jovens, Cultos Oficiais, Oficializações etc.
          </p>
          <BarChart items={data.byTestType} colorClass="bg-orange-500" />
        </div>

        {/* Quantidade por Igreja */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <Church className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold text-slate-800">Avaliações por Igreja</h2>
          </div>
          <p className="text-sm text-slate-500">
            Quantidade de testes realizados separados por Igreja
          </p>
          <BarChart items={data.byChurch} colorClass="bg-blue-500" />
        </div>

        {/* Quantidade por Setor */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-800">Avaliações por Setor</h2>
          </div>
          <p className="text-sm text-slate-500">
            Quantidade geral de candidatos separados por Setor
          </p>
          <BarChart items={data.bySector} colorClass="bg-emerald-500" />
        </div>

        {/* Evolução Mensal */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <Music className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-800">Evolução Mensal (Geral)</h2>
          </div>
          <p className="text-sm text-slate-500">
            Volume de exames registrados a cada mês do ano
          </p>
          <BarChart items={data.byMonth} colorClass="bg-indigo-500" />
        </div>
      </div>

      {/* Relatório Analítico Mensal por Setor */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Avaliações por Setor (Análise Mensal)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Setor</th>
                {data.byMonth.map(m => (
                  <th key={m.name} className="px-2 py-3 text-center">{m.name}</th>
                ))}
                <th className="px-4 py-3 text-center rounded-r-lg">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.keys(data.bySectorAndMonth).length === 0 && (
                <tr>
                  <td colSpan={14} className="px-4 py-8 text-center text-slate-500 italic">
                    Nenhum dado encontrado para o período.
                  </td>
                </tr>
              )}
              {Object.entries(data.bySectorAndMonth).map(([sector, months]) => {
                const total = Object.values(months).reduce((acc, curr) => acc + curr, 0);
                return (
                  <tr key={sector} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{sector}</td>
                    {data.byMonth.map(m => (
                      <td key={m.name} className="px-2 py-3 text-center text-slate-600">
                        {months[m.name] > 0 ? months[m.name] : '-'}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center font-bold text-slate-900">{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
