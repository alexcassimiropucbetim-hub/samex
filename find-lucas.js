const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const candidates = await prisma.preEvaluation.findMany({
    where: { candidateName: { contains: 'Lucas', mode: 'insensitive' } },
    include: { testType: true }
  });
  
  if (candidates.length === 0) {
    console.log('No candidate found');
    return;
  }
  
  for (const candidate of candidates) {
    console.log('Candidate:', candidate.id, candidate.candidateName, candidate.status, candidate.gender);
    console.log('Test Type:', candidate.testType.name);
    
    // Auto allocate if needed
    if (candidate.status === 'PENDENTE' && candidate.gender === 'M' && candidate.testType.name.toLowerCase().includes('reunião')) {
      const twentyFourHoursFromNow = new Date();
      twentyFourHoursFromNow.setHours(twentyFourHoursFromNow.getHours() + 24);

      const nextValidTest = await prisma.testSchedule.findFirst({
        where: { testDate: { gte: twentyFourHoursFromNow } },
        orderBy: { testDate: 'asc' }
      });

      if (nextValidTest) {
        await prisma.preEvaluation.update({
          where: { id: candidate.id },
          data: { status: 'APROVADO', testScheduleId: nextValidTest.id }
        });
        console.log('Updated candidate to APROVADO and allocated to test:', nextValidTest.id);
      } else {
        console.log('No valid test found to allocate');
      }
    }
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
