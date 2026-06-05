import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function ImprimirResultadoLotePage({ searchParams }: { searchParams: Promise<{ ids: string }> }) {
  const params = await searchParams;
  if (!params.ids) notFound();

  const idArray = params.ids.split(",");

  const candidates = await prisma.preEvaluation.findMany({
    where: { id: { in: idArray } },
    include: {
      church: true,
      testSchedule: {
        include: { church: true }
      },
      testType: true,
      testEvaluator: {
        include: { roleType: true }
      }
    }
  });

  if (candidates.length === 0) notFound();

  // Order candidates by the order of IDs passed
  const orderedCandidates = idArray.map(id => candidates.find(c => c.id === id)).filter(Boolean) as typeof candidates;

  return (
    <div className="font-sans bg-white text-black min-h-screen">
      {orderedCandidates.map((candidate, index) => {
        const isFemale = candidate.gender === "F";
        const isTroca = candidate.testType?.name.toLowerCase().includes("troca");
        
        let labelExaminador = "Examinador";
        if (isFemale) {
          labelExaminador = "Examinadora";
        } else {
          if (candidate.testEvaluator?.roleType?.name) {
            const roleName = candidate.testEvaluator.roleType.name.toLowerCase();
            if (roleName.includes("regional")) {
              labelExaminador = "Encarregado Regional";
            } else if (roleName.includes("local")) {
              labelExaminador = "Encarregado Local";
            } else {
              labelExaminador = candidate.testEvaluator.roleType.name;
            }
          } else {
            labelExaminador = "Encarregado Regional";
          }
        }

        let formCode = isFemale ? "FORMULÁRIO M05" : "FORMULÁRIO M04";
        let headerTitle = "Resultado";

        if (isTroca) {
          formCode = "FORMULÁRIO M07";
          if (!isFemale) {
            labelExaminador = "Encarregado regional"; 
          }
        }

        const aptaLabel = isFemale ? "Apta" : "Apto";
        const testDate = candidate.testSchedule?.testDate ? new Date(candidate.testSchedule.testDate).toLocaleDateString("pt-BR") : "";
        const testLocality = candidate.testSchedule?.church?.name || candidate.church.name;
        
        const elderName = candidate.testSchedule?.elderName || "";
        const evaluatorName = candidate.testEvaluator?.fullName || "";

        const isApproved = candidate.finalTestStatus === "APROVADO";
        const isRejected = candidate.finalTestStatus === "REPROVADO";

        return (
          <div key={candidate.id} className="py-3 border-b-2 border-dashed border-gray-300 last:border-0" style={{ pageBreakInside: 'avoid' }}>
            <div className="max-w-[21cm] mx-auto border-[1.5px] border-black">
              {/* Header */}
              <div className="bg-gray-200 border-b-[1.5px] border-black text-center font-bold py-0.5 text-base">
                {headerTitle}
              </div>

              {/* Row 1 */}
              <div className="grid grid-cols-12 border-b-[1.5px] border-black h-12">
                <div className="col-span-3 border-r-[1.5px] border-black px-2 py-0.5 text-[10px] flex flex-col justify-between">
                  <span>Data</span>
                  <span className="text-center text-xs font-semibold">{testDate}</span>
                </div>
                <div className="col-span-7 border-r-[1.5px] border-black px-2 py-0.5 text-[10px] flex flex-col justify-between">
                  <span>Localidade</span>
                  <span className="text-center text-xs font-semibold">{testLocality}</span>
                </div>
                <div className="col-span-2 px-1 py-0.5 flex flex-col items-center justify-center">
                  <span className="font-bold text-xs">{aptaLabel}</span>
                  <div className="flex gap-3 mt-0.5 text-[10px] font-medium">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 border-[1.5px] border-black flex items-center justify-center font-bold text-[8px]">
                        {isApproved ? "X" : ""}
                      </div> Sim
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 border-[1.5px] border-black flex items-center justify-center font-bold text-[8px]">
                        {isRejected ? "X" : ""}
                      </div> Não
                    </div>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              {isTroca ? (
                <div className="h-20 grid grid-cols-2 px-6 pt-5 pb-3 gap-x-12 items-end text-center">
                  <div>
                    {evaluatorName && <div className="text-xs font-semibold uppercase truncate mb-0.5">{evaluatorName}</div>}
                    <div className="border-t-[1px] border-black pt-0.5 text-[10px] font-semibold">{labelExaminador}</div>
                  </div>
                  <div>
                    <div className="border-t-[1px] border-black pt-0.5 text-[10px] font-semibold">Assinatura</div>
                  </div>
                </div>
              ) : (
                <div className="h-28 grid grid-cols-2 px-6 pt-3 pb-3 gap-x-12 gap-y-4 items-end text-center">
                  <div>
                    {elderName && <div className="text-xs font-semibold uppercase truncate mb-0.5">{elderName}</div>}
                    <div className="border-t-[1px] border-black pt-0.5 text-[10px] font-semibold">Ancião</div>
                  </div>
                  <div>
                    <div className="border-t-[1px] border-black pt-0.5 text-[10px] font-semibold">Assinatura</div>
                  </div>
                  <div>
                    {evaluatorName && <div className="text-xs font-semibold uppercase truncate mb-0.5">{evaluatorName}</div>}
                    <div className="border-t-[1px] border-black pt-0.5 text-[10px] font-semibold">{labelExaminador}</div>
                  </div>
                  <div>
                    <div className="border-t-[1px] border-black pt-0.5 text-[10px] font-semibold">Assinatura</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="max-w-[21cm] mx-auto flex justify-between text-[8px] mt-0.5 text-gray-800 font-semibold tracking-wider">
              <span>COMISSÃO MUSICAL</span>
              <span>{formCode}</span>
            </div>
          </div>
        );
      })}

      <style dangerouslySetInnerHTML={{__html: `
        body { background: white !important; }
        @media print {
          body { background: white !important; }
          @page { margin: 1cm; size: A4 portrait; }
        }
      `}} />
      
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
