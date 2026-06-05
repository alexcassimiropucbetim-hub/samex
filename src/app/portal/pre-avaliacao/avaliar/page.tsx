import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EvaluationForm } from "@/components/EvaluationForm";
import Link from "next/link";
import { ArrowLeft, User, Music } from "lucide-react";

export default async function AvaliarPreAvaliacaoPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const session = await getSession();
  const isRegional = session?.roleName?.toLowerCase().includes("regional") || session?.roleName?.toLowerCase().includes("examinadora");
  const isAdmin = session?.type === "admin";

  if (!isRegional && !isAdmin) {
    redirect("/portal/pre-avaliacao");
  }

  const resolvedParams = await searchParams;
  const id = resolvedParams.id;

  if (!id) {
    redirect("/portal/pre-avaliacao");
  }

  const evalReq = await prisma.preEvaluation.findUnique({
    where: { id },
    include: { testType: true, church: true, sector: true }
  });

  if (!evalReq) {
    redirect("/portal/pre-avaliacao");
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div>
        <Link href="/portal/pre-avaliacao" className="text-slate-500 hover:text-slate-900 flex items-center gap-2 w-fit mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar para inscrições
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          Realizar Pré-Avaliação
        </h1>
        <p className="text-slate-500 mt-2">Preencha os critérios técnicos e musicais para aprovar ou reprovar o candidato.</p>
      </div>

      {/* Info do Candidato */}
      <div className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-orange-500">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${evalReq.gender === 'F' ? 'bg-pink-500/20 text-pink-400' : 'bg-blue-500/20 text-blue-400'}`}>
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{evalReq.candidateName}</h2>
            <p className="text-sm text-slate-500">{evalReq.church.name} - {evalReq.sector.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
          <Music className="w-5 h-5 text-orange-400" />
          <div>
            <p className="text-xs text-slate-500">Tipo de Teste</p>
            <p className="text-sm font-semibold text-slate-600">{evalReq.testType.name}</p>
          </div>
        </div>
      </div>

      <EvaluationForm preEvaluationId={evalReq.id} candidateName={evalReq.candidateName} />
    </div>
  );
}
