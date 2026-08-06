import { Music2, MapPin, Church, ListMusic, FileSignature, CalendarClock, Users, User, MonitorPlay } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DashboardCharts from "@/components/DashboardCharts";
import { getSession } from "@/lib/auth";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ActivitySummaryWidget } from "@/components/ActivitySummaryWidget";
import { CalendarWidget } from "@/components/CalendarWidget";
import { NextEventsWidget } from "@/components/NextEventsWidget";
export default async function Home() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

  const [
    sectorsCount, 
    churchesCount, 
    categoriesCount, 
    instrumentsCount, 
    ministriesCount, 
    preEvaluationsCount, 
    pendentesCount, 
    testSchedulesCount, 
    allocatedCount, 
    nextTestThisMonth,
    aguardandoIrmaos,
    aguardandoIrmas,
    pendentesIrmaos,
    pendentesIrmas,
    categoriesWithInstruments,
    sectorsWithEvaluations,
    testTypesWithEvaluations,
    allEvents
  ] = await Promise.all([
    prisma.sector.count(),
    prisma.church.count(),
    prisma.instrumentCategory.count(),
    prisma.instrument.count(),
    prisma.ministry.count(),
    prisma.preEvaluation.count(),
    prisma.preEvaluation.count({ 
      where: { 
        NOT: {
          status: {
            in: ["APROVADO", "REPROVADO"]
          }
        }
      } 
    }),
    prisma.testSchedule.count(),
    prisma.preEvaluation.count({
      where: { testScheduleId: { not: null } }
    }),
    prisma.testSchedule.findFirst({
      where: {
        testDate: {
          gte: today,
          lte: endOfMonth
        },
        isClosed: false
      },
      orderBy: {
        testDate: "asc"
      }
    }),
    prisma.preEvaluation.count({
      where: {
        status: "APROVADO",
        finalTestStatus: "PENDENTE",
        gender: "M",
      }
    }),
    prisma.preEvaluation.count({
      where: {
        status: "APROVADO",
        finalTestStatus: "PENDENTE",
        gender: "F",
      }
    }),
    prisma.preEvaluation.count({ 
      where: { 
        NOT: { status: { in: ["APROVADO", "REPROVADO"] } },
        gender: "M"
      } 
    }),
    prisma.preEvaluation.count({ 
      where: { 
        NOT: { status: { in: ["APROVADO", "REPROVADO"] } },
        gender: "F"
      } 
    }),
    prisma.instrumentCategory.findMany({
      include: {
        instruments: {
          include: {
            _count: {
              select: { preEvaluations: true }
            }
          }
        }
      }
    }),
    prisma.sector.findMany({
      include: {
        _count: {
          select: { preEvaluations: true }
        }
      }
    }),
    prisma.testType.findMany({
      include: {
        _count: {
          select: { preEvaluations: true }
        }
      }
    }),
    prisma.event.findMany({
      orderBy: {
        date: "asc"
      }
    })
  ]);

  const categoriesData = categoriesWithInstruments
    .map(cat => ({
      name: cat.name,
      count: cat.instruments.reduce((acc, inst) => acc + inst._count.preEvaluations, 0)
    }))
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count);

  const sectorsData = sectorsWithEvaluations
    .map(sec => ({
      name: sec.name,
      count: sec._count.preEvaluations
    }))
    .filter(s => s.count > 0)
    .sort((a, b) => b.count - a.count);

  const testTypesData = testTypesWithEvaluations
    .map(tt => ({
      name: tt.name,
      count: tt._count.preEvaluations
    }))
    .filter(tt => tt.count > 0)
    .sort((a, b) => b.count - a.count);

  const stats = [
    { name: "Setores", value: sectorsCount, icon: MapPin, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", trend: "+12%" },
    { name: "Igrejas", value: churchesCount, icon: Church, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", trend: "+5%" },
    { name: "Categorias", value: categoriesCount, icon: ListMusic, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20", trend: "0%" },
    { name: "Instrumentos", value: instrumentsCount, icon: Music2, color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/20", trend: "+18%" },
    { name: "Ministérios", value: ministriesCount, icon: Users, color: "text-yellow-600", bg: "bg-yellow-500/10", border: "border-yellow-500/20", trend: "+3%" },
  ];

  // Mock data for widgets based on real counts where possible
  const activityData = [
    { label: "Aprovados", value: pendentesCount, color: "#10b981" },
    { label: "Pendentes (Irmãos)", value: pendentesIrmaos, color: "#f59e0b" },
    { label: "Pendentes (Irmãs)", value: pendentesIrmas, color: "#f43f5e" },
    { label: "Aguardando", value: aguardandoIrmaos + aguardandoIrmas, color: "#3b82f6" },
  ];

  // Filtrando eventos a partir de hoje
  const nextEvents = allEvents.filter(e => new Date(e.date) >= today);

  const session = await getSession();
  
  const diaSemana = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(today);
  const dataExtenso = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).format(today);
  const diaSemanaCapitalized = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <DashboardHeader name={session?.name || "Administrador"} date={dataExtenso} weekday={diaSemanaCapitalized} />

      {/* Cadastros Base Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className={`glass-card p-5 rounded-[18px] transition-all duration-300 hover:shadow-md border border-slate-200/60`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} border ${stat.border}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-1 rounded-full">
                  <span className={`text-xs font-bold ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-slate-500'}`}>
                    {stat.trend}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900 leading-none mb-1">{stat.value}</p>
                <p className="text-sm font-semibold text-slate-500">{stat.name}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid de 12 colunas para os Widgets Centrais */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-4">
          <ActivitySummaryWidget data={activityData} />
        </div>
        <div className="xl:col-span-4">
          <CalendarWidget events={allEvents} />
        </div>
        <div className="xl:col-span-4">
          <NextEventsWidget events={nextEvents} />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <h2 className="text-2xl font-bold text-slate-900">Visão Geral de Agendamentos</h2>
      </div>

      {/* Agendamentos Cards (mesmo estilo do portal) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Link href="/portal/pre-avaliacao" className="glass-card p-6 flex items-start gap-4 transition-all group relative overflow-hidden rounded-[18px] hover:shadow-md border border-slate-200/60">
          <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
            <FileSignature className="w-48 h-48" />
          </div>
          <div className="w-14 h-14 bg-orange-500/20 text-orange-400 rounded-2xl flex items-center justify-center shrink-0 border border-orange-500/30 group-hover:scale-110 transition-transform">
            <FileSignature className="w-7 h-7" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-slate-900 mb-1">Inscrições Totais</h3>
            <div className="flex items-end gap-3 mb-2">
              <span className="text-3xl font-black text-orange-400 leading-none">{preEvaluationsCount}</span>
              <span className="text-sm font-medium text-slate-500 mb-0.5">cadastrados</span>
            </div>
            <p className="text-sm text-slate-500">Total de inscrições recebidas na rede.</p>
          </div>
        </Link>

        <Link href="/portal/pre-avaliacao" className="glass-card p-6 flex flex-col justify-center gap-4 transition-all group relative overflow-hidden rounded-[18px] hover:shadow-md border border-slate-200/60">
          <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
            <FileSignature className="w-48 h-48" />
          </div>
          <div className="relative z-10 w-full">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Pré-Avaliações Pendentes</h3>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center shrink-0 border border-blue-500/20 group-hover:scale-110 transition-transform">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-800 leading-none">{pendentesIrmaos}</span>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">Irmãos</p>
                </div>
              </div>

              <div className="w-px h-12 bg-slate-200"></div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-pink-500/10 text-pink-500 rounded-xl flex items-center justify-center shrink-0 border border-pink-500/20 group-hover:scale-110 transition-transform">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-800 leading-none">{pendentesIrmas}</span>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">Irmãs</p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-end">
              <p className="text-sm text-slate-500">Inscrições que aguardam avaliação.</p>
              <div className="flex items-end gap-2">
                <span className="text-xl font-black text-yellow-400 leading-none">{pendentesCount}</span>
                <span className="text-xs font-medium text-slate-500 mb-0.5">total</span>
              </div>
            </div>
          </div>
        </Link>

        <div className="glass-card p-6 flex flex-col justify-center gap-4 transition-all group relative overflow-hidden rounded-[18px] hover:shadow-md border border-slate-200/60">
          <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
            <Users className="w-48 h-48" />
          </div>
          <div className="relative z-10 w-full">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Candidatos aguardando próximo teste</h3>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center shrink-0 border border-blue-500/20 group-hover:scale-110 transition-transform">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-800 leading-none">{aguardandoIrmaos}</span>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">Irmãos</p>
                </div>
              </div>

              <div className="w-px h-12 bg-slate-200"></div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-pink-500/10 text-pink-500 rounded-xl flex items-center justify-center shrink-0 border border-pink-500/20 group-hover:scale-110 transition-transform">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-800 leading-none">{aguardandoIrmas}</span>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">Irmãs</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Link href="/portal/cadastro-teste" className="glass-card p-6 flex items-start gap-4 transition-all group relative overflow-hidden rounded-[18px] hover:shadow-md border border-slate-200/60">
          <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
            <CalendarClock className="w-48 h-48" />
          </div>
          <div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center shrink-0 border border-blue-500/30 group-hover:scale-110 transition-transform">
            <CalendarClock className="w-7 h-7" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-slate-900 mb-1">Agendamento de Testes</h3>
            <div className="flex items-end gap-3 mb-2">
              <span className="text-3xl font-black text-blue-400 leading-none">{testSchedulesCount}</span>
              <span className="text-sm font-medium text-slate-500 mb-0.5">datas marcadas</span>
            </div>
            <p className="text-sm text-slate-500 mb-2">Visualizar locais e datas de testes globais.</p>
            <div className="inline-block bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1">
              <span className="text-xs font-semibold text-blue-400">{allocatedCount} candidato{allocatedCount !== 1 ? 's' : ''} alocado{allocatedCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </Link>
        <Link href="/painel-testes" className="glass-card p-6 flex items-start gap-4 transition-all group relative overflow-hidden rounded-[18px] hover:shadow-md border border-slate-200/60">
          <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
            <MonitorPlay className="w-48 h-48" />
          </div>
          <div className="w-14 h-14 bg-emerald-500/20 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/30 group-hover:scale-110 transition-transform">
            <MonitorPlay className="w-7 h-7" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-slate-900 mb-1">Painel de Testes do Mês</h3>
            <p className="text-sm text-slate-500 mt-3 mb-2">
              {nextTestThisMonth 
                ? `Próximo teste: ${new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(nextTestThisMonth.testDate))}`
                : "Nenhum teste agendado para este mês."}
            </p>
            <div className="inline-block bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
              <span className="text-xs font-semibold text-emerald-600">Acessar Painel &rarr;</span>
            </div>
          </div>
        </Link>
      </div>

      <DashboardCharts sectorsData={sectorsData} categoriesData={categoriesData} testTypesData={testTypesData} />
    </div>
  );
}
