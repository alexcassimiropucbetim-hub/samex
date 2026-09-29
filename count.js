const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const counts = {
      Admin: await prisma.admin.count(),
      Church: await prisma.church.count(),
      PreEvaluation: await prisma.preEvaluation.count(),
      TestSchedule: await prisma.testSchedule.count(),
      PersonInCharge: await prisma.personInCharge.count(),
      Sector: await prisma.sector.count(),
      Evaluator: await prisma.evaluator.count(),
    };
    console.log(JSON.stringify(counts, null, 2));
  } catch (error) {
    console.error("Error counting:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
