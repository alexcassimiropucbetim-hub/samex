import { getSession } from "@/lib/auth";
import { getTestDetails, getEligibleEvaluators, toggleTestLock } from "@/actions/testDetails";
import { notFound, redirect } from "next/navigation";
import { Lock, Unlock, Printer, FileCheck, ChevronUp, ChevronDown } from "lucide-react";
import Link from "next/link";
import { CandidateTableClient } from "@/components/CandidateTableClient";

export default async function TestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const isAdmin = session?.type === "admin";
  const { id } = await params;

  const test = await getTestDetails(id);
  if (!test) notFound();

  const evaluators = await getEligibleEvaluators();

  const formattedDate = new Date(test.testDate).toLocaleDateString("pt-BR");
  const formattedTime = new Date(test.testDate).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER SECTION */}
      <div className="glass-card p-6 border border-slate-200 rounded-2xl bg-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-slate-900">{formattedDate}</h1>
              {test.isClosed ? (
                <span className="bg-white text-slate-600 text-xs px-3 py-1 rounded-full flex items-center gap-1 border border-slate-200">
                  <Lock className="w-3 h-3" /> Encerrado
                </span>
              ) : (
                <span className="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full flex items-center gap-1 border border-green-500/30">
                  <Unlock className="w-3 h-3" /> Aberto
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500">
              {test.candidates.length} candidato(s) vinculado(s) · {test.isClosed ? `Encerrado` : `Agendado`} às {formattedTime}
            </p>
            {test.elderName && (
              <p className="text-sm text-blue-400 mt-1">
                Ancião: {test.elderName}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button className="bg-white hover:bg-slate-700 text-slate-900 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors border border-slate-200">
              <FileCheck className="w-4 h-4" /> Ver Resultado
            </button>
            <Link href={`/imprimir-teste/${test.id}`} target="_blank" className="text-slate-500 hover:text-slate-900 p-2" title="Imprimir Lista de Candidatos">
              <Printer className="w-5 h-5" />
            </Link>
            
            {isAdmin && (
              <form action={async () => {
                "use server";
                await toggleTestLock(test.id, !test.isClosed);
              }}>
                <button type="submit" className={`p-2 ${test.isClosed ? 'text-orange-400 hover:text-orange-300' : 'text-slate-500 hover:text-slate-900'}`}>
                  {test.isClosed ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                </button>
              </form>
            )}
            
            <Link href="/portal/cadastro-teste" className="text-slate-500 hover:text-slate-900 p-2">
              <ChevronUp className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* WARNING BANNER */}
      {test.isClosed && (
        <div className="flex items-center gap-3 bg-white/50 border border-slate-200 p-4 rounded-xl text-slate-600 text-sm">
          <Lock className="w-4 h-4 text-slate-500" />
          Teste encerrado. Para alterar candidatos, reabra o teste com a senha do admin.
        </div>
      )}

      {/* TABLE SECTION */}
      <CandidateTableClient test={test} evaluators={evaluators} />

    </div>
  );
}
