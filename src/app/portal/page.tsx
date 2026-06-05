import { CalendarClock, FileSignature } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPreEvaluations } from "@/actions/preEvaluation";
import { getTestSchedules } from "@/actions/testSchedule";

export default async function PortalDashboard() {
  const session = await getSession();
  
  const isRegional = session?.roleName?.toLowerCase().includes("regional");
  const isExaminadora = session?.roleName?.toLowerCase().includes("examinadora");
  const isAdmin = session?.type === "admin";

  if (!isRegional && !isExaminadora && !isAdmin) {
    redirect("/portal/pre-avaliacao");
  }

  const [allPreEvaluations, testSchedules] = await Promise.all([
    getPreEvaluations(),
    getTestSchedules(),
  ]);

  let preEvaluations = allPreEvaluations;
  if (isExaminadora) {
    preEvaluations = allPreEvaluations.filter(p => p.gender === "F");
  } else if (isRegional) {
    preEvaluations = allPreEvaluations.filter(p => p.gender === "M");
  }

  const pendentes = preEvaluations.filter(p => !p.status || p.status === "PENDENTE");
  const alocados = preEvaluations.filter(p => p.testScheduleId !== null);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <Link href="/portal/pre-avaliacao" className="glass-card p-6 flex items-start gap-4 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all group relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
            <FileSignature className="w-48 h-48" />
          </div>
          <div className="w-14 h-14 bg-orange-500/20 text-orange-400 rounded-2xl flex items-center justify-center shrink-0 border border-orange-500/30 group-hover:scale-110 transition-transform">
            <FileSignature className="w-7 h-7" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-slate-900 mb-1">Inscrições Totais</h3>
            <div className="flex items-end gap-3 mb-2">
              <span className="text-3xl font-black text-orange-400 leading-none">{preEvaluations.length}</span>
              <span className="text-sm font-medium text-slate-500 mb-0.5">cadastrados</span>
            </div>
            <p className="text-sm text-slate-500">
              Total de inscrições recebidas.
            </p>
          </div>
        </Link>

        <Link href="/portal/pre-avaliacao" className="glass-card p-6 flex items-start gap-4 hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all group relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
            <FileSignature className="w-48 h-48" />
          </div>
          <div className="w-14 h-14 bg-yellow-500/20 text-yellow-400 rounded-2xl flex items-center justify-center shrink-0 border border-yellow-500/30 group-hover:scale-110 transition-transform">
            <FileSignature className="w-7 h-7" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-slate-900 mb-1">Pré-Avaliações Pendentes</h3>
            <div className="flex items-end gap-3 mb-2">
              <span className="text-3xl font-black text-yellow-400 leading-none">{pendentes.length}</span>
              <span className="text-sm font-medium text-slate-500 mb-0.5">aguardando</span>
            </div>
            <p className="text-sm text-slate-500">
              Inscrições que ainda aguardam avaliação.
            </p>
          </div>
        </Link>

        <Link href="/portal/cadastro-teste" className="glass-card p-6 flex items-start gap-4 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
            <CalendarClock className="w-48 h-48" />
          </div>
          <div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center shrink-0 border border-blue-500/30 group-hover:scale-110 transition-transform">
            <CalendarClock className="w-7 h-7" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-slate-900 mb-1">Agendamento de Testes</h3>
            <div className="flex items-end gap-3 mb-2">
              <span className="text-3xl font-black text-blue-400 leading-none">{testSchedules.length}</span>
              <span className="text-sm font-medium text-slate-500 mb-0.5">datas marcadas</span>
            </div>
            <p className="text-sm text-slate-500 mb-2">
              Visualize os locais e datas de testes.
            </p>
            <div className="inline-block bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1">
              <span className="text-xs font-semibold text-blue-400">{alocados.length} candidato{alocados.length !== 1 ? 's' : ''} alocado{alocados.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
}
