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
        
        {/* Top small header */}
        <div className="flex justify-between items-center text-[10px] text-gray-500 mb-8 border-b border-gray-100 pb-2">
          <div className="flex items-center gap-1.5 text-orange-500 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-gray-600">{printDate} &bull; {printTime}</span>
          </div>
          <div className="font-medium">
            SAMEX - Sistema de Agendamento Musical e Exames
          </div>
        </div>

        {/* Header Title */}
        <h1 className="text-center text-[28px] font-bold text-[#0a2342] mb-10 tracking-wide uppercase">
          Lista de Candidatos para Teste
        </h1>

        {/* Info Cards */}
        <div className="flex items-stretch justify-between mb-8">
          {/* Logo Card */}
          <div className="flex flex-col justify-center gap-1 w-64">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-10 object-contain object-left mb-1" />
            ) : (
              <div className="flex items-center gap-2">
                <div className="bg-[#ff6b35] text-white p-2 rounded-xl">
                  <Music className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-extrabold text-[#0a2342] tracking-tighter">SAMEX</h1>
              </div>
            )}
            <p className="text-[9px] text-[#0a2342]/70 font-semibold tracking-wide leading-tight mt-1 max-w-[150px]">
              Sistema de Administração Musical e Exames
            </p>
          </div>

          <div className="flex gap-4">
            {/* Local Card */}
            <div className="bg-white border border-gray-100 rounded-2xl px-5 py-3 flex items-center gap-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] min-w-[220px]">
              <div className="text-[#ff6b35]">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 font-semibold">Local de Teste</span>
                <span className="text-sm font-bold text-[#0a2342] uppercase mt-0.5 leading-none">{test.church.name}</span>
              </div>
            </div>

            {/* Date Card */}
            <div className="bg-white border border-gray-100 rounded-2xl px-5 py-3 flex items-center gap-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] min-w-[220px]">
              <div className="text-[#ff6b35]">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 font-semibold">Data e Hora</span>
                <span className="text-sm font-bold text-[#0a2342] mt-0.5 leading-none">{formattedDate} às {formattedTime}</span>
              </div>
            </div>

            {/* Total Card */}
            <div className="bg-[#0a2342] rounded-2xl p-4 flex flex-col justify-center items-center text-white shadow-md min-w-[120px] relative overflow-hidden">
              <div className="flex gap-1.5 text-white/50 absolute top-2 right-2">
                <User className="w-3.5 h-3.5" />
                <Users className="w-3.5 h-3.5" />
              </div>
              <div className="text-[9px] font-medium text-white/80 mt-1">Total de candidatos</div>
              <div className="text-4xl font-bold mt-1 leading-none">{test.candidates.length}</div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden border border-gray-200 mt-6 bg-white shadow-sm">
          <table className="w-full border-collapse text-[10px]">
            <thead>
              <tr className="bg-[#0a2342] text-white uppercase tracking-wider text-left">
                <th className="px-4 py-4 w-12 text-center font-bold">#</th>
                <th className="px-4 py-4 font-bold">Candidato(a)</th>
                <th className="px-4 py-4 font-bold">Congregação</th>
                <th className="px-4 py-4 font-bold">Setor</th>
                <th className="px-4 py-4 font-bold">Instrumento</th>
                <th className="px-4 py-4 font-bold">Tipo de Teste</th>
              </tr>
            </thead>
            <tbody>
              {test.candidates.map((candidate, idx) => (
                <tr key={candidate.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#f8fafd]'}>
                  <td className="border-b border-gray-100 px-4 py-3.5 text-center font-bold text-[#0a2342]/70">{idx + 1}</td>
                  <td className="border-b border-gray-100 px-4 py-3.5 font-bold text-[#0a2342] uppercase">{candidate.candidateName}</td>
                  <td className="border-b border-gray-100 px-4 py-3.5 font-bold uppercase text-[#0a2342]/70">{candidate.church.name}</td>
                  <td className="border-b border-gray-100 px-4 py-3.5 font-bold uppercase text-[#0a2342]/70">{candidate.sector?.name}</td>
                  <td className="border-b border-gray-100 px-4 py-3.5 font-bold uppercase text-[#0a2342]/70">{candidate.instrument.name}</td>
                  <td className="border-b border-gray-100 px-4 py-3.5 font-bold uppercase text-[#0a2342]/70">{candidate.testType.name}</td>
                </tr>
              ))}
              {test.candidates.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500 font-medium bg-white">Nenhum candidato agendado.</td>
                </tr>
              )}
            </tbody>
          </table>
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
