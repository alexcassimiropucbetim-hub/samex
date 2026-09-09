import { 
  FileSignature, 
  CalendarClock,
  Users,
  TrendingUp,
  CalendarDays,
  Clock,
  BarChart2
} from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPreEvaluations } from "@/actions/preEvaluation";
import { getTestSchedules } from "@/actions/testSchedule";
import { prisma } from "@/lib/prisma";
import DashboardCharts from "@/components/DashboardCharts";
import { LatestRegistrations } from "@/components/LatestRegistrations";
import { CalendarEventsWrapper } from "@/components/CalendarEventsWrapper";
import { PendingLettersWidget } from "@/components/PendingLettersWidget";

export default async function PortalDashboard() {
  const session = await getSession();
  
  const isRegional = Boolean(session?.roleName?.toLowerCase().includes("regional"));
  const isExaminadora = Boolean(session?.roleName?.toLowerCase().includes("examinadora"));
  const isAdmin = session?.type === "admin";
  const isLocal = !isRegional && !isExaminadora && !isAdmin;

  const [allPreEvaluations, testSchedules, categoriesWithInstruments, sectorsWithEvaluations, testTypesWithEvaluations, allEvents] = await Promise.all([
    getPreEvaluations(),
    getTestSchedules(),
    prisma.instrumentCategory.findMany({
      include: {
        instruments: {
          include: {
            _count: {
              select: { 
                preEvaluations: {
                  where: { finalTestStatus: { not: "APROVADO" } }
                }
              }
            }
          }
        }
      }
    }),
    prisma.sector.findMany({
      include: {
        _count: {
          select: { 
            preEvaluations: {
              where: { finalTestStatus: { not: "APROVADO" } }
            }
          }
        }
      }
    }),
    prisma.testType.findMany({
      include: {
        _count: {
          select: { 
            preEvaluations: {
              where: { finalTestStatus: { not: "APROVADO" } }
            }
          }
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
  
  const futureSchedules = testSchedules.filter(t => new Date(t.testDate) >= today);
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const schedulesThisYear = testSchedules.filter(t => new Date(t.testDate) >= startOfYear);

  const pendingLettersData = preEvaluations
    .filter(p => p.status === "APROVADO" && p.letterPrinted === false)
    .map(p => ({
      id: p.id,
      candidateName: p.candidateName,
      instrumentName: p.instrument?.name || "N/A",
      testTypeName: p.testType?.name || "N/A",
    }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {isLocal && pendingLettersData.length > 0 && (
        <PendingLettersWidget candidates={pendingLettersData} />
      )}

      {/* Row 1: 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* Card 1: Inscrições Totais */}
        <Link href="/portal/pre-avaliacao" className="bg-white p-5 rounded-[20px] shadow-sm border border-slate-100 flex items-center gap-4 group relative overflow-hidden transition-all hover:shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100">
            <FileSignature className="w-6 h-6 text-orange-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-[#0B1B3D] mb-1">Inscrições Totais</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-orange-500 leading-none">{preEvaluations.length}</span>
              <span className="text-[11px] font-bold text-slate-500">cadastrados</span>
            </div>
          </div>
          <div className="absolute top-4 right-4 w-6 h-6 rounded-md bg-orange-50 flex items-center justify-center border border-orange-100">
            <TrendingUp className="w-3 h-3 text-orange-500" />
          </div>
        </Link>

        {/* Card 2: Pré-Avaliações Pendentes */}
        <Link href="/portal/pre-avaliacao" className="bg-white p-5 rounded-[20px] shadow-sm border border-slate-100 flex items-center gap-4 group relative overflow-hidden transition-all hover:shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
            <Users className="w-6 h-6 text-blue-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-[#0B1B3D] mb-1 leading-tight">Pré-Avaliações<br/>Pendentes</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-blue-500 leading-none">{pendentes.length}</span>
              <span className="text-[11px] font-bold text-slate-500">aguardando</span>
            </div>
          </div>
          <div className="absolute top-4 right-4 w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center border border-blue-100">
            <TrendingUp className="w-3 h-3 text-blue-500" />
          </div>
        </Link>

        {/* Card 3: Agendamento de Testes */}
        <div className="bg-white p-5 rounded-[20px] shadow-sm border border-slate-100 flex items-center gap-4 group relative overflow-hidden transition-all hover:shadow-md cursor-default">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
            <CalendarDays className="w-6 h-6 text-emerald-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-[#0B1B3D] mb-1">Agendamento de Testes</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-500 leading-none">{futureSchedules.length}</span>
              <span className="text-[11px] font-bold text-slate-500">próximos marcados</span>
            </div>
          </div>
        </div>

        {/* Card 4: Total de Testes no Ano */}
        <div className="bg-white p-5 rounded-[20px] shadow-sm border border-slate-100 flex items-center gap-4 group relative overflow-hidden transition-all hover:shadow-md cursor-default">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100">
            <CalendarClock className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-[#0B1B3D] mb-1">Total de Testes no Ano</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-purple-600 leading-none">{schedulesThisYear.length}</span>
              <span className="text-[11px] font-bold text-slate-500">testes realizados</span>
            </div>
          </div>
          <div className="absolute top-4 right-4 w-6 h-6 rounded-md bg-purple-50 flex items-center justify-center border border-purple-100">
            <BarChart2 className="w-3 h-3 text-purple-600" />
          </div>
        </div>

      </div>

      {/* Row 2: Calendar & Events */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <CalendarEventsWrapper events={allEvents} calendarSpan="xl:col-span-7" eventsSpan="xl:col-span-5" />
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
