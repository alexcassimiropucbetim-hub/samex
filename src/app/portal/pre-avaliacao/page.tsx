import PreEvaluationForm from "@/components/PreEvaluationForm";
import { getSectors } from "@/actions/sector";
import { getChurches } from "@/actions/church";
import { getInstruments } from "@/actions/instrument";
import { getPeopleInCharge } from "@/actions/personInCharge";
import { getTestTypes } from "@/actions/testType";
import { getPreEvaluations, deletePreEvaluation } from "@/actions/preEvaluation";
import { getTestSchedules } from "@/actions/testSchedule";
import { FileSignature, MapPin, Church, User, Music, Calendar, Pencil, Trash2, ClipboardCheck, BookOpen, Printer } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import PreEvaluationTableClient from "./PreEvaluationTableClient";

export default async function PreEvaluationPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const session = await getSession();
  const [sectors, churches, instruments, personInCharges, testTypes, allPreEvaluations, testSchedules] = await Promise.all([
    getSectors(),
    getChurches(),
    getInstruments(),
    getPeopleInCharge(),
    getTestTypes(),
    getPreEvaluations(),
    getTestSchedules(),
  ]);

  const isRegional = Boolean(session?.roleName?.toLowerCase().includes("regional"));
  const isExaminadora = Boolean(session?.roleName?.toLowerCase().includes("examinadora"));
  const isAdmin = session?.type === "admin";
  const isLocal = !isRegional && !isExaminadora && !isAdmin;
  
  let preEvaluations = allPreEvaluations;

  if (isExaminadora) {
    // Examinadora vê tudo, mas apenas do sexo feminino (F)
    preEvaluations = allPreEvaluations.filter(p => p.gender === 'F');
  } else if (isRegional) {
    // Regional vê tudo, de todos os sexos
    preEvaluations = allPreEvaluations;
  } else if (!isAdmin) {
    // Encarregado Local vê apenas a sua igreja (ambos os sexos)
    preEvaluations = allPreEvaluations.filter(p => p.churchId === session?.churchId);
  }

  const resolvedParams = await searchParams;
  const editingId = resolvedParams.edit;
  const rawEditingReq = editingId ? preEvaluations.find(p => p.id === editingId) : null;
  
  const editingReq = rawEditingReq ? {
    id: rawEditingReq.id,
    sectorId: rawEditingReq.sectorId,
    churchId: rawEditingReq.churchId,
    candidateName: rawEditingReq.candidateName,
    gender: rawEditingReq.gender,
    instructorName: rawEditingReq.instructorName || "",
    instructorChurchId: rawEditingReq.instructorChurchId || "",
    instructorChurchName: rawEditingReq.instructorChurchName || "",
    instrumentId: rawEditingReq.instrumentId,
    personInChargeId: rawEditingReq.personInChargeId,
    testTypeId: rawEditingReq.testTypeId,
    msaStatus: rawEditingReq.msaStatus,
    msaJustification: rawEditingReq.msaJustification || "",
    currentInstrumentId: rawEditingReq.currentInstrumentId || "",
    currentTonality: rawEditingReq.currentTonality || "",
    desiredTonality: rawEditingReq.desiredTonality || "",
    officializationDate: rawEditingReq.officializationDate || "",
    candidateLevel: rawEditingReq.candidateLevel || "",
    orchestraNeed: rawEditingReq.orchestraNeed,
    illness: rawEditingReq.illness,
    approvedInSectorMeeting: rawEditingReq.approvedInSectorMeeting,
    meetingDate: rawEditingReq.meetingDate || "",
    meetingLocality: rawEditingReq.meetingLocality || "",
    meetingElderName: rawEditingReq.meetingElderName || "",
  } : undefined;

  const defaultData = !rawEditingReq && session?.churchId ? (() => {
    const userChurch = churches.find(c => c.id === session.churchId);
    return userChurch ? {
      sectorId: userChurch.sectorId,
      churchId: userChurch.id,
      personInChargeId: session.type === "encarregado" ? session.id : "",
    } : null;
  })() : null;

  const initialDataToPass = editingReq || (defaultData as any);

  const evaluators = personInCharges.filter(p => {
    const role = p.roleType?.name?.toLowerCase() || '';
    return role.includes('regional') || role.includes('examinadora');
  });

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2 sm:gap-3">
          <FileSignature className="text-orange-500 w-6 h-6 sm:w-8 sm:h-8" /> Pedido de Pré-Avaliação
        </h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2">Preencha o formulário em etapas para registrar um novo pedido.</p>
      </div>

      <PreEvaluationForm 
        sectors={sectors}
        churches={churches}
        instruments={instruments}
        personInCharges={personInCharges}
        testTypes={testTypes}
        initialData={initialDataToPass}
      />

      <div className="pt-8 border-t border-slate-200" id="lista">
        <h2 className="text-2xl font-semibold text-slate-900 mb-6">Inscrições Cadastradas ({preEvaluations.length})</h2>
        
        {preEvaluations.length === 0 ? (
          <div className="glass-card text-center text-slate-500 py-10">
            Nenhuma inscrição cadastrada ainda.
          </div>
        ) : (
          <PreEvaluationTableClient 
            preEvaluations={preEvaluations} 
            testSchedules={testSchedules} 
            isLocal={isLocal} 
            isRegional={isRegional}
            isExaminadora={isExaminadora}
            isAdmin={isAdmin}
            evaluators={evaluators}
          />
        )}
      </div>
    </div>
  );
}
