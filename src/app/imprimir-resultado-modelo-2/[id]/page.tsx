import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Modelo2PrintClient } from "@/components/Modelo2PrintClient";

export const dynamic = "force-dynamic";

export default async function ImprimirResultadoModelo2Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const candidate = await prisma.preEvaluation.findUnique({
    where: { id },
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

  if (!candidate) notFound();

  return <Modelo2PrintClient candidates={[candidate]} isBatch={false} />;
}
