import { getTestDetails } from "@/actions/testDetails";
import { notFound } from "next/navigation";

export default async function ImprimirListaTestePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const test = await getTestDetails(id);

  if (!test) notFound();

  const formattedDate = new Date(test.testDate).toLocaleDateString("pt-BR");
  const formattedTime = new Date(test.testDate).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });

  // Separate males and females or sort alphabetically. getTestDetails already sorts alphabetically.
  return (
    <div className="print-container font-sans bg-white text-black min-h-screen p-8">
      <div className="max-w-[21cm] mx-auto">
        <div className="text-center mb-8 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold uppercase">Lista de Candidatos para Teste</h1>
          <h2 className="text-lg mt-2">
            Data: {formattedDate} às {formattedTime}
          </h2>
          <h3 className="text-md mt-1">Local: {test.church.name} - Setor: {test.church.sector.name}</h3>
        </div>

        <div className="mb-4">
          <p className="font-semibold text-lg">Total de Candidatos: {test.candidates.length}</p>
        </div>

        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-2 text-left w-8 text-center">#</th>
              <th className="border border-black p-2 text-left">Candidato(a)</th>
              <th className="border border-black p-2 text-left">Congregação</th>
              <th className="border border-black p-2 text-left">Setor</th>
              <th className="border border-black p-2 text-left">Instrumento</th>
              <th className="border border-black p-2 text-left">Tipo de Teste</th>
              <th className="border border-black p-2 text-left w-32">Assinatura</th>
            </tr>
          </thead>
          <tbody>
            {test.candidates.map((candidate, idx) => (
              <tr key={candidate.id}>
                <td className="border border-black p-2 text-center font-bold">{idx + 1}</td>
                <td className="border border-black p-2 uppercase">{candidate.candidateName}</td>
                <td className="border border-black p-2 uppercase">{candidate.church.name}</td>
                <td className="border border-black p-2 uppercase">{candidate.sector.name}</td>
                <td className="border border-black p-2 uppercase">{candidate.instrument.name}</td>
                <td className="border border-black p-2 uppercase">{candidate.testType.name.split(" ")[0]}</td>
                <td className="border border-black p-2"></td>
              </tr>
            ))}
            {test.candidates.length === 0 && (
              <tr>
                <td colSpan={7} className="border border-black p-4 text-center">Nenhum candidato agendado.</td>
              </tr>
            )}
          </tbody>
        </table>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white; }
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
