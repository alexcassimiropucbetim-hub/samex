import React from "react";
import { Calendar, MapPin } from "lucide-react";

export type CandidateForModelo2 = {
  id: string;
  candidateName: string;
  gender: string;
  finalTestStatus?: string | null;
  church: {
    name: string;
    ministry?: { elderName?: string | null } | null;
  };
  testSchedule?: {
    testDate?: Date | string | null;
    elderName?: string | null;
    church?: {
      name: string;
      ministry?: { elderName?: string | null } | null;
    } | null;
  } | null;
  testType: {
    name: string;
  };
  testEvaluator?: {
    fullName: string;
    roleType?: { name: string } | null;
  } | null;
};

type Props = {
  candidate: CandidateForModelo2;
  resolvedEvaluatorName?: string;
  layoutMode?: "landscape-2" | "portrait-2" | "portrait-1" | "landscape-1";
};

export function ResultadoModelo2Card({
  candidate,
  resolvedEvaluatorName,
  layoutMode = "landscape-2"
}: Props) {
  const isFemale = candidate.gender === "F";
  const isTroca = candidate.testType?.name?.toLowerCase().includes("troca");

  let labelExaminador = isFemale ? "Examinadora" : "Examinador";
  if (!isFemale && candidate.testEvaluator?.roleType?.name) {
    const roleName = candidate.testEvaluator.roleType.name.toLowerCase();
    if (roleName.includes("regional")) {
      labelExaminador = "Encarregado Regional";
    } else if (roleName.includes("local")) {
      labelExaminador = "Encarregado Local";
    } else {
      labelExaminador = candidate.testEvaluator.roleType.name;
    }
  } else if (!isFemale) {
    const testName = candidate.testType?.name?.toLowerCase() || "";
    if (testName.includes("reunião") || testName.includes("jovens") || testName.includes("menores")) {
      labelExaminador = "Encarregado Local";
    } else {
      labelExaminador = "Encarregado Regional";
    }
  }

  let formCode = isFemale ? "FORMULÁRIO M05" : "FORMULÁRIO M04";
  if (isTroca) {
    formCode = "FORMULÁRIO M07";
    if (!isFemale && !candidate.testEvaluator) {
      labelExaminador = "Encarregado Regional";
    }
  }

  const testDate = candidate.testSchedule?.testDate
    ? new Date(candidate.testSchedule.testDate).toLocaleDateString("pt-BR")
    : "";
  const testLocality = candidate.church?.name || "";

  const elderName =
    candidate.testSchedule?.elderName ||
    candidate.testSchedule?.church?.ministry?.elderName ||
    candidate.church?.ministry?.elderName ||
    "";
  const evaluatorName = resolvedEvaluatorName || candidate.testEvaluator?.fullName || "";

  const isApproved = candidate.finalTestStatus === "APROVADO";
  const isRejected = candidate.finalTestStatus === "REPROVADO";

  const isLarge = layoutMode === "portrait-1" || layoutMode === "landscape-1";

  return (
    <div className="w-full h-full flex flex-col font-sans select-none justify-between" style={{ pageBreakInside: "avoid" }}>
      <div className="w-full flex-1 flex flex-col">
        {/* Header Bar */}
        <div className={`bg-[#0d2847] text-white text-center font-black ${isLarge ? "py-2.5 text-xl tracking-[0.25em]" : "py-1.5 text-base sm:text-lg tracking-[0.2em]"} uppercase rounded-t-lg shadow-sm shrink-0`}>
          RESULTADO
        </div>

        {/* Main Box */}
        <div className="border-[1.5px] border-[#2b4360] border-t-0 rounded-b-lg bg-white overflow-hidden shadow-sm flex-1 flex flex-col justify-between">
          <div>
            {/* Row 1: Candidato(a) + Tipo de Teste */}
            <div className="grid grid-cols-12 border-b-[1.5px] border-[#2b4360]">
              {/* Candidato(a) */}
              <div className="col-span-6 border-r-[1.5px] border-[#9fb3c8] flex flex-col">
                <div className={`bg-[#eef4f9] px-3 ${isLarge ? "py-1" : "py-0.5"} border-b border-[#cbd5e1]`}>
                  <span className={`${isLarge ? "text-xs" : "text-[10px]"} font-bold text-[#0d2847] uppercase tracking-wider`}>
                    CANDIDATO(A)
                  </span>
                </div>
                <div className={`px-3 ${isLarge ? "py-2.5 min-h-[46px]" : "py-1.5 min-h-[38px]"} bg-white flex items-center`}>
                  <span className={`font-extrabold ${isLarge ? "text-base" : "text-[11px] sm:text-[12px] md:text-[13px]"} text-slate-950 uppercase leading-snug break-words`}>
                    {candidate.candidateName}
                  </span>
                </div>
              </div>

              {/* Tipo de Teste */}
              <div className="col-span-6 flex flex-col">
                <div className={`bg-[#eef4f9] px-3 ${isLarge ? "py-1" : "py-0.5"} border-b border-[#cbd5e1]`}>
                  <span className={`${isLarge ? "text-xs" : "text-[10px]"} font-bold text-[#0d2847] uppercase tracking-wider`}>
                    TIPO DE TESTE
                  </span>
                </div>
                <div className={`px-3 ${isLarge ? "py-2.5 min-h-[46px]" : "py-1.5 min-h-[38px]"} bg-white flex items-center`}>
                  <span className={`font-extrabold ${isLarge ? "text-base" : "text-[11px] sm:text-[12px] md:text-[13px]"} text-slate-950 uppercase leading-snug break-words`}>
                    {candidate.testType.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Row 2: Data + Localidade / Congregação + Apto */}
            <div className="grid grid-cols-12 border-b-[1.5px] border-[#2b4360]">
              {/* Data */}
              <div className="col-span-3 border-r-[1.5px] border-[#9fb3c8] flex flex-col">
                <div className={`bg-[#eef4f9] px-3 ${isLarge ? "py-1" : "py-0.5"} border-b border-[#cbd5e1]`}>
                  <span className={`${isLarge ? "text-xs" : "text-[10px]"} font-bold text-[#0d2847] uppercase tracking-wider`}>
                    DATA
                  </span>
                </div>
                <div className={`px-3 ${isLarge ? "py-2.5 min-h-[46px]" : "py-1.5 min-h-[38px]"} bg-white flex items-center gap-1.5`}>
                  <Calendar className={`${isLarge ? "w-5 h-5" : "w-4 h-4"} text-[#0d2847] shrink-0 stroke-[2.2]`} />
                  <span className={`font-extrabold ${isLarge ? "text-base" : "text-[11px] sm:text-[12px] md:text-[13px]"} text-slate-950`}>
                    {testDate}
                  </span>
                </div>
              </div>

              {/* Localidade / Congregação */}
              <div className="col-span-6 border-r-[1.5px] border-[#9fb3c8] flex flex-col">
                <div className={`bg-[#eef4f9] px-3 ${isLarge ? "py-1" : "py-0.5"} border-b border-[#cbd5e1]`}>
                  <span className={`${isLarge ? "text-xs" : "text-[10px]"} font-bold text-[#0d2847] uppercase tracking-wider truncate`}>
                    LOCALIDADE / CONGREGAÇÃO
                  </span>
                </div>
                <div className={`px-3 ${isLarge ? "py-2.5 min-h-[46px]" : "py-1.5 min-h-[38px]"} bg-white flex items-center gap-1.5`}>
                  <MapPin className={`${isLarge ? "w-5 h-5" : "w-4 h-4"} fill-[#0d2847] text-[#0d2847] shrink-0`} />
                  <span className={`font-extrabold ${isLarge ? "text-base" : "text-[11px] sm:text-[12px] md:text-[13px]"} text-slate-950 uppercase leading-snug break-words`}>
                    {testLocality}
                  </span>
                </div>
              </div>

              {/* Apto */}
              <div className="col-span-3 flex flex-col">
                <div className={`bg-[#eef4f9] px-2 ${isLarge ? "py-1" : "py-0.5"} border-b border-[#cbd5e1] text-center`}>
                  <span className={`${isLarge ? "text-xs" : "text-[10px]"} font-bold text-[#0d2847] uppercase tracking-wider`}>
                    APTO
                  </span>
                </div>
                <div className={`px-2 ${isLarge ? "py-2.5 min-h-[46px]" : "py-1.5 min-h-[38px]"} bg-white flex items-center justify-center gap-3`}>
                  <div className="flex items-center gap-1.5">
                    <div className={`${isLarge ? "w-5 h-5 text-xs" : "w-4 h-4 text-[10px]"} border-[1.5px] border-[#0d2847] flex items-center justify-center font-black text-[#0d2847]`}>
                      {isApproved ? "X" : ""}
                    </div>
                    <span className={`${isLarge ? "text-sm" : "text-xs"} font-semibold text-slate-900`}>Sim</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`${isLarge ? "w-5 h-5 text-xs" : "w-4 h-4 text-[10px]"} border-[1.5px] border-[#0d2847] flex items-center justify-center font-black text-[#0d2847]`}>
                      {isRejected ? "X" : ""}
                    </div>
                    <span className={`${isLarge ? "text-sm" : "text-xs"} font-semibold text-slate-900`}>Não</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures Area - Flex 1 fills the remaining height nicely */}
          <div className={`px-6 ${isLarge ? "py-8" : "py-4"} bg-white flex-1 flex flex-col justify-around min-h-[120px]`}>
            {/* Row 1: Ancião */}
            <div className="grid grid-cols-2 gap-8 items-end text-center">
              <div>
                <div className={`${isLarge ? "text-sm h-6" : "text-xs h-4"} font-extrabold text-slate-950 uppercase truncate mb-0.5 flex items-center justify-center`}>
                  {elderName}
                </div>
                <div className="border-t-[1.5px] border-[#0d2847] pt-0.5 text-[10px] sm:text-[11px] font-medium text-slate-700">
                  Ancião
                </div>
              </div>
              <div>
                <div className={`${isLarge ? "h-6" : "h-4"} mb-0.5`}></div>
                <div className="border-t-[1.5px] border-[#0d2847] pt-0.5 text-[10px] sm:text-[11px] font-medium text-slate-700">
                  Assinatura
                </div>
              </div>
            </div>

            {/* Row 2: Encarregado / Examinador */}
            <div className="grid grid-cols-2 gap-8 items-end text-center mt-3">
              <div>
                <div className={`${isLarge ? "text-sm h-6" : "text-xs h-4"} font-extrabold text-slate-950 uppercase truncate mb-0.5 flex items-center justify-center`}>
                  {evaluatorName}
                </div>
                <div className="border-t-[1.5px] border-[#0d2847] pt-0.5 text-[10px] sm:text-[11px] font-medium text-slate-700">
                  {labelExaminador}
                </div>
              </div>
              <div>
                <div className={`${isLarge ? "h-6" : "h-4"} mb-0.5`}></div>
                <div className="border-t-[1.5px] border-[#0d2847] pt-0.5 text-[10px] sm:text-[11px] font-medium text-slate-700">
                  Assinatura
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 pt-1">
        <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-semibold text-[#0d2847] tracking-wider uppercase px-1">
          <span>COMISSÃO MUSICAL</span>
          <span>{formCode}</span>
        </div>

        {/* Dashed Cut Line */}
        <div className="border-b-[1.5px] border-dashed border-slate-400 mt-1.5 w-full" />
      </div>
    </div>
  );
}
