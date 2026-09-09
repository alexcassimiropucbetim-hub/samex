import { getTestDetails } from "@/actions/testDetails";
import { notFound } from "next/navigation";
import { PrintControls } from "@/components/PrintControls";
import { prisma } from "@/lib/prisma";
import { Calendar, MapPin, Users, User, Music } from "lucide-react";

export default async function ImprimirListaTestePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const test = await getTestDetails(id);

  if (!test) notFound();

  const formattedDate = new Date(test.testDate).toLocaleDateString("pt-BR");
  const formattedTime = new Date(test.testDate).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
  const printDate = new Date().toLocaleDateString("pt-BR");
  const printTime = new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });

  const config = await prisma.systemConfig.findUnique({ where: { key: "logo" } });
  const logoUrl = config?.value || null;

  return (
    <div className="print-container font-sans bg-white text-black min-h-screen p-8 relative overflow-hidden">
      {/* Decorative top right graphic (simplified via CSS) */}
      <div className="absolute top-0 right-0 w-[600px] h-[300px] bg-gradient-to-bl from-orange-50 via-transparent to-transparent opacity-50 pointer-events-none -z-10" />
      
      <PrintControls />
      
      <div className="max-w-[21cm] mx-auto z-10 relative">
        
        {/* Header Block matching the image */}
        <div className="mb-6 border-b-4 border-[#0a2342] pb-4">
          
          {/* Top Row: Logo & Title */}
          <div className="flex items-center gap-6 mb-4">
            {/* Logo Section */}
            <div className="flex flex-col justify-center items-start shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-12 object-contain mb-1" />
              ) : (
                <div className="bg-[#ff6b35] text-white p-2.5 rounded-xl mb-1">
                  <Music className="w-7 h-7" />
                </div>
              )}
              <p className="text-[9px] text-gray-500 font-bold leading-tight uppercase tracking-wider">
                Sistema de Administração Musical e Exames
              </p>
            </div>

            {/* Vertical Divider */}
            <div className="h-12 w-px bg-gray-300"></div>

            {/* Title Section */}
            <div className="flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-[#0a2342] uppercase tracking-wide leading-none">
                Lista de Candidatos para Teste
              </h2>
            </div>
          </div>

          <div className="border-t border-gray-200 w-full mb-4"></div>

          {/* Bottom Row: Info Columns */}
          <div className="flex items-center justify-between px-2">
            
            {/* Local Column */}
            <div className="flex items-center gap-3 flex-1">
              <div className="text-[#ff6b35]">
                <MapPin className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 font-semibold mb-0.5">Local de Teste:</span>
                <span className="text-sm font-bold text-gray-900 uppercase leading-none">{test.church.name}</span>
              </div>
            </div>

            <div className="h-8 w-px bg-gray-300 mx-4"></div>

            {/* Date Column */}
            <div className="flex items-center gap-3 flex-1">
              <div className="text-[#ff6b35]">
                <Calendar className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 font-semibold mb-0.5">Data e Hora:</span>
                <span className="text-sm font-bold text-gray-900 leading-none">{formattedDate} às {formattedTime}</span>
              </div>
            </div>

            <div className="h-8 w-px bg-gray-300 mx-4"></div>

            {/* Total Column */}
            <div className="flex items-center gap-3 flex-1">
              <div className="text-[#ff6b35] flex items-center">
                <Users className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 font-semibold mb-0.5">Total de candidatos:</span>
                <span className="text-sm font-bold text-gray-900 leading-none">{test.candidates.length}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Tables by Test Type */}
        <div className="space-y-8 mt-6">
          {(() => {
            if (test.candidates.length === 0) {
              return (
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-12 text-center text-slate-500 font-medium">
                  Nenhum candidato agendado.
                </div>
              );
            }

            const sortedCandidates = [...test.candidates].sort((a, b) => 
              a.candidateName.localeCompare(b.candidateName)
            );

            const groupedCandidates = sortedCandidates.reduce((acc, candidate) => {
              const typeName = candidate.testType.name;
              if (!acc[typeName]) acc[typeName] = [];
              acc[typeName].push(candidate);
              return acc;
            }, {} as Record<string, typeof test.candidates>);

            const sortedGroups = Object.keys(groupedCandidates).sort();

            return sortedGroups.map((groupName) => (
              <div key={groupName} className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm break-inside-avoid">
                <div className="bg-slate-100 px-6 py-3 border-b border-gray-200 flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-500 uppercase">Tipo de Teste:</span>
                  <span className="text-sm font-extrabold text-[#0a2342] uppercase">{groupName}</span>
                </div>
                <table className="w-full border-collapse text-[11px] sm:text-xs">
                  <thead>
                    <tr className="bg-[#0a2342] text-white uppercase tracking-wider text-left">
                      <th className="px-4 py-3 w-12 text-center font-bold">#</th>
                      <th className="px-4 py-3 font-bold">Candidato(a)</th>
                      <th className="px-4 py-3 font-bold">Congregação</th>
                      <th className="px-4 py-3 font-bold">Instrumento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedCandidates[groupName].map((candidate, idx) => (
                      <tr key={candidate.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#f8fafd]'}>
                        <td className="border-b border-gray-100 px-4 py-2.5 text-center font-bold text-gray-900">{idx + 1}</td>
                        <td className="border-b border-gray-100 px-4 py-2.5 font-bold text-black uppercase">{candidate.candidateName}</td>
                        <td className="border-b border-gray-100 px-4 py-2.5 font-bold text-gray-800 uppercase">{candidate.church.name}</td>
                        <td className="border-b border-gray-100 px-4 py-2.5 font-bold text-gray-800 uppercase">{candidate.instrument.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ));
          })()}
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        body { background: white !important; }
        @media print {
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
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
