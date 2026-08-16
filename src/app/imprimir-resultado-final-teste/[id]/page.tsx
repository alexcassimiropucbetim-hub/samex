import { getTestDetails } from "@/actions/testDetails";
import { notFound } from "next/navigation";
import { PrintControls } from "@/components/PrintControls";
import { prisma } from "@/lib/prisma";

export default async function ImprimirResultadoFinalTestePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const test = await getTestDetails(id);

  if (!test) notFound();

  const formattedDate = new Date(test.testDate).toLocaleDateString("pt-BR");
  const formattedTime = new Date(test.testDate).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });

  const config = await prisma.systemConfig.findUnique({ where: { key: "logo" } });
  const logoUrl = config?.value || null;

  return (
    <div className="print-container font-sans bg-white text-black min-h-screen p-8">
      <PrintControls />
      <div className="max-w-[21cm] mx-auto">
        {/* Header Layout based on screenshot */}
        <div className="flex justify-between items-end mb-6">
          <div className="flex flex-col">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-12 object-contain mb-1" />
            ) : (
              <h1 className="text-3xl font-bold text-slate-800 mb-1 tracking-tighter">SAMEX</h1>
            )}
            <p className="text-[10px] text-gray-400 font-medium tracking-wide">Sistema de Administração Musical de Exames</p>
          </div>
          
          <div className="text-right flex flex-col items-end gap-1">
            <h1 className="text-2xl font-bold text-[#1e3a8a] uppercase tracking-wide mb-1">Resultado Final do Teste</h1>
            <div className="flex items-end gap-2 text-sm font-medium">
              <span className="text-gray-700">Local de Teste:</span>
              <span className="border-b border-black w-64 inline-block text-center">{test.church.name}</span>
            </div>
            <div className="flex items-end gap-2 text-sm font-medium">
              <span className="text-gray-700">Data:</span>
              <span className="border-b border-black w-64 inline-block text-center">{formattedDate} às {formattedTime}</span>
            </div>
            <div className="text-sm font-bold mt-1 text-gray-800">
              Total de candidatos: {test.candidates.length}
            </div>
          </div>
        </div>

        <table className="w-full border-collapse text-[10px]">
          <thead>
            <tr className="bg-orange-500 text-white uppercase tracking-wider text-left">
              <th className="px-2 py-2 w-8 text-center">#</th>
              <th className="px-2 py-2">Nome</th>
              <th className="px-2 py-2">Congregação</th>
              <th className="px-2 py-2">Instrumento</th>
              <th className="px-2 py-2">Tipo</th>
              <th className="px-2 py-2">Resultado Final</th>
            </tr>
          </thead>
          <tbody>
            {test.candidates.map((candidate, idx) => (
              <tr key={candidate.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border-b border-gray-100 px-2 py-2 text-center font-bold text-gray-500">{idx + 1}</td>
                <td className="border-b border-gray-100 px-2 py-2 font-semibold uppercase">{candidate.candidateName}</td>
                <td className="border-b border-gray-100 px-2 py-2 uppercase text-gray-600">{candidate.church.name}</td>
                <td className="border-b border-gray-100 px-2 py-2 uppercase text-gray-600">{candidate.instrument.name}</td>
                <td className="border-b border-gray-100 px-2 py-2 uppercase text-gray-600">{candidate.testType.name}</td>
                <td className="border-b border-gray-100 px-2 py-2 font-bold uppercase">
                  {candidate.finalTestStatus === "APROVADO" ? (
                    <span className="text-emerald-600">APROVADO</span>
                  ) : candidate.finalTestStatus === "REPROVADO" ? (
                    <span className="text-red-600">REPROVADO</span>
                  ) : (
                    <span className="text-gray-500">PENDENTE</span>
                  )}
                </td>
              </tr>
            ))}
            {test.candidates.length === 0 && (
              <tr>
                <td colSpan={6} className="border-b border-gray-100 px-2 py-8 text-center text-gray-500 font-medium">Nenhum candidato agendado.</td>
              </tr>
            )}
          </tbody>
        </table>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        body { background: white !important; }
        @media print {
          body { background: white !important; }
          .print-container { padding: 0 !important; }
          @page { margin: 1cm; size: A4 portrait; }
        }
      `}} />
      
      {/* Auto print on load */}
      <script dangerouslySetInnerHTML={{__html: `
        window.onload = () => {
          setTimeout(() => {
            window.print();
          }, 500);
        }
      `}} />
    </div>
  );
}
