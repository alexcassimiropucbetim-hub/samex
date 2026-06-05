import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const openTest = await prisma.testSchedule.findFirst({
    where: { isClosed: false },
    orderBy: { testDate: 'asc' }
  });

  if (!openTest) {
    console.log("No open test found");
    return;
  }

  const updated = await prisma.preEvaluation.updateMany({
    where: {
      status: "APROVADO",
      testScheduleId: null
    },
    data: {
      testScheduleId: openTest.id,
      finalTestStatus: "PENDENTE"
    }
  });

  console.log(`Allocated ${updated.count} candidates to test ${openTest.id}`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
