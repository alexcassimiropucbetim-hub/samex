import { Music2, MapPin, Church, ListMusic, FileSignature, CalendarClock, Users, User, MonitorPlay, TrendingUp, Clock, Hourglass, CalendarDays, CalendarCheck, Eye, ChevronRight, Calendar, BarChart2 } from "lucide-react";
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
        {/* Card 1: Inscrições Totais */}
        <Link href="/portal/pre-avaliacao" className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex flex-col justify-between group relative overflow-hidden transition-all hover:shadow-md">
          <div className="absolute -right-12 -bottom-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
            <FileSignature className="w-64 h-64 text-orange-500" />
          </div>

          <div className="flex items-start justify-between relative z-10 w-full mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100">
                <FileSignature className="w-7 h-7 text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0B1B3D]">Inscrições Totais</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-[2rem] font-black text-orange-500 leading-none tracking-tight">{preEvaluationsCount}</span>
                  <span className="text-xs font-bold text-slate-500">cadastrados</span>
                </div>
              </div>
            </div>
            
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center border border-orange-100 shrink-0">
              <TrendingUp className="w-4 h-4 text-orange-500" />
            </div>
          </div>
          
          <div className="relative z-10">
            <p className="text-[13px] text-slate-500 mb-6 font-medium leading-relaxed">Total de inscrições<br/>recebidas na rede.</p>
            
            <div className="flex items-center justify-center gap-2 bg-orange-50 rounded-xl py-3 text-orange-600 font-bold text-xs group-hover:bg-orange-100 transition-colors">
              <Users className="w-4 h-4" />
              +3 esta semana
            </div>
          </div>
        </Link>

        {/* Card 2: Pré-Avaliações Pendentes */}
        <Link href="/portal/pre-avaliacao" className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex flex-col justify-between group relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex items-start justify-between relative z-10 w-full mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                <User className="w-7 h-7 text-blue-500" />
              </div>
              <h3 className="text-base font-bold text-[#0B1B3D] leading-tight">Pré-Avaliações<br/>Pendentes</h3>
            </div>
            
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          
          <div className="relative z-10 mb-6">
            <div className="flex items-center justify-around border-b border-slate-100 pb-4">
              <div className="text-center">
                <span className="text-3xl font-black text-blue-500 leading-none block mb-1">{pendentesIrmaos}</span>
                <span className="text-xs font-semibold text-slate-500">Irmãos</span>
              </div>
              <div className="w-px h-10 bg-slate-100"></div>
              <div className="text-center">
                <span className="text-3xl font-black text-pink-500 leading-none block mb-1">{pendentesIrmas}</span>
                <span className="text-xs font-semibold text-slate-500">Irmãs</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-4 text-center font-medium">Inscrições que aguardam avaliação.</p>
          </div>
          
          <div className="relative z-10 mt-auto">
            <div className="flex items-center justify-center gap-2 bg-blue-50 rounded-xl py-3 text-blue-600 font-bold text-xs group-hover:bg-blue-100 transition-colors">
              <FileSignature className="w-4 h-4" />
              {pendentesCount} total
            </div>
          </div>
        </Link>

        {/* Card 3: Candidatos aguardando próximo teste */}
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex flex-col justify-between group relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex items-start justify-between relative z-10 w-full mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100">
                <User className="w-7 h-7 text-purple-500" />
              </div>
              <h3 className="text-base font-bold text-[#0B1B3D] leading-tight">Candidatos aguardando<br/>próximo teste</h3>
            </div>
            
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center border border-purple-100 shrink-0">
              <Hourglass className="w-4 h-4 text-purple-500" />
            </div>
          </div>
          
          <div className="relative z-10 mb-6">
            <div className="flex items-center justify-around border-b border-slate-100 pb-4 h-[72px]">
              <div className="text-center">
                <span className="text-3xl font-black text-blue-500 leading-none block mb-1">{aguardandoIrmaos}</span>
                <span className="text-xs font-semibold text-slate-500">Irmãos</span>
              </div>
              <div className="w-px h-10 bg-slate-100"></div>
              <div className="text-center">
                <span className="text-3xl font-black text-pink-500 leading-none block mb-1">{aguardandoIrmas}</span>
                <span className="text-xs font-semibold text-slate-500">Irmãs</span>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 mt-auto">
            <div className="flex items-center justify-center gap-2 bg-purple-50 rounded-xl py-3 text-purple-600 font-bold text-xs group-hover:bg-purple-100 transition-colors cursor-default">
              <CalendarClock className="w-4 h-4" />
              Próximos testes definidos
            </div>
          </div>
        </div>

        {/* Card 4: Agendamento de Testes */}
        <Link href="/portal/cadastro-teste" className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex flex-col justify-between group relative overflow-hidden transition-all hover:shadow-md">
          <div className="absolute right-0 bottom-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
            <CalendarDays className="w-48 h-48 text-blue-500" />
          </div>

          <div className="flex items-start justify-between relative z-10 w-full mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                <CalendarDays className="w-7 h-7 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-[#0B1B3D] leading-tight">Agendamento<br/>de Testes</h3>
            </div>
            
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
              <CalendarCheck className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          
          <div className="relative z-10 mb-4">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-[2rem] font-black text-blue-600 leading-none">{testSchedulesCount}</span>
              <span className="text-xs font-bold text-slate-500">datas marcadas</span>
            </div>
            <p className="text-[13px] text-slate-500 font-medium">Visualizar locais e datas<br/>de testes globais.</p>
          </div>
          
          <div className="relative z-10 mt-auto">
            <div className="flex items-center justify-between bg-blue-50 hover:bg-blue-100 transition-colors rounded-xl py-3 px-4 text-blue-600 font-bold text-xs">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Ver agendamentos
              </div>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </Link>
        
        {/* Card 5: Painel de Testes do Mês (Ocupa 2 colunas) */}
        <Link href="/painel-testes" className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex flex-col justify-between group relative overflow-hidden transition-all hover:shadow-md md:col-span-2 xl:col-span-2">
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
            <MonitorPlay className="w-64 h-64 text-emerald-500" />
          </div>

          <div className="flex items-start gap-4 relative z-10 w-full mb-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
              <MonitorPlay className="w-7 h-7 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#0B1B3D]">Painel de Testes do Mês</h3>
              <p className="text-[13px] text-slate-500 mt-1 font-medium">
                {nextTestThisMonth 
                  ? `Próximo teste: ${new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(nextTestThisMonth.testDate))}`
                  : "Nenhum teste agendado para este mês."}
              </p>
            </div>
          </div>
          
          <div className="relative z-10 mb-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 flex items-center gap-8 w-fit">
            <div className="flex items-center gap-4">
              <Calendar className="w-8 h-8 text-emerald-500" />
              <div>
                <span className="text-2xl font-black text-[#0B1B3D] block leading-none mb-1">0</span>
                <span className="text-[11px] font-semibold text-slate-500">Testes agendados</span>
              </div>
            </div>
            <div className="w-px h-10 bg-emerald-200/50"></div>
            <div className="flex items-center gap-4">
              <User className="w-8 h-8 text-emerald-500" />
              <div>
                <span className="text-2xl font-black text-[#0B1B3D] block leading-none mb-1">0</span>
                <span className="text-[11px] font-semibold text-slate-500">Candidatos</span>
              </div>
            </div>
            <div className="w-px h-10 bg-emerald-200/50"></div>
            <div className="flex items-center gap-4">
              <MapPin className="w-8 h-8 text-emerald-500" />
              <div>
                <span className="text-2xl font-black text-[#0B1B3D] block leading-none mb-1">0</span>
                <span className="text-[11px] font-semibold text-slate-500">Locais</span>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 mt-auto w-fit">
            <div className="flex items-center gap-2 bg-emerald-100 hover:bg-emerald-200 transition-colors rounded-xl py-3 px-6 text-emerald-700 font-bold text-[13px]">
              <BarChart2 className="w-4 h-4" />
              Acessar painel completo
              <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </Link>
      </div>

      <DashboardCharts sectorsData={sectorsData} categoriesData={categoriesData} testTypesData={testTypesData} />
    </div>
  );
}
