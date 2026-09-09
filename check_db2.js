const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const candidates = await prisma.preEvaluation.findMany({
    take: 5,
    include: { church: true, testSchedule: { include: { church: true } } },
    orderBy: { createdAt: 'desc' }
  });
  
  for (const c of candidates) {
    console.log(JSON.stringify({
      id: c.id,
      candidateName: c.candidateName,
      candidateChurch: c.church?.name,
      testScheduleChurch: c.testSchedule?.church?.name
    }));
  }
}

main().finally(() => prisma.$disconnect());
