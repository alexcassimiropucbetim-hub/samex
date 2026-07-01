import { prisma } from "@/lib/prisma";
import { BookOpen, CheckCircle, XCircle, ArrowLeft, ClipboardList, Music, Book } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function ResultadoPreAvaliacaoPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const resolvedParams = await searchParams;
  const id = resolvedParams.id;
  if (!id) return notFound();

  const session = await getSession();
  const isRegional = Boolean(session?.roleName?.toLowerCase().includes("regional"));
  const isExaminadora = Boolean(session?.roleName?.toLowerCase().includes("examinadora"));
  const isAdmin = session?.type === "admin";
  const isLocal = !isRegional && !isExaminadora && !isAdmin;
  const showGrades = !isLocal;

  const preEvaluation = await prisma.preEvaluation.findUnique({
    where: { id },
    include: {
      evaluationResult: true,
      testType: true,
      church: true,
    }
  });

  if (!preEvaluation || !preEvaluation.evaluationResult) {
    return (
      <div className="glass-card text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Avaliação não encontrada</h2>
        <p className="text-slate-500 mb-6">Este candidato ainda não foi avaliado ou o resultado não está disponível.</p>
        <Link href="/portal/pre-avaliacao" className="btn-primary">Voltar</Link>
      </div>
    );
  }

  const result = preEvaluation.evaluationResult;
  const isApproved = preEvaluation.status === "APROVADO";
  
  // Safely parse JSON arrays
  const parseArray = (str: string | null) => {
    if (!str) return [];
    try { return JSON.parse(str); } catch { return []; }
  };

  const msaLessons = parseArray(result.msaLessons);
  const methodLessons = parseArray(result.methodLessons);
  const hymns = parseArray(result.hymns);

  const criteria = [
    { label: '1. Leitura métrica e rítmica', value: result.q1Leitura },
    { label: '2. Pulso e ritmo na condução', value: result.q2Pulso },
    { label: '3. Afinação', value: result.q3Afinacao },
    { label: '4. Escalas', value: result.q4Escalas },
    { label: '5. Postura', value: result.q5Postura },
    { label: '6. Timbre', value: result.q6Timbre },
    { label: '7. Voz', value: result.q7Voz },
    { label: '8. Dinâmica', value: result.q8Dinamica },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/portal/pre-avaliacao" className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <BookOpen className="text-blue-500" /> Resultado da Avaliação
          </h1>
          <p className="text-slate-500 mt-1">{preEvaluation.candidateName} - {preEvaluation.testType.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 border-t-4 border-t-blue-500">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-400" /> Parecer
            </h2>
            
            <div className={`p-4 rounded-xl border flex items-start gap-3 mb-6 ${
              isApproved 
                ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {isApproved ? <CheckCircle className="w-6 h-6 mt-0.5 shrink-0" /> : <XCircle className="w-6 h-6 mt-0.5 shrink-0" />}
              <div>
                <h3 className="font-bold text-lg mb-1">{isApproved ? "Encaminhado para o Teste" : "Estudar mais um pouco"}</h3>
                <p className="text-sm opacity-90">
                  {isApproved 
                    ? "Candidato demonstrou aptidão para realizar o exame e recebeu um estudo dirigido." 
                    : "Candidato ainda precisa se preparar melhor nos critérios avaliados."}
                </p>
              </div>
            </div>

            {result.observacao && showGrades && (
              <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Observações</h4>
                <p className="text-slate-600 text-sm whitespace-pre-wrap">{result.observacao}</p>
              </div>
            )}
          </div>
          
          {showGrades && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Notas</h2>
              <div className="space-y-3">
                {criteria.map((c, i) => (
                  <div key={i} className="flex justify-between items-center text-sm border-b border-slate-200 pb-2 last:border-0 last:pb-0">
                    <span className="text-slate-500 truncate pr-4" title={c.label}>{c.label}</span>
                    <span className={`font-semibold shrink-0 ${
                      c.value === 'Ótimo' ? 'text-green-400' : c.value === 'Bom' ? 'text-blue-400' : 'text-red-400'
                    }`}>{c.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {isApproved && (msaLessons.length > 0 || methodLessons.length > 0 || hymns.length > 0) ? (
            <div className="glass-card p-6 border-t-4 border-t-orange-500 h-full">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Book className="text-orange-400" /> Estudo Dirigido
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {msaLessons.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-600 flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
                      <BookOpen className="w-5 h-5 text-slate-500" /> Métodos de Teoria
                    </h3>
                    <ul className="space-y-2">
                      {msaLessons.map((l: any, i: number) => {
                        let text = l;
                        if (typeof l === 'string' && l.startsWith('{')) {
                          try {
                            const obj = JSON.parse(l);
                            text = obj.page 
                              ? `${obj.methodName} - Pág ${obj.page} - Lição ${obj.lesson}`
                              : `${obj.methodName} - Lição ${obj.lesson}`;
                          } catch {}
                        }
                        return (
                          <li key={i} className="bg-slate-100 px-3 py-2 rounded-lg text-slate-600 flex items-center gap-2 before:content-[''] before:w-1.5 before:h-1.5 before:bg-orange-500 before:rounded-full">
                            {text}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
                
                {methodLessons.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-600 flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
                      <Music className="w-5 h-5 text-slate-500" /> Métodos de Prática
                    </h3>
                    <ul className="space-y-2">
                      {methodLessons.map((l: any, i: number) => {
                        let text = l;
                        if (typeof l === 'string' && l.startsWith('{')) {
                          try {
                            const obj = JSON.parse(l);
                            text = obj.page 
                              ? `${obj.methodName} - Pág ${obj.page} - Lição ${obj.lesson}`
                              : `${obj.methodName} - Lição ${obj.lesson}`;
                          } catch {}
                        }
                        return (
                          <li key={i} className="bg-slate-100 px-3 py-2 rounded-lg text-slate-600 flex items-center gap-2 before:content-[''] before:w-1.5 before:h-1.5 before:bg-blue-500 before:rounded-full">
                            {text}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
                
                {hymns.length > 0 && (
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-slate-600 flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
                      <Music className="w-5 h-5 text-slate-500" /> Hinário
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {hymns.map((h: string, i: number) => (
                        <span key={i} className="bg-slate-200 border border-slate-300 text-slate-900 px-4 py-2 rounded-xl font-medium">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card p-10 h-full flex flex-col items-center justify-center text-center opacity-70">
              <BookOpen className="w-16 h-16 text-slate-500 mb-4" />
              <h2 className="text-xl font-bold text-slate-600">Sem Estudo Dirigido</h2>
              <p className="text-slate-500 mt-2">Nenhum programa de estudo foi definido para este candidato.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
