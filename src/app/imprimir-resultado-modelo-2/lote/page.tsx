import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Modelo2PrintClient } from "@/components/Modelo2PrintClient";

export const dynamic = "force-dynamic";

export default async function ImprimirResultadoModelo2LotePage({
  searchParams
}: {
  searchParams: Promise<{ ids: string }>;
}) {
  const params = await searchParams;
  if (!params.ids) notFound();

  const idArray = params.ids.split(",");

  const candidates = await prisma.preEvaluation.findMany({
    where: { id: { in: idArray } },
    include: {
      church: { include: { ministry: true } },
      testSchedule: {
        include: { church: { include: { ministry: true } } }
      },
      testType: true,
      testEvaluator: {
        include: { roleType: true }
      }
    }
  });

  if (candidates.length === 0) notFound();

  // Order candidates by the order of IDs passed
  const orderedCandidates = idArray
    .map((id) => candidates.find((c) => c.id === id))
    .filter(Boolean) as typeof candidates;

  const candidatesWithEvaluators = orderedCandidates.map((candidate) => {
    const evaluatorName = candidate.testEvaluator?.fullName || "";
    return { ...candidate, resolvedEvaluatorName: evaluatorName };
  });

  return <Modelo2PrintClient candidates={candidatesWithEvaluators} isBatch={true} />;
}
