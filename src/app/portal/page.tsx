import { 
  FileSignature, 
  CalendarClock,
  Users,
  TrendingUp,
  CalendarDays,
  Clock
} from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPreEvaluations } from "@/actions/preEvaluation";
import { getTestSchedules } from "@/actions/testSchedule";
import { prisma } from "@/lib/prisma";
import DashboardCharts from "@/components/DashboardCharts";
import { LatestRegistrations } from "@/components/LatestRegistrations";
import { CalendarWidget } from "@/components/CalendarWidget";
import { NextEventsWidget } from "@/components/NextEventsWidget";

export default async function PortalDashboard() {
  const session = await getSession();
  
  const isRegional = Boolean(session?.roleName?.toLowerCase().includes("regional"));
  const isExaminadora = Boolean(session?.roleName?.toLowerCase().includes("examinadora"));
  const isAdmin = session?.type === "admin";

  const [allPreEvaluations, testSchedules, categoriesWithInstruments, sectorsWithEvaluations, testTypesWithEvaluations, allEvents] = await Promise.all([
    getPreEvaluations(),
    getTestSchedules(),
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

  let preEvaluations = allPreEvaluations;

  if (isExaminadora) {
    preEvaluations = allPreEvaluations.filter(p => p.gender === 'F');
  } else if (isRegional) {
    preEvaluations = allPreEvaluations;
  } else if (!isAdmin) {
    preEvaluations = allPreEvaluations.filter(p => p.churchId === session?.churchId);
  }

  const pendentes = preEvaluations.filter(p => !p.status || p.status === "PENDENTE");
  const alocados = preEvaluations.filter(p => p.testScheduleId !== null);

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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextEvents = allEvents.filter(e => new Date(e.date) >= today);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        <div className="flex flex-col gap-6 xl:col-span-1">
          {/* Card 1: Inscrições Totais */}
          <Link href="/portal/pre-avaliacao" className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 border-l-[6px] border-l-orange-500 flex items-center justify-between group relative overflow-hidden transition-all hover:shadow-md">
            <div className="absolute -right-12 -bottom-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
              <FileSignature className="w-64 h-64 text-orange-500" />
            </div>

            <div className="flex items-center gap-6 relative z-10 w-full">
              <div className="w-[84px] h-[84px] rounded-full bg-gradient-to-br from-orange-50 to-orange-100/50 flex items-center justify-center shrink-0 shadow-sm border border-orange-100/50">
                <FileSignature className="w-8 h-8 text-orange-500" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#0B1B3D] mb-1">Inscrições Totais</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-[2.75rem] font-black text-orange-500 leading-none tracking-tight">{preEvaluations.length}</span>
                  <span className="text-sm font-bold text-orange-500">cadastrados</span>
                </div>
                <p className="text-[15px] text-slate-500 font-medium">Total de inscrições recebidas.</p>
              </div>
            </div>

            <div className="absolute bottom-6 right-6 z-10 flex flex-col items-center justify-center w-16 h-[60px] rounded-2xl bg-white border border-orange-100 shadow-sm group-hover:bg-orange-50/50 transition-colors">
              <TrendingUp className="w-5 h-5 text-orange-500 mb-1" />
              <span className="text-[10px] font-bold text-orange-500 capitalize">Resumo</span>
            </div>
          </Link>

          {/* Card 2: Pré-Avaliações Pendentes */}
          <Link href="/portal/pre-avaliacao" className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 border-l-[6px] border-l-[#FFC107] flex items-center justify-between group relative overflow-hidden transition-all hover:shadow-md">
            <div className="absolute -right-12 -bottom-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
              <FileSignature className="w-64 h-64 text-[#FFC107]" />
            </div>

            <div className="flex items-center gap-6 relative z-10 w-full">
              <div className="w-[84px] h-[84px] rounded-full bg-gradient-to-br from-amber-50 to-amber-100/50 flex items-center justify-center shrink-0 shadow-sm border border-amber-100/50">
                <FileSignature className="w-8 h-8 text-[#FFC107]" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#0B1B3D] mb-1">Pré-Avaliações Pendentes</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-[2.75rem] font-black text-[#FFC107] leading-none tracking-tight">{pendentes.length}</span>
                  <span className="text-sm font-bold text-[#FFC107]">aguardando</span>
                </div>
                <p className="text-[15px] text-slate-500 font-medium">Inscrições que ainda aguardam avaliação.</p>
              </div>
            </div>

            <div className="absolute bottom-6 right-6 z-10 flex flex-col items-center justify-center w-16 h-[60px] rounded-2xl bg-white border border-amber-100 shadow-sm group-hover:bg-amber-50/50 transition-colors">
              <Clock className="w-5 h-5 text-[#FFC107] mb-1" />
              <span className="text-[10px] font-bold text-[#FFC107] capitalize">Pendente</span>
            </div>
          </Link>

          {/* Card 3: Agendamento de Testes */}
          <Link href="/portal/cadastro-teste" className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 border-l-[6px] border-l-blue-600 flex items-center justify-between group relative overflow-hidden transition-all hover:shadow-md">
            <div className="absolute -right-12 -bottom-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
              <CalendarClock className="w-64 h-64 text-blue-600" />
            </div>

            <div className="flex items-start gap-6 relative z-10 w-full">
              <div className="w-[84px] h-[84px] rounded-full bg-gradient-to-br from-blue-50 to-blue-100/50 flex items-center justify-center shrink-0 shadow-sm border border-blue-100/50 mt-1">
                <CalendarClock className="w-8 h-8 text-blue-600" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#0B1B3D] mb-1">Agendamento de Testes</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-[2.75rem] font-black text-blue-600 leading-none tracking-tight">{testSchedules.length}</span>
                  <span className="text-sm font-bold text-blue-600">datas marcadas</span>
                </div>
                <p className="text-[15px] text-slate-500 font-medium mb-4">Visualise os locais e datas de testes.</p>
                
                <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100/50 rounded-full px-4 py-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-bold text-blue-600">{alocados.length} candidatos alocados</span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-6 right-6 z-10 flex flex-col items-center justify-center w-16 h-[60px] rounded-2xl bg-white border border-blue-100 shadow-sm group-hover:bg-blue-50/50 transition-colors">
              <CalendarDays className="w-5 h-5 text-blue-600 mb-1" />
              <span className="text-[10px] font-bold text-blue-600 capitalize">Agenda</span>
            </div>
          </Link>
        </div>

        <div className="flex flex-col gap-6 xl:col-span-1">
          <CalendarWidget events={allEvents} />
        </div>

        <div className="flex flex-col gap-6 xl:col-span-1">
          <NextEventsWidget events={nextEvents} />
        </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-3">
          <LatestRegistrations registrations={preEvaluations} />
        </div>
      </div>

      <DashboardCharts sectorsData={sectorsData} categoriesData={categoriesData} testTypesData={testTypesData} />
    </div>
  );
}
