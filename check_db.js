const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const c = await prisma.preEvaluation.findFirst({
    where: { candidateName: { contains: 'EDUARDO', mode: 'insensitive' } },
    include: { church: true, testSchedule: { include: { church: true } } }
  });
  
  if (c) {
    console.log(JSON.stringify({
      candidateName: c.candidateName,
      candidateChurch: c.church.name,
      testScheduleChurch: c.testSchedule?.church?.name
    }));
  } else {
    console.log("Not found");
  }
}

main().finally(() => prisma.$disconnect());
